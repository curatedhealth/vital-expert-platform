-- =====================================================================================
-- 15_cd_010_protocol_development_part2.sql
-- UC_CD_010: Clinical Trial Protocol Development - Part 2: Assignments
-- =====================================================================================
-- Purpose: Seed task dependencies, agent assignments, persona assignments, tool mappings, and RAG sources
-- Dependencies: Part 1 must be run first (workflows and tasks must exist)
-- Execution Order: 15b (immediately after part 1)
-- =====================================================================================

-- =====================================================================================
-- SECTION 0: SESSION CONFIGURATION
-- =====================================================================================

CREATE TEMP TABLE IF NOT EXISTS session_config (
  tenant_id UUID,
  tenant_slug TEXT
);

DELETE FROM session_config;

INSERT INTO session_config (tenant_id, tenant_slug)
SELECT id, slug 
FROM tenants 
WHERE slug = 'digital-health-startup';

-- =====================================================================================
-- SECTION 1: TASK DEPENDENCIES
-- =====================================================================================

INSERT INTO dh_task_dependency (
  tenant_id,
  task_id,
  depends_on_task_id,
  note
)
SELECT 
  sc.tenant_id,
  t.id as task_id,
  dt.id as depends_on_task_id,
  dep_data.note
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Sequential flow
    ('TSK-CD-010-02', 'TSK-CD-010-01', 'Trial design requires objectives and endpoints'),
    ('TSK-CD-010-03', 'TSK-CD-010-02', 'Core sections require design structure'),
    ('TSK-CD-010-03', 'TSK-CD-010-01', 'Core sections include objectives and endpoints'),
    ('TSK-CD-010-04', 'TSK-CD-010-01', 'SAP requires endpoint definitions'),
    ('TSK-CD-010-04', 'TSK-CD-010-02', 'SAP aligns with trial design'),
    ('TSK-CD-010-05', 'TSK-CD-010-02', 'Safety plan aligns with visit schedule'),
    ('TSK-CD-010-06', 'TSK-CD-010-03', 'Feasibility assessment requires protocol draft'),
    ('TSK-CD-010-07', 'TSK-CD-010-03', 'Internal review requires complete draft'),
    ('TSK-CD-010-07', 'TSK-CD-010-04', 'Internal review includes SAP'),
    ('TSK-CD-010-07', 'TSK-CD-010-05', 'Internal review includes safety plan'),
    ('TSK-CD-010-07', 'TSK-CD-010-06', 'Internal review includes feasibility'),
    ('TSK-CD-010-08', 'TSK-CD-010-07', 'Finalization requires review completion')
) AS dep_data(task_code, depends_on_code, note)
INNER JOIN dh_task t ON t.code = dep_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_task dt ON dt.code = dep_data.depends_on_code AND dt.tenant_id = sc.tenant_id
ON CONFLICT (task_id, depends_on_task_id)
DO UPDATE SET
  note = EXCLUDED.note;

-- =====================================================================================
-- SECTION 2: AGENT ASSIGNMENTS
-- =====================================================================================

INSERT INTO dh_task_agent (
  tenant_id,
  task_id,
  agent_id,
  assignment_type,
  execution_order,
  requires_human_approval,
  max_retries,
  retry_strategy,
  is_parallel,
  approval_persona_code,
  approval_stage,
  on_failure,
  metadata
)
SELECT
  sc.tenant_id,
  t.id as task_id,
  a.id as agent_id,
  agent_data.assignment_type,
  agent_data.execution_order,
  agent_data.requires_human_approval,
  agent_data.max_retries,
  agent_data.retry_strategy,
  agent_data.is_parallel,
  agent_data.approval_persona_code,
  agent_data.approval_stage,
  agent_data.on_failure,
  agent_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Step 1: Objectives & Endpoints
    ('TSK-CD-010-01', 'AGT-CLINICAL-ENDPOINT', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Define endpoints", "focus": "Operational definitions"}'::jsonb),
    ('TSK-CD-010-01', 'AGT-PROTOCOL-DESIGNER', 'CO_EXECUTOR', 2, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Draft objectives", "focus": "Regulatory alignment"}'::jsonb),
    
    -- Step 2: Trial Structure
    ('TSK-CD-010-02', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P02_VPCLIN', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Design trial structure", "focus": "Operational feasibility"}'::jsonb),
    ('TSK-CD-010-02', 'AGT-BIOSTATISTICS', 'REVIEWER', 2, false, 1, 'NONE', true, NULL, NULL, 'SKIP', '{"role": "Review randomization", "focus": "Statistical validity"}'::jsonb),
    
    -- Step 3: Core Sections
    ('TSK-CD-010-03', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Draft protocol sections", "focus": "ICH E6(R2) compliance"}'::jsonb),
    ('TSK-CD-010-03', 'AGT-PROTOCOL-DESIGNER', 'CO_EXECUTOR', 2, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P11_MEDICAL_WRITER', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Technical review", "focus": "Completeness and clarity"}'::jsonb),
    
    -- Step 4: SAP Section
    ('TSK-CD-010-04', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Draft SAP section", "focus": "Statistical rigor"}'::jsonb),
    
    -- Step 5: Safety Plan
    ('TSK-CD-010-05', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Safety monitoring plan", "focus": "Patient protection"}'::jsonb),
    
    -- Step 6: Feasibility
    ('TSK-CD-010-06', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P02_VPCLIN', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Feasibility assessment", "focus": "Recruitment and execution"}'::jsonb),
    
    -- Step 7: Internal Review
    ('TSK-CD-010-07', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Coordinate review", "focus": "Multi-stakeholder feedback"}'::jsonb),
    ('TSK-CD-010-07', 'AGT-CLINICAL-REPORT-WRITER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Incorporate revisions", "focus": "Version control"}'::jsonb),
    
    -- Step 8: Finalize
    ('TSK-CD-010-08', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Finalize protocol", "focus": "Submission package"}'::jsonb),
    ('TSK-CD-010-08', 'AGT-REGULATORY-STRATEGY', 'REVIEWER', 2, true, 1, 'NONE', true, 'P05_REGAFF', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Regulatory review", "focus": "Submission readiness"}'::jsonb)
) AS agent_data(
  task_code,
  agent_code,
  assignment_type,
  execution_order,
  requires_human_approval,
  max_retries,
  retry_strategy,
  is_parallel,
  approval_persona_code,
  approval_stage,
  on_failure,
  metadata
)
INNER JOIN dh_task t ON t.code = agent_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_agent a ON a.code = agent_data.agent_code AND a.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, agent_id, assignment_type)
DO UPDATE SET
  execution_order = EXCLUDED.execution_order,
  requires_human_approval = EXCLUDED.requires_human_approval,
  max_retries = EXCLUDED.max_retries,
  retry_strategy = EXCLUDED.retry_strategy,
  is_parallel = EXCLUDED.is_parallel,
  approval_persona_code = EXCLUDED.approval_persona_code,
  approval_stage = EXCLUDED.approval_stage,
  on_failure = EXCLUDED.on_failure,
  metadata = EXCLUDED.metadata;

-- =====================================================================================
-- SECTION 3: PERSONA ASSIGNMENTS
-- =====================================================================================

INSERT INTO dh_task_persona (
  tenant_id,
  task_id,
  persona_id,
  responsibility,
  review_timing,
  escalation_to_persona_code,
  metadata
)
SELECT
  sc.tenant_id,
  t.id as task_id,
  p.id as persona_id,
  persona_data.responsibility,
  persona_data.review_timing,
  persona_data.escalation_to_persona_code,
  persona_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Step 1
    ('TSK-CD-010-01', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Objectives and endpoints approval", "decision_authority": "Clinical strategy"}'::jsonb),
    ('TSK-CD-010-01', 'P04_BIOSTAT', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Statistical review", "focus": "Endpoint operationalization"}'::jsonb),
    
    -- Step 2
    ('TSK-CD-010-02', 'P02_VPCLIN', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Trial design approval", "decision_authority": "Operational feasibility"}'::jsonb),
    ('TSK-CD-010-02', 'P04_BIOSTAT', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Randomization review", "focus": "Statistical design"}'::jsonb),
    ('TSK-CD-010-02', 'P12_CLINICAL_OPS', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Site execution review", "focus": "Operational complexity"}'::jsonb),
    
    -- Step 3
    ('TSK-CD-010-03', 'P11_MEDICAL_WRITER', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Protocol draft approval", "decision_authority": "Technical quality"}'::jsonb),
    ('TSK-CD-010-03', 'P01_CMO', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical review", "focus": "Medical accuracy"}'::jsonb),
    ('TSK-CD-010-03', 'P05_REGAFF', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Regulatory review", "focus": "ICH E6(R2) compliance"}'::jsonb),
    
    -- Step 4
    ('TSK-CD-010-04', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "SAP approval", "decision_authority": "Statistical methodology"}'::jsonb),
    
    -- Step 5
    ('TSK-CD-010-05', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Safety plan approval", "decision_authority": "Patient protection"}'::jsonb),
    ('TSK-CD-010-05', 'P05_REGAFF', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Regulatory safety review", "focus": "GCP compliance"}'::jsonb),
    
    -- Step 6
    ('TSK-CD-010-06', 'P02_VPCLIN', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Feasibility approval", "decision_authority": "Go/No-go decision"}'::jsonb),
    ('TSK-CD-010-06', 'P12_CLINICAL_OPS', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Operational review", "focus": "Site and CRO capacity"}'::jsonb),
    
    -- Step 7
    ('TSK-CD-010-07', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Internal review sign-off", "decision_authority": "Final clinical approval"}'::jsonb),
    ('TSK-CD-010-07', 'P04_BIOSTAT', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Statistical review", "focus": "SAP consistency"}'::jsonb),
    ('TSK-CD-010-07', 'P05_REGAFF', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Regulatory review", "focus": "Submission readiness"}'::jsonb),
    ('TSK-CD-010-07', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Operational review", "focus": "Final feasibility check"}'::jsonb),
    
    -- Step 8
    ('TSK-CD-010-08', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Final protocol sign-off", "decision_authority": "Executive approval"}'::jsonb),
    ('TSK-CD-010-08', 'P05_REGAFF', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Regulatory submission approval", "decision_authority": "FDA/IRB package"}'::jsonb),
    ('TSK-CD-010-08', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Final operational review", "focus": "Training materials complete"}'::jsonb)
) AS persona_data(
  task_code,
  persona_code,
  responsibility,
  review_timing,
  escalation_to_persona_code,
  metadata
)
INNER JOIN dh_task t ON t.code = persona_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_persona p ON p.code = persona_data.persona_code AND p.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, persona_id, responsibility)
DO UPDATE SET
  review_timing = EXCLUDED.review_timing,
  escalation_to_persona_code = EXCLUDED.escalation_to_persona_code,
  metadata = EXCLUDED.metadata;

-- =====================================================================================
-- SECTION 4: TOOL MAPPINGS
-- =====================================================================================

INSERT INTO dh_task_tool (
  tenant_id,
  task_id,
  tool_id,
  connection_config
)
SELECT
  sc.tenant_id,
  t.id as task_id,
  tool.id as tool_id,
  tool_data.connection_config
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Literature and precedent search
    ('TSK-CD-010-01', 'TOOL-CLINTRIALS', '{"database": "ClinicalTrials.gov", "purpose": "Protocol precedent search"}'::jsonb),
    ('TSK-CD-010-02', 'TOOL-CLINTRIALS', '{"database": "ClinicalTrials.gov", "purpose": "Trial design precedent"}'::jsonb),
    
    -- Statistical tools
    ('TSK-CD-010-04', 'TOOL-R-STATS', '{"software": "R", "purpose": "SAP development support"}'::jsonb)
) AS tool_data(task_code, tool_code, connection_config)
INNER JOIN dh_task t ON t.code = tool_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_tool tool ON tool.code = tool_data.tool_code AND tool.tenant_id = sc.tenant_id
ON CONFLICT (task_id, tool_id)
DO UPDATE SET
  connection_config = EXCLUDED.connection_config;

-- =====================================================================================
-- SECTION 5: RAG SOURCE MAPPINGS
-- =====================================================================================

INSERT INTO dh_task_rag (
  tenant_id,
  task_id,
  rag_source_id,
  query_context,
  search_config
)
SELECT
  sc.tenant_id,
  t.id as task_id,
  rag.id as rag_source_id,
  rag_data.query_context,
  rag_data.search_config
FROM session_config sc
CROSS JOIN (
  VALUES
    -- ICH E6(R2) for protocol structure
    ('TSK-CD-010-03', 'RAG-ICH-E6-R2', 'ICH E6(R2) protocol requirements', '{"focus": "16 required sections", "priority": "high"}'::jsonb),
    ('TSK-CD-010-05', 'RAG-ICH-E6-R2', 'ICH E6(R2) safety monitoring requirements', '{"focus": "GCP compliance", "priority": "high"}'::jsonb),
    ('TSK-CD-010-07', 'RAG-ICH-E6-R2', 'ICH E6(R2) protocol review checklist', '{"focus": "Completeness verification", "priority": "high"}'::jsonb),
    
    -- ICH E9 for SAP
    ('TSK-CD-010-04', 'RAG-ICH-E9', 'ICH E9 statistical principles', '{"focus": "SAP requirements", "priority": "high"}'::jsonb),
    
    -- ICH E8 for clinical trial design
    ('TSK-CD-010-02', 'RAG-ICH-E8', 'ICH E8 general considerations for clinical trials', '{"focus": "Design principles", "priority": "medium"}'::jsonb),
    
    -- FDA Digital Health for DTx-specific requirements
    ('TSK-CD-010-01', 'RAG-FDA-DIGITAL-HEALTH-2022', 'FDA digital health clinical trial guidance', '{"focus": "DTx endpoints and design", "priority": "high"}'::jsonb),
    ('TSK-CD-010-03', 'RAG-FDA-DIGITAL-HEALTH-2022', 'FDA digital health protocol requirements', '{"focus": "DTx-specific sections", "priority": "high"}'::jsonb)
) AS rag_data(task_code, rag_code, query_context, search_config)
INNER JOIN dh_task t ON t.code = rag_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_rag_source rag ON rag.code = rag_data.rag_code AND rag.tenant_id = sc.tenant_id
ON CONFLICT (task_id, rag_source_id)
DO UPDATE SET
  query_context = EXCLUDED.query_context,
  search_config = EXCLUDED.search_config;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

SELECT 
  'UC-10 Part 2 Complete' as status,
  (SELECT COUNT(*) FROM dh_task_dependency td
   INNER JOIN dh_task t ON t.id = td.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_010') as dependencies,
  (SELECT COUNT(*) FROM dh_task_agent ta
   INNER JOIN dh_task t ON t.id = ta.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_010') as agent_assignments,
  (SELECT COUNT(*) FROM dh_task_persona tp
   INNER JOIN dh_task t ON t.id = tp.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_010') as persona_assignments,
  (SELECT COUNT(*) FROM dh_task_tool tt
   INNER JOIN dh_task t ON t.id = tt.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_010') as tool_mappings,
  (SELECT COUNT(*) FROM dh_task_rag tr
   INNER JOIN dh_task t ON t.id = tr.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_010') as rag_mappings;

-- =====================================================================================
-- END OF UC-10 PART 2 SEED FILE
-- =====================================================================================

