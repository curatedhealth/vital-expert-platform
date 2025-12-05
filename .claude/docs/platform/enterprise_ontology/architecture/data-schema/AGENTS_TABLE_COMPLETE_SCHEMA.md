# AGENTS Table - Complete Schema (CONFIRMED)

## All Available Columns (40+ fields)

### Core Identity
```sql
id                      UUID PRIMARY KEY
tenant_id               UUID (nullable)
name                    TEXT (required)
slug                    TEXT (required, URL-friendly)
tagline                 TEXT (nullable)
description             TEXT (required)
title                   TEXT (nullable)
```

### Organizational Mapping
```sql
role_id                 UUID (nullable, FK to roles)
function_id             UUID (nullable, FK to functions)
department_id           UUID (nullable, FK to departments)
persona_id              UUID (nullable, FK to personas)
function_name           TEXT (nullable, denormalized)
department_name         TEXT (nullable, denormalized)
role_name               TEXT (nullable, denormalized)
```

### Expertise & Experience
```sql
expertise_level         TEXT ('beginner', 'intermediate', 'expert', 'master')
years_of_experience     INTEGER (nullable)
```

### Visual & Avatar
```sql
avatar_url              TEXT (nullable)
avatar_description      TEXT (nullable)
```

### AI Configuration
```sql
system_prompt           TEXT (required)
base_model              TEXT (default: 'gpt-4')
temperature             NUMERIC (default: 0.70)
max_tokens              INTEGER (default: 4000)
communication_style     TEXT (nullable)
```

### Status & Validation
```sql
status                  TEXT ('development', 'testing', 'active', 'deprecated')
validation_status       TEXT ('draft', 'pending', 'validated', 'in_review', 'expired')
deleted_at              TIMESTAMP (nullable, soft delete)
```

### Usage Metrics
```sql
usage_count             INTEGER (default: 0)
average_rating          NUMERIC (nullable)
total_conversations     INTEGER (default: 0)
```

### Metadata & Timestamps
```sql
metadata                JSONB (default: {})
created_at              TIMESTAMPTZ
updated_at              TIMESTAMPTZ
```

---

## Required Columns for INSERT

### Minimum Required:
```sql
name                -- TEXT, unique
slug                -- TEXT, unique, URL-friendly
description         -- TEXT
system_prompt       -- TEXT
```

### Recommended to Include:
```sql
base_model          -- TEXT (default: 'gpt-4')
temperature         -- NUMERIC (default: 0.70)
max_tokens          -- INTEGER (default: 4000)
expertise_level     -- TEXT (default: 'intermediate')
status              -- TEXT (default: 'development')
validation_status   -- TEXT (default: 'draft')
```

### For Medical Affairs Integration:
```sql
department_id       -- UUID (link to departments table)
department_name     -- TEXT (denormalized for quick access)
role_id             -- UUID (link to roles table)
role_name           -- TEXT (denormalized)
function_id         -- UUID (link to functions table)
function_name       -- TEXT (denormalized)
```

---

## Example INSERT Statement

```sql
INSERT INTO agents (
    name,
    slug,
    description,
    system_prompt,
    base_model,
    temperature,
    max_tokens,
    expertise_level,
    status,
    validation_status,
    department_name,
    role_name
) VALUES (
    'Medical Science Liaison Advisor',
    'medical-science-liaison-advisor',
    'Expert in KOL engagement, scientific exchange, and field medical strategy',
    'You are an expert Medical Science Liaison...',
    'gpt-4',
    0.7,
    4000,
    'expert',
    'active',
    'validated',
    'Field Medical',
    'Medical Science Liaison'
);
```

---

## Current Agents in DB

### ✅ Already Seeded (5 Analytics Agents):
1. **Director of Medical Analytics** (f4f1b842-7808-4381-9596-5d0f1ac8d9d1)
2. **Real-World Evidence Analyst** (f969d697-fd79-41f3-b15f-4ba82e77ab39)
3. Clinical Data Scientist
4. Market Insights Analyst
5. HCP Engagement Analytics Specialist

### Key Fields from Existing Agents:
- `base_model`: "gpt-4"
- `temperature`: 0.70
- `max_tokens`: 4000
- `expertise_level`: "intermediate"
- `status`: "development"
- `validation_status`: "draft"
- `usage_count`: 0
- `total_conversations`: 0

---

## Notes for Seed File Creation

1. ✅ **All organizational IDs are NULL** in current agents (role_id, function_id, department_id, persona_id)
2. ✅ **Denormalized names are also NULL** (function_name, department_name, role_name)
3. ✅ **tenant_id is NULL** (multi-tenant support but not currently used)
4. ✅ **Soft delete** is supported via `deleted_at` column
5. ✅ **Usage metrics** default to 0 and will be tracked over time

---

## Integration Points

### With Organizational Structure:
- `function_id` → `functions` table
- `department_id` → `departments` table
- `role_id` → `roles` table
- `persona_id` → `personas` table

### With AgentOS 2.0/3.0:
- `agent_hierarchies` → parent-child relationships
- `agent_skills` → skill assignments
- `agent_tools` → tool assignments
- `agent_graphs` → LangGraph workflows
- `agent_rag_policies` → GraphRAG configurations

---

**This schema is production-ready and comprehensive!** 🎉

