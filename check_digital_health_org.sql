-- ============================================================================
-- CHECK DIGITAL HEALTH STARTUP TENANT ORGANIZATIONAL STRUCTURE
-- ============================================================================

-- Digital Health Tenant IDs (multiple possible):
-- From archive: b8026534-02a7-4d24-bf4c-344591964e02
-- From mapping script: 684f6c2c-b50d-4726-ad92-c76c3b785a89

-- ============================================================================
-- 1. CHECK IF TENANT EXISTS
-- ============================================================================
SELECT 
    '=== DIGITAL HEALTH TENANT ===' as section,
    id,
    name,
    slug,
    tier,
    status,
    created_at
FROM tenants
WHERE 
    slug = 'digital-health-startup' 
    OR name ILIKE '%digital health%'
ORDER BY created_at DESC;

-- ============================================================================
-- 2. CHECK ORGANIZATIONAL FUNCTIONS
-- ============================================================================
SELECT 
    '=== BUSINESS FUNCTIONS ===' as section,
    COUNT(*) as total_functions,
    array_agg(department_name ORDER BY department_name) as function_names
FROM org_functions
WHERE 
    unique_id LIKE 'FN-DTX-%' 
    OR department_name ILIKE '%digital%'
    OR department_name ILIKE '%product%'
    OR department_name ILIKE '%engineering%';

-- ============================================================================
-- 3. CHECK DEPARTMENTS
-- ============================================================================
SELECT 
    '=== DEPARTMENTS ===' as section,
    COUNT(*) as total_departments,
    array_agg(DISTINCT department_name ORDER BY department_name) FILTER (WHERE department_name IS NOT NULL) as department_names
FROM org_departments
WHERE 
    unique_id LIKE 'DEPT-DTX-%'
    OR department_name ILIKE '%digital%'
    OR department_name ILIKE '%software%'
    OR department_name ILIKE '%data science%';

-- ============================================================================
-- 4. CHECK ROLES
-- ============================================================================
SELECT 
    '=== ROLES ===' as section,
    COUNT(*) as total_roles,
    COUNT(*) FILTER (WHERE seniority_level = 'C-Level') as c_level_roles,
    COUNT(*) FILTER (WHERE seniority_level = 'Executive') as executive_roles,
    COUNT(*) FILTER (WHERE seniority_level = 'Senior') as senior_roles,
    COUNT(*) FILTER (WHERE seniority_level = 'Mid') as mid_roles
FROM org_roles
WHERE 
    unique_id LIKE 'ROLE-DTX-%'
    OR role_name ILIKE '%digital%'
    OR role_name ILIKE '%product%'
    OR role_name ILIKE '%data scientist%';

-- ============================================================================
-- 5. SAMPLE ROLES (Top 20)
-- ============================================================================
SELECT 
    '=== SAMPLE DIGITAL HEALTH ROLES ===' as section,
    role_name,
    role_title,
    seniority_level,
    unique_id
FROM org_roles
WHERE 
    unique_id LIKE 'ROLE-DTX-%'
ORDER BY 
    CASE seniority_level
        WHEN 'C-Level' THEN 1
        WHEN 'Executive' THEN 2
        WHEN 'Senior' THEN 3
        WHEN 'Mid' THEN 4
        WHEN 'Junior' THEN 5
        ELSE 6
    END,
    role_name
LIMIT 20;

-- ============================================================================
-- 6. CHECK PERSONAS (if dh_persona table exists)
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'dh_persona' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'dh_persona table exists';
        
        -- Check personas
        PERFORM 1 FROM dh_persona
        WHERE tenant_id IN (
            SELECT id FROM tenants WHERE slug = 'digital-health-startup'
        )
        LIMIT 1;
        
        IF FOUND THEN
            RAISE NOTICE 'Digital Health personas found!';
        ELSE
            RAISE NOTICE 'No personas found for Digital Health tenant';
        END IF;
    ELSE
        RAISE NOTICE 'dh_persona table does not exist';
    END IF;
END $$;

-- ============================================================================
-- 7. CHECK AGENTS (if agents table exists)
-- ============================================================================
SELECT 
    '=== AGENTS FOR DIGITAL HEALTH ===' as section,
    COUNT(*) as total_agents,
    COUNT(*) FILTER (WHERE is_active = true) as active_agents,
    COUNT(*) FILTER (WHERE category = 'HUMAN') as human_agents,
    COUNT(*) FILTER (WHERE category = 'AI') as ai_agents
FROM agents
WHERE tenant_id IN (
    SELECT id FROM tenants WHERE slug = 'digital-health-startup'
);

-- ============================================================================
-- 8. SUMMARY: Does Digital Health Have Org Structure?
-- ============================================================================
WITH org_check AS (
    SELECT
        (SELECT COUNT(*) FROM tenants WHERE slug = 'digital-health-startup') as tenant_exists,
        (SELECT COUNT(*) FROM org_functions WHERE unique_id LIKE 'FN-DTX-%') as functions_count,
        (SELECT COUNT(*) FROM org_departments WHERE unique_id LIKE 'DEPT-DTX-%') as departments_count,
        (SELECT COUNT(*) FROM org_roles WHERE unique_id LIKE 'ROLE-DTX-%') as roles_count
)
SELECT
    '=== FINAL VERDICT ===' as section,
    CASE
        WHEN tenant_exists = 0 THEN '❌ Tenant does NOT exist'
        WHEN tenant_exists > 0 AND functions_count = 0 AND departments_count = 0 AND roles_count = 0 
            THEN '⚠️  Tenant exists but NO organizational structure loaded'
        WHEN tenant_exists > 0 AND functions_count > 0 AND departments_count > 0 AND roles_count > 0 
            THEN '✅ YES! Digital Health has COMPLETE organizational structure'
        ELSE '⚠️  Tenant exists with PARTIAL organizational structure'
    END as result,
    tenant_exists,
    functions_count,
    departments_count,
    roles_count
FROM org_check;

-- ============================================================================
-- 9. IF EXISTS: Show Full Hierarchy
-- ============================================================================
SELECT 
    '=== FULL ORGANIZATIONAL HIERARCHY ===' as section,
    f.department_name as business_function,
    f.unique_id as function_code,
    d.department_name as department,
    d.unique_id as dept_code,
    COUNT(DISTINCT r.id) as roles_in_dept
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.function_id = f.id
WHERE 
    f.unique_id LIKE 'FN-DTX-%'
GROUP BY f.id, f.department_name, f.unique_id, d.department_name, d.unique_id
ORDER BY f.department_name, d.department_name;

