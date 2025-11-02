-- =====================================================================================
-- 13_cd_007_sample_size_calculation_part2.sql
-- UC_CD_007: Sample Size Calculation for DTx Trials - Part 2: Assignments
-- =====================================================================================
-- Purpose: Seed task dependencies, agent assignments, persona assignments, tool mappings, and RAG sources
-- Dependencies: Part 1 must be run first (workflows and tasks must exist)
-- Execution Order: 13b (immediately after part 1)
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
    ('TSK-CD-007-02', 'TSK-CD-007-01', 'Effect size requires study parameters'),
    ('TSK-CD-007-03', 'TSK-CD-007-01', 'Variability requires endpoint type'),
    ('TSK-CD-007-04', 'TSK-CD-007-02', 'Sample size calculation requires effect size'),
    ('TSK-CD-007-04', 'TSK-CD-007-03', 'Sample size calculation requires variability'),
    ('TSK-CD-007-05', 'TSK-CD-007-04', 'Attrition adjustment requires base sample size'),
    ('TSK-CD-007-06', 'TSK-CD-007-04', 'Sensitivity analysis requires base calculation'),
    ('TSK-CD-007-07', 'TSK-CD-007-05', 'Justification requires adjusted sample size'),
    ('TSK-CD-007-07', 'TSK-CD-007-06', 'Justification requires sensitivity analyses')
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
    -- Step 1: Define Study Parameters
    ('TSK-CD-007-01', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Define study parameters", "focus": "Trial design and hypotheses"}'::jsonb),
    
    -- Step 2: Estimate Effect Size
    ('TSK-CD-007-02', 'AGT-LITERATURE-SEARCH', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Literature search for effect sizes", "focus": "Similar trials and MCID"}'::jsonb),
    ('TSK-CD-007-02', 'AGT-EVIDENCE-SYNTHESIZER', 'CO_EXECUTOR', 2, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Synthesize effect size estimate", "focus": "Clinical meaningfulness"}'::jsonb),
    
    -- Step 3: Estimate Variability
    ('TSK-CD-007-03', 'AGT-LITERATURE-SEARCH', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Extract variability data", "focus": "SD, SE, event rates"}'::jsonb),
    ('TSK-CD-007-03', 'AGT-BIOSTATISTICS', 'CO_EXECUTOR', 2, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Estimate variability", "focus": "Conservative estimates"}'::jsonb),
    
    -- Step 4: Calculate Sample Size
    ('TSK-CD-007-04', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Power analysis", "focus": "Sample size calculation"}'::jsonb),
    
    -- Step 5: Adjust for Attrition
    ('TSK-CD-007-05', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Attrition adjustment", "focus": "Realistic dropout rates"}'::jsonb),
    
    -- Step 6: Sensitivity Analyses
    ('TSK-CD-007-06', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Sensitivity analysis", "focus": "Robustness testing"}'::jsonb),
    
    -- Step 7: Finalize Justification
    ('TSK-CD-007-07', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Draft justification report", "focus": "Protocol-ready document"}'::jsonb),
    ('TSK-CD-007-07', 'AGT-PROTOCOL-DESIGNER', 'REVIEWER', 2, true, 1, 'NONE', true, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Review alignment with protocol", "focus": "Design consistency"}'::jsonb)
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
    ('TSK-CD-007-01', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Study parameters approval", "decision_authority": "Clinical strategy"}'::jsonb),
    ('TSK-CD-007-01', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Operational review", "focus": "Feasibility"}'::jsonb),
    
    -- Step 2
    ('TSK-CD-007-02', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Effect size approval", "decision_authority": "Statistical rationale"}'::jsonb),
    ('TSK-CD-007-02', 'P01_CMO', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical meaningfulness review", "focus": "Realistic expectations"}'::jsonb),
    
    -- Step 3
    ('TSK-CD-007-03', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Variability estimate approval", "decision_authority": "Source validity"}'::jsonb),
    
    -- Step 4
    ('TSK-CD-007-04', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Sample size calculation approval", "decision_authority": "Statistical validity"}'::jsonb),
    ('TSK-CD-007-04', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Operational feasibility", "focus": "Recruitment capacity"}'::jsonb),
    
    -- Step 5
    ('TSK-CD-007-05', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Attrition adjustment approval", "decision_authority": "Dropout rate justification"}'::jsonb),
    ('TSK-CD-007-05', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Retention strategy review", "focus": "Realistic attrition"}'::jsonb),
    
    -- Step 6
    ('TSK-CD-007-06', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Sensitivity analysis approval", "decision_authority": "Scenario robustness"}'::jsonb),
    
    -- Step 7
    ('TSK-CD-007-07', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Final justification approval", "decision_authority": "Executive sign-off"}'::jsonb),
    ('TSK-CD-007-07', 'P04_BIOSTAT', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Statistical review", "focus": "Technical accuracy"}'::jsonb),
    ('TSK-CD-007-07', 'P05_REGAFF', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Regulatory review", "focus": "FDA acceptability"}'::jsonb),
    ('TSK-CD-007-07', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Operational review", "focus": "Execution feasibility"}'::jsonb)
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
    -- Literature search
    ('TSK-CD-007-02', 'TOOL-PUBMED', '{"database": "PubMed/MEDLINE", "purpose": "Effect size literature search"}'::jsonb),
    ('TSK-CD-007-02', 'TOOL-CLINTRIALS', '{"database": "ClinicalTrials.gov", "purpose": "Trial precedent search"}'::jsonb),
    ('TSK-CD-007-03', 'TOOL-PUBMED', '{"database": "PubMed/MEDLINE", "purpose": "Variability data extraction"}'::jsonb),
    
    -- Statistical software
    ('TSK-CD-007-04', 'TOOL-R-STATS', '{"software": "R", "purpose": "Power analysis", "packages": ["pwr", "PowerTOST"]}'::jsonb),
    ('TSK-CD-007-06', 'TOOL-R-STATS', '{"software": "R", "purpose": "Sensitivity analysis", "packages": ["pwr"]}'::jsonb)
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
    -- ICH E9 Statistical Principles
    ('TSK-CD-007-01', 'RAG-ICH-E9', 'ICH E9 Statistical Principles for Clinical Trials', '{"focus": "Sample size methodology", "priority": "high"}'::jsonb),
    ('TSK-CD-007-04', 'RAG-ICH-E9', 'ICH E9 power analysis requirements', '{"focus": "Power calculation standards", "priority": "high"}'::jsonb),
    ('TSK-CD-007-07', 'RAG-ICH-E9', 'ICH E9 sample size justification requirements', '{"focus": "Documentation standards", "priority": "high"}'::jsonb),
    
    -- FDA guidance
    ('TSK-CD-007-02', 'RAG-FDA-DIGITAL-HEALTH-2022', 'FDA digital health clinical trial endpoints', '{"focus": "Effect size expectations", "priority": "medium"}'::jsonb),
    
    -- PRO guidance (for MCID)
    ('TSK-CD-007-02', 'RAG-FDA-PRO-2009', 'FDA PRO Guidance on MCID', '{"focus": "Clinically meaningful difference", "priority": "medium"}'::jsonb)
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
  'UC-07 Part 2 Complete' as status,
  (SELECT COUNT(*) FROM dh_task_dependency td
   INNER JOIN dh_task t ON t.id = td.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_007') as dependencies,
  (SELECT COUNT(*) FROM dh_task_agent ta
   INNER JOIN dh_task t ON t.id = ta.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_007') as agent_assignments,
  (SELECT COUNT(*) FROM dh_task_persona tp
   INNER JOIN dh_task t ON t.id = tp.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_007') as persona_assignments,
  (SELECT COUNT(*) FROM dh_task_tool tt
   INNER JOIN dh_task t ON t.id = tt.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_007') as tool_mappings,
  (SELECT COUNT(*) FROM dh_task_rag tr
   INNER JOIN dh_task t ON t.id = tr.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_007') as rag_mappings;

-- =====================================================================================
-- END OF UC-07 PART 2 SEED FILE
-- =====================================================================================

