-- =====================================================================================
-- Add documentation_url column to agents table
-- =====================================================================================
-- Purpose: Link each agent to its MD documentation in Supabase Storage
-- Agents can fetch their docs via public URL instead of local files
-- =====================================================================================

DO $$
BEGIN
    -- Add documentation_url column (public URL to Supabase Storage)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agents' AND column_name = 'documentation_url'
    ) THEN
        ALTER TABLE agents 
        ADD COLUMN documentation_url TEXT;
        
        RAISE NOTICE '✓ Added documentation_url column to agents table';
    ELSE
        RAISE NOTICE 'ℹ️  documentation_url column already exists';
    END IF;

    -- Add documentation_path column (path within storage bucket)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agents' AND column_name = 'documentation_path'
    ) THEN
        ALTER TABLE agents 
        ADD COLUMN documentation_path TEXT;
        
        RAISE NOTICE '✓ Added documentation_path column to agents table';
    ELSE
        RAISE NOTICE 'ℹ️  documentation_path column already exists';
    END IF;

    -- Add index for faster lookups
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'agents' AND indexname = 'idx_agents_documentation_url'
    ) THEN
        CREATE INDEX idx_agents_documentation_url ON agents(documentation_url) 
        WHERE documentation_url IS NOT NULL;
        
        RAISE NOTICE '✓ Created index on documentation_url';
    END IF;

END $$;

-- Verify the schema changes
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'agents'
AND column_name IN ('documentation_url', 'documentation_path')
ORDER BY column_name;

