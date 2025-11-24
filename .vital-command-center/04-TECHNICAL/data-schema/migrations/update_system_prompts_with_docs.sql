-- =====================================================================================
-- Update agent system prompts to include documentation reference
-- =====================================================================================
-- Purpose: Add self-referential documentation link to each agent's system prompt
-- This allows agents to know where their full capabilities are documented
-- =====================================================================================

DO $$
DECLARE
    v_agent RECORD;
    v_updated_count INTEGER := 0;
    v_new_prompt TEXT;
BEGIN
    RAISE NOTICE '=== Updating Agent System Prompts with Documentation References ===';
    
    FOR v_agent IN 
        SELECT 
            a.id,
            a.name,
            a.system_prompt,
            a.documentation_path
        FROM agents a
        WHERE a.documentation_path IS NOT NULL
        AND a.system_prompt IS NOT NULL
    LOOP
        -- Check if documentation reference already exists
        IF v_agent.system_prompt NOT LIKE '%My complete capabilities and delegation chains are documented%' THEN
            -- Append documentation reference to system prompt
            v_new_prompt := v_agent.system_prompt || E'\n\n---\n\n## Self-Documentation\nMy complete capabilities, delegation chains, and usage guidelines are documented in: `' || v_agent.documentation_path || '`\n\nWhen delegating or escalating, I can reference this documentation to understand:\n- Which agents I can delegate to\n- When to escalate to higher-level agents\n- My specific expertise boundaries\n- Optimal confidence thresholds for delegation';
            
            UPDATE agents
            SET system_prompt = v_new_prompt,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = v_agent.id;
            
            v_updated_count := v_updated_count + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✓ Updated % agent system prompts with documentation references', v_updated_count;
    
END $$;

-- Verify the updates
SELECT 
    al.name as level,
    COUNT(*) as total_agents,
    COUNT(CASE WHEN a.system_prompt LIKE '%My complete capabilities and delegation chains are documented%' THEN 1 END) as agents_with_doc_ref
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
GROUP BY al.name, al.level_number
ORDER BY al.level_number;

-- Show sample updated prompt (truncated)
SELECT 
    a.name,
    LEFT(a.system_prompt, 200) || '...' as prompt_preview,
    CASE 
        WHEN a.system_prompt LIKE '%My complete capabilities and delegation chains are documented%' 
        THEN '✓ Has doc reference' 
        ELSE '✗ Missing doc reference' 
    END as status
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
ORDER BY al.level_number, a.name
LIMIT 10;

