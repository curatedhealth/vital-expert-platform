-- =====================================================================
-- DIGITAL HEALTH PERSONAS: Data Science & Analytics (remaining roles)
-- Creates 4 MECE personas for each role in this function that doesn't have personas
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
    RAISE NOTICE '=== CREATING PERSONAS FOR DATA SCIENCE & ANALYTICS ===';
    
    FOR v_role IN 
        SELECT r.id, r.name, r.slug, r.seniority_level, r.department_id, d.name as dept_name
        FROM org_roles r
        JOIN org_departments d ON r.department_id = d.id
        JOIN org_functions f ON r.function_id = f.id
        WHERE f.name = 'Data Science & Analytics'
          AND r.tenant_id = v_tenant_id
          AND (SELECT COUNT(*) FROM personas p WHERE p.source_role_id = r.id) < 4
        ORDER BY r.name
    LOOP
        v_counter := v_counter + 1;
        
        FOR i IN 1..4 LOOP
            CASE i
                WHEN 1 THEN v_archetype := 'AUTOMATOR'; v_ai_score := 0.85 + (random() * 0.10); v_complexity_score := 0.30 + (random() * 0.15); v_service_layer := 'L3_workflow'; v_persona_suffix := 'ML Pipeline Automator';
                WHEN 2 THEN v_archetype := 'ORCHESTRATOR'; v_ai_score := 0.82 + (random() * 0.12); v_complexity_score := 0.80 + (random() * 0.12); v_service_layer := 'L2_copilot'; v_persona_suffix := 'Data Strategy Architect';
                WHEN 3 THEN v_archetype := 'LEARNER'; v_ai_score := 0.35 + (random() * 0.15); v_complexity_score := 0.28 + (random() * 0.15); v_service_layer := 'L4_agent'; v_persona_suffix := 'Emerging Data Scientist';
                WHEN 4 THEN v_archetype := 'SKEPTIC'; v_ai_score := 0.28 + (random() * 0.15); v_complexity_score := 0.80 + (random() * 0.12); v_service_layer := 'L1_chat'; v_persona_suffix := 'Model Validation Expert';
            END CASE;

            CASE v_role.seniority_level
                WHEN 'entry' THEN v_experience := 'Entry'; v_age := '22-28';
                WHEN 'mid' THEN v_experience := 'Mid'; v_age := '28-35';
                WHEN 'senior' THEN v_experience := 'Senior'; v_age := '35-45';
                WHEN 'director' THEN v_experience := 'Director'; v_age := '40-55';
                ELSE v_experience := 'Mid'; v_age := '30-40';
            END CASE;

            v_unique_id := 'P-DSA-' || lpad(v_counter::text, 3, '0') || '-' || substring(v_archetype, 1, 3);
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
                    WHEN 'AUTOMATOR' THEN 'Tech-savvy data professional automating ML pipelines and analytics workflows.'
                    WHEN 'ORCHESTRATOR' THEN 'Strategic data professional orchestrating enterprise analytics and AI initiatives.'
                    WHEN 'LEARNER' THEN 'Developing data professional building skills in ML, analytics, and health data.'
                    WHEN 'SKEPTIC' THEN 'Experienced data professional ensuring model validation and data quality.'
                END,
                TRUE, v_age, v_experience,
                CASE v_role.seniority_level WHEN 'entry' THEN 'BS Data Science/Stats' WHEN 'mid' THEN 'MS Data Science/ML' WHEN 'senior' THEN 'MS/PhD Data Science' WHEN 'director' THEN 'PhD/MS 12+ years exp' ELSE 'BS/MS relevant field' END,
                v_role.dept_name, 'Data Science & Analytics', 'regional',
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Automate ML pipelines", "Build feature engineering workflows", "Scale model deployment"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Lead analytics strategy", "Drive AI adoption", "Build data platforms"]'::jsonb
                    WHEN 'LEARNER' THEN '["Learn ML techniques", "Build data skills", "Contribute to analytics projects"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["Validate model performance", "Ensure data quality", "Maintain reproducibility"]'::jsonb
                END,
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Data pipeline complexity", "Infrastructure constraints", "Model versioning"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Data silos", "Stakeholder alignment", "Resource constraints"]'::jsonb
                    WHEN 'LEARNER' THEN '["Rapid tech evolution", "Complex algorithms", "Limited mentorship"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["Model bias concerns", "Data quality issues", "Explainability requirements"]'::jsonb
                END,
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Technical excellence", "Automation impact", "Innovation leadership"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Strategic impact", "Data-driven culture", "Organizational transformation"]'::jsonb
                    WHEN 'LEARNER' THEN '["Skill development", "Career growth", "Contributing to insights"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["Model accuracy", "Scientific rigor", "Trustworthy AI"]'::jsonb
                END,
                CASE v_archetype
                    WHEN 'AUTOMATOR' THEN '["Manual data prep", "Slow deployments", "Legacy systems"]'::jsonb
                    WHEN 'ORCHESTRATOR' THEN '["Siloed data", "Unclear ownership", "Budget constraints"]'::jsonb
                    WHEN 'LEARNER' THEN '["Information overload", "Complex tools", "Limited training"]'::jsonb
                    WHEN 'SKEPTIC' THEN '["Black-box models", "Quality shortcuts", "Rushed deployments"]'::jsonb
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

SELECT 'Data Science & Analytics Personas' as report, COUNT(DISTINCT r.id) as total_roles, COUNT(p.id) as total_personas, ROUND(COUNT(p.id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0), 1) as avg_personas_per_role
FROM org_roles r JOIN org_functions f ON r.function_id = f.id LEFT JOIN personas p ON p.source_role_id = r.id
WHERE f.name = 'Data Science & Analytics' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';


