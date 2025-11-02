-- =====================================================================================
-- 16_ma_001_value_dossier_part1.sql
-- UC_MA_001: Payer Value Dossier Development - Part 1: Workflows & Tasks
-- =====================================================================================
-- Purpose: Seed workflows and tasks for UC_MA_001
-- Dependencies: Foundation data must exist (use case UC_MA_001)
-- Execution Order: 16a (before part 2)
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
      'Payer Value Dossier Workflow',
      'WFL-MA-001-001',
      'Complete workflow for developing payer value dossiers following AMCP Format 4.0 standards',
      1,
      jsonb_build_object(
        'duration_minutes', 480,
        'complexity', 'EXPERT',
        'deliverables', json_build_array(
          'Complete value dossier (50-100 pages)',
          'Executive summary (2-3 pages)',
          'Clinical evidence synthesis',
          'Cost-effectiveness model',
          'Budget impact model',
          'AMCP Format 4.0 dossier',
          'P&T presentation deck'
        ),
        'framework', 'AMCP Format 4.0, ISPOR Guidelines, NICE Methods Guide',
        'primary_personas', json_build_array('P21_MA_DIR', 'P22_HEOR', 'P23_MED_AFF', 'P24_PAYER_REL')
      )
    )
) AS wf_data(name, unique_id, description, position, metadata)
WHERE uc.code = 'UC_MA_001' AND uc.tenant_id = sc.tenant_id
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
    -- Step 1: Define Value Strategy
    (
      'Payer Value Dossier Workflow',
      'TSK-MA-001-01',
      'TSK-MA-001-01',
      'Define Value Strategy & Competitive Landscape',
      'Establish strategic foundation by defining value positioning, understanding competitive landscape, and identifying evidence gaps',
      1,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 60,
        'deliverable', 'Value strategy document and competitive landscape analysis',
        'key_activities', json_build_array(
          'Define value pillars (clinical, economic, patient, provider)',
          'Competitive intelligence gathering',
          'Payer landscape assessment',
          'Evidence gap identification'
        ),
        'payer_priorities', json_build_array('Budget impact', 'Clinical differentiation', 'Safety profile', 'Cost-effectiveness')
      )
    ),

    -- Step 2: Synthesize Clinical Evidence
    (
      'Payer Value Dossier Workflow',
      'TSK-MA-001-02',
      'TSK-MA-001-02',
      'Synthesize Clinical Evidence',
      'Translate clinical trial data into payer-relevant evidence narratives covering efficacy, safety, and comparative effectiveness',
      2,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 90,
        'deliverable', 'Clinical evidence synthesis report',
        'evidence_components', json_build_array(
          'Efficacy data (primary/secondary endpoints)',
          'Safety profile (AEs, discontinuations)',
          'Comparative effectiveness vs SOC',
          'Quality of life outcomes',
          'Subgroup analyses'
        )
      )
    ),

    -- Step 3: Develop Cost-Effectiveness Model
    (
      'Payer Value Dossier Workflow',
      'TSK-MA-001-03',
      'TSK-MA-001-03',
      'Develop Cost-Effectiveness Model',
      'Build rigorous cost-effectiveness analysis (CEA) demonstrating value for money versus standard of care',
      3,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 60,
        'deliverable', 'Cost-effectiveness model with ICER calculation',
        'model_components', json_build_array(
          'Decision tree or Markov model',
          'QALY calculation',
          'ICER (Incremental Cost-Effectiveness Ratio)',
          'Sensitivity analyses (one-way, PSA)',
          'Cost-effectiveness acceptability curve'
        ),
        'thresholds', json_build_array('US: $50K-$150K/QALY', 'UK (NICE): £20K-£30K/QALY')
      )
    ),

    -- Step 4: Build Budget Impact Model
    (
      'Payer Value Dossier Workflow',
      'TSK-MA-001-04',
      'TSK-MA-001-04',
      'Build Budget Impact Model',
      'Quantify financial impact on payer budget over 3-5 years, calculating PMPM (per-member-per-month) cost',
      4,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 60,
        'deliverable', 'Budget impact model (Excel) with PMPM calculations',
        'model_components', json_build_array(
          'Target population sizing',
          'Market share assumptions (uptake)',
          'Cost with vs without product',
          'Medical cost offsets',
          'PMPM impact calculation',
          'Sensitivity scenarios'
        ),
        'pmpm_targets', json_build_array('<$0.05 PMPM: minimal impact', '$0.05-$0.25 PMPM: moderate', '>$0.25 PMPM: high scrutiny')
      )
    ),

    -- Step 5: Assemble AMCP Dossier
    (
      'Payer Value Dossier Workflow',
      'TSK-MA-001-05',
      'TSK-MA-001-05',
      'Assemble AMCP Dossier & Policy Recommendations',
      'Compile all evidence into structured AMCP Format 4.0 dossier with medical policy recommendations',
      5,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 60,
        'deliverable', 'Complete AMCP Format 4.0 dossier (50-100 pages)',
        'amcp_sections', json_build_array(
          'Section 1: Product & Disease Overview',
          'Section 2: Clinical Evidence',
          'Section 3: Economic Evidence',
          'Section 4: Safety & Tolerability',
          'Section 5: Medical Policy Considerations',
          'Appendices: Full studies, references'
        ),
        'policy_recommendations', json_build_array('Recommended tier placement', 'Prior authorization criteria', 'Place in therapy')
      )
    ),

    -- Step 6: Medical & Regulatory Review
    (
      'Payer Value Dossier Workflow',
      'TSK-MA-001-06',
      'TSK-MA-001-06',
      'Medical & Regulatory Review',
      'Ensure medical accuracy, regulatory compliance, and alignment with promotional guidelines',
      6,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 45,
        'deliverable', 'Reviewed and approved dossier',
        'review_dimensions', json_build_array(
          'Medical accuracy (data, claims)',
          'Regulatory compliance (FDA, FTC)',
          'Promotional guidelines (PhRMA Code)',
          'References and citations',
          'Internal consistency'
        ),
        'compliance_checks', json_build_array('FDA labeling alignment', 'Anti-kickback statute', 'Transparency requirements')
      )
    ),

    -- Step 7: Develop Payer Engagement Strategy
    (
      'Payer Value Dossier Workflow',
      'TSK-MA-001-07',
      'TSK-MA-001-07',
      'Develop Payer Engagement Strategy',
      'Create tactical plan for submitting dossier and engaging target payers',
      7,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 45,
        'deliverable', 'Payer engagement plan and submission timeline',
        'engagement_activities', json_build_array(
          'Prioritize target payers (top 10-15)',
          'Pre-submission meetings with medical directors',
          'P&T meeting schedule coordination',
          'Dossier submission logistics',
          'Post-submission follow-up plan'
        ),
        'success_metrics', json_build_array('Number of meetings secured', 'Tier 2 placement rate', 'Time to coverage')
      )
    ),

    -- Step 8: Create P&T Presentation
    (
      'Payer Value Dossier Workflow',
      'TSK-MA-001-08',
      'TSK-MA-001-08',
      'Create P&T Presentation Materials',
      'Build compelling presentation deck for Pharmacy & Therapeutics committee meetings',
      8,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 60,
        'deliverable', 'P&T slide deck (15-20 slides) with speaker notes and Q&A prep',
        'presentation_structure', json_build_array(
          'Disease burden & unmet need (2 min)',
          'Product overview (2 min)',
          'Clinical evidence (5 min)',
          'Economic evidence (4 min)',
          'Real-world evidence (2 min)',
          'Formulary recommendation (2 min)',
          'Q&A preparation (5 min)'
        ),
        'key_messages', json_build_array('Clinical value', 'Economic value', 'Patient value', 'Operational fit')
      )
    )
) AS task_data(
  workflow_name, code, unique_id, title, objective, position, extra
)
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name 
  AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_MA_001' AND tenant_id = sc.tenant_id)
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

SELECT 
  'MA-001 Workflows Seeded' as status,
  COUNT(*) as workflow_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_MA_001';

SELECT 
  'MA-001 Tasks Seeded' as status,
  COUNT(*) as task_count
FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_MA_001';

-- =====================================================================================
-- END OF UC-MA-001 PART 1 SEED FILE
-- =====================================================================================

