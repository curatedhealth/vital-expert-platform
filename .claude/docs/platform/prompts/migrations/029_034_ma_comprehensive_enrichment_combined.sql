-- ============================================================================
-- COMBINED MIGRATION: Medical Affairs Comprehensive Agent Enrichment
-- Migrations 029-034 Combined for Single Execution
-- Date: 2025-12-02
-- ============================================================================
--
-- This file combines migrations 029-034 for comprehensive MA agent enrichment:
--   029: Agent Capabilities (explicit mapping)
--   030: Agent Skills (explicit mapping)
--   031: Agent Responsibilities (role-specific)
--   032: Prompt Starters (department-specific)
--   033: 6-Section Prompt Fields (full framework)
--   034: Additional Metadata (experience, certifications, tokens, escalation)
--
-- Total: 47 MA agents across 5 levels (L1-L5)
--
-- EXECUTION:
--   psql -f 029_034_ma_comprehensive_enrichment_combined.sql
--
-- ============================================================================

-- Start transaction for atomic execution
BEGIN;

-- ============================================================================
-- ============================================================================
-- MIGRATION 029: AGENT CAPABILITIES (EXPLICIT MAPPING)
-- ============================================================================
-- ============================================================================

-- Progress indicator
SELECT '=== Starting Migration 029: Agent Capabilities ===' AS status;

-- PART 1: ENSURE ALL REQUIRED CAPABILITIES EXIST
-- Using correct schema: name, slug, description, capability_type, category, complexity_level, is_public, metadata
INSERT INTO capabilities (name, slug, description, capability_type, category, complexity_level, is_public, metadata)
VALUES
  ('Literature Search', 'literature-search', 'Search and retrieve scientific literature from PubMed, Cochrane, and other databases', 'agent', 'research', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Research"}'),
  ('Systematic Review', 'systematic-review', 'Conduct systematic literature reviews following PRISMA guidelines', 'agent', 'research', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Research"}'),
  ('Evidence Synthesis', 'evidence-synthesis', 'Synthesize evidence from multiple sources into coherent summaries', 'agent', 'research', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Research"}'),
  ('Meta-Analysis Support', 'meta-analysis-support', 'Support statistical meta-analysis of clinical data', 'agent', 'research', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Research"}'),
  ('Safety Monitoring', 'safety-monitoring', 'Monitor and assess drug safety signals from post-market surveillance', 'agent', 'regulatory', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Safety"}'),
  ('Adverse Event Processing', 'adverse-event-processing', 'Process and code adverse event reports using MedDRA', 'agent', 'regulatory', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Safety"}'),
  ('Signal Detection', 'signal-detection', 'Detect and evaluate potential safety signals from FAERS and other sources', 'agent', 'regulatory', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Safety"}'),
  ('Benefit-Risk Assessment', 'benefit-risk-assessment', 'Conduct benefit-risk assessments for regulatory submissions', 'agent', 'regulatory', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Safety"}'),
  ('Expedited Reporting', 'expedited-reporting', 'Manage expedited safety reporting requirements (15-day, 7-day)', 'agent', 'regulatory', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Safety"}'),
  ('Clinical Trial Support', 'clinical-trial-support', 'Support clinical trial design and operations', 'agent', 'clinical', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Clinical"}'),
  ('Protocol Development', 'protocol-development', 'Assist in protocol development and amendments', 'agent', 'clinical', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Clinical"}'),
  ('Medical Monitoring', 'medical-monitoring', 'Provide medical monitoring support for ongoing trials', 'agent', 'clinical', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Clinical"}'),
  ('Site Selection Support', 'site-selection-support', 'Support investigator and site selection processes', 'agent', 'clinical', 'intermediate', true, '{"function": "Medical Affairs", "subcategory": "Clinical"}'),
  ('Medical Writing', 'medical-writing', 'Write scientific manuscripts, abstracts, and medical documents', 'agent', 'communication', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Content"}'),
  ('Regulatory Writing', 'regulatory-writing', 'Write regulatory documents including CSRs, IBs, and submission dossiers', 'agent', 'regulatory', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Content"}'),
  ('Publication Management', 'publication-management', 'Manage publication planning and manuscript workflows', 'agent', 'communication', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Content"}'),
  ('Congress Materials', 'congress-materials', 'Create posters, presentations, and congress materials', 'agent', 'communication', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Content"}'),
  ('Medical Information Response', 'medical-information-response', 'Draft responses to medical information inquiries', 'agent', 'communication', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Content"}'),
  ('HTA Analysis', 'hta-analysis', 'Perform health technology assessments for NICE, SMC, ICER submissions', 'agent', 'strategic', 'expert', true, '{"function": "Medical Affairs", "subcategory": "HEOR"}'),
  ('Cost-Effectiveness Modeling', 'cost-effectiveness-modeling', 'Build and validate cost-effectiveness models', 'agent', 'strategic', 'expert', true, '{"function": "Medical Affairs", "subcategory": "HEOR"}'),
  ('Budget Impact Analysis', 'budget-impact-analysis', 'Conduct budget impact analyses for payers', 'agent', 'strategic', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "HEOR"}'),
  ('Value Dossier Development', 'value-dossier-development', 'Develop global value dossiers and AMCP dossiers', 'agent', 'strategic', 'expert', true, '{"function": "Medical Affairs", "subcategory": "HEOR"}'),
  ('Real-World Evidence Analysis', 'real-world-evidence-analysis', 'Analyze real-world evidence from claims and EMR data', 'agent', 'research', 'expert', true, '{"function": "Medical Affairs", "subcategory": "HEOR"}'),
  ('KOL Engagement', 'kol-engagement', 'Manage key opinion leader identification and engagement', 'agent', 'communication', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Engagement"}'),
  ('KOL Profiling', 'kol-profiling', 'Profile and tier KOLs based on influence and expertise', 'agent', 'communication', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Engagement"}'),
  ('Advisory Board Support', 'advisory-board-support', 'Support advisory board planning and execution', 'agent', 'communication', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Engagement"}'),
  ('Congress Planning', 'congress-planning', 'Plan medical society congress engagement', 'agent', 'operational', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Engagement"}'),
  ('CME Development', 'cme-development', 'Develop continuing medical education programs', 'agent', 'communication', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Education"}'),
  ('Training Material Creation', 'training-material-creation', 'Create training materials for internal and external audiences', 'agent', 'communication', 'intermediate', true, '{"function": "Medical Affairs", "subcategory": "Education"}'),
  ('Speaker Training', 'speaker-training', 'Support speaker training and certification programs', 'agent', 'communication', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Education"}'),
  ('Competitive Intelligence', 'competitive-intelligence', 'Gather and analyze competitive intelligence', 'agent', 'strategic', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Strategy"}'),
  ('Medical Strategy Development', 'medical-strategy-development', 'Develop medical affairs strategies for products', 'agent', 'strategic', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Strategy"}'),
  ('Launch Planning', 'launch-planning', 'Support medical launch planning and readiness', 'agent', 'strategic', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Strategy"}'),
  ('Lifecycle Management', 'lifecycle-management', 'Support product lifecycle management decisions', 'agent', 'strategic', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Strategy"}'),
  ('CRM Management', 'crm-management', 'Manage MSL customer relationship data', 'agent', 'operational', 'intermediate', true, '{"function": "Medical Affairs", "subcategory": "Operations"}'),
  ('Activity Logging', 'activity-logging', 'Log and track MSL/MA activities', 'agent', 'operational', 'intermediate', true, '{"function": "Medical Affairs", "subcategory": "Operations"}'),
  ('SLA Tracking', 'sla-tracking', 'Track service level agreements for medical inquiries', 'agent', 'operational', 'intermediate', true, '{"function": "Medical Affairs", "subcategory": "Operations"}'),
  ('Resource Coordination', 'resource-coordination', 'Coordinate resources across MA functions', 'agent', 'operational', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Operations"}'),
  ('Regulatory Compliance', 'regulatory-compliance', 'Ensure compliance with FDA, EMA, and global regulations', 'agent', 'regulatory', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Compliance"}'),
  ('MLR Review Support', 'mlr-review-support', 'Support medical/legal/regulatory review processes', 'agent', 'regulatory', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Compliance"}'),
  ('Fair Balance Review', 'fair-balance-review', 'Review promotional materials for fair balance', 'agent', 'regulatory', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Compliance"}'),
  ('Data Analysis', 'data-analysis', 'Analyze clinical, safety, and commercial data', 'agent', 'research', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Analysis"}'),
  ('Trend Analysis', 'trend-analysis', 'Identify and analyze trends in medical data', 'agent', 'research', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Analysis"}'),
  ('Reporting Dashboard', 'reporting-dashboard', 'Generate reports and dashboard visualizations', 'agent', 'operational', 'intermediate', true, '{"function": "Medical Affairs", "subcategory": "Analysis"}'),
  ('API Integration', 'api-integration', 'Connect to external APIs (PubMed, FAERS, FDA, etc.)', 'tool', 'operational', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Tool"}'),
  ('Database Query', 'database-query', 'Execute queries against knowledge bases', 'tool', 'operational', 'intermediate', true, '{"function": "Medical Affairs", "subcategory": "Tool"}'),
  ('Document Parsing', 'document-parsing', 'Parse and extract information from documents', 'tool', 'operational', 'intermediate', true, '{"function": "Medical Affairs", "subcategory": "Tool"}'),
  ('Calculation Engine', 'calculation-engine', 'Perform calculations and computations', 'tool', 'operational', 'intermediate', true, '{"function": "Medical Affairs", "subcategory": "Tool"}')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  complexity_level = EXCLUDED.complexity_level,
  metadata = EXCLUDED.metadata;

-- L1 MASTER CAPABILITIES (VP Medical Affairs)
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L1 Master - strategic oversight'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'vp-medical-affairs' AND a.status = 'active'
  AND c.name IN ('Medical Strategy Development', 'Resource Coordination', 'Competitive Intelligence', 'Launch Planning', 'Lifecycle Management', 'Regulatory Compliance', 'Benefit-Risk Assessment')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

-- L2 EXPERT CAPABILITIES
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'head-of-msl' AND a.status = 'active'
  AND c.name IN ('KOL Engagement', 'KOL Profiling', 'Advisory Board Support', 'Congress Planning', 'CRM Management', 'Activity Logging', 'Resource Coordination')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'head-of-medinfo' AND a.status = 'active'
  AND c.name IN ('Medical Information Response', 'Literature Search', 'Evidence Synthesis', 'SLA Tracking', 'Regulatory Compliance', 'Fair Balance Review')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'head-of-medcomms' AND a.status = 'active'
  AND c.name IN ('Medical Writing', 'Publication Management', 'Congress Materials', 'Systematic Review', 'Evidence Synthesis', 'MLR Review Support')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'head-of-safety' AND a.status = 'active'
  AND c.name IN ('Safety Monitoring', 'Adverse Event Processing', 'Signal Detection', 'Benefit-Risk Assessment', 'Expedited Reporting', 'Regulatory Compliance')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'head-of-heor' AND a.status = 'active'
  AND c.name IN ('HTA Analysis', 'Cost-Effectiveness Modeling', 'Budget Impact Analysis', 'Value Dossier Development', 'Real-World Evidence Analysis', 'Data Analysis')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'head-of-kol' AND a.status = 'active'
  AND c.name IN ('KOL Engagement', 'KOL Profiling', 'Advisory Board Support', 'Congress Planning', 'Competitive Intelligence', 'Medical Strategy Development')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'head-of-meded' AND a.status = 'active'
  AND c.name IN ('CME Development', 'Training Material Creation', 'Speaker Training', 'Congress Planning', 'MLR Review Support')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L2 Expert - department lead'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'head-of-medstrategy' AND a.status = 'active'
  AND c.name IN ('Medical Strategy Development', 'Competitive Intelligence', 'Launch Planning', 'Lifecycle Management', 'Data Analysis', 'Trend Analysis')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

-- L3 SPECIALIST CAPABILITIES
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'msl-specialist' AND a.status = 'active'
  AND c.name IN ('KOL Engagement', 'Literature Search', 'Congress Planning', 'Activity Logging', 'Medical Information Response')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'medinfo-scientist' AND a.status = 'active'
  AND c.name IN ('Medical Information Response', 'Literature Search', 'Evidence Synthesis', 'SLA Tracking', 'Regulatory Compliance')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'medical-writer' AND a.status = 'active'
  AND c.name IN ('Medical Writing', 'Regulatory Writing', 'Publication Management', 'Evidence Synthesis', 'Congress Materials')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'safety-scientist' AND a.status = 'active'
  AND c.name IN ('Safety Monitoring', 'Adverse Event Processing', 'Signal Detection', 'Benefit-Risk Assessment', 'Literature Search')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'health-economist' AND a.status = 'active'
  AND c.name IN ('HTA Analysis', 'Cost-Effectiveness Modeling', 'Budget Impact Analysis', 'Real-World Evidence Analysis', 'Data Analysis')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'kol-strategist' AND a.status = 'active'
  AND c.name IN ('KOL Engagement', 'KOL Profiling', 'Advisory Board Support', 'Congress Planning', 'Competitive Intelligence')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'meded-specialist' AND a.status = 'active'
  AND c.name IN ('CME Development', 'Training Material Creation', 'Speaker Training', 'Literature Search')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'medstrategy-analyst' AND a.status = 'active'
  AND c.name IN ('Competitive Intelligence', 'Medical Strategy Development', 'Launch Planning', 'Data Analysis', 'Trend Analysis')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'advanced', true, 'L3 Specialist'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'medaffairs-generalist' AND a.status = 'active'
  AND c.name IN ('Literature Search', 'Evidence Synthesis', 'Medical Information Response', 'Data Analysis')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

-- L4 CONTEXT ENGINEER CAPABILITIES
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Context Engineer'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug IN ('msl-context-engineer', 'medinfo-context-engineer', 'medcomms-context-engineer', 'safety-context-engineer', 'heor-context-engineer', 'kol-context-engineer', 'meded-context-engineer', 'medstrategy-context-engineer', 'generic-context-engineer')
  AND a.status = 'active'
  AND c.name IN ('Literature Search', 'Database Query', 'API Integration', 'Document Parsing')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

-- L4 WORKER CAPABILITIES
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'msl-activity-coordinator' AND a.status = 'active'
  AND c.name IN ('Activity Logging', 'CRM Management', 'SLA Tracking')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'medical-information-specialist' AND a.status = 'active'
  AND c.name IN ('Medical Information Response', 'SLA Tracking', 'Activity Logging')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'publication-coordinator' AND a.status = 'active'
  AND c.name IN ('Publication Management', 'Activity Logging', 'SLA Tracking')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'safety-case-processor' AND a.status = 'active'
  AND c.name IN ('Adverse Event Processing', 'Expedited Reporting', 'Activity Logging')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'heor-coordinator' AND a.status = 'active'
  AND c.name IN ('Data Analysis', 'Activity Logging', 'SLA Tracking')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'kol-engagement-coordinator' AND a.status = 'active'
  AND c.name IN ('KOL Engagement', 'Activity Logging', 'CRM Management')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'meded-coordinator' AND a.status = 'active'
  AND c.name IN ('CME Development', 'Activity Logging', 'SLA Tracking')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'intermediate', true, 'L4 Worker'
FROM agents a CROSS JOIN capabilities c
WHERE a.slug = 'strategy-coordinator' AND a.status = 'active'
  AND c.name IN ('Competitive Intelligence', 'Activity Logging', 'Trend Analysis')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

-- L5 TOOL CAPABILITIES
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, notes)
SELECT a.id, c.id, 'expert', true, 'L5 Tool - core capability'
FROM agents a CROSS JOIN capabilities c
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND a.status = 'active'
  AND c.name IN ('API Integration', 'Database Query')
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id AND ac.capability_id = c.id);

SELECT 'Migration 029: Capabilities completed' AS status;

-- ============================================================================
-- ============================================================================
-- MIGRATION 030: AGENT SKILLS (EXPLICIT MAPPING)
-- ============================================================================
-- ============================================================================

SELECT '=== Starting Migration 030: Agent Skills ===' AS status;

-- PART 1: ENSURE ALL REQUIRED SKILLS EXIST
INSERT INTO skills (name, description, category, skill_type, created_at)
SELECT name, description, category, skill_type, NOW()
FROM (VALUES
  ('PubMed Advanced Search', 'Advanced PubMed query syntax including MeSH terms and Boolean operators', 'research', 'technical'),
  ('Cochrane Library Navigation', 'Navigate and search Cochrane systematic reviews database', 'research', 'technical'),
  ('EMBASE Search', 'Search Elsevier EMBASE database for biomedical literature', 'research', 'technical'),
  ('PRISMA Methodology', 'Apply PRISMA guidelines for systematic reviews', 'research', 'methodological'),
  ('Citation Management', 'Use reference managers (EndNote, Zotero, Mendeley)', 'research', 'technical'),
  ('MedDRA Coding v26.1', 'Code adverse events using MedDRA version 26.1 terminology', 'safety', 'technical'),
  ('FAERS Database Query', 'Query FDA Adverse Event Reporting System', 'safety', 'technical'),
  ('WHO-UMC VigiBase', 'Access and analyze WHO global drug safety database', 'safety', 'technical'),
  ('Signal Detection Methods', 'Apply PRR, ROR, BCPNN signal detection algorithms', 'safety', 'analytical'),
  ('CIOMS Form Completion', 'Complete CIOMS forms for expedited reporting', 'safety', 'regulatory'),
  ('E2B(R3) Format', 'Generate ICSR in E2B(R3) XML format', 'safety', 'technical'),
  ('Aggregate Safety Reports', 'Prepare PSUR/PBRER aggregate safety reports', 'safety', 'regulatory'),
  ('TreeAge Modeling', 'Build decision trees and Markov models in TreeAge', 'heor', 'technical'),
  ('Excel Cost-Effectiveness', 'Build cost-effectiveness models in Excel', 'heor', 'technical'),
  ('R Statistical Analysis', 'Statistical analysis using R programming', 'heor', 'technical'),
  ('NICE Submission Format', 'Prepare evidence submissions per NICE STA/HST templates', 'heor', 'regulatory'),
  ('ICER Evidence Review', 'Navigate ICER value assessment framework', 'heor', 'regulatory'),
  ('Budget Impact Modeling', 'Build budget impact models for payers', 'heor', 'technical'),
  ('QALY Calculation', 'Calculate quality-adjusted life years', 'heor', 'analytical'),
  ('ICMJE Guidelines', 'Apply ICMJE authorship and reporting guidelines', 'writing', 'regulatory'),
  ('AMA Style Manual', 'Write using AMA Manual of Style', 'writing', 'technical'),
  ('CSR Writing', 'Write clinical study reports per ICH E3', 'writing', 'regulatory'),
  ('IB Writing', 'Write and update Investigator Brochures', 'writing', 'regulatory'),
  ('Manuscript Submission', 'Navigate journal submission systems (ScholarOne, Editorial Manager)', 'writing', 'technical'),
  ('Poster Design', 'Design scientific posters using PowerPoint/Adobe', 'writing', 'technical'),
  ('Standard Response Library', 'Manage and update standard response libraries', 'medinfo', 'operational'),
  ('Medical Inquiry Triage', 'Triage medical inquiries by complexity and urgency', 'medinfo', 'operational'),
  ('FDA Label Interpretation', 'Interpret FDA drug labeling accurately', 'medinfo', 'regulatory'),
  ('Off-Label Inquiry Handling', 'Handle off-label use inquiries compliantly', 'medinfo', 'regulatory'),
  ('KOL Identification', 'Identify and profile key opinion leaders using databases', 'kol', 'analytical'),
  ('KOL Tiering', 'Tier KOLs based on influence, expertise, and engagement potential', 'kol', 'analytical'),
  ('Advisory Board Planning', 'Plan and execute advisory board meetings', 'kol', 'operational'),
  ('Congress Engagement', 'Plan medical society congress engagement strategies', 'kol', 'strategic'),
  ('Veeva CRM', 'Use Veeva CRM for KOL and MSL activity tracking', 'kol', 'technical'),
  ('Territory Planning', 'Plan MSL territory coverage and prioritization', 'msl', 'operational'),
  ('Scientific Exchange', 'Conduct compliant scientific exchange with HCPs', 'msl', 'communication'),
  ('Insight Collection', 'Collect and report field medical insights', 'msl', 'analytical'),
  ('Speaker Identification', 'Identify and nominate speaker candidates', 'msl', 'operational'),
  ('CME Accreditation', 'Navigate ACCME/ACPE accreditation requirements', 'meded', 'regulatory'),
  ('Learning Objective Design', 'Design measurable learning objectives', 'meded', 'instructional'),
  ('Assessment Development', 'Develop pre/post assessments for education programs', 'meded', 'instructional'),
  ('Faculty Development', 'Train and certify faculty speakers', 'meded', 'instructional'),
  ('SWOT Analysis', 'Conduct SWOT analysis for medical strategy', 'strategy', 'analytical'),
  ('Competitive Landscape', 'Map competitive landscape and pipeline analysis', 'strategy', 'analytical'),
  ('Launch Readiness', 'Assess medical launch readiness', 'strategy', 'operational'),
  ('Market Research Analysis', 'Analyze market research data for strategic insights', 'strategy', 'analytical'),
  ('FDA Regulations', 'Navigate FDA pharmaceutical regulations (21 CFR)', 'regulatory', 'regulatory'),
  ('EMA Guidelines', 'Navigate EMA regulatory guidelines', 'regulatory', 'regulatory'),
  ('ICH Guidelines', 'Apply ICH harmonization guidelines', 'regulatory', 'regulatory'),
  ('GCP Compliance', 'Ensure Good Clinical Practice compliance', 'regulatory', 'regulatory'),
  ('Fair Balance Assessment', 'Review promotional materials for fair balance', 'regulatory', 'regulatory'),
  ('Scientific Presentation', 'Deliver scientific presentations to HCPs', 'communication', 'soft'),
  ('Cross-Functional Collaboration', 'Collaborate effectively with R&D, Commercial, Regulatory', 'communication', 'soft'),
  ('Stakeholder Management', 'Manage internal and external stakeholders', 'communication', 'soft'),
  ('Executive Summary Writing', 'Write concise executive summaries', 'communication', 'soft'),
  ('SQL Database Query', 'Write SQL queries for data retrieval', 'technical', 'technical'),
  ('API Integration', 'Connect to REST APIs for data retrieval', 'technical', 'technical'),
  ('JSON/XML Parsing', 'Parse JSON and XML data formats', 'technical', 'technical'),
  ('Data Visualization', 'Create data visualizations (charts, graphs)', 'technical', 'technical')
) AS s(name, description, category, skill_type)
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE skills.name = s.name);

-- L1 MASTER SKILLS
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 15
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'vp-medical-affairs' AND a.status = 'active'
  AND s.name IN ('Stakeholder Management', 'Executive Summary Writing', 'Cross-Functional Collaboration', 'Launch Readiness', 'Competitive Landscape', 'FDA Regulations', 'EMA Guidelines')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

-- L2 EXPERT SKILLS
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'head-of-msl' AND a.status = 'active'
  AND s.name IN ('Territory Planning', 'Scientific Exchange', 'Insight Collection', 'KOL Identification', 'Veeva CRM', 'Stakeholder Management', 'Congress Engagement')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'head-of-medinfo' AND a.status = 'active'
  AND s.name IN ('Standard Response Library', 'Medical Inquiry Triage', 'FDA Label Interpretation', 'Off-Label Inquiry Handling', 'PubMed Advanced Search', 'Fair Balance Assessment')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'head-of-medcomms' AND a.status = 'active'
  AND s.name IN ('ICMJE Guidelines', 'AMA Style Manual', 'Manuscript Submission', 'Poster Design', 'PRISMA Methodology', 'Citation Management')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'head-of-safety' AND a.status = 'active'
  AND s.name IN ('MedDRA Coding v26.1', 'FAERS Database Query', 'Signal Detection Methods', 'CIOMS Form Completion', 'E2B(R3) Format', 'Aggregate Safety Reports', 'ICH Guidelines')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'head-of-heor' AND a.status = 'active'
  AND s.name IN ('TreeAge Modeling', 'Excel Cost-Effectiveness', 'R Statistical Analysis', 'NICE Submission Format', 'ICER Evidence Review', 'Budget Impact Modeling', 'QALY Calculation')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'head-of-kol' AND a.status = 'active'
  AND s.name IN ('KOL Identification', 'KOL Tiering', 'Advisory Board Planning', 'Congress Engagement', 'Veeva CRM', 'Stakeholder Management')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'head-of-meded' AND a.status = 'active'
  AND s.name IN ('CME Accreditation', 'Learning Objective Design', 'Assessment Development', 'Faculty Development', 'Scientific Presentation', 'Fair Balance Assessment')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 10
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'head-of-medstrategy' AND a.status = 'active'
  AND s.name IN ('SWOT Analysis', 'Competitive Landscape', 'Launch Readiness', 'Market Research Analysis', 'Executive Summary Writing', 'Cross-Functional Collaboration')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

-- L3 SPECIALIST SKILLS
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'msl-specialist' AND a.status = 'active'
  AND s.name IN ('Scientific Exchange', 'Insight Collection', 'PubMed Advanced Search', 'Congress Engagement', 'Veeva CRM')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'medinfo-scientist' AND a.status = 'active'
  AND s.name IN ('PubMed Advanced Search', 'Standard Response Library', 'FDA Label Interpretation', 'Off-Label Inquiry Handling', 'Citation Management')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'medical-writer' AND a.status = 'active'
  AND s.name IN ('ICMJE Guidelines', 'AMA Style Manual', 'CSR Writing', 'IB Writing', 'Manuscript Submission', 'Poster Design')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'safety-scientist' AND a.status = 'active'
  AND s.name IN ('MedDRA Coding v26.1', 'Signal Detection Methods', 'FAERS Database Query', 'PubMed Advanced Search', 'Aggregate Safety Reports')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'health-economist' AND a.status = 'active'
  AND s.name IN ('TreeAge Modeling', 'Excel Cost-Effectiveness', 'R Statistical Analysis', 'NICE Submission Format', 'QALY Calculation')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'kol-strategist' AND a.status = 'active'
  AND s.name IN ('KOL Identification', 'KOL Tiering', 'Advisory Board Planning', 'Veeva CRM', 'Competitive Landscape')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'meded-specialist' AND a.status = 'active'
  AND s.name IN ('CME Accreditation', 'Learning Objective Design', 'Assessment Development', 'PubMed Advanced Search', 'Scientific Presentation')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'medstrategy-analyst' AND a.status = 'active'
  AND s.name IN ('Competitive Landscape', 'SWOT Analysis', 'Market Research Analysis', 'Data Visualization', 'Executive Summary Writing')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'advanced', 5
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'medaffairs-generalist' AND a.status = 'active'
  AND s.name IN ('PubMed Advanced Search', 'FDA Label Interpretation', 'Cross-Functional Collaboration', 'Scientific Presentation')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

-- L4 CONTEXT ENGINEER SKILLS
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a CROSS JOIN skills s
WHERE a.slug IN ('msl-context-engineer', 'medinfo-context-engineer', 'medcomms-context-engineer', 'safety-context-engineer', 'heor-context-engineer', 'kol-context-engineer', 'meded-context-engineer', 'medstrategy-context-engineer', 'generic-context-engineer')
  AND a.status = 'active'
  AND s.name IN ('SQL Database Query', 'API Integration', 'JSON/XML Parsing', 'PubMed Advanced Search')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

-- L4 WORKER SKILLS
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'msl-activity-coordinator' AND a.status = 'active'
  AND s.name IN ('Veeva CRM', 'Insight Collection', 'Territory Planning')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'medical-information-specialist' AND a.status = 'active'
  AND s.name IN ('Standard Response Library', 'Medical Inquiry Triage', 'FDA Label Interpretation')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'publication-coordinator' AND a.status = 'active'
  AND s.name IN ('Manuscript Submission', 'Citation Management', 'ICMJE Guidelines')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'safety-case-processor' AND a.status = 'active'
  AND s.name IN ('MedDRA Coding v26.1', 'CIOMS Form Completion', 'E2B(R3) Format')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'heor-coordinator' AND a.status = 'active'
  AND s.name IN ('Excel Cost-Effectiveness', 'Data Visualization', 'R Statistical Analysis')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'kol-engagement-coordinator' AND a.status = 'active'
  AND s.name IN ('Veeva CRM', 'KOL Identification', 'Advisory Board Planning')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'meded-coordinator' AND a.status = 'active'
  AND s.name IN ('CME Accreditation', 'Assessment Development', 'Faculty Development')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'intermediate', 2
FROM agents a CROSS JOIN skills s
WHERE a.slug = 'strategy-coordinator' AND a.status = 'active'
  AND s.name IN ('Competitive Landscape', 'Data Visualization', 'Market Research Analysis')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

-- L5 TOOL SKILLS
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, years_experience)
SELECT a.id, s.id, 'expert', 1
FROM agents a CROSS JOIN skills s
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND a.status = 'active'
  AND s.name IN ('API Integration', 'JSON/XML Parsing')
  AND NOT EXISTS (SELECT 1 FROM agent_skill_assignments asa WHERE asa.agent_id = a.id AND asa.skill_id = s.id);

SELECT 'Migration 030: Skills completed' AS status;

-- ============================================================================
-- ============================================================================
-- MIGRATION 031: AGENT RESPONSIBILITIES (ROLE-SPECIFIC)
-- ============================================================================
-- ============================================================================

SELECT '=== Starting Migration 031: Agent Responsibilities ===' AS status;

-- L1 VP MEDICAL AFFAIRS RESPONSIBILITIES
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Strategic Direction', 'Set overall Medical Affairs strategy and vision aligned with corporate objectives', 1, 'strategy', 'owns'),
  ('Cross-Functional Leadership', 'Lead cross-functional alignment with R&D, Commercial, Regulatory, and Legal', 2, 'leadership', 'owns'),
  ('Budget Authority', 'Approve departmental budgets and major expenditures for all MA functions', 3, 'finance', 'owns'),
  ('Escalation Resolution', 'Resolve escalated decisions from L2 Department Heads', 4, 'escalation', 'owns'),
  ('Stakeholder Management', 'Manage relationships with executive leadership and external stakeholders', 5, 'external', 'owns'),
  ('Compliance Oversight', 'Ensure enterprise-wide compliance with regulatory and ethical standards', 6, 'compliance', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug = 'vp-medical-affairs' AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_responsibilities ar WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility);

-- L2 DEPARTMENT HEAD RESPONSIBILITIES (Common)
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Department Strategy', 'Develop and execute departmental strategy aligned with MA objectives', 1, 'strategy', 'owns'),
  ('Team Leadership', 'Lead and develop department team members', 2, 'leadership', 'owns'),
  ('Quality Oversight', 'Ensure quality standards are met across department deliverables', 3, 'quality', 'owns'),
  ('Budget Management', 'Manage departmental budget within approved allocations', 4, 'finance', 'owns'),
  ('Escalation Management', 'Handle escalations from L3 specialists and escalate to VP as needed', 5, 'escalation', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 2 LIMIT 1)
  AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_responsibilities ar WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility);

-- L3 SPECIALIST RESPONSIBILITIES (Common)
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Domain Expertise', 'Provide subject matter expertise in assigned domain', 1, 'expertise', 'owns'),
  ('Task Quality', 'Ensure quality of deliverables in area of responsibility', 2, 'quality', 'owns'),
  ('L4 Coordination', 'Coordinate with L4 workers and context engineers', 3, 'coordination', 'owns'),
  ('Escalation Handling', 'Handle complex cases and escalate to L2 as needed', 4, 'escalation', 'contributes')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1)
  AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_responsibilities ar WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility);

-- L4 CONTEXT ENGINEER RESPONSIBILITIES
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Data Retrieval', 'Retrieve relevant data from assigned sources and tools', 1, 'execution', 'owns'),
  ('Query Optimization', 'Optimize queries for accuracy and completeness', 2, 'quality', 'owns'),
  ('Context Assembly', 'Assemble context from multiple sources for L3 specialists', 3, 'coordination', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug LIKE '%-context-engineer' AND a.function_name = 'Medical Affairs' AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_responsibilities ar WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility);

-- L4 WORKER RESPONSIBILITIES
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Task Execution', 'Execute assigned operational tasks accurately', 1, 'execution', 'owns'),
  ('Activity Logging', 'Log all activities and maintain accurate records', 2, 'operations', 'owns'),
  ('Status Reporting', 'Report task status and flag issues', 3, 'reporting', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.slug IN ('msl-activity-coordinator', 'medical-information-specialist', 'publication-coordinator', 'safety-case-processor', 'heor-coordinator', 'kol-engagement-coordinator', 'meded-coordinator', 'strategy-coordinator')
  AND a.function_name = 'Medical Affairs' AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_responsibilities ar WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility);

-- L5 TOOL RESPONSIBILITIES
INSERT INTO agent_responsibilities (agent_id, responsibility, description, priority, category, accountability_level)
SELECT a.id, r.responsibility, r.description, r.priority, r.category, r.accountability_level
FROM agents a
CROSS JOIN (VALUES
  ('Query Execution', 'Execute queries against assigned data source', 1, 'execution', 'owns'),
  ('Result Formatting', 'Format results in standardized structure', 2, 'execution', 'owns'),
  ('Error Handling', 'Handle errors gracefully and report issues', 3, 'quality', 'owns')
) AS r(responsibility, description, priority, category, accountability_level)
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_responsibilities ar WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility);

SELECT 'Migration 031: Responsibilities completed' AS status;

-- ============================================================================
-- ============================================================================
-- MIGRATION 032: PROMPT STARTERS (DEPARTMENT-SPECIFIC)
-- ============================================================================
-- ============================================================================

SELECT '=== Starting Migration 032: Prompt Starters ===' AS status;

-- Clear generic starters first
DELETE FROM agent_prompt_starters
WHERE agent_id IN (SELECT id FROM agents WHERE function_name = 'Medical Affairs' AND status = 'active')
  AND text IN ('What can you help me with today?', 'Explain your capabilities and expertise', 'Help me with a task in your domain', 'What are the best practices for this area?');

-- VP MEDICAL AFFAIRS
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Route my medical question to the right department', '🎯', 'routing', 1),
  ('What is our medical strategy for [product]?', '📋', 'strategy', 2),
  ('I need cross-functional alignment on a medical issue', '🤝', 'coordination', 3),
  ('Review an escalated decision from a department head', '⬆️', 'escalation', 4)
) AS s(text, icon, category, seq)
WHERE a.slug = 'vp-medical-affairs' AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_prompt_starters aps WHERE aps.agent_id = a.id AND aps.text = s.text);

-- L2 DEPARTMENT HEADS
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('How should I optimize MSL territory coverage for [region]?', '🗺️', 'strategy', 1),
  ('Identify KOLs for our upcoming advisory board', '👨‍⚕️', 'kol', 2),
  ('What insights have MSLs collected about [topic]?', '💡', 'insights', 3),
  ('Review MSL engagement metrics for this quarter', '📈', 'metrics', 4)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-msl' AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_prompt_starters aps WHERE aps.agent_id = a.id AND aps.text = s.text);

INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('How do I respond to this medical inquiry compliantly?', '📝', 'inquiry', 1),
  ('What does our standard response say about [topic]?', '📚', 'library', 2),
  ('Is this an off-label inquiry and how should I handle it?', '⚠️', 'compliance', 3),
  ('What is our SLA performance this month?', '⏱️', 'metrics', 4)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-medinfo' AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_prompt_starters aps WHERE aps.agent_id = a.id AND aps.text = s.text);

INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Evaluate this potential safety signal for [product]', '⚠️', 'signal', 1),
  ('Is this case reportable? Does it require expedited reporting?', '⏰', 'reporting', 2),
  ('Review the benefit-risk profile for [product]', '⚖️', 'assessment', 3),
  ('Search FAERS for adverse events related to [drug/event]', '🔍', 'search', 4)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-safety' AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_prompt_starters aps WHERE aps.agent_id = a.id AND aps.text = s.text);

INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a cost-effectiveness model for [product]', '📊', 'modeling', 1),
  ('What is NICE saying about treatments in [therapeutic area]?', '🏥', 'hta', 2),
  ('Prepare value evidence for payer discussions', '💰', 'value', 3),
  ('Calculate QALY gains for [intervention]', '📈', 'analytics', 4)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-heor' AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_prompt_starters aps WHERE aps.agent_id = a.id AND aps.text = s.text);

INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Identify top KOLs in [therapeutic area/region]', '🔍', 'identification', 1),
  ('Plan an advisory board on [topic]', '🏛️', 'advisory', 2),
  ('Who should we engage at [congress name]?', '🎪', 'congress', 3),
  ('Review our speaker bureau roster for gaps', '👥', 'speakers', 4)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-kol' AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_prompt_starters aps WHERE aps.agent_id = a.id AND aps.text = s.text);

INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a CME program on [topic]', '📚', 'program', 1),
  ('What are the educational gaps in [therapeutic area]?', '🎯', 'assessment', 2),
  ('Train faculty speakers on [product/topic]', '👨‍🏫', 'training', 3),
  ('Review educational program outcomes', '📊', 'outcomes', 4)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-meded' AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_prompt_starters aps WHERE aps.agent_id = a.id AND aps.text = s.text);

INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('What is our competitive position in [therapeutic area]?', '🎯', 'competitive', 1),
  ('Assess medical launch readiness for [product]', '🚀', 'launch', 2),
  ('What is the pipeline landscape in [indication]?', '🔬', 'pipeline', 3),
  ('SWOT analysis for [product/market]', '📊', 'analysis', 4)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-medstrategy' AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_prompt_starters aps WHERE aps.agent_id = a.id AND aps.text = s.text);

INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Help me develop a publication plan for [study]', '📋', 'planning', 1),
  ('What is the status of our manuscripts in development?', '📄', 'tracking', 2),
  ('Review this abstract for ICMJE compliance', '✅', 'compliance', 3),
  ('Which journals should we target for [study type]?', '🎯', 'strategy', 4)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-medcomms' AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_prompt_starters aps WHERE aps.agent_id = a.id AND aps.text = s.text);

-- L3 SPECIALISTS - Generic starters
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Help me with a task in my area of expertise', '🎯', 'task', 1),
  ('Review this document for accuracy', '✅', 'review', 2),
  ('Find relevant literature on [topic]', '🔍', 'search', 3)
) AS s(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1)
  AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_prompt_starters aps WHERE aps.agent_id = a.id AND aps.text = s.text);

-- L4 AND L5 - Operational starters
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Execute my query', '▶️', 'execute', 1),
  ('Search for [topic]', '🔍', 'search', 2)
) AS s(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id IN (SELECT id FROM agent_levels WHERE level_number IN (4, 5))
  AND a.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM agent_prompt_starters aps WHERE aps.agent_id = a.id AND aps.text = s.text);

SELECT 'Migration 032: Prompt Starters completed' AS status;

-- ============================================================================
-- ============================================================================
-- MIGRATION 033: 6-SECTION PROMPT FIELDS
-- ============================================================================
-- ============================================================================

SELECT '=== Starting Migration 033: 6-Section Prompt Fields ===' AS status;

-- VP MEDICAL AFFAIRS (L1)
UPDATE agents SET
  prompt_section_you_are = 'You are the VP of Medical Affairs, the enterprise-level orchestrator for all Medical Affairs functions. You serve as the strategic leader who routes queries to specialized department heads, makes cross-functional decisions, and ensures alignment between Medical Affairs and corporate objectives.',
  prompt_section_you_do = '1. Route medical queries to the appropriate L2 Department Head based on content and urgency
2. Make enterprise-level decisions requiring cross-departmental coordination
3. Approve budget allocations and resource requests from department heads
4. Resolve escalated issues from L2 experts that require executive judgment
5. Coordinate cross-functional alignment with R&D, Commercial, Regulatory, and Legal
6. Provide strategic direction for Medical Affairs initiatives',
  prompt_section_you_never = '1. NEVER execute operational tasks directly - always delegate to L2 Department Heads
2. NEVER bypass the hierarchy to assign work to L3/L4 agents without L2 coordination
3. NEVER make clinical recommendations without consulting the appropriate L2 expert
4. NEVER approve safety-critical decisions without Head of Pharmacovigilance review',
  prompt_section_success_criteria = '- Query routing accuracy: >95% routed to correct department
- Escalation resolution time: <24 hours for critical, <72 hours for standard
- Cross-functional alignment: All decisions documented with stakeholder sign-off',
  prompt_section_when_unsure = 'For safety-critical issues: ALWAYS route to Head of Pharmacovigilance immediately.
For regulatory issues: Consult Legal/Regulatory before making decisions.
For decisions outside MA scope: Escalate to C-suite with clear options.',
  prompt_section_evidence = 'Base decisions on aggregate data from department heads, strategic documents, regulatory guidance, and cross-functional input.'
WHERE slug = 'vp-medical-affairs' AND status = 'active';

-- L2 DEPARTMENT HEADS (Template-based)
UPDATE agents SET
  prompt_section_you_are = 'You are a Department Head in Medical Affairs, leading your specialized function and reporting to the VP Medical Affairs. You oversee L3 specialists and coordinate with other departments.',
  prompt_section_you_do = '1. Develop and execute departmental strategy
2. Oversee and delegate to L3 specialists
3. Ensure quality and compliance in department deliverables
4. Manage departmental budget
5. Handle escalations from L3 and escalate to VP as needed
6. Coordinate with other L2 department heads',
  prompt_section_you_never = '1. NEVER bypass L3 specialists for operational tasks
2. NEVER make decisions outside departmental scope without VP approval
3. NEVER compromise on compliance or safety
4. NEVER share confidential information inappropriately',
  prompt_section_success_criteria = '- Departmental KPIs met
- Quality standards maintained
- Team properly utilized
- Compliance zero violations',
  prompt_section_when_unsure = 'Escalate to VP Medical Affairs for cross-departmental issues or decisions requiring executive approval. Consult Legal/Compliance for regulatory questions.',
  prompt_section_evidence = 'Base recommendations on published literature, internal data, regulatory guidance, and domain expertise. Always cite sources.'
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 2 LIMIT 1)
  AND status = 'active'
  AND prompt_section_you_are IS NULL;

-- L3 SPECIALISTS
UPDATE agents SET
  prompt_section_you_are = 'You are a Specialist in Medical Affairs, providing subject matter expertise and executing domain-specific tasks. You report to your L2 Department Head.',
  prompt_section_you_do = '1. Provide domain expertise for assigned tasks
2. Execute specialist-level deliverables
3. Coordinate with L4 context engineers and workers
4. Ensure quality of work products
5. Escalate complex issues to L2 as needed',
  prompt_section_you_never = '1. NEVER make strategic decisions without L2 approval
2. NEVER skip quality checks on deliverables
3. NEVER share information outside appropriate channels',
  prompt_section_success_criteria = '- Task quality meets standards
- Deliverables on time
- Proper documentation',
  prompt_section_when_unsure = 'Escalate to your L2 Department Head for guidance on complex decisions.',
  prompt_section_evidence = 'Base work on published literature, approved protocols, and regulatory guidelines. Cite all sources.'
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1)
  AND status = 'active'
  AND prompt_section_you_are IS NULL;

-- L4 CONTEXT ENGINEERS
UPDATE agents SET
  prompt_section_you_are = 'You are a Context Engineer, responsible for retrieving and assembling relevant data from multiple sources to support L3 specialist decision-making.',
  prompt_section_you_do = '1. Retrieve relevant data from assigned sources
2. Optimize queries for accuracy
3. Assemble context from multiple sources
4. Coordinate with L4 workers',
  prompt_section_you_never = '1. NEVER make clinical or strategic decisions
2. NEVER modify or interpret data beyond factual assembly',
  prompt_section_success_criteria = '- Query accuracy >95%
- Response time <30 seconds',
  prompt_section_when_unsure = 'Try multiple query approaches. Pass ambiguous results to L3 for interpretation.',
  prompt_section_evidence = 'Return data with clear source attribution and timestamps.'
WHERE slug LIKE '%-context-engineer'
  AND function_name = 'Medical Affairs'
  AND status = 'active'
  AND prompt_section_you_are IS NULL;

-- L4 WORKERS
UPDATE agents SET
  prompt_section_you_are = 'You are a Worker agent, responsible for executing operational tasks including data entry, logging, tracking, and coordination.',
  prompt_section_you_do = '1. Execute assigned operational tasks
2. Log activities accurately
3. Track status and flag issues
4. Report completion to coordinating agents',
  prompt_section_you_never = '1. NEVER make decisions beyond task execution
2. NEVER modify data without explicit instruction',
  prompt_section_success_criteria = '- Accuracy >99%
- Tasks completed within SLA',
  prompt_section_when_unsure = 'Flag and request clarification. Report system errors immediately.',
  prompt_section_evidence = 'Document all actions with timestamps and completion status.'
WHERE slug IN ('msl-activity-coordinator', 'medical-information-specialist', 'publication-coordinator', 'safety-case-processor', 'heor-coordinator', 'kol-engagement-coordinator', 'meded-coordinator', 'strategy-coordinator')
  AND function_name = 'Medical Affairs'
  AND status = 'active'
  AND prompt_section_you_are IS NULL;

-- L5 TOOLS
UPDATE agents SET
  prompt_section_you_are = 'You are an L5 Tool agent, executing atomic queries and operations against specific data sources.',
  prompt_section_you_do = '1. Execute queries against assigned data source
2. Return results in standardized format
3. Handle errors gracefully',
  prompt_section_you_never = '1. NEVER interpret results
2. NEVER exceed rate limits',
  prompt_section_success_criteria = '- Response time <2 seconds
- Results match source exactly',
  prompt_section_when_unsure = 'Return error with diagnostic information.',
  prompt_section_evidence = 'Return results with source identifier and timestamp.'
WHERE agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND function_name = 'Medical Affairs'
  AND status = 'active'
  AND prompt_section_you_are IS NULL;

SELECT 'Migration 033: 6-Section Prompt Fields completed' AS status;

-- ============================================================================
-- ============================================================================
-- MIGRATION 034: ADDITIONAL METADATA ENRICHMENT
-- ============================================================================
-- ============================================================================

SELECT '=== Starting Migration 034: Additional Metadata ===' AS status;

-- YEARS OF EXPERIENCE BY LEVEL
UPDATE agents SET years_of_experience = 18, expertise_years = 18
WHERE function_name = 'Medical Affairs' AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 1 LIMIT 1)
  AND (years_of_experience IS NULL OR years_of_experience = 0) AND status = 'active';

UPDATE agents SET years_of_experience = 12, expertise_years = 12
WHERE function_name = 'Medical Affairs' AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 2 LIMIT 1)
  AND (years_of_experience IS NULL OR years_of_experience = 0) AND status = 'active';

UPDATE agents SET years_of_experience = 8, expertise_years = 8
WHERE function_name = 'Medical Affairs' AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1)
  AND (years_of_experience IS NULL OR years_of_experience = 0) AND status = 'active';

UPDATE agents SET years_of_experience = 3, expertise_years = 3
WHERE function_name = 'Medical Affairs' AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 4 LIMIT 1)
  AND (years_of_experience IS NULL OR years_of_experience = 0) AND status = 'active';

UPDATE agents SET years_of_experience = 1, expertise_years = 1
WHERE function_name = 'Medical Affairs' AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND (years_of_experience IS NULL OR years_of_experience = 0) AND status = 'active';

-- CERTIFICATIONS BY DEPARTMENT
UPDATE agents SET certifications = jsonb_build_array(
  jsonb_build_object('name', 'Certified Drug Safety Associate (CDSA)', 'issuer', 'ACRP', 'year', 2020),
  jsonb_build_object('name', 'MedDRA Certification', 'issuer', 'MedDRA MSSO', 'year', 2023)
)
WHERE function_name = 'Medical Affairs' AND (slug LIKE '%safety%' OR department_name LIKE '%Pharmacovigilance%')
  AND agent_level_id IN (SELECT id FROM agent_levels WHERE level_number <= 3)
  AND (certifications IS NULL OR certifications = '[]'::jsonb) AND status = 'active';

UPDATE agents SET certifications = jsonb_build_array(
  jsonb_build_object('name', 'Board Certified Medical Science Liaison', 'issuer', 'MSLS', 'year', 2021)
)
WHERE function_name = 'Medical Affairs' AND (slug LIKE '%msl%' OR department_name LIKE '%MSL%')
  AND agent_level_id IN (SELECT id FROM agent_levels WHERE level_number <= 3)
  AND (certifications IS NULL OR certifications = '[]'::jsonb) AND status = 'active';

UPDATE agents SET certifications = jsonb_build_array(
  jsonb_build_object('name', 'Certified Medical Publication Professional (CMPP)', 'issuer', 'ISMPP', 'year', 2020)
)
WHERE function_name = 'Medical Affairs' AND (slug LIKE '%writer%' OR slug LIKE '%medcomms%')
  AND agent_level_id IN (SELECT id FROM agent_levels WHERE level_number <= 3)
  AND (certifications IS NULL OR certifications = '[]'::jsonb) AND status = 'active';

UPDATE agents SET certifications = jsonb_build_array(
  jsonb_build_object('name', 'Health Technology Assessment Certification', 'issuer', 'ISPOR', 'year', 2021)
)
WHERE function_name = 'Medical Affairs' AND (slug LIKE '%heor%' OR slug LIKE '%economist%')
  AND agent_level_id IN (SELECT id FROM agent_levels WHERE level_number <= 3)
  AND (certifications IS NULL OR certifications = '[]'::jsonb) AND status = 'active';

-- Default certifications for remaining
UPDATE agents SET certifications = jsonb_build_array(
  jsonb_build_object('name', 'Certified Medical Affairs Specialist', 'issuer', 'DIA', 'year', 2021)
)
WHERE function_name = 'Medical Affairs'
  AND agent_level_id IN (SELECT id FROM agent_levels WHERE level_number <= 3)
  AND (certifications IS NULL OR certifications = '[]'::jsonb) AND status = 'active';

-- VERSION
UPDATE agents SET version = '1.0.0'
WHERE function_name = 'Medical Affairs' AND (version IS NULL OR version = '') AND status = 'active';

-- TOKEN BUDGETS BY LEVEL
UPDATE agents SET token_budget_min = 2000, token_budget_max = 8000, token_budget_recommended = 4000
WHERE function_name = 'Medical Affairs' AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 1 LIMIT 1)
  AND (token_budget_recommended IS NULL OR token_budget_recommended = 0) AND status = 'active';

UPDATE agents SET token_budget_min = 1500, token_budget_max = 6000, token_budget_recommended = 3000
WHERE function_name = 'Medical Affairs' AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 2 LIMIT 1)
  AND (token_budget_recommended IS NULL OR token_budget_recommended = 0) AND status = 'active';

UPDATE agents SET token_budget_min = 1000, token_budget_max = 4000, token_budget_recommended = 2000
WHERE function_name = 'Medical Affairs' AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1)
  AND (token_budget_recommended IS NULL OR token_budget_recommended = 0) AND status = 'active';

UPDATE agents SET token_budget_min = 500, token_budget_max = 2000, token_budget_recommended = 1000
WHERE function_name = 'Medical Affairs' AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 4 LIMIT 1)
  AND (token_budget_recommended IS NULL OR token_budget_recommended = 0) AND status = 'active';

UPDATE agents SET token_budget_min = 100, token_budget_max = 500, token_budget_recommended = 250
WHERE function_name = 'Medical Affairs' AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND (token_budget_recommended IS NULL OR token_budget_recommended = 0) AND status = 'active';

-- ESCALATION ROUTING
UPDATE agents SET reports_to_agent_id = (SELECT id FROM agents WHERE slug = 'vp-medical-affairs' LIMIT 1)
WHERE function_name = 'Medical Affairs' AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 2 LIMIT 1)
  AND reports_to_agent_id IS NULL AND status = 'active';

UPDATE agents SET can_escalate_to = 'vp-medical-affairs'
WHERE function_name = 'Medical Affairs' AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 2 LIMIT 1)
  AND (can_escalate_to IS NULL OR can_escalate_to = '') AND status = 'active';

-- METADATA CONSOLIDATION
UPDATE agents SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'enrichment_version', '034_combined',
    'enrichment_date', NOW()::text,
    'enrichment_scope', 'comprehensive',
    'migrations_applied', ARRAY['029', '030', '031', '032', '033', '034']
  )
WHERE function_name = 'Medical Affairs' AND status = 'active';

-- VALIDATION STATUS
UPDATE agents SET validation_status = 'validated'
WHERE function_name = 'Medical Affairs' AND status = 'active'
  AND prompt_section_you_are IS NOT NULL
  AND prompt_section_you_do IS NOT NULL;

SELECT 'Migration 034: Additional Metadata completed' AS status;

-- ============================================================================
-- ============================================================================
-- COMMIT TRANSACTION
-- ============================================================================
-- ============================================================================

COMMIT;

SELECT '=== ALL MIGRATIONS COMPLETED SUCCESSFULLY ===' AS status;

-- ============================================================================
-- FINAL VERIFICATION (Run after commit)
-- ============================================================================

SELECT
  'MA Agent Enrichment Summary' as report,
  COUNT(*) as total_agents,
  COUNT(model_justification) as with_model_justification,
  COUNT(CASE WHEN personality_formality > 0 THEN 1 END) as with_personality,
  COUNT(prompt_section_you_are) as with_prompt_sections,
  COUNT(CASE WHEN years_of_experience > 0 THEN 1 END) as with_experience,
  COUNT(CASE WHEN token_budget_recommended > 0 THEN 1 END) as with_token_budget,
  COUNT(CASE WHEN validation_status = 'validated' THEN 1 END) as validated
FROM agents
WHERE function_name = 'Medical Affairs' AND status = 'active';

SELECT
  al.level_number,
  al.level_name,
  COUNT(DISTINCT a.id) as agents,
  COUNT(DISTINCT ac.agent_id) as with_capabilities,
  COUNT(DISTINCT asa.agent_id) as with_skills,
  COUNT(DISTINCT ar.agent_id) as with_responsibilities,
  COUNT(DISTINCT aps.agent_id) as with_starters
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_capabilities ac ON ac.agent_id = a.id
LEFT JOIN agent_skill_assignments asa ON asa.agent_id = a.id
LEFT JOIN agent_responsibilities ar ON ar.agent_id = a.id
LEFT JOIN agent_prompt_starters aps ON aps.agent_id = a.id
WHERE a.function_name = 'Medical Affairs' AND a.status = 'active'
GROUP BY al.level_number, al.level_name
ORDER BY al.level_number;

-- ============================================================================
-- END OF COMBINED MIGRATION
-- ============================================================================
