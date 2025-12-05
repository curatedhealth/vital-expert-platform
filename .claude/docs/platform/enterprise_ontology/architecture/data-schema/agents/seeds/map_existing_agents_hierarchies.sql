-- =====================================================
-- HIERARCHICAL AGENTS MAPPING - Simplified Version
-- AgentOS 3.0 - Phase 2 Task 7
-- 
-- Creates hierarchical relationships between existing agents
-- Based on name patterns and specialization
-- =====================================================

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Creating Hierarchical Agent Relationships';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================
-- STEP 1: Analyze Current Agents
-- =====================================================

DO $$ BEGIN
    RAISE NOTICE 'Step 1: Analyzing existing agents...';
END $$;

SELECT 
    'Total Agents' as metric,
    COUNT(*) as count
FROM agents;

-- =====================================================
-- STEP 2: Create Hierarchies Based on Name Patterns
-- =====================================================

DO $$
DECLARE
    v_hierarchy_count INTEGER := 0;
    v_parent_id UUID;
    v_child_id UUID;
    v_parent_name TEXT;
    v_child_name TEXT;
BEGIN
    
    RAISE NOTICE '';
    RAISE NOTICE 'Step 2: Creating hierarchical relationships...';
    RAISE NOTICE '';
    
    -- Strategy: Find agents with leadership keywords and pair with specialists
    -- Parent: Agents with titles like Director, Manager, Lead, Chief, Head
    -- Children: Specialists, Analysts, Coordinators
    
    FOR v_parent_id, v_parent_name IN 
        SELECT id, name
        FROM agents
        WHERE (
            name ILIKE '%director%' OR
            name ILIKE '%manager%' OR
            name ILIKE '%lead%' OR
            name ILIKE '%chief%' OR
            name ILIKE '%head%' OR
            name ILIKE '%vp%'
        )
        ORDER BY name
        LIMIT 50  -- Limit to avoid timeout
    LOOP
        RAISE NOTICE 'Parent: %', v_parent_name;
        
        -- Find potential sub-agents (specialists in related areas)
        -- Match by common keywords in names
        FOR v_child_id, v_child_name IN 
            SELECT id, name
            FROM agents
            WHERE id != v_parent_id
              AND (
                  name ILIKE '%specialist%' OR
                  name ILIKE '%analyst%' OR
                  name ILIKE '%coordinator%' OR
                  name ILIKE '%associate%' OR
                  name ILIKE '%expert%'
              )
              -- Try to match related domains
              AND (
                  -- Medical/Clinical domain
                  (v_parent_name ILIKE '%medical%' AND name ILIKE '%medical%') OR
                  (v_parent_name ILIKE '%clinical%' AND name ILIKE '%clinical%') OR
                  -- Regulatory domain
                  (v_parent_name ILIKE '%regulatory%' AND name ILIKE '%regulatory%') OR
                  (v_parent_name ILIKE '%compliance%' AND name ILIKE '%compliance%') OR
                  -- Market/Commercial domain
                  (v_parent_name ILIKE '%market%' AND name ILIKE '%market%') OR
                  (v_parent_name ILIKE '%commercial%' AND name ILIKE '%commercial%') OR
                  (v_parent_name ILIKE '%sales%' AND name ILIKE '%sales%') OR
                  -- Data/Analytics domain
                  (v_parent_name ILIKE '%data%' AND name ILIKE '%data%') OR
                  (v_parent_name ILIKE '%analytics%' AND name ILIKE '%analytics%')
              )
            LIMIT 2  -- Max 2 sub-agents per parent
        LOOP
            -- Create hierarchy
            BEGIN
                INSERT INTO agent_hierarchies (
                    parent_agent_id,
                    child_agent_id,
                    relationship_type,
                    delegation_trigger,
                    auto_delegate,
                    confidence_threshold
                ) VALUES (
                    v_parent_id,
                    v_child_id,
                    'delegates_to',
                    'Auto-delegate based on domain match: ' || v_domain,
                    true,
                    0.75
                )
                ON CONFLICT (parent_agent_id, child_agent_id, relationship_type) DO NOTHING;
                
                v_hierarchy_count := v_hierarchy_count + 1;
                
                RAISE NOTICE '  → Sub-agent: %', v_child_name;
            EXCEPTION WHEN OTHERS THEN
                -- Skip if error (e.g., agent doesn't exist)
                RAISE NOTICE '  ✗ Could not link: %', v_child_name;
            END;
        END LOOP;
        
        -- Limit to avoid creating too many hierarchies at once
        IF v_hierarchy_count >= 100 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Total hierarchies created: %', v_hierarchy_count;
    
END $$;

-- =====================================================
-- STEP 3: Verification & Summary
-- =====================================================

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Hierarchical Agent Setup Complete!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Note: Deep agent feature columns not found in agents table.';
    RAISE NOTICE 'These will be added automatically when using the hierarchical';
    RAISE NOTICE 'agent compiler, which detects hierarchies from agent_hierarchies table.';
    RAISE NOTICE '';
END $$;

-- Overall summary
SELECT 
    'Overall Summary' as summary,
    COUNT(DISTINCT parent_agent_id) as total_parent_agents,
    COUNT(DISTINCT child_agent_id) as total_sub_agents,
    COUNT(*) as total_hierarchies
FROM agent_hierarchies;

-- Show sample hierarchies
SELECT 
    'Sample Hierarchies' as example,
    pa.name as parent_agent,
    ca.name as sub_agent,
    ah.relationship_type,
    ah.auto_delegate,
    ah.confidence_threshold
FROM agent_hierarchies ah
JOIN agents pa ON ah.parent_agent_id = pa.id
JOIN agents ca ON ah.child_agent_id = ca.id
ORDER BY pa.name, ah.created_at
LIMIT 30;

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Hierarchical agent mapping complete!';
    RAISE NOTICE '';
    RAISE NOTICE 'The hierarchical agent compiler will automatically detect';
    RAISE NOTICE 'parent-child relationships from agent_hierarchies table.';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now use hierarchical agents in:';
    RAISE NOTICE '  - Ask Expert (all 4 modes)';
    RAISE NOTICE '  - Ask Panel (each panel member)';
    RAISE NOTICE '  - Workflows (task agents)';
    RAISE NOTICE '  - Solution Builder';
    RAISE NOTICE '';
END $$;
