-- Migration: Update personas function_id and department_id based on role_id
-- Created: 2025-11-19
-- Description: Populate function_id and department_id in personas table based on their role_id relationships
--              This ensures normalized data schema where personas inherit org structure from their roles

-- =====================================================================
-- UPDATE PERSONAS WITH FUNCTION_ID AND DEPARTMENT_ID FROM ROLES
-- =====================================================================

-- Update personas that have a role_id but are missing function_id
-- Get function_id from the role's function_id
UPDATE personas p
SET 
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE 
  p.role_id = r.id
  AND p.role_id IS NOT NULL
  AND r.function_id IS NOT NULL
  AND (p.function_id IS NULL OR p.function_id != r.function_id);

-- Update personas that have a role_id but are missing department_id
-- Get department_id from the role's department_id
UPDATE personas p
SET 
  department_id = r.department_id,
  updated_at = NOW()
FROM org_roles r
WHERE 
  p.role_id = r.id
  AND p.role_id IS NOT NULL
  AND r.department_id IS NOT NULL
  AND (p.department_id IS NULL OR p.department_id != r.department_id);

-- =====================================================================
-- CREATE FUNCTION TO AUTO-UPDATE ON ROLE CHANGE (OPTIONAL)
-- =====================================================================

-- Function to automatically update persona's function_id and department_id when role_id changes
CREATE OR REPLACE FUNCTION update_persona_org_from_role()
RETURNS TRIGGER AS $$
BEGIN
  -- If role_id is set, update function_id and department_id from the role
  IF NEW.role_id IS NOT NULL THEN
    SELECT 
      r.function_id,
      r.department_id
    INTO 
      NEW.function_id,
      NEW.department_id
    FROM org_roles r
    WHERE r.id = NEW.role_id;
    
    -- Update timestamp
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update function_id and department_id when role_id is set/changed
DROP TRIGGER IF EXISTS trigger_update_persona_org_from_role ON personas;
CREATE TRIGGER trigger_update_persona_org_from_role
  BEFORE INSERT OR UPDATE OF role_id ON personas
  FOR EACH ROW
  WHEN (NEW.role_id IS NOT NULL)
  EXECUTE FUNCTION update_persona_org_from_role();

-- =====================================================================
-- VERIFICATION QUERIES (for manual checking)
-- =====================================================================

-- Check how many personas were updated
-- SELECT 
--   COUNT(*) FILTER (WHERE function_id IS NOT NULL) as personas_with_function,
--   COUNT(*) FILTER (WHERE department_id IS NOT NULL) as personas_with_department,
--   COUNT(*) FILTER (WHERE role_id IS NOT NULL) as personas_with_role,
--   COUNT(*) as total_personas
-- FROM personas;

-- Check personas that have role_id but are missing function_id or department_id
-- (should be 0 after migration)
-- SELECT 
--   id,
--   name,
--   role_id,
--   function_id,
--   department_id
-- FROM personas
-- WHERE role_id IS NOT NULL
--   AND (function_id IS NULL OR department_id IS NULL);


