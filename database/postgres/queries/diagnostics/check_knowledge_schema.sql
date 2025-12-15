-- ============================================================================
-- Check Agent Knowledge Domains Schema and Data
-- ============================================================================

-- Check if agent_knowledge_domains table exists
SELECT 
    'Table Check' as section,
    table_name,
    '✅ Exists' as status
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name = 'agent_knowledge_domains';

-- Check agent_knowledge_domains schema
SELECT 
    'agent_knowledge_domains Schema' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'agent_knowledge_domains'
ORDER BY ordinal_position;

-- Check if knowledge_domains table exists
SELECT 
    'Knowledge Domains Table' as section,
    table_name,
    '✅ Exists' as status
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name = 'knowledge_domains';

-- If knowledge_domains exists, check its schema
SELECT 
    'knowledge_domains Schema' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'knowledge_domains'
ORDER BY ordinal_position;

-- Check existing mappings
SELECT 
    'Existing Mappings' as section,
    COUNT(*) as total_mappings,
    COUNT(DISTINCT agent_id) as agents_with_knowledge
FROM agent_knowledge_domains
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'agent_knowledge_domains'
);

