-- =====================================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql
-- =====================================================================

-- Tenant IDs Reference:
-- VITAL Expert Platform: c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244
-- Pharmaceuticals: c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

-- STEP 1: Check what columns exist in org tables
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('org_functions', 'org_departments', 'org_roles')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- STEP 2: Add tenant_id columns
ALTER TABLE org_functions ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE org_departments ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- STEP 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_org_functions_tenant_id ON org_functions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_departments_tenant_id ON org_departments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_tenant_id ON org_roles(tenant_id);

-- STEP 4: Set existing data to VITAL Expert Platform
UPDATE org_functions SET tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' WHERE tenant_id IS NULL;
UPDATE org_departments SET tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' WHERE tenant_id IS NULL;
UPDATE org_roles SET tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' WHERE tenant_id IS NULL;

-- STEP 5: Check counts before duplication
SELECT 'Current counts' as info;
SELECT 'org_functions' as table_name, tenant_id, COUNT(*) as count FROM org_functions GROUP BY tenant_id
UNION ALL
SELECT 'org_departments', tenant_id, COUNT(*) FROM org_departments GROUP BY tenant_id
UNION ALL
SELECT 'org_roles', tenant_id, COUNT(*) FROM org_roles GROUP BY tenant_id
ORDER BY table_name;
