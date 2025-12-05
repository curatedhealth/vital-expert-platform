# Persona Inheritance Strategy

**Version**: 1.0.0
**Last Updated**: November 27, 2025
**Status**: Active
**Purpose**: Define what data personas inherit from parent entities vs. what is persona-specific

---

## 📋 Executive Summary

To avoid data duplication and maintain normalization, personas should **inherit** certain attributes from parent entities (roles, functions, departments) via foreign keys, while storing only **persona-specific** attributes directly.

---

## 🏗️ Inheritance Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         TENANT                                   │
│  (org settings, industry, compliance requirements)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORG_FUNCTION                                │
│  (Medical Affairs, Sales, Finance, etc.)                         │
│  - function_name, function_description                           │
│  - typical_kpis[], compliance_requirements[]                     │
│  - industry_context, regulatory_focus                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ORG_DEPARTMENT                               │
│  (Medical Strategy, Field Medical, HEOR, etc.)                   │
│  - department_name, parent_function_id                           │
│  - department_focus, typical_team_size_range                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ORG_ROLE                                  │
│  (Medical Director, MSL, HEOR Manager, etc.)                     │
│  - role_name, role_description                                   │
│  - typical_responsibilities[]                                    │
│  - typical_skills_required[]                                     │
│  - typical_seniority_range                                       │
│  - typical_salary_range                                          │
│  - typical_education_requirements[]                              │
│  - typical_reporting_structure                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        PERSONA                                   │
│  (4 MECE archetypes per role)                                    │
│  - PERSONA-SPECIFIC attributes only                              │
│  - Archetype-specific behaviors                                  │
│  - Individual characteristics that vary by archetype             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 What to Store Where

### Level 1: ROLE-LEVEL Data (Store in `org_roles`)

These are **role constants** - they don't change based on the persona archetype:

| Attribute | Store In | Reason |
|-----------|----------|--------|
| `role_name` | `org_roles.name` | Same for all 4 personas of this role |
| `role_description` | `org_roles.description` | Same for all 4 personas |
| `typical_responsibilities` | `role_responsibilities` junction | Same core responsibilities |
| `typical_skills_required` | `role_skills` junction | Base skills for the role |
| `typical_education_requirements` | `org_roles.education_requirements` | MD, PhD, PharmD, etc. |
| `typical_seniority_range` | `org_roles.seniority_min/max` | e.g., "Senior to Director" |
| `typical_salary_range` | `org_roles.salary_min/max_usd` | Market rate for role |
| `typical_reporting_to` | `org_roles.reports_to` | e.g., "VP Medical Affairs" |
| `typical_team_size` | `org_roles.typical_team_size` | Average for this role |

**Example - Medical Director Role:**
```sql
INSERT INTO org_roles (
    name, slug, description,
    seniority_min, seniority_max,
    salary_min_usd, salary_max_usd,
    typical_team_size,
    reports_to,
    education_requirements
) VALUES (
    'Medical Director',
    'medical-director',
    'Leads medical strategy for therapeutic area or region',
    'senior', 'executive',
    200000, 400000,
    15,
    'VP Medical Affairs',
    ARRAY['MD', 'PhD', 'MD/PhD']
);

-- Role responsibilities (same for all 4 personas)
INSERT INTO role_responsibilities (role_id, responsibility, category) VALUES
    (role_id, 'Develop and execute medical strategy', 'strategic'),
    (role_id, 'Lead MSL team performance', 'leadership'),
    (role_id, 'Oversee medical content development', 'operational'),
    (role_id, 'Manage KOL relationships', 'external');
```

### Level 2: PERSONA-SPECIFIC Data (Store in `personas`)

These **vary by archetype** - each of the 4 personas has different values:

| Attribute | Store In | Why Persona-Specific |
|-----------|----------|---------------------|
| `archetype` | `personas.archetype` | AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC |
| `ai_maturity_score` | `personas.ai_maturity_score` | Varies: 75 (Automator) vs 25 (Skeptic) |
| `work_complexity_score` | `personas.work_complexity_score` | Varies: 40 (Automator) vs 80 (Orchestrator) |
| `technology_adoption` | `personas.technology_adoption` | Varies: Early Adopter vs Laggard |
| `risk_tolerance` | `personas.risk_tolerance` | Varies: High vs Low |
| `change_readiness` | `personas.change_readiness` | Varies: Very High vs Low |
| `preferred_service_layer` | `personas.preferred_service_layer` | WORKFLOWS vs ASK_PANEL |
| `decision_making_style` | `personas.decision_making_style` | Analytical vs Consensus |
| `learning_style` | `personas.learning_style` | Self-directed vs Guided |
| `background_story` | `personas.background_story` | Unique narrative per archetype |
| `a_day_in_the_life` | `personas.a_day_in_the_life` | Different daily routine |
| `vpanes_scores` | `persona_vpanes_scoring` | Different scores per archetype |

**Example - 4 Medical Director Personas:**
```sql
-- Same role_id for all 4, but different archetype-specific values
INSERT INTO personas (role_id, archetype, ai_maturity_score, work_complexity_score, ...) VALUES
    (role_id, 'AUTOMATOR', 78, 45, 'Early Adopter', 'Moderate', 'High', 'WORKFLOWS'),
    (role_id, 'ORCHESTRATOR', 85, 82, 'Innovator', 'High', 'Very High', 'ASK_PANEL'),
    (role_id, 'LEARNER', 35, 42, 'Late Majority', 'Low', 'Moderate', 'ASK_EXPERT'),
    (role_id, 'SKEPTIC', 25, 80, 'Laggard', 'Low', 'Low', 'ASK_PANEL');
```

### Level 3: PERSONA JUNCTION TABLES (Archetype-Specific Details)

These capture the **rich, archetype-specific data**:

| Junction Table | Content | Archetype Variation |
|----------------|---------|---------------------|
| `persona_pain_points` | Specific frustrations | Automator: "Manual tasks" vs Skeptic: "AI trust" |
| `persona_goals` | Personal/professional goals | Automator: "Automate 80%" vs Learner: "Build confidence" |
| `persona_motivations` | What drives them | Varies significantly by archetype |
| `persona_typical_day` | Daily activities | Automator: AI-heavy vs Skeptic: Traditional |
| `persona_frustrations` | Pain points | Different per archetype |
| `persona_buying_triggers` | Purchase triggers | Different priorities |
| `persona_adoption_barriers` | What blocks them | Automator: None vs Skeptic: Trust issues |

---

## 🔄 Data Flow: How to Query

### Option A: View-Based (Recommended)

Create a view that JOINs persona data with role data:

```sql
CREATE VIEW v_persona_complete AS
SELECT 
    -- Persona-specific (from personas table)
    p.id as persona_id,
    p.name as persona_name,
    p.slug as persona_slug,
    p.archetype,
    p.ai_maturity_score,
    p.work_complexity_score,
    p.technology_adoption,
    p.risk_tolerance,
    p.change_readiness,
    p.preferred_service_layer,
    p.background_story,
    p.a_day_in_the_life,
    
    -- Inherited from role (via JOIN)
    r.name as role_name,
    r.slug as role_slug,
    r.description as role_description,
    r.seniority_min,
    r.seniority_max,
    r.salary_min_usd,
    r.salary_max_usd,
    r.typical_team_size,
    r.reports_to,
    r.education_requirements,
    
    -- Inherited from function (via JOIN)
    f.name as function_name,
    f.slug as function_slug,
    
    -- Inherited from department (via JOIN)
    d.name as department_name,
    d.slug as department_slug,
    
    -- Tenant context
    t.name as tenant_name,
    t.slug as tenant_slug

FROM personas p
JOIN org_roles r ON p.role_id = r.id
JOIN org_functions f ON r.function_id = f.id
LEFT JOIN org_departments d ON r.department_id = d.id
JOIN tenants t ON p.tenant_id = t.id
WHERE p.is_active = true;
```

### Option B: Denormalized Columns (Current State)

The current schema has denormalized columns like `role_name`, `function_name` in the personas table. These should be:
1. **Removed** in a future migration (preferred)
2. **Or** kept for performance but populated via triggers

---

## 📋 Recommended Schema Changes

### Phase 1: Add Missing Role-Level Tables

```sql
-- Role responsibilities (normalize from personas)
CREATE TABLE IF NOT EXISTS role_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES org_roles(id) ON DELETE CASCADE,
    responsibility TEXT NOT NULL,
    category TEXT, -- 'strategic', 'operational', 'leadership', 'external'
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role skills requirements (normalize from personas)
CREATE TABLE IF NOT EXISTS role_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES org_roles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_category TEXT, -- 'technical', 'soft', 'domain', 'leadership'
    proficiency_required TEXT, -- 'basic', 'intermediate', 'advanced', 'expert'
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role tools (common tools for this role)
CREATE TABLE IF NOT EXISTS role_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES org_roles(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    tool_category TEXT, -- 'crm', 'analytics', 'communication', 'research'
    usage_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'as_needed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 2: Remove Denormalized Columns from Personas

```sql
-- These columns should be removed (get via JOIN instead)
ALTER TABLE personas 
    DROP COLUMN IF EXISTS role_name,
    DROP COLUMN IF EXISTS role_slug,
    DROP COLUMN IF EXISTS function_name,
    DROP COLUMN IF EXISTS function_slug,
    DROP COLUMN IF EXISTS department_name,
    DROP COLUMN IF EXISTS department_slug;

-- Keep only the foreign keys
-- role_id, function_id, department_id (already exist)
```

---

## 📊 Summary: What Goes Where

| Data Type | Store In | Inherited By |
|-----------|----------|--------------|
| **Tenant Settings** | `tenants` | All functions, roles, personas |
| **Function Info** | `org_functions` | All departments, roles, personas in function |
| **Department Info** | `org_departments` | All roles, personas in department |
| **Role Constants** | `org_roles` | All 4 personas for that role |
| **Role Responsibilities** | `role_responsibilities` | All 4 personas (same responsibilities) |
| **Role Skills** | `role_skills` | All 4 personas (same base skills) |
| **Role Tools** | `role_tools` | All 4 personas (same tool ecosystem) |
| **Archetype Behavior** | `personas` | N/A (unique per persona) |
| **Persona Pain Points** | `persona_pain_points` | N/A (unique per persona) |
| **Persona Goals** | `persona_goals` | N/A (unique per persona) |
| **Persona Day-in-Life** | `persona_typical_day` | N/A (unique per persona) |

---

## 🎯 Benefits of This Approach

1. **No Data Duplication**: Role info stored once, not 4 times
2. **Single Source of Truth**: Update role info in one place
3. **Smaller Persona Records**: Only archetype-specific data
4. **Easier Maintenance**: Change role → all 4 personas updated
5. **Better Query Performance**: Proper indexing on normalized tables
6. **Clear Separation**: Role = "what they do", Persona = "how they do it"

---

## 📝 Seeding Workflow

### Step 1: Seed Role Data First
```sql
-- 1. Create the role with all constants
INSERT INTO org_roles (...) VALUES (...);

-- 2. Add role responsibilities
INSERT INTO role_responsibilities (...) VALUES (...);

-- 3. Add role skills
INSERT INTO role_skills (...) VALUES (...);
```

### Step 2: Seed 4 Personas Per Role
```sql
-- For each role, create 4 personas with archetype-specific data only
INSERT INTO personas (
    role_id,  -- Links to role (inherits role data)
    tenant_id,
    archetype,
    ai_maturity_score,
    work_complexity_score,
    -- ... other persona-specific columns
) VALUES 
    (role_id, tenant_id, 'AUTOMATOR', 78, 45, ...),
    (role_id, tenant_id, 'ORCHESTRATOR', 85, 82, ...),
    (role_id, tenant_id, 'LEARNER', 35, 42, ...),
    (role_id, tenant_id, 'SKEPTIC', 25, 80, ...);
```

### Step 3: Seed Persona Junction Tables
```sql
-- Add archetype-specific details
INSERT INTO persona_pain_points (...) VALUES (...);
INSERT INTO persona_goals (...) VALUES (...);
INSERT INTO persona_typical_day (...) VALUES (...);
```

---

**Document Status**: ✅ Active
**Maintained By**: VITAL Platform Team

