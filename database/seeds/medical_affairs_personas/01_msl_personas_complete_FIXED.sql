-- ============================================================================
-- MEDICAL SCIENCE LIAISON (MSL) - 4 MECE PERSONAS
-- FIXED VERSION - Matches actual database schema
-- Version: 1.1 | Date: 2025-11-27
-- ============================================================================

-- The actual personas table has these columns:
-- id, name, description, role_id, function_id, department_id, tenant_id, created_at, updated_at
-- 
-- Additional persona data is stored in JSONB metadata or separate junction tables

BEGIN;

DO $$
DECLARE
    v_tenant_id UUID;
    v_role_id UUID;
    v_function_id UUID;
    v_department_id UUID;
    v_persona_id UUID;
BEGIN
    -- Get Pharma tenant ID
    SELECT id INTO v_tenant_id FROM tenants WHERE slug IN ('pharma', 'pharmaceuticals') LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE NOTICE 'Pharma tenant not found, creating...';
        INSERT INTO tenants (name, slug, industry, type)
        VALUES ('Pharmaceuticals', 'pharma', 'Pharmaceutical', 'client')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_tenant_id;
    END IF;
    
    -- Get Medical Affairs function (try multiple column names for compatibility)
    BEGIN
        SELECT id INTO v_function_id FROM org_functions WHERE department_name ILIKE '%medical%affairs%' LIMIT 1;
    EXCEPTION WHEN undefined_column THEN
        -- Try alternative column names
        BEGIN
            SELECT id INTO v_function_id FROM org_functions WHERE name ILIKE '%medical%affairs%' LIMIT 1;
        EXCEPTION WHEN undefined_column THEN
            SELECT id INTO v_function_id FROM org_functions WHERE unique_id ILIKE '%medical%affairs%' LIMIT 1;
        END;
    END;
    
    -- Get Field Medical department (try multiple column names)
    BEGIN
        SELECT id INTO v_department_id FROM org_departments WHERE department_name ILIKE '%field%medical%' OR department_name ILIKE '%medical%affairs%' LIMIT 1;
    EXCEPTION WHEN undefined_column THEN
        BEGIN
            SELECT id INTO v_department_id FROM org_departments WHERE name ILIKE '%field%medical%' OR name ILIKE '%medical%affairs%' LIMIT 1;
        EXCEPTION WHEN undefined_column THEN
            v_department_id := NULL;
        END;
    END;
    
    -- Get MSL role (try multiple column names)
    BEGIN
        SELECT id INTO v_role_id FROM org_roles WHERE role_name ILIKE '%Medical Science Liaison%' LIMIT 1;
    EXCEPTION WHEN undefined_column THEN
        SELECT id INTO v_role_id FROM org_roles WHERE name ILIKE '%Medical Science Liaison%' LIMIT 1;
    END;

    RAISE NOTICE 'tenant_id: %, function_id: %, department_id: %, role_id: %', v_tenant_id, v_function_id, v_department_id, v_role_id;

    -- ========================================================================
    -- MSL PERSONA 1: AUTOMATOR
    -- High AI Maturity (75) + Routine Work (35)
    -- ========================================================================
    
    INSERT INTO personas (
        name, 
        description, 
        role_id, 
        function_id, 
        department_id,
        tenant_id,
        created_at, 
        updated_at
    ) VALUES (
        'Dr. Sarah Chen - MSL Automator',
        'Efficiency-Driven Field Medical Expert. Medical Science Liaison with 6 years experience. AUTOMATOR archetype - High AI Maturity (75), Routine Work (35). Early adopter who maximizes automation for routine tasks. Preferred service layer: WORKFLOWS. VPANES: V8 P7 A8 N5 E6 S9.',
        v_role_id,
        v_function_id,
        v_department_id,
        v_tenant_id,
        NOW(), 
        NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_persona_id;

    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id FROM personas WHERE name = 'Dr. Sarah Chen - MSL Automator' LIMIT 1;
    END IF;

    RAISE NOTICE 'Created MSL Automator persona: %', v_persona_id;

    -- ========================================================================
    -- MSL PERSONA 2: ORCHESTRATOR
    -- High AI Maturity (82) + Strategic Work (75)
    -- ========================================================================
    
    INSERT INTO personas (
        name, 
        description, 
        role_id, 
        function_id, 
        department_id,
        tenant_id,
        created_at, 
        updated_at
    ) VALUES (
        'Dr. Michael Rodriguez - MSL Orchestrator',
        'Strategic KOL Ecosystem Architect. Senior Medical Science Liaison with 12 years experience. ORCHESTRATOR archetype - High AI Maturity (82), Strategic Work (75). Innovator who orchestrates complex multi-agent workflows. Preferred service layer: SOLUTION_BUILDER. VPANES: V9 P8 A9 N7 E7 S8.',
        v_role_id,
        v_function_id,
        v_department_id,
        v_tenant_id,
        NOW(), 
        NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_persona_id;

    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id FROM personas WHERE name = 'Dr. Michael Rodriguez - MSL Orchestrator' LIMIT 1;
    END IF;

    RAISE NOTICE 'Created MSL Orchestrator persona: %', v_persona_id;

    -- ========================================================================
    -- MSL PERSONA 3: LEARNER
    -- Low AI Maturity (32) + Routine Work (28)
    -- ========================================================================
    
    INSERT INTO personas (
        name, 
        description, 
        role_id, 
        function_id, 
        department_id,
        tenant_id,
        created_at, 
        updated_at
    ) VALUES (
        'Dr. Emily Park - MSL Learner',
        'Early-Career Field Medical Professional. Medical Science Liaison with 2 years experience. LEARNER archetype - Low AI Maturity (32), Routine Work (28). Late majority adopter who needs guided AI assistance. Preferred service layer: ASK_EXPERT. VPANES: V5 P6 A4 N3 E5 S7.',
        v_role_id,
        v_function_id,
        v_department_id,
        v_tenant_id,
        NOW(), 
        NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_persona_id;

    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id FROM personas WHERE name = 'Dr. Emily Park - MSL Learner' LIMIT 1;
    END IF;

    RAISE NOTICE 'Created MSL Learner persona: %', v_persona_id;

    -- ========================================================================
    -- MSL PERSONA 4: SKEPTIC
    -- Low AI Maturity (28) + Strategic Work (78)
    -- ========================================================================
    
    INSERT INTO personas (
        name, 
        description, 
        role_id, 
        function_id, 
        department_id,
        tenant_id,
        created_at, 
        updated_at
    ) VALUES (
        'Dr. James Thompson - MSL Skeptic',
        'Compliance-Focused Medical Affairs Leader. Principal Medical Science Liaison with 18 years experience. SKEPTIC archetype - Low AI Maturity (28), Strategic Work (78). Traditionalist who requires human validation. Preferred service layer: ASK_EXPERT (Hybrid). VPANES: V6 P5 A3 N6 E4 S6.',
        v_role_id,
        v_function_id,
        v_department_id,
        v_tenant_id,
        NOW(), 
        NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_persona_id;

    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id FROM personas WHERE name = 'Dr. James Thompson - MSL Skeptic' LIMIT 1;
    END IF;

    RAISE NOTICE 'Created MSL Skeptic persona: %', v_persona_id;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'MSL PERSONAS DEPLOYMENT COMPLETE';
    RAISE NOTICE '4 personas created for Medical Science Liaison role';
    RAISE NOTICE '========================================';

END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
    p.id,
    p.name,
    p.description,
    r.role_name,
    f.department_name as function_name,
    d.department_name
FROM personas p
LEFT JOIN org_roles r ON p.role_id = r.id
LEFT JOIN org_functions f ON p.function_id = f.id
LEFT JOIN org_departments d ON p.department_id = d.id
WHERE p.name LIKE '%MSL%'
ORDER BY p.name;

