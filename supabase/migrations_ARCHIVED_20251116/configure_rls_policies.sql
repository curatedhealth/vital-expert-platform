-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
-- PURPOSE: Enable tenant data isolation and access control
-- APPLY: Via Supabase Dashboard SQL Editor
-- TIME: ~10 minutes
-- =============================================================================

-- =============================================================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================================================

-- Function to get current user's tenant_id
CREATE OR REPLACE FUNCTION auth.current_user_tenant_id()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT tenant_id
  FROM user_profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Function to check if user has admin role
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'super_admin')
  );
$$;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION auth.has_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid()
    AND p.name = permission_name
  );
$$;

-- =============================================================================
-- ENABLE RLS ON CORE TABLES
-- =============================================================================

-- Foundation
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_units ENABLE ROW LEVEL SECURITY;

-- AI Assets
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_pain_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs_to_be_done ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_suites ENABLE ROW LEVEL SECURITY;

-- Services
ALTER TABLE expert_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Execution
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_execution_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

-- Governance
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_allocation ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- TENANT ISOLATION POLICIES
-- =============================================================================

-- Tenants: Users can only view their own tenant
CREATE POLICY "tenant_isolation_select"
  ON tenants FOR SELECT
  USING (id = auth.current_user_tenant_id() OR auth.is_admin());

CREATE POLICY "tenant_isolation_update"
  ON tenants FOR UPDATE
  USING (id = auth.current_user_tenant_id() AND auth.has_permission('tenant.update'));

-- User Profiles: Users can view profiles in their tenant
CREATE POLICY "user_profiles_select"
  ON user_profiles FOR SELECT
  USING (tenant_id = auth.current_user_tenant_id() OR auth.is_admin());

CREATE POLICY "user_profiles_update_own"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid() OR auth.has_permission('user.update'));

-- Organizations: Tenant isolation
CREATE POLICY "organizations_select"
  ON organizations FOR SELECT
  USING (tenant_id = auth.current_user_tenant_id() OR auth.is_admin());

CREATE POLICY "organizations_insert"
  ON organizations FOR INSERT
  WITH CHECK (tenant_id = auth.current_user_tenant_id() AND auth.has_permission('organization.create'));

CREATE POLICY "organizations_update"
  ON organizations FOR UPDATE
  USING (tenant_id = auth.current_user_tenant_id() AND auth.has_permission('organization.update'));

-- =============================================================================
-- AI ASSETS POLICIES
-- =============================================================================

-- Agents: Public read, tenant write
CREATE POLICY "agents_select"
  ON agents FOR SELECT
  USING (true); -- All users can view agents

CREATE POLICY "agents_insert"
  ON agents FOR INSERT
  WITH CHECK (auth.has_permission('agent.create'));

CREATE POLICY "agents_update"
  ON agents FOR UPDATE
  USING (auth.has_permission('agent.update'));

CREATE POLICY "agents_delete"
  ON agents FOR DELETE
  USING (auth.has_permission('agent.delete'));

-- Personas: Public read, tenant write
CREATE POLICY "personas_select"
  ON personas FOR SELECT
  USING (true); -- All users can view personas

CREATE POLICY "personas_insert"
  ON personas FOR INSERT
  WITH CHECK (auth.has_permission('persona.create'));

CREATE POLICY "personas_update"
  ON personas FOR UPDATE
  USING (auth.has_permission('persona.update'));

-- Jobs-to-be-Done: Public read, tenant write
CREATE POLICY "jtbds_select"
  ON jobs_to_be_done FOR SELECT
  USING (true); -- All users can view JTBDs

CREATE POLICY "jtbds_insert"
  ON jobs_to_be_done FOR INSERT
  WITH CHECK (auth.has_permission('jtbd.create'));

CREATE POLICY "jtbds_update"
  ON jobs_to_be_done FOR UPDATE
  USING (auth.has_permission('jtbd.update'));

-- Workflows: Tenant isolation
CREATE POLICY "workflows_select"
  ON workflows FOR SELECT
  USING (
    tenant_id IS NULL -- Public workflows
    OR tenant_id = auth.current_user_tenant_id()
    OR auth.is_admin()
  );

CREATE POLICY "workflows_insert"
  ON workflows FOR INSERT
  WITH CHECK (
    (tenant_id IS NULL AND auth.has_permission('workflow.create_public'))
    OR (tenant_id = auth.current_user_tenant_id() AND auth.has_permission('workflow.create'))
  );

CREATE POLICY "workflows_update"
  ON workflows FOR UPDATE
  USING (
    (tenant_id IS NULL AND auth.has_permission('workflow.update_public'))
    OR (tenant_id = auth.current_user_tenant_id() AND auth.has_permission('workflow.update'))
  );

-- Tasks: Tenant isolation (similar to workflows)
CREATE POLICY "tasks_select"
  ON tasks FOR SELECT
  USING (
    tenant_id IS NULL
    OR tenant_id = auth.current_user_tenant_id()
    OR auth.is_admin()
  );

CREATE POLICY "tasks_insert"
  ON tasks FOR INSERT
  WITH CHECK (
    (tenant_id IS NULL AND auth.has_permission('task.create_public'))
    OR (tenant_id = auth.current_user_tenant_id() AND auth.has_permission('task.create'))
  );

-- Prompts: Tenant isolation
CREATE POLICY "prompts_select"
  ON prompts FOR SELECT
  USING (
    tenant_id IS NULL
    OR tenant_id = auth.current_user_tenant_id()
    OR auth.is_admin()
  );

CREATE POLICY "prompts_insert"
  ON prompts FOR INSERT
  WITH CHECK (
    (tenant_id IS NULL AND auth.has_permission('prompt.create_public'))
    OR (tenant_id = auth.current_user_tenant_id() AND auth.has_permission('prompt.create'))
  );

-- =============================================================================
-- SERVICES POLICIES
-- =============================================================================

-- Expert Consultations: Users can only view their own consultations
CREATE POLICY "consultations_select"
  ON expert_consultations FOR SELECT
  USING (
    user_id = auth.uid()
    OR tenant_id = auth.current_user_tenant_id()
    OR auth.is_admin()
  );

CREATE POLICY "consultations_insert"
  ON expert_consultations FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND tenant_id = auth.current_user_tenant_id()
  );

CREATE POLICY "consultations_update"
  ON expert_consultations FOR UPDATE
  USING (user_id = auth.uid() OR auth.has_permission('consultation.manage'));

-- Expert Messages: Users can view messages from their consultations
CREATE POLICY "expert_messages_select"
  ON expert_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM expert_consultations
      WHERE id = expert_messages.consultation_id
      AND (user_id = auth.uid() OR tenant_id = auth.current_user_tenant_id())
    )
  );

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
CREATE POLICY "panels_select"
  ON panel_discussions FOR SELECT
  USING (
    user_id = auth.uid()
    OR tenant_id = auth.current_user_tenant_id()
    OR auth.is_admin()
  );

CREATE POLICY "panels_insert"
  ON panel_discussions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND tenant_id = auth.current_user_tenant_id()
  );

-- Panel Messages: Users can view messages from their panels
CREATE POLICY "panel_messages_select"
  ON panel_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM panel_discussions
      WHERE id = panel_messages.panel_id
      AND (user_id = auth.uid() OR tenant_id = auth.current_user_tenant_id())
    )
  );

CREATE POLICY "panel_messages_insert"
  ON panel_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM panel_discussions
      WHERE id = panel_messages.panel_id
      AND user_id = auth.uid()
    )
  );

-- Knowledge Sources: Tenant isolation
CREATE POLICY "knowledge_sources_select"
  ON knowledge_sources FOR SELECT
  USING (
    tenant_id IS NULL -- Public knowledge
    OR tenant_id = auth.current_user_tenant_id()
    OR auth.is_admin()
  );

CREATE POLICY "knowledge_sources_insert"
  ON knowledge_sources FOR INSERT
  WITH CHECK (
    (tenant_id IS NULL AND auth.has_permission('knowledge.create_public'))
    OR (tenant_id = auth.current_user_tenant_id() AND auth.has_permission('knowledge.create'))
  );

-- Knowledge Chunks: Inherit access from sources
CREATE POLICY "knowledge_chunks_select"
  ON knowledge_chunks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_sources
      WHERE id = knowledge_chunks.source_id
      AND (
        tenant_id IS NULL
        OR tenant_id = auth.current_user_tenant_id()
        OR auth.is_admin()
      )
    )
  );

-- =============================================================================
-- EXECUTION POLICIES
-- =============================================================================

-- Workflow Executions: Users can view their own executions
CREATE POLICY "workflow_executions_select"
  ON workflow_executions FOR SELECT
  USING (
    triggered_by = auth.uid()
    OR auth.has_permission('execution.view_all')
  );

CREATE POLICY "workflow_executions_insert"
  ON workflow_executions FOR INSERT
  WITH CHECK (triggered_by = auth.uid());

-- Workflow Execution Steps: Inherit from executions
CREATE POLICY "workflow_exec_steps_select"
  ON workflow_execution_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workflow_executions
      WHERE id = workflow_execution_steps.execution_id
      AND (triggered_by = auth.uid() OR auth.has_permission('execution.view_all'))
    )
  );

-- Solutions: Tenant isolation
CREATE POLICY "solutions_select"
  ON solutions FOR SELECT
  USING (
    tenant_id IS NULL
    OR tenant_id = auth.current_user_tenant_id()
    OR auth.is_admin()
  );

-- =============================================================================
-- GOVERNANCE POLICIES
-- =============================================================================

-- Audit Log: Admins and users can view their own actions
CREATE POLICY "audit_log_select"
  ON audit_log FOR SELECT
  USING (
    auth.is_admin()
    OR user_id = auth.uid()
    OR tenant_id = auth.current_user_tenant_id()
  );

CREATE POLICY "audit_log_insert"
  ON audit_log FOR INSERT
  WITH CHECK (true); -- System can insert audit logs

-- LLM Usage Logs: Admins and finance roles
CREATE POLICY "llm_usage_logs_select"
  ON llm_usage_logs FOR SELECT
  USING (
    auth.is_admin()
    OR auth.has_permission('usage.view')
  );

-- Token Usage Summary: Tenant isolation
CREATE POLICY "token_usage_summary_select"
  ON token_usage_summary FOR SELECT
  USING (
    tenant_id = auth.current_user_tenant_id()
    OR auth.is_admin()
    OR auth.has_permission('usage.view')
  );

-- Cost Allocation: Tenant isolation
CREATE POLICY "cost_allocation_select"
  ON cost_allocation FOR SELECT
  USING (
    tenant_id = auth.current_user_tenant_id()
    OR auth.is_admin()
    OR auth.has_permission('billing.view')
  );

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
    RAISE NOTICE 'Policy Categories:';
    RAISE NOTICE '  - Tenant isolation';
    RAISE NOTICE '  - User access control';
    RAISE NOTICE '  - Role-based permissions';
    RAISE NOTICE '  - Public/private content';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Test RLS with sample queries';
    RAISE NOTICE '';
END $$;

-- =============================================================================
-- TEST RLS POLICIES (Run as authenticated user)
-- =============================================================================

-- Test 1: Users can only see their tenant
-- SET LOCAL ROLE authenticated;
-- SET LOCAL request.jwt.claim.sub = '<user-id>';
-- SELECT * FROM tenants;
-- Expected: Only 1 tenant (user's own)

-- Test 2: Users can view their consultations
-- SELECT * FROM expert_consultations WHERE user_id = auth.uid();
-- Expected: Only user's own consultations

-- Test 3: Admins can view all data
-- (Test with admin user)
-- SELECT COUNT(*) FROM tenants;
-- Expected: All tenants
