'use server';

import { NextRequest, NextResponse } from 'next/server';

const PRIMARY_API_BASE =
  process.env.ASK_EXPERT_API_BASE ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  process.env.API_GATEWAY_URL;

// Local fallback for dev if primary base fails or is unset
const FALLBACK_API_BASE = 'http://localhost:8000';

async function fetchTemplates(baseUrl: string, request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const url = `${baseUrl}/ask-expert/missions/templates${qs ? `?${qs}` : ''}`;

  const headers: Record<string, string> = {};
  const tenant = request.headers.get('x-tenant-id');
  if (tenant) headers['x-tenant-id'] = tenant;

  const resp = await fetch(url, {
    headers,
    cache: 'no-store',
  });

  if (!resp.ok) {
    throw new Error(`upstream ${resp.status}`);
  }

  return resp.json();
}

export async function GET(request: NextRequest) {
  try {
    // Try primary base (if provided), otherwise fallback to localhost
    const primaryBase = PRIMARY_API_BASE;
    const basesToTry = primaryBase ? [primaryBase, FALLBACK_API_BASE] : [FALLBACK_API_BASE];

    let lastError: unknown;
    for (const base of basesToTry) {
      try {
        const data = await fetchTemplates(base, request);
        return NextResponse.json({ templates: data });
      } catch (err) {
        lastError = err;
        continue;
      }
    }

    return NextResponse.json({ error: 'Failed to fetch templates', detail: String(lastError) }, { status: 502 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}
