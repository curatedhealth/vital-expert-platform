import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

/**
 * API Proxy Route for LangGraph GUI
 * Proxies all requests to the Python AI Engine service
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const { route: routeArray } = await params;
    const route = routeArray.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${AI_ENGINE_URL}/api/langgraph-gui/${route}${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Request failed' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[LangGraph GUI Proxy] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const { route: routeArray } = await params;
    const route = routeArray.join('/');
    const body = await request.json();
    const url = `${AI_ENGINE_URL}/api/langgraph-gui/${route}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Handle streaming responses (SSE)
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Request failed' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[LangGraph GUI Proxy] POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const { route: routeArray } = await params;
    const route = routeArray.join('/');
    const body = await request.json();
    const url = `${AI_ENGINE_URL}/api/langgraph-gui/${route}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Request failed' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[LangGraph GUI Proxy] PUT error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const { route: routeArray } = await params;
    const route = routeArray.join('/');
    const url = `${AI_ENGINE_URL}/api/langgraph-gui/${route}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Request failed' },
        { status: response.status }
      );
    }
    
    // DELETE might return 204 No Content
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[LangGraph GUI Proxy] DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

