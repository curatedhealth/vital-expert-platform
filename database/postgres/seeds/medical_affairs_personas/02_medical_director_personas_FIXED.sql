-- ============================================================================
-- MEDICAL DIRECTOR - 4 MECE PERSONAS
-- FIXED VERSION - Matches actual database schema
-- Version: 1.1 | Date: 2025-11-27
-- ============================================================================

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
    
    -- Get Medical Affairs function
    SELECT id INTO v_function_id FROM org_functions WHERE department_name ILIKE '%medical%affairs%' LIMIT 1;
    
    -- Get Medical Affairs department  
    SELECT id INTO v_department_id FROM org_departments WHERE department_name ILIKE '%medical%affairs%' LIMIT 1;
    
    -- Get Medical Director role
    SELECT id INTO v_role_id FROM org_roles WHERE role_name ILIKE '%Medical Director%' LIMIT 1;

    RAISE NOTICE 'tenant_id: %, function_id: %, department_id: %, role_id: %', v_tenant_id, v_function_id, v_department_id, v_role_id;

    -- ========================================================================
    -- MEDICAL DIRECTOR PERSONA 1: AUTOMATOR
    -- ========================================================================
    
    INSERT INTO personas (
        name, description, role_id, function_id, department_id, tenant_id, created_at, updated_at
    ) VALUES (
        'Dr. Amanda Foster - Medical Director Automator',
        'Data-Driven Medical Strategy Leader. Medical Director, Oncology with 14 years experience. AUTOMATOR archetype - High AI Maturity (78), Mixed Work (45). Early adopter focused on streamlining team operations through intelligent automation. Preferred service layer: WORKFLOWS. Budget authority: $5M-$20M. Team size: 15-25. VPANES: V8 P7 A8 N6 E5 S8.',
        v_role_id, v_function_id, v_department_id, v_tenant_id, NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Created Medical Director Automator: %', v_persona_id;

    -- ========================================================================
    -- MEDICAL DIRECTOR PERSONA 2: ORCHESTRATOR
    -- ========================================================================
    
    INSERT INTO personas (
        name, description, role_id, function_id, department_id, tenant_id, created_at, updated_at
    ) VALUES (
        'Dr. Robert Martinez - Medical Director Orchestrator',
        'AI-Powered Strategic Medical Leader. Medical Director, Global Immunology with 16 years experience. ORCHESTRATOR archetype - High AI Maturity (85), Strategic Work (82). Innovator transforming Medical Affairs through AI-powered intelligence. Preferred service layer: SOLUTION_BUILDER. Budget authority: $10M-$50M. Team size: 25-40. VPANES: V9 P8 A9 N8 E7 S8.',
        v_role_id, v_function_id, v_department_id, v_tenant_id, NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Created Medical Director Orchestrator: %', v_persona_id;

    -- ========================================================================
    -- MEDICAL DIRECTOR PERSONA 3: LEARNER
    -- ========================================================================
    
    INSERT INTO personas (
        name, description, role_id, function_id, department_id, tenant_id, created_at, updated_at
    ) VALUES (
        'Dr. Jennifer Lee - Medical Director Learner',
        'Newly Promoted Medical Leader. Medical Director, Neurology with 10 years experience. LEARNER archetype - Low AI Maturity (35), Mixed Work (42). Late majority adopter focused on mastering leadership responsibilities. Preferred service layer: ASK_EXPERT. Budget authority: $2M-$10M. Team size: 8-12. VPANES: V5 P6 A4 N4 E5 S6.',
        v_role_id, v_function_id, v_department_id, v_tenant_id, NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Created Medical Director Learner: %', v_persona_id;

    -- ========================================================================
    -- MEDICAL DIRECTOR PERSONA 4: SKEPTIC
    -- ========================================================================
    
    INSERT INTO personas (
        name, description, role_id, function_id, department_id, tenant_id, created_at, updated_at
    ) VALUES (
        'Dr. William Chen - Medical Director Skeptic',
        'Compliance-First Medical Leader. Medical Director, Cardiovascular with 20 years experience. SKEPTIC archetype - Low AI Maturity (25), Strategic Work (80). Traditionalist ensuring human judgment in critical medical decisions. Preferred service layer: ASK_EXPERT (Hybrid). Budget authority: $10M-$30M. Team size: 20-35. VPANES: V5 P4 A2 N6 E3 S5.',
        v_role_id, v_function_id, v_department_id, v_tenant_id, NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_persona_id;

    RAISE NOTICE 'Created Medical Director Skeptic: %', v_persona_id;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'MEDICAL DIRECTOR PERSONAS DEPLOYMENT COMPLETE';
    RAISE NOTICE '4 personas created for Medical Director role';
    RAISE NOTICE '========================================';

END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
    p.id,
    p.name,
    LEFT(p.description, 80) as description_preview,
    r.role_name
FROM personas p
LEFT JOIN org_roles r ON p.role_id = r.id
WHERE p.name LIKE '%Medical Director%'
ORDER BY p.name;

