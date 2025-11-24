-- =====================================================================
-- PHASE 1.2: Create JTBD Organization Mapping Tables (ID + NAME Pattern)
-- =====================================================================
-- Purpose: Create junction tables for JTBD → Function/Department/Role
-- with both ID and NAME cached for human-readable queries

-- =====================================================================
-- JTBD → Functions Mapping
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.jtbd_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL,
  function_id UUID NOT NULL,
  function_name TEXT NOT NULL,  -- Cached for queries, auto-synced via trigger
  
  -- Mapping metadata
  relevance_score NUMERIC(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_primary BOOLEAN DEFAULT FALSE,
  mapping_source TEXT DEFAULT 'manual' 
    CHECK (mapping_source IN ('manual', 'ai_suggested', 'imported', 'derived', 'migrated')),
  
  -- Multi-tenant
  tenant_id UUID,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(jtbd_id, function_id)
);

CREATE INDEX IF NOT EXISTS idx_jtbd_functions_jtbd ON jtbd_functions(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_functions_name ON jtbd_functions(function_name);
CREATE INDEX IF NOT EXISTS idx_jtbd_functions_function ON jtbd_functions(function_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_functions_tenant ON jtbd_functions(tenant_id);

COMMENT ON TABLE jtbd_functions IS 'Maps JTBDs to organizational functions with cached name for performance';
COMMENT ON COLUMN jtbd_functions.function_name IS 'Cached from org_functions.name, auto-synced by trigger';

-- =====================================================================
-- JTBD → Departments Mapping
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.jtbd_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL,
  department_id UUID NOT NULL,
  department_name TEXT NOT NULL,  -- Cached for queries, auto-synced via trigger
  
  -- Mapping metadata
  relevance_score NUMERIC(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_primary BOOLEAN DEFAULT FALSE,
  mapping_source TEXT DEFAULT 'manual'
    CHECK (mapping_source IN ('manual', 'ai_suggested', 'imported', 'derived', 'migrated')),
  
  -- Multi-tenant
  tenant_id UUID,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(jtbd_id, department_id)
);

CREATE INDEX IF NOT EXISTS idx_jtbd_departments_jtbd ON jtbd_departments(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_departments_name ON jtbd_departments(department_name);
CREATE INDEX IF NOT EXISTS idx_jtbd_departments_dept ON jtbd_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_departments_tenant ON jtbd_departments(tenant_id);

COMMENT ON TABLE jtbd_departments IS 'Maps JTBDs to organizational departments with cached name for performance';
COMMENT ON COLUMN jtbd_departments.department_name IS 'Cached from org_departments.name, auto-synced by trigger';

-- =====================================================================
-- JTBD → Roles Mapping (Enhance Existing + Consolidate Duplicates)
-- =====================================================================

-- Add role_name column if it doesn't exist
ALTER TABLE public.jtbd_roles 
  ADD COLUMN IF NOT EXISTS role_name TEXT;

-- Add other standard columns if missing
ALTER TABLE public.jtbd_roles 
  ADD COLUMN IF NOT EXISTS relevance_score NUMERIC(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS mapping_source TEXT DEFAULT 'manual'
    CHECK (mapping_source IN ('manual', 'ai_suggested', 'imported', 'derived', 'migrated_from_role_jtbd'));

-- Add columns from role_jtbd if missing
ALTER TABLE public.jtbd_roles
  ADD COLUMN IF NOT EXISTS importance TEXT,
  ADD COLUMN IF NOT EXISTS frequency TEXT,
  ADD COLUMN IF NOT EXISTS sequence_order INTEGER;

-- Add tenant_id if missing
ALTER TABLE public.jtbd_roles
  ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add indexes for role_name
CREATE INDEX IF NOT EXISTS idx_jtbd_roles_name ON jtbd_roles(role_name);
CREATE INDEX IF NOT EXISTS idx_jtbd_roles_tenant ON jtbd_roles(tenant_id) WHERE tenant_id IS NOT NULL;

COMMENT ON COLUMN jtbd_roles.role_name IS 'Cached from org_roles.name, auto-synced by trigger';

-- =====================================================================
-- Consolidate role_jtbd into jtbd_roles (if role_jtbd exists)
-- =====================================================================
DO $$
BEGIN
  -- Check if role_jtbd table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_jtbd' AND table_schema = 'public') THEN
    
    -- Migrate data from role_jtbd to jtbd_roles
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
    
    RAISE NOTICE '✓ Migrated data from role_jtbd to jtbd_roles';
    
    -- Drop the duplicate table
    DROP TABLE IF EXISTS public.role_jtbd CASCADE;
    
    RAISE NOTICE '✓ Dropped duplicate role_jtbd table';
  ELSE
    RAISE NOTICE '✓ No role_jtbd table found (already consolidated)';
  END IF;
END $$;

-- =====================================================================
-- Create updated_at trigger for new tables
-- =====================================================================
CREATE OR REPLACE FUNCTION update_jtbd_mapping_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_jtbd_functions_updated ON jtbd_functions;
CREATE TRIGGER trigger_jtbd_functions_updated
  BEFORE UPDATE ON jtbd_functions
  FOR EACH ROW
  EXECUTE FUNCTION update_jtbd_mapping_timestamp();

DROP TRIGGER IF EXISTS trigger_jtbd_departments_updated ON jtbd_departments;
CREATE TRIGGER trigger_jtbd_departments_updated
  BEFORE UPDATE ON jtbd_departments
  FOR EACH ROW
  EXECUTE FUNCTION update_jtbd_mapping_timestamp();

DO $$
BEGIN
  RAISE NOTICE '=== JTBD ORG MAPPING TABLES CREATED ===';
  RAISE NOTICE 'Next step: Run 03_jtbd_name_sync_triggers.sql to enable auto-sync';
END $$;

