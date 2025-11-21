-- =====================================================================
-- VITAL PLATFORM DATA ARCHITECTURE
-- Agents → Roles → Personas (Inheritance Model)
-- =====================================================================

/*
ARCHITECTURE PRINCIPLE: NO DUPLICATION

┌─────────────────────────────────────────────────────────────────┐
│                     INHERITANCE HIERARCHY                        │
└─────────────────────────────────────────────────────────────────┘

1. ROLES (Baseline/Structural)
   └─ function_id, function_name
   └─ department_id, department_name  
   └─ role_name, role_id
   └─ team_size, budget, experience_range
   └─ responsibilities, KPIs, skills, tools
   └─ stakeholders, therapeutic_areas
   
2. PERSONAS (Behavioral Overlay on Role)
   └─ Links to → role_id (INHERITS ALL ROLE ATTRIBUTES)
   └─ Adds behavioral attributes:
      • archetype, seniority_level, years_experience
      • work_style, decision_style, risk_tolerance
      • AI_maturity_score, work_complexity_score
      • communication_preferences, goals, pain_points
   └─ Can OVERRIDE role defaults if needed (rare)
   
3. AGENTS (AI Implementation)
   └─ Links to → role_id (PRIMARY)
   └─ Optionally links to → persona_id (for persona-specific agents)
   └─ INHERITS from role:
      • function, department, role name
      • responsibilities, KPIs, skills
      • stakeholders, therapeutic areas
   └─ If persona_id set, ALSO inherits:
      • behavioral attributes
      • persona-specific overrides
   └─ Adds AI-specific:
      • system_prompt, model, temperature
      • agent_tools_catalog (APIs, functions)
      • usage metrics

┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

QUERY PATTERN:

-- Get Agent with full context (role + persona if exists)
SELECT 
    a.*,
    r.name as role_name,
    r.function_id, f.name as function_name,
    r.department_id, d.name as department_name,
    p.archetype, p.seniority_level,  -- persona-specific
    p.ai_maturity_score, p.work_complexity_score
FROM agents a
JOIN org_roles r ON a.role_id = r.id
JOIN org_functions f ON r.function_id = f.id  
JOIN org_departments d ON r.department_id = d.id
LEFT JOIN personas p ON a.persona_id = p.id  -- optional
WHERE a.id = ?;

-- Get Persona with full role context (no duplication)
SELECT 
    p.*,  -- persona-specific attributes
    r.*,  -- ALL role attributes inherited
    f.name as function_name,
    d.name as department_name
FROM personas p
JOIN org_roles r ON p.role_id = r.id
JOIN org_functions f ON r.function_id = f.id
JOIN org_departments d ON r.department_id = d.id
WHERE p.id = ?;

┌─────────────────────────────────────────────────────────────────┐
│                   NO DUPLICATION RULES                           │
└─────────────────────────────────────────────────────────────────┘

✅ STORE IN ROLES:
   • function_id, department_id, role_name
   • Structural attributes (team_size, budget, etc.)
   • All role-level junctions (role_responsibilities, role_kpis, etc.)

✅ STORE IN PERSONAS:  
   • role_id (REQUIRED - links to role)
   • Behavioral/archetype attributes ONLY
   • Persona-specific overrides (rare)

✅ STORE IN AGENTS:
   • role_id (REQUIRED - primary mapping)
   • persona_id (OPTIONAL - for persona-specific agents)
   • AI-specific attributes (model, prompts, etc.)
   • NO duplication of function/department/role names
   • Use views/joins to get full context

❌ DON'T STORE:
   • function_id, department_id in personas (get from role)
   • function_id, department_id in agents (get from role)
   • Duplicate names anywhere (compute via joins)

┌─────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION VIEWS                          │
└─────────────────────────────────────────────────────────────────┘
*/

-- View: Agents with full organizational context
CREATE OR REPLACE VIEW v_agents_with_full_context AS
SELECT 
    -- Agent identity
    a.id as agent_id,
    a.name as agent_name,
    a.slug as agent_slug,
    a.agent_type,
    a.is_active,
    
    -- Role mapping (PRIMARY)
    a.role_id,
    r.name as role_name,
    r.slug as role_slug,
    r.geographic_scope,
    r.seniority_level as role_seniority,
    
    -- Function (inherited from role)
    r.function_id,
    f.name as function_name,
    f.slug as function_slug,
    
    -- Department (inherited from role)
    r.department_id,
    d.name as department_name,
    d.slug as department_slug,
    
    -- Persona (OPTIONAL behavioral overlay)
    a.persona_id,
    p.name as persona_name,
    p.slug as persona_slug,
    p.archetype,
    p.ai_maturity_score,
    p.work_complexity_score,
    
    -- Tenant
    a.tenant_id,
    t.name as tenant_name,
    
    -- Agent AI config
    a.system_prompt,
    a.base_model,
    a.temperature,
    a.configuration,
    
    a.created_at,
    a.updated_at
FROM public.agents a
JOIN public.org_roles r ON a.role_id = r.id
JOIN public.org_functions f ON r.function_id = f.id
JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON a.persona_id = p.id
LEFT JOIN public.tenants t ON a.tenant_id = t.id
WHERE a.deleted_at IS NULL;

-- View: Personas with full role context (no duplication)
CREATE OR REPLACE VIEW v_personas_with_role_context AS
SELECT 
    -- Persona identity & behavioral attributes
    p.id as persona_id,
    p.name as persona_name,
    p.slug as persona_slug,
    p.archetype,
    p.seniority_level,
    p.years_of_experience,
    p.ai_maturity_score,
    p.work_complexity_score,
    
    -- Role attributes (INHERITED)
    p.role_id,
    r.name as role_name,
    r.slug as role_slug,
    r.geographic_scope,
    r.role_category,
    
    -- Function (INHERITED from role)
    r.function_id,
    f.name as function_name,
    f.slug as function_slug,
    
    -- Department (INHERITED from role)
    r.department_id,
    d.name as department_name,
    d.slug as department_slug,
    
    -- Tenant
    p.tenant_id,
    t.name as tenant_name,
    
    p.created_at,
    p.updated_at
FROM public.personas p
JOIN public.org_roles r ON p.role_id = r.id
JOIN public.org_functions f ON r.function_id = f.id
JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.tenants t ON p.tenant_id = t.id
WHERE p.deleted_at IS NULL;

-- View: Prompts with organizational context
CREATE OR REPLACE VIEW v_prompts_with_org_context AS
SELECT 
    pr.id as prompt_id,
    pr.name as prompt_name,
    pr.slug as prompt_slug,
    pr.prompt_type,
    
    -- Organizational context
    pr.role_id,
    r.name as role_name,
    pr.department_id,
    d.name as department_name,
    pr.function_id,
    f.name as function_name,
    
    pr.tenant_id,
    t.name as tenant_name,
    
    pr.content,
    pr.variables,
    pr.created_at
FROM public.prompts pr
LEFT JOIN public.org_roles r ON pr.role_id = r.id
LEFT JOIN public.org_departments d ON pr.department_id = d.id
LEFT JOIN public.org_functions f ON pr.function_id = f.id
LEFT JOIN public.tenants t ON pr.tenant_id = t.id
WHERE pr.deleted_at IS NULL;

-- View: Knowledge with organizational context
CREATE OR REPLACE VIEW v_knowledge_with_org_context AS
SELECT 
    k.id as knowledge_id,
    k.name as knowledge_name,
    k.slug as knowledge_slug,
    k.knowledge_type,
    
    -- Organizational context
    k.role_id,
    r.name as role_name,
    k.department_id,
    d.name as department_name,
    k.function_id,
    f.name as function_name,
    
    k.tenant_id,
    t.name as tenant_name,
    
    k.content,
    k.tags,
    k.created_at
FROM public.knowledge_base k
LEFT JOIN public.org_roles r ON k.role_id = r.id
LEFT JOIN public.org_departments d ON k.department_id = d.id  
LEFT JOIN public.org_functions f ON k.function_id = f.id
LEFT JOIN public.tenants t ON k.tenant_id = t.id;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'VITAL PLATFORM ARCHITECTURE VIEWS CREATED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'INHERITANCE MODEL:';
    RAISE NOTICE '  Agents → role_id (PRIMARY) + persona_id (OPTIONAL)';
    RAISE NOTICE '  Personas → role_id (INHERITS ALL role attributes)';
    RAISE NOTICE '  Prompts/Knowledge → function/dept/role (OPTIONAL context)';
    RAISE NOTICE '';
    RAISE NOTICE 'NO DUPLICATION:';
    RAISE NOTICE '  ✓ Function/Department/Role stored in org tables ONLY';
    RAISE NOTICE '  ✓ Personas add behavioral overlay, inherit structure from role';
    RAISE NOTICE '  ✓ Agents inherit from role + optional persona';
    RAISE NOTICE '  ✓ Names computed via views/joins, not duplicated';
    RAISE NOTICE '';
    RAISE NOTICE 'VIEWS CREATED:';
    RAISE NOTICE '  • v_agents_with_full_context';
    RAISE NOTICE '  • v_personas_with_role_context';
    RAISE NOTICE '  • v_prompts_with_org_context';
    RAISE NOTICE '  • v_knowledge_with_org_context';
    RAISE NOTICE '';
    RAISE NOTICE 'USAGE:';
    RAISE NOTICE '  SELECT * FROM v_agents_with_full_context;';
    RAISE NOTICE '  SELECT * FROM v_personas_with_role_context;';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

