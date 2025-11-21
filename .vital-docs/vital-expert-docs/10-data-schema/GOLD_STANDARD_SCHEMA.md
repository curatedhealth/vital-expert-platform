# Gold Standard Database Schema

## Overview
This document describes the **normalized, role-centric persona architecture** implemented for the VITAL platform. The schema is designed to be multi-tenant, evidence-based, and optimized for persona-driven AI experiences.

## Design Principles

### 1. Role-Centric Architecture
- **Roles** are the canonical source of structural truth (responsibilities, tools, budget, scope)
- **Personas** inherit from roles and store only behavioral deltas and overrides
- Eliminates data duplication while maintaining flexibility

### 2. Normalized Data Model
- No JSONB for queryable data (only for experimental `metadata` fields)
- All multi-valued attributes in junction tables
- Proper foreign keys and referential integrity

### 3. Evidence-Based
- Every attribute can be traced to evidence sources
- `evidence_sources` and `evidence_links` provide full traceability
- Confidence levels and methodology tracking

### 4. Override Pattern
- Personas can **inherit** (default), **add to**, or **override** role baselines
- `is_additional` flag: persona adds without removing role data
- `overrides_role` flag: persona replaces role data
- Source tracking in effective views

### 5. JTBD Integration
- Jobs-To-Be-Done (JTBD) mapped to roles, not personas
- Personas reference JTBDs via goals, pain points, and challenges
- Maintains separation of structural jobs from behavioral needs

## Schema Structure

### Core Tables

#### Organizational Hierarchy
```
tenants
  ↓
org_functions
  ↓
org_departments
  ↓
org_roles
  ↓
personas
```

#### Evidence System
- `evidence_sources` - Publications, interviews, surveys, analytics
- `evidence_links` - Generic join table (polymorphic)
- `role_evidence_sources` - Role-specific evidence
- `persona_evidence_sources` - Persona-specific evidence

#### Reference Catalogs
- `tools` - Software, platforms, systems
- `skills` - Competencies, capabilities
- `responsibilities` - Accountabilities, tasks
- `stakeholders` - Internal/external parties
- `success_metrics` - KPIs, measurements
- `communication_channels` - Slack, email, meetings
- `ai_maturity_levels` - Levels 1-5
- `vpanes_dimensions` - VALUE, PRIORITY, ADDRESSABILITY, NEED, ENGAGEMENT, SCALE
- `jtbd` - Jobs-To-Be-Done catalog
- `geographies` - Geographic locations
- `therapeutic_areas` - Medical specializations

### Role Baseline (Structural)

#### org_roles Table
Core attributes:
- Identity: `id`, `name`, `slug`, `description`
- Org context: `function_id`, `department_id`, `tenant_id`
- Category: `role_category`, `seniority_level`, `geographic_scope`
- Scope: `team_size_min/max`, `direct_reports_min/max`, `travel_percentage_min/max`
- Budget: `budget_min_usd/max_usd`, `budget_authority_min/max`
- Experience: `min_years_experience`, `max_years_experience`, `typical_education_level`
- Work: `work_location_model`, `typical_work_pattern`

#### Role Junction Tables (10 tables)
1. **role_geographic_scopes** - Where role operates
2. **role_therapeutic_areas** - Medical specializations
3. **role_responsibilities** - What the job requires
   - `time_allocation_percent`, `is_mandatory`, `sequence_order`
4. **role_success_metrics** - How success is measured
   - `is_primary`, `measurement_unit`, `target_min/max`
5. **role_stakeholders** - Who you work with
   - `relationship_type`, `influence_level`, `interaction_frequency`
6. **role_tools** - What tools are used
   - `usage_frequency`, `proficiency_level`, `is_required`
7. **role_skills** - What skills are needed
   - `required_proficiency`, `is_mandatory`
8. **role_ai_maturity** - AI adoption baseline
   - `ai_maturity_score`, `work_complexity_score`, `rationale`
9. **role_vpanes_scores** - VPANES baseline
   - `dimension_id`, `score`, `scoring_rationale`
10. **role_jtbd** - Jobs to be done
    - `importance`, `sequence_order`

### Persona Delta (Behavioral)

#### personas Table
Core attributes:
- Identity: `id`, `name`, `slug`, `title`, `tagline`
- Linkage: `role_id`, `function_id`, `department_id`, `tenant_id`
- Archetype: `archetype`, `persona_type`, `segment`
- Experience: `seniority_level`, `years_of_experience`, `years_in_current_role`
- Context: `typical_organization_size`, `organization_type`
- Work style: `work_pattern`, `work_location`, `work_schedule`
- AI readiness: `gen_ai_readiness_level`, `ai_adoption_stage`
- Scores: `ai_maturity_score`, `work_complexity_score`

#### Persona Junction Tables (10 tables)
1. **persona_responsibilities** - Override/add responsibilities
   - `is_additional`, `overrides_role`, `sequence_order`
2. **persona_tools** - Override/add tools
   - `is_additional`, `overrides_role`, `satisfaction_level`
3. **persona_skills** - Override/add skills
   - `is_additional`, `overrides_role`, `proficiency_level`
4. **persona_stakeholders** - Override/add stakeholders
   - `is_additional`, `overrides_role`, `sequence_order`
5. **persona_ai_maturity** - Override AI scores
   - `overrides_role`, `rationale`
6. **persona_vpanes_scores** - Override VPANES scores
   - `overrides_role`, `scoring_rationale`
7. **persona_goals** - Persona-specific goals
   - `jtbd_id` (optional FK), `importance`, `sequence_order`
8. **persona_pain_points** - Persona-specific pain points
   - `jtbd_id` (optional FK), `severity`, `sequence_order`
9. **persona_challenges** - Persona-specific challenges
   - `jtbd_id` (optional FK), `impact`, `sequence_order`
10. **persona_tenants** - Multi-tenant mapping
    - `is_primary`, `created_at`

### Effective Views (7 views)

These views combine role and persona data using the override pattern:

1. **v_effective_persona_responsibilities**
   - Shows: role responsibilities + persona additions - persona overrides
   - Source: `'role'` | `'persona_addition'` | `'persona_override'`

2. **v_effective_persona_tools**
   - Shows: effective tool stack per persona

3. **v_effective_persona_skills**
   - Shows: effective skill requirements per persona

4. **v_effective_persona_stakeholders**
   - Shows: complete stakeholder map per persona

5. **v_effective_persona_ai_maturity**
   - Shows: persona AI maturity if overridden, else role baseline

6. **v_effective_persona_vpanes**
   - Shows: effective VPANES scores with override tracking

7. **v_persona_complete_context** (Master View)
   - Combines all effective attributes
   - Includes org hierarchy, archetype, counts
   - Single query for complete persona profile

## Usage Patterns

### Query Effective Persona Data
```sql
-- Get complete persona profile
SELECT * FROM v_persona_complete_context
WHERE persona_id = '<uuid>';

-- Get effective responsibilities
SELECT * FROM v_effective_persona_responsibilities
WHERE persona_id = '<uuid>'
ORDER BY sequence_order;

-- See what's inherited vs overridden
SELECT 
    source,
    responsibility_text,
    time_allocation_percent
FROM v_effective_persona_responsibilities
WHERE persona_id = '<uuid>';
```

### Compare Role vs Persona
```sql
-- Role baseline
SELECT * FROM role_responsibilities
WHERE role_id = '<uuid>';

-- Persona overrides
SELECT 
    is_additional,
    overrides_role,
    responsibility_text
FROM persona_responsibilities
WHERE persona_id = '<uuid>';
```

### Find Personas by Archetype
```sql
SELECT 
    p.name,
    r.name as role_name,
    p.archetype,
    p.ai_maturity_score,
    p.work_complexity_score
FROM personas p
JOIN org_roles r ON p.role_id = r.id
WHERE p.archetype = 'ORCHESTRATOR'
AND p.ai_maturity_score >= 70;
```

## MECE Persona Framework

Each role should have **4 MECE (Mutually Exclusive, Collectively Exhaustive) personas** based on:

### Archetype Matrix (AI Maturity × Work Complexity)

```
                 Low Complexity    High Complexity
High AI Maturity    AUTOMATOR        ORCHESTRATOR
Low AI Maturity     LEARNER          SKEPTIC
```

#### Archetype Definitions

1. **AUTOMATOR** (High AI, Low Complexity)
   - Focus: Workflow automation, template generation
   - Service Layer: Workflows
   - Priority: HIGH (fastest ROI)

2. **ORCHESTRATOR** (High AI, High Complexity)
   - Focus: Multi-agent reasoning, strategic planning
   - Service Layer: Ask Panel
   - Priority: HIGH (highest value)

3. **LEARNER** (Low AI, Low Complexity)
   - Focus: Education, guided experiences
   - Service Layer: Ask Expert
   - Priority: MEDIUM (adoption pipeline)

4. **SKEPTIC** (Low AI, High Complexity)
   - Focus: Trust-building, gradual adoption
   - Service Layer: Ask Expert + Evidence
   - Priority: MEDIUM (change management)

### Differentiating Attributes
- `ai_maturity_score` (0-100)
- `work_complexity_score` (0-100)
- `seniority_level`
- `years_of_experience`
- `geographic_scope`
- `organization_type`
- `work_pattern`
- `gen_ai_readiness_level`

## Naming Conventions

### Tables
- Lowercase with underscores: `org_roles`, `persona_tools`
- Plural for main tables: `personas`, `roles`
- Singular for junction prefix: `role_tools`, `persona_goals`

### Columns
- Consistent suffixes:
  - `_id` for UUIDs
  - `_name` for text names
  - `_slug` for URL-friendly strings
  - `_at` for timestamps
  - `_count` for integers
- Reference table names: `{singular}_name`
  - `tool_name`, `skill_name`, `responsibility_name`

### Flags
- `is_*` for boolean: `is_additional`, `is_mandatory`
- `has_*` for boolean: `has_budget_authority`

## Multi-Tenant Support

### Junction Tables
- `function_tenants` - Functions mapped to tenants
- `department_tenants` - Departments mapped to tenants
- `role_tenants` - Roles mapped to tenants
- `persona_tenants` - Personas mapped to tenants

### Tenant-aware Queries
Always filter by tenant_id or use junction tables:
```sql
SELECT r.*
FROM org_roles r
JOIN role_tenants rt ON r.id = rt.role_id
WHERE rt.tenant_id = '<tenant_uuid>';
```

## Implementation Order

### Phase 1: Foundation
1. Create evidence system
2. Enhance reference catalogs
3. Add role baseline attributes

### Phase 2: Junctions
4. Create role junction tables
5. Create persona junction tables

### Phase 3: Views
6. Create effective views
7. Test override pattern

### Phase 4: Data
8. Populate role baselines
9. Generate MECE personas
10. Add persona deltas

## File Locations

### Schema DDL
- Core schema: `10-data-schema/01-core-schema/`
- Role junctions: `10-data-schema/02-role-junctions/`
- Persona junctions: `10-data-schema/03-persona-junctions/`
- Effective views: `10-data-schema/04-views/`

### Seed Data
- Templates: `10-data-schema/05-seeds/`
- Tenants: `05-seeds/tenants/`
- Functions: `05-seeds/functions/`
- Departments: `05-seeds/departments/`
- Roles: `05-seeds/roles/`
- Personas: `05-seeds/personas/`

### Utilities
- Verification: `10-data-schema/07-utilities/verification/`
- Cleanup: `10-data-schema/07-utilities/cleanup/`
- Diagnostics: `10-data-schema/07-utilities/diagnostics/`

## Version History

- **v1.0** (2025-11-21): Initial gold standard implementation
  - 37 schema objects created
  - 10 role junctions, 10 persona junctions
  - 7 effective views
  - Full inheritance + override pattern

## Next Steps

1. **Populate Role Baselines**: Add responsibilities, tools, skills to roles
2. **Generate Personas**: Create 4 MECE personas per role
3. **Add Evidence**: Link attributes to evidence sources
4. **Create Function Extensions**: Medical Affairs, Commercial, etc.
5. **Build Analytics**: Materialized views for reporting

## References

- [Naming Conventions](./NAMING_CONVENTIONS.md)
- [Inheritance Pattern](./INHERITANCE_PATTERN.md)
- [Implementation Complete](./IMPLEMENTATION_COMPLETE_SUMMARY.md)
- [Core Schema Scripts](./01-core-schema/)
- [Seed Templates](./05-seeds/)

