-- FIXED Query to get Scientific Communications role IDs for Phase 3 enrichment
-- Run this in Supabase SQL Editor and use results to update phase3_scientific_communications_enrichment.json

-- First, find the Scientific Communications department ID
SELECT
    'Department Information:' as info_type,
    d.id as department_id,
    d.name as department_name,
    d.function_id
FROM org_departments d
WHERE d.name ILIKE '%Scientific Communications%'
   OR d.name ILIKE '%Publications%'
   OR d.name = 'Scientific Affairs'
   OR d.name ILIKE '%Medical Communications%'
ORDER BY d.name;

-- Then get all Scientific Communications roles with their IDs
SELECT
    r.id as role_id,
    r.name as role_name,
    r.geographic_scope,
    r.seniority_level,
    r.role_category,
    r.department_id,
    d.name as department_name
FROM org_roles r
LEFT JOIN org_departments d ON r.department_id = d.id
WHERE d.name ILIKE '%Scientific Communications%'
   OR d.name ILIKE '%Publications%'
   OR d.name ILIKE '%Medical Communications%'
   OR r.name ILIKE '%Scientific Communications%'
   OR r.name ILIKE '%Medical Writer%'
   OR r.name ILIKE '%Publications Lead%'
   OR r.name ILIKE '%Scientific Affairs Lead%'
   OR r.name ILIKE '%Medical Communications Specialist%'
ORDER BY
    r.geographic_scope NULLS LAST,
    r.name;

-- Expected 15 roles matching:
-- Communications Managers: Global/Regional/Local Scientific Communications Manager
-- Medical Writers: Global/Regional/Local Medical Writer
-- Publications Leads: Global/Regional/Local Publications Lead
-- Scientific Affairs: Global/Regional/Local Scientific Affairs Lead
-- Med Comm Specialists: Global/Regional/Local Medical Communications Specialist

-- Export format for easy JSON update:
SELECT
    json_build_object(
        'role_id', r.id,
        'role_name', r.name,
        'geographic_scope', r.geographic_scope,
        'seniority_level', r.seniority_level,
        'department_id', r.department_id
    ) as json_mapping
FROM org_roles r
LEFT JOIN org_departments d ON r.department_id = d.id
WHERE d.name ILIKE '%Scientific Communications%'
   OR d.name ILIKE '%Publications%'
   OR d.name ILIKE '%Medical Communications%'
   OR r.name ILIKE '%Scientific Communications%'
   OR r.name ILIKE '%Medical Writer%'
   OR r.name ILIKE '%Publications Lead%'
   OR r.name ILIKE '%Scientific Affairs Lead%'
   OR r.name ILIKE '%Medical Communications Specialist%'
ORDER BY r.name;
