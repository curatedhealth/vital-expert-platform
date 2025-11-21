-- =============================================================================
-- FIX validation_status ENUM - Add Missing 'draft' Value
-- =============================================================================

-- First, let's see what values currently exist
DO $$
DECLARE
  enum_values TEXT;
BEGIN
  SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder)
  INTO enum_values
  FROM pg_enum
  WHERE enumtypid = 'validation_status'::regtype;

  RAISE NOTICE 'Current validation_status values: %', enum_values;
END $$;

-- Add 'draft' if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'draft'
    AND enumtypid = 'validation_status'::regtype
  ) THEN
    ALTER TYPE validation_status ADD VALUE 'draft';
    RAISE NOTICE 'Added: draft';
  ELSE
    RAISE NOTICE 'draft already exists';
  END IF;
END $$;

-- Add 'pending' if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'pending'
    AND enumtypid = 'validation_status'::regtype
  ) THEN
    ALTER TYPE validation_status ADD VALUE 'pending';
    RAISE NOTICE 'Added: pending';
  ELSE
    RAISE NOTICE 'pending already exists';
  END IF;
END $$;

-- Add 'approved' if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'approved'
    AND enumtypid = 'validation_status'::regtype
  ) THEN
    ALTER TYPE validation_status ADD VALUE 'approved';
    RAISE NOTICE 'Added: approved';
  ELSE
    RAISE NOTICE 'approved already exists';
  END IF;
END $$;

-- Add 'rejected' if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'rejected'
    AND enumtypid = 'validation_status'::regtype
  ) THEN
    ALTER TYPE validation_status ADD VALUE 'rejected';
    RAISE NOTICE 'Added: rejected';
  ELSE
    RAISE NOTICE 'rejected already exists';
  END IF;
END $$;

-- Add 'needs_revision' if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'needs_revision'
    AND enumtypid = 'validation_status'::regtype
  ) THEN
    ALTER TYPE validation_status ADD VALUE 'needs_revision';
    RAISE NOTICE 'Added: needs_revision';
  ELSE
    RAISE NOTICE 'needs_revision already exists';
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
  WHERE enumtypid = 'validation_status'::regtype;

  RAISE NOTICE '✅ validation_status ENUM fixed';
  RAISE NOTICE 'Final validation_status values: %', enum_values;
END $$;
