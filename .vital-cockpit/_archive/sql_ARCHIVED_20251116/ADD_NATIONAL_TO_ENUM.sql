-- =====================================================
-- ADD 'national' TO geographic_scope_type ENUM
-- Date: 2025-11-15
-- Purpose: Fix Part 2 seed file compatibility
-- =====================================================

-- Add 'national' value to the enum if it doesn't exist
-- Note: PostgreSQL doesn't support IF NOT EXISTS for ALTER TYPE ADD VALUE in all versions
-- If this fails with "already exists", that's fine - it means it's already been added

DO $$
BEGIN
  -- Check if 'national' already exists in the enum
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'geographic_scope_type'
      AND e.enumlabel = 'national'
  ) THEN
    -- Add 'national' after 'country'
    ALTER TYPE geographic_scope_type ADD VALUE 'national' AFTER 'country';
    RAISE NOTICE '✅ Added ''national'' to geographic_scope_type enum';
  ELSE
    RAISE NOTICE '⚠️  ''national'' already exists in geographic_scope_type enum';
  END IF;
END $$;

-- Verify the enum values
SELECT
  'geographic_scope_type enum values:' as info,
  enumlabel as value,
  enumsortorder as sort_order
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'geographic_scope_type'
ORDER BY enumsortorder;
