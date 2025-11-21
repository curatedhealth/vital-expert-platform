-- ============================================================================
-- Prompt Suite & Subsuite Registry
-- Date: 2025-11-01
-- Notes:
--   * Creates hierarchical grouping for prompts (suite → subsuite).
--   * Links shared prompt library entries to suites/subsuites with portable IDs.
--   * Backfills existing prompts into a default suite/subsuite per tenant.
-- ============================================================================

-- Assumes fn_normalize_identifier() already exists (added in prior migration).

-- ============================================================================
-- Suite & Subsuite tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS dh_prompt_suite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  unique_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,                                -- e.g., clinical_dev, regulatory
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, unique_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_prompt_suite_tenant ON dh_prompt_suite(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dh_prompt_suite_category ON dh_prompt_suite(category);

COMMENT ON TABLE dh_prompt_suite IS 'Top-level grouping for prompt library entries (e.g., PRISM suites).';
COMMENT ON COLUMN dh_prompt_suite.unique_id IS 'Portable identifier (e.g., PST-CD-STUDY-DESIGN).';

CREATE TABLE IF NOT EXISTS dh_prompt_subsuite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  suite_id UUID NOT NULL REFERENCES dh_prompt_suite(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_dh_prompt_subsuite_tenant ON dh_prompt_subsuite(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dh_prompt_subsuite_suite ON dh_prompt_subsuite(suite_id);

COMMENT ON TABLE dh_prompt_subsuite IS 'Optional nested grouping under a prompt suite (e.g., planning, execution).';
COMMENT ON COLUMN dh_prompt_subsuite.unique_id IS 'Portable identifier (e.g., PSS-CD-SAMPLE-SIZE).';

-- ============================================================================
-- Prompt assignment to suite/subsuite
-- ============================================================================

CREATE TABLE IF NOT EXISTS dh_prompt_suite_prompt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  suite_id UUID NOT NULL REFERENCES dh_prompt_suite(id) ON DELETE CASCADE,
  subsuite_id UUID REFERENCES dh_prompt_subsuite(id) ON DELETE SET NULL,
  prompt_id UUID NOT NULL REFERENCES dh_prompt(id) ON DELETE CASCADE,
  prompt_unique_id TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  default_agent_unique_id TEXT,
  usage_context TEXT,                            -- e.g., "study_design", "analysis"
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dh_prompt_suite_prompt_prompt ON dh_prompt_suite_prompt(prompt_id);
CREATE INDEX IF NOT EXISTS idx_dh_prompt_suite_prompt_suite ON dh_prompt_suite_prompt(suite_id);
CREATE INDEX IF NOT EXISTS idx_dh_prompt_suite_prompt_subsuite ON dh_prompt_suite_prompt(subsuite_id);

COMMENT ON TABLE dh_prompt_suite_prompt IS 'Associates prompts with suites/subsuites (PRISM front-end alignment).';

CREATE UNIQUE INDEX IF NOT EXISTS uq_dh_prompt_suite_prompt_assignment
  ON dh_prompt_suite_prompt (prompt_id, suite_id, COALESCE(subsuite_id, prompt_id));

-- ============================================================================
-- Helper functions for suite resolution
-- ============================================================================

CREATE OR REPLACE FUNCTION dh_resolve_prompt_suite_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_prompt_suite
  WHERE tenant_id = p_tenant
    AND unique_id = p_unique_id
  LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION dh_resolve_prompt_subsuite_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_prompt_subsuite
  WHERE tenant_id = p_tenant
    AND unique_id = p_unique_id
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- Backfill: create default suite/subsuite per tenant & assign existing prompts
-- ============================================================================

DO $$
DECLARE
  rec RECORD;
  v_suite_id UUID;
  v_subsuite_id UUID;
BEGIN
  FOR rec IN SELECT DISTINCT tenant_id FROM dh_prompt LOOP
    -- Create default suite if missing
    INSERT INTO dh_prompt_suite (tenant_id, unique_id, name, description, category, tags)
    VALUES (
      rec.tenant_id,
      'PST-DEFAULT',
      'Default Prompt Suite',
      'Autogenerated suite for prompts without explicit grouping.',
      NULL,
      ARRAY['default']
    )
    ON CONFLICT (tenant_id, unique_id) DO NOTHING;

    SELECT id INTO v_suite_id
    FROM dh_prompt_suite
    WHERE tenant_id = rec.tenant_id
      AND unique_id = 'PST-DEFAULT'
    LIMIT 1;

    -- Create default subsuite under the suite
    INSERT INTO dh_prompt_subsuite (tenant_id, suite_id, unique_id, name, description, tags)
    VALUES (
      rec.tenant_id,
      v_suite_id,
      'PSS-DEFAULT',
      'Default Subsuite',
      'Autogenerated subsuite placeholder.',
      ARRAY['default']
    )
    ON CONFLICT (tenant_id, unique_id) DO NOTHING;

    SELECT id INTO v_subsuite_id
    FROM dh_prompt_subsuite
    WHERE tenant_id = rec.tenant_id
      AND unique_id = 'PSS-DEFAULT'
    LIMIT 1;

    -- Associate all prompts lacking suite assignment with the default subsuite
    INSERT INTO dh_prompt_suite_prompt (tenant_id, suite_id, subsuite_id, prompt_id, prompt_unique_id)
    SELECT
      p.tenant_id,
      v_suite_id,
      v_subsuite_id,
      p.id,
      p.unique_id
    FROM dh_prompt p
    WHERE p.tenant_id = rec.tenant_id
      AND NOT EXISTS (
        SELECT 1
        FROM dh_prompt_suite_prompt ssp
        WHERE ssp.prompt_id = p.id
      );
  END LOOP;
END;
$$;
