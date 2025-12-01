import { NextRequest, NextResponse } from 'next/server';

// Call AI Engine directly instead of going through API Gateway
// AI Engine serves ontology data at /v1/ontology-investigator/
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params;
  const path = pathArray.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${AI_ENGINE_URL}/v1/ontology-investigator/${path}${searchParams ? `?${searchParams}` : ''}`;

  console.log(`[API] Ontology Investigator GET -> ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': request.headers.get('x-tenant-id') || '',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error(`[API] Ontology Investigator GET /${path} status: ${response.status}`);
      const errorText = await response.text();
      return NextResponse.json(
        { error: `AI Engine error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[API] Ontology Investigator GET /${path} error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch from ontology investigator', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params;
  const path = pathArray.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${AI_ENGINE_URL}/v1/ontology-investigator/${path}${searchParams ? `?${searchParams}` : ''}`;

  console.log(`[API] Ontology Investigator POST -> ${url}`);

  try {
    const body = await request.json().catch(() => ({}));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': request.headers.get('x-tenant-id') || '',
      },
      body: JSON.stringify(body),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error(`[API] Ontology Investigator POST /${path} status: ${response.status}`);
      const errorText = await response.text();
      return NextResponse.json(
        { error: `AI Engine error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[API] Ontology Investigator POST /${path} error:`, error);
    return NextResponse.json(
      { error: 'Failed to send to ontology investigator', details: String(error) },
      { status: 500 }
    );
  }
}
