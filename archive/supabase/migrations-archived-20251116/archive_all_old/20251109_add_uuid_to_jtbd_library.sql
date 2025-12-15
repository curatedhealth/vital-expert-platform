-- ============================================================================
-- Migration: Add UUID Support to jtbd_library for Workflow Linking
-- Date: 2025-11-09
-- Purpose: Enable jtbd_library records to link with dh_workflow table
-- ============================================================================

-- Add UUID column to jtbd_library
-- This allows JTBDs to link with workflows while maintaining human-readable VARCHAR ids
ALTER TABLE public.jtbd_library
ADD COLUMN IF NOT EXISTS uuid_id UUID DEFAULT gen_random_uuid();

-- Create index for performance on UUID lookups
CREATE INDEX IF NOT EXISTS idx_jtbd_library_uuid ON public.jtbd_library(uuid_id);

-- Add unique constraint to ensure no duplicate UUIDs
ALTER TABLE public.jtbd_library
ADD CONSTRAINT IF NOT EXISTS jtbd_library_uuid_unique UNIQUE (uuid_id);

-- Add column comment for documentation
COMMENT ON COLUMN public.jtbd_library.uuid_id IS 'UUID for internal linking to workflows. Use "id" field for external references and URLs.';

-- Verify migration
DO $$
DECLARE
  total_jtbds INTEGER;
  jtbds_with_uuid INTEGER;
BEGIN
  -- Count total JTBDs
  SELECT COUNT(*) INTO total_jtbds FROM public.jtbd_library;

  -- Count JTBDs with UUIDs
  SELECT COUNT(*) INTO jtbds_with_uuid FROM public.jtbd_library WHERE uuid_id IS NOT NULL;

  -- Log results
  RAISE NOTICE '✅ Migration Complete:';
  RAISE NOTICE '   Total JTBDs: %', total_jtbds;
  RAISE NOTICE '   JTBDs with UUID: %', jtbds_with_uuid;

  -- Verify all have UUIDs
  IF total_jtbds = jtbds_with_uuid THEN
    RAISE NOTICE '   ✅ All JTBDs have UUIDs assigned';
  ELSE
    RAISE WARNING '   ⚠️ Some JTBDs missing UUIDs: %', (total_jtbds - jtbds_with_uuid);
  END IF;
END $$;

-- Sample query to verify both IDs exist
-- SELECT id, uuid_id, jtbd_code, title FROM public.jtbd_library LIMIT 5;
