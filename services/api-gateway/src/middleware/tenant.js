/**
 * Tenant Context Middleware for API Gateway
 * 
 * Extracts tenant context from:
 * 1. x-tenant-id header (highest priority)
 * 2. Subdomain (e.g., digital-health-startup.vital.expert)
 * 3. Cookie (tenant_id)
 * 4. Fallback to platform tenant
 */

const { createClient } = require('@supabase/supabase-js');

// Platform Tenant ID (fallback)
const PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Extract tenant ID from request
 * 
 * @param {Object} req - Express request object
 * @returns {Promise<string>} Tenant ID
 */
async function extractTenantId(req) {
  let tenantId = PLATFORM_TENANT_ID;
  let detectionMethod = 'fallback';

  // Priority 1: x-tenant-id header (explicit override)
  const headerTenantId = req.headers['x-tenant-id'];
  if (headerTenantId && headerTenantId !== PLATFORM_TENANT_ID) {
    tenantId = headerTenantId;
    detectionMethod = 'header';
    console.log(`[Tenant Middleware] Tenant from header: ${tenantId}`);
    return { tenantId, detectionMethod };
  }

  // Priority 2: Subdomain detection
  const hostname = req.headers.host || '';
  const parts = hostname.split('.');

  // Check if subdomain exists and is not www/vital/app/api
  if (parts.length >= 3 || (parts.length === 2 && hostname.includes('localhost'))) {
    const subdomain = parts[0];

    if (subdomain && 
        subdomain !== 'www' && 
        subdomain !== 'vital' && 
        subdomain !== 'app' && 
        subdomain !== 'api' &&
        subdomain !== 'localhost') {
      try {
        // Query Supabase for tenant by slug
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);

          const { data: tenant, error } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', subdomain)
            .eq('status', 'active')
            .is('deleted_at', null)
            .single();

          if (tenant && !error) {
            tenantId = tenant.id;
            detectionMethod = 'subdomain';
            console.log(`[Tenant Middleware] Tenant from subdomain: ${subdomain} → ${tenantId}`);
          } else {
            console.warn(`[Tenant Middleware] No tenant found for subdomain: ${subdomain}`);
          }
        }
      } catch (error) {
        console.error('[Tenant Middleware] Error querying tenant:', error.message);
      }
    }
  }

  // Priority 3: Cookie (if subdomain detection didn't find a tenant)
  if (tenantId === PLATFORM_TENANT_ID) {
    const cookieTenantId = req.cookies?.tenant_id;
    if (cookieTenantId) {
      tenantId = cookieTenantId;
      detectionMethod = 'cookie';
      console.log(`[Tenant Middleware] Tenant from cookie: ${tenantId}`);
    }
  }

  return { tenantId, detectionMethod };
}

/**
 * Tenant context middleware
 * 
 * Extracts tenant ID from request and adds it to:
 * - req.tenantId
 * - req.headers['x-tenant-id']
 * - res.locals.tenantId
 */
async function tenantMiddleware(req, res, next) {
  try {
    const { tenantId, detectionMethod } = await extractTenantId(req);

    // Attach tenant ID to request
    req.tenantId = tenantId;
    req.tenantDetectionMethod = detectionMethod;

    // Ensure x-tenant-id header is set for downstream services
    req.headers['x-tenant-id'] = tenantId;

    // Attach to response locals for logging/monitoring
    res.locals.tenantId = tenantId;
    res.locals.tenantDetectionMethod = detectionMethod;

    // Log tenant detection for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Tenant Middleware] Request ${req.method} ${req.path} - Tenant: ${tenantId} (${detectionMethod})`);
    }

    next();
  } catch (error) {
    console.error('[Tenant Middleware] Error:', error);
    
    // On error, fall back to platform tenant
    req.tenantId = PLATFORM_TENANT_ID;
    req.headers['x-tenant-id'] = PLATFORM_TENANT_ID;
    res.locals.tenantId = PLATFORM_TENANT_ID;
    res.locals.tenantDetectionMethod = 'error-fallback';

    // Continue with platform tenant (don't block request)
    next();
  }
}

module.exports = {
  tenantMiddleware,
  extractTenantId,
  PLATFORM_TENANT_ID,
};

