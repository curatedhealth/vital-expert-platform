-- ============================================================================
-- QUICK VERIFICATION QUERIES - Digital Health Workflow System
-- ============================================================================
-- Purpose: Fast verification of system completeness and health
-- Usage: Run any query to check specific aspects of the system
-- Status: 343 prompts | 50 use cases | 5 domains | 100% complete
-- ============================================================================

-- ============================================================================
-- 1. QUICK SYSTEM OVERVIEW (Run this first!)
-- ============================================================================
SELECT 
    'TOTAL' as category,
    COUNT(DISTINCT uc.id) as use_cases,
    COUNT(DISTINCT wf.id) as workflows,
    COUNT(DISTINCT t.id) as tasks,
    COUNT(DISTINCT p.id) as prompts,
    CASE 
        WHEN COUNT(DISTINCT p.id) = COUNT(DISTINCT t.id) THEN '✅ 100%'
        ELSE '⚠️ ' || ROUND(COUNT(DISTINCT p.id)::numeric / NULLIF(COUNT(DISTINCT t.id), 0) * 100, 1) || '%'
    END as coverage
FROM dh_use_case uc
LEFT JOIN dh_workflow wf ON wf.use_case_id = uc.id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
LEFT JOIN dh_prompt p ON p.task_id = t.id
WHERE uc.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1);

-- Expected Result: 50 use cases | 116 workflows | 343 tasks | 343 prompts | ✅ 100%


-- ============================================================================
-- 2. DOMAIN BREAKDOWN (Check each domain)
-- ============================================================================
SELECT 
    d.code as domain,
    d.name,
    COUNT(DISTINCT uc.id) as use_cases,
    COUNT(DISTINCT wf.id) as workflows,
    COUNT(DISTINCT t.id) as tasks,
    COUNT(DISTINCT p.id) as prompts,
    CASE 
        WHEN COUNT(DISTINCT p.id) = COUNT(DISTINCT t.id) AND COUNT(DISTINCT t.id) > 0 THEN '✅ 100%'
        WHEN COUNT(DISTINCT t.id) = 0 THEN '❌ No tasks'
        ELSE '⚠️ ' || ROUND(COUNT(DISTINCT p.id)::numeric / COUNT(DISTINCT t.id) * 100, 1) || '%'
    END as coverage
FROM dh_domain d
LEFT JOIN dh_use_case uc ON uc.domain_id = d.id AND uc.tenant_id = d.tenant_id
LEFT JOIN dh_workflow wf ON wf.use_case_id = uc.id AND wf.tenant_id = uc.tenant_id
LEFT JOIN dh_task t ON t.workflow_id = wf.id AND t.tenant_id = wf.tenant_id
LEFT JOIN dh_prompt p ON p.task_id = t.id AND p.tenant_id = t.tenant_id
WHERE d.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
GROUP BY d.code, d.name
ORDER BY d.code;

-- Expected Result:
-- CD: 10 use cases | 76 workflows | 88 tasks | 88 prompts | ✅ 100%
-- EG: 10 use cases | 10 workflows | 67 tasks | 67 prompts | ✅ 100%
-- MA: 10 use cases | 10 workflows | 63 tasks | 63 prompts | ✅ 100%
-- PD: 10 use cases | 10 workflows | 60 tasks | 60 prompts | ✅ 100%
-- RA: 10 use cases | 10 workflows | 65 tasks | 65 prompts | ✅ 100%


-- ============================================================================
-- 3. USE CASE DETAILS (Check specific use cases)
-- ============================================================================
SELECT 
    uc.code,
    uc.title,
    uc.complexity,
    COUNT(DISTINCT wf.id) as workflows,
    COUNT(DISTINCT t.id) as tasks,
    COUNT(DISTINCT p.id) as prompts,
    CASE 
        WHEN COUNT(DISTINCT p.id) = COUNT(DISTINCT t.id) AND COUNT(DISTINCT t.id) > 0 THEN '✅ Complete'
        WHEN COUNT(DISTINCT p.id) > 0 THEN '🟡 Partial'
        WHEN COUNT(DISTINCT t.id) > 0 THEN '⏳ No prompts'
        ELSE '❌ No tasks'
    END as status
FROM dh_use_case uc
LEFT JOIN dh_workflow wf ON wf.use_case_id = uc.id AND wf.tenant_id = uc.tenant_id
LEFT JOIN dh_task t ON t.workflow_id = wf.id AND t.tenant_id = wf.tenant_id
LEFT JOIN dh_prompt p ON p.task_id = t.id AND p.tenant_id = t.tenant_id
WHERE uc.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
GROUP BY uc.code, uc.title, uc.complexity
ORDER BY uc.code;

-- Expected Result: All 50 use cases with '✅ Complete' status


-- ============================================================================
-- 4. FOUNDATION ENTITIES (Check reusable components)
-- ============================================================================
SELECT 
    'Agents' as entity_type, 
    COUNT(*) as count,
    '17' as expected,
    CASE WHEN COUNT(*) >= 17 THEN '✅' ELSE '⚠️' END as status
FROM dh_agent 
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)

UNION ALL

SELECT 'Tools', COUNT(*), '17',
    CASE WHEN COUNT(*) >= 17 THEN '✅' ELSE '⚠️' END
FROM dh_tool 
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)

UNION ALL

SELECT 'RAG Sources', COUNT(*), '24',
    CASE WHEN COUNT(*) >= 24 THEN '✅' ELSE '⚠️' END
FROM dh_rag_source 
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)

UNION ALL

SELECT 'Personas', COUNT(*), '35',
    CASE WHEN COUNT(*) >= 35 THEN '✅' ELSE '⚠️' END
FROM dh_persona 
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)

UNION ALL

SELECT 'Prompt Suites', COUNT(*), '2',
    CASE WHEN COUNT(*) >= 2 THEN '✅' ELSE '⚠️' END
FROM dh_prompt_suite 
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)

UNION ALL

SELECT 'Prompt Sub-Suites', COUNT(*), '3',
    CASE WHEN COUNT(*) >= 3 THEN '✅' ELSE '⚠️' END
FROM dh_prompt_subsuite 
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)

ORDER BY entity_type;


-- ============================================================================
-- 5. PROMPT SUITE VERIFICATION (Check FORGE™ framework)
-- ============================================================================
SELECT 
    ps.unique_id as suite_id,
    ps.name as suite_name,
    COUNT(DISTINCT pss.id) as subsuites,
    COUNT(DISTINCT psp.prompt_id) as linked_prompts
FROM dh_prompt_suite ps
LEFT JOIN dh_prompt_subsuite pss ON pss.suite_id = ps.id AND pss.tenant_id = ps.tenant_id
LEFT JOIN dh_prompt_suite_prompt psp ON psp.suite_id = ps.id AND psp.tenant_id = ps.tenant_id
WHERE ps.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
GROUP BY ps.unique_id, ps.name
ORDER BY ps.name;

-- Expected Result:
-- SUITE-FORGE: 5 subsuites | 343 prompts
-- SUITE-LEGACY: 0 subsuites | 205 prompts (if legacy migrated)


-- ============================================================================
-- 6. TASKS WITHOUT PROMPTS (Should be empty!)
-- ============================================================================
SELECT 
    t.unique_id as task_id,
    t.code,
    t.title,
    uc.code as use_case,
    wf.name as workflow
FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE t.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
AND NOT EXISTS (
    SELECT 1 FROM dh_prompt p WHERE p.task_id = t.id
)
ORDER BY uc.code, t.unique_id;

-- Expected Result: (Empty - 0 rows) = ✅ Perfect!


-- ============================================================================
-- 7. PROMPT PATTERNS DISTRIBUTION (Check variety)
-- ============================================================================
SELECT 
    pattern,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM dh_prompt WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)) * 100, 1) as percentage
FROM dh_prompt
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
GROUP BY pattern
ORDER BY count DESC;

-- Shows distribution: Direct, CoT, Few-Shot, ReAct, RAG, etc.


-- ============================================================================
-- 8. MOST ACTIVE AGENTS (Check agent usage)
-- ============================================================================
SELECT 
    a.code as agent_code,
    a.name as agent_name,
    COUNT(DISTINCT ta.task_id) as tasks_assigned,
    COUNT(DISTINCT uc.id) as use_cases_involved
FROM dh_agent a
LEFT JOIN dh_task_agent ta ON ta.agent_id = a.id AND ta.tenant_id = a.tenant_id
LEFT JOIN dh_task t ON t.id = ta.task_id AND t.tenant_id = ta.tenant_id
LEFT JOIN dh_workflow wf ON wf.id = t.workflow_id AND wf.tenant_id = t.tenant_id
LEFT JOIN dh_use_case uc ON uc.id = wf.use_case_id AND uc.tenant_id = wf.tenant_id
WHERE a.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
GROUP BY a.code, a.name
ORDER BY tasks_assigned DESC
LIMIT 10;

-- Shows which agents are most utilized


-- ============================================================================
-- 9. MOST USED TOOLS (Check tool utilization)
-- ============================================================================
SELECT 
    tool.name as tool_name,
    tool.unique_id as tool_id,
    COUNT(DISTINCT tt.task_id) as tasks_using,
    COUNT(DISTINCT uc.id) as use_cases
FROM dh_tool tool
LEFT JOIN dh_task_tool tt ON tt.tool_id = tool.id AND tt.tenant_id = tool.tenant_id
LEFT JOIN dh_task t ON t.id = tt.task_id AND t.tenant_id = tt.tenant_id
LEFT JOIN dh_workflow wf ON wf.id = t.workflow_id AND wf.tenant_id = t.tenant_id
LEFT JOIN dh_use_case uc ON uc.id = wf.use_case_id AND uc.tenant_id = wf.tenant_id
WHERE tool.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
GROUP BY tool.name, tool.unique_id
ORDER BY tasks_using DESC
LIMIT 10;


-- ============================================================================
-- 10. COMPLEXITY DISTRIBUTION (Check use case difficulty)
-- ============================================================================
SELECT 
    complexity,
    COUNT(*) as use_cases,
    COUNT(DISTINCT t.id) as total_tasks,
    ROUND(AVG(task_count.cnt), 1) as avg_tasks_per_use_case
FROM dh_use_case uc
LEFT JOIN dh_workflow wf ON wf.use_case_id = uc.id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
LEFT JOIN (
    SELECT uc2.id, COUNT(t2.id) as cnt
    FROM dh_use_case uc2
    LEFT JOIN dh_workflow wf2 ON wf2.use_case_id = uc2.id
    LEFT JOIN dh_task t2 ON t2.workflow_id = wf2.id
    WHERE uc2.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
    GROUP BY uc2.id
) task_count ON task_count.id = uc.id
WHERE uc.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
GROUP BY complexity
ORDER BY 
    CASE complexity
        WHEN 'Beginner' THEN 1
        WHEN 'Intermediate' THEN 2
        WHEN 'Advanced' THEN 3
        WHEN 'Expert' THEN 4
    END;


-- ============================================================================
-- 11. RECENT ACTIVITY (Check latest changes)
-- ============================================================================
SELECT 
    'Prompts' as entity,
    COUNT(*) as total,
    MAX(created_at) as latest_created,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as created_last_7_days
FROM dh_prompt
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)

UNION ALL

SELECT 'Tasks', COUNT(*), MAX(created_at),
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END)
FROM dh_task
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)

UNION ALL

SELECT 'Use Cases', COUNT(*), MAX(created_at),
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END)
FROM dh_use_case
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1);


-- ============================================================================
-- 12. SYSTEM HEALTH CHECK (Run this for quick validation)
-- ============================================================================
WITH health_metrics AS (
    SELECT 
        (SELECT COUNT(*) FROM dh_use_case WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)) as use_cases,
        (SELECT COUNT(*) FROM dh_workflow WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)) as workflows,
        (SELECT COUNT(*) FROM dh_task WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)) as tasks,
        (SELECT COUNT(*) FROM dh_prompt WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)) as prompts,
        (SELECT COUNT(*) FROM dh_task t WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) 
            AND NOT EXISTS (SELECT 1 FROM dh_prompt p WHERE p.task_id = t.id)) as tasks_without_prompts
)
SELECT 
    CASE 
        WHEN use_cases = 50 AND tasks = prompts AND tasks_without_prompts = 0 THEN '✅ SYSTEM HEALTHY - 100% COMPLETE'
        WHEN tasks_without_prompts > 0 THEN '⚠️ WARNING: ' || tasks_without_prompts || ' tasks without prompts'
        WHEN tasks != prompts THEN '⚠️ WARNING: Task/Prompt mismatch'
        ELSE '❌ ERROR: System incomplete'
    END as health_status,
    use_cases || '/50' as use_case_status,
    workflows as total_workflows,
    tasks || '/' || prompts as task_prompt_ratio,
    CASE WHEN tasks_without_prompts = 0 THEN '✅ 100%' 
         ELSE '⚠️ ' || tasks_without_prompts || ' missing' END as coverage
FROM health_metrics;

-- Expected Result: ✅ SYSTEM HEALTHY - 100% COMPLETE


-- ============================================================================
-- QUICK REFERENCE
-- ============================================================================
-- Query 1:  Quick Overview → Run this first!
-- Query 2:  Domain Breakdown → Check each domain (CD, RA, MA, EG, PD)
-- Query 3:  Use Case Details → Verify all 50 use cases
-- Query 4:  Foundation Entities → Check agents, tools, RAGs, personas
-- Query 5:  FORGE™ Framework → Verify suite structure
-- Query 6:  Missing Prompts → Should be empty (0 rows)
-- Query 12: Health Check → Quick validation (should show ✅)
-- ============================================================================

