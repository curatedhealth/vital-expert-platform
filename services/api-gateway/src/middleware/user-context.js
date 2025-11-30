/**
 * User Context Middleware for API Gateway
 *
 * Extracts user context from:
 * 1. x-user-id header (highest priority)
 * 2. Authorization header (JWT token)
 * 3. Supabase session
 *
 * Sets RLS context for database queries via set_request_context RPC
 *
 * CRITICAL: This middleware must run AFTER tenant middleware
 * to ensure both user and tenant context are available.
 */

const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

/**
 * Extract user ID from request
 *
 * @param {Object} req - Express request object
 * @returns {Promise<{userId: string|null, detectionMethod: string}>}
 */
async function extractUserId(req) {
  let userId = null;
  let detectionMethod = 'none';

  // Priority 1: x-user-id header (explicit override, trusted internal calls)
  const headerUserId = req.headers['x-user-id'];
  if (headerUserId && isValidUUID(headerUserId)) {
    userId = headerUserId;
    detectionMethod = 'header';
    console.log(`[User Context] User from header: ${userId}`);
    return { userId, detectionMethod };
  }

  // Priority 2: Authorization header (JWT token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      // Decode JWT (Supabase JWTs are self-verifying via database)
      const decoded = jwt.decode(token);
      if (decoded && decoded.sub && isValidUUID(decoded.sub)) {
        userId = decoded.sub;
        detectionMethod = 'jwt';
        console.log(`[User Context] User from JWT: ${userId}`);
        return { userId, detectionMethod };
      }
    } catch (error) {
      console.warn('[User Context] Failed to decode JWT:', error.message);
    }
  }

  // Priority 3: Supabase session cookie (if available)
  const supabaseAuth = req.cookies?.['sb-access-token'];
  if (supabaseAuth) {
    try {
      const decoded = jwt.decode(supabaseAuth);
      if (decoded && decoded.sub && isValidUUID(decoded.sub)) {
        userId = decoded.sub;
        detectionMethod = 'cookie';
        console.log(`[User Context] User from cookie: ${userId}`);
        return { userId, detectionMethod };
      }
    } catch (error) {
      console.warn('[User Context] Failed to decode cookie token:', error.message);
    }
  }

  // No user context available - this is OK for public endpoints
  return { userId, detectionMethod };
}

/**
 * Validate UUID format
 * @param {string} str - String to validate
 * @returns {boolean}
 */
function isValidUUID(str) {
  if (!str || typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Set RLS context in database
 *
 * @param {string|null} userId - User ID to set
 * @param {string|null} tenantId - Tenant ID to set
 * @returns {Promise<boolean>} - Success status
 */
async function setRLSContext(userId, tenantId) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[User Context] Supabase credentials not configured, skipping RLS context');
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Use the combined set_request_context function
    const { error } = await supabase.rpc('set_request_context', {
      p_user_id: userId || null,
      p_organization_id: tenantId || null
    });

    if (error) {
      console.error('[User Context] Failed to set RLS context:', error.message);
      return false;
    }

    console.log(`[User Context] RLS context set - user: ${userId || 'null'}, tenant: ${tenantId || 'null'}`);
    return true;
  } catch (error) {
    console.error('[User Context] Error setting RLS context:', error.message);
    return false;
  }
}

/**
 * User context middleware
 *
 * Extracts user ID from request and:
 * - Attaches to req.userId
 * - Sets x-user-id header for downstream services
 * - Sets RLS context in database (if configured)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
async function userContextMiddleware(req, res, next) {
  try {
    const { userId, detectionMethod } = await extractUserId(req);

    // Attach user context to request
    req.userId = userId;
    req.userDetectionMethod = detectionMethod;

    // Ensure x-user-id header is set for downstream services
    if (userId) {
      req.headers['x-user-id'] = userId;
    }

    // Attach to response locals for logging/monitoring
    res.locals.userId = userId;
    res.locals.userDetectionMethod = detectionMethod;

    // Get tenant ID (set by tenant middleware which runs first)
    const tenantId = req.tenantId || req.headers['x-tenant-id'];

    // Set RLS context in database for this request
    // Only if we have at least one piece of context
    if (userId || tenantId) {
      await setRLSContext(userId, tenantId);
    }

    // Log context for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[User Context] Request ${req.method} ${req.path} - User: ${userId || 'anonymous'} (${detectionMethod}), Tenant: ${tenantId || 'platform'}`);
    }

    next();
  } catch (error) {
    console.error('[User Context] Error:', error);

    // On error, continue without user context (don't block request)
    req.userId = null;
    req.userDetectionMethod = 'error';
    res.locals.userId = null;
    res.locals.userDetectionMethod = 'error';

    next();
  }
}

/**
 * Require authenticated user middleware
 *
 * Use this for endpoints that require authentication.
 * Returns 401 if no user context is available.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function requireAuth(req, res, next) {
  if (!req.userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
}

/**
 * Optional user context middleware (doesn't set RLS)
 *
 * Use this for endpoints where user context is optional
 * and you don't want the overhead of RLS context setting.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
async function optionalUserContext(req, res, next) {
  try {
    const { userId, detectionMethod } = await extractUserId(req);

    req.userId = userId;
    req.userDetectionMethod = detectionMethod;

    if (userId) {
      req.headers['x-user-id'] = userId;
    }

    res.locals.userId = userId;
    res.locals.userDetectionMethod = detectionMethod;

    next();
  } catch (error) {
    console.error('[User Context] Error in optional context:', error);
    req.userId = null;
    req.userDetectionMethod = 'error';
    next();
  }
}

module.exports = {
  userContextMiddleware,
  extractUserId,
  setRLSContext,
  requireAuth,
  optionalUserContext,
  isValidUUID,
};
