/**
 * Tenant Context Management
 * Handles tenant context propagation to Supabase RLS
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Tenant } from '../types/tenant.types';

/**
 * Set tenant context in Supabase session
 * This propagates to RLS policies via app.tenant_id
 */
export async function setTenantContext(
  supabase: SupabaseClient,
  tenantId: string | null
): Promise<void> {
  if (!tenantId) {
    // Clear tenant context
    await supabase.rpc('set_tenant_context', { p_tenant_id: null });
    return;
  }

  try {
    await supabase.rpc('set_tenant_context', { p_tenant_id: tenantId });
  } catch (error) {
    console.error('Failed to set tenant context:', error);
    throw new Error('Failed to set tenant context');
  }
}

/**
 * Get current tenant context from Supabase session
 */
export async function getCurrentTenantContext(
  supabase: SupabaseClient
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('get_current_tenant_id');

    if (error) {
      console.error('Failed to get tenant context:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to get tenant context:', error);
    return null;
  }
}

/**
 * Get all tenants accessible to current user
 */
export async function getUserTenants(
  supabase: SupabaseClient,
  userId: string
): Promise<Tenant[]> {
  const { data, error } = await supabase
    .from('user_tenants')
    .select(
      `
      tenant_id,
      role,
      is_default,
      tenants (
        id,
        name,
        slug,
        domain,
        type,
        subscription_tier,
        is_active,
        settings,
        resource_limits,
        resource_access_config,
        metadata,
        created_at,
        updated_at
      )
    `
    )
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  if (error) {
    console.error('Failed to get user tenants:', error);
    throw error;
  }

  // Extract tenant data from junction table
  const tenants = data
    .map((ut) => ut.tenants)
    .filter((t): t is Tenant => t !== null);

  return tenants;
}

/**
 * Get user's default tenant
 */
export async function getDefaultTenant(
  supabase: SupabaseClient,
  userId: string
): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('user_tenants')
    .select(
      `
      tenants (
        id,
        name,
        slug,
        domain,
        type,
        subscription_tier,
        is_active,
        settings,
        resource_limits,
        resource_access_config,
        metadata,
        created_at,
        updated_at
      )
    `
    )
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();

  if (error || !data?.tenants) {
    return null;
  }

  return data.tenants as unknown as Tenant;
}

/**
 * Switch user's current tenant
 */
export async function switchTenant(
  supabase: SupabaseClient,
  userId: string,
  tenantId: string
): Promise<void> {
  // Verify user has access to this tenant
  const { data, error } = await supabase
    .from('user_tenants')
    .select('tenant_id')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !data) {
    throw new Error('User does not have access to this tenant');
  }

  // Set as current tenant context
  await setTenantContext(supabase, tenantId);

  // Optionally update user's default tenant
  // (This could be stored in user metadata or local storage)
}

/**
 * Check if user is platform admin
 */
export async function isPlatformAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_platform_admin', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Failed to check platform admin status:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Failed to check platform admin status:', error);
    return false;
  }
}

/**
 * Get tenant by slug (for subdomain/domain-based routing)
 */
export async function getTenantBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Tenant;
}

/**
 * Get tenant by domain (for custom domain routing)
 */
export async function getTenantByDomain(
  supabase: SupabaseClient,
  domain: string
): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('domain', domain)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Tenant;
}

/**
 * Extract tenant identifier from request (subdomain, domain, or query param)
 */
export function extractTenantIdentifier(
  hostname: string,
  queryTenant?: string
): string | null {
  // Priority 1: Query parameter (for testing/development)
  if (queryTenant) {
    return queryTenant;
  }

  // Priority 2: Custom domain (exact match in database)
  // This would be checked against the database

  // Priority 3: Subdomain
  const parts = hostname.split('.');

  // Check for subdomain (e.g., digital-health-startup.vital.expert)
  if (parts.length >= 3) {
    // Extract subdomain (first part)
    const subdomain = parts[0];

    // Skip common subdomains
    if (!['www', 'api', 'app'].includes(subdomain)) {
      return subdomain;
    }
  }

  return null;
}
