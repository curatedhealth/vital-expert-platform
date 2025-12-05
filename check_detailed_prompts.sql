-- Check detailed prompts count by suite
SELECT 
    SPLIT_PART(prompt_code, '-', 1) as suite,
    COUNT(*) as prompt_count,
    COUNT(CASE WHEN user_template IS NOT NULL AND user_template != '' THEN 1 END) as with_user_template
FROM prompts 
WHERE prompt_code LIKE 'RULES-%' 
   OR prompt_code LIKE 'TRIALS-%'
   OR prompt_code LIKE 'GUARD-%'
   OR prompt_code LIKE 'VALUE-%'
   OR prompt_code LIKE 'BRIDGE-%'
   OR prompt_code LIKE 'CRAFT-%'
   OR prompt_code LIKE 'FORGE-%'
GROUP BY SPLIT_PART(prompt_code, '-', 1)
ORDER BY suite;
