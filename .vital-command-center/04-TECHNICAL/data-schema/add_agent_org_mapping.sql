-- =====================================================================
-- ADD ORGANIZATIONAL MAPPING TO AGENTS TABLE
-- Links agents to function, department, role (in addition to persona)
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ADDING ORGANIZATIONAL STRUCTURE TO AGENTS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. CHECK IF AGENTS TABLE EXISTS AND ADD MISSING COLUMNS
-- =====================================================================

DO $$
BEGIN
    -- Add function_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agents' 
        AND column_name = 'function_id'
    ) THEN
        ALTER TABLE public.agents ADD COLUMN function_id UUID;
        CREATE INDEX idx_agents_function ON public.agents(function_id);
        RAISE NOTICE '✓ Added function_id to agents table';
    ELSE
        RAISE NOTICE '  agents.function_id already exists';
    END IF;

    -- Add department_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agents' 
        AND column_name = 'department_id'
    ) THEN
        ALTER TABLE public.agents ADD COLUMN department_id UUID;
        CREATE INDEX idx_agents_department ON public.agents(department_id);
        RAISE NOTICE '✓ Added department_id to agents table';
    ELSE
        RAISE NOTICE '  agents.department_id already exists';
    END IF;

    -- Check if role_id exists (should already be there)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agents' 
        AND column_name = 'role_id'
    ) THEN
        ALTER TABLE public.agents ADD COLUMN role_id UUID;
        CREATE INDEX idx_agents_role ON public.agents(role_id);
        RAISE NOTICE '✓ Added role_id to agents table';
    ELSE
        RAISE NOTICE '  agents.role_id already exists';
    END IF;

    -- Check if persona_id exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agents' 
        AND column_name = 'persona_id'
    ) THEN
        ALTER TABLE public.agents ADD COLUMN persona_id UUID;
        CREATE INDEX idx_agents_persona ON public.agents(persona_id);
        RAISE NOTICE '✓ Added persona_id to agents table';
    ELSE
        RAISE NOTICE '  agents.persona_id already exists';
    END IF;
END $$;

-- =====================================================================
-- 2. VERIFY PERSONAS TABLE STRUCTURE
-- =====================================================================

DO $$
DECLARE
    persona_id_col TEXT;
    persona_role_col TEXT;
    persona_function_col TEXT;
    persona_dept_col TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Checking personas table structure...';
    
    -- Check for ID column
    SELECT column_name INTO persona_id_col
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'personas'
    AND column_name IN ('id', 'persona_id')
    LIMIT 1;
    
    IF persona_id_col IS NOT NULL THEN
        RAISE NOTICE '  ✓ Personas ID column: %', persona_id_col;
    ELSE
        RAISE NOTICE '  ✗ WARNING: No ID column found in personas table!';
    END IF;
    
    -- Check for role reference
    SELECT column_name INTO persona_role_col
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'personas'
    AND column_name IN ('role_id', 'org_role_id')
    LIMIT 1;
    
    IF persona_role_col IS NOT NULL THEN
        RAISE NOTICE '  ✓ Personas role reference: %', persona_role_col;
    ELSE
        RAISE NOTICE '  ✗ WARNING: No role_id column found in personas table!';
    END IF;
    
    -- Check for function reference
    SELECT column_name INTO persona_function_col
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'personas'
    AND column_name IN ('function_id', 'org_function_id')
    LIMIT 1;
    
    IF persona_function_col IS NOT NULL THEN
        RAISE NOTICE '  ✓ Personas function reference: %', persona_function_col;
    ELSE
        RAISE NOTICE '  Note: No function_id in personas table (okay if inherited from role)';
    END IF;
    
    -- Check for department reference
    SELECT column_name INTO persona_dept_col
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'personas'
    AND column_name IN ('department_id', 'org_department_id')
    LIMIT 1;
    
    IF persona_dept_col IS NOT NULL THEN
        RAISE NOTICE '  ✓ Personas department reference: %', persona_dept_col;
    ELSE
        RAISE NOTICE '  Note: No department_id in personas table (okay if inherited from role)';
    END IF;
END $$;

-- =====================================================================
-- 3. CREATE HELPER VIEW FOR AGENT ORGANIZATIONAL CONTEXT
-- =====================================================================

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE 'Creating helper view...'; END $$;

CREATE OR REPLACE VIEW v_agents_with_org_context AS
SELECT 
    a.id as agent_id,
    a.name as agent_name,
    a.slug as agent_slug,
    a.agent_type,
    a.is_active,
    
    -- Persona info
    a.persona_id,
    p.name as persona_name,
    p.slug as persona_slug,
    
    -- Direct agent mappings
    a.role_id as agent_role_id,
    a.department_id as agent_department_id,
    a.function_id as agent_function_id,
    
    -- Persona's role mapping (fallback)
    COALESCE(
        CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'role_id')
        THEN (SELECT role_id FROM personas WHERE id = a.persona_id)
        ELSE NULL END,
        a.role_id
    ) as effective_role_id,
    
    -- Role info (from agent or persona)
    r.name as role_name,
    r.slug as role_slug,
    r.geographic_scope,
    r.seniority_level,
    
    -- Department info
    d.name as department_name,
    d.slug as department_slug,
    
    -- Function info
    f.name as function_name,
    f.slug as function_slug,
    
    -- Tenant info
    a.tenant_id,
    t.name as tenant_name,
    
    a.configuration,
    a.metadata,
    a.created_at,
    a.updated_at
FROM public.agents a
LEFT JOIN public.personas p ON a.persona_id = p.id
LEFT JOIN public.org_roles r ON COALESCE(a.role_id, 
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'role_id')
    THEN (SELECT role_id FROM personas WHERE id = a.persona_id)
    ELSE NULL END
) = r.id
LEFT JOIN public.org_departments d ON COALESCE(a.department_id, r.department_id) = d.id
LEFT JOIN public.org_functions f ON COALESCE(a.function_id, d.function_id) = f.id
LEFT JOIN public.tenants t ON a.tenant_id = t.id
WHERE a.deleted_at IS NULL;

DO $$ BEGIN RAISE NOTICE '  ✓ Created v_agents_with_org_context view'; END $$;

-- =====================================================================
-- 4. CREATE HELPER FUNCTION TO AUTO-POPULATE ORG FIELDS FROM PERSONA
-- =====================================================================

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE 'Creating helper function...'; END $$;

CREATE OR REPLACE FUNCTION sync_agent_org_from_persona()
RETURNS TRIGGER AS $$
DECLARE
    persona_role UUID;
    role_dept UUID;
    dept_func UUID;
BEGIN
    -- If agent has a persona but missing org fields, inherit from persona/role
    IF NEW.persona_id IS NOT NULL THEN
        -- Get role from persona (if column exists)
        IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'role_id') THEN
            SELECT role_id INTO persona_role
            FROM personas 
            WHERE id = NEW.persona_id;
            
            -- Set role_id if not explicitly set
            IF NEW.role_id IS NULL AND persona_role IS NOT NULL THEN
                NEW.role_id := persona_role;
            END IF;
        END IF;
        
        -- Get department from role
        IF NEW.role_id IS NOT NULL AND NEW.department_id IS NULL THEN
            SELECT department_id INTO role_dept
            FROM org_roles
            WHERE id = NEW.role_id;
            
            NEW.department_id := role_dept;
        END IF;
        
        -- Get function from department
        IF NEW.department_id IS NOT NULL AND NEW.function_id IS NULL THEN
            SELECT function_id INTO dept_func
            FROM org_departments
            WHERE id = NEW.department_id;
            
            NEW.function_id := dept_func;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_sync_agent_org ON public.agents;
CREATE TRIGGER trigger_sync_agent_org
    BEFORE INSERT OR UPDATE ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION sync_agent_org_from_persona();

DO $$ BEGIN RAISE NOTICE '  ✓ Created sync_agent_org_from_persona() trigger'; END $$;

-- =====================================================================
-- 5. SUMMARY
-- =====================================================================

DO $$
DECLARE
    agents_with_persona INTEGER;
    agents_with_role INTEGER;
    agents_with_dept INTEGER;
    agents_with_func INTEGER;
    total_agents INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_agents FROM agents WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO agents_with_persona FROM agents WHERE persona_id IS NOT NULL AND deleted_at IS NULL;
    SELECT COUNT(*) INTO agents_with_role FROM agents WHERE role_id IS NOT NULL AND deleted_at IS NULL;
    SELECT COUNT(*) INTO agents_with_dept FROM agents WHERE department_id IS NOT NULL AND deleted_at IS NULL;
    SELECT COUNT(*) INTO agents_with_func FROM agents WHERE function_id IS NOT NULL AND deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'AGENT ORGANIZATIONAL MAPPING COMPLETE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Agent Table Structure:';
    RAISE NOTICE '  ✓ persona_id → Links to personas table';
    RAISE NOTICE '  ✓ role_id → Links to org_roles table';
    RAISE NOTICE '  ✓ department_id → Links to org_departments table';
    RAISE NOTICE '  ✓ function_id → Links to org_functions table';
    RAISE NOTICE '  ✓ tenant_id → Links to tenants table';
    RAISE NOTICE '';
    RAISE NOTICE 'Current Agent Stats:';
    RAISE NOTICE '  Total agents: %', total_agents;
    RAISE NOTICE '  With persona mapping: %', agents_with_persona;
    RAISE NOTICE '  With role mapping: %', agents_with_role;
    RAISE NOTICE '  With department mapping: %', agents_with_dept;
    RAISE NOTICE '  With function mapping: %', agents_with_func;
    RAISE NOTICE '';
    RAISE NOTICE 'Usage:';
    RAISE NOTICE '  • Query agents with full org context: SELECT * FROM v_agents_with_org_context;';
    RAISE NOTICE '  • Org fields auto-populate from persona when inserting agents';
    RAISE NOTICE '  • Can override org fields explicitly if needed';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

