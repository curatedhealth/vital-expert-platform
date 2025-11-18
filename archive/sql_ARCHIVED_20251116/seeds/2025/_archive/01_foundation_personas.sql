-- =====================================================================================
-- 01_foundation_personas.sql
-- Foundation Human Personas - Cross-Domain Organizational Roles
-- =====================================================================================
-- Purpose: Seed foundational human personas (organizational roles) used across use cases
-- Dependencies: Tenant must exist, dh_persona table must be created
-- Execution Order: 1 (foundation - after 00_foundation_agents.sql)
-- =====================================================================================
--
-- PERSONA CATEGORIES:
-- - Executive Leadership (C-Suite)
-- - Clinical Development
-- - Regulatory Affairs
-- - Biostatistics & Data Science
-- - Medical Affairs
-- - Commercial & Market Access
-- - Product & Engineering
-- - Patient Advocacy
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
-- SECTION 1: EXECUTIVE LEADERSHIP PERSONAS
-- =====================================================================================

INSERT INTO dh_persona (
  tenant_id,
  code,
  name,
  unique_id,
  expertise_level,
  years_experience,
  education,
  typical_titles,
  decision_authority,
  capabilities,
  key_responsibilities,
  department,
  typical_availability_hours,
  response_time_sla_hours,
  description,
  metadata
)
SELECT 
  sc.tenant_id,
  p_data.code,
  p_data.name,
  p_data.unique_id,
  p_data.expertise_level,
  p_data.years_experience,
  p_data.education,
  p_data.typical_titles,
  p_data.decision_authority,
  p_data.capabilities,
  p_data.key_responsibilities,
  p_data.department,
  p_data.typical_availability_hours,
  p_data.response_time_sla_hours,
  p_data.description,
  p_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- P01_CMO: Chief Medical Officer
    (
      'P01_CMO',
      'Chief Medical Officer',
      'PERSONA-P01-CMO',
      'EXPERT',
      '15+',
      json_build_array('MD', 'PhD')::jsonb,
      json_build_array('CMO', 'VP Medical Affairs', 'Chief Scientific Officer', 'Chief Clinical Officer')::jsonb,
      'VERY_HIGH',
      json_build_array(
        'Clinical Trial Strategy',
        'FDA Interactions',
        'Risk-benefit Assessment',
        'Scientific Leadership',
        'Endpoint Selection',
        'Clinical Meaningfulness Assessment'
      )::jsonb,
      json_build_array(
        'Final approval of clinical endpoint strategy',
        'FDA submission oversight',
        'Scientific risk management',
        'Clinical development leadership',
        'Chairs endpoint selection meetings',
        'Approves validation strategies'
      )::jsonb,
      'Clinical Development',
      10,
      72,
      'Senior executive providing strategic oversight and final approval for clinical development decisions',
      jsonb_build_object(
        'review_stage', 'FINAL_APPROVAL',
        'decision_scope', 'STRATEGIC',
        'typical_time_per_usecase', '2-3 hours'
      )
    ),
    
    -- P02_VPCLIN: VP Clinical Development
    (
      'P02_VPCLIN',
      'VP Clinical Development',
      'PERSONA-P02-VPCLIN',
      'EXPERT',
      '10-15',
      json_build_array('MD', 'PhD', 'PharmD', 'MPH')::jsonb,
      json_build_array('VP Clinical Development', 'Clinical Development Director', 'Head of Clinical Operations')::jsonb,
      'HIGH',
      json_build_array(
        'Clinical Trial Design',
        'Protocol Development',
        'CRO Management',
        'GCP Compliance',
        'Regulatory Precedent Research',
        'Operational Feasibility Assessment'
      )::jsonb,
      json_build_array(
        'Clinical trial strategy execution',
        'Protocol development and oversight',
        'CRO coordination',
        'Regulatory precedent research',
        'Operational feasibility evaluation',
        'Timeline and budget management'
      )::jsonb,
      'Clinical Development',
      20,
      48,
      'Senior clinical leader responsible for operational execution of clinical development strategy',
      jsonb_build_object(
        'review_stage', 'STRATEGIC_REVIEW',
        'decision_scope', 'OPERATIONAL',
        'typical_time_per_usecase', '2-2.5 hours'
      )
    ),
    
    -- P03_CEO: Chief Executive Officer
    (
      'P03_CEO',
      'Chief Executive Officer',
      'PERSONA-P03-CEO',
      'EXPERT',
      '15+',
      json_build_array('MBA', 'MD', 'PhD')::jsonb,
      json_build_array('CEO', 'President', 'Founder & CEO')::jsonb,
      'VERY_HIGH',
      json_build_array(
        'Strategic Vision',
        'Stakeholder Management',
        'Resource Allocation',
        'Business Development',
        'Investor Relations'
      )::jsonb,
      json_build_array(
        'Company strategic direction',
        'Major investment decisions',
        'Board and investor communications',
        'Partnership and M&A strategy',
        'Executive team leadership'
      )::jsonb,
      'Executive',
      5,
      120,
      'Chief executive responsible for overall company strategy and major decisions',
      jsonb_build_object(
        'review_stage', 'STRATEGIC_APPROVAL',
        'decision_scope', 'CORPORATE',
        'involvement_frequency', 'Major milestones only'
      )
    )
) AS p_data(
  code, name, unique_id, expertise_level, years_experience,
  education, typical_titles, decision_authority, capabilities,
  key_responsibilities, department, typical_availability_hours,
  response_time_sla_hours, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  unique_id = EXCLUDED.unique_id,
  expertise_level = EXCLUDED.expertise_level,
  years_experience = EXCLUDED.years_experience,
  education = EXCLUDED.education,
  typical_titles = EXCLUDED.typical_titles,
  decision_authority = EXCLUDED.decision_authority,
  capabilities = EXCLUDED.capabilities,
  key_responsibilities = EXCLUDED.key_responsibilities,
  department = EXCLUDED.department,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 2: BIOSTATISTICS & DATA SCIENCE PERSONAS
-- =====================================================================================

INSERT INTO dh_persona (
  tenant_id, code, name, unique_id, expertise_level, years_experience,
  education, typical_titles, decision_authority, capabilities,
  key_responsibilities, department, typical_availability_hours,
  response_time_sla_hours, description, metadata
)
SELECT 
  sc.tenant_id, p_data.code, p_data.name, p_data.unique_id, p_data.expertise_level, p_data.years_experience,
  p_data.education, p_data.typical_titles, p_data.decision_authority, p_data.capabilities,
  p_data.key_responsibilities, p_data.department, p_data.typical_availability_hours,
  p_data.response_time_sla_hours, p_data.description, p_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- P04_BIOSTAT: Principal Biostatistician
    (
      'P04_BIOSTAT',
      'Principal Biostatistician',
      'PERSONA-P04-BIOSTAT',
      'EXPERT',
      '8-15',
      json_build_array('PhD', 'MS Statistics', 'MS Biostatistics')::jsonb,
      json_build_array('Principal Biostatistician', 'Director Biostatistics', 'Lead Statistician', 'Senior Biostatistician')::jsonb,
      'HIGH',
      json_build_array(
        'Psychometric Evaluation',
        'Statistical Analysis Planning',
        'Sample Size Calculation',
        'Power Analysis',
        'Measurement Properties Assessment',
        'Missing Data Handling'
      )::jsonb,
      json_build_array(
        'Psychometric property evaluation',
        'Statistical analysis plan development',
        'Sample size and power calculations',
        'Responsiveness and MCID determination',
        'Statistical methodology selection',
        'Data quality assessment'
      )::jsonb,
      'Biostatistics',
      25,
      48,
      'Expert statistician responsible for statistical design and analysis of clinical studies',
      jsonb_build_object(
        'review_stage', 'TECHNICAL_REVIEW',
        'decision_scope', 'STATISTICAL',
        'typical_time_per_usecase', '2-3 hours'
      )
    )
) AS p_data(
  code, name, unique_id, expertise_level, years_experience,
  education, typical_titles, decision_authority, capabilities,
  key_responsibilities, department, typical_availability_hours,
  response_time_sla_hours, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  expertise_level = EXCLUDED.expertise_level, years_experience = EXCLUDED.years_experience,
  education = EXCLUDED.education, typical_titles = EXCLUDED.typical_titles,
  decision_authority = EXCLUDED.decision_authority, capabilities = EXCLUDED.capabilities,
  key_responsibilities = EXCLUDED.key_responsibilities, department = EXCLUDED.department,
  typical_availability_hours = EXCLUDED.typical_availability_hours,
  response_time_sla_hours = EXCLUDED.response_time_sla_hours,
  description = EXCLUDED.description, metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 3: REGULATORY AFFAIRS PERSONAS
-- =====================================================================================

INSERT INTO dh_persona (
  tenant_id, code, name, unique_id, expertise_level, years_experience,
  education, typical_titles, decision_authority, capabilities,
  key_responsibilities, department, typical_availability_hours,
  response_time_sla_hours, description, metadata
)
SELECT 
  sc.tenant_id, p_data.code, p_data.name, p_data.unique_id, p_data.expertise_level, p_data.years_experience,
  p_data.education, p_data.typical_titles, p_data.decision_authority, p_data.capabilities,
  p_data.key_responsibilities, p_data.department, p_data.typical_availability_hours,
  p_data.response_time_sla_hours, p_data.description, p_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- P05_REGAFF: Regulatory Affairs Director
    (
      'P05_REGAFF',
      'Regulatory Affairs Director',
      'PERSONA-P05-REGAFF',
      'EXPERT',
      '10-15',
      json_build_array('PharmD', 'RAC', 'MS', 'PhD')::jsonb,
      json_build_array('Regulatory Affairs Director', 'Head of Regulatory Strategy', 'VP Regulatory Affairs')::jsonb,
      'VERY_HIGH',
      json_build_array(
        'FDA Guidance Interpretation',
        'Regulatory Strategy Development',
        'COA Qualification Pathway',
        'FDA Submission Preparation',
        'Pre-Sub Meeting Strategy',
        'Regulatory Precedent Analysis'
      )::jsonb,
      json_build_array(
        'FDA compliance assessment',
        'Regulatory risk evaluation',
        'Submission strategy development',
        'Agency interaction preparation',
        'Regulatory precedent research',
        'Labeling strategy'
      )::jsonb,
      'Regulatory Affairs',
      25,
      48,
      'Regulatory expert ensuring compliance with FDA/EMA requirements and guiding submission strategy',
      jsonb_build_object(
        'review_stage', 'REGULATORY_REVIEW',
        'decision_scope', 'COMPLIANCE',
        'typical_time_per_usecase', '2-3 hours'
      )
    )
) AS p_data(
  code, name, unique_id, expertise_level, years_experience,
  education, typical_titles, decision_authority, capabilities,
  key_responsibilities, department, typical_availability_hours,
  response_time_sla_hours, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  expertise_level = EXCLUDED.expertise_level, years_experience = EXCLUDED.years_experience,
  education = EXCLUDED.education, typical_titles = EXCLUDED.typical_titles,
  decision_authority = EXCLUDED.decision_authority, capabilities = EXCLUDED.capabilities,
  key_responsibilities = EXCLUDED.key_responsibilities, department = EXCLUDED.department,
  typical_availability_hours = EXCLUDED.typical_availability_hours,
  response_time_sla_hours = EXCLUDED.response_time_sla_hours,
  description = EXCLUDED.description, metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 4: PRODUCT & DIGITAL HEALTH PERSONAS
-- =====================================================================================

INSERT INTO dh_persona (
  tenant_id, code, name, unique_id, expertise_level, years_experience,
  education, typical_titles, decision_authority, capabilities,
  key_responsibilities, department, typical_availability_hours,
  response_time_sla_hours, description, metadata
)
SELECT 
  sc.tenant_id, p_data.code, p_data.name, p_data.unique_id, p_data.expertise_level, p_data.years_experience,
  p_data.education, p_data.typical_titles, p_data.decision_authority, p_data.capabilities,
  p_data.key_responsibilities, p_data.department, p_data.typical_availability_hours,
  p_data.response_time_sla_hours, p_data.description, p_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- P06_PMDIG: Product Manager (Digital Health)
    (
      'P06_PMDIG',
      'Product Manager (Digital Health)',
      'PERSONA-P06-PMDIG',
      'ADVANCED',
      '5-10',
      json_build_array('MBA', 'MS', 'MPH', 'BS Engineering')::jsonb,
      json_build_array('Product Manager', 'Senior Product Manager', 'Head of Product', 'Director of Product')::jsonb,
      'MEDIUM',
      json_build_array(
        'Digital Product Strategy',
        'Feature Prioritization',
        'User Experience Design',
        'Data Collection Workflow Design',
        'Engagement Strategy',
        'ePRO Implementation'
      )::jsonb,
      json_build_array(
        'Product roadmap development',
        'Feature prioritization',
        'User research and testing',
        'Digital biomarker integration',
        'Engagement optimization',
        'Technical feasibility assessment'
      )::jsonb,
      'Product',
      30,
      48,
      'Product leader responsible for digital therapeutic app design and user experience',
      jsonb_build_object(
        'review_stage', 'PRODUCT_REVIEW',
        'decision_scope', 'TECHNICAL_FEASIBILITY',
        'typical_time_per_usecase', '1.5-2 hours'
      )
    ),
    
    -- P10_PATADV: Patient Advocate
    (
      'P10_PATADV',
      'Patient Advocate',
      'PERSONA-P10-PATADV',
      'ADVANCED',
      '5-10',
      json_build_array('Patient Experience', 'Social Work', 'MPH', 'Advocacy Training')::jsonb,
      json_build_array('Patient Advocate', 'Patient Representative', 'Patient Advisory Board Member')::jsonb,
      'ADVISORY',
      json_build_array(
        'Patient Perspective',
        'Patient Burden Assessment',
        'Health Literacy Evaluation',
        'Patient-Centered Outcomes',
        'Accessibility Review',
        'Patient Communication'
      )::jsonb,
      json_build_array(
        'Representing patient voice',
        'Evaluating patient burden',
        'Assessing outcome relevance',
        'Reviewing patient materials',
        'Ensuring accessibility',
        'Providing real-world insight'
      )::jsonb,
      'Patient Advocacy',
      15,
      96,
      'Patient representative ensuring study design is patient-centered and outcomes are meaningful',
      jsonb_build_object(
        'review_stage', 'PATIENT_REVIEW',
        'decision_scope', 'PATIENT_IMPACT',
        'typical_time_per_usecase', '1-2 hours'
      )
    )
) AS p_data(
  code, name, unique_id, expertise_level, years_experience,
  education, typical_titles, decision_authority, capabilities,
  key_responsibilities, department, typical_availability_hours,
  response_time_sla_hours, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  expertise_level = EXCLUDED.expertise_level, years_experience = EXCLUDED.years_experience,
  education = EXCLUDED.education, typical_titles = EXCLUDED.typical_titles,
  decision_authority = EXCLUDED.decision_authority, capabilities = EXCLUDED.capabilities,
  key_responsibilities = EXCLUDED.key_responsibilities, department = EXCLUDED.department,
  typical_availability_hours = EXCLUDED.typical_availability_hours,
  response_time_sla_hours = EXCLUDED.response_time_sla_hours,
  description = EXCLUDED.description, metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 5: COMMERCIAL & MARKET ACCESS PERSONAS
-- =====================================================================================

INSERT INTO dh_persona (
  tenant_id, code, name, unique_id, expertise_level, years_experience,
  education, typical_titles, decision_authority, capabilities,
  key_responsibilities, department, typical_availability_hours,
  response_time_sla_hours, description, metadata
)
SELECT 
  sc.tenant_id, p_data.code, p_data.name, p_data.unique_id, p_data.expertise_level, p_data.years_experience,
  p_data.education, p_data.typical_titles, p_data.decision_authority, p_data.capabilities,
  p_data.key_responsibilities, p_data.department, p_data.typical_availability_hours,
  p_data.response_time_sla_hours, p_data.description, p_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- P07_VPMA: VP Market Access
    (
      'P07_VPMA',
      'VP Market Access',
      'PERSONA-P07-VPMA',
      'EXPERT',
      '10-15',
      json_build_array('PharmD', 'MBA', 'MPH')::jsonb,
      json_build_array('VP Market Access', 'Head of Market Access', 'Director Payer Strategy')::jsonb,
      'HIGH',
      json_build_array(
        'Payer Strategy',
        'Reimbursement Strategy',
        'Health Economics',
        'Value Proposition Development',
        'Pricing Strategy',
        'Contracting'
      )::jsonb,
      json_build_array(
        'Payer engagement strategy',
        'Reimbursement pathway development',
        'Value story development',
        'Pricing and contracting',
        'Market access planning',
        'Stakeholder alignment'
      )::jsonb,
      'Commercial',
      20,
      48,
      'Market access leader responsible for payer strategy and reimbursement',
      jsonb_build_object(
        'review_stage', 'COMMERCIAL_REVIEW',
        'decision_scope', 'PAYER_VALUE',
        'typical_time_per_usecase', '1-2 hours'
      )
    ),
    
    -- P08_HEOR: Health Economics Director
    (
      'P08_HEOR',
      'Health Economics & Outcomes Research Director',
      'PERSONA-P08-HEOR',
      'EXPERT',
      '8-12',
      json_build_array('PhD Economics', 'PharmD', 'MS Health Economics')::jsonb,
      json_build_array('Director HEOR', 'Head of Health Economics', 'VP Health Economics')::jsonb,
      'MEDIUM',
      json_build_array(
        'Cost-Effectiveness Analysis',
        'Budget Impact Modeling',
        'RWE Study Design',
        'Economic Modeling',
        'Value Framework Development',
        'Comparative Effectiveness'
      )::jsonb,
      json_build_array(
        'Economic model development',
        'Cost-effectiveness analysis',
        'Budget impact assessments',
        'RWE study design',
        'Value dossier development',
        'Payer evidence generation'
      )::jsonb,
      'Health Economics',
      25,
      48,
      'Health economics expert responsible for economic evaluation and value demonstration',
      jsonb_build_object(
        'review_stage', 'ECONOMIC_REVIEW',
        'decision_scope', 'VALUE_EVIDENCE',
        'typical_time_per_usecase', '2-3 hours'
      )
    ),
    
    -- P09_DATASCIENCE: Data Science Director
    (
      'P09_DATASCIENCE',
      'Data Science Director',
      'PERSONA-P09-DATASCIENCE',
      'EXPERT',
      '8-12',
      json_build_array('PhD Computer Science', 'PhD Statistics', 'MS Data Science')::jsonb,
      json_build_array('Director Data Science', 'Head of AI/ML', 'VP Data Science', 'Chief Data Officer')::jsonb,
      'HIGH',
      json_build_array(
        'Machine Learning',
        'Algorithm Development',
        'Digital Biomarker Development',
        'Predictive Modeling',
        'Data Pipeline Design',
        'AI/ML Validation'
      )::jsonb,
      json_build_array(
        'AI/ML algorithm development',
        'Digital biomarker validation',
        'Predictive model development',
        'Data science infrastructure',
        'Algorithm performance monitoring',
        'Technical validation'
      )::jsonb,
      'Data Science',
      30,
      48,
      'Data science leader responsible for AI/ML algorithms and digital biomarkers',
      jsonb_build_object(
        'review_stage', 'TECHNICAL_REVIEW',
        'decision_scope', 'ALGORITHM_VALIDATION',
        'typical_time_per_usecase', '2-4 hours'
      )
    ),
    
    -- P11_MEDICAL_WRITER: Medical Writer
    (
      'P11_MEDICAL_WRITER',
      'Medical Writer',
      'PERSONA-P11-MEDICAL-WRITER',
      'ADVANCED',
      '5-10',
      json_build_array('PhD', 'PharmD', 'MS', 'Advanced Science Degree')::jsonb,
      json_build_array('Senior Medical Writer', 'Medical Writing Manager', 'Principal Medical Writer')::jsonb,
      'LOW',
      json_build_array(
        'Scientific Writing',
        'Regulatory Document Preparation',
        'Clinical Study Reports',
        'Protocol Writing',
        'Publication Planning',
        'ICH-GCP Knowledge'
      )::jsonb,
      json_build_array(
        'Protocol development',
        'Clinical study report writing',
        'Regulatory document preparation',
        'Scientific publication writing',
        'Quality control of documents',
        'Document management'
      )::jsonb,
      'Medical Affairs',
      35,
      72,
      'Medical writer responsible for regulatory and scientific documentation',
      jsonb_build_object(
        'review_stage', 'DOCUMENTATION',
        'decision_scope', 'DOCUMENT_QUALITY',
        'typical_time_per_usecase', '4-8 hours'
      )
    ),
    
    -- P12_CLINICAL_OPS: Clinical Operations Director
    (
      'P12_CLINICAL_OPS',
      'Clinical Operations Director',
      'PERSONA-P12-CLINICAL-OPS',
      'EXPERT',
      '10-15',
      json_build_array('RN', 'MS Clinical Research', 'MPH')::jsonb,
      json_build_array('Director Clinical Operations', 'VP Clinical Operations', 'Head of Site Management')::jsonb,
      'HIGH',
      json_build_array(
        'Site Selection & Management',
        'Patient Recruitment',
        'Clinical Monitoring',
        'Vendor Management',
        'Budget Management',
        'Timeline Management'
      )::jsonb,
      json_build_array(
        'Site selection and activation',
        'Patient recruitment oversight',
        'CRO/vendor management',
        'Study startup activities',
        'Operational execution',
        'Quality oversight'
      )::jsonb,
      'Clinical Operations',
      25,
      48,
      'Clinical operations leader responsible for study execution and site management',
      jsonb_build_object(
        'review_stage', 'OPERATIONAL_REVIEW',
        'decision_scope', 'FEASIBILITY',
        'typical_time_per_usecase', '1.5-2 hours'
      )
    )
) AS p_data(
  code, name, unique_id, expertise_level, years_experience,
  education, typical_titles, decision_authority, capabilities,
  key_responsibilities, department, typical_availability_hours,
  response_time_sla_hours, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  expertise_level = EXCLUDED.expertise_level, years_experience = EXCLUDED.years_experience,
  education = EXCLUDED.education, typical_titles = EXCLUDED.typical_titles,
  decision_authority = EXCLUDED.decision_authority, capabilities = EXCLUDED.capabilities,
  key_responsibilities = EXCLUDED.key_responsibilities, department = EXCLUDED.department,
  typical_availability_hours = EXCLUDED.typical_availability_hours,
  response_time_sla_hours = EXCLUDED.response_time_sla_hours,
  description = EXCLUDED.description, metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 6: QUALITY & COMPLIANCE PERSONAS
-- =====================================================================================

INSERT INTO dh_persona (
  tenant_id, code, name, unique_id, expertise_level, years_experience,
  education, typical_titles, decision_authority, capabilities,
  key_responsibilities, department, typical_availability_hours,
  response_time_sla_hours, description, metadata
)
SELECT 
  sc.tenant_id, p_data.code, p_data.name, p_data.unique_id, p_data.expertise_level, p_data.years_experience,
  p_data.education, p_data.typical_titles, p_data.decision_authority, p_data.capabilities,
  p_data.key_responsibilities, p_data.department, p_data.typical_availability_hours,
  p_data.response_time_sla_hours, p_data.description, p_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- P13_QA: Quality Assurance Director
    (
      'P13_QA',
      'Quality Assurance Director',
      'PERSONA-P13-QA',
      'EXPERT',
      '10-15',
      json_build_array('RAC', 'MS Quality Systems', 'Advanced Science Degree')::jsonb,
      json_build_array('Director Quality Assurance', 'VP Quality', 'Head of QA')::jsonb,
      'HIGH',
      json_build_array(
        'Quality Systems Management',
        'GCP Compliance',
        'Audit Management',
        'CAPA Management',
        'Risk Management',
        'SOP Development'
      )::jsonb,
      json_build_array(
        'Quality system oversight',
        'GCP compliance assurance',
        'Internal audit management',
        'CAPA process oversight',
        'Quality risk management',
        'SOP review and approval'
      )::jsonb,
      'Quality Assurance',
      20,
      48,
      'Quality leader ensuring GCP compliance and quality system management',
      jsonb_build_object(
        'review_stage', 'QUALITY_REVIEW',
        'decision_scope', 'COMPLIANCE',
        'typical_time_per_usecase', '1-2 hours'
      )
    ),
    
    -- P14_PHARMACOVIGILANCE: Pharmacovigilance Director
    (
      'P14_PHARMACOVIGILANCE',
      'Pharmacovigilance Director',
      'PERSONA-P14-PHARMACOVIGILANCE',
      'EXPERT',
      '10-15',
      json_build_array('PharmD', 'MD', 'MS Pharmacology')::jsonb,
      json_build_array('Director Pharmacovigilance', 'VP Safety', 'Head of Drug Safety')::jsonb,
      'VERY_HIGH',
      json_build_array(
        'Safety Monitoring',
        'Signal Detection',
        'Risk Management Plans',
        'Adverse Event Reporting',
        'PSUR/PBRER Development',
        'Benefit-Risk Assessment'
      )::jsonb,
      json_build_array(
        'Safety surveillance strategy',
        'Adverse event management',
        'Signal detection and evaluation',
        'Risk management planning',
        'Safety reporting to authorities',
        'Benefit-risk assessments'
      )::jsonb,
      'Safety & Pharmacovigilance',
      25,
      24,
      'Safety expert responsible for pharmacovigilance and risk management',
      jsonb_build_object(
        'review_stage', 'SAFETY_REVIEW',
        'decision_scope', 'RISK_MANAGEMENT',
        'typical_time_per_usecase', '1.5-2.5 hours',
        'escalation_priority', 'HIGH'
      )
    ),
    
    -- P15_DATA_MANAGER: Clinical Data Manager
    (
      'P15_DATA_MANAGER',
      'Clinical Data Manager',
      'PERSONA-P15-DATA-MANAGER',
      'ADVANCED',
      '8-12',
      json_build_array('MS Health Informatics', 'BS', 'Clinical Research Certificate')::jsonb,
      json_build_array('Clinical Data Manager', 'Senior Data Manager', 'Director Data Management')::jsonb,
      'MEDIUM',
      json_build_array(
        'EDC Design',
        'Data Management Planning',
        'Data Cleaning',
        'Query Management',
        'CDISC Standards',
        'Database Lock'
      )::jsonb,
      json_build_array(
        'EDC database design',
        'Data management plan development',
        'Data cleaning and validation',
        'Query resolution',
        'CDISC compliance',
        'Database lock coordination'
      )::jsonb,
      'Data Management',
      30,
      48,
      'Data manager responsible for clinical data collection and quality',
      jsonb_build_object(
        'review_stage', 'DATA_REVIEW',
        'decision_scope', 'DATA_QUALITY',
        'typical_time_per_usecase', '2-3 hours'
      )
    )
) AS p_data(
  code, name, unique_id, expertise_level, years_experience,
  education, typical_titles, decision_authority, capabilities,
  key_responsibilities, department, typical_availability_hours,
  response_time_sla_hours, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  expertise_level = EXCLUDED.expertise_level, years_experience = EXCLUDED.years_experience,
  education = EXCLUDED.education, typical_titles = EXCLUDED.typical_titles,
  decision_authority = EXCLUDED.decision_authority, capabilities = EXCLUDED.capabilities,
  key_responsibilities = EXCLUDED.key_responsibilities, department = EXCLUDED.department,
  typical_availability_hours = EXCLUDED.typical_availability_hours,
  response_time_sla_hours = EXCLUDED.response_time_sla_hours,
  description = EXCLUDED.description, metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 7: ENGINEERING & IT PERSONAS
-- =====================================================================================

INSERT INTO dh_persona (
  tenant_id, code, name, unique_id, expertise_level, years_experience,
  education, typical_titles, decision_authority, capabilities,
  key_responsibilities, department, typical_availability_hours,
  response_time_sla_hours, description, metadata
)
SELECT 
  sc.tenant_id, p_data.code, p_data.name, p_data.unique_id, p_data.expertise_level, p_data.years_experience,
  p_data.education, p_data.typical_titles, p_data.decision_authority, p_data.capabilities,
  p_data.key_responsibilities, p_data.department, p_data.typical_availability_hours,
  p_data.response_time_sla_hours, p_data.description, p_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- P16_ENG_LEAD: Engineering Lead
    (
      'P16_ENG_LEAD',
      'Engineering Lead',
      'PERSONA-P16-ENG-LEAD',
      'EXPERT',
      '10-15',
      json_build_array('MS Computer Science', 'BS Software Engineering')::jsonb,
      json_build_array('VP Engineering', 'CTO', 'Head of Engineering', 'Engineering Director')::jsonb,
      'VERY_HIGH',
      json_build_array(
        'Software Architecture',
        'Mobile App Development',
        'Cloud Infrastructure',
        'DevOps',
        'Security & Compliance',
        'Technical Leadership'
      )::jsonb,
      json_build_array(
        'Technical architecture decisions',
        'Engineering team leadership',
        'Feature development oversight',
        'Technical debt management',
        'Security and compliance',
        'Infrastructure management'
      )::jsonb,
      'Engineering',
      35,
      48,
      'Engineering leader responsible for technical architecture and development',
      jsonb_build_object(
        'review_stage', 'TECHNICAL_REVIEW',
        'decision_scope', 'ARCHITECTURE',
        'typical_time_per_usecase', '1-2 hours'
      )
    ),
    
    -- P17_UX_DESIGN: UX Design Lead
    (
      'P17_UX_DESIGN',
      'UX Design Lead',
      'PERSONA-P17-UX-DESIGN',
      'ADVANCED',
      '7-12',
      json_build_array('MFA Design', 'MS HCI', 'BS Design')::jsonb,
      json_build_array('Head of Design', 'Design Director', 'Principal UX Designer', 'VP Design')::jsonb,
      'MEDIUM',
      json_build_array(
        'User Research',
        'Interaction Design',
        'Usability Testing',
        'Design Systems',
        'Accessibility Design',
        'Patient-Centered Design'
      )::jsonb,
      json_build_array(
        'User experience strategy',
        'Design system development',
        'User research and testing',
        'Accessibility compliance',
        'Patient engagement design',
        'Design team leadership'
      )::jsonb,
      'Design',
      30,
      48,
      'UX leader responsible for patient-centered design and usability',
      jsonb_build_object(
        'review_stage', 'DESIGN_REVIEW',
        'decision_scope', 'USER_EXPERIENCE',
        'typical_time_per_usecase', '1.5-2 hours'
      )
    ),
    
    -- P18_INFORMATION_SECURITY: Information Security Officer
    (
      'P18_INFO_SEC',
      'Information Security Officer',
      'PERSONA-P18-INFO-SEC',
      'EXPERT',
      '10-15',
      json_build_array('MS Cybersecurity', 'CISSP', 'CISM')::jsonb,
      json_build_array('CISO', 'Director Information Security', 'VP Security')::jsonb,
      'VERY_HIGH',
      json_build_array(
        'Security Architecture',
        'HIPAA Compliance',
        'Risk Assessment',
        'Incident Response',
        'Penetration Testing',
        'Security Audits'
      )::jsonb,
      json_build_array(
        'Security strategy and governance',
        'HIPAA compliance oversight',
        'Security risk assessment',
        'Incident response management',
        'Security audit coordination',
        'Vendor security reviews'
      )::jsonb,
      'Information Security',
      20,
      24,
      'Security leader ensuring HIPAA compliance and data protection',
      jsonb_build_object(
        'review_stage', 'SECURITY_REVIEW',
        'decision_scope', 'SECURITY_COMPLIANCE',
        'typical_time_per_usecase', '1-2 hours',
        'escalation_priority', 'HIGH'
      )
    )
) AS p_data(
  code, name, unique_id, expertise_level, years_experience,
  education, typical_titles, decision_authority, capabilities,
  key_responsibilities, department, typical_availability_hours,
  response_time_sla_hours, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  expertise_level = EXCLUDED.expertise_level, years_experience = EXCLUDED.years_experience,
  education = EXCLUDED.education, typical_titles = EXCLUDED.typical_titles,
  decision_authority = EXCLUDED.decision_authority, capabilities = EXCLUDED.capabilities,
  key_responsibilities = EXCLUDED.key_responsibilities, department = EXCLUDED.department,
  typical_availability_hours = EXCLUDED.typical_availability_hours,
  response_time_sla_hours = EXCLUDED.response_time_sla_hours,
  description = EXCLUDED.description, metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

-- Summary by department
SELECT 
  'Foundation Personas by Department' as status,
  department,
  COUNT(*) as persona_count
FROM dh_persona
WHERE tenant_id = (SELECT tenant_id FROM session_config)
GROUP BY department
ORDER BY persona_count DESC;

-- Summary by expertise level
SELECT 
  'Foundation Personas by Expertise' as status,
  expertise_level,
  COUNT(*) as persona_count
FROM dh_persona
WHERE tenant_id = (SELECT tenant_id FROM session_config)
GROUP BY expertise_level
ORDER BY 
  CASE expertise_level
    WHEN 'EXPERT' THEN 1
    WHEN 'ADVANCED' THEN 2
    WHEN 'INTERMEDIATE' THEN 3
    WHEN 'BEGINNER' THEN 4
  END;

-- Overall summary
SELECT 
  'Foundation Personas Seeded' as status,
  jsonb_build_object(
    'total_personas', COUNT(*),
    'executive', COUNT(*) FILTER (WHERE department = 'Executive'),
    'clinical_development', COUNT(*) FILTER (WHERE department = 'Clinical Development'),
    'regulatory_affairs', COUNT(*) FILTER (WHERE department = 'Regulatory Affairs'),
    'biostatistics', COUNT(*) FILTER (WHERE department = 'Biostatistics'),
    'product', COUNT(*) FILTER (WHERE department = 'Product'),
    'patient_advocacy', COUNT(*) FILTER (WHERE department = 'Patient Advocacy')
  ) as summary
FROM dh_persona
WHERE tenant_id = (SELECT tenant_id FROM session_config);

-- =====================================================================================
-- END OF SCRIPT
-- =====================================================================================

