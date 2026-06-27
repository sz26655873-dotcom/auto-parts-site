/**
 * /api/data/[key] — GET/PUT endpoint for individual data types.
 *
 * GET (public):  reads a data key from KV, auto-seeding if empty
 * PUT (auth):    writes a data key to KV, requires admin auth
 *
 * Supported keys: products, contact_info, company_info, data_version, last_modified
 */

import { isAuthenticated, unauthorizedResponse } from '../_auth';
import { kvGet, kvPut, isValidDataKey } from '../../lib/kv';
import { getAllSeeds } from '../../lib/seedData';

/** Seed function lookup map. */
const seeds = getAllSeeds();

/** Common JSON response headers for admin writes — no caching. */
const JSON_HEADERS_NO_CACHE = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
};

/** JSON response headers for public GET reads — allows CDN & browser caching.
 *  Browser: 60s, CDN: 5min (s-maxage=300), stale-while-revalidate: 60s.
 *  Admin updates trigger fetchAllData() on the client, so stale data is short-lived. */
const JSON_HEADERS_CACHE = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=60',
};

export async function onRequestGet(context: any): Promise<Response> {
  const kv = context.env.PRODUCTS_DATA as KVNamespace;
  const url = new URL(context.request.url);
  const key = url.pathname.split('/api/data/')[1];

  // Validate key
  if (!key || !isValidDataKey(key)) {
    return new Response(
      JSON.stringify({ success: false, error: `Invalid data key: "${key}". Allowed keys: products, contact_info, company_info` }),
      { status: 400, headers: JSON_HEADERS_CACHE },
    );
  }

  // Internal keys (data_version, last_modified) are read-only metadata
  // Note: last_modified is stored as a raw ISO string, NOT JSON.stringify'd,
  // so JSON.parse would throw SyntaxError. Use raw value directly.
  if (key === 'data_version' || key === 'last_modified') {
    try {
      const raw = await kv.get(key);
      // data_version is stored as JSON.stringify(number), so parse it;
      // last_modified is stored as a raw ISO string, don't parse
      const value = raw !== null
        ? (key === 'last_modified' ? raw : JSON.parse(raw))
        : null;
      return new Response(
        JSON.stringify({ success: true, data: value, lastModified: null }),
        { status: 200, headers: JSON_HEADERS_CACHE },
      );
    } catch (err: any) {
      console.error('[Data API GET] Error reading metadata key:', err);
      return new Response(
        JSON.stringify({ success: false, error: err.message || '读取失败' }),
        { status: 500, headers: JSON_HEADERS_CACHE },
      );
    }
  }

  // Data keys with auto-seeding
  try {
    const seedFn = seeds[key] as (() => any) | undefined;
    const result = await kvGet(kv, key, seedFn);
    // Use ResponseInit with cf property for CDN caching
    // cf.cacheEverything forces Cloudflare CDN to cache Function responses (normally always DYNAMIC)
    const responseInit: ResponseInit & { cf?: { cacheEverything?: boolean; cacheTtl?: number } } = {
      status: 200,
      headers: JSON_HEADERS_CACHE,
      cf: { cacheEverything: true, cacheTtl: 300 },
    };
    return new Response(
      JSON.stringify({ success: true, data: result.data, lastModified: result.lastModified }),
      responseInit,
    );
  } catch (err: any) {
    console.error('[Data API GET] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || '读取失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

export async function onRequestPut(context: any): Promise<Response> {
  // Auth check
  if (!isAuthenticated(context.request, context.env)) {
    return unauthorizedResponse();
  }

  const kv = context.env.PRODUCTS_DATA as KVNamespace;
  const url = new URL(context.request.url);
  const key = url.pathname.split('/api/data/')[1];

  // Validate key
  if (!key || !isValidDataKey(key)) {
    return new Response(
      JSON.stringify({ success: false, error: `Invalid data key: "${key}"` }),
      { status: 400, headers: JSON_HEADERS_NO_CACHE },
    );
  }

  // Internal keys cannot be written directly
  if (key === 'data_version' || key === 'last_modified') {
    return new Response(
      JSON.stringify({ success: false, error: `Key "${key}" is read-only metadata` }),
      { status: 400, headers: JSON_HEADERS_NO_CACHE },
    );
  }

  // Parse body
  try {
    const body = await context.request.json();
    if (body === null || body === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: 'Request body is required' }),
        { status: 400, headers: JSON_HEADERS_NO_CACHE },
      );
    }

    // P1 extension point: If-Last-Modified header for optimistic locking
    // Currently not enforced — just logged for future implementation
    const ifLastModified = context.request.headers.get('If-Last-Modified');
    if (ifLastModified) {
      console.log(`[Data API PUT] If-Last-Modified: ${ifLastModified} (P1 — not enforced yet)`);
    }

    const result = await kvPut(kv, key, body);
    return new Response(
      JSON.stringify({ success: true, lastModified: result.lastModified }),
      { status: 200, headers: JSON_HEADERS_NO_CACHE },
    );
  } catch (err: any) {
    console.error('[Data API PUT] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || '写入失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
