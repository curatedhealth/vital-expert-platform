-- ================================================================
-- JTBD GOLD STANDARD SCHEMA - PHASE 3
-- Work Pattern Extensions (Project & BAU)
-- ================================================================
-- Version: 4.0.0
-- Date: 2024-11-29
-- Description: Creates project and BAU metadata extension tables,
--              cycle activities, deliverables, SLA history, and routing
-- Source: SCHEMA_DELTA_ANALYSIS.md (Project vs BAU Schema v2.0)
-- ================================================================

BEGIN;

-- ================================================================
-- SECTION 1: PROJECT METADATA TABLE (1:1 Extension)
-- ================================================================

CREATE TABLE IF NOT EXISTS jtbd_project_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL UNIQUE REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Timeline
  estimated_duration_weeks INTEGER,
  typical_start_trigger TEXT,
  typical_end_state TEXT,

  -- Scope
  cross_functional BOOLEAN DEFAULT true,
  typical_team_size VARCHAR(50), -- "3-5", "5-10", "10-20", "20+"
  department_count INTEGER DEFAULT 1,

  -- Governance
  governance_model TEXT DEFAULT 'standard'
    CHECK (governance_model IN ('agile', 'waterfall', 'hybrid', 'standard', 'light')),
  typical_sponsor_level TEXT
    CHECK (typical_sponsor_level IN ('c_suite', 'vp', 'director', 'manager')),
  steering_committee_required BOOLEAN DEFAULT false,

  -- Budget & Resources
  typical_budget_range VARCHAR(100), -- "$10K-$50K", "$50K-$100K", etc.
  resource_intensity TEXT DEFAULT 'medium'
    CHECK (resource_intensity IN ('low', 'medium', 'high', 'very_high')),

  -- Risk Profile
  risk_level TEXT DEFAULT 'medium'
    CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors TEXT[],

  -- Handover to BAU (KEY INNOVATION)
  bau_handover_required BOOLEAN DEFAULT true,
  handover_jtbd_ids UUID[], -- Links to BAU JTBDs that receive project outputs
  handover_documentation_template TEXT,

  -- Success Factors
  key_success_factors TEXT[],
  common_failure_modes TEXT[],

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jtbd_project_metadata_jtbd ON jtbd_project_metadata(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_project_metadata_tenant ON jtbd_project_metadata(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_project_metadata_governance ON jtbd_project_metadata(governance_model);
CREATE INDEX IF NOT EXISTS idx_jtbd_project_metadata_handover ON jtbd_project_metadata(bau_handover_required);

COMMENT ON TABLE jtbd_project_metadata IS
  'Extended attributes for project-type JTBDs (work_pattern = project or mixed). Includes governance, timeline, and BAU handover tracking.';

COMMENT ON COLUMN jtbd_project_metadata.handover_jtbd_ids IS
  'Array of BAU JTBD IDs that receive outputs from this project, enabling traceability';
COMMENT ON COLUMN jtbd_project_metadata.typical_start_trigger IS
  'What typically initiates this type of project (e.g., "New product approval", "Market expansion")';
COMMENT ON COLUMN jtbd_project_metadata.typical_end_state IS
  'Definition of done (e.g., "Product launched", "Process operational")';

-- Enable RLS
ALTER TABLE jtbd_project_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS jtbd_project_metadata_tenant_isolation ON jtbd_project_metadata;
CREATE POLICY jtbd_project_metadata_tenant_isolation ON jtbd_project_metadata
  FOR ALL
  USING (tenant_id = COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::uuid,
    tenant_id
  ));

-- ✓ SECTION 1 COMPLETE: jtbd_project_metadata table created

-- ================================================================
-- SECTION 2: PROJECT DELIVERABLES TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS jtbd_project_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  project_phase TEXT NOT NULL
    CHECK (project_phase IN ('initiation', 'planning', 'execution', 'monitoring', 'closure')),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Deliverable Details
  deliverable_name VARCHAR(255) NOT NULL,
  deliverable_type TEXT NOT NULL
    CHECK (deliverable_type IN ('document', 'presentation', 'data', 'system', 'process', 'approval', 'artifact')),
  description TEXT,

  -- Templates & Standards
  template_available BOOLEAN DEFAULT false,
  template_reference TEXT,
  quality_standard TEXT,

  -- AI Potential
  ai_generation_potential TEXT DEFAULT 'partial'
    CHECK (ai_generation_potential IN ('none', 'partial', 'significant', 'full')),
  ai_generation_notes TEXT,

  -- Compliance
  compliance_required BOOLEAN DEFAULT false,
  compliance_type TEXT[],

  -- Dependencies
  depends_on_deliverable_ids UUID[],

  -- Ordering
  sequence_order INTEGER DEFAULT 1,
  is_milestone BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jtbd_project_deliverables_jtbd ON jtbd_project_deliverables(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_project_deliverables_phase ON jtbd_project_deliverables(project_phase);
CREATE INDEX IF NOT EXISTS idx_jtbd_project_deliverables_tenant ON jtbd_project_deliverables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_project_deliverables_type ON jtbd_project_deliverables(deliverable_type);
CREATE INDEX IF NOT EXISTS idx_jtbd_project_deliverables_milestone ON jtbd_project_deliverables(is_milestone) WHERE is_milestone = true;

COMMENT ON TABLE jtbd_project_deliverables IS
  'Standard deliverables for project phases. Enables template-based setup and AI-assisted generation planning.';

-- Enable RLS
ALTER TABLE jtbd_project_deliverables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS jtbd_project_deliverables_tenant_isolation ON jtbd_project_deliverables;
CREATE POLICY jtbd_project_deliverables_tenant_isolation ON jtbd_project_deliverables
  FOR ALL
  USING (tenant_id = COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::uuid,
    tenant_id
  ));

-- ✓ SECTION 2 COMPLETE: jtbd_project_deliverables table created

-- ================================================================
-- SECTION 3: BAU METADATA TABLE (1:1 Extension)
-- ================================================================

CREATE TABLE IF NOT EXISTS jtbd_bau_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL UNIQUE REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Cadence
  operational_cadence TEXT NOT NULL
    CHECK (operational_cadence IN ('continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'event_driven')),
  cycle_day VARCHAR(50), -- "Monday", "15th", "Month-end", "Last Friday"
  cycle_time TIME,
  cycle_duration_hours NUMERIC(5,2),

  -- Volume
  typical_volume_per_cycle INTEGER,
  volume_unit VARCHAR(50), -- "requests", "transactions", "reports", "cases"
  volume_variability TEXT DEFAULT 'medium'
    CHECK (volume_variability IN ('low', 'medium', 'high', 'very_high')),
  peak_periods TEXT[], -- ["Q4", "Month-end", "Audit season"]

  -- SLA
  sla_target VARCHAR(100), -- "< 24 hours", "Same day", "Within 4 business hours"
  sla_metric VARCHAR(100), -- "Response time", "Resolution time", "Turnaround time"
  sla_threshold_warning NUMERIC(5,2), -- % of target (e.g., 80% = warning at 80% of SLA)
  sla_threshold_critical NUMERIC(5,2), -- % of target (e.g., 95% = critical at 95% of SLA)

  -- Process
  process_standardization TEXT DEFAULT 'standardized'
    CHECK (process_standardization IN ('highly_standardized', 'standardized', 'semi_standardized', 'variable')),
  sop_reference TEXT,
  sop_version VARCHAR(50),
  escalation_path TEXT[],
  exception_handling_process TEXT,

  -- Automation
  current_automation_level TEXT DEFAULT 'manual'
    CHECK (current_automation_level IN ('manual', 'semi_automated', 'mostly_automated', 'fully_automated')),
  automation_target TEXT
    CHECK (automation_target IN ('manual', 'semi_automated', 'mostly_automated', 'fully_automated')),
  automation_blockers TEXT[],

  -- KPIs
  primary_kpi VARCHAR(255),
  primary_kpi_target VARCHAR(100),
  secondary_kpis JSONB, -- [{name, target, unit}]

  -- Quality
  error_rate_baseline NUMERIC(5,2), -- %
  error_rate_target NUMERIC(5,2), -- %
  quality_checkpoints TEXT[],

  -- Staffing
  fte_allocation NUMERIC(4,2),
  backup_coverage_required BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jtbd_bau_metadata_jtbd ON jtbd_bau_metadata(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_bau_metadata_tenant ON jtbd_bau_metadata(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_bau_metadata_cadence ON jtbd_bau_metadata(operational_cadence);
CREATE INDEX IF NOT EXISTS idx_jtbd_bau_metadata_automation ON jtbd_bau_metadata(current_automation_level);
CREATE INDEX IF NOT EXISTS idx_jtbd_bau_metadata_standardization ON jtbd_bau_metadata(process_standardization);

COMMENT ON TABLE jtbd_bau_metadata IS
  'Extended attributes for BAU-type JTBDs (work_pattern = bau or mixed). Includes cadence, SLA, volume, and automation tracking.';

COMMENT ON COLUMN jtbd_bau_metadata.operational_cadence IS
  'How often this BAU job occurs: continuous, daily, weekly, monthly, quarterly, annual, event_driven';
COMMENT ON COLUMN jtbd_bau_metadata.automation_target IS
  'Target automation level for this BAU process';

-- Enable RLS
ALTER TABLE jtbd_bau_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS jtbd_bau_metadata_tenant_isolation ON jtbd_bau_metadata;
CREATE POLICY jtbd_bau_metadata_tenant_isolation ON jtbd_bau_metadata
  FOR ALL
  USING (tenant_id = COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::uuid,
    tenant_id
  ));

-- ✓ SECTION 3 COMPLETE: jtbd_bau_metadata table created

-- ================================================================
-- SECTION 4: BAU CYCLE ACTIVITIES TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS jtbd_bau_cycle_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Activity Details
  activity_name VARCHAR(255) NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL
    CHECK (activity_type IN ('receive', 'triage', 'process', 'validate', 'approve', 'escalate', 'document', 'report')),

  -- Sequencing
  sequence_order INTEGER NOT NULL,
  typical_duration_minutes INTEGER,
  is_parallel BOOLEAN DEFAULT false, -- Can run in parallel with previous

  -- AI/Automation
  automation_score INTEGER CHECK (automation_score BETWEEN 0 AND 100),
  ai_assistance_type TEXT DEFAULT 'none'
    CHECK (ai_assistance_type IN ('none', 'draft', 'review', 'execute', 'full')),
  ai_assistance_description TEXT,

  -- Context
  systems_used TEXT[],
  data_inputs TEXT[],
  data_outputs TEXT[],
  owner_role VARCHAR(255),

  -- Handoffs
  handoff_required BOOLEAN DEFAULT false,
  handoff_to_role VARCHAR(255),
  handoff_trigger TEXT,

  -- Quality Gates
  gate_type TEXT DEFAULT 'none'
    CHECK (gate_type IN ('none', 'review', 'approval', 'compliance')),
  gate_criteria TEXT,

  -- Error Handling
  error_rate_pct NUMERIC(5,2),
  common_errors TEXT[],
  error_handling_procedure TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jtbd_bau_cycle_activities_jtbd ON jtbd_bau_cycle_activities(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_bau_cycle_activities_tenant ON jtbd_bau_cycle_activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_bau_cycle_activities_type ON jtbd_bau_cycle_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_jtbd_bau_cycle_activities_score ON jtbd_bau_cycle_activities(automation_score DESC);
CREATE INDEX IF NOT EXISTS idx_jtbd_bau_cycle_activities_ai ON jtbd_bau_cycle_activities(ai_assistance_type);

COMMENT ON TABLE jtbd_bau_cycle_activities IS
  'Defines activities within BAU operational cycles. Maps process steps for automation identification and AI assistance planning.';

COMMENT ON COLUMN jtbd_bau_cycle_activities.activity_type IS
  'Process step type: receive (intake), triage (route), process (execute), validate (QC), approve (sign-off), escalate (exception), document (record), report (output)';
COMMENT ON COLUMN jtbd_bau_cycle_activities.ai_assistance_type IS
  'AI assistance level: none, draft (AI creates initial), review (AI checks), execute (AI performs), full (fully automated)';

-- Enable RLS
ALTER TABLE jtbd_bau_cycle_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS jtbd_bau_cycle_activities_tenant_isolation ON jtbd_bau_cycle_activities;
CREATE POLICY jtbd_bau_cycle_activities_tenant_isolation ON jtbd_bau_cycle_activities
  FOR ALL
  USING (tenant_id = COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::uuid,
    tenant_id
  ));

-- ✓ SECTION 4 COMPLETE: jtbd_bau_cycle_activities table created

-- ================================================================
-- SECTION 5: BAU SLA HISTORY TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS jtbd_bau_sla_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT DEFAULT 'monthly'
    CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')),

  -- Volume Metrics
  volume_processed INTEGER,
  volume_target INTEGER,
  volume_achievement_pct NUMERIC(5,2),

  -- SLA Metrics
  sla_met_count INTEGER,
  sla_missed_count INTEGER,
  sla_met_percentage NUMERIC(5,2),
  average_cycle_time_minutes NUMERIC(10,2),
  p95_cycle_time_minutes NUMERIC(10,2),

  -- Quality Metrics
  error_count INTEGER,
  error_rate_percentage NUMERIC(5,2),
  rework_count INTEGER,
  rework_rate_percentage NUMERIC(5,2),

  -- Automation Metrics
  automation_percentage NUMERIC(5,2), -- % processed with AI/automation
  ai_assisted_count INTEGER,
  fully_automated_count INTEGER,

  -- Cost Metrics
  cost_per_transaction NUMERIC(10,2),
  total_cost NUMERIC(12,2),

  -- Trend Indicators
  trend_vs_prior_period TEXT
    CHECK (trend_vs_prior_period IN ('improving', 'stable', 'declining')),
  trend_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(jtbd_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_jtbd_bau_sla_history_jtbd ON jtbd_bau_sla_history(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_bau_sla_history_tenant ON jtbd_bau_sla_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_bau_sla_history_period ON jtbd_bau_sla_history(period_start DESC, period_end DESC);
CREATE INDEX IF NOT EXISTS idx_jtbd_bau_sla_history_sla_pct ON jtbd_bau_sla_history(sla_met_percentage DESC);

COMMENT ON TABLE jtbd_bau_sla_history IS
  'Historical SLA and performance tracking for BAU JTBDs. Identifies trends and measures automation impact over time.';

-- Enable RLS
ALTER TABLE jtbd_bau_sla_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS jtbd_bau_sla_history_tenant_isolation ON jtbd_bau_sla_history;
CREATE POLICY jtbd_bau_sla_history_tenant_isolation ON jtbd_bau_sla_history
  FOR ALL
  USING (tenant_id = COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::uuid,
    tenant_id
  ));

-- ✓ SECTION 5 COMPLETE: jtbd_bau_sla_history table created

-- ================================================================
-- SECTION 6: SERVICE LAYER ROUTING FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION determine_service_layer(
  p_work_pattern TEXT,
  p_archetype TEXT,
  p_complexity TEXT,
  p_compliance_sensitivity TEXT
) RETURNS TEXT AS $$
BEGIN
  -- High compliance always requires workflow with HITL
  IF p_compliance_sensitivity IN ('high', 'critical') THEN
    RETURN 'L3_workflow';
  END IF;

  -- Archetype-driven routing
  CASE p_archetype
    -- Automator: High AI readiness, low complexity
    WHEN 'automator' THEN
      IF p_work_pattern = 'bau' THEN
        RETURN 'L3_workflow'; -- Automated workflows for BAU
      ELSE
        RETURN 'L1_expert'; -- Quick expert answers for project queries
      END IF;

    -- Orchestrator: High AI readiness, high complexity
    WHEN 'orchestrator' THEN
      IF p_complexity IN ('high', 'very_high') THEN
        RETURN 'L4_solution'; -- Full solution for complex work
      ELSE
        RETURN 'L2_panel'; -- Multi-expert panel for varied input
      END IF;

    -- Learner: Low AI readiness, low complexity
    WHEN 'learner' THEN
      RETURN 'L3_workflow'; -- Guided workflow with HITL

    -- Skeptic: Low AI readiness, high complexity
    WHEN 'skeptic' THEN
      RETURN 'L2_panel'; -- Multi-perspective to build trust

    ELSE
      -- Default based on complexity alone
      IF p_complexity IN ('high', 'very_high') THEN
        RETURN 'L2_panel';
      ELSE
        RETURN 'L1_expert';
      END IF;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION determine_service_layer IS
  'Determines optimal AI service layer (L1-L4) based on work pattern, archetype, complexity, and compliance sensitivity';

-- ✓ SECTION 6 COMPLETE: determine_service_layer function created

-- ================================================================
-- SECTION 7: WORK PATTERN VALIDATION FUNCTIONS
-- ================================================================

-- Project-specific validation
CREATE OR REPLACE FUNCTION validate_project_jtbd(p_jtbd_id UUID)
RETURNS TABLE (
  check_name TEXT,
  is_valid BOOLEAN,
  message TEXT
) AS $$
BEGIN
  -- Check work_pattern is project or mixed
  RETURN QUERY
  SELECT
    'work_pattern_correct'::TEXT,
    (SELECT work_pattern IN ('project', 'mixed') FROM jtbd WHERE id = p_jtbd_id),
    'Project validation only applies to project/mixed work patterns'::TEXT;

  -- Check project metadata exists
  RETURN QUERY
  SELECT
    'project_metadata_exists'::TEXT,
    EXISTS(SELECT 1 FROM jtbd_project_metadata WHERE jtbd_id = p_jtbd_id),
    'Project JTBD should have project metadata record'::TEXT;

  -- Check has governance model set
  RETURN QUERY
  SELECT
    'governance_model_set'::TEXT,
    (SELECT governance_model IS NOT NULL FROM jtbd_project_metadata WHERE jtbd_id = p_jtbd_id),
    'Project should have governance model defined'::TEXT;

  -- Check has at least 1 deliverable
  RETURN QUERY
  SELECT
    'has_deliverables'::TEXT,
    EXISTS(SELECT 1 FROM jtbd_project_deliverables WHERE jtbd_id = p_jtbd_id),
    'Project should have at least one deliverable defined'::TEXT;

  -- Check deliverables cover multiple phases
  RETURN QUERY
  SELECT
    'multi_phase_coverage'::TEXT,
    (SELECT COUNT(DISTINCT project_phase) >= 2 FROM jtbd_project_deliverables WHERE jtbd_id = p_jtbd_id),
    'Project should have deliverables in at least 2 phases'::TEXT;

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_project_jtbd IS
  'Validates that a project-type JTBD has required metadata and deliverables';

-- BAU-specific validation
CREATE OR REPLACE FUNCTION validate_bau_jtbd(p_jtbd_id UUID)
RETURNS TABLE (
  check_name TEXT,
  is_valid BOOLEAN,
  message TEXT
) AS $$
BEGIN
  -- Check work_pattern is bau or mixed
  RETURN QUERY
  SELECT
    'work_pattern_correct'::TEXT,
    (SELECT work_pattern IN ('bau', 'mixed') FROM jtbd WHERE id = p_jtbd_id),
    'BAU validation only applies to bau/mixed work patterns'::TEXT;

  -- Check BAU metadata exists
  RETURN QUERY
  SELECT
    'bau_metadata_exists'::TEXT,
    EXISTS(SELECT 1 FROM jtbd_bau_metadata WHERE jtbd_id = p_jtbd_id),
    'BAU JTBD should have BAU metadata record'::TEXT;

  -- Check has operational cadence set
  RETURN QUERY
  SELECT
    'operational_cadence_set'::TEXT,
    (SELECT operational_cadence IS NOT NULL FROM jtbd_bau_metadata WHERE jtbd_id = p_jtbd_id),
    'BAU should have operational cadence defined'::TEXT;

  -- Check has SLA target
  RETURN QUERY
  SELECT
    'sla_target_defined'::TEXT,
    (SELECT sla_target IS NOT NULL FROM jtbd_bau_metadata WHERE jtbd_id = p_jtbd_id),
    'BAU JTBD should have SLA target defined'::TEXT;

  -- Check has at least 3 cycle activities
  RETURN QUERY
  SELECT
    'min_cycle_activities'::TEXT,
    (SELECT COUNT(*) >= 3 FROM jtbd_bau_cycle_activities WHERE jtbd_id = p_jtbd_id),
    'BAU JTBD should have at least 3 cycle activities defined'::TEXT;

  -- Check activities cover key types
  RETURN QUERY
  SELECT
    'activity_type_coverage'::TEXT,
    (SELECT COUNT(DISTINCT activity_type) >= 2 FROM jtbd_bau_cycle_activities WHERE jtbd_id = p_jtbd_id),
    'BAU should have at least 2 different activity types'::TEXT;

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_bau_jtbd IS
  'Validates that a BAU-type JTBD has required metadata and cycle activities';

-- ✓ SECTION 7 COMPLETE: Work pattern validation functions created

-- ================================================================
-- SECTION 8: VIEWS
-- ================================================================

-- View: Project JTBD Dashboard
CREATE OR REPLACE VIEW v_project_jtbd_dashboard AS
SELECT
  j.id AS jtbd_id,
  j.code,
  j.name,
  j.strategic_priority,
  pm.governance_model,
  pm.estimated_duration_weeks,
  pm.typical_team_size,
  pm.cross_functional,
  pm.bau_handover_required,
  pm.risk_level,
  COUNT(DISTINCT pd.id) AS deliverable_count,
  COUNT(DISTINCT pd.project_phase) AS phase_coverage,
  (SELECT COUNT(*) FILTER (WHERE ai_generation_potential IN ('significant', 'full'))
   FROM jtbd_project_deliverables WHERE jtbd_id = j.id) AS ai_ready_deliverables,
  j.tenant_id
FROM jtbd j
JOIN jtbd_project_metadata pm ON j.id = pm.jtbd_id
LEFT JOIN jtbd_project_deliverables pd ON j.id = pd.jtbd_id
WHERE j.work_pattern IN ('project', 'mixed')
AND j.status = 'active'
GROUP BY j.id, j.code, j.name, j.strategic_priority,
         pm.governance_model, pm.estimated_duration_weeks, pm.typical_team_size,
         pm.cross_functional, pm.bau_handover_required, pm.risk_level, j.tenant_id;

COMMENT ON VIEW v_project_jtbd_dashboard IS
  'Dashboard view for project-type JTBDs with metadata and deliverable summary';

-- View: BAU JTBD Dashboard
CREATE OR REPLACE VIEW v_bau_jtbd_dashboard AS
SELECT
  j.id AS jtbd_id,
  j.code,
  j.name,
  j.strategic_priority,
  bm.operational_cadence,
  bm.sla_target,
  bm.typical_volume_per_cycle,
  bm.volume_unit,
  bm.process_standardization,
  bm.current_automation_level,
  bm.automation_target,
  COUNT(DISTINCT ca.id) AS activity_count,
  ROUND(AVG(ca.automation_score), 0) AS avg_automation_score,
  COUNT(DISTINCT CASE WHEN ca.ai_assistance_type != 'none' THEN ca.id END) AS ai_assisted_activities,
  -- Latest SLA performance
  (SELECT sla_met_percentage FROM jtbd_bau_sla_history
   WHERE jtbd_id = j.id ORDER BY period_end DESC LIMIT 1) AS latest_sla_performance,
  j.tenant_id
FROM jtbd j
JOIN jtbd_bau_metadata bm ON j.id = bm.jtbd_id
LEFT JOIN jtbd_bau_cycle_activities ca ON j.id = ca.jtbd_id
WHERE j.work_pattern IN ('bau', 'mixed')
AND j.status = 'active'
GROUP BY j.id, j.code, j.name, j.strategic_priority,
         bm.operational_cadence, bm.sla_target, bm.typical_volume_per_cycle,
         bm.volume_unit, bm.process_standardization,
         bm.current_automation_level, bm.automation_target, j.tenant_id;

COMMENT ON VIEW v_bau_jtbd_dashboard IS
  'Dashboard view for BAU-type JTBDs with metadata, activities, and SLA summary';

-- View: Persona Work Mix (derived from JTBD mappings)
-- NOTE: Commented out - requires jtbd_persona_mapping table which will be created in a future migration
-- Uncomment this view after jtbd_persona_mapping table exists
/*
CREATE OR REPLACE VIEW v_persona_work_mix AS
WITH jtbd_weights AS (
  SELECT
    pm.persona_id,
    pm.jtbd_id,
    j.work_pattern,
    j.jtbd_type,
    j.complexity,
    pm.time_allocation_percentage,
    COALESCE(pm.effort_weight, 1.0) AS effort_weight,
    (pm.time_allocation_percentage * COALESCE(pm.effort_weight, 1.0)) AS weighted_allocation
  FROM jtbd_persona_mapping pm
  JOIN jtbd j ON pm.jtbd_id = j.id
  WHERE j.status = 'active'
),
persona_totals AS (
  SELECT
    persona_id,
    SUM(weighted_allocation) AS total_weighted_allocation,
    SUM(CASE WHEN work_pattern = 'project' THEN weighted_allocation ELSE 0 END) AS project_allocation,
    SUM(CASE WHEN work_pattern = 'bau' THEN weighted_allocation ELSE 0 END) AS bau_allocation,
    SUM(CASE WHEN work_pattern = 'mixed' THEN weighted_allocation * 0.5 ELSE 0 END) AS mixed_project_allocation,
    SUM(CASE WHEN work_pattern = 'mixed' THEN weighted_allocation * 0.5 ELSE 0 END) AS mixed_bau_allocation,
    -- Complexity scoring
    SUM(CASE WHEN complexity = 'high' OR complexity = 'very_high' THEN weighted_allocation ELSE 0 END) AS high_complexity_allocation
  FROM jtbd_weights
  GROUP BY persona_id
)
SELECT
  persona_id,
  ROUND((project_allocation + mixed_project_allocation) / NULLIF(total_weighted_allocation, 0), 2) AS project_work_ratio,
  ROUND((bau_allocation + mixed_bau_allocation) / NULLIF(total_weighted_allocation, 0), 2) AS bau_work_ratio,
  ROUND(high_complexity_allocation / NULLIF(total_weighted_allocation, 0), 2) AS complexity_score,
  total_weighted_allocation,
  CASE
    WHEN (project_allocation + mixed_project_allocation) / NULLIF(total_weighted_allocation, 0) >= 0.6
      THEN 'project_heavy'
    WHEN (bau_allocation + mixed_bau_allocation) / NULLIF(total_weighted_allocation, 0) >= 0.6
      THEN 'bau_heavy'
    ELSE 'balanced'
  END AS work_dominance
FROM persona_totals;

COMMENT ON VIEW v_persona_work_mix IS
  'Computes persona work pattern ratios from JTBD mappings for archetype derivation';
*/

-- ✓ SECTION 8 COMPLETE: Views created

-- ================================================================
-- SECTION 9: UPDATED_AT TRIGGERS
-- ================================================================

DROP TRIGGER IF EXISTS trg_jtbd_project_metadata_updated_at ON jtbd_project_metadata;
CREATE TRIGGER trg_jtbd_project_metadata_updated_at
  BEFORE UPDATE ON jtbd_project_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_jtbd_bau_metadata_updated_at ON jtbd_bau_metadata;
CREATE TRIGGER trg_jtbd_bau_metadata_updated_at
  BEFORE UPDATE ON jtbd_bau_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ✓ SECTION 9 COMPLETE: Updated_at triggers applied

-- ================================================================
-- SUMMARY
-- ================================================================

COMMIT;

DO $$
BEGIN
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'JTBD GOLD STANDARD PHASE 3 MIGRATION COMPLETE';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Created Tables:';
  RAISE NOTICE '  - jtbd_project_metadata (1:1 project extension with BAU handover)';
  RAISE NOTICE '  - jtbd_project_deliverables (phase deliverables with AI potential)';
  RAISE NOTICE '  - jtbd_bau_metadata (1:1 BAU extension with SLA/automation)';
  RAISE NOTICE '  - jtbd_bau_cycle_activities (process steps for automation mapping)';
  RAISE NOTICE '  - jtbd_bau_sla_history (historical performance tracking)';
  RAISE NOTICE 'Created Functions:';
  RAISE NOTICE '  - determine_service_layer (L1-L4 routing)';
  RAISE NOTICE '  - validate_project_jtbd (project completeness)';
  RAISE NOTICE '  - validate_bau_jtbd (BAU completeness)';
  RAISE NOTICE 'Created Views:';
  RAISE NOTICE '  - v_project_jtbd_dashboard';
  RAISE NOTICE '  - v_bau_jtbd_dashboard';
  RAISE NOTICE '  - v_persona_work_mix (SKIPPED - awaits jtbd_persona_mapping table)';
  RAISE NOTICE '================================================================';
END $$;
