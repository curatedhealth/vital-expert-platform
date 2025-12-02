-- =====================================================================
-- DIGITAL HEALTH PERSONAS: Digital Health Strategy & Innovation
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
    RAISE NOTICE '=== CREATING PERSONAS FOR DIGITAL HEALTH STRATEGY & INNOVATION ===';
    
    FOR v_role IN 
        SELECT r.id, r.name, r.slug, r.seniority_level, r.department_id, d.name as dept_name
        FROM org_roles r
        JOIN org_departments d ON r.department_id = d.id
        JOIN org_functions f ON r.function_id = f.id
        WHERE f.name = 'Digital Health Strategy & Innovation'
          AND r.tenant_id = v_tenant_id
          AND (SELECT COUNT(*) FROM personas p WHERE p.source_role_id = r.id) < 4
        ORDER BY r.name
    LOOP
        v_counter := v_counter + 1;
        
        FOR i IN 1..4 LOOP
            CASE i
                WHEN 1 THEN v_archetype := 'AUTOMATOR'; v_ai_score := 0.82 + (random() * 0.12); v_complexity_score := 0.28 + (random() * 0.15); v_service_layer := 'L3_workflow'; v_persona_suffix := 'Innovation Automation Pioneer';
                WHEN 2 THEN v_archetype := 'ORCHESTRATOR'; v_ai_score := 0.80 + (random() * 0.15); v_complexity_score := 0.80 + (random() * 0.12); v_service_layer := 'L2_copilot'; v_persona_suffix := 'Strategic Innovation Leader';
                WHEN 3 THEN v_archetype := 'LEARNER'; v_ai_score := 0.30 + (random() * 0.15); v_complexity_score := 0.25 + (random() * 0.15); v_service_layer := 'L4_agent'; v_persona_suffix := 'Emerging Innovation Talent';
                WHEN 4 THEN v_archetype := 'SKEPTIC'; v_ai_score := 0.25 + (random() * 0.15); v_complexity_score := 0.75 + (random() * 0.15); v_service_layer := 'L1_chat'; v_persona_suffix := 'Strategic Risk Evaluator';
            END CASE;

            CASE v_role.seniority_level
                WHEN 'entry' THEN v_experience := 'Entry'; v_age := '22-28';
                WHEN 'mid' THEN v_experience := 'Mid'; v_age := '28-35';
                WHEN 'senior' THEN v_experience := 'Senior'; v_age := '35-45';
                WHEN 'director' THEN v_experience := 'Director'; v_age := '40-55';
                ELSE v_experience := 'Mid'; v_age := '30-40';
            END CASE;

            v_unique_id := 'P-DSI-' || lpad(v_counter::text, 3, '0') || '-' || substring(v_archetype, 1, 3);
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
                    WHEN 'AUTOMATOR' THEN 'Tech-savvy professional automating innovation processes and emerging tech evaluation.'
                    WHEN 'ORCHESTRATOR' THEN 'Strategic professional orchestrating digital transformation and innovation initiatives.'
                    WHEN 'LEARNER' THEN 'Developing professional building skills in digital health strategy and innovation.'
                    WHEN 'SKEPTIC' THEN 'Experienced professional evaluating innovation risks and strategic alignment.'
                END,
                TRUE, v_age, v_experience,
                CASE v_role.seniority_level WHEN 'entry' THEN 'BS Business/Technology' WHEN 'mid' THEN 'MBA or MS Innovation' WHEN 'senior' THEN 'MBA with strategy focus' WHEN 'director' THEN 'MBA/PhD 15+ years exp' ELSE 'BS/MS relevant field' END,
                v_role.dept_name, 'Digital Health Strategy & Innovation', 'global',
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Automate trend analysis", "Streamline innovation pipeline", "Build evaluation frameworks"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Lead digital transformation", "Drive innovation strategy", "Build partnerships"]'::jsonb
                    WHEN 'LEARNER' THEN '["Learn emerging technologies", "Build strategic thinking", "Support innovation projects"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["Validate innovation ROI", "Assess strategic fit", "Manage innovation risks"]'::jsonb
                END,
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Information overload", "Rapid tech changes", "Evaluation complexity"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Stakeholder alignment", "Resource constraints", "Market uncertainty"]'::jsonb
                    WHEN 'LEARNER' THEN '["Fast-moving landscape", "Strategic complexity", "Limited exposure"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["Hype vs reality", "ROI uncertainty", "Integration challenges"]'::jsonb
                END,
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Efficiency in evaluation", "Technology leadership", "Innovation impact"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Strategic transformation", "Industry leadership", "Long-term impact"]'::jsonb
                    WHEN 'LEARNER' THEN '["Career growth", "Innovation expertise", "Strategic contribution"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["Sound investments", "Risk mitigation", "Strategic alignment"]'::jsonb
                END,
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Manual research", "Slow evaluations", "Disconnected data"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Siloed initiatives", "Short-term focus", "Resource competition"]'::jsonb
                    WHEN 'LEARNER' THEN '["Information overload", "Unclear priorities", "Limited mentorship"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["Overhyped technologies", "Unclear ROI", "Rushed decisions"]'::jsonb
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

SELECT 'Digital Health Strategy & Innovation Personas' as report, COUNT(DISTINCT r.id) as total_roles, COUNT(p.id) as total_personas, ROUND(COUNT(p.id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0), 1) as avg_personas_per_role
FROM org_roles r JOIN org_functions f ON r.function_id = f.id LEFT JOIN personas p ON p.source_role_id = r.id
WHERE f.name = 'Digital Health Strategy & Innovation' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';


