-- ================================================================
-- DIGITAL HEALTH COMPLETE ENRICHMENT
-- Missing Departments, Roles, JTBDs, and Data Enrichment
-- ================================================================
-- Version: 1.0
-- Date: 2025-12-01
-- Tenant: c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244 (VITAL System)
-- Industry: Digital Health (e5f6a7b8-5555-4eee-8005-000000000005)
-- ================================================================

BEGIN;

-- ================================================================
-- SECTION 0: SET TENANT CONTEXT
-- ================================================================

DO $$
DECLARE
  v_tenant_id UUID := 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid;
BEGIN
  PERFORM set_config('app.seed_tenant_id', v_tenant_id::text, false);
  RAISE NOTICE 'Using VITAL System tenant_id: %', v_tenant_id;
END $$;

-- ================================================================
-- SECTION 1: CREATE 2 MISSING DEPARTMENTS
-- ================================================================
-- Department 1: Clinical Validation (under Regulatory, Quality & Compliance)
-- Department 2: Real-World Evidence (under Data Science & Analytics)
-- ================================================================

-- Get function IDs and insert departments
DO $$
DECLARE
  v_tenant_id UUID := current_setting('app.seed_tenant_id')::uuid;
  v_regulatory_func_id UUID;
  v_data_science_func_id UUID;
  v_clinical_validation_dept_id UUID;
  v_rwe_dept_id UUID;
BEGIN
  -- Get Regulatory, Quality & Compliance function ID
  SELECT id INTO v_regulatory_func_id 
  FROM org_functions 
  WHERE (tenant_id = v_tenant_id OR tenant_id IS NULL)
    AND (slug = 'regulatory-quality-compliance' OR name ILIKE '%Regulatory%Quality%Compliance%')
  LIMIT 1;
  
  -- Get Data Science & Analytics function ID
  SELECT id INTO v_data_science_func_id 
  FROM org_functions 
  WHERE (tenant_id = v_tenant_id OR tenant_id IS NULL)
    AND (slug = 'data-science-analytics' OR name ILIKE '%Data Science%Analytics%')
  LIMIT 1;

  RAISE NOTICE 'Regulatory Function ID: %', v_regulatory_func_id;
  RAISE NOTICE 'Data Science Function ID: %', v_data_science_func_id;

  -- Check if Clinical Validation Department exists, if not create it
  SELECT id INTO v_clinical_validation_dept_id 
  FROM org_departments 
  WHERE slug = 'clinical-validation-dh' AND tenant_id = v_tenant_id;
  
  IF v_clinical_validation_dept_id IS NULL THEN
    INSERT INTO org_departments (
      id, tenant_id, function_id, name, slug, description, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_tenant_id,
      v_regulatory_func_id,
      'Clinical Validation',
      'clinical-validation-dh',
      'Ensures digital health solutions meet clinical standards through rigorous validation studies, clinical evidence generation, and regulatory compliance for SaMD/DTx products',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_clinical_validation_dept_id;
    RAISE NOTICE '✅ Created Clinical Validation Department: %', v_clinical_validation_dept_id;
  ELSE
    -- Update existing
    UPDATE org_departments SET
      name = 'Clinical Validation',
      description = 'Ensures digital health solutions meet clinical standards through rigorous validation studies, clinical evidence generation, and regulatory compliance for SaMD/DTx products',
      function_id = v_regulatory_func_id,
      updated_at = NOW()
    WHERE id = v_clinical_validation_dept_id;
    RAISE NOTICE '✅ Updated Clinical Validation Department: %', v_clinical_validation_dept_id;
  END IF;

  -- Check if Real-World Evidence Department exists, if not create it
  SELECT id INTO v_rwe_dept_id 
  FROM org_departments 
  WHERE slug = 'real-world-evidence-dh' AND tenant_id = v_tenant_id;
  
  IF v_rwe_dept_id IS NULL THEN
    INSERT INTO org_departments (
      id, tenant_id, function_id, name, slug, description, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_tenant_id,
      v_data_science_func_id,
      'Real-World Evidence',
      'real-world-evidence-dh',
      'Generates and analyzes real-world data to demonstrate clinical effectiveness, safety, and value of digital health interventions across diverse populations',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_rwe_dept_id;
    RAISE NOTICE '✅ Created Real-World Evidence Department: %', v_rwe_dept_id;
  ELSE
    -- Update existing
    UPDATE org_departments SET
      name = 'Real-World Evidence',
      description = 'Generates and analyzes real-world data to demonstrate clinical effectiveness, safety, and value of digital health interventions across diverse populations',
      function_id = v_data_science_func_id,
      updated_at = NOW()
    WHERE id = v_rwe_dept_id;
    RAISE NOTICE '✅ Updated Real-World Evidence Department: %', v_rwe_dept_id;
  END IF;

END $$;

-- ================================================================
-- SECTION 2: CREATE ROLES FOR NEW DEPARTMENTS
-- ================================================================

-- Clinical Validation Department Roles
-- Note: geographic_scope set to 'regional' as default - actual scope depends on company size/footprint
DO $$
DECLARE
  v_tenant_id UUID := current_setting('app.seed_tenant_id')::uuid;
  v_dept_id UUID;
  v_func_id UUID;
  r RECORD;
BEGIN
  -- Get department and function IDs
  SELECT d.id, d.function_id INTO v_dept_id, v_func_id 
  FROM org_departments d
  WHERE d.slug = 'clinical-validation-dh' AND d.tenant_id = v_tenant_id LIMIT 1;
  
  RAISE NOTICE 'Clinical Validation Dept ID: %, Function ID: %', v_dept_id, v_func_id;
  
  FOR r IN 
    SELECT * FROM (VALUES
      ('Clinical Validation Associate', 'clinical-validation-associate', 
       'Supports validation studies by collecting data, managing documentation, and assisting with protocol execution for digital health products', 'entry', 'regional'),
      ('Clinical Validation Specialist', 'clinical-validation-specialist',
       'Conducts validation studies to assess effectiveness and safety of digital health technologies, ensuring compliance with FDA/CE requirements', 'mid', 'regional'),
      ('Clinical Data Manager', 'clinical-data-manager-dh',
       'Manages clinical data collection, integration, and validation to support regulatory submissions and clinical evidence generation', 'mid', 'regional'),
      ('Regulatory Affairs Coordinator', 'regulatory-affairs-coordinator-dh',
       'Coordinates regulatory documentation, tracks submission timelines, and ensures validation processes meet regulatory standards', 'mid', 'regional'),
      ('Senior Clinical Validation Specialist', 'senior-clinical-validation-specialist',
       'Leads complex validation studies, mentors junior staff, and develops validation strategies for SaMD and DTx products', 'senior', 'regional'),
      ('Clinical Validation Lead', 'clinical-validation-lead',
       'Oversees validation study design and execution, ensuring digital health products meet clinical requirements and regulatory standards', 'senior', 'regional'),
      ('Quality Assurance Manager', 'qa-manager-clinical-validation',
       'Develops and implements quality control processes for clinical validation, ensuring compliance with GCP and ISO 13485', 'senior', 'regional'),
      ('Director of Clinical Validation', 'director-clinical-validation',
       'Directs clinical validation strategy, manages validation team, and ensures portfolio-wide evidence generation meets regulatory requirements', 'director', 'regional'),
      ('VP of Clinical Validation', 'vp-clinical-validation',
       'Executive leader responsible for clinical validation strategy, regulatory relationships, and evidence generation roadmap across the organization', 'executive', 'regional')
    ) AS t(name, slug, description, seniority, geo_scope)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM org_roles WHERE slug = r.slug AND tenant_id = v_tenant_id) THEN
      INSERT INTO org_roles (id, tenant_id, function_id, department_id, name, slug, description, seniority_level, geographic_scope, created_at, updated_at)
      VALUES (gen_random_uuid(), v_tenant_id, v_func_id, v_dept_id, r.name, r.slug, r.description, r.seniority::seniority_level_type, r.geo_scope::geographic_scope_type, NOW(), NOW());
      RAISE NOTICE '✅ Created role: %', r.name;
    END IF;
  END LOOP;
END $$;

-- Real-World Evidence Department Roles
-- Note: geographic_scope set to 'regional' as default - actual scope depends on company size/footprint
DO $$
DECLARE
  v_tenant_id UUID := current_setting('app.seed_tenant_id')::uuid;
  v_dept_id UUID;
  v_func_id UUID;
  r RECORD;
BEGIN
  -- Get department and function IDs
  SELECT d.id, d.function_id INTO v_dept_id, v_func_id 
  FROM org_departments d
  WHERE d.slug = 'real-world-evidence-dh' AND d.tenant_id = v_tenant_id LIMIT 1;
  
  RAISE NOTICE 'Real-World Evidence Dept ID: %, Function ID: %', v_dept_id, v_func_id;
  
  FOR r IN 
    SELECT * FROM (VALUES
      ('RWE Data Analyst', 'rwe-data-analyst-dh',
       'Analyzes real-world datasets including EHR, claims, and registry data to generate insights on digital health product performance', 'entry', 'regional'),
      ('RWE Data Scientist', 'rwe-data-scientist-dh',
       'Designs and executes RWE studies using real-world data to assess digital health product effectiveness and safety outcomes', 'mid', 'regional'),
      ('Epidemiologist', 'epidemiologist-dh',
       'Studies disease patterns and health outcomes in populations to inform RWE study design and evidence generation strategies', 'mid', 'regional'),
      ('Health Economics Analyst', 'health-economics-analyst-dh',
       'Evaluates economic impact of digital health solutions using real-world data for value demonstration and market access', 'mid', 'regional'),
      ('RWE Data Engineer', 'rwe-data-engineer-dh',
       'Manages and processes large real-world datasets, builds data pipelines, and ensures data quality for RWE studies', 'mid', 'regional'),
      ('Senior RWE Data Scientist', 'senior-rwe-data-scientist-dh',
       'Leads complex RWE analyses, develops advanced statistical methods, and mentors junior data scientists', 'senior', 'regional'),
      ('RWE Study Lead', 'rwe-study-lead-dh',
       'Manages end-to-end RWE study execution from protocol development to publication, ensuring methodological rigor', 'senior', 'regional'),
      ('Senior Epidemiologist', 'senior-epidemiologist-dh',
       'Designs observational studies, develops statistical analysis plans, and interprets epidemiological data for strategic decisions', 'senior', 'regional'),
      ('RWE Data Manager', 'rwe-data-manager-dh',
       'Manages RWE data acquisition, curation, and quality assurance to support evidence generation programs', 'senior', 'regional'),
      ('Director of Real-World Evidence', 'director-rwe-dh',
       'Leads RWE strategy and operations, manages study portfolio, and ensures evidence generation supports regulatory and commercial objectives', 'director', 'regional'),
      ('VP of Real-World Evidence', 'vp-rwe-dh',
       'Executive leader responsible for RWE strategy across therapeutic areas, regulatory engagement, and evidence-based value demonstration', 'executive', 'regional')
    ) AS t(name, slug, description, seniority, geo_scope)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM org_roles WHERE slug = r.slug AND tenant_id = v_tenant_id) THEN
      INSERT INTO org_roles (id, tenant_id, function_id, department_id, name, slug, description, seniority_level, geographic_scope, created_at, updated_at)
      VALUES (gen_random_uuid(), v_tenant_id, v_func_id, v_dept_id, r.name, r.slug, r.description, r.seniority::seniority_level_type, r.geo_scope::geographic_scope_type, NOW(), NOW());
      RAISE NOTICE '✅ Created role: %', r.name;
    END IF;
  END LOOP;
END $$;

-- ================================================================
-- SECTION 3: ENRICH ALL DIGITAL HEALTH ROLES WITH DESCRIPTIONS
-- ================================================================

-- Update existing roles with enriched descriptions where missing
UPDATE org_roles SET description = CASE slug
  -- Digital Platforms & Solutions
  WHEN 'chief-technology-officer' THEN 'Executive technology leader responsible for digital health platform architecture, engineering strategy, and technology innovation'
  WHEN 'vp-of-engineering' THEN 'Leads engineering organization, drives technical excellence, and ensures scalable, secure digital health platform development'
  WHEN 'director-of-engineering' THEN 'Directs engineering teams, manages technical roadmap, and ensures delivery of high-quality digital health software'
  WHEN 'senior-software-engineer' THEN 'Designs and implements complex features, mentors engineers, and drives technical decisions for digital health platforms'
  WHEN 'software-engineer' THEN 'Develops and maintains digital health applications, implements features, and ensures code quality and security'
  WHEN 'junior-software-engineer' THEN 'Entry-level engineer learning digital health development practices, contributing to features under senior guidance'
  
  -- Product Management
  WHEN 'chief-product-officer' THEN 'Executive product leader defining digital health product vision, strategy, and roadmap aligned with market needs'
  WHEN 'vp-of-product' THEN 'Leads product organization, drives product strategy, and ensures digital health products meet user and market needs'
  WHEN 'director-of-product-management' THEN 'Directs product managers, owns product portfolio strategy, and ensures successful digital health product launches'
  WHEN 'senior-product-manager' THEN 'Leads complex digital health products from concept to launch, defines requirements, and drives cross-functional execution'
  WHEN 'product-manager' THEN 'Manages digital health product lifecycle, defines features, prioritizes backlog, and works with engineering on delivery'
  WHEN 'associate-product-manager' THEN 'Entry-level PM supporting product development, conducting user research, and learning digital health product management'
  
  -- Data Science & Analytics
  WHEN 'vp-of-ai-ml' THEN 'Executive AI/ML leader responsible for health AI strategy, algorithm development, and AI governance across the organization'
  WHEN 'director-of-machine-learning' THEN 'Directs ML engineering team, oversees model development lifecycle, and ensures AI solutions meet clinical standards'
  WHEN 'senior-ml-engineer' THEN 'Develops and deploys advanced ML models for health applications, ensuring accuracy, fairness, and regulatory compliance'
  WHEN 'ml-engineer' THEN 'Builds and trains ML models for digital health applications including prediction, classification, and NLP'
  WHEN 'ml-research-scientist' THEN 'Conducts ML research, develops novel algorithms, and advances state-of-the-art in health AI applications'
  WHEN 'director-of-data-engineering' THEN 'Leads data engineering team, designs data architecture, and ensures reliable health data pipelines'
  WHEN 'senior-data-engineer' THEN 'Designs and implements scalable data pipelines, ensures data quality, and optimizes health data infrastructure'
  WHEN 'data-engineer' THEN 'Builds and maintains data pipelines, ETL processes, and data infrastructure for digital health analytics'
  WHEN 'data-analyst' THEN 'Analyzes health data to generate insights, creates reports, and supports data-driven decision making'
  
  -- UX/UI Design
  WHEN 'vp-of-design' THEN 'Executive design leader responsible for user experience vision, design system, and ensuring patient-centered digital health interfaces'
  WHEN 'director-of-ux' THEN 'Directs UX team, defines design strategy, and ensures digital health products are intuitive and accessible'
  WHEN 'senior-ux-designer' THEN 'Leads UX design for complex digital health products, conducts user research, and mentors junior designers'
  WHEN 'ux-designer' THEN 'Designs user experiences for digital health applications, creates wireframes, prototypes, and user flows'
  WHEN 'ux-researcher' THEN 'Conducts user research, usability testing, and patient journey mapping to inform digital health product design'
  WHEN 'ui-designer' THEN 'Creates visual designs, UI components, and ensures consistent, accessible interfaces for digital health products'
  
  -- Commercialization & Market Access
  WHEN 'chief-revenue-officer' THEN 'Executive commercial leader responsible for revenue strategy, sales operations, and market growth for digital health solutions'
  WHEN 'vp-of-sales' THEN 'Leads sales organization, drives revenue targets, and builds relationships with health systems and payers'
  WHEN 'director-of-enterprise-sales' THEN 'Directs enterprise sales team, manages key accounts, and drives digital health solution adoption'
  WHEN 'senior-account-executive' THEN 'Manages complex enterprise sales cycles, builds relationships with health system executives, and closes strategic deals'
  WHEN 'account-executive' THEN 'Sells digital health solutions to healthcare organizations, manages sales pipeline, and achieves revenue targets'
  WHEN 'sales-development-representative' THEN 'Generates qualified leads, conducts outreach, and schedules meetings for digital health sales team'
  
  -- Marketing
  WHEN 'chief-marketing-officer' THEN 'Executive marketing leader responsible for brand strategy, demand generation, and market positioning of digital health solutions'
  WHEN 'vp-of-marketing' THEN 'Leads marketing organization, drives brand awareness, and ensures effective go-to-market for digital health products'
  WHEN 'director-of-product-marketing' THEN 'Directs product marketing strategy, positioning, and launch execution for digital health portfolio'
  WHEN 'senior-product-marketing-manager' THEN 'Leads product marketing for key digital health products, develops messaging, and enables sales team'
  WHEN 'product-marketing-manager' THEN 'Develops product positioning, creates marketing content, and supports digital health product launches'
  WHEN 'digital-marketing-manager' THEN 'Manages digital marketing campaigns, SEO/SEM, and online presence for digital health brand'
  WHEN 'content-marketing-manager' THEN 'Creates thought leadership content, case studies, and educational materials for digital health audience'
  WHEN 'marketing-specialist' THEN 'Supports marketing campaigns, creates content, and assists with digital health marketing initiatives'
  
  -- Customer Success
  WHEN 'vp-of-customer-success' THEN 'Executive customer success leader responsible for retention, expansion, and ensuring customers achieve health outcomes'
  WHEN 'director-of-customer-success' THEN 'Directs customer success team, develops retention strategies, and ensures digital health solution adoption'
  WHEN 'senior-customer-success-manager' THEN 'Manages strategic customer relationships, drives adoption, and ensures health outcomes are achieved'
  WHEN 'customer-success-manager' THEN 'Manages customer relationships, drives product adoption, and ensures satisfaction with digital health solutions'
  WHEN 'customer-success-associate' THEN 'Supports customer success activities, handles customer inquiries, and assists with onboarding'
  
  -- Technology & IT Infrastructure
  WHEN 'vp-of-infrastructure' THEN 'Executive infrastructure leader responsible for cloud platforms, security, and operational excellence'
  WHEN 'director-of-devops' THEN 'Directs DevOps team, implements CI/CD, and ensures reliable, scalable digital health platform operations'
  WHEN 'site-reliability-engineer' THEN 'Ensures platform reliability, implements monitoring, and maintains SLAs for digital health applications'
  WHEN 'senior-devops-engineer' THEN 'Leads DevOps practices, implements infrastructure as code, and optimizes deployment pipelines'
  WHEN 'devops-engineer' THEN 'Implements CI/CD pipelines, manages cloud infrastructure, and supports digital health platform operations'
  WHEN 'cloud-engineer' THEN 'Designs and manages cloud infrastructure, implements security controls, and optimizes cloud costs'
  
  -- Security & Compliance
  WHEN 'chief-information-security-officer' THEN 'Executive security leader responsible for cybersecurity strategy, HIPAA compliance, and protecting patient data'
  WHEN 'director-of-information-security' THEN 'Directs security team, implements security controls, and ensures compliance with healthcare regulations'
  WHEN 'senior-security-engineer' THEN 'Designs security architecture, conducts threat assessments, and implements security controls for digital health'
  WHEN 'security-engineer' THEN 'Implements security controls, monitors threats, and ensures secure development practices'
  WHEN 'security-analyst' THEN 'Monitors security events, investigates incidents, and supports security operations for digital health platform'
  
  -- Privacy & Data Protection
  WHEN 'chief-privacy-officer' THEN 'Executive privacy leader responsible for data privacy strategy, HIPAA/GDPR compliance, and patient data protection'
  WHEN 'director-of-data-privacy' THEN 'Directs privacy program, implements privacy controls, and ensures compliance with healthcare data regulations'
  WHEN 'senior-privacy-analyst' THEN 'Leads privacy assessments, develops privacy policies, and ensures data handling meets regulatory requirements'
  WHEN 'privacy-analyst' THEN 'Conducts privacy assessments, supports compliance activities, and monitors data handling practices'
  
  -- Legal
  WHEN 'general-counsel' THEN 'Executive legal leader responsible for legal strategy, corporate governance, and regulatory compliance'
  WHEN 'vp-of-legal' THEN 'Leads legal department, manages legal risk, and provides counsel on digital health regulatory matters'
  WHEN 'director-of-legal' THEN 'Directs legal operations, manages contracts, and ensures compliance with healthcare regulations'
  WHEN 'senior-corporate-counsel' THEN 'Provides legal counsel on complex matters, negotiates agreements, and advises on regulatory compliance'
  WHEN 'corporate-counsel' THEN 'Provides legal support, reviews contracts, and advises on digital health legal matters'
  
  -- People & HR
  WHEN 'vp-of-people' THEN 'Executive HR leader responsible for talent strategy, culture, and building high-performing digital health teams'
  WHEN 'director-of-talent-acquisition' THEN 'Directs recruiting team, develops talent pipeline, and ensures hiring of top digital health talent'
  WHEN 'director-of-people-operations' THEN 'Directs HR operations, implements people programs, and ensures positive employee experience'
  WHEN 'senior-technical-recruiter' THEN 'Recruits senior technical talent, builds candidate pipelines, and partners with hiring managers'
  WHEN 'recruiter' THEN 'Sources and recruits talent for digital health roles, manages candidate experience, and supports hiring process'
  WHEN 'recruiting-coordinator' THEN 'Coordinates interviews, manages scheduling, and supports recruiting operations'
  WHEN 'senior-hr-business-partner' THEN 'Partners with leadership on people strategy, manages employee relations, and drives HR initiatives'
  WHEN 'hr-business-partner' THEN 'Supports business units on HR matters, implements people programs, and advises on employee issues'
  WHEN 'hr-coordinator' THEN 'Supports HR operations, maintains employee records, and assists with HR programs'
  
  -- Finance
  WHEN 'chief-financial-officer' THEN 'Executive financial leader responsible for financial strategy, fundraising, and fiscal management'
  WHEN 'vp-of-finance' THEN 'Leads finance organization, manages financial planning, and ensures sound fiscal management'
  WHEN 'director-of-finance' THEN 'Directs finance operations, manages budgets, and provides financial analysis for decision making'
  WHEN 'controller' THEN 'Oversees accounting operations, ensures financial accuracy, and manages financial reporting'
  WHEN 'senior-financial-analyst' THEN 'Conducts complex financial analysis, builds financial models, and supports strategic planning'
  WHEN 'financial-analyst' THEN 'Analyzes financial data, prepares reports, and supports financial planning activities'
  WHEN 'senior-accountant' THEN 'Manages accounting processes, prepares financial statements, and ensures compliance'
  WHEN 'staff-accountant' THEN 'Performs accounting tasks, maintains records, and supports month-end close'
  
  ELSE description
END
WHERE tenant_id = current_setting('app.seed_tenant_id')::uuid
  AND description IS NULL OR description = '';

-- ================================================================
-- SECTION 4: CREATE DIGITAL HEALTH JTBDs
-- ================================================================

-- First, ensure we have the strategic themes and pillars for Digital Health
INSERT INTO strategic_themes (id, tenant_id, code, name, description, status, start_year, end_year)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  t.code,
  t.name,
  t.description,
  'active',
  2025,
  2030
FROM (VALUES
  ('ST-DH-01', 'Digital Health Innovation', 'Drive healthcare transformation through innovative digital health solutions'),
  ('ST-DH-02', 'Patient-Centered Technology', 'Deliver technology solutions that improve patient outcomes and experience'),
  ('ST-DH-03', 'Evidence-Based Digital Health', 'Generate clinical evidence to demonstrate value and support regulatory approval')
) AS t(code, name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM strategic_themes
  WHERE code = t.code AND tenant_id = current_setting('app.seed_tenant_id')::uuid
);

-- Create strategic pillars for Digital Health
INSERT INTO strategic_pillars (id, tenant_id, theme_id, code, name, description, pillar_status, sequence_order)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  (SELECT id FROM strategic_themes WHERE code = p.theme_code AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1),
  p.code,
  p.name,
  p.description,
  'active',
  p.seq
FROM (VALUES
  ('SP-DH-01', 'Product Innovation & Development', 'Build innovative digital health products that solve real healthcare problems', 'ST-DH-01', 1),
  ('SP-DH-02', 'Clinical Validation & Evidence', 'Generate rigorous clinical evidence to support regulatory approval and market access', 'ST-DH-03', 2),
  ('SP-DH-03', 'Market Access & Commercialization', 'Achieve market access through value demonstration and payer engagement', 'ST-DH-03', 3),
  ('SP-DH-04', 'Patient & Provider Engagement', 'Drive adoption through exceptional user experience and customer success', 'ST-DH-02', 4),
  ('SP-DH-05', 'Technology & Platform Excellence', 'Build secure, scalable, and compliant digital health infrastructure', 'ST-DH-01', 5)
) AS p(code, name, description, theme_code, seq)
WHERE NOT EXISTS (
  SELECT 1 FROM strategic_pillars
  WHERE code = p.code AND tenant_id = current_setting('app.seed_tenant_id')::uuid
);

-- Create Digital Health JTBDs
INSERT INTO jtbd (id, tenant_id, code, name, job_statement, description, jtbd_type, work_pattern, complexity, frequency, strategic_priority, status, functional_area)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  j.code,
  j.name,
  j.statement,
  j.description,
  j.jtype,
  j.pattern,
  j.complexity::complexity_type,
  j.frequency::frequency_type,
  j.priority,
  'active',
  'IT/Digital'::functional_area_type
FROM (VALUES
  -- Product Innovation & Development JTBDs
  ('JTBD-DH-001', 'Define Digital Health Product Strategy',
   'When planning product roadmap, I want to identify unmet healthcare needs and prioritize features, so I can build products that improve patient outcomes',
   'Define digital health product vision, identify market opportunities, and create product roadmaps aligned with healthcare needs',
   'strategic', 'project', 'very_high', 'quarterly', 'critical'),

  ('JTBD-DH-002', 'Design User-Centered Digital Health Experiences',
   'When designing digital health products, I want to understand patient and provider workflows, so I can create intuitive experiences that drive adoption',
   'Conduct user research, create personas, design user flows, and ensure accessibility for diverse patient populations',
   'operational', 'project', 'high', 'weekly', 'critical'),

  ('JTBD-DH-003', 'Develop Secure Health Software',
   'When building digital health applications, I want to follow secure development practices, so I can protect patient data and meet HIPAA requirements',
   'Implement secure coding practices, conduct security reviews, and ensure compliance with healthcare security standards',
   'operational', 'bau', 'high', 'daily', 'critical'),

  ('JTBD-DH-004', 'Integrate with Healthcare Systems',
   'When integrating with EHRs and health systems, I want to implement FHIR/HL7 standards, so I can enable seamless data exchange',
   'Design and implement healthcare interoperability using FHIR, HL7, and other standards for clinical data exchange',
   'operational', 'project', 'very_high', 'weekly', 'high'),

  ('JTBD-DH-005', 'Develop AI/ML Health Algorithms',
   'When developing health AI, I want to ensure clinical validity and fairness, so algorithms improve outcomes without bias',
   'Develop, validate, and deploy AI/ML models for health applications ensuring clinical accuracy and algorithmic fairness',
   'operational', 'project', 'very_high', 'weekly', 'high'),

  -- Clinical Validation & Evidence JTBDs
  ('JTBD-DH-010', 'Design Clinical Validation Studies',
   'When validating digital health products, I want to design rigorous studies, so I can generate evidence for regulatory approval',
   'Design clinical validation studies including endpoints, sample size, and methodology for SaMD/DTx products',
   'strategic', 'project', 'very_high', 'quarterly', 'critical'),

  ('JTBD-DH-011', 'Execute Clinical Validation Protocols',
   'When running validation studies, I want to ensure protocol adherence and data quality, so results support regulatory submissions',
   'Execute clinical validation studies, manage sites, collect data, and ensure GCP compliance',
   'operational', 'project', 'high', 'weekly', 'critical'),

  ('JTBD-DH-012', 'Generate Real-World Evidence',
   'When demonstrating real-world effectiveness, I want to analyze RWD from deployed products, so I can show value to payers and regulators',
   'Design and execute RWE studies using EHR, claims, and product data to demonstrate real-world effectiveness',
   'operational', 'project', 'high', 'monthly', 'critical'),

  ('JTBD-DH-013', 'Prepare Regulatory Submissions',
   'When seeking regulatory approval, I want to compile comprehensive submissions, so products achieve FDA/CE clearance',
   'Prepare 510(k), De Novo, PMA, or CE mark submissions including clinical evidence and technical documentation',
   'operational', 'project', 'very_high', 'quarterly', 'critical'),

  ('JTBD-DH-014', 'Conduct Health Economics Analysis',
   'When demonstrating value, I want to conduct cost-effectiveness analyses, so payers understand ROI of digital health solutions',
   'Develop health economic models, conduct budget impact analyses, and demonstrate value to payers',
   'operational', 'project', 'high', 'quarterly', 'high'),

  -- Market Access & Commercialization JTBDs
  ('JTBD-DH-020', 'Develop Go-to-Market Strategy',
   'When launching digital health products, I want to define target segments and channels, so I can achieve market penetration',
   'Define target markets, develop positioning, create launch plans, and execute go-to-market strategy',
   'strategic', 'project', 'high', 'quarterly', 'critical'),

  ('JTBD-DH-021', 'Engage Health System Buyers',
   'When selling to health systems, I want to demonstrate clinical and economic value, so I can win enterprise contracts',
   'Engage health system executives, conduct value demonstrations, and negotiate enterprise agreements',
   'operational', 'bau', 'high', 'weekly', 'critical'),

  ('JTBD-DH-022', 'Secure Payer Coverage',
   'When seeking reimbursement, I want to engage payers with evidence, so patients can access digital health solutions',
   'Develop payer value propositions, submit coverage dossiers, and negotiate reimbursement agreements',
   'operational', 'project', 'very_high', 'quarterly', 'critical'),

  ('JTBD-DH-023', 'Build Strategic Partnerships',
   'When expanding market reach, I want to identify and develop partnerships, so I can accelerate growth through channels',
   'Identify partnership opportunities, negotiate agreements, and manage strategic relationships with health systems and pharma',
   'strategic', 'project', 'high', 'monthly', 'high'),

  -- Patient & Provider Engagement JTBDs
  ('JTBD-DH-030', 'Drive Product Adoption',
   'When deploying digital health solutions, I want to ensure successful implementation, so customers achieve intended outcomes',
   'Plan and execute implementations, train users, and drive adoption of digital health solutions',
   'operational', 'project', 'high', 'weekly', 'critical'),

  ('JTBD-DH-031', 'Ensure Customer Success',
   'When managing customer relationships, I want to monitor outcomes and drive value, so customers renew and expand',
   'Monitor customer health, drive adoption, identify expansion opportunities, and ensure retention',
   'operational', 'bau', 'medium', 'daily', 'critical'),

  ('JTBD-DH-032', 'Provide Technical Support',
   'When customers need help, I want to resolve issues quickly, so they can continue using digital health solutions effectively',
   'Provide technical support, troubleshoot issues, and ensure customer satisfaction',
   'operational', 'bau', 'medium', 'daily', 'high'),

  ('JTBD-DH-033', 'Gather Patient Feedback',
   'When improving products, I want to collect patient and provider feedback, so I can enhance user experience',
   'Collect user feedback, conduct satisfaction surveys, and translate insights into product improvements',
   'operational', 'bau', 'medium', 'weekly', 'high'),

  -- Technology & Platform Excellence JTBDs
  ('JTBD-DH-040', 'Ensure Platform Security',
   'When protecting patient data, I want to implement security controls, so I can prevent breaches and maintain trust',
   'Implement security controls, conduct penetration testing, and ensure HIPAA compliance',
   'operational', 'bau', 'very_high', 'daily', 'critical'),

  ('JTBD-DH-041', 'Maintain Platform Reliability',
   'When operating digital health platforms, I want to ensure high availability, so patients and providers can always access care',
   'Monitor platform health, respond to incidents, and maintain SLAs for digital health applications',
   'operational', 'bau', 'high', 'daily', 'critical'),

  ('JTBD-DH-042', 'Ensure Data Privacy Compliance',
   'When handling patient data, I want to implement privacy controls, so I can comply with HIPAA and GDPR',
   'Implement privacy controls, conduct privacy assessments, and ensure compliance with healthcare data regulations',
   'operational', 'bau', 'very_high', 'daily', 'critical'),

  ('JTBD-DH-043', 'Scale Platform Infrastructure',
   'When growing user base, I want to scale infrastructure efficiently, so platform performs well under increasing load',
   'Design scalable architecture, optimize cloud resources, and ensure platform can handle growth',
   'operational', 'project', 'high', 'monthly', 'high'),

  ('JTBD-DH-044', 'Implement Quality Management',
   'When ensuring product quality, I want to implement QMS processes, so products meet ISO 13485 and FDA requirements',
   'Implement quality management system, conduct audits, and ensure compliance with medical device regulations',
   'operational', 'bau', 'high', 'weekly', 'critical')
) AS j(code, name, statement, description, jtype, pattern, complexity, frequency, priority)
WHERE NOT EXISTS (
  SELECT 1 FROM jtbd WHERE code = j.code AND tenant_id = current_setting('app.seed_tenant_id')::uuid
);

-- ================================================================
-- SECTION 5: CREATE JTBD-ROLE MAPPINGS FOR DIGITAL HEALTH
-- ================================================================

INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  (SELECT id FROM jtbd WHERE code = m.jtbd_code AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1),
  (SELECT id FROM org_roles WHERE slug = m.role_slug AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1),
  (SELECT name FROM org_roles WHERE slug = m.role_slug AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1),
  m.relevance,
  m.importance,
  m.freq
FROM (VALUES
  -- Product Innovation & Development mappings
  ('JTBD-DH-001', 'chief-product-officer', 0.95, 'critical', 'quarterly'),
  ('JTBD-DH-001', 'vp-of-product', 0.90, 'critical', 'quarterly'),
  ('JTBD-DH-001', 'director-of-product-management', 0.85, 'high', 'quarterly'),
  ('JTBD-DH-002', 'director-of-ux', 0.95, 'critical', 'weekly'),
  ('JTBD-DH-002', 'senior-ux-designer', 0.90, 'critical', 'weekly'),
  ('JTBD-DH-002', 'ux-researcher', 0.85, 'high', 'weekly'),
  ('JTBD-DH-003', 'chief-technology-officer', 0.85, 'high', 'daily'),
  ('JTBD-DH-003', 'senior-software-engineer', 0.95, 'critical', 'daily'),
  ('JTBD-DH-003', 'software-engineer', 0.90, 'critical', 'daily'),
  ('JTBD-DH-004', 'senior-software-engineer', 0.90, 'critical', 'weekly'),
  ('JTBD-DH-004', 'senior-data-engineer', 0.85, 'high', 'weekly'),
  ('JTBD-DH-005', 'director-of-machine-learning', 0.95, 'critical', 'weekly'),
  ('JTBD-DH-005', 'senior-ml-engineer', 0.90, 'critical', 'weekly'),
  ('JTBD-DH-005', 'ml-research-scientist', 0.85, 'high', 'weekly'),

  -- Clinical Validation & Evidence mappings
  ('JTBD-DH-010', 'director-clinical-validation', 0.95, 'critical', 'quarterly'),
  ('JTBD-DH-010', 'clinical-validation-lead', 0.90, 'critical', 'quarterly'),
  ('JTBD-DH-011', 'clinical-validation-specialist', 0.95, 'critical', 'weekly'),
  ('JTBD-DH-011', 'clinical-data-manager-dh', 0.85, 'high', 'weekly'),
  ('JTBD-DH-012', 'director-rwe-dh', 0.95, 'critical', 'monthly'),
  ('JTBD-DH-012', 'rwe-study-lead-dh', 0.90, 'critical', 'monthly'),
  ('JTBD-DH-012', 'rwe-data-scientist-dh', 0.85, 'high', 'monthly'),
  ('JTBD-DH-013', 'director-clinical-validation', 0.90, 'critical', 'quarterly'),
  ('JTBD-DH-013', 'regulatory-affairs-coordinator-dh', 0.85, 'high', 'quarterly'),
  ('JTBD-DH-014', 'health-economics-analyst-dh', 0.95, 'critical', 'quarterly'),
  ('JTBD-DH-014', 'director-rwe-dh', 0.80, 'high', 'quarterly'),

  -- Market Access & Commercialization mappings
  ('JTBD-DH-020', 'chief-marketing-officer', 0.95, 'critical', 'quarterly'),
  ('JTBD-DH-020', 'director-of-product-marketing', 0.90, 'critical', 'quarterly'),
  ('JTBD-DH-021', 'chief-revenue-officer', 0.90, 'critical', 'weekly'),
  ('JTBD-DH-021', 'director-of-enterprise-sales', 0.95, 'critical', 'weekly'),
  ('JTBD-DH-021', 'senior-account-executive', 0.90, 'critical', 'weekly'),
  ('JTBD-DH-022', 'health-economics-analyst-dh', 0.90, 'critical', 'quarterly'),
  ('JTBD-DH-022', 'director-rwe-dh', 0.85, 'high', 'quarterly'),
  ('JTBD-DH-023', 'vp-of-business-development', 0.95, 'critical', 'monthly'),
  ('JTBD-DH-023', 'director-of-business-development', 0.90, 'critical', 'monthly'),

  -- Patient & Provider Engagement mappings
  ('JTBD-DH-030', 'director-of-implementation', 0.95, 'critical', 'weekly'),
  ('JTBD-DH-030', 'senior-implementation-manager', 0.90, 'critical', 'weekly'),
  ('JTBD-DH-031', 'director-of-customer-success', 0.95, 'critical', 'daily'),
  ('JTBD-DH-031', 'senior-customer-success-manager', 0.90, 'critical', 'daily'),
  ('JTBD-DH-032', 'director-of-technical-support', 0.90, 'high', 'daily'),
  ('JTBD-DH-032', 'senior-support-manager', 0.85, 'high', 'daily'),
  ('JTBD-DH-033', 'ux-researcher', 0.90, 'high', 'weekly'),
  ('JTBD-DH-033', 'customer-success-manager', 0.85, 'high', 'weekly'),

  -- Technology & Platform Excellence mappings
  ('JTBD-DH-040', 'chief-information-security-officer', 0.95, 'critical', 'daily'),
  ('JTBD-DH-040', 'director-of-information-security', 0.90, 'critical', 'daily'),
  ('JTBD-DH-040', 'senior-security-engineer', 0.85, 'high', 'daily'),
  ('JTBD-DH-041', 'vp-of-infrastructure', 0.90, 'critical', 'daily'),
  ('JTBD-DH-041', 'site-reliability-engineer', 0.95, 'critical', 'daily'),
  ('JTBD-DH-042', 'chief-privacy-officer', 0.95, 'critical', 'daily'),
  ('JTBD-DH-042', 'director-of-data-privacy', 0.90, 'critical', 'daily'),
  ('JTBD-DH-043', 'chief-technology-officer', 0.85, 'high', 'monthly'),
  ('JTBD-DH-043', 'director-of-devops', 0.90, 'critical', 'monthly'),
  ('JTBD-DH-044', 'qa-manager-clinical-validation', 0.95, 'critical', 'weekly'),
  ('JTBD-DH-044', 'director-clinical-validation', 0.85, 'high', 'weekly')
) AS m(jtbd_code, role_slug, relevance, importance, freq)
WHERE EXISTS (SELECT 1 FROM jtbd WHERE code = m.jtbd_code AND tenant_id = current_setting('app.seed_tenant_id')::uuid)
  AND EXISTS (SELECT 1 FROM org_roles WHERE slug = m.role_slug AND tenant_id = current_setting('app.seed_tenant_id')::uuid)
  AND NOT EXISTS (
    SELECT 1 FROM jtbd_roles jr
    WHERE jr.jtbd_id = (SELECT id FROM jtbd WHERE code = m.jtbd_code AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1)
    AND jr.role_id = (SELECT id FROM org_roles WHERE slug = m.role_slug AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1)
  );

-- ================================================================
-- SECTION 6: LINK DIGITAL HEALTH JTBDs TO STRATEGIC PRIORITIES
-- ================================================================

-- Create strategic priorities from pillars if not exists
INSERT INTO strategic_priorities (id, tenant_id, code, name, description, priority_level, is_active)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  sp.code,
  sp.name,
  sp.description,
  sp.sequence_order,
  true
FROM strategic_pillars sp
WHERE sp.tenant_id = current_setting('app.seed_tenant_id')::uuid
  AND sp.code LIKE 'SP-DH-%'
  AND NOT EXISTS (
    SELECT 1 FROM strategic_priorities
    WHERE code = sp.code AND tenant_id = current_setting('app.seed_tenant_id')::uuid
  );

-- Link Digital Health JTBDs to priorities
UPDATE jtbd SET strategic_priority_id = (
  SELECT id FROM strategic_priorities WHERE code = 'SP-DH-01' AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1
)
WHERE tenant_id = current_setting('app.seed_tenant_id')::uuid
AND code IN ('JTBD-DH-001', 'JTBD-DH-002', 'JTBD-DH-003', 'JTBD-DH-004', 'JTBD-DH-005');

UPDATE jtbd SET strategic_priority_id = (
  SELECT id FROM strategic_priorities WHERE code = 'SP-DH-02' AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1
)
WHERE tenant_id = current_setting('app.seed_tenant_id')::uuid
AND code IN ('JTBD-DH-010', 'JTBD-DH-011', 'JTBD-DH-012', 'JTBD-DH-013', 'JTBD-DH-014');

UPDATE jtbd SET strategic_priority_id = (
  SELECT id FROM strategic_priorities WHERE code = 'SP-DH-03' AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1
)
WHERE tenant_id = current_setting('app.seed_tenant_id')::uuid
AND code IN ('JTBD-DH-020', 'JTBD-DH-021', 'JTBD-DH-022', 'JTBD-DH-023');

UPDATE jtbd SET strategic_priority_id = (
  SELECT id FROM strategic_priorities WHERE code = 'SP-DH-04' AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1
)
WHERE tenant_id = current_setting('app.seed_tenant_id')::uuid
AND code IN ('JTBD-DH-030', 'JTBD-DH-031', 'JTBD-DH-032', 'JTBD-DH-033');

UPDATE jtbd SET strategic_priority_id = (
  SELECT id FROM strategic_priorities WHERE code = 'SP-DH-05' AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1
)
WHERE tenant_id = current_setting('app.seed_tenant_id')::uuid
AND code IN ('JTBD-DH-040', 'JTBD-DH-041', 'JTBD-DH-042', 'JTBD-DH-043', 'JTBD-DH-044');

COMMIT;

-- ================================================================
-- SUMMARY REPORT
-- ================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_dept_count INTEGER;
  v_role_count INTEGER;
  v_dh_role_count INTEGER;
  v_jtbd_count INTEGER;
  v_mapping_count INTEGER;
  v_new_dept_count INTEGER;
  v_new_role_count INTEGER;
BEGIN
  v_tenant_id := 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid;

  SELECT COUNT(*) INTO v_dept_count FROM org_departments WHERE tenant_id = v_tenant_id;
  SELECT COUNT(*) INTO v_role_count FROM org_roles WHERE tenant_id = v_tenant_id;
  SELECT COUNT(*) INTO v_dh_role_count FROM org_roles r
    JOIN org_departments d ON r.department_id = d.id
    JOIN org_functions f ON d.function_id = f.id
    WHERE f.industry = 'Digital Health' AND r.tenant_id = v_tenant_id;
  SELECT COUNT(*) INTO v_jtbd_count FROM jtbd WHERE tenant_id = v_tenant_id AND code LIKE 'JTBD-DH-%';
  SELECT COUNT(*) INTO v_mapping_count FROM jtbd_roles WHERE tenant_id = v_tenant_id;
  SELECT COUNT(*) INTO v_new_dept_count FROM org_departments WHERE slug IN ('clinical-validation-dh', 'real-world-evidence-dh') AND tenant_id = v_tenant_id;
  SELECT COUNT(*) INTO v_new_role_count FROM org_roles WHERE slug LIKE '%-dh' AND tenant_id = v_tenant_id;

  RAISE NOTICE '================================================================';
  RAISE NOTICE 'DIGITAL HEALTH COMPLETE ENRICHMENT v1.0 COMPLETE';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Tenant ID: %', v_tenant_id;
  RAISE NOTICE '';
  RAISE NOTICE 'NEW ADDITIONS:';
  RAISE NOTICE '  - New Departments: % (Clinical Validation, Real-World Evidence)', v_new_dept_count;
  RAISE NOTICE '  - New Roles Added: %', v_new_role_count;
  RAISE NOTICE '';
  RAISE NOTICE 'TOTALS:';
  RAISE NOTICE '  - Total Departments: %', v_dept_count;
  RAISE NOTICE '  - Total Roles: %', v_role_count;
  RAISE NOTICE '  - Digital Health Roles: %', v_dh_role_count;
  RAISE NOTICE '  - Digital Health JTBDs: %', v_jtbd_count;
  RAISE NOTICE '  - JTBD-Role Mappings: %', v_mapping_count;
  RAISE NOTICE '================================================================';
END $$;

