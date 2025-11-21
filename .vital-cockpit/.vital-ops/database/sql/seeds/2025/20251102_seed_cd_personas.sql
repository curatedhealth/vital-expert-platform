-- =====================================================================================
-- Clinical Development (CD) Personas Seed
-- =====================================================================================
-- Purpose: Seed human organizational personas for Clinical Development domain
-- Dependencies: dh_persona table, tenants table, dh_domain table
-- Tenant: digital-health-startup
-- =====================================================================================

-- =====================================================================================
-- SECTION 1: TENANT LOOKUP & VALIDATION
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
-- SECTION 2: DOMAIN SETUP - Clinical Development (CD)
-- =====================================================================================

INSERT INTO dh_domain (tenant_id, code, name, description, unique_id, metadata)
SELECT 
  sc.tenant_id,
  'CD',
  'Clinical Development',
  'Comprehensive clinical trial design, endpoint selection, protocol development, and regulatory strategy for digital therapeutics and digital health interventions',
  'DMN-CD',
  jsonb_build_object(
    'focus_areas', jsonb_build_array(
      'Endpoint Selection & Validation',
      'Clinical Trial Design (RCT, Adaptive)',
      'Protocol Development',
      'Sample Size Calculation',
      'Subgroup Analysis Planning',
      'Digital Biomarker Validation',
      'Engagement Metrics',
      'Patient-Reported Outcomes',
      'Comparator Selection'
    ),
    'regulatory_focus', jsonb_build_array('FDA', 'EMA', 'ICH-GCP', 'DiMe Framework'),
    'target_products', jsonb_build_array('Digital Therapeutics', 'SaMD', 'Digital Biomarkers'),
    'complexity_range', jsonb_build_object(
      'min', 'INTERMEDIATE',
      'max', 'EXPERT'
    )
  )
FROM session_config sc
ON CONFLICT (tenant_id, code) 
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  unique_id = EXCLUDED.unique_id,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 3: ORGANIZATIONAL PERSONAS - Clinical Development Team
-- =====================================================================================
-- These are HUMAN organizational personas (job functions/people) in workflows
-- Format: P##_CODE where ## is persona number, CODE is identifier

INSERT INTO dh_persona (
  tenant_id,
  code,
  name,
  unique_id,
  description,
  expertise_level,
  years_experience,
  education,
  typical_titles,
  decision_authority,
  capabilities,
  key_responsibilities,
  department,
  category_code
)
SELECT
  sc.tenant_id,
  p.code,
  p.name,
  p.unique_id,
  p.description,
  p.expertise_level,
  p.years_experience,
  p.education,
  p.typical_titles,
  p.decision_authority,
  p.capabilities,
  p.key_responsibilities,
  p.department,
  p.category_code
FROM session_config sc
CROSS JOIN (
  SELECT 'P01_CMO' as code, 'Chief Medical Officer' as name, 'PER-P01-CMO' as unique_id,
    'Senior clinical strategist with 15+ years experience in clinical development and regulatory affairs. Final decision authority on endpoint selection, trial design, and protocol approval.' as description,
    'EXPERT' as expertise_level, '15+' as years_experience,
    jsonb_build_array('MD', 'MD/PhD') as education,
    jsonb_build_array('CMO', 'VP Medical Affairs', 'Chief Scientific Officer') as typical_titles,
    'VERY_HIGH' as decision_authority,
    jsonb_build_array('Clinical Trial Strategy', 'Endpoint Selection & Validation', 'FDA/EMA Regulatory Strategy', 'Protocol Review & Approval', 'Risk Assessment', 'Medical Monitoring', 'Safety Oversight') as capabilities,
    jsonb_build_array('Final approval on endpoint selection', 'Clinical trial design leadership', 'FDA Pre-Sub meeting representation', 'Protocol signatory', 'Safety monitoring oversight') as key_responsibilities,
    'Clinical Development' as department, 'CLINICAL_LEADERSHIP' as category_code
  
  UNION ALL SELECT 'P02_VPCLIN', 'VP Clinical Development', 'PER-P02-VPCLIN',
    'Operational clinical development leader with 10+ years experience in protocol writing, GCP compliance, and CRO management. Primary protocol author.',
    'ADVANCED', '10+',
    jsonb_build_array('PhD', 'PharmD', 'MD'),
    jsonb_build_array('VP Clinical Development', 'Clinical Development Director'),
    'HIGH',
    jsonb_build_array('Protocol Writing & Development', 'GCP Compliance', 'Clinical Operations Planning', 'CRO Management', 'Regulatory Precedent Research', 'Feasibility Assessment', 'Multi-Site Trial Management'),
    jsonb_build_array('Primary protocol author', 'GCP compliance oversight', 'Operational feasibility assessment', 'CRO coordination', 'Timeline management'),
    'Clinical Development', 'CLINICAL_OPERATIONS'
  
  UNION ALL SELECT 'P03_CLTM', 'Clinical Trial Manager', 'PER-P03-CLTM',
    'Clinical operations expert with 5+ years experience in day-to-day trial execution, site management, and patient recruitment.',
    'INTERMEDIATE', '5+',
    jsonb_build_array('BSc', 'MSc in Life Sciences', 'CCRA'),
    jsonb_build_array('Clinical Trial Manager', 'Clinical Research Manager'),
    'MEDIUM',
    jsonb_build_array('Site Management', 'Patient Recruitment', 'Retention Strategy', 'Visit Schedule Development', 'Data Collection Oversight', 'Site Feasibility'),
    jsonb_build_array('Site activation and management', 'Patient enrollment tracking', 'Retention strategy execution', 'Visit coordination'),
    'Clinical Operations', 'CLINICAL_OPERATIONS'
  
  UNION ALL SELECT 'P04_BIOSTAT', 'Senior Biostatistician', 'PER-P04-BIOSTAT',
    'Statistical expert with 8+ years experience in clinical trial statistics, sample size calculation, and regulatory statistics.',
    'ADVANCED', '8+',
    jsonb_build_array('MS', 'PhD in Biostatistics', 'Statistics', 'Epidemiology'),
    jsonb_build_array('Senior Biostatistician', 'Statistical Director', 'Lead Biostatistician'),
    'VERY_HIGH',
    jsonb_build_array('Statistical Design', 'Sample Size Calculation', 'Analysis Plan Development', 'Interim Analysis', 'Missing Data Methodology', 'Subgroup Analysis Planning', 'Regulatory Statistics'),
    jsonb_build_array('Statistical design approval', 'Sample size determination', 'SAP development', 'Analysis methodology', 'Regulatory statistical sections'),
    'Biostatistics', 'BIOSTATISTICS'
  
  UNION ALL SELECT 'P05_REGDIR', 'VP Regulatory Affairs', 'PER-P05-REGDIR',
    'Regulatory strategist with 10+ years experience in FDA/EMA submissions, guidance interpretation, and regulatory compliance.',
    'ADVANCED', '10+',
    jsonb_build_array('Life Sciences Degree', 'RAC Certification'),
    jsonb_build_array('VP Regulatory Affairs', 'Regulatory Director', 'RAC'),
    'HIGH',
    jsonb_build_array('FDA/EMA Strategy', 'Regulatory Submissions', 'Guidance Interpretation', 'Pre-Sub Meeting Preparation', 'IND/CTA Strategy', 'Regulatory Compliance', 'Risk Assessment'),
    jsonb_build_array('Regulatory strategy development', 'FDA meeting preparation', 'Submission review', 'Compliance oversight', 'Risk mitigation'),
    'Regulatory Affairs', 'REGULATORY'
  
  UNION ALL SELECT 'P06_MEDDIR', 'Medical Director', 'PER-P06-MEDDIR',
    'Clinical medicine expert with 8+ years experience in clinical practice and medical monitoring for trials.',
    'ADVANCED', '8+',
    jsonb_build_array('MD'),
    jsonb_build_array('Medical Director', 'Medical Monitor', 'Medical Advisor'),
    'HIGH',
    jsonb_build_array('Clinical Medicine', 'Safety Assessment', 'Medical Monitoring', 'Adverse Event Management', 'Clinical Endpoint Review', 'Eligibility Criteria'),
    jsonb_build_array('Safety monitoring', 'Adverse event review', 'Clinical criteria validation', 'Medical monitoring during trial'),
    'Medical Affairs', 'MEDICAL'
  
  UNION ALL SELECT 'P06_DTXCMO', 'DTx Chief Medical Officer', 'PER-P06-DTXCMO',
    'Digital therapeutics clinical leader with 10+ years experience in DTx development and digital health regulatory strategy.',
    'EXPERT', '10+',
    jsonb_build_array('MD', 'MD/PhD with Digital Health focus'),
    jsonb_build_array('DTx CMO', 'Head of Clinical Affairs', 'Chief Scientific Officer'),
    'VERY_HIGH',
    jsonb_build_array('DTx Clinical Strategy', 'Digital Biomarker Validation', 'Digital Health Endpoints', 'DTx Regulatory Pathways', 'Engagement Strategy', 'Digital Evidence Generation'),
    jsonb_build_array('DTx clinical strategy', 'Digital biomarker validation oversight', 'Digital endpoint selection', 'FDA digital health strategy'),
    'Clinical Development', 'DIGITAL_HEALTH_LEADERSHIP'
  
  UNION ALL SELECT 'P07_DATASC', 'Data Scientist - Digital Biomarker', 'PER-P07-DATASC',
    'Technical expert in digital biomarker development with 7+ years experience in algorithm validation and sensor data analysis.',
    'ADVANCED', '7+',
    jsonb_build_array('PhD in Computer Science', 'Engineering', 'Statistics'),
    jsonb_build_array('Data Scientist', 'Digital Biomarker Lead', 'Algorithm Engineer'),
    'HIGH',
    jsonb_build_array('Algorithm Development', 'Digital Biomarker Validation', 'Verification Studies (V1)', 'Sensor Data Analysis', 'Statistical Validation', 'Technical Performance Testing'),
    jsonb_build_array('Verification study design', 'Algorithm accuracy testing', 'Technical validation', 'Data quality assessment'),
    'Data Science', 'DATA_SCIENCE'
  
  UNION ALL SELECT 'P08_CLINRES', 'Clinical Research Scientist', 'PER-P08-CLINRES',
    'Clinical validation expert with 8+ years experience in analytical and clinical validation studies.',
    'ADVANCED', '8+',
    jsonb_build_array('PhD in Clinical Science', 'Epidemiology', 'Psychology'),
    jsonb_build_array('Clinical Research Scientist', 'Clinical Validation Lead'),
    'HIGH',
    jsonb_build_array('Analytical Validation (V2)', 'Clinical Validation (V3)', 'Psychometric Analysis', 'Clinical Study Design', 'Data Collection & Analysis', 'Validity Assessment'),
    jsonb_build_array('Analytical validation study design', 'Clinical validation execution', 'Psychometric assessment', 'Validity testing'),
    'Clinical Research', 'CLINICAL_RESEARCH'
  
  UNION ALL SELECT 'P08_DATADIR', 'Data Management Director', 'PER-P08-DATADIR',
    'Data management expert with 5+ years experience in EDC systems, data quality, and database design.',
    'INTERMEDIATE', '5+',
    jsonb_build_array('Life Sciences', 'Computer Science', 'GCP Training'),
    jsonb_build_array('Data Management Director', 'Clinical Data Manager'),
    'MEDIUM',
    jsonb_build_array('EDC Systems', 'Data Quality Management', 'Database Design', 'Data Collection Planning', 'GCP Data Standards'),
    jsonb_build_array('EDC planning', 'Data collection feasibility', 'Data quality oversight', 'Database structure'),
    'Data Management', 'DATA_MANAGEMENT'
  
  UNION ALL SELECT 'P08_CLOPS', 'Clinical Operations Director', 'PER-P08-CLOPS',
    'Clinical operations leader with 10+ years experience in recruitment, site selection, and budget management.',
    'ADVANCED', '10+',
    jsonb_build_array('Life Sciences', 'Business Administration'),
    jsonb_build_array('Clinical Operations Director', 'VP Clinical Operations'),
    'HIGH',
    jsonb_build_array('Recruitment Strategy', 'Site Selection', 'Budget Management', 'CRO Oversight', 'Trial Logistics', 'Feasibility Assessment'),
    jsonb_build_array('Recruitment planning', 'Site network management', 'Budget oversight', 'Operational feasibility'),
    'Clinical Operations', 'CLINICAL_OPERATIONS'
  
  UNION ALL SELECT 'P10_PATADV', 'Patient Advocate', 'PER-P10-PATADV',
    'Patient perspective expert with lived experience with target condition or caregiver experience.',
    'EXPERT', 'Lived Experience',
    jsonb_build_array('Patient Advocate Training'),
    jsonb_build_array('Patient Advocate', 'Patient Partner', 'Patient Representative'),
    'MEDIUM',
    jsonb_build_array('Patient Perspective', 'Burden Assessment', 'Meaningful Outcomes', 'Patient Engagement', 'Patient-Centered Design', 'Usability Review'),
    jsonb_build_array('Patient burden assessment', 'Meaningful outcome identification', 'Patient-facing material review', 'Patient perspective input'),
    'Patient Advocacy', 'PATIENT_ENGAGEMENT'
  
  UNION ALL SELECT 'P10_PROJMGR', 'Clinical Project Manager', 'PER-P10-PROJMGR',
    'Project management expert with 5+ years experience in clinical trial timeline and resource management.',
    'INTERMEDIATE', '5+',
    jsonb_build_array('Life Sciences', 'PMP', 'Clinical PM Certification'),
    jsonb_build_array('Clinical Project Manager', 'Program Manager'),
    'MEDIUM',
    jsonb_build_array('Timeline Management', 'Resource Planning', 'Stakeholder Coordination', 'Risk Management', 'Protocol Review Coordination', 'Action Item Tracking'),
    jsonb_build_array('Timeline coordination', 'Resource allocation', 'Meeting facilitation', 'Deliverable tracking'),
    'Project Management', 'PROJECT_MANAGEMENT'
  
  UNION ALL SELECT 'P11_SITEPI', 'Principal Investigator', 'PER-P11-SITEPI',
    'Clinical investigator with 10+ years experience in conducting clinical trials at research sites.',
    'EXPERT', '10+',
    jsonb_build_array('MD'),
    jsonb_build_array('Principal Investigator', 'Site PI', 'Clinical Investigator'),
    'ADVISORY',
    jsonb_build_array('Clinical Research', 'Patient Care', 'GCP Compliance', 'Site Operations', 'Protocol Feasibility', 'Informed Consent'),
    jsonb_build_array('Protocol feasibility review', 'Patient burden assessment', 'Site perspective input', 'Recruitment feasibility'),
    'Site Operations', 'SITE_OPERATIONS'
  
  UNION ALL SELECT 'P03_PRODMGR', 'Product Manager - Digital Health', 'PER-P03-PRODMGR',
    'Digital health product expert with 5+ years experience in product analytics, UX/UI design, and digital health technology.',
    'INTERMEDIATE', '5+',
    jsonb_build_array('Computer Science', 'Product Management', 'Digital Health'),
    jsonb_build_array('Product Manager Digital Health', 'VP Product', 'Head of Product'),
    'MEDIUM',
    jsonb_build_array('Digital Product Analytics', 'Event Logging', 'Data Instrumentation', 'UX/UI Design', 'Engagement Metrics', 'Data Quality', 'Product Roadmap'),
    jsonb_build_array('Engagement metric definition', 'Data capture specification', 'Analytics platform oversight', 'Technical feasibility'),
    'Product Management', 'PRODUCT_MANAGEMENT'
  
  UNION ALL SELECT 'P06_PMDIG', 'Digital Health Product Manager', 'PER-P06-PMDIG',
    'Digital product expert with 5+ years experience in DTx feature design, digital biomarker collection, and user engagement.',
    'INTERMEDIATE', '5+',
    jsonb_build_array('Product Management', 'UX/UI Design', 'Digital Health Technology'),
    jsonb_build_array('VP Product', 'Head of Product', 'Digital Health PM'),
    'MEDIUM',
    jsonb_build_array('Digital Implementation', 'Digital Biomarker Collection', 'Data Quality Strategy', 'User Engagement', 'Feature Design', 'Technical Feasibility'),
    jsonb_build_array('Digital feasibility assessment', 'Data collection capabilities', 'User experience optimization', 'Development effort estimation'),
    'Product Management', 'PRODUCT_MANAGEMENT'
  
  UNION ALL SELECT 'P04_REGDIR', 'Regulatory Affairs Director', 'PER-P04-REGDIR',
    'Regulatory expert with 8+ years experience in digital health regulatory strategy and FDA submissions.',
    'ADVANCED', '8+',
    jsonb_build_array('Life Sciences', 'RAC'),
    jsonb_build_array('Regulatory Affairs Director', 'Head of Regulatory'),
    'HIGH',
    jsonb_build_array('Digital Health Regulation', 'FDA Digital Health Guidance', 'Endpoint Regulatory Strategy', 'Pre-Sub Meeting Prep', 'Submission Strategy', 'Compliance Oversight'),
    jsonb_build_array('Digital health regulatory strategy', 'Endpoint regulatory positioning', 'FDA meeting preparation', 'Compliance validation'),
    'Regulatory Affairs', 'REGULATORY'
  
  UNION ALL SELECT 'P15_HEOR', 'Health Economics & Outcomes Research', 'PER-P15-HEOR',
    'HEOR expert with 8+ years experience in MCID determination, cost-effectiveness modeling, and payer evidence.',
    'ADVANCED', '8+',
    jsonb_build_array('PhD in Health Economics', 'Outcomes Research', 'Epidemiology'),
    jsonb_build_array('HEOR Director', 'Health Economist', 'Outcomes Researcher'),
    'HIGH',
    jsonb_build_array('MCID Determination', 'Anchor-Based Analysis', 'Distribution-Based Analysis', 'Cost-Effectiveness Modeling', 'Payer Evidence', 'HTA Submissions'),
    jsonb_build_array('MCID study design', 'Economic evidence generation', 'Payer dossier preparation', 'HTA strategy'),
    'Health Economics', 'HEOR'
  
  UNION ALL SELECT 'P16_MEDWRIT', 'Medical Writer', 'PER-P16-MEDWRIT',
    'Scientific writing expert with 5+ years experience in validation reports, manuscripts, and regulatory documents.',
    'INTERMEDIATE', '5+',
    jsonb_build_array('PhD', 'Life Sciences', 'Medical Writing Certification'),
    jsonb_build_array('Medical Writer', 'Publication Specialist', 'Regulatory Writer'),
    'LOW',
    jsonb_build_array('Medical Writing', 'Protocol Writing', 'Clinical Study Reports', 'Manuscript Preparation', 'Regulatory Document Writing', 'ICMJE Guidelines'),
    jsonb_build_array('Protocol drafting support', 'Report writing', 'Manuscript preparation', 'Regulatory document creation'),
    'Medical Writing', 'MEDICAL_WRITING'
) AS p
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  unique_id = EXCLUDED.unique_id,
  description = EXCLUDED.description,
  expertise_level = EXCLUDED.expertise_level,
  years_experience = EXCLUDED.years_experience,
  education = EXCLUDED.education,
  typical_titles = EXCLUDED.typical_titles,
  decision_authority = EXCLUDED.decision_authority,
  capabilities = EXCLUDED.capabilities,
  key_responsibilities = EXCLUDED.key_responsibilities,
  department = EXCLUDED.department,
  category_code = EXCLUDED.category_code,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

-- Verify domain was created
SELECT 
  'Domain Created' as status,
  code,
  name,
  description
FROM dh_domain
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND code = 'CD';

-- Verify all personas were created
SELECT 
  'Personas Created' as status,
  COUNT(*) as total_personas,
  COUNT(*) FILTER (WHERE expertise_level = 'EXPERT') as expert_personas,
  COUNT(*) FILTER (WHERE expertise_level = 'ADVANCED') as advanced_personas,
  COUNT(*) FILTER (WHERE expertise_level = 'INTERMEDIATE') as intermediate_personas
FROM dh_persona
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND code LIKE 'P%';

-- List all created personas
SELECT 
  code,
  name,
  expertise_level,
  decision_authority,
  department
FROM dh_persona
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND code LIKE 'P%'
ORDER BY code;

-- =====================================================================================
-- END OF SCRIPT
-- =====================================================================================

