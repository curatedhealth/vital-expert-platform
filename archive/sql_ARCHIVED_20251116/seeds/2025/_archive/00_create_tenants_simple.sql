-- =====================================================================================
-- Create Required Tenant: digital-health-startup
-- =====================================================================================

-- Insert the digital-health-startup tenant with minimal required fields
INSERT INTO tenants (
    id,
    name,
    slug,
    status
)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Digital Health Startup',
    'digital-health-startup',
    'active'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    status = 'active';

-- Verify creation
SELECT
    id,
    name,
    slug,
    status
FROM tenants
WHERE slug = 'digital-health-startup';

-- Show all tenants
SELECT
    '✅ Total Tenants:' as status,
    COUNT(*) as count
FROM tenants;

SELECT
    name,
    slug,
    status
FROM tenants
ORDER BY name;
