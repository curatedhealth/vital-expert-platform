-- ============================================================================
-- Migration: Add Agent State & Memory Tables
-- Date: 2025-11-23
-- Purpose: Enable reasoning traces, persistent memory, and workflow resume
-- Priority: MEDIUM
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Drop existing tables if they exist (clean migration)
-- ============================================================================

DROP TABLE IF EXISTS public.agent_memory_instructions CASCADE;
DROP TABLE IF EXISTS public.agent_memory_semantic CASCADE;
DROP TABLE IF EXISTS public.agent_memory_episodic CASCADE;
DROP TABLE IF EXISTS public.agent_state CASCADE;

-- ============================================================================
-- 2. Agent State Table (Reasoning Traces)
-- ============================================================================

CREATE TABLE public.agent_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Agent relationship
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  graph_id UUID REFERENCES public.agent_graphs(id) ON DELETE CASCADE,
  
  -- Session context
  session_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id UUID,
  
  -- Execution metadata
  step_index INTEGER NOT NULL DEFAULT 0,
  node_id UUID REFERENCES public.agent_graph_nodes(id) ON DELETE SET NULL,
  node_key TEXT,
  
  -- State snapshot
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  input JSONB,
  output JSONB,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused')),
  error_message TEXT,
  
  -- Performance metrics
  execution_time_ms INTEGER,
  tokens_used INTEGER,
  cost_usd NUMERIC(10, 6),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_session_step UNIQUE(session_id, step_index)
);

-- ============================================================================
-- 3. Agent Episodic Memory (Session-Level Memory)
-- ============================================================================

CREATE TABLE public.agent_memory_episodic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Agent relationship
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Memory content
  content TEXT NOT NULL,
  memory_type TEXT CHECK (memory_type IN ('observation', 'action', 'reflection', 'user_feedback')),
  
  -- Embedding for semantic search
  embedding VECTOR(1536), -- OpenAI ada-002 dimension
  
  -- Context
  context JSONB DEFAULT '{}'::jsonb,
  importance_score NUMERIC(3, 2) DEFAULT 0.5 CHECK (importance_score >= 0 AND importance_score <= 1),
  
  -- Retrieval metadata
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. Agent Semantic Memory (Long-Term Facts)
-- ============================================================================

CREATE TABLE public.agent_memory_semantic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Agent relationship
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  
  -- Fact metadata
  fact TEXT NOT NULL,
  fact_type TEXT CHECK (fact_type IN ('learned', 'validated', 'inferred', 'user_provided')),
  
  -- Confidence & source
  confidence NUMERIC(3, 2) DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  source TEXT,
  source_session_id UUID,
  
  -- Embedding for semantic search
  embedding VECTOR(1536),
  
  -- Validation
  validated_at TIMESTAMPTZ,
  validated_by UUID REFERENCES auth.users(id),
  validation_method TEXT,
  
  -- Relevance decay
  relevance_score NUMERIC(3, 2) DEFAULT 1.0,
  last_reinforced_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. Agent Instruction Memory (Behavioral Adaptation)
-- ============================================================================

CREATE TABLE public.agent_memory_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Agent relationship
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  
  -- Instruction metadata
  instruction TEXT NOT NULL,
  instruction_type TEXT CHECK (instruction_type IN ('preference', 'constraint', 'style', 'domain_rule')),
  
  -- Priority & scope
  priority INTEGER DEFAULT 0,
  scope TEXT CHECK (scope IN ('global', 'domain', 'context', 'session')),
  context_filter JSONB DEFAULT '{}'::jsonb,
  
  -- Source
  source TEXT CHECK (source IN ('user', 'admin', 'learned', 'system')),
  source_user_id UUID REFERENCES auth.users(id),
  source_session_id UUID,
  
  -- Application rules
  apply_when JSONB DEFAULT '{}'::jsonb,
  override_priority INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. Indexes for Performance
-- ============================================================================

-- agent_state indexes
CREATE INDEX IF NOT EXISTS idx_agent_state_agent ON public.agent_state(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_state_session ON public.agent_state(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_state_graph ON public.agent_state(graph_id);
CREATE INDEX IF NOT EXISTS idx_agent_state_status ON public.agent_state(status) WHERE status IN ('running', 'paused');
CREATE INDEX IF NOT EXISTS idx_agent_state_created ON public.agent_state(created_at DESC);

-- agent_memory_episodic indexes
CREATE INDEX IF NOT EXISTS idx_agent_memory_episodic_agent ON public.agent_memory_episodic(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_episodic_session ON public.agent_memory_episodic(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_episodic_type ON public.agent_memory_episodic(memory_type);
CREATE INDEX IF NOT EXISTS idx_agent_memory_episodic_importance ON public.agent_memory_episodic(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_agent_memory_episodic_created ON public.agent_memory_episodic(created_at DESC);

-- agent_memory_semantic indexes
CREATE INDEX IF NOT EXISTS idx_agent_memory_semantic_agent ON public.agent_memory_semantic(agent_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_memory_semantic_confidence ON public.agent_memory_semantic(confidence DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_memory_semantic_relevance ON public.agent_memory_semantic(relevance_score DESC) WHERE is_active = true;

-- agent_memory_instructions indexes
CREATE INDEX IF NOT EXISTS idx_agent_memory_instructions_agent ON public.agent_memory_instructions(agent_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_memory_instructions_priority ON public.agent_memory_instructions(priority DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_memory_instructions_scope ON public.agent_memory_instructions(scope) WHERE is_active = true;

-- Vector similarity search indexes (using ivfflat)
CREATE INDEX IF NOT EXISTS idx_agent_memory_episodic_embedding 
  ON public.agent_memory_episodic 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_agent_memory_semantic_embedding 
  ON public.agent_memory_semantic 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================================
-- 7. Helper Functions
-- ============================================================================

-- Function to retrieve relevant episodic memories
CREATE OR REPLACE FUNCTION get_episodic_memories(
  p_agent_id UUID,
  p_session_id UUID,
  p_query_embedding VECTOR(1536),
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  memory_type TEXT,
  similarity FLOAT,
  importance_score NUMERIC,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.content,
    m.memory_type,
    1 - (m.embedding <=> p_query_embedding) AS similarity,
    m.importance_score,
    m.created_at
  FROM public.agent_memory_episodic m
  WHERE m.agent_id = p_agent_id
    AND m.session_id = p_session_id
    AND (m.expires_at IS NULL OR m.expires_at > NOW())
  ORDER BY 
    (m.embedding <=> p_query_embedding) ASC,
    m.importance_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to retrieve relevant semantic memories
CREATE OR REPLACE FUNCTION get_semantic_memories(
  p_agent_id UUID,
  p_query_embedding VECTOR(1536),
  p_min_confidence NUMERIC DEFAULT 0.5,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  fact TEXT,
  confidence NUMERIC,
  similarity FLOAT,
  relevance_score NUMERIC,
  source TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.fact,
    m.confidence,
    1 - (m.embedding <=> p_query_embedding) AS similarity,
    m.relevance_score,
    m.source
  FROM public.agent_memory_semantic m
  WHERE m.agent_id = p_agent_id
    AND m.is_active = true
    AND m.confidence >= p_min_confidence
  ORDER BY 
    (m.embedding <=> p_query_embedding) ASC,
    m.relevance_score DESC,
    m.confidence DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. Comments
-- ============================================================================

COMMENT ON TABLE public.agent_state IS 'Agent execution state snapshots for debugging and resume';
COMMENT ON TABLE public.agent_memory_episodic IS 'Session-level episodic memories (observations, actions, reflections)';
COMMENT ON TABLE public.agent_memory_semantic IS 'Long-term semantic memories (facts, validated knowledge)';
COMMENT ON TABLE public.agent_memory_instructions IS 'Behavioral instructions and preferences (learned or user-provided)';

COMMENT ON FUNCTION get_episodic_memories IS 'Retrieve relevant episodic memories using vector similarity';
COMMENT ON FUNCTION get_semantic_memories IS 'Retrieve relevant semantic facts using vector similarity';

COMMIT;

-- Verification
SELECT 'agent_state' AS table_name, COUNT(*) AS row_count FROM public.agent_state
UNION ALL
SELECT 'agent_memory_episodic', COUNT(*) FROM public.agent_memory_episodic
UNION ALL
SELECT 'agent_memory_semantic', COUNT(*) FROM public.agent_memory_semantic
UNION ALL
SELECT 'agent_memory_instructions', COUNT(*) FROM public.agent_memory_instructions;

