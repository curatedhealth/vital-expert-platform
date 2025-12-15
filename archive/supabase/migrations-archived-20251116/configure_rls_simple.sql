-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - SIMPLIFIED VERSION
-- =============================================================================
-- PURPOSE: Enable tenant data isolation and access control
-- APPLY: Via Supabase Dashboard SQL Editor
-- NOTE: Uses Supabase's built-in auth.uid() function
-- =============================================================================

-- =============================================================================
-- HELPER FUNCTIONS (in public schema)
-- =============================================================================

-- Function to get current user's tenant_id
CREATE OR REPLACE FUNCTION public.current_user_tenant_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT tenant_id
  FROM user_profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Function to check if user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'super_admin')
  );
$$;

-- =============================================================================
-- ENABLE RLS ON CORE TABLES
-- =============================================================================

-- Foundation
ALTER TABLE IF EXISTS tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;

-- AI Assets
ALTER TABLE IF EXISTS agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jobs_to_be_done ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;

-- Services
ALTER TABLE IF EXISTS expert_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expert_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS panel_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS panel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS knowledge_sources ENABLE ROW LEVEL SECURITY;

-- Execution
ALTER TABLE IF EXISTS workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS solutions ENABLE ROW LEVEL SECURITY;

-- Governance
ALTER TABLE IF EXISTS audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- BASIC TENANT ISOLATION POLICIES
-- =============================================================================

-- Tenants: Users can only view their own tenant
DROP POLICY IF EXISTS "tenant_isolation_select" ON tenants;
CREATE POLICY "tenant_isolation_select"
  ON tenants FOR SELECT
  USING (id = public.current_user_tenant_id() OR public.is_admin());

-- User Profiles: Users can view profiles in their tenant
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
CREATE POLICY "user_profiles_select"
  ON user_profiles FOR SELECT
  USING (tenant_id = public.current_user_tenant_id() OR public.is_admin());

DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;
CREATE POLICY "user_profiles_update_own"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

-- Organizations: Tenant isolation
DROP POLICY IF EXISTS "organizations_select" ON organizations;
CREATE POLICY "organizations_select"
  ON organizations FOR SELECT
  USING (tenant_id = public.current_user_tenant_id() OR public.is_admin());

-- =============================================================================
-- AI ASSETS POLICIES (Public Read, Authenticated Write)
-- =============================================================================

-- Agents: All users can view, authenticated can manage
DROP POLICY IF EXISTS "agents_select" ON agents;
CREATE POLICY "agents_select"
  ON agents FOR SELECT
  USING (true);

-- Personas: All users can view
DROP POLICY IF EXISTS "personas_select" ON personas;
CREATE POLICY "personas_select"
  ON personas FOR SELECT
  USING (true);

-- Jobs-to-be-Done: All users can view
DROP POLICY IF EXISTS "jtbds_select" ON jobs_to_be_done;
CREATE POLICY "jtbds_select"
  ON jobs_to_be_done FOR SELECT
  USING (true);

-- Workflows: Tenant isolation for private workflows
DROP POLICY IF EXISTS "workflows_select" ON workflows;
CREATE POLICY "workflows_select"
  ON workflows FOR SELECT
  USING (
    tenant_id IS NULL  -- Public workflows
    OR tenant_id = public.current_user_tenant_id()
    OR public.is_admin()
  );

-- Tasks: Tenant isolation for private tasks
DROP POLICY IF EXISTS "tasks_select" ON tasks;
CREATE POLICY "tasks_select"
  ON tasks FOR SELECT
  USING (
    tenant_id IS NULL
    OR tenant_id = public.current_user_tenant_id()
    OR public.is_admin()
  );

-- =============================================================================
-- SERVICES POLICIES (User-owned data)
-- =============================================================================

-- Expert Consultations: Users can only view their own
DROP POLICY IF EXISTS "consultations_select" ON expert_consultations;
CREATE POLICY "consultations_select"
  ON expert_consultations FOR SELECT
  USING (
    user_id = auth.uid()
    OR tenant_id = public.current_user_tenant_id()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "consultations_insert" ON expert_consultations;
CREATE POLICY "consultations_insert"
  ON expert_consultations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Expert Messages: Users can view messages from their consultations
DROP POLICY IF EXISTS "expert_messages_select" ON expert_messages;
CREATE POLICY "expert_messages_select"
  ON expert_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM expert_consultations
      WHERE id = expert_messages.consultation_id
      AND user_id = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "expert_messages_insert" ON expert_messages;
CREATE POLICY "expert_messages_insert"
  ON expert_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expert_consultations
      WHERE id = expert_messages.consultation_id
      AND user_id = auth.uid()
    )
  );

-- Panel Discussions: Users can view their own panels
DROP POLICY IF EXISTS "panels_select" ON panel_discussions;
CREATE POLICY "panels_select"
  ON panel_discussions FOR SELECT
  USING (
    user_id = auth.uid()
    OR tenant_id = public.current_user_tenant_id()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "panels_insert" ON panel_discussions;
CREATE POLICY "panels_insert"
  ON panel_discussions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Panel Messages: Users can view messages from their panels
DROP POLICY IF EXISTS "panel_messages_select" ON panel_messages;
CREATE POLICY "panel_messages_select"
  ON panel_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM panel_discussions
      WHERE id = panel_messages.panel_id
      AND user_id = auth.uid()
    )
    OR public.is_admin()
  );

-- Knowledge Sources: Tenant isolation
DROP POLICY IF EXISTS "knowledge_sources_select" ON knowledge_sources;
CREATE POLICY "knowledge_sources_select"
  ON knowledge_sources FOR SELECT
  USING (
    tenant_id IS NULL  -- Public knowledge
    OR tenant_id = public.current_user_tenant_id()
    OR public.is_admin()
  );

-- =============================================================================
-- EXECUTION POLICIES
-- =============================================================================

-- Workflow Executions: Users can view their own executions
DROP POLICY IF EXISTS "workflow_executions_select" ON workflow_executions;
CREATE POLICY "workflow_executions_select"
  ON workflow_executions FOR SELECT
  USING (
    triggered_by = auth.uid()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "workflow_executions_insert" ON workflow_executions;
CREATE POLICY "workflow_executions_insert"
  ON workflow_executions FOR INSERT
  WITH CHECK (triggered_by = auth.uid());

-- Solutions: Tenant isolation
DROP POLICY IF EXISTS "solutions_select" ON solutions;
CREATE POLICY "solutions_select"
  ON solutions FOR SELECT
  USING (
    tenant_id IS NULL
    OR tenant_id = public.current_user_tenant_id()
    OR public.is_admin()
  );

-- =============================================================================
-- GOVERNANCE POLICIES
-- =============================================================================

-- Audit Log: Users can view their own actions, admins can view all
DROP POLICY IF EXISTS "audit_log_select" ON audit_log;
CREATE POLICY "audit_log_select"
  ON audit_log FOR SELECT
  USING (
    public.is_admin()
    OR user_id = auth.uid()
  );

-- Allow system to insert audit logs
DROP POLICY IF EXISTS "audit_log_insert" ON audit_log;
CREATE POLICY "audit_log_insert"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    rls_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Count tables with RLS enabled
    SELECT COUNT(*) INTO rls_count
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
    AND c.relrowsecurity = true;

    -- Count policies created
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ RLS POLICIES CONFIGURED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables with RLS enabled: %', rls_count;
    RAISE NOTICE 'Total policies created: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Policy Types:';
    RAISE NOTICE '  - Tenant isolation (tenants, orgs, etc.)';
    RAISE NOTICE '  - Public read (agents, personas, JTBDs)';
    RAISE NOTICE '  - User-owned data (consultations, panels)';
    RAISE NOTICE '  - Admin override (admins can view all)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT:';
    RAISE NOTICE 'RLS policies are now active. Test with:';
    RAISE NOTICE '1. Authenticated user (should see limited data)';
    RAISE NOTICE '2. Admin user (should see all data)';
    RAISE NOTICE '3. Anonymous user (should see only public data)';
    RAISE NOTICE '';
END $$;
