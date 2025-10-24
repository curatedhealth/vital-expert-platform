/**
 * Row-Level Security (RLS) Helper Functions
 *
 * Helper functions for enforcing RLS policies in Supabase queries
 * Integrates with RBAC system for permission-based data access
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { UserRole, Permission, hasPermission, getRLSFilter, getRoleBasedFilter } from './rbac';

// ============================================================================
// TYPES
// ============================================================================

export interface RLSContext {
  userId: string;
  userRole: UserRole;
  organizationId?: string;
}

export interface QueryOptions {
  includePublic?: boolean;
  includeOrganization?: boolean;
  requireOwnership?: boolean;
}

// ============================================================================
// RLS QUERY BUILDERS
// ============================================================================

/**
 * Apply RLS filter to a Supabase query based on user context
 */
export function applyRLSFilter(
  query: any,
  context: RLSContext,
  options: QueryOptions = {}
) {
  const { userId, userRole, organizationId } = context;
  const {
    includePublic = true,
    includeOrganization = true,
    requireOwnership = false,
  } = options;

  // Super admins bypass RLS
  if (userRole === UserRole.SUPER_ADMIN) {
    return query;
  }

  // Build filter conditions
  const conditions: any[] = [];

  // User's own resources
  conditions.push({ user_id: userId });
  conditions.push({ created_by: userId });

  // Public resources (if allowed)
  if (includePublic) {
    conditions.push({ is_public: true });
  }

  // Organization resources (if allowed and available)
  if (includeOrganization && organizationId && userRole !== UserRole.GUEST) {
    conditions.push({ organization_id: organizationId });
  }

  // Apply OR filter
  if (conditions.length > 1) {
    return query.or(conditions.map(c => {
      const key = Object.keys(c)[0];
      const value = c[key];
      if (typeof value === 'boolean') {
        return `${key}.is.${value}`;
      }
      return `${key}.eq.${value}`;
    }).join(','));
  } else if (conditions.length === 1) {
    const condition = conditions[0];
    const key = Object.keys(condition)[0];
    const value = condition[key];
    return query.eq(key, value);
  }

  return query;
}

/**
 * Check if user can access a specific resource
 */
export async function canAccessResource(
  supabase: SupabaseClient,
  table: string,
  resourceId: string,
  context: RLSContext
): Promise<boolean> {
  const { userId, userRole, organizationId } = context;

  // Super admins can access everything
  if (userRole === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Query the resource
  const { data, error } = await supabase
    .from(table)
    .select('user_id, created_by, organization_id, is_public')
    .eq('id', resourceId)
    .single();

  if (error || !data) {
    return false;
  }

  // Check ownership
  if (data.user_id === userId || data.created_by === userId) {
    return true;
  }

  // Check if public
  if (data.is_public) {
    return true;
  }

  // Check organization access
  if (data.organization_id && data.organization_id === organizationId) {
    if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user can modify a specific resource
 */
export async function canModifyResource(
  supabase: SupabaseClient,
  table: string,
  resourceId: string,
  context: RLSContext
): Promise<boolean> {
  const { userId, userRole, organizationId } = context;

  // Super admins can modify everything
  if (userRole === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Query the resource
  const { data, error } = await supabase
    .from(table)
    .select('user_id, created_by, organization_id')
    .eq('id', resourceId)
    .single();

  if (error || !data) {
    return false;
  }

  // Owner can always modify
  if (data.user_id === userId || data.created_by === userId) {
    return true;
  }

  // Admins can modify organization resources
  if (data.organization_id && data.organization_id === organizationId) {
    if (userRole === UserRole.ADMIN) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// PERMISSION-BASED QUERY HELPERS
// ============================================================================

/**
 * Query builder that requires specific permission
 */
export function withPermission(
  supabase: SupabaseClient,
  table: string,
  context: RLSContext,
  permission: Permission
) {
  const { userRole } = context;

  if (!hasPermission(userRole, permission)) {
    throw new Error(`Missing required permission: ${permission}`);
  }

  let query = supabase.from(table);
  query = applyRLSFilter(query, context);

  return query;
}

/**
 * Query agents with RLS enforcement
 */
export function queryAgents(
  supabase: SupabaseClient,
  context: RLSContext,
  options: QueryOptions = {}
) {
  return withPermission(supabase, 'agents', context, Permission.AGENTS_VIEW);
}

/**
 * Query knowledge documents with RLS enforcement
 */
export function queryKnowledgeDocs(
  supabase: SupabaseClient,
  context: RLSContext,
  options: QueryOptions = {}
) {
  return withPermission(
    supabase,
    'knowledge_documents',
    context,
    Permission.KNOWLEDGE_VIEW
  );
}

/**
 * Query chats with RLS enforcement
 */
export function queryChats(
  supabase: SupabaseClient,
  context: RLSContext,
  options: QueryOptions = {}
) {
  return withPermission(
    supabase,
    'chats',
    context,
    Permission.CHAT_HISTORY_VIEW
  );
}

/**
 * Query prompts with RLS enforcement
 */
export function queryPrompts(
  supabase: SupabaseClient,
  context: RLSContext,
  options: QueryOptions = {}
) {
  return withPermission(
    supabase,
    'prompts',
    context,
    Permission.PROMPTS_VIEW
  );
}

// ============================================================================
// MUTATION HELPERS WITH PERMISSION CHECKS
// ============================================================================

/**
 * Create a resource with permission check and RLS context injection
 */
export async function createResource<T extends Record<string, any>>(
  supabase: SupabaseClient,
  table: string,
  data: T,
  context: RLSContext,
  permission: Permission
): Promise<{ data: T | null; error: any }> {
  const { userId, userRole, organizationId } = context;

  // Check permission
  if (!hasPermission(userRole, permission)) {
    return {
      data: null,
      error: new Error(`Missing required permission: ${permission}`),
    };
  }

  // Inject RLS context
  const resourceData = {
    ...data,
    user_id: userId,
    created_by: userId,
    ...(organizationId && { organization_id: organizationId }),
  };

  return await supabase.from(table).insert(resourceData).select().single();
}

/**
 * Update a resource with permission check and ownership validation
 */
export async function updateResource<T extends Record<string, any>>(
  supabase: SupabaseClient,
  table: string,
  resourceId: string,
  updates: Partial<T>,
  context: RLSContext,
  permission: Permission
): Promise<{ data: T | null; error: any }> {
  const { userRole } = context;

  // Check permission
  if (!hasPermission(userRole, permission)) {
    return {
      data: null,
      error: new Error(`Missing required permission: ${permission}`),
    };
  }

  // Check if user can modify this resource
  const canModify = await canModifyResource(supabase, table, resourceId, context);

  if (!canModify) {
    return {
      data: null,
      error: new Error('You do not have permission to modify this resource'),
    };
  }

  // Prevent modifying ownership fields (unless super admin)
  if (userRole !== UserRole.SUPER_ADMIN) {
    delete updates.user_id;
    delete updates.created_by;
    delete updates.organization_id;
  }

  return await supabase
    .from(table)
    .update(updates)
    .eq('id', resourceId)
    .select()
    .single();
}

/**
 * Delete a resource with permission check and ownership validation
 */
export async function deleteResource(
  supabase: SupabaseClient,
  table: string,
  resourceId: string,
  context: RLSContext,
  permission: Permission
): Promise<{ error: any | null }> {
  const { userRole } = context;

  // Check permission
  if (!hasPermission(userRole, permission)) {
    return {
      error: new Error(`Missing required permission: ${permission}`),
    };
  }

  // Check if user can modify this resource
  const canModify = await canModifyResource(supabase, table, resourceId, context);

  if (!canModify) {
    return {
      error: new Error('You do not have permission to delete this resource'),
    };
  }

  const { error } = await supabase.from(table).delete().eq('id', resourceId);

  return { error };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Build RLS context from user session
 */
export function buildRLSContext(
  userId: string,
  userRole: UserRole,
  organizationId?: string
): RLSContext {
  return {
    userId,
    userRole,
    organizationId,
  };
}

/**
 * Extract RLS context from request headers
 */
export function extractRLSContextFromHeaders(
  headers: Headers
): RLSContext | null {
  const userId = headers.get('X-User-Id');
  const userRole = headers.get('X-User-Role') as UserRole;
  const organizationId = headers.get('X-Organization-Id') || undefined;

  if (!userId || !userRole) {
    return null;
  }

  return {
    userId,
    userRole,
    organizationId,
  };
}

/**
 * Inject RLS context into request headers
 */
export function injectRLSContextIntoHeaders(
  headers: Headers,
  context: RLSContext
): Headers {
  const newHeaders = new Headers(headers);
  newHeaders.set('X-User-Id', context.userId);
  newHeaders.set('X-User-Role', context.userRole);
  if (context.organizationId) {
    newHeaders.set('X-Organization-Id', context.organizationId);
  }
  return newHeaders;
}
