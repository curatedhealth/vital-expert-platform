-- ============================================================================
-- Enhance Digital Health workflow metadata to support advanced governance,
-- compliance, and automation attributes.
-- ============================================================================

SET search_path = public;

-- ---------------------------------------------------------------------------
-- dh_use_case enhancements
-- ---------------------------------------------------------------------------
ALTER TABLE dh_use_case
  ADD COLUMN org_id text,
  ADD COLUMN project_id text,
  ADD COLUMN product_id text,
  ADD COLUMN environment varchar(20) DEFAULT 'dev' CHECK (environment IN ('dev','staging','prod')),
  ADD COLUMN therapeutic_area text,
  ADD COLUMN indication text,
  ADD COLUMN phase text,
  ADD COLUMN version text,
  ADD COLUMN status varchar(20) DEFAULT 'draft' CHECK (status IN ('draft','in_review','approved','archived')),
  ADD COLUMN tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN owners jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN reviewers jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN approvers jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN change_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN regulatory_references jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN compliance_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN data_classification jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN sla jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN kpi_targets jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN integrations jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN risk_register jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN templates jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN rag_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN rag_citations jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN audit jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_dh_use_case_tags ON dh_use_case USING gin(tags);

-- ---------------------------------------------------------------------------
-- dh_workflow enhancements
-- ---------------------------------------------------------------------------
ALTER TABLE dh_workflow
  ADD COLUMN tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN sla jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN templates jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN rag_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN integrations jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN risk_register jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_dh_workflow_tags ON dh_workflow USING gin(tags);

-- ---------------------------------------------------------------------------
-- dh_task enhancements
-- ---------------------------------------------------------------------------
ALTER TABLE dh_task
  ADD COLUMN duration_estimate_minutes integer,
  ADD COLUMN effort_hours numeric(8,2),
  ADD COLUMN run_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN state varchar(20) DEFAULT 'planned' CHECK (state IN ('planned','in_progress','blocked','done','failed')),
  ADD COLUMN assignees jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN logs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN webhooks jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN schedule jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN guardrails jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN model_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN rollout varchar(20) DEFAULT 'stable',
  ADD COLUMN permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN integrations jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- dh_task_input / dh_task_output richer metadata
-- ---------------------------------------------------------------------------
ALTER TABLE dh_task_input
  ADD COLUMN description text,
  ADD COLUMN content_type text,
  ADD COLUMN schema_uri text,
  ADD COLUMN source jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN link_type text,
  ADD COLUMN link text,
  ADD COLUMN version text,
  ADD COLUMN validation jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE dh_task_output
  ADD COLUMN description text,
  ADD COLUMN artifact_kind text,
  ADD COLUMN content_type text,
  ADD COLUMN schema_uri text,
  ADD COLUMN link_type text,
  ADD COLUMN link text,
  ADD COLUMN version text,
  ADD COLUMN validation jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN template_id text;

-- ---------------------------------------------------------------------------
-- Prompt governance metadata
-- ---------------------------------------------------------------------------
ALTER TABLE dh_prompt
  ADD COLUMN prompt_identifier text,
  ADD COLUMN version_label text,
  ADD COLUMN owner jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN model_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN guardrails jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN evals jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN rollout varchar(20) DEFAULT 'stable';

ALTER TABLE dh_prompt_version
  ADD COLUMN model_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN guardrails jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN evals jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN rollout varchar(20) DEFAULT 'stable';

ALTER TABLE dh_prompt_eval
  ADD COLUMN metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- Supporting indexes for JSON lookups
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_dh_task_assignees ON dh_task USING gin(assignees);
CREATE INDEX IF NOT EXISTS idx_dh_prompt_identifier ON dh_prompt(prompt_identifier);

