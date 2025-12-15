-- ============================================================================
-- ASSIGN SKILLS TO AGENTS BASED ON AGENT LEVEL
-- ============================================================================
-- This script assigns skills to all agents based on their hierarchical level:
-- - Level 1 (Master): All skills (leadership + domain expertise)
-- - Level 2 (Expert): Domain expertise + advanced skills
-- - Level 3 (Specialist): Focused domain skills
-- - Level 4 (Worker): Task-specific skills
-- - Level 5 (Tool): Basic automation skills
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Clear existing assignments (optional - comment out if not needed)
-- ============================================================================
-- TRUNCATE agent_skill_assignments;

-- ============================================================================
-- STEP 2: Define skill categories by complexity
-- ============================================================================

-- Helper: Get skill IDs by complexity level and categories
CREATE TEMP TABLE skill_categories AS
SELECT 
    s.id as skill_id,
    s.name as skill_name,
    s.complexity_level,
    s.complexity_score,
    s.category,
    CASE 
        WHEN s.name ILIKE '%leadership%' OR s.name ILIKE '%strategy%' OR s.name ILIKE '%management%' THEN 'leadership'
        WHEN s.name ILIKE '%medical%' OR s.name ILIKE '%clinical%' OR s.name ILIKE '%therapeutic%' THEN 'medical'
        WHEN s.name ILIKE '%research%' OR s.name ILIKE '%scientific%' OR s.name ILIKE '%analysis%' THEN 'research'
        WHEN s.name ILIKE '%regulatory%' OR s.name ILIKE '%compliance%' OR s.name ILIKE '%quality%' THEN 'regulatory'
        WHEN s.name ILIKE '%communication%' OR s.name ILIKE '%presentation%' OR s.name ILIKE '%writing%' THEN 'communication'
        WHEN s.name ILIKE '%data%' OR s.name ILIKE '%analytics%' OR s.name ILIKE '%statistical%' THEN 'data'
        WHEN s.name ILIKE '%technology%' OR s.name ILIKE '%digital%' OR s.name ILIKE '%software%' THEN 'technology'
        WHEN s.name ILIKE '%project%' OR s.name ILIKE '%process%' OR s.name ILIKE '%operations%' THEN 'operations'
        ELSE 'general'
    END as skill_type
FROM skills s;

-- ============================================================================
-- LEVEL 1: MASTER AGENTS (All Skills - Orchestrators)
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🏆 LEVEL 1: MASTER - Assigning comprehensive skill set...'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    sc.skill_id,
    CASE 
        WHEN sc.complexity_level = 'expert' THEN 'expert'
        WHEN sc.complexity_level = 'advanced' THEN 'expert'
        WHEN sc.complexity_level = 'intermediate' THEN 'advanced'
        ELSE 'advanced'
    END as proficiency_level,
    CASE 
        WHEN sc.skill_type IN ('leadership', 'medical', 'research') THEN true
        ELSE false
    END as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN skill_categories sc
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.name = 'Master'
ON CONFLICT (agent_id, skill_id) DO NOTHING;

SELECT 
    '✅ Master agents:' as level,
    COUNT(DISTINCT a.id) as agent_count,
    COUNT(asa.skill_id) as total_assignments,
    ROUND(COUNT(asa.skill_id)::numeric / COUNT(DISTINCT a.id), 1) as avg_skills_per_agent
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_skill_assignments asa ON a.id = asa.agent_id
WHERE al.name = 'Master'
GROUP BY al.name;

-- ============================================================================
-- LEVEL 2: EXPERT AGENTS (Advanced + Domain Expertise)
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🔬 LEVEL 2: EXPERT - Assigning advanced domain skills...'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    sc.skill_id,
    CASE 
        WHEN sc.complexity_level = 'expert' THEN 'expert'
        WHEN sc.complexity_level = 'advanced' THEN 'advanced'
        WHEN sc.complexity_level = 'intermediate' THEN 'advanced'
        ELSE 'intermediate'
    END as proficiency_level,
    CASE 
        -- Mark primary based on agent's department/function focus
        WHEN (a.name ILIKE '%Medical%' OR a.name ILIKE '%Clinical%') AND sc.skill_type = 'medical' THEN true
        WHEN (a.name ILIKE '%Data%' OR a.name ILIKE '%Analytics%') AND sc.skill_type = 'data' THEN true
        WHEN (a.name ILIKE '%Regulatory%') AND sc.skill_type = 'regulatory' THEN true
        WHEN (a.name ILIKE '%Research%' OR a.name ILIKE '%Scientist%') AND sc.skill_type = 'research' THEN true
        ELSE false
    END as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN skill_categories sc
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.name = 'Expert'
-- Include advanced, expert skills + relevant intermediate
AND (
    sc.complexity_level IN ('expert', 'advanced')
    OR (sc.complexity_level = 'intermediate' AND sc.skill_type IN ('medical', 'research', 'data', 'regulatory'))
)
ON CONFLICT (agent_id, skill_id) DO NOTHING;

SELECT 
    '✅ Expert agents:' as level,
    COUNT(DISTINCT a.id) as agent_count,
    COUNT(asa.skill_id) as total_assignments,
    ROUND(COUNT(asa.skill_id)::numeric / COUNT(DISTINCT a.id), 1) as avg_skills_per_agent
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_skill_assignments asa ON a.id = asa.agent_id
WHERE al.name = 'Expert'
GROUP BY al.name;

-- ============================================================================
-- LEVEL 3: SPECIALIST AGENTS (Focused Domain Skills)
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '💼 LEVEL 3: SPECIALIST - Assigning focused domain skills...'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    sc.skill_id,
    CASE 
        WHEN sc.complexity_level = 'expert' THEN 'advanced'
        WHEN sc.complexity_level = 'advanced' THEN 'advanced'
        WHEN sc.complexity_level = 'intermediate' THEN 'intermediate'
        ELSE 'intermediate'
    END as proficiency_level,
    CASE 
        -- Specialist: primary skills match their specific focus
        WHEN a.name ILIKE '%Writer%' AND sc.skill_name ILIKE '%writing%' THEN true
        WHEN a.name ILIKE '%Coordinator%' AND sc.skill_name ILIKE '%coordination%' THEN true
        WHEN a.name ILIKE '%Medical%' AND sc.skill_type = 'medical' THEN true
        WHEN a.name ILIKE '%Clinical%' AND sc.skill_type = 'medical' THEN true
        WHEN a.name ILIKE '%Regulatory%' AND sc.skill_type = 'regulatory' THEN true
        WHEN a.name ILIKE '%Quality%' AND sc.skill_name ILIKE '%quality%' THEN true
        WHEN a.name ILIKE '%Compliance%' AND sc.skill_name ILIKE '%compliance%' THEN true
        WHEN a.name ILIKE '%Data%' AND sc.skill_type = 'data' THEN true
        WHEN a.name ILIKE '%Research%' AND sc.skill_type = 'research' THEN true
        WHEN a.name ILIKE '%Manager%' AND sc.skill_type = 'operations' THEN true
        ELSE false
    END as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN skill_categories sc
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.name = 'Specialist'
-- Include advanced and intermediate skills relevant to their focus
AND (
    (sc.complexity_level IN ('advanced', 'intermediate'))
    OR (sc.complexity_level = 'expert' AND (
        (a.name ILIKE '%' || sc.skill_type || '%')
        OR (sc.skill_type IN ('medical', 'communication', 'operations'))
    ))
)
ON CONFLICT (agent_id, skill_id) DO NOTHING;

SELECT 
    '✅ Specialist agents:' as level,
    COUNT(DISTINCT a.id) as agent_count,
    COUNT(asa.skill_id) as total_assignments,
    ROUND(COUNT(asa.skill_id)::numeric / COUNT(DISTINCT a.id), 1) as avg_skills_per_agent
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_skill_assignments asa ON a.id = asa.agent_id
WHERE al.name = 'Specialist'
GROUP BY al.name;

-- ============================================================================
-- LEVEL 4: WORKER AGENTS (Task-Specific Skills)
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '⚙️  LEVEL 4: WORKER - Assigning task-specific skills...'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    sc.skill_id,
    CASE 
        WHEN sc.complexity_level IN ('expert', 'advanced') THEN 'intermediate'
        WHEN sc.complexity_level = 'intermediate' THEN 'intermediate'
        ELSE 'beginner'
    END as proficiency_level,
    CASE 
        -- Worker: primary skills are task-specific
        WHEN a.name ILIKE '%Analyst%' AND sc.skill_type = 'data' THEN true
        WHEN a.name ILIKE '%Associate%' AND sc.skill_type IN ('operations', 'communication') THEN true
        WHEN a.name ILIKE '%Assistant%' AND sc.skill_type IN ('operations', 'communication') THEN true
        WHEN a.name ILIKE '%Technician%' AND sc.skill_type = 'technology' THEN true
        ELSE false
    END as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN skill_categories sc
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.name = 'Worker'
-- Basic and intermediate skills
AND sc.complexity_level IN ('basic', 'intermediate')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

SELECT 
    '✅ Worker agents:' as level,
    COUNT(DISTINCT a.id) as agent_count,
    COUNT(asa.skill_id) as total_assignments,
    ROUND(COUNT(asa.skill_id)::numeric / COUNT(DISTINCT a.id), 1) as avg_skills_per_agent
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_skill_assignments asa ON a.id = asa.agent_id
WHERE al.name = 'Worker'
GROUP BY al.name;

-- ============================================================================
-- LEVEL 5: TOOL AGENTS (Basic Automation Skills)
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🔧 LEVEL 5: TOOL - Assigning basic automation skills...'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

INSERT INTO agent_skill_assignments (agent_id, skill_id, proficiency_level, is_primary, created_at, updated_at)
SELECT 
    a.id as agent_id,
    sc.skill_id,
    'beginner' as proficiency_level,
    CASE 
        WHEN sc.skill_type = 'technology' THEN true
        ELSE false
    END as is_primary,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
CROSS JOIN skill_categories sc
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.name = 'Tool'
-- Only basic skills for tool agents
AND sc.complexity_level = 'basic'
AND sc.skill_type IN ('technology', 'operations')
ON CONFLICT (agent_id, skill_id) DO NOTHING;

SELECT 
    '✅ Tool agents:' as level,
    COUNT(DISTINCT a.id) as agent_count,
    COUNT(asa.skill_id) as total_assignments,
    ROUND(COUNT(asa.skill_id)::numeric / COUNT(DISTINCT a.id), 1) as avg_skills_per_agent
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_skill_assignments asa ON a.id = asa.agent_id
WHERE al.name = 'Tool'
GROUP BY al.name;

-- Cleanup temp table
DROP TABLE skill_categories;

COMMIT;

-- ============================================================================
-- FINAL VERIFICATION & REPORTING
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📊 FINAL SKILL ASSIGNMENT SUMMARY'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- Summary by agent level
SELECT 
    al.name as agent_level,
    al.level_number,
    COUNT(DISTINCT a.id) as agent_count,
    COUNT(DISTINCT asa.skill_id) as unique_skills_used,
    COUNT(asa.agent_id) as total_assignments,
    ROUND(AVG(skill_count.cnt), 1) as avg_skills_per_agent,
    COUNT(CASE WHEN asa.is_primary THEN 1 END) as primary_skills
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_skill_assignments asa ON a.id = asa.agent_id
LEFT JOIN (
    SELECT agent_id, COUNT(*) as cnt
    FROM agent_skill_assignments
    GROUP BY agent_id
) skill_count ON a.id = skill_count.agent_id
GROUP BY al.id, al.name, al.level_number
ORDER BY al.level_number;

-- Proficiency distribution
\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📈 PROFICIENCY LEVEL DISTRIBUTION'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
    proficiency_level,
    COUNT(*) as assignment_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) || '%' as percentage
FROM agent_skill_assignments
GROUP BY proficiency_level
ORDER BY 
    CASE proficiency_level
        WHEN 'expert' THEN 1
        WHEN 'advanced' THEN 2
        WHEN 'intermediate' THEN 3
        WHEN 'beginner' THEN 4
    END;

-- Top skills by assignment count
\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🏅 TOP 20 SKILLS BY AGENT COUNT'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
    s.name as skill_name,
    s.complexity_level,
    COUNT(DISTINCT asa.agent_id) as agent_count,
    COUNT(CASE WHEN asa.is_primary THEN 1 END) as primary_assignments
FROM skills s
JOIN agent_skill_assignments asa ON s.id = asa.skill_id
GROUP BY s.id, s.name, s.complexity_level
ORDER BY COUNT(DISTINCT asa.agent_id) DESC
LIMIT 20;

-- Sample agents with their skills
\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '👥 SAMPLE AGENTS WITH SKILL COUNTS'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
    a.name as agent_name,
    al.name as level,
    COUNT(asa.skill_id) as total_skills,
    COUNT(CASE WHEN asa.is_primary THEN 1 END) as primary_skills,
    COUNT(CASE WHEN asa.proficiency_level = 'expert' THEN 1 END) as expert_skills
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_skill_assignments asa ON a.id = asa.agent_id
GROUP BY a.id, a.name, al.name, al.level_number
ORDER BY al.level_number, a.name
LIMIT 25;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✅ SKILL ASSIGNMENT BY AGENT LEVEL COMPLETE!'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

