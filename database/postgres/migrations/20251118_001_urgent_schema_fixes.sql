-- ============================================================================
-- URGENT: Multi-Tenant Schema Fixes
-- Date: 2025-11-18
-- Purpose: Fix immediate schema issues blocking UI functionality
-- ============================================================================

-- ============================================================================
-- PHASE 1: IMMEDIATE FIXES (Run First)
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1.1: Fix Tools Table Schema Mismatch
-- ----------------------------------------------------------------------------

-- Add missing category column (API expects this as TEXT, not category_id)
ALTER TABLE public.tools
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add tenant_id for multi-tenant support
ALTER TABLE public.tools
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Populate category from existing category_id relationship
UPDATE public.tools t
SET category = tc.name
FROM public.tool_categories tc
WHERE t.category_id = tc.id
AND t.category IS NULL;

-- Set default category for any remaining nulls
UPDATE public.tools
SET category = 'General'
WHERE category IS NULL;

-- Set platform tenant as default for existing tools
UPDATE public.tools
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

-- Make tenant_id required going forward
ALTER TABLE public.tools
ALTER COLUMN tenant_id SET NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tools_tenant_id ON public.tools(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools(category);

-- ----------------------------------------------------------------------------
-- 1.2: Create Compatibility Views for Table Name Mismatches
-- ----------------------------------------------------------------------------

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.business_functions CASCADE;
DROP VIEW IF EXISTS public.departments CASCADE;
DROP VIEW IF EXISTS public.organizational_roles CASCADE;

-- Map business_functions to suite_functions
CREATE OR REPLACE VIEW public.business_functions AS
SELECT
  id,
  name,
  description,
  parent_id,
  level,
  path,
  created_at,
  updated_at
FROM public.suite_functions;

-- Map departments to org_departments
CREATE OR REPLACE VIEW public.departments AS
SELECT
  id,
  name,
  description,
  parent_department_id as parent_id,
  organization_id,
  created_at,
  updated_at
FROM public.org_departments;

-- Map organizational_roles to organizational_levels
CREATE OR REPLACE VIEW public.organizational_roles AS
SELECT
  id,
  name,
  level,
  description,
  created_at
FROM public.organizational_levels;

-- Grant appropriate permissions on views
GRANT SELECT ON public.business_functions TO authenticated;
GRANT SELECT ON public.departments TO authenticated;
GRANT SELECT ON public.organizational_roles TO authenticated;

-- ----------------------------------------------------------------------------
-- 1.3: Add Missing Tenant Columns to Core Tables
-- ----------------------------------------------------------------------------

-- Add tenant_id to agents if missing
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to prompts if missing
ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to knowledge if missing
ALTER TABLE public.knowledge
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to chat_sessions if missing
ALTER TABLE public.chat_sessions
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to personas if missing
ALTER TABLE public.personas
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to jobs_to_be_done if missing
ALTER TABLE public.jobs_to_be_done
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- ----------------------------------------------------------------------------
-- 1.4: Set Default Platform Tenant for Existing Data
-- ----------------------------------------------------------------------------

-- Platform tenant ID
DO $$
DECLARE
  platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Update agents
  UPDATE public.agents
  SET tenant_id = platform_tenant_id
  WHERE tenant_id IS NULL;

  -- Update prompts
  UPDATE public.prompts
  SET tenant_id = platform_tenant_id
  WHERE tenant_id IS NULL;

  -- Update knowledge
  UPDATE public.knowledge
  SET tenant_id = platform_tenant_id
  WHERE tenant_id IS NULL;

  -- Update chat_sessions
  UPDATE public.chat_sessions
  SET tenant_id = platform_tenant_id
  WHERE tenant_id IS NULL;

  -- Update personas
  UPDATE public.personas
  SET tenant_id = platform_tenant_id
  WHERE tenant_id IS NULL;

  -- Update jobs_to_be_done
  UPDATE public.jobs_to_be_done
  SET tenant_id = platform_tenant_id
  WHERE tenant_id IS NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 1.5: Create Indexes for Performance
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON public.agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prompts_tenant_id ON public.prompts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_tenant_id ON public.knowledge(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_tenant_id ON public.chat_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_personas_tenant_id ON public.personas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_tenant_id ON public.jobs_to_be_done(tenant_id);

-- ----------------------------------------------------------------------------
-- 1.6: Add Missing Columns to Tools (from API expectations)
-- ----------------------------------------------------------------------------

ALTER TABLE public.tools
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS implementation_type TEXT,
ADD COLUMN IF NOT EXISTS function_signature JSONB,
ADD COLUMN IF NOT EXISTS parameters_schema JSONB,
ADD COLUMN IF NOT EXISTS response_schema JSONB,
ADD COLUMN IF NOT EXISTS usage_examples JSONB,
ADD COLUMN IF NOT EXISTS error_handling JSONB,
ADD COLUMN IF NOT EXISTS rate_limits JSONB,
ADD COLUMN IF NOT EXISTS authentication_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS api_method TEXT,
ADD COLUMN IF NOT EXISTS api_headers JSONB,
ADD COLUMN IF NOT EXISTS timeout_ms INTEGER,
ADD COLUMN IF NOT EXISTS retry_policy JSONB,
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Generate slugs from existing tool_key or name
UPDATE public.tools
SET slug = LOWER(REPLACE(COALESCE(tool_key, name), ' ', '-'))
WHERE slug IS NULL;

-- Set default implementation_type
UPDATE public.tools
SET implementation_type = COALESCE(tool_type, 'function')
WHERE implementation_type IS NULL;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to confirm fixes)
-- ============================================================================

-- Check tools table has required columns
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tools'
AND column_name IN ('category', 'tenant_id', 'slug', 'implementation_type')
ORDER BY ordinal_position;

-- Verify views exist
SELECT
  schemaname,
  viewname
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN ('business_functions', 'departments', 'organizational_roles');

-- Check tenant_id distribution
SELECT
  'agents' as table_name,
  tenant_id,
  COUNT(*) as record_count
FROM public.agents
GROUP BY tenant_id
UNION ALL
SELECT
  'tools' as table_name,
  tenant_id,
  COUNT(*)
FROM public.tools
GROUP BY tenant_id
UNION ALL
SELECT
  'prompts' as table_name,
  tenant_id,
  COUNT(*)
FROM public.prompts
GROUP BY tenant_id
ORDER BY table_name, tenant_id;