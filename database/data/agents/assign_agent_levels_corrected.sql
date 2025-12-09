-- ============================================================================
-- CORRECTED AGENT LEVEL ASSIGNMENT
-- ============================================================================
-- Based on VITAL 5-Level Hierarchy (REVISED):
--
-- Level 1: MASTER - Department Heads ONLY (one per department)
--          Examples: CMO, Medical Leadership Master, Field Medical Master
--
-- Level 2: EXPERT - Senior/Director Level (10+ years experience)
--          Examples: Directors, VPs, Senior roles, Leads, Scientists, Strategists
--
-- Level 3: SPECIALIST - Mid/Entry Level (5-10 years experience)
--          Examples: Managers, MSLs, Coordinators, Writers, Specialists
--
-- Level 4: WORKER - Task Executors (universal, role-agnostic)
--          Examples: Analysts, Associates, Assistants, Technicians
--
-- Level 5: TOOL - API Wrappers & Micro-agents (atomic operations)
--          Examples: Bots, APIs, Automation tools, Calculators
-- ============================================================================

BEGIN;

-- First, clear all existing level assignments to start fresh
UPDATE agents SET agent_level_id = NULL WHERE agent_level_id IS NOT NULL;

-- Get level IDs for reference
WITH level_ids AS (
    SELECT 
        id,
        name,
        level_number
    FROM agent_levels
)

-- ============================================================================
-- LEVEL 1: MASTER (Department Heads ONLY)
-- ============================================================================
-- CRITICAL: Only ONE Master per department - these are the department heads
-- NOT Directors, VPs, or other senior roles (those are Level 2)
, master_updates AS (
UPDATE agents 
SET agent_level_id = (SELECT id FROM level_ids WHERE name = 'Master')
WHERE agent_level_id IS NULL
AND (
    -- Explicit Master agents (department heads)
    name ILIKE '%Master%' OR
    slug ILIKE '%-master' OR
    slug ILIKE '%-master-%' OR
    
    -- Chief Medical Officer (C-Suite department head)
    name ILIKE '%Chief Medical Officer%' OR
    name ILIKE '%CMO%' OR
    
    -- Department head patterns
    name ILIKE '%Head of Department%' OR
    name ILIKE '%Department Head%' OR
    
    -- Orchestration master agents
    (name ILIKE '%Orchestrat%' AND name ILIKE '%Master%')
)
RETURNING id, name, 'Master' as assigned_level
)

-- ============================================================================
-- LEVEL 2: EXPERT (Senior/Director Level)
-- ============================================================================
-- Directors, VPs, Senior roles, Leads, Scientists, Strategists
-- These are the senior professionals with 10+ years experience
, expert_updates AS (
UPDATE agents 
SET agent_level_id = (SELECT id FROM level_ids WHERE name = 'Expert')
WHERE agent_level_id IS NULL
AND (
    -- Directors (NOT department heads, but senior leaders)
    name ILIKE '%Director%' OR
    
    -- Vice Presidents (senior leadership)
    name ILIKE '%VP%' OR
    name ILIKE '%Vice President%' OR
    
    -- Executive roles (but not C-suite/department heads)
    (name ILIKE '%Executive%' AND NOT name ILIKE '%Chief%') OR
    
    -- Senior roles
    name ILIKE '%Senior %' OR
    name ILIKE '% Senior%' OR
    
    -- Lead roles (senior leads)
    name ILIKE '%Lead%' OR
    
    -- Scientists (deep expertise)
    name ILIKE '%Scientist%' OR
    
    -- Strategists (strategic expertise)
    name ILIKE '%Strategist%' OR
    
    -- Principal roles
    name ILIKE '%Principal%' OR
    
    -- Architects (system/solution architects)
    name ILIKE '%Architect%' OR
    
    -- Expert suffix
    name ILIKE '%Expert%' OR
    slug ILIKE '%-expert' OR
    slug ILIKE '%-expert-%' OR
    
    -- Global/Regional senior roles
    (name ILIKE 'Global%' AND (
        name ILIKE '%Director%' OR 
        name ILIKE '%Lead%' OR 
        name ILIKE '%Scientist%'
    )) OR
    (name ILIKE 'Regional%' AND (
        name ILIKE '%Director%' OR 
        name ILIKE '%Lead%' OR 
        name ILIKE '%Scientist%'
    ))
)
RETURNING id, name, 'Expert' as assigned_level
)

-- ============================================================================
-- LEVEL 3: SPECIALIST (Mid/Entry Level)
-- ============================================================================
-- Managers, MSLs, Coordinators, Writers, Specialists
-- These are mid-level professionals with 5-10 years experience
, specialist_updates AS (
UPDATE agents 
SET agent_level_id = (SELECT id FROM level_ids WHERE name = 'Specialist')
WHERE agent_level_id IS NULL
AND (
    -- Managers (mid-level, not senior)
    name ILIKE '%Manager%' OR
    
    -- Medical Science Liaisons (MSLs)
    name ILIKE '%MSL%' OR
    name ILIKE '%Medical Science Liaison%' OR
    
    -- Coordinators
    name ILIKE '%Coordinator%' OR
    
    -- Specialists (generic)
    name ILIKE '%Specialist%' OR
    slug ILIKE '%-specialist' OR
    slug ILIKE '%-specialist-%' OR
    
    -- Writers (medical writers, etc.)
    name ILIKE '%Writer%' OR
    
    -- Planners
    name ILIKE '%Planner%' OR
    
    -- Engineers (mid-level technical)
    name ILIKE '%Engineer%' OR
    
    -- Developers
    name ILIKE '%Developer%' OR
    
    -- Designers
    name ILIKE '%Designer%' OR
    
    -- Advisors (non-senior)
    name ILIKE '%Advisor%' OR
    
    -- Consultants
    name ILIKE '%Consultant%' OR
    
    -- Medical/Clinical/Regulatory roles (mid-level)
    name ILIKE '%Medical%' OR
    name ILIKE '%Clinical%' OR
    name ILIKE '%Regulatory%' OR
    name ILIKE '%Pharmacovigilance%' OR
    name ILIKE '%Quality%' OR
    name ILIKE '%Compliance%' OR
    name ILIKE '%Affairs%' OR
    
    -- Trainers
    name ILIKE '%Trainer%' OR
    
    -- Modelers
    name ILIKE '%Modeler%'
)
RETURNING id, name, 'Specialist' as assigned_level
)

-- ============================================================================
-- LEVEL 4: WORKER (Task Executors)
-- ============================================================================
-- Analysts, Associates, Assistants, Technicians
-- Universal task executors serving all departments
, worker_updates AS (
UPDATE agents 
SET agent_level_id = (SELECT id FROM level_ids WHERE name = 'Worker')
WHERE agent_level_id IS NULL
AND (
    -- Analysts (data/research)
    name ILIKE '%Analyst%' OR
    
    -- Associates (junior roles)
    name ILIKE '%Associate%' OR
    
    -- Assistants
    name ILIKE '%Assistant%' OR
    
    -- Junior roles
    name ILIKE 'Junior%' OR
    name ILIKE '%Junior%' OR
    
    -- Technicians
    name ILIKE '%Technician%' OR
    
    -- Officers (operational)
    name ILIKE '%Officer%' OR
    
    -- Administrators
    name ILIKE '%Administrator%' OR
    
    -- Worker suffix
    name ILIKE '%Worker%' OR
    slug ILIKE '%-worker' OR
    slug ILIKE '%-worker-%' OR
    
    -- Processors
    name ILIKE '%Processor%' OR
    
    -- Validators
    name ILIKE '%Validator%' OR
    
    -- Reviewers (operational)
    name ILIKE '%Reviewer%' OR
    
    -- Compilers
    name ILIKE '%Compiler%' OR
    
    -- Trackers
    name ILIKE '%Tracker%' OR
    
    -- Formatters
    name ILIKE '%Formatter%' OR
    
    -- Generators
    name ILIKE '%Generator%' OR
    
    -- Archivers
    name ILIKE '%Archiver%' OR
    
    -- Monitors
    name ILIKE '%Monitor%' OR
    
    -- Detectors
    name ILIKE '%Detector%' OR
    
    -- Drafters
    name ILIKE '%Drafter%' OR
    
    -- Taggers
    name ILIKE '%Tagger%' OR
    
    -- Controllers
    name ILIKE '%Controller%' OR
    
    -- Builders
    name ILIKE '%Builder%'
)
RETURNING id, name, 'Worker' as assigned_level
)

-- ============================================================================
-- LEVEL 5: TOOL (API Wrappers & Micro-agents)
-- ============================================================================
-- Bots, APIs, Automation tools, Calculators
-- Atomic operations serving all agents
, tool_updates AS (
UPDATE agents 
SET agent_level_id = (SELECT id FROM level_ids WHERE name = 'Tool')
WHERE agent_level_id IS NULL
AND (
    -- API wrappers
    name ILIKE '%API%' OR
    
    -- Bots
    name ILIKE '%Bot%' OR
    
    -- Automation
    name ILIKE '%Automation%' OR
    
    -- Integration
    name ILIKE '%Integration%' OR
    
    -- Wrappers
    name ILIKE '%Wrapper%' OR
    
    -- Tools
    name ILIKE '%Tool%' OR
    slug ILIKE '%-tool' OR
    slug ILIKE '%-tool-%' OR
    
    -- Calculators
    name ILIKE '%Calculator%' OR
    
    -- Searchers
    name ILIKE '%Searcher%' OR
    
    -- Retrievers
    name ILIKE '%Retriever%' OR
    
    -- Extractors
    name ILIKE '%Extractor%' OR
    
    -- Converters
    name ILIKE '%Converter%' OR
    
    -- Parsers
    name ILIKE '%Parser%' OR
    
    -- Checkers (simple validation)
    name ILIKE '%Checker%' OR
    
    -- Lookups
    name ILIKE '%Lookup%' OR
    
    -- Plotters
    name ILIKE '%Plotter%' OR
    
    -- Runners
    name ILIKE '%Runner%' OR
    
    -- Scorers
    name ILIKE '%Scorer%' OR
    
    -- Notifiers
    name ILIKE '%Notifier%' OR
    
    -- Schedulers
    name ILIKE '%Scheduler%' OR
    
    -- Senders
    name ILIKE '%Sender%'
)
RETURNING id, name, 'Tool' as assigned_level
)

-- ============================================================================
-- DEFAULT: SPECIALIST (for any remaining agents)
-- ============================================================================
-- If an agent doesn't match any pattern, default to Specialist (L3)
-- This is a safe middle-ground for unclassified agents
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
    SELECT 'Master (L1)' as level, COUNT(*) as count, 1 as sort_order FROM master_updates
    UNION ALL
    SELECT 'Expert (L2)' as level, COUNT(*) as count, 2 as sort_order FROM expert_updates
    UNION ALL
    SELECT 'Specialist (L3)' as level, COUNT(*) as count, 3 as sort_order FROM specialist_updates
    UNION ALL
    SELECT 'Worker (L4)' as level, COUNT(*) as count, 4 as sort_order FROM worker_updates
    UNION ALL
    SELECT 'Tool (L5)' as level, COUNT(*) as count, 5 as sort_order FROM tool_updates
    UNION ALL
    SELECT 'Default (L3)' as level, COUNT(*) as count, 6 as sort_order FROM default_updates
)
SELECT level, count
FROM update_summary
ORDER BY sort_order;

COMMIT;

-- ============================================================================
-- FINAL VERIFICATION QUERIES
-- ============================================================================

-- 1. Count by level
SELECT 
    al.name as level,
    al.level_number,
    COUNT(a.id) as agent_count,
    ROUND(COUNT(a.id) * 100.0 / SUM(COUNT(a.id)) OVER(), 1) as percentage
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
GROUP BY al.id, al.name, al.level_number
ORDER BY al.level_number;

-- 2. Verify Masters are only department heads (should be ~9)
SELECT 
    'Level 1 - Masters (Department Heads)' as category,
    a.name,
    a.slug
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 1
ORDER BY a.name;

-- 3. Sample Experts (should include Directors, VPs, Senior roles)
SELECT 
    'Level 2 - Experts (Senior/Director)' as category,
    a.name,
    a.slug
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 2
ORDER BY a.name
LIMIT 20;

-- 4. Sample Specialists (should include Managers, MSLs, Coordinators)
SELECT 
    'Level 3 - Specialists (Mid/Entry)' as category,
    a.name,
    a.slug
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 3
ORDER BY a.name
LIMIT 20;

-- 5. Sample Workers (should include Analysts, Associates)
SELECT 
    'Level 4 - Workers (Task Executors)' as category,
    a.name,
    a.slug
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 4
ORDER BY a.name
LIMIT 20;

-- 6. Sample Tools (should include APIs, Bots, Calculators)
SELECT 
    'Level 5 - Tools (API Wrappers)' as category,
    a.name,
    a.slug
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 5
ORDER BY a.name
LIMIT 20;

-- 7. Agents still without level (should be 0)
SELECT 
    'Agents without level:' as status,
    COUNT(*) as count
FROM agents 
WHERE agent_level_id IS NULL;

-- 8. Summary
SELECT 
    '✅ Agent Level Assignment Complete!' as status,
    COUNT(*) as total_agents,
    COUNT(CASE WHEN agent_level_id IS NOT NULL THEN 1 END) as assigned,
    COUNT(CASE WHEN agent_level_id IS NULL THEN 1 END) as unassigned
FROM agents;

-- ============================================================================
-- EXPECTED DISTRIBUTION (Based on VITAL Architecture)
-- ============================================================================
-- Level 1 (Master): ~9 agents (1 per department)
-- Level 2 (Expert): ~45-50 agents (senior roles)
-- Level 3 (Specialist): ~50-60 agents (mid-level roles)
-- Level 4 (Worker): ~18-20 agents (task executors)
-- Level 5 (Tool): ~50+ agents (API wrappers)
-- ============================================================================





