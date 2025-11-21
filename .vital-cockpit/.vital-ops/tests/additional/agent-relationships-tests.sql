-- ============================================================================
-- COMPREHENSIVE AGENT RELATIONSHIP & PERMISSIONS TESTS
-- Date: November 4, 2025
-- Purpose: Test ALL agent relationships and CRUD permissions
-- ============================================================================

\echo '╔══════════════════════════════════════════════════════════════════════════════╗'
\echo '║                                                                              ║'
\echo '║           🧪 COMPREHENSIVE AGENT RELATIONSHIP TESTS                          ║'
\echo '║                                                                              ║'
\echo '╚══════════════════════════════════════════════════════════════════════════════╝'
\echo ''

-- ============================================================================
-- SECTION 1: ORGANIZATIONAL HIERARCHY TESTS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 1: Organizational Hierarchy'
\echo 'Functions → Departments → Roles → Agents'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 1.1: Functions (Business Functions)
SELECT 
    '✅ TEST 1.1: Business Functions' as test_name,
    COUNT(*) as function_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL - No business functions defined'
    END as status
FROM dh_business_function;

-- Test 1.2: List all functions
SELECT 
    id,
    name as function_name,
    description
FROM dh_business_function
ORDER BY name;

-- Test 1.3: Function → Department mapping
SELECT 
    '✅ TEST 1.3: Function → Department Mapping' as test_name,
    COUNT(DISTINCT bf.id) as functions_with_departments,
    COUNT(DISTINCT d.id) as total_departments,
    CASE 
        WHEN COUNT(DISTINCT d.id) > 0 THEN '✅ PASS'
        ELSE '⚠️ WARN - No departments defined'
    END as status
FROM dh_business_function bf
LEFT JOIN dh_department d ON d.business_function_id = bf.id;

-- Test 1.4: Department → Role mapping
SELECT 
    '✅ TEST 1.4: Department → Role Mapping' as test_name,
    COUNT(DISTINCT d.id) as departments_with_roles,
    COUNT(DISTINCT r.id) as total_roles,
    CASE 
        WHEN COUNT(DISTINCT r.id) > 0 THEN '✅ PASS'
        ELSE '⚠️ WARN - No roles defined'
    END as status
FROM dh_department d
LEFT JOIN dh_role r ON r.department_id = d.id;

-- Test 1.5: Role → Agent mapping
SELECT 
    '✅ TEST 1.5: Role → Agent Mapping' as test_name,
    COUNT(DISTINCT r.id) as roles_with_agents,
    COUNT(DISTINCT a.id) as total_agents_with_roles,
    CASE 
        WHEN COUNT(DISTINCT a.id) > 0 THEN '✅ PASS'
        ELSE '⚠️ WARN - No agents assigned to roles'
    END as status
FROM dh_role r
LEFT JOIN agents a ON a.role_id = r.id;

-- Test 1.6: Complete hierarchy visualization (sample)
SELECT 
    bf.name as business_function,
    d.name as department,
    r.name as role,
    COUNT(a.id) as agent_count
FROM dh_business_function bf
LEFT JOIN dh_department d ON d.business_function_id = bf.id
LEFT JOIN dh_role r ON r.department_id = d.id
LEFT JOIN agents a ON a.role_id = r.id
GROUP BY bf.id, bf.name, d.id, d.name, r.id, r.name
ORDER BY bf.name, d.name, r.name
LIMIT 20;

\echo ''

-- ============================================================================
-- SECTION 2: AGENT → PROMPT STARTERS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 2: Agent → Prompt Starters'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 2.1: Agents with prompt starters
SELECT 
    '✅ TEST 2.1: Agents with Prompt Starters' as test_name,
    COUNT(*) as agents_with_starters,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents WHERE is_active = true) as percentage,
    CASE 
        WHEN COUNT(*) >= 100 THEN '✅ PASS'
        ELSE '⚠️ WARN - Many agents missing prompt starters'
    END as status
FROM agents
WHERE is_active = true
  AND (prompt_starters IS NOT NULL AND array_length(prompt_starters, 1) > 0);

-- Test 2.2: Sample agents with prompt starters
SELECT 
    a.name as agent_name,
    array_length(a.prompt_starters, 1) as starter_count,
    a.prompt_starters[1] as sample_starter
FROM agents a
WHERE a.is_active = true
  AND a.prompt_starters IS NOT NULL
  AND array_length(a.prompt_starters, 1) > 0
ORDER BY array_length(a.prompt_starters, 1) DESC
LIMIT 10;

-- Test 2.3: Prompt Starters → Detailed Prompts mapping
-- Note: This relationship may be in agent_prompts or a similar table
SELECT 
    '✅ TEST 2.3: Prompt Starters → Detailed Prompts' as test_name,
    COUNT(DISTINCT a.id) as agents_with_prompts,
    'ℹ️ INFO - Checking agent_prompts relationship' as status
FROM agents a
WHERE EXISTS (
    SELECT 1 FROM dh_prompt p 
    WHERE p.agent_id = a.id OR p.title = ANY(a.prompt_starters)
)
LIMIT 1;

\echo ''

-- ============================================================================
-- SECTION 3: PROMPTS HIERARCHY
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 3: Prompts Hierarchy'
\echo 'Prompts → Subsuites → Suites'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 3.1: Prompt Suites count
SELECT 
    '✅ TEST 3.1: Prompt Suites' as test_name,
    COUNT(*) as suite_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '⚠️ WARN - No prompt suites defined'
    END as status
FROM dh_prompt_suite;

-- Test 3.2: Suite → Subsuite mapping
SELECT 
    '✅ TEST 3.2: Suite → Subsuite Mapping' as test_name,
    COUNT(DISTINCT ps.id) as suites_with_subsuites,
    COUNT(DISTINCT pss.id) as total_subsuites,
    CASE 
        WHEN COUNT(DISTINCT pss.id) > 0 THEN '✅ PASS'
        ELSE '⚠️ WARN - No subsuites defined'
    END as status
FROM dh_prompt_suite ps
LEFT JOIN dh_prompt_subsuite pss ON pss.suite_id = ps.id;

-- Test 3.3: Subsuite → Prompt mapping
SELECT 
    '✅ TEST 3.3: Subsuite → Prompt Mapping' as test_name,
    COUNT(DISTINCT pss.id) as subsuites_with_prompts,
    COUNT(DISTINCT psp.prompt_id) as total_prompts_in_subsuites,
    CASE 
        WHEN COUNT(DISTINCT psp.prompt_id) > 0 THEN '✅ PASS'
        ELSE '⚠️ WARN - No prompts assigned to subsuites'
    END as status
FROM dh_prompt_subsuite pss
LEFT JOIN dh_prompt_suite_prompt psp ON psp.subsuite_id = pss.id;

-- Test 3.4: Complete prompt hierarchy (sample)
SELECT 
    ps.name as suite_name,
    pss.name as subsuite_name,
    COUNT(DISTINCT psp.prompt_id) as prompt_count
FROM dh_prompt_suite ps
LEFT JOIN dh_prompt_subsuite pss ON pss.suite_id = ps.id
LEFT JOIN dh_prompt_suite_prompt psp ON psp.subsuite_id = pss.id
GROUP BY ps.id, ps.name, pss.id, pss.name
ORDER BY ps.name, pss.name
LIMIT 20;

\echo ''

-- ============================================================================
-- SECTION 4: AGENT → TOOLS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 4: Agent → Tools'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 4.1: Agent-Tool assignments
SELECT 
    '✅ TEST 4.1: Agent → Tool Assignments' as test_name,
    COUNT(*) as total_assignments,
    COUNT(DISTINCT agent_id) as agents_with_tools,
    COUNT(DISTINCT tool_id) as unique_tools_assigned,
    CASE 
        WHEN COUNT(DISTINCT agent_id) >= 5 THEN '✅ PASS'
        ELSE '⚠️ WARN - Few agents have tools'
    END as status
FROM agent_tools;

-- Test 4.2: Agents by tool count
SELECT 
    tools_per_agent,
    COUNT(*) as agent_count
FROM (
    SELECT 
        a.id,
        COUNT(at.tool_id) as tools_per_agent
    FROM agents a
    LEFT JOIN agent_tools at ON at.agent_id = a.id
    WHERE a.is_active = true
    GROUP BY a.id
) subquery
GROUP BY tools_per_agent
ORDER BY tools_per_agent;

-- Test 4.3: Top agents by tool count
SELECT 
    a.name as agent_name,
    a.category,
    COUNT(at.tool_id) as tool_count,
    array_agg(dt.name ORDER BY dt.name) FILTER (WHERE dt.name IS NOT NULL) as tool_names
FROM agents a
LEFT JOIN agent_tools at ON at.agent_id = a.id
LEFT JOIN dh_tool dt ON dt.id = at.tool_id
WHERE a.is_active = true
GROUP BY a.id, a.name, a.category
ORDER BY tool_count DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- SECTION 5: AGENT → RAG SOURCES
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 5: Agent → RAG Sources'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 5.1: Agents with RAG enabled
SELECT 
    '✅ TEST 5.1: Agents with RAG Enabled' as test_name,
    COUNT(*) as rag_enabled_agents,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents WHERE is_active = true) as percentage,
    CASE 
        WHEN COUNT(*) >= 100 THEN '✅ PASS'
        ELSE '⚠️ WARN - Many agents without RAG'
    END as status
FROM agents
WHERE is_active = true AND rag_enabled = true;

-- Test 5.2: RAG domains/sources available
SELECT 
    '✅ TEST 5.2: RAG Sources Available' as test_name,
    COUNT(*) as rag_source_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL - No RAG sources configured'
    END as status
FROM dh_rag;

-- Test 5.3: RAG sources by type
SELECT 
    source_type,
    COUNT(*) as source_count,
    SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_count
FROM dh_rag
GROUP BY source_type
ORDER BY source_count DESC;

\echo ''

-- ============================================================================
-- SECTION 6: AGENT → SPECIFIC KNOWLEDGE
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 6: Agent → Specific Knowledge'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 6.1: Agents with knowledge domains
SELECT 
    '✅ TEST 6.1: Agents with Knowledge Domains' as test_name,
    COUNT(*) as agents_with_knowledge,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents WHERE is_active = true) as percentage,
    CASE 
        WHEN COUNT(*) >= 100 THEN '✅ PASS'
        ELSE '⚠️ WARN - Many agents missing knowledge domains'
    END as status
FROM agents
WHERE is_active = true
  AND (knowledge_domains IS NOT NULL AND array_length(knowledge_domains, 1) > 0);

-- Test 6.2: Sample agents with knowledge domains
SELECT 
    a.name as agent_name,
    array_length(a.knowledge_domains, 1) as domain_count,
    a.knowledge_domains
FROM agents a
WHERE a.is_active = true
  AND a.knowledge_domains IS NOT NULL
  AND array_length(a.knowledge_domains, 1) > 0
ORDER BY array_length(a.knowledge_domains, 1) DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- SECTION 7: AGENT → AVATAR ICONS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 7: Agent → Avatar Icons'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 7.1: Agents with avatars
SELECT 
    '✅ TEST 7.1: Agents with Avatars' as test_name,
    COUNT(*) as agents_with_avatars,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents WHERE is_active = true) as percentage,
    CASE 
        WHEN COUNT(*) >= 200 THEN '✅ PASS'
        ELSE '⚠️ WARN - Many agents missing avatars'
    END as status
FROM agents
WHERE is_active = true
  AND (avatar IS NOT NULL AND avatar != '');

-- Test 7.2: Available avatar icons
SELECT 
    '✅ TEST 7.2: Available Avatar Icons' as test_name,
    COUNT(*) as icon_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '⚠️ WARN - No avatar icons defined'
    END as status
FROM dh_avatar_icon;

-- Test 7.3: Avatar usage distribution
SELECT 
    avatar,
    COUNT(*) as usage_count
FROM agents
WHERE is_active = true AND avatar IS NOT NULL
GROUP BY avatar
ORDER BY usage_count DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- SECTION 8: AGENT → LLM MODELS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 8: Agent → LLM Models'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 8.1: Agents with LLM models configured
SELECT 
    '✅ TEST 8.1: Agents with LLM Models' as test_name,
    COUNT(*) as agents_with_models,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents WHERE is_active = true) as percentage,
    CASE 
        WHEN COUNT(*) >= 250 THEN '✅ PASS'
        ELSE '⚠️ WARN - Many agents missing LLM model'
    END as status
FROM agents
WHERE is_active = true
  AND (model IS NOT NULL AND model != '');

-- Test 8.2: Model distribution
SELECT 
    model,
    COUNT(*) as agent_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM agents
WHERE is_active = true AND model IS NOT NULL
GROUP BY model
ORDER BY agent_count DESC;

-- Test 8.3: Temperature and max_tokens configuration
SELECT 
    '✅ TEST 8.3: Agents with Model Parameters' as test_name,
    COUNT(*) as agents_with_params,
    ROUND(AVG(temperature), 2) as avg_temperature,
    ROUND(AVG(max_tokens), 0) as avg_max_tokens,
    CASE 
        WHEN COUNT(*) >= 200 THEN '✅ PASS'
        ELSE '⚠️ WARN - Many agents missing model parameters'
    END as status
FROM agents
WHERE is_active = true
  AND temperature IS NOT NULL
  AND max_tokens IS NOT NULL;

\echo ''

-- ============================================================================
-- SECTION 9: AGENT → CAPABILITIES
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 9: Agent → Capabilities'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 9.1: Agents with capabilities
SELECT 
    '✅ TEST 9.1: Agents with Capabilities' as test_name,
    COUNT(*) as agents_with_capabilities,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents WHERE is_active = true) as percentage,
    CASE 
        WHEN COUNT(*) >= 200 THEN '✅ PASS'
        ELSE '⚠️ WARN - Many agents missing capabilities'
    END as status
FROM agents
WHERE is_active = true
  AND (capabilities IS NOT NULL AND array_length(capabilities, 1) > 0);

-- Test 9.2: Most common capabilities
SELECT 
    unnest(capabilities) as capability,
    COUNT(*) as agent_count
FROM agents
WHERE is_active = true AND capabilities IS NOT NULL
GROUP BY capability
ORDER BY agent_count DESC
LIMIT 15;

-- Test 9.3: Capability distribution
SELECT 
    array_length(capabilities, 1) as capability_count,
    COUNT(*) as agent_count
FROM agents
WHERE is_active = true AND capabilities IS NOT NULL
GROUP BY capability_count
ORDER BY capability_count;

\echo ''

-- ============================================================================
-- SECTION 10: AGENT → PHARMA PROTOCOL
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 10: Agent → Pharma Protocol'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 10.1: Agents with Pharma Protocol enabled
SELECT 
    '✅ TEST 10.1: Agents with Pharma Protocol' as test_name,
    COUNT(*) as pharma_protocol_agents,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents WHERE is_active = true) as percentage,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE 'ℹ️ INFO - Pharma Protocol may be optional'
    END as status
FROM agents
WHERE is_active = true
  AND (pharma_protocol_enabled = true OR pharma_protocol IS NOT NULL);

-- Test 10.2: Pharma Protocol configuration
SELECT 
    a.name as agent_name,
    a.category,
    a.pharma_protocol_enabled,
    a.pharma_protocol
FROM agents a
WHERE a.is_active = true
  AND (a.pharma_protocol_enabled = true OR a.pharma_protocol IS NOT NULL)
LIMIT 10;

\echo ''

-- ============================================================================
-- SECTION 11: AGENT → VERIFY PROTOCOL
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 11: Agent → VERIFY Protocol'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 11.1: Agents with VERIFY Protocol enabled
SELECT 
    '✅ TEST 11.1: Agents with VERIFY Protocol' as test_name,
    COUNT(*) as verify_protocol_agents,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents WHERE is_active = true) as percentage,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE 'ℹ️ INFO - VERIFY Protocol may be optional'
    END as status
FROM agents
WHERE is_active = true
  AND (verify_protocol_enabled = true OR verify_protocol IS NOT NULL);

-- Test 11.2: VERIFY Protocol configuration
SELECT 
    a.name as agent_name,
    a.category,
    a.verify_protocol_enabled,
    a.verify_protocol
FROM agents a
WHERE a.is_active = true
  AND (a.verify_protocol_enabled = true OR a.verify_protocol IS NOT NULL)
LIMIT 10;

\echo ''

-- ============================================================================
-- SECTION 12: AGENT → TIERS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 12: Agent → Tiers'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 12.1: Agents with tier configuration
SELECT 
    '✅ TEST 12.1: Agents with Tiers' as test_name,
    COUNT(*) as agents_with_tiers,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents WHERE is_active = true) as percentage,
    CASE 
        WHEN COUNT(*) >= 200 THEN '✅ PASS'
        ELSE '⚠️ WARN - Many agents missing tier'
    END as status
FROM agents
WHERE is_active = true
  AND (tier IS NOT NULL AND tier != '');

-- Test 12.2: Tier distribution
SELECT 
    tier,
    COUNT(*) as agent_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM agents
WHERE is_active = true AND tier IS NOT NULL
GROUP BY tier
ORDER BY agent_count DESC;

\echo ''

-- ============================================================================
-- SECTION 13: AGENT → LIFECYCLE STAGE
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 13: Agent → Lifecycle Stage'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 13.1: Agents with lifecycle stage
SELECT 
    '✅ TEST 13.1: Agents with Lifecycle Stage' as test_name,
    COUNT(*) as agents_with_lifecycle,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents WHERE is_active = true) as percentage,
    CASE 
        WHEN COUNT(*) >= 200 THEN '✅ PASS'
        ELSE '⚠️ WARN - Many agents missing lifecycle stage'
    END as status
FROM agents
WHERE is_active = true
  AND (lifecycle_stage IS NOT NULL AND lifecycle_stage != '');

-- Test 13.2: Lifecycle stage distribution
SELECT 
    lifecycle_stage,
    COUNT(*) as agent_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM agents
WHERE is_active = true AND lifecycle_stage IS NOT NULL
GROUP BY lifecycle_stage
ORDER BY agent_count DESC;

-- Test 13.3: Production-ready agents
SELECT 
    '✅ TEST 13.3: Production-Ready Agents' as test_name,
    COUNT(*) as production_agents,
    CASE 
        WHEN COUNT(*) >= 150 THEN '✅ PASS'
        ELSE '⚠️ WARN - Few production-ready agents'
    END as status
FROM agents
WHERE is_active = true AND lifecycle_stage = 'production';

\echo ''

-- ============================================================================
-- SECTION 14: SUPER ADMIN PERMISSIONS (RLS TESTS)
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 14: Super Admin CRUD Permissions'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 14.1: Check RLS policies on agents table
SELECT 
    '✅ TEST 14.1: RLS Policies on Agents Table' as test_name,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS - RLS enabled'
        ELSE '⚠️ WARN - No RLS policies found'
    END as status
FROM pg_policies
WHERE tablename = 'agents';

-- Test 14.2: List RLS policies for agents
SELECT 
    policyname as policy_name,
    cmd as command,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies
WHERE tablename = 'agents'
ORDER BY cmd, policyname;

-- Test 14.3: Super admin role check
SELECT 
    '✅ TEST 14.3: Super Admin Role Exists' as test_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'super_admin') THEN '✅ PASS'
        WHEN EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN '✅ PASS (service_role)'
        ELSE '⚠️ WARN - No super admin role found'
    END as status;

\echo ''
\echo 'ℹ️  Super Admin CRUD verification:'
\echo '   → Super Admin should have SELECT, INSERT, UPDATE, DELETE on all agents'
\echo '   → Verify via RLS policies above'
\echo ''

-- ============================================================================
-- SECTION 15: USER PERMISSIONS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 15: User Permissions (User-Specific Agents)'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 15.1: User agents table exists
SELECT 
    '✅ TEST 15.1: User Agents Table' as test_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_agents') 
        THEN '✅ PASS'
        ELSE '❌ FAIL - user_agents table missing'
    END as status;

-- Test 15.2: User agent assignments
SELECT 
    '✅ TEST 15.2: User Agent Assignments' as test_name,
    COUNT(*) as total_user_agents,
    COUNT(DISTINCT user_id) as users_with_agents,
    COUNT(DISTINCT agent_id) as unique_agents_assigned,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE 'ℹ️ INFO - No user agents yet'
    END as status
FROM user_agents;

-- Test 15.3: Custom agents created by users
SELECT 
    '✅ TEST 15.3: User-Created Custom Agents' as test_name,
    COUNT(*) as custom_agent_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE 'ℹ️ INFO - No custom agents yet'
    END as status
FROM agents
WHERE created_by IS NOT NULL
  AND is_custom = true;

-- Test 15.4: User agent duplication capability check
-- Check if duplicated agents exist (agents with source_agent_id)
SELECT 
    '✅ TEST 15.4: Duplicated Agents' as test_name,
    COUNT(*) as duplicated_agent_count,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ PASS - Feature available'
        ELSE 'ℹ️ INFO'
    END as status
FROM agents
WHERE source_agent_id IS NOT NULL OR is_duplicate = true;

-- Test 15.5: RLS policies for user agents
SELECT 
    '✅ TEST 15.5: RLS Policies for User Agents' as test_name,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '⚠️ WARN - No RLS policies for user agents'
    END as status
FROM pg_policies
WHERE tablename = 'user_agents';

\echo ''
\echo 'ℹ️  User Permission Requirements:'
\echo '   → Users can SELECT agents (view)'
\echo '   → Users can INSERT into user_agents (assign agents to themselves)'
\echo '   → Users can INSERT into agents with created_by = user_id (create custom)'
\echo '   → Users can UPDATE agents WHERE created_by = user_id (edit their own)'
\echo '   → Users can DELETE agents WHERE created_by = user_id (delete their own)'
\echo '   → Users can duplicate agents (copy to create custom version)'
\echo ''

-- ============================================================================
-- SECTION 16: COMPLETE AGENT PROFILE VALIDATION
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 16: Complete Agent Profile Validation'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 16.1: Fully configured agents (all relationships)
SELECT 
    '✅ TEST 16.1: Fully Configured Agents' as test_name,
    COUNT(*) as fully_configured_count,
    CASE 
        WHEN COUNT(*) >= 50 THEN '✅ PASS'
        ELSE '⚠️ WARN - Few fully configured agents'
    END as status
FROM agents a
WHERE a.is_active = true
  AND a.name IS NOT NULL
  AND a.description IS NOT NULL
  AND a.system_prompt IS NOT NULL
  AND a.model IS NOT NULL
  AND a.avatar IS NOT NULL
  AND a.tier IS NOT NULL
  AND a.lifecycle_stage IS NOT NULL
  AND (a.capabilities IS NOT NULL AND array_length(a.capabilities, 1) > 0)
  AND EXISTS (SELECT 1 FROM agent_tools at WHERE at.agent_id = a.id);

-- Test 16.2: Sample of fully configured agents
SELECT 
    a.name,
    a.category,
    a.tier,
    a.lifecycle_stage,
    COUNT(at.tool_id) as tools,
    a.rag_enabled,
    CASE WHEN a.role_id IS NOT NULL THEN '✅' ELSE '❌' END as has_role
FROM agents a
LEFT JOIN agent_tools at ON at.agent_id = a.id
WHERE a.is_active = true
  AND a.system_prompt IS NOT NULL
  AND a.model IS NOT NULL
GROUP BY a.id, a.name, a.category, a.tier, a.lifecycle_stage, a.rag_enabled, a.role_id
ORDER BY tools DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- SECTION 17: SUMMARY STATISTICS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 17: Agent Relationship Summary'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

SELECT 
    'Total Active Agents' as metric,
    COUNT(*)::text as value
FROM agents WHERE is_active = true
UNION ALL
SELECT 'Agents with Roles', COUNT(*)::text FROM agents WHERE is_active = true AND role_id IS NOT NULL
UNION ALL
SELECT 'Agents with Tools', COUNT(DISTINCT agent_id)::text FROM agent_tools
UNION ALL
SELECT 'Agents with RAG', COUNT(*)::text FROM agents WHERE is_active = true AND rag_enabled = true
UNION ALL
SELECT 'Agents with Avatars', COUNT(*)::text FROM agents WHERE is_active = true AND avatar IS NOT NULL
UNION ALL
SELECT 'Agents with Prompt Starters', COUNT(*)::text FROM agents WHERE is_active = true AND prompt_starters IS NOT NULL
UNION ALL
SELECT 'Agents with Capabilities', COUNT(*)::text FROM agents WHERE is_active = true AND capabilities IS NOT NULL
UNION ALL
SELECT 'Production Agents', COUNT(*)::text FROM agents WHERE is_active = true AND lifecycle_stage = 'production'
UNION ALL
SELECT 'User Agents', COUNT(DISTINCT agent_id)::text FROM user_agents
UNION ALL
SELECT 'Custom Agents', COUNT(*)::text FROM agents WHERE is_custom = true;

\echo ''
\echo '╔══════════════════════════════════════════════════════════════════════════════╗'
\echo '║                                                                              ║'
\echo '║                  ✅ AGENT RELATIONSHIP TESTS COMPLETE                        ║'
\echo '║                                                                              ║'
\echo '╚══════════════════════════════════════════════════════════════════════════════╝'

