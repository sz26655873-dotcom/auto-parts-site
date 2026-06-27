// Cloudflare Workers runtime types for functions-src
// KVNamespace is provided by @cloudflare/workers-types but not
// included in tsconfig.app.json (which only covers src/).
// This declaration makes tsc happy during the combined build.

declare type KVNamespace = {
  get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<string | null>;
  put(key: string, value: string | ReadableStream | ArrayBuffer, options?: { expirationTtl?: number; metadata?: any }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: Array<{ name: string; expiration?: number; metadata?: any }>; list_complete: boolean; cursor?: string }>;
};

/** Cloudflare account ID for Workers AI REST API calls. */
declare const CF_ACCOUNT_ID: string;
/** API token for authenticating with Cloudflare Workers AI REST API. */
declare const AI_API_TOKEN: string;
