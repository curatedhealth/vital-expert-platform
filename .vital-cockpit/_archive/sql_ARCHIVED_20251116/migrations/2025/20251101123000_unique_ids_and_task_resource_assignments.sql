-- ============================================================================
-- Human-Readable Unique IDs & Task Resource Assignments
-- Date: 2025-11-01
-- Notes:
--   * Adds globally portable unique_id columns across registries and core tables.
--   * Introduces normalized task-to-resource assignment tables leveraging unique_ids.
--   * Extends skill registry with methodology metadata and dependency references.
--   * Provides helper functions to resolve registry entries by unique_id.
-- ============================================================================

-- Ensure helper trigger exists (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Utility helpers
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_normalize_identifier(p_text TEXT)
RETURNS TEXT AS $$
SELECT regexp_replace(upper(trim(p_text)), '[^A-Z0-9]+', '-', 'g');
$$ LANGUAGE sql IMMUTABLE;

-- ============================================================================
-- Core hierarchy unique IDs (Domain → Use Case → Workflow → Task)
-- ============================================================================

ALTER TABLE dh_domain
  ADD COLUMN IF NOT EXISTS unique_id TEXT;

UPDATE dh_domain
SET unique_id = COALESCE(unique_id,
                         'DMN-' || fn_normalize_identifier(code))
WHERE unique_id IS NULL;

ALTER TABLE dh_domain
  ALTER COLUMN unique_id SET NOT NULL;

ALTER TABLE dh_domain
  ADD CONSTRAINT dh_domain_unique_id_unique UNIQUE (tenant_id, unique_id);

CREATE INDEX IF NOT EXISTS idx_dh_domain_unique_id ON dh_domain(unique_id);

COMMENT ON COLUMN dh_domain.unique_id IS 'Human-readable identifier (e.g., DMN-CD).';

ALTER TABLE dh_use_case
  ADD COLUMN IF NOT EXISTS unique_id TEXT;

UPDATE dh_use_case uc
SET unique_id = COALESCE(
  unique_id,
  'USC-' ||
  fn_normalize_identifier(split_part(uc.code, '_', 2)) || '-' ||
  fn_normalize_identifier(split_part(uc.code, '_', 3))
)
WHERE unique_id IS NULL;

ALTER TABLE dh_use_case
  ALTER COLUMN unique_id SET NOT NULL;

ALTER TABLE dh_use_case
  ADD CONSTRAINT dh_use_case_unique_id_unique UNIQUE (tenant_id, unique_id);

CREATE INDEX IF NOT EXISTS idx_dh_use_case_unique_id ON dh_use_case(unique_id);

COMMENT ON COLUMN dh_use_case.unique_id IS 'Human-readable identifier (e.g., USC-CD-003).';

ALTER TABLE dh_workflow
  ADD COLUMN IF NOT EXISTS unique_id TEXT;

WITH wf_seq AS (
  SELECT
    wf.id,
    uc.unique_id,
    row_number() OVER (
      PARTITION BY wf.use_case_id
      ORDER BY COALESCE(wf.position, 0), wf.name
    ) AS seq
  FROM dh_workflow wf
  JOIN dh_use_case uc ON uc.id = wf.use_case_id
)
UPDATE dh_workflow wf
SET unique_id = COALESCE(
  wf.unique_id,
  'WFL-' ||
  split_part(wfs.unique_id, '-', 2) || '-' ||
  split_part(wfs.unique_id, '-', 3) || '-' ||
  to_char(wfs.seq, 'FM000')
)
FROM wf_seq wfs
WHERE wf.id = wfs.id
  AND wf.unique_id IS NULL;

ALTER TABLE dh_workflow
  ALTER COLUMN unique_id SET NOT NULL;

ALTER TABLE dh_workflow
  ADD CONSTRAINT dh_workflow_unique_id_unique UNIQUE (tenant_id, unique_id);

CREATE INDEX IF NOT EXISTS idx_dh_workflow_unique_id ON dh_workflow(unique_id);

COMMENT ON COLUMN dh_workflow.unique_id IS 'Human-readable identifier (e.g., WFL-CD-003-001).';

ALTER TABLE dh_task
  ADD COLUMN IF NOT EXISTS unique_id TEXT;

WITH task_codes AS (
  SELECT
    t.id,
    wf.unique_id AS workflow_uid,
    regexp_replace(t.code, '[^A-Za-z0-9]+', '-', 'g') AS sanitized_code
  FROM dh_task t
  JOIN dh_workflow wf ON wf.id = t.workflow_id
)
UPDATE dh_task t
SET unique_id = COALESCE(
  t.unique_id,
  'TSK-' ||
  split_part(tc.workflow_uid, '-', 2) || '-' ||
  split_part(tc.workflow_uid, '-', 3) || '-' ||
  tc.sanitized_code
)
FROM task_codes tc
WHERE t.id = tc.id
  AND t.unique_id IS NULL;

ALTER TABLE dh_task
  ALTER COLUMN unique_id SET NOT NULL;

ALTER TABLE dh_task
  ADD CONSTRAINT dh_task_unique_id_unique UNIQUE (tenant_id, unique_id);

CREATE INDEX IF NOT EXISTS idx_dh_task_unique_id ON dh_task(unique_id);

COMMENT ON COLUMN dh_task.unique_id IS 'Human-readable identifier (e.g., TSK-CD-003-T2).';

-- ============================================================================
-- Registry tables: unique IDs & enhancements
-- ============================================================================

ALTER TABLE dh_role
  ADD COLUMN IF NOT EXISTS unique_id TEXT,
  ADD COLUMN IF NOT EXISTS category_code TEXT;

UPDATE dh_role
SET unique_id = COALESCE(unique_id, 'AGT-' || fn_normalize_identifier(code)),
    category_code = COALESCE(category_code, NULLIF(fn_normalize_identifier(COALESCE(department, agent_type)), ''))
WHERE unique_id IS NULL OR category_code IS NULL;

ALTER TABLE dh_role
  ALTER COLUMN unique_id SET NOT NULL;

ALTER TABLE dh_role
  ADD CONSTRAINT dh_role_unique_id_unique UNIQUE (tenant_id, unique_id);

CREATE INDEX IF NOT EXISTS idx_dh_role_unique_id ON dh_role(unique_id);

COMMENT ON COLUMN dh_role.unique_id IS 'Agent identifier (e.g., AGT-CLN-P01-CMO).';

ALTER TABLE dh_prompt
  ADD COLUMN IF NOT EXISTS unique_id TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE dh_prompt
SET unique_id = COALESCE(unique_id, 'PRM-' || fn_normalize_identifier(name))
WHERE unique_id IS NULL;

ALTER TABLE dh_prompt
  ALTER COLUMN unique_id SET NOT NULL;

ALTER TABLE dh_prompt
  ADD CONSTRAINT dh_prompt_unique_id_unique UNIQUE (tenant_id, unique_id);

CREATE INDEX IF NOT EXISTS idx_dh_prompt_unique_id ON dh_prompt(unique_id);

COMMENT ON COLUMN dh_prompt.unique_id IS 'Prompt library identifier (e.g., PRM-CD-STUDY-DESIGN-V1).';

ALTER TABLE dh_prompt_version
  ADD COLUMN IF NOT EXISTS unique_id TEXT;

UPDATE dh_prompt_version pv
SET unique_id = COALESCE(
  pv.unique_id,
  dp.unique_id || '-V' || pv.version
)
FROM dh_prompt dp
WHERE pv.prompt_id = dp.id
  AND pv.unique_id IS NULL;

ALTER TABLE dh_prompt_version
  ADD CONSTRAINT dh_prompt_version_unique_id_unique UNIQUE (tenant_id, unique_id);

CREATE INDEX IF NOT EXISTS idx_dh_prompt_version_unique_id ON dh_prompt_version(unique_id);

COMMENT ON COLUMN dh_prompt_version.unique_id IS 'Prompt version identifier (e.g., PRM-CD-STUDY-DESIGN-V1).';

ALTER TABLE dh_tool
  ADD COLUMN IF NOT EXISTS unique_id TEXT;

UPDATE dh_tool
SET unique_id = COALESCE(unique_id, 'TLR-' || fn_normalize_identifier(code))
WHERE unique_id IS NULL;

ALTER TABLE dh_tool
  ALTER COLUMN unique_id SET NOT NULL;

ALTER TABLE dh_tool
  ADD CONSTRAINT dh_tool_unique_id_unique UNIQUE (tenant_id, unique_id);

CREATE INDEX IF NOT EXISTS idx_dh_tool_unique_id ON dh_tool(unique_id);

COMMENT ON COLUMN dh_tool.unique_id IS 'Tool identifier (e.g., TLR-CLN-EDC).';

ALTER TABLE dh_rag_source
  ADD COLUMN IF NOT EXISTS unique_id TEXT;

UPDATE dh_rag_source
SET unique_id = COALESCE(unique_id, 'RAG-' || fn_normalize_identifier(code))
WHERE unique_id IS NULL;

ALTER TABLE dh_rag_source
  ALTER COLUMN unique_id SET NOT NULL;

ALTER TABLE dh_rag_source
  ADD CONSTRAINT dh_rag_source_unique_id_unique UNIQUE (tenant_id, unique_id);

CREATE INDEX IF NOT EXISTS idx_dh_rag_source_unique_id ON dh_rag_source(unique_id);

COMMENT ON COLUMN dh_rag_source.unique_id IS 'RAG source identifier (e.g., RAG-REG-FDA-PRO-2009).';

ALTER TABLE dh_template
  ADD COLUMN IF NOT EXISTS unique_id TEXT;

UPDATE dh_template
SET unique_id = COALESCE(unique_id, 'TPL-' || fn_normalize_identifier(code))
WHERE unique_id IS NULL;

ALTER TABLE dh_template
  ALTER COLUMN unique_id SET NOT NULL;

ALTER TABLE dh_template
  ADD CONSTRAINT dh_template_unique_id_unique UNIQUE (tenant_id, unique_id);

CREATE INDEX IF NOT EXISTS idx_dh_template_unique_id ON dh_template(unique_id);

COMMENT ON COLUMN dh_template.unique_id IS 'Template identifier (e.g., TPL-RPT-SAMPLE-SIZE-V1).';

ALTER TABLE dh_kpi
  ADD COLUMN IF NOT EXISTS unique_id TEXT;

UPDATE dh_kpi
SET unique_id = COALESCE(unique_id, 'KPI-' || fn_normalize_identifier(code))
WHERE unique_id IS NULL;

ALTER TABLE dh_kpi
  ALTER COLUMN unique_id SET NOT NULL;

ALTER TABLE dh_kpi
  ADD CONSTRAINT dh_kpi_unique_id_unique UNIQUE (tenant_id, unique_id);

CREATE INDEX IF NOT EXISTS idx_dh_kpi_unique_id ON dh_kpi(unique_id);

COMMENT ON COLUMN dh_kpi.unique_id IS 'KPI identifier (e.g., KPI-EXE-COMPLETENESS).';

ALTER TABLE dh_skill
  ADD COLUMN IF NOT EXISTS unique_id TEXT,
  ADD COLUMN IF NOT EXISTS methodology JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS required_knowledge TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS required_tools TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS required_agents TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS input_schema JSONB,
  ADD COLUMN IF NOT EXISTS output_schema JSONB,
  ADD COLUMN IF NOT EXISTS quality_metrics JSONB,
  ADD COLUMN IF NOT EXISTS test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS test_results JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS version TEXT NOT NULL DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE dh_skill
SET unique_id = COALESCE(unique_id, 'SKL-' || fn_normalize_identifier(code))
WHERE unique_id IS NULL;

ALTER TABLE dh_skill
  ALTER COLUMN unique_id SET NOT NULL;

ALTER TABLE dh_skill
  ADD CONSTRAINT dh_skill_unique_id_unique UNIQUE (tenant_id, unique_id);

CREATE INDEX IF NOT EXISTS idx_dh_skill_unique_id ON dh_skill(unique_id);

COMMENT ON COLUMN dh_skill.unique_id IS 'Skill identifier (e.g., SKL-BIO-SAMPLE-SIZE-V1).';

-- ============================================================================
-- Task resource assignment tables (normalized references)
-- ============================================================================

CREATE TABLE IF NOT EXISTS dh_task_agent_assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES dh_role(id) ON DELETE CASCADE,
  task_unique_id TEXT NOT NULL,
  agent_unique_id TEXT NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN ('lead','reviewer','approver','contributor','observer')),
  sequence INTEGER NOT NULL DEFAULT 1,
  config_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  assignment_rationale TEXT,
  required_expertise TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (task_id, agent_id, role_type)
);

CREATE INDEX IF NOT EXISTS idx_task_agent_assignment_task ON dh_task_agent_assignment(task_id);
CREATE INDEX IF NOT EXISTS idx_task_agent_assignment_agent ON dh_task_agent_assignment(agent_id);
CREATE INDEX IF NOT EXISTS idx_task_agent_assignment_unique_ids ON dh_task_agent_assignment(task_unique_id, agent_unique_id);

COMMENT ON TABLE dh_task_agent_assignment IS 'Normalized mapping of tasks to agent resources using unique IDs.';

CREATE TABLE IF NOT EXISTS dh_task_prompt_assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES dh_prompt(id) ON DELETE CASCADE,
  agent_assignment_id UUID REFERENCES dh_task_agent_assignment(id) ON DELETE SET NULL,
  task_unique_id TEXT NOT NULL,
  prompt_unique_id TEXT NOT NULL,
  prompt_version_id UUID REFERENCES dh_prompt_version(id) ON DELETE SET NULL,
  version_preference TEXT NOT NULL DEFAULT 'latest',
  sequence INTEGER NOT NULL DEFAULT 1,
  input_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  config_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  purpose TEXT,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (task_id, prompt_id, sequence)
);

CREATE INDEX IF NOT EXISTS idx_task_prompt_assignment_task ON dh_task_prompt_assignment(task_id);
CREATE INDEX IF NOT EXISTS idx_task_prompt_assignment_prompt ON dh_task_prompt_assignment(prompt_id);
CREATE INDEX IF NOT EXISTS idx_task_prompt_assignment_agent ON dh_task_prompt_assignment(agent_assignment_id);

COMMENT ON TABLE dh_task_prompt_assignment IS 'Normalized mapping of tasks to prompt library entries.';

CREATE TABLE IF NOT EXISTS dh_task_skill_assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES dh_skill(id) ON DELETE CASCADE,
  agent_assignment_id UUID REFERENCES dh_task_agent_assignment(id) ON DELETE SET NULL,
  task_unique_id TEXT NOT NULL,
  skill_unique_id TEXT NOT NULL,
  input_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  config_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (task_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_task_skill_assignment_task ON dh_task_skill_assignment(task_id);
CREATE INDEX IF NOT EXISTS idx_task_skill_assignment_skill ON dh_task_skill_assignment(skill_id);

COMMENT ON TABLE dh_task_skill_assignment IS 'Associates tasks with reusable skills/capabilities.';

ALTER TABLE dh_task_tool
  ADD COLUMN IF NOT EXISTS task_unique_id TEXT,
  ADD COLUMN IF NOT EXISTS tool_unique_id TEXT,
  ADD COLUMN IF NOT EXISTS prompt_assignment_id UUID REFERENCES dh_task_prompt_assignment(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS connection_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS credentials_ref TEXT,
  ADD COLUMN IF NOT EXISTS rate_limit_per_hour INTEGER,
  ADD COLUMN IF NOT EXISTS max_calls INTEGER,
  ADD COLUMN IF NOT EXISTS is_required BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE dh_task_tool tt
SET task_unique_id = COALESCE(tt.task_unique_id, t.unique_id),
    tool_unique_id = COALESCE(tt.tool_unique_id, tool.unique_id)
FROM dh_task t,
     dh_tool tool
WHERE tt.task_id = t.id
  AND tool.id = tt.tool_id;

COMMENT ON COLUMN dh_task_tool.task_unique_id IS 'Portable task identifier.';
COMMENT ON COLUMN dh_task_tool.tool_unique_id IS 'Portable tool identifier.';
COMMENT ON COLUMN dh_task_tool.prompt_assignment_id IS 'Optional prompt assignment that invokes this tool.';

ALTER TABLE dh_task_rag
  ADD COLUMN IF NOT EXISTS task_unique_id TEXT,
  ADD COLUMN IF NOT EXISTS rag_unique_id TEXT,
  ADD COLUMN IF NOT EXISTS prompt_assignment_id UUID REFERENCES dh_task_prompt_assignment(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sections TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS query_context TEXT,
  ADD COLUMN IF NOT EXISTS search_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS max_chunks INTEGER,
  ADD COLUMN IF NOT EXISTS citation_required BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_required BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE dh_task_rag trg
SET task_unique_id = COALESCE(trg.task_unique_id, t.unique_id),
    rag_unique_id = COALESCE(trg.rag_unique_id, rs.unique_id)
FROM dh_task t,
     dh_rag_source rs
WHERE trg.task_id = t.id
  AND rs.id = trg.rag_source_id;

COMMENT ON COLUMN dh_task_rag.task_unique_id IS 'Portable task identifier.';
COMMENT ON COLUMN dh_task_rag.rag_unique_id IS 'Portable RAG source identifier.';

ALTER TABLE dh_task_output
  ADD COLUMN IF NOT EXISTS output_unique_id TEXT,
  ADD COLUMN IF NOT EXISTS output_format TEXT,
  ADD COLUMN IF NOT EXISTS generation_config JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE dh_task_output
SET output_unique_id = COALESCE(output_unique_id, 'OUT-' || fn_normalize_identifier(task_id::text) || '-' || fn_normalize_identifier(name))
WHERE output_unique_id IS NULL;

COMMENT ON COLUMN dh_task_output.output_unique_id IS 'Portable output identifier.';

CREATE TABLE IF NOT EXISTS dh_task_output_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_output_id UUID NOT NULL REFERENCES dh_task_output(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES dh_template(id) ON DELETE CASCADE,
  template_unique_id TEXT NOT NULL,
  variable_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_format TEXT NOT NULL DEFAULT 'pdf',
  generation_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (task_output_id, template_id)
);

CREATE INDEX IF NOT EXISTS idx_task_output_template_output ON dh_task_output_template(task_output_id);
CREATE INDEX IF NOT EXISTS idx_task_output_template_template ON dh_task_output_template(template_id);

COMMENT ON TABLE dh_task_output_template IS 'Associates task outputs with reusable templates and variable mappings.';

ALTER TABLE dh_task_kpi_target
  ADD COLUMN IF NOT EXISTS kpi_unique_id TEXT,
  ADD COLUMN IF NOT EXISTS threshold_type TEXT,
  ADD COLUMN IF NOT EXISTS threshold_value JSONB,
  ADD COLUMN IF NOT EXISTS measurement_method TEXT;

UPDATE dh_task_kpi_target tgt
SET kpi_unique_id = COALESCE(kpi_unique_id, kpi.unique_id)
FROM dh_kpi kpi
WHERE tgt.kpi_id = kpi.id;

CREATE INDEX IF NOT EXISTS idx_dh_task_kpi_target_unique_id ON dh_task_kpi_target(kpi_unique_id);

COMMENT ON COLUMN dh_task_kpi_target.kpi_unique_id IS 'Portable KPI identifier.';

-- ============================================================================
-- Junction tables for skills: prompts, tools, RAG dependencies
-- ============================================================================

CREATE TABLE IF NOT EXISTS dh_skill_prompt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES dh_skill(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES dh_prompt(id) ON DELETE CASCADE,
  prompt_unique_id TEXT NOT NULL,
  step_number INTEGER,
  sequence INTEGER NOT NULL DEFAULT 1,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (skill_id, prompt_id, sequence)
);

CREATE INDEX IF NOT EXISTS idx_dh_skill_prompt_skill ON dh_skill_prompt(skill_id);
CREATE INDEX IF NOT EXISTS idx_dh_skill_prompt_prompt ON dh_skill_prompt(prompt_id);

CREATE TABLE IF NOT EXISTS dh_skill_tool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES dh_skill(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES dh_tool(id) ON DELETE CASCADE,
  tool_unique_id TEXT NOT NULL,
  purpose TEXT,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (skill_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_skill_tool_skill ON dh_skill_tool(skill_id);
CREATE INDEX IF NOT EXISTS idx_dh_skill_tool_tool ON dh_skill_tool(tool_id);

CREATE TABLE IF NOT EXISTS dh_skill_rag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES dh_skill(id) ON DELETE CASCADE,
  rag_source_id UUID NOT NULL REFERENCES dh_rag_source(id) ON DELETE CASCADE,
  rag_unique_id TEXT NOT NULL,
  usage_type TEXT NOT NULL DEFAULT 'required',
  sections TEXT[] DEFAULT ARRAY[]::TEXT[],
  UNIQUE (skill_id, rag_source_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_skill_rag_skill ON dh_skill_rag(skill_id);
CREATE INDEX IF NOT EXISTS idx_dh_skill_rag_source ON dh_skill_rag(rag_source_id);

-- ============================================================================
-- Helper functions for unique_id resolution across registries
-- ============================================================================

CREATE OR REPLACE FUNCTION dh_resolve_domain_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_domain WHERE tenant_id = p_tenant AND unique_id = p_unique_id LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION dh_resolve_use_case_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_use_case WHERE tenant_id = p_tenant AND unique_id = p_unique_id LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION dh_resolve_workflow_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_workflow WHERE tenant_id = p_tenant AND unique_id = p_unique_id LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION dh_resolve_task_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_task WHERE tenant_id = p_tenant AND unique_id = p_unique_id LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION dh_resolve_agent_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_role WHERE tenant_id = p_tenant AND unique_id = p_unique_id LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION dh_resolve_prompt_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_prompt WHERE tenant_id = p_tenant AND unique_id = p_unique_id LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION dh_resolve_prompt_version_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_prompt_version WHERE tenant_id = p_tenant AND unique_id = p_unique_id LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION dh_resolve_skill_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_skill WHERE tenant_id = p_tenant AND unique_id = p_unique_id LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION dh_resolve_tool_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_tool WHERE tenant_id = p_tenant AND unique_id = p_unique_id LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION dh_resolve_rag_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_rag_source WHERE tenant_id = p_tenant AND unique_id = p_unique_id LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION dh_resolve_template_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_template WHERE tenant_id = p_tenant AND unique_id = p_unique_id LIMIT 1;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION dh_resolve_kpi_unique_id(p_tenant UUID, p_unique_id TEXT)
RETURNS UUID AS $$
  SELECT id FROM dh_kpi WHERE tenant_id = p_tenant AND unique_id = p_unique_id LIMIT 1;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- Cleanup helper: drop deprecated function if replicated
-- ============================================================================

DROP FUNCTION IF EXISTS resolve_agent_by_unique_id(TEXT);
DROP FUNCTION IF EXISTS resolve_prompt_by_unique_id(TEXT);
DROP FUNCTION IF EXISTS resolve_skill_by_unique_id(TEXT);
DROP FUNCTION IF EXISTS resolve_tool_by_unique_id(TEXT);
DROP FUNCTION IF EXISTS resolve_rag_by_unique_id(TEXT);
DROP FUNCTION IF EXISTS resolve_template_by_unique_id(TEXT);
DROP FUNCTION IF EXISTS resolve_kpi_by_unique_id(TEXT);
