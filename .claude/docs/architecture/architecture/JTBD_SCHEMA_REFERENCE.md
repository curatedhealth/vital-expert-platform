# JTBD (Jobs To Be Done) Schema Reference

**Date:** 2025-11-17
**Tenant ID:** `f7aa6fd4-0af9-4706-8b31-034f1f7accda`

---

## Overview

The JTBD schema consists of **13 interconnected tables** that model the Jobs To Be Done framework with rich contextual data, persona mappings, Gen AI opportunities, and evidence sources.

### Current Data State

| Table | Records | Status |
|-------|---------|--------|
| **jobs_to_be_done** | 10 | ✅ 10 Market Access JTBDs |
| **jtbd_personas** | 10 | ✅ Persona mappings |
| **jtbd_outcomes** | 0 | ⚠️ Empty |
| **jtbd_obstacles** | 0 | ⚠️ Empty |
| **jtbd_constraints** | 0 | ⚠️ Empty |
| **jtbd_workflow_stages** | 0 | ⚠️ Empty |
| **jtbd_competitive_alternatives** | 0 | ⚠️ Empty |
| **jtbd_value_drivers** | 0 | ⚠️ Empty |
| **jtbd_solution_requirements** | 0 | ⚠️ Empty |
| **jtbd_gen_ai_opportunities** | 0 | ⚠️ Empty |
| **jtbd_gen_ai_use_cases** | 0 | ⚠️ Empty |
| **jtbd_evidence_sources** | 0 | ⚠️ Empty |
| **capability_jtbd_mapping** | 0 | ⚠️ Empty |

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

### 2. `jtbd_outcomes` - Success Criteria & Outcomes

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
    opportunity_score numeric(4,1) GENERATED ALWAYS AS (importance_score + GREATEST(importance_score - satisfaction_score, 0)),
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

**Purpose:** Captures specific obstacles and pain points

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

**Purpose:** Documents constraints affecting the job

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

**Purpose:** Breaks down the job into workflow stages

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

**Purpose:** Documents existing solutions and workarounds

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

**Purpose:** Quantifies value creation opportunities

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

**Purpose:** Defines requirements for ideal solution

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

**Purpose:** Assesses Gen AI automation/augmentation potential

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

**Purpose:** Details specific Gen AI use cases for the JTBD

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

**Purpose:** Links JTBDs to evidence and research sources

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

**Purpose:** Maps JTBDs to required organizational capabilities

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
    ├── jtbd_personas → personas (Many-to-Many)
    ├── jtbd_outcomes (One-to-Many)
    ├── jtbd_obstacles (One-to-Many)
    ├── jtbd_constraints (One-to-Many)
    ├── jtbd_workflow_stages (One-to-Many, ordered)
    ├── jtbd_competitive_alternatives (One-to-Many)
    ├── jtbd_value_drivers (One-to-Many)
    ├── jtbd_solution_requirements (One-to-Many)
    ├── jtbd_gen_ai_opportunities (One-to-One)
    │   └── jtbd_gen_ai_use_cases (One-to-Many)
    ├── jtbd_evidence_sources (One-to-Many)
    └── capability_jtbd_mapping → capabilities (Many-to-Many)
```

---

## Example Queries

### 1. Get Complete JTBD with All Related Data

```sql
WITH tenant AS (SELECT 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid AS id)
SELECT
    j.code,
    j.name,
    j.functional_area,
    j.job_category,
    j.complexity,
    j.status,

    -- Persona mappings
    COUNT(DISTINCT jp.persona_id) as mapped_personas,
    ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.id IS NOT NULL) as persona_names,

    -- Outcomes
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

### 2. Find JTBDs by Persona

```sql
SELECT
    p.name as persona_name,
    p.seniority_level,
    j.code as jtbd_code,
    j.name as jtbd_name,
    jp.relevance_score,
    jp.is_primary,
    j.complexity,
    j.functional_area
FROM personas p
JOIN jtbd_personas jp ON jp.persona_id = p.id
JOIN jobs_to_be_done j ON j.id = jp.jtbd_id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
  AND p.function_id = '598c6096-4894-458c-be34-c82e13a743e8'::uuid  -- Commercial
  AND jp.relevance_score >= 0.7
ORDER BY p.name, jp.relevance_score DESC;
```

### 3. Outcome Analysis (Opportunity Scoring)

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
  AND j.functional_area = 'Market Access'
ORDER BY jo.opportunity_score DESC;
```

### 4. Gen AI Opportunity Analysis

```sql
SELECT
    j.code,
    j.name,
    j.complexity,
    ago.automation_potential_score,
    ago.augmentation_potential_score,
    ago.total_estimated_value,
    ago.implementation_complexity,
    ago.time_to_value,
    ago.key_ai_capabilities,
    COUNT(juc.id) as use_case_count
FROM jobs_to_be_done j
JOIN jtbd_gen_ai_opportunities ago ON ago.jtbd_id = j.id
LEFT JOIN jtbd_gen_ai_use_cases juc ON juc.gen_ai_opportunity_id = ago.id
WHERE ago.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
GROUP BY j.code, j.name, j.complexity, ago.automation_potential_score,
         ago.augmentation_potential_score, ago.total_estimated_value,
         ago.implementation_complexity, ago.time_to_value, ago.key_ai_capabilities
ORDER BY (ago.automation_potential_score + ago.augmentation_potential_score) DESC;
```

### 5. Workflow Analysis

```sql
SELECT
    j.code,
    j.name,
    ws.stage_number,
    ws.stage_name,
    ws.typical_duration,
    ARRAY_LENGTH(ws.key_activities, 1) as activity_count,
    ARRAY_LENGTH(ws.pain_points, 1) as pain_point_count
FROM jobs_to_be_done j
JOIN jtbd_workflow_stages ws ON ws.jtbd_id = j.id
WHERE ws.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
  AND j.functional_area = 'Market Access'
ORDER BY j.code, ws.stage_number;
```

### 6. Coverage Analysis

```sql
WITH jtbd_coverage AS (
    SELECT
        j.id as jtbd_id,
        j.code,
        j.name,
        j.functional_area,
        EXISTS(SELECT 1 FROM jtbd_outcomes WHERE jtbd_id = j.id) as has_outcomes,
        EXISTS(SELECT 1 FROM jtbd_obstacles WHERE jtbd_id = j.id) as has_obstacles,
        EXISTS(SELECT 1 FROM jtbd_constraints WHERE jtbd_id = j.id) as has_constraints,
        EXISTS(SELECT 1 FROM jtbd_workflow_stages WHERE jtbd_id = j.id) as has_workflow,
        EXISTS(SELECT 1 FROM jtbd_value_drivers WHERE jtbd_id = j.id) as has_value_drivers,
        EXISTS(SELECT 1 FROM jtbd_gen_ai_opportunities WHERE jtbd_id = j.id) as has_gen_ai,
        EXISTS(SELECT 1 FROM jtbd_evidence_sources WHERE jtbd_id = j.id) as has_evidence,
        COUNT(jp.persona_id) as persona_count
    FROM jobs_to_be_done j
    LEFT JOIN jtbd_personas jp ON jp.jtbd_id = j.id
    WHERE j.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
      AND j.deleted_at IS NULL
    GROUP BY j.id, j.code, j.name, j.functional_area
)
SELECT
    code,
    name,
    functional_area,
    persona_count,
    has_outcomes,
    has_obstacles,
    has_constraints,
    has_workflow,
    has_value_drivers,
    has_gen_ai,
    has_evidence,
    (
        CASE WHEN has_outcomes THEN 1 ELSE 0 END +
        CASE WHEN has_obstacles THEN 1 ELSE 0 END +
        CASE WHEN has_constraints THEN 1 ELSE 0 END +
        CASE WHEN has_workflow THEN 1 ELSE 0 END +
        CASE WHEN has_value_drivers THEN 1 ELSE 0 END +
        CASE WHEN has_gen_ai THEN 1 ELSE 0 END +
        CASE WHEN has_evidence THEN 1 ELSE 0 END +
        CASE WHEN persona_count > 0 THEN 1 ELSE 0 END
    ) as completeness_score,
    ROUND(
        100.0 * (
            CASE WHEN has_outcomes THEN 1 ELSE 0 END +
            CASE WHEN has_obstacles THEN 1 ELSE 0 END +
            CASE WHEN has_constraints THEN 1 ELSE 0 END +
            CASE WHEN has_workflow THEN 1 ELSE 0 END +
            CASE WHEN has_value_drivers THEN 1 ELSE 0 END +
            CASE WHEN has_gen_ai THEN 1 ELSE 0 END +
            CASE WHEN has_evidence THEN 1 ELSE 0 END +
            CASE WHEN persona_count > 0 THEN 1 ELSE 0 END
        ) / 8.0,
        1
    ) as completeness_pct
FROM jtbd_coverage
ORDER BY completeness_score DESC, code;
```

---

## Next Steps for Data Population

### Priority 1: Core Context (Required)
1. **jtbd_outcomes** - Define measurable success criteria using ODI framework
2. **jtbd_obstacles** - Document pain points and blockers
3. **jtbd_workflow_stages** - Break down the job into stages

### Priority 2: Value & Requirements
4. **jtbd_value_drivers** - Quantify value creation
5. **jtbd_solution_requirements** - Define solution needs
6. **jtbd_constraints** - Document limitations

### Priority 3: Market Context
7. **jtbd_competitive_alternatives** - Current solutions
8. **jtbd_evidence_sources** - Research backing

### Priority 4: Gen AI Strategy
9. **jtbd_gen_ai_opportunities** - Assess AI potential
10. **jtbd_gen_ai_use_cases** - Specific AI applications

### Priority 5: Capability Mapping
11. **capability_jtbd_mapping** - Link to organizational capabilities

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

### Opportunity Score Formula
```
opportunity_score = importance_score + MAX(importance_score - satisfaction_score, 0)
```

- **> 12** = High priority opportunity (underserved outcomes)
- **8-12** = Medium priority
- **< 8** = Low priority (adequately served)

---

## Example: Complete JTBD Record

```sql
-- 1. Insert JTBD
INSERT INTO jobs_to_be_done (
    tenant_id, code, name, description, functional_area, job_category,
    complexity, frequency, status, validation_score
) VALUES (
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
    'JTBD-MA-010',
    'Develop Value-Based Contracting Strategy',
    'When developing value-based contracts with payers, I want to...',
    'Market Access',
    'strategic',
    'high',
    'quarterly',
    'active',
    0.85
);

-- 2. Map to Personas
INSERT INTO jtbd_personas (jtbd_id, persona_id, relevance_score, is_primary)
SELECT
    (SELECT id FROM jobs_to_be_done WHERE code = 'JTBD-MA-010'),
    p.id,
    0.95,
    true
FROM personas p
WHERE p.slug = 'sarah-chen-vp-pricing-mid-lifecycle';

-- 3. Add Outcomes
INSERT INTO jtbd_outcomes (
    jtbd_id, tenant_id, outcome_id, outcome_statement, outcome_type,
    importance_score, satisfaction_score
) VALUES
((SELECT id FROM jobs_to_be_done WHERE code = 'JTBD-MA-010'),
 'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
 'OUT-001',
 'Minimize time to finalize contract terms',
 'speed',
 9.0,
 5.0);

-- Opportunity Score automatically calculated: 9.0 + MAX(9.0 - 5.0, 0) = 13.0 (HIGH priority)
```

---

**End of Reference Document**
