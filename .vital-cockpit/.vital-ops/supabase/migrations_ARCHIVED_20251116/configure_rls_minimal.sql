-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - MINIMAL VERSION
-- =============================================================================
-- PURPOSE: Basic RLS without requiring tenant_id column
-- APPLY: Via Supabase Dashboard SQL Editor
-- NOTE: Works with existing schema, can be enhanced later
-- =============================================================================

-- =============================================================================
-- ENABLE RLS ON CORE TABLES
-- =============================================================================

-- Only enable RLS on tables that exist and have proper columns
ALTER TABLE IF EXISTS expert_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expert_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS panel_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS panel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- BASIC USER-OWNED DATA POLICIES
-- =============================================================================
-- These policies allow users to only access data they created

-- Expert Consultations: Users can only view their own
DROP POLICY IF EXISTS "consultations_select_own" ON expert_consultations;
CREATE POLICY "consultations_select_own"
  ON expert_consultations FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "consultations_insert_own" ON expert_consultations;
CREATE POLICY "consultations_insert_own"
  ON expert_consultations FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "consultations_update_own" ON expert_consultations;
CREATE POLICY "consultations_update_own"
  ON expert_consultations FOR UPDATE
  USING (user_id = auth.uid());

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

-- Panel Discussions: Users can only view their own
DROP POLICY IF EXISTS "panels_select_own" ON panel_discussions;
CREATE POLICY "panels_select_own"
  ON panel_discussions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "panels_insert_own" ON panel_discussions;
CREATE POLICY "panels_insert_own"
  ON panel_discussions FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "panels_update_own" ON panel_discussions;
CREATE POLICY "panels_update_own"
  ON panel_discussions FOR UPDATE
  USING (user_id = auth.uid());

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
  );

DROP POLICY IF EXISTS "panel_messages_insert" ON panel_messages;
CREATE POLICY "panel_messages_insert"
  ON panel_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM panel_discussions
      WHERE id = panel_messages.panel_id
      AND user_id = auth.uid()
    )
  );

-- Workflow Executions: Users can view their own executions
DROP POLICY IF EXISTS "workflow_execs_select" ON workflow_executions;
CREATE POLICY "workflow_execs_select"
  ON workflow_executions FOR SELECT
  USING (triggered_by = auth.uid());

DROP POLICY IF EXISTS "workflow_execs_insert" ON workflow_executions;
CREATE POLICY "workflow_execs_insert"
  ON workflow_executions FOR INSERT
  WITH CHECK (triggered_by = auth.uid());

-- Audit Log: Users can view their own actions
DROP POLICY IF EXISTS "audit_log_select" ON audit_log;
CREATE POLICY "audit_log_select"
  ON audit_log FOR SELECT
  USING (user_id = auth.uid());

-- Allow system to insert audit logs
DROP POLICY IF EXISTS "audit_log_insert" ON audit_log;
CREATE POLICY "audit_log_insert"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- PUBLIC READ POLICIES (Optional - uncomment if needed)
-- =============================================================================

-- Uncomment these if you want all authenticated users to read agents/personas/JTBDs

-- DROP POLICY IF EXISTS "agents_select_all" ON agents;
-- CREATE POLICY "agents_select_all"
--   ON agents FOR SELECT
--   USING (auth.role() = 'authenticated');

-- DROP POLICY IF EXISTS "personas_select_all" ON personas;
-- CREATE POLICY "personas_select_all"
--   ON personas FOR SELECT
--   USING (auth.role() = 'authenticated');

-- DROP POLICY IF EXISTS "jtbds_select_all" ON jobs_to_be_done;
-- CREATE POLICY "jtbds_select_all"
--   ON jobs_to_be_done FOR SELECT
--   USING (auth.role() = 'authenticated');

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
    RAISE NOTICE '✅ MINIMAL RLS CONFIGURED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables with RLS enabled: %', rls_count;
    RAISE NOTICE 'Total policies created: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Policies Applied:';
    RAISE NOTICE '  - Expert consultations (user-owned)';
    RAISE NOTICE '  - Panel discussions (user-owned)';
    RAISE NOTICE '  - Workflow executions (user-owned)';
    RAISE NOTICE '  - Audit log (read-only for users)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  NOTE:';
    RAISE NOTICE 'This is a minimal RLS setup that works with your current schema.';
    RAISE NOTICE 'Tables like agents, personas, JTBDs do not have RLS enabled yet.';
    RAISE NOTICE 'To enable, uncomment the PUBLIC READ POLICIES section above.';
    RAISE NOTICE '';
    RAISE NOTICE 'Test with:';
    RAISE NOTICE '  SELECT * FROM expert_consultations;  -- Only shows your consultations';
    RAISE NOTICE '  SELECT * FROM agents;  -- Shows all agents (no RLS)';
    RAISE NOTICE '';
END $$;

-- =============================================================================
-- OPTIONAL: ADD tenant_id COLUMN FOR FUTURE TENANT ISOLATION
-- =============================================================================

-- Uncomment this section if you want to add tenant_id for proper multi-tenancy

/*
-- Add tenant_id to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
    AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN tenant_id UUID;
    RAISE NOTICE 'Added tenant_id column to user_profiles';
  END IF;
END $$;

-- Create a helper function for tenant isolation (after adding column)
CREATE OR REPLACE FUNCTION public.current_user_tenant_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT tenant_id
  FROM user_profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Then you can add tenant-based policies like:
-- CREATE POLICY "tenant_isolation"
--   ON some_table FOR SELECT
--   USING (tenant_id = public.current_user_tenant_id());
*/
