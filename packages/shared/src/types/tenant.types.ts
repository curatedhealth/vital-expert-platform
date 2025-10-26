/**
 * Multi-Tenant Type Definitions
 * Core types for VITAL Platform multi-tenant architecture
 */

export type TenantType = 'client' | 'solution' | 'industry' | 'platform';

export type SubscriptionTier = 'free' | 'standard' | 'professional' | 'enterprise';

export type SharingMode = 'private' | 'global' | 'selective';

export type ResourceType = 'platform' | 'custom' | 'shared' | 'tenant_specific';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  type: TenantType;
  parent_tenant_id: string | null;
  subscription_tier: SubscriptionTier;
  is_active: boolean;
  settings: Record<string, unknown>;
  resource_limits: {
    max_agents?: number;
    max_users?: number;
    max_storage_gb?: number;
    max_api_calls_per_day?: number;
  };
  resource_access_config: {
    can_access_platform_agents?: boolean;
    can_access_parent_agents?: boolean;
    can_create_custom_agents?: boolean;
    can_share_agents?: boolean;
  };
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UserTenant {
  user_id: string;
  tenant_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  is_default: boolean;
  permissions: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TenantContext {
  currentTenant: Tenant | null;
  availableTenants: Tenant[];
  userRole: UserTenant['role'] | null;
  isPlatformAdmin: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
}

export interface TenantResource {
  tenant_id: string | null;
  is_shared: boolean;
  sharing_mode: SharingMode;
  shared_with: string[];
  resource_type: ResourceType;
}

export interface AgentWithTenant {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  capabilities: string[];
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
  // Tenant fields
  tenant_id: string | null;
  is_shared: boolean;
  sharing_mode: SharingMode;
  shared_with: string[];
  resource_type: ResourceType;
}

export interface TenantAgent extends TenantResource {
  agent_id: string;
  is_enabled: boolean;
  custom_config: Record<string, unknown>;
  created_at: string;
}

// Platform constants
export const PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export const DEFAULT_RESOURCE_LIMITS = {
  free: {
    max_agents: 5,
    max_users: 3,
    max_storage_gb: 1,
    max_api_calls_per_day: 1000,
  },
  standard: {
    max_agents: 25,
    max_users: 10,
    max_storage_gb: 10,
    max_api_calls_per_day: 10000,
  },
  professional: {
    max_agents: 100,
    max_users: 50,
    max_storage_gb: 50,
    max_api_calls_per_day: 50000,
  },
  enterprise: {
    max_agents: -1, // unlimited
    max_users: -1,
    max_storage_gb: -1,
    max_api_calls_per_day: -1,
  },
} as const;

// Type guards
export function isTenantResource(obj: unknown): obj is TenantResource {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'is_shared' in obj &&
    'sharing_mode' in obj
  );
}

export function isPlatformTenant(tenant: Tenant | null): boolean {
  return tenant?.id === PLATFORM_TENANT_ID;
}

export function canAccessResource(
  resource: TenantResource,
  currentTenantId: string | null,
  isPlatformAdmin: boolean
): boolean {
  // Platform admins can access everything
  if (isPlatformAdmin) return true;

  // No tenant context
  if (!currentTenantId) return false;

  // Resource belongs to current tenant
  if (resource.tenant_id === currentTenantId) return true;

  // Resource is not shared
  if (!resource.is_shared) return false;

  // Global sharing
  if (resource.sharing_mode === 'global') return true;

  // Selective sharing
  if (
    resource.sharing_mode === 'selective' &&
    resource.shared_with.includes(currentTenantId)
  ) {
    return true;
  }

  return false;
}
