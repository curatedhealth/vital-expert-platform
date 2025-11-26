-- ============================================================================
-- Clean Up Duplicate Medical Affairs Capabilities
-- ============================================================================
-- Remove the 24 manually seeded capabilities that have NULL values
-- Keep the auto-generated ones with proper maturity_level and capability_type
-- ============================================================================

BEGIN;

-- First, let's see what we're dealing with
SELECT 
    '🔍 BEFORE CLEANUP' as status,
    COUNT(*) as total_medical_affairs,
    COUNT(CASE WHEN maturity_level IS NULL THEN 1 END) as null_maturity,
    COUNT(CASE WHEN capability_type IS NULL THEN 1 END) as null_type
FROM capabilities
WHERE 'medical-affairs' = ANY(tags);

-- Delete Medical Affairs capabilities with NULL maturity_level or capability_type
-- These are the 24 manually seeded ones we want to remove
DELETE FROM capabilities
WHERE 'medical-affairs' = ANY(tags)
  AND (maturity_level IS NULL OR capability_type IS NULL);

-- Verify cleanup
SELECT 
    '✅ AFTER CLEANUP' as status,
    COUNT(*) as total_medical_affairs,
    COUNT(CASE WHEN maturity_level IS NULL THEN 1 END) as null_maturity,
    COUNT(CASE WHEN capability_type IS NULL THEN 1 END) as null_type
FROM capabilities
WHERE 'medical-affairs' = ANY(tags);

-- Show what remains
SELECT 
    capability_type,
    maturity_level,
    COUNT(*) as count
FROM capabilities
WHERE 'medical-affairs' = ANY(tags)
GROUP BY capability_type, maturity_level
ORDER BY capability_type, maturity_level;

COMMIT;

-- ============================================================================
-- Expected Result:
-- - Medical Affairs should drop from 83 to 60 capabilities
-- - All remaining should have proper maturity_level and capability_type
-- ============================================================================

