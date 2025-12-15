-- =====================================================
-- VERIFY DOCUMENTATION PATHS BEFORE UPDATING PROMPTS
-- =====================================================
-- Check if agents have documentation_path populated

SELECT 
    'Total Agents' as metric,
    COUNT(*) as count
FROM agents
WHERE deleted_at IS NULL;

SELECT 
    'Agents with documentation_path' as metric,
    COUNT(*) as count
FROM agents
WHERE deleted_at IS NULL 
AND documentation_path IS NOT NULL;

SELECT 
    'Agents with documentation_url' as metric,
    COUNT(*) as count
FROM agents
WHERE deleted_at IS NULL 
AND documentation_url IS NOT NULL;

SELECT 
    'Agents with system_prompt' as metric,
    COUNT(*) as count
FROM agents
WHERE deleted_at IS NULL 
AND system_prompt IS NOT NULL;

-- Show sample agents to verify structure
SELECT 
    a.name,
    a.documentation_path,
    LEFT(a.documentation_url, 80) as doc_url_preview,
    LEFT(a.system_prompt, 100) as prompt_preview,
    CASE 
        WHEN a.system_prompt LIKE '%My complete capabilities and delegation chains are documented%' 
        THEN '✓ Has doc reference' 
        ELSE '✗ Missing doc reference' 
    END as status
FROM agents a
ORDER BY a.name
LIMIT 10;

