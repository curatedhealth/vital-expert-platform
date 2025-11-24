-- ============================================================================
-- VITAL Platform: Fully Normalized Persona Database Schema
-- Version: 4.0 (Gold Standard)
-- Date: 2025-11-20
-- Purpose: Dual-Purpose Persona Intelligence System
-- Constraint: NO JSONB - All data fully normalized
-- ============================================================================

-- ============================================================================
-- SECTION 1: CORE ENUMERATIONS
-- ============================================================================

CREATE TYPE archetype_type AS ENUM (
    'AUTOMATOR',      -- High AI maturity + Routine work
    'ORCHESTRATOR',   -- High AI maturity + Strategic work
    'LEARNER',        -- Low AI maturity + Routine work
    'SKEPTIC'         -- Low AI maturity + Strategic work
);

CREATE TYPE seniority_level AS ENUM (
    'entry',
    'mid',
    'senior',
    'director',
    'executive',
    'c_suite'
);

CREATE TYPE business_function AS ENUM (
    'MEDICAL_AFFAIRS',
    'SALES',
    'MARKETING',
    'FINANCE',
    'HR',
    'ENGINEERING',
    'PRODUCT',
    'OPERATIONS',
    'CUSTOMER_SUCCESS',
    'LEGAL',
    'REGULATORY',
    'SUPPLY_CHAIN',
    'R_AND_D',
    'MARKET_ACCESS',
    'IT',
    'CORPORATE_STRATEGY'
);

CREATE TYPE work_pattern AS ENUM (
    'routine',        -- Repetitive, predictable tasks
    'strategic',      -- Variable, cross-functional, complex
    'mixed'           -- Combination of both
);

CREATE TYPE technology_adoption AS ENUM (
    'laggard',
    'late_majority',
    'early_majority',
    'early_adopter',
    'innovator'
);

CREATE TYPE risk_tolerance AS ENUM (
    'very_conservative',
    'conservative',
    'moderate',
    'aggressive'
);

CREATE TYPE change_readiness AS ENUM (
    'low',
    'moderate',
    'high'
);

CREATE TYPE budget_authority_level AS ENUM (
    'none',
    'limited',          -- < $100K
    'moderate',         -- $100K - $1M
    'significant',      -- $1M - $5M
    'high'              -- > $5M
);

CREATE TYPE geographic_scope AS ENUM (
    'local',
    'country',
    'regional',
    'global'
);

CREATE TYPE decision_making_style AS ENUM (
    'data_driven',
    'analytical',
    'collaborative',
    'relationship_driven',
    'authoritative',
    'cautious',
    'intuitive'
);

CREATE TYPE learning_preference AS ENUM (
    'hands_on',
    'guided',
    'self_directed',
    'visual',
    'structured',
    'exploratory'
);

CREATE TYPE collaboration_style AS ENUM (
    'collaborative',
    'independent',
    'delegator',
    'facilitator',
    'director'
);

CREATE TYPE communication_preference AS ENUM (
    'visual',
    'written',
    'verbal',
    'data',
    'narrative'
);

CREATE TYPE work_location_model AS ENUM (
    'remote',
    'hybrid',
    'office',
    'field'
);

CREATE TYPE role_category AS ENUM (
    'individual_contributor',
    'team_lead',
    'manager',
    'director',
    'leadership',
    'executive'
);

CREATE TYPE service_layer AS ENUM (
    'ASK_EXPERT',       -- L1: Single-agent Q&A
    'ASK_PANEL',        -- L2: Multi-agent reasoning
    'WORKFLOWS',        -- L3: Multi-step automation
    'SOLUTION_BUILDER'  -- L4: Integrated solutions
);

-- ============================================================================
-- SECTION 2: CORE PERSONA TABLE
-- ============================================================================

CREATE TABLE personas (
    -- Primary Key
    persona_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core Profile
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    tagline VARCHAR(500),

    -- Archetype Assignment
    archetype archetype_type NOT NULL,
    archetype_confidence DECIMAL(5,4) CHECK (archetype_confidence >= 0 AND archetype_confidence <= 1),
    archetype_assigned_at TIMESTAMP WITH TIME ZONE,
    archetype_requires_review BOOLEAN DEFAULT FALSE,

    -- Business Context
    business_function business_function NOT NULL,
    department VARCHAR(255),
    role_category role_category NOT NULL,
    role_slug VARCHAR(255) NOT NULL,

    -- Professional Context
    seniority_level seniority_level NOT NULL,
    years_of_experience INTEGER CHECK (years_of_experience >= 0),
    team_size_typical INTEGER CHECK (team_size_typical >= 0),
    direct_reports INTEGER CHECK (direct_reports >= 0),
    budget_authority DECIMAL(15,2) CHECK (budget_authority >= 0),
    budget_authority_level budget_authority_level,

    -- Work Patterns
    work_pattern work_pattern NOT NULL,
    work_complexity_score DECIMAL(5,2) CHECK (work_complexity_score >= 0 AND work_complexity_score <= 100),

    -- Behavioral Attributes
    technology_adoption technology_adoption NOT NULL,
    risk_tolerance risk_tolerance NOT NULL,
    change_readiness change_readiness NOT NULL,
    ai_maturity_score DECIMAL(5,2) CHECK (ai_maturity_score >= 0 AND ai_maturity_score <= 100),

    -- Preferences
    decision_making_style decision_making_style,
    learning_preference learning_preference,
    collaboration_style collaboration_style,
    communication_preference communication_preference,

    -- Geographic & Location
    geographic_scope geographic_scope,
    work_location_model work_location_model,

    -- Organizational Context
    typical_org_size VARCHAR(100),

    -- Status & Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    version INTEGER DEFAULT 1,

    -- Indexes
    CONSTRAINT valid_team_size CHECK (direct_reports <= team_size_typical),
    CONSTRAINT valid_archetype_scores CHECK (
        work_complexity_score IS NOT NULL AND
        ai_maturity_score IS NOT NULL
    )
);

-- Indexes for common queries
CREATE INDEX idx_personas_archetype ON personas(archetype);
CREATE INDEX idx_personas_function ON personas(business_function);
CREATE INDEX idx_personas_seniority ON personas(seniority_level);
CREATE INDEX idx_personas_role_slug ON personas(role_slug);
CREATE INDEX idx_personas_active ON personas(is_active);
CREATE INDEX idx_personas_work_pattern ON personas(work_pattern);
CREATE INDEX idx_personas_slug ON personas(slug);

-- Full-text search
CREATE INDEX idx_personas_name_gin ON personas USING gin(to_tsvector('english', name || ' ' || title || ' ' || COALESCE(tagline, '')));

COMMENT ON TABLE personas IS 'Core persona table - each row represents one persona variant (role + archetype combination)';
COMMENT ON COLUMN personas.archetype IS 'One of 4 universal archetypes based on AI maturity and work complexity';
COMMENT ON COLUMN personas.work_complexity_score IS '0-100 score: <50 = routine, >=50 = strategic';
COMMENT ON COLUMN personas.ai_maturity_score IS '0-100 score: <50 = low maturity, >=50 = high maturity';

-- ============================================================================
-- SECTION 3: PAIN POINTS
-- ============================================================================

CREATE TABLE persona_pain_points (
    pain_point_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    -- Pain Point Content
    pain_point_text TEXT NOT NULL,
    pain_category VARCHAR(100),
    severity VARCHAR(50),  -- 'low', 'medium', 'high', 'critical'
    frequency VARCHAR(50), -- 'rare', 'occasional', 'frequent', 'constant'

    -- Impact
    time_impact_hours_per_week DECIMAL(8,2),
    cost_impact_annual DECIMAL(15,2),
    quality_impact_score DECIMAL(3,2) CHECK (quality_impact_score >= 0 AND quality_impact_score <= 10),

    -- Classification
    is_ai_addressable BOOLEAN DEFAULT TRUE,
    addressable_via_service_layer service_layer,

    -- Ordering
    display_order INTEGER,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pain_points_persona ON persona_pain_points(persona_id);
CREATE INDEX idx_pain_points_severity ON persona_pain_points(severity);
CREATE INDEX idx_pain_points_category ON persona_pain_points(pain_category);

COMMENT ON TABLE persona_pain_points IS 'Normalized pain points - one row per pain point per persona';

-- ============================================================================
-- SECTION 4: GOALS
-- ============================================================================

CREATE TABLE persona_goals (
    goal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    -- Goal Content
    goal_text TEXT NOT NULL,
    goal_category VARCHAR(100),
    priority VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
    time_horizon VARCHAR(50), -- 'immediate', 'short_term', 'medium_term', 'long_term'

    -- Measurability
    is_measurable BOOLEAN DEFAULT FALSE,
    measurement_metric VARCHAR(255),
    target_value VARCHAR(255),

    -- AI Relevance
    ai_can_assist BOOLEAN DEFAULT TRUE,
    assistance_type VARCHAR(100), -- 'automation', 'augmentation', 'insight', 'validation'

    -- Ordering
    display_order INTEGER,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_goals_persona ON persona_goals(persona_id);
CREATE INDEX idx_goals_priority ON persona_goals(priority);
CREATE INDEX idx_goals_category ON persona_goals(goal_category);

COMMENT ON TABLE persona_goals IS 'Normalized goals - one row per goal per persona';

-- ============================================================================
-- SECTION 5: CHALLENGES
-- ============================================================================

CREATE TABLE persona_challenges (
    challenge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    -- Challenge Content
    challenge_text TEXT NOT NULL,
    challenge_category VARCHAR(100),
    difficulty_level VARCHAR(50), -- 'easy', 'moderate', 'difficult', 'very_difficult'

    -- Context
    is_technical BOOLEAN DEFAULT FALSE,
    is_organizational BOOLEAN DEFAULT FALSE,
    is_cultural BOOLEAN DEFAULT FALSE,

    -- Resolution
    ai_solution_exists BOOLEAN DEFAULT FALSE,
    requires_human_judgment BOOLEAN DEFAULT FALSE,

    -- Ordering
    display_order INTEGER,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_challenges_persona ON persona_challenges(persona_id);
CREATE INDEX idx_challenges_difficulty ON persona_challenges(difficulty_level);
CREATE INDEX idx_challenges_category ON persona_challenges(challenge_category);

COMMENT ON TABLE persona_challenges IS 'Normalized challenges - one row per challenge per persona';

-- ============================================================================
-- SECTION 6: WEEK-IN-LIFE (TIME ALLOCATION)
-- ============================================================================

CREATE TABLE persona_week_in_life (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    -- Time Block
    day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7), -- 1=Monday, 7=Sunday
    time_of_day VARCHAR(50), -- 'morning', 'midday', 'afternoon', 'evening'
    duration_hours DECIMAL(4,2) CHECK (duration_hours > 0),

    -- Activity
    activity_name VARCHAR(255) NOT NULL,
    activity_category VARCHAR(100), -- 'meeting', 'focus_work', 'admin', 'travel', 'breaks'
    activity_description TEXT,

    -- Classification
    is_routine BOOLEAN DEFAULT FALSE,
    is_strategic BOOLEAN DEFAULT FALSE,
    is_collaborative BOOLEAN DEFAULT FALSE,
    automation_potential VARCHAR(50), -- 'none', 'low', 'medium', 'high'

    -- Participants
    involves_stakeholders BOOLEAN DEFAULT FALSE,
    stakeholder_count INTEGER,

    -- Ordering
    display_order INTEGER,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_week_in_life_persona ON persona_week_in_life(persona_id);
CREATE INDEX idx_week_in_life_day ON persona_week_in_life(day_of_week);
CREATE INDEX idx_week_in_life_category ON persona_week_in_life(activity_category);

COMMENT ON TABLE persona_week_in_life IS 'Normalized week-in-life entries - temporal task distribution';

-- ============================================================================
-- SECTION 7: INTERNAL STAKEHOLDERS
-- ============================================================================

CREATE TABLE persona_stakeholders (
    stakeholder_relationship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    -- Stakeholder Identity
    stakeholder_role VARCHAR(255) NOT NULL,
    stakeholder_function business_function,
    stakeholder_seniority seniority_level,

    -- Relationship
    relationship_type VARCHAR(100), -- 'reports_to', 'manages', 'collaborates_with', 'influences', 'consults'
    interaction_frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'quarterly', 'adhoc'
    communication_channel VARCHAR(100), -- 'email', 'meetings', 'slack', 'formal_reports'

    -- Cross-Functional
    is_cross_functional BOOLEAN DEFAULT FALSE,
    dependency_type VARCHAR(100), -- 'approval', 'information', 'collaboration', 'escalation'

    -- Importance
    criticality VARCHAR(50), -- 'low', 'medium', 'high', 'critical'

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(persona_id, stakeholder_role, relationship_type)
);

CREATE INDEX idx_stakeholders_persona ON persona_stakeholders(persona_id);
CREATE INDEX idx_stakeholders_function ON persona_stakeholders(stakeholder_function);
CREATE INDEX idx_stakeholders_cross_functional ON persona_stakeholders(is_cross_functional);
CREATE INDEX idx_stakeholders_criticality ON persona_stakeholders(criticality);

COMMENT ON TABLE persona_stakeholders IS 'Normalized stakeholder relationships - one row per relationship';
COMMENT ON COLUMN persona_stakeholders.is_cross_functional IS 'TRUE if stakeholder is in different function than persona';

-- ============================================================================
-- SECTION 8: KEY RESPONSIBILITIES
-- ============================================================================

CREATE TABLE persona_responsibilities (
    responsibility_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    -- Responsibility Content
    responsibility_text TEXT NOT NULL,
    responsibility_category VARCHAR(100),

    -- Characteristics
    frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'adhoc'
    time_allocation_percent DECIMAL(5,2) CHECK (time_allocation_percent >= 0 AND time_allocation_percent <= 100),

    -- Complexity
    complexity_level VARCHAR(50), -- 'low', 'moderate', 'high', 'very_high'
    requires_cross_functional BOOLEAN DEFAULT FALSE,
    requires_deep_expertise BOOLEAN DEFAULT FALSE,

    -- AI Suitability
    automation_potential VARCHAR(50), -- 'none', 'low', 'medium', 'high', 'very_high'
    augmentation_potential VARCHAR(50), -- 'none', 'low', 'medium', 'high', 'very_high'

    -- Ordering
    display_order INTEGER,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_responsibilities_persona ON persona_responsibilities(persona_id);
CREATE INDEX idx_responsibilities_category ON persona_responsibilities(responsibility_category);
CREATE INDEX idx_responsibilities_frequency ON persona_responsibilities(frequency);
CREATE INDEX idx_responsibilities_automation ON persona_responsibilities(automation_potential);

COMMENT ON TABLE persona_responsibilities IS 'Normalized key responsibilities - one row per responsibility';

-- ============================================================================
-- SECTION 9: SKILLS & COMPETENCIES
-- ============================================================================

CREATE TABLE persona_skills (
    skill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    -- Skill Definition
    skill_name VARCHAR(255) NOT NULL,
    skill_category VARCHAR(100), -- 'technical', 'domain', 'soft_skill', 'tool'
    skill_subcategory VARCHAR(100),

    -- Proficiency
    proficiency_level VARCHAR(50), -- 'novice', 'beginner', 'intermediate', 'advanced', 'expert'
    years_of_experience INTEGER,

    -- Importance
    importance_to_role VARCHAR(50), -- 'nice_to_have', 'useful', 'important', 'critical'

    -- Development
    actively_developing BOOLEAN DEFAULT FALSE,
    development_priority VARCHAR(50), -- 'low', 'medium', 'high'

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(persona_id, skill_name)
);

CREATE INDEX idx_skills_persona ON persona_skills(persona_id);
CREATE INDEX idx_skills_category ON persona_skills(skill_category);
CREATE INDEX idx_skills_proficiency ON persona_skills(proficiency_level);

COMMENT ON TABLE persona_skills IS 'Normalized skills and competencies';

-- ============================================================================
-- SECTION 10: MOTIVATIONS
-- ============================================================================

CREATE TABLE persona_motivations (
    motivation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    -- Motivation Content
    motivation_text TEXT NOT NULL,
    motivation_type VARCHAR(100), -- 'intrinsic', 'extrinsic', 'social', 'achievement'
    motivation_category VARCHAR(100), -- 'efficiency', 'mastery', 'impact', 'recognition', 'growth'

    -- Strength
    strength VARCHAR(50), -- 'weak', 'moderate', 'strong', 'very_strong'

    -- AI Alignment
    ai_can_support BOOLEAN DEFAULT TRUE,
    support_mechanism VARCHAR(255), -- How AI can support this motivation

    -- Ordering
    display_order INTEGER,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_motivations_persona ON persona_motivations(persona_id);
CREATE INDEX idx_motivations_type ON persona_motivations(motivation_type);
CREATE INDEX idx_motivations_category ON persona_motivations(motivation_category);

COMMENT ON TABLE persona_motivations IS 'Normalized motivational drivers';

-- ============================================================================
-- SECTION 11: FRUSTRATIONS
-- ============================================================================

CREATE TABLE persona_frustrations (
    frustration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    -- Frustration Content
    frustration_text TEXT NOT NULL,
    frustration_category VARCHAR(100), -- 'process', 'tool', 'people', 'information', 'time'

    -- Impact
    impact_severity VARCHAR(50), -- 'minor', 'moderate', 'major', 'severe'
    impact_frequency VARCHAR(50), -- 'rare', 'occasional', 'frequent', 'constant'

    -- Resolution
    has_workaround BOOLEAN DEFAULT FALSE,
    workaround_description TEXT,
    ai_can_resolve BOOLEAN DEFAULT FALSE,

    -- Ordering
    display_order INTEGER,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_frustrations_persona ON persona_frustrations(persona_id);
CREATE INDEX idx_frustrations_category ON persona_frustrations(frustration_category);
CREATE INDEX idx_frustrations_severity ON persona_frustrations(impact_severity);

COMMENT ON TABLE persona_frustrations IS 'Normalized frustrations and friction points';

-- ============================================================================
-- SECTION 12: SERVICE LAYER PREFERENCES
-- ============================================================================

CREATE TABLE persona_service_preferences (
    preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,
    service_layer service_layer NOT NULL,

    -- Usage Patterns
    expected_usage_percentage DECIMAL(5,2) CHECK (expected_usage_percentage >= 0 AND expected_usage_percentage <= 100),
    usage_frequency VARCHAR(50), -- 'never', 'rarely', 'occasionally', 'regularly', 'constantly'

    -- Preference
    preference_score DECIMAL(3,2) CHECK (preference_score >= 0 AND preference_score <= 10),

    -- Configuration
    automation_level VARCHAR(50), -- 'none', 'low', 'medium', 'high', 'maximum'
    explanation_depth VARCHAR(50), -- 'minimal', 'moderate', 'detailed', 'comprehensive'
    citation_density VARCHAR(50), -- 'none', 'low', 'medium', 'high', 'very_high'
    proactivity_level VARCHAR(50), -- 'passive', 'low', 'moderate', 'high', 'very_high'

    -- HITL Settings
    hitl_frequency VARCHAR(50), -- 'never', 'final_only', 'key_steps', 'frequent', 'every_step'
    requires_approval BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(persona_id, service_layer)
);

CREATE INDEX idx_service_prefs_persona ON persona_service_preferences(persona_id);
CREATE INDEX idx_service_prefs_layer ON persona_service_preferences(service_layer);

COMMENT ON TABLE persona_service_preferences IS 'How each persona prefers to use each service layer';

-- ============================================================================
-- SECTION 13: JTBD (JOBS-TO-BE-DONE) MASTER TABLE
-- ============================================================================

CREATE TABLE jtbds (
    jtbd_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- JTBD Structure: "When [situation], I want to [motivation] so I can [outcome]"
    situation_context TEXT NOT NULL,
    motivation_goal TEXT NOT NULL,
    expected_outcome TEXT NOT NULL,

    -- Full Statement
    full_statement TEXT NOT NULL,

    -- Classification
    jtbd_category VARCHAR(100), -- 'information_gathering', 'analysis', 'decision_making', 'execution', etc.
    jtbd_subcategory VARCHAR(100),

    -- Universality
    is_cross_functional BOOLEAN DEFAULT TRUE,
    applicable_functions business_function[], -- Array of functions where this JTBD applies

    -- Complexity
    complexity_level VARCHAR(50), -- 'simple', 'moderate', 'complex', 'very_complex'

    -- AI Suitability
    ai_addressable BOOLEAN DEFAULT TRUE,
    best_service_layer service_layer,
    automation_potential VARCHAR(50),
    augmentation_potential VARCHAR(50),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_jtbds_category ON jtbds(jtbd_category);
CREATE INDEX idx_jtbds_complexity ON jtbds(complexity_level);
CREATE INDEX idx_jtbds_service_layer ON jtbds(best_service_layer);
CREATE INDEX idx_jtbds_active ON jtbds(is_active);

COMMENT ON TABLE jtbds IS 'Master JTBD library - reusable across personas and functions';

-- ============================================================================
-- SECTION 14: PERSONA-JTBD MAPPING
-- ============================================================================

CREATE TABLE persona_jtbds (
    mapping_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,
    jtbd_id UUID NOT NULL REFERENCES jtbds(jtbd_id) ON DELETE CASCADE,

    -- Priority for this persona
    priority_rank INTEGER, -- 1 = highest priority
    priority_level VARCHAR(50), -- 'low', 'medium', 'high', 'critical'

    -- Frequency
    frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'quarterly', 'adhoc'
    time_spent_per_occurrence_hours DECIMAL(6,2),

    -- ODI Metrics (Outcome-Driven Innovation)
    importance_score DECIMAL(3,2) CHECK (importance_score >= 0 AND importance_score <= 10),
    satisfaction_score DECIMAL(3,2) CHECK (satisfaction_score >= 0 AND satisfaction_score <= 10),
    opportunity_score DECIMAL(5,2), -- Calculated: importance + (importance - satisfaction)

    -- Archetype Modifiers
    -- Different archetypes weight outcomes differently
    automator_importance_modifier DECIMAL(3,2) DEFAULT 1.0,
    orchestrator_importance_modifier DECIMAL(3,2) DEFAULT 1.0,
    learner_importance_modifier DECIMAL(3,2) DEFAULT 1.0,
    skeptic_importance_modifier DECIMAL(3,2) DEFAULT 1.0,

    -- Context
    context_notes TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(persona_id, jtbd_id)
);

CREATE INDEX idx_persona_jtbds_persona ON persona_jtbds(persona_id);
CREATE INDEX idx_persona_jtbds_jtbd ON persona_jtbds(jtbd_id);
CREATE INDEX idx_persona_jtbds_priority ON persona_jtbds(priority_level);
CREATE INDEX idx_persona_jtbds_opportunity ON persona_jtbds(opportunity_score DESC);

COMMENT ON TABLE persona_jtbds IS 'Many-to-many mapping of personas to JTBDs with context and priorities';

-- ============================================================================
-- SECTION 15: JTBD OUTCOMES
-- ============================================================================

CREATE TABLE jtbd_outcomes (
    outcome_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id UUID NOT NULL REFERENCES jtbds(jtbd_id) ON DELETE CASCADE,

    -- Outcome Definition
    outcome_description TEXT NOT NULL,
    outcome_category VARCHAR(100), -- 'speed', 'accuracy', 'effort', 'cost', 'quality', 'risk', 'insight'

    -- Measurement
    is_measurable BOOLEAN DEFAULT TRUE,
    measurement_metric VARCHAR(255),
    measurement_unit VARCHAR(50),

    -- Importance by Archetype
    -- Different archetypes weight outcomes differently
    automator_weight DECIMAL(3,2) DEFAULT 1.0 CHECK (automator_weight >= 0 AND automator_weight <= 10),
    orchestrator_weight DECIMAL(3,2) DEFAULT 1.0 CHECK (orchestrator_weight >= 0 AND orchestrator_weight <= 10),
    learner_weight DECIMAL(3,2) DEFAULT 1.0 CHECK (learner_weight >= 0 AND learner_weight <= 10),
    skeptic_weight DECIMAL(3,2) DEFAULT 1.0 CHECK (skeptic_weight >= 0 AND skeptic_weight <= 10),

    -- AI Impact
    ai_can_improve BOOLEAN DEFAULT TRUE,
    improvement_mechanism VARCHAR(255),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_outcomes_jtbd ON jtbd_outcomes(jtbd_id);
CREATE INDEX idx_outcomes_category ON jtbd_outcomes(outcome_category);

COMMENT ON TABLE jtbd_outcomes IS 'Desired outcomes for each JTBD, with archetype-specific importance weights';

-- ============================================================================
-- SECTION 16: OPPORTUNITIES
-- ============================================================================

CREATE TABLE opportunities (
    opportunity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Opportunity Definition
    opportunity_name VARCHAR(255) NOT NULL,
    opportunity_description TEXT NOT NULL,
    opportunity_category VARCHAR(100), -- 'automation', 'augmentation', 'insight', 'validation', 'learning'

    -- Targeting
    target_archetype archetype_type,
    target_functions business_function[], -- Which functions benefit
    target_personas UUID[], -- Specific persona IDs

    -- Impact Scoring
    reach_score DECIMAL(5,2) CHECK (reach_score >= 0 AND reach_score <= 100), -- How many people affected
    impact_score DECIMAL(5,2) CHECK (impact_score >= 0 AND impact_score <= 100), -- ODI gap × business value
    feasibility_score DECIMAL(5,2) CHECK (feasibility_score >= 0 AND feasibility_score <= 100), -- Technical readiness
    adoption_readiness_score DECIMAL(5,2) CHECK (adoption_readiness_score >= 0 AND adoption_readiness_score <= 100), -- % Automators/Orchestrators

    -- Overall Score: (Reach × Impact × Feasibility × Adoption) ^ 0.25
    overall_score DECIMAL(5,2),

    -- Solution
    recommended_service_layer service_layer,
    solution_description TEXT,

    -- Value
    estimated_time_savings_hours_per_week DECIMAL(8,2),
    estimated_annual_value_usd DECIMAL(15,2),

    -- Status
    status VARCHAR(50), -- 'identified', 'evaluated', 'approved', 'in_development', 'deployed', 'rejected'
    priority VARCHAR(50), -- 'p0', 'p1', 'p2', 'p3', 'backlog'

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    assigned_to UUID,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_opportunities_archetype ON opportunities(target_archetype);
CREATE INDEX idx_opportunities_score ON opportunities(overall_score DESC);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_priority ON opportunities(priority);

COMMENT ON TABLE opportunities IS 'AI opportunities discovered through persona and JTBD analysis';

-- ============================================================================
-- SECTION 17: OPPORTUNITY-JTBD MAPPING
-- ============================================================================

CREATE TABLE opportunity_jtbds (
    mapping_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
    jtbd_id UUID NOT NULL REFERENCES jtbds(jtbd_id) ON DELETE CASCADE,

    -- Relationship
    addresses_fully BOOLEAN DEFAULT FALSE,
    addresses_partially BOOLEAN DEFAULT TRUE,
    improvement_percentage DECIMAL(5,2), -- Expected improvement (0-100%)

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(opportunity_id, jtbd_id)
);

CREATE INDEX idx_opp_jtbds_opportunity ON opportunity_jtbds(opportunity_id);
CREATE INDEX idx_opp_jtbds_jtbd ON opportunity_jtbds(jtbd_id);

COMMENT ON TABLE opportunity_jtbds IS 'Maps opportunities to the JTBDs they address';

-- ============================================================================
-- SECTION 18: ARCHETYPE MIGRATION TRACKING
-- ============================================================================

CREATE TABLE archetype_migrations (
    migration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    -- Migration Details
    from_archetype archetype_type NOT NULL,
    to_archetype archetype_type NOT NULL,

    -- Prediction
    migration_probability DECIMAL(5,4) CHECK (migration_probability >= 0 AND migration_probability <= 1),
    predicted_timeline_months INTEGER,

    -- Signals
    behavior_change_score DECIMAL(5,2),
    feature_adoption_score DECIMAL(5,2),
    confidence_indicators_score DECIMAL(5,2),
    role_evolution_score DECIMAL(5,2),

    -- Status
    status VARCHAR(50), -- 'predicted', 'in_progress', 'completed', 'stalled'

    -- Actual Migration (if occurred)
    actual_migration_date TIMESTAMP WITH TIME ZONE,
    actual_timeline_months INTEGER,

    -- Enablers
    recommended_interventions TEXT[],

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_migrations_persona ON archetype_migrations(persona_id);
CREATE INDEX idx_migrations_from ON archetype_migrations(from_archetype);
CREATE INDEX idx_migrations_to ON archetype_migrations(to_archetype);
CREATE INDEX idx_migrations_status ON archetype_migrations(status);
CREATE INDEX idx_migrations_probability ON archetype_migrations(migration_probability DESC);

COMMENT ON TABLE archetype_migrations IS 'Tracks predicted and actual archetype migrations (e.g., Learner → Automator)';

-- ============================================================================
-- SECTION 19: FUNCTION-SPECIFIC ATTRIBUTES
-- ============================================================================

-- Medical Affairs Specific
CREATE TABLE persona_medical_affairs_attributes (
    attribute_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    therapeutic_area_primary VARCHAR(100),
    therapeutic_areas_secondary VARCHAR(100)[],
    medical_degree_type VARCHAR(100), -- 'MD', 'PhD', 'PharmD', 'MD_PhD'
    publication_count INTEGER,
    kol_network_size INTEGER,
    years_medical_affairs_experience INTEGER,
    regulatory_experience_years INTEGER,
    has_field_experience BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(persona_id)
);

-- Sales Specific
CREATE TABLE persona_sales_attributes (
    attribute_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    typical_deal_size_usd DECIMAL(15,2),
    sales_methodology VARCHAR(100), -- 'MEDDIC', 'Challenger', 'SPIN', 'Solution_Selling'
    quota_attainment_avg_percent DECIMAL(5,2),
    territory_type VARCHAR(100), -- 'geographic', 'vertical', 'account_based', 'product'
    customer_segment VARCHAR(100), -- 'enterprise', 'mid_market', 'smb'
    years_sales_experience INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(persona_id)
);

-- Finance Specific
CREATE TABLE persona_finance_attributes (
    attribute_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    accounting_certifications VARCHAR(100)[], -- ['CPA', 'CFA', 'CMA']
    financial_systems VARCHAR(100)[], -- ['SAP', 'Oracle', 'Workday']
    sox_compliance_experience BOOLEAN DEFAULT FALSE,
    years_finance_experience INTEGER,
    forecasting_accuracy_avg_percent DECIMAL(5,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(persona_id)
);

-- Marketing Specific
CREATE TABLE persona_marketing_attributes (
    attribute_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    channel_expertise VARCHAR(100)[], -- ['digital', 'events', 'content', 'social']
    campaign_types VARCHAR(100)[], -- ['demand_gen', 'brand', 'product_launch']
    analytics_proficiency_level VARCHAR(50), -- 'basic', 'intermediate', 'advanced', 'expert'
    creative_vs_analytical_balance VARCHAR(50), -- 'creative', 'balanced', 'analytical'
    years_marketing_experience INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(persona_id)
);

-- Engineering Specific
CREATE TABLE persona_engineering_attributes (
    attribute_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    programming_languages VARCHAR(100)[], -- ['Python', 'TypeScript', 'Go', 'Rust']
    architecture_patterns VARCHAR(100)[], -- ['microservices', 'event_driven', 'serverless']
    platform_expertise VARCHAR(100)[], -- ['AWS', 'Azure', 'GCP', 'Kubernetes']
    open_source_contributions INTEGER,
    years_engineering_experience INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(persona_id)
);

-- ============================================================================
-- SECTION 20: AUDIT & HISTORY
-- ============================================================================

CREATE TABLE persona_audit_log (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(persona_id) ON DELETE CASCADE,

    -- Change Details
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'archetype_changed'
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Old vs New Values (stored as separate columns for key fields)
    old_archetype archetype_type,
    new_archetype archetype_type,
    old_work_complexity_score DECIMAL(5,2),
    new_work_complexity_score DECIMAL(5,2),
    old_ai_maturity_score DECIMAL(5,2),
    new_ai_maturity_score DECIMAL(5,2),

    -- Full change record
    change_description TEXT,

    -- Context
    change_reason VARCHAR(255),
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_audit_persona ON persona_audit_log(persona_id);
CREATE INDEX idx_audit_timestamp ON persona_audit_log(changed_at DESC);
CREATE INDEX idx_audit_action ON persona_audit_log(action);

COMMENT ON TABLE persona_audit_log IS 'Audit trail for all persona changes';

-- ============================================================================
-- SECTION 21: ANALYTICS & AGGREGATIONS
-- ============================================================================

-- Materialized view for quick archetype distribution queries
CREATE MATERIALIZED VIEW archetype_distribution_by_function AS
SELECT
    business_function,
    archetype,
    COUNT(*) as persona_count,
    ROUND(AVG(ai_maturity_score), 2) as avg_ai_maturity,
    ROUND(AVG(work_complexity_score), 2) as avg_work_complexity,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY business_function), 2) as percentage_of_function
FROM personas
WHERE is_active = TRUE
GROUP BY business_function, archetype;

CREATE UNIQUE INDEX ON archetype_distribution_by_function(business_function, archetype);

-- Materialized view for opportunity scoring
CREATE MATERIALIZED VIEW top_opportunities_by_archetype AS
SELECT
    o.opportunity_id,
    o.opportunity_name,
    o.target_archetype,
    o.overall_score,
    o.reach_score,
    o.impact_score,
    o.feasibility_score,
    o.adoption_readiness_score,
    o.estimated_annual_value_usd,
    o.status,
    o.priority,
    COUNT(DISTINCT pj.persona_id) as affected_persona_count
FROM opportunities o
LEFT JOIN opportunity_jtbds oj ON o.opportunity_id = oj.opportunity_id
LEFT JOIN persona_jtbds pj ON oj.jtbd_id = pj.jtbd_id
WHERE o.is_active = TRUE
GROUP BY o.opportunity_id, o.opportunity_name, o.target_archetype, o.overall_score,
         o.reach_score, o.impact_score, o.feasibility_score, o.adoption_readiness_score,
         o.estimated_annual_value_usd, o.status, o.priority
ORDER BY o.overall_score DESC;

CREATE UNIQUE INDEX ON top_opportunities_by_archetype(opportunity_id);

-- ============================================================================
-- SECTION 22: HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all relevant tables
CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pain_points_updated_at BEFORE UPDATE ON persona_pain_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON persona_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON persona_challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate opportunity score
CREATE OR REPLACE FUNCTION calculate_opportunity_score(
    p_reach DECIMAL,
    p_impact DECIMAL,
    p_feasibility DECIMAL,
    p_adoption DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN POWER(p_reach * p_impact * p_feasibility * p_adoption, 0.25);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate ODI opportunity score for JTBD
CREATE OR REPLACE FUNCTION calculate_odi_opportunity(
    p_importance DECIMAL,
    p_satisfaction DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN p_importance + (p_importance - p_satisfaction);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-calculate opportunity scores
CREATE OR REPLACE FUNCTION auto_calculate_opportunity_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.overall_score := calculate_opportunity_score(
        NEW.reach_score,
        NEW.impact_score,
        NEW.feasibility_score,
        NEW.adoption_readiness_score
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_opportunity_score_trigger
    BEFORE INSERT OR UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_opportunity_score();

-- Trigger to auto-calculate ODI opportunity scores
CREATE OR REPLACE FUNCTION auto_calculate_odi_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.opportunity_score := calculate_odi_opportunity(
        NEW.importance_score,
        NEW.satisfaction_score
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_odi_score_trigger
    BEFORE INSERT OR UPDATE ON persona_jtbds
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_odi_score();

-- ============================================================================
-- SECTION 23: SAMPLE QUERIES
-- ============================================================================

-- Query 1: Get all personas for a specific archetype
COMMENT ON COLUMN personas.archetype IS 'Sample Query: SELECT * FROM personas WHERE archetype = ''AUTOMATOR'' AND is_active = TRUE;';

-- Query 2: Find cross-functional pain patterns
COMMENT ON TABLE persona_pain_points IS '
Sample Query to find shared pain points:
SELECT
    pp.pain_point_text,
    pp.pain_category,
    COUNT(DISTINCT p.business_function) as function_count,
    ARRAY_AGG(DISTINCT p.business_function) as affected_functions,
    COUNT(DISTINCT p.persona_id) as affected_persona_count
FROM persona_pain_points pp
JOIN personas p ON pp.persona_id = p.persona_id
WHERE p.is_active = TRUE
GROUP BY pp.pain_point_text, pp.pain_category
HAVING COUNT(DISTINCT p.business_function) > 1
ORDER BY function_count DESC, affected_persona_count DESC;
';

-- Query 3: Calculate department adoption readiness
COMMENT ON TABLE personas IS '
Sample Query for department adoption readiness:
SELECT
    business_function,
    COUNT(*) as total_personas,
    COUNT(*) FILTER (WHERE archetype = ''AUTOMATOR'') as automators,
    COUNT(*) FILTER (WHERE archetype = ''ORCHESTRATOR'') as orchestrators,
    COUNT(*) FILTER (WHERE archetype = ''LEARNER'') as learners,
    COUNT(*) FILTER (WHERE archetype = ''SKEPTIC'') as skeptics,
    ROUND(
        (COUNT(*) FILTER (WHERE archetype = ''AUTOMATOR'') * 1.0 +
         COUNT(*) FILTER (WHERE archetype = ''ORCHESTRATOR'') * 0.9 +
         COUNT(*) FILTER (WHERE archetype = ''LEARNER'') * 0.5 +
         COUNT(*) FILTER (WHERE archetype = ''SKEPTIC'') * 0.2) * 100.0 / COUNT(*),
        2
    ) as adoption_readiness_score
FROM personas
WHERE is_active = TRUE
GROUP BY business_function
ORDER BY adoption_readiness_score DESC;
';

-- ============================================================================
-- SECTION 24: REFRESH MATERIALIZED VIEWS
-- ============================================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_persona_analytics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY archetype_distribution_by_function;
    REFRESH MATERIALIZED VIEW CONCURRENTLY top_opportunities_by_archetype;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_persona_analytics IS 'Refresh all persona-related materialized views. Run daily or after bulk updates.';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Grant permissions (adjust as needed for your environment)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO vital_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO vital_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO vital_app_user;
