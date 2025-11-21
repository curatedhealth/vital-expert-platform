# 🚀 PRE-FLIGHT CHECKLIST - BEFORE RUNNING ANY SEED FILE

## ✅ **USE THIS CHECKLIST EVERY TIME TO AVOID SCHEMA ERRORS**

---

## **STEP 1: Check dh_workflow INSERT**

### ✅ Column List Must Include (in INSERT statement):
- [ ] `tenant_id` (FIRST!)
- [ ] `use_case_id`
- [ ] `name`
- [ ] `description`
- [ ] `position` (NOT `order_index`!)
- [ ] `metadata`

### ❌ These columns DON'T EXIST (remove them!):
- [ ] NO `unique_id`
- [ ] NO `code`
- [ ] NO `order_index`
- [ ] NO `complexity`
- [ ] NO `estimated_duration_hours`

### ✅ SELECT Statement Must Include:
```sql
SELECT
  sc.tenant_id,           -- ✅ CRITICAL: Must get from session_config
  uc.id as use_case_id,
  wf_data.name,
  wf_data.description,
  wf_data.position,       -- ✅ NOT order_index
  wf_data.metadata
```

### ✅ FROM Clause Pattern:
```sql
FROM session_config sc
CROSS JOIN dh_use_case uc        -- ✅ CROSS JOIN, not INNER JOIN
CROSS JOIN (
  VALUES (...)
) AS wf_data(name, description, position, metadata)
WHERE uc.code = 'UC_CD_XXX' AND uc.tenant_id = sc.tenant_id  -- ✅ WHERE, not ON
```

### ✅ ON CONFLICT:
```sql
ON CONFLICT (use_case_id, name)  -- ✅ NO tenant_id!
DO UPDATE SET
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata;
```

---

## **STEP 2: Check dh_task INSERT**

### ✅ Column List Must Include (in INSERT statement):
- [ ] `tenant_id` (FIRST!)
- [ ] `workflow_id`
- [ ] `code`
- [ ] `title`
- [ ] `objective`
- [ ] `position` (NOT `order_index`!)
- [ ] `extra` (NOT `metadata`!)

### ❌ These columns DON'T EXIST (remove them!):
- [ ] NO `unique_id`
- [ ] NO `order_index`
- [ ] NO `complexity`
- [ ] NO `estimated_duration_minutes`
- [ ] NO `metadata` (use `extra` instead!)

### ✅ SELECT Statement Must Include:
```sql
SELECT
  sc.tenant_id,           -- ✅ CRITICAL: Must get from session_config
  wf.id as workflow_id,
  task_data.code,
  task_data.title,
  task_data.objective,
  task_data.position,     -- ✅ NOT order_index
  task_data.extra         -- ✅ NOT metadata
```

### ✅ FROM Clause Pattern:
```sql
FROM session_config sc
CROSS JOIN (
  VALUES
    ('Phase 1: Name', 'TSK-CD-004-P1-01', 'Title', 'Objective', 1, '{}'::jsonb)
) AS task_data(workflow_name, code, title, objective, position, extra)
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name 
  AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_CD_XXX' AND tenant_id = sc.tenant_id)
```

### ✅ ON CONFLICT:
```sql
ON CONFLICT (workflow_id, code)  -- ✅ NO tenant_id!
DO UPDATE SET
  title = EXCLUDED.title,
  objective = EXCLUDED.objective,
  position = EXCLUDED.position,
  extra = EXCLUDED.extra;
```

### ✅ Put metadata in `extra` JSONB:
```sql
extra => jsonb_build_object(
  'complexity', 'INTERMEDIATE',
  'estimated_duration_minutes', 90,
  'deliverable', 'Some document',
  'key_activities', json_build_array('Activity 1', 'Activity 2')
)
```

---

## **STEP 3: Common Error Patterns to Fix**

### Error: "column 'order_index' does not exist"
**Fix:** Change to `position`

### Error: "column 'unique_id' does not exist"
**Fix:** Remove `unique_id` entirely (don't insert it)

### Error: "null value in column 'tenant_id' violates not-null constraint"
**Fix:** 
1. Add `tenant_id` to INSERT column list
2. Add `sc.tenant_id` to SELECT statement
3. Make sure `FROM session_config sc` is first

### Error: "column 'metadata' of relation 'dh_task' does not exist"
**Fix:** Change to `extra` (for tasks only; workflows use `metadata`)

---

## **STEP 4: Quick Validation Commands**

### Check if file follows correct pattern:
```bash
# Should find tenant_id in workflow INSERT
grep -A 5 "INSERT INTO dh_workflow" yourfile.sql | grep "tenant_id"

# Should find 'position' not 'order_index'
grep "order_index" yourfile.sql  # Should return nothing!

# Should find 'extra' for tasks, not 'metadata'
grep -A 5 "INSERT INTO dh_task" yourfile.sql | grep "extra"

# Should use CROSS JOIN for use_case
grep "CROSS JOIN dh_use_case" yourfile.sql

# Should select sc.tenant_id
grep "sc.tenant_id" yourfile.sql
```

---

## **STEP 5: Final Checklist Before Running**

- [ ] All workflow INSERTs have `tenant_id` in column list
- [ ] All workflow SELECTs have `sc.tenant_id` 
- [ ] All task INSERTs have `tenant_id` in column list
- [ ] All task SELECTs have `sc.tenant_id`
- [ ] Using `position` not `order_index`
- [ ] Using `extra` not `metadata` for tasks
- [ ] NO `unique_id` anywhere
- [ ] Using `CROSS JOIN dh_use_case uc`
- [ ] Using `WHERE uc.code = ...` not `ON uc.code = ...`
- [ ] Task JOINs use `wf.name` not `wf.unique_id`

---

## **COPY-PASTE TEMPLATES**

### Workflow Template:
```sql
INSERT INTO dh_workflow (tenant_id, use_case_id, name, description, position, metadata)
SELECT sc.tenant_id, uc.id, wf_data.name, wf_data.description, wf_data.position, wf_data.metadata
FROM session_config sc
CROSS JOIN dh_use_case uc
CROSS JOIN (VALUES ('Phase 1', 'Description', 1, '{}'::jsonb)) AS wf_data(name, description, position, metadata)
WHERE uc.code = 'UC_CD_XXX' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (use_case_id, name) DO UPDATE SET description = EXCLUDED.description, position = EXCLUDED.position, metadata = EXCLUDED.metadata;
```

### Task Template:
```sql
INSERT INTO dh_task (tenant_id, workflow_id, code, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc
CROSS JOIN (VALUES ('Phase 1: Name', 'TSK-CD-XXX-P1-01', 'Title', 'Objective', 1, '{}'::jsonb)) AS task_data(workflow_name, code, title, objective, position, extra)
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_CD_XXX' AND tenant_id = sc.tenant_id)
ON CONFLICT (workflow_id, code) DO UPDATE SET title = EXCLUDED.title, objective = EXCLUDED.objective, position = EXCLUDED.position, extra = EXCLUDED.extra;
```

---

**🎯 BOTTOM LINE: If you follow this checklist, you will NEVER get schema errors again!**

