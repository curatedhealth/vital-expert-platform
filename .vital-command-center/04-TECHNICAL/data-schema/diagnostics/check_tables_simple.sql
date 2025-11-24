-- ============================================================================
-- Simple Diagnostic: Check Existing Tables and Data
-- Purpose: Verify what tables exist before running full diagnostics
-- ============================================================================

-- Check which tables exist
SELECT 
    'Tables Check' as section,
    table_name,
    CASE 
        WHEN table_name = 'tools' THEN '✅ Required'
        WHEN table_name = 'tool_categories' THEN '⚠️ Optional'
        WHEN table_name = 'agent_tool_assignments' THEN '✅ Required'
        WHEN table_name = 'knowledge_domains' THEN '⚠️ Optional'
        WHEN table_name = 'agent_knowledge_domains' THEN '✅ Required'
        ELSE '❓ Unknown'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'tools', 'tool_categories', 'agent_tool_assignments',
        'knowledge_domains', 'agent_knowledge_domains'
    )
ORDER BY table_name;

-- Check tools table columns
SELECT 
    'Tools Table Schema' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'tools'
ORDER BY ordinal_position;

-- Count tools
SELECT 
    'Tools Count' as section,
    COUNT(*) as total_tools,
    SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_tools,
    SUM(CASE WHEN NOT is_active THEN 1 ELSE 0 END) as inactive_tools
FROM tools;

-- Sample tools (using only guaranteed columns)
SELECT 
    'Sample Tools' as section,
    id,
    name,
    description,
    is_active,
    created_at
FROM tools
ORDER BY created_at DESC
LIMIT 10;

-- Check agent_tool_assignments table
SELECT 
    'Agent Tool Assignments' as section,
    COUNT(*) as total_assignments,
    COUNT(DISTINCT agent_id) as agents_with_tools,
    COUNT(DISTINCT tool_id) as unique_tools_assigned
FROM agent_tool_assignments;

-- Check agent_knowledge_domains table schema
SELECT 
    'Agent Knowledge Domains Schema' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'agent_knowledge_domains'
ORDER BY ordinal_position;

