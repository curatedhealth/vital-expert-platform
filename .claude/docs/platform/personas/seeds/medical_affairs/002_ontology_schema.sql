-- =====================================================================
-- ONTOLOGY SCHEMA FOR KNOWLEDGE GRAPHS
-- =====================================================================
-- Version: 1.0.0
-- Created: 2025-11-27
-- Purpose: Normalize JSONB fields into reference/junction tables for
--          knowledge graph queries and pattern discovery
-- =====================================================================
--
-- ONTOLOGY DESIGN PRINCIPLES:
-- 1. Reference tables = Graph NODES (reusable entities)
-- 2. Junction tables = Graph EDGES (relationships with metadata)
-- 3. Enable queries like Neo4j: (Persona)-[HAS_PAIN_POINT]->(PainPoint)
-- 4. Support cross-functional pattern discovery
-- 5. Enable connecting pain points to solutions
-- =====================================================================

-- =====================================================================
-- PHASE 1: CORE ONTOLOGY - ARCHETYPES & SERVICE LAYERS
-- =====================================================================

-- Archetypes Reference (MECE Framework nodes)
CREATE TABLE IF NOT EXISTS ref_archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  archetype_name VARCHAR(50) NOT NULL,
  quadrant_position VARCHAR(50), -- e.g., 'high_ai_routine', 'low_ai_strategic'
  ai_maturity VARCHAR(20) CHECK (ai_maturity IN ('high', 'low')),
  work_type VARCHAR(20) CHECK (work_type IN ('routine', 'strategic')),
  description TEXT,
  primary_motivation TEXT,
  communication_style TEXT,
  decision_pattern TEXT,
  risk_tolerance VARCHAR(20),
  change_readiness VARCHAR(20),
  -- VPANES baseline weights (how strongly each archetype experiences these)
  vpanes_visibility_weight DECIMAL(3,2) DEFAULT 1.0,
  vpanes_pain_weight DECIMAL(3,2) DEFAULT 1.0,
  vpanes_actions_weight DECIMAL(3,2) DEFAULT 1.0,
  vpanes_needs_weight DECIMAL(3,2) DEFAULT 1.0,
  vpanes_emotions_weight DECIMAL(3,2) DEFAULT 1.0,
  vpanes_scenarios_weight DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Layers Reference (routing destinations)
CREATE TABLE IF NOT EXISTS ref_service_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  layer_name VARCHAR(100) NOT NULL,
  layer_type VARCHAR(50), -- ASK_EXPERT, ASK_PANEL, WORKFLOWS, SOLUTION_BUILDER
  description TEXT,
  typical_use_cases TEXT[],
  complexity_level VARCHAR(20),
  automation_level VARCHAR(20),
  required_expertise_level VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PHASE 2: TOOLS ONTOLOGY
-- =====================================================================

-- Tools Reference Table (normalizes tools_used JSONB)
CREATE TABLE IF NOT EXISTS ref_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  tool_name VARCHAR(255) NOT NULL,
  tool_category VARCHAR(100), -- CRM, Analytics, Documentation, Communication, etc.
  vendor VARCHAR(255),
  description TEXT,
  is_ai_enabled BOOLEAN DEFAULT false,
  automation_capability VARCHAR(20), -- none, low, medium, high
  integration_complexity VARCHAR(20),
  pharma_specific BOOLEAN DEFAULT false,
  typical_users TEXT[], -- which roles typically use this
  related_tools UUID[], -- for tool ecosystem mapping
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PHASE 3: PAIN POINTS ONTOLOGY
-- =====================================================================

-- Pain Points Reference Table (normalizes challenges/frustrations)
CREATE TABLE IF NOT EXISTS ref_pain_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  pain_point_name VARCHAR(255) NOT NULL,
  pain_category VARCHAR(100), -- Process, Technology, Communication, Compliance, etc.
  description TEXT,
  root_cause_category VARCHAR(100),
  impact_area VARCHAR(100), -- Productivity, Quality, Compliance, Morale, etc.
  is_systemic BOOLEAN DEFAULT false, -- Affects multiple roles/functions
  solvability VARCHAR(20), -- easy, moderate, difficult, structural
  typical_frequency VARCHAR(50),
  pharma_specific BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pain Point Taxonomy (hierarchical categorization)
CREATE TABLE IF NOT EXISTS ref_pain_point_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  parent_category_id UUID REFERENCES ref_pain_point_categories(id),
  level INTEGER DEFAULT 1,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PHASE 4: GOALS ONTOLOGY
-- =====================================================================

-- Goals Reference Table (normalizes goals JSONB)
CREATE TABLE IF NOT EXISTS ref_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  goal_name VARCHAR(255) NOT NULL,
  goal_category VARCHAR(100), -- Efficiency, Quality, Growth, Compliance, Innovation
  goal_type VARCHAR(50), -- outcome, process, capability, relationship
  description TEXT,
  measurability VARCHAR(20), -- quantitative, qualitative, mixed
  typical_timeframe VARCHAR(50), -- daily, weekly, monthly, quarterly, annual
  strategic_alignment VARCHAR(100), -- How it connects to org strategy
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PHASE 5: MOTIVATIONS ONTOLOGY
-- =====================================================================

-- Motivations Reference Table (normalizes motivations JSONB)
CREATE TABLE IF NOT EXISTS ref_motivations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  motivation_name VARCHAR(255) NOT NULL,
  motivation_category VARCHAR(100), -- Intrinsic, Extrinsic, Social, Achievement
  motivation_type VARCHAR(50), -- mastery, purpose, autonomy, recognition, security
  description TEXT,
  psychological_driver TEXT, -- Underlying psychological need
  typical_behaviors TEXT[], -- Observable behaviors from this motivation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PHASE 6: ACTIVITIES ONTOLOGY
-- =====================================================================

-- Activities Reference Table (normalizes daily_activities JSONB)
CREATE TABLE IF NOT EXISTS ref_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  activity_name VARCHAR(255) NOT NULL,
  activity_category VARCHAR(100), -- Administrative, Clinical, Strategic, Communication
  description TEXT,
  typical_duration_minutes INTEGER,
  automation_potential VARCHAR(20), -- none, low, medium, high
  collaboration_level VARCHAR(20), -- solo, pair, team, cross-functional
  cognitive_load VARCHAR(20), -- low, medium, high
  value_add_type VARCHAR(50), -- direct, enabling, compliance, overhead
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PHASE 7: JTBD (JOBS TO BE DONE) ONTOLOGY
-- =====================================================================

-- JTBD Reference Table
CREATE TABLE IF NOT EXISTS ref_jtbds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  jtbd_statement TEXT NOT NULL, -- "When I [situation], I want to [motivation], so I can [outcome]"
  job_category VARCHAR(100), -- Functional, Emotional, Social
  job_type VARCHAR(50), -- core, related, emotional
  situation_context TEXT,
  desired_outcome TEXT,
  success_criteria TEXT[],
  failure_modes TEXT[],
  -- ODI (Outcome-Driven Innovation) fields
  odi_importance_baseline DECIMAL(3,2), -- Base importance 0-10
  odi_satisfaction_baseline DECIMAL(3,2), -- Base satisfaction 0-10
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outcomes Reference (for JTBD outcomes)
CREATE TABLE IF NOT EXISTS ref_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  outcome_statement TEXT NOT NULL,
  outcome_category VARCHAR(100), -- Speed, Quality, Cost, Risk, Compliance
  outcome_type VARCHAR(50), -- desired, undesired, emotional
  measurability VARCHAR(20),
  direction VARCHAR(20), -- minimize, maximize, optimize
  typical_metric TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PHASE 7B: CAPABILITIES ONTOLOGY (L4)
-- =====================================================================

-- Capabilities Reference Table (Skills and abilities)
CREATE TABLE IF NOT EXISTS ref_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  capability_name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Classification
  capability_category VARCHAR(100), -- 'Technical', 'Analytical', 'Communication', 'Leadership', 'AI'
  capability_type VARCHAR(50) CHECK (capability_type IN (
    'skill', 'competency', 'knowledge', 'behavior', 'tool_proficiency'
  )),

  -- Domain Specificity
  is_pharma_specific BOOLEAN DEFAULT false,
  is_ai_related BOOLEAN DEFAULT false,

  -- Hierarchy
  parent_capability_id UUID REFERENCES ref_capabilities(id),
  capability_level INTEGER DEFAULT 1, -- 1=broad, 2=intermediate, 3=specific

  -- Proficiency Scale Definition
  proficiency_scale_max INTEGER DEFAULT 5,
  proficiency_level_1_name VARCHAR(50) DEFAULT 'Awareness',
  proficiency_level_2_name VARCHAR(50) DEFAULT 'Basic',
  proficiency_level_3_name VARCHAR(50) DEFAULT 'Proficient',
  proficiency_level_4_name VARCHAR(50) DEFAULT 'Advanced',
  proficiency_level_5_name VARCHAR(50) DEFAULT 'Expert',

  -- Market Context
  demand_trend VARCHAR(20) CHECK (demand_trend IN (
    'declining', 'stable', 'growing', 'emerging', 'critical'
  )),
  automation_risk VARCHAR(20) CHECK (automation_risk IN (
    'none', 'low', 'medium', 'high', 'transforming'
  )),

  -- Development
  typical_development_months INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Persona-Capability Junction (HAS_CAPABILITY relationship)
CREATE TABLE IF NOT EXISTS persona_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  capability_id UUID NOT NULL REFERENCES ref_capabilities(id) ON DELETE CASCADE,

  -- Proficiency
  current_level INTEGER CHECK (current_level BETWEEN 1 AND 5),
  target_level INTEGER CHECK (target_level BETWEEN 1 AND 5),

  -- Archetype-specific proficiency expectations
  expected_level_automator INTEGER CHECK (expected_level_automator BETWEEN 1 AND 5),
  expected_level_orchestrator INTEGER CHECK (expected_level_orchestrator BETWEEN 1 AND 5),
  expected_level_learner INTEGER CHECK (expected_level_learner BETWEEN 1 AND 5),
  expected_level_skeptic INTEGER CHECK (expected_level_skeptic BETWEEN 1 AND 5),

  -- Importance
  importance_to_role DECIMAL(3,2) CHECK (importance_to_role BETWEEN 0 AND 10),

  -- Gap Analysis
  gap_score INTEGER GENERATED ALWAYS AS (
    COALESCE(target_level, 3) - COALESCE(current_level, 1)
  ) STORED,

  -- Development
  development_priority VARCHAR(20),
  last_assessed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(persona_id, capability_id)
);

-- Index for capability queries
CREATE INDEX IF NOT EXISTS idx_ref_capabilities_category ON ref_capabilities(capability_category);
CREATE INDEX IF NOT EXISTS idx_ref_capabilities_ai ON ref_capabilities(is_ai_related);
CREATE INDEX IF NOT EXISTS idx_persona_capabilities_persona ON persona_capabilities(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_capabilities_capability ON persona_capabilities(capability_id);
CREATE INDEX IF NOT EXISTS idx_persona_capabilities_gap ON persona_capabilities(gap_score DESC);

-- =====================================================================
-- PHASE 8: OPPORTUNITIES & SOLUTIONS ONTOLOGY
-- =====================================================================

-- Opportunities Reference (connects pain points to potential solutions)
CREATE TABLE IF NOT EXISTS ref_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  opportunity_name VARCHAR(255) NOT NULL,
  opportunity_type VARCHAR(50), -- automation, workflow, insight, training
  description TEXT,
  value_proposition TEXT,
  implementation_complexity VARCHAR(20),
  expected_impact VARCHAR(20),
  time_to_value VARCHAR(50),
  required_capabilities TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PHASE 9: JUNCTION TABLES WITH RELATIONSHIP METADATA
-- =====================================================================

-- Persona-Archetype Junction (HAS_ARCHETYPE relationship)
DROP TABLE IF EXISTS persona_archetypes CASCADE;
CREATE TABLE persona_archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  archetype_id UUID NOT NULL REFERENCES ref_archetypes(id) ON DELETE CASCADE,
  archetype_strength DECIMAL(3,2) DEFAULT 1.0, -- How strongly persona exhibits archetype
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(persona_id, archetype_id)
);

-- Persona-Tools Junction (USES_TOOL relationship)
DROP TABLE IF EXISTS persona_tools CASCADE;
CREATE TABLE persona_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES ref_tools(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20), -- Basic, Intermediate, Advanced, Expert
  usage_frequency VARCHAR(20), -- Daily, Weekly, Monthly, As-needed
  satisfaction_score DECIMAL(3,2), -- 0-10 satisfaction with tool
  pain_level DECIMAL(3,2), -- 0-10 pain experienced with tool
  automation_desire DECIMAL(3,2), -- 0-10 desire to automate this tool's tasks
  -- Archetype-specific weights (how much each archetype values this tool)
  weight_automator DECIMAL(3,2) DEFAULT 1.0,
  weight_orchestrator DECIMAL(3,2) DEFAULT 1.0,
  weight_learner DECIMAL(3,2) DEFAULT 1.0,
  weight_skeptic DECIMAL(3,2) DEFAULT 1.0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(persona_id, tool_id)
);

-- Persona-Pain Points Junction (HAS_PAIN_POINT relationship)
DROP TABLE IF EXISTS persona_pain_points CASCADE;
CREATE TABLE persona_pain_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  pain_point_id UUID NOT NULL REFERENCES ref_pain_points(id) ON DELETE CASCADE,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  frequency VARCHAR(20) CHECK (frequency IN ('rarely', 'sometimes', 'often', 'always')),
  impact_score DECIMAL(3,2), -- 0-10 business impact
  emotional_intensity DECIMAL(3,2), -- 0-10 emotional impact
  -- Archetype-specific weights
  weight_automator DECIMAL(3,2) DEFAULT 1.0,
  weight_orchestrator DECIMAL(3,2) DEFAULT 1.0,
  weight_learner DECIMAL(3,2) DEFAULT 1.0,
  weight_skeptic DECIMAL(3,2) DEFAULT 1.0,
  -- VPANES scoring for this pain point
  vpanes_visibility DECIMAL(3,2), -- How visible is this pain? 0-10
  vpanes_pain DECIMAL(3,2), -- How painful? 0-10
  vpanes_actions DECIMAL(3,2), -- Actions taken to solve? 0-10
  vpanes_needs DECIMAL(3,2), -- How much do they need a solution? 0-10
  vpanes_emotions DECIMAL(3,2), -- Emotional charge? 0-10
  vpanes_scenarios DECIMAL(3,2), -- How scenario-specific? 0-10
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(persona_id, pain_point_id)
);

-- Persona-Goals Junction (HAS_GOAL relationship)
DROP TABLE IF EXISTS persona_goals CASCADE;
CREATE TABLE persona_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES ref_goals(id) ON DELETE CASCADE,
  priority INTEGER CHECK (priority BETWEEN 1 AND 5), -- 1=highest
  importance_score DECIMAL(3,2), -- 0-10
  current_progress DECIMAL(3,2), -- 0-100%
  -- Archetype-specific weights
  weight_automator DECIMAL(3,2) DEFAULT 1.0,
  weight_orchestrator DECIMAL(3,2) DEFAULT 1.0,
  weight_learner DECIMAL(3,2) DEFAULT 1.0,
  weight_skeptic DECIMAL(3,2) DEFAULT 1.0,
  target_metric TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(persona_id, goal_id)
);

-- Persona-Motivations Junction (DRIVEN_BY relationship)
DROP TABLE IF EXISTS persona_motivations CASCADE;
CREATE TABLE persona_motivations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  motivation_id UUID NOT NULL REFERENCES ref_motivations(id) ON DELETE CASCADE,
  strength VARCHAR(20) CHECK (strength IN ('weak', 'moderate', 'strong', 'dominant')),
  expression_frequency VARCHAR(20),
  -- Archetype-specific weights
  weight_automator DECIMAL(3,2) DEFAULT 1.0,
  weight_orchestrator DECIMAL(3,2) DEFAULT 1.0,
  weight_learner DECIMAL(3,2) DEFAULT 1.0,
  weight_skeptic DECIMAL(3,2) DEFAULT 1.0,
  behavioral_indicators TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(persona_id, motivation_id)
);

-- Persona-Activities Junction (PERFORMS_ACTIVITY relationship)
DROP TABLE IF EXISTS persona_activities CASCADE;
CREATE TABLE persona_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES ref_activities(id) ON DELETE CASCADE,
  time_percentage INTEGER CHECK (time_percentage BETWEEN 0 AND 100),
  frequency VARCHAR(20),
  satisfaction_score DECIMAL(3,2),
  automation_desire DECIMAL(3,2),
  -- Archetype-specific time allocation
  time_percent_automator INTEGER,
  time_percent_orchestrator INTEGER,
  time_percent_learner INTEGER,
  time_percent_skeptic INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(persona_id, activity_id)
);

-- Persona-JTBD Junction (PERFORMS_JTBD relationship)
DROP TABLE IF EXISTS persona_jtbds CASCADE;
CREATE TABLE persona_jtbds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  jtbd_id UUID NOT NULL REFERENCES ref_jtbds(id) ON DELETE CASCADE,
  frequency VARCHAR(20),
  -- ODI scoring by persona
  importance_score DECIMAL(3,2), -- 0-10
  satisfaction_score DECIMAL(3,2), -- 0-10
  opportunity_score DECIMAL(4,2) GENERATED ALWAYS AS (
    importance_score + (importance_score - satisfaction_score)
  ) STORED, -- ODI formula
  -- Archetype-specific ODI
  importance_automator DECIMAL(3,2),
  satisfaction_automator DECIMAL(3,2),
  importance_orchestrator DECIMAL(3,2),
  satisfaction_orchestrator DECIMAL(3,2),
  importance_learner DECIMAL(3,2),
  satisfaction_learner DECIMAL(3,2),
  importance_skeptic DECIMAL(3,2),
  satisfaction_skeptic DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(persona_id, jtbd_id)
);

-- JTBD-Outcomes Junction (HAS_OUTCOME relationship)
DROP TABLE IF EXISTS jtbd_outcomes CASCADE;
CREATE TABLE jtbd_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES ref_jtbds(id) ON DELETE CASCADE,
  outcome_id UUID NOT NULL REFERENCES ref_outcomes(id) ON DELETE CASCADE,
  outcome_priority INTEGER,
  importance_weight DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(jtbd_id, outcome_id)
);

-- =====================================================================
-- PHASE 10: SOLUTION MAPPING TABLES
-- =====================================================================

-- Pain Point to Opportunity Mapping (ADDRESSED_BY relationship)
DROP TABLE IF EXISTS pain_point_opportunities CASCADE;
CREATE TABLE pain_point_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pain_point_id UUID NOT NULL REFERENCES ref_pain_points(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES ref_opportunities(id) ON DELETE CASCADE,
  resolution_effectiveness DECIMAL(3,2), -- 0-10 how well it solves the pain
  implementation_effort VARCHAR(20),
  roi_estimate VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pain_point_id, opportunity_id)
);

-- JTBD to Opportunity Mapping (ENABLES relationship)
DROP TABLE IF EXISTS jtbd_opportunities CASCADE;
CREATE TABLE jtbd_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES ref_jtbds(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES ref_opportunities(id) ON DELETE CASCADE,
  enablement_score DECIMAL(3,2), -- 0-10 how well it enables the JTBD
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(jtbd_id, opportunity_id)
);

-- Opportunity to Service Layer Routing (ROUTES_TO relationship)
DROP TABLE IF EXISTS opportunity_service_layers CASCADE;
CREATE TABLE opportunity_service_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES ref_opportunities(id) ON DELETE CASCADE,
  service_layer_id UUID NOT NULL REFERENCES ref_service_layers(id) ON DELETE CASCADE,
  routing_priority INTEGER,
  fit_score DECIMAL(3,2), -- 0-10 how well this service layer fits
  conditions JSONB, -- When to route to this layer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(opportunity_id, service_layer_id)
);

-- =====================================================================
-- PHASE 11: CROSS-FUNCTIONAL RELATIONSHIP TABLES
-- =====================================================================

-- Tool-Activity Mapping (USED_IN relationship)
DROP TABLE IF EXISTS tool_activities CASCADE;
CREATE TABLE tool_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES ref_tools(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES ref_activities(id) ON DELETE CASCADE,
  usage_pattern VARCHAR(100),
  dependency_level VARCHAR(20), -- optional, recommended, required
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tool_id, activity_id)
);

-- Pain Point-Activity Mapping (CAUSES/EXPERIENCED_DURING relationship)
DROP TABLE IF EXISTS pain_point_activities CASCADE;
CREATE TABLE pain_point_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pain_point_id UUID NOT NULL REFERENCES ref_pain_points(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES ref_activities(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50), -- 'caused_by', 'experienced_during', 'blocks'
  frequency VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pain_point_id, activity_id)
);

-- Goal-JTBD Mapping (ACHIEVES relationship)
DROP TABLE IF EXISTS goal_jtbds CASCADE;
CREATE TABLE goal_jtbds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES ref_goals(id) ON DELETE CASCADE,
  jtbd_id UUID NOT NULL REFERENCES ref_jtbds(id) ON DELETE CASCADE,
  contribution_weight DECIMAL(3,2), -- How much this JTBD contributes to goal
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_id, jtbd_id)
);

-- =====================================================================
-- PHASE 12: VPANES SCORING TABLE
-- =====================================================================

-- VPANES Scoring by Persona (aggregate scores)
DROP TABLE IF EXISTS persona_vpanes_scores CASCADE;
CREATE TABLE persona_vpanes_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  -- Aggregate VPANES scores
  visibility_score DECIMAL(3,2), -- 0-10
  pain_score DECIMAL(3,2), -- 0-10
  actions_score DECIMAL(3,2), -- 0-10
  needs_score DECIMAL(3,2), -- 0-10
  emotions_score DECIMAL(3,2), -- 0-10
  scenarios_score DECIMAL(3,2), -- 0-10
  -- Composite scores
  total_vpanes DECIMAL(4,2) GENERATED ALWAYS AS (
    visibility_score + pain_score + actions_score + needs_score + emotions_score + scenarios_score
  ) STORED,
  engagement_potential DECIMAL(3,2), -- Derived engagement likelihood
  -- Archetype breakdown
  vpanes_by_archetype JSONB, -- Detailed breakdown by archetype
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(persona_id)
);

-- =====================================================================
-- PHASE 13: INDEXES FOR GRAPH-LIKE QUERIES
-- =====================================================================

-- Reference table indexes
CREATE INDEX IF NOT EXISTS idx_ref_archetypes_ai_maturity ON ref_archetypes(ai_maturity);
CREATE INDEX IF NOT EXISTS idx_ref_archetypes_work_type ON ref_archetypes(work_type);
CREATE INDEX IF NOT EXISTS idx_ref_tools_category ON ref_tools(tool_category);
CREATE INDEX IF NOT EXISTS idx_ref_tools_ai_enabled ON ref_tools(is_ai_enabled);
CREATE INDEX IF NOT EXISTS idx_ref_pain_points_category ON ref_pain_points(pain_category);
CREATE INDEX IF NOT EXISTS idx_ref_pain_points_systemic ON ref_pain_points(is_systemic);
CREATE INDEX IF NOT EXISTS idx_ref_goals_category ON ref_goals(goal_category);
CREATE INDEX IF NOT EXISTS idx_ref_motivations_category ON ref_motivations(motivation_category);
CREATE INDEX IF NOT EXISTS idx_ref_activities_category ON ref_activities(activity_category);
CREATE INDEX IF NOT EXISTS idx_ref_jtbds_category ON ref_jtbds(job_category);
CREATE INDEX IF NOT EXISTS idx_ref_opportunities_type ON ref_opportunities(opportunity_type);

-- Junction table indexes for traversal
CREATE INDEX IF NOT EXISTS idx_persona_tools_persona ON persona_tools(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_tools_tool ON persona_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_persona_pain_points_persona ON persona_pain_points(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_pain_points_pain ON persona_pain_points(pain_point_id);
CREATE INDEX IF NOT EXISTS idx_persona_pain_points_severity ON persona_pain_points(severity);
CREATE INDEX IF NOT EXISTS idx_persona_goals_persona ON persona_goals(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_goals_goal ON persona_goals(goal_id);
CREATE INDEX IF NOT EXISTS idx_persona_jtbds_persona ON persona_jtbds(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_jtbds_jtbd ON persona_jtbds(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_persona_jtbds_opportunity ON persona_jtbds(opportunity_score);
CREATE INDEX IF NOT EXISTS idx_pain_point_opportunities_pain ON pain_point_opportunities(pain_point_id);
CREATE INDEX IF NOT EXISTS idx_pain_point_opportunities_opp ON pain_point_opportunities(opportunity_id);

-- =====================================================================
-- PHASE 14: VIEWS FOR GRAPH-LIKE QUERIES
-- =====================================================================

-- View: High-opportunity pain points by persona
CREATE OR REPLACE VIEW v_persona_pain_opportunities AS
SELECT
  p.unique_id AS persona_unique_id,
  p.persona_name,
  p.persona_type AS archetype,
  pp.pain_point_name,
  ppp.severity,
  ppp.frequency,
  ppp.vpanes_pain,
  o.opportunity_name,
  po.resolution_effectiveness,
  sl.layer_name AS recommended_service
FROM personas p
JOIN persona_pain_points ppp ON p.id = ppp.persona_id
JOIN ref_pain_points pp ON ppp.pain_point_id = pp.id
LEFT JOIN pain_point_opportunities po ON pp.id = po.pain_point_id
LEFT JOIN ref_opportunities o ON po.opportunity_id = o.id
LEFT JOIN opportunity_service_layers osl ON o.id = osl.opportunity_id
LEFT JOIN ref_service_layers sl ON osl.service_layer_id = sl.id
ORDER BY ppp.vpanes_pain DESC NULLS LAST, po.resolution_effectiveness DESC NULLS LAST;

-- View: JTBD opportunity scores across archetypes
CREATE OR REPLACE VIEW v_jtbd_opportunities_by_archetype AS
SELECT
  j.unique_id AS jtbd_unique_id,
  j.jtbd_statement,
  j.job_category,
  pj.importance_score,
  pj.satisfaction_score,
  pj.opportunity_score,
  p.persona_type AS archetype,
  p.persona_name
FROM ref_jtbds j
JOIN persona_jtbds pj ON j.id = pj.jtbd_id
JOIN personas p ON pj.persona_id = p.id
ORDER BY pj.opportunity_score DESC;

-- View: Shared pain points across archetypes (pattern discovery)
CREATE OR REPLACE VIEW v_shared_pain_points AS
SELECT
  pp.unique_id AS pain_point_unique_id,
  pp.pain_point_name,
  pp.pain_category,
  COUNT(DISTINCT p.id) AS affected_personas,
  COUNT(DISTINCT p.persona_type) AS affected_archetypes,
  ARRAY_AGG(DISTINCT p.persona_type) AS archetypes,
  AVG(ppp.vpanes_pain) AS avg_pain_score,
  MAX(ppp.severity) AS max_severity
FROM ref_pain_points pp
JOIN persona_pain_points ppp ON pp.id = ppp.pain_point_id
JOIN personas p ON ppp.persona_id = p.id
GROUP BY pp.id, pp.unique_id, pp.pain_point_name, pp.pain_category
HAVING COUNT(DISTINCT p.persona_type) > 1
ORDER BY affected_archetypes DESC, avg_pain_score DESC;

-- View: Tool adoption by archetype
CREATE OR REPLACE VIEW v_tool_adoption_by_archetype AS
SELECT
  t.tool_name,
  t.tool_category,
  t.is_ai_enabled,
  p.persona_type AS archetype,
  COUNT(*) AS user_count,
  AVG(pt.satisfaction_score) AS avg_satisfaction,
  AVG(pt.automation_desire) AS avg_automation_desire
FROM ref_tools t
JOIN persona_tools pt ON t.id = pt.tool_id
JOIN personas p ON pt.persona_id = p.id
GROUP BY t.id, t.tool_name, t.tool_category, t.is_ai_enabled, p.persona_type
ORDER BY t.tool_name, p.persona_type;

-- View: Goals alignment across roles
CREATE OR REPLACE VIEW v_goals_by_role AS
SELECT
  g.goal_name,
  g.goal_category,
  r.name AS role_name,
  p.persona_type AS archetype,
  pg.priority,
  pg.importance_score
FROM ref_goals g
JOIN persona_goals pg ON g.id = pg.goal_id
JOIN personas p ON pg.persona_id = p.id
LEFT JOIN org_roles r ON p.source_role_id = r.id
ORDER BY g.goal_name, pg.priority;

-- =====================================================================
-- PHASE 15: SEED CORE ARCHETYPE DATA
-- =====================================================================

INSERT INTO ref_archetypes (unique_id, archetype_name, quadrant_position, ai_maturity, work_type, description, primary_motivation, communication_style, decision_pattern, risk_tolerance, change_readiness)
VALUES
  ('ARCH-AUTOMATOR', 'AUTOMATOR', 'high_ai_routine', 'high', 'routine',
   'Tech-savvy professionals who maximize efficiency through automation. They embrace AI tools and seek to eliminate repetitive tasks.',
   'Efficiency and time savings', 'Direct, data-driven', 'Quick, metrics-based', 'moderate', 'high'),
  ('ARCH-ORCHESTRATOR', 'ORCHESTRATOR', 'high_ai_strategic', 'high', 'strategic',
   'Strategic thinkers who leverage AI for innovation and competitive advantage. They see AI as a force multiplier for complex decisions.',
   'Innovation and impact', 'Visionary, big-picture', 'Consultative, insight-driven', 'high', 'high'),
  ('ARCH-LEARNER', 'LEARNER', 'low_ai_routine', 'low', 'routine',
   'Developing professionals open to guidance and growth. They need clear direction and step-by-step support for AI adoption.',
   'Competence and guidance', 'Supportive, educational', 'Cautious, seeks validation', 'low', 'moderate'),
  ('ARCH-SKEPTIC', 'SKEPTIC', 'low_ai_strategic', 'low', 'strategic',
   'Experienced professionals who require proof before adopting new approaches. They value evidence and proven track records.',
   'Proof and reliability', 'Evidence-based, questioning', 'Deliberate, risk-averse', 'low', 'low')
ON CONFLICT (unique_id) DO UPDATE SET
  description = EXCLUDED.description,
  primary_motivation = EXCLUDED.primary_motivation;

-- Seed Service Layers
INSERT INTO ref_service_layers (unique_id, layer_name, layer_type, description, typical_use_cases, complexity_level, automation_level)
VALUES
  ('SL-ASK-EXPERT', 'Ask Expert', 'ASK_EXPERT',
   'Direct access to subject matter experts for complex questions',
   ARRAY['Complex clinical questions', 'Regulatory guidance', 'Strategic decisions'],
   'high', 'low'),
  ('SL-ASK-PANEL', 'Ask Panel', 'ASK_PANEL',
   'Curated expert panels for multi-perspective insights',
   ARRAY['Advisory board prep', 'Cross-functional decisions', 'Best practice guidance'],
   'high', 'low'),
  ('SL-WORKFLOWS', 'Workflows', 'WORKFLOWS',
   'Automated and guided workflows for routine processes',
   ARRAY['Document preparation', 'Meeting summaries', 'Data collection'],
   'medium', 'high'),
  ('SL-SOLUTION-BUILDER', 'Solution Builder', 'SOLUTION_BUILDER',
   'Configurable solution assembly for specific needs',
   ARRAY['Custom reports', 'Presentation building', 'Analysis frameworks'],
   'medium', 'medium')
ON CONFLICT (unique_id) DO UPDATE SET
  description = EXCLUDED.description;

-- =====================================================================
-- PHASE 16: COMMENTS FOR DOCUMENTATION
-- =====================================================================

COMMENT ON TABLE ref_archetypes IS 'MECE archetype framework: AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC';
COMMENT ON TABLE ref_service_layers IS 'Platform service routing destinations';
COMMENT ON TABLE ref_tools IS 'Normalized tools ontology - replaces tools_used JSONB';
COMMENT ON TABLE ref_pain_points IS 'Normalized pain points - replaces challenges/frustrations JSONB';
COMMENT ON TABLE ref_goals IS 'Normalized goals ontology';
COMMENT ON TABLE ref_motivations IS 'Normalized motivations ontology';
COMMENT ON TABLE ref_activities IS 'Normalized daily activities ontology';
COMMENT ON TABLE ref_jtbds IS 'Jobs to be Done framework entities';
COMMENT ON TABLE ref_outcomes IS 'JTBD outcomes for ODI scoring';
COMMENT ON TABLE ref_opportunities IS 'Solution opportunities that address pain points';

COMMENT ON TABLE persona_tools IS 'Edge: (Persona)-[USES_TOOL]->(Tool) with proficiency metadata';
COMMENT ON TABLE persona_pain_points IS 'Edge: (Persona)-[HAS_PAIN_POINT]->(PainPoint) with VPANES scoring';
COMMENT ON TABLE persona_goals IS 'Edge: (Persona)-[HAS_GOAL]->(Goal) with archetype weights';
COMMENT ON TABLE persona_motivations IS 'Edge: (Persona)-[DRIVEN_BY]->(Motivation)';
COMMENT ON TABLE persona_activities IS 'Edge: (Persona)-[PERFORMS_ACTIVITY]->(Activity) with time allocation';
COMMENT ON TABLE persona_jtbds IS 'Edge: (Persona)-[PERFORMS_JTBD]->(JTBD) with ODI scoring';
COMMENT ON TABLE pain_point_opportunities IS 'Edge: (PainPoint)-[ADDRESSED_BY]->(Opportunity)';
COMMENT ON TABLE opportunity_service_layers IS 'Edge: (Opportunity)-[ROUTES_TO]->(ServiceLayer)';

COMMENT ON VIEW v_persona_pain_opportunities IS 'Graph traversal: Persona → PainPoint → Opportunity → ServiceLayer';
COMMENT ON VIEW v_shared_pain_points IS 'Pattern discovery: Pain points shared across archetypes';
COMMENT ON VIEW v_jtbd_opportunities_by_archetype IS 'ODI analysis: JTBD opportunity scores by archetype';
