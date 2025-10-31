/**
 * Tenant-Aware Supabase Client Factory
 * 
 * Creates Supabase clients that respect tenant context.
 * Uses anon key + RLS instead of service role key.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Create tenant-aware Supabase client
 * 
 * This client uses the anon key with RLS enabled.
 * The tenant context should be set via set_tenant_context() function
 * in the database before making queries.
 * 
 * @param {string} tenantId - Tenant ID to set context for
 * @param {string} userId - Optional user ID for user-scoped queries
 * @returns {Object} Supabase client configured for tenant context
 */
function createTenantAwareClient(tenantId, userId = null) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key are required for tenant-aware clients');
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-tenant-id': tenantId,
      },
    },
  });

  // Store tenant context for potential use in queries
  client.tenantId = tenantId;
  client.userId = userId;

  return client;
}

/**
 * Create admin Supabase client (for platform operations only)
 * 
 * ⚠️ WARNING: This client bypasses RLS using service role key!
 * Only use for:
 * - Platform-level operations
 * - Admin operations
 * - System tasks that need to bypass tenant isolation
 * 
 * DO NOT use for regular tenant operations.
 * 
 * @returns {Object} Admin Supabase client (bypasses RLS)
 */
function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL and service role key are required for admin client');
  }

  console.warn('[Supabase Client] Using admin client (service role key) - bypasses RLS');

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Execute query with tenant context
 * 
 * Sets tenant context in database session before executing query.
 * 
 * @param {Object} client - Supabase client
 * @param {string} tenantId - Tenant ID
 * @param {Function} queryFn - Function that executes the query
 * @returns {Promise} Query result
 */
async function executeWithTenantContext(client, tenantId, queryFn) {
  // Set tenant context via SQL
  await client.rpc('set_tenant_context', { p_tenant_id: tenantId });
  
  // Execute query
  const result = await queryFn();
  
  return result;
}

module.exports = {
  createTenantAwareClient,
  createAdminClient,
  executeWithTenantContext,
};

