# Complete JTBD Architecture Documentation

**Last Updated**: 2024-11-21  
**Status**: Complete  
**Related Files**: 
- Migration: `06-migrations/phase1_foundation_cleanup.sql` through `phase3_value_ai_layers.sql`
- Views: `04-views/jtbd_comprehensive_views.sql`
- Guides: `DATA_OWNERSHIP_GUIDE.md`, `QUERY_EXAMPLES.md`

**Golden Rules Implemented**: Rule #1 (Zero JSONB), Rule #2 (Full Normalization), Rule #3 (TEXT[] for simple lists), Rule #4 (ID + NAME Pattern)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Principles](#core-principles)
3. [Schema Reference](#schema-reference)
4. [Junction Pattern: ID + NAME](#junction-pattern-id--name)
5. [Migration History](#migration-history)
6. [Data Ownership Boundaries](#data-ownership-boundaries)
7. [Query Patterns](#query-patterns)
8. [Backward Compatibility](#backward-compatibility)

---

## Architecture Overview

### System Layers

The JTBD system is organized into 6 distinct architectural layers, each with clear ownership and purpose:

```
┌─────────────────────────────────────────────────────────────┐
│                    JTBD CORE TABLE                          │
│  Universal Job Catalog - The "WHAT + WHY"                   │
│  Columns: id, code, name, description, complexity, etc.     │
└─────────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ ORG MAPPINGS   │ │  VALUE LAYER   │ │   AI LAYER     │
│ Functions      │ │ Categories     │ │ Suitability    │
│ Departments    │ │ Drivers        │ │ Opportunities  │
│ Roles          │ │                │ │ Use Cases      │
└────────────────┘ └────────────────┘ └────────────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              DETAIL & CONTEXT TABLES                        │
│  Pain Points | Desired Outcomes | KPIs | Success Criteria   │
│  Tags | Context (Preconditions/Postconditions/Triggers)     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         PERSONAS (Inherit JTBDs from Roles)                 │
│  Behavioral overlay on organizational structure             │
└─────────────────────────────────────────────────────────────┘
```

### Layer Definitions

| Layer | Purpose | Owner | Tables |
|-------|---------|-------|--------|
| **JTBD Core** | Universal job catalog | Product/Research | `jtbd` |
| **Org Mappings** | Organizational structure | HR/Operations | `jtbd_functions`, `jtbd_departments`, `jtbd_roles` |
| **Value Layer** | Business impact | Strategy/Finance | `value_categories`, `value_drivers`, `jtbd_value_categories`, `jtbd_value_drivers` |
| **AI Layer** | Automation potential | AI/Engineering | `ai_intervention_types`, `jtbd_ai_suitability`, `ai_opportunities`, `ai_use_cases` |
| **Detail & Context** | Job specifications | Research/Product | `jtbd_pain_points`, `jtbd_desired_outcomes`, `jtbd_kpis`, `jtbd_success_criteria`, `jtbd_tags`, `jtbd_context` |
| **Personas** | Behavioral archetypes | UX/Research | `personas` (inherit via `role_id`) |

---

## Core Principles

### 1. Data Ownership Separation

**JTBD = Demand-side** (What + Why)
- Universal job catalog
- Industry/domain agnostic core
- Focused on the job itself, not who does it

**Roles = Supply-side** (Who + Organizational Expectation)
- Organizational structure
- Job titles and hierarchy
- Structural responsibilities

**Personas = Behavioral-side** (How + Style + Preferences)
- User archetypes based on seniority × geography
- Behavioral overlays
- Work styles and preferences

**Value Layer = Impact-side** (Value + Outcomes)
- Business value categories (SMARTER, FASTER, BETTER, etc.)
- Value drivers (internal/external)
- Quantified impact

**AI Layer = Intelligence-side** (Automation + Augmentation)
- AI suitability scores
- Intervention opportunities
- Implementation complexity

### 2. Junction Table Pattern: "ID + NAME"

All many-to-many relationships use junction tables with **both foreign key ID and cached name**:

```sql
CREATE TABLE jtbd_roles (
  id UUID PRIMARY KEY,
  jtbd_id UUID REFERENCES jtbd(id),
  role_id UUID REFERENCES org_roles(id),
  role_name TEXT NOT NULL,  -- ← Cached for performance
  -- ... additional junction attributes
);
```

**Benefits:**
- ✅ Fast queries without joins
- ✅ Human-readable debugging
- ✅ Audit trail (names change, history preserved)
- ✅ Auto-sync via triggers

### 3. Zero JSONB for Structured Data

**Before (Anti-pattern):**
```sql
-- ❌ BAD: Can't query, filter, or join efficiently
pain_points JSONB
```

**After (Normalized):**
```sql
-- ✅ GOOD: Fully queryable and indexable
CREATE TABLE jtbd_pain_points (
  id UUID PRIMARY KEY,
  jtbd_id UUID REFERENCES jtbd(id),
  issue TEXT NOT NULL,
  severity TEXT,
  frequency TEXT,
  impact TEXT
);
```

### 4. Inheritance: Personas → Roles → JTBDs

Personas inherit ALL JTBDs from their assigned role:

```
org_roles (1) ─────→ (M) jtbd_roles ────→ (M) jtbd
    ↑
    │ role_id
    │
personas (inherit all JTBDs)
```

**Query Pattern:**
```sql
SELECT p.name, j.name 
FROM personas p
JOIN org_roles r ON p.role_id = r.id
JOIN jtbd_roles jr ON r.id = jr.role_id
JOIN jtbd j ON jr.jtbd_id = j.id;
```

Or simply: `SELECT * FROM v_persona_jtbd_inherited;`

---

## Schema Reference

### Core Tables

#### `jtbd` - Jobs to Be Done
Primary table storing universal job definitions.

**Key Columns:**
- `id` (UUID, PK) - Unique identifier
- `code` (TEXT, UNIQUE, NOT NULL) - Human-readable code (e.g., "MA-001")
- `name` (TEXT, NOT NULL) - Job name
- `description` (TEXT) - Detailed description
- `circumstance` (TEXT) - Context/situation
- `desired_outcome` (TEXT) - Expected result
- `job_type` (TEXT) - Type classification
- `functional_area` (ENUM) - Primary functional area
- `job_category` (ENUM) - Category classification
- `complexity` (ENUM: low, medium, high, very_high)
- `frequency` (ENUM: daily, weekly, monthly, quarterly, annually, ad_hoc)
- `status` (ENUM: draft, active, deprecated)
- `validation_score` (NUMERIC) - Quality score
- `tenant_id` (UUID) - Multi-tenant support
- `strategic_priority_id`, `domain_id`, `industry_id` (UUID) - Reference IDs

**Note:** Does NOT contain organizational structure columns (those are in junction tables).

### Organizational Mapping Tables

#### `jtbd_functions`
Maps JTBDs to organizational functions.

**Columns:**
- `id` (UUID, PK)
- `jtbd_id` (UUID, FK → jtbd.id)
- `function_id` (UUID, FK → org_functions.id)
- `function_name` (TEXT, NOT NULL) - Cached name
- `relevance_score` (NUMERIC 0-1)
- `is_primary` (BOOLEAN)
- `mapping_source` (TEXT: manual, ai_generated, imported)
- `tenant_id` (UUID)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Unique Constraint:** `(jtbd_id, function_id)`

#### `jtbd_departments`
Maps JTBDs to departments.

**Columns:** Same pattern as `jtbd_functions` with `department_id` + `department_name`

#### `jtbd_roles`
Maps JTBDs to roles.

**Columns:**
- Standard junction fields (id, jtbd_id, role_id, role_name)
- `importance` (TEXT: critical, high, medium, low)
- `frequency` (TEXT: daily, weekly, monthly, etc.)
- `sequence_order` (INTEGER) - Order in role workflow
- `relevance_score` (NUMERIC 0-1)
- `is_primary` (BOOLEAN) - Is this a primary responsibility?
- `mapping_source` (TEXT)
- `tenant_id` (UUID)

**Note:** Consolidated from deprecated `role_jtbd` table.

### Value Layer Tables

#### `value_categories` (Reference Table)
6 standard value categories.

**Seeded Data:**
- SMARTER: Enhanced decision-making
- FASTER: Improved speed
- BETTER: Higher quality
- EFFICIENT: Optimized resources
- SAFER: Reduced risk
- SCALABLE: Growth capability

#### `value_drivers` (Reference Table)
9 value drivers (5 internal, 4 external).

**Internal Drivers:**
- OPERATIONAL_EFFICIENCY
- SCIENTIFIC_QUALITY
- COMPLIANCE
- COST_REDUCTION
- EMPLOYEE_EXPERIENCE

**External Drivers:**
- HCP_EXPERIENCE
- PATIENT_IMPACT
- MARKET_ACCESS
- STAKEHOLDER_TRUST

#### `jtbd_value_categories`
Junction: JTBD → Value Category

**Columns:**
- `jtbd_id`, `category_id`
- `relevance_score` (NUMERIC 0-1)

#### `jtbd_value_drivers`
Junction: JTBD → Value Driver

**Columns:**
- `jtbd_id`, `driver_id`
- `impact_strength` (NUMERIC 0-1)
- `quantified_value_usd` (NUMERIC) - Optional quantification

### AI Layer Tables

#### `ai_intervention_types` (Reference Table)
3 intervention types.

**Seeded Data:**
- AUTOMATION: Fully automate tasks
- AUGMENTATION: Enhance human capabilities
- REDESIGN: Transform the process

#### `jtbd_ai_suitability`
AI readiness scores per JTBD.

**Columns:**
- `jtbd_id` (UUID, UNIQUE, FK)
- `rag_score` (NUMERIC 0-1) - Retrieval Augmented Generation
- `summary_score` (NUMERIC 0-1)
- `generation_score` (NUMERIC 0-1)
- `classification_score` (NUMERIC 0-1)
- `reasoning_score` (NUMERIC 0-1)
- `automation_score` (NUMERIC 0-1)
- `overall_ai_readiness` (NUMERIC 0-1)
- `intervention_type_id` (UUID, FK)

#### `ai_opportunities`
Specific AI opportunities for JTBDs.

**Columns:**
- `jtbd_id` (UUID, FK)
- `opportunity_name` (TEXT)
- `description` (TEXT)
- `automation_potential` (NUMERIC 0-1)
- `augmentation_potential` (NUMERIC 0-1)
- `intervention_type_id` (UUID, FK)
- `complexity` (ENUM: low, medium, high, very_high)
- `value_estimate_usd` (NUMERIC)
- `implementation_effort` (ENUM)

#### `ai_use_cases`
Use cases linked to opportunities.

**Columns:**
- `opportunity_id` (UUID, FK → ai_opportunities.id)
- `use_case_name` (TEXT)
- `description` (TEXT)
- `service_layer` (TEXT)

### Detail & Context Tables

#### `jtbd_pain_points`
**Columns:** `jtbd_id`, `issue`, `severity`, `pain_point_type`, `frequency`, `impact`

#### `jtbd_desired_outcomes`
**Columns:** `jtbd_id`, `outcome`, `importance` (1-5), `outcome_type`, `measurement`

#### `jtbd_kpis`
**Columns:** `jtbd_id`, `kpi_name`, `kpi_description`, `kpi_type`, `target_value`, `measurement_unit`

#### `jtbd_success_criteria`
**Columns:** `jtbd_id`, `criterion`, `measurement`, `threshold`

#### `jtbd_tags`
**Columns:** `jtbd_id`, `tag`

#### `jtbd_context`
**Columns:** `jtbd_id`, `context_type` (precondition/postcondition/trigger), `context_text`, `sequence_order`

---

## Junction Pattern: ID + NAME

### Auto-Sync Triggers

All junction tables with cached names have auto-sync triggers:

```sql
-- Example: Auto-sync function_name in jtbd_functions
CREATE OR REPLACE FUNCTION sync_jtbd_function_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.function_id IS NOT NULL THEN
    SELECT name INTO NEW.function_name
    FROM org_functions
    WHERE id = NEW.function_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_jtbd_function_name
  BEFORE INSERT OR UPDATE OF function_id ON jtbd_functions
  FOR EACH ROW
  EXECUTE FUNCTION sync_jtbd_function_name();
```

### Benefits in Practice

**Fast Aggregation:**
```sql
-- No joins needed for display!
SELECT 
  j.name,
  STRING_AGG(jr.role_name, ', ') as roles
FROM jtbd j
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id
GROUP BY j.id, j.name;
```

**Audit Trail:**
```sql
-- Track name changes over time
SELECT role_id, role_name, created_at
FROM jtbd_roles
WHERE role_id = '...'
ORDER BY created_at DESC;
```

---

## Migration History

### Phase 1: Foundation Cleanup & Consolidation
**File:** `06-migrations/phase1_foundation_cleanup.sql`

**Changes:**
- ✅ Removed org structure columns from `jtbd` table
- ✅ Created `jtbd_functions`, `jtbd_departments` with ID+NAME pattern
- ✅ Enhanced `jtbd_roles` with additional attributes
- ✅ Consolidated duplicate table `role_jtbd` into `jtbd_roles`
- ✅ Created auto-sync triggers for all name fields
- ✅ Backfilled all cached names

**Tables Dropped:**
- `role_jtbd` (consolidated into `jtbd_roles`)

**Columns Dropped from `jtbd`:**
- `function_id`, `function_name`
- `department_id`, `department_name`
- `role_id`, `role_name`
- `persona_id`, `org_function_id`

### Phase 2: Array & JSONB Normalization
**File:** `06-migrations/phase2_array_jsonb_cleanup.sql`

**Changes:**
- ✅ Migrated JSONB → normalized tables: `kpis`, `pain_points`, `desired_outcomes`
- ✅ Migrated arrays → normalized tables: `success_criteria`, `tags`
- ✅ Dropped all JSONB/array columns from `jtbd`
- ✅ Removed duplicate fields: `jtbd_code`, `category`, `unique_id`, `workflow_id`

**Data Migrated:**
- 5 KPIs
- 7 Pain Points
- 91 Desired Outcomes
- 504 Success Criteria
- 0 Tags (none existed)

**Columns Dropped from `jtbd`:**
- `kpis` (JSONB)
- `pain_points` (JSONB)
- `desired_outcomes` (JSONB)
- `metadata` (JSONB)
- `success_criteria` (ARRAY)
- `tags` (ARRAY)

### Phase 3: Value & AI Layers
**File:** `06-migrations/phase3_value_ai_layers.sql`

**Changes:**
- ✅ Created Value Layer reference tables + junctions
- ✅ Created AI Layer reference tables + assessment tables
- ✅ Seeded 6 value categories, 9 value drivers, 3 AI intervention types
- ✅ Created `jtbd_context` for preconditions/postconditions/triggers
- ✅ Dropped deprecated AI tables

**New Tables:**
- Reference: `value_categories`, `value_drivers`, `ai_intervention_types`
- Junctions: `jtbd_value_categories`, `jtbd_value_drivers`
- Assessments: `jtbd_ai_suitability`, `ai_opportunities`, `ai_use_cases`, `jtbd_context`

### Phase 4: Comprehensive Views
**File:** `04-views/jtbd_comprehensive_views.sql`

**Changes:**
- ✅ Created 5 aggregated views for easy querying

**Views Created:**
1. `v_jtbd_complete` - Complete JTBD with all mappings (241 rows)
2. `v_persona_jtbd_inherited` - Persona → Role → JTBD inheritance (0 rows - awaiting mappings)
3. `v_jtbd_by_org` - Filter by function/department/role (0 rows - awaiting mappings)
4. `v_jtbd_value_ai_summary` - Value + AI quick summary (241 rows)
5. `v_role_persona_jtbd_hierarchy` - Complete org hierarchy (675 rows)

---

## Data Ownership Boundaries

### What Goes Where?

| Data Type | Table | Rationale |
|-----------|-------|-----------|
| Job name, description | `jtbd` | Core job definition |
| Complexity, frequency | `jtbd` | Intrinsic job attributes |
| Organizational mapping | `jtbd_roles`, `jtbd_departments`, `jtbd_functions` | Varies by organization |
| Importance to role | `jtbd_roles.importance` | Role-specific context |
| Work style preferences | `personas` | Behavioral overlay |
| Business value | `jtbd_value_drivers` | Strategic assessment |
| AI suitability | `jtbd_ai_suitability` | Technical feasibility |
| Pain points | `jtbd_pain_points` | Job research data |
| KPIs | `jtbd_kpis` | Job performance metrics |

### Anti-Patterns to Avoid

❌ **Don't:** Put organizational structure in `jtbd` table
✅ **Do:** Use junction tables (`jtbd_roles`, etc.)

❌ **Don't:** Store persona-specific preferences in `jtbd`
✅ **Do:** Store in `personas` table

❌ **Don't:** Use JSONB for structured, queryable data
✅ **Do:** Create normalized tables

❌ **Don't:** Duplicate data across tables
✅ **Do:** Use foreign keys and joins

---

## Query Patterns

### Using Views (Recommended)

```sql
-- Get complete JTBD with all mappings
SELECT * FROM v_jtbd_complete WHERE code = 'MA-001';

-- Get all JTBDs for a persona
SELECT * FROM v_persona_jtbd_inherited 
WHERE persona_name = 'Senior Medical Director - Global';

-- Get all JTBDs for a specific role
SELECT * FROM v_jtbd_by_org 
WHERE entity_type = 'role' 
  AND entity_name = 'Clinical Research Manager';

-- Get high-priority AI opportunities
SELECT * FROM v_jtbd_value_ai_summary 
WHERE overall_ai_readiness > 0.7 
ORDER BY priority_score DESC;
```

### Direct Queries

```sql
-- Get JTBD with role mappings
SELECT 
  j.name,
  STRING_AGG(jr.role_name, ', ') as roles
FROM jtbd j
JOIN jtbd_roles jr ON j.id = jr.jtbd_id
WHERE j.tenant_id = '...'
GROUP BY j.id, j.name;

-- Get pain points for a JTBD
SELECT issue, severity, frequency
FROM jtbd_pain_points
WHERE jtbd_id = '...'
ORDER BY 
  CASE severity 
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    ELSE 4
  END;

-- Get AI opportunities by complexity
SELECT 
  j.name,
  ao.opportunity_name,
  ao.complexity,
  ao.value_estimate_usd
FROM ai_opportunities ao
JOIN jtbd j ON ao.jtbd_id = j.id
WHERE ao.complexity IN ('low', 'medium')
ORDER BY ao.value_estimate_usd DESC NULLS LAST;
```

See `QUERY_EXAMPLES.md` for more patterns.

---

## Backward Compatibility

### Deprecated Tables

The following tables were consolidated or replaced during migration:

| Old Table | Status | Replacement |
|-----------|--------|-------------|
| `role_jtbd` | Dropped | `jtbd_roles` (enhanced) |
| `jtbd_gen_ai_opportunities` | Dropped | `ai_opportunities` + `ai_use_cases` |

### Migration Rollback

If rollback is needed:

1. Restore from backup: `jtbd_backup_phase1`
2. Re-run pre-migration schema if available
3. Contact data team for assistance

**Note:** Rollback NOT recommended after Phase 2+ due to data transformations.

---

## Next Steps

1. **Populate Mappings:** Create JTBD → Role mappings via `jtbd_roles`
2. **Add Value Assessments:** Map JTBDs to value categories/drivers
3. **Score AI Suitability:** Assess JTBDs for AI readiness
4. **Create Use Cases:** Define specific AI opportunities

See `DATA_OWNERSHIP_GUIDE.md` for decision-making framework.

---

## Related Documentation

- **Data Ownership Guide**: `DATA_OWNERSHIP_GUIDE.md`
- **Query Examples**: `QUERY_EXAMPLES.md`
- **Migration Summary**: `06-migrations/MIGRATION_COMPLETE_SUMMARY.md`
- **Gold Standard Schema**: `GOLD_STANDARD_SCHEMA.md`

---

**Questions or Issues?** Contact the Data Engineering team or consult `.claude.md` for AI agent guidance.

