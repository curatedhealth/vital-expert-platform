# VITAL PLATFORM - DATA ARCHITECTURE
## No Duplication | Inheritance Model | Clean Separation

## 🏗️ ARCHITECTURE PRINCIPLE

**Agents → Role → Persona (Inheritance Model)**

```
┌─────────────────────────────────────────────────────────────┐
│                    INHERITANCE HIERARCHY                     │
└─────────────────────────────────────────────────────────────┘

ROLE (Structural Baseline)
├─ function_id → org_functions
├─ department_id → org_departments
├─ role attributes: name, geographic_scope, seniority
├─ Junctions: role_responsibilities, role_kpis, role_skills, etc.
│
├──> PERSONA (Behavioral Overlay)
│    ├─ role_id (INHERITS ALL role attributes)
│    ├─ Behavioral: archetype, work_style, risk_tolerance
│    ├─ AI Scoring: ai_maturity_score, work_complexity_score
│    └─ Persona-specific: goals, pain_points, preferences
│
└──> AGENT (AI Implementation)
     ├─ role_id (PRIMARY - INHERITS function, department, role)
     ├─ persona_id (OPTIONAL - adds behavioral attributes)
     ├─ AI Config: system_prompt, model, temperature
     └─ agent_tools_catalog (APIs the agent calls)
```

## ✅ NO DUPLICATION RULES

### STORE ONCE, USE EVERYWHERE

| Attribute | Store In | Access From |
|-----------|----------|-------------|
| function_id, function_name | `org_functions` | All via JOIN |
| department_id, department_name | `org_departments` | All via JOIN |
| role_id, role_name | `org_roles` | All via JOIN |
| Behavioral attributes | `personas` | Agents via persona_id |
| AI config | `agents` | Direct |

### ❌ DON'T STORE:
- `function_id` in `agents` (get from role)
- `department_id` in `agents` (get from role)  
- `function_id` in `personas` (get from role)
- `department_id` in `personas` (get from role)
- Duplicate names anywhere (compute via JOINs/views)

### ✅ DO STORE:
- `role_id` in `agents` (PRIMARY mapping)
- `persona_id` in `agents` (OPTIONAL behavioral overlay)
- `role_id` in `personas` (inherit structure from role)
- `function_id`, `department_id`, `role_id` in `prompts`/`knowledge` (OPTIONAL context)

## 📊 DATA MODELS

### 1. Agents Table (Minimal, Inherit Everything)
```sql
agents
├─ id (PK)
├─ role_id (FK → org_roles) ← PRIMARY MAPPING
├─ persona_id (FK → personas) ← OPTIONAL
├─ tenant_id
├─ name, slug, description
├─ agent_type
├─ AI config: system_prompt, base_model, temperature
└─ metadata, configuration
```

**Get Function/Department:** Via role → `v_agents_with_full_context`

### 2. Personas Table (Behavioral, Inherit Structure)
```sql
personas
├─ id (PK)
├─ role_id (FK → org_roles) ← INHERITS function, department
├─ tenant_id
├─ name, slug
├─ Behavioral: archetype, seniority_level, years_experience
├─ Scoring: ai_maturity_score, work_complexity_score
├─ Preferences: work_style, decision_style, risk_tolerance
└─ Goals, pain_points, motivations
```

**Get Function/Department:** Via role → `v_personas_with_role_context`

### 3. Org Roles Table (Structural Baseline)
```sql
org_roles
├─ id (PK)
├─ function_id (FK → org_functions)
├─ department_id (FK → org_departments)
├─ name, slug, description
├─ geographic_scope, seniority_level, role_category
├─ team_size_min/max, budget_min/max, years_experience_min/max
└─ Junctions: role_responsibilities, role_kpis, role_skills, etc.
```

### 4. Prompts & Knowledge (Optional Org Context)
```sql
prompts / knowledge_base
├─ id (PK)
├─ function_id (OPTIONAL context)
├─ department_id (OPTIONAL context)
├─ role_id (OPTIONAL context)
├─ tenant_id
└─ Content, metadata
```

## 🔍 QUERY PATTERNS

### Get Agent with Full Context
```sql
SELECT * FROM v_agents_with_full_context
WHERE agent_id = ?;

-- Returns:
-- agent_id, agent_name, agent_type
-- role_id, role_name (from role)
-- function_id, function_name (inherited from role)
-- department_id, department_name (inherited from role)
-- persona_id, persona_name, archetype (if persona set)
-- system_prompt, base_model, configuration
```

### Get Persona with Full Role Context
```sql
SELECT * FROM v_personas_with_role_context
WHERE persona_id = ?;

-- Returns:
-- persona_id, persona_name, archetype, ai_maturity_score
-- role_id, role_name (INHERITED)
-- function_id, function_name (INHERITED from role)
-- department_id, department_name (INHERITED from role)
-- All behavioral attributes
```

### Get All Agents for a Function
```sql
SELECT a.*, r.name as role_name, f.name as function_name
FROM agents a
JOIN org_roles r ON a.role_id = r.id
JOIN org_functions f ON r.function_id = f.id
WHERE f.slug = 'medical-affairs';
```

### Get All Personas for a Role
```sql
SELECT p.*, r.name as role_name
FROM personas p
JOIN org_roles r ON p.role_id = r.id
WHERE r.slug = 'msl-manager';
```

## 📁 SQL FILES TO RUN

### Updated Execution Sequence:
```sql
-- 1. Fix existing agents table (add persona_id if missing)
\i fix_agents_table.sql

-- 2. Create application tables (skip agents, already exists)
\i create_all_application_tables_final.sql

-- 3. Add org mapping (follows no-duplication model)
\i add_org_mapping_to_all_tables.sql

-- 4. Create architecture views (inheritance-based queries)
\i create_architecture_views.sql
```

## 🎯 BENEFITS

### 1. **No Duplication**
- Function/Department/Role stored ONCE in org tables
- Personas inherit structure from role
- Agents inherit from role + optional persona

### 2. **Single Source of Truth**
- Change role's department → automatically updates all agents/personas
- Change function name → automatically reflects everywhere
- No sync issues

### 3. **Clean Separation**
- **Roles** = Structural (what the job IS)
- **Personas** = Behavioral (how people DO the job)
- **Agents** = AI Implementation (how AI ASSISTS)

### 4. **Flexible Mapping**
- Agents can be role-generic OR persona-specific
- Prompts/Knowledge can target function/dept/role/all
- Easy to query at any level of hierarchy

## 🚀 USAGE EXAMPLES

### Create an Agent
```sql
-- Role-generic agent (serves ALL personas in this role)
INSERT INTO agents (role_id, tenant_id, name, slug)
VALUES (
    (SELECT id FROM org_roles WHERE slug = 'msl-manager'),
    (SELECT id FROM tenants WHERE slug = 'pharmaceuticals'),
    'MSL Assistant',
    'msl-assistant'
);

-- Persona-specific agent
INSERT INTO agents (role_id, persona_id, tenant_id, name, slug)
VALUES (
    (SELECT id FROM org_roles WHERE slug = 'msl-manager'),
    (SELECT id FROM personas WHERE slug = 'strategic-msl'),
    (SELECT id FROM tenants WHERE slug = 'pharmaceuticals'),
    'Strategic MSL Agent',
    'strategic-msl-agent'
);
```

### Query with Full Context
```sql
-- Always use views for full context
SELECT * FROM v_agents_with_full_context
WHERE function_name = 'Medical Affairs'
  AND department_name = 'Field Medical';
```

## ✨ SUMMARY

**One Principle:** Store structure in roles, inherit everywhere else.

**Result:** Clean, maintainable, no-duplication architecture! 🎯

