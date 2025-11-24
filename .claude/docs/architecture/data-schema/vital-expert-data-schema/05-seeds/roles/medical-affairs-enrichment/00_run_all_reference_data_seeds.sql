-- =====================================================================
-- MASTER SEED FILE: Reference Data for Medical Affairs Role Enrichment
-- Date: 2025-11-22
-- Purpose: Execute all reference data seeds in correct order
-- Duration: ~30 seconds
-- =====================================================================

-- IMPORTANT: Run this file first, BEFORE any role enrichment SQL
-- This populates the master data tables that role enrichment depends on

\echo ''
\echo '==================================================================='
\echo 'MASTER SEED: Reference Data for Medical Affairs Role Enrichment'
\echo '==================================================================='
\echo ''
\echo 'This will populate 3 reference tables with pharmaceutical industry data:'
\echo '  1. regulatory_frameworks (20 records)'
\echo '  2. gxp_training_modules (15 records)'
\echo '  3. clinical_competencies (36 records)'
\echo ''
\echo 'Estimated duration: 30 seconds'
\echo ''

-- ================x=====================================================
-- STEP 1: Regulatory Frameworks
-- =====================================================================

\echo '-------------------------------------------------------------------'
\echo 'STEP 1/3: Seeding Regulatory Frameworks...'
\echo '-------------------------------------------------------------------'

\i database/seeds/01_seed_regulatory_frameworks.sql

-- =====================================================================
-- STEP 2: GxP Training Modules
-- =====================================================================

\echo ''
\echo '-------------------------------------------------------------------'
\echo 'STEP 2/3: Seeding GxP Training Modules...'
\echo '-------------------------------------------------------------------'

\i database/seeds/02_seed_gxp_training_modules.sql

-- =====================================================================
-- STEP 3: Clinical Competencies
-- =====================================================================

\echo ''
\echo '-------------------------------------------------------------------'
\echo 'STEP 3/3: Seeding Clinical Competencies...'
\echo '-------------------------------------------------------------------'

\i database/seeds/03_seed_clinical_competencies.sql

-- =====================================================================
-- FINAL VALIDATION
-- =====================================================================

DO $$
DECLARE
    frameworks_count INTEGER;
    training_count INTEGER;
    competencies_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO frameworks_count FROM regulatory_frameworks WHERE is_current = true;
    SELECT COUNT(*) INTO training_count FROM gxp_training_modules;
    SELECT COUNT(*) INTO competencies_count FROM clinical_competencies;

    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'REFERENCE DATA SEEDING - FINAL VALIDATION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Regulatory Frameworks: % records', frameworks_count;
    RAISE NOTICE 'GxP Training Modules: % records', training_count;
    RAISE NOTICE 'Clinical Competencies: % records', competencies_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Total Reference Data Records: %', (frameworks_count + training_count + competencies_count);
    RAISE NOTICE '';

    IF frameworks_count >= 20 AND training_count >= 15 AND competencies_count >= 30 THEN
        RAISE NOTICE '✓ SUCCESS: All reference data seeded successfully!';
        RAISE NOTICE '';
        RAISE NOTICE 'Next Steps:';
        RAISE NOTICE '  1. Run role enrichment SQL for 15 Field Medical roles';
        RAISE NOTICE '  2. Validate enriched data';
        RAISE NOTICE '  3. Proceed with remaining 85 Medical Affairs roles';
    ELSE
        RAISE WARNING '✗ WARNING: Some reference data may be incomplete:';
        IF frameworks_count < 20 THEN
            RAISE WARNING '  - Expected 20+ regulatory frameworks, found %', frameworks_count;
        END IF;
        IF training_count < 15 THEN
            RAISE WARNING '  - Expected 15+ training modules, found %', training_count;
        END IF;
        IF competencies_count < 30 THEN
            RAISE WARNING '  - Expected 30+ competencies, found %', competencies_count;
        END IF;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;
