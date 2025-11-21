-- =====================================================================
-- IDENTIFY MISSING ROLES
-- Compares roles in JSON file with roles in database
-- =====================================================================

-- This query shows roles that exist in the JSON but not in the database
-- Run this BEFORE running map_roles_from_json_optimized.sql

WITH pharma_tenant AS (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
),
json_roles AS (
    -- These are the unique roles from PHARMA_ROLE_SCOPE_NORMALIZED.json
    SELECT DISTINCT
        'Medical Affairs' as function_name,
        'Field Medical' as department_name,
        'Medical Science Liaison' as role_name
    UNION ALL SELECT 'Medical Affairs', 'Field Medical', 'Senior Medical Science Liaison'
    UNION ALL SELECT 'Medical Affairs', 'Field Medical', 'Regional Field Medical Director'
    UNION ALL SELECT 'Medical Affairs', 'Field Medical', 'Field Team Lead'
    UNION ALL SELECT 'Medical Affairs', 'Field Medical', 'Medical Scientific Manager'
    UNION ALL SELECT 'Medical Affairs', 'Medical Information Services', 'Medical Information Specialist'
    UNION ALL SELECT 'Medical Affairs', 'Medical Information Services', 'Medical Information Manager'
    UNION ALL SELECT 'Medical Affairs', 'Medical Information Services', 'MI Operations Lead'
    UNION ALL SELECT 'Medical Affairs', 'Medical Information Services', 'Medical Info Associate'
    UNION ALL SELECT 'Medical Affairs', 'Medical Information Services', 'Medical Info Scientist'
    UNION ALL SELECT 'Medical Affairs', 'Scientific Communications', 'Scientific Communications Manager'
    UNION ALL SELECT 'Medical Affairs', 'Scientific Communications', 'Medical Writer'
    UNION ALL SELECT 'Medical Affairs', 'Scientific Communications', 'Publications Lead'
    UNION ALL SELECT 'Medical Affairs', 'Scientific Communications', 'Scientific Affairs Lead'
    UNION ALL SELECT 'Medical Affairs', 'Scientific Communications', 'Medical Communications Specialist'
    UNION ALL SELECT 'Medical Affairs', 'Medical Education', 'Medical Education Manager'
    UNION ALL SELECT 'Medical Affairs', 'Medical Education', 'Medical Education Strategist'
    UNION ALL SELECT 'Medical Affairs', 'Medical Education', 'Digital Medical Education Lead'
    UNION ALL SELECT 'Medical Affairs', 'Medical Education', 'Scientific Trainer'
    UNION ALL SELECT 'Medical Affairs', 'HEOR & Evidence (Health Economics & Outcomes Research)', 'HEOR Director'
    UNION ALL SELECT 'Medical Affairs', 'HEOR & Evidence (Health Economics & Outcomes Research)', 'HEOR Manager'
    UNION ALL SELECT 'Medical Affairs', 'HEOR & Evidence (Health Economics & Outcomes Research)', 'Real-World Evidence Lead'
    UNION ALL SELECT 'Medical Affairs', 'HEOR & Evidence (Health Economics & Outcomes Research)', 'HEOR Project Manager'
    UNION ALL SELECT 'Medical Affairs', 'HEOR & Evidence (Health Economics & Outcomes Research)', 'Economic Modeler'
    UNION ALL SELECT 'Medical Affairs', 'Publications', 'Publications Manager'
    UNION ALL SELECT 'Medical Affairs', 'Publications', 'Publications Lead'
    UNION ALL SELECT 'Medical Affairs', 'Publications', 'Publication Planner'
    UNION ALL SELECT 'Medical Affairs', 'Medical Leadership', 'Chief Medical Officer'
    UNION ALL SELECT 'Medical Affairs', 'Medical Leadership', 'VP Medical Affairs'
    UNION ALL SELECT 'Medical Affairs', 'Medical Leadership', 'Medical Affairs Director'
    UNION ALL SELECT 'Medical Affairs', 'Medical Leadership', 'Senior Medical Director'
    UNION ALL SELECT 'Medical Affairs', 'Clinical Operations Support', 'Clinical Operations Liaison'
    UNION ALL SELECT 'Medical Affairs', 'Clinical Operations Support', 'Clinical Ops Support Analyst'
    UNION ALL SELECT 'Medical Affairs', 'Clinical Operations Support', 'Medical Liaison Clinical Trials'
    UNION ALL SELECT 'Medical Affairs', 'Medical Excellence & Compliance', 'Medical Excellence Lead'
    UNION ALL SELECT 'Medical Affairs', 'Medical Excellence & Compliance', 'Compliance Specialist'
    UNION ALL SELECT 'Medical Affairs', 'Medical Excellence & Compliance', 'Medical Governance Officer'
    -- Add all other roles from JSON here (truncated for brevity)
    -- See map_roles_from_json_optimized.sql for complete list
),
existing_roles AS (
    SELECT 
        LOWER(TRIM(COALESCE(r.role_name, r.name::text, ''))) as role_name_lower,
        f.name::text as function_name,
        d.name as department_name
    FROM public.org_roles r
    CROSS JOIN pharma_tenant pt
    LEFT JOIN public.org_functions f ON r.function_id = f.id
    LEFT JOIN public.org_departments d ON r.department_id = d.id
    WHERE r.tenant_id = pt.id
)
SELECT 
    'MISSING_ROLES' as section,
    jr.function_name,
    jr.department_name,
    jr.role_name,
    'NOT_IN_DB' as status
FROM json_roles jr
WHERE NOT EXISTS (
    SELECT 1 FROM existing_roles er
    WHERE LOWER(TRIM(jr.role_name)) = er.role_name_lower
)
ORDER BY jr.function_name, jr.department_name, jr.role_name;

-- Also show roles in DB that are not in JSON (orphaned roles)
SELECT 
    'ORPHANED_ROLES' as section,
    er.function_name,
    er.department_name,
    COALESCE(r.role_name, r.name::text) as role_name,
    'NOT_IN_JSON' as status
FROM public.org_roles r
CROSS JOIN pharma_tenant pt
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.tenant_id = pt.id
  AND NOT EXISTS (
      SELECT 1 FROM json_roles jr
      WHERE LOWER(TRIM(jr.role_name)) = LOWER(TRIM(COALESCE(r.role_name, r.name::text)))
  )
ORDER BY er.function_name, er.department_name, r.role_name;

-- Summary counts
SELECT 
    'SUMMARY' as section,
    (SELECT COUNT(DISTINCT role_name) FROM json_roles) as roles_in_json,
    (SELECT COUNT(*) FROM public.org_roles r CROSS JOIN pharma_tenant pt WHERE r.tenant_id = pt.id) as roles_in_db,
    (SELECT COUNT(*) FROM json_roles jr WHERE NOT EXISTS (
        SELECT 1 FROM public.org_roles r 
        CROSS JOIN pharma_tenant pt
        WHERE r.tenant_id = pt.id 
          AND LOWER(TRIM(COALESCE(r.role_name, r.name::text))) = LOWER(TRIM(jr.role_name))
    )) as missing_roles_count,
    (SELECT COUNT(*) FROM public.org_roles r 
     CROSS JOIN pharma_tenant pt
     WHERE r.tenant_id = pt.id
       AND NOT EXISTS (
           SELECT 1 FROM json_roles jr
           WHERE LOWER(TRIM(jr.role_name)) = LOWER(TRIM(COALESCE(r.role_name, r.name::text)))
       )) as orphaned_roles_count;

