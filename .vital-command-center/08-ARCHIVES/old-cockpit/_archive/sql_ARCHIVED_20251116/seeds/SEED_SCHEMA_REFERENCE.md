# SEED FILE SCHEMA REFERENCE
## Critical Column Information for All Seed Files

⚠️ **READ THIS BEFORE CREATING ANY SEED FILES** ⚠️

---

## TABLE SCHEMAS (Based on Migrations)

### `dh_workflow`
**✅ ACTUAL COLUMNS:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `use_case_id` (UUID, FK)
- **`name`** (VARCHAR, REQUIRED) ← Use this as identifier
- `description` (TEXT)
- `position` (INTEGER)
- `metadata` (JSONB)
- **`unique_id`** (TEXT, UNIQUE, auto-generated) ← DO NOT insert manually
- `created_at`, `updated_at` (TIMESTAMPTZ)

**❌ DOES NOT HAVE:**
- ~~`code`~~ ❌ NO CODE COLUMN!
- ~~`estimated_duration_hours`~~ ❌ Store in metadata instead!

**UNIQUE CONSTRAINTS:**
- `(use_case_id, name)` - Natural key
- `(tenant_id, unique_id)` - Unique identifier key ← **USE THIS for ON CONFLICT!**

**ON CONFLICT CLAUSE:** Use `(tenant_id, unique_id)` ← This is what actually works!

**CORRECT INSERT PATTERN:**
```sql
INSERT INTO dh_workflow (
  tenant_id,
  use_case_id,
  name,                    -- ✅ Use name as identifier
  description,
  position,
  unique_id,               -- ✅ MUST provide this (e.g., 'WFL-CD-001-001')
  metadata                 -- ✅ Store duration here
)
VALUES (
  tenant_id_val,
  use_case_id_val,
  'Phase 1: Foundation',   -- ✅ Descriptive name
  'Description...',
  1,
  'WFL-CD-001-001',        -- ✅ MUST provide unique_id manually!
  jsonb_build_object('estimated_duration_hours', 1.0)  -- ✅ In metadata
)
ON CONFLICT (tenant_id, unique_id)  -- ✅ Correct conflict clause!
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata;
```

---

### `dh_task`
**✅ ACTUAL COLUMNS:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `workflow_id` (UUID, FK)
- **`code`** (VARCHAR, REQUIRED) ← Tasks DO have code!
- `name` (VARCHAR)
- `description` (TEXT)
- `position` (INTEGER)
- **`extra`** (JSONB) ← Store complexity, duration, prerequisites here
- **`unique_id`** (TEXT, UNIQUE, auto-generated)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**❌ DOES NOT HAVE:**
- ~~`complexity`~~ ❌ Store in extra
- ~~`estimated_duration_minutes`~~ ❌ Store in extra
- ~~`metadata`~~ ❌ Use `extra` instead!

**UNIQUE CONSTRAINT:** `(workflow_id, code)` ← NOT tenant_id!  
**ON CONFLICT CLAUSE:** Use `(workflow_id, code)`

**CORRECT INSERT PATTERN:**
```sql
INSERT INTO dh_task (
  tenant_id,
  workflow_id,
  code,                    -- ✅ Tasks have code (e.g., TSK-CD-001-01)
  name,
  description,
  position,
  extra                    -- ✅ Use extra, not metadata
)
VALUES (
  tenant_id_val,
  workflow_id_val,
  'TSK-CD-001-01',         -- ✅ Task code
  'Define Clinical Context',
  'Description...',
  1,
  jsonb_build_object(      -- ✅ Store in extra
    'complexity', 'INTERMEDIATE',
    'estimated_duration_minutes', 30,
    'prerequisites', json_build_array(...)
  )
)
ON CONFLICT (tenant_id, workflow_id, code)  -- ✅ Correct conflict clause
DO UPDATE SET ...;
```

---

### `dh_use_case`
**✅ ACTUAL COLUMNS:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `domain_id` (UUID, FK)
- **`code`** (VARCHAR, REQUIRED) ← Use cases DO have code!
- `title` (VARCHAR)
- `summary` (TEXT)
- `complexity` (VARCHAR)
- **`metadata`** (JSONB) ← Store pattern, dependencies here
- **`unique_id`** (TEXT, UNIQUE, auto-generated)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**❌ DOES NOT HAVE:**
- ~~`pattern`~~ ❌ Store in metadata
- ~~`dependencies`~~ ❌ Store in metadata

**UNIQUE CONSTRAINT:** `(tenant_id, domain_id, code)`  
**ON CONFLICT CLAUSE:** Use `(tenant_id, domain_id, code)`

---

### `dh_agent`
**✅ ACTUAL COLUMNS:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `unique_id` (TEXT, UNIQUE, REQUIRED)
- `code` (VARCHAR)
- `name` (VARCHAR)
- `agent_type` (VARCHAR) ← 'orchestrator', 'executor', 'retriever', 'validator', 'synthesizer', 'specialist'
- `description` (TEXT)
- `system_prompt` (TEXT)
- `metadata` (JSONB)
- `created_at`, `updated_at` (TIMESTAMPTZ)

---

### `dh_persona`
**✅ ACTUAL COLUMNS:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `unique_id` (TEXT, UNIQUE, REQUIRED)
- `code` (VARCHAR)
- `name` (VARCHAR)
- `title` (VARCHAR)
- `department` (VARCHAR)
- `expertise_level` (VARCHAR)
- `years_experience` (INTEGER)
- `key_skills` (TEXT[])
- `responsibilities` (TEXT[])
- `decision_authority` (VARCHAR)
- `typical_availability_hours` (INTEGER)
- `response_time_sla_hours` (INTEGER)
- `metadata` (JSONB)
- `created_at`, `updated_at` (TIMESTAMPTZ)

---

### `dh_tool`
**✅ ACTUAL COLUMNS:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `unique_id` (TEXT, UNIQUE, REQUIRED)
- `code` (VARCHAR)
- `name` (VARCHAR)
- `category` (VARCHAR)
- `vendor` (VARCHAR)
- `version` (VARCHAR)
- **`notes`** (TEXT) ← NOT 'description'!
- `metadata` (JSONB)
- `created_at`, `updated_at` (TIMESTAMPTZ)

---

### `dh_rag_source`
**✅ ACTUAL COLUMNS:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `unique_id` (TEXT, UNIQUE, REQUIRED)
- `code` (VARCHAR)
- `name` (VARCHAR)
- `source_type` (VARCHAR) ← 'guidance', 'document', 'database', 'dataset'
- **`uri`** (TEXT) ← NOT 'url'!
- `description` (TEXT)
- `metadata` (JSONB)
- `created_at`, `updated_at` (TIMESTAMPTZ)

---

### `dh_kpi`
**✅ ACTUAL COLUMNS:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `unique_id` (TEXT, UNIQUE, REQUIRED)
- `code` (VARCHAR)
- `name` (VARCHAR)
- `unit` (VARCHAR)
- `description` (TEXT)
- `metadata` (JSONB)
- `created_at`, `updated_at` (TIMESTAMPTZ)

---

## LINKING TABLES

### `dh_task_agent`
**✅ ACTUAL COLUMNS:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `task_id` (UUID, FK)
- `agent_id` (UUID, FK)
- `execution_order` (INTEGER)
- `requires_human_approval` (BOOLEAN)
- `approval_checkpoint` (VARCHAR)
- `metadata` (JSONB)

### `dh_task_persona`
**✅ ACTUAL COLUMNS:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `task_id` (UUID, FK)
- `persona_id` (UUID, FK)
- `responsibility` (VARCHAR) ← 'lead', 'support', 'review', 'approve'
- `review_timing` (VARCHAR) ← 'before', 'during', 'after'
- `metadata` (JSONB)

### `dh_task_tool`
**✅ ACTUAL COLUMNS:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `task_id` (UUID, FK)
- `tool_id` (UUID, FK)
- `purpose` (TEXT)
- `metadata` (JSONB)

### `dh_task_rag_source`
**✅ ACTUAL COLUMNS:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `task_id` (UUID, FK)
- `rag_source_id` (UUID, FK)
- `purpose` (TEXT)
- `metadata` (JSONB)

### `dh_task_dependency`
**✅ ACTUAL COLUMNS:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `task_id` (UUID, FK) ← The task that depends on another
- `depends_on_task_id` (UUID, FK) ← The task it depends on
- **`note`** (TEXT) ← NOT 'dependency_type'!
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `dh_task_kpi_target`
**✅ ACTUAL COLUMNS:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `task_id` (UUID, FK)
- `kpi_id` (UUID, FK)
- `target_value` (NUMERIC)
- `target_comparison` (VARCHAR) ← '>=', '<=', '=', 'between'
- `metadata` (JSONB)

---

## COMMON MISTAKES TO AVOID

### ❌ MISTAKE #1: Using `code` for workflows
```sql
-- ❌ WRONG
INSERT INTO dh_workflow (code, name, ...) 
VALUES ('WFL-CD-001', 'Phase 1', ...);
```
**✅ CORRECT:**
```sql
INSERT INTO dh_workflow (name, ...) 
VALUES ('Phase 1: Foundation & Context', ...);
```

### ❌ MISTAKE #2: Using columns outside JSONB
```sql
-- ❌ WRONG
INSERT INTO dh_workflow (estimated_duration_hours, ...) 
VALUES (1.5, ...);
```
**✅ CORRECT:**
```sql
INSERT INTO dh_workflow (metadata, ...) 
VALUES (jsonb_build_object('estimated_duration_hours', 1.5), ...);
```

### ❌ MISTAKE #3: Wrong conflict clause for workflows
```sql
-- ❌ WRONG
ON CONFLICT (use_case_id, name) DO UPDATE ...;
-- Also WRONG
ON CONFLICT (tenant_id, code) DO UPDATE ...;
```
**✅ CORRECT:**
```sql
ON CONFLICT (tenant_id, unique_id) DO UPDATE ...;
```
**Reason:** The actual UNIQUE constraint is on `(tenant_id, unique_id)`, not on `(use_case_id, name)`!

### ❌ MISTAKE #4: Using `metadata` for tasks
```sql
-- ❌ WRONG
INSERT INTO dh_task (metadata, ...) 
VALUES (jsonb_build_object('complexity', 'HIGH'), ...);
```
**✅ CORRECT:**
```sql
INSERT INTO dh_task (extra, ...) 
VALUES (jsonb_build_object('complexity', 'HIGH'), ...);
```

### ❌ MISTAKE #5: Referencing workflows by code
```sql
-- ❌ WRONG
FROM dh_workflow wf
WHERE wf.code = 'WFL-CD-001-P1';
```
**✅ CORRECT:**
```sql
FROM dh_workflow wf
WHERE wf.name = 'Phase 1: Foundation & Context';
```

---

## SEED FILE TEMPLATE (CORRECT PATTERN)

```sql
-- =====================================================================================
-- SECTION 1: WORKFLOWS
-- =====================================================================================

INSERT INTO dh_workflow (
  tenant_id,
  use_case_id,
  name,              -- ✅ Name is the identifier
  description,
  position,
  metadata           -- ✅ Store extra fields here
)
SELECT
  sc.tenant_id,
  uc.id,
  wf_data.name,
  wf_data.description,
  wf_data.position,
  wf_data.metadata
FROM session_config sc
CROSS JOIN dh_use_case uc
CROSS JOIN (
  VALUES
    (
      'Phase 1: Foundation',
      'Description...',
      1,
      jsonb_build_object('estimated_duration_hours', 1.0)
    )
) AS wf_data(name, description, position, metadata)
WHERE uc.code = 'UC_CD_001'
ON CONFLICT (use_case_id, name)
DO UPDATE SET
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata;

-- =====================================================================================
-- SECTION 2: TASKS
-- =====================================================================================

INSERT INTO dh_task (
  tenant_id,
  workflow_id,
  code,              -- ✅ Tasks DO have code
  name,
  description,
  position,
  extra              -- ✅ Use extra, not metadata
)
SELECT
  sc.tenant_id,
  wf.id,
  t_data.code,
  t_data.name,
  t_data.description,
  t_data.position,
  t_data.extra
FROM session_config sc
CROSS JOIN dh_workflow wf
CROSS JOIN (
  VALUES
    (
      'Phase 1: Foundation',  -- ✅ Reference workflow by name
      'TSK-CD-001-01',
      'Task Name',
      'Description...',
      1,
      jsonb_build_object('complexity', 'INTERMEDIATE')
    )
) AS t_data(workflow_name, code, name, description, position, extra)
WHERE wf.name = t_data.workflow_name
  AND wf.use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_001')
ON CONFLICT (workflow_id, code)
DO UPDATE SET
  title = EXCLUDED.title,
  objective = EXCLUDED.objective,
  position = EXCLUDED.position,
  extra = EXCLUDED.extra;
```

---

## CHECKLIST FOR NEW SEED FILES

- [ ] Workflows: Use `name` not `code`
- [ ] Workflows: Store duration in `metadata`
- [ ] Workflows: Provide `unique_id` manually (e.g., 'WFL-CD-001-001')
- [ ] Workflows: Conflict clause uses `(tenant_id, unique_id)`
- [ ] Tasks: Use `title` and `objective` (not `name` and `description`)
- [ ] Tasks: Use `extra` not `metadata`
- [ ] Tasks: Provide `unique_id` manually (usually same as code)
- [ ] Tasks: Conflict clause uses `(workflow_id, code)` ← NO tenant_id!
- [ ] Tasks: Reference workflows by `name` not `code`
- [ ] Tools: Use `notes` not `description`
- [ ] RAG Sources: Use `uri` not `url`
- [ ] Task Dependencies: Use `note` not `dependency_type`
- [ ] All JSONB fields use `jsonb_build_object()` or `json_build_array()`

---

**Last Updated:** 2025-11-02  
**Version:** 2.0 - Added Assignment Tables
**Critical for:** All future use case seed files

---

## 📊 ASSIGNMENT TABLE SCHEMAS

### `dh_task_dependency`
- **Columns**: `tenant_id`, `task_id`, `depends_on_task_id`, `note`
- ❌ **NO** `updated_at` column!
- **ON CONFLICT**: `(task_id, depends_on_task_id)` ← NO tenant_id!
- **DO UPDATE**: Only `note` (no updated_at!)

### `dh_task_agent`
- **Columns**: `tenant_id`, `task_id`, `agent_id`, `assignment_type`, `execution_order`, `requires_human_approval`, `approval_persona_code`, `metadata`
- ✅ Use `requires_human_approval` (NOT ~~require~~)
- ✅ Use `approval_persona_code` TEXT (NOT ~~approval_persona_id~~ UUID)
- ✅ Use `metadata` (NOT ~~extra~~)
- ✅ **HAS** `updated_at` column
- **assignment_type** MUST be one of: `'PRIMARY_EXECUTOR'`, `'VALIDATOR'`, `'FALLBACK'`, `'REVIEWER'`, `'CO_EXECUTOR'`
- **ON CONFLICT**: `(tenant_id, task_id, agent_id, assignment_type)`

### `dh_task_persona`
- **Columns**: `tenant_id`, `task_id`, `persona_id`, `responsibility`, `review_timing`, `metadata`
- ✅ Use `metadata` (NOT ~~extra~~)
- ✅ **HAS** `updated_at` column
- **responsibility** MUST be one of: `'APPROVE'`, `'REVIEW'`, `'PROVIDE_INPUT'`, `'INFORM'`, `'VALIDATE'`, `'CONSULT'`
- **review_timing** MUST be one of: `'BEFORE_AGENT_RUNS'`, `'AFTER_AGENT_RUNS'`, `'PARALLEL'`, `'ON_AGENT_ERROR'` (or NULL)
- **ON CONFLICT**: `(tenant_id, task_id, persona_id, responsibility)` ← includes responsibility!

### `dh_task_tool`
- **Columns**: `tenant_id`, `task_id`, `tool_id`, `purpose`, `is_required`, `connection_config`
- ✅ Use `connection_config` (NOT ~~extra~~)
- ❌ **NO** `updated_at` column!
- **ON CONFLICT**: `(task_id, tool_id)` ← NO tenant_id!

### `dh_task_rag`
- **Columns**: `tenant_id`, `task_id`, `rag_source_id`, `query_context`, `is_required`, `search_config`
- ✅ Use `query_context` TEXT (for the query/question)
- ✅ Use `search_config` JSONB (for search parameters; can include 'purpose' here)
- ❌ **NO** `purpose` column as a direct field!
- ❌ **NO** `updated_at` column!
- **ON CONFLICT**: `(task_id, rag_source_id)` ← NO tenant_id!

