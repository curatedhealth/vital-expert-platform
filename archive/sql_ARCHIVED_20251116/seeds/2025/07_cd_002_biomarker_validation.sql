-- =====================================================================================
-- 07_cd_002_biomarker_validation.sql
-- UC-02: Digital Biomarker Validation Strategy (DiMe V3 Framework)
-- =====================================================================================
-- Purpose: Seed workflows and tasks for UC_CD_002
-- Based on: UC_CD_002 documentation - Digital Biomarker Validation
-- Dependencies:
--   - Use case UC_CD_002 must exist in dh_use_case table
--   - Foundation tables (agents, personas, tools, RAG sources, KPIs)
-- =====================================================================================
-- STRUCTURE:
-- - 3 Phases (V1 Verification, V2 Analytical Validation, V3 Clinical Validation)
-- - 9 Steps/Tasks total
-- - Estimated Duration: 12-24 months
-- - Complexity: EXPERT
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
-- SECTION 1: WORKFLOWS (3 Phases - V1, V2, V3)
-- =====================================================================================

INSERT INTO dh_workflow (
  tenant_id,
  use_case_id,
  name,
  description,
  position,
  unique_id,
  metadata
)
SELECT
  sc.tenant_id,
  uc.id as use_case_id,
  wf_data.name,
  wf_data.description,
  wf_data.position,
  wf_data.unique_id,
  wf_data.metadata
FROM session_config sc
CROSS JOIN dh_use_case uc
CROSS JOIN (
  VALUES
    -- Phase 1: V1 Verification
    (
      'Phase 1: V1 Verification (Technical Validation)',
      'Demonstrate that the digital technology produces accurate, reliable, and consistent data',
      1,
      'WFL-CD-002-001',
      jsonb_build_object(
        'estimated_duration_hours', 160.0,
        'estimated_duration_weeks', '8-12 weeks',
        'cost_range', '$150K-$300K',
        'key_question', 'Does the technology work as intended?',
        'validation_stage', 'V1',
        'primary_personas', json_build_array('P07_DATASC', 'P06_DTXCMO'),
        'key_activities', json_build_array(
          'Define intended use and context of use',
          'Design verification study protocol',
          'Execute verification and analyze results'
        ),
        'deliverables', json_build_array(
          'Intended Use Document (5-7 pages)',
          'Verification Study Protocol (15-20 pages)',
          'Verification Report (20-30 pages)'
        ),
        'success_criteria', json_build_array(
          'ICC >0.85 vs gold standard',
          'Test-retest ICC >0.80',
          'Missing data <10%',
          'Artifact rate <5%'
        )
      )
    ),
    
    -- Phase 2: V2 Analytical Validation
    (
      'Phase 2: V2 Analytical Validation',
      'Demonstrate that the measure detects what it claims to measure and has sound measurement properties',
      2,
      'WFL-CD-002-002',
      jsonb_build_object(
        'estimated_duration_hours', 320.0,
        'estimated_duration_weeks', '12-16 weeks',
        'cost_range', '$200K-$500K',
        'key_question', 'Does it measure what it claims?',
        'validation_stage', 'V2',
        'primary_personas', json_build_array('P08_CLINRES', 'P07_DATASC'),
        'key_activities', json_build_array(
          'Design analytical validation study',
          'Execute analytical validation',
          'Establish psychometric properties'
        ),
        'deliverables', json_build_array(
          'Analytical Validation Protocol (25 pages)',
          'Analytical Validation Report (30-40 pages)',
          'Psychometric Evidence Summary'
        ),
        'success_criteria', json_build_array(
          'Construct validity established',
          'Convergent validity r >0.70',
          'Divergent validity r <0.30',
          'Known-groups validity p<0.001',
          'Internal consistency α >0.70',
          'Test-retest ICC >0.70'
        )
      )
    ),
    
    -- Phase 3: V3 Clinical Validation
    (
      'Phase 3: V3 Clinical Validation',
      'Demonstrate that the measure is clinically meaningful and useful for its intended purpose',
      3,
      'WFL-CD-002-003',
      jsonb_build_object(
        'estimated_duration_hours', 960.0,
        'estimated_duration_months', '12-24 months',
        'cost_range', '$1M-$5M',
        'key_question', 'Is it clinically meaningful?',
        'validation_stage', 'V3',
        'primary_personas', json_build_array('P08_CLINRES', 'P15_HEOR', 'P04_REGDIR'),
        'key_activities', json_build_array(
          'Design clinical validation study',
          'Execute clinical validation and MCID determination',
          'Prepare regulatory strategy and publications'
        ),
        'deliverables', json_build_array(
          'Clinical Validation Protocol (40 pages)',
          'Clinical Validation Report (50+ pages)',
          'MCID Determination Report',
          'FDA Pre-Submission Package',
          'Peer-Reviewed Publication'
        ),
        'success_criteria', json_build_array(
          'Association with clinical outcomes p<0.05',
          'Treatment response demonstrated',
          'MCID established (anchor + distribution)',
          'Clinical utility proven',
          'FDA acceptance achieved',
          'Published in peer-reviewed journal'
        )
      )
    )
) AS wf_data(name, description, position, unique_id, metadata)
WHERE uc.tenant_id = sc.tenant_id
  AND uc.code = 'UC_CD_002'
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 2: TASKS (9 Steps)
-- =====================================================================================

INSERT INTO dh_task (
  tenant_id,
  workflow_id,
  code,
  title,
  objective,
  position,
  unique_id,
  extra
)
SELECT
  sc.tenant_id,
  wf.id as workflow_id,
  t_data.code,
  t_data.title,
  t_data.objective,
  t_data.position,
  t_data.unique_id,
  t_data.extra
FROM session_config sc
CROSS JOIN dh_workflow wf
CROSS JOIN (
  VALUES
    -- PHASE 1: V1 VERIFICATION TASKS
    (
      'Phase 1: V1 Verification (Technical Validation)',
      'TSK-CD-002-P1-01',
      'TSK-CD-002-P1-01',
      'Define Intended Use & Context of Use',
      'Define the Intended Use and Context of Use for the digital biomarker using PICO framework to guide all validation decisions',
      1,
      jsonb_build_object(
        'prompt_id', '1.1',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_hours', 4,
        'persona_lead', 'P06_DTXCMO',
        'persona_support', json_build_array('P04_REGDIR'),
        'prerequisites', json_build_array(
          'Digital biomarker concept defined',
          'Technology/sensor specifications',
          'Clinical indication identified',
          'Preliminary clinical rationale'
        ),
        'deliverable', 'Intended Use Document (5-7 pages)',
        'key_outputs', json_build_array(
          'Intended Use Statement (2-3 sentences)',
          'Context of Use Summary (PICO framework)',
          'Validation Strategy (V1/V1+V2/V1+V2+V3)',
          'Regulatory endpoint classification',
          'Risk assessment'
        ),
        'quality_checks', json_build_array(
          'Patient population clearly defined',
          'Clinical construct clearly articulated',
          'Endpoint type justified (exploratory/secondary/primary)',
          'Regulatory pathway identified',
          'Validation level appropriate for intended use'
        )
      )
    ),
    (
      'Phase 1: V1 Verification (Technical Validation)',
      'TSK-CD-002-P1-02',
      'TSK-CD-002-P1-02',
      'Design Verification Study (V1)',
      'Design comprehensive Verification study protocol including gold standard selection, accuracy testing, precision testing, and statistical analysis plan',
      2,
      jsonb_build_object(
        'prompt_id', '2.1',
        'complexity', 'ADVANCED',
        'estimated_duration_hours', 40,
        'estimated_duration_weeks', '1-2 weeks',
        'persona_lead', 'P07_DATASC',
        'persona_support', json_build_array('P08_CLINRES'),
        'prerequisites', json_build_array(
          'Intended Use Document approved',
          'Gold standard comparator identified',
          'Digital device functional',
          'Budget allocated'
        ),
        'deliverable', 'Verification Study Protocol (15-20 pages)',
        'key_components', json_build_array(
          'Study objectives (accuracy, precision, data quality)',
          'Sample size calculation (ICC-based)',
          'Participant recruitment plan',
          'Data collection protocol',
          'Statistical analysis plan (ICC, Bland-Altman)',
          'Success criteria definition',
          'Timeline and budget'
        ),
        'quality_checks', json_build_array(
          'Gold standard appropriately selected',
          'Sample size adequately powered (n=30-50 typical)',
          'Accuracy targets defined (ICC >0.85)',
          'Precision targets defined (test-retest ICC >0.80)',
          'Subgroup analyses planned',
          'IRB submission ready'
        )
      )
    ),
    (
      'Phase 1: V1 Verification (Technical Validation)',
      'TSK-CD-002-P1-03',
      'TSK-CD-002-P1-03',
      'Execute Verification Study & Analysis',
      'Conduct verification study, analyze data using ICC and Bland-Altman methods, and prepare comprehensive Verification Report',
      3,
      jsonb_build_object(
        'prompt_id', '3.1',
        'complexity', 'ADVANCED',
        'estimated_duration_hours', 116,
        'estimated_duration_weeks', '8-12 weeks',
        'persona_lead', 'P07_DATASC',
        'persona_support', json_build_array('P08_CLINRES'),
        'prerequisites', json_build_array(
          'Verification Protocol approved',
          'IRB approval obtained',
          'Participants recruited',
          'Data collection systems operational'
        ),
        'deliverable', 'Verification Report (V1 complete, 20-30 pages)',
        'key_analyses', json_build_array(
          'Intraclass Correlation Coefficient (ICC)',
          'Bland-Altman analysis',
          'Pearson/Spearman correlation',
          'Test-retest reliability',
          'Data quality assessment',
          'Subgroup and robustness analyses'
        ),
        'success_criteria', json_build_array(
          'Accuracy ICC >0.85 achieved',
          'Bias within acceptable limits',
          'Test-retest ICC >0.80',
          'Missing data <10%',
          'Artifact rate <5%',
          'Subgroup performance acceptable'
        ),
        'decision_point', 'PASS → Proceed to V2; FAIL → Refine algorithm and repeat V1'
      )
    ),
    
    -- PHASE 2: V2 ANALYTICAL VALIDATION TASKS
    (
      'Phase 2: V2 Analytical Validation',
      'TSK-CD-002-P2-01',
      'TSK-CD-002-P2-01',
      'Design Analytical Validation Study (V2)',
      'Design analytical validation study to establish psychometric properties: construct validity, convergent/divergent validity, known-groups validity, and reliability',
      1,
      jsonb_build_object(
        'prompt_id', '4.1',
        'complexity', 'ADVANCED',
        'estimated_duration_hours', 40,
        'estimated_duration_weeks', '1-2 weeks',
        'persona_lead', 'P08_CLINRES',
        'persona_support', json_build_array('P07_DATASC', 'P04_REGDIR'),
        'prerequisites', json_build_array(
          'V1 Verification passed',
          'Comparator measures identified',
          'Known-groups defined (disease vs healthy)',
          'Sample size budget confirmed'
        ),
        'deliverable', 'Analytical Validation Protocol (25 pages)',
        'key_components', json_build_array(
          'Construct validity approach (factor analysis/CFA)',
          'Convergent validity measures (r >0.70 target)',
          'Divergent validity measures (r <0.30 target)',
          'Known-groups design (disease stages)',
          'Reliability testing (test-retest)',
          'Sample size: 150-300 participants',
          'Statistical analysis plan'
        ),
        'quality_checks', json_build_array(
          'Comparator measures validated and appropriate',
          'Known-groups clearly differentiated',
          'Sample size adequately powered',
          'Factor analysis approach justified',
          'IRB submission ready'
        )
      )
    ),
    (
      'Phase 2: V2 Analytical Validation',
      'TSK-CD-002-P2-02',
      'TSK-CD-002-P2-02',
      'Execute Analytical Validation',
      'Conduct analytical validation study and perform psychometric analyses to establish measurement properties',
      2,
      jsonb_build_object(
        'prompt_id', '5.1',
        'complexity', 'ADVANCED',
        'estimated_duration_hours', 280,
        'estimated_duration_weeks', '12-16 weeks',
        'persona_lead', 'P08_CLINRES',
        'persona_support', json_build_array('P07_DATASC'),
        'prerequisites', json_build_array(
          'Analytical Validation Protocol approved',
          'IRB approval obtained',
          'Participants recruited (n=150-300)',
          'Comparator measures ready'
        ),
        'deliverable', 'Analytical Validation Report (V2 complete, 30-40 pages)',
        'key_analyses', json_build_array(
          'Factor analysis (EFA/CFA)',
          'Convergent validity (correlations with similar measures)',
          'Divergent validity (correlations with dissimilar measures)',
          'Known-groups validity (disease vs healthy, ANOVA/t-tests)',
          'Internal consistency (Cronbach alpha if applicable)',
          'Test-retest reliability (ICC >0.70)'
        ),
        'success_criteria', json_build_array(
          'Construct validity established',
          'Convergent validity r >0.70',
          'Divergent validity r <0.30',
          'Known-groups p<0.001 with large effect size',
          'Internal consistency α >0.70 (if multi-item)',
          'Test-retest ICC >0.70'
        ),
        'decision_point', 'PASS → Proceed to V3 (if primary endpoint) or use as secondary; FAIL → Revise measure and repeat V2'
      )
    ),
    
    -- PHASE 3: V3 CLINICAL VALIDATION TASKS
    (
      'Phase 3: V3 Clinical Validation',
      'TSK-CD-002-P3-01',
      'TSK-CD-002-P3-01',
      'Design Clinical Validation Study (V3)',
      'Design prospective clinical validation study to demonstrate clinical meaningfulness, treatment response, and establish MCID',
      1,
      jsonb_build_object(
        'prompt_id', '6.1',
        'complexity', 'EXPERT',
        'estimated_duration_hours', 80,
        'estimated_duration_weeks', '2-4 weeks',
        'persona_lead', 'P08_CLINRES',
        'persona_support', json_build_array('P06_DTXCMO', 'P15_HEOR', 'P04_REGDIR'),
        'prerequisites', json_build_array(
          'V2 Analytical Validation passed',
          'Clinical utility outcomes defined',
          'Treatment cohort available',
          'Longitudinal follow-up feasible',
          'Budget $1M-$5M allocated'
        ),
        'deliverable', 'Clinical Validation Protocol (40 pages)',
        'key_components', json_build_array(
          'Study design (prospective longitudinal)',
          'Clinical utility outcomes',
          'Treatment response assessment',
          'MCID determination (anchor + distribution methods)',
          'Sample size: 200-500 participants',
          'Duration: 6-12 months',
          'Statistical analysis plan',
          'IRB and site activation plan'
        ),
        'quality_checks', json_build_array(
          'Clinical outcomes meaningful and measurable',
          'Treatment effect expected and detectable',
          'MCID anchors identified (patient/clinician global assessment)',
          'Sample size adequately powered',
          'FDA Pre-Sub planned if primary endpoint'
        )
      )
    ),
    (
      'Phase 3: V3 Clinical Validation',
      'TSK-CD-002-P3-02',
      'TSK-CD-002-P3-02',
      'Execute Clinical Validation & MCID Determination',
      'Conduct clinical validation study, analyze association with clinical outcomes, demonstrate treatment response, and establish MCID',
      2,
      jsonb_build_object(
        'prompt_id', '7.1',
        'complexity', 'EXPERT',
        'estimated_duration_hours', 640,
        'estimated_duration_months', '6-12 months',
        'persona_lead', 'P08_CLINRES',
        'persona_support', json_build_array('P15_HEOR', 'P07_DATASC'),
        'prerequisites', json_build_array(
          'Clinical Validation Protocol approved',
          'IRB approval obtained',
          'Sites activated',
          'Participants recruited (n=200-500)',
          'Longitudinal data collection system operational'
        ),
        'deliverable', 'Clinical Validation Report (V3 complete, 50+ pages)',
        'key_analyses', json_build_array(
          'Association with clinical outcomes (regression, survival analysis)',
          'Treatment response (pre-post, treatment vs control)',
          'MCID - Anchor-based method (link to global assessment)',
          'MCID - Distribution-based method (0.5 SD, SEM)',
          'Clinical utility demonstration',
          'Subgroup analyses'
        ),
        'success_criteria', json_build_array(
          'Significant association with clinical outcomes p<0.05',
          'Treatment response demonstrated p<0.05',
          'MCID established by both methods',
          'Clinical utility demonstrated',
          'Safety data acceptable'
        ),
        'decision_point', 'PASS → Suitable for primary endpoint, proceed to regulatory; FAIL → Use as secondary/exploratory'
      )
    ),
    (
      'Phase 3: V3 Clinical Validation',
      'TSK-CD-002-P3-03',
      'TSK-CD-002-P3-03',
      'Regulatory Strategy & FDA Pre-Submission',
      'Prepare FDA Pre-Submission package, submit request, attend meeting, and incorporate feedback',
      3,
      jsonb_build_object(
        'prompt_id', '8.1',
        'complexity', 'EXPERT',
        'estimated_duration_hours', 80,
        'estimated_duration_weeks', '12 weeks (including FDA review time)',
        'persona_lead', 'P04_REGDIR',
        'persona_support', json_build_array('P06_DTXCMO', 'P08_CLINRES'),
        'prerequisites', json_build_array(
          'V1 + V2 + V3 validation complete',
          'Digital biomarker intended as primary or key secondary endpoint',
          'Validation reports finalized',
          'FDA meeting topics identified'
        ),
        'deliverable', 'FDA Pre-Submission Package (30 pages) + Meeting Minutes',
        'key_components', json_build_array(
          'Cover letter and background',
          'Validation summary (V1 + V2 + V3)',
          'Intended use and regulatory pathway',
          'Specific questions for FDA',
          'Pre-Sub request submission (75-90 day review)',
          'FDA meeting attendance',
          'Response to FDA feedback document'
        ),
        'fda_topics', json_build_array(
          'Adequacy of validation approach',
          'Acceptability as primary endpoint',
          'MCID appropriateness',
          'Additional validation requirements',
          'Pivotal trial design considerations'
        ),
        'quality_checks', json_build_array(
          'Pre-Sub package complete and compliant',
          'Questions clear and specific',
          'Meeting minutes documented',
          'FDA feedback incorporated into development plan'
        )
      )
    ),
    (
      'Phase 3: V3 Clinical Validation',
      'TSK-CD-002-P3-04',
      'TSK-CD-002-P3-04',
      'Validation Report & Publication',
      'Prepare comprehensive validation report, draft manuscript for peer-reviewed journal, and present at conferences',
      4,
      jsonb_build_object(
        'prompt_id', '9.1',
        'complexity', 'ADVANCED',
        'estimated_duration_hours', 160,
        'estimated_duration_weeks', '8-12 weeks (plus journal review time)',
        'persona_lead', 'P16_MEDWRIT',
        'persona_support', json_build_array('P08_CLINRES', 'P06_DTXCMO'),
        'prerequisites', json_build_array(
          'All validation stages complete',
          'Data analyzed and results finalized',
          'FDA feedback incorporated',
          'Authorship team identified'
        ),
        'deliverable', 'Comprehensive Validation Report (50-100 pages) + Peer-Reviewed Publication',
        'key_components', json_build_array(
          'Comprehensive Validation Report (all V1+V2+V3)',
          'Manuscript for peer review (5,000-8,000 words)',
          'Supplementary materials',
          'Conference presentation (slides)',
          'Target journals: npj Digital Medicine, JMIR, Lancet Digital Health, Digital Health'
        ),
        'publication_elements', json_build_array(
          'Introduction (DiMe V3 framework)',
          'Methods (V1+V2+V3 studies)',
          'Results (all validation data)',
          'Discussion (regulatory and clinical implications)',
          'Conclusion (fit-for-purpose statement)'
        ),
        'quality_checks', json_build_array(
          'Validation report comprehensive',
          'Manuscript follows journal guidelines',
          'ICMJE authorship criteria met',
          'Data transparency (code/data sharing statement)',
          'Conflicts of interest disclosed'
        ),
        'success_metrics', json_build_array(
          'Publication in journal with impact factor >5',
          'Conference presentation acceptance',
          'Citations by other digital biomarker researchers',
          'FDA acceptance in regulatory submissions'
        )
      )
    )
) AS t_data(workflow_name, code, unique_id, title, objective, position, extra)
WHERE wf.tenant_id = sc.tenant_id
  AND wf.name = t_data.workflow_name
  AND wf.use_case_id = (
    SELECT id FROM dh_use_case 
    WHERE tenant_id = sc.tenant_id 
      AND code = 'UC_CD_002'
  )
ON CONFLICT (workflow_id, code)
DO UPDATE SET
  title = EXCLUDED.title,
  objective = EXCLUDED.objective,
  position = EXCLUDED.position,
  unique_id = EXCLUDED.unique_id,
  extra = EXCLUDED.extra,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

SELECT 
  'UC-02 Workflows Seeded' as status,
  COUNT(*) as workflow_count,
  jsonb_agg(jsonb_build_object('name', name, 'unique_id', unique_id, 'position', position)) as workflows
FROM dh_workflow wf
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_002');

SELECT 
  'UC-02 Tasks Seeded' as status,
  COUNT(*) as task_count,
  jsonb_object_agg(
    wf.name,
    (SELECT COUNT(*) FROM dh_task t2 WHERE t2.workflow_id = wf.id)
  ) as tasks_by_workflow
FROM dh_workflow wf
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_002')
GROUP BY wf.name;

SELECT 
  'UC-02 Digital Biomarker Validation Seeded' as status,
  jsonb_build_object(
    'total_workflows', COUNT(DISTINCT wf.id),
    'total_tasks', COUNT(t.id),
    'validation_stages', jsonb_build_object(
      'V1_Verification', COUNT(t.id) FILTER (WHERE wf.name LIKE '%V1 Verification%'),
      'V2_Analytical', COUNT(t.id) FILTER (WHERE wf.name LIKE '%V2 Analytical%'),
      'V3_Clinical', COUNT(t.id) FILTER (WHERE wf.name LIKE '%V3 Clinical%')
    ),
    'estimated_total_duration_months', '12-24 months',
    'estimated_cost_range', '$1.5M-$5M',
    'complexity', 'EXPERT'
  ) as summary
FROM dh_workflow wf
LEFT JOIN dh_task t ON t.workflow_id = wf.id
WHERE wf.tenant_id = (SELECT tenant_id FROM session_config)
  AND wf.use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_002');

-- =====================================================================================
-- END OF SEED FILE
-- =====================================================================================

