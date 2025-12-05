-- Migration: Update Advanced Therapy Regulatory Expert to L2 with proper hierarchy
-- Agent ID: c934e9bf-19e0-4952-a46e-a7460ae43418
-- Target: Configure as L2 Expert with L3 Specialists, L4 Workers, L5 Tools
-- Note: The agent is ALREADY at L2 (agent_level_id references the Expert level)
--       This migration enables spawning capabilities and configures hierarchy

-- ============================================================================
-- PART 1: Enable L2 Expert spawning capabilities
-- ============================================================================

UPDATE agents
SET
  -- L2 Expert model configuration
  base_model = 'gpt-4o',
  temperature = 0.4,
  max_tokens = 4096,
  context_window = 8000,
  cost_per_query = 0.12,

  -- L2 Expert token budget
  token_budget_min = 1500,
  token_budget_max = 2000,
  token_budget_recommended = 1700,

  -- L2 spawning capabilities
  can_spawn_l2 = false,
  can_spawn_l3 = true,
  can_spawn_l4 = true,
  can_use_worker_pool = true,
  can_escalate_to = 'L1',

  -- Model justification and citation (evidence-based)
  model_justification = 'L2 Expert requiring high accuracy for advanced therapy regulatory guidance. GPT-4 achieves 86.7% on MedQA (USMLE). Critical for regulatory strategy and compliance-sensitive operations in ATMPs.',
  model_citation = 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',

  -- Update timestamp
  updated_at = NOW()

WHERE id = 'c934e9bf-19e0-4952-a46e-a7460ae43418';

-- ============================================================================
-- PART 2: Configure hierarchy in metadata using specific agent IDs
-- Note: These IDs were found by querying the database for agents at each level
-- ============================================================================

UPDATE agents
SET metadata = jsonb_build_object(
  'rag_enabled', true,
  'websearch_enabled', true,
  'tools_enabled', jsonb_build_array('websearch', 'rag_search', 'knowledge_base'),
  'knowledge_namespaces', jsonb_build_array('KD-digital-health', 'KD-regulatory', 'KD-medical', 'KD-pharma', 'KD-general'),
  'hierarchy', jsonb_build_object(
    'l3_specialists', jsonb_build_object(
      'configured', jsonb_build_array(
        jsonb_build_object('agent_id', 'fbaea2a6-de9b-4ac0-ab80-7be785671a7f', 'agent_name', 'Compliance Analyst Specialist', 'agent_level', 3, 'priority', 1, 'is_enabled', true, 'assignment_type', 'manual'),
        jsonb_build_object('agent_id', 'dc26f714-1ec7-4d42-af62-26ab70198ca7', 'agent_name', 'Regulatory Timeline Calculator', 'agent_level', 3, 'priority', 2, 'is_enabled', true, 'assignment_type', 'manual'),
        jsonb_build_object('agent_id', '7f67bf01-eae5-4ad2-901c-76e2012f5687', 'agent_name', 'Regulatory Correspondence Handler', 'agent_level', 3, 'priority', 3, 'is_enabled', true, 'assignment_type', 'manual'),
        jsonb_build_object('agent_id', '19e414c0-e644-44a7-b71e-df13b9113075', 'agent_name', 'Regulatory Intelligence Collector', 'agent_level', 3, 'priority', 4, 'is_enabled', true, 'assignment_type', 'manual'),
        jsonb_build_object('agent_id', 'f5d3c65b-aab5-47fc-8621-6e132a334d2e', 'agent_name', 'Regulatory Submission Validator', 'agent_level', 3, 'priority', 5, 'is_enabled', true, 'assignment_type', 'manual')
      )
    ),
    'l4_workers', jsonb_build_object(
      'configured', jsonb_build_array(
        jsonb_build_object('agent_id', '81821c30-bbe4-4b78-bcac-9da325b4b9b7', 'agent_name', 'PDF Document Processor', 'agent_level', 4, 'priority', 1, 'is_enabled', true, 'assignment_type', 'manual'),
        jsonb_build_object('agent_id', '6810e7d4-899c-436c-903e-5ac19a42e88b', 'agent_name', 'Universal Document Validator', 'agent_level', 4, 'priority', 2, 'is_enabled', true, 'assignment_type', 'manual'),
        jsonb_build_object('agent_id', 'c4bef7e2-daf5-4fea-ac07-c9adc89d4caf', 'agent_name', 'Submission Document Processor', 'agent_level', 4, 'priority', 3, 'is_enabled', true, 'assignment_type', 'manual'),
        jsonb_build_object('agent_id', 'b0d8d2db-95b2-4e5c-a505-197b87a791fa', 'agent_name', 'Value Dossier Generator', 'agent_level', 4, 'priority', 4, 'is_enabled', true, 'assignment_type', 'manual'),
        jsonb_build_object('agent_id', '2aa1ab0c-e0c7-4554-a017-1735a2c1ea57', 'agent_name', 'Variation Submission Processor', 'agent_level', 4, 'priority', 5, 'is_enabled', true, 'assignment_type', 'manual')
      ),
      'use_pool', true,
      'max_concurrent', 3
    ),
    'l5_tools', jsonb_build_object(
      'configured', jsonb_build_array(
        jsonb_build_object('agent_id', '065c1ba2-0a21-411b-8c8e-312a438a5a8e', 'agent_name', 'Deadline Calculator', 'agent_level', 5, 'priority', 1, 'is_enabled', true, 'assignment_type', 'manual'),
        jsonb_build_object('agent_id', 'c3d1ab06-1da3-4208-be05-1e14f4cc527f', 'agent_name', 'Grammar Checker', 'agent_level', 5, 'priority', 2, 'is_enabled', true, 'assignment_type', 'manual'),
        jsonb_build_object('agent_id', '8ea2fae6-db47-4e8c-84a9-8f86c9f4024f', 'agent_name', 'Spell Checker', 'agent_level', 5, 'priority', 3, 'is_enabled', true, 'assignment_type', 'manual')
      )
    ),
    'context_engineer', jsonb_build_object(
      'is_enabled', true,
      'context_strategy', 'selective'
    ),
    'last_configured_at', NOW()::text,
    'configured_by', 'system_migration'
  )
)
WHERE id = 'c934e9bf-19e0-4952-a46e-a7460ae43418';

-- ============================================================================
-- PART 3: Assign relevant skills (via agent_skill_assignments if table exists)
-- ============================================================================

DO $$
DECLARE
  skill_ids uuid[];
  skill_id uuid;
BEGIN
  -- Find regulatory-related skill IDs
  SELECT array_agg(id) INTO skill_ids
  FROM skills
  WHERE category ILIKE '%regulatory%'
     OR category ILIKE '%compliance%'
     OR name ILIKE '%regulatory%'
     OR name ILIKE '%fda%'
     OR name ILIKE '%ema%'
     OR name ILIKE '%submission%'
     OR name ILIKE '%advanced therapy%'
     OR name ILIKE '%atmp%'
     OR name ILIKE '%ctd%'
     OR name ILIKE '%clinical%trial%'
  LIMIT 10;

  -- If we found skills, assign them
  IF skill_ids IS NOT NULL AND array_length(skill_ids, 1) > 0 THEN
    FOREACH skill_id IN ARRAY skill_ids
    LOOP
      -- Insert skill assignment if not exists
      INSERT INTO agent_skill_assignments (agent_id, skill_id, created_at)
      VALUES ('c934e9bf-19e0-4952-a46e-a7460ae43418', skill_id, NOW())
      ON CONFLICT (agent_id, skill_id) DO NOTHING;
    END LOOP;

    RAISE NOTICE 'Assigned % skills to Advanced Therapy Regulatory Expert', array_length(skill_ids, 1);
  ELSE
    RAISE NOTICE 'No matching skills found to assign';
  END IF;

EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'agent_skill_assignments table does not exist - skipping skill assignment';
  WHEN OTHERS THEN
    RAISE NOTICE 'Error assigning skills: %', SQLERRM;
END $$;

-- ============================================================================
-- PART 4: Verify the update
-- ============================================================================

DO $$
DECLARE
  agent_record RECORD;
BEGIN
  SELECT
    id,
    name,
    agent_level_id,
    base_model,
    can_spawn_l3,
    can_spawn_l4,
    can_use_worker_pool,
    can_escalate_to,
    jsonb_array_length(COALESCE(metadata->'hierarchy'->'l3_specialists'->'configured', '[]'::jsonb)) as l3_count,
    jsonb_array_length(COALESCE(metadata->'hierarchy'->'l4_workers'->'configured', '[]'::jsonb)) as l4_count,
    jsonb_array_length(COALESCE(metadata->'hierarchy'->'l5_tools'->'configured', '[]'::jsonb)) as l5_count
  INTO agent_record
  FROM agents
  WHERE id = 'c934e9bf-19e0-4952-a46e-a7460ae43418';

  IF agent_record IS NOT NULL THEN
    RAISE NOTICE '✅ Agent Updated Successfully:';
    RAISE NOTICE '   Name: %', agent_record.name;
    RAISE NOTICE '   Agent Level ID: %', agent_record.agent_level_id;
    RAISE NOTICE '   Model: %', agent_record.base_model;
    RAISE NOTICE '   Can Spawn L3: %', agent_record.can_spawn_l3;
    RAISE NOTICE '   Can Spawn L4: %', agent_record.can_spawn_l4;
    RAISE NOTICE '   Can Use Worker Pool: %', agent_record.can_use_worker_pool;
    RAISE NOTICE '   Can Escalate To: %', agent_record.can_escalate_to;
    RAISE NOTICE '   Assigned L3 Specialists: %', agent_record.l3_count;
    RAISE NOTICE '   Assigned L4 Workers: %', agent_record.l4_count;
    RAISE NOTICE '   Assigned L5 Tools: %', agent_record.l5_count;
  ELSE
    RAISE WARNING '❌ Agent not found with ID: c934e9bf-19e0-4952-a46e-a7460ae43418';
  END IF;
END $$;
