-- ==========================================
-- FILE: phase6_capability_normalization.sql
-- PURPOSE: Phase 1.3 - Create capability junction tables
-- PHASE: 6 of 8 (continuing from previous phases)
-- DEPENDENCIES: capabilities, org_functions, org_departments, org_roles tables
-- GOLDEN RULES: Junction tables with ID+NAME pattern, no denormalized org fields
-- ==========================================

-- ==========================================
-- SECTION 1: BACKUP & DISCOVERY
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '=== PHASE 6: CAPABILITY NORMALIZATION ===';
  RAISE NOTICE 'Goal: Create junction tables for capability↔org structure mappings';
  RAISE NOTICE '';
END $$;

-- Create backup
CREATE TABLE IF NOT EXISTS capabilities_backup_phase6 AS SELECT * FROM capabilities;

DO $$
DECLARE
  cap_count INTEGER;
  with_function INTEGER := 0;
  with_department INTEGER := 0;
  with_role INTEGER := 0;
BEGIN
  SELECT COUNT(*) INTO cap_count FROM capabilities;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'function_id') THEN
    EXECUTE 'SELECT COUNT(*) FROM capabilities WHERE function_id IS NOT NULL' INTO with_function;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'department_id') THEN
    EXECUTE 'SELECT COUNT(*) FROM capabilities WHERE department_id IS NOT NULL' INTO with_department;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'role_id') THEN
    EXECUTE 'SELECT COUNT(*) FROM capabilities WHERE role_id IS NOT NULL' INTO with_role;
  END IF;
  
  RAISE NOTICE '=== CURRENT STATE ===';
  RAISE NOTICE 'Total capabilities: %', cap_count;
  RAISE NOTICE 'With function_id: %', with_function;
  RAISE NOTICE 'With department_id: %', with_department;
  RAISE NOTICE 'With role_id: %', with_role;
  RAISE NOTICE '';
END $$;

-- ==========================================
-- SECTION 2: CREATE JUNCTION TABLES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '=== CREATING CAPABILITY JUNCTION TABLES ===';
END $$;

-- Junction table: capability ↔ functions
CREATE TABLE IF NOT EXISTS capability_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  function_id UUID NOT NULL REFERENCES org_functions(id) ON DELETE CASCADE,
  function_name TEXT, -- cached for performance
  relevance_score NUMERIC(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(capability_id, function_id)
);

CREATE INDEX IF NOT EXISTS idx_capability_functions_capability 
  ON capability_functions(capability_id);
CREATE INDEX IF NOT EXISTS idx_capability_functions_function 
  ON capability_functions(function_id);
CREATE INDEX IF NOT EXISTS idx_capability_functions_name 
  ON capability_functions(function_name);

DO $$
BEGIN
  RAISE NOTICE '✓ Created capability_functions table';
END $$;

-- Junction table: capability ↔ departments
CREATE TABLE IF NOT EXISTS capability_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,
  department_name TEXT, -- cached for performance
  relevance_score NUMERIC(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(capability_id, department_id)
);

CREATE INDEX IF NOT EXISTS idx_capability_departments_capability 
  ON capability_departments(capability_id);
CREATE INDEX IF NOT EXISTS idx_capability_departments_department 
  ON capability_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_capability_departments_name 
  ON capability_departments(department_name);

DO $$
BEGIN
  RAISE NOTICE '✓ Created capability_departments table';
END $$;

-- Junction table: capability ↔ roles
CREATE TABLE IF NOT EXISTS capability_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  role_name TEXT, -- cached for performance
  proficiency_required TEXT CHECK (proficiency_required IN ('basic', 'intermediate', 'advanced', 'expert')),
  is_core_capability BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(capability_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_capability_roles_capability 
  ON capability_roles(capability_id);
CREATE INDEX IF NOT EXISTS idx_capability_roles_role 
  ON capability_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_capability_roles_name 
  ON capability_roles(role_name);

DO $$
BEGIN
  RAISE NOTICE '✓ Created capability_roles table';
END $$;

-- ==========================================
-- SECTION 3: MIGRATE DATA FROM CAPABILITIES TABLE
-- ==========================================

DO $$
DECLARE
  row_count INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== MIGRATING DATA TO JUNCTION TABLES ===';
  
  -- Migrate function mappings
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'capabilities' AND column_name = 'function_id') THEN
    INSERT INTO capability_functions (
      capability_id, function_id, function_name, is_primary, created_at
    )
    SELECT 
      c.id, 
      c.function_id,
      COALESCE(c.function_name, f.name),
      true,
      NOW()
    FROM capabilities c
    JOIN org_functions f ON c.function_id = f.id
    WHERE c.function_id IS NOT NULL
    ON CONFLICT (capability_id, function_id) DO NOTHING;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % function mappings', row_count;
  ELSE
    RAISE NOTICE '⊗ capabilities.function_id column does not exist';
  END IF;
  
  -- Migrate department mappings
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'capabilities' AND column_name = 'department_id') THEN
    INSERT INTO capability_departments (
      capability_id, department_id, department_name, is_primary, created_at
    )
    SELECT 
      c.id, 
      c.department_id,
      COALESCE(c.department_name, d.name),
      true,
      NOW()
    FROM capabilities c
    JOIN org_departments d ON c.department_id = d.id
    WHERE c.department_id IS NOT NULL
    ON CONFLICT (capability_id, department_id) DO NOTHING;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % department mappings', row_count;
  ELSE
    RAISE NOTICE '⊗ capabilities.department_id column does not exist';
  END IF;
  
  -- Migrate role mappings
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'capabilities' AND column_name = 'role_id') THEN
    INSERT INTO capability_roles (
      capability_id, role_id, role_name, is_core_capability, created_at
    )
    SELECT 
      c.id, 
      c.role_id,
      COALESCE(c.role_name, r.name),
      true,
      NOW()
    FROM capabilities c
    JOIN org_roles r ON c.role_id = r.id
    WHERE c.role_id IS NOT NULL
    ON CONFLICT (capability_id, role_id) DO NOTHING;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % role mappings', row_count;
  ELSE
    RAISE NOTICE '⊗ capabilities.role_id column does not exist';
  END IF;
END $$;

-- ==========================================
-- SECTION 4: CREATE NAME SYNC TRIGGERS
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== CREATING NAME SYNC TRIGGERS ===';
END $$;

-- Trigger function for capability_functions
CREATE OR REPLACE FUNCTION sync_capability_function_name()
RETURNS TRIGGER AS $$
BEGIN
  SELECT name INTO NEW.function_name
  FROM org_functions
  WHERE id = NEW.function_id;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_capability_function_name ON capability_functions;
CREATE TRIGGER trigger_sync_capability_function_name
  BEFORE INSERT OR UPDATE OF function_id ON capability_functions
  FOR EACH ROW
  EXECUTE FUNCTION sync_capability_function_name();

DO $$
BEGIN
  RAISE NOTICE '✓ Created function name sync trigger';
END $$;

-- Trigger function for capability_departments
CREATE OR REPLACE FUNCTION sync_capability_department_name()
RETURNS TRIGGER AS $$
BEGIN
  SELECT name INTO NEW.department_name
  FROM org_departments
  WHERE id = NEW.department_id;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_capability_department_name ON capability_departments;
CREATE TRIGGER trigger_sync_capability_department_name
  BEFORE INSERT OR UPDATE OF department_id ON capability_departments
  FOR EACH ROW
  EXECUTE FUNCTION sync_capability_department_name();

DO $$
BEGIN
  RAISE NOTICE '✓ Created department name sync trigger';
END $$;

-- Trigger function for capability_roles
CREATE OR REPLACE FUNCTION sync_capability_role_name()
RETURNS TRIGGER AS $$
BEGIN
  SELECT name INTO NEW.role_name
  FROM org_roles
  WHERE id = NEW.role_id;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_capability_role_name ON capability_roles;
CREATE TRIGGER trigger_sync_capability_role_name
  BEFORE INSERT OR UPDATE OF role_id ON capability_roles
  FOR EACH ROW
  EXECUTE FUNCTION sync_capability_role_name();

DO $$
BEGIN
  RAISE NOTICE '✓ Created role name sync trigger';
END $$;

-- ==========================================
-- SECTION 5: BACKFILL MISSING NAMES
-- ==========================================

DO $$
DECLARE
  row_count INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== BACKFILLING MISSING NAMES ===';
  
  -- Backfill function names
  UPDATE capability_functions cf
  SET function_name = f.name, updated_at = NOW()
  FROM org_functions f
  WHERE cf.function_id = f.id
    AND (cf.function_name IS NULL OR cf.function_name = '');
  
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Backfilled % function names', row_count;
  
  -- Backfill department names
  UPDATE capability_departments cd
  SET department_name = d.name, updated_at = NOW()
  FROM org_departments d
  WHERE cd.department_id = d.id
    AND (cd.department_name IS NULL OR cd.department_name = '');
  
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Backfilled % department names', row_count;
  
  -- Backfill role names
  UPDATE capability_roles cr
  SET role_name = r.name, updated_at = NOW()
  FROM org_roles r
  WHERE cr.role_id = r.id
    AND (cr.role_name IS NULL OR cr.role_name = '');
  
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Backfilled % role names', row_count;
END $$;

-- ==========================================
-- SECTION 6: MARK OLD COLUMNS AS DEPRECATED
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== MARKING OLD COLUMNS AS DEPRECATED ===';
  
  -- Add deprecation comments (don't drop yet for backward compatibility)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'function_id') THEN
    EXECUTE 'COMMENT ON COLUMN capabilities.function_id IS ''DEPRECATED: Use capability_functions junction table instead. Will be removed in v2.0''';
    RAISE NOTICE '✓ Marked capabilities.function_id as deprecated';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'function_name') THEN
    EXECUTE 'COMMENT ON COLUMN capabilities.function_name IS ''DEPRECATED: Use capability_functions junction table instead. Will be removed in v2.0''';
    RAISE NOTICE '✓ Marked capabilities.function_name as deprecated';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'department_id') THEN
    EXECUTE 'COMMENT ON COLUMN capabilities.department_id IS ''DEPRECATED: Use capability_departments junction table instead. Will be removed in v2.0''';
    RAISE NOTICE '✓ Marked capabilities.department_id as deprecated';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'department_name') THEN
    EXECUTE 'COMMENT ON COLUMN capabilities.department_name IS ''DEPRECATED: Use capability_departments junction table instead. Will be removed in v2.0''';
    RAISE NOTICE '✓ Marked capabilities.department_name as deprecated';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'role_id') THEN
    EXECUTE 'COMMENT ON COLUMN capabilities.role_id IS ''DEPRECATED: Use capability_roles junction table instead. Will be removed in v2.0''';
    RAISE NOTICE '✓ Marked capabilities.role_id as deprecated';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'role_name') THEN
    EXECUTE 'COMMENT ON COLUMN capabilities.role_name IS ''DEPRECATED: Use capability_roles junction table instead. Will be removed in v2.0''';
    RAISE NOTICE '✓ Marked capabilities.role_name as deprecated';
  END IF;
END $$;

-- ==========================================
-- SECTION 7: VERIFICATION QUERIES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== VERIFICATION ===';
END $$;

-- Verify junction tables
SELECT 
  'capability_functions' as table_name,
  COUNT(*) as total,
  COUNT(function_name) as with_name,
  COUNT(*) - COUNT(function_name) as missing_name
FROM capability_functions
UNION ALL
SELECT 
  'capability_departments',
  COUNT(*),
  COUNT(department_name),
  COUNT(*) - COUNT(department_name)
FROM capability_departments
UNION ALL
SELECT 
  'capability_roles',
  COUNT(*),
  COUNT(role_name),
  COUNT(*) - COUNT(role_name)
FROM capability_roles;

-- Check for orphaned mappings (should be 0)
SELECT 
  'Orphaned capability_functions' as check_name,
  COUNT(*) as count
FROM capability_functions cf
WHERE NOT EXISTS (SELECT 1 FROM capabilities c WHERE c.id = cf.capability_id)
   OR NOT EXISTS (SELECT 1 FROM org_functions f WHERE f.id = cf.function_id)
UNION ALL
SELECT 
  'Orphaned capability_departments',
  COUNT(*)
FROM capability_departments cd
WHERE NOT EXISTS (SELECT 1 FROM capabilities c WHERE c.id = cd.capability_id)
   OR NOT EXISTS (SELECT 1 FROM org_departments d WHERE d.id = cd.department_id)
UNION ALL
SELECT 
  'Orphaned capability_roles',
  COUNT(*)
FROM capability_roles cr
WHERE NOT EXISTS (SELECT 1 FROM capabilities c WHERE c.id = cr.capability_id)
   OR NOT EXISTS (SELECT 1 FROM org_roles r WHERE r.id = cr.role_id);

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ PHASE 6 COMPLETE: CAPABILITY NORMALIZATION';
  RAISE NOTICE '';
  RAISE NOTICE 'Achievements:';
  RAISE NOTICE '  ✓ Created capability_functions junction table';
  RAISE NOTICE '  ✓ Created capability_departments junction table';
  RAISE NOTICE '  ✓ Created capability_roles junction table';
  RAISE NOTICE '  ✓ All junction tables follow ID+NAME pattern';
  RAISE NOTICE '  ✓ Name sync triggers created';
  RAISE NOTICE '  ✓ Old columns marked as deprecated';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Phase 7 - Complete Array Cleanup';
END $$;

