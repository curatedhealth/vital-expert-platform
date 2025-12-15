-- Add metadata column to prompts table if it doesn't exist
-- This stores Suite, Sub_Suite, and other metadata from CSV imports

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'prompts' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE prompts ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        CREATE INDEX IF NOT EXISTS idx_prompts_metadata ON prompts USING GIN(metadata);
    END IF;
END $$;

