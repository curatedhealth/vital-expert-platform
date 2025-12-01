# L3 Responsibility Layer - Schema Assessment

## Executive Summary

**Schema Quality**: 🟢 Good - Tables are well-normalized with minimal JSONB
**Data Population**: 🔴 Critical Gaps - Junction tables are empty

---

## Current Schema Structure

### Core Tables (✅ Good Structure)

| Table | Records | JSONB Columns | Status |
|-------|---------|---------------|--------|
| `jtbd` | 303 | None | ✅ Well-structured |
| `jtbd_outcomes` | 6 | None | ✅ Needs data |
| `responsibilities` | 39 | None | ✅ Needs more data |
| `tasks` | 11 | `tags` ⚠️ | Needs normalization |
| `deliverables` | 0 | None | ❌ Empty |

### Junction Tables (❌ Critical - Empty)

| Table | Records | Purpose |
|-------|---------|---------|
| `jtbd_roles` | 0 | Link JTBD to Roles |
| `jtbd_departments` | 0 | Link JTBD to Departments |
| `jtbd_functions` | 0 | Link JTBD to Functions |
| `jtbd_personas` | 0 | Link JTBD to Personas |
| `role_responsibilities` | 0 | Link Roles to Responsibilities |
| `persona_responsibilities` | 0 | Link Personas to Responsibilities |
| `agent_responsibilities` | 1,000 | ✅ Populated |

---

## JTBD Table Schema (Gold Standard)

```
jtbd
├── id                    UUID PRIMARY KEY
├── tenant_id             UUID FK
├── code                  VARCHAR      -- e.g., "JTBD-MA-004"
├── name                  VARCHAR      -- "Optimize Formulary Positioning"
├── description           TEXT
├── job_statement         TEXT         -- Core JTBD statement
├── desired_outcome       TEXT
├── when_situation        TEXT         -- "When I am..."
├── circumstance          TEXT
├── job_category          VARCHAR      -- strategic/operational
├── job_type              VARCHAR
├── functional_area       VARCHAR      -- e.g., "Market Access"
├── complexity            VARCHAR
├── frequency             VARCHAR
├── status                VARCHAR
├── validation_score      FLOAT
├── strategic_priority_id UUID FK
├── domain_id             UUID FK
├── industry_id           UUID FK
├── created_at            TIMESTAMP
├── updated_at            TIMESTAMP
└── deleted_at            TIMESTAMP
```

**Assessment**: ✅ Excellent normalized structure, no JSONB

---

## Issues to Fix

### 1. Tasks Table - JSONB Column

```sql
-- Current (problematic)
tasks.tags  -- JSONB array

-- Solution: Create junction table
CREATE TABLE task_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id),
  tag_id UUID REFERENCES ref_tags(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ref_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  category VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. Missing Junction Table Data

All JTBD-to-org-structure links are empty. Need to populate:

| Junction | Source | Target | Expected Records |
|----------|--------|--------|------------------|
| `jtbd_roles` | 303 JTBDs | 858 roles | ~1,500-2,500 |
| `jtbd_functions` | 303 JTBDs | 26 functions | ~300-600 |
| `jtbd_departments` | 303 JTBDs | 136 depts | ~500-1,000 |
| `role_responsibilities` | 858 roles | 39 resp | ~1,000-2,000 |

---

## Data Quality Issues

### JTBDs without Outcomes
- 303 JTBDs exist
- Only 6 have outcomes defined
- **297 JTBDs need outcomes** (98% gap)

### Responsibilities Coverage
- Only 39 responsibilities defined
- 858 roles exist
- **Need ~100-200 responsibilities** for good coverage

### Missing Deliverables
- 0 deliverables defined
- Each responsibility should have 2-5 deliverables
- **Need ~100-500 deliverables**

---

## Recommended Schema Additions

### 1. Normalize Tags

```sql
-- Reference table for tags
CREATE TABLE IF NOT EXISTS ref_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Junction table
CREATE TABLE IF NOT EXISTS task_tags (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES ref_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);
```

### 2. Link Responsibilities to Skills/Capabilities

```sql
CREATE TABLE IF NOT EXISTS responsibility_skills (
  responsibility_id UUID REFERENCES responsibilities(id),
  skill_id UUID REFERENCES skills(id),
  proficiency_required VARCHAR(20), -- entry/intermediate/senior/expert
  PRIMARY KEY (responsibility_id, skill_id)
);

CREATE TABLE IF NOT EXISTS responsibility_capabilities (
  responsibility_id UUID REFERENCES capabilities(id),
  capability_id UUID REFERENCES capabilities(id),
  importance VARCHAR(20), -- critical/important/nice-to-have
  PRIMARY KEY (responsibility_id, capability_id)
);
```

### 3. JTBD Activities (Missing)

```sql
CREATE TABLE IF NOT EXISTS jtbd_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID REFERENCES jtbd(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  sequence_order INTEGER,
  estimated_duration_minutes INTEGER,
  activity_type VARCHAR(50), -- research/analysis/communication/execution
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Action Plan

### Phase 1: Schema Fixes (Immediate)
1. ✅ Create `ref_tags` and `task_tags` tables
2. ✅ Create `responsibility_skills` junction
3. ✅ Create `responsibility_capabilities` junction
4. ✅ Create `jtbd_activities` table

### Phase 2: Data Population (This Session)
1. Populate `jtbd_functions` - Link 303 JTBDs to 26 functions
2. Populate `jtbd_roles` - Link JTBDs to relevant roles
3. Populate `role_responsibilities` - Link 858 roles to 39+ responsibilities
4. Expand `responsibilities` table to ~100 entries

### Phase 3: Enrichment (Follow-up)
1. Add outcomes to 297 JTBDs
2. Populate deliverables for each responsibility
3. Link responsibilities to skills and capabilities
