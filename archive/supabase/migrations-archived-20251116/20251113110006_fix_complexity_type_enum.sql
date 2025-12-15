-- =============================================================================
-- FIX complexity_type ENUM - Add Missing Values
-- =============================================================================

-- First, let's see what values currently exist
DO $$
DECLARE
  enum_values TEXT;
BEGIN
  SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder)
  INTO enum_values
  FROM pg_enum
  WHERE enumtypid = 'complexity_type'::regtype;

  RAISE NOTICE 'Current complexity_type values: %', enum_values;
END $$;

-- Add 'low' if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'low'
    AND enumtypid = 'complexity_type'::regtype
  ) THEN
    ALTER TYPE complexity_type ADD VALUE 'low';
    RAISE NOTICE 'Added: low';
  ELSE
    RAISE NOTICE 'low already exists';
  END IF;
END $$;

-- Add 'medium' if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'medium'
    AND enumtypid = 'complexity_type'::regtype
  ) THEN
    ALTER TYPE complexity_type ADD VALUE 'medium';
    RAISE NOTICE 'Added: medium';
  ELSE
    RAISE NOTICE 'medium already exists';
  END IF;
END $$;

-- Add 'high' if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'high'
    AND enumtypid = 'complexity_type'::regtype
  ) THEN
    ALTER TYPE complexity_type ADD VALUE 'high';
    RAISE NOTICE 'Added: high';
  ELSE
    RAISE NOTICE 'high already exists';
  END IF;
END $$;

-- Add 'very_high' if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'very_high'
    AND enumtypid = 'complexity_type'::regtype
  ) THEN
    ALTER TYPE complexity_type ADD VALUE 'very_high';
    RAISE NOTICE 'Added: very_high';
  ELSE
    RAISE NOTICE 'very_high already exists';
  END IF;
END $$;

-- Verify the final values
DO $$
DECLARE
  enum_values TEXT;
BEGIN
  SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder)
  INTO enum_values
  FROM pg_enum
  WHERE enumtypid = 'complexity_type'::regtype;

  RAISE NOTICE '✅ complexity_type ENUM fixed';
  RAISE NOTICE 'Final complexity_type values: %', enum_values;
END $$;
