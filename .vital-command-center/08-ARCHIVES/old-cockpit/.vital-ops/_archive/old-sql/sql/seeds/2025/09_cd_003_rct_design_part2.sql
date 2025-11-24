-- =====================================================================================
-- 09_cd_003_rct_design_part2.sql
-- UC_CD_003: DTx RCT Design & Clinical Trial Strategy - Part 2: Assignments
-- =====================================================================================
-- Purpose: Seed task dependencies, agent assignments, persona assignments, tool mappings, and RAG sources
-- Dependencies: Part 1 must be run first (workflows and tasks must exist)
-- Execution Order: 9b (immediately after part 1)
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
    -- Phase 2 depends on Phase 1
    ('TSK-CD-003-P2-01', 'TSK-CD-003-P1-01', 'Comparator design follows from objectives'),
    ('TSK-CD-003-P2-01', 'TSK-CD-003-P1-02', 'Blinding strategy aligns with hypotheses'),
    ('TSK-CD-003-P2-02', 'TSK-CD-003-P1-01', 'Population criteria must meet objectives'),
    
    -- Phase 3 depends on Phase 2
    ('TSK-CD-003-P3-01', 'TSK-CD-003-P2-01', 'Intervention based on comparator design'),
    ('TSK-CD-003-P3-01', 'TSK-CD-003-P2-02', 'Intervention suitable for population'),
    ('TSK-CD-003-P3-02', 'TSK-CD-003-P3-01', 'Assessment schedule follows intervention'),
    ('TSK-CD-003-P3-02', 'TSK-CD-003-P2-02', 'Assessments appropriate for population'),
    
    -- Phase 4 depends on Phase 3
    ('TSK-CD-003-P4-01', 'TSK-CD-003-P3-02', 'Engagement based on assessment burden'),
    ('TSK-CD-003-P4-02', 'TSK-CD-003-P3-02', 'Retention aligned with assessment schedule'),
    ('TSK-CD-003-P4-02', 'TSK-CD-003-P4-01', 'Retention builds on engagement'),
    
    -- Phase 5 depends on all previous phases
    ('TSK-CD-003-P5-01', 'TSK-CD-003-P1-02', 'Sample size based on hypotheses'),
    ('TSK-CD-003-P5-01', 'TSK-CD-003-P4-02', 'Sample size accounts for attrition'),
    ('TSK-CD-003-P5-02', 'TSK-CD-003-P5-01', 'SAP follows from sample size'),
    ('TSK-CD-003-P5-02', 'TSK-CD-003-P3-02', 'SAP specifies assessment analyses')
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
    -- Phase 1, Task 1: Define Study Objectives
    ('TSK-CD-003-P1-01', 'AGT-CLINICAL-ENDPOINT', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Objective definition", "focus": "Clinical objectives and endpoints"}'::jsonb),
    ('TSK-CD-003-P1-01', 'AGT-LITERATURE-SEARCH', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Evidence review", "focus": "Precedent trial objectives"}'::jsonb),
    
    -- Phase 1, Task 2: Formulate Hypotheses
    ('TSK-CD-003-P1-02', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Statistical hypothesis formulation", "focus": "Primary and secondary hypotheses"}'::jsonb),
    ('TSK-CD-003-P1-02', 'AGT-CLINICAL-ENDPOINT', 'VALIDATOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Clinical hypothesis support", "focus": "Clinical relevance"}'::jsonb),
    
    -- Phase 2, Task 1: Design Comparator and Blinding
    ('TSK-CD-003-P2-01', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P02_VPCLIN', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Comparator design", "focus": "Blinding and sham development"}'::jsonb),
    ('TSK-CD-003-P2-01', 'AGT-REGULATORY-STRATEGY', 'VALIDATOR', 2, true, 2, 'LINEAR', false, 'P05_REGAFF', 'AFTER_EXECUTION', 'RETRY', '{"role": "Regulatory validation", "focus": "Comparator acceptability"}'::jsonb),
    
    -- Phase 2, Task 2: Develop Inclusion/Exclusion Criteria
    ('TSK-CD-003-P2-02', 'AGT-CLINICAL-ENDPOINT', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Eligibility criteria", "focus": "Medical suitability"}'::jsonb),
    ('TSK-CD-003-P2-02', 'AGT-CLINICAL-DATA-RETRIEVER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Feasibility assessment", "focus": "Patient availability"}'::jsonb),
    
    -- Phase 3, Task 1: Define Intervention Protocol
    ('TSK-CD-003-P3-01', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P02_VPCLIN', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Intervention specification", "focus": "DTx usage protocol"}'::jsonb),
    ('TSK-CD-003-P3-01', 'AGT-CLINICAL-DATA-RETRIEVER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Technical feasibility", "focus": "Digital delivery"}'::jsonb),
    
    -- Phase 3, Task 2: Design Assessment Schedule
    ('TSK-CD-003-P3-02', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Assessment timing", "focus": "Statistical power and burden"}'::jsonb),
    ('TSK-CD-003-P3-02', 'AGT-CLINICAL-ENDPOINT', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Clinical meaningfulness", "focus": "Outcome measurement"}'::jsonb),
    
    -- Phase 4, Task 1: Design Engagement Strategy
    ('TSK-CD-003-P4-01', 'AGT-CLINICAL-DATA-RETRIEVER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P09_DATASCIENCE', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Engagement planning", "focus": "User experience optimization"}'::jsonb),
    ('TSK-CD-003-P4-01', 'AGT-PROTOCOL-DESIGNER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Protocol integration", "focus": "Engagement requirements"}'::jsonb),
    
    -- Phase 4, Task 2: Design Retention Strategy
    ('TSK-CD-003-P4-02', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P12_CLINICAL_OPS', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Retention coordination", "focus": "Patient retention tactics"}'::jsonb),
    ('TSK-CD-003-P4-02', 'AGT-CLINICAL-DATA-RETRIEVER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Engagement monitoring", "focus": "Early warning systems"}'::jsonb),
    
    -- Phase 5, Task 1: Calculate Sample Size
    ('TSK-CD-003-P5-01', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Sample size calculation", "focus": "Power analysis with attrition"}'::jsonb),
    ('TSK-CD-003-P5-01', 'AGT-CLINICAL-DATA-RETRIEVER', 'VALIDATOR', 2, true, 2, 'LINEAR', false, 'P09_DATASCIENCE', 'AFTER_EXECUTION', 'RETRY', '{"role": "Assumptions validation", "focus": "Effect size and variance"}'::jsonb),
    
    -- Phase 5, Task 2: Draft Statistical Analysis Plan
    ('TSK-CD-003-P5-02', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "SAP authoring", "focus": "Complete statistical methodology"}'::jsonb),
    ('TSK-CD-003-P5-02', 'AGT-CLINICAL-REPORT-WRITER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "SAP documentation", "focus": "Formatting and structure"}'::jsonb)
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
    -- Phase 1
    ('TSK-CD-003-P1-01', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', 'P02_VPCLIN', '{"role": "Final approval of objectives", "decision_authority": "Go/No-go"}'::jsonb),
    ('TSK-CD-003-P1-01', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Operational feasibility review", "focus": "Execution practicality"}'::jsonb),
    ('TSK-CD-003-P1-02', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Statistical hypothesis approval", "decision_authority": "Statistical validity"}'::jsonb),
    ('TSK-CD-003-P1-02', 'P01_CMO', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical meaningfulness review", "focus": "Hypothesis alignment"}'::jsonb),
    
    -- Phase 2
    ('TSK-CD-003-P2-01', 'P02_VPCLIN', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Comparator design approval", "decision_authority": "Blinding strategy"}'::jsonb),
    ('TSK-CD-003-P2-01', 'P05_REGAFF', 'REVIEW', 'AFTER_AGENT_RUNS', 'P02_VPCLIN', '{"role": "Regulatory review", "focus": "FDA/EMA acceptability"}'::jsonb),
    ('TSK-CD-003-P2-02', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Eligibility criteria approval", "decision_authority": "Medical appropriateness"}'::jsonb),
    ('TSK-CD-003-P2-02', 'P12_CLINICAL_OPS', 'REVIEW', 'AFTER_AGENT_RUNS', 'P02_VPCLIN', '{"role": "Recruitment feasibility", "focus": "Patient availability"}'::jsonb),
    
    -- Phase 3
    ('TSK-CD-003-P3-01', 'P02_VPCLIN', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Intervention protocol approval", "decision_authority": "Implementation feasibility"}'::jsonb),
    ('TSK-CD-003-P3-01', 'P09_DATASCIENCE', 'REVIEW', 'AFTER_AGENT_RUNS', 'P02_VPCLIN', '{"role": "Technical feasibility review", "focus": "Digital delivery"}'::jsonb),
    ('TSK-CD-003-P3-02', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Assessment schedule approval", "decision_authority": "Statistical adequacy"}'::jsonb),
    ('TSK-CD-003-P3-02', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', 'P04_BIOSTAT', '{"role": "Patient burden review", "focus": "Feasibility and compliance"}'::jsonb),
    
    -- Phase 4
    ('TSK-CD-003-P4-01', 'P09_DATASCIENCE', 'APPROVE', 'AFTER_AGENT_RUNS', 'P02_VPCLIN', '{"role": "Engagement strategy approval", "decision_authority": "Technical implementation"}'::jsonb),
    ('TSK-CD-003-P4-01', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Operational review", "focus": "Resource requirements"}'::jsonb),
    ('TSK-CD-003-P4-02', 'P12_CLINICAL_OPS', 'APPROVE', 'AFTER_AGENT_RUNS', 'P02_VPCLIN', '{"role": "Retention strategy approval", "decision_authority": "Operational execution"}'::jsonb),
    ('TSK-CD-003-P4-02', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Budget and timeline review", "focus": "Resource allocation"}'::jsonb),
    
    -- Phase 5
    ('TSK-CD-003-P5-01', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Sample size approval", "decision_authority": "Statistical adequacy"}'::jsonb),
    ('TSK-CD-003-P5-01', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', 'P04_BIOSTAT', '{"role": "Budget feasibility review", "focus": "Cost and timeline"}'::jsonb),
    ('TSK-CD-003-P5-02', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "SAP final approval", "decision_authority": "Statistical methodology"}'::jsonb),
    ('TSK-CD-003-P5-02', 'P05_REGAFF', 'REVIEW', 'AFTER_AGENT_RUNS', 'P04_BIOSTAT', '{"role": "Regulatory compliance review", "focus": "FDA/EMA requirements"}'::jsonb)
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
    -- Statistical tools
    ('TSK-CD-003-P1-02', 'TOOL-R-STATS', '{"software": "R", "purpose": "Hypothesis testing", "usage": "Power calculations and hypothesis formulation"}'::jsonb),
    ('TSK-CD-003-P5-01', 'TOOL-R-STATS', '{"software": "R", "purpose": "Sample size calculation", "usage": "Power analysis with attrition modeling"}'::jsonb),
    ('TSK-CD-003-P5-02', 'TOOL-SAS', '{"software": "SAS", "purpose": "SAP development", "usage": "Statistical analysis programming"}'::jsonb),
    
    -- Literature and regulatory databases
    ('TSK-CD-003-P1-01', 'TOOL-PUBMED', '{"access": "NCBI", "purpose": "Literature review", "usage": "Precedent trial objectives"}'::jsonb),
    ('TSK-CD-003-P2-01', 'TOOL-CLINTRIALS', '{"database": "ClinicalTrials.gov", "purpose": "Trial precedent research", "usage": "Comparator precedent"}'::jsonb),
    
    -- Clinical trial management
    ('TSK-CD-003-P3-02', 'TOOL-RAVE-EDC', '{"system": "Medidata Rave", "purpose": "Assessment design", "usage": "Electronic data capture setup"}'::jsonb),
    ('TSK-CD-003-P4-02', 'TOOL-REDCAP', '{"system": "REDCap", "purpose": "Retention tracking", "usage": "Patient follow-up monitoring"}'::jsonb)
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
    -- FDA and regulatory guidance
    ('TSK-CD-003-P1-01', 'RAG-FDA-DIGITAL-HEALTH-2022', 'FDA digital health guidance on trial design and endpoints', '{"focus": "Trial design", "specificity": "DTx trials", "priority": "high", "relevance": "clinical trial design"}'::jsonb),
    ('TSK-CD-003-P2-01', 'RAG-FDA-DIGITAL-HEALTH-2022', 'FDA guidance on comparators and blinding for DTx', '{"focus": "Comparator selection", "specificity": "Blinding strategies", "priority": "high", "relevance": "comparator design"}'::jsonb),
    ('TSK-CD-003-P5-02', 'RAG-FDA-MULTIPLE-ENDPOINTS-2022', 'FDA guidance on statistical analysis with multiple endpoints', '{"focus": "Statistical methodology", "specificity": "SAP requirements", "priority": "high", "relevance": "SAP preparation"}'::jsonb),
    
    -- ICH guidelines
    ('TSK-CD-003-P1-01', 'RAG-ICH-E9', 'ICH E9 Statistical Principles for Clinical Trials', '{"guideline": "E9", "focus": "Statistical design", "priority": "high", "relevance": "trial design principles"}'::jsonb),
    ('TSK-CD-003-P3-02', 'RAG-ICH-E6-GCP', 'ICH E6 GCP for assessment timing', '{"guideline": "E6", "focus": "GCP compliance", "priority": "medium", "relevance": "assessment standards"}'::jsonb),
    
    -- Clinical trial precedent databases
    ('TSK-CD-003-P1-01', 'RAG-FDA-DRUGS-DB', 'Precedent DTx and digital health trial designs', '{"indication": "relevant", "focus": "Design patterns", "priority": "medium", "relevance": "design precedent"}'::jsonb),
    ('TSK-CD-003-P2-02', 'RAG-FDA-510K-DB', 'Eligibility criteria from similar digital health studies', '{"indication": "relevant", "focus": "Inclusion/exclusion", "priority": "medium", "relevance": "population definition"}'::jsonb)
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

-- Verify dependencies
SELECT 
  'UC-03 Dependencies Seeded' as status,
  COUNT(*) as dependency_count
FROM dh_task_dependency td
INNER JOIN dh_task t ON t.id = td.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_003';

-- Verify agent assignments
SELECT 
  'UC-03 Agent Assignments Seeded' as status,
  COUNT(*) as agent_assignment_count
FROM dh_task_agent ta
INNER JOIN dh_task t ON t.id = ta.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_003';

-- Verify persona assignments
SELECT 
  'UC-03 Persona Assignments Seeded' as status,
  COUNT(*) as persona_assignment_count
FROM dh_task_persona tp
INNER JOIN dh_task t ON t.id = tp.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_003';

-- Verify tool mappings
SELECT 
  'UC-03 Tool Mappings Seeded' as status,
  COUNT(*) as tool_mapping_count
FROM dh_task_tool tt
INNER JOIN dh_task t ON t.id = tt.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_003';

-- Verify RAG mappings
SELECT 
  'UC-03 RAG Mappings Seeded' as status,
  COUNT(*) as rag_mapping_count
FROM dh_task_rag tr
INNER JOIN dh_task t ON t.id = tr.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_003';

-- Summary
SELECT 
  'UC-03 Part 2 Complete' as status,
  (SELECT COUNT(*) FROM dh_task_dependency td
   INNER JOIN dh_task t ON t.id = td.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_003') as dependencies,
  (SELECT COUNT(*) FROM dh_task_agent ta
   INNER JOIN dh_task t ON t.id = ta.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_003') as agent_assignments,
  (SELECT COUNT(*) FROM dh_task_persona tp
   INNER JOIN dh_task t ON t.id = tp.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_003') as persona_assignments,
  (SELECT COUNT(*) FROM dh_task_tool tt
   INNER JOIN dh_task t ON t.id = tt.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_003') as tool_mappings,
  (SELECT COUNT(*) FROM dh_task_rag tr
   INNER JOIN dh_task t ON t.id = tr.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_003') as rag_mappings;

-- =====================================================================================
-- END OF UC-03 PART 2 SEED FILE
-- =====================================================================================

