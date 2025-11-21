-- =============================================================================
-- ASK PANEL - COMPLETE SETUP SCRIPT
-- Creates board tables AND applies RLS policies for multi-tenant isolation
-- =============================================================================
-- Date: 2025-11-01
-- Version: 1.0
-- Run this in Supabase SQL Editor
-- =============================================================================

-- =============================================================================
-- STEP 1: CREATE BOARD TABLES (if they don't exist)
-- =============================================================================

-- Board Sessions Table
CREATE TABLE IF NOT EXISTS board_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  archetype TEXT NOT NULL, -- 'SAB', 'CAB', 'Market', 'Strategic', 'Ethics', etc.
  fusion_model TEXT NOT NULL, -- 'human_led', 'agent_facilitated', 'symbiotic', 'autonomous', 'continuous'
  mode TEXT NOT NULL, -- 'parallel', 'sequential', 'scripted', 'debate', 'scenario', 'dynamic'
  agenda JSONB NOT NULL DEFAULT '[]',
  evidence_pack_id UUID,
  policy_profile TEXT DEFAULT 'MEDICAL', -- 'MEDICAL', 'COMMERCIAL', 'R&D'
  created_by UUID,
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'completed', 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Board Replies (Expert Responses)
CREATE TABLE IF NOT EXISTS board_reply (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES board_session(id) ON DELETE CASCADE,
  turn_no INTEGER NOT NULL,
  persona TEXT NOT NULL, -- 'KOL', 'PAYER', 'REGULATOR', 'BIOSTAT', 'PATIENT', etc.
  agent_id UUID, -- reference to agents table if needed
  answer TEXT NOT NULL,
  citations JSONB DEFAULT '[]', -- [{id, title, url, snippet, citation}]
  confidence NUMERIC(3,2), -- 0.00 to 1.00
  flags TEXT[] DEFAULT '{}', -- ['Needs Human Review', 'Data Ambiguity', etc.]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Board Synthesis (Consensus + Dissent)
CREATE TABLE IF NOT EXISTS board_synthesis (
  session_id UUID NOT NULL REFERENCES board_session(id) ON DELETE CASCADE,
  turn_no INTEGER NOT NULL,
  summary_md TEXT NOT NULL, -- Executive summary in markdown
  consensus TEXT, -- Consensus statement
  dissent TEXT, -- Key disagreements
  risks JSONB DEFAULT '[]', -- [{risk, assumption, data_request}]
  approved BOOLEAN DEFAULT FALSE,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(session_id, turn_no)
);

-- Evidence Packs (for RAG)
CREATE TABLE IF NOT EXISTS evidence_pack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  therapeutic_area TEXT,
  products TEXT[] DEFAULT '{}',
  sources JSONB DEFAULT '[]', -- [{source_id, title, type, url}]
  embeddings_ref TEXT, -- Reference to vector store
  created_by UUID, -- Added for RLS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Panel Members (Link agents to sessions)
CREATE TABLE IF NOT EXISTS board_panel_member (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES board_session(id) ON DELETE CASCADE,
  agent_id UUID, -- reference to agents table
  persona TEXT NOT NULL,
  role TEXT DEFAULT 'expert', -- 'expert', 'facilitator', 'observer'
  weight NUMERIC(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes for board_session
CREATE INDEX IF NOT EXISTS idx_board_session_status ON board_session(status);
CREATE INDEX IF NOT EXISTS idx_board_session_archetype ON board_session(archetype);
CREATE INDEX IF NOT EXISTS idx_board_session_created_at ON board_session(created_at);
CREATE INDEX IF NOT EXISTS idx_board_session_created_by ON board_session(created_by);
CREATE INDEX IF NOT EXISTS idx_board_session_status_created_at ON board_session(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_board_session_fusion_status ON board_session(fusion_model, status);

-- Indexes for board_reply
CREATE INDEX IF NOT EXISTS idx_board_reply_session_id ON board_reply(session_id);
CREATE INDEX IF NOT EXISTS idx_board_reply_turn_no ON board_reply(session_id, turn_no);

-- Indexes for board_synthesis
CREATE INDEX IF NOT EXISTS idx_board_synthesis_session_id ON board_synthesis(session_id);

-- Indexes for board_panel_member
CREATE INDEX IF NOT EXISTS idx_board_panel_member_session_id ON board_panel_member(session_id);

-- Indexes for evidence_pack
CREATE INDEX IF NOT EXISTS idx_evidence_pack_created_by ON evidence_pack(created_by);

-- =============================================================================
-- STEP 3: CREATE TRIGGERS
-- =============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_board_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS board_session_updated_at ON board_session;
CREATE TRIGGER board_session_updated_at
  BEFORE UPDATE ON board_session
  FOR EACH ROW
  EXECUTE FUNCTION update_board_session_updated_at();

-- =============================================================================
-- STEP 4: ENABLE ROW-LEVEL SECURITY
-- =============================================================================

ALTER TABLE board_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_reply ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_synthesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_panel_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_pack ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 5: DROP OLD POLICIES (if they exist)
-- =============================================================================

DROP POLICY IF EXISTS board_session_policy ON board_session;
DROP POLICY IF EXISTS board_reply_policy ON board_reply;
DROP POLICY IF EXISTS board_synthesis_policy ON board_synthesis;
DROP POLICY IF EXISTS evidence_pack_policy ON evidence_pack;
DROP POLICY IF EXISTS board_panel_member_policy ON board_panel_member;

-- Drop any policies from previous RLS script
DROP POLICY IF EXISTS "Users can view panels in their organization" ON board_session;
DROP POLICY IF EXISTS "Users can create panels" ON board_session;
DROP POLICY IF EXISTS "Users can update their own panels" ON board_session;
DROP POLICY IF EXISTS "Users can delete their own panels" ON board_session;
DROP POLICY IF EXISTS "Users can view panel replies" ON board_reply;
DROP POLICY IF EXISTS "Service role can insert replies" ON board_reply;
DROP POLICY IF EXISTS "Users can view panel synthesis" ON board_synthesis;
DROP POLICY IF EXISTS "Service role can insert synthesis" ON board_synthesis;
DROP POLICY IF EXISTS "Users can approve synthesis" ON board_synthesis;
DROP POLICY IF EXISTS "Users can view panel members" ON board_panel_member;
DROP POLICY IF EXISTS "Users can add panel members" ON board_panel_member;
DROP POLICY IF EXISTS "Users can remove panel members" ON board_panel_member;
DROP POLICY IF EXISTS "Users can view evidence packs" ON evidence_pack;
DROP POLICY IF EXISTS "Users can create evidence packs" ON evidence_pack;
DROP POLICY IF EXISTS "Users can update own evidence packs" ON evidence_pack;
DROP POLICY IF EXISTS "Users can delete own evidence packs" ON evidence_pack;

-- =============================================================================
-- STEP 6: CREATE NEW MULTI-TENANT RLS POLICIES
-- =============================================================================

-- BOARD_SESSION POLICIES
-- Users can view panels in their organization OR their own panels
CREATE POLICY "Users can view panels in their organization"
  ON board_session FOR SELECT
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM auth.users u1, auth.users u2
      WHERE u1.id = auth.uid() 
      AND u2.id = board_session.created_by
      AND u1.raw_user_meta_data->>'organization_id' = u2.raw_user_meta_data->>'organization_id'
    )
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

-- Users can delete their own panels
CREATE POLICY "Users can delete their own panels"
  ON board_session FOR DELETE
  USING (
    created_by = auth.uid()
  );

-- BOARD_REPLY POLICIES
-- Users can view replies for panels they have access to
CREATE POLICY "Users can view panel replies"
  ON board_reply FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM board_session 
      WHERE created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM auth.users u1, auth.users u2
        WHERE u1.id = auth.uid() 
        AND u2.id = board_session.created_by
        AND u1.raw_user_meta_data->>'organization_id' = u2.raw_user_meta_data->>'organization_id'
      )
    )
  );

-- Service role can insert replies (bypasses RLS automatically)
CREATE POLICY "Service role can insert replies"
  ON board_reply FOR INSERT
  WITH CHECK (true);

-- BOARD_SYNTHESIS POLICIES
-- Users can view synthesis for their panels
CREATE POLICY "Users can view panel synthesis"
  ON board_synthesis FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM board_session 
      WHERE created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM auth.users u1, auth.users u2
        WHERE u1.id = auth.uid() 
        AND u2.id = board_session.created_by
        AND u1.raw_user_meta_data->>'organization_id' = u2.raw_user_meta_data->>'organization_id'
      )
    )
  );

-- Service role can insert synthesis
CREATE POLICY "Service role can insert synthesis"
  ON board_synthesis FOR INSERT
  WITH CHECK (true);

-- Users can approve synthesis for their own panels
CREATE POLICY "Users can approve synthesis"
  ON board_synthesis FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM board_session WHERE created_by = auth.uid()
    )
    AND approved = false
  );

-- BOARD_PANEL_MEMBER POLICIES
-- Users can view members of panels they have access to
CREATE POLICY "Users can view panel members"
  ON board_panel_member FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM board_session 
      WHERE created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM auth.users u1, auth.users u2
        WHERE u1.id = auth.uid() 
        AND u2.id = board_session.created_by
        AND u1.raw_user_meta_data->>'organization_id' = u2.raw_user_meta_data->>'organization_id'
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

-- EVIDENCE_PACK POLICIES
-- Users can view evidence packs in their organization
CREATE POLICY "Users can view evidence packs"
  ON evidence_pack FOR SELECT
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM auth.users u1, auth.users u2
      WHERE u1.id = auth.uid() 
      AND u2.id = evidence_pack.created_by
      AND u1.raw_user_meta_data->>'organization_id' = u2.raw_user_meta_data->>'organization_id'
    )
    OR
    id IN (
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
-- STEP 7: CREATE HELPER FUNCTIONS
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
      OR EXISTS (
        SELECT 1 FROM auth.users u1, auth.users u2
        WHERE u1.id = user_id 
        AND u2.id = board_session.created_by
        AND u1.raw_user_meta_data->>'organization_id' = u2.raw_user_meta_data->>'organization_id'
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
-- STEP 8: ADD TABLE COMMENTS
-- =============================================================================

COMMENT ON TABLE board_session IS 'Virtual advisory board sessions with expert panels';
COMMENT ON TABLE board_reply IS 'Individual expert responses within board sessions';
COMMENT ON TABLE board_synthesis IS 'Synthesis of expert responses with consensus and dissent';
COMMENT ON TABLE evidence_pack IS 'Curated evidence packs for RAG retrieval';
COMMENT ON TABLE board_panel_member IS 'Panel composition for each session';

-- =============================================================================
-- STEP 9: VERIFICATION
-- =============================================================================

-- Check that all tables exist
DO $$
DECLARE
  missing_tables TEXT[];
  tbl_name TEXT;
BEGIN
  missing_tables := ARRAY[]::TEXT[];
  
  FOR tbl_name IN 
    SELECT unnest(ARRAY[
      'board_session',
      'board_reply',
      'board_synthesis',
      'board_panel_member',
      'evidence_pack'
    ])
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = tbl_name
    ) THEN
      missing_tables := array_append(missing_tables, tbl_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
  END IF;
  
  RAISE NOTICE '✅ All board tables exist';
END $$;

-- Verify RLS is enabled
DO $$
DECLARE
  tbl_name TEXT;
  rls_enabled BOOLEAN;
BEGIN
  FOR tbl_name IN 
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
    WHERE relname = tbl_name;
    
    IF NOT rls_enabled THEN
      RAISE EXCEPTION 'RLS not enabled on table: %', tbl_name;
    END IF;
    
    RAISE NOTICE '✅ RLS enabled on %', tbl_name;
  END LOOP;
END $$;

-- Display summary
SELECT 
  '✅ Ask Panel setup complete!' as status,
  (SELECT count(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('board_session', 'board_reply', 'board_synthesis', 'board_panel_member', 'evidence_pack')) as tables_created,
  (SELECT count(*) FROM pg_policies 
   WHERE schemaname = 'public' 
   AND tablename IN ('board_session', 'board_reply', 'board_synthesis', 'board_panel_member', 'evidence_pack')) as policies_created,
  (SELECT count(*) FROM pg_indexes 
   WHERE schemaname = 'public' 
   AND tablename IN ('board_session', 'board_reply', 'board_synthesis', 'board_panel_member', 'evidence_pack')) as indexes_created;

-- List all policies
SELECT 
  tablename,
  policyname,
  cmd as operation
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
-- NOTES
-- =============================================================================
--
-- This script:
-- 1. Creates all board tables if they don't exist
-- 2. Adds all necessary indexes for performance
-- 3. Enables Row-Level Security (RLS)
-- 4. Creates multi-tenant isolation policies
-- 5. Adds helper functions for access control
-- 6. Verifies setup is complete
--
-- Organization isolation is based on:
-- - auth.users.raw_user_meta_data->>'organization_id'
--
-- If you use a different field for organization, update the policies accordingly.
--
-- Service role (used by ai-engine backend) automatically bypasses RLS.
--
-- =============================================================================

