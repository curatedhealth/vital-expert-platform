-- ============================================================================
-- ROLLBACK SCRIPT: Revert Multi-Tenant Changes
-- Date: 2025-11-18
-- Purpose: Rollback migrations if issues arise
-- WARNING: This will remove tenant isolation - use with caution!
-- ============================================================================

BEGIN;

-- ============================================================================
-- ROLLBACK PHASE 3: Remove RLS Policies
-- ============================================================================

-- Disable RLS on all tables
ALTER TABLE public.agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.personas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs_to_be_done DISABLE ROW LEVEL SECURITY;

-- Drop all RLS policies
DROP POLICY IF EXISTS "platform_agents_readable" ON public.agents;
DROP POLICY IF EXISTS "tenant_agents_writable" ON public.agents;
DROP POLICY IF EXISTS "tenant_agents_updatable" ON public.agents;
DROP POLICY IF EXISTS "tenant_agents_deletable" ON public.agents;

DROP POLICY IF EXISTS "platform_tools_readable" ON public.tools;
DROP POLICY IF EXISTS "tenant_tools_writable" ON public.tools;
DROP POLICY IF EXISTS "tenant_tools_updatable" ON public.tools;
DROP POLICY IF EXISTS "tenant_tools_deletable" ON public.tools;

DROP POLICY IF EXISTS "platform_prompts_readable" ON public.prompts;
DROP POLICY IF EXISTS "tenant_prompts_writable" ON public.prompts;
DROP POLICY IF EXISTS "tenant_prompts_updatable" ON public.prompts;
DROP POLICY IF EXISTS "tenant_prompts_deletable" ON public.prompts;

DROP POLICY IF EXISTS "platform_knowledge_readable" ON public.knowledge;
DROP POLICY IF EXISTS "tenant_knowledge_writable" ON public.knowledge;
DROP POLICY IF EXISTS "tenant_knowledge_updatable" ON public.knowledge;
DROP POLICY IF EXISTS "tenant_knowledge_deletable" ON public.knowledge;

DROP POLICY IF EXISTS "tenant_chat_sessions_readable" ON public.chat_sessions;
DROP POLICY IF EXISTS "tenant_chat_sessions_writable" ON public.chat_sessions;
DROP POLICY IF EXISTS "tenant_chat_sessions_updatable" ON public.chat_sessions;
DROP POLICY IF EXISTS "tenant_chat_sessions_deletable" ON public.chat_sessions;

DROP POLICY IF EXISTS "tenant_personas_readable" ON public.personas;
DROP POLICY IF EXISTS "tenant_personas_writable" ON public.personas;
DROP POLICY IF EXISTS "tenant_personas_updatable" ON public.personas;
DROP POLICY IF EXISTS "tenant_personas_deletable" ON public.personas;

DROP POLICY IF EXISTS "tenant_jtbd_readable" ON public.jobs_to_be_done;
DROP POLICY IF EXISTS "tenant_jtbd_writable" ON public.jobs_to_be_done;
DROP POLICY IF EXISTS "tenant_jtbd_updatable" ON public.jobs_to_be_done;
DROP POLICY IF EXISTS "tenant_jtbd_deletable" ON public.jobs_to_be_done;

-- Drop helper functions
DROP FUNCTION IF EXISTS get_current_tenant();
DROP FUNCTION IF EXISTS get_user_tenant();
DROP FUNCTION IF EXISTS set_tenant_context(UUID);

-- ============================================================================
-- ROLLBACK PHASE 2: Remove Tenant-Specific Data
-- ============================================================================

-- Remove startup-specific data
DELETE FROM public.tools
WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

DELETE FROM public.agents
WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

DELETE FROM public.personas
WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

DELETE FROM public.jobs_to_be_done
WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

DELETE FROM public.prompts
WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

-- Remove pharma-specific data
DELETE FROM public.tools
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

DELETE FROM public.agents
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

DELETE FROM public.personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

DELETE FROM public.jobs_to_be_done
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

DELETE FROM public.prompts
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

-- ============================================================================
-- ROLLBACK PHASE 1: Remove Schema Changes
-- ============================================================================

-- Drop indexes
DROP INDEX IF EXISTS idx_tools_tenant_id;
DROP INDEX IF EXISTS idx_tools_category;
DROP INDEX IF EXISTS idx_agents_tenant_id;
DROP INDEX IF EXISTS idx_prompts_tenant_id;
DROP INDEX IF EXISTS idx_knowledge_tenant_id;
DROP INDEX IF EXISTS idx_chat_sessions_tenant_id;
DROP INDEX IF EXISTS idx_personas_tenant_id;
DROP INDEX IF EXISTS idx_jtbd_tenant_id;

-- Drop compatibility views
DROP VIEW IF EXISTS public.business_functions CASCADE;
DROP VIEW IF EXISTS public.departments CASCADE;
DROP VIEW IF EXISTS public.organizational_roles CASCADE;

-- Remove tenant_id columns (WARNING: This will lose tenant association data!)
ALTER TABLE public.tools DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.agents DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.prompts DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.knowledge DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.chat_sessions DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.personas DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.jobs_to_be_done DROP COLUMN IF EXISTS tenant_id;

-- Remove added columns from tools table
ALTER TABLE public.tools DROP COLUMN IF EXISTS category;
ALTER TABLE public.tools DROP COLUMN IF EXISTS slug;
ALTER TABLE public.tools DROP COLUMN IF EXISTS implementation_type;
ALTER TABLE public.tools DROP COLUMN IF EXISTS function_signature;
ALTER TABLE public.tools DROP COLUMN IF EXISTS parameters_schema;
ALTER TABLE public.tools DROP COLUMN IF EXISTS response_schema;
ALTER TABLE public.tools DROP COLUMN IF EXISTS usage_examples;
ALTER TABLE public.tools DROP COLUMN IF EXISTS error_handling;
ALTER TABLE public.tools DROP COLUMN IF EXISTS rate_limits;
ALTER TABLE public.tools DROP COLUMN IF EXISTS authentication_required;
ALTER TABLE public.tools DROP COLUMN IF EXISTS api_method;
ALTER TABLE public.tools DROP COLUMN IF EXISTS api_headers;
ALTER TABLE public.tools DROP COLUMN IF EXISTS timeout_ms;
ALTER TABLE public.tools DROP COLUMN IF EXISTS retry_policy;
ALTER TABLE public.tools DROP COLUMN IF EXISTS metadata;
ALTER TABLE public.tools DROP COLUMN IF EXISTS tags;
ALTER TABLE public.tools DROP COLUMN IF EXISTS status;

COMMIT;

-- ============================================================================
-- VERIFICATION: Confirm Rollback
-- ============================================================================

-- Check that tenant_id columns are removed
SELECT
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
  AND table_name IN ('tools', 'agents', 'prompts', 'knowledge', 'chat_sessions', 'personas', 'jobs_to_be_done');

-- Check that views are removed
SELECT
  schemaname,
  viewname
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('business_functions', 'departments', 'organizational_roles');

-- Check that RLS is disabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('tools', 'agents', 'prompts', 'knowledge', 'chat_sessions', 'personas', 'jobs_to_be_done');