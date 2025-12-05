-- ============================================================================
-- Agent-to-Tools Mapping Seed File
-- Maps 165 Medical Affairs agents to appropriate tools from tools table
-- Strategy: Level-based tool assignment with department-specific additions
-- ============================================================================

DO $$
DECLARE
    v_mapped_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔧 Starting Agent-to-Tools Mapping...';
    RAISE NOTICE '';

    -- ========================================================================
    -- LEVEL 1: MASTER AGENTS (9 agents)
    -- Tools: ALL strategic and leadership tools
    -- ========================================================================
    RAISE NOTICE '📊 Mapping Level 1 (Master Agents)...';
    
    -- Masters get access to ALL tools for strategic oversight
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id as agent_id,
        t.id as tool_id,
        true as is_enabled,
        false as auto_use,  -- Masters decide when to use tools
        10 as priority      -- Highest priority
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    CROSS JOIN tools t
    WHERE al.level_number = 1
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    RAISE NOTICE '✅ Mapped % tool assignments to Level 1 agents', v_mapped_count;
    RAISE NOTICE '';

    -- ========================================================================
    -- LEVEL 2: EXPERT AGENTS (45 agents)
    -- Tools: Department-specific + core research tools
    -- ========================================================================
    RAISE NOTICE '📊 Mapping Level 2 (Expert Agents)...';
    
    -- Clinical Operations Support Experts
    -- Note: Using slug instead of tool_key (tool_key column doesn't exist)
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,  -- Experts can auto-use relevant tools
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON (
        t.slug IN (
            'search-clinical-trials', 'clinical-trials-search', 'clinical_trials',
            'search-fda-approvals', 'fda-approvals', 'fda_search',
            'search-ich-guidelines', 'ich-guidelines',
            'search-iso-standards', 'iso-standards',
            'pubmed-search', 'pubmed',
            'knowledge-base', 'knowledge_base',
            'calculator'
        )
        OR t.name ILIKE '%clinical trial%'
        OR t.name ILIKE '%fda%'
        OR t.name ILIKE '%guideline%'
        OR t.name ILIKE '%pubmed%'
        OR t.name ILIKE '%knowledge%'
        OR t.name ILIKE '%calculator%'
    )
    WHERE al.level_number = 2
        AND a.department_name = 'Clinical Operations Support'
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Field Medical Experts
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key IN (
        'pubmed_search', 'search_clinical_trials', 'search_fda_approvals',
        'web_search', 'knowledge_base'
    )
    WHERE al.level_number = 2
        AND a.department_name = 'Field Medical'
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- HEOR & Evidence Experts
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key IN (
        'pubmed_search', 'search_clinical_trials', 'search_fda_approvals',
        'search_ema_authorizations', 'search_multi_region_regulatory',
        'search_ichom_standard_sets', 'calculator', 'knowledge_base'
    )
    WHERE al.level_number = 2
        AND a.department_name = 'HEOR & Evidence'
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Medical Education Experts
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key IN (
        'pubmed_search', 'search_clinical_trials', 'web_search',
        'search_dime_resources', 'knowledge_base'
    )
    WHERE al.level_number = 2
        AND a.department_name = 'Medical Education'
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Medical Excellence & Compliance Experts
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key IN (
        'search_fda_approvals', 'search_ema_authorizations', 'search_ich_guidelines',
        'search_iso_standards', 'search_multi_region_regulatory',
        'web_search', 'knowledge_base'
    )
    WHERE al.level_number = 2
        AND a.department_name = 'Medical Excellence & Compliance'
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Medical Information Services Experts
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key IN (
        'pubmed_search', 'search_clinical_trials', 'search_fda_approvals',
        'search_ema_authorizations', 'search_who_essential_medicines',
        'web_search', 'knowledge_base', 'calculator'
    )
    WHERE al.level_number = 2
        AND a.department_name = 'Medical Information Services'
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Publications Experts
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key IN (
        'pubmed_search', 'search_clinical_trials', 'web_search',
        'knowledge_base'
    )
    WHERE al.level_number = 2
        AND a.department_name = 'Publications'
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Scientific Communications Experts
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key IN (
        'pubmed_search', 'search_clinical_trials', 'web_search',
        'search_dime_resources', 'knowledge_base'
    )
    WHERE al.level_number = 2
        AND a.department_name = 'Scientific Communications'
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Medical Leadership Experts
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        false,  -- Leadership decides when to use
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.is_active = true
    WHERE al.level_number = 2
        AND a.department_name = 'Medical Leadership'
        AND a.deleted_at IS NULL
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    RAISE NOTICE '✅ Mapped % tool assignments to Level 2 agents', v_mapped_count;
    RAISE NOTICE '';

    -- ========================================================================
    -- LEVEL 3: SPECIALIST AGENTS (43 agents)
    -- Tools: Focused subset based on specialty
    -- ========================================================================
    RAISE NOTICE '📊 Mapping Level 3 (Specialist Agents)...';
    
    -- Specialists get focused toolsets (3-5 tools each)
    -- Clinical/Trial Specialists
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        6
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key IN (
        'search_clinical_trials', 'pubmed_search', 'knowledge_base'
    )
    WHERE al.level_number = 3
        AND a.department_name IN ('Clinical Operations Support', 'Field Medical')
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Evidence/HEOR Specialists
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        6
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key IN (
        'pubmed_search', 'search_ichom_standard_sets', 'calculator', 'knowledge_base'
    )
    WHERE al.level_number = 3
        AND a.department_name = 'HEOR & Evidence'
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Regulatory/Compliance Specialists
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        6
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key IN (
        'search_fda_approvals', 'search_ich_guidelines', 'search_iso_standards', 'knowledge_base'
    )
    WHERE al.level_number = 3
        AND a.department_name = 'Medical Excellence & Compliance'
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Information/Education Specialists
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        6
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key IN (
        'pubmed_search', 'web_search', 'knowledge_base'
    )
    WHERE al.level_number = 3
        AND a.department_name IN ('Medical Information Services', 'Medical Education')
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Publications/Communications Specialists
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        6
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key IN (
        'pubmed_search', 'web_search', 'knowledge_base'
    )
    WHERE al.level_number = 3
        AND a.department_name IN ('Publications', 'Scientific Communications')
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    RAISE NOTICE '✅ Mapped % tool assignments to Level 3 agents', v_mapped_count;
    RAISE NOTICE '';

    -- ========================================================================
    -- LEVEL 4: WORKER AGENTS (18 agents)
    -- Tools: 1-2 focused tools per worker
    -- ========================================================================
    RAISE NOTICE '📊 Mapping Level 4 (Worker Agents)...';
    
    -- Workers get minimal, highly specific toolsets
    -- Research workers
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        4
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key IN ('pubmed_search', 'web_search')
    WHERE al.level_number = 4
        AND (a.name ILIKE '%research%' OR a.name ILIKE '%literature%')
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Calculation workers
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        4
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key = 'calculator'
    WHERE al.level_number = 4
        AND (a.name ILIKE '%calculat%' OR a.name ILIKE '%statistic%' OR a.name ILIKE '%analysis%')
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Knowledge base workers
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        4
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key = 'knowledge_base'
    WHERE al.level_number = 4
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    RAISE NOTICE '✅ Mapped % tool assignments to Level 4 agents', v_mapped_count;
    RAISE NOTICE '';

    -- ========================================================================
    -- LEVEL 5: TOOL AGENTS (50 agents)
    -- Tools: Single specific tool per agent
    -- ========================================================================
    RAISE NOTICE '📊 Mapping Level 5 (Tool Agents)...';
    
    -- Tool agents get exactly 1 tool each, mapped by name similarity
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT DISTINCT ON (a.id)
        a.id,
        t.id,
        true,
        true,
        2
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON (
        LOWER(a.name) LIKE '%' || LOWER(REPLACE(t.name, ' ', '%')) || '%'
        OR LOWER(a.description) LIKE '%' || LOWER(t.tool_key) || '%'
    )
    WHERE al.level_number = 5
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments ata 
            WHERE ata.agent_id = a.id AND ata.tool_id = t.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    -- Fallback: Give remaining Tool agents the knowledge_base tool
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        2
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.tool_key = 'knowledge_base'
    WHERE al.level_number = 5
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM agent_tool_assignments 
            WHERE agent_id = a.id
        )
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    RAISE NOTICE '✅ Mapped % tool assignments to Level 5 agents', v_mapped_count;
    RAISE NOTICE '';

END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Summary by agent level
SELECT 
    '=== AGENT-TOOL MAPPINGS BY LEVEL ===' as section,
    al.level_name,
    al.level_number,
    COUNT(DISTINCT ata.agent_id) as agents_with_tools,
    COUNT(ata.id) as total_tool_assignments,
    ROUND(COUNT(ata.id)::NUMERIC / NULLIF(COUNT(DISTINCT ata.agent_id), 0), 1) as avg_tools_per_agent
FROM agent_levels al
LEFT JOIN agents a ON a.agent_level_id = al.id AND a.deleted_at IS NULL
LEFT JOIN agent_tool_assignments ata ON ata.agent_id = a.id
GROUP BY al.level_name, al.level_number
ORDER BY al.level_number;

-- Top tools by assignment count
SELECT 
    '=== MOST ASSIGNED TOOLS ===' as section,
    t.name as tool_name,
    t.tool_key,
    COALESCE(t.category, 'Uncategorized') as category,
    COUNT(ata.agent_id) as agents_assigned
FROM tools t
LEFT JOIN agent_tool_assignments ata ON ata.tool_id = t.id
GROUP BY t.name, t.tool_key, t.category
ORDER BY agents_assigned DESC
LIMIT 15;

-- Agents without tools
SELECT 
    '=== AGENTS WITHOUT TOOLS ===' as section,
    a.name,
    al.level_name,
    a.department_name
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_tool_assignments ata ON ata.agent_id = a.id
WHERE a.deleted_at IS NULL
    AND ata.id IS NULL
ORDER BY al.level_number, a.name
LIMIT 20;

-- Final summary
SELECT 
    '=== FINAL SUMMARY ===' as section,
    COUNT(DISTINCT a.id) as total_agents,
    COUNT(DISTINCT ata.agent_id) as agents_with_tools,
    COUNT(DISTINCT ata.tool_id) as unique_tools_assigned,
    COUNT(ata.id) as total_assignments,
    ROUND(COUNT(ata.id)::NUMERIC / NULLIF(COUNT(DISTINCT ata.agent_id), 0), 1) as avg_tools_per_agent
FROM agents a
LEFT JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_tool_assignments ata ON ata.agent_id = a.id
WHERE a.deleted_at IS NULL
    AND al.level_number BETWEEN 1 AND 5;

