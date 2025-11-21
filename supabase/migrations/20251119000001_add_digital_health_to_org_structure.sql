-- Migration: Add Digital Health tenant to org structure allowed_tenants
-- Created: 2025-11-19
-- Description: Add Digital Health tenant ID to allowed_tenants for org_functions, org_departments, and org_roles
--              This ensures Digital Health tenant can access org structure data for filtering

-- Tenant IDs:
-- VITAL Expert Platform: c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244
-- Digital Health: 684f6c2c-b50d-4726-ad92-c76c3b785a89
-- Pharmaceuticals: c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

-- =====================================================================
-- ADD DIGITAL HEALTH TO ORG_FUNCTIONS ALLOWED_TENANTS
-- =====================================================================

-- Update org_functions to include Digital Health tenant
UPDATE org_functions
SET allowed_tenants = 
  CASE 
    -- If allowed_tenants is NULL, set to all three tenants
    WHEN allowed_tenants IS NULL THEN ARRAY[
      'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid,
      '684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid,
      'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid
    ]
    -- If Digital Health is not already in the array, add it
    WHEN NOT ('684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid = ANY(allowed_tenants)) THEN 
      allowed_tenants || ARRAY['684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid]
    -- Otherwise, keep as is
    ELSE allowed_tenants
  END
WHERE allowed_tenants IS NULL 
   OR NOT ('684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid = ANY(allowed_tenants));

-- =====================================================================
-- ADD DIGITAL HEALTH TO ORG_DEPARTMENTS ALLOWED_TENANTS
-- =====================================================================

UPDATE org_departments
SET allowed_tenants = 
  CASE 
    WHEN allowed_tenants IS NULL THEN ARRAY[
      'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid,
      '684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid,
      'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid
    ]
    WHEN NOT ('684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid = ANY(allowed_tenants)) THEN 
      allowed_tenants || ARRAY['684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid]
    ELSE allowed_tenants
  END
WHERE allowed_tenants IS NULL 
   OR NOT ('684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid = ANY(allowed_tenants));

-- =====================================================================
-- ADD DIGITAL HEALTH TO ORG_ROLES ALLOWED_TENANTS
-- =====================================================================

UPDATE org_roles
SET allowed_tenants = 
  CASE 
    WHEN allowed_tenants IS NULL THEN ARRAY[
      'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid,
      '684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid,
      'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid
    ]
    WHEN NOT ('684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid = ANY(allowed_tenants)) THEN 
      allowed_tenants || ARRAY['684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid]
    ELSE allowed_tenants
  END
WHERE allowed_tenants IS NULL 
   OR NOT ('684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid = ANY(allowed_tenants));

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Check how many rows have Digital Health access
SELECT 
  'org_functions' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE '684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid = ANY(allowed_tenants)) as digital_health_access,
  COUNT(*) FILTER (WHERE allowed_tenants IS NULL) as null_allowed_tenants
FROM org_functions
UNION ALL
SELECT 
  'org_departments',
  COUNT(*),
  COUNT(*) FILTER (WHERE '684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE allowed_tenants IS NULL)
FROM org_departments
UNION ALL
SELECT 
  'org_roles',
  COUNT(*),
  COUNT(*) FILTER (WHERE '684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE allowed_tenants IS NULL)
FROM org_roles;


