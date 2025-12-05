-- ============================================================================
-- Migration 030: Medical Affairs Agent Skills - Explicit Mapping
-- Date: 2025-12-02
-- Purpose: Explicitly assign technical skills to each MA agent
-- ============================================================================
--
-- Skills vs Capabilities:
--   - Capabilities = Broad competencies (what they CAN do)
--   - Skills = Specific technical proficiencies (HOW they do it)
--
-- ============================================================================

-- ============================================================================
-- PART 1: ENSURE ALL REQUIRED SKILLS EXIST
-- ============================================================================

INSERT INTO skills (name, description, category, skill_type, created_at)
SELECT name, description, category, skill_type, NOW()
FROM (VALUES
  -- Literature Research Skills
  ('PubMed Advanced Search', 'Advanced PubMed query syntax including MeSH terms and Boolean operators', 'research', 'technical'),
  ('Cochrane Library Navigation', 'Navigate and search Cochrane systematic reviews database', 'research', 'technical'),
  ('EMBASE Search', 'Search Elsevier EMBASE database for biomedical literature', 'research', 'technical'),
  ('PRISMA Methodology', 'Apply PRISMA guidelines for systematic reviews', 'research', 'methodological'),
  ('Citation Management', 'Use reference managers (EndNote, Zotero, Mendeley)', 'research', 'technical'),

  -- Safety/Pharmacovigilance Skills
  ('MedDRA Coding v26.1', 'Code adverse events using MedDRA version 26.1 terminology', 'safety', 'technical'),
  ('FAERS Database Query', 'Query FDA Adverse Event Reporting System', 'safety', 'technical'),
  ('WHO-UMC VigiBase', 'Access and analyze WHO global drug safety database', 'safety', 'technical'),
  ('Signal Detection Methods', 'Apply PRR, ROR, BCPNN signal detection algorithms', 'safety', 'analytical'),
  ('CIOMS Form Completion', 'Complete CIOMS forms for expedited reporting', 'safety', 'regulatory'),
  ('E2B(R3) Format', 'Generate ICSR in E2B(R3) XML format', 'safety', 'technical'),
  ('Aggregate Safety Reports', 'Prepare PSUR/PBRER aggregate safety reports', 'safety', 'regulatory'),

  -- HEOR Skills
  ('TreeAge Modeling', 'Build decision trees and Markov models in TreeAge', 'heor', 'technical'),
  ('Excel Cost-Effectiveness', 'Build cost-effectiveness models in Excel', 'heor', 'technical'),
  ('R Statistical Analysis', 'Statistical analysis using R programming', 'heor', 'technical'),
  ('NICE Submission Format', 'Prepare evidence submissions per NICE STA/HST templates', 'heor', 'regulatory'),
  ('ICER Evidence Review', 'Navigate ICER value assessment framework', 'heor', 'regulatory'),
  ('Budget Impact Modeling', 'Build budget impact models for payers', 'heor', 'technical'),
  ('QALY Calculation', 'Calculate quality-adjusted life years', 'heor', 'analytical'),

  -- Medical Writing Skills
  ('ICMJE Guidelines', 'Apply ICMJE authorship and reporting guidelines', 'writing', 'regulatory'),
  ('AMA Style Manual', 'Write using AMA Manual of Style', 'writing', 'technical'),
  ('CSR Writing', 'Write clinical study reports per ICH E3', 'writing', 'regulatory'),
  ('IB Writing', 'Write and update Investigator Brochures', 'writing', 'regulatory'),
  ('Manuscript Submission', 'Navigate journal submission systems (ScholarOne, Editorial Manager)', 'writing', 'technical'),
  ('Poster Design', 'Design scientific posters using PowerPoint/Adobe', 'writing', 'technical'),

  -- Medical Information Skills
  ('Standard Response Library', 'Manage and update standard response libraries', 'medinfo', 'operational'),
  ('Medical Inquiry Triage', 'Triage medical inquiries by complexity and urgency', 'medinfo', 'operational'),
  ('FDA Label Interpretation', 'Interpret FDA drug labeling accurately', 'medinfo', 'regulatory'),
  ('Off-Label Inquiry Handling', 'Handle off-label use inquiries compliantly', 'medinfo', 'regulatory'),

  -- KOL Management Skills
  ('KOL Identification', 'Identify and profile key opinion leaders using databases', 'kol', 'analytical'),
  ('KOL Tiering', 'Tier KOLs based on influence, expertise, and engagement potential', 'kol', 'analytical'),
  ('Advisory Board Planning', 'Plan and execute advisory board meetings', 'kol', 'operational'),
  ('Congress Engagement', 'Plan medical society congress engagement strategies', 'kol', 'strategic'),
  ('Veeva CRM', 'Use Veeva CRM for KOL and MSL activity tracking', 'kol', 'technical'),

  -- MSL Skills
  ('Territory Planning', 'Plan MSL territory coverage and prioritization', 'msl', 'operational'),
  ('Scientific Exchange', 'Conduct compliant scientific exchange with HCPs', 'msl', 'communication'),
  ('Insight Collection', 'Collect and report field medical insights', 'msl', 'analytical'),
  ('Speaker Identification', 'Identify and nominate speaker candidates', 'msl', 'operational'),

  -- Medical Education Skills
  ('CME Accreditation', 'Navigate ACCME/ACPE accreditation requirements', 'meded', 'regulatory'),
  ('Learning Objective Design', 'Design measurable learning objectives', 'meded', 'instructional'),
  ('Assessment Development', 'Develop pre/post assessments for education programs', 'meded', 'instructional'),
  ('Faculty Development', 'Train and certify faculty speakers', 'meded', 'instructional'),

  -- Strategy & Analysis Skills
  ('SWOT Analysis', 'Conduct SWOT analysis for medical strategy', 'strategy', 'analytical'),
  ('Competitive Landscape', 'Map competitive landscape and pipeline analysis', 'strategy', 'analytical'),
  ('Launch Readiness', 'Assess medical launch readiness', 'strategy', 'operational'),
  ('Market Research Analysis', 'Analyze market research data for strategic insights', 'strategy', 'analytical'),

  -- Regulatory Skills
  ('FDA Regulations', 'Navigate FDA pharmaceutical regulations (21 CFR)', 'regulatory', 'regulatory'),
  ('EMA Guidelines', 'Navigate EMA regulatory guidelines', 'regulatory', 'regulatory'),
  ('ICH Guidelines', 'Apply ICH harmonization guidelines', 'regulatory', 'regulatory'),
  ('GCP Compliance', 'Ensure Good Clinical Practice compliance', 'regulatory', 'regulatory'),
  ('Fair Balance Assessment', 'Review promotional materials for fair balance', 'regulatory', 'regulatory'),

  -- Communication Skills
  ('Scientific Presentation', 'Deliver scientific presentations to HCPs', 'communication', 'soft'),
  ('Cross-Functional Collaboration', 'Collaborate effectively with R&D, Commercial, Regulatory', 'communication', 'soft'),
  ('Stakeholder Management', 'Manage internal and external stakeholders', 'communication', 'soft'),
  ('Executive Summary Writing', 'Write concise executive summaries', 'communication', 'soft'),

  -- Technical/Tool Skills
  ('SQL Database Query', 'Write SQL queries for data retrieval', 'technical', 'technical'),
  ('API Integration', 'Connect to REST APIs for data retrieval', 'technical', 'technical'),
  ('JSON/XML Parsing', 'Parse JSON and XML data formats', 'technical', 'technical'),
  ('Data Visualization', 'Create data visualizations (charts, graphs)', 'technical', 'technical')
) AS s(name, description, category, skill_type)
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE skills.name = s.name);

-- ============================================================================
-- PART 2: L1 MASTER SKILLS
-- ============================================================================

-- VP Medical Affairs - Strategic and leadership skills
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 15
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'vp-medical-affairs'
  AND a.status = 'active'
  AND s.name IN (
    'Stakeholder Management',
    'Executive Summary Writing',
    'Cross-Functional Collaboration',
    'Launch Readiness',
    'Competitive Landscape',
    'FDA Regulations',
    'EMA Guidelines'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- ============================================================================
-- PART 3: L2 EXPERT SKILLS
-- ============================================================================

-- Head of MSL Operations
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'head-of-msl'
  AND a.status = 'active'
  AND s.name IN (
    'Territory Planning',
    'Scientific Exchange',
    'Insight Collection',
    'KOL Identification',
    'Veeva CRM',
    'Stakeholder Management',
    'Congress Engagement'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Head of Medical Information
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'head-of-medinfo'
  AND a.status = 'active'
  AND s.name IN (
    'Standard Response Library',
    'Medical Inquiry Triage',
    'FDA Label Interpretation',
    'Off-Label Inquiry Handling',
    'PubMed Advanced Search',
    'Fair Balance Assessment'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Head of Medical Communications
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'head-of-medcomms'
  AND a.status = 'active'
  AND s.name IN (
    'ICMJE Guidelines',
    'AMA Style Manual',
    'Manuscript Submission',
    'Poster Design',
    'PRISMA Methodology',
    'Citation Management'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Head of Pharmacovigilance
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'head-of-safety'
  AND a.status = 'active'
  AND s.name IN (
    'MedDRA Coding v26.1',
    'FAERS Database Query',
    'Signal Detection Methods',
    'CIOMS Form Completion',
    'E2B(R3) Format',
    'Aggregate Safety Reports',
    'ICH Guidelines'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Head of HEOR
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'head-of-heor'
  AND a.status = 'active'
  AND s.name IN (
    'TreeAge Modeling',
    'Excel Cost-Effectiveness',
    'R Statistical Analysis',
    'NICE Submission Format',
    'ICER Evidence Review',
    'Budget Impact Modeling',
    'QALY Calculation'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Head of KOL Management
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'head-of-kol'
  AND a.status = 'active'
  AND s.name IN (
    'KOL Identification',
    'KOL Tiering',
    'Advisory Board Planning',
    'Congress Engagement',
    'Veeva CRM',
    'Stakeholder Management'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Head of Medical Education
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'head-of-meded'
  AND a.status = 'active'
  AND s.name IN (
    'CME Accreditation',
    'Learning Objective Design',
    'Assessment Development',
    'Faculty Development',
    'Scientific Presentation',
    'Fair Balance Assessment'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Head of Medical Strategy
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'head-of-medstrategy'
  AND a.status = 'active'
  AND s.name IN (
    'SWOT Analysis',
    'Competitive Landscape',
    'Launch Readiness',
    'Market Research Analysis',
    'Executive Summary Writing',
    'Cross-Functional Collaboration'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- ============================================================================
-- PART 4: L3 SPECIALIST SKILLS
-- ============================================================================

-- MSL Specialist
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'msl-specialist'
  AND a.status = 'active'
  AND s.name IN (
    'Scientific Exchange',
    'Insight Collection',
    'PubMed Advanced Search',
    'Congress Engagement',
    'Veeva CRM'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Medical Information Scientist
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'medinfo-scientist'
  AND a.status = 'active'
  AND s.name IN (
    'PubMed Advanced Search',
    'Standard Response Library',
    'FDA Label Interpretation',
    'Off-Label Inquiry Handling',
    'Citation Management'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Medical Writer
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'medical-writer'
  AND a.status = 'active'
  AND s.name IN (
    'ICMJE Guidelines',
    'AMA Style Manual',
    'CSR Writing',
    'IB Writing',
    'Manuscript Submission',
    'Poster Design'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Safety Scientist
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'safety-scientist'
  AND a.status = 'active'
  AND s.name IN (
    'MedDRA Coding v26.1',
    'Signal Detection Methods',
    'FAERS Database Query',
    'PubMed Advanced Search',
    'Aggregate Safety Reports'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Health Economist
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'health-economist'
  AND a.status = 'active'
  AND s.name IN (
    'TreeAge Modeling',
    'Excel Cost-Effectiveness',
    'R Statistical Analysis',
    'NICE Submission Format',
    'QALY Calculation'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- KOL Strategist
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'kol-strategist'
  AND a.status = 'active'
  AND s.name IN (
    'KOL Identification',
    'KOL Tiering',
    'Advisory Board Planning',
    'Veeva CRM',
    'Competitive Landscape'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Medical Education Specialist
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'meded-specialist'
  AND a.status = 'active'
  AND s.name IN (
    'CME Accreditation',
    'Learning Objective Design',
    'Assessment Development',
    'PubMed Advanced Search',
    'Scientific Presentation'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Medical Strategy Analyst
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'medstrategy-analyst'
  AND a.status = 'active'
  AND s.name IN (
    'Competitive Landscape',
    'SWOT Analysis',
    'Market Research Analysis',
    'Data Visualization',
    'Executive Summary Writing'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Medical Affairs Generalist
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'medaffairs-generalist'
  AND a.status = 'active'
  AND s.name IN (
    'PubMed Advanced Search',
    'FDA Label Interpretation',
    'Cross-Functional Collaboration',
    'Scientific Presentation'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- ============================================================================
-- PART 5: L4 CONTEXT ENGINEER SKILLS
-- ============================================================================

-- All context engineers get technical skills
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a
CROSS JOIN skills s
WHERE a.slug IN (
    'msl-context-engineer',
    'medinfo-context-engineer',
    'medcomms-context-engineer',
    'safety-context-engineer',
    'heor-context-engineer',
    'kol-context-engineer',
    'meded-context-engineer',
    'medstrategy-context-engineer',
    'generic-context-engineer'
  )
  AND a.status = 'active'
  AND s.name IN (
    'SQL Database Query',
    'API Integration',
    'JSON/XML Parsing',
    'PubMed Advanced Search'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Safety context engineer gets safety-specific skills
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'safety-context-engineer'
  AND a.status = 'active'
  AND s.name IN ('FAERS Database Query', 'WHO-UMC VigiBase')
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- HEOR context engineer gets HEOR-specific skills
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'heor-context-engineer'
  AND a.status = 'active'
  AND s.name IN ('NICE Submission Format', 'ICER Evidence Review', 'Cochrane Library Navigation')
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- ============================================================================
-- PART 6: L4 WORKER SKILLS
-- ============================================================================

-- MSL Activity Coordinator
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'msl-activity-coordinator'
  AND a.status = 'active'
  AND s.name IN ('Veeva CRM', 'Insight Collection', 'Territory Planning')
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Medical Information Specialist (Worker)
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'medical-information-specialist'
  AND a.status = 'active'
  AND s.name IN ('Standard Response Library', 'Medical Inquiry Triage', 'FDA Label Interpretation')
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Publication Coordinator
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'publication-coordinator'
  AND a.status = 'active'
  AND s.name IN ('Manuscript Submission', 'Citation Management', 'ICMJE Guidelines')
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Safety Case Processor
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'safety-case-processor'
  AND a.status = 'active'
  AND s.name IN ('MedDRA Coding v26.1', 'CIOMS Form Completion', 'E2B(R3) Format')
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- HEOR Coordinator
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'heor-coordinator'
  AND a.status = 'active'
  AND s.name IN ('Excel Cost-Effectiveness', 'Data Visualization', 'R Statistical Analysis')
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- KOL Engagement Coordinator
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'kol-engagement-coordinator'
  AND a.status = 'active'
  AND s.name IN ('Veeva CRM', 'KOL Identification', 'Advisory Board Planning')
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- MedEd Coordinator
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'meded-coordinator'
  AND a.status = 'active'
  AND s.name IN ('CME Accreditation', 'Assessment Development', 'Faculty Development')
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Strategy Coordinator
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'strategy-coordinator'
  AND a.status = 'active'
  AND s.name IN ('Competitive Landscape', 'Data Visualization', 'Market Research Analysis')
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- ============================================================================
-- PART 7: L5 TOOL SKILLS
-- ============================================================================

-- All L5 tools get technical integration skills
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 1
FROM agents a
CROSS JOIN skills s
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND a.status = 'active'
  AND s.name IN ('API Integration', 'JSON/XML Parsing')
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- PubMed Search Tool
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 1
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'pubmed-search-tool'
  AND a.status = 'active'
  AND s.name = 'PubMed Advanced Search'
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- FAERS Search Tool
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 1
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'faers-search-tool'
  AND a.status = 'active'
  AND s.name = 'FAERS Database Query'
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- MedDRA Lookup Tool
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 1
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'meddra-lookup-tool'
  AND a.status = 'active'
  AND s.name = 'MedDRA Coding v26.1'
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- NICE Evidence Tool
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 1
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'nice-evidence-tool'
  AND a.status = 'active'
  AND s.name = 'NICE Submission Format'
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- Cochrane Search Tool
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 1
FROM agents a
CROSS JOIN skills s
WHERE a.slug = 'cochrane-search-tool'
  AND a.status = 'active'
  AND s.name = 'Cochrane Library Navigation'
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- ============================================================================
-- PART 8: VERIFICATION
-- ============================================================================

-- Summary by level
SELECT
  al.level_number,
  al.level_name,
  COUNT(DISTINCT a.id) as agents,
  COUNT(DISTINCT asa.id) as skill_links,
  ROUND(COUNT(DISTINCT asa.id)::numeric / NULLIF(COUNT(DISTINCT a.id), 0), 1) as avg_per_agent
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_skill_assignments asa ON asa.agent_id = a.id
WHERE a.function_name = 'Medical Affairs'
  AND a.status = 'active'
GROUP BY al.level_number, al.level_name
ORDER BY al.level_number;

-- Top skills by usage
SELECT
  s.name as skill,
  s.category,
  COUNT(asa.id) as agent_count
FROM skills s
JOIN agent_skill_assignments asa ON asa.skill_id = s.id
JOIN agents a ON asa.agent_id = a.id
WHERE a.function_name = 'Medical Affairs'
  AND a.status = 'active'
GROUP BY s.name, s.category
ORDER BY agent_count DESC
LIMIT 15;

-- Migration summary
SELECT
  'Migration 030: Skills' as migration,
  (SELECT COUNT(*) FROM skills) as total_skills,
  (SELECT COUNT(DISTINCT asa.agent_id)
   FROM agent_skill_assignments asa
   JOIN agents a ON asa.agent_id = a.id
   WHERE a.function_name = 'Medical Affairs' AND a.status = 'active') as ma_agents_with_skills,
  (SELECT COUNT(*)
   FROM agent_skill_assignments asa
   JOIN agents a ON asa.agent_id = a.id
   WHERE a.function_name = 'Medical Affairs' AND a.status = 'active') as total_links;
