-- =====================================================================================
-- STEP 3: Add tenant_id to existing persona junction tables
-- =====================================================================================
-- This adds the tenant_id column to junction tables that already exist
-- =====================================================================================

-- Add tenant_id to persona_goals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'persona_goals' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE persona_goals ADD COLUMN tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    CREATE INDEX IF NOT EXISTS idx_persona_goals_tenant ON persona_goals(tenant_id);
    RAISE NOTICE '✅ Added tenant_id to persona_goals';
  ELSE
    RAISE NOTICE 'ℹ️  tenant_id already exists in persona_goals';
  END IF;
END $$;

-- Add tenant_id to persona_pain_points
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'persona_pain_points' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE persona_pain_points ADD COLUMN tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    CREATE INDEX IF NOT EXISTS idx_persona_pain_points_tenant ON persona_pain_points(tenant_id);
    RAISE NOTICE '✅ Added tenant_id to persona_pain_points';
  ELSE
    RAISE NOTICE 'ℹ️  tenant_id already exists in persona_pain_points';
  END IF;
END $$;

-- Add tenant_id to persona_challenges
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'persona_challenges' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE persona_challenges ADD COLUMN tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    CREATE INDEX IF NOT EXISTS idx_persona_challenges_tenant ON persona_challenges(tenant_id);
    RAISE NOTICE '✅ Added tenant_id to persona_challenges';
  ELSE
    RAISE NOTICE 'ℹ️  tenant_id already exists in persona_challenges';
  END IF;
END $$;

-- Add tenant_id to persona_responsibilities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'persona_responsibilities' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE persona_responsibilities ADD COLUMN tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    CREATE INDEX IF NOT EXISTS idx_persona_responsibilities_tenant ON persona_responsibilities(tenant_id);
    RAISE NOTICE '✅ Added tenant_id to persona_responsibilities';
  ELSE
    RAISE NOTICE 'ℹ️  tenant_id already exists in persona_responsibilities';
  END IF;
END $$;

-- Add tenant_id to persona_tools
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'persona_tools' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE persona_tools ADD COLUMN tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    CREATE INDEX IF NOT EXISTS idx_persona_tools_tenant ON persona_tools(tenant_id);
    RAISE NOTICE '✅ Added tenant_id to persona_tools';
  ELSE
    RAISE NOTICE 'ℹ️  tenant_id already exists in persona_tools';
  END IF;
END $$;

-- Add tenant_id to persona_communication_channels
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'persona_communication_channels' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE persona_communication_channels ADD COLUMN tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    CREATE INDEX IF NOT EXISTS idx_persona_comm_channels_tenant ON persona_communication_channels(tenant_id);
    RAISE NOTICE '✅ Added tenant_id to persona_communication_channels';
  ELSE
    RAISE NOTICE 'ℹ️  tenant_id already exists in persona_communication_channels';
  END IF;
END $$;

-- Add tenant_id to persona_decision_makers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'persona_decision_makers' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE persona_decision_makers ADD COLUMN tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    CREATE INDEX IF NOT EXISTS idx_persona_decision_makers_tenant ON persona_decision_makers(tenant_id);
    RAISE NOTICE '✅ Added tenant_id to persona_decision_makers';
  ELSE
    RAISE NOTICE 'ℹ️  tenant_id already exists in persona_decision_makers';
  END IF;
END $$;

-- Add tenant_id to persona_frustrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'persona_frustrations' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE persona_frustrations ADD COLUMN tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    CREATE INDEX IF NOT EXISTS idx_persona_frustrations_tenant ON persona_frustrations(tenant_id);
    RAISE NOTICE '✅ Added tenant_id to persona_frustrations';
  ELSE
    RAISE NOTICE 'ℹ️  tenant_id already exists in persona_frustrations';
  END IF;
END $$;

-- Add tenant_id to persona_quotes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'persona_quotes' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE persona_quotes ADD COLUMN tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    CREATE INDEX IF NOT EXISTS idx_persona_quotes_tenant ON persona_quotes(tenant_id);
    RAISE NOTICE '✅ Added tenant_id to persona_quotes';
  ELSE
    RAISE NOTICE 'ℹ️  tenant_id already exists in persona_quotes';
  END IF;
END $$;

-- Create NEW tables that don't exist yet: persona_organization_types and persona_typical_locations

CREATE TABLE IF NOT EXISTS persona_organization_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    organization_type TEXT NOT NULL,
    is_typical BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, organization_type)
);
CREATE INDEX IF NOT EXISTS idx_persona_org_types_persona ON persona_organization_types(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_org_types_tenant ON persona_organization_types(tenant_id);

CREATE TABLE IF NOT EXISTS persona_typical_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    location_name TEXT NOT NULL,
    location_type TEXT CHECK (location_type IN ('city', 'region', 'country', 'hub')),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, location_name)
);
CREATE INDEX IF NOT EXISTS idx_persona_locations_persona ON persona_typical_locations(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_locations_tenant ON persona_typical_locations(tenant_id);

-- Verification
DO $$
DECLARE
  v_updated_count INTEGER := 0;
  v_created_count INTEGER := 0;
BEGIN
  -- Count how many existing tables now have tenant_id
  SELECT COUNT(*) INTO v_updated_count
  FROM information_schema.columns
  WHERE table_name IN (
    'persona_goals', 'persona_pain_points', 'persona_challenges',
    'persona_responsibilities', 'persona_tools', 'persona_communication_channels',
    'persona_decision_makers', 'persona_frustrations', 'persona_quotes'
  ) AND column_name = 'tenant_id';

  -- Count newly created tables
  SELECT COUNT(*) INTO v_created_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('persona_organization_types', 'persona_typical_locations');

  RAISE NOTICE '=====================================================================================';
  RAISE NOTICE 'STEP 3 COMPLETE - Junction Table Updates';
  RAISE NOTICE '=====================================================================================';
  RAISE NOTICE 'Updated % existing junction tables with tenant_id column', v_updated_count;
  RAISE NOTICE 'Created % new junction tables', v_created_count;
  RAISE NOTICE '';
  RAISE NOTICE 'GOLDEN RULE COMPLIANCE: ✅ ALL DATA NORMALIZED (NO JSONB)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run seed data script for Medical Affairs Personas Part 1';
  RAISE NOTICE '  File: database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/medical_affairs_personas_part1_normalized.sql';
  RAISE NOTICE '=====================================================================================';
END $$;
