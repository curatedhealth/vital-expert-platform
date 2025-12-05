-- ============================================================================
-- Migration 035: Medical Affairs Junction Tables - Combined Migration
-- Date: 2025-12-03
-- Purpose: Populate agent_capabilities for all MA agents
-- ============================================================================
--
-- ACTUAL Production capabilities schema (verified via REST API):
--   name, slug, description, capability_type, maturity_level, is_active,
--   function_name, department_name, tags, tenant_id
--
-- NOTE: maturity_level accepts: foundational, intermediate, advanced, expert
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: ENSURE REQUIRED CAPABILITIES EXIST
-- Using correct production schema (NOT the migration files which are wrong)
-- ============================================================================

-- Insert MA-specific capabilities if they don't exist
-- NOTE: maturity_level is of type expertise_level enum, must cast
-- NOTE: tags is text[] (PostgreSQL array), use '{tag1,tag2}'::text[] format
INSERT INTO capabilities (name, slug, description, capability_type, maturity_level, is_active, function_name, tags)
SELECT c.name, c.slug, c.description, c.capability_type, c.maturity_level::expertise_level, c.is_active, c.function_name, c.tags::text[]
FROM (VALUES
  -- Medical Affairs Strategic Capabilities (Expert level)
  ('Medical Affairs Leadership', 'medical-affairs-leadership', 'Strategic leadership of medical affairs functions across enterprise', 'strategic', 'expert', true, 'Medical Affairs', '{leadership,strategic}'),
  ('Cross-Functional Alignment', 'cross-functional-alignment', 'Align medical strategy with R&D, commercial, and regulatory functions', 'strategic', 'expert', true, 'Medical Affairs', '{leadership,strategic}'),

  -- MSL Capabilities
  ('Scientific Exchange', 'scientific-exchange', 'Conduct compliant scientific exchange with healthcare professionals', 'communication', 'advanced', true, 'Medical Affairs', '{field-medical,communication}'),
  ('Field Medical Insights', 'field-medical-insights', 'Collect and synthesize field medical insights from HCP interactions', 'analytics', 'advanced', true, 'Medical Affairs', '{field-medical,analytics}'),
  ('Territory Management', 'territory-management', 'Plan and optimize MSL territory coverage', 'operational', 'intermediate', true, 'Medical Affairs', '{field-medical,operational}'),

  -- Medical Information Capabilities
  ('Medical Inquiry Response', 'medical-inquiry-response', 'Draft accurate responses to medical inquiries from HCPs', 'communication', 'advanced', true, 'Medical Affairs', '{medical-information,communication}'),
  ('Literature Review', 'literature-review', 'Conduct systematic literature reviews', 'analytics', 'advanced', true, 'Medical Affairs', '{research,analytics}'),
  ('Response Library Management', 'response-library-management', 'Manage and update standard response libraries', 'operational', 'intermediate', true, 'Medical Affairs', '{medical-information,operational}'),

  -- Medical Communications Capabilities
  ('Publication Planning', 'publication-planning', 'Develop and execute publication strategies', 'strategic', 'advanced', true, 'Medical Affairs', '{publications,strategic}'),
  ('Manuscript Development', 'manuscript-development', 'Write and revise scientific manuscripts', 'communication', 'advanced', true, 'Medical Affairs', '{publications,communication}'),
  ('Congress Support', 'congress-support', 'Support medical society congress activities', 'operational', 'intermediate', true, 'Medical Affairs', '{field-medical,operational}'),

  -- Safety/Pharmacovigilance Capabilities
  ('Signal Detection', 'signal-detection', 'Detect and evaluate potential safety signals', 'analytics', 'expert', true, 'Medical Affairs', '{pharmacovigilance,analytics}'),
  ('Case Assessment', 'case-assessment', 'Assess individual case safety reports', 'analytics', 'advanced', true, 'Medical Affairs', '{pharmacovigilance,analytics}'),
  ('Aggregate Reporting', 'aggregate-reporting', 'Prepare aggregate safety reports (PSUR/PBRER)', 'regulatory', 'advanced', true, 'Medical Affairs', '{pharmacovigilance,regulatory}'),
  ('Pharmacovigilance Compliance', 'pharmacovigilance-compliance', 'Ensure PV regulatory compliance', 'regulatory', 'expert', true, 'Medical Affairs', '{pharmacovigilance,regulatory}'),

  -- HEOR Capabilities
  ('Health Economic Modeling', 'health-economic-modeling', 'Build cost-effectiveness and budget impact models', 'analytics', 'expert', true, 'Medical Affairs', '{HEOR,modeling}'),
  ('HTA Submission', 'hta-submission', 'Prepare HTA submissions (NICE, SMC, ICER)', 'regulatory', 'advanced', true, 'Medical Affairs', '{HEOR,regulatory}'),
  ('Value Communication', 'value-communication', 'Communicate value propositions to payers', 'communication', 'advanced', true, 'Medical Affairs', '{HEOR,communication}'),

  -- KOL Management Capabilities
  ('KOL Identification', 'kol-identification', 'Identify and profile key opinion leaders', 'analytics', 'intermediate', true, 'Medical Affairs', '{KOL,analytics}'),
  ('Advisory Board Management', 'advisory-board-management', 'Plan and execute advisory board meetings', 'operational', 'advanced', true, 'Medical Affairs', '{KOL,operational}'),
  ('Speaker Management', 'speaker-management', 'Manage speaker bureau and training', 'operational', 'intermediate', true, 'Medical Affairs', '{KOL,operational}'),

  -- Medical Education Capabilities
  ('CME Program Development', 'cme-program-development', 'Develop CME/CPD accredited programs', 'operational', 'advanced', true, 'Medical Affairs', '{education,operational}'),
  ('Medical Training', 'medical-training', 'Deliver medical training to internal teams', 'communication', 'intermediate', true, 'Medical Affairs', '{education,communication}'),

  -- Medical Strategy Capabilities
  ('Competitive Intelligence', 'competitive-intelligence', 'Analyze competitive landscape and pipeline', 'analytics', 'advanced', true, 'Medical Affairs', '{strategy,analytics}'),
  ('Launch Planning', 'launch-planning', 'Plan medical launch activities', 'strategic', 'advanced', true, 'Medical Affairs', '{strategy,strategic}'),

  -- Technical Capabilities (L4/L5)
  ('Data Retrieval', 'data-retrieval', 'Retrieve data from databases and APIs', 'operational', 'intermediate', true, 'Medical Affairs', '{technical,operational}'),
  ('Query Execution', 'query-execution', 'Execute queries against data sources', 'operational', 'foundational', true, 'Medical Affairs', '{technical,operational}'),
  ('Context Assembly', 'context-assembly', 'Assemble context from multiple sources', 'operational', 'intermediate', true, 'Medical Affairs', '{technical,operational}')
) AS c(name, slug, description, capability_type, maturity_level, is_active, function_name, tags)
WHERE NOT EXISTS (SELECT 1 FROM capabilities WHERE capabilities.slug = c.slug);

-- ============================================================================
-- PART 2: AGENT CAPABILITIES - L1 MASTER
-- ============================================================================

-- VP Medical Affairs
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'expert', 0.95, true, 'Core L1 capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'vp-medical-affairs'
  AND a.status = 'active'
  AND c.slug IN ('medical-affairs-leadership', 'cross-functional-alignment')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- ============================================================================
-- PART 3: AGENT CAPABILITIES - L2 EXPERTS
-- ============================================================================

-- Head of MSL
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'expert', 0.90,
  CASE WHEN c.slug IN ('scientific-exchange', 'field-medical-insights') THEN true ELSE false END,
  'L2 department head capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-msl'
  AND a.status = 'active'
  AND c.slug IN ('scientific-exchange', 'field-medical-insights', 'territory-management', 'kol-identification')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Head of Medical Information
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'expert', 0.90,
  CASE WHEN c.slug IN ('medical-inquiry-response', 'response-library-management') THEN true ELSE false END,
  'L2 department head capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-medinfo'
  AND a.status = 'active'
  AND c.slug IN ('medical-inquiry-response', 'literature-review', 'response-library-management')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Head of Medical Communications
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'expert', 0.90,
  CASE WHEN c.slug IN ('publication-planning', 'manuscript-development') THEN true ELSE false END,
  'L2 department head capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-medcomms'
  AND a.status = 'active'
  AND c.slug IN ('publication-planning', 'manuscript-development', 'congress-support')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Head of Pharmacovigilance
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'expert', 0.90,
  CASE WHEN c.slug IN ('signal-detection', 'pharmacovigilance-compliance') THEN true ELSE false END,
  'L2 department head capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-safety'
  AND a.status = 'active'
  AND c.slug IN ('signal-detection', 'case-assessment', 'aggregate-reporting', 'pharmacovigilance-compliance')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Head of HEOR
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'expert', 0.90,
  CASE WHEN c.slug IN ('health-economic-modeling', 'hta-submission') THEN true ELSE false END,
  'L2 department head capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-heor'
  AND a.status = 'active'
  AND c.slug IN ('health-economic-modeling', 'hta-submission', 'value-communication')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Head of KOL Management
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'expert', 0.90,
  CASE WHEN c.slug IN ('kol-identification', 'advisory-board-management') THEN true ELSE false END,
  'L2 department head capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-kol'
  AND a.status = 'active'
  AND c.slug IN ('kol-identification', 'advisory-board-management', 'speaker-management')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Head of Medical Education
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'expert', 0.90,
  CASE WHEN c.slug IN ('cme-program-development', 'medical-training') THEN true ELSE false END,
  'L2 department head capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-meded'
  AND a.status = 'active'
  AND c.slug IN ('cme-program-development', 'medical-training')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Head of Medical Strategy
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'expert', 0.90,
  CASE WHEN c.slug IN ('competitive-intelligence', 'launch-planning') THEN true ELSE false END,
  'L2 department head capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-medstrategy'
  AND a.status = 'active'
  AND c.slug IN ('competitive-intelligence', 'launch-planning', 'cross-functional-alignment')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- ============================================================================
-- PART 4: AGENT CAPABILITIES - L3 SPECIALISTS
-- ============================================================================

-- MSL Specialist
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'advanced', 0.80,
  CASE WHEN c.slug = 'scientific-exchange' THEN true ELSE false END,
  'L3 specialist capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'msl-specialist'
  AND a.status = 'active'
  AND c.slug IN ('scientific-exchange', 'field-medical-insights')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Medical Information Scientist
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'advanced', 0.80,
  CASE WHEN c.slug = 'medical-inquiry-response' THEN true ELSE false END,
  'L3 specialist capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'medinfo-scientist'
  AND a.status = 'active'
  AND c.slug IN ('medical-inquiry-response', 'literature-review')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Medical Writer
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'advanced', 0.80,
  CASE WHEN c.slug = 'manuscript-development' THEN true ELSE false END,
  'L3 specialist capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'medical-writer'
  AND a.status = 'active'
  AND c.slug IN ('manuscript-development', 'publication-planning')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Safety Scientist
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'advanced', 0.80,
  CASE WHEN c.slug = 'signal-detection' THEN true ELSE false END,
  'L3 specialist capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'safety-scientist'
  AND a.status = 'active'
  AND c.slug IN ('signal-detection', 'case-assessment')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Health Economist
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'advanced', 0.80,
  CASE WHEN c.slug = 'health-economic-modeling' THEN true ELSE false END,
  'L3 specialist capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'health-economist'
  AND a.status = 'active'
  AND c.slug IN ('health-economic-modeling', 'hta-submission')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- KOL Strategist
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'advanced', 0.80,
  CASE WHEN c.slug = 'kol-identification' THEN true ELSE false END,
  'L3 specialist capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'kol-strategist'
  AND a.status = 'active'
  AND c.slug IN ('kol-identification', 'advisory-board-management')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Medical Education Specialist
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'advanced', 0.80,
  CASE WHEN c.slug = 'cme-program-development' THEN true ELSE false END,
  'L3 specialist capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'meded-specialist'
  AND a.status = 'active'
  AND c.slug IN ('cme-program-development', 'medical-training')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Medical Strategy Analyst
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'advanced', 0.80,
  CASE WHEN c.slug = 'competitive-intelligence' THEN true ELSE false END,
  'L3 specialist capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'medstrategy-analyst'
  AND a.status = 'active'
  AND c.slug IN ('competitive-intelligence', 'launch-planning')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Medical Affairs Generalist
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'advanced', 0.75, false, 'L3 generalist capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'medaffairs-generalist'
  AND a.status = 'active'
  AND c.slug IN ('literature-review', 'medical-inquiry-response', 'medical-training')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- ============================================================================
-- PART 5: AGENT CAPABILITIES - L4 CONTEXT ENGINEERS
-- ============================================================================

-- All context engineers get data retrieval and context assembly capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'advanced', 0.85, true, 'L4 context engineer core capability'
FROM agents a
CROSS JOIN capabilities c
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
  AND c.slug IN ('data-retrieval', 'context-assembly')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- ============================================================================
-- PART 6: AGENT CAPABILITIES - L4 WORKERS
-- ============================================================================

-- L4 Workers get operational capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'intermediate', 0.70, true, 'L4 worker capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 4 LIMIT 1)
  AND a.slug NOT LIKE '%context-engineer%'
  AND a.status = 'active'
  AND c.slug = 'data-retrieval'
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- ============================================================================
-- PART 7: AGENT CAPABILITIES - L5 TOOLS
-- ============================================================================

-- L5 Tools get query execution capability
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, proficiency_score, is_primary, notes)
SELECT a.id, c.id, 'expert', 0.95, true, 'L5 tool capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND a.status = 'active'
  AND c.slug = 'query-execution'
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- ============================================================================
-- PART 8: VERIFICATION
-- ============================================================================

-- Summary by level
SELECT
  al.level_number,
  COUNT(DISTINCT a.id) as agents,
  COUNT(DISTINCT ac.id) as capability_links,
  ROUND(COUNT(DISTINCT ac.id)::numeric / NULLIF(COUNT(DISTINCT a.id), 0), 1) as avg_capabilities_per_agent
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_capabilities ac ON ac.agent_id = a.id
WHERE a.function_name = 'Medical Affairs'
  AND a.status = 'active'
GROUP BY al.level_number
ORDER BY al.level_number;

-- Top capabilities by assignment count
SELECT
  c.name,
  c.capability_type,
  COUNT(ac.id) as agent_count
FROM capabilities c
LEFT JOIN agent_capabilities ac ON ac.capability_id = c.id
LEFT JOIN agents a ON ac.agent_id = a.id AND a.function_name = 'Medical Affairs' AND a.status = 'active'
WHERE ac.id IS NOT NULL
GROUP BY c.name, c.capability_type
ORDER BY agent_count DESC
LIMIT 10;

-- Migration summary
SELECT
  'Migration 035: Junction Tables' as migration,
  (SELECT COUNT(*) FROM capabilities) as total_capabilities,
  (SELECT COUNT(DISTINCT ac.agent_id)
   FROM agent_capabilities ac
   JOIN agents a ON ac.agent_id = a.id
   WHERE a.function_name = 'Medical Affairs' AND a.status = 'active') as ma_agents_with_capabilities,
  (SELECT COUNT(*)
   FROM agent_capabilities ac
   JOIN agents a ON ac.agent_id = a.id
   WHERE a.function_name = 'Medical Affairs' AND a.status = 'active') as total_capability_links;

COMMIT;
