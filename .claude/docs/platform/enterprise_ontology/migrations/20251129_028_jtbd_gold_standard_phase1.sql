-- ================================================================
-- JTBD GOLD STANDARD SCHEMA - PHASE 1
-- Strategic Framework & OKR Infrastructure
-- ================================================================
-- Version: 4.0.0
-- Date: 2024-11-29
-- Description: Creates ENUMs, strategic_themes, key_result_update,
--              okr_key_result_outcome_mapping, and enhances strategic_pillars
-- Source: SCHEMA_DELTA_ANALYSIS.md (Complete Schema v3.0)
-- ================================================================

BEGIN;

-- ================================================================
-- SECTION 1: ENUM TYPES
-- ================================================================

-- Strategic ENUMs
DO $$ BEGIN
  CREATE TYPE theme_status AS ENUM ('planned', 'active', 'completed', 'deprecated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE pillar_status AS ENUM ('active', 'sunset', 'future');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- OKR ENUMs
DO $$ BEGIN
  CREATE TYPE objective_type AS ENUM ('committed', 'aspirational', 'learning');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE timeframe_type AS ENUM ('quarterly', 'semi_annual', 'annual', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE okr_level AS ENUM ('company', 'functional', 'team', 'individual');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE okr_status AS ENUM ('draft', 'active', 'at_risk', 'on_track', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE health_status AS ENUM ('green', 'yellow', 'red');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE kr_status AS ENUM ('not_started', 'on_track', 'at_risk', 'behind', 'achieved', 'missed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE metric_direction AS ENUM ('increase', 'decrease', 'maintain', 'achieve');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE measurement_frequency AS ENUM ('daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE alignment_type AS ENUM ('direct', 'supporting', 'indirect');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE measurement_relationship AS ENUM ('measures', 'indicates', 'correlates');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE acceleration_potential AS ENUM ('critical', 'high', 'moderate', 'low');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- JTBD ENUMs
DO $$ BEGIN
  CREATE TYPE strategic_priority AS ENUM ('critical', 'high', 'standard', 'low', 'deferred');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE jtbd_type AS ENUM ('strategic', 'operational', 'tactical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE work_pattern AS ENUM ('project', 'bau', 'mixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE complexity_level AS ENUM ('low', 'medium', 'high', 'very_high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE impact_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE frequency_type AS ENUM ('continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'event_driven', 'sporadic');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE service_layer AS ENUM ('L1_expert', 'L2_panel', 'L3_workflow', 'L4_solution');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE compliance_sensitivity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE validation_status AS ENUM ('draft', 'in_review', 'approved', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ODI ENUMs
DO $$ BEGIN
  CREATE TYPE outcome_direction AS ENUM ('minimize', 'maximize', 'optimize', 'eliminate', 'ensure', 'reduce', 'increase');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE odi_dimension AS ENUM ('speed', 'stability', 'output_quality', 'accuracy', 'cost', 'risk', 'compliance');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE opportunity_priority AS ENUM ('extreme', 'high', 'moderate', 'low', 'table_stakes');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE outcome_type AS ENUM ('desired', 'undesired', 'over_served', 'under_served');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Persona ENUMs
DO $$ BEGIN
  CREATE TYPE archetype AS ENUM ('automator', 'orchestrator', 'learner', 'skeptic');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE involvement_level AS ENUM ('primary', 'secondary', 'consulted', 'informed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE seniority_level AS ENUM ('c_suite', 'vp', 'director', 'manager', 'senior_ic', 'ic');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AI ENUMs
DO $$ BEGIN
  CREATE TYPE automation_potential AS ENUM ('none', 'partial', 'significant', 'full');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ai_assistance_type AS ENUM ('none', 'draft', 'review', 'execute', 'full');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ai_focus AS ENUM ('automation', 'augmentation', 'mixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE confidence_level AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enabler ENUMs
DO $$ BEGIN
  CREATE TYPE enabler_type AS ENUM ('tool', 'system', 'data_source', 'process', 'skill', 'integration');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE enabler_state AS ENUM ('available', 'partial', 'missing', 'planned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE criticality AS ENUM ('required', 'important', 'nice_to_have');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Success Criteria ENUMs
DO $$ BEGIN
  CREATE TYPE criterion_type AS ENUM ('input', 'output', 'outcome', 'process');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE metric_type AS ENUM ('percentage', 'count', 'score', 'currency', 'time', 'boolean', 'ratio');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Work Pattern ENUMs
DO $$ BEGIN
  CREATE TYPE project_governance AS ENUM ('agile', 'waterfall', 'hybrid', 'standard', 'light');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE project_phase AS ENUM ('initiation', 'planning', 'execution', 'monitoring', 'closure');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE operational_cadence AS ENUM ('continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'event_driven');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE standardization_level AS ENUM ('highly_standardized', 'standardized', 'semi_standardized', 'variable');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE automation_level AS ENUM ('manual', 'semi_automated', 'mostly_automated', 'fully_automated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE variability_level AS ENUM ('low', 'medium', 'high', 'very_high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE bau_activity_type AS ENUM ('receive', 'triage', 'process', 'validate', 'approve', 'escalate', 'document', 'report');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE gate_type AS ENUM ('none', 'review', 'approval', 'compliance');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE deliverable_type AS ENUM ('document', 'presentation', 'data', 'system', 'process', 'approval');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- SECTION 1 COMPLETE: All ENUMs created

-- ================================================================
-- SECTION 2: STRATEGIC THEMES TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS strategic_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Timeframe (3-5 year horizon)
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('planned', 'active', 'completed', 'deprecated')),

  -- Hierarchy (themes can nest)
  parent_theme_id UUID REFERENCES strategic_themes(id),

  -- Progress Tracking
  success_metrics JSONB, -- Flexible during theme definition
  progress_percentage NUMERIC(5,2) DEFAULT 0
    CHECK (progress_percentage BETWEEN 0 AND 100),

  -- Ownership
  owner_user_id UUID,
  sponsor_user_id UUID,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(tenant_id, code),
  CHECK (end_year > start_year)
);

CREATE INDEX IF NOT EXISTS idx_strategic_themes_tenant ON strategic_themes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_strategic_themes_status ON strategic_themes(status);
CREATE INDEX IF NOT EXISTS idx_strategic_themes_years ON strategic_themes(start_year, end_year);
CREATE INDEX IF NOT EXISTS idx_strategic_themes_parent ON strategic_themes(parent_theme_id);

COMMENT ON TABLE strategic_themes IS
  '3-5 year transformation themes that group strategic pillars. Highest level of strategic context for OKRs and JTBDs.';

COMMENT ON COLUMN strategic_themes.code IS 'Human-readable code like THEME-01, THEME-02';
COMMENT ON COLUMN strategic_themes.success_metrics IS 'Flexible JSONB for theme-level KPIs during definition phase';
COMMENT ON COLUMN strategic_themes.progress_percentage IS 'Aggregated progress from child pillars and OKRs';

-- Enable RLS
ALTER TABLE strategic_themes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS strategic_themes_tenant_isolation ON strategic_themes;
CREATE POLICY strategic_themes_tenant_isolation ON strategic_themes
  FOR ALL
  USING (tenant_id = COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::uuid,
    tenant_id
  ));

-- ✓ SECTION 2 COMPLETE: strategic_themes table created

-- ================================================================
-- SECTION 3: ENHANCE STRATEGIC_PILLARS TABLE
-- ================================================================

-- Create table if it doesn't exist (base structure)
CREATE TABLE IF NOT EXISTS strategic_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);

-- Add theme linkage
ALTER TABLE strategic_pillars ADD COLUMN IF NOT EXISTS
  theme_id UUID REFERENCES strategic_themes(id);

-- Add status tracking
ALTER TABLE strategic_pillars ADD COLUMN IF NOT EXISTS
  pillar_status TEXT DEFAULT 'active'
  CHECK (pillar_status IN ('active', 'sunset', 'future'));

-- Add owner persona
ALTER TABLE strategic_pillars ADD COLUMN IF NOT EXISTS
  owner_persona_id UUID;

-- Add target OKR count
ALTER TABLE strategic_pillars ADD COLUMN IF NOT EXISTS
  target_okr_count INTEGER DEFAULT 5;

-- Add progress tracking
ALTER TABLE strategic_pillars ADD COLUMN IF NOT EXISTS
  progress_percentage NUMERIC(5,2) DEFAULT 0
  CHECK (progress_percentage BETWEEN 0 AND 100);

-- Add description if missing
ALTER TABLE strategic_pillars ADD COLUMN IF NOT EXISTS
  description TEXT;

-- Create index on theme linkage
CREATE INDEX IF NOT EXISTS idx_strategic_pillars_theme ON strategic_pillars(theme_id);
CREATE INDEX IF NOT EXISTS idx_strategic_pillars_status ON strategic_pillars(pillar_status);

COMMENT ON COLUMN strategic_pillars.theme_id IS 'Links pillar to parent strategic theme (3-5 year horizon)';
COMMENT ON COLUMN strategic_pillars.pillar_status IS 'Current lifecycle status: active, sunset (being phased out), future (planned)';
COMMENT ON COLUMN strategic_pillars.target_okr_count IS 'Expected number of OKRs per pillar per period';

-- ✓ SECTION 3 COMPLETE: strategic_pillars enhanced with theme linkage

-- ================================================================
-- SECTION 4: KEY RESULT UPDATE TABLE (Historical Tracking)
-- ================================================================

CREATE TABLE IF NOT EXISTS key_result_update (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_result_id UUID NOT NULL, -- FK to key_result(id) - add constraint after OKR tables exist
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Progress Snapshot
  update_date DATE NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC,
  progress_percentage NUMERIC(5,2)
    CHECK (progress_percentage BETWEEN 0 AND 100),

  -- Context
  update_source TEXT DEFAULT 'manual'
    CHECK (update_source IN ('manual', 'automated', 'system', 'import')),
  notes TEXT,
  confidence_level NUMERIC(3,2)
    CHECK (confidence_level BETWEEN 0 AND 1),

  -- Risk Indicators
  blockers TEXT[],
  risks TEXT[],
  mitigation_actions TEXT[],

  -- Health Snapshot (at time of update)
  health_status TEXT
    CHECK (health_status IN ('green', 'yellow', 'red')),

  -- Attribution
  updated_by UUID,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_key_result_update_kr ON key_result_update(key_result_id);
CREATE INDEX IF NOT EXISTS idx_key_result_update_date ON key_result_update(update_date DESC);
CREATE INDEX IF NOT EXISTS idx_key_result_update_tenant ON key_result_update(tenant_id);
CREATE INDEX IF NOT EXISTS idx_key_result_update_health ON key_result_update(health_status);

COMMENT ON TABLE key_result_update IS
  'Historical tracking of Key Result progress over time. Enables trend analysis, forecasting, and automated health status calculation.';

COMMENT ON COLUMN key_result_update.update_source IS 'Origin of update: manual entry, automated sync, system calculation, or data import';
COMMENT ON COLUMN key_result_update.confidence_level IS 'Confidence in the reported value (0-1 scale)';
COMMENT ON COLUMN key_result_update.blockers IS 'Active blockers preventing progress';
COMMENT ON COLUMN key_result_update.health_status IS 'Health status snapshot at time of update';

-- Enable RLS
ALTER TABLE key_result_update ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS key_result_update_tenant_isolation ON key_result_update;
CREATE POLICY key_result_update_tenant_isolation ON key_result_update
  FOR ALL
  USING (tenant_id = COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::uuid,
    tenant_id
  ));

-- ✓ SECTION 4 COMPLETE: key_result_update table created

-- ================================================================
-- SECTION 5: OKR KEY RESULT OUTCOME MAPPING (KR to ODI Linkage)
-- ================================================================

CREATE TABLE IF NOT EXISTS okr_key_result_outcome_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_result_id UUID NOT NULL, -- FK to key_result(id) - add constraint after OKR tables exist
  outcome_id UUID NOT NULL, -- FK to jtbd_outcomes(id) - add constraint after JTBD tables exist
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Relationship Type
  measurement_relationship TEXT NOT NULL DEFAULT 'measures'
    CHECK (measurement_relationship IN ('measures', 'indicates', 'correlates')),

  -- Weight (for composite measurements)
  contribution_weight NUMERIC(3,2) DEFAULT 1.0
    CHECK (contribution_weight BETWEEN 0 AND 1),

  -- Mapping Quality
  mapping_confidence TEXT DEFAULT 'medium'
    CHECK (mapping_confidence IN ('low', 'medium', 'high')),
  validation_status TEXT DEFAULT 'draft'
    CHECK (validation_status IN ('draft', 'validated', 'deprecated')),

  -- Notes
  notes TEXT,
  measurement_methodology TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(key_result_id, outcome_id)
);

CREATE INDEX IF NOT EXISTS idx_kr_outcome_mapping_kr ON okr_key_result_outcome_mapping(key_result_id);
CREATE INDEX IF NOT EXISTS idx_kr_outcome_mapping_outcome ON okr_key_result_outcome_mapping(outcome_id);
CREATE INDEX IF NOT EXISTS idx_kr_outcome_mapping_tenant ON okr_key_result_outcome_mapping(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kr_outcome_mapping_relationship ON okr_key_result_outcome_mapping(measurement_relationship);

COMMENT ON TABLE okr_key_result_outcome_mapping IS
  'Links Key Results to ODI Outcomes for measurement alignment. Enables tracking KR progress through ODI satisfaction score improvements.';

COMMENT ON COLUMN okr_key_result_outcome_mapping.measurement_relationship IS
  'measures: KR directly measures this outcome. indicates: KR is an indirect indicator. correlates: KR correlates with outcome improvement.';
COMMENT ON COLUMN okr_key_result_outcome_mapping.contribution_weight IS
  'Weight for composite measurements where KR measures multiple outcomes';
COMMENT ON COLUMN okr_key_result_outcome_mapping.measurement_methodology IS
  'Description of how KR progress translates to outcome satisfaction improvement';

-- Enable RLS
ALTER TABLE okr_key_result_outcome_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS kr_outcome_mapping_tenant_isolation ON okr_key_result_outcome_mapping;
CREATE POLICY kr_outcome_mapping_tenant_isolation ON okr_key_result_outcome_mapping
  FOR ALL
  USING (tenant_id = COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::uuid,
    tenant_id
  ));

-- ✓ SECTION 5 COMPLETE: okr_key_result_outcome_mapping table created

-- ================================================================
-- SECTION 6: HELPER VIEWS
-- ================================================================

-- View: Strategic cascade from themes to pillars (simplified - no OKR join)
CREATE OR REPLACE VIEW v_strategic_hierarchy AS
SELECT
  t.id AS theme_id,
  t.code AS theme_code,
  t.name AS theme_name,
  t.status AS theme_status,
  t.start_year,
  t.end_year,
  t.progress_percentage AS theme_progress,
  sp.id AS pillar_id,
  sp.code AS pillar_code,
  sp.name AS pillar_name,
  sp.pillar_status,
  sp.progress_percentage AS pillar_progress,
  sp.target_okr_count,
  0 AS actual_okr_count, -- Placeholder until OKR table exists
  0 AS active_okr_count, -- Placeholder until OKR table exists
  t.tenant_id
FROM strategic_themes t
LEFT JOIN strategic_pillars sp ON t.id = sp.theme_id;

COMMENT ON VIEW v_strategic_hierarchy IS
  'Hierarchical view of strategic alignment: themes → pillars. OKR counts available after OKR migration.';

-- View: KR to ODI outcome linkage with scores
-- NOTE: This view requires okr, key_result, and jtbd_outcomes tables
-- Create this view AFTER running OKR foundation migration and Phase 2 (JTBD tables)
/*
CREATE OR REPLACE VIEW v_kr_odi_linkage AS
SELECT
  kr.id AS key_result_id,
  kr.kr_code,
  kr.description AS kr_description,
  kr.progress_percentage AS kr_progress,
  kr.status AS kr_status,
  o.id AS okr_id,
  o.code AS okr_code,
  o.objective,
  m.measurement_relationship,
  m.contribution_weight,
  m.mapping_confidence,
  odi.id AS odi_outcome_id,
  odi.outcome_statement,
  odi.importance_score,
  odi.satisfaction_score,
  odi.opportunity_score,
  odi.opportunity_priority,
  j.id AS jtbd_id,
  j.code AS jtbd_code,
  j.name AS jtbd_name,
  j.work_pattern,
  -- Computed alignment score
  ROUND((kr.progress_percentage / 100.0 * odi.importance_score / 10)::NUMERIC, 2) AS alignment_score,
  -- Remaining opportunity after KR progress
  ROUND((1 - kr.progress_percentage / 100.0) * odi.opportunity_score, 1) AS remaining_opportunity,
  kr.tenant_id
FROM key_result kr
JOIN okr o ON kr.okr_id = o.id
LEFT JOIN okr_key_result_outcome_mapping m ON kr.id = m.key_result_id
LEFT JOIN jtbd_outcomes odi ON m.outcome_id = odi.id
LEFT JOIN jtbd j ON odi.jtbd_id = j.id;

COMMENT ON VIEW v_kr_odi_linkage IS
  'Links Key Results to ODI Outcomes showing measurement relationships and computed alignment scores';
*/

-- ✓ SECTION 6 COMPLETE: Helper views created

-- ================================================================
-- SECTION 7: UPDATED_AT TRIGGERS
-- ================================================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to strategic_themes
DROP TRIGGER IF EXISTS trg_strategic_themes_updated_at ON strategic_themes;
CREATE TRIGGER trg_strategic_themes_updated_at
  BEFORE UPDATE ON strategic_themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to okr_key_result_outcome_mapping
DROP TRIGGER IF EXISTS trg_kr_outcome_mapping_updated_at ON okr_key_result_outcome_mapping;
CREATE TRIGGER trg_kr_outcome_mapping_updated_at
  BEFORE UPDATE ON okr_key_result_outcome_mapping
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ✓ SECTION 7 COMPLETE: Updated_at triggers created

-- ================================================================
-- SECTION 8: SEED STRATEGIC PILLARS (Expand to 9)
-- ================================================================

-- Get default tenant for seeding (use first tenant or create placeholder)
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Try to get an existing tenant
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;

  -- If no tenant exists, create a default one
  IF v_tenant_id IS NULL THEN
    INSERT INTO tenants (id, name, tenant_key, status)
    VALUES (gen_random_uuid(), 'Default Tenant', 'default', 'active')
    RETURNING id INTO v_tenant_id;
  END IF;

  -- Seed strategic pillars with tenant_id
  INSERT INTO strategic_pillars (tenant_id, code, name, description, sequence_order, pillar_status)
  VALUES
    (v_tenant_id, 'SP01', 'Growth & Market Access', 'Drive revenue growth through market expansion, pricing strategy, and payer access optimization', 1, 'active'),
    (v_tenant_id, 'SP02', 'Scientific Excellence', 'Advance medical science through research, publications, and evidence generation', 2, 'active'),
    (v_tenant_id, 'SP03', 'Stakeholder Engagement', 'Build and maintain relationships with HCPs, KOLs, patients, and advocacy groups', 3, 'active'),
    (v_tenant_id, 'SP04', 'Compliance & Quality', 'Ensure regulatory compliance, quality systems, and audit readiness', 4, 'active'),
    (v_tenant_id, 'SP05', 'Operational Excellence', 'Optimize processes, reduce waste, and improve efficiency across operations', 5, 'active'),
    (v_tenant_id, 'SP06', 'Talent Development', 'Attract, develop, and retain top talent with focus on future capabilities', 6, 'active'),
    (v_tenant_id, 'SP07', 'Innovation & Digital', 'Drive digital transformation, AI adoption, and technology-enabled innovation', 7, 'active'),
    (v_tenant_id, 'SP08', 'Patient-Centricity', 'Put patients at the center of all decisions with focus on outcomes and experience', 8, 'active'),
    (v_tenant_id, 'SP09', 'Data-Driven Decision Making', 'Enable evidence-based decisions through analytics, insights, and data platforms', 9, 'active')
  ON CONFLICT (tenant_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    sequence_order = EXCLUDED.sequence_order,
    pillar_status = EXCLUDED.pillar_status;
END $$;

-- ✓ SECTION 8 COMPLETE: Strategic pillars seeded (9 pillars)

-- ================================================================
-- SUMMARY
-- ================================================================

COMMIT;

-- Final summary
DO $$
BEGIN
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'JTBD GOLD STANDARD PHASE 1 MIGRATION COMPLETE';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - 35+ ENUM types (strategic, OKR, JTBD, ODI, persona, AI, etc.)';
  RAISE NOTICE '  - strategic_themes table (3-5 year transformation themes)';
  RAISE NOTICE '  - strategic_pillars table (9 strategic pillars)';
  RAISE NOTICE '  - key_result_update table (ready for OKR integration)';
  RAISE NOTICE '  - okr_key_result_outcome_mapping junction (ready for OKR integration)';
  RAISE NOTICE 'Views:';
  RAISE NOTICE '  - v_strategic_hierarchy (themes to pillars - simplified)';
  RAISE NOTICE 'Note: v_kr_odi_linkage deferred until OKR tables exist';
  RAISE NOTICE 'Seeded:';
  RAISE NOTICE '  - 9 strategic pillars (SP01-SP09)';
  RAISE NOTICE '================================================================';
END $$;
