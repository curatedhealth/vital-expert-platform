-- Digital Health Personas Summary
-- Check persona coverage for all 200 DH roles

-- Overall Summary
SELECT 
    'Digital Health Persona Coverage' as report,
    COUNT(DISTINCT r.id) as total_roles,
    COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN r.id END) as roles_with_personas,
    COUNT(DISTINCT r.id) - COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN r.id END) as roles_without_personas,
    COUNT(p.id) as total_personas,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN r.id END) / COUNT(DISTINCT r.id), 1) as percent_roles_covered
FROM org_roles r
JOIN org_functions f ON r.function_id = f.id
LEFT JOIN personas p ON p.source_role_id = r.id
WHERE f.industry = 'Digital Health'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';


