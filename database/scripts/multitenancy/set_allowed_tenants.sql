-- =====================================================================
-- SET ALLOWED TENANTS FOR ORG STRUCTURE
-- Uses array of tenant_ids so one row can be accessed by multiple tenants
-- =====================================================================

-- Tenant IDs:
-- VITAL Expert Platform: c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244
-- Digital Health: 684f6c2c-b50d-4726-ad92-c76c3b785a89
-- Pharmaceuticals: c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

-- =====================================================================
-- 1. ADD allowed_tenants COLUMN (UUID array)
-- =====================================================================

ALTER TABLE org_functions ADD COLUMN IF NOT EXISTS allowed_tenants UUID[];
ALTER TABLE org_departments ADD COLUMN IF NOT EXISTS allowed_tenants UUID[];
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS allowed_tenants UUID[];

-- =====================================================================
-- 2. SET ALLOWED TENANTS TO VITAL & PHARMA (not Digital Health)
-- =====================================================================

UPDATE org_functions
SET allowed_tenants = ARRAY[
  'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid,
  'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid
]
WHERE allowed_tenants IS NULL;

UPDATE org_departments
SET allowed_tenants = ARRAY[
  'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid,
  'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid
]
WHERE allowed_tenants IS NULL;

UPDATE org_roles
SET allowed_tenants = ARRAY[
  'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid,
  'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid
]
WHERE allowed_tenants IS NULL;

-- =====================================================================
-- 3. CREATE GIN INDEX FOR ARRAY QUERIES
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_org_functions_allowed_tenants ON org_functions USING GIN (allowed_tenants);
CREATE INDEX IF NOT EXISTS idx_org_departments_allowed_tenants ON org_departments USING GIN (allowed_tenants);
CREATE INDEX IF NOT EXISTS idx_org_roles_allowed_tenants ON org_roles USING GIN (allowed_tenants);

-- =====================================================================
-- 4. VERIFY
-- =====================================================================

SELECT 'org_functions' as table_name, COUNT(*) as total,
  COUNT(*) FILTER (WHERE 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants)) as vital_access,
  COUNT(*) FILTER (WHERE 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' = ANY(allowed_tenants)) as pharma_access,
  COUNT(*) FILTER (WHERE '684f6c2c-b50d-4726-ad92-c76c3b785a89' = ANY(allowed_tenants)) as digital_health_access
FROM org_functions
UNION ALL
SELECT 'org_departments', COUNT(*),
  COUNT(*) FILTER (WHERE 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE '684f6c2c-b50d-4726-ad92-c76c3b785a89' = ANY(allowed_tenants))
FROM org_departments
UNION ALL
SELECT 'org_roles', COUNT(*),
  COUNT(*) FILTER (WHERE 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE '684f6c2c-b50d-4726-ad92-c76c3b785a89' = ANY(allowed_tenants))
FROM org_roles;

-- =====================================================================
-- NOTE: API queries should use:
-- WHERE $1 = ANY(allowed_tenants)
-- instead of:
-- WHERE tenant_id = $1
-- =====================================================================
