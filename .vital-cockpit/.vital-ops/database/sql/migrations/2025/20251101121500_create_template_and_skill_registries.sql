-- ============================================================================
-- Registry Enhancements: Templates & Skills
-- Date: 2025-11-01
-- Notes: Adds normalized registries to reduce duplication across workflows.
--        Extends existing catalogs (dh_tool, dh_kpi, dh_task_output) to
--        support richer metadata and cross-referencing.
-- ============================================================================

-- Ensure helper trigger exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Template Registry
-- ============================================================================

CREATE TABLE IF NOT EXISTS dh_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL,               -- protocol, sap, report, deck, checklist
  description TEXT,
  storage_uri TEXT,                                 -- physical location (S3, GCS, etc.)
  file_format VARCHAR(30),                          -- docx, pdf, markdown, etc.
  version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,      -- ordered outline / structure
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,     -- expected placeholders
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_dh_template_tenant ON dh_template(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dh_template_type ON dh_template(template_type);

DROP TRIGGER IF EXISTS trg_dh_template_updated ON dh_template;
CREATE TRIGGER trg_dh_template_updated
  BEFORE UPDATE ON dh_template
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE dh_template IS 'Reusable document/report templates referenced by workflows.';

-- Allow task outputs to point at catalogued templates
ALTER TABLE dh_task_output
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES dh_template(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_dh_task_output_template ON dh_task_output(template_id);

COMMENT ON COLUMN dh_task_output.template_id IS 'Optional reference to dh_template for generated artifacts.';

-- ============================================================================
-- Skill Registry
-- ============================================================================

CREATE TABLE IF NOT EXISTS dh_skill (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),                             -- clinical, regulatory, data_science, etc.
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_dh_skill_tenant ON dh_skill(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dh_skill_category ON dh_skill(category);

DROP TRIGGER IF EXISTS trg_dh_skill_updated ON dh_skill;
CREATE TRIGGER trg_dh_skill_updated
  BEFORE UPDATE ON dh_skill
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE dh_skill IS 'Catalog of reusable skills/competencies for agents and roles.';

CREATE TABLE IF NOT EXISTS dh_role_skill (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES dh_role(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES dh_skill(id) ON DELETE CASCADE,
  proficiency VARCHAR(20) NOT NULL DEFAULT 'expert'
    CHECK (proficiency IN ('expert','advanced','intermediate','foundation')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (role_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_role_skill_role ON dh_role_skill(role_id);
CREATE INDEX IF NOT EXISTS idx_dh_role_skill_skill ON dh_role_skill(skill_id);

COMMENT ON TABLE dh_role_skill IS 'Join table assigning skills to roles/agents with proficiency.';

-- ============================================================================
-- Catalog Enhancements (Tools & KPI metadata)
-- ============================================================================

ALTER TABLE dh_tool
  ADD COLUMN IF NOT EXISTS tool_type VARCHAR(50),                     -- clinical_system, analytics, api, etc.
  ADD COLUMN IF NOT EXISTS capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS access_requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN dh_tool.tool_type IS 'High-level classification of the tool (clinical_system, analytics, api, etc.).';
COMMENT ON COLUMN dh_tool.capabilities IS 'Array of supported capabilities / actions.';
COMMENT ON COLUMN dh_tool.access_requirements IS 'JSON describing licensing, approvals, or access rules.';
COMMENT ON COLUMN dh_tool.is_active IS 'Soft toggle to disable tool usage without deleting records.';

ALTER TABLE dh_kpi
  ADD COLUMN IF NOT EXISTS category VARCHAR(100),
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS direction VARCHAR(10)
    CHECK (direction IN ('minimize','maximize','target','monitor'));

COMMENT ON COLUMN dh_kpi.category IS 'Grouping for reporting (e.g., quality, speed, financial).';
COMMENT ON COLUMN dh_kpi.tags IS 'Searchable tags describing the KPI.';
COMMENT ON COLUMN dh_kpi.direction IS 'Indicates whether higher/lower values are preferred.';

-- ============================================================================
-- Ensure metadata defaults remain consistent
-- ============================================================================

UPDATE dh_tool
SET access_requirements = '{}'::jsonb
WHERE access_requirements IS NULL;

UPDATE dh_tool
SET capabilities = ARRAY[]::TEXT[]
WHERE capabilities IS NULL;

UPDATE dh_kpi
SET tags = ARRAY[]::TEXT[]
WHERE tags IS NULL;
