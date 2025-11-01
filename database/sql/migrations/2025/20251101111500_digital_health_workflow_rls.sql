-- ================================================
-- RLS (Row-Level Security) for Digital Health Workflow (dh_*)
-- Date: 2025-11-01
-- Purpose: Enforce tenant isolation consistently with existing RLS pattern
-- Notes: Uses session context current_setting('app.tenant_id', true)
-- ================================================

-- Enable RLS on all dh_* tables
ALTER TABLE IF EXISTS dh_domain            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_use_case          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_workflow          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_task              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_task_dependency   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_role              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_task_role         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_tool              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_task_tool         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_rag_source        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_task_rag          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_prompt            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_prompt_version    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_prompt_eval       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_task_input        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_task_output       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_kpi               ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_task_kpi_target   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dh_task_link         ENABLE ROW LEVEL SECURITY;

-- Helper macro: create simple tenant isolation policy (USING only),
-- aligned with existing project style in 20251101_add_rls_policies.sql

-- Core
DROP POLICY IF EXISTS tenant_isolation_dh_domain ON dh_domain;
CREATE POLICY tenant_isolation_dh_domain ON dh_domain
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

DROP POLICY IF EXISTS tenant_isolation_dh_use_case ON dh_use_case;
CREATE POLICY tenant_isolation_dh_use_case ON dh_use_case
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

DROP POLICY IF EXISTS tenant_isolation_dh_workflow ON dh_workflow;
CREATE POLICY tenant_isolation_dh_workflow ON dh_workflow
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

DROP POLICY IF EXISTS tenant_isolation_dh_task ON dh_task;
CREATE POLICY tenant_isolation_dh_task ON dh_task
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

DROP POLICY IF EXISTS tenant_isolation_dh_task_dependency ON dh_task_dependency;
CREATE POLICY tenant_isolation_dh_task_dependency ON dh_task_dependency
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

-- Roles
DROP POLICY IF EXISTS tenant_isolation_dh_role ON dh_role;
CREATE POLICY tenant_isolation_dh_role ON dh_role
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

DROP POLICY IF EXISTS tenant_isolation_dh_task_role ON dh_task_role;
CREATE POLICY tenant_isolation_dh_task_role ON dh_task_role
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

-- Tools
DROP POLICY IF EXISTS tenant_isolation_dh_tool ON dh_tool;
CREATE POLICY tenant_isolation_dh_tool ON dh_tool
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

DROP POLICY IF EXISTS tenant_isolation_dh_task_tool ON dh_task_tool;
CREATE POLICY tenant_isolation_dh_task_tool ON dh_task_tool
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

-- RAG
DROP POLICY IF EXISTS tenant_isolation_dh_rag_source ON dh_rag_source;
CREATE POLICY tenant_isolation_dh_rag_source ON dh_rag_source
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

DROP POLICY IF EXISTS tenant_isolation_dh_task_rag ON dh_task_rag;
CREATE POLICY tenant_isolation_dh_task_rag ON dh_task_rag
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

-- Prompts
DROP POLICY IF EXISTS tenant_isolation_dh_prompt ON dh_prompt;
CREATE POLICY tenant_isolation_dh_prompt ON dh_prompt
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

DROP POLICY IF EXISTS tenant_isolation_dh_prompt_version ON dh_prompt_version;
CREATE POLICY tenant_isolation_dh_prompt_version ON dh_prompt_version
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

DROP POLICY IF EXISTS tenant_isolation_dh_prompt_eval ON dh_prompt_eval;
CREATE POLICY tenant_isolation_dh_prompt_eval ON dh_prompt_eval
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

-- Inputs / Outputs
DROP POLICY IF EXISTS tenant_isolation_dh_task_input ON dh_task_input;
CREATE POLICY tenant_isolation_dh_task_input ON dh_task_input
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

DROP POLICY IF EXISTS tenant_isolation_dh_task_output ON dh_task_output;
CREATE POLICY tenant_isolation_dh_task_output ON dh_task_output
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

-- KPIs
DROP POLICY IF EXISTS tenant_isolation_dh_kpi ON dh_kpi;
CREATE POLICY tenant_isolation_dh_kpi ON dh_kpi
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

DROP POLICY IF EXISTS tenant_isolation_dh_task_kpi_target ON dh_task_kpi_target;
CREATE POLICY tenant_isolation_dh_task_kpi_target ON dh_task_kpi_target
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

-- Links
DROP POLICY IF EXISTS tenant_isolation_dh_task_link ON dh_task_link;
CREATE POLICY tenant_isolation_dh_task_link ON dh_task_link
    USING (
        tenant_id = current_setting('app.tenant_id', true)::uuid
        OR current_setting('app.tenant_id', true) IS NULL
    );

-- Grants for Supabase 'authenticated' role (consistent with existing RLS migration)
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_domain           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_use_case         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_workflow         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_task             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_task_dependency  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_role             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_task_role        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_tool             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_task_tool        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_rag_source       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_task_rag         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_prompt           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_prompt_version   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_prompt_eval      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_task_input       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_task_output      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_kpi              TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_task_kpi_target  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dh_task_link        TO authenticated;

-- Optional: performance indexes on tenant_id for join tables not yet covered
-- (Many tables already have tenant_id indexes in their DDL.)

-- Verification block (not mandatory, but helpful)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'dh_%'
  ) LOOP
    RAISE NOTICE 'RLS enabled on %: %', r.tablename,
      (SELECT relrowsecurity FROM pg_class WHERE relname = r.tablename);
  END LOOP;
END $$;

