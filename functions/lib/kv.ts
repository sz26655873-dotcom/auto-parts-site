/**
 * KV helper module — read/write utilities for Cloudflare KV namespace.
 *
 * Provides generic kvGet/kvPut/kvPutBulk functions that handle JSON
 * serialization, seed data auto-initialization, and last_modified tracking.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Result of a KV read with optional seed auto-initialization. */
export interface KvResult<T> {
  data: T;
  lastModified: string;
  wasSeeded: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Valid data keys that can be stored in the PRODUCTS_DATA KV namespace. */
export const VALID_DATA_KEYS: readonly string[] = [
  'products',
  'contact_info',
  'company_info',
  'data_version',
  'last_modified',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Checks whether a key is in the allowed set. */
export function isValidDataKey(key: string): boolean {
  return VALID_DATA_KEYS.includes(key);
}

/** Returns the current time as an ISO 8601 UTC string. */
function nowISO(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// kvGet — read from KV, auto-seed if empty
// ---------------------------------------------------------------------------

/**
 * Reads a key from KV. If the value is null and a seedFn is provided,
 * writes the seed data to KV and returns it (with wasSeeded = true).
 *
 * @param kv      KVNamespace binding (PRODUCTS_DATA)
 * @param key     KV key (must be a valid DataKey)
 * @param seedFn  Optional function that returns the default value to seed
 */
export async function kvGet<T>(
  kv: KVNamespace,
  key: string,
  seedFn?: () => T,
): Promise<KvResult<T>> {
  const raw = await kv.get(key);

  if (raw !== null) {
    const data: T = JSON.parse(raw) as T;
    // Read last_modified separately; fall back to now if absent
    const lmRaw = await kv.get('last_modified');
    const lastModified = lmRaw ?? nowISO();
    return { data, lastModified, wasSeeded: false };
  }

  // KV is empty for this key — auto-seed if a seed function is provided
  if (seedFn) {
    const seedData = seedFn();
    await kv.put(key, JSON.stringify(seedData));
    const lm = nowISO();
    await kv.put('last_modified', lm);
    return { data: seedData, lastModified: lm, wasSeeded: true };
  }

  // No seedFn and no data — return a best-effort empty result
  throw new Error(`KV key "${key}" is empty and no seed function was provided`);
}

// ---------------------------------------------------------------------------
// kvPut — write to KV and update last_modified
// ---------------------------------------------------------------------------

/**
 * Writes a value to KV under the given key and updates the last_modified
 * timestamp.
 *
 * @param kv    KVNamespace binding
 * @param key   KV key (must be a valid DataKey)
 * @param value The value to store (will be JSON-serialized)
 */
export async function kvPut(
  kv: KVNamespace,
  key: string,
  value: unknown,
): Promise<{ lastModified: string }> {
  const lm = nowISO();
  await kv.put(key, JSON.stringify(value));
  await kv.put('last_modified', lm);
  return { lastModified: lm };
}

// ---------------------------------------------------------------------------
// kvPutBulk — batch write multiple keys
// ---------------------------------------------------------------------------

/**
 * Writes multiple key-value pairs to KV in sequence and updates
 * last_modified once at the end.
 *
 * @param kv       KVNamespace binding
 * @param dataMap  Map of KV key → value (each value is JSON-serialized)
 */
export async function kvPutBulk(
  kv: KVNamespace,
  dataMap: Record<string, unknown>,
): Promise<{ lastModified: string }> {
  // Write each key sequentially (KV does not support true batch put)
  for (const [key, value] of Object.entries(dataMap)) {
    await kv.put(key, JSON.stringify(value));
  }
  const lm = nowISO();
  await kv.put('last_modified', lm);
  return { lastModified: lm };
}
