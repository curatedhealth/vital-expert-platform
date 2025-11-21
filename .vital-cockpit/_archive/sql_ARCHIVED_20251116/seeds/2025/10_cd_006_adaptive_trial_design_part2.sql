-- =====================================================================================
-- 10_cd_006_adaptive_trial_design_part2.sql
-- UC_CD_006: DTx Adaptive Trial Design - Part 2: Assignments
-- =====================================================================================
-- Purpose: Seed task dependencies, agent assignments, persona assignments, tool mappings, and RAG sources
-- Dependencies: Part 1 must be run first (workflows and tasks must exist)
-- Execution Order: 10b (immediately after part 1)
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
    ('TSK-CD-006-P2-01', 'TSK-CD-006-P1-01', 'Adaptation rules based on opportunity assessment'),
    ('TSK-CD-006-P2-01', 'TSK-CD-006-P1-02', 'Rules align with strategic rationale'),
    ('TSK-CD-006-P2-02', 'TSK-CD-006-P2-01', 'Interim analyses follow adaptation rules'),
    
    -- Phase 3 depends on Phase 2
    ('TSK-CD-006-P3-01', 'TSK-CD-006-P2-01', 'Simulation design based on adaptation rules'),
    ('TSK-CD-006-P3-01', 'TSK-CD-006-P2-02', 'Simulation includes interim boundaries'),
    ('TSK-CD-006-P3-02', 'TSK-CD-006-P3-01', 'Execute simulation study design'),
    ('TSK-CD-006-P3-03', 'TSK-CD-006-P3-02', 'Analyze simulation results'),
    
    -- Phase 4 depends on design being validated
    ('TSK-CD-006-P4-01', 'TSK-CD-006-P3-03', 'DSMB charter based on validated design'),
    ('TSK-CD-006-P4-02', 'TSK-CD-006-P4-01', 'Communication follows DSMB structure'),
    
    -- Phase 5 can proceed in parallel with Phase 4
    ('TSK-CD-006-P5-01', 'TSK-CD-006-P3-03', 'Regulatory strategy based on validated design'),
    ('TSK-CD-006-P5-02', 'TSK-CD-006-P5-01', 'Protocol section follows FDA guidance'),
    
    -- Phase 6 depends on all previous phases
    ('TSK-CD-006-P6-01', 'TSK-CD-006-P4-02', 'Feasibility includes DSMB requirements'),
    ('TSK-CD-006-P6-01', 'TSK-CD-006-P5-02', 'Feasibility includes regulatory requirements'),
    ('TSK-CD-006-P6-02', 'TSK-CD-006-P6-01', 'SAP follows feasibility assessment'),
    ('TSK-CD-006-P6-02', 'TSK-CD-006-P2-02', 'SAP includes interim boundaries'),
    ('TSK-CD-006-P6-02', 'TSK-CD-006-P3-03', 'SAP references simulation results')
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
    -- Phase 1: Strategy & Rationale
    ('TSK-CD-006-P1-01', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Identify uncertainty and adaptation opportunity", "focus": "Statistical uncertainty assessment"}'::jsonb),
    ('TSK-CD-006-P1-02', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Develop strategic rationale with ROI", "focus": "Cost-benefit analysis"}'::jsonb),
    
    -- Phase 2: Design Specification
    ('TSK-CD-006-P2-01', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Define precise adaptation rules", "focus": "Decision algorithms"}'::jsonb),
    ('TSK-CD-006-P2-02', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Specify interim analyses and boundaries", "focus": "Alpha spending functions"}'::jsonb),
    
    -- Phase 3: Statistical Validation
    ('TSK-CD-006-P3-01', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Design simulation study", "focus": "Scenario planning"}'::jsonb),
    ('TSK-CD-006-P3-02', 'AGT-CLINICAL-DATA-RETRIEVER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P09_DATASCIENCE', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Run Monte Carlo simulations", "focus": "10K iterations"}'::jsonb),
    ('TSK-CD-006-P3-02', 'AGT-BIOSTATISTICS', 'VALIDATOR', 2, true, 2, 'LINEAR', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'RETRY', '{"role": "QC simulation code", "focus": "Statistical validation"}'::jsonb),
    ('TSK-CD-006-P3-03', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Analyze operating characteristics", "focus": "Type I error and power"}'::jsonb),
    
    -- Phase 4: Governance & Oversight
    ('TSK-CD-006-P4-01', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Draft DSMB charter", "focus": "Governance structure"}'::jsonb),
    ('TSK-CD-006-P4-02', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P02_VPCLIN', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Plan communication firewall", "focus": "Blinding preservation"}'::jsonb),
    
    -- Phase 5: Regulatory Strategy
    ('TSK-CD-006-P5-01', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P05_REGAFF', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Review FDA adaptive guidance", "focus": "2019 FDA guidance"}'::jsonb),
    ('TSK-CD-006-P5-02', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P05_REGAFF', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Draft protocol section", "focus": "Adaptive design specifications"}'::jsonb),
    
    -- Phase 6: Feasibility & SAP
    ('TSK-CD-006-P6-01', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P02_VPCLIN', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Assess operational feasibility", "focus": "IVRS and data management"}'::jsonb),
    ('TSK-CD-006-P6-02', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Complete comprehensive SAP", "focus": "All adaptive specifications"}'::jsonb),
    ('TSK-CD-006-P6-02', 'AGT-CLINICAL-REPORT-WRITER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Format and document SAP", "focus": "Professional documentation"}'::jsonb)
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
    ('TSK-CD-006-P1-01', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Statistical approval", "decision_authority": "Uncertainty assessment"}'::jsonb),
    ('TSK-CD-006-P1-02', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Strategic approval", "decision_authority": "ROI validation"}'::jsonb),
    ('TSK-CD-006-P1-02', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Operational review", "focus": "Feasibility check"}'::jsonb),
    
    -- Phase 2
    ('TSK-CD-006-P2-01', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Adaptation rules approval", "decision_authority": "Statistical validity"}'::jsonb),
    ('TSK-CD-006-P2-02', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Interim analysis approval", "decision_authority": "Alpha spending control"}'::jsonb),
    
    -- Phase 3
    ('TSK-CD-006-P3-01', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Simulation design approval", "decision_authority": "Scenario coverage"}'::jsonb),
    ('TSK-CD-006-P3-02', 'P09_DATASCIENCE', 'APPROVE', 'AFTER_AGENT_RUNS', 'P04_BIOSTAT', '{"role": "Simulation execution approval", "decision_authority": "Code quality"}'::jsonb),
    ('TSK-CD-006-P3-03', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Operating characteristics approval", "decision_authority": "Type I error control"}'::jsonb),
    
    -- Phase 4
    ('TSK-CD-006-P4-01', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "DSMB charter approval", "decision_authority": "Governance structure"}'::jsonb),
    ('TSK-CD-006-P4-02', 'P02_VPCLIN', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Communication protocol approval", "decision_authority": "Operational execution"}'::jsonb),
    
    -- Phase 5
    ('TSK-CD-006-P5-01', 'P05_REGAFF', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Regulatory strategy approval", "decision_authority": "FDA compliance"}'::jsonb),
    ('TSK-CD-006-P5-02', 'P05_REGAFF', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Protocol section approval", "decision_authority": "Regulatory adequacy"}'::jsonb),
    ('TSK-CD-006-P5-02', 'P04_BIOSTAT', 'REVIEW', 'AFTER_AGENT_RUNS', 'P05_REGAFF', '{"role": "Statistical review", "focus": "Technical accuracy"}'::jsonb),
    
    -- Phase 6
    ('TSK-CD-006-P6-01', 'P02_VPCLIN', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Feasibility approval", "decision_authority": "Operational execution"}'::jsonb),
    ('TSK-CD-006-P6-02', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "SAP final approval", "decision_authority": "Complete statistical methodology"}'::jsonb)
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
    -- Statistical simulation tools
    ('TSK-CD-006-P3-01', 'TOOL-R-STATS', '{"software": "R", "packages": ["gsDesign", "rpact"], "purpose": "Simulation design"}'::jsonb),
    ('TSK-CD-006-P3-02', 'TOOL-R-STATS', '{"software": "R", "purpose": "Monte Carlo simulation", "iterations": "10000"}'::jsonb),
    ('TSK-CD-006-P3-03', 'TOOL-R-STATS', '{"software": "R", "purpose": "Operating characteristics analysis"}'::jsonb),
    ('TSK-CD-006-P6-02', 'TOOL-SAS', '{"software": "SAS", "purpose": "SAP development and programming"}'::jsonb)
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
    -- FDA adaptive design guidance
    ('TSK-CD-006-P1-01', 'RAG-FDA-ADAPTIVE-2019', 'FDA 2019 guidance on adaptive designs - when appropriate', '{"focus": "Adaptive design rationale", "priority": "high"}'::jsonb),
    ('TSK-CD-006-P2-01', 'RAG-FDA-ADAPTIVE-2019', 'FDA guidance on adaptation rules and pre-specification', '{"focus": "Adaptation types", "priority": "high"}'::jsonb),
    ('TSK-CD-006-P2-02', 'RAG-FDA-ADAPTIVE-2019', 'FDA guidance on interim analyses and alpha spending', '{"focus": "Statistical boundaries", "priority": "high"}'::jsonb),
    ('TSK-CD-006-P5-01', 'RAG-FDA-ADAPTIVE-2019', 'Complete FDA 2019 adaptive design guidance', '{"focus": "Regulatory expectations", "priority": "high"}'::jsonb),
    
    -- ICH statistical guidelines
    ('TSK-CD-006-P2-02', 'RAG-ICH-E9', 'ICH E9 on statistical principles', '{"focus": "Type I error control", "priority": "high"}'::jsonb),
    ('TSK-CD-006-P6-02', 'RAG-ICH-E9', 'ICH E9 for SAP requirements', '{"focus": "Statistical methodology", "priority": "high"}'::jsonb)
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
  'UC-06 Dependencies Seeded' as status,
  COUNT(*) as dependency_count
FROM dh_task_dependency td
INNER JOIN dh_task t ON t.id = td.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_006';

-- Verify agent assignments
SELECT 
  'UC-06 Agent Assignments Seeded' as status,
  COUNT(*) as agent_assignment_count
FROM dh_task_agent ta
INNER JOIN dh_task t ON t.id = ta.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_006';

-- Verify persona assignments
SELECT 
  'UC-06 Persona Assignments Seeded' as status,
  COUNT(*) as persona_assignment_count
FROM dh_task_persona tp
INNER JOIN dh_task t ON t.id = tp.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_006';

-- Verify tool mappings
SELECT 
  'UC-06 Tool Mappings Seeded' as status,
  COUNT(*) as tool_mapping_count
FROM dh_task_tool tt
INNER JOIN dh_task t ON t.id = tt.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_006';

-- Verify RAG mappings
SELECT 
  'UC-06 RAG Mappings Seeded' as status,
  COUNT(*) as rag_mapping_count
FROM dh_task_rag tr
INNER JOIN dh_task t ON t.id = tr.task_id
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_006';

-- Summary
SELECT 
  'UC-06 Part 2 Complete' as status,
  (SELECT COUNT(*) FROM dh_task_dependency td
   INNER JOIN dh_task t ON t.id = td.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_006') as dependencies,
  (SELECT COUNT(*) FROM dh_task_agent ta
   INNER JOIN dh_task t ON t.id = ta.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_006') as agent_assignments,
  (SELECT COUNT(*) FROM dh_task_persona tp
   INNER JOIN dh_task t ON t.id = tp.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_006') as persona_assignments,
  (SELECT COUNT(*) FROM dh_task_tool tt
   INNER JOIN dh_task t ON t.id = tt.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_006') as tool_mappings,
  (SELECT COUNT(*) FROM dh_task_rag tr
   INNER JOIN dh_task t ON t.id = tr.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_006') as rag_mappings;

-- =====================================================================================
-- END OF UC-06 PART 2 SEED FILE
-- =====================================================================================

