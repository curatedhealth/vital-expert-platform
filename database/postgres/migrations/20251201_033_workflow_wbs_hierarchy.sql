-- Migration: 20251201_033_workflow_wbs_hierarchy.sql
-- Purpose: Implement 5-level Work Breakdown Structure (WBS) for workflows
--
-- HIERARCHY:
--   L1: workflow_templates  (Workflow - top container)
--   L2: workflow_stages     (Phase - major deliverable grouping)
--   L3: workflow_activities (Activity - group of related tasks) [NEW]
--   L4: workflow_tasks      (Task - discrete unit of work)
--   L5: workflow_steps      (Step - atomic action) [NEW]
--
-- Valid task_type values: 'manual', 'automated', 'decision', 'review', 'approval'

-- ============================================================================
-- STEP 1: Create L3 - workflow_activities table
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
  activity_number INTEGER NOT NULL,
  activity_code TEXT UNIQUE,
  activity_name TEXT NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT TRUE,
  can_parallel BOOLEAN DEFAULT FALSE,
  estimated_duration_minutes INTEGER,
  depends_on_activity_id UUID REFERENCES workflow_activities(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(stage_id, activity_number)
);

-- ============================================================================
-- STEP 2: Create L5 - workflow_steps table
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_code TEXT UNIQUE,
  step_name TEXT NOT NULL,
  description TEXT,
  step_type TEXT CHECK (step_type IN ('manual', 'automated', 'decision', 'review', 'approval')),
  estimated_duration_minutes INTEGER,
  is_hitl_checkpoint BOOLEAN DEFAULT FALSE,
  hitl_reason TEXT,
  ai_automation_score INTEGER CHECK (ai_automation_score >= 0 AND ai_automation_score <= 100),
  service_layer TEXT CHECK (service_layer IN ('L1_expert', 'L2_panel', 'L3_workflow', 'L4_solution')),
  input_artifacts TEXT[],
  output_artifacts TEXT[],
  tool_name TEXT,
  instructions TEXT,
  success_criteria TEXT,
  depends_on_step_id UUID REFERENCES workflow_steps(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, step_number)
);

-- ============================================================================
-- STEP 3: Add activity_id to workflow_tasks (linking L4 to L3)
-- ============================================================================

ALTER TABLE workflow_tasks
  ADD COLUMN IF NOT EXISTS activity_id UUID REFERENCES workflow_activities(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 4: PILOT 1 - BAU Workflow: KOL Engagement Analysis (WF-MAI-001)
-- Full 5-level WBS breakdown
-- ============================================================================

-- L2: Stage 1 - Data Collection & Preparation (already exists: a48dc10e-3151-42fe-8906-0ccdfd3facd9)

-- L3: Activities for Stage 1
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
VALUES
  ('a48dc10e-3151-42fe-8906-0ccdfd3facd9', 1, 'MAI001-S1-A1', 'CRM Data Extraction', 'Extract interaction and profile data from CRM systems', 50),
  ('a48dc10e-3151-42fe-8906-0ccdfd3facd9', 2, 'MAI001-S1-A2', 'Meeting Notes Processing', 'Aggregate and parse MSL meeting notes using NLP', 45),
  ('a48dc10e-3151-42fe-8906-0ccdfd3facd9', 3, 'MAI001-S1-A3', 'Data Validation & Prep', 'Validate completeness and standardize formats', 65)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- L4: Tasks for Activity 1 (CRM Data Extraction)
INSERT INTO workflow_tasks (activity_id, stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'MAI001-S1-A1-T1', 'Extract CRM Interaction Records', 'Pull KOL interaction data from Veeva CRM', 'automated', 20),
  (2, 'MAI001-S1-A1-T2', 'Extract HCP Profile Data', 'Pull HCP demographics and specialty info', 'automated', 15),
  (3, 'MAI001-S1-A1-T3', 'Merge and Deduplicate Records', 'Combine extracts and remove duplicates', 'automated', 15)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE a.activity_code = 'MAI001-S1-A1'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- L5: Steps for Task 1 (Extract CRM Interaction Records)
INSERT INTO workflow_steps (task_id, step_number, step_code, step_name, description, step_type, estimated_duration_minutes, ai_automation_score, service_layer, tool_name)
SELECT
  t.id, s.step_number, s.step_code, s.step_name, s.description, s.step_type, s.duration, s.ai_score, s.service_layer, s.tool_name
FROM workflow_tasks t
CROSS JOIN (VALUES
  (1, 'MAI001-S1-A1-T1-S1', 'Authenticate to Veeva API', 'Establish secure connection to Veeva CRM', 'automated', 2, 100, 'L3_workflow', 'Veeva API'),
  (2, 'MAI001-S1-A1-T1-S2', 'Query interactions by date range', 'Execute API query for reporting period', 'automated', 5, 100, 'L3_workflow', 'Veeva API'),
  (3, 'MAI001-S1-A1-T1-S3', 'Transform to standard schema', 'Map Veeva fields to internal schema', 'automated', 8, 95, 'L3_workflow', 'ETL Pipeline'),
  (4, 'MAI001-S1-A1-T1-S4', 'Export to staging', 'Write records to staging table', 'automated', 5, 100, 'L3_workflow', 'ETL Pipeline')
) AS s(step_number, step_code, step_name, description, step_type, duration, ai_score, service_layer, tool_name)
WHERE t.task_code = 'MAI001-S1-A1-T1'
ON CONFLICT (step_code) DO UPDATE SET step_name = EXCLUDED.step_name;

-- L5: Steps for Task 2 (Extract HCP Profile Data)
INSERT INTO workflow_steps (task_id, step_number, step_code, step_name, description, step_type, estimated_duration_minutes, ai_automation_score, service_layer, tool_name)
SELECT
  t.id, s.step_number, s.step_code, s.step_name, s.description, s.step_type, s.duration, s.ai_score, s.service_layer, s.tool_name
FROM workflow_tasks t
CROSS JOIN (VALUES
  (1, 'MAI001-S1-A1-T2-S1', 'Extract KOL ID list', 'Get unique KOL IDs from interactions', 'automated', 2, 100, 'L3_workflow', 'SQL'),
  (2, 'MAI001-S1-A1-T2-S2', 'Query HCP database', 'Fetch profile data for KOL IDs', 'automated', 5, 95, 'L3_workflow', 'HCP Database'),
  (3, 'MAI001-S1-A1-T2-S3', 'Enrich with specialty data', 'Add specialty and institution info', 'automated', 5, 90, 'L3_workflow', 'MDM'),
  (4, 'MAI001-S1-A1-T2-S4', 'Export profiles to staging', 'Write enriched profiles to staging', 'automated', 3, 100, 'L3_workflow', 'ETL Pipeline')
) AS s(step_number, step_code, step_name, description, step_type, duration, ai_score, service_layer, tool_name)
WHERE t.task_code = 'MAI001-S1-A1-T2'
ON CONFLICT (step_code) DO UPDATE SET step_name = EXCLUDED.step_name;

-- L4: Tasks for Activity 2 (Meeting Notes Processing)
INSERT INTO workflow_tasks (activity_id, stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'MAI001-S1-A2-T1', 'Collect Meeting Notes', 'Gather MSL meeting notes from SharePoint', 'automated', 10),
  (2, 'MAI001-S1-A2-T2', 'Parse Notes with NLP', 'Extract themes and sentiment using AI', 'manual', 25),
  (3, 'MAI001-S1-A2-T3', 'Tag and Categorize', 'Apply taxonomy tags to extracted themes', 'automated', 10)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE a.activity_code = 'MAI001-S1-A2'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- L5: Steps for Task 2 (Parse Notes with NLP) - includes HITL
INSERT INTO workflow_steps (task_id, step_number, step_code, step_name, description, step_type, estimated_duration_minutes, ai_automation_score, service_layer, tool_name, is_hitl_checkpoint, hitl_reason)
SELECT
  t.id, s.step_number, s.step_code, s.step_name, s.description, s.step_type, s.duration, s.ai_score, s.service_layer, s.tool_name, s.is_hitl, s.hitl_reason
FROM workflow_tasks t
CROSS JOIN (VALUES
  (1, 'MAI001-S1-A2-T2-S1', 'Preprocess note text', 'Clean and normalize text content', 'automated', 3, 95, 'L3_workflow', 'NLP Pipeline', FALSE, NULL),
  (2, 'MAI001-S1-A2-T2-S2', 'Extract key themes', 'Use Ask Expert for theme extraction', 'manual', 10, 70, 'L1_expert', 'Ask Expert', FALSE, NULL),
  (3, 'MAI001-S1-A2-T2-S3', 'Analyze sentiment', 'Determine sentiment per theme', 'automated', 5, 85, 'L3_workflow', 'Sentiment API', FALSE, NULL),
  (4, 'MAI001-S1-A2-T2-S4', 'Review AI extraction', 'Human review of AI-extracted themes', 'review', 7, 40, 'L1_expert', 'Review UI', TRUE, 'Verify AI theme extraction accuracy before proceeding')
) AS s(step_number, step_code, step_name, description, step_type, duration, ai_score, service_layer, tool_name, is_hitl, hitl_reason)
WHERE t.task_code = 'MAI001-S1-A2-T2'
ON CONFLICT (step_code) DO UPDATE SET step_name = EXCLUDED.step_name;

-- L4: Tasks for Activity 3 (Data Validation & Prep)
INSERT INTO workflow_tasks (activity_id, stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'MAI001-S1-A3-T1', 'Run Completeness Checks', 'Validate all required fields populated', 'automated', 15),
  (2, 'MAI001-S1-A3-T2', 'Review Exceptions', 'Human review of flagged records', 'review', 20),
  (3, 'MAI001-S1-A3-T3', 'Standardize Formats', 'Normalize dates, categories, codes', 'automated', 15),
  (4, 'MAI001-S1-A3-T4', 'Approve Dataset', 'Final approval before analysis', 'approval', 15)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE a.activity_code = 'MAI001-S1-A3'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- L5: Steps for Approval Task (includes HITL approval gate)
INSERT INTO workflow_steps (task_id, step_number, step_code, step_name, description, step_type, estimated_duration_minutes, ai_automation_score, service_layer, tool_name, is_hitl_checkpoint, hitl_reason)
SELECT
  t.id, s.step_number, s.step_code, s.step_name, s.description, s.step_type, s.duration, s.ai_score, s.service_layer, s.tool_name, s.is_hitl, s.hitl_reason
FROM workflow_tasks t
CROSS JOIN (VALUES
  (1, 'MAI001-S1-A3-T4-S1', 'Generate quality report', 'Compile DQ metrics and exceptions', 'automated', 3, 95, 'L3_workflow', 'DQ Dashboard', FALSE, NULL),
  (2, 'MAI001-S1-A3-T4-S2', 'Review quality metrics', 'Analyst reviews DQ summary', 'review', 5, 50, 'L1_expert', 'DQ Dashboard', FALSE, NULL),
  (3, 'MAI001-S1-A3-T4-S3', 'Approve or reject dataset', 'Director approves for analysis', 'approval', 5, 30, 'L1_expert', 'Approval Workflow', TRUE, 'Data quality sign-off required before analysis phase'),
  (4, 'MAI001-S1-A3-T4-S4', 'Log approval decision', 'Record approval in audit trail', 'automated', 2, 100, 'L3_workflow', 'Audit Log', FALSE, NULL)
) AS s(step_number, step_code, step_name, description, step_type, duration, ai_score, service_layer, tool_name, is_hitl, hitl_reason)
WHERE t.task_code = 'MAI001-S1-A3-T4'
ON CONFLICT (step_code) DO UPDATE SET step_name = EXCLUDED.step_name;

-- L2: Stage 2 - Analysis & Modeling (already exists: 40d139a7-0297-451e-a006-1d16f6737e19)

-- L3: Activities for Stage 2
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
VALUES
  ('40d139a7-0297-451e-a006-1d16f6737e19', 1, 'MAI001-S2-A1', 'Engagement Scoring', 'Calculate KOL engagement metrics and scores', 90),
  ('40d139a7-0297-451e-a006-1d16f6737e19', 2, 'MAI001-S2-A2', 'Segmentation Analysis', 'Segment KOLs by engagement tiers', 60),
  ('40d139a7-0297-451e-a006-1d16f6737e19', 3, 'MAI001-S2-A3', 'Trend Analysis', 'Analyze patterns and anomalies over time', 105),
  ('40d139a7-0297-451e-a006-1d16f6737e19', 4, 'MAI001-S2-A4', 'Analysis Validation', 'Cross-functional validation of methodology', 65)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- L4: Tasks for Engagement Scoring Activity
INSERT INTO workflow_tasks (activity_id, stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'MAI001-S2-A1-T1', 'Calculate RFM Metrics', 'Compute Recency, Frequency, Monetary scores', 'automated', 30),
  (2, 'MAI001-S2-A1-T2', 'Calculate Engagement Index', 'Combine RFM into composite engagement score', 'automated', 25),
  (3, 'MAI001-S2-A1-T3', 'Generate Trend Indicators', 'Calculate MoM and YoY trends per KOL', 'automated', 20),
  (4, 'MAI001-S2-A1-T4', 'Validate Scores', 'Spot-check score calculations', 'review', 15)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE a.activity_code = 'MAI001-S2-A1'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- L5: Steps for Calculate RFM Metrics
INSERT INTO workflow_steps (task_id, step_number, step_code, step_name, description, step_type, estimated_duration_minutes, ai_automation_score, service_layer, tool_name)
SELECT
  t.id, s.step_number, s.step_code, s.step_name, s.description, s.step_type, s.duration, s.ai_score, s.service_layer, s.tool_name
FROM workflow_tasks t
CROSS JOIN (VALUES
  (1, 'MAI001-S2-A1-T1-S1', 'Calculate Recency scores', 'Days since last interaction per KOL', 'automated', 8, 100, 'L3_workflow', 'Analytics Engine'),
  (2, 'MAI001-S2-A1-T1-S2', 'Calculate Frequency scores', 'Interaction count per period', 'automated', 8, 100, 'L3_workflow', 'Analytics Engine'),
  (3, 'MAI001-S2-A1-T1-S3', 'Calculate Monetary/Value scores', 'Impact value of interactions', 'automated', 8, 95, 'L3_workflow', 'Analytics Engine'),
  (4, 'MAI001-S2-A1-T1-S4', 'Normalize to 1-5 scale', 'Quintile-based normalization', 'automated', 6, 100, 'L3_workflow', 'Analytics Engine')
) AS s(step_number, step_code, step_name, description, step_type, duration, ai_score, service_layer, tool_name)
WHERE t.task_code = 'MAI001-S2-A1-T1'
ON CONFLICT (step_code) DO UPDATE SET step_name = EXCLUDED.step_name;

-- L4: Tasks for Segmentation Analysis Activity
INSERT INTO workflow_tasks (activity_id, stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'MAI001-S2-A2-T1', 'Define Segment Criteria', 'Set thresholds for engagement tiers', 'decision', 20),
  (2, 'MAI001-S2-A2-T2', 'Apply Clustering', 'K-means clustering on engagement scores', 'automated', 20),
  (3, 'MAI001-S2-A2-T3', 'Create Segment Profiles', 'Generate persona descriptions per segment', 'manual', 20)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE a.activity_code = 'MAI001-S2-A2'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- L5: Steps for Define Segment Criteria (includes decision point)
INSERT INTO workflow_steps (task_id, step_number, step_code, step_name, description, step_type, estimated_duration_minutes, ai_automation_score, service_layer, tool_name, is_hitl_checkpoint, hitl_reason)
SELECT
  t.id, s.step_number, s.step_code, s.step_name, s.description, s.step_type, s.duration, s.ai_score, s.service_layer, s.tool_name, s.is_hitl, s.hitl_reason
FROM workflow_tasks t
CROSS JOIN (VALUES
  (1, 'MAI001-S2-A2-T1-S1', 'Review historical segments', 'Analyze prior period segments', 'automated', 5, 90, 'L3_workflow', 'Analytics DB', FALSE, NULL),
  (2, 'MAI001-S2-A2-T1-S2', 'AI recommend thresholds', 'Use Ask Expert for optimal cutoffs', 'manual', 8, 70, 'L1_expert', 'Ask Expert', FALSE, NULL),
  (3, 'MAI001-S2-A2-T1-S3', 'Business review thresholds', 'Medical Affairs reviews recommendations', 'decision', 7, 40, 'L2_panel', 'Review Meeting', TRUE, 'Segmentation criteria require business alignment')
) AS s(step_number, step_code, step_name, description, step_type, duration, ai_score, service_layer, tool_name, is_hitl, hitl_reason)
WHERE t.task_code = 'MAI001-S2-A2-T1'
ON CONFLICT (step_code) DO UPDATE SET step_name = EXCLUDED.step_name;

-- L2: Stage 3 - Insight Generation & Reporting (already exists: b7346dd3-e5ac-4b45-930c-557b7759fa41)

-- L3: Activities for Stage 3
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
VALUES
  ('b7346dd3-e5ac-4b45-930c-557b7759fa41', 1, 'MAI001-S3-A1', 'Insight Synthesis', 'Generate executive summary and key findings', 90),
  ('b7346dd3-e5ac-4b45-930c-557b7759fa41', 2, 'MAI001-S3-A2', 'Visualization Creation', 'Build dashboard charts and visuals', 60),
  ('b7346dd3-e5ac-4b45-930c-557b7759fa41', 3, 'MAI001-S3-A3', 'Report Assembly', 'Compile final report package', 75),
  ('b7346dd3-e5ac-4b45-930c-557b7759fa41', 4, 'MAI001-S3-A4', 'Report Approval', 'Leadership review and sign-off', 45)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- L4: Tasks for Insight Synthesis Activity
INSERT INTO workflow_tasks (activity_id, stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'MAI001-S3-A1-T1', 'Identify Top 5 Insights', 'Select most impactful findings', 'manual', 30),
  (2, 'MAI001-S3-A1-T2', 'Draft Executive Summary', 'AI-assisted summary generation', 'manual', 40),
  (3, 'MAI001-S3-A1-T3', 'Formulate Recommendations', 'Create actionable recommendations', 'decision', 20)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE a.activity_code = 'MAI001-S3-A1'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- L5: Steps for Draft Executive Summary (AI-assisted)
INSERT INTO workflow_steps (task_id, step_number, step_code, step_name, description, step_type, estimated_duration_minutes, ai_automation_score, service_layer, tool_name, is_hitl_checkpoint, hitl_reason)
SELECT
  t.id, s.step_number, s.step_code, s.step_name, s.description, s.step_type, s.duration, s.ai_score, s.service_layer, s.tool_name, s.is_hitl, s.hitl_reason
FROM workflow_tasks t
CROSS JOIN (VALUES
  (1, 'MAI001-S3-A1-T2-S1', 'Gather analysis artifacts', 'Collect all analysis outputs', 'automated', 5, 100, 'L3_workflow', 'Document Collector', FALSE, NULL),
  (2, 'MAI001-S3-A1-T2-S2', 'Generate AI draft', 'Use Ask Expert to draft summary', 'manual', 15, 75, 'L1_expert', 'Ask Expert', FALSE, NULL),
  (3, 'MAI001-S3-A1-T2-S3', 'Human edit and refine', 'Director edits AI draft', 'manual', 15, 30, 'L1_expert', 'Document Editor', TRUE, 'Executive summary requires human refinement'),
  (4, 'MAI001-S3-A1-T2-S4', 'Format to template', 'Apply corporate template', 'automated', 5, 95, 'L3_workflow', 'Template Engine', FALSE, NULL)
) AS s(step_number, step_code, step_name, description, step_type, duration, ai_score, service_layer, tool_name, is_hitl, hitl_reason)
WHERE t.task_code = 'MAI001-S3-A1-T2'
ON CONFLICT (step_code) DO UPDATE SET step_name = EXCLUDED.step_name;

-- L2: Stage 4 - Action Planning & Follow-up (already exists: 64f65684-38d7-400a-bb83-6fef405ad65e)

-- L3: Activities for Stage 4
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
VALUES
  ('64f65684-38d7-400a-bb83-6fef405ad65e', 1, 'MAI001-S4-A1', 'Report Distribution', 'Distribute report to stakeholders', 20),
  ('64f65684-38d7-400a-bb83-6fef405ad65e', 2, 'MAI001-S4-A2', 'Action Item Tracking', 'Schedule and assign follow-up actions', 30),
  ('64f65684-38d7-400a-bb83-6fef405ad65e', 3, 'MAI001-S4-A3', 'Data Feedback Loop', 'Update CRM and archive artifacts', 30)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- L4: Tasks for Action Item Tracking Activity
INSERT INTO workflow_tasks (activity_id, stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'MAI001-S4-A2-T1', 'Extract Action Items', 'Parse recommendations into tasks', 'automated', 10),
  (2, 'MAI001-S4-A2-T2', 'Assign Owners', 'Assign responsible parties', 'decision', 10),
  (3, 'MAI001-S4-A2-T3', 'Schedule Follow-ups', 'Create calendar events', 'automated', 10)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE a.activity_code = 'MAI001-S4-A2'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- ============================================================================
-- STEP 5: PILOT 2 - PROJECT Workflow: Customer 360 Platform Build (WF-XFI-001)
-- Full 5-level WBS breakdown
-- ============================================================================

-- L2: Stage 1 - Requirements & Design (already exists: a7f57bc4-6da8-45ec-a618-1d47a225cf38)

-- L3: Activities for Stage 1
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
VALUES
  ('a7f57bc4-6da8-45ec-a618-1d47a225cf38', 1, 'XFI001-S1-A1', 'Stakeholder Discovery', 'Interview stakeholders across functions', 720),
  ('a7f57bc4-6da8-45ec-a618-1d47a225cf38', 2, 'XFI001-S1-A2', 'Data Source Inventory', 'Catalog all potential data sources', 360),
  ('a7f57bc4-6da8-45ec-a618-1d47a225cf38', 3, 'XFI001-S1-A3', 'Entity Model Design', 'Define unified customer entity model', 480),
  ('a7f57bc4-6da8-45ec-a618-1d47a225cf38', 4, 'XFI001-S1-A4', 'Architecture Design', 'Design technical data architecture', 600),
  ('a7f57bc4-6da8-45ec-a618-1d47a225cf38', 5, 'XFI001-S1-A5', 'Project Planning', 'Create detailed project plan', 240)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- L4: Tasks for Stakeholder Discovery Activity
INSERT INTO workflow_tasks (activity_id, stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'XFI001-S1-A1-T1', 'Identify Stakeholders', 'Map stakeholder universe across functions', 'manual', 120),
  (2, 'XFI001-S1-A1-T2', 'Create Interview Guides', 'Design function-specific interview templates', 'manual', 120),
  (3, 'XFI001-S1-A1-T3', 'Conduct Medical Affairs Interviews', 'Interview Medical Affairs stakeholders', 'manual', 180),
  (4, 'XFI001-S1-A1-T4', 'Conduct Commercial Interviews', 'Interview Commercial stakeholders', 'manual', 180),
  (5, 'XFI001-S1-A1-T5', 'Synthesize Requirements', 'Consolidate findings into requirements doc', 'manual', 120)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE a.activity_code = 'XFI001-S1-A1'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- L5: Steps for Conduct Medical Affairs Interviews
INSERT INTO workflow_steps (task_id, step_number, step_code, step_name, description, step_type, estimated_duration_minutes, ai_automation_score, service_layer, tool_name, is_hitl_checkpoint, hitl_reason)
SELECT
  t.id, s.step_number, s.step_code, s.step_name, s.description, s.step_type, s.duration, s.ai_score, s.service_layer, s.tool_name, s.is_hitl, s.hitl_reason
FROM workflow_tasks t
CROSS JOIN (VALUES
  (1, 'XFI001-S1-A1-T3-S1', 'Schedule interview sessions', 'Coordinate with MA leadership calendars', 'manual', 30, 40, 'L1_expert', 'Calendar', FALSE, NULL),
  (2, 'XFI001-S1-A1-T3-S2', 'Prepare interview materials', 'Customize guide for MA context', 'manual', 30, 60, 'L1_expert', 'Document Editor', FALSE, NULL),
  (3, 'XFI001-S1-A1-T3-S3', 'Conduct interviews', 'Facilitate discovery sessions', 'manual', 90, 20, 'L2_panel', 'Teams/Zoom', TRUE, 'Stakeholder input critical for requirements'),
  (4, 'XFI001-S1-A1-T3-S4', 'Document findings', 'Transcribe and summarize key points', 'manual', 30, 65, 'L1_expert', 'Ask Expert', FALSE, NULL)
) AS s(step_number, step_code, step_name, description, step_type, duration, ai_score, service_layer, tool_name, is_hitl, hitl_reason)
WHERE t.task_code = 'XFI001-S1-A1-T3'
ON CONFLICT (step_code) DO UPDATE SET step_name = EXCLUDED.step_name;

-- L4: Tasks for Entity Model Design Activity
INSERT INTO workflow_tasks (activity_id, stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'XFI001-S1-A3-T1', 'Define HCP Entity', 'Design HCP entity with all attributes', 'manual', 120),
  (2, 'XFI001-S1-A3-T2', 'Define HCO Entity', 'Design HCO entity with relationships', 'manual', 120),
  (3, 'XFI001-S1-A3-T3', 'Define Payer Entity', 'Design Payer entity for Market Access', 'manual', 120),
  (4, 'XFI001-S1-A3-T4', 'Cross-functional Review', 'Validate entity model with all functions', 'decision', 120)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE a.activity_code = 'XFI001-S1-A3'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- L5: Steps for Define HCP Entity
INSERT INTO workflow_steps (task_id, step_number, step_code, step_name, description, step_type, estimated_duration_minutes, ai_automation_score, service_layer, tool_name, is_hitl_checkpoint, hitl_reason)
SELECT
  t.id, s.step_number, s.step_code, s.step_name, s.description, s.step_type, s.duration, s.ai_score, s.service_layer, s.tool_name, s.is_hitl, s.hitl_reason
FROM workflow_tasks t
CROSS JOIN (VALUES
  (1, 'XFI001-S1-A3-T1-S1', 'Research HCP standards', 'Review NPI, IQVIA, Veeva standards', 'manual', 30, 70, 'L1_expert', 'Ask Expert', FALSE, NULL),
  (2, 'XFI001-S1-A3-T1-S2', 'Define core attributes', 'List mandatory HCP attributes', 'manual', 30, 50, 'L1_expert', 'ERD Tool', FALSE, NULL),
  (3, 'XFI001-S1-A3-T1-S3', 'Define extended attributes', 'Add function-specific attributes', 'manual', 30, 55, 'L2_panel', 'ERD Tool', TRUE, 'Attribute selection requires cross-functional input'),
  (4, 'XFI001-S1-A3-T1-S4', 'Document entity specification', 'Create formal entity spec doc', 'automated', 30, 80, 'L3_workflow', 'Doc Generator', FALSE, NULL)
) AS s(step_number, step_code, step_name, description, step_type, duration, ai_score, service_layer, tool_name, is_hitl, hitl_reason)
WHERE t.task_code = 'XFI001-S1-A3-T1'
ON CONFLICT (step_code) DO UPDATE SET step_name = EXCLUDED.step_name;

-- L2: Stage 2 - Data Integration & ETL (already exists: e4d19e94-0fa4-451a-be34-c540201eee44)

-- L3: Activities for Stage 2
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
VALUES
  ('e4d19e94-0fa4-451a-be34-c540201eee44', 1, 'XFI001-S2-A1', 'Connector Development', 'Build data source connectors', 1200),
  ('e4d19e94-0fa4-451a-be34-c540201eee44', 2, 'XFI001-S2-A2', 'Identity Resolution', 'Implement customer matching algorithm', 960),
  ('e4d19e94-0fa4-451a-be34-c540201eee44', 3, 'XFI001-S2-A3', 'MDM Implementation', 'Build master data hub', 720),
  ('e4d19e94-0fa4-451a-be34-c540201eee44', 4, 'XFI001-S2-A4', 'Data Quality Framework', 'Implement DQ rules and monitoring', 600),
  ('e4d19e94-0fa4-451a-be34-c540201eee44', 5, 'XFI001-S2-A5', 'Integration Validation', 'Validate integrated data quality', 300)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- L4: Tasks for Identity Resolution Activity
INSERT INTO workflow_tasks (activity_id, stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'XFI001-S2-A2-T1', 'Define Matching Rules', 'Create deterministic and probabilistic rules', 'manual', 240),
  (2, 'XFI001-S2-A2-T2', 'Build Matching Algorithm', 'Implement matching logic', 'manual', 360),
  (3, 'XFI001-S2-A2-T3', 'Test Match Quality', 'Validate match rate and false positives', 'review', 180),
  (4, 'XFI001-S2-A2-T4', 'Business Validation', 'Stakeholders review matching results', 'approval', 180)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE a.activity_code = 'XFI001-S2-A2'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- L5: Steps for Define Matching Rules (includes panel decision)
INSERT INTO workflow_steps (task_id, step_number, step_code, step_name, description, step_type, estimated_duration_minutes, ai_automation_score, service_layer, tool_name, is_hitl_checkpoint, hitl_reason)
SELECT
  t.id, s.step_number, s.step_code, s.step_name, s.description, s.step_type, s.duration, s.ai_score, s.service_layer, s.tool_name, s.is_hitl, s.hitl_reason
FROM workflow_tasks t
CROSS JOIN (VALUES
  (1, 'XFI001-S2-A2-T1-S1', 'Inventory matching attributes', 'List attributes available for matching', 'automated', 30, 85, 'L3_workflow', 'Data Catalog', FALSE, NULL),
  (2, 'XFI001-S2-A2-T1-S2', 'Define deterministic rules', 'Exact match rules (NPI, email)', 'manual', 60, 60, 'L1_expert', 'Rule Editor', FALSE, NULL),
  (3, 'XFI001-S2-A2-T1-S3', 'Define probabilistic rules', 'Fuzzy match rules (name, address)', 'manual', 90, 55, 'L1_expert', 'Rule Editor', FALSE, NULL),
  (4, 'XFI001-S2-A2-T1-S4', 'Cross-functional rule review', 'Get agreement on match thresholds', 'decision', 60, 35, 'L2_panel', 'Review Meeting', TRUE, 'Matching rules affect all customer views')
) AS s(step_number, step_code, step_name, description, step_type, duration, ai_score, service_layer, tool_name, is_hitl, hitl_reason)
WHERE t.task_code = 'XFI001-S2-A2-T1'
ON CONFLICT (step_code) DO UPDATE SET step_name = EXCLUDED.step_name;

-- L2: Stage 3 - Analytics & Scoring (already exists: 9a872072-a742-482c-85d3-cbfa49b8f6ae)

-- L3: Activities for Stage 3
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
VALUES
  ('9a872072-a742-482c-85d3-cbfa49b8f6ae', 1, 'XFI001-S3-A1', 'Scoring Model Development', 'Build value and propensity scores', 960),
  ('9a872072-a742-482c-85d3-cbfa49b8f6ae', 2, 'XFI001-S3-A2', 'Segmentation Implementation', 'Apply clustering for segments', 480),
  ('9a872072-a742-482c-85d3-cbfa49b8f6ae', 3, 'XFI001-S3-A3', 'Derived Attributes', 'Generate behavioral metrics', 360),
  ('9a872072-a742-482c-85d3-cbfa49b8f6ae', 4, 'XFI001-S3-A4', 'Analytics Validation', 'Cross-functional sign-off', 300)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- L4: Tasks for Scoring Model Development
INSERT INTO workflow_tasks (activity_id, stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'XFI001-S3-A1-T1', 'Build Value Score Model', 'Customer lifetime value prediction', 'manual', 300),
  (2, 'XFI001-S3-A1-T2', 'Build Engagement Score', 'Multi-channel engagement index', 'manual', 240),
  (3, 'XFI001-S3-A1-T3', 'Build Propensity Models', 'Prescription, adoption propensity', 'manual', 300),
  (4, 'XFI001-S3-A1-T4', 'Model Validation', 'Test accuracy and business relevance', 'review', 120)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE a.activity_code = 'XFI001-S3-A1'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- L2: Stage 4 - Visualization & Access (already exists: 0c0e7e41-521a-40b2-8551-bc7bfa89b2aa)

-- L3: Activities for Stage 4
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
VALUES
  ('0c0e7e41-521a-40b2-8551-bc7bfa89b2aa', 1, 'XFI001-S4-A1', 'UX Design', 'Design dashboard user experience', 600),
  ('0c0e7e41-521a-40b2-8551-bc7bfa89b2aa', 2, 'XFI001-S4-A2', 'Dashboard Development', 'Build visualization components', 960),
  ('0c0e7e41-521a-40b2-8551-bc7bfa89b2aa', 3, 'XFI001-S4-A3', 'Security Implementation', 'Implement RBAC and data security', 360),
  ('0c0e7e41-521a-40b2-8551-bc7bfa89b2aa', 4, 'XFI001-S4-A4', 'User Acceptance Testing', 'Conduct UAT with all functions', 600)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- L2: Stage 5 - Governance & Maintenance (already exists: 3fd4208e-261c-4f24-85ac-e06d5345508e)

-- L3: Activities for Stage 5
INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
VALUES
  ('3fd4208e-261c-4f24-85ac-e06d5345508e', 1, 'XFI001-S5-A1', 'Governance Framework', 'Establish data governance model', 480),
  ('3fd4208e-261c-4f24-85ac-e06d5345508e', 2, 'XFI001-S5-A2', 'Operational Readiness', 'Create runbooks and monitoring', 360),
  ('3fd4208e-261c-4f24-85ac-e06d5345508e', 3, 'XFI001-S5-A3', 'Training & Enablement', 'Train end users across functions', 360),
  ('3fd4208e-261c-4f24-85ac-e06d5345508e', 4, 'XFI001-S5-A4', 'Go-Live & Transition', 'Execute launch and transition to ops', 240)
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- L4: Tasks for Go-Live & Transition
INSERT INTO workflow_tasks (activity_id, stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'XFI001-S5-A4-T1', 'Go-Live Readiness Check', 'Final checklist before launch', 'review', 60),
  (2, 'XFI001-S5-A4-T2', 'Execute Go-Live', 'Deploy to production', 'manual', 60),
  (3, 'XFI001-S5-A4-T3', 'Hypercare Support', 'Post-launch support period', 'manual', 60),
  (4, 'XFI001-S5-A4-T4', 'Project Close-out', 'Transition to operations', 'approval', 60)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE a.activity_code = 'XFI001-S5-A4'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name;

-- L5: Steps for Go-Live Readiness Check
INSERT INTO workflow_steps (task_id, step_number, step_code, step_name, description, step_type, estimated_duration_minutes, ai_automation_score, service_layer, tool_name, is_hitl_checkpoint, hitl_reason)
SELECT
  t.id, s.step_number, s.step_code, s.step_name, s.description, s.step_type, s.duration, s.ai_score, s.service_layer, s.tool_name, s.is_hitl, s.hitl_reason
FROM workflow_tasks t
CROSS JOIN (VALUES
  (1, 'XFI001-S5-A4-T1-S1', 'Run automated checks', 'Execute pre-launch test suite', 'automated', 15, 95, 'L3_workflow', 'Test Suite', FALSE, NULL),
  (2, 'XFI001-S5-A4-T1-S2', 'Review test results', 'Analyze test outcomes', 'review', 15, 60, 'L1_expert', 'Test Dashboard', FALSE, NULL),
  (3, 'XFI001-S5-A4-T1-S3', 'Verify documentation', 'Confirm all docs are current', 'review', 15, 70, 'L1_expert', 'Doc Repository', FALSE, NULL),
  (4, 'XFI001-S5-A4-T1-S4', 'Go/No-Go Decision', 'Leadership approval to proceed', 'approval', 15, 20, 'L2_panel', 'Decision Meeting', TRUE, 'Go-live requires executive approval')
) AS s(step_number, step_code, step_name, description, step_type, duration, ai_score, service_layer, tool_name, is_hitl, hitl_reason)
WHERE t.task_code = 'XFI001-S5-A4-T1'
ON CONFLICT (step_code) DO UPDATE SET step_name = EXCLUDED.step_name;

-- ============================================================================
-- STEP 6: Create comprehensive WBS views
-- ============================================================================

CREATE OR REPLACE VIEW v_wbs_hierarchy AS
SELECT
  wt.code as workflow_code,
  wt.name as workflow_name,
  wt.work_mode,
  ws.stage_number as l2_number,
  ws.stage_name as l2_stage,
  wa.activity_number as l3_number,
  wa.activity_code as l3_code,
  wa.activity_name as l3_activity,
  t.task_number as l4_number,
  t.task_code as l4_code,
  t.task_name as l4_task,
  t.task_type,
  s.step_number as l5_number,
  s.step_code as l5_code,
  s.step_name as l5_step,
  s.step_type,
  s.service_layer,
  s.ai_automation_score,
  s.is_hitl_checkpoint,
  s.estimated_duration_minutes as step_duration_min
FROM workflow_templates wt
JOIN workflow_stages ws ON ws.template_id = wt.id
LEFT JOIN workflow_activities wa ON wa.stage_id = ws.id
LEFT JOIN workflow_tasks t ON t.activity_id = wa.id
LEFT JOIN workflow_steps s ON s.task_id = t.id
WHERE wt.code IN ('WF-MAI-001', 'WF-XFI-001')
ORDER BY wt.code, ws.stage_number, wa.activity_number, t.task_number, s.step_number;

CREATE OR REPLACE VIEW v_wbs_summary AS
SELECT
  wt.code as workflow_code,
  wt.name as workflow_name,
  wt.work_mode,
  COUNT(DISTINCT ws.id) as stages_l2,
  COUNT(DISTINCT wa.id) as activities_l3,
  COUNT(DISTINCT t.id) as tasks_l4,
  COUNT(DISTINCT s.id) as steps_l5,
  SUM(COALESCE(s.estimated_duration_minutes, 0)) as total_duration_min,
  ROUND(AVG(s.ai_automation_score)::numeric, 1) as avg_automation_score,
  SUM(CASE WHEN s.is_hitl_checkpoint THEN 1 ELSE 0 END) as hitl_checkpoints
FROM workflow_templates wt
LEFT JOIN workflow_stages ws ON ws.template_id = wt.id
LEFT JOIN workflow_activities wa ON wa.stage_id = ws.id
LEFT JOIN workflow_tasks t ON t.activity_id = wa.id
LEFT JOIN workflow_steps s ON s.task_id = t.id
WHERE wt.code IN ('WF-MAI-001', 'WF-XFI-001')
GROUP BY wt.code, wt.name, wt.work_mode
ORDER BY wt.code;

CREATE OR REPLACE VIEW v_wbs_service_layer_distribution AS
SELECT
  wt.code as workflow_code,
  wt.work_mode,
  s.service_layer,
  COUNT(*) as step_count,
  SUM(s.estimated_duration_minutes) as total_duration_min,
  ROUND(AVG(s.ai_automation_score)::numeric, 1) as avg_automation_score
FROM workflow_templates wt
JOIN workflow_stages ws ON ws.template_id = wt.id
JOIN workflow_activities wa ON wa.stage_id = ws.id
JOIN workflow_tasks t ON t.activity_id = wa.id
JOIN workflow_steps s ON s.task_id = t.id
WHERE wt.code IN ('WF-MAI-001', 'WF-XFI-001')
  AND s.service_layer IS NOT NULL
GROUP BY wt.code, wt.work_mode, s.service_layer
ORDER BY wt.code, s.service_layer;

CREATE OR REPLACE VIEW v_wbs_hitl_checkpoints AS
SELECT
  wt.code as workflow_code,
  wt.name as workflow_name,
  ws.stage_name,
  wa.activity_name,
  t.task_name,
  s.step_name,
  s.step_code,
  s.hitl_reason,
  s.service_layer,
  s.ai_automation_score
FROM workflow_templates wt
JOIN workflow_stages ws ON ws.template_id = wt.id
JOIN workflow_activities wa ON wa.stage_id = ws.id
JOIN workflow_tasks t ON t.activity_id = wa.id
JOIN workflow_steps s ON s.task_id = t.id
WHERE wt.code IN ('WF-MAI-001', 'WF-XFI-001')
  AND s.is_hitl_checkpoint = TRUE
ORDER BY wt.code, ws.stage_number, wa.activity_number, t.task_number, s.step_number;

-- ============================================================================
-- STEP 7: Create indexes for WBS queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_workflow_activities_stage ON workflow_activities(stage_id);
CREATE INDEX IF NOT EXISTS idx_workflow_activities_code ON workflow_activities(activity_code);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_activity ON workflow_tasks(activity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_task ON workflow_steps(task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_service_layer ON workflow_steps(service_layer);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_hitl ON workflow_steps(is_hitl_checkpoint) WHERE is_hitl_checkpoint = TRUE;

-- ============================================================================
-- Verification queries (run after migration)
-- ============================================================================
-- SELECT * FROM v_wbs_summary;
-- SELECT * FROM v_wbs_service_layer_distribution;
-- SELECT * FROM v_wbs_hitl_checkpoints;
-- SELECT * FROM v_wbs_hierarchy WHERE workflow_code = 'WF-MAI-001' LIMIT 50;
