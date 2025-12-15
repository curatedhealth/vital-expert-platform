-- ============================================================================
-- Migration: Add Panel Voting & Arbitration Tables
-- Date: 2025-11-23
-- Purpose: Enable panel decision audit trail and analysis
-- Priority: LOW
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Drop existing tables if they exist (clean migration)
-- ============================================================================

DROP TABLE IF EXISTS public.agent_panel_arbitrations CASCADE;
DROP TABLE IF EXISTS public.agent_panel_votes CASCADE;

-- ============================================================================
-- 2. Agent Panel Votes Table
-- ============================================================================

CREATE TABLE public.agent_panel_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Panel context
  graph_id UUID REFERENCES public.agent_graphs(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  panel_execution_id UUID, -- links multiple votes from same panel execution
  
  -- Agent & vote
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  vote JSONB NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('recommendation', 'approval', 'rejection', 'abstain')),
  
  -- Weighting
  weight NUMERIC(3, 2) DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
  confidence NUMERIC(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Reasoning
  rationale TEXT,
  supporting_evidence JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  model_used TEXT,
  tokens_used INTEGER,
  execution_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. Agent Panel Arbitrations Table
-- ============================================================================

CREATE TABLE public.agent_panel_arbitrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Panel context
  session_id UUID NOT NULL,
  graph_id UUID REFERENCES public.agent_graphs(id) ON DELETE CASCADE,
  panel_execution_id UUID NOT NULL, -- links to votes
  
  -- Arbitration result
  result JSONB NOT NULL,
  final_decision TEXT,
  
  -- Method
  method TEXT NOT NULL CHECK (method IN (
    'majority',        -- Simple majority vote
    'weighted',        -- Weighted by agent expertise
    'critic-led',      -- Critic selects winner
    'model-mediated',  -- LLM arbitrates
    'consensus',       -- Requires unanimous agreement
    'delphi'          -- Iterative refinement
  )),
  
  -- Metrics
  agreement_score NUMERIC(3, 2) CHECK (agreement_score >= 0 AND agreement_score <= 1),
  confidence_score NUMERIC(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  dissent_count INTEGER DEFAULT 0,
  
  -- Reasoning
  arbitration_rationale TEXT,
  minority_opinions JSONB DEFAULT '[]'::jsonb,
  
  -- Winner(s)
  winning_agent_ids UUID[] DEFAULT '{}',
  
  -- Performance
  total_votes INTEGER,
  execution_time_ms INTEGER,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'escalated')),
  escalated_to UUID REFERENCES auth.users(id), -- human escalation
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ============================================================================
-- 4. Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_agent_panel_votes_session ON public.agent_panel_votes(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_panel_votes_panel_exec ON public.agent_panel_votes(panel_execution_id);
CREATE INDEX IF NOT EXISTS idx_agent_panel_votes_agent ON public.agent_panel_votes(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_panel_votes_graph ON public.agent_panel_votes(graph_id);
CREATE INDEX IF NOT EXISTS idx_agent_panel_votes_created ON public.agent_panel_votes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_panel_arbitrations_session ON public.agent_panel_arbitrations(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_panel_arbitrations_panel_exec ON public.agent_panel_arbitrations(panel_execution_id);
CREATE INDEX IF NOT EXISTS idx_agent_panel_arbitrations_method ON public.agent_panel_arbitrations(method);
CREATE INDEX IF NOT EXISTS idx_agent_panel_arbitrations_status ON public.agent_panel_arbitrations(status);
CREATE INDEX IF NOT EXISTS idx_agent_panel_arbitrations_created ON public.agent_panel_arbitrations(created_at DESC);

-- ============================================================================
-- 5. Helper Functions
-- ============================================================================

-- Function to calculate panel consensus
CREATE OR REPLACE FUNCTION calculate_panel_consensus(
  p_panel_execution_id UUID
)
RETURNS TABLE (
  agreement_score NUMERIC,
  consensus_reached BOOLEAN,
  dominant_vote TEXT
) AS $$
DECLARE
  v_total_votes INTEGER;
  v_vote_counts JSONB;
  v_max_count INTEGER;
  v_agreement NUMERIC;
BEGIN
  -- Count total votes
  SELECT COUNT(*) INTO v_total_votes
  FROM public.agent_panel_votes
  WHERE panel_execution_id = p_panel_execution_id;
  
  IF v_total_votes = 0 THEN
    RETURN QUERY SELECT 0.0::NUMERIC, false, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Calculate vote distribution
  SELECT jsonb_object_agg(vote_type, vote_count)
  INTO v_vote_counts
  FROM (
    SELECT 
      vote_type,
      COUNT(*) as vote_count
    FROM public.agent_panel_votes
    WHERE panel_execution_id = p_panel_execution_id
    GROUP BY vote_type
  ) subq;
  
  -- Find max count
  SELECT MAX((value::text)::integer)
  INTO v_max_count
  FROM jsonb_each(v_vote_counts);
  
  -- Calculate agreement score
  v_agreement := v_max_count::NUMERIC / v_total_votes::NUMERIC;
  
  RETURN QUERY 
  SELECT 
    v_agreement,
    v_agreement >= 0.67, -- 2/3 majority
    (SELECT key FROM jsonb_each(v_vote_counts) WHERE (value::text)::integer = v_max_count LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. Comments
-- ============================================================================

COMMENT ON TABLE public.agent_panel_votes IS 'Individual agent votes in panel discussions';
COMMENT ON TABLE public.agent_panel_arbitrations IS 'Final arbitration results for panel decisions';

COMMENT ON COLUMN public.agent_panel_votes.panel_execution_id IS 'Groups votes from same panel execution';
COMMENT ON COLUMN public.agent_panel_votes.weight IS 'Vote weight based on agent expertise (0-1)';

COMMENT ON COLUMN public.agent_panel_arbitrations.method IS 'Arbitration method: majority, weighted, critic-led, etc.';
COMMENT ON COLUMN public.agent_panel_arbitrations.agreement_score IS 'How much agreement across votes (0-1)';
COMMENT ON COLUMN public.agent_panel_arbitrations.dissent_count IS 'Number of dissenting votes';

COMMENT ON FUNCTION calculate_panel_consensus IS 'Calculate consensus metrics for a panel execution';

COMMIT;

-- Verification
SELECT 'agent_panel_votes' AS table_name, COUNT(*) AS row_count FROM public.agent_panel_votes
UNION ALL
SELECT 'agent_panel_arbitrations', COUNT(*) FROM public.agent_panel_arbitrations;

