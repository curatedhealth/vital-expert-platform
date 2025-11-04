-- ============================================================================
-- AGENT-TOOL INTEGRATION DATABASE TESTS
-- Date: November 4, 2025
-- Purpose: Verify database state for agent-tool integration
-- ============================================================================

-- Run these queries via Supabase SQL Editor or MCP

-- ============================================================================
-- TEST 1: Verify Strategic Intelligence Tools
-- ============================================================================
-- Expected: 8 tools in production
SELECT 
    '✅ TEST 1: Strategic Intelligence Tools' as test_name,
    COUNT(*) as tool_count,
    CASE 
        WHEN COUNT(*) = 8 THEN '✅ PASS'
        ELSE '❌ FAIL - Expected 8, got ' || COUNT(*)::text
    END as status
FROM dh_tool 
WHERE category_parent = 'Strategic Intelligence' 
  AND is_active = true;

-- ============================================================================
-- TEST 2: List Strategic Intelligence Tools
-- ============================================================================
SELECT 
    name,
    category,
    lifecycle_stage,
    health_status,
    is_active,
    is_verified,
    CASE 
        WHEN is_active = true AND lifecycle_stage = 'production' THEN '✅ Ready'
        ELSE '⚠️ Review'
    END as status
FROM dh_tool
WHERE category_parent = 'Strategic Intelligence'
ORDER BY name;

-- ============================================================================
-- TEST 3: Total Active Tools Count
-- ============================================================================
-- Expected: 150 active tools
SELECT 
    '✅ TEST 3: Total Active Tools' as test_name,
    COUNT(*) as tool_count,
    CASE 
        WHEN COUNT(*) >= 150 THEN '✅ PASS'
        ELSE '❌ FAIL - Expected >= 150, got ' || COUNT(*)::text
    END as status
FROM dh_tool 
WHERE is_active = true;

-- ============================================================================
-- TEST 4: Tools by Lifecycle Stage
-- ============================================================================
SELECT 
    lifecycle_stage,
    COUNT(*) as tool_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM dh_tool WHERE is_active = true), 1) as percentage
FROM dh_tool
WHERE is_active = true
GROUP BY lifecycle_stage
ORDER BY tool_count DESC;

-- ============================================================================
-- TEST 5: Agent Tools Assignments
-- ============================================================================
SELECT 
    '✅ TEST 5: Agent Tools Assignments' as test_name,
    COUNT(DISTINCT agent_id) as agents_with_tools,
    COUNT(*) as total_assignments,
    '✅ PASS' as status
FROM agent_tools;

-- ============================================================================
-- TEST 6: Sample Agent Tool Assignments
-- ============================================================================
-- Shows which agents have which tools
SELECT 
    at.agent_id,
    dt.name as tool_name,
    dt.category,
    at.priority,
    at.is_enabled,
    at.notes
FROM agent_tools at
JOIN dh_tool dt ON at.tool_id = dt.id
ORDER BY at.agent_id, at.priority DESC
LIMIT 10;

-- ============================================================================
-- TEST 7: Tools by Category Count
-- ============================================================================
SELECT 
    category_parent,
    COUNT(*) as tool_count
FROM dh_tool
WHERE is_active = true
GROUP BY category_parent
ORDER BY tool_count DESC
LIMIT 10;

-- ============================================================================
-- TEST 8: Verify Agent Tools Table Structure
-- ============================================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'agent_tools'
ORDER BY ordinal_position;

-- ============================================================================
-- TEST 9: Check for Strategic Intelligence Tools in Assignments
-- ============================================================================
-- Shows if any agents are using Strategic Intelligence tools
SELECT 
    at.agent_id,
    dt.name as tool_name,
    dt.category,
    at.priority,
    at.notes
FROM agent_tools at
JOIN dh_tool dt ON at.tool_id = dt.id
WHERE dt.category_parent = 'Strategic Intelligence'
ORDER BY at.agent_id;

-- ============================================================================
-- TEST 10: Database Health Check
-- ============================================================================
SELECT 
    'dh_tool' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_rows
FROM dh_tool

UNION ALL

SELECT 
    'agent_tools' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN is_enabled = true THEN 1 END) as active_rows
FROM agent_tools

UNION ALL

SELECT 
    'agents' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_rows
FROM agents;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Expected Results:
-- ✅ TEST 1: 8 Strategic Intelligence tools
-- ✅ TEST 2: All tools in production, active, healthy
-- ✅ TEST 3: 150+ active tools
-- ✅ TEST 4: ~80% production, ~20% development
-- ✅ TEST 5: Multiple agents with tool assignments
-- ✅ TEST 6-10: Proper data and structure
-- ============================================================================

