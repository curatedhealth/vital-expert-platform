# VITAL Expert Platform: Multi-Tenant Data Architecture Strategy

## Executive Summary

This document defines the comprehensive data architecture strategy for implementing multi-tenancy in the VITAL Expert Platform MVP with three distinct tenants:

1. **VITAL Expert Platform** (main/system tenant) - Full feature access
2. **Digital Health** - Digital health apps & agents
3. **Pharmaceuticals** - Pharma-specific features & compliance

## Current State Analysis

### Existing Database Architecture

**Organizations Table**
- Primary tenant identifier: `organizations.id`
- Fields: `id`, `name`, `domain`, `industry`, `size`, `country`, `settings` (JSONB), `created_at`, `updated_at`
- Users link via `user_profiles.organization_id` or `user_organizations` join table

**RAG Tenants Table**
- Separate tenant system: `rag_tenants`
- Fields: `id`, `name`, `domain`, `tenant_type` ('super_admin' | 'user'), `user_id`, `subscription_tier`, `settings` (JSONB)
- Used exclusively for RAG/knowledge base isolation
- Has two-tier system: super_admin vs user tenants

**Multi-Tenant Tables** (already tenant-aware via `organization_id`)
- `chat_sessions`
- `documents`
- `knowledge_base`
- `projects`
- `workflows`
- `knowledge_documents`

**RLS Policies**
- Exist on most tables
- Filter by `organization_id` in user context
- RAG system uses separate tenant isolation via `rag_tenants`

### Identified Gaps

1. **Dual Tenant Systems**: `organizations` vs `rag_tenants` creates confusion and duplication
2. **No Feature Flags**: No system to enable/disable features per tenant
3. **No App Visibility Control**: Can't control which apps/routes are visible per tenant
4. **No Tenant Switcher**: Users can't switch between tenants (if multi-tenant access)
5. **Missing Configuration**: No structured tenant-specific settings (colors, logos, domains)
6. **No Tenant Lifecycle**: No activation/deactivation, billing status, or usage limits

## Recommended Architecture: Unified Multi-Tenancy Model

### Strategy: Shared Database with RLS (Current + Enhanced)

**Why This Approach?**
- Already implemented and working
- Cost-effective for MVP and scale
- Strong isolation via PostgreSQL RLS
- Easier to maintain single schema
- Better for analytics across tenants
- HIPAA compliant when properly configured

**Trade-offs Accepted:**
- Single point of failure (mitigated by Supabase HA)
- Noisy neighbor potential (mitigated by connection pooling + monitoring)
- Schema changes affect all tenants (acceptable for MVP)

### Unified Tenant Model

**Recommendation: Merge organizations + rag_tenants into single source of truth**

```
organizations (PRIMARY tenant table)
├── Core tenant info (name, domain, slug)
├── Tier & status (starter/professional/enterprise, active/suspended)
├── Feature flags (inherited from tier + custom overrides)
├── Settings (JSONB: branding, limits, integrations)
└── Billing info

rag_tenants (DEPRECATED - migrate to organizations)
└── Keep for backward compatibility during migration
```

**Migration Path:**
1. Add missing columns to `organizations` table
2. Migrate `rag_tenants` data to `organizations`
3. Update all `tenant_id` references to use `organization_id`
4. Create views for backward compatibility
5. Deprecate `rag_tenants` in Phase 2

## Database Schema Design

### 1. Enhanced Organizations Table

```sql
-- Enhanced organizations table (primary tenant table)
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'starter'
    CHECK (tier IN ('starter', 'professional', 'enterprise', 'custom')),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'trial', 'suspended', 'cancelled')),
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id),

  -- Tenant branding
  ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{
    "primary_color": "#0066CC",
    "logo_url": null,
    "favicon_url": null,
    "custom_css": null
  }',

  -- Billing info
  ADD COLUMN IF NOT EXISTS billing_info JSONB DEFAULT '{
    "stripe_customer_id": null,
    "subscription_id": null,
    "current_period_end": null,
    "cancel_at_period_end": false
  }',

  -- Usage limits (enforced by tier + custom overrides)
  ADD COLUMN IF NOT EXISTS limits JSONB DEFAULT '{
    "max_users": 10,
    "max_agents": 50,
    "max_documents": 1000,
    "max_storage_gb": 10,
    "api_rate_limit_per_hour": 1000
  }',

  -- Tenant metadata
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_tier ON organizations(tier);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);

-- Add check constraint for slug format (lowercase, alphanumeric + hyphens)
ALTER TABLE organizations
  ADD CONSTRAINT organizations_slug_format
  CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
```

### 2. Tenant Configuration Tables

```sql
-- ============================================================================
-- FEATURE FLAGS SYSTEM
-- ============================================================================

-- Global feature flag registry (platform-wide available features)
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'core', 'ai', 'compliance', 'analytics', 'integrations'

  -- Default state for new tenants
  default_enabled BOOLEAN DEFAULT false,

  -- Tier availability (which tiers can access this feature)
  available_in_tiers TEXT[] DEFAULT ARRAY['enterprise'], -- ['starter', 'professional', 'enterprise', 'custom']

  -- Feature metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Per-tenant feature flag overrides
CREATE TABLE tenant_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL REFERENCES feature_flags(key) ON DELETE CASCADE,

  -- Override: enabled/disabled for this specific tenant
  enabled BOOLEAN NOT NULL,

  -- Why was this override applied? (for audit trail)
  override_reason TEXT,

  -- Custom configuration for this feature (if needed)
  config JSONB DEFAULT '{}',

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, feature_key)
);

-- ============================================================================
-- TENANT APP VISIBILITY CONFIGURATION
-- ============================================================================

-- Define all apps/routes available in the platform
CREATE TABLE platform_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, -- 'expert-panel', 'digital-health', 'pharma-compliance'
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Icon identifier
  route TEXT, -- Base route (e.g., '/apps/expert-panel')
  category TEXT, -- 'core', 'healthcare', 'pharmaceutical', 'digital-health'

  -- Default visibility
  default_visible BOOLEAN DEFAULT true,

  -- Tier availability
  available_in_tiers TEXT[] DEFAULT ARRAY['enterprise'],

  -- Required feature flags (app only visible if all flags are enabled)
  required_features TEXT[] DEFAULT '{}',

  -- App metadata
  metadata JSONB DEFAULT '{}',

  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Per-tenant app visibility overrides
CREATE TABLE tenant_app_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  app_key TEXT NOT NULL REFERENCES platform_apps(key) ON DELETE CASCADE,

  -- Visibility override
  visible BOOLEAN NOT NULL,

  -- Custom configuration (e.g., rename app for this tenant)
  custom_config JSONB DEFAULT '{
    "custom_name": null,
    "custom_icon": null,
    "custom_route": null
  }',

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, app_key)
);

-- ============================================================================
-- TENANT SETTINGS (STRUCTURED)
-- ============================================================================

CREATE TABLE tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- General settings
  general JSONB DEFAULT '{
    "timezone": "America/New_York",
    "date_format": "MM/DD/YYYY",
    "language": "en-US",
    "currency": "USD"
  }',

  -- Security settings
  security JSONB DEFAULT '{
    "session_timeout_minutes": 30,
    "require_2fa": false,
    "password_policy": {
      "min_length": 8,
      "require_uppercase": true,
      "require_lowercase": true,
      "require_numbers": true,
      "require_special_chars": true
    },
    "allowed_ip_ranges": [],
    "sso_enabled": false,
    "sso_provider": null
  }',

  -- AI/ML settings
  ai_config JSONB DEFAULT '{
    "default_model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000,
    "enable_rag": true,
    "enable_custom_agents": true,
    "content_moderation": true
  }',

  -- Compliance settings (HIPAA, GDPR, etc.)
  compliance JSONB DEFAULT '{
    "hipaa_enabled": false,
    "gdpr_enabled": false,
    "data_retention_days": 2555,
    "audit_all_access": true,
    "phi_encryption": "AES-256",
    "require_baa": false
  }',

  -- Notification settings
  notifications JSONB DEFAULT '{
    "email_enabled": true,
    "sms_enabled": false,
    "in_app_enabled": true,
    "digest_frequency": "daily"
  }',

  -- Integration settings
  integrations JSONB DEFAULT '{
    "enabled_integrations": [],
    "webhooks": []
  }',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_tenant_feature_flags_org ON tenant_feature_flags(organization_id);
CREATE INDEX idx_tenant_feature_flags_feature ON tenant_feature_flags(feature_key);
CREATE INDEX idx_tenant_app_visibility_org ON tenant_app_visibility(organization_id);
CREATE INDEX idx_tenant_app_visibility_app ON tenant_app_visibility(app_key);
CREATE INDEX idx_platform_apps_key ON platform_apps(key);
CREATE INDEX idx_platform_apps_category ON platform_apps(category);
CREATE INDEX idx_platform_apps_active ON platform_apps(is_active) WHERE is_active = true;
CREATE INDEX idx_tenant_settings_org ON tenant_settings(organization_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_app_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;

-- Feature flags: everyone can read, only admins can manage
CREATE POLICY "Anyone can view feature flags"
  ON feature_flags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only service role can manage feature flags"
  ON feature_flags FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Tenant feature flags: users can only see their organization's overrides
CREATE POLICY "Users can view their org's feature flags"
  ON tenant_feature_flags FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can manage feature flags"
  ON tenant_feature_flags FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Platform apps: everyone can read
CREATE POLICY "Anyone can view platform apps"
  ON platform_apps FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Tenant app visibility: users can view their org's visibility settings
CREATE POLICY "Users can view their org's app visibility"
  ON tenant_app_visibility FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can manage app visibility"
  ON tenant_app_visibility FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Tenant settings: users can view, admins can manage
CREATE POLICY "Users can view their org's settings"
  ON tenant_settings FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can manage settings"
  ON tenant_settings FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get effective feature flags for a tenant (tier defaults + overrides)
CREATE OR REPLACE FUNCTION get_tenant_features(p_organization_id UUID)
RETURNS TABLE (
  feature_key TEXT,
  feature_name TEXT,
  enabled BOOLEAN,
  source TEXT -- 'tier_default' | 'override'
)
LANGUAGE sql STABLE
AS $$
  WITH org_tier AS (
    SELECT tier FROM organizations WHERE id = p_organization_id
  ),
  tier_features AS (
    -- Features available in this tier by default
    SELECT
      ff.key as feature_key,
      ff.name as feature_name,
      ff.default_enabled as enabled,
      'tier_default'::TEXT as source
    FROM feature_flags ff, org_tier ot
    WHERE ot.tier = ANY(ff.available_in_tiers)
  ),
  overrides AS (
    -- Tenant-specific overrides
    SELECT
      tff.feature_key,
      ff.name as feature_name,
      tff.enabled,
      'override'::TEXT as source
    FROM tenant_feature_flags tff
    JOIN feature_flags ff ON tff.feature_key = ff.key
    WHERE tff.organization_id = p_organization_id
  )
  -- Combine: overrides take precedence over tier defaults
  SELECT
    COALESCE(o.feature_key, tf.feature_key) as feature_key,
    COALESCE(o.feature_name, tf.feature_name) as feature_name,
    COALESCE(o.enabled, tf.enabled) as enabled,
    COALESCE(o.source, tf.source) as source
  FROM tier_features tf
  FULL OUTER JOIN overrides o ON tf.feature_key = o.feature_key;
$$;

-- Check if tenant has specific feature enabled
CREATE OR REPLACE FUNCTION tenant_has_feature(
  p_organization_id UUID,
  p_feature_key TEXT
)
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    (SELECT enabled FROM get_tenant_features(p_organization_id)
     WHERE feature_key = p_feature_key),
    false
  );
$$;

-- Get visible apps for a tenant (tier defaults + overrides + feature requirements)
CREATE OR REPLACE FUNCTION get_tenant_visible_apps(p_organization_id UUID)
RETURNS TABLE (
  app_key TEXT,
  app_name TEXT,
  app_route TEXT,
  app_icon TEXT,
  app_category TEXT,
  custom_config JSONB,
  display_order INTEGER
)
LANGUAGE sql STABLE
AS $$
  WITH org_tier AS (
    SELECT tier FROM organizations WHERE id = p_organization_id
  ),
  tier_apps AS (
    -- Apps available in this tier by default
    SELECT
      pa.key as app_key,
      pa.name as app_name,
      pa.route as app_route,
      pa.icon as app_icon,
      pa.category as app_category,
      pa.default_visible as visible,
      pa.required_features,
      '{}'::JSONB as custom_config,
      pa.display_order
    FROM platform_apps pa, org_tier ot
    WHERE ot.tier = ANY(pa.available_in_tiers)
      AND pa.is_active = true
  ),
  overrides AS (
    -- Tenant-specific visibility overrides
    SELECT
      tav.app_key,
      pa.name as app_name,
      pa.route as app_route,
      pa.icon as app_icon,
      pa.category as app_category,
      tav.visible,
      pa.required_features,
      tav.custom_config,
      pa.display_order
    FROM tenant_app_visibility tav
    JOIN platform_apps pa ON tav.app_key = pa.key
    WHERE tav.organization_id = p_organization_id
  ),
  combined AS (
    -- Combine: overrides take precedence
    SELECT
      COALESCE(o.app_key, ta.app_key) as app_key,
      COALESCE(o.app_name, ta.app_name) as app_name,
      COALESCE(o.app_route, ta.app_route) as app_route,
      COALESCE(o.app_icon, ta.app_icon) as app_icon,
      COALESCE(o.app_category, ta.app_category) as app_category,
      COALESCE(o.visible, ta.visible) as visible,
      COALESCE(o.required_features, ta.required_features) as required_features,
      COALESCE(o.custom_config, ta.custom_config) as custom_config,
      COALESCE(o.display_order, ta.display_order) as display_order
    FROM tier_apps ta
    FULL OUTER JOIN overrides o ON ta.app_key = o.app_key
  )
  -- Filter: only visible apps where all required features are enabled
  SELECT
    c.app_key,
    COALESCE(c.custom_config->>'custom_name', c.app_name) as app_name,
    COALESCE(c.custom_config->>'custom_route', c.app_route) as app_route,
    COALESCE(c.custom_config->>'custom_icon', c.app_icon) as app_icon,
    c.app_category,
    c.custom_config,
    c.display_order
  FROM combined c
  WHERE c.visible = true
    -- Check if all required features are enabled
    AND (
      c.required_features = '{}'
      OR NOT EXISTS (
        SELECT 1 FROM unnest(c.required_features) AS rf(feature_key)
        WHERE NOT tenant_has_feature(p_organization_id, rf.feature_key)
      )
    )
  ORDER BY c.display_order, c.app_name;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_feature_flags_updated_at BEFORE UPDATE ON tenant_feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_apps_updated_at BEFORE UPDATE ON platform_apps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_app_visibility_updated_at BEFORE UPDATE ON tenant_app_visibility
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_settings_updated_at BEFORE UPDATE ON tenant_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Data Migration Strategy

### Phase 1: Add New Tables (Non-Breaking)

**Goal:** Add new tenant configuration tables without affecting existing functionality.

**Steps:**
1. Run migration to create new tables (above SQL)
2. Seed with default data for three MVP tenants
3. Deploy but don't enforce yet (read-only access)
4. Validate data integrity

**Rollback Plan:**
- Simply drop new tables
- No impact on existing functionality

### Phase 2: Unify Tenant Model

**Goal:** Migrate `rag_tenants` to `organizations` and deprecate dual system.

**Steps:**

```sql
-- Step 1: Ensure all organizations have slugs
UPDATE organizations
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Step 2: Add tenant_type to organizations for backward compatibility
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS tenant_type TEXT DEFAULT 'organization'
    CHECK (tenant_type IN ('system', 'organization', 'user'));

-- Step 3: Migrate rag_tenants to organizations (if not already exists)
INSERT INTO organizations (id, name, slug, domain, tier, tenant_type, settings, created_at, updated_at)
SELECT
  rt.id,
  rt.name,
  lower(regexp_replace(rt.name, '[^a-zA-Z0-9]+', '-', 'g')) as slug,
  rt.domain,
  CASE
    WHEN rt.subscription_tier = 'enterprise' THEN 'enterprise'
    WHEN rt.subscription_tier = 'professional' THEN 'professional'
    ELSE 'starter'
  END as tier,
  CASE
    WHEN rt.tenant_type = 'super_admin' THEN 'system'
    WHEN rt.tenant_type = 'user' THEN 'user'
    ELSE 'organization'
  END as tenant_type,
  rt.settings,
  rt.created_at,
  rt.updated_at
FROM rag_tenants rt
WHERE NOT EXISTS (
  SELECT 1 FROM organizations o WHERE o.id = rt.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Update all rag_knowledge_sources to use organization_id
ALTER TABLE rag_knowledge_sources
  RENAME COLUMN tenant_id TO organization_id;

-- Step 5: Update all rag_search_analytics to use organization_id
ALTER TABLE rag_search_analytics
  RENAME COLUMN tenant_id TO organization_id;

-- Step 6: Update foreign keys
ALTER TABLE rag_knowledge_sources
  DROP CONSTRAINT IF EXISTS rag_knowledge_sources_tenant_id_fkey,
  ADD CONSTRAINT rag_knowledge_sources_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE rag_search_analytics
  DROP CONSTRAINT IF EXISTS rag_search_analytics_tenant_id_fkey,
  ADD CONSTRAINT rag_search_analytics_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Step 7: Create view for backward compatibility
CREATE OR REPLACE VIEW rag_tenants AS
SELECT
  id,
  name,
  domain,
  CASE
    WHEN tenant_type = 'system' THEN 'super_admin'
    WHEN tenant_type = 'user' THEN 'user'
    ELSE 'organization'
  END as tenant_type,
  NULL::UUID as user_id, -- Deprecated, use user_organizations instead
  tier as subscription_tier,
  settings,
  created_at,
  updated_at
FROM organizations;

-- Step 8: Update search function to use organization_id
CREATE OR REPLACE FUNCTION search_rag_knowledge(
    query_embedding vector(1536),
    p_organization_id UUID DEFAULT NULL, -- Changed from p_tenant_id
    p_agent_id UUID DEFAULT NULL,
    p_domain VARCHAR DEFAULT NULL,
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10,
    include_global BOOLEAN DEFAULT true
)
RETURNS TABLE (
    chunk_id UUID,
    source_id UUID,
    content TEXT,
    similarity FLOAT,
    source_name VARCHAR(500),
    domain VARCHAR(200),
    is_global BOOLEAN,
    agent_id UUID,
    section_title VARCHAR(500),
    metadata JSONB
)
LANGUAGE sql STABLE
AS $$
    SELECT
        kc.id AS chunk_id,
        kc.source_id,
        kc.content,
        1 - (kc.embedding <=> query_embedding) AS similarity,
        ks.name AS source_name,
        ks.domain,
        ks.is_global,
        ks.agent_id,
        kc.section_title,
        ks.metadata
    FROM rag_knowledge_chunks kc
    JOIN rag_knowledge_sources ks ON kc.source_id = ks.id
    WHERE
        1 - (kc.embedding <=> query_embedding) > match_threshold
        AND (p_organization_id IS NULL OR ks.organization_id = p_organization_id)
        AND (
            (include_global AND ks.is_global = true)
            OR (p_agent_id IS NOT NULL AND ks.agent_id = p_agent_id)
        )
        AND (p_domain IS NULL OR ks.domain = p_domain)
        AND ks.processing_status = 'completed'
    ORDER BY (kc.embedding <=> query_embedding)
    LIMIT match_count;
$$;
```

**Rollback Plan:**
- Restore `rag_tenants` table from backup
- Revert column renames
- Drop view

### Phase 3: Seed MVP Tenants

```sql
-- ============================================================================
-- SEED DATA FOR MVP TENANTS
-- ============================================================================

-- 1. VITAL Expert Platform (System Tenant)
INSERT INTO organizations (
  id,
  name,
  slug,
  domain,
  tier,
  status,
  tenant_type,
  settings,
  branding,
  limits
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Fixed UUID for system tenant
  'VITAL Expert Platform',
  'vital-expert-platform',
  'vitalexpert.com',
  'custom',
  'active',
  'system',
  '{
    "description": "Main VITAL Expert Platform - full feature access for all healthcare AI applications"
  }',
  '{
    "primary_color": "#0066CC",
    "logo_url": "/logos/vital-expert-platform.svg",
    "favicon_url": "/favicons/vital-expert-platform.ico"
  }',
  '{
    "max_users": -1,
    "max_agents": -1,
    "max_documents": -1,
    "max_storage_gb": -1,
    "api_rate_limit_per_hour": -1
  }'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  domain = EXCLUDED.domain,
  tier = EXCLUDED.tier,
  status = EXCLUDED.status,
  tenant_type = EXCLUDED.tenant_type,
  settings = EXCLUDED.settings,
  branding = EXCLUDED.branding,
  limits = EXCLUDED.limits;

-- 2. Digital Health Tenant
INSERT INTO organizations (
  id,
  name,
  slug,
  domain,
  tier,
  status,
  tenant_type,
  settings,
  branding,
  limits
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Digital Health',
  'digital-health',
  'digitalhealth.vitalexpert.com',
  'professional',
  'active',
  'organization',
  '{
    "description": "Digital health applications and AI agents for consumer health apps",
    "focus_areas": ["consumer_health", "wellness_apps", "health_tracking", "telemedicine"]
  }',
  '{
    "primary_color": "#00C896",
    "logo_url": "/logos/digital-health.svg",
    "favicon_url": "/favicons/digital-health.ico"
  }',
  '{
    "max_users": 50,
    "max_agents": 100,
    "max_documents": 5000,
    "max_storage_gb": 50,
    "api_rate_limit_per_hour": 5000
  }'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  domain = EXCLUDED.domain,
  tier = EXCLUDED.tier,
  status = EXCLUDED.status,
  settings = EXCLUDED.settings,
  branding = EXCLUDED.branding,
  limits = EXCLUDED.limits;

-- 3. Pharmaceuticals Tenant
INSERT INTO organizations (
  id,
  name,
  slug,
  domain,
  tier,
  status,
  tenant_type,
  settings,
  branding,
  limits
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Pharmaceuticals',
  'pharmaceuticals',
  'pharma.vitalexpert.com',
  'enterprise',
  'active',
  'organization',
  '{
    "description": "Pharmaceutical industry AI agents and compliance tools",
    "focus_areas": ["regulatory_compliance", "clinical_trials", "medical_affairs", "pharmacovigilance"]
  }',
  '{
    "primary_color": "#6366F1",
    "logo_url": "/logos/pharmaceuticals.svg",
    "favicon_url": "/favicons/pharmaceuticals.ico"
  }',
  '{
    "max_users": 100,
    "max_agents": 200,
    "max_documents": 10000,
    "max_storage_gb": 100,
    "api_rate_limit_per_hour": 10000
  }'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  domain = EXCLUDED.domain,
  tier = EXCLUDED.tier,
  status = EXCLUDED.status,
  settings = EXCLUDED.settings,
  branding = EXCLUDED.branding,
  limits = EXCLUDED.limits;

-- ============================================================================
-- SEED FEATURE FLAGS
-- ============================================================================

INSERT INTO feature_flags (key, name, description, category, default_enabled, available_in_tiers) VALUES
  -- Core Features
  ('ai_chat', 'AI Chat', 'Chat with AI agents', 'core', true, ARRAY['starter', 'professional', 'enterprise', 'custom']),
  ('knowledge_base', 'Knowledge Base', 'Document upload and RAG', 'core', true, ARRAY['professional', 'enterprise', 'custom']),
  ('custom_agents', 'Custom Agents', 'Create custom AI agents', 'ai', false, ARRAY['professional', 'enterprise', 'custom']),
  ('multi_agent_panels', 'Multi-Agent Panels', 'Expert panel discussions', 'ai', false, ARRAY['enterprise', 'custom']),

  -- AI Features
  ('gpt4_access', 'GPT-4 Access', 'Access to GPT-4 models', 'ai', false, ARRAY['professional', 'enterprise', 'custom']),
  ('claude_access', 'Claude Access', 'Access to Anthropic Claude', 'ai', false, ARRAY['enterprise', 'custom']),
  ('image_generation', 'Image Generation', 'DALL-E and Midjourney integration', 'ai', false, ARRAY['enterprise', 'custom']),

  -- Compliance Features
  ('hipaa_compliance', 'HIPAA Compliance', 'HIPAA-compliant data handling', 'compliance', false, ARRAY['enterprise', 'custom']),
  ('audit_logs', 'Audit Logs', 'Comprehensive audit logging', 'compliance', false, ARRAY['professional', 'enterprise', 'custom']),
  ('baa_support', 'BAA Support', 'Business Associate Agreement support', 'compliance', false, ARRAY['enterprise', 'custom']),

  -- Analytics Features
  ('advanced_analytics', 'Advanced Analytics', 'Detailed usage analytics', 'analytics', false, ARRAY['professional', 'enterprise', 'custom']),
  ('custom_reports', 'Custom Reports', 'Build custom reports', 'analytics', false, ARRAY['enterprise', 'custom']),

  -- Integration Features
  ('api_access', 'API Access', 'REST API access', 'integrations', false, ARRAY['professional', 'enterprise', 'custom']),
  ('webhooks', 'Webhooks', 'Outbound webhook support', 'integrations', false, ARRAY['professional', 'enterprise', 'custom']),
  ('sso', 'Single Sign-On', 'SSO integration (SAML, OAuth)', 'integrations', false, ARRAY['enterprise', 'custom'])
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- SEED PLATFORM APPS
-- ============================================================================

INSERT INTO platform_apps (key, name, description, icon, route, category, default_visible, available_in_tiers, required_features, display_order) VALUES
  -- Core Apps (available to all)
  ('dashboard', 'Dashboard', 'Overview and analytics', 'LayoutDashboard', '/dashboard', 'core', true, ARRAY['starter', 'professional', 'enterprise', 'custom'], '{}', 0),
  ('chat', 'AI Chat', 'Chat with AI agents', 'MessageSquare', '/chat', 'core', true, ARRAY['starter', 'professional', 'enterprise', 'custom'], ARRAY['ai_chat'], 10),

  -- Expert Panel Apps
  ('expert-panel', 'Expert Panel', 'Multi-agent expert discussions', 'Users', '/apps/expert-panel', 'core', true, ARRAY['enterprise', 'custom'], ARRAY['multi_agent_panels'], 20),

  -- Digital Health Apps
  ('health-app-builder', 'Health App Builder', 'Build consumer health applications', 'Smartphone', '/apps/health-app-builder', 'digital-health', true, ARRAY['professional', 'enterprise', 'custom'], '{}', 30),
  ('wellness-coach', 'Wellness Coach AI', 'AI-powered wellness coaching', 'Heart', '/apps/wellness-coach', 'digital-health', true, ARRAY['professional', 'enterprise', 'custom'], '{}', 31),
  ('symptom-checker', 'Symptom Checker', 'AI symptom analysis tool', 'Stethoscope', '/apps/symptom-checker', 'digital-health', true, ARRAY['professional', 'enterprise', 'custom'], '{}', 32),

  -- Pharmaceutical Apps
  ('regulatory-compliance', 'Regulatory Compliance', 'FDA/EMA compliance tools', 'Shield', '/apps/regulatory-compliance', 'pharmaceutical', true, ARRAY['enterprise', 'custom'], ARRAY['hipaa_compliance'], 40),
  ('clinical-trials', 'Clinical Trials Manager', 'Manage clinical trial documentation', 'Microscope', '/apps/clinical-trials', 'pharmaceutical', true, ARRAY['enterprise', 'custom'], '{}', 41),
  ('medical-affairs', 'Medical Affairs', 'Medical affairs support tools', 'FileText', '/apps/medical-affairs', 'pharmaceutical', true, ARRAY['enterprise', 'custom'], '{}', 42),
  ('pharmacovigilance', 'Pharmacovigilance', 'Adverse event monitoring', 'AlertTriangle', '/apps/pharmacovigilance', 'pharmaceutical', true, ARRAY['enterprise', 'custom'], ARRAY['hipaa_compliance'], 43),

  -- Admin Apps
  ('settings', 'Settings', 'Tenant configuration', 'Settings', '/settings', 'core', true, ARRAY['starter', 'professional', 'enterprise', 'custom'], '{}', 100)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- CONFIGURE TENANT-SPECIFIC APP VISIBILITY
-- ============================================================================

-- VITAL Expert Platform: All apps visible (system tenant)
-- (No overrides needed - default visibility applies)

-- Digital Health: Hide pharmaceutical apps
INSERT INTO tenant_app_visibility (organization_id, app_key, visible) VALUES
  ('00000000-0000-0000-0000-000000000002', 'regulatory-compliance', false),
  ('00000000-0000-0000-0000-000000000002', 'clinical-trials', false),
  ('00000000-0000-0000-0000-000000000002', 'medical-affairs', false),
  ('00000000-0000-0000-0000-000000000002', 'pharmacovigilance', false)
ON CONFLICT (organization_id, app_key) DO UPDATE SET visible = EXCLUDED.visible;

-- Pharmaceuticals: Hide digital health apps
INSERT INTO tenant_app_visibility (organization_id, app_key, visible) VALUES
  ('00000000-0000-0000-0000-000000000003', 'health-app-builder', false),
  ('00000000-0000-0000-0000-000000000003', 'wellness-coach', false),
  ('00000000-0000-0000-0000-000000000003', 'symptom-checker', false)
ON CONFLICT (organization_id, app_key) DO UPDATE SET visible = EXCLUDED.visible;

-- ============================================================================
-- CONFIGURE TENANT-SPECIFIC FEATURE FLAGS
-- ============================================================================

-- VITAL Expert Platform: Enable all features (system tenant)
INSERT INTO tenant_feature_flags (organization_id, feature_key, enabled, override_reason)
SELECT
  '00000000-0000-0000-0000-000000000001',
  key,
  true,
  'System tenant - full access'
FROM feature_flags
ON CONFLICT (organization_id, feature_key) DO UPDATE SET enabled = EXCLUDED.enabled;

-- Digital Health: Enable digital health specific features
INSERT INTO tenant_feature_flags (organization_id, feature_key, enabled, override_reason) VALUES
  ('00000000-0000-0000-0000-000000000002', 'gpt4_access', true, 'Professional tier upgrade'),
  ('00000000-0000-0000-0000-000000000002', 'custom_agents', true, 'Professional tier upgrade'),
  ('00000000-0000-0000-0000-000000000002', 'advanced_analytics', true, 'Professional tier upgrade')
ON CONFLICT (organization_id, feature_key) DO UPDATE SET enabled = EXCLUDED.enabled;

-- Pharmaceuticals: Enable compliance features
INSERT INTO tenant_feature_flags (organization_id, feature_key, enabled, override_reason) VALUES
  ('00000000-0000-0000-0000-000000000003', 'hipaa_compliance', true, 'Enterprise tier - required'),
  ('00000000-0000-0000-0000-000000000003', 'baa_support', true, 'Enterprise tier - required'),
  ('00000000-0000-0000-0000-000000000003', 'audit_logs', true, 'Enterprise tier - required'),
  ('00000000-0000-0000-0000-000000000003', 'multi_agent_panels', true, 'Enterprise tier feature'),
  ('00000000-0000-0000-0000-000000000003', 'gpt4_access', true, 'Enterprise tier feature'),
  ('00000000-0000-0000-0000-000000000003', 'claude_access', true, 'Enterprise tier feature'),
  ('00000000-0000-0000-0000-000000000003', 'api_access', true, 'Enterprise tier feature'),
  ('00000000-0000-0000-0000-000000000003', 'sso', true, 'Enterprise tier feature')
ON CONFLICT (organization_id, feature_key) DO UPDATE SET enabled = EXCLUDED.enabled;

-- ============================================================================
-- CREATE TENANT SETTINGS
-- ============================================================================

-- VITAL Expert Platform settings
INSERT INTO tenant_settings (organization_id, compliance) VALUES
  ('00000000-0000-0000-0000-000000000001', '{
    "hipaa_enabled": true,
    "gdpr_enabled": true,
    "data_retention_days": 2555,
    "audit_all_access": true,
    "phi_encryption": "AES-256",
    "require_baa": false
  }')
ON CONFLICT (organization_id) DO NOTHING;

-- Digital Health settings
INSERT INTO tenant_settings (organization_id, ai_config, compliance) VALUES
  ('00000000-0000-0000-0000-000000000002',
  '{
    "default_model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000,
    "enable_rag": true,
    "enable_custom_agents": true,
    "content_moderation": true
  }',
  '{
    "hipaa_enabled": false,
    "gdpr_enabled": true,
    "data_retention_days": 1095,
    "audit_all_access": false,
    "phi_encryption": "AES-256",
    "require_baa": false
  }')
ON CONFLICT (organization_id) DO NOTHING;

-- Pharmaceuticals settings
INSERT INTO tenant_settings (organization_id, ai_config, compliance) VALUES
  ('00000000-0000-0000-0000-000000000003',
  '{
    "default_model": "gpt-4",
    "temperature": 0.5,
    "max_tokens": 4000,
    "enable_rag": true,
    "enable_custom_agents": true,
    "content_moderation": true
  }',
  '{
    "hipaa_enabled": true,
    "gdpr_enabled": true,
    "data_retention_days": 3650,
    "audit_all_access": true,
    "phi_encryption": "AES-256",
    "require_baa": true
  }')
ON CONFLICT (organization_id) DO NOTHING;
```

## TypeScript Type Definitions

Create `/Users/hichamnaim/Downloads/Cursor/VITAL path/types/tenant.ts`:

```typescript
// ============================================================================
// TENANT TYPES
// ============================================================================

export type TenantTier = 'starter' | 'professional' | 'enterprise' | 'custom';
export type TenantStatus = 'active' | 'trial' | 'suspended' | 'cancelled';
export type TenantType = 'system' | 'organization' | 'user';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  country: string | null;

  tier: TenantTier;
  status: TenantStatus;
  tenant_type: TenantType;
  owner_id: string | null;

  branding: TenantBranding;
  billing_info: BillingInfo;
  limits: TenantLimits;
  settings: Record<string, any>;
  metadata: Record<string, any>;

  created_at: string;
  updated_at: string;
}

export interface TenantBranding {
  primary_color: string;
  logo_url: string | null;
  favicon_url: string | null;
  custom_css: string | null;
}

export interface BillingInfo {
  stripe_customer_id: string | null;
  subscription_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface TenantLimits {
  max_users: number; // -1 = unlimited
  max_agents: number;
  max_documents: number;
  max_storage_gb: number;
  api_rate_limit_per_hour: number;
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export type FeatureCategory = 'core' | 'ai' | 'compliance' | 'analytics' | 'integrations';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: FeatureCategory;

  default_enabled: boolean;
  available_in_tiers: TenantTier[];

  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TenantFeatureFlag {
  id: string;
  organization_id: string;
  feature_key: string;
  enabled: boolean;
  override_reason: string | null;
  config: Record<string, any>;

  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EffectiveFeature {
  feature_key: string;
  feature_name: string;
  enabled: boolean;
  source: 'tier_default' | 'override';
}

// ============================================================================
// PLATFORM APPS
// ============================================================================

export type AppCategory = 'core' | 'healthcare' | 'pharmaceutical' | 'digital-health';

export interface PlatformApp {
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  route: string | null;
  category: AppCategory;

  default_visible: boolean;
  available_in_tiers: TenantTier[];
  required_features: string[];

  metadata: Record<string, any>;
  display_order: number;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface TenantAppVisibility {
  id: string;
  organization_id: string;
  app_key: string;
  visible: boolean;

  custom_config: {
    custom_name?: string;
    custom_icon?: string;
    custom_route?: string;
  };

  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisibleApp {
  app_key: string;
  app_name: string;
  app_route: string;
  app_icon: string;
  app_category: AppCategory;
  custom_config: Record<string, any>;
  display_order: number;
}

// ============================================================================
// TENANT SETTINGS
// ============================================================================

export interface TenantSettings {
  id: string;
  organization_id: string;

  general: GeneralSettings;
  security: SecuritySettings;
  ai_config: AISettings;
  compliance: ComplianceSettings;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;

  created_at: string;
  updated_at: string;
}

export interface GeneralSettings {
  timezone: string;
  date_format: string;
  language: string;
  currency: string;
}

export interface SecuritySettings {
  session_timeout_minutes: number;
  require_2fa: boolean;
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special_chars: boolean;
  };
  allowed_ip_ranges: string[];
  sso_enabled: boolean;
  sso_provider: string | null;
}

export interface AISettings {
  default_model: string;
  temperature: number;
  max_tokens: number;
  enable_rag: boolean;
  enable_custom_agents: boolean;
  content_moderation: boolean;
}

export interface ComplianceSettings {
  hipaa_enabled: boolean;
  gdpr_enabled: boolean;
  data_retention_days: number;
  audit_all_access: boolean;
  phi_encryption: string;
  require_baa: boolean;
}

export interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  digest_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
}

export interface IntegrationSettings {
  enabled_integrations: string[];
  webhooks: WebhookConfig[];
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
}

// ============================================================================
// TENANT CONTEXT
// ============================================================================

export interface TenantContext {
  organization: Organization;
  features: EffectiveFeature[];
  apps: VisibleApp[];
  settings: TenantSettings;
  limits: TenantLimits;

  // Helper methods
  hasFeature(featureKey: string): boolean;
  hasApp(appKey: string): boolean;
  isWithinLimit(limitKey: keyof TenantLimits, currentUsage: number): boolean;
}
```

## Best Practices & Recommendations

### 1. Tenant Isolation in Queries

**Middleware Approach (Recommended):**

```typescript
// middleware/tenant-context.ts
import { createMiddleware } from '@/lib/middleware';
import { getOrganizationForUser } from '@/lib/db/organizations';

export const tenantMiddleware = createMiddleware(async (req, res) => {
  const userId = req.auth.userId;

  // Get user's organization(s)
  const organizations = await getOrganizationForUser(userId);

  // For MVP: single organization per user
  const activeOrg = organizations[0];

  if (!activeOrg) {
    throw new Error('User not associated with any organization');
  }

  // Set tenant context in request
  req.tenant = {
    organizationId: activeOrg.id,
    organizationSlug: activeOrg.slug,
    tier: activeOrg.tier,
    limits: activeOrg.limits,
  };

  // Set PostgreSQL RLS context (if using Supabase)
  await req.db.rpc('set_tenant_context', {
    p_organization_id: activeOrg.id,
  });
});
```

**Query Pattern:**

```typescript
// Always filter by organization_id in application code
export async function getAgents(organizationId: string) {
  return await db
    .select()
    .from(agents)
    .where(eq(agents.organization_id, organizationId));
}

// For RLS-enabled tables, context is automatically applied
export async function searchDocuments(query: string, organizationId: string) {
  // RLS will automatically filter to this organization
  return await supabase
    .from('knowledge_documents')
    .select('*')
    .textSearch('content', query);
}
```

### 2. Feature Flag Checking

```typescript
// lib/features.ts
import { cache } from 'react';

export const getTenantFeatures = cache(async (organizationId: string) => {
  const { data } = await supabase.rpc('get_tenant_features', {
    p_organization_id: organizationId,
  });

  return new Map(data.map(f => [f.feature_key, f.enabled]));
});

export async function checkFeature(
  organizationId: string,
  featureKey: string
): Promise<boolean> {
  const features = await getTenantFeatures(organizationId);
  return features.get(featureKey) ?? false;
}

// Usage in API route
export async function POST(req: Request) {
  const { organizationId } = req.tenant;

  if (!await checkFeature(organizationId, 'custom_agents')) {
    return new Response('Feature not available in your plan', { status: 403 });
  }

  // Proceed with agent creation
}
```

### 3. App Visibility in Navigation

```typescript
// components/navigation/AppNav.tsx
import { getVisibleApps } from '@/lib/apps';

export async function AppNav({ organizationId }: { organizationId: string }) {
  const apps = await getVisibleApps(organizationId);

  return (
    <nav>
      {apps.map(app => (
        <NavItem
          key={app.app_key}
          href={app.app_route}
          icon={app.app_icon}
          label={app.app_name}
        />
      ))}
    </nav>
  );
}

// lib/apps.ts
export async function getVisibleApps(organizationId: string) {
  const { data } = await supabase.rpc('get_tenant_visible_apps', {
    p_organization_id: organizationId,
  });

  return data;
}
```

### 4. Limit Enforcement

```typescript
// lib/limits.ts
export async function checkLimit(
  organizationId: string,
  limitKey: keyof TenantLimits,
  currentUsage: number
): Promise<{ allowed: boolean; limit: number; usage: number }> {
  const org = await getOrganization(organizationId);
  const limit = org.limits[limitKey];

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, limit: -1, usage: currentUsage };
  }

  return {
    allowed: currentUsage < limit,
    limit,
    usage: currentUsage,
  };
}

// Usage
export async function createAgent(data: AgentInput, organizationId: string) {
  const agentCount = await countAgents(organizationId);
  const limitCheck = await checkLimit(organizationId, 'max_agents', agentCount);

  if (!limitCheck.allowed) {
    throw new Error(
      `Agent limit reached (${limitCheck.usage}/${limitCheck.limit}). ` +
      `Upgrade your plan to create more agents.`
    );
  }

  // Create agent
}
```

### 5. Caching Strategy

```typescript
// lib/cache/tenant.ts
import { cache } from 'react';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedTenantContext(
  organizationId: string
): Promise<TenantContext> {
  const cacheKey = `tenant:${organizationId}:context`;

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const [organization, features, apps, settings] = await Promise.all([
    getOrganization(organizationId),
    getTenantFeatures(organizationId),
    getVisibleApps(organizationId),
    getTenantSettings(organizationId),
  ]);

  const context: TenantContext = {
    organization,
    features,
    apps,
    settings,
    limits: organization.limits,

    hasFeature(key) {
      return features.find(f => f.feature_key === key)?.enabled ?? false;
    },

    hasApp(key) {
      return apps.some(a => a.app_key === key);
    },

    isWithinLimit(limitKey, usage) {
      const limit = this.limits[limitKey];
      return limit === -1 || usage < limit;
    },
  };

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(context));

  return context;
}

// Invalidate cache when tenant configuration changes
export async function invalidateTenantCache(organizationId: string) {
  await redis.del(`tenant:${organizationId}:context`);
}
```

### 6. Audit Logging

```typescript
// lib/audit.ts
export async function logTenantAction(
  organizationId: string,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, any>
) {
  await supabase.from('audit_logs').insert({
    organization_id: organizationId,
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
  });
}

// Usage
export async function updateTenantSettings(
  organizationId: string,
  userId: string,
  settings: Partial<TenantSettings>
) {
  const result = await supabase
    .from('tenant_settings')
    .update(settings)
    .eq('organization_id', organizationId);

  await logTenantAction(
    organizationId,
    userId,
    'tenant.settings.updated',
    'tenant_settings',
    organizationId,
    { changes: settings }
  );

  await invalidateTenantCache(organizationId);

  return result;
}
```

## Performance Considerations

### 1. Indexing Strategy

```sql
-- Organization lookups
CREATE INDEX idx_organizations_slug ON organizations(slug); -- For slug-based routing
CREATE INDEX idx_organizations_domain ON organizations(domain); -- For domain-based routing
CREATE INDEX idx_organizations_status_tier ON organizations(status, tier); -- For admin queries

-- Multi-tenant table indexes (add to all tenant-aware tables)
CREATE INDEX idx_{table}_organization_created ON {table}(organization_id, created_at DESC);
CREATE INDEX idx_{table}_organization_status ON {table}(organization_id, status)
  WHERE status = 'active';

-- Feature flag lookups
CREATE INDEX idx_tenant_features_lookup ON tenant_feature_flags(organization_id, feature_key);

-- App visibility lookups
CREATE INDEX idx_tenant_apps_lookup ON tenant_app_visibility(organization_id, app_key);
```

### 2. Connection Pooling

```typescript
// lib/db.ts
import { Pool } from 'pg';

const pools = new Map<string, Pool>();

export function getTenantPool(organizationId: string): Pool {
  if (!pools.has(organizationId)) {
    pools.set(
      organizationId,
      new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10, // Max connections per tenant
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      })
    );
  }

  return pools.get(organizationId)!;
}
```

### 3. Query Optimization

```sql
-- Use covering indexes for common queries
CREATE INDEX idx_agents_org_covering ON agents(organization_id, id, name, status, created_at)
  INCLUDE (description, avatar, capabilities);

-- Partial indexes for filtered queries
CREATE INDEX idx_documents_org_active ON documents(organization_id, id)
  WHERE processing_status = 'completed' AND is_active = true;

-- GIN indexes for JSONB queries
CREATE INDEX idx_tenant_settings_compliance ON tenant_settings
  USING GIN(compliance) WHERE (compliance->>'hipaa_enabled')::boolean = true;
```

## HIPAA Compliance & Security

### 1. PHI/PII Encryption

```sql
-- Ensure encrypted columns for PHI
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS encrypted_content BYTEA,
  ADD COLUMN IF NOT EXISTS encryption_key_id TEXT;

-- Create encryption key registry per tenant
CREATE TABLE tenant_encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key_type TEXT NOT NULL, -- 'master', 'data', 'backup'
  key_id TEXT NOT NULL,
  key_version INTEGER DEFAULT 1,
  algorithm TEXT DEFAULT 'AES-256-GCM',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rotated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'rotating', 'retired')),

  UNIQUE(organization_id, key_type, key_version)
);
```

### 2. Enhanced RLS Policies

```sql
-- Add HIPAA audit context to RLS
CREATE OR REPLACE FUNCTION check_phi_access()
RETURNS BOOLEAN AS $$
BEGIN
  -- Log all PHI access
  INSERT INTO phi_access_logs (
    organization_id,
    user_id,
    resource_type,
    resource_id,
    access_timestamp
  ) VALUES (
    current_setting('app.organization_id', true)::UUID,
    auth.uid(),
    current_setting('app.resource_type', true),
    current_setting('app.resource_id', true)::UUID,
    NOW()
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to PHI tables
CREATE POLICY "Log all PHI access" ON documents
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
    AND check_phi_access()
  );
```

## Integration with Platform Orchestrator

### Coordination Points

1. **Before Major Decisions**: Consult orchestrator before:
   - Changing tenant isolation strategy
   - Adding new compliance requirements
   - Modifying data retention policies
   - Implementing cross-tenant features

2. **Alignment Verification**:
   - Ensure tenant configuration supports PRD user stories
   - Validate feature flags match roadmap priorities
   - Confirm app visibility aligns with product strategy

3. **Data Migration Coordination**:
   - Coordinate downtime windows with platform team
   - Validate migration scripts don't break existing features
   - Test rollback procedures

## Next Steps

1. **Immediate (This Sprint)**:
   - [ ] Run Phase 1 migration (add new tables)
   - [ ] Seed three MVP tenants
   - [ ] Update auth context to load tenant configuration
   - [ ] Add feature flag checking to API routes

2. **Short-term (Next 2 Weeks)**:
   - [ ] Implement tenant switcher UI component
   - [ ] Build admin panel for tenant management
   - [ ] Add usage tracking and limit enforcement
   - [ ] Implement caching layer

3. **Medium-term (Next Month)**:
   - [ ] Run Phase 2 migration (unify tenant model)
   - [ ] Add real-time configuration updates (via subscriptions)
   - [ ] Implement comprehensive audit logging
   - [ ] Build analytics dashboard for tenant metrics

4. **Future Enhancements**:
   - [ ] Multi-tenant user access (user belongs to multiple orgs)
   - [ ] Tenant-specific domains (pharma.example.com)
   - [ ] White-label branding customization
   - [ ] Per-tenant data residency (EU vs US storage)
   - [ ] Tenant cloning for staging environments
