-- ==========================================
-- FILE: phase1_foundation_cleanup.sql
-- PURPOSE: Clean JTBD core table, consolidate duplicate mappings, establish normalized org mappings
-- PHASE: 1 of 4
-- DEPENDENCIES: jtbd, jtbd_roles, role_jtbd, org_functions, org_departments, org_roles
-- GOLDEN RULES: Implements Rule #1 (Zero JSONB), Rule #2 (3NF), Rule #4 (ID + NAME pattern)
-- ==========================================

-- ==========================================
-- SECTION 1: BACKUP & SAFETY
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '=== PHASE 1: FOUNDATION CLEANUP & CONSOLIDATION ===';
  RAISE NOTICE 'Starting backup and safety checks...';
END $$;

-- Create backup of jtbd table
DO $$
BEGIN
  DROP TABLE IF EXISTS jtbd_backup_phase1;
  CREATE TABLE jtbd_backup_phase1 AS SELECT * FROM jtbd;
  
  RAISE NOTICE '✓ Backup created: jtbd_backup_phase1';
END $$;

-- Create backups of mapping tables
DO $$
DECLARE
  role_jtbd_count INTEGER;
  jtbd_roles_count INTEGER;
BEGIN
  -- Backup role_jtbd if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_jtbd') THEN
    DROP TABLE IF EXISTS role_jtbd_backup;
    CREATE TABLE role_jtbd_backup AS SELECT * FROM role_jtbd;
    SELECT COUNT(*) INTO role_jtbd_count FROM role_jtbd;
    RAISE NOTICE '✓ Backup created: role_jtbd_backup (% rows)', role_jtbd_count;
  ELSE
    RAISE NOTICE '! Table role_jtbd does not exist, skipping backup';
  END IF;
  
  -- Backup jtbd_roles if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_roles') THEN
    DROP TABLE IF EXISTS jtbd_roles_backup;
    CREATE TABLE jtbd_roles_backup AS SELECT * FROM jtbd_roles;
    SELECT COUNT(*) INTO jtbd_roles_count FROM jtbd_roles;
    RAISE NOTICE '✓ Backup created: jtbd_roles_backup (% rows)', jtbd_roles_count;
  END IF;
END $$;

-- Verification query: Count all rows
DO $$
DECLARE
  jtbd_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO jtbd_count FROM jtbd;
  RAISE NOTICE '✓ Total JTBDs: %', jtbd_count;
END $$;

-- ==========================================
-- SECTION 2: DROP CONFLICTING TRIGGERS
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Dropping existing name sync triggers...';
END $$;

-- Drop existing triggers that depend on columns we're about to remove
DO $$
BEGIN
  DROP TRIGGER IF EXISTS trigger_sync_jtbd_org_names ON jtbd;
  RAISE NOTICE '✓ Dropped trigger: trigger_sync_jtbd_org_names';
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE '! Trigger trigger_sync_jtbd_org_names does not exist';
END $$;

DO $$
BEGIN
  DROP TRIGGER IF EXISTS trigger_sync_function_name ON jtbd;
  RAISE NOTICE '✓ Dropped trigger: trigger_sync_function_name';
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE '! Trigger trigger_sync_function_name does not exist';
END $$;

DO $$
BEGIN
  DROP TRIGGER IF EXISTS trigger_sync_department_name ON jtbd;
  RAISE NOTICE '✓ Dropped trigger: trigger_sync_department_name';
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE '! Trigger trigger_sync_department_name does not exist';
END $$;

DO $$
BEGIN
  DROP TRIGGER IF EXISTS trigger_sync_role_name ON jtbd;
  RAISE NOTICE '✓ Dropped trigger: trigger_sync_role_name';
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE '! Trigger trigger_sync_role_name does not exist';
END $$;

-- ==========================================
-- SECTION 3: REMOVE ORG STRUCTURE COLUMNS FROM JTBD
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Removing organizational structure columns from jtbd table...';
END $$;

-- Drop function_id and function_name
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'function_id') THEN
    ALTER TABLE jtbd DROP COLUMN function_id CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.function_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'function_name') THEN
    ALTER TABLE jtbd DROP COLUMN function_name CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.function_name';
  END IF;
END $$;

-- Drop department_id and department_name
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'department_id') THEN
    ALTER TABLE jtbd DROP COLUMN department_id CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.department_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'department_name') THEN
    ALTER TABLE jtbd DROP COLUMN department_name CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.department_name';
  END IF;
END $$;

-- Drop role_id and role_name
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'role_id') THEN
    ALTER TABLE jtbd DROP COLUMN role_id CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.role_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'role_name') THEN
    ALTER TABLE jtbd DROP COLUMN role_name CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.role_name';
  END IF;
END $$;

-- Drop persona_id and org_function_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'persona_id') THEN
    ALTER TABLE jtbd DROP COLUMN persona_id CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.persona_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'org_function_id') THEN
    ALTER TABLE jtbd DROP COLUMN org_function_id CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.org_function_id';
  END IF;
END $$;

-- ==========================================
-- SECTION 4: CREATE/ENHANCE JUNCTION TABLES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Creating/enhancing junction tables with ID + NAME pattern...';
END $$;

-- Create jtbd_functions table
CREATE TABLE IF NOT EXISTS jtbd_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  function_id UUID NOT NULL REFERENCES org_functions(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  
  relevance_score NUMERIC(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_primary BOOLEAN DEFAULT FALSE,
  mapping_source TEXT DEFAULT 'manual',
  
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_jtbd_function UNIQUE(jtbd_id, function_id)
);

DO $$
BEGIN
  RAISE NOTICE '✓ Created table: jtbd_functions';
END $$;

-- Create jtbd_departments table
CREATE TABLE IF NOT EXISTS jtbd_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL,
  
  relevance_score NUMERIC(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_primary BOOLEAN DEFAULT FALSE,
  mapping_source TEXT DEFAULT 'manual',
  
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_jtbd_department UNIQUE(jtbd_id, department_id)
);

DO $$
BEGIN
  RAISE NOTICE '✓ Created table: jtbd_departments';
END $$;

-- Enhance jtbd_roles table (add missing columns)
DO $$
BEGIN
  -- Add role_name if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_roles' AND column_name = 'role_name') THEN
    ALTER TABLE jtbd_roles ADD COLUMN role_name TEXT;
    RAISE NOTICE '✓ Added column: jtbd_roles.role_name';
  END IF;
  
  -- Add importance if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_roles' AND column_name = 'importance') THEN
    ALTER TABLE jtbd_roles ADD COLUMN importance TEXT;
    RAISE NOTICE '✓ Added column: jtbd_roles.importance';
  END IF;
  
  -- Add frequency if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_roles' AND column_name = 'frequency') THEN
    ALTER TABLE jtbd_roles ADD COLUMN frequency TEXT;
    RAISE NOTICE '✓ Added column: jtbd_roles.frequency';
  END IF;
  
  -- Add sequence_order if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_roles' AND column_name = 'sequence_order') THEN
    ALTER TABLE jtbd_roles ADD COLUMN sequence_order INTEGER;
    RAISE NOTICE '✓ Added column: jtbd_roles.sequence_order';
  END IF;
  
  -- Add relevance_score if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_roles' AND column_name = 'relevance_score') THEN
    ALTER TABLE jtbd_roles ADD COLUMN relevance_score NUMERIC(3,2) CHECK (relevance_score BETWEEN 0 AND 1);
    RAISE NOTICE '✓ Added column: jtbd_roles.relevance_score';
  END IF;
  
  -- Add is_primary if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_roles' AND column_name = 'is_primary') THEN
    ALTER TABLE jtbd_roles ADD COLUMN is_primary BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✓ Added column: jtbd_roles.is_primary';
  END IF;
  
  -- Add mapping_source if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_roles' AND column_name = 'mapping_source') THEN
    ALTER TABLE jtbd_roles ADD COLUMN mapping_source TEXT DEFAULT 'manual';
    RAISE NOTICE '✓ Added column: jtbd_roles.mapping_source';
  END IF;
END $$;

-- ==========================================
-- SECTION 5: CONSOLIDATE DUPLICATE TABLES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Consolidating role_jtbd into jtbd_roles...';
END $$;

-- Migrate data from role_jtbd to jtbd_roles
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_jtbd') THEN
    INSERT INTO jtbd_roles (
      jtbd_id,
      role_id,
      importance,
      frequency,
      sequence_order,
      mapping_source,
      created_at
    )
    SELECT 
      rj.jtbd_id,
      rj.role_id,
      rj.importance,
      rj.frequency,
      rj.sequence_order,
      'migrated_from_role_jtbd',
      COALESCE(rj.created_at, NOW())
    FROM role_jtbd rj
    WHERE NOT EXISTS (
      SELECT 1 FROM jtbd_roles jr
      WHERE jr.jtbd_id = rj.jtbd_id AND jr.role_id = rj.role_id
    )
    ON CONFLICT (jtbd_id, role_id) DO NOTHING;
    
    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % rows from role_jtbd to jtbd_roles', migrated_count;
    
    -- Drop the duplicate table
    DROP TABLE IF EXISTS role_jtbd CASCADE;
    RAISE NOTICE '✓ Dropped table: role_jtbd';
  ELSE
    RAISE NOTICE '! Table role_jtbd does not exist, skipping migration';
  END IF;
END $$;

-- ==========================================
-- SECTION 6: CREATE NAME SYNC TRIGGERS
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Creating name synchronization triggers...';
END $$;

-- Function to sync function_name in jtbd_functions
CREATE OR REPLACE FUNCTION sync_jtbd_function_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.function_id IS NOT NULL THEN
    SELECT name INTO NEW.function_name
    FROM org_functions
    WHERE id = NEW.function_id;
    
    IF NEW.function_name IS NULL THEN
      RAISE WARNING 'Function ID % not found in org_functions', NEW.function_id;
    END IF;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for jtbd_functions
DROP TRIGGER IF EXISTS trigger_sync_jtbd_function_name ON jtbd_functions;
CREATE TRIGGER trigger_sync_jtbd_function_name
  BEFORE INSERT OR UPDATE OF function_id ON jtbd_functions
  FOR EACH ROW
  EXECUTE FUNCTION sync_jtbd_function_name();

DO $$
BEGIN
  RAISE NOTICE '✓ Created trigger: trigger_sync_jtbd_function_name';
END $$;

-- Function to sync department_name in jtbd_departments
CREATE OR REPLACE FUNCTION sync_jtbd_department_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.department_id IS NOT NULL THEN
    SELECT name INTO NEW.department_name
    FROM org_departments
    WHERE id = NEW.department_id;
    
    IF NEW.department_name IS NULL THEN
      RAISE WARNING 'Department ID % not found in org_departments', NEW.department_id;
    END IF;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for jtbd_departments
DROP TRIGGER IF EXISTS trigger_sync_jtbd_department_name ON jtbd_departments;
CREATE TRIGGER trigger_sync_jtbd_department_name
  BEFORE INSERT OR UPDATE OF department_id ON jtbd_departments
  FOR EACH ROW
  EXECUTE FUNCTION sync_jtbd_department_name();

DO $$
BEGIN
  RAISE NOTICE '✓ Created trigger: trigger_sync_jtbd_department_name';
END $$;

-- Function to sync role_name in jtbd_roles
CREATE OR REPLACE FUNCTION sync_jtbd_role_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role_id IS NOT NULL THEN
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

-- Trigger for jtbd_roles
DROP TRIGGER IF EXISTS trigger_sync_jtbd_role_name ON jtbd_roles;
CREATE TRIGGER trigger_sync_jtbd_role_name
  BEFORE INSERT OR UPDATE OF role_id ON jtbd_roles
  FOR EACH ROW
  EXECUTE FUNCTION sync_jtbd_role_name();

DO $$
BEGIN
  RAISE NOTICE '✓ Created trigger: trigger_sync_jtbd_role_name';
END $$;

-- ==========================================
-- SECTION 7: BACKFILL EXISTING DATA
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Backfilling existing data with name fields...';
END $$;

-- Backfill function_name in jtbd_functions
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE jtbd_functions jf
  SET function_name = f.name,
      updated_at = NOW()
  FROM org_functions f
  WHERE jf.function_id = f.id
    AND (jf.function_name IS NULL OR jf.function_name != f.name);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✓ Updated % function names in jtbd_functions', updated_count;
END $$;

-- Backfill department_name in jtbd_departments
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE jtbd_departments jd
  SET department_name = d.name,
      updated_at = NOW()
  FROM org_departments d
  WHERE jd.department_id = d.id
    AND (jd.department_name IS NULL OR jd.department_name != d.name);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✓ Updated % department names in jtbd_departments', updated_count;
END $$;

-- Backfill role_name in jtbd_roles
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE jtbd_roles jr
  SET role_name = r.name
  FROM org_roles r
  WHERE jr.role_id = r.id
    AND (jr.role_name IS NULL OR jr.role_name != r.name);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✓ Updated % role names in jtbd_roles', updated_count;
END $$;

-- Verify no NULL names
DO $$
DECLARE
  null_func_names INTEGER;
  null_dept_names INTEGER;
  null_role_names INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_func_names FROM jtbd_functions WHERE function_name IS NULL;
  SELECT COUNT(*) INTO null_dept_names FROM jtbd_departments WHERE department_name IS NULL;
  SELECT COUNT(*) INTO null_role_names FROM jtbd_roles WHERE role_name IS NULL;
  
  IF null_func_names > 0 THEN
    RAISE WARNING '! Found % NULL function_name values in jtbd_functions', null_func_names;
  ELSE
    RAISE NOTICE '✓ All function names populated';
  END IF;
  
  IF null_dept_names > 0 THEN
    RAISE WARNING '! Found % NULL department_name values in jtbd_departments', null_dept_names;
  ELSE
    RAISE NOTICE '✓ All department names populated';
  END IF;
  
  IF null_role_names > 0 THEN
    RAISE WARNING '! Found % NULL role_name values in jtbd_roles', null_role_names;
  ELSE
    RAISE NOTICE '✓ All role names populated';
  END IF;
END $$;

-- ==========================================
-- SECTION 8: CREATE INDEXES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Creating indexes for optimal query performance...';
END $$;

-- Indexes for jtbd_functions
CREATE INDEX IF NOT EXISTS idx_jtbd_functions_jtbd ON jtbd_functions(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_functions_function ON jtbd_functions(function_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_functions_name ON jtbd_functions(function_name);
CREATE INDEX IF NOT EXISTS idx_jtbd_functions_tenant ON jtbd_functions(tenant_id) WHERE tenant_id IS NOT NULL;

DO $$
BEGIN
  RAISE NOTICE '✓ Created indexes for jtbd_functions';
END $$;

-- Indexes for jtbd_departments
CREATE INDEX IF NOT EXISTS idx_jtbd_departments_jtbd ON jtbd_departments(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_departments_dept ON jtbd_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_departments_name ON jtbd_departments(department_name);
CREATE INDEX IF NOT EXISTS idx_jtbd_departments_tenant ON jtbd_departments(tenant_id) WHERE tenant_id IS NOT NULL;

DO $$
BEGIN
  RAISE NOTICE '✓ Created indexes for jtbd_departments';
END $$;

-- Indexes for jtbd_roles
CREATE INDEX IF NOT EXISTS idx_jtbd_roles_jtbd ON jtbd_roles(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_roles_role ON jtbd_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_roles_name ON jtbd_roles(role_name);

DO $$
BEGIN
  RAISE NOTICE '✓ Created indexes for jtbd_roles';
END $$;

-- ==========================================
-- SECTION 9: VERIFICATION QUERIES
-- ==========================================

DO $$
DECLARE
  jtbd_count INTEGER;
  function_mappings INTEGER;
  department_mappings INTEGER;
  role_mappings INTEGER;
  null_func_names INTEGER;
  null_dept_names INTEGER;
  null_role_names INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== PHASE 1 VERIFICATION ===';
  
  -- Count JTBDs
  SELECT COUNT(*) INTO jtbd_count FROM jtbd WHERE deleted_at IS NULL;
  RAISE NOTICE 'Total JTBDs: %', jtbd_count;
  
  -- Count mappings
  SELECT COUNT(*) INTO function_mappings FROM jtbd_functions;
  RAISE NOTICE 'Function mappings: %', function_mappings;
  
  SELECT COUNT(*) INTO department_mappings FROM jtbd_departments;
  RAISE NOTICE 'Department mappings: %', department_mappings;
  
  SELECT COUNT(*) INTO role_mappings FROM jtbd_roles;
  RAISE NOTICE 'Role mappings: %', role_mappings;
  
  -- Check for NULL names
  SELECT COUNT(*) INTO null_func_names FROM jtbd_functions WHERE function_name IS NULL;
  SELECT COUNT(*) INTO null_dept_names FROM jtbd_departments WHERE department_name IS NULL;
  SELECT COUNT(*) INTO null_role_names FROM jtbd_roles WHERE role_name IS NULL;
  
  RAISE NOTICE 'NULL function names: % (should be 0)', null_func_names;
  RAISE NOTICE 'NULL department names: % (should be 0)', null_dept_names;
  RAISE NOTICE 'NULL role names: % (should be 0)', null_role_names;
  
  -- Overall status
  IF null_func_names = 0 AND null_dept_names = 0 AND null_role_names = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '✓✓✓ PHASE 1 COMPLETE - ALL CHECKS PASSED ✓✓✓';
  ELSE
    RAISE WARNING 'Phase 1 completed with warnings - review NULL name counts';
  END IF;
END $$;

-- Human-readable verification query
SELECT 
  'JTBD Count' as metric, 
  COUNT(*)::TEXT as value 
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
FROM jtbd_roles

UNION ALL

SELECT 
  'NULL Function Names', 
  COUNT(*)::TEXT 
FROM jtbd_functions 
WHERE function_name IS NULL

UNION ALL

SELECT 
  'NULL Department Names', 
  COUNT(*)::TEXT 
FROM jtbd_departments 
WHERE department_name IS NULL

UNION ALL

SELECT 
  'NULL Role Names', 
  COUNT(*)::TEXT 
FROM jtbd_roles 
WHERE role_name IS NULL;

