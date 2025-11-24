-- ============================================================================
-- Prompt Registry ↔ Agent Capability Mapping
-- Date: 2025-11-01
-- Notes:
--   * Provides direct relationship between prompt definitions and capable agents.
--   * Leverages agent prompt starters as defaults when available.
-- ============================================================================

CREATE TABLE IF NOT EXISTS dh_prompt_agent_capability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES dh_prompt(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES dh_role(id) ON DELETE CASCADE,
  prompt_unique_id TEXT NOT NULL,
  agent_unique_id TEXT NOT NULL,
  capability_level TEXT NOT NULL DEFAULT 'primary'
    CHECK (capability_level IN ('primary','preferred','supported','experimental')),
  default_prompt_starter_id UUID REFERENCES dh_agent_prompt_starter(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, prompt_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_prompt_agent_capability_prompt ON dh_prompt_agent_capability(prompt_id);
CREATE INDEX IF NOT EXISTS idx_dh_prompt_agent_capability_agent ON dh_prompt_agent_capability(agent_id);

COMMENT ON TABLE dh_prompt_agent_capability IS 'Maps prompts to capable agents for Agent Store + Prompt Registry integration.';

-- Helper resolver
CREATE OR REPLACE FUNCTION dh_resolve_prompt_agent_capability(
  p_tenant UUID,
  p_prompt_unique_id TEXT,
  p_agent_unique_id TEXT
) RETURNS UUID AS $$
  SELECT id
  FROM dh_prompt_agent_capability
  WHERE tenant_id = p_tenant
    AND prompt_unique_id = p_prompt_unique_id
    AND agent_unique_id = p_agent_unique_id
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Backfill capabilities from existing agent prompt starters
INSERT INTO dh_prompt_agent_capability (
  tenant_id,
  prompt_id,
  agent_id,
  prompt_unique_id,
  agent_unique_id,
  capability_level,
  default_prompt_starter_id,
  metadata
)
SELECT
  aps.tenant_id,
  aps.prompt_id,
  aps.agent_id,
  aps.prompt_unique_id,
  aps.agent_unique_id,
  'primary'::text,
  aps.id,
  jsonb_build_object('source', 'starter_backfill')
FROM dh_agent_prompt_starter aps
ON CONFLICT (tenant_id, prompt_id, agent_id) DO NOTHING;
