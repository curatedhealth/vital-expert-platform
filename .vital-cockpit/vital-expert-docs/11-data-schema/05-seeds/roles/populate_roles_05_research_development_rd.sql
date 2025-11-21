-- =====================================================================
-- POPULATE RESEARCH & DEVELOPMENT (R&D) ROLES
-- Function: Research & Development (R&D) (8 departments, 30 roles)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING RESEARCH & DEVELOPMENT (R&D) ROLES';
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
-- DEPARTMENT: DISCOVERY RESEARCH (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Discovery Research roles...'; END $$;

SELECT insert_role('Global Research Scientist', 'Discovery Research', 'research-development', 'global', 'mid', 'office');
SELECT insert_role('Regional Research Scientist', 'Discovery Research', 'research-development', 'regional', 'mid', 'office');
SELECT insert_role('Local Research Scientist', 'Discovery Research', 'research-development', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: TRANSLATIONAL SCIENCE (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Translational Science roles...'; END $$;

SELECT insert_role('Global Translational Scientist', 'Translational Science', 'research-development', 'global', 'mid', 'office');
SELECT insert_role('Regional Translational Scientist', 'Translational Science', 'research-development', 'regional', 'mid', 'office');
SELECT insert_role('Local Translational Scientist', 'Translational Science', 'research-development', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: PRECLINICAL DEVELOPMENT (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Preclinical Development roles...'; END $$;

SELECT insert_role('Global Preclinical Project Manager', 'Preclinical Development', 'research-development', 'global', 'senior', 'office');
SELECT insert_role('Regional Preclinical Project Manager', 'Preclinical Development', 'research-development', 'regional', 'senior', 'office');
SELECT insert_role('Local Preclinical Project Manager', 'Preclinical Development', 'research-development', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT: CLINICAL DEVELOPMENT (6 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Clinical Development roles...'; END $$;

SELECT insert_role('Global Clinical Project Lead', 'Clinical Development', 'research-development', 'global', 'senior', 'office');
SELECT insert_role('Regional Clinical Project Lead', 'Clinical Development', 'research-development', 'regional', 'senior', 'office');
SELECT insert_role('Local Clinical Project Lead', 'Clinical Development', 'research-development', 'local', 'senior', 'office');
SELECT insert_role('Global Trial Manager', 'Clinical Development', 'research-development', 'global', 'senior', 'office');
SELECT insert_role('Regional Trial Manager', 'Clinical Development', 'research-development', 'regional', 'senior', 'office');
SELECT insert_role('Local Trial Manager', 'Clinical Development', 'research-development', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT: BIOMETRICS & DATA MANAGEMENT (6 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Biometrics & Data Management roles...'; END $$;

SELECT insert_role('Global Biostatistician', 'Biometrics & Data Management', 'research-development', 'global', 'mid', 'office');
SELECT insert_role('Regional Biostatistician', 'Biometrics & Data Management', 'research-development', 'regional', 'mid', 'office');
SELECT insert_role('Local Biostatistician', 'Biometrics & Data Management', 'research-development', 'local', 'mid', 'office');
SELECT insert_role('Global Data Manager', 'Biometrics & Data Management', 'research-development', 'global', 'senior', 'office');
SELECT insert_role('Regional Data Manager', 'Biometrics & Data Management', 'research-development', 'regional', 'senior', 'office');
SELECT insert_role('Local Data Manager', 'Biometrics & Data Management', 'research-development', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT: CLINICAL OPERATIONS (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Clinical Operations roles...'; END $$;

SELECT insert_role('Global Clinical Operations Manager', 'Clinical Operations', 'research-development', 'global', 'senior', 'office');
SELECT insert_role('Regional Clinical Operations Manager', 'Clinical Operations', 'research-development', 'regional', 'senior', 'office');
SELECT insert_role('Local Clinical Operations Manager', 'Clinical Operations', 'research-development', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT: PHARMACOVIGILANCE & DRUG SAFETY (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Pharmacovigilance & Drug Safety roles...'; END $$;

SELECT insert_role('Global Drug Safety Officer', 'Pharmacovigilance & Drug Safety', 'research-development', 'global', 'mid', 'office');
SELECT insert_role('Regional Drug Safety Officer', 'Pharmacovigilance & Drug Safety', 'research-development', 'regional', 'mid', 'office');
SELECT insert_role('Local Drug Safety Officer', 'Pharmacovigilance & Drug Safety', 'research-development', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: PROJECT & PORTFOLIO MANAGEMENT (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Project & Portfolio Management roles...'; END $$;

SELECT insert_role('Global Portfolio Manager', 'Project & Portfolio Management', 'research-development', 'global', 'senior', 'office');
SELECT insert_role('Regional Portfolio Manager', 'Project & Portfolio Management', 'research-development', 'regional', 'senior', 'office');
SELECT insert_role('Local Portfolio Manager', 'Project & Portfolio Management', 'research-development', 'local', 'senior', 'office');

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
    WHERE f.slug = 'research-development' 
      AND r.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    SELECT COUNT(DISTINCT d.id) INTO dept_count
    FROM public.org_departments d
    JOIN public.org_functions f ON d.function_id = f.id
    WHERE f.slug = 'research-development'
      AND d.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'RESEARCH DEVELOPMENT RD ROLES CREATED SUCCESSFULLY';
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
WHERE f.slug = 'research-development'
  AND d.deleted_at IS NULL
  AND f.deleted_at IS NULL
GROUP BY d.name
ORDER BY role_count DESC, d.name;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ Research Development Rd roles populated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;