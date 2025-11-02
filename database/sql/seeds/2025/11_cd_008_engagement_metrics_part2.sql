-- =====================================================================================
-- 11_cd_008_engagement_metrics_part2.sql
-- UC_CD_008: DTx Engagement Metrics as Endpoints - Part 2: Assignments
-- =====================================================================================
-- Purpose: Seed task dependencies, agent assignments, persona assignments, tool mappings, and RAG sources
-- Dependencies: Part 1 must be run first (workflows and tasks must exist)
-- Execution Order: 11b (immediately after part 1)
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
    -- Sequential dependencies
    ('TSK-CD-008-P2-01', 'TSK-CD-008-P1-01', 'Operationalization requires taxonomy definition'),
    ('TSK-CD-008-P3-01', 'TSK-CD-008-P2-01', 'Dose-response requires operational metrics'),
    ('TSK-CD-008-P4-01', 'TSK-CD-008-P3-01', 'Mediation follows dose-response analysis'),
    ('TSK-CD-008-P5-01', 'TSK-CD-008-P4-01', 'Regulatory strategy based on validation evidence')
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
    -- Phase 1: Engagement Definition
    ('TSK-CD-008-P1-01', 'AGT-CLINICAL-ENDPOINT', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Define engagement taxonomy", "focus": "Usage vs engagement distinction"}'::jsonb),
    ('TSK-CD-008-P1-01', 'AGT-CLINICAL-DATA-RETRIEVER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Product feature analysis", "focus": "Technical feasibility"}'::jsonb),
    
    -- Phase 2: Operationalization
    ('TSK-CD-008-P2-01', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Operationalize metrics", "focus": "Measurement specifications"}'::jsonb),
    ('TSK-CD-008-P2-01', 'AGT-CLINICAL-DATA-RETRIEVER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Data capture design", "focus": "Event logging architecture"}'::jsonb),
    
    -- Phase 3: Dose-Response Analysis
    ('TSK-CD-008-P3-01', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Design dose-response analysis", "focus": "Statistical models and thresholds"}'::jsonb),
    ('TSK-CD-008-P3-01', 'AGT-CLINICAL-ENDPOINT', 'VALIDATOR', 2, true, 2, 'LINEAR', false, 'P01_CMO', 'AFTER_EXECUTION', 'RETRY', '{"role": "Clinical validation", "focus": "Threshold meaningfulness"}'::jsonb),
    
    -- Phase 4: Mediation Analysis
    ('TSK-CD-008-P4-01', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Plan mediation analysis", "focus": "Causal pathway specification"}'::jsonb),
    ('TSK-CD-008-P4-01', 'AGT-CLINICAL-ENDPOINT', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Clinical pathway validation", "focus": "Mechanism of action"}'::jsonb),
    
    -- Phase 5: Regulatory Strategy
    ('TSK-CD-008-P5-01', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P05_REGAFF', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Develop regulatory positioning", "focus": "FDA engagement questions"}'::jsonb),
    ('TSK-CD-008-P5-01', 'AGT-CLINICAL-REPORT-WRITER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Draft submission sections", "focus": "Evidence documentation"}'::jsonb)
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
    ('TSK-CD-008-P1-01', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Taxonomy approval", "decision_authority": "Clinical meaningfulness"}'::jsonb),
    ('TSK-CD-008-P1-01', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Operational review", "focus": "Trial implementation feasibility"}'::jsonb),
    ('TSK-CD-008-P1-01', 'P06_PMDIG', 'PROVIDE_INPUT', 'PARALLEL', NULL, '{"role": "Product perspective", "input_type": "Feature and usage data"}'::jsonb),
    
    -- Phase 2
    ('TSK-CD-008-P2-01', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Operational definition approval", "decision_authority": "Measurement validity"}'::jsonb),
    ('TSK-CD-008-P2-01', 'P09_DATASCIENCE', 'REVIEW', 'AFTER_AGENT_RUNS', 'P04_BIOSTAT', '{"role": "Technical review", "focus": "Data quality and capture"}'::jsonb),
    
    -- Phase 3
    ('TSK-CD-008-P3-01', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Dose-response plan approval", "decision_authority": "Statistical methodology"}'::jsonb),
    ('TSK-CD-008-P3-01', 'P01_CMO', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical review", "focus": "Threshold clinical meaningfulness"}'::jsonb),
    
    -- Phase 4
    ('TSK-CD-008-P4-01', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Mediation plan approval", "decision_authority": "Causal inference validity"}'::jsonb),
    ('TSK-CD-008-P4-01', 'P01_CMO', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Mechanism of action review", "focus": "Clinical plausibility"}'::jsonb),
    
    -- Phase 5
    ('TSK-CD-008-P5-01', 'P05_REGAFF', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Regulatory positioning approval", "decision_authority": "FDA strategy"}'::jsonb),
    ('TSK-CD-008-P5-01', 'P01_CMO', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Strategic review", "focus": "Overall clinical narrative"}'::jsonb)
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
    -- Statistical analysis tools
    ('TSK-CD-008-P3-01', 'TOOL-R-STATS', '{"software": "R", "purpose": "Dose-response modeling", "packages": ["lme4", "nlme"]}'::jsonb),
    ('TSK-CD-008-P4-01', 'TOOL-R-STATS', '{"software": "R", "purpose": "Mediation analysis", "packages": ["mediation", "lavaan"]}'::jsonb)
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
    -- FDA digital health guidance
    ('TSK-CD-008-P1-01', 'RAG-FDA-DIGITAL-HEALTH-2022', 'FDA guidance on user engagement and feasibility', '{"focus": "Engagement requirements", "priority": "high"}'::jsonb),
    ('TSK-CD-008-P5-01', 'RAG-FDA-DIGITAL-HEALTH-2022', 'FDA digital health guidance for regulatory positioning', '{"focus": "Engagement as endpoint", "priority": "high"}'::jsonb),
    
    -- Statistical methodology
    ('TSK-CD-008-P3-01', 'RAG-ICH-E9', 'ICH E9 on statistical methodology for dose-response', '{"focus": "Dose-response analysis", "priority": "high"}'::jsonb),
    ('TSK-CD-008-P4-01', 'RAG-ICH-E9', 'ICH E9 on mediation and intermediate endpoints', '{"focus": "Causal inference", "priority": "medium"}'::jsonb)
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
  'UC-08 Dependencies Seeded' as status,
  COUNT(*) as dependency_count
FROM dh_task_dependency td
INNER JOIN dh_task t ON t.id = td.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_008';

-- Verify agent assignments
SELECT 
  'UC-08 Agent Assignments Seeded' as status,
  COUNT(*) as agent_assignment_count
FROM dh_task_agent ta
INNER JOIN dh_task t ON t.id = ta.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_008';

-- Verify persona assignments
SELECT 
  'UC-08 Persona Assignments Seeded' as status,
  COUNT(*) as persona_assignment_count
FROM dh_task_persona tp
INNER JOIN dh_task t ON t.id = tp.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_008';

-- Verify tool mappings
SELECT 
  'UC-08 Tool Mappings Seeded' as status,
  COUNT(*) as tool_mapping_count
FROM dh_task_tool tt
INNER JOIN dh_task t ON t.id = tt.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_008';

-- Verify RAG mappings
SELECT 
  'UC-08 RAG Mappings Seeded' as status,
  COUNT(*) as rag_mapping_count
FROM dh_task_rag tr
INNER JOIN dh_task t ON t.id = tr.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_008';

-- Summary
SELECT 
  'UC-08 Part 2 Complete' as status,
  (SELECT COUNT(*) FROM dh_task_dependency td
   INNER JOIN dh_task t ON t.id = td.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_008') as dependencies,
  (SELECT COUNT(*) FROM dh_task_agent ta
   INNER JOIN dh_task t ON t.id = ta.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_008') as agent_assignments,
  (SELECT COUNT(*) FROM dh_task_persona tp
   INNER JOIN dh_task t ON t.id = tp.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_008') as persona_assignments,
  (SELECT COUNT(*) FROM dh_task_tool tt
   INNER JOIN dh_task t ON t.id = tt.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_008') as tool_mappings,
  (SELECT COUNT(*) FROM dh_task_rag tr
   INNER JOIN dh_task t ON t.id = tr.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_008') as rag_mappings;

-- =====================================================================================
-- END OF UC-08 PART 2 SEED FILE
-- =====================================================================================

