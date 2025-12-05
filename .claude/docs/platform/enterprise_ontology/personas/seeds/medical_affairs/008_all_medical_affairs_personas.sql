-- =====================================================================
-- MEDICAL AFFAIRS DEPARTMENT - ALL PERSONAS (MECE FRAMEWORK)
-- =====================================================================
-- Version: 3.0.0
-- Created: 2025-11-27
-- Framework: MECE Archetype (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)
-- Total: 24 personas (6 roles × 4 archetypes each)
-- =====================================================================
--
-- ROLES COVERED:
-- 1. Medical Science Liaison (MSL)
-- 2. Senior MSL
-- 3. MSL Manager
-- 4. Medical Information Specialist
-- 5. Medical Director
-- 6. VP Medical Affairs
--
-- ARCHETYPES PER ROLE (MECE 2×2):
--                        AI MATURITY
--                   LOW ◄──────────► HIGH
--                    │                 │
--   ROUTINE    ┌─────┴─────────────────┴─────┐
--   WORK       │  LEARNER    │   AUTOMATOR   │
--   (Low)      │  Beginner   │   Power User  │
--              ├─────────────┼───────────────┤
--   STRATEGIC  │  SKEPTIC    │  ORCHESTRATOR │
--   WORK       │Traditionalist│   Visionary   │
--   (High)     └─────────────┴───────────────┘
--
-- =====================================================================

-- =====================================================================
-- PREREQUISITE: Drop and recreate junction tables with correct schema
-- =====================================================================

-- Pain Points
DROP TABLE IF EXISTS persona_pain_points CASCADE;
CREATE TABLE persona_pain_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    pain_point TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    frequency TEXT CHECK (frequency IN ('rarely', 'sometimes', 'often', 'always')),
    category TEXT,
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals
DROP TABLE IF EXISTS persona_goals CASCADE;
CREATE TABLE persona_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    goal_text TEXT NOT NULL,
    goal_type TEXT CHECK (goal_type IN ('professional', 'personal', 'organizational', 'career')),
    timeframe TEXT CHECK (timeframe IN ('short_term', 'medium_term', 'long_term')),
    priority INTEGER DEFAULT 0,
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Motivations
DROP TABLE IF EXISTS persona_motivations CASCADE;
CREATE TABLE persona_motivations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    motivation TEXT NOT NULL,
    category TEXT,
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Typical Day
DROP TABLE IF EXISTS persona_typical_day CASCADE;
CREATE TABLE persona_typical_day (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    time_block TEXT,
    activity TEXT NOT NULL,
    duration_minutes INTEGER,
    category TEXT,
    ai_assisted BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VPANES Scoring
DROP TABLE IF EXISTS persona_vpanes_scoring CASCADE;
CREATE TABLE persona_vpanes_scoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    visibility_score INTEGER CHECK (visibility_score BETWEEN 0 AND 10),
    pain_score INTEGER CHECK (pain_score BETWEEN 0 AND 10),
    actions_score INTEGER CHECK (actions_score BETWEEN 0 AND 10),
    needs_score INTEGER CHECK (needs_score BETWEEN 0 AND 10),
    emotions_score INTEGER CHECK (emotions_score BETWEEN 0 AND 10),
    scenarios_score INTEGER CHECK (scenarios_score BETWEEN 0 AND 10),
    total_score INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_persona_pain_points_persona ON persona_pain_points(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_goals_persona ON persona_goals(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_motivations_persona ON persona_motivations(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_typical_day_persona ON persona_typical_day(persona_id);

-- =====================================================================
-- ROLE 1: MEDICAL SCIENCE LIAISON (MSL) - 4 ARCHETYPES
-- =====================================================================

DO $$
DECLARE
    v_role_id UUID;
    v_automator_id UUID;
    v_orchestrator_id UUID;
    v_learner_id UUID;
    v_skeptic_id UUID;
BEGIN
    -- Get role ID
    SELECT id INTO v_role_id FROM org_roles
    WHERE name ILIKE '%Medical Science Liaison%' AND name NOT ILIKE '%Senior%' AND name NOT ILIKE '%Manager%'
    LIMIT 1;

    IF v_role_id IS NULL THEN
        RAISE NOTICE 'MSL role not found - skipping';
        RETURN;
    END IF;

    -- Delete existing personas for this role (idempotent)
    DELETE FROM personas WHERE source_role_id = v_role_id;

    -- ============================================================
    -- MSL AUTOMATOR (High AI + Routine Work)
    -- "Power User" - Seeks efficiency
    -- ============================================================
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MSL-AUTOMATOR',
        'Dr. Alex Chen - MSL Automator',
        'AUTOMATOR',
        v_role_id,
        'Medical Science Liaison',
        'A tech-savvy MSL who maximizes efficiency through automation. Uses AI tools to streamline CRM documentation, literature reviews, and meeting prep. Focuses on eliminating repetitive tasks to spend more time on high-value KOL interactions.',
        '32-40',
        'Senior Individual Contributor',
        'PharmD with 5+ years MSL experience',
        'Field Medical',
        'Medical Affairs',
        'regional',
        '["Automate 80% of routine documentation", "Reduce admin time by 50%", "Scale KOL engagement without adding hours", "Build reusable templates for all interactions"]'::jsonb,
        '["Manual CRM data entry", "Repetitive meeting prep", "Time spent on routine reports", "Inconsistent processes across team"]'::jsonb,
        '["Efficiency gains", "More time for science", "Being seen as innovative", "Helping team adopt better tools"]'::jsonb,
        '["Outdated systems that dont integrate", "Colleagues who resist new tools", "IT approval bottlenecks"]'::jsonb,
        '[{"activity": "KOL meetings", "percent": 45}, {"activity": "Automated workflows", "percent": 20}, {"activity": "Travel", "percent": 15}, {"activity": "Tool optimization", "percent": 10}, {"activity": "Team training", "percent": 10}]'::jsonb,
        '[{"tool": "Veeva CRM", "proficiency": "Expert"}, {"tool": "AI Writing Tools", "proficiency": "Advanced"}, {"tool": "Automation Platforms", "proficiency": "Advanced"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'If I do something more than twice, I automate it.',
            'I built a workflow that saves me 5 hours a week on meeting prep.',
            'The best part of AI tools is getting my evenings back.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Oncology', 'Immunology'],
        true, 0.92, 'Data Agent Team'
    ) RETURNING id INTO v_automator_id;

    -- Automator pain points
    INSERT INTO persona_pain_points (persona_id, pain_point, severity, frequency, category, sequence_order) VALUES
        (v_automator_id, 'Manual CRM documentation after every KOL meeting', 'high', 'always', 'process', 1),
        (v_automator_id, 'Repetitive literature search for similar questions', 'high', 'often', 'process', 2),
        (v_automator_id, 'Inconsistent meeting prep templates across team', 'medium', 'often', 'tool', 3),
        (v_automator_id, 'Time spent reformatting data for different reports', 'medium', 'always', 'process', 4);

    -- Automator goals
    INSERT INTO persona_goals (persona_id, goal_text, goal_type, timeframe, priority, sequence_order) VALUES
        (v_automator_id, 'Automate 80% of CRM documentation', 'professional', 'short_term', 1, 1),
        (v_automator_id, 'Create reusable AI-powered meeting prep system', 'professional', 'medium_term', 2, 2),
        (v_automator_id, 'Train 5 colleagues on automation tools', 'organizational', 'medium_term', 3, 3);

    -- Automator VPANES
    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_automator_id, 8, 7, 8, 5, 6, 9, 43, 'High priority - actively seeking automation solutions');

    -- ============================================================
    -- MSL ORCHESTRATOR (High AI + Strategic Work)
    -- "Visionary" - Drives innovation
    -- ============================================================
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MSL-ORCHESTRATOR',
        'Dr. Maya Patel - MSL Orchestrator',
        'ORCHESTRATOR',
        v_role_id,
        'Medical Science Liaison',
        'A strategic MSL who uses AI to synthesize insights across multiple data sources. Leverages AI panels to analyze KOL networks, competitive intelligence, and emerging research. Drives innovation in how the team approaches medical engagement.',
        '35-45',
        'Senior Individual Contributor',
        'MD/PhD with 7+ years MSL experience',
        'Field Medical',
        'Medical Affairs',
        'global',
        '["Synthesize insights across 50+ data sources", "Identify emerging KOL opportunities before competitors", "Drive strategic territory planning with AI", "Pioneer new engagement models"]'::jsonb,
        '["Information overload from multiple sources", "Seeing patterns others miss", "Translating insights into action", "Getting buy-in for new approaches"]'::jsonb,
        '["Strategic impact", "Being ahead of the curve", "Transforming how MSLs work", "Recognition as thought leader"]'::jsonb,
        '["Siloed data systems", "Slow organizational change", "Being constrained by legacy processes"]'::jsonb,
        '[{"activity": "Strategic KOL analysis", "percent": 30}, {"activity": "AI-powered synthesis", "percent": 25}, {"activity": "High-value KOL meetings", "percent": 25}, {"activity": "Innovation initiatives", "percent": 15}, {"activity": "Mentoring", "percent": 5}]'::jsonb,
        '[{"tool": "AI Analysis Panels", "proficiency": "Expert"}, {"tool": "KOL Mapping Tools", "proficiency": "Expert"}, {"tool": "Competitive Intelligence", "proficiency": "Advanced"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'I need to see the full picture across multiple dimensions.',
            'AI lets me connect dots that would take months to find manually.',
            'The future of MSL work is strategic synthesis, not just relationship management.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Oncology', 'Rare Diseases'],
        true, 0.95, 'Data Agent Team'
    ) RETURNING id INTO v_orchestrator_id;

    -- Orchestrator pain points
    INSERT INTO persona_pain_points (persona_id, pain_point, severity, frequency, category, sequence_order) VALUES
        (v_orchestrator_id, 'Cannot synthesize 50+ sources fast enough for decisions', 'critical', 'always', 'process', 1),
        (v_orchestrator_id, 'Missing emerging trends due to information overload', 'high', 'often', 'process', 2),
        (v_orchestrator_id, 'Siloed data prevents holistic KOL understanding', 'high', 'always', 'tool', 3),
        (v_orchestrator_id, 'Colleagues dont see the strategic patterns I see', 'medium', 'often', 'organizational', 4);

    -- Orchestrator goals
    INSERT INTO persona_goals (persona_id, goal_text, goal_type, timeframe, priority, sequence_order) VALUES
        (v_orchestrator_id, 'Build AI-powered KOL intelligence system', 'professional', 'medium_term', 1, 1),
        (v_orchestrator_id, 'Identify 3 emerging KOL opportunities before competitors', 'professional', 'short_term', 2, 2),
        (v_orchestrator_id, 'Transform team approach to strategic engagement', 'organizational', 'long_term', 3, 3);

    -- Orchestrator VPANES
    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_orchestrator_id, 9, 8, 9, 8, 7, 8, 49, 'Ideal persona - highest priority for advanced AI services');

    -- ============================================================
    -- MSL LEARNER (Low AI + Routine Work)
    -- "Beginner" - Needs guidance
    -- ============================================================
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MSL-LEARNER',
        'Dr. James Wilson - MSL Learner',
        'LEARNER',
        v_role_id,
        'Medical Science Liaison',
        'A newer MSL transitioning from clinical practice who wants to learn AI tools but feels overwhelmed. Prefers guided experiences with clear instructions. Needs confidence-building through small wins before tackling complex AI features.',
        '28-35',
        'Entry Level',
        'PharmD with 2 years clinical residency',
        'Field Medical',
        'Medical Affairs',
        'regional',
        '["Build confidence with AI tools", "Learn one feature at a time", "Not make mistakes that affect KOL relationships", "Eventually help others learn"]'::jsonb,
        '["Overwhelmed by complex AI interfaces", "Fear of making errors", "Dont know where to start", "Limited time for learning"]'::jsonb,
        '["Career growth", "Being seen as competent", "Helping patients through better KOL engagement", "Not being left behind"]'::jsonb,
        '["Tools that assume expertise", "No clear learning path", "Colleagues who make it look easy", "Fear of asking basic questions"]'::jsonb,
        '[{"activity": "KOL meetings", "percent": 35}, {"activity": "Learning new tools", "percent": 20}, {"activity": "Travel", "percent": 15}, {"activity": "Mentor sessions", "percent": 15}, {"activity": "Admin", "percent": 15}]'::jsonb,
        '[{"tool": "Veeva CRM", "proficiency": "Basic"}, {"tool": "PubMed", "proficiency": "Intermediate"}, {"tool": "AI Tools", "proficiency": "Beginner"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'I want to learn, but Im afraid of breaking something.',
            'Can someone just show me the basics first?',
            'I know AI is important, I just need a clear starting point.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Immunology'],
        true, 0.85, 'Data Agent Team'
    ) RETURNING id INTO v_learner_id;

    -- Learner pain points
    INSERT INTO persona_pain_points (persona_id, pain_point, severity, frequency, category, sequence_order) VALUES
        (v_learner_id, 'AI interfaces are overwhelming with too many options', 'high', 'always', 'tool', 1),
        (v_learner_id, 'No clear learning path for AI tools', 'high', 'always', 'process', 2),
        (v_learner_id, 'Fear of making errors that affect KOL relationships', 'high', 'often', 'technical', 3),
        (v_learner_id, 'Colleagues assume I know more than I do', 'medium', 'often', 'organizational', 4);

    -- Learner goals
    INSERT INTO persona_goals (persona_id, goal_text, goal_type, timeframe, priority, sequence_order) VALUES
        (v_learner_id, 'Complete basic AI training without embarrassment', 'professional', 'short_term', 1, 1),
        (v_learner_id, 'Successfully use one AI feature in daily work', 'professional', 'short_term', 2, 2),
        (v_learner_id, 'Build confidence to try new tools independently', 'personal', 'medium_term', 3, 3);

    -- Learner VPANES
    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_learner_id, 5, 5, 4, 3, 5, 6, 28, 'Medium priority - needs nurturing and guided onboarding');

    -- ============================================================
    -- MSL SKEPTIC (Low AI + Strategic Work)
    -- "Traditionalist" - Requires proof
    -- ============================================================
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MSL-SKEPTIC',
        'Dr. Robert Hanson - MSL Skeptic',
        'SKEPTIC',
        v_role_id,
        'Medical Science Liaison',
        'An experienced MSL with deep scientific expertise who is cautious about AI. Needs to understand and verify AI outputs before trusting them. Values accuracy over speed and requires human-in-the-loop validation for any AI-assisted work.',
        '45-55',
        'Senior Individual Contributor',
        'MD with 15+ years clinical and MSL experience',
        'Field Medical',
        'Medical Affairs',
        'regional',
        '["Validate AI outputs before use", "Understand how AI reaches conclusions", "Maintain scientific rigor", "Protect KOL relationships from AI errors"]'::jsonb,
        '["Black-box AI I cant verify", "Pressure to adopt unproven tools", "Risk of AI errors damaging credibility", "Younger colleagues trusting AI blindly"]'::jsonb,
        '["Scientific accuracy", "Protecting reputation", "Mentoring others on rigor", "Patient safety first"]'::jsonb,
        '["AI that cant show its work", "Hype over substance", "Being called resistant to change", "No audit trail for AI decisions"]'::jsonb,
        '[{"activity": "KOL meetings", "percent": 40}, {"activity": "Manual verification", "percent": 20}, {"activity": "Travel", "percent": 15}, {"activity": "Mentoring juniors", "percent": 15}, {"activity": "Admin", "percent": 10}]'::jsonb,
        '[{"tool": "Veeva CRM", "proficiency": "Advanced"}, {"tool": "Primary Literature", "proficiency": "Expert"}, {"tool": "AI Tools", "proficiency": "Basic"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'I need to understand and verify before I trust.',
            'Show me the citations and let me check them myself.',
            'One AI error with a KOL could damage years of relationship building.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Oncology', 'Cardiovascular'],
        true, 0.88, 'Data Agent Team'
    ) RETURNING id INTO v_skeptic_id;

    -- Skeptic pain points
    INSERT INTO persona_pain_points (persona_id, pain_point, severity, frequency, category, sequence_order) VALUES
        (v_skeptic_id, 'Cannot trust black-box AI outputs', 'critical', 'always', 'tool', 1),
        (v_skeptic_id, 'Pressure to adopt AI without proper validation', 'high', 'often', 'organizational', 2),
        (v_skeptic_id, 'No audit trail for AI-generated content', 'high', 'always', 'process', 3),
        (v_skeptic_id, 'Risk of AI errors damaging KOL relationships', 'critical', 'sometimes', 'technical', 4);

    -- Skeptic goals
    INSERT INTO persona_goals (persona_id, goal_text, goal_type, timeframe, priority, sequence_order) VALUES
        (v_skeptic_id, 'Find AI tools that show their reasoning and sources', 'professional', 'medium_term', 1, 1),
        (v_skeptic_id, 'Establish validation protocols for AI outputs', 'organizational', 'short_term', 2, 2),
        (v_skeptic_id, 'Help team understand importance of verification', 'organizational', 'medium_term', 3, 3);

    -- Skeptic VPANES
    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_skeptic_id, 7, 6, 3, 6, 4, 7, 33, 'High priority - needs HITL features and citation transparency');

    RAISE NOTICE 'Created 4 MECE personas for MSL role';
END $$;

-- =====================================================================
-- ROLE 2: SENIOR MSL - 4 ARCHETYPES
-- =====================================================================

DO $$
DECLARE
    v_role_id UUID;
    v_automator_id UUID;
    v_orchestrator_id UUID;
    v_learner_id UUID;
    v_skeptic_id UUID;
BEGIN
    SELECT id INTO v_role_id FROM org_roles
    WHERE name ILIKE '%Senior MSL%' OR name ILIKE '%Senior Medical Science Liaison%'
    LIMIT 1;

    IF v_role_id IS NULL THEN
        RAISE NOTICE 'Senior MSL role not found - skipping';
        RETURN;
    END IF;

    DELETE FROM personas WHERE source_role_id = v_role_id;

    -- SENIOR MSL AUTOMATOR
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-SRMSL-AUTOMATOR',
        'Dr. Michelle Torres - Senior MSL Automator',
        'AUTOMATOR',
        v_role_id,
        'Senior Medical Science Liaison',
        'A senior MSL who has mastered automation to free up time for mentoring and strategic work. Creates automated workflows that the entire team can use. Known for building scalable systems.',
        '38-48',
        'Senior Individual Contributor',
        'PharmD with 8+ years MSL experience',
        'Field Medical',
        'Medical Affairs',
        'global',
        '["Scale personal automation to team level", "Reduce team admin burden by 60%", "Build self-service tools for junior MSLs", "Automate cross-functional reporting"]'::jsonb,
        '["Legacy systems that resist automation", "Getting IT support for integrations", "Training others on automated workflows", "Maintaining automation as systems change"]'::jsonb,
        '["Team efficiency", "Being the go-to automation expert", "More time for strategic mentoring", "Leaving a legacy of better processes"]'::jsonb,
        '["Having to maintain others broken workflows", "IT bottlenecks", "Colleagues who wont adopt new tools"]'::jsonb,
        '[{"activity": "Strategic KOL meetings", "percent": 35}, {"activity": "Building team automations", "percent": 25}, {"activity": "Mentoring on tools", "percent": 20}, {"activity": "Cross-functional projects", "percent": 15}, {"activity": "Admin", "percent": 5}]'::jsonb,
        '[{"tool": "Veeva CRM", "proficiency": "Expert"}, {"tool": "Automation Platforms", "proficiency": "Expert"}, {"tool": "Integration Tools", "proficiency": "Advanced"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'My automated workflows now save the team 50 hours per week.',
            'The best automation is one that others can use without me.',
            'I measure success by how much time I give back to my colleagues.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Oncology', 'Immunology'],
        true, 0.92, 'Data Agent Team'
    ) RETURNING id INTO v_automator_id;

    -- Senior MSL Automator junction data
    INSERT INTO persona_pain_points (persona_id, pain_point, severity, frequency, category, sequence_order) VALUES
        (v_automator_id, 'Manual processes that should have been automated years ago', 'high', 'always', 'process', 1),
        (v_automator_id, 'IT approval delays for automation integrations', 'high', 'often', 'organizational', 2),
        (v_automator_id, 'Colleagues creating one-off solutions instead of scalable workflows', 'medium', 'often', 'organizational', 3);

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_automator_id, 9, 7, 9, 6, 6, 9, 46, 'Ideal - automation champion who can influence team adoption');

    -- SENIOR MSL ORCHESTRATOR
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-SRMSL-ORCHESTRATOR',
        'Dr. David Nakamura - Senior MSL Orchestrator',
        'ORCHESTRATOR',
        v_role_id,
        'Senior Medical Science Liaison',
        'A visionary senior MSL who uses AI to drive strategic insights across the entire KOL ecosystem. Influences medical strategy by synthesizing complex data patterns. Seen as a thought leader on AI-enabled MSL work.',
        '40-50',
        'Senior Individual Contributor',
        'MD/PhD with 10+ years MSL and clinical experience',
        'Field Medical',
        'Medical Affairs',
        'global',
        '["Transform MSL function through AI-driven insights", "Influence corporate medical strategy with data", "Pioneer predictive KOL engagement", "Build AI-powered competitive intelligence"]'::jsonb,
        '["Data silos across organization", "Resistance to data-driven decisions", "Translating AI insights for non-technical leaders", "Moving faster than organizational change allows"]'::jsonb,
        '["Transformational impact", "Industry thought leadership", "Building the future of MSL work", "Strategic influence at executive level"]'::jsonb,
        '["Organizational inertia", "Being ahead of what systems support", "Explaining AI value to skeptics"]'::jsonb,
        '[{"activity": "Strategic synthesis and analysis", "percent": 35}, {"activity": "Executive presentations", "percent": 20}, {"activity": "High-value KOL partnerships", "percent": 20}, {"activity": "Innovation projects", "percent": 15}, {"activity": "Mentoring", "percent": 10}]'::jsonb,
        '[{"tool": "AI Analysis Platforms", "proficiency": "Expert"}, {"tool": "Data Visualization", "proficiency": "Expert"}, {"tool": "Predictive Analytics", "proficiency": "Advanced"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'AI lets me see patterns in KOL networks that would take months to discover manually.',
            'My job is to translate AI insights into strategic action for leadership.',
            'The MSL of the future is an AI-augmented strategic partner, not just a relationship manager.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Oncology', 'Rare Diseases', 'Cell & Gene Therapy'],
        true, 0.95, 'Data Agent Team'
    ) RETURNING id INTO v_orchestrator_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_orchestrator_id, 10, 8, 10, 8, 8, 9, 53, 'Ideal+ - highest value persona for advanced AI platform');

    -- SENIOR MSL LEARNER
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-SRMSL-LEARNER',
        'Dr. Patricia Martinez - Senior MSL Learner',
        'LEARNER',
        v_role_id,
        'Senior Medical Science Liaison',
        'A recently promoted Senior MSL who excels at traditional MSL work but feels behind on AI tools. Worried about losing credibility as a senior if she cant keep up with technology. Wants structured learning opportunities.',
        '42-50',
        'Senior Individual Contributor',
        'PharmD with 10 years MSL experience, new to Senior role',
        'Field Medical',
        'Medical Affairs',
        'regional',
        '["Learn AI without looking incompetent", "Maintain credibility while upskilling", "Find time for learning amid responsibilities", "Eventually mentor others on AI"]'::jsonb,
        '["Expected to know everything as a senior", "No safe space to learn basics", "Junior colleagues more tech-savvy", "Pride making it hard to ask for help"]'::jsonb,
        '["Staying relevant", "Being a complete senior MSL", "Not letting team down", "Proving you can teach old dogs new tricks"]'::jsonb,
        '["Feeling behind", "Training designed for beginners feels patronizing", "No senior-specific AI learning path"]'::jsonb,
        '[{"activity": "KOL meetings", "percent": 40}, {"activity": "Learning AI tools", "percent": 15}, {"activity": "Mentoring juniors", "percent": 20}, {"activity": "Cross-functional work", "percent": 15}, {"activity": "Admin", "percent": 10}]'::jsonb,
        '[{"tool": "Veeva CRM", "proficiency": "Expert"}, {"tool": "Traditional MSL Tools", "proficiency": "Expert"}, {"tool": "AI Tools", "proficiency": "Beginner"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'I know Im behind on AI, but its hard to admit when youre supposed to be the expert.',
            'I need a learning path designed for experienced MSLs, not new hires.',
            'I dont want to slow down my team by not knowing these tools.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Cardiovascular', 'Neuroscience'],
        true, 0.85, 'Data Agent Team'
    ) RETURNING id INTO v_learner_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_learner_id, 6, 6, 5, 4, 7, 6, 34, 'High - emotional needs around pride and credibility, needs senior-specific onboarding');

    -- SENIOR MSL SKEPTIC
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-SRMSL-SKEPTIC',
        'Dr. William Chen - Senior MSL Skeptic',
        'SKEPTIC',
        v_role_id,
        'Senior Medical Science Liaison',
        'A highly experienced Senior MSL who has seen many technology fads come and go. Deep respect for scientific rigor makes him cautious about AI. Influential voice on the team - his buy-in is critical for adoption.',
        '50-58',
        'Senior Individual Contributor',
        'MD with 20+ years clinical and MSL experience',
        'Field Medical',
        'Medical Affairs',
        'global',
        '["Protect team from AI mistakes", "Establish rigorous AI validation protocols", "Ensure compliance in AI-assisted work", "Be the voice of scientific rigor"]'::jsonb,
        '["AI hype without substance", "Pressure to adopt before validation", "Junior colleagues over-relying on AI", "Lack of AI audit trails"]'::jsonb,
        '["Scientific integrity", "Protecting KOL relationships built over decades", "Mentoring on rigor", "Being the check on enthusiasm"]'::jsonb,
        '["Being dismissed as resistant", "No AI tools meet scientific standards", "Watching others make preventable AI errors"]'::jsonb,
        '[{"activity": "High-value KOL relationships", "percent": 40}, {"activity": "Reviewing AI outputs", "percent": 15}, {"activity": "Mentoring on scientific rigor", "percent": 20}, {"activity": "Compliance activities", "percent": 15}, {"activity": "Admin", "percent": 10}]'::jsonb,
        '[{"tool": "Primary Literature", "proficiency": "Expert"}, {"tool": "Veeva CRM", "proficiency": "Advanced"}, {"tool": "AI Tools", "proficiency": "Basic-Skeptical"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'Ive seen too many technology fads. AI needs to prove itself to me.',
            'My KOL relationships took 20 years to build. One AI error could damage them.',
            'If AI cant show me exactly how it reached a conclusion, I wont use it.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Oncology', 'Hematology'],
        true, 0.88, 'Data Agent Team'
    ) RETURNING id INTO v_skeptic_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_skeptic_id, 8, 5, 2, 7, 5, 8, 35, 'High - influential skeptic whose buy-in is critical for team adoption');

    RAISE NOTICE 'Created 4 MECE personas for Senior MSL role';
END $$;

-- =====================================================================
-- ROLE 3: MSL MANAGER - 4 ARCHETYPES
-- =====================================================================

DO $$
DECLARE
    v_role_id UUID;
    v_automator_id UUID;
    v_orchestrator_id UUID;
    v_learner_id UUID;
    v_skeptic_id UUID;
BEGIN
    SELECT id INTO v_role_id FROM org_roles WHERE name ILIKE '%MSL Manager%' LIMIT 1;

    IF v_role_id IS NULL THEN
        RAISE NOTICE 'MSL Manager role not found - skipping';
        RETURN;
    END IF;

    DELETE FROM personas WHERE source_role_id = v_role_id;

    -- MSL MANAGER AUTOMATOR
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MSLMGR-AUTOMATOR',
        'Dr. Jennifer Park - MSL Manager Automator',
        'AUTOMATOR',
        v_role_id,
        'MSL Manager',
        'An MSL Manager who uses automation to eliminate management overhead and give her team more field time. Built automated reporting, scheduling, and coaching systems. Measures success by how much admin she removes from her team.',
        '40-48',
        'Manager',
        'PharmD with 8+ years MSL experience, 3 years management',
        'Field Medical',
        'Medical Affairs',
        'regional',
        '["Automate 90% of management reporting", "Give team 10+ hours back per week", "Build self-service dashboards for team", "Eliminate manual scheduling overhead"]'::jsonb,
        '["Team using 5 different systems", "Manual activity reporting", "Scheduling complexity across time zones", "Compliance documentation burden"]'::jsonb,
        '["Team efficiency", "Being a modern manager", "Proving automation ROI to leadership", "Freeing team for high-value work"]'::jsonb,
        '["Systems that dont integrate", "Compliance requirements that resist automation", "Team members comfortable with manual processes"]'::jsonb,
        '[{"activity": "Team management", "percent": 25}, {"activity": "Building automated systems", "percent": 25}, {"activity": "Strategic planning", "percent": 20}, {"activity": "Cross-functional work", "percent": 15}, {"activity": "Field coaching", "percent": 15}]'::jsonb,
        '[{"tool": "Management Dashboard", "proficiency": "Expert"}, {"tool": "Automation Platforms", "proficiency": "Expert"}, {"tool": "Scheduling Tools", "proficiency": "Advanced"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'My team should be in the field, not filling out reports.',
            'I automated our activity tracking - saved us 40 hours per month.',
            'The best manager is one whose team barely notices the admin work.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Oncology', 'Immunology', 'Cardiovascular'],
        true, 0.92, 'Data Agent Team'
    ) RETURNING id INTO v_automator_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_automator_id, 9, 8, 9, 7, 6, 9, 48, 'Ideal - automation champion with management authority to drive adoption');

    -- MSL MANAGER ORCHESTRATOR
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MSLMGR-ORCHESTRATOR',
        'Dr. Marcus Williams - MSL Manager Orchestrator',
        'ORCHESTRATOR',
        v_role_id,
        'MSL Manager',
        'A strategic MSL Manager who uses AI to optimize team deployment, predict KOL engagement opportunities, and demonstrate medical affairs ROI to leadership. Seen as a visionary transforming field medical management.',
        '42-52',
        'Manager',
        'MD with 12+ years MSL experience, 5 years management',
        'Field Medical',
        'Medical Affairs',
        'global',
        '["Use AI to optimize team deployment", "Predict KOL engagement opportunities", "Demonstrate medical affairs ROI with data", "Transform field medical management"]'::jsonb,
        '["Proving AI value to skeptical leadership", "Data silos across regions", "Balancing innovation with operational demands", "Getting budget for AI initiatives"]'::jsonb,
        '["Transforming field medical", "Data-driven leadership", "Industry recognition", "Building the team of the future"]'::jsonb,
        '["Leadership that doesnt understand AI value", "Vendor limitations", "Slow organizational change"]'::jsonb,
        '[{"activity": "Strategic planning with AI", "percent": 30}, {"activity": "Leadership presentations", "percent": 20}, {"activity": "Team development", "percent": 20}, {"activity": "Cross-functional innovation", "percent": 15}, {"activity": "Field coaching", "percent": 15}]'::jsonb,
        '[{"tool": "AI Analytics Platform", "proficiency": "Expert"}, {"tool": "Predictive Modeling", "proficiency": "Advanced"}, {"tool": "Executive Dashboards", "proficiency": "Expert"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'AI tells me where my team should be before they know it themselves.',
            'I can now predict which KOLs will be important in 2 years, not just today.',
            'My job is to use AI to make my team strategically indispensable.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Oncology', 'Rare Diseases'],
        true, 0.95, 'Data Agent Team'
    ) RETURNING id INTO v_orchestrator_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_orchestrator_id, 10, 8, 9, 8, 7, 9, 51, 'Ideal+ - strategic leader with budget authority and transformation vision');

    -- MSL MANAGER LEARNER
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MSLMGR-LEARNER',
        'Dr. Lisa Thompson - MSL Manager Learner',
        'LEARNER',
        v_role_id,
        'MSL Manager',
        'A newly promoted MSL Manager overwhelmed by management responsibilities and pressure to adopt AI tools. Wants to learn but has no time. Needs simple, high-impact starting points that dont require deep technical knowledge.',
        '36-44',
        'Manager',
        'PharmD with 6 years MSL experience, new to management',
        'Field Medical',
        'Medical Affairs',
        'regional',
        '["Find time to learn AI while managing team", "Start with highest-impact AI tools", "Not embarrass myself in front of team", "Eventually lead AI adoption"]'::jsonb,
        '["No time for learning", "Team knows more about AI than I do", "Pressure to be expert immediately", "Management transition already overwhelming"]'::jsonb,
        '["Being a complete modern manager", "Not holding team back", "Career growth", "Earning team respect"]'::jsonb,
        '["Too many tools to learn", "No management-specific AI training", "Team moving faster than me", "Feeling like an imposter"]'::jsonb,
        '[{"activity": "Team management", "percent": 35}, {"activity": "Learning new skills", "percent": 15}, {"activity": "Meetings", "percent": 25}, {"activity": "Admin", "percent": 15}, {"activity": "Field coaching", "percent": 10}]'::jsonb,
        '[{"tool": "Veeva CRM", "proficiency": "Advanced"}, {"tool": "HR Systems", "proficiency": "Intermediate"}, {"tool": "AI Tools", "proficiency": "Beginner"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'Between management and learning AI, there are not enough hours in the day.',
            'My team is more tech-savvy than I am - I need to catch up.',
            'Just give me the one thing that will make the biggest difference.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Immunology', 'Rheumatology'],
        true, 0.85, 'Data Agent Team'
    ) RETURNING id INTO v_learner_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_learner_id, 5, 7, 4, 4, 8, 6, 34, 'High - emotional stress from dual transition, needs quick wins and manager-specific guidance');

    -- MSL MANAGER SKEPTIC
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MSLMGR-SKEPTIC',
        'Dr. Robert Chen - MSL Manager Skeptic',
        'SKEPTIC',
        v_role_id,
        'MSL Manager',
        'An experienced MSL Manager who has seen AI projects fail and waste budget. Protective of his team from unproven initiatives. Needs substantial proof of ROI and compliance safety before endorsing AI tools for his team.',
        '48-56',
        'Manager',
        'MD with 15+ years MSL experience, 8 years management',
        'Field Medical',
        'Medical Affairs',
        'global',
        '["Protect team from wasted effort", "Ensure any AI tools are compliance-safe", "See proven ROI before adopting", "Maintain team productivity during any transition"]'::jsonb,
        '["Pressure from leadership to adopt AI", "Vendors overselling capabilities", "Compliance risks from AI content", "Team distraction from unproven tools"]'::jsonb,
        '["Protecting team", "Being the voice of reason", "Ensuring compliance", "Making evidence-based decisions"]'::jsonb,
        '["Leadership buying into AI hype", "No clear compliance guidance for AI", "Wasting team time on pilots that fail", "Being seen as blocking progress"]'::jsonb,
        '[{"activity": "Team management", "percent": 30}, {"activity": "Evaluating AI proposals", "percent": 15}, {"activity": "Compliance review", "percent": 15}, {"activity": "Strategic planning", "percent": 20}, {"activity": "Field coaching", "percent": 20}]'::jsonb,
        '[{"tool": "Veeva CRM", "proficiency": "Expert"}, {"tool": "Compliance Tools", "proficiency": "Expert"}, {"tool": "AI Tools", "proficiency": "Basic-Evaluating"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'Ive seen three AI initiatives fail. Show me this ones different.',
            'My team is not a guinea pig for unproven technology.',
            'Give me compliance sign-off and ROI proof, then well talk.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Oncology', 'Hematology'],
        true, 0.88, 'Data Agent Team'
    ) RETURNING id INTO v_skeptic_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_skeptic_id, 8, 5, 2, 7, 4, 8, 34, 'High - gatekeeper whose approval needed for team adoption, needs ROI proof and compliance assurance');

    RAISE NOTICE 'Created 4 MECE personas for MSL Manager role';
END $$;

-- =====================================================================
-- ROLE 4: MEDICAL INFORMATION SPECIALIST - 4 ARCHETYPES
-- =====================================================================

DO $$
DECLARE
    v_role_id UUID;
    v_automator_id UUID;
    v_orchestrator_id UUID;
    v_learner_id UUID;
    v_skeptic_id UUID;
BEGIN
    SELECT id INTO v_role_id FROM org_roles WHERE name ILIKE '%Medical Information%' LIMIT 1;

    IF v_role_id IS NULL THEN
        RAISE NOTICE 'Medical Information Specialist role not found - skipping';
        RETURN;
    END IF;

    DELETE FROM personas WHERE source_role_id = v_role_id;

    -- MIS AUTOMATOR
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MIS-AUTOMATOR',
        'Dr. Emily Watson - MIS Automator',
        'AUTOMATOR',
        v_role_id,
        'Medical Information Specialist',
        'A MIS who automates routine inquiry responses to focus on complex cases. Built templates and workflows that handle 60% of standard inquiries automatically while maintaining compliance.',
        '30-38',
        'Individual Contributor',
        'PharmD with Drug Information training',
        'Medical Information',
        'Medical Affairs',
        'regional',
        '["Automate 70% of routine inquiries", "Reduce response time by 50%", "Build self-updating response templates", "Free time for complex clinical questions"]'::jsonb,
        '["High volume of repetitive inquiries", "Manual AE documentation", "Template maintenance burden", "Compliance review bottlenecks"]'::jsonb,
        '["Efficiency", "Handling more complex cases", "Being the automation pioneer", "Better work-life balance"]'::jsonb,
        '["Outdated response templates", "Compliance review delays", "Systems that dont integrate"]'::jsonb,
        '[{"activity": "Complex medical inquiries", "percent": 35}, {"activity": "Automation maintenance", "percent": 25}, {"activity": "AE documentation", "percent": 15}, {"activity": "Template development", "percent": 15}, {"activity": "Training", "percent": 10}]'::jsonb,
        '[{"tool": "Call Center Platform", "proficiency": "Expert"}, {"tool": "Response Automation", "proficiency": "Expert"}, {"tool": "Safety Database", "proficiency": "Advanced"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'I automated our top 50 FAQs - now I only handle the interesting cases.',
            'Every minute saved on routine inquiries is a minute for complex clinical questions.',
            'Good automation should be invisible to the caller.'
        ],
        '[{"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Multiple therapeutic areas'],
        true, 0.92, 'Data Agent Team'
    ) RETURNING id INTO v_automator_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_automator_id, 8, 8, 8, 5, 6, 9, 44, 'High - high-volume role where automation delivers immediate ROI');

    -- MIS ORCHESTRATOR
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MIS-ORCHESTRATOR',
        'Dr. Marcus Johnson - MIS Orchestrator',
        'ORCHESTRATOR',
        v_role_id,
        'Senior Medical Information Specialist',
        'A senior MIS who uses AI to synthesize information across multiple products and therapeutic areas. Creates comprehensive responses by pulling insights from clinical data, competitor information, and emerging research.',
        '38-48',
        'Senior Individual Contributor',
        'PharmD, PhD with 12+ years MI experience',
        'Medical Information',
        'Medical Affairs',
        'global',
        '["Synthesize cross-product insights", "Build enterprise-wide response knowledge base", "Use AI to identify inquiry trends", "Inform medical strategy with MI data"]'::jsonb,
        '["Information across 20+ products", "Connecting dots across therapeutic areas", "Translating inquiry trends to strategy", "Time to synthesize complex cases"]'::jsonb,
        '["Strategic insight generation", "Being the knowledge hub", "Influencing medical strategy", "Enterprise-wide impact"]'::jsonb,
        '["Siloed product information", "No time for strategic analysis", "Being seen as just a call center"]'::jsonb,
        '[{"activity": "Complex escalations", "percent": 30}, {"activity": "AI-powered synthesis", "percent": 25}, {"activity": "Strategic insights", "percent": 20}, {"activity": "Mentoring", "percent": 15}, {"activity": "Process improvement", "percent": 10}]'::jsonb,
        '[{"tool": "AI Synthesis Tools", "proficiency": "Expert"}, {"tool": "Knowledge Management", "proficiency": "Expert"}, {"tool": "Analytics Platform", "proficiency": "Advanced"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'I see patterns in inquiries that predict market questions before they spike.',
            'AI lets me connect information across 20 products in seconds.',
            'Medical Information should be strategic intelligence, not just reactive responses.'
        ],
        '[{"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Portfolio-wide'],
        true, 0.95, 'Data Agent Team'
    ) RETURNING id INTO v_orchestrator_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_orchestrator_id, 9, 8, 9, 7, 7, 8, 48, 'Ideal - high-value synthesis role with strategic influence potential');

    -- MIS LEARNER
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MIS-LEARNER',
        'Dr. Jessica Lee - MIS Learner',
        'LEARNER',
        v_role_id,
        'Medical Information Specialist',
        'A newly hired MIS from drug information residency learning industry MI processes. Overwhelmed by product knowledge and compliance requirements. Wants to learn AI tools but prioritizing basics first.',
        '26-32',
        'Entry Level',
        'PharmD with Drug Information residency',
        'Medical Information',
        'Medical Affairs',
        'regional',
        '["Master basic MI processes first", "Learn product knowledge", "Eventually use AI to be more efficient", "Not make compliance errors"]'::jsonb,
        '["Information overload", "So many products to learn", "Compliance pressure", "Pace of call center"]'::jsonb,
        '["Building pharma career", "Drug information passion", "Patient safety impact", "Professional growth"]'::jsonb,
        '["Too much to learn at once", "Fear of AE documentation errors", "Feeling slow compared to experienced colleagues"]'::jsonb,
        '[{"activity": "Medical inquiries", "percent": 40}, {"activity": "Training", "percent": 25}, {"activity": "Product learning", "percent": 20}, {"activity": "AE documentation", "percent": 10}, {"activity": "Mentoring sessions", "percent": 5}]'::jsonb,
        '[{"tool": "Call Center Platform", "proficiency": "Basic"}, {"tool": "Medical Information DB", "proficiency": "Intermediate"}, {"tool": "AI Tools", "proficiency": "Beginner"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'I need to learn the basics before I can even think about AI tools.',
            'There is so much to learn - I feel like Im drinking from a firehose.',
            'AI sounds great but I am still learning which products we even have.'
        ],
        '[{"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Learning all therapeutic areas'],
        true, 0.82, 'Data Agent Team'
    ) RETURNING id INTO v_learner_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_learner_id, 4, 5, 3, 2, 6, 5, 25, 'Medium - needs basics mastered before AI, but has long-term potential');

    -- MIS SKEPTIC
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MIS-SKEPTIC',
        'Dr. Sandra Miller - MIS Skeptic',
        'SKEPTIC',
        v_role_id,
        'Senior Medical Information Specialist',
        'An experienced MIS deeply concerned about AI accuracy in medical information. One wrong answer to an HCP could harm patients. Requires 100% accuracy verification and regulatory sign-off before any AI-assisted responses.',
        '45-55',
        'Senior Individual Contributor',
        'PharmD with 18+ years clinical and MI experience',
        'Medical Information',
        'Medical Affairs',
        'global',
        '["Ensure zero errors in AI-assisted responses", "Establish AI validation protocols", "Protect company from AI-related liability", "Maintain trust with HCP callers"]'::jsonb,
        '["AI cannot match human judgment for nuanced questions", "No regulatory guidance on AI in MI", "Liability concerns with AI responses", "Pressure to be faster vs be accurate"]'::jsonb,
        '["Patient safety above all", "Accuracy over speed", "Protecting professional integrity", "Being the quality gatekeeper"]'::jsonb,
        '["Pressure to use AI without validation", "No clear compliance guidelines", "Colleagues trusting AI outputs blindly"]'::jsonb,
        '[{"activity": "Complex inquiries", "percent": 40}, {"activity": "AI output review", "percent": 20}, {"activity": "Compliance verification", "percent": 15}, {"activity": "Mentoring on accuracy", "percent": 15}, {"activity": "Process review", "percent": 10}]'::jsonb,
        '[{"tool": "Medical Information DB", "proficiency": "Expert"}, {"tool": "Primary Literature", "proficiency": "Expert"}, {"tool": "AI Tools", "proficiency": "Evaluating"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'One wrong answer to a physician could harm a patient. AI cannot understand that gravity.',
            'Show me the validation data and regulatory guidance, then well discuss adoption.',
            'Speed means nothing if we lose trust with one bad AI response.'
        ],
        '[{"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['All therapeutic areas'],
        true, 0.88, 'Data Agent Team'
    ) RETURNING id INTO v_skeptic_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_skeptic_id, 8, 6, 2, 6, 5, 8, 35, 'High - quality gatekeeper role, needs HITL and full validation for any AI adoption');

    RAISE NOTICE 'Created 4 MECE personas for Medical Information Specialist role';
END $$;

-- =====================================================================
-- ROLE 5: MEDICAL DIRECTOR - 4 ARCHETYPES
-- =====================================================================

DO $$
DECLARE
    v_role_id UUID;
    v_automator_id UUID;
    v_orchestrator_id UUID;
    v_learner_id UUID;
    v_skeptic_id UUID;
BEGIN
    SELECT id INTO v_role_id FROM org_roles WHERE name ILIKE '%Medical Director%' AND name NOT ILIKE '%VP%' LIMIT 1;

    IF v_role_id IS NULL THEN
        RAISE NOTICE 'Medical Director role not found - skipping';
        RETURN;
    END IF;

    DELETE FROM personas WHERE source_role_id = v_role_id;

    -- MEDICAL DIRECTOR AUTOMATOR
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MEDDIR-AUTOMATOR',
        'Dr. Amanda Foster - Medical Director Automator',
        'AUTOMATOR',
        v_role_id,
        'Medical Director',
        'A Medical Director who uses AI to automate routine medical review, report compilation, and meeting prep. Focuses efficiency gains on freeing time for strategic decisions and team development.',
        '42-50',
        'Director',
        'MD with 12+ years industry experience',
        'Medical Affairs',
        'Medical Affairs',
        'global',
        '["Automate routine medical reviews", "Eliminate manual report compilation", "Free 10+ hours weekly for strategy", "Build efficient team processes"]'::jsonb,
        '["Administrative burden at director level", "Manual compilation of board materials", "Time spent on routine approvals", "Meeting overload"]'::jsonb,
        '["Efficiency for strategic impact", "Modeling modern leadership", "Time for team development", "Work-life balance at senior level"]'::jsonb,
        '["Systems not designed for director-level workflow", "Approval bottlenecks", "Too many low-value meetings"]'::jsonb,
        '[{"activity": "Strategic decisions", "percent": 30}, {"activity": "Automated review processes", "percent": 20}, {"activity": "Team leadership", "percent": 25}, {"activity": "Cross-functional work", "percent": 15}, {"activity": "External engagement", "percent": 10}]'::jsonb,
        '[{"tool": "AI Review Tools", "proficiency": "Advanced"}, {"tool": "Automated Reporting", "proficiency": "Advanced"}, {"tool": "Meeting Optimization", "proficiency": "Expert"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'I automated my weekly report prep - saved 4 hours I now spend with my team.',
            'At the director level, efficiency gains multiply across the whole organization.',
            'If AI can handle the routine, I can focus on what actually needs a Medical Director.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Oncology', 'Immunology'],
        true, 0.92, 'Data Agent Team'
    ) RETURNING id INTO v_automator_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_automator_id, 8, 7, 8, 7, 6, 8, 44, 'High - director-level efficiency gains have organizational multiplier effect');

    -- MEDICAL DIRECTOR ORCHESTRATOR
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MEDDIR-ORCHESTRATOR',
        'Dr. David Kim - Medical Director Orchestrator',
        'ORCHESTRATOR',
        v_role_id,
        'Medical Director',
        'A visionary Medical Director who uses AI to synthesize clinical development strategy across the portfolio. Leverages AI panels for competitive intelligence, regulatory pathway analysis, and KOL network optimization.',
        '45-55',
        'Director',
        'MD/PhD with 15+ years industry experience',
        'Medical Affairs',
        'Medical Affairs',
        'global',
        '["AI-powered portfolio strategy", "Predictive regulatory pathway analysis", "Real-time competitive intelligence synthesis", "Transform medical affairs decision-making"]'::jsonb,
        '["Synthesizing information across 15+ programs", "Speed of decision-making vs depth", "Getting board-quality insights fast", "Competing with better-resourced competitors"]'::jsonb,
        '["Strategic impact at scale", "Transforming medical affairs", "Industry thought leadership", "Building competitive advantage"]'::jsonb,
        '["Data silos across development and commercial", "Legacy systems limiting insights", "Organizational speed vs AI speed"]'::jsonb,
        '[{"activity": "Strategic AI-powered analysis", "percent": 35}, {"activity": "Executive presentations", "percent": 20}, {"activity": "Portfolio decisions", "percent": 20}, {"activity": "KOL strategy", "percent": 15}, {"activity": "Team leadership", "percent": 10}]'::jsonb,
        '[{"tool": "AI Strategy Panels", "proficiency": "Expert"}, {"tool": "Competitive Intelligence AI", "proficiency": "Expert"}, {"tool": "Portfolio Analytics", "proficiency": "Expert"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'AI lets me see the full competitive landscape in minutes, not months.',
            'I need synthesis across clinical, regulatory, and commercial - AI is the only way.',
            'The Medical Director who masters AI will define medical affairs for the next decade.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Oncology', 'Immunology', 'Rare Diseases'],
        true, 0.95, 'Data Agent Team'
    ) RETURNING id INTO v_orchestrator_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_orchestrator_id, 10, 9, 10, 9, 8, 9, 55, 'Ideal+ - highest value persona with budget authority and enterprise impact');

    -- MEDICAL DIRECTOR LEARNER
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MEDDIR-LEARNER',
        'Dr. Ryan Mitchell - Medical Director Learner',
        'LEARNER',
        v_role_id,
        'Associate Medical Director',
        'A recently promoted Associate Medical Director who is an expert clinician but new to enterprise AI tools. Feels pressure to catch up with peers who are more tech-savvy. Needs executive-appropriate learning without basic tutorials.',
        '38-46',
        'Senior Manager',
        'MD with 10 years clinical and industry experience',
        'Medical Affairs',
        'Medical Affairs',
        'regional',
        '["Learn AI without losing credibility", "Find executive-appropriate training", "Apply AI to director-level problems", "Build confidence before board presentations"]'::jsonb,
        '["Expected to already know AI at director level", "No time for lengthy training", "Peers seem more advanced", "Pride making it hard to ask for help"]'::jsonb,
        '["Career advancement", "Being a complete modern leader", "Not being the AI-laggard director", "Setting example for team"]'::jsonb,
        '["Training feels beneath director level", "No executive AI learning path", "Admitting gaps feels risky"]'::jsonb,
        '[{"activity": "Strategic work", "percent": 30}, {"activity": "Learning AI privately", "percent": 15}, {"activity": "Team leadership", "percent": 25}, {"activity": "Cross-functional work", "percent": 20}, {"activity": "External engagement", "percent": 10}]'::jsonb,
        '[{"tool": "Standard Director Tools", "proficiency": "Expert"}, {"tool": "AI Tools", "proficiency": "Beginner-Intermediate"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'At the director level, you are expected to know everything. Admitting AI gaps feels risky.',
            'I need to learn AI, but the training feels designed for new hires.',
            'My clinical expertise is solid - I just need to catch up on the AI side.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Immunology', 'Neuroscience'],
        true, 0.85, 'Data Agent Team'
    ) RETURNING id INTO v_learner_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_learner_id, 6, 7, 5, 6, 8, 6, 38, 'High - emotional stakes around credibility, needs executive-appropriate onboarding');

    -- MEDICAL DIRECTOR SKEPTIC
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-MEDDIR-SKEPTIC',
        'Dr. Patricia Okonkwo - Medical Director Skeptic',
        'SKEPTIC',
        v_role_id,
        'Medical Director',
        'A highly experienced Medical Director with deep scientific credentials who requires rigorous proof before adopting AI. Concerned about regulatory implications, scientific accuracy, and organizational risk. Key stakeholder whose buy-in is essential.',
        '50-60',
        'Director',
        'MD, PhD with 20+ years clinical and industry experience',
        'Medical Affairs',
        'Medical Affairs',
        'global',
        '["Ensure AI meets medical-grade accuracy", "Establish director-level AI governance", "Protect organization from AI risks", "Lead evidence-based AI adoption"]'::jsonb,
        '["AI lacks scientific rigor for medical decisions", "No regulatory guidance on AI in medical affairs", "Board exposure from AI errors", "Pressure to adopt without proper validation"]'::jsonb,
        '["Scientific integrity", "Protecting organization", "Evidence-based leadership", "Setting proper governance precedents"]'::jsonb,
        '["Hype overwhelming substance", "Vendors overpromising", "Lack of medical-grade validation", "Being seen as blocking progress"]'::jsonb,
        '[{"activity": "Strategic oversight", "percent": 30}, {"activity": "AI governance development", "percent": 15}, {"activity": "Risk assessment", "percent": 15}, {"activity": "Team leadership", "percent": 20}, {"activity": "External scientific engagement", "percent": 20}]'::jsonb,
        '[{"tool": "Traditional Director Tools", "proficiency": "Expert"}, {"tool": "AI Tools", "proficiency": "Evaluating"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'In medicine, we require clinical trial evidence. Why should AI be any different?',
            'I am not against AI - I am against unvalidated AI in medical decision-making.',
            'Show me the validation data, regulatory guidance, and risk mitigation plan.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Oncology'],
        true, 0.88, 'Data Agent Team'
    ) RETURNING id INTO v_skeptic_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_skeptic_id, 9, 6, 2, 8, 5, 8, 38, 'High - influential skeptic with governance authority, essential for enterprise adoption');

    RAISE NOTICE 'Created 4 MECE personas for Medical Director role';
END $$;

-- =====================================================================
-- ROLE 6: VP MEDICAL AFFAIRS - 4 ARCHETYPES
-- =====================================================================

DO $$
DECLARE
    v_role_id UUID;
    v_automator_id UUID;
    v_orchestrator_id UUID;
    v_learner_id UUID;
    v_skeptic_id UUID;
BEGIN
    SELECT id INTO v_role_id FROM org_roles WHERE name ILIKE '%VP Medical Affairs%' OR name ILIKE '%Vice President Medical%' LIMIT 1;

    IF v_role_id IS NULL THEN
        RAISE NOTICE 'VP Medical Affairs role not found - skipping';
        RETURN;
    END IF;

    DELETE FROM personas WHERE source_role_id = v_role_id;

    -- VP MEDICAL AFFAIRS AUTOMATOR
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-VPMA-AUTOMATOR',
        'Dr. Michelle Chang - VP Medical Affairs Automator',
        'AUTOMATOR',
        v_role_id,
        'VP Medical Affairs',
        'A VP who drives operational excellence through automation across the entire medical affairs function. Champions AI tools for efficiency gains that free the organization for strategic work.',
        '48-55',
        'VP',
        'MD with 18+ years industry experience',
        'Medical Affairs Leadership',
        'Medical Affairs',
        'global',
        '["Automate medical affairs operations", "Achieve 40% efficiency gains department-wide", "Free teams for strategic work", "Build scalable AI-enabled processes"]'::jsonb,
        '["Organizational change management", "Legacy system constraints", "Budget for AI transformation", "Measuring automation ROI"]'::jsonb,
        '["Operational excellence", "Modernizing medical affairs", "Competitive efficiency", "Team empowerment"]'::jsonb,
        '["Slow organizational adoption", "IT dependencies", "Change resistance from senior leaders"]'::jsonb,
        '[{"activity": "Executive leadership", "percent": 30}, {"activity": "Automation strategy", "percent": 20}, {"activity": "Team development", "percent": 20}, {"activity": "Cross-functional executive work", "percent": 20}, {"activity": "External engagement", "percent": 10}]'::jsonb,
        '[{"tool": "Executive Dashboard", "proficiency": "Expert"}, {"tool": "Process Automation", "proficiency": "Advanced"}, {"tool": "Change Management Tools", "proficiency": "Expert"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'Automation at the VP level is about freeing hundreds of people for strategic work.',
            'I measure success by how much high-value work my team can take on.',
            'Medical affairs that isnt AI-enabled will fall behind in 3 years.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Oncology', 'Immunology', 'Cardiovascular', 'Neuroscience'],
        true, 0.92, 'Data Agent Team'
    ) RETURNING id INTO v_automator_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_automator_id, 9, 7, 9, 9, 6, 8, 48, 'Ideal - VP with budget authority driving enterprise automation');

    -- VP MEDICAL AFFAIRS ORCHESTRATOR
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-VPMA-ORCHESTRATOR',
        'Dr. Rebecca Martinez - VP Medical Affairs Orchestrator',
        'ORCHESTRATOR',
        v_role_id,
        'VP Medical Affairs',
        'A visionary VP who uses AI to transform medical affairs from support function to strategic driver. Leverages AI synthesis for board-level insights, competitive intelligence, and portfolio strategy across the enterprise.',
        '50-58',
        'VP',
        'MD with 20+ years industry experience, board experience',
        'Medical Affairs Leadership',
        'Medical Affairs',
        'global',
        '["Position medical affairs as strategic driver", "AI-powered board insights", "Enterprise competitive intelligence", "Transform industry perception of medical affairs"]'::jsonb,
        '["Proving medical affairs strategic value", "Board-level AI synthesis needs", "Enterprise data integration", "Competitive pressure from AI-native biotechs"]'::jsonb,
        '["Strategic transformation", "Industry leadership", "Board-level impact", "Legacy of modernization"]'::jsonb,
        '["Medical affairs still seen as support function", "Data silos preventing synthesis", "Slow enterprise change"]'::jsonb,
        '[{"activity": "Strategic AI analysis", "percent": 30}, {"activity": "Board and executive work", "percent": 25}, {"activity": "Enterprise transformation", "percent": 20}, {"activity": "External thought leadership", "percent": 15}, {"activity": "Team leadership", "percent": 10}]'::jsonb,
        '[{"tool": "AI Executive Panels", "proficiency": "Expert"}, {"tool": "Enterprise Analytics", "proficiency": "Expert"}, {"tool": "Board Tools", "proficiency": "Expert"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'AI is how medical affairs becomes a strategic function, not just scientific support.',
            'I can now bring board-level insights that used to take consulting firms months.',
            'The VP who masters AI synthesis will define medical affairs for the industry.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Enterprise-wide portfolio'],
        true, 0.95, 'Data Agent Team'
    ) RETURNING id INTO v_orchestrator_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_orchestrator_id, 10, 9, 10, 10, 8, 9, 56, 'Ideal+ - highest value persona with enterprise budget and transformation mandate');

    -- VP MEDICAL AFFAIRS LEARNER
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-VPMA-LEARNER',
        'Dr. Jonathan Harris - VP Medical Affairs Learner',
        'LEARNER',
        v_role_id,
        'VP Medical Affairs',
        'A newly promoted VP who rose through scientific excellence but feels behind on AI transformation. Concerned that AI knowledge gap could undermine credibility at the executive level. Needs discrete, VP-appropriate learning path.',
        '46-54',
        'VP',
        'MD with 16 years industry experience, recently promoted to VP',
        'Medical Affairs Leadership',
        'Medical Affairs',
        'global',
        '["Learn AI at VP level without losing credibility", "Catch up with AI-native peers", "Lead AI transformation despite knowledge gap", "Build AI strategy I actually understand"]'::jsonb,
        '["Expected to lead AI transformation I dont understand", "Board asking AI questions I cant answer", "Peers seem more AI-savvy", "No VP-level AI training available"]'::jsonb,
        '["Succeeding as VP", "Not being exposed as behind", "Eventually leading AI confidently", "Protecting reputation"]'::jsonb,
        '["Feeling like an imposter on AI", "Training designed for junior staff", "No safe space to admit gaps at VP level"]'::jsonb,
        '[{"activity": "Executive leadership", "percent": 30}, {"activity": "Private AI learning", "percent": 10}, {"activity": "Team management", "percent": 25}, {"activity": "Cross-functional executive work", "percent": 25}, {"activity": "External engagement", "percent": 10}]'::jsonb,
        '[{"tool": "Executive Tools", "proficiency": "Expert"}, {"tool": "AI Tools", "proficiency": "Beginner"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'At the VP level, you cant admit you dont know something. But I need to learn AI.',
            'The board is asking about AI strategy and I am not confident in my answers.',
            'I need a way to learn this without anyone knowing I am starting from basics.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Immunology', 'Cardiovascular'],
        true, 0.85, 'Data Agent Team'
    ) RETURNING id INTO v_learner_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_learner_id, 6, 8, 5, 7, 9, 6, 41, 'High - VP with high emotional stakes, needs discrete executive onboarding');

    -- VP MEDICAL AFFAIRS SKEPTIC
    INSERT INTO personas (
        unique_id, persona_name, persona_type, source_role_id, title, description,
        age_range, experience_level, education_level, department, function_area, geographic_scope,
        goals, challenges, motivations, frustrations,
        daily_activities, tools_used, skills, competencies, success_metrics,
        sample_quotes, gxp_requirements, therapeutic_areas,
        is_active, data_quality_score, created_by
    ) VALUES (
        'PERSONA-VPMA-SKEPTIC',
        'Dr. Thomas Wright - VP Medical Affairs Skeptic',
        'SKEPTIC',
        v_role_id,
        'VP Medical Affairs',
        'A veteran VP who has seen many technology transformations fail to deliver. Fiduciary responsibility to the board makes him extremely cautious about AI investments. Requires rigorous ROI proof and risk mitigation before any AI adoption.',
        '55-62',
        'VP',
        'MD with 25+ years industry experience, multiple VP roles',
        'Medical Affairs Leadership',
        'Medical Affairs',
        'global',
        '["Protect organization from AI risks", "Ensure AI investments deliver proven ROI", "Establish enterprise AI governance", "Be the voice of fiduciary responsibility"]'::jsonb,
        '["Pressure to adopt AI without proven ROI", "Board fascination with AI hype", "Vendor overselling", "Regulatory uncertainty on AI in pharma"]'::jsonb,
        '["Protecting shareholder value", "Prudent leadership", "Learning from past tech failures", "Evidence-based decisions"]'::jsonb,
        '["Being labeled as blocking progress", "AI hype drowning out substance", "No AI vendors meeting enterprise standards"]'::jsonb,
        '[{"activity": "Executive leadership", "percent": 30}, {"activity": "AI investment review", "percent": 15}, {"activity": "Governance and risk", "percent": 15}, {"activity": "Board preparation", "percent": 20}, {"activity": "External engagement", "percent": 20}]'::jsonb,
        '[{"tool": "Executive Tools", "proficiency": "Expert"}, {"tool": "Risk Assessment", "proficiency": "Expert"}, {"tool": "AI Tools", "proficiency": "Evaluating"}]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
        ARRAY[
            'I have a fiduciary duty to shareholders. AI investments need to prove ROI.',
            'Ive seen three digital transformations fail. Show me why AI is different.',
            'Until I see regulatory clarity on AI in pharma, I am cautious about enterprise adoption.'
        ],
        '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
        ARRAY['Enterprise-wide'],
        true, 0.88, 'Data Agent Team'
    ) RETURNING id INTO v_skeptic_id;

    INSERT INTO persona_vpanes_scoring (persona_id, visibility_score, pain_score, actions_score, needs_score, emotions_score, scenarios_score, total_score, notes)
    VALUES (v_skeptic_id, 9, 5, 2, 9, 4, 8, 37, 'High - VP gatekeeper with budget authority, essential for enterprise deals');

    RAISE NOTICE 'Created 4 MECE personas for VP Medical Affairs role';
END $$;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Check persona count per role (should be 4 each)
-- SELECT
--     r.name as role_name,
--     COUNT(p.id) as persona_count,
--     ARRAY_AGG(p.persona_type ORDER BY p.persona_type) as archetypes
-- FROM org_roles r
-- LEFT JOIN personas p ON p.source_role_id = r.id
-- WHERE p.is_active = true
-- GROUP BY r.id, r.name
-- HAVING COUNT(p.id) != 4;

-- Check VPANES scores by archetype
-- SELECT
--     p.persona_type as archetype,
--     p.persona_name,
--     v.total_score,
--     CASE
--         WHEN v.total_score >= 46 THEN 'Ideal'
--         WHEN v.total_score >= 31 THEN 'High'
--         WHEN v.total_score >= 16 THEN 'Medium'
--         ELSE 'Low'
--     END as priority
-- FROM personas p
-- LEFT JOIN persona_vpanes_scoring v ON v.persona_id = p.id
-- WHERE p.is_active = true
-- ORDER BY v.total_score DESC NULLS LAST;

-- Summary by archetype
-- SELECT
--     persona_type as archetype,
--     COUNT(*) as count,
--     ROUND(AVG(v.total_score), 1) as avg_vpanes
-- FROM personas p
-- LEFT JOIN persona_vpanes_scoring v ON v.persona_id = p.id
-- GROUP BY persona_type
-- ORDER BY avg_vpanes DESC;
