/**
 * /api/inquiry — public endpoint to submit an inquiry.
 *
 * Accepts POST with inquiry data (name, phone, email, message, product).
 * Automatically captures visitor's country (CF-IPCountry) and IP address.
 * Stores the inquiry in KV for admin review.
 */

interface InquiryBody {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  product?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  product: string;
  country: string;
  ip: string;
  createdAt: string;
  status: '新' | '已读';
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export async function onRequestPost(context: any): Promise<Response> {
  try {
    const { request, env, requestContext } = context;

    // Parse request body
    const body: InquiryBody = await request.json();

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: '姓名不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get visitor's country from Cloudflare header
    const country = request.headers.get('CF-IPCountry') || '未知';
    
    // Get visitor's IP
    const ip = request.headers.get('CF-Connecting-IP') 
      || request.headers.get('X-Forwarded-For') 
      || requestContext?.identity?.ipAddress 
      || '未知';

    // Build inquiry object
    const inquiry: Inquiry = {
      id: generateId(),
      name: body.name.trim(),
      phone: body.phone?.trim() || '',
      email: body.email?.trim() || '',
      message: body.message?.trim() || '',
      product: body.product?.trim() || '',
      country,
      ip,
      createdAt: new Date().toISOString(),
      status: '新',
    };

    // Store in KV (key: "inquiry:{id}", value: JSON string)
    // Also maintain a list of all inquiry IDs for easy listing
    const kv = env.INQUIRIES_KV as any;
    
    // Save the inquiry
    await kv.put(`inquiry:${inquiry.id}`, JSON.stringify(inquiry));

    // Update the index (list of all inquiry IDs)
    const indexRaw = await kv.get('inquiries:index');
    const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    index.unshift(inquiry.id); // Add to beginning (newest first)
    await kv.put('inquiries:index', JSON.stringify(index));

    return new Response(JSON.stringify({ success: true, id: inquiry.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[Inquiry API] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || '提交失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
