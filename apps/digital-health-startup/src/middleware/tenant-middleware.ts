/**
 * Tenant Context Middleware for Next.js
 * Simplified version - adds Platform Tenant ID to all requests
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Platform Tenant ID (fallback)
const PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export async function tenantMiddleware(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  // For now, always use Platform Tenant
  // TODO: Implement full tenant detection logic when monorepo packages are properly configured
  const tenantId = PLATFORM_TENANT_ID;

  // Clone the response and add tenant header
  const newResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Add tenant ID to response headers for client-side access
  newResponse.headers.set('x-tenant-id', tenantId);

  return newResponse;
}
