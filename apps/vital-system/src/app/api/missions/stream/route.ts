import { NextRequest } from 'next/server';

// Proxy the missions stream to the Python AI engine.
// Set MISSIONS_API_URL to override the default backend URL.
const DEFAULT_TARGET = 'http://localhost:8000/api/missions/stream';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const target = process.env.MISSIONS_API_URL ?? DEFAULT_TARGET;
  const tenantId =
    req.headers.get('x-tenant-id') ??
    process.env.DEFAULT_TENANT_ID ??
    '00000000-0000-0000-0000-000000000001';

  const headers = new Headers();

  // Preserve content type for streaming bodies.
  const contentType = req.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }

  // Forward auth if present.
  const auth = req.headers.get('authorization');
  if (auth) {
    headers.set('authorization', auth);
  }

  headers.set('x-tenant-id', tenantId);

  const upstream = await fetch(target, {
    method: 'POST',
    headers,
    body: req.body,
    // Required for Node.js streaming requests in Next.js route handlers.
    duplex: 'half',
  });

  // Stream the upstream response back to the client.
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: {
      'content-type':
        upstream.headers.get('content-type') ?? 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
      'x-tenant-id': tenantId,
    },
  });
}
