-- =============================================================================
-- PHASE 1: CREATE ENUM TYPES
-- =============================================================================
-- Purpose: Define all ENUM types before table alterations
-- Time: ~5 minutes
-- Impact: No data changes, just type definitions
-- =============================================================================

-- Clean start: Drop existing types if they exist (idempotent)
DROP TYPE IF EXISTS agent_status CASCADE;
DROP TYPE IF EXISTS validation_status CASCADE;
DROP TYPE IF EXISTS domain_expertise CASCADE;
DROP TYPE IF EXISTS data_classification CASCADE;
DROP TYPE IF EXISTS functional_area_type CASCADE;
DROP TYPE IF EXISTS job_category_type CASCADE;
DROP TYPE IF EXISTS frequency_type CASCADE;
DROP TYPE IF EXISTS complexity_type CASCADE;
DROP TYPE IF EXISTS decision_type CASCADE;
DROP TYPE IF EXISTS jtbd_status CASCADE;
DROP TYPE IF EXISTS tenant_status CASCADE;
DROP TYPE IF EXISTS tenant_tier CASCADE;
DROP TYPE IF EXISTS tenant_role CASCADE;
DROP TYPE IF EXISTS mapping_source_type CASCADE;

-- =============================================================================
-- AGENT-RELATED ENUMS
-- =============================================================================

CREATE TYPE agent_status AS ENUM (
  'development',    -- Being built
  'testing',        -- In QA
  'active',         -- Production-ready
  'maintenance',    -- Temporarily unavailable
  'deprecated',     -- Being phased out
  'archived'        -- Historical record
);

COMMENT ON TYPE agent_status IS 'Agent lifecycle status';

CREATE TYPE validation_status AS ENUM (
  'pending',        -- Awaiting validation
  'in_review',      -- Under evaluation
  'approved',       -- Passed validation
  'rejected',       -- Failed validation
  'requires_update' -- Needs changes
);

COMMENT ON TYPE validation_status IS 'Validation/approval workflow status';

CREATE TYPE domain_expertise AS ENUM (
  'medical',
  'regulatory',
  'legal',
  'financial',
  'business',
  'technical',
  'commercial',
  'market_access',
  'clinical',
  'manufacturing',
  'quality',
  'research',
  'general'
);

COMMENT ON TYPE domain_expertise IS 'Agent domain specialization';

CREATE TYPE data_classification AS ENUM (
  'public',         -- Can be shared publicly
  'internal',       -- Company internal only
  'confidential',   -- Restricted access
  'restricted',     -- Highly sensitive
  'phi'             -- Protected Health Information
);

COMMENT ON TYPE data_classification IS 'Data sensitivity classification for compliance';

-- =============================================================================
-- JTBD-RELATED ENUMS
-- =============================================================================

CREATE TYPE functional_area_type AS ENUM (
  'Commercial',
  'Medical Affairs',
  'Market Access',
  'Clinical',
  'Regulatory',
  'Research & Development',
  'Manufacturing',
  'Quality',
  'Operations',
  'IT/Digital',
  'Legal',
  'Finance',
  'HR',
  'Business Development'
);

COMMENT ON TYPE functional_area_type IS 'Pharmaceutical functional areas - NO NULLS ALLOWED';

CREATE TYPE job_category_type AS ENUM (
  'strategic',
  'operational',
  'tactical',
  'administrative',
  'analytical',
  'collaborative',
  'creative',
  'technical'
);

COMMENT ON TYPE job_category_type IS 'JTBD category classification';

CREATE TYPE frequency_type AS ENUM (
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'as_needed'
);

COMMENT ON TYPE frequency_type IS 'How often a job is performed';

CREATE TYPE complexity_type AS ENUM (
  'simple',      -- Single-step, clear process
  'moderate',    -- Multi-step, some decision-making
  'complex',     -- Many dependencies, expert judgment
  'expert'       -- Requires specialized expertise
);

COMMENT ON TYPE complexity_type IS 'Job complexity level';

CREATE TYPE decision_type AS ENUM (
  'routine',
  'tactical',
  'strategic',
  'critical'
);

COMMENT ON TYPE decision_type IS 'Type of decision-making required';

CREATE TYPE jtbd_status AS ENUM (
  'draft',
  'active',
  'deprecated',
  'archived'
);

COMMENT ON TYPE jtbd_status IS 'JTBD lifecycle status';

-- =============================================================================
-- TENANT-RELATED ENUMS
-- =============================================================================

CREATE TYPE tenant_status AS ENUM (
  'trial',
  'active',
  'suspended',
  'cancelled',
  'churned'
);

COMMENT ON TYPE tenant_status IS 'Tenant subscription status';

CREATE TYPE tenant_tier AS ENUM (
  'free',
  'starter',
  'professional',
  'enterprise'
);

COMMENT ON TYPE tenant_tier IS 'Tenant pricing tier';

CREATE TYPE tenant_role AS ENUM (
  'owner',
  'admin',
  'member',
  'viewer'
);

COMMENT ON TYPE tenant_role IS 'User role within a tenant';

-- =============================================================================
-- MAPPING-RELATED ENUMS
-- =============================================================================

CREATE TYPE mapping_source_type AS ENUM (
  'manual',
  'automated',
  'ml_model',
  'expert_review'
);

COMMENT ON TYPE mapping_source_type IS 'How a mapping was created';

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
  enum_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO enum_count
  FROM pg_type
  WHERE typtype = 'e'
    AND typnamespace = 'public'::regnamespace;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ENUM TYPES CREATED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total enum types: %', enum_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Created enums:';
  RAISE NOTICE '  - agent_status';
  RAISE NOTICE '  - validation_status';
  RAISE NOTICE '  - domain_expertise';
  RAISE NOTICE '  - data_classification';
  RAISE NOTICE '  - functional_area_type';
  RAISE NOTICE '  - job_category_type';
  RAISE NOTICE '  - frequency_type';
  RAISE NOTICE '  - complexity_type';
  RAISE NOTICE '  - decision_type';
  RAISE NOTICE '  - jtbd_status';
  RAISE NOTICE '  - tenant_status';
  RAISE NOTICE '  - tenant_tier';
  RAISE NOTICE '  - tenant_role';
  RAISE NOTICE '  - mapping_source_type';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Ready for Phase 2: Multi-Tenancy Foundation';
  RAISE NOTICE '';
END $$;

-- =============================================================================
-- ROLLBACK (if needed)
-- =============================================================================
/*
DROP TYPE IF EXISTS agent_status CASCADE;
DROP TYPE IF EXISTS validation_status CASCADE;
DROP TYPE IF EXISTS domain_expertise CASCADE;
DROP TYPE IF EXISTS data_classification CASCADE;
DROP TYPE IF EXISTS functional_area_type CASCADE;
DROP TYPE IF EXISTS job_category_type CASCADE;
DROP TYPE IF EXISTS frequency_type CASCADE;
DROP TYPE IF EXISTS complexity_type CASCADE;
DROP TYPE IF EXISTS decision_type CASCADE;
DROP TYPE IF EXISTS jtbd_status CASCADE;
DROP TYPE IF EXISTS tenant_status CASCADE;
DROP TYPE IF EXISTS tenant_tier CASCADE;
DROP TYPE IF EXISTS tenant_role CASCADE;
DROP TYPE IF EXISTS mapping_source_type CASCADE;
*/
