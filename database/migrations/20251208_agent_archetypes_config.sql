-- =============================================================================
-- Migration: Add archetype + config columns for agents and enrich agent_levels
-- Context: Supports dynamic agent hydration (AgentFactory) and safer defaults
-- Date: 2025-12-08
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) Schema changes
-- ---------------------------------------------------------------------------
ALTER TABLE agents
    ADD COLUMN IF NOT EXISTS archetype_code TEXT,
    ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;

ALTER TABLE agent_levels
    ADD COLUMN IF NOT EXISTS min_years_experience INT,
    ADD COLUMN IF NOT EXISTS default_communication_style TEXT;

-- ---------------------------------------------------------------------------
-- 2) Opinionated defaults for agent levels (non-breaking, nullable safe)
-- ---------------------------------------------------------------------------
UPDATE agent_levels
SET min_years_experience = CASE name
    WHEN 'Master' THEN 15
    WHEN 'Expert' THEN 10
    WHEN 'Specialist' THEN 5
    WHEN 'Worker' THEN 2
    WHEN 'Tool' THEN 0
    ELSE min_years_experience
END,
default_communication_style = COALESCE(default_communication_style, CASE name
    WHEN 'Master' THEN 'authoritative'
    WHEN 'Expert' THEN 'consultative'
    WHEN 'Specialist' THEN 'informative'
    WHEN 'Worker' THEN 'concise'
    WHEN 'Tool' THEN 'terse'
    ELSE default_communication_style
END);

-- ---------------------------------------------------------------------------
-- 3) Initial archetype hydration (idempotent / pattern-based)
-- ---------------------------------------------------------------------------
-- Map well-known agent name families to archetypes.
UPDATE agents
SET archetype_code = 'ARCH_STRATEGIST'
WHERE archetype_code IS NULL
  AND name ILIKE '%context engineer%';

UPDATE agents
SET archetype_code = 'ARCH_RETRIEVER'
WHERE archetype_code IS NULL
  AND name ILIKE '%evidence retriever%';

UPDATE agents
SET archetype_code = 'ARCH_ANALYST'
WHERE archetype_code IS NULL
  AND name ILIKE '%analyst%';

-- All level-5 tool agents → ARCH_TOOL
UPDATE agents a
SET archetype_code = 'ARCH_TOOL'
FROM agent_levels l
WHERE a.archetype_code IS NULL
  AND a.agent_level_id = l.id
  AND l.name = 'Tool';

COMMIT;
