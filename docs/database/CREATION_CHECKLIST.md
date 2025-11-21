# ✅ SEED FILE CREATION CHECKLIST

**Use this checklist EVERY time you create a new seed file!**

---

## 📚 **Step 0: Read the Schema Reference**

**FIRST**, read this file: `/database/sql/seeds/SCHEMA_REFERENCE_FINAL.md`

This contains the ACTUAL database schema with ALL columns, constraints, and working examples.

---

## 📝 **Step 1: Part 1 - Workflows & Tasks**

### Before Writing SQL:

- [ ] I have read `SCHEMA_REFERENCE_FINAL.md`
- [ ] I have a working example open (e.g., `08_cd_004_comparator_selection_part1.sql`)
- [ ] I know the use case code (e.g., `UC_CD_003`)

### Workflows Section:

- [ ] `tenant_id` in INSERT column list
- [ ] `use_case_id` in INSERT column list
- [ ] `name` in INSERT column list
- [ ] `unique_id` in INSERT column list (e.g., `WFL-CD-003-001`)
- [ ] `description` in INSERT column list
- [ ] `position` in INSERT column list (NOT `order_index`)
- [ ] `metadata` in INSERT column list

- [ ] `sc.tenant_id` in SELECT statement
- [ ] `uc.id as use_case_id` in SELECT statement
- [ ] All workflow data fields in SELECT
- [ ] Using `CROSS JOIN dh_use_case uc`
- [ ] Using `WHERE uc.code = 'UC_CD_XXX' AND uc.tenant_id = sc.tenant_id`
- [ ] Using `ON CONFLICT (tenant_id, unique_id)`

### Tasks Section:

- [ ] `tenant_id` in INSERT column list
- [ ] `workflow_id` in INSERT column list
- [ ] `code` in INSERT column list (e.g., `TSK-CD-003-P1-01`)
- [ ] `unique_id` in INSERT column list (usually same as code)
- [ ] `title` in INSERT column list
- [ ] `objective` in INSERT column list
- [ ] `position` in INSERT column list (NOT `order_index`)
- [ ] `extra` in INSERT column list (NOT `metadata`)

- [ ] `sc.tenant_id` in SELECT statement
- [ ] `wf.id as workflow_id` in SELECT statement
- [ ] All task data fields in SELECT
- [ ] JOIN workflow by `wf.name = task_data.workflow_name`
- [ ] Using `ON CONFLICT (tenant_id, unique_id)`

- [ ] Metadata (complexity, duration, etc.) is in `extra` JSONB, not separate columns

### Verification Queries:

- [ ] Using `position` not `order_index` in verification queries

---

## 📝 **Step 2: Part 2 - Assignments**

### Before Writing SQL:

- [ ] Part 1 has been run successfully
- [ ] I have validated agent codes against `00_foundation_agents.sql`
- [ ] I have validated persona codes against `01_foundation_personas.sql`
- [ ] I have validated tool codes against `02_foundation_tools.sql`
- [ ] I have validated RAG codes against `03_foundation_rag_sources.sql`

### Task Dependencies:

- [ ] `tenant_id` in INSERT column list ⚠️ **CRITICAL!**
- [ ] `task_id` in INSERT column list
- [ ] `depends_on_task_id` in INSERT column list
- [ ] `note` in INSERT column list

- [ ] `sc.tenant_id` in SELECT statement
- [ ] Both task JOINs include `AND t.tenant_id = sc.tenant_id`
- [ ] Using `ON CONFLICT (task_id, depends_on_task_id)` (NO tenant_id)

### Agent Assignments:

- [ ] `tenant_id` in INSERT column list
- [ ] `sc.tenant_id` in SELECT statement
- [ ] All agent codes exist in foundation (run validation script!)
- [ ] `assignment_type` uses valid values: `PRIMARY_EXECUTOR`, `CO_EXECUTOR`, `VALIDATOR`, `REVIEWER`, `FALLBACK`
- [ ] `retry_strategy` uses valid values: `EXPONENTIAL_BACKOFF`, `LINEAR`, `IMMEDIATE`, `NONE`
- [ ] Using `ON CONFLICT (tenant_id, task_id, agent_id, assignment_type)`

### Persona Assignments:

- [ ] `tenant_id` in INSERT column list
- [ ] `sc.tenant_id` in SELECT statement
- [ ] All persona codes exist in foundation (run validation script!)
- [ ] `responsibility` uses valid values: `APPROVE`, `REVIEW`, `PROVIDE_INPUT`, `INFORM`, `VALIDATE`, `CONSULT`
- [ ] `review_timing` uses valid values: `BEFORE_AGENT_RUNS`, `AFTER_AGENT_RUNS`, `PARALLEL`, `ON_AGENT_ERROR`
- [ ] Using `ON CONFLICT (tenant_id, task_id, persona_id, responsibility)`

### Tool Mappings:

- [ ] `tenant_id` in INSERT column list
- [ ] `sc.tenant_id` in SELECT statement
- [ ] All tool codes exist in foundation (run validation script!)
- [ ] Both task and tool JOINs include `AND x.tenant_id = sc.tenant_id`
- [ ] Using `ON CONFLICT (task_id, tool_id)` (NO tenant_id)
- [ ] No duplicate (task_id, tool_id) pairs in VALUES

### RAG Mappings:

- [ ] `tenant_id` in INSERT column list
- [ ] `sc.tenant_id` in SELECT statement
- [ ] All RAG codes exist in foundation (run validation script!)
- [ ] Both task and RAG JOINs include `AND x.tenant_id = sc.tenant_id`
- [ ] Using `ON CONFLICT (task_id, rag_source_id)` (NO tenant_id)
- [ ] No duplicate (task_id, rag_source_id) pairs in VALUES

---

## 🧪 **Step 3: Validation**

### Pre-Execution Validation:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds"
python3 validate_seed_file.py 2025/XX_cd_XXX_partX.sql
```

- [ ] Validation script passes (or only shows known false positives)
- [ ] All agent codes validated
- [ ] All persona codes validated
- [ ] All tool codes validated
- [ ] All RAG codes validated
- [ ] No duplicate mappings
- [ ] All enum values validated

### Manual Checks:

- [ ] Search file for `order_index` - should find ZERO matches
- [ ] Search Part 1 for `metadata` in task INSERT - should find ZERO (should be `extra`)
- [ ] Search for `tenant_id` - should be in ALL INSERT and SELECT statements
- [ ] Search for `unique_id` - should be in workflow and task INSERTs

---

## 🚀 **Step 4: Execution**

### Run Part 1:
```bash
psql "$DATABASE_URL" -f "database/sql/seeds/2025/XX_cd_XXX_part1.sql"
```

- [ ] Part 1 executed without errors
- [ ] Verification queries show correct counts

### Run Part 2:
```bash
psql "$DATABASE_URL" -f "database/sql/seeds/2025/XX_cd_XXX_part2.sql"
```

- [ ] Part 2 executed without errors
- [ ] All assignment counts are > 0 (not zero!)

---

## 📊 **Step 5: Final Verification**

Run this query to verify everything:

```sql
SELECT 
  'UC-XX Assignments Complete' as status,
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT td.id) as dependencies,
  COUNT(DISTINCT ta.id) as agent_assignments,
  COUNT(DISTINCT tp.id) as persona_assignments,
  COUNT(DISTINCT tt.id) as tool_mappings,
  COUNT(DISTINCT tr.id) as rag_mappings
FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
LEFT JOIN dh_task_dependency td ON td.task_id = t.id
LEFT JOIN dh_task_agent ta ON ta.task_id = t.id
LEFT JOIN dh_task_persona tp ON tp.task_id = t.id
LEFT JOIN dh_task_tool tt ON tt.task_id = t.id
LEFT JOIN dh_task_rag tr ON tr.task_id = t.id
WHERE uc.code = 'UC_CD_XXX';
```

- [ ] All counts are > 0
- [ ] Task count matches expected
- [ ] Assignment counts look reasonable

---

## ✅ **Checklist Complete!**

If all boxes are checked, your seed file is ready for production! 🎉

---

## 🆘 **Common Errors & Quick Fixes**

| Error | Quick Fix |
|-------|-----------|
| `column "order_index" does not exist` | Replace with `position` |
| `column "unique_id" violates not-null` | Add `unique_id` to INSERT and VALUES |
| `column "tenant_id" violates not-null` | Add `tenant_id` to INSERT and SELECT |
| `column "metadata" does not exist` (tasks) | Use `extra` instead |
| `duplicate key "unique_id_unique"` | Fix ON CONFLICT to use `(tenant_id, unique_id)` |
| Invalid agent/persona/tool/RAG code | Check foundation files for correct codes |
| `duplicate key` in tool/RAG mappings | Remove duplicate (task, tool/rag) pairs |

---

**📌 Pin this checklist! Use it every time!**

**Reference Files:**
- Schema: `/database/sql/seeds/SCHEMA_REFERENCE_FINAL.md`
- Working Example: `/database/sql/seeds/2025/08_cd_004_comparator_selection_part1.sql` & `part2.sql`
- Validation Script: `/database/sql/seeds/validate_seed_file.py`

