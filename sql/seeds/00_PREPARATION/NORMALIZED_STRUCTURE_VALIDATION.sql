-- ========================================
-- COMPLETE NORMALIZED STRUCTURE VALIDATION
-- ========================================
-- Purpose: Comprehensive validation of organizational hierarchy
-- Date: 2025-11-17
-- Hierarchy: Business Function → Department → Role → Persona
-- ========================================

\echo '==============================================='
\echo 'ORGANIZATIONAL NORMALIZATION VALIDATION REPORT'
\echo '==============================================='
\echo ''

-- ========================================
-- 1. OVERALL SUMMARY
-- ========================================

\echo '1. OVERALL SUMMARY'
\echo '==================='

SELECT
  COUNT(*) as total_personas,
  COUNT(DISTINCT function_id) as total_functions,
  COUNT(DISTINCT department_id) as total_departments,
  COUNT(DISTINCT role_id) as total_roles,
  COUNT(function_id) as personas_with_function,
  COUNT(department_id) as personas_with_department,
  COUNT(role_id) as personas_with_role,
  ROUND(100.0 * COUNT(role_id) / COUNT(*), 1) as percent_fully_mapped
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL;

\echo ''

-- ========================================
-- 2. BY BUSINESS FUNCTION
-- ========================================

\echo '2. BREAKDOWN BY BUSINESS FUNCTION'
\echo '===================================='

SELECT
  CASE
    WHEN p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d' THEN 'Medical Affairs'
    WHEN p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3' THEN 'Market Access'
    ELSE 'Other (' || COALESCE(f.name, 'NULL') || ')'
  END as business_function,
  COUNT(*) as total_personas,
  COUNT(DISTINCT p.department_id) as departments_used,
  COUNT(DISTINCT p.role_id) as roles_used,
  COUNT(p.role_id) as personas_mapped,
  ROUND(100.0 * COUNT(p.role_id) / COUNT(*), 1) as percent_mapped
FROM personas p
LEFT JOIN org_functions f ON p.function_id = f.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
GROUP BY p.function_id, f.name
ORDER BY business_function;

\echo ''

-- ========================================
-- 3. MEDICAL AFFAIRS DETAILS
-- ========================================

\echo '3. MEDICAL AFFAIRS - DEPARTMENT BREAKDOWN'
\echo '==========================================='

SELECT
  d.name as department,
  COUNT(p.id) as persona_count,
  COUNT(DISTINCT p.role_id) as roles_used,
  ROUND(AVG(CASE WHEN p.role_id IS NOT NULL THEN 1.0 ELSE 0.0 END), 3) * 100 as pct_mapped
FROM org_departments d
LEFT JOIN personas p ON p.department_id = d.id AND p.deleted_at IS NULL
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
GROUP BY d.name
ORDER BY persona_count DESC;

\echo ''

\echo '4. MEDICAL AFFAIRS - ROLES WITH PERSONA COUNTS'
\echo '================================================'

SELECT
  r.name as role_name,
  COUNT(p.id) as persona_count
FROM org_roles r
LEFT JOIN personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
GROUP BY r.name
HAVING COUNT(p.id) > 0
ORDER BY persona_count DESC, r.name;

\echo ''

-- ========================================
-- 4. MARKET ACCESS DETAILS
-- ========================================

\echo '5. MARKET ACCESS - DEPARTMENT BREAKDOWN'
\echo '========================================='

SELECT
  d.name as department,
  COUNT(p.id) as persona_count,
  COUNT(DISTINCT p.role_id) as roles_used,
  ROUND(AVG(CASE WHEN p.role_id IS NOT NULL THEN 1.0 ELSE 0.0 END), 3) * 100 as pct_mapped
FROM org_departments d
LEFT JOIN personas p ON p.department_id = d.id AND p.deleted_at IS NULL
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
GROUP BY d.name
ORDER BY persona_count DESC;

\echo ''

\echo '6. MARKET ACCESS - ROLES WITH PERSONA COUNTS'
\echo '==============================================='

SELECT
  r.name as role_name,
  COUNT(p.id) as persona_count
FROM org_roles r
LEFT JOIN personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
GROUP BY r.name
HAVING COUNT(p.id) > 0
ORDER BY persona_count DESC, r.name;

\echo ''

-- ========================================
-- 5. DISTRIBUTION ANALYSIS
-- ========================================

\echo '7. PERSONA DISTRIBUTION PER ROLE (Medical Affairs)'
\echo '====================================================='

SELECT
  personas_per_role,
  COUNT(*) as number_of_roles,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage
FROM (
  SELECT
    r.name,
    COUNT(p.id) as personas_per_role
  FROM org_roles r
  LEFT JOIN personas p ON p.role_id = r.id AND p.deleted_at IS NULL
  WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
    AND r.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  GROUP BY r.name
  HAVING COUNT(p.id) > 0
) role_counts
GROUP BY personas_per_role
ORDER BY personas_per_role;

\echo ''

\echo '8. PERSONA DISTRIBUTION PER ROLE (Market Access)'
\echo '==================================================='

SELECT
  personas_per_role,
  COUNT(*) as number_of_roles,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage
FROM (
  SELECT
    r.name,
    COUNT(p.id) as personas_per_role
  FROM org_roles r
  LEFT JOIN personas p ON p.role_id = r.id AND p.deleted_at IS NULL
  WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
    AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  GROUP BY r.name
  HAVING COUNT(p.id) > 0
) role_counts
GROUP BY personas_per_role
ORDER BY personas_per_role;

\echo ''

-- ========================================
-- 6. UNMAPPED ITEMS (IF ANY)
-- ========================================

\echo '9. UNMAPPED PERSONAS (IF ANY)'
\echo '================================'

SELECT
  COALESCE(f.name, 'NO FUNCTION') as function_name,
  p.title
FROM personas p
LEFT JOIN org_functions f ON p.function_id = f.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
ORDER BY f.name, p.title;

\echo ''

-- ========================================
-- 7. FINAL STATUS
-- ========================================

\echo '10. FINAL VALIDATION STATUS'
\echo '============================='

SELECT
  'Medical Affairs' as function_name,
  COUNT(*) as total_personas,
  COUNT(DISTINCT department_id) as departments,
  COUNT(DISTINCT role_id) as roles,
  CASE
    WHEN COUNT(*) = COUNT(role_id) THEN '✅ COMPLETE (100%)'
    WHEN COUNT(role_id) * 1.0 / COUNT(*) >= 0.95 THEN '⚠️  NEARLY COMPLETE (95%+)'
    ELSE '❌ INCOMPLETE (<95%)'
  END as status
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL
  AND function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'

UNION ALL

SELECT
  'Market Access' as function_name,
  COUNT(*) as total_personas,
  COUNT(DISTINCT department_id) as departments,
  COUNT(DISTINCT role_id) as roles,
  CASE
    WHEN COUNT(*) = COUNT(role_id) THEN '✅ COMPLETE (100%)'
    WHEN COUNT(role_id) * 1.0 / COUNT(*) >= 0.95 THEN '⚠️  NEARLY COMPLETE (95%+)'
    ELSE '❌ INCOMPLETE (<95%)'
  END as status
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL
  AND function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3';

\echo ''
\echo '==============================================='
\echo 'END OF VALIDATION REPORT'
\echo '==============================================='
