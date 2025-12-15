-- Migration: Populate org_roles.function_id based on their department's function
-- Date: 2025-01-02
-- Purpose: Complete the cascading relationship (Function -> Department -> Role)

-- Update all roles to inherit the function_id from their department
UPDATE org_roles r
SET function_id = d.function_id
FROM org_departments d
WHERE r.department_id = d.id
AND d.function_id IS NOT NULL;

-- Verify the update
SELECT
  'Total roles updated' as status,
  COUNT(*) as count
FROM org_roles
WHERE function_id IS NOT NULL;

-- Show breakdown by function
SELECT
  f.department_name as function_name,
  COUNT(r.id) as role_count
FROM org_functions f
LEFT JOIN org_roles r ON r.function_id = f.id
GROUP BY f.id, f.department_name
ORDER BY f.department_name;

-- Show any roles that are still unmapped (should be 0)
SELECT COUNT(*) as unmapped_roles
FROM org_roles
WHERE function_id IS NULL;
