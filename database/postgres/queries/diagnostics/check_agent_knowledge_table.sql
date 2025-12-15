-- ============================================================================
-- Check agent_knowledge Table Schema
-- ============================================================================

-- Check schema
SELECT 
    'agent_knowledge Schema' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'agent_knowledge'
ORDER BY ordinal_position;

-- Check existing data (count only)
SELECT 
    'Existing Data' as section,
    COUNT(*) as total_records
FROM agent_knowledge;

-- Sample data (to see structure)
SELECT 
    'Sample Records' as section,
    *
FROM agent_knowledge
LIMIT 5;

