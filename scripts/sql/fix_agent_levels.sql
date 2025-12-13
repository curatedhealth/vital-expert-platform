-- Fix agent level reference data and ensure agents join correctly in UI analytics.
-- Uses the canonical level IDs from agent_levels_rows (1).csv
-- L1 Master | L2 Expert | L3 Specialist | L4 Worker | L5 Tool

BEGIN;

-- Ensure uniqueness on level_number and slug to avoid duplicate joins.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'agent_levels_level_number_key'
  ) THEN
    ALTER TABLE agent_levels
      ADD CONSTRAINT agent_levels_level_number_key UNIQUE (level_number);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'agent_levels_slug_key'
  ) THEN
    ALTER TABLE agent_levels
      ADD CONSTRAINT agent_levels_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Upsert the five canonical levels.
INSERT INTO agent_levels (id, name, slug, level_number, description, definition, purpose)
VALUES
  ('5e27905e-6f58-462e-93a4-6fad5388ebaf', 'Master',      'master',      1, 'L1 Master - strategic orchestrator', 'L1 Master - strategic orchestrator', 'Strategic orchestration across domains'),
  ('a6e394b0-6ca1-4cb1-8097-719523ee6782', 'Expert',      'expert',      2, 'L2 Expert - domain specialist',       'L2 Expert - domain specialist',       'Primary domain interaction and synthesis'),
  ('5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb', 'Specialist',  'specialist',  3, 'L3 Specialist - focused sub-expert',  'L3 Specialist - focused sub-expert',  'Focused sub-domain execution and analysis'),
  ('c6f7eec5-3fc5-4f10-b030-bce0d22480e8', 'Worker',      'worker',      4, 'L4 Worker - task executor',           'L4 Worker - task executor',           'Deterministic task execution under L3'),
  ('45420d67-67bf-44cf-a842-44bbaf3145e7', 'Tool',        'tool',        5, 'L5 Tool - atomic function',           'L5 Tool - atomic function',           'Atomic utility functions')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    level_number = EXCLUDED.level_number,
    description = EXCLUDED.description,
    definition = EXCLUDED.definition,
    purpose = EXCLUDED.purpose;

-- Optional: normalize any agents pointing to unknown level IDs by setting them to NULL for review.
UPDATE agents
SET agent_level_id = NULL
WHERE agent_level_id IS NOT NULL
  AND agent_level_id NOT IN (
    '5e27905e-6f58-462e-93a4-6fad5388ebaf',
    'a6e394b0-6ca1-4cb1-8097-719523ee6782',
    '5a3647eb-a2bd-43f2-9c8b-6413d39ed0fb',
    'c6f7eec5-3fc5-4f10-b030-bce0d22480e8',
    '45420d67-67bf-44cf-a842-44bbaf3145e7'
  );

COMMIT;

-- Verification queries (run manually as needed):
-- SELECT id, name, slug, level_number FROM agent_levels ORDER BY level_number;
-- SELECT al.level_number, al.name, COUNT(*) AS cnt
-- FROM agents a
-- LEFT JOIN agent_levels al ON al.id = a.agent_level_id
-- GROUP BY al.level_number, al.name
-- ORDER BY cnt DESC;
