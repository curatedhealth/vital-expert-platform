/**
 * Tenant Configuration
 * Canonical tenant ID used across the entire VITAL platform
 *
 * IMPORTANT: All entities (agents, missions, templates, conversations)
 * must use this tenant_id for single-tenant deployment.
 */

// Canonical Tenant - Single source of truth
export const CANONICAL_TENANT_ID = '00000000-0000-0000-0000-000000000001';
export const CANONICAL_TENANT_SLUG = 'vital-platform';
export const CANONICAL_TENANT_NAME = 'VITAL Platform';

// Aliases for backward compatibility (all point to canonical)
export const PLATFORM_TENANT_ID = CANONICAL_TENANT_ID;
export const DEFAULT_TENANT_ID = CANONICAL_TENANT_ID;
export const STARTUP_TENANT_ID = CANONICAL_TENANT_ID;
export const STARTUP_TENANT_SLUG = CANONICAL_TENANT_SLUG;
export const STARTUP_TENANT_NAME = CANONICAL_TENANT_NAME;

