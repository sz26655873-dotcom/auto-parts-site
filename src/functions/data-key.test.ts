/**
 * Tests for the /api/data/[key] endpoint (GET and PUT).
 *
 * Verifies:
 * - GET with valid key returns data (with auto-seeding if empty)
 * - GET with invalid key returns 400
 * - GET with metadata key (data_version, last_modified) returns read-only data
 * - PUT without auth returns 401
 * - PUT with auth writes data and returns lastModified
 * - PUT with invalid key returns 400
 * - PUT with metadata key returns 400 (read-only)
 * - PUT with empty body returns 400
 *
 * We mock KVNamespace, auth, and request context to test in isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequestGet, onRequestPut } from '../../functions-src/api/data/[key]';
import { isAuthenticated, unauthorizedResponse } from '../../functions-src/api/_auth';
import { kvGet, kvPut, isValidDataKey } from '../../functions-src/lib/kv';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock the auth module
vi.mock('../../functions-src/api/_auth', () => ({
  isAuthenticated: vi.fn(),
  unauthorizedResponse: vi.fn(() =>
    new Response(JSON.stringify({ error: '未授权访问' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }),
  ),
}));

// Mock the kv module
vi.mock('../../functions-src/lib/kv', () => ({
  isValidDataKey: vi.fn((key: string) =>
    ['products', 'contact_info', 'company_info', 'data_version', 'last_modified'].includes(key),
  ),
  kvGet: vi.fn(async (kv: any, key: string, seedFn?: () => any) => ({
    data: seedFn ? seedFn() : { test: 'data' },
    lastModified: '2024-06-01T00:00:00.000Z',
    wasSeeded: seedFn ? true : false,
  })),
  kvPut: vi.fn(async () => ({ lastModified: '2024-06-01T12:00:00.000Z' })),
}));

// Mock seedData module
vi.mock('../../functions-src/lib/seedData', () => ({
  getAllSeeds: vi.fn(() => ({
    products: () => [{ id: 1, model: 'CHG-2024' }],
    contact_info: () => ({ whatsapp: '1234567890' }),
    company_info: () => ({ name: { en: 'Test' } }),
  })),
}));

/** In-memory KVNamespace mock. */
function createKvMock(): KVNamespace {
  return {
    get: vi.fn(async () => null),
    put: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
    list: vi.fn(async () => ({ keys: [], list_complete: true })),
    getWithMetadata: vi.fn(async () => ({ value: null, metadata: null })),
  } as unknown as KVNamespace;
}

/** Create a mock context for the handler. */
function createContext(method: string, url: string, body?: any, authHeader?: string): any {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authHeader) headers['Authorization'] = authHeader;

  const requestInit: RequestInit = { method, headers };
  if (body) requestInit.body = JSON.stringify(body);

  const request = new Request(url, requestInit);
  return {
    request,
    env: {
      PRODUCTS_DATA: createKvMock(),
      ADMIN_PASSWORD: 'sz135136',
    },
  };
}

describe('/api/data/[key] endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET requests', () => {
    it('should return 400 for invalid key', async () => {
      const ctx = createContext('GET', 'https://www.altai.parts/api/data/invalid_key');
      const response = await onRequestGet(ctx);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Invalid data key');
    });

    it('should return data for valid key products', async () => {
      const ctx = createContext('GET', 'https://www.altai.parts/api/data/products');
      const response = await onRequestGet(ctx);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.lastModified).toBeDefined();
    });

    it('should return data for valid key contact_info', async () => {
      const ctx = createContext('GET', 'https://www.altai.parts/api/data/contact_info');
      const response = await onRequestGet(ctx);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    it('should return data for valid key company_info', async () => {
      const ctx = createContext('GET', 'https://www.altai.parts/api/data/company_info');
      const response = await onRequestGet(ctx);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    it('should handle metadata key data_version (read-only)', async () => {
      const ctx = createContext('GET', 'https://www.altai.parts/api/data/data_version');
      const kv = ctx.env.PRODUCTS_DATA;
      // Simulate KV has data_version stored
      kv.get = vi.fn(async (key: string) => {
        if (key === 'data_version') return '1';
        return null;
      });

      const response = await onRequestGet(ctx);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    // KNOWN SOURCE BUG: The metadata key handler does JSON.parse(raw) on last_modified,
    // but kvPut stores last_modified as a plain ISO string (not JSON.stringify'd).
    // JSON.parse('2024-06-01T00:00:00.000Z') throws SyntaxError because it's not valid JSON.
    // This test documents the current broken behavior (500) — Engineer should fix the source.
    it('should handle metadata key last_modified (read-only) — CURRENTLY BROKEN: returns 500', async () => {
      const ctx = createContext('GET', 'https://www.altai.parts/api/data/last_modified');
      const kv = ctx.env.PRODUCTS_DATA;
      // KV stores last_modified as a plain ISO string (not JSON.stringify'd)
      kv.get = vi.fn(async (key: string) => {
        if (key === 'last_modified') return '2024-06-01T00:00:00.000Z';
        return null;
      });

      const response = await onRequestGet(ctx);
      // BUG: JSON.parse on a non-JSON string causes error → returns 500
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });

    // When last_modified is stored as JSON.stringify'd string, it works correctly.
    // This is the expected behavior AFTER Engineer fixes kvPut to use JSON.stringify for last_modified.
    it('should handle metadata key last_modified when stored as JSON string (expected fix)', async () => {
      const ctx = createContext('GET', 'https://www.altai.parts/api/data/last_modified');
      const kv = ctx.env.PRODUCTS_DATA;
      // If last_modified were stored as JSON.stringify('2024-06-01T00:00:00.000Z') → '"2024-06-01T00:00:00.000Z"'
      kv.get = vi.fn(async (key: string) => {
        if (key === 'last_modified') return JSON.stringify('2024-06-01T00:00:00.000Z');
        return null;
      });

      const response = await onRequestGet(ctx);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toBe('2024-06-01T00:00:00.000Z');
    });

    it('should return 400 for empty key (path extraction)', async () => {
      const ctx = createContext('GET', 'https://www.altai.parts/api/data/');
      const response = await onRequestGet(ctx);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
    });
  });

  describe('PUT requests', () => {
    it('should return 401 without auth', async () => {
      vi.mocked(isAuthenticated).mockReturnValue(false);
      const ctx = createContext('PUT', 'https://www.altai.parts/api/data/products');
      const response = await onRequestPut(ctx);
      expect(response.status).toBe(401);
    });

    it('should write data with valid auth and return lastModified', async () => {
      vi.mocked(isAuthenticated).mockReturnValue(true);
      const futureExpiry = Date.now() + 3600000;
      const token = btoa(`sz135136:${futureExpiry}`);
      const ctx = createContext('PUT', 'https://www.altai.parts/api/data/products', [{ id: 1, model: 'NEW' }], `Bearer ${token}`);
      vi.mocked(isAuthenticated).mockReturnValue(true);

      const response = await onRequestPut(ctx);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.lastModified).toBeDefined();
    });

    it('should return 400 for PUT to metadata key (data_version)', async () => {
      vi.mocked(isAuthenticated).mockReturnValue(true);
      const ctx = createContext('PUT', 'https://www.altai.parts/api/data/data_version', { value: 1 });
      const response = await onRequestPut(ctx);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('read-only metadata');
    });

    it('should return 400 for PUT to metadata key (last_modified)', async () => {
      vi.mocked(isAuthenticated).mockReturnValue(true);
      const ctx = createContext('PUT', 'https://www.altai.parts/api/data/last_modified', { value: '2024' });
      const response = await onRequestPut(ctx);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('read-only metadata');
    });

    it('should return 400 for invalid key on PUT', async () => {
      vi.mocked(isAuthenticated).mockReturnValue(true);
      const ctx = createContext('PUT', 'https://www.altai.parts/api/data/invalid_key', { data: 'test' });
      const response = await onRequestPut(ctx);
      expect(response.status).toBe(400);
    });
  });
});
