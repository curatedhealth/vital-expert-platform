# Medical Affairs Workflow Import - Status Report

**Date:** 2025-11-10
**Status:** 🟡 BLOCKED - Use Case Foreign Key Constraint
**Progress:** 148/800+ records (19%)

---

## ✅ What's Successfully Imported

### 1. Personas (43/43) ✅
All 43 Medical Affairs personas are in `dh_personas` table with:
- Full VPANES priority scoring (Value, Pain, Adoption, Network, Ease, Strategic)
- Priority rankings (1-43)
- Budget authority, team size, org details
- Geographic scope and seniority levels

**Query to verify:**
```sql
SELECT COUNT(*) FROM dh_personas WHERE persona_code LIKE 'P0%';
-- Result: 43
```

### 2. JTBDs (105/105) ✅
All 105 Jobs-to-be-Done are in `jtbd_library` table across 7 strategic pillars:
- **SP01:** Growth & Market Access (17)
- **SP02:** Scientific Excellence (19)
- **SP03:** Stakeholder Engagement (18)
- **SP04:** Compliance & Quality (14)
- **SP05:** Operational Excellence (15)
- **SP06:** Talent Development (8)
- **SP07:** Innovation & Digital (14)

**Query to verify:**
```sql
SELECT category, COUNT(*)
FROM jtbd_library
WHERE id LIKE 'JTBD-MA%'
GROUP BY category
ORDER BY category;
```

---

## ❌ What's Blocked

### 3. Workflows (0/111) ❌
**Blocker:** Foreign key constraint `dh_workflow.use_case_id` → `dh_use_case.id`

The `dh_workflow` table requires:
- `tenant_id` (UUID) - ✅ Fixed
- `use_case_id` (UUID) - ❌ Blocking issue
- `domain_id` via use_case - ❌ Needs use_case first

**Root Cause:**
- JTBDs live in `jtbd_library` with VARCHAR IDs ("JTBD-MA-001")
- Workflows need UUID use_case_id that links to `dh_use_case` table
- `dh_use_case` also requires `domain_id` (another foreign key)

### 4. Tasks (0/500+) ❌
**Dependency:** Tasks require workflows to exist first

### 5. Persona-JTBD Mappings (0/200+) ❌
**Status:** Can be created independently, waiting for workflow import completion

---

## 🔧 Technical Details

### Schema Discovered

**dh_workflow columns:**
- `id`, `tenant_id`, `use_case_id` (all UUIDs, NOT NULL)
- `unique_id`, `name`, `description`
- `position`, `metadata` (JSONB)
- `tags` (array), `sla`, `templates`, `rag_sources`, etc.

**dh_use_case columns:**
- `id`, `tenant_id`, `domain_id` (all UUIDs, NOT NULL)
- `code`, `unique_id`, `title`, `summary`
- `complexity`, `status`, `tags`, `metadata` (JSONB)
- Many compliance/governance fields

**dh_task columns:**
- `id`, `tenant_id`, `workflow_id` (all UUIDs, NOT NULL)
- `code`, `unique_id`, `title`, `objective`
- `position`, `duration_estimate_minutes`
- `extra` (JSONB for owner/tools/outputs/phase)

### Import Script Progress

**File:** `scripts/import_complete_ma_data.py` (900+ lines)

**Fixed Issues:**
1. ✅ Schema mismatch - moved `complexity`, `estimated_duration_minutes` to `metadata` JSONB
2. ✅ Tenant ID - added `get_tenant_id()` function
3. ✅ Duration parsing - improved with try/catch for empty strings
4. ✅ Task duration field - fixed to `duration_estimate_minutes`
5. ✅ None checks - added `if existing and existing.data:`

**Attempted Solutions:**
1. Generate deterministic UUIDs from JTBD IDs using UUID v5 ✅
2. Create `ensure_use_case_exists()` function ⏸️ (failing silently)
3. Create `get_or_create_medical_affairs_domain()` function ⏸️ (needs testing)

**Current Blocker:**
The `ensure_use_case_exists()` function tries to create use_case records but fails due to:
- `domain_id` constraint (needs valid domain UUID)
- Silent failures in try/except blocks
- Use cases not being created before workflow insert

---

## 🚀 Recommended Solution

### Two-Phase Approach

#### Phase 1: Create Use Cases (10 min)
Create a dedicated script to:
1. Get/create "Medical Affairs" or use "Market Access" domain
2. Create 105 `dh_use_case` records from `jtbd_library` entries
3. Use same UUID v5 generation for consistency

```python
# Example
namespace = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')

for jtbd in jtbd_library:
    use_case_id = str(uuid.uuid5(namespace, f'jtbd:{jtbd.id}'))

    supabase.table('dh_use_case').upsert({
        'id': use_case_id,
        'tenant_id': tenant_id,
        'domain_id': domain_id,  # Market Access domain
        'code': jtbd.id,
        'unique_id': jtbd.id,
        'title': jtbd.title,
        'summary': jtbd.description[:500],
        'complexity': jtbd.complexity,
        'status': 'active',
        'tags': [jtbd.category],
        'metadata': {
            'source': 'jtbd_library',
            'function': 'Medical Affairs'
        }
    }).execute()
```

#### Phase 2: Import Workflows & Tasks (15 min)
Once use_cases exist:
1. Re-run `import_complete_ma_data.py`
2. Workflows will successfully link to use_cases
3. Tasks will import automatically

---

## 📊 Expected Final State

Once complete, you'll have:
- ✅ 43 Personas (with VPANES scoring)
- ✅ 105 JTBDs (in jtbd_library)
- ✅ **105 Use Cases** (linking to JTBDs)
- ✅ **111 Workflows** (across 7 strategic pillars)
- ✅ **500+ Tasks** (with owner/tool/output assignments)
- ✅ **200+ Persona-JTBD Mappings**

**Total: ~964 records** for complete Medical Affairs operational library

---

## 🎯 Next Actions

### Immediate (Today)
1. **Create standalone use_case import script**
   - File: `scripts/create_use_cases_from_jtbds.py`
   - Duration: 5-10 minutes to write
   - Execution: 2-3 minutes

2. **Verify use_cases created**
   ```sql
   SELECT COUNT(*) FROM dh_use_case
   WHERE metadata->>'source' = 'jtbd_library';
   -- Expected: 105
   ```

3. **Re-run workflow import**
   ```bash
   python3 scripts/import_complete_ma_data.py
   ```

### Short-term (This Week)
1. Verify workflows display in UI at [/workflows](http://localhost:3000/workflows)
2. Test workflow editor with a sample workflow
3. End-to-end test: Create and execute a workflow

---

## 📁 Files

| File | Status | Purpose |
|------|--------|---------|
| `scripts/import_complete_ma_data.py` | ⏸️ Ready (blocked) | Main import script |
| `MA_COMPLETE_DATA_ENRICHMENT_SUMMARY.md` | ✅ Complete | Data inventory |
| `SP02_ENRICHMENT_COMPLETE.md` | ✅ Complete | SP02 enrichment details |
| `WORKFLOW_IMPORT_STATUS.md` | ✅ Current file | Status report |

---

## 🔍 Debugging Commands

```bash
# Check personas
psql $DATABASE_URL -c "SELECT COUNT(*) FROM dh_personas WHERE persona_code LIKE 'P0%';"

# Check JTBDs
psql $DATABASE_URL -c "SELECT COUNT(*) FROM jtbd_library WHERE id LIKE 'JTBD-MA%';"

# Check use_cases
psql $DATABASE_URL -c "SELECT COUNT(*) FROM dh_use_case WHERE metadata->>'source' = 'jtbd_library';"

# Check workflows
psql $DATABASE_URL -c "SELECT COUNT(*) FROM dh_workflow WHERE unique_id LIKE 'WFL-SP%';"

# Check tasks
psql $DATABASE_URL -c "SELECT COUNT(*) FROM dh_task WHERE unique_id LIKE 'TSK-SP%';"

# Get domain ID
psql $DATABASE_URL -c "SELECT id, name FROM dh_domain WHERE name ILIKE '%market%';"
```

---

**Last Updated:** 2025-11-10
**Contact:** See import script logs at `/tmp/ma_final_import.log`
