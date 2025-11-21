-- =============================================================================
-- ⚠️ NUCLEAR OPTION: WIPE DATABASE CLEAN
-- =============================================================================
-- WARNING: This will DELETE EVERYTHING in the public schema
-- Only run this if you want to start completely fresh
-- Make sure you have backups of any data you want to keep!
-- =============================================================================

-- Drop all tables in public schema
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        RAISE NOTICE 'Dropped table: %', r.tablename;
    END LOOP;

    -- Drop all views
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.viewname) || ' CASCADE';
        RAISE NOTICE 'Dropped view: %', r.viewname;
    END LOOP;

    -- Drop all sequences
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public')
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
        RAISE NOTICE 'Dropped sequence: %', r.sequence_name;
    END LOOP;

    -- Drop all functions
    FOR r IN (
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc
        INNER JOIN pg_namespace ON (pg_proc.pronamespace = pg_namespace.oid)
        WHERE pg_namespace.nspname = 'public'
    )
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.argtypes || ') CASCADE';
        RAISE NOTICE 'Dropped function: %(%)', r.proname, r.argtypes;
    END LOOP;

    -- Drop all types (including ENUMs)
    FOR r IN (
        SELECT typname
        FROM pg_type
        WHERE typnamespace = 'public'::regnamespace
        AND typtype = 'e'
    )
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
        RAISE NOTICE 'Dropped type: %', r.typname;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ DATABASE WIPED CLEAN';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All tables, views, sequences, functions, and types have been dropped.';
    RAISE NOTICE 'Ready for gold-standard schema creation.';
    RAISE NOTICE '';
END $$;

-- Verify clean state
SELECT
    COUNT(*) as remaining_tables,
    (SELECT COUNT(*) FROM pg_views WHERE schemaname = 'public') as remaining_views,
    (SELECT COUNT(*) FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e') as remaining_enums
FROM pg_tables
WHERE schemaname = 'public';
