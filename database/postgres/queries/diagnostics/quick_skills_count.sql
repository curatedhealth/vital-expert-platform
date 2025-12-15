-- Quick total count
SELECT 
    COUNT(*) as total_skills,
    COUNT(CASE WHEN skill_type = 'built_in' THEN 1 END) as anthropic_skills,
    COUNT(CASE WHEN skill_type = 'custom' THEN 1 END) as custom_skills,
    COUNT(CASE WHEN is_core = true THEN 1 END) as core_skills,
    COUNT(CASE WHEN is_executable = true THEN 1 END) as executable_skills
FROM skills
WHERE deleted_at IS NULL;

