/**
 * /api/inquiries — admin endpoint to list or delete inquiries.
 *
 * GET: returns all inquiries (requires admin auth)
 * DELETE: deletes all inquiries (requires admin auth)
 */

import { isAuthenticated, unauthorizedResponse } from '../_auth';

export async function onRequestGet(context: any): Promise<Response> {
  if (!isAuthenticated(context.request, context.env)) {
    return unauthorizedResponse();
  }

  try {
    const kv = context.env.INQUIRIES_KV as any;

    const indexRaw = await kv.get('inquiries:index');
    if (!indexRaw) {
      return new Response(JSON.stringify({ inquiries: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const index: string[] = JSON.parse(indexRaw);

    const inquiries: any[] = [];
    for (const id of index) {
      const raw = await kv.get(`inquiry:${id}`);
      if (raw) {
        inquiries.push(JSON.parse(raw));
      }
    }

    return new Response(JSON.stringify({ inquiries }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[Inquiries API] Error:', err);
    return new Response(
      JSON.stringify({ error: err.message || '获取失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

export async function onRequestDelete(context: any): Promise<Response> {
  if (!isAuthenticated(context.request, context.env)) {
    return unauthorizedResponse();
  }

  try {
    const kv = context.env.INQUIRIES_KV as any;

    const indexRaw = await kv.get('inquiries:index');
    if (!indexRaw) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const index: string[] = JSON.parse(indexRaw);

    for (const id of index) {
      await kv.delete(`inquiry:${id}`);
    }

    await kv.delete('inquiries:index');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[Inquiries API] Error:', err);
    return new Response(
      JSON.stringify({ error: err.message || '删除失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
