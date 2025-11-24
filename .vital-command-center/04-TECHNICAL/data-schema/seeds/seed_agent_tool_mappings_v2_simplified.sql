-- ============================================================================
-- Agent-to-Tools Mapping Seed File (Simplified & Schema-Aligned)
-- Maps 165 Medical Affairs agents to tools using pattern matching
-- Strategy: Level-based assignment with flexible name/slug/category matching
-- ============================================================================

DO $$
DECLARE
    v_mapped_count INTEGER := 0;
    v_total_mapped INTEGER := 0;
BEGIN
    RAISE NOTICE '🔧 Starting Agent-to-Tools Mapping (Schema-Aligned Version)...';
    RAISE NOTICE '';

    -- ========================================================================
    -- LEVEL 1: MASTER AGENTS (9 agents)
    -- Strategy: Give masters ALL active tools
    -- ========================================================================
    RAISE NOTICE '📊 Level 1 (Masters): Mapping ALL tools...';
    
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        false,  -- Masters decide when to use
        10
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    CROSS JOIN tools t
    WHERE al.level_number = 1
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '✅ Level 1: % assignments', v_mapped_count;

    -- ========================================================================
    -- LEVEL 2: EXPERT AGENTS (45 agents)
    -- Strategy: Map by tool category and name patterns
    -- ========================================================================
    RAISE NOTICE '📊 Level 2 (Experts): Mapping by department...';
    
    -- Research & Evidence tools (for most departments)
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON (
        t.category IN ('Evidence Research', 'Medical Research', 'Research')
        OR t.name ILIKE '%pubmed%'
        OR t.name ILIKE '%clinical trial%'
        OR t.name ILIKE '%evidence%'
        OR t.name ILIKE '%literature%'
    )
    WHERE al.level_number = 2
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '  ├─ Research tools: % assignments', v_mapped_count;
    
    -- Regulatory tools (for compliance & regulatory departments)
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON (
        t.category IN ('Regulatory & Standards', 'Regulatory', 'Compliance')
        OR t.name ILIKE '%fda%'
        OR t.name ILIKE '%ema%'
        OR t.name ILIKE '%regulatory%'
        OR t.name ILIKE '%guideline%'
        OR t.name ILIKE '%ich%'
        OR t.name ILIKE '%iso%'
    )
    WHERE al.level_number = 2
        AND (
            a.department_name ILIKE '%compliance%'
            OR a.department_name ILIKE '%regulatory%'
            OR a.department_name ILIKE '%excellence%'
            OR a.department_name ILIKE '%clinical%'
        )
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '  ├─ Regulatory tools: % assignments', v_mapped_count;
    
    -- Digital Health tools
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON (
        t.category IN ('Digital Health', 'Digital Medicine')
        OR t.name ILIKE '%digital%'
        OR t.name ILIKE '%dime%'
        OR t.name ILIKE '%ichom%'
    )
    WHERE al.level_number = 2
        AND (
            a.department_name ILIKE '%education%'
            OR a.department_name ILIKE '%communication%'
        )
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '  ├─ Digital Health tools: % assignments', v_mapped_count;
    
    -- Knowledge & Computation tools (for all experts)
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON (
        t.category IN ('Knowledge Management', 'Computation', 'General Research')
        OR t.name ILIKE '%knowledge%'
        OR t.name ILIKE '%calculator%'
        OR t.name ILIKE '%search%'
    )
    WHERE al.level_number = 2
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '  └─ Knowledge/Computation tools: % assignments', v_mapped_count;
    RAISE NOTICE '✅ Level 2 Total: % assignments', 
        (SELECT COUNT(*) FROM agent_tool_assignments ata 
         JOIN agents a ON ata.agent_id = a.id 
         JOIN agent_levels al ON a.agent_level_id = al.id 
         WHERE al.level_number = 2);

    -- ========================================================================
    -- LEVEL 3: SPECIALIST AGENTS (43 agents)
    -- Strategy: 3-5 focused tools per specialist
    -- ========================================================================
    RAISE NOTICE '📊 Level 3 (Specialists): Mapping focused toolsets...';
    
    -- Research tools for specialists
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        6
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON (
        t.name ILIKE '%pubmed%'
        OR t.name ILIKE '%clinical trial%'
        OR t.name ILIKE '%knowledge%'
    )
    WHERE al.level_number = 3
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '✅ Level 3: % assignments', v_mapped_count;

    -- ========================================================================
    -- LEVEL 4: WORKER AGENTS (18 agents)
    -- Strategy: 1-2 tools per worker
    -- ========================================================================
    RAISE NOTICE '📊 Level 4 (Workers): Mapping minimal toolsets...';
    
    -- Give all workers access to knowledge base
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        4
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.name ILIKE '%knowledge%'
    WHERE al.level_number = 4
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '✅ Level 4: % assignments', v_mapped_count;

    -- ========================================================================
    -- LEVEL 5: TOOL AGENTS (50 agents)
    -- Strategy: 1 tool per agent (fallback to knowledge base)
    -- ========================================================================
    RAISE NOTICE '📊 Level 5 (Tool Agents): Mapping single tools...';
    
    -- Try to match tool agents to tools by name similarity
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT DISTINCT ON (a.id)
        a.id,
        t.id,
        true,
        true,
        2
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    CROSS JOIN LATERAL (
        SELECT id, name
        FROM tools
        WHERE is_active = true
            AND deleted_at IS NULL
            AND (
                similarity(LOWER(name), LOWER(a.name)) > 0.3
                OR LOWER(a.name) LIKE '%' || LOWER(SPLIT_PART(name, ' ', 1)) || '%'
            )
        ORDER BY similarity(LOWER(name), LOWER(a.name)) DESC
        LIMIT 1
    ) t
    WHERE al.level_number = 5
        AND a.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Fallback: Give remaining tool agents knowledge base
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        2
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.name ILIKE '%knowledge%'
    WHERE al.level_number = 5
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments WHERE agent_id = a.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '✅ Level 5: % assignments (with fallback)', v_mapped_count;

    RAISE NOTICE '';
    RAISE NOTICE '🎉 TOTAL MAPPINGS CREATED: %', v_total_mapped;
    RAISE NOTICE '';

END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Summary by level
SELECT 
    '=== SUMMARY BY AGENT LEVEL ===' as section,
    al.level_name,
    COUNT(DISTINCT a.id) as total_agents,
    COUNT(DISTINCT ata.agent_id) as agents_with_tools,
    COUNT(ata.id) as total_assignments,
    ROUND(AVG(tool_count), 1) as avg_tools_per_agent
FROM agent_levels al
LEFT JOIN agents a ON a.agent_level_id = al.id AND a.deleted_at IS NULL
LEFT JOIN agent_tool_assignments ata ON ata.agent_id = a.id
LEFT JOIN LATERAL (
    SELECT COUNT(*) as tool_count
    FROM agent_tool_assignments
    WHERE agent_id = a.id
) tc ON true
GROUP BY al.level_name, al.level_number
ORDER BY al.level_number;

-- Agents without tools
SELECT 
    '=== AGENTS WITHOUT TOOLS ===' as section,
    COUNT(*) as count,
    STRING_AGG(a.name, ', ') as agent_names
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_tool_assignments ata ON ata.agent_id = a.id
WHERE a.deleted_at IS NULL
    AND ata.id IS NULL;

-- Most used tools
SELECT 
    '=== MOST ASSIGNED TOOLS ===' as section,
    t.name,
    t.category,
    COUNT(ata.agent_id) as agents_count
FROM tools t
LEFT JOIN agent_tool_assignments ata ON ata.tool_id = t.id
WHERE t.deleted_at IS NULL
GROUP BY t.name, t.category
ORDER BY agents_count DESC
LIMIT 15;

-- Final summary
SELECT 
    '=== FINAL SUMMARY ===' as section,
    (SELECT COUNT(*) FROM agents WHERE deleted_at IS NULL) as total_agents,
    COUNT(DISTINCT ata.agent_id) as agents_with_tools,
    COUNT(DISTINCT ata.tool_id) as unique_tools_used,
    COUNT(*) as total_assignments
FROM agent_tool_assignments ata;

