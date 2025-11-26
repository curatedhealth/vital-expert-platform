-- ============================================================================
-- Fix NULL Values in Pre-Existing Capabilities
-- ============================================================================
-- Update the 15 pre-existing generic capabilities to have proper values
-- ============================================================================

BEGIN;

-- Check current state
SELECT 
    '🔍 CAPABILITIES WITH NULL VALUES' as status,
    name,
    slug,
    capability_type,
    maturity_level,
    tags
FROM capabilities
WHERE maturity_level IS NULL OR capability_type IS NULL
ORDER BY name;

-- Update pre-existing capabilities based on their type
-- Note: maturity_level is an ENUM, must cast text to expertise_level

-- Strategic/Business capabilities
UPDATE capabilities
SET 
    capability_type = 'business',
    maturity_level = 'foundational'::expertise_level,
    updated_at = NOW()
WHERE slug IN ('strategic-thinking-planning', 'strategy')
  AND (capability_type IS NULL OR maturity_level IS NULL);

-- Interpersonal capabilities
UPDATE capabilities
SET 
    capability_type = 'interpersonal',
    maturity_level = 'foundational'::expertise_level,
    updated_at = NOW()
WHERE slug IN ('communication-influence', 'stakeholder')
  AND (capability_type IS NULL OR maturity_level IS NULL);

-- Leadership capabilities
UPDATE capabilities
SET 
    capability_type = 'leadership',
    maturity_level = 'foundational'::expertise_level,
    updated_at = NOW()
WHERE slug IN ('leadership-people-management', 'leadership')
  AND (capability_type IS NULL OR maturity_level IS NULL);

-- Technical/Analytical capabilities - AI/Software (advanced)
UPDATE capabilities
SET 
    capability_type = 'technical',
    maturity_level = 'advanced'::expertise_level,
    updated_at = NOW()
WHERE slug IN ('ai', 'software')
  AND (capability_type IS NULL OR maturity_level IS NULL);

-- Technical/Analytical capabilities - Others (intermediate)
UPDATE capabilities
SET 
    capability_type = 'technical',
    maturity_level = 'intermediate'::expertise_level,
    updated_at = NOW()
WHERE slug IN ('data', 'digital', 'scientific')
  AND (capability_type IS NULL OR maturity_level IS NULL);

-- Operational capabilities
UPDATE capabilities
SET 
    capability_type = 'business',
    maturity_level = 'foundational'::expertise_level,
    updated_at = NOW()
WHERE slug IN ('document', 'project')
  AND (capability_type IS NULL OR maturity_level IS NULL);

-- Specialized domain capabilities
UPDATE capabilities
SET 
    capability_type = 'technical',
    maturity_level = 'intermediate'::expertise_level,
    updated_at = NOW()
WHERE slug IN ('heor', 'regulatory', 'commercial', 'creative')
  AND (capability_type IS NULL OR maturity_level IS NULL);

-- Medical Affairs capability (the old one with null)
UPDATE capabilities
SET 
    capability_type = 'business',
    maturity_level = 'intermediate'::expertise_level,
    updated_at = NOW()
WHERE slug LIKE '%medical%affairs%'
  AND (capability_type IS NULL OR maturity_level IS NULL);

-- Verify all NULLs are fixed
SELECT 
    '✅ VERIFICATION' as status,
    COUNT(*) as total_capabilities,
    COUNT(CASE WHEN maturity_level IS NULL THEN 1 END) as remaining_null_maturity,
    COUNT(CASE WHEN capability_type IS NULL THEN 1 END) as remaining_null_type
FROM capabilities;

-- Show any remaining NULLs (should be 0)
SELECT 
    '⚠️ REMAINING NULLS (SHOULD BE EMPTY)' as status,
    name,
    slug,
    capability_type,
    maturity_level
FROM capabilities
WHERE maturity_level IS NULL OR capability_type IS NULL;

COMMIT;

-- ============================================================================
-- Expected Result:
-- - All capabilities should have proper maturity_level and capability_type
-- - No more NULL values
-- ============================================================================

