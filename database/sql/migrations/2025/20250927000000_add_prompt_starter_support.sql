-- Add prompt_starter support to prompts table
-- This enables agents to have specific prompt starters that reference the prompt library

-- Add prompt_starter field to prompts table
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS prompt_starter TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft'));

-- Update existing records to have status = 'active' where is_active = true
UPDATE prompts SET status = 'active' WHERE is_active = true;
UPDATE prompts SET status = 'inactive' WHERE is_active = false;

-- Add index for prompt_starter field
CREATE INDEX IF NOT EXISTS idx_prompts_starter ON prompts(prompt_starter) WHERE prompt_starter IS NOT NULL;

-- Add comments for new fields
COMMENT ON COLUMN prompts.prompt_starter IS 'Short display text for agent prompt starters (e.g., "Analyze 510(k) requirements")';
COMMENT ON COLUMN prompts.status IS 'Status of the prompt: active, inactive, or draft';

-- Fix RLS policies to use correct column name
DROP POLICY IF EXISTS "Public prompts are viewable by everyone" ON prompts;
CREATE POLICY "Public prompts are viewable by everyone"
    ON prompts FOR SELECT
    USING (status = 'active');

-- Update prompt_capabilities RLS policy
DROP POLICY IF EXISTS "Prompt capabilities are viewable with prompt access" ON prompt_capabilities;
CREATE POLICY "Prompt capabilities are viewable with prompt access"
    ON prompt_capabilities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = prompt_capabilities.prompt_id
            AND prompts.status = 'active'
        )
    );

-- Create function to get agent prompt starters
CREATE OR REPLACE FUNCTION get_agent_prompt_starters(agent_name_param TEXT)
RETURNS TABLE (
    id UUID,
    prompt_starter TEXT,
    name TEXT,
    display_name TEXT,
    description TEXT,
    domain TEXT,
    complexity_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.prompt_starter,
        p.name,
        p.display_name,
        p.description,
        p.domain,
        p.complexity_level
    FROM prompts p
    WHERE p.status = 'active'
    AND p.prompt_starter IS NOT NULL
    AND p.domain IN (
        SELECT DISTINCT unnest(knowledge_domains)
        FROM agents
        WHERE name = agent_name_param OR display_name = agent_name_param
    )
    ORDER BY p.complexity_level, p.display_name
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_agent_prompt_starters(TEXT) TO authenticated, anon;