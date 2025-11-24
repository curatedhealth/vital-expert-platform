-- =====================================================================
-- MASTER SCRIPT: Populate All Pharmaceutical Roles
-- Runs all individual role population scripts in sequence
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MASTER ROLE POPULATION SCRIPT';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'This will populate ALL pharmaceutical roles across 15 functions';
    RAISE NOTICE 'Estimated total: 900+ roles';
    RAISE NOTICE '';
END $$;

-- Medical Affairs (already run - 108 roles)
-- \i populate_roles_01_medical_affairs.sql

-- Market Access (already run - 135 roles)
-- \i populate_roles_02_market_access.sql

-- Commercial Organization - 135 roles
\i populate_roles_03_commercial_organization.sql

-- Regulatory Affairs - 114 roles
\i populate_roles_04_regulatory_affairs.sql

-- Research & Development - 30 roles
\i populate_roles_05_research_development_rd.sql

-- Manufacturing & Supply Chain - 27 roles
\i populate_roles_06_manufacturing_supply_chain.sql

-- Finance & Accounting - 18 roles
\i populate_roles_07_finance_accounting.sql

-- Human Resources - 18 roles
\i populate_roles_08_human_resources.sql

-- Information Technology / Digital - 18 roles
\i populate_roles_09_information_technology_it_digital.sql

-- Legal & Compliance - 15 roles
\i populate_roles_10_legal_compliance.sql

-- Corporate Communications - 15 roles
\i populate_roles_11_corporate_communications.sql

-- Strategic Planning / Corporate Development - 15 roles
\i populate_roles_12_strategic_planning_corporate_development.sql

-- Business Intelligence / Analytics - 15 roles
\i populate_roles_13_business_intelligence_analytics.sql

-- Procurement - 15 roles
\i populate_roles_14_procurement.sql

-- Facilities / Workplace Services - 15 roles
\i populate_roles_15_facilities_workplace_services.sql

-- =====================================================================
-- FINAL VERIFICATION
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ALL ROLE POPULATION SCRIPTS COMPLETE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

SELECT 
    f.name as function_name,
    COUNT(DISTINCT d.id) as departments,
    COUNT(r.id) as total_roles,
    COUNT(CASE WHEN r.geographic_scope = 'global' THEN 1 END) as global_roles,
    COUNT(CASE WHEN r.geographic_scope = 'regional' THEN 1 END) as regional_roles,
    COUNT(CASE WHEN r.geographic_scope = 'local' THEN 1 END) as local_roles
FROM public.org_functions f
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.deleted_at IS NULL
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.deleted_at IS NULL
WHERE f.deleted_at IS NULL
GROUP BY f.name, f.id
ORDER BY COUNT(r.id) DESC, f.name;

DO $$
DECLARE
    total_functions INTEGER;
    total_departments INTEGER;
    total_roles INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_functions FROM public.org_functions WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO total_departments FROM public.org_departments WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO total_roles FROM public.org_roles WHERE deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'GOLD STANDARD ORG STRUCTURE SUMMARY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Functions:   %', total_functions;
    RAISE NOTICE 'Departments: %', total_departments;
    RAISE NOTICE 'Roles:       %', total_roles;
    RAISE NOTICE '';
    RAISE NOTICE 'Next Step: Run map_org_to_pharma_tenant.sql to link all entities';
    RAISE NOTICE '          to the Pharmaceuticals tenant via junction tables';
    RAISE NOTICE '=================================================================';
END $$;
