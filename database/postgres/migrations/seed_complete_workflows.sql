-- ============================================================================
-- COMPLETE WORKFLOW SEEDING WITH ALL STAGES, TASKS, AGENTS & TOOLS
-- Run this after apply_workflow_tables.sql
-- ============================================================================

-- ============================================================================
-- JUNCTION TABLES FOR TASK-AGENT AND TASK-TOOL RELATIONSHIPS
-- ============================================================================

-- Task-Agent assignments
CREATE TABLE IF NOT EXISTS workflow_task_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  agent_id UUID,
  agent_name TEXT NOT NULL,
  agent_code TEXT,
  agent_role TEXT,
  assignment_type TEXT CHECK (assignment_type IN ('primary', 'secondary', 'reviewer', 'approver')) DEFAULT 'primary',
  execution_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, agent_name, assignment_type)
);

-- Task-Tool assignments
CREATE TABLE IF NOT EXISTS workflow_task_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  tool_id UUID,
  tool_name TEXT NOT NULL,
  tool_code TEXT,
  tool_category TEXT,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, tool_name)
);

-- Task-RAG source assignments
CREATE TABLE IF NOT EXISTS workflow_task_rag_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  rag_source_id UUID,
  source_name TEXT NOT NULL,
  source_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, source_name)
);

CREATE INDEX IF NOT EXISTS idx_workflow_task_agents_task ON workflow_task_agents(task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_task_tools_task ON workflow_task_tools(task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_task_rag_sources_task ON workflow_task_rag_sources(task_id);

-- RLS for junction tables
ALTER TABLE workflow_task_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_task_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_task_rag_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to workflow_task_agents" ON workflow_task_agents;
DROP POLICY IF EXISTS "Allow read access to workflow_task_tools" ON workflow_task_tools;
DROP POLICY IF EXISTS "Allow read access to workflow_task_rag_sources" ON workflow_task_rag_sources;

CREATE POLICY "Allow read access to workflow_task_agents" ON workflow_task_agents FOR SELECT USING (true);
CREATE POLICY "Allow read access to workflow_task_tools" ON workflow_task_tools FOR SELECT USING (true);
CREATE POLICY "Allow read access to workflow_task_rag_sources" ON workflow_task_rag_sources FOR SELECT USING (true);

GRANT SELECT ON workflow_task_agents TO authenticated, anon;
GRANT SELECT ON workflow_task_tools TO authenticated, anon;
GRANT SELECT ON workflow_task_rag_sources TO authenticated, anon;

-- ============================================================================
-- COMPLETE STAGES FOR WF-MAI-001 (KOL Engagement Analysis)
-- ============================================================================

-- Clear existing tasks first
DELETE FROM workflow_tasks WHERE stage_id IN (
  SELECT ws.id FROM workflow_stages ws 
  JOIN workflow_templates wt ON ws.template_id = wt.id 
  WHERE wt.code = 'WF-MAI-001'
);

-- Stage 1 Tasks: Data Collection & Preparation
INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 'MAI001-S1-T1', 'Extract CRM Interaction Data', 'Pull all KOL interaction records from Veeva CRM for the analysis period', 'automated', 15),
  (2, 'MAI001-S1-T2', 'Retrieve HCP Profile Information', 'Extract HCP demographics, specialty, and institutional affiliations', 'automated', 10),
  (3, 'MAI001-S1-T3', 'Process MSL Meeting Notes', 'Parse and categorize meeting notes using NLP extraction', 'automated', 20),
  (4, 'MAI001-S1-T4', 'Aggregate Publication Data', 'Collect publication history and citation metrics for KOLs', 'automated', 15),
  (5, 'MAI001-S1-T5', 'Validate Data Completeness', 'Review data quality and flag missing or inconsistent records', 'review', 30),
  (6, 'MAI001-S1-T6', 'Data Cleansing & Normalization', 'Standardize data formats and resolve duplicates', 'automated', 20)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-MAI-001' AND ws.stage_number = 1
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, description = EXCLUDED.description;

-- Stage 2 Tasks: Engagement Analysis
INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 'MAI001-S2-T1', 'Calculate Engagement Frequency Metrics', 'Compute interaction frequency, recency, and consistency scores', 'automated', 20),
  (2, 'MAI001-S2-T2', 'Analyze Interaction Quality', 'Assess depth and quality of engagements using sentiment analysis', 'automated', 25),
  (3, 'MAI001-S2-T3', 'Map Influence Networks', 'Identify KOL relationships and referral patterns', 'automated', 30),
  (4, 'MAI001-S2-T4', 'Benchmark Against Territory Goals', 'Compare engagement metrics against MSL territory objectives', 'manual', 45),
  (5, 'MAI001-S2-T5', 'Identify Engagement Gaps', 'Detect under-engaged high-value KOLs and opportunities', 'automated', 20),
  (6, 'MAI001-S2-T6', 'Segment KOLs by Engagement Level', 'Categorize KOLs into engagement tiers for prioritization', 'automated', 15)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-MAI-001' AND ws.stage_number = 2
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, description = EXCLUDED.description;

-- Stage 3 Tasks: Insight Generation
INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 'MAI001-S3-T1', 'Generate Engagement Trend Analysis', 'Create time-series analysis of engagement patterns', 'automated', 20),
  (2, 'MAI001-S3-T2', 'Identify Success Patterns', 'Analyze characteristics of high-performing KOL relationships', 'automated', 25),
  (3, 'MAI001-S3-T3', 'Extract Key Themes from Interactions', 'Identify recurring topics and areas of interest', 'automated', 20),
  (4, 'MAI001-S3-T4', 'Predict Engagement Trajectory', 'Forecast future engagement levels using ML models', 'automated', 30),
  (5, 'MAI001-S3-T5', 'Generate Strategic Recommendations', 'Create AI-powered recommendations for engagement optimization', 'automated', 25),
  (6, 'MAI001-S3-T6', 'Expert Review of Insights', 'Medical Affairs expert validates AI-generated insights', 'review', 45)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-MAI-001' AND ws.stage_number = 3
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, description = EXCLUDED.description;

-- Stage 4 Tasks: Report & Recommendations
INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 'MAI001-S4-T1', 'Generate Executive Summary', 'Create high-level summary for leadership review', 'automated', 15),
  (2, 'MAI001-S4-T2', 'Build Interactive Dashboard', 'Create visualization dashboard with key metrics', 'automated', 20),
  (3, 'MAI001-S4-T3', 'Compile Detailed Analysis Report', 'Generate comprehensive report with methodology and findings', 'automated', 25),
  (4, 'MAI001-S4-T4', 'Create MSL Action Plans', 'Generate personalized action items for each MSL territory', 'manual', 40),
  (5, 'MAI001-S4-T5', 'Quality Assurance Review', 'Final review of all deliverables for accuracy', 'review', 30),
  (6, 'MAI001-S4-T6', 'Stakeholder Presentation Prep', 'Prepare presentation materials for stakeholder meeting', 'manual', 30)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-MAI-001' AND ws.stage_number = 4
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, description = EXCLUDED.description;

-- ============================================================================
-- COMPLETE STAGES FOR WF-DH-001 (Digital Therapeutics Clinical Validation)
-- ============================================================================

-- Clear existing tasks first
DELETE FROM workflow_tasks WHERE stage_id IN (
  SELECT ws.id FROM workflow_stages ws 
  JOIN workflow_templates wt ON ws.template_id = wt.id 
  WHERE wt.code = 'WF-DH-001'
);

-- Stage 1 Tasks: Clinical Evidence Planning
INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 'DH001-S1-T1', 'Define Clinical Objectives', 'Establish primary and secondary clinical objectives aligned with DTx mechanism', 'manual', 120),
  (2, 'DH001-S1-T2', 'Systematic Literature Review', 'Conduct comprehensive review of existing evidence for similar DTx interventions', 'automated', 180),
  (3, 'DH001-S1-T3', 'Competitive Landscape Analysis', 'Analyze clinical evidence strategies of competitor DTx products', 'automated', 90),
  (4, 'DH001-S1-T4', 'Endpoint Selection & Justification', 'Select and document rationale for primary and secondary endpoints', 'review', 120),
  (5, 'DH001-S1-T5', 'Sample Size Calculation', 'Perform power analysis and determine required sample size', 'automated', 60),
  (6, 'DH001-S1-T6', 'Study Design Framework', 'Draft initial RCT design including randomization and blinding strategy', 'manual', 180),
  (7, 'DH001-S1-T7', 'Regulatory Pre-Assessment', 'Review FDA/EMA guidance for DTx clinical requirements', 'manual', 120),
  (8, 'DH001-S1-T8', 'Evidence Strategy Approval', 'Obtain stakeholder approval for clinical evidence strategy', 'approval', 60)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-DH-001' AND ws.stage_number = 1
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, description = EXCLUDED.description;

-- Stage 2 Tasks: Study Protocol Development
INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 'DH001-S2-T1', 'Draft Protocol Document', 'Create comprehensive clinical protocol following ICH-GCP guidelines', 'manual', 480),
  (2, 'DH001-S2-T2', 'Define Inclusion/Exclusion Criteria', 'Establish patient eligibility criteria with clinical rationale', 'manual', 120),
  (3, 'DH001-S2-T3', 'Design Digital Intervention Schedule', 'Define DTx dosing, frequency, and engagement requirements', 'manual', 180),
  (4, 'DH001-S2-T4', 'Develop Statistical Analysis Plan', 'Create detailed SAP including primary and sensitivity analyses', 'manual', 240),
  (5, 'DH001-S2-T5', 'Create eCRF Specifications', 'Design electronic case report forms for data capture', 'manual', 180),
  (6, 'DH001-S2-T6', 'Protocol Medical Review', 'Internal medical review of protocol by clinical experts', 'review', 120),
  (7, 'DH001-S2-T7', 'IRB/Ethics Submission Package', 'Prepare complete submission package for ethics committee', 'manual', 240),
  (8, 'DH001-S2-T8', 'Site Feasibility Assessment', 'Evaluate potential clinical sites for study conduct', 'manual', 180),
  (9, 'DH001-S2-T9', 'Protocol Finalization', 'Incorporate feedback and finalize protocol version 1.0', 'review', 120),
  (10, 'DH001-S2-T10', 'IRB Approval Tracking', 'Monitor and manage IRB review process to approval', 'manual', 60)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-DH-001' AND ws.stage_number = 2
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, description = EXCLUDED.description;

-- Stage 3 Tasks: Clinical Data Collection
INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 'DH001-S3-T1', 'Site Initiation & Training', 'Conduct site initiation visits and train study staff', 'manual', 480),
  (2, 'DH001-S3-T2', 'Patient Recruitment Monitoring', 'Track enrollment progress and implement recruitment strategies', 'manual', 120),
  (3, 'DH001-S3-T3', 'DTx Platform Deployment', 'Deploy and configure digital therapeutic platform for study', 'automated', 180),
  (4, 'DH001-S3-T4', 'Real-time Data Quality Monitoring', 'Monitor incoming data for quality and completeness', 'automated', 60),
  (5, 'DH001-S3-T5', 'Engagement & Adherence Tracking', 'Monitor patient engagement with DTx intervention', 'automated', 45),
  (6, 'DH001-S3-T6', 'Safety Signal Detection', 'Automated monitoring for adverse events and safety signals', 'automated', 30),
  (7, 'DH001-S3-T7', 'Data Query Management', 'Resolve data queries and discrepancies with sites', 'manual', 120),
  (8, 'DH001-S3-T8', 'Interim Analysis Preparation', 'Prepare data for planned interim analysis', 'manual', 180),
  (9, 'DH001-S3-T9', 'Database Lock Preparation', 'Complete data cleaning and prepare for database lock', 'manual', 240)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-DH-001' AND ws.stage_number = 3
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, description = EXCLUDED.description;

-- Stage 4 Tasks: Analysis & Reporting
INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 'DH001-S4-T1', 'Execute Statistical Analysis', 'Run primary and secondary analyses per SAP', 'automated', 240),
  (2, 'DH001-S4-T2', 'Generate Analysis Tables & Figures', 'Create TLFs for clinical study report', 'automated', 180),
  (3, 'DH001-S4-T3', 'Interpret Clinical Results', 'Medical interpretation of statistical findings', 'manual', 240),
  (4, 'DH001-S4-T4', 'Draft Clinical Study Report', 'Write comprehensive CSR following ICH E3 guidelines', 'manual', 480),
  (5, 'DH001-S4-T5', 'Medical Writing Review', 'Expert review of CSR for accuracy and completeness', 'review', 180),
  (6, 'DH001-S4-T6', 'Prepare Publication Manuscript', 'Draft peer-reviewed publication of study results', 'manual', 360),
  (7, 'DH001-S4-T7', 'Create Regulatory Summary', 'Prepare clinical summary for regulatory submission', 'manual', 240),
  (8, 'DH001-S4-T8', 'Final Report Approval', 'Obtain sign-off on final clinical study report', 'approval', 60)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-DH-001' AND ws.stage_number = 4
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, description = EXCLUDED.description;

-- Stage 5 Tasks: Regulatory Alignment
INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 'DH001-S5-T1', 'Compile Regulatory Dossier', 'Assemble clinical evidence package for submission', 'manual', 360),
  (2, 'DH001-S5-T2', 'Pre-Submission Meeting Request', 'Prepare and submit pre-submission meeting request to FDA', 'manual', 180),
  (3, 'DH001-S5-T3', 'Prepare Meeting Briefing Document', 'Create comprehensive briefing document for FDA meeting', 'manual', 300),
  (4, 'DH001-S5-T4', 'Conduct Pre-Submission Meeting', 'Participate in FDA pre-submission meeting', 'manual', 120),
  (5, 'DH001-S5-T5', 'Incorporate FDA Feedback', 'Address FDA feedback and update submission strategy', 'manual', 240),
  (6, 'DH001-S5-T6', 'Final Submission Package Review', 'QC review of complete regulatory submission package', 'review', 180),
  (7, 'DH001-S5-T7', 'Regulatory Submission', 'Submit clinical evidence package to regulatory authority', 'manual', 60)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-DH-001' AND ws.stage_number = 5
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, description = EXCLUDED.description;

-- ============================================================================
-- ASSIGN AGENTS TO TASKS
-- ============================================================================

-- WF-MAI-001 Task Agents
INSERT INTO workflow_task_agents (task_id, agent_name, agent_code, agent_role, assignment_type, execution_order)
SELECT wt.id, a.agent_name, a.agent_code, a.agent_role, a.assignment_type, a.execution_order
FROM workflow_tasks wt
CROSS JOIN (VALUES
  -- Stage 1 agents
  ('MAI001-S1-T1', 'Data Integration Specialist', 'AGT-DIS', 'Extracts and integrates CRM data', 'primary', 1),
  ('MAI001-S1-T1', 'Quality Assurance Agent', 'AGT-QA', 'Validates data extraction accuracy', 'reviewer', 2),
  ('MAI001-S1-T2', 'HCP Data Analyst', 'AGT-HDA', 'Processes HCP profile information', 'primary', 1),
  ('MAI001-S1-T3', 'NLP Processing Agent', 'AGT-NLP', 'Extracts insights from meeting notes', 'primary', 1),
  ('MAI001-S1-T3', 'Medical Affairs Expert', 'AGT-MAE', 'Reviews NLP extraction quality', 'reviewer', 2),
  ('MAI001-S1-T4', 'Publication Analytics Agent', 'AGT-PUB', 'Aggregates publication metrics', 'primary', 1),
  ('MAI001-S1-T5', 'Data Quality Manager', 'AGT-DQM', 'Validates data completeness', 'primary', 1),
  ('MAI001-S1-T6', 'Data Engineer', 'AGT-DE', 'Cleanses and normalizes data', 'primary', 1),
  -- Stage 2 agents
  ('MAI001-S2-T1', 'Engagement Analytics Agent', 'AGT-ENG', 'Calculates engagement metrics', 'primary', 1),
  ('MAI001-S2-T2', 'Sentiment Analysis Agent', 'AGT-SENT', 'Analyzes interaction quality', 'primary', 1),
  ('MAI001-S2-T3', 'Network Analysis Agent', 'AGT-NET', 'Maps influence networks', 'primary', 1),
  ('MAI001-S2-T4', 'MSL Strategy Consultant', 'AGT-MSL', 'Benchmarks against goals', 'primary', 1),
  ('MAI001-S2-T5', 'Gap Analysis Agent', 'AGT-GAP', 'Identifies engagement gaps', 'primary', 1),
  ('MAI001-S2-T6', 'Segmentation Agent', 'AGT-SEG', 'Segments KOLs by engagement', 'primary', 1),
  -- Stage 3 agents
  ('MAI001-S3-T1', 'Trend Analysis Agent', 'AGT-TRD', 'Generates trend analysis', 'primary', 1),
  ('MAI001-S3-T2', 'Pattern Recognition Agent', 'AGT-PAT', 'Identifies success patterns', 'primary', 1),
  ('MAI001-S3-T3', 'Theme Extraction Agent', 'AGT-THM', 'Extracts key themes', 'primary', 1),
  ('MAI001-S3-T4', 'Predictive Analytics Agent', 'AGT-PRED', 'Forecasts engagement trajectory', 'primary', 1),
  ('MAI001-S3-T5', 'Strategy Recommendation Agent', 'AGT-STRAT', 'Generates recommendations', 'primary', 1),
  ('MAI001-S3-T6', 'Medical Affairs Director', 'AGT-MAD', 'Validates AI insights', 'reviewer', 1),
  -- Stage 4 agents
  ('MAI001-S4-T1', 'Executive Summary Agent', 'AGT-EXEC', 'Creates executive summaries', 'primary', 1),
  ('MAI001-S4-T2', 'Dashboard Builder Agent', 'AGT-DASH', 'Creates interactive dashboards', 'primary', 1),
  ('MAI001-S4-T3', 'Report Generation Agent', 'AGT-RPT', 'Compiles detailed reports', 'primary', 1),
  ('MAI001-S4-T4', 'MSL Action Planner', 'AGT-ACT', 'Creates MSL action plans', 'primary', 1),
  ('MAI001-S4-T5', 'Quality Review Agent', 'AGT-QR', 'Reviews deliverable quality', 'reviewer', 1),
  ('MAI001-S4-T6', 'Presentation Agent', 'AGT-PRES', 'Prepares presentations', 'primary', 1)
) AS a(task_code, agent_name, agent_code, agent_role, assignment_type, execution_order)
WHERE wt.task_code = a.task_code
ON CONFLICT (task_id, agent_name, assignment_type) DO UPDATE SET agent_role = EXCLUDED.agent_role;

-- WF-DH-001 Task Agents
INSERT INTO workflow_task_agents (task_id, agent_name, agent_code, agent_role, assignment_type, execution_order)
SELECT wt.id, a.agent_name, a.agent_code, a.agent_role, a.assignment_type, a.execution_order
FROM workflow_tasks wt
CROSS JOIN (VALUES
  -- Stage 1 agents
  ('DH001-S1-T1', 'Clinical Strategy Expert', 'AGT-CSE', 'Defines clinical objectives', 'primary', 1),
  ('DH001-S1-T2', 'Literature Review Agent', 'AGT-LIT', 'Conducts systematic reviews', 'primary', 1),
  ('DH001-S1-T2', 'Medical Librarian Agent', 'AGT-LIB', 'Supports literature search', 'secondary', 2),
  ('DH001-S1-T3', 'Competitive Intelligence Agent', 'AGT-CI', 'Analyzes competitive landscape', 'primary', 1),
  ('DH001-S1-T4', 'Biostatistician', 'AGT-STAT', 'Selects and justifies endpoints', 'primary', 1),
  ('DH001-S1-T4', 'Clinical Expert', 'AGT-CLIN', 'Provides clinical input on endpoints', 'reviewer', 2),
  ('DH001-S1-T5', 'Statistical Power Agent', 'AGT-PWR', 'Calculates sample size', 'primary', 1),
  ('DH001-S1-T6', 'Study Design Expert', 'AGT-SDE', 'Drafts study design', 'primary', 1),
  ('DH001-S1-T7', 'Regulatory Intelligence Agent', 'AGT-REG', 'Reviews regulatory guidance', 'primary', 1),
  ('DH001-S1-T8', 'Clinical Program Director', 'AGT-CPD', 'Approves evidence strategy', 'approver', 1),
  -- Stage 2 agents
  ('DH001-S2-T1', 'Protocol Writer', 'AGT-PW', 'Drafts clinical protocol', 'primary', 1),
  ('DH001-S2-T2', 'Eligibility Criteria Expert', 'AGT-ECE', 'Defines patient criteria', 'primary', 1),
  ('DH001-S2-T3', 'DTx Clinical Specialist', 'AGT-DTX', 'Designs intervention schedule', 'primary', 1),
  ('DH001-S2-T4', 'Senior Biostatistician', 'AGT-SSTAT', 'Creates statistical analysis plan', 'primary', 1),
  ('DH001-S2-T5', 'eCRF Designer', 'AGT-CRF', 'Designs electronic forms', 'primary', 1),
  ('DH001-S2-T6', 'Medical Monitor', 'AGT-MM', 'Reviews protocol medically', 'reviewer', 1),
  ('DH001-S2-T7', 'Regulatory Submission Agent', 'AGT-RSA', 'Prepares IRB package', 'primary', 1),
  ('DH001-S2-T8', 'Site Feasibility Agent', 'AGT-SFA', 'Assesses clinical sites', 'primary', 1),
  ('DH001-S2-T9', 'Protocol Finalization Agent', 'AGT-PFA', 'Finalizes protocol', 'primary', 1),
  ('DH001-S2-T10', 'IRB Tracking Agent', 'AGT-IRB', 'Tracks IRB approval', 'primary', 1),
  -- Stage 3 agents
  ('DH001-S3-T1', 'Site Training Coordinator', 'AGT-STC', 'Conducts site training', 'primary', 1),
  ('DH001-S3-T2', 'Recruitment Monitor', 'AGT-REC', 'Monitors enrollment', 'primary', 1),
  ('DH001-S3-T3', 'Platform Deployment Agent', 'AGT-PDA', 'Deploys DTx platform', 'primary', 1),
  ('DH001-S3-T4', 'Data Quality Monitor', 'AGT-DQM', 'Monitors data quality', 'primary', 1),
  ('DH001-S3-T5', 'Adherence Tracking Agent', 'AGT-ATA', 'Tracks patient engagement', 'primary', 1),
  ('DH001-S3-T6', 'Safety Monitoring Agent', 'AGT-SMA', 'Detects safety signals', 'primary', 1),
  ('DH001-S3-T7', 'Query Resolution Agent', 'AGT-QRA', 'Manages data queries', 'primary', 1),
  ('DH001-S3-T8', 'Interim Analysis Agent', 'AGT-IAA', 'Prepares interim analysis', 'primary', 1),
  ('DH001-S3-T9', 'Database Lock Agent', 'AGT-DLA', 'Prepares database lock', 'primary', 1),
  -- Stage 4 agents
  ('DH001-S4-T1', 'Statistical Programmer', 'AGT-SP', 'Executes statistical analysis', 'primary', 1),
  ('DH001-S4-T2', 'TLF Generator', 'AGT-TLF', 'Generates tables and figures', 'primary', 1),
  ('DH001-S4-T3', 'Clinical Interpretation Expert', 'AGT-CIE', 'Interprets clinical results', 'primary', 1),
  ('DH001-S4-T4', 'CSR Writer', 'AGT-CSR', 'Drafts clinical study report', 'primary', 1),
  ('DH001-S4-T5', 'Medical Writer Reviewer', 'AGT-MWR', 'Reviews CSR', 'reviewer', 1),
  ('DH001-S4-T6', 'Publication Writer', 'AGT-PUBW', 'Drafts publication manuscript', 'primary', 1),
  ('DH001-S4-T7', 'Regulatory Summary Writer', 'AGT-RSW', 'Prepares regulatory summary', 'primary', 1),
  ('DH001-S4-T8', 'Clinical Program Lead', 'AGT-CPL', 'Approves final CSR', 'approver', 1),
  -- Stage 5 agents
  ('DH001-S5-T1', 'Regulatory Dossier Compiler', 'AGT-RDC', 'Compiles regulatory dossier', 'primary', 1),
  ('DH001-S5-T2', 'FDA Meeting Coordinator', 'AGT-FMC', 'Prepares meeting request', 'primary', 1),
  ('DH001-S5-T3', 'Briefing Document Writer', 'AGT-BDW', 'Creates briefing document', 'primary', 1),
  ('DH001-S5-T4', 'Regulatory Affairs Lead', 'AGT-RAL', 'Conducts FDA meeting', 'primary', 1),
  ('DH001-S5-T5', 'Feedback Integration Agent', 'AGT-FIA', 'Incorporates FDA feedback', 'primary', 1),
  ('DH001-S5-T6', 'Submission QC Agent', 'AGT-SQC', 'Reviews submission package', 'reviewer', 1),
  ('DH001-S5-T7', 'Regulatory Submission Lead', 'AGT-RSL', 'Submits to FDA', 'primary', 1)
) AS a(task_code, agent_name, agent_code, agent_role, assignment_type, execution_order)
WHERE wt.task_code = a.task_code
ON CONFLICT (task_id, agent_name, assignment_type) DO UPDATE SET agent_role = EXCLUDED.agent_role;

-- ============================================================================
-- ASSIGN TOOLS TO TASKS
-- ============================================================================

-- WF-MAI-001 Task Tools
INSERT INTO workflow_task_tools (task_id, tool_name, tool_code, tool_category, is_required)
SELECT wt.id, t.tool_name, t.tool_code, t.tool_category, t.is_required
FROM workflow_tasks wt
CROSS JOIN (VALUES
  ('MAI001-S1-T1', 'Veeva CRM Connector', 'TOOL-VEEVA', 'data_integration', true),
  ('MAI001-S1-T1', 'Data Extraction API', 'TOOL-DEXT', 'data_integration', true),
  ('MAI001-S1-T2', 'HCP Database Query', 'TOOL-HCPQ', 'data_retrieval', true),
  ('MAI001-S1-T3', 'NLP Text Processor', 'TOOL-NLP', 'text_analysis', true),
  ('MAI001-S1-T3', 'Meeting Notes Parser', 'TOOL-MNP', 'text_analysis', true),
  ('MAI001-S1-T4', 'PubMed API', 'TOOL-PUBMED', 'literature_search', true),
  ('MAI001-S1-T4', 'Citation Analyzer', 'TOOL-CITE', 'analytics', true),
  ('MAI001-S1-T5', 'Data Validation Suite', 'TOOL-DVS', 'quality_assurance', true),
  ('MAI001-S1-T6', 'Data Cleansing Tool', 'TOOL-DCT', 'data_processing', true),
  ('MAI001-S2-T1', 'Engagement Calculator', 'TOOL-ENGC', 'analytics', true),
  ('MAI001-S2-T2', 'Sentiment Analyzer', 'TOOL-SENT', 'text_analysis', true),
  ('MAI001-S2-T3', 'Network Mapping Tool', 'TOOL-NET', 'visualization', true),
  ('MAI001-S2-T4', 'Territory Analytics', 'TOOL-TERR', 'analytics', true),
  ('MAI001-S2-T5', 'Gap Analysis Engine', 'TOOL-GAP', 'analytics', true),
  ('MAI001-S2-T6', 'Clustering Algorithm', 'TOOL-CLUST', 'machine_learning', true),
  ('MAI001-S3-T1', 'Time Series Analyzer', 'TOOL-TSA', 'analytics', true),
  ('MAI001-S3-T2', 'Pattern Recognition ML', 'TOOL-PRML', 'machine_learning', true),
  ('MAI001-S3-T3', 'Topic Modeling Tool', 'TOOL-TOPIC', 'text_analysis', true),
  ('MAI001-S3-T4', 'Predictive Model Engine', 'TOOL-PRED', 'machine_learning', true),
  ('MAI001-S3-T5', 'Recommendation Engine', 'TOOL-REC', 'machine_learning', true),
  ('MAI001-S4-T1', 'Executive Summary Generator', 'TOOL-EXEC', 'document_generation', true),
  ('MAI001-S4-T2', 'Dashboard Builder', 'TOOL-DASH', 'visualization', true),
  ('MAI001-S4-T3', 'Report Generator', 'TOOL-RPT', 'document_generation', true),
  ('MAI001-S4-T4', 'Action Plan Template', 'TOOL-APT', 'planning', true),
  ('MAI001-S4-T6', 'Presentation Builder', 'TOOL-PRES', 'document_generation', true)
) AS t(task_code, tool_name, tool_code, tool_category, is_required)
WHERE wt.task_code = t.task_code
ON CONFLICT (task_id, tool_name) DO UPDATE SET tool_category = EXCLUDED.tool_category;

-- WF-DH-001 Task Tools
INSERT INTO workflow_task_tools (task_id, tool_name, tool_code, tool_category, is_required)
SELECT wt.id, t.tool_name, t.tool_code, t.tool_category, t.is_required
FROM workflow_tasks wt
CROSS JOIN (VALUES
  ('DH001-S1-T2', 'PubMed Search API', 'TOOL-PUBMED', 'literature_search', true),
  ('DH001-S1-T2', 'Cochrane Library API', 'TOOL-COCH', 'literature_search', true),
  ('DH001-S1-T2', 'PRISMA Flow Generator', 'TOOL-PRISMA', 'document_generation', true),
  ('DH001-S1-T3', 'Competitive Intelligence DB', 'TOOL-CIDB', 'data_retrieval', true),
  ('DH001-S1-T3', 'ClinicalTrials.gov API', 'TOOL-CTG', 'data_retrieval', true),
  ('DH001-S1-T5', 'Power Calculator', 'TOOL-PWR', 'statistics', true),
  ('DH001-S1-T5', 'Sample Size Estimator', 'TOOL-SSE', 'statistics', true),
  ('DH001-S1-T7', 'FDA Guidance Database', 'TOOL-FDAG', 'regulatory', true),
  ('DH001-S2-T1', 'Protocol Template Generator', 'TOOL-PTG', 'document_generation', true),
  ('DH001-S2-T1', 'ICH-GCP Checker', 'TOOL-GCP', 'compliance', true),
  ('DH001-S2-T4', 'SAP Template Builder', 'TOOL-SAP', 'document_generation', true),
  ('DH001-S2-T4', 'Statistical Software (SAS)', 'TOOL-SAS', 'statistics', true),
  ('DH001-S2-T5', 'eCRF Designer Tool', 'TOOL-ECRF', 'data_capture', true),
  ('DH001-S2-T7', 'IRB Submission Portal', 'TOOL-IRB', 'regulatory', true),
  ('DH001-S2-T8', 'Site Feasibility Survey', 'TOOL-SFS', 'assessment', true),
  ('DH001-S3-T3', 'DTx Platform SDK', 'TOOL-SDK', 'software', true),
  ('DH001-S3-T4', 'Real-time Data Monitor', 'TOOL-RTM', 'monitoring', true),
  ('DH001-S3-T5', 'Engagement Analytics', 'TOOL-ENG', 'analytics', true),
  ('DH001-S3-T6', 'Safety Signal Detector', 'TOOL-SSD', 'safety', true),
  ('DH001-S3-T7', 'Query Management System', 'TOOL-QMS', 'data_management', true),
  ('DH001-S4-T1', 'SAS Statistical Suite', 'TOOL-SAS', 'statistics', true),
  ('DH001-S4-T1', 'R Statistical Package', 'TOOL-R', 'statistics', false),
  ('DH001-S4-T2', 'TLF Generator', 'TOOL-TLF', 'document_generation', true),
  ('DH001-S4-T4', 'CSR Template (ICH E3)', 'TOOL-E3', 'document_generation', true),
  ('DH001-S4-T6', 'Manuscript Template', 'TOOL-MST', 'document_generation', true),
  ('DH001-S5-T1', 'eCTD Builder', 'TOOL-ECTD', 'regulatory', true),
  ('DH001-S5-T2', 'FDA Meeting Request Portal', 'TOOL-FDAMR', 'regulatory', true),
  ('DH001-S5-T3', 'Briefing Document Template', 'TOOL-BDT', 'document_generation', true),
  ('DH001-S5-T7', 'FDA ESG Submission Gateway', 'TOOL-ESG', 'regulatory', true)
) AS t(task_code, tool_name, tool_code, tool_category, is_required)
WHERE wt.task_code = t.task_code
ON CONFLICT (task_id, tool_name) DO UPDATE SET tool_category = EXCLUDED.tool_category;

-- ============================================================================
-- ASSIGN RAG SOURCES TO TASKS
-- ============================================================================

-- WF-MAI-001 RAG Sources
INSERT INTO workflow_task_rag_sources (task_id, source_name, source_type, description)
SELECT wt.id, r.source_name, r.source_type, r.description
FROM workflow_tasks wt
CROSS JOIN (VALUES
  ('MAI001-S1-T2', 'HCP Master Database', 'database', 'Comprehensive HCP profile and affiliation data'),
  ('MAI001-S1-T3', 'MSL Meeting Archive', 'document_store', 'Historical MSL meeting notes and summaries'),
  ('MAI001-S1-T4', 'PubMed Knowledge Base', 'api', 'Biomedical literature database'),
  ('MAI001-S2-T3', 'KOL Network Graph', 'graph_db', 'KOL relationship and influence network data'),
  ('MAI001-S2-T4', 'Territory Performance Data', 'database', 'MSL territory goals and metrics'),
  ('MAI001-S3-T2', 'Best Practices Repository', 'document_store', 'KOL engagement best practices and case studies'),
  ('MAI001-S3-T3', 'Therapeutic Area Insights', 'knowledge_base', 'TA-specific engagement strategies'),
  ('MAI001-S4-T3', 'Report Templates Library', 'document_store', 'Standard report templates and examples')
) AS r(task_code, source_name, source_type, description)
WHERE wt.task_code = r.task_code
ON CONFLICT (task_id, source_name) DO UPDATE SET description = EXCLUDED.description;

-- WF-DH-001 RAG Sources
INSERT INTO workflow_task_rag_sources (task_id, source_name, source_type, description)
SELECT wt.id, r.source_name, r.source_type, r.description
FROM workflow_tasks wt
CROSS JOIN (VALUES
  ('DH001-S1-T2', 'DTx Clinical Evidence Library', 'document_store', 'Published DTx clinical studies and outcomes'),
  ('DH001-S1-T2', 'Systematic Review Database', 'database', 'Meta-analyses and systematic reviews'),
  ('DH001-S1-T3', 'Competitive DTx Pipeline', 'database', 'DTx competitor clinical development data'),
  ('DH001-S1-T7', 'FDA DTx Guidance Archive', 'document_store', 'FDA guidance documents for digital therapeutics'),
  ('DH001-S2-T1', 'ICH Guidelines Repository', 'document_store', 'ICH E6, E8, E9 guidelines'),
  ('DH001-S2-T1', 'Protocol Examples Library', 'document_store', 'Approved DTx clinical protocols'),
  ('DH001-S2-T4', 'SAP Examples Database', 'document_store', 'Statistical analysis plan templates'),
  ('DH001-S3-T6', 'Adverse Event Database', 'database', 'Historical AE data for similar interventions'),
  ('DH001-S4-T4', 'CSR Template Library', 'document_store', 'ICH E3 compliant CSR templates'),
  ('DH001-S4-T6', 'Publication Guidelines', 'document_store', 'CONSORT and journal submission guidelines'),
  ('DH001-S5-T1', 'eCTD Module Templates', 'document_store', 'eCTD structure and content templates'),
  ('DH001-S5-T3', 'FDA Meeting Minutes Archive', 'document_store', 'Historical FDA meeting outcomes')
) AS r(task_code, source_name, source_type, description)
WHERE wt.task_code = r.task_code
ON CONFLICT (task_id, source_name) DO UPDATE SET description = EXCLUDED.description;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'workflow_templates' as table_name, COUNT(*) as count FROM workflow_templates
UNION ALL
SELECT 'workflow_stages', COUNT(*) FROM workflow_stages
UNION ALL
SELECT 'workflow_tasks', COUNT(*) FROM workflow_tasks
UNION ALL
SELECT 'workflow_task_agents', COUNT(*) FROM workflow_task_agents
UNION ALL
SELECT 'workflow_task_tools', COUNT(*) FROM workflow_task_tools
UNION ALL
SELECT 'workflow_task_rag_sources', COUNT(*) FROM workflow_task_rag_sources;

-- Show task counts by workflow
SELECT 
  wt.code as workflow_code,
  wt.name as workflow_name,
  COUNT(DISTINCT ws.id) as stages,
  COUNT(DISTINCT wtask.id) as tasks,
  COUNT(DISTINCT wta.id) as agent_assignments,
  COUNT(DISTINCT wtt.id) as tool_assignments
FROM workflow_templates wt
LEFT JOIN workflow_stages ws ON ws.template_id = wt.id
LEFT JOIN workflow_tasks wtask ON wtask.stage_id = ws.id
LEFT JOIN workflow_task_agents wta ON wta.task_id = wtask.id
LEFT JOIN workflow_task_tools wtt ON wtt.task_id = wtask.id
GROUP BY wt.id, wt.code, wt.name
ORDER BY wt.code;



