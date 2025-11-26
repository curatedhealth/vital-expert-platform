-- ============================================================================
-- AgentOS Complete Capabilities Seeding - AUTO-GENERATED
-- File: 20251127-seed-all-330-capabilities-AUTO.sql
-- ============================================================================
-- Generated from capability taxonomy markdown files
-- Total capabilities: 0
-- ============================================================================

BEGIN;

INSERT INTO capabilities (
    name,
    slug,
    description,
    capability_type,
    maturity_level,
    tags,
    is_active
) VALUES


COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT
    '✅ SEEDING COMPLETE!' as status,
    COUNT(*) as total_capabilities,
    COUNT(DISTINCT capability_type) as types,
    COUNT(DISTINCT maturity_level) as maturity_levels
FROM capabilities;

-- Breakdown by function
SELECT
    tags[1] as function_tag,
    capability_type,
    maturity_level,
    COUNT(*) as count
FROM capabilities
WHERE array_length(tags, 1) >= 1
GROUP BY tags[1], capability_type, maturity_level
ORDER BY tags[1], capability_type, maturity_level;