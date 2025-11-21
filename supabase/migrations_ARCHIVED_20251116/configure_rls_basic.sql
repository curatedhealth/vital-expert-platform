-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - BASIC VERSION
-- =============================================================================
-- PURPOSE: User-owned data protection only (no tenant isolation)
-- APPLY: Via Supabase Dashboard SQL Editor
-- =============================================================================

-- =============================================================================
-- ENABLE RLS ON USER-OWNED TABLES ONLY
-- =============================================================================

-- These tables have user_id and triggered_by columns
ALTER TABLE IF EXISTS expert_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expert_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS panel_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS panel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- POLICIES: Users can only access their own data
-- =============================================================================

-- Expert Consultations
DROP POLICY IF EXISTS "users_own_consultations" ON expert_consultations;
CREATE POLICY "users_own_consultations"
  ON expert_consultations
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Expert Messages (via consultation ownership)
DROP POLICY IF EXISTS "users_own_consultation_messages" ON expert_messages;
CREATE POLICY "users_own_consultation_messages"
  ON expert_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM expert_consultations
      WHERE id = expert_messages.consultation_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expert_consultations
      WHERE id = expert_messages.consultation_id
      AND user_id = auth.uid()
    )
  );

-- Panel Discussions
DROP POLICY IF EXISTS "users_own_panels" ON panel_discussions;
CREATE POLICY "users_own_panels"
  ON panel_discussions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Panel Messages (via panel ownership)
DROP POLICY IF EXISTS "users_own_panel_messages" ON panel_messages;
CREATE POLICY "users_own_panel_messages"
  ON panel_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM panel_discussions
      WHERE id = panel_messages.panel_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM panel_discussions
      WHERE id = panel_messages.panel_id
      AND user_id = auth.uid()
    )
  );

-- Workflow Executions
DROP POLICY IF EXISTS "users_own_executions" ON workflow_executions;
CREATE POLICY "users_own_executions"
  ON workflow_executions
  FOR ALL
  USING (triggered_by = auth.uid())
  WITH CHECK (triggered_by = auth.uid());

-- Audit Log (read-only for users, write for system)
DROP POLICY IF EXISTS "users_read_own_audit" ON audit_log;
CREATE POLICY "users_read_own_audit"
  ON audit_log
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "system_write_audit" ON audit_log;
CREATE POLICY "system_write_audit"
  ON audit_log
  FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    rls_enabled_count INTEGER;
    policy_count INTEGER;
    consultation_count INTEGER;
    panel_count INTEGER;
    execution_count INTEGER;
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

    -- Count existing data (if any)
    SELECT COUNT(*) INTO consultation_count FROM expert_consultations;
    SELECT COUNT(*) INTO panel_count FROM panel_discussions;
    SELECT COUNT(*) INTO execution_count FROM workflow_executions;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ BASIC RLS CONFIGURED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables with RLS enabled: %', rls_enabled_count;
    RAISE NOTICE 'Total policies created: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Protected Tables:';
    RAISE NOTICE '  - expert_consultations (% records)', consultation_count;
    RAISE NOTICE '  - expert_messages';
    RAISE NOTICE '  - panel_discussions (% records)', panel_count;
    RAISE NOTICE '  - panel_messages';
    RAISE NOTICE '  - workflow_executions (% records)', execution_count;
    RAISE NOTICE '  - audit_log';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Policy Summary:';
    RAISE NOTICE '  ✅ Users can only view/edit their own consultations';
    RAISE NOTICE '  ✅ Users can only view/edit their own panels';
    RAISE NOTICE '  ✅ Users can only view their own executions';
    RAISE NOTICE '  ✅ Users can view their own audit log entries';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Public Tables (No RLS):';
    RAISE NOTICE '  - agents (all users can view)';
    RAISE NOTICE '  - personas (all users can view)';
    RAISE NOTICE '  - jobs_to_be_done (all users can view)';
    RAISE NOTICE '  - workflows (all users can view)';
    RAISE NOTICE '  - tasks (all users can view)';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test Queries:';
    RAISE NOTICE '  SELECT * FROM expert_consultations;';
    RAISE NOTICE '    → Should only show consultations where user_id = your user ID';
    RAISE NOTICE '';
    RAISE NOTICE '  SELECT * FROM agents;';
    RAISE NOTICE '    → Should show all agents (no RLS)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ RLS configuration complete!';
    RAISE NOTICE '';
END $$;
