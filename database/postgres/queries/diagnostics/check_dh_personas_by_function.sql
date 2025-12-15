-- Persona coverage by Function
SELECT 
    f.name as function_name,
    COUNT(DISTINCT r.id) as total_roles,
    COUNT(DISTINCT CASE WHEN persona_count = 0 THEN r.id END) as roles_no_personas,
    COUNT(DISTINCT CASE WHEN persona_count > 0 AND persona_count < 4 THEN r.id END) as roles_incomplete,
    COUNT(DISTINCT CASE WHEN persona_count = 4 THEN r.id END) as roles_complete,
    SUM(persona_count) as total_personas,
    CASE 
        WHEN COUNT(DISTINCT CASE WHEN persona_count = 0 THEN r.id END) = COUNT(DISTINCT r.id) THEN '❌ ALL NEED PERSONAS'
        WHEN COUNT(DISTINCT CASE WHEN persona_count = 4 THEN r.id END) = COUNT(DISTINCT r.id) THEN '✅ ALL COMPLETE'
        ELSE '⚠️ PARTIAL (' || COUNT(DISTINCT CASE WHEN persona_count = 4 THEN r.id END) || '/' || COUNT(DISTINCT r.id) || ')'
    END as status
FROM (
    SELECT r.id, r.function_id, COUNT(p.id) as persona_count
    FROM org_roles r
    LEFT JOIN personas p ON p.source_role_id = r.id
    WHERE r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
    GROUP BY r.id, r.function_id
) r
JOIN org_functions f ON r.function_id = f.id
WHERE f.industry = 'Digital Health'
GROUP BY f.name
ORDER BY 
    COUNT(DISTINCT CASE WHEN persona_count = 0 THEN r.id END) DESC,
    f.name;


