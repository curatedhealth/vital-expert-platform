-- =====================================================
-- Quick Supabase Avatar Check (Run this first)
-- =====================================================

-- 1. Quick Overview
SELECT 
    'OVERVIEW' as check_type,
    (SELECT COUNT(*) FROM icons WHERE category = 'avatar' AND is_active = true) as active_avatar_icons,
    (SELECT COUNT(*) FROM agents WHERE metadata->>'avatar' IS NOT NULL) as agents_with_avatar,
    (SELECT COUNT(DISTINCT metadata->>'avatar') FROM agents WHERE metadata->>'avatar' IS NOT NULL) as unique_avatars_assigned;

-- 2. Sample Avatar Icon Names & Paths
SELECT 
    'SAMPLE_ICONS' as check_type,
    name,
    file_path,
    file_url,
    CASE 
        WHEN file_path IS NULL OR file_path = '' THEN '⚠️ Missing path'
        WHEN file_path LIKE '/icons/png/avatars/%' THEN '✅ Standard path'
        WHEN file_path LIKE '/%' THEN '✅ Absolute path'
        ELSE '⚠️ Other format'
    END as path_status
FROM icons
WHERE category = 'avatar' AND is_active = true
ORDER BY name
LIMIT 10;

-- 3. Sample Agent Avatar Assignments
SELECT 
    'SAMPLE_AGENT_AVATARS' as check_type,
    name as agent_name,
    metadata->>'avatar' as assigned_avatar,
    metadata->>'display_name' as agent_display_name
FROM agents
WHERE metadata->>'avatar' IS NOT NULL
ORDER BY name
LIMIT 10;

-- 4. Avatars Assigned But Not in Icons Table
SELECT 
    'MISMATCHES' as check_type,
    metadata->>'avatar' as missing_avatar_name,
    COUNT(*) as agents_affected
FROM agents
WHERE metadata->>'avatar' IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM icons i 
    WHERE i.name = agents.metadata->>'avatar' 
      AND i.category = 'avatar'
      AND i.is_active = true
  )
GROUP BY metadata->>'avatar'
ORDER BY agents_affected DESC
LIMIT 10;

