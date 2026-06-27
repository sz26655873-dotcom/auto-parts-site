/**
 * Tests for the KV helper module (functions-src/lib/kv.ts).
 *
 * Since kv.ts depends on KVNamespace (Cloudflare Workers runtime),
 * we mock KVNamespace with an in-memory store and verify:
 * - isValidDataKey validates allowed keys
 * - kvGet reads data and auto-seeds when empty
 * - kvPut writes data and updates last_modified
 * - kvPutBulk writes multiple keys and updates last_modified once
 * - Error when kvGet finds empty key with no seedFn
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// We need to import kv.ts which uses KVNamespace type.
// Since it's in functions-src (not compiled by tsc), we import it directly.
// vitest can handle .ts imports from any directory.

import {
  isValidDataKey,
  VALID_DATA_KEYS,
  kvGet,
  kvPut,
  kvPutBulk,
  type KvResult,
} from '../../functions-src/lib/kv';

/**
 * In-memory KVNamespace mock.
 * Simulates Cloudflare KV's get/put behavior for testing.
 */
function createKvMock(): KVNamespace {
  const store: Record<string, string> = {};

  return {
    get: vi.fn(async (key: string) => store[key] ?? null),
    put: vi.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    delete: vi.fn(async (key: string) => {
      delete store[key];
    }),
    list: vi.fn(async () => ({ keys: [], list_complete: true })),
    getWithMetadata: vi.fn(async () => ({ value: null, metadata: null })),
  } as unknown as KVNamespace;
}

describe('kv.ts — KV helper module', () => {
  describe('isValidDataKey', () => {
    it('should accept all valid data keys', () => {
      for (const key of VALID_DATA_KEYS) {
        expect(isValidDataKey(key)).toBe(true);
      }
    });

    it('should reject invalid keys', () => {
      expect(isValidDataKey('invalid_key')).toBe(false);
      expect(isValidDataKey('products_extra')).toBe(false);
      expect(isValidDataKey('')).toBe(false);
      expect(isValidDataKey('random')).toBe(false);
    });

    it('should include products, contact_info, company_info in valid keys', () => {
      expect(isValidDataKey('products')).toBe(true);
      expect(isValidDataKey('contact_info')).toBe(true);
      expect(isValidDataKey('company_info')).toBe(true);
    });

    it('should include metadata keys data_version and last_modified', () => {
      expect(isValidDataKey('data_version')).toBe(true);
      expect(isValidDataKey('last_modified')).toBe(true);
    });
  });

  describe('kvGet', () => {
    it('should read existing data from KV', async () => {
      const kv = createKvMock();
      const testData = [{ id: 1, model: 'CHG-2024' }];
      // Simulate KV already has data
      await kv.put('products', JSON.stringify(testData));
      await kv.put('last_modified', '2024-06-01T00:00:00.000Z');

      const result = await kvGet(kv, 'products');
      expect(result.data).toEqual(testData);
      expect(result.lastModified).toBe('2024-06-01T00:00:00.000Z');
      expect(result.wasSeeded).toBe(false);
    });

    it('should auto-seed when KV key is empty and seedFn is provided', async () => {
      const kv = createKvMock();
      const seedProducts = [{ id: 1, model: 'SEED-001' }];

      const result = await kvGet(kv, 'products', () => seedProducts);
      expect(result.data).toEqual(seedProducts);
      expect(result.wasSeeded).toBe(true);
      expect(result.lastModified).toBeTruthy();

      // Verify the seed data was written to KV
      const stored = await kv.get('products');
      expect(stored).toBe(JSON.stringify(seedProducts));
    });

    it('should throw error when KV key is empty and no seedFn', async () => {
      const kv = createKvMock();
      // products key is empty, no seedFn provided
      await expect(kvGet(kv, 'products')).rejects.toThrow(
        'KV key "products" is empty and no seed function was provided',
      );
    });

    it('should fall back to nowISO when last_modified is absent', async () => {
      const kv = createKvMock();
      const testData = { whatsapp: '123456' };
      // Put data but NO last_modified key
      await kv.put('contact_info', JSON.stringify(testData));
      // Do NOT put 'last_modified'

      const result = await kvGet(kv, 'contact_info');
      expect(result.data).toEqual(testData);
      // lastModified should be a valid ISO string (auto-generated)
      expect(result.lastModified).toBeTruthy();
      expect(new Date(result.lastModified).toISOString()).toBe(result.lastModified);
    });
  });

  describe('kvPut', () => {
    it('should write data to KV and update last_modified', async () => {
      const kv = createKvMock();
      const testData = [{ id: 2, model: 'PRS-1850' }];

      const result = await kvPut(kv, 'products', testData);
      expect(result.lastModified).toBeTruthy();
      expect(new Date(result.lastModified).toISOString()).toBe(result.lastModified);

      // Verify data was written
      const stored = await kv.get('products');
      expect(stored).toBe(JSON.stringify(testData));

      // Verify last_modified was updated
      const lm = await kv.get('last_modified');
      expect(lm).toBe(result.lastModified);
    });

    it('should overwrite existing data on second put', async () => {
      const kv = createKvMock();
      await kvPut(kv, 'products', [{ id: 1 }]);
      await kvPut(kv, 'products', [{ id: 2, model: 'NEW' }]);

      const stored = await kv.get('products');
      expect(JSON.parse(stored!)).toEqual([{ id: 2, model: 'NEW' }]);
    });
  });

  describe('kvPutBulk', () => {
    it('should write multiple keys sequentially and set last_modified once', async () => {
      const kv = createKvMock();
      const dataMap = {
        products: [{ id: 1, model: 'CHG-2024' }],
        contact_info: { whatsapp: '1234567890' },
        company_info: { name: { en: 'Test' } },
      };

      const result = await kvPutBulk(kv, dataMap);
      expect(result.lastModified).toBeTruthy();

      // Verify each key was written
      const products = await kv.get('products');
      expect(products).toBe(JSON.stringify(dataMap.products));

      const contact = await kv.get('contact_info');
      expect(contact).toBe(JSON.stringify(dataMap.contact_info));

      const company = await kv.get('company_info');
      expect(company).toBe(JSON.stringify(dataMap.company_info));

      // Verify last_modified was set once
      const lm = await kv.get('last_modified');
      expect(lm).toBe(result.lastModified);
    });

    it('should handle empty dataMap', async () => {
      const kv = createKvMock();
      const result = await kvPutBulk(kv, {});
      expect(result.lastModified).toBeTruthy();
      // No data keys written, only last_modified
    });
  });
});
