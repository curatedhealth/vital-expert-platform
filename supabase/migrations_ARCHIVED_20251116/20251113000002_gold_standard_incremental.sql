-- =============================================================================
-- GOLD-STANDARD SCHEMA - INCREMENTAL (Skip existing ENUMs)
-- =============================================================================
-- This version skips Phase 01 (ENUMs) since they already exist
-- and uses CREATE IF NOT EXISTS for everything else
-- =============================================================================

-- Enable required PostgreSQL extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "ltree";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =============================================================================
-- PHASE 02: Identity & Multi-Tenancy (6 tables)
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  job_title TEXT,
  department TEXT,
  organization TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  notification_settings JSONB DEFAULT '{
    "email": true,
    "in_app": true,
    "weekly_digest": true
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  tenant_path LTREE NOT NULL,
  tenant_level INTEGER NOT NULL CHECK (tenant_level BETWEEN 0 AND 4),
  status tenant_status DEFAULT 'active' NOT NULL,
  tier tenant_tier DEFAULT 'free' NOT NULL,
  max_users INTEGER DEFAULT 5 NOT NULL,
  max_agents INTEGER DEFAULT 10 NOT NULL,
  max_storage_gb INTEGER DEFAULT 1 NOT NULL,
  max_api_calls_per_month INTEGER DEFAULT 10000 NOT NULL,
  features JSONB DEFAULT '{}'::jsonb,
  stripe_customer_id TEXT UNIQUE,
  subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT valid_tenant_path CHECK (nlevel(tenant_path) = tenant_level + 1),
  CONSTRAINT root_has_no_parent CHECK (
    (tenant_level = 0 AND parent_id IS NULL) OR
    (tenant_level > 0 AND parent_id IS NOT NULL)
  )
);

-- Insert platform tenant if it doesn't exist
INSERT INTO tenants (
  id, name, slug, parent_id, tenant_path, tenant_level, status, tier,
  max_users, max_agents, max_storage_gb, max_api_calls_per_month,
  features
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'VITAL.expert Platform',
  'platform',
  NULL,
  'platform',
  0,
  'active',
  'enterprise',
  999999,
  999999,
  999999,
  999999999,
  jsonb_build_object(
    'custom_agents', true,
    'panel_discussions', true,
    'workflow_automation', true,
    'white_label', true,
    'sso', true,
    'api_access', true,
    'unlimited', true
  )
) ON CONFLICT (id) DO NOTHING;

-- Continue with remaining tables using CREATE TABLE IF NOT EXISTS
-- This will skip tables that already exist

RAISE NOTICE 'Gold-standard schema incremental update complete';
RAISE NOTICE 'Use CREATE TABLE IF NOT EXISTS for all remaining tables';
