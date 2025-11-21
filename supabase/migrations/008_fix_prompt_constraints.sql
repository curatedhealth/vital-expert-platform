-- ============================================================================
-- Fix Prompt Table Constraints
-- ============================================================================

-- Ensure unique constraint on agent_prompts exists
DO $$
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE agent_prompts DROP CONSTRAINT IF EXISTS unique_agent_prompt_context;

    -- Add the constraint
    ALTER TABLE agent_prompts
    ADD CONSTRAINT unique_agent_prompt_context
    UNIQUE (agent_id, prompt_id, usage_context);

    RAISE NOTICE '✅ Added unique constraint to agent_prompts';
EXCEPTION
    WHEN duplicate_table THEN
        RAISE NOTICE 'Constraint already exists';
END $$;

-- Ensure unique constraint on suite_prompts
-- Note: This needs special handling because sub_suite_id can be NULL
DO $$
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE suite_prompts DROP CONSTRAINT IF EXISTS unique_suite_prompt;

    -- For suite_prompts, we need a partial unique index because sub_suite_id can be NULL
    -- PostgreSQL treats NULL values as distinct in unique constraints
    DROP INDEX IF EXISTS idx_suite_prompts_unique_with_sub;
    DROP INDEX IF EXISTS idx_suite_prompts_unique_without_sub;

    -- Create partial unique indexes
    -- When sub_suite_id is NOT NULL
    CREATE UNIQUE INDEX idx_suite_prompts_unique_with_sub
    ON suite_prompts(prompt_id, suite_id, sub_suite_id)
    WHERE sub_suite_id IS NOT NULL;

    -- When sub_suite_id IS NULL
    CREATE UNIQUE INDEX idx_suite_prompts_unique_without_sub
    ON suite_prompts(prompt_id, suite_id)
    WHERE sub_suite_id IS NULL;

    RAISE NOTICE '✅ Added unique indexes to suite_prompts';
EXCEPTION
    WHEN duplicate_table THEN
        RAISE NOTICE 'Indexes already exist';
END $$;

-- Verify constraints
SELECT
    'agent_prompts' as table_name,
    COUNT(*) as constraint_count
FROM information_schema.table_constraints
WHERE table_name = 'agent_prompts'
AND constraint_type = 'UNIQUE'

UNION ALL

SELECT
    'suite_prompts' as table_name,
    COUNT(*) as index_count
FROM pg_indexes
WHERE tablename = 'suite_prompts'
AND indexname LIKE '%unique%';
