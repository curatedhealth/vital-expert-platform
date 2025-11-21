-- ============================================================================
-- Migration 012: Agent Workflow Integration
-- ============================================================================
-- Date: 2025-11-21
-- Purpose: Add missing tables and indexes for Ask Expert/Panel workflows
-- Dependencies: 002_add_gold_standard_agent_fields.sql, 20251118144319_create_multitenancy_system.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: Upgrade Agent-Knowledge Domain Junction Table
-- ============================================================================

-- The agent_knowledge_domains table exists but has a simple schema
-- Let's add the missing columns for proficiency tracking

-- Add proficiency_level column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_knowledge_domains'
        AND column_name = 'proficiency_level'
    ) THEN
        ALTER TABLE public.agent_knowledge_domains
        ADD COLUMN proficiency_level VARCHAR(20) CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert'));
    END IF;
END$$;

-- Add is_primary_domain column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_knowledge_domains'
        AND column_name = 'is_primary_domain'
    ) THEN
        ALTER TABLE public.agent_knowledge_domains
        ADD COLUMN is_primary_domain BOOLEAN DEFAULT false;
    END IF;
END$$;

-- Add knowledge_domain_id foreign key column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_knowledge_domains'
        AND column_name = 'knowledge_domain_id'
    ) THEN
        ALTER TABLE public.agent_knowledge_domains
        ADD COLUMN knowledge_domain_id UUID REFERENCES public.knowledge_domains(id) ON DELETE CASCADE;

        -- Populate knowledge_domain_id from domain_name (if knowledge_domains table exists and has data)
        UPDATE public.agent_knowledge_domains akd
        SET knowledge_domain_id = kd.id
        FROM public.knowledge_domains kd
        WHERE kd.name = akd.domain_name OR kd.slug = akd.domain_name OR kd.code = akd.domain_name;
    END IF;
END$$;

-- Add metadata column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_knowledge_domains'
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.agent_knowledge_domains
        ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END$$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_knowledge_domains'
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.agent_knowledge_domains
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END$$;

-- Create indexes for agent_knowledge_domains
CREATE INDEX IF NOT EXISTS idx_agent_kd_agent ON public.agent_knowledge_domains(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_kd_domain ON public.agent_knowledge_domains(knowledge_domain_id) WHERE knowledge_domain_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_kd_domain_name ON public.agent_knowledge_domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_agent_kd_proficiency ON public.agent_knowledge_domains(proficiency_level) WHERE proficiency_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_kd_primary ON public.agent_knowledge_domains(is_primary_domain) WHERE is_primary_domain = true;

COMMENT ON TABLE public.agent_knowledge_domains IS 'Junction table linking agents to knowledge domains with proficiency tracking';
COMMENT ON COLUMN public.agent_knowledge_domains.domain_name IS 'Legacy: Domain name as text (prefer knowledge_domain_id)';
COMMENT ON COLUMN public.agent_knowledge_domains.knowledge_domain_id IS 'Foreign key to knowledge_domains table';
COMMENT ON COLUMN public.agent_knowledge_domains.proficiency_level IS 'Agent proficiency in this domain: basic, intermediate, advanced, expert';
COMMENT ON COLUMN public.agent_knowledge_domains.is_primary_domain IS 'Is this the agent primary specialization domain?';

-- ============================================================================
-- PART 2: Workflow Execution Tables
-- ============================================================================

-- Workflow Instances
CREATE TABLE IF NOT EXISTS public.workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,

    -- Workflow Type
    workflow_type VARCHAR(100) NOT NULL,            -- 'ask_expert', 'ask_panel', 'solution_builder'
    workflow_mode INTEGER,                          -- For Ask Panel: 1, 2, 3, or 4

    -- Configuration
    input_data JSONB NOT NULL,                      -- User's question, context, parameters
    config JSONB DEFAULT '{}',                      -- Workflow-specific config

    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

    -- Results
    output_data JSONB,                              -- Final aggregated results
    error_message TEXT,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for workflow_instances
CREATE INDEX IF NOT EXISTS idx_workflow_instances_tenant ON public.workflow_instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_user ON public.workflow_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_type ON public.workflow_instances(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON public.workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_created ON public.workflow_instances(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_active
ON public.workflow_instances(tenant_id, status, created_at DESC)
WHERE status IN ('pending', 'running');

COMMENT ON TABLE public.workflow_instances IS 'Tracks Ask Expert, Ask Panel, and other workflow executions';
COMMENT ON COLUMN public.workflow_instances.workflow_type IS 'Type of workflow: ask_expert, ask_panel, solution_builder';
COMMENT ON COLUMN public.workflow_instances.workflow_mode IS 'Mode for Ask Panel: 1=Quick Answer, 2=SME Panel, 3=Comprehensive, 4=Adversarial';

-- Workflow Steps
CREATE TABLE IF NOT EXISTS public.workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_instance_id UUID NOT NULL REFERENCES public.workflow_instances(id) ON DELETE CASCADE,

    -- Step Configuration
    step_number INTEGER NOT NULL,                   -- Execution order (1, 2, 3, ...)
    step_type VARCHAR(100) NOT NULL,                -- 'agent_execution', 'aggregation', 'validation', 'parallel_execution'
    step_name VARCHAR(255),                         -- Human-readable name

    -- Agent Assignment (if applicable)
    assigned_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,

    -- Execution
    input_data JSONB,                               -- Input to this step
    output_data JSONB,                              -- Output from this step

    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(workflow_instance_id, step_number)
);

-- Indexes for workflow_steps
CREATE INDEX IF NOT EXISTS idx_workflow_steps_instance ON public.workflow_steps(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_agent ON public.workflow_steps(assigned_agent_id) WHERE assigned_agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_steps_status ON public.workflow_steps(status);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_type ON public.workflow_steps(step_type);

COMMENT ON TABLE public.workflow_steps IS 'Individual steps within a workflow execution';
COMMENT ON COLUMN public.workflow_steps.step_type IS 'Type of step: agent_execution, aggregation, validation, parallel_execution';

-- Agent Assignments
CREATE TABLE IF NOT EXISTS public.agent_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_instance_id UUID NOT NULL REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
    workflow_step_id UUID REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,

    -- Assignment Type
    assignment_role VARCHAR(100),                   -- 'primary', 'reviewer', 'specialist', 'aggregator', 'challenger'

    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'working', 'completed', 'failed')),

    -- Response
    agent_response JSONB,                           -- Agent's full response
    response_summary TEXT,                          -- Brief summary for display
    confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),

    -- Timing
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agent_assignments
CREATE INDEX IF NOT EXISTS idx_agent_assignments_workflow ON public.agent_assignments(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_agent_assignments_step ON public.agent_assignments(workflow_step_id) WHERE workflow_step_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_assignments_agent ON public.agent_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_assignments_status ON public.agent_assignments(status);
CREATE INDEX IF NOT EXISTS idx_agent_assignments_role ON public.agent_assignments(assignment_role);
CREATE INDEX IF NOT EXISTS idx_agent_assignments_active
ON public.agent_assignments(agent_id, status, assigned_at DESC)
WHERE status IN ('assigned', 'working');

COMMENT ON TABLE public.agent_assignments IS 'Tracks agent assignments within workflow steps (for Ask Panel parallel execution)';
COMMENT ON COLUMN public.agent_assignments.assignment_role IS 'Role in workflow: primary, reviewer, specialist, aggregator, challenger';

-- ============================================================================
-- PART 3: Performance Indexes
-- ============================================================================

-- Composite index for workflow agent selection
CREATE INDEX IF NOT EXISTS idx_agents_workflow_selection
ON public.agents(tenant_id, status, tier)
WHERE status IN ('active', 'testing');

-- Composite index for tenant + tier queries
CREATE INDEX IF NOT EXISTS idx_agents_tenant_tier
ON public.agents(tenant_id, tier, status)
WHERE status IN ('active', 'testing');

-- Index for agent capability proficiency lookups
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_proficiency
ON public.agent_capabilities(agent_id, proficiency_level, is_primary)
WHERE proficiency_level IS NOT NULL;

-- ============================================================================
-- PART 4: Helper Functions
-- ============================================================================

-- Get workflow-compatible agents
CREATE OR REPLACE FUNCTION get_workflow_compatible_agents(
    p_tenant_id UUID,
    p_workflow_type VARCHAR,
    p_required_capabilities TEXT[] DEFAULT NULL,
    p_required_domains TEXT[] DEFAULT NULL,
    p_min_tier INTEGER DEFAULT 1,
    p_max_tier INTEGER DEFAULT 5
)
RETURNS TABLE (
    agent_id UUID,
    agent_name VARCHAR,
    display_name VARCHAR,
    tier INTEGER,
    capabilities TEXT[],
    knowledge_domains TEXT[],
    match_score INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH agent_domain_agg AS (
        -- Aggregate knowledge domains for each agent
        SELECT
            akd.agent_id,
            array_agg(COALESCE(kd.code, akd.domain_name) ORDER BY COALESCE(kd.code, akd.domain_name)) as domain_codes
        FROM agent_knowledge_domains akd
        LEFT JOIN knowledge_domains kd ON akd.knowledge_domain_id = kd.id
        WHERE (kd.is_active = true OR kd.id IS NULL)
        GROUP BY akd.agent_id
    )
    SELECT
        a.id as agent_id,
        a.name as agent_name,
        a.display_name,
        a.tier,
        a.capabilities,
        COALESCE(ada.domain_codes, ARRAY[]::TEXT[]) as knowledge_domains,

        -- Calculate match score (0-100)
        (
            -- Capability match score (40 points max)
            CASE
                WHEN p_required_capabilities IS NULL THEN 20
                ELSE LEAST(40, (
                    SELECT COUNT(*) * 10
                    FROM unnest(a.capabilities) cap
                    WHERE cap = ANY(p_required_capabilities)
                ))
            END
            +
            -- Domain match score (40 points max)
            CASE
                WHEN p_required_domains IS NULL THEN 20
                ELSE LEAST(40, (
                    SELECT COUNT(*) * 10
                    FROM unnest(COALESCE(ada.domain_codes, ARRAY[]::TEXT[])) dom
                    WHERE dom = ANY(p_required_domains)
                ))
            END
            +
            -- Tier bonus (20 points max - prefer higher tier/more expert agents)
            CASE
                WHEN a.tier = 1 THEN 20
                WHEN a.tier = 2 THEN 15
                WHEN a.tier = 3 THEN 10
                WHEN a.tier = 4 THEN 5
                ELSE 3
            END
        ) as match_score

    FROM agents a
    JOIN tenant_agents ta ON a.id = ta.agent_id
    LEFT JOIN agent_domain_agg ada ON a.id = ada.agent_id

    WHERE ta.tenant_id = p_tenant_id
      AND ta.is_enabled = true
      AND a.status IN ('active', 'testing')
      AND a.tier >= p_min_tier
      AND a.tier <= p_max_tier

    ORDER BY match_score DESC, a.tier ASC, a.name ASC;
END;
$$;

COMMENT ON FUNCTION get_workflow_compatible_agents IS 'Find agents compatible with a workflow, ranked by capability/domain match score';

-- Get agents by tier and specialty
CREATE OR REPLACE FUNCTION get_agents_by_tier_specialty(
    p_tenant_id UUID,
    p_tier INTEGER,
    p_specialty VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    agent_id UUID,
    agent_name VARCHAR,
    display_name VARCHAR,
    specialization TEXT,
    capabilities TEXT[],
    tier INTEGER,
    status VARCHAR
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        a.id,
        a.name,
        a.display_name,
        a.specialization,
        a.capabilities,
        a.tier,
        a.status
    FROM agents a
    JOIN tenant_agents ta ON a.id = ta.agent_id
    WHERE ta.tenant_id = p_tenant_id
      AND ta.is_enabled = true
      AND a.status IN ('active', 'testing')
      AND a.tier = p_tier
      AND (p_specialty IS NULL OR a.specialization ILIKE '%' || p_specialty || '%')
    ORDER BY a.name;
$$;

COMMENT ON FUNCTION get_agents_by_tier_specialty IS 'Get all agents for a tenant filtered by tier and optional specialty';

-- ============================================================================
-- PART 5: Update Triggers
-- ============================================================================

-- Trigger to update duration_seconds on workflow completion
CREATE OR REPLACE FUNCTION update_workflow_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
        NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_workflow_duration ON public.workflow_instances;
CREATE TRIGGER trigger_workflow_duration
    BEFORE UPDATE ON public.workflow_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_duration();

-- Trigger to update step duration
CREATE OR REPLACE FUNCTION update_step_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
        NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_step_duration ON public.workflow_steps;
CREATE TRIGGER trigger_step_duration
    BEFORE UPDATE ON public.workflow_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_step_duration();

-- Trigger to update assignment duration
CREATE OR REPLACE FUNCTION update_assignment_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
        NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assignment_duration ON public.agent_assignments;
CREATE TRIGGER trigger_assignment_duration
    BEFORE UPDATE ON public.agent_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_assignment_duration();

-- ============================================================================
-- PART 6: RLS Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE public.agent_knowledge_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_assignments ENABLE ROW LEVEL SECURITY;

-- agent_knowledge_domains policies
DROP POLICY IF EXISTS "Service role full access to agent_knowledge_domains" ON public.agent_knowledge_domains;
CREATE POLICY "Service role full access to agent_knowledge_domains"
    ON public.agent_knowledge_domains FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read agent knowledge domains" ON public.agent_knowledge_domains;
CREATE POLICY "Users can read agent knowledge domains"
    ON public.agent_knowledge_domains FOR SELECT
    TO authenticated
    USING (true);

-- workflow_instances policies
DROP POLICY IF EXISTS "Service role full access to workflow_instances" ON public.workflow_instances;
CREATE POLICY "Service role full access to workflow_instances"
    ON public.workflow_instances FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own workflow instances" ON public.workflow_instances;
CREATE POLICY "Users can read own workflow instances"
    ON public.workflow_instances FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create workflow instances" ON public.workflow_instances;
CREATE POLICY "Users can create workflow instances"
    ON public.workflow_instances FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- workflow_steps policies
DROP POLICY IF EXISTS "Service role full access to workflow_steps" ON public.workflow_steps;
CREATE POLICY "Service role full access to workflow_steps"
    ON public.workflow_steps FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read workflow steps" ON public.workflow_steps;
CREATE POLICY "Users can read workflow steps"
    ON public.workflow_steps FOR SELECT
    TO authenticated
    USING (
        workflow_instance_id IN (
            SELECT id FROM public.workflow_instances WHERE user_id = auth.uid()
        )
    );

-- agent_assignments policies
DROP POLICY IF EXISTS "Service role full access to agent_assignments" ON public.agent_assignments;
CREATE POLICY "Service role full access to agent_assignments"
    ON public.agent_assignments FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read agent assignments" ON public.agent_assignments;
CREATE POLICY "Users can read agent assignments"
    ON public.agent_assignments FOR SELECT
    TO authenticated
    USING (
        workflow_instance_id IN (
            SELECT id FROM public.workflow_instances WHERE user_id = auth.uid()
        )
    );

COMMIT;

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
DECLARE
    v_agent_kd_count INTEGER;
    v_workflow_tables_count INTEGER;
    v_function_exists BOOLEAN;
BEGIN
    -- Check agent_knowledge_domains table
    SELECT COUNT(*) INTO v_agent_kd_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'agent_knowledge_domains';

    -- Check workflow tables
    SELECT COUNT(*) INTO v_workflow_tables_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('workflow_instances', 'workflow_steps', 'agent_assignments');

    -- Check function exists
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'get_workflow_compatible_agents'
    ) INTO v_function_exists;

    RAISE NOTICE '✅ Migration 012 completed successfully';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   agent_knowledge_domains upgraded: %', (v_agent_kd_count > 0);
    RAISE NOTICE '   Workflow tables created: % of 3', v_workflow_tables_count;
    RAISE NOTICE '   Function get_workflow_compatible_agents: %', v_function_exists;
    RAISE NOTICE '   Performance indexes: Created';
    RAISE NOTICE '   RLS policies: Enabled';
    RAISE NOTICE '   Triggers: Duration tracking enabled';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   ✅ Ready for Ask Expert/Panel workflows';
END $$;
