/**
 * functions-src/api/track.ts
 *
 * Lightweight page-view tracker backed by Cloudflare KV.
 *
 * POST /api/track  { type: 'product'|'page', slug: string }
 *   → increments the counter for that slug
 *   → tracks visitor geo data (country, city) via Cloudflare cf object
 *   → throttled per IP (1 write per slug per hour) to avoid spam
 *
 * GET /api/track?type=product     (admin only) → all product view counts
 * GET /api/track?type=page        (admin only) → all page view counts
 * GET /api/track?type=country     (admin only) → all country visit counts
 * GET /api/track?type=city        (admin only) → all city visit counts
 */

import { isAuthenticated, unauthorizedResponse } from './_auth';

// KV key prefixes
const PRODUCT_VIEW_KEY  = 'analytics:product:';
const PAGE_VIEW_KEY     = 'analytics:page:';
const COUNTRY_KEY      = 'analytics:geo:country:';
const CITY_KEY         = 'analytics:geo:city:';
const THROTTLE_KEY     = 'throttle:';

/** Resolve KV prefix for a given analytics type. */
function getPrefix(type: string): string {
  switch (type) {
    case 'product':  return PRODUCT_VIEW_KEY;
    case 'page':     return PAGE_VIEW_KEY;
    case 'country':  return COUNTRY_KEY;
    case 'city':     return CITY_KEY;
    default:         return PRODUCT_VIEW_KEY;
  }
}

/**
 * Returns true if this IP already tracked this slug within the last hour.
 */
async function isThrottled(
  env: { INQUIRIES_KV: KVNamespace },
  ip: string,
  type: string,
  slug: string,
): Promise<boolean> {
  const key = `${THROTTLE_KEY}${ip}:${type}:${slug}`;
  const val = await env.INQUIRIES_KV.get(key);
  return val === '1';
}

async function setThrottle(
  env: { INQUIRIES_KV: KVNamespace },
  ip: string,
  type: string,
  slug: string,
) {
  const key = `${THROTTLE_KEY}${ip}:${type}:${slug}`;
  await env.INQUIRIES_KV.put(key, '1', { expirationTtl: 3600 });
}

/** Increment a counter in KV. */
async function increment(
  env: { INQUIRIES_KV: KVNamespace },
  type: string,
  slug: string,
): Promise<number> {
  const prefix = getPrefix(type);
  const key    = `${prefix}${slug}`;
  const current = await env.INQUIRIES_KV.get(key);
  const next    = (parseInt(current || '0', 10)) + 1;
  await env.INQUIRIES_KV.put(key, String(next));
  return next;
}

/** Read a single counter. */
async function getCount(
  env: { INQUIRIES_KV: KVNamespace },
  type: string,
  slug: string,
): Promise<number> {
  const prefix = getPrefix(type);
  const val    = await env.INQUIRIES_KV.get(`${prefix}${slug}`);
  return parseInt(val || '0', 10);
}

/** List all counters of a given type, sorted desc. */
async function listAll(
  env: { INQUIRIES_KV: KVNamespace },
  type: string,
): Promise<{ slug: string; count: number }[]> {
  const prefix = getPrefix(type);
  const { keys } = await env.INQUIRIES_KV.list({ prefix });
  const result: { slug: string; count: number }[] = [];
  for (const k of keys) {
    const val  = await env.INQUIRIES_KV.get(k.name);
    const slug = k.name.replace(prefix, '');
    result.push({ slug, count: parseInt(val || '0', 10) });
  }
  return result.sort((a, b) => b.count - a.count);
}

/**
 * Increment geo counters (country / city) for this request.
 * Only called for non-throttled requests (= unique visitor per slug per hour).
 */
async function incrementGeo(
  env: { INQUIRIES_KV: KVNamespace },
  request: Request,
): Promise<void> {
  // Cloudflare attaches geo data to request.cf in production.
  // In local wrangler dev it may be undefined.
  const cf: Record<string, unknown> = (request as unknown as Record<string, unknown>).cf as Record<string, unknown> || {};
  const country = (cf.country as string) || 'unknown';
  const city    = (cf.city as string)    || '';

  // Increment country counter
  const ck = `${COUNTRY_KEY}${country}`;
  const cv = await env.INQUIRIES_KV.get(ck);
  await env.INQUIRIES_KV.put(ck, String((parseInt(cv || '0', 10)) + 1));

  // Increment city counter (only when city is available)
  if (city) {
    const ck2 = `${CITY_KEY}${city}`;
    const cv2  = await env.INQUIRIES_KV.get(ck2);
    await env.INQUIRIES_KV.put(ck2, String((parseInt(cv2 || '0', 10)) + 1));
  }
}

/** Extract client IP from Cloudflare headers. */
function getClientIP(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

export async function onRequestPost({
  request,
  env,
}: {
  request: Request;
  env: { INQUIRIES_KV: KVNamespace };
}): Promise<Response> {
  const body: { type?: string; slug?: string } = await request
    .json()
    .catch(() => ({}));
  const { type, slug } = body;

  if (!type || !slug || (type !== 'product' && type !== 'page')) {
    return new Response(JSON.stringify({ error: 'Invalid type or slug' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip = getClientIP(request);

  if (await isThrottled(env, ip, type, slug)) {
    const current = await getCount(env, type, slug);
    return new Response(JSON.stringify({ count: current, throttled: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const count = await increment(env, type, slug);
  await setThrottle(env, ip, type, slug);

  // Track visitor geo data
  await incrementGeo(env, request);

  return new Response(JSON.stringify({ count, throttled: false }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestGet({
  request,
  env,
}: {
  request: Request;
  env: { INQUIRIES_KV: KVNamespace };
}): Promise<Response> {
  // Require admin auth for read operations
  if (!isAuthenticated(request, env)) {
    return unauthorizedResponse();
  }

  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'product';
  const slug = url.searchParams.get('slug');

  if (slug) {
    const count = await getCount(env, type, slug);
    return new Response(JSON.stringify({ slug, type, count }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const all = await listAll(env, type);
  return new Response(JSON.stringify({ type, data: all }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
