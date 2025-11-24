-- ==========================================
-- FILE: phase3_verification.sql
-- PURPOSE: Verification queries for Phase 3 Value & AI Layers
-- PHASE: 3 of 4 - Verification
-- DEPENDENCIES: phase3_value_ai_layers.sql must be executed first
-- ==========================================

\echo ''
\echo '========================================'
\echo 'PHASE 3 VERIFICATION - VALUE & AI LAYERS'
\echo '========================================'
\echo ''

-- ==========================================
-- 1. REFERENCE TABLE EXISTENCE & COUNTS
-- ==========================================

\echo '1. Verifying reference tables and seed data...'
\echo ''

SELECT 
  'value_categories' as table_name,
  COUNT(*)::TEXT as actual_count,
  '6' as expected_count,
  CASE WHEN COUNT(*) = 6 THEN '✓' ELSE '✗' END as status
FROM value_categories

UNION ALL

SELECT 
  'value_drivers',
  COUNT(*)::TEXT,
  '9',
  CASE WHEN COUNT(*) = 9 THEN '✓' ELSE '✗' END
FROM value_drivers

UNION ALL

SELECT 
  'ai_intervention_types',
  COUNT(*)::TEXT,
  '3',
  CASE WHEN COUNT(*) = 3 THEN '✓' ELSE '✗' END
FROM ai_intervention_types;

-- ==========================================
-- 2. JUNCTION TABLE EXISTENCE
-- ==========================================

\echo ''
\echo '2. Verifying junction tables exist...'
\echo ''

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_value_categories') 
    THEN '✓ jtbd_value_categories table exists'
    ELSE '✗ jtbd_value_categories table MISSING'
  END as status
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_value_drivers') 
    THEN '✓ jtbd_value_drivers table exists'
    ELSE '✗ jtbd_value_drivers table MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_ai_suitability') 
    THEN '✓ jtbd_ai_suitability table exists'
    ELSE '✗ jtbd_ai_suitability table MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_opportunities') 
    THEN '✓ ai_opportunities table exists'
    ELSE '✗ ai_opportunities table MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_use_cases') 
    THEN '✓ ai_use_cases table exists'
    ELSE '✗ ai_use_cases table MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_context') 
    THEN '✓ jtbd_context table exists'
    ELSE '✗ jtbd_context table MISSING'
  END;

-- ==========================================
-- 3. FOREIGN KEY INTEGRITY
-- ==========================================

\echo ''
\echo '3. Checking foreign key integrity...'
\echo ''

SELECT 
  'FK Check' as check_type,
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_value_categories WHERE NOT EXISTS (SELECT 1 FROM jtbd WHERE id = jtbd_value_categories.jtbd_id)) = 0
    THEN '✓ PASS - All jtbd_value_categories.jtbd_id valid'
    ELSE '✗ FAIL - Orphaned records in jtbd_value_categories'
  END as result
UNION ALL
SELECT 
  'FK Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_value_categories WHERE NOT EXISTS (SELECT 1 FROM value_categories WHERE id = jtbd_value_categories.category_id)) = 0
    THEN '✓ PASS - All jtbd_value_categories.category_id valid'
    ELSE '✗ FAIL - Invalid category_id in jtbd_value_categories'
  END
UNION ALL
SELECT 
  'FK Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_value_drivers WHERE NOT EXISTS (SELECT 1 FROM jtbd WHERE id = jtbd_value_drivers.jtbd_id)) = 0
    THEN '✓ PASS - All jtbd_value_drivers.jtbd_id valid'
    ELSE '✗ FAIL - Orphaned records in jtbd_value_drivers'
  END
UNION ALL
SELECT 
  'FK Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_value_drivers WHERE NOT EXISTS (SELECT 1 FROM value_drivers WHERE id = jtbd_value_drivers.driver_id)) = 0
    THEN '✓ PASS - All jtbd_value_drivers.driver_id valid'
    ELSE '✗ FAIL - Invalid driver_id in jtbd_value_drivers'
  END
UNION ALL
SELECT 
  'FK Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_ai_suitability WHERE NOT EXISTS (SELECT 1 FROM jtbd WHERE id = jtbd_ai_suitability.jtbd_id)) = 0
    THEN '✓ PASS - All jtbd_ai_suitability.jtbd_id valid'
    ELSE '✗ FAIL - Orphaned records in jtbd_ai_suitability'
  END
UNION ALL
SELECT 
  'FK Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM ai_opportunities WHERE NOT EXISTS (SELECT 1 FROM jtbd WHERE id = ai_opportunities.jtbd_id)) = 0
    THEN '✓ PASS - All ai_opportunities.jtbd_id valid'
    ELSE '✗ FAIL - Orphaned records in ai_opportunities'
  END;

-- ==========================================
-- 4. INDEX VERIFICATION
-- ==========================================

\echo ''
\echo '4. Verifying indexes created...'
\echo ''

SELECT 
  'Index Check' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_value_categories' AND indexname = 'idx_jtbd_value_categories_jtbd') 
    THEN '✓ idx_jtbd_value_categories_jtbd exists'
    ELSE '✗ idx_jtbd_value_categories_jtbd MISSING'
  END as result
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_value_drivers' AND indexname = 'idx_jtbd_value_drivers_jtbd') 
    THEN '✓ idx_jtbd_value_drivers_jtbd exists'
    ELSE '✗ idx_jtbd_value_drivers_jtbd MISSING'
  END
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_ai_suitability' AND indexname = 'idx_jtbd_ai_suitability_jtbd') 
    THEN '✓ idx_jtbd_ai_suitability_jtbd exists'
    ELSE '✗ idx_jtbd_ai_suitability_jtbd MISSING'
  END
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'ai_opportunities' AND indexname = 'idx_ai_opportunities_jtbd') 
    THEN '✓ idx_ai_opportunities_jtbd exists'
    ELSE '✗ idx_ai_opportunities_jtbd MISSING'
  END;

-- ==========================================
-- 5. SAMPLE DATA VALIDATION
-- ==========================================

\echo ''
\echo '5. Sample reference data...'
\echo ''

\echo 'Value Categories:'
SELECT code, name, sort_order FROM value_categories ORDER BY sort_order;

\echo ''
\echo 'Value Drivers (by type):'
SELECT driver_type, code, name FROM value_drivers ORDER BY driver_type, name;

\echo ''
\echo 'AI Intervention Types:'
SELECT code, name FROM ai_intervention_types ORDER BY name;

-- ==========================================
-- FINAL SUMMARY
-- ==========================================

\echo ''
\echo '========================================'
\echo 'PHASE 3 VERIFICATION COMPLETE'
\echo '========================================'
\echo ''
\echo 'All reference tables seeded and ready for use.'
\echo ''

