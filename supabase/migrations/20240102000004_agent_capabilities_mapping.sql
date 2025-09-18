-- Map agents to their capabilities with proficiency levels
-- This script assumes agents have been created from the previous seed file

-- FDA Regulatory Navigator capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'fda-guidance' THEN 'expert'
    WHEN 'regulatory-strategy' THEN 'expert'
    WHEN 'regulatory-submission' THEN 'expert'
    WHEN 'regulatory-writing' THEN 'advanced'
    WHEN 'regulatory-intelligence' THEN 'advanced'
    WHEN 'regulatory-fundamentals' THEN 'expert'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'fda-guidance' THEN true
    WHEN 'regulatory-strategy' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'fda-regulatory-navigator'
AND c.name IN ('fda-guidance', 'regulatory-strategy', 'regulatory-submission', 'regulatory-writing', 'regulatory-intelligence', 'regulatory-fundamentals');

-- Clinical Trial Architect capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'protocol-design' THEN 'expert'
    WHEN 'endpoints-selection' THEN 'expert'
    WHEN 'biostatistics' THEN 'expert'
    WHEN 'clinical-writing' THEN 'advanced'
    WHEN 'regulatory-fundamentals' THEN 'intermediate'
    WHEN 'clinical-fundamentals' THEN 'expert'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'protocol-design' THEN true
    WHEN 'endpoints-selection' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'clinical-trial-architect'
AND c.name IN ('protocol-design', 'endpoints-selection', 'biostatistics', 'clinical-writing', 'regulatory-fundamentals', 'clinical-fundamentals');

-- Reimbursement Strategist capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'health-economics' THEN 'expert'
    WHEN 'payer-engagement' THEN 'expert'
    WHEN 'budget-impact' THEN 'expert'
    WHEN 'hta-submission' THEN 'advanced'
    WHEN 'market-access-fundamentals' THEN 'expert'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'health-economics' THEN true
    WHEN 'payer-engagement' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'reimbursement-strategist'
AND c.name IN ('health-economics', 'payer-engagement', 'budget-impact', 'hta-submission', 'market-access-fundamentals');

-- Medical Writer Pro capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'medical-writing' THEN 'expert'
    WHEN 'regulatory-writing' THEN 'expert'
    WHEN 'clinical-writing' THEN 'expert'
    WHEN 'publication-writing' THEN 'advanced'
    WHEN 'regulatory-fundamentals' THEN 'advanced'
    WHEN 'clinical-fundamentals' THEN 'advanced'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'medical-writing' THEN true
    WHEN 'regulatory-writing' THEN true
    WHEN 'clinical-writing' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'medical-writer-pro'
AND c.name IN ('medical-writing', 'regulatory-writing', 'clinical-writing', 'publication-writing', 'regulatory-fundamentals', 'clinical-fundamentals');

-- EMA/EU Regulatory Specialist capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'ema-guidance' THEN 'expert'
    WHEN 'regulatory-strategy' THEN 'expert'
    WHEN 'regulatory-submission' THEN 'expert'
    WHEN 'global-harmonization' THEN 'advanced'
    WHEN 'regulatory-writing' THEN 'advanced'
    WHEN 'regulatory-fundamentals' THEN 'expert'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'ema-guidance' THEN true
    WHEN 'regulatory-strategy' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'ema-eu-regulatory-specialist'
AND c.name IN ('ema-guidance', 'regulatory-strategy', 'regulatory-submission', 'global-harmonization', 'regulatory-writing', 'regulatory-fundamentals');

-- Clinical Evidence Synthesizer capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'literature-review' THEN 'expert'
    WHEN 'meta-analysis' THEN 'expert'
    WHEN 'evidence-synthesis' THEN 'expert'
    WHEN 'biostatistics' THEN 'advanced'
    WHEN 'clinical-fundamentals' THEN 'expert'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'literature-review' THEN true
    WHEN 'evidence-synthesis' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'clinical-evidence-synthesizer'
AND c.name IN ('literature-review', 'meta-analysis', 'evidence-synthesis', 'biostatistics', 'clinical-fundamentals');

-- Real-World Evidence Analyst capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'rwe-analysis' THEN 'expert'
    WHEN 'biostatistics' THEN 'expert'
    WHEN 'evidence-synthesis' THEN 'advanced'
    WHEN 'health-economics' THEN 'intermediate'
    WHEN 'clinical-fundamentals' THEN 'expert'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'rwe-analysis' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'real-world-evidence-analyst'
AND c.name IN ('rwe-analysis', 'biostatistics', 'evidence-synthesis', 'health-economics', 'clinical-fundamentals');

-- Regulatory Intelligence Monitor capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'regulatory-intelligence' THEN 'expert'
    WHEN 'market-intelligence' THEN 'advanced'
    WHEN 'competitive-analysis' THEN 'advanced'
    WHEN 'regulatory-fundamentals' THEN 'expert'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'regulatory-intelligence' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'regulatory-intelligence-monitor'
AND c.name IN ('regulatory-intelligence', 'market-intelligence', 'competitive-analysis', 'regulatory-fundamentals');

-- Digital Biomarker Specialist capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'digital-biomarkers' THEN 'expert'
    WHEN 'digital-endpoints' THEN 'expert'
    WHEN 'endpoints-selection' THEN 'advanced'
    WHEN 'biostatistics' THEN 'advanced'
    WHEN 'digital-health-fundamentals' THEN 'expert'
    WHEN 'clinical-fundamentals' THEN 'advanced'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'digital-biomarkers' THEN true
    WHEN 'digital-endpoints' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'digital-biomarker-specialist'
AND c.name IN ('digital-biomarkers', 'digital-endpoints', 'endpoints-selection', 'biostatistics', 'digital-health-fundamentals', 'clinical-fundamentals');

-- HTA Submission Expert capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'hta-submission' THEN 'expert'
    WHEN 'health-economics' THEN 'expert'
    WHEN 'evidence-synthesis' THEN 'advanced'
    WHEN 'medical-writing' THEN 'advanced'
    WHEN 'market-access-fundamentals' THEN 'expert'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'hta-submission' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'hta-submission-expert'
AND c.name IN ('hta-submission', 'health-economics', 'evidence-synthesis', 'medical-writing', 'market-access-fundamentals');

-- Competitive Intelligence Analyst capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'competitive-analysis' THEN 'expert'
    WHEN 'market-intelligence' THEN 'expert'
    WHEN 'literature-review' THEN 'advanced'
    WHEN 'regulatory-intelligence' THEN 'intermediate'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'competitive-analysis' THEN true
    WHEN 'market-intelligence' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'competitive-intelligence-analyst'
AND c.name IN ('competitive-analysis', 'market-intelligence', 'literature-review', 'regulatory-intelligence');

-- KOL Relationship Manager capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'kol-identification' THEN 'expert'
    WHEN 'market-intelligence' THEN 'advanced'
    WHEN 'literature-review' THEN 'intermediate'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'kol-identification' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'kol-relationship-manager'
AND c.name IN ('kol-identification', 'market-intelligence', 'literature-review');

-- Business Development Scout capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'partnership-scouting' THEN 'expert'
    WHEN 'market-intelligence' THEN 'advanced'
    WHEN 'competitive-analysis' THEN 'advanced'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'partnership-scouting' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'business-development-scout'
AND c.name IN ('partnership-scouting', 'market-intelligence', 'competitive-analysis');

-- Quality & Compliance Auditor capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'gxp-compliance' THEN 'expert'
    WHEN 'quality-auditing' THEN 'expert'
    WHEN 'risk-assessment' THEN 'advanced'
    WHEN 'compliance-fundamentals' THEN 'expert'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'gxp-compliance' THEN true
    WHEN 'quality-auditing' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'quality-compliance-auditor'
AND c.name IN ('gxp-compliance', 'quality-auditing', 'risk-assessment', 'compliance-fundamentals');

-- Safety & Pharmacovigilance Monitor capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'pharmacovigilance' THEN 'expert'
    WHEN 'risk-assessment' THEN 'advanced'
    WHEN 'regulatory-fundamentals' THEN 'advanced'
    WHEN 'compliance-fundamentals' THEN 'advanced'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'pharmacovigilance' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'safety-pharmacovigilance-monitor'
AND c.name IN ('pharmacovigilance', 'risk-assessment', 'regulatory-fundamentals', 'compliance-fundamentals');

-- Data Analytics Orchestrator capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'biostatistics' THEN 'expert'
    WHEN 'rwe-analysis' THEN 'expert'
    WHEN 'meta-analysis' THEN 'expert'
    WHEN 'evidence-synthesis' THEN 'advanced'
    WHEN 'clinical-fundamentals' THEN 'advanced'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'biostatistics' THEN true
    WHEN 'rwe-analysis' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'data-analytics-orchestrator'
AND c.name IN ('biostatistics', 'rwe-analysis', 'meta-analysis', 'evidence-synthesis', 'clinical-fundamentals');

-- Digital Therapeutics Advisor capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'dtx-guidance' THEN 'expert'
    WHEN 'digital-endpoints' THEN 'advanced'
    WHEN 'regulatory-fundamentals' THEN 'advanced'
    WHEN 'digital-health-fundamentals' THEN 'expert'
    WHEN 'clinical-fundamentals' THEN 'intermediate'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'dtx-guidance' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'digital-therapeutics-advisor'
AND c.name IN ('dtx-guidance', 'digital-endpoints', 'regulatory-fundamentals', 'digital-health-fundamentals', 'clinical-fundamentals');

-- AI/ML Medical Device Specialist capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'ai-ml-validation' THEN 'expert'
    WHEN 'digital-biomarkers' THEN 'advanced'
    WHEN 'regulatory-fundamentals' THEN 'advanced'
    WHEN 'digital-health-fundamentals' THEN 'expert'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'ai-ml-validation' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'ai-ml-medical-device-specialist'
AND c.name IN ('ai-ml-validation', 'digital-biomarkers', 'regulatory-fundamentals', 'digital-health-fundamentals');

-- Patient Engagement Designer capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'patient-engagement' THEN 'expert'
    WHEN 'digital-health-fundamentals' THEN 'advanced'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'patient-engagement' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'patient-engagement-designer'
AND c.name IN ('patient-engagement', 'digital-health-fundamentals');

-- Global Regulatory Harmonizer capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  a.id, c.id,
  CASE c.name
    WHEN 'global-harmonization' THEN 'expert'
    WHEN 'fda-guidance' THEN 'advanced'
    WHEN 'ema-guidance' THEN 'advanced'
    WHEN 'regulatory-strategy' THEN 'expert'
    WHEN 'regulatory-intelligence' THEN 'advanced'
    WHEN 'regulatory-fundamentals' THEN 'expert'
    ELSE 'intermediate'
  END as proficiency_level,
  CASE c.name
    WHEN 'global-harmonization' THEN true
    WHEN 'regulatory-strategy' THEN true
    ELSE false
  END as is_primary
FROM agents a, capabilities c
WHERE a.name = 'global-regulatory-harmonizer'
AND c.name IN ('global-harmonization', 'fda-guidance', 'ema-guidance', 'regulatory-strategy', 'regulatory-intelligence', 'regulatory-fundamentals');