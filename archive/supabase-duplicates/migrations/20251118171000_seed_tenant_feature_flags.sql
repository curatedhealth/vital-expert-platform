-- Seed Tenant Feature Flags
-- Links all feature flags to each tenant

-- Associate all feature flags with VITAL Expert Platform (system tenant)
INSERT INTO tenant_feature_flags (tenant_id, feature_flag_id, enabled, config)
SELECT
  o.id as tenant_id,
  ff.id as feature_flag_id,
  CASE
    -- Enable all features for system tenant
    WHEN o.tenant_type = 'system' THEN true
    -- Conditionally enable based on feature category for other tenants
    ELSE ff.default_enabled
  END as enabled,
  '{}'::jsonb as config
FROM organizations o
CROSS JOIN feature_flags ff
WHERE o.tenant_key = 'vital-system'
  AND NOT EXISTS (
    SELECT 1 FROM tenant_feature_flags tff
    WHERE tff.tenant_id = o.id
    AND tff.feature_flag_id = ff.id
  );

-- Associate feature flags with Digital Health tenant
INSERT INTO tenant_feature_flags (tenant_id, feature_flag_id, enabled, config)
SELECT
  o.id as tenant_id,
  ff.id as feature_flag_id,
  CASE
    -- Disable system-only features
    WHEN ff.flag_key LIKE 'tools_%' THEN false
    WHEN ff.flag_key LIKE 'admin_%' THEN false
    -- Enable digital health specific features
    WHEN ff.flag_key LIKE 'chat_%' THEN true
    WHEN ff.flag_key LIKE 'telehealth_%' THEN true
    ELSE ff.default_enabled
  END as enabled,
  '{}'::jsonb as config
FROM organizations o
CROSS JOIN feature_flags ff
WHERE o.tenant_key = 'digital-health'
  AND NOT EXISTS (
    SELECT 1 FROM tenant_feature_flags tff
    WHERE tff.tenant_id = o.id
    AND tff.feature_flag_id = ff.id
  );

-- Associate feature flags with Pharmaceuticals tenant
INSERT INTO tenant_feature_flags (tenant_id, feature_flag_id, enabled, config)
SELECT
  o.id as tenant_id,
  ff.id as feature_flag_id,
  CASE
    -- Disable system-only features
    WHEN ff.flag_key LIKE 'tools_%' THEN false
    WHEN ff.flag_key LIKE 'admin_%' THEN false
    -- Enable pharma-specific features
    WHEN ff.flag_key LIKE 'hipaa_%' THEN true
    WHEN ff.flag_key LIKE 'compliance_%' THEN true
    WHEN ff.flag_key LIKE 'drug_%' THEN true
    ELSE ff.default_enabled
  END as enabled,
  CASE
    -- Add HIPAA compliance config for pharma tenant
    WHEN ff.flag_key LIKE 'hipaa_%' THEN '{"compliance_level": "strict", "audit_enabled": true}'::jsonb
    ELSE '{}'::jsonb
  END as config
FROM organizations o
CROSS JOIN feature_flags ff
WHERE o.tenant_key = 'pharma'
  AND NOT EXISTS (
    SELECT 1 FROM tenant_feature_flags tff
    WHERE tff.tenant_id = o.id
    AND tff.feature_flag_id = ff.id
  );

-- Validation: Show feature flag counts per tenant
DO $$
DECLARE
  v_system_count INTEGER;
  v_digital_count INTEGER;
  v_pharma_count INTEGER;
BEGIN
  -- Count for system tenant
  SELECT COUNT(*) INTO v_system_count
  FROM tenant_feature_flags tff
  JOIN organizations o ON o.id = tff.tenant_id
  WHERE o.tenant_key = 'vital-system';

  -- Count for digital health tenant
  SELECT COUNT(*) INTO v_digital_count
  FROM tenant_feature_flags tff
  JOIN organizations o ON o.id = tff.tenant_id
  WHERE o.tenant_key = 'digital-health';

  -- Count for pharma tenant
  SELECT COUNT(*) INTO v_pharma_count
  FROM tenant_feature_flags tff
  JOIN organizations o ON o.id = tff.tenant_id
  WHERE o.tenant_key = 'pharma';

  RAISE NOTICE 'Feature flags seeded:';
  RAISE NOTICE '  VITAL System: % features', v_system_count;
  RAISE NOTICE '  Digital Health: % features', v_digital_count;
  RAISE NOTICE '  Pharmaceuticals: % features', v_pharma_count;

  -- Validate that each tenant has at least some features
  IF v_system_count = 0 OR v_digital_count = 0 OR v_pharma_count = 0 THEN
    RAISE WARNING 'One or more tenants have 0 feature flags!';
  END IF;
END $$;
