/**
 * /api/inquiries/:id — admin endpoint to update or delete a single inquiry.
 *
 * PATCH: update inquiry status (新 → 已读)
 * DELETE: delete a single inquiry
 */

import { isAuthenticated, unauthorizedResponse } from '../_auth';

export async function onRequestPatch(context: any): Promise<Response> {
  if (!isAuthenticated(context.request, context.env)) {
    return unauthorizedResponse();
  }

  try {
    const { env, params } = context;
    const id = params.id as string;
    const body = await context.request.json();

    const kv = env.INQUIRIES_KV as any;

    const raw = await kv.get(`inquiry:${id}`);
    if (!raw) {
      return new Response(
        JSON.stringify({ error: '询盘不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const inquiry = JSON.parse(raw);

    if (body.status !== undefined) {
      inquiry.status = body.status;
    }

    await kv.put(`inquiry:${id}`, JSON.stringify(inquiry));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[Inquiry API] Error:', err);
    return new Response(
      JSON.stringify({ error: err.message || '更新失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

export async function onRequestDelete(context: any): Promise<Response> {
  if (!isAuthenticated(context.request, context.env)) {
    return unauthorizedResponse();
  }

  try {
    const { env, params } = context;
    const id = params.id as string;
    const kv = env.INQUIRIES_KV as any;

    await kv.delete(`inquiry:${id}`);

    const indexRaw = await kv.get('inquiries:index');
    if (indexRaw) {
      const index: string[] = JSON.parse(indexRaw);
      const newIndex = index.filter((i: string) => i !== id);
      await kv.put('inquiries:index', JSON.stringify(newIndex));
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[Inquiry API] Error:', err);
    return new Response(
      JSON.stringify({ error: err.message || '删除失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
