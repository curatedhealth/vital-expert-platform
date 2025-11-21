-- =====================================================================================
-- 15_cd_010_protocol_development_part1.sql
-- UC_CD_010: Clinical Trial Protocol Development - Part 1: Workflows & Tasks
-- =====================================================================================
-- Purpose: Seed workflows and tasks for UC_CD_010
-- Dependencies: Foundation data must exist (use case UC_CD_010)
-- Execution Order: 15a (before part 2)
-- =====================================================================================

-- =====================================================================================
-- SECTION 0: SESSION CONFIGURATION
-- =====================================================================================

DO $$
DECLARE
  v_tenant_slug TEXT := 'digital-health-startup';
  v_tenant_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = v_tenant_slug;
  
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
-- SECTION 1: WORKFLOWS (1 Workflow with 8 Tasks)
-- =====================================================================================

INSERT INTO dh_workflow (
  tenant_id,
  use_case_id,
  name,
  unique_id,
  description,
  position,
  metadata
)
SELECT
  sc.tenant_id,
  uc.id as use_case_id,
  wf_data.name,
  wf_data.unique_id,
  wf_data.description,
  wf_data.position,
  wf_data.metadata
FROM session_config sc
CROSS JOIN dh_use_case uc
CROSS JOIN (
  VALUES
    (
      'Protocol Development Workflow',
      'WFL-CD-010-001',
      'Complete workflow for developing ICH-GCP compliant clinical trial protocols for DTx',
      1,
      jsonb_build_object(
        'duration_minutes', 420,
        'complexity', 'EXPERT',
        'deliverables', json_build_array(
          'Complete clinical trial protocol (60-120 pages)',
          'Protocol synopsis (2-3 pages)',
          'Study flow chart',
          'Informed consent key elements',
          'Protocol training materials',
          'Regulatory submission package',
          'Feasibility assessment',
          'Risk mitigation plan'
        ),
        'key_activities', json_build_array(
          'Define study objectives and endpoints',
          'Design trial structure',
          'Write core protocol sections',
          'Develop SAP section',
          'Create safety monitoring plan',
          'Conduct feasibility assessment',
          'Internal review and revisions',
          'Finalize for regulatory submission'
        ),
        'primary_personas', json_build_array('P01_CMO', 'P02_VPCLIN', 'P04_BIOSTAT', 'P05_REGAFF', 'P11_MEDICAL_WRITER'),
        'regulatory_framework', json_build_array('ICH E6(R2)', 'ICH E8', 'ICH E9', 'FDA IND', '21 CFR 312')
      )
    )
) AS wf_data(name, unique_id, description, position, metadata)
WHERE uc.code = 'UC_CD_010' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata;

-- =====================================================================================
-- SECTION 2: TASKS (8 Tasks)
-- =====================================================================================

INSERT INTO dh_task (
  tenant_id,
  workflow_id,
  code,
  unique_id,
  title,
  objective,
  position,
  extra
)
SELECT
  sc.tenant_id,
  wf.id as workflow_id,
  task_data.code,
  task_data.unique_id,
  task_data.title,
  task_data.objective,
  task_data.position,
  task_data.extra
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Step 1: Define Study Objectives & Endpoints
    (
      'Protocol Development Workflow',
      'TSK-CD-010-01',
      'TSK-CD-010-01',
      'Define Study Objectives & Endpoints',
      'Define primary objective, secondary objectives, and endpoints with operational definitions aligned with regulatory strategy',
      1,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 45,
        'deliverable', 'Objectives and endpoints document (5-7 pages)',
        'key_components', json_build_array(
          'Primary objective (single, focused)',
          'Secondary objectives (3-5 max)',
          'Exploratory objectives',
          'Primary endpoint (operational definition)',
          'Secondary endpoints',
          'Safety endpoints',
          'Timepoints for each endpoint'
        ),
        'prerequisites', json_build_array(
          'UC_CD_001 completed (endpoint selection)',
          'UC_CD_005 completed (PRO selection if applicable)',
          'UC_CD_007 completed (sample size calculated)'
        )
      )
    ),

    -- Step 2: Design Trial Structure
    (
      'Protocol Development Workflow',
      'TSK-CD-010-02',
      'TSK-CD-010-02',
      'Design Trial Structure',
      'Design overall trial structure including design type, phases, randomization, blinding, and visit schedule',
      2,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 40,
        'deliverable', 'Trial design document with study flow diagram',
        'design_elements', json_build_array(
          'Study design (parallel, crossover, factorial)',
          'Phases (screening, run-in, treatment, follow-up)',
          'Randomization (stratification factors, block size)',
          'Blinding (open-label, single-blind, double-blind)',
          'Visit schedule (frequency, windows, assessments)',
          'Treatment arms and durations',
          'Discontinuation rules'
        ),
        'prerequisites', json_build_array(
          'UC_CD_003 completed (RCT design)',
          'UC_CD_006 if adaptive design'
        )
      )
    ),

    -- Step 3: Write Core Protocol Sections
    (
      'Protocol Development Workflow',
      'TSK-CD-010-03',
      'TSK-CD-010-03',
      'Write Core Protocol Sections',
      'Draft all 16 required ICH E6(R2) protocol sections with complete operational details',
      3,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 120,
        'deliverable', 'Complete protocol draft (60-120 pages)',
        'ich_sections', json_build_array(
          '1. Title Page',
          '2. Protocol Synopsis',
          '3. Table of Contents',
          '4. List of Abbreviations',
          '5. Introduction & Background',
          '6. Study Objectives & Endpoints',
          '7. Study Design',
          '8. Selection & Withdrawal of Subjects',
          '9. Treatment of Subjects',
          '10. Efficacy Assessments',
          '11. Safety Assessments',
          '12. Statistics',
          '13. Data Handling & Record Keeping',
          '14. Ethics',
          '15. Quality Control & Assurance',
          '16. Publication Policy'
        )
      )
    ),

    -- Step 4: Develop Statistical Analysis Plan Section
    (
      'Protocol Development Workflow',
      'TSK-CD-010-04',
      'TSK-CD-010-04',
      'Develop SAP Section',
      'Create comprehensive Statistical Analysis Plan section detailing all efficacy, safety, and subgroup analyses',
      4,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 50,
        'deliverable', 'Protocol Section 12: Statistical Analysis Plan (15-20 pages)',
        'sap_components', json_build_array(
          'Analysis populations (ITT, PP, Safety)',
          'Sample size justification',
          'Primary analysis (method, estimand)',
          'Secondary analyses',
          'Subgroup analyses (from UC_CD_009)',
          'Interim analyses (if applicable)',
          'Multiplicity adjustments',
          'Missing data handling',
          'Sensitivity analyses'
        ),
        'prerequisites', json_build_array(
          'UC_CD_007 completed (sample size)',
          'UC_CD_009 completed (subgroup plan)'
        )
      )
    ),

    -- Step 5: Create Safety Monitoring Plan
    (
      'Protocol Development Workflow',
      'TSK-CD-010-05',
      'TSK-CD-010-05',
      'Create Safety Monitoring Plan',
      'Define adverse event monitoring, reporting timelines, stopping rules, and data safety monitoring board (if applicable)',
      5,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 40,
        'deliverable', 'Safety monitoring plan (Protocol Section 11)',
        'safety_elements', json_build_array(
          'Adverse event definitions (CTCAE grading)',
          'AE reporting timelines (SAE within 24h)',
          'Safety assessments schedule',
          'Stopping rules (safety, futility)',
          'DSMB charter (if required)',
          'Risk mitigation strategies',
          'Concomitant medication policies',
          'Protocol deviation management'
        )
      )
    ),

    -- Step 6: Conduct Feasibility Assessment
    (
      'Protocol Development Workflow',
      'TSK-CD-010-06',
      'TSK-CD-010-06',
      'Conduct Feasibility Assessment',
      'Assess operational feasibility including recruitment, site capacity, patient burden, and budget alignment',
      6,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 35,
        'deliverable', 'Feasibility assessment report',
        'feasibility_dimensions', json_build_array(
          'Recruitment feasibility (sites × rate × duration)',
          'Eligibility criteria impact (expected screen failure)',
          'Patient burden (visit frequency, assessments, time)',
          'Site capacity (concurrent studies, staff)',
          'Geographic considerations (site locations)',
          'Budget alignment (cost per patient)',
          'Technology requirements (ePRO, wearables)',
          'Regulatory timeline (IRB, FDA)'
        )
      )
    ),

    -- Step 7: Internal Review & Revisions
    (
      'Protocol Development Workflow',
      'TSK-CD-010-07',
      'TSK-CD-010-07',
      'Internal Review & Revisions',
      'Conduct multi-stakeholder internal review to identify gaps, inconsistencies, and improvement opportunities',
      7,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 45,
        'deliverable', 'Revised protocol incorporating review feedback',
        'review_dimensions', json_build_array(
          'Clinical review (CMO)',
          'Statistical review (Biostatistician)',
          'Regulatory review (Reg Affairs)',
          'Operational review (VP Clinical)',
          'Safety review (Medical Monitor)',
          'Legal review (if applicable)',
          'Patient advocate review (if applicable)'
        ),
        'review_checklist', json_build_array(
          'ICH E6(R2) completeness',
          'Internal consistency',
          'Clarity and operationalizability',
          'Feasibility concerns',
          'Regulatory acceptability',
          'Ethical considerations'
        )
      )
    ),

    -- Step 8: Finalize for Regulatory Submission
    (
      'Protocol Development Workflow',
      'TSK-CD-010-08',
      'TSK-CD-010-08',
      'Finalize for Regulatory Submission',
      'Incorporate final revisions, create synopsis, prepare submission package, and obtain executive sign-off',
      8,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 45,
        'deliverable', 'Final protocol and regulatory submission package',
        'final_deliverables', json_build_array(
          'Final signed protocol (PDF)',
          'Protocol synopsis (2-3 pages)',
          'Study flow chart',
          'Informed consent key elements',
          'Protocol deviations SOP',
          'Site training materials',
          'IRB submission package',
          'FDA submission package (if IND)'
        ),
        'sign_off_required', json_build_array(
          'Chief Medical Officer',
          'VP Clinical Development',
          'Lead Biostatistician',
          'Regulatory Affairs Director',
          'CEO (if required by governance)'
        )
      )
    )
) AS task_data(
  workflow_name, code, unique_id, title, objective, position, extra
)
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name 
  AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_CD_010' AND tenant_id = sc.tenant_id)
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  objective = EXCLUDED.objective,
  position = EXCLUDED.position,
  extra = EXCLUDED.extra;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

-- Verify workflows
SELECT 
  'UC-10 Workflows Seeded' as status,
  COUNT(*) as workflow_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_010';

-- Verify tasks
SELECT 
  'UC-10 Tasks Seeded' as status,
  COUNT(*) as task_count
FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_010';

-- Summary by workflow
SELECT 
  wf.name as workflow,
  wf.position,
  COUNT(t.id) as task_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
WHERE uc.code = 'UC_CD_010'
GROUP BY wf.name, wf.position
ORDER BY wf.position;

-- =====================================================================================
-- END OF UC-10 PART 1 SEED FILE
-- =====================================================================================

