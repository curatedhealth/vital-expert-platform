-- =====================================================
-- Supabase Avatar & Icons Inspection Script
-- =====================================================
-- This script helps diagnose avatar assignment issues
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Check Icons Table Structure
-- =====================================================
SELECT 
    'Icons Table Structure' as section;

-- Show icon table columns and sample data
SELECT 
    COUNT(*) as total_icons,
    COUNT(DISTINCT category) as categories_count,
    COUNT(CASE WHEN category = 'avatar' THEN 1 END) as avatar_icons_count,
    COUNT(CASE WHEN category = 'avatar' AND is_active = true THEN 1 END) as active_avatar_icons
FROM icons;

-- 2. Sample Avatar Icons (First 20)
-- =====================================================
SELECT 
    'Sample Avatar Icons (First 20)' as section;

SELECT 
    id,
    name,
    display_name,
    category,
    file_path,
    file_url,
    is_active,
    created_at
FROM icons
WHERE category = 'avatar'
ORDER BY name
LIMIT 20;

-- 3. Check Avatar Icon File Paths
-- =====================================================
SELECT 
    'Avatar Icon File Paths Analysis' as section;

SELECT 
    CASE 
        WHEN file_path IS NULL THEN 'NULL file_path'
        WHEN file_path = '' THEN 'EMPTY file_path'
        WHEN file_path LIKE '/icons/png/avatars/%' THEN 'Standard path (/icons/png/avatars/)'
        WHEN file_path LIKE '/icons/png/%' THEN 'Other png path'
        WHEN file_path LIKE 'http%' THEN 'Full URL'
        ELSE 'Other format'
    END as path_type,
    COUNT(*) as count,
    STRING_AGG(DISTINCT SUBSTRING(file_path, 1, 50), ', ') as sample_paths
FROM icons
WHERE category = 'avatar' AND is_active = true
GROUP BY path_type
ORDER BY count DESC;

-- 4. Check Agents with Avatars
-- =====================================================
SELECT 
    'Agents with Avatar Assignments' as section;

SELECT 
    COUNT(*) as total_agents,
    COUNT(CASE WHEN metadata->>'avatar' IS NOT NULL THEN 1 END) as agents_with_avatar,
    COUNT(CASE WHEN metadata->>'avatar' IS NULL THEN 1 END) as agents_without_avatar
FROM agents;

-- 5. Sample Agents with Avatar Metadata
-- =====================================================
SELECT 
    'Sample Agents with Avatar Assignments (First 20)' as section;

SELECT 
    id,
    name,
    metadata->>'avatar' as avatar_name,
    metadata->>'display_name' as display_name
FROM agents
WHERE metadata->>'avatar' IS NOT NULL
ORDER BY name
LIMIT 20;

-- 6. Avatar Usage Distribution
-- =====================================================
SELECT 
    'Avatar Usage Distribution' as section;

SELECT 
    metadata->>'avatar' as avatar_name,
    COUNT(*) as usage_count
FROM agents
WHERE metadata->>'avatar' IS NOT NULL
GROUP BY metadata->>'avatar'
ORDER BY usage_count DESC, avatar_name
LIMIT 30;

-- 7. Check for Mismatches (Avatars assigned but not in icons table)
-- =====================================================
SELECT 
    'Mismatches: Avatars assigned but not in icons table' as section;

SELECT DISTINCT
    a.metadata->>'avatar' as assigned_avatar_name,
    COUNT(*) as agents_using_it
FROM agents a
WHERE a.metadata->>'avatar' IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM icons i 
    WHERE i.name = a.metadata->>'avatar' 
      AND i.category = 'avatar'
      AND i.is_active = true
  )
GROUP BY a.metadata->>'avatar'
ORDER BY agents_using_it DESC
LIMIT 20;

-- 8. Check Icon Names vs Agent Avatar Assignments
-- =====================================================
SELECT 
    'Icon Names vs Agent Assignments Comparison' as section;

-- Icons that exist but are not assigned to any agent
SELECT 
    'Icons not assigned to any agent' as type,
    i.name as icon_name,
    i.file_path,
    COUNT(a.id) as assigned_to_agents
FROM icons i
LEFT JOIN agents a ON a.metadata->>'avatar' = i.name
WHERE i.category = 'avatar' 
  AND i.is_active = true
GROUP BY i.name, i.file_path
HAVING COUNT(a.id) = 0
ORDER BY i.name
LIMIT 20;

-- 9. Detailed Sample: One Avatar Icon with All Agents Using It
-- =====================================================
SELECT 
    'Detailed Sample: Avatar Icon Usage' as section;

-- Pick an avatar that's actually being used
WITH avatar_usage AS (
    SELECT 
        metadata->>'avatar' as avatar_name,
        COUNT(*) as usage_count
    FROM agents
    WHERE metadata->>'avatar' IS NOT NULL
    GROUP BY metadata->>'avatar'
    ORDER BY usage_count DESC
    LIMIT 1
),
sample_agents AS (
    SELECT 
        a.metadata->>'avatar' as avatar_name,
        ARRAY_AGG(a.name ORDER BY a.name LIMIT 5) as agent_names
    FROM agents a
    WHERE a.metadata->>'avatar' IS NOT NULL
    GROUP BY a.metadata->>'avatar'
)
SELECT 
    au.avatar_name,
    au.usage_count,
    i.file_path,
    i.file_url,
    i.display_name,
    ARRAY_TO_STRING(sa.agent_names, ', ') as sample_agents_using_it
FROM avatar_usage au
LEFT JOIN icons i ON i.name = au.avatar_name AND i.category = 'avatar'
LEFT JOIN sample_agents sa ON sa.avatar_name = au.avatar_name
GROUP BY au.avatar_name, au.usage_count, i.file_path, i.file_url, i.display_name, sa.agent_names;

-- 10. Summary Statistics
-- =====================================================
SELECT 
    'Summary Statistics' as section;

SELECT 
    'Total Icons' as metric,
    COUNT(*)::text as value
FROM icons
WHERE category = 'avatar' AND is_active = true
UNION ALL
SELECT 
    'Total Agents',
    COUNT(*)::text
FROM agents
UNION ALL
SELECT 
    'Agents with Avatar',
    COUNT(*)::text
FROM agents
WHERE metadata->>'avatar' IS NOT NULL
UNION ALL
SELECT 
    'Unique Avatar Names Assigned',
    COUNT(DISTINCT metadata->>'avatar')::text
FROM agents
WHERE metadata->>'avatar' IS NOT NULL
UNION ALL
SELECT 
    'Icons with file_path',
    COUNT(*)::text
FROM icons
WHERE category = 'avatar' 
  AND is_active = true
  AND file_path IS NOT NULL
  AND file_path != ''
UNION ALL
SELECT 
    'Icons with file_url',
    COUNT(*)::text
FROM icons
WHERE category = 'avatar' 
  AND is_active = true
  AND file_url IS NOT NULL
  AND file_url != '';

-- 11. Check for Common Issues
-- =====================================================
SELECT 
    'Common Issues Check' as section;

SELECT 
    CASE 
        WHEN i.file_path IS NULL OR i.file_path = '' THEN '⚠️ Missing file_path'
        WHEN i.file_path NOT LIKE '/%' AND i.file_path NOT LIKE 'http%' THEN '⚠️ Relative path (should be absolute)'
        WHEN a.metadata->>'avatar' IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM icons i2 
            WHERE i2.name = a.metadata->>'avatar' 
              AND i2.category = 'avatar'
        ) THEN '⚠️ Avatar assigned but icon not found'
        ELSE '✅ OK'
    END as issue_status,
    COUNT(*) as count
FROM agents a
LEFT JOIN icons i ON i.name = a.metadata->>'avatar' AND i.category = 'avatar'
WHERE a.metadata->>'avatar' IS NOT NULL
GROUP BY issue_status;

