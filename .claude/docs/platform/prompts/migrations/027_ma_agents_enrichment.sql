-- ============================================================================
-- Migration: Medical Affairs Agents Enrichment
-- Date: 2025-12-02
-- Purpose: Add missing model_justification and model_citation to MA agents
-- ============================================================================
--
-- Summary:
--   - ~50 agents missing model_justification/model_citation
--   - 2 agents missing avatar_url
--   - Uses model-based templates per CLAUDE.md standards
--
-- ============================================================================

-- ============================================================================
-- PART 1: FIX MISSING AVATARS
-- ============================================================================

UPDATE agents SET avatar_url = '/icons/png/avatars/avatar_0142.png'
WHERE slug = 'task-assignment-coordinator' AND (avatar_url IS NULL OR avatar_url = '');

UPDATE agents SET avatar_url = '/icons/png/avatars/avatar_0143.png'
WHERE slug = 'version-comparison-tool' AND (avatar_url IS NULL OR avatar_url = '');

-- ============================================================================
-- PART 2: ENRICH GPT-4 AGENTS (Tier 2/3)
-- ============================================================================

UPDATE agents SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'model_justification', 'Specialist/Expert requiring 90-95% accuracy for ' || COALESCE(department_name, 'Medical Affairs') || '. GPT-4 achieves 86.7% on MedQA (USMLE) and 86.4% on MMLU. Important for regulatory and clinical decision support.',
    'model_citation', 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774'
  )
WHERE function_name = 'Medical Affairs'
  AND base_model = 'gpt-4'
  AND (metadata->>'model_justification' IS NULL)
  AND status = 'active';

-- ============================================================================
-- PART 3: ENRICH GPT-4O-MINI AGENTS (Tier 1/2)
-- ============================================================================

UPDATE agents SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'model_justification', 'Cost-effective agent for ' || COALESCE(department_name, 'Medical Affairs') || ' tasks. GPT-4o-mini provides good performance at lower cost. Suitable for routine queries and coordination tasks.',
    'model_citation', 'OpenAI (2024). GPT-4o Mini Documentation. https://platform.openai.com/docs/models/gpt-4o-mini'
  )
WHERE function_name = 'Medical Affairs'
  AND base_model = 'gpt-4o-mini'
  AND (metadata->>'model_justification' IS NULL)
  AND status = 'active';

-- ============================================================================
-- PART 4: ENRICH GPT-3.5-TURBO AGENTS (Tier 1 / L4-L5)
-- ============================================================================

UPDATE agents SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'model_justification', 'Fast, cost-effective for foundational ' || COALESCE(department_name, 'Medical Affairs') || ' queries. GPT-3.5 Turbo achieves 70% on HumanEval. Ideal for high-volume, low-complexity tasks.',
    'model_citation', 'OpenAI (2023). GPT-3.5 Turbo Documentation. https://platform.openai.com/docs/models/gpt-3-5-turbo'
  )
WHERE function_name = 'Medical Affairs'
  AND base_model = 'gpt-3.5-turbo'
  AND (metadata->>'model_justification' IS NULL)
  AND status = 'active';

-- ============================================================================
-- PART 5: ADD PERSONA ARCHETYPES (Based on Department)
-- ============================================================================

-- Clinical Operations Support
UPDATE agents SET
  metadata = metadata || jsonb_build_object('persona_archetype', 'Operations Manager')
WHERE function_name = 'Medical Affairs'
  AND department_name LIKE '%Clinical%'
  AND (metadata->>'persona_archetype' IS NULL);

-- Pharmacovigilance / Safety
UPDATE agents SET
  metadata = metadata || jsonb_build_object('persona_archetype', 'Safety Officer')
WHERE function_name = 'Medical Affairs'
  AND (department_name LIKE '%Safety%' OR department_name LIKE '%Pharmacovigilance%' OR slug LIKE '%safety%')
  AND (metadata->>'persona_archetype' IS NULL);

-- Medical Communications / Publications
UPDATE agents SET
  metadata = metadata || jsonb_build_object('persona_archetype', 'Research Specialist')
WHERE function_name = 'Medical Affairs'
  AND (department_name LIKE '%Communications%' OR department_name LIKE '%Publications%' OR slug LIKE '%writer%' OR slug LIKE '%publication%')
  AND (metadata->>'persona_archetype' IS NULL);

-- Medical Information
UPDATE agents SET
  metadata = metadata || jsonb_build_object('persona_archetype', 'Clinical Expert')
WHERE function_name = 'Medical Affairs'
  AND (department_name LIKE '%Information%' OR slug LIKE '%medinfo%')
  AND (metadata->>'persona_archetype' IS NULL);

-- HEOR
UPDATE agents SET
  metadata = metadata || jsonb_build_object('persona_archetype', 'Data Analyst')
WHERE function_name = 'Medical Affairs'
  AND (department_name LIKE '%HEOR%' OR slug LIKE '%heor%' OR slug LIKE '%economist%')
  AND (metadata->>'persona_archetype' IS NULL);

-- KOL Management
UPDATE agents SET
  metadata = metadata || jsonb_build_object('persona_archetype', 'Business Strategist')
WHERE function_name = 'Medical Affairs'
  AND (department_name LIKE '%KOL%' OR slug LIKE '%kol%')
  AND (metadata->>'persona_archetype' IS NULL);

-- Medical Education
UPDATE agents SET
  metadata = metadata || jsonb_build_object('persona_archetype', 'Clinical Expert')
WHERE function_name = 'Medical Affairs'
  AND (department_name LIKE '%Education%' OR slug LIKE '%meded%')
  AND (metadata->>'persona_archetype' IS NULL);

-- Medical Strategy
UPDATE agents SET
  metadata = metadata || jsonb_build_object('persona_archetype', 'Business Strategist')
WHERE function_name = 'Medical Affairs'
  AND (department_name LIKE '%Strategy%' OR slug LIKE '%strategy%')
  AND (metadata->>'persona_archetype' IS NULL);

-- MSL Operations
UPDATE agents SET
  metadata = metadata || jsonb_build_object('persona_archetype', 'Clinical Expert')
WHERE function_name = 'Medical Affairs'
  AND (department_name LIKE '%MSL%' OR slug LIKE '%msl%')
  AND (metadata->>'persona_archetype' IS NULL);

-- Default for remaining
UPDATE agents SET
  metadata = metadata || jsonb_build_object('persona_archetype', 'Clinical Expert')
WHERE function_name = 'Medical Affairs'
  AND (metadata->>'persona_archetype' IS NULL);

-- ============================================================================
-- PART 6: ADD SENIORITY LEVELS BASED ON AGENT LEVEL
-- ============================================================================

-- L1 Masters = Executive
UPDATE agents SET
  metadata = metadata || jsonb_build_object('seniority_level', 'executive')
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 1 LIMIT 1)
  AND (metadata->>'seniority_level' IS NULL);

-- L2 Experts = Director
UPDATE agents SET
  metadata = metadata || jsonb_build_object('seniority_level', 'director')
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 2 LIMIT 1)
  AND (metadata->>'seniority_level' IS NULL);

-- L3 Specialists = Senior
UPDATE agents SET
  metadata = metadata || jsonb_build_object('seniority_level', 'senior')
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1)
  AND (metadata->>'seniority_level' IS NULL);

-- L4 Workers = Entry/Mid
UPDATE agents SET
  metadata = metadata || jsonb_build_object('seniority_level', 'entry')
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 4 LIMIT 1)
  AND (metadata->>'seniority_level' IS NULL);

-- L5 Tools = Entry
UPDATE agents SET
  metadata = metadata || jsonb_build_object('seniority_level', 'entry')
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND (metadata->>'seniority_level' IS NULL);

-- ============================================================================
-- PART 7: ADD COST_PER_QUERY BASED ON MODEL
-- ============================================================================

UPDATE agents SET cost_per_query = 0.35
WHERE function_name = 'Medical Affairs'
  AND base_model = 'gpt-4'
  AND (cost_per_query IS NULL OR cost_per_query = 0);

UPDATE agents SET cost_per_query = 0.08
WHERE function_name = 'Medical Affairs'
  AND base_model = 'gpt-4o-mini'
  AND (cost_per_query IS NULL OR cost_per_query = 0);

UPDATE agents SET cost_per_query = 0.015
WHERE function_name = 'Medical Affairs'
  AND base_model = 'gpt-3.5-turbo'
  AND (cost_per_query IS NULL OR cost_per_query = 0);

-- ============================================================================
-- PART 8: ADD CONTEXT_WINDOW AND MAX_TOKENS DEFAULTS
-- ============================================================================

-- GPT-4 defaults
UPDATE agents SET
  context_window = COALESCE(context_window, 8000),
  max_tokens = COALESCE(max_tokens, 4000)
WHERE function_name = 'Medical Affairs'
  AND base_model = 'gpt-4';

-- GPT-4o-mini defaults
UPDATE agents SET
  context_window = COALESCE(context_window, 4000),
  max_tokens = COALESCE(max_tokens, 2000)
WHERE function_name = 'Medical Affairs'
  AND base_model = 'gpt-4o-mini';

-- GPT-3.5-turbo defaults
UPDATE agents SET
  context_window = COALESCE(context_window, 4000),
  max_tokens = COALESCE(max_tokens, 2000)
WHERE function_name = 'Medical Affairs'
  AND base_model = 'gpt-3.5-turbo';

-- ============================================================================
-- PART 9: VERIFICATION
-- ============================================================================

-- Check enrichment results
SELECT
  base_model,
  COUNT(*) as total,
  COUNT(metadata->>'model_justification') as has_justification,
  COUNT(metadata->>'model_citation') as has_citation,
  COUNT(metadata->>'persona_archetype') as has_persona,
  COUNT(metadata->>'seniority_level') as has_seniority
FROM agents
WHERE function_name = 'Medical Affairs'
  AND status = 'active'
GROUP BY base_model
ORDER BY total DESC;

-- Summary
SELECT
  'Medical Affairs Enrichment' as migration,
  COUNT(*) as total_agents,
  COUNT(CASE WHEN metadata->>'model_justification' IS NOT NULL THEN 1 END) as with_justification,
  COUNT(CASE WHEN metadata->>'model_citation' IS NOT NULL THEN 1 END) as with_citation,
  COUNT(CASE WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN 1 END) as with_avatar,
  COUNT(CASE WHEN cost_per_query > 0 THEN 1 END) as with_cost
FROM agents
WHERE function_name = 'Medical Affairs' AND status = 'active';
