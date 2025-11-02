# 🎯 DEFINITIVE SCHEMA REFERENCE - USE THIS FOR ALL FUTURE SEED FILES

**Last Updated:** 2025-11-02 (After UC_CD_004 successful completion)

This document reflects the ACTUAL database schema after all migrations, including the critical `20251101123000_unique_ids_and_task_resource_assignments.sql` migration.

---

## ⚠️ CRITICAL: Always Check This File Before Creating Seed Files!

---

## **1. `dh_workflow`**

### ✅ **ACTUAL COLUMNS:**
```sql
CREATE TABLE dh_workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  use_case_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  unique_id TEXT NOT NULL,              -- ⚠️ REQUIRED! Added by migration
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,  -- ⚠️ NOT order_index!
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (use_case_id, name),
  UNIQUE (tenant_id, unique_id)         -- ⚠️ Use this for ON CONFLICT!
);
```

### ✅ **INSERT Template:**
```sql
INSERT INTO dh_workflow (
  tenant_id,        -- ✅ REQUIRED from session_config
  use_case_id,      -- ✅ REQUIRED from dh_use_case
  name,             -- ✅ REQUIRED (e.g., 'Phase 1: Name')
  unique_id,        -- ✅ REQUIRED (e.g., 'WFL-CD-004-001')
  description,
  position,         -- ✅ Integer for ordering (NOT order_index!)
  metadata          -- ✅ JSONB
)
SELECT
  sc.tenant_id,           -- ⚠️ MUST get from session_config
  uc.id as use_case_id,
  wf_data.name,
  wf_data.unique_id,      -- ⚠️ Must provide this!
  wf_data.description,
  wf_data.position,
  wf_data.metadata
FROM session_config sc
CROSS JOIN dh_use_case uc         -- ⚠️ CROSS JOIN, not INNER JOIN
CROSS JOIN (
  VALUES
    ('Phase 1: Name', 'WFL-CD-XXX-001', 'Description', 1, '{"key": "value"}'::jsonb)
) AS wf_data(name, unique_id, description, position, metadata)
WHERE uc.code = 'UC_CD_XXX' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)    -- ⚠️ MUST use (tenant_id, unique_id)!
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata;
```

### ❌ **COLUMNS THAT DON'T EXIST:**
- ❌ `code`
- ❌ `order_index`
- ❌ `complexity`
- ❌ `estimated_duration_hours`

---

## **2. `dh_task`**

### ✅ **ACTUAL COLUMNS:**
```sql
CREATE TABLE dh_task (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  workflow_id UUID NOT NULL,
  code VARCHAR(50) NOT NULL,          -- e.g., 'TSK-CD-004-P1-01'
  unique_id TEXT NOT NULL,            -- ⚠️ REQUIRED! Added by migration
  title VARCHAR(255) NOT NULL,
  objective TEXT,
  position INTEGER NOT NULL DEFAULT 0,  -- ⚠️ NOT order_index!
  extra JSONB NOT NULL DEFAULT '{}'::jsonb,  -- ⚠️ NOT metadata!
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workflow_id, code),
  UNIQUE (tenant_id, unique_id)       -- ⚠️ Use this for ON CONFLICT!
);
```

### ✅ **INSERT Template:**
```sql
INSERT INTO dh_task (
  tenant_id,        -- ✅ REQUIRED from session_config
  workflow_id,      -- ✅ REQUIRED from workflow JOIN
  code,             -- ✅ REQUIRED (e.g., 'TSK-CD-004-P1-01')
  unique_id,        -- ✅ REQUIRED (usually same as code)
  title,            -- ✅ REQUIRED
  objective,
  position,         -- ✅ Integer for ordering (NOT order_index!)
  extra             -- ✅ JSONB (NOT metadata!)
)
SELECT
  sc.tenant_id,
  wf.id as workflow_id,
  task_data.code,
  task_data.unique_id,        -- ⚠️ Must provide this!
  task_data.title,
  task_data.objective,
  task_data.position,
  task_data.extra
FROM session_config sc
CROSS JOIN (
  VALUES
    ('Phase 1: Name', 'TSK-CD-XXX-P1-01', 'TSK-CD-XXX-P1-01', 'Title', 'Objective', 1, '{"complexity": "INTERMEDIATE"}'::jsonb)
) AS task_data(workflow_name, code, unique_id, title, objective, position, extra)
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name
  AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_CD_XXX' AND tenant_id = sc.tenant_id)
ON CONFLICT (tenant_id, unique_id)    -- ⚠️ MUST use (tenant_id, unique_id)!
DO UPDATE SET
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  objective = EXCLUDED.objective,
  position = EXCLUDED.position,
  extra = EXCLUDED.extra;
```

### ❌ **COLUMNS THAT DON'T EXIST:**
- ❌ `order_index`
- ❌ `complexity` (put in `extra` JSONB instead)
- ❌ `estimated_duration_minutes` (put in `extra` JSONB instead)
- ❌ `metadata` (use `extra` instead!)

---

## **3. `dh_task_dependency`**

### ✅ **ACTUAL COLUMNS:**
```sql
CREATE TABLE dh_task_dependency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,            -- ⚠️ REQUIRED!
  task_id UUID NOT NULL,
  depends_on_task_id UUID NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  UNIQUE (task_id, depends_on_task_id)  -- ⚠️ Note: NO tenant_id in constraint
);
```

### ✅ **INSERT Template:**
```sql
INSERT INTO dh_task_dependency (
  tenant_id,              -- ⚠️ MUST include!
  task_id,
  depends_on_task_id,
  note
)
SELECT
  sc.tenant_id,           -- ⚠️ From session_config
  t.id as task_id,
  dt.id as depends_on_task_id,
  dep_data.note
FROM session_config sc
CROSS JOIN (VALUES ('TSK-XXX', 'TSK-YYY', 'Note')) AS dep_data(task_code, depends_on_code, note)
INNER JOIN dh_task t ON t.code = dep_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_task dt ON dt.code = dep_data.depends_on_code AND dt.tenant_id = sc.tenant_id
ON CONFLICT (task_id, depends_on_task_id)  -- ⚠️ NO tenant_id in constraint!
DO UPDATE SET note = EXCLUDED.note;
```

---

## **4. `dh_task_agent`**

### ✅ **ACTUAL COLUMNS:**
- `tenant_id` ✅ REQUIRED
- `task_id` ✅ REQUIRED
- `agent_id` ✅ REQUIRED
- `assignment_type` ✅ REQUIRED (see valid values below)
- `execution_order`
- `requires_human_approval`
- `max_retries`
- `retry_strategy` (see valid values below)
- `is_parallel`
- `approval_persona_code`
- `approval_stage`
- `on_failure`
- `metadata`

### ✅ **Valid Values (CHECK CONSTRAINTS):**
- **`assignment_type`**: `PRIMARY_EXECUTOR`, `CO_EXECUTOR`, `VALIDATOR`, `REVIEWER`, `FALLBACK`
- **`retry_strategy`**: `EXPONENTIAL_BACKOFF`, `LINEAR`, `IMMEDIATE`, `NONE`
- **`on_failure`**: `ESCALATE_TO_HUMAN`, `RETRY`, `FALLBACK_AGENT`, `FAIL`, `SKIP`
- **`approval_stage`**: `BEFORE_EXECUTION`, `AFTER_EXECUTION`, `ON_ERROR` (or NULL)

### ✅ **ON CONFLICT:**
```sql
ON CONFLICT (tenant_id, task_id, agent_id, assignment_type)
DO UPDATE SET ...
```

---

## **5. `dh_task_persona`**

### ✅ **ACTUAL COLUMNS:**
- `tenant_id` ✅ REQUIRED
- `task_id` ✅ REQUIRED
- `persona_id` ✅ REQUIRED
- `responsibility` ✅ REQUIRED (see valid values below)
- `is_blocking`
- `review_timing` (see valid values below)
- `notification_method`
- `metadata`

### ✅ **Valid Values:**
- **`responsibility`**: `APPROVE`, `REVIEW`, `PROVIDE_INPUT`, `INFORM`, `VALIDATE`, `CONSULT`
- **`review_timing`**: `BEFORE_AGENT_RUNS`, `AFTER_AGENT_RUNS`, `PARALLEL`, `ON_AGENT_ERROR`

### ✅ **ON CONFLICT:**
```sql
ON CONFLICT (tenant_id, task_id, persona_id, responsibility)
DO UPDATE SET ...
```

---

## **6. `dh_task_tool`**

### ✅ **ACTUAL COLUMNS:**
- `tenant_id` ✅ REQUIRED
- `task_id` ✅ REQUIRED
- `tool_id` ✅ REQUIRED
- `connection_config` (JSONB)

### ✅ **INSERT Template:**
```sql
INSERT INTO dh_task_tool (
  tenant_id,      -- ⚠️ MUST include!
  task_id,
  tool_id,
  connection_config
)
SELECT
  sc.tenant_id,   -- ⚠️ From session_config
  t.id as task_id,
  tool.id as tool_id,
  tool_data.connection_config
FROM session_config sc
CROSS JOIN (VALUES ('TSK-XXX', 'TOOL-YYY', '{}'::jsonb)) AS tool_data(task_code, tool_code, connection_config)
INNER JOIN dh_task t ON t.code = tool_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_tool tool ON tool.code = tool_data.tool_code AND tool.tenant_id = sc.tenant_id
ON CONFLICT (task_id, tool_id)    -- ⚠️ NO tenant_id in constraint!
DO UPDATE SET connection_config = EXCLUDED.connection_config;
```

---

## **7. `dh_task_rag`**

### ✅ **ACTUAL COLUMNS:**
- `tenant_id` ✅ REQUIRED
- `task_id` ✅ REQUIRED
- `rag_source_id` ✅ REQUIRED
- `query_context` (TEXT)
- `is_required` (BOOLEAN)
- `search_config` (JSONB)

### ✅ **INSERT Template:**
```sql
INSERT INTO dh_task_rag (
  tenant_id,      -- ⚠️ MUST include!
  task_id,
  rag_source_id,
  query_context,
  is_required,
  search_config
)
SELECT
  sc.tenant_id,   -- ⚠️ From session_config
  t.id as task_id,
  rag.id as rag_source_id,
  rag_data.query_context,
  rag_data.is_required,
  rag_data.search_config
FROM session_config sc
CROSS JOIN (VALUES ('TSK-XXX', 'RAG-YYY', 'Context', true, '{}'::jsonb)) AS rag_data(task_code, rag_code, query_context, is_required, search_config)
INNER JOIN dh_task t ON t.code = rag_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_rag_source rag ON rag.code = rag_data.rag_code AND rag.tenant_id = sc.tenant_id
ON CONFLICT (task_id, rag_source_id)    -- ⚠️ NO tenant_id in constraint!
DO UPDATE SET query_context = EXCLUDED.query_context, is_required = EXCLUDED.is_required, search_config = EXCLUDED.search_config;
```

---

## **🎯 GOLDEN RULES (Commit to Memory!):**

1. ✅ **ALWAYS include `tenant_id`** in INSERT column list AND SELECT statement
2. ✅ **ALWAYS include `unique_id`** for workflows and tasks (it's NOT NULL!)
3. ✅ **Use `position`** not `order_index` (order_index doesn't exist!)
4. ✅ **Use `extra`** not `metadata` for tasks (metadata is for workflows only)
5. ✅ **Use `ON CONFLICT (tenant_id, unique_id)`** for workflows and tasks
6. ✅ **Agent/Persona/Tool/RAG codes must match foundation exactly** (use validation script!)
7. ✅ **Use `CROSS JOIN dh_use_case uc`** with `WHERE` clause for workflows
8. ✅ **Join workflows by `name`** when inserting tasks

---

## **📋 Pre-Flight Checklist:**

Before running ANY seed file, verify:

- [ ] `tenant_id` in ALL table INSERTs (including `dh_task_dependency`!)
- [ ] `unique_id` provided for workflows and tasks
- [ ] Using `position` everywhere (no `order_index`)
- [ ] Using `extra` for tasks (not `metadata`)
- [ ] ON CONFLICT uses `(tenant_id, unique_id)` for workflows/tasks
- [ ] ON CONFLICT uses correct constraints for other tables
- [ ] All agent codes match `00_foundation_agents.sql`
- [ ] All persona codes match `01_foundation_personas.sql`
- [ ] All tool codes match `02_foundation_tools.sql`
- [ ] All RAG codes match `03_foundation_rag_sources.sql`

---

## **🚀 Proven Template (From UC_CD_004):**

See `08_cd_004_comparator_selection_part1.sql` and `08_cd_004_comparator_selection_part2.sql` for working examples.

---

**✅ This schema reference is battle-tested and production-ready!**

Last successful validation: UC_CD_004 (2025-11-02)
- 3 workflows seeded ✅
- 10 tasks seeded ✅
- 10 dependencies ✅
- 19 agent assignments ✅
- 24 persona assignments ✅
- 9 tool mappings ✅
- 10 RAG mappings ✅

