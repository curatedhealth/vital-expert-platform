-- ============================================================================
-- Migration: Medical Affairs Comprehensive Prompt Starters
-- Date: 2025-12-02
-- Purpose: Generate quality, level-appropriate prompt starters for ALL Medical Affairs agents
-- ============================================================================

-- PART 0: FIX AGENT LEVEL MISCLASSIFICATIONS
-- ============================================================================

-- Move Business Intelligence Analyst and Customer Insights Analyst from L4 to L3
UPDATE agents
SET agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3)
WHERE display_name IN ('Business Intelligence Analyst', 'Customer Insights Analyst')
AND function_name = 'Medical Affairs';

-- ============================================================================
-- PART 1: CLEAR EXISTING LOW-QUALITY STARTERS FOR MEDICAL AFFAIRS AGENTS
-- ============================================================================

-- Delete existing poor quality starters (will be replaced with rich ones)
DELETE FROM agent_prompt_starters
WHERE agent_id IN (
  SELECT a.id FROM agents a
  WHERE a.function_name = 'Medical Affairs'
  AND a.status = 'active'
);

-- ============================================================================
-- PART 2: L2 EXPERT STARTERS (10 Medical Affairs Experts)
-- Strategic, comprehensive prompts for leadership roles
-- ============================================================================

-- 2.1 Biomarker Validation Expert
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a comprehensive biomarker validation strategy for our companion diagnostic program, including analytical validation milestones, clinical validation endpoints, and regulatory pathway considerations', '🔬', 'clinical', 1),
  ('Evaluate the analytical performance characteristics required for our predictive biomarker assay, including sensitivity, specificity, precision, and sample stability requirements', '📊', 'clinical', 2),
  ('Design a clinical validation study protocol to demonstrate the clinical utility of our prognostic biomarker in the target patient population', '📋', 'clinical', 3),
  ('Review our biomarker development package for FDA/EMA regulatory submission readiness, identifying gaps in analytical and clinical validation data', '✅', 'regulatory', 4),
  ('Create a biomarker lifecycle management plan addressing assay platform transitions, reference standard maintenance, and ongoing performance monitoring', '🔄', 'clinical', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Biomarker Validation Expert' AND a.function_name = 'Medical Affairs';

-- 2.2 Clinical Trial Simulation Expert
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Build a clinical trial simulation model to optimize our Phase 3 study design, evaluating different sample sizes, interim analysis timing, and adaptive design options', '📈', 'clinical', 1),
  ('Conduct a probability of success analysis for our development program using available Phase 2 data, competitive landscape, and historical benchmarks', '🎯', 'clinical', 2),
  ('Simulate patient enrollment scenarios for our multi-regional trial considering site activation rates, screening failures, and seasonal variations', '👥', 'clinical', 3),
  ('Model dose-response relationships from our Phase 1/2 data to recommend optimal dosing for the pivotal study', '💊', 'clinical', 4),
  ('Perform sensitivity analyses on our primary endpoint assumptions to identify key drivers of trial success and risk mitigation strategies', '⚖️', 'clinical', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Clinical Trial Simulation Expert' AND a.function_name = 'Medical Affairs';

-- 2.3 Medical Affairs Strategist
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a comprehensive integrated medical affairs strategy for our upcoming oncology launch, including KOL engagement, evidence generation, and publication planning', '🎯', 'strategy', 1),
  ('Create a medical affairs value proposition framework demonstrating our contribution to clinical development, commercial success, and patient outcomes', '💡', 'strategy', 2),
  ('Design a post-launch evidence generation roadmap addressing remaining clinical questions, payer evidence gaps, and competitive differentiation needs', '🗺️', 'clinical', 3),
  ('Evaluate our current medical affairs organizational structure and recommend enhancements to support pipeline growth and geographic expansion', '🏢', 'strategy', 4),
  ('Build a medical affairs budget model with KPIs and metrics to demonstrate return on medical investment to senior leadership', '📊', 'strategy', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Affairs Strategist' AND a.function_name = 'Medical Affairs';

-- 2.4 Medical Education Director
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Design a comprehensive continuing medical education (CME) strategy for our therapeutic area, including needs assessment, curriculum development, and outcome measurement', '🎓', 'education', 1),
  ('Develop an innovative digital medical education platform strategy incorporating microlearning, case-based modules, and interactive simulations', '💻', 'education', 2),
  ('Create a healthcare professional education pathway addressing knowledge gaps from disease awareness through treatment optimization', '📚', 'education', 3),
  ('Evaluate our medical education program effectiveness using learning outcomes, behavior change metrics, and patient impact measures', '📈', 'education', 4),
  ('Build a global medical education governance framework ensuring scientific accuracy, compliance, and consistent quality across regions', '🌐', 'education', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Education Director' AND a.function_name = 'Medical Affairs';

-- 2.5 Medical Excellence Director
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a medical affairs excellence framework with capability assessments, best practice standards, and continuous improvement mechanisms', '⭐', 'strategy', 1),
  ('Create a medical affairs quality management system addressing SOP development, training compliance, and audit readiness', '✅', 'compliance', 2),
  ('Design a medical affairs innovation program to identify and pilot emerging technologies, methodologies, and engagement approaches', '💡', 'strategy', 3),
  ('Build a comprehensive medical affairs metrics dashboard tracking activity, quality, impact, and efficiency across all functions', '📊', 'strategy', 4),
  ('Evaluate and recommend enhancements to our medical affairs operating model including processes, systems, and vendor partnerships', '🔧', 'strategy', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Excellence Director' AND a.function_name = 'Medical Affairs';

-- 2.6 Patient Access Director
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a comprehensive patient access strategy addressing coverage, affordability, and adherence barriers for our specialty product launch', '🏥', 'market-access', 1),
  ('Design an integrated patient support program including hub services, copay assistance, and nurse educator support', '🤝', 'market-access', 2),
  ('Create a payer engagement strategy with value messaging, evidence packages, and coverage policy recommendations', '💼', 'market-access', 3),
  ('Evaluate patient journey pain points and recommend interventions to improve time-to-therapy and treatment persistence', '🗺️', 'market-access', 4),
  ('Build a patient access metrics framework measuring coverage rates, access times, abandonment rates, and patient satisfaction', '📈', 'market-access', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Patient Access Director' AND a.function_name = 'Medical Affairs';

-- 2.7 Policy & Advocacy Director
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a healthcare policy strategy addressing legislative and regulatory developments affecting patient access to our therapies', '📜', 'policy', 1),
  ('Create a stakeholder engagement plan for patient advocacy organizations, professional societies, and policy think tanks', '🤝', 'policy', 2),
  ('Analyze the impact of proposed healthcare reforms on our therapeutic area and recommend positioning strategies', '📊', 'policy', 3),
  ('Design a patient advocacy program that amplifies patient voice in healthcare policy discussions while maintaining compliance', '📢', 'policy', 4),
  ('Build a policy monitoring and intelligence system to track legislative developments and competitive policy activities', '🔍', 'policy', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Policy & Advocacy Director' AND a.function_name = 'Medical Affairs';

-- 2.8 Publication Strategy Lead
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a comprehensive publication strategy for our clinical development program from Phase 1 through post-marketing, prioritizing key data disclosures', '📚', 'publications', 1),
  ('Create a congress strategy for the upcoming major medical meeting including abstract submissions, poster presentations, and symposium planning', '🎤', 'publications', 2),
  ('Design a real-world evidence publication program to address remaining clinical questions and support market access objectives', '🌍', 'publications', 3),
  ('Evaluate our publication portfolio against competitive landscape and recommend gap-filling manuscripts', '📊', 'publications', 4),
  ('Build a publication governance framework ensuring ICMJE compliance, author engagement, and timely disclosure', '✅', 'publications', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Publication Strategy Lead' AND a.function_name = 'Medical Affairs';

-- 2.9 Regional Medical Director
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a regional medical affairs strategy aligned with global medical plans while addressing local market needs and regulatory requirements', '🌐', 'strategy', 1),
  ('Create an MSL deployment and territory optimization plan maximizing coverage of key accounts and opinion leaders', '🗺️', 'strategy', 2),
  ('Design a regional KOL engagement program identifying, prioritizing, and developing relationships with influential healthcare professionals', '🤝', 'strategy', 3),
  ('Build a regional medical affairs operating model addressing resource allocation, governance, and cross-functional collaboration', '🏢', 'strategy', 4),
  ('Evaluate regional competitive landscape and recommend differentiated medical engagement strategies', '📊', 'strategy', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Regional Medical Director' AND a.function_name = 'Medical Affairs';

-- 2.10 Therapeutic Area MSL Lead
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a therapeutic area scientific platform with core medical messaging, clinical data narratives, and competitive positioning', '🎯', 'clinical', 1),
  ('Create an MSL training curriculum covering disease state, product science, competitor landscape, and scientific communication skills', '📚', 'education', 2),
  ('Design a KOL development program identifying emerging thought leaders and building long-term scientific relationships', '🌟', 'clinical', 3),
  ('Build a field medical insights program capturing HCP feedback, clinical practice trends, and unmet needs', '💡', 'clinical', 4),
  ('Evaluate MSL impact metrics and recommend enhancements to field medical effectiveness measurement', '📈', 'strategy', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Therapeutic Area MSL Lead' AND a.function_name = 'Medical Affairs';

-- ============================================================================
-- PART 3: L3 SPECIALIST STARTERS (37+ Medical Affairs Specialists)
-- Focused, task-specific prompts for domain specialists
-- ============================================================================

-- 3.1 Adverse Event Reporter
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Process this adverse event report and determine the appropriate regulatory reporting timeline based on seriousness and expectedness criteria', '⚠️', 'safety', 1),
  ('Draft an expedited safety report (IND Safety Report / SUSAR) for submission to FDA/EMA within the required timeframe', '📋', 'safety', 2),
  ('Evaluate the causality assessment for this adverse event using WHO-UMC criteria and document the rationale', '🔍', 'safety', 3),
  ('Reconcile adverse event data between our safety database and clinical trial database to ensure consistency', '🔄', 'safety', 4),
  ('Generate a line listing of all serious adverse events for the upcoming DSMC meeting', '📊', 'safety', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Adverse Event Reporter' AND a.function_name = 'Medical Affairs';

-- 3.2 Advisory Board Organizer
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Plan a virtual advisory board meeting for 8-10 KOLs to gather insights on our Phase 3 trial design and endpoint selection', '👥', 'clinical', 1),
  ('Create a detailed advisory board agenda with discussion objectives, time allocations, and facilitation questions', '📋', 'clinical', 2),
  ('Draft fair market value documentation and contracts for advisory board participants based on time commitment and expertise level', '💼', 'compliance', 3),
  ('Develop pre-reading materials and discussion guides for advisory board participants', '📚', 'clinical', 4),
  ('Prepare a post-advisory board summary report capturing key insights, recommendations, and action items', '📝', 'clinical', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Advisory Board Organizer' AND a.function_name = 'Medical Affairs';

-- 3.3 Biomarker Strategy Advisor
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Evaluate potential predictive biomarkers for patient selection in our upcoming Phase 2 study based on mechanism of action', '🔬', 'clinical', 1),
  ('Develop a biomarker sampling strategy for our clinical trial including collection timepoints, sample volumes, and storage requirements', '📋', 'clinical', 2),
  ('Analyze biomarker data from our Phase 1 study to identify potential responder subgroups', '📊', 'clinical', 3),
  ('Create a biomarker communication strategy for regulatory interactions including IND meetings and label negotiations', '💬', 'regulatory', 4),
  ('Review competitor biomarker strategies in our therapeutic area and identify differentiation opportunities', '🔍', 'clinical', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Biomarker Strategy Advisor' AND a.function_name = 'Medical Affairs';

-- 3.4 Clinical Data Analyst Agent
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Analyze the primary efficacy endpoint data from our Phase 3 study and generate summary statistics with confidence intervals', '📊', 'clinical', 1),
  ('Perform subgroup analyses by demographics, baseline characteristics, and concomitant medications', '📈', 'clinical', 2),
  ('Generate Kaplan-Meier survival curves and hazard ratio calculations for our time-to-event endpoints', '📉', 'clinical', 3),
  ('Create data visualizations (forest plots, waterfall plots) for the upcoming publication manuscript', '📊', 'clinical', 4),
  ('Validate the statistical analysis outputs against the pre-specified statistical analysis plan', '✅', 'clinical', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Clinical Data Analyst Agent' AND a.function_name = 'Medical Affairs';

-- 3.5 Clinical Data Manager
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Design case report forms (CRFs) for our Phase 2 study capturing all protocol-required assessments with appropriate edit checks', '📝', 'clinical', 1),
  ('Develop a data management plan including data flow, cleaning procedures, and database lock criteria', '📋', 'clinical', 2),
  ('Generate a data quality report identifying missing data, protocol deviations, and query trends across sites', '📊', 'clinical', 3),
  ('Perform medical coding review of adverse events (MedDRA) and concomitant medications (WHODrug)', '🔍', 'clinical', 4),
  ('Prepare the clinical database for lock including final query resolution and audit trail review', '🔒', 'clinical', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Clinical Data Manager' AND a.function_name = 'Medical Affairs';

-- 3.6 Clinical Operations Coordinator
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Create a site activation tracker with regulatory submission dates, IRB approval status, and activation milestones', '📋', 'clinical', 1),
  ('Coordinate the distribution of clinical supplies to sites based on enrollment projections and inventory levels', '📦', 'clinical', 2),
  ('Prepare site performance reports including enrollment rates, data quality metrics, and protocol compliance', '📊', 'clinical', 3),
  ('Manage the clinical trial amendment process including protocol updates, site notifications, and IRB submissions', '🔄', 'clinical', 4),
  ('Track and resolve outstanding monitoring visit findings across all active sites', '✅', 'clinical', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Clinical Operations Coordinator' AND a.function_name = 'Medical Affairs';

-- 3.7 Clinical Trial Budget Estimator
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a detailed budget estimate for our Phase 3 oncology study including site costs, lab assessments, and monitoring', '💰', 'clinical', 1),
  ('Compare CRO proposals and provide a cost-benefit analysis with recommendations', '📊', 'clinical', 2),
  ('Create a budget variance report comparing actual spend to plan with explanations for significant deviations', '📈', 'clinical', 3),
  ('Model the financial impact of protocol amendments including additional visits, procedures, and extended timelines', '🔄', 'clinical', 4),
  ('Generate a per-patient cost analysis by region to support site selection decisions', '💵', 'clinical', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Clinical Trial Budget Estimator' AND a.function_name = 'Medical Affairs';

-- 3.8 Clinical Trial Designer
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Design a Phase 2 dose-finding study using an adaptive design to optimize dose selection efficiency', '🎯', 'clinical', 1),
  ('Develop inclusion/exclusion criteria that balance scientific rigor with enrollment feasibility', '📋', 'clinical', 2),
  ('Create a study schema with visit schedules, assessment windows, and procedure timing', '📅', 'clinical', 3),
  ('Evaluate basket trial vs umbrella trial designs for our oncology program with multiple tumor types', '🔬', 'clinical', 4),
  ('Recommend statistical design parameters including sample size, power, and interim analysis strategy', '📊', 'clinical', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Clinical Trial Designer' AND a.function_name = 'Medical Affairs';

-- 3.9 Clinical Trial Disclosure Manager
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Register our new Phase 3 study on ClinicalTrials.gov with all required protocol information and outcome measures', '📝', 'compliance', 1),
  ('Update the registry record with protocol amendments and enrollment status changes', '🔄', 'compliance', 2),
  ('Prepare results posting for completed study including outcome measures, adverse events, and baseline characteristics', '📊', 'compliance', 3),
  ('Audit our clinical trial disclosure compliance across all global registries and identify gaps', '✅', 'compliance', 4),
  ('Generate a disclosure timeline report tracking upcoming registration and results posting deadlines', '📅', 'compliance', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Clinical Trial Disclosure Manager' AND a.function_name = 'Medical Affairs';

-- 3.10 Clinical Trial Protocol Designer
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Draft a clinical study protocol following ICH E6(R2) structure for our Phase 2b immunotherapy trial', '📄', 'clinical', 1),
  ('Develop the study objectives and endpoints section with clear primary, secondary, and exploratory endpoints', '🎯', 'clinical', 2),
  ('Write the statistical considerations section including sample size justification and analysis populations', '📊', 'clinical', 3),
  ('Create the safety monitoring and stopping rules section with clear criteria for DSMB review', '⚠️', 'clinical', 4),
  ('Draft protocol amendment text addressing FDA feedback from our pre-IND meeting', '📝', 'regulatory', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Clinical Trial Protocol Designer' AND a.function_name = 'Medical Affairs';

-- 3.11 Clinical Trial Transparency Officer
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a clinical data sharing policy and procedures for handling external researcher requests', '📋', 'compliance', 1),
  ('Prepare an anonymized clinical study report for public disclosure following EMA Policy 0070', '📄', 'compliance', 2),
  ('Create a data sharing agreement template for qualified researchers accessing our clinical trial data', '📝', 'compliance', 3),
  ('Assess a researcher proposal for scientific merit and feasibility of data sharing', '🔍', 'compliance', 4),
  ('Generate a transparency report summarizing data sharing activities and researcher publications', '📊', 'compliance', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Clinical Trial Transparency Officer' AND a.function_name = 'Medical Affairs';

-- 3.12 Combination Product Specialist
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Determine the appropriate combination product designation (drug-device or device-drug) for our auto-injector delivery system', '🔬', 'regulatory', 1),
  ('Develop a combination product development plan addressing both drug and device regulatory requirements', '📋', 'regulatory', 2),
  ('Create design verification and validation protocols for the device constituent of our combination product', '✅', 'regulatory', 3),
  ('Prepare the combination product section of our BLA/NDA submission including device design history file elements', '📄', 'regulatory', 4),
  ('Evaluate human factors engineering requirements and usability testing strategy for our delivery device', '👤', 'regulatory', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Combination Product Specialist' AND a.function_name = 'Medical Affairs';

-- 3.13 KOL Engagement Coordinator
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Create a KOL profile for the top 20 thought leaders in our therapeutic area including publication history, speaking engagements, and influence metrics', '👤', 'clinical', 1),
  ('Develop a KOL engagement plan with touchpoint cadence, scientific objectives, and compliance guardrails', '📋', 'clinical', 2),
  ('Prepare pre-meeting briefing materials for an MSL engagement with a high-priority KOL', '📚', 'clinical', 3),
  ('Track and report KOL engagement activities including meeting summaries, insights captured, and follow-up actions', '📊', 'clinical', 4),
  ('Identify emerging thought leaders and rising stars in our disease area for early engagement', '🌟', 'clinical', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'KOL Engagement Coordinator' AND a.function_name = 'Medical Affairs';

-- 3.14 Medical Affairs Commercial Liaison
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop compliant scientific messaging for the commercial team that accurately reflects our clinical data', '💬', 'compliance', 1),
  ('Review promotional materials for scientific accuracy and appropriate claims substantiation', '✅', 'compliance', 2),
  ('Create a medical-commercial collaboration framework with clear roles, responsibilities, and governance', '🤝', 'compliance', 3),
  ('Translate medical strategy insights into actionable recommendations for brand planning', '📊', 'strategy', 4),
  ('Prepare scientific training content for sales representatives on disease state and product mechanism', '📚', 'education', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Affairs Commercial Liaison' AND a.function_name = 'Medical Affairs';

-- 3.15 Medical Affairs Metrics Analyst
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Generate a quarterly medical affairs performance dashboard with KPIs for MSL productivity, publication output, and KOL engagement', '📊', 'strategy', 1),
  ('Analyze MSL territory coverage and identify optimization opportunities based on HCP reach and engagement quality', '🗺️', 'strategy', 2),
  ('Create benchmarking analysis comparing our medical affairs metrics to industry standards', '📈', 'strategy', 3),
  ('Develop ROI analysis for medical education investments including CME programs and speaker bureaus', '💰', 'strategy', 4),
  ('Track and report medical affairs budget utilization with variance analysis and forecasting', '💵', 'strategy', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Affairs Metrics Analyst' AND a.function_name = 'Medical Affairs';

-- 3.16 Medical Affairs Operations Manager
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop an annual medical affairs operational plan with resource allocation, timelines, and budget requirements', '📋', 'strategy', 1),
  ('Create a vendor management framework for medical communications agencies, CME providers, and meeting planners', '🤝', 'strategy', 2),
  ('Design standard operating procedures for medical information request handling and response tracking', '📄', 'compliance', 3),
  ('Implement a medical affairs project management system with milestone tracking and resource management', '🔧', 'strategy', 4),
  ('Prepare a business continuity plan for medical affairs operations including risk mitigation strategies', '⚠️', 'strategy', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Affairs Operations Manager' AND a.function_name = 'Medical Affairs';

-- 3.17 Medical Communications Manager
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a medical communications plan for our product launch including core messaging, channel strategy, and content calendar', '📋', 'communications', 1),
  ('Create scientific slide decks for MSL use with key clinical data presentations and competitive positioning', '📊', 'communications', 2),
  ('Draft a medical communication brief for our agency partner on the upcoming Phase 3 data publication', '📝', 'communications', 3),
  ('Review and approve medical communications materials ensuring scientific accuracy and compliance', '✅', 'communications', 4),
  ('Design a digital medical communications strategy including website content, social media, and multimedia assets', '💻', 'communications', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Communications Manager' AND a.function_name = 'Medical Affairs';

-- 3.18 Medical Information Specialist
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Draft a medical information response to an HCP inquiry about off-label use with appropriate disclaimers and references', '📝', 'clinical', 1),
  ('Create a standard response document for frequently asked questions about our product safety profile', '📋', 'clinical', 2),
  ('Develop a medical information request tracking system with response time metrics and quality indicators', '📊', 'clinical', 3),
  ('Review and update our medical information database with latest clinical data and labeling changes', '🔄', 'clinical', 4),
  ('Prepare a literature summary responding to a complex clinical question requiring comprehensive evidence review', '📚', 'clinical', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Information Specialist' AND a.function_name = 'Medical Affairs';

-- 3.19 Medical Quality Assurance Manager
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a GVP compliance audit plan covering pharmacovigilance system, safety database, and regulatory reporting', '✅', 'compliance', 1),
  ('Create CAPA documentation for findings from our recent pharmacovigilance inspection', '📋', 'compliance', 2),
  ('Design a medical affairs quality metrics dashboard tracking SOP compliance, training completion, and audit findings', '📊', 'compliance', 3),
  ('Prepare inspection readiness documentation for an upcoming FDA pharmacovigilance inspection', '📄', 'compliance', 4),
  ('Review and update medical affairs SOPs to reflect current regulations and best practices', '🔄', 'compliance', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Quality Assurance Manager' AND a.function_name = 'Medical Affairs';

-- 3.20 Medical Review Committee Coordinator
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Schedule and coordinate a medical-legal-regulatory review meeting for our new promotional campaign materials', '📅', 'compliance', 1),
  ('Track the MLR review process for pending materials with status updates and approval timelines', '📊', 'compliance', 2),
  ('Document MLR committee decisions, required revisions, and approval conditions', '📝', 'compliance', 3),
  ('Prepare MLR submission packages with all required supporting documentation and references', '📋', 'compliance', 4),
  ('Generate MLR metrics reports showing review cycle times, revision rates, and bottlenecks', '📈', 'compliance', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Review Committee Coordinator' AND a.function_name = 'Medical Affairs';

-- 3.21 Medical Science Liaison Advisor
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a scientific engagement strategy for a high-priority KOL considering their research interests and clinical practice', '🎯', 'clinical', 1),
  ('Create a territory business plan with prioritized accounts, engagement objectives, and resource allocation', '📋', 'strategy', 2),
  ('Prepare scientific talking points and slide deck for an upcoming investigator meeting', '📊', 'clinical', 3),
  ('Draft a field medical insight report capturing HCP feedback on unmet needs and treatment challenges', '💡', 'clinical', 4),
  ('Review clinical data to develop compelling scientific narratives for peer-to-peer discussions', '📚', 'clinical', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Science Liaison Advisor' AND a.function_name = 'Medical Affairs';

-- 3.22 Medical Science Liaison Coordinator
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Coordinate logistics for MSL attendance at an upcoming medical congress including booth coverage and KOL meetings', '📅', 'clinical', 1),
  ('Manage MSL training program scheduling including product training, compliance refreshers, and skill development', '📚', 'education', 2),
  ('Track and report MSL activity metrics including HCP interactions, meeting frequency, and territory coverage', '📊', 'clinical', 3),
  ('Coordinate investigator-initiated study submissions including feasibility assessments and internal review', '📋', 'clinical', 4),
  ('Prepare MSL team meeting materials including agenda, updates, and action items', '📝', 'clinical', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Science Liaison Coordinator' AND a.function_name = 'Medical Affairs';

-- 3.23 Medical Writer
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Draft a clinical study report (CSR) following ICH E3 guidelines for our completed Phase 2 study', '📄', 'clinical', 1),
  ('Write an investigator brochure update incorporating new safety and efficacy data', '📋', 'clinical', 2),
  ('Develop a manuscript draft for submission to a peer-reviewed journal following ICMJE guidelines', '📝', 'publications', 3),
  ('Create a plain language summary of clinical trial results for patient and public audiences', '📖', 'clinical', 4),
  ('Draft a scientific poster abstract for submission to an upcoming medical congress', '🎤', 'publications', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Writer' AND a.function_name = 'Medical Affairs';

-- 3.24 Medical Writer - Regulatory
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Draft Module 2.5 Clinical Overview for our NDA submission synthesizing efficacy, safety, and benefit-risk assessment', '📄', 'regulatory', 1),
  ('Write the Integrated Summary of Safety (ISS) compiling safety data across our clinical development program', '📋', 'regulatory', 2),
  ('Develop responses to FDA information requests with clear, concise answers supported by data references', '📝', 'regulatory', 3),
  ('Create a briefing document for an FDA Type B pre-submission meeting', '📊', 'regulatory', 4),
  ('Draft a Risk Evaluation and Mitigation Strategy (REMS) document based on the product safety profile', '⚠️', 'regulatory', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Writer - Regulatory' AND a.function_name = 'Medical Affairs';

-- 3.25 Medical Writer - Scientific
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Write a review article on the current treatment landscape and emerging therapies in our therapeutic area', '📝', 'publications', 1),
  ('Draft a congress symposium slide deck presenting our Phase 3 results for a 30-minute presentation', '📊', 'publications', 2),
  ('Create educational content on disease pathophysiology and mechanism of action for HCP audiences', '📚', 'education', 3),
  ('Develop a literature review summarizing published evidence on our product class', '📖', 'publications', 4),
  ('Write a case study manuscript featuring real-world treatment experience with our therapy', '📄', 'publications', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Medical Writer - Scientific' AND a.function_name = 'Medical Affairs';

-- 3.26 Publication Planner
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Create an integrated publication plan for our clinical development program prioritizing key data disclosures', '📋', 'publications', 1),
  ('Develop a congress planning matrix with abstract deadlines, presentation types, and author assignments', '📅', 'publications', 2),
  ('Track publication milestones including manuscript drafts, author reviews, and journal submissions', '📊', 'publications', 3),
  ('Identify target journals for our Phase 3 manuscript based on impact factor, audience, and acceptance rates', '🎯', 'publications', 4),
  ('Prepare publication committee meeting materials with status updates and decision points', '📝', 'publications', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Publication Planner' AND a.function_name = 'Medical Affairs';

-- 3.27 Safety Communication Specialist
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Draft a Dear Healthcare Provider letter communicating an important safety update for our product', '📝', 'safety', 1),
  ('Develop patient-friendly safety information materials explaining risks and monitoring requirements', '📖', 'safety', 2),
  ('Create a safety data summary for inclusion in scientific presentations and publications', '📊', 'safety', 3),
  ('Prepare responses to healthcare provider inquiries about specific safety signals or concerns', '💬', 'safety', 4),
  ('Write safety sections for the investigator brochure update based on aggregate safety analysis', '📋', 'safety', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Safety Communication Specialist' AND a.function_name = 'Medical Affairs';

-- 3.28 Safety Labeling Specialist
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Draft updated Warnings and Precautions section language based on new post-marketing safety data', '⚠️', 'safety', 1),
  ('Compare our US and EU labeling for harmonization opportunities while respecting regional requirements', '🌐', 'safety', 2),
  ('Prepare labeling supplement submission documents for a safety-related label update', '📄', 'regulatory', 3),
  ('Develop a labeling negotiation strategy for upcoming FDA label discussions', '💬', 'regulatory', 4),
  ('Create a labeling history document tracking all safety-related label changes since approval', '📋', 'safety', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Safety Labeling Specialist' AND a.function_name = 'Medical Affairs';

-- 3.29 Safety Reporting Coordinator
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Process incoming adverse event reports and ensure data entry completeness in the safety database', '📝', 'safety', 1),
  ('Track regulatory submission deadlines for expedited and periodic safety reports', '📅', 'safety', 2),
  ('Generate safety database metrics including case volume, processing times, and compliance rates', '📊', 'safety', 3),
  ('Coordinate with clinical sites to obtain follow-up information on serious adverse events', '🔄', 'safety', 4),
  ('Prepare case narratives for inclusion in aggregate safety reports', '📄', 'safety', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Safety Reporting Coordinator' AND a.function_name = 'Medical Affairs';

-- 3.30 Safety Signal Evaluator
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Evaluate a potential safety signal identified through disproportionality analysis of our post-marketing data', '🔍', 'safety', 1),
  ('Conduct a cumulative review of hepatotoxicity cases to assess signal strength and clinical significance', '📊', 'safety', 2),
  ('Prepare a signal evaluation report for Safety Management Team review with risk assessment and recommendations', '📋', 'safety', 3),
  ('Analyze clinical trial safety data to identify emerging safety trends requiring further investigation', '📈', 'safety', 4),
  ('Review published literature for reports of similar adverse events with our drug class', '📚', 'safety', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Safety Signal Evaluator' AND a.function_name = 'Medical Affairs';

-- 3.31 Business Intelligence Analyst (reclassified to L3)
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Analyze competitive intelligence data to identify market trends and strategic implications for our portfolio', '📊', 'strategy', 1),
  ('Create an executive dashboard visualizing key performance indicators for medical affairs leadership', '📈', 'strategy', 2),
  ('Develop a market landscape analysis including competitor pipelines, clinical trial activity, and publication trends', '🗺️', 'strategy', 3),
  ('Generate insights from HCP engagement data to optimize medical affairs resource allocation', '💡', 'strategy', 4),
  ('Build predictive models for KOL influence and engagement effectiveness', '🎯', 'strategy', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Business Intelligence Analyst' AND a.function_name = 'Medical Affairs';

-- 3.32 Customer Insights Analyst (reclassified to L3)
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Analyze HCP survey data to understand prescribing behaviors and information needs in our therapeutic area', '📊', 'strategy', 1),
  ('Develop patient journey maps identifying touchpoints, pain points, and intervention opportunities', '🗺️', 'strategy', 2),
  ('Create HCP segmentation based on prescribing patterns, clinical interests, and engagement preferences', '👥', 'strategy', 3),
  ('Generate insights report from congress feedback and MSL interaction summaries', '💡', 'strategy', 4),
  ('Design and analyze medical affairs customer satisfaction surveys', '📝', 'strategy', 5)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Customer Insights Analyst' AND a.function_name = 'Medical Affairs';

-- Continue with remaining L3 Specialists...

-- 3.33 Communication Distributor
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Distribute the updated safety communication to all regional medical affairs teams with read receipt tracking', '📤', 'communications', 1),
  ('Create a distribution list for scientific updates targeting specific therapeutic area stakeholders', '📋', 'communications', 2),
  ('Track delivery and acknowledgment status for the Dear Healthcare Provider letter distribution', '✅', 'communications', 3),
  ('Route the medical information update to appropriate audiences based on content classification', '🔀', 'communications', 4)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Communication Distributor' AND a.function_name = 'Medical Affairs';

-- 3.34 Document Review Coordinator
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Coordinate the review cycle for our new scientific slide deck across medical, legal, and regulatory reviewers', '📋', 'compliance', 1),
  ('Track reviewer feedback and consolidate comments on the publication manuscript draft', '📝', 'compliance', 2),
  ('Generate a review status report showing pending reviews, overdue items, and bottlenecks', '📊', 'compliance', 3),
  ('Manage the review assignments and deadlines for the quarterly medical affairs document updates', '📅', 'compliance', 4)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Document Review Coordinator' AND a.function_name = 'Medical Affairs';

-- 3.35 Multi-Language Translator
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Translate the patient information leaflet from English to Spanish maintaining pharmaceutical terminology accuracy', '🌐', 'communications', 1),
  ('Adapt our medical education content for the German market with appropriate regulatory language', '📄', 'communications', 2),
  ('Review the back-translation of our clinical trial consent form for accuracy', '✅', 'compliance', 3),
  ('Translate the scientific poster abstract into French for the European congress submission', '📝', 'communications', 4)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Multi-Language Translator' AND a.function_name = 'Medical Affairs';

-- 3.36 Onboarding Checklist Coordinator
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Create an onboarding checklist for a new MSL including product training, compliance certifications, and system access', '📋', 'education', 1),
  ('Track training completion status for new medical affairs team members', '✅', 'education', 2),
  ('Generate an onboarding progress report for the hiring manager with milestone achievements', '📊', 'education', 3),
  ('Coordinate training assignments and schedule completion deadlines for new hires', '📅', 'education', 4)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Onboarding Checklist Coordinator' AND a.function_name = 'Medical Affairs';

-- 3.37 Project Coordination Agent
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Create a project plan for our upcoming advisory board with milestones, deliverables, and owner assignments', '📋', 'strategy', 1),
  ('Track project status across medical affairs initiatives and flag at-risk deliverables', '📊', 'strategy', 2),
  ('Coordinate cross-functional activities for the product launch medical affairs workstream', '🤝', 'strategy', 3),
  ('Generate a weekly project status report for medical affairs leadership review', '📈', 'strategy', 4)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Project Coordination Agent' AND a.function_name = 'Medical Affairs';

-- 3.38 Task Assignment Coordinator
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Assign medical information requests to team members based on therapeutic area expertise and current workload', '📋', 'strategy', 1),
  ('Balance task assignments across the medical writing team for optimal resource utilization', '⚖️', 'strategy', 2),
  ('Track task completion status and identify team members with capacity for additional assignments', '📊', 'strategy', 3),
  ('Generate workload metrics report showing task distribution and completion rates by team member', '📈', 'strategy', 4)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Task Assignment Coordinator' AND a.function_name = 'Medical Affairs';

-- 3.39 Workflow Orchestration Agent
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Orchestrate the end-to-end publication workflow from data lock through manuscript submission', '🔄', 'strategy', 1),
  ('Coordinate the medical-legal-regulatory review process ensuring all approvals are obtained before deadline', '📋', 'compliance', 2),
  ('Manage the adverse event reporting workflow ensuring compliance with regulatory timelines', '⚠️', 'safety', 3),
  ('Track workflow status across concurrent medical affairs projects and identify dependencies', '📊', 'strategy', 4)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Workflow Orchestration Agent' AND a.function_name = 'Medical Affairs';

-- ============================================================================
-- PART 4: L4 WORKER STARTERS (Cross-Functional, used by MA)
-- Repetitive task automation starters
-- ============================================================================

-- These are already correctly classified - MA uses these cross-functional agents

-- 4.1 Approval Workflow Tracker (MA-specific L4)
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Track pending approvals for all medical affairs materials in the MLR review queue', '📋', 'compliance', 1),
  ('Generate a report of overdue approvals requiring escalation', '⚠️', 'compliance', 2),
  ('Send reminder notifications to reviewers with approaching approval deadlines', '📧', 'compliance', 3),
  ('Identify bottlenecks in the approval workflow and flag for management attention', '🔍', 'compliance', 4)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Approval Workflow Tracker' AND a.function_name = 'Medical Affairs';

-- 4.2 File Organization Assistant (MA-specific L4)
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Organize the clinical study documents folder according to TMF structure and naming conventions', '📁', 'compliance', 1),
  ('Archive completed project files and update the document index', '📦', 'compliance', 2),
  ('Validate file naming conventions and flag non-compliant documents', '✅', 'compliance', 3),
  ('Generate a folder inventory report showing document counts and last modified dates', '📊', 'compliance', 4)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'File Organization Assistant' AND a.function_name = 'Medical Affairs';

-- 4.3 Presentation Builder (MA-specific L4)
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Build a PowerPoint presentation from the clinical data tables using our approved scientific template', '📊', 'communications', 1),
  ('Format the advisory board slides according to corporate branding guidelines', '🎨', 'communications', 2),
  ('Create data visualizations from the efficacy results for the investigator meeting presentation', '📈', 'communications', 3),
  ('Generate a congress poster layout from the provided abstract and data tables', '🖼️', 'publications', 4)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Presentation Builder' AND a.function_name = 'Medical Affairs';

-- ============================================================================
-- PART 5: L5 TOOL AGENT STARTERS (Cross-Functional, used by MA)
-- Specific tool capability starters
-- ============================================================================

-- 5.1 Meeting Scheduler (MA-specific L5)
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Schedule an advisory board meeting for 10 KOLs across US and EU time zones', '📅', 'clinical', 1),
  ('Find available time slots for a cross-functional medical affairs planning meeting', '🔍', 'strategy', 2),
  ('Coordinate MSL territory meeting schedules avoiding conflicts with congress dates', '📆', 'clinical', 3),
  ('Send calendar invitations for the quarterly medical affairs review meeting', '📧', 'strategy', 4)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Meeting Scheduler' AND a.function_name = 'Medical Affairs';

-- 5.2 Version Comparison Tool (MA-specific L5)
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('Compare the current and previous versions of our investigator brochure highlighting all changes', '🔍', 'clinical', 1),
  ('Generate a redline comparison of the protocol amendment showing additions and deletions', '📄', 'clinical', 2),
  ('Track changes between manuscript draft versions for author review', '📝', 'publications', 3),
  ('Compare US and EU prescribing information versions to identify harmonization opportunities', '🌐', 'regulatory', 4)
) AS starter(text, icon, category, seq)
WHERE a.display_name = 'Version Comparison Tool' AND a.function_name = 'Medical Affairs';

-- ============================================================================
-- PART 6: VERIFICATION
-- ============================================================================

-- Verify starter counts per agent
DO $$
DECLARE
  agent_count INTEGER;
  starter_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO agent_count
  FROM agents WHERE function_name = 'Medical Affairs' AND status = 'active';

  SELECT COUNT(*) INTO starter_count
  FROM agent_prompt_starters aps
  JOIN agents a ON a.id = aps.agent_id
  WHERE a.function_name = 'Medical Affairs';

  RAISE NOTICE 'Medical Affairs Agents: %, Total Starters: %, Avg per Agent: %',
    agent_count, starter_count, ROUND(starter_count::numeric / agent_count, 1);
END $$;
