-- =====================================================================
-- CREATE ALL APPLICATION TABLES AND JUNCTIONS
-- Works with existing schema, adds missing tables
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'CREATING COMPLETE VITAL PLATFORM SCHEMA';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- VERIFY EXISTING TABLES
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE 'Most application tables already exist in your schema:';
    RAISE NOTICE '  ✓ agents (319 rows)';
    RAISE NOTICE '  ✓ tools (94 rows) - Human tools';
    RAISE NOTICE '  ✓ prompts - Existing';
    RAISE NOTICE '  ✓ knowledge_base - Existing';
    RAISE NOTICE '  ✓ capabilities - Existing';
    RAISE NOTICE '  ✓ workflows - Existing';
    RAISE NOTICE '  ✓ Various junction tables';
    RAISE NOTICE '';
    RAISE NOTICE 'Will create ONLY missing tables...';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. AGENTS TABLE (Already exists - skipping)
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE 'Agents table already exists - skipping creation'; 
    RAISE NOTICE '  Note: Run fix_agents_table.sql if you need to add missing columns';
END $$;

-- =====================================================================
-- 2. AGENT TOOLS CATALOG
-- Tools/APIs that AI agents use (NOT human tools)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Agent Tools Catalog...'; END $$;

CREATE TABLE IF NOT EXISTS public.agent_tools_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    tool_type TEXT, -- 'llm', 'api', 'function', 'integration', 'mcp_server'
    description TEXT,
    provider TEXT, -- 'openai', 'anthropic', 'custom', etc.
    api_endpoint TEXT,
    configuration_schema JSONB DEFAULT '{}',
    requires_auth BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_tools_catalog_slug ON public.agent_tools_catalog(slug);
CREATE INDEX IF NOT EXISTS idx_agent_tools_catalog_type ON public.agent_tools_catalog(tool_type);
CREATE INDEX IF NOT EXISTS idx_agent_tools_catalog_provider ON public.agent_tools_catalog(provider);

-- Update existing agent_tools junction to reference agent_tools_catalog
DO $$
BEGIN
    -- Check if agent_tools references the right table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agent_tools' 
        AND column_name = 'tool_id'
    ) THEN
        BEGIN
            -- Rename column if it exists
            ALTER TABLE public.agent_tools RENAME COLUMN tool_id TO agent_tool_id;
            RAISE NOTICE '  ✓ Updated agent_tools.tool_id → agent_tool_id';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '  Note: agent_tools column already correct or does not exist';
        END;
    END IF;
END $$;

-- =====================================================================
-- 3. KNOWLEDGE TABLE (Already exists as knowledge_base - skip creation)
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE 'Knowledge table (knowledge_base) already exists - skipping creation'; 
END $$;

-- =====================================================================
-- 4. PROMPTS TABLE (Already exists - skip creation)
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE 'Prompts table already exists - skipping creation'; 
END $$;

-- =====================================================================
-- 5. CAPABILITIES TABLE (Already exists - skip creation)
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE 'Capabilities table already exists - skipping creation'; 
END $$;

-- =====================================================================
-- 6. WORKFLOWS TABLE (Already exists - skip creation)
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE 'Workflows table already exists - skipping creation'; 
END $$;

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

-- Note: agent_tools already exists - links agents to agent_tools_catalog

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

-- Note: persona_jtbds and role_jtbds might exist via jtbd_activity_tools

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

CREATE TABLE IF NOT EXISTS public.workflow_human_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    tool_id UUID NOT NULL, -- References tools table (human tools)
    step_order INTEGER,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workflow_id, tool_id, step_order)
);

CREATE INDEX IF NOT EXISTS idx_workflow_human_tools_workflow ON public.workflow_human_tools(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_human_tools_tool ON public.workflow_human_tools(tool_id);

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
          'agents', 'agent_tools_catalog', 'knowledge', 'prompts', 
          'capabilities', 'workflows', 'strategic_priorities', 'use_cases'
      );
    
    SELECT COUNT(*) INTO junction_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
          'agent_capabilities', 'agent_tools', 'agent_knowledge', 'agent_prompts', 'agent_workflows',
          'role_tools', 'persona_tools', 'task_tools',
          'persona_use_cases', 'role_use_cases',
          'priority_use_cases', 'priority_capabilities',
          'use_case_capabilities', 'use_case_workflows',
          'workflow_capabilities', 'workflow_human_tools', 'workflow_agent_tools'
      );
    
    RAISE NOTICE 'Core Application Tables: %/8', table_count;
    RAISE NOTICE '  ✓ agents';
    RAISE NOTICE '  ✓ agent_tools_catalog';
    RAISE NOTICE '  ✓ knowledge';
    RAISE NOTICE '  ✓ prompts';
    RAISE NOTICE '  ✓ capabilities';
    RAISE NOTICE '  ✓ workflows';
    RAISE NOTICE '  ✓ strategic_priorities';
    RAISE NOTICE '  ✓ use_cases';
    RAISE NOTICE '';
    RAISE NOTICE 'Junction Tables: %', junction_count;
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'TOOL ARCHITECTURE - TWO DISTINCT SYSTEMS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '1️⃣  HUMAN TOOLS SYSTEM (for personas/roles)';
    RAISE NOTICE '   📦 Master Table: tools (94 human tools)';
    RAISE NOTICE '      Examples: Veeva CRM, Excel, SAS, PowerPoint';
    RAISE NOTICE '   🔗 Junctions:';
    RAISE NOTICE '      • role_tools → Maps roles to tools they use';
    RAISE NOTICE '      • persona_tools → Maps personas to their tool stack';
    RAISE NOTICE '      • task_tools → Maps tasks to required tools';
    RAISE NOTICE '      • jtbd_activity_tools → Maps JTBD activities to tools';
    RAISE NOTICE '      • workflow_human_tools → Tools used in workflow steps';
    RAISE NOTICE '';
    RAISE NOTICE '2️⃣  AGENT TOOLS SYSTEM (for AI automation)';
    RAISE NOTICE '   📦 Master Table: agent_tools_catalog';
    RAISE NOTICE '      Examples: OpenAI API, Claude API, Web Search, MCP Servers';
    RAISE NOTICE '   🔗 Junctions:';
    RAISE NOTICE '      • agent_tools → Maps agents to APIs/functions they call';
    RAISE NOTICE '      • workflow_agent_tools → Agent tools used in workflows';
    RAISE NOTICE '';
    RAISE NOTICE '💡 KEY DISTINCTION:';
    RAISE NOTICE '   • tools table = Software HUMANS use (CRM, Office, etc.)';
    RAISE NOTICE '   • agent_tools_catalog = APIs AGENTS call (LLMs, search, etc.)';
    RAISE NOTICE '';
    RAISE NOTICE 'Complete VITAL Platform Schema Ready!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

