-- ============================================================================
-- VERIFY SKILLS SEEDING - Complete Summary
-- ============================================================================

-- 1. Total skills count
SELECT 
    'Total Skills' as metric,
    COUNT(*) as count
FROM skills
WHERE deleted_at IS NULL;

-- 2. Skills by category
SELECT 
    category,
    COUNT(*) as skill_count,
    COUNT(CASE WHEN is_core = true THEN 1 END) as core_skills,
    COUNT(CASE WHEN is_executable = true THEN 1 END) as executable_skills
FROM skills
WHERE deleted_at IS NULL
GROUP BY category
ORDER BY skill_count DESC;

-- 3. Skills by type (Anthropic vs Custom)
SELECT 
    COALESCE(skill_type, 'Not specified') as type,
    COUNT(*) as count
FROM skills
WHERE deleted_at IS NULL
GROUP BY skill_type
ORDER BY count DESC;

-- 4. Skills by complexity
SELECT 
    COALESCE(complexity_level, 'Not specified') as complexity,
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

-- 5. Sample of skills by category (10 per category)
SELECT 
    category,
    STRING_AGG(name, ', ' ORDER BY name) as sample_skills
FROM (
    SELECT 
        category,
        name,
        ROW_NUMBER() OVER (PARTITION BY category ORDER BY name) as rn
    FROM skills
    WHERE deleted_at IS NULL
) sub
WHERE rn <= 5
GROUP BY category
ORDER BY category;

-- 6. Core skills for Medical Affairs
SELECT 
    name,
    category,
    complexity_level
FROM skills
WHERE deleted_at IS NULL
    AND is_core = true
    AND category IN ('Scientific & Clinical', 'Pharma Specialized', 'Leadership & Management')
ORDER BY category, name
LIMIT 20;

