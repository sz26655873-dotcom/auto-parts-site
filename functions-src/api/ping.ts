/**
 * /api/ping — Diagnostic endpoint to verify Functions are running.
 * Returns JSON if Cloudflare Functions are active.
 * Returns HTML (from SPA fallback) if Functions are NOT deployed/active.
 */

export async function onRequestGet() {
  return new Response(JSON.stringify({
    status: 'ok',
    functions: 'active',
    timestamp: new Date().toISOString(),
    env: {
      hasAI: typeof process !== 'undefined' ? 'check runtime' : 'unknown',
    },
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
