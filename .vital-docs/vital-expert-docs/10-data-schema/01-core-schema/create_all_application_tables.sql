-- =====================================================================
-- CREATE ALL APPLICATION TABLES AND JUNCTIONS
-- Ensures complete VITAL platform schema exists
-- Includes: Agents, Knowledge, Prompts, Capabilities, Tools, JTBDs, 
-- Workflows, Strategic Priorities, Use Cases, and all relationships
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'CREATING COMPLETE VITAL PLATFORM SCHEMA';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. AGENTS TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Agents table...'; END $$;

CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    agent_type TEXT,
    persona_id UUID, -- Will add FK constraint later if personas table exists
    role_id UUID, -- Will add FK constraint later if org_roles table exists
    tenant_id UUID, -- Will add FK constraint later if tenants table exists
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Add foreign key constraints only if referenced tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'personas') THEN
        ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_persona_id_fkey;
        ALTER TABLE public.agents ADD CONSTRAINT agents_persona_id_fkey 
            FOREIGN KEY (persona_id) REFERENCES public.personas(id) ON DELETE SET NULL;
        RAISE NOTICE '  ✓ Added personas foreign key';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'org_roles') THEN
        ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_role_id_fkey;
        ALTER TABLE public.agents ADD CONSTRAINT agents_role_id_fkey 
            FOREIGN KEY (role_id) REFERENCES public.org_roles(id) ON DELETE SET NULL;
        RAISE NOTICE '  ✓ Added org_roles foreign key';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
        ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_tenant_id_fkey;
        ALTER TABLE public.agents ADD CONSTRAINT agents_tenant_id_fkey 
            FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
        RAISE NOTICE '  ✓ Added tenants foreign key';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_agents_slug ON public.agents(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agents_persona ON public.agents(persona_id);
CREATE INDEX IF NOT EXISTS idx_agents_role ON public.agents(role_id);
CREATE INDEX IF NOT EXISTS idx_agents_tenant ON public.agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agents_type ON public.agents(agent_type);

-- =====================================================================
-- 2. KNOWLEDGE TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Knowledge table...'; END $$;

CREATE TABLE IF NOT EXISTS public.knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    knowledge_type TEXT,
    content TEXT,
    content_format TEXT DEFAULT 'markdown',
    source_url TEXT,
    tenant_id UUID, -- Will add FK constraint later if tenants table exists
    is_public BOOLEAN DEFAULT false,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Add foreign key constraint if tenants table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
        ALTER TABLE public.knowledge DROP CONSTRAINT IF EXISTS knowledge_tenant_id_fkey;
        ALTER TABLE public.knowledge ADD CONSTRAINT knowledge_tenant_id_fkey 
            FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_knowledge_slug ON public.knowledge(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_knowledge_tenant ON public.knowledge(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_type ON public.knowledge(knowledge_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON public.knowledge USING GIN(tags);

-- =====================================================================
-- 3. PROMPTS TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Prompts table...'; END $$;

CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    prompt_type TEXT,
    prompt_text TEXT NOT NULL,
    system_prompt TEXT,
    variables JSONB DEFAULT '[]',
    tenant_id UUID,
    is_public BOOLEAN DEFAULT false,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
        ALTER TABLE public.prompts DROP CONSTRAINT IF EXISTS prompts_tenant_id_fkey;
        ALTER TABLE public.prompts ADD CONSTRAINT prompts_tenant_id_fkey 
            FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_prompts_slug ON public.prompts(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_prompts_tenant ON public.prompts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prompts_type ON public.prompts(prompt_type);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON public.prompts USING GIN(tags);

-- =====================================================================
-- 4. CAPABILITIES TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Capabilities table...'; END $$;

CREATE TABLE IF NOT EXISTS public.capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    capability_type TEXT,
    category TEXT,
    complexity_level TEXT,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_capabilities_slug ON public.capabilities(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_capabilities_tenant ON public.capabilities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_capabilities_type ON public.capabilities(capability_type);
CREATE INDEX IF NOT EXISTS idx_capabilities_category ON public.capabilities(category);

-- =====================================================================
-- 5. JTBDS (JOBS TO BE DONE) TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating JTBDs table...'; END $$;

CREATE TABLE IF NOT EXISTS public.jtbds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    job_statement TEXT,
    category TEXT,
    functional_job TEXT,
    emotional_job TEXT,
    social_job TEXT,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_jtbds_slug ON public.jtbds(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jtbds_tenant ON public.jtbds(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jtbds_category ON public.jtbds(category);

-- =====================================================================
-- 6. WORKFLOWS TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Workflows table...'; END $$;

CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    workflow_type TEXT,
    category TEXT,
    steps JSONB DEFAULT '[]',
    configuration JSONB DEFAULT '{}',
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_workflows_slug ON public.workflows(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflows_tenant ON public.workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflows_type ON public.workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflows_category ON public.workflows(category);

-- =====================================================================
-- 7. STRATEGIC PRIORITIES TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Strategic Priorities table...'; END $$;

CREATE TABLE IF NOT EXISTS public.strategic_priorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    priority_level INTEGER CHECK (priority_level >= 1 AND priority_level <= 10),
    category TEXT,
    time_horizon TEXT,
    status TEXT DEFAULT 'active',
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    target_date DATE,
    owner TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_strategic_priorities_slug ON public.strategic_priorities(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_strategic_priorities_tenant ON public.strategic_priorities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_strategic_priorities_level ON public.strategic_priorities(priority_level);
CREATE INDEX IF NOT EXISTS idx_strategic_priorities_status ON public.strategic_priorities(status);

-- =====================================================================
-- 8. USE CASES TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Use Cases table...'; END $$;

CREATE TABLE IF NOT EXISTS public.use_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    complexity TEXT,
    business_value TEXT,
    success_metrics TEXT[],
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'draft',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_use_cases_slug ON public.use_cases(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_use_cases_tenant ON public.use_cases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_use_cases_category ON public.use_cases(category);
CREATE INDEX IF NOT EXISTS idx_use_cases_status ON public.use_cases(status);

-- =====================================================================
-- 9. SKILLS TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Skills table...'; END $$;

CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    complexity_level TEXT,
    is_core BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_name ON public.skills(name) WHERE deleted_at IS NULL;

-- =====================================================================
-- 10. TOOLS TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Tools table...'; END $$;

CREATE TABLE IF NOT EXISTS public.tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    vendor TEXT,
    url TEXT,
    is_enterprise BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_name ON public.tools(name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tools_vendor ON public.tools(vendor);

-- =====================================================================
-- JUNCTION TABLES - AGENT RELATIONSHIPS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Agent junction tables...'; END $$;

CREATE TABLE IF NOT EXISTS public.agent_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES public.capabilities(id) ON DELETE CASCADE,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agent_id, capability_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent ON public.agent_capabilities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_capability ON public.agent_capabilities(capability_id);

CREATE TABLE IF NOT EXISTS public.agent_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
    configuration JSONB DEFAULT '{}',
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agent_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_tools_agent ON public.agent_tools(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tools_tool ON public.agent_tools(tool_id);

CREATE TABLE IF NOT EXISTS public.agent_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    knowledge_id UUID NOT NULL REFERENCES public.knowledge(id) ON DELETE CASCADE,
    access_level TEXT DEFAULT 'read',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agent_id, knowledge_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_agent ON public.agent_knowledge(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_knowledge ON public.agent_knowledge(knowledge_id);

CREATE TABLE IF NOT EXISTS public.agent_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    context TEXT,
    priority INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agent_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_prompts_agent ON public.agent_prompts(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_prompts_prompt ON public.agent_prompts(prompt_id);

CREATE TABLE IF NOT EXISTS public.agent_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    configuration JSONB DEFAULT '{}',
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agent_id, workflow_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_workflows_agent ON public.agent_workflows(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_workflows_workflow ON public.agent_workflows(workflow_id);

-- =====================================================================
-- JUNCTION TABLES - PERSONA/ROLE RELATIONSHIPS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Persona/Role junction tables...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_jtbds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    jtbd_id UUID NOT NULL REFERENCES public.jtbds(id) ON DELETE CASCADE,
    priority INTEGER,
    frequency TEXT,
    importance_score INTEGER CHECK (importance_score >= 1 AND importance_score <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(persona_id, jtbd_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_jtbds_persona ON public.persona_jtbds(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_jtbds_jtbd ON public.persona_jtbds(jtbd_id);

CREATE TABLE IF NOT EXISTS public.persona_use_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    use_case_id UUID NOT NULL REFERENCES public.use_cases(id) ON DELETE CASCADE,
    relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 10),
    frequency TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(persona_id, use_case_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_use_cases_persona ON public.persona_use_cases(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_use_cases_use_case ON public.persona_use_cases(use_case_id);

CREATE TABLE IF NOT EXISTS public.role_jtbds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    jtbd_id UUID NOT NULL REFERENCES public.jtbds(id) ON DELETE CASCADE,
    priority INTEGER,
    frequency TEXT,
    importance_score INTEGER CHECK (importance_score >= 1 AND importance_score <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, jtbd_id)
);

CREATE INDEX IF NOT EXISTS idx_role_jtbds_role ON public.role_jtbds(role_id);
CREATE INDEX IF NOT EXISTS idx_role_jtbds_jtbd ON public.role_jtbds(jtbd_id);

CREATE TABLE IF NOT EXISTS public.role_use_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    use_case_id UUID NOT NULL REFERENCES public.use_cases(id) ON DELETE CASCADE,
    relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 10),
    frequency TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, use_case_id)
);

CREATE INDEX IF NOT EXISTS idx_role_use_cases_role ON public.role_use_cases(role_id);
CREATE INDEX IF NOT EXISTS idx_role_use_cases_use_case ON public.role_use_cases(use_case_id);

-- =====================================================================
-- JUNCTION TABLES - STRATEGIC PRIORITY RELATIONSHIPS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Strategic Priority junction tables...'; END $$;

CREATE TABLE IF NOT EXISTS public.priority_use_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategic_priority_id UUID NOT NULL REFERENCES public.strategic_priorities(id) ON DELETE CASCADE,
    use_case_id UUID NOT NULL REFERENCES public.use_cases(id) ON DELETE CASCADE,
    alignment_score INTEGER CHECK (alignment_score >= 1 AND alignment_score <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(strategic_priority_id, use_case_id)
);

CREATE INDEX IF NOT EXISTS idx_priority_use_cases_priority ON public.priority_use_cases(strategic_priority_id);
CREATE INDEX IF NOT EXISTS idx_priority_use_cases_use_case ON public.priority_use_cases(use_case_id);

CREATE TABLE IF NOT EXISTS public.priority_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategic_priority_id UUID NOT NULL REFERENCES public.strategic_priorities(id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES public.capabilities(id) ON DELETE CASCADE,
    alignment_score INTEGER CHECK (alignment_score >= 1 AND alignment_score <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(strategic_priority_id, capability_id)
);

CREATE INDEX IF NOT EXISTS idx_priority_capabilities_priority ON public.priority_capabilities(strategic_priority_id);
CREATE INDEX IF NOT EXISTS idx_priority_capabilities_capability ON public.priority_capabilities(capability_id);

-- =====================================================================
-- JUNCTION TABLES - USE CASE RELATIONSHIPS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Use Case junction tables...'; END $$;

CREATE TABLE IF NOT EXISTS public.use_case_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    use_case_id UUID NOT NULL REFERENCES public.use_cases(id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES public.capabilities(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(use_case_id, capability_id)
);

CREATE INDEX IF NOT EXISTS idx_use_case_capabilities_use_case ON public.use_case_capabilities(use_case_id);
CREATE INDEX IF NOT EXISTS idx_use_case_capabilities_capability ON public.use_case_capabilities(capability_id);

CREATE TABLE IF NOT EXISTS public.use_case_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    use_case_id UUID NOT NULL REFERENCES public.use_cases(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    sequence_order INTEGER,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(use_case_id, workflow_id)
);

CREATE INDEX IF NOT EXISTS idx_use_case_workflows_use_case ON public.use_case_workflows(use_case_id);
CREATE INDEX IF NOT EXISTS idx_use_case_workflows_workflow ON public.use_case_workflows(workflow_id);

CREATE TABLE IF NOT EXISTS public.use_case_jtbds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    use_case_id UUID NOT NULL REFERENCES public.use_cases(id) ON DELETE CASCADE,
    jtbd_id UUID NOT NULL REFERENCES public.jtbds(id) ON DELETE CASCADE,
    addresses_score INTEGER CHECK (addresses_score >= 1 AND addresses_score <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(use_case_id, jtbd_id)
);

CREATE INDEX IF NOT EXISTS idx_use_case_jtbds_use_case ON public.use_case_jtbds(use_case_id);
CREATE INDEX IF NOT EXISTS idx_use_case_jtbds_jtbd ON public.use_case_jtbds(jtbd_id);

-- =====================================================================
-- JUNCTION TABLES - WORKFLOW RELATIONSHIPS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Workflow junction tables...'; END $$;

CREATE TABLE IF NOT EXISTS public.workflow_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES public.capabilities(id) ON DELETE CASCADE,
    step_order INTEGER,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workflow_id, capability_id, step_order)
);

CREATE INDEX IF NOT EXISTS idx_workflow_capabilities_workflow ON public.workflow_capabilities(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_capabilities_capability ON public.workflow_capabilities(capability_id);

CREATE TABLE IF NOT EXISTS public.workflow_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
    step_order INTEGER,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workflow_id, tool_id, step_order)
);

CREATE INDEX IF NOT EXISTS idx_workflow_tools_workflow ON public.workflow_tools(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tools_tool ON public.workflow_tools(tool_id);

-- =====================================================================
-- VERIFICATION & SUMMARY
-- =====================================================================

DO $$ 
DECLARE
    table_count INTEGER;
    junction_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'VITAL PLATFORM SCHEMA COMPLETE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
          'agents', 'knowledge', 'prompts', 'capabilities', 'jtbds',
          'workflows', 'strategic_priorities', 'use_cases'
      );
    
    SELECT COUNT(*) INTO junction_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
          'agent_capabilities', 'agent_tools', 'agent_knowledge', 'agent_prompts', 'agent_workflows',
          'persona_jtbds', 'persona_use_cases', 'role_jtbds', 'role_use_cases',
          'priority_use_cases', 'priority_capabilities',
          'use_case_capabilities', 'use_case_workflows', 'use_case_jtbds',
          'workflow_capabilities', 'workflow_tools'
      );
    
    RAISE NOTICE 'Core Application Tables: %/8', table_count;
    RAISE NOTICE '  ✓ agents';
    RAISE NOTICE '  ✓ knowledge';
    RAISE NOTICE '  ✓ prompts';
    RAISE NOTICE '  ✓ capabilities';
    RAISE NOTICE '  ✓ jtbds';
    RAISE NOTICE '  ✓ workflows';
    RAISE NOTICE '  ✓ strategic_priorities';
    RAISE NOTICE '  ✓ use_cases';
    RAISE NOTICE '';
    RAISE NOTICE 'Junction Tables: %/15', junction_count;
    RAISE NOTICE '  ✓ agent_* (5 tables)';
    RAISE NOTICE '  ✓ persona_* (2 tables)';
    RAISE NOTICE '  ✓ role_* (2 tables)';
    RAISE NOTICE '  ✓ priority_* (2 tables)';
    RAISE NOTICE '  ✓ use_case_* (3 tables)';
    RAISE NOTICE '  ✓ workflow_* (2 tables)';
    RAISE NOTICE '';
    RAISE NOTICE 'Complete VITAL Platform Schema Ready!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

