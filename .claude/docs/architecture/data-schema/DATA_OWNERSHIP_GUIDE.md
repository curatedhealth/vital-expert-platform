# Data Ownership Guide: JTBD System

**Last Updated**: 2024-11-21  
**Status**: Complete  
**Related Files**: `COMPLETE_JTBD_ARCHITECTURE.md`, `QUERY_EXAMPLES.md`

---

## Purpose

This guide provides a decision-making framework for determining **which table should store which data** in the JTBD system. Use this when:
- Creating new attributes
- Migrating existing data
- Designing new features
- Resolving data model ambiguities

---

## Quick Decision Matrix

| If the data describes... | Store in... | Example |
|--------------------------|-------------|---------|
| **The job itself** (universal, industry-agnostic) | `jtbd` | Job name, complexity, desired outcome |
| **How this job maps to org structure** | `jtbd_functions`, `jtbd_departments`, `jtbd_roles` | Which roles perform this job |
| **How important this job is to a role** | `jtbd_roles` (junction attributes) | Importance: critical/high/medium/low |
| **Business value created** | `jtbd_value_categories`, `jtbd_value_drivers` | SMARTER, FASTER, COMPLIANCE |
| **AI automation potential** | `jtbd_ai_suitability`, `ai_opportunities` | RAG score, automation score |
| **Job research findings** | `jtbd_pain_points`, `jtbd_desired_outcomes` | Pain points, user needs |
| **Job performance metrics** | `jtbd_kpis` | Success criteria, KPIs |
| **Contextual triggers** | `jtbd_context` | Preconditions, postconditions |
| **Behavioral preferences** | `personas` | Work style, communication preferences |
| **Organizational structure** | `org_roles`, `org_functions`, `org_departments` | Role hierarchy, reporting structure |

---

## Detailed Decision Trees

### Decision Tree 1: Is This Core JTBD Data?

```
Is this attribute intrinsic to the job itself, 
regardless of WHO does it or WHERE it's done?
│
├─ YES → Store in `jtbd` table
│   Examples:
│   ✓ Job name, description
│   ✓ Desired outcome (core to job)
│   ✓ Circumstance (when job arises)
│   ✓ Job type (strategic, operational, etc.)
│   ✓ Complexity (intrinsic to job)
│   ✓ Industry/domain classification
│
└─ NO → Go to Decision Tree 2
```

### Decision Tree 2: Is This Organizational Context?

```
Does this attribute describe HOW the organization 
structures or prioritizes this job?
│
├─ YES → Is it a mapping or an attribute?
│   │
│   ├─ MAPPING → Use junction table
│   │   Examples:
│   │   ✓ "Role X does Job Y" → jtbd_roles
│   │   ✓ "Department X handles Job Y" → jtbd_departments
│   │   ✓ "Function X owns Job Y" → jtbd_functions
│   │
│   └─ ATTRIBUTE OF MAPPING → Store in junction
│       Examples:
│       ✓ Importance to role → jtbd_roles.importance
│       ✓ Frequency for role → jtbd_roles.frequency
│       ✓ Sequence in workflow → jtbd_roles.sequence_order
│       ✓ Primary vs secondary → jtbd_roles.is_primary
│
└─ NO → Go to Decision Tree 3
```

### Decision Tree 3: Is This Value or Impact Data?

```
Does this attribute describe the BUSINESS VALUE 
or STRATEGIC IMPACT of the job?
│
├─ YES → Which type?
│   │
│   ├─ VALUE CATEGORY → jtbd_value_categories
│   │   Examples: SMARTER, FASTER, BETTER, EFFICIENT, SAFER, SCALABLE
│   │
│   └─ VALUE DRIVER → jtbd_value_drivers
│       Examples:
│       ✓ OPERATIONAL_EFFICIENCY (internal)
│       ✓ PATIENT_IMPACT (external)
│       ✓ COMPLIANCE (internal)
│       ✓ MARKET_ACCESS (external)
│
└─ NO → Go to Decision Tree 4
```

### Decision Tree 4: Is This AI/Automation Data?

```
Does this attribute describe AI SUITABILITY 
or AUTOMATION OPPORTUNITIES?
│
├─ YES → Which aspect?
│   │
│   ├─ SUITABILITY SCORE → jtbd_ai_suitability
│   │   Examples: RAG score, summary score, overall readiness
│   │
│   ├─ SPECIFIC OPPORTUNITY → ai_opportunities
│   │   Examples: "Automate report generation", complexity, value estimate
│   │
│   ├─ USE CASE → ai_use_cases
│   │   Examples: Specific implementation scenarios
│   │
│   └─ INTERVENTION TYPE → ai_intervention_types (reference)
│       Examples: AUTOMATION, AUGMENTATION, REDESIGN
│
└─ NO → Go to Decision Tree 5
```

### Decision Tree 5: Is This Job Detail or Research?

```
Does this describe DETAILS about the job 
from research or analysis?
│
├─ YES → Which type?
│   │
│   ├─ PAIN POINT → jtbd_pain_points
│   │   Examples: Issues, frustrations, blockers
│   │
│   ├─ DESIRED OUTCOME → jtbd_desired_outcomes
│   │   Examples: What users want to achieve
│   │
│   ├─ KPI → jtbd_kpis
│   │   Examples: Performance metrics, targets
│   │
│   ├─ SUCCESS CRITERION → jtbd_success_criteria
│   │   Examples: How success is measured
│   │
│   ├─ CONTEXT → jtbd_context
│   │   Examples: Preconditions, postconditions, triggers
│   │
│   └─ TAG → jtbd_tags
│       Examples: Keywords, categories for filtering
│
└─ NO → Go to Decision Tree 6
```

### Decision Tree 6: Is This Persona/Behavioral Data?

```
Does this describe HOW someone with a specific 
archetype PREFERS to work?
│
├─ YES → Store in `personas` table
│   Examples:
│   ✓ Work style preferences
│   ✓ Communication preferences
│   ✓ Tool preferences
│   ✓ Decision-making style
│   ✓ Risk tolerance
│   
│   Note: Personas INHERIT JTBDs from their role.
│         Do NOT duplicate JTBD mappings in personas table.
│
└─ NO → Consider if this needs a new table or belongs elsewhere
```

---

## Common Scenarios

### Scenario 1: "I want to track how often a role performs a job"

**Question:** Where do I store frequency?

**Answer:** `jtbd_roles.frequency`

**Rationale:** 
- Frequency is role-specific context (same job might be daily for one role, monthly for another)
- This is a junction attribute, not core to the job itself

**Example:**
```sql
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, frequency)
VALUES 
  ('job-uuid', 'role-uuid', 'Clinical Research Manager', 'daily');
```

### Scenario 2: "I want to add 'estimated time to complete' for a job"

**Question:** Where should this go?

**Answer:** Depends on context:
- **If universal for all roles:** Add `estimated_duration_minutes` to `jtbd` table
- **If varies by role:** Add `duration_minutes` column to `jtbd_roles`
- **If varies by persona:** Add to `persona_jtbd_overrides` (if you create persona-specific overrides)

**Recommended:** Start with `jtbd` table (universal), add role-specific overrides only if needed.

### Scenario 3: "I want to track regulatory requirements for a job"

**Question:** Is this a JTBD attribute or a pain point?

**Answer:** Depends on granularity:
- **High-level (yes/no):** Add `requires_regulatory_compliance` BOOLEAN to `jtbd`
- **Detailed requirements:** Create `jtbd_regulatory_requirements` table with:
  - `jtbd_id`
  - `requirement_name`
  - `regulation_reference`
  - `compliance_level`

**Recommended:** Start with normalized table for queryability.

### Scenario 4: "I want to link a job to specific tools/software"

**Question:** Where do tool references go?

**Answer:** Create a new junction table: `jtbd_tools`

**Rationale:**
- Many-to-many relationship (job ↔ tools)
- Queryable (find all jobs using Tool X)
- Extendable (can add `proficiency_required`, `is_primary_tool`, etc.)

**Example Schema:**
```sql
CREATE TABLE jtbd_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL, -- Cached via trigger
  proficiency_required TEXT CHECK (proficiency_required IN ('basic', 'intermediate', 'advanced', 'expert')),
  is_primary_tool BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(jtbd_id, tool_id)
);
```

### Scenario 5: "I want to track stakeholders involved in a job"

**Question:** Job stakeholders - JTBD or role-specific?

**Answer:** Role-specific → Create `jtbd_role_stakeholders`

**Rationale:**
- Stakeholders vary by role performing the job
- Example: Same job "Conduct Safety Review" has different stakeholders when done by MSL vs Regulatory Affairs

**Alternative:** If stakeholders are universal to the job, create `jtbd_stakeholders` (simpler junction).

### Scenario 6: "I want to add 'required certifications' for a job"

**Question:** JTBD or Role?

**Answer:** Store in `org_roles` table, NOT in JTBD.

**Rationale:**
- Certifications are organizational requirements
- Same job might require different certs for different roles/organizations
- Certifications are supply-side (who can do it), not demand-side (what needs to be done)

**Example:**
```sql
-- Add to org_roles table
ALTER TABLE org_roles ADD COLUMN required_certifications TEXT[];

-- Or create normalized table
CREATE TABLE role_certifications (
  role_id UUID REFERENCES org_roles(id),
  certification_name TEXT,
  is_required BOOLEAN,
  expiry_period_months INTEGER
);
```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Putting Org Structure in JTBD

**Bad:**
```sql
ALTER TABLE jtbd ADD COLUMN primary_department TEXT;
```

**Why it's bad:**
- Not multi-tenant friendly
- Can't handle many-to-many (job spans departments)
- Breaks normalization

**Good:**
```sql
-- Use junction table
INSERT INTO jtbd_departments (jtbd_id, department_id, department_name, is_primary)
VALUES ('...', '...', 'Clinical Operations', TRUE);
```

### ❌ Anti-Pattern 2: Duplicating JTBD Mappings in Personas

**Bad:**
```sql
CREATE TABLE persona_jtbd (
  persona_id UUID,
  jtbd_id UUID
);
```

**Why it's bad:**
- Duplicates `jtbd_roles` mappings
- Creates data inconsistency risk
- Violates DRY principle

**Good:**
```sql
-- Personas inherit from roles
SELECT p.name, j.name
FROM personas p
JOIN org_roles r ON p.role_id = r.id
JOIN jtbd_roles jr ON r.id = jr.role_id
JOIN jtbd j ON jr.jtbd_id = j.id;

-- Or just use the view:
SELECT * FROM v_persona_jtbd_inherited;
```

### ❌ Anti-Pattern 3: Using JSONB for Structured Lists

**Bad:**
```sql
ALTER TABLE jtbd ADD COLUMN tools_used JSONB;
-- Then: UPDATE jtbd SET tools_used = '["Excel", "Tableau"]'::jsonb;
```

**Why it's bad:**
- Can't query efficiently ("find all jobs using Excel")
- No referential integrity
- No standardization

**Good:**
```sql
CREATE TABLE jtbd_tools (
  jtbd_id UUID REFERENCES jtbd(id),
  tool_id UUID REFERENCES tools(id),
  tool_name TEXT NOT NULL
);
```

### ❌ Anti-Pattern 4: Storing Calculated Values

**Bad:**
```sql
ALTER TABLE jtbd ADD COLUMN total_pain_points INTEGER;
-- Manual update required
```

**Why it's bad:**
- Redundant (can be calculated)
- Requires manual sync
- Can become stale

**Good:**
```sql
-- Use a view or calculate on-the-fly
SELECT 
  j.id,
  j.name,
  COUNT(pp.id) as total_pain_points
FROM jtbd j
LEFT JOIN jtbd_pain_points pp ON j.id = pp.jtbd_id
GROUP BY j.id, j.name;

-- Or use v_jtbd_complete view
SELECT pain_point_count FROM v_jtbd_complete;
```

---

## Checklist for New Attributes

Before adding a new attribute, ask:

- [ ] Is this intrinsic to the job itself? → `jtbd` table
- [ ] Does this vary by organization/role/department? → Junction table
- [ ] Is this a list of items? → Create normalized table
- [ ] Is this calculated from other data? → Use view, don't store
- [ ] Will I need to query/filter by this? → Must be in column, not JSONB
- [ ] Is there an existing table that fits? → Reuse before creating new
- [ ] Does this need multi-tenant support? → Add `tenant_id`
- [ ] Will this have many-to-many relationships? → Use junction table with ID+NAME pattern

---

## Reference: Table Purpose Summary

| Table | Primary Purpose | Key Relationships |
|-------|----------------|-------------------|
| `jtbd` | Universal job catalog | Referenced by all junction tables |
| `jtbd_roles` | Job → Role mapping | `jtbd` ↔ `org_roles` |
| `jtbd_functions` | Job → Function mapping | `jtbd` ↔ `org_functions` |
| `jtbd_departments` | Job → Department mapping | `jtbd` ↔ `org_departments` |
| `jtbd_value_categories` | Job → Value category | `jtbd` ↔ `value_categories` |
| `jtbd_value_drivers` | Job → Value driver | `jtbd` ↔ `value_drivers` |
| `jtbd_ai_suitability` | AI readiness scores | 1:1 with `jtbd` |
| `ai_opportunities` | Specific AI opportunities | 1:M with `jtbd` |
| `ai_use_cases` | Implementation scenarios | 1:M with `ai_opportunities` |
| `jtbd_pain_points` | User frustrations | 1:M with `jtbd` |
| `jtbd_desired_outcomes` | User goals | 1:M with `jtbd` |
| `jtbd_kpis` | Performance metrics | 1:M with `jtbd` |
| `jtbd_success_criteria` | Success measures | 1:M with `jtbd` |
| `jtbd_tags` | Keywords/categories | M:M via junction |
| `jtbd_context` | Preconditions/triggers | 1:M with `jtbd` |
| `personas` | Behavioral archetypes | Inherit JTBDs via `role_id` |

---

## When in Doubt

**Golden Rule:** When unsure where data belongs, prefer:
1. **Normalization over denormalization** (separate tables over JSONB)
2. **Junction tables over direct references** (many-to-many by default)
3. **Core JTBD simplicity** (keep `jtbd` table focused on universal attributes)

**Ask yourself:** "If this attribute changes for one organization but not another, where should it live?"
- If it changes → Junction table or org-specific table
- If it's universal → Core `jtbd` table

---

## Need Help?

- Review: `COMPLETE_JTBD_ARCHITECTURE.md` for system overview
- Examples: `QUERY_EXAMPLES.md` for practical patterns
- Questions: Consult Data Engineering team or `.claude.md`

---

**Document Version**: 1.0  
**Last Reviewed**: 2024-11-21

