# Value Layer Integration Design
**Created:** 2025-12-02
**Status:** 🟡 Design Complete - Ready for Implementation
**Source:** Pharmaceutical Value Driver Tree Framework

---

## Executive Summary

This document defines how **Value Drivers** integrate with the VITAL Enterprise Ontology to enable:
1. **Value Attribution** - Link JTBDs to measurable business outcomes
2. **ROI Quantification** - Calculate AI investment returns
3. **Prioritization** - Focus on highest-value opportunities
4. **Impact Tracking** - Measure realized value over time

---

## Value Driver Code System

### Code Pattern: `VD-{CATEGORY}-{SEQUENCE}`

| Category | Prefix | Description |
|----------|--------|-------------|
| Root | `VD-ROOT-` | Root value driver |
| Revenue | `VD-REV-` | Revenue growth drivers |
| Cost | `VD-CST-` | Cost savings drivers |
| Risk | `VD-RSK-` | Risk reduction drivers |
| Tactic | `VD-TAC-{CAT}-` | Tactical actions |

### Numbering Convention
- **001**: Top-level category
- **010, 020, 030**: Level 2 sub-categories
- **011, 012, 013**: Level 3 under first L2
- **111, 112, 113**: Level 4 detail

---

## Value Driver Hierarchy (with Dedicated Codes)

```
VD-ROOT-001: Sustainable Business
├── VD-REV-001: Revenue Growth
│   ├── VD-REV-010: Increase Volume
│   │   ├── VD-REV-011: Increase Market Size
│   │   │   ├── VD-REV-111: Increase Disease Awareness
│   │   │   ├── VD-REV-112: Increase Diagnostics
│   │   │   └── VD-REV-113: Increase Access to Treatment
│   │   ├── VD-REV-012: Increase Market Share
│   │   │   ├── VD-REV-121: Enhance Medical Efforts
│   │   │   ├── VD-REV-122: Enhance Sales & Marketing
│   │   │   ├── VD-REV-123: Enhance Brand Image
│   │   │   └── VD-REV-124: Enhance HCP Loyalty
│   │   └── VD-REV-013: Increase Length of Therapy
│   │       ├── VD-REV-131: Prove Long-term Efficacy
│   │       ├── VD-REV-132: Develop Patient Support Programs
│   │       └── VD-REV-133: Reduce Product Switch
│   └── VD-REV-020: Increase Product Value
│       ├── VD-REV-021: Build Product Value Story
│       └── VD-REV-022: Offer Additional Services
├── VD-CST-001: Cost Savings
│   ├── VD-CST-010: Improve Medical Operations Efficiency
│   │   ├── VD-CST-011: Automate Literature Review
│   │   ├── VD-CST-012: Streamline Medical Information
│   │   └── VD-CST-013: Optimize KOL Management
│   ├── VD-CST-020: Improve Commercial Operations Efficiency
│   │   ├── VD-CST-021: Automate Sales Reporting
│   │   ├── VD-CST-022: Optimize Marketing Operations
│   │   └── VD-CST-023: Improve Territory Management
│   ├── VD-CST-030: Improve Business Operations Efficiency
│   │   ├── VD-CST-031: Streamline Cross-functional Processes
│   │   └── VD-CST-032: Automate Compliance Monitoring
│   └── VD-CST-040: Improve IT Operations Efficiency
│       ├── VD-CST-041: Optimize Infrastructure Costs
│       └── VD-CST-042: Consolidate Technology Platforms
└── VD-RSK-001: Risk Reduction
    ├── VD-RSK-010: Mitigate Regulatory Risks
    │   ├── VD-RSK-011: Ensure FDA Compliance
    │   ├── VD-RSK-012: Ensure EMA Compliance
    │   └── VD-RSK-013: Monitor Regulatory Changes
    ├── VD-RSK-020: Mitigate Legal Risks
    ├── VD-RSK-030: Minimize Financial Risks
    ├── VD-RSK-040: Reduce Operational Risks
    ├── VD-RSK-050: Mitigate Reputational Risks
    ├── VD-RSK-060: Minimize Environmental Risks
    ├── VD-RSK-070: Mitigate Compliance Risks
    │   ├── VD-RSK-071: Ensure HCP Engagement Compliance
    │   ├── VD-RSK-072: Ensure Promotional Compliance
    │   └── VD-RSK-073: Automate Compliance Monitoring
    ├── VD-RSK-080: Manage Supply Chain Risks
    ├── VD-RSK-090: Reduce Data Protection Risks
    │   ├── VD-RSK-091: Ensure HIPAA Compliance
    │   └── VD-RSK-092: Ensure GDPR Compliance
    └── VD-RSK-100: Protect IP Rights
```

---

## Database Schema Design

### Core Tables

#### 1. value_drivers (Hierarchical Value Tree)
```sql
CREATE TABLE value_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,           -- 'L0', 'L1', 'L1.1', 'L1.1.1', etc.
    name TEXT NOT NULL,                   -- 'Sustainable Business', 'Revenue Growth', etc.
    description TEXT,
    parent_id UUID REFERENCES value_drivers(id),
    level INTEGER NOT NULL,               -- 0, 1, 2, 3, 4, 5
    driver_type TEXT NOT NULL,            -- 'outcome', 'lever', 'tactic'
    value_category TEXT,                  -- 'revenue', 'cost', 'risk'
    unit TEXT,                            -- '$M/y', '%', '#'
    is_quantifiable BOOLEAN DEFAULT true,
    display_order INTEGER,
    tenant_id UUID REFERENCES tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT value_drivers_level_check CHECK (level BETWEEN 0 AND 6),
    CONSTRAINT value_drivers_type_check CHECK (driver_type IN ('outcome', 'lever', 'tactic', 'enabler'))
);

CREATE INDEX idx_value_drivers_parent ON value_drivers(parent_id);
CREATE INDEX idx_value_drivers_code ON value_drivers(code);
CREATE INDEX idx_value_drivers_category ON value_drivers(value_category);
```

#### 2. value_driver_tactics (Leaf-Level Tactics)
```sql
CREATE TABLE value_driver_tactics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    value_driver_id UUID NOT NULL REFERENCES value_drivers(id),
    code TEXT NOT NULL,                   -- 'L1.1.1.1.1', 'L1.1.1.1.2', etc.
    name TEXT NOT NULL,
    description TEXT,
    tactic_type TEXT,                     -- 'data_analytics', 'digital_platform', 'ai_automation'
    ai_enablement_potential TEXT,         -- 'high', 'medium', 'low'
    display_order INTEGER,

    CONSTRAINT value_driver_tactics_unique UNIQUE (value_driver_id, code)
);
```

#### 3. jtbd_value_drivers (JTBD ↔ Value Driver Mapping)
```sql
CREATE TABLE jtbd_value_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jtbd_id UUID NOT NULL REFERENCES jtbd(id),
    value_driver_id UUID NOT NULL REFERENCES value_drivers(id),

    -- Impact Metrics
    contribution_type TEXT NOT NULL,       -- 'direct', 'indirect', 'enabling'
    impact_score NUMERIC(3,1),             -- 1-10 scale
    confidence_level TEXT,                 -- 'high', 'medium', 'low'

    -- Quantification
    estimated_value_pct NUMERIC(5,2),      -- % contribution to driver
    estimated_value_amount NUMERIC(12,2),  -- $ amount if known
    value_unit TEXT,                       -- '$M', '$K', 'hours', 'FTE'

    -- Evidence
    evidence_source TEXT,
    evidence_date DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT jtbd_value_drivers_unique UNIQUE (jtbd_id, value_driver_id),
    CONSTRAINT contribution_type_check CHECK (contribution_type IN ('direct', 'indirect', 'enabling'))
);

CREATE INDEX idx_jtbd_value_drivers_jtbd ON jtbd_value_drivers(jtbd_id);
CREATE INDEX idx_jtbd_value_drivers_driver ON jtbd_value_drivers(value_driver_id);
```

#### 4. function_value_drivers (Function ↔ Value Driver Mapping)
```sql
CREATE TABLE function_value_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    function_id UUID NOT NULL REFERENCES org_functions(id),
    value_driver_id UUID NOT NULL REFERENCES value_drivers(id),

    -- Ownership
    ownership_type TEXT NOT NULL,          -- 'primary', 'supporting', 'consulted'
    accountability_level TEXT,             -- 'accountable', 'responsible', 'contributor'

    -- Target Metrics
    target_contribution_pct NUMERIC(5,2),
    actual_contribution_pct NUMERIC(5,2),

    CONSTRAINT function_value_drivers_unique UNIQUE (function_id, value_driver_id)
);
```

#### 5. value_realization_tracking (Actual Value Captured)
```sql
CREATE TABLE value_realization_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    value_driver_id UUID NOT NULL REFERENCES value_drivers(id),
    jtbd_id UUID REFERENCES jtbd(id),

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Targets vs Actuals
    target_value NUMERIC(12,2),
    actual_value NUMERIC(12,2),
    variance_pct NUMERIC(5,2),

    -- Attribution
    ai_contribution_pct NUMERIC(5,2),      -- % attributed to AI/automation

    -- Metadata
    measurement_method TEXT,
    data_source TEXT,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Value Driver ↔ Function Mapping

### Primary Ownership Matrix

| Value Driver | Medical Affairs | Market Access | Commercial |
|--------------|-----------------|---------------|------------|
| **L1.1.1: Increase Market Size** | 🟢 Primary | 🟡 Supporting | 🟡 Supporting |
| **L1.1.2: Increase Market Share** | 🟡 Supporting | 🟡 Supporting | 🟢 Primary |
| **L1.1.3: Increase Length of Therapy** | 🟢 Primary | 🟡 Supporting | 🟡 Supporting |
| **L1.2: Increase Product Value** | 🟡 Supporting | 🟢 Primary | 🟡 Supporting |
| **L2.1: Medical Ops Efficiency** | 🟢 Primary | - | - |
| **L2.2: Commercial Ops Efficiency** | - | - | 🟢 Primary |
| **L3.1: Regulatory Risk** | 🟢 Primary | 🟡 Supporting | - |
| **L3.7: Compliance Risk** | 🟢 Primary | 🟡 Supporting | 🟡 Supporting |

---

## JTBD ↔ Value Driver Integration Pattern

### Example: Medical Affairs JTBD → Value Driver

```sql
-- JTBD: "Optimize KOL engagement strategy"
-- Maps to: L1.1.2.1 (Enhance Medical Efforts) + L1.1.2.4 (Enhance HCP Loyalty)

INSERT INTO jtbd_value_drivers (jtbd_id, value_driver_id, contribution_type, impact_score, estimated_value_pct)
SELECT
    j.id,
    vd.id,
    'direct',
    8.5,
    15.0
FROM jtbd j, value_drivers vd
WHERE j.code = 'MA-JTBD-015'
AND vd.code = 'L1.1.2.1';
```

### Value Attribution Rules

| JTBD Category | Primary Value Drivers | Contribution Type |
|---------------|----------------------|-------------------|
| **Medical Education** | L1.1.1.1 (Disease Awareness), L1.1.2.1 (Medical Efforts) | Direct |
| **KOL Engagement** | L1.1.2.4 (HCP Loyalty), L1.1.2.1 (Medical Efforts) | Direct |
| **RWE Generation** | L1.1.3.1 (Long-term Efficacy), L1.2.1 (Value Story) | Direct |
| **Market Access Strategy** | L1.2.1 (Value Story), L1.2.2 (Additional Services) | Direct |
| **Pricing & Reimbursement** | L1.2.1 (Value Story) | Direct |
| **Commercial Analytics** | L1.1.2.2 (Sales & Marketing), L2.2 (Commercial Efficiency) | Enabling |
| **HCP Engagement** | L1.1.2.4 (HCP Loyalty) | Direct |
| **Patient Support** | L1.1.3.2 (Patient Programs), L1.1.3.3 (Reduce Switch) | Direct |
| **Compliance** | L3.1 (Regulatory), L3.7 (Compliance) | Enabling |

---

## AI Value Quantification Framework

### Value Categories (6 Types)

```sql
CREATE TYPE value_impact_type AS ENUM (
    'smarter',    -- Better decisions
    'faster',     -- Reduced cycle time
    'better',     -- Improved quality/outcomes
    'efficient',  -- Cost reduction
    'safer',      -- Risk/compliance
    'scalable'    -- Capacity increase
);

CREATE TABLE jtbd_value_impacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jtbd_id UUID NOT NULL REFERENCES jtbd(id),
    impact_type value_impact_type NOT NULL,

    -- Quantification
    baseline_metric NUMERIC,
    target_metric NUMERIC,
    improvement_pct NUMERIC(5,2),

    -- AI Contribution
    ai_automation_pct NUMERIC(5,2),        -- % automatable
    ai_augmentation_pct NUMERIC(5,2),      -- % augmentable

    -- Value Translation
    monetary_value NUMERIC(12,2),
    value_unit TEXT,                        -- '$M/year', 'hours/week', 'FTE saved'

    CONSTRAINT jtbd_value_impacts_unique UNIQUE (jtbd_id, impact_type)
);
```

### Example Value Calculations

| JTBD | Impact Type | Baseline | Target | AI Contribution | Annual Value |
|------|-------------|----------|--------|-----------------|--------------|
| Literature Review | **Faster** | 40 hrs/review | 8 hrs/review | 80% automation | $120K/year |
| HCP Engagement Prep | **Smarter** | 60% relevance | 90% relevance | 50% augmentation | $200K/year |
| Adverse Event Detection | **Safer** | 72hr detection | 4hr detection | 95% automation | $500K/year |
| Market Analysis | **Efficient** | 2 FTE | 0.5 FTE | 75% automation | $180K/year |

---

## Views for Analytics

### v_jtbd_value_summary
```sql
CREATE OR REPLACE VIEW v_jtbd_value_summary AS
SELECT
    j.id AS jtbd_id,
    j.code AS jtbd_code,
    j.name AS jtbd_name,
    j.opportunity_score,
    j.functional_area,

    -- Value Driver Aggregation
    COUNT(DISTINCT jvd.value_driver_id) AS value_driver_count,
    STRING_AGG(DISTINCT vd.value_category, ', ') AS value_categories,

    -- Total Value
    SUM(jvd.estimated_value_amount) AS total_estimated_value,
    AVG(jvd.impact_score) AS avg_impact_score,

    -- AI Impact
    AVG(jvi.ai_automation_pct) AS avg_automation_potential,
    SUM(jvi.monetary_value) AS total_ai_value

FROM jtbd j
LEFT JOIN jtbd_value_drivers jvd ON jvd.jtbd_id = j.id
LEFT JOIN value_drivers vd ON vd.id = jvd.value_driver_id
LEFT JOIN jtbd_value_impacts jvi ON jvi.jtbd_id = j.id
GROUP BY j.id, j.code, j.name, j.opportunity_score, j.functional_area;
```

### v_value_driver_hierarchy
```sql
CREATE OR REPLACE VIEW v_value_driver_hierarchy AS
WITH RECURSIVE driver_tree AS (
    -- Root level
    SELECT
        id, code, name, parent_id, level,
        value_category, driver_type,
        ARRAY[code] AS path,
        name AS full_path
    FROM value_drivers
    WHERE parent_id IS NULL

    UNION ALL

    -- Children
    SELECT
        vd.id, vd.code, vd.name, vd.parent_id, vd.level,
        vd.value_category, vd.driver_type,
        dt.path || vd.code,
        dt.full_path || ' > ' || vd.name
    FROM value_drivers vd
    JOIN driver_tree dt ON vd.parent_id = dt.id
)
SELECT * FROM driver_tree
ORDER BY path;
```

### v_function_value_contribution
```sql
CREATE OR REPLACE VIEW v_function_value_contribution AS
SELECT
    f.name AS function_name,
    vd.value_category,
    COUNT(DISTINCT jvd.jtbd_id) AS jtbd_count,
    SUM(jvd.estimated_value_amount) AS total_value,
    AVG(jvd.impact_score) AS avg_impact
FROM org_functions f
JOIN org_departments d ON d.function_id = f.id
JOIN org_roles r ON r.department_id = d.id
JOIN jtbd_roles jr ON jr.role_id = r.id
JOIN jtbd_value_drivers jvd ON jvd.jtbd_id = jr.jtbd_id
JOIN value_drivers vd ON vd.id = jvd.value_driver_id
GROUP BY f.name, vd.value_category
ORDER BY f.name, total_value DESC;
```

---

## Implementation Plan

### Phase 1: Schema Creation (Week 1)
- [ ] Create `value_drivers` table
- [ ] Create `value_driver_tactics` table
- [ ] Create `jtbd_value_drivers` junction table
- [ ] Create `function_value_drivers` junction table
- [ ] Create `value_realization_tracking` table

### Phase 2: Seed Data (Week 2)
- [ ] Import L0-L3 value driver hierarchy (30+ drivers)
- [ ] Import L4-L5 tactics (80+ tactics)
- [ ] Map functions to value drivers

### Phase 3: JTBD Mapping (Week 3-4)
- [ ] Map Extreme ODI JTBDs (41) to value drivers
- [ ] Map High ODI JTBDs (177) to value drivers
- [ ] Calculate estimated values

### Phase 4: Views & Analytics (Week 4)
- [ ] Create analytical views
- [ ] Build value dashboard queries
- [ ] Generate ROI reports

---

## Files & Locations

### Schema Files (To Be Created)
- `.claude/docs/platform/enterprise_ontology/sql/020_value_drivers_schema.sql`
- `.claude/docs/platform/enterprise_ontology/sql/021_value_drivers_seed.sql`
- `.claude/docs/platform/enterprise_ontology/sql/022_jtbd_value_mapping.sql`
- `.claude/docs/platform/enterprise_ontology/sql/023_value_analytics_views.sql`

### Documentation
- `.claude/docs/platform/enterprise_ontology/value/VALUE_LAYER_INTEGRATION.md` (this file)

---

**Design Status:** 🟢 Complete
**Next Action:** Create SQL schema (020_value_drivers_schema.sql)
