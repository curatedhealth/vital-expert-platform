-- ================================================================
-- JSONB NORMALIZATION MIGRATION
-- Converts 12 JSONB columns to proper junction tables
-- ================================================================
-- Version: 1.0
-- Date: 2025-11-29
-- Tables affected: jtbd_ai_assessments, org_roles, strategic_themes
-- ================================================================

BEGIN;

-- ================================================================
-- SECTION 1: JTBD_AI_ASSESSMENTS NORMALIZATION (3 JSONB cols)
-- ================================================================

-- 1.1 Data Requirements Junction Table
CREATE TABLE IF NOT EXISTS jtbd_ai_data_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES jtbd_ai_assessments(id) ON DELETE CASCADE,
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  requirement_name TEXT NOT NULL,
  requirement_type TEXT CHECK (requirement_type IN ('input', 'output', 'reference', 'training')),
  data_source TEXT,
  is_required BOOLEAN DEFAULT true,
  quality_requirements TEXT,
  volume_estimate TEXT,
  refresh_frequency TEXT,

  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jtbd_ai_data_req_assessment ON jtbd_ai_data_requirements(assessment_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_ai_data_req_jtbd ON jtbd_ai_data_requirements(jtbd_id);

-- 1.2 Model Requirements Junction Table
CREATE TABLE IF NOT EXISTS jtbd_ai_model_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES jtbd_ai_assessments(id) ON DELETE CASCADE,
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  model_capability TEXT NOT NULL,
  capability_type TEXT CHECK (capability_type IN ('reasoning', 'generation', 'summarization', 'classification', 'extraction', 'search', 'analysis')),
  minimum_accuracy NUMERIC(3,2),
  latency_requirement_ms INTEGER,
  context_window_min INTEGER,
  recommended_model TEXT,
  fallback_model TEXT,

  is_critical BOOLEAN DEFAULT false,
  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jtbd_ai_model_req_assessment ON jtbd_ai_model_requirements(assessment_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_ai_model_req_jtbd ON jtbd_ai_model_requirements(jtbd_id);

-- 1.3 Integration Requirements Junction Table
CREATE TABLE IF NOT EXISTS jtbd_ai_integration_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES jtbd_ai_assessments(id) ON DELETE CASCADE,
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  integration_name TEXT NOT NULL,
  integration_type TEXT CHECK (integration_type IN ('api', 'database', 'file_system', 'message_queue', 'webhook', 'sdk')),
  system_name TEXT,
  endpoint_url TEXT,
  authentication_type TEXT,
  data_format TEXT,

  is_required BOOLEAN DEFAULT true,
  is_bidirectional BOOLEAN DEFAULT false,
  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jtbd_ai_integ_req_assessment ON jtbd_ai_integration_requirements(assessment_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_ai_integ_req_jtbd ON jtbd_ai_integration_requirements(jtbd_id);

-- ================================================================
-- SECTION 2: ORG_ROLES NORMALIZATION (8 JSONB cols)
-- ================================================================

-- 2.1 Role KPIs Junction Table
CREATE TABLE IF NOT EXISTS role_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  kpi_name TEXT NOT NULL,
  kpi_description TEXT,
  measurement_unit TEXT,
  target_value TEXT,
  measurement_frequency TEXT CHECK (measurement_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  data_source TEXT,

  is_primary BOOLEAN DEFAULT false,
  weight NUMERIC(3,2) DEFAULT 1.0,
  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_kpis_role ON role_kpis(role_id);

-- 2.2 Role Clinical Competencies Junction Table
CREATE TABLE IF NOT EXISTS role_clinical_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  competency_name TEXT NOT NULL,
  competency_category TEXT CHECK (competency_category IN ('therapeutic', 'regulatory', 'scientific', 'technical', 'soft_skill')),
  proficiency_level TEXT CHECK (proficiency_level IN ('awareness', 'working', 'practitioner', 'expert', 'thought_leader')),
  is_required BOOLEAN DEFAULT true,
  certification_required TEXT,

  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_clinical_comp_role ON role_clinical_competencies(role_id);

-- 2.3 Role Typical Deliverables Junction Table
CREATE TABLE IF NOT EXISTS role_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  deliverable_name TEXT NOT NULL,
  deliverable_type TEXT CHECK (deliverable_type IN ('document', 'presentation', 'analysis', 'report', 'plan', 'submission', 'training', 'other')),
  description TEXT,
  typical_frequency TEXT,
  primary_audience TEXT,

  is_recurring BOOLEAN DEFAULT false,
  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_deliverables_role ON role_deliverables(role_id);

-- 2.4 Role Daily Activities Junction Table
CREATE TABLE IF NOT EXISTS role_daily_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  activity_name TEXT NOT NULL,
  activity_category TEXT CHECK (activity_category IN ('communication', 'analysis', 'documentation', 'meeting', 'research', 'review', 'coordination', 'other')),
  description TEXT,
  time_allocation_percent INTEGER CHECK (time_allocation_percent BETWEEN 0 AND 100),

  is_core_activity BOOLEAN DEFAULT true,
  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_daily_act_role ON role_daily_activities(role_id);

-- 2.5 Role Systems Used Junction Table
CREATE TABLE IF NOT EXISTS role_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  system_name TEXT NOT NULL,
  system_category TEXT CHECK (system_category IN ('crm', 'edc', 'ctms', 'etmf', 'safety', 'regulatory', 'analytics', 'communication', 'other')),
  proficiency_required TEXT CHECK (proficiency_required IN ('basic', 'intermediate', 'advanced', 'expert')),
  usage_frequency TEXT CHECK (usage_frequency IN ('daily', 'weekly', 'monthly', 'as_needed')),

  is_primary_tool BOOLEAN DEFAULT false,
  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_systems_role ON role_systems(role_id);
CREATE INDEX IF NOT EXISTS idx_role_systems_tool ON role_systems(tool_id);

-- 2.6 Role Stakeholder Interactions Junction Table
CREATE TABLE IF NOT EXISTS role_stakeholder_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  stakeholder_type TEXT NOT NULL,
  stakeholder_category TEXT CHECK (stakeholder_category IN ('internal', 'external', 'regulatory', 'hcp', 'patient', 'payer', 'vendor')),
  interaction_frequency TEXT CHECK (interaction_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'as_needed')),
  interaction_mode TEXT CHECK (interaction_mode IN ('in_person', 'virtual', 'phone', 'email', 'mixed')),
  purpose TEXT,

  is_primary_stakeholder BOOLEAN DEFAULT false,
  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_stakeholder_role ON role_stakeholder_interactions(role_id);

-- 2.7 Role GxP Training Junction Table
CREATE TABLE IF NOT EXISTS role_gxp_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  training_name TEXT NOT NULL,
  training_type TEXT CHECK (training_type IN ('GCP', 'GMP', 'GLP', 'GDP', 'GVP', 'GPvP', 'GDPR', 'HIPAA', 'SOX', 'other')),
  is_required BOOLEAN DEFAULT true,
  renewal_frequency_months INTEGER,
  certification_body TEXT,

  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_gxp_training_role ON role_gxp_training(role_id);

-- 2.8 Role Specific Training Junction Table
CREATE TABLE IF NOT EXISTS role_specific_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  training_name TEXT NOT NULL,
  training_category TEXT CHECK (training_category IN ('onboarding', 'technical', 'leadership', 'compliance', 'product', 'therapeutic', 'soft_skills', 'other')),
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  completion_timeline_days INTEGER,
  provider TEXT,

  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_specific_training_role ON role_specific_training(role_id);

-- ================================================================
-- SECTION 3: STRATEGIC_THEMES NORMALIZATION (1 JSONB col)
-- ================================================================

-- 3.1 Theme Success Metrics Junction Table
CREATE TABLE IF NOT EXISTS theme_success_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES strategic_themes(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  metric_name TEXT NOT NULL,
  metric_description TEXT,
  measurement_unit TEXT,
  baseline_value TEXT,
  target_value TEXT,
  current_value TEXT,

  measurement_frequency TEXT CHECK (measurement_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  data_source TEXT,
  owner_role TEXT,

  is_primary BOOLEAN DEFAULT false,
  weight NUMERIC(3,2) DEFAULT 1.0,
  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_theme_success_metrics_theme ON theme_success_metrics(theme_id);

-- ================================================================
-- SECTION 4: ENABLE RLS ON ALL NEW TABLES
-- ================================================================

ALTER TABLE jtbd_ai_data_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_ai_model_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_ai_integration_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_clinical_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_stakeholder_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_gxp_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_specific_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_success_metrics ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- SECTION 5: CREATE RLS POLICIES
-- ================================================================

-- Helper function to get tenant from session or allow all
CREATE OR REPLACE FUNCTION get_current_tenant() RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::uuid,
    NULL
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS Policies for all new tables
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'jtbd_ai_data_requirements',
    'jtbd_ai_model_requirements',
    'jtbd_ai_integration_requirements',
    'role_kpis',
    'role_clinical_competencies',
    'role_deliverables',
    'role_daily_activities',
    'role_systems',
    'role_stakeholder_interactions',
    'role_gxp_training',
    'role_specific_training',
    'theme_success_metrics'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS %I_tenant_policy ON %I;
      CREATE POLICY %I_tenant_policy ON %I
        FOR ALL
        USING (tenant_id IS NULL OR tenant_id = get_current_tenant() OR get_current_tenant() IS NULL);
    ', tbl, tbl, tbl, tbl);
  END LOOP;
END $$;

COMMIT;

-- ================================================================
-- SUMMARY REPORT
-- ================================================================

DO $$
DECLARE
  v_table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'jtbd_ai_data_requirements', 'jtbd_ai_model_requirements', 'jtbd_ai_integration_requirements',
    'role_kpis', 'role_clinical_competencies', 'role_deliverables', 'role_daily_activities',
    'role_systems', 'role_stakeholder_interactions', 'role_gxp_training', 'role_specific_training',
    'theme_success_metrics'
  );

  RAISE NOTICE '================================================================';
  RAISE NOTICE 'JSONB NORMALIZATION MIGRATION COMPLETE';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'New Junction Tables Created: %', v_table_count;
  RAISE NOTICE '';
  RAISE NOTICE 'JTBD AI Assessments (3 tables):';
  RAISE NOTICE '  - jtbd_ai_data_requirements';
  RAISE NOTICE '  - jtbd_ai_model_requirements';
  RAISE NOTICE '  - jtbd_ai_integration_requirements';
  RAISE NOTICE '';
  RAISE NOTICE 'Org Roles (8 tables):';
  RAISE NOTICE '  - role_kpis';
  RAISE NOTICE '  - role_clinical_competencies';
  RAISE NOTICE '  - role_deliverables';
  RAISE NOTICE '  - role_daily_activities';
  RAISE NOTICE '  - role_systems';
  RAISE NOTICE '  - role_stakeholder_interactions';
  RAISE NOTICE '  - role_gxp_training';
  RAISE NOTICE '  - role_specific_training';
  RAISE NOTICE '';
  RAISE NOTICE 'Strategic Themes (1 table):';
  RAISE NOTICE '  - theme_success_metrics';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'NOTE: Original JSONB columns retained for backwards compatibility.';
  RAISE NOTICE 'Data migration from JSONB to junction tables pending.';
  RAISE NOTICE '================================================================';
END $$;
