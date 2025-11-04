-- ============================================================================
-- COMPREHENSIVE DATABASE INTEGRATION TESTS
-- Date: November 4, 2025
-- Purpose: Test all mappings between use cases, workflows, tasks, tools, 
--          agents, prompts, and related entities
-- ============================================================================

\echo '╔══════════════════════════════════════════════════════════════════════════════╗'
\echo '║                                                                              ║'
\echo '║              🧪 COMPREHENSIVE DATABASE INTEGRATION TESTS                     ║'
\echo '║                                                                              ║'
\echo '╚══════════════════════════════════════════════════════════════════════════════╝'
\echo ''

-- ============================================================================
-- SECTION 1: ENTITY COUNTS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 1: Entity Counts'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 1.1: Count all domains
SELECT 
    '✅ TEST 1.1: Domains' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 5 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM dh_domain;

-- Test 1.2: Count all use cases
SELECT 
    '✅ TEST 1.2: Use Cases' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 50 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM dh_use_case;

-- Test 1.3: Count all workflows
SELECT 
    '✅ TEST 1.3: Workflows' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 100 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM dh_workflow;

-- Test 1.4: Count all tasks
SELECT 
    '✅ TEST 1.4: Tasks' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 500 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM dh_task;

-- Test 1.5: Count all agents
SELECT 
    '✅ TEST 1.5: Agents' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 260 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM agents
WHERE is_active = true;

-- Test 1.6: Count all tools
SELECT 
    '✅ TEST 1.6: Tools' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 150 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM dh_tool
WHERE is_active = true;

-- Test 1.7: Count all prompts
SELECT 
    '✅ TEST 1.7: Prompts' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 500 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM dh_prompt;

-- Test 1.8: Count all personas
SELECT 
    '✅ TEST 1.8: Personas' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 30 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM dh_persona;

-- Test 1.9: Count all templates
SELECT 
    '✅ TEST 1.9: Templates' as test_name,
    COUNT(*) as count,
    '✅ PASS' as status
FROM dh_template;

-- Test 1.10: Count all skills
SELECT 
    '✅ TEST 1.10: Skills' as test_name,
    COUNT(*) as count,
    '✅ PASS' as status
FROM dh_skill;

\echo ''

-- ============================================================================
-- SECTION 2: HIERARCHY MAPPINGS (Domain → Use Case → Workflow → Task)
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 2: Hierarchy Mappings (Domain → Use Case → Workflow → Task)'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 2.1: Domain → Use Case mapping
SELECT 
    '✅ TEST 2.1: Domain → Use Case Mapping' as test_name,
    COUNT(DISTINCT d.id) as domains_with_usecases,
    COUNT(DISTINCT uc.id) as total_usecases,
    CASE 
        WHEN COUNT(DISTINCT uc.id) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM dh_domain d
LEFT JOIN dh_use_case uc ON uc.tenant_id = d.tenant_id;

-- Test 2.2: Use Case → Workflow mapping
SELECT 
    '✅ TEST 2.2: Use Case → Workflow Mapping' as test_name,
    COUNT(DISTINCT uc.id) as usecases_with_workflows,
    COUNT(DISTINCT w.id) as total_workflows,
    CASE 
        WHEN COUNT(DISTINCT w.id) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM dh_use_case uc
LEFT JOIN dh_workflow w ON w.use_case_id = uc.id;

-- Test 2.3: Workflow → Task mapping
SELECT 
    '✅ TEST 2.3: Workflow → Task Mapping' as test_name,
    COUNT(DISTINCT w.id) as workflows_with_tasks,
    COUNT(DISTINCT t.id) as total_tasks,
    CASE 
        WHEN COUNT(DISTINCT t.id) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM dh_workflow w
LEFT JOIN dh_task t ON t.workflow_id = w.id;

-- Test 2.4: Use Cases per Domain
SELECT 
    d.name as domain_name,
    COUNT(DISTINCT uc.id) as usecase_count
FROM dh_domain d
LEFT JOIN dh_use_case uc ON uc.tenant_id = d.tenant_id
GROUP BY d.id, d.name
ORDER BY usecase_count DESC;

-- Test 2.5: Workflows per Use Case (Top 10)
SELECT 
    uc.code as usecase_code,
    uc.title as usecase_title,
    COUNT(DISTINCT w.id) as workflow_count
FROM dh_use_case uc
LEFT JOIN dh_workflow w ON w.use_case_id = uc.id
GROUP BY uc.id, uc.code, uc.title
ORDER BY workflow_count DESC
LIMIT 10;

-- Test 2.6: Tasks per Workflow (Top 10)
SELECT 
    w.unique_id as workflow_id,
    w.title as workflow_title,
    COUNT(DISTINCT t.id) as task_count
FROM dh_workflow w
LEFT JOIN dh_task t ON t.workflow_id = w.id
GROUP BY w.id, w.unique_id, w.title
ORDER BY task_count DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- SECTION 3: TASK → AGENT MAPPINGS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 3: Task → Agent Mappings'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 3.1: Task → Agent assignments count
SELECT 
    '✅ TEST 3.1: Task → Agent Assignments' as test_name,
    COUNT(*) as total_assignments,
    COUNT(DISTINCT task_id) as tasks_with_agents,
    COUNT(DISTINCT agent_id) as agents_assigned,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM dh_task_agent;

-- Test 3.2: Tasks without agents (should be few or none)
SELECT 
    '✅ TEST 3.2: Tasks WITHOUT Agents' as test_name,
    COUNT(*) as tasks_without_agents,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS (All tasks have agents)'
        WHEN COUNT(*) < 50 THEN '⚠️ WARN (Some tasks missing agents)'
        ELSE '❌ FAIL (Many tasks missing agents)'
    END as status
FROM dh_task t
WHERE NOT EXISTS (
    SELECT 1 FROM dh_task_agent ta WHERE ta.task_id = t.id
);

-- Test 3.3: Agents per task distribution
SELECT 
    agents_per_task,
    COUNT(*) as task_count
FROM (
    SELECT 
        t.id,
        COUNT(ta.agent_id) as agents_per_task
    FROM dh_task t
    LEFT JOIN dh_task_agent ta ON ta.task_id = t.id
    GROUP BY t.id
) subquery
GROUP BY agents_per_task
ORDER BY agents_per_task;

-- Test 3.4: Most used agents (Top 10)
SELECT 
    a.name as agent_name,
    COUNT(DISTINCT ta.task_id) as task_count
FROM agents a
JOIN dh_task_agent ta ON ta.agent_id = a.id
GROUP BY a.id, a.name
ORDER BY task_count DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- SECTION 4: TASK → TOOL MAPPINGS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 4: Task → Tool Mappings'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 4.1: Task → Tool assignments count
SELECT 
    '✅ TEST 4.1: Task → Tool Assignments' as test_name,
    COUNT(*) as total_assignments,
    COUNT(DISTINCT task_id) as tasks_with_tools,
    COUNT(DISTINCT tool_id) as tools_assigned,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM dh_task_tool;

-- Test 4.2: Tasks without tools
SELECT 
    '✅ TEST 4.2: Tasks WITHOUT Tools' as test_name,
    COUNT(*) as tasks_without_tools,
    CASE 
        WHEN COUNT(*) < 100 THEN '✅ PASS'
        ELSE '⚠️ WARN (Many tasks without tools)'
    END as status
FROM dh_task t
WHERE NOT EXISTS (
    SELECT 1 FROM dh_task_tool tt WHERE tt.task_id = t.id
);

-- Test 4.3: Tools per task distribution
SELECT 
    tools_per_task,
    COUNT(*) as task_count
FROM (
    SELECT 
        t.id,
        COUNT(tt.tool_id) as tools_per_task
    FROM dh_task t
    LEFT JOIN dh_task_tool tt ON tt.task_id = t.id
    GROUP BY t.id
) subquery
GROUP BY tools_per_task
ORDER BY tools_per_task;

-- Test 4.4: Most used tools (Top 10)
SELECT 
    dt.name as tool_name,
    dt.category,
    COUNT(DISTINCT tt.task_id) as task_count
FROM dh_tool dt
JOIN dh_task_tool tt ON tt.tool_id = dt.id
GROUP BY dt.id, dt.name, dt.category
ORDER BY task_count DESC
LIMIT 10;

-- Test 4.5: Strategic Intelligence tools usage
SELECT 
    dt.name as tool_name,
    COUNT(DISTINCT tt.task_id) as task_count,
    CASE 
        WHEN COUNT(DISTINCT tt.task_id) > 0 THEN '✅ In Use'
        ELSE '⚠️ Not Used Yet'
    END as status
FROM dh_tool dt
LEFT JOIN dh_task_tool tt ON tt.tool_id = dt.id
WHERE dt.category_parent = 'Strategic Intelligence'
GROUP BY dt.id, dt.name
ORDER BY task_count DESC;

\echo ''

-- ============================================================================
-- SECTION 5: TASK → PROMPT MAPPINGS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 5: Task → Prompt Mappings'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 5.1: Task → Prompt assignments count
SELECT 
    '✅ TEST 5.1: Task → Prompt Assignments' as test_name,
    COUNT(*) as total_assignments,
    COUNT(DISTINCT task_id) as tasks_with_prompts,
    COUNT(DISTINCT prompt_id) as prompts_assigned,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM dh_task_prompt;

-- Test 5.2: Tasks without prompts
SELECT 
    '✅ TEST 5.2: Tasks WITHOUT Prompts' as test_name,
    COUNT(*) as tasks_without_prompts,
    CASE 
        WHEN COUNT(*) < 100 THEN '✅ PASS'
        ELSE '⚠️ WARN (Many tasks without prompts)'
    END as status
FROM dh_task t
WHERE NOT EXISTS (
    SELECT 1 FROM dh_task_prompt tp WHERE tp.task_id = t.id
);

-- Test 5.3: Prompts per task distribution
SELECT 
    prompts_per_task,
    COUNT(*) as task_count
FROM (
    SELECT 
        t.id,
        COUNT(tp.prompt_id) as prompts_per_task
    FROM dh_task t
    LEFT JOIN dh_task_prompt tp ON tp.task_id = t.id
    GROUP BY t.id
) subquery
GROUP BY prompts_per_task
ORDER BY prompts_per_task;

-- Test 5.4: Most used prompts (Top 10)
SELECT 
    p.title as prompt_title,
    p.prompt_type,
    COUNT(DISTINCT tp.task_id) as task_count
FROM dh_prompt p
JOIN dh_task_prompt tp ON tp.prompt_id = p.id
GROUP BY p.id, p.title, p.prompt_type
ORDER BY task_count DESC
LIMIT 10;

-- Test 5.5: Prompt Suite hierarchy
SELECT 
    ps.name as suite_name,
    pss.name as subsuite_name,
    COUNT(DISTINCT p.id) as prompt_count
FROM dh_prompt_suite ps
LEFT JOIN dh_prompt_subsuite pss ON pss.suite_id = ps.id
LEFT JOIN dh_prompt_suite_prompt psp ON psp.subsuite_id = pss.id
LEFT JOIN dh_prompt p ON p.id = psp.prompt_id
GROUP BY ps.id, ps.name, pss.id, pss.name
ORDER BY ps.name, pss.name;

\echo ''

-- ============================================================================
-- SECTION 6: TASK → PERSONA MAPPINGS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 6: Task → Persona Mappings'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 6.1: Task → Persona assignments count
SELECT 
    '✅ TEST 6.1: Task → Persona Assignments' as test_name,
    COUNT(*) as total_assignments,
    COUNT(DISTINCT task_id) as tasks_with_personas,
    COUNT(DISTINCT persona_id) as personas_assigned,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '⚠️ WARN (No persona assignments)'
    END as status
FROM dh_task_persona;

-- Test 6.2: Most used personas (Top 10)
SELECT 
    p.name as persona_name,
    p.role,
    COUNT(DISTINCT tp.task_id) as task_count
FROM dh_persona p
JOIN dh_task_persona tp ON tp.persona_id = p.id
GROUP BY p.id, p.name, p.role
ORDER BY task_count DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- SECTION 7: TASK → RAG MAPPINGS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 7: Task → RAG Mappings'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 7.1: Task → RAG assignments count
SELECT 
    '✅ TEST 7.1: Task → RAG Assignments' as test_name,
    COUNT(*) as total_assignments,
    COUNT(DISTINCT task_id) as tasks_with_rag,
    COUNT(DISTINCT rag_id) as rags_assigned,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '⚠️ WARN (No RAG assignments)'
    END as status
FROM dh_task_rag;

-- Test 7.2: Most used RAG sources (Top 10)
SELECT 
    r.name as rag_name,
    r.source_type,
    COUNT(DISTINCT tr.task_id) as task_count
FROM dh_rag r
JOIN dh_task_rag tr ON tr.rag_id = r.id
GROUP BY r.id, r.name, r.source_type
ORDER BY task_count DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- SECTION 8: AGENT → TOOL MAPPINGS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 8: Agent → Tool Mappings'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 8.1: Agent → Tool assignments count
SELECT 
    '✅ TEST 8.1: Agent → Tool Assignments' as test_name,
    COUNT(*) as total_assignments,
    COUNT(DISTINCT agent_id) as agents_with_tools,
    COUNT(DISTINCT tool_id) as tools_assigned_to_agents,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
FROM agent_tools;

-- Test 8.2: Tools per agent distribution
SELECT 
    tools_per_agent,
    COUNT(*) as agent_count
FROM (
    SELECT 
        agent_id,
        COUNT(tool_id) as tools_per_agent
    FROM agent_tools
    GROUP BY agent_id
) subquery
GROUP BY tools_per_agent
ORDER BY tools_per_agent;

-- Test 8.3: Strategic Intelligence tools assigned to agents
SELECT 
    dt.name as tool_name,
    COUNT(DISTINCT at.agent_id) as agent_count,
    CASE 
        WHEN COUNT(DISTINCT at.agent_id) > 0 THEN '✅ Assigned'
        ELSE '⚠️ Not Assigned'
    END as status
FROM dh_tool dt
LEFT JOIN agent_tools at ON at.tool_id = dt.id
WHERE dt.category_parent = 'Strategic Intelligence'
GROUP BY dt.id, dt.name
ORDER BY agent_count DESC;

\echo ''

-- ============================================================================
-- SECTION 9: TASK DEPENDENCIES
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 9: Task Dependencies'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 9.1: Task dependencies count
SELECT 
    '✅ TEST 9.1: Task Dependencies' as test_name,
    COUNT(*) as total_dependencies,
    COUNT(DISTINCT task_id) as tasks_with_dependencies,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '⚠️ WARN (No dependencies defined)'
    END as status
FROM dh_task_dependency;

-- Test 9.2: Tasks with most dependencies (Top 10)
SELECT 
    t.title as task_title,
    COUNT(td.depends_on_task_id) as dependency_count
FROM dh_task t
JOIN dh_task_dependency td ON td.task_id = t.id
GROUP BY t.id, t.title
ORDER BY dependency_count DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- SECTION 10: CROSS-MAPPING VALIDATION
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 10: Cross-Mapping Validation'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 10.1: Complete use case analysis (sample)
SELECT 
    uc.code as usecase_code,
    uc.title as usecase_title,
    COUNT(DISTINCT w.id) as workflows,
    COUNT(DISTINCT t.id) as tasks,
    COUNT(DISTINCT ta.agent_id) as agents,
    COUNT(DISTINCT tt.tool_id) as tools,
    COUNT(DISTINCT tp.prompt_id) as prompts
FROM dh_use_case uc
LEFT JOIN dh_workflow w ON w.use_case_id = uc.id
LEFT JOIN dh_task t ON t.workflow_id = w.id
LEFT JOIN dh_task_agent ta ON ta.task_id = t.id
LEFT JOIN dh_task_tool tt ON tt.task_id = t.id
LEFT JOIN dh_task_prompt tp ON tp.task_id = t.id
GROUP BY uc.id, uc.code, uc.title
ORDER BY uc.code
LIMIT 10;

-- Test 10.2: Verify no orphaned records
SELECT 
    '✅ TEST 10.2: Orphaned Workflows' as test_name,
    COUNT(*) as orphaned_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS (No orphans)'
        ELSE '⚠️ WARN (Found orphaned workflows)'
    END as status
FROM dh_workflow w
WHERE w.use_case_id IS NULL;

SELECT 
    '✅ TEST 10.3: Orphaned Tasks' as test_name,
    COUNT(*) as orphaned_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS (No orphans)'
        ELSE '⚠️ WARN (Found orphaned tasks)'
    END as status
FROM dh_task t
WHERE t.workflow_id IS NULL;

\echo ''

-- ============================================================================
-- SECTION 11: DATA QUALITY CHECKS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 11: Data Quality Checks'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 11.1: Use cases without workflows
SELECT 
    '✅ TEST 11.1: Use Cases WITHOUT Workflows' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS'
        ELSE '⚠️ WARN (Found use cases without workflows)'
    END as status
FROM dh_use_case uc
WHERE NOT EXISTS (
    SELECT 1 FROM dh_workflow w WHERE w.use_case_id = uc.id
);

-- Test 11.2: Workflows without tasks
SELECT 
    '✅ TEST 11.2: Workflows WITHOUT Tasks' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS'
        ELSE '⚠️ WARN (Found workflows without tasks)'
    END as status
FROM dh_workflow w
WHERE NOT EXISTS (
    SELECT 1 FROM dh_task t WHERE t.workflow_id = w.id
);

-- Test 11.3: Duplicate unique_ids
SELECT 
    '✅ TEST 11.3: Duplicate Use Case Codes' as test_name,
    COUNT(*) as duplicate_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS'
        ELSE '❌ FAIL (Found duplicate codes)'
    END as status
FROM (
    SELECT code, COUNT(*) as count
    FROM dh_use_case
    GROUP BY code
    HAVING COUNT(*) > 1
) duplicates;

\echo ''

-- ============================================================================
-- SECTION 12: SUMMARY STATISTICS
-- ============================================================================
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'SECTION 12: Summary Statistics'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Test 12.1: Overall system statistics
SELECT 
    'Domains' as entity,
    COUNT(*) as count
FROM dh_domain
UNION ALL
SELECT 'Use Cases', COUNT(*) FROM dh_use_case
UNION ALL
SELECT 'Workflows', COUNT(*) FROM dh_workflow
UNION ALL
SELECT 'Tasks', COUNT(*) FROM dh_task
UNION ALL
SELECT 'Agents', COUNT(*) FROM agents WHERE is_active = true
UNION ALL
SELECT 'Tools', COUNT(*) FROM dh_tool WHERE is_active = true
UNION ALL
SELECT 'Prompts', COUNT(*) FROM dh_prompt
UNION ALL
SELECT 'Personas', COUNT(*) FROM dh_persona
UNION ALL
SELECT 'Task→Agent Mappings', COUNT(*) FROM dh_task_agent
UNION ALL
SELECT 'Task→Tool Mappings', COUNT(*) FROM dh_task_tool
UNION ALL
SELECT 'Task→Prompt Mappings', COUNT(*) FROM dh_task_prompt
UNION ALL
SELECT 'Agent→Tool Mappings', COUNT(*) FROM agent_tools;

\echo ''
\echo '╔══════════════════════════════════════════════════════════════════════════════╗'
\echo '║                                                                              ║'
\echo '║                          ✅ TESTS COMPLETE                                   ║'
\echo '║                                                                              ║'
\echo '╚══════════════════════════════════════════════════════════════════════════════╝'

