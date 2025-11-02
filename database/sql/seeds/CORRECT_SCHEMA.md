# ⚠️ **CRITICAL: Correct Schema for All Tables** ⚠️

## This is the DEFINITIVE schema reference - USE THIS!

---

## **`dh_workflow`**

### ✅ **ACTUAL COLUMNS** (from migration):
```sql
CREATE TABLE dh_workflow (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  use_case_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  unique_id TEXT NOT NULL,        -- ✅ ADDED by migration 20251101123000, MUST provide!
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE (use_case_id, name),
  UNIQUE (tenant_id, unique_id)
);
```

### INSERT Template:
```sql
INSERT INTO dh_workflow (
  tenant_id,          -- ✅ REQUIRED
  use_case_id,        -- ✅ REQUIRED
  name,               -- ✅ REQUIRED
  unique_id,          -- ✅ REQUIRED (e.g., 'WFL-CD-004-001')
  description,        -- Optional
  position,           -- ✅ Use this for ordering (NOT order_index!)
  metadata            -- JSONB
)
```

### ❌ **COLUMNS THAT DON'T EXIST:**
- ❌ NO `code`
- ❌ NO `order_index`

### ON CONFLICT:
```sql
ON CONFLICT (tenant_id, unique_id)  -- ✅ The actual UNIQUE constraint!
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata;
```

**⚠️ Note:** There are TWO unique constraints on `dh_workflow`:
1. `UNIQUE (use_case_id, name)` 
2. `UNIQUE (tenant_id, unique_id)` ← **Use this one for ON CONFLICT!**

---

## **`dh_task`**

### ✅ **ACTUAL COLUMNS** (from migration):
```sql
CREATE TABLE dh_task (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  workflow_id UUID NOT NULL,
  code VARCHAR(50) NOT NULL,          -- e.g., TSK-CD-001-P1-01
  unique_id TEXT NOT NULL,            -- ✅ ADDED by migration 20251101123000, MUST provide!
  title VARCHAR(255) NOT NULL,
  objective TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  extra JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE (workflow_id, code),
  UNIQUE (tenant_id, unique_id)
);
```

### INSERT Template:
```sql
INSERT INTO dh_task (
  tenant_id,          -- ✅ REQUIRED
  workflow_id,        -- ✅ REQUIRED (FK to dh_workflow.id)
  code,               -- ✅ REQUIRED (e.g., 'TSK-CD-004-P1-01')
  unique_id,          -- ✅ REQUIRED (usually same as code)
  title,              -- ✅ REQUIRED
  objective,          -- Optional
  position,           -- ✅ Use this for ordering (NOT order_index!)
  extra               -- ✅ Use this for metadata (NOT metadata!)
)
```

### ❌ **COLUMNS THAT DON'T EXIST:**
- ❌ NO `order_index`
- ❌ NO `complexity`
- ❌ NO `estimated_duration_minutes`
- ❌ NO `metadata` (use `extra` instead!)

### JOIN to workflow:
```sql
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name 
  AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_CD_004' AND tenant_id = sc.tenant_id)
```
OR
```sql
INNER JOIN dh_workflow wf ON wf.id = task_data.workflow_id
```

### ON CONFLICT:
```sql
ON CONFLICT (tenant_id, unique_id)  -- ✅ The actual UNIQUE constraint!
DO UPDATE SET
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  objective = EXCLUDED.objective,
  position = EXCLUDED.position,
  extra = EXCLUDED.extra;
```

**⚠️ Note:** There are TWO unique constraints on `dh_task`:
1. `UNIQUE (workflow_id, code)` 
2. `UNIQUE (tenant_id, unique_id)` ← **Use this one for ON CONFLICT!**

---

## **PUT metadata/complexity/duration IN `extra` JSONB:**

```sql
extra => jsonb_build_object(
  'complexity', 'INTERMEDIATE',
  'estimated_duration_minutes', 90,
  'deliverable', 'Some document',
  'key_activities', json_build_array('Activity 1', 'Activity 2')
)
```

---

## **WORKING TEMPLATE FROM UC_CD_001:**

### Workflows (COPY THIS EXACTLY):
```sql
INSERT INTO dh_workflow (
  tenant_id,              -- ✅ MUST BE FIRST
  use_case_id,
  name,
  unique_id,              -- ✅ REQUIRED!
  description,
  position,
  metadata
)
SELECT
  sc.tenant_id,           -- ✅ MUST SELECT tenant_id from session_config
  uc.id as use_case_id,
  wf_data.name,
  wf_data.unique_id,      -- ✅ Provide unique_id value
  wf_data.description,
  wf_data.position,
  wf_data.metadata
FROM session_config sc
CROSS JOIN dh_use_case uc    -- ✅ CROSS JOIN, not INNER JOIN
CROSS JOIN (
  VALUES
    ('Phase 1: Name', 'WFL-CD-XXX-001', 'Description', 1, '{"key": "value"}'::jsonb)
) AS wf_data(name, unique_id, description, position, metadata)
WHERE uc.code = 'UC_CD_004' AND uc.tenant_id = sc.tenant_id  -- ✅ WHERE, not ON
ON CONFLICT (tenant_id, unique_id)  -- ✅ Use (tenant_id, unique_id)!
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata;
```

### Tasks:
```sql
INSERT INTO dh_task (
  tenant_id,
  workflow_id,
  code,
  unique_id,              -- ✅ REQUIRED!
  title,
  objective,
  position,
  extra
)
SELECT
  sc.tenant_id,
  wf.id as workflow_id,
  task_data.code,
  task_data.unique_id,    -- ✅ Provide unique_id value (usually same as code)
  task_data.title,
  task_data.objective,
  task_data.position,
  task_data.extra
FROM session_config sc
CROSS JOIN (
  VALUES
    ('Phase 1: Name', 'TSK-CD-004-P1-01', 'TSK-CD-004-P1-01', 'Task Title', 'Task objective', 1, '{"complexity": "INTERMEDIATE"}'::jsonb)
) AS task_data(workflow_name, code, unique_id, title, objective, position, extra)
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name
  AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_CD_004' AND tenant_id = sc.tenant_id)
ON CONFLICT (tenant_id, unique_id)  -- ✅ Use (tenant_id, unique_id)!
DO UPDATE SET
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  objective = EXCLUDED.objective,
  position = EXCLUDED.position,
  extra = EXCLUDED.extra;
```

---

## **ALWAYS REMEMBER:**
1. ✅ Use `position` not `order_index`
2. ✅ Use `extra` not `metadata` for tasks
3. ✅ Include `tenant_id` in INSERT statements
4. ✅ Include `unique_id` in INSERT statements (REQUIRED!)
5. ✅ Use `ON CONFLICT (tenant_id, unique_id)` for both workflows and tasks
6. ✅ Join workflows by `name` when inserting tasks

---

**This is the ONLY correct reference. Ignore any other documentation!**

