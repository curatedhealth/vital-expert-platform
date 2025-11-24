-- =====================================================
-- ANALYZE ALL AGENTS - Medical Affairs vs Other Agents
-- =====================================================

-- 1. Total agent count breakdown
SELECT 
    'All Agents' as category,
    COUNT(*) as count
FROM agents
WHERE deleted_at IS NULL

UNION ALL

SELECT 
    'Medical Affairs Agents (with doc_path)' as category,
    COUNT(*) as count
FROM agents
WHERE deleted_at IS NULL 
AND documentation_path IS NOT NULL

UNION ALL

SELECT 
    'Other Agents (no doc_path)' as category,
    COUNT(*) as count
FROM agents
WHERE deleted_at IS NULL 
AND documentation_path IS NULL;

-- 2. Agent level breakdown
SELECT 
    COALESCE(al.name, 'No Level') as agent_level,
    COUNT(*) as total_agents,
    COUNT(CASE WHEN a.documentation_path IS NOT NULL THEN 1 END) as with_doc_path,
    COUNT(CASE WHEN a.documentation_path IS NULL THEN 1 END) as without_doc_path
FROM agents a
LEFT JOIN agent_levels al ON a.agent_level_id = al.id
WHERE a.deleted_at IS NULL
GROUP BY al.name, al.level_number
ORDER BY al.level_number NULLS LAST;

-- 3. Sample of agents WITHOUT documentation_path (existing agents)
SELECT 
    a.name,
    a.slug,
    LEFT(a.system_prompt, 80) as prompt_preview,
    a.created_at
FROM agents a
WHERE a.deleted_at IS NULL
AND a.documentation_path IS NULL
ORDER BY a.created_at DESC
LIMIT 20;

-- 4. Sample of agents WITH documentation_path (our new Medical Affairs agents)
SELECT 
    a.name,
    a.documentation_path,
    LEFT(a.system_prompt, 80) as prompt_preview,
    a.created_at
FROM agents a
WHERE a.deleted_at IS NULL
AND a.documentation_path IS NOT NULL
ORDER BY a.created_at DESC
LIMIT 20;

-- 5. Count by tenant
SELECT 
    t.name as tenant_name,
    COUNT(a.id) as agent_count,
    COUNT(CASE WHEN a.documentation_path IS NOT NULL THEN 1 END) as with_docs
FROM agents a
LEFT JOIN tenants t ON a.tenant_id = t.id
WHERE a.deleted_at IS NULL
GROUP BY t.name
ORDER BY agent_count DESC;

