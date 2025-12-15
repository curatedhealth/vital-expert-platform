-- =====================================================================
-- POPULATE COMMERCIAL ORGANIZATION ROLES
-- Function: Commercial Organization (11 departments, 135 roles)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING COMMERCIAL ORGANIZATION ROLES';
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
-- DEPARTMENT: COMMERCIAL LEADERSHIP & STRATEGY (15 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Commercial Leadership & Strategy roles...'; END $$;

SELECT insert_role('Global Chief Commercial Officer', 'Commercial Leadership & Strategy', 'commercial-organization', 'global', 'c_suite', 'office');
SELECT insert_role('Regional Chief Commercial Officer', 'Commercial Leadership & Strategy', 'commercial-organization', 'regional', 'c_suite', 'office');
SELECT insert_role('Local Chief Commercial Officer', 'Commercial Leadership & Strategy', 'commercial-organization', 'local', 'c_suite', 'office');
SELECT insert_role('Global SVP Commercial', 'Commercial Leadership & Strategy', 'commercial-organization', 'global', 'executive', 'office');
SELECT insert_role('Regional SVP Commercial', 'Commercial Leadership & Strategy', 'commercial-organization', 'regional', 'executive', 'office');
SELECT insert_role('Local SVP Commercial', 'Commercial Leadership & Strategy', 'commercial-organization', 'local', 'executive', 'office');
SELECT insert_role('Global VP Commercial Strategy', 'Commercial Leadership & Strategy', 'commercial-organization', 'global', 'executive', 'office');
SELECT insert_role('Regional VP Commercial Strategy', 'Commercial Leadership & Strategy', 'commercial-organization', 'regional', 'executive', 'office');
SELECT insert_role('Local VP Commercial Strategy', 'Commercial Leadership & Strategy', 'commercial-organization', 'local', 'executive', 'office');
SELECT insert_role('Global Commercial Strategy Director', 'Commercial Leadership & Strategy', 'commercial-organization', 'global', 'director', 'office');
SELECT insert_role('Regional Commercial Strategy Director', 'Commercial Leadership & Strategy', 'commercial-organization', 'regional', 'director', 'office');
SELECT insert_role('Local Commercial Strategy Director', 'Commercial Leadership & Strategy', 'commercial-organization', 'local', 'director', 'office');
SELECT insert_role('Global Strategic Accounts Head', 'Commercial Leadership & Strategy', 'commercial-organization', 'global', 'c_suite', 'office');
SELECT insert_role('Regional Strategic Accounts Head', 'Commercial Leadership & Strategy', 'commercial-organization', 'regional', 'c_suite', 'office');
SELECT insert_role('Local Strategic Accounts Head', 'Commercial Leadership & Strategy', 'commercial-organization', 'local', 'c_suite', 'office');

-- =====================================================================
-- DEPARTMENT: FIELD SALES OPERATIONS (15 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Field Sales Operations roles...'; END $$;

SELECT insert_role('Global National Sales Director', 'Field Sales Operations', 'commercial-organization', 'global', 'director', 'field');
SELECT insert_role('Regional National Sales Director', 'Field Sales Operations', 'commercial-organization', 'regional', 'director', 'field');
SELECT insert_role('Local National Sales Director', 'Field Sales Operations', 'commercial-organization', 'local', 'director', 'field');
SELECT insert_role('Global Regional Sales Manager', 'Field Sales Operations', 'commercial-organization', 'global', 'senior', 'field');
SELECT insert_role('Regional Regional Sales Manager', 'Field Sales Operations', 'commercial-organization', 'regional', 'senior', 'field');
SELECT insert_role('Local Regional Sales Manager', 'Field Sales Operations', 'commercial-organization', 'local', 'senior', 'field');
SELECT insert_role('Global District Sales Manager', 'Field Sales Operations', 'commercial-organization', 'global', 'senior', 'field');
SELECT insert_role('Regional District Sales Manager', 'Field Sales Operations', 'commercial-organization', 'regional', 'senior', 'field');
SELECT insert_role('Local District Sales Manager', 'Field Sales Operations', 'commercial-organization', 'local', 'senior', 'field');
SELECT insert_role('Global Sales Representative', 'Field Sales Operations', 'commercial-organization', 'global', 'mid', 'field');
SELECT insert_role('Regional Sales Representative', 'Field Sales Operations', 'commercial-organization', 'regional', 'mid', 'field');
SELECT insert_role('Local Sales Representative', 'Field Sales Operations', 'commercial-organization', 'local', 'mid', 'field');
SELECT insert_role('Global Sales Territory Lead', 'Field Sales Operations', 'commercial-organization', 'global', 'senior', 'field');
SELECT insert_role('Regional Sales Territory Lead', 'Field Sales Operations', 'commercial-organization', 'regional', 'senior', 'field');
SELECT insert_role('Local Sales Territory Lead', 'Field Sales Operations', 'commercial-organization', 'local', 'senior', 'field');

-- =====================================================================
-- DEPARTMENT: SPECIALTY & HOSPITAL SALES (12 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Specialty & Hospital Sales roles...'; END $$;

SELECT insert_role('Global Specialty Sales Lead', 'Specialty & Hospital Sales', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Specialty Sales Lead', 'Specialty & Hospital Sales', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Specialty Sales Lead', 'Specialty & Hospital Sales', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Hospital Sales Manager', 'Specialty & Hospital Sales', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Hospital Sales Manager', 'Specialty & Hospital Sales', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Hospital Sales Manager', 'Specialty & Hospital Sales', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Hospital Sales Rep', 'Specialty & Hospital Sales', 'commercial-organization', 'global', 'mid', 'office');
SELECT insert_role('Regional Hospital Sales Rep', 'Specialty & Hospital Sales', 'commercial-organization', 'regional', 'mid', 'office');
SELECT insert_role('Local Hospital Sales Rep', 'Specialty & Hospital Sales', 'commercial-organization', 'local', 'mid', 'office');
SELECT insert_role('Global Institutional Accounts Manager', 'Specialty & Hospital Sales', 'commercial-organization', 'global', 'c_suite', 'office');
SELECT insert_role('Regional Institutional Accounts Manager', 'Specialty & Hospital Sales', 'commercial-organization', 'regional', 'c_suite', 'office');
SELECT insert_role('Local Institutional Accounts Manager', 'Specialty & Hospital Sales', 'commercial-organization', 'local', 'c_suite', 'office');

-- =====================================================================
-- DEPARTMENT: KEY ACCOUNT MANAGEMENT (12 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Key Account Management roles...'; END $$;

SELECT insert_role('Global Key Account Manager', 'Key Account Management', 'commercial-organization', 'global', 'c_suite', 'office');
SELECT insert_role('Regional Key Account Manager', 'Key Account Management', 'commercial-organization', 'regional', 'c_suite', 'office');
SELECT insert_role('Local Key Account Manager', 'Key Account Management', 'commercial-organization', 'local', 'c_suite', 'office');
SELECT insert_role('Global KAM Director', 'Key Account Management', 'commercial-organization', 'global', 'director', 'office');
SELECT insert_role('Regional KAM Director', 'Key Account Management', 'commercial-organization', 'regional', 'director', 'office');
SELECT insert_role('Local KAM Director', 'Key Account Management', 'commercial-organization', 'local', 'director', 'office');
SELECT insert_role('Global Strategic Account Manager', 'Key Account Management', 'commercial-organization', 'global', 'c_suite', 'office');
SELECT insert_role('Regional Strategic Account Manager', 'Key Account Management', 'commercial-organization', 'regional', 'c_suite', 'office');
SELECT insert_role('Local Strategic Account Manager', 'Key Account Management', 'commercial-organization', 'local', 'c_suite', 'office');
SELECT insert_role('Global Account Manager - IDNs/GPOs', 'Key Account Management', 'commercial-organization', 'global', 'c_suite', 'office');
SELECT insert_role('Regional Account Manager - IDNs/GPOs', 'Key Account Management', 'commercial-organization', 'regional', 'c_suite', 'office');
SELECT insert_role('Local Account Manager - IDNs/GPOs', 'Key Account Management', 'commercial-organization', 'local', 'c_suite', 'office');

-- =====================================================================
-- DEPARTMENT: CUSTOMER EXPERIENCE (12 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Customer Experience roles...'; END $$;

SELECT insert_role('Global Customer Experience Director', 'Customer Experience', 'commercial-organization', 'global', 'director', 'office');
SELECT insert_role('Regional Customer Experience Director', 'Customer Experience', 'commercial-organization', 'regional', 'director', 'office');
SELECT insert_role('Local Customer Experience Director', 'Customer Experience', 'commercial-organization', 'local', 'director', 'office');
SELECT insert_role('Global CX Program Lead', 'Customer Experience', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional CX Program Lead', 'Customer Experience', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local CX Program Lead', 'Customer Experience', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Customer Success Manager', 'Customer Experience', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Customer Success Manager', 'Customer Experience', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Customer Success Manager', 'Customer Experience', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global CX Insights Analyst', 'Customer Experience', 'commercial-organization', 'global', 'mid', 'office');
SELECT insert_role('Regional CX Insights Analyst', 'Customer Experience', 'commercial-organization', 'regional', 'mid', 'office');
SELECT insert_role('Local CX Insights Analyst', 'Customer Experience', 'commercial-organization', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: COMMERCIAL MARKETING (15 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Commercial Marketing roles...'; END $$;

SELECT insert_role('Global Marketing Director', 'Commercial Marketing', 'commercial-organization', 'global', 'director', 'office');
SELECT insert_role('Regional Marketing Director', 'Commercial Marketing', 'commercial-organization', 'regional', 'director', 'office');
SELECT insert_role('Local Marketing Director', 'Commercial Marketing', 'commercial-organization', 'local', 'director', 'office');
SELECT insert_role('Global Product Manager', 'Commercial Marketing', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Product Manager', 'Commercial Marketing', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Product Manager', 'Commercial Marketing', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Brand Lead', 'Commercial Marketing', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Brand Lead', 'Commercial Marketing', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Brand Lead', 'Commercial Marketing', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Lifecycle Marketing Manager', 'Commercial Marketing', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Lifecycle Marketing Manager', 'Commercial Marketing', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Lifecycle Marketing Manager', 'Commercial Marketing', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Digital Marketing Manager', 'Commercial Marketing', 'commercial-organization', 'global', 'senior', 'remote');
SELECT insert_role('Regional Digital Marketing Manager', 'Commercial Marketing', 'commercial-organization', 'regional', 'senior', 'remote');
SELECT insert_role('Local Digital Marketing Manager', 'Commercial Marketing', 'commercial-organization', 'local', 'senior', 'remote');

-- =====================================================================
-- DEPARTMENT: BUSINESS DEVELOPMENT & LICENSING (12 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Business Development & Licensing roles...'; END $$;

SELECT insert_role('Global Business Development Lead', 'Business Development & Licensing', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Business Development Lead', 'Business Development & Licensing', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Business Development Lead', 'Business Development & Licensing', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Licensing Manager', 'Business Development & Licensing', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Licensing Manager', 'Business Development & Licensing', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Licensing Manager', 'Business Development & Licensing', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Acquisitions Analyst', 'Business Development & Licensing', 'commercial-organization', 'global', 'mid', 'office');
SELECT insert_role('Regional Acquisitions Analyst', 'Business Development & Licensing', 'commercial-organization', 'regional', 'mid', 'office');
SELECT insert_role('Local Acquisitions Analyst', 'Business Development & Licensing', 'commercial-organization', 'local', 'mid', 'office');
SELECT insert_role('Global BD Strategy Director', 'Business Development & Licensing', 'commercial-organization', 'global', 'director', 'office');
SELECT insert_role('Regional BD Strategy Director', 'Business Development & Licensing', 'commercial-organization', 'regional', 'director', 'office');
SELECT insert_role('Local BD Strategy Director', 'Business Development & Licensing', 'commercial-organization', 'local', 'director', 'office');

-- =====================================================================
-- DEPARTMENT: COMMERCIAL ANALYTICS & INSIGHTS (12 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Commercial Analytics & Insights roles...'; END $$;

SELECT insert_role('Global Commercial Data Scientist', 'Commercial Analytics & Insights', 'commercial-organization', 'global', 'mid', 'office');
SELECT insert_role('Regional Commercial Data Scientist', 'Commercial Analytics & Insights', 'commercial-organization', 'regional', 'mid', 'office');
SELECT insert_role('Local Commercial Data Scientist', 'Commercial Analytics & Insights', 'commercial-organization', 'local', 'mid', 'office');
SELECT insert_role('Global Business Insights Lead', 'Commercial Analytics & Insights', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Business Insights Lead', 'Commercial Analytics & Insights', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Business Insights Lead', 'Commercial Analytics & Insights', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Sales Analytics Manager', 'Commercial Analytics & Insights', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Sales Analytics Manager', 'Commercial Analytics & Insights', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Sales Analytics Manager', 'Commercial Analytics & Insights', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Forecasting Analyst', 'Commercial Analytics & Insights', 'commercial-organization', 'global', 'mid', 'office');
SELECT insert_role('Regional Forecasting Analyst', 'Commercial Analytics & Insights', 'commercial-organization', 'regional', 'mid', 'office');
SELECT insert_role('Local Forecasting Analyst', 'Commercial Analytics & Insights', 'commercial-organization', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: SALES TRAINING & ENABLEMENT (9 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Sales Training & Enablement roles...'; END $$;

SELECT insert_role('Global Sales Training Manager', 'Sales Training & Enablement', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Sales Training Manager', 'Sales Training & Enablement', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Sales Training Manager', 'Sales Training & Enablement', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Sales Enablement Lead', 'Sales Training & Enablement', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Sales Enablement Lead', 'Sales Training & Enablement', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Sales Enablement Lead', 'Sales Training & Enablement', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Learning & Development Specialist', 'Sales Training & Enablement', 'commercial-organization', 'global', 'mid', 'office');
SELECT insert_role('Regional Learning & Development Specialist', 'Sales Training & Enablement', 'commercial-organization', 'regional', 'mid', 'office');
SELECT insert_role('Local Learning & Development Specialist', 'Sales Training & Enablement', 'commercial-organization', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: DIGITAL & OMNICHANNEL ENGAGEMENT (12 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Digital & Omnichannel Engagement roles...'; END $$;

SELECT insert_role('Global Omnichannel CRM Manager', 'Digital & Omnichannel Engagement', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Omnichannel CRM Manager', 'Digital & Omnichannel Engagement', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Omnichannel CRM Manager', 'Digital & Omnichannel Engagement', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Digital Engagement Director', 'Digital & Omnichannel Engagement', 'commercial-organization', 'global', 'director', 'remote');
SELECT insert_role('Regional Digital Engagement Director', 'Digital & Omnichannel Engagement', 'commercial-organization', 'regional', 'director', 'remote');
SELECT insert_role('Local Digital Engagement Director', 'Digital & Omnichannel Engagement', 'commercial-organization', 'local', 'director', 'remote');
SELECT insert_role('Global Multichannel Ops Lead', 'Digital & Omnichannel Engagement', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Multichannel Ops Lead', 'Digital & Omnichannel Engagement', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Multichannel Ops Lead', 'Digital & Omnichannel Engagement', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Remote Sales Lead', 'Digital & Omnichannel Engagement', 'commercial-organization', 'global', 'senior', 'remote');
SELECT insert_role('Regional Remote Sales Lead', 'Digital & Omnichannel Engagement', 'commercial-organization', 'regional', 'senior', 'remote');
SELECT insert_role('Local Remote Sales Lead', 'Digital & Omnichannel Engagement', 'commercial-organization', 'local', 'senior', 'remote');

-- =====================================================================
-- DEPARTMENT: COMPLIANCE & COMMERCIAL OPERATIONS (9 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Compliance & Commercial Operations roles...'; END $$;

SELECT insert_role('Global Commercial Compliance Officer', 'Compliance & Commercial Operations', 'commercial-organization', 'global', 'mid', 'office');
SELECT insert_role('Regional Commercial Compliance Officer', 'Compliance & Commercial Operations', 'commercial-organization', 'regional', 'mid', 'office');
SELECT insert_role('Local Commercial Compliance Officer', 'Compliance & Commercial Operations', 'commercial-organization', 'local', 'mid', 'office');
SELECT insert_role('Global Commercial Operations Manager', 'Compliance & Commercial Operations', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Commercial Operations Manager', 'Compliance & Commercial Operations', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Commercial Operations Manager', 'Compliance & Commercial Operations', 'commercial-organization', 'local', 'senior', 'office');
SELECT insert_role('Global Compliance Review Lead', 'Compliance & Commercial Operations', 'commercial-organization', 'global', 'senior', 'office');
SELECT insert_role('Regional Compliance Review Lead', 'Compliance & Commercial Operations', 'commercial-organization', 'regional', 'senior', 'office');
SELECT insert_role('Local Compliance Review Lead', 'Compliance & Commercial Operations', 'commercial-organization', 'local', 'senior', 'office');

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
    WHERE f.slug = 'commercial-organization' 
      AND r.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    SELECT COUNT(DISTINCT d.id) INTO dept_count
    FROM public.org_departments d
    JOIN public.org_functions f ON d.function_id = f.id
    WHERE f.slug = 'commercial-organization'
      AND d.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'COMMERCIAL ORGANIZATION ROLES CREATED SUCCESSFULLY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Total Commercial Organization Roles: %', role_count;
    RAISE NOTICE 'Total Commercial Organization Departments: %', dept_count;
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
WHERE f.slug = 'commercial-organization'
  AND d.deleted_at IS NULL
  AND f.deleted_at IS NULL
GROUP BY d.name
ORDER BY role_count DESC, d.name;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ Commercial Organization roles populated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Step: Run populate_roles_04_regulatory_affairs.sql';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;
