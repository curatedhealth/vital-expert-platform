-- =====================================================================
-- POPULATE MANUFACTURING & SUPPLY CHAIN ROLES
-- Function: Manufacturing & Supply Chain (6 departments, 27 roles)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING MANUFACTURING & SUPPLY CHAIN ROLES';
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
-- DEPARTMENT: TECHNICAL OPERATIONS (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Technical Operations roles...'; END $$;

SELECT insert_role('Global Tech Ops Manager', 'Technical Operations', 'manufacturing-supply-chain', 'global', 'senior', 'office');
SELECT insert_role('Regional Tech Ops Manager', 'Technical Operations', 'manufacturing-supply-chain', 'regional', 'senior', 'office');
SELECT insert_role('Local Tech Ops Manager', 'Technical Operations', 'manufacturing-supply-chain', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT: MANUFACTURING (SMALL MOLECULE/BIOTECH) (6 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Manufacturing (Small Molecule/Biotech) roles...'; END $$;

SELECT insert_role('Global Plant Manager', 'Manufacturing (Small Molecule/Biotech)', 'manufacturing-supply-chain', 'global', 'senior', 'office');
SELECT insert_role('Regional Plant Manager', 'Manufacturing (Small Molecule/Biotech)', 'manufacturing-supply-chain', 'regional', 'senior', 'office');
SELECT insert_role('Local Plant Manager', 'Manufacturing (Small Molecule/Biotech)', 'manufacturing-supply-chain', 'local', 'senior', 'office');
SELECT insert_role('Global Biotech Manufacturing Lead', 'Manufacturing (Small Molecule/Biotech)', 'manufacturing-supply-chain', 'global', 'senior', 'office');
SELECT insert_role('Regional Biotech Manufacturing Lead', 'Manufacturing (Small Molecule/Biotech)', 'manufacturing-supply-chain', 'regional', 'senior', 'office');
SELECT insert_role('Local Biotech Manufacturing Lead', 'Manufacturing (Small Molecule/Biotech)', 'manufacturing-supply-chain', 'local', 'senior', 'office');

-- =====================================================================
-- DEPARTMENT: QUALITY ASSURANCE / QUALITY CONTROL (6 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Quality Assurance / Quality Control roles...'; END $$;

SELECT insert_role('Global QA Manager', 'Quality Assurance / Quality Control', 'manufacturing-supply-chain', 'global', 'senior', 'office');
SELECT insert_role('Regional QA Manager', 'Quality Assurance / Quality Control', 'manufacturing-supply-chain', 'regional', 'senior', 'office');
SELECT insert_role('Local QA Manager', 'Quality Assurance / Quality Control', 'manufacturing-supply-chain', 'local', 'senior', 'office');
SELECT insert_role('Global QC Analyst', 'Quality Assurance / Quality Control', 'manufacturing-supply-chain', 'global', 'mid', 'office');
SELECT insert_role('Regional QC Analyst', 'Quality Assurance / Quality Control', 'manufacturing-supply-chain', 'regional', 'mid', 'office');
SELECT insert_role('Local QC Analyst', 'Quality Assurance / Quality Control', 'manufacturing-supply-chain', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: SUPPLY CHAIN & LOGISTICS (6 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Supply Chain & Logistics roles...'; END $$;

SELECT insert_role('Global Logistics Lead', 'Supply Chain & Logistics', 'manufacturing-supply-chain', 'global', 'senior', 'office');
SELECT insert_role('Regional Logistics Lead', 'Supply Chain & Logistics', 'manufacturing-supply-chain', 'regional', 'senior', 'office');
SELECT insert_role('Local Logistics Lead', 'Supply Chain & Logistics', 'manufacturing-supply-chain', 'local', 'senior', 'office');
SELECT insert_role('Global Supply Planner', 'Supply Chain & Logistics', 'manufacturing-supply-chain', 'global', 'mid', 'office');
SELECT insert_role('Regional Supply Planner', 'Supply Chain & Logistics', 'manufacturing-supply-chain', 'regional', 'mid', 'office');
SELECT insert_role('Local Supply Planner', 'Supply Chain & Logistics', 'manufacturing-supply-chain', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: PROCESS ENGINEERING (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Process Engineering roles...'; END $$;

SELECT insert_role('Global Process Engineer', 'Process Engineering', 'manufacturing-supply-chain', 'global', 'mid', 'office');
SELECT insert_role('Regional Process Engineer', 'Process Engineering', 'manufacturing-supply-chain', 'regional', 'mid', 'office');
SELECT insert_role('Local Process Engineer', 'Process Engineering', 'manufacturing-supply-chain', 'local', 'mid', 'office');

-- =====================================================================
-- DEPARTMENT: EXTERNAL MANUFACTURING MANAGEMENT (3 roles)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating External Manufacturing Management roles...'; END $$;

SELECT insert_role('Global External Mfg Lead', 'External Manufacturing Management', 'manufacturing-supply-chain', 'global', 'senior', 'office');
SELECT insert_role('Regional External Mfg Lead', 'External Manufacturing Management', 'manufacturing-supply-chain', 'regional', 'senior', 'office');
SELECT insert_role('Local External Mfg Lead', 'External Manufacturing Management', 'manufacturing-supply-chain', 'local', 'senior', 'office');

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
    WHERE f.slug = 'manufacturing-supply-chain' 
      AND r.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    SELECT COUNT(DISTINCT d.id) INTO dept_count
    FROM public.org_departments d
    JOIN public.org_functions f ON d.function_id = f.id
    WHERE f.slug = 'manufacturing-supply-chain'
      AND d.deleted_at IS NULL
      AND f.deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MANUFACTURING SUPPLY CHAIN ROLES CREATED SUCCESSFULLY';
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
WHERE f.slug = 'manufacturing-supply-chain'
  AND d.deleted_at IS NULL
  AND f.deleted_at IS NULL
GROUP BY d.name
ORDER BY role_count DESC, d.name;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ Manufacturing Supply Chain roles populated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;