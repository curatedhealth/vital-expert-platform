# Registry 250 - Complete Loading Instructions

## Current Status
✅ **Loaded:** Batches 1-3 (75 agents - 30%)  
⏳ **Pending:** Batches 4-10 (175 agents - 70%)

## All Files Ready
```
scripts/exec_batch_04.sql → Agents 76-100 (33KB)
scripts/exec_batch_05.sql → Agents 101-125 (34KB)
scripts/exec_batch_06.sql → Agents 126-150 (33KB)
scripts/exec_batch_07.sql → Agents 151-175 (34KB)
scripts/exec_batch_08.sql → Agents 176-200 (34KB)
scripts/exec_batch_09.sql → Agents 201-225 (32KB)
scripts/exec_batch_10.sql → Agents 226-250 (33KB)
```

## Execution via MCP Supabase

### Method 1: Individual Migrations (Recommended)
For each batch (4-10), execute:

```bash
# Read batch file
cat scripts/exec_batch_XX.sql

# Then use MCP:
mcp_supabase_apply_migration(
  name="load_registry_250_batch_XX",
  query=<paste SQL content>
)
```

### Method 2: Via Supabase Dashboard  
1. Open Supabase SQL Editor
2. Copy/paste each batch file content
3. Execute sequentially

### Method 3: Combined Approach
Use the master file: `scripts/registry_250_master_batches_4_10.sql` (233KB)
- Contains all batches 4-10 combined
- May need to split for execution

## Verification
After loading all batches:

```sql
SELECT 
  (metadata->>'batch')::int as batch,
  COUNT(*) as agent_count,
  array_agg(DISTINCT name ORDER BY name) FILTER (WHERE (metadata->>'agent_number')::int <= ((metadata->>'batch')::int * 25) + 3) as sample_agents
FROM agents 
WHERE metadata->>'source' = 'vital_agents_registry_250'
GROUP BY batch
ORDER BY batch;
```

Expected: 10 rows, each with 25 agents

## Quick Load Summary
| Batch | Agents | File | Size | Status |
|-------|--------|------|------|--------|
| 1 | 1-25 | exec_batch_01.sql | 33KB | ✅ LOADED |
| 2 | 26-50 | exec_batch_02.sql | 33KB | ✅ LOADED |
| 3 | 51-75 | exec_batch_03.sql | 35KB | ✅ LOADED |
| 4 | 76-100 | exec_batch_04.sql | 33KB | ⏳ READY |
| 5 | 101-125 | exec_batch_05.sql | 34KB | ⏳ READY |
| 6 | 126-150 | exec_batch_06.sql | 33KB | ⏳ READY |
| 7 | 151-175 | exec_batch_07.sql | 34KB | ⏳ READY |
| 8 | 176-200 | exec_batch_08.sql | 34KB | ⏳ READY |
| 9 | 201-225 | exec_batch_09.sql | 32KB | ⏳ READY |
| 10 | 226-250 | exec_batch_10.sql | 33KB | ⏳ READY |

## Agent Tagging
All agents are tagged with:
- `is_active = false` (development mode)
- `metadata.source = 'vital_agents_registry_250'`
- `metadata.batch = [1-10]`
- `metadata.agent_number = [1-250]`

This allows for:
- Easy filtering: `WHERE metadata->>'source' = 'vital_agents_registry_250'`
- Selective activation for testing
- Batch-based queries

## Next Actions
1. Execute remaining batches 4-10 via MCP Supabase
2. Verify all 250 agents loaded successfully
3. Test sample agents from each batch
4. Document final loading results

---
**Project:** VITAL Path - Registry 250 Loading  
**Database:** Supabase Production  
**Target:** 250 agents with development status

