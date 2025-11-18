-- =====================================================================================
-- 12_cd_005_pro_instrument_selection_part2.sql
-- UC_CD_005: Patient-Reported Outcome (PRO) Instrument Selection - Part 2: Assignments
-- =====================================================================================
-- Purpose: Seed task dependencies, agent assignments, persona assignments, tool mappings, and RAG sources
-- Dependencies: Part 1 must be run first (workflows and tasks must exist)
-- Execution Order: 12b (immediately after part 1)
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
    ('TSK-CD-005-02', 'TSK-CD-005-01', 'Literature search requires construct definition'),
    ('TSK-CD-005-03', 'TSK-CD-005-02', 'Psychometric evaluation requires candidate PROs'),
    ('TSK-CD-005-04', 'TSK-CD-005-02', 'FDA assessment requires candidate PROs'),
    ('TSK-CD-005-05', 'TSK-CD-005-02', 'Feasibility assessment requires candidate PROs'),
    ('TSK-CD-005-06', 'TSK-CD-005-02', 'Patient burden requires candidate PROs'),
    ('TSK-CD-005-07', 'TSK-CD-005-03', 'Final decision requires psychometric data'),
    ('TSK-CD-005-07', 'TSK-CD-005-04', 'Final decision requires FDA assessment'),
    ('TSK-CD-005-07', 'TSK-CD-005-05', 'Final decision requires feasibility data'),
    ('TSK-CD-005-07', 'TSK-CD-005-06', 'Final decision requires burden assessment'),
    ('TSK-CD-005-08', 'TSK-CD-005-07', 'Licensing follows PRO selection')
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
    -- Step 1: Define Clinical Construct
    ('TSK-CD-005-01', 'AGT-CLINICAL-ENDPOINT', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Define clinical construct", "focus": "Patient-centered outcomes"}'::jsonb),
    
    -- Step 2: Literature Search
    ('TSK-CD-005-02', 'AGT-LITERATURE-SEARCH', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P02_VPCLIN', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "PRO literature search", "focus": "PROQOLID, PubMed, ePROVIDE"}'::jsonb),
    ('TSK-CD-005-02', 'AGT-EVIDENCE-SYNTHESIZER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Compile candidate PRO list", "focus": "5-7 instruments"}'::jsonb),
    
    -- Step 3: Psychometric Evaluation
    ('TSK-CD-005-03', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Evaluate psychometric properties", "focus": "Reliability, validity, responsiveness"}'::jsonb),
    
    -- Step 4: FDA Assessment
    ('TSK-CD-005-04', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P05_REGAFF', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "FDA compliance assessment", "focus": "PRO Guidance 2009"}'::jsonb),
    ('TSK-CD-005-04', 'AGT-LITERATURE-SEARCH', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "FDA precedent search", "focus": "Drugs@FDA labels"}'::jsonb),
    
    -- Step 5: Digital Feasibility
    ('TSK-CD-005-05', 'AGT-CLINICAL-DATA-RETRIEVER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P06_PMDIG', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "ePRO feasibility assessment", "focus": "Technical implementation"}'::jsonb),
    
    -- Step 6: Patient Burden
    ('TSK-CD-005-06', 'AGT-CLINICAL-ENDPOINT', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P10_PATADV', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Patient burden assessment", "focus": "Completion time and acceptability"}'::jsonb),
    
    -- Step 7: Final Decision
    ('TSK-CD-005-07', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Synthesize decision", "focus": "Weighted scoring matrix"}'::jsonb),
    ('TSK-CD-005-07', 'AGT-CLINICAL-REPORT-WRITER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Prepare justification document", "focus": "5-10 page report"}'::jsonb),
    
    -- Step 8: Licensing Strategy
    ('TSK-CD-005-08', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P05_REGAFF', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Licensing strategy", "focus": "IP and cost structure"}'::jsonb)
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
    ('TSK-CD-005-01', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical construct approval", "decision_authority": "Patient-centeredness"}'::jsonb),
    
    -- Step 2
    ('TSK-CD-005-02', 'P02_VPCLIN', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "PRO candidate list approval", "decision_authority": "Completeness"}'::jsonb),
    
    -- Step 3
    ('TSK-CD-005-03', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Psychometric evaluation approval", "decision_authority": "Statistical validity"}'::jsonb),
    
    -- Step 4
    ('TSK-CD-005-04', 'P05_REGAFF', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "FDA compliance approval", "decision_authority": "Regulatory acceptability"}'::jsonb),
    ('TSK-CD-005-04', 'P01_CMO', 'REVIEW', 'AFTER_AGENT_RUNS', 'P05_REGAFF', '{"role": "Strategic review", "focus": "Risk assessment"}'::jsonb),
    
    -- Step 5
    ('TSK-CD-005-05', 'P06_PMDIG', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Technical feasibility approval", "decision_authority": "ePRO implementation"}'::jsonb),
    
    -- Step 6
    ('TSK-CD-005-06', 'P10_PATADV', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Patient burden approval", "decision_authority": "Patient acceptability"}'::jsonb),
    ('TSK-CD-005-06', 'P01_CMO', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical review", "focus": "Retention impact"}'::jsonb),
    
    -- Step 7
    ('TSK-CD-005-07', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Final PRO selection", "decision_authority": "Executive decision"}'::jsonb),
    ('TSK-CD-005-07', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Operational review", "focus": "Trial execution"}'::jsonb),
    ('TSK-CD-005-07', 'P04_BIOSTAT', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Statistical review", "focus": "Sample size implications"}'::jsonb),
    
    -- Step 8
    ('TSK-CD-005-08', 'P05_REGAFF', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Licensing strategy approval", "decision_authority": "Legal and IP"}'::jsonb)
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
    -- Literature search tools
    ('TSK-CD-005-02', 'TOOL-PUBMED', '{"database": "PubMed/MEDLINE", "purpose": "PRO literature search"}'::jsonb),
    ('TSK-CD-005-02', 'TOOL-COCHRANE', '{"database": "Cochrane Library", "purpose": "PRO systematic reviews"}'::jsonb),
    
    -- Statistical analysis
    ('TSK-CD-005-03', 'TOOL-R-STATS', '{"software": "R", "purpose": "Psychometric analysis", "packages": ["psych", "CTT"]}'::jsonb),
    
    -- FDA databases
    ('TSK-CD-005-04', 'TOOL-CLINTRIALS', '{"database": "ClinicalTrials.gov", "purpose": "PRO endpoint precedent"}'::jsonb)
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
    -- FDA PRO Guidance
    ('TSK-CD-005-01', 'RAG-FDA-PRO-2009', 'FDA PRO Guidance 2009 on clinical construct definition', '{"focus": "Content validity", "priority": "high"}'::jsonb),
    ('TSK-CD-005-04', 'RAG-FDA-PRO-2009', 'FDA PRO Guidance 2009 complete review', '{"focus": "Regulatory compliance", "priority": "high"}'::jsonb),
    
    -- ISPOR PRO guidelines
    ('TSK-CD-005-03', 'RAG-ISPOR-PRO-2011', 'ISPOR PRO validation guidelines', '{"focus": "Psychometric standards", "priority": "high"}'::jsonb),
    
    -- COSMIN checklist
    ('TSK-CD-005-03', 'RAG-COSMIN', 'COSMIN checklist for PRO evaluation', '{"focus": "Measurement properties", "priority": "high"}'::jsonb),
    
    -- PROMIS resources
    ('TSK-CD-005-02', 'RAG-PROMIS', 'PROMIS item banks and instruments', '{"focus": "CAT administration", "priority": "medium"}'::jsonb)
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
  'UC-05 Part 2 Complete' as status,
  (SELECT COUNT(*) FROM dh_task_dependency td
   INNER JOIN dh_task t ON t.id = td.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_005') as dependencies,
  (SELECT COUNT(*) FROM dh_task_agent ta
   INNER JOIN dh_task t ON t.id = ta.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_005') as agent_assignments,
  (SELECT COUNT(*) FROM dh_task_persona tp
   INNER JOIN dh_task t ON t.id = tp.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_005') as persona_assignments,
  (SELECT COUNT(*) FROM dh_task_tool tt
   INNER JOIN dh_task t ON t.id = tt.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_005') as tool_mappings,
  (SELECT COUNT(*) FROM dh_task_rag tr
   INNER JOIN dh_task t ON t.id = tr.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_005') as rag_mappings;

-- =====================================================================================
-- END OF UC-05 PART 2 SEED FILE
-- =====================================================================================

