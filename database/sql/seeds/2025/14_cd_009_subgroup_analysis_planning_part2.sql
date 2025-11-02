-- =====================================================================================
-- 14_cd_009_subgroup_analysis_planning_part2.sql
-- UC_CD_009: Subgroup Analysis Planning - Part 2: Assignments
-- =====================================================================================
-- Purpose: Seed task dependencies, agent assignments, persona assignments, tool mappings, and RAG sources
-- Dependencies: Part 1 must be run first (workflows and tasks must exist)
-- Execution Order: 14b (immediately after part 1)
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
    ('TSK-CD-009-02', 'TSK-CD-009-01', 'Interaction testing requires candidate subgroups'),
    ('TSK-CD-009-03', 'TSK-CD-009-01', 'Power calculation requires subgroup definitions'),
    ('TSK-CD-009-04', 'TSK-CD-009-02', 'SAP requires interaction testing methodology'),
    ('TSK-CD-009-04', 'TSK-CD-009-03', 'SAP requires power analysis'),
    ('TSK-CD-009-05', 'TSK-CD-009-02', 'Interpretation framework requires testing approach'),
    ('TSK-CD-009-05', 'TSK-CD-009-04', 'Decision rules integrate with SAP')
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
    -- Step 1: Identify Candidate Subgroups
    ('TSK-CD-009-01', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Identify subgroups", "focus": "Scientific rationale"}'::jsonb),
    ('TSK-CD-009-01', 'AGT-LITERATURE-SEARCH', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Literature review for precedent subgroups", "focus": "FDA precedent"}'::jsonb),
    ('TSK-CD-009-01', 'AGT-WORKFLOW-ORCHESTRATOR', 'REVIEWER', 3, true, 1, 'NONE', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Review subgroup list", "focus": "Clinical and commercial relevance"}'::jsonb),
    
    -- Step 2: Define Interaction Testing
    ('TSK-CD-009-02', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Design interaction tests", "focus": "Statistical methodology"}'::jsonb),
    
    -- Step 3: Calculate Power
    ('TSK-CD-009-03', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Subgroup power analysis", "focus": "Realistic power estimates"}'::jsonb),
    
    -- Step 4: Create SAP Section
    ('TSK-CD-009-04', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Draft SAP section", "focus": "Protocol-ready documentation"}'::jsonb),
    ('TSK-CD-009-04', 'AGT-BIOSTATISTICS', 'REVIEWER', 2, true, 1, 'NONE', true, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Review statistical methodology", "focus": "Technical accuracy"}'::jsonb),
    
    -- Step 5: Interpretation Framework
    ('TSK-CD-009-05', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P05_REGAFF', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Define decision rules", "focus": "FDA labeling strategy"}'::jsonb),
    ('TSK-CD-009-05', 'AGT-WORKFLOW-ORCHESTRATOR', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Integrate commercial considerations", "focus": "Market access"}'::jsonb)
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
    ('TSK-CD-009-01', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Subgroup list approval", "decision_authority": "Clinical and commercial rationale"}'::jsonb),
    ('TSK-CD-009-01', 'P02_VPCLIN', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Operational review", "focus": "Data collection feasibility"}'::jsonb),
    ('TSK-CD-009-01', 'P05_REGAFF', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Regulatory review", "focus": "FDA precedent"}'::jsonb),
    
    -- Step 2
    ('TSK-CD-009-02', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Statistical methodology approval", "decision_authority": "Interaction testing approach"}'::jsonb),
    
    -- Step 3
    ('TSK-CD-009-03', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Power analysis approval", "decision_authority": "Realistic expectations"}'::jsonb),
    ('TSK-CD-009-03', 'P01_CMO', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Strategic review", "focus": "Key subgroup prioritization"}'::jsonb),
    
    -- Step 4
    ('TSK-CD-009-04', 'P04_BIOSTAT', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "SAP section approval", "decision_authority": "Statistical rigor"}'::jsonb),
    ('TSK-CD-009-04', 'P05_REGAFF', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Regulatory review", "focus": "ICH E9 compliance"}'::jsonb),
    
    -- Step 5
    ('TSK-CD-009-05', 'P05_REGAFF', 'APPROVE', 'AFTER_AGENT_RUNS', 'P01_CMO', '{"role": "Interpretation framework approval", "decision_authority": "Labeling strategy"}'::jsonb),
    ('TSK-CD-009-05', 'P01_CMO', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Final decision rules approval", "decision_authority": "Executive sign-off"}'::jsonb),
    ('TSK-CD-009-05', 'P04_BIOSTAT', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Statistical review", "focus": "Interpretation validity"}'::jsonb)
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
    ('TSK-CD-009-01', 'TOOL-PUBMED', '{"database": "PubMed/MEDLINE", "purpose": "Subgroup precedent search"}'::jsonb),
    ('TSK-CD-009-01', 'TOOL-CLINTRIALS', '{"database": "ClinicalTrials.gov", "purpose": "Trial subgroup precedent"}'::jsonb),
    
    -- Statistical analysis
    ('TSK-CD-009-02', 'TOOL-R-STATS', '{"software": "R", "purpose": "Interaction testing simulation", "packages": ["stats", "survival"]}'::jsonb),
    ('TSK-CD-009-03', 'TOOL-R-STATS', '{"software": "R", "purpose": "Subgroup power calculation", "packages": ["pwr"]}'::jsonb)
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
    -- ICH E9 for subgroup analysis
    ('TSK-CD-009-01', 'RAG-ICH-E9', 'ICH E9 guidance on subgroup analysis', '{"focus": "Pre-specification requirements", "priority": "high"}'::jsonb),
    ('TSK-CD-009-02', 'RAG-ICH-E9', 'ICH E9 interaction testing methodology', '{"focus": "Statistical principles", "priority": "high"}'::jsonb),
    ('TSK-CD-009-04', 'RAG-ICH-E9', 'ICH E9 SAP requirements', '{"focus": "Documentation standards", "priority": "high"}'::jsonb),
    
    -- ICH E5 for demographic subgroups
    ('TSK-CD-009-01', 'RAG-ICH-E5', 'ICH E5 ethnic factors in drug development', '{"focus": "Demographic subgroups", "priority": "medium"}'::jsonb),
    
    -- FDA complex trial designs
    ('TSK-CD-009-05', 'RAG-FDA-DIGITAL-HEALTH-2022', 'FDA guidance on subgroup labeling for digital health', '{"focus": "Labeling strategy", "priority": "high"}'::jsonb)
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
  'UC-09 Part 2 Complete' as status,
  (SELECT COUNT(*) FROM dh_task_dependency td
   INNER JOIN dh_task t ON t.id = td.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_009') as dependencies,
  (SELECT COUNT(*) FROM dh_task_agent ta
   INNER JOIN dh_task t ON t.id = ta.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_009') as agent_assignments,
  (SELECT COUNT(*) FROM dh_task_persona tp
   INNER JOIN dh_task t ON t.id = tp.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_009') as persona_assignments,
  (SELECT COUNT(*) FROM dh_task_tool tt
   INNER JOIN dh_task t ON t.id = tt.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_009') as tool_mappings,
  (SELECT COUNT(*) FROM dh_task_rag tr
   INNER JOIN dh_task t ON t.id = tr.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_CD_009') as rag_mappings;

-- =====================================================================================
-- END OF UC-09 PART 2 SEED FILE
-- =====================================================================================

