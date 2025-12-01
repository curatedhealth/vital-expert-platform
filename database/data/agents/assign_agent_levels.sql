-- ============================================================================
-- ASSIGN AGENT LEVELS TO ALL AGENTS
-- ============================================================================
-- Based on the 5-level hierarchy:
-- Level 1: Master (Orchestrators - Directors, VPs, Chiefs)
-- Level 2: Expert (Deep specialists - Scientists, Strategists, Leads)
-- Level 3: Specialist (Focused specialists - Managers, Coordinators, Specific roles)
-- Level 4: Worker (Task executors - Analysts, Associates, Assistants)
-- Level 5: Tool (Micro-agents - Wrappers, APIs, Atomic operations)
-- ============================================================================

BEGIN;

-- Get level IDs
WITH level_ids AS (
    SELECT 
        id,
        name,
        level_number
    FROM agent_levels
)

-- ============================================================================
-- LEVEL 1: MASTER (Top-level orchestrators)
-- ============================================================================
-- Directors, VPs, Chiefs, C-Suite, Heads
, master_updates AS (
UPDATE agents 
SET agent_level_id = (SELECT id FROM level_ids WHERE name = 'Master')
WHERE agent_level_id IS NULL
AND (
    name ILIKE '%Director%' OR
    name ILIKE '%VP%' OR
    name ILIKE '%Vice President%' OR
    name ILIKE '%Chief%' OR
    name ILIKE '%Head of%' OR
    name ILIKE '%Executive%' OR
    name ILIKE '%President%' OR
    name ILIKE 'Global %Lead' OR
    name ILIKE '%C-Level%'
)
RETURNING id, name, 'Master' as assigned_level
)

-- ============================================================================
-- LEVEL 2: EXPERT (Deep domain specialists)
-- ============================================================================
-- Scientists, Strategists, Principal, Senior Leads, Experts
, expert_updates AS (
UPDATE agents 
SET agent_level_id = (SELECT id FROM level_ids WHERE name = 'Expert')
WHERE agent_level_id IS NULL
AND (
    name ILIKE '%Scientist%' OR
    name ILIKE '%Strategist%' OR
    name ILIKE '%Principal%' OR
    name ILIKE '%Senior Lead%' OR
    name ILIKE '%Expert%' OR
    name ILIKE '%Specialist' AND name ILIKE 'Senior%' OR
    name ILIKE '%Researcher' AND name ILIKE 'Senior%' OR
    name ILIKE '%Architect%' OR
    name ILIKE '%Lead' AND NOT name ILIKE '%Global%' OR
    name ILIKE 'Regional%' AND name ILIKE '%Lead%'
)
RETURNING id, name, 'Expert' as assigned_level
)

-- ============================================================================
-- LEVEL 3: SPECIALIST (Focused specialists)
-- ============================================================================
-- Managers, Coordinators, Specialists, Specific Medical/Clinical roles
, specialist_updates AS (
UPDATE agents 
SET agent_level_id = (SELECT id FROM level_ids WHERE name = 'Specialist')
WHERE agent_level_id IS NULL
AND (
    name ILIKE '%Manager%' OR
    name ILIKE '%Coordinator%' OR
    name ILIKE '%Specialist%' OR
    name ILIKE '%Writer%' OR
    name ILIKE '%Medical%' OR
    name ILIKE '%Clinical%' OR
    name ILIKE '%Regulatory%' OR
    name ILIKE '%Pharmacovigilance%' OR
    name ILIKE '%Quality%' OR
    name ILIKE '%Compliance%' OR
    name ILIKE '%Affairs%' OR
    name ILIKE '%Advisor%' OR
    name ILIKE '%Consultant%' OR
    name ILIKE '%Engineer%' OR
    name ILIKE '%Developer%' OR
    name ILIKE '%Designer%' OR
    name ILIKE '%Planner%'
)
RETURNING id, name, 'Specialist' as assigned_level
)

-- ============================================================================
-- LEVEL 4: WORKER (Task executors)
-- ============================================================================
-- Analysts, Associates, Assistants, Junior roles
, worker_updates AS (
UPDATE agents 
SET agent_level_id = (SELECT id FROM level_ids WHERE name = 'Worker')
WHERE agent_level_id IS NULL
AND (
    name ILIKE '%Analyst%' OR
    name ILIKE '%Associate%' OR
    name ILIKE '%Assistant%' OR
    name ILIKE 'Junior%' OR
    name ILIKE '%Technician%' OR
    name ILIKE '%Officer%' OR
    name ILIKE '%Administrator%'
)
RETURNING id, name, 'Worker' as assigned_level
)

-- ============================================================================
-- LEVEL 5: TOOL (Micro-agents, wrappers)
-- ============================================================================
-- API wrappers, Automation bots, Integration agents
, tool_updates AS (
UPDATE agents 
SET agent_level_id = (SELECT id FROM level_ids WHERE name = 'Tool')
WHERE agent_level_id IS NULL
AND (
    name ILIKE '%API%' OR
    name ILIKE '%Bot%' OR
    name ILIKE '%Automation%' OR
    name ILIKE '%Integration%' OR
    name ILIKE '%Wrapper%' OR
    name ILIKE '%Tool%'
)
RETURNING id, name, 'Tool' as assigned_level
)

-- ============================================================================
-- DEFAULT: SPECIALIST (for any remaining agents)
-- ============================================================================
, default_updates AS (
UPDATE agents 
SET agent_level_id = (SELECT id FROM level_ids WHERE name = 'Specialist')
WHERE agent_level_id IS NULL
RETURNING id, name, 'Specialist (default)' as assigned_level
)

-- ============================================================================
-- VERIFICATION & REPORTING
-- ============================================================================
, update_summary AS (
    SELECT 'Master' as level, COUNT(*) as count, 1 as sort_order FROM master_updates
    UNION ALL
    SELECT 'Expert' as level, COUNT(*) as count, 2 as sort_order FROM expert_updates
    UNION ALL
    SELECT 'Specialist' as level, COUNT(*) as count, 3 as sort_order FROM specialist_updates
    UNION ALL
    SELECT 'Worker' as level, COUNT(*) as count, 4 as sort_order FROM worker_updates
    UNION ALL
    SELECT 'Tool' as level, COUNT(*) as count, 5 as sort_order FROM tool_updates
    UNION ALL
    SELECT 'Default (Specialist)' as level, COUNT(*) as count, 6 as sort_order FROM default_updates
)
SELECT level, count
FROM update_summary
ORDER BY sort_order;

COMMIT;

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

-- Count by level
SELECT 
    al.name as level,
    al.level_number,
    COUNT(a.id) as agent_count,
    ROUND(COUNT(a.id) * 100.0 / SUM(COUNT(a.id)) OVER(), 1) as percentage
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
GROUP BY al.id, al.name, al.level_number
ORDER BY al.level_number;

-- Agents still without level (should be 0)
SELECT 
    'Agents without level:' as status,
    COUNT(*) as count
FROM agents 
WHERE agent_level_id IS NULL;

-- Sample agents by level
SELECT 
    al.name as level,
    a.name as agent_name
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
ORDER BY al.level_number, a.name
LIMIT 20;

-- Summary
SELECT 
    '✅ Agent Level Assignment Complete!' as status,
    COUNT(*) as total_agents,
    COUNT(CASE WHEN agent_level_id IS NOT NULL THEN 1 END) as assigned,
    COUNT(CASE WHEN agent_level_id IS NULL THEN 1 END) as unassigned
FROM agents;

