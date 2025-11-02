-- =====================================================================================
-- 16_ma_001_value_dossier_part2.sql
-- UC_MA_001: Payer Value Dossier Development - Part 2: Assignments
-- =====================================================================================
-- Purpose: Seed task dependencies, agent assignments, persona assignments, tool mappings, and RAG sources
-- Dependencies: Part 1 must be run first (workflows and tasks must exist)
-- Execution Order: 16b (immediately after part 1)
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
    ('TSK-MA-001-02', 'TSK-MA-001-01', 'Clinical synthesis requires value strategy'),
    ('TSK-MA-001-03', 'TSK-MA-001-01', 'CEA model requires value positioning'),
    ('TSK-MA-001-03', 'TSK-MA-001-02', 'CEA model uses clinical evidence'),
    ('TSK-MA-001-04', 'TSK-MA-001-01', 'BIM requires market understanding'),
    ('TSK-MA-001-04', 'TSK-MA-001-02', 'BIM uses clinical outcomes'),
    ('TSK-MA-001-05', 'TSK-MA-001-02', 'Dossier assembly requires clinical evidence'),
    ('TSK-MA-001-05', 'TSK-MA-001-03', 'Dossier includes CEA model'),
    ('TSK-MA-001-05', 'TSK-MA-001-04', 'Dossier includes BIM'),
    ('TSK-MA-001-06', 'TSK-MA-001-05', 'Review requires complete dossier'),
    ('TSK-MA-001-07', 'TSK-MA-001-06', 'Engagement strategy follows approval'),
    ('TSK-MA-001-08', 'TSK-MA-001-05', 'P&T presentation uses dossier content'),
    ('TSK-MA-001-08', 'TSK-MA-001-07', 'P&T materials align with engagement plan')
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
    -- Step 1: Value Strategy
    ('TSK-MA-001-01', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P21_MA_DIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Coordinate value strategy", "focus": "Competitive analysis"}'::jsonb),
    ('TSK-MA-001-01', 'AGT-LITERATURE-SEARCH', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Competitive intelligence", "focus": "Payer landscape"}'::jsonb),
    
    -- Step 2: Clinical Evidence
    ('TSK-MA-001-02', 'AGT-EVIDENCE-SYNTHESIZER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P23_MED_AFF', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Clinical evidence synthesis", "focus": "Payer relevance"}'::jsonb),
    ('TSK-MA-001-02', 'AGT-LITERATURE-SEARCH', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Literature search", "focus": "Clinical trials and RWE"}'::jsonb),
    
    -- Step 3: CEA Model
    ('TSK-MA-001-03', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P22_HEOR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Build CEA model", "focus": "ICER calculation"}'::jsonb),
    
    -- Step 4: BIM
    ('TSK-MA-001-04', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P22_HEOR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Build budget impact model", "focus": "PMPM calculation"}'::jsonb),
    
    -- Step 5: Dossier Assembly
    ('TSK-MA-001-05', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P21_MA_DIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Assemble AMCP dossier", "focus": "Format 4.0 compliance"}'::jsonb),
    
    -- Step 6: Review
    ('TSK-MA-001-06', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P23_MED_AFF', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Coordinate review", "focus": "Medical and regulatory"}'::jsonb),
    
    -- Step 7: Engagement Strategy
    ('TSK-MA-001-07', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P24_PAYER_REL', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Payer engagement planning", "focus": "Target payer prioritization"}'::jsonb),
    
    -- Step 8: P&T Presentation
    ('TSK-MA-001-08', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P21_MA_DIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Create P&T deck", "focus": "Compelling value story"}'::jsonb)
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
    ('TSK-MA-001-01', 'P21_MA_DIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Value strategy approval", "decision_authority": "Market access strategy"}'::jsonb),
    ('TSK-MA-001-01', 'P01_CMO', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical strategy alignment", "focus": "Value pillars"}'::jsonb),
    
    -- Step 2
    ('TSK-MA-001-02', 'P23_MED_AFF', 'APPROVE', 'AFTER_AGENT_RUNS', 'P21_MA_DIR', '{"role": "Clinical evidence approval", "decision_authority": "Medical accuracy"}'::jsonb),
    ('TSK-MA-001-02', 'P01_CMO', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical review", "focus": "Evidence quality"}'::jsonb),
    
    -- Step 3
    ('TSK-MA-001-03', 'P22_HEOR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P21_MA_DIR', '{"role": "CEA model approval", "decision_authority": "Economic methodology"}'::jsonb),
    ('TSK-MA-001-03', 'P04_BIOSTAT', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Statistical review", "focus": "Model validation"}'::jsonb),
    
    -- Step 4
    ('TSK-MA-001-04', 'P22_HEOR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "BIM approval", "decision_authority": "PMPM credibility"}'::jsonb),
    ('TSK-MA-001-04', 'P21_MA_DIR', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Strategic review", "focus": "Payer acceptability"}'::jsonb),
    
    -- Step 5
    ('TSK-MA-001-05', 'P21_MA_DIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Dossier approval", "decision_authority": "Final dossier"}'::jsonb),
    ('TSK-MA-001-05', 'P22_HEOR', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Economic sections review", "focus": "HEOR accuracy"}'::jsonb),
    ('TSK-MA-001-05', 'P23_MED_AFF', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical sections review", "focus": "Medical accuracy"}'::jsonb),
    
    -- Step 6
    ('TSK-MA-001-06', 'P23_MED_AFF', 'APPROVE', 'AFTER_AGENT_RUNS', 'P21_MA_DIR', '{"role": "Medical review approval", "decision_authority": "Medical accuracy"}'::jsonb),
    ('TSK-MA-001-06', 'P05_REGAFF', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Regulatory compliance review", "focus": "Promotional guidelines"}'::jsonb),
    
    -- Step 7
    ('TSK-MA-001-07', 'P24_PAYER_REL', 'APPROVE', 'AFTER_AGENT_RUNS', 'P21_MA_DIR', '{"role": "Engagement plan approval", "decision_authority": "Payer targeting"}'::jsonb),
    ('TSK-MA-001-07', 'P21_MA_DIR', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Strategic alignment review", "focus": "Commercial strategy"}'::jsonb),
    
    -- Step 8
    ('TSK-MA-001-08', 'P21_MA_DIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "P&T presentation approval", "decision_authority": "Final presentation"}'::jsonb),
    ('TSK-MA-001-08', 'P23_MED_AFF', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical accuracy review", "focus": "Claims validation"}'::jsonb)
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
    ('TSK-MA-001-01', 'TOOL-PUBMED', '{"database": "PubMed/MEDLINE", "purpose": "Competitive intelligence"}'::jsonb),
    ('TSK-MA-001-02', 'TOOL-PUBMED', '{"database": "PubMed/MEDLINE", "purpose": "Clinical evidence search"}'::jsonb),
    ('TSK-MA-001-02', 'TOOL-COCHRANE', '{"database": "Cochrane Library", "purpose": "Systematic reviews"}'::jsonb),
    ('TSK-MA-001-02', 'TOOL-CLINTRIALS', '{"database": "ClinicalTrials.gov", "purpose": "Trial data"}'::jsonb),
    
    -- Statistical tools for modeling
    ('TSK-MA-001-03', 'TOOL-R-STATS', '{"software": "R", "purpose": "CEA modeling", "packages": ["demography", "survival"]}'::jsonb),
    ('TSK-MA-001-04', 'TOOL-R-STATS', '{"software": "R", "purpose": "Budget impact modeling"}'::jsonb)
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
    -- AMCP Format guidance
    ('TSK-MA-001-05', 'RAG-AMCP-FORMAT', 'AMCP Format 4.0 dossier structure and requirements', '{"focus": "Dossier sections", "priority": "high"}'::jsonb),
    
    -- ISPOR guidelines for health economics
    ('TSK-MA-001-03', 'RAG-ISPOR-CEA', 'ISPOR cost-effectiveness analysis guidelines', '{"focus": "CEA methodology", "priority": "high"}'::jsonb),
    ('TSK-MA-001-04', 'RAG-ISPOR-BIM', 'ISPOR budget impact model guidelines', '{"focus": "BIM methodology", "priority": "high"}'::jsonb),
    
    -- NICE methods guide
    ('TSK-MA-001-03', 'RAG-NICE-METHODS', 'NICE methods guide for health technology evaluation', '{"focus": "HTA standards", "priority": "medium"}'::jsonb)
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
  'MA-001 Part 2 Complete' as status,
  (SELECT COUNT(*) FROM dh_task_dependency td
   INNER JOIN dh_task t ON t.id = td.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_MA_001') as dependencies,
  (SELECT COUNT(*) FROM dh_task_agent ta
   INNER JOIN dh_task t ON t.id = ta.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_MA_001') as agent_assignments,
  (SELECT COUNT(*) FROM dh_task_persona tp
   INNER JOIN dh_task t ON t.id = tp.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_MA_001') as persona_assignments,
  (SELECT COUNT(*) FROM dh_task_tool tt
   INNER JOIN dh_task t ON t.id = tt.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_MA_001') as tool_mappings,
  (SELECT COUNT(*) FROM dh_task_rag tr
   INNER JOIN dh_task t ON t.id = tr.task_id
   INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
   INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
   WHERE uc.code = 'UC_MA_001') as rag_mappings;

-- =====================================================================================
-- END OF UC-MA-001 PART 2 SEED FILE
-- =====================================================================================

