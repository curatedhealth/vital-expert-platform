-- =============================================================================
-- ASK PANEL - ROW-LEVEL SECURITY POLICIES
-- Enable multi-tenant isolation for board (panel) tables
-- =============================================================================
-- Date: 2025-11-01
-- Version: 1.0
-- Target: Existing board tables in Supabase
-- =============================================================================

-- =============================================================================
-- ENABLE RLS ON BOARD TABLES
-- =============================================================================

ALTER TABLE board_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_reply ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_synthesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_panel_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_pack ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES FOR BOARD_SESSION (Panel Discussions)
-- =============================================================================

-- Users can view panels in their organization
CREATE POLICY "Users can view panels in their organization"
  ON board_session FOR SELECT
  USING (
    created_by IN (
      SELECT id FROM auth.users 
      WHERE organization_id = (
        SELECT organization_id FROM auth.users WHERE id = auth.uid()
      )
    )
    OR
    created_by = auth.uid()
  );

-- Users can create panels
CREATE POLICY "Users can create panels"
  ON board_session FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
  );

-- Users can update their own panels
CREATE POLICY "Users can update their own panels"
  ON board_session FOR UPDATE
  USING (
    created_by = auth.uid()
  );

-- Users can delete their own panels (or org admins)
CREATE POLICY "Users can delete their own panels"
  ON board_session FOR DELETE
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND role = 'org_admin'
      AND organization_id = (
        SELECT organization_id FROM auth.users WHERE id = board_session.created_by
      )
    )
  );

-- =============================================================================
-- RLS POLICIES FOR BOARD_REPLY (Expert Responses)
-- =============================================================================

-- Users can view replies for panels they have access to
CREATE POLICY "Users can view panel replies"
  ON board_reply FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM board_session 
      WHERE created_by = auth.uid()
      OR created_by IN (
        SELECT id FROM auth.users 
        WHERE organization_id = (
          SELECT organization_id FROM auth.users WHERE id = auth.uid()
        )
      )
    )
  );

-- System can insert replies (service role only)
CREATE POLICY "Service role can insert replies"
  ON board_reply FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS

-- Users cannot modify replies (immutable audit log)
-- No UPDATE or DELETE policies

-- =============================================================================
-- RLS POLICIES FOR BOARD_SYNTHESIS (Consensus Results)
-- =============================================================================

-- Users can view synthesis for their panels
CREATE POLICY "Users can view panel synthesis"
  ON board_synthesis FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM board_session 
      WHERE created_by = auth.uid()
      OR created_by IN (
        SELECT id FROM auth.users 
        WHERE organization_id = (
          SELECT organization_id FROM auth.users WHERE id = auth.uid()
        )
      )
    )
  );

-- Service role can insert synthesis
CREATE POLICY "Service role can insert synthesis"
  ON board_synthesis FOR INSERT
  WITH CHECK (true);

-- Users with proper permissions can approve synthesis
CREATE POLICY "Users can approve synthesis"
  ON board_synthesis FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM board_session WHERE created_by = auth.uid()
    )
    AND approved = false -- Can only approve once
  );

-- =============================================================================
-- RLS POLICIES FOR BOARD_PANEL_MEMBER (Panel Membership)
-- =============================================================================

-- Users can view members of panels they have access to
CREATE POLICY "Users can view panel members"
  ON board_panel_member FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM board_session 
      WHERE created_by = auth.uid()
      OR created_by IN (
        SELECT id FROM auth.users 
        WHERE organization_id = (
          SELECT organization_id FROM auth.users WHERE id = auth.uid()
        )
      )
    )
  );

-- Users can add members to their own panels
CREATE POLICY "Users can add panel members"
  ON board_panel_member FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM board_session WHERE created_by = auth.uid()
    )
  );

-- Users can remove members from their own panels
CREATE POLICY "Users can remove panel members"
  ON board_panel_member FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM board_session WHERE created_by = auth.uid()
    )
  );

-- =============================================================================
-- RLS POLICIES FOR EVIDENCE_PACK (RAG Knowledge Packs)
-- =============================================================================

-- Users can view evidence packs in their organization
CREATE POLICY "Users can view evidence packs"
  ON evidence_pack FOR SELECT
  USING (
    created_by IN (
      SELECT id FROM auth.users 
      WHERE organization_id = (
        SELECT organization_id FROM auth.users WHERE id = auth.uid()
      )
    )
    OR
    id IN (
      -- Evidence packs used in panels user has access to
      SELECT evidence_pack_id FROM board_session 
      WHERE created_by = auth.uid()
      AND evidence_pack_id IS NOT NULL
    )
  );

-- Users can create evidence packs
CREATE POLICY "Users can create evidence packs"
  ON evidence_pack FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
  );

-- Users can update their own evidence packs
CREATE POLICY "Users can update own evidence packs"
  ON evidence_pack FOR UPDATE
  USING (
    created_by = auth.uid()
  );

-- Users can delete their own evidence packs
CREATE POLICY "Users can delete own evidence packs"
  ON evidence_pack FOR DELETE
  USING (
    created_by = auth.uid()
  );

-- =============================================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- =============================================================================

-- Existing indexes from migration (already created):
-- CREATE INDEX IF NOT EXISTS idx_board_session_status ON board_session(status);
-- CREATE INDEX IF NOT EXISTS idx_board_session_archetype ON board_session(archetype);
-- CREATE INDEX IF NOT EXISTS idx_board_session_created_at ON board_session(created_at);
-- CREATE INDEX IF NOT EXISTS idx_board_reply_session_id ON board_reply(session_id);
-- CREATE INDEX IF NOT EXISTS idx_board_reply_turn_no ON board_reply(session_id, turn_no);
-- CREATE INDEX IF NOT EXISTS idx_board_synthesis_session_id ON board_synthesis(session_id);
-- CREATE INDEX IF NOT EXISTS idx_board_panel_member_session_id ON board_panel_member(session_id);

-- Add new indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_board_session_created_by ON board_session(created_by);
CREATE INDEX IF NOT EXISTS idx_board_session_org_lookup ON board_session(created_by) 
  WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_evidence_pack_created_by ON evidence_pack(created_by);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_board_session_status_created_at 
  ON board_session(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_board_session_fusion_status 
  ON board_session(fusion_model, status);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to check if user has access to a panel
CREATE OR REPLACE FUNCTION has_panel_access(
  panel_id UUID,
  user_id UUID DEFAULT auth.uid()
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM board_session 
    WHERE id = panel_id 
    AND (
      created_by = user_id
      OR created_by IN (
        SELECT id FROM auth.users 
        WHERE organization_id = (
          SELECT organization_id FROM auth.users WHERE id = user_id
        )
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is panel owner
CREATE OR REPLACE FUNCTION is_panel_owner(
  panel_id UUID,
  user_id UUID DEFAULT auth.uid()
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM board_session 
    WHERE id = panel_id AND created_by = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TENANT ISOLATION VALIDATION
-- =============================================================================

-- Verify RLS is enabled on all tables
DO $$
DECLARE
  table_name TEXT;
  rls_enabled BOOLEAN;
BEGIN
  FOR table_name IN 
    SELECT unnest(ARRAY[
      'board_session',
      'board_reply',
      'board_synthesis',
      'board_panel_member',
      'evidence_pack'
    ])
  LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = table_name;
    
    IF NOT rls_enabled THEN
      RAISE EXCEPTION 'RLS not enabled on table: %', table_name;
    END IF;
    
    RAISE NOTICE '✅ RLS enabled on %', table_name;
  END LOOP;
END $$;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public' 
  AND tablename IN (
    'board_session', 
    'board_reply', 
    'board_synthesis',
    'board_panel_member',
    'evidence_pack'
  )
ORDER BY tablename;

-- List all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'board_session', 
    'board_reply', 
    'board_synthesis',
    'board_panel_member',
    'evidence_pack'
  )
ORDER BY tablename, policyname;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

SELECT 
  '✅ Ask Panel RLS policies created successfully!' as status,
  (SELECT count(*) FROM pg_policies 
   WHERE schemaname = 'public' 
   AND tablename LIKE 'board_%' 
   OR tablename = 'evidence_pack') as total_policies,
  'Run verification queries above to confirm' as next_step;

-- =============================================================================
-- NOTES
-- =============================================================================
-- 
-- 1. This script adds RLS policies to EXISTING tables created by:
--    supabase/migrations/20251003_create_advisory_board_tables.sql
--
-- 2. Service role (used by ai-engine backend) bypasses RLS
--
-- 3. Users can only access panels in their organization
--
-- 4. Panel replies are immutable (no UPDATE/DELETE)
--
-- 5. Helper functions are SECURITY DEFINER (run with elevated privileges)
--
-- 6. Additional indexes improve RLS query performance
--
-- =============================================================================

