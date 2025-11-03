-- =====================================================================================
-- QUICK START: Execute Single RA Use Case with Session Config
-- =====================================================================================
-- This wrapper creates session_config and executes a single RA seed file
-- Usage: psql $DATABASE_URL -f execute_single_ra.sql -v ra_file='26_ra_001_samd_classification_part1.sql'
-- =====================================================================================

-- Create session_config for tenant lookup
CREATE TEMP TABLE IF NOT EXISTS session_config (
  tenant_id UUID,
  tenant_slug TEXT
);

-- Clear any existing session config
DELETE FROM session_config;

-- Insert tenant configuration
INSERT INTO session_config (tenant_id, tenant_slug)
SELECT id, slug 
FROM tenants 
WHERE slug = 'digital-health-startup';

-- Verify tenant found
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT tenant_id INTO v_tenant_id FROM session_config;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant "digital-health-startup" not found. Please create tenant first.';
  END IF;
  RAISE NOTICE '✅ Using tenant: digital-health-startup (ID: %)', v_tenant_id;
END $$;

-- Now you can execute your RA seed file
-- For example, from psql:
-- \i 26_ra_001_samd_classification_part1.sql
-- \i 26_ra_001_samd_classification_part2.sql

-- Or use the execute_ra_usecases.sh script to run all files automatically

