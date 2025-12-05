-- ============================================================================
-- Migration: Medical Affairs Comprehensive Prompt Starters Matrix
-- Date: 2025-12-02
-- Purpose: Create prompt starters across 2 dimensions:
--   1. LEVEL (L1-L5): capabilities, skills, scope
--   2. DEPARTMENT/ROLE: context, responsibilities, capabilities
-- ============================================================================

-- ============================================================================
-- MATRIX OVERVIEW
-- ============================================================================
--
-- Departments (9):
--   1. Executive Leadership (CMO, VP)
--   2. MSL Operations
--   3. Medical Communications
--   4. Medical Information
--   5. Medical Education
--   6. HEOR (Health Economics)
--   7. Pharmacovigilance/Safety
--   8. Medical Strategy
--   9. KOL Management
--
-- Levels (5):
--   L1: Head of Function (VP/Chief) - Strategic, 150-300 chars
--   L2: Head of Department (Director) - Tactical, 120-200 chars
--   L3: Specialist (Manager) - Expert, 80-150 chars
--   L4: Worker (Entry) - Process, 60-100 chars
--   L5: Tool (Utility) - Function, 50-100 chars
--
-- Total Matrix: 9 departments × 5 levels = 45 agent types
-- ============================================================================

-- ============================================================================
-- PART 1: MSL OPERATIONS DEPARTMENT
-- ============================================================================

-- L2: Head of MSL Operations
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Territory & Deployment
  ('Design Q1 2025 MSL territory realignment optimizing coverage of 150 Tier 1 KOLs across oncology, immunology, and rare disease therapeutic areas', '🗺️', 'territory', 1),
  ('Develop MSL staffing model for 3 upcoming launches balancing therapeutic area expertise, geographic coverage, and budget constraints', '👥', 'staffing', 2),
  -- Performance & Training
  ('Build MSL competency assessment framework measuring scientific acumen, communication skills, and business impact across 45-person field team', '📊', 'performance', 3),
  ('Create MSL onboarding and certification program ensuring launch readiness within 90 days of hire for complex biologic products', '📚', 'training', 4),
  -- KOL Strategy
  ('Develop tiered KOL engagement strategy for 200 thought leaders defining touchpoint frequency, content customization, and scientific exchange protocols', '🎯', 'kol', 5),
  ('Coordinate congress coverage strategy for ASCO, ESMO, and ASH optimizing MSL presence, KOL meetings, and competitive intelligence gathering', '🌐', 'congress', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND a.department_name ILIKE '%MSL%'
  AND al.level_number = 2
;

-- L3: MSL Specialist (Field MSL)
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Scientific Exchange
  ('Prepare scientific exchange presentation on Asset B Phase 3 efficacy data for Dr. Smith at Memorial Sloan Kettering including subgroup analyses', '🔬', 'exchange', 1),
  ('Develop territory engagement plan for Q1 covering 25 HCPs with customized content based on their research interests and prescribing patterns', '📋', 'planning', 2),
  -- KOL Engagement
  ('Create KOL profile analysis for Dr. Johnson including publication history, trial participation, congress presence, and engagement opportunities', '👤', 'kol', 3),
  ('Prepare advisory board discussion guide for 8 thought leaders on real-world evidence study design in PD-1 refractory NSCLC', '💬', 'advisory', 4),
  -- Insights & Reporting
  ('Document scientific insights from ESMO 2024 including competitive intelligence, emerging data, and KOL sentiment on treatment algorithms', '📝', 'insights', 5),
  ('Analyze territory performance metrics identifying engagement gaps, high-value HCP opportunities, and resource allocation improvements', '📊', 'analysis', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND (a.display_name ILIKE '%MSL%' OR a.display_name ILIKE '%Medical Science Liaison%')
  AND al.level_number = 3
;

-- ============================================================================
-- PART 2: MEDICAL COMMUNICATIONS DEPARTMENT
-- ============================================================================

-- L2: Head of Medical Communications
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Publication Strategy
  ('Develop 3-year publication strategy for Asset C establishing scientific leadership across efficacy, safety, patient outcomes, and real-world evidence', '📚', 'strategy', 1),
  ('Build publication metrics dashboard tracking time-to-publication, acceptance rates, impact factors, citations, and competitive positioning', '📊', 'metrics', 2),
  -- Congress Planning
  ('Design congress strategy for 2025 major meetings (ASCO, ESMO, AAD) including abstract submissions, symposia, posters, and KOL presentations', '🎪', 'congress', 3),
  ('Coordinate 15 manuscript submissions across 5 therapeutic areas managing author timelines, journal selection, and editorial processes', '📝', 'coordination', 4),
  -- Team Management
  ('Scale medical writing capacity for 3 upcoming launches evaluating in-house expansion vs. agency partnerships vs. hybrid model', '👥', 'capacity', 5),
  ('Develop medical communications quality framework ensuring scientific accuracy, regulatory compliance, and brand consistency', '✅', 'quality', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND (a.department_name ILIKE '%Communication%' OR a.department_name ILIKE '%Publication%')
  AND al.level_number = 2
;

-- L3: Medical Writer Specialist
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Manuscript Writing
  ('Draft clinical study report (CSR) for Phase 2b study following ICH E3 guidelines including efficacy, safety, and statistical analyses', '📄', 'csr', 1),
  ('Write primary manuscript for NEJM submission presenting Asset B pivotal trial results with 24-month follow-up data', '📝', 'manuscript', 2),
  -- Regulatory Writing
  ('Prepare Investigator Brochure update incorporating new safety data from ongoing Phase 3 studies and post-marketing experience', '📋', 'regulatory', 3),
  ('Draft FDA Briefing Document for Type B meeting addressing CMC questions and proposed labeling changes', '🏛️', 'fda', 4),
  -- Congress Materials
  ('Create ASCO abstract summarizing Asset C subgroup analysis in biomarker-positive population with forest plot visualizations', '📊', 'congress', 5),
  ('Develop poster presentation for ESMO highlighting real-world effectiveness data from European registry study', '🖼️', 'poster', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND (a.display_name ILIKE '%Writer%' OR a.display_name ILIKE '%Publication%')
  AND al.level_number = 3
;

-- L4: Medical Communications Coordinator
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  ('Enter Asset B ASCO abstract into submission portal following SOP 4.2 by deadline Dec 3', '📥', 'submission', 1),
  ('Track 12 active manuscripts in publication tracker updating status, deadlines, and author assignments', '📋', 'tracking', 2),
  ('Process author conflict of interest forms for Q1 advisory board ensuring ICMJE compliance', '📝', 'compliance', 3),
  ('Generate monthly publication metrics report for leadership review meeting', '📊', 'reporting', 4)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND al.level_number = 4
  AND (a.display_name ILIKE '%Coordinator%' OR a.display_name ILIKE '%Assistant%')
;

-- ============================================================================
-- PART 3: MEDICAL INFORMATION DEPARTMENT
-- ============================================================================

-- L2: Head of Medical Information
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Capacity & Operations
  ('Scale Medical Information team to handle 40% inquiry volume increase post-launch while maintaining 2.5 business day response SLA', '📈', 'capacity', 1),
  ('Implement AI-assisted response drafting to improve efficiency by 30% while maintaining PharmD clinical review quality standards', '🤖', 'innovation', 2),
  -- Quality & Compliance
  ('Build inquiry quality assurance program with audit sampling, accuracy metrics, and continuous improvement feedback loops', '✅', 'quality', 3),
  ('Develop global Medical Information harmonization ensuring consistent scientific messaging across US, EU, and APAC regions', '🌍', 'global', 4),
  -- Analytics & Insights
  ('Create inquiry analytics dashboard identifying trending clinical questions, emerging safety signals, and competitive intelligence', '📊', 'analytics', 5),
  ('Design Medical Information contribution metrics demonstrating value to MSL insights, safety surveillance, and market intelligence', '📋', 'metrics', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND a.department_name ILIKE '%Information%'
  AND al.level_number = 2
;

-- L3: Medical Information Scientist
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Response Development
  ('Develop comprehensive response document for off-label use inquiries citing clinical evidence, FDA label limitations, and safety considerations', '📄', 'response', 1),
  ('Create response template library for Asset B covering 75 anticipated inquiry categories with FDA label citations', '📚', 'templates', 2),
  -- Clinical Review
  ('Analyze inquiry trends identifying top 10 clinical questions from HCPs with evidence gap assessment and publication opportunities', '🔍', 'analysis', 3),
  ('Review and validate AI-generated response drafts ensuring clinical accuracy, appropriate evidence citation, and regulatory compliance', '✅', 'review', 4),
  -- Knowledge Management
  ('Build Medical Information knowledge base for new indication integrating label, clinical data, and competitive positioning', '📋', 'knowledge', 5),
  ('Conduct quarterly inquiry audit assessing response accuracy, timeliness, and HCP satisfaction metrics', '📊', 'audit', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND (a.display_name ILIKE '%Information%' AND a.display_name NOT ILIKE '%Head%')
  AND al.level_number = 3
;

-- L4: Medical Information Specialist (Entry)
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  ('Draft response to HCP inquiry #MI-2024-1847 using FDA label Section 8.6 per SOP 2.3', '📝', 'response', 1),
  ('Log 15 incoming medical information requests in Veeva Vault using standard intake template', '📥', 'logging', 2),
  ('Process batch of unsolicited inquiries triaging by urgency and routing to appropriate responders', '⚡', 'triage', 3),
  ('Update response template with new safety information from recent label update', '🔄', 'update', 4)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND al.level_number = 4
  AND a.display_name ILIKE '%Information%Specialist%'
;

-- ============================================================================
-- PART 4: MEDICAL EDUCATION DEPARTMENT
-- ============================================================================

-- L2: Head of Medical Education
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Strategy & Planning
  ('Develop annual CME strategy for oncology portfolio addressing knowledge gaps, practice change objectives, and HCP learning preferences', '📚', 'strategy', 1),
  ('Design multi-channel medical education program reaching 5,000 oncologists through live symposia, digital modules, and peer-to-peer learning', '🎯', 'program', 2),
  -- Faculty & Partnerships
  ('Build speaker training program certifying 50 KOLs on scientific platform messaging, presentation skills, and compliance requirements', '👥', 'faculty', 3),
  ('Establish medical education partnerships with 10 professional societies and academic institutions for co-branded programming', '🤝', 'partnerships', 4),
  -- Outcomes & Impact
  ('Create medical education outcomes framework measuring knowledge gain, competence improvement, and practice change at 6-month intervals', '📊', 'outcomes', 5),
  ('Develop digital education strategy leveraging podcasts, webinars, and mobile learning to extend reach and reduce cost-per-learner', '📱', 'digital', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND (a.department_name ILIKE '%Education%' OR a.display_name ILIKE '%Education%Director%')
  AND al.level_number = 2
;

-- L3: Medical Education Manager
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Program Development
  ('Design CME-accredited symposium for ASCO satellite meeting on biomarker-driven treatment selection in advanced NSCLC', '🎪', 'symposium', 1),
  ('Create case-based learning module on managing immune-related adverse events for community oncologists', '📋', 'module', 2),
  -- Content Creation
  ('Develop slide deck for speaker bureau presentation on Asset B mechanism of action and clinical efficacy data', '📊', 'content', 3),
  ('Build interactive patient case series demonstrating optimal treatment sequencing in first-line metastatic disease', '🔬', 'cases', 4),
  -- Evaluation
  ('Design pre/post assessment measuring knowledge gain and intended practice change for upcoming webinar series', '📝', 'assessment', 5),
  ('Analyze Q3 medical education program performance identifying top-performing content and optimization opportunities', '📈', 'analysis', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND a.display_name ILIKE '%Education%'
  AND al.level_number = 3
;

-- ============================================================================
-- PART 5: HEOR DEPARTMENT (Health Economics & Outcomes Research)
-- ============================================================================

-- L2: Head of HEOR
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Strategy & Evidence Generation
  ('Develop HEOR evidence generation strategy for Asset C supporting HTA submissions in 15 markets within 18 months of approval', '📊', 'strategy', 1),
  ('Design global value dossier framework demonstrating clinical, economic, and humanistic value across payer archetypes', '💰', 'value', 2),
  -- HTA & Market Access
  ('Build HTA submission toolkit for NICE, G-BA, and HAS including cost-effectiveness models, budget impact analyses, and clinical positioning', '🏛️', 'hta', 3),
  ('Coordinate real-world evidence program generating 5 publications supporting payer negotiations and label expansion', '📚', 'rwe', 4),
  -- Analytics & Modeling
  ('Develop health economic model library including Markov models, decision trees, and budget impact calculators for 3 indications', '🔢', 'modeling', 5),
  ('Create HEOR contribution metrics demonstrating impact on pricing decisions, formulary access, and reimbursement outcomes', '📈', 'metrics', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND (a.department_name ILIKE '%HEOR%' OR a.department_name ILIKE '%Health Economic%' OR a.display_name ILIKE '%HEOR%')
  AND al.level_number = 2
;

-- L3: Health Economist / Outcomes Researcher
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Economic Modeling
  ('Build cost-effectiveness model for Asset B vs. standard of care using Phase 3 clinical data and published utilities', '🔢', 'model', 1),
  ('Develop budget impact model for large integrated health system evaluating 5-year financial implications of formulary addition', '💰', 'budget', 2),
  -- Evidence Synthesis
  ('Conduct systematic literature review and network meta-analysis comparing efficacy of 5 therapies in first-line NSCLC', '📚', 'slr', 3),
  ('Analyze SEER-Medicare database to characterize real-world treatment patterns and outcomes in elderly lung cancer patients', '📊', 'rwe', 4),
  -- PRO & QoL
  ('Design patient-reported outcomes study measuring health-related quality of life impact of Asset C in Phase 4 setting', '❤️', 'pro', 5),
  ('Validate disease-specific PRO instrument for use in upcoming pivotal trials and real-world studies', '✅', 'validation', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND (a.display_name ILIKE '%Economist%' OR a.display_name ILIKE '%Outcomes%' OR a.display_name ILIKE '%HEOR%')
  AND al.level_number = 3
;

-- ============================================================================
-- PART 6: PHARMACOVIGILANCE / SAFETY DEPARTMENT
-- ============================================================================

-- L2: Head of Safety / Pharmacovigilance
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Signal Management
  ('Develop signal management strategy integrating spontaneous reports, clinical trial data, and literature surveillance for oncology portfolio', '⚠️', 'signal', 1),
  ('Build risk management plan (RMP) for Asset B addressing identified and potential risks with pharmacovigilance activities and risk minimization', '📋', 'rmp', 2),
  -- Regulatory & Compliance
  ('Coordinate global safety reporting ensuring ICSR submission compliance across 45 markets with varying regulatory requirements', '🌍', 'compliance', 3),
  ('Design benefit-risk framework for Safety Management Team evaluating emerging signals against therapeutic benefits', '⚖️', 'benefit-risk', 4),
  -- Operations & Quality
  ('Scale pharmacovigilance operations to support 3 upcoming launches while maintaining case processing SLAs and audit readiness', '📈', 'operations', 5),
  ('Implement AI-assisted case processing to improve efficiency and enable proactive signal detection from unstructured data', '🤖', 'innovation', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND (a.department_name ILIKE '%Safety%' OR a.department_name ILIKE '%Pharmacovigilance%' OR a.display_name ILIKE '%Safety%')
  AND al.level_number = 2
;

-- L3: Safety Scientist / Signal Analyst
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Signal Evaluation
  ('Evaluate potential hepatotoxicity signal using disproportionality analysis, case series review, and literature assessment', '🔍', 'signal', 1),
  ('Conduct cumulative safety review for Asset A integrating clinical trial data, post-marketing reports, and registry findings', '📊', 'review', 2),
  -- Aggregate Reporting
  ('Prepare PSUR/PBRER for Asset B covering 18-month reporting period with updated benefit-risk assessment', '📄', 'psur', 3),
  ('Draft safety section for Clinical Study Report summarizing adverse events, SAEs, and treatment discontinuations', '📝', 'csr', 4),
  -- Risk Assessment
  ('Analyze drug-drug interaction signal identified from FAERS database evaluating clinical significance and labeling implications', '⚠️', 'ddi', 5),
  ('Develop risk communication strategy for healthcare professionals following safety labeling update', '📢', 'communication', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND (a.display_name ILIKE '%Safety%' OR a.display_name ILIKE '%Signal%' OR a.display_name ILIKE '%Pharmacovigilance%')
  AND al.level_number = 3
;

-- L4: Safety Case Processor
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  ('Process batch of 25 incoming adverse event reports coding with MedDRA and assessing causality per SOP', '📥', 'processing', 1),
  ('Complete 15-day expedited ICSR submission for serious unexpected adverse reaction to FDA and EMA', '⚡', 'expedited', 2),
  ('Perform quality check on 50 case narratives ensuring completeness, accuracy, and regulatory compliance', '✅', 'qc', 3),
  ('Generate weekly case processing metrics report showing volumes, turnaround times, and backlog status', '📊', 'reporting', 4)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND al.level_number = 4
  AND (a.display_name ILIKE '%Case%' OR a.display_name ILIKE '%Safety%Specialist%')
;

-- ============================================================================
-- PART 7: MEDICAL STRATEGY DEPARTMENT
-- ============================================================================

-- L2: Head of Medical Strategy
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Strategic Planning
  ('Develop integrated evidence strategy for Asset C aligning clinical development, medical affairs, and commercial evidence needs pre-launch', '🎯', 'strategy', 1),
  ('Build competitive intelligence framework monitoring 5 competitors scientific activities, publications, and congress presence', '🔍', 'competitive', 2),
  -- Launch Excellence
  ('Design medical affairs launch excellence playbook ensuring cross-functional alignment on scientific platform, MSL deployment, and KOL engagement', '🚀', 'launch', 3),
  ('Create medical affairs contribution scorecard demonstrating quantifiable impact on launch success and market performance', '📊', 'metrics', 4),
  -- Cross-Functional Alignment
  ('Facilitate evidence gap analysis workshop with R&D, Commercial, and Market Access to prioritize Phase 4 studies', '🤝', 'alignment', 5),
  ('Develop medical affairs 3-year strategic roadmap aligned with corporate growth objectives and portfolio evolution', '📋', 'roadmap', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND (a.department_name ILIKE '%Strategy%' OR a.display_name ILIKE '%Strategy%')
  AND al.level_number = 2
;

-- L3: Medical Strategy Manager
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Strategic Analysis
  ('Conduct landscape analysis for Asset B indication expansion identifying unmet needs, competitive positioning, and evidence requirements', '🔍', 'analysis', 1),
  ('Develop scientific platform for Asset C differentiating efficacy, safety, and patient experience from competitors', '💡', 'platform', 2),
  -- Planning & Coordination
  ('Create medical affairs tactical plan for Asset B year 2 post-launch including publications, KOL activities, and MSL priorities', '📋', 'tactical', 3),
  ('Build competitive response toolkit for anticipated competitor approval with scientific messaging and MSL talking points', '⚔️', 'competitive', 4),
  -- Measurement & Reporting
  ('Design medical affairs quarterly business review template tracking KPIs, milestone achievement, and strategic alignment', '📊', 'reporting', 5),
  ('Analyze medical affairs resource utilization identifying optimization opportunities across therapeutic areas', '📈', 'optimization', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND (a.display_name ILIKE '%Strategy%Manager%' OR a.display_name ILIKE '%Strategic%')
  AND al.level_number = 3
;

-- ============================================================================
-- PART 8: KOL MANAGEMENT DEPARTMENT
-- ============================================================================

-- L2: Head of KOL Management
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Strategy & Framework
  ('Develop enterprise KOL management strategy defining tiering criteria, engagement models, and relationship metrics across therapeutic areas', '🎯', 'strategy', 1),
  ('Build KOL database and CRM integration tracking 500 thought leaders with engagement history, preferences, and collaboration opportunities', '📊', 'database', 2),
  -- Program Design
  ('Design advisory board program framework ensuring scientific rigor, compliance, and fair market value across 20 annual meetings', '🤝', 'advisory', 3),
  ('Create speaker bureau excellence program certifying 75 KOLs with training, contracting, and performance management', '🎤', 'speakers', 4),
  -- Compliance & Operations
  ('Develop KOL compliance monitoring system tracking aggregate spend, HCP transparency reporting, and anti-kickback adherence', '✅', 'compliance', 5),
  ('Build KOL engagement ROI framework measuring scientific impact, advocacy development, and business contribution', '📈', 'roi', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND (a.department_name ILIKE '%KOL%' OR a.display_name ILIKE '%KOL%')
  AND al.level_number = 2
;

-- L3: KOL Engagement Manager
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  -- Engagement Planning
  ('Create comprehensive KOL profile for Dr. Martinez including research focus, publication history, society leadership, and engagement opportunities', '👤', 'profile', 1),
  ('Develop 12-month engagement plan for 25 Tier 1 oncology KOLs defining touchpoints, content, and relationship objectives', '📅', 'planning', 2),
  -- Advisory & Consulting
  ('Plan Q2 advisory board meeting on real-world evidence study design with 10 NSCLC experts including agenda, logistics, and outcomes', '🤝', 'advisory', 3),
  ('Coordinate consulting agreements for 5 KOLs supporting publication development ensuring FMV and compliance requirements', '📋', 'consulting', 4),
  -- Analysis & Reporting
  ('Analyze KOL engagement metrics identifying relationship trends, sentiment shifts, and competitive intelligence insights', '📊', 'analysis', 5),
  ('Generate quarterly KOL activity report for leadership summarizing engagements, insights captured, and advocacy development', '📈', 'reporting', 6)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND (a.display_name ILIKE '%KOL%' AND a.display_name NOT ILIKE '%Head%')
  AND al.level_number = 3
;

-- ============================================================================
-- PART 9: L5 TOOL AGENTS (Cross-Functional Utilities)
-- ============================================================================

-- PubMed Search Tool
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  ('Search PubMed for pembrolizumab combination therapy in NSCLC published 2023-2024', '🔍', 'search', 1),
  ('Find systematic reviews on SGLT2 inhibitors and cardiovascular outcomes', '📚', 'slr', 2),
  ('Retrieve Dr. Smith publication history in thoracic oncology (last 5 years)', '👤', 'author', 3),
  ('Search for clinical trial publications for compound ABC-123 Phase 3', '🧪', 'trial', 4)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND al.level_number = 5
  AND a.display_name ILIKE '%PubMed%'
;

-- MedDRA Coding Tool
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  ('What is the MedDRA PT code for febrile neutropenia?', '🔢', 'lookup', 1),
  ('Find all preferred terms under Cardiac Disorders SOC', '❤️', 'soc', 2),
  ('Map ICD-10 code C34.90 to MedDRA equivalent', '🔄', 'mapping', 3),
  ('List MedDRA hierarchy for immune-related adverse events', '📋', 'hierarchy', 4)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND al.level_number = 5
  AND a.display_name ILIKE '%MedDRA%'
;

-- Dosing Calculator Tool
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  ('Calculate renal dose adjustment for CrCl 35 mL/min', '🔢', 'renal', 1),
  ('Convert 500mg IV to equivalent oral dose', '💊', 'conversion', 2),
  ('Calculate BSA-based dosing for 75kg, 175cm patient', '📊', 'bsa', 3),
  ('Determine pediatric dose for 25kg child (age 8)', '👶', 'pediatric', 4)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND al.level_number = 5
  AND a.display_name ILIKE '%Dosing%'
;

-- Congress Calendar Tool
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN (VALUES
  ('When is the ASCO 2025 abstract submission deadline?', '📅', 'deadline', 1),
  ('List major oncology congresses in Q1-Q2 2025', '🗓️', 'calendar', 2),
  ('Find registration deadline for ESMO Congress 2025', '✅', 'registration', 3),
  ('What are AACR 2025 abstract categories and word limits?', '📋', 'guidelines', 4)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND al.level_number = 5
  AND (a.display_name ILIKE '%Congress%' OR a.display_name ILIKE '%Calendar%')
;

-- ============================================================================
-- PART 10: VERIFICATION
-- ============================================================================

-- Summary by Level and Department
SELECT
  al.level_number,
  al.name as level_name,
  a.department_name,
  COUNT(DISTINCT a.id) as agents,
  COUNT(aps.id) as starters,
  ROUND(AVG(LENGTH(aps.text))) as avg_length
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_prompt_starters aps ON aps.agent_id = a.id
WHERE a.function_name = 'Medical Affairs' AND a.status = 'active'
GROUP BY al.level_number, al.name, a.department_name
ORDER BY al.level_number, a.department_name;
