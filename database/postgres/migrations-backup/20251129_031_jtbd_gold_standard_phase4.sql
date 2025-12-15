-- ================================================================
-- JTBD GOLD STANDARD SCHEMA - PHASE 4
-- Persona & AI Enhancements
-- ================================================================
-- Version: 4.0.0
-- Date: 2024-11-29
-- Description: Enhances personas with work mix attributes, creates archetype
--              derivation, AI opportunity ranking, and strategic cascade views
-- Source: SCHEMA_DELTA_ANALYSIS.md (Complete Schema v3.0)
-- ================================================================

BEGIN;

-- ================================================================
-- SECTION 0: CREATE MISSING FOUNDATIONAL TABLES
-- These tables are required by views and functions in this migration
-- ================================================================

-- 0.1: OKR (Objectives and Key Results) Table
CREATE TABLE IF NOT EXISTS okr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  strategic_pillar_id UUID REFERENCES strategic_pillars(id) ON DELETE SET NULL,

  -- Identity
  code VARCHAR(50) NOT NULL,
  objective TEXT NOT NULL,
  description TEXT,

  -- Classification
  level TEXT NOT NULL DEFAULT 'department'
    CHECK (level IN ('company', 'department', 'team', 'individual')),
  objective_type TEXT DEFAULT 'committed'
    CHECK (objective_type IN ('committed', 'aspirational', 'learning')),

  -- Timeframe
  timeframe TEXT NOT NULL DEFAULT 'quarterly'
    CHECK (timeframe IN ('annual', 'quarterly', 'monthly')),
  period_start DATE,
  period_end DATE,

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'on_hold')),

  -- Ownership
  owner_id UUID,
  owner_type TEXT DEFAULT 'persona'
    CHECK (owner_type IN ('persona', 'role', 'department', 'team')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_okr_tenant ON okr(tenant_id);
CREATE INDEX IF NOT EXISTS idx_okr_pillar ON okr(strategic_pillar_id);
CREATE INDEX IF NOT EXISTS idx_okr_status ON okr(status);
CREATE INDEX IF NOT EXISTS idx_okr_timeframe ON okr(timeframe, period_start, period_end);

COMMENT ON TABLE okr IS 'Objectives and Key Results aligned to strategic pillars';

-- Enable RLS
ALTER TABLE okr ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS okr_tenant_isolation ON okr;
CREATE POLICY okr_tenant_isolation ON okr
  FOR ALL USING (tenant_id = COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::uuid,
    tenant_id
  ));

-- 0.2: Key Result Table
CREATE TABLE IF NOT EXISTS key_result (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  okr_id UUID NOT NULL REFERENCES okr(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  kr_code VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,

  -- Metrics
  metric_type TEXT DEFAULT 'percentage'
    CHECK (metric_type IN ('percentage', 'number', 'currency', 'boolean', 'milestone')),
  baseline_value NUMERIC,
  target_value NUMERIC,
  current_value NUMERIC,
  unit VARCHAR(50),

  -- Progress
  progress_percentage NUMERIC(5,2) DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  confidence_level NUMERIC(3,2) CHECK (confidence_level BETWEEN 0 AND 1),

  -- Status
  status TEXT DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'on_track', 'at_risk', 'behind', 'achieved', 'missed')),

  -- Weighting
  weight NUMERIC(3,2) DEFAULT 1.0 CHECK (weight BETWEEN 0 AND 1),

  -- Ownership
  owner_id UUID,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(okr_id, kr_code)
);

CREATE INDEX IF NOT EXISTS idx_key_result_okr ON key_result(okr_id);
CREATE INDEX IF NOT EXISTS idx_key_result_tenant ON key_result(tenant_id);
CREATE INDEX IF NOT EXISTS idx_key_result_status ON key_result(status);
CREATE INDEX IF NOT EXISTS idx_key_result_progress ON key_result(progress_percentage DESC);

COMMENT ON TABLE key_result IS 'Measurable key results under OKRs';

-- Enable RLS
ALTER TABLE key_result ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS key_result_tenant_isolation ON key_result;
CREATE POLICY key_result_tenant_isolation ON key_result
  FOR ALL USING (tenant_id = COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::uuid,
    tenant_id
  ));

-- 0.3: OKR-JTBD Mapping Table
CREATE TABLE IF NOT EXISTS okr_jtbd_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  okr_id UUID NOT NULL REFERENCES okr(id) ON DELETE CASCADE,
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Alignment Details
  alignment_type TEXT DEFAULT 'contributes'
    CHECK (alignment_type IN ('primary', 'contributes', 'enables', 'measures')),
  contribution_weight NUMERIC(3,2) DEFAULT 1.0 CHECK (contribution_weight BETWEEN 0 AND 1),

  -- Evidence
  alignment_rationale TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(okr_id, jtbd_id)
);

CREATE INDEX IF NOT EXISTS idx_okr_jtbd_mapping_okr ON okr_jtbd_mapping(okr_id);
CREATE INDEX IF NOT EXISTS idx_okr_jtbd_mapping_jtbd ON okr_jtbd_mapping(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_okr_jtbd_mapping_tenant ON okr_jtbd_mapping(tenant_id);

COMMENT ON TABLE okr_jtbd_mapping IS 'Maps OKRs to JTBDs showing alignment and contribution';

-- Enable RLS
ALTER TABLE okr_jtbd_mapping ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS okr_jtbd_mapping_tenant_isolation ON okr_jtbd_mapping;
CREATE POLICY okr_jtbd_mapping_tenant_isolation ON okr_jtbd_mapping
  FOR ALL USING (tenant_id = COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::uuid,
    tenant_id
  ));

-- 0.4: JTBD-Persona Mapping Table
CREATE TABLE IF NOT EXISTS jtbd_persona_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Allocation
  time_allocation_percentage NUMERIC(5,2) DEFAULT 0
    CHECK (time_allocation_percentage BETWEEN 0 AND 100),
  effort_weight NUMERIC(3,2) DEFAULT 1.0
    CHECK (effort_weight BETWEEN 0.1 AND 3.0),

  -- Role in JTBD
  involvement_type TEXT DEFAULT 'performer'
    CHECK (involvement_type IN ('owner', 'performer', 'contributor', 'reviewer', 'approver')),
  is_primary_persona BOOLEAN DEFAULT false,

  -- Frequency
  frequency TEXT DEFAULT 'weekly'
    CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'ad_hoc')),

  -- Pain & Gain
  pain_level INTEGER CHECK (pain_level BETWEEN 1 AND 10),
  satisfaction_level INTEGER CHECK (satisfaction_level BETWEEN 1 AND 10),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(jtbd_id, persona_id)
);

CREATE INDEX IF NOT EXISTS idx_jtbd_persona_mapping_jtbd ON jtbd_persona_mapping(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_persona_mapping_persona ON jtbd_persona_mapping(persona_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_persona_mapping_tenant ON jtbd_persona_mapping(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_persona_mapping_primary ON jtbd_persona_mapping(is_primary_persona) WHERE is_primary_persona = true;

COMMENT ON TABLE jtbd_persona_mapping IS 'Maps personas to JTBDs with time allocation and involvement details';

-- Enable RLS
ALTER TABLE jtbd_persona_mapping ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS jtbd_persona_mapping_tenant_isolation ON jtbd_persona_mapping;
CREATE POLICY jtbd_persona_mapping_tenant_isolation ON jtbd_persona_mapping
  FOR ALL USING (tenant_id = COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::uuid,
    tenant_id
  ));

-- ✓ SECTION 0 COMPLETE: Created okr, key_result, okr_jtbd_mapping, jtbd_persona_mapping tables

-- ================================================================
-- SECTION 1: ENHANCE PERSONAS TABLE WITH WORK MIX ATTRIBUTES
-- Note: personas table uses persona_name (not name), source_role_id (not role_id)
-- ================================================================

-- First add tenant_id if missing (for RLS support)
ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- OKR Ownership
ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  owned_okr_count INTEGER DEFAULT 0;

ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  contributed_okr_count INTEGER DEFAULT 0;

-- Work Pattern Ratios
ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  project_work_ratio NUMERIC(3,2);

ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  bau_work_ratio NUMERIC(3,2);

-- Complexity & AI Scores
ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  work_complexity_score NUMERIC(3,2);

ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  ai_readiness_score NUMERIC(3,2);

-- Derived Archetype (2x2 Matrix Result)
ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  derived_archetype TEXT;

-- Preferred Service Layer
ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  preferred_service_layer TEXT;

-- Work Dominance
ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  work_dominance TEXT;

-- Add comments
COMMENT ON COLUMN personas.tenant_id IS 'Tenant for multi-tenancy RLS';
COMMENT ON COLUMN personas.owned_okr_count IS 'Count of OKRs this persona directly owns';
COMMENT ON COLUMN personas.contributed_okr_count IS 'Count of OKRs this persona contributes to via JTBDs';
COMMENT ON COLUMN personas.project_work_ratio IS 'Percentage of work that is project-based (0.00-1.00)';
COMMENT ON COLUMN personas.bau_work_ratio IS 'Percentage of work that is BAU-based (0.00-1.00)';
COMMENT ON COLUMN personas.work_complexity_score IS 'Derived from JTBD complexity distribution (0.00-1.00)';
COMMENT ON COLUMN personas.ai_readiness_score IS 'AI adoption readiness based on persona attributes (0.00-1.00)';
COMMENT ON COLUMN personas.derived_archetype IS 'Auto-computed from 2x2 matrix: work_complexity x ai_readiness';
COMMENT ON COLUMN personas.preferred_service_layer IS 'Derived from archetype: L1 (expert), L2 (panel), L3 (workflow), L4 (solution)';
COMMENT ON COLUMN personas.work_dominance IS 'Dominant work pattern: project_heavy, bau_heavy, or balanced';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_personas_tenant ON personas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_personas_archetype ON personas(derived_archetype);
CREATE INDEX IF NOT EXISTS idx_personas_service_layer ON personas(preferred_service_layer);
CREATE INDEX IF NOT EXISTS idx_personas_work_dominance ON personas(work_dominance);
CREATE INDEX IF NOT EXISTS idx_personas_ai_readiness ON personas(ai_readiness_score DESC);
CREATE INDEX IF NOT EXISTS idx_personas_source_role ON personas(source_role_id);

-- ✓ SECTION 1 COMPLETE: Personas table enhanced with work mix attributes

-- ================================================================
-- SECTION 2: ARCHETYPE DERIVATION FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION derive_persona_archetype(
  p_work_complexity NUMERIC,
  p_ai_readiness NUMERIC
) RETURNS TEXT AS $$
BEGIN
  -- 2x2 Matrix Logic
  -- ┌─────────────────────────────────────────────────────────┐
  -- │              AI READINESS                               │
  -- │           Low (<0.5)      High (>=0.5)                 │
  -- │     ┌──────────────┬──────────────┐                    │
  -- │ Low │   LEARNER    │  AUTOMATOR   │  WORK              │
  -- │     │ Needs HITL   │ Wants speed  │  COMPLEXITY        │
  -- │     ├──────────────┼──────────────┤                    │
  -- │ High│   SKEPTIC    │ ORCHESTRATOR │                    │
  -- │     │ Needs proof  │ Wants power  │                    │
  -- │     └──────────────┴──────────────┘                    │
  -- └─────────────────────────────────────────────────────────┘

  IF p_work_complexity < 0.5 AND p_ai_readiness >= 0.5 THEN
    RETURN 'automator';    -- Low complexity, High AI readiness
  ELSIF p_work_complexity >= 0.5 AND p_ai_readiness >= 0.5 THEN
    RETURN 'orchestrator'; -- High complexity, High AI readiness
  ELSIF p_work_complexity < 0.5 AND p_ai_readiness < 0.5 THEN
    RETURN 'learner';      -- Low complexity, Low AI readiness
  ELSE
    RETURN 'skeptic';      -- High complexity, Low AI readiness
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION derive_persona_archetype(NUMERIC, NUMERIC) IS
  'Derives persona archetype from 2x2 matrix of work_complexity x ai_readiness';

-- Derive service layer from archetype
CREATE OR REPLACE FUNCTION derive_service_layer_from_archetype(
  p_archetype TEXT
) RETURNS TEXT AS $$
BEGIN
  CASE p_archetype
    WHEN 'automator' THEN RETURN 'L3_workflow'; -- Wants automated workflows
    WHEN 'orchestrator' THEN RETURN 'L4_solution'; -- Wants full solution
    WHEN 'learner' THEN RETURN 'L1_expert'; -- Needs expert guidance with HITL
    WHEN 'skeptic' THEN RETURN 'L2_panel'; -- Needs multi-perspective for trust
    ELSE RETURN 'L1_expert';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION derive_service_layer_from_archetype IS
  'Maps persona archetype to recommended AI service layer';

-- ✓ SECTION 2 COMPLETE: Archetype derivation functions created

-- ================================================================
-- SECTION 3: PERSONA WORK MIX UPDATE FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION update_persona_work_mix(p_persona_id UUID)
RETURNS VOID AS $$
DECLARE
  v_project_ratio NUMERIC;
  v_bau_ratio NUMERIC;
  v_complexity_score NUMERIC;
  v_dominance TEXT;
  v_archetype TEXT;
  v_service_layer TEXT;
BEGIN
  -- Calculate work ratios from JTBD mappings
  WITH jtbd_weights AS (
    SELECT
      j.work_pattern,
      j.complexity,
      pm.time_allocation_percentage * COALESCE(pm.effort_weight, 1.0) AS weighted_alloc
    FROM jtbd_persona_mapping pm
    JOIN jtbd j ON pm.jtbd_id = j.id
    WHERE pm.persona_id = p_persona_id
    AND j.status = 'active'
  ),
  totals AS (
    SELECT
      SUM(weighted_alloc) AS total_alloc,
      SUM(CASE WHEN work_pattern = 'project' THEN weighted_alloc
               WHEN work_pattern = 'mixed' THEN weighted_alloc * 0.5
               ELSE 0 END) AS project_alloc,
      SUM(CASE WHEN work_pattern = 'bau' THEN weighted_alloc
               WHEN work_pattern = 'mixed' THEN weighted_alloc * 0.5
               ELSE 0 END) AS bau_alloc,
      SUM(CASE WHEN complexity IN ('high', 'very_high') THEN weighted_alloc ELSE 0 END) AS high_complexity_alloc
    FROM jtbd_weights
  )
  SELECT
    ROUND(project_alloc / NULLIF(total_alloc, 0), 2),
    ROUND(bau_alloc / NULLIF(total_alloc, 0), 2),
    ROUND(high_complexity_alloc / NULLIF(total_alloc, 0), 2)
  INTO v_project_ratio, v_bau_ratio, v_complexity_score
  FROM totals;

  -- Handle null case (no JTBD mappings)
  v_project_ratio := COALESCE(v_project_ratio, 0.5);
  v_bau_ratio := COALESCE(v_bau_ratio, 0.5);
  v_complexity_score := COALESCE(v_complexity_score, 0.5);

  -- Determine work dominance
  v_dominance := CASE
    WHEN v_project_ratio >= 0.6 THEN 'project_heavy'
    WHEN v_bau_ratio >= 0.6 THEN 'bau_heavy'
    ELSE 'balanced'
  END;

  -- Get AI readiness score (if not set, default to 0.5)
  SELECT COALESCE(ai_readiness_score, 0.5)
  INTO v_complexity_score
  FROM personas WHERE id = p_persona_id;

  -- Derive archetype
  v_archetype := derive_persona_archetype(v_complexity_score, COALESCE(
    (SELECT ai_readiness_score FROM personas WHERE id = p_persona_id), 0.5
  ));

  -- Derive service layer
  v_service_layer := derive_service_layer_from_archetype(v_archetype);

  -- Update persona
  UPDATE personas
  SET
    project_work_ratio = v_project_ratio,
    bau_work_ratio = v_bau_ratio,
    work_complexity_score = v_complexity_score,
    work_dominance = v_dominance,
    derived_archetype = v_archetype,
    preferred_service_layer = v_service_layer,
    updated_at = NOW()
  WHERE id = p_persona_id;

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_persona_work_mix IS
  'Updates persona work mix attributes and derived archetype from JTBD mappings';

-- ✓ SECTION 3 COMPLETE: Persona work mix update function created

-- ================================================================
-- SECTION 4: TRIGGER TO MAINTAIN PERSONA METRICS
-- ================================================================

CREATE OR REPLACE FUNCTION trigger_update_persona_work_mix()
RETURNS TRIGGER AS $$
BEGIN
  -- Update affected persona
  PERFORM update_persona_work_mix(COALESCE(NEW.persona_id, OLD.persona_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_persona_jtbd_mapping_change ON jtbd_persona_mapping;
CREATE TRIGGER trg_persona_jtbd_mapping_change
  AFTER INSERT OR UPDATE OR DELETE ON jtbd_persona_mapping
  FOR EACH ROW EXECUTE FUNCTION trigger_update_persona_work_mix();

COMMENT ON TRIGGER trg_persona_jtbd_mapping_change ON jtbd_persona_mapping IS
  'Maintains persona work mix attributes when JTBD mappings change';

-- ✓ SECTION 4 COMPLETE: Persona work mix trigger created

-- ================================================================
-- SECTION 5: AI OPPORTUNITY RANKING VIEW
-- ================================================================

CREATE OR REPLACE VIEW v_ai_opportunity_ranking AS
SELECT
  a.id AS assessment_id,
  j.id AS jtbd_id,
  j.code AS jtbd_code,
  j.name AS jtbd_name,
  j.work_pattern,
  j.jtbd_type,
  j.strategic_priority,
  j.active_okr_count,
  j.okr_alignment_score,

  -- AI Assessment Scores
  a.automation_potential,
  a.automation_score,
  a.recommended_focus,
  a.okr_acceleration_score,
  a.strategic_alignment_score,
  a.prioritization_score,

  -- Value Estimates
  a.estimated_annual_hours_saved,
  a.estimated_annual_value_usd,
  a.implementation_complexity,
  a.implementation_effort_weeks,
  a.roi_estimate,
  a.payback_months,

  -- ROI Scores
  a.automation_roi_score,
  a.augmentation_roi_score,

  -- Rankings
  RANK() OVER (ORDER BY a.prioritization_score DESC NULLS LAST) AS overall_rank,
  RANK() OVER (PARTITION BY j.work_pattern ORDER BY a.prioritization_score DESC NULLS LAST) AS work_pattern_rank,
  RANK() OVER (PARTITION BY a.recommended_focus ORDER BY a.prioritization_score DESC NULLS LAST) AS focus_rank,

  -- Quadrant Classification
  CASE
    WHEN a.automation_score >= 70 AND a.estimated_annual_value_usd >= 100000 THEN 'quick_win'
    WHEN a.automation_score < 50 AND a.estimated_annual_value_usd >= 100000 THEN 'strategic'
    WHEN a.automation_score >= 70 AND a.estimated_annual_value_usd < 100000 THEN 'efficiency'
    ELSE 'incremental'
  END AS opportunity_quadrant,

  j.tenant_id

FROM jtbd_ai_assessments a
JOIN jtbd j ON a.jtbd_id = j.id
WHERE j.status = 'active'
ORDER BY a.prioritization_score DESC NULLS LAST;

COMMENT ON VIEW v_ai_opportunity_ranking IS
  'Comprehensive AI opportunity ranking with multiple ranking dimensions and quadrant classification';

-- ✓ SECTION 5 COMPLETE: AI opportunity ranking view created

-- ================================================================
-- SECTION 6: STRATEGIC CASCADE VIEW
-- ================================================================

CREATE OR REPLACE VIEW v_strategic_cascade AS
SELECT
  -- Strategic Theme Level
  st.id AS theme_id,
  st.code AS theme_code,
  st.name AS theme_name,
  st.status AS theme_status,
  st.start_year,
  st.end_year,
  st.progress_percentage AS theme_progress,

  -- Strategic Pillar Level
  sp.id AS pillar_id,
  sp.code AS pillar_code,
  sp.name AS pillar_name,
  sp.pillar_status,
  sp.progress_percentage AS pillar_progress,

  -- OKR Level
  o.id AS okr_id,
  o.code AS okr_code,
  o.objective,
  o.level AS okr_level,
  o.timeframe,
  o.status AS okr_status,

  -- Key Result Level
  kr.id AS key_result_id,
  kr.kr_code,
  kr.description AS kr_description,
  kr.progress_percentage AS kr_progress,
  kr.status AS kr_status,

  -- JTBD Level (via mapping)
  j.id AS jtbd_id,
  j.code AS jtbd_code,
  j.name AS jtbd_name,
  j.work_pattern,
  j.jtbd_type,
  j.strategic_priority,
  m.alignment_type,
  m.contribution_weight,

  -- AI Assessment Summary
  a.automation_score,
  a.prioritization_score,
  a.recommended_focus,

  sp.tenant_id

FROM strategic_pillars sp
LEFT JOIN strategic_themes st ON sp.theme_id = st.id
LEFT JOIN okr o ON sp.id = o.strategic_pillar_id
LEFT JOIN key_result kr ON o.id = kr.okr_id
LEFT JOIN okr_jtbd_mapping m ON o.id = m.okr_id
LEFT JOIN jtbd j ON m.jtbd_id = j.id
LEFT JOIN jtbd_ai_assessments a ON j.id = a.jtbd_id

ORDER BY
  st.start_year,
  sp.sequence_order,
  o.timeframe,
  kr.kr_code,
  j.strategic_priority;

COMMENT ON VIEW v_strategic_cascade IS
  'Full strategic cascade from themes → pillars → OKRs → KRs → JTBDs → AI assessments';

-- ✓ SECTION 6 COMPLETE: Strategic cascade view created

-- ================================================================
-- SECTION 7: OKR PROGRESS VIEW
-- ================================================================

CREATE OR REPLACE VIEW v_okr_progress AS
SELECT
  o.id AS okr_id,
  o.code AS okr_code,
  o.objective,
  o.level AS okr_level,
  o.timeframe,
  o.status,
  o.objective_type,

  -- Key Result Aggregations
  COUNT(kr.id) AS key_result_count,
  COUNT(CASE WHEN kr.status = 'achieved' THEN 1 END) AS achieved_count,
  ROUND(SUM(kr.progress_percentage * kr.weight) / NULLIF(SUM(kr.weight), 0), 2) AS weighted_progress,
  ROUND(AVG(kr.confidence_level), 2) AS avg_confidence,

  -- Health Status
  CASE
    WHEN AVG(kr.progress_percentage) >= 70 THEN 'green'
    WHEN AVG(kr.progress_percentage) >= 40 THEN 'yellow'
    ELSE 'red'
  END AS health_status,

  -- JTBD Alignment
  (SELECT COUNT(DISTINCT jtbd_id) FROM okr_jtbd_mapping WHERE okr_id = o.id) AS aligned_jtbd_count,

  -- Latest Update Info
  (SELECT update_date FROM key_result_update
   WHERE key_result_id IN (SELECT id FROM key_result WHERE okr_id = o.id)
   ORDER BY update_date DESC LIMIT 1) AS last_update_date,

  -- Strategic Context
  sp.code AS pillar_code,
  sp.name AS pillar_name,

  o.tenant_id

FROM okr o
LEFT JOIN key_result kr ON o.id = kr.okr_id
LEFT JOIN strategic_pillars sp ON o.strategic_pillar_id = sp.id
GROUP BY o.id, o.code, o.objective, o.level, o.timeframe, o.status,
         o.objective_type, sp.code, sp.name, o.tenant_id;

COMMENT ON VIEW v_okr_progress IS
  'OKR progress dashboard with aggregated KR metrics and health status';

-- ✓ SECTION 7 COMPLETE: OKR progress view created

-- ================================================================
-- SECTION 8: PERSONA ARCHETYPE DASHBOARD VIEW
-- ================================================================

CREATE OR REPLACE VIEW v_persona_archetype_dashboard AS
SELECT
  p.id AS persona_id,
  p.persona_name,
  p.title,
  p.source_role_id,

  -- Work Mix
  p.project_work_ratio,
  p.bau_work_ratio,
  p.work_dominance,
  p.work_complexity_score,
  p.ai_readiness_score,

  -- Archetype
  p.derived_archetype,
  p.preferred_service_layer,

  -- OKR Ownership
  p.owned_okr_count,
  p.contributed_okr_count,

  -- JTBD Summary
  (SELECT COUNT(*) FROM jtbd_persona_mapping pm
   JOIN jtbd j ON pm.jtbd_id = j.id
   WHERE pm.persona_id = p.id AND j.status = 'active') AS active_jtbd_count,

  -- Archetype Description
  CASE p.derived_archetype
    WHEN 'automator' THEN 'High AI readiness + Low complexity = Wants speed & automation'
    WHEN 'orchestrator' THEN 'High AI readiness + High complexity = Wants power & orchestration'
    WHEN 'learner' THEN 'Low AI readiness + Low complexity = Needs guidance & HITL'
    WHEN 'skeptic' THEN 'Low AI readiness + High complexity = Needs proof & multi-perspective'
    ELSE 'Unknown archetype'
  END AS archetype_description,

  -- Service Layer Rationale
  CASE p.preferred_service_layer
    WHEN 'L1_expert' THEN 'Quick expert answers with optional human review'
    WHEN 'L2_panel' THEN 'Multi-expert panel for diverse perspectives'
    WHEN 'L3_workflow' THEN 'Guided workflow with automation and HITL checkpoints'
    WHEN 'L4_solution' THEN 'Full end-to-end solution with orchestration'
    ELSE 'Default expert service'
  END AS service_layer_rationale,

  p.tenant_id

FROM personas p;

COMMENT ON VIEW v_persona_archetype_dashboard IS
  'Dashboard showing persona archetypes with work mix, service layer, and rationale';

-- ✓ SECTION 8 COMPLETE: Persona archetype dashboard view created

-- ================================================================
-- SECTION 9: ODI OPPORTUNITY DASHBOARD VIEW
-- ================================================================

CREATE OR REPLACE VIEW v_odi_opportunity_dashboard AS
SELECT
  j.id AS jtbd_id,
  j.code AS jtbd_code,
  j.name AS jtbd_name,
  j.work_pattern,
  j.strategic_priority,

  -- Outcome Aggregations
  COUNT(o.id) AS outcome_count,
  ROUND(AVG(o.importance_score), 2) AS avg_importance,
  ROUND(AVG(o.satisfaction_score), 2) AS avg_satisfaction,
  ROUND(AVG(o.opportunity_score), 2) AS avg_opportunity_score,

  -- Opportunity Distribution
  COUNT(CASE WHEN o.opportunity_priority = 'extreme' THEN 1 END) AS extreme_opportunities,
  COUNT(CASE WHEN o.opportunity_priority = 'high' THEN 1 END) AS high_opportunities,
  COUNT(CASE WHEN o.opportunity_priority = 'moderate' THEN 1 END) AS moderate_opportunities,
  COUNT(CASE WHEN o.opportunity_priority = 'low' THEN 1 END) AS low_opportunities,
  COUNT(CASE WHEN o.opportunity_priority = 'table_stakes' THEN 1 END) AS table_stakes,

  -- Top Opportunity Details
  (SELECT outcome_statement FROM jtbd_outcomes
   WHERE jtbd_id = j.id ORDER BY opportunity_score DESC LIMIT 1) AS top_opportunity,
  (SELECT opportunity_score FROM jtbd_outcomes
   WHERE jtbd_id = j.id ORDER BY opportunity_score DESC LIMIT 1) AS top_opportunity_score,

  -- KR Linkage
  (SELECT COUNT(DISTINCT key_result_id) FROM okr_key_result_outcome_mapping m
   JOIN jtbd_outcomes oo ON m.outcome_id = oo.id
   WHERE oo.jtbd_id = j.id) AS linked_kr_count,

  j.tenant_id

FROM jtbd j
LEFT JOIN jtbd_outcomes o ON j.id = o.jtbd_id
WHERE j.status = 'active'
GROUP BY j.id, j.code, j.name, j.work_pattern, j.strategic_priority, j.tenant_id
HAVING COUNT(o.id) > 0
ORDER BY AVG(o.opportunity_score) DESC NULLS LAST;

COMMENT ON VIEW v_odi_opportunity_dashboard IS
  'ODI opportunity dashboard showing outcome aggregations and distributions per JTBD';

-- ✓ SECTION 9 COMPLETE: ODI opportunity dashboard view created

-- ================================================================
-- SECTION 10: BATCH UPDATE FUNCTION FOR ALL PERSONAS
-- ================================================================

CREATE OR REPLACE FUNCTION batch_update_all_persona_work_mix()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_persona_id UUID;
BEGIN
  FOR v_persona_id IN SELECT id FROM personas LOOP
    PERFORM update_persona_work_mix(v_persona_id);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION batch_update_all_persona_work_mix IS
  'Batch updates work mix and archetype for all personas. Run after JTBD bulk imports.';

-- ✓ SECTION 10 COMPLETE: Batch update function created

-- ================================================================
-- SUMMARY
-- ================================================================

COMMIT;

DO $$
BEGIN
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'JTBD GOLD STANDARD PHASE 4 MIGRATION COMPLETE';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Created Tables:';
  RAISE NOTICE '  - okr (Objectives and Key Results)';
  RAISE NOTICE '  - key_result (measurable key results)';
  RAISE NOTICE '  - okr_jtbd_mapping (OKR to JTBD alignment)';
  RAISE NOTICE '  - jtbd_persona_mapping (persona to JTBD mapping)';
  RAISE NOTICE 'Enhanced:';
  RAISE NOTICE '  - personas table (work mix, archetype, service layer)';
  RAISE NOTICE 'Created Functions:';
  RAISE NOTICE '  - derive_persona_archetype (2x2 matrix)';
  RAISE NOTICE '  - derive_service_layer_from_archetype';
  RAISE NOTICE '  - update_persona_work_mix';
  RAISE NOTICE '  - batch_update_all_persona_work_mix';
  RAISE NOTICE 'Created Triggers:';
  RAISE NOTICE '  - trg_persona_jtbd_mapping_change (maintains work mix)';
  RAISE NOTICE 'Created Views:';
  RAISE NOTICE '  - v_ai_opportunity_ranking (comprehensive ranking)';
  RAISE NOTICE '  - v_strategic_cascade (full hierarchy)';
  RAISE NOTICE '  - v_okr_progress (OKR dashboard)';
  RAISE NOTICE '  - v_persona_archetype_dashboard';
  RAISE NOTICE '  - v_odi_opportunity_dashboard';
  RAISE NOTICE '================================================================';
END $$;
