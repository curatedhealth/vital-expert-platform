-- ============================================================================
-- SIMPLE SCHEMA FIXES - Add category column to tools
-- ============================================================================
-- Description: Add missing category column to tools table
-- Date: 2025-11-18
-- ============================================================================

BEGIN;

-- ============================================================================
-- Add category column to tools table
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Adding category column to tools table...';

    -- Check if category column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tools' AND column_name = 'category'
    ) THEN
        -- Add category column as TEXT (nullable for now)
        ALTER TABLE tools ADD COLUMN category TEXT;
        RAISE NOTICE '✅ Category column added to tools table';
    ELSE
        RAISE NOTICE 'ℹ️  Category column already exists in tools table';
    END IF;
END $$;

-- ============================================================================
-- Add is_active column to tools table
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Adding is_active column to tools table...';

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tools' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE tools ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE '✅ is_active column added to tools table';
    ELSE
        RAISE NOTICE 'ℹ️  is_active column already exists in tools table';
    END IF;
END $$;

-- ============================================================================
-- Add tool_type column to tools table
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Adding tool_type column to tools table...';

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tools' AND column_name = 'tool_type'
    ) THEN
        ALTER TABLE tools ADD COLUMN tool_type TEXT;
        RAISE NOTICE '✅ tool_type column added to tools table';
    ELSE
        RAISE NOTICE 'ℹ️  tool_type column already exists in tools table';
    END IF;
END $$;

-- ============================================================================
-- Add indexes for performance
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Creating indexes...';
END $$;

-- Index on category
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);

-- Index on tenant_id + category
CREATE INDEX IF NOT EXISTS idx_tools_tenant_category ON tools(tenant_id, category);

-- Index on is_active
CREATE INDEX IF NOT EXISTS idx_tools_is_active ON tools(is_active) WHERE is_active = TRUE;

DO $$
BEGIN
    RAISE NOTICE '✅ Indexes created';
END $$;

-- ============================================================================
-- Update migration tracking
-- ============================================================================

UPDATE migration_tracking
SET status = 'completed',
    completed_at = NOW(),
    metrics = jsonb_build_object(
        'category_column_added', true,
        'is_active_column_added', true,
        'tool_type_column_added', true,
        'indexes_created', true
    )
WHERE migration_name = 'multi_tenant_migration'
  AND phase = '001_schema_fixes';

-- If no row exists, insert it
INSERT INTO migration_tracking (migration_name, phase, status, completed_at, metrics)
SELECT 'multi_tenant_migration', '001_simple_schema_fixes', 'completed', NOW(),
       jsonb_build_object(
           'category_column_added', true,
           'is_active_column_added', true,
           'tool_type_column_added', true,
           'indexes_created', true
       )
WHERE NOT EXISTS (
    SELECT 1 FROM migration_tracking
    WHERE migration_name = 'multi_tenant_migration'
      AND phase = '001_schema_fixes'
);

COMMIT;

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ Simple schema fixes completed successfully!';
    RAISE NOTICE '============================================';
END $$;
