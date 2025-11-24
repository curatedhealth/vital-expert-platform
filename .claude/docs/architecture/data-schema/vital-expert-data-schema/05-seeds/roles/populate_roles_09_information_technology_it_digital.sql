-- =====================================================================
-- POPULATE INFORMATION TECHNOLOGY (IT) / DIGITAL ROLES
-- Function: Information Technology (IT) / Digital (6 departments, 18 roles)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING INFORMATION TECHNOLOGY (IT) / DIGITAL ROLES';
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
-- DEPARTMENT: ENTERPRISE APPLICATIONS & ERP (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Enterprise Applications & ERP roles...'; END $$;

SELECT insert_role('Global ERP Manager', 'Enterprise Applications & ERP', 'information-technology-digital', 'global', 'senior', 'office');
SELECT insert_role('Regional ERP Manager', 'Enterprise Applications & ERP', 'information-technology-digital', 'regional', 'senior', 'office');
SELECT insert_role('Local ERP Manager', 'Enterprise Applications & ERP', 'information-technology-digital', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT: DATA & ANALYTICS (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Data & Analytics roles...'; END $$;

SELECT insert_role('Global Data Scientist', 'Data & Analytics', 'information-technology-digital', 'global', 'mid', 'office');
SELECT insert_role('Regional Data Scientist', 'Data & Analytics', 'information-technology-digital', 'regional', 'mid', 'office');
SELECT insert_role('Local Data Scientist', 'Data & Analytics', 'information-technology-digital', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: DIGITAL HEALTH & PLATFORMS (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Digital Health & Platforms roles...'; END $$;

SELECT insert_role('Global Digital Health PM', 'Digital Health & Platforms', 'information-technology-digital', 'global', 'mid', 'remote');
SELECT insert_role('Regional Digital Health PM', 'Digital Health & Platforms', 'information-technology-digital', 'regional', 'mid', 'remote');
SELECT insert_role('Local Digital Health PM', 'Digital Health & Platforms', 'information-technology-digital', 'local', 'mid', 'remote');

-- =====================================================================
-- DEPARTMENT: IT INFRASTRUCTURE & CLOUD (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating IT Infrastructure & Cloud roles...'; END $$;

SELECT insert_role('Global Cloud Engineer', 'IT Infrastructure & Cloud', 'information-technology-digital', 'global', 'mid', 'office');
SELECT insert_role('Regional Cloud Engineer', 'IT Infrastructure & Cloud', 'information-technology-digital', 'regional', 'mid', 'office');
SELECT insert_role('Local Cloud Engineer', 'IT Infrastructure & Cloud', 'information-technology-digital', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: CYBERSECURITY (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Cybersecurity roles...'; END $$;

SELECT insert_role('Global Cybersecurity Analyst', 'Cybersecurity', 'information-technology-digital', 'global', 'mid', 'office');
SELECT insert_role('Regional Cybersecurity Analyst', 'Cybersecurity', 'information-technology-digital', 'regional', 'mid', 'office');
SELECT insert_role('Local Cybersecurity Analyst', 'Cybersecurity', 'information-technology-digital', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: END USER SERVICES & SUPPORT (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating End User Services & Support roles...'; END $$;

SELECT insert_role('Global IT Support Specialist', 'End User Services & Support', 'information-technology-digital', 'global', 'mid', 'office');
SELECT insert_role('Regional IT Support Specialist', 'End User Services & Support', 'information-technology-digital', 'regional', 'mid', 'office');
SELECT insert_role('Local IT Support Specialist', 'End User Services & Support', 'information-technology-digital', 'local', 'mid', 'office');

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
    WHERE f.slug = 'information-technology-digital' 
      AND r.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    SELECT COUNT(DISTINCT d.id) INTO dept_count
    FROM public.org_departments d
    JOIN public.org_functions f ON d.function_id = f.id
    WHERE f.slug = 'information-technology-digital'
      AND d.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'INFORMATION TECHNOLOGY IT DIGITAL ROLES CREATED SUCCESSFULLY';
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
WHERE f.slug = 'information-technology-digital'
  AND d.deleted_at IS NULL
  AND f.deleted_at IS NULL
GROUP BY d.name
ORDER BY role_count DESC, d.name;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ Information Technology It Digital roles populated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;