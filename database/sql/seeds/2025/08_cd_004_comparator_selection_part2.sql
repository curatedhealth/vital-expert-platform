-- =====================================================================================
-- 08_cd_004_comparator_selection_part2.sql
-- UC_CD_004: Comparator Selection Strategy - Part 2: Assignments
-- =====================================================================================
-- Purpose: Seed task dependencies, agent assignments, persona assignments, tool mappings, and RAG sources
-- Dependencies: Part 1 must be run first (workflows and tasks must exist)
-- Execution Order: 8b (immediately after part 1)
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
    ('TSK-CD-004-P2-01', 'TSK-CD-004-P1-01', 'Regulatory precedent informs sham feasibility'),
    ('TSK-CD-004-P2-01', 'TSK-CD-004-P1-02', 'Clinical context determines sham requirements'),
    ('TSK-CD-004-P2-02', 'TSK-CD-004-P1-02', 'Clinical context identifies active controls'),
    ('TSK-CD-004-P2-03', 'TSK-CD-004-P1-01', 'Regulatory risks identified from precedent'),
    ('TSK-CD-004-P2-04', 'TSK-CD-004-P2-01', 'Sham evaluation feeds comparison'),
    ('TSK-CD-004-P2-04', 'TSK-CD-004-P2-02', 'Active control evaluation feeds comparison'),
    ('TSK-CD-004-P2-04', 'TSK-CD-004-P2-03', 'Risk assessment feeds comparison'),
    
    -- Phase 3 depends on Phase 2
    ('TSK-CD-004-P3-01', 'TSK-CD-004-P2-04', 'Decision based on comparative analysis'),
    ('TSK-CD-004-P3-02', 'TSK-CD-004-P3-01', 'Justification follows decision'),
    ('TSK-CD-004-P3-03', 'TSK-CD-004-P3-01', 'Implementation plan follows decision')
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
    -- Task P1-01: Regulatory Precedent Analysis
    ('TSK-CD-004-P1-01', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P05_REGAFF', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Regulatory precedent research", "focus": "FDA/EMA comparator decisions"}'::jsonb),
    ('TSK-CD-004-P1-01', 'AGT-LITERATURE-SEARCH', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Database search", "focus": "Regulatory databases"}'::jsonb),
    
    -- Task P1-02: Clinical Context Assessment
    ('TSK-CD-004-P1-02', 'AGT-CLINICAL-ENDPOINT', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Clinical context analysis", "focus": "Standard of care"}'::jsonb),
    ('TSK-CD-004-P1-02', 'AGT-LITERATURE-SEARCH', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Clinical guidelines search", "focus": "Treatment algorithms"}'::jsonb),
    
    -- Task P1-03: Stakeholder Input
    ('TSK-CD-004-P1-03', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Coordinate stakeholder consultations", "focus": "Input collection"}'::jsonb),
    
    -- Task P2-01: Sham App Feasibility
    ('TSK-CD-004-P2-01', 'AGT-CLINICAL-DATA-RETRIEVER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P09_DATASCIENCE', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Technical feasibility assessment", "focus": "Sham development"}'::jsonb),
    ('TSK-CD-004-P2-01', 'AGT-PROTOCOL-DESIGNER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Trial design implications", "focus": "Blinding strategy"}'::jsonb),
    
    -- Task P2-02: Active Control Evaluation
    ('TSK-CD-004-P2-02', 'AGT-CLINICAL-ENDPOINT', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Active comparator evaluation", "focus": "Clinical effectiveness"}'::jsonb),
    ('TSK-CD-004-P2-02', 'AGT-EVIDENCE-SYNTHESIZER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Evidence synthesis", "focus": "Comparator effectiveness data"}'::jsonb),
    
    -- Task P2-03: Risk Assessment Matrix
    ('TSK-CD-004-P2-03', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P05_REGAFF', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Risk identification", "focus": "Regulatory and operational risks"}'::jsonb),
    ('TSK-CD-004-P2-03', 'AGT-PROTOCOL-DESIGNER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Trial execution risks", "focus": "Operational risks"}'::jsonb),
    
    -- Task P2-04: Comparative Analysis
    ('TSK-CD-004-P2-04', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_BIOSTAT', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Comparative scoring analysis", "focus": "Weighted decision matrix"}'::jsonb),
    ('TSK-CD-004-P2-04', 'AGT-CLINICAL-DATA-RETRIEVER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Sensitivity analysis", "focus": "Scenario modeling"}'::jsonb),
    
    -- Task P3-01: Decision Framework
    ('TSK-CD-004-P3-01', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CMO', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Decision coordination", "focus": "Comparator selection"}'::jsonb),
    ('TSK-CD-004-P3-01', 'AGT-PROTOCOL-DESIGNER', 'VALIDATOR', 2, true, 2, 'LINEAR', false, 'P02_VPCLIN', 'AFTER_EXECUTION', 'RETRY', '{"role": "Trial design validation", "focus": "Feasibility check"}'::jsonb),
    
    -- Task P3-02: Justification Document
    ('TSK-CD-004-P3-02', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P11_MEDICAL_WRITER', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Document preparation", "focus": "Scientific and regulatory justification"}'::jsonb),
    ('TSK-CD-004-P3-02', 'AGT-REGULATORY-STRATEGY', 'VALIDATOR', 2, true, 2, 'LINEAR', false, 'P05_REGAFF', 'AFTER_EXECUTION', 'RETRY', '{"role": "Regulatory review", "focus": "Regulatory acceptability"}'::jsonb),
    
    -- Task P3-03: Implementation Roadmap
    ('TSK-CD-004-P3-03', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P02_VPCLIN', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Implementation planning", "focus": "Timeline and resources"}'::jsonb),
    ('TSK-CD-004-P3-03', 'AGT-PROTOCOL-DESIGNER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Trial operations planning", "focus": "Execution details"}'::jsonb)
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
  metadata = EXCLUDED.metadata;

-- =====================================================================================
-- SECTION 3: PERSONA ASSIGNMENTS
-- =====================================================================================

INSERT INTO dh_task_persona (
  tenant_id,
  task_id,
  persona_id,
  responsibility,
  is_blocking,
  review_timing,
  notification_method,
  metadata
)
SELECT
  sc.tenant_id,
  t.id as task_id,
  p.id as persona_id,
  persona_data.responsibility,
  persona_data.is_blocking,
  persona_data.review_timing,
  persona_data.notification_method,
  persona_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Task P1-01: Regulatory Precedent
    ('TSK-CD-004-P1-01', 'P05_REGAFF', 'APPROVE', true, 'AFTER_AGENT_RUNS', 'email', '{"role": "Regulatory approval", "review_focus": "Precedent accuracy"}'::jsonb),
    ('TSK-CD-004-P1-01', 'P02_VPCLIN', 'REVIEW', false, 'PARALLEL', 'email', '{"role": "Clinical development review", "review_focus": "Clinical relevance"}'::jsonb),
    
    -- Task P1-02: Clinical Context
    ('TSK-CD-004-P1-02', 'P01_CMO', 'APPROVE', true, 'AFTER_AGENT_RUNS', 'email', '{"role": "Clinical approval", "review_focus": "Standard of care accuracy"}'::jsonb),
    ('TSK-CD-004-P1-02', 'P12_CLINICAL_OPS', 'REVIEW', false, 'PARALLEL', 'email', '{"role": "Clinical research review", "review_focus": "Treatment guidelines"}'::jsonb),
    
    -- Task P1-03: Stakeholder Input
    ('TSK-CD-004-P1-03', 'P01_CMO', 'PROVIDE_INPUT', false, 'PARALLEL', 'email', '{"role": "Clinical perspective", "input_type": "Advisory board participation"}'::jsonb),
    ('TSK-CD-004-P1-03', 'P05_REGAFF', 'PROVIDE_INPUT', false, 'PARALLEL', 'email', '{"role": "Regulatory perspective", "input_type": "Regulatory acceptability input"}'::jsonb),
    ('TSK-CD-004-P1-03', 'P10_PATADV', 'PROVIDE_INPUT', false, 'PARALLEL', 'email', '{"role": "Patient perspective", "input_type": "Patient burden and acceptability"}'::jsonb),
    
    -- Task P2-01: Sham Feasibility
    ('TSK-CD-004-P2-01', 'P09_DATASCIENCE', 'APPROVE', true, 'AFTER_AGENT_RUNS', 'email', '{"role": "Technical approval", "review_focus": "Development feasibility"}'::jsonb),
    ('TSK-CD-004-P2-01', 'P02_VPCLIN', 'REVIEW', false, 'AFTER_AGENT_RUNS', 'email', '{"role": "Operations review", "review_focus": "Timeline and budget"}'::jsonb),
    
    -- Task P2-02: Active Control
    ('TSK-CD-004-P2-02', 'P01_CMO', 'APPROVE', true, 'AFTER_AGENT_RUNS', 'email', '{"role": "Clinical approval", "review_focus": "Comparator appropriateness"}'::jsonb),
    ('TSK-CD-004-P2-02', 'P04_BIOSTAT', 'REVIEW', false, 'PARALLEL', 'email', '{"role": "Statistical review", "review_focus": "Sample size implications"}'::jsonb),
    
    -- Task P2-03: Risk Assessment
    ('TSK-CD-004-P2-03', 'P05_REGAFF', 'APPROVE', true, 'AFTER_AGENT_RUNS', 'email', '{"role": "Risk approval", "review_focus": "Regulatory risk mitigation"}'::jsonb),
    ('TSK-CD-004-P2-03', 'P02_VPCLIN', 'REVIEW', false, 'PARALLEL', 'email', '{"role": "Operations review", "review_focus": "Operational risk mitigation"}'::jsonb),
    ('TSK-CD-004-P2-03', 'P13_QA', 'REVIEW', false, 'PARALLEL', 'email', '{"role": "Quality review", "review_focus": "Quality risk assessment"}'::jsonb),
    
    -- Task P2-04: Comparative Analysis
    ('TSK-CD-004-P2-04', 'P04_BIOSTAT', 'APPROVE', true, 'AFTER_AGENT_RUNS', 'email', '{"role": "Statistical approval", "review_focus": "Analysis methodology"}'::jsonb),
    ('TSK-CD-004-P2-04', 'P01_CMO', 'REVIEW', false, 'AFTER_AGENT_RUNS', 'email', '{"role": "Strategic review", "review_focus": "Decision criteria"}'::jsonb),
    
    -- Task P3-01: Decision Framework
    ('TSK-CD-004-P3-01', 'P01_CMO', 'APPROVE', true, 'AFTER_AGENT_RUNS', 'email', '{"role": "Final decision authority", "review_focus": "Strategic alignment"}'::jsonb),
    ('TSK-CD-004-P3-01', 'P02_VPCLIN', 'APPROVE', true, 'AFTER_AGENT_RUNS', 'email', '{"role": "Operations approval", "review_focus": "Feasibility"}'::jsonb),
    ('TSK-CD-004-P3-01', 'P05_REGAFF', 'REVIEW', false, 'PARALLEL', 'email', '{"role": "Regulatory review", "review_focus": "Regulatory acceptability"}'::jsonb),
    
    -- Task P3-02: Justification Document
    ('TSK-CD-004-P3-02', 'P11_MEDICAL_WRITER', 'APPROVE', true, 'AFTER_AGENT_RUNS', 'email', '{"role": "Document approval", "review_focus": "Scientific accuracy and completeness"}'::jsonb),
    ('TSK-CD-004-P3-02', 'P05_REGAFF', 'REVIEW', false, 'PARALLEL', 'email', '{"role": "Regulatory review", "review_focus": "Regulatory compliance"}'::jsonb),
    ('TSK-CD-004-P3-02', 'P01_CMO', 'REVIEW', false, 'PARALLEL', 'email', '{"role": "Clinical review", "review_focus": "Clinical rationale"}'::jsonb),
    
    -- Task P3-03: Implementation Roadmap
    ('TSK-CD-004-P3-03', 'P02_VPCLIN', 'APPROVE', true, 'AFTER_AGENT_RUNS', 'email', '{"role": "Implementation approval", "review_focus": "Resource and timeline feasibility"}'::jsonb),
    ('TSK-CD-004-P3-03', 'P13_QA', 'REVIEW', false, 'PARALLEL', 'email', '{"role": "Quality review", "review_focus": "Quality checkpoints"}'::jsonb)
) AS persona_data(
  task_code,
  persona_code,
  responsibility,
  is_blocking,
  review_timing,
  notification_method,
  metadata
)
INNER JOIN dh_task t ON t.code = persona_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_persona p ON p.code = persona_data.persona_code AND p.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, persona_id, responsibility)
DO UPDATE SET
  is_blocking = EXCLUDED.is_blocking,
  review_timing = EXCLUDED.review_timing,
  notification_method = EXCLUDED.notification_method,
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
    -- Task P1-01: Regulatory Precedent
    ('TSK-CD-004-P1-01', 'TOOL-PUBMED', '{"purpose": "FDA guidance and regulatory literature search", "search_scope": "Comparator strategies"}'::jsonb),
    ('TSK-CD-004-P1-01', 'TOOL-CLINTRIALS', '{"purpose": "FDA and EMA trial precedents", "focus": "Comparator types used"}'::jsonb),
    
    -- Task P1-02: Clinical Context
    ('TSK-CD-004-P1-02', 'TOOL-PUBMED', '{"purpose": "Clinical guidelines and standard of care literature", "focus": "Treatment algorithms"}'::jsonb),
    ('TSK-CD-004-P1-02', 'TOOL-COCHRANE', '{"purpose": "Systematic reviews of treatment effectiveness", "focus": "Standard therapies"}'::jsonb),
    
    -- Task P2-01: Sham Feasibility
    ('TSK-CD-004-P2-01', 'TOOL-R-STATS', '{"purpose": "Timeline and cost modeling", "focus": "Development estimates"}'::jsonb),
    
    -- Task P2-02: Active Control
    ('TSK-CD-004-P2-02', 'TOOL-PUBMED', '{"purpose": "Active comparator effectiveness search", "focus": "Clinical trial results"}'::jsonb),
    ('TSK-CD-004-P2-02', 'TOOL-COCHRANE', '{"purpose": "Meta-analyses of active treatments", "focus": "Comparative effectiveness"}'::jsonb),
    
    -- Task P2-04: Comparative Analysis
    ('TSK-CD-004-P2-04', 'TOOL-R-STATS', '{"purpose": "Weighted scoring analysis", "focus": "Multi-criteria decision analysis"}'::jsonb),
    ('TSK-CD-004-P2-04', 'TOOL-TREEAGE', '{"purpose": "Decision tree modeling", "focus": "Scenario analysis"}'::jsonb)
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
  is_required,
  search_config
)
SELECT 
  sc.tenant_id,
  t.id as task_id,
  rag.id as rag_source_id,
  rag_data.query_context,
  rag_data.is_required,
  rag_data.search_config
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Task P1-01: Regulatory Precedent
    ('TSK-CD-004-P1-01', 'RAG-FDA-DIGITAL-HEALTH-2022', 'What are FDA guidance requirements for comparator selection in DTx trials?', true, '{"purpose": "FDA comparator guidance", "focus": "Regulatory requirements", "max_results": 10}'::jsonb),
    ('TSK-CD-004-P1-01', 'RAG-FDA-DRUGS-DB', 'What comparator types have been accepted in similar DTx FDA submissions?', true, '{"purpose": "FDA precedent analysis", "focus": "Approved comparators", "max_results": 20}'::jsonb),
    ('TSK-CD-004-P1-01', 'RAG-ICH-E6-GCP', 'What are ICH GCP requirements for comparator selection and justification?', true, '{"purpose": "ICH GCP guidance", "focus": "Comparator standards", "max_results": 5}'::jsonb),
    
    -- Task P1-02: Clinical Context
    ('TSK-CD-004-P1-02', 'RAG-ISPOR-PRO-2011', 'What are standard of care treatments for [indication] and their clinical effectiveness?', true, '{"purpose": "Standard of care analysis", "focus": "Current treatments", "max_results": 15}'::jsonb),
    
    -- Task P2-02: Active Control
    ('TSK-CD-004-P2-02', 'RAG-ISPOR-PRO-2011', 'What is the clinical effectiveness of active comparator options for [indication]?', true, '{"purpose": "Comparator effectiveness", "focus": "Treatment outcomes", "max_results": 20}'::jsonb),
    ('TSK-CD-004-P2-02', 'RAG-FDA-DRUGS-DB', 'What are FDA-approved active treatments that could serve as comparators?', true, '{"purpose": "FDA-approved comparators", "focus": "Active control options", "max_results": 15}'::jsonb),
    
    -- Task P2-03: Risk Assessment
    ('TSK-CD-004-P2-03', 'RAG-FDA-DIGITAL-HEALTH-2022', 'What are common FDA concerns regarding comparator selection in DTx trials?', true, '{"purpose": "Regulatory risk identification", "focus": "FDA objections", "max_results": 10}'::jsonb),
    ('TSK-CD-004-P2-03', 'RAG-ICH-E6-GCP', 'What are ICH guidelines on blinding and comparator integrity?', true, '{"purpose": "GCP compliance", "focus": "Methodological risks", "max_results": 5}'::jsonb),
    
    -- Task P3-02: Justification Document
    ('TSK-CD-004-P3-02', 'RAG-FDA-DIGITAL-HEALTH-2022', 'How should comparator selection be justified in regulatory submissions?', true, '{"purpose": "Justification framework", "focus": "Regulatory expectations", "max_results": 10}'::jsonb),
    ('TSK-CD-004-P3-02', 'RAG-ICH-E6-GCP', 'What are ICH standards for documenting comparator selection rationale?', true, '{"purpose": "Documentation standards", "focus": "GCP requirements", "max_results": 5}'::jsonb)
) AS rag_data(task_code, rag_code, query_context, is_required, search_config)
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
  'UC-04 Task Dependencies' as status,
  COUNT(*) as dependency_count
FROM dh_task_dependency td
INNER JOIN dh_task t ON t.id = td.task_id
WHERE t.code LIKE 'TSK-CD-004-%';

-- Verify agent assignments
SELECT 
  'UC-04 Agent Assignments' as status,
  COUNT(*) as assignment_count
FROM dh_task_agent ta
INNER JOIN dh_task t ON t.id = ta.task_id
WHERE t.code LIKE 'TSK-CD-004-%';

-- Verify persona assignments
SELECT 
  'UC-04 Persona Assignments' as status,
  COUNT(*) as assignment_count
FROM dh_task_persona tp
INNER JOIN dh_task t ON t.id = tp.task_id
WHERE t.code LIKE 'TSK-CD-004-%';

-- Verify tool mappings
SELECT 
  'UC-04 Tool Mappings' as status,
  COUNT(*) as mapping_count
FROM dh_task_tool tt
INNER JOIN dh_task t ON t.id = tt.task_id
WHERE t.code LIKE 'TSK-CD-004-%';

-- Verify RAG mappings
SELECT 
  'UC-04 Task-RAG Mappings' as status,
  COUNT(*) as mapping_count
FROM dh_task_rag tr
INNER JOIN dh_task t ON t.id = tr.task_id
WHERE t.code LIKE 'TSK-CD-004-%';

-- Summary
SELECT 
  'UC-04 Assignments Complete' as status,
  (SELECT COUNT(*) FROM dh_task WHERE code LIKE 'TSK-CD-004-%') as total_tasks,
  (SELECT COUNT(*) FROM dh_task_dependency td INNER JOIN dh_task t ON t.id = td.task_id WHERE t.code LIKE 'TSK-CD-004-%') as dependencies,
  (SELECT COUNT(*) FROM dh_task_agent ta INNER JOIN dh_task t ON t.id = ta.task_id WHERE t.code LIKE 'TSK-CD-004-%') as agent_assignments,
  (SELECT COUNT(*) FROM dh_task_persona tp INNER JOIN dh_task t ON t.id = tp.task_id WHERE t.code LIKE 'TSK-CD-004-%') as persona_assignments,
  (SELECT COUNT(*) FROM dh_task_tool tt INNER JOIN dh_task t ON t.id = tt.task_id WHERE t.code LIKE 'TSK-CD-004-%') as tool_mappings,
  (SELECT COUNT(*) FROM dh_task_rag tr INNER JOIN dh_task t ON t.id = tr.task_id WHERE t.code LIKE 'TSK-CD-004-%') as rag_mappings;

-- =====================================================================================
-- END OF UC-04 PART 2 SEED FILE
-- =====================================================================================

