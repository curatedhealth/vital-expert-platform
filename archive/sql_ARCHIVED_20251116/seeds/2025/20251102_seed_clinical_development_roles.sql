-- =====================================================================================
-- 01_tenant_personas_domain.sql
-- Clinical Development (CD) Use Cases - Tenant, Personas & Domain Setup
-- =====================================================================================
-- Purpose: Seed tenant-specific data, human personas, and domain hierarchy
-- Dependencies: Existing tenants table, dh_domain table, dh_persona table
-- Execution Order: 1 of 3
-- Tenant: digital-health-startup
-- Note: Uses new dh_persona table (human roles) instead of dh_role
-- =====================================================================================

-- =====================================================================================
-- SECTION 1: TENANT LOOKUP & VALIDATION
-- =====================================================================================
-- Verify tenant exists before proceeding

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
-- These are HUMAN ORGANIZATIONAL PERSONAS (job functions) that perform tasks in workflows
-- NOT Supabase RLS security roles - these represent actual people/job functions
-- Stored in dh_persona table to link to tasks via dh_task_persona
-- Format: P##_CODE where ## is persona number, CODE is role identifier

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
  category_code,
  metadata
)
SELECT 
  sc.tenant_id,
  persona_data.code,
  persona_data.name,
  persona_data.unique_id,
  persona_data.description,
  persona_data.expertise_level,
  persona_data.years_experience,
  persona_data.education,
  persona_data.typical_titles,
  persona_data.decision_authority,
  persona_data.capabilities,
  persona_data.key_responsibilities,
  persona_data.category_code,
  persona_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- P01: Chief Medical Officer
    (
      'P01_CMO',
      'Chief Medical Officer',
      'PER-P01-CMO',
      'Senior clinical strategist with 15+ years experience in clinical development and regulatory affairs. Final decision authority on endpoint selection, trial design, and protocol approval.',
      'EXPERT',
      '15+',
      jsonb_build_array('MD', 'MD/PhD'),
      jsonb_build_array('CMO', 'VP Medical Affairs', 'Chief Scientific Officer'),
      'VERY_HIGH',
      jsonb_build_array(
        'capabilities', jsonb_build_array(
          'Clinical Trial Strategy',
          'Endpoint Selection & Validation',
          'FDA/EMA Regulatory Strategy',
          'Protocol Review & Approval',
          'Risk Assessment',
          'Medical Monitoring',
          'Safety Oversight'
        ),
        'expertise_level', 'EXPERT',
        'years_experience', '15+',
        'education', jsonb_build_array('MD', 'MD/PhD'),
        'decision_authority', 'VERY_HIGH',
        'typical_titles', jsonb_build_array('CMO', 'VP Medical Affairs', 'Chief Scientific Officer'),
        'key_responsibilities', jsonb_build_array(
          'Final approval on endpoint selection',
          'Clinical trial design leadership',
          'FDA Pre-Sub meeting representation',
          'Protocol signatory',
          'Safety monitoring oversight'
        )
      )
    ),
    
    -- P02: VP Clinical Development
    (
      'P02_VPCLIN',
      'VP Clinical Development',
      'Human',
      'Operational clinical development leader with 10+ years experience in protocol writing, GCP compliance, and CRO management. Primary protocol author.',
      'AGT-P02-VPCLIN',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'Protocol Writing & Development',
          'GCP Compliance',
          'Clinical Operations Planning',
          'CRO Management',
          'Regulatory Precedent Research',
          'Feasibility Assessment',
          'Multi-Site Trial Management'
        ),
        'expertise_level', 'ADVANCED',
        'years_experience', '10+',
        'education', jsonb_build_array('PhD', 'PharmD', 'MD'),
        'decision_authority', 'HIGH',
        'typical_titles', jsonb_build_array('VP Clinical Development', 'Clinical Development Director'),
        'key_responsibilities', jsonb_build_array(
          'Primary protocol author',
          'GCP compliance oversight',
          'Operational feasibility assessment',
          'CRO coordination',
          'Timeline management'
        )
      )
    ),
    
    -- P03: Clinical Trial Manager
    (
      'P03_CLTM',
      'Clinical Trial Manager',
      'Human',
      'Clinical operations expert with 5+ years experience in day-to-day trial execution, site management, and patient recruitment.',
      'AGT-P03-CLTM',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'Site Management',
          'Patient Recruitment',
          'Retention Strategy',
          'Visit Schedule Development',
          'Data Collection Oversight',
          'Site Feasibility'
        ),
        'expertise_level', 'INTERMEDIATE',
        'years_experience', '5+',
        'education', jsonb_build_array('BSc', 'MSc in Life Sciences', 'CCRA'),
        'decision_authority', 'MEDIUM',
        'typical_titles', jsonb_build_array('Clinical Trial Manager', 'Clinical Research Manager'),
        'key_responsibilities', jsonb_build_array(
          'Site activation and management',
          'Patient enrollment tracking',
          'Retention strategy execution',
          'Visit coordination'
        )
      )
    ),
    
    -- P04: Senior Biostatistician
    (
      'P04_BIOSTAT',
      'Senior Biostatistician',
      'Human',
      'Statistical expert with 8+ years experience in clinical trial statistics, sample size calculation, and regulatory statistics.',
      'AGT-P04-BIOSTAT',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'Statistical Design',
          'Sample Size Calculation',
          'Analysis Plan Development',
          'Interim Analysis',
          'Missing Data Methodology',
          'Subgroup Analysis Planning',
          'Regulatory Statistics'
        ),
        'expertise_level', 'ADVANCED',
        'years_experience', '8+',
        'education', jsonb_build_array('MS', 'PhD in Biostatistics', 'Statistics', 'Epidemiology'),
        'decision_authority', 'VERY_HIGH',
        'typical_titles', jsonb_build_array('Senior Biostatistician', 'Statistical Director', 'Lead Biostatistician'),
        'key_responsibilities', jsonb_build_array(
          'Statistical design approval',
          'Sample size determination',
          'SAP development',
          'Analysis methodology',
          'Regulatory statistical sections'
        )
      )
    ),
    
    -- P05: VP Regulatory Affairs
    (
      'P05_REGDIR',
      'VP Regulatory Affairs',
      'Human',
      'Regulatory strategist with 10+ years experience in FDA/EMA submissions, guidance interpretation, and regulatory compliance.',
      'AGT-P05-REGDIR',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'FDA/EMA Strategy',
          'Regulatory Submissions',
          'Guidance Interpretation',
          'Pre-Sub Meeting Preparation',
          'IND/CTA Strategy',
          'Regulatory Compliance',
          'Risk Assessment'
        ),
        'expertise_level', 'ADVANCED',
        'years_experience', '10+',
        'education', jsonb_build_array('Life Sciences Degree', 'RAC Certification'),
        'decision_authority', 'HIGH',
        'typical_titles', jsonb_build_array('VP Regulatory Affairs', 'Regulatory Director', 'RAC'),
        'key_responsibilities', jsonb_build_array(
          'Regulatory strategy development',
          'FDA meeting preparation',
          'Submission review',
          'Compliance oversight',
          'Risk mitigation'
        )
      )
    ),
    
    -- P06: Medical Director
    (
      'P06_MEDDIR',
      'Medical Director',
      'Human',
      'Clinical medicine expert with 8+ years experience in clinical practice and medical monitoring for trials.',
      'AGT-P06-MEDDIR',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'Clinical Medicine',
          'Safety Assessment',
          'Medical Monitoring',
          'Adverse Event Management',
          'Clinical Endpoint Review',
          'Eligibility Criteria'
        ),
        'expertise_level', 'ADVANCED',
        'years_experience', '8+',
        'education', jsonb_build_array('MD'),
        'decision_authority', 'HIGH',
        'typical_titles', jsonb_build_array('Medical Director', 'Medical Monitor', 'Medical Advisor'),
        'key_responsibilities', jsonb_build_array(
          'Safety monitoring',
          'Adverse event review',
          'Clinical criteria validation',
          'Medical monitoring during trial'
        )
      )
    ),
    
    -- P06: DTx Chief Medical Officer (distinct from P01)
    (
      'P06_DTXCMO',
      'DTx Chief Medical Officer',
      'Human',
      'Digital therapeutics clinical leader with 10+ years experience in DTx development and digital health regulatory strategy.',
      'AGT-P06-DTXCMO',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'DTx Clinical Strategy',
          'Digital Biomarker Validation',
          'Digital Health Endpoints',
          'DTx Regulatory Pathways',
          'Engagement Strategy',
          'Digital Evidence Generation'
        ),
        'expertise_level', 'EXPERT',
        'years_experience', '10+',
        'education', jsonb_build_array('MD', 'MD/PhD with Digital Health focus'),
        'decision_authority', 'VERY_HIGH',
        'typical_titles', jsonb_build_array('DTx CMO', 'Head of Clinical Affairs', 'Chief Scientific Officer'),
        'key_responsibilities', jsonb_build_array(
          'DTx clinical strategy',
          'Digital biomarker validation oversight',
          'Digital endpoint selection',
          'FDA digital health strategy'
        )
      )
    ),
    
    -- P07: Data Scientist / Digital Biomarker Lead
    (
      'P07_DATASC',
      'Data Scientist - Digital Biomarker',
      'Human',
      'Technical expert in digital biomarker development with 7+ years experience in algorithm validation and sensor data analysis.',
      'AGT-P07-DATASC',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'Algorithm Development',
          'Digital Biomarker Validation',
          'Verification Studies (V1)',
          'Sensor Data Analysis',
          'Statistical Validation',
          'Technical Performance Testing'
        ),
        'expertise_level', 'ADVANCED',
        'years_experience', '7+',
        'education', jsonb_build_array('PhD in Computer Science', 'Engineering', 'Statistics'),
        'decision_authority', 'HIGH',
        'typical_titles', jsonb_build_array('Data Scientist', 'Digital Biomarker Lead', 'Algorithm Engineer'),
        'key_responsibilities', jsonb_build_array(
          'Verification study design',
          'Algorithm accuracy testing',
          'Technical validation',
          'Data quality assessment'
        )
      )
    ),
    
    -- P08: Clinical Research Scientist
    (
      'P08_CLINRES',
      'Clinical Research Scientist',
      'Human',
      'Clinical validation expert with 8+ years experience in analytical and clinical validation studies.',
      'AGT-P08-CLINRES',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'Analytical Validation (V2)',
          'Clinical Validation (V3)',
          'Psychometric Analysis',
          'Clinical Study Design',
          'Data Collection & Analysis',
          'Validity Assessment'
        ),
        'expertise_level', 'ADVANCED',
        'years_experience', '8+',
        'education', jsonb_build_array('PhD in Clinical Science', 'Epidemiology', 'Psychology'),
        'decision_authority', 'HIGH',
        'typical_titles', jsonb_build_array('Clinical Research Scientist', 'Clinical Validation Lead'),
        'key_responsibilities', jsonb_build_array(
          'Analytical validation study design',
          'Clinical validation execution',
          'Psychometric assessment',
          'Validity testing'
        )
      )
    ),
    
    -- P08: Data Management Director (distinct role)
    (
      'P08_DATADIR',
      'Data Management Director',
      'Human',
      'Data management expert with 5+ years experience in EDC systems, data quality, and database design.',
      'AGT-P08-DATADIR',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'EDC Systems',
          'Data Quality Management',
          'Database Design',
          'Data Collection Planning',
          'GCP Data Standards'
        ),
        'expertise_level', 'INTERMEDIATE',
        'years_experience', '5+',
        'education', jsonb_build_array('Life Sciences', 'Computer Science', 'GCP Training'),
        'decision_authority', 'MEDIUM',
        'typical_titles', jsonb_build_array('Data Management Director', 'Clinical Data Manager'),
        'key_responsibilities', jsonb_build_array(
          'EDC planning',
          'Data collection feasibility',
          'Data quality oversight',
          'Database structure'
        )
      )
    ),
    
    -- P08: Clinical Operations Director (distinct role)
    (
      'P08_CLOPS',
      'Clinical Operations Director',
      'Human',
      'Clinical operations leader with 10+ years experience in recruitment, site selection, and budget management.',
      'AGT-P08-CLOPS',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'Recruitment Strategy',
          'Site Selection',
          'Budget Management',
          'CRO Oversight',
          'Trial Logistics',
          'Feasibility Assessment'
        ),
        'expertise_level', 'ADVANCED',
        'years_experience', '10+',
        'education', jsonb_build_array('Life Sciences', 'Business Administration'),
        'decision_authority', 'HIGH',
        'typical_titles', jsonb_build_array('Clinical Operations Director', 'VP Clinical Operations'),
        'key_responsibilities', jsonb_build_array(
          'Recruitment planning',
          'Site network management',
          'Budget oversight',
          'Operational feasibility'
        )
      )
    ),
    
    -- P10: Patient Advocate
    (
      'P10_PATADV',
      'Patient Advocate',
      'Human',
      'Patient perspective expert with lived experience with target condition or caregiver experience.',
      'AGT-P10-PATADV',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'Patient Perspective',
          'Burden Assessment',
          'Meaningful Outcomes',
          'Patient Engagement',
          'Patient-Centered Design',
          'Usability Review'
        ),
        'expertise_level', 'EXPERT',
        'years_experience', 'Lived Experience',
        'decision_authority', 'MEDIUM',
        'typical_titles', jsonb_build_array('Patient Advocate', 'Patient Partner', 'Patient Representative'),
        'key_responsibilities', jsonb_build_array(
          'Patient burden assessment',
          'Meaningful outcome identification',
          'Patient-facing material review',
          'Patient perspective input'
        )
      )
    ),
    
    -- P10: Project Manager
    (
      'P10_PROJMGR',
      'Clinical Project Manager',
      'Human',
      'Project management expert with 5+ years experience in clinical trial timeline and resource management.',
      'AGT-P10-PROJMGR',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'Timeline Management',
          'Resource Planning',
          'Stakeholder Coordination',
          'Risk Management',
          'Protocol Review Coordination',
          'Action Item Tracking'
        ),
        'expertise_level', 'INTERMEDIATE',
        'years_experience', '5+',
        'education', jsonb_build_array('Life Sciences', 'PMP', 'Clinical PM Certification'),
        'decision_authority', 'MEDIUM',
        'typical_titles', jsonb_build_array('Clinical Project Manager', 'Program Manager'),
        'key_responsibilities', jsonb_build_array(
          'Timeline coordination',
          'Resource allocation',
          'Meeting facilitation',
          'Deliverable tracking'
        )
      )
    ),
    
    -- P11: Principal Investigator (Site)
    (
      'P11_SITEPI',
      'Principal Investigator',
      'Human',
      'Clinical investigator with 10+ years experience in conducting clinical trials at research sites.',
      'AGT-P11-SITEPI',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'Clinical Research',
          'Patient Care',
          'GCP Compliance',
          'Site Operations',
          'Protocol Feasibility',
          'Informed Consent'
        ),
        'expertise_level', 'EXPERT',
        'years_experience', '10+',
        'education', jsonb_build_array('MD'),
        'decision_authority', 'LOW',
        'advisory_role', true,
        'typical_titles', jsonb_build_array('Principal Investigator', 'Site PI', 'Clinical Investigator'),
        'key_responsibilities', jsonb_build_array(
          'Protocol feasibility review',
          'Patient burden assessment',
          'Site perspective input',
          'Recruitment feasibility'
        )
      )
    ),
    
    -- P03: Product Manager (Digital Health)
    (
      'P03_PRODMGR',
      'Product Manager - Digital Health',
      'Human',
      'Digital health product expert with 5+ years experience in product analytics, UX/UI design, and digital health technology.',
      'AGT-P03-PRODMGR',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'Digital Product Analytics',
          'Event Logging',
          'Data Instrumentation',
          'UX/UI Design',
          'Engagement Metrics',
          'Data Quality',
          'Product Roadmap'
        ),
        'expertise_level', 'INTERMEDIATE',
        'years_experience', '5+',
        'education', jsonb_build_array('Computer Science', 'Product Management', 'Digital Health'),
        'decision_authority', 'MEDIUM',
        'typical_titles', jsonb_build_array('Product Manager Digital Health', 'VP Product', 'Head of Product'),
        'key_responsibilities', jsonb_build_array(
          'Engagement metric definition',
          'Data capture specification',
          'Analytics platform oversight',
          'Technical feasibility'
        )
      )
    ),
    
    -- P06: Digital Health Product Manager (alternate notation)
    (
      'P06_PMDIG',
      'Digital Health Product Manager',
      'Human',
      'Digital product expert with 5+ years experience in DTx feature design, digital biomarker collection, and user engagement.',
      'AGT-P06-PMDIG',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'Digital Implementation',
          'Digital Biomarker Collection',
          'Data Quality Strategy',
          'User Engagement',
          'Feature Design',
          'Technical Feasibility'
        ),
        'expertise_level', 'INTERMEDIATE',
        'years_experience', '5+',
        'education', jsonb_build_array('Product Management', 'UX/UI Design', 'Digital Health Technology'),
        'decision_authority', 'MEDIUM',
        'typical_titles', jsonb_build_array('VP Product', 'Head of Product', 'Digital Health PM'),
        'key_responsibilities', jsonb_build_array(
          'Digital feasibility assessment',
          'Data collection capabilities',
          'User experience optimization',
          'Development effort estimation'
        )
      )
    ),
    
    -- P04: Regulatory Affairs Director (alternate notation if different from P05)
    (
      'P04_REGDIR',
      'Regulatory Affairs Director',
      'Human',
      'Regulatory expert with 8+ years experience in digital health regulatory strategy and FDA submissions.',
      'AGT-P04-REGDIR',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'Digital Health Regulation',
          'FDA Digital Health Guidance',
          'Endpoint Regulatory Strategy',
          'Pre-Sub Meeting Prep',
          'Submission Strategy',
          'Compliance Oversight'
        ),
        'expertise_level', 'ADVANCED',
        'years_experience', '8+',
        'education', jsonb_build_array('Life Sciences', 'RAC'),
        'decision_authority', 'HIGH',
        'typical_titles', jsonb_build_array('Regulatory Affairs Director', 'Head of Regulatory'),
        'key_responsibilities', jsonb_build_array(
          'Digital health regulatory strategy',
          'Endpoint regulatory positioning',
          'FDA meeting preparation',
          'Compliance validation'
        )
      )
    ),
    
    -- P15: Health Economist / Outcomes Researcher
    (
      'P15_HEOR',
      'Health Economics & Outcomes Research',
      'Human',
      'HEOR expert with 8+ years experience in MCID determination, cost-effectiveness modeling, and payer evidence.',
      'AGT-P15-HEOR',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'MCID Determination',
          'Anchor-Based Analysis',
          'Distribution-Based Analysis',
          'Cost-Effectiveness Modeling',
          'Payer Evidence',
          'HTA Submissions'
        ),
        'expertise_level', 'ADVANCED',
        'years_experience', '8+',
        'education', jsonb_build_array('PhD in Health Economics', 'Outcomes Research', 'Epidemiology'),
        'decision_authority', 'HIGH',
        'typical_titles', jsonb_build_array('HEOR Director', 'Health Economist', 'Outcomes Researcher'),
        'key_responsibilities', jsonb_build_array(
          'MCID study design',
          'Economic evidence generation',
          'Payer dossier preparation',
          'HTA strategy'
        )
      )
    ),
    
    -- P16: Medical Writer
    (
      'P16_MEDWRIT',
      'Medical Writer',
      'Human',
      'Scientific writing expert with 5+ years experience in validation reports, manuscripts, and regulatory documents.',
      'AGT-P16-MEDWRIT',
      'HUMAN',
      jsonb_build_object(
        'capabilities', jsonb_build_array(
          'Medical Writing',
          'Protocol Writing',
          'Clinical Study Reports',
          'Manuscript Preparation',
          'Regulatory Document Writing',
          'ICMJE Guidelines'
        ),
        'expertise_level', 'INTERMEDIATE',
        'years_experience', '5+',
        'education', jsonb_build_array('PhD', 'Life Sciences', 'Medical Writing Certification'),
        'decision_authority', 'LOW',
        'typical_titles', jsonb_build_array('Medical Writer', 'Publication Specialist', 'Regulatory Writer'),
        'key_responsibilities', jsonb_build_array(
          'Protocol drafting support',
          'Report writing',
          'Manuscript preparation',
          'Regulatory document creation'
        )
      )
    )

) AS role_data(code, name, agent_type, description, unique_id, category_code, metadata)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  agent_type = EXCLUDED.agent_type,
  description = EXCLUDED.description,
  unique_id = EXCLUDED.unique_id,
  category_code = EXCLUDED.category_code,
  metadata = EXCLUDED.metadata,
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

-- Verify all roles were created
SELECT 
  'Roles Created' as status,
  COUNT(*) as total_roles,
  COUNT(*) FILTER (WHERE agent_type = 'Human') as human_roles,
  COUNT(*) FILTER (WHERE agent_type = 'AI') as ai_roles
FROM dh_role
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND code LIKE 'P%';

-- List all created roles
SELECT 
  code,
  name,
  agent_type,
  metadata->>'expertise_level' as expertise,
  metadata->>'decision_authority' as authority
FROM dh_role
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND code LIKE 'P%'
ORDER BY code;

-- =====================================================================================
-- END OF SCRIPT
-- =====================================================================================
-- Next: Execute 02_usecases_workflows.sql
-- =====================================================================================

