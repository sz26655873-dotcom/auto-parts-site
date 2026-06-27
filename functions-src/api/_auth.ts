/**
 * Shared auth helper for Cloudflare Pages Functions.
 *
 * Validates the Authorization: Bearer <token> header against the
 * ADMIN_PASSWORD environment variable.
 *
 * Token format: base64(`${password}:${expiryTimestamp}`)
 */

/**
 * Checks if a request has valid admin authentication.
 * @returns true if authenticated, false otherwise.
 */
export function isAuthenticated(request: Request, env: any): boolean {
  const adminPassword = env.ADMIN_PASSWORD || 'sz135136';

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  if (!token) return false;

  try {
    const decoded = atob(token);
    const [password, expiryStr] = decoded.split(':');

    // Check password
    if (password !== adminPassword) return false;

    // Check token expiry
    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || Date.now() > expiry) return false;

    return true;
  } catch {
    return false;
  }
}

/** Returns a standard 401 response. */
export function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ error: '未授权访问' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } },
  );
}
