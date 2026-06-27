/**
 * /api/image — serve images from R2 bucket.
 *
 * Proxies image requests through our own domain to avoid R2 public
 * access issues. The R2 bucket doesn't need public access enabled.
 *
 * Query params: ?key=<r2-key>
 */

export async function onRequestGet(context: any): Promise<Response> {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return new Response('Missing key parameter', { status: 400 });
    }

    // Fetch from R2
    const object = await env.IMAGES_R2.get(key);

    if (!object) {
      return new Response('Image not found', { status: 404 })
    }

    // Return the image with proper headers
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=31536000'); // 1 year

    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('[Image API] Error:', err);
    return new Response('Internal Server Error', { status: 500 })
  }
}
