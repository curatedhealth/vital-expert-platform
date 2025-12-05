# JTBD Work Pattern & OKR Enrichment - Gold Standard Extension

**Version**: 3.1 | **Date**: November 29, 2024 | **Status**: Production-Ready Extension

---

## Executive Summary

This document extends the Gold Standard L3 JTBD schema with:

1. **Work Pattern Classification** - Project vs BAU (Business-As-Usual) distinction
2. **OKR Integration** - Objectives & Key Results as strategy alignment layer
3. **Persona Work Ratios** - Computed project/BAU mix per persona
4. **Phase Breakdowns** - Standard phases for both work types
5. **AI Opportunity Alignment** - Automation (BAU) vs Augmentation (Project) focus

---

## 1. Two Universal Work Modes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORK PATTERN CLASSIFICATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PROJECT-BASED WORK                    BAU / ROUTINE WORK                   │
│  ══════════════════                    ═══════════════════                  │
│                                                                             │
│  • Finite, temporary                   • Continuous, indefinite             │
│  • Unique outputs                      • Repeatable, stable                 │
│  • Cross-functional                    • Defined team/department            │
│  • High variability                    • Low variability                    │
│  • Milestone-driven                    • SLA/KPI-driven                     │
│  • PMO governance                      • SOP governance                     │
│                                                                             │
│  AI FOCUS: Augmentation + Intelligence AI FOCUS: Automation + Efficiency   │
│  SERVICE LAYER: L2 Panel, L4 Solution  SERVICE LAYER: L1 Expert, L3 Workflow│
│                                                                             │
│  ARCHETYPES: Orchestrator, Skeptic     ARCHETYPES: Automator, Learner      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Schema Extensions

### 2.1 Core JTBD Table Enhancement

```sql
-- Add work_pattern to jtbd table
ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  work_pattern TEXT NOT NULL DEFAULT 'bau'
  CHECK (work_pattern IN ('project', 'bau', 'mixed'));

COMMENT ON COLUMN jtbd.work_pattern IS
  'project = finite initiative with unique output; bau = recurring operational work; mixed = hybrid';

-- Add recommended AI focus based on work pattern
ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  ai_focus TEXT DEFAULT 'mixed'
  CHECK (ai_focus IN ('automation', 'augmentation', 'mixed'));

COMMENT ON COLUMN jtbd.ai_focus IS
  'automation = efficiency gains (BAU); augmentation = intelligence gains (Project)';
```

### 2.2 Work Pattern × JTBD Type Matrix

The system now supports **2D classification**:

| work_pattern | jtbd_type | Example | Primary AI Strategy |
|--------------|-----------|---------|---------------------|
| project | strategic | "Annual Strategic Planning" | Augmentation (L2/L4) |
| project | operational | "CRM Implementation Program" | Mixed |
| project | tactical | "Launch Readiness War Room" | Augmentation (L2) |
| bau | strategic | "Quarterly Business Review" | Mixed |
| bau | operational | "Daily Customer Inquiry Handling" | Automation (L3) |
| bau | tactical | "Weekly KPI Reporting" | Automation (L3) |
| mixed | strategic | "Evidence Gap Prioritization Cycle" | Mixed |
| mixed | operational | "Incident Response & Postmortem" | Mixed |

---

## 3. Project Work Phases (PMBOK/PRINCE2 Standard)

### 3.1 Reference Table: Project Phases

```sql
CREATE TABLE IF NOT EXISTS ref_project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  phase_name TEXT NOT NULL,
  phase_order INTEGER NOT NULL,
  description TEXT,
  typical_duration_pct NUMERIC(5,2), -- % of total project duration
  key_deliverables TEXT[],
  gate_type TEXT CHECK (gate_type IN ('approval', 'review', 'milestone', 'none')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed standard project phases
INSERT INTO ref_project_phases (code, phase_name, phase_order, description, typical_duration_pct, gate_type) VALUES
  ('INITIATE', 'Initiation', 1, 'Define problem/opportunity, build charter, identify stakeholders, secure approvals', 10.00, 'approval'),
  ('PLAN', 'Planning', 2, 'Requirements, RACI, timeline, budget, risk planning, communications plan', 20.00, 'approval'),
  ('EXECUTE', 'Execution', 3, 'Implementation, collaboration, deliverables production, change management', 50.00, 'milestone'),
  ('MONITOR', 'Monitoring & Control', 4, 'Metric tracking, issue/risk logs, steering meetings, adjustments', 15.00, 'review'),
  ('CLOSE', 'Closure', 5, 'Final acceptance, handover to BAU, lessons learned, documentation', 5.00, 'approval');
```

### 3.2 JTBD Project Phase Mapping

```sql
CREATE TABLE IF NOT EXISTS jtbd_project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  project_phase_id UUID NOT NULL REFERENCES ref_project_phases(id),
  phase_name TEXT NOT NULL, -- Cached for performance
  custom_description TEXT, -- Override for this specific JTBD
  estimated_duration_days INTEGER,
  sequence_order INTEGER NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(jtbd_id, project_phase_id)
);

CREATE INDEX idx_jtbd_project_phases_jtbd ON jtbd_project_phases(jtbd_id);
```

---

## 4. BAU Work Cadence (ITIL/Lean Ops Standard)

### 4.1 Reference Table: BAU Cadences

```sql
CREATE TABLE IF NOT EXISTS ref_bau_cadences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  cadence_name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'event_driven', 'continuous')),
  typical_activities TEXT[],
  governance_type TEXT CHECK (governance_type IN ('sla', 'kpi', 'sop', 'compliance')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed standard BAU cadences
INSERT INTO ref_bau_cadences (code, cadence_name, frequency, governance_type) VALUES
  ('HOURLY', 'Hourly/Real-time', 'hourly', 'sla'),
  ('DAILY', 'Daily Operations', 'daily', 'sla'),
  ('WEEKLY', 'Weekly Cycles', 'weekly', 'kpi'),
  ('MONTHLY', 'Monthly Operations', 'monthly', 'kpi'),
  ('QUARTERLY', 'Quarterly Business Cycles', 'quarterly', 'kpi'),
  ('ANNUAL', 'Annual Operations', 'annually', 'compliance'),
  ('EVENT', 'Event-Driven', 'event_driven', 'sla'),
  ('CONTINUOUS', 'Continuous Operations', 'continuous', 'sop');
```

### 4.2 JTBD BAU Cadence Mapping

```sql
CREATE TABLE IF NOT EXISTS jtbd_bau_cadences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  bau_cadence_id UUID NOT NULL REFERENCES ref_bau_cadences(id),
  cadence_name TEXT NOT NULL, -- Cached for performance
  frequency TEXT NOT NULL,
  volume_per_period INTEGER, -- How many times per period
  avg_duration_minutes INTEGER,
  sla_target TEXT, -- e.g., "< 24 hours", "> 95% compliance"
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(jtbd_id, bau_cadence_id)
);

CREATE INDEX idx_jtbd_bau_cadences_jtbd ON jtbd_bau_cadences(jtbd_id);
```

---

## 5. OKR System (Strategy Alignment Layer)

### 5.1 Core OKR Table

```sql
CREATE TABLE IF NOT EXISTS okr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Identity
  code TEXT NOT NULL, -- e.g., "OKR-Q1-2025-001"
  objective TEXT NOT NULL,
  description TEXT,

  -- Time Horizon
  timeframe TEXT NOT NULL, -- 'Q1-2025', 'H2-2025', 'FY2025'
  timeframe_type TEXT NOT NULL CHECK (timeframe_type IN ('quarterly', 'half_yearly', 'annual')),
  start_date DATE,
  end_date DATE,

  -- Ownership
  owner_type TEXT NOT NULL CHECK (owner_type IN ('persona', 'role', 'department', 'function', 'org')),
  owner_persona_id UUID REFERENCES personas(id),
  owner_role_id UUID REFERENCES org_roles(id),
  owner_department_id UUID REFERENCES org_departments(id),
  owner_function_id UUID REFERENCES org_functions(id),

  -- Classification
  okr_level TEXT NOT NULL CHECK (okr_level IN ('company', 'function', 'department', 'team', 'individual')),
  okr_type TEXT NOT NULL CHECK (okr_type IN ('committed', 'aspirational', 'learning')),

  -- Hierarchy
  parent_okr_id UUID REFERENCES okr(id), -- For cascading OKRs

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  confidence_level INTEGER CHECK (confidence_level BETWEEN 0 AND 100),
  overall_progress NUMERIC(5,2) DEFAULT 0.00, -- Computed from KRs

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  UNIQUE(tenant_id, code)
);

CREATE INDEX idx_okr_tenant ON okr(tenant_id);
CREATE INDEX idx_okr_timeframe ON okr(timeframe);
CREATE INDEX idx_okr_owner_persona ON okr(owner_persona_id);
CREATE INDEX idx_okr_parent ON okr(parent_okr_id);
```

### 5.2 Key Results Table

```sql
CREATE TABLE IF NOT EXISTS key_result (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  okr_id UUID NOT NULL REFERENCES okr(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Identity
  kr_code TEXT NOT NULL, -- e.g., "KR1", "KR2"
  description TEXT NOT NULL,

  -- Measurement
  metric_type TEXT NOT NULL CHECK (metric_type IN ('percentage', 'count', 'score', 'currency', 'time', 'boolean')),
  baseline_value NUMERIC,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT, -- e.g., "%", "days", "$", "score"

  -- Progress
  progress_pct NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN target_value = baseline_value THEN 100
      WHEN target_value > baseline_value THEN
        LEAST(100, ((current_value - COALESCE(baseline_value, 0)) / NULLIF(target_value - COALESCE(baseline_value, 0), 0)) * 100)
      ELSE
        LEAST(100, ((COALESCE(baseline_value, 0) - current_value) / NULLIF(COALESCE(baseline_value, 0) - target_value, 0)) * 100)
    END
  ) STORED,

  -- Scoring (Google-style 0.0-1.0)
  kr_score NUMERIC(3,2) GENERATED ALWAYS AS (
    LEAST(1.0, GREATEST(0.0,
      CASE
        WHEN target_value = baseline_value THEN 1.0
        WHEN target_value > baseline_value THEN
          (current_value - COALESCE(baseline_value, 0)) / NULLIF(target_value - COALESCE(baseline_value, 0), 0)
        ELSE
          (COALESCE(baseline_value, 0) - current_value) / NULLIF(COALESCE(baseline_value, 0) - target_value, 0)
      END
    ))
  ) STORED,

  -- Classification
  kr_type TEXT DEFAULT 'output' CHECK (kr_type IN ('input', 'output', 'outcome')),
  confidence_level INTEGER CHECK (confidence_level BETWEEN 0 AND 100),

  -- Links
  kpi_id UUID, -- REFERENCES kpis(id) if KPI table exists
  odi_outcome_id UUID REFERENCES jtbd_outcomes(id), -- Link to ODI outcome

  -- Ordering
  sequence_order INTEGER DEFAULT 1,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(okr_id, kr_code)
);

CREATE INDEX idx_key_result_okr ON key_result(okr_id);
CREATE INDEX idx_key_result_odi ON key_result(odi_outcome_id);
```

### 5.3 OKR ↔ JTBD Mapping

```sql
CREATE TABLE IF NOT EXISTS okr_jtbd_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  okr_id UUID NOT NULL REFERENCES okr(id) ON DELETE CASCADE,
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Relationship Type
  mapping_type TEXT NOT NULL CHECK (mapping_type IN ('primary', 'contributing', 'supporting')),
  impact_level TEXT CHECK (impact_level IN ('high', 'medium', 'low')),

  -- Contribution
  contribution_weight NUMERIC(3,2) DEFAULT 1.00, -- 0.00-1.00

  -- Evidence
  rationale TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(okr_id, jtbd_id)
);

CREATE INDEX idx_okr_jtbd_okr ON okr_jtbd_mapping(okr_id);
CREATE INDEX idx_okr_jtbd_jtbd ON okr_jtbd_mapping(jtbd_id);
```

### 5.4 OKR ↔ AI Opportunity Mapping

```sql
CREATE TABLE IF NOT EXISTS okr_ai_opportunity_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  okr_id UUID NOT NULL REFERENCES okr(id) ON DELETE CASCADE,
  ai_opportunity_id UUID NOT NULL REFERENCES ai_opportunities(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Alignment
  alignment_strength TEXT CHECK (alignment_strength IN ('direct', 'indirect', 'enabling')),
  expected_impact_on_kr TEXT, -- Which KR this opportunity accelerates

  -- Prioritization
  priority_score INTEGER CHECK (priority_score BETWEEN 1 AND 100),
  is_critical_path BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(okr_id, ai_opportunity_id)
);

CREATE INDEX idx_okr_ai_opp_okr ON okr_ai_opportunity_mapping(okr_id);
CREATE INDEX idx_okr_ai_opp_ai ON okr_ai_opportunity_mapping(ai_opportunity_id);
```

---

## 6. Persona Work Ratio Extensions

### 6.1 Persona Table Enhancements

```sql
-- Add work pattern ratios to persona table
ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  project_work_ratio NUMERIC(3,2) DEFAULT 0.50 CHECK (project_work_ratio BETWEEN 0.00 AND 1.00);

ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  bau_work_ratio NUMERIC(3,2) DEFAULT 0.50 CHECK (bau_work_ratio BETWEEN 0.00 AND 1.00);

COMMENT ON COLUMN personas.project_work_ratio IS
  'Proportion of persona time spent on project work (0.00-1.00), computed from JTBD mappings';

COMMENT ON COLUMN personas.bau_work_ratio IS
  'Proportion of persona time spent on BAU work (0.00-1.00), computed from JTBD mappings';

-- Add constraint to ensure ratios sum to ~1.0
ALTER TABLE personas ADD CONSTRAINT check_work_ratio_sum
  CHECK (ABS(project_work_ratio + bau_work_ratio - 1.0) < 0.01);
```

### 6.2 Function to Compute Persona Work Ratios

```sql
CREATE OR REPLACE FUNCTION compute_persona_work_ratios(p_persona_id UUID)
RETURNS TABLE (project_ratio NUMERIC, bau_ratio NUMERIC) AS $$
DECLARE
  total_weight NUMERIC;
  project_weight NUMERIC;
  bau_weight NUMERIC;
BEGIN
  -- Sum weights by work pattern from persona-JTBD mappings
  SELECT
    COALESCE(SUM(CASE WHEN j.work_pattern = 'project' THEN pm.time_allocation_pct ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN j.work_pattern = 'bau' THEN pm.time_allocation_pct ELSE 0 END), 0),
    COALESCE(SUM(pm.time_allocation_pct), 0)
  INTO project_weight, bau_weight, total_weight
  FROM jtbd_persona_mapping pm
  JOIN jtbd j ON pm.jtbd_id = j.id
  WHERE pm.persona_id = p_persona_id;

  -- Handle mixed work pattern (split 50/50)
  SELECT
    project_weight + COALESCE(SUM(pm.time_allocation_pct * 0.5), 0),
    bau_weight + COALESCE(SUM(pm.time_allocation_pct * 0.5), 0)
  INTO project_weight, bau_weight
  FROM jtbd_persona_mapping pm
  JOIN jtbd j ON pm.jtbd_id = j.id
  WHERE pm.persona_id = p_persona_id AND j.work_pattern = 'mixed';

  -- Recalculate total
  total_weight := project_weight + bau_weight;

  IF total_weight > 0 THEN
    project_ratio := ROUND(project_weight / total_weight, 2);
    bau_ratio := ROUND(bau_weight / total_weight, 2);
  ELSE
    project_ratio := 0.50;
    bau_ratio := 0.50;
  END IF;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
```

### 6.3 Trigger to Auto-Update Persona Ratios

```sql
CREATE OR REPLACE FUNCTION trigger_update_persona_work_ratios()
RETURNS TRIGGER AS $$
DECLARE
  ratios RECORD;
BEGIN
  -- Get computed ratios
  SELECT * INTO ratios FROM compute_persona_work_ratios(
    COALESCE(NEW.persona_id, OLD.persona_id)
  );

  -- Update persona
  UPDATE personas
  SET
    project_work_ratio = ratios.project_ratio,
    bau_work_ratio = ratios.bau_ratio,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.persona_id, OLD.persona_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger on JTBD-Persona mapping changes
CREATE TRIGGER trg_update_persona_work_ratios
AFTER INSERT OR UPDATE OR DELETE ON jtbd_persona_mapping
FOR EACH ROW EXECUTE FUNCTION trigger_update_persona_work_ratios();
```

---

## 7. Archetype Inference from Work Pattern

### 7.1 Archetype Assignment Logic

```sql
CREATE OR REPLACE FUNCTION infer_persona_archetype(
  p_project_ratio NUMERIC,
  p_ai_readiness_score NUMERIC -- 0-100 scale
)
RETURNS TEXT AS $$
BEGIN
  -- 2x2 Matrix:
  -- X-axis: Work Complexity (BAU=Low, Project=High)
  -- Y-axis: AI Readiness (Low < 50, High >= 50)

  IF p_project_ratio >= 0.5 THEN
    -- High Project Work (Complex)
    IF p_ai_readiness_score >= 50 THEN
      RETURN 'orchestrator'; -- High Complexity + High AI Readiness
    ELSE
      RETURN 'skeptic'; -- High Complexity + Low AI Readiness
    END IF;
  ELSE
    -- High BAU Work (Routine)
    IF p_ai_readiness_score >= 50 THEN
      RETURN 'automator'; -- Low Complexity + High AI Readiness
    ELSE
      RETURN 'learner'; -- Low Complexity + Low AI Readiness
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### 7.2 Archetype Reference Table

```sql
CREATE TABLE IF NOT EXISTS ref_archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  archetype_name TEXT NOT NULL,

  -- 2x2 Position
  work_complexity TEXT NOT NULL CHECK (work_complexity IN ('low', 'high')),
  ai_readiness TEXT NOT NULL CHECK (ai_readiness IN ('low', 'high')),

  -- Characteristics
  description TEXT,
  typical_work_pattern TEXT CHECK (typical_work_pattern IN ('project', 'bau', 'mixed')),
  preferred_service_layers TEXT[], -- e.g., ['L1_expert', 'L3_workflow']
  ai_delivery_style TEXT,

  -- AI Strategy
  primary_ai_focus TEXT CHECK (primary_ai_focus IN ('automation', 'augmentation', 'mixed')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed archetypes
INSERT INTO ref_archetypes (code, archetype_name, work_complexity, ai_readiness, typical_work_pattern, preferred_service_layers, ai_delivery_style, primary_ai_focus, description) VALUES
  ('AUTOMATOR', 'Automator', 'low', 'high', 'bau', ARRAY['L1_expert', 'L3_workflow'], 'One-click execution, minimal confirmation', 'automation',
   'High BAU work + High AI readiness. Wants efficiency gains. Values speed and automation. Prefers hands-off AI that just works.'),
  ('ORCHESTRATOR', 'Orchestrator', 'high', 'high', 'project', ARRAY['L2_panel', 'L4_solution'], 'Multi-agent panels, scenario comparison', 'augmentation',
   'High Project work + High AI readiness. Wants intelligence gains. Values strategic insights. Prefers AI that augments complex decisions.'),
  ('LEARNER', 'Learner', 'low', 'low', 'bau', ARRAY['L1_expert', 'L3_workflow'], 'Step-by-step guidance, explanations', 'automation',
   'High BAU work + Low AI readiness. Needs hand-holding. Values learning and growth. Prefers AI with explanations and guardrails.'),
  ('SKEPTIC', 'Skeptic', 'high', 'low', 'project', ARRAY['L2_panel', 'L3_workflow'], 'Full citations, audit logs, HITL gates', 'augmentation',
   'High Project work + Low AI readiness. Needs trust-building. Values evidence and control. Prefers AI with full transparency and human oversight.');
```

---

## 8. Strategy Alignment Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STRATEGY → EXECUTION ALIGNMENT                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  VISION / STRATEGY                                                          │
│       ↓                                                                     │
│  OKRs (Quarterly/Annual Outcomes)                                           │
│       ↓                                                                     │
│  JTBDs (Work to Achieve Outcomes)                                           │
│       ↓                                                                     │
│  ODI Framework (Quality Gaps to Close)                                      │
│       ↓                                                                     │
│  Work Pattern (Project vs BAU)                                              │
│       ↓                                                                     │
│  AI Opportunities (Automation vs Augmentation)                              │
│       ↓                                                                     │
│  Service Layers (L1 Expert / L2 Panel / L3 Workflow / L4 Solution)          │
│       ↓                                                                     │
│  Capabilities (Agents, RAG, Workflows, Tools)                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Comprehensive View: OKR-Aligned JTBD

```sql
CREATE OR REPLACE VIEW v_okr_jtbd_alignment AS
SELECT
  -- OKR Info
  o.id AS okr_id,
  o.code AS okr_code,
  o.objective,
  o.timeframe,
  o.okr_level,
  o.overall_progress AS okr_progress,

  -- JTBD Info
  j.id AS jtbd_id,
  j.code AS jtbd_code,
  j.name AS jtbd_name,
  j.work_pattern,
  j.ai_focus,
  j.job_category,
  j.complexity,
  j.frequency,

  -- Mapping Info
  ojm.mapping_type,
  ojm.impact_level,
  ojm.contribution_weight,

  -- ODI Scores
  (SELECT AVG(opportunity_score) FROM jtbd_outcomes WHERE jtbd_id = j.id) AS avg_opportunity_score,
  (SELECT COUNT(*) FROM jtbd_outcomes WHERE jtbd_id = j.id AND opportunity_priority = 'high') AS high_opp_count,

  -- AI Opportunities
  (SELECT COUNT(*) FROM ai_opportunities ao
   JOIN okr_ai_opportunity_mapping oaom ON ao.id = oaom.ai_opportunity_id
   WHERE oaom.okr_id = o.id AND ao.jtbd_id = j.id) AS ai_opportunity_count,

  -- Key Results Progress
  (SELECT AVG(kr_score) * 100 FROM key_result WHERE okr_id = o.id) AS avg_kr_progress

FROM okr o
JOIN okr_jtbd_mapping ojm ON o.id = ojm.okr_id
JOIN jtbd j ON ojm.jtbd_id = j.id
WHERE o.status = 'active'
ORDER BY o.timeframe, ojm.contribution_weight DESC;
```

---

## 10. Complete ODI (Outcome-Driven Innovation) Schema

The ODI framework is the **quality measurement layer** within L3 (JTBD). It quantifies how well outcomes are being served and identifies high-value improvement opportunities.

### 10.1 Full ODI Schema DDL

```sql
-- ================================================================
-- ODI (OUTCOME-DRIVEN INNOVATION) - COMPLETE SCHEMA
-- Location: L3 (Responsibility/JTBD Layer)
-- Purpose: Quantify outcome importance/satisfaction, identify opportunities
-- ================================================================

-- ----------------------------------------------------------------
-- 10.1.1 JTBD OUTCOMES (Core ODI Table)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jtbd_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- ODI Standard Format
  outcome_statement TEXT NOT NULL,
  outcome_type TEXT NOT NULL CHECK (outcome_type IN (
    'desired', 'undesired', 'over_served', 'under_served'
  )),

  -- ODI Scores (1-10 scale)
  importance_score NUMERIC(3,1) NOT NULL CHECK (importance_score BETWEEN 1 AND 10),
  satisfaction_score NUMERIC(3,1) NOT NULL CHECK (satisfaction_score BETWEEN 1 AND 10),

  -- Computed Opportunity Score (GENERATED COLUMN)
  opportunity_score NUMERIC(4,1) GENERATED ALWAYS AS (
    importance_score + GREATEST(importance_score - satisfaction_score, 0)
  ) STORED,

  -- Derived Priority (GENERATED COLUMN)
  opportunity_priority TEXT GENERATED ALWAYS AS (
    CASE
      WHEN importance_score + GREATEST(importance_score - satisfaction_score, 0) > 12 THEN 'high'
      WHEN importance_score + GREATEST(importance_score - satisfaction_score, 0) >= 8 THEN 'medium'
      ELSE 'low'
    END
  ) STORED,

  -- Context
  segment TEXT, -- Which user segment this applies to
  context_when TEXT, -- When is this outcome most important?
  context_circumstance TEXT, -- Under what circumstances?

  -- Evidence
  evidence_source TEXT, -- Survey, interview, analytics
  sample_size INTEGER,
  confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low')),
  last_measured_at DATE,

  -- Metadata
  sequence_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(jtbd_id, outcome_statement)
);

-- Performance indexes
CREATE INDEX idx_jtbd_outcomes_jtbd ON jtbd_outcomes(jtbd_id);
CREATE INDEX idx_jtbd_outcomes_opportunity ON jtbd_outcomes(opportunity_score DESC);
CREATE INDEX idx_jtbd_outcomes_priority ON jtbd_outcomes(opportunity_priority);
CREATE INDEX idx_jtbd_outcomes_type ON jtbd_outcomes(outcome_type);

-- ----------------------------------------------------------------
-- 10.1.2 JTBD PAIN POINTS (Annoyances, not blockers)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jtbd_pain_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Pain Point Details
  pain_point_text TEXT NOT NULL,
  pain_type TEXT NOT NULL CHECK (pain_type IN (
    'time_waste', 'effort_waste', 'cognitive_load',
    'frustration', 'uncertainty', 'rework', 'waiting'
  )),

  -- Severity Assessment
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'major', 'moderate', 'minor')),
  frequency TEXT CHECK (frequency IN ('always', 'often', 'sometimes', 'rarely')),

  -- Impact Quantification
  estimated_time_lost_hours NUMERIC(5,1), -- Per occurrence
  estimated_cost_impact NUMERIC(10,2), -- Per occurrence
  affected_user_percentage NUMERIC(5,2), -- 0-100%

  -- Root Cause
  root_cause TEXT,
  root_cause_category TEXT CHECK (root_cause_category IN (
    'process', 'system', 'data', 'people', 'policy', 'external'
  )),

  -- Evidence
  evidence_source TEXT,
  quote_verbatim TEXT, -- Actual user quote

  -- Status
  is_addressed BOOLEAN DEFAULT false,
  addressed_by_opportunity_id UUID, -- Links to AI opportunity that addresses this

  -- Metadata
  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(jtbd_id, pain_point_text)
);

CREATE INDEX idx_jtbd_pain_points_jtbd ON jtbd_pain_points(jtbd_id);
CREATE INDEX idx_jtbd_pain_points_severity ON jtbd_pain_points(severity);

-- ----------------------------------------------------------------
-- 10.1.3 JTBD OBSTACLES (Blockers that can be removed)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jtbd_obstacles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Obstacle Details
  obstacle_text TEXT NOT NULL,
  obstacle_type TEXT NOT NULL CHECK (obstacle_type IN (
    'technical', 'process', 'organizational', 'knowledge',
    'resource', 'regulatory', 'data_quality', 'integration'
  )),

  -- Severity & Removability
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'major', 'moderate', 'minor')),
  is_removable BOOLEAN NOT NULL DEFAULT true, -- If false, it's actually a constraint
  removal_effort TEXT CHECK (removal_effort IN ('low', 'medium', 'high', 'very_high')),
  removal_timeframe TEXT, -- e.g., "1-2 months", "6+ months"

  -- Current Workaround
  workaround TEXT,
  workaround_effectiveness TEXT CHECK (workaround_effectiveness IN (
    'effective', 'partially_effective', 'ineffective', 'none'
  )),

  -- Impact
  blocking_percentage NUMERIC(5,2), -- % of attempts blocked
  downstream_impact TEXT, -- What can't happen because of this?

  -- Evidence
  evidence_source TEXT,

  -- Status
  status TEXT DEFAULT 'identified' CHECK (status IN (
    'identified', 'analysis', 'solution_design', 'implementation', 'resolved'
  )),
  resolution_date DATE,
  resolution_notes TEXT,

  -- Metadata
  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(jtbd_id, obstacle_text)
);

CREATE INDEX idx_jtbd_obstacles_jtbd ON jtbd_obstacles(jtbd_id);
CREATE INDEX idx_jtbd_obstacles_severity ON jtbd_obstacles(severity);
CREATE INDEX idx_jtbd_obstacles_removable ON jtbd_obstacles(is_removable);

-- ----------------------------------------------------------------
-- 10.1.4 JTBD CONSTRAINTS (Limitations that cannot be removed)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jtbd_constraints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Constraint Details
  constraint_text TEXT NOT NULL,
  constraint_type TEXT NOT NULL CHECK (constraint_type IN (
    'regulatory', 'legal', 'contractual', 'ethical',
    'physical', 'temporal', 'budgetary', 'organizational'
  )),

  -- Authority
  governing_body TEXT, -- e.g., "FDA", "EMA", "Legal Dept"
  regulation_reference TEXT, -- e.g., "21 CFR Part 11", "GDPR Art. 17"
  effective_date DATE,
  expiration_date DATE, -- NULL if permanent

  -- Impact Classification
  impact_scope TEXT CHECK (impact_scope IN ('global', 'regional', 'local', 'specific')),
  violation_consequence TEXT, -- What happens if violated?

  -- Design Implications
  design_implications TEXT, -- How must solutions accommodate this?
  workaround_allowed BOOLEAN DEFAULT false,

  -- Verification
  compliance_owner TEXT, -- Who verifies compliance?
  verification_method TEXT,
  last_verified_at DATE,

  -- Metadata
  sequence_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(jtbd_id, constraint_text)
);

CREATE INDEX idx_jtbd_constraints_jtbd ON jtbd_constraints(jtbd_id);
CREATE INDEX idx_jtbd_constraints_type ON jtbd_constraints(constraint_type);
CREATE INDEX idx_jtbd_constraints_governing ON jtbd_constraints(governing_body);
```

### 10.2 ODI-OKR Linkage Views (Dashboard Ready)

```sql
-- ================================================================
-- ODI-OKR LINKAGE VIEWS FOR DASHBOARDS
-- These views connect OKR progress to ODI opportunity scores
-- ================================================================

-- ----------------------------------------------------------------
-- 10.2.1 Key Result → ODI Outcome Direct Link
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW v_kr_odi_linkage AS
SELECT
  -- Key Result Info
  kr.id AS key_result_id,
  kr.kr_code,
  kr.description AS kr_description,
  kr.metric_type,
  kr.baseline_value,
  kr.target_value,
  kr.current_value,
  kr.progress_pct,
  kr.kr_score,

  -- Linked OKR
  o.id AS okr_id,
  o.code AS okr_code,
  o.objective,
  o.timeframe,
  o.okr_level,
  o.status AS okr_status,

  -- Linked ODI Outcome
  odi.id AS odi_outcome_id,
  odi.outcome_statement,
  odi.outcome_type,
  odi.importance_score,
  odi.satisfaction_score,
  odi.opportunity_score,
  odi.opportunity_priority,
  odi.segment,

  -- Linked JTBD
  j.id AS jtbd_id,
  j.code AS jtbd_code,
  j.name AS jtbd_name,
  j.work_pattern,

  -- Computed: Alignment Score (KR progress × ODI importance)
  ROUND((kr.kr_score * odi.importance_score / 10)::NUMERIC, 2) AS alignment_score,

  -- Computed: Gap (what's left to close)
  ROUND((1 - kr.kr_score) * odi.opportunity_score, 1) AS remaining_opportunity

FROM key_result kr
JOIN okr o ON kr.okr_id = o.id
LEFT JOIN jtbd_outcomes odi ON kr.odi_outcome_id = odi.id
LEFT JOIN jtbd j ON odi.jtbd_id = j.id
WHERE o.status IN ('active', 'completed');

COMMENT ON VIEW v_kr_odi_linkage IS
  'Dashboard view: Links Key Results to ODI Outcomes with alignment scores';

-- ----------------------------------------------------------------
-- 10.2.2 OKR Progress vs ODI Opportunity Dashboard
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW v_okr_odi_dashboard AS
SELECT
  -- OKR Summary
  o.id AS okr_id,
  o.code AS okr_code,
  o.objective,
  o.timeframe,
  o.okr_level,
  o.okr_type,
  o.status,
  o.overall_progress,

  -- Aggregated KR Metrics
  (SELECT COUNT(*) FROM key_result WHERE okr_id = o.id) AS total_krs,
  (SELECT AVG(kr_score) FROM key_result WHERE okr_id = o.id) AS avg_kr_score,
  (SELECT COUNT(*) FROM key_result WHERE okr_id = o.id AND kr_score >= 0.7) AS krs_on_track,

  -- Linked JTBDs
  (SELECT COUNT(DISTINCT jtbd_id) FROM okr_jtbd_mapping WHERE okr_id = o.id) AS linked_jtbd_count,

  -- ODI Metrics (via KR linkage)
  (SELECT AVG(odi.opportunity_score)
   FROM key_result kr
   JOIN jtbd_outcomes odi ON kr.odi_outcome_id = odi.id
   WHERE kr.okr_id = o.id) AS avg_linked_opportunity_score,

  (SELECT COUNT(*)
   FROM key_result kr
   JOIN jtbd_outcomes odi ON kr.odi_outcome_id = odi.id
   WHERE kr.okr_id = o.id AND odi.opportunity_priority = 'high') AS high_priority_outcomes_linked,

  -- Satisfaction Improvement Tracker
  (SELECT AVG(odi.satisfaction_score)
   FROM key_result kr
   JOIN jtbd_outcomes odi ON kr.odi_outcome_id = odi.id
   WHERE kr.okr_id = o.id) AS current_avg_satisfaction,

  -- AI Opportunity Alignment
  (SELECT COUNT(*) FROM okr_ai_opportunity_mapping WHERE okr_id = o.id) AS ai_opportunities_aligned,
  (SELECT COUNT(*) FROM okr_ai_opportunity_mapping WHERE okr_id = o.id AND is_critical_path = true) AS critical_path_ai_opps

FROM okr o
WHERE o.status IN ('draft', 'active', 'completed')
ORDER BY o.timeframe DESC, o.overall_progress DESC;

COMMENT ON VIEW v_okr_odi_dashboard IS
  'Executive dashboard: OKR progress with ODI opportunity alignment metrics';

-- ----------------------------------------------------------------
-- 10.2.3 Underserved Outcomes Not Yet Linked to OKRs
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW v_odi_unlinked_opportunities AS
SELECT
  -- Outcome Details
  odi.id AS outcome_id,
  odi.outcome_statement,
  odi.outcome_type,
  odi.importance_score,
  odi.satisfaction_score,
  odi.opportunity_score,
  odi.opportunity_priority,
  odi.segment,

  -- Parent JTBD
  j.id AS jtbd_id,
  j.code AS jtbd_code,
  j.name AS jtbd_name,
  j.work_pattern,
  j.job_category,

  -- Linkage Status
  CASE
    WHEN EXISTS (SELECT 1 FROM key_result kr WHERE kr.odi_outcome_id = odi.id)
    THEN 'linked_to_kr'
    WHEN EXISTS (
      SELECT 1 FROM okr_jtbd_mapping ojm
      JOIN jtbd j2 ON ojm.jtbd_id = j2.id
      WHERE j2.id = odi.jtbd_id
    )
    THEN 'jtbd_linked_to_okr'
    ELSE 'unlinked'
  END AS okr_linkage_status,

  -- Pain Points Count
  (SELECT COUNT(*) FROM jtbd_pain_points pp WHERE pp.jtbd_id = j.id) AS related_pain_points,

  -- Obstacles Count
  (SELECT COUNT(*) FROM jtbd_obstacles obs WHERE obs.jtbd_id = j.id AND obs.severity = 'critical') AS critical_obstacles

FROM jtbd_outcomes odi
JOIN jtbd j ON odi.jtbd_id = j.id
WHERE odi.opportunity_priority IN ('high', 'medium')
  AND odi.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM key_result kr WHERE kr.odi_outcome_id = odi.id
  )
ORDER BY odi.opportunity_score DESC;

COMMENT ON VIEW v_odi_unlinked_opportunities IS
  'Planning view: High-value ODI outcomes not yet linked to any KR';

-- ----------------------------------------------------------------
-- 10.2.4 Friction Summary by JTBD (Pain + Obstacles + Constraints)
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW v_jtbd_friction_summary AS
SELECT
  j.id AS jtbd_id,
  j.code AS jtbd_code,
  j.name AS jtbd_name,
  j.work_pattern,

  -- Pain Points Summary
  (SELECT COUNT(*) FROM jtbd_pain_points WHERE jtbd_id = j.id) AS total_pain_points,
  (SELECT COUNT(*) FROM jtbd_pain_points WHERE jtbd_id = j.id AND severity = 'critical') AS critical_pain_points,
  (SELECT SUM(estimated_time_lost_hours) FROM jtbd_pain_points WHERE jtbd_id = j.id) AS total_time_lost_hours,

  -- Obstacles Summary
  (SELECT COUNT(*) FROM jtbd_obstacles WHERE jtbd_id = j.id) AS total_obstacles,
  (SELECT COUNT(*) FROM jtbd_obstacles WHERE jtbd_id = j.id AND severity = 'critical' AND is_removable = true) AS removable_critical_obstacles,
  (SELECT COUNT(*) FROM jtbd_obstacles WHERE jtbd_id = j.id AND status = 'resolved') AS resolved_obstacles,

  -- Constraints Summary
  (SELECT COUNT(*) FROM jtbd_constraints WHERE jtbd_id = j.id AND is_active = true) AS active_constraints,
  (SELECT COUNT(*) FROM jtbd_constraints WHERE jtbd_id = j.id AND constraint_type = 'regulatory') AS regulatory_constraints,

  -- ODI Summary
  (SELECT AVG(opportunity_score) FROM jtbd_outcomes WHERE jtbd_id = j.id) AS avg_opportunity_score,
  (SELECT COUNT(*) FROM jtbd_outcomes WHERE jtbd_id = j.id AND opportunity_priority = 'high') AS high_priority_outcomes,

  -- Computed Friction Score (higher = more friction)
  (
    (SELECT COALESCE(COUNT(*) * 3, 0) FROM jtbd_pain_points WHERE jtbd_id = j.id AND severity = 'critical') +
    (SELECT COALESCE(COUNT(*) * 5, 0) FROM jtbd_obstacles WHERE jtbd_id = j.id AND severity = 'critical') +
    (SELECT COALESCE(COUNT(*) * 2, 0) FROM jtbd_constraints WHERE jtbd_id = j.id AND is_active = true)
  ) AS friction_score

FROM jtbd j
WHERE j.status = 'active'
ORDER BY friction_score DESC;

COMMENT ON VIEW v_jtbd_friction_summary IS
  'Operations view: Consolidated friction metrics per JTBD';
```

### 10.3 ODI Position in Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         VITAL 8-LAYER ONTOLOGY WITH ODI POSITION                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │ L8: CHANGE & STRATEGY                                                            │   │
│  │ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │   │
│  │ │     Vision      │  │  Strategic      │  │      OKR        │◄──── Strategy    │   │
│  │ │   Statements    │  │   Pillars       │  │   Objectives    │       Alignment  │   │
│  │ │                 │  │  (SP01-SP07)    │  │   + Key Results │                   │   │
│  │ └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                   │   │
│  └──────────│─────────────────────│─────────────────────│──────────────────────────┘   │
│             │                     │                     │                               │
│             ▼                     ▼                     ▼                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │ L7: VALUE REALIZATION                                                            │   │
│  │ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │   │
│  │ │ Value Categories│  │  Value Drivers  │  │   AI Benefits   │◄──── Value       │   │
│  │ │ (Smarter,Faster)│  │(Efficiency,ROI) │  │   Realization   │       Tracking   │   │
│  │ └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                   │   │
│  └──────────│─────────────────────│─────────────────────│──────────────────────────┘   │
│             │                     │                     │                               │
│             ▼                     ▼                     ▼                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │ L6: OPERATIONAL INTELLIGENCE                                                     │   │
│  │ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │   │
│  │ │   KPI Metrics   │  │  Performance    │  │   Analytics     │◄──── Runtime     │   │
│  │ │                 │  │   Dashboards    │  │    Insights     │       Metrics    │   │
│  │ └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                   │   │
│  └──────────│─────────────────────│─────────────────────│──────────────────────────┘   │
│             │                     │                     │                               │
│             ▼                     ▼                     ▼                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │ L5: EXECUTION                                                                    │   │
│  │ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │   │
│  │ │   Workflows     │  │   Tasks/Steps   │  │  AI Service     │◄──── Execution   │   │
│  │ │   (PMBOK/ITIL)  │  │                 │  │    Routing      │       Engine     │   │
│  │ └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                   │   │
│  └──────────│─────────────────────│─────────────────────│──────────────────────────┘   │
│             │                     │                     │                               │
│             ▼                     ▼                     ▼                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │ L4: CAPABILITY                                                                   │   │
│  │ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │   │
│  │ │    Skills       │  │     Tools       │  │ AI Suitability  │◄──── Capability  │   │
│  │ │                 │  │                 │  │    Scores       │       Mapping    │   │
│  │ └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                   │   │
│  └──────────│─────────────────────│─────────────────────│──────────────────────────┘   │
│             │                     │                     │                               │
│             ▼                     ▼                     ▼                               │
│  ╔═════════════════════════════════════════════════════════════════════════════════╗   │
│  ║ L3: RESPONSIBILITY (JTBD) ◄───────────────────────── CORE STRATEGIC LAYER ════║   │
│  ║ ┌─────────────────────────────────────────────────────────────────────────────┐ ║   │
│  ║ │                              JTBD CORE                                      │ ║   │
│  ║ │ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐   │ ║   │
│  ║ │ │  Job Identity │ │ Work Pattern  │ │   Job Type    │ │  Complexity   │   │ ║   │
│  ║ │ │  (code,name)  │ │(project/bau)  │ │(strat/op/tac) │ │  Frequency    │   │ ║   │
│  ║ │ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘   │ ║   │
│  ║ └─────────────────────────────────────────────────────────────────────────────┘ ║   │
│  ║                                                                                 ║   │
│  ║ ┌─────────────────────────────────────────────────────────────────────────────┐ ║   │
│  ║ │                    ★★★ ODI FRAMEWORK ★★★                                   │ ║   │
│  ║ │                                                                             │ ║   │
│  ║ │  ┌──────────────────────────────────────────────────────────────────────┐  │ ║   │
│  ║ │  │ JTBD_OUTCOMES (Core ODI Metrics)                                     │  │ ║   │
│  ║ │  │ • outcome_statement: "Minimize time to find relevant clinical data"  │  │ ║   │
│  ║ │  │ • importance_score: 9 (1-10 scale)                                   │  │ ║   │
│  ║ │  │ • satisfaction_score: 4 (1-10 scale)                                 │  │ ║   │
│  ║ │  │ • opportunity_score: 14 (COMPUTED: imp + MAX(imp-sat, 0))           │  │ ║   │
│  ║ │  │ • opportunity_priority: 'high' (COMPUTED: >12=high, 8-12=med)       │  │ ║   │
│  ║ │  └──────────────────────────────────────────────────────────────────────┘  │ ║   │
│  ║ │                                                                             │ ║   │
│  ║ │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │ ║   │
│  ║ │  │ JTBD_PAIN_POINTS │  │ JTBD_OBSTACLES   │  │ JTBD_CONSTRAINTS │         │ ║   │
│  ║ │  │ (Annoyances)     │  │ (Removable)      │  │ (Fixed)          │         │ ║   │
│  ║ │  │                  │  │                  │  │                  │         │ ║   │
│  ║ │  │ • time_waste     │  │ • technical      │  │ • regulatory     │         │ ║   │
│  ║ │  │ • effort_waste   │  │ • process        │  │ • legal          │         │ ║   │
│  ║ │  │ • frustration    │  │ • resource       │  │ • ethical        │         │ ║   │
│  ║ │  │ • rework         │  │ • data_quality   │  │ • budgetary      │         │ ║   │
│  ║ │  └──────────────────┘  └──────────────────┘  └──────────────────┘         │ ║   │
│  ║ └─────────────────────────────────────────────────────────────────────────────┘ ║   │
│  ║                                                                                 ║   │
│  ║ ┌─────────────────────────────────────────────────────────────────────────────┐ ║   │
│  ║ │                         AI OPPORTUNITY LAYER                                │ ║   │
│  ║ │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │ ║   │
│  ║ │  │ AI_SUITABILITY   │  │ AI_OPPORTUNITIES │  │ AI_USE_CASES     │         │ ║   │
│  ║ │  │                  │  │                  │  │                  │         │ ║   │
│  ║ │  │ • rag_score      │  │ • opportunity_id │  │ • service_layer  │         │ ║   │
│  ║ │  │ • summary_score  │  │ • description    │  │   (L1-L4)        │         │ ║   │
│  ║ │  │ • generation     │  │ • roi_estimate   │  │ • agent_ids      │         │ ║   │
│  ║ │  │ • reasoning      │  │ • effort_level   │  │ • capabilities   │         │ ║   │
│  ║ │  └──────────────────┘  └──────────────────┘  └──────────────────┘         │ ║   │
│  ║ └─────────────────────────────────────────────────────────────────────────────┘ ║   │
│  ╚═════════════════════════════════════════════════════════════════════════════════╝   │
│             │                     │                     │                               │
│             ▼                     ▼                     ▼                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │ L2: PERSONA                                                                      │   │
│  │ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │   │
│  │ │    Personas     │  │   Archetypes    │  │  Work Ratios    │◄──── User        │   │
│  │ │  (Behavioral)   │  │ (AUTO/ORCH/etc) │  │  (proj/bau %)   │       Context    │   │
│  │ └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                   │   │
│  └──────────│─────────────────────│─────────────────────│──────────────────────────┘   │
│             │                     │                     │                               │
│             ▼                     ▼                     ▼                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │ L1: ORGANIZATIONAL                                                               │   │
│  │ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │   │
│  │ │   Functions     │  │  Departments    │  │     Roles       │◄──── Org         │   │
│  │ │                 │  │                 │  │                 │       Structure  │   │
│  │ └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                   │   │
│  └──────────│─────────────────────│─────────────────────│──────────────────────────┘   │
│             │                     │                     │                               │
│             ▼                     ▼                     ▼                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │ L0: DOMAIN                                                                       │   │
│  │ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │   │
│  │ │   Industries    │  │   Geographies   │  │    Tenants      │◄──── Context     │   │
│  │ │                 │  │                 │  │                 │       Foundation │   │
│  │ └─────────────────┘  └─────────────────┘  └─────────────────┘                   │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 10.4 Data Flow Diagram: ODI → OKR → Value

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              ODI → OKR DATA FLOW                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                         1. DISCOVERY PHASE (L3)                                  │   │
│  │                                                                                  │   │
│  │   User Research          JTBD Mapping           ODI Assessment                  │   │
│  │   ┌──────────┐          ┌──────────┐          ┌──────────────────┐             │   │
│  │   │ Surveys  │ ───────► │  JTBD    │ ───────► │ jtbd_outcomes    │             │   │
│  │   │Interview │          │  Core    │          │  • importance    │             │   │
│  │   │ Analytics│          │  Table   │          │  • satisfaction  │             │   │
│  │   └──────────┘          └──────────┘          │  • opp_score ★   │             │   │
│  │                                                └────────┬─────────┘             │   │
│  │                                                         │                        │   │
│  │                                                         │ (high opp_score)       │   │
│  │                                                         ▼                        │   │
│  │                                     ┌──────────────────────────────────┐        │   │
│  │                                     │  Friction Layer                  │        │   │
│  │                                     │  ┌────────────┐ ┌────────────┐  │        │   │
│  │                                     │  │pain_points │ │ obstacles  │  │        │   │
│  │                                     │  └────────────┘ └────────────┘  │        │   │
│  │                                     │  ┌────────────┐                 │        │   │
│  │                                     │  │constraints │                 │        │   │
│  │                                     │  └────────────┘                 │        │   │
│  │                                     └───────────────┬──────────────────┘        │   │
│  └─────────────────────────────────────────────────────│───────────────────────────┘   │
│                                                        │                               │
│                                                        ▼                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                        2. PRIORITIZATION PHASE (L3→L4)                           │   │
│  │                                                                                  │   │
│  │   ┌───────────────────────────────────────────────────────────────────────┐    │   │
│  │   │                     AI SUITABILITY ASSESSMENT                          │    │   │
│  │   │                                                                        │    │   │
│  │   │   High ODI Opportunity    AI Score Analysis     Intervention Decision │    │   │
│  │   │   ┌──────────────┐       ┌──────────────┐       ┌──────────────┐     │    │   │
│  │   │   │ opp_score>12 │ ────► │ rag: 0.9     │ ────► │ AUTOMATE     │     │    │   │
│  │   │   │ "underserved"│       │ summary: 0.8 │       │ ai_opp_001   │     │    │   │
│  │   │   └──────────────┘       │ reason: 0.7  │       └──────┬───────┘     │    │   │
│  │   │                          └──────────────┘              │             │    │   │
│  │   └────────────────────────────────────────────────────────│─────────────┘    │   │
│  │                                                            │                   │   │
│  └────────────────────────────────────────────────────────────│───────────────────┘   │
│                                                               │                       │
│                                                               ▼                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                         3. STRATEGY ALIGNMENT PHASE (L8)                         │   │
│  │                                                                                  │   │
│  │   ┌───────────────────────────────────────────────────────────────────────┐    │   │
│  │   │                        OKR CREATION & LINKAGE                          │    │   │
│  │   │                                                                        │    │   │
│  │   │   Strategic Pillar        OKR                      Key Result         │    │   │
│  │   │   ┌──────────────┐       ┌──────────────┐       ┌──────────────────┐ │    │   │
│  │   │   │ SP02:        │ ────► │ "Reduce time │ ────► │ KR1: 50% faster  │ │    │   │
│  │   │   │ Operational  │       │  to insight  │       │                  │ │    │   │
│  │   │   │ Efficiency   │       │  by 50%"     │       │ odi_outcome_id:  │ │    │   │
│  │   │   └──────────────┘       └──────────────┘       │ ★ LINKED ★       │ │    │   │
│  │   │                                                 └─────────┬────────┘ │    │   │
│  │   │                                                           │          │    │   │
│  │   │                      ┌────────────────────────────────────┘          │    │   │
│  │   │                      │                                               │    │   │
│  │   │                      ▼                                               │    │   │
│  │   │   ┌──────────────────────────────────────────────────────────┐      │    │   │
│  │   │   │ okr_ai_opportunity_mapping                                │      │    │   │
│  │   │   │ • okr_id: OKR-Q1-001                                     │      │    │   │
│  │   │   │ • ai_opportunity_id: ai_opp_001                          │      │    │   │
│  │   │   │ • is_critical_path: true                                 │      │    │   │
│  │   │   └──────────────────────────────────────────────────────────┘      │    │   │
│  │   └────────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                              │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                               │                       │
│                                                               ▼                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                         4. EXECUTION & MEASUREMENT (L5-L7)                       │   │
│  │                                                                                  │   │
│  │   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐                   │   │
│  │   │ L5: Execute │ ────► │ L6: Measure │ ────► │ L7: Value   │                   │   │
│  │   │ Workflow    │       │ KPIs        │       │ Realized    │                   │   │
│  │   └─────────────┘       └─────────────┘       └──────┬──────┘                   │   │
│  │                                                      │                           │   │
│  │                                                      │                           │   │
│  │                                                      ▼                           │   │
│  │                              ┌───────────────────────────────────────────┐      │   │
│  │                              │ FEEDBACK LOOP (Update ODI Scores)         │      │   │
│  │                              │                                           │      │   │
│  │                              │ • Re-survey satisfaction_score            │      │   │
│  │                              │ • Recalculate opportunity_score           │      │   │
│  │                              │ • Identify new high-priority outcomes     │      │   │
│  │                              │                                           │      │   │
│  │                              │       ★ CLOSES THE LOOP TO PHASE 1 ★      │      │   │
│  │                              └───────────────────────────────────────────┘      │   │
│  │                                                                                  │   │
│  └──────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 10.5 ODI → OKR Linkage Summary

| ODI Component | OKR Link Point | Purpose |
|---------------|----------------|---------|
| `jtbd_outcomes.opportunity_score` | Informs OKR Objective prioritization | High opp_score → strategic priority |
| `jtbd_outcomes.id` | `key_result.odi_outcome_id` | Direct KR → Outcome tracking |
| `jtbd_pain_points` | AI Opportunity identification | Pain → Automation opportunity |
| `jtbd_obstacles` | Initiative/Project planning | Obstacle removal = Key Result |
| `ai_opportunities` | `okr_ai_opportunity_mapping` | AI investment → OKR alignment |
| `jtbd_ai_suitability` | Service layer routing | Determines L1/L2/L3/L4 routing |

---

## 11. Migration Script

```sql
-- ================================================================
-- MIGRATION: JTBD Work Pattern & OKR Enrichment
-- Version: 3.1
-- Date: 2024-11-29
-- ================================================================

BEGIN;

-- Phase 1: Add work_pattern to JTBD
ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  work_pattern TEXT NOT NULL DEFAULT 'bau'
  CHECK (work_pattern IN ('project', 'bau', 'mixed'));

ALTER TABLE jtbd ADD COLUMN IF NOT EXISTS
  ai_focus TEXT DEFAULT 'mixed'
  CHECK (ai_focus IN ('automation', 'augmentation', 'mixed'));

-- Phase 2: Create reference tables
-- (ref_project_phases, ref_bau_cadences, ref_archetypes)
-- [See sections 3.1, 4.1, 7.2 above]

-- Phase 3: Create OKR tables
-- (okr, key_result, okr_jtbd_mapping, okr_ai_opportunity_mapping)
-- [See section 5 above]

-- Phase 4: Add persona work ratios
ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  project_work_ratio NUMERIC(3,2) DEFAULT 0.50;

ALTER TABLE personas ADD COLUMN IF NOT EXISTS
  bau_work_ratio NUMERIC(3,2) DEFAULT 0.50;

-- Phase 5: Create functions and triggers
-- (compute_persona_work_ratios, infer_persona_archetype)
-- [See section 6 above]

-- Phase 6: Create views
-- (v_okr_jtbd_alignment)
-- [See section 9 above]

COMMIT;
```

---

## 11. Table Summary

### New Tables Added

| Table | Purpose | Records Expected |
|-------|---------|------------------|
| `ref_project_phases` | Standard project phases (PMBOK) | 5 |
| `ref_bau_cadences` | Standard BAU cadences (ITIL) | 8 |
| `ref_archetypes` | Persona archetype definitions | 4 |
| `jtbd_project_phases` | JTBD → Project phase mapping | ~500 |
| `jtbd_bau_cadences` | JTBD → BAU cadence mapping | ~1,000 |
| `okr` | Objectives | ~50-100/quarter |
| `key_result` | Key Results | ~150-300/quarter |
| `okr_jtbd_mapping` | OKR → JTBD alignment | ~500-1,000 |
| `okr_ai_opportunity_mapping` | OKR → AI Opportunity alignment | ~200-500 |

### Modified Tables

| Table | Changes |
|-------|---------|
| `jtbd` | Added `work_pattern`, `ai_focus` |
| `personas` | Added `project_work_ratio`, `bau_work_ratio` |

---

## 12. Usage Examples

### Find BAU JTBDs for Automation

```sql
SELECT j.code, j.name, j.frequency, ais.automation_score
FROM jtbd j
JOIN jtbd_ai_suitability ais ON j.id = ais.jtbd_id
WHERE j.work_pattern = 'bau'
  AND ais.automation_score > 0.7
ORDER BY ais.automation_score DESC;
```

### Find Project JTBDs Aligned to Active OKRs

```sql
SELECT j.code, j.name, o.objective, ojm.contribution_weight
FROM jtbd j
JOIN okr_jtbd_mapping ojm ON j.id = ojm.jtbd_id
JOIN okr o ON ojm.okr_id = o.id
WHERE j.work_pattern = 'project'
  AND o.status = 'active'
  AND o.timeframe = 'Q1-2025';
```

### Get Persona Archetypes Based on Work Mix

```sql
SELECT
  p.name,
  p.project_work_ratio,
  p.bau_work_ratio,
  p.ai_readiness_score,
  infer_persona_archetype(p.project_work_ratio, p.ai_readiness_score) AS inferred_archetype
FROM personas p
WHERE p.tenant_id = 'your-tenant-id';
```

---

**Status**: ✅ Production-Ready Extension
**Version**: 3.1
**Last Updated**: November 29, 2024
