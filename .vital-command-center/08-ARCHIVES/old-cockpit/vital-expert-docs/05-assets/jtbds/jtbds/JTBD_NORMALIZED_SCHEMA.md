# VITAL Platform - JTBD Normalized Schema Reference

**Date:** 2025-11-19
**Architecture:** ZERO JSONB - Fully Normalized
**Standards:** ODI (Outcome-Driven Innovation), JTBD Framework

---

## Executive Summary

The JTBD schema has been fully normalized to eliminate all JSONB and text[] fields. This ensures:
- Better query performance
- Proper indexing
- Referential integrity
- Easier reporting and analytics

---

## Schema Overview

```
jobs_to_be_done (core)
├── jtbd_roles (maps JTBDs to org_roles - personas inherit via role_id)
├── jtbd_pain_points (from pain_points jsonb)
├── jtbd_desired_outcomes (from desired_outcomes jsonb)
├── jtbd_workflow_stages
│   ├── jtbd_stage_key_activities (from key_activities text[])
│   └── jtbd_stage_pain_points (from pain_points text[])
├── jtbd_workflow_activities
│   ├── jtbd_activity_tools (from tools_used text[])
│   └── jtbd_activity_outputs (from outputs text[])
├── jtbd_outcomes
├── jtbd_obstacles
├── jtbd_kpis
├── jtbd_success_criteria
├── jtbd_competitive_alternatives
│   ├── jtbd_competitive_strengths (from strengths text[])
│   └── jtbd_competitive_weaknesses (from weaknesses text[])
├── jtbd_gen_ai_opportunities
│   ├── jtbd_gen_ai_capabilities (from key_ai_capabilities text[])
│   ├── jtbd_gen_ai_risks (from risks text[])
│   └── jtbd_gen_ai_mitigations (from mitigation_strategies text[])
└── jtbd_value_drivers
```

---

## Core Tables

### 1. jobs_to_be_done

The central table for all JTBD data.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tenant_id | uuid | Multi-tenant isolation |
| code | text | Unique identifier (e.g., "JTBD-001") |
| name | text | Short job name |
| job_statement | text | Full job statement using ODI format |
| functional_job | text | What the user is trying to accomplish |
| emotional_job | text | How the user wants to feel |
| social_job | text | How the user wants to be perceived |
| job_context | text | Situational context |
| job_category | text | 'core', 'related', 'emotional', 'consumption_chain' |
| priority_score | integer | 1-10 priority ranking |
| status | text | 'draft', 'validated', 'active', 'deprecated' |
| persona_id | uuid | FK to personas |
| org_function_id | uuid | FK to org_functions |
| org_role_id | uuid | FK to org_roles |
| created_at | timestamptz | Audit timestamp |
| updated_at | timestamptz | Audit timestamp |

---

## Junction Tables

### 2. jtbd_roles (NEW - Preferred Pattern)

Maps JTBDs to organizational roles. Personas inherit JTBDs through their `role_id`.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| jtbd_id | uuid | FK to jobs_to_be_done (NOT NULL) |
| role_id | uuid | FK to org_roles (NOT NULL) |
| relevance_score | decimal(3,2) | 0.00-1.00 relevance score |
| is_primary | boolean | Whether role is primary executor |
| notes | text | Additional context |
| mapping_source | text | 'manual', 'ai_suggested', 'imported', 'derived' |
| created_at | timestamptz | Audit timestamp |
| updated_at | timestamptz | Audit timestamp |

**Key Constraint:** `UNIQUE(jtbd_id, role_id)`

**Helper Functions:**
- `get_jtbds_by_role(role_id)` - Get all JTBDs for a role
- `get_roles_by_jtbd(jtbd_id)` - Get all roles for a JTBD
- `get_jtbds_for_persona_via_role(persona_id)` - Get JTBDs for persona through their role

---

## Normalized Tables (Formerly JSONB)

### 3. jtbd_pain_points

**Source:** `jobs_to_be_done.pain_points` (jsonb)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| jtbd_id | uuid | FK to jobs_to_be_done |
| tenant_id | uuid | Multi-tenant isolation |
| issue | text | Pain point description (NOT NULL) |
| severity | text | 'low', 'medium', 'high', 'critical' |
| pain_point_type | text | 'technical', 'resource', 'process', 'political', 'knowledge', 'compliance' |
| frequency | text | 'always', 'often', 'sometimes', 'rarely' |
| impact_description | text | Description of impact |

### 3. jtbd_desired_outcomes

**Source:** `jobs_to_be_done.desired_outcomes` (jsonb)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| jtbd_id | uuid | FK to jobs_to_be_done |
| tenant_id | uuid | Multi-tenant isolation |
| outcome | text | Outcome description (NOT NULL) |
| importance | integer | 1-10 importance score |
| outcome_type | text | 'speed', 'stability', 'output', 'cost', 'risk' |
| current_satisfaction | integer | 1-10 satisfaction score |
| sequence_order | integer | Display order |

---

## Workflow Tables

### 4. jtbd_workflow_stages

Stages in the job workflow.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| jtbd_id | uuid | FK to jobs_to_be_done |
| tenant_id | uuid | Multi-tenant isolation |
| stage_name | text | Stage name |
| stage_order | integer | Sequence in workflow |
| description | text | Stage description |
| duration_estimate | text | Estimated duration |
| success_criteria | text | What defines success |

### 5. jtbd_stage_key_activities

**Source:** `jtbd_workflow_stages.key_activities` (text[])

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| workflow_stage_id | uuid | FK to jtbd_workflow_stages |
| tenant_id | uuid | Multi-tenant isolation |
| activity_text | text | Activity description (NOT NULL) |
| sequence_order | integer | Order within stage |
| is_critical | boolean | Is this a critical activity |
| estimated_duration | text | Duration estimate |
| responsible_role | text | Who performs this |

### 6. jtbd_stage_pain_points

**Source:** `jtbd_workflow_stages.pain_points` (text[])

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| workflow_stage_id | uuid | FK to jtbd_workflow_stages |
| tenant_id | uuid | Multi-tenant isolation |
| pain_point | text | Pain point description (NOT NULL) |
| severity | text | 'low', 'medium', 'high', 'critical' |
| mitigation | text | How to mitigate |

### 7. jtbd_workflow_activities

Activities within workflow stages.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| workflow_stage_id | uuid | FK to jtbd_workflow_stages |
| tenant_id | uuid | Multi-tenant isolation |
| activity_name | text | Activity name |
| activity_order | integer | Sequence in stage |
| description | text | Activity description |
| responsible_role | text | Who performs this |
| time_spent_percentage | numeric | % of time spent |
| automation_potential | text | 'none', 'partial', 'full' |

### 8. jtbd_activity_tools

**Source:** `jtbd_workflow_activities.tools_used` (text[])

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| workflow_activity_id | uuid | FK to jtbd_workflow_activities |
| tenant_id | uuid | Multi-tenant isolation |
| tool_name | text | Tool name (NOT NULL) |
| tool_category | text | 'software', 'hardware', 'service' |
| proficiency_required | text | 'basic', 'intermediate', 'advanced' |

### 9. jtbd_activity_outputs

**Source:** `jtbd_workflow_activities.outputs` (text[])

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| workflow_activity_id | uuid | FK to jtbd_workflow_activities |
| tenant_id | uuid | Multi-tenant isolation |
| output_name | text | Output name (NOT NULL) |
| output_type | text | 'document', 'data', 'decision', 'artifact' |
| quality_criteria | text | Quality standards |

---

## ODI Framework Tables

### 10. jtbd_outcomes

Outcome statements using ODI format.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| jtbd_id | uuid | FK to jobs_to_be_done |
| tenant_id | uuid | Multi-tenant isolation |
| outcome_statement | text | ODI format outcome |
| outcome_type | text | 'increase', 'decrease', 'minimize', 'maximize' |
| direction | text | Direction of improvement |
| unit_of_measure | text | How it's measured |
| importance_score | integer | 1-10 importance |
| satisfaction_score | integer | 1-10 current satisfaction |
| opportunity_score | numeric | Calculated: importance + (importance - satisfaction) |

**ODI Opportunity Score Formula:**
```
Opportunity = Importance + MAX(Importance - Satisfaction, 0)
```

Score interpretation:
- **10-15**: High opportunity - prioritize
- **5-10**: Medium opportunity - consider
- **0-5**: Low opportunity - satisfied

### 11. jtbd_obstacles

Barriers to job completion.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| jtbd_id | uuid | FK to jobs_to_be_done |
| tenant_id | uuid | Multi-tenant isolation |
| obstacle_description | text | Obstacle description |
| obstacle_type | text | 'knowledge', 'resource', 'process', 'technology', 'compliance' |
| severity | text | 'low', 'medium', 'high', 'critical' |
| frequency | text | 'rare', 'occasional', 'frequent', 'constant' |
| current_workaround | text | How users work around it |

### 12. jtbd_kpis

Key Performance Indicators.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| jtbd_id | uuid | FK to jobs_to_be_done |
| tenant_id | uuid | Multi-tenant isolation |
| kpi_name | text | KPI name |
| kpi_description | text | Description |
| target_value | text | Target |
| current_value | text | Current performance |
| unit_of_measure | text | Unit |
| measurement_frequency | text | How often measured |
| data_source | text | Where data comes from |

### 13. jtbd_success_criteria

What defines job success.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| jtbd_id | uuid | FK to jobs_to_be_done |
| tenant_id | uuid | Multi-tenant isolation |
| criterion_description | text | Success criterion |
| measurement_method | text | How to measure |
| target_value | text | Target |
| priority | text | 'must_have', 'should_have', 'nice_to_have' |

---

## Competitive Analysis Tables

### 14. jtbd_competitive_alternatives

How users currently solve the job.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| jtbd_id | uuid | FK to jobs_to_be_done |
| tenant_id | uuid | Multi-tenant isolation |
| alternative_name | text | Alternative name |
| alternative_type | text | 'competitor', 'workaround', 'manual', 'outsource' |
| market_share | numeric | Estimated market share |
| switching_cost | text | 'low', 'medium', 'high' |
| satisfaction_level | integer | 1-10 satisfaction |

### 15. jtbd_competitive_strengths

**Source:** `jtbd_competitive_alternatives.strengths` (text[])

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| competitive_alternative_id | uuid | FK to jtbd_competitive_alternatives |
| tenant_id | uuid | Multi-tenant isolation |
| strength | text | Strength description (NOT NULL) |
| importance_level | text | 'low', 'medium', 'high' |

### 16. jtbd_competitive_weaknesses

**Source:** `jtbd_competitive_alternatives.weaknesses` (text[])

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| competitive_alternative_id | uuid | FK to jtbd_competitive_alternatives |
| tenant_id | uuid | Multi-tenant isolation |
| weakness | text | Weakness description (NOT NULL) |
| severity | text | 'low', 'medium', 'high', 'critical' |
| exploitability | text | How we can leverage this |

---

## Gen AI Opportunity Tables

### 17. jtbd_gen_ai_opportunities

AI/automation opportunities.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| jtbd_id | uuid | FK to jobs_to_be_done |
| tenant_id | uuid | Multi-tenant isolation |
| opportunity_name | text | Opportunity name |
| description | text | Description |
| automation_type | text | 'full', 'partial', 'augmentation' |
| estimated_time_savings | numeric | Hours saved |
| estimated_cost_savings | numeric | Cost saved |
| implementation_complexity | text | 'low', 'medium', 'high' |
| priority_score | integer | 1-10 priority |

### 18. jtbd_gen_ai_capabilities

**Source:** `jtbd_gen_ai_opportunities.key_ai_capabilities` (text[])

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| gen_ai_opportunity_id | uuid | FK to jtbd_gen_ai_opportunities |
| tenant_id | uuid | Multi-tenant isolation |
| capability | text | Capability name (NOT NULL) |
| capability_category | text | 'nlp', 'vision', 'analytics', 'automation', 'generation', 'classification', 'extraction' |
| importance_level | text | 'required', 'preferred', 'nice_to_have' |
| maturity_level | text | 'emerging', 'developing', 'mature' |

### 19. jtbd_gen_ai_risks

**Source:** `jtbd_gen_ai_opportunities.risks` (text[])

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| gen_ai_opportunity_id | uuid | FK to jtbd_gen_ai_opportunities |
| tenant_id | uuid | Multi-tenant isolation |
| risk | text | Risk description (NOT NULL) |
| risk_category | text | 'technical', 'data', 'compliance', 'adoption', 'cost', 'security', 'ethical' |
| likelihood | text | 'low', 'medium', 'high' |
| impact | text | 'low', 'medium', 'high', 'critical' |
| risk_score | integer | Calculated: likelihood * impact |

### 20. jtbd_gen_ai_mitigations

**Source:** `jtbd_gen_ai_opportunities.mitigation_strategies` (text[])

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| gen_ai_risk_id | uuid | FK to jtbd_gen_ai_risks |
| tenant_id | uuid | Multi-tenant isolation |
| mitigation_strategy | text | Strategy description (NOT NULL) |
| owner_role | text | Who owns this |
| timeline | text | Implementation timeline |
| estimated_cost | text | Cost estimate |
| status | text | 'planned', 'in_progress', 'completed', 'deferred' |
| effectiveness | text | 'low', 'medium', 'high' |

---

## Value Driver Tables

### 21. jtbd_value_drivers

Business value drivers.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| jtbd_id | uuid | FK to jobs_to_be_done |
| tenant_id | uuid | Multi-tenant isolation |
| driver_name | text | Value driver name |
| driver_type | text | 'revenue', 'cost', 'risk', 'time', 'quality' |
| description | text | Description |
| current_value | numeric | Current state |
| target_value | numeric | Target state |
| unit_of_measure | text | Unit |

### 22. jtbd_value_impacts

**Source:** `jtbd_value_drivers.quantified_impact` (split)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| value_driver_id | uuid | FK to jtbd_value_drivers |
| tenant_id | uuid | Multi-tenant isolation |
| impact_type | text | Type of impact |
| impact_value | numeric | Quantified value |
| confidence_level | text | 'low', 'medium', 'high' |
| time_horizon | text | 'immediate', 'short_term', 'medium_term', 'long_term' |
| assumptions | text | Underlying assumptions |

---

## Key Indexes

```sql
-- Core lookups
idx_jtbd_tenant ON jobs_to_be_done(tenant_id)
idx_jtbd_persona ON jobs_to_be_done(persona_id)
idx_jtbd_function ON jobs_to_be_done(org_function_id)
idx_jtbd_status ON jobs_to_be_done(status)

-- Pain points
idx_jtbd_pain_points_jtbd ON jtbd_pain_points(jtbd_id)
idx_jtbd_pain_points_severity ON jtbd_pain_points(severity)

-- Outcomes
idx_jtbd_desired_outcomes_jtbd ON jtbd_desired_outcomes(jtbd_id)
idx_jtbd_desired_outcomes_importance ON jtbd_desired_outcomes(importance DESC)

-- ODI scoring
idx_jtbd_outcomes_opportunity ON jtbd_outcomes(opportunity_score DESC)
```

---

## Example Queries

### Get all pain points for a JTBD
```sql
SELECT
    j.name as job_name,
    pp.issue,
    pp.severity,
    pp.pain_point_type
FROM jobs_to_be_done j
JOIN jtbd_pain_points pp ON pp.jtbd_id = j.id
WHERE j.id = 'your-jtbd-id'
ORDER BY
    CASE pp.severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
    END;
```

### Get top opportunities by ODI score
```sql
SELECT
    j.name as job_name,
    o.outcome_statement,
    o.importance_score,
    o.satisfaction_score,
    o.opportunity_score
FROM jobs_to_be_done j
JOIN jtbd_outcomes o ON o.jtbd_id = j.id
WHERE o.opportunity_score >= 10
ORDER BY o.opportunity_score DESC
LIMIT 20;
```

### Get workflow with all activities and tools
```sql
SELECT
    j.name as job_name,
    ws.stage_name,
    ws.stage_order,
    wa.activity_name,
    at.tool_name
FROM jobs_to_be_done j
JOIN jtbd_workflow_stages ws ON ws.jtbd_id = j.id
JOIN jtbd_workflow_activities wa ON wa.workflow_stage_id = ws.id
LEFT JOIN jtbd_activity_tools at ON at.workflow_activity_id = wa.id
ORDER BY ws.stage_order, wa.activity_order;
```

---

## Migration Notes

### Tables Created
- 12 new normalized tables replacing JSONB/text[] fields
- All tables have RLS enabled
- All tables have tenant_id for multi-tenancy

### Deprecated Columns (to be dropped after verification)
- `jobs_to_be_done.pain_points` (jsonb)
- `jobs_to_be_done.desired_outcomes` (jsonb)
- `jtbd_workflow_stages.key_activities` (text[])
- `jtbd_workflow_stages.pain_points` (text[])
- `jtbd_competitive_alternatives.strengths` (text[])
- `jtbd_competitive_alternatives.weaknesses` (text[])
- `jtbd_gen_ai_opportunities.key_ai_capabilities` (text[])
- `jtbd_gen_ai_opportunities.risks` (text[])
- `jtbd_gen_ai_opportunities.mitigation_strategies` (text[])

---

*Aligned with ODI (Outcome-Driven Innovation) framework and JTBD methodology*
