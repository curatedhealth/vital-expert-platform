-- =====================================================
-- Get ALL Medical Affairs Roles with Complete Mapping
-- =====================================================
-- Returns all roles for Medical Affairs with department and function info
-- =====================================================

SELECT 
    r.id as role_id,
    r.name as role_name,
    r.slug as role_slug,
    r.seniority_level,
    r.geographic_scope,
    d.id as department_id,
    d.name as department_name,
    d.slug as department_slug,
    f.id as function_id,
    f.name as function_name,
    f.slug as function_slug
FROM org_roles r
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN org_functions f ON r.function_id = f.id
WHERE r.deleted_at IS NULL
  AND (f.name ILIKE '%medical affairs%' OR d.id IN (
    'a8018f58-6a8a-4a09-92b2-b1667b1148c5', -- Clinical Operations Support
    'ca5503b6-7821-4f65-8162-2b75952d5363', -- Field Medical
    '04723b72-04b3-40fe-aa1f-2e834b719b03', -- HEOR & Evidence
    '9e1759d6-1f66-484e-b174-1ff68150697d', -- Medical Education
    'bffee306-7ed9-4ea9-aa1d-9d3d01c46741', -- Medical Excellence & Compliance
    '2b320eab-1758-42d7-adfa-7f49c12cdf40', -- Medical Information Services
    '23ee308e-b415-4471-9605-d50c69d33209', -- Medical Leadership
    '5d5ded20-c30a-48f1-844c-fc9f80fcaacb', -- Publications
    '9871d82a-631a-4cf7-9a00-1ab838a45c3e'  -- Scientific Communications
  ))
ORDER BY 
    d.name NULLS LAST,
    r.seniority_level DESC NULLS LAST,
    r.name;

