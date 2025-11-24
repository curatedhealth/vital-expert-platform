-- FIXED Query to get Medical Information role IDs for Phase 2 enrichment
-- Run this in Supabase SQL Editor and use results to update phase2_medical_information_enrichment.json

-- First, find the Medical Information department ID
SELECT
    'Department Information:' as info_type,
    d.id as department_id,
    d.name as department_name,
    d.function_id
FROM org_departments d
WHERE d.name ILIKE '%Medical Information%'
   OR d.name = 'Medical Information Services'
   OR d.name = 'Medical Info'
ORDER BY d.name;

-- Then get all Medical Information roles with their IDs
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
WHERE d.name ILIKE '%Medical Information%'
   OR r.name ILIKE '%Medical Information%'
   OR r.name ILIKE '%Medical Info%'
   OR r.name ILIKE '%MI Operations%'
ORDER BY
    r.geographic_scope NULLS LAST,
    r.name;

-- Expected 15 roles matching:
-- Specialists: Global/Regional/Local Medical Information Specialist
-- Managers: Global/Regional/Local Medical Information Manager
-- Operations: Global/Regional/Local MI Operations Lead
-- Associates: Global/Regional/Local Medical Info Associate
-- Scientists: Global/Regional/Local Medical Info Scientist

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
WHERE d.name ILIKE '%Medical Information%'
   OR r.name ILIKE '%Medical Information%'
   OR r.name ILIKE '%Medical Info%'
   OR r.name ILIKE '%MI Operations%'
ORDER BY r.name;
