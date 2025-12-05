-- ============================================================================
-- Migration 029: Medical Affairs Agent Capabilities - Explicit Mapping
-- Date: 2025-12-02
-- Purpose: Explicitly assign capabilities to each MA agent based on role
-- ============================================================================
--
-- Approach:
--   - Uses explicit agent slug -> capability mappings
--   - No pattern matching (LIKE) - direct assignments
--   - Covers all 47 MA agents across 5 levels
--   - Includes proficiency levels based on agent tier
--
-- ============================================================================

-- ============================================================================
-- PART 1: ENSURE ALL REQUIRED CAPABILITIES EXIST
-- ============================================================================

INSERT INTO capabilities (name, description, category, created_at)
SELECT name, description, category, NOW()
FROM (VALUES
  -- Research Capabilities
  ('Literature Search', 'Search and retrieve scientific literature from PubMed, Cochrane, and other databases', 'research'),
  ('Systematic Review', 'Conduct systematic literature reviews following PRISMA guidelines', 'research'),
  ('Evidence Synthesis', 'Synthesize evidence from multiple sources into coherent summaries', 'research'),
  ('Meta-Analysis Support', 'Support statistical meta-analysis of clinical data', 'research'),

  -- Safety Capabilities
  ('Safety Monitoring', 'Monitor and assess drug safety signals from post-market surveillance', 'safety'),
  ('Adverse Event Processing', 'Process and code adverse event reports using MedDRA', 'safety'),
  ('Signal Detection', 'Detect and evaluate potential safety signals from FAERS and other sources', 'safety'),
  ('Benefit-Risk Assessment', 'Conduct benefit-risk assessments for regulatory submissions', 'safety'),
  ('Expedited Reporting', 'Manage expedited safety reporting requirements (15-day, 7-day)', 'safety'),

  -- Clinical Capabilities
  ('Clinical Trial Support', 'Support clinical trial design and operations', 'clinical'),
  ('Protocol Development', 'Assist in protocol development and amendments', 'clinical'),
  ('Medical Monitoring', 'Provide medical monitoring support for ongoing trials', 'clinical'),
  ('Site Selection Support', 'Support investigator and site selection processes', 'clinical'),

  -- Communication Capabilities
  ('Medical Writing', 'Write scientific manuscripts, abstracts, and medical documents', 'content'),
  ('Regulatory Writing', 'Write regulatory documents including CSRs, IBs, and submission dossiers', 'content'),
  ('Publication Management', 'Manage publication planning and manuscript workflows', 'content'),
  ('Congress Materials', 'Create posters, presentations, and congress materials', 'content'),
  ('Medical Information Response', 'Draft responses to medical information inquiries', 'content'),

  -- HEOR Capabilities
  ('HTA Analysis', 'Perform health technology assessments for NICE, SMC, ICER submissions', 'heor'),
  ('Cost-Effectiveness Modeling', 'Build and validate cost-effectiveness models', 'heor'),
  ('Budget Impact Analysis', 'Conduct budget impact analyses for payers', 'heor'),
  ('Value Dossier Development', 'Develop global value dossiers and AMCP dossiers', 'heor'),
  ('Real-World Evidence Analysis', 'Analyze real-world evidence from claims and EMR data', 'heor'),

  -- Engagement Capabilities
  ('KOL Engagement', 'Manage key opinion leader identification and engagement', 'engagement'),
  ('KOL Profiling', 'Profile and tier KOLs based on influence and expertise', 'engagement'),
  ('Advisory Board Support', 'Support advisory board planning and execution', 'engagement'),
  ('Congress Planning', 'Plan medical society congress engagement', 'engagement'),

  -- Education Capabilities
  ('CME Development', 'Develop continuing medical education programs', 'education'),
  ('Training Material Creation', 'Create training materials for internal and external audiences', 'education'),
  ('Speaker Training', 'Support speaker training and certification programs', 'education'),

  -- Strategy Capabilities
  ('Competitive Intelligence', 'Gather and analyze competitive intelligence', 'strategy'),
  ('Medical Strategy Development', 'Develop medical affairs strategies for products', 'strategy'),
  ('Launch Planning', 'Support medical launch planning and readiness', 'strategy'),
  ('Lifecycle Management', 'Support product lifecycle management decisions', 'strategy'),

  -- Operations Capabilities
  ('CRM Management', 'Manage MSL customer relationship data', 'operations'),
  ('Activity Logging', 'Log and track MSL/MA activities', 'operations'),
  ('SLA Tracking', 'Track service level agreements for medical inquiries', 'operations'),
  ('Resource Coordination', 'Coordinate resources across MA functions', 'operations'),

  -- Compliance Capabilities
  ('Regulatory Compliance', 'Ensure compliance with FDA, EMA, and global regulations', 'compliance'),
  ('MLR Review Support', 'Support medical/legal/regulatory review processes', 'compliance'),
  ('Fair Balance Review', 'Review promotional materials for fair balance', 'compliance'),

  -- Analysis Capabilities
  ('Data Analysis', 'Analyze clinical, safety, and commercial data', 'analysis'),
  ('Trend Analysis', 'Identify and analyze trends in medical data', 'analysis'),
  ('Reporting Dashboard', 'Generate reports and dashboard visualizations', 'analysis'),

  -- Tool Capabilities (L5)
  ('API Integration', 'Connect to external APIs (PubMed, FAERS, FDA, etc.)', 'tool'),
  ('Database Query', 'Execute queries against knowledge bases', 'tool'),
  ('Document Parsing', 'Parse and extract information from documents', 'tool'),
  ('Calculation Engine', 'Perform calculations and computations', 'tool')
) AS c(name, description, category)
WHERE NOT EXISTS (SELECT 1 FROM capabilities WHERE capabilities.name = c.name);

-- ============================================================================
-- PART 2: L1 MASTER CAPABILITIES
-- ============================================================================

-- VP Medical Affairs - Enterprise strategic capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L1 Master - strategic oversight'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'vp-medical-affairs'
  AND a.status = 'active'
  AND c.name IN (
    'Medical Strategy Development',
    'Resource Coordination',
    'Competitive Intelligence',
    'Launch Planning',
    'Lifecycle Management',
    'Regulatory Compliance',
    'Benefit-Risk Assessment'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- ============================================================================
-- PART 3: L2 EXPERT (DEPARTMENT HEAD) CAPABILITIES
-- ============================================================================

-- Head of MSL Operations
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-msl'
  AND a.status = 'active'
  AND c.name IN (
    'KOL Engagement',
    'KOL Profiling',
    'Advisory Board Support',
    'Congress Planning',
    'CRM Management',
    'Activity Logging',
    'Resource Coordination'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Head of Medical Information
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-medinfo'
  AND a.status = 'active'
  AND c.name IN (
    'Medical Information Response',
    'Literature Search',
    'Evidence Synthesis',
    'SLA Tracking',
    'Regulatory Compliance',
    'Fair Balance Review'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Head of Medical Communications
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-medcomms'
  AND a.status = 'active'
  AND c.name IN (
    'Medical Writing',
    'Publication Management',
    'Congress Materials',
    'Systematic Review',
    'Evidence Synthesis',
    'MLR Review Support'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Head of Pharmacovigilance
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-safety'
  AND a.status = 'active'
  AND c.name IN (
    'Safety Monitoring',
    'Adverse Event Processing',
    'Signal Detection',
    'Benefit-Risk Assessment',
    'Expedited Reporting',
    'Regulatory Compliance'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Head of HEOR
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-heor'
  AND a.status = 'active'
  AND c.name IN (
    'HTA Analysis',
    'Cost-Effectiveness Modeling',
    'Budget Impact Analysis',
    'Value Dossier Development',
    'Real-World Evidence Analysis',
    'Data Analysis'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Head of KOL Management
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-kol'
  AND a.status = 'active'
  AND c.name IN (
    'KOL Engagement',
    'KOL Profiling',
    'Advisory Board Support',
    'Congress Planning',
    'Competitive Intelligence',
    'Medical Strategy Development'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Head of Medical Education
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-meded'
  AND a.status = 'active'
  AND c.name IN (
    'CME Development',
    'Training Material Creation',
    'Speaker Training',
    'Congress Planning',
    'MLR Review Support'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Head of Medical Strategy
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'head-of-medstrategy'
  AND a.status = 'active'
  AND c.name IN (
    'Medical Strategy Development',
    'Competitive Intelligence',
    'Launch Planning',
    'Lifecycle Management',
    'Data Analysis',
    'Trend Analysis'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- ============================================================================
-- PART 4: L3 SPECIALIST CAPABILITIES
-- ============================================================================

-- MSL Specialist
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'msl-specialist'
  AND a.status = 'active'
  AND c.name IN (
    'KOL Engagement',
    'Literature Search',
    'Congress Planning',
    'Activity Logging',
    'Medical Information Response'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Medical Information Scientist
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'medinfo-scientist'
  AND a.status = 'active'
  AND c.name IN (
    'Medical Information Response',
    'Literature Search',
    'Evidence Synthesis',
    'SLA Tracking',
    'Regulatory Compliance'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Medical Writer
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'medical-writer'
  AND a.status = 'active'
  AND c.name IN (
    'Medical Writing',
    'Regulatory Writing',
    'Publication Management',
    'Evidence Synthesis',
    'Congress Materials'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Safety Scientist
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'safety-scientist'
  AND a.status = 'active'
  AND c.name IN (
    'Safety Monitoring',
    'Adverse Event Processing',
    'Signal Detection',
    'Benefit-Risk Assessment',
    'Literature Search'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Health Economist
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'health-economist'
  AND a.status = 'active'
  AND c.name IN (
    'HTA Analysis',
    'Cost-Effectiveness Modeling',
    'Budget Impact Analysis',
    'Real-World Evidence Analysis',
    'Data Analysis'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- KOL Strategist
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'kol-strategist'
  AND a.status = 'active'
  AND c.name IN (
    'KOL Engagement',
    'KOL Profiling',
    'Advisory Board Support',
    'Congress Planning',
    'Competitive Intelligence'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Medical Education Specialist
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'meded-specialist'
  AND a.status = 'active'
  AND c.name IN (
    'CME Development',
    'Training Material Creation',
    'Speaker Training',
    'Literature Search'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Medical Strategy Analyst
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'medstrategy-analyst'
  AND a.status = 'active'
  AND c.name IN (
    'Competitive Intelligence',
    'Medical Strategy Development',
    'Launch Planning',
    'Data Analysis',
    'Trend Analysis'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Medical Affairs Generalist
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'medaffairs-generalist'
  AND a.status = 'active'
  AND c.name IN (
    'Literature Search',
    'Evidence Synthesis',
    'Medical Information Response',
    'Data Analysis'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- ============================================================================
-- PART 5: L4 CONTEXT ENGINEER CAPABILITIES
-- ============================================================================

-- All context engineers get data retrieval capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Context Engineer'
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
  AND c.name IN (
    'Literature Search',
    'Database Query',
    'API Integration',
    'Document Parsing'
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Safety context engineer gets additional safety-specific
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', false, 'L4 Context Engineer - domain specific'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'safety-context-engineer'
  AND a.status = 'active'
  AND c.name IN ('Signal Detection', 'Adverse Event Processing')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- HEOR context engineer gets additional HEOR-specific
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', false, 'L4 Context Engineer - domain specific'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'heor-context-engineer'
  AND a.status = 'active'
  AND c.name IN ('HTA Analysis', 'Real-World Evidence Analysis')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- ============================================================================
-- PART 6: L4 WORKER CAPABILITIES
-- ============================================================================

-- MSL Activity Coordinator
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'msl-activity-coordinator'
  AND a.status = 'active'
  AND c.name IN ('Activity Logging', 'CRM Management', 'SLA Tracking')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Medical Information Specialist (Worker)
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'medical-information-specialist'
  AND a.status = 'active'
  AND c.name IN ('Medical Information Response', 'SLA Tracking', 'Activity Logging')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Publication Coordinator
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'publication-coordinator'
  AND a.status = 'active'
  AND c.name IN ('Publication Management', 'Activity Logging', 'SLA Tracking')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Safety Case Processor
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'safety-case-processor'
  AND a.status = 'active'
  AND c.name IN ('Adverse Event Processing', 'Expedited Reporting', 'Activity Logging')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- HEOR Coordinator
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'heor-coordinator'
  AND a.status = 'active'
  AND c.name IN ('Data Analysis', 'Activity Logging', 'SLA Tracking')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- KOL Engagement Coordinator
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'kol-engagement-coordinator'
  AND a.status = 'active'
  AND c.name IN ('KOL Engagement', 'Activity Logging', 'CRM Management')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- MedEd Coordinator
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'meded-coordinator'
  AND a.status = 'active'
  AND c.name IN ('CME Development', 'Activity Logging', 'SLA Tracking')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Strategy Coordinator
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'strategy-coordinator'
  AND a.status = 'active'
  AND c.name IN ('Competitive Intelligence', 'Activity Logging', 'Trend Analysis')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- ============================================================================
-- PART 7: L5 TOOL CAPABILITIES
-- ============================================================================

-- All L5 tools get API Integration and Database Query
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L5 Tool - core capability'
FROM agents a
CROSS JOIN capabilities c
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND a.status = 'active'
  AND c.name IN ('API Integration', 'Database Query')
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- PubMed Search Tool
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L5 Tool - domain specific'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'pubmed-search-tool'
  AND a.status = 'active'
  AND c.name = 'Literature Search'
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- FAERS Search Tool
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L5 Tool - domain specific'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'faers-search-tool'
  AND a.status = 'active'
  AND c.name = 'Signal Detection'
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- MedDRA Lookup Tool
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L5 Tool - domain specific'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'meddra-lookup-tool'
  AND a.status = 'active'
  AND c.name = 'Adverse Event Processing'
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- NICE Evidence Tool
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L5 Tool - domain specific'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'nice-evidence-tool'
  AND a.status = 'active'
  AND c.name = 'HTA Analysis'
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- Calculator Tool
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L5 Tool - domain specific'
FROM agents a
CROSS JOIN capabilities c
WHERE a.slug = 'calculator-tool'
  AND a.status = 'active'
  AND c.name = 'Calculation Engine'
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
  al.level_name,
  COUNT(DISTINCT a.id) as agents,
  COUNT(DISTINCT ac.id) as capability_links,
  ROUND(COUNT(DISTINCT ac.id)::numeric / NULLIF(COUNT(DISTINCT a.id), 0), 1) as avg_per_agent
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_capabilities ac ON ac.agent_id = a.id
WHERE a.function_name = 'Medical Affairs'
  AND a.status = 'active'
GROUP BY al.level_number, al.level_name
ORDER BY al.level_number;

-- Top capabilities by usage
SELECT
  c.name as capability,
  c.category,
  COUNT(ac.id) as agent_count
FROM capabilities c
JOIN agent_capabilities ac ON ac.capability_id = c.id
JOIN agents a ON ac.agent_id = a.id
WHERE a.function_name = 'Medical Affairs'
  AND a.status = 'active'
GROUP BY c.name, c.category
ORDER BY agent_count DESC
LIMIT 15;

-- Migration summary
SELECT
  'Migration 029: Capabilities' as migration,
  (SELECT COUNT(*) FROM capabilities) as total_capabilities,
  (SELECT COUNT(DISTINCT ac.agent_id)
   FROM agent_capabilities ac
   JOIN agents a ON ac.agent_id = a.id
   WHERE a.function_name = 'Medical Affairs' AND a.status = 'active') as ma_agents_with_capabilities,
  (SELECT COUNT(*)
   FROM agent_capabilities ac
   JOIN agents a ON ac.agent_id = a.id
   WHERE a.function_name = 'Medical Affairs' AND a.status = 'active') as total_links;
