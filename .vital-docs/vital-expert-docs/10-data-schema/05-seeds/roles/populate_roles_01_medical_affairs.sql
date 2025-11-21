-- =====================================================================
-- POPULATE MEDICAL AFFAIRS ROLES
-- Function: Medical Affairs (9 departments, 135 roles)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING MEDICAL AFFAIRS ROLES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- HELPER FUNCTION: Insert Role
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
    -- Get function ID
    SELECT id INTO v_function_id
    FROM public.org_functions
    WHERE slug = p_function_slug AND deleted_at IS NULL;
    
    IF v_function_id IS NULL THEN
        RAISE EXCEPTION 'Function not found: %', p_function_slug;
    END IF;
    
    -- Get department ID
    SELECT id INTO v_department_id
    FROM public.org_departments
    WHERE function_id = v_function_id 
      AND name = p_department_name 
      AND deleted_at IS NULL;
    
    IF v_department_id IS NULL THEN
        RAISE EXCEPTION 'Department not found: % in function %', p_department_name, p_function_slug;
    END IF;
    
    -- Generate slug
    v_slug := generate_slug(p_name);
    
    -- Insert or update role
    INSERT INTO public.org_roles (
        name, slug, function_id, department_id, geographic_scope,
        seniority_level, role_category
    ) VALUES (
        p_name, v_slug, v_function_id, v_department_id, p_geographic_scope,
        p_seniority_level, p_role_category
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
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- DEPARTMENT 1: FIELD MEDICAL (15 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Field Medical roles...'; END $$;

SELECT insert_role('Global Medical Science Liaison (MSL)', 'Field Medical', 'medical-affairs', 'global', 'mid', 'field');
SELECT insert_role('Regional Medical Science Liaison (MSL)', 'Field Medical', 'medical-affairs', 'regional', 'mid', 'field');
SELECT insert_role('Local Medical Science Liaison (MSL)', 'Field Medical', 'medical-affairs', 'local', 'mid', 'field');
SELECT insert_role('Global Senior MSL', 'Field Medical', 'medical-affairs', 'global', 'senior', 'field');
SELECT insert_role('Regional Senior MSL', 'Field Medical', 'medical-affairs', 'regional', 'senior', 'field');
SELECT insert_role('Local Senior MSL', 'Field Medical', 'medical-affairs', 'local', 'senior', 'field');
SELECT insert_role('Global Field Medical Director', 'Field Medical', 'medical-affairs', 'global', 'director', 'hybrid');
SELECT insert_role('Regional Field Medical Director', 'Field Medical', 'medical-affairs', 'regional', 'director', 'hybrid');
SELECT insert_role('Local Field Medical Director', 'Field Medical', 'medical-affairs', 'local', 'director', 'hybrid');
SELECT insert_role('Global Field Team Lead', 'Field Medical', 'medical-affairs', 'global', 'senior', 'field');
SELECT insert_role('Regional Field Team Lead', 'Field Medical', 'medical-affairs', 'regional', 'senior', 'field');
SELECT insert_role('Local Field Team Lead', 'Field Medical', 'medical-affairs', 'local', 'senior', 'field');
SELECT insert_role('Global Medical Scientific Manager', 'Field Medical', 'medical-affairs', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional Medical Scientific Manager', 'Field Medical', 'medical-affairs', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local Medical Scientific Manager', 'Field Medical', 'medical-affairs', 'local', 'senior', 'hybrid');

-- =====================================================================
-- DEPARTMENT 2: MEDICAL INFORMATION SERVICES (15 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Medical Information Services roles...'; END $$;

SELECT insert_role('Global Medical Information Specialist', 'Medical Information Services', 'medical-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Medical Information Specialist', 'Medical Information Services', 'medical-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Medical Information Specialist', 'Medical Information Services', 'medical-affairs', 'local', 'mid', 'office');
SELECT insert_role('Global Medical Information Manager', 'Medical Information Services', 'medical-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Medical Information Manager', 'Medical Information Services', 'medical-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Medical Information Manager', 'Medical Information Services', 'medical-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global MI Operations Lead', 'Medical Information Services', 'medical-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional MI Operations Lead', 'Medical Information Services', 'medical-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local MI Operations Lead', 'Medical Information Services', 'medical-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Medical Info Associate', 'Medical Information Services', 'medical-affairs', 'global', 'entry', 'office');
SELECT insert_role('Regional Medical Info Associate', 'Medical Information Services', 'medical-affairs', 'regional', 'entry', 'office');
SELECT insert_role('Local Medical Info Associate', 'Medical Information Services', 'medical-affairs', 'local', 'entry', 'office');
SELECT insert_role('Global Medical Info Scientist', 'Medical Information Services', 'medical-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Medical Info Scientist', 'Medical Information Services', 'medical-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Medical Info Scientist', 'Medical Information Services', 'medical-affairs', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT 3: SCIENTIFIC COMMUNICATIONS (15 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Scientific Communications roles...'; END $$;

SELECT insert_role('Global Scientific Communications Manager', 'Scientific Communications', 'medical-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Scientific Communications Manager', 'Scientific Communications', 'medical-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Scientific Communications Manager', 'Scientific Communications', 'medical-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Medical Writer', 'Scientific Communications', 'medical-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Medical Writer', 'Scientific Communications', 'medical-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Medical Writer', 'Scientific Communications', 'medical-affairs', 'local', 'mid', 'office');
SELECT insert_role('Global Publications Lead', 'Scientific Communications', 'medical-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Publications Lead', 'Scientific Communications', 'medical-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Publications Lead', 'Scientific Communications', 'medical-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Scientific Affairs Lead', 'Scientific Communications', 'medical-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Scientific Affairs Lead', 'Scientific Communications', 'medical-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Scientific Affairs Lead', 'Scientific Communications', 'medical-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Medical Communications Specialist', 'Scientific Communications', 'medical-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Medical Communications Specialist', 'Scientific Communications', 'medical-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Medical Communications Specialist', 'Scientific Communications', 'medical-affairs', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT 4: MEDICAL EDUCATION (12 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Medical Education roles...'; END $$;

SELECT insert_role('Global Medical Education Manager', 'Medical Education', 'medical-affairs', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional Medical Education Manager', 'Medical Education', 'medical-affairs', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local Medical Education Manager', 'Medical Education', 'medical-affairs', 'local', 'senior', 'hybrid');
SELECT insert_role('Global Medical Education Strategist', 'Medical Education', 'medical-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Medical Education Strategist', 'Medical Education', 'medical-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Medical Education Strategist', 'Medical Education', 'medical-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Digital Medical Education Lead', 'Medical Education', 'medical-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Digital Medical Education Lead', 'Medical Education', 'medical-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Digital Medical Education Lead', 'Medical Education', 'medical-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Scientific Trainer', 'Medical Education', 'medical-affairs', 'global', 'mid', 'hybrid');
SELECT insert_role('Regional Scientific Trainer', 'Medical Education', 'medical-affairs', 'regional', 'mid', 'hybrid');
SELECT insert_role('Local Scientific Trainer', 'Medical Education', 'medical-affairs', 'local', 'mid', 'hybrid');

-- =====================================================================
-- DEPARTMENT 5: HEOR & EVIDENCE (15 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating HEOR & Evidence roles...'; END $$;

SELECT insert_role('Global HEOR Director', 'HEOR & Evidence', 'medical-affairs', 'global', 'director', 'office');
SELECT insert_role('Regional HEOR Director', 'HEOR & Evidence', 'medical-affairs', 'regional', 'director', 'office');
SELECT insert_role('Local HEOR Director', 'HEOR & Evidence', 'medical-affairs', 'local', 'director', 'office');
SELECT insert_role('Global HEOR Manager', 'HEOR & Evidence', 'medical-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional HEOR Manager', 'HEOR & Evidence', 'medical-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local HEOR Manager', 'HEOR & Evidence', 'medical-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Real-World Evidence Lead', 'HEOR & Evidence', 'medical-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Real-World Evidence Lead', 'HEOR & Evidence', 'medical-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Real-World Evidence Lead', 'HEOR & Evidence', 'medical-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global HEOR Project Manager', 'HEOR & Evidence', 'medical-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional HEOR Project Manager', 'HEOR & Evidence', 'medical-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local HEOR Project Manager', 'HEOR & Evidence', 'medical-affairs', 'local', 'mid', 'office');
SELECT insert_role('Global Economic Modeler', 'HEOR & Evidence', 'medical-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Economic Modeler', 'HEOR & Evidence', 'medical-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Economic Modeler', 'HEOR & Evidence', 'medical-affairs', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT 6: PUBLICATIONS (9 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Publications roles...'; END $$;

SELECT insert_role('Global Publications Manager', 'Publications', 'medical-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Publications Manager', 'Publications', 'medical-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Publications Manager', 'Publications', 'medical-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Publications Lead', 'Publications', 'medical-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Publications Lead', 'Publications', 'medical-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Publications Lead', 'Publications', 'medical-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Publication Planner', 'Publications', 'medical-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Publication Planner', 'Publications', 'medical-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Publication Planner', 'Publications', 'medical-affairs', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT 7: MEDICAL LEADERSHIP (12 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Medical Leadership roles...'; END $$;

SELECT insert_role('Global Chief Medical Officer', 'Medical Leadership', 'medical-affairs', 'global', 'c_suite', 'office');
SELECT insert_role('Regional Chief Medical Officer', 'Medical Leadership', 'medical-affairs', 'regional', 'c_suite', 'office');
SELECT insert_role('Local Chief Medical Officer', 'Medical Leadership', 'medical-affairs', 'local', 'executive', 'office');
SELECT insert_role('Global VP Medical Affairs', 'Medical Leadership', 'medical-affairs', 'global', 'executive', 'office');
SELECT insert_role('Regional VP Medical Affairs', 'Medical Leadership', 'medical-affairs', 'regional', 'executive', 'office');
SELECT insert_role('Local VP Medical Affairs', 'Medical Leadership', 'medical-affairs', 'local', 'executive', 'office');
SELECT insert_role('Global Medical Affairs Director', 'Medical Leadership', 'medical-affairs', 'global', 'director', 'office');
SELECT insert_role('Regional Medical Affairs Director', 'Medical Leadership', 'medical-affairs', 'regional', 'director', 'office');
SELECT insert_role('Local Medical Affairs Director', 'Medical Leadership', 'medical-affairs', 'local', 'director', 'office');
SELECT insert_role('Global Senior Medical Director', 'Medical Leadership', 'medical-affairs', 'global', 'director', 'office');
SELECT insert_role('Regional Senior Medical Director', 'Medical Leadership', 'medical-affairs', 'regional', 'director', 'office');
SELECT insert_role('Local Senior Medical Director', 'Medical Leadership', 'medical-affairs', 'local', 'director', 'office');

-- =====================================================================
-- DEPARTMENT 8: CLINICAL OPERATIONS SUPPORT (9 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Clinical Operations Support roles...'; END $$;

SELECT insert_role('Global Clinical Operations Liaison', 'Clinical Operations Support', 'medical-affairs', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional Clinical Operations Liaison', 'Clinical Operations Support', 'medical-affairs', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local Clinical Operations Liaison', 'Clinical Operations Support', 'medical-affairs', 'local', 'senior', 'hybrid');
SELECT insert_role('Global Clinical Ops Support Analyst', 'Clinical Operations Support', 'medical-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Clinical Ops Support Analyst', 'Clinical Operations Support', 'medical-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Clinical Ops Support Analyst', 'Clinical Operations Support', 'medical-affairs', 'local', 'mid', 'office');
SELECT insert_role('Global Medical Liaison Clinical Trials', 'Clinical Operations Support', 'medical-affairs', 'global', 'mid', 'hybrid');
SELECT insert_role('Regional Medical Liaison Clinical Trials', 'Clinical Operations Support', 'medical-affairs', 'regional', 'mid', 'hybrid');
SELECT insert_role('Local Medical Liaison Clinical Trials', 'Clinical Operations Support', 'medical-affairs', 'local', 'mid', 'hybrid');

-- =====================================================================
-- DEPARTMENT 9: MEDICAL EXCELLENCE & COMPLIANCE (9 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Medical Excellence & Compliance roles...'; END $$;

SELECT insert_role('Global Medical Excellence Lead', 'Medical Excellence & Compliance', 'medical-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Medical Excellence Lead', 'Medical Excellence & Compliance', 'medical-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Medical Excellence Lead', 'Medical Excellence & Compliance', 'medical-affairs', 'local', 'senior', 'office');
SELECT insert_role('Global Compliance Specialist', 'Medical Excellence & Compliance', 'medical-affairs', 'global', 'mid', 'office');
SELECT insert_role('Regional Compliance Specialist', 'Medical Excellence & Compliance', 'medical-affairs', 'regional', 'mid', 'office');
SELECT insert_role('Local Compliance Specialist', 'Medical Excellence & Compliance', 'medical-affairs', 'local', 'mid', 'office');
SELECT insert_role('Global Medical Governance Officer', 'Medical Excellence & Compliance', 'medical-affairs', 'global', 'senior', 'office');
SELECT insert_role('Regional Medical Governance Officer', 'Medical Excellence & Compliance', 'medical-affairs', 'regional', 'senior', 'office');
SELECT insert_role('Local Medical Governance Officer', 'Medical Excellence & Compliance', 'medical-affairs', 'local', 'senior', 'office');

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
    WHERE f.slug = 'medical-affairs' 
      AND r.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    SELECT COUNT(DISTINCT d.id) INTO dept_count
    FROM public.org_departments d
    JOIN public.org_functions f ON d.function_id = f.id
    WHERE f.slug = 'medical-affairs'
      AND d.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MEDICAL AFFAIRS ROLES CREATED SUCCESSFULLY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Total Medical Affairs Roles: %', role_count;
    RAISE NOTICE 'Total Medical Affairs Departments: %', dept_count;
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
WHERE f.slug = 'medical-affairs'
  AND d.deleted_at IS NULL
  AND f.deleted_at IS NULL
GROUP BY d.name
ORDER BY role_count DESC, d.name;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ Medical Affairs roles populated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Step: Run populate_roles_02_market_access.sql';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

