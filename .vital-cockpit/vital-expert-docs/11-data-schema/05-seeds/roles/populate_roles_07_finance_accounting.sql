-- =====================================================================
-- POPULATE FINANCE & ACCOUNTING ROLES
-- Function: Finance & Accounting (6 departments, 18 roles)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING FINANCE & ACCOUNTING ROLES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- HELPER FUNCTION
-- =====================================================================

CREATE OR REPLACE FUNCTION insert_role(
    p_name TEXT,
    p_department_name TEXT,
    p_function_slug TEXT,
    p_geographic_scope geographic_scope_type,
    p_seniority_level seniority_level_type DEFAULT NULL,
    p_role_category role_category_type DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_function_id UUID;
    v_department_id UUID;
    v_role_id UUID;
    v_slug TEXT;
BEGIN
    SELECT id INTO v_function_id FROM public.org_functions WHERE slug = p_function_slug AND deleted_at IS NULL;
    IF v_function_id IS NULL THEN RAISE EXCEPTION 'Function not found: %', p_function_slug; END IF;
    
    SELECT id INTO v_department_id FROM public.org_departments WHERE function_id = v_function_id AND name = p_department_name AND deleted_at IS NULL;
    IF v_department_id IS NULL THEN RAISE EXCEPTION 'Department not found: % in function %', p_department_name, p_function_slug; END IF;
    
    v_slug := generate_slug(p_name);
    
    INSERT INTO public.org_roles (name, slug, function_id, department_id, geographic_scope, seniority_level, role_category)
    VALUES (p_name, v_slug, v_function_id, v_department_id, p_geographic_scope, p_seniority_level, p_role_category)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, function_id = EXCLUDED.function_id, department_id = EXCLUDED.department_id,
        geographic_scope = EXCLUDED.geographic_scope, seniority_level = EXCLUDED.seniority_level, role_category = EXCLUDED.role_category, updated_at = NOW()
    RETURNING id INTO v_role_id;
    
    RETURN v_role_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- DEPARTMENT: FINANCIAL PLANNING & ANALYSIS (FP&A) (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Financial Planning & Analysis (FP&A) roles...'; END $$;

SELECT insert_role('Global FP&A Manager', 'Financial Planning & Analysis (FP&A)', 'finance-accounting', 'global', 'senior', 'office');
SELECT insert_role('Regional FP&A Manager', 'Financial Planning & Analysis (FP&A)', 'finance-accounting', 'regional', 'senior', 'office');
SELECT insert_role('Local FP&A Manager', 'Financial Planning & Analysis (FP&A)', 'finance-accounting', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT: ACCOUNTING OPERATIONS (GL/AP/AR) (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Accounting Operations (GL/AP/AR) roles...'; END $$;

SELECT insert_role('Global Accountant', 'Accounting Operations (GL/AP/AR)', 'finance-accounting', 'global', 'c_suite', 'office');
SELECT insert_role('Regional Accountant', 'Accounting Operations (GL/AP/AR)', 'finance-accounting', 'regional', 'c_suite', 'office');
SELECT insert_role('Local Accountant', 'Accounting Operations (GL/AP/AR)', 'finance-accounting', 'local', 'c_suite', 'office');

-- =====================================================================
-- DEPARTMENT: TREASURY & CASH MANAGEMENT (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Treasury & Cash Management roles...'; END $$;

SELECT insert_role('Global Treasury Analyst', 'Treasury & Cash Management', 'finance-accounting', 'global', 'mid', 'office');
SELECT insert_role('Regional Treasury Analyst', 'Treasury & Cash Management', 'finance-accounting', 'regional', 'mid', 'office');
SELECT insert_role('Local Treasury Analyst', 'Treasury & Cash Management', 'finance-accounting', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: TAX PLANNING & COMPLIANCE (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Tax Planning & Compliance roles...'; END $$;

SELECT insert_role('Global Tax Analyst', 'Tax Planning & Compliance', 'finance-accounting', 'global', 'mid', 'office');
SELECT insert_role('Regional Tax Analyst', 'Tax Planning & Compliance', 'finance-accounting', 'regional', 'mid', 'office');
SELECT insert_role('Local Tax Analyst', 'Tax Planning & Compliance', 'finance-accounting', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: INTERNAL AUDIT & CONTROLS (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Internal Audit & Controls roles...'; END $$;

SELECT insert_role('Global Internal Audit Lead', 'Internal Audit & Controls', 'finance-accounting', 'global', 'senior', 'office');
SELECT insert_role('Regional Internal Audit Lead', 'Internal Audit & Controls', 'finance-accounting', 'regional', 'senior', 'office');
SELECT insert_role('Local Internal Audit Lead', 'Internal Audit & Controls', 'finance-accounting', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT: BUSINESS/COMMERCIAL FINANCE (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Business/Commercial Finance roles...'; END $$;

SELECT insert_role('Global Finance Business Partner', 'Business/Commercial Finance', 'finance-accounting', 'global', 'mid', 'office');
SELECT insert_role('Regional Finance Business Partner', 'Business/Commercial Finance', 'finance-accounting', 'regional', 'mid', 'office');
SELECT insert_role('Local Finance Business Partner', 'Business/Commercial Finance', 'finance-accounting', 'local', 'mid', 'office');

-- =====================================================================
-- CLEANUP
-- =====================================================================

DROP FUNCTION IF EXISTS insert_role(TEXT, TEXT, TEXT, geographic_scope_type, seniority_level_type, role_category_type);

-- =====================================================================
-- VERIFICATION
-- =====================================================================

DO $$
DECLARE
    role_count INTEGER;
    dept_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO role_count 
    FROM public.org_roles r
    JOIN public.org_functions f ON r.function_id = f.id
    WHERE f.slug = 'finance-accounting' 
      AND r.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    SELECT COUNT(DISTINCT d.id) INTO dept_count
    FROM public.org_departments d
    JOIN public.org_functions f ON d.function_id = f.id
    WHERE f.slug = 'finance-accounting'
      AND d.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'FINANCE ACCOUNTING ROLES CREATED SUCCESSFULLY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Total Roles: %', role_count;
    RAISE NOTICE 'Total Departments: %', dept_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Roles by Department:';
END $$;

SELECT 
    d.name as department_name,
    COUNT(r.id) as role_count,
    COUNT(CASE WHEN r.geographic_scope = 'global' THEN 1 END) as global_roles,
    COUNT(CASE WHEN r.geographic_scope = 'regional' THEN 1 END) as regional_roles,
    COUNT(CASE WHEN r.geographic_scope = 'local' THEN 1 END) as local_roles
FROM public.org_departments d
JOIN public.org_functions f ON d.function_id = f.id
LEFT JOIN public.org_roles r ON r.department_id = d.id AND r.deleted_at IS NULL
WHERE f.slug = 'finance-accounting'
  AND d.deleted_at IS NULL
  AND f.deleted_at IS NULL
GROUP BY d.name
ORDER BY role_count DESC, d.name;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ Finance Accounting roles populated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;