-- =============================================================================
-- PHASE 27: Row Level Security (RLS) Policies
-- =============================================================================
-- PURPOSE: Implement tenant data isolation and access control
-- TABLES: 0 new tables (adds RLS policies to existing tables)
-- TIME: ~30 minutes
-- =============================================================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs_to_be_done ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================================================

-- Get current user's tenant ID from JWT or session
CREATE OR REPLACE FUNCTION auth.current_tenant_id()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT COALESCE(
    current_setting('app.current_tenant_id', true)::uuid,
    (SELECT tenant_id FROM tenant_members
     WHERE user_id = auth.uid()
     AND is_active = true
     AND deleted_at IS NULL
     LIMIT 1)
  );
$$;

-- Check if current user has access to tenant (including parent tenants)
CREATE OR REPLACE FUNCTION auth.has_tenant_access(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM tenant_members tm
    JOIN tenants t ON tm.tenant_id = t.id
    WHERE tm.user_id = auth.uid()
    AND tm.is_active = true
    AND tm.deleted_at IS NULL
    AND (
      -- Direct tenant membership
      t.id = p_tenant_id
      OR
      -- Parent tenant access (hierarchical)
      (SELECT tenant_path FROM tenants WHERE id = p_tenant_id) <@ t.tenant_path
    )
  );
$$;

-- Check if current user has specific role in tenant
CREATE OR REPLACE FUNCTION auth.has_tenant_role(
  p_tenant_id UUID,
  p_role tenant_role
)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM tenant_members
    WHERE user_id = auth.uid()
    AND tenant_id = p_tenant_id
    AND role = p_role
    AND is_active = true
    AND deleted_at IS NULL
  );
$$;

-- =============================================================================
-- TENANT-SCOPED POLICIES (Standard tenant isolation)
-- =============================================================================

-- tenants: Users can only see their own tenants
CREATE POLICY tenant_isolation_tenants ON tenants
  FOR ALL TO authenticated
  USING (auth.has_tenant_access(id));

-- user_profiles: Users can see profiles in their tenant
CREATE POLICY tenant_isolation_users ON user_profiles
  FOR ALL TO authenticated
  USING (
    id = auth.uid() -- Own profile
    OR
    EXISTS( -- Profiles in same tenant
      SELECT 1 FROM tenant_members tm1
      JOIN tenant_members tm2 ON tm1.tenant_id = tm2.tenant_id
      WHERE tm1.user_id = auth.uid()
      AND tm2.user_id = user_profiles.id
      AND tm1.deleted_at IS NULL
      AND tm2.deleted_at IS NULL
    )
  );

-- tenant_members: Users can see members of their tenants
CREATE POLICY tenant_isolation_members ON tenant_members
  FOR ALL TO authenticated
  USING (auth.has_tenant_access(tenant_id));

-- agents: Tenant isolation
CREATE POLICY tenant_isolation_agents ON agents
  FOR ALL TO authenticated
  USING (auth.has_tenant_access(tenant_id));

-- personas: Tenant isolation
CREATE POLICY tenant_isolation_personas ON personas
  FOR ALL TO authenticated
  USING (auth.has_tenant_access(tenant_id));

-- jobs_to_be_done: Tenant isolation
CREATE POLICY tenant_isolation_jtbds ON jobs_to_be_done
  FOR ALL TO authenticated
  USING (auth.has_tenant_access(tenant_id));

-- workflows: Tenant isolation
CREATE POLICY tenant_isolation_workflows ON workflows
  FOR ALL TO authenticated
  USING (auth.has_tenant_access(tenant_id));

-- tasks: Tenant isolation
CREATE POLICY tenant_isolation_tasks ON tasks
  FOR ALL TO authenticated
  USING (auth.has_tenant_access(tenant_id));

-- prompts: Tenant isolation + public prompts
CREATE POLICY tenant_isolation_prompts ON prompts
  FOR ALL TO authenticated
  USING (
    auth.has_tenant_access(tenant_id)
    OR
    (is_active = true AND validation_status = 'approved') -- Public prompts
  );

-- prompt_suites: Tenant isolation + public suites
CREATE POLICY tenant_isolation_prompt_suites ON prompt_suites
  FOR ALL TO authenticated
  USING (
    auth.has_tenant_access(tenant_id)
    OR
    is_public = true
  );

-- knowledge_sources: Tenant isolation + data classification
CREATE POLICY tenant_isolation_knowledge ON knowledge_sources
  FOR SELECT TO authenticated
  USING (
    auth.has_tenant_access(tenant_id)
    AND (
      data_classification IN ('public', 'internal')
      OR
      auth.has_tenant_role(tenant_id, 'admin')
      OR
      auth.has_tenant_role(tenant_id, 'owner')
    )
  );

-- skills: Tenant isolation
CREATE POLICY tenant_isolation_skills ON skills
  FOR ALL TO authenticated
  USING (auth.has_tenant_access(tenant_id));

-- tools: Tenant isolation
CREATE POLICY tenant_isolation_tools ON tools
  FOR ALL TO authenticated
  USING (auth.has_tenant_access(tenant_id));

-- templates: Tenant isolation + public templates
CREATE POLICY tenant_isolation_templates ON templates
  FOR ALL TO authenticated
  USING (
    auth.has_tenant_access(tenant_id)
    OR
    is_public = true
  );

-- solutions: Tenant isolation + marketplace
CREATE POLICY tenant_isolation_solutions ON solutions
  FOR SELECT TO authenticated
  USING (
    auth.has_tenant_access(tenant_id)
    OR
    (is_public = true AND status = 'active')
  );

-- =============================================================================
-- CONSULTATION & PANEL POLICIES (User-owned or participant)
-- =============================================================================

-- expert_consultations: User can see own consultations
CREATE POLICY consultation_isolation ON expert_consultations
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    OR
    auth.has_tenant_role(tenant_id, 'admin')
    OR
    auth.has_tenant_role(tenant_id, 'owner')
  );

-- expert_messages: Visible to consultation participants
CREATE POLICY messages_isolation ON expert_messages
  FOR ALL TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM expert_consultations
      WHERE id = expert_messages.consultation_id
      AND (user_id = auth.uid() OR auth.has_tenant_role(tenant_id, 'admin'))
    )
  );

-- panel_discussions: User can see own panels
CREATE POLICY panel_isolation ON panel_discussions
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    OR
    auth.has_tenant_role(tenant_id, 'admin')
    OR
    auth.has_tenant_role(tenant_id, 'owner')
  );

-- panel_messages: Visible to panel participants
CREATE POLICY panel_messages_isolation ON panel_messages
  FOR ALL TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM panel_discussions
      WHERE id = panel_messages.panel_id
      AND (user_id = auth.uid() OR auth.has_tenant_role(tenant_id, 'admin'))
    )
  );

-- =============================================================================
-- WORKFLOW EXECUTION POLICIES
-- =============================================================================

-- workflow_executions: User can see own executions
CREATE POLICY workflow_exec_isolation ON workflow_executions
  FOR ALL TO authenticated
  USING (
    triggered_by = auth.uid()
    OR
    auth.has_tenant_role(tenant_id, 'admin')
    OR
    auth.has_tenant_role(tenant_id, 'owner')
  );

-- workflow_execution_steps: Visible if user can see execution
CREATE POLICY workflow_exec_steps_isolation ON workflow_execution_steps
  FOR ALL TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM workflow_executions
      WHERE id = workflow_execution_steps.execution_id
      AND (triggered_by = auth.uid() OR auth.has_tenant_role(tenant_id, 'admin'))
    )
  );

-- =============================================================================
-- DELIVERABLES POLICIES
-- =============================================================================

-- deliverables: Visible if user can see source
CREATE POLICY deliverables_isolation ON deliverables
  FOR ALL TO authenticated
  USING (
    auth.has_tenant_access(tenant_id)
    AND (
      auth.has_tenant_role(tenant_id, 'admin')
      OR
      -- Can see if user owns source consultation/panel/workflow
      EXISTS(
        SELECT 1 FROM expert_consultations
        WHERE id = deliverables.consultation_id
        AND user_id = auth.uid()
      )
      OR
      EXISTS(
        SELECT 1 FROM panel_discussions
        WHERE id = deliverables.panel_id
        AND user_id = auth.uid()
      )
      OR
      EXISTS(
        SELECT 1 FROM workflow_executions
        WHERE id = deliverables.workflow_execution_id
        AND triggered_by = auth.uid()
      )
    )
  );

-- =============================================================================
-- SERVICE ROLE BYPASS (For backend services)
-- =============================================================================

-- Allow service role to bypass RLS (for migrations, cron jobs, etc.)
CREATE POLICY service_role_bypass_all ON tenants
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Apply service role bypass to all major tables
DO $$
DECLARE
  table_name TEXT;
  table_names TEXT[] := ARRAY[
    'agents', 'personas', 'jobs_to_be_done', 'workflows', 'tasks',
    'prompts', 'knowledge_sources', 'expert_consultations', 'panel_discussions',
    'workflow_executions', 'deliverables', 'llm_usage_logs', 'audit_log'
  ];
BEGIN
  FOREACH table_name IN ARRAY table_names
  LOOP
    EXECUTE format('
      CREATE POLICY service_role_bypass_%I ON %I
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true)
    ', table_name, table_name);
  END LOOP;
END $$;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    rls_enabled_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Count tables with RLS enabled
    SELECT COUNT(*) INTO rls_enabled_count
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
    AND c.relrowsecurity = true;

    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 27 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables with RLS enabled: %', rls_enabled_count;
    RAISE NOTICE 'Total RLS policies: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Security Features:';
    RAISE NOTICE '  - Multi-tenant data isolation';
    RAISE NOTICE '  - Hierarchical tenant access';
    RAISE NOTICE '  - Role-based access control';
    RAISE NOTICE '  - User-owned resource policies';
    RAISE NOTICE '  - Service role bypass for backend';
    RAISE NOTICE '';
    RAISE NOTICE 'Helper Functions:';
    RAISE NOTICE '  - auth.current_tenant_id()';
    RAISE NOTICE '  - auth.has_tenant_access(UUID)';
    RAISE NOTICE '  - auth.has_tenant_role(UUID, tenant_role)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 28 (Helper Functions & Seed Data)';
    RAISE NOTICE '';
END $$;
