-- ============================================================================
-- PHASE 3: Row Level Security (RLS) for Multi-Tenant Isolation
-- Date: 2025-11-18
-- Purpose: Implement tenant-based data isolation
-- ============================================================================

BEGIN;

-- ============================================================================
-- Create helper function to get current tenant
-- ============================================================================

CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS UUID AS $$
BEGIN
  -- Try to get tenant from app settings
  BEGIN
    RETURN current_setting('app.current_tenant')::UUID;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback to platform tenant if not set
    RETURN '00000000-0000-0000-0000-000000000001'::UUID;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Create helper function to get user's tenant from profile
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_tenant()
RETURNS UUID AS $$
DECLARE
  user_tenant UUID;
BEGIN
  SELECT tenant_id INTO user_tenant
  FROM public.profiles
  WHERE id = auth.uid();

  -- Return user's tenant or platform tenant as fallback
  RETURN COALESCE(user_tenant, '00000000-0000-0000-0000-000000000001'::UUID);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Enable RLS on all tenant-aware tables
-- ============================================================================

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs_to_be_done ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Drop existing policies if they exist
-- ============================================================================

-- Agents
DROP POLICY IF EXISTS "tenant_isolation_agents" ON public.agents;
DROP POLICY IF EXISTS "platform_agents_readable" ON public.agents;
DROP POLICY IF EXISTS "tenant_agents_writable" ON public.agents;

-- Tools
DROP POLICY IF EXISTS "tenant_isolation_tools" ON public.tools;
DROP POLICY IF EXISTS "platform_tools_readable" ON public.tools;
DROP POLICY IF EXISTS "tenant_tools_writable" ON public.tools;

-- Prompts
DROP POLICY IF EXISTS "tenant_isolation_prompts" ON public.prompts;
DROP POLICY IF EXISTS "platform_prompts_readable" ON public.prompts;
DROP POLICY IF EXISTS "tenant_prompts_writable" ON public.prompts;

-- Knowledge
DROP POLICY IF EXISTS "tenant_isolation_knowledge" ON public.knowledge;
DROP POLICY IF EXISTS "platform_knowledge_readable" ON public.knowledge;
DROP POLICY IF EXISTS "tenant_knowledge_writable" ON public.knowledge;

-- Chat Sessions
DROP POLICY IF EXISTS "tenant_isolation_chat_sessions" ON public.chat_sessions;

-- Personas
DROP POLICY IF EXISTS "tenant_isolation_personas" ON public.personas;

-- JTBD
DROP POLICY IF EXISTS "tenant_isolation_jtbd" ON public.jobs_to_be_done;

-- ============================================================================
-- AGENTS: Platform agents readable by all, tenant agents isolated
-- ============================================================================

-- Read: Users can see platform agents and their tenant's agents
CREATE POLICY "platform_agents_readable"
ON public.agents FOR SELECT
USING (
  tenant_id = '00000000-0000-0000-0000-000000000001'::UUID -- Platform agents
  OR tenant_id = get_user_tenant() -- User's tenant agents
);

-- Write: Users can only modify their tenant's agents (not platform agents)
CREATE POLICY "tenant_agents_writable"
ON public.agents FOR INSERT
WITH CHECK (tenant_id = get_user_tenant());

CREATE POLICY "tenant_agents_updatable"
ON public.agents FOR UPDATE
USING (tenant_id = get_user_tenant() AND tenant_id != '00000000-0000-0000-0000-000000000001'::UUID)
WITH CHECK (tenant_id = get_user_tenant());

CREATE POLICY "tenant_agents_deletable"
ON public.agents FOR DELETE
USING (tenant_id = get_user_tenant() AND tenant_id != '00000000-0000-0000-0000-000000000001'::UUID);

-- ============================================================================
-- TOOLS: Platform tools readable by all, tenant tools isolated
-- ============================================================================

-- Read: Users can see platform tools and their tenant's tools
CREATE POLICY "platform_tools_readable"
ON public.tools FOR SELECT
USING (
  tenant_id = '00000000-0000-0000-0000-000000000001'::UUID -- Platform tools
  OR tenant_id = get_user_tenant() -- User's tenant tools
);

-- Write: Users can only modify their tenant's tools (not platform tools)
CREATE POLICY "tenant_tools_writable"
ON public.tools FOR INSERT
WITH CHECK (tenant_id = get_user_tenant());

CREATE POLICY "tenant_tools_updatable"
ON public.tools FOR UPDATE
USING (tenant_id = get_user_tenant() AND tenant_id != '00000000-0000-0000-0000-000000000001'::UUID)
WITH CHECK (tenant_id = get_user_tenant());

CREATE POLICY "tenant_tools_deletable"
ON public.tools FOR DELETE
USING (tenant_id = get_user_tenant() AND tenant_id != '00000000-0000-0000-0000-000000000001'::UUID);

-- ============================================================================
-- PROMPTS: Platform prompts readable by all, tenant prompts isolated
-- ============================================================================

-- Read: Users can see platform prompts and their tenant's prompts
CREATE POLICY "platform_prompts_readable"
ON public.prompts FOR SELECT
USING (
  tenant_id = '00000000-0000-0000-0000-000000000001'::UUID -- Platform prompts
  OR tenant_id = get_user_tenant() -- User's tenant prompts
  OR is_public = true -- Public prompts from any tenant
);

-- Write: Users can only modify their tenant's prompts
CREATE POLICY "tenant_prompts_writable"
ON public.prompts FOR INSERT
WITH CHECK (tenant_id = get_user_tenant());

CREATE POLICY "tenant_prompts_updatable"
ON public.prompts FOR UPDATE
USING (tenant_id = get_user_tenant())
WITH CHECK (tenant_id = get_user_tenant());

CREATE POLICY "tenant_prompts_deletable"
ON public.prompts FOR DELETE
USING (tenant_id = get_user_tenant());

-- ============================================================================
-- KNOWLEDGE: Platform knowledge readable by all, tenant knowledge isolated
-- ============================================================================

-- Read: Users can see platform knowledge and their tenant's knowledge
CREATE POLICY "platform_knowledge_readable"
ON public.knowledge FOR SELECT
USING (
  tenant_id = '00000000-0000-0000-0000-000000000001'::UUID -- Platform knowledge
  OR tenant_id = get_user_tenant() -- User's tenant knowledge
);

-- Write: Users can only modify their tenant's knowledge
CREATE POLICY "tenant_knowledge_writable"
ON public.knowledge FOR INSERT
WITH CHECK (tenant_id = get_user_tenant());

CREATE POLICY "tenant_knowledge_updatable"
ON public.knowledge FOR UPDATE
USING (tenant_id = get_user_tenant())
WITH CHECK (tenant_id = get_user_tenant());

CREATE POLICY "tenant_knowledge_deletable"
ON public.knowledge FOR DELETE
USING (tenant_id = get_user_tenant());

-- ============================================================================
-- CHAT SESSIONS: Strictly isolated by tenant
-- ============================================================================

CREATE POLICY "tenant_chat_sessions_readable"
ON public.chat_sessions FOR SELECT
USING (tenant_id = get_user_tenant());

CREATE POLICY "tenant_chat_sessions_writable"
ON public.chat_sessions FOR INSERT
WITH CHECK (tenant_id = get_user_tenant());

CREATE POLICY "tenant_chat_sessions_updatable"
ON public.chat_sessions FOR UPDATE
USING (tenant_id = get_user_tenant())
WITH CHECK (tenant_id = get_user_tenant());

CREATE POLICY "tenant_chat_sessions_deletable"
ON public.chat_sessions FOR DELETE
USING (tenant_id = get_user_tenant());

-- ============================================================================
-- PERSONAS: Strictly isolated by tenant
-- ============================================================================

CREATE POLICY "tenant_personas_readable"
ON public.personas FOR SELECT
USING (tenant_id = get_user_tenant());

CREATE POLICY "tenant_personas_writable"
ON public.personas FOR INSERT
WITH CHECK (tenant_id = get_user_tenant());

CREATE POLICY "tenant_personas_updatable"
ON public.personas FOR UPDATE
USING (tenant_id = get_user_tenant())
WITH CHECK (tenant_id = get_user_tenant());

CREATE POLICY "tenant_personas_deletable"
ON public.personas FOR DELETE
USING (tenant_id = get_user_tenant());

-- ============================================================================
-- JOBS TO BE DONE: Strictly isolated by tenant
-- ============================================================================

CREATE POLICY "tenant_jtbd_readable"
ON public.jobs_to_be_done FOR SELECT
USING (tenant_id = get_user_tenant());

CREATE POLICY "tenant_jtbd_writable"
ON public.jobs_to_be_done FOR INSERT
WITH CHECK (tenant_id = get_user_tenant());

CREATE POLICY "tenant_jtbd_updatable"
ON public.jobs_to_be_done FOR UPDATE
USING (tenant_id = get_user_tenant())
WITH CHECK (tenant_id = get_user_tenant());

CREATE POLICY "tenant_jtbd_deletable"
ON public.jobs_to_be_done FOR DELETE
USING (tenant_id = get_user_tenant());

-- ============================================================================
-- Create function to set tenant context for API calls
-- ============================================================================

CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant', p_tenant_id::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Grant necessary permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_current_tenant() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_tenant() TO authenticated;
GRANT EXECUTE ON FUNCTION set_tenant_context(UUID) TO authenticated;

COMMIT;

-- ============================================================================
-- VERIFICATION: Test RLS policies
-- ============================================================================

-- Test query to verify platform data is accessible
SELECT
  'Platform agents visible' as test,
  COUNT(*) as count
FROM public.agents
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- Test tenant isolation (this should be run as a specific user)
-- SELECT
--   'Tenant-specific agents' as test,
--   tenant_id,
--   COUNT(*) as count
-- FROM public.agents
-- GROUP BY tenant_id;

-- ============================================================================
-- Helper: Disable RLS temporarily for debugging (use with caution)
-- ============================================================================
-- To temporarily disable RLS for debugging:
-- ALTER TABLE public.agents DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tools DISABLE ROW LEVEL SECURITY;
-- etc...

-- To re-enable:
-- ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
-- etc...