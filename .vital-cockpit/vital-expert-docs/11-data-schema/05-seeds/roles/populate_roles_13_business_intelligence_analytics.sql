-- =====================================================================
-- POPULATE BUSINESS INTELLIGENCE / ANALYTICS ROLES
-- Function: Business Intelligence / Analytics (5 departments, 15 roles)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING BUSINESS INTELLIGENCE / ANALYTICS ROLES';
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
-- DEPARTMENT: MARKET INSIGHTS & RESEARCH (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Market Insights & Research roles...'; END $$;

SELECT insert_role('Global Market Insight Analyst', 'Market Insights & Research', 'business-intelligence-analytics', 'global', 'mid', 'office');
SELECT insert_role('Regional Market Insight Analyst', 'Market Insights & Research', 'business-intelligence-analytics', 'regional', 'mid', 'office');
SELECT insert_role('Local Market Insight Analyst', 'Market Insights & Research', 'business-intelligence-analytics', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: DATA SCIENCE & ADVANCED ANALYTICS (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Data Science & Advanced Analytics roles...'; END $$;

SELECT insert_role('Global Advanced Data Scientist', 'Data Science & Advanced Analytics', 'business-intelligence-analytics', 'global', 'mid', 'office');
SELECT insert_role('Regional Advanced Data Scientist', 'Data Science & Advanced Analytics', 'business-intelligence-analytics', 'regional', 'mid', 'office');
SELECT insert_role('Local Advanced Data Scientist', 'Data Science & Advanced Analytics', 'business-intelligence-analytics', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: REPORTING & DASHBOARDS (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Reporting & Dashboards roles...'; END $$;

SELECT insert_role('Global BI Reporting Lead', 'Reporting & Dashboards', 'business-intelligence-analytics', 'global', 'senior', 'office');
SELECT insert_role('Regional BI Reporting Lead', 'Reporting & Dashboards', 'business-intelligence-analytics', 'regional', 'senior', 'office');
SELECT insert_role('Local BI Reporting Lead', 'Reporting & Dashboards', 'business-intelligence-analytics', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT: FORECASTING & MODELING (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Forecasting & Modeling roles...'; END $$;

SELECT insert_role('Global Forecasting Manager', 'Forecasting & Modeling', 'business-intelligence-analytics', 'global', 'senior', 'office');
SELECT insert_role('Regional Forecasting Manager', 'Forecasting & Modeling', 'business-intelligence-analytics', 'regional', 'senior', 'office');
SELECT insert_role('Local Forecasting Manager', 'Forecasting & Modeling', 'business-intelligence-analytics', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT: COMPETITIVE INTELLIGENCE (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Competitive Intelligence roles...'; END $$;

SELECT insert_role('Global Competitive Analyst', 'Competitive Intelligence', 'business-intelligence-analytics', 'global', 'mid', 'office');
SELECT insert_role('Regional Competitive Analyst', 'Competitive Intelligence', 'business-intelligence-analytics', 'regional', 'mid', 'office');
SELECT insert_role('Local Competitive Analyst', 'Competitive Intelligence', 'business-intelligence-analytics', 'local', 'mid', 'office');

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
    WHERE f.slug = 'business-intelligence-analytics' 
      AND r.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    SELECT COUNT(DISTINCT d.id) INTO dept_count
    FROM public.org_departments d
    JOIN public.org_functions f ON d.function_id = f.id
    WHERE f.slug = 'business-intelligence-analytics'
      AND d.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'BUSINESS INTELLIGENCE ANALYTICS ROLES CREATED SUCCESSFULLY';
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
WHERE f.slug = 'business-intelligence-analytics'
  AND d.deleted_at IS NULL
  AND f.deleted_at IS NULL
GROUP BY d.name
ORDER BY role_count DESC, d.name;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ Business Intelligence Analytics roles populated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;