-- =====================================================================
-- REMOVE DUPLICATE RECORDS
-- Keep only one copy since allowed_tenants handles multi-tenant access
-- =====================================================================

-- =====================================================================
-- 1. REMOVE DUPLICATE TOOLS (keep oldest by created_at)
-- =====================================================================

DELETE FROM tools
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at ASC) as rn
    FROM tools
  ) t
  WHERE t.rn > 1
);

SELECT 'tools after dedup' as table_name, COUNT(*) as count FROM tools;

-- =====================================================================
-- 2. REMOVE DUPLICATE AGENTS (keep oldest by created_at)
-- =====================================================================

DELETE FROM agents
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at ASC) as rn
    FROM agents
  ) t
  WHERE t.rn > 1
);

SELECT 'agents after dedup' as table_name, COUNT(*) as count FROM agents;

-- =====================================================================
-- 3. REMOVE DUPLICATE PERSONAS (keep oldest by created_at)
-- =====================================================================

DELETE FROM personas
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at ASC) as rn
    FROM personas
  ) t
  WHERE t.rn > 1
);

SELECT 'personas after dedup' as table_name, COUNT(*) as count FROM personas;

-- =====================================================================
-- 4. CHECK ORG_FUNCTIONS COLUMNS AND DEDUP
-- =====================================================================

-- First check what columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'org_functions' AND table_schema = 'public';

-- Org tables may not have duplicates - skip for now
SELECT 'org_functions' as table_name, COUNT(*) as count FROM org_functions;
SELECT 'org_departments' as table_name, COUNT(*) as count FROM org_departments;
SELECT 'org_roles' as table_name, COUNT(*) as count FROM org_roles;

-- =====================================================================
-- 7. FINAL SUMMARY
-- =====================================================================

SELECT '=== FINAL COUNTS AFTER DEDUPLICATION ===' as info;

SELECT 'tools' as table_name, COUNT(*) as total FROM tools
UNION ALL
SELECT 'agents', COUNT(*) FROM agents
UNION ALL
SELECT 'personas', COUNT(*) FROM personas
UNION ALL
SELECT 'prompts', COUNT(*) FROM prompts
UNION ALL
SELECT 'org_functions', COUNT(*) FROM org_functions
UNION ALL
SELECT 'org_departments', COUNT(*) FROM org_departments
UNION ALL
SELECT 'org_roles', COUNT(*) FROM org_roles
ORDER BY table_name;
