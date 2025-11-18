-- =============================================================================
-- CREATE NEW ENUM FOR EXPERTISE LEVELS
-- =============================================================================
-- The existing domain_expertise is used for functional areas
-- We need a new enum for expertise levels
-- =============================================================================

-- Create a new enum for expertise levels
DO $$ BEGIN
  CREATE TYPE expertise_level AS ENUM (
    'foundational',
    'intermediate',
    'advanced',
    'expert',
    'thought_leader'
  );
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'expertise_level enum already exists';
END $$;

DO $$
BEGIN
  RAISE NOTICE '✅ Created expertise_level enum';
  RAISE NOTICE 'Note: domain_expertise is for functional areas';
  RAISE NOTICE 'expertise_level is for proficiency levels';
END $$;
