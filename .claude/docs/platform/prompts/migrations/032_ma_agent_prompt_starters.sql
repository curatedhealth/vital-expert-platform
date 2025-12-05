-- ============================================================================
-- Migration 032: Medical Affairs Agent Prompt Starters - Department Specific
-- Date: 2025-12-02
-- Purpose: Add domain-specific prompt starters for each MA agent
-- ============================================================================
--
-- Prompt starters should:
--   - Be action-oriented and specific
--   - Reflect the agent's actual capabilities
--   - Use domain terminology appropriately
--   - Include 4-6 starters per agent
--
-- ============================================================================

-- First, clear any generic starters that were added previously
DELETE FROM agent_prompt_starters
WHERE agent_id IN (
  SELECT id FROM agents
  WHERE function_name = 'Medical Affairs' AND status = 'active'
)
AND text IN (
  'What can you help me with today?',
  'Explain your capabilities and expertise',
  'Help me with a task in your domain',
  'What are the best practices for this area?'
);

-- ============================================================================
-- PART 1: L1 MASTER PROMPT STARTERS
-- ============================================================================

-- VP Medical Affairs
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Route my medical question to the right department', '🎯', 'routing', 1),
  ('What is our medical strategy for [product]?', '📋', 'strategy', 2),
  ('I need cross-functional alignment on a medical issue', '🤝', 'coordination', 3),
  ('Review an escalated decision from a department head', '⬆️', 'escalation', 4),
  ('What are the key Medical Affairs priorities this quarter?', '📊', 'planning', 5),
  ('Help me prepare for an executive medical briefing', '👔', 'leadership', 6)
) AS s(text, icon, category, seq)
WHERE a.slug = 'vp-medical-affairs'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- ============================================================================
-- PART 2: L2 EXPERT PROMPT STARTERS
-- ============================================================================

-- Head of MSL Operations
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('How should I optimize MSL territory coverage for [region]?', '🗺️', 'strategy', 1),
  ('Identify KOLs for our upcoming advisory board', '👨‍⚕️', 'kol', 2),
  ('What insights have MSLs collected about [competitor/topic]?', '💡', 'insights', 3),
  ('Review MSL engagement metrics for this quarter', '📈', 'metrics', 4),
  ('Plan MSL activities for [congress name]', '🎪', 'congress', 5),
  ('Help me develop an MSL training program on [topic]', '📚', 'training', 6)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-msl'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Head of Medical Information
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('How do I respond to this medical inquiry compliantly?', '📝', 'inquiry', 1),
  ('What does our standard response say about [topic]?', '📚', 'library', 2),
  ('Review medical inquiry trends for [product]', '📊', 'analytics', 3),
  ('Is this an off-label inquiry and how should I handle it?', '⚠️', 'compliance', 4),
  ('Update the standard response for [indication]', '✏️', 'content', 5),
  ('What is our SLA performance this month?', '⏱️', 'metrics', 6)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-medinfo'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Head of Medical Communications
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Help me develop a publication plan for [study/product]', '📋', 'planning', 1),
  ('What is the status of our manuscripts in development?', '📄', 'tracking', 2),
  ('Review this abstract for ICMJE compliance', '✅', 'compliance', 3),
  ('Which journals should we target for [study type]?', '🎯', 'strategy', 4),
  ('Prepare materials for [congress name] presentation', '🎪', 'congress', 5),
  ('Coordinate MLR review for [document type]', '⚖️', 'review', 6)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-medcomms'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Head of Pharmacovigilance
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Evaluate this potential safety signal for [product]', '⚠️', 'signal', 1),
  ('What are the current safety signals under evaluation?', '📊', 'monitoring', 2),
  ('Is this case reportable? Does it require expedited reporting?', '⏰', 'reporting', 3),
  ('Review the benefit-risk profile for [product]', '⚖️', 'assessment', 4),
  ('Prepare PSUR section for [product]', '📄', 'regulatory', 5),
  ('Search FAERS for adverse events related to [drug/event]', '🔍', 'search', 6)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-safety'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Head of HEOR
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a cost-effectiveness model for [product/indication]', '📊', 'modeling', 1),
  ('What is NICE saying about treatments in [therapeutic area]?', '🏥', 'hta', 2),
  ('Prepare value evidence for payer discussions', '💰', 'value', 3),
  ('Review ICER assessment methodology for [drug class]', '📋', 'research', 4),
  ('Calculate QALY gains for [intervention]', '📈', 'analytics', 5),
  ('What real-world evidence supports our value story?', '🌍', 'rwe', 6)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-heor'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Head of KOL Management
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Identify top KOLs in [therapeutic area/region]', '🔍', 'identification', 1),
  ('Plan an advisory board on [topic]', '🏛️', 'advisory', 2),
  ('Who should we engage at [congress name]?', '🎪', 'congress', 3),
  ('Review our speaker bureau roster for gaps', '👥', 'speakers', 4),
  ('What is our KOL engagement strategy for [product launch]?', '📋', 'strategy', 5),
  ('Ensure FMV compliance for this KOL engagement', '⚖️', 'compliance', 6)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-kol'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Head of Medical Education
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Develop a CME program on [topic]', '📚', 'program', 1),
  ('What are the educational gaps in [therapeutic area]?', '🎯', 'assessment', 2),
  ('Train faculty speakers on [product/topic]', '👨‍🏫', 'training', 3),
  ('Review educational program outcomes and impact', '📊', 'outcomes', 4),
  ('Ensure ACCME accreditation requirements are met', '✅', 'compliance', 5),
  ('Plan educational activities for [congress]', '🎪', 'planning', 6)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-meded'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Head of Medical Strategy
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('What is our competitive position in [therapeutic area]?', '🎯', 'competitive', 1),
  ('Assess medical launch readiness for [product]', '🚀', 'launch', 2),
  ('What is the pipeline landscape in [indication]?', '🔬', 'pipeline', 3),
  ('Develop a medical affairs strategy for [product lifecycle stage]', '📋', 'strategy', 4),
  ('SWOT analysis for [product/market]', '📊', 'analysis', 5),
  ('How should we position against [competitor product]?', '⚔️', 'positioning', 6)
) AS s(text, icon, category, seq)
WHERE a.slug = 'head-of-medstrategy'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- ============================================================================
-- PART 3: L3 SPECIALIST PROMPT STARTERS
-- ============================================================================

-- MSL Specialist
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Prepare for my upcoming KOL meeting on [topic]', '📝', 'preparation', 1),
  ('Find recent publications for [therapeutic area]', '📚', 'research', 2),
  ('Log my HCP interaction in the system', '✏️', 'logging', 3),
  ('What questions might HCPs ask about [product]?', '❓', 'training', 4),
  ('Summarize the latest congress highlights', '🎪', 'congress', 5)
) AS s(text, icon, category, seq)
WHERE a.slug = 'msl-specialist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Medical Information Scientist
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Help me draft a response to this medical inquiry', '📝', 'response', 1),
  ('Search PubMed for evidence on [topic]', '🔍', 'search', 2),
  ('What does the FDA label say about [indication/dosing]?', '📋', 'label', 3),
  ('Is there a standard response for [topic]?', '📚', 'library', 4),
  ('Review this response for accuracy and fair balance', '✅', 'review', 5)
) AS s(text, icon, category, seq)
WHERE a.slug = 'medinfo-scientist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Medical Writer
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Help me draft a manuscript introduction for [study]', '📝', 'writing', 1),
  ('Review this abstract for ICMJE compliance', '✅', 'review', 2),
  ('Create a poster layout for [congress]', '🎨', 'design', 3),
  ('What journals publish in [therapeutic area]?', '📚', 'research', 4),
  ('Format references in AMA style', '📎', 'formatting', 5)
) AS s(text, icon, category, seq)
WHERE a.slug = 'medical-writer'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Safety Scientist
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Evaluate this adverse event for causality', '⚖️', 'assessment', 1),
  ('Search FAERS for [drug] + [event] reports', '🔍', 'search', 2),
  ('Is this a known safety signal?', '⚠️', 'signal', 3),
  ('What is the MedDRA code for [adverse event]?', '🏷️', 'coding', 4),
  ('Review literature for safety signals on [product]', '📚', 'research', 5)
) AS s(text, icon, category, seq)
WHERE a.slug = 'safety-scientist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Health Economist
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Build a cost-effectiveness model for [intervention]', '📊', 'modeling', 1),
  ('What inputs do I need for a budget impact analysis?', '💰', 'planning', 2),
  ('Search NICE for [drug class] technology appraisals', '🔍', 'search', 3),
  ('Calculate ICERs for different scenarios', '📈', 'analytics', 4),
  ('What utility values exist for [health state]?', '📋', 'research', 5)
) AS s(text, icon, category, seq)
WHERE a.slug = 'health-economist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- KOL Strategist
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Find KOLs who specialize in [topic/region]', '🔍', 'search', 1),
  ('Create a KOL engagement plan for [product]', '📋', 'planning', 2),
  ('What is Dr. [name]s publication profile?', '👨‍⚕️', 'profile', 3),
  ('Plan logistics for advisory board meeting', '🏛️', 'advisory', 4),
  ('Tier KOLs for [therapeutic area]', '📊', 'tiering', 5)
) AS s(text, icon, category, seq)
WHERE a.slug = 'kol-strategist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Medical Education Specialist
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Design learning objectives for [topic] program', '🎯', 'design', 1),
  ('Create assessment questions for [topic]', '❓', 'assessment', 2),
  ('What are CME requirements for [specialty]?', '📋', 'compliance', 3),
  ('Prepare faculty training materials on [product]', '📚', 'training', 4),
  ('Measure outcomes for [educational program]', '📊', 'outcomes', 5)
) AS s(text, icon, category, seq)
WHERE a.slug = 'meded-specialist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Medical Strategy Analyst
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Analyze competitor [product name] positioning', '🔍', 'competitive', 1),
  ('What clinical trials are ongoing in [indication]?', '🔬', 'pipeline', 2),
  ('Create a competitive landscape report', '📊', 'reporting', 3),
  ('Track launch readiness milestones for [product]', '🚀', 'launch', 4),
  ('Summarize recent publications from [competitor]', '📚', 'research', 5)
) AS s(text, icon, category, seq)
WHERE a.slug = 'medstrategy-analyst'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Medical Affairs Generalist
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Help me find information on [medical topic]', '🔍', 'search', 1),
  ('Summarize this publication for me', '📝', 'summary', 2),
  ('What department handles [type of request]?', '🎯', 'routing', 3),
  ('Prepare a brief on [therapeutic area]', '📋', 'content', 4)
) AS s(text, icon, category, seq)
WHERE a.slug = 'medaffairs-generalist'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- ============================================================================
-- PART 4: L4 CONTEXT ENGINEER PROMPT STARTERS
-- ============================================================================

-- Generic context engineers get data retrieval focused starters
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Search [database] for [query terms]', '🔍', 'search', 1),
  ('Retrieve relevant context on [topic]', '📚', 'retrieval', 2),
  ('What data sources are available for [question]?', '💾', 'sources', 3)
) AS s(text, icon, category, seq)
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
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Safety context engineer gets additional safety-specific starters
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Query FAERS for [drug/event] combination', '🔍', 'faers', 4),
  ('Look up MedDRA code for [adverse event term]', '🏷️', 'meddra', 5)
) AS s(text, icon, category, seq)
WHERE a.slug = 'safety-context-engineer'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- HEOR context engineer gets additional HEOR-specific starters
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Search NICE evidence library for [topic]', '🏥', 'nice', 4),
  ('Find ICER assessments on [drug class]', '💰', 'icer', 5)
) AS s(text, icon, category, seq)
WHERE a.slug = 'heor-context-engineer'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- ============================================================================
-- PART 5: L4 WORKER PROMPT STARTERS
-- ============================================================================

-- Workers get task-focused starters
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, 'Log this activity', '✏️', 'logging', 1
FROM agents a
WHERE a.slug IN (
    'msl-activity-coordinator',
    'medical-information-specialist',
    'publication-coordinator',
    'safety-case-processor',
    'heor-coordinator',
    'kol-engagement-coordinator',
    'meded-coordinator',
    'strategy-coordinator'
  )
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = 'Log this activity'
  );

INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, 'Update tracking status', '📊', 'tracking', 2
FROM agents a
WHERE a.slug IN (
    'msl-activity-coordinator',
    'medical-information-specialist',
    'publication-coordinator',
    'safety-case-processor',
    'heor-coordinator',
    'kol-engagement-coordinator',
    'meded-coordinator',
    'strategy-coordinator'
  )
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = 'Update tracking status'
  );

-- Safety Case Processor specific
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Enter this adverse event case', '📝', 'entry', 3),
  ('Code this event using MedDRA', '🏷️', 'coding', 4),
  ('Flag this as expedited if required', '⚡', 'expedited', 5)
) AS s(text, icon, category, seq)
WHERE a.slug = 'safety-case-processor'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- ============================================================================
-- PART 6: L5 TOOL PROMPT STARTERS
-- ============================================================================

-- PubMed Search Tool
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Search PubMed: [your query]', '🔍', 'search', 1),
  ('Find systematic reviews on [topic]', '📚', 'search', 2),
  ('Recent publications by [author name]', '👤', 'search', 3)
) AS s(text, icon, category, seq)
WHERE a.slug = 'pubmed-search-tool'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- FAERS Search Tool
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Search FAERS: [drug name]', '🔍', 'search', 1),
  ('Find reports for [drug] + [adverse event]', '⚠️', 'search', 2),
  ('Signal statistics for [drug]', '📊', 'analytics', 3)
) AS s(text, icon, category, seq)
WHERE a.slug = 'faers-search-tool'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- FDA Label Tool
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Look up FDA label for [drug name]', '📋', 'lookup', 1),
  ('What are the indications for [drug]?', '🎯', 'label', 2),
  ('Dosing information for [drug]', '💊', 'label', 3)
) AS s(text, icon, category, seq)
WHERE a.slug = 'fda-label-tool'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- NICE Evidence Tool
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Search NICE for [topic/drug]', '🔍', 'search', 1),
  ('Find technology appraisals in [disease area]', '📋', 'search', 2),
  ('NICE guidelines for [condition]', '📚', 'guidelines', 3)
) AS s(text, icon, category, seq)
WHERE a.slug = 'nice-evidence-tool'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- MedDRA Lookup Tool
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Look up MedDRA code for [term]', '🏷️', 'lookup', 1),
  ('Find preferred term for [description]', '🔍', 'search', 2),
  ('MedDRA hierarchy for [term]', '📊', 'hierarchy', 3)
) AS s(text, icon, category, seq)
WHERE a.slug = 'meddra-lookup-tool'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- ClinicalTrials Search Tool
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Search trials for [condition/intervention]', '🔍', 'search', 1),
  ('Find recruiting trials in [therapeutic area]', '👥', 'search', 2),
  ('Trials sponsored by [company]', '🏢', 'search', 3)
) AS s(text, icon, category, seq)
WHERE a.slug = 'clinicaltrials-search-tool'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Calculator Tool
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Calculate [expression]', '🔢', 'calculate', 1),
  ('Convert [unit] to [unit]', '🔄', 'convert', 2)
) AS s(text, icon, category, seq)
WHERE a.slug = 'calculator-tool'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- Web Search Tool
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Search web for [query]', '🌐', 'search', 1),
  ('Find latest news on [topic]', '📰', 'news', 2)
) AS s(text, icon, category, seq)
WHERE a.slug = 'web-search-tool'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- RAG Search Tool
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, s.text, s.icon, s.category, s.seq
FROM agents a
CROSS JOIN (VALUES
  ('Search internal knowledge for [topic]', '📚', 'search', 1),
  ('Find company documents about [subject]', '🔍', 'search', 2)
) AS s(text, icon, category, seq)
WHERE a.slug = 'rag-search-tool'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id AND aps.text = s.text
  );

-- ============================================================================
-- PART 7: VERIFICATION
-- ============================================================================

-- Summary by level
SELECT
  al.level_number,
  al.level_name,
  COUNT(DISTINCT a.id) as agents,
  COUNT(DISTINCT aps.id) as prompt_starters,
  ROUND(COUNT(DISTINCT aps.id)::numeric / NULLIF(COUNT(DISTINCT a.id), 0), 1) as avg_per_agent
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_prompt_starters aps ON aps.agent_id = a.id
WHERE a.function_name = 'Medical Affairs'
  AND a.status = 'active'
GROUP BY al.level_number, al.level_name
ORDER BY al.level_number;

-- Migration summary
SELECT
  'Migration 032: Prompt Starters' as migration,
  (SELECT COUNT(DISTINCT aps.agent_id)
   FROM agent_prompt_starters aps
   JOIN agents a ON aps.agent_id = a.id
   WHERE a.function_name = 'Medical Affairs' AND a.status = 'active') as ma_agents_with_starters,
  (SELECT COUNT(*)
   FROM agent_prompt_starters aps
   JOIN agents a ON aps.agent_id = a.id
   WHERE a.function_name = 'Medical Affairs' AND a.status = 'active') as total_starters;
