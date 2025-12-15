-- ============================================================================
-- Migration: Normalize Agent Metadata Fields
-- Date: 2025-12-05
-- Description: Move rag_enabled, tools_enabled, websearch_enabled, knowledge_namespaces
--              from JSONB metadata to proper normalized columns
-- ============================================================================

-- ============================================================================
-- STEP 1: Add normalized columns to agents table
-- ============================================================================

-- Boolean columns for feature flags
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS rag_enabled BOOLEAN DEFAULT true;

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS websearch_enabled BOOLEAN DEFAULT true;

-- Array columns for multi-valued fields
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS tools_enabled TEXT[] DEFAULT ARRAY['rag_search']::TEXT[];

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS knowledge_namespaces TEXT[] DEFAULT ARRAY['KD-general']::TEXT[];

-- Add confidence_threshold for Mode 3 autonomous workflows
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS confidence_threshold NUMERIC(3,2) DEFAULT 0.85;

-- Add max_iterations for Mode 3 goal loops
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS max_goal_iterations INTEGER DEFAULT 5;

-- Add HITL (Human-in-the-Loop) enabled flag
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS hitl_enabled BOOLEAN DEFAULT true;

-- Add HITL safety level: minimal, balanced, strict
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS hitl_safety_level TEXT DEFAULT 'balanced'
  CHECK (hitl_safety_level IN ('minimal', 'balanced', 'strict'));

COMMENT ON COLUMN agents.rag_enabled IS 'Enable RAG retrieval for this agent';
COMMENT ON COLUMN agents.websearch_enabled IS 'Enable web search capability for this agent';
COMMENT ON COLUMN agents.tools_enabled IS 'List of enabled tool names for this agent';
COMMENT ON COLUMN agents.knowledge_namespaces IS 'Knowledge domain namespaces accessible to this agent';
COMMENT ON COLUMN agents.confidence_threshold IS 'Confidence threshold for Mode 3 autonomous goal completion (0.0-1.0)';
COMMENT ON COLUMN agents.max_goal_iterations IS 'Maximum iterations for Mode 3 goal-driven loops';
COMMENT ON COLUMN agents.hitl_enabled IS 'Enable Human-in-the-Loop checkpoints for Mode 3';
COMMENT ON COLUMN agents.hitl_safety_level IS 'HITL checkpoint frequency: minimal (few), balanced (standard), strict (many)';

-- ============================================================================
-- STEP 2: Migrate existing data from JSONB metadata to normalized columns
-- ============================================================================

-- Migrate rag_enabled from JSONB
UPDATE agents
SET rag_enabled = COALESCE((metadata->>'rag_enabled')::BOOLEAN, true)
WHERE metadata IS NOT NULL
  AND metadata->>'rag_enabled' IS NOT NULL;

-- Migrate websearch_enabled from JSONB
UPDATE agents
SET websearch_enabled = COALESCE((metadata->>'websearch_enabled')::BOOLEAN, true)
WHERE metadata IS NOT NULL
  AND metadata->>'websearch_enabled' IS NOT NULL;

-- Migrate tools_enabled from JSONB array
UPDATE agents
SET tools_enabled = (
  SELECT ARRAY_AGG(elem::TEXT)
  FROM jsonb_array_elements_text(metadata->'tools_enabled') AS elem
)
WHERE metadata IS NOT NULL
  AND metadata->'tools_enabled' IS NOT NULL
  AND jsonb_typeof(metadata->'tools_enabled') = 'array';

-- Migrate knowledge_namespaces from JSONB array
UPDATE agents
SET knowledge_namespaces = (
  SELECT ARRAY_AGG(elem::TEXT)
  FROM jsonb_array_elements_text(metadata->'knowledge_namespaces') AS elem
)
WHERE metadata IS NOT NULL
  AND metadata->'knowledge_namespaces' IS NOT NULL
  AND jsonb_typeof(metadata->'knowledge_namespaces') = 'array';

-- ============================================================================
-- STEP 3: Create indexes for efficient querying
-- ============================================================================

-- Index on rag_enabled for filtering
CREATE INDEX IF NOT EXISTS idx_agents_rag_enabled
ON agents(rag_enabled) WHERE rag_enabled = true;

-- Index on websearch_enabled for filtering
CREATE INDEX IF NOT EXISTS idx_agents_websearch_enabled
ON agents(websearch_enabled) WHERE websearch_enabled = true;

-- GIN index on tools_enabled for array containment queries
CREATE INDEX IF NOT EXISTS idx_agents_tools_enabled_gin
ON agents USING GIN(tools_enabled);

-- GIN index on knowledge_namespaces for array containment queries
CREATE INDEX IF NOT EXISTS idx_agents_knowledge_namespaces_gin
ON agents USING GIN(knowledge_namespaces);

-- ============================================================================
-- STEP 4: Remove migrated fields from JSONB metadata (cleanup)
-- ============================================================================

-- Remove the migrated keys from metadata JSONB
-- This keeps metadata clean and prevents confusion
UPDATE agents
SET metadata = metadata - 'rag_enabled' - 'websearch_enabled' - 'tools_enabled' - 'knowledge_namespaces'
WHERE metadata IS NOT NULL
  AND (
    metadata ? 'rag_enabled'
    OR metadata ? 'websearch_enabled'
    OR metadata ? 'tools_enabled'
    OR metadata ? 'knowledge_namespaces'
  );

-- ============================================================================
-- STEP 5: Set default values for agents missing data
-- ============================================================================

-- Ensure all agents have reasonable defaults
UPDATE agents
SET
  rag_enabled = COALESCE(rag_enabled, true),
  websearch_enabled = COALESCE(websearch_enabled, true),
  tools_enabled = COALESCE(tools_enabled, ARRAY['rag_search']::TEXT[]),
  knowledge_namespaces = COALESCE(knowledge_namespaces, ARRAY['KD-general']::TEXT[]),
  confidence_threshold = COALESCE(confidence_threshold, 0.85),
  max_goal_iterations = COALESCE(max_goal_iterations, 5),
  hitl_enabled = COALESCE(hitl_enabled, true),
  hitl_safety_level = COALESCE(hitl_safety_level, 'balanced')
WHERE
  rag_enabled IS NULL
  OR websearch_enabled IS NULL
  OR tools_enabled IS NULL
  OR knowledge_namespaces IS NULL
  OR confidence_threshold IS NULL
  OR max_goal_iterations IS NULL
  OR hitl_enabled IS NULL
  OR hitl_safety_level IS NULL;

-- ============================================================================
-- STEP 6: Create helper function to get agent configuration
-- ============================================================================

CREATE OR REPLACE FUNCTION get_agent_config(agent_uuid UUID)
RETURNS TABLE (
  agent_id UUID,
  agent_name TEXT,
  agent_level_id UUID,
  level_number INTEGER,
  level_name TEXT,
  rag_enabled BOOLEAN,
  websearch_enabled BOOLEAN,
  tools_enabled TEXT[],
  knowledge_namespaces TEXT[],
  confidence_threshold NUMERIC,
  max_goal_iterations INTEGER,
  hitl_enabled BOOLEAN,
  hitl_safety_level TEXT,
  base_model TEXT,
  temperature NUMERIC,
  max_tokens INTEGER,
  system_prompt TEXT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    a.id AS agent_id,
    a.name AS agent_name,
    a.agent_level_id,
    al.level_number,
    al.name AS level_name,
    a.rag_enabled,
    a.websearch_enabled,
    a.tools_enabled,
    a.knowledge_namespaces,
    a.confidence_threshold,
    a.max_goal_iterations,
    a.hitl_enabled,
    a.hitl_safety_level,
    a.base_model,
    a.temperature,
    a.max_tokens,
    a.system_prompt
  FROM agents a
  LEFT JOIN agent_levels al ON a.agent_level_id = al.id
  WHERE a.id = agent_uuid;
$$;

COMMENT ON FUNCTION get_agent_config(UUID) IS 'Get complete agent configuration including level and Mode 3 settings';

-- ============================================================================
-- VERIFICATION: Check migration success
-- ============================================================================

DO $$
DECLARE
  v_total_agents INTEGER;
  v_migrated_rag INTEGER;
  v_migrated_websearch INTEGER;
  v_migrated_tools INTEGER;
  v_migrated_namespaces INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_agents FROM agents;
  SELECT COUNT(*) INTO v_migrated_rag FROM agents WHERE rag_enabled IS NOT NULL;
  SELECT COUNT(*) INTO v_migrated_websearch FROM agents WHERE websearch_enabled IS NOT NULL;
  SELECT COUNT(*) INTO v_migrated_tools FROM agents WHERE tools_enabled IS NOT NULL;
  SELECT COUNT(*) INTO v_migrated_namespaces FROM agents WHERE knowledge_namespaces IS NOT NULL;

  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Migration Complete: Normalize Agent Metadata';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Total agents: %', v_total_agents;
  RAISE NOTICE 'Agents with rag_enabled: %', v_migrated_rag;
  RAISE NOTICE 'Agents with websearch_enabled: %', v_migrated_websearch;
  RAISE NOTICE 'Agents with tools_enabled: %', v_migrated_tools;
  RAISE NOTICE 'Agents with knowledge_namespaces: %', v_migrated_namespaces;
  RAISE NOTICE '=========================================';
END $$;
