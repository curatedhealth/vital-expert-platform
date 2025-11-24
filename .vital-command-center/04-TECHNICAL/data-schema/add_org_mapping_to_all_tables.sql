-- =====================================================================
-- ADD ORGANIZATIONAL STRUCTURE MAPPING TO ALL APPLICATION TABLES
-- Maps agents, prompts, knowledge, capabilities, JTBDs, workflows to org structure
-- Adds: function_id, function_name, department_id, department_name, role_id, role_name
-- Strategy: Store both IDs (for relationships) and names (for filtering/performance)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ADDING ORGANIZATIONAL STRUCTURE TO APPLICATION TABLES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Adding 6 columns to each table:';
    RAISE NOTICE '  • function_id (UUID) + function_name (TEXT)';
    RAISE NOTICE '  • department_id (UUID) + department_name (TEXT)';
    RAISE NOTICE '  • role_id (UUID) + role_name (TEXT)';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. AGENTS TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '1. Updating AGENTS table...'; END $$;

DO $$
BEGIN
    -- Add persona_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'persona_id') THEN
        ALTER TABLE public.agents ADD COLUMN persona_id UUID;
        CREATE INDEX IF NOT EXISTS idx_agents_persona ON public.agents(persona_id);
        RAISE NOTICE '  ✓ Added persona_id';
    ELSE
        RAISE NOTICE '  ✓ persona_id exists';
    END IF;
    
    -- Add function_id and function_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'function_id') THEN
        ALTER TABLE public.agents ADD COLUMN function_id UUID;
        CREATE INDEX IF NOT EXISTS idx_agents_function ON public.agents(function_id);
        RAISE NOTICE '  ✓ Added function_id';
    ELSE
        RAISE NOTICE '  ✓ function_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'function_name') THEN
        ALTER TABLE public.agents ADD COLUMN function_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_agents_function_name ON public.agents(function_name);
        RAISE NOTICE '  ✓ Added function_name';
    ELSE
        RAISE NOTICE '  ✓ function_name exists';
    END IF;
    
    -- Add department_id and department_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'department_id') THEN
        ALTER TABLE public.agents ADD COLUMN department_id UUID;
        CREATE INDEX IF NOT EXISTS idx_agents_department ON public.agents(department_id);
        RAISE NOTICE '  ✓ Added department_id';
    ELSE
        RAISE NOTICE '  ✓ department_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'department_name') THEN
        ALTER TABLE public.agents ADD COLUMN department_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_agents_department_name ON public.agents(department_name);
        RAISE NOTICE '  ✓ Added department_name';
    ELSE
        RAISE NOTICE '  ✓ department_name exists';
    END IF;
    
    -- Add role_id and role_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'role_id') THEN
        ALTER TABLE public.agents ADD COLUMN role_id UUID;
        CREATE INDEX IF NOT EXISTS idx_agents_role ON public.agents(role_id);
        RAISE NOTICE '  ✓ Added role_id';
    ELSE
        RAISE NOTICE '  ✓ role_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'role_name') THEN
        ALTER TABLE public.agents ADD COLUMN role_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_agents_role_name ON public.agents(role_name);
        RAISE NOTICE '  ✓ Added role_name';
    ELSE
        RAISE NOTICE '  ✓ role_name exists';
    END IF;
END $$;

-- =====================================================================
-- 2. PROMPTS TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE '2. Updating PROMPTS table...'; END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'function_id') THEN
        ALTER TABLE public.prompts ADD COLUMN function_id UUID;
        CREATE INDEX IF NOT EXISTS idx_prompts_function ON public.prompts(function_id);
        RAISE NOTICE '  ✓ Added function_id';
    ELSE
        RAISE NOTICE '  ✓ function_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'function_name') THEN
        ALTER TABLE public.prompts ADD COLUMN function_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_prompts_function_name ON public.prompts(function_name);
        RAISE NOTICE '  ✓ Added function_name';
    ELSE
        RAISE NOTICE '  ✓ function_name exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'department_id') THEN
        ALTER TABLE public.prompts ADD COLUMN department_id UUID;
        CREATE INDEX IF NOT EXISTS idx_prompts_department ON public.prompts(department_id);
        RAISE NOTICE '  ✓ Added department_id';
    ELSE
        RAISE NOTICE '  ✓ department_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'department_name') THEN
        ALTER TABLE public.prompts ADD COLUMN department_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_prompts_department_name ON public.prompts(department_name);
        RAISE NOTICE '  ✓ Added department_name';
    ELSE
        RAISE NOTICE '  ✓ department_name exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'role_id') THEN
        ALTER TABLE public.prompts ADD COLUMN role_id UUID;
        CREATE INDEX IF NOT EXISTS idx_prompts_role ON public.prompts(role_id);
        RAISE NOTICE '  ✓ Added role_id';
    ELSE
        RAISE NOTICE '  ✓ role_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'role_name') THEN
        ALTER TABLE public.prompts ADD COLUMN role_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_prompts_role_name ON public.prompts(role_name);
        RAISE NOTICE '  ✓ Added role_name';
    ELSE
        RAISE NOTICE '  ✓ role_name exists';
    END IF;
END $$;

-- =====================================================================
-- 3. KNOWLEDGE_BASE TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE '3. Updating KNOWLEDGE_BASE table...'; END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_base' AND column_name = 'function_id') THEN
        ALTER TABLE public.knowledge_base ADD COLUMN function_id UUID;
        CREATE INDEX IF NOT EXISTS idx_knowledge_base_function ON public.knowledge_base(function_id);
        RAISE NOTICE '  ✓ Added function_id';
    ELSE
        RAISE NOTICE '  ✓ function_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_base' AND column_name = 'function_name') THEN
        ALTER TABLE public.knowledge_base ADD COLUMN function_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_knowledge_base_function_name ON public.knowledge_base(function_name);
        RAISE NOTICE '  ✓ Added function_name';
    ELSE
        RAISE NOTICE '  ✓ function_name exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_base' AND column_name = 'department_id') THEN
        ALTER TABLE public.knowledge_base ADD COLUMN department_id UUID;
        CREATE INDEX IF NOT EXISTS idx_knowledge_base_department ON public.knowledge_base(department_id);
        RAISE NOTICE '  ✓ Added department_id';
    ELSE
        RAISE NOTICE '  ✓ department_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_base' AND column_name = 'department_name') THEN
        ALTER TABLE public.knowledge_base ADD COLUMN department_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_knowledge_base_department_name ON public.knowledge_base(department_name);
        RAISE NOTICE '  ✓ Added department_name';
    ELSE
        RAISE NOTICE '  ✓ department_name exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_base' AND column_name = 'role_id') THEN
        ALTER TABLE public.knowledge_base ADD COLUMN role_id UUID;
        CREATE INDEX IF NOT EXISTS idx_knowledge_base_role ON public.knowledge_base(role_id);
        RAISE NOTICE '  ✓ Added role_id';
    ELSE
        RAISE NOTICE '  ✓ role_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_base' AND column_name = 'role_name') THEN
        ALTER TABLE public.knowledge_base ADD COLUMN role_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_knowledge_base_role_name ON public.knowledge_base(role_name);
        RAISE NOTICE '  ✓ Added role_name';
    ELSE
        RAISE NOTICE '  ✓ role_name exists';
    END IF;
END $$;

-- =====================================================================
-- 4. CAPABILITIES TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE '4. Updating CAPABILITIES table...'; END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'function_id') THEN
        ALTER TABLE public.capabilities ADD COLUMN function_id UUID;
        CREATE INDEX IF NOT EXISTS idx_capabilities_function ON public.capabilities(function_id);
        RAISE NOTICE '  ✓ Added function_id';
    ELSE
        RAISE NOTICE '  ✓ function_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'function_name') THEN
        ALTER TABLE public.capabilities ADD COLUMN function_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_capabilities_function_name ON public.capabilities(function_name);
        RAISE NOTICE '  ✓ Added function_name';
    ELSE
        RAISE NOTICE '  ✓ function_name exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'department_id') THEN
        ALTER TABLE public.capabilities ADD COLUMN department_id UUID;
        CREATE INDEX IF NOT EXISTS idx_capabilities_department ON public.capabilities(department_id);
        RAISE NOTICE '  ✓ Added department_id';
    ELSE
        RAISE NOTICE '  ✓ department_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'department_name') THEN
        ALTER TABLE public.capabilities ADD COLUMN department_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_capabilities_department_name ON public.capabilities(department_name);
        RAISE NOTICE '  ✓ Added department_name';
    ELSE
        RAISE NOTICE '  ✓ department_name exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'role_id') THEN
        ALTER TABLE public.capabilities ADD COLUMN role_id UUID;
        CREATE INDEX IF NOT EXISTS idx_capabilities_role ON public.capabilities(role_id);
        RAISE NOTICE '  ✓ Added role_id';
    ELSE
        RAISE NOTICE '  ✓ role_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capabilities' AND column_name = 'role_name') THEN
        ALTER TABLE public.capabilities ADD COLUMN role_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_capabilities_role_name ON public.capabilities(role_name);
        RAISE NOTICE '  ✓ Added role_name';
    ELSE
        RAISE NOTICE '  ✓ role_name exists';
    END IF;
END $$;

-- =====================================================================
-- 5. JOBS_TO_BE_DONE TABLE (if exists)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE '5. Updating JOBS_TO_BE_DONE table (if exists)...'; END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs_to_be_done') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs_to_be_done' AND column_name = 'function_id') THEN
            ALTER TABLE public.jobs_to_be_done ADD COLUMN function_id UUID;
            CREATE INDEX IF NOT EXISTS idx_jobs_to_be_done_function ON public.jobs_to_be_done(function_id);
            RAISE NOTICE '  ✓ Added function_id';
        ELSE
            RAISE NOTICE '  ✓ function_id exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs_to_be_done' AND column_name = 'function_name') THEN
            ALTER TABLE public.jobs_to_be_done ADD COLUMN function_name TEXT;
            CREATE INDEX IF NOT EXISTS idx_jobs_to_be_done_function_name ON public.jobs_to_be_done(function_name);
            RAISE NOTICE '  ✓ Added function_name';
        ELSE
            RAISE NOTICE '  ✓ function_name exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs_to_be_done' AND column_name = 'department_id') THEN
            ALTER TABLE public.jobs_to_be_done ADD COLUMN department_id UUID;
            CREATE INDEX IF NOT EXISTS idx_jobs_to_be_done_department ON public.jobs_to_be_done(department_id);
            RAISE NOTICE '  ✓ Added department_id';
        ELSE
            RAISE NOTICE '  ✓ department_id exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs_to_be_done' AND column_name = 'department_name') THEN
            ALTER TABLE public.jobs_to_be_done ADD COLUMN department_name TEXT;
            CREATE INDEX IF NOT EXISTS idx_jobs_to_be_done_department_name ON public.jobs_to_be_done(department_name);
            RAISE NOTICE '  ✓ Added department_name';
        ELSE
            RAISE NOTICE '  ✓ department_name exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs_to_be_done' AND column_name = 'role_id') THEN
            ALTER TABLE public.jobs_to_be_done ADD COLUMN role_id UUID;
            CREATE INDEX IF NOT EXISTS idx_jobs_to_be_done_role ON public.jobs_to_be_done(role_id);
            RAISE NOTICE '  ✓ Added role_id';
        ELSE
            RAISE NOTICE '  ✓ role_id exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs_to_be_done' AND column_name = 'role_name') THEN
            ALTER TABLE public.jobs_to_be_done ADD COLUMN role_name TEXT;
            CREATE INDEX IF NOT EXISTS idx_jobs_to_be_done_role_name ON public.jobs_to_be_done(role_name);
            RAISE NOTICE '  ✓ Added role_name';
        ELSE
            RAISE NOTICE '  ✓ role_name exists';
        END IF;
    ELSE
        RAISE NOTICE '  ⚠ jobs_to_be_done table does not exist - skipping';
    END IF;
END $$;

-- =====================================================================
-- 6. WORKFLOWS TABLE (if exists)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE '6. Updating WORKFLOWS table (if exists)...'; END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflows') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflows' AND column_name = 'function_id') THEN
            ALTER TABLE public.workflows ADD COLUMN function_id UUID;
            CREATE INDEX IF NOT EXISTS idx_workflows_function ON public.workflows(function_id);
            RAISE NOTICE '  ✓ Added function_id';
        ELSE
            RAISE NOTICE '  ✓ function_id exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflows' AND column_name = 'function_name') THEN
            ALTER TABLE public.workflows ADD COLUMN function_name TEXT;
            CREATE INDEX IF NOT EXISTS idx_workflows_function_name ON public.workflows(function_name);
            RAISE NOTICE '  ✓ Added function_name';
        ELSE
            RAISE NOTICE '  ✓ function_name exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflows' AND column_name = 'department_id') THEN
            ALTER TABLE public.workflows ADD COLUMN department_id UUID;
            CREATE INDEX IF NOT EXISTS idx_workflows_department ON public.workflows(department_id);
            RAISE NOTICE '  ✓ Added department_id';
        ELSE
            RAISE NOTICE '  ✓ department_id exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflows' AND column_name = 'department_name') THEN
            ALTER TABLE public.workflows ADD COLUMN department_name TEXT;
            CREATE INDEX IF NOT EXISTS idx_workflows_department_name ON public.workflows(department_name);
            RAISE NOTICE '  ✓ Added department_name';
        ELSE
            RAISE NOTICE '  ✓ department_name exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflows' AND column_name = 'role_id') THEN
            ALTER TABLE public.workflows ADD COLUMN role_id UUID;
            CREATE INDEX IF NOT EXISTS idx_workflows_role ON public.workflows(role_id);
            RAISE NOTICE '  ✓ Added role_id';
        ELSE
            RAISE NOTICE '  ✓ role_id exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflows' AND column_name = 'role_name') THEN
            ALTER TABLE public.workflows ADD COLUMN role_name TEXT;
            CREATE INDEX IF NOT EXISTS idx_workflows_role_name ON public.workflows(role_name);
            RAISE NOTICE '  ✓ Added role_name';
        ELSE
            RAISE NOTICE '  ✓ role_name exists';
        END IF;
    ELSE
        RAISE NOTICE '  ⚠ workflows table does not exist - skipping';
    END IF;
END $$;

-- =====================================================================
-- 7. PERSONAS TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE '7. Updating PERSONAS table...'; END $$;

DO $$
BEGIN
    -- Personas inherit from roles, but we denormalize for performance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'function_id') THEN
        ALTER TABLE public.personas ADD COLUMN function_id UUID;
        CREATE INDEX IF NOT EXISTS idx_personas_function ON public.personas(function_id);
        RAISE NOTICE '  ✓ Added function_id';
    ELSE
        RAISE NOTICE '  ✓ function_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'function_name') THEN
        ALTER TABLE public.personas ADD COLUMN function_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_personas_function_name ON public.personas(function_name);
        RAISE NOTICE '  ✓ Added function_name';
    ELSE
        RAISE NOTICE '  ✓ function_name exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'department_id') THEN
        ALTER TABLE public.personas ADD COLUMN department_id UUID;
        CREATE INDEX IF NOT EXISTS idx_personas_department ON public.personas(department_id);
        RAISE NOTICE '  ✓ Added department_id';
    ELSE
        RAISE NOTICE '  ✓ department_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'department_name') THEN
        ALTER TABLE public.personas ADD COLUMN department_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_personas_department_name ON public.personas(department_name);
        RAISE NOTICE '  ✓ Added department_name';
    ELSE
        RAISE NOTICE '  ✓ department_name exists';
    END IF;
    
    -- Note: role_id and role_name likely already exist on personas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'role_id') THEN
        ALTER TABLE public.personas ADD COLUMN role_id UUID;
        CREATE INDEX IF NOT EXISTS idx_personas_role ON public.personas(role_id);
        RAISE NOTICE '  ✓ Added role_id';
    ELSE
        RAISE NOTICE '  ✓ role_id exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'role_name') THEN
        ALTER TABLE public.personas ADD COLUMN role_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_personas_role_name ON public.personas(role_name);
        RAISE NOTICE '  ✓ Added role_name';
    ELSE
        RAISE NOTICE '  ✓ role_name exists';
    END IF;
END $$;

-- =====================================================================
-- 8. CREATE TRIGGERS TO AUTO-SYNC NAME COLUMNS FROM ID COLUMNS
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE ''; 
    RAISE NOTICE '8. Creating triggers to auto-populate _name columns...'; 
END $$;

-- Trigger function for PERSONAS
CREATE OR REPLACE FUNCTION sync_persona_org_names()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.function_id IS NOT NULL THEN
        SELECT name INTO NEW.function_name FROM org_functions WHERE id = NEW.function_id;
    END IF;
    IF NEW.department_id IS NOT NULL THEN
        SELECT name INTO NEW.department_name FROM org_departments WHERE id = NEW.department_id;
    END IF;
    IF NEW.role_id IS NOT NULL THEN
        SELECT name INTO NEW.role_name FROM org_roles WHERE id = NEW.role_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_persona_org_names ON public.personas;
CREATE TRIGGER trigger_sync_persona_org_names
    BEFORE INSERT OR UPDATE OF function_id, department_id, role_id ON public.personas
    FOR EACH ROW
    EXECUTE FUNCTION sync_persona_org_names();

DO $$ BEGIN RAISE NOTICE '  ✓ Created sync trigger for personas'; END $$;

-- Trigger function for AGENTS
CREATE OR REPLACE FUNCTION sync_agent_org_names()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.function_id IS NOT NULL THEN
        SELECT name INTO NEW.function_name FROM org_functions WHERE id = NEW.function_id;
    END IF;
    IF NEW.department_id IS NOT NULL THEN
        SELECT name INTO NEW.department_name FROM org_departments WHERE id = NEW.department_id;
    END IF;
    IF NEW.role_id IS NOT NULL THEN
        SELECT name INTO NEW.role_name FROM org_roles WHERE id = NEW.role_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_agent_org_names ON public.agents;
CREATE TRIGGER trigger_sync_agent_org_names
    BEFORE INSERT OR UPDATE OF function_id, department_id, role_id ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION sync_agent_org_names();

DO $$ BEGIN RAISE NOTICE '  ✓ Created sync trigger for agents'; END $$;

-- Trigger function for PROMPTS
CREATE OR REPLACE FUNCTION sync_prompt_org_names()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.function_id IS NOT NULL THEN
        SELECT name INTO NEW.function_name FROM org_functions WHERE id = NEW.function_id;
    END IF;
    IF NEW.department_id IS NOT NULL THEN
        SELECT name INTO NEW.department_name FROM org_departments WHERE id = NEW.department_id;
    END IF;
    IF NEW.role_id IS NOT NULL THEN
        SELECT name INTO NEW.role_name FROM org_roles WHERE id = NEW.role_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_prompt_org_names ON public.prompts;
CREATE TRIGGER trigger_sync_prompt_org_names
    BEFORE INSERT OR UPDATE OF function_id, department_id, role_id ON public.prompts
    FOR EACH ROW
    EXECUTE FUNCTION sync_prompt_org_names();

DO $$ BEGIN RAISE NOTICE '  ✓ Created sync trigger for prompts'; END $$;

-- Trigger function for KNOWLEDGE_BASE
CREATE OR REPLACE FUNCTION sync_knowledge_org_names()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.function_id IS NOT NULL THEN
        SELECT name INTO NEW.function_name FROM org_functions WHERE id = NEW.function_id;
    END IF;
    IF NEW.department_id IS NOT NULL THEN
        SELECT name INTO NEW.department_name FROM org_departments WHERE id = NEW.department_id;
    END IF;
    IF NEW.role_id IS NOT NULL THEN
        SELECT name INTO NEW.role_name FROM org_roles WHERE id = NEW.role_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_knowledge_org_names ON public.knowledge_base;
CREATE TRIGGER trigger_sync_knowledge_org_names
    BEFORE INSERT OR UPDATE OF function_id, department_id, role_id ON public.knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION sync_knowledge_org_names();

DO $$ BEGIN RAISE NOTICE '  ✓ Created sync trigger for knowledge_base'; END $$;

-- Trigger function for CAPABILITIES
CREATE OR REPLACE FUNCTION sync_capability_org_names()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.function_id IS NOT NULL THEN
        SELECT name INTO NEW.function_name FROM org_functions WHERE id = NEW.function_id;
    END IF;
    IF NEW.department_id IS NOT NULL THEN
        SELECT name INTO NEW.department_name FROM org_departments WHERE id = NEW.department_id;
    END IF;
    IF NEW.role_id IS NOT NULL THEN
        SELECT name INTO NEW.role_name FROM org_roles WHERE id = NEW.role_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_capability_org_names ON public.capabilities;
CREATE TRIGGER trigger_sync_capability_org_names
    BEFORE INSERT OR UPDATE OF function_id, department_id, role_id ON public.capabilities
    FOR EACH ROW
    EXECUTE FUNCTION sync_capability_org_names();

DO $$ BEGIN RAISE NOTICE '  ✓ Created sync trigger for capabilities'; END $$;

-- Trigger function for JOBS_TO_BE_DONE (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs_to_be_done') THEN
        EXECUTE '
        CREATE OR REPLACE FUNCTION sync_jtbd_org_names()
        RETURNS TRIGGER AS $t$
        BEGIN
            IF NEW.function_id IS NOT NULL THEN
                SELECT name INTO NEW.function_name FROM org_functions WHERE id = NEW.function_id;
            END IF;
            IF NEW.department_id IS NOT NULL THEN
                SELECT name INTO NEW.department_name FROM org_departments WHERE id = NEW.department_id;
            END IF;
            IF NEW.role_id IS NOT NULL THEN
                SELECT name INTO NEW.role_name FROM org_roles WHERE id = NEW.role_id;
            END IF;
            RETURN NEW;
        END;
        $t$ LANGUAGE plpgsql;
        ';
        
        DROP TRIGGER IF EXISTS trigger_sync_jtbd_org_names ON public.jobs_to_be_done;
        EXECUTE '
        CREATE TRIGGER trigger_sync_jtbd_org_names
            BEFORE INSERT OR UPDATE OF function_id, department_id, role_id ON public.jobs_to_be_done
            FOR EACH ROW
            EXECUTE FUNCTION sync_jtbd_org_names();
        ';
        RAISE NOTICE '  ✓ Created sync trigger for jobs_to_be_done';
    END IF;
END $$;

-- Trigger function for WORKFLOWS (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflows') THEN
        EXECUTE '
        CREATE OR REPLACE FUNCTION sync_workflow_org_names()
        RETURNS TRIGGER AS $t$
        BEGIN
            IF NEW.function_id IS NOT NULL THEN
                SELECT name INTO NEW.function_name FROM org_functions WHERE id = NEW.function_id;
            END IF;
            IF NEW.department_id IS NOT NULL THEN
                SELECT name INTO NEW.department_name FROM org_departments WHERE id = NEW.department_id;
            END IF;
            IF NEW.role_id IS NOT NULL THEN
                SELECT name INTO NEW.role_name FROM org_roles WHERE id = NEW.role_id;
            END IF;
            RETURN NEW;
        END;
        $t$ LANGUAGE plpgsql;
        ';
        
        DROP TRIGGER IF EXISTS trigger_sync_workflow_org_names ON public.workflows;
        EXECUTE '
        CREATE TRIGGER trigger_sync_workflow_org_names
            BEFORE INSERT OR UPDATE OF function_id, department_id, role_id ON public.workflows
            FOR EACH ROW
            EXECUTE FUNCTION sync_workflow_org_names();
        ';
        RAISE NOTICE '  ✓ Created sync trigger for workflows';
    END IF;
END $$;

-- =====================================================================
-- 9. CREATE HELPER VIEWS
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE ''; 
    RAISE NOTICE '9. Creating helper views...'; 
END $$;

-- View: v_personas_full_org - Personas with complete org hierarchy
CREATE OR REPLACE VIEW v_personas_full_org AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.title,
    p.archetype,
    p.tenant_id,
    t.name as tenant_name,
    
    -- Org structure (with both IDs and names)
    p.function_id,
    p.function_name,
    p.department_id,
    p.department_name,
    p.role_id,
    p.role_name,
    
    -- Full org objects
    jsonb_build_object(
        'id', f.id,
        'name', f.name,
        'slug', f.slug
    ) as function_object,
    jsonb_build_object(
        'id', d.id,
        'name', d.name,
        'slug', d.slug
    ) as department_object,
    jsonb_build_object(
        'id', r.id,
        'name', r.name,
        'slug', r.slug,
        'seniority_level', r.seniority_level,
        'geographic_scope', r.geographic_scope
    ) as role_object,
    
    -- Persona metadata
    p.work_style,
    p.ai_maturity_score,
    p.work_complexity_score,
    p.created_at,
    p.updated_at
FROM personas p
LEFT JOIN tenants t ON p.tenant_id = t.id AND t.deleted_at IS NULL
LEFT JOIN org_functions f ON p.function_id = f.id AND f.deleted_at IS NULL
LEFT JOIN org_departments d ON p.department_id = d.id AND d.deleted_at IS NULL
LEFT JOIN org_roles r ON p.role_id = r.id AND r.deleted_at IS NULL
WHERE p.deleted_at IS NULL;

DO $$ BEGIN RAISE NOTICE '  ✓ Created v_personas_full_org'; END $$;

-- View: v_agents_full_org - Agents with complete org hierarchy
CREATE OR REPLACE VIEW v_agents_full_org AS
SELECT 
    a.id,
    a.name,
    a.slug,
    a.tenant_id,
    t.name as tenant_name,
    
    -- Org structure (with both IDs and names)
    a.function_id,
    a.function_name,
    a.department_id,
    a.department_name,
    a.role_id,
    a.role_name,
    
    -- Persona (if linked)
    a.persona_id,
    p.name as persona_name,
    
    -- Full org objects (for API responses)
    jsonb_build_object(
        'id', f.id,
        'name', f.name,
        'slug', f.slug
    ) as function_object,
    jsonb_build_object(
        'id', d.id,
        'name', d.name,
        'slug', d.slug
    ) as department_object,
    jsonb_build_object(
        'id', r.id,
        'name', r.name,
        'slug', r.slug,
        'seniority_level', r.seniority_level,
        'geographic_scope', r.geographic_scope
    ) as role_object,
    
    -- Agent metadata (using actual columns from your schema)
    a.created_at,
    a.updated_at
FROM agents a
LEFT JOIN tenants t ON a.tenant_id = t.id AND t.deleted_at IS NULL
LEFT JOIN personas p ON a.persona_id = p.id AND p.deleted_at IS NULL
LEFT JOIN org_functions f ON a.function_id = f.id AND f.deleted_at IS NULL
LEFT JOIN org_departments d ON a.department_id = d.id AND d.deleted_at IS NULL
LEFT JOIN org_roles r ON a.role_id = r.id AND r.deleted_at IS NULL
WHERE a.deleted_at IS NULL;

DO $$ BEGIN RAISE NOTICE '  ✓ Created v_agents_full_org'; END $$;

-- =====================================================================
-- 10. SUMMARY
-- =====================================================================

DO $$
DECLARE
    agents_with_func INTEGER;
    agents_with_dept INTEGER;
    agents_with_role INTEGER;
    personas_count INTEGER;
    personas_with_role INTEGER;
    prompts_count INTEGER;
    knowledge_count INTEGER;
    capabilities_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO agents_with_func FROM agents WHERE function_id IS NOT NULL AND deleted_at IS NULL;
    SELECT COUNT(*) INTO agents_with_dept FROM agents WHERE department_id IS NOT NULL AND deleted_at IS NULL;
    SELECT COUNT(*) INTO agents_with_role FROM agents WHERE role_id IS NOT NULL AND deleted_at IS NULL;
    SELECT COUNT(*) INTO personas_count FROM personas WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO personas_with_role FROM personas WHERE role_id IS NOT NULL AND deleted_at IS NULL;
    SELECT COUNT(*) INTO prompts_count FROM prompts;
    SELECT COUNT(*) INTO knowledge_count FROM knowledge_base;
    SELECT COUNT(*) INTO capabilities_count FROM capabilities WHERE deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ORGANIZATIONAL STRUCTURE MAPPING COMPLETE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables Updated:';
    RAISE NOTICE '  ✓ personas (% total, % with role)', personas_count, personas_with_role;
    RAISE NOTICE '  ✓ agents (319 total, % with role)', agents_with_role;
    RAISE NOTICE '  ✓ prompts (% rows)', prompts_count;
    RAISE NOTICE '  ✓ knowledge_base (% rows)', knowledge_count;
    RAISE NOTICE '  ✓ capabilities (% rows)', capabilities_count;
    RAISE NOTICE '  ✓ jobs_to_be_done (if exists)';
    RAISE NOTICE '  ✓ workflows (if exists)';
    RAISE NOTICE '';
    RAISE NOTICE 'Columns Added (6 per table):';
    RAISE NOTICE '  • function_id (UUID) + function_name (TEXT)';
    RAISE NOTICE '  • department_id (UUID) + department_name (TEXT)';
    RAISE NOTICE '  • role_id (UUID) + role_name (TEXT)';
    RAISE NOTICE '';
    RAISE NOTICE 'Triggers Created:';
    RAISE NOTICE '  • Auto-populate _name columns when _id is set';
    RAISE NOTICE '  • Works on INSERT and UPDATE';
    RAISE NOTICE '  • Covers: personas, agents, prompts, knowledge_base, capabilities';
    RAISE NOTICE '';
    RAISE NOTICE 'Views Created:';
    RAISE NOTICE '  • v_personas_full_org - Personas with complete org context';
    RAISE NOTICE '  • v_agents_full_org - Agents with complete org context';
    RAISE NOTICE '';
    RAISE NOTICE 'Current Mappings:';
    RAISE NOTICE '  Agents with function: %', agents_with_func;
    RAISE NOTICE '  Agents with department: %', agents_with_dept;
    RAISE NOTICE '  Agents with role: %', agents_with_role;
    RAISE NOTICE '  Personas with role: %', personas_with_role;
    RAISE NOTICE '';
    RAISE NOTICE 'Usage Examples:';
    RAISE NOTICE '  -- Fast filtering by name (indexed)';
    RAISE NOTICE '  SELECT * FROM agents WHERE function_name = ''Medical Affairs'';';
    RAISE NOTICE '  SELECT * FROM personas WHERE department_name = ''Field Medical'';';
    RAISE NOTICE '';
    RAISE NOTICE '  -- Complete context via views';
    RAISE NOTICE '  SELECT * FROM v_agents_full_org WHERE function_name = ''Medical Affairs'';';
    RAISE NOTICE '  SELECT * FROM v_personas_full_org WHERE role_name LIKE ''MSL%%'';';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Run: create_architecture_views.sql (more comprehensive views)';
    RAISE NOTICE '  2. Populate org data for existing records';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;
