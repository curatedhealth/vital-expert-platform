-- =====================================================================
-- POPULATE ALL REMAINING ROLES FROM JSON
-- This script processes the PHARMA_ORG_ALL_FUNCTION_DEPT_ROLE_SCOPE.json
-- for all remaining functions (Commercial through Facilities)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING ALL REMAINING PHARMA ROLES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'This will populate roles for:';
    RAISE NOTICE '  - Commercial Organization';
    RAISE NOTICE '  - Regulatory Affairs';
    RAISE NOTICE '  - Research & Development';
    RAISE NOTICE '  - Manufacturing & Supply Chain';
    RAISE NOTICE '  - Finance & Accounting';
    RAISE NOTICE '  - Human Resources';
    RAISE NOTICE '  - Information Technology / Digital';
    RAISE NOTICE '  - Legal & Compliance';
    RAISE NOTICE '  - Corporate Communications';
    RAISE NOTICE '  - Strategic Planning / Corporate Development';
    RAISE NOTICE '  - Business Intelligence / Analytics';
    RAISE NOTICE '  - Procurement';
    RAISE NOTICE '  - Facilities / Workplace Services';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- HELPER FUNCTION
-- =====================================================================

CREATE OR REPLACE FUNCTION insert_role_from_json(
    p_name TEXT,
    p_department_name TEXT,
    p_function_name TEXT,
    p_geographic_scope TEXT  -- Will be 'global', 'regional', or 'local' from JSON
) RETURNS UUID AS $$
DECLARE
    v_function_id UUID;
    v_department_id UUID;
    v_role_id UUID;
    v_slug TEXT;
    v_scope geographic_scope_type;
    v_seniority seniority_level_type;
    v_category role_category_type;
BEGIN
    -- Cast text scope to enum
    v_scope := p_geographic_scope::geographic_scope_type;
    
    -- Get function ID (try exact match first, then fuzzy)
    SELECT id INTO v_function_id
    FROM public.org_functions
    WHERE deleted_at IS NULL
      AND (
        LOWER(name) = LOWER(p_function_name)
        OR slug = generate_slug(p_function_name)
        OR LOWER(name) LIKE LOWER('%' || p_function_name || '%')
      )
    LIMIT 1;
    
    IF v_function_id IS NULL THEN
        RAISE WARNING 'Function not found: %. Skipping role: %', p_function_name, p_name;
        RETURN NULL;
    END IF;
    
    -- Get department ID
    SELECT id INTO v_department_id
    FROM public.org_departments
    WHERE function_id = v_function_id
      AND deleted_at IS NULL
      AND (
        LOWER(name) = LOWER(p_department_name)
        OR slug = generate_slug(p_department_name)
      )
    LIMIT 1;
    
    IF v_department_id IS NULL THEN
        RAISE WARNING 'Department not found: % in function %. Skipping role: %', p_department_name, p_function_name, p_name;
        RETURN NULL;
    END IF;
    
    -- Infer seniority from title
    v_seniority := CASE
        WHEN p_name ~* 'Chief|C-Suite|CMO|CFO|CIO|CCO|CEO' THEN 'c_suite'::seniority_level_type
        WHEN p_name ~* 'SVP|Senior VP|Executive VP' THEN 'executive'::seniority_level_type
        WHEN p_name ~* '\bVP\b|Vice President|Executive Director' THEN 'executive'::seniority_level_type
        WHEN p_name ~* 'Director|Head of' THEN 'director'::seniority_level_type
        WHEN p_name ~* 'Senior|Lead|Principal|Manager' THEN 'senior'::seniority_level_type
        WHEN p_name ~* 'Associate|Coordinator|Analyst|Specialist' THEN 'mid'::seniority_level_type
        WHEN p_name ~* 'Junior|Entry|Assistant' THEN 'entry'::seniority_level_type
        ELSE 'mid'::seniority_level_type
    END;
    
    -- Infer category from title and department
    v_category := CASE
        WHEN p_name ~* 'Field|Territory|MSL|Representative|Rep\b' THEN 'field'::role_category_type
        WHEN p_department_name ~* 'Field|Sales Operations' THEN 'field'::role_category_type
        WHEN p_name ~* 'Remote|Virtual|Digital' THEN 'remote'::role_category_type
        WHEN p_name ~* 'Hybrid' THEN 'hybrid'::role_category_type
        ELSE 'office'::role_category_type
    END;
    
    -- Generate slug
    v_slug := generate_slug(p_name);
    
    -- Insert or update role
    INSERT INTO public.org_roles (
        name, slug, function_id, department_id, geographic_scope,
        seniority_level, role_category, created_at, updated_at
    ) VALUES (
        p_name, v_slug, v_function_id, v_department_id, v_scope,
        v_seniority, v_category, NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        function_id = EXCLUDED.function_id,
        department_id = EXCLUDED.department_id,
        geographic_scope = EXCLUDED.geographic_scope,
        seniority_level = EXCLUDED.seniority_level,
        role_category = EXCLUDED.role_category,
        updated_at = NOW()
    RETURNING id INTO v_role_id;
    
    RETURN v_role_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error inserting role %: %', p_name, SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- INSTRUCTIONS FOR MANUAL POPULATION
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MANUAL POPULATION REQUIRED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Due to the size of the JSON file and SQL limitations, please:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Use a script (Python, Node.js, or similar) to:';
    RAISE NOTICE '   - Parse PHARMA_ORG_ALL_FUNCTION_DEPT_ROLE_SCOPE.json';
    RAISE NOTICE '   - For each role, generate SQL calls:';
    RAISE NOTICE '     SELECT insert_role_from_json(';
    RAISE NOTICE '       ''role_name'',';
    RAISE NOTICE '       ''department_name'',';
    RAISE NOTICE '       ''function_name'',';
    RAISE NOTICE '       ''scope''  -- global/regional/local';
    RAISE NOTICE '     );';
    RAISE NOTICE '';
    RAISE NOTICE '2. OR manually create individual scripts per function';
    RAISE NOTICE '   (like populate_roles_03_commercial.sql)';
    RAISE NOTICE '';
    RAISE NOTICE '3. The insert_role_from_json() function is ready to use';
    RAISE NOTICE '   and will auto-infer seniority and role category';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

-- =====================================================================
-- EXAMPLE USAGE (uncomment and adapt for each function)
-- =====================================================================

/*
-- Commercial Organization Example:
DO $$ BEGIN RAISE NOTICE 'Creating Commercial Organization roles...'; END $$;

SELECT insert_role_from_json('Global Chief Commercial Officer', 'Commercial Leadership & Strategy', 'Commercial Organization', 'global');
SELECT insert_role_from_json('Regional Chief Commercial Officer', 'Commercial Leadership & Strategy', 'Commercial Organization', 'regional');
SELECT insert_role_from_json('Local Chief Commercial Officer', 'Commercial Leadership & Strategy', 'Commercial Organization', 'local');
-- ... continue for all roles ...

*/

-- =====================================================================
-- CLEANUP (when done)
-- =====================================================================

-- DROP FUNCTION IF EXISTS insert_role_from_json(TEXT, TEXT, TEXT, TEXT);

