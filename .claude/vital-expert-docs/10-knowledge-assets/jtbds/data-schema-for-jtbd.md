# VITAL Platform Data Schema for JTBD Collection

This document describes the current data schema structure to support Jobs-To-Be-Done (JTBD) collection across personas, business functions, and tenants.

---

## Core Entity Relationships

### Multi-Tenancy Foundation

```
tenants (root)
├── user_profiles
├── org_functions
├── org_departments
├── org_roles
├── personas
├── agents
├── jobs_to_be_done
├── domains
├── strategic_priorities
└── capabilities
```

---

## 1. Organizational Structure

### Primary Hierarchy

| Table | Relationships | Purpose |
|-------|--------------|---------|
| `org_functions` | parent_id → org_functions, tenant_id → tenants | Business functions (e.g., Commercial, Medical Affairs) |
| `org_departments` | function_id → org_functions, tenant_id → tenants | Departments within functions |
| `org_roles` | department_id → org_departments, function_id → org_functions, reports_to_role_id → org_roles, tenant_id → tenants | Role definitions with reporting structure |
| `org_hierarchy` | department_id, function_id, role_id, reports_to_user_id, user_id, tenant_id | User placement in org structure |
| `org_teams` | lead_user_id → user_profiles, tenant_id → tenants | Team definitions |
| `org_team_members` | role_id → org_roles, team_id → org_teams, user_id → user_profiles | Team membership |

### Function/Department Attributes (Junction Tables)

| Junction Table | Links |
|----------------|-------|
| `function_countries` | org_functions ↔ countries |
| `function_departments` | org_functions ↔ org_departments |
| `function_geographic_scopes` | org_functions ↔ geographic_scopes |
| `function_industries` | org_functions ↔ industries |
| `function_roles` | org_functions ↔ org_roles |
| `function_therapeutic_areas` | org_functions ↔ therapeutic_areas |
| `department_countries` | org_departments ↔ countries |
| `department_disease_areas` | org_departments ↔ disease_areas |
| `department_geographic_scopes` | org_departments ↔ geographic_scopes |
| `department_roles` | org_departments ↔ org_roles |
| `department_therapeutic_areas` | org_departments ↔ therapeutic_areas |

### Role Attributes (Junction Tables)

| Junction Table | Links |
|----------------|-------|
| `role_countries` | org_roles ↔ countries |
| `role_disease_areas` | org_roles ↔ disease_areas |
| `role_geographic_scopes` | org_roles ↔ geographic_scopes |
| `role_organizational_levels` | org_roles ↔ organizational_levels |
| `role_product_lifecycle_stages` | org_roles ↔ product_lifecycle_stages |
| `role_responsibilities` | org_roles ↔ org_responsibilities |
| `role_typical_background` | org_roles ↔ credentials |

---

## 2. Personas

### Core Persona Table

```
personas
├── department_id → org_departments
├── function_id → org_functions
├── role_id → org_roles
├── tenant_id → tenants
└── validated_by → users
```

### Persona Evidence & Research

| Table | Relationships |
|-------|--------------|
| `persona_evidence_summary` | persona_id, tenant_id, created_by, updated_by |
| `persona_evidence_sources` | persona_id, tenant_id |
| `persona_public_research` | persona_id, tenant_id, created_by, updated_by |
| `persona_research_quantitative_results` | research_id → persona_public_research, tenant_id |
| `persona_expert_opinions` | persona_id, tenant_id, created_by, updated_by |
| `persona_industry_reports` | persona_id, tenant_id, created_by, updated_by |
| `persona_supporting_statistics` | persona_id, tenant_id, created_by, updated_by |
| `persona_statistic_history` | statistic_id → persona_supporting_statistics, tenant_id |
| `persona_case_studies` | persona_id, tenant_id, created_by, updated_by |
| `persona_case_study_investments` | case_study_id, tenant_id |
| `persona_case_study_metrics` | case_study_id, tenant_id |
| `persona_case_study_results` | case_study_id, tenant_id |

### Persona Stakeholder Relationships

| Table | Relationships |
|-------|--------------|
| `persona_internal_stakeholders` | persona_id, tenant_id, created_by, updated_by |
| `persona_external_stakeholders` | persona_id, tenant_id, created_by, updated_by |
| `persona_regulatory_stakeholders` | persona_id, tenant_id, created_by, updated_by |
| `persona_customer_relationships` | persona_id, tenant_id, created_by, updated_by |
| `persona_vendor_relationships` | persona_id, tenant_id, created_by, updated_by |
| `persona_industry_relationships` | persona_id, tenant_id, created_by, updated_by |
| `persona_stakeholder_influence_map` | persona_id, tenant_id |
| `persona_stakeholder_journey` | persona_id, tenant_id |
| `persona_stakeholder_value_exchange` | persona_id, tenant_id |
| `persona_internal_networks` | persona_id, tenant_id |

### Persona Time-Based Activities

| Table | Description |
|-------|-------------|
| `persona_typical_day` | Daily activities |
| `persona_week_in_life` | Weekly patterns |
| `persona_weekly_meetings` | Recurring meetings |
| `persona_weekly_milestones` | Weekly goals |
| `persona_month_in_life` | Monthly patterns |
| `persona_monthly_objectives` | Monthly goals |
| `persona_monthly_stakeholders` | Monthly interactions |
| `persona_year_in_life` | Annual patterns |
| `persona_annual_conferences` | Conference attendance |

### Persona Profile Attributes

| Table | Description |
|-------|-------------|
| `persona_education` | Educational background |
| `persona_certifications` | Professional certifications |
| `persona_career_trajectory` | Career progression |
| `persona_motivations` | What drives them |
| `persona_values` | Core values |
| `persona_personality_traits` | Personality characteristics |
| `persona_success_metrics` | How they measure success |
| `persona_communication_preferences` | Preferred communication styles |
| `persona_vpanes_scoring` | VPANES framework scores |

---

## 3. Jobs-To-Be-Done (JTBD)

### Core JTBD Table

```
jobs_to_be_done
├── domain_id → domains
├── strategic_priority_id → strategic_priorities
├── industry_id → industries
├── org_function_id → org_functions
└── tenant_id → tenants
```

### Key Columns in `jobs_to_be_done`

| Column | Type | Description |
|--------|------|-------------|
| `code` | text | Unique identifier (e.g., "PHARMA_MA_RWE_001") |
| `name` | text | JTBD name |
| `description` | text | Detailed description |
| `functional_area` | enum | medical_affairs, market_access, regulatory, commercial, etc. |
| `job_category` | enum | strategic, operational, tactical |
| `complexity` | enum | low, medium, high, very_high |
| `frequency` | enum | daily, weekly, monthly, quarterly, annually |
| `validation_score` | numeric(3,2) | 0.00 to 1.00 |

---

## ODI (Outcome-Driven Innovation) Framework

### ODI Scoring Visualization

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
│       How well served today?                    │
│                     =                           │
│  Opportunity Score                              │
│       importance + MAX(importance - satisfaction, 0)  │
└─────────────────────────────────────────────────┘
    ↓
Opportunity Priority
    - HIGH (>12): Underserved, high-value
    - MEDIUM (8-12): Moderate opportunity
    - LOW (<8): Adequately served
```

### `jtbd_outcomes` Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `outcome_id` | text | e.g., "OUT-001" |
| `outcome_statement` | text | "Minimize time to complete X" |
| `outcome_type` | enum | speed, stability, output, cost, risk |
| `importance_score` | numeric(3,1) | 0-10 scale |
| `satisfaction_score` | numeric(3,1) | 0-10 scale |
| `opportunity_score` | numeric(4,1) | Auto-calculated |
| `opportunity_priority` | text | high, medium, low (auto-calculated) |
| `evidence_source` | text | Source of scoring data |

### Outcome Types

| Type | Description | Example Statement |
|------|-------------|-------------------|
| `speed` | Time to complete | "Minimize time to finalize contract terms" |
| `stability` | Consistency | "Minimize variation in data quality" |
| `output` | Quality of result | "Maximize accuracy of forecasts" |
| `cost` | Resource efficiency | "Minimize cost of evidence generation" |
| `risk` | Risk reduction | "Minimize risk of regulatory rejection" |

---

### JTBD Attributes (All linked to jobs_to_be_done.id and tenant_id)

| Table | Purpose |
|-------|---------|
| `jtbd_outcomes` | ODI-scored outcomes (see above) |
| `jtbd_success_criteria` | Success measures |
| `jtbd_kpis` | Key performance indicators |
| `jtbd_value_drivers` | Value creation factors |
| `jtbd_obstacles` | Barriers to completion |
| `jtbd_constraints` | Limitations and boundaries |
| `jtbd_competitive_alternatives` | Alternative solutions |
| `jtbd_evidence_sources` | Supporting evidence |
| `jtbd_solution_requirements` | Solution specifications |

### `jtbd_kpis` Structure

| Column | Type | Description |
|--------|------|-------------|
| `kpi_code` | text | Unique identifier (e.g., "KPI-MA-001") - **Required** |
| `kpi_name` | text | KPI name |
| `kpi_description` | text | Detailed description |
| `target_value` | numeric | Target metric value |
| `current_value` | numeric | Current metric value |

### `jtbd_success_criteria` Structure

| Column | Type | Description |
|--------|------|-------------|
| `criterion_text` | text | Description of success criterion |

### `jtbd_obstacles` Structure

| Column | Type | Values |
|--------|------|--------|
| `obstacle_text` | text | Description of obstacle |
| `obstacle_type` | enum | technical, resource, process, political, knowledge |
| `severity` | enum | low, medium, high, critical |

### `jtbd_constraints` Structure

| Column | Type | Values |
|--------|------|--------|
| `constraint_text` | text | Description of constraint |
| `constraint_type` | enum | regulatory, budget, technical, resource, time |
| `impact` | enum | low, medium, high, critical |

### `jtbd_value_drivers` Structure

| Column | Type | Description |
|--------|------|-------------|
| `value_description` | text | What value is created |
| `quantified_impact` | text | e.g., "Save 10 hours per week" |
| `beneficiary` | text | Who benefits |

### JTBD Relationships

| Table | Relationships | Purpose |
|-------|--------------|---------|
| `jtbd_roles` | jtbd_id ↔ role_id | Link JTBDs to roles (personas inherit via role_id) |
| `jtbd_personas` | jtbd_id ↔ persona_id | Direct JTBD-persona link (legacy) |
| `jtbd_dependencies` | source_jtbd_id ↔ dependent_jtbd_id | JTBD dependencies |
| `capability_jtbd_mapping` | capability_id ↔ jtbd_id | Map capabilities to JTBDs |

### `jtbd_roles` Structure (NEW - Preferred Pattern)

| Column | Type | Description |
|--------|------|-------------|
| `jtbd_id` | uuid | Reference to jobs_to_be_done |
| `role_id` | uuid | Reference to org_roles |
| `relevance_score` | decimal(3,2) | 0.00-1.00 relevance |
| `is_primary` | boolean | Whether role is primary executor |
| `notes` | text | Additional context |
| `mapping_source` | text | manual, ai_suggested, imported, derived |

**Note**: Personas inherit JTBDs from their assigned roles via `personas.role_id`.

### JTBD Workflow Structure

| Table | Relationships | Purpose |
|-------|--------------|---------|
| `jtbd_workflow_stages` | jtbd_id, tenant_id | Workflow stages within a JTBD |
| `jtbd_workflow_activities` | workflow_stage_id, depends_on_activity_id, tenant_id | Activities within stages |

### JTBD GenAI Opportunities

| Table | Relationships | Purpose |
|-------|--------------|---------|
| `jtbd_gen_ai_opportunities` | jtbd_id, tenant_id | AI opportunity identification |
| `jtbd_gen_ai_use_cases` | jtbd_id, gen_ai_opportunity_id, tenant_id | Specific AI use cases |

---

## 4. Strategic Context

### Domains & Capabilities

| Table | Relationships |
|-------|--------------|
| `domains` | parent_id → domains, tenant_id → tenants |
| `capabilities` | domain_id → domains, tenant_id → tenants |
| `strategic_priorities` | domain_id → domains, tenant_id → tenants |
| `knowledge_domains` | parent_id → knowledge_domains, tenant_id → tenants |
| `domain_hierarchies` | parent_domain_id ↔ child_domain_id |

---

## 5. Agents & AI Configuration

### Agent Structure

```
agents
├── department_id → org_departments
├── function_id → org_functions
├── role_id → org_roles
└── tenant_id → tenants
```

### Agent Capabilities (Junction Tables)

| Junction Table | Links |
|----------------|-------|
| `agent_skills` | agents ↔ skills |
| `agent_tools` | agents ↔ tools |
| `agent_industries` | agents ↔ industries |
| `agent_metrics` | agents ↔ tenants (performance tracking) |

### Model Configuration

```
model_configurations
├── agent_id → agents
├── model_id → llm_models
├── fallback_model_id → llm_models
└── tenant_id → tenants
```

---

## 6. Expert Consultations & Panels

### Expert Consultations

```
expert_consultations
├── agent_id → agents
├── jtbd_id → jobs_to_be_done
├── model_config_id → model_configurations
├── persona_id → personas
├── tenant_id → tenants
└── user_id → user_profiles
```

### Panel Discussions

```
panel_discussions
├── facilitator_agent_id → agents
├── jtbd_id → jobs_to_be_done
├── persona_id → personas
├── tenant_id → tenants
└── user_id → user_profiles
```

### Panel Components

| Table | Relationships |
|-------|--------------|
| `panel_members` | agent_id, panel_id |
| `panel_messages` | agent_id, panel_id, round_id, member_id, in_reply_to_id |
| `panel_votes` | panel_id, member_id, message_id |
| `panel_consensus` | panel_id, round_id |
| `consultation_feedback` | consultation_id, panel_id, user_id, workflow_execution_id |

---

## 7. Workflow & Execution

### Workflow Structure

```
workflows
├── created_by → users
├── organization_id → organizations
└── project_id → projects
```

### Workflow Components

| Table | Relationships |
|-------|--------------|
| `workflow_step_definitions` | task_id, workflow_id |
| `workflow_step_connections` | from_step_id, to_step_id, workflow_id |
| `workflow_tasks` | task_id, workflow_id |
| `workflow_executions` | workflow_id, triggered_by |
| `workflow_execution_steps` | execution_id, step_id, agent_id, task_id |
| `workflow_logs` | execution_id, step_id |
| `workflow_approvals` | execution_id, step_id, approved_by |
| `execution_context` | execution_id, step_id |

---

## 8. Reference Data Tables

### Geographic & Industry

- `countries`
- `geographic_scopes`
- `industries`
- `therapeutic_areas`
- `disease_areas`

### Organizational Reference

- `organizational_levels`
- `product_lifecycle_stages`
- `org_responsibilities`
- `credentials`

### Skills & Tools

- `skill_categories`
- `skills` (category_id, tenant_id)
- `tools`

---

## Key Patterns for JTBD Collection

### 1. Role-JTBD Relationship (Preferred Pattern)
```
org_roles ← jtbd_roles → jobs_to_be_done
     ↑
personas (inherit JTBDs via role_id)
```
JTBDs are mapped to roles; personas inherit JTBDs through their role assignment.

### 2. Organizational Context
```
tenant → org_function → org_department → org_role → jtbd_roles → jtbd
                                              ↓
                                          personas
```
JTBDs are collected within organizational context via roles.

### 3. JTBD Enrichment Flow
```
jobs_to_be_done
├── jtbd_outcomes (what they want to achieve)
├── jtbd_obstacles (what blocks them)
├── jtbd_workflow_stages → jtbd_workflow_activities
├── jtbd_gen_ai_opportunities → jtbd_gen_ai_use_cases
└── jtbd_success_criteria + jtbd_kpis
```

### 4. Evidence Collection
```
persona
├── persona_evidence_summary
├── persona_evidence_sources
├── persona_public_research
├── persona_expert_opinions
└── persona_case_studies
```

---

## Data Collection Queries

### Get all JTBDs for a persona
```sql
SELECT j.*
FROM jobs_to_be_done j
JOIN jtbd_personas jp ON j.id = jp.jtbd_id
WHERE jp.persona_id = '<persona_id>';
```

### Get personas by function and department
```sql
SELECT p.*
FROM personas p
WHERE p.function_id = '<function_id>'
  AND p.department_id = '<department_id>'
  AND p.tenant_id = '<tenant_id>';
```

### Get JTBD with all related data
```sql
SELECT
  j.*,
  array_agg(DISTINCT jo.outcome) as outcomes,
  array_agg(DISTINCT jk.kpi) as kpis,
  array_agg(DISTINCT job.obstacle) as obstacles
FROM jobs_to_be_done j
LEFT JOIN jtbd_outcomes jo ON j.id = jo.jtbd_id
LEFT JOIN jtbd_kpis jk ON j.id = jk.jtbd_id
LEFT JOIN jtbd_obstacles job ON j.id = job.jtbd_id
WHERE j.id = '<jtbd_id>'
GROUP BY j.id;
```

---

## Next Steps for JTBD Collection

1. **Define collection scope**: Which functions/departments/roles to target
2. **Identify personas**: Map existing personas or create new ones
3. **Gather evidence**: Populate persona evidence tables
4. **Document JTBDs**: Create jobs_to_be_done records
5. **Enrich JTBDs**: Add outcomes, obstacles, KPIs, workflow stages
6. **Identify AI opportunities**: Map gen_ai_opportunities and use_cases
7. **Validate**: Use expert consultations and panel discussions

---

*Generated for VITAL Platform JTBD Collection Initiative*
