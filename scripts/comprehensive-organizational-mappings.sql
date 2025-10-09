-- Comprehensive Organizational Structure Mapping Script
-- Generated from CSV data analysis
-- Run this in your Supabase SQL editor

-- =====================================================================
-- 1. DEPARTMENT TO FUNCTION MAPPINGS (Existing Departments)
-- =====================================================================



-- =====================================================================
-- 2. MISSING DEPARTMENTS (Need to be created)
-- =====================================================================



-- =====================================================================
-- 3. MISSING FUNCTIONS (Need to be created)
-- =====================================================================



-- =====================================================================
-- 4. ROLE TO DEPARTMENT MAPPINGS (Based on CSV data)
-- =====================================================================



-- =====================================================================
-- 5. VERIFICATION QUERIES
-- =====================================================================

-- Check department mappings
SELECT 
  'Departments mapped to functions' as type,
  COUNT(*) as count
FROM org_departments 
WHERE function_id IS NOT NULL;

-- Check role mappings
SELECT 
  'Roles mapped to departments' as type,
  COUNT(*) as count
FROM org_roles 
WHERE department_id IS NOT NULL;

-- Show hierarchical structure
SELECT 
  f.department_name as function_name,
  d.department_name,
  COUNT(r.id) as role_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
GROUP BY f.id, f.department_name, d.id, d.department_name
ORDER BY f.department_name, d.department_name;

-- Show missing departments
SELECT 
  'Missing departments' as type,
  COUNT(*) as count
FROM org_departments 
WHERE function_id IS NULL;
