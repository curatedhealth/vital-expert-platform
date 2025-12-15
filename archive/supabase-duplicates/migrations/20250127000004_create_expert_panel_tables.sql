-- Migration: Create Expert Panel Tables
-- Purpose: Multi-expert panel sessions, consensus tracking, workflow execution
-- Created: 2025-11-27
-- Priority: MEDIUM - Advanced Ask Expert features

-- ============================================================================
-- Table 1: expert_panel_sessions
-- Purpose: Track multi-expert panel consultations
-- ============================================================================

CREATE TABLE IF NOT EXISTS expert_panel_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES ask_expert_sessions(id) ON DELETE CASCADE,
  panel_configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {"expert_ids": ["expert_001", "expert_002"], "consensus_strategy": "voting"}
  consensus_strategy text NOT NULL DEFAULT 'voting' CHECK (consensus_strategy IN ('voting', 'weighted', 'llm_aggregation', 'unanimous')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expert_panel_sessions_session
  ON expert_panel_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_expert_panel_sessions_status
  ON expert_panel_sessions(status);
CREATE INDEX IF NOT EXISTS idx_expert_panel_sessions_created
  ON expert_panel_sessions(created_at DESC);

-- RLS Policies
ALTER TABLE expert_panel_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expert_panel_sessions_select_own"
  ON expert_panel_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ask_expert_sessions s
    WHERE s.id = expert_panel_sessions.session_id
    AND s.user_id = auth.uid()
  ));

CREATE POLICY "service_role_all_expert_panel_sessions"
  ON expert_panel_sessions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- Table 2: expert_panel_responses
-- Purpose: Store individual expert responses within panel sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS expert_panel_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_session_id uuid NOT NULL REFERENCES expert_panel_sessions(id) ON DELETE CASCADE,
  agent_id text NOT NULL,
  response_text text NOT NULL,
  confidence_score numeric(3,2),
  vote_weight numeric(3,2) DEFAULT 1.0,
  sources jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  execution_time_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expert_panel_responses_panel
  ON expert_panel_responses(panel_session_id);
CREATE INDEX IF NOT EXISTS idx_expert_panel_responses_agent
  ON expert_panel_responses(agent_id);
CREATE INDEX IF NOT EXISTS idx_expert_panel_responses_created
  ON expert_panel_responses(created_at DESC);

-- RLS Policies
ALTER TABLE expert_panel_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expert_panel_responses_select_own"
  ON expert_panel_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM expert_panel_sessions ps
    JOIN ask_expert_sessions s ON s.id = ps.session_id
    WHERE ps.id = expert_panel_responses.panel_session_id
    AND s.user_id = auth.uid()
  ));

CREATE POLICY "service_role_all_expert_panel_responses"
  ON expert_panel_responses FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- Table 3: expert_workflow_executions
-- Purpose: Track custom workflow executions (Mode 4)
-- ============================================================================

CREATE TABLE IF NOT EXISTS expert_workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES ask_expert_sessions(id) ON DELETE CASCADE,
  workflow_definition jsonb NOT NULL,
  -- Example: {"steps": [{"type": "query_expert", "expert_id": "..."}, {...}]}
  current_step integer DEFAULT 0,
  step_results jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused')),
  error_message text,
  total_execution_time_ms integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expert_workflow_executions_session
  ON expert_workflow_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_expert_workflow_executions_status
  ON expert_workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_expert_workflow_executions_created
  ON expert_workflow_executions(created_at DESC);

-- RLS Policies
ALTER TABLE expert_workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expert_workflow_executions_select_own"
  ON expert_workflow_executions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ask_expert_sessions s
    WHERE s.id = expert_workflow_executions.session_id
    AND s.user_id = auth.uid()
  ));

CREATE POLICY "service_role_all_expert_workflow_executions"
  ON expert_workflow_executions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Run this to verify tables exist with RLS enabled:
-- SELECT tablename,
--        rowsecurity AS rls_enabled,
--        (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) AS policy_count
-- FROM pg_tables t
-- WHERE schemaname = 'public'
--   AND tablename IN ('expert_panel_sessions', 'expert_panel_responses', 'expert_workflow_executions');

-- Expected output:
-- expert_panel_sessions          | t | 2
-- expert_panel_responses         | t | 2
-- expert_workflow_executions     | t | 2
