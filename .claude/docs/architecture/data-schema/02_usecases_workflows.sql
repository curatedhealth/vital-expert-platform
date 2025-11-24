-- =====================================================================================
-- 02_usecases_workflows.sql
-- Clinical Development (CD) Use Cases - Use Cases & Workflows Setup
-- =====================================================================================
-- Purpose: Seed 10 Clinical Development use cases with their workflows
-- Dependencies: 01_tenant_roles_domain.sql must be executed first
-- Execution Order: 2 of 3
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

-- Store tenant_id for session use
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
-- SECTION 0.5: CLEANUP - Remove existing workflows and tasks to avoid conflicts
-- =====================================================================================

-- Delete tasks for CD workflows (tasks reference workflows, so delete first)
DELETE FROM dh_task t
USING dh_workflow w, dh_use_case uc, dh_domain d
WHERE t.workflow_id = w.id
  AND w.use_case_id = uc.id
  AND uc.domain_id = d.id
  AND d.tenant_id = (SELECT tenant_id FROM session_config)
  AND d.code = 'CD';

-- Delete workflows for CD use cases
DELETE FROM dh_workflow w
USING dh_use_case uc, dh_domain d
WHERE w.use_case_id = uc.id
  AND uc.domain_id = d.id
  AND d.tenant_id = (SELECT tenant_id FROM session_config)
  AND d.code = 'CD';

-- Temporarily drop NOT NULL constraint on workflow unique_id to allow insertion
ALTER TABLE dh_workflow ALTER COLUMN unique_id DROP NOT NULL;

-- =====================================================================================
-- SECTION 1: USE CASE SETUP - All 10 Clinical Development Use Cases
-- =====================================================================================

INSERT INTO dh_use_case (tenant_id, domain_id, code, title, summary, complexity, unique_id, metadata)
SELECT 
  sc.tenant_id,
  d.id as domain_id,
  uc_data.code,
  uc_data.title,
  uc_data.summary,
  uc_data.complexity,
  uc_data.unique_id,
  uc_data.metadata
FROM session_config sc
CROSS JOIN dh_domain d
CROSS JOIN (
  VALUES
    -- UC_CD_001: DTx Clinical Endpoint Selection
    (
      'UC_CD_001',
      'DTx Clinical Endpoint Selection & Validation',
      'Comprehensive guidance for selecting primary and secondary clinical endpoints for digital therapeutic interventions, aligned with FDA expectations and clinical meaningfulness.',
      'Expert',
      'USC-CD-001',
      jsonb_build_object(
        'pattern', 'FEW_SHOT_WITH_COT',
        'dependencies', json_build_array(),
        'total_workflows', 8,
        'estimated_duration', '2-3 hours',
        'key_stakeholders', json_build_array('P01_CMO', 'P02_VPCLIN', 'P04_BIOSTAT', 'P05_REGDIR', 'P10_PATADV', 'P06_PMDIG'),
        'regulatory_focus', json_build_array('FDA', 'EMA', 'MCID'),
        'success_metrics', jsonb_build_object(
          'fda_acceptance_rate', '>90%',
          'expert_validation_score', '>4.5/5',
          'clinical_meaningfulness', '>95%'
        ),
        'related_use_cases', json_build_array('UC_CD_002', 'UC_CD_003', 'UC_RA_001', 'UC_MA_007')
      )
    ),
    
    -- UC_CD_002: Digital Biomarker Validation
    (
      'UC_CD_002',
      'Digital Biomarker Validation Strategy (DiMe V3 Framework)',
      'Structured approach to validating digital biomarkers following the DiMe V3 framework (Verification, Analytical Validation, Clinical Validation).',
      'Advanced',
      'USC-CD-002',
      jsonb_build_object(
        'pattern', 'COT_WITH_RAG',
        'dependencies', json_build_array('UC_CD_001', 'UC_PD_009'),
        'total_workflows', 9,
        'estimated_duration', '3-4 hours',
        'key_stakeholders', json_build_array('P06_DTXCMO', 'P07_DATASC', 'P08_CLINRES', 'P04_REGDIR', 'P15_HEOR', 'P16_MEDWRIT'),
        'framework', 'DiMe V3 (Verification, Analytical Validation, Clinical Validation)',
        'regulatory_focus', json_build_array('FDA Digital Health', '21st Century Cures Act'),
        'related_use_cases', json_build_array('UC_CD_001', 'UC_PD_009', 'UC_RA_002', 'UC_EG_001')
      )
    ),
    
    -- UC_CD_003: RCT Design for DTx
    (
      'UC_CD_003',
      'RCT Design & Clinical Trial Strategy for DTx',
      'Comprehensive randomized controlled trial (RCT) design specifically tailored for digital therapeutic interventions, addressing unique challenges like blinding, engagement, and digital endpoints.',
      'Advanced',
      'USC-CD-003',
      jsonb_build_object(
        'pattern', 'COT_WITH_CHECKLIST',
        'dependencies', json_build_array('UC_CD_001', 'UC_CD_004'),
        'total_workflows', 10,
        'estimated_duration', '2.5-3 hours',
        'key_stakeholders', json_build_array('P01_CMO', 'P02_VPCLIN', 'P04_BIOSTAT', 'P03_CLTM', 'P05_REGDIR', 'P06_PMDIG', 'P08_CLOPS', 'P10_PATADV'),
        'design_considerations', json_build_array('Blinding Challenges', 'Engagement Strategy', 'Attrition 30-40%', 'Intent-to-Treat', 'Per-Protocol'),
        'related_use_cases', json_build_array('UC_CD_001', 'UC_CD_004', 'UC_CD_007', 'UC_CD_010')
      )
    ),
    
    -- UC_CD_004: Comparator Selection Strategy
    (
      'UC_CD_004',
      'Comparator Selection Strategy',
      'Strategic guidance for selecting appropriate comparators in DTx clinical trials (placebo, sham app, standard of care, active control).',
      'Intermediate',
      'USC-CD-004',
      jsonb_build_object(
        'pattern', 'FEW_SHOT',
        'dependencies', json_build_array('UC_CD_003'),
        'total_workflows', 6,
        'estimated_duration', '1.5-2 hours',
        'key_stakeholders', json_build_array('P01_CMO', 'P02_VPCLIN', 'P05_REGDIR', 'P04_BIOSTAT'),
        'comparator_types', json_build_array('Placebo', 'Sham App', 'Standard of Care', 'Active Control', 'Waitlist Control'),
        'related_use_cases', json_build_array('UC_CD_003', 'UC_CD_001')
      )
    ),
    
    -- UC_CD_005: PRO Instrument Selection
    (
      'UC_CD_005',
      'Patient-Reported Outcome (PRO) Instrument Selection',
      'Systematic approach to selecting and validating patient-reported outcome instruments for DTx trials, following FDA PRO guidance.',
      'Intermediate',
      'USC-CD-005',
      jsonb_build_object(
        'pattern', 'COT_WITH_RAG',
        'dependencies', json_build_array('UC_CD_001'),
        'total_workflows', 7,
        'estimated_duration', '2-2.5 hours',
        'key_stakeholders', json_build_array('P01_CMO', 'P02_VPCLIN', 'P04_BIOSTAT', 'P10_PATADV', 'P05_REGDIR'),
        'regulatory_focus', json_build_array('FDA PRO Guidance 2009', 'COSMIN Checklist'),
        'instrument_types', json_build_array('Generic', 'Disease-Specific', 'Symptom-Specific', 'HRQOL'),
        'related_use_cases', json_build_array('UC_CD_001', 'UC_CD_003')
      )
    ),
    
    -- UC_CD_006: Adaptive Trial Design
    (
      'UC_CD_006',
      'DTx Adaptive Trial Design',
      'Advanced guidance for implementing adaptive trial designs in DTx studies, including sample size re-estimation, interim analyses, and response-adaptive randomization.',
      'Expert',
      'USC-CD-006',
      jsonb_build_object(
        'pattern', 'ENSEMBLE',
        'dependencies', json_build_array('UC_CD_003', 'UC_CD_007'),
        'total_workflows', 8,
        'estimated_duration', '3-4 hours',
        'key_stakeholders', json_build_array('P01_CMO', 'P02_VPCLIN', 'P04_BIOSTAT', 'P05_REGDIR'),
        'adaptive_types', json_build_array('Type 1: Sample Size Re-estimation', 'Type 2: Interim Futility/Efficacy Stopping', 'Type 3: Response-Adaptive Randomization'),
        'regulatory_focus', json_build_array('FDA Guidance: Adaptive Designs 2019', 'Type I Error Control'),
        'related_use_cases', json_build_array('UC_CD_003', 'UC_CD_007', 'UC_RA_004')
      )
    ),
    
    -- UC_CD_007: Sample Size Calculation
    (
      'UC_CD_007',
      'Sample Size Calculation for DTx Trials',
      'Specialized sample size calculation for digital therapeutic trials, accounting for unique factors like high attrition, engagement variability, and digital endpoints.',
      'Intermediate',
      'USC-CD-007',
      jsonb_build_object(
        'pattern', 'COT',
        'dependencies', json_build_array('UC_CD_001', 'UC_CD_003'),
        'total_workflows', 6,
        'estimated_duration', '1.5-2 hours',
        'key_stakeholders', json_build_array('P04_BIOSTAT', 'P01_CMO', 'P02_VPCLIN'),
        'dtx_considerations', json_build_array('High Attrition 25-40%', 'Engagement Variability', 'Digital Endpoints', 'Per-Protocol Analysis'),
        'statistical_methods', json_build_array('ANCOVA', 'Mixed Models', 'Power Analysis', 'Attrition Adjustment'),
        'related_use_cases', json_build_array('UC_CD_001', 'UC_CD_003', 'UC_CD_006')
      )
    ),
    
    -- UC_CD_008: Engagement Metrics Endpoints
    (
      'UC_CD_008',
      'DTx Engagement Metrics as Endpoints',
      'Framework for defining, measuring, and analyzing digital therapeutic engagement metrics as clinical trial endpoints and mechanism-of-action evidence.',
      'Intermediate',
      'USC-CD-008',
      jsonb_build_object(
        'pattern', 'COT_WITH_CHECKLIST',
        'dependencies', json_build_array('UC_CD_001', 'UC_CD_003'),
        'total_workflows', 5,
        'estimated_duration', '2-2.5 hours',
        'key_stakeholders', json_build_array('P01_CMO', 'P02_VPCLIN', 'P04_BIOSTAT', 'P03_PRODMGR', 'P05_REGDIR'),
        'engagement_categories', json_build_array('Frequency Metrics', 'Duration Metrics', 'Content Metrics', 'Interaction Metrics'),
        'statistical_approaches', json_build_array('Mediation Analysis', 'Dose-Response', 'Threshold Analysis'),
        'fda_perspective', 'Engagement alone NOT sufficient for effectiveness; can support mechanism of action',
        'related_use_cases', json_build_array('UC_CD_001', 'UC_PD_005', 'UC_EG_001')
      )
    ),
    
    -- UC_CD_009: Subgroup Analysis Planning
    (
      'UC_CD_009',
      'Subgroup Analysis Planning',
      'Structured approach to planning subgroup analyses in DTx trials, addressing heterogeneity of treatment effects and supporting personalized medicine claims.',
      'Intermediate',
      'USC-CD-009',
      jsonb_build_object(
        'pattern', 'COT',
        'dependencies', json_build_array('UC_CD_003'),
        'total_workflows', 5,
        'estimated_duration', '1.5-2 hours',
        'key_stakeholders', json_build_array('P01_CMO', 'P02_VPCLIN', 'P04_BIOSTAT'),
        'common_subgroups', json_build_array('Demographics', 'Disease Severity', 'Comorbidities', 'Prior Treatments', 'Engagement Level', 'Digital Literacy'),
        'statistical_considerations', json_build_array('Pre-specification', 'Interaction Testing', 'Multiple Comparisons', 'Power'),
        'regulatory_focus', json_build_array('FDA Race/Ethnicity Guidance 2016', 'EMA Subgroup Guidance 2019'),
        'related_use_cases', json_build_array('UC_CD_003', 'UC_CD_007')
      )
    ),
    
    -- UC_CD_010: Clinical Trial Protocol Development
    (
      'UC_CD_010',
      'Clinical Trial Protocol Development',
      'Comprehensive clinical trial protocol development for DTx studies, following ICH E6 (GCP) and ICH E8 guidelines.',
      'Advanced',
      'USC-CD-010',
      jsonb_build_object(
        'pattern', 'STRUCTURED_GENERATION',
        'dependencies', json_build_array('UC_CD_001', 'UC_CD_002', 'UC_CD_003', 'UC_CD_004', 'UC_CD_005', 'UC_CD_006', 'UC_CD_007', 'UC_CD_008', 'UC_CD_009'),
        'total_workflows', 12,
        'estimated_duration', '4-5 hours',
        'key_stakeholders', json_build_array('P01_CMO', 'P02_VPCLIN', 'P04_BIOSTAT', 'P05_REGDIR', 'P06_MEDDIR', 'P08_DATADIR', 'P10_PROJMGR', 'P11_SITEPI'),
        'protocol_structure', 'ICH E6 (R2) - 19 sections',
        'quality_standards', json_build_array('ICH-GCP Compliance', 'Section Completeness', 'Clarity Score >4.0', 'Feasibility Score >4.0'),
        'related_use_cases', json_build_array('ALL UC_CD_001-009', 'UC_RA_004', 'UC_PD_001')
      )
    )
) AS uc_data(code, title, summary, complexity, unique_id, metadata)
WHERE d.tenant_id = sc.tenant_id AND d.code = 'CD'
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  complexity = EXCLUDED.complexity,
  unique_id = EXCLUDED.unique_id,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 2: WORKFLOWS - Grouped by Use Case
-- =====================================================================================

-- UC_CD_001: DTx Clinical Endpoint Selection (8 workflows)
INSERT INTO dh_workflow (tenant_id, use_case_id, name, description, position, metadata)
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
    (
      'Clinical Context Definition',
      'Define the clinical context, target indication, patient population, DTx mechanism of action, and treatment duration.',
      1,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P01_CMO',
        'supporting_personas', json_build_array('P02_VPCLIN', 'P10_PATADV'),
        'key_outputs', json_build_array('Target indication', 'Patient population', 'Mechanism of action', 'Treatment duration')
      )
    ),
    (
      'Regulatory Precedent Research',
      'Research FDA/EMA precedent for similar DTx products, approved endpoints, and regulatory guidance.',
      2,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P05_REGDIR',
        'supporting_personas', json_build_array('P02_VPCLIN'),
        'key_outputs', json_build_array('Prior DTx approvals', 'Accepted endpoints', 'Regulatory precedent')
      )
    ),
    (
      'Candidate Endpoint Identification',
      'Generate candidate primary and secondary endpoints based on clinical context and regulatory precedent.',
      3,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P01_CMO',
        'supporting_personas', json_build_array('P02_VPCLIN', 'P04_BIOSTAT', 'P10_PATADV', 'P06_PMDIG'),
        'key_outputs', json_build_array('Primary endpoint candidates', 'Secondary endpoint candidates', 'Digital biomarker opportunities')
      )
    ),
    (
      'Psychometric Evaluation',
      'Evaluate psychometric properties of candidate endpoints (validity, reliability, responsiveness).',
      4,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P02_VPCLIN'),
        'key_outputs', json_build_array('Validity assessment', 'Reliability assessment', 'Responsiveness assessment')
      )
    ),
    (
      'Regulatory Risk Assessment',
      'Assess regulatory risk for each candidate endpoint and identify mitigation strategies.',
      5,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P05_REGDIR',
        'supporting_personas', json_build_array('P01_CMO'),
        'key_outputs', json_build_array('Risk assessment', 'Mitigation strategies', 'FDA acceptance probability')
      )
    ),
    (
      'Digital Feasibility Assessment',
      'Assess technical feasibility of digital implementation for each candidate endpoint.',
      6,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P06_PMDIG',
        'supporting_personas', json_build_array('P02_VPCLIN', 'P10_PATADV'),
        'key_outputs', json_build_array('Technical feasibility', 'Data collection capabilities', 'User experience considerations')
      )
    ),
    (
      'Patient Burden Assessment',
      'Evaluate patient burden for assessment procedures and identify ways to minimize burden.',
      7,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P10_PATADV',
        'supporting_personas', json_build_array('P02_VPCLIN', 'P06_PMDIG'),
        'key_outputs', json_build_array('Burden assessment', 'Minimization strategies', 'Patient perspective')
      )
    ),
    (
      'Final Endpoint Recommendation',
      'Synthesize all analyses and make final recommendation for primary and secondary endpoints.',
      8,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P01_CMO',
        'supporting_personas', json_build_array('P02_VPCLIN', 'P04_BIOSTAT', 'P05_REGDIR'),
        'key_outputs', json_build_array('Primary endpoint recommendation', 'Secondary endpoints', 'Rationale document', 'Risk mitigation plan')
      )
    )
) AS wf_data(name, description, position, metadata)
WHERE uc.tenant_id = sc.tenant_id AND uc.code = 'UC_CD_001'
ON CONFLICT (use_case_id, name)
DO UPDATE SET
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- UC_CD_002: Digital Biomarker Validation (9 workflows)
INSERT INTO dh_workflow (tenant_id, use_case_id, name, description, position, metadata)
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
    (
      'Define Intended Use & Context',
      'Define intended use, clinical context, target population, and endpoint type for digital biomarker.',
      1,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P06_DTXCMO',
        'supporting_personas', json_build_array('P01_CMO', 'P04_REGDIR'),
        'key_outputs', json_build_array('Intended use statement', 'Context of use', 'Regulatory pathway')
      )
    ),
    (
      'Design Verification Study (V1)',
      'Design technical verification study to assess accuracy, precision, and reliability of digital biomarker.',
      2,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P07_DATASC',
        'supporting_personas', json_build_array('P06_DTXCMO'),
        'key_outputs', json_build_array('Verification protocol', 'Gold standard selection', 'Statistical analysis plan')
      )
    ),
    (
      'Execute Verification & Analysis',
      'Conduct verification study and analyze technical performance data.',
      3,
      jsonb_build_object(
        'estimated_duration', '40-60 minutes',
        'lead_persona', 'P07_DATASC',
        'supporting_personas', json_build_array(),
        'key_outputs', json_build_array('Verification results', 'ICC/Bland-Altman analysis', 'Technical performance report')
      )
    ),
    (
      'Design Analytical Validation (V2)',
      'Design analytical validation study to assess construct validity, convergent validity, and reliability.',
      4,
      jsonb_build_object(
        'estimated_duration', '40-50 minutes',
        'lead_persona', 'P08_CLINRES',
        'supporting_personas', json_build_array('P06_DTXCMO', 'P04_BIOSTAT'),
        'key_outputs', json_build_array('Analytical validation protocol', 'Sample size calculation', 'Comparator selection')
      )
    ),
    (
      'Execute Analytical Validation',
      'Conduct analytical validation study and perform psychometric analyses.',
      5,
      jsonb_build_object(
        'estimated_duration', '50-70 minutes',
        'lead_persona', 'P08_CLINRES',
        'supporting_personas', json_build_array('P04_BIOSTAT'),
        'key_outputs', json_build_array('Validity results', 'Reliability results', 'Analytical validation report')
      )
    ),
    (
      'Design Clinical Validation (V3)',
      'Design clinical validation study to demonstrate clinical utility and association with outcomes.',
      6,
      jsonb_build_object(
        'estimated_duration', '40-50 minutes',
        'lead_persona', 'P08_CLINRES',
        'supporting_personas', json_build_array('P06_DTXCMO', 'P01_CMO', 'P04_BIOSTAT'),
        'key_outputs', json_build_array('Clinical validation protocol', 'Clinical utility endpoints', 'Statistical analysis plan')
      )
    ),
    (
      'Execute Clinical Validation & MCID',
      'Conduct clinical validation study and determine minimally clinically important difference (MCID).',
      7,
      jsonb_build_object(
        'estimated_duration', '60-80 minutes',
        'lead_persona', 'P08_CLINRES',
        'supporting_personas', json_build_array('P15_HEOR'),
        'key_outputs', json_build_array('Clinical validation results', 'MCID determination', 'Clinical utility evidence')
      )
    ),
    (
      'Regulatory Interaction Strategy',
      'Develop regulatory interaction strategy including Pre-Sub meeting preparation.',
      8,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P04_REGDIR',
        'supporting_personas', json_build_array('P06_DTXCMO', 'P01_CMO'),
        'key_outputs', json_build_array('Pre-Sub package', 'Regulatory strategy', 'FDA meeting plan')
      )
    ),
    (
      'Validation Report & Publication',
      'Prepare comprehensive validation report and manuscript for peer-reviewed publication.',
      9,
      jsonb_build_object(
        'estimated_duration', '40-50 minutes',
        'lead_persona', 'P16_MEDWRIT',
        'supporting_personas', json_build_array('P06_DTXCMO', 'P08_CLINRES'),
        'key_outputs', json_build_array('Validation report', 'Manuscript draft', 'Conference presentations')
      )
    )
) AS wf_data(name, description, position, metadata)
WHERE uc.tenant_id = sc.tenant_id AND uc.code = 'UC_CD_002'
ON CONFLICT (use_case_id, name)
DO UPDATE SET
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- UC_CD_003: RCT Design (10 workflows)
INSERT INTO dh_workflow (tenant_id, use_case_id, name, description, position, metadata)
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
    (
      'Clinical Hypothesis Definition',
      'Define clinical hypothesis, primary objective, and success criteria for RCT.',
      1,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P01_CMO',
        'supporting_personas', json_build_array('P02_VPCLIN'),
        'key_outputs', json_build_array('Clinical hypothesis', 'Primary objective', 'Success criteria')
      )
    ),
    (
      'Trial Design Selection',
      'Select optimal trial design (parallel, crossover, factorial) and justification.',
      2,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO', 'P02_VPCLIN'),
        'key_outputs', json_build_array('Trial design recommendation', 'Design justification', 'Alternative designs considered')
      )
    ),
    (
      'Blinding Strategy',
      'Design blinding approach including sham app development and double-blind procedures.',
      3,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P06_PMDIG', 'P05_REGDIR'),
        'key_outputs', json_build_array('Blinding strategy', 'Sham app specifications', 'Unblinding procedures')
      )
    ),
    (
      'Randomization Strategy',
      'Design randomization approach including stratification and allocation concealment.',
      4,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P02_VPCLIN'),
        'key_outputs', json_build_array('Randomization scheme', 'Stratification factors', 'Allocation concealment method')
      )
    ),
    (
      'Eligibility Criteria',
      'Define inclusion and exclusion criteria balancing generalizability and feasibility.',
      5,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P01_CMO', 'P03_CLTM', 'P10_PATADV'),
        'key_outputs', json_build_array('Inclusion criteria', 'Exclusion criteria', 'Rationale document')
      )
    ),
    (
      'Engagement Strategy',
      'Define engagement monitoring approach and minimum engagement thresholds for per-protocol analysis.',
      6,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P06_PMDIG',
        'supporting_personas', json_build_array('P02_VPCLIN', 'P04_BIOSTAT'),
        'key_outputs', json_build_array('Engagement metrics', 'Minimum thresholds', 'Monitoring plan')
      )
    ),
    (
      'Retention Strategy',
      'Develop comprehensive retention strategy to minimize attrition (target <30%).',
      7,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P03_CLTM',
        'supporting_personas', json_build_array('P08_CLOPS', 'P10_PATADV'),
        'key_outputs', json_build_array('Retention strategies', 'Incentive plan', 'Communication plan')
      )
    ),
    (
      'Sample Size & Power',
      'Calculate sample size accounting for DTx-specific attrition and engagement variability.',
      8,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO', 'P02_VPCLIN'),
        'key_outputs', json_build_array('Sample size calculation', 'Power analysis', 'Attrition assumptions')
      )
    ),
    (
      'Statistical Analysis Plan',
      'Develop comprehensive statistical analysis plan including ITT and per-protocol analyses.',
      9,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO', 'P02_VPCLIN'),
        'key_outputs', json_build_array('SAP outline', 'Primary analysis method', 'Missing data approach', 'Sensitivity analyses')
      )
    ),
    (
      'Operational Feasibility',
      'Assess operational feasibility including recruitment, site selection, and budget.',
      10,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P08_CLOPS',
        'supporting_personas', json_build_array('P03_CLTM', 'P02_VPCLIN'),
        'key_outputs', json_build_array('Feasibility assessment', 'Site selection criteria', 'Budget estimate', 'Timeline')
      )
    )
) AS wf_data(name, description, position, metadata)
WHERE uc.tenant_id = sc.tenant_id AND uc.code = 'UC_CD_003'
ON CONFLICT (use_case_id, name)
DO UPDATE SET
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- UC_CD_004: Comparator Selection (6 workflows)
INSERT INTO dh_workflow (tenant_id, use_case_id, name, description, position, metadata)
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
    (
      'Standard of Care Assessment',
      'Assess current standard of care for target condition and available treatment options.',
      1,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P01_CMO',
        'supporting_personas', json_build_array('P02_VPCLIN'),
        'key_outputs', json_build_array('Standard of care summary', 'Available treatments', 'Treatment gaps')
      )
    ),
    (
      'Comparator Options Analysis',
      'Analyze all comparator options (placebo, sham, standard of care, active control).',
      2,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P01_CMO', 'P05_REGDIR'),
        'key_outputs', json_build_array('Comparator options', 'Pros and cons', 'Feasibility assessment')
      )
    ),
    (
      'Regulatory Precedent Review',
      'Review regulatory precedent for comparator selection in similar indications.',
      3,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P05_REGDIR',
        'supporting_personas', json_build_array('P02_VPCLIN'),
        'key_outputs', json_build_array('Regulatory precedent', 'FDA/EMA expectations', 'Prior approvals')
      )
    ),
    (
      'Sham App Design Strategy',
      'Design sham app strategy if double-blind required, ensuring credibility and feasibility.',
      4,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P06_PMDIG', 'P01_CMO'),
        'key_outputs', json_build_array('Sham app specifications', 'Credibility assessment', 'Development timeline')
      )
    ),
    (
      'Statistical Implications',
      'Assess statistical implications of comparator choice on power, sample size, and analysis.',
      5,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO', 'P02_VPCLIN'),
        'key_outputs', json_build_array('Power implications', 'Sample size impact', 'Analysis considerations')
      )
    ),
    (
      'Final Comparator Recommendation',
      'Make final comparator recommendation with full justification and risk assessment.',
      6,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P01_CMO',
        'supporting_personas', json_build_array('P02_VPCLIN', 'P05_REGDIR', 'P04_BIOSTAT'),
        'key_outputs', json_build_array('Comparator recommendation', 'Justification document', 'Risk mitigation plan')
      )
    )
) AS wf_data(name, description, position, metadata)
WHERE uc.tenant_id = sc.tenant_id AND uc.code = 'UC_CD_004'
ON CONFLICT (use_case_id, name)
DO UPDATE SET
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- UC_CD_005: PRO Instrument Selection (7 workflows)
INSERT INTO dh_workflow (tenant_id, use_case_id, name, description, position, metadata)
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
    (
      'Define Measurement Construct',
      'Define the specific construct to be measured (symptom, function, quality of life).',
      1,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P01_CMO',
        'supporting_personas', json_build_array('P02_VPCLIN', 'P10_PATADV'),
        'key_outputs', json_build_array('Construct definition', 'Measurement domains', 'Patient importance')
      )
    ),
    (
      'PRO Database Search',
      'Search PRO databases (PROQOLID, ePROVIDE) for existing validated instruments.',
      2,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P04_BIOSTAT'),
        'key_outputs', json_build_array('Candidate instruments', 'Instrument descriptions', 'Validation status')
      )
    ),
    (
      'Psychometric Property Review',
      'Review psychometric properties of candidate instruments (validity, reliability, responsiveness).',
      3,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P02_VPCLIN'),
        'key_outputs', json_build_array('Psychometric evaluation', 'COSMIN assessment', 'Instrument comparison')
      )
    ),
    (
      'Regulatory Acceptability',
      'Assess FDA/EMA acceptability of candidate instruments based on PRO guidance.',
      4,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P05_REGDIR',
        'supporting_personas', json_build_array('P01_CMO', 'P02_VPCLIN'),
        'key_outputs', json_build_array('Regulatory assessment', 'FDA acceptance probability', 'Additional validation needs')
      )
    ),
    (
      'Patient Burden & Usability',
      'Assess patient burden, completion time, and digital usability of instruments.',
      5,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P10_PATADV',
        'supporting_personas', json_build_array('P02_VPCLIN'),
        'key_outputs', json_build_array('Burden assessment', 'Completion time', 'Usability evaluation')
      )
    ),
    (
      'Licensing & Implementation',
      'Assess licensing requirements, costs, and digital implementation feasibility.',
      6,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P06_PMDIG'),
        'key_outputs', json_build_array('Licensing assessment', 'Cost estimate', 'Implementation plan')
      )
    ),
    (
      'Final PRO Recommendation',
      'Make final PRO instrument recommendation with validation plan if needed.',
      7,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P01_CMO',
        'supporting_personas', json_build_array('P02_VPCLIN', 'P04_BIOSTAT', 'P05_REGDIR'),
        'key_outputs', json_build_array('PRO recommendation', 'Justification document', 'Validation plan')
      )
    )
) AS wf_data(name, description, position, metadata)
WHERE uc.tenant_id = sc.tenant_id AND uc.code = 'UC_CD_005'
ON CONFLICT (use_case_id, name)
DO UPDATE SET
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- UC_CD_006: Adaptive Trial Design (8 workflows)
INSERT INTO dh_workflow (tenant_id, use_case_id, name, description, position, metadata)
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
    (
      'Adaptive Design Rationale',
      'Define rationale for adaptive design, uncertainty areas, and adaptation objectives.',
      1,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P01_CMO',
        'supporting_personas', json_build_array('P04_BIOSTAT', 'P02_VPCLIN'),
        'key_outputs', json_build_array('Adaptation rationale', 'Uncertainty areas', 'Design objectives')
      )
    ),
    (
      'Adaptive Design Type Selection',
      'Select appropriate adaptive design type (Type 1, 2, or 3) based on objectives.',
      2,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO', 'P02_VPCLIN'),
        'key_outputs', json_build_array('Design type recommendation', 'Type justification', 'Alternative designs')
      )
    ),
    (
      'Interim Analysis Plan',
      'Design interim analysis plan including timing, stopping boundaries, and decision rules.',
      3,
      jsonb_build_object(
        'estimated_duration', '40-50 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO'),
        'key_outputs', json_build_array('Interim analysis plan', 'Stopping boundaries', 'Decision rules')
      )
    ),
    (
      'Type I Error Control',
      'Develop Type I error control strategy and demonstrate alpha spending approach.',
      4,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array(),
        'key_outputs', json_build_array('Alpha spending function', 'Type I error control proof', 'Simulation results')
      )
    ),
    (
      'Operational Bias Mitigation',
      'Identify operational bias risks and design mitigation strategies.',
      5,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P04_BIOSTAT', 'P05_REGDIR'),
        'key_outputs', json_build_array('Bias assessment', 'Mitigation strategies', 'Governance plan')
      )
    ),
    (
      'Simulation Study',
      'Conduct simulation study to evaluate operating characteristics of adaptive design.',
      6,
      jsonb_build_object(
        'estimated_duration', '50-60 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO'),
        'key_outputs', json_build_array('Simulation results', 'Operating characteristics', 'Scenario analysis')
      )
    ),
    (
      'Regulatory Strategy',
      'Develop regulatory interaction strategy including FDA Type C meeting preparation.',
      7,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P05_REGDIR',
        'supporting_personas', json_build_array('P01_CMO', 'P04_BIOSTAT'),
        'key_outputs', json_build_array('Regulatory strategy', 'Type C meeting package', 'FDA Q&A preparation')
      )
    ),
    (
      'Adaptive Design Documentation',
      'Prepare comprehensive adaptive design documentation including SAP and charter.',
      8,
      jsonb_build_object(
        'estimated_duration', '40-50 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P02_VPCLIN'),
        'key_outputs', json_build_array('Adaptive design SAP', 'DMC charter', 'Simulation report')
      )
    )
) AS wf_data(name, description, position, metadata)
WHERE uc.tenant_id = sc.tenant_id AND uc.code = 'UC_CD_006'
ON CONFLICT (use_case_id, name)
DO UPDATE SET
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- UC_CD_007: Sample Size Calculation (6 workflows)
INSERT INTO dh_workflow (tenant_id, use_case_id, name, description, position, metadata)
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
    (
      'Effect Size Determination',
      'Determine expected effect size based on clinical meaningfulness and prior data.',
      1,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO', 'P02_VPCLIN'),
        'key_outputs', json_build_array('Effect size estimate', 'MCID consideration', 'Literature review')
      )
    ),
    (
      'Attrition Rate Estimation',
      'Estimate attrition rate specific to DTx trials (typically 25-40%).',
      2,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P02_VPCLIN', 'P03_CLTM'),
        'key_outputs', json_build_array('Attrition estimate', 'Justification', 'Retention strategy impact')
      )
    ),
    (
      'Engagement Variability',
      'Account for engagement variability and per-protocol analysis in sample size.',
      3,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO', 'P06_PMDIG'),
        'key_outputs', json_build_array('Engagement assumptions', 'PP population estimate', 'Sensitivity analysis')
      )
    ),
    (
      'Statistical Method Selection',
      'Select appropriate statistical analysis method (ANCOVA, mixed models, etc.).',
      4,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO'),
        'key_outputs', json_build_array('Analysis method', 'Method justification', 'Assumptions')
      )
    ),
    (
      'Power Analysis & Calculation',
      'Conduct power analysis and calculate required sample size with DTx adjustments.',
      5,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array(),
        'key_outputs', json_build_array('Sample size calculation', 'Power curves', 'Sensitivity analyses')
      )
    ),
    (
      'Feasibility & Budget Impact',
      'Assess recruitment feasibility and budget implications of calculated sample size.',
      6,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P01_CMO', 'P04_BIOSTAT', 'P08_CLOPS'),
        'key_outputs', json_build_array('Feasibility assessment', 'Budget impact', 'Timeline estimate')
      )
    )
) AS wf_data(name, description, position, metadata)
WHERE uc.tenant_id = sc.tenant_id AND uc.code = 'UC_CD_007'
ON CONFLICT (use_case_id, name)
DO UPDATE SET
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- UC_CD_008: Engagement Metrics (5 workflows)
INSERT INTO dh_workflow (tenant_id, use_case_id, name, description, position, metadata)
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
    (
      'Define Engagement Taxonomy',
      'Define comprehensive engagement taxonomy (frequency, duration, content, interaction).',
      1,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P03_PRODMGR', 'P01_CMO'),
        'key_outputs', json_build_array('Engagement taxonomy', 'Metric definitions', 'Measurement hierarchy')
      )
    ),
    (
      'Operationalize Metrics',
      'Operationalize engagement metrics with precise technical specifications.',
      2,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P02_VPCLIN', 'P03_PRODMGR'),
        'key_outputs', json_build_array('Metric specifications', 'Data capture plan', 'Quality checks')
      )
    ),
    (
      'Dose-Response Analysis Design',
      'Design dose-response analysis to relate engagement to clinical outcomes.',
      3,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO'),
        'key_outputs', json_build_array('Dose-response plan', 'Statistical methods', 'Threshold analysis')
      )
    ),
    (
      'Mediation Analysis Strategy',
      'Design mediation analysis to test if engagement mediates treatment effect.',
      4,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO'),
        'key_outputs', json_build_array('Mediation model', 'Causal pathway', 'Analysis plan')
      )
    ),
    (
      'Regulatory Positioning',
      'Develop regulatory positioning strategy for engagement data in submissions.',
      5,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P05_REGDIR',
        'supporting_personas', json_build_array('P01_CMO', 'P02_VPCLIN'),
        'key_outputs', json_build_array('Regulatory strategy', 'FDA messaging', 'Pre-Sub materials')
      )
    )
) AS wf_data(name, description, position, metadata)
WHERE uc.tenant_id = sc.tenant_id AND uc.code = 'UC_CD_008'
ON CONFLICT (use_case_id, name)
DO UPDATE SET
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- UC_CD_009: Subgroup Analysis (5 workflows)
INSERT INTO dh_workflow (tenant_id, use_case_id, name, description, position, metadata)
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
    (
      'Identify Candidate Subgroups',
      'Identify candidate subgroups based on disease biology, prior data, and hypotheses.',
      1,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P01_CMO',
        'supporting_personas', json_build_array('P02_VPCLIN'),
        'key_outputs', json_build_array('Candidate subgroups', 'Biological rationale', 'Literature review')
      )
    ),
    (
      'Pre-Specification Requirements',
      'Pre-specify all subgroup analyses to avoid data dredging and ensure credibility.',
      2,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO', 'P02_VPCLIN'),
        'key_outputs', json_build_array('Pre-specified subgroups', 'Interaction hypotheses', 'Documentation')
      )
    ),
    (
      'Statistical Methods',
      'Define statistical methods for interaction testing and multiple comparison adjustment.',
      3,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO'),
        'key_outputs', json_build_array('Statistical methods', 'Interaction tests', 'Multiplicity adjustment')
      )
    ),
    (
      'Power & Sample Size',
      'Assess power for subgroup analyses and acknowledge likely underpowering.',
      4,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO', 'P02_VPCLIN'),
        'key_outputs', json_build_array('Power calculations', 'Sample size by subgroup', 'Interpretation guidance')
      )
    ),
    (
      'Interpretation Framework',
      'Develop interpretation framework to avoid over-interpretation of subgroup findings.',
      5,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P01_CMO',
        'supporting_personas', json_build_array('P04_BIOSTAT', 'P02_VPCLIN'),
        'key_outputs', json_build_array('Interpretation guidelines', 'Credibility criteria', 'Regulatory positioning')
      )
    )
) AS wf_data(name, description, position, metadata)
WHERE uc.tenant_id = sc.tenant_id AND uc.code = 'UC_CD_009'
ON CONFLICT (use_case_id, name)
DO UPDATE SET
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- UC_CD_010: Protocol Development (12 workflows)
INSERT INTO dh_workflow (tenant_id, use_case_id, name, description, position, metadata)
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
    (
      'Protocol Synopsis',
      'Develop comprehensive protocol synopsis (<3 pages) with all key elements.',
      1,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P01_CMO', 'P05_REGDIR'),
        'key_outputs', json_build_array('Protocol synopsis', 'Key design elements', 'Quick reference')
      )
    ),
    (
      'Background & Rationale',
      'Write background section including disease context, DTx mechanism, and rationale.',
      2,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P01_CMO',
        'supporting_personas', json_build_array('P06_MEDDIR'),
        'key_outputs', json_build_array('Background section', 'Clinical rationale', 'Scientific justification')
      )
    ),
    (
      'Objectives & Endpoints',
      'Define study objectives (primary, secondary, exploratory) and all endpoints.',
      3,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P01_CMO', 'P04_BIOSTAT'),
        'key_outputs', json_build_array('Objectives section', 'Endpoint definitions', 'Success criteria')
      )
    ),
    (
      'Study Design',
      'Detail complete study design including randomization, blinding, and treatment arms.',
      4,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P04_BIOSTAT', 'P01_CMO'),
        'key_outputs', json_build_array('Design section', 'Study diagram', 'Treatment allocation')
      )
    ),
    (
      'Study Population',
      'Define study population including inclusion/exclusion criteria and recruitment plan.',
      5,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P01_CMO', 'P06_MEDDIR'),
        'key_outputs', json_build_array('Population section', 'Eligibility criteria', 'Recruitment strategy')
      )
    ),
    (
      'Interventions',
      'Describe all study interventions including DTx specifications and comparators.',
      6,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P01_CMO', 'P06_MEDDIR'),
        'key_outputs', json_build_array('Intervention section', 'DTx specifications', 'Dosing/usage instructions')
      )
    ),
    (
      'Study Procedures',
      'Detail all study procedures including visit schedule and assessments.',
      7,
      jsonb_build_object(
        'estimated_duration', '30-40 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P10_PROJMGR', 'P11_SITEPI'),
        'key_outputs', json_build_array('Procedures section', 'Schedule of assessments', 'Visit procedures')
      )
    ),
    (
      'Statistical Considerations',
      'Write comprehensive statistical section including all analyses and sample size.',
      8,
      jsonb_build_object(
        'estimated_duration', '40-60 minutes',
        'lead_persona', 'P04_BIOSTAT',
        'supporting_personas', json_build_array('P01_CMO', 'P02_VPCLIN'),
        'key_outputs', json_build_array('Statistical section', 'Analysis plan', 'Sample size justification')
      )
    ),
    (
      'Safety Assessments',
      'Define safety monitoring plan including AE collection and management.',
      9,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P06_MEDDIR',
        'supporting_personas', json_build_array('P01_CMO', 'P05_REGDIR'),
        'key_outputs', json_build_array('Safety section', 'AE definitions', 'Monitoring plan')
      )
    ),
    (
      'Data Management',
      'Define data management plan including EDC, data quality, and database lock.',
      10,
      jsonb_build_object(
        'estimated_duration', '15-20 minutes',
        'lead_persona', 'P08_DATADIR',
        'supporting_personas', json_build_array('P02_VPCLIN'),
        'key_outputs', json_build_array('Data management section', 'EDC plan', 'Quality procedures')
      )
    ),
    (
      'Ethical & Regulatory',
      'Write ethical considerations, informed consent, and regulatory compliance sections.',
      11,
      jsonb_build_object(
        'estimated_duration', '20-30 minutes',
        'lead_persona', 'P05_REGDIR',
        'supporting_personas', json_build_array('P02_VPCLIN'),
        'key_outputs', json_build_array('Ethics section', 'Informed consent', 'Regulatory compliance')
      )
    ),
    (
      'Protocol Review & Finalization',
      'Conduct multi-function protocol review and finalize for IRB/IND submission.',
      12,
      jsonb_build_object(
        'estimated_duration', '40-60 minutes',
        'lead_persona', 'P02_VPCLIN',
        'supporting_personas', json_build_array('P01_CMO', 'P04_BIOSTAT', 'P05_REGDIR', 'P06_MEDDIR', 'P10_PROJMGR'),
        'key_outputs', json_build_array('Final protocol', 'Quality check complete', 'Approval signatures')
      )
    )
) AS wf_data(name, description, position, metadata)
WHERE uc.tenant_id = sc.tenant_id AND uc.code = 'UC_CD_010'
ON CONFLICT (use_case_id, name)
DO UPDATE SET
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 3: UPDATE WORKFLOW UNIQUE_IDS
-- =====================================================================================

-- Auto-generate unique_ids for all workflows that don't have them yet
UPDATE dh_workflow wf
SET unique_id = 'WFL-' ||
  split_part(uc.code, '_', 2) || '-' ||
  split_part(uc.code, '_', 3) || '-' ||
  to_char(wf.position, 'FM000')
FROM dh_use_case uc
WHERE wf.use_case_id = uc.id
  AND uc.code LIKE 'UC_CD_%'
  AND wf.unique_id IS NULL;

-- Restore NOT NULL constraint on workflow unique_id
ALTER TABLE dh_workflow ALTER COLUMN unique_id SET NOT NULL;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

-- Verify all use cases were created
SELECT 
  'Use Cases Created' as status,
  COUNT(*) as total_use_cases,
  COUNT(*) FILTER (WHERE complexity = 'EXPERT') as expert_level,
  COUNT(*) FILTER (WHERE complexity = 'ADVANCED') as advanced_level,
  COUNT(*) FILTER (WHERE complexity = 'INTERMEDIATE') as intermediate_level
FROM dh_use_case uc
JOIN dh_domain d ON uc.domain_id = d.id
WHERE d.tenant_id = (SELECT tenant_id FROM session_config)
  AND d.code = 'CD';

-- Verify all workflows were created
SELECT 
  'Workflows Created' as status,
  uc.code as use_case_code,
  uc.title as use_case_title,
  COUNT(w.id) as workflow_count
FROM dh_use_case uc
JOIN dh_domain d ON uc.domain_id = d.id
LEFT JOIN dh_workflow w ON w.use_case_id = uc.id
WHERE d.tenant_id = (SELECT tenant_id FROM session_config)
  AND d.code = 'CD'
GROUP BY uc.code, uc.title, uc.id
ORDER BY uc.code;

-- Total workflow count
SELECT 
  'Total Workflows' as status,
  COUNT(*) as total_workflows
FROM dh_workflow w
JOIN dh_use_case uc ON w.use_case_id = uc.id
JOIN dh_domain d ON uc.domain_id = d.id
WHERE d.tenant_id = (SELECT tenant_id FROM session_config)
  AND d.code = 'CD';

-- =====================================================================================
-- END OF SCRIPT
-- =====================================================================================
-- Next: Execute 03_agents.sql for task-role mappings
-- =====================================================================================

