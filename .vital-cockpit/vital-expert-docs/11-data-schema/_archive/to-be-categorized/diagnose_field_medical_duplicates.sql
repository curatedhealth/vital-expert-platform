-- =============================================
-- Diagnose Field Medical Role Duplicates
-- Find roles with same slug in Field Medical
-- =============================================

-- 1. Check for slug duplicates in Field Medical roles
SELECT 
    'DUPLICATE SLUGS' as issue_type,
    r.slug,
    COUNT(*) as duplicate_count,
    STRING_AGG(r.id::text, ', ' ORDER BY r.created_at) as role_ids,
    STRING_AGG(r.name, ' | ' ORDER BY r.created_at) as role_names,
    STRING_AGG(COALESCE(r.tenant_id::text, 'NULL'), ' | ' ORDER BY r.created_at) as tenant_ids,
    STRING_AGG(COALESCE(d.name, 'NULL'), ' | ' ORDER BY r.created_at) as department_names
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.id IN (
    '1ba3b439-131f-423e-b8d2-c36957a1838e',
    'b30ed3df-d557-4496-b5d7-9ce29367722a',
    'd3125263-b6db-4c3e-9c1a-c79e383de667',
    '184baf82-1381-4413-bfac-c497540497fd',
    'b413dec8-c070-4ec1-96c8-a5c4cf4fd1e9',
    '1cccebb3-8709-4fb7-be37-6b2355ed653a',
    '2015f823-3718-470c-ad01-4262c272ccc8',
    'e30e741c-1a6d-4221-8a84-fd5796a7a7e0',
    'bb7ca388-4417-47af-856d-8ca6baa57c71',
    '9c7ab121-2da7-4267-897e-899fab7f3b27',
    '8a78b723-2f38-4376-b63d-7ca24a1e3521',
    '0d764bd1-84d9-49fd-8b8a-517a4f659a79',
    '6b9d704f-5cef-4ed9-81aa-ec6bc22c1022',
    '1f61c24c-4754-47e6-b443-9c4039f489a5'
)
AND r.deleted_at IS NULL
GROUP BY r.slug
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. Check all roles with similar slugs across the entire table
SELECT 
    'ALL MATCHING SLUGS' as issue_type,
    r.id,
    r.name,
    r.slug,
    r.tenant_id,
    t.name as tenant_name,
    r.department_id,
    d.name as department_name,
    r.created_at,
    (SELECT COUNT(*) FROM public.personas WHERE role_id = r.id AND deleted_at IS NULL) as persona_count
FROM public.org_roles r
LEFT JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.slug IN (
    'medical-field-trainer',
    'field-team-lead',
    'global-field-medical-lead',
    'medical-head-field-medical',
    'local-field-medical-team-lead',
    'local-medical-science-liaison-msl',
    'medical-science-liaison',
    'medical-scientific-manager',
    'medical-msl-manager',
    'regional-field-medical-director',
    'regional-medical-science-liaison',
    'medical-senior-medical-science-liaison',
    'senior-medical-science-liaison',
    'medical-ta-msl-lead'
)
AND r.deleted_at IS NULL
ORDER BY r.slug, r.created_at;

-- 3. Check for roles with same name but different slugs
SELECT 
    'SAME NAME DIFFERENT SLUG' as issue_type,
    r.name,
    COUNT(DISTINCT r.slug) as different_slugs,
    STRING_AGG(DISTINCT r.slug, ' | ' ORDER BY r.slug) as slugs,
    STRING_AGG(r.id::text, ', ' ORDER BY r.created_at) as role_ids
FROM public.org_roles r
WHERE r.name IN (
    'Field Medical Trainer',
    'Field Team Lead',
    'Global Field Medical Lead',
    'Head of Field Medical',
    'Local Field Medical Team Lead',
    'Local Medical Science Liaison (MSL)',
    'Medical Science Liaison',
    'Medical Scientific Manager',
    'MSL Manager',
    'Regional Field Medical Director',
    'Regional Medical Science Liaison',
    'Senior Medical Science Liaison',
    'TA MSL Lead'
)
AND r.deleted_at IS NULL
GROUP BY r.name
HAVING COUNT(DISTINCT r.slug) > 1
ORDER BY r.name;

-- 4. Specific check for the error-causing role
SELECT 
    'ERROR CAUSING ROLE' as issue_type,
    r.id,
    r.name,
    r.slug,
    r.tenant_id,
    t.name as tenant_name,
    r.department_id,
    d.name as department_name,
    r.function_id,
    f.name::text as function_name,
    r.created_at,
    (SELECT COUNT(*) FROM public.personas WHERE role_id = r.id AND deleted_at IS NULL) as persona_count
FROM public.org_roles r
LEFT JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
WHERE r.slug = 'medical-field-trainer'
  AND r.deleted_at IS NULL
ORDER BY r.created_at;

