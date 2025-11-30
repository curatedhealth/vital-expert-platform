-- =====================================================================
-- CHANGE MANAGEMENT & LEARNING DEVELOPMENT LAYER
-- =====================================================================
-- Version: 1.0.0
-- Created: 2025-11-28
-- Purpose: Change readiness, adoption tracking, resistance factors,
--          learning paths, and capability development
-- Dependencies: L1 (Org), L2 (Personas), L7 (Value)
-- =====================================================================
--
-- ARCHITECTURE PRINCIPLE:
-- This layer supports enterprise change management by clarifying:
--   - Who is impacted (roles, personas)
--   - What changes (JTBDs, workflows, capabilities)
--   - Why it matters (value drivers)
--   - How ready stakeholders are (readiness, skills, maturity)
--
-- Key Frameworks:
--   - ADKAR: Awareness, Desire, Knowledge, Ability, Reinforcement
--   - Adoption Stages: Awareness → Interest → Trial → Adoption → Advocacy
--   - Resistance Taxonomy: Individual, Organizational, Technical, Cultural
-- =====================================================================

-- =====================================================================
-- CHANGE READINESS FRAMEWORK
-- =====================================================================

-- Change Readiness Dimensions
CREATE TABLE IF NOT EXISTS ref_change_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL, -- 'Technical Readiness', 'Cultural Readiness'
  description TEXT,

  -- Classification
  dimension_category VARCHAR(50) CHECK (dimension_category IN (
    'technical', 'organizational', 'cultural', 'individual', 'process'
  )),

  -- Assessment
  assessment_criteria TEXT[],
  measurement_method VARCHAR(100),

  -- Weighting
  weight DECIMAL(3,2) DEFAULT 1.0 CHECK (weight BETWEEN 0 AND 2),

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Change Readiness Assessments (ADKAR-based)
CREATE TABLE IF NOT EXISTS change_readiness_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Assessment Target (at least one required)
  persona_id UUID REFERENCES personas(id),
  role_id UUID REFERENCES org_roles(id),
  department_id UUID REFERENCES org_departments(id),
  function_id UUID REFERENCES org_business_functions(id),

  -- For Specific Initiative/Opportunity
  opportunity_id UUID REFERENCES ref_opportunities(id),
  initiative_id UUID REFERENCES transformation_initiatives(id),

  -- ADKAR Scores (1-5 scale)
  awareness_score INTEGER CHECK (awareness_score BETWEEN 1 AND 5),
  desire_score INTEGER CHECK (desire_score BETWEEN 1 AND 5),
  knowledge_score INTEGER CHECK (knowledge_score BETWEEN 1 AND 5),
  ability_score INTEGER CHECK (ability_score BETWEEN 1 AND 5),
  reinforcement_score INTEGER CHECK (reinforcement_score BETWEEN 1 AND 5),

  -- ADKAR Composite
  adkar_total INTEGER GENERATED ALWAYS AS (
    awareness_score + desire_score + knowledge_score + ability_score + reinforcement_score
  ) STORED,

  -- Overall Classification
  overall_readiness VARCHAR(20) GENERATED ALWAYS AS (
    CASE
      WHEN awareness_score + desire_score + knowledge_score + ability_score + reinforcement_score >= 22 THEN 'very_high'
      WHEN awareness_score + desire_score + knowledge_score + ability_score + reinforcement_score >= 18 THEN 'high'
      WHEN awareness_score + desire_score + knowledge_score + ability_score + reinforcement_score >= 13 THEN 'moderate'
      ELSE 'low'
    END
  ) STORED,

  -- Bottleneck Identification
  primary_barrier VARCHAR(100),
  barrier_adkar_stage VARCHAR(50) GENERATED ALWAYS AS (
    CASE
      WHEN awareness_score <= desire_score AND awareness_score <= knowledge_score
           AND awareness_score <= ability_score AND awareness_score <= reinforcement_score
        THEN 'awareness'
      WHEN desire_score <= knowledge_score AND desire_score <= ability_score
           AND desire_score <= reinforcement_score
        THEN 'desire'
      WHEN knowledge_score <= ability_score AND knowledge_score <= reinforcement_score
        THEN 'knowledge'
      WHEN ability_score <= reinforcement_score
        THEN 'ability'
      ELSE 'reinforcement'
    END
  ) STORED,

  -- Recommendations
  recommended_interventions TEXT[],
  immediate_actions TEXT[],

  -- Assessment Details
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  assessed_by VARCHAR(255),
  assessment_method VARCHAR(100), -- 'survey', 'interview', 'observation', 'ai_inferred'
  valid_until DATE,
  confidence_level VARCHAR(20),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- At least one target required
  CHECK (
    persona_id IS NOT NULL OR role_id IS NOT NULL OR
    department_id IS NOT NULL OR function_id IS NOT NULL
  )
);

-- =====================================================================
-- ADOPTION TRACKING
-- =====================================================================

-- Adoption Stages
CREATE TABLE IF NOT EXISTS ref_adoption_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(100) NOT NULL, -- 'Awareness', 'Interest', 'Trial', 'Adoption', 'Advocacy'
  description TEXT,

  -- Ordering
  stage_order INTEGER NOT NULL UNIQUE,

  -- Stage Characteristics
  typical_duration_days INTEGER,
  success_criteria TEXT[],
  exit_criteria TEXT[],
  failure_indicators TEXT[],

  -- Interventions
  recommended_interventions TEXT[],
  support_resources TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adoption Tracking Records
CREATE TABLE IF NOT EXISTS adoption_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What is being adopted
  opportunity_id UUID REFERENCES ref_opportunities(id),
  service_layer_id UUID REFERENCES ref_service_layers(id),
  workflow_id UUID REFERENCES workflow_templates(id),
  capability_id UUID REFERENCES ref_capabilities(id),

  -- Who is adopting
  persona_id UUID REFERENCES personas(id),
  role_id UUID REFERENCES org_roles(id),
  department_id UUID REFERENCES org_departments(id),

  -- Current Stage
  current_stage_id UUID REFERENCES ref_adoption_stages(id),
  stage_entered_at TIMESTAMPTZ DEFAULT NOW(),

  -- Usage Metrics
  usage_count INTEGER DEFAULT 0,
  usage_frequency VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'sporadic'
  last_used_at TIMESTAMPTZ,

  -- Satisfaction
  satisfaction_score DECIMAL(3,1) CHECK (satisfaction_score BETWEEN 0 AND 10),
  nps_score INTEGER CHECK (nps_score BETWEEN -100 AND 100),

  -- Progression History
  previous_stage_id UUID REFERENCES ref_adoption_stages(id),
  stages_progressed INTEGER DEFAULT 0,
  regression_count INTEGER DEFAULT 0,

  -- Churn Risk
  churn_risk_score DECIMAL(3,1) CHECK (churn_risk_score BETWEEN 0 AND 10),
  churn_risk_factors TEXT[],

  -- Notes
  adoption_blockers TEXT[],
  success_factors TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adoption Stage Transitions (History)
CREATE TABLE IF NOT EXISTS adoption_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adoption_tracking_id UUID NOT NULL REFERENCES adoption_tracking(id) ON DELETE CASCADE,

  -- Transition Details
  from_stage_id UUID REFERENCES ref_adoption_stages(id),
  to_stage_id UUID NOT NULL REFERENCES ref_adoption_stages(id),

  -- Direction
  is_progression BOOLEAN, -- true = forward, false = regression

  -- Context
  transition_reason TEXT,
  triggered_by VARCHAR(100), -- 'user_action', 'time_based', 'admin', 'system'

  -- Timing
  transitioned_at TIMESTAMPTZ DEFAULT NOW(),
  time_in_previous_stage_days INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- RESISTANCE FACTORS
-- =====================================================================

CREATE TABLE IF NOT EXISTS ref_resistance_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL, -- 'Fear of job loss', 'Lack of training'
  description TEXT,

  -- Classification
  factor_category VARCHAR(50) CHECK (factor_category IN (
    'individual', 'organizational', 'technical', 'cultural', 'process'
  )),
  factor_type VARCHAR(50) CHECK (factor_type IN (
    'fear', 'skill_gap', 'habit', 'trust', 'resource', 'incentive', 'leadership'
  )),

  -- Archetype Susceptibility
  affected_archetypes TEXT[], -- AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC
  archetype_severity JSONB, -- {"SKEPTIC": "high", "LEARNER": "medium"}

  -- Mitigation
  mitigation_strategies TEXT[],
  recommended_interventions TEXT[],
  success_indicators TEXT[],

  -- Impact
  typical_impact_severity VARCHAR(20) CHECK (typical_impact_severity IN (
    'low', 'medium', 'high', 'blocking'
  )),
  typical_resolution_time_days INTEGER,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resistance Assessments
CREATE TABLE IF NOT EXISTS resistance_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Assessment Target
  persona_id UUID REFERENCES personas(id),
  role_id UUID REFERENCES org_roles(id),
  department_id UUID REFERENCES org_departments(id),

  -- For Specific Change
  opportunity_id UUID REFERENCES ref_opportunities(id),
  initiative_id UUID REFERENCES transformation_initiatives(id),

  -- Resistance Factor
  resistance_factor_id UUID NOT NULL REFERENCES ref_resistance_factors(id),

  -- Assessment
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'blocking')),
  likelihood VARCHAR(20) CHECK (likelihood IN ('unlikely', 'possible', 'likely', 'certain')),
  current_status VARCHAR(50) CHECK (current_status IN (
    'identified', 'acknowledged', 'being_addressed', 'resolved', 'escalated'
  )),

  -- Mitigation
  mitigation_plan TEXT,
  mitigation_owner VARCHAR(255),
  mitigation_due_date DATE,

  -- Notes
  evidence TEXT,
  notes TEXT,

  -- Audit
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  assessed_by VARCHAR(255),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- LEARNING & DEVELOPMENT
-- =====================================================================

-- Learning Paths
CREATE TABLE IF NOT EXISTS ref_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL, -- 'MSL to Senior MSL', 'AI Adoption Basics'
  description TEXT,

  -- Classification
  path_type VARCHAR(50) CHECK (path_type IN (
    'career', 'skill', 'certification', 'ai_adoption', 'compliance', 'onboarding'
  )),
  path_category VARCHAR(100),

  -- Target Audience
  target_role_id UUID REFERENCES org_roles(id),
  target_archetype VARCHAR(50), -- AUTOMATOR, ORCHESTRATOR, etc.
  target_ai_maturity_level INTEGER CHECK (target_ai_maturity_level BETWEEN 1 AND 5),

  -- Prerequisites
  prerequisite_path_ids UUID[], -- Other learning paths required first
  prerequisite_skills TEXT[],
  minimum_experience_months INTEGER,

  -- Duration
  estimated_hours INTEGER,
  typical_duration_weeks INTEGER,

  -- Outcomes
  skills_developed TEXT[],
  capabilities_developed UUID[], -- ref_capabilities
  certification_awarded VARCHAR(255),

  -- Metadata
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version VARCHAR(20) DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Modules (Components of Learning Paths)
CREATE TABLE IF NOT EXISTS learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id UUID NOT NULL REFERENCES ref_learning_paths(id) ON DELETE CASCADE,
  unique_id VARCHAR(100) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Ordering
  module_order INTEGER NOT NULL,

  -- Module Type
  module_type VARCHAR(50) CHECK (module_type IN (
    'video', 'reading', 'exercise', 'assessment', 'project',
    'simulation', 'coaching', 'mentoring', 'workshop'
  )),
  delivery_format VARCHAR(50) CHECK (delivery_format IN (
    'self_paced', 'instructor_led', 'blended', 'on_the_job', 'peer_learning'
  )),

  -- Duration
  estimated_minutes INTEGER,

  -- Content Reference
  content_url TEXT,
  rag_collection_id VARCHAR(255), -- Reference to learning content in RAG

  -- Assessment
  has_assessment BOOLEAN DEFAULT false,
  passing_score_percent INTEGER,

  -- Prerequisites
  prerequisite_module_ids UUID[],

  -- Metadata
  is_optional BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Progress Tracking
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Learner
  persona_id UUID REFERENCES personas(id),
  role_id UUID REFERENCES org_roles(id),
  user_id UUID, -- Actual user

  -- Learning Path
  learning_path_id UUID NOT NULL REFERENCES ref_learning_paths(id),

  -- Progress
  current_module_id UUID REFERENCES learning_modules(id),
  modules_completed INTEGER DEFAULT 0,
  total_modules INTEGER,
  completion_percentage DECIMAL(5,2) DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),

  -- Status
  status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN (
    'not_started', 'in_progress', 'paused', 'completed', 'abandoned', 'expired'
  )),

  -- Timing
  started_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date DATE,
  time_spent_minutes INTEGER DEFAULT 0,

  -- Assessment
  assessment_attempts INTEGER DEFAULT 0,
  final_score DECIMAL(5,2),
  passed BOOLEAN,

  -- Certification
  certification_earned BOOLEAN DEFAULT false,
  certification_date DATE,
  certification_expires DATE,

  -- Engagement
  engagement_score DECIMAL(3,1), -- 0-10
  satisfaction_score DECIMAL(3,1), -- 0-10

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module Completion Records
CREATE TABLE IF NOT EXISTS module_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_progress_id UUID NOT NULL REFERENCES learning_progress(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES learning_modules(id),

  -- Completion Details
  status VARCHAR(50) CHECK (status IN (
    'not_started', 'in_progress', 'completed', 'skipped', 'failed'
  )),

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER,

  -- Assessment (if applicable)
  score DECIMAL(5,2),
  passed BOOLEAN,
  attempts INTEGER DEFAULT 1,

  -- Feedback
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  usefulness_rating INTEGER CHECK (usefulness_rating BETWEEN 1 AND 5),
  feedback TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(learning_progress_id, module_id)
);

-- =====================================================================
-- CAPABILITY GAP ANALYSIS
-- =====================================================================

-- Capability Requirements (What capabilities are needed for what)
CREATE TABLE IF NOT EXISTS capability_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What requires this capability
  role_id UUID REFERENCES org_roles(id),
  jtbd_id UUID REFERENCES ref_jtbds(id),
  process_id UUID REFERENCES ref_processes(id),
  opportunity_id UUID REFERENCES ref_opportunities(id),

  -- Required Capability
  capability_id UUID NOT NULL REFERENCES ref_capabilities(id),

  -- Requirement Level
  required_proficiency_level INTEGER CHECK (required_proficiency_level BETWEEN 1 AND 5),
  criticality VARCHAR(20) CHECK (criticality IN ('optional', 'important', 'critical')),

  -- Gap Context
  current_gap_severity VARCHAR(20), -- 'none', 'minor', 'moderate', 'major', 'blocking'

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- At least one context required
  CHECK (
    role_id IS NOT NULL OR jtbd_id IS NOT NULL OR
    process_id IS NOT NULL OR opportunity_id IS NOT NULL
  )
);

-- Capability Assessments (Current state)
CREATE TABLE IF NOT EXISTS capability_gap_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Assessment Target
  persona_id UUID REFERENCES personas(id),
  role_id UUID REFERENCES org_roles(id),
  department_id UUID REFERENCES org_departments(id),

  -- Capability
  capability_id UUID NOT NULL REFERENCES ref_capabilities(id),

  -- Assessment
  current_proficiency_level INTEGER CHECK (current_proficiency_level BETWEEN 1 AND 5),
  target_proficiency_level INTEGER CHECK (target_proficiency_level BETWEEN 1 AND 5),
  gap_score INTEGER GENERATED ALWAYS AS (
    target_proficiency_level - current_proficiency_level
  ) STORED,

  -- Gap Classification
  gap_severity VARCHAR(20) GENERATED ALWAYS AS (
    CASE
      WHEN target_proficiency_level - current_proficiency_level <= 0 THEN 'none'
      WHEN target_proficiency_level - current_proficiency_level = 1 THEN 'minor'
      WHEN target_proficiency_level - current_proficiency_level = 2 THEN 'moderate'
      ELSE 'major'
    END
  ) STORED,

  -- Development Plan
  recommended_learning_paths UUID[], -- ref_learning_paths
  estimated_development_months INTEGER,
  development_priority VARCHAR(20),

  -- Assessment Details
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  assessed_by VARCHAR(255),
  evidence_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Change Readiness
CREATE INDEX IF NOT EXISTS idx_change_readiness_persona ON change_readiness_assessments(persona_id);
CREATE INDEX IF NOT EXISTS idx_change_readiness_role ON change_readiness_assessments(role_id);
CREATE INDEX IF NOT EXISTS idx_change_readiness_dept ON change_readiness_assessments(department_id);
CREATE INDEX IF NOT EXISTS idx_change_readiness_overall ON change_readiness_assessments(overall_readiness);
CREATE INDEX IF NOT EXISTS idx_change_readiness_opportunity ON change_readiness_assessments(opportunity_id);

-- Adoption
CREATE INDEX IF NOT EXISTS idx_adoption_tracking_persona ON adoption_tracking(persona_id);
CREATE INDEX IF NOT EXISTS idx_adoption_tracking_stage ON adoption_tracking(current_stage_id);
CREATE INDEX IF NOT EXISTS idx_adoption_tracking_opportunity ON adoption_tracking(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_adoption_transitions_tracking ON adoption_transitions(adoption_tracking_id);

-- Resistance
CREATE INDEX IF NOT EXISTS idx_resistance_factors_category ON ref_resistance_factors(factor_category);
CREATE INDEX IF NOT EXISTS idx_resistance_assessments_persona ON resistance_assessments(persona_id);
CREATE INDEX IF NOT EXISTS idx_resistance_assessments_severity ON resistance_assessments(severity);

-- Learning
CREATE INDEX IF NOT EXISTS idx_learning_paths_type ON ref_learning_paths(path_type);
CREATE INDEX IF NOT EXISTS idx_learning_paths_role ON ref_learning_paths(target_role_id);
CREATE INDEX IF NOT EXISTS idx_learning_modules_path ON learning_modules(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_persona ON learning_progress(persona_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_status ON learning_progress(status);
CREATE INDEX IF NOT EXISTS idx_learning_progress_path ON learning_progress(learning_path_id);

-- Capability Gaps
CREATE INDEX IF NOT EXISTS idx_capability_requirements_role ON capability_requirements(role_id);
CREATE INDEX IF NOT EXISTS idx_capability_requirements_capability ON capability_requirements(capability_id);
CREATE INDEX IF NOT EXISTS idx_capability_gaps_persona ON capability_gap_assessments(persona_id);
CREATE INDEX IF NOT EXISTS idx_capability_gaps_gap ON capability_gap_assessments(gap_score DESC);

-- =====================================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================================

COMMENT ON TABLE ref_change_dimensions IS 'Change Management: Readiness assessment dimensions';
COMMENT ON TABLE change_readiness_assessments IS 'Change Management: ADKAR-based readiness assessments';
COMMENT ON TABLE ref_adoption_stages IS 'Change Management: Adoption funnel stages';
COMMENT ON TABLE adoption_tracking IS 'Change Management: Tracks adoption progression';
COMMENT ON TABLE ref_resistance_factors IS 'Change Management: Common resistance factors with mitigation';
COMMENT ON TABLE ref_learning_paths IS 'L&D: Learning and development paths';
COMMENT ON TABLE learning_modules IS 'L&D: Modules within learning paths';
COMMENT ON TABLE learning_progress IS 'L&D: Individual learning progress tracking';
COMMENT ON TABLE capability_gap_assessments IS 'L&D: Capability gap analysis';

-- =====================================================================
-- SEED DATA: Adoption Stages
-- =====================================================================

INSERT INTO ref_adoption_stages (unique_id, name, stage_order, description, typical_duration_days, success_criteria, exit_criteria)
VALUES
  ('ADOPT-01-AWARENESS', 'Awareness', 1, 'User knows the solution exists and understands its purpose', 7,
   ARRAY['Has heard about the solution', 'Understands basic value proposition', 'Knows where to access'],
   ARRAY['Expressed interest or curiosity', 'Attended intro session/demo']),

  ('ADOPT-02-INTEREST', 'Interest', 2, 'User is interested and actively learning about the solution', 14,
   ARRAY['Has explored features', 'Asked questions', 'Reviewed documentation'],
   ARRAY['Requested access or trial', 'Attended training']),

  ('ADOPT-03-TRIAL', 'Trial', 3, 'User is actively testing the solution with real work', 21,
   ARRAY['Has used for real task', 'Completed at least one workflow', 'Engaged with support if needed'],
   ARRAY['Completed 3+ use cases', 'Expressed willingness to continue']),

  ('ADOPT-04-ADOPTION', 'Adoption', 4, 'User regularly uses the solution as part of normal workflow', 30,
   ARRAY['Weekly or more frequent usage', 'Integrated into daily routine', 'Requires minimal support'],
   ARRAY['Self-sufficient usage for 30+ days', 'Positive satisfaction score']),

  ('ADOPT-05-ADVOCACY', 'Advocacy', 5, 'User promotes the solution to others and contributes to improvement', NULL,
   ARRAY['Recommends to peers', 'Provides feedback', 'Helps others adopt', 'Suggests improvements'],
   ARRAY['N/A - ongoing state'])
ON CONFLICT (unique_id) DO UPDATE SET
  success_criteria = EXCLUDED.success_criteria,
  exit_criteria = EXCLUDED.exit_criteria;

-- =====================================================================
-- SEED DATA: Resistance Factors
-- =====================================================================

INSERT INTO ref_resistance_factors (unique_id, name, factor_category, factor_type, affected_archetypes, typical_impact_severity, mitigation_strategies)
VALUES
  ('RES-FEAR-REPLACEMENT', 'Fear of Job Replacement', 'individual', 'fear',
   ARRAY['SKEPTIC', 'LEARNER'], 'high',
   ARRAY['Emphasize augmentation not replacement', 'Show career growth opportunities', 'Provide reskilling paths']),

  ('RES-LACK-TRAINING', 'Insufficient Training', 'individual', 'skill_gap',
   ARRAY['LEARNER', 'SKEPTIC'], 'high',
   ARRAY['Structured training programs', 'Self-paced learning modules', 'Peer mentoring']),

  ('RES-HABIT', 'Attachment to Existing Processes', 'individual', 'habit',
   ARRAY['SKEPTIC', 'ORCHESTRATOR'], 'medium',
   ARRAY['Gradual transition', 'Highlight pain points of current process', 'Quick wins demonstration']),

  ('RES-TRUST-AI', 'Distrust of AI Outputs', 'individual', 'trust',
   ARRAY['SKEPTIC'], 'high',
   ARRAY['Transparent AI explanations', 'Human-in-the-loop design', 'Accuracy metrics sharing', 'Gradual autonomy']),

  ('RES-NO-TIME', 'No Time to Learn', 'organizational', 'resource',
   ARRAY['AUTOMATOR', 'ORCHESTRATOR'], 'medium',
   ARRAY['Protected learning time', 'Microlearning modules', 'Integration into workflow']),

  ('RES-UNCLEAR-VALUE', 'Unclear Personal Value', 'organizational', 'incentive',
   ARRAY['SKEPTIC', 'LEARNER'], 'high',
   ARRAY['Clear WIIFM communication', 'Success stories from peers', 'Tie to performance goals']),

  ('RES-LEADERSHIP-GAP', 'Lack of Leadership Support', 'organizational', 'leadership',
   ARRAY['LEARNER', 'SKEPTIC'], 'blocking',
   ARRAY['Executive sponsorship', 'Manager accountability', 'Leadership role modeling']),

  ('RES-TECH-ISSUES', 'Technical Problems/Bugs', 'technical', 'resource',
   ARRAY['AUTOMATOR', 'ORCHESTRATOR'], 'high',
   ARRAY['Robust testing', 'Quick issue resolution', 'Feedback loops', 'Fallback options']),

  ('RES-DATA-QUALITY', 'Poor Data Quality', 'technical', 'resource',
   ARRAY['AUTOMATOR', 'SKEPTIC'], 'high',
   ARRAY['Data quality initiatives', 'Clear data ownership', 'Gradual data cleanup']),

  ('RES-CULTURE-FIT', 'Misalignment with Culture', 'cultural', 'trust',
   ARRAY['SKEPTIC', 'ORCHESTRATOR'], 'high',
   ARRAY['Cultural alignment assessment', 'Change champions network', 'Inclusive design'])
ON CONFLICT (unique_id) DO UPDATE SET
  mitigation_strategies = EXCLUDED.mitigation_strategies;

-- =====================================================================
-- SEED DATA: Change Dimensions
-- =====================================================================

INSERT INTO ref_change_dimensions (unique_id, name, dimension_category, description, assessment_criteria, weight)
VALUES
  ('CHG-DIM-TECH', 'Technical Readiness', 'technical',
   'Ability to use required technology and tools',
   ARRAY['System access', 'Tool proficiency', 'Data availability', 'Integration readiness'], 1.0),

  ('CHG-DIM-SKILL', 'Skill Readiness', 'individual',
   'Possession of required skills and knowledge',
   ARRAY['Core competencies', 'AI literacy', 'Process knowledge', 'Domain expertise'], 1.2),

  ('CHG-DIM-MOTIVATION', 'Motivational Readiness', 'individual',
   'Willingness and motivation to adopt change',
   ARRAY['Personal buy-in', 'Perceived value', 'Engagement level', 'Change history'], 1.3),

  ('CHG-DIM-ORG', 'Organizational Readiness', 'organizational',
   'Organizational structures and support for change',
   ARRAY['Leadership support', 'Resource allocation', 'Process alignment', 'Governance clarity'], 1.1),

  ('CHG-DIM-CULTURE', 'Cultural Readiness', 'cultural',
   'Cultural alignment with the proposed change',
   ARRAY['Innovation mindset', 'Risk tolerance', 'Collaboration norms', 'Learning culture'], 0.9)
ON CONFLICT (unique_id) DO UPDATE SET
  assessment_criteria = EXCLUDED.assessment_criteria;
