-- =====================================================================
-- DIGITAL HEALTH PERSONAS: Digital Platforms & Solutions
-- Creates 4 MECE personas for each role in this function
-- =====================================================================
-- Tenant: c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244 (VITAL System)
-- Function: Digital Platforms & Solutions
-- =====================================================================

BEGIN;

DO $$
DECLARE
    v_tenant_id uuid := 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';
    v_role RECORD;
    v_persona_count INTEGER := 0;
    v_archetype TEXT;
    v_ai_score NUMERIC;
    v_complexity_score NUMERIC;
    v_service_layer TEXT;
    v_persona_suffix TEXT;
    v_experience TEXT;
    v_age TEXT;
    v_unique_id TEXT;
    v_role_abbrev TEXT;
    v_counter INTEGER := 0;
    v_persona_name TEXT;
    v_first_names TEXT[] := ARRAY['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Drew', 'Avery', 'Quinn', 'Skyler', 'Reese', 'Dakota', 'Hayden', 'Finley', 'Cameron', 'Parker', 'Blake', 'Sage', 'Rowan', 'Emery', 'Phoenix', 'River', 'Eden', 'Shiloh', 'Kai', 'Ari', 'Jesse', 'Charlie', 'Sam', 'Max', 'Robin', 'Lee', 'Kim', 'Pat', 'Chris', 'Jo', 'Val', 'Nico', 'Ash'];
    v_last_names TEXT[] := ARRAY['Chen', 'Rivera', 'Kim', 'Walsh', 'Martinez', 'Thompson', 'Lee', 'Parker', 'Johnson', 'Davis', 'Brown', 'Miller', 'Wilson', 'Garcia', 'Adams', 'Scott', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Lopez', 'Hill', 'Green', 'Baker', 'Hall', 'Nelson', 'Carter', 'Mitchell'];
BEGIN
    RAISE NOTICE '=== CREATING PERSONAS FOR DIGITAL PLATFORMS & SOLUTIONS ===';
    
    -- Loop through all roles in Digital Platforms & Solutions that don't have 4 personas
    FOR v_role IN 
        SELECT r.id, r.name, r.slug, r.seniority_level, r.department_id, d.name as dept_name
        FROM org_roles r
        JOIN org_departments d ON r.department_id = d.id
        JOIN org_functions f ON r.function_id = f.id
        WHERE f.name = 'Digital Platforms & Solutions'
          AND r.tenant_id = v_tenant_id
          AND (SELECT COUNT(*) FROM personas p WHERE p.source_role_id = r.id) < 4
        ORDER BY r.name
    LOOP
        v_counter := v_counter + 1;
        
        -- Create abbreviated role code (max 10 chars)
        v_role_abbrev := upper(substring(regexp_replace(v_role.slug, '[^a-zA-Z]', '', 'g'), 1, 8));
        
        -- Create 4 MECE personas for each role
        FOR i IN 1..4 LOOP
            -- Set archetype-specific attributes
            CASE i
                WHEN 1 THEN -- AUTOMATOR
                    v_archetype := 'AUTOMATOR';
                    v_ai_score := 0.75 + (random() * 0.15);
                    v_complexity_score := 0.25 + (random() * 0.15);
                    v_service_layer := 'L3_workflow';
                    v_persona_suffix := 'Automation Champion';
                WHEN 2 THEN -- ORCHESTRATOR
                    v_archetype := 'ORCHESTRATOR';
                    v_ai_score := 0.75 + (random() * 0.15);
                    v_complexity_score := 0.75 + (random() * 0.15);
                    v_service_layer := 'L2_copilot';
                    v_persona_suffix := 'Strategic Orchestrator';
                WHEN 3 THEN -- LEARNER
                    v_archetype := 'LEARNER';
                    v_ai_score := 0.25 + (random() * 0.15);
                    v_complexity_score := 0.25 + (random() * 0.15);
                    v_service_layer := 'L4_agent';
                    v_persona_suffix := 'Growth-Focused Learner';
                WHEN 4 THEN -- SKEPTIC
                    v_archetype := 'SKEPTIC';
                    v_ai_score := 0.25 + (random() * 0.15);
                    v_complexity_score := 0.75 + (random() * 0.15);
                    v_service_layer := 'L1_chat';
                    v_persona_suffix := 'Evidence-Driven Expert';
            END CASE;

            -- Set seniority-based attributes
            CASE v_role.seniority_level
                WHEN 'entry' THEN v_experience := 'Entry'; v_age := '22-28';
                WHEN 'mid' THEN v_experience := 'Mid'; v_age := '28-35';
                WHEN 'senior' THEN v_experience := 'Senior'; v_age := '35-45';
                WHEN 'director' THEN v_experience := 'Director'; v_age := '40-55';
                ELSE v_experience := 'Mid'; v_age := '30-40';
            END CASE;

            -- Generate short unique_id (format: P-DPS-XXX-ARC where XXX is counter)
            v_unique_id := 'P-DPS-' || lpad(v_counter::text, 3, '0') || '-' || substring(v_archetype, 1, 3);
            
            -- Generate persona name
            v_persona_name := v_first_names[((v_counter * 4 + i - 1) % 40) + 1] || ' ' || v_last_names[((v_counter * 4 + i - 1) % 40) + 1];

            -- Insert persona
            INSERT INTO personas (
                unique_id, persona_name, persona_type, source_role_id, title, description, is_active,
                age_range, experience_level, education_level, department, function_area, geographic_scope,
                goals, challenges, motivations, frustrations, data_quality_score,
                ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer,
                tenant_id, created_by, created_at, updated_at
            ) VALUES (
                v_unique_id,
                v_persona_name,
                'MECE-Role-based',
                v_role.id,
                v_role.name || ' - ' || v_persona_suffix,
                v_archetype || ' persona for ' || v_role.name || ': ' ||
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN 'Tech-savvy professional who leverages AI to automate repetitive tasks and accelerate workflows.'
                    WHEN 'ORCHESTRATOR' THEN 'Strategic professional who orchestrates complex initiatives and AI-driven transformations.'
                    WHEN 'LEARNER' THEN 'Developing professional building foundational skills in digital health technologies.'
                    WHEN 'SKEPTIC' THEN 'Experienced professional who applies deep expertise with careful evaluation of AI capabilities.'
                END,
                TRUE,
                v_age,
                v_experience,
                CASE v_role.seniority_level
                    WHEN 'entry' THEN 'BS in Health Informatics'
                    WHEN 'mid' THEN 'BS/MS Health Informatics'
                    WHEN 'senior' THEN 'MS/MBA Digital Health'
                    WHEN 'director' THEN 'MBA with 10+ years exp'
                    ELSE 'BS/MS relevant field'
                END,
                v_role.dept_name,
                'Digital Platforms & Solutions',
                'regional',
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Automate routine tasks", "Reduce manual work by 60%", "Build scalable workflows"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Lead cross-functional initiatives", "Drive platform adoption", "Optimize patient journeys"]'::jsonb
                    WHEN 'LEARNER' THEN '["Master platform capabilities", "Build technical skills", "Contribute to team success"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["Ensure platform reliability", "Validate AI recommendations", "Maintain quality standards"]'::jsonb
                END,
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Legacy integrations", "Manual reconciliation", "Repetitive tasks"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Cross-team coordination", "Stakeholder alignment", "Resource constraints"]'::jsonb
                    WHEN 'LEARNER' THEN '["Steep learning curve", "Technology changes", "Limited mentorship"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["Unproven AI accuracy", "Compliance concerns", "Data quality issues"]'::jsonb
                END,
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Efficiency gains", "Technology innovation", "Career advancement"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Strategic impact", "Leadership recognition", "Organizational transformation"]'::jsonb
                    WHEN 'LEARNER' THEN '["Professional growth", "Skill development", "Meaningful work"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["Patient safety", "Quality standards", "Evidence-based decisions"]'::jsonb
                END,
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Manual workarounds", "Slow approvals", "Outdated tools"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Siloed teams", "Unclear ownership", "Competing priorities"]'::jsonb
                    WHEN 'LEARNER' THEN '["Information overload", "Lack of documentation", "Limited training"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["Overpromised AI", "Lack of validation", "Rushed implementations"]'::jsonb
                END,
                0.85,
                ROUND(v_ai_score::numeric, 2),
                ROUND(v_complexity_score::numeric, 2),
                v_archetype,
                v_service_layer,
                v_tenant_id,
                'MECE Persona Generator',
                NOW(),
                NOW()
            )
            ON CONFLICT (unique_id) DO UPDATE SET
                persona_name = EXCLUDED.persona_name,
                description = EXCLUDED.description,
                goals = EXCLUDED.goals,
                challenges = EXCLUDED.challenges,
                motivations = EXCLUDED.motivations,
                frustrations = EXCLUDED.frustrations,
                ai_readiness_score = EXCLUDED.ai_readiness_score,
                work_complexity_score = EXCLUDED.work_complexity_score,
                derived_archetype = EXCLUDED.derived_archetype,
                preferred_service_layer = EXCLUDED.preferred_service_layer,
                updated_at = NOW();
            
            v_persona_count := v_persona_count + 1;
        END LOOP;
        
        RAISE NOTICE '✅ Created 4 personas for: %', v_role.name;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Total personas created: %', v_persona_count;
END $$;

COMMIT;

-- Verification
SELECT 
    'Digital Platforms & Solutions Personas' as report,
    COUNT(DISTINCT r.id) as total_roles,
    COUNT(p.id) as total_personas,
    ROUND(COUNT(p.id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0), 1) as avg_personas_per_role
FROM org_roles r
JOIN org_functions f ON r.function_id = f.id
LEFT JOIN personas p ON p.source_role_id = r.id
WHERE f.name = 'Digital Platforms & Solutions'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';
