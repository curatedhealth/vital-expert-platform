-- Create 4 Missing Roles for Phase 2 & 3 Enrichment
-- Run this in Supabase SQL Editor before deploying enrichment data

-- ============================================================================
-- PHASE 2: Medical Information Services (1 role)
-- ============================================================================

-- 1. Global Medical Information Specialist
INSERT INTO org_roles (
    name,
    slug,
    description,
    role_category,
    function_id,
    department_id,
    seniority_level,
    leadership_level,
    geographic_scope,
    layers_below,
    international_travel,
    budget_authority_type,
    budget_currency
) VALUES (
    'Global Medical Information Specialist',
    'global-medical-information-specialist',
    'Provides expert medical information responses to healthcare professionals and internal stakeholders on a global scale',
    'office',
    '06127088-4d52-40aa-88c9-93f4e79e085a',  -- Medical Affairs function
    '2b320eab-1758-42d7-adfa-7f49c12cdf40',  -- Medical Information Services dept
    'mid',
    'individual_contributor',
    'global',
    0,
    false,
    'none',
    'USD'
);

-- ============================================================================
-- PHASE 3: Scientific Communications (3 roles)
-- ============================================================================

-- Note: These roles are different from "Publications Manager" roles
-- Publications Lead focuses on publication strategy and planning
-- Publications Manager focuses on team and operations management

-- Check which department to use:
-- Option A: Scientific Communications (9871d82a-631a-4cf7-9a00-1ab838a45c3e)
-- Option B: Publications (5d5ded20-c30a-48f1-844c-fc9f80fcaacb)
-- Using Scientific Communications since enrichment grouped them there

-- 2. Global Publications Lead
INSERT INTO org_roles (
    name,
    slug,
    description,
    role_category,
    function_id,
    department_id,
    seniority_level,
    leadership_level,
    geographic_scope,
    layers_below,
    international_travel,
    budget_authority_type,
    budget_currency
) VALUES (
    'Global Publications Lead',
    'global-publications-lead',
    'Leads global publication strategy, planning, and execution across all therapeutic areas',
    'office',
    '06127088-4d52-40aa-88c9-93f4e79e085a',  -- Medical Affairs function
    '9871d82a-631a-4cf7-9a00-1ab838a45c3e',  -- Scientific Communications dept
    'senior',
    'individual_contributor',
    'global',
    0,
    false,
    'none',
    'USD'
);

-- 3. Regional Publications Lead
INSERT INTO org_roles (
    name,
    slug,
    description,
    role_category,
    function_id,
    department_id,
    seniority_level,
    leadership_level,
    geographic_scope,
    layers_below,
    international_travel,
    budget_authority_type,
    budget_currency
) VALUES (
    'Regional Publications Lead',
    'regional-publications-lead',
    'Leads regional publication strategy and execution, coordinating with global publications team',
    'office',
    '06127088-4d52-40aa-88c9-93f4e79e085a',  -- Medical Affairs function
    '9871d82a-631a-4cf7-9a00-1ab838a45c3e',  -- Scientific Communications dept
    'senior',
    'individual_contributor',
    'regional',
    0,
    false,
    'none',
    'USD'
);

-- 4. Local Publications Lead
INSERT INTO org_roles (
    name,
    slug,
    description,
    role_category,
    function_id,
    department_id,
    seniority_level,
    leadership_level,
    geographic_scope,
    layers_below,
    international_travel,
    budget_authority_type,
    budget_currency
) VALUES (
    'Local Publications Lead',
    'local-publications-lead',
    'Leads local publication execution and supports regional/global publication initiatives',
    'office',
    '06127088-4d52-40aa-88c9-93f4e79e085a',  -- Medical Affairs function
    '9871d82a-631a-4cf7-9a00-1ab838a45c3e',  -- Scientific Communications dept
    'senior',
    'individual_contributor',
    'local',
    0,
    false,
    'none',
    'USD'
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that all 4 roles were created
SELECT
    name,
    geographic_scope,
    seniority_level,
    d.name as department_name,
    id
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
WHERE r.name IN (
    'Global Medical Information Specialist',
    'Global Publications Lead',
    'Regional Publications Lead',
    'Local Publications Lead'
)
ORDER BY r.name, r.geographic_scope;

-- Expected output: 4 rows with the new roles and their generated UUIDs

-- ============================================================================
-- EXPORT FOR UPDATE SCRIPT
-- ============================================================================

-- Copy these results to update the Python script's role mappings:
SELECT
    json_build_object(
        'role_name', r.name,
        'geographic_scope', r.geographic_scope,
        'role_id', r.id,
        'department_id', r.department_id
    ) as role_mapping
FROM org_roles r
WHERE r.name IN (
    'Global Medical Information Specialist',
    'Global Publications Lead',
    'Regional Publications Lead',
    'Local Publications Lead'
)
ORDER BY r.name, r.geographic_scope;

-- Use these UUIDs to update apply_role_ids_from_export.py
-- Then re-run the script to update JSON files
