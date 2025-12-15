-- ============================================================================
-- Check Agent-Tool Relationship Tables
-- ============================================================================

-- Check for any tables related to agent tools
SELECT 
    'Agent-Tool Tables' as section,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND (
        table_name LIKE '%agent%tool%'
        OR table_name LIKE '%tool%agent%'
    )
ORDER BY table_name;

-- Check agent_tools table (alternative name)
SELECT 
    'Checking agent_tools' as section,
    COUNT(*) as table_exists
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name = 'agent_tools';

-- List all agent-related tables
SELECT 
    'All Agent Tables' as section,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name LIKE 'agent%'
ORDER BY table_name;

