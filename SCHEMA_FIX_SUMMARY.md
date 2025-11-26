# ✅ Schema Fix Applied - Ready to Execute

## 🔧 Issue Identified & Fixed

**Problem**: Migration was using wrong table name and columns
- ❌ Wrong: `agent_tools` table with columns `is_primary`, `is_required`, `usage_count`
- ✅ Correct: `agent_tool_assignments` table with columns `is_enabled`, `auto_use`, `priority`

## ✅ Files Updated

1. **`supabase/migrations/20251123_populate_agent_tools.sql`**
   - Fixed all INSERT statements to use `agent_tool_assignments`
   - Updated columns to match actual schema
   - Added priority levels (5-20) based on tool importance

2. **`services/ai-engine/scripts/load_agents_to_neo4j.py`**
   - Updated to query `agent_tool_assignments` instead of `agent_tools`

---

## 🚀 Ready to Execute - Updated Instructions

### Step 1: Run SQL Migrations (Supabase Dashboard)

Go to: **https://supabase.com/dashboard** → SQL Editor

#### Migration 1: agent_knowledge_domains (Already Run ✅)
```sql
-- File: supabase/migrations/20251123_create_agent_knowledge_domains.sql
-- Status: ✅ Complete (0 mappings means table created, now needs data)
```

**Result**: Table created successfully!

#### Migration 2: agent_tool_assignments (Run This Now)
```sql
-- File: supabase/migrations/20251123_populate_agent_tools.sql
-- Copy/paste the ENTIRE file content into SQL Editor and run
```

**Expected Results**:
- ~638 universal tool assignments (web_search, knowledge_base_search for all 319 agents)
- ~1,500-2,000 role-specific assignments
- **Total: ~2,000-2,500 agent-tool assignments**

---

### Step 2: Complete Data Loading

After both migrations complete, run:

```bash
cd /Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF/services/ai-engine
./scripts/complete_phase0.sh
```

Or run manually:

```bash
# Re-run Neo4j with new relationships
cd /Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF/services/ai-engine
./scripts/load_neo4j.sh --clear-existing
```

**Expected Neo4j Results**:
- USES_TOOL relationships: 0 → **~2,500** ✨
- KNOWS_ABOUT relationships: 0 → **~600** ✨
- **Total relationships: 1,838 → ~5,000** (+172%)

---

## 📊 Verification Queries

After running migration, verify with:

```sql
-- Check agent_tool_assignments
SELECT 
  COUNT(*) AS total_assignments,
  COUNT(DISTINCT agent_id) AS agents_with_tools,
  COUNT(DISTINCT tool_id) AS tools_used
FROM agent_tool_assignments;

-- Expected: ~2,500 assignments, 319 agents, 13 tools
```

```sql
-- Check agent_knowledge_domains (after migration 1 data population)
SELECT 
  COUNT(*) AS total_mappings,
  COUNT(DISTINCT agent_id) AS agents_with_domains,
  COUNT(DISTINCT domain_name) AS unique_domains
FROM agent_knowledge_domains;

-- Expected: ~600 mappings, 319 agents, ~15 domains
```

---

## 🎯 What's Next

Once migrations complete:
1. ✅ Fixed schema issues
2. ✅ Ready to re-run Neo4j loading
3. ✅ Ready for Phase 1: GraphRAG Service Implementation

**All set! Run migration 2, then complete_phase0.sh** 🚀

