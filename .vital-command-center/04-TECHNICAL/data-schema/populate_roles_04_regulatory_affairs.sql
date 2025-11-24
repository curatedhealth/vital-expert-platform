-- =====================================================================
-- POPULATE REGULATORY AFFAIRS ROLES
-- Function: Regulatory Affairs (6 departments, 114 roles)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING REGULATORY AFFAIRS ROLES';
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
-- DEPARTMENT: REGULATORY LEADERSHIP & STRATEGY (12 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Regulatory Leadership & Strategy roles...'; END $$;

SELECT insert_role('Global Chief Regulatory Officer', 'Regulatory Leadership & Strategy', 'regulatory-affairs', 'global', 'c_suite', 'office');
SELECT insert_role('Regional Chief Regulatory Officer', 'Regulatory Leadership & Strategy', 'regulatory-affairs', 'regional', 'c_suite', 'office');
SELECT insert_role('Local Chief Regulatory Officer', 'Regulatory Leadership & Strategy', 'regulatory-affairs', 'local', 'c_suite', 'office');
SELECT insert_role('Global SVP Regulatory Affairs', 'Regulatory Leadership & Strategy', 'regulatory-affairs', 'global', 'executive', 'office');
SELECT insert_role('Regional SVP Regulatory Affairs', 'Regulatory Leadership & Strategy', 'regulatory-affairs', 'regional', 'executive', 'office');
SELECT insert_role('Local SVP Regulatory Affairs', 'Regulatory Leadership & Strategy', 'regulatory-affairs', 'local', 'executive', 'office');
SELECT insert_role('Global VP Regulatory Strategy', 'Regulatory Leadership & Strategy', 'regulatory-affairs', 'global', 'executive', 'office');
SELECT insert_role('Regional VP Regulatory Strategy', 'Regulatory Leadership & Strategy', 'regulatory-affairs', 'regional', 'executive', 'office');
SELECT insert_role('Local VP Regulatory Strategy', 'Regulatory Leadership & Strategy', 'regulatory-affairs', 'local', 'executive', 'office');
SELECT insert_role('Global Head of Regulatory Operations', 'Regulatory Leadership & Strategy', 'regulatory-affairs', 'global', 'director', 'office');
SELECT insert_role('Regional Head of Regulatory Operations', 'Regulatory Leadership & Strategy', 'regulatory-affairs', 'regional', 'director', 'office');
SELECT insert_role('Local Head of Regulatory Operations', 'Regulatory Leadership & Strategy', 'regulatory-affairs', 'local', 'director', 'office');

-- =====================================================================
-- DEPARTMENT: REGULATORY SUBMISSIONS & OPERATIONS (27 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Regulatory Submissions & Operations roles...'; END $$;

SELECT insert_role('Global VP Regulatory Submissions', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'global', 'executive', 'office');
SELECT insert_role('Regional VP Regulatory Submissions', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'regional', 'executive', 'office');
SELECT insert_role('Local VP Regulatory Submissions', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'local', 'executive', 'office');
SELECT insert_role('Global Submissions Director', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'global', 'director', 'office');
SELECT insert_role('Regional Submissions Director', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'regional', 'director', 'office');
SELECT insert_role('Local Submissions Director', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'local', 'director', 'office');
SELECT insert_role('Global Senior Regulatory Submissions Manager', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Senior Regulatory Submissions Manager', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Senior Regulatory Submissions Manager', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Submissions Manager', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Submissions Manager', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Submissions Manager', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Publishing Manager', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Publishing Manager', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Publishing Manager', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Senior Regulatory Writer', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Senior Regulatory Writer', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Senior Regulatory Writer', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Regulatory Writer', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Regulatory Writer', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Regulatory Writer', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'local', 'mid', 'office');
SELECT insert_role('Global Regulatory Document Specialist', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Regulatory Document Specialist', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Regulatory Document Specialist', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'local', 'mid', 'office');
SELECT insert_role('Global Regulatory Coordinator', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Regulatory Coordinator', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Regulatory Coordinator', 'Regulatory Submissions & Operations', 'regulatory-affairs', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: REGULATORY INTELLIGENCE & POLICY (18 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Regulatory Intelligence & Policy roles...'; END $$;

SELECT insert_role('Global Regulatory Intelligence Director', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'global', 'director', 'office');
SELECT insert_role('Regional Regulatory Intelligence Director', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'regional', 'director', 'office');
SELECT insert_role('Local Regulatory Intelligence Director', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'local', 'director', 'office');
SELECT insert_role('Global Sr. Regulatory Intelligence Manager', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Sr. Regulatory Intelligence Manager', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Sr. Regulatory Intelligence Manager', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Reg Intelligence Manager', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Reg Intelligence Manager', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Reg Intelligence Manager', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Sr. Regulatory Policy Analyst', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Sr. Regulatory Policy Analyst', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Sr. Regulatory Policy Analyst', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'local', 'mid', 'office');
SELECT insert_role('Global Regulatory Policy Analyst', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Regulatory Policy Analyst', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Regulatory Policy Analyst', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'local', 'mid', 'office');
SELECT insert_role('Global Regulatory Intelligence Specialist', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Regulatory Intelligence Specialist', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Regulatory Intelligence Specialist', 'Regulatory Intelligence & Policy', 'regulatory-affairs', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: CMC REGULATORY AFFAIRS (21 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating CMC Regulatory Affairs roles...'; END $$;

SELECT insert_role('Global CMC Regulatory Affairs Director', 'CMC Regulatory Affairs', 'regulatory-affairs', 'global', 'director', 'office');
SELECT insert_role('Regional CMC Regulatory Affairs Director', 'CMC Regulatory Affairs', 'regulatory-affairs', 'regional', 'director', 'office');
SELECT insert_role('Local CMC Regulatory Affairs Director', 'CMC Regulatory Affairs', 'regulatory-affairs', 'local', 'director', 'office');
SELECT insert_role('Global Sr. CMC Regulatory Manager', 'CMC Regulatory Affairs', 'regulatory-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Sr. CMC Regulatory Manager', 'CMC Regulatory Affairs', 'regulatory-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Sr. CMC Regulatory Manager', 'CMC Regulatory Affairs', 'regulatory-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global CMC Regulatory Manager', 'CMC Regulatory Affairs', 'regulatory-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional CMC Regulatory Manager', 'CMC Regulatory Affairs', 'regulatory-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local CMC Regulatory Manager', 'CMC Regulatory Affairs', 'regulatory-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Sr. CMC Regulatory Specialist', 'CMC Regulatory Affairs', 'regulatory-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Sr. CMC Regulatory Specialist', 'CMC Regulatory Affairs', 'regulatory-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Sr. CMC Regulatory Specialist', 'CMC Regulatory Affairs', 'regulatory-affairs', 'local', 'mid', 'office');
SELECT insert_role('Global CMC Regulatory Specialist', 'CMC Regulatory Affairs', 'regulatory-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional CMC Regulatory Specialist', 'CMC Regulatory Affairs', 'regulatory-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local CMC Regulatory Specialist', 'CMC Regulatory Affairs', 'regulatory-affairs', 'local', 'mid', 'office');
SELECT insert_role('Global CMC Technical Writer', 'CMC Regulatory Affairs', 'regulatory-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional CMC Technical Writer', 'CMC Regulatory Affairs', 'regulatory-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local CMC Technical Writer', 'CMC Regulatory Affairs', 'regulatory-affairs', 'local', 'mid', 'office');
SELECT insert_role('Global CMC Regulatory Associate', 'CMC Regulatory Affairs', 'regulatory-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional CMC Regulatory Associate', 'CMC Regulatory Affairs', 'regulatory-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local CMC Regulatory Associate', 'CMC Regulatory Affairs', 'regulatory-affairs', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: GLOBAL REGULATORY AFFAIRS (18 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Global Regulatory Affairs roles...'; END $$;

SELECT insert_role('Global Head of US Regulatory Affairs', 'Global Regulatory Affairs', 'regulatory-affairs', 'global', 'director', 'office');
SELECT insert_role('Regional Head of US Regulatory Affairs', 'Global Regulatory Affairs', 'regulatory-affairs', 'regional', 'director', 'office');
SELECT insert_role('Local Head of US Regulatory Affairs', 'Global Regulatory Affairs', 'regulatory-affairs', 'local', 'director', 'office');
SELECT insert_role('Global Head of EU Regulatory Affairs', 'Global Regulatory Affairs', 'regulatory-affairs', 'global', 'director', 'office');
SELECT insert_role('Regional Head of EU Regulatory Affairs', 'Global Regulatory Affairs', 'regulatory-affairs', 'regional', 'director', 'office');
SELECT insert_role('Local Head of EU Regulatory Affairs', 'Global Regulatory Affairs', 'regulatory-affairs', 'local', 'director', 'office');
SELECT insert_role('Global US Regulatory Affairs Director', 'Global Regulatory Affairs', 'regulatory-affairs', 'global', 'director', 'office');
SELECT insert_role('Regional US Regulatory Affairs Director', 'Global Regulatory Affairs', 'regulatory-affairs', 'regional', 'director', 'office');
SELECT insert_role('Local US Regulatory Affairs Director', 'Global Regulatory Affairs', 'regulatory-affairs', 'local', 'director', 'office');
SELECT insert_role('Global EU Regulatory Affairs Director', 'Global Regulatory Affairs', 'regulatory-affairs', 'global', 'director', 'office');
SELECT insert_role('Regional EU Regulatory Affairs Director', 'Global Regulatory Affairs', 'regulatory-affairs', 'regional', 'director', 'office');
SELECT insert_role('Local EU Regulatory Affairs Director', 'Global Regulatory Affairs', 'regulatory-affairs', 'local', 'director', 'office');
SELECT insert_role('Global APAC Regulatory Affairs Manager', 'Global Regulatory Affairs', 'regulatory-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional APAC Regulatory Affairs Manager', 'Global Regulatory Affairs', 'regulatory-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local APAC Regulatory Affairs Manager', 'Global Regulatory Affairs', 'regulatory-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global LatAm Regulatory Affairs Manager', 'Global Regulatory Affairs', 'regulatory-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional LatAm Regulatory Affairs Manager', 'Global Regulatory Affairs', 'regulatory-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local LatAm Regulatory Affairs Manager', 'Global Regulatory Affairs', 'regulatory-affairs', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT: REGULATORY COMPLIANCE & SYSTEMS (18 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Regulatory Compliance & Systems roles...'; END $$;

SELECT insert_role('Global Regulatory Compliance Director', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'global', 'director', 'office');
SELECT insert_role('Regional Regulatory Compliance Director', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'regional', 'director', 'office');
SELECT insert_role('Local Regulatory Compliance Director', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'local', 'director', 'office');
SELECT insert_role('Global Regulatory Labeling Manager', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Regulatory Labeling Manager', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Regulatory Labeling Manager', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Regulatory Compliance Manager', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Regulatory Compliance Manager', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Regulatory Compliance Manager', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Regulatory Systems Manager', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Regulatory Systems Manager', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Regulatory Systems Manager', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Regulatory Labeling Specialist', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Regulatory Labeling Specialist', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Regulatory Labeling Specialist', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'local', 'mid', 'office');
SELECT insert_role('Global Regulatory Systems Specialist', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Regulatory Systems Specialist', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Regulatory Systems Specialist', 'Regulatory Compliance & Systems', 'regulatory-affairs', 'local', 'mid', 'office');

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
    WHERE f.slug = 'regulatory-affairs' 
      AND r.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    SELECT COUNT(DISTINCT d.id) INTO dept_count
    FROM public.org_departments d
    JOIN public.org_functions f ON d.function_id = f.id
    WHERE f.slug = 'regulatory-affairs'
      AND d.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'REGULATORY AFFAIRS ROLES CREATED SUCCESSFULLY';
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
WHERE f.slug = 'regulatory-affairs'
  AND d.deleted_at IS NULL
  AND f.deleted_at IS NULL
GROUP BY d.name
ORDER BY role_count DESC, d.name;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ Regulatory Affairs roles populated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;