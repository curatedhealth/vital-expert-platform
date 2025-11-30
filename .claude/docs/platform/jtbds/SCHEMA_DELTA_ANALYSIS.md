# JTBD Schema Delta Analysis: Gold Standard v3.1 vs Schema Reference v1.0

**Date**: November 29, 2024
**Status**: Analysis Complete - Action Required
**Sources**:
- Current: `JTBD_WORK_PATTERN_OKR_ENRICHMENT.md` (Gold Standard v3.1)
- New Input 1: `VITAL_JTBD_Schema_Reference (1).md` (Schema Reference v1.0)
- New Input 2: `VITAL_JTBD_TEMPLATE (1).json` (Template v1.0)

---

## Executive Summary

The new Schema Reference v1.0 introduces several enhancements that should be integrated into our Gold Standard v3.1:

| Category | Current Gold Standard | New Schema Reference | Action |
|----------|----------------------|----------------------|--------|
| **Tables** | 27 tables | 14 core tables | Merge (no conflict) |
| **ODI Structure** | Basic scores | Decomposed (direction/object/type) | **Enhance** |
| **AI Assessment** | Distributed | Dedicated `jtbd_ai_assessments` table | **Add** |
| **Enablers** | Not present | `jtbd_enablers` table | **Add** |
| **Success Criteria** | Not present | `jtbd_success_criteria` table | **Add** |
| **Strategic Pillars** | SP01-SP07 (7 pillars) | SP01-SP07 (different names) | **Reconcile** |
| **Validation Rules** | Implicit | Explicit checklist | **Add** |

---

## 1. Table Comparison

### 1.1 Tables in BOTH (Compatible)

| Table | Gold Standard v3.1 | Schema Ref v1.0 | Status |
|-------|-------------------|-----------------|--------|
| `jtbd` | ✅ | ✅ | Compatible |
| `jtbd_outcomes` | ✅ | ✅ | **Enhance** (add decomposition) |
| `jtbd_pain_points` | ✅ | ✅ | Compatible |
| `jtbd_persona_mappings` | ✅ (via jtbd_persona_mapping) | ✅ | Compatible |
| `jtbd_service_mappings` | ✅ | ✅ | Compatible |
| `jtbd_workflows` | ✅ (via workflow_templates) | ✅ | **Rename consideration** |
| `workflow_phases` | ✅ | ✅ | Compatible |
| `workflow_tasks` | ✅ | ✅ | Compatible |
| `jtbd_kpis` | ✅ | ✅ | Compatible |
| `evidence_sources` | ✅ | ✅ | Compatible |
| `jtbd_evidence_links` | ✅ | ✅ | Compatible |

### 1.2 Tables ONLY in Gold Standard v3.1

| Table | Purpose | Keep? |
|-------|---------|-------|
| `jtbd_obstacles` | Removable blockers (3-tier friction model) | ✅ Keep |
| `jtbd_constraints` | Fixed limitations (regulatory, legal) | ✅ Keep |
| `jtbd_l0_context` | Polymorphic L0 entity linking | ✅ Keep |
| `jtbd_categories` | Category reference table | ✅ Keep |
| `strategic_pillars` | Reference table | ✅ Keep (update values) |
| `jtbd_category_mappings` | Category junction | ✅ Keep |
| `value_categories` | Value layer | ✅ Keep |
| `value_drivers` | Value layer | ✅ Keep |
| `jtbd_value_categories` | Value junction | ✅ Keep |
| `jtbd_value_drivers` | Value junction | ✅ Keep |
| `ai_intervention_types` | 5 AI types (ASSIST→REDESIGN) | ✅ Keep |
| `jtbd_ai_suitability` | Multi-dimensional AI scores | **Merge** with jtbd_ai_assessments |
| `ai_opportunities` | Consolidated opportunities | **Merge** with jtbd_ai_assessments |
| `ai_use_cases` | Service layer mapping | ✅ Keep |
| `service_panel_members` | Panel composition (normalized) | ✅ Keep |
| `service_compliance_gates` | Compliance gates (normalized) | ✅ Keep |
| `persona_ai_preferences` | AI delivery prefs (normalized) | ✅ Keep |
| `workflow_phase_gates` | Gate config (normalized) | ✅ Keep |
| `workflow_task_outputs` | Task outputs (normalized) | ✅ Keep |
| `workflow_task_dependencies` | Task dependencies (normalized) | ✅ Keep |
| `jtbd_functions` | Function mapping | ✅ Keep |
| `jtbd_departments` | Department mapping | ✅ Keep |
| `jtbd_roles` | Role mapping | ✅ Keep |
| `okr` | OKR objectives | ✅ Keep |
| `key_result` | Key results with ODI linkage | ✅ Keep |
| `okr_jtbd_mapping` | OKR-JTBD junction | ✅ Keep |
| `okr_ai_opportunity_mapping` | OKR-AI opportunity junction | ✅ Keep |
| `ref_project_phases` | PMBOK phases | ✅ Keep |
| `ref_bau_cadences` | ITIL cadences | ✅ Keep |
| `ref_archetypes` | 4 persona archetypes | ✅ Keep |
| `jtbd_project_phases` | JTBD-phase junction | ✅ Keep |
| `jtbd_bau_cadences` | JTBD-cadence junction | ✅ Keep |

### 1.3 Tables ONLY in Schema Reference v1.0 (TO ADD)

| Table | Purpose | Priority | Action |
|-------|---------|----------|--------|
| `jtbd_ai_assessments` | 1:1 comprehensive automation assessment | **HIGH** | Add (consolidates ai_suitability + ai_opportunities) |
| `jtbd_enablers` | Tools, systems, data sources, processes, skills | **HIGH** | Add |
| `jtbd_success_criteria` | Measurable success metrics | **MEDIUM** | Add |

---

## 2. Attribute Enhancements

### 2.1 JTBD Core Table Enhancements

**New attributes to add to `jtbd` table:**

```sql
-- Already have these (confirmed match):
-- code, name, description, complexity, frequency, tenant_id

-- Need to verify/add:
ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  functional_area TEXT; -- "Medical Affairs", "Commercial", etc.

ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  category TEXT DEFAULT 'core'
  CHECK (category IN ('core', 'related', 'emotional', 'consumption'));

ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  impact_level TEXT DEFAULT 'medium'
  CHECK (impact_level IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  service_layer TEXT DEFAULT 'L1_expert'
  CHECK (service_layer IN ('L1_expert', 'L2_panel', 'L3_workflow', 'L4_solution'));

ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  compliance_sensitivity TEXT DEFAULT 'medium'
  CHECK (compliance_sensitivity IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  validation_status TEXT DEFAULT 'draft'
  CHECK (validation_status IN ('draft', 'in_review', 'approved', 'archived'));

ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  validated_by UUID REFERENCES users(id);

ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  validated_at TIMESTAMPTZ;
```

### 2.2 ODI Outcomes Enhancement

**Current `jtbd_outcomes` structure:**
```sql
-- outcome_statement TEXT
-- outcome_type TEXT (desired, undesired, over_served, under_served)
-- importance_score, satisfaction_score
-- opportunity_score (computed)
-- opportunity_priority (computed)
```

**Enhanced structure from Schema Ref v1.0:**
```sql
-- ADD these decomposition fields:
ALTER TABLE jtbd_outcomes ADD COLUMN IF NOT EXISTS
  outcome_id TEXT; -- Human-readable: "MED-001-O01"

ALTER TABLE jtbd_outcomes ADD COLUMN IF NOT EXISTS
  outcome_direction TEXT NOT NULL
  CHECK (outcome_direction IN ('minimize', 'maximize', 'optimize', 'eliminate', 'ensure', 'reduce', 'increase'));

ALTER TABLE jtbd_outcomes ADD COLUMN IF NOT EXISTS
  outcome_object TEXT NOT NULL; -- "time to gather stakeholder input"

ALTER TABLE jtbd_outcomes ADD COLUMN IF NOT EXISTS
  outcome_category TEXT DEFAULT 'functional'
  CHECK (outcome_category IN ('functional', 'emotional', 'social'));

-- RENAME: outcome_type → odi_type (to avoid confusion with category)
-- OR add new column for ODI dimension:
ALTER TABLE jtbd_outcomes ADD COLUMN IF NOT EXISTS
  odi_dimension TEXT
  CHECK (odi_dimension IN ('speed', 'stability', 'output_quality', 'accuracy', 'cost', 'risk', 'compliance'));
```

**ODI Outcome Statement Decomposition:**
```
Statement: "Minimize the time it takes to gather input from all stakeholders"

Decomposed:
- outcome_direction: "minimize"
- outcome_object: "time to gather stakeholder input"
- odi_dimension: "speed"
```

### 2.3 Opportunity Score Thresholds

**Schema Ref v1.0 defines explicit thresholds:**
```sql
-- Update opportunity_priority computed column:
opportunity_priority TEXT GENERATED ALWAYS AS (
  CASE
    WHEN opportunity_score >= 15 THEN 'extreme'   -- ≥15
    WHEN opportunity_score >= 12 THEN 'high'      -- 12-14.9
    WHEN opportunity_score >= 10 THEN 'moderate'  -- 10-11.9
    WHEN opportunity_score >= 8 THEN 'low'        -- 8-9.9
    ELSE 'table_stakes'                           -- <8
  END
) STORED;
```

**Current Gold Standard has:**
- high (>12)
- medium (8-12)
- low (<8)

**Action:** Expand to 5-tier system (extreme, high, moderate, low, table_stakes)

---

## 3. New Tables to Add

### 3.1 `jtbd_ai_assessments` (1:1 with JTBD)

This table consolidates:
- `jtbd_ai_suitability` (multi-dimensional AI scores)
- `ai_opportunities` (ROI estimates)

```sql
CREATE TABLE IF NOT EXISTS jtbd_ai_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL UNIQUE REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Automation Assessment (from jtbd_ai_suitability)
  automation_potential TEXT NOT NULL DEFAULT 'partial'
    CHECK (automation_potential IN ('none', 'partial', 'significant', 'full')),
  automation_score INTEGER CHECK (automation_score BETWEEN 0 AND 100),

  -- Multi-dimensional AI Scores (move from jtbd_ai_suitability)
  rag_score NUMERIC(3,2),           -- 0.00-1.00
  summary_score NUMERIC(3,2),
  generation_score NUMERIC(3,2),
  classification_score NUMERIC(3,2),
  reasoning_score NUMERIC(3,2),
  overall_ai_score NUMERIC(3,2),
  recommended_intervention_type TEXT,

  -- Value Metrics
  time_savings_pct NUMERIC(5,2),
  quality_improvement_pct NUMERIC(5,2),
  estimated_annual_hours_saved NUMERIC(10,2),
  estimated_annual_value_usd NUMERIC(12,2),

  -- Implementation Assessment
  implementation_complexity TEXT DEFAULT 'medium'
    CHECK (implementation_complexity IN ('low', 'medium', 'high', 'very_high')),
  implementation_effort_weeks INTEGER,

  -- Requirements (normalized to separate tables later)
  data_requirements TEXT[],
  model_requirements TEXT[],
  integration_requirements TEXT[],

  -- Risk & Dependencies
  risk_factors TEXT[],
  prerequisites UUID[], -- JTBD IDs that must be automated first

  -- ROI Calculation
  roi_estimate TEXT,
  payback_months INTEGER,

  -- Confidence
  confidence_level TEXT DEFAULT 'medium'
    CHECK (confidence_level IN ('low', 'medium', 'high')),

  -- Assessment Metadata
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  assessed_by TEXT,
  assessment_methodology TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jtbd_ai_assessments_jtbd ON jtbd_ai_assessments(jtbd_id);
CREATE INDEX idx_jtbd_ai_assessments_tenant ON jtbd_ai_assessments(tenant_id);
CREATE INDEX idx_jtbd_ai_assessments_score ON jtbd_ai_assessments(automation_score DESC);
CREATE INDEX idx_jtbd_ai_assessments_potential ON jtbd_ai_assessments(automation_potential);

COMMENT ON TABLE jtbd_ai_assessments IS
  'Comprehensive AI automation assessment for each JTBD (1:1 relationship). Captures automation potential, value estimates, implementation requirements, and ROI projections.';
```

### 3.2 `jtbd_enablers` (Required Resources)

```sql
CREATE TABLE IF NOT EXISTS jtbd_enablers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Enabler Details
  enabler_name TEXT NOT NULL,
  enabler_type TEXT NOT NULL DEFAULT 'tool'
    CHECK (enabler_type IN ('tool', 'system', 'data_source', 'process', 'skill', 'integration')),

  -- State Assessment
  current_state TEXT DEFAULT 'available'
    CHECK (current_state IN ('available', 'partial', 'missing', 'planned')),
  criticality TEXT DEFAULT 'important'
    CHECK (criticality IN ('required', 'important', 'nice_to_have')),

  -- Vendor Info (for tools/systems)
  vendor TEXT,
  vendor_url TEXT,

  -- Notes
  notes TEXT,
  gap_remediation_plan TEXT, -- What's needed to fill the gap

  -- Ordering
  sequence_order INTEGER DEFAULT 1,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(jtbd_id, enabler_name)
);

CREATE INDEX idx_jtbd_enablers_jtbd ON jtbd_enablers(jtbd_id);
CREATE INDEX idx_jtbd_enablers_tenant ON jtbd_enablers(tenant_id);
CREATE INDEX idx_jtbd_enablers_type ON jtbd_enablers(enabler_type);
CREATE INDEX idx_jtbd_enablers_state ON jtbd_enablers(current_state);

COMMENT ON TABLE jtbd_enablers IS
  'Documents tools, systems, data sources, processes, skills, and integrations required for job execution. Identifies gaps and dependencies for automation planning.';
```

### 3.3 `jtbd_success_criteria` (Measurable Success)

```sql
CREATE TABLE IF NOT EXISTS jtbd_success_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Criterion Details
  criterion TEXT NOT NULL, -- "Time to first response for MI requests"
  criterion_type TEXT DEFAULT 'output'
    CHECK (criterion_type IN ('input', 'output', 'outcome', 'process')),

  -- Measurement
  metric_type TEXT NOT NULL DEFAULT 'percentage'
    CHECK (metric_type IN ('percentage', 'count', 'time', 'score', 'boolean', 'currency')),
  target_value TEXT NOT NULL, -- ">85%", "<24 hours", "≥4.5/5"
  current_baseline TEXT,
  unit TEXT, -- "%", "hours", "score", "$"

  -- Measurement Details
  measurement_method TEXT,
  measurement_frequency TEXT DEFAULT 'monthly'
    CHECK (measurement_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
  data_source TEXT,

  -- Ownership
  owner_role_id UUID REFERENCES org_roles(id),
  owner_title TEXT,

  -- Ordering
  sequence_order INTEGER DEFAULT 1,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(jtbd_id, criterion)
);

CREATE INDEX idx_jtbd_success_criteria_jtbd ON jtbd_success_criteria(jtbd_id);
CREATE INDEX idx_jtbd_success_criteria_tenant ON jtbd_success_criteria(tenant_id);
CREATE INDEX idx_jtbd_success_criteria_type ON jtbd_success_criteria(metric_type);

COMMENT ON TABLE jtbd_success_criteria IS
  'Defines measurable success criteria for job execution. Criteria establish targets against which automation effectiveness can be measured.';
```

---

## 4. Strategic Pillars Reconciliation

### 4.1 Current Gold Standard (JTBD_GOLD_STANDARD_L3_SCHEMA.md)

```
SP01: Scientific Excellence
SP02: Operational Efficiency
SP03: Regulatory Compliance
SP04: Stakeholder Engagement
SP05: Data-Driven Decision Making
SP06: Innovation & Agility
SP07: Patient-Centricity
```

### 4.2 New Schema Reference v1.0

```
SP01: Growth & Market Access
SP02: Scientific Excellence
SP03: Stakeholder Engagement
SP04: Compliance & Quality
SP05: Operational Excellence
SP06: Talent Development
SP07: Innovation & Digital
```

### 4.3 Recommended Reconciliation

| Code | Recommended Name | Rationale |
|------|------------------|-----------|
| SP01 | Growth & Market Access | Business-aligned (new) |
| SP02 | Scientific Excellence | Core pharma pillar (both) |
| SP03 | Stakeholder Engagement | KOL/HCP focus (both) |
| SP04 | Compliance & Quality | Regulatory + QA (combined) |
| SP05 | Operational Excellence | Process efficiency (new naming) |
| SP06 | Talent Development | People focus (new) |
| SP07 | Innovation & Digital | Technology focus (new) |
| SP08 | Patient-Centricity | **ADD** (missing from new, important) |
| SP09 | Data-Driven Decision Making | **ADD** (missing from new, important for AI) |

**Recommendation:** Expand to 9 pillars to cover all strategic dimensions.

---

## 5. Enum Type Alignment

### 5.1 New Enum Types to Add

```sql
-- ODI Direction Verbs
CREATE TYPE outcome_direction AS ENUM (
  'minimize', 'maximize', 'optimize', 'eliminate', 'ensure', 'reduce', 'increase'
);

-- ODI Dimension Types
CREATE TYPE odi_dimension AS ENUM (
  'speed', 'stability', 'output_quality', 'accuracy', 'cost', 'risk', 'compliance'
);

-- Opportunity Priority (5-tier)
CREATE TYPE opportunity_priority_v2 AS ENUM (
  'extreme', 'high', 'moderate', 'low', 'table_stakes'
);

-- AI Assistance Type (task-level)
CREATE TYPE ai_assistance_type AS ENUM (
  'none', 'draft', 'review', 'execute', 'full'
);

-- Enabler Type
CREATE TYPE enabler_type AS ENUM (
  'tool', 'system', 'data_source', 'process', 'skill', 'integration'
);

-- Enabler State
CREATE TYPE enabler_state AS ENUM (
  'available', 'partial', 'missing', 'planned'
);

-- Criticality Level
CREATE TYPE criticality AS ENUM (
  'required', 'important', 'nice_to_have'
);

-- Success Criterion Type
CREATE TYPE criterion_type AS ENUM (
  'input', 'output', 'outcome', 'process'
);
```

---

## 6. Validation Checklist Integration

### 6.1 Quality Thresholds (from JSON Template)

```yaml
quality_thresholds:
  min_outcomes_per_jtbd: 5
  max_outcomes_per_jtbd: 12
  min_pain_points: 3
  max_pain_points: 8
  min_success_criteria: 3
  max_success_criteria: 7
  required_workflow_phases: 2
  max_workflow_phases: 8
  required_persona_mappings: 1
```

### 6.2 Validation Function to Add

```sql
CREATE OR REPLACE FUNCTION validate_jtbd_completeness(p_jtbd_id UUID)
RETURNS TABLE (
  check_name TEXT,
  is_valid BOOLEAN,
  actual_value INTEGER,
  expected_range TEXT,
  message TEXT
) AS $$
BEGIN
  -- Check outcomes count (5-12)
  RETURN QUERY
  SELECT
    'outcomes_count'::TEXT,
    (SELECT COUNT(*) BETWEEN 5 AND 12 FROM jtbd_outcomes WHERE jtbd_id = p_jtbd_id),
    (SELECT COUNT(*)::INTEGER FROM jtbd_outcomes WHERE jtbd_id = p_jtbd_id),
    '5-12'::TEXT,
    CASE
      WHEN (SELECT COUNT(*) FROM jtbd_outcomes WHERE jtbd_id = p_jtbd_id) < 5
        THEN 'Too few outcomes (minimum 5)'
      WHEN (SELECT COUNT(*) FROM jtbd_outcomes WHERE jtbd_id = p_jtbd_id) > 12
        THEN 'Too many outcomes (maximum 12)'
      ELSE 'OK'
    END;

  -- Check pain points count (3-8)
  RETURN QUERY
  SELECT
    'pain_points_count'::TEXT,
    (SELECT COUNT(*) BETWEEN 3 AND 8 FROM jtbd_pain_points WHERE jtbd_id = p_jtbd_id),
    (SELECT COUNT(*)::INTEGER FROM jtbd_pain_points WHERE jtbd_id = p_jtbd_id),
    '3-8'::TEXT,
    CASE
      WHEN (SELECT COUNT(*) FROM jtbd_pain_points WHERE jtbd_id = p_jtbd_id) < 3
        THEN 'Too few pain points (minimum 3)'
      WHEN (SELECT COUNT(*) FROM jtbd_pain_points WHERE jtbd_id = p_jtbd_id) > 8
        THEN 'Too many pain points (maximum 8)'
      ELSE 'OK'
    END;

  -- Check success criteria count (3-7)
  RETURN QUERY
  SELECT
    'success_criteria_count'::TEXT,
    (SELECT COUNT(*) BETWEEN 3 AND 7 FROM jtbd_success_criteria WHERE jtbd_id = p_jtbd_id),
    (SELECT COUNT(*)::INTEGER FROM jtbd_success_criteria WHERE jtbd_id = p_jtbd_id),
    '3-7'::TEXT,
    CASE
      WHEN (SELECT COUNT(*) FROM jtbd_success_criteria WHERE jtbd_id = p_jtbd_id) < 3
        THEN 'Too few success criteria (minimum 3)'
      WHEN (SELECT COUNT(*) FROM jtbd_success_criteria WHERE jtbd_id = p_jtbd_id) > 7
        THEN 'Too many success criteria (maximum 7)'
      ELSE 'OK'
    END;

  -- Check has at least 1 primary persona mapping
  RETURN QUERY
  SELECT
    'primary_persona_mapping'::TEXT,
    EXISTS(SELECT 1 FROM jtbd_persona_mapping WHERE jtbd_id = p_jtbd_id AND involvement_level = 'primary'),
    (SELECT COUNT(*)::INTEGER FROM jtbd_persona_mapping WHERE jtbd_id = p_jtbd_id AND involvement_level = 'primary'),
    '≥1'::TEXT,
    CASE
      WHEN NOT EXISTS(SELECT 1 FROM jtbd_persona_mapping WHERE jtbd_id = p_jtbd_id AND involvement_level = 'primary')
        THEN 'No primary persona mapping'
      ELSE 'OK'
    END;

  -- Check has AI assessment
  RETURN QUERY
  SELECT
    'ai_assessment'::TEXT,
    EXISTS(SELECT 1 FROM jtbd_ai_assessments WHERE jtbd_id = p_jtbd_id),
    CASE WHEN EXISTS(SELECT 1 FROM jtbd_ai_assessments WHERE jtbd_id = p_jtbd_id) THEN 1 ELSE 0 END,
    '1'::TEXT,
    CASE
      WHEN NOT EXISTS(SELECT 1 FROM jtbd_ai_assessments WHERE jtbd_id = p_jtbd_id)
        THEN 'No AI assessment'
      ELSE 'OK'
    END;

  -- Check workflow phases count (2-8)
  RETURN QUERY
  SELECT
    'workflow_phases_count'::TEXT,
    (SELECT COUNT(*) BETWEEN 2 AND 8
     FROM workflow_phases wp
     JOIN jtbd_workflows jw ON wp.workflow_id = jw.id
     WHERE jw.jtbd_id = p_jtbd_id),
    (SELECT COUNT(*)::INTEGER
     FROM workflow_phases wp
     JOIN jtbd_workflows jw ON wp.workflow_id = jw.id
     WHERE jw.jtbd_id = p_jtbd_id),
    '2-8'::TEXT,
    'Workflow phases check';

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_jtbd_completeness IS
  'Validates that a JTBD record meets all quality thresholds from the Gold Standard';
```

---

## 7. Summary of Actions

### 7.1 HIGH Priority (Core Schema)

| # | Action | Files Affected |
|---|--------|----------------|
| 1 | Add `jtbd_ai_assessments` table | Migration file |
| 2 | Add `jtbd_enablers` table | Migration file |
| 3 | Add `jtbd_success_criteria` table | Migration file |
| 4 | Enhance `jtbd_outcomes` with decomposition fields | Migration file |
| 5 | Expand opportunity_priority to 5-tier | Migration file |
| 6 | Add validation function | Migration file |

### 7.2 MEDIUM Priority (Enhancements)

| # | Action | Files Affected |
|---|--------|----------------|
| 7 | Add new columns to `jtbd` core table | Migration file |
| 8 | Reconcile strategic pillars (expand to 9) | Seed data |
| 9 | Add new enum types | Migration file |
| 10 | Create comprehensive view combining all tables | View file |

### 7.3 LOW Priority (Documentation)

| # | Action | Files Affected |
|---|--------|----------------|
| 11 | Update Gold Standard Quick Reference | GOLD_STANDARD_QUICK_REFERENCE.md |
| 12 | Update main schema documentation | JTBD_GOLD_STANDARD_L3_SCHEMA.md |
| 13 | Create data population order guide | New file |

---

## 8. Data Population Order (from Schema Ref v1.0)

```
Phase 1: Foundation (Reference Tables)
  └── tenants, users, strategic_pillars, departments, org_roles, personas

Phase 2: Evidence Library
  └── evidence_sources

Phase 3: JTBD Core
  └── jtbd

Phase 4: JTBD Details (Parallel)
  ├── jtbd_outcomes
  ├── jtbd_pain_points
  ├── jtbd_success_criteria
  ├── jtbd_enablers
  └── jtbd_kpis

Phase 5: Workflows (Sequential)
  └── jtbd_workflows → workflow_phases → workflow_tasks

Phase 6: Mappings
  ├── jtbd_persona_mappings
  └── jtbd_service_mappings

Phase 7: Assessments (Final)
  ├── jtbd_ai_assessments
  └── jtbd_evidence_links
```

---

## Next Steps

1. **Create migration file** with all HIGH priority changes
2. **Update seed data** for strategic pillars
3. **Run validation** on existing JTBDs
4. **Update documentation**

---

## 9. Project vs BAU Schema Extensions (NEW)

**Source**: `VITAL_JTBD_Project_vs_BAU_Schema.md` (v2.0.0)

This document introduces a **comprehensive dual-axis work classification system** with dedicated extension tables for Project and BAU work patterns.

### 9.1 New Tables to Add

#### 9.1.1 Project-Specific Extension Tables

```sql
-- ================================================================
-- PROJECT METADATA (1:1 with jtbd WHERE work_pattern IN ('project', 'mixed'))
-- ================================================================
CREATE TABLE IF NOT EXISTS jtbd_project_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL UNIQUE REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Timeline
  estimated_duration_weeks INTEGER,
  typical_start_trigger TEXT,
  typical_end_state TEXT,

  -- Scope
  cross_functional BOOLEAN DEFAULT true,
  typical_team_size VARCHAR(50), -- "3-5", "5-10", "10-20", "20+"

  -- Governance
  governance_model TEXT DEFAULT 'standard'
    CHECK (governance_model IN ('agile', 'waterfall', 'hybrid', 'standard', 'light')),
  typical_sponsor_level TEXT
    CHECK (typical_sponsor_level IN ('c_suite', 'vp', 'director', 'manager')),
  steering_committee_required BOOLEAN DEFAULT false,

  -- Handover to BAU (KEY INNOVATION)
  bau_handover_required BOOLEAN DEFAULT true,
  handover_jtbd_ids UUID[], -- Links to BAU JTBDs that receive project outputs

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jtbd_project_metadata_jtbd ON jtbd_project_metadata(jtbd_id);
CREATE INDEX idx_jtbd_project_metadata_governance ON jtbd_project_metadata(governance_model);

COMMENT ON TABLE jtbd_project_metadata IS
  'Extended attributes for project-type JTBDs including governance, timeline, and BAU handover tracking';

-- ================================================================
-- PROJECT DELIVERABLES (per phase)
-- ================================================================
CREATE TABLE IF NOT EXISTS jtbd_project_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES jtbd_project_phases(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Deliverable Details
  deliverable_name VARCHAR(255) NOT NULL,
  deliverable_type TEXT NOT NULL
    CHECK (deliverable_type IN ('document', 'presentation', 'data', 'system', 'process', 'approval')),
  description TEXT,

  -- Templates
  template_available BOOLEAN DEFAULT false,
  template_id UUID, -- References templates table if available

  -- AI Potential
  ai_generation_potential TEXT DEFAULT 'partial'
    CHECK (ai_generation_potential IN ('none', 'partial', 'significant', 'full')),
  compliance_required BOOLEAN DEFAULT false,

  -- Ordering
  sequence_order INTEGER DEFAULT 1,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jtbd_project_deliverables_phase ON jtbd_project_deliverables(phase_id);
CREATE INDEX idx_jtbd_project_deliverables_type ON jtbd_project_deliverables(deliverable_type);

COMMENT ON TABLE jtbd_project_deliverables IS
  'Standard deliverables for project phases enabling template-based setup and AI-assisted generation';
```

#### 9.1.2 BAU-Specific Extension Tables

```sql
-- ================================================================
-- BAU METADATA (1:1 with jtbd WHERE work_pattern IN ('bau', 'mixed'))
-- ================================================================
CREATE TABLE IF NOT EXISTS jtbd_bau_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL UNIQUE REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Cadence
  operational_cadence TEXT NOT NULL
    CHECK (operational_cadence IN ('continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'event_driven')),
  cycle_day VARCHAR(50), -- "Monday", "15th", "Month-end"
  cycle_time TIME,

  -- Volume
  typical_volume_per_cycle INTEGER,
  volume_unit VARCHAR(50), -- "requests", "transactions", "reports", "cases"
  volume_variability TEXT DEFAULT 'medium'
    CHECK (volume_variability IN ('low', 'medium', 'high', 'very_high')),

  -- SLA
  sla_target VARCHAR(100), -- "< 24 hours", "Same day"
  sla_metric VARCHAR(100), -- "Response time", "Resolution time"
  sla_threshold_warning NUMERIC(5,2), -- % of target
  sla_threshold_critical NUMERIC(5,2),

  -- Process
  process_standardization TEXT DEFAULT 'standardized'
    CHECK (process_standardization IN ('highly_standardized', 'standardized', 'semi_standardized', 'variable')),
  sop_reference TEXT,
  escalation_path TEXT[],

  -- Automation
  current_automation_level TEXT DEFAULT 'manual'
    CHECK (current_automation_level IN ('manual', 'semi_automated', 'mostly_automated', 'fully_automated')),
  automation_target TEXT
    CHECK (automation_target IN ('manual', 'semi_automated', 'mostly_automated', 'fully_automated')),

  -- KPIs
  primary_kpi VARCHAR(100),
  secondary_kpis TEXT[],

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jtbd_bau_metadata_jtbd ON jtbd_bau_metadata(jtbd_id);
CREATE INDEX idx_jtbd_bau_metadata_cadence ON jtbd_bau_metadata(operational_cadence);
CREATE INDEX idx_jtbd_bau_metadata_automation ON jtbd_bau_metadata(current_automation_level);

COMMENT ON TABLE jtbd_bau_metadata IS
  'Extended attributes for BAU-type JTBDs including cadence, SLA, volume, and automation tracking';

-- ================================================================
-- BAU CYCLE ACTIVITIES (process steps within a BAU cycle)
-- ================================================================
CREATE TABLE IF NOT EXISTS jtbd_bau_cycle_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Activity Details
  activity_name VARCHAR(255) NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL
    CHECK (activity_type IN ('receive', 'triage', 'process', 'validate', 'approve', 'escalate', 'document', 'report')),

  -- Sequencing
  sequence_order INTEGER NOT NULL,
  typical_duration_minutes INTEGER,

  -- AI/Automation
  automation_score INTEGER CHECK (automation_score BETWEEN 0 AND 100),
  ai_assistance_type TEXT DEFAULT 'none'
    CHECK (ai_assistance_type IN ('none', 'draft', 'review', 'execute', 'full')),

  -- Context
  systems_used TEXT[],
  owner_role VARCHAR(100),
  handoff_required BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jtbd_bau_cycle_activities_jtbd ON jtbd_bau_cycle_activities(jtbd_id);
CREATE INDEX idx_jtbd_bau_cycle_activities_type ON jtbd_bau_cycle_activities(activity_type);
CREATE INDEX idx_jtbd_bau_cycle_activities_score ON jtbd_bau_cycle_activities(automation_score DESC);

COMMENT ON TABLE jtbd_bau_cycle_activities IS
  'Defines activities within BAU operational cycles for process mapping and automation identification';

-- ================================================================
-- BAU SLA HISTORY (Performance tracking over time)
-- ================================================================
CREATE TABLE IF NOT EXISTS jtbd_bau_sla_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Metrics
  volume_processed INTEGER,
  sla_met_count INTEGER,
  sla_met_percentage NUMERIC(5,2),
  average_cycle_time_minutes NUMERIC(10,2),
  error_rate_percentage NUMERIC(5,2),
  automation_percentage NUMERIC(5,2), -- % processed with AI/automation

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(jtbd_id, period_start, period_end)
);

CREATE INDEX idx_jtbd_bau_sla_history_jtbd ON jtbd_bau_sla_history(jtbd_id);
CREATE INDEX idx_jtbd_bau_sla_history_period ON jtbd_bau_sla_history(period_start, period_end);

COMMENT ON TABLE jtbd_bau_sla_history IS
  'Historical SLA performance tracking for BAU JTBDs to identify trends and automation impact';
```

### 9.2 AI Assessment Enhancements

Add these fields to `jtbd_ai_assessments`:

```sql
-- Add ROI dual-scoring for investment optimization
ALTER TABLE jtbd_ai_assessments ADD COLUMN IF NOT EXISTS
  recommended_focus TEXT DEFAULT 'mixed'
  CHECK (recommended_focus IN ('automation', 'augmentation', 'mixed'));

ALTER TABLE jtbd_ai_assessments ADD COLUMN IF NOT EXISTS
  automation_roi_score INTEGER CHECK (automation_roi_score BETWEEN 0 AND 100);

ALTER TABLE jtbd_ai_assessments ADD COLUMN IF NOT EXISTS
  augmentation_roi_score INTEGER CHECK (augmentation_roi_score BETWEEN 0 AND 100);

COMMENT ON COLUMN jtbd_ai_assessments.recommended_focus IS
  'Primary AI investment focus: automation (BAU), augmentation (Project), or mixed';

COMMENT ON COLUMN jtbd_ai_assessments.automation_roi_score IS
  'ROI potential for automation (higher for BAU work with high volume/standardization)';

COMMENT ON COLUMN jtbd_ai_assessments.augmentation_roi_score IS
  'ROI potential for augmentation (higher for Project work with high complexity/impact)';
```

### 9.3 Service Layer Routing Function

```sql
CREATE OR REPLACE FUNCTION determine_service_layer(
  p_work_pattern TEXT,
  p_archetype TEXT,
  p_complexity TEXT,
  p_compliance TEXT
) RETURNS TEXT AS $$
BEGIN
  -- High compliance always requires HITL workflow
  IF p_compliance IN ('high', 'critical') THEN
    RETURN 'L3_workflow';
  END IF;

  -- Archetype-driven routing
  CASE p_archetype
    WHEN 'automator' THEN
      IF p_work_pattern = 'bau' THEN RETURN 'L3_workflow';
      ELSE RETURN 'L1_expert';
      END IF;
    WHEN 'orchestrator' THEN
      IF p_complexity IN ('high', 'very_high') THEN RETURN 'L4_solution';
      ELSE RETURN 'L2_panel';
      END IF;
    WHEN 'learner' THEN
      RETURN 'L3_workflow'; -- Always guided workflow
    WHEN 'skeptic' THEN
      RETURN 'L2_panel'; -- Always multi-perspective
  END CASE;

  -- Default fallback
  RETURN 'L1_expert';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION determine_service_layer IS
  'Determines optimal AI service layer based on work pattern, archetype, complexity, and compliance';
```

### 9.4 New ENUMs to Add

```sql
-- Project Governance Model
CREATE TYPE project_governance AS ENUM (
  'agile', 'waterfall', 'hybrid', 'standard', 'light'
);

-- BAU Activity Types (process mapping)
CREATE TYPE bau_activity_type AS ENUM (
  'receive', 'triage', 'process', 'validate', 'approve', 'escalate', 'document', 'report'
);

-- Deliverable Types
CREATE TYPE deliverable_type AS ENUM (
  'document', 'presentation', 'data', 'system', 'process', 'approval'
);

-- Process Standardization Levels
CREATE TYPE standardization_level AS ENUM (
  'highly_standardized', 'standardized', 'semi_standardized', 'variable'
);

-- Automation Levels
CREATE TYPE automation_level AS ENUM (
  'manual', 'semi_automated', 'mostly_automated', 'fully_automated'
);

-- Volume/Pattern Variability
CREATE TYPE variability_level AS ENUM (
  'low', 'medium', 'high', 'very_high'
);

-- AI Investment Focus
CREATE TYPE ai_focus AS ENUM (
  'automation', 'augmentation', 'mixed'
);

-- Seniority Levels (for sponsor tracking)
CREATE TYPE seniority_level AS ENUM (
  'c_suite', 'vp', 'director', 'manager', 'senior_ic', 'ic'
);
```

### 9.5 Persona Work Mix View

```sql
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
    SUM(CASE WHEN work_pattern = 'mixed' THEN weighted_allocation * 0.5 ELSE 0 END) AS mixed_bau_allocation
  FROM jtbd_weights
  GROUP BY persona_id
)
SELECT
  persona_id,
  ROUND((project_allocation + mixed_project_allocation) / NULLIF(total_weighted_allocation, 0), 2) AS project_work_ratio,
  ROUND((bau_allocation + mixed_bau_allocation) / NULLIF(total_weighted_allocation, 0), 2) AS bau_work_ratio,
  total_weighted_allocation,

  -- Derived archetype (uses existing infer_persona_archetype function)
  CASE
    WHEN (project_allocation + mixed_project_allocation) / NULLIF(total_weighted_allocation, 0) >= 0.5
      THEN 'project_heavy'
    ELSE 'bau_heavy'
  END AS work_dominance

FROM persona_totals;

COMMENT ON VIEW v_persona_work_mix IS
  'Computes persona work pattern ratios from JTBD mappings for archetype derivation';
```

### 9.6 Validation Rules by Work Pattern

```sql
-- Project-specific validation
CREATE OR REPLACE FUNCTION validate_project_jtbd(p_jtbd_id UUID)
RETURNS TABLE (
  check_name TEXT,
  is_valid BOOLEAN,
  message TEXT
) AS $$
BEGIN
  -- Check project metadata exists
  RETURN QUERY
  SELECT
    'project_metadata_exists'::TEXT,
    EXISTS(SELECT 1 FROM jtbd_project_metadata WHERE jtbd_id = p_jtbd_id),
    'Project JTBD should have project metadata record'::TEXT;

  -- Check has at least 3 phases
  RETURN QUERY
  SELECT
    'min_phases'::TEXT,
    (SELECT COUNT(*) >= 3 FROM jtbd_project_phases WHERE jtbd_id = p_jtbd_id),
    'Project JTBD should have at least 3 phases defined'::TEXT;

  -- Check effort percentages sum to ~100%
  RETURN QUERY
  SELECT
    'effort_percentage_sum'::TEXT,
    (SELECT ABS(SUM(effort_percentage) - 100) < 5 FROM jtbd_project_phases WHERE jtbd_id = p_jtbd_id),
    'Phase effort percentages should sum to approximately 100%'::TEXT;

END;
$$ LANGUAGE plpgsql;

-- BAU-specific validation
CREATE OR REPLACE FUNCTION validate_bau_jtbd(p_jtbd_id UUID)
RETURNS TABLE (
  check_name TEXT,
  is_valid BOOLEAN,
  message TEXT
) AS $$
BEGIN
  -- Check BAU metadata exists
  RETURN QUERY
  SELECT
    'bau_metadata_exists'::TEXT,
    EXISTS(SELECT 1 FROM jtbd_bau_metadata WHERE jtbd_id = p_jtbd_id),
    'BAU JTBD should have BAU metadata record'::TEXT;

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

END;
$$ LANGUAGE plpgsql;
```

### 9.7 Summary: NEW Tables from Project vs BAU Schema

| Table | Type | Purpose | Priority |
|-------|------|---------|----------|
| `jtbd_project_metadata` | 1:1 Extension | Project governance, timeline, BAU handover | **HIGH** |
| `jtbd_project_deliverables` | 1:N | Phase deliverables with AI generation potential | **MEDIUM** |
| `jtbd_bau_metadata` | 1:1 Extension | Cadence, SLA, volume, automation tracking | **HIGH** |
| `jtbd_bau_cycle_activities` | 1:N | Process steps for automation mapping | **HIGH** |
| `jtbd_bau_sla_history` | 1:N | Historical performance tracking | **MEDIUM** |

---

## 10. Consolidated Action Plan

### 10.1 HIGH Priority Tables (7 tables)

| # | Table | Source | Purpose |
|---|-------|--------|---------|
| 1 | `jtbd_ai_assessments` | Schema Ref v1.0 | 1:1 comprehensive AI assessment |
| 2 | `jtbd_enablers` | Schema Ref v1.0 | Required resources for execution |
| 3 | `jtbd_success_criteria` | Schema Ref v1.0 | Measurable success metrics |
| 4 | `jtbd_project_metadata` | Project vs BAU | Project governance & handover |
| 5 | `jtbd_bau_metadata` | Project vs BAU | Cadence, SLA, automation |
| 6 | `jtbd_bau_cycle_activities` | Project vs BAU | Process step mapping |
| 7 | `jtbd_project_phases` enhancements | Project vs BAU | Additional phase attributes |

### 10.2 MEDIUM Priority Tables (2 tables)

| # | Table | Source | Purpose |
|---|-------|--------|---------|
| 8 | `jtbd_project_deliverables` | Project vs BAU | Phase deliverables |
| 9 | `jtbd_bau_sla_history` | Project vs BAU | Performance tracking |

### 10.3 Schema Enhancements

| # | Enhancement | Source | Scope |
|---|-------------|--------|-------|
| 1 | ODI outcome decomposition | Schema Ref v1.0 | Add direction/object/dimension |
| 2 | 5-tier opportunity priority | Schema Ref v1.0 | Expand from 3-tier |
| 3 | AI Assessment ROI fields | Project vs BAU | automation/augmentation ROI |
| 4 | Persona work mix fields | Project vs BAU | time_allocation, effort_weight |
| 5 | Service layer routing function | Project vs BAU | determine_service_layer() |

### 10.4 New ENUMs (12 types)

From Schema Ref v1.0:
- `outcome_direction`, `odi_dimension`, `opportunity_priority_v2`
- `enabler_type`, `enabler_state`, `criticality`, `criterion_type`

From Project vs BAU:
- `project_governance`, `bau_activity_type`, `deliverable_type`
- `standardization_level`, `automation_level`, `variability_level`
- `ai_focus`, `seniority_level`

---

## 11. Complete Schema v3 Additions (FINAL)

**Source**: `VITAL_JTBD_Complete_Schema_v3.md` (v3.0.0 - Production-Ready)

This is the **authoritative master document** providing complete strategy-to-execution alignment through OKRs, JTBDs, ODI, Work Patterns, and AI Opportunities.

### 11.1 Strategic Framework Integration

#### NEW: `strategic_themes` Table

```sql
-- ================================================================
-- STRATEGIC THEMES (3-5 year transformation themes)
-- ================================================================
CREATE TABLE IF NOT EXISTS strategic_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Identity
  code VARCHAR(20) NOT NULL UNIQUE,       -- "THEME-01"
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Timeframe
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('planned', 'active', 'completed', 'deprecated')),

  -- Hierarchy (themes contain pillars)
  parent_theme_id UUID REFERENCES strategic_themes(id),

  -- Metrics
  success_metrics JSONB, -- For flexibility during theme definition
  progress_percentage NUMERIC(5,2) DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_strategic_themes_tenant ON strategic_themes(tenant_id);
CREATE INDEX idx_strategic_themes_status ON strategic_themes(status);
CREATE INDEX idx_strategic_themes_years ON strategic_themes(start_year, end_year);

COMMENT ON TABLE strategic_themes IS
  '3-5 year transformation themes that group strategic pillars. Provides highest-level strategic context for all downstream OKRs and JTBDs.';
```

#### ENHANCED: `strategic_pillars` Table

```sql
-- Add theme linkage to pillars
ALTER TABLE strategic_pillars ADD COLUMN IF NOT EXISTS
  theme_id UUID REFERENCES strategic_themes(id);

ALTER TABLE strategic_pillars ADD COLUMN IF NOT EXISTS
  pillar_status TEXT DEFAULT 'active'
  CHECK (pillar_status IN ('active', 'sunset', 'future'));

ALTER TABLE strategic_pillars ADD COLUMN IF NOT EXISTS
  owner_persona_id UUID REFERENCES personas(id);

ALTER TABLE strategic_pillars ADD COLUMN IF NOT EXISTS
  target_okr_count INTEGER DEFAULT 5; -- Expected OKRs per pillar

COMMENT ON COLUMN strategic_pillars.theme_id IS
  'Links pillar to parent strategic theme (3-5 year horizon)';
```

### 11.2 OKR Schema Enhancements

#### NEW: `key_result_update` Table (Historical Tracking)

```sql
-- ================================================================
-- KEY RESULT UPDATES (Historical progress tracking)
-- ================================================================
CREATE TABLE IF NOT EXISTS key_result_update (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_result_id UUID NOT NULL REFERENCES key_result(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Progress Snapshot
  update_date DATE NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC,
  progress_percentage NUMERIC(5,2),

  -- Context
  update_source TEXT, -- "manual", "automated", "system"
  notes TEXT,
  confidence_level NUMERIC(3,2) CHECK (confidence_level BETWEEN 0 AND 1),

  -- Risk Indicators
  blockers TEXT[],
  risks TEXT[],

  -- Attribution
  updated_by UUID REFERENCES users(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_key_result_update_kr ON key_result_update(key_result_id);
CREATE INDEX idx_key_result_update_date ON key_result_update(update_date DESC);
CREATE INDEX idx_key_result_update_tenant ON key_result_update(tenant_id);

COMMENT ON TABLE key_result_update IS
  'Historical tracking of Key Result progress over time. Enables trend analysis and automated health status calculation.';
```

#### NEW: `okr_key_result_outcome_mapping` Junction Table

```sql
-- ================================================================
-- KR TO ODI OUTCOME MAPPING (Measurement Linkage)
-- ================================================================
CREATE TABLE IF NOT EXISTS okr_key_result_outcome_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_result_id UUID NOT NULL REFERENCES key_result(id) ON DELETE CASCADE,
  outcome_id UUID NOT NULL REFERENCES jtbd_outcomes(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Relationship Type
  measurement_relationship TEXT NOT NULL DEFAULT 'measures'
    CHECK (measurement_relationship IN ('measures', 'indicates', 'correlates')),

  -- Weight
  contribution_weight NUMERIC(3,2) DEFAULT 1.0
    CHECK (contribution_weight BETWEEN 0 AND 1),

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(key_result_id, outcome_id)
);

CREATE INDEX idx_kr_outcome_mapping_kr ON okr_key_result_outcome_mapping(key_result_id);
CREATE INDEX idx_kr_outcome_mapping_outcome ON okr_key_result_outcome_mapping(outcome_id);

COMMENT ON TABLE okr_key_result_outcome_mapping IS
  'Links Key Results to ODI Outcomes for measurement alignment. Enables tracking KR progress through ODI satisfaction improvements.';
```

### 11.3 Enhanced JTBD Table Fields (OKR Alignment)

```sql
-- ================================================================
-- JTBD OKR ALIGNMENT FIELDS (Denormalized for Performance)
-- ================================================================
ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  active_okr_count INTEGER DEFAULT 0;
COMMENT ON COLUMN jtbd.active_okr_count IS
  'Denormalized count of active OKRs this JTBD aligns to. Updated by trigger on okr_jtbd_mapping.';

ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  okr_alignment_score NUMERIC(3,2);
COMMENT ON COLUMN jtbd.okr_alignment_score IS
  'Weighted alignment score to active OKRs (0.00-1.00). Higher = more strategic.';

ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  strategic_priority TEXT DEFAULT 'standard'
  CHECK (strategic_priority IN ('critical', 'high', 'standard', 'low', 'deferred'));
COMMENT ON COLUMN jtbd.strategic_priority IS
  'Computed from OKR alignment. critical (≥3 OKRs, ≥0.8 score), high, standard, low, deferred.';

-- Add trigger to maintain denormalized fields
CREATE OR REPLACE FUNCTION update_jtbd_okr_alignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the affected JTBD's OKR alignment metrics
  PERFORM pg_notify('update_jtbd_alignment', COALESCE(NEW.jtbd_id, OLD.jtbd_id)::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_jtbd_okr_alignment
AFTER INSERT OR UPDATE OR DELETE ON okr_jtbd_mapping
FOR EACH ROW EXECUTE FUNCTION update_jtbd_okr_alignment();
```

### 11.4 Enhanced AI Assessment Fields (OKR Acceleration)

```sql
-- ================================================================
-- AI ASSESSMENT OKR ACCELERATION FIELDS
-- ================================================================
ALTER TABLE jtbd_ai_assessments ADD COLUMN IF NOT EXISTS
  okr_acceleration_score INTEGER CHECK (okr_acceleration_score BETWEEN 0 AND 100);
COMMENT ON COLUMN jtbd_ai_assessments.okr_acceleration_score IS
  'How much this AI opportunity accelerates active OKRs (0-100). Based on alignment and impact.';

ALTER TABLE jtbd_ai_assessments ADD COLUMN IF NOT EXISTS
  strategic_alignment_score INTEGER CHECK (strategic_alignment_score BETWEEN 0 AND 100);
COMMENT ON COLUMN jtbd_ai_assessments.strategic_alignment_score IS
  'Alignment to strategic pillars and themes (0-100).';

ALTER TABLE jtbd_ai_assessments ADD COLUMN IF NOT EXISTS
  prioritization_score INTEGER CHECK (prioritization_score BETWEEN 0 AND 100);
COMMENT ON COLUMN jtbd_ai_assessments.prioritization_score IS
  'Composite score: (automation_score * 0.4) + (okr_acceleration_score * 0.4) + (strategic_alignment_score * 0.2)';

-- Computed prioritization score trigger
CREATE OR REPLACE FUNCTION calculate_ai_prioritization_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.prioritization_score := ROUND(
    (COALESCE(NEW.automation_score, 0) * 0.4) +
    (COALESCE(NEW.okr_acceleration_score, 0) * 0.4) +
    (COALESCE(NEW.strategic_alignment_score, 0) * 0.2)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ai_prioritization_score
BEFORE INSERT OR UPDATE ON jtbd_ai_assessments
FOR EACH ROW EXECUTE FUNCTION calculate_ai_prioritization_score();
```

### 11.5 Enhanced Persona Work Mix Attributes

```sql
-- ================================================================
-- PERSONA OKR & WORK MIX ATTRIBUTES
-- ================================================================
ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  owned_okr_count INTEGER DEFAULT 0;

ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  contributed_okr_count INTEGER DEFAULT 0;

ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  project_work_ratio NUMERIC(3,2) CHECK (project_work_ratio BETWEEN 0 AND 1);

ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  bau_work_ratio NUMERIC(3,2) CHECK (bau_work_ratio BETWEEN 0 AND 1);

ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  work_complexity_score NUMERIC(3,2) CHECK (work_complexity_score BETWEEN 0 AND 1);

ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  ai_readiness_score NUMERIC(3,2) CHECK (ai_readiness_score BETWEEN 0 AND 1);

ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  derived_archetype TEXT
  CHECK (derived_archetype IN ('automator', 'orchestrator', 'learner', 'skeptic'));
COMMENT ON COLUMN personas.derived_archetype IS
  'Auto-computed from 2x2 matrix: work_complexity (low/high) × ai_readiness (low/high).';
```

### 11.6 Key Views from Complete Schema v3

```sql
-- ================================================================
-- v_okr_progress: Calculate OKR progress from Key Results
-- ================================================================
CREATE OR REPLACE VIEW v_okr_progress AS
SELECT
  o.id AS okr_id,
  o.code AS okr_code,
  o.objective,
  o.timeframe,
  o.status,
  COUNT(kr.id) AS key_result_count,
  ROUND(SUM(kr.progress_percentage * kr.weight) / NULLIF(SUM(kr.weight), 0), 2) AS weighted_progress,
  ROUND(AVG(kr.confidence_level), 2) AS avg_confidence,
  CASE
    WHEN AVG(kr.progress_percentage) >= 70 THEN 'green'
    WHEN AVG(kr.progress_percentage) >= 40 THEN 'yellow'
    ELSE 'red'
  END AS health_status
FROM okr o
LEFT JOIN key_result kr ON o.id = kr.okr_id
GROUP BY o.id, o.code, o.objective, o.timeframe, o.status;

-- ================================================================
-- v_jtbd_okr_alignment: Show JTBD alignment to active OKRs
-- ================================================================
CREATE OR REPLACE VIEW v_jtbd_okr_alignment AS
SELECT
  j.id AS jtbd_id,
  j.code,
  j.name,
  j.work_pattern,
  j.jtbd_type,
  COUNT(DISTINCT m.okr_id) AS aligned_okr_count,
  STRING_AGG(DISTINCT o.objective, '; ') AS aligned_objectives,
  ROUND(AVG(m.contribution_weight), 2) AS avg_contribution_weight,
  CASE
    WHEN COUNT(DISTINCT m.okr_id) >= 3 THEN 'critical'
    WHEN COUNT(DISTINCT m.okr_id) >= 2 THEN 'high'
    WHEN COUNT(DISTINCT m.okr_id) >= 1 THEN 'standard'
    ELSE 'low'
  END AS computed_priority
FROM jtbd j
LEFT JOIN okr_jtbd_mapping m ON j.id = m.jtbd_id
LEFT JOIN okr o ON m.okr_id = o.id AND o.status = 'active'
WHERE j.status = 'active'
GROUP BY j.id, j.code, j.name, j.work_pattern, j.jtbd_type;

-- ================================================================
-- v_ai_opportunity_ranking: Rank by OKR alignment + automation
-- ================================================================
CREATE OR REPLACE VIEW v_ai_opportunity_ranking AS
SELECT
  a.id AS assessment_id,
  j.code AS jtbd_code,
  j.name AS jtbd_name,
  j.work_pattern,
  a.automation_score,
  a.recommended_focus,
  COUNT(DISTINCT m.okr_id) AS aligned_okr_count,
  COALESCE(a.okr_acceleration_score, 0) AS okr_acceleration_score,
  a.estimated_annual_value_usd,
  a.prioritization_score,
  RANK() OVER (ORDER BY a.prioritization_score DESC) AS priority_rank
FROM jtbd_ai_assessments a
JOIN jtbd j ON a.jtbd_id = j.id
LEFT JOIN okr_ai_opportunity_mapping m ON a.id = m.ai_assessment_id
WHERE j.status = 'active'
GROUP BY a.id, j.code, j.name, j.work_pattern, a.automation_score,
         a.recommended_focus, a.okr_acceleration_score,
         a.estimated_annual_value_usd, a.prioritization_score
ORDER BY a.prioritization_score DESC;

-- ================================================================
-- v_strategic_cascade: Full strategic cascade from pillars to JTBDs
-- ================================================================
CREATE OR REPLACE VIEW v_strategic_cascade AS
SELECT
  sp.code AS pillar_code,
  sp.name AS pillar_name,
  o.code AS okr_code,
  o.objective,
  o.timeframe,
  o.status AS okr_status,
  j.code AS jtbd_code,
  j.name AS jtbd_name,
  j.work_pattern,
  j.strategic_priority,
  m.alignment_type,
  m.contribution_weight
FROM strategic_pillars sp
LEFT JOIN okr o ON sp.id = o.strategic_pillar_id
LEFT JOIN okr_jtbd_mapping m ON o.id = m.okr_id
LEFT JOIN jtbd j ON m.jtbd_id = j.id
ORDER BY sp.sequence_order, o.timeframe, j.strategic_priority;
```

### 11.7 Archetype Derivation Function

```sql
-- ================================================================
-- ARCHETYPE DERIVATION FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION derive_persona_archetype(
  p_persona_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_work_complexity NUMERIC;
  v_ai_readiness NUMERIC;
BEGIN
  -- Get scores from persona
  SELECT
    COALESCE(work_complexity_score, 0.5),
    COALESCE(ai_readiness_score, 0.5)
  INTO v_work_complexity, v_ai_readiness
  FROM personas
  WHERE id = p_persona_id;

  -- 2x2 Matrix Logic
  IF v_work_complexity < 0.5 AND v_ai_readiness >= 0.5 THEN
    RETURN 'automator';    -- Low complexity, High AI readiness
  ELSIF v_work_complexity >= 0.5 AND v_ai_readiness >= 0.5 THEN
    RETURN 'orchestrator'; -- High complexity, High AI readiness
  ELSIF v_work_complexity < 0.5 AND v_ai_readiness < 0.5 THEN
    RETURN 'learner';      -- Low complexity, Low AI readiness
  ELSE
    RETURN 'skeptic';      -- High complexity, Low AI readiness
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION derive_persona_archetype IS
  'Derives persona archetype from 2x2 matrix: work_complexity × ai_readiness';
```

### 11.8 Additional ENUMs from Complete Schema v3

```sql
-- Strategic ENUMs
CREATE TYPE IF NOT EXISTS theme_status AS ENUM ('planned', 'active', 'completed', 'deprecated');
CREATE TYPE IF NOT EXISTS pillar_status AS ENUM ('active', 'sunset', 'future');

-- OKR ENUMs
CREATE TYPE IF NOT EXISTS objective_type AS ENUM ('committed', 'aspirational', 'learning');
CREATE TYPE IF NOT EXISTS timeframe_type AS ENUM ('quarterly', 'semi_annual', 'annual', 'custom');
CREATE TYPE IF NOT EXISTS okr_level AS ENUM ('company', 'functional', 'team', 'individual');
CREATE TYPE IF NOT EXISTS okr_status AS ENUM ('draft', 'active', 'at_risk', 'on_track', 'completed', 'cancelled');
CREATE TYPE IF NOT EXISTS health_status AS ENUM ('green', 'yellow', 'red');
CREATE TYPE IF NOT EXISTS kr_status AS ENUM ('not_started', 'on_track', 'at_risk', 'behind', 'achieved', 'missed');
CREATE TYPE IF NOT EXISTS metric_direction AS ENUM ('increase', 'decrease', 'maintain', 'achieve');
CREATE TYPE IF NOT EXISTS measurement_frequency AS ENUM ('daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly');
CREATE TYPE IF NOT EXISTS alignment_type AS ENUM ('direct', 'supporting', 'indirect');
CREATE TYPE IF NOT EXISTS measurement_relationship AS ENUM ('measures', 'indicates', 'correlates');
CREATE TYPE IF NOT EXISTS acceleration_potential AS ENUM ('critical', 'high', 'moderate', 'low');

-- JTBD ENUMs (additions)
CREATE TYPE IF NOT EXISTS strategic_priority AS ENUM ('critical', 'high', 'standard', 'low', 'deferred');
CREATE TYPE IF NOT EXISTS metric_type AS ENUM ('percentage', 'count', 'score', 'currency', 'time', 'boolean', 'ratio');

-- Persona ENUMs
CREATE TYPE IF NOT EXISTS archetype AS ENUM ('automator', 'orchestrator', 'learner', 'skeptic');
CREATE TYPE IF NOT EXISTS involvement_level AS ENUM ('primary', 'secondary', 'consulted', 'informed');

-- AI ENUMs
CREATE TYPE IF NOT EXISTS automation_potential AS ENUM ('none', 'partial', 'significant', 'full');
CREATE TYPE IF NOT EXISTS confidence_level AS ENUM ('low', 'medium', 'high');
```

### 11.9 Complete Strategic Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE STRATEGIC ALIGNMENT FLOW                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STRATEGY                                                                   │
│  ├── Vision (5-10 years)                                                   │
│  ├── Strategic Themes (3-5 years) ← NEW TABLE                              │
│  └── Strategic Pillars (SP01-SP09) ← EXPANDED to 9                         │
│       │                                                                     │
│       ▼                                                                     │
│  OKRs (Quarterly/Annual)                                                   │
│  ├── Company OKRs (level: company)                                         │
│  ├── Functional OKRs (level: functional) ← Owned by VP/Director            │
│  └── Team OKRs (level: team)                                               │
│       │                                                                     │
│       ├── key_result → key_result_update (historical tracking)             │
│       │                                                                     │
│       ▼                                                                     │
│  JTBDs ─────────────────────────────────────────────┐                      │
│  ├── Strategic (Project-heavy) ──────────────────────► OKR Alignment       │
│  ├── Operational (Mixed) ────────────────────────────► via okr_jtbd_mapping│
│  └── Tactical (BAU-heavy) ───────────────────────────►                     │
│       │                                                                     │
│       ├── active_okr_count (denormalized)                                  │
│       ├── okr_alignment_score                                               │
│       └── strategic_priority (computed)                                     │
│           │                                                                 │
│           ├── Work Pattern (Project / BAU / Mixed)                         │
│           │   ├── Project: jtbd_project_metadata → deliverables            │
│           │   └── BAU: jtbd_bau_metadata → cycle_activities → sla_history  │
│           │                                                                 │
│           ├── ODI Outcomes (importance × satisfaction → opportunity)        │
│           │   ├── okr_key_result_outcome_mapping ← NEW JUNCTION            │
│           │   └── direction/object/dimension decomposition ← ENHANCED      │
│           │                                                                 │
│           └── AI Assessment                                                 │
│               ├── automation_score (0-100)                                 │
│               ├── okr_acceleration_score ← NEW                             │
│               ├── strategic_alignment_score ← NEW                          │
│               ├── recommended_focus (automation / augmentation)             │
│               └── prioritization_score ← NEW (40% + 40% + 20% formula)     │
│                   │                                                         │
│                   ▼                                                         │
│  PERSONAS                                                                   │
│  ├── owned_okr_count ← NEW                                                 │
│  ├── contributed_okr_count ← NEW                                           │
│  ├── Work Mix (project_work_ratio / bau_work_ratio)                        │
│  ├── work_complexity_score                                                  │
│  ├── ai_readiness_score                                                     │
│  └── derived_archetype ← Computed from 2x2 matrix                          │
│       │                                                                     │
│       ▼                                                                     │
│  SERVICE LAYER ROUTING (determine_service_layer function)                  │
│  ├── Automator → L1 Expert + L3 Workflow (auto)                            │
│  ├── Orchestrator → L2 Panel + L4 Solution                                 │
│  ├── Learner → L1 Expert + L3 Workflow (HITL)                              │
│  └── Skeptic → L2 Panel + L3 Workflow (audit)                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. FINAL Consolidated Action Plan (All Sources)

### 12.1 Summary of All Sources Analyzed

| Source | Version | Key Contributions |
|--------|---------|-------------------|
| JTBD_WORK_PATTERN_OKR_ENRICHMENT.md | v3.1 | Gold Standard baseline, work patterns, OKR structure |
| VITAL_JTBD_Schema_Reference.md | v1.0 | ODI decomposition, enablers, success criteria |
| VITAL_JTBD_TEMPLATE.json | v1.0 | Validation rules, quality thresholds |
| VITAL_JTBD_Project_vs_BAU_Schema.md | v2.0 | Project/BAU metadata, cycle activities, SLA history |
| **VITAL_JTBD_Complete_Schema_v3.md** | **v3.0** | **Strategic themes, OKR acceleration, prioritization** |

### 12.2 NEW Tables (11 Tables Total)

| # | Table | Source | Type | Priority |
|---|-------|--------|------|----------|
| 1 | `strategic_themes` | Complete v3 | Reference | **HIGH** |
| 2 | `key_result_update` | Complete v3 | Historical | **HIGH** |
| 3 | `okr_key_result_outcome_mapping` | Complete v3 | Junction | **HIGH** |
| 4 | `jtbd_ai_assessments` | Schema Ref v1.0 | 1:1 Extension | **HIGH** |
| 5 | `jtbd_enablers` | Schema Ref v1.0 | 1:N | **HIGH** |
| 6 | `jtbd_success_criteria` | Schema Ref v1.0 | 1:N | **MEDIUM** |
| 7 | `jtbd_project_metadata` | Project vs BAU | 1:1 Extension | **HIGH** |
| 8 | `jtbd_bau_metadata` | Project vs BAU | 1:1 Extension | **HIGH** |
| 9 | `jtbd_bau_cycle_activities` | Project vs BAU | 1:N | **HIGH** |
| 10 | `jtbd_project_deliverables` | Project vs BAU | 1:N | **MEDIUM** |
| 11 | `jtbd_bau_sla_history` | Project vs BAU | 1:N | **MEDIUM** |

### 12.3 Schema Enhancements (8 Enhancements)

| # | Enhancement | Target Table | Source |
|---|-------------|--------------|--------|
| 1 | OKR alignment fields | `jtbd` | Complete v3 |
| 2 | OKR acceleration scoring | `jtbd_ai_assessments` | Complete v3 |
| 3 | Work mix attributes | `personas` | Complete v3 |
| 4 | Theme linkage | `strategic_pillars` | Complete v3 |
| 5 | ODI decomposition | `jtbd_outcomes` | Schema Ref v1.0 |
| 6 | 5-tier opportunity priority | `jtbd_outcomes` | Schema Ref v1.0 |
| 7 | AI ROI dual-scoring | `jtbd_ai_assessments` | Project vs BAU |
| 8 | Strategic pillars expansion | `strategic_pillars` seed | Reconciliation |

### 12.4 NEW Functions (4 Functions)

| # | Function | Purpose | Source |
|---|----------|---------|--------|
| 1 | `derive_persona_archetype()` | 2x2 matrix archetype | Complete v3 |
| 2 | `calculate_ai_prioritization_score()` | 40/40/20 formula | Complete v3 |
| 3 | `determine_service_layer()` | Route to L1-L4 | Project vs BAU |
| 4 | `validate_jtbd_completeness()` | Quality thresholds | Schema Ref v1.0 |

### 12.5 NEW Views (7 Views)

| # | View | Purpose | Source |
|---|------|---------|--------|
| 1 | `v_okr_progress` | OKR health from KRs | Complete v3 |
| 2 | `v_jtbd_okr_alignment` | JTBD to OKR alignment | Complete v3 |
| 3 | `v_ai_opportunity_ranking` | AI priority ranking | Complete v3 |
| 4 | `v_strategic_cascade` | Full pillar→JTBD cascade | Complete v3 |
| 5 | `v_persona_work_mix` | Work pattern ratios | Project vs BAU |
| 6 | `v_kr_odi_linkage` | KR to ODI linkage | Gold Standard |
| 7 | `v_okr_odi_dashboard` | Combined dashboard | Gold Standard |

### 12.6 NEW ENUMs (35+ Types)

Comprehensive enum types across all categories:
- Strategic: `theme_status`, `pillar_status`
- OKR: `objective_type`, `timeframe_type`, `okr_level`, `okr_status`, `health_status`, `kr_status`, `metric_direction`, `measurement_frequency`, `alignment_type`, `measurement_relationship`, `acceleration_potential`
- JTBD: `strategic_priority`, `jtbd_type`, `work_pattern`, `complexity_level`, `impact_level`, `frequency_type`, `service_layer`, `compliance_sensitivity`, `validation_status`
- ODI: `outcome_direction`, `odi_dimension`, `opportunity_priority`, `outcome_type`
- Work Pattern: `project_governance`, `project_phase`, `operational_cadence`, `standardization_level`, `automation_level`, `variability_level`, `bau_activity_type`, `gate_type`, `deliverable_type`
- Persona: `archetype`, `involvement_level`, `seniority_level`
- AI: `automation_potential`, `ai_assistance_type`, `ai_focus`, `confidence_level`
- Enablers: `enabler_type`, `enabler_state`, `criticality`
- Success: `criterion_type`, `metric_type`

---

## 13. Implementation Priority Order

### Phase 1: Core Infrastructure (Week 1)
1. Create all ENUMs
2. Create `strategic_themes` table
3. Enhance `strategic_pillars` with theme linkage
4. Create `key_result_update` table
5. Create `okr_key_result_outcome_mapping` junction

### Phase 2: JTBD Extensions (Week 2)
6. Enhance `jtbd` with OKR alignment fields
7. Create `jtbd_ai_assessments` (consolidate existing tables)
8. Create `jtbd_enablers` and `jtbd_success_criteria`
9. Enhance `jtbd_outcomes` with ODI decomposition
10. Create validation function

### Phase 3: Work Pattern Extensions (Week 3)
11. Create `jtbd_project_metadata`
12. Create `jtbd_project_deliverables`
13. Create `jtbd_bau_metadata`
14. Create `jtbd_bau_cycle_activities`
15. Create `jtbd_bau_sla_history`
16. Create `determine_service_layer()` function

### Phase 4: Persona & AI Enhancements (Week 4)
17. Enhance `personas` with work mix attributes
18. Add OKR acceleration to `jtbd_ai_assessments`
19. Create `derive_persona_archetype()` function
20. Create all views
21. Create triggers for denormalized fields

### Phase 5: Data Population (Week 5)
22. Seed strategic pillars (expand to 9)
23. Seed strategic themes
24. Validate existing JTBDs with new rules
25. Compute archetypes for existing personas

---

**Document Status**: Complete (All 4 documents analyzed)
**Schema Version**: 4.0.0 (Consolidated)
**Action Owner**: Data Architecture Team
**Review Date**: November 30, 2024
**Next Step**: Create migration file with Phase 1 changes
