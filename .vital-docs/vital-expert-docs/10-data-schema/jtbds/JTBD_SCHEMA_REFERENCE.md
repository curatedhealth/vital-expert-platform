# JTBD (Jobs To Be Done) Schema Reference

**Date:** 2025-11-19
**Tenant ID:** `f7aa6fd4-0af9-4706-8b31-034f1f7accda`

---

## Overview

The JTBD schema supports **two complementary approaches** for collecting and analyzing Jobs-To-Be-Done:

1. **Organizational Mapping Approach** - Maps JTBDs through organizational hierarchy
2. **Outcome-Driven Innovation (ODI) Approach** - Quantifies opportunities through outcome scoring

---

## Approach 1: Organizational Hierarchy Mapping

Maps JTBDs through the complete organizational structure for contextual relevance.

### Hierarchy Visualization

```
Industry (Pharmaceuticals, Digital Health, Payers)
    ↓
Function (Medical Affairs, Commercial, Regulatory, R&D)
    ↓
Department (Market Access, KOL Management, Medical Information)
    ↓
Role (VP Market Access, Medical Director, HEOR Director)
    ↓
Persona (Sarah Chen - VP Pricing, Dr. James Liu - Medical Director)
    ↓
JTBD (PHARMA_MA_RWE_001, PHARMA_COM_HTA_001)
```

### Key Tables for Org Mapping

| Table | Purpose |
|-------|---------|
| `industries` | Industry classification (Pharma, Digital Health, Payers) |
| `org_functions` | Business functions within tenant |
| `org_departments` | Departments within functions |
| `org_roles` | Role definitions with reporting structure |
| `personas` | Persona profiles linked to function/department/role |
| `jobs_to_be_done` | Core JTBD records |
| `jtbd_personas` | Junction: JTBD ↔ Persona mappings |

### JTBD Code Pattern

```
{INDUSTRY}_{FUNCTION}_{CATEGORY}_{NUMBER}

Examples:
- PHARMA_MA_SI_001    → Pharmaceuticals, Medical Affairs, Scientific Intelligence
- PHARMA_COM_HTA_001  → Pharmaceuticals, Commercial, HTA Dossier
- CROSS_HR_TALENT_001 → Cross-Industry, HR, Talent Acquisition
```

### Current Org Mapping Data

| Metric | Count |
|--------|-------|
| Total JTBDs | 10 |
| JTBDs with Industry Mapping | 9 (90%) |
| JTBDs with Function Mapping | 9 (90%) |
| Total JTBD-Persona Mappings | 26 |
| Unique Personas Mapped | 13 |

### By Function

| Function | JTBDs | Persona Mappings |
|----------|-------|------------------|
| Medical Affairs | 4 | 11 |
| Commercial | 5 | 14 |
| HR (Cross-industry) | 1 | 0 |

---

## Approach 2: Outcome-Driven Innovation (ODI)

Quantifies opportunities by measuring importance vs. satisfaction for each outcome.

### ODI Framework Visualization

```
JTBD
    ↓
Outcomes (What they want to achieve)
    ↓
┌─────────────────────────────────────────────────┐
│  Importance Score (0-10)                        │
│       How important is this outcome?            │
│                     +                           │
│  Satisfaction Score (0-10)                      │
│       How well served is this outcome today?    │
│                     =                           │
│  Opportunity Score                              │
│       importance + MAX(importance - satisfaction, 0)  │
└─────────────────────────────────────────────────┘
    ↓
Opportunity Priority
    - HIGH (>12): Underserved, high-value opportunity
    - MEDIUM (8-12): Moderate opportunity
    - LOW (<8): Adequately served
```

### ODI Outcome Types

| Type | Description | Example Statement |
|------|-------------|-------------------|
| `speed` | Time to complete | "Minimize time to finalize contract terms" |
| `stability` | Consistency/reliability | "Minimize variation in data quality" |
| `output` | Quality of result | "Maximize accuracy of forecasts" |
| `cost` | Resource efficiency | "Minimize cost of evidence generation" |
| `risk` | Risk reduction | "Minimize risk of regulatory rejection" |

### Key Tables for ODI

| Table | Purpose |
|-------|---------|
| `jtbd_outcomes` | Measurable outcomes with ODI scoring |
| `jtbd_obstacles` | Pain points and blockers |
| `jtbd_constraints` | Limitations and boundaries |
| `jtbd_value_drivers` | Quantified value creation |
| `jtbd_kpis` | Key performance indicators |
| `jtbd_success_criteria` | Success measures |

### Current ODI Data State

| Table | Records | Status |
|-------|---------|--------|
| `jtbd_outcomes` | 0 | ⚠️ Empty - needs population |
| `jtbd_obstacles` | 0 | ⚠️ Empty |
| `jtbd_constraints` | 0 | ⚠️ Empty |
| `jtbd_value_drivers` | 0 | ⚠️ Empty |
| `jtbd_kpis` | 0 | ⚠️ Empty |

---

## Combined View: Complete JTBD Context

```
┌─────────────────────────────────────────────────────────────┐
│                    ORGANIZATIONAL CONTEXT                    │
├─────────────────────────────────────────────────────────────┤
│  Industry → Function → Department → Role → Persona          │
│                           ↓                                  │
│                         JTBD                                 │
│                           ↓                                  │
├─────────────────────────────────────────────────────────────┤
│                     ODI ANALYSIS                             │
├─────────────────────────────────────────────────────────────┤
│  Outcomes (importance + satisfaction = opportunity)          │
│  Obstacles (pain points, severity)                          │
│  Constraints (regulatory, budget, technical)                │
│  Value Drivers (quantified impact)                          │
│  Workflow Stages (process breakdown)                        │
│                           ↓                                  │
├─────────────────────────────────────────────────────────────┤
│                   GEN AI OPPORTUNITIES                       │
├─────────────────────────────────────────────────────────────┤
│  Automation Potential → Use Cases → ROI Estimate            │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Table: `jobs_to_be_done`

**Purpose:** Central table storing the main JTBD records

### Key Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `tenant_id` | uuid | Multi-tenancy isolation |
| `code` | text | Unique JTBD identifier (e.g., "JTBD-MA-001") |
| `name` | text | JTBD name |
| `description` | text | Detailed description |
| `functional_area` | enum | medical_affairs, market_access, regulatory, commercial, etc. |
| `job_category` | enum | strategic, operational, tactical |
| `complexity` | enum | low, medium, high, very_high |
| `frequency` | enum | daily, weekly, monthly, quarterly, annually |
| `success_criteria` | text[] | Array of success criteria |
| `kpis` | jsonb | JSON of KPI definitions |
| `pain_points` | jsonb | JSON of pain point objects |
| `desired_outcomes` | jsonb | JSON of outcome objects |
| `status` | enum | draft, active, archived, deprecated |
| `validation_score` | numeric(3,2) | 0.00 to 1.00 |

### Enums

```sql
-- functional_area_type
'medical_affairs', 'market_access', 'regulatory_affairs', 'commercial',
'clinical_development', 'research', 'manufacturing', 'quality', 'supply_chain'

-- job_category_type
'strategic', 'operational', 'tactical'

-- complexity_type
'low', 'medium', 'high', 'very_high'

-- frequency_type
'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'ad_hoc'

-- jtbd_status
'draft', 'active', 'under_review', 'archived', 'deprecated'
```

---

## Junction Tables

### 1. `jtbd_personas` - Persona Mappings

**Purpose:** Links JTBDs to relevant personas with relevance scoring

```sql
CREATE TABLE jtbd_personas (
    id uuid PRIMARY KEY,
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    persona_id uuid NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    relevance_score numeric(3,2) NOT NULL CHECK (relevance_score BETWEEN 0 AND 1),
    is_primary boolean DEFAULT false,
    notes text,
    mapping_source mapping_source_type DEFAULT 'manual',
    UNIQUE(jtbd_id, persona_id)
);
```

**mapping_source_type:** `'manual'`, `'ai_generated'`, `'hybrid'`

### 2. `jtbd_outcomes` - ODI Outcomes

**Purpose:** Defines measurable outcomes using Outcome-Driven Innovation (ODI) framework

```sql
CREATE TABLE jtbd_outcomes (
    id uuid PRIMARY KEY,
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id),
    tenant_id uuid NOT NULL,
    outcome_id text NOT NULL,  -- e.g., "OUT-001"
    outcome_statement text NOT NULL,  -- "Minimize time to complete X"
    outcome_type text CHECK (outcome_type IN ('speed', 'stability', 'output', 'cost', 'risk')),
    importance_score numeric(3,1) CHECK (importance_score BETWEEN 0 AND 10),
    satisfaction_score numeric(3,1) CHECK (satisfaction_score BETWEEN 0 AND 10),
    opportunity_score numeric(4,1) GENERATED ALWAYS AS (
        importance_score + GREATEST(importance_score - satisfaction_score, 0)
    ),
    opportunity_priority text GENERATED ALWAYS AS (
        CASE
            WHEN opportunity_score > 12 THEN 'high'
            WHEN opportunity_score >= 8 THEN 'medium'
            ELSE 'low'
        END
    ),
    evidence_source text,
    sequence_order integer DEFAULT 1,
    UNIQUE(jtbd_id, outcome_id)
);
```

**Opportunity Score Formula:** `importance + MAX(importance - satisfaction, 0)`

### 3. `jtbd_obstacles` - Pain Points & Blockers

```sql
CREATE TABLE jtbd_obstacles (
    id uuid PRIMARY KEY,
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id),
    tenant_id uuid NOT NULL,
    obstacle_text text NOT NULL,
    obstacle_type text CHECK (obstacle_type IN ('technical', 'resource', 'process', 'political', 'knowledge')),
    severity text CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);
```

### 4. `jtbd_constraints` - Limitations & Boundaries

```sql
CREATE TABLE jtbd_constraints (
    id uuid PRIMARY KEY,
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id),
    tenant_id uuid NOT NULL,
    constraint_text text NOT NULL,
    constraint_type text CHECK (constraint_type IN ('regulatory', 'budget', 'technical', 'resource', 'time')),
    impact text CHECK (impact IN ('low', 'medium', 'high', 'critical'))
);
```

### 5. `jtbd_workflow_stages` - Process Stages

```sql
CREATE TABLE jtbd_workflow_stages (
    id uuid PRIMARY KEY,
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id),
    tenant_id uuid NOT NULL,
    stage_number integer NOT NULL,
    stage_name text NOT NULL,
    stage_description text NOT NULL,
    typical_duration text,  -- e.g., "2-4 weeks"
    key_activities text[],
    pain_points text[],
    UNIQUE(jtbd_id, stage_number)
);
```

### 6. `jtbd_competitive_alternatives` - Current Solutions

```sql
CREATE TABLE jtbd_competitive_alternatives (
    id uuid PRIMARY KEY,
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id),
    tenant_id uuid NOT NULL,
    alternative_name text NOT NULL,
    description text NOT NULL,
    strengths text[],
    weaknesses text[]
);
```

### 7. `jtbd_value_drivers` - Value Proposition

```sql
CREATE TABLE jtbd_value_drivers (
    id uuid PRIMARY KEY,
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id),
    tenant_id uuid NOT NULL,
    value_description text NOT NULL,
    quantified_impact text NOT NULL,  -- e.g., "Save 10 hours per week"
    beneficiary text NOT NULL  -- Who benefits
);
```

### 8. `jtbd_solution_requirements` - Solution Needs

```sql
CREATE TABLE jtbd_solution_requirements (
    id uuid PRIMARY KEY,
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id),
    tenant_id uuid NOT NULL,
    requirement_text text NOT NULL,
    requirement_category text CHECK (requirement_category IN ('functional', 'technical', 'operational', 'compliance')),
    priority text CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);
```

### 9. `jtbd_gen_ai_opportunities` - AI Potential

```sql
CREATE TABLE jtbd_gen_ai_opportunities (
    id uuid PRIMARY KEY,
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) UNIQUE,
    tenant_id uuid NOT NULL,
    automation_potential_score numeric(3,1) CHECK (automation_potential_score BETWEEN 0 AND 10),
    augmentation_potential_score numeric(3,1) CHECK (augmentation_potential_score BETWEEN 0 AND 10),
    total_estimated_value text,  -- e.g., "$500K annually"
    implementation_complexity text CHECK (implementation_complexity IN ('low', 'medium', 'high', 'very_high')),
    time_to_value text,  -- e.g., "3-6 months"
    key_ai_capabilities text[],  -- e.g., ['NLP', 'Document Analysis', 'Predictive Analytics']
    recommended_approach text,
    risks text[],
    mitigation_strategies text[]
);
```

### 10. `jtbd_gen_ai_use_cases` - Specific AI Applications

```sql
CREATE TABLE jtbd_gen_ai_use_cases (
    id uuid PRIMARY KEY,
    gen_ai_opportunity_id uuid NOT NULL REFERENCES jtbd_gen_ai_opportunities(id),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id),
    tenant_id uuid NOT NULL,
    use_case_id text NOT NULL,
    use_case_name text NOT NULL,
    use_case_description text NOT NULL,
    ai_technology text NOT NULL,  -- e.g., "Large Language Models"
    specific_capability text NOT NULL,  -- e.g., "Document summarization"
    time_savings text,
    quality_improvement text,
    estimated_cost text,
    roi_estimate text,
    sequence_order integer DEFAULT 1,
    UNIQUE(jtbd_id, use_case_id)
);
```

### 11. `jtbd_evidence_sources` - Research & Data

```sql
CREATE TABLE jtbd_evidence_sources (
    id uuid PRIMARY KEY,
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id),
    tenant_id uuid NOT NULL,
    source_type text CHECK (source_type IN ('primary_research', 'secondary_research', 'expert_interview', 'industry_report', 'survey_data', 'case_study')),
    citation text NOT NULL,
    key_finding text NOT NULL,
    sample_size integer,
    methodology text,
    publication_date date,
    confidence_level text CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high')),
    url text
);
```

### 12. `capability_jtbd_mapping` - Capability Links

```sql
CREATE TABLE capability_jtbd_mapping (
    id uuid PRIMARY KEY,
    capability_id uuid NOT NULL REFERENCES capabilities(id),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id),
    relevance_score numeric(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
    is_required boolean DEFAULT false,
    UNIQUE(capability_id, jtbd_id)
);
```

---

## Relationships Diagram

```
jobs_to_be_done (Core)
    │
    ├── ORGANIZATIONAL CONTEXT
    │   ├── industry_id → industries
    │   ├── org_function_id → org_functions
    │   └── jtbd_personas → personas (Many-to-Many)
    │
    ├── ODI ANALYSIS
    │   ├── jtbd_outcomes (One-to-Many)
    │   ├── jtbd_obstacles (One-to-Many)
    │   ├── jtbd_constraints (One-to-Many)
    │   ├── jtbd_value_drivers (One-to-Many)
    │   └── jtbd_workflow_stages (One-to-Many, ordered)
    │
    ├── MARKET CONTEXT
    │   ├── jtbd_competitive_alternatives (One-to-Many)
    │   ├── jtbd_evidence_sources (One-to-Many)
    │   └── jtbd_solution_requirements (One-to-Many)
    │
    ├── GEN AI STRATEGY
    │   └── jtbd_gen_ai_opportunities (One-to-One)
    │       └── jtbd_gen_ai_use_cases (One-to-Many)
    │
    └── CAPABILITY MAPPING
        └── capability_jtbd_mapping → capabilities (Many-to-Many)
```

---

## Example Queries

### 1. Get Complete JTBD with Org Context and ODI Data

```sql
WITH tenant AS (SELECT 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AS id)
SELECT
    j.code,
    j.name,
    j.functional_area,
    j.job_category,
    j.complexity,
    j.status,

    -- Persona mappings (Org Context)
    COUNT(DISTINCT jp.persona_id) as mapped_personas,
    ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.id IS NOT NULL) as persona_names,

    -- Outcomes (ODI)
    COUNT(DISTINCT jo.id) as outcome_count,
    ROUND(AVG(jo.opportunity_score), 1) as avg_opportunity_score,

    -- Obstacles
    COUNT(DISTINCT jbs.id) as obstacle_count,

    -- Gen AI
    ago.automation_potential_score,
    ago.augmentation_potential_score,
    COUNT(DISTINCT juc.id) as ai_use_case_count

FROM jobs_to_be_done j
CROSS JOIN tenant t
LEFT JOIN jtbd_personas jp ON jp.jtbd_id = j.id
LEFT JOIN personas p ON p.id = jp.persona_id
LEFT JOIN jtbd_outcomes jo ON jo.jtbd_id = j.id
LEFT JOIN jtbd_obstacles jbs ON jbs.jtbd_id = j.id
LEFT JOIN jtbd_gen_ai_opportunities ago ON ago.jtbd_id = j.id
LEFT JOIN jtbd_gen_ai_use_cases juc ON juc.jtbd_id = j.id
WHERE j.tenant_id = t.id
  AND j.deleted_at IS NULL
GROUP BY j.id, j.code, j.name, j.functional_area, j.job_category,
         j.complexity, j.status, ago.automation_potential_score,
         ago.augmentation_potential_score
ORDER BY j.code;
```

### 2. Find High-Opportunity Outcomes (ODI Analysis)

```sql
SELECT
    j.code,
    j.name,
    jo.outcome_statement,
    jo.outcome_type,
    jo.importance_score,
    jo.satisfaction_score,
    jo.opportunity_score,
    jo.opportunity_priority,
    jo.evidence_source
FROM jtbd_outcomes jo
JOIN jobs_to_be_done j ON j.id = jo.jtbd_id
WHERE jo.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
  AND jo.opportunity_priority = 'high'
ORDER BY jo.opportunity_score DESC;
```

### 3. Get JTBDs by Organizational Hierarchy

```sql
SELECT
    i.industry_name,
    f.name as function_name,
    d.name as department_name,
    r.name as role_name,
    p.name as persona_name,
    j.code as jtbd_code,
    j.name as jtbd_name,
    jp.relevance_score
FROM jobs_to_be_done j
JOIN jtbd_personas jp ON jp.jtbd_id = j.id
JOIN personas p ON p.id = jp.persona_id
JOIN org_roles r ON r.id = p.role_id
JOIN org_departments d ON d.id = p.department_id
JOIN org_functions f ON f.id = p.function_id
LEFT JOIN industries i ON i.id = j.industry_id
WHERE j.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
ORDER BY i.industry_name, f.name, d.name, r.name, p.name;
```

### 4. Coverage Analysis (Both Approaches)

```sql
WITH jtbd_coverage AS (
    SELECT
        j.id as jtbd_id,
        j.code,
        j.name,
        j.functional_area,
        -- Org mapping coverage
        j.industry_id IS NOT NULL as has_industry,
        COUNT(DISTINCT jp.persona_id) as persona_count,
        -- ODI coverage
        EXISTS(SELECT 1 FROM jtbd_outcomes WHERE jtbd_id = j.id) as has_outcomes,
        EXISTS(SELECT 1 FROM jtbd_obstacles WHERE jtbd_id = j.id) as has_obstacles,
        EXISTS(SELECT 1 FROM jtbd_constraints WHERE jtbd_id = j.id) as has_constraints,
        EXISTS(SELECT 1 FROM jtbd_workflow_stages WHERE jtbd_id = j.id) as has_workflow,
        EXISTS(SELECT 1 FROM jtbd_value_drivers WHERE jtbd_id = j.id) as has_value_drivers,
        EXISTS(SELECT 1 FROM jtbd_gen_ai_opportunities WHERE jtbd_id = j.id) as has_gen_ai,
        EXISTS(SELECT 1 FROM jtbd_evidence_sources WHERE jtbd_id = j.id) as has_evidence
    FROM jobs_to_be_done j
    LEFT JOIN jtbd_personas jp ON jp.jtbd_id = j.id
    WHERE j.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND j.deleted_at IS NULL
    GROUP BY j.id
)
SELECT
    code,
    name,
    -- Org mapping score
    CASE WHEN has_industry THEN 1 ELSE 0 END +
    CASE WHEN persona_count > 0 THEN 1 ELSE 0 END as org_mapping_score,
    -- ODI score
    CASE WHEN has_outcomes THEN 1 ELSE 0 END +
    CASE WHEN has_obstacles THEN 1 ELSE 0 END +
    CASE WHEN has_constraints THEN 1 ELSE 0 END +
    CASE WHEN has_workflow THEN 1 ELSE 0 END +
    CASE WHEN has_value_drivers THEN 1 ELSE 0 END as odi_score,
    -- Total completeness
    ROUND(100.0 * (
        CASE WHEN has_industry THEN 1 ELSE 0 END +
        CASE WHEN persona_count > 0 THEN 1 ELSE 0 END +
        CASE WHEN has_outcomes THEN 1 ELSE 0 END +
        CASE WHEN has_obstacles THEN 1 ELSE 0 END +
        CASE WHEN has_constraints THEN 1 ELSE 0 END +
        CASE WHEN has_workflow THEN 1 ELSE 0 END +
        CASE WHEN has_value_drivers THEN 1 ELSE 0 END +
        CASE WHEN has_gen_ai THEN 1 ELSE 0 END +
        CASE WHEN has_evidence THEN 1 ELSE 0 END
    ) / 9.0, 1) as completeness_pct
FROM jtbd_coverage
ORDER BY completeness_pct DESC, code;
```

---

## Data Quality Guidelines

### Validation Score (0.00 - 1.00)
- **0.85+** = Well-validated with evidence
- **0.70-0.84** = Partially validated
- **< 0.70** = Needs more validation

### Relevance Score (0.00 - 1.00)
- **0.90-1.00** = Primary persona, directly responsible
- **0.70-0.89** = Secondary persona, frequently involved
- **0.50-0.69** = Tertiary persona, occasionally involved
- **< 0.50** = Minimal relevance

### Opportunity Score Formula (ODI)
```
opportunity_score = importance_score + MAX(importance_score - satisfaction_score, 0)
```

- **> 12** = High priority opportunity (underserved outcomes)
- **8-12** = Medium priority
- **< 8** = Low priority (adequately served)

---

## Next Steps for JTBD Collection

### Phase 1: Organizational Context (Current: 90% Complete)
1. ✅ Map JTBDs to industries
2. ✅ Map JTBDs to functions
3. ✅ Create persona mappings
4. ⚠️ Add more personas and JTBDs

### Phase 2: ODI Analysis (Current: 0% Complete)
1. **jtbd_outcomes** - Define measurable success criteria using ODI framework
2. **jtbd_obstacles** - Document pain points and blockers
3. **jtbd_workflow_stages** - Break down the job into stages
4. **jtbd_value_drivers** - Quantify value creation
5. **jtbd_constraints** - Document limitations

### Phase 3: Market Context
1. **jtbd_competitive_alternatives** - Current solutions
2. **jtbd_evidence_sources** - Research backing
3. **jtbd_solution_requirements** - Solution specifications

### Phase 4: Gen AI Strategy
1. **jtbd_gen_ai_opportunities** - Assess AI potential
2. **jtbd_gen_ai_use_cases** - Specific AI applications

### Phase 5: Capability Mapping
1. **capability_jtbd_mapping** - Link to organizational capabilities

---

**End of Reference Document**
