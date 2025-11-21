-- =====================================================================
-- Add tenant_id to organizational structure tables
-- Map functions, departments, roles to VITAL Expert Platform and Pharmaceuticals
-- =====================================================================

-- Tenant IDs
-- VITAL Expert Platform: c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244
-- Digital Health: 684f6c2c-b50d-4726-ad92-c76c3b785a89
-- Pharmaceuticals: c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

-- =====================================================================
-- 1. ADD TENANT_ID COLUMNS
-- =====================================================================

ALTER TABLE org_functions ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE org_departments ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- =====================================================================
-- 2. CREATE INDEXES
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_org_functions_tenant_id ON org_functions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_departments_tenant_id ON org_departments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_tenant_id ON org_roles(tenant_id);

-- =====================================================================
-- 3. SET EXISTING DATA TO VITAL EXPERT PLATFORM
-- =====================================================================

UPDATE org_functions SET tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' WHERE tenant_id IS NULL;
UPDATE org_departments SET tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' WHERE tenant_id IS NULL;
UPDATE org_roles SET tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' WHERE tenant_id IS NULL;

-- =====================================================================
-- 4. VERIFY COUNTS
-- =====================================================================

SELECT 'org_functions' as table_name, tenant_id, COUNT(*) as count FROM org_functions GROUP BY tenant_id
UNION ALL
SELECT 'org_departments', tenant_id, COUNT(*) FROM org_departments GROUP BY tenant_id
UNION ALL
SELECT 'org_roles', tenant_id, COUNT(*) FROM org_roles GROUP BY tenant_id
ORDER BY table_name;

-- NOTE: To duplicate data for Pharmaceuticals, you'll need to run separate
-- INSERT statements based on the actual column structure of your tables.
-- First run this migration to add tenant_id, then query the table structure
-- to create the proper INSERT statements.
