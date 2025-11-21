-- =====================================================================
-- COMPLETE TENANT MAPPING FOR ALL DATA TABLES
-- Uses allowed_tenants UUID[] array for multi-tenant access
-- =====================================================================

-- Tenant IDs:
-- VITAL Expert Platform: c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244
-- Digital Health: 684f6c2c-b50d-4726-ad92-c76c3b785a89
-- Pharmaceuticals: c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

-- =====================================================================
-- 1. ORG STRUCTURE (VITAL & PHARMA ONLY)
-- =====================================================================

-- Add columns
ALTER TABLE org_functions ADD COLUMN IF NOT EXISTS allowed_tenants UUID[];
ALTER TABLE org_departments ADD COLUMN IF NOT EXISTS allowed_tenants UUID[];
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS allowed_tenants UUID[];

-- Set VITAL & Pharma only
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_functions_allowed_tenants ON org_functions USING GIN (allowed_tenants);
CREATE INDEX IF NOT EXISTS idx_org_departments_allowed_tenants ON org_departments USING GIN (allowed_tenants);
CREATE INDEX IF NOT EXISTS idx_org_roles_allowed_tenants ON org_roles USING GIN (allowed_tenants);

-- =====================================================================
-- 2. PERSONAS (VITAL & PHARMA ONLY)
-- =====================================================================

ALTER TABLE personas ADD COLUMN IF NOT EXISTS allowed_tenants UUID[];

UPDATE personas
SET allowed_tenants = ARRAY[
  'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid,
  'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid
]
WHERE allowed_tenants IS NULL;

CREATE INDEX IF NOT EXISTS idx_personas_allowed_tenants ON personas USING GIN (allowed_tenants);

-- =====================================================================
-- 3. TOOLS (ALL 3 TENANTS)
-- =====================================================================

ALTER TABLE tools ADD COLUMN IF NOT EXISTS allowed_tenants UUID[];

UPDATE tools
SET allowed_tenants = ARRAY[
  'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid,
  '684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid,
  'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid
]
WHERE allowed_tenants IS NULL;

CREATE INDEX IF NOT EXISTS idx_tools_allowed_tenants ON tools USING GIN (allowed_tenants);

-- =====================================================================
-- 4. PROMPTS (ALL 3 TENANTS)
-- =====================================================================

ALTER TABLE prompts ADD COLUMN IF NOT EXISTS allowed_tenants UUID[];

UPDATE prompts
SET allowed_tenants = ARRAY[
  'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid,
  '684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid,
  'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid
]
WHERE allowed_tenants IS NULL;

CREATE INDEX IF NOT EXISTS idx_prompts_allowed_tenants ON prompts USING GIN (allowed_tenants);

-- =====================================================================
-- 5. AGENTS (ALL 3 TENANTS)
-- =====================================================================

ALTER TABLE agents ADD COLUMN IF NOT EXISTS allowed_tenants UUID[];

UPDATE agents
SET allowed_tenants = ARRAY[
  'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid,
  '684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid,
  'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid
]
WHERE allowed_tenants IS NULL;

CREATE INDEX IF NOT EXISTS idx_agents_allowed_tenants ON agents USING GIN (allowed_tenants);

-- =====================================================================
-- 6. KNOWLEDGE (ALL 3 TENANTS - if table exists)
-- =====================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge') THEN
    EXECUTE 'ALTER TABLE knowledge ADD COLUMN IF NOT EXISTS allowed_tenants UUID[]';
    EXECUTE 'UPDATE knowledge SET allowed_tenants = ARRAY[
      ''c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244''::uuid,
      ''684f6c2c-b50d-4726-ad92-c76c3b785a89''::uuid,
      ''c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b''::uuid
    ] WHERE allowed_tenants IS NULL';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_knowledge_allowed_tenants ON knowledge USING GIN (allowed_tenants)';
  END IF;
END $$;

-- =====================================================================
-- 7. VERIFY ALL COUNTS
-- =====================================================================

SELECT '=== TENANT ACCESS SUMMARY ===' as info;

SELECT 'org_functions' as table_name, COUNT(*) as total,
  COUNT(*) FILTER (WHERE 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants)) as vital,
  COUNT(*) FILTER (WHERE '684f6c2c-b50d-4726-ad92-c76c3b785a89' = ANY(allowed_tenants)) as digital_health,
  COUNT(*) FILTER (WHERE 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' = ANY(allowed_tenants)) as pharma
FROM org_functions
UNION ALL
SELECT 'org_departments', COUNT(*),
  COUNT(*) FILTER (WHERE 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE '684f6c2c-b50d-4726-ad92-c76c3b785a89' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' = ANY(allowed_tenants))
FROM org_departments
UNION ALL
SELECT 'org_roles', COUNT(*),
  COUNT(*) FILTER (WHERE 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE '684f6c2c-b50d-4726-ad92-c76c3b785a89' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' = ANY(allowed_tenants))
FROM org_roles
UNION ALL
SELECT 'personas', COUNT(*),
  COUNT(*) FILTER (WHERE 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE '684f6c2c-b50d-4726-ad92-c76c3b785a89' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' = ANY(allowed_tenants))
FROM personas
UNION ALL
SELECT 'tools', COUNT(*),
  COUNT(*) FILTER (WHERE 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE '684f6c2c-b50d-4726-ad92-c76c3b785a89' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' = ANY(allowed_tenants))
FROM tools
UNION ALL
SELECT 'prompts', COUNT(*),
  COUNT(*) FILTER (WHERE 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE '684f6c2c-b50d-4726-ad92-c76c3b785a89' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' = ANY(allowed_tenants))
FROM prompts
UNION ALL
SELECT 'agents', COUNT(*),
  COUNT(*) FILTER (WHERE 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE '684f6c2c-b50d-4726-ad92-c76c3b785a89' = ANY(allowed_tenants)),
  COUNT(*) FILTER (WHERE 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' = ANY(allowed_tenants))
FROM agents
ORDER BY table_name;

-- =====================================================================
-- API QUERY PATTERN:
-- WHERE $tenant_id = ANY(allowed_tenants)
--
-- Example:
-- SELECT * FROM tools WHERE 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants);
-- =====================================================================
