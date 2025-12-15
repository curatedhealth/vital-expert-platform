-- ============================================================================
-- Check What Knowledge Tables Actually Exist
-- ============================================================================

-- Find all tables with 'knowledge' in the name
SELECT 
    'Knowledge-Related Tables' as section,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND (
        table_name LIKE '%knowledge%'
        OR table_name LIKE '%domain%'
    )
ORDER BY table_name;

-- Find all agent-related tables
SELECT 
    'Agent-Related Tables (for reference)' as section,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name LIKE 'agent%'
ORDER BY table_name;

