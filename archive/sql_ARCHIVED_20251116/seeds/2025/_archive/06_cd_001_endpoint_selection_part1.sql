-- =====================================================================================
-- 06_cd_001_endpoint_selection.sql
-- UC-01: DTx Clinical Endpoint Selection & Validation
-- =====================================================================================
-- Purpose: Seed workflows, tasks, and assignments for UC-01
-- Dependencies: 
--   - 00_foundation_agents.sql (17 agents)
--   - 01_foundation_personas.sql (33 personas)
--   - 02_foundation_tools.sql (17 tools)
--   - 03_foundation_rag_sources.sql (24 RAG sources)
--   - 04_foundation_kpis.sql (19 KPIs)
--   - 05_domains_usecases.sql (Clinical Development domain and use cases)
-- Execution Order: 6 (after all foundations)
-- =====================================================================================
--
-- USE CASE STRUCTURE:
-- - 5 Phases (Workflows)
-- - 13 Tasks (Steps/Prompts)
-- - Persona assignments for human review
-- - Agent assignments for AI execution
-- - Tool mappings for resources
-- - RAG source mappings for knowledge
-- - Task dependencies for sequencing
-- - KPI targets for performance measurement
-- =====================================================================================

-- =====================================================================================
-- SECTION 0: TENANT LOOKUP & SESSION CONFIGURATION
-- =====================================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_tenant_slug TEXT := 'digital-health-startup';
BEGIN
  SELECT id INTO v_tenant_id 
  FROM tenants 
  WHERE slug = v_tenant_slug;
  
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant with slug "%" not found. Please create tenant first.', v_tenant_slug;
  END IF;
  
  RAISE NOTICE 'Using tenant: % (ID: %)', v_tenant_slug, v_tenant_id;
END $$;

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
-- SECTION 1: WORKFLOWS (5 Phases)
-- =====================================================================================

INSERT INTO dh_workflow (
  tenant_id,
  use_case_id,
  name,
  description,
  position,
  metadata
)
SELECT
  sc.tenant_id,
  uc.id as use_case_id,
  wf_data.name,
  wf_data.description,
  wf_data.position,
  wf_data.metadata
FROM session_config sc
CROSS JOIN dh_use_case uc
CROSS JOIN (
  VALUES
    -- Phase 1: Foundation & Context
    (
      'Phase 1: Foundation & Context',
      'Establish clear clinical context and identify patient-centered outcomes',
      1,
      jsonb_build_object(
        'duration_range', '45-60 minutes',
        'estimated_duration_hours', 1.0,
        'primary_personas', json_build_array('P01_CMO', 'P10_PATADV'),
        'key_activities', json_build_array(
          'Define clinical context',
          'Identify patient-centered outcomes'
        ),
        'deliverables', json_build_array(
          'Clinical Context Document (2-3 pages)',
          'Patient-Centered Outcome Priorities (1-2 pages)'
        ),
        'success_criteria', json_build_array(
          'Clinical problem clearly defined',
          'Target population well-specified',
          'Patient voice represented'
        )
      )
    ),
    
    -- Phase 2: Research & Precedent Analysis
    (
      'Phase 2: Research & Precedent Analysis',
      'Research regulatory precedent and review FDA guidance for digital health endpoints',
      2,
      jsonb_build_object(
        'estimated_duration_hours', 1.0,
        'duration_range', '45-60 minutes',
        'primary_personas', json_build_array('P02_VPCLIN', 'P05_REGAFF'),
        'key_activities', json_build_array(
          'DTx regulatory precedent research',
          'FDA guidance document review'
        ),
        'deliverables', json_build_array(
          'DTx Regulatory Precedent Analysis (3-4 pages)',
          'FDA Guidance Summary & Regulatory Strategy (2-3 pages)'
        ),
        'success_criteria', json_build_array(
          'At least 3-5 precedent DTx products identified',
          'FDA expectations clearly understood',
          'Regulatory risks identified'
        )
      )
    ),
    
    -- Phase 3: Endpoint Identification
    (
      'WFL-CD-001-P3',
      'Phase 3: Endpoint Identification',
      'Generate and evaluate primary and secondary endpoint candidates',
      3,
      0.75,
      jsonb_build_object(
        'duration_range', '40-50 minutes',
        'primary_personas', json_build_array('P01_CMO', 'P04_BIOSTAT'),
        'key_activities', json_build_array(
          'Identify primary endpoint candidates',
          'Develop secondary endpoint package'
        ),
        'deliverables', json_build_array(
          'Primary Endpoint Candidate Analysis (4-5 pages)',
          'Secondary Endpoint Strategy (3-4 pages)'
        ),
        'success_criteria', json_build_array(
          '2-3 strong candidates identified',
          'Each has regulatory precedent',
          '3-5 secondary endpoints defined'
        )
      )
    ),
    
    -- Phase 4: Validation & Feasibility
    (
      'WFL-CD-001-P4',
      'Phase 4: Validation & Feasibility',
      'Assess psychometric properties, digital feasibility, and patient burden',
      4,
      1.17,
      jsonb_build_object(
        'duration_range', '60-70 minutes',
        'primary_personas', json_build_array('P04_BIOSTAT', 'P06_PMDIG', 'P10_PATADV'),
        'key_activities', json_build_array(
          'Evaluate psychometric properties',
          'Assess digital implementation feasibility',
          'Evaluate patient burden'
        ),
        'deliverables', json_build_array(
          'Psychometric Properties Assessment (4-5 pages)',
          'Digital Implementation Feasibility Analysis (3-4 pages)',
          'Patient Burden Analysis (2-3 pages)'
        ),
        'success_criteria', json_build_array(
          'Reliability data documented (α > 0.70)',
          'Technical feasibility confirmed',
          'Patient burden acceptable (<15 min)'
        )
      )
    ),
    
    -- Phase 5: Risk & Decision
    (
      'WFL-CD-001-P5',
      'Phase 5: Risk & Decision',
      'Assess regulatory risk and make final endpoint recommendation',
      5,
      0.83,
      jsonb_build_object(
        'duration_range', '50-60 minutes',
        'primary_personas', json_build_array('P05_REGAFF', 'P01_CMO'),
        'key_activities', json_build_array(
          'Regulatory risk assessment',
          'Final recommendation and decision',
          'Stakeholder communication preparation'
        ),
        'deliverables', json_build_array(
          'Regulatory Risk Assessment & Mitigation Plan (3-4 pages)',
          'Final Endpoint Selection Report (20-30 pages)',
          'Executive Summary (2-3 pages)',
          'Stakeholder Presentation (12-15 slides)'
        ),
        'success_criteria', json_build_array(
          'Clear primary endpoint recommendation',
          'Risks and mitigation strategies documented',
          'Stakeholder materials prepared'
        )
      )
    )
) AS wf_data(
  code, name, description, position, estimated_duration_hours, metadata
)
WHERE uc.tenant_id = sc.tenant_id
  AND uc.code = 'UC_CD_001'
ON CONFLICT (tenant_id, use_case_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  estimated_duration_hours = EXCLUDED.estimated_duration_hours,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 2: TASKS (13 Steps/Prompts)
-- =====================================================================================

INSERT INTO dh_task (
  tenant_id,
  workflow_id,
  code,
  name,
  description,
  position,
  extra
)
SELECT
  sc.tenant_id,
  wf.id as workflow_id,
  t_data.task_code,
  t_data.task_name,
  t_data.description,
  t_data.position,
  t_data.extra
FROM session_config sc
CROSS JOIN dh_workflow wf
CROSS JOIN (
  VALUES
    -- PHASE 1 TASKS
    (
      'WFL-CD-001-P1',
      'TSK-CD-001-P1-01',
      'Define Clinical Context',
      'Establish clear understanding of clinical problem, target population, and intervention approach. Execute Prompt 1.1.1.',
      1,
      jsonb_build_object(
        'prompt_id', '1.1.1',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 30,
        'persona_lead', 'P01_CMO',
        'persona_support', json_build_array('P10_PATADV'),
        'prerequisites', json_build_array(
          'DTx product description',
          'Indication/target condition',
          'Mechanism of action',
          'Target population characteristics'
        ),
        'deliverable', 'Clinical Context Document (2-3 pages)',
        'quality_checks', json_build_array(
          'Clinical problem clearly defined',
          'Target population well-specified',
          'Intervention mechanism understood',
          'Current standard of care documented',
          'Patient perspective incorporated'
        )
      )
    ),
    (
      'WFL-CD-001-P1',
      'TSK-CD-001-P1-02',
      'Identify Patient-Centered Outcomes',
      'Identify outcomes that matter most to patients (not just clinicians). Execute Prompt 1.1.2.',
      2,
      jsonb_build_object(
        'prompt_id', '1.1.2',
        'complexity', 'BASIC',
        'estimated_duration_minutes', 20,
        'persona_lead', 'P10_PATADV',
        'persona_support', json_build_array('P01_CMO'),
        'prerequisites', json_build_array(
          'Clinical Context Document from Task 1',
          'Understanding of patient experience with condition'
        ),
        'deliverable', 'Patient-Centered Outcome Priorities (1-2 pages)',
        'quality_checks', json_build_array(
          'Patient voice clearly represented',
          'Functional outcomes included',
          'Quality of life considerations documented',
          'Outcomes are measurable',
          'Alignment/gaps with clinical view noted'
        )
      )
    ),
    
    -- PHASE 2 TASKS
    (
      'WFL-CD-001-P2',
      'TSK-CD-001-P2-01',
      'Research DTx Regulatory Precedent',
      'Identify what endpoints FDA has accepted for similar DTx products. Execute Prompt 2.1.1.',
      1,
      jsonb_build_object(
        'prompt_id', '2.1.1',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 30,
        'persona_lead', 'P02_VPCLIN',
        'persona_support', json_build_array('P05_REGAFF'),
        'prerequisites', json_build_array(
          'Clinical Context Document',
          'Access to FDA databases (510(k), De Novo)'
        ),
        'deliverable', 'DTx Regulatory Precedent Analysis (3-4 pages)',
        'quality_checks', json_build_array(
          'At least 3-5 precedent DTx products identified',
          'Endpoints clearly documented',
          'FDA acceptance confirmed',
          'Measurement approaches understood',
          'Gaps identified if no direct precedent'
        )
      )
    ),
    (
      'WFL-CD-001-P2-02',
      'TSK-CD-001-P2-02',
      'Review FDA Guidance Documents',
      'Understand FDA current thinking on digital health endpoints. Execute Prompt 2.2.1.',
      2,
      jsonb_build_object(
        'prompt_id', '2.2.1',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 20,
        'persona_lead', 'P05_REGAFF',
        'prerequisites', json_build_array(
          'DTx Precedent Analysis',
          'Access to FDA guidance documents'
        ),
        'deliverable', 'FDA Guidance Summary & Regulatory Strategy (2-3 pages)',
        'quality_checks', json_build_array(
          'Key guidance documents reviewed',
          'FDA expectations clearly understood',
          'Regulatory risks identified',
          'Pre-Sub meeting need assessed',
          'Areas requiring validation noted'
        )
      )
    ),
    
    -- PHASE 3 TASKS
    (
      'WFL-CD-001-P3',
      'TSK-CD-001-P3-01',
      'Identify Primary Endpoint Candidates',
      'Generate 2-3 strong candidate primary endpoints. Execute Prompt 3.1.1.',
      1,
      jsonb_build_object(
        'prompt_id', '3.1.1',
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 25,
        'persona_lead', 'P01_CMO',
        'persona_support', json_build_array('P04_BIOSTAT'),
        'prerequisites', json_build_array(
          'Clinical Context Document',
          'Patient-Centered Outcome Priorities',
          'DTx Regulatory Precedent Analysis',
          'FDA Guidance Summary'
        ),
        'deliverable', 'Primary Endpoint Candidate Analysis (4-5 pages)',
        'quality_checks', json_build_array(
          '2-3 strong candidates identified',
          'Each has regulatory precedent or clear validation path',
          'Clinical meaningfulness documented',
          'Psychometric data available',
          'Rationale clearly articulated'
        )
      )
    ),
    (
      'WFL-CD-001-P3',
      'TSK-CD-001-P3-02',
      'Develop Secondary Endpoint Package',
      'Identify 3-5 secondary endpoints that support commercial value story. Execute Prompt 3.2.1.',
      2,
      jsonb_build_object(
        'prompt_id', '3.2.1',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 20,
        'persona_lead', 'P01_CMO',
        'persona_support', json_build_array('P02_VPCLIN'),
        'prerequisites', json_build_array(
          'Primary Endpoint Candidate Analysis',
          'Understanding of payer priorities',
          'Commercial strategy if available'
        ),
        'deliverable', 'Secondary Endpoint Strategy (3-4 pages)',
        'quality_checks', json_build_array(
          '3-5 secondary endpoints identified',
          'Each serves a clear purpose',
          'Mix of regulatory and commercial value',
          'Patient burden acceptable',
          'Aligned with commercial strategy'
        )
      )
    ),
    
    -- PHASE 4 TASKS
    (
      'WFL-CD-001-P4',
      'TSK-CD-001-P4-01',
      'Evaluate Psychometric Properties',
      'Assess psychometric strength of each candidate endpoint. Execute Prompt 4.1.1.',
      1,
      jsonb_build_object(
        'prompt_id', '4.1.1',
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 25,
        'persona_lead', 'P04_BIOSTAT',
        'prerequisites', json_build_array(
          'Primary Endpoint Candidate Analysis',
          'Secondary Endpoint Strategy',
          'Access to published psychometric data'
        ),
        'deliverable', 'Psychometric Properties Assessment (4-5 pages with tables)',
        'quality_checks', json_build_array(
          'Reliability data documented (α > 0.70 minimum)',
          'Validity evidence summarized',
          'Responsiveness to change demonstrated',
          'MCID established or estimable',
          'Validation gaps identified'
        )
      )
    ),
    (
      'WFL-CD-001-P4',
      'TSK-CD-001-P4-02',
      'Assess Digital Implementation Feasibility',
      'Confirm each endpoint can be implemented in digital platform. Execute Prompt 4.2.1.',
      2,
      jsonb_build_object(
        'prompt_id', '4.2.1',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 20,
        'persona_lead', 'P06_PMDIG',
        'prerequisites', json_build_array(
          'Endpoint candidate list',
          'Current DTx platform capabilities',
          'Roadmap for platform enhancements'
        ),
        'deliverable', 'Digital Implementation Feasibility Analysis (3-4 pages)',
        'quality_checks', json_build_array(
          'Technical feasibility assessed for each endpoint',
          'Development requirements estimated',
          'Data quality strategy defined',
          'User experience impact understood',
          'Completion rate expectations set'
        )
      )
    ),
    (
      'WFL-CD-001-P4',
      'TSK-CD-001-P4-03',
      'Evaluate Patient Burden',
      'Ensure assessment burden is acceptable to patients. Execute Prompt 4.3.1.',
      3,
      jsonb_build_object(
        'prompt_id', '4.3.1',
        'complexity', 'BASIC',
        'estimated_duration_minutes', 20,
        'persona_lead', 'P10_PATADV',
        'persona_support', json_build_array('P06_PMDIG'),
        'prerequisites', json_build_array(
          'Endpoint candidate list with measurement details',
          'Understanding of assessment time and frequency'
        ),
        'deliverable', 'Patient Burden Analysis (2-3 pages)',
        'quality_checks', json_build_array(
          'Total assessment time calculated',
          'Patient acceptability assessed',
          'High-burden endpoints flagged',
          'Burden reduction options identified',
          'Patient advocate input documented'
        )
      )
    ),
    
    -- PHASE 5 TASKS
    (
      'WFL-CD-001-P5',
      'TSK-CD-001-P5-01',
      'Assess Regulatory Risk',
      'Evaluate FDA acceptance risk for each endpoint option. Execute Prompt 5.1.1.',
      1,
      jsonb_build_object(
        'prompt_id', '5.1.1',
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 25,
        'persona_lead', 'P05_REGAFF',
        'persona_support', json_build_array('P01_CMO'),
        'prerequisites', json_build_array(
          'All prior phase outputs',
          'Understanding of FDA precedent and guidance'
        ),
        'deliverable', 'Regulatory Risk Assessment & Mitigation Plan (3-4 pages)',
        'quality_checks', json_build_array(
          'Each endpoint option risk-rated',
          'Potential FDA concerns identified',
          'Mitigation strategies defined',
          'Pre-Sub meeting need assessed',
          'Contingency plans documented'
        )
      )
    ),
    (
      'WFL-CD-001-P5',
      'TSK-CD-001-P5-02',
      'Create Decision Matrix',
      'Build structured comparison of all endpoint options. Execute Prompt 5.2.1.',
      2,
      jsonb_build_object(
        'prompt_id', '5.2.1',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 10,
        'persona_lead', 'P01_CMO',
        'persona_support', json_build_array('All personas'),
        'prerequisites', json_build_array(
          'All prior phase outputs'
        ),
        'deliverable', 'Decision Matrix with weighted scores',
        'quality_checks', json_build_array(
          'All endpoints compared across key criteria',
          'Weighting rationale documented',
          'Scores calculated correctly',
          'Clear ranking established'
        )
      )
    ),
    (
      'WFL-CD-001-P5',
      'TSK-CD-001-P5-03',
      'Make Final Recommendation',
      'Synthesize all inputs and make final endpoint recommendation. Execute Prompt 5.2.2.',
      3,
      jsonb_build_object(
        'prompt_id', '5.2.2',
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 10,
        'persona_lead', 'P01_CMO',
        'persona_support', json_build_array('All personas'),
        'prerequisites', json_build_array(
          'Decision Matrix',
          'Understanding of stakeholder priorities'
        ),
        'deliverable', 'Final Endpoint Selection Report (20-30 pages)',
        'quality_checks', json_build_array(
          'Clear primary endpoint recommendation',
          '3-5 secondary endpoints identified',
          'Rationale well-documented',
          'Risks and mitigation strategies clear',
          'Ready for internal approval and FDA Pre-Sub'
        )
      )
    ),
    (
      'WFL-CD-001-P5',
      'TSK-CD-001-P5-04',
      'Prepare Stakeholder Communication',
      'Create executive summary and presentation materials. Execute Prompt 5.2.3.',
      4,
      jsonb_build_object(
        'prompt_id', '5.2.3',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 10,
        'persona_lead', 'P01_CMO',
        'prerequisites', json_build_array(
          'Final Endpoint Selection Report'
        ),
        'deliverable', jsonb_build_object(
          'executive_summary', 'Executive Summary (2-3 pages)',
          'presentation', 'Stakeholder Presentation (12-15 slides)',
          'faq', 'FAQ Document',
          'timeline', 'Implementation Timeline'
        ),
        'quality_checks', json_build_array(
          'Executive summary concise and compelling',
          'Presentation addresses anticipated questions',
          'Materials ready for Board/investor review',
          'Next steps clearly defined'
        )
      )
    )
) AS t_data(
  workflow_code, task_code, task_name, description, position, extra
)
WHERE wf.tenant_id = sc.tenant_id
  AND wf.code = t_data.workflow_code
ON CONFLICT (tenant_id, workflow_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  extra = EXCLUDED.extra,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

-- Summary of workflows
SELECT 
  'UC-01 Workflows Created' as status,
  code,
  name,
  position,
  estimated_duration_hours,
  metadata->>'duration_range' as duration_range
FROM dh_workflow wf
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND use_case_id = (
    SELECT id FROM dh_use_case 
    WHERE tenant_id = (SELECT tenant_id FROM session_config)
      AND code = 'UC_CD_001'
  )
ORDER BY position;

-- Summary of tasks
SELECT 
  'UC-01 Tasks Created' as status,
  wf.code as workflow_code,
  t.code as task_code,
  t.name as task_name,
  t.position,
  t.extra->>'estimated_duration_minutes' as duration_min,
  t.extra->>'complexity' as complexity
FROM dh_task t
JOIN dh_workflow wf ON wf.id = t.workflow_id
WHERE t.tenant_id = (SELECT tenant_id FROM session_config)
  AND wf.use_case_id = (
    SELECT id FROM dh_use_case 
    WHERE tenant_id = (SELECT tenant_id FROM session_config)
      AND code = 'UC_CD_001'
  )
ORDER BY wf.position, t.position;

-- Overall summary
SELECT 
  'UC-01 Endpoint Selection Seeded' as status,
  jsonb_build_object(
    'total_workflows', COUNT(DISTINCT wf.id),
    'total_tasks', COUNT(t.id),
    'total_duration_hours', ROUND(SUM(wf.estimated_duration_hours)::numeric, 2),
    'phases', json_build_object(
      'phase_1', COUNT(t.id) FILTER (WHERE wf.code = 'WFL-CD-001-P1'),
      'phase_2', COUNT(t.id) FILTER (WHERE wf.code = 'WFL-CD-001-P2'),
      'phase_3', COUNT(t.id) FILTER (WHERE wf.code = 'WFL-CD-001-P3'),
      'phase_4', COUNT(t.id) FILTER (WHERE wf.code = 'WFL-CD-001-P4'),
      'phase_5', COUNT(t.id) FILTER (WHERE wf.code = 'WFL-CD-001-P5')
    )
  ) as summary
FROM dh_workflow wf
LEFT JOIN dh_task t ON t.workflow_id = wf.id
WHERE wf.tenant_id = (SELECT tenant_id FROM session_config)
  AND wf.use_case_id = (
    SELECT id FROM dh_use_case 
    WHERE tenant_id = (SELECT tenant_id FROM session_config)
      AND code = 'UC_CD_001'
  );

-- =====================================================================================
-- END OF SCRIPT (Part 1 of 2)
-- Note: Part 2 will include Task Dependencies, Agent/Persona/Tool/RAG/KPI assignments
-- =====================================================================================

