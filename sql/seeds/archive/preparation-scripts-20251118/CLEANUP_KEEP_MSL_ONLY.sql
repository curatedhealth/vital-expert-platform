-- =====================================================
-- CLEANUP: Keep Only 5 New MSL Personas
-- =====================================================
-- Purpose: Remove all other personas, keep only Phase 1 MSL personas
-- Date: 2025-11-17
-- =====================================================

BEGIN;

-- The 5 MSL personas to KEEP
-- These were deployed in Phase 1 on 2025-11-17

-- List personas to keep
SELECT
    '✅ KEEPING' as status,
    name,
    slug,
    title
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND slug IN (
    'dr-emma-rodriguez-msl-early-career',
    'dr-james-chen-msl-experienced',
    'dr-sarah-mitchell-msl-senior',
    'dr-marcus-johnson-msl-oncology',
    'dr-lisa-park-msl-rare-disease'
  )
  AND deleted_at IS NULL
ORDER BY name;

-- Count personas to delete
SELECT
    COUNT(*) as personas_to_delete
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND slug NOT IN (
    'dr-emma-rodriguez-msl-early-career',
    'dr-james-chen-msl-experienced',
    'dr-sarah-mitchell-msl-senior',
    'dr-marcus-johnson-msl-oncology',
    'dr-lisa-park-msl-rare-disease'
  )
  AND deleted_at IS NULL;

-- Soft delete all personas EXCEPT the 5 new MSL personas
-- Using soft delete (deleted_at) to preserve data
UPDATE personas
SET
    deleted_at = NOW(),
    updated_at = NOW()
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND slug NOT IN (
    'dr-emma-rodriguez-msl-early-career',
    'dr-james-chen-msl-experienced',
    'dr-sarah-mitchell-msl-senior',
    'dr-marcus-johnson-msl-oncology',
    'dr-lisa-park-msl-rare-disease'
  )
  AND deleted_at IS NULL;

-- Verify cleanup
SELECT
    'After Cleanup' as status,
    COUNT(*) as active_personas
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL;

-- Show remaining personas
SELECT
    name,
    slug,
    title,
    seniority_level,
    created_at::date as created
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL
ORDER BY name;

COMMIT;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Expected Result: 5 active personas (Phase 1 MSL personas)
-- All others: Soft deleted (deleted_at set)
-- Data preserved: Can be restored if needed
-- =====================================================
