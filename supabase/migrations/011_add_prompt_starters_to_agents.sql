-- ============================================================================
-- Migration 011: Add Prompt Starters to Agents Table
-- ============================================================================
-- Purpose: Add prompt_starters JSONB column to store conversation starters
-- Date: 2025-01-17
-- ============================================================================

-- Add prompt_starters column to agents table
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS prompt_starters JSONB DEFAULT '[]'::jsonb;

-- Add comment to document structure
COMMENT ON COLUMN agents.prompt_starters IS 'Array of conversation starter objects with structure: [{"number": 1, "title": "Short Title", "prompt_id": "uuid", "prompt_code": "USR-xxx"}]';

-- Create index for faster queries on prompt starters
CREATE INDEX IF NOT EXISTS idx_agents_prompt_starters ON agents USING GIN (prompt_starters);

-- Validate JSON structure helper function
CREATE OR REPLACE FUNCTION validate_prompt_starters_structure()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if prompt_starters is an array
    IF jsonb_typeof(NEW.prompt_starters) != 'array' THEN
        RAISE EXCEPTION 'prompt_starters must be a JSON array';
    END IF;

    -- Validate each starter has required fields
    IF NEW.prompt_starters IS NOT NULL THEN
        DECLARE
            starter JSONB;
        BEGIN
            FOR starter IN SELECT * FROM jsonb_array_elements(NEW.prompt_starters)
            LOOP
                -- Check for required fields
                IF NOT (starter ? 'number' AND starter ? 'title' AND starter ? 'prompt_id') THEN
                    RAISE EXCEPTION 'Each prompt starter must have number, title, and prompt_id fields';
                END IF;
            END LOOP;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for validation (optional - can be enabled later)
-- CREATE TRIGGER trigger_validate_prompt_starters
-- BEFORE INSERT OR UPDATE ON agents
-- FOR EACH ROW
-- EXECUTE FUNCTION validate_prompt_starters_structure();

-- ============================================================================
-- Completion Notice
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 011 Complete: Added prompt_starters column to agents table';
    RAISE NOTICE '   - Column Type: JSONB';
    RAISE NOTICE '   - Default Value: [] (empty array)';
    RAISE NOTICE '   - Index Created: idx_agents_prompt_starters (GIN)';
    RAISE NOTICE '   - Validation Function: validate_prompt_starters_structure() (available but not triggered)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Step: Run scripts/update_agents_with_prompt_starters.py';
END $$;
