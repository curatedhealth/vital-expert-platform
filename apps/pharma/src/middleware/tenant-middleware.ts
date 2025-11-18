/**
 * Tenant Context Middleware for Next.js
 * Full multi-tenant implementation with subdomain/header/cookie detection
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Platform Tenant ID (fallback)
const PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export async function tenantMiddleware(
  request: NextRequest,
  response: NextResponse,
  userId?: string
): Promise<NextResponse> {
  let tenantId = PLATFORM_TENANT_ID;
  let detectionMethod = 'fallback';

  // 1. SUBDOMAIN DETECTION (highest priority)
  // Example: acme.vital.expert → query for tenant with slug="acme"
  const hostname = request.headers.get('host') || '';
  const parts = hostname.split('.');

  // Check if subdomain exists and is not www/vital/app
  if (parts.length >= 3 || (parts.length === 2 && hostname.includes('localhost'))) {
    const subdomain = parts[0];

    if (subdomain && subdomain !== 'www' && subdomain !== 'vital' && subdomain !== 'app' && subdomain !== 'localhost') {
      try {
        // Query Supabase for tenant by slug
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);

          const { data: tenant, error } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', subdomain)
            .eq('status', 'active')
            .single();

          if (tenant && !error) {
            tenantId = tenant.id;
            detectionMethod = 'subdomain';
            console.log(`[Tenant Middleware] Detected tenant from subdomain: ${subdomain} → ${tenantId}`);
          } else {
            console.warn(`[Tenant Middleware] No tenant found for subdomain: ${subdomain}`);
          }
        }
      } catch (error) {
        console.error('[Tenant Middleware] Error querying tenant:', error);
      }
    }
  }

  // 2. USER PROFILE DETECTION (second priority if authenticated)
  // Check user's profile for tenant_id
  if (userId && tenantId === PLATFORM_TENANT_ID) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      if (supabaseUrl && supabaseServiceKey) {
        const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('tenant_id')
          .eq('id', userId)
          .single();

        if (profile?.tenant_id && profile.tenant_id !== PLATFORM_TENANT_ID) {
          tenantId = profile.tenant_id;
          detectionMethod = 'user_profile';
          console.log(`[Tenant Middleware] Detected tenant from user profile: ${tenantId}`);
        }
      }
    } catch (error) {
      console.error('[Tenant Middleware] Error querying user profile:', error);
    }
  }

  // 3. HEADER DETECTION (third priority)
  // Allow clients to override with x-tenant-id header
  if (tenantId === PLATFORM_TENANT_ID) {
    const headerTenantId = request.headers.get('x-tenant-id');
    if (headerTenantId && headerTenantId !== PLATFORM_TENANT_ID) {
      tenantId = headerTenantId;
      detectionMethod = 'header';
      console.log(`[Tenant Middleware] Detected tenant from header: ${tenantId}`);
    }
  }

  // 4. COOKIE DETECTION (fourth priority)
  // Check for tenant_id cookie
  if (tenantId === PLATFORM_TENANT_ID) {
    const cookieTenantId = request.cookies.get('tenant_id')?.value;
    if (cookieTenantId && cookieTenantId !== PLATFORM_TENANT_ID) {
      tenantId = cookieTenantId;
      detectionMethod = 'cookie';
      console.log(`[Tenant Middleware] Detected tenant from cookie: ${tenantId}`);
    }
  }

  // 5. FALLBACK to Platform Tenant (default)
  if (!tenantId || tenantId === PLATFORM_TENANT_ID) {
    detectionMethod = 'fallback';
    console.log('[Tenant Middleware] Using Platform Tenant (fallback)');
  }

  // Create response with tenant header
  const newResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Set tenant ID in response headers (for client-side access)
  newResponse.headers.set('x-tenant-id', tenantId);
  newResponse.headers.set('x-tenant-detection-method', detectionMethod);

  // Set tenant ID cookie (for persistence across requests)
  newResponse.cookies.set('tenant_id', tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return newResponse;
}
