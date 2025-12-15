-- Migration: Add template_id column to missions table
-- Date: December 11, 2025
-- Purpose: Link missions to their source template for proper state persistence
-- Priority: P0 (Blocking) - Required for Mode 3/4 mission template functionality

-- =============================================================================
-- ISSUE: missions table missing template_id column
-- ERROR: "Could not find the 'template_id' column of 'missions' in the schema cache"
-- =============================================================================

-- Step 1: Add template_id column to missions table
ALTER TABLE missions ADD COLUMN IF NOT EXISTS template_id TEXT;

-- Step 2: Add foreign key constraint (idempotent)
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_mission_template'
          AND table_name = 'missions'
    ) THEN
        ALTER TABLE missions ADD CONSTRAINT fk_mission_template
            FOREIGN KEY (template_id) REFERENCES mission_templates(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- Step 3: Add index for performance on template_id lookups
CREATE INDEX IF NOT EXISTS idx_missions_template_id ON missions(template_id);

-- Step 4: Backfill existing missions with template_id from metadata (if present)
-- This handles missions created before this column existed
UPDATE missions
SET template_id = metadata->>'template_slug'
WHERE template_id IS NULL
  AND metadata->>'template_slug' IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM mission_templates
    WHERE id = metadata->>'template_slug'
  );

-- Also check for 'template_id' key in metadata (some code paths use this)
UPDATE missions
SET template_id = metadata->>'template_id'
WHERE template_id IS NULL
  AND metadata->>'template_id' IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM mission_templates
    WHERE id = metadata->>'template_id'
  );

-- Step 5: Add RLS policy for template_id (if RLS is enabled on missions)
-- This ensures users can only access missions with templates they have access to
DO $$
BEGIN
    -- Check if RLS is enabled on missions table
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'missions'
          AND c.relrowsecurity = true
    ) THEN
        -- Drop existing policy if it exists to recreate with new column
        DROP POLICY IF EXISTS "missions_template_access" ON missions;

        -- Create policy that allows access to missions with any template
        -- (template access control is through the mission itself, not separate)
        CREATE POLICY "missions_template_access" ON missions
            FOR ALL
            USING (
                tenant_id = (current_setting('app.tenant_id', true))::uuid
            );
    END IF;
END $$;

-- =============================================================================
-- VERIFICATION QUERY (run after migration)
-- =============================================================================
-- SELECT
--     column_name,
--     data_type,
--     is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'missions'
--   AND column_name = 'template_id';
-- =============================================================================

COMMENT ON COLUMN missions.template_id IS 'Reference to the mission_template used to create this mission. NULL if created without a template.';
