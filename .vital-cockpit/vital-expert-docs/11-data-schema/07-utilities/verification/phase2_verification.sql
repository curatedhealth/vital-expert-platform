-- ==========================================
-- FILE: phase2_verification.sql
-- PURPOSE: Comprehensive verification queries for Phase 2 Array & JSONB Cleanup
-- PHASE: 2 of 4 - Verification
-- DEPENDENCIES: phase2_array_jsonb_cleanup.sql must be executed first
-- ==========================================

\echo ''
\echo '========================================'
\echo 'PHASE 2 VERIFICATION - ARRAY & JSONB CLEANUP'
\echo '========================================'
\echo ''

-- ==========================================
-- 1. NORMALIZED TABLE EXISTENCE
-- ==========================================

\echo '1. Verifying normalized tables exist...'
\echo ''

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_kpis') 
    THEN '✓ jtbd_kpis table exists'
    ELSE '✗ jtbd_kpis table MISSING'
  END as status
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_pain_points') 
    THEN '✓ jtbd_pain_points table exists'
    ELSE '✗ jtbd_pain_points table MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_desired_outcomes') 
    THEN '✓ jtbd_desired_outcomes table exists'
    ELSE '✗ jtbd_desired_outcomes table MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_success_criteria') 
    THEN '✓ jtbd_success_criteria table exists'
    ELSE '✗ jtbd_success_criteria table MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_tags') 
    THEN '✓ jtbd_tags table exists'
    ELSE '✗ jtbd_tags table MISSING'
  END;

-- ==========================================
-- 2. JSONB COLUMN REMOVAL VERIFICATION
-- ==========================================

\echo ''
\echo '2. Verifying JSONB columns removed from jtbd...'
\echo ''

SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'kpis') 
    THEN '✓ jtbd.kpis removed'
    ELSE '✗ jtbd.kpis STILL EXISTS'
  END as status
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'pain_points') 
    THEN '✓ jtbd.pain_points removed'
    ELSE '✗ jtbd.pain_points STILL EXISTS'
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'desired_outcomes') 
    THEN '✓ jtbd.desired_outcomes removed'
    ELSE '✗ jtbd.desired_outcomes STILL EXISTS'
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'metadata') 
    THEN '✓ jtbd.metadata removed'
    ELSE '✗ jtbd.metadata STILL EXISTS'
  END;

-- ==========================================
-- 3. ARRAY COLUMN REMOVAL VERIFICATION
-- ==========================================

\echo ''
\echo '3. Verifying array columns removed from jtbd...'
\echo ''

SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'success_criteria') 
    THEN '✓ jtbd.success_criteria removed'
    ELSE '✗ jtbd.success_criteria STILL EXISTS'
  END as status
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'tags') 
    THEN '✓ jtbd.tags removed'
    ELSE '✗ jtbd.tags STILL EXISTS'
  END;

-- ==========================================
-- 4. DUPLICATE FIELD REMOVAL VERIFICATION
-- ==========================================

\echo ''
\echo '4. Verifying duplicate fields removed...'
\echo ''

SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'jtbd_code') 
    THEN '✓ jtbd.jtbd_code removed'
    ELSE '✗ jtbd.jtbd_code STILL EXISTS'
  END as status
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'category') 
    THEN '✓ jtbd.category removed'
    ELSE '✗ jtbd.category STILL EXISTS'
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'unique_id') 
    THEN '✓ jtbd.unique_id removed'
    ELSE '✗ jtbd.unique_id STILL EXISTS'
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'workflow_id') 
    THEN '✓ jtbd.workflow_id removed'
    ELSE '✗ jtbd.workflow_id STILL EXISTS'
  END;

-- ==========================================
-- 5. DATA MIGRATION COUNTS
-- ==========================================

\echo ''
\echo '5. Data migration counts...'
\echo ''

SELECT 
  'KPIs' as entity,
  COUNT(*)::TEXT as count,
  CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '⚠' END as status
FROM jtbd_kpis

UNION ALL

SELECT 
  'Pain Points',
  COUNT(*)::TEXT,
  CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '⚠' END
FROM jtbd_pain_points

UNION ALL

SELECT 
  'Desired Outcomes',
  COUNT(*)::TEXT,
  CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '⚠' END
FROM jtbd_desired_outcomes

UNION ALL

SELECT 
  'Success Criteria',
  COUNT(*)::TEXT,
  CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '⚠' END
FROM jtbd_success_criteria

UNION ALL

SELECT 
  'Tags',
  COUNT(*)::TEXT,
  CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '⚠' END
FROM jtbd_tags;

-- ==========================================
-- 6. NULL CONSTRAINT VERIFICATION
-- ==========================================

\echo ''
\echo '6. Checking for NULL values in required fields...'
\echo ''

SELECT 
  'NULL Check' as check_type,
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_kpis WHERE kpi_name IS NULL) = 0
    THEN '✓ PASS - No NULL kpi_name'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_kpis WHERE kpi_name IS NULL)::TEXT || ' NULL kpi_name'
  END as result
UNION ALL
SELECT 
  'NULL Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_pain_points WHERE issue IS NULL) = 0
    THEN '✓ PASS - No NULL issues'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_pain_points WHERE issue IS NULL)::TEXT || ' NULL issues'
  END
UNION ALL
SELECT 
  'NULL Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_desired_outcomes WHERE outcome IS NULL) = 0
    THEN '✓ PASS - No NULL outcomes'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_desired_outcomes WHERE outcome IS NULL)::TEXT || ' NULL outcomes'
  END
UNION ALL
SELECT 
  'NULL Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_success_criteria WHERE criterion IS NULL) = 0
    THEN '✓ PASS - No NULL criteria'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_success_criteria WHERE criterion IS NULL)::TEXT || ' NULL criteria'
  END
UNION ALL
SELECT 
  'NULL Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_tags WHERE tag IS NULL) = 0
    THEN '✓ PASS - No NULL tags'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_tags WHERE tag IS NULL)::TEXT || ' NULL tags'
  END;

-- ==========================================
-- 7. FOREIGN KEY INTEGRITY
-- ==========================================

\echo ''
\echo '7. Checking foreign key integrity...'
\echo ''

SELECT 
  'FK Check' as check_type,
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_kpis WHERE NOT EXISTS (SELECT 1 FROM jtbd WHERE id = jtbd_kpis.jtbd_id)) = 0
    THEN '✓ PASS - All jtbd_kpis.jtbd_id valid'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_kpis WHERE NOT EXISTS (SELECT 1 FROM jtbd WHERE id = jtbd_kpis.jtbd_id))::TEXT || ' orphaned KPIs'
  END as result
UNION ALL
SELECT 
  'FK Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_pain_points WHERE NOT EXISTS (SELECT 1 FROM jtbd WHERE id = jtbd_pain_points.jtbd_id)) = 0
    THEN '✓ PASS - All jtbd_pain_points.jtbd_id valid'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_pain_points WHERE NOT EXISTS (SELECT 1 FROM jtbd WHERE id = jtbd_pain_points.jtbd_id))::TEXT || ' orphaned pain points'
  END
UNION ALL
SELECT 
  'FK Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_desired_outcomes WHERE NOT EXISTS (SELECT 1 FROM jtbd WHERE id = jtbd_desired_outcomes.jtbd_id)) = 0
    THEN '✓ PASS - All jtbd_desired_outcomes.jtbd_id valid'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_desired_outcomes WHERE NOT EXISTS (SELECT 1 FROM jtbd WHERE id = jtbd_desired_outcomes.jtbd_id))::TEXT || ' orphaned outcomes'
  END
UNION ALL
SELECT 
  'FK Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_success_criteria WHERE NOT EXISTS (SELECT 1 FROM jtbd WHERE id = jtbd_success_criteria.jtbd_id)) = 0
    THEN '✓ PASS - All jtbd_success_criteria.jtbd_id valid'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_success_criteria WHERE NOT EXISTS (SELECT 1 FROM jtbd WHERE id = jtbd_success_criteria.jtbd_id))::TEXT || ' orphaned criteria'
  END
UNION ALL
SELECT 
  'FK Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_tags WHERE NOT EXISTS (SELECT 1 FROM jtbd WHERE id = jtbd_tags.jtbd_id)) = 0
    THEN '✓ PASS - All jtbd_tags.jtbd_id valid'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_tags WHERE NOT EXISTS (SELECT 1 FROM jtbd WHERE id = jtbd_tags.jtbd_id))::TEXT || ' orphaned tags'
  END;

-- ==========================================
-- 8. INDEX VERIFICATION
-- ==========================================

\echo ''
\echo '8. Verifying indexes created...'
\echo ''

SELECT 
  'Index Check' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_kpis' AND indexname = 'idx_jtbd_kpis_jtbd') 
    THEN '✓ idx_jtbd_kpis_jtbd exists'
    ELSE '✗ idx_jtbd_kpis_jtbd MISSING'
  END as result
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_pain_points' AND indexname = 'idx_jtbd_pain_points_jtbd') 
    THEN '✓ idx_jtbd_pain_points_jtbd exists'
    ELSE '✗ idx_jtbd_pain_points_jtbd MISSING'
  END
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_pain_points' AND indexname = 'idx_jtbd_pain_points_severity') 
    THEN '✓ idx_jtbd_pain_points_severity exists'
    ELSE '✗ idx_jtbd_pain_points_severity MISSING'
  END
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_desired_outcomes' AND indexname = 'idx_jtbd_desired_outcomes_jtbd') 
    THEN '✓ idx_jtbd_desired_outcomes_jtbd exists'
    ELSE '✗ idx_jtbd_desired_outcomes_jtbd MISSING'
  END
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_success_criteria' AND indexname = 'idx_jtbd_success_criteria_jtbd') 
    THEN '✓ idx_jtbd_success_criteria_jtbd exists'
    ELSE '✗ idx_jtbd_success_criteria_jtbd MISSING'
  END
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_tags' AND indexname = 'idx_jtbd_tags_jtbd') 
    THEN '✓ idx_jtbd_tags_jtbd exists'
    ELSE '✗ idx_jtbd_tags_jtbd MISSING'
  END
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_tags' AND indexname = 'idx_jtbd_tags_tag') 
    THEN '✓ idx_jtbd_tags_tag exists'
    ELSE '✗ idx_jtbd_tags_tag MISSING'
  END;

-- ==========================================
-- 9. SAMPLE DATA VALIDATION
-- ==========================================

\echo ''
\echo '9. Sample data from normalized tables...'
\echo ''

\echo 'KPIs:'
SELECT 
  j.code as jtbd_code,
  k.kpi_name,
  k.kpi_type,
  k.target_value
FROM jtbd_kpis k
JOIN jtbd j ON j.id = k.jtbd_id
LIMIT 5;

\echo ''
\echo 'Pain Points:'
SELECT 
  j.code as jtbd_code,
  pp.issue,
  pp.severity,
  pp.frequency
FROM jtbd_pain_points pp
JOIN jtbd j ON j.id = pp.jtbd_id
LIMIT 5;

\echo ''
\echo 'Desired Outcomes:'
SELECT 
  j.code as jtbd_code,
  do.outcome,
  do.importance,
  do.outcome_type
FROM jtbd_desired_outcomes do
JOIN jtbd j ON j.id = do.jtbd_id
LIMIT 5;

-- ==========================================
-- 10. GOLDEN RULES COMPLIANCE CHECK
-- ==========================================

\echo ''
\echo '10. Golden Rules compliance check...'
\echo ''

-- Check for any remaining JSONB columns in jtbd table
SELECT 
  'Golden Rule #1' as rule,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'jtbd' AND data_type = 'jsonb') = 0
    THEN '✓ PASS - Zero JSONB columns in jtbd table'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'jtbd' AND data_type = 'jsonb')::TEXT || ' JSONB columns in jtbd'
  END as status;

-- ==========================================
-- FINAL SUMMARY
-- ==========================================

\echo ''
\echo '========================================'
\echo 'PHASE 2 VERIFICATION COMPLETE'
\echo '========================================'
\echo ''
\echo 'Review results above:'
\echo '  ✓ = PASS'
\echo '  ✗ = FAIL'
\echo '  ⚠ = WARNING (may be acceptable)'
\echo ''
\echo 'All checks should show ✓ for Phase 2 to be complete.'
\echo ''

