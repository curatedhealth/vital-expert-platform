-- ============================================================================
-- ASK EXPERT 4-MODE INTEGRATION TESTS
-- Date: November 4, 2025
-- Purpose: Comprehensive testing of all 4 Ask Expert modes and their
--          dependencies (agents, tools, RAG, workflows)
-- ============================================================================

\echo '╔══════════════════════════════════════════════════════════════════════════════╗'
\echo '║                                                                              ║'
\echo '║              🧪 ASK EXPERT 4-MODE INTEGRATION TESTS                          ║'
\echo '║                                                                              ║'
\echo '╚══════════════════════════════════════════════════════════════════════════════╝'
\echo ''

-- ============================================================================
-- SECTION 1: AGENT AVAILABILITY TESTS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 1: Agent Availability for Ask Expert'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 1.1: Count active agents
SELECT 
    '✅ TEST 1.1: Active Agents Count' as test_name,
    COUNT(*) as agent_count,
    CASE 
        WHEN COUNT(*) >= 260 THEN '✅ PASS'
        ELSE '❌ FAIL - Expected >= 260 agents'
    END as status
FROM agents
WHERE is_active = true;

-- Test 1.2: Agents by category (for Mode 2: Automatic Selection)
SELECT 
    category,
    COUNT(*) as agent_count
FROM agents
WHERE is_active = true
GROUP BY category
ORDER BY agent_count DESC;

-- Test 1.3: Agents with system prompts (required for all modes)
SELECT 
    '✅ TEST 1.3: Agents with System Prompts' as test_name,
    COUNT(*) as agents_with_prompts,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents WHERE is_active = true) as percentage,
    CASE 
        WHEN COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents WHERE is_active = true) >= 90 
        THEN '✅ PASS'
        ELSE '⚠️ WARN - Some agents missing system prompts'
    END as status
FROM agents
WHERE is_active = true 
  AND (system_prompt IS NOT NULL AND system_prompt != '');

-- Test 1.4: User agents for Mode 1 & 4 (manual selection)
SELECT 
    '✅ TEST 1.4: User Agents (Manual Selection)' as test_name,
    COUNT(DISTINCT ua.agent_id) as user_agent_count,
    CASE 
        WHEN COUNT(DISTINCT ua.agent_id) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL - No user agents assigned'
    END as status
FROM user_agents ua
JOIN agents a ON ua.agent_id = a.id
WHERE a.is_active = true;

\echo ''

-- ============================================================================
-- SECTION 2: TOOL AVAILABILITY TESTS (For Modes 3 & 4)
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 2: Tool Availability for Ask Expert Modes'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 2.1: Active tools count
SELECT 
    '✅ TEST 2.1: Active Tools for Ask Expert' as test_name,
    COUNT(*) as tool_count,
    CASE 
        WHEN COUNT(*) >= 150 THEN '✅ PASS'
        ELSE '⚠️ WARN - Fewer tools available'
    END as status
FROM dh_tool
WHERE is_active = true;

-- Test 2.2: Agent-tool assignments (critical for tool-enabled modes)
SELECT 
    '✅ TEST 2.2: Agent-Tool Assignments' as test_name,
    COUNT(*) as total_assignments,
    COUNT(DISTINCT agent_id) as agents_with_tools,
    CASE 
        WHEN COUNT(DISTINCT agent_id) >= 5 THEN '✅ PASS'
        ELSE '⚠️ WARN - Few agents have tools'
    END as status
FROM agent_tools;

-- Test 2.3: Tools by category
SELECT 
    category_parent as category,
    COUNT(*) as tool_count,
    COUNT(CASE WHEN lifecycle_stage = 'production' THEN 1 END) as production_ready
FROM dh_tool
WHERE is_active = true
GROUP BY category_parent
ORDER BY tool_count DESC
LIMIT 10;

-- Test 2.4: Strategic Intelligence tools (for competitive analysis use cases)
SELECT 
    '✅ TEST 2.4: Strategic Intelligence Tools' as test_name,
    COUNT(*) as si_tool_count,
    CASE 
        WHEN COUNT(*) >= 8 THEN '✅ PASS'
        ELSE '⚠️ WARN - Missing Strategic Intelligence tools'
    END as status
FROM dh_tool
WHERE category_parent = 'Strategic Intelligence' 
  AND is_active = true;

\echo ''

-- ============================================================================
-- SECTION 3: RAG KNOWLEDGE BASE TESTS (All Modes)
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 3: RAG Knowledge Base Availability'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 3.1: RAG sources count
SELECT 
    '✅ TEST 3.1: RAG Sources Available' as test_name,
    COUNT(*) as rag_source_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL - No RAG sources configured'
    END as status
FROM dh_rag;

-- Test 3.2: RAG sources by type
SELECT 
    source_type,
    COUNT(*) as source_count,
    SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_count
FROM dh_rag
GROUP BY source_type
ORDER BY source_count DESC;

-- Test 3.3: Task-RAG assignments
SELECT 
    '✅ TEST 3.3: Task-RAG Assignments' as test_name,
    COUNT(*) as total_assignments,
    COUNT(DISTINCT task_id) as tasks_with_rag,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '⚠️ WARN - No task-RAG mappings'
    END as status
FROM dh_task_rag;

\echo ''

-- ============================================================================
-- SECTION 4: MODE 1 - MANUAL INTERACTIVE TESTS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 4: Mode 1 - Manual Interactive'
\echo 'User selects agent → Simple chat with RAG'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 4.1: User agents available for manual selection
SELECT 
    '✅ TEST 4.1: User Agents for Mode 1' as test_name,
    COUNT(DISTINCT ua.agent_id) as available_agents,
    CASE 
        WHEN COUNT(DISTINCT ua.agent_id) >= 10 THEN '✅ PASS'
        WHEN COUNT(DISTINCT ua.agent_id) >= 5 THEN '⚠️ WARN - Limited agents'
        ELSE '❌ FAIL - Insufficient agents for mode 1'
    END as status
FROM user_agents ua
JOIN agents a ON ua.agent_id = a.id
WHERE a.is_active = true;

-- Test 4.2: Sample of user agents by category
SELECT 
    a.category,
    a.name as agent_name,
    a.description
FROM user_agents ua
JOIN agents a ON ua.agent_id = a.id
WHERE a.is_active = true
ORDER BY a.category, a.name
LIMIT 10;

-- Test 4.3: Agents with complete profiles (name, description, system_prompt)
SELECT 
    '✅ TEST 4.3: Agents with Complete Profiles' as test_name,
    COUNT(*) as complete_agents,
    CASE 
        WHEN COUNT(*) >= 250 THEN '✅ PASS'
        ELSE '⚠️ WARN - Some agents incomplete'
    END as status
FROM agents
WHERE is_active = true
  AND name IS NOT NULL
  AND description IS NOT NULL
  AND system_prompt IS NOT NULL
  AND system_prompt != '';

\echo ''

-- ============================================================================
-- SECTION 5: MODE 2 - AUTOMATIC AGENT SELECTION TESTS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 5: Mode 2 - Automatic Agent Selection'
\echo 'AI orchestrator selects best agent → Chat with RAG + Tools'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 5.1: Agents with categories (for agent selection algorithm)
SELECT 
    '✅ TEST 5.1: Agents with Categories' as test_name,
    COUNT(*) as categorized_agents,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents WHERE is_active = true) as percentage,
    CASE 
        WHEN COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents WHERE is_active = true) >= 95 
        THEN '✅ PASS'
        ELSE '⚠️ WARN - Some agents missing categories'
    END as status
FROM agents
WHERE is_active = true 
  AND category IS NOT NULL
  AND category != '';

-- Test 5.2: Agent distribution by category (for selection diversity)
SELECT 
    category,
    COUNT(*) as agent_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM agents
WHERE is_active = true AND category IS NOT NULL
GROUP BY category
ORDER BY agent_count DESC;

-- Test 5.3: Agents with tools (Mode 2 enables tools)
SELECT 
    '✅ TEST 5.3: Agents with Tools (Mode 2)' as test_name,
    COUNT(DISTINCT at.agent_id) as agents_with_tools,
    CASE 
        WHEN COUNT(DISTINCT at.agent_id) >= 5 THEN '✅ PASS'
        ELSE '⚠️ WARN - Few agents have tools'
    END as status
FROM agent_tools at
JOIN agents a ON at.agent_id = a.id
WHERE a.is_active = true;

-- Test 5.4: Top agents by tool count (most capable for Mode 2)
SELECT 
    a.name as agent_name,
    a.category,
    COUNT(at.tool_id) as tool_count
FROM agents a
LEFT JOIN agent_tools at ON at.agent_id = a.id
WHERE a.is_active = true
GROUP BY a.id, a.name, a.category
ORDER BY tool_count DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- SECTION 6: MODE 3 - AUTONOMOUS-AUTOMATIC TESTS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 6: Mode 3 - Autonomous-Automatic'
\echo 'AI selects agent + ReAct + Chain-of-Thought reasoning + Tools'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 6.1: Autonomous-capable agents (with reasoning capability)
SELECT 
    '✅ TEST 6.1: Autonomous-Capable Agents' as test_name,
    COUNT(*) as autonomous_agents,
    CASE 
        WHEN COUNT(*) >= 100 THEN '✅ PASS'
        ELSE '⚠️ WARN - Limited autonomous agents'
    END as status
FROM agents
WHERE is_active = true
  AND (
    reasoning_capability = true 
    OR model LIKE '%gpt-4%' 
    OR capabilities::text LIKE '%reasoning%'
  );

-- Test 6.2: Agents with tool and RAG access (full autonomous capability)
SELECT 
    '✅ TEST 6.2: Fully Autonomous Agents' as test_name,
    COUNT(DISTINCT a.id) as full_autonomous_count,
    CASE 
        WHEN COUNT(DISTINCT a.id) >= 5 THEN '✅ PASS'
        ELSE '⚠️ WARN - Few agents fully autonomous'
    END as status
FROM agents a
WHERE a.is_active = true
  AND EXISTS (SELECT 1 FROM agent_tools at WHERE at.agent_id = a.id)
  AND a.rag_enabled = true;

-- Test 6.3: Tools available for autonomous reasoning
SELECT 
    dt.category_parent,
    COUNT(*) as tool_count,
    COUNT(CASE WHEN dt.lifecycle_stage = 'production' THEN 1 END) as production_ready
FROM dh_tool dt
WHERE dt.is_active = true
  AND dt.langgraph_compatible = true
GROUP BY dt.category_parent
ORDER BY tool_count DESC;

-- Test 6.4: Sample of autonomous-ready agents
SELECT 
    a.name,
    a.category,
    COUNT(at.tool_id) as tools,
    a.rag_enabled
FROM agents a
LEFT JOIN agent_tools at ON at.agent_id = a.id
WHERE a.is_active = true
GROUP BY a.id, a.name, a.category, a.rag_enabled
HAVING COUNT(at.tool_id) > 0 AND a.rag_enabled = true
ORDER BY COUNT(at.tool_id) DESC
LIMIT 5;

\echo ''

-- ============================================================================
-- SECTION 7: MODE 4 - AUTONOMOUS-MANUAL TESTS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 7: Mode 4 - Autonomous-Manual'
\echo 'User selects agent + ReAct + Chain-of-Thought reasoning + Tools'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 7.1: User agents with autonomous capabilities
SELECT 
    '✅ TEST 7.1: User Agents for Mode 4' as test_name,
    COUNT(DISTINCT ua.agent_id) as autonomous_user_agents,
    CASE 
        WHEN COUNT(DISTINCT ua.agent_id) >= 5 THEN '✅ PASS'
        ELSE '⚠️ WARN - Few autonomous user agents'
    END as status
FROM user_agents ua
JOIN agents a ON ua.agent_id = a.id
WHERE a.is_active = true
  AND EXISTS (SELECT 1 FROM agent_tools at WHERE at.agent_id = a.id);

-- Test 7.2: User agents with tool access
SELECT 
    a.name as agent_name,
    a.category,
    COUNT(at.tool_id) as tool_count,
    ua.user_id
FROM user_agents ua
JOIN agents a ON ua.agent_id = a.id
LEFT JOIN agent_tools at ON at.agent_id = a.id
WHERE a.is_active = true
GROUP BY a.id, a.name, a.category, ua.user_id
HAVING COUNT(at.tool_id) > 0
ORDER BY tool_count DESC
LIMIT 10;

-- Test 7.3: Tools assigned to user agents
SELECT 
    '✅ TEST 7.3: Tools for User Agents' as test_name,
    COUNT(DISTINCT at.tool_id) as unique_tools,
    COUNT(*) as total_assignments,
    CASE 
        WHEN COUNT(DISTINCT at.tool_id) >= 10 THEN '✅ PASS'
        ELSE '⚠️ WARN - Limited tools for user agents'
    END as status
FROM agent_tools at
WHERE at.agent_id IN (
    SELECT ua.agent_id FROM user_agents ua
    JOIN agents a ON ua.agent_id = a.id
    WHERE a.is_active = true
);

\echo ''

-- ============================================================================
-- SECTION 8: CONVERSATION HISTORY TESTS (Modes 3 & 4)
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 8: Conversation History Support'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 8.1: Conversation sessions
SELECT 
    '✅ TEST 8.1: Conversation Sessions' as test_name,
    COUNT(DISTINCT session_id) as total_sessions,
    CASE 
        WHEN COUNT(DISTINCT session_id) > 0 THEN '✅ PASS'
        ELSE 'ℹ️ INFO - No sessions yet (normal for new system)'
    END as status
FROM conversations
WHERE session_id IS NOT NULL;

-- Test 8.2: Recent conversations (if any)
SELECT 
    session_id,
    agent_id,
    COUNT(*) as message_count,
    MAX(created_at) as last_message
FROM conversations
GROUP BY session_id, agent_id
ORDER BY last_message DESC
LIMIT 5;

\echo ''

-- ============================================================================
-- SECTION 9: AGENT RECOMMENDATION ENGINE TESTS (Mode 2 & 3)
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 9: Agent Recommendation Engine Prerequisites'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 9.1: Agents with keywords/tags for matching
SELECT 
    '✅ TEST 9.1: Agents with Keywords' as test_name,
    COUNT(*) as agents_with_keywords,
    CASE 
        WHEN COUNT(*) >= 100 THEN '✅ PASS'
        ELSE '⚠️ WARN - Few agents have keywords'
    END as status
FROM agents
WHERE is_active = true
  AND (
    tags IS NOT NULL 
    OR keywords IS NOT NULL
    OR category IS NOT NULL
  );

-- Test 9.2: Agent specializations for matching algorithm
SELECT 
    category,
    COUNT(*) as agents_in_category,
    ROUND(AVG(CASE 
        WHEN tags IS NOT NULL THEN array_length(tags, 1) 
        ELSE 0 
    END), 1) as avg_tags_per_agent
FROM agents
WHERE is_active = true AND category IS NOT NULL
GROUP BY category
ORDER BY agents_in_category DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- SECTION 10: MULTI-FRAMEWORK ORCHESTRATION TESTS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 10: Multi-Framework Orchestration Support'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 10.1: Workflow definitions for LangGraph
SELECT 
    '✅ TEST 10.1: Workflow Definitions' as test_name,
    COUNT(*) as workflow_count,
    CASE 
        WHEN COUNT(*) >= 100 THEN '✅ PASS'
        ELSE 'ℹ️ INFO - Workflows optional for basic modes'
    END as status
FROM dh_workflow;

-- Test 10.2: Task definitions for workflow execution
SELECT 
    '✅ TEST 10.2: Task Definitions' as test_name,
    COUNT(*) as task_count,
    CASE 
        WHEN COUNT(*) >= 500 THEN '✅ PASS'
        ELSE 'ℹ️ INFO - Tasks optional for basic modes'
    END as status
FROM dh_task;

-- Test 10.3: Tasks with agent assignments (for orchestration)
SELECT 
    '✅ TEST 10.3: Task-Agent Assignments' as test_name,
    COUNT(*) as assignments,
    CASE 
        WHEN COUNT(*) >= 500 THEN '✅ PASS'
        ELSE 'ℹ️ INFO - Assignments optional for basic modes'
    END as status
FROM dh_task_agent;

\echo ''

-- ============================================================================
-- SECTION 11: INTEGRATION HEALTH CHECKS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 11: Integration Health Checks'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 11.1: Agent-Tool-RAG triangle (full capability)
SELECT 
    '✅ TEST 11.1: Fully Equipped Agents' as test_name,
    COUNT(DISTINCT a.id) as fully_equipped_agents,
    CASE 
        WHEN COUNT(DISTINCT a.id) >= 5 THEN '✅ PASS'
        ELSE '⚠️ WARN - Few agents fully equipped'
    END as status
FROM agents a
WHERE a.is_active = true
  AND EXISTS (SELECT 1 FROM agent_tools at WHERE at.agent_id = a.id)
  AND a.rag_enabled = true
  AND a.system_prompt IS NOT NULL;

-- Test 11.2: Cross-mode compatibility check
SELECT 
    mode,
    requirements,
    COUNT(DISTINCT a.id) as compatible_agents
FROM (
    SELECT 
        'Mode 1: Manual' as mode,
        'User agent + system prompt' as requirements,
        a.id
    FROM agents a
    JOIN user_agents ua ON ua.agent_id = a.id
    WHERE a.is_active = true 
      AND a.system_prompt IS NOT NULL
    
    UNION ALL
    
    SELECT 
        'Mode 2: Automatic' as mode,
        'Category + system prompt + tools' as requirements,
        a.id
    FROM agents a
    WHERE a.is_active = true 
      AND a.category IS NOT NULL
      AND a.system_prompt IS NOT NULL
      AND EXISTS (SELECT 1 FROM agent_tools at WHERE at.agent_id = a.id)
    
    UNION ALL
    
    SELECT 
        'Mode 3: Autonomous-Automatic' as mode,
        'Category + system prompt + tools + RAG' as requirements,
        a.id
    FROM agents a
    WHERE a.is_active = true 
      AND a.category IS NOT NULL
      AND a.system_prompt IS NOT NULL
      AND a.rag_enabled = true
      AND EXISTS (SELECT 1 FROM agent_tools at WHERE at.agent_id = a.id)
    
    UNION ALL
    
    SELECT 
        'Mode 4: Autonomous-Manual' as mode,
        'User agent + system prompt + tools + RAG' as requirements,
        a.id
    FROM agents a
    JOIN user_agents ua ON ua.agent_id = a.id
    WHERE a.is_active = true 
      AND a.system_prompt IS NOT NULL
      AND a.rag_enabled = true
      AND EXISTS (SELECT 1 FROM agent_tools at WHERE at.agent_id = a.id)
) modes
GROUP BY mode, requirements
ORDER BY mode;

\echo ''

-- ============================================================================
-- SECTION 12: SUMMARY STATISTICS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 12: Ask Expert System Summary'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

SELECT 
    'Active Agents' as entity,
    COUNT(*) as count
FROM agents WHERE is_active = true
UNION ALL
SELECT 'User Agents', COUNT(DISTINCT agent_id) FROM user_agents
UNION ALL
SELECT 'Active Tools', COUNT(*) FROM dh_tool WHERE is_active = true
UNION ALL
SELECT 'Agent-Tool Assignments', COUNT(*) FROM agent_tools
UNION ALL
SELECT 'RAG Sources', COUNT(*) FROM dh_rag
UNION ALL
SELECT 'Workflows', COUNT(*) FROM dh_workflow
UNION ALL
SELECT 'Tasks', COUNT(*) FROM dh_task
UNION ALL
SELECT 'Task-Agent Mappings', COUNT(*) FROM dh_task_agent
UNION ALL
SELECT 'Conversation Sessions', COUNT(DISTINCT session_id) FROM conversations;

\echo ''
\echo '╔══════════════════════════════════════════════════════════════════════════════╗'
\echo '║                                                                              ║'
\echo '║                      ✅ ASK EXPERT TESTS COMPLETE                            ║'
\echo '║                                                                              ║'
\echo '╚══════════════════════════════════════════════════════════════════════════════╝'

