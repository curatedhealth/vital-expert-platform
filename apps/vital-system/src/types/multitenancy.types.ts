/**
 * Multitenancy Type Definitions
 * VITAL Expert Platform MVP
 */

// ============================================================================
// TENANT TYPES
// ============================================================================

export type TenantType = 'system' | 'digital_health' | 'pharmaceuticals' | 'standard';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tenant_type: TenantType;
  tenant_key: string;
  subscription_tier: 'starter' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'trial' | 'cancelled';
  trial_ends_at?: string;
  max_projects: number;
  max_users: number;
  is_active: boolean;
  settings: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FEATURE FLAG TYPES
// ============================================================================

export type FeatureFlagCategory = 'apps' | 'agents' | 'domains' | 'compliance' | 'analytics' | 'ui';

export interface FeatureFlag {
  id: string;
  flag_key: string;
  name: string;
  description?: string;
  category: FeatureFlagCategory;
  default_enabled: boolean;
  available_tiers: string[];
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantFeatureFlag {
  id: string;
  tenant_id: string;
  feature_flag_id: string;
  enabled: boolean;
  config: Record<string, any>;
  notes?: string;
  enabled_by?: string;
  created_at: string;
  updated_at: string;

  // Joined fields
  feature_flag?: FeatureFlag;
}

// ============================================================================
// TENANT APP TYPES
// ============================================================================

export interface TenantApp {
  id: string;
  tenant_id: string;
  app_key: string;
  app_name: string;
  app_description?: string;
  app_route?: string;
  app_icon?: string;
  is_visible: boolean;
  is_enabled: boolean;
  display_order: number;
  required_role?: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TENANT CONFIGURATION TYPES
// ============================================================================

export interface UIConfig {
  theme: 'default' | 'dark' | 'light';
  primary_color: string;
  logo_url?: string;
  favicon_url?: string;
  custom_css?: string;
  show_tenant_switcher?: boolean;
}

export interface ComplianceSettings {
  hipaa_enabled: boolean;
  gdpr_enabled: boolean;
  phi_allowed: boolean;
  pii_allowed: boolean;
  audit_logging: boolean;
  data_retention_days: number;
  right_to_erasure: boolean;
  data_portability: boolean;
  consent_management: boolean;
  requires_21_cfr_part_11?: boolean;
  data_protection_officer?: string;
  privacy_policy_url?: string;
}

export interface ResourceLimits {
  max_agents: number;
  max_conversations: number;
  max_documents: number;
  max_storage_mb: number;
  max_api_calls_per_day: number;
}

export interface AgentSettings {
  auto_create_enabled?: boolean;
  max_custom_agents?: number;
  allowed_model_providers?: string[];
  default_model?: string;
}

export interface TenantConfiguration {
  id: string;
  tenant_id: string;
  ui_config: UIConfig;
  enabled_features: string[];
  disabled_features: string[];
  enabled_apps: string[];
  app_settings: Record<string, any>;
  enabled_agent_tiers: number[];
  enabled_knowledge_domains: string[];
  agent_settings: AgentSettings;
  limits: ResourceLimits;
  compliance_settings: ComplianceSettings;
  integrations: Record<string, any>;
  custom_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TENANT AGENT TYPES
// ============================================================================

export interface TenantAgent {
  id: string;
  tenant_id: string;
  agent_id: string;
  is_enabled: boolean;
  custom_config: Record<string, any>;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TENANT CONTEXT
// ============================================================================

export interface TenantContext {
  tenant: Organization;
  configuration: TenantConfiguration;
  apps: TenantApp[];
  featureFlags: Map<string, boolean>;
  isLoading: boolean;
  error?: Error;
}

// ============================================================================
// SERVICE OPTIONS
// ============================================================================

export interface GetTenantConfigOptions {
  includeApps?: boolean;
  includeFeatureFlags?: boolean;
  includeAgents?: boolean;
}

export interface FeatureFlagCheckOptions {
  userId?: string;
  checkTier?: boolean;
  defaultValue?: boolean;
}

export interface GetTenantAppsOptions {
  visibleOnly?: boolean;
  enabledOnly?: boolean;
  includeConfig?: boolean;
  role?: string;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface TenantConfigResponse {
  success: boolean;
  data?: TenantConfiguration;
  error?: string;
}

export interface FeatureFlagResponse {
  success: boolean;
  data?: {
    flag_key: string;
    enabled: boolean;
    config?: Record<string, any>;
  };
  error?: string;
}

export interface TenantAppsResponse {
  success: boolean;
  data?: TenantApp[];
  error?: string;
}

export interface TenantAgentsResponse {
  success: boolean;
  data?: {
    agent_id: string;
    agent_name: string;
    agent_tier: number;
    agent_domains: string[];
  }[];
  error?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface TenantSwitcherItem {
  id: string;
  name: string;
  slug: string;
  tenant_type: TenantType;
  tenant_key: string;
  icon?: string;
  is_active: boolean;
}

export interface FeatureFlagCheck {
  flag_key: string;
  enabled: boolean;
  reason?: string;
}

export interface TenantValidation {
  isValid: boolean;
  tenant?: Organization;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TENANT_TYPES: Record<TenantType, string> = {
  system: 'VITAL Expert Platform',
  digital_health: 'Digital Health',
  pharmaceuticals: 'Pharmaceuticals',
  standard: 'Standard',
};

export const SUBSCRIPTION_TIERS = {
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
} as const;

export const FEATURE_CATEGORIES = {
  APPS: 'apps',
  AGENTS: 'agents',
  DOMAINS: 'domains',
  COMPLIANCE: 'compliance',
  ANALYTICS: 'analytics',
  UI: 'ui',
} as const;

export const DEFAULT_TENANT_KEYS = {
  SYSTEM: 'vital-system',
  DIGITAL_HEALTH: 'digital-health',
  PHARMA: 'pharma',
} as const;
