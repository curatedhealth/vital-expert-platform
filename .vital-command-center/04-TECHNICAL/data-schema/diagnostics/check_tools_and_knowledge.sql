-- ============================================================================
-- Diagnostic Query: Check Tools and Knowledge Domains
-- Purpose: Verify current state of tools and knowledge domains before mapping
-- ============================================================================

-- Check tools table
SELECT 
    '=== TOOLS TABLE ===' as section,
    COUNT(*) as total_tools,
    COUNT(DISTINCT category) as unique_categories,
    COUNT(DISTINCT tool_type) as unique_types,
    SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_tools
FROM tools;

-- Tools by category (schema-agnostic)
SELECT 
    '=== TOOLS BY CATEGORY ===' as section,
    COALESCE(t.category, 'Uncategorized') as category_name,
    COUNT(*) as tool_count,
    SUM(CASE WHEN t.is_active THEN 1 ELSE 0 END) as active_count
FROM tools t
GROUP BY t.category
ORDER BY tool_count DESC;

-- Sample of tools
SELECT 
    '=== SAMPLE TOOLS ===' as section,
    t.name,
    t.tool_key,
    COALESCE(t.category, 'Uncategorized') as category,
    COALESCE(t.tool_type, t.implementation_type) as type,
    t.is_active
FROM tools t
ORDER BY t.created_at DESC
LIMIT 20;

-- Check if knowledge_domains table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'knowledge_domains') THEN
        RAISE NOTICE '=== KNOWLEDGE DOMAINS TABLE EXISTS ===';
    ELSE
        RAISE NOTICE '=== KNOWLEDGE DOMAINS TABLE DOES NOT EXIST ===';
    END IF;
END $$;

-- Check existing agent_tool_assignments
SELECT 
    '=== EXISTING AGENT-TOOL MAPPINGS ===' as section,
    COUNT(*) as total_mappings,
    COUNT(DISTINCT agent_id) as agents_with_tools,
    COUNT(DISTINCT tool_id) as tools_assigned
FROM agent_tool_assignments;

-- Check existing agent_knowledge_domains
SELECT 
    '=== EXISTING AGENT-KNOWLEDGE MAPPINGS ===' as section,
    COUNT(*) as total_mappings,
    COUNT(DISTINCT agent_id) as agents_with_knowledge,
    COUNT(DISTINCT knowledge_domain_id) as domains_assigned
FROM agent_knowledge_domains;

-- Check agent_tool_assignments schema
SELECT 
    '=== AGENT_TOOL_ASSIGNMENTS SCHEMA ===' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'agent_tool_assignments'
ORDER BY ordinal_position;

-- Check agent_knowledge_domains schema
SELECT 
    '=== AGENT_KNOWLEDGE_DOMAINS SCHEMA ===' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'agent_knowledge_domains'
ORDER BY ordinal_position;

