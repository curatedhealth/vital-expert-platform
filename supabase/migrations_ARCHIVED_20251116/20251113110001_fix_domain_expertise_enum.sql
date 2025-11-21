-- =============================================================================
-- FIX domain_expertise ENUM - Check and Add Missing Values
-- =============================================================================

-- First, let's see what values currently exist
DO $$
DECLARE
  enum_values TEXT;
BEGIN
  SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder)
  INTO enum_values
  FROM pg_enum
  WHERE enumtypid = 'domain_expertise'::regtype;

  RAISE NOTICE 'Current domain_expertise values: %', enum_values;
END $$;

-- Add all required values if they don't exist
DO $$
BEGIN
  -- Add 'foundational' if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'foundational'
    AND enumtypid = 'domain_expertise'::regtype
  ) THEN
    ALTER TYPE domain_expertise ADD VALUE 'foundational';
    RAISE NOTICE 'Added: foundational';
  END IF;

  -- Add 'intermediate' if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'intermediate'
    AND enumtypid = 'domain_expertise'::regtype
  ) THEN
    ALTER TYPE domain_expertise ADD VALUE 'intermediate';
    RAISE NOTICE 'Added: intermediate';
  END IF;

  -- Add 'advanced' if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'advanced'
    AND enumtypid = 'domain_expertise'::regtype
  ) THEN
    ALTER TYPE domain_expertise ADD VALUE 'advanced';
    RAISE NOTICE 'Added: advanced';
  END IF;

  -- Add 'expert' if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'expert'
    AND enumtypid = 'domain_expertise'::regtype
  ) THEN
    ALTER TYPE domain_expertise ADD VALUE 'expert';
    RAISE NOTICE 'Added: expert';
  END IF;

  -- Add 'thought_leader' if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'thought_leader'
    AND enumtypid = 'domain_expertise'::regtype
  ) THEN
    ALTER TYPE domain_expertise ADD VALUE 'thought_leader';
    RAISE NOTICE 'Added: thought_leader';
  END IF;

  RAISE NOTICE '✅ domain_expertise ENUM fixed';
END $$;

-- Verify the final values
DO $$
DECLARE
  enum_values TEXT;
BEGIN
  SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder)
  INTO enum_values
  FROM pg_enum
  WHERE enumtypid = 'domain_expertise'::regtype;

  RAISE NOTICE 'Final domain_expertise values: %', enum_values;
END $$;
