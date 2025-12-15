-- =====================================================
-- CHECK EXISTING SKILLS IN DATABASE
-- =====================================================
-- Purpose: Audit current skills table to understand what's already seeded
-- Run this before creating new skill mappings

-- 1. Total skills count
SELECT 
    'Total Skills' as metric,
    COUNT(*) as count
FROM skills
WHERE deleted_at IS NULL;

-- 2. Skills by category
SELECT 
    COALESCE(category, 'Uncategorized') as category,
    COUNT(*) as skill_count,
    STRING_AGG(name, ', ' ORDER BY name) as skill_names
FROM skills
WHERE deleted_at IS NULL
GROUP BY category
ORDER BY skill_count DESC;

-- 3. Skills by complexity
SELECT 
    COALESCE(complexity_level, 'Unknown') as complexity,
    COUNT(*) as count
FROM skills
WHERE deleted_at IS NULL
GROUP BY complexity_level
ORDER BY 
    CASE complexity_level
        WHEN 'basic' THEN 1
        WHEN 'intermediate' THEN 2
        WHEN 'advanced' THEN 3
        WHEN 'expert' THEN 4
        ELSE 5
    END;

-- 4. Executable skills
SELECT 
    'Executable Skills' as metric,
    COUNT(*) as count
FROM skills
WHERE deleted_at IS NULL AND is_executable = true;

-- 5. Skills already mapped to agents
SELECT 
    s.name as skill_name,
    s.category,
    COUNT(DISTINCT as2.agent_id) as mapped_to_agents_count
FROM skills s
LEFT JOIN agent_skills as2 ON s.id = as2.skill_id
WHERE s.deleted_at IS NULL
GROUP BY s.id, s.name, s.category
HAVING COUNT(DISTINCT as2.agent_id) > 0
ORDER BY mapped_to_agents_count DESC
LIMIT 20;

-- 6. Top 20 skills by name (alphabetical sample)
SELECT 
    id,
    name,
    slug,
    category,
    complexity_level,
    is_executable,
    is_core,
    skill_type
FROM skills
WHERE deleted_at IS NULL
ORDER BY name
LIMIT 20;

