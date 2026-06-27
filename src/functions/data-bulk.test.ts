/**
 * Tests for the /api/data/bulk endpoint (POST).
 *
 * Verifies:
 * - POST without auth returns 401
 * - POST with valid auth and data writes to KV via bulk
 * - POST with empty body returns 400
 * - POST with only products field works
 * - POST maps contactInfo → contact_info and companyInfo → company_info
 * - POST includes version in dataMap if provided
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequestPost } from '../../functions-src/api/data/bulk';
import { isAuthenticated } from '../../functions-src/api/_auth';
import { kvPutBulk } from '../../functions-src/lib/kv';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../functions-src/api/_auth', () => ({
  isAuthenticated: vi.fn(),
  unauthorizedResponse: vi.fn(() =>
    new Response(JSON.stringify({ error: '未授权访问' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }),
  ),
}));

vi.mock('../../functions-src/lib/kv', () => ({
  kvPutBulk: vi.fn(async () => ({ lastModified: '2024-06-01T12:00:00.000Z' })),
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
function createContext(body: any, authHeader?: string): any {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authHeader) headers['Authorization'] = authHeader;

  const request = new Request('https://www.altai.parts/api/data/bulk', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return {
    request,
    env: {
      PRODUCTS_DATA: createKvMock(),
      ADMIN_PASSWORD: 'sz135136',
    },
  };
}

describe('/api/data/bulk endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 without auth', async () => {
    vi.mocked(isAuthenticated).mockReturnValue(false);
    const ctx = createContext({ products: [{ id: 1 }] });
    const response = await onRequestPost(ctx);
    expect(response.status).toBe(401);
  });

  it('should write bulk data with auth and return success', async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    const ctx = createContext({
      products: [{ id: 1, model: 'CHG-2024' }],
      contactInfo: { whatsapp: '1234567890' },
      companyInfo: { name: { en: 'Test' } },
    }, 'Bearer test-token');
    vi.mocked(isAuthenticated).mockReturnValue(true);

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.lastModified).toBeDefined();

    // Verify kvPutBulk was called with correct key mapping
    expect(kvPutBulk).toHaveBeenCalled();
    const dataMap = vi.mocked(kvPutBulk).mock.calls[0][1] as Record<string, any>;
    expect(dataMap.products).toBeDefined();
    expect(dataMap.contact_info).toBeDefined();
    expect(dataMap.company_info).toBeDefined();
  });

  it('should map contactInfo → contact_info and companyInfo → company_info', async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    const contactInfo = { whatsapp: 'test-wa', email: 'test@email.com' };
    const companyInfo = { name: { en: 'Test Co' } };
    const ctx = createContext({ contactInfo, companyInfo }, 'Bearer test-token');
    vi.mocked(isAuthenticated).mockReturnValue(true);

    await onRequestPost(ctx);
    const dataMap = vi.mocked(kvPutBulk).mock.calls[0][1] as Record<string, any>;
    expect(dataMap.contact_info).toEqual(contactInfo);
    expect(dataMap.company_info).toEqual(companyInfo);
  });

  it('should include version in dataMap if provided as number', async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    const ctx = createContext({
      products: [{ id: 1 }],
      version: 2,
    }, 'Bearer test-token');
    vi.mocked(isAuthenticated).mockReturnValue(true);

    await onRequestPost(ctx);
    const dataMap = vi.mocked(kvPutBulk).mock.calls[0][1] as Record<string, any>;
    expect(dataMap.data_version).toBe(2);
  });

  it('should not include version if not a number', async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    const ctx = createContext({
      products: [{ id: 1 }],
      version: 'not-a-number',
    }, 'Bearer test-token');
    vi.mocked(isAuthenticated).mockReturnValue(true);

    await onRequestPost(ctx);
    const dataMap = vi.mocked(kvPutBulk).mock.calls[0][1] as Record<string, any>;
    expect(dataMap.version).toBeUndefined();
  });

  it('should return 400 for empty body (no valid data fields)', async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    const ctx = createContext({});
    const response = await onRequestPost(ctx);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('No valid data fields');
  });

  it('should work with only products field', async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    const ctx = createContext({ products: [{ id: 1, model: 'TEST' }] }, 'Bearer test-token');
    vi.mocked(isAuthenticated).mockReturnValue(true);

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
    const dataMap = vi.mocked(kvPutBulk).mock.calls[0][1] as Record<string, any>;
    expect(dataMap.products).toBeDefined();
  });

  it('should reject non-array products field', async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    const ctx = createContext({ products: 'not-an-array' }, 'Bearer test-token');
    vi.mocked(isAuthenticated).mockReturnValue(true);

    const response = await onRequestPost(ctx);
    // products must be an array, so only version-like fields could pass
    // But products is string, not array → won't be included
    expect(response.status).toBe(400);
  });

  it('should reject non-object contactInfo field', async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    const ctx = createContext({ contactInfo: 'not-an-object' }, 'Bearer test-token');
    vi.mocked(isAuthenticated).mockReturnValue(true);

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(400);
  });
});
