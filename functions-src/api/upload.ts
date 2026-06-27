/**
 * /api/upload — image upload endpoint for Cloudflare Pages Functions.
 *
 * Receives base64-encoded image data, stores it in the R2 bucket,
 * and returns the public URL. Requires admin authentication.
 *
 * Expects POST body: { data: string, contentType: string, key: string }
 * Returns: { url: string, key: string }
 */

import { isAuthenticated, unauthorizedResponse } from './_auth';

export async function onRequestPost(context: any): Promise<Response> {
  // Verify admin authentication
  if (!isAuthenticated(context.request, context.env)) {
    return unauthorizedResponse();
  }

  try {
    const { request, env } = context;
    const body = await request.json();
    const { data: base64Data, contentType, key } = body;

    if (!base64Data || !contentType || !key) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数（data, contentType, key）' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Validate content type (only allow images)
    if (!contentType.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: '仅允许上传图片文件' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Decode base64 to binary
    const binary = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Upload to R2
    await env.IMAGES_R2.put(key, binary, {
      httpMetadata: {
        contentType,
      },
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    // Return the proxy URL (avoids R2 public access issues)
    const url = `/api/image?key=${encodeURIComponent(key)}`;

    return new Response(JSON.stringify({ url, key }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[Upload API] Error:', err);
    return new Response(
      JSON.stringify({ error: err.message || '上传失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
