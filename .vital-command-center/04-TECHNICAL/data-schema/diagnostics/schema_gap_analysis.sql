-- =====================================================
-- Schema Gap Analysis Query
-- =====================================================
-- Run this to see exactly what columns need to be added
-- =====================================================

-- Check agents table columns
SELECT 
    'agents' as table_name,
    column_name,
    data_type,
    CASE 
        WHEN column_name IN ('agent_level', 'master_agent_id', 'industry_vertical', 
                             'reasoning_capabilities', 'can_spawn_specialists', 
                             'can_spawn_workers', 'domain_expertise', 'tool_type') 
        THEN '❌ MISSING (needed for 5-level)'
        ELSE '✅ EXISTS'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agents'
ORDER BY ordinal_position;

-- Check agent_hierarchies columns
SELECT 
    'agent_hierarchies' as table_name,
    column_name,
    data_type,
    CASE 
        WHEN column_name IN ('parent_level', 'child_level', 'is_dynamic_spawn',
                             'execution_order', 'is_parallel', 'routing_rules',
                             'total_delegations', 'successful_delegations') 
        THEN '❌ MISSING (needed for 5-level)'
        ELSE '✅ EXISTS'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agent_hierarchies'
ORDER BY ordinal_position;

-- Check if new tables exist
SELECT 
    'agent_levels' as table_check,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'agent_levels'
    ) as exists;

SELECT 
    'agent_capabilities' as table_check,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'agent_capabilities'
    ) as exists;

SELECT 
    'agent_vertical_mapping' as table_check,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'agent_vertical_mapping'
    ) as exists;

SELECT 
    'master_agents' as table_check,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'master_agents'
    ) as exists;

