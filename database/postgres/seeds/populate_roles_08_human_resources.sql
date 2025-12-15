-- =====================================================================
-- POPULATE HUMAN RESOURCES ROLES
-- Function: Human Resources (6 departments, 18 roles)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING HUMAN RESOURCES ROLES';
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
-- DEPARTMENT: TALENT ACQUISITION & RECRUITMENT (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Talent Acquisition & Recruitment roles...'; END $$;

SELECT insert_role('Global Recruiter', 'Talent Acquisition & Recruitment', 'human-resources', 'global', 'mid', 'office');
SELECT insert_role('Regional Recruiter', 'Talent Acquisition & Recruitment', 'human-resources', 'regional', 'mid', 'office');
SELECT insert_role('Local Recruiter', 'Talent Acquisition & Recruitment', 'human-resources', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: LEARNING & DEVELOPMENT (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Learning & Development roles...'; END $$;

SELECT insert_role('Global L&D Manager', 'Learning & Development', 'human-resources', 'global', 'senior', 'office');
SELECT insert_role('Regional L&D Manager', 'Learning & Development', 'human-resources', 'regional', 'senior', 'office');
SELECT insert_role('Local L&D Manager', 'Learning & Development', 'human-resources', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT: TOTAL REWARDS (COMP & BENEFITS) (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Total Rewards (Comp & Benefits) roles...'; END $$;

SELECT insert_role('Global Compensation Analyst', 'Total Rewards (Comp & Benefits)', 'human-resources', 'global', 'mid', 'office');
SELECT insert_role('Regional Compensation Analyst', 'Total Rewards (Comp & Benefits)', 'human-resources', 'regional', 'mid', 'office');
SELECT insert_role('Local Compensation Analyst', 'Total Rewards (Comp & Benefits)', 'human-resources', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: HR BUSINESS PARTNERS (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating HR Business Partners roles...'; END $$;

SELECT insert_role('Global HRBP', 'HR Business Partners', 'human-resources', 'global', 'mid', 'office');
SELECT insert_role('Regional HRBP', 'HR Business Partners', 'human-resources', 'regional', 'mid', 'office');
SELECT insert_role('Local HRBP', 'HR Business Partners', 'human-resources', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: ORGANIZATIONAL DEVELOPMENT (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Organizational Development roles...'; END $$;

SELECT insert_role('Global Org Dev Lead', 'Organizational Development', 'human-resources', 'global', 'senior', 'office');
SELECT insert_role('Regional Org Dev Lead', 'Organizational Development', 'human-resources', 'regional', 'senior', 'office');
SELECT insert_role('Local Org Dev Lead', 'Organizational Development', 'human-resources', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT: HR OPERATIONS & SERVICES (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating HR Operations & Services roles...'; END $$;

SELECT insert_role('Global HR Ops Specialist', 'HR Operations & Services', 'human-resources', 'global', 'mid', 'office');
SELECT insert_role('Regional HR Ops Specialist', 'HR Operations & Services', 'human-resources', 'regional', 'mid', 'office');
SELECT insert_role('Local HR Ops Specialist', 'HR Operations & Services', 'human-resources', 'local', 'mid', 'office');

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
    WHERE f.slug = 'human-resources' 
      AND r.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    SELECT COUNT(DISTINCT d.id) INTO dept_count
    FROM public.org_departments d
    JOIN public.org_functions f ON d.function_id = f.id
    WHERE f.slug = 'human-resources'
      AND d.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'HUMAN RESOURCES ROLES CREATED SUCCESSFULLY';
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
WHERE f.slug = 'human-resources'
  AND d.deleted_at IS NULL
  AND f.deleted_at IS NULL
GROUP BY d.name
ORDER BY role_count DESC, d.name;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ Human Resources roles populated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;