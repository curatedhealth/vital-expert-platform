-- ================================================================
-- VITAL Platform Enterprise Ontology Enrichment
-- Medical Affairs, Market Access, Commercial Organization
-- ================================================================
-- Version: 4.8 (Fixed: strategic_priority 'medium' -> 'standard')
-- Date: 2025-11-29
-- JTBDs: 69 total across 4 strategic pillars
-- ================================================================

BEGIN;

-- ================================================================
-- SECTION 0A: ADD tenant_id TO ORG TABLES (Multi-tenant consistency)
-- ================================================================

-- Add tenant_id to org_functions if not exists
ALTER TABLE org_functions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Add tenant_id to org_departments if not exists
ALTER TABLE org_departments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Add tenant_id to org_roles if not exists
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Create indexes for tenant isolation
CREATE INDEX IF NOT EXISTS idx_org_functions_tenant_id ON org_functions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_departments_tenant_id ON org_departments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_tenant_id ON org_roles(tenant_id);

-- ================================================================
-- SECTION 0B: GET TENANT
-- ================================================================

DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Get existing Pharmaceutical tenant (slug = 'pharma')
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharma' LIMIT 1;

  IF v_tenant_id IS NULL THEN
    SELECT id INTO v_tenant_id FROM tenants WHERE name ILIKE '%pharma%' LIMIT 1;
  END IF;

  IF v_tenant_id IS NULL THEN
    INSERT INTO tenants (id, slug, name, status)
    VALUES (gen_random_uuid(), 'pharma', 'Pharmaceutical Company', 'active')
    RETURNING id INTO v_tenant_id;
  END IF;

  PERFORM set_config('app.seed_tenant_id', v_tenant_id::text, false);
  RAISE NOTICE 'Using tenant_id: %', v_tenant_id;
END $$;

-- ================================================================
-- SECTION 1: STRATEGIC THEMES
-- ================================================================

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
  ('ST01', 'Patient-Centric Excellence', 'Drive patient outcomes through evidence-based medicine and stakeholder engagement'),
  ('ST02', 'Digital Transformation', 'Leverage AI, automation, and digital tools to transform Medical Affairs operations'),
  ('ST03', 'Commercial Excellence', 'Support market access and commercial success through value demonstration')
) AS t(code, name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM strategic_themes
  WHERE code = t.code AND tenant_id = current_setting('app.seed_tenant_id')::uuid
);

-- ================================================================
-- SECTION 2: STRATEGIC PILLARS
-- ================================================================

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
  ('SP01', 'Growth & Market Access', 'Drive growth through evidence generation, market access excellence, and lifecycle management', 'ST01', 1),
  ('SP03', 'Stakeholder Engagement', 'Build trusted relationships with KOLs, HCPs, patients, and payers through scientific exchange', 'ST01', 2),
  ('SP05', 'Operational Excellence', 'Optimize Medical Affairs operations, analytics, and resource management', 'ST03', 3),
  ('SP07', 'Innovation & Digital', 'Transform Medical Affairs through AI, automation, and digital therapeutics', 'ST02', 4)
) AS p(code, name, description, theme_code, seq)
WHERE NOT EXISTS (
  SELECT 1 FROM strategic_pillars
  WHERE code = p.code AND tenant_id = current_setting('app.seed_tenant_id')::uuid
);

-- ================================================================
-- SECTION 3: ORGANIZATION FUNCTIONS (now with tenant_id)
-- ================================================================

-- First UPDATE existing records to set tenant_id (slug is globally unique)
UPDATE org_functions SET tenant_id = current_setting('app.seed_tenant_id')::uuid
WHERE slug IN ('medical-affairs', 'market-access', 'commercial', 'regulatory-affairs')
  AND tenant_id IS NULL;

-- Then INSERT only if slug doesn't exist at all
INSERT INTO org_functions (id, tenant_id, slug, name, description)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  f.slug,
  f.name,
  f.description
FROM (VALUES
  ('medical-affairs', 'Medical Affairs', 'Provides scientific and medical expertise to support product lifecycle from development through commercialization'),
  ('market-access', 'Market Access', 'Ensures patients can access therapies through payer engagement, HEOR, and reimbursement strategy'),
  ('commercial', 'Commercial Organization', 'Drives commercial strategy, sales operations, and revenue growth'),
  ('regulatory-affairs', 'Regulatory Affairs', 'Manages regulatory strategy, submissions, and compliance across markets')
) AS f(slug, name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM org_functions WHERE slug = f.slug
);

-- ================================================================
-- SECTION 4: DEPARTMENTS (now with tenant_id)
-- ================================================================

-- First UPDATE existing departments to set tenant_id (slug is globally unique)
UPDATE org_departments SET tenant_id = current_setting('app.seed_tenant_id')::uuid
WHERE slug IN ('field-medical', 'heor-evidence', 'medical-information', 'publications',
               'medical-education', 'medical-operations', 'patient-engagement',
               'medical-leadership', 'medical-strategy', 'market-access-leadership',
               'payer-relations', 'hta-submissions', 'commercial-ops', 'sales', 'regulatory-strategy')
  AND tenant_id IS NULL;

-- Also update function_id for existing departments if NULL
UPDATE org_departments d SET function_id = (SELECT id FROM org_functions WHERE slug = fn.slug LIMIT 1)
FROM (VALUES
  ('field-medical', 'medical-affairs'), ('heor-evidence', 'medical-affairs'), ('medical-information', 'medical-affairs'),
  ('publications', 'medical-affairs'), ('medical-education', 'medical-affairs'), ('medical-operations', 'medical-affairs'),
  ('patient-engagement', 'medical-affairs'), ('medical-leadership', 'medical-affairs'), ('medical-strategy', 'medical-affairs'),
  ('market-access-leadership', 'market-access'), ('payer-relations', 'market-access'), ('hta-submissions', 'market-access'),
  ('commercial-ops', 'commercial'), ('sales', 'commercial'), ('regulatory-strategy', 'regulatory-affairs')
) AS fn(dept_slug, slug)
WHERE d.slug = fn.dept_slug AND d.function_id IS NULL;

-- Then INSERT only if slug doesn't exist at all
INSERT INTO org_departments (id, tenant_id, function_id, slug, name, description)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  (SELECT id FROM org_functions WHERE slug = d.fn_slug LIMIT 1),
  d.slug,
  d.name,
  d.description
FROM (VALUES
  -- Medical Affairs Departments
  ('field-medical', 'medical-affairs', 'Field Medical', 'MSL team providing scientific exchange with HCPs and KOLs'),
  ('heor-evidence', 'medical-affairs', 'HEOR & Evidence', 'Health economics, outcomes research, and evidence generation'),
  ('medical-information', 'medical-affairs', 'Medical Information', 'Medical inquiry response and knowledge management'),
  ('publications', 'medical-affairs', 'Publications', 'Scientific publication planning and execution'),
  ('medical-education', 'medical-affairs', 'Medical Education', 'CME programs and medical education initiatives'),
  ('medical-operations', 'medical-affairs', 'Medical Operations', 'Operations, analytics, and technology'),
  ('patient-engagement', 'medical-affairs', 'Patient Engagement', 'Patient advocacy and support programs'),
  ('medical-leadership', 'medical-affairs', 'Medical Affairs Leadership', 'Strategic leadership and therapeutic area leads'),
  ('medical-strategy', 'medical-affairs', 'Medical Strategy', 'Strategic planning and competitive intelligence'),
  -- Market Access Departments
  ('market-access-leadership', 'market-access', 'Leadership & Strategy', 'Market access strategy and leadership'),
  ('payer-relations', 'market-access', 'Payer Relations', 'Payer engagement and account management'),
  ('hta-submissions', 'market-access', 'HTA & Submissions', 'Health technology assessment and submissions'),
  -- Commercial Departments
  ('commercial-ops', 'commercial', 'Commercial Ops', 'Commercial operations and analytics'),
  ('sales', 'commercial', 'Sales', 'Field sales and key account management'),
  -- Regulatory Departments
  ('regulatory-strategy', 'regulatory-affairs', 'Regulatory Strategy', 'Regulatory strategy and submissions')
) AS d(slug, fn_slug, name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM org_departments WHERE slug = d.slug
);

-- ================================================================
-- SECTION 5: ROLES (now with tenant_id)
-- ================================================================

-- First UPDATE existing roles to set tenant_id (slug is globally unique)
UPDATE org_roles SET tenant_id = current_setting('app.seed_tenant_id')::uuid
WHERE slug IN (
  'vp-medical-affairs', 'medical-director-ta', 'regional-medical-director',
  'msl', 'senior-msl', 'msl-manager', 'regional-msl-director',
  'heor-director', 'heor-specialist', 'heor-analyst', 'rwe-lead', 'epidemiologist',
  'mi-manager', 'mi-specialist',
  'head-publications', 'publication-manager', 'medical-writer',
  'med-education-manager', 'cme-director',
  'ma-ops-director', 'analytics-manager', 'ma-program-manager',
  'patient-advocacy-manager', 'patient-experience-lead', 'psp-manager',
  'medical-strategy-director', 'ci-manager', 'digital-health-lead',
  'vp-market-access', 'market-access-director', 'payer-liaison', 'payer-evidence-lead',
  'commercial-lead', 'chief-regulatory-officer'
) AND tenant_id IS NULL;

-- Then INSERT only if slug doesn't exist at all
INSERT INTO org_roles (id, tenant_id, function_id, department_id, slug, name, description, seniority_level, geographic_scope)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  (SELECT function_id FROM org_departments WHERE slug = r.dept_slug LIMIT 1),
  (SELECT id FROM org_departments WHERE slug = r.dept_slug LIMIT 1),
  r.slug,
  r.name,
  r.description,
  r.seniority::seniority_level_type,
  r.geo_scope::geographic_scope_type
FROM (VALUES
  -- Medical Affairs Leadership (slug, dept_slug, name, description, seniority, geographic_scope)
  ('vp-medical-affairs', 'medical-leadership', 'VP Medical Affairs', 'Executive leader of Medical Affairs function', 'executive', 'global'),
  ('medical-director-ta', 'medical-leadership', 'Medical Director TA Lead', 'Therapeutic area medical leader', 'director', 'global'),
  ('regional-medical-director', 'medical-leadership', 'Regional Medical Director', 'Regional medical affairs leader', 'director', 'regional'),

  -- Field Medical
  ('msl', 'field-medical', 'Medical Science Liaison', 'Field-based scientific exchange with HCPs', 'mid', 'regional'),
  ('senior-msl', 'field-medical', 'Senior MSL', 'Experienced MSL with mentoring responsibilities', 'senior', 'regional'),
  ('msl-manager', 'field-medical', 'MSL Manager', 'Field medical team leader', 'senior', 'regional'),
  ('regional-msl-director', 'field-medical', 'Regional MSL Director', 'Regional field medical director', 'director', 'regional'),

  -- HEOR & Evidence
  ('heor-director', 'heor-evidence', 'HEOR Director', 'Health economics and outcomes research leader', 'director', 'global'),
  ('heor-specialist', 'heor-evidence', 'HEOR Specialist', 'Health economics modeling and analysis', 'mid', 'regional'),
  ('heor-analyst', 'heor-evidence', 'HEOR Analyst', 'Economic model development and analysis', 'entry', 'local'),
  ('rwe-lead', 'heor-evidence', 'RWE Lead', 'Real-world evidence strategy and execution', 'senior', 'global'),
  ('epidemiologist', 'heor-evidence', 'Epidemiologist', 'Disease epidemiology and study design', 'senior', 'global'),

  -- Medical Information
  ('mi-manager', 'medical-information', 'Medical Information Manager', 'Medical information operations leader', 'senior', 'regional'),
  ('mi-specialist', 'medical-information', 'Medical Information Specialist', 'Medical inquiry response specialist', 'mid', 'local'),

  -- Publications
  ('head-publications', 'publications', 'Head of Publications', 'Publications strategy and operations leader', 'director', 'global'),
  ('publication-manager', 'publications', 'Publication Manager', 'Publication project management', 'senior', 'global'),
  ('medical-writer', 'publications', 'Medical Writer', 'Scientific writing and manuscript development', 'mid', 'regional'),

  -- Medical Education
  ('med-education-manager', 'medical-education', 'Medical Education Manager', 'Medical education program management', 'senior', 'regional'),
  ('cme-director', 'medical-education', 'CME Program Director', 'Continuing medical education program director', 'director', 'global'),

  -- Medical Operations
  ('ma-ops-director', 'medical-operations', 'Medical Affairs Operations Director', 'Medical operations and systems leader', 'director', 'global'),
  ('analytics-manager', 'medical-operations', 'Analytics & Insights Manager', 'Medical analytics and reporting', 'senior', 'global'),
  ('ma-program-manager', 'medical-operations', 'Medical Affairs Program Manager', 'Project and program management', 'senior', 'regional'),

  -- Patient Engagement
  ('patient-advocacy-manager', 'patient-engagement', 'Patient Advocacy Manager', 'Patient advocacy engagement', 'senior', 'regional'),
  ('patient-experience-lead', 'patient-engagement', 'Patient Experience Lead', 'Patient experience and insights', 'senior', 'regional'),
  ('psp-manager', 'patient-engagement', 'Patient Support Program Manager', 'Patient support program operations', 'senior', 'regional'),

  -- Medical Strategy
  ('medical-strategy-director', 'medical-strategy', 'Medical Strategy Director', 'Strategic planning and analysis', 'director', 'global'),
  ('ci-manager', 'medical-strategy', 'Competitive Intelligence Manager', 'Competitive intelligence and analysis', 'senior', 'global'),
  ('digital-health-lead', 'medical-strategy', 'Digital Health Strategy Lead', 'Digital innovation and transformation', 'senior', 'global'),

  -- Market Access
  ('vp-market-access', 'market-access-leadership', 'VP Market Access', 'Market access executive leader', 'executive', 'global'),
  ('market-access-director', 'market-access-leadership', 'Market Access Director', 'Market access strategy and operations', 'director', 'regional'),
  ('payer-liaison', 'payer-relations', 'Payer Liaison', 'Payer relationship management', 'mid', 'regional'),
  ('payer-evidence-lead', 'payer-relations', 'Payer Evidence Lead', 'Payer evidence development', 'senior', 'regional'),

  -- Commercial
  ('commercial-lead', 'commercial-ops', 'Commercial Lead', 'Commercial strategy leadership', 'director', 'regional'),

  -- Regulatory
  ('chief-regulatory-officer', 'regulatory-strategy', 'Chief Regulatory Officer', 'Regulatory affairs executive leader', 'executive', 'global')
) AS r(slug, dept_slug, name, description, seniority, geo_scope)
WHERE NOT EXISTS (
  SELECT 1 FROM org_roles WHERE slug = r.slug
);

-- ================================================================
-- SECTION 6: JTBD - SP01 GROWTH & MARKET ACCESS (17 JTBDs)
-- ================================================================

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
  'Medical Affairs'::functional_area_type
FROM (VALUES
  ('JTBD-MA-001', 'Define Medical Affairs Strategy',
   'When preparing annual strategic planning, I want to synthesize evidence gaps, competitive intelligence, and stakeholder insights, so I can define a 3-5 year Medical Affairs roadmap aligned with business objectives',
   'Define 3-5 year medical strategy aligned with business objectives, establish evidence generation roadmap, set organizational priorities and resource allocation',
   'strategic', 'project', 'very_high', 'yearly', 'critical'),

  ('JTBD-MA-002', 'Identify Evidence Gaps',
   'When planning evidence generation, I want to identify and prioritize critical evidence gaps, so I can build a portfolio that supports product lifecycle and market access needs',
   'Identify and close evidence gaps, invest in RWE studies, registries, ISS, drive publications strategy to support product lifecycle',
   'strategic', 'project', 'high', 'quarterly', 'critical'),

  ('JTBD-MA-031', 'Conduct Cost-Effectiveness Analysis',
   'When conducting cost-effectiveness analyses, I want to build economic models comparing treatment options, so payers and HTAs understand value proposition',
   'Develop cost-effectiveness models (Markov, decision tree, DES) comparing treatment options for HTA submissions',
   'operational', 'project', 'very_high', 'quarterly', 'critical'),

  ('JTBD-MA-032', 'Conduct Budget Impact Analysis',
   'When conducting budget impact analyses, I want to forecast costs to health systems, so payers can plan for adoption and formulary decisions',
   'Forecast financial impact of therapy adoption on payer budgets with PMPM calculations',
   'operational', 'project', 'high', 'quarterly', 'high'),

  ('JTBD-MA-040', 'Develop Health Economics Models',
   'When developing health economics models, I want to quantify cost-effectiveness and budget impact, so I can demonstrate value to payers and secure favorable reimbursement',
   'Develop CEA and BIM to support payer value propositions with ICER and PMPM metrics',
   'operational', 'project', 'very_high', 'quarterly', 'critical'),

  ('JTBD-MA-041', 'Engage Payers',
   'When engaging with payers, I want to present evidence, address objections, and negotiate formulary placement, so products achieve favorable access and reimbursement',
   'Direct payer engagement including presentations, negotiations, contracting discussions, and relationship management',
   'operational', 'bau', 'high', 'daily', 'critical'),

  ('JTBD-MA-042', 'Prepare HTA Submissions',
   'When preparing HTA submissions, I want to compile comprehensive dossiers meeting agency requirements, so products achieve positive reimbursement recommendations',
   'HTA submission preparation for NICE, ICER, CADTH, IQWiG, HAS, PBAC including clinical dossier, economic evaluation, and budget impact',
   'operational', 'project', 'very_high', 'quarterly', 'critical'),

  ('JTBD-MA-043', 'Develop Patient Assistance Programs',
   'When developing patient assistance programs, I want to design eligibility criteria and financial models, so patients can access therapy regardless of ability to pay',
   'Patient access program design including eligibility, financial modeling, operational planning, and outcome tracking',
   'operational', 'project', 'high', 'quarterly', 'high'),

  ('JTBD-MA-044', 'Analyze Payer Landscape',
   'When analyzing payer landscape, I want to map policies, identify gaps, and prioritize accounts, so market access strategy is data-driven and targeted',
   'Map payer policies, coverage decisions, and account prioritization for strategic targeting',
   'operational', 'bau', 'high', 'quarterly', 'high'),

  ('JTBD-MA-045', 'Develop Pricing Strategy',
   'When developing pricing and reimbursement strategy, I want to model scenarios and recommend optimal approaches, so we maximize access while achieving revenue targets',
   'Model pricing scenarios, reference pricing, and reimbursement strategies to optimize access and revenue',
   'strategic', 'project', 'very_high', 'quarterly', 'critical'),

  ('JTBD-MA-081', 'Plan Global Product Launch',
   'When developing global launch plans, I want to coordinate evidence readiness, stakeholder engagement, and regional execution, so launches are successful across all markets',
   'Coordinate evidence generation, stakeholder engagement, and regional execution for global product launches',
   'strategic', 'project', 'very_high', 'quarterly', 'critical'),

  ('JTBD-MA-082', 'Manage Product Lifecycle Extensions',
   'When managing lifecycle extensions, I want to identify new indications, formulations, or populations, so we maximize product value over its lifecycle',
   'Identify and develop new indications, formulations, or populations to extend product lifecycle value',
   'strategic', 'project', 'high', 'daily', 'high'),

  ('JTBD-MA-086', 'Manage Rare Disease Portfolio',
   'When managing rare disease portfolios, I want to engage specialized centers, leverage patient registries, and navigate orphan drug pathways, so rare disease patients have access to therapies',
   'Rare disease strategy including specialized center engagement, patient registries, and orphan drug pathways',
   'strategic', 'mixed', 'high', 'daily', 'high'),

  ('JTBD-MA-088', 'Defend Against Biosimilar Competition',
   'When managing biosimilar competition, I want to emphasize evidence, engage KOLs proactively, and support formulary defense, so reference products maintain market share',
   'Competitive defense strategy including evidence differentiation, KOL engagement, and formulary defense',
   'strategic', 'bau', 'high', 'daily', 'high'),

  ('JTBD-MA-089', 'Expand to Emerging Markets',
   'When expanding into emerging markets, I want to assess infrastructure, regulatory pathways, and stakeholder landscape, so Medical Affairs supports successful market entry',
   'Emerging market assessment including infrastructure, regulatory pathways, and stakeholder landscape',
   'strategic', 'project', 'high', 'quarterly', 'high'),

  ('JTBD-MA-112', 'Support Value-Based Care Arrangements',
   'When engaging in value-based arrangements, I want to generate outcomes evidence, support risk-sharing models, and demonstrate value, so products succeed in value-based care environments',
   'Value-based care support including outcomes evidence, risk-sharing models, and value demonstration',
   'operational', 'mixed', 'high', 'daily', 'high'),

  ('JTBD-MA-113', 'Support Population Health Initiatives',
   'When supporting population health initiatives, I want to identify at-risk populations, design interventions, and measure impact, so Medical Affairs contributes to population health improvement',
   'Population health support including at-risk population identification, intervention design, and impact measurement',
   'operational', 'project', 'medium', 'quarterly', 'standard')
) AS j(code, name, statement, description, jtype, pattern, complexity, frequency, priority)
WHERE NOT EXISTS (
  SELECT 1 FROM jtbd WHERE code = j.code
);

-- ================================================================
-- SECTION 7: JTBD - SP03 STAKEHOLDER ENGAGEMENT (16 JTBDs)
-- ================================================================

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
  'Medical Affairs'::functional_area_type
FROM (VALUES
  ('JTBD-MA-010', 'Engage KOLs and HCPs',
   'When engaging with KOLs and HCPs, I want to share balanced clinical evidence and gather field insights, so I can educate stakeholders and inform Medical Affairs strategy',
   'Share clinical trial data, discuss mechanism of action, efficacy/safety, provide comparative data vs. standard of care in non-promotional manner',
   'operational', 'bau', 'medium', 'weekly', 'high'),

  ('JTBD-MA-011', 'Build KOL Relationships',
   'When engaging with KOLs, I want to deliver value through scientific exchange, gather insights, and build trusted relationships, so I can influence clinical practice and advance medical knowledge',
   'Individual KOL engagement interactions including preparation, meeting execution, insight capture, and follow-up',
   'operational', 'bau', 'medium', 'weekly', 'high'),

  ('JTBD-MA-012', 'Document Field Insights',
   'When documenting field insights, I want to capture and synthesize intelligence from KOL interactions, so Medical Affairs and cross-functional teams can make data-driven decisions',
   'Field intelligence gathering, documentation, analysis, and dissemination including clinical practice insights and competitive intelligence',
   'operational', 'bau', 'medium', 'daily', 'high'),

  ('JTBD-MA-014', 'Support Medical Education Programs',
   'When supporting medical education programs, I want to identify educational gaps, connect faculty, and facilitate speaker programs, so HCPs have access to balanced scientific information',
   'Medical education support including gap identification, faculty engagement, and speaker program facilitation',
   'operational', 'bau', 'medium', 'monthly', 'standard'),

  ('JTBD-MA-015', 'Manage Advisory Boards',
   'When managing advisory boards, I want to design the agenda, recruit participants, facilitate discussion, and capture outcomes, so we gain strategic insights to inform medical strategy',
   'Advisory board management including agenda design, participant recruitment, facilitation, and outcome capture',
   'operational', 'project', 'high', 'quarterly', 'high'),

  ('JTBD-MA-017', 'Attend Medical Conferences',
   'When attending medical conferences, I want to engage thought leaders, gather competitive intelligence, and represent the company scientifically, so I maximize the value of congress participation',
   'Conference participation including thought leader engagement, competitive intelligence, and scientific representation',
   'operational', 'project', 'medium', 'quarterly', 'standard'),

  ('JTBD-MA-060', 'Partner with Patient Advocacy Organizations',
   'When partnering with patient advocacy organizations, I want to understand patient needs, collaborate on education, and support advocacy efforts, so patients have voice in medical strategy',
   'Patient advocacy partnerships including needs assessment, education collaboration, and advocacy support',
   'operational', 'bau', 'medium', 'daily', 'high'),

  ('JTBD-MA-061', 'Develop Patient Education Materials',
   'When developing patient education materials, I want to create accessible, balanced content, so patients and caregivers understand their condition and treatment options',
   'Patient education content development with accessible, balanced information for patients and caregivers',
   'operational', 'project', 'medium', 'daily', 'standard'),

  ('JTBD-MA-062', 'Conduct Patient Insights Research',
   'When conducting patient insights research, I want to understand unmet needs, treatment journeys, and preferences, so Medical Affairs strategy is patient-centric',
   'Patient insights research including unmet needs, treatment journeys, and preference assessment',
   'operational', 'project', 'high', 'yearly', 'high'),

  ('JTBD-MA-063', 'Manage Patient Support Programs',
   'When managing patient support programs, I want to provide adherence support, financial assistance navigation, and side effect management, so patients stay on therapy',
   'Patient support programs including adherence support, financial navigation, and side effect management',
   'operational', 'bau', 'medium', 'daily', 'high'),

  ('JTBD-MA-072', 'Develop CME/CE Programs',
   'When developing CME/CE programs, I want to identify educational gaps, develop content, and accredit programs, so HCPs receive unbiased medical education',
   'CME program development including gap identification, content development, and accreditation',
   'operational', 'project', 'high', 'quarterly', 'high'),

  ('JTBD-MA-074', 'Manage Speaker Bureaus',
   'When managing speaker bureaus, I want to train speakers, provide materials, and monitor quality, so speaker programs deliver consistent scientific messages',
   'Speaker bureau management including training, materials provision, and quality monitoring',
   'operational', 'bau', 'medium', 'daily', 'high'),

  ('JTBD-MA-080', 'Map KOL Networks',
   'When mapping KOL networks, I want to identify relationships, influence patterns, and collaboration opportunities, so engagement strategy leverages network effects',
   'KOL network mapping including relationship identification, influence patterns, and collaboration opportunities',
   'operational', 'project', 'high', 'yearly', 'high'),

  ('JTBD-MA-090', 'Convene Scientific Advisory Boards',
   'When convening SABs, I want to define objectives, recruit experts, facilitate discussion, and capture recommendations, so strategic decisions are informed by external expertise',
   'Scientific advisory board planning including objective definition, expert recruitment, facilitation, and recommendation capture',
   'operational', 'project', 'high', 'yearly', 'high'),

  ('JTBD-MA-110', 'Engage on Social Media',
   'When engaging on social media, I want to monitor conversations, share scientific content, and engage HCPs, so Medical Affairs has digital presence while maintaining compliance',
   'Social media engagement including conversation monitoring, content sharing, and HCP engagement with compliance',
   'operational', 'bau', 'high', 'daily', 'standard'),

  ('JTBD-MA-114', 'Advance Health Equity',
   'When advancing health equity, I want to identify disparities, design inclusive studies, and engage underserved communities, so all patients benefit from medical advances',
   'Health equity initiatives including disparity identification, inclusive study design, and underserved community engagement',
   'strategic', 'mixed', 'high', 'daily', 'high')
) AS j(code, name, statement, description, jtype, pattern, complexity, frequency, priority)
WHERE NOT EXISTS (
  SELECT 1 FROM jtbd WHERE code = j.code
);

-- ================================================================
-- SECTION 8: JTBD - SP05 OPERATIONAL EXCELLENCE (21 JTBDs)
-- ================================================================

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
  'Medical Affairs'::functional_area_type
FROM (VALUES
  ('JTBD-MA-004', 'Manage Medical Affairs Budget',
   'When managing Medical Affairs budget, I want to optimize ROI across MSL programs, evidence studies, and publications, so I can demonstrate value and secure continued investment',
   'Optimize ROI on evidence generation, balance MSL headcount, publications, studies; demonstrate Medical Affairs value to business',
   'strategic', 'bau', 'high', 'monthly', 'critical'),

  ('JTBD-MA-023', 'Analyze Inquiry Trends',
   'When analyzing inquiry trends, I want to identify patterns and emerging topics, so Medical Affairs can proactively address information gaps',
   'Medical inquiry trend analysis to identify patterns and emerging information needs',
   'operational', 'bau', 'medium', 'monthly', 'standard'),

  ('JTBD-MA-024', 'Manage Medical Knowledge Base',
   'When managing the knowledge base, I want to curate, update, and organize medical content, so the team has easy access to current, approved information',
   'Medical content curation, organization, and access management for knowledge base',
   'operational', 'bau', 'medium', 'daily', 'high'),

  ('JTBD-MA-051', 'Conduct Competitive Intelligence',
   'When conducting competitive intelligence, I want to track competitor activities, evidence, and strategies, so Medical Affairs can respond strategically',
   'Competitive intelligence tracking including activities, evidence, and strategic analysis',
   'operational', 'bau', 'medium', 'monthly', 'high'),

  ('JTBD-MA-052', 'Evaluate New Therapeutic Areas',
   'When evaluating new therapeutic areas, I want to assess market opportunity, evidence requirements, and strategic fit, so portfolio decisions are evidence-based',
   'Therapeutic area evaluation including market opportunity, evidence requirements, and strategic fit assessment',
   'strategic', 'project', 'high', 'quarterly', 'high'),

  ('JTBD-MA-053', 'Manage Vendor Relationships',
   'When managing vendor relationships, I want to select, contract, and oversee performance, so external partners deliver quality work on time and on budget',
   'Vendor management including selection, contracting, and performance oversight',
   'operational', 'bau', 'medium', 'daily', 'high'),

  ('JTBD-MA-055', 'Develop Analytics Dashboards',
   'When developing reporting and analytics, I want to create dashboards and insights, so leadership can make data-driven decisions',
   'Analytics dashboard development and insights generation for leadership decision-making',
   'operational', 'bau', 'high', 'daily', 'high'),

  ('JTBD-MA-056', 'Manage Projects and Initiatives',
   'When managing projects and initiatives, I want to plan, track, and report on progress, so deliverables are completed on time and on budget',
   'Project management including planning, tracking, and progress reporting',
   'operational', 'bau', 'medium', 'daily', 'high'),

  ('JTBD-MA-067', 'Coordinate Regional Strategy',
   'When coordinating regional Medical Affairs strategy, I want to adapt global plans to local markets, allocate resources, and ensure execution, so regional objectives are achieved',
   'Regional strategy coordination including global-to-local adaptation, resource allocation, and execution oversight',
   'strategic', 'mixed', 'high', 'quarterly', 'high'),

  ('JTBD-MA-069', 'Coordinate Global-Regional Alignment',
   'When coordinating with global and market teams, I want to cascade strategy, share insights, and resolve issues, so there is alignment across geographic levels',
   'Global-regional alignment including strategy cascade, insight sharing, and issue resolution',
   'operational', 'bau', 'medium', 'weekly', 'high'),

  ('JTBD-MA-076', 'Analyze MSL Performance',
   'When analyzing MSL performance, I want to assess productivity, quality, and impact metrics, so we optimize field medical effectiveness',
   'MSL performance analysis including productivity, quality, and impact assessment',
   'operational', 'bau', 'high', 'monthly', 'high'),

  ('JTBD-MA-077', 'Measure Evidence Generation ROI',
   'When measuring evidence generation ROI, I want to track costs, outputs, and business impact, so we demonstrate Medical Affairs value',
   'Evidence ROI measurement including cost tracking, output assessment, and business impact analysis',
   'operational', 'project', 'high', 'quarterly', 'high'),

  ('JTBD-MA-083', 'Manage Co-Promotion Partnerships',
   'When managing co-promotion partnerships, I want to coordinate Medical Affairs activities, share insights, and align on strategy, so partnerships deliver mutual value',
   'Co-promotion partnership management including activity coordination, insight sharing, and strategic alignment',
   'strategic', 'bau', 'high', 'daily', 'high'),

  ('JTBD-MA-085', 'Develop Therapeutic Area Strategy',
   'When developing TA-specific strategies, I want to understand disease landscape, competitive positioning, and stakeholder needs, so Medical Affairs strategy is tailored to TA dynamics',
   'Therapeutic area strategy development including disease landscape, competitive positioning, and stakeholder needs assessment',
   'strategic', 'project', 'very_high', 'yearly', 'critical'),

  ('JTBD-MA-096', 'Manage Scientific Content Libraries',
   'When managing scientific content libraries, I want to organize, version, and enable search, so the right content is accessible when needed',
   'Content library management including organization, versioning, and search enablement',
   'operational', 'bau', 'medium', 'daily', 'standard'),

  ('JTBD-MA-101', 'Scan External Environment',
   'When scanning external environment, I want to identify trends, disruptors, and opportunities, so Medical Affairs strategy anticipates future needs',
   'Environmental scanning including trend identification, disruptor analysis, and opportunity assessment',
   'operational', 'bau', 'high', 'quarterly', 'standard'),

  ('JTBD-MA-102', 'Benchmark Medical Affairs Performance',
   'When benchmarking Medical Affairs performance, I want to compare metrics, identify gaps, and adopt best practices, so we achieve industry-leading performance',
   'Performance benchmarking including metric comparison, gap identification, and best practice adoption',
   'operational', 'project', 'medium', 'yearly', 'standard'),

  ('JTBD-MA-104', 'Advance Sustainability Goals',
   'When advancing sustainability goals, I want to reduce congress travel, digitize materials, and support environmental initiatives, so Medical Affairs contributes to corporate ESG objectives',
   'Sustainability initiatives including travel reduction, material digitization, and ESG support',
   'operational', 'bau', 'low', 'daily', 'low'),

  ('JTBD-MA-108', 'Drive Continuous Improvement',
   'When driving continuous improvement, I want to identify inefficiencies, implement solutions, and measure impact, so Medical Affairs operates at peak efficiency',
   'Continuous improvement including inefficiency identification, solution implementation, and impact measurement',
   'operational', 'bau', 'medium', 'daily', 'high'),

  ('JTBD-MA-119', 'Conduct Scenario Planning',
   'When conducting scenario planning, I want to model different futures, assess implications, and develop contingency plans, so Medical Affairs is prepared for uncertainty',
   'Scenario planning including future modeling, implication assessment, and contingency development',
   'strategic', 'project', 'high', 'yearly', 'standard'),

  ('JTBD-MA-120', 'Lead Medical Affairs Transformation',
   'When leading Medical Affairs transformation, I want to envision future state, design operating model, and lead change, so Medical Affairs evolves to meet future needs',
   'Organizational transformation including vision development, operating model design, technology enablement, and change management',
   'strategic', 'project', 'very_high', 'quarterly', 'critical')
) AS j(code, name, statement, description, jtype, pattern, complexity, frequency, priority)
WHERE NOT EXISTS (
  SELECT 1 FROM jtbd WHERE code = j.code
);

-- ================================================================
-- SECTION 9: JTBD - SP07 INNOVATION & DIGITAL (15 JTBDs)
-- ================================================================

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
  'Medical Affairs'::functional_area_type
FROM (VALUES
  ('JTBD-MA-054', 'Implement New Systems',
   'When implementing new systems and technologies, I want to assess requirements, manage deployment, and drive adoption, so Medical Affairs has modern, effective tools',
   'System implementation including requirements assessment, deployment management, and adoption driving',
   'operational', 'project', 'high', 'quarterly', 'high'),

  ('JTBD-MA-057', 'Evaluate AI/ML Opportunities',
   'When evaluating AI/ML opportunities, I want to assess use cases, pilot solutions, and measure impact, so Medical Affairs leverages cutting-edge technology',
   'AI/ML evaluation including use case assessment, solution piloting, and impact measurement',
   'strategic', 'project', 'high', 'daily', 'high'),

  ('JTBD-MA-058', 'Implement Automation',
   'When implementing automation, I want to identify repetitive tasks, deploy RPA, and optimize workflows, so the team focuses on high-value activities',
   'Automation implementation including task identification, RPA deployment, and workflow optimization',
   'operational', 'project', 'high', 'daily', 'standard'),

  ('JTBD-MA-059', 'Develop Digital Therapeutics Strategy',
   'When developing digital therapeutics strategy, I want to evaluate DTx opportunities, assess evidence needs, and plan go-to-market, so we participate in the digital health transformation',
   'Digital therapeutics strategy including opportunity evaluation, evidence assessment, and go-to-market planning',
   'strategic', 'project', 'high', 'quarterly', 'high'),

  ('JTBD-MA-078', 'Conduct Predictive Analytics',
   'When conducting predictive analytics, I want to forecast trends, model scenarios, and recommend actions, so Medical Affairs is proactive rather than reactive',
   'Predictive analytics including trend forecasting, scenario modeling, and action recommendation',
   'operational', 'bau', 'high', 'quarterly', 'standard'),

  ('JTBD-MA-087', 'Develop Precision Medicine Strategy',
   'When developing precision medicine strategies, I want to integrate biomarkers, companion diagnostics, and genomic data, so treatment is personalized and optimized',
   'Precision medicine strategy including biomarker integration, companion diagnostics, and genomic data utilization',
   'strategic', 'project', 'high', 'quarterly', 'high'),

  ('JTBD-MA-091', 'Generate Digital Therapeutics Evidence',
   'When generating evidence for digital therapeutics, I want to design studies, demonstrate efficacy, and engage regulators, so DTx products achieve market access',
   'DTx evidence generation including study design, efficacy demonstration, and regulatory engagement',
   'operational', 'project', 'high', 'quarterly', 'high'),

  ('JTBD-MA-093', 'Apply Machine Learning',
   'When applying ML to Medical Affairs, I want to identify use cases, develop models, and deploy solutions, so predictive capabilities enhance decision-making',
   'ML application including use case identification, model development, and solution deployment',
   'operational', 'project', 'high', 'daily', 'standard'),

  ('JTBD-MA-094', 'Apply Natural Language Processing',
   'When applying NLP to unstructured data, I want to extract insights from literature, EHR notes, and social media, so Medical Affairs captures broader intelligence',
   'NLP application including insight extraction from literature, EHR notes, and social media',
   'operational', 'project', 'high', 'daily', 'standard'),

  ('JTBD-MA-095', 'Deploy AI Assistants',
   'When deploying AI-powered assistants, I want to automate routine inquiries, provide 24/7 support, and escalate complex cases, so Medical Information is more efficient',
   'AI assistant deployment including inquiry automation, 24/7 support, and complex case escalation',
   'operational', 'project', 'high', 'quarterly', 'standard'),

  ('JTBD-MA-107', 'Foster Innovation',
   'When fostering innovation, I want to solicit ideas, pilot experiments, and scale successes, so Medical Affairs continuously improves and innovates',
   'Innovation management including idea solicitation, experiment piloting, and success scaling',
   'strategic', 'bau', 'medium', 'daily', 'standard'),

  ('JTBD-MA-111', 'Prepare for Emerging Therapies',
   'When preparing for gene therapies, cell therapies, or RNA therapeutics, I want to develop specialized evidence strategies and stakeholder education, so Medical Affairs supports next-generation treatments',
   'Emerging therapy preparation including specialized evidence strategies and stakeholder education for gene, cell, and RNA therapies',
   'strategic', 'project', 'high', 'quarterly', 'high'),

  ('JTBD-MA-115', 'Support Telemedicine Adoption',
   'When supporting telemedicine adoption, I want to generate virtual care evidence, train MSLs on digital engagement, and support HCP transition, so Medical Affairs is effective in hybrid care models',
   'Telemedicine support including virtual care evidence, digital engagement training, and HCP transition support',
   'operational', 'mixed', 'medium', 'daily', 'standard'),

  ('JTBD-MA-116', 'Support Decentralized Trials',
   'When supporting decentralized clinical trials, I want to leverage remote monitoring, digital endpoints, and virtual visits, so trials are more accessible and patient-centric',
   'Decentralized trial support including remote monitoring, digital endpoints, and virtual visit enablement',
   'operational', 'project', 'high', 'quarterly', 'standard'),

  ('JTBD-MA-118', 'Automate Medical Affairs Processes',
   'When automating Medical Affairs processes, I want to identify high-volume repetitive tasks, deploy RPA, and monitor performance, so the team focuses on strategic work',
   'Process automation including task identification, RPA deployment, and performance monitoring',
   'operational', 'project', 'high', 'daily', 'standard')
) AS j(code, name, statement, description, jtype, pattern, complexity, frequency, priority)
WHERE NOT EXISTS (
  SELECT 1 FROM jtbd WHERE code = j.code
);

-- ================================================================
-- SECTION 10: JTBD-ROLE MAPPINGS
-- ================================================================

INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  (SELECT id FROM jtbd WHERE code = m.jtbd_code AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1),
  (SELECT id FROM org_roles WHERE slug = m.role_slug LIMIT 1),
  (SELECT name FROM org_roles WHERE slug = m.role_slug LIMIT 1),
  m.relevance,
  m.importance,
  m.freq
FROM (VALUES
  -- SP01 Growth & Market Access mappings
  ('JTBD-MA-001', 'vp-medical-affairs', 0.95, 'critical', 'yearly'),
  ('JTBD-MA-001', 'medical-director-ta', 0.85, 'high', 'yearly'),
  ('JTBD-MA-002', 'medical-director-ta', 0.90, 'critical', 'quarterly'),
  ('JTBD-MA-002', 'heor-director', 0.85, 'high', 'quarterly'),
  ('JTBD-MA-002', 'heor-specialist', 0.80, 'high', 'quarterly'),
  ('JTBD-MA-031', 'heor-director', 0.95, 'critical', 'quarterly'),
  ('JTBD-MA-031', 'heor-analyst', 0.85, 'high', 'quarterly'),
  ('JTBD-MA-040', 'heor-specialist', 0.95, 'critical', 'quarterly'),
  ('JTBD-MA-040', 'market-access-director', 0.80, 'high', 'quarterly'),
  ('JTBD-MA-041', 'market-access-director', 0.95, 'critical', 'daily'),
  ('JTBD-MA-041', 'payer-liaison', 0.90, 'critical', 'daily'),
  ('JTBD-MA-042', 'heor-director', 0.95, 'critical', 'quarterly'),
  ('JTBD-MA-042', 'market-access-director', 0.85, 'high', 'quarterly'),

  -- SP03 Stakeholder Engagement mappings
  ('JTBD-MA-010', 'msl', 0.95, 'critical', 'weekly'),
  ('JTBD-MA-010', 'senior-msl', 0.95, 'critical', 'weekly'),
  ('JTBD-MA-010', 'regional-medical-director', 0.70, 'medium', 'weekly'),
  ('JTBD-MA-011', 'msl', 0.95, 'critical', 'weekly'),
  ('JTBD-MA-011', 'senior-msl', 0.95, 'critical', 'weekly'),
  ('JTBD-MA-012', 'msl', 0.90, 'high', 'daily'),
  ('JTBD-MA-012', 'msl-manager', 0.80, 'high', 'daily'),
  ('JTBD-MA-015', 'medical-director-ta', 0.90, 'high', 'quarterly'),
  ('JTBD-MA-015', 'senior-msl', 0.80, 'high', 'quarterly'),
  ('JTBD-MA-072', 'med-education-manager', 0.95, 'critical', 'quarterly'),
  ('JTBD-MA-072', 'cme-director', 0.95, 'critical', 'quarterly'),

  -- SP05 Operational Excellence mappings
  ('JTBD-MA-004', 'vp-medical-affairs', 0.95, 'critical', 'monthly'),
  ('JTBD-MA-004', 'ma-ops-director', 0.90, 'critical', 'monthly'),
  ('JTBD-MA-055', 'ma-ops-director', 0.90, 'high', 'daily'),
  ('JTBD-MA-055', 'analytics-manager', 0.95, 'critical', 'daily'),
  ('JTBD-MA-085', 'medical-director-ta', 0.95, 'critical', 'yearly'),
  ('JTBD-MA-120', 'vp-medical-affairs', 0.95, 'critical', 'quarterly'),

  -- SP07 Innovation & Digital mappings
  ('JTBD-MA-057', 'digital-health-lead', 0.95, 'critical', 'daily'),
  ('JTBD-MA-058', 'digital-health-lead', 0.90, 'high', 'daily'),
  ('JTBD-MA-058', 'ma-ops-director', 0.85, 'high', 'daily'),
  ('JTBD-MA-093', 'digital-health-lead', 0.95, 'critical', 'daily'),
  ('JTBD-MA-093', 'analytics-manager', 0.85, 'high', 'daily')
) AS m(jtbd_code, role_slug, relevance, importance, freq)
WHERE EXISTS (SELECT 1 FROM jtbd WHERE code = m.jtbd_code AND tenant_id = current_setting('app.seed_tenant_id')::uuid)
  AND EXISTS (SELECT 1 FROM org_roles WHERE slug = m.role_slug)
  AND NOT EXISTS (
    SELECT 1 FROM jtbd_roles jr
    WHERE jr.jtbd_id = (SELECT id FROM jtbd WHERE code = m.jtbd_code AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1)
    AND jr.role_id = (SELECT id FROM org_roles WHERE slug = m.role_slug LIMIT 1)
  );

-- ================================================================
-- SECTION 11: LINK JTBDs TO STRATEGIC PRIORITIES
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
  AND NOT EXISTS (
    SELECT 1 FROM strategic_priorities
    WHERE code = sp.code AND tenant_id = current_setting('app.seed_tenant_id')::uuid
  );

-- Link SP01 JTBDs
UPDATE jtbd SET strategic_priority_id = (
  SELECT id FROM strategic_priorities WHERE code = 'SP01' AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1
)
WHERE tenant_id = current_setting('app.seed_tenant_id')::uuid
AND code IN ('JTBD-MA-001', 'JTBD-MA-002', 'JTBD-MA-031', 'JTBD-MA-032', 'JTBD-MA-040', 'JTBD-MA-041', 'JTBD-MA-042', 'JTBD-MA-043', 'JTBD-MA-044', 'JTBD-MA-045', 'JTBD-MA-081', 'JTBD-MA-082', 'JTBD-MA-086', 'JTBD-MA-088', 'JTBD-MA-089', 'JTBD-MA-112', 'JTBD-MA-113');

-- Link SP03 JTBDs
UPDATE jtbd SET strategic_priority_id = (
  SELECT id FROM strategic_priorities WHERE code = 'SP03' AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1
)
WHERE tenant_id = current_setting('app.seed_tenant_id')::uuid
AND code IN ('JTBD-MA-010', 'JTBD-MA-011', 'JTBD-MA-012', 'JTBD-MA-014', 'JTBD-MA-015', 'JTBD-MA-017', 'JTBD-MA-060', 'JTBD-MA-061', 'JTBD-MA-062', 'JTBD-MA-063', 'JTBD-MA-072', 'JTBD-MA-074', 'JTBD-MA-080', 'JTBD-MA-090', 'JTBD-MA-110', 'JTBD-MA-114');

-- Link SP05 JTBDs
UPDATE jtbd SET strategic_priority_id = (
  SELECT id FROM strategic_priorities WHERE code = 'SP05' AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1
)
WHERE tenant_id = current_setting('app.seed_tenant_id')::uuid
AND code IN ('JTBD-MA-004', 'JTBD-MA-023', 'JTBD-MA-024', 'JTBD-MA-051', 'JTBD-MA-052', 'JTBD-MA-053', 'JTBD-MA-055', 'JTBD-MA-056', 'JTBD-MA-067', 'JTBD-MA-069', 'JTBD-MA-076', 'JTBD-MA-077', 'JTBD-MA-083', 'JTBD-MA-085', 'JTBD-MA-096', 'JTBD-MA-101', 'JTBD-MA-102', 'JTBD-MA-104', 'JTBD-MA-108', 'JTBD-MA-119', 'JTBD-MA-120');

-- Link SP07 JTBDs
UPDATE jtbd SET strategic_priority_id = (
  SELECT id FROM strategic_priorities WHERE code = 'SP07' AND tenant_id = current_setting('app.seed_tenant_id')::uuid LIMIT 1
)
WHERE tenant_id = current_setting('app.seed_tenant_id')::uuid
AND code IN ('JTBD-MA-054', 'JTBD-MA-057', 'JTBD-MA-058', 'JTBD-MA-059', 'JTBD-MA-078', 'JTBD-MA-087', 'JTBD-MA-091', 'JTBD-MA-093', 'JTBD-MA-094', 'JTBD-MA-095', 'JTBD-MA-107', 'JTBD-MA-111', 'JTBD-MA-115', 'JTBD-MA-116', 'JTBD-MA-118');

COMMIT;

-- ================================================================
-- SUMMARY REPORT
-- ================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_jtbd_count INTEGER;
  v_role_count INTEGER;
  v_mapping_count INTEGER;
  v_theme_count INTEGER;
  v_pillar_count INTEGER;
  v_function_count INTEGER;
  v_dept_count INTEGER;
BEGIN
  SELECT current_setting('app.seed_tenant_id')::uuid INTO v_tenant_id;

  SELECT COUNT(*) INTO v_theme_count FROM strategic_themes WHERE tenant_id = v_tenant_id;
  SELECT COUNT(*) INTO v_pillar_count FROM strategic_pillars WHERE tenant_id = v_tenant_id;
  SELECT COUNT(*) INTO v_function_count FROM org_functions WHERE tenant_id = v_tenant_id;
  SELECT COUNT(*) INTO v_dept_count FROM org_departments WHERE tenant_id = v_tenant_id;
  SELECT COUNT(*) INTO v_role_count FROM org_roles WHERE tenant_id = v_tenant_id;
  SELECT COUNT(*) INTO v_jtbd_count FROM jtbd WHERE tenant_id = v_tenant_id AND code LIKE 'JTBD-MA-%';
  SELECT COUNT(*) INTO v_mapping_count FROM jtbd_roles WHERE tenant_id = v_tenant_id;

  RAISE NOTICE '================================================================';
  RAISE NOTICE 'ENTERPRISE ONTOLOGY ENRICHMENT v4.8 COMPLETE';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Tenant ID: %', v_tenant_id;
  RAISE NOTICE 'Strategic Themes: %', v_theme_count;
  RAISE NOTICE 'Strategic Pillars: %', v_pillar_count;
  RAISE NOTICE 'Organization Functions: %', v_function_count;
  RAISE NOTICE 'Departments: %', v_dept_count;
  RAISE NOTICE 'Roles: %', v_role_count;
  RAISE NOTICE 'JTBDs Created: %', v_jtbd_count;
  RAISE NOTICE 'JTBD-Role Mappings: %', v_mapping_count;
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'HIERARCHY: Theme -> Pillar -> Priority -> JTBD -> OKR -> ODI';
  RAISE NOTICE '================================================================';
END $$;
