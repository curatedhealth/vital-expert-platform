-- Migration: Update all agents with proper organizational structure foreign key references
-- Created: 2025-10-02
-- Purpose: Map existing agent string values (business_function, department, role) to foreign key IDs

-- Step 1: Update agents.function_id based on business_function string
-- This maps string values like 'research_and_development' to the org_functions table
UPDATE agents a
SET function_id = f.id,
    updated_at = CURRENT_TIMESTAMP
FROM org_functions f
WHERE a.function_id IS NULL
  AND a.business_function IS NOT NULL
  AND (
    -- Direct match on unique_id format
    LOWER(REPLACE(f.department_name, ' ', '_')) = LOWER(REPLACE(a.business_function, ' & ', '_and_'))
    OR LOWER(REPLACE(f.department_name, ' & ', '_and_')) = LOWER(REPLACE(a.business_function, ' ', '_'))
    OR LOWER(REPLACE(f.department_name, ' ', '_')) = LOWER(a.business_function)
    -- Partial match for variations
    OR LOWER(f.department_name) LIKE LOWER(CONCAT('%', REPLACE(a.business_function, '_', ' '), '%'))
  );

-- Step 2: Update agents.department_id based on department string
-- This maps department names to the org_departments table
UPDATE agents a
SET department_id = d.id,
    updated_at = CURRENT_TIMESTAMP
FROM org_departments d
WHERE a.department_id IS NULL
  AND a.department IS NOT NULL
  AND (
    -- Exact match
    LOWER(d.department_name) = LOWER(a.department)
    -- Match with underscores replaced by spaces
    OR LOWER(d.department_name) = LOWER(REPLACE(a.department, '_', ' '))
    -- Partial match
    OR LOWER(d.department_name) LIKE LOWER(CONCAT('%', a.department, '%'))
  );

-- Step 3: Update agents.role_id based on role string
-- This maps role names to the org_roles table
UPDATE agents a
SET role_id = r.id,
    updated_at = CURRENT_TIMESTAMP
FROM org_roles r
WHERE a.role_id IS NULL
  AND a.role IS NOT NULL
  AND r.is_active = true
  AND (
    -- Exact match
    LOWER(r.role_name) = LOWER(a.role)
    -- Match with underscores replaced by spaces
    OR LOWER(r.role_name) = LOWER(REPLACE(a.role, '_', ' '))
    -- Partial match
    OR LOWER(r.role_name) LIKE LOWER(CONCAT('%', a.role, '%'))
  );

-- Step 4: For agents where we couldn't match a specific department/role,
-- try to set them based on their function_id
UPDATE agents a
SET department_id = d.id,
    updated_at = CURRENT_TIMESTAMP
FROM org_departments d
WHERE a.department_id IS NULL
  AND a.function_id IS NOT NULL
  AND d.function_id = a.function_id
  AND d.department_name LIKE '%General%'
LIMIT 1;

-- Verification queries (commented out for migration, uncomment to verify):
-- SELECT COUNT(*) as total_agents FROM agents;
-- SELECT COUNT(*) as agents_with_function FROM agents WHERE function_id IS NOT NULL;
-- SELECT COUNT(*) as agents_with_department FROM agents WHERE department_id IS NOT NULL;
-- SELECT COUNT(*) as agents_with_role FROM agents WHERE role_id IS NOT NULL;
--
-- -- Show unmapped agents
-- SELECT id, display_name, business_function, department, role
-- FROM agents
-- WHERE function_id IS NULL OR department_id IS NULL OR role_id IS NULL
-- LIMIT 20;
