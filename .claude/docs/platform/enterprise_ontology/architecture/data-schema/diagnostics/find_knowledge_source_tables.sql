-- ============================================================================
-- Find Knowledge Source Tables
-- ============================================================================

-- Check for knowledge-related tables
SELECT 
    'All Knowledge Tables' as section,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = 'public' AND c.table_name = table_name) as column_count
FROM information_schema.tables c
WHERE table_schema = 'public'
    AND (
        table_name LIKE '%knowledge%'
        OR table_name = 'domains'
        OR table_name LIKE '%domain%'
    )
ORDER BY table_name;

-- Check if there's a knowledge base or knowledge source table
SELECT 
    'Potential Knowledge Source Tables' as section,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND (
        table_name IN ('knowledge', 'knowledge_base', 'knowledge_sources', 'domains', 'expertise_domains')
    )
ORDER BY table_name;

