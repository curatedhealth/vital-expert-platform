-- ============================================================================
-- Create Test Tenants in REMOTE Supabase Database
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql/new
-- ============================================================================

-- Tenant 1: Digital Health Startups
INSERT INTO tenants (
  id,
  name,
  slug,
  type,
  status,
  subscription_tier,
  subscription_status,
  industry,
  metadata
)
VALUES (
  'digital-health-startups-123',
  'Digital Health Startups',
  'digital-health-startups',
  'client',
  'active',
  'enterprise',
  'active',
  'digital-health',
  jsonb_build_object(
    'description', 'Digital health and medtech startups community',
    'features', jsonb_build_array('telemedicine', 'wearables', 'AI-diagnostics'),
    'plan', 'enterprise'
  )
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_status = EXCLUDED.subscription_status,
  industry = EXCLUDED.industry,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- Tenant 2: Pharma Companies
INSERT INTO tenants (
  id,
  name,
  slug,
  type,
  status,
  subscription_tier,
  subscription_status,
  industry,
  metadata
)
VALUES (
  'pharma-companies-456',
  'Pharma Companies',
  'pharma',
  'client',
  'active',
  'enterprise',
  'active',
  'pharmaceutical',
  jsonb_build_object(
    'description', 'Pharmaceutical companies and drug manufacturers',
    'features', jsonb_build_array('clinical-trials', 'regulatory', 'market-access'),
    'plan', 'enterprise'
  )
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_status = EXCLUDED.subscription_status,
  industry = EXCLUDED.industry,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- Verify tenants were created
SELECT
  id,
  name,
  slug,
  type,
  status,
  subscription_tier,
  subscription_status,
  industry,
  created_at,
  updated_at
FROM tenants
WHERE status = 'active'
ORDER BY name;
