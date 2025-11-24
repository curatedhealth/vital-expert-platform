-- ==========================================
-- FILE: phase1_verification.sql
-- PURPOSE: Comprehensive verification queries for Phase 1 Foundation Cleanup
-- PHASE: 1 of 4 - Verification
-- DEPENDENCIES: phase1_foundation_cleanup.sql must be executed first
-- ==========================================

\echo ''
\echo '========================================'
\echo 'PHASE 1 VERIFICATION - FOUNDATION CLEANUP'
\echo '========================================'
\echo ''

-- ==========================================
-- 1. TABLE EXISTENCE CHECKS
-- ==========================================

\echo '1. Verifying table existence...'
\echo ''

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd') 
    THEN '✓ jtbd table exists'
    ELSE '✗ jtbd table MISSING'
  END as status
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_functions') 
    THEN '✓ jtbd_functions table exists'
    ELSE '✗ jtbd_functions table MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_departments') 
    THEN '✓ jtbd_departments table exists'
    ELSE '✗ jtbd_departments table MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_roles') 
    THEN '✓ jtbd_roles table exists'
    ELSE '✗ jtbd_roles table MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_jtbd') 
    THEN '✓ role_jtbd table successfully dropped'
    ELSE '✗ role_jtbd table STILL EXISTS (should be dropped)'
  END;

-- ==========================================
-- 2. COLUMN REMOVAL VERIFICATION
-- ==========================================

\echo ''
\echo '2. Verifying org structure columns removed from jtbd...'
\echo ''

SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'function_id') 
    THEN '✓ jtbd.function_id removed'
    ELSE '✗ jtbd.function_id STILL EXISTS'
  END as status
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'function_name') 
    THEN '✓ jtbd.function_name removed'
    ELSE '✗ jtbd.function_name STILL EXISTS'
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'department_id') 
    THEN '✓ jtbd.department_id removed'
    ELSE '✗ jtbd.department_id STILL EXISTS'
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'department_name') 
    THEN '✓ jtbd.department_name removed'
    ELSE '✗ jtbd.department_name STILL EXISTS'
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'role_id') 
    THEN '✓ jtbd.role_id removed'
    ELSE '✗ jtbd.role_id STILL EXISTS'
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'role_name') 
    THEN '✓ jtbd.role_name removed'
    ELSE '✗ jtbd.role_name STILL EXISTS'
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'persona_id') 
    THEN '✓ jtbd.persona_id removed'
    ELSE '✗ jtbd.persona_id STILL EXISTS'
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'org_function_id') 
    THEN '✓ jtbd.org_function_id removed'
    ELSE '✗ jtbd.org_function_id STILL EXISTS'
  END;

-- ==========================================
-- 3. JUNCTION TABLE COLUMNS VERIFICATION
-- ==========================================

\echo ''
\echo '3. Verifying junction table columns (ID + NAME pattern)...'
\echo ''

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_functions' AND column_name = 'function_name') 
    THEN '✓ jtbd_functions.function_name exists'
    ELSE '✗ jtbd_functions.function_name MISSING'
  END as status
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_departments' AND column_name = 'department_name') 
    THEN '✓ jtbd_departments.department_name exists'
    ELSE '✗ jtbd_departments.department_name MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_roles' AND column_name = 'role_name') 
    THEN '✓ jtbd_roles.role_name exists'
    ELSE '✗ jtbd_roles.role_name MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_roles' AND column_name = 'importance') 
    THEN '✓ jtbd_roles.importance exists'
    ELSE '✗ jtbd_roles.importance MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_roles' AND column_name = 'frequency') 
    THEN '✓ jtbd_roles.frequency exists'
    ELSE '✗ jtbd_roles.frequency MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_roles' AND column_name = 'sequence_order') 
    THEN '✓ jtbd_roles.sequence_order exists'
    ELSE '✗ jtbd_roles.sequence_order MISSING'
  END;

-- ==========================================
-- 4. DATA INTEGRITY CHECKS
-- ==========================================

\echo ''
\echo '4. Data integrity checks...'
\echo ''

-- Check for NULL names (should be 0)
SELECT 
  'NULL Names Check' as check_type,
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_functions WHERE function_name IS NULL) = 0
    THEN '✓ PASS - No NULL function names'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_functions WHERE function_name IS NULL)::TEXT || ' NULL function names'
  END as result
UNION ALL
SELECT 
  'NULL Names Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_departments WHERE department_name IS NULL) = 0
    THEN '✓ PASS - No NULL department names'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_departments WHERE department_name IS NULL)::TEXT || ' NULL department names'
  END
UNION ALL
SELECT 
  'NULL Names Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_roles WHERE role_name IS NULL) = 0
    THEN '✓ PASS - No NULL role names'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_roles WHERE role_name IS NULL)::TEXT || ' NULL role names'
  END;

-- Check for orphaned records (FK violations)
\echo ''
\echo '5. Checking for orphaned records (foreign key integrity)...'
\echo ''

SELECT 
  'Foreign Key Check' as check_type,
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_functions jf WHERE NOT EXISTS (SELECT 1 FROM jtbd j WHERE j.id = jf.jtbd_id)) = 0
    THEN '✓ PASS - No orphaned jtbd_functions'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_functions jf WHERE NOT EXISTS (SELECT 1 FROM jtbd j WHERE j.id = jf.jtbd_id))::TEXT || ' orphaned jtbd_functions'
  END as result
UNION ALL
SELECT 
  'Foreign Key Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_functions jf WHERE NOT EXISTS (SELECT 1 FROM org_functions f WHERE f.id = jf.function_id)) = 0
    THEN '✓ PASS - All function_ids valid'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_functions jf WHERE NOT EXISTS (SELECT 1 FROM org_functions f WHERE f.id = jf.function_id))::TEXT || ' invalid function_ids'
  END
UNION ALL
SELECT 
  'Foreign Key Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_departments jd WHERE NOT EXISTS (SELECT 1 FROM jtbd j WHERE j.id = jd.jtbd_id)) = 0
    THEN '✓ PASS - No orphaned jtbd_departments'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_departments jd WHERE NOT EXISTS (SELECT 1 FROM jtbd j WHERE j.id = jd.jtbd_id))::TEXT || ' orphaned jtbd_departments'
  END
UNION ALL
SELECT 
  'Foreign Key Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_departments jd WHERE NOT EXISTS (SELECT 1 FROM org_departments d WHERE d.id = jd.department_id)) = 0
    THEN '✓ PASS - All department_ids valid'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_departments jd WHERE NOT EXISTS (SELECT 1 FROM org_departments d WHERE d.id = jd.department_id))::TEXT || ' invalid department_ids'
  END
UNION ALL
SELECT 
  'Foreign Key Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_roles jr WHERE NOT EXISTS (SELECT 1 FROM jtbd j WHERE j.id = jr.jtbd_id)) = 0
    THEN '✓ PASS - No orphaned jtbd_roles'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_roles jr WHERE NOT EXISTS (SELECT 1 FROM jtbd j WHERE j.id = jr.jtbd_id))::TEXT || ' orphaned jtbd_roles'
  END
UNION ALL
SELECT 
  'Foreign Key Check',
  CASE 
    WHEN (SELECT COUNT(*) FROM jtbd_roles jr WHERE NOT EXISTS (SELECT 1 FROM org_roles r WHERE r.id = jr.role_id)) = 0
    THEN '✓ PASS - All role_ids valid'
    ELSE '✗ FAIL - Found ' || (SELECT COUNT(*) FROM jtbd_roles jr WHERE NOT EXISTS (SELECT 1 FROM org_roles r WHERE r.id = jr.role_id))::TEXT || ' invalid role_ids'
  END;

-- ==========================================
-- 6. INDEX VERIFICATION
-- ==========================================

\echo ''
\echo '6. Verifying indexes created...'
\echo ''

SELECT 
  'Index Check' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_functions' AND indexname = 'idx_jtbd_functions_jtbd') 
    THEN '✓ idx_jtbd_functions_jtbd exists'
    ELSE '✗ idx_jtbd_functions_jtbd MISSING'
  END as result
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_functions' AND indexname = 'idx_jtbd_functions_function') 
    THEN '✓ idx_jtbd_functions_function exists'
    ELSE '✗ idx_jtbd_functions_function MISSING'
  END
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_functions' AND indexname = 'idx_jtbd_functions_name') 
    THEN '✓ idx_jtbd_functions_name exists'
    ELSE '✗ idx_jtbd_functions_name MISSING'
  END
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_departments' AND indexname = 'idx_jtbd_departments_jtbd') 
    THEN '✓ idx_jtbd_departments_jtbd exists'
    ELSE '✗ idx_jtbd_departments_jtbd MISSING'
  END
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_departments' AND indexname = 'idx_jtbd_departments_dept') 
    THEN '✓ idx_jtbd_departments_dept exists'
    ELSE '✗ idx_jtbd_departments_dept MISSING'
  END
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_departments' AND indexname = 'idx_jtbd_departments_name') 
    THEN '✓ idx_jtbd_departments_name exists'
    ELSE '✗ idx_jtbd_departments_name MISSING'
  END
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_roles' AND indexname = 'idx_jtbd_roles_jtbd') 
    THEN '✓ idx_jtbd_roles_jtbd exists'
    ELSE '✗ idx_jtbd_roles_jtbd MISSING'
  END
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_roles' AND indexname = 'idx_jtbd_roles_role') 
    THEN '✓ idx_jtbd_roles_role exists'
    ELSE '✗ idx_jtbd_roles_role MISSING'
  END
UNION ALL
SELECT 
  'Index Check',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jtbd_roles' AND indexname = 'idx_jtbd_roles_name') 
    THEN '✓ idx_jtbd_roles_name exists'
    ELSE '✗ idx_jtbd_roles_name MISSING'
  END;

-- ==========================================
-- 7. TRIGGER VERIFICATION
-- ==========================================

\echo ''
\echo '7. Verifying name sync triggers created...'
\echo ''

SELECT 
  'Trigger Check' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'trigger_sync_jtbd_function_name' 
      AND event_object_table = 'jtbd_functions'
    ) 
    THEN '✓ trigger_sync_jtbd_function_name exists'
    ELSE '✗ trigger_sync_jtbd_function_name MISSING'
  END as result
UNION ALL
SELECT 
  'Trigger Check',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'trigger_sync_jtbd_department_name' 
      AND event_object_table = 'jtbd_departments'
    ) 
    THEN '✓ trigger_sync_jtbd_department_name exists'
    ELSE '✗ trigger_sync_jtbd_department_name MISSING'
  END
UNION ALL
SELECT 
  'Trigger Check',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'trigger_sync_jtbd_role_name' 
      AND event_object_table = 'jtbd_roles'
    ) 
    THEN '✓ trigger_sync_jtbd_role_name exists'
    ELSE '✗ trigger_sync_jtbd_role_name MISSING'
  END;

-- ==========================================
-- 8. ROW COUNT SUMMARY
-- ==========================================

\echo ''
\echo '8. Row count summary...'
\echo ''

SELECT 
  'JTBDs (active)' as entity,
  COUNT(*)::TEXT as count
FROM jtbd 
WHERE deleted_at IS NULL

UNION ALL

SELECT 
  'Function Mappings',
  COUNT(*)::TEXT
FROM jtbd_functions

UNION ALL

SELECT 
  'Department Mappings',
  COUNT(*)::TEXT
FROM jtbd_departments

UNION ALL

SELECT 
  'Role Mappings',
  COUNT(*)::TEXT
FROM jtbd_roles;

-- ==========================================
-- 9. SAMPLE DATA VALIDATION
-- ==========================================

\echo ''
\echo '9. Sample data with ID + NAME pattern...'
\echo ''

SELECT 
  'Function Mapping' as mapping_type,
  jf.jtbd_id::TEXT as jtbd_id,
  jf.function_id::TEXT as foreign_id,
  jf.function_name as cached_name,
  f.name as actual_name,
  CASE 
    WHEN jf.function_name = f.name THEN '✓ Match'
    ELSE '✗ Mismatch'
  END as status
FROM jtbd_functions jf
JOIN org_functions f ON f.id = jf.function_id
LIMIT 5;

\echo ''

SELECT 
  'Department Mapping' as mapping_type,
  jd.jtbd_id::TEXT as jtbd_id,
  jd.department_id::TEXT as foreign_id,
  jd.department_name as cached_name,
  d.name as actual_name,
  CASE 
    WHEN jd.department_name = d.name THEN '✓ Match'
    ELSE '✗ Mismatch'
  END as status
FROM jtbd_departments jd
JOIN org_departments d ON d.id = jd.department_id
LIMIT 5;

\echo ''

SELECT 
  'Role Mapping' as mapping_type,
  jr.jtbd_id::TEXT as jtbd_id,
  jr.role_id::TEXT as foreign_id,
  jr.role_name as cached_name,
  r.name as actual_name,
  CASE 
    WHEN jr.role_name = r.name THEN '✓ Match'
    ELSE '✗ Mismatch'
  END as status
FROM jtbd_roles jr
JOIN org_roles r ON r.id = jr.role_id
LIMIT 5;

-- ==========================================
-- 10. PERFORMANCE CHECK
-- ==========================================

\echo ''
\echo '10. Query performance check (using indexes)...'
\echo ''

EXPLAIN (FORMAT TEXT, ANALYZE FALSE)
SELECT j.*, 
       STRING_AGG(DISTINCT jf.function_name, ', ') as functions,
       STRING_AGG(DISTINCT jd.department_name, ', ') as departments,
       STRING_AGG(DISTINCT jr.role_name, ', ') as roles
FROM jtbd j
LEFT JOIN jtbd_functions jf ON j.id = jf.jtbd_id
LEFT JOIN jtbd_departments jd ON j.id = jd.jtbd_id
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id
WHERE j.deleted_at IS NULL
GROUP BY j.id
LIMIT 10;

-- ==========================================
-- FINAL SUMMARY
-- ==========================================

\echo ''
\echo '========================================'
\echo 'PHASE 1 VERIFICATION COMPLETE'
\echo '========================================'
\echo ''
\echo 'Review results above:'
\echo '  ✓ = PASS'
\echo '  ✗ = FAIL'
\echo ''
\echo 'All checks should show ✓ for Phase 1 to be complete.'
\echo ''

