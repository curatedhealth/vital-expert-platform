-- ============================================================================
-- Migration: Medical Affairs Comprehensive Agent Enrichment
-- Date: 2025-12-02
-- Purpose: Complete all missing fields for MA agents
-- ============================================================================
--
-- Fields to enrich:
--   1. model_justification, model_citation (direct columns)
--   2. Personality traits (formality, empathy, directness, etc.)
--   3. Communication style (verbosity, technical_level, warmth)
--   4. 6-section prompt fields
--   5. Delegation flags (can_spawn_l2/l3/l4)
--   6. agent_capabilities junction
--   7. agent_skill_assignments junction
--   8. agent_responsibilities junction
--   9. agent_tool_assignments junction
--   10. agent_prompt_starters
--
-- ============================================================================

-- ============================================================================
-- PART 1: MODEL JUSTIFICATION & CITATION (Direct Columns)
-- ============================================================================

-- GPT-4 agents
UPDATE agents SET
  model_justification = 'Specialist/Expert requiring 90-95% accuracy for ' || COALESCE(department_name, 'Medical Affairs') || '. GPT-4 achieves 86.7% on MedQA (USMLE) and 86.4% on MMLU. Critical for regulatory and clinical decision support.',
  model_citation = 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774'
WHERE function_name = 'Medical Affairs'
  AND base_model = 'gpt-4'
  AND (model_justification IS NULL OR model_justification = '')
  AND status = 'active';

-- GPT-4o-mini agents
UPDATE agents SET
  model_justification = 'Cost-effective agent for ' || COALESCE(department_name, 'Medical Affairs') || ' tasks. GPT-4o-mini provides good accuracy at lower cost for routine queries and coordination.',
  model_citation = 'OpenAI (2024). GPT-4o Mini Documentation. https://platform.openai.com/docs/models/gpt-4o-mini'
WHERE function_name = 'Medical Affairs'
  AND base_model = 'gpt-4o-mini'
  AND (model_justification IS NULL OR model_justification = '')
  AND status = 'active';

-- GPT-3.5-turbo agents
UPDATE agents SET
  model_justification = 'Fast, cost-effective for high-volume ' || COALESCE(department_name, 'Medical Affairs') || ' tasks. GPT-3.5 Turbo ideal for L4/L5 workers and tools requiring quick responses.',
  model_citation = 'OpenAI (2023). GPT-3.5 Turbo Documentation. https://platform.openai.com/docs/models/gpt-3-5-turbo'
WHERE function_name = 'Medical Affairs'
  AND base_model = 'gpt-3.5-turbo'
  AND (model_justification IS NULL OR model_justification = '')
  AND status = 'active';

-- ============================================================================
-- PART 2: PERSONALITY TRAITS (1-10 scale)
-- ============================================================================

-- L1 Masters - Executive personality (formal, direct, strategic)
UPDATE agents SET
  personality_formality = 9,
  personality_empathy = 6,
  personality_directness = 8,
  personality_detail_orientation = 7,
  personality_proactivity = 9,
  personality_risk_tolerance = 5
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 1 LIMIT 1)
  AND (personality_formality IS NULL);

-- L2 Experts - Director personality (formal, balanced)
UPDATE agents SET
  personality_formality = 8,
  personality_empathy = 7,
  personality_directness = 7,
  personality_detail_orientation = 8,
  personality_proactivity = 8,
  personality_risk_tolerance = 4
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 2 LIMIT 1)
  AND (personality_formality IS NULL);

-- L3 Specialists - Manager personality (professional, detail-oriented)
UPDATE agents SET
  personality_formality = 7,
  personality_empathy = 7,
  personality_directness = 6,
  personality_detail_orientation = 9,
  personality_proactivity = 7,
  personality_risk_tolerance = 3
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1)
  AND (personality_formality IS NULL);

-- L4 Workers - Entry personality (helpful, task-focused)
UPDATE agents SET
  personality_formality = 6,
  personality_empathy = 8,
  personality_directness = 5,
  personality_detail_orientation = 8,
  personality_proactivity = 6,
  personality_risk_tolerance = 2
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 4 LIMIT 1)
  AND (personality_formality IS NULL);

-- L5 Tools - Utility personality (neutral, precise)
UPDATE agents SET
  personality_formality = 5,
  personality_empathy = 3,
  personality_directness = 9,
  personality_detail_orientation = 10,
  personality_proactivity = 3,
  personality_risk_tolerance = 1
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND (personality_formality IS NULL);

-- Safety-critical agents get lower risk tolerance
UPDATE agents SET
  personality_risk_tolerance = 1
WHERE function_name = 'Medical Affairs'
  AND (slug LIKE '%safety%' OR department_name LIKE '%Pharmacovigilance%')
  AND status = 'active';

-- ============================================================================
-- PART 3: COMMUNICATION STYLE (1-10 scale)
-- ============================================================================

-- L1/L2 - Concise, technical, professional
UPDATE agents SET
  comm_verbosity = 5,
  comm_technical_level = 8,
  comm_warmth = 5
WHERE function_name = 'Medical Affairs'
  AND agent_level_id IN (SELECT id FROM agent_levels WHERE level_number IN (1, 2))
  AND (comm_verbosity IS NULL);

-- L3 - Moderate verbosity, high technical
UPDATE agents SET
  comm_verbosity = 6,
  comm_technical_level = 9,
  comm_warmth = 6
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1)
  AND (comm_verbosity IS NULL);

-- L4 - More verbose, moderate technical
UPDATE agents SET
  comm_verbosity = 7,
  comm_technical_level = 6,
  comm_warmth = 7
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 4 LIMIT 1)
  AND (comm_verbosity IS NULL);

-- L5 - Minimal, highly technical
UPDATE agents SET
  comm_verbosity = 2,
  comm_technical_level = 7,
  comm_warmth = 3
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND (comm_verbosity IS NULL);

-- ============================================================================
-- PART 4: DELEGATION FLAGS
-- ============================================================================

-- L1 can spawn all levels
UPDATE agents SET
  can_spawn_l2 = true,
  can_spawn_l3 = true,
  can_spawn_l4 = true,
  can_use_worker_pool = true
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 1 LIMIT 1);

-- L2 can spawn L3 and L4
UPDATE agents SET
  can_spawn_l2 = false,
  can_spawn_l3 = true,
  can_spawn_l4 = true,
  can_use_worker_pool = true
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 2 LIMIT 1);

-- L3 can spawn L4 only
UPDATE agents SET
  can_spawn_l2 = false,
  can_spawn_l3 = false,
  can_spawn_l4 = true,
  can_use_worker_pool = true
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1);

-- L4 and L5 cannot spawn
UPDATE agents SET
  can_spawn_l2 = false,
  can_spawn_l3 = false,
  can_spawn_l4 = false,
  can_use_worker_pool = false
WHERE function_name = 'Medical Affairs'
  AND agent_level_id IN (SELECT id FROM agent_levels WHERE level_number IN (4, 5));

-- ============================================================================
-- PART 5: RESPONSE FORMAT & FLAGS
-- ============================================================================

UPDATE agents SET
  preferred_response_format = CASE
    WHEN agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1) THEN 'json'
    WHEN agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 4 LIMIT 1) THEN 'structured'
    ELSE 'markdown'
  END,
  include_citations = true,
  include_confidence_scores = CASE
    WHEN slug LIKE '%safety%' OR department_name LIKE '%Pharmacovigilance%' THEN true
    ELSE false
  END,
  include_limitations = true
WHERE function_name = 'Medical Affairs'
  AND (preferred_response_format IS NULL)
  AND status = 'active';

-- ============================================================================
-- PART 6: GEOGRAPHIC SCOPE & INDUSTRY
-- ============================================================================

UPDATE agents SET
  geographic_scope = 'global',
  industry = 'Pharmaceuticals',
  industry_specialization = 'Medical Affairs'
WHERE function_name = 'Medical Affairs'
  AND (geographic_scope IS NULL OR industry IS NULL)
  AND status = 'active';

-- ============================================================================
-- PART 7: HIPAA & AUDIT FLAGS
-- ============================================================================

UPDATE agents SET
  hipaa_compliant = true,
  audit_trail_enabled = true,
  data_classification = 'confidential'
WHERE function_name = 'Medical Affairs'
  AND (hipaa_compliant IS NULL)
  AND status = 'active';

-- Safety agents get higher classification
UPDATE agents SET
  data_classification = 'highly_confidential'
WHERE function_name = 'Medical Affairs'
  AND (slug LIKE '%safety%' OR department_name LIKE '%Pharmacovigilance%')
  AND status = 'active';

-- ============================================================================
-- PART 8: AGENT CAPABILITIES (Junction Table)
-- ============================================================================

-- First, ensure capabilities exist
INSERT INTO capabilities (name, description, category)
SELECT name, description, category FROM (VALUES
  ('Literature Search', 'Search and retrieve scientific literature from databases', 'research'),
  ('Data Analysis', 'Analyze clinical and safety data', 'analysis'),
  ('Document Generation', 'Create medical and scientific documents', 'content'),
  ('Regulatory Compliance', 'Ensure compliance with regulatory requirements', 'compliance'),
  ('Safety Monitoring', 'Monitor and assess drug safety signals', 'safety'),
  ('KOL Engagement', 'Manage key opinion leader relationships', 'engagement'),
  ('Medical Writing', 'Write scientific and medical content', 'content'),
  ('Clinical Trial Support', 'Support clinical trial operations', 'clinical'),
  ('HTA Analysis', 'Perform health technology assessments', 'analysis'),
  ('Medical Education', 'Develop and deliver medical education', 'education')
) AS c(name, description, category)
WHERE NOT EXISTS (SELECT 1 FROM capabilities WHERE capabilities.name = c.name);

-- Link L3+ agents to capabilities based on department
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level)
SELECT a.id, c.id,
  CASE
    WHEN a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number <= 2 LIMIT 1) THEN 'expert'
    WHEN a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1) THEN 'advanced'
    ELSE 'intermediate'
  END
FROM agents a
CROSS JOIN capabilities c
WHERE a.function_name = 'Medical Affairs'
  AND a.status = 'active'
  AND (
    (a.department_name LIKE '%Safety%' AND c.name = 'Safety Monitoring') OR
    (a.department_name LIKE '%Pharmacovigilance%' AND c.name = 'Safety Monitoring') OR
    (a.slug LIKE '%writer%' AND c.name = 'Medical Writing') OR
    (a.department_name LIKE '%Communications%' AND c.name = 'Document Generation') OR
    (a.department_name LIKE '%HEOR%' AND c.name = 'HTA Analysis') OR
    (a.department_name LIKE '%KOL%' AND c.name = 'KOL Engagement') OR
    (a.department_name LIKE '%Education%' AND c.name = 'Medical Education') OR
    (a.slug LIKE '%search%' AND c.name = 'Literature Search') OR
    (a.slug LIKE '%analyst%' AND c.name = 'Data Analysis')
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac
    WHERE ac.agent_id = a.id AND ac.capability_id = c.id
  );

-- ============================================================================
-- PART 9: AGENT SKILLS (Junction Table)
-- ============================================================================

-- Ensure skills exist
INSERT INTO skills (name, description, category)
SELECT name, description, category FROM (VALUES
  ('PubMed Search', 'Search PubMed database for medical literature', 'research'),
  ('MedDRA Coding', 'Apply MedDRA terminology to adverse events', 'safety'),
  ('Signal Detection', 'Detect and evaluate safety signals', 'safety'),
  ('Economic Modeling', 'Build cost-effectiveness models', 'heor'),
  ('Manuscript Drafting', 'Draft scientific manuscripts', 'writing'),
  ('KOL Profiling', 'Profile and tier key opinion leaders', 'engagement'),
  ('CME Development', 'Develop continuing medical education', 'education'),
  ('Competitive Analysis', 'Analyze competitive landscape', 'strategy'),
  ('CRM Management', 'Manage customer relationship data', 'operations'),
  ('Regulatory Writing', 'Write regulatory documents', 'compliance')
) AS s(name, description, category)
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE skills.name = s.name);

-- Link agents to skills
INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level)
SELECT a.id, s.id, 'expert'
FROM agents a
CROSS JOIN skills s
WHERE a.function_name = 'Medical Affairs'
  AND a.status = 'active'
  AND (
    (a.slug LIKE '%pubmed%' AND s.name = 'PubMed Search') OR
    (a.slug LIKE '%meddra%' AND s.name = 'MedDRA Coding') OR
    (a.slug LIKE '%safety%' AND s.name = 'Signal Detection') OR
    (a.slug LIKE '%heor%' AND s.name = 'Economic Modeling') OR
    (a.slug LIKE '%writer%' AND s.name = 'Manuscript Drafting') OR
    (a.slug LIKE '%kol%' AND s.name = 'KOL Profiling') OR
    (a.slug LIKE '%meded%' AND s.name = 'CME Development') OR
    (a.slug LIKE '%strategy%' AND s.name = 'Competitive Analysis')
  )
  AND NOT EXISTS (
    SELECT 1 FROM agent_skill_assignments asa
    WHERE asa.agent_id = a.id AND asa.skill_id = s.id
  );

-- ============================================================================
-- PART 10: AGENT RESPONSIBILITIES (Junction Table)
-- ============================================================================

-- Add responsibilities for L1-L3 agents
INSERT INTO agent_responsibilities (agent_id, responsibility, priority, category)
SELECT a.id, r.responsibility, r.priority, r.category
FROM agents a
CROSS JOIN (VALUES
  ('Strategic planning and oversight', 1, 'leadership'),
  ('Quality assurance and compliance', 2, 'compliance'),
  ('Team coordination and delegation', 3, 'management'),
  ('Stakeholder communication', 4, 'communication'),
  ('Performance monitoring', 5, 'oversight')
) AS r(responsibility, priority, category)
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id IN (SELECT id FROM agent_levels WHERE level_number IN (1, 2))
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- L3 Specialist responsibilities
INSERT INTO agent_responsibilities (agent_id, responsibility, priority, category)
SELECT a.id, r.responsibility, r.priority, r.category
FROM agents a
CROSS JOIN (VALUES
  ('Domain expertise delivery', 1, 'expertise'),
  ('Task quality review', 2, 'quality'),
  ('L4 worker delegation', 3, 'delegation'),
  ('Escalation management', 4, 'escalation')
) AS r(responsibility, priority, category)
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1)
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- L4 Worker responsibilities
INSERT INTO agent_responsibilities (agent_id, responsibility, priority, category)
SELECT a.id, r.responsibility, r.priority, r.category
FROM agents a
CROSS JOIN (VALUES
  ('Task execution', 1, 'execution'),
  ('Data entry and logging', 2, 'operations'),
  ('Status reporting', 3, 'reporting')
) AS r(responsibility, priority, category)
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 4 LIMIT 1)
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_responsibilities ar
    WHERE ar.agent_id = a.id AND ar.responsibility = r.responsibility
  );

-- ============================================================================
-- PART 11: AGENT TOOL ASSIGNMENTS
-- ============================================================================

-- Link L4 Context Engineers to their tools
INSERT INTO agent_tool_assignments (agent_id, tool_id, is_primary, usage_priority)
SELECT ce.id, t.id, true, 1
FROM agents ce
JOIN agents t ON t.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
WHERE ce.function_name = 'Medical Affairs'
  AND ce.slug LIKE '%-context-engineer'
  AND t.function_name = 'Medical Affairs'
  AND t.slug LIKE '%-tool'
  AND ce.status = 'active'
  AND t.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_tool_assignments ata
    WHERE ata.agent_id = ce.id AND ata.tool_id = t.id
  );

-- ============================================================================
-- PART 12: PROMPT STARTERS FOR AGENTS MISSING THEM
-- ============================================================================

-- Add generic prompt starters for agents without any
INSERT INTO agent_prompt_starters (agent_id, text, icon, category, sequence_order)
SELECT a.id, starter.text, starter.icon, starter.category, starter.seq
FROM agents a
CROSS JOIN (VALUES
  ('What can you help me with today?', '❓', 'general', 1),
  ('Explain your capabilities and expertise', '📋', 'info', 2),
  ('Help me with a task in your domain', '🎯', 'task', 3),
  ('What are the best practices for this area?', '💡', 'guidance', 4)
) AS starter(text, icon, category, seq)
WHERE a.function_name = 'Medical Affairs'
  AND a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM agent_prompt_starters aps
    WHERE aps.agent_id = a.id
  );

-- ============================================================================
-- PART 13: VERIFICATION
-- ============================================================================

-- Summary of enrichment
SELECT
  'MA Enrichment Summary' as report,
  COUNT(*) as total_agents,
  COUNT(model_justification) as with_justification,
  COUNT(model_citation) as with_citation,
  COUNT(personality_formality) as with_personality,
  COUNT(comm_verbosity) as with_comm_style,
  COUNT(CASE WHEN can_spawn_l4 IS NOT NULL THEN 1 END) as with_delegation_flags,
  COUNT(preferred_response_format) as with_response_format
FROM agents
WHERE function_name = 'Medical Affairs' AND status = 'active';

-- Capabilities summary
SELECT
  'Capabilities Linked' as report,
  COUNT(DISTINCT ac.agent_id) as agents_with_capabilities,
  COUNT(*) as total_links
FROM agent_capabilities ac
JOIN agents a ON ac.agent_id = a.id
WHERE a.function_name = 'Medical Affairs';

-- Skills summary
SELECT
  'Skills Linked' as report,
  COUNT(DISTINCT asa.agent_id) as agents_with_skills,
  COUNT(*) as total_links
FROM agent_skill_assignments asa
JOIN agents a ON asa.agent_id = a.id
WHERE a.function_name = 'Medical Affairs';

-- Responsibilities summary
SELECT
  'Responsibilities Linked' as report,
  COUNT(DISTINCT ar.agent_id) as agents_with_responsibilities,
  COUNT(*) as total_links
FROM agent_responsibilities ar
JOIN agents a ON ar.agent_id = a.id
WHERE a.function_name = 'Medical Affairs';

-- Prompt starters summary
SELECT
  'Prompt Starters' as report,
  COUNT(DISTINCT aps.agent_id) as agents_with_starters,
  COUNT(*) as total_starters
FROM agent_prompt_starters aps
JOIN agents a ON aps.agent_id = a.id
WHERE a.function_name = 'Medical Affairs';
