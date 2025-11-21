-- ============================================================================
-- WORKFLOW Schema Analysis Queries
-- Understand the full workflow, task, step hierarchy
-- Date: 2025-11-19
-- ============================================================================

-- ============================================================================
-- 1. ALL WORKFLOW-RELATED TABLES
-- ============================================================================

SELECT
    '1. WORKFLOW TABLES' as section,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c
     WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND (
    table_name LIKE 'workflow%'
    OR table_name LIKE 'task%'
    OR table_name LIKE 'step%'
    OR table_name = 'execution_context'
  )
ORDER BY
    CASE
        WHEN table_name = 'workflows' THEN 1
        WHEN table_name LIKE 'workflow_step%' THEN 2
        WHEN table_name LIKE 'workflow_task%' THEN 3
        WHEN table_name LIKE 'workflow_execution%' THEN 4
        WHEN table_name LIKE 'workflow%' THEN 5
        WHEN table_name = 'tasks' THEN 6
        WHEN table_name LIKE 'task%' THEN 7
        WHEN table_name = 'steps' THEN 8
        ELSE 9
    END,
    table_name;

-- ============================================================================
-- 2. DETAILED COLUMN STRUCTURE
-- ============================================================================

SELECT
    '2. COLUMN DETAILS' as section,
    c.table_name,
    c.column_name,
    c.data_type,
    c.udt_name,
    c.is_nullable,
    c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND (
    c.table_name LIKE 'workflow%'
    OR c.table_name LIKE 'task%'
    OR c.table_name LIKE 'step%'
    OR c.table_name = 'execution_context'
  )
ORDER BY c.table_name, c.ordinal_position;

-- ============================================================================
-- 3. FOREIGN KEY RELATIONSHIPS
-- ============================================================================

SELECT
    '3. FK RELATIONSHIPS' as section,
    tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_name as to_table,
    ccu.column_name as to_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (
    tc.table_name LIKE 'workflow%'
    OR tc.table_name LIKE 'task%'
    OR tc.table_name LIKE 'step%'
    OR tc.table_name = 'execution_context'
  )
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- 4. CURRENT DATA COUNTS
-- ============================================================================

WITH table_counts AS (
    SELECT 'workflows' as table_name, COUNT(*) as record_count FROM workflows
    UNION ALL SELECT 'workflow_step_definitions', COUNT(*) FROM workflow_step_definitions
    UNION ALL SELECT 'workflow_step_connections', COUNT(*) FROM workflow_step_connections
    UNION ALL SELECT 'workflow_tasks', COUNT(*) FROM workflow_tasks
    UNION ALL SELECT 'workflow_executions', COUNT(*) FROM workflow_executions
    UNION ALL SELECT 'workflow_execution_steps', COUNT(*) FROM workflow_execution_steps
    UNION ALL SELECT 'workflow_logs', COUNT(*) FROM workflow_logs
    UNION ALL SELECT 'workflow_approvals', COUNT(*) FROM workflow_approvals
    UNION ALL SELECT 'execution_context', COUNT(*) FROM execution_context
    UNION ALL SELECT 'tasks', COUNT(*) FROM tasks
    UNION ALL SELECT 'task_agents', COUNT(*) FROM task_agents
    UNION ALL SELECT 'task_skills', COUNT(*) FROM task_skills
    UNION ALL SELECT 'task_tools', COUNT(*) FROM task_tools
    UNION ALL SELECT 'task_prerequisites', COUNT(*) FROM task_prerequisites
    UNION ALL SELECT 'steps', COUNT(*) FROM steps
)
SELECT
    '4. DATA COUNTS' as section,
    table_name,
    record_count,
    CASE
        WHEN record_count = 0 THEN 'EMPTY'
        WHEN record_count < 10 THEN 'LOW'
        WHEN record_count < 50 THEN 'MEDIUM'
        ELSE 'HIGH'
    END as data_status
FROM table_counts
ORDER BY
    CASE table_name
        WHEN 'workflows' THEN 1
        WHEN 'workflow_step_definitions' THEN 2
        WHEN 'workflow_step_connections' THEN 3
        WHEN 'tasks' THEN 4
        WHEN 'steps' THEN 5
        ELSE 99
    END,
    table_name;

-- ============================================================================
-- 5. HIERARCHY DIAGRAM
-- ============================================================================

SELECT '5. WORKFLOW HIERARCHY' as section,
'
WORKFLOW SCHEMA HIERARCHY
==========================

DESIGN-TIME (Templates/Definitions)
===================================

workflows
├── created_by → users
├── organization_id → organizations
├── project_id → projects
│
├── workflow_step_definitions (Steps in the workflow)
│   ├── workflow_id → workflows
│   └── task_id → tasks
│
├── workflow_step_connections (Step flow/dependencies)
│   ├── workflow_id → workflows
│   ├── from_step_id → workflow_step_definitions
│   └── to_step_id → workflow_step_definitions
│
└── workflow_tasks (Tasks assigned to workflow)
    ├── workflow_id → workflows
    └── task_id → tasks

tasks (Reusable task definitions)
├── model_config_id → model_configurations
├── tenant_id → tenants
│
├── task_agents (Agents that can perform task)
│   ├── task_id → tasks
│   └── agent_id → agents
│
├── task_skills (Skills required)
│   ├── task_id → tasks
│   └── skill_id → skills
│
├── task_tools (Tools used)
│   ├── task_id → tasks
│   └── tool_id → tools
│
└── task_prerequisites (Task dependencies)
    ├── task_id → tasks
    └── prerequisite_task_id → tasks

steps (Atomic steps within tasks)
├── task_id → tasks
└── tool_id → tools


RUNTIME (Executions)
====================

workflow_executions
├── workflow_id → workflows
├── triggered_by → users
│
├── workflow_execution_steps (Running steps)
│   ├── execution_id → workflow_executions
│   ├── step_id → steps
│   ├── agent_id → agents
│   └── task_id → tasks
│
├── workflow_logs (Execution logs)
│   ├── execution_id → workflow_executions
│   └── step_id → workflow_execution_steps
│
├── workflow_approvals (Human approvals)
│   ├── execution_id → workflow_executions
│   ├── step_id → workflow_execution_steps
│   └── approved_by → user_profiles
│
└── execution_context (Runtime state)
    ├── execution_id → workflow_executions
    └── step_id → workflow_execution_steps
' as diagram;

-- ============================================================================
-- 6. WORKFLOW DEFINITIONS LIST
-- ============================================================================

SELECT
    '6. WORKFLOWS' as section,
    w.id,
    w.name,
    w.description,
    w.status,
    o.name as organization_name,
    p.name as project_name,
    u.email as created_by,
    (SELECT COUNT(*) FROM workflow_step_definitions WHERE workflow_id = w.id) as step_count,
    (SELECT COUNT(*) FROM workflow_tasks WHERE workflow_id = w.id) as task_count,
    (SELECT COUNT(*) FROM workflow_executions WHERE workflow_id = w.id) as execution_count,
    w.created_at
FROM workflows w
LEFT JOIN organizations o ON o.id = w.organization_id
LEFT JOIN projects p ON p.id = w.project_id
LEFT JOIN users u ON u.id = w.created_by
ORDER BY w.created_at DESC;

-- ============================================================================
-- 7. TASK DEFINITIONS
-- ============================================================================

SELECT
    '7. TASKS' as section,
    t.id,
    t.name,
    t.description,
    t.type,
    t.status,
    (SELECT COUNT(*) FROM task_agents WHERE task_id = t.id) as agent_count,
    (SELECT COUNT(*) FROM task_skills WHERE task_id = t.id) as skill_count,
    (SELECT COUNT(*) FROM task_tools WHERE task_id = t.id) as tool_count,
    (SELECT COUNT(*) FROM steps WHERE task_id = t.id) as step_count,
    t.created_at
FROM tasks t
ORDER BY t.name;

-- ============================================================================
-- 8. WORKFLOW STEP FLOW
-- ============================================================================

SELECT
    '8. STEP CONNECTIONS' as section,
    w.name as workflow_name,
    fs.id as from_step_id,
    ft.name as from_task,
    ts.id as to_step_id,
    tt.name as to_task,
    wsc.condition_type,
    wsc.condition_value
FROM workflow_step_connections wsc
JOIN workflows w ON w.id = wsc.workflow_id
JOIN workflow_step_definitions fs ON fs.id = wsc.from_step_id
JOIN workflow_step_definitions ts ON ts.id = wsc.to_step_id
LEFT JOIN tasks ft ON ft.id = fs.task_id
LEFT JOIN tasks tt ON tt.id = ts.task_id
ORDER BY w.name, wsc.created_at;

-- ============================================================================
-- 9. EXECUTION HISTORY
-- ============================================================================

SELECT
    '9. EXECUTIONS' as section,
    we.id as execution_id,
    w.name as workflow_name,
    we.status,
    u.email as triggered_by,
    we.started_at,
    we.completed_at,
    EXTRACT(EPOCH FROM (we.completed_at - we.started_at))/60 as duration_minutes,
    (SELECT COUNT(*) FROM workflow_execution_steps WHERE execution_id = we.id) as steps_executed,
    (SELECT COUNT(*) FROM workflow_logs WHERE execution_id = we.id) as log_entries
FROM workflow_executions we
JOIN workflows w ON w.id = we.workflow_id
LEFT JOIN users u ON u.id = we.triggered_by
ORDER BY we.started_at DESC
LIMIT 50;

-- ============================================================================
-- 10. RELATIONSHIPS SUMMARY
-- ============================================================================

SELECT '10. RELATIONSHIPS SUMMARY' as section,
'
KEY RELATIONSHIPS
=================

1. WORKFLOW → TASKS (Many-to-Many via workflow_tasks)
   - A workflow contains multiple tasks
   - A task can be used in multiple workflows

2. WORKFLOW → STEPS (via workflow_step_definitions)
   - Steps are specific instances of tasks within a workflow
   - Ordered and connected via workflow_step_connections

3. TASK → STEPS (One-to-Many)
   - A task breaks down into atomic steps
   - Steps use specific tools

4. TASK → AGENTS (Many-to-Many via task_agents)
   - Multiple agents can perform a task
   - An agent can perform multiple tasks

5. TASK → SKILLS/TOOLS (Many-to-Many)
   - Tasks require skills and use tools
   - Enables capability matching

6. EXECUTION TRACKING
   - workflow_executions: Runtime instance
   - workflow_execution_steps: Step-level tracking
   - workflow_logs: Detailed logs
   - execution_context: Runtime state/variables
   - workflow_approvals: Human-in-the-loop
' as summary;

-- ============================================================================
-- END OF ANALYSIS
-- ============================================================================

SELECT 'Workflow Schema Analysis Complete' as status;
