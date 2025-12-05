# JTBD Schema Directory

**Version**: 2.0.0
**Last Updated**: November 23, 2025
**Status**: Active (Production Ready)

## Overview

This directory contains the complete **Jobs-to-Be-Done (JTBD) normalization system** for the VITAL platform. The JTBD architecture follows a fully normalized, multi-layered approach that separates concerns across demand, supply, behavioral, execution, value, and AI dimensions.

---

## Strategic Architecture

### Data Partitioning by Dimension

```
┌─────────────────────────────────────────────────────────────────┐
│                        JTBD = Demand-side                        │
│          "What + Why" - Universal Job Catalog                    │
│  - Job statements, desired outcomes, success criteria            │
│  - NOT organizational (no function/dept/role columns)            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │  Junction Tables    │
                    │  (ID + NAME cached) │
                    └─────────────────────┘
                              ↓
         ┌────────────────────┼────────────────────┐
         ↓                    ↓                    ↓
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ JTBD → Functions│  │ JTBD → Depts    │  │ JTBD → Roles    │
│  jtbd_functions │  │ jtbd_departments│  │  jtbd_roles     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         ↓                    ↓                    ↓
┌──────────────────────────────────────────────────────────────┐
│             Roles = Supply-side                               │
│       "Who + Organizational Expectation"                      │
│  - Structural job definition                                  │
│  - Personas INHERIT role's JTBD mappings                      │
└──────────────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────────────┐
│             Personas = Behavioral-side                        │
│       "How + Style + Preferences"                             │
│  - Behavioral overlay on role                                 │
│  - Inherits ALL JTBD mappings from role                       │
│  - Display: persona-specific attrs + role's JTBD attrs        │
└──────────────────────────────────────────────────────────────┘
```

### Layer Separation

| Layer | Purpose | Tables |
|-------|---------|--------|
| **JTBD Core** | Universal job catalog | `jtbd` |
| **Org Mapping** | JTBD → Function/Dept/Role | `jtbd_functions`, `jtbd_departments`, `jtbd_roles` |
| **Value Layer** | Impact & outcomes | `value_categories`, `value_drivers`, `jtbd_value_*` |
| **AI Layer** | Automation potential | `ai_intervention_types`, `jtbd_ai_suitability`, `ai_opportunities` |
| **Workflow Layer** | Execution steps | `workflow_templates`, `workflow_stages`, `workflow_tasks` |

---

## Directory Structure

```
jtbds/
├── README.md                              (This file)
├── JTBD_NORMALIZED_ARCHITECTURE.md        (Architecture documentation)
├── JTBD_SCHEMA_REFERENCE.md               (Complete schema reference)
├── JTBD_ORG_MAPPING_COMPLETE.md           (Org mapping details)
│
├── migrations/
│   ├── 00_EXECUTE_JTBD_NORMALIZATION.sql (Master execution script)
│   ├── 01_cleanup_jtbd_core.sql          (Phase 1: JTBD cleanup)
│   ├── 02_create_jtbd_org_mappings.sql   (Phase 2: Org mapping tables)
│   ├── 03_jtbd_name_sync_triggers.sql    (Phase 3: Auto-sync triggers)
│   ├── 04_create_value_layer.sql         (Phase 4: Value dimension)
│   ├── 05_create_ai_layer.sql            (Phase 5: AI dimension)
│   └── 06_create_unified_workflows.sql   (Phase 6: Workflow system)
│
└── views/
    └── jtbd_comprehensive_views.sql       (Aggregated query views)
```

---

## Migration Sequence

### Phase 1: JTBD Core Cleanup
**File**: `01_cleanup_jtbd_core.sql`

**Purpose**: Remove normalization violations from `jtbd` table

**Actions**:
- ✅ Backup existing `jtbd` table
- ✅ Drop dependent triggers
- ✅ Remove org structure columns (`function_id`, `department_id`, `role_id`)
- ✅ Migrate JSONB fields to normalized tables (KPIs, pain points, outcomes)
- ✅ Migrate array fields to normalized tables (success criteria)
- ✅ Remove duplicate/conflicting columns

**Rationale**: JTBDs are demand-side entities. Organizational structure (supply-side) belongs in junction tables.

---

### Phase 2: Org Mapping Tables
**File**: `02_create_jtbd_org_mappings.sql`

**Purpose**: Create junction tables for JTBD → Function/Department/Role mappings

**Tables Created**:
1. `jtbd_functions` - JTBD → Function mapping
2. `jtbd_departments` - JTBD → Department mapping  
3. Enhanced `jtbd_roles` - JTBD → Role mapping (consolidated from `role_jtbd`)

**Key Pattern: ID + NAME Caching**
```sql
CREATE TABLE jtbd_functions (
  id UUID PRIMARY KEY,
  jtbd_id UUID NOT NULL,
  function_id UUID NOT NULL,
  function_name TEXT NOT NULL,  -- Cached for performance
  relevance_score NUMERIC(3,2),
  is_primary BOOLEAN,
  ...
);
```

**Benefits**:
- ✅ Improved query performance (no joins needed for names)
- ✅ Better readability in reports
- ✅ Easier debugging
- ✅ Auto-synced via triggers

---

### Phase 3: Name Sync Triggers
**File**: `03_jtbd_name_sync_triggers.sql`

**Purpose**: Auto-populate and sync `_name` columns in junction tables

**Triggers Created**:
- `trigger_sync_jtbd_function_name` on `jtbd_functions`
- `trigger_sync_jtbd_department_name` on `jtbd_departments`
- `trigger_sync_jtbd_role_name` on `jtbd_roles`

**Example Trigger Function**:
```sql
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
```

**Backfill**: All existing records are updated with names on first run.

---

### Phase 4: Value Layer
**File**: `04_create_value_layer.sql`

**Purpose**: Capture value dimensions and business impact

**Tables Created**:
1. `value_categories` - 6 universal categories (Smarter, Faster, Better, Efficient, Safer, Scalable)
2. `value_drivers` - 13 internal/external drivers
3. `jtbd_value_categories` - JTBD → Value Category mapping
4. `jtbd_value_drivers` - JTBD → Value Driver mapping (with impact quantification)

**Value Categories**:
| Code | Name | Description |
|------|------|-------------|
| SMARTER | Smarter | Enhanced decision-making and intelligence |
| FASTER | Faster | Improved speed and efficiency |
| BETTER | Better | Higher quality outcomes |
| EFFICIENT | Efficient | Optimized resource utilization |
| SAFER | Safer | Reduced risk and improved safety |
| SCALABLE | Scalable | Growth capability and adaptability |

**Value Drivers** (examples):
- **Internal**: Operational Efficiency, Scientific Quality, Compliance, Cost Reduction
- **External**: HCP Experience, Patient Impact, Market Access, Stakeholder Trust

**Impact Quantification**:
```sql
CREATE TABLE jtbd_value_drivers (
  impact_strength NUMERIC(3,2),     -- 0-1 score
  quantified_value NUMERIC,         -- $ or hours saved
  value_unit TEXT,                  -- 'USD', 'hours', '%'
  confidence_level TEXT,            -- 'low', 'medium', 'high'
  ...
);
```

---

### Phase 5: AI Layer
**File**: `05_create_ai_layer.sql`

**Purpose**: Capture AI/automation potential and opportunities

**Tables Created**:
1. `ai_intervention_types` - 3 intervention modes (Automation, Augmentation, Redesign)
2. `jtbd_ai_suitability` - AI readiness scores per JTBD
3. `ai_opportunities` - Specific AI opportunities
4. `ai_use_cases` - Use cases per opportunity
5. `jtbd_context` - Preconditions, postconditions, triggers

**AI Suitability Scores**:
```sql
CREATE TABLE jtbd_ai_suitability (
  jtbd_id UUID,
  rag_score NUMERIC(3,2),           -- RAG capability fit
  summary_score NUMERIC(3,2),       -- Summarization fit
  generation_score NUMERIC(3,2),    -- Content generation fit
  classification_score NUMERIC(3,2),-- Classification fit
  reasoning_score NUMERIC(3,2),     -- Reasoning fit
  automation_score NUMERIC(3,2),    -- Full automation potential
  overall_ai_readiness NUMERIC(3,2),-- Overall score
  ...
);
```

**AI Opportunities**:
- Links to JTBD
- Automation vs augmentation potential
- Complexity & effort estimates
- Value quantification

---

### Phase 6: Unified Workflow System
**File**: `06_create_unified_workflows.sql`

**Purpose**: Consolidate 4 fragmented workflow systems into one canonical model

**Previous Problems**:
- ❌ `jtbd_workflow_stages` + `jtbd_workflow_activities`
- ❌ `process_activities` + `activity_*` tables
- ❌ `task_steps`
- ❌ Workflow engine tables
- ❌ Arrays for tools/skills (not normalized)

**New Structure**:
```
workflow_templates (top level)
  ↓
workflow_stages (major phases)
  ↓
workflow_tasks (granular steps)
  ↓
  ├── workflow_task_tools
  ├── workflow_task_skills
  ├── workflow_task_data_requirements
  └── workflow_task_pain_points
```

**Benefits**:
- ✅ Single source of truth
- ✅ Fully normalized (no arrays)
- ✅ Clear hierarchy
- ✅ Reusable across JTBDs

---

## Comprehensive Views

**File**: `views/jtbd_comprehensive_views.sql`

### 1. `v_jtbd_complete`
**Purpose**: Single view with all JTBD dimensions aggregated

**Columns**:
- Core: `id`, `code`, `name`, `job_statement`, `complexity`, `frequency`
- Value: `value_categories`, `value_drivers` (comma-separated)
- AI: `overall_ai_readiness`, `automation_score`, `intervention_type`
- Org: `functions`, `departments`, `roles` (comma-separated from junctions)
- Counts: `pain_point_count`, `desired_outcome_count`, `kpi_count`

**Usage**:
```sql
SELECT * FROM v_jtbd_complete
WHERE 'regulatory_affairs' = ANY(string_to_array(functions, ', '));
```

---

### 2. `v_persona_jtbd_inherited`
**Purpose**: Show how personas inherit JTBDs from roles

**Key Insight**: Personas do NOT store JTBD mappings directly. They inherit from their role.

**Columns**:
- `persona_id`, `persona_name`, `archetype`
- `role_id`, `role_name`
- `jtbd_id`, `jtbd_code`, `jtbd_name`
- `relevance_score`, `importance`, `frequency`
- `source` = 'inherited_from_role'

**Usage**:
```sql
SELECT * FROM v_persona_jtbd_inherited
WHERE persona_id = '<uuid>'
ORDER BY relevance_score DESC;
```

---

### 3. `v_jtbd_by_org`
**Purpose**: Easy filtering by organizational entity

**Structure**: UNION of Function/Department/Role perspectives

**Usage**:
```sql
-- Get all JTBDs for Medical Affairs function
SELECT * FROM v_jtbd_by_org
WHERE entity_type = 'function' AND entity_name = 'Medical Affairs';

-- Get all JTBDs for MSL role
SELECT * FROM v_jtbd_by_org
WHERE entity_type = 'role' AND entity_name = 'Medical Science Liaison';
```

---

## Key Principles

### 1. Normalization
- ❌ **NO JSONB** for queryable data
- ❌ **NO arrays** for multi-valued attributes
- ✅ **Junction tables** for all relationships
- ✅ **Text columns** for scalar attributes

### 2. ID + NAME Pattern
- All junction tables cache the human-readable name
- Auto-synced via triggers on INSERT/UPDATE
- Performance: No joins needed for display
- Debugging: Names visible in raw table queries

### 3. Role → Persona Inheritance
- **Roles** own JTBD mappings (structural)
- **Personas** inherit from role (no duplication)
- **Display**: Show persona-specific attrs + role's JTBD attrs
- **Query**: Use `v_persona_jtbd_inherited` view

### 4. Layer Separation
- **Demand** (JTBD core) ≠ **Supply** (Roles)
- **Value** (outcomes) ≠ **AI** (automation)
- **Workflow** (execution) = reusable process templates
- No cross-contamination

### 5. Evidence & Audit
- All data traceable to source
- Confidence levels tracked
- Methodology documented
- Created/updated timestamps

---

## Schema Compliance Checklist

✅ **JTBD Core**
- No function_id, department_id, role_id columns
- No JSONB or array fields
- Only scalar attributes

✅ **Junction Tables**
- ID + NAME cached pattern
- Auto-sync triggers enabled
- Unique constraints on (jtbd_id, org_entity_id)

✅ **Normalized Children**
- jtbd_pain_points (was JSONB)
- jtbd_kpis (was JSONB)
- jtbd_desired_outcomes (was JSONB)
- jtbd_success_criteria (was array)

✅ **Value Layer**
- Reference tables (value_categories, value_drivers)
- Mapping tables with quantification

✅ **AI Layer**
- Suitability scores
- Opportunities with use cases
- Context (preconditions/postconditions/triggers)

✅ **Workflow Layer**
- 4-level hierarchy (template → stage → task → details)
- All tools/skills/data in junction tables
- No arrays

---

## Common Query Patterns

### Get all JTBDs for a Role
```sql
SELECT j.*, jr.relevance_score, jr.importance, jr.frequency
FROM jtbd j
JOIN jtbd_roles jr ON j.id = jr.jtbd_id
WHERE jr.role_id = '<role_uuid>'
ORDER BY jr.relevance_score DESC;
```

### Get all JTBDs for a Persona (via Role inheritance)
```sql
SELECT * FROM v_persona_jtbd_inherited
WHERE persona_id = '<persona_uuid>';
```

### Get complete JTBD with all dimensions
```sql
SELECT * FROM v_jtbd_complete
WHERE id = '<jtbd_uuid>';
```

### Get JTBDs by Value Category
```sql
SELECT j.*
FROM jtbd j
JOIN jtbd_value_categories jvc ON j.id = jvc.jtbd_id
JOIN value_categories vc ON jvc.category_id = vc.id
WHERE vc.code = 'SMARTER';
```

### Get high AI-suitable JTBDs
```sql
SELECT j.*, ai.overall_ai_readiness, ai.automation_score
FROM jtbd j
JOIN jtbd_ai_suitability ai ON j.id = ai.jtbd_id
WHERE ai.overall_ai_readiness >= 0.7
ORDER BY ai.automation_score DESC;
```

---

## Migration Execution

### Run All Migrations
```bash
# Execute master script (runs all phases in sequence)
psql $DATABASE_URL -f migrations/00_EXECUTE_JTBD_NORMALIZATION.sql
```

### Run Individual Phases
```bash
# Phase 1: Cleanup
psql $DATABASE_URL -f migrations/01_cleanup_jtbd_core.sql

# Phase 2: Org Mappings
psql $DATABASE_URL -f migrations/02_create_jtbd_org_mappings.sql

# Phase 3: Triggers
psql $DATABASE_URL -f migrations/03_jtbd_name_sync_triggers.sql

# Phase 4: Value Layer
psql $DATABASE_URL -f migrations/04_create_value_layer.sql

# Phase 5: AI Layer
psql $DATABASE_URL -f migrations/05_create_ai_layer.sql

# Phase 6: Workflows
psql $DATABASE_URL -f migrations/06_create_unified_workflows.sql

# Create Views
psql $DATABASE_URL -f views/jtbd_comprehensive_views.sql
```

### Verify Migration Success
```sql
-- Check JTBD table is clean
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'jtbd'
AND column_name IN ('function_id', 'department_id', 'role_id', 'kpis', 'pain_points');
-- Should return 0 rows

-- Check junction tables exist
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('jtbd_functions', 'jtbd_departments', 'jtbd_roles');
-- Should return 3 rows

-- Check views exist
SELECT table_name FROM information_schema.views
WHERE table_name LIKE 'v_jtbd%' OR table_name LIKE 'v_persona_jtbd%';
-- Should return 3+ rows
```

---

## Troubleshooting

### Issue: Column still exists after migration
**Symptom**: `function_id` or similar column still present in `jtbd` table

**Solution**:
```sql
-- Check for dependent objects
SELECT * FROM pg_depend
WHERE refobjid = 'public.jtbd'::regclass;

-- Drop with CASCADE if needed
ALTER TABLE jtbd DROP COLUMN function_id CASCADE;
```

---

### Issue: Trigger not firing
**Symptom**: `_name` columns remain NULL after insert

**Solution**:
```sql
-- Check trigger exists
SELECT * FROM pg_trigger WHERE tgname LIKE '%sync%';

-- Manually backfill
UPDATE jtbd_functions jf
SET function_name = f.name
FROM org_functions f
WHERE jf.function_id = f.id AND jf.function_name IS NULL;
```

---

### Issue: View query slow
**Symptom**: `v_jtbd_complete` takes > 1s

**Solution**:
```sql
-- Create indexes on junction tables
CREATE INDEX IF NOT EXISTS idx_jtbd_functions_jtbd ON jtbd_functions(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_departments_jtbd ON jtbd_departments(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_roles_jtbd ON jtbd_roles(jtbd_id);

-- Consider materialized view
CREATE MATERIALIZED VIEW mv_jtbd_complete AS
SELECT * FROM v_jtbd_complete;

-- Refresh periodically
REFRESH MATERIALIZED VIEW mv_jtbd_complete;
```

---

## References

- **GOLD_STANDARD_SCHEMA.md** - Overall database architecture
- **NAMING_CONVENTIONS.md** - Database naming standards
- **JTBD_NORMALIZED_ARCHITECTURE.md** - Detailed architecture docs
- **JTBD_SCHEMA_REFERENCE.md** - Complete schema reference

---

## Next Steps

1. ✅ **Populate seed data** - Create sample JTBDs across all pharma functions
2. ✅ **Map to roles** - Populate `jtbd_roles` for all 120 roles
3. ⬜ **Add value mappings** - Link JTBDs to value categories/drivers
4. ⬜ **Score AI suitability** - Populate `jtbd_ai_suitability` table
5. ⬜ **Create workflows** - Build workflow templates for key JTBDs
6. ⬜ **Build analytics** - Dashboards for JTBD coverage, AI readiness, value impact

---

**Last Migration**: Phase 6 - Unified Workflows (2024-11-21)  
**Status**: ✅ All migrations successful  
**Next Review**: After seed data population
