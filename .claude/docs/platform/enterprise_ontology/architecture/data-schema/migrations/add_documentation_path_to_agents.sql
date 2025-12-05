-- =====================================================================================
-- Add documentation_path column to agents table
-- =====================================================================================
-- Purpose: Link each agent to its MD documentation file
-- This allows agents to self-reference their capabilities and delegation chains
-- =====================================================================================

DO $$
BEGIN
    -- Add documentation_path column
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

    -- Update all agents with their MD file paths
    RAISE NOTICE 'Updating agents with MD file paths...';
    
    -- Level 1 (Masters)
    UPDATE agents a
    SET documentation_path = '.vital-docs/agents/01-masters/' || a.slug || '.md'
    FROM agent_levels al
    WHERE a.agent_level_id = al.id
    AND al.level_number = 1;
    
    -- Level 2 (Experts) - organized by department
    UPDATE agents a
    SET documentation_path = '.vital-docs/agents/02-experts/' || 
        LOWER(REPLACE(COALESCE(a.department_name, 'universal'), ' & ', '-')) ||
        REPLACE(COALESCE(a.department_name, 'universal'), ' ', '-') || '/' || 
        a.slug || '.md'
    FROM agent_levels al
    WHERE a.agent_level_id = al.id
    AND al.level_number = 2;
    
    -- Level 3 (Specialists) - organized by department
    UPDATE agents a
    SET documentation_path = '.vital-docs/agents/03-specialists/' || 
        LOWER(REPLACE(COALESCE(a.department_name, 'universal'), ' & ', '-')) ||
        REPLACE(COALESCE(a.department_name, 'universal'), ' ', '-') || '/' || 
        a.slug || '.md'
    FROM agent_levels al
    WHERE a.agent_level_id = al.id
    AND al.level_number = 3;
    
    -- Level 4 (Workers)
    UPDATE agents a
    SET documentation_path = '.vital-docs/agents/04-workers/' || a.slug || '.md'
    FROM agent_levels al
    WHERE a.agent_level_id = al.id
    AND al.level_number = 4;
    
    -- Level 5 (Tools)
    UPDATE agents a
    SET documentation_path = '.vital-docs/agents/05-tools/' || a.slug || '.md'
    FROM agent_levels al
    WHERE a.agent_level_id = al.id
    AND al.level_number = 5;

END $$;

-- Verify the update
SELECT 
    al.name as level,
    COUNT(*) as total_agents,
    COUNT(a.documentation_path) as agents_with_docs,
    COUNT(*) - COUNT(a.documentation_path) as agents_missing_docs
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
GROUP BY al.name, al.level_number
ORDER BY al.level_number;

-- Show sample paths
SELECT 
    a.name,
    al.name as level,
    a.documentation_path
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
ORDER BY al.level_number, a.name
LIMIT 20;

