-- Fix knowledge_domains column to be TEXT[] instead of VARCHAR(7) or other restrictive type
-- This migration ensures agents.knowledge_domains can store an array of domain names

DO $$
BEGIN
  -- Check if knowledge_domains column exists and alter it
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'agents'
    AND column_name = 'knowledge_domains'
  ) THEN
    -- Drop the column if it has wrong type and recreate
    ALTER TABLE agents DROP COLUMN IF EXISTS knowledge_domains CASCADE;
    ALTER TABLE agents ADD COLUMN knowledge_domains TEXT[];

    -- Recreate the GIN index for efficient array queries
    CREATE INDEX IF NOT EXISTS idx_agents_knowledge_domains ON agents USING GIN(knowledge_domains);

    RAISE NOTICE 'Successfully fixed knowledge_domains column to TEXT[]';
  ELSE
    -- Column doesn't exist, create it
    ALTER TABLE agents ADD COLUMN knowledge_domains TEXT[];
    CREATE INDEX IF NOT EXISTS idx_agents_knowledge_domains ON agents USING GIN(knowledge_domains);

    RAISE NOTICE 'Created knowledge_domains column as TEXT[]';
  END IF;
END $$;