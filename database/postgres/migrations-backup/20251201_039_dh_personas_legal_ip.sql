-- =====================================================================
-- DIGITAL HEALTH PERSONAS: Legal & IP for Digital
-- Creates 4 MECE personas for each role in this function
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
    v_counter INTEGER := 0;
    v_persona_name TEXT;
    v_first_names TEXT[] := ARRAY['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Drew', 'Avery', 'Quinn', 'Skyler', 'Reese', 'Dakota', 'Hayden', 'Finley', 'Cameron', 'Parker', 'Blake', 'Sage', 'Rowan', 'Emery', 'Phoenix', 'River', 'Eden', 'Shiloh', 'Kai', 'Ari', 'Jesse', 'Charlie', 'Sam', 'Max', 'Robin', 'Lee', 'Kim', 'Pat', 'Chris', 'Jo', 'Val', 'Nico', 'Ash'];
    v_last_names TEXT[] := ARRAY['Chen', 'Rivera', 'Kim', 'Walsh', 'Martinez', 'Thompson', 'Lee', 'Parker', 'Johnson', 'Davis', 'Brown', 'Miller', 'Wilson', 'Garcia', 'Adams', 'Scott', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Lopez', 'Hill', 'Green', 'Baker', 'Hall', 'Nelson', 'Carter', 'Mitchell'];
BEGIN
    RAISE NOTICE '=== CREATING PERSONAS FOR LEGAL & IP FOR DIGITAL ===';
    
    FOR v_role IN 
        SELECT r.id, r.name, r.slug, r.seniority_level, r.department_id, d.name as dept_name
        FROM org_roles r
        JOIN org_departments d ON r.department_id = d.id
        JOIN org_functions f ON r.function_id = f.id
        WHERE f.name = 'Legal & IP for Digital'
          AND r.tenant_id = v_tenant_id
          AND (SELECT COUNT(*) FROM personas p WHERE p.source_role_id = r.id) < 4
        ORDER BY r.name
    LOOP
        v_counter := v_counter + 1;
        
        FOR i IN 1..4 LOOP
            CASE i
                WHEN 1 THEN v_archetype := 'AUTOMATOR'; v_ai_score := 0.70 + (random() * 0.15); v_complexity_score := 0.35 + (random() * 0.15); v_service_layer := 'L3_workflow'; v_persona_suffix := 'Legal Tech Automation Expert';
                WHEN 2 THEN v_archetype := 'ORCHESTRATOR'; v_ai_score := 0.72 + (random() * 0.15); v_complexity_score := 0.78 + (random() * 0.12); v_service_layer := 'L2_copilot'; v_persona_suffix := 'IP Strategy Leader';
                WHEN 3 THEN v_archetype := 'LEARNER'; v_ai_score := 0.28 + (random() * 0.15); v_complexity_score := 0.30 + (random() * 0.15); v_service_layer := 'L4_agent'; v_persona_suffix := 'Emerging Legal Professional';
                WHEN 4 THEN v_archetype := 'SKEPTIC'; v_ai_score := 0.22 + (random() * 0.15); v_complexity_score := 0.82 + (random() * 0.12); v_service_layer := 'L1_chat'; v_persona_suffix := 'Risk-Focused Legal Expert';
            END CASE;

            CASE v_role.seniority_level
                WHEN 'entry' THEN v_experience := 'Entry'; v_age := '24-30';
                WHEN 'mid' THEN v_experience := 'Mid'; v_age := '30-38';
                WHEN 'senior' THEN v_experience := 'Senior'; v_age := '38-48';
                WHEN 'director' THEN v_experience := 'Director'; v_age := '45-58';
                ELSE v_experience := 'Mid'; v_age := '32-42';
            END CASE;

            v_unique_id := 'P-LIP-' || lpad(v_counter::text, 3, '0') || '-' || substring(v_archetype, 1, 3);
            v_persona_name := v_first_names[((v_counter * 4 + i - 1) % 40) + 1] || ' ' || v_last_names[((v_counter * 4 + i - 1) % 40) + 1];

            INSERT INTO personas (
                unique_id, persona_name, persona_type, source_role_id, title, description, is_active,
                age_range, experience_level, education_level, department, function_area, geographic_scope,
                goals, challenges, motivations, frustrations, data_quality_score,
                ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer,
                tenant_id, created_by, created_at, updated_at
            ) VALUES (
                v_unique_id, v_persona_name, 'MECE-Role-based', v_role.id,
                v_role.name || ' - ' || v_persona_suffix,
                v_archetype || ' persona for ' || v_role.name || ': ' ||
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN 'Tech-savvy legal professional automating contract review and IP management.'
                    WHEN 'ORCHESTRATOR' THEN 'Strategic legal professional orchestrating IP strategy and corporate governance.'
                    WHEN 'LEARNER' THEN 'Developing legal professional building expertise in digital health law and IP.'
                    WHEN 'SKEPTIC' THEN 'Experienced legal professional ensuring rigorous risk assessment and compliance.'
                END,
                TRUE, v_age, v_experience,
                CASE v_role.seniority_level WHEN 'entry' THEN 'JD or LLM' WHEN 'mid' THEN 'JD with IP focus' WHEN 'senior' THEN 'JD/LLM 10+ years exp' WHEN 'director' THEN 'JD/LLM 15+ years exp' ELSE 'JD or relevant degree' END,
                v_role.dept_name, 'Legal & IP for Digital', 'global',
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Automate contract review", "Streamline IP filings", "Build legal workflows"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Lead IP strategy", "Coordinate M&A legal", "Drive governance frameworks"]'::jsonb
                    WHEN 'LEARNER' THEN '["Learn digital health law", "Build IP knowledge", "Support legal operations"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["Ensure legal compliance", "Validate AI contracts", "Manage IP risks"]'::jsonb
                END,
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Complex contract language", "Manual review burden", "Version control"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Multi-jurisdictional complexity", "Stakeholder coordination", "Resource limits"]'::jsonb
                    WHEN 'LEARNER' THEN '["Evolving regulations", "Complex IP landscape", "Limited mentorship"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["AI accuracy concerns", "Liability risks", "Regulatory uncertainty"]'::jsonb
                END,
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Efficiency gains", "Technology adoption", "Process improvement"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Strategic impact", "IP portfolio value", "Corporate protection"]'::jsonb
                    WHEN 'LEARNER' THEN '["Career development", "Legal expertise", "Professional growth"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["Risk mitigation", "Legal accuracy", "Client protection"]'::jsonb
                END,
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Manual processes", "Slow reviews", "Disconnected systems"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Siloed legal teams", "Unclear priorities", "Budget constraints"]'::jsonb
                    WHEN 'LEARNER' THEN '["Information overload", "Complex terminology", "Limited training"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["AI overreliance", "Quality shortcuts", "Liability concerns"]'::jsonb
                END,
                0.85, ROUND(v_ai_score::numeric, 2), ROUND(v_complexity_score::numeric, 2),
                v_archetype, v_service_layer, v_tenant_id, 'MECE Persona Generator', NOW(), NOW()
            )
            ON CONFLICT (unique_id) DO UPDATE SET
                persona_name = EXCLUDED.persona_name, description = EXCLUDED.description,
                goals = EXCLUDED.goals, challenges = EXCLUDED.challenges,
                motivations = EXCLUDED.motivations, frustrations = EXCLUDED.frustrations,
                ai_readiness_score = EXCLUDED.ai_readiness_score, work_complexity_score = EXCLUDED.work_complexity_score,
                derived_archetype = EXCLUDED.derived_archetype, preferred_service_layer = EXCLUDED.preferred_service_layer,
                updated_at = NOW();
            
            v_persona_count := v_persona_count + 1;
        END LOOP;
        RAISE NOTICE '✅ Created 4 personas for: %', v_role.name;
    END LOOP;
    
    RAISE NOTICE 'Total personas created: %', v_persona_count;
END $$;

COMMIT;

SELECT 'Legal & IP for Digital Personas' as report, COUNT(DISTINCT r.id) as total_roles, COUNT(p.id) as total_personas, ROUND(COUNT(p.id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0), 1) as avg_personas_per_role
FROM org_roles r JOIN org_functions f ON r.function_id = f.id LEFT JOIN personas p ON p.source_role_id = r.id
WHERE f.name = 'Legal & IP for Digital' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';


