# ⚡ QUICK REFERENCE: Use Case Seed Files

## 🎯 Essential Rules (MEMORIZE THESE!)

### `dh_workflow` Table
```sql
-- ✅ CORRECT STRUCTURE
INSERT INTO dh_workflow (
  tenant_id, use_case_id, name, description, position, unique_id, metadata
)
VALUES (
  tenant_id,
  use_case_id,
  'Phase 1: Foundation',     -- name (identifier)
  'Description...',
  1,
  'WFL-CD-001-001',          -- unique_id (MUST provide!)
  jsonb_build_object(...)    -- metadata
)
ON CONFLICT (tenant_id, unique_id) DO UPDATE ...;
```

**❌ Common Mistakes:**
- ~~Using 'code' column~~ (doesn't exist!)
- ~~ON CONFLICT (use_case_id, name)~~ (wrong constraint!)
- ~~Not providing unique_id~~ (it's NOT auto-generated!)

---

### `dh_task` Table
```sql
-- ✅ CORRECT STRUCTURE
INSERT INTO dh_task (
  tenant_id, workflow_id, code, title, objective, position, unique_id, extra
)
VALUES (
  tenant_id,
  workflow_id,
  'TSK-CD-001-P1-01',        -- code
  'TSK-CD-001-P1-01',        -- unique_id (same as code)
  'Task Title',              -- title (NOT 'name'!)
  'Task objective...',       -- objective (NOT 'description'!)
  1,
  jsonb_build_object(...)    -- extra (NOT 'metadata'!)
)
ON CONFLICT (workflow_id, code) DO UPDATE ...;
```

**❌ Common Mistakes:**
- ~~Using 'name' and 'description'~~ (use 'title' and 'objective'!)
- ~~Using 'metadata'~~ (use 'extra'!)
- ~~ON CONFLICT (tenant_id, workflow_id, code)~~ (no tenant_id!)
- ~~Not providing unique_id~~ (it's NOT auto-generated!)

---

## 📋 Pre-Flight Checklist

Before running ANY use case seed file:

- [ ] **Workflows have unique_id** (e.g., 'WFL-CD-001-001')
- [ ] **Tasks have unique_id** (e.g., 'TSK-CD-001-P1-01')
- [ ] **Tasks use `title` and `objective`** (not name/description)
- [ ] **Tasks use `extra`** (not metadata)
- [ ] **Workflow ON CONFLICT**: `(tenant_id, unique_id)`
- [ ] **Task ON CONFLICT**: `(workflow_id, code)`
- [ ] **No duplicate lines** in VALUES tuples
- [ ] **All tuples have same number of elements**

---

## 🔢 Element Count Check

**Workflows tuple must have 5 elements:**
1. name
2. description
3. position
4. unique_id
5. metadata

**Tasks tuple must have 7 elements:**
1. workflow_name
2. code
3. unique_id
4. title
5. objective
6. position
7. extra

---

## 🚨 Red Flags (Stop if you see these!)

- Multiple consecutive lines with same task code → **DUPLICATE!**
- Tuple has 8+ commas → **TOO MANY ELEMENTS!**
- "VALUES lists must all be the same length" → **INCONSISTENT TUPLES!**
- "column does not exist" → **WRONG COLUMN NAME!**
- "no unique constraint matching" → **WRONG ON CONFLICT!**

---

## ✅ Success Pattern

```sql
-- 1. Workflows: Simple, clean
(
  'Phase 1: Name',
  'Description',
  1,
  'WFL-CD-001-001',
  jsonb_build_object('estimated_duration_hours', 1.0)
)

-- 2. Tasks: 7 elements, no duplicates
(
  'Phase 1: Name',           -- workflow reference
  'TSK-CD-001-P1-01',        -- code
  'TSK-CD-001-P1-01',        -- unique_id
  'Task Title',              -- title
  'Task objective',          -- objective
  1,                         -- position
  jsonb_build_object(...)    -- extra
)
```

---

**Remember:** Use `USECASE_SEED_TEMPLATE.sql` as starting point!

