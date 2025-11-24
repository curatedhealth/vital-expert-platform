-- =====================================================================
-- PHASE 1.3: Create Auto-Sync Triggers for JTBD Mapping Names
-- =====================================================================
-- Purpose: Automatically populate *_name columns in JTBD mapping tables
-- when *_id is set, keeping cached names in sync with source tables

-- =====================================================================
-- Trigger: Auto-populate function_name in jtbd_functions
-- =====================================================================
CREATE OR REPLACE FUNCTION sync_jtbd_function_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if function_id is set and function_name is not manually provided
  IF NEW.function_id IS NOT NULL AND (NEW.function_name IS NULL OR NEW.function_name = '') THEN
    SELECT name INTO NEW.function_name
    FROM org_functions
    WHERE id = NEW.function_id;
    
    IF NEW.function_name IS NULL THEN
      RAISE WARNING 'Function ID % not found in org_functions', NEW.function_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_jtbd_function_name ON jtbd_functions;
CREATE TRIGGER trigger_sync_jtbd_function_name
  BEFORE INSERT OR UPDATE OF function_id ON jtbd_functions
  FOR EACH ROW
  EXECUTE FUNCTION sync_jtbd_function_name();

COMMENT ON FUNCTION sync_jtbd_function_name() IS 'Auto-populates function_name from org_functions when function_id is set';

-- =====================================================================
-- Trigger: Auto-populate department_name in jtbd_departments
-- =====================================================================
CREATE OR REPLACE FUNCTION sync_jtbd_department_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if department_id is set and department_name is not manually provided
  IF NEW.department_id IS NOT NULL AND (NEW.department_name IS NULL OR NEW.department_name = '') THEN
    SELECT name INTO NEW.department_name
    FROM org_departments
    WHERE id = NEW.department_id;
    
    IF NEW.department_name IS NULL THEN
      RAISE WARNING 'Department ID % not found in org_departments', NEW.department_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_jtbd_department_name ON jtbd_departments;
CREATE TRIGGER trigger_sync_jtbd_department_name
  BEFORE INSERT OR UPDATE OF department_id ON jtbd_departments
  FOR EACH ROW
  EXECUTE FUNCTION sync_jtbd_department_name();

COMMENT ON FUNCTION sync_jtbd_department_name() IS 'Auto-populates department_name from org_departments when department_id is set';

-- =====================================================================
-- Trigger: Auto-populate role_name in jtbd_roles
-- =====================================================================
CREATE OR REPLACE FUNCTION sync_jtbd_role_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if role_id is set and role_name is not manually provided
  IF NEW.role_id IS NOT NULL AND (NEW.role_name IS NULL OR NEW.role_name = '') THEN
    SELECT name INTO NEW.role_name
    FROM org_roles
    WHERE id = NEW.role_id;
    
    IF NEW.role_name IS NULL THEN
      RAISE WARNING 'Role ID % not found in org_roles', NEW.role_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_jtbd_role_name ON jtbd_roles;
CREATE TRIGGER trigger_sync_jtbd_role_name
  BEFORE INSERT OR UPDATE OF role_id ON jtbd_roles
  FOR EACH ROW
  EXECUTE FUNCTION sync_jtbd_role_name();

COMMENT ON FUNCTION sync_jtbd_role_name() IS 'Auto-populates role_name from org_roles when role_id is set';

-- =====================================================================
-- Backfill existing records (populate names for existing mappings)
-- =====================================================================
DO $$
DECLARE
  func_updated INTEGER;
  dept_updated INTEGER;
  role_updated INTEGER;
BEGIN
  -- Backfill function names
  UPDATE jtbd_functions jf
  SET function_name = f.name
  FROM org_functions f
  WHERE jf.function_id = f.id 
    AND (jf.function_name IS NULL OR jf.function_name = '');
  
  GET DIAGNOSTICS func_updated = ROW_COUNT;
  RAISE NOTICE '✓ Backfilled % function names in jtbd_functions', func_updated;
  
  -- Backfill department names
  UPDATE jtbd_departments jd
  SET department_name = d.name
  FROM org_departments d
  WHERE jd.department_id = d.id 
    AND (jd.department_name IS NULL OR jd.department_name = '');
  
  GET DIAGNOSTICS dept_updated = ROW_COUNT;
  RAISE NOTICE '✓ Backfilled % department names in jtbd_departments', dept_updated;
  
  -- Backfill role names
  UPDATE jtbd_roles jr
  SET role_name = r.name
  FROM org_roles r
  WHERE jr.role_id = r.id 
    AND (jr.role_name IS NULL OR jr.role_name = '');
  
  GET DIAGNOSTICS role_updated = ROW_COUNT;
  RAISE NOTICE '✓ Backfilled % role names in jtbd_roles', role_updated;
  
  RAISE NOTICE '=== JTBD NAME SYNC TRIGGERS CREATED & BACKFILLED ===';
  RAISE NOTICE 'All JTBD mapping tables now auto-sync names from org tables';
END $$;

