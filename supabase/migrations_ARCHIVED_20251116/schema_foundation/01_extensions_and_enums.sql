-- =============================================================================
-- PHASE 01: PostgreSQL Extensions + ENUM Types
-- =============================================================================
-- PURPOSE: Install required PostgreSQL extensions and create type-safe ENUMs
-- TABLES: 0 tables (foundation only)
-- ENUMS: 20 ENUM types
-- TIME: ~10 minutes
-- =============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";           -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";            -- Encryption functions
CREATE EXTENSION IF NOT EXISTS "ltree";               -- Hierarchical tree structures (tenant paths)
CREATE EXTENSION IF NOT EXISTS "vector";              -- pgvector for embeddings (RAG)
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";  -- Query performance monitoring

-- =============================================================================
-- ENUM TYPES (20 total)
-- =============================================================================

-- Agent Status Lifecycle
CREATE TYPE agent_status AS ENUM (
  'development',    -- Being built/configured
  'testing',        -- In QA/testing phase
  'active',         -- Production ready and available
  'maintenance',    -- Temporarily unavailable for updates
  'deprecated',     -- Marked for retirement
  'archived'        -- Inactive, historical record
);

-- Validation Status (for entities requiring approval)
CREATE TYPE validation_status AS ENUM (
  'draft',          -- Initial creation
  'pending',        -- Awaiting review
  'approved',       -- Validated and active
  'rejected',       -- Failed validation
  'needs_revision'  -- Requires changes
);

-- Domain Expertise Levels
CREATE TYPE domain_expertise AS ENUM (
  'foundational',   -- Basic knowledge
  'intermediate',   -- Working proficiency
  'advanced',       -- Deep expertise
  'expert',         -- Subject matter expert
  'thought_leader'  -- Industry-recognized authority
);

-- Data Classification (HIPAA/SOC2 compliance)
CREATE TYPE data_classification AS ENUM (
  'public',         -- No restrictions
  'internal',       -- Company confidential
  'confidential',   -- Restricted access
  'regulated',      -- HIPAA/PHI data
  'highly_sensitive' -- Trade secrets, PII
);

-- Organizational Functions (14 primary functions)
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

-- Job Category Types
CREATE TYPE job_category_type AS ENUM (
  'strategic',      -- Long-term planning, vision
  'tactical',       -- Execution, implementation
  'operational',    -- Day-to-day activities
  'analytical',     -- Data analysis, insights
  'compliance',     -- Regulatory, legal requirements
  'innovation'      -- Research, new approaches
);

-- Frequency Types (for tasks, reports, etc.)
CREATE TYPE frequency_type AS ENUM (
  'one_time',       -- Single occurrence
  'daily',
  'weekly',
  'biweekly',
  'monthly',
  'quarterly',
  'annually',
  'ad_hoc'          -- As needed
);

-- Complexity Levels
CREATE TYPE complexity_type AS ENUM (
  'low',            -- Simple, straightforward
  'medium',         -- Moderate difficulty
  'high',           -- Complex, requires expertise
  'very_high'       -- Extremely challenging
);

-- Decision Types
CREATE TYPE decision_type AS ENUM (
  'strategic',      -- High-level, long-term impact
  'tactical',       -- Medium-term, departmental
  'operational',    -- Day-to-day decisions
  'emergency'       -- Urgent, time-sensitive
);

-- JTBD Status
CREATE TYPE jtbd_status AS ENUM (
  'draft',          -- Being defined
  'validated',      -- Confirmed as real need
  'active',         -- Currently supported
  'archived'        -- Historical/deprecated
);

-- Tenant Status
CREATE TYPE tenant_status AS ENUM (
  'pending',        -- Account being set up
  'trial',          -- Trial period
  'active',         -- Fully operational
  'suspended',      -- Temporarily disabled
  'cancelled'       -- Terminated
);

-- Tenant Tiers (subscription levels)
CREATE TYPE tenant_tier AS ENUM (
  'free',           -- Limited access
  'starter',        -- Basic features
  'professional',   -- Full features
  'enterprise',     -- Custom solutions
  'white_label'     -- Branded platform
);

-- Tenant Member Roles
CREATE TYPE tenant_role AS ENUM (
  'owner',          -- Full control
  'admin',          -- Administrative access
  'manager',        -- Team management
  'member',         -- Standard user
  'guest',          -- Limited read-only
  'viewer'          -- Read-only
);

-- Mapping Source Types
CREATE TYPE mapping_source_type AS ENUM (
  'manual',         -- Human-created
  'ai_generated',   -- AI-suggested
  'imported',       -- Bulk import
  'validated'       -- Reviewed and confirmed
);

-- Conversation Status
CREATE TYPE conversation_status AS ENUM (
  'active',         -- Ongoing
  'paused',         -- Temporarily stopped
  'completed',      -- Finished successfully
  'abandoned',      -- User left without completing
  'archived'        -- Historical record
);

-- Message Role Types
CREATE TYPE message_role AS ENUM (
  'system',         -- System messages
  'user',           -- User input
  'assistant',      -- AI response
  'function',       -- Tool/function call
  'tool'            -- Tool response
);

-- Workflow Status
CREATE TYPE workflow_status AS ENUM (
  'draft',          -- Being designed
  'active',         -- Available for use
  'running',        -- Currently executing
  'paused',         -- Execution paused
  'completed',      -- Finished successfully
  'failed',         -- Execution failed
  'cancelled',      -- User cancelled
  'archived'        -- Historical
);

-- Task Status
CREATE TYPE task_status AS ENUM (
  'pending',        -- Not started
  'ready',          -- Prerequisites met
  'in_progress',    -- Currently executing
  'blocked',        -- Waiting on dependency
  'completed',      -- Finished successfully
  'failed',         -- Execution failed
  'skipped'         -- Intentionally skipped
);

-- LLM Provider Types
CREATE TYPE llm_provider_type AS ENUM (
  'openai',
  'anthropic',
  'azure_openai',
  'google',
  'cohere',
  'huggingface',
  'local',
  'custom'
);

-- Solution Status
CREATE TYPE solution_status AS ENUM (
  'development',    -- Being built
  'beta',           -- Limited release
  'active',         -- Generally available
  'maintenance',    -- Updates only
  'deprecated',     -- Marked for removal
  'retired'         -- No longer available
);

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    enum_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO enum_count
    FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
    AND typtype = 'e';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 01 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Extensions installed: 5';
    RAISE NOTICE 'ENUM types created: %', enum_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 02 (Identity & Multi-Tenancy)';
    RAISE NOTICE '';
END $$;

-- List all created ENUMs
SELECT
    typname as enum_name,
    array_agg(enumlabel ORDER BY enumsortorder) as enum_values
FROM pg_type
JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid
WHERE typnamespace = 'public'::regnamespace
AND typtype = 'e'
GROUP BY typname
ORDER BY typname;
