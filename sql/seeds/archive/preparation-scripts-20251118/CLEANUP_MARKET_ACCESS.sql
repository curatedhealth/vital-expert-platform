-- Cleanup: Remove Market Access Personas
-- Date: 2025-11-17
-- Reason: Preparing for new Market Access seed file

BEGIN;

-- Soft delete all Market Access personas
UPDATE personas
SET
    deleted_at = NOW(),
    updated_at = NOW()
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL
  AND (
    title ILIKE '%market access%'
    OR slug ILIKE '%market-access%'
    OR title ILIKE '%payer%'
    OR title ILIKE '%HTA%'
  );

COMMIT;

-- Verification: Count remaining active personas
SELECT
    COUNT(*) as total_active_personas,
    COUNT(CASE WHEN title ILIKE '%market access%' OR slug ILIKE '%market-access%' THEN 1 END) as market_access_count
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL;

-- Show what was deleted
SELECT
    name,
    title,
    deleted_at
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NOT NULL
  AND (
    title ILIKE '%market access%'
    OR slug ILIKE '%market-access%'
    OR title ILIKE '%payer%'
    OR title ILIKE '%HTA%'
  )
ORDER BY name;
