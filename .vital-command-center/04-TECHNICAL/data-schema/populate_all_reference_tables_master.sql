-- =====================================================================
-- MASTER SCRIPT: POPULATE ALL REFERENCE TABLES
-- Runs all reference table population scripts in sequence
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MASTER REFERENCE TABLE POPULATION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'This will populate reference tables (Skills table already exists):';
    RAISE NOTICE '  1. Therapeutic Areas & Disease Areas';
    RAISE NOTICE '  2. Company Sizes';
    RAISE NOTICE '  3. AI Maturity Levels';
    RAISE NOTICE '  4. VPANES Dimensions';
    RAISE NOTICE '  5. Stakeholder Types';
    RAISE NOTICE '  6. Responsibility Catalog';
    RAISE NOTICE '  7. KPI Definitions';
    RAISE NOTICE '';
END $$;

-- Run all reference table scripts
\i populate_all_reference_tables.sql

-- =====================================================================
-- FINAL VERIFICATION
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'COMPLETE REFERENCE DATA SUMMARY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

SELECT 
    'Reference Tables' as category,
    COUNT(*) FILTER (WHERE table_name = 'therapeutic_areas') as therapeutic_areas,
    COUNT(*) FILTER (WHERE table_name = 'disease_areas') as disease_areas,
    COUNT(*) FILTER (WHERE table_name = 'company_sizes') as company_sizes,
    COUNT(*) FILTER (WHERE table_name = 'ai_maturity_levels') as ai_maturity_levels,
    COUNT(*) FILTER (WHERE table_name = 'vpanes_dimensions') as vpanes_dimensions,
    COUNT(*) FILTER (WHERE table_name = 'stakeholders') as stakeholders,
    COUNT(*) FILTER (WHERE table_name = 'responsibilities') as responsibilities,
    COUNT(*) FILTER (WHERE table_name = 'kpi_definitions') as kpi_definitions
FROM (
    SELECT 'therapeutic_areas' as table_name FROM public.therapeutic_areas
    UNION ALL SELECT 'disease_areas' FROM public.disease_areas
    UNION ALL SELECT 'company_sizes' FROM public.company_sizes
    UNION ALL SELECT 'ai_maturity_levels' FROM public.ai_maturity_levels
    UNION ALL SELECT 'vpanes_dimensions' FROM public.vpanes_dimensions
    UNION ALL SELECT 'stakeholders' FROM public.stakeholders
    UNION ALL SELECT 'responsibilities' FROM public.responsibilities
    UNION ALL SELECT 'kpi_definitions' FROM public.kpi_definitions
) ref_data;

-- Verify junction tables exist
DO $$ BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE 'Junction Tables Status:';
END $$;

SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM (VALUES 
    ('function_tenants'),
    ('department_tenants'),
    ('role_tenants'),
    ('role_therapeutic_areas'),
    ('role_disease_areas'),
    ('role_company_sizes'),
    ('role_responsibilities'),
    ('role_kpis'),
    ('role_skills'),
    ('role_tools'),
    ('role_internal_stakeholders'),
    ('role_external_stakeholders'),
    ('role_ai_maturity'),
    ('role_vpanes_scores')
) v(table_name)
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND information_schema.tables.table_name = v.table_name
)
ORDER BY table_name;

-- Final summary
DO $$
DECLARE
    total_ref_records INTEGER;
    total_junction_tables INTEGER;
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM public.therapeutic_areas) +
        (SELECT COUNT(*) FROM public.disease_areas) +
        (SELECT COUNT(*) FROM public.company_sizes) +
        (SELECT COUNT(*) FROM public.ai_maturity_levels) +
        (SELECT COUNT(*) FROM public.vpanes_dimensions) +
        (SELECT COUNT(*) FROM public.stakeholders) +
        (SELECT COUNT(*) FROM public.responsibilities) +
        (SELECT COUNT(*) FROM public.kpi_definitions)
    INTO total_ref_records;
    
    SELECT COUNT(*) INTO total_junction_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
          'function_tenants', 'department_tenants', 'role_tenants',
          'role_therapeutic_areas', 'role_disease_areas', 'role_company_sizes',
          'role_responsibilities', 'role_kpis', 'role_tools',
          'role_internal_stakeholders', 'role_external_stakeholders',
          'role_ai_maturity', 'role_vpanes_scores'
      );
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ALL REFERENCE TABLES READY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Total Reference Records: %', total_ref_records;
    RAISE NOTICE 'Junction Tables Available: %/13', total_junction_tables;
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Begin enriching roles with reference data';
    RAISE NOTICE '  2. Map roles to responsibilities, KPIs, tools, etc.';
    RAISE NOTICE '  3. Set stakeholders and VPANES scores';
    RAISE NOTICE '  4. Assess AI maturity for each role';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready to enrich 690+ pharmaceutical roles!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

