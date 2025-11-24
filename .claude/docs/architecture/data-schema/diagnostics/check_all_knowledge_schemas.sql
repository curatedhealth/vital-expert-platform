-- ============================================================================
-- Check Knowledge Source Tables Details
-- ============================================================================

-- Check domains table
SELECT 
    'domains Table Schema' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'domains'
ORDER BY ordinal_position;

SELECT 
    'domains Data' as section,
    COUNT(*) as total_domains
FROM domains;

SELECT 
    'domains Sample' as section,
    *
FROM domains
LIMIT 10;

-- Check knowledge_base table
SELECT 
    'knowledge_base Table Schema' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'knowledge_base'
ORDER BY ordinal_position;

SELECT 
    'knowledge_base Data' as section,
    COUNT(*) as total_records
FROM knowledge_base;

-- Check knowledge_sources table
SELECT 
    'knowledge_sources Table Schema' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'knowledge_sources'
ORDER BY ordinal_position;

SELECT 
    'knowledge_sources Data' as section,
    COUNT(*) as total_records
FROM knowledge_sources;

-- Check agent_knowledge schema (we need this too)
SELECT 
    'agent_knowledge Table Schema' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'agent_knowledge'
ORDER BY ordinal_position;

