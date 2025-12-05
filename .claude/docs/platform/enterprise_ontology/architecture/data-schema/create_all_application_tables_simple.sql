-- =====================================================================
-- CREATE ALL APPLICATION TABLES AND JUNCTIONS (SIMPLIFIED)
-- Ensures complete VITAL platform schema exists
-- NO FOREIGN KEY CONSTRAINTS - Can be run independently
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
-- AI Agents that perform work on behalf of personas
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Agents table...'; END $$;

CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    agent_type TEXT,
    persona_id UUID, -- Links to persona this agent serves
    role_id UUID, -- Links to role this agent supports
    tenant_id UUID, -- Links to tenant
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agents_slug ON public.agents(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agents_persona ON public.agents(persona_id);
CREATE INDEX IF NOT EXISTS idx_agents_role ON public.agents(role_id);
CREATE INDEX IF NOT EXISTS idx_agents_tenant ON public.agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agents_type ON public.agents(agent_type);

-- =====================================================================
-- 2. AGENT TOOLS TABLE
-- Software tools/APIs that AI AGENTS use (distinct from human tools)
-- Examples: OpenAI API, Claude API, Web Search API, Code Execution
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Agent Tools table...'; END $$;

CREATE TABLE IF NOT EXISTS public.agent_tools_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    tool_type TEXT, -- 'llm', 'api', 'function', 'integration'
    description TEXT,
    provider TEXT, -- 'openai', 'anthropic', 'custom', etc.
    api_endpoint TEXT,
    configuration_schema JSONB DEFAULT '{}',
    requires_auth BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_tools_catalog_type ON public.agent_tools_catalog(tool_type);
CREATE INDEX IF NOT EXISTS idx_agent_tools_catalog_provider ON public.agent_tools_catalog(provider);

DO $$ BEGIN RAISE NOTICE '  Note: agent_tools_catalog = Tools FOR AI agents (APIs, functions)'; END $$;
DO $$ BEGIN RAISE NOTICE '  Note: tools table (from skills_and_tools.sql) = Tools FOR humans (CRM, Excel, etc.)'; END $$;

-- =====================================================================
-- 3. KNOWLEDGE TABLE
-- Knowledge base articles and content
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
    tenant_id UUID,
    is_public BOOLEAN DEFAULT false,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_knowledge_slug ON public.knowledge(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_knowledge_tenant ON public.knowledge(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_type ON public.knowledge(knowledge_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON public.knowledge USING GIN(tags);

-- =====================================================================
-- 4. PROMPTS TABLE
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

CREATE INDEX IF NOT EXISTS idx_prompts_slug ON public.prompts(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_prompts_tenant ON public.prompts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prompts_type ON public.prompts(prompt_type);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON public.prompts USING GIN(tags);

-- =====================================================================
-- 5. CAPABILITIES TABLE
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
    tenant_id UUID,
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
-- 6. JTBDS (JOBS TO BE DONE) TABLE
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
    tenant_id UUID,
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
-- 7. WORKFLOWS TABLE
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
    tenant_id UUID,
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
-- 8. STRATEGIC PRIORITIES TABLE
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
    tenant_id UUID,
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
-- 9. USE CASES TABLE
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
    tenant_id UUID,
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
-- JUNCTION TABLES - AGENT RELATIONSHIPS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Agent junction tables...'; END $$;

CREATE TABLE IF NOT EXISTS public.agent_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    capability_id UUID NOT NULL,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agent_id, capability_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent ON public.agent_capabilities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_capability ON public.agent_capabilities(capability_id);

CREATE TABLE IF NOT EXISTS public.agent_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    agent_tool_id UUID NOT NULL, -- References agent_tools_catalog (NOT human tools table)
    configuration JSONB DEFAULT '{}',
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agent_id, agent_tool_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_tools_agent ON public.agent_tools(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tools_tool ON public.agent_tools(agent_tool_id);

DO $$ BEGIN RAISE NOTICE '  Note: agent_tools junction links agents to agent_tools_catalog'; END $$;

CREATE TABLE IF NOT EXISTS public.agent_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    knowledge_id UUID NOT NULL,
    access_level TEXT DEFAULT 'read',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agent_id, knowledge_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_agent ON public.agent_knowledge(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_knowledge ON public.agent_knowledge(knowledge_id);

CREATE TABLE IF NOT EXISTS public.agent_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    prompt_id UUID NOT NULL,
    context TEXT,
    priority INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agent_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_prompts_agent ON public.agent_prompts(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_prompts_prompt ON public.agent_prompts(prompt_id);

CREATE TABLE IF NOT EXISTS public.agent_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    workflow_id UUID NOT NULL,
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
    persona_id UUID NOT NULL,
    jtbd_id UUID NOT NULL,
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
    persona_id UUID NOT NULL,
    use_case_id UUID NOT NULL,
    relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 10),
    frequency TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(persona_id, use_case_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_use_cases_persona ON public.persona_use_cases(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_use_cases_use_case ON public.persona_use_cases(use_case_id);

CREATE TABLE IF NOT EXISTS public.role_jtbds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL,
    jtbd_id UUID NOT NULL,
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
    role_id UUID NOT NULL,
    use_case_id UUID NOT NULL,
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
    strategic_priority_id UUID NOT NULL,
    use_case_id UUID NOT NULL,
    alignment_score INTEGER CHECK (alignment_score >= 1 AND alignment_score <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(strategic_priority_id, use_case_id)
);

CREATE INDEX IF NOT EXISTS idx_priority_use_cases_priority ON public.priority_use_cases(strategic_priority_id);
CREATE INDEX IF NOT EXISTS idx_priority_use_cases_use_case ON public.priority_use_cases(use_case_id);

CREATE TABLE IF NOT EXISTS public.priority_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategic_priority_id UUID NOT NULL,
    capability_id UUID NOT NULL,
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
    use_case_id UUID NOT NULL,
    capability_id UUID NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(use_case_id, capability_id)
);

CREATE INDEX IF NOT EXISTS idx_use_case_capabilities_use_case ON public.use_case_capabilities(use_case_id);
CREATE INDEX IF NOT EXISTS idx_use_case_capabilities_capability ON public.use_case_capabilities(capability_id);

CREATE TABLE IF NOT EXISTS public.use_case_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    use_case_id UUID NOT NULL,
    workflow_id UUID NOT NULL,
    sequence_order INTEGER,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(use_case_id, workflow_id)
);

CREATE INDEX IF NOT EXISTS idx_use_case_workflows_use_case ON public.use_case_workflows(use_case_id);
CREATE INDEX IF NOT EXISTS idx_use_case_workflows_workflow ON public.use_case_workflows(workflow_id);

CREATE TABLE IF NOT EXISTS public.use_case_jtbds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    use_case_id UUID NOT NULL,
    jtbd_id UUID NOT NULL,
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
    workflow_id UUID NOT NULL,
    capability_id UUID NOT NULL,
    step_order INTEGER,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workflow_id, capability_id, step_order)
);

CREATE INDEX IF NOT EXISTS idx_workflow_capabilities_workflow ON public.workflow_capabilities(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_capabilities_capability ON public.workflow_capabilities(capability_id);

CREATE TABLE IF NOT EXISTS public.workflow_agent_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    agent_tool_id UUID NOT NULL, -- References agent_tools_catalog
    step_order INTEGER,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workflow_id, agent_tool_id, step_order)
);

CREATE INDEX IF NOT EXISTS idx_workflow_agent_tools_workflow ON public.workflow_agent_tools(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_agent_tools_tool ON public.workflow_agent_tools(agent_tool_id);

DO $$ BEGIN RAISE NOTICE '  Note: workflow_agent_tools = Agent tools used in workflows'; END $$;
DO $$ BEGIN RAISE NOTICE '  Note: role_tools (from existing schema) = Human tools used by roles'; END $$;

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
          'agents', 'agent_tools_catalog', 'knowledge', 'prompts', 'capabilities', 
          'jtbds', 'workflows', 'strategic_priorities', 'use_cases'
      );
    
    SELECT COUNT(*) INTO junction_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
          'agent_capabilities', 'agent_tools', 'agent_knowledge', 'agent_prompts', 'agent_workflows',
          'persona_jtbds', 'persona_use_cases', 'role_jtbds', 'role_use_cases',
          'priority_use_cases', 'priority_capabilities',
          'use_case_capabilities', 'use_case_workflows', 'use_case_jtbds',
          'workflow_capabilities', 'workflow_agent_tools'
      );
    
    RAISE NOTICE 'Core Application Tables: %/9', table_count;
    RAISE NOTICE '  ✓ agents (AI agents serving personas)';
    RAISE NOTICE '  ✓ agent_tools_catalog (Tools FOR AI agents - APIs, functions)';
    RAISE NOTICE '  ✓ knowledge';
    RAISE NOTICE '  ✓ prompts';
    RAISE NOTICE '  ✓ capabilities';
    RAISE NOTICE '  ✓ jtbds';
    RAISE NOTICE '  ✓ workflows';
    RAISE NOTICE '  ✓ strategic_priorities';
    RAISE NOTICE '  ✓ use_cases';
    RAISE NOTICE '';
    RAISE NOTICE 'Junction Tables: %/15', junction_count;
    RAISE NOTICE '  ✓ agent_* (5 tables - agent relationships)';
    RAISE NOTICE '  ✓ persona_* (2 tables - persona JTBDs & use cases)';
    RAISE NOTICE '  ✓ role_* (2 tables - role JTBDs & use cases)';
    RAISE NOTICE '  ✓ priority_* (2 tables - strategic priorities)';
    RAISE NOTICE '  ✓ use_case_* (3 tables - use case relationships)';
    RAISE NOTICE '  ✓ workflow_* (2 tables - workflow steps)';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'TOOL DISAMBIGUATION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📌 Two Types of Tools in VITAL:';
    RAISE NOTICE '';
    RAISE NOTICE '1️⃣  HUMAN TOOLS (in "tools" table from populate_skills_and_tools.sql)';
    RAISE NOTICE '   • Software humans use: Veeva CRM, Excel, PowerPoint, SAS, etc.';
    RAISE NOTICE '   • Mapped to roles via: role_tools junction';
    RAISE NOTICE '   • Used by: Personas performing their jobs';
    RAISE NOTICE '';
    RAISE NOTICE '2️⃣  AGENT TOOLS (in "agent_tools_catalog" table - THIS script)';
    RAISE NOTICE '   • APIs/functions agents use: OpenAI API, Claude API, Web Search, etc.';
    RAISE NOTICE '   • Mapped to agents via: agent_tools junction';
    RAISE NOTICE '   • Used by: AI Agents performing automation';
    RAISE NOTICE '';
    RAISE NOTICE 'Complete VITAL Platform Schema Ready!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

