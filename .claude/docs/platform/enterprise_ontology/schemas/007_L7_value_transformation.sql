-- =====================================================================
-- L7: VALUE & TRANSFORMATION LAYER
-- =====================================================================
-- Version: 1.0.0
-- Created: 2025-11-28
-- Purpose: Value creation, opportunity identification, and ROI tracking
-- Dependencies: All previous layers (L0-L5)
-- =====================================================================
--
-- ARCHITECTURE PRINCIPLE:
-- This layer makes value visible, measurable, and prioritizable.
-- It enables:
--   - Opportunity identification (VPANES + ODI scoring)
--   - Value realization tracking
--   - ROI measurement
--   - Transformation roadmap generation
--
-- Key Scoring Frameworks:
--   - VPANES: Value, Pain, Adoption, Network, Ease, Strategic
--   - ODI: Opportunity = Importance + MAX(Importance - Satisfaction, 0)
--   - Extended: Domain Relevance, Lifecycle Fit, Synergy
-- =====================================================================

-- =====================================================================
-- VALUE DRIVERS (Types of Value Delivered)
-- =====================================================================

CREATE TABLE IF NOT EXISTS ref_value_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL, -- 'Time Savings', 'Quality Improvement'
  code VARCHAR(20),
  description TEXT,

  -- Classification
  value_category VARCHAR(50) CHECK (value_category IN (
    'efficiency', 'effectiveness', 'compliance', 'innovation',
    'risk_reduction', 'revenue', 'cost_savings', 'experience'
  )),
  value_type VARCHAR(50) CHECK (value_type IN (
    'smarter', 'faster', 'better', 'cheaper' -- Classic value dimensions
  )),

  -- Measurement
  measurement_type VARCHAR(50) CHECK (measurement_type IN (
    'quantitative', 'qualitative', 'hybrid'
  )),
  typical_unit VARCHAR(50), -- 'hours', 'dollars', 'percentage', 'score'

  -- Strategic Alignment
  strategic_importance VARCHAR(20) CHECK (strategic_importance IN (
    'low', 'medium', 'high', 'critical'
  )),
  visibility_to_leadership VARCHAR(20) CHECK (visibility_to_leadership IN (
    'low', 'medium', 'high'
  )),

  -- Stakeholder Impact
  impacts_roles TEXT[], -- Role unique_ids affected
  impacts_functions TEXT[], -- Function unique_ids affected

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- IMPACT METRICS (Specific Measurable Outcomes)
-- =====================================================================

CREATE TABLE IF NOT EXISTS ref_impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Value Driver Link
  value_driver_id UUID REFERENCES ref_value_drivers(id),

  -- Measurement
  metric_type VARCHAR(50) CHECK (metric_type IN (
    'count', 'duration', 'percentage', 'ratio', 'score', 'currency', 'index'
  )),
  unit VARCHAR(50) NOT NULL,
  direction VARCHAR(20) CHECK (direction IN (
    'increase', 'decrease', 'maintain', 'optimize'
  )),

  -- Baseline & Benchmarks
  typical_baseline_value DECIMAL(15,2),
  typical_target_value DECIMAL(15,2),
  industry_benchmark DECIMAL(15,2),
  best_in_class DECIMAL(15,2),

  -- Data Source
  data_source VARCHAR(255),
  measurement_frequency VARCHAR(50),

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- OPPORTUNITIES (AI/GenAI Transformation Opportunities)
-- =====================================================================
-- Note: ref_opportunities exists in 002_ontology_schema.sql
-- Extending with more detailed fields here

ALTER TABLE ref_opportunities ADD COLUMN IF NOT EXISTS opportunity_category VARCHAR(50);
-- CHECK (opportunity_category IN ('automation', 'augmentation', 'redesign', 'insight', 'training'))

ALTER TABLE ref_opportunities ADD COLUMN IF NOT EXISTS intervention_type VARCHAR(50);
-- CHECK (intervention_type IN ('automate', 'augment', 'redesign'))

ALTER TABLE ref_opportunities ADD COLUMN IF NOT EXISTS target_process_id UUID REFERENCES ref_processes(id);
ALTER TABLE ref_opportunities ADD COLUMN IF NOT EXISTS target_workflow_id UUID REFERENCES workflow_templates(id);
ALTER TABLE ref_opportunities ADD COLUMN IF NOT EXISTS target_jtbd_id UUID REFERENCES ref_jtbds(id);

-- Primary Value Driver
ALTER TABLE ref_opportunities ADD COLUMN IF NOT EXISTS primary_value_driver_id UUID REFERENCES ref_value_drivers(id);

-- Service Layer Recommendation
ALTER TABLE ref_opportunities ADD COLUMN IF NOT EXISTS recommended_service_layer VARCHAR(50);
-- CHECK (recommended_service_layer IN ('ASK_EXPERT', 'ASK_PANEL', 'WORKFLOWS', 'SOLUTION_BUILDER'))

-- Tier Classification
ALTER TABLE ref_opportunities ADD COLUMN IF NOT EXISTS tier INTEGER CHECK (tier BETWEEN 1 AND 3);
-- Tier 1: Immediate, quick wins
-- Tier 2: Medium-term, moderate effort
-- Tier 3: Strategic, longer-term

-- =====================================================================
-- OPPORTUNITY SCORING (VPANES + Extended)
-- =====================================================================

CREATE TABLE IF NOT EXISTS opportunity_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES ref_opportunities(id) ON DELETE CASCADE,

  -- VPANES Scoring (0-10 each)
  vpanes_value DECIMAL(3,1) NOT NULL CHECK (vpanes_value BETWEEN 0 AND 10),
  vpanes_pain DECIMAL(3,1) NOT NULL CHECK (vpanes_pain BETWEEN 0 AND 10),
  vpanes_adoption DECIMAL(3,1) NOT NULL CHECK (vpanes_adoption BETWEEN 0 AND 10),
  vpanes_network DECIMAL(3,1) NOT NULL CHECK (vpanes_network BETWEEN 0 AND 10),
  vpanes_ease DECIMAL(3,1) NOT NULL CHECK (vpanes_ease BETWEEN 0 AND 10),
  vpanes_strategic DECIMAL(3,1) NOT NULL CHECK (vpanes_strategic BETWEEN 0 AND 10),

  -- Extended Scoring (from PRD v2)
  domain_relevance DECIMAL(3,1) DEFAULT 5.0 CHECK (domain_relevance BETWEEN 0 AND 10),
  lifecycle_fit DECIMAL(3,1) DEFAULT 5.0 CHECK (lifecycle_fit BETWEEN 0 AND 10),
  synergy_score DECIMAL(3,1) DEFAULT 5.0 CHECK (synergy_score BETWEEN 0 AND 10),

  -- Computed VPANES Total (sum of 6 scores)
  vpanes_total DECIMAL(4,1) GENERATED ALWAYS AS (
    vpanes_value + vpanes_pain + vpanes_adoption +
    vpanes_network + vpanes_ease + vpanes_strategic
  ) STORED,

  -- Weighted Score (using PRD v2 weights)
  -- Value: 0.22, Pain: 0.18, Adoption: 0.13, Network: 0.15
  -- Ease: 0.12, Strategic: 0.10, Domain: 0.05, Lifecycle: 0.03, Synergy: 0.02
  weighted_score DECIMAL(5,2) GENERATED ALWAYS AS (
    (vpanes_value * 0.22) + (vpanes_pain * 0.18) + (vpanes_adoption * 0.13) +
    (vpanes_network * 0.15) + (vpanes_ease * 0.12) + (vpanes_strategic * 0.10) +
    (domain_relevance * 0.05) + (lifecycle_fit * 0.03) + (synergy_score * 0.02)
  ) STORED,

  -- Scoring Context
  scored_for_persona_id UUID REFERENCES personas(id),
  scored_for_role_id UUID REFERENCES org_roles(id),
  scored_for_department_id UUID REFERENCES org_departments(id),

  -- L0 Domain Context
  therapeutic_area_id UUID REFERENCES l0_therapeutic_areas(id),
  product_id UUID REFERENCES l0_products(id),

  -- Audit
  scored_by VARCHAR(255),
  scoring_method VARCHAR(50), -- 'manual', 'ai_assisted', 'automated'
  scored_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,

  -- Version for re-scoring
  version INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ODI SCORING (Outcome-Driven Innovation for JTBDs)
-- =====================================================================

CREATE TABLE IF NOT EXISTS jtbd_odi_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES ref_jtbds(id) ON DELETE CASCADE,

  -- For which context
  persona_id UUID REFERENCES personas(id),
  role_id UUID REFERENCES org_roles(id),
  archetype VARCHAR(50), -- AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC

  -- ODI Core Scores (0-10)
  importance_score DECIMAL(3,1) NOT NULL CHECK (importance_score BETWEEN 0 AND 10),
  satisfaction_score DECIMAL(3,1) NOT NULL CHECK (satisfaction_score BETWEEN 0 AND 10),

  -- Calculated Opportunity Score
  -- Formula: Importance + MAX(Importance - Satisfaction, 0)
  -- Max possible: 20 (when importance=10, satisfaction=0)
  opportunity_score DECIMAL(4,1) GENERATED ALWAYS AS (
    importance_score + GREATEST(importance_score - satisfaction_score, 0)
  ) STORED,

  -- Classification based on score
  -- Over-served: score < 10, Under-served: score 10-15, Highly Under-served: score > 15
  opportunity_classification VARCHAR(50) GENERATED ALWAYS AS (
    CASE
      WHEN importance_score + GREATEST(importance_score - satisfaction_score, 0) > 15 THEN 'highly_underserved'
      WHEN importance_score + GREATEST(importance_score - satisfaction_score, 0) >= 10 THEN 'underserved'
      ELSE 'adequately_served'
    END
  ) STORED,

  -- Confidence
  sample_size INTEGER,
  confidence_level VARCHAR(20),

  -- Audit
  scored_at TIMESTAMPTZ DEFAULT NOW(),
  scored_by VARCHAR(255),
  data_source VARCHAR(255),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(jtbd_id, persona_id, role_id, archetype)
);

-- =====================================================================
-- ROI TRACKING
-- =====================================================================

CREATE TABLE IF NOT EXISTS opportunity_roi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES ref_opportunities(id) ON DELETE CASCADE,

  -- Investment
  implementation_cost DECIMAL(15,2),
  implementation_cost_currency VARCHAR(3) DEFAULT 'USD',
  ongoing_cost_monthly DECIMAL(15,2),
  ongoing_cost_currency VARCHAR(3) DEFAULT 'USD',

  -- FTE Impact
  fte_required_implementation DECIMAL(5,2),
  fte_saved_ongoing DECIMAL(5,2),

  -- Benefits (Annual)
  expected_annual_benefit DECIMAL(15,2),
  benefit_currency VARCHAR(3) DEFAULT 'USD',
  benefit_type VARCHAR(50) CHECK (benefit_type IN (
    'hard_savings', 'soft_savings', 'revenue', 'cost_avoidance', 'risk_reduction'
  )),

  -- Timeline
  time_to_value_days INTEGER,
  payback_period_months INTEGER,
  benefit_realization_start DATE,

  -- Calculated Metrics
  roi_percentage DECIMAL(8,2),
  npv_3year DECIMAL(15,2),
  irr_percentage DECIMAL(6,2),

  -- Status
  status VARCHAR(50) DEFAULT 'projected' CHECK (status IN (
    'projected', 'in_progress', 'validated', 'realized', 'revised'
  )),

  -- Validation
  validation_date DATE,
  validation_notes TEXT,
  validated_by VARCHAR(255),

  -- Actuals (post-implementation)
  actual_implementation_cost DECIMAL(15,2),
  actual_annual_benefit DECIMAL(15,2),
  actual_roi_percentage DECIMAL(8,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- BENEFIT TRACKING (Realized Benefits Measurement)
-- =====================================================================

CREATE TABLE IF NOT EXISTS benefit_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES ref_opportunities(id) ON DELETE CASCADE,
  impact_metric_id UUID NOT NULL REFERENCES ref_impact_metrics(id),

  -- Measurement Context
  measured_for_department_id UUID REFERENCES org_departments(id),
  measured_for_role_id UUID REFERENCES org_roles(id),
  measured_for_persona_id UUID REFERENCES personas(id),

  -- Values
  baseline_value DECIMAL(15,2),
  current_value DECIMAL(15,2),
  target_value DECIMAL(15,2),

  -- Calculated Improvement
  improvement_absolute DECIMAL(15,2) GENERATED ALWAYS AS (
    current_value - baseline_value
  ) STORED,
  improvement_percentage DECIMAL(8,2) GENERATED ALWAYS AS (
    CASE WHEN baseline_value != 0
    THEN ((current_value - baseline_value) / ABS(baseline_value)) * 100
    ELSE 0 END
  ) STORED,

  -- Period
  measurement_period_start DATE NOT NULL,
  measurement_period_end DATE NOT NULL,

  -- Data Quality
  data_source VARCHAR(255),
  confidence_level VARCHAR(20) CHECK (confidence_level IN (
    'low', 'medium', 'high', 'verified'
  )),
  sample_size INTEGER,

  -- Audit
  measured_by VARCHAR(255),
  measurement_method VARCHAR(255),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- TRANSFORMATION INITIATIVES (Programs of Work)
-- =====================================================================

CREATE TABLE IF NOT EXISTS transformation_initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Classification
  initiative_type VARCHAR(50) CHECK (initiative_type IN (
    'automation', 'optimization', 'enablement', 'redesign', 'innovation'
  )),
  strategic_theme VARCHAR(100),

  -- Scope
  target_functions UUID[], -- org_business_functions
  target_departments UUID[], -- org_departments
  target_processes UUID[], -- ref_processes

  -- Bundled Opportunities
  opportunity_ids UUID[], -- ref_opportunities included

  -- Timeline
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,

  -- Investment
  total_budget DECIMAL(15,2),
  budget_currency VARCHAR(3) DEFAULT 'USD',

  -- Expected Value
  total_expected_benefit DECIMAL(15,2),
  expected_roi_percentage DECIMAL(8,2),

  -- Status
  status VARCHAR(50) DEFAULT 'planned' CHECK (status IN (
    'ideation', 'planned', 'approved', 'in_progress',
    'on_hold', 'completed', 'cancelled'
  )),

  -- Governance
  executive_sponsor VARCHAR(255),
  program_manager VARCHAR(255),

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initiative-Opportunity Mapping
CREATE TABLE IF NOT EXISTS initiative_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES transformation_initiatives(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES ref_opportunities(id) ON DELETE CASCADE,

  -- Prioritization within initiative
  priority_rank INTEGER,
  dependency_order INTEGER,

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'deferred', 'cancelled'
  )),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(initiative_id, opportunity_id)
);

-- =====================================================================
-- AI MATURITY MODEL
-- =====================================================================

CREATE TABLE IF NOT EXISTS ref_ai_maturity_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  level INTEGER NOT NULL UNIQUE CHECK (level BETWEEN 1 AND 5),
  name VARCHAR(100) NOT NULL,
  description TEXT,

  -- Characteristics
  automation_level VARCHAR(50),
  human_involvement VARCHAR(50),
  ai_capabilities TEXT[],
  typical_use_cases TEXT[],

  -- Progression
  prerequisites TEXT[],
  enablers TEXT[],
  barriers TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Maturity Assessments
CREATE TABLE IF NOT EXISTS ai_maturity_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Assessment Target
  persona_id UUID REFERENCES personas(id),
  role_id UUID REFERENCES org_roles(id),
  department_id UUID REFERENCES org_departments(id),
  function_id UUID REFERENCES org_business_functions(id),

  -- Maturity Score
  current_maturity_level INTEGER CHECK (current_maturity_level BETWEEN 1 AND 5),
  target_maturity_level INTEGER CHECK (target_maturity_level BETWEEN 1 AND 5),
  maturity_gap INTEGER GENERATED ALWAYS AS (
    target_maturity_level - current_maturity_level
  ) STORED,

  -- Dimension Scores (0-10)
  awareness_score DECIMAL(3,1) CHECK (awareness_score BETWEEN 0 AND 10),
  capability_score DECIMAL(3,1) CHECK (capability_score BETWEEN 0 AND 10),
  adoption_score DECIMAL(3,1) CHECK (adoption_score BETWEEN 0 AND 10),
  infrastructure_score DECIMAL(3,1) CHECK (infrastructure_score BETWEEN 0 AND 10),
  governance_score DECIMAL(3,1) CHECK (governance_score BETWEEN 0 AND 10),

  -- Barriers & Enablers
  primary_barriers TEXT[],
  key_enablers TEXT[],
  recommended_actions TEXT[],

  -- Assessment Details
  assessment_date DATE NOT NULL,
  assessed_by VARCHAR(255),
  assessment_method VARCHAR(100),
  valid_until DATE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- VALUE REALIZATION DASHBOARD SUPPORT
-- =====================================================================

-- Opportunity Funnel Status
CREATE TABLE IF NOT EXISTS opportunity_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES ref_opportunities(id) ON DELETE CASCADE,

  -- Pipeline Stage
  stage VARCHAR(50) NOT NULL CHECK (stage IN (
    'identified', 'assessed', 'prioritized', 'approved',
    'implementing', 'piloting', 'scaling', 'realized', 'archived'
  )),

  -- Stage Entry/Exit
  entered_stage_at TIMESTAMPTZ DEFAULT NOW(),
  exited_stage_at TIMESTAMPTZ,

  -- Stage Owner
  stage_owner VARCHAR(255),

  -- Notes
  stage_notes TEXT,
  blockers TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Value Drivers
CREATE INDEX IF NOT EXISTS idx_value_drivers_category ON ref_value_drivers(value_category);
CREATE INDEX IF NOT EXISTS idx_value_drivers_type ON ref_value_drivers(value_type);

-- Impact Metrics
CREATE INDEX IF NOT EXISTS idx_impact_metrics_driver ON ref_impact_metrics(value_driver_id);
CREATE INDEX IF NOT EXISTS idx_impact_metrics_type ON ref_impact_metrics(metric_type);

-- Opportunity Scores
CREATE INDEX IF NOT EXISTS idx_opp_scores_opportunity ON opportunity_scores(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opp_scores_weighted ON opportunity_scores(weighted_score DESC);
CREATE INDEX IF NOT EXISTS idx_opp_scores_persona ON opportunity_scores(scored_for_persona_id);
CREATE INDEX IF NOT EXISTS idx_opp_scores_role ON opportunity_scores(scored_for_role_id);

-- ODI Scores
CREATE INDEX IF NOT EXISTS idx_odi_scores_jtbd ON jtbd_odi_scores(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_odi_scores_opportunity ON jtbd_odi_scores(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_odi_scores_classification ON jtbd_odi_scores(opportunity_classification);

-- ROI
CREATE INDEX IF NOT EXISTS idx_roi_opportunity ON opportunity_roi(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_roi_status ON opportunity_roi(status);

-- Benefits
CREATE INDEX IF NOT EXISTS idx_benefits_opportunity ON benefit_tracking(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_benefits_period ON benefit_tracking(measurement_period_start, measurement_period_end);

-- Initiatives
CREATE INDEX IF NOT EXISTS idx_initiatives_status ON transformation_initiatives(status);
CREATE INDEX IF NOT EXISTS idx_initiative_opps_init ON initiative_opportunities(initiative_id);

-- Maturity
CREATE INDEX IF NOT EXISTS idx_maturity_persona ON ai_maturity_assessments(persona_id);
CREATE INDEX IF NOT EXISTS idx_maturity_role ON ai_maturity_assessments(role_id);
CREATE INDEX IF NOT EXISTS idx_maturity_gap ON ai_maturity_assessments(maturity_gap DESC);

-- Pipeline
CREATE INDEX IF NOT EXISTS idx_pipeline_opportunity ON opportunity_pipeline(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON opportunity_pipeline(stage);

-- =====================================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================================

COMMENT ON TABLE ref_value_drivers IS 'L7: Types of value delivered (efficiency, quality, compliance, etc.)';
COMMENT ON TABLE ref_impact_metrics IS 'L7: Measurable outcomes tied to value drivers';
COMMENT ON TABLE opportunity_scores IS 'L7: VPANES + extended scoring for opportunities';
COMMENT ON TABLE jtbd_odi_scores IS 'L7: Outcome-Driven Innovation scores for JTBDs';
COMMENT ON TABLE opportunity_roi IS 'L7: ROI tracking for opportunities';
COMMENT ON TABLE benefit_tracking IS 'L7: Actual realized benefits measurement';
COMMENT ON TABLE transformation_initiatives IS 'L7: Strategic transformation programs';
COMMENT ON TABLE ref_ai_maturity_levels IS 'L7: 5-level AI maturity model';
COMMENT ON TABLE ai_maturity_assessments IS 'L7: AI maturity assessments for personas/roles/depts';
COMMENT ON TABLE opportunity_pipeline IS 'L7: Opportunity funnel tracking';

-- =====================================================================
-- SEED DATA: Value Drivers
-- =====================================================================

INSERT INTO ref_value_drivers (unique_id, name, code, value_category, value_type, measurement_type, typical_unit, strategic_importance, visibility_to_leadership)
VALUES
  -- Efficiency (Faster)
  ('VD-TIME-SAVINGS', 'Time Savings', 'TIME', 'efficiency', 'faster', 'quantitative', 'hours', 'high', 'high'),
  ('VD-CYCLE-TIME', 'Cycle Time Reduction', 'CYCLE', 'efficiency', 'faster', 'quantitative', 'days', 'high', 'high'),
  ('VD-THROUGHPUT', 'Throughput Increase', 'THRU', 'efficiency', 'faster', 'quantitative', 'count', 'medium', 'medium'),

  -- Effectiveness (Better)
  ('VD-QUALITY', 'Quality Improvement', 'QUAL', 'effectiveness', 'better', 'hybrid', 'score', 'high', 'medium'),
  ('VD-ACCURACY', 'Accuracy Improvement', 'ACC', 'effectiveness', 'better', 'quantitative', 'percentage', 'high', 'medium'),
  ('VD-CONSISTENCY', 'Consistency Improvement', 'CONS', 'effectiveness', 'better', 'quantitative', 'percentage', 'medium', 'low'),

  -- Compliance (Risk)
  ('VD-COMPLIANCE', 'Compliance Improvement', 'COMP', 'compliance', 'better', 'hybrid', 'score', 'critical', 'high'),
  ('VD-RISK-REDUCTION', 'Risk Reduction', 'RISK', 'risk_reduction', 'better', 'qualitative', 'level', 'critical', 'high'),
  ('VD-AUDIT-READY', 'Audit Readiness', 'AUDIT', 'compliance', 'better', 'qualitative', 'level', 'high', 'high'),

  -- Cost (Cheaper)
  ('VD-COST-SAVINGS', 'Cost Savings', 'COST', 'cost_savings', 'cheaper', 'quantitative', 'currency', 'high', 'high'),
  ('VD-COST-AVOIDANCE', 'Cost Avoidance', 'AVOID', 'cost_savings', 'cheaper', 'quantitative', 'currency', 'medium', 'medium'),

  -- Innovation (Smarter)
  ('VD-INSIGHT-QUALITY', 'Insight Quality', 'INSI', 'innovation', 'smarter', 'qualitative', 'score', 'high', 'medium'),
  ('VD-DECISION-SPEED', 'Decision Speed', 'DECI', 'innovation', 'smarter', 'quantitative', 'hours', 'high', 'high'),

  -- Experience
  ('VD-USER-SATISFACTION', 'User Satisfaction', 'SAT', 'experience', 'better', 'quantitative', 'score', 'medium', 'medium'),
  ('VD-ADOPTION', 'Adoption Rate', 'ADOPT', 'experience', 'better', 'quantitative', 'percentage', 'medium', 'high')
ON CONFLICT (unique_id) DO UPDATE SET
  strategic_importance = EXCLUDED.strategic_importance;

-- =====================================================================
-- SEED DATA: AI Maturity Levels
-- =====================================================================

INSERT INTO ref_ai_maturity_levels (unique_id, level, name, description, automation_level, human_involvement, ai_capabilities, typical_use_cases)
VALUES
  ('AIM-L1-MANUAL', 1, 'Manual', 'Traditional manual processes with no AI assistance', 'none', 'full', ARRAY['none'], ARRAY['Paper-based workflows', 'Manual data entry', 'Phone/email only']),

  ('AIM-L2-ASSISTED', 2, 'AI-Assisted', 'Human-led work with AI providing suggestions and support', 'low', 'primary', ARRAY['search', 'suggestions', 'templates'], ARRAY['Smart search', 'Template recommendations', 'Basic chatbots']),

  ('AIM-L3-AUGMENTED', 3, 'AI-Augmented', 'AI handles routine work, humans focus on exceptions and decisions', 'medium', 'oversight', ARRAY['drafting', 'summarization', 'classification', 'routing'], ARRAY['Auto-drafting', 'Document summarization', 'Intelligent routing', 'First-pass analysis']),

  ('AIM-L4-AUTOMATED', 4, 'AI-Automated', 'AI executes most work autonomously with human approval gates', 'high', 'approval', ARRAY['end_to_end_workflows', 'decision_support', 'proactive_recommendations'], ARRAY['Automated inquiry response', 'Proactive insights', 'Auto-generated reports']),

  ('AIM-L5-ORCHESTRATED', 5, 'AI-Orchestrated', 'Multi-agent AI systems coordinate complex work with minimal human intervention', 'full', 'exception_only', ARRAY['multi_agent_orchestration', 'autonomous_optimization', 'predictive_actions'], ARRAY['Autonomous scientific analysis', 'Predictive opportunity identification', 'Self-optimizing workflows'])
ON CONFLICT (unique_id) DO UPDATE SET
  description = EXCLUDED.description,
  ai_capabilities = EXCLUDED.ai_capabilities;
