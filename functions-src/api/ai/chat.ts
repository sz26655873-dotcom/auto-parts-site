/**
 * /api/ai/chat — POST endpoint for AI-powered chat assistant.
 *
 * Uses the Workers AI binding (context.env.AI) to provide an interactive
 * chat experience for customers visiting the Altai Parts website.
 *
 * No authentication required — this is a public-facing feature.
 * The AI acts as a professional auto parts consultant for Altai Parts,
 * answering product questions, confirming compatibility, and guiding
 * customers to contact WhatsApp/WeChat for quotes and orders.
 */

/** All supported languages with their labels for prompts. */
const LANG_CONFIG: Record<string, { label: string; promptLang: string }> = {
  zh: { label: '中文', promptLang: '中文' },
  en: { label: 'English', promptLang: 'English' },
  ru: { label: 'Русский', promptLang: 'Русский' },
  ar: { label: 'العربية', promptLang: 'العربية' },
  ko: { label: '한국어', promptLang: '한국어' },
};

/** Chat message structure from the client. */
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Builds the system prompt that defines the AI assistant persona. */
function buildSystemPrompt(lang: string): string {
  const lc = LANG_CONFIG[lang] ?? LANG_CONFIG.en;
  const promptLang = lc.promptLang;

  return `You are a professional auto parts consultant for Altai Parts, a company based in Altay, Xinjiang, China.

COMPANY FACTS (use ONLY these, never invent new ones):
- Company: Altai Parts
- Location: Altay region, Xinjiang, China  
- Business: Auto parts wholesale and export
- Product brands: BMW, Mercedes-Benz, Audi, Porsche, Land Rover, Volkswagen, Volvo, Ferrari, Lamborghini, Bentley, Rolls-Royce, Lexus, Lincoln, Xiaomi
- Quality: OEM-grade parts from certified manufacturers
- Experience: 15+ years in auto parts industry

YOUR ROLE:
1. Answer product questions honestly based on general auto parts knowledge
2. Help customers understand part compatibility concepts (general guidance only)
3. Provide general pricing ranges — always say "contact us for exact quotes"
4. Guide customers to WhatsApp/WeChat for specific quotes and orders

CRITICAL ANTI-HALLUCINATION RULES:
- NEVER invent phone numbers, email addresses, or URLs not listed above
- NEVER guess specific OEM part numbers, engine sizes, or year ranges
- If you don't know something, say "I'd need to check our catalog — please contact us via WhatsApp"
- NEVER make up warranty terms, shipping times, or return policies
- NEVER use template placeholders like "[Support Email]" or "400-XXX-XXXX"
- Use correct auto parts terminology: bumper (NOT bucket/cask), tail light/rear lamp (NOT "back light"), headlight, assembly

CONTACT INFO TO SHARE:
- WhatsApp: https://wa.me/8615711970362
- WeChat: available upon request (no public ID)

IMPORTANT: Always respond in ${promptLang}. Be friendly, concise, professional. Keep responses under 200 words.`;
}

export async function onRequestPost(context: any): Promise<Response> {
  // Check if AI binding is available
  if (!context.env.AI) {
    return new Response(
      JSON.stringify({ error: 'AI binding not configured — please add Workers AI binding in Cloudflare Dashboard' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: any;
  try {
    body = await context.request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { messages, lang } = body as { messages?: ChatMessage[]; lang?: string };

  // Validate messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Messages array is required and must not be empty' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Validate each message
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return new Response(
        JSON.stringify({ error: 'Each message must have role and content' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (msg.role !== 'user' && msg.role !== 'assistant') {
      return new Response(
        JSON.stringify({ error: 'Message role must be "user" or "assistant"' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  // Determine language (default to English)
  const effectiveLang: string = lang && LANG_CONFIG[lang] ? lang : 'en';
  const systemPrompt = buildSystemPrompt(effectiveLang);

  // Build the messages array for the AI model
  const aiMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...messages.map((msg: ChatMessage) => ({
      role: msg.role,
      content: msg.content,
    })),
  ];

  try {
    const aiResult: any = await context.env.AI.run(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      {
        messages: aiMessages,
        max_tokens: 1024,
      },
    );

    const reply: string = (aiResult?.response || '').trim();

    if (!reply) {
      return new Response(
        JSON.stringify({ error: 'AI generated empty response' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ reply }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('[AI Chat] Error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'AI chat failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
