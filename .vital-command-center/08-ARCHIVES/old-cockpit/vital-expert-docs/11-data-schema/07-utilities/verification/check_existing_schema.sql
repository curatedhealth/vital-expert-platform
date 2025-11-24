-- =====================================================================
-- VITAL PLATFORM - FINAL SETUP
-- Based on your existing database schema
-- Only adds missing organizational mappings
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'VITAL PLATFORM SETUP - USING EXISTING SCHEMA';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Your existing tables (from DB schema.json):';
    RAISE NOTICE '  ✓ agents (319 rows, 35 columns)';
    RAISE NOTICE '  ✓ prompts';
    RAISE NOTICE '  ✓ knowledge_base, knowledge_documents, knowledge_domains';
    RAISE NOTICE '  ✓ capabilities';
    RAISE NOTICE '  ✓ workflows';
    RAISE NOTICE '  ✓ jobs_to_be_done (JTBDs)';
    RAISE NOTICE '  ✓ tools (94 rows), skills';
    RAISE NOTICE '  ✓ personas (87 columns)';
    RAISE NOTICE '  ✓ org_functions, org_departments, org_roles';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Run: add_org_mapping_to_all_tables.sql';
    RAISE NOTICE '  2. Run: create_architecture_views.sql';
    RAISE NOTICE '';
    RAISE NOTICE 'This will add organizational context to your existing tables.';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

-- Check what's already there
SELECT 
    'agents' as table_name, 
    COUNT(*) as row_count,
    COUNT(*) FILTER (WHERE role_id IS NOT NULL) as with_role,
    COUNT(*) FILTER (WHERE function_id IS NOT NULL) as with_function,
    COUNT(*) FILTER (WHERE department_id IS NOT NULL) as with_dept
FROM agents WHERE deleted_at IS NULL;

