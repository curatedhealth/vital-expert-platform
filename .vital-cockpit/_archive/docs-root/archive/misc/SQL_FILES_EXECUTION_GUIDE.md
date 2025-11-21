# 🚀 REGISTRY 250 - SQL FILES READY FOR EXECUTION

## 📊 Status Overview

**✅ COMPLETED:** Batches 1-3 (75 agents loaded - 30%)  
**⏳ READY TO LOAD:** Batches 4-10 (175 agents - 70%)

---

## 📁 SQL Files Prepared

### Individual Batch Files (Recommended)
**Location:** `scripts/`

| File | Size | Agents | Status | Use |
|------|------|--------|--------|-----|
| `exec_batch_04.sql` | 33KB | 76-100 | ⏳ READY | Execute Next |
| `exec_batch_05.sql` | 34KB | 101-125 | ⏳ READY | Then This |
| `exec_batch_06.sql` | 33KB | 126-150 | ⏳ READY | Then This |
| `exec_batch_07.sql` | 34KB | 151-175 | ⏳ READY | Then This |
| `exec_batch_08.sql` | 34KB | 176-200 | ⏳ READY | Then This |
| `exec_batch_09.sql` | 32KB | 201-225 | ⏳ READY | Then This |
| `exec_batch_10.sql` | 33KB | 226-250 | ⏳ READY | Complete! |

### Combined Files (Alternative)
| File | Size | Content | Use Case |
|------|------|---------|----------|
| `registry_250_master_batches_4_10.sql` | 233KB | Batches 4-10 | Single execution (may need splitting) |
| `registry_250_batches_3_to_10_combined.sql` | 265KB | Batches 3-10 | Backup/reference |

---

## 🎯 Execution Methods

### Method 1: MCP Supabase (As Requested)

For each batch file (04-10):

```python
# Read the file
with open('scripts/exec_batch_XX.sql', 'r') as f:
    sql_content = f.read()

# Execute via MCP
mcp_supabase_apply_migration(
    name="load_registry_250_batch_XX",
    query=sql_content
)
```

### Method 2: Supabase Dashboard (Fastest)

1. Open Supabase SQL Editor
2. Copy content from each file in order
3. Click "Run" for each batch
4. Verify success before next batch

### Method 3: Direct SQL Client

```bash
# Using psql or any PostgreSQL client
psql $DATABASE_URL -f scripts/exec_batch_04.sql
psql $DATABASE_URL -f scripts/exec_batch_05.sql
# ... continue for all batches
```

---

## ✅ Pre-Execution Checklist

- [x] All 10 batch SQL files generated
- [x] Batches 1-3 successfully loaded (verified)
- [x] Individual batch files ready (exec_batch_04-10.sql)
- [x] Combined master file available (optional)
- [x] All agents tagged with development status
- [x] Verification queries prepared

---

## 📝 Execution Order

Execute in this exact order:

1. **Batch 04** → `exec_batch_04.sql` (Agents 76-100)
2. **Batch 05** → `exec_batch_05.sql` (Agents 101-125)
3. **Batch 06** → `exec_batch_06.sql` (Agents 126-150)
4. **Batch 07** → `exec_batch_07.sql` (Agents 151-175)
5. **Batch 08** → `exec_batch_08.sql` (Agents 176-200)
6. **Batch 09** → `exec_batch_09.sql` (Agents 201-225)
7. **Batch 10** → `exec_batch_10.sql` (Agents 226-250)

---

## 🔍 Verification Queries

### Check Current Status
```sql
SELECT 
  (metadata->>'batch')::int as batch,
  COUNT(*) as agents
FROM agents 
WHERE metadata->>'source' = 'vital_agents_registry_250'
GROUP BY batch
ORDER BY batch;
```

**Expected After Completion:**
- 10 rows (batches 1-10)
- 25 agents per batch
- Total: 250 agents

### Verify Batch Loading
```sql
-- Check specific batch
SELECT COUNT(*) as loaded
FROM agents 
WHERE metadata->>'source' = 'vital_agents_registry_250'
  AND (metadata->>'batch')::int = 4; -- Change batch number
```

### List Sample Agents
```sql
SELECT 
  name,
  title,
  (metadata->>'batch')::int as batch,
  (metadata->>'agent_number')::int as agent_num
FROM agents 
WHERE metadata->>'source' = 'vital_agents_registry_250'
ORDER BY (metadata->>'agent_number')::int
LIMIT 10;
```

---

## 🎯 Post-Execution Verification

After loading all batches:

```sql
-- Final count
SELECT COUNT(*) as total_agents
FROM agents 
WHERE metadata->>'source' = 'vital_agents_registry_250';
-- Expected: 250

-- Verify all batches
SELECT 
  (metadata->>'batch')::int as batch,
  MIN((metadata->>'agent_number')::int) as first_agent,
  MAX((metadata->>'agent_number')::int) as last_agent,
  COUNT(*) as agent_count
FROM agents 
WHERE metadata->>'source' = 'vital_agents_registry_250'
GROUP BY batch
ORDER BY batch;
-- Expected: 10 rows, each with 25 agents

-- Check for duplicates
SELECT name, COUNT(*) as count
FROM agents 
WHERE metadata->>'source' = 'vital_agents_registry_250'
GROUP BY name
HAVING COUNT(*) > 1;
-- Expected: 0 rows (no duplicates)
```

---

## 📋 Agent Metadata Structure

All agents have this metadata structure:

```json
{
  "tier": 1 or 2,
  "priority": 1-250,
  "role": "specialist",
  "domain_expertise": "medical",
  "capabilities": [...],
  "knowledge_domains": [...],
  "competency_levels": {...},
  "business_function": "...",
  "rag_enabled": true,
  "context_window": 8000 or 16000,
  "source": "vital_agents_registry_250",
  "batch": 1-10,
  "agent_number": 1-250,
  "temperature": 0.6 or 0.7,
  "max_tokens": 2000 or 4000
}
```

---

## 🎉 Success Criteria

- [ ] All 250 agents loaded
- [ ] All agents have `is_active = false`
- [ ] All agents tagged with correct source
- [ ] No duplicate agent names
- [ ] All metadata properly structured
- [ ] Batch distribution verified (25 per batch)

---

## 📞 Support

**Files Location:** `/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/`

**Documentation:**
- `REGISTRY_250_LOADING_STATUS.md` - Current status
- `REGISTRY_250_LOADING_INSTRUCTIONS.md` - This file
- `AGENT_FILES_ANALYSIS_REPORT.md` - Source file analysis

**Generated:** $(date)  
**Project:** VITAL Path - Agent Registry  
**Database:** Supabase Production  
**Total Agents:** 250 (Development Status)

---

🚀 **Ready to execute! All SQL files are prepared and waiting in the `scripts/` directory.**

