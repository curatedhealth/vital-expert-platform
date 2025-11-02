# Seed File Validation

This directory contains a pre-validation script that catches common errors **before** SQL execution.

---

## 🚀 Quick Start

### Validate a single seed file:
```bash
python validate_seed_file.py 2025/06_cd_001_endpoint_selection_part2.sql
```

### Validate all Part 2 files:
```bash
python validate_seed_file.py 2025/*_part2.sql
```

### Validate specific use case:
```bash
python validate_seed_file.py 2025/06_cd_001_*.sql
```

---

## 📋 What It Validates

### ✅ Foundation Code References
- **Agent codes** (`AGT-*`) - Validates against `00_foundation_agents.sql`
- **Persona codes** (`P##_*`) - Validates against `01_foundation_personas.sql`
- **Tool codes** (`TOOL-*`) - Validates against `02_foundation_tools.sql`
- **RAG codes** (`RAG-*`) - Validates against `03_foundation_rag_sources.sql`

### ✅ Duplicate Mappings
- **Task-Tool duplicates** - Same `(task_id, tool_id)` appearing multiple times
- **Task-RAG duplicates** - Same `(task_id, rag_source_id)` appearing multiple times

### ✅ CHECK Constraint Values
- **retry_strategy**: `EXPONENTIAL_BACKOFF`, `LINEAR`, `IMMEDIATE`, `NONE`
  - ❌ NOT `LINEAR_BACKOFF`!
- **assignment_type**: `PRIMARY_EXECUTOR`, `VALIDATOR`, `FALLBACK`, `REVIEWER`, `CO_EXECUTOR`
  - ❌ NOT `PRIMARY`, `SUPPORT`, `REVIEW`!
- **responsibility**: `APPROVE`, `REVIEW`, `PROVIDE_INPUT`, `INFORM`, `VALIDATE`, `CONSULT`
  - ❌ NOT `LEAD`, `REVIEWER`, `CONTRIBUTOR`!
- **review_timing**: `BEFORE_AGENT_RUNS`, `AFTER_AGENT_RUNS`, `PARALLEL`, `ON_AGENT_ERROR`
  - ❌ NOT `DURING`, `AFTER`!

### ✅ Required Columns
- **tenant_id** in `dh_task_tool` INSERT/SELECT
- **tenant_id** in `dh_task_rag` INSERT/SELECT

### ✅ ON CONFLICT Clauses
Validates that ON CONFLICT matches actual UNIQUE constraints:
- `dh_workflow`: `(use_case_id, name)` ← NO tenant_id
- `dh_task`: `(workflow_id, code)` ← NO tenant_id
- `dh_task_dependency`: `(task_id, depends_on_task_id)` ← NO tenant_id
- `dh_task_agent`: `(tenant_id, task_id, agent_id, assignment_type)` ← includes assignment_type
- `dh_task_persona`: `(tenant_id, task_id, persona_id, responsibility)` ← includes responsibility
- `dh_task_tool`: `(task_id, tool_id)` ← NO tenant_id
- `dh_task_rag`: `(task_id, rag_source_id)` ← NO tenant_id

---

## 📊 Example Output

### ✅ All Validations Pass:
```
🚀 Digital Health Workflow Seed Validator
======================================================================
📚 Loading foundation codes...
  ✅ Loaded 17 agent codes
  ✅ Loaded 16 persona codes
  ✅ Loaded 17 tool codes
  ✅ Loaded 38 RAG source codes

🔍 Validating: 06_cd_001_endpoint_selection_part2.sql
  ✅ Agent codes validated (3 codes)
  ✅ Persona codes validated (8 codes)
  ✅ Tool codes validated (4 codes)
  ✅ RAG codes validated (4 codes)
  ✅ No duplicate task-tool mappings (17 mappings)
  ✅ No duplicate task-RAG mappings (22 mappings)
  ✅ retry_strategy values validated
  ✅ assignment_type values validated
  ✅ responsibility values validated
  ✅ review_timing values validated
  ✅ dh_task_tool tenant_id validated
  ✅ dh_task_rag tenant_id validated
  ✅ dh_task_tool ON CONFLICT validated
  ✅ dh_task_rag ON CONFLICT validated

======================================================================
📊 VALIDATION SUMMARY
======================================================================

✅ ALL VALIDATIONS PASSED - Safe to execute SQL!
```

### ❌ Validation Errors Found:
```
🚀 Digital Health Workflow Seed Validator
======================================================================
📚 Loading foundation codes...
  ✅ Loaded 17 agent codes
  ✅ Loaded 16 persona codes
  ✅ Loaded 17 tool codes
  ✅ Loaded 38 RAG source codes

🔍 Validating: 06_cd_001_endpoint_selection_part2.sql
  ❌ Invalid agent codes found
  ❌ Duplicate mappings detected
  ❌ Invalid retry_strategy values

======================================================================
📊 VALIDATION SUMMARY
======================================================================

❌ Errors (3):

1. ❌ [06_cd_001_endpoint_selection_part2.sql] Invalid agent codes (not in foundation): ['AGT-CLIN-001']
   Available agents: ['AGT-CLINICAL-ENDPOINT', 'AGT-DATA-SCIENTIST', ...]

2. ❌ [06_cd_001_endpoint_selection_part2.sql] Duplicate task-tool mappings:
   - TSK-CD-001-P1-01 → TOOL-PUBMED
   - TSK-CD-001-P2-01 → TOOL-PUBMED

3. ❌ [06_cd_001_endpoint_selection_part2.sql] Invalid retry_strategy values: ['LINEAR_BACKOFF']
   Valid values: ['EXPONENTIAL_BACKOFF', 'IMMEDIATE', 'LINEAR', 'NONE']

🚨 VALIDATION FAILED - Fix errors before running SQL
```

---

## 🔧 Integration with Workflow

### Recommended Workflow:

```bash
# 1. Create/edit your seed file
vim 2025/07_new_usecase_part2.sql

# 2. Validate BEFORE running SQL
python validate_seed_file.py 2025/07_new_usecase_part2.sql

# 3. If validation passes, run SQL
psql -f 2025/07_new_usecase_part2.sql

# 4. Verify with the built-in verification queries in the seed file
```

---

## 🎯 Benefits

| Before Validation Script | After Validation Script |
|-------------------------|------------------------|
| ❌ Errors discovered during SQL execution | ✅ Errors caught before SQL execution |
| ❌ 30-60 min debugging per use case | ✅ 5-10 min to fix validation errors |
| ❌ Trial and error approach | ✅ Clear error messages with hints |
| ❌ Same mistakes repeated | ✅ Learn once, prevent forever |

---

## 📚 Reference Files

The validation script reads foundation codes from:
- `2025/00_foundation_agents.sql`
- `2025/01_foundation_personas.sql`
- `2025/02_foundation_tools.sql`
- `2025/03_foundation_rag_sources.sql`

Make sure these files exist and are up-to-date!

---

## 🐛 Troubleshooting

### "Foundation file not found"
- Ensure you're running the script from the `seeds/` directory
- Check that foundation files exist in `2025/` subdirectory

### "No files found matching pattern"
- Check your file path/glob pattern
- Use relative paths from the `seeds/` directory

### Script exits with errors
- Read the error messages carefully - they include hints!
- Check `SEED_SCHEMA_REFERENCE.md` for valid values
- Compare your code with successfully validated files (e.g., `06_cd_001_endpoint_selection_part2.sql`)

---

## 🔄 Exit Codes

- `0` - All validations passed
- `1` - Validation errors found

This allows integration into CI/CD pipelines:
```bash
if python validate_seed_file.py 2025/*.sql; then
    echo "✅ All seed files valid"
    psql -f 2025/run_all_seeds.sql
else
    echo "❌ Validation failed - check errors above"
    exit 1
fi
```

---

## 📝 Adding New Validations

To add new validation rules, edit `validate_seed_file.py` and add methods to the `SeedValidator` class:

```python
def _validate_new_rule(self, content: str, filename: str):
    """Validate new rule"""
    # Your validation logic here
    if error_condition:
        self.errors.append(f"❌ [{filename}] Error description")
    else:
        print(f"  ✅ New rule validated")
```

Then call it from `validate_file()` method.

---

## 🎓 Learning Resources

- **Schema Reference**: `SEED_SCHEMA_REFERENCE.md`
- **Working Example**: `2025/06_cd_001_endpoint_selection_part2.sql`
- **Workflow Docs**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/docs/Workflows`

---

**Happy Validating! 🚀**

