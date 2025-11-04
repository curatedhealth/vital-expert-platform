-- =====================================================================================
-- UC_RA_001: FDA Software Classification (SaMD) - COMPLETE
-- =====================================================================================
-- Purpose: Systematic determination of FDA Software as a Medical Device (SaMD) classification
-- Dependencies: Foundation agents, personas, tools, RAG sources
-- Complexity: INTERMEDIATE
-- Pattern: DECISION_TREE
-- =====================================================================================
-- This file contains:
--   - Use Case definition
--   - Workflow definition
--   - Task definitions
--   - Task dependencies
--   - Agent assignments
--   - Persona assignments
--   - Tool assignments
--   - RAG source assignments
-- =====================================================================================

-- Setup session_config for tenant lookup
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Create temp table if it doesn't exist
  CREATE TEMP TABLE IF NOT EXISTS session_config (
    tenant_id UUID,
    tenant_slug TEXT
  );
  
  -- Clear and repopulate
  DELETE FROM session_config;
  
  INSERT INTO session_config (tenant_id, tenant_slug)
  SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';
  
  SELECT tenant_id INTO v_tenant_id FROM session_config;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant "digital-health-startup" not found';
  END IF;
  RAISE NOTICE 'Using tenant_id: %', v_tenant_id;
END $$;

-- =====================================================================================
-- SECTION 1: USE CASE
-- =====================================================================================

INSERT INTO dh_use_case (
  tenant_id, code, unique_id, title, domain, description, 
  complexity, estimated_duration_minutes, prerequisites, deliverables, success_metrics
)
SELECT 
  sc.tenant_id,
  'UC_RA_001',
  'USC-RA-001',
  'FDA Software Classification (SaMD)',
  'RA',
  'Systematic approach to determining whether a digital health product meets FDA definition of Software as a Medical Device (SaMD) and requires regulatory oversight',
  'INTERMEDIATE',
  90,
  json_build_array(
    'Product description and features',
    'Intended use statement',
    'Target user information',
    'Clinical claims or indications',
    'Data processing functions'
  )::jsonb,
  json_build_array(
    'SaMD classification determination (Yes/No)',
    'Device class determination (I, II, or III if applicable)',
    'Regulatory pathway recommendation',
    'Rationale with FDA guidance citations',
    'Risk assessment report'
  )::jsonb,
  jsonb_build_object(
    'accuracy', '95% classification accuracy vs FDA precedent',
    'time_saved', '80% reduction vs manual analysis',
    'citation_quality', 'All determinations cite current FDA guidance'
  )
FROM session_config sc
ON CONFLICT (tenant_id, code) 
DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  estimated_duration_minutes = EXCLUDED.estimated_duration_minutes;

-- =====================================================================================
-- SECTION 2: WORKFLOW
-- =====================================================================================

INSERT INTO dh_workflow (
  tenant_id, use_case_id, name, unique_id, description, position, metadata
)
SELECT
  sc.tenant_id,
  uc.id,
  'FDA SaMD Classification Workflow',
  'WFL-RA-001-001',
  'Decision tree workflow for systematic FDA software classification determination',
  1,
  jsonb_build_object(
    'duration_minutes', 90,
    'complexity', 'INTERMEDIATE',
    'pattern', 'DECISION_TREE',
    'deliverables', json_build_array(
      'Classification determination',
      'Device class (if SaMD)',
      'Pathway recommendation',
      'Risk assessment'
    )
  )
FROM session_config sc
CROSS JOIN dh_use_case uc
WHERE uc.code = 'UC_RA_001' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET name = EXCLUDED.name;

-- =====================================================================================
-- SECTION 3: TASKS
-- =====================================================================================

INSERT INTO dh_task (
  tenant_id, workflow_id, code, unique_id, title, objective, position, extra
)
SELECT
  sc.tenant_id,
  wf.id,
  task_data.code,
  task_data.unique_id,
  task_data.title,
  task_data.objective,
  task_data.position,
  task_data.extra
FROM session_config sc
CROSS JOIN (VALUES
  -- Task 1: Product Analysis
  (
    'TSK-RA-001-01',
    'TSK-RA-001-01',
    'Analyze Product Description & Intended Use',
    'Extract and structure product features, intended use statement, target users, and clinical claims',
    1,
    '{"complexity": "INTERMEDIATE", "duration_minutes": 15, "deliverable": "Structured product summary"}'::jsonb
  ),
  
  -- Task 2: Device Definition Assessment
  (
    'TSK-RA-001-02',
    'TSK-RA-001-02',
    'Assess FD&C Act Section 201(h) Device Definition',
    'Determine if product meets legal definition of "device" under Federal Food, Drug, and Cosmetic Act',
    2,
    '{"complexity": "ADVANCED", "duration_minutes": 15, "deliverable": "Device definition assessment", "key_question": "Does it diagnose, cure, mitigate, treat, or prevent disease?"}'::jsonb
  ),
  
  -- Task 3: Enforcement Discretion Review
  (
    'TSK-RA-001-03',
    'TSK-RA-001-03',
    'Apply FDA Enforcement Discretion Criteria',
    'Check if product falls under FDA enforcement discretion per 2019 guidance (low risk wellness)',
    3,
    '{"complexity": "INTERMEDIATE", "duration_minutes": 15, "deliverable": "Enforcement discretion determination", "guidance": "Policy for Device Software Functions (2019)"}'::jsonb
  ),
  
  -- Task 4: Risk Level Assessment
  (
    'TSK-RA-001-04',
    'TSK-RA-001-04',
    'Determine Risk Level & Device Class',
    'Assess risk level (serious injury/death potential) and determine device class (I, II, or III)',
    4,
    '{"complexity": "ADVANCED", "duration_minutes": 20, "deliverable": "Risk assessment & class determination"}'::jsonb
  ),
  
  -- Task 5: Pathway Recommendation
  (
    'TSK-RA-001-05',
    'TSK-RA-001-05',
    'Recommend Regulatory Pathway',
    'Based on classification, recommend specific regulatory pathway (510(k), De Novo, PMA, or exempt)',
    5,
    '{"complexity": "ADVANCED", "duration_minutes": 15, "deliverable": "Pathway recommendation with rationale"}'::jsonb
  ),
  
  -- Task 6: Final Report Generation
  (
    'TSK-RA-001-06',
    'TSK-RA-001-06',
    'Generate Classification Report',
    'Compile comprehensive classification report with citations, precedent analysis, and recommendations',
    6,
    '{"complexity": "INTERMEDIATE", "duration_minutes": 10, "deliverable": "FDA SaMD Classification Report (5-8 pages)"}'::jsonb
  )
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf
WHERE wf.unique_id = 'WFL-RA-001-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET title = EXCLUDED.title;

-- =====================================================================================
-- SECTION 4: TASK DEPENDENCIES
-- =====================================================================================

INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id, dependency_type)
SELECT
  sc.tenant_id,
  t_curr.id,
  t_prev.id,
  'BLOCKS'
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-001-02', 'TSK-RA-001-01'),  -- Device definition depends on product analysis
  ('TSK-RA-001-03', 'TSK-RA-001-02'),  -- Enforcement discretion depends on device definition
  ('TSK-RA-001-04', 'TSK-RA-001-03'),  -- Risk assessment depends on enforcement discretion
  ('TSK-RA-001-05', 'TSK-RA-001-04'),  -- Pathway recommendation depends on risk assessment
  ('TSK-RA-001-06', 'TSK-RA-001-05')   -- Report generation depends on pathway recommendation
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, depends_on_task_id) DO NOTHING;

-- =====================================================================================
-- SECTION 5: AGENT ASSIGNMENTS
-- =====================================================================================

INSERT INTO dh_task_agent (
  tenant_id, task_id, agent_id, assignment_type, execution_order,
  requires_human_approval, max_retries, retry_strategy, is_parallel,
  approval_persona_code, approval_stage, on_failure, metadata
)
SELECT
  sc.tenant_id,
  t.id,
  a.id,
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
CROSS JOIN (VALUES
  -- Task 1: Product Analysis
  ('TSK-RA-001-01', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Extract and structure product information"}'::jsonb),
  
  -- Task 2: Device Definition Assessment
  ('TSK-RA-001-02', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Apply FD&C Act 201(h) definition"}'::jsonb),
  ('TSK-RA-001-02', 'AGT-REGULATORY-INTELLIGENCE', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Retrieve FDA guidance and precedent"}'::jsonb),
  
  -- Task 3: Enforcement Discretion
  ('TSK-RA-001-03', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Apply 2019 enforcement discretion criteria"}'::jsonb),
  ('TSK-RA-001-03', 'AGT-REGULATORY-INTELLIGENCE', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Find similar enforcement discretion examples"}'::jsonb),
  
  -- Task 4: Risk Assessment
  ('TSK-RA-001-04', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Assess risk level and determine device class"}'::jsonb),
  ('TSK-RA-001-04', 'AGT-REGULATORY-COMPLIANCE', 'VALIDATOR', 2, false, 1, 'NONE', false, NULL, NULL, 'FAIL', '{"role": "Validate risk classification"}'::jsonb),
  
  -- Task 5: Pathway Recommendation
  ('TSK-RA-001-05', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Recommend optimal pathway"}'::jsonb),
  ('TSK-RA-001-05', 'AGT-DECISION-SYNTHESIZER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Synthesize pathway pros/cons"}'::jsonb),
  
  -- Task 6: Report Generation
  ('TSK-RA-001-06', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Generate classification report"}'::jsonb),
  ('TSK-RA-001-06', 'AGT-DOCUMENT-VALIDATOR', 'VALIDATOR', 2, false, 1, 'NONE', false, NULL, NULL, 'FAIL', '{"role": "Validate report completeness"}'::jsonb)
) AS agent_data(
  task_code, agent_code, assignment_type, execution_order, requires_human_approval,
  max_retries, retry_strategy, is_parallel, approval_persona_code, approval_stage, on_failure, metadata
)
INNER JOIN dh_task t ON t.code = agent_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_agent a ON a.code = agent_data.agent_code AND a.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, agent_id, assignment_type)
DO UPDATE SET execution_order = EXCLUDED.execution_order;

-- =====================================================================================
-- SECTION 6: PERSONA ASSIGNMENTS
-- =====================================================================================

INSERT INTO dh_task_persona (
  tenant_id, task_id, persona_id, responsibility, review_timing,
  escalation_to_persona_code, metadata
)
SELECT
  sc.tenant_id,
  t.id,
  p.id,
  persona_data.responsibility,
  persona_data.review_timing,
  persona_data.escalation_to_persona_code,
  persona_data.metadata
FROM session_config sc
CROSS JOIN (VALUES
  -- Task 2: Device Definition - Regulatory Affairs Director approval
  ('TSK-RA-001-02', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P03_REGDIR', '{"role": "Approve device definition assessment"}'::jsonb),
  
  -- Task 3: Enforcement Discretion - Regulatory Affairs Director approval
  ('TSK-RA-001-03', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P03_REGDIR', '{"role": "Approve enforcement discretion determination"}'::jsonb),
  
  -- Task 4: Risk Assessment - Regulatory Affairs Director approval + QA review
  ('TSK-RA-001-04', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P03_REGDIR', '{"role": "Approve risk classification"}'::jsonb),
  ('TSK-RA-001-04', 'P05_REGAFF', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Review risk assessment methodology"}'::jsonb),
  
  -- Task 5: Pathway Recommendation - Senior regulatory review
  ('TSK-RA-001-05', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P03_REGDIR', '{"role": "Approve pathway recommendation"}'::jsonb),
  ('TSK-RA-001-05', 'P03_REGDIR', 'CONSULT', 'AFTER_AGENT_RUNS', NULL, '{"role": "Strategic regulatory guidance"}'::jsonb),
  
  -- Task 6: Final Report - Regulatory Director approval
  ('TSK-RA-001-06', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Final report approval"}'::jsonb),
  ('TSK-RA-001-06', 'P05_REGAFF', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Technical review of report"}'::jsonb)
) AS persona_data(
  task_code, persona_code, responsibility, review_timing, escalation_to_persona_code, metadata
)
INNER JOIN dh_task t ON t.code = persona_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_persona p ON p.code = persona_data.persona_code AND p.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, persona_id, responsibility)
DO UPDATE SET review_timing = EXCLUDED.review_timing;

-- =====================================================================================
-- SECTION 7: TOOL ASSIGNMENTS
-- =====================================================================================

INSERT INTO dh_task_tool (
  tenant_id, task_id, tool_id, purpose
)
SELECT
  sc.tenant_id,
  t.id,
  tool.id,
  tool_data.purpose
FROM session_config sc
CROSS JOIN (VALUES
  -- Task 2: Regulatory database access
  ('TSK-RA-001-02', 'TOOL-REGULATORY-DB', 'Access FDA guidance documents'),
  
  -- Task 3: Literature and precedent search
  ('TSK-RA-001-03', 'TOOL-LITERATURE-DB', 'Find enforcement discretion precedents'),
  
  -- Task 6: Document management for report
  ('TSK-RA-001-06', 'TOOL-DOCUMENT-MGMT', 'Generate final report')
) AS tool_data(task_code, tool_code, purpose)
INNER JOIN dh_task t ON t.code = tool_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_tool tool ON tool.code = tool_data.tool_code AND tool.tenant_id = sc.tenant_id
ON CONFLICT (task_id, tool_id)
DO UPDATE SET purpose = EXCLUDED.purpose;

-- =====================================================================================
-- SECTION 8: RAG SOURCE ASSIGNMENTS
-- =====================================================================================

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, note
)
SELECT
  sc.tenant_id,
  t.id,
  rag.id,
  rag_data.note
FROM session_config sc
CROSS JOIN (VALUES
  -- Task 2: FDA FD&C Act guidance
  ('TSK-RA-001-02', 'RAG-FDA-GUIDANCE', 
   'FD&C Act Section 201(h) device definition, Software as Medical Device guidance'),
  
  -- Task 3: FDA enforcement discretion guidance
  ('TSK-RA-001-03', 'RAG-FDA-DIGITAL-HEALTH',
   'FDA enforcement discretion policy 2019, wellness app guidance, low-risk device guidance'),
  
  -- Task 4: Risk classification guidance
  ('TSK-RA-001-04', 'RAG-FDA-GUIDANCE',
   'Device classification by risk level, Class I II III criteria, 510(k) exemption criteria'),
  
  -- Task 5: Regulatory pathway guidance
  ('TSK-RA-001-05', 'RAG-FDA-GUIDANCE',
   '510(k) requirements, De Novo pathway, PMA requirements, device classification regulation'),
  
  -- Task 5: Digital health precedent
  ('TSK-RA-001-05', 'RAG-FDA-DIGITAL-HEALTH',
   'DTx regulatory precedents, digital therapeutics pathways, SaMD classification examples')
) AS rag_data(task_code, rag_code, note)
INNER JOIN dh_task t ON t.code = rag_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_rag_source rag ON rag.code = rag_data.rag_code AND rag.tenant_id = sc.tenant_id
ON CONFLICT (task_id, rag_source_id)
DO UPDATE SET note = EXCLUDED.note;

-- =====================================================================================
-- VERIFICATION
-- =====================================================================================

SELECT 
  'UC_RA_001 COMPLETE' as status,
  COUNT(DISTINCT t.id) as tasks,
  COUNT(DISTINCT td.id) as dependencies,
  COUNT(DISTINCT ta.id) as agent_assignments,
  COUNT(DISTINCT tp.id) as persona_assignments,
  COUNT(DISTINCT tt.id) as tool_assignments,
  COUNT(DISTINCT tr.id) as rag_assignments
FROM dh_use_case uc
CROSS JOIN dh_workflow wf
LEFT JOIN dh_task t ON t.workflow_id = wf.id
LEFT JOIN dh_task_dependency td ON td.task_id = t.id
LEFT JOIN dh_task_agent ta ON ta.task_id = t.id
LEFT JOIN dh_task_persona tp ON tp.task_id = t.id
LEFT JOIN dh_task_tool tt ON tt.task_id = t.id
LEFT JOIN dh_task_rag tr ON tr.task_id = t.id
WHERE uc.code = 'UC_RA_001'
  AND wf.use_case_id = uc.id
  AND uc.tenant_id = (SELECT tenant_id FROM session_config);

