-- ============================================================================
-- Agent Store Registry & Task Linkage Enhancements
-- Date: 2025-11-01
-- Notes:
--   * Adds hierarchical catalog for agents (suite → subsuite) aligned with Agent Store UI.
--   * Strengthens dh_task_agent_assignment with optional suite/subsuite references.
--   * Backfills existing agents into a default collection per tenant.
-- ============================================================================

-- Assumes fn_normalize_identifier() and task agent assignment table exist.

-- ============================================================================
-- Agent suite & subsuite tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS dh_agent_suite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  unique_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,                               -- clinical, regulatory, technical, etc.
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, unique_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_agent_suite_tenant ON dh_agent_suite(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dh_agent_suite_category ON dh_agent_suite(category);

COMMENT ON TABLE dh_agent_suite IS 'Agent Store suite grouping (e.g., Clinical Leadership, Biostatistics).';
COMMENT ON COLUMN dh_agent_suite.unique_id IS 'Portable identifier (e.g., AST-CLN-LEADERSHIP).';

CREATE TABLE IF NOT EXISTS dh_agent_subsuite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  suite_id UUID NOT NULL REFERENCES dh_agent_suite(id) ON DELETE CASCADE,
  unique_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, unique_id),
  UNIQUE (suite_id, unique_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_agent_subsuite_tenant ON dh_agent_subsuite(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dh_agent_subsuite_suite ON dh_agent_subsuite(suite_id);

COMMENT ON TABLE dh_agent_subsuite IS 'Nested grouping for more granular segmentation (e.g., Power Analysis Specialists).';
COMMENT ON COLUMN dh_agent_subsuite.unique_id IS 'Portable identifier (e.g., ASS-BST-POWER).';

-- ============================================================================
-- Agent membership mapping
-- ============================================================================

CREATE TABLE IF NOT EXISTS dh_agent_suite_member (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  suite_id UUID NOT NULL REFERENCES dh_agent_suite(id) ON DELETE CASCADE,
  subsuite_id UUID REFERENCES dh_agent_subsuite(id) ON DELETE SET NULL,
  agent_id UUID NOT NULL REFERENCES dh_role(id) ON DELETE CASCADE,
  agent_unique_id TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  primary_flag BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dh_agent_suite_member_agent ON dh_agent_suite_member(agent_id);
CREATE INDEX IF NOT EXISTS idx_dh_agent_suite_member_suite ON dh_agent_suite_member(suite_id);
CREATE INDEX IF NOT EXISTS idx_dh_agent_suite_member_subsuite ON dh_agent_suite_member(subsuite_id);

COMMENT ON TABLE dh_agent_suite_member IS 'Links agents to suites/subsuites for display and filtering in Agent Store.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_dh_agent_suite_member_assignment
  ON dh_agent_suite_member (agent_id, suite_id, COALESCE(subsuite_id, agent_id));

-- ============================================================================
-- Helper functions for suite resolution
-- ============================================================================

CREATE OR REPLACE FUNCTION dh_resolve_agent_suite_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_agent_suite
  WHERE tenant_id = p_tenant
    AND unique_id = p_unique_id
  LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION dh_resolve_agent_subsuite_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_agent_subsuite
  WHERE tenant_id = p_tenant
    AND unique_id = p_unique_id
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- Extend task-agent assignment to reference suite/subsuite (optional)
-- ============================================================================

ALTER TABLE dh_task_agent_assignment
  ADD COLUMN IF NOT EXISTS suite_id UUID REFERENCES dh_agent_suite(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subsuite_id UUID REFERENCES dh_agent_subsuite(id) ON DELETE SET NULL;

COMMENT ON COLUMN dh_task_agent_assignment.suite_id IS 'Agent Store suite context for this assignment.';
COMMENT ON COLUMN dh_task_agent_assignment.subsuite_id IS 'Agent Store subsuite context for this assignment.';

-- ============================================================================
-- Backfill: default suite/subsuite per tenant & membership
-- ============================================================================

DO $$
DECLARE
  rec RECORD;
  v_suite_id UUID;
  v_subsuite_id UUID;
BEGIN
  FOR rec IN SELECT DISTINCT tenant_id FROM dh_role LOOP
    -- Create default suite if missing
    INSERT INTO dh_agent_suite (tenant_id, unique_id, name, description, category, tags)
    VALUES (
      rec.tenant_id,
      'AST-DEFAULT',
      'Default Agent Suite',
      'Autogenerated suite for agents without explicit grouping.',
      NULL,
      ARRAY['default']
    )
    ON CONFLICT (tenant_id, unique_id) DO NOTHING;

    SELECT id INTO v_suite_id
    FROM dh_agent_suite
    WHERE tenant_id = rec.tenant_id
      AND unique_id = 'AST-DEFAULT'
    LIMIT 1;

    -- Default subsuite
    INSERT INTO dh_agent_subsuite (tenant_id, suite_id, unique_id, name, description, tags)
    VALUES (
      rec.tenant_id,
      v_suite_id,
      'ASS-DEFAULT',
      'Default Agent Subsuite',
      'Autogenerated subsuite placeholder.',
      ARRAY['default']
    )
    ON CONFLICT (tenant_id, unique_id) DO NOTHING;

    SELECT id INTO v_subsuite_id
    FROM dh_agent_subsuite
    WHERE tenant_id = rec.tenant_id
      AND unique_id = 'ASS-DEFAULT'
    LIMIT 1;

    -- Link all agents without suite membership
    INSERT INTO dh_agent_suite_member (tenant_id, suite_id, subsuite_id, agent_id, agent_unique_id)
    SELECT
      r.tenant_id,
      v_suite_id,
      v_subsuite_id,
      r.id,
      r.unique_id
    FROM dh_role r
    WHERE r.tenant_id = rec.tenant_id
      AND NOT EXISTS (
        SELECT 1
        FROM dh_agent_suite_member asm
        WHERE asm.agent_id = r.id
      );
  END LOOP;
END;
$$;
