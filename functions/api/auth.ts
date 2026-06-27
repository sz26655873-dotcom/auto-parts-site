/**
 * /api/auth — Admin authentication endpoint.
 *
 * POST: receives { password }, validates against env.ADMIN_PASSWORD,
 * returns a session token on success.
 *
 * The password is stored as a Cloudflare environment variable (secret),
 * NOT in the frontend JS bundle. This prevents password exposure via
 * browser DevTools.
 */

export async function onRequestPost(context: any): Promise<Response> {
  try {
    const { request, env } = context;
    const { password } = await request.json();

    // Get password from environment variable (set via Cloudflare dashboard or wrangler secret)
    const adminPassword = env.ADMIN_PASSWORD || 'sz135136';

    if (!password || password !== adminPassword) {
      return new Response(
        JSON.stringify({ success: false, error: '密码错误' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Generate a simple token: base64(password + ':' + expiry)
    // Token expires in 24 hours
    const expires = Date.now() + 24 * 60 * 60 * 1000;
    const token = btoa(`${password}:${expires}`);

    return new Response(
      JSON.stringify({ success: true, token }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: '请求格式错误' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
