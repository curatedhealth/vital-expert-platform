-- Populate agent-prompt relationships and ensure data consistency
-- This migration establishes the connections between agents and their prompt starters

-- First, ensure we have the latest schema applied
-- Add prompt_starter to prompts table if not exists
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS prompt_starter TEXT;

-- Update our get_agent_prompt_starters function to work with agent-prompt relationships
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
    INNER JOIN agent_prompts ap ON p.id = ap.prompt_id
    INNER JOIN agents a ON ap.agent_id = a.id
    WHERE a.name = agent_name_param OR a.display_name = agent_name_param
    AND p.status = 'active'
    AND p.prompt_starter IS NOT NULL
    ORDER BY p.complexity_level, p.display_name
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative function to get prompts by domain matching (fallback)
CREATE OR REPLACE FUNCTION get_agent_prompt_starters_by_domain(agent_name_param TEXT)
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
    AND p.domain = ANY(
        SELECT DISTINCT unnest(knowledge_domains)
        FROM agents
        WHERE name = agent_name_param OR display_name = agent_name_param
    )
    ORDER BY p.complexity_level, p.display_name
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to link agents to prompts based on domain expertise
CREATE OR REPLACE FUNCTION link_agents_to_prompts_by_domain()
RETURNS INTEGER AS $$
DECLARE
    link_count INTEGER := 0;
    agent_rec RECORD;
    prompt_rec RECORD;
BEGIN
    -- Loop through all active agents
    FOR agent_rec IN
        SELECT id, name, knowledge_domains, domain_expertise
        FROM agents
        WHERE status = 'active'
    LOOP
        -- Find matching prompts based on knowledge domains
        FOR prompt_rec IN
            SELECT id, domain
            FROM prompts
            WHERE status = 'active'
            AND prompt_starter IS NOT NULL
            AND (
                domain = ANY(agent_rec.knowledge_domains)
                OR domain = agent_rec.domain_expertise::text
            )
        LOOP
            -- Insert relationship if it doesn't exist
            INSERT INTO agent_prompts (agent_id, prompt_id, is_default)
            VALUES (agent_rec.id, prompt_rec.id, false)
            ON CONFLICT (agent_id, prompt_id) DO NOTHING;

            link_count := link_count + 1;
        END LOOP;
    LOOP;

    RETURN link_count;
END;
$$ LANGUAGE plpgsql;

-- Execute the linking function
SELECT link_agents_to_prompts_by_domain() as links_created;

-- Create specific agent-prompt relationships for our sample data
-- FDA Regulatory Strategist
DO $$
DECLARE
    fda_agent_id UUID;
    prompt_ids UUID[];
BEGIN
    -- Get FDA agent ID
    SELECT id INTO fda_agent_id FROM agents WHERE name LIKE '%fda%' OR display_name ILIKE '%fda%' LIMIT 1;

    IF fda_agent_id IS NOT NULL THEN
        -- Get regulatory domain prompt IDs
        SELECT ARRAY_AGG(id) INTO prompt_ids
        FROM prompts
        WHERE domain = 'regulatory' AND status = 'active' AND prompt_starter IS NOT NULL;

        -- Link all regulatory prompts to FDA agent
        IF prompt_ids IS NOT NULL THEN
            INSERT INTO agent_prompts (agent_id, prompt_id, is_default)
            SELECT fda_agent_id, unnest(prompt_ids), false
            ON CONFLICT (agent_id, prompt_id) DO NOTHING;
        END IF;
    END IF;
END $$;

-- Clinical Trial Designer
DO $$
DECLARE
    clinical_agent_id UUID;
    prompt_ids UUID[];
BEGIN
    -- Get Clinical Trial agent ID
    SELECT id INTO clinical_agent_id FROM agents WHERE name ILIKE '%clinical%trial%' OR display_name ILIKE '%clinical%trial%' LIMIT 1;

    IF clinical_agent_id IS NOT NULL THEN
        -- Get clinical research domain prompt IDs
        SELECT ARRAY_AGG(id) INTO prompt_ids
        FROM prompts
        WHERE domain = 'clinical-research' AND status = 'active' AND prompt_starter IS NOT NULL;

        -- Link all clinical research prompts to Clinical Trial agent
        IF prompt_ids IS NOT NULL THEN
            INSERT INTO agent_prompts (agent_id, prompt_id, is_default)
            SELECT clinical_agent_id, unnest(prompt_ids), false
            ON CONFLICT (agent_id, prompt_id) DO NOTHING;
        END IF;
    END IF;
END $$;

-- Digital Therapeutics Expert
DO $$
DECLARE
    dtx_agent_id UUID;
    prompt_ids UUID[];
BEGIN
    -- Get DTx agent ID
    SELECT id INTO dtx_agent_id FROM agents WHERE name ILIKE '%digital%therapeutics%' OR display_name ILIKE '%digital%therapeutics%' LIMIT 1;

    IF dtx_agent_id IS NOT NULL THEN
        -- Get digital health domain prompt IDs
        SELECT ARRAY_AGG(id) INTO prompt_ids
        FROM prompts
        WHERE domain = 'digital-health' AND status = 'active' AND prompt_starter IS NOT NULL;

        -- Link all digital health prompts to DTx agent
        IF prompt_ids IS NOT NULL THEN
            INSERT INTO agent_prompts (agent_id, prompt_id, is_default)
            SELECT dtx_agent_id, unnest(prompt_ids), false
            ON CONFLICT (agent_id, prompt_id) DO NOTHING;
        END IF;
    END IF;
END $$;

-- HIPAA Compliance Officer
DO $$
DECLARE
    hipaa_agent_id UUID;
    prompt_ids UUID[];
BEGIN
    -- Get HIPAA agent ID
    SELECT id INTO hipaa_agent_id FROM agents WHERE name ILIKE '%hipaa%' OR display_name ILIKE '%hipaa%compliance%' LIMIT 1;

    IF hipaa_agent_id IS NOT NULL THEN
        -- Get compliance domain prompt IDs
        SELECT ARRAY_AGG(id) INTO prompt_ids
        FROM prompts
        WHERE domain = 'compliance' AND status = 'active' AND prompt_starter IS NOT NULL;

        -- Link all compliance prompts to HIPAA agent
        IF prompt_ids IS NOT NULL THEN
            INSERT INTO agent_prompts (agent_id, prompt_id, is_default)
            SELECT hipaa_agent_id, unnest(prompt_ids), false
            ON CONFLICT (agent_id, prompt_id) DO NOTHING;
        END IF;
    END IF;
END $$;

-- Reimbursement Strategist
DO $$
DECLARE
    reimb_agent_id UUID;
    prompt_ids UUID[];
BEGIN
    -- Get Reimbursement agent ID
    SELECT id INTO reimb_agent_id FROM agents WHERE name ILIKE '%reimbursement%' OR display_name ILIKE '%reimbursement%' LIMIT 1;

    IF reimb_agent_id IS NOT NULL THEN
        -- Get market access domain prompt IDs
        SELECT ARRAY_AGG(id) INTO prompt_ids
        FROM prompts
        WHERE domain = 'market-access' AND status = 'active' AND prompt_starter IS NOT NULL;

        -- Link all market access prompts to Reimbursement agent
        IF prompt_ids IS NOT NULL THEN
            INSERT INTO agent_prompts (agent_id, prompt_id, is_default)
            SELECT reimb_agent_id, unnest(prompt_ids), false
            ON CONFLICT (agent_id, prompt_id) DO NOTHING;
        END IF;
    END IF;
END $$;

-- Create a view to easily see agent-prompt relationships
CREATE OR REPLACE VIEW agent_prompt_starters_view AS
SELECT
    a.id as agent_id,
    a.name as agent_name,
    a.display_name as agent_display_name,
    a.domain_expertise,
    p.id as prompt_id,
    p.name as prompt_name,
    p.prompt_starter,
    p.domain as prompt_domain,
    p.complexity_level,
    ap.is_default,
    ap.created_at as linked_at
FROM agents a
INNER JOIN agent_prompts ap ON a.id = ap.agent_id
INNER JOIN prompts p ON ap.prompt_id = p.id
WHERE a.status = 'active'
AND p.status = 'active'
AND p.prompt_starter IS NOT NULL
ORDER BY a.name, p.complexity_level, p.display_name;

-- Grant permissions
GRANT SELECT ON agent_prompt_starters_view TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_agent_prompt_starters(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_agent_prompt_starters_by_domain(TEXT) TO authenticated, anon;

-- Add comment
COMMENT ON VIEW agent_prompt_starters_view IS 'View showing all agent-prompt starter relationships for easy querying';

-- Show summary of what was linked
SELECT
    'Agent-Prompt Links Created' as summary,
    COUNT(*) as total_links,
    COUNT(DISTINCT agent_id) as agents_with_prompts,
    COUNT(DISTINCT prompt_id) as prompts_linked
FROM agent_prompts;