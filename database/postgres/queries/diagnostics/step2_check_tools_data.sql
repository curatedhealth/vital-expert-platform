-- ============================================================================
-- Step 2: Check Tools Data and Existing Mappings
-- ============================================================================

-- Count tools
SELECT 
    'Tools Overview' as section,
    COUNT(*) as total_tools,
    SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_tools,
    SUM(CASE WHEN NOT is_active THEN 1 ELSE 0 END) as inactive_tools,
    SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END) as non_deleted_tools
FROM tools;

-- Tools by category
SELECT 
    'Tools by Category' as section,
    COALESCE(category, 'Uncategorized') as category,
    COUNT(*) as tool_count
FROM tools
WHERE deleted_at IS NULL
GROUP BY category
ORDER BY tool_count DESC;

-- Tools by type
SELECT 
    'Tools by Type' as section,
    COALESCE(tool_type, implementation_type, 'Unknown') as type,
    COUNT(*) as tool_count
FROM tools
WHERE deleted_at IS NULL
GROUP BY tool_type, implementation_type
ORDER BY tool_count DESC;

-- Sample tools (first 15)
SELECT 
    'Sample Tools (First 15)' as section,
    name,
    slug,
    COALESCE(category, 'N/A') as category,
    COALESCE(tool_type, implementation_type, 'N/A') as type,
    is_active,
    COALESCE(vendor, 'Internal') as vendor
FROM tools
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 15;

-- Check agent_tool_assignments table exists and has data
SELECT 
    'Agent Tool Assignments' as section,
    COUNT(*) as total_assignments,
    COUNT(DISTINCT agent_id) as agents_with_tools,
    COUNT(DISTINCT tool_id) as unique_tools_assigned
FROM agent_tool_assignments;

-- Check if knowledge-related tables exist
SELECT 
    'Knowledge Tables Check' as section,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND (
        table_name LIKE '%knowledge%'
        OR table_name LIKE '%domain%'
    )
ORDER BY table_name;

