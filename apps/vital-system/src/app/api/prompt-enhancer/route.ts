import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { setCsrfCookie, getCsrfToken, generateCsrfToken } from '@/lib/security/csrf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error('Missing OPENAI_API_KEY for prompt enhancer');
}

const client = new OpenAI({ apiKey: openaiApiKey });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, instructions = '', mode = 'auto' } = body || {};

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const system = `You are a professional prompt engineer for healthcare/life sciences.
Apply PRISM gold-standard structure: clear role, context, task, constraints, format.
No PII. Keep concise but complete. Ensure compliance/fair balance.`;

    const user = `Mode: ${mode}
Instructions: ${instructions}
Original prompt:
${prompt}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
      max_tokens: 600,
    });

    const enhanced = completion.choices?.[0]?.message?.content || prompt;
    // Set/refresh CSRF token in the response (double submit cookie)
    const csrfToken = getCsrfToken(req) ?? generateCsrfToken();
    const res = NextResponse.json({ enhanced });
    setCsrfCookie(res, csrfToken);
    return res;
  } catch (err: any) {
    console.error('Prompt enhancer error:', err);
    return NextResponse.json(
      { error: 'Failed to enhance prompt', details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
