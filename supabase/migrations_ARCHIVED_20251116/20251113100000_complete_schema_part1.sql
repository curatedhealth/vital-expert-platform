-- =============================================================================
-- GOLD-STANDARD SCHEMA - PART 1: ENUMs + Foundation Tables (Phases 01-10)
-- =============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "ltree";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =============================================================================
-- PHASE 01: Create all ENUMs safely
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE agent_status AS ENUM ('development', 'testing', 'active', 'maintenance', 'deprecated', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE validation_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'needs_revision');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE domain_expertise AS ENUM ('foundational', 'intermediate', 'advanced', 'expert', 'thought_leader');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE data_classification AS ENUM ('public', 'internal', 'confidential', 'regulated', 'highly_sensitive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE functional_area_type AS ENUM ('Commercial', 'Medical Affairs', 'Market Access', 'Clinical', 'Regulatory', 'Research & Development', 'Manufacturing', 'Quality', 'Operations', 'IT/Digital', 'Legal', 'Finance', 'HR', 'Business Development');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE job_category_type AS ENUM ('strategic', 'tactical', 'operational', 'analytical', 'compliance', 'innovation');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE frequency_type AS ENUM ('one_time', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually', 'ad_hoc');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE complexity_type AS ENUM ('low', 'medium', 'high', 'very_high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE decision_type AS ENUM ('strategic', 'tactical', 'operational', 'emergency');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE jtbd_status AS ENUM ('draft', 'validated', 'active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tenant_status AS ENUM ('pending', 'trial', 'active', 'suspended', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tenant_tier AS ENUM ('free', 'starter', 'professional', 'enterprise', 'white_label');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tenant_role AS ENUM ('owner', 'admin', 'manager', 'member', 'guest', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE mapping_source_type AS ENUM ('manual', 'ai_generated', 'imported', 'validated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE conversation_status AS ENUM ('active', 'paused', 'completed', 'abandoned', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE message_role AS ENUM ('system', 'user', 'assistant', 'function', 'tool');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'running', 'paused', 'completed', 'failed', 'cancelled', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('pending', 'ready', 'in_progress', 'blocked', 'completed', 'failed', 'skipped');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE llm_provider_type AS ENUM ('openai', 'anthropic', 'azure_openai', 'google', 'cohere', 'huggingface', 'local', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE solution_status AS ENUM ('development', 'beta', 'active', 'maintenance', 'deprecated', 'retired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  RAISE NOTICE '✅ PHASE 01 COMPLETE - All 20 ENUMs created or verified';
END $$;
