# Hierarchical Agents - Manual Execution Instructions

## ⚠️ Connection Timeout Detected

The Supabase MCP connection is timing out. Please execute the seed script manually.

## 📋 Instructions

### Option 1: Supabase SQL Editor (Recommended)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Open the file: `.vital-docs/vital-expert-docs/11-data-schema/agents/seeds/map_existing_agents_hierarchies.sql`
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run**

### Option 2: Command Line (psql)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

psql $DATABASE_URL -f .vital-docs/vital-expert-docs/11-data-schema/agents/seeds/map_existing_agents_hierarchies.sql
```

## 📊 What This Script Does

1. **Analyzes** your existing 319 agents
2. **Identifies** parent agents (directors, managers, leads, chiefs, heads, VPs)
3. **Links** specialists/analysts/coordinators as sub-agents
4. **Matches** by domain keywords (medical, clinical, regulatory, commercial, data, etc.)
5. **Creates** up to 100 hierarchical relationships
6. **Enables** deep agent features (`deep_agents_enabled=true`) for parent agents

## ✅ Expected Results

After execution, you should see:

```
Total hierarchies created: ~50-100
Total parent agents: ~25-50
Total sub-agents: ~50-100
```

Sample hierarchies will be displayed showing parent → sub-agent relationships.

## 🔍 Verification Query

After the script completes, run this to verify:

```sql
SELECT 
    COUNT(DISTINCT parent_agent_id) as parent_agents,
    COUNT(DISTINCT child_agent_id) as sub_agents,
    COUNT(*) as total_hierarchies
FROM agent_hierarchies
WHERE is_active = true AND deleted_at IS NULL;
```

## 📝 Notes

- The script is **idempotent** - safe to run multiple times (uses `ON CONFLICT DO NOTHING`)
- Limited to **100 hierarchies** to avoid timeout
- Creates **2 sub-agents per parent** maximum
- Automatically enables deep agent features for parent agents

## 🎯 Next Steps

After successful execution:

1. ✅ Phase 2 Task 7: **COMPLETE**
2. 🚀 Your 319 agents are now organized into hierarchies
3. 🤖 Parent agents can now delegate to sub-agents automatically
4. 📊 Ready for Phase 3: Evidence-Based Agent Selection with GraphRAG

---

**Need Help?** If the script completes successfully, report back with the summary output!

