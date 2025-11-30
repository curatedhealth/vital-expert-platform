-- =====================================================================
-- MIGRATION TO GOLD STANDARD L3 SCHEMA
-- =====================================================================
-- Purpose: Migrate from current fragmented JTBD schema to unified Gold Standard
-- Date: November 29, 2024
-- Version: 3.0
-- =====================================================================

-- =====================================================================
-- PHASE 0: PRE-MIGRATION SAFETY CHECKS
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'GOLD STANDARD L3 MIGRATION - PHASE 0';
  RAISE NOTICE 'Pre-Migration Safety Checks';
  RAISE NOTICE '========================================';
END $$;

-- Step 1: Create comprehensive backup
DO $$
DECLARE
  backup_schema TEXT := 'jtbd_backup_' || to_char(NOW(), 'YYYYMMDD_HH24MISS');
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', backup_schema);

  -- Backup all JTBD tables
  EXECUTE format('CREATE TABLE %I.jtbd AS SELECT * FROM jtbd', backup_schema);
  EXECUTE format('CREATE TABLE %I.jtbd_outcomes AS SELECT * FROM jtbd_outcomes', backup_schema);
  EXECUTE format('CREATE TABLE %I.jtbd_pain_points AS SELECT * FROM jtbd_pain_points', backup_schema);
  EXECUTE format('CREATE TABLE %I.jtbd_obstacles AS SELECT * FROM jtbd_obstacles', backup_schema);
  EXECUTE format('CREATE TABLE %I.jtbd_constraints AS SELECT * FROM jtbd_constraints', backup_schema);
  EXECUTE format('CREATE TABLE %I.jtbd_ai_suitability AS SELECT * FROM jtbd_ai_suitability', backup_schema);

  RAISE NOTICE '✓ Backup schema created: %', backup_schema;
END $$;

-- Step 2: Document existing JSONB schemas
DO $$
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS jsonb_audit (
    table_name TEXT,
    column_name TEXT,
    sample_value JSONB,
    record_count BIGINT
  );

  -- Audit panel_composition
  INSERT INTO jsonb_audit
  SELECT
    'jtbd_service_mappings',
    'panel_composition',
    panel_composition,
    COUNT(*)
  FROM jtbd_service_mappings
  WHERE panel_composition IS NOT NULL
  GROUP BY panel_composition
  LIMIT 10;

  RAISE NOTICE '✓ JSONB schemas documented in temp table jsonb_audit';
END $$;

-- Step 3: Verify foreign key integrity
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  -- Check for orphaned JTBD outcomes
  SELECT COUNT(*) INTO orphan_count
  FROM jtbd_outcomes o
  WHERE NOT EXISTS (SELECT 1 FROM jtbd j WHERE j.id = o.jtbd_id);

  IF orphan_count > 0 THEN
    RAISE WARNING 'Found % orphaned records in jtbd_outcomes', orphan_count;
  ELSE
    RAISE NOTICE '✓ No orphaned records found';
  END IF;
END $$;

-- =====================================================================
-- PHASE 1: CREATE NEW GOLD STANDARD TABLES
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PHASE 1: Creating Gold Standard Tables';
  RAISE NOTICE '========================================';
END $$;

-- 1.1: JTBD Categories (Hierarchical)
CREATE TABLE IF NOT EXISTS jtbd_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  parent_category_id UUID REFERENCES jtbd_categories(id),
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  description TEXT,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(code, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_jtbd_categories_parent ON jtbd_categories(parent_category_id);

-- 1.2: Strategic Pillars
CREATE TABLE IF NOT EXISTS strategic_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  sequence_order INTEGER,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3: JTBD → Category/Pillar Mappings
CREATE TABLE IF NOT EXISTS jtbd_category_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  category_id UUID REFERENCES jtbd_categories(id),
  pillar_id UUID REFERENCES strategic_pillars(id),
  relevance_score NUMERIC(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_primary BOOLEAN DEFAULT false,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (category_id IS NOT NULL OR pillar_id IS NOT NULL),
  UNIQUE(jtbd_id, category_id),
  UNIQUE(jtbd_id, pillar_id)
);

-- 1.4: L0 Context Linking (Polymorphic)
CREATE TABLE IF NOT EXISTS jtbd_l0_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  l0_entity_type TEXT NOT NULL CHECK (l0_entity_type IN (
    'tenant', 'industry', 'geography', 'regulatory_framework',
    'market_segment', 'therapeutic_area', 'business_model', 'company_size'
  )),
  l0_entity_id UUID NOT NULL,
  l0_entity_name TEXT NOT NULL,
  relevance_score NUMERIC(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_primary BOOLEAN DEFAULT false,
  context_notes TEXT,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(jtbd_id, l0_entity_type, l0_entity_id)
);

CREATE INDEX IF NOT EXISTS idx_jtbd_l0_context_jtbd ON jtbd_l0_context(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_l0_context_entity ON jtbd_l0_context(l0_entity_type, l0_entity_id);

-- 1.5: AI Intervention Types (5 types)
CREATE TABLE IF NOT EXISTS ai_intervention_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'transformative')),
  sequence_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6: Service Panel Members (Replaces panel_composition JSONB)
CREATE TABLE IF NOT EXISTS service_panel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_mapping_id UUID NOT NULL REFERENCES jtbd_service_mappings(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id),
  role_in_panel TEXT NOT NULL CHECK (role_in_panel IN ('lead_expert', 'supporting_expert', 'reviewer', 'approver')),
  sequence_order INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT true,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_mapping_id, agent_id, role_in_panel)
);

CREATE INDEX IF NOT EXISTS idx_service_panel_members_service ON service_panel_members(service_mapping_id);
CREATE INDEX IF NOT EXISTS idx_service_panel_members_agent ON service_panel_members(agent_id);

-- 1.7: Service Compliance Gates (Replaces compliance_gates JSONB)
CREATE TABLE IF NOT EXISTS service_compliance_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_mapping_id UUID NOT NULL REFERENCES jtbd_service_mappings(id) ON DELETE CASCADE,
  gate_type TEXT NOT NULL CHECK (gate_type IN ('pre_approval', 'in_progress', 'post_execution', 'audit')),
  compliance_requirement TEXT NOT NULL,
  validation_rule TEXT,
  is_required BOOLEAN DEFAULT true,
  sequence_order INTEGER DEFAULT 1,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_mapping_id, gate_type, compliance_requirement)
);

CREATE INDEX IF NOT EXISTS idx_service_compliance_gates_service ON service_compliance_gates(service_mapping_id);

-- 1.8: Persona AI Preferences (Replaces ai_delivery_preferences JSONB)
CREATE TABLE IF NOT EXISTS persona_ai_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  preference_type TEXT NOT NULL CHECK (preference_type IN (
    'interface', 'response_length', 'technical_depth', 'citation_style',
    'automation_level', 'notification_frequency', 'report_format'
  )),
  preference_value TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(persona_id, preference_type)
);

CREATE INDEX IF NOT EXISTS idx_persona_ai_preferences_persona ON persona_ai_preferences(persona_id);

-- 1.9: Workflow Phase Gates (Replaces gate_config JSONB)
CREATE TABLE IF NOT EXISTS workflow_phase_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_stage_id UUID NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
  gate_name TEXT NOT NULL,
  gate_type TEXT NOT NULL CHECK (gate_type IN ('approval', 'quality_check', 'compliance', 'resource_check')),
  criteria TEXT NOT NULL,
  is_required BOOLEAN DEFAULT true,
  approver_role_id UUID REFERENCES org_roles(id),
  sequence_order INTEGER DEFAULT 1,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_stage_id, gate_name)
);

CREATE INDEX IF NOT EXISTS idx_workflow_phase_gates_stage ON workflow_phase_gates(workflow_stage_id);

-- 1.10: Workflow Task Outputs (Replaces outputs TEXT[])
CREATE TABLE IF NOT EXISTS workflow_task_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  output_name TEXT NOT NULL,
  output_type TEXT CHECK (output_type IN ('document', 'data', 'approval', 'notification')),
  output_format TEXT,
  is_required BOOLEAN DEFAULT true,
  sequence_order INTEGER DEFAULT 1,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_task_id, output_name)
);

CREATE INDEX IF NOT EXISTS idx_workflow_task_outputs_task ON workflow_task_outputs(workflow_task_id);

-- 1.11: Workflow Task Dependencies (Replaces dependencies UUID[])
CREATE TABLE IF NOT EXISTS workflow_task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL CHECK (dependency_type IN ('blocks', 'informs', 'requires_approval', 'optional')),
  lag_time_hours INTEGER DEFAULT 0,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_task_id, depends_on_task_id),
  CHECK (workflow_task_id != depends_on_task_id)
);

CREATE INDEX IF NOT EXISTS idx_workflow_task_dependencies_task ON workflow_task_dependencies(workflow_task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_task_dependencies_depends ON workflow_task_dependencies(depends_on_task_id);

DO $$
BEGIN
  RAISE NOTICE '✓ All Gold Standard tables created';
END $$;

-- =====================================================================
-- PHASE 2: SEED REFERENCE DATA
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PHASE 2: Seeding Reference Data';
  RAISE NOTICE '========================================';
END $$;

-- 2.1: Seed Strategic Pillars
INSERT INTO strategic_pillars (code, name, description, sequence_order, tenant_id) VALUES
  ('SP01', 'Scientific Excellence', 'Maintain highest standards of scientific rigor and evidence quality', 1, (SELECT id FROM tenants LIMIT 1)),
  ('SP02', 'Operational Efficiency', 'Optimize processes, reduce waste, improve throughput', 2, (SELECT id FROM tenants LIMIT 1)),
  ('SP03', 'Regulatory Compliance', 'Ensure full compliance with FDA, EMA, ICH, and local regulations', 3, (SELECT id FROM tenants LIMIT 1)),
  ('SP04', 'Stakeholder Engagement', 'Build trust and collaboration with HCPs, patients, payers, regulators', 4, (SELECT id FROM tenants LIMIT 1)),
  ('SP05', 'Data-Driven Decision Making', 'Leverage real-world evidence, analytics, and AI for insights', 5, (SELECT id FROM tenants LIMIT 1)),
  ('SP06', 'Innovation & Agility', 'Embrace new technologies, adapt quickly to market changes', 6, (SELECT id FROM tenants LIMIT 1)),
  ('SP07', 'Patient-Centricity', 'Prioritize patient outcomes, safety, and quality of life', 7, (SELECT id FROM tenants LIMIT 1))
ON CONFLICT (code) DO NOTHING;

-- 2.2: Seed AI Intervention Types
INSERT INTO ai_intervention_types (code, name, description, impact_level, sequence_order) VALUES
  ('ASSIST', 'Assist', 'AI provides suggestions and recommendations to help humans perform tasks', 'low', 1),
  ('AUGMENT', 'Augment', 'AI enhances human capabilities with real-time intelligence', 'medium', 2),
  ('AUTOMATE', 'Automate', 'AI fully automates repetitive, rule-based tasks', 'high', 3),
  ('ORCHESTRATE', 'Orchestrate', 'AI coordinates complex multi-step workflows across systems', 'high', 4),
  ('REDESIGN', 'Redesign', 'AI fundamentally transforms how the job is done', 'transformative', 5)
ON CONFLICT (code) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE '✓ Reference data seeded';
END $$;

-- =====================================================================
-- PHASE 3: DATA MIGRATION (JSONB → Normalized Tables)
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PHASE 3: Migrating JSONB Data';
  RAISE NOTICE '========================================';
END $$;

-- 3.1: Migrate panel_composition JSONB → service_panel_members
DO $$
DECLARE
  mapping_record RECORD;
  panel_json JSONB;
  agent_id UUID;
BEGIN
  FOR mapping_record IN
    SELECT id, panel_composition, tenant_id
    FROM jtbd_service_mappings
    WHERE panel_composition IS NOT NULL
  LOOP
    panel_json := mapping_record.panel_composition;

    -- Migrate lead_expert
    IF panel_json ? 'lead_expert' THEN
      agent_id := (panel_json->>'lead_expert')::UUID;
      INSERT INTO service_panel_members (service_mapping_id, agent_id, role_in_panel, is_required, tenant_id)
      VALUES (mapping_record.id, agent_id, 'lead_expert', true, mapping_record.tenant_id)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Migrate supporting_experts array
    IF panel_json ? 'supporting_experts' THEN
      INSERT INTO service_panel_members (service_mapping_id, agent_id, role_in_panel, sequence_order, tenant_id)
      SELECT
        mapping_record.id,
        (elem->>'uuid')::UUID,
        'supporting_expert',
        ROW_NUMBER() OVER (),
        mapping_record.tenant_id
      FROM jsonb_array_elements(panel_json->'supporting_experts') AS elem
      ON CONFLICT DO NOTHING;
    END IF;

    -- Migrate review_panel array
    IF panel_json ? 'review_panel' THEN
      INSERT INTO service_panel_members (service_mapping_id, agent_id, role_in_panel, sequence_order, tenant_id)
      SELECT
        mapping_record.id,
        (elem->>'uuid')::UUID,
        'reviewer',
        ROW_NUMBER() OVER (),
        mapping_record.tenant_id
      FROM jsonb_array_elements(panel_json->'review_panel') AS elem
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RAISE NOTICE '✓ Migrated panel_composition → service_panel_members';
END $$;

-- 3.2: Migrate compliance_gates JSONB → service_compliance_gates
DO $$
DECLARE
  mapping_record RECORD;
  gates_json JSONB;
BEGIN
  FOR mapping_record IN
    SELECT id, compliance_gates, tenant_id
    FROM jtbd_service_mappings
    WHERE compliance_gates IS NOT NULL
  LOOP
    gates_json := mapping_record.compliance_gates;

    -- Migrate pre_approval gates
    IF gates_json ? 'pre_approval' THEN
      INSERT INTO service_compliance_gates (service_mapping_id, gate_type, compliance_requirement, sequence_order, tenant_id)
      SELECT
        mapping_record.id,
        'pre_approval',
        elem::TEXT,
        ROW_NUMBER() OVER (),
        mapping_record.tenant_id
      FROM jsonb_array_elements_text(gates_json->'pre_approval') AS elem
      ON CONFLICT DO NOTHING;
    END IF;

    -- Migrate post_execution gates
    IF gates_json ? 'post_execution' THEN
      INSERT INTO service_compliance_gates (service_mapping_id, gate_type, compliance_requirement, sequence_order, tenant_id)
      SELECT
        mapping_record.id,
        'post_execution',
        elem::TEXT,
        ROW_NUMBER() OVER (),
        mapping_record.tenant_id
      FROM jsonb_array_elements_text(gates_json->'post_execution') AS elem
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RAISE NOTICE '✓ Migrated compliance_gates → service_compliance_gates';
END $$;

-- 3.3: Migrate ai_delivery_preferences JSONB → persona_ai_preferences
DO $$
DECLARE
  persona_record RECORD;
  prefs_json JSONB;
  pref_key TEXT;
BEGIN
  FOR persona_record IN
    SELECT id, ai_delivery_preferences, tenant_id
    FROM jtbd_persona_mappings
    WHERE ai_delivery_preferences IS NOT NULL
  LOOP
    prefs_json := persona_record.ai_delivery_preferences;

    -- Iterate through all preference keys
    FOR pref_key IN SELECT jsonb_object_keys(prefs_json)
    LOOP
      INSERT INTO persona_ai_preferences (persona_id, preference_type, preference_value, tenant_id)
      VALUES (
        persona_record.id,
        pref_key,
        prefs_json->>pref_key,
        persona_record.tenant_id
      )
      ON CONFLICT (persona_id, preference_type) DO UPDATE
      SET preference_value = EXCLUDED.preference_value;
    END LOOP;
  END LOOP;

  RAISE NOTICE '✓ Migrated ai_delivery_preferences → persona_ai_preferences';
END $$;

-- 3.4: Migrate workflow outputs TEXT[] → workflow_task_outputs
DO $$
BEGIN
  INSERT INTO workflow_task_outputs (workflow_task_id, output_name, sequence_order, tenant_id)
  SELECT
    wt.id,
    unnest(wt.outputs),
    generate_series(1, array_length(wt.outputs, 1)),
    wt.tenant_id
  FROM workflow_tasks wt
  WHERE wt.outputs IS NOT NULL AND array_length(wt.outputs, 1) > 0
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✓ Migrated outputs[] → workflow_task_outputs';
END $$;

-- 3.5: Migrate workflow dependencies UUID[] → workflow_task_dependencies
DO $$
BEGIN
  INSERT INTO workflow_task_dependencies (workflow_task_id, depends_on_task_id, dependency_type, tenant_id)
  SELECT
    wt.id,
    unnest(wt.dependencies),
    'blocks', -- Default to blocking dependency
    wt.tenant_id
  FROM workflow_tasks wt
  WHERE wt.dependencies IS NOT NULL AND array_length(wt.dependencies, 1) > 0
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✓ Migrated dependencies[] → workflow_task_dependencies';
END $$;

-- =====================================================================
-- PHASE 4: CLEANUP (Drop Old JSONB Columns)
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PHASE 4: Cleaning Up Old Columns';
  RAISE NOTICE '========================================';
END $$;

-- 4.1: Drop JSONB columns after successful migration
DO $$
BEGIN
  -- Drop panel_composition
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_service_mappings' AND column_name = 'panel_composition') THEN
    ALTER TABLE jtbd_service_mappings DROP COLUMN panel_composition;
    RAISE NOTICE '✓ Dropped panel_composition JSONB column';
  END IF;

  -- Drop compliance_gates
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_service_mappings' AND column_name = 'compliance_gates') THEN
    ALTER TABLE jtbd_service_mappings DROP COLUMN compliance_gates;
    RAISE NOTICE '✓ Dropped compliance_gates JSONB column';
  END IF;

  -- Drop ai_delivery_preferences
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_persona_mappings' AND column_name = 'ai_delivery_preferences') THEN
    ALTER TABLE jtbd_persona_mappings DROP COLUMN ai_delivery_preferences;
    RAISE NOTICE '✓ Dropped ai_delivery_preferences JSONB column';
  END IF;

  -- Drop gate_config
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_phases' AND column_name = 'gate_config') THEN
    ALTER TABLE workflow_phases DROP COLUMN gate_config;
    RAISE NOTICE '✓ Dropped gate_config JSONB column';
  END IF;

  -- Drop outputs array
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_tasks' AND column_name = 'outputs') THEN
    ALTER TABLE workflow_tasks DROP COLUMN outputs;
    RAISE NOTICE '✓ Dropped outputs TEXT[] column';
  END IF;

  -- Drop dependencies array
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_tasks' AND column_name = 'dependencies') THEN
    ALTER TABLE workflow_tasks DROP COLUMN dependencies;
    RAISE NOTICE '✓ Dropped dependencies UUID[] column';
  END IF;

  -- Rename metadata to experimental_metadata if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'metadata') THEN
    ALTER TABLE jtbd RENAME COLUMN metadata TO experimental_metadata;
    COMMENT ON COLUMN jtbd.experimental_metadata IS
    'ONLY for experimental/temporary data. Should be migrated to proper columns once structure is understood.';
    RAISE NOTICE '✓ Renamed metadata → experimental_metadata';
  END IF;
END $$;

-- =====================================================================
-- PHASE 5: CREATE COMPREHENSIVE VIEWS
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PHASE 5: Creating Comprehensive Views';
  RAISE NOTICE '========================================';
END $$;

CREATE OR REPLACE VIEW v_jtbd_gold_standard_complete AS
SELECT
  j.id,
  j.code,
  j.name,
  j.job_statement,
  j.job_category,
  j.complexity,
  j.frequency,
  j.status,

  -- L0 Context
  array_agg(DISTINCT l0.l0_entity_type || ':' || l0.l0_entity_name) FILTER (WHERE l0.id IS NOT NULL) AS l0_contexts,

  -- Categories & Pillars
  array_agg(DISTINCT cat.name) FILTER (WHERE cat.id IS NOT NULL) AS categories,
  array_agg(DISTINCT sp.name) FILTER (WHERE sp.id IS NOT NULL) AS strategic_pillars,

  -- ODI Metrics
  COUNT(DISTINCT out.id) AS outcome_count,
  ROUND(AVG(out.opportunity_score), 1) AS avg_opportunity_score,
  COUNT(DISTINCT out.id) FILTER (WHERE out.opportunity_priority = 'high') AS high_priority_outcomes,

  -- Friction Metrics
  COUNT(DISTINCT pp.id) AS pain_point_count,
  COUNT(DISTINCT obs.id) AS obstacle_count,
  COUNT(DISTINCT con.id) AS constraint_count,

  -- AI Metrics
  ais.overall_score AS ai_suitability_score,
  ais.recommended_intervention_type,
  ais.recommended_service_layer,
  COUNT(DISTINCT aio.id) AS ai_opportunity_count,
  COUNT(DISTINCT auc.id) AS ai_use_case_count,

  -- Org Mappings
  array_agg(DISTINCT jf.function_name) FILTER (WHERE jf.id IS NOT NULL) AS functions,
  array_agg(DISTINCT jd.department_name) FILTER (WHERE jd.id IS NOT NULL) AS departments,
  array_agg(DISTINCT jr.role_name) FILTER (WHERE jr.id IS NOT NULL) AS roles,

  -- Value Metrics
  array_agg(DISTINCT vc.name) FILTER (WHERE vc.id IS NOT NULL) AS value_categories,
  array_agg(DISTINCT vd.name) FILTER (WHERE vd.id IS NOT NULL) AS value_drivers,

  -- Metadata
  j.created_at,
  j.updated_at

FROM jtbd j
LEFT JOIN jtbd_l0_context l0 ON j.id = l0.jtbd_id
LEFT JOIN jtbd_category_mappings cm ON j.id = cm.jtbd_id
LEFT JOIN jtbd_categories cat ON cm.category_id = cat.id
LEFT JOIN strategic_pillars sp ON cm.pillar_id = sp.id
LEFT JOIN jtbd_outcomes out ON j.id = out.jtbd_id
LEFT JOIN jtbd_pain_points pp ON j.id = pp.jtbd_id
LEFT JOIN jtbd_obstacles obs ON j.id = obs.jtbd_id
LEFT JOIN jtbd_constraints con ON j.id = con.jtbd_id
LEFT JOIN jtbd_ai_suitability ais ON j.id = ais.jtbd_id
LEFT JOIN ai_opportunities aio ON j.id = aio.jtbd_id
LEFT JOIN ai_use_cases auc ON j.id = auc.jtbd_id
LEFT JOIN jtbd_functions jf ON j.id = jf.jtbd_id
LEFT JOIN jtbd_departments jd ON j.id = jd.jtbd_id
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id
LEFT JOIN jtbd_value_categories jvc ON j.id = jvc.jtbd_id
LEFT JOIN value_categories vc ON jvc.value_category_id = vc.id
LEFT JOIN jtbd_value_drivers jvd ON j.id = jvd.jtbd_id
LEFT JOIN value_drivers vd ON jvd.value_driver_id = vd.id

WHERE j.deleted_at IS NULL

GROUP BY j.id, ais.overall_score, ais.recommended_intervention_type, ais.recommended_service_layer

ORDER BY j.code;

DO $$
BEGIN
  RAISE NOTICE '✓ Comprehensive view created: v_jtbd_gold_standard_complete';
END $$;

-- =====================================================================
-- PHASE 6: FINAL VERIFICATION
-- =====================================================================

DO $$
DECLARE
  table_count INTEGER;
  view_count INTEGER;
  jsonb_count INTEGER;
  array_count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PHASE 6: Final Verification';
  RAISE NOTICE '========================================';

  -- Count new tables created
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_name IN (
    'jtbd_categories', 'strategic_pillars', 'jtbd_category_mappings',
    'jtbd_l0_context', 'ai_intervention_types', 'service_panel_members',
    'service_compliance_gates', 'persona_ai_preferences', 'workflow_phase_gates',
    'workflow_task_outputs', 'workflow_task_dependencies'
  );
  RAISE NOTICE '✓ New tables created: %', table_count;

  -- Count views
  SELECT COUNT(*) INTO view_count
  FROM information_schema.views
  WHERE table_name LIKE 'v_jtbd%';
  RAISE NOTICE '✓ Views created: %', view_count;

  -- Verify JSONB elimination
  SELECT COUNT(*) INTO jsonb_count
  FROM information_schema.columns
  WHERE table_name LIKE 'jtbd%' OR table_name LIKE 'workflow%' OR table_name LIKE 'service%'
    AND data_type = 'jsonb'
    AND column_name != 'experimental_metadata';

  IF jsonb_count = 0 THEN
    RAISE NOTICE '✓ All JSONB violations resolved';
  ELSE
    RAISE WARNING 'Found % remaining JSONB columns', jsonb_count;
  END IF;

  -- Verify array elimination
  SELECT COUNT(*) INTO array_count
  FROM information_schema.columns
  WHERE table_name LIKE 'jtbd%' OR table_name LIKE 'workflow%'
    AND data_type LIKE '%[]';

  IF array_count = 0 THEN
    RAISE NOTICE '✓ All array violations resolved';
  ELSE
    RAISE WARNING 'Found % remaining array columns', array_count;
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION TO GOLD STANDARD L3 COMPLETE';
  RAISE NOTICE '========================================';
END $$;
