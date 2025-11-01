-- ============================================================================
-- Digital Health Workflow Schema (dh_*)
-- Date: 2025-11-01
-- Notes: Postgres / Supabase compatible. Uses UUID PKs, JSONB metadata,
--        update triggers, indexes, and FK relationships.
--        Multi-tenant via tenants.id
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";      -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- uuid_generate_v4()

-- Utility: updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1) Core: Domain → Use Case → Workflow → Task → Dependencies
-- ============================================================================

CREATE TABLE IF NOT EXISTS dh_domain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,                   -- e.g., CD, RA, MA, PD, EG
  name VARCHAR(150) NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_dh_domain_tenant ON dh_domain(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dh_domain_code ON dh_domain(code);

DROP TRIGGER IF EXISTS trg_dh_domain_updated ON dh_domain;
CREATE TRIGGER trg_dh_domain_updated
  BEFORE UPDATE ON dh_domain
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS dh_use_case (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES dh_domain(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,                   -- e.g., UC_CD_003
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  complexity VARCHAR(20) NOT NULL DEFAULT 'Advanced'
    CHECK (complexity IN ('Basic','Intermediate','Advanced','Expert')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_dh_use_case_domain ON dh_use_case(domain_id);
CREATE INDEX IF NOT EXISTS idx_dh_use_case_tenant ON dh_use_case(tenant_id);

DROP TRIGGER IF EXISTS trg_dh_use_case_updated ON dh_use_case;
CREATE TRIGGER trg_dh_use_case_updated
  BEFORE UPDATE ON dh_use_case
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS dh_workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  use_case_id UUID NOT NULL REFERENCES dh_use_case(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (use_case_id, name)
);

CREATE INDEX IF NOT EXISTS idx_dh_workflow_use_case ON dh_workflow(use_case_id);
CREATE INDEX IF NOT EXISTS idx_dh_workflow_tenant ON dh_workflow(tenant_id);

DROP TRIGGER IF EXISTS trg_dh_workflow_updated ON dh_workflow;
CREATE TRIGGER trg_dh_workflow_updated
  BEFORE UPDATE ON dh_workflow
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS dh_task (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES dh_workflow(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,                  -- e.g., T1, T2, T5
  title VARCHAR(255) NOT NULL,
  objective TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  extra JSONB NOT NULL DEFAULT '{}'::jsonb,   -- arbitrary task-specific data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workflow_id, code)
);

CREATE INDEX IF NOT EXISTS idx_dh_task_workflow ON dh_task(workflow_id);
CREATE INDEX IF NOT EXISTS idx_dh_task_code ON dh_task(code);
CREATE INDEX IF NOT EXISTS idx_dh_task_tenant ON dh_task(tenant_id);

DROP TRIGGER IF EXISTS trg_dh_task_updated ON dh_task;
CREATE TRIGGER trg_dh_task_updated
  BEFORE UPDATE ON dh_task
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS dh_task_dependency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (task_id, depends_on_task_id),
  CONSTRAINT chk_task_dependency_not_self CHECK (task_id <> depends_on_task_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_task_dep_task ON dh_task_dependency(task_id);
CREATE INDEX IF NOT EXISTS idx_dh_task_dep_depends ON dh_task_dependency(depends_on_task_id);

-- ============================================================================
-- 2) Metadata: Roles, Tools, RAG Sources, Prompts, Inputs/Outputs, KPIs, Links
-- ============================================================================

-- Roles (human or AI)
CREATE TABLE IF NOT EXISTS dh_role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,                 -- e.g., P04_BIOSTAT
  name VARCHAR(150) NOT NULL,
  agent_type VARCHAR(10) NOT NULL DEFAULT 'Human' CHECK (agent_type IN ('Human','AI')),
  department VARCHAR(150),
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_dh_role_tenant ON dh_role(tenant_id);

DROP TRIGGER IF EXISTS trg_dh_role_updated ON dh_role;
CREATE TRIGGER trg_dh_role_updated
  BEFORE UPDATE ON dh_role
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS dh_task_role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES dh_role(id) ON DELETE CASCADE,
  responsibility VARCHAR(20) NOT NULL DEFAULT 'Contributor'
    CHECK (responsibility IN ('Lead','Reviewer','Approver','Contributor')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (task_id, role_id, responsibility)
);

CREATE INDEX IF NOT EXISTS idx_dh_task_role_task ON dh_task_role(task_id);
CREATE INDEX IF NOT EXISTS idx_dh_task_role_role ON dh_task_role(role_id);

-- Tools
CREATE TABLE IF NOT EXISTS dh_tool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,                 -- e.g., R, TreeAge, EDC
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100),                     -- Statistics, Design, Clinical, etc.
  vendor VARCHAR(150),
  version VARCHAR(50),
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_dh_tool_tenant ON dh_tool(tenant_id);

DROP TRIGGER IF EXISTS trg_dh_tool_updated ON dh_tool;
CREATE TRIGGER trg_dh_tool_updated
  BEFORE UPDATE ON dh_tool
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS dh_task_tool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES dh_tool(id) ON DELETE CASCADE,
  purpose TEXT,                               -- usage context for the tool
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (task_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_task_tool_task ON dh_task_tool(task_id);
CREATE INDEX IF NOT EXISTS idx_dh_task_tool_tool ON dh_task_tool(tool_id);

-- RAG Sources
CREATE TABLE IF NOT EXISTS dh_rag_source (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(80) NOT NULL,
  name VARCHAR(255) NOT NULL,
  source_type VARCHAR(30) NOT NULL DEFAULT 'document'
    CHECK (source_type IN ('document','dataset','guidance','database','api','other')),
  uri TEXT,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_dh_rag_source_tenant ON dh_rag_source(tenant_id);

DROP TRIGGER IF EXISTS trg_dh_rag_source_updated ON dh_rag_source;
CREATE TRIGGER trg_dh_rag_source_updated
  BEFORE UPDATE ON dh_rag_source
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS dh_task_rag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  rag_source_id UUID NOT NULL REFERENCES dh_rag_source(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (task_id, rag_source_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_task_rag_task ON dh_task_rag(task_id);
CREATE INDEX IF NOT EXISTS idx_dh_task_rag_source ON dh_task_rag(rag_source_id);

-- Prompts (task-scoped definitions)
CREATE TABLE IF NOT EXISTS dh_prompt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,                 -- e.g., Sample_Size_Prompt
  pattern VARCHAR(30) NOT NULL DEFAULT 'CoT'  -- CoT, Few-Shot, ReAct, Direct, Other
    CHECK (pattern IN ('CoT','Few-Shot','ReAct','Direct','Other')),
  system_prompt TEXT NOT NULL,
  user_template TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name, task_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_prompt_task ON dh_prompt(task_id);
CREATE INDEX IF NOT EXISTS idx_dh_prompt_tenant ON dh_prompt(tenant_id);

DROP TRIGGER IF EXISTS trg_dh_prompt_updated ON dh_prompt;
CREATE TRIGGER trg_dh_prompt_updated
  BEFORE UPDATE ON dh_prompt
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Prompt Versioning
CREATE TABLE IF NOT EXISTS dh_prompt_version (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES dh_prompt(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  system_prompt TEXT NOT NULL,
  user_template TEXT NOT NULL,
  changelog TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (prompt_id, version)
);

CREATE INDEX IF NOT EXISTS idx_dh_prompt_ver_prompt ON dh_prompt_version(prompt_id);
CREATE INDEX IF NOT EXISTS idx_dh_prompt_ver_tenant ON dh_prompt_version(tenant_id);

DROP TRIGGER IF EXISTS trg_dh_prompt_ver_updated ON dh_prompt_version;
CREATE TRIGGER trg_dh_prompt_ver_updated
  BEFORE UPDATE ON dh_prompt_version
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Prompt Evaluations
CREATE TABLE IF NOT EXISTS dh_prompt_eval (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  prompt_version_id UUID NOT NULL REFERENCES dh_prompt_version(id) ON DELETE CASCADE,
  test_name VARCHAR(150) NOT NULL,
  result_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(30) DEFAULT 'completed' CHECK (status IN ('completed','failed','skipped','running')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (prompt_version_id, test_name)
);

CREATE INDEX IF NOT EXISTS idx_dh_prompt_eval_ver ON dh_prompt_eval(prompt_version_id);
CREATE INDEX IF NOT EXISTS idx_dh_prompt_eval_tenant ON dh_prompt_eval(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dh_prompt_eval_metrics ON dh_prompt_eval USING GIN (result_metrics);

-- Inputs
CREATE TABLE IF NOT EXISTS dh_task_input (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  input_type VARCHAR(30) NOT NULL DEFAULT 'document'  -- document, dataset, api, other
    CHECK (input_type IN ('document','dataset','api','other')),
  uri TEXT,
  source_task_id UUID REFERENCES dh_task(id) ON DELETE SET NULL,  -- if produced upstream
  required BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (task_id, name)
);

CREATE INDEX IF NOT EXISTS idx_dh_task_input_task ON dh_task_input(task_id);
CREATE INDEX IF NOT EXISTS idx_dh_task_input_source_task ON dh_task_input(source_task_id);

-- Outputs
CREATE TABLE IF NOT EXISTS dh_task_output (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  output_type VARCHAR(30) NOT NULL DEFAULT 'document'  -- document, dataset, api, visualization, other
    CHECK (output_type IN ('document','dataset','api','visualization','other')),
  uri TEXT,
  format VARCHAR(50),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (task_id, name)
);

CREATE INDEX IF NOT EXISTS idx_dh_task_output_task ON dh_task_output(task_id);

-- KPIs
CREATE TABLE IF NOT EXISTS dh_kpi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(80) NOT NULL,                 -- e.g., POWER_ACHIEVED
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50),                          -- %, days, score, etc.
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_dh_kpi_tenant ON dh_kpi(tenant_id);

DROP TRIGGER IF EXISTS trg_dh_kpi_updated ON dh_kpi;
CREATE TRIGGER trg_dh_kpi_updated
  BEFORE UPDATE ON dh_kpi
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS dh_task_kpi_target (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  kpi_id UUID NOT NULL REFERENCES dh_kpi(id) ON DELETE CASCADE,
  target_value NUMERIC,                       -- numeric target when applicable
  target_note TEXT,                           -- for non-numeric targets (e.g., narrative)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (task_id, kpi_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_task_kpi_task ON dh_task_kpi_target(task_id);
CREATE INDEX IF NOT EXISTS idx_dh_task_kpi_kpi ON dh_task_kpi_target(kpi_id);

-- Cross-use-case/task links
CREATE TABLE IF NOT EXISTS dh_task_link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  source_task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  target_task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  link_type VARCHAR(30) NOT NULL DEFAULT 'reference',  -- reference, derives_from, relates_to
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_task_id, target_task_id, link_type),
  CONSTRAINT chk_task_link_not_self CHECK (source_task_id <> target_task_id)
);

CREATE INDEX IF NOT EXISTS idx_dh_task_link_src ON dh_task_link(source_task_id);
CREATE INDEX IF NOT EXISTS idx_dh_task_link_tgt ON dh_task_link(target_task_id);

-- ============================================================================
-- Comments (self-documenting schema)
-- ============================================================================
COMMENT ON TABLE dh_domain IS 'Top-level functional domain (CD, RA, MA, PD, EG)';
COMMENT ON TABLE dh_use_case IS 'Business use case within a domain (e.g., UC_CD_003)';
COMMENT ON TABLE dh_workflow IS 'Grouping of tasks forming a process within a use case';
COMMENT ON TABLE dh_task IS 'Atomic executable step in a workflow';
COMMENT ON TABLE dh_task_dependency IS 'Directed dependency between tasks (DAG edges)';
COMMENT ON TABLE dh_role IS 'Human or AI roles available in the organization';
COMMENT ON TABLE dh_task_role IS 'Assignment of roles to tasks (Lead/Reviewer/Approver/Contributor)';
COMMENT ON TABLE dh_tool IS 'Approved software or systems';
COMMENT ON TABLE dh_task_tool IS 'Assignment of tools to tasks with purpose';
COMMENT ON TABLE dh_rag_source IS 'Validated knowledge/document/data sources for RAG';
COMMENT ON TABLE dh_task_rag IS 'Links RAG sources to tasks';
COMMENT ON TABLE dh_prompt IS 'Prompt definitions (task-scoped) for AI automation';
COMMENT ON TABLE dh_prompt_version IS 'Version history for prompts';
COMMENT ON TABLE dh_prompt_eval IS 'Evaluation results from prompt test runs';
COMMENT ON TABLE dh_task_input IS 'Artifacts required to execute a task';
COMMENT ON TABLE dh_task_output IS 'Artifacts produced by a task';
COMMENT ON TABLE dh_kpi IS 'KPI catalog for performance measurement';
COMMENT ON TABLE dh_task_kpi_target IS 'Target KPI values per task';
COMMENT ON TABLE dh_task_link IS 'Cross-use-case/task linkages for reuse and traceability';
