-- =====================================================================================
-- 01_all_domains_and_usecases.sql
-- Digital Health Domains & Use Cases - Complete Foundation
-- =====================================================================================
-- Purpose: Seed all 5 domains and 50 use cases for Digital Health platform
-- Dependencies: Tenant must exist (digital-health-startup)
-- Execution Order: 1 of N
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
-- SECTION 1: DOMAIN SETUP - All 5 Digital Health Domains
-- =====================================================================================

INSERT INTO dh_domain (tenant_id, code, name, description, unique_id, metadata)
SELECT 
  sc.tenant_id,
  d_data.code,
  d_data.name,
  d_data.description,
  d_data.unique_id,
  d_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    (
      'CD',
      'Clinical Development',
      'Clinical trial design, endpoint selection, and protocol development for digital health products. Supports clinical scientists, biostatisticians, and medical directors.',
      'DMN-CD',
      jsonb_build_object(
        'total_use_cases', 10,
        'primary_stakeholders', json_build_array('Clinical Scientists', 'Biostatisticians', 'Medical Directors', 'Clinical Research'),
        'focus_areas', json_build_array('Trial Design', 'Endpoints', 'Biomarker Development', 'Protocol Development'),
        'complexity_distribution', jsonb_build_object(
          'basic', 2,
          'intermediate', 3,
          'advanced', 3,
          'expert', 2
        )
      )
    ),
    (
      'RA',
      'Regulatory Affairs',
      'Navigate FDA/EMA regulatory pathways for digital health products. Supports regulatory affairs managers, quality assurance, and compliance teams.',
      'DMN-RA',
      jsonb_build_object(
        'total_use_cases', 10,
        'primary_stakeholders', json_build_array('Regulatory Affairs', 'Quality Assurance', 'Legal', 'Compliance'),
        'focus_areas', json_build_array('FDA Pathways', 'Documentation', 'Compliance', 'International'),
        'complexity_distribution', jsonb_build_object(
          'basic', 1,
          'intermediate', 2,
          'advanced', 4,
          'expert', 3
        )
      )
    ),
    (
      'MA',
      'Market Access',
      'Payer strategy, reimbursement, and market access for digital health products. Supports market access directors, HEOR teams, and health economists.',
      'DMN-MA',
      jsonb_build_object(
        'total_use_cases', 10,
        'primary_stakeholders', json_build_array('Market Access Directors', 'HEOR Teams', 'Payer Relations', 'Health Economists'),
        'focus_areas', json_build_array('Payer Strategy', 'Health Economics', 'Reimbursement', 'Value Demonstration'),
        'complexity_distribution', jsonb_build_object(
          'basic', 2,
          'intermediate', 4,
          'advanced', 2,
          'expert', 2
        )
      )
    ),
    (
      'PD',
      'Product Development',
      'Clinical requirements, UX design, and technical implementation for digital health products. Supports product managers, UX designers, and engineers.',
      'DMN-PD',
      jsonb_build_object(
        'total_use_cases', 10,
        'primary_stakeholders', json_build_array('Product Managers', 'UX Designers', 'Engineers', 'Clinical Informaticists'),
        'focus_areas', json_build_array('Clinical Requirements', 'UX/UI Design', 'Technical Implementation', 'Integration'),
        'complexity_distribution', jsonb_build_object(
          'basic', 3,
          'intermediate', 3,
          'advanced', 2,
          'expert', 2
        )
      )
    ),
    (
      'EG',
      'Evidence Generation',
      'Generate and synthesize evidence to support regulatory, reimbursement, and clinical adoption. Supports medical affairs, HEOR, and clinical scientists.',
      'DMN-EG',
      jsonb_build_object(
        'total_use_cases', 10,
        'primary_stakeholders', json_build_array('Medical Affairs', 'HEOR', 'Clinical Scientists', 'Medical Writers'),
        'focus_areas', json_build_array('Real-World Evidence', 'Publications', 'KOL Engagement', 'Outcomes Research'),
        'complexity_distribution', jsonb_build_object(
          'basic', 2,
          'intermediate', 3,
          'advanced', 3,
          'expert', 2
        )
      )
    )
) AS d_data(code, name, description, unique_id, metadata)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  unique_id = EXCLUDED.unique_id,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 2: USE CASES - All 50 Use Cases (10 per domain)
-- =====================================================================================

-- Clinical Development Use Cases (UC_CD_001 through UC_CD_010)
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
    -- UC_CD_001
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
        'key_stakeholders', json_build_array('Clinical Scientists', 'Biostatisticians', 'Medical Directors'),
        'regulatory_focus', json_build_array('FDA', 'EMA', 'MCID'),
        'related_use_cases', json_build_array('UC_CD_002', 'UC_CD_003', 'UC_RA_001', 'UC_MA_007')
      )
    ),
    -- UC_CD_002
    (
      'UC_CD_002',
      'Digital Biomarker Validation Strategy (DiMe V3)',
      'Structured approach to validating digital biomarkers following the DiMe V3 framework (Verification, Analytical Validation, Clinical Validation).',
      'Advanced',
      'USC-CD-002',
      jsonb_build_object(
        'pattern', 'COT_WITH_RAG',
        'dependencies', json_build_array('UC_CD_001', 'UC_PD_009'),
        'framework', 'DiMe V3',
        'regulatory_focus', json_build_array('FDA Digital Health', '21st Century Cures Act'),
        'related_use_cases', json_build_array('UC_CD_001', 'UC_PD_009', 'UC_RA_002')
      )
    ),
    -- UC_CD_003
    (
      'UC_CD_003',
      'RCT Design & Clinical Trial Strategy for DTx',
      'Comprehensive randomized controlled trial design specifically tailored for digital therapeutic interventions.',
      'Advanced',
      'USC-CD-003',
      jsonb_build_object(
        'pattern', 'COT_WITH_CHECKLIST',
        'dependencies', json_build_array('UC_CD_001', 'UC_CD_004'),
        'design_considerations', json_build_array('Blinding', 'Engagement', 'Attrition', 'Digital Endpoints'),
        'related_use_cases', json_build_array('UC_CD_001', 'UC_CD_007', 'UC_CD_010')
      )
    ),
    -- UC_CD_004
    (
      'UC_CD_004',
      'Comparator Selection Strategy',
      'Strategic guidance for selecting appropriate comparators in DTx clinical trials.',
      'Intermediate',
      'USC-CD-004',
      jsonb_build_object(
        'pattern', 'FEW_SHOT',
        'dependencies', json_build_array('UC_CD_003'),
        'comparator_types', json_build_array('Placebo', 'Sham App', 'Standard of Care', 'Active Control'),
        'related_use_cases', json_build_array('UC_CD_003', 'UC_RA_002')
      )
    ),
    -- UC_CD_005
    (
      'UC_CD_005',
      'Patient-Reported Outcome (PRO) Instrument Selection',
      'Systematic approach to selecting and validating PRO instruments for DTx trials.',
      'Intermediate',
      'USC-CD-005',
      jsonb_build_object(
        'pattern', 'COT_WITH_RAG',
        'dependencies', json_build_array('UC_CD_001'),
        'regulatory_focus', json_build_array('FDA PRO Guidance 2009', 'COSMIN Checklist'),
        'related_use_cases', json_build_array('UC_CD_001', 'UC_RA_004')
      )
    ),
    -- UC_CD_006
    (
      'UC_CD_006',
      'DTx Adaptive Trial Design',
      'Advanced guidance for implementing adaptive trial designs in DTx studies.',
      'Expert',
      'USC-CD-006',
      jsonb_build_object(
        'pattern', 'ENSEMBLE',
        'dependencies', json_build_array('UC_CD_003', 'UC_CD_007'),
        'adaptive_types', json_build_array('Sample Size Re-estimation', 'Interim Analysis', 'Response-Adaptive'),
        'regulatory_focus', json_build_array('FDA Adaptive Designs 2019'),
        'related_use_cases', json_build_array('UC_CD_003', 'UC_RA_004')
      )
    ),
    -- UC_CD_007
    (
      'UC_CD_007',
      'Sample Size Calculation for DTx Trials',
      'Specialized sample size calculation for digital therapeutic trials.',
      'Intermediate',
      'USC-CD-007',
      jsonb_build_object(
        'pattern', 'COT',
        'dependencies', json_build_array('UC_CD_001', 'UC_CD_003'),
        'dtx_considerations', json_build_array('High Attrition', 'Engagement Variability', 'Digital Endpoints'),
        'related_use_cases', json_build_array('UC_CD_001', 'UC_CD_003', 'UC_CD_006')
      )
    ),
    -- UC_CD_008
    (
      'UC_CD_008',
      'DTx Engagement Metrics as Endpoints',
      'Framework for defining and analyzing engagement metrics as clinical trial endpoints.',
      'Advanced',
      'USC-CD-008',
      jsonb_build_object(
        'pattern', 'COT_WITH_RAG',
        'dependencies', json_build_array('UC_CD_001', 'UC_PD_005'),
        'engagement_categories', json_build_array('Frequency', 'Duration', 'Content', 'Interaction'),
        'related_use_cases', json_build_array('UC_CD_001', 'UC_PD_005', 'UC_EG_001')
      )
    ),
    -- UC_CD_009
    (
      'UC_CD_009',
      'Subgroup Analysis Planning',
      'Structured approach to planning subgroup analyses in DTx trials.',
      'Intermediate',
      'USC-CD-009',
      jsonb_build_object(
        'pattern', 'COT',
        'dependencies', json_build_array('UC_CD_003'),
        'common_subgroups', json_build_array('Demographics', 'Disease Severity', 'Engagement Level'),
        'related_use_cases', json_build_array('UC_CD_003', 'UC_CD_007')
      )
    ),
    -- UC_CD_010
    (
      'UC_CD_010',
      'Clinical Trial Protocol Development',
      'Comprehensive clinical trial protocol development for DTx studies.',
      'Advanced',
      'USC-CD-010',
      jsonb_build_object(
        'pattern', 'STRUCTURED_GENERATION',
        'dependencies', json_build_array('UC_CD_001', 'UC_CD_002', 'UC_CD_003', 'UC_CD_004', 'UC_CD_005'),
        'protocol_structure', 'ICH E6 (R2)',
        'related_use_cases', json_build_array('UC_RA_004', 'UC_PD_001')
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

-- Regulatory Affairs Use Cases (UC_RA_001 through UC_RA_010)
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
    -- UC_RA_001
    (
      'UC_RA_001',
      'FDA Software Classification (SaMD)',
      'Systematic approach to determining if a product is Software as a Medical Device.',
      'Intermediate',
      'USC-RA-001',
      jsonb_build_object(
        'pattern', 'DECISION_TREE',
        'dependencies', json_build_array(),
        'regulatory_focus', json_build_array('FDA FD&C Act', 'SaMD Guidance'),
        'related_use_cases', json_build_array('UC_RA_002', 'UC_RA_003', 'UC_PD_008')
      )
    ),
    -- UC_RA_002
    (
      'UC_RA_002',
      '510(k) vs De Novo Pathway Determination',
      'Strategic determination of optimal FDA premarket pathway.',
      'Advanced',
      'USC-RA-002',
      jsonb_build_object(
        'pattern', 'COT_WITH_PRECEDENT',
        'dependencies', json_build_array('UC_RA_001'),
        'pathways', json_build_array('510(k)', 'Special 510(k)', 'De Novo'),
        'related_use_cases', json_build_array('UC_RA_001', 'UC_RA_003', 'UC_RA_004')
      )
    ),
    -- UC_RA_003
    (
      'UC_RA_003',
      'Predicate Device Identification',
      'Systematic identification and analysis of predicate devices for 510(k).',
      'Advanced',
      'USC-RA-003',
      jsonb_build_object(
        'pattern', 'RAG_WITH_SEARCH',
        'dependencies', json_build_array('UC_RA_002'),
        'related_use_cases', json_build_array('UC_RA_002', 'UC_RA_004')
      )
    ),
    -- UC_RA_004
    (
      'UC_RA_004',
      'Pre-Submission Meeting Preparation',
      'Comprehensive preparation for FDA Pre-Submission meetings.',
      'Intermediate',
      'USC-RA-004',
      jsonb_build_object(
        'pattern', 'STRUCTURED_TEMPLATE',
        'dependencies', json_build_array('UC_RA_001', 'UC_RA_002'),
        'meeting_types', json_build_array('Q-Submission', 'Pre-Sub Meeting'),
        'related_use_cases', json_build_array('UC_RA_002', 'UC_CD_010')
      )
    ),
    -- UC_RA_005
    (
      'UC_RA_005',
      'Clinical Evaluation Report (CER)',
      'Development of Clinical Evaluation Reports for medical devices.',
      'Advanced',
      'USC-RA-005',
      jsonb_build_object(
        'pattern', 'STRUCTURED_GENERATION',
        'dependencies', json_build_array('UC_CD_010', 'UC_EG_009'),
        'regulatory_focus', json_build_array('EU MDR', 'MEDDEV 2.7/1 Rev 4'),
        'related_use_cases', json_build_array('UC_CD_010', 'UC_RA_007')
      )
    ),
    -- UC_RA_006
    (
      'UC_RA_006',
      'FDA Breakthrough Designation Strategy',
      'Strategic assessment for FDA Breakthrough Device Designation.',
      'Expert',
      'USC-RA-006',
      jsonb_build_object(
        'pattern', 'COT_WITH_CRITERIA',
        'dependencies', json_build_array('UC_CD_001', 'UC_RA_002'),
        'benefits', json_build_array('Priority Review', 'Interactive Communication', 'Senior FDA Engagement'),
        'related_use_cases', json_build_array('UC_RA_002', 'UC_RA_004')
      )
    ),
    -- UC_RA_007
    (
      'UC_RA_007',
      'International Harmonization Strategy',
      'Strategic approach to harmonizing submissions across FDA, EMA, PMDA.',
      'Expert',
      'USC-RA-007',
      jsonb_build_object(
        'pattern', 'MULTI_JURISDICTIONAL',
        'dependencies', json_build_array('UC_RA_001', 'UC_RA_002', 'UC_RA_005'),
        'jurisdictions', json_build_array('FDA', 'EMA', 'PMDA', 'Health Canada'),
        'related_use_cases', json_build_array('UC_RA_005', 'UC_MA_009')
      )
    ),
    -- UC_RA_008
    (
      'UC_RA_008',
      'Cybersecurity Documentation (FDA)',
      'Comprehensive cybersecurity documentation for FDA submissions.',
      'Advanced',
      'USC-RA-008',
      jsonb_build_object(
        'pattern', 'CHECKLIST_WITH_TEMPLATES',
        'dependencies', json_build_array('UC_PD_008'),
        'regulatory_focus', json_build_array('FDA Cybersecurity 2023'),
        'related_use_cases', json_build_array('UC_PD_008', 'UC_RA_002')
      )
    ),
    -- UC_RA_009
    (
      'UC_RA_009',
      'Software Validation Documentation',
      'Comprehensive software validation following FDA and IEC 62304.',
      'Advanced',
      'USC-RA-009',
      jsonb_build_object(
        'pattern', 'STRUCTURED_TEMPLATE',
        'dependencies', json_build_array('UC_PD_001', 'UC_PD_009'),
        'standards', json_build_array('IEC 62304', 'FDA Software Validation'),
        'related_use_cases', json_build_array('UC_PD_001', 'UC_RA_002')
      )
    ),
    -- UC_RA_010
    (
      'UC_RA_010',
      'Post-Market Surveillance Planning',
      'Development of Post-Market Surveillance plans for FDA and EU MDR.',
      'Intermediate',
      'USC-RA-010',
      jsonb_build_object(
        'pattern', 'COT_WITH_CHECKLIST',
        'dependencies', json_build_array('UC_RA_002', 'UC_EG_001'),
        'regulatory_focus', json_build_array('FDA Section 522', 'EU MDR PMCF'),
        'related_use_cases', json_build_array('UC_EG_001', 'UC_EG_004')
      )
    )
) AS uc_data(code, title, summary, complexity, unique_id, metadata)
WHERE d.tenant_id = sc.tenant_id AND d.code = 'RA'
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  complexity = EXCLUDED.complexity,
  unique_id = EXCLUDED.unique_id,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- Market Access Use Cases (UC_MA_001 through UC_MA_010)
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
    -- UC_MA_001
    (
      'UC_MA_001',
      'Payer Value Dossier Development',
      'Comprehensive value dossier for payer engagement and reimbursement.',
      'Expert',
      'USC-MA-001',
      jsonb_build_object(
        'pattern', 'STRUCTURED_GENERATION',
        'dependencies', json_build_array('UC_CD_001', 'UC_EG_007', 'UC_MA_002'),
        'value_pillars', json_build_array('Clinical', 'Economic', 'Patient', 'Provider', 'Societal'),
        'related_use_cases', json_build_array('UC_MA_002', 'UC_MA_006', 'UC_MA_007')
      )
    ),
    -- UC_MA_002
    (
      'UC_MA_002',
      'Health Economics Model (DTx)',
      'Development of cost-effectiveness and cost-utility models for DTx.',
      'Expert',
      'USC-MA-002',
      jsonb_build_object(
        'pattern', 'QUANTITATIVE_MODELING',
        'dependencies', json_build_array('UC_CD_001', 'UC_MA_007'),
        'model_types', json_build_array('Decision Tree', 'Markov', 'DES'),
        'related_use_cases', json_build_array('UC_MA_001', 'UC_MA_006')
      )
    ),
    -- UC_MA_003
    (
      'UC_MA_003',
      'CPT/HCPCS Code Strategy',
      'Strategic approach to obtaining CPT or HCPCS codes.',
      'Advanced',
      'USC-MA-003',
      jsonb_build_object(
        'pattern', 'REGULATORY_NAVIGATION',
        'dependencies', json_build_array('UC_RA_001', 'UC_MA_001'),
        'code_types', json_build_array('Category I CPT', 'Category III CPT', 'HCPCS Level II'),
        'related_use_cases', json_build_array('UC_MA_001', 'UC_MA_004')
      )
    ),
    -- UC_MA_004
    (
      'UC_MA_004',
      'Formulary Positioning Strategy',
      'Strategic positioning within payer formularies or benefit designs.',
      'Intermediate',
      'USC-MA-004',
      jsonb_build_object(
        'pattern', 'STRATEGIC_FRAMEWORK',
        'dependencies', json_build_array('UC_MA_001', 'UC_MA_003'),
        'tier_options', json_build_array('Tier 1', 'Tier 2', 'Tier 3', 'Medical Benefit'),
        'related_use_cases', json_build_array('UC_MA_001', 'UC_MA_005', 'UC_MA_008')
      )
    ),
    -- UC_MA_005
    (
      'UC_MA_005',
      'P&T Committee Presentation',
      'Development of compelling P&T Committee presentations.',
      'Advanced',
      'USC-MA-005',
      jsonb_build_object(
        'pattern', 'PERSUASIVE_COMMUNICATION',
        'dependencies', json_build_array('UC_MA_001', 'UC_MA_004'),
        'decision_criteria', json_build_array('Clinical Value', 'Economic Value', 'Member Value', 'Operational'),
        'related_use_cases', json_build_array('UC_MA_001', 'UC_MA_004')
      )
    ),
    -- UC_MA_006
    (
      'UC_MA_006',
      'Budget Impact Model (BIM)',
      'Development of Budget Impact Models from payer perspective.',
      'Advanced',
      'USC-MA-006',
      jsonb_build_object(
        'pattern', 'QUANTITATIVE_MODELING',
        'dependencies', json_build_array('UC_MA_002'),
        'key_metric', 'PMPM (Per-Member-Per-Month)',
        'related_use_cases', json_build_array('UC_MA_002', 'UC_MA_001')
      )
    ),
    -- UC_MA_007
    (
      'UC_MA_007',
      'Comparative Effectiveness Analysis',
      'Comprehensive comparative effectiveness vs standard of care.',
      'Expert',
      'USC-MA-007',
      jsonb_build_object(
        'pattern', 'EVIDENCE_SYNTHESIS',
        'dependencies', json_build_array('UC_EG_009'),
        'analysis_types', json_build_array('Head-to-Head RCT', 'ITC', 'NMA', 'Real-World'),
        'related_use_cases', json_build_array('UC_EG_009', 'UC_MA_002')
      )
    ),
    -- UC_MA_008
    (
      'UC_MA_008',
      'Value-Based Contracting Strategy',
      'Design of outcomes-based contracts with payers.',
      'Expert',
      'USC-MA-008',
      jsonb_build_object(
        'pattern', 'STRATEGIC_NEGOTIATION',
        'dependencies', json_build_array('UC_MA_001', 'UC_EG_001'),
        'contract_models', json_build_array('Outcomes-Based Rebate', 'Pay-for-Performance', 'Risk-Sharing', 'Warranty'),
        'related_use_cases', json_build_array('UC_MA_001', 'UC_EG_001')
      )
    ),
    -- UC_MA_009
    (
      'UC_MA_009',
      'Health Technology Assessment (HTA)',
      'Preparation for HTA submissions to NICE, CADTH, IQWIG, etc.',
      'Expert',
      'USC-MA-009',
      jsonb_build_object(
        'pattern', 'MULTI_STAKEHOLDER',
        'dependencies', json_build_array('UC_MA_001', 'UC_RA_007'),
        'hta_bodies', json_build_array('NICE', 'CADTH', 'IQWIG', 'HAS', 'PBAC'),
        'related_use_cases', json_build_array('UC_MA_001', 'UC_MA_002')
      )
    ),
    -- UC_MA_010
    (
      'UC_MA_010',
      'Patient Assistance Program Design',
      'Design of patient assistance or co-pay support programs.',
      'Intermediate',
      'USC-MA-010',
      jsonb_build_object(
        'pattern', 'OPERATIONAL_FRAMEWORK',
        'dependencies', json_build_array('UC_MA_003'),
        'program_types', json_build_array('Co-Pay Assistance', 'Free Drug Program', 'Patient Savings Card'),
        'related_use_cases', json_build_array('UC_MA_003', 'UC_MA_004')
      )
    )
) AS uc_data(code, title, summary, complexity, unique_id, metadata)
WHERE d.tenant_id = sc.tenant_id AND d.code = 'MA'
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  complexity = EXCLUDED.complexity,
  unique_id = EXCLUDED.unique_id,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- Product Development Use Cases (UC_PD_001 through UC_PD_010)
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
    -- UC_PD_001
    (
      'UC_PD_001',
      'Clinical Requirements Documentation',
      'Translation of clinical needs into product requirements specifications.',
      'Intermediate',
      'USC-PD-001',
      jsonb_build_object(
        'pattern', 'STRUCTURED_SPECIFICATION',
        'dependencies', json_build_array('UC_CD_001', 'UC_RA_001'),
        'related_use_cases', json_build_array('UC_CD_001', 'UC_RA_009', 'UC_PD_002')
      )
    ),
    -- UC_PD_002
    (
      'UC_PD_002',
      'User Experience (UX) Clinical Validation',
      'Clinical validation of UX design following FDA human factors guidance.',
      'Intermediate',
      'USC-PD-002',
      jsonb_build_object(
        'pattern', 'HUMAN_FACTORS',
        'dependencies', json_build_array('UC_PD_001'),
        'regulatory_focus', json_build_array('FDA Human Factors 2016'),
        'related_use_cases', json_build_array('UC_PD_001', 'UC_PD_010')
      )
    ),
    -- UC_PD_003
    (
      'UC_PD_003',
      'EHR Integration Strategy (FHIR)',
      'Strategic approach to EHR integration using HL7 FHIR standards.',
      'Advanced',
      'USC-PD-003',
      jsonb_build_object(
        'pattern', 'TECHNICAL_INTEGRATION',
        'dependencies', json_build_array('UC_PD_001'),
        'standards', json_build_array('HL7 FHIR', 'CDS Hooks'),
        'related_use_cases', json_build_array('UC_PD_008', 'UC_RA_009')
      )
    ),
    -- UC_PD_004
    (
      'UC_PD_004',
      'Digital Therapeutic Algorithm Design',
      'Design of evidence-based therapeutic algorithms for DTx.',
      'Expert',
      'USC-PD-004',
      jsonb_build_object(
        'pattern', 'CLINICAL_ALGORITHM',
        'dependencies', json_build_array('UC_CD_001', 'UC_PD_001'),
        'behavioral_techniques', json_build_array('CBT', 'DBT', 'ACT', 'MI'),
        'related_use_cases', json_build_array('UC_CD_001', 'UC_PD_006')
      )
    ),
    -- UC_PD_005
    (
      'UC_PD_005',
      'Engagement Feature Optimization',
      'Optimization of engagement features to maximize adherence.',
      'Intermediate',
      'USC-PD-005',
      jsonb_build_object(
        'pattern', 'BEHAVIORAL_DESIGN',
        'dependencies', json_build_array('UC_CD_008', 'UC_PD_006'),
        'engagement_tactics', json_build_array('Gamification', 'Notifications', 'Social Support'),
        'related_use_cases', json_build_array('UC_CD_008', 'UC_PD_006')
      )
    ),
    -- UC_PD_006
    (
      'UC_PD_006',
      'Behavioral Science Integration',
      'Integration of behavioral science principles into DTx design.',
      'Advanced',
      'USC-PD-006',
      jsonb_build_object(
        'pattern', 'EVIDENCE_BASED_DESIGN',
        'dependencies', json_build_array('UC_PD_004'),
        'behavioral_frameworks', json_build_array('CBT', 'DBT', 'ACT', 'Motivational Interviewing'),
        'related_use_cases', json_build_array('UC_PD_004', 'UC_PD_005')
      )
    ),
    -- UC_PD_007
    (
      'UC_PD_007',
      'Accessibility & Inclusivity Design',
      'Ensuring products meet accessibility standards (WCAG 2.1 AA).',
      'Intermediate',
      'USC-PD-007',
      jsonb_build_object(
        'pattern', 'WCAG_COMPLIANCE',
        'dependencies', json_build_array('UC_PD_002'),
        'standards', json_build_array('WCAG 2.1 AA', 'Section 508'),
        'related_use_cases', json_build_array('UC_PD_002', 'UC_PD_010')
      )
    ),
    -- UC_PD_008
    (
      'UC_PD_008',
      'Data Privacy Architecture (HIPAA)',
      'Comprehensive data privacy and security architecture.',
      'Advanced',
      'USC-PD-008',
      jsonb_build_object(
        'pattern', 'SECURITY_FRAMEWORK',
        'dependencies', json_build_array('UC_RA_008'),
        'compliance', json_build_array('HIPAA', 'GDPR', '21 CFR Part 11'),
        'related_use_cases', json_build_array('UC_RA_008', 'UC_PD_003')
      )
    ),
    -- UC_PD_009
    (
      'UC_PD_009',
      'AI/ML Model Clinical Validation',
      'Clinical validation of AI/ML models following FDA guidance.',
      'Expert',
      'USC-PD-009',
      jsonb_build_object(
        'pattern', 'MODEL_VALIDATION',
        'dependencies', json_build_array('UC_CD_002', 'UC_RA_001'),
        'regulatory_focus', json_build_array('FDA AI/ML SaMD Guidance'),
        'related_use_cases', json_build_array('UC_CD_002', 'UC_RA_001')
      )
    ),
    -- UC_PD_010
    (
      'UC_PD_010',
      'Usability Testing Protocol',
      'Structured usability testing protocols for digital health.',
      'Intermediate',
      'USC-PD-010',
      jsonb_build_object(
        'pattern', 'HUMAN_FACTORS_TESTING',
        'dependencies', json_build_array('UC_PD_002'),
        'testing_phases', json_build_array('Formative', 'Summative'),
        'related_use_cases', json_build_array('UC_PD_002', 'UC_RA_009')
      )
    )
) AS uc_data(code, title, summary, complexity, unique_id, metadata)
WHERE d.tenant_id = sc.tenant_id AND d.code = 'PD'
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  complexity = EXCLUDED.complexity,
  unique_id = EXCLUDED.unique_id,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- Evidence Generation Use Cases (UC_EG_001 through UC_EG_010)
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
    -- UC_EG_001
    (
      'UC_EG_001',
      'Real-World Evidence Study Design',
      'Design of RWE studies using observational data.',
      'Advanced',
      'USC-EG-001',
      jsonb_build_object(
        'pattern', 'OBSERVATIONAL_DESIGN',
        'dependencies', json_build_array('UC_CD_003', 'UC_RA_010'),
        'data_sources', json_build_array('Claims', 'EHR', 'Registry', 'App Data'),
        'related_use_cases', json_build_array('UC_RA_010', 'UC_EG_003')
      )
    ),
    -- UC_EG_002
    (
      'UC_EG_002',
      'Observational Data Analysis (DTx)',
      'Statistical analysis of observational DTx data.',
      'Advanced',
      'USC-EG-002',
      jsonb_build_object(
        'pattern', 'STATISTICAL_ANALYSIS',
        'dependencies', json_build_array('UC_EG_001'),
        'challenges', json_build_array('Confounding', 'Selection Bias', 'Missing Data'),
        'related_use_cases', json_build_array('UC_EG_001', 'UC_EG_003')
      )
    ),
    -- UC_EG_003
    (
      'UC_EG_003',
      'Propensity Score Matching for DTx',
      'Application of propensity score methods for causal inference.',
      'Expert',
      'USC-EG-003',
      jsonb_build_object(
        'pattern', 'CAUSAL_INFERENCE',
        'dependencies', json_build_array('UC_EG_001', 'UC_EG_002'),
        'methods', json_build_array('Matching', 'Weighting', 'Stratification'),
        'related_use_cases', json_build_array('UC_EG_001', 'UC_EG_002')
      )
    ),
    -- UC_EG_004
    (
      'UC_EG_004',
      'Patient Registry Design',
      'Design and implementation of patient registries.',
      'Intermediate',
      'USC-EG-004',
      jsonb_build_object(
        'pattern', 'DATA_COLLECTION_FRAMEWORK',
        'dependencies', json_build_array('UC_RA_010'),
        'related_use_cases', json_build_array('UC_RA_010', 'UC_EG_001')
      )
    ),
    -- UC_EG_005
    (
      'UC_EG_005',
      'Publication Strategy & Medical Writing',
      'Strategic planning and execution of peer-reviewed publications.',
      'Intermediate',
      'USC-EG-005',
      jsonb_build_object(
        'pattern', 'SCIENTIFIC_COMMUNICATION',
        'dependencies', json_build_array('UC_CD_010', 'UC_EG_009'),
        'publication_types', json_build_array('Primary Results', 'Sub-analysis', 'RWE', 'Reviews'),
        'related_use_cases', json_build_array('UC_EG_006', 'UC_EG_009')
      )
    ),
    -- UC_EG_006
    (
      'UC_EG_006',
      'KOL Engagement & Advisory Boards',
      'Strategic engagement of Key Opinion Leaders.',
      'Intermediate',
      'USC-EG-006',
      jsonb_build_object(
        'pattern', 'STAKEHOLDER_ENGAGEMENT',
        'dependencies', json_build_array('UC_EG_005'),
        'engagement_types', json_build_array('Advisory Boards', 'Research Collaboration', 'Speaker Programs'),
        'related_use_cases', json_build_array('UC_EG_005', 'UC_MA_005')
      )
    ),
    -- UC_EG_007
    (
      'UC_EG_007',
      'Health Outcomes Research Design',
      'Design of health outcomes research studies.',
      'Advanced',
      'USC-EG-007',
      jsonb_build_object(
        'pattern', 'OUTCOMES_FRAMEWORK',
        'dependencies', json_build_array('UC_CD_001', 'UC_EG_001'),
        'outcome_types', json_build_array('PROs', 'Quality of Life', 'Functional Status'),
        'related_use_cases', json_build_array('UC_CD_005', 'UC_MA_001')
      )
    ),
    -- UC_EG_008
    (
      'UC_EG_008',
      'Patient-Centered Outcomes Research',
      'PCOR methodology incorporating patient perspectives.',
      'Advanced',
      'USC-EG-008',
      jsonb_build_object(
        'pattern', 'PCOR_METHODOLOGY',
        'dependencies', json_build_array('UC_EG_007'),
        'related_use_cases', json_build_array('UC_EG_007', 'UC_CD_005')
      )
    ),
    -- UC_EG_009
    (
      'UC_EG_009',
      'Meta-Analysis & Systematic Review',
      'Systematic review and meta-analysis following PRISMA.',
      'Expert',
      'USC-EG-009',
      jsonb_build_object(
        'pattern', 'EVIDENCE_SYNTHESIS',
        'dependencies', json_build_array('UC_EG_005'),
        'standards', json_build_array('PRISMA', 'Cochrane Methodology'),
        'related_use_cases', json_build_array('UC_MA_007', 'UC_RA_005')
      )
    ),
    -- UC_EG_010
    (
      'UC_EG_010',
      'Evidence Synthesis for HTAs',
      'Comprehensive evidence synthesis for HTA submissions.',
      'Expert',
      'USC-EG-010',
      jsonb_build_object(
        'pattern', 'HTA_EVIDENCE_PACKAGE',
        'dependencies', json_build_array('UC_EG_009', 'UC_MA_009'),
        'related_use_cases', json_build_array('UC_MA_009', 'UC_EG_009')
      )
    )
) AS uc_data(code, title, summary, complexity, unique_id, metadata)
WHERE d.tenant_id = sc.tenant_id AND d.code = 'EG'
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  complexity = EXCLUDED.complexity,
  unique_id = EXCLUDED.unique_id,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

-- Verify all domains were created
SELECT 
  'Domains Created' as status,
  COUNT(*) as total_domains
FROM dh_domain
WHERE tenant_id = (SELECT tenant_id FROM session_config);

-- Verify all use cases were created by domain
SELECT 
  'Use Cases by Domain' as status,
  d.code as domain_code,
  d.name as domain_name,
  COUNT(uc.id) as use_case_count
FROM dh_domain d
LEFT JOIN dh_use_case uc ON uc.domain_id = d.id
WHERE d.tenant_id = (SELECT tenant_id FROM session_config)
GROUP BY d.code, d.name, d.id
ORDER BY d.code;

-- Total use case count
SELECT 
  'Total Use Cases' as status,
  COUNT(*) as total_use_cases
FROM dh_use_case uc
JOIN dh_domain d ON uc.domain_id = d.id
WHERE d.tenant_id = (SELECT tenant_id FROM session_config);

-- Use cases by complexity level
SELECT 
  'Use Cases by Complexity' as status,
  uc.complexity,
  COUNT(*) as count
FROM dh_use_case uc
JOIN dh_domain d ON uc.domain_id = d.id
WHERE d.tenant_id = (SELECT tenant_id FROM session_config)
GROUP BY uc.complexity
ORDER BY 
  CASE uc.complexity
    WHEN 'Basic' THEN 1
    WHEN 'Intermediate' THEN 2
    WHEN 'Advanced' THEN 3
    WHEN 'Expert' THEN 4
  END;

-- =====================================================================================
-- END OF SCRIPT
-- =====================================================================================
-- Next Steps:
-- 1. Execute 02_usecases_workflows.sql for Clinical Development workflows
-- 2. Create workflow seed files for other domains (RA, MA, PD, EG)
-- 3. Create task seed files for all workflows
-- =====================================================================================

