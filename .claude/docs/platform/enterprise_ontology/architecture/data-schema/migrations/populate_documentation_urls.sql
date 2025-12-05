-- =====================================================================================
-- Update agents with Supabase Storage documentation URLs
-- =====================================================================================
-- Purpose: Generate documentation URLs for all agents based on their level and slug
-- Assumes MD files will be uploaded to Supabase Storage bucket: agent-documentation
-- =====================================================================================

DO $$
DECLARE
    v_supabase_url TEXT := 'https://your-project.supabase.co'; -- UPDATE THIS!
    v_bucket_name TEXT := 'agent-documentation';
    v_base_url TEXT;
    v_updated_count INTEGER := 0;
BEGIN
    -- Set base URL for public storage
    v_base_url := v_supabase_url || '/storage/v1/object/public/' || v_bucket_name;
    
    RAISE NOTICE '=== Updating Agent Documentation URLs ===';
    RAISE NOTICE 'Base URL: %', v_base_url;
    
    -- Level 1 (Masters)
    UPDATE agents a
    SET 
        documentation_path = '01-masters/' || a.slug || '.md',
        documentation_url = v_base_url || '/01-masters/' || a.slug || '.md',
        updated_at = CURRENT_TIMESTAMP
    FROM agent_levels al
    WHERE a.agent_level_id = al.id
    AND al.level_number = 1;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Updated % Level 1 (Masters) agents', v_updated_count;
    
    -- Level 2 (Experts) - organized by department
    UPDATE agents a
    SET 
        documentation_path = '02-experts/' || 
            LOWER(REPLACE(REPLACE(a.department_name, ' & ', '-'), ' ', '-')) || '/' || 
            a.slug || '.md',
        documentation_url = v_base_url || '/02-experts/' || 
            LOWER(REPLACE(REPLACE(a.department_name, ' & ', '-'), ' ', '-')) || '/' || 
            a.slug || '.md',
        updated_at = CURRENT_TIMESTAMP
    FROM agent_levels al
    WHERE a.agent_level_id = al.id
    AND al.level_number = 2
    AND a.department_name IS NOT NULL;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Updated % Level 2 (Experts) agents', v_updated_count;
    
    -- Level 3 (Specialists) - organized by department
    UPDATE agents a
    SET 
        documentation_path = '03-specialists/' || 
            LOWER(REPLACE(REPLACE(a.department_name, ' & ', '-'), ' ', '-')) || '/' || 
            a.slug || '.md',
        documentation_url = v_base_url || '/03-specialists/' || 
            LOWER(REPLACE(REPLACE(a.department_name, ' & ', '-'), ' ', '-')) || '/' || 
            a.slug || '.md',
        updated_at = CURRENT_TIMESTAMP
    FROM agent_levels al
    WHERE a.agent_level_id = al.id
    AND al.level_number = 3
    AND a.department_name IS NOT NULL;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Updated % Level 3 (Specialists) agents', v_updated_count;
    
    -- Level 4 (Workers)
    UPDATE agents a
    SET 
        documentation_path = '04-workers/' || a.slug || '.md',
        documentation_url = v_base_url || '/04-workers/' || a.slug || '.md',
        updated_at = CURRENT_TIMESTAMP
    FROM agent_levels al
    WHERE a.agent_level_id = al.id
    AND al.level_number = 4;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Updated % Level 4 (Workers) agents', v_updated_count;
    
    -- Level 5 (Tools)
    UPDATE agents a
    SET 
        documentation_path = '05-tools/' || a.slug || '.md',
        documentation_url = v_base_url || '/05-tools/' || a.slug || '.md',
        updated_at = CURRENT_TIMESTAMP
    FROM agent_levels al
    WHERE a.agent_level_id = al.id
    AND al.level_number = 5;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Updated % Level 5 (Tools) agents', v_updated_count;
    
    RAISE NOTICE '=== ✅ All agents updated with documentation URLs ===';

END $$;

-- Verification queries
-- Coverage by level
SELECT 
    al.name as level,
    COUNT(*) as total_agents,
    COUNT(a.documentation_url) as agents_with_urls,
    COUNT(*) - COUNT(a.documentation_url) as agents_missing_urls
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
GROUP BY al.name, al.level_number
ORDER BY al.level_number;

-- Sample URLs (first 10 agents)
SELECT 
    a.name,
    al.name as level,
    a.documentation_url
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE a.documentation_url IS NOT NULL
ORDER BY al.level_number, a.name
LIMIT 10;

-- Check for any missing URLs
SELECT 
    a.name,
    al.name as level
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE a.documentation_url IS NULL
ORDER BY al.level_number, a.name;

