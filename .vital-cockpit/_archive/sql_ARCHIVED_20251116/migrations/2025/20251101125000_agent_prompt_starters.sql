-- ============================================================================
-- Agent Prompt Starters → Prompt Registry linkage
-- Date: 2025-11-01
-- Notes:
--   * Allows Agent Store to point starter buttons at prompt library entries.
--   * Provides portable unique IDs + metadata for starter cards.
--   * Extends task agent assignments to reference a preferred starter.
-- ============================================================================

-- Assumes fn_normalize_identifier() exists and prior agent/prompt migrations ran.

CREATE TABLE IF NOT EXISTS dh_agent_prompt_starter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  unique_id TEXT NOT NULL,
  agent_id UUID NOT NULL REFERENCES dh_role(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES dh_prompt(id) ON DELETE CASCADE,
  prompt_version_id UUID REFERENCES dh_prompt_version(id) ON DELETE SET NULL,
  agent_unique_id TEXT NOT NULL,
  prompt_unique_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  version_preference TEXT NOT NULL DEFAULT 'latest',
  position INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, unique_id),
  UNIQUE (agent_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_agent_prompt_starter_agent ON dh_agent_prompt_starter(agent_id);
CREATE INDEX IF NOT EXISTS idx_dh_agent_prompt_starter_prompt ON dh_agent_prompt_starter(prompt_id);

COMMENT ON TABLE dh_agent_prompt_starter IS 'Agent Store starter cards linking agents to prompt registry entries.';
COMMENT ON COLUMN dh_agent_prompt_starter.unique_id IS 'Portable identifier (e.g., APS-AGT-P04-BIOSTAT-PRM-SAMPLE-SIZE).';

-- Helper resolver
CREATE OR REPLACE FUNCTION dh_resolve_agent_prompt_starter_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_agent_prompt_starter
  WHERE tenant_id = p_tenant
    AND unique_id = p_unique_id
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Allow task agent assignments to capture a starter reference
ALTER TABLE dh_task_agent_assignment
  ADD COLUMN IF NOT EXISTS default_prompt_starter_id UUID REFERENCES dh_agent_prompt_starter(id) ON DELETE SET NULL;

COMMENT ON COLUMN dh_task_agent_assignment.default_prompt_starter_id IS 'Preferred agent prompt starter when launching this task.';
