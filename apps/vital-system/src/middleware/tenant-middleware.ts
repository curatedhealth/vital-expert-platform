/**
 * Tenant Context Middleware for Next.js
 * Subdomain-based multitenancy with tenant_key mapping
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Subdomain to tenant_key mapping (matches database tenant_key values)
const SUBDOMAIN_TO_TENANT_KEY: Record<string, string> = {
  'vital-system': 'vital-system',
  'digital-health': 'digital-health',
  'pharma': 'pharma',
  'pharmaceuticals': 'pharma', // Alias
};

// Default tenant if no subdomain or unknown subdomain
const DEFAULT_TENANT_KEY = 'vital-system';

// Platform Tenant ID (fallback) – hard-coded for vital-system
const PLATFORM_TENANT_ID = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';

export async function tenantMiddleware(
  request: NextRequest,
  response: NextResponse,
  userId?: string
): Promise<NextResponse> {
  let tenantId = PLATFORM_TENANT_ID;
  let tenantKey = DEFAULT_TENANT_KEY;
  let detectionMethod = 'fallback';

  // 1. SUBDOMAIN DETECTION (highest priority)
  // Examples: vital-system.localhost:3000, digital-health.localhost:3000, pharma.localhost:3000
  const hostname = request.headers.get('host') || '';
  console.log('[Tenant Middleware] Request hostname:', hostname);

  // Extract subdomain from hostname
  const hostWithoutPort = hostname.split(':')[0];
  const parts = hostWithoutPort.split('.');

  // For localhost: vital-system.localhost → parts[0] = "vital-system"
  // For production: vital-system.yourdomain.com → parts[0] = "vital-system"
  if (parts.length >= 2 || hostname.includes('localhost')) {
    const subdomain = parts[0];
    console.log('[Tenant Middleware] Extracted subdomain:', subdomain);

    // Map subdomain to tenant_key
    if (subdomain && subdomain !== 'localhost' && SUBDOMAIN_TO_TENANT_KEY[subdomain]) {
      tenantKey = SUBDOMAIN_TO_TENANT_KEY[subdomain];

      try {
        // Query Supabase for tenant by tenant_key (use service role to bypass RLS)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (supabaseUrl && supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);

          const { data: org, error } = await supabase
            .from('organizations')
            .select('id, name, tenant_key')
            .eq('tenant_key', tenantKey)
            .eq('is_active', true)
            .single();

          if (org && !error) {
            tenantId = org.id;
            tenantKey = org.tenant_key;
            detectionMethod = 'subdomain';
            console.log(`[Tenant Middleware] Detected tenant: ${org.name} (${tenantKey}) → ${tenantId}`);
          } else {
            console.warn(`[Tenant Middleware] No organization found for tenant_key: ${tenantKey}`, error);
          }
        }
      } catch (error) {
        console.error('[Tenant Middleware] Error querying organization:', error);
      }
    } else if (hostname.includes('localhost') && parts.length === 1) {
      // Plain localhost without subdomain → use default
      console.log('[Tenant Middleware] No subdomain detected, using default:', DEFAULT_TENANT_KEY);
      tenantKey = DEFAULT_TENANT_KEY;
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

  // 3. REMOVED: Header detection (security vulnerability - client-controllable)
  // Previously allowed x-tenant-id header - REMOVED for security
  // Clients should NOT be able to override tenant selection

  // 4. REMOVED: Cookie detection for tenant_id (security vulnerability)
  // Previously allowed tenant_id cookie - REMOVED for security
  // Only server-determined tenant (subdomain or user profile) is trusted

  // 5. FALLBACK to Platform Tenant (default)
  if (!tenantId || tenantId === PLATFORM_TENANT_ID) {
    detectionMethod = 'fallback';
    console.log('[Tenant Middleware] Using Platform Tenant (fallback)');
  }

  // Create response with tenant headers
  const newResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Set tenant ID and tenant_key in response headers (for client-side access)
  newResponse.headers.set('x-tenant-id', tenantId);
  newResponse.headers.set('x-tenant-key', tenantKey);
  newResponse.headers.set('x-tenant-detection-method', detectionMethod);

  // Set tenant ID cookie (for server-side context only - NOT used for tenant selection)
  // SECURITY: This cookie is informational only. Tenant is determined by subdomain/user profile.
  newResponse.cookies.set('tenant_id', tenantId, {
    httpOnly: true,
    secure: true, // ALWAYS secure (use HTTPS proxy in dev)
    sameSite: 'strict', // CHANGED from 'lax' - prevent CSRF
    maxAge: 60 * 15, // CHANGED from 30 days to 15 minutes - HIPAA auto-logoff
    path: '/',
  });

  // Set tenant_key cookie (for client-side display only - NOT for security decisions)
  // SECURITY: Client can read this for UI purposes, but cannot change tenant via this cookie
  newResponse.cookies.set('vital-tenant-key', tenantKey, {
    httpOnly: false, // Client can read for display purposes only
    secure: true, // ALWAYS secure
    sameSite: 'strict', // CHANGED from 'lax' - prevent CSRF
    maxAge: 60 * 15, // CHANGED from 30 days to 15 minutes
    path: '/',
  });

  console.log('[Tenant Middleware] Set cookies: tenant_id=', tenantId, ', vital-tenant-key=', tenantKey);

  return newResponse;
}
