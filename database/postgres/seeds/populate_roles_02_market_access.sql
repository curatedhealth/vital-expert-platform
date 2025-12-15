-- =====================================================================
-- POPULATE MARKET ACCESS ROLES
-- Function: Market Access (10 departments, 135 roles)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING MARKET ACCESS ROLES';
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

-- Leadership & Strategy (12 roles)
DO $$ BEGIN RAISE NOTICE 'Creating Leadership & Strategy roles...'; END $$;
SELECT insert_role('Global VP Market Access', 'Leadership & Strategy', 'market-access', 'global', 'executive', 'office');
SELECT insert_role('Regional VP Market Access', 'Leadership & Strategy', 'market-access', 'regional', 'executive', 'office');
SELECT insert_role('Local VP Market Access', 'Leadership & Strategy', 'market-access', 'local', 'executive', 'office');
SELECT insert_role('Global Chief Market Access Officer', 'Leadership & Strategy', 'market-access', 'global', 'c_suite', 'office');
SELECT insert_role('Regional Chief Market Access Officer', 'Leadership & Strategy', 'market-access', 'regional', 'c_suite', 'office');
SELECT insert_role('Local Chief Market Access Officer', 'Leadership & Strategy', 'market-access', 'local', 'executive', 'office');
SELECT insert_role('Global Market Access Director', 'Leadership & Strategy', 'market-access', 'global', 'director', 'office');
SELECT insert_role('Regional Market Access Director', 'Leadership & Strategy', 'market-access', 'regional', 'director', 'office');
SELECT insert_role('Local Market Access Director', 'Leadership & Strategy', 'market-access', 'local', 'director', 'office');
SELECT insert_role('Global Head Market Access', 'Leadership & Strategy', 'market-access', 'global', 'director', 'office');
SELECT insert_role('Regional Head Market Access', 'Leadership & Strategy', 'market-access', 'regional', 'director', 'office');
SELECT insert_role('Local Head Market Access', 'Leadership & Strategy', 'market-access', 'local', 'director', 'office');

-- HEOR (15 roles)
DO $$ BEGIN RAISE NOTICE 'Creating HEOR roles...'; END $$;
SELECT insert_role('Global HEOR Director', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'global', 'director', 'office');
SELECT insert_role('Regional HEOR Director', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'regional', 'director', 'office');
SELECT insert_role('Local HEOR Director', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'local', 'director', 'office');
SELECT insert_role('Global HEOR Manager', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'global', 'senior', 'office');
SELECT insert_role('Regional HEOR Manager', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'regional', 'senior', 'office');
SELECT insert_role('Local HEOR Manager', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'local', 'senior', 'office');
SELECT insert_role('Global HEOR Project Lead', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'global', 'senior', 'office');
SELECT insert_role('Regional HEOR Project Lead', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'regional', 'senior', 'office');
SELECT insert_role('Local HEOR Project Lead', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'local', 'senior', 'office');
SELECT insert_role('Global HEOR Analyst', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'global', 'mid', 'office');
SELECT insert_role('Regional HEOR Analyst', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'regional', 'mid', 'office');
SELECT insert_role('Local HEOR Analyst', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'local', 'mid', 'office');
SELECT insert_role('Global Outcomes Research Scientist', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'global', 'senior', 'office');
SELECT insert_role('Regional Outcomes Research Scientist', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'regional', 'senior', 'office');
SELECT insert_role('Local Outcomes Research Scientist', 'HEOR (Health Economics & Outcomes Research)', 'market-access', 'local', 'senior', 'office');

-- Value, Evidence & Outcomes (12 roles)
DO $$ BEGIN RAISE NOTICE 'Creating Value, Evidence & Outcomes roles...'; END $$;
SELECT insert_role('Global Value Evidence Lead', 'Value, Evidence & Outcomes', 'market-access', 'global', 'senior', 'office');
SELECT insert_role('Regional Value Evidence Lead', 'Value, Evidence & Outcomes', 'market-access', 'regional', 'senior', 'office');
SELECT insert_role('Local Value Evidence Lead', 'Value, Evidence & Outcomes', 'market-access', 'local', 'senior', 'office');
SELECT insert_role('Global Evidence Synthesis Scientist', 'Value, Evidence & Outcomes', 'market-access', 'global', 'senior', 'office');
SELECT insert_role('Regional Evidence Synthesis Scientist', 'Value, Evidence & Outcomes', 'market-access', 'regional', 'senior', 'office');
SELECT insert_role('Local Evidence Synthesis Scientist', 'Value, Evidence & Outcomes', 'market-access', 'local', 'senior', 'office');
SELECT insert_role('Global HTA Specialist', 'Value, Evidence & Outcomes', 'market-access', 'global', 'mid', 'hybrid');
SELECT insert_role('Regional HTA Specialist', 'Value, Evidence & Outcomes', 'market-access', 'regional', 'mid', 'hybrid');
SELECT insert_role('Local HTA Specialist', 'Value, Evidence & Outcomes', 'market-access', 'local', 'mid', 'hybrid');
SELECT insert_role('Global Value Proposition Lead', 'Value, Evidence & Outcomes', 'market-access', 'global', 'senior', 'office');
SELECT insert_role('Regional Value Proposition Lead', 'Value, Evidence & Outcomes', 'market-access', 'regional', 'senior', 'office');
SELECT insert_role('Local Value Proposition Lead', 'Value, Evidence & Outcomes', 'market-access', 'local', 'senior', 'office');

-- Pricing & Reimbursement (15 roles)
DO $$ BEGIN RAISE NOTICE 'Creating Pricing & Reimbursement roles...'; END $$;
SELECT insert_role('Global Pricing Manager', 'Pricing & Reimbursement', 'market-access', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional Pricing Manager', 'Pricing & Reimbursement', 'market-access', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local Pricing Manager', 'Pricing & Reimbursement', 'market-access', 'local', 'senior', 'hybrid');
SELECT insert_role('Global Global Pricing Lead', 'Pricing & Reimbursement', 'market-access', 'global', 'senior', 'office');
SELECT insert_role('Regional Global Pricing Lead', 'Pricing & Reimbursement', 'market-access', 'regional', 'senior', 'office');
SELECT insert_role('Local Global Pricing Lead', 'Pricing & Reimbursement', 'market-access', 'local', 'senior', 'office');
SELECT insert_role('Global Reimbursement Manager', 'Pricing & Reimbursement', 'market-access', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional Reimbursement Manager', 'Pricing & Reimbursement', 'market-access', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local Reimbursement Manager', 'Pricing & Reimbursement', 'market-access', 'local', 'senior', 'hybrid');
SELECT insert_role('Global Value & Pricing Analyst', 'Pricing & Reimbursement', 'market-access', 'global', 'mid', 'office');
SELECT insert_role('Regional Value & Pricing Analyst', 'Pricing & Reimbursement', 'market-access', 'regional', 'mid', 'office');
SELECT insert_role('Local Value & Pricing Analyst', 'Pricing & Reimbursement', 'market-access', 'local', 'mid', 'office');
SELECT insert_role('Global HTA Access Lead', 'Pricing & Reimbursement', 'market-access', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional HTA Access Lead', 'Pricing & Reimbursement', 'market-access', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local HTA Access Lead', 'Pricing & Reimbursement', 'market-access', 'local', 'senior', 'hybrid');

-- Payer Relations & Contracting (12 roles)
DO $$ BEGIN RAISE NOTICE 'Creating Payer Relations & Contracting roles...'; END $$;
SELECT insert_role('Global Payer Strategy Lead', 'Payer Relations & Contracting', 'market-access', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional Payer Strategy Lead', 'Payer Relations & Contracting', 'market-access', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local Payer Strategy Lead', 'Payer Relations & Contracting', 'market-access', 'local', 'senior', 'hybrid');
SELECT insert_role('Global Payer Relations Manager', 'Payer Relations & Contracting', 'market-access', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional Payer Relations Manager', 'Payer Relations & Contracting', 'market-access', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local Payer Relations Manager', 'Payer Relations & Contracting', 'market-access', 'local', 'senior', 'hybrid');
SELECT insert_role('Global Contract Strategy Lead', 'Payer Relations & Contracting', 'market-access', 'global', 'senior', 'office');
SELECT insert_role('Regional Contract Strategy Lead', 'Payer Relations & Contracting', 'market-access', 'regional', 'senior', 'office');
SELECT insert_role('Local Contract Strategy Lead', 'Payer Relations & Contracting', 'market-access', 'local', 'senior', 'office');
SELECT insert_role('Global Access Contract Analyst', 'Payer Relations & Contracting', 'market-access', 'global', 'mid', 'office');
SELECT insert_role('Regional Access Contract Analyst', 'Payer Relations & Contracting', 'market-access', 'regional', 'mid', 'office');
SELECT insert_role('Local Access Contract Analyst', 'Payer Relations & Contracting', 'market-access', 'local', 'mid', 'office');

-- Patient Access & Services (12 roles)
DO $$ BEGIN RAISE NOTICE 'Creating Patient Access & Services roles...'; END $$;
SELECT insert_role('Global Patient Access Manager', 'Patient Access & Services', 'market-access', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional Patient Access Manager', 'Patient Access & Services', 'market-access', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local Patient Access Manager', 'Patient Access & Services', 'market-access', 'local', 'senior', 'hybrid');
SELECT insert_role('Global Patient Support Lead', 'Patient Access & Services', 'market-access', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional Patient Support Lead', 'Patient Access & Services', 'market-access', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local Patient Support Lead', 'Patient Access & Services', 'market-access', 'local', 'senior', 'hybrid');
SELECT insert_role('Global Access Programs Analyst', 'Patient Access & Services', 'market-access', 'global', 'mid', 'office');
SELECT insert_role('Regional Access Programs Analyst', 'Patient Access & Services', 'market-access', 'regional', 'mid', 'office');
SELECT insert_role('Local Access Programs Analyst', 'Patient Access & Services', 'market-access', 'local', 'mid', 'office');
SELECT insert_role('Global Patient Journey Lead', 'Patient Access & Services', 'market-access', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional Patient Journey Lead', 'Patient Access & Services', 'market-access', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local Patient Journey Lead', 'Patient Access & Services', 'market-access', 'local', 'senior', 'hybrid');

-- Government & Policy Affairs (12 roles)
DO $$ BEGIN RAISE NOTICE 'Creating Government & Policy Affairs roles...'; END $$;
SELECT insert_role('Global Government Affairs Director', 'Government & Policy Affairs', 'market-access', 'global', 'director', 'hybrid');
SELECT insert_role('Regional Government Affairs Director', 'Government & Policy Affairs', 'market-access', 'regional', 'director', 'hybrid');
SELECT insert_role('Local Government Affairs Director', 'Government & Policy Affairs', 'market-access', 'local', 'director', 'hybrid');
SELECT insert_role('Global Policy Analyst', 'Government & Policy Affairs', 'market-access', 'global', 'mid', 'office');
SELECT insert_role('Regional Policy Analyst', 'Government & Policy Affairs', 'market-access', 'regional', 'mid', 'office');
SELECT insert_role('Local Policy Analyst', 'Government & Policy Affairs', 'market-access', 'local', 'mid', 'office');
SELECT insert_role('Global Access Policy Lead', 'Government & Policy Affairs', 'market-access', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional Access Policy Lead', 'Government & Policy Affairs', 'market-access', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local Access Policy Lead', 'Government & Policy Affairs', 'market-access', 'local', 'senior', 'hybrid');
SELECT insert_role('Global Public Affairs Lead', 'Government & Policy Affairs', 'market-access', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional Public Affairs Lead', 'Government & Policy Affairs', 'market-access', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local Public Affairs Lead', 'Government & Policy Affairs', 'market-access', 'local', 'senior', 'hybrid');

-- Trade & Distribution (12 roles)
DO $$ BEGIN RAISE NOTICE 'Creating Trade & Distribution roles...'; END $$;
SELECT insert_role('Global Trade Director', 'Trade & Distribution', 'market-access', 'global', 'director', 'hybrid');
SELECT insert_role('Regional Trade Director', 'Trade & Distribution', 'market-access', 'regional', 'director', 'hybrid');
SELECT insert_role('Local Trade Director', 'Trade & Distribution', 'market-access', 'local', 'director', 'hybrid');
SELECT insert_role('Global Distribution Manager', 'Trade & Distribution', 'market-access', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional Distribution Manager', 'Trade & Distribution', 'market-access', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local Distribution Manager', 'Trade & Distribution', 'market-access', 'local', 'senior', 'hybrid');
SELECT insert_role('Global Wholesale Channel Lead', 'Trade & Distribution', 'market-access', 'global', 'senior', 'hybrid');
SELECT insert_role('Regional Wholesale Channel Lead', 'Trade & Distribution', 'market-access', 'regional', 'senior', 'hybrid');
SELECT insert_role('Local Wholesale Channel Lead', 'Trade & Distribution', 'market-access', 'local', 'senior', 'hybrid');
SELECT insert_role('Global Trade Operations Analyst', 'Trade & Distribution', 'market-access', 'global', 'mid', 'office');
SELECT insert_role('Regional Trade Operations Analyst', 'Trade & Distribution', 'market-access', 'regional', 'mid', 'office');
SELECT insert_role('Local Trade Operations Analyst', 'Trade & Distribution', 'market-access', 'local', 'mid', 'office');

-- Analytics & Insights (12 roles)
DO $$ BEGIN RAISE NOTICE 'Creating Analytics & Insights roles...'; END $$;
SELECT insert_role('Global Market Access Analyst', 'Analytics & Insights', 'market-access', 'global', 'mid', 'office');
SELECT insert_role('Regional Market Access Analyst', 'Analytics & Insights', 'market-access', 'regional', 'mid', 'office');
SELECT insert_role('Local Market Access Analyst', 'Analytics & Insights', 'market-access', 'local', 'mid', 'office');
SELECT insert_role('Global Data Insights Lead', 'Analytics & Insights', 'market-access', 'global', 'senior', 'office');
SELECT insert_role('Regional Data Insights Lead', 'Analytics & Insights', 'market-access', 'regional', 'senior', 'office');
SELECT insert_role('Local Data Insights Lead', 'Analytics & Insights', 'market-access', 'local', 'senior', 'office');
SELECT insert_role('Global Access Data Scientist', 'Analytics & Insights', 'market-access', 'global', 'senior', 'office');
SELECT insert_role('Regional Access Data Scientist', 'Analytics & Insights', 'market-access', 'regional', 'senior', 'office');
SELECT insert_role('Local Access Data Scientist', 'Analytics & Insights', 'market-access', 'local', 'senior', 'office');
SELECT insert_role('Global Insights Manager', 'Analytics & Insights', 'market-access', 'global', 'senior', 'office');
SELECT insert_role('Regional Insights Manager', 'Analytics & Insights', 'market-access', 'regional', 'senior', 'office');
SELECT insert_role('Local Insights Manager', 'Analytics & Insights', 'market-access', 'local', 'senior', 'office');

-- Operations & Excellence (9 roles)
DO $$ BEGIN RAISE NOTICE 'Creating Operations & Excellence roles...'; END $$;
SELECT insert_role('Global Market Access Operations Lead', 'Operations & Excellence', 'market-access', 'global', 'senior', 'office');
SELECT insert_role('Regional Market Access Operations Lead', 'Operations & Excellence', 'market-access', 'regional', 'senior', 'office');
SELECT insert_role('Local Market Access Operations Lead', 'Operations & Excellence', 'market-access', 'local', 'senior', 'office');
SELECT insert_role('Global Access Process Excellence Manager', 'Operations & Excellence', 'market-access', 'global', 'senior', 'office');
SELECT insert_role('Regional Access Process Excellence Manager', 'Operations & Excellence', 'market-access', 'regional', 'senior', 'office');
SELECT insert_role('Local Access Process Excellence Manager', 'Operations & Excellence', 'market-access', 'local', 'senior', 'office');
SELECT insert_role('Global Operations Excellence Officer', 'Operations & Excellence', 'market-access', 'global', 'senior', 'office');
SELECT insert_role('Regional Operations Excellence Officer', 'Operations & Excellence', 'market-access', 'regional', 'senior', 'office');
SELECT insert_role('Local Operations Excellence Officer', 'Operations & Excellence', 'market-access', 'local', 'senior', 'office');

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
    WHERE f.slug = 'market-access' 
      AND r.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    SELECT COUNT(DISTINCT d.id) INTO dept_count
    FROM public.org_departments d
    JOIN public.org_functions f ON d.function_id = f.id
    WHERE f.slug = 'market-access'
      AND d.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MARKET ACCESS ROLES CREATED SUCCESSFULLY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Total Market Access Roles: %', role_count;
    RAISE NOTICE 'Total Market Access Departments: %', dept_count;
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
WHERE f.slug = 'market-access'
  AND d.deleted_at IS NULL
  AND f.deleted_at IS NULL
GROUP BY d.name
ORDER BY role_count DESC, d.name;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ Market Access roles populated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Step: Run populate_roles_03_commercial_organization.sql';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

