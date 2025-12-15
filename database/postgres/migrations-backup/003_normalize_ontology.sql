-- =============================================================================
-- VITAL Platform - Ontology Normalization Migration
-- =============================================================================
-- Converts JSONB arrays to properly normalized junction tables
-- Following Zero JSONB Policy for enterprise ontology
-- =============================================================================

-- =============================================================================
-- REFERENCE TABLES (Master Data - Reusable across entities)
-- =============================================================================

-- Goals reference table (shared by personas and roles)
CREATE TABLE IF NOT EXISTS ref_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    goal_category VARCHAR(100), -- 'efficiency', 'growth', 'compliance', 'innovation', etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenges reference table
CREATE TABLE IF NOT EXISTS ref_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    challenge_category VARCHAR(100), -- 'technical', 'organizational', 'regulatory', etc.
    severity_level VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Motivations reference table
CREATE TABLE IF NOT EXISTS ref_motivations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    motivation_type VARCHAR(100), -- 'intrinsic', 'extrinsic', 'career', 'impact'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Frustrations reference table
CREATE TABLE IF NOT EXISTS ref_frustrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    frustration_category VARCHAR(100), -- 'process', 'technology', 'communication', etc.
    impact_level VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities reference table (daily activities)
CREATE TABLE IF NOT EXISTS ref_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    activity_type VARCHAR(100), -- 'communication', 'analysis', 'meeting', 'documentation', etc.
    typical_duration_minutes INT,
    frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'ad-hoc'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tools reference table
CREATE TABLE IF NOT EXISTS ref_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    tool_category VARCHAR(100), -- 'crm', 'analytics', 'communication', 'documentation', etc.
    vendor VARCHAR(255),
    is_enterprise BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills reference table (soft & technical)
CREATE TABLE IF NOT EXISTS ref_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    skill_type VARCHAR(50) NOT NULL, -- 'soft', 'technical', 'clinical', 'regulatory'
    skill_category VARCHAR(100),
    proficiency_levels VARCHAR(100)[], -- ['beginner', 'intermediate', 'advanced', 'expert']
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competencies reference table (clinical & professional)
CREATE TABLE IF NOT EXISTS ref_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    competency_type VARCHAR(100), -- 'clinical', 'scientific', 'leadership', 'functional'
    assessment_method VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPIs reference table
CREATE TABLE IF NOT EXISTS ref_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    kpi_category VARCHAR(100), -- 'performance', 'quality', 'compliance', 'engagement'
    measurement_unit VARCHAR(100),
    measurement_frequency VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Responsibilities reference table
CREATE TABLE IF NOT EXISTS ref_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    responsibility_category VARCHAR(100),
    accountability_level VARCHAR(50), -- 'primary', 'shared', 'supporting'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliverables reference table
CREATE TABLE IF NOT EXISTS ref_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    deliverable_type VARCHAR(100), -- 'document', 'presentation', 'report', 'analysis'
    typical_frequency VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Systems reference table
CREATE TABLE IF NOT EXISTS ref_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    system_type VARCHAR(100), -- 'erp', 'crm', 'clinical', 'regulatory', 'analytics'
    vendor VARCHAR(255),
    gxp_validated BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stakeholders reference table
CREATE TABLE IF NOT EXISTS ref_stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    stakeholder_type VARCHAR(100), -- 'internal', 'external', 'hcp', 'patient', 'regulatory'
    interaction_frequency VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training reference table
CREATE TABLE IF NOT EXISTS ref_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    training_type VARCHAR(100), -- 'gxp', 'compliance', 'technical', 'soft_skills'
    duration_hours INT,
    recertification_months INT,
    is_mandatory BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GxP Types reference table
CREATE TABLE IF NOT EXISTS ref_gxp_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE, -- 'GCP', 'GVP', 'GMP', 'GLP', 'GDP'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    regulatory_body VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Therapeutic Areas reference table
CREATE TABLE IF NOT EXISTS ref_therapeutic_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icd_codes TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication Preferences reference table
CREATE TABLE IF NOT EXISTS ref_communication_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    channel_type VARCHAR(100), -- 'email', 'phone', 'video', 'in-person', 'async'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scenarios reference table
CREATE TABLE IF NOT EXISTS ref_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    scenario_type VARCHAR(100), -- 'workflow', 'decision', 'interaction', 'crisis'
    complexity_level VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regulatory Contexts reference table
CREATE TABLE IF NOT EXISTS ref_regulatory_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    jurisdiction VARCHAR(100), -- 'FDA', 'EMA', 'PMDA', 'NMPA', 'Global'
    regulation_type VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metrics reference table (success metrics)
CREATE TABLE IF NOT EXISTS ref_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    metric_type VARCHAR(100), -- 'quantitative', 'qualitative', 'composite'
    measurement_unit VARCHAR(100),
    target_direction VARCHAR(20), -- 'increase', 'decrease', 'maintain'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- JUNCTION TABLES FOR PERSONAS
-- =============================================================================

CREATE TABLE IF NOT EXISTS persona_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES ref_goals(id) ON DELETE CASCADE,
    priority_order INT DEFAULT 0,
    importance_weight DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, goal_id)
);

CREATE TABLE IF NOT EXISTS persona_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES ref_challenges(id) ON DELETE CASCADE,
    priority_order INT DEFAULT 0,
    severity_override VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS persona_motivations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    motivation_id UUID NOT NULL REFERENCES ref_motivations(id) ON DELETE CASCADE,
    priority_order INT DEFAULT 0,
    strength_level VARCHAR(50), -- 'low', 'medium', 'high', 'primary'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, motivation_id)
);

CREATE TABLE IF NOT EXISTS persona_frustrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    frustration_id UUID NOT NULL REFERENCES ref_frustrations(id) ON DELETE CASCADE,
    priority_order INT DEFAULT 0,
    frequency VARCHAR(50), -- 'rarely', 'sometimes', 'often', 'always'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, frustration_id)
);

CREATE TABLE IF NOT EXISTS persona_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES ref_activities(id) ON DELETE CASCADE,
    priority_order INT DEFAULT 0,
    time_percentage INT, -- % of day spent on this
    frequency_override VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, activity_id)
);

CREATE TABLE IF NOT EXISTS persona_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES ref_tools(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', 'expert'
    usage_frequency VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, tool_id)
);

CREATE TABLE IF NOT EXISTS persona_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES ref_skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50),
    years_experience INT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, skill_id)
);

CREATE TABLE IF NOT EXISTS persona_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES ref_competencies(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50),
    assessment_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, competency_id)
);

CREATE TABLE IF NOT EXISTS persona_communication_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    preference_id UUID NOT NULL REFERENCES ref_communication_preferences(id) ON DELETE CASCADE,
    priority_order INT DEFAULT 0,
    is_preferred BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, preference_id)
);

CREATE TABLE IF NOT EXISTS persona_success_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    metric_id UUID NOT NULL REFERENCES ref_metrics(id) ON DELETE CASCADE,
    target_value VARCHAR(255),
    current_value VARCHAR(255),
    priority_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, metric_id)
);

CREATE TABLE IF NOT EXISTS persona_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    scenario_id UUID NOT NULL REFERENCES ref_scenarios(id) ON DELETE CASCADE,
    frequency VARCHAR(50),
    difficulty_level VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, scenario_id)
);

CREATE TABLE IF NOT EXISTS persona_gxp_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    gxp_type_id UUID NOT NULL REFERENCES ref_gxp_types(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true,
    certification_date DATE,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, gxp_type_id)
);

CREATE TABLE IF NOT EXISTS persona_regulatory_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    regulatory_context_id UUID NOT NULL REFERENCES ref_regulatory_contexts(id) ON DELETE CASCADE,
    relevance_level VARCHAR(50), -- 'primary', 'secondary', 'awareness'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, regulatory_context_id)
);

CREATE TABLE IF NOT EXISTS persona_therapeutic_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    therapeutic_area_id UUID NOT NULL REFERENCES ref_therapeutic_areas(id) ON DELETE CASCADE,
    expertise_level VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, therapeutic_area_id)
);

-- Persona quotes (not a junction - persona-specific content)
CREATE TABLE IF NOT EXISTS persona_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    quote_text TEXT NOT NULL,
    quote_context VARCHAR(255),
    sentiment VARCHAR(50), -- 'positive', 'negative', 'neutral', 'frustrated', 'hopeful'
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- JUNCTION TABLES FOR ORG_ROLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS role_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES ref_goals(id) ON DELETE CASCADE,
    priority_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, goal_id)
);

CREATE TABLE IF NOT EXISTS role_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES ref_challenges(id) ON DELETE CASCADE,
    priority_order INT DEFAULT 0,
    mitigation_strategy TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS role_motivations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    motivation_id UUID NOT NULL REFERENCES ref_motivations(id) ON DELETE CASCADE,
    priority_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, motivation_id)
);

CREATE TABLE IF NOT EXISTS role_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    kpi_id UUID NOT NULL REFERENCES ref_kpis(id) ON DELETE CASCADE,
    target_value VARCHAR(255),
    measurement_frequency VARCHAR(50),
    weight_percentage INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, kpi_id)
);

CREATE TABLE IF NOT EXISTS role_clinical_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES ref_competencies(id) ON DELETE CASCADE,
    required_level VARCHAR(50),
    is_mandatory BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, competency_id)
);

CREATE TABLE IF NOT EXISTS role_soft_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES ref_skills(id) ON DELETE CASCADE,
    required_level VARCHAR(50),
    is_mandatory BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, skill_id)
);

CREATE TABLE IF NOT EXISTS role_technical_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES ref_skills(id) ON DELETE CASCADE,
    required_level VARCHAR(50),
    is_mandatory BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, skill_id)
);

CREATE TABLE IF NOT EXISTS role_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    responsibility_id UUID NOT NULL REFERENCES ref_responsibilities(id) ON DELETE CASCADE,
    priority_order INT DEFAULT 0,
    time_allocation_percentage INT,
    accountability_level VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, responsibility_id)
);

CREATE TABLE IF NOT EXISTS role_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    deliverable_id UUID NOT NULL REFERENCES ref_deliverables(id) ON DELETE CASCADE,
    frequency VARCHAR(50),
    is_mandatory BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, deliverable_id)
);

CREATE TABLE IF NOT EXISTS role_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES ref_activities(id) ON DELETE CASCADE,
    time_percentage INT,
    frequency VARCHAR(50),
    priority_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, activity_id)
);

CREATE TABLE IF NOT EXISTS role_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    system_id UUID NOT NULL REFERENCES ref_systems(id) ON DELETE CASCADE,
    access_level VARCHAR(50), -- 'read', 'write', 'admin', 'power_user'
    usage_frequency VARCHAR(50),
    is_mandatory BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, system_id)
);

CREATE TABLE IF NOT EXISTS role_stakeholder_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    stakeholder_id UUID NOT NULL REFERENCES ref_stakeholders(id) ON DELETE CASCADE,
    interaction_frequency VARCHAR(50),
    interaction_type VARCHAR(100),
    importance_level VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, stakeholder_id)
);

CREATE TABLE IF NOT EXISTS role_gxp_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    gxp_type_id UUID NOT NULL REFERENCES ref_gxp_types(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, gxp_type_id)
);

CREATE TABLE IF NOT EXISTS role_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    training_id UUID NOT NULL REFERENCES ref_training(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT false,
    completion_timeline_days INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, training_id)
);

-- Career paths (self-referential for roles)
CREATE TABLE IF NOT EXISTS role_career_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    to_role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    path_type VARCHAR(50), -- 'promotion', 'lateral', 'specialization', 'leadership'
    typical_duration_months INT,
    probability_percentage INT,
    requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(from_role_id, to_role_id)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Reference table indexes
CREATE INDEX IF NOT EXISTS idx_ref_goals_category ON ref_goals(goal_category);
CREATE INDEX IF NOT EXISTS idx_ref_challenges_category ON ref_challenges(challenge_category);
CREATE INDEX IF NOT EXISTS idx_ref_skills_type ON ref_skills(skill_type);
CREATE INDEX IF NOT EXISTS idx_ref_competencies_type ON ref_competencies(competency_type);
CREATE INDEX IF NOT EXISTS idx_ref_kpis_category ON ref_kpis(kpi_category);
CREATE INDEX IF NOT EXISTS idx_ref_tools_category ON ref_tools(tool_category);
CREATE INDEX IF NOT EXISTS idx_ref_systems_type ON ref_systems(system_type);
CREATE INDEX IF NOT EXISTS idx_ref_training_type ON ref_training(training_type);

-- Junction table indexes (persona)
CREATE INDEX IF NOT EXISTS idx_persona_goals_persona ON persona_goals(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_challenges_persona ON persona_challenges(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_motivations_persona ON persona_motivations(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_frustrations_persona ON persona_frustrations(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_activities_persona ON persona_activities(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_tools_persona ON persona_tools(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_skills_persona ON persona_skills(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_competencies_persona ON persona_competencies(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_quotes_persona ON persona_quotes(persona_id);

-- Junction table indexes (role)
CREATE INDEX IF NOT EXISTS idx_role_goals_role ON role_goals(role_id);
CREATE INDEX IF NOT EXISTS idx_role_challenges_role ON role_challenges(role_id);
CREATE INDEX IF NOT EXISTS idx_role_kpis_role ON role_kpis(role_id);
CREATE INDEX IF NOT EXISTS idx_role_clinical_competencies_role ON role_clinical_competencies(role_id);
CREATE INDEX IF NOT EXISTS idx_role_soft_skills_role ON role_soft_skills(role_id);
CREATE INDEX IF NOT EXISTS idx_role_technical_skills_role ON role_technical_skills(role_id);
CREATE INDEX IF NOT EXISTS idx_role_responsibilities_role ON role_responsibilities(role_id);
CREATE INDEX IF NOT EXISTS idx_role_activities_role ON role_activities(role_id);
CREATE INDEX IF NOT EXISTS idx_role_systems_role ON role_systems(role_id);
CREATE INDEX IF NOT EXISTS idx_role_career_paths_from ON role_career_paths(from_role_id);
CREATE INDEX IF NOT EXISTS idx_role_career_paths_to ON role_career_paths(to_role_id);

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE ref_goals IS 'Master reference table for goals shared across personas and roles';
COMMENT ON TABLE ref_challenges IS 'Master reference table for challenges faced by personas and roles';
COMMENT ON TABLE ref_skills IS 'Master reference table for both soft and technical skills';
COMMENT ON TABLE ref_competencies IS 'Master reference table for clinical and professional competencies';
COMMENT ON TABLE ref_kpis IS 'Master reference table for Key Performance Indicators';
COMMENT ON TABLE ref_gxp_types IS 'Master reference table for GxP compliance types (GCP, GVP, GMP, etc.)';

COMMENT ON TABLE persona_goals IS 'Junction: Many-to-many relationship between personas and goals';
COMMENT ON TABLE persona_challenges IS 'Junction: Many-to-many relationship between personas and challenges';
COMMENT ON TABLE role_kpis IS 'Junction: Many-to-many relationship between roles and KPIs';
COMMENT ON TABLE role_career_paths IS 'Self-referential junction for role advancement paths';
