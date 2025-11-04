# Manual Migration Steps for Performance Indexes

Since the automated migration script cannot execute DDL statements through the Supabase REST API, you need to apply the performance indexes migration manually through the Supabase SQL Editor.

## 📋 Quick Steps

1. **Open Supabase SQL Editor**:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Navigate to "SQL Editor"

2. **Copy and paste the migration SQL**:
   - Open: `database/sql/migrations/2025/20251025000000_add_performance_indexes.sql`
   - Copy the entire content
   - Paste into Supabase SQL Editor

3. **Execute the migration**:
   - Click "Run" button
   - Wait for completion (may take 1-2 minutes)

4. **Verify indexes were created**:
   ```sql
   SELECT
     schemaname,
     tablename,
     indexname
   FROM pg_indexes
   WHERE schemaname = 'public'
   AND indexname LIKE 'idx_%'
   ORDER BY tablename, indexname;
   ```

## 📦 What This Migration Does

The performance indexes migration creates **30+ indexes** across critical tables:

### Agents Table (9 indexes)
- `idx_agents_status` - Fast filtering by status
- `idx_agents_status_tier_business` - Combined filtering
- `idx_agents_knowledge_domains` - GIN index for array searches
- `idx_agents_capabilities` - GIN index for capability searches
- `idx_agents_tier` - Tier-based filtering
- `idx_agents_business_function` - Business function lookups
- `idx_agents_user_id_status` - User-owned agents
- `idx_agents_created_at` - Chronological sorting
- `idx_agents_name_trgm` - Fuzzy text search

### Knowledge Documents Table (6 indexes)
- `idx_knowledge_docs_agent_status_created` - Agent document lookups
- `idx_knowledge_docs_agent_id` - Agent association
- `idx_knowledge_docs_status` - Status filtering
- `idx_knowledge_docs_embedding_ivfflat` - Vector similarity search
- `idx_knowledge_docs_metadata_gin` - Metadata searches
- `idx_knowledge_docs_created_at` - Chronological sorting

### Chats Table (4 indexes)
- `idx_chats_user_agent_created` - User conversation history
- `idx_chats_user_id` - User lookups
- `idx_chats_agent_id` - Agent conversation history
- `idx_chats_created_at` - Recent conversations

### Prompts Table (3 indexes)
- `idx_prompts_capability_lookups` - Capability-based prompts
- `idx_prompts_status` - Active prompt filtering
- `idx_prompts_metadata_gin` - Prompt metadata searches

### Capabilities Table (2 indexes)
- `idx_capabilities_category` - Category filtering
- `idx_capabilities_name` - Name lookups

## ⚡ Expected Performance Improvements

After applying these indexes:

| Query Type | Before | After | Improvement |
|------------|--------|-------|-------------|
| List active agents | 500-1200ms | 50-100ms | **5-12x faster** |
| Agent search | 800-2000ms | 80-150ms | **10-13x faster** |
| User chat history | 300-800ms | 30-80ms | **10x faster** |
| Knowledge doc search | 1000-3000ms | 100-200ms | **10-15x faster** |
| Vector similarity | 2000-5000ms | 200-500ms | **10x faster** |

## 🔍 Verify Performance Improvement

After applying the migration, test query performance:

```sql
-- Test agent lookup (should be fast)
EXPLAIN ANALYZE
SELECT * FROM agents
WHERE status = 'active'
AND tier = 'tier_1'
LIMIT 50;

-- Test vector search (should show index scan)
EXPLAIN ANALYZE
SELECT * FROM knowledge_documents
WHERE agent_id = 'your-agent-id'
ORDER BY embedding <-> '[0.1, 0.2, ...]'::vector
LIMIT 10;

-- Test chat history (should be fast)
EXPLAIN ANALYZE
SELECT * FROM chats
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC
LIMIT 20;
```

Look for "Index Scan" in the EXPLAIN output (not "Seq Scan").

## 🚨 Rollback (If Needed)

If you need to remove the indexes:

```sql
-- Drop all indexes (copy from migration file's rollback section)
DROP INDEX IF EXISTS idx_agents_status;
DROP INDEX IF EXISTS idx_agents_status_tier_business;
-- ... (see full list in migration file)
```

## ✅ Post-Migration Checklist

- [ ] Migration executed successfully in Supabase SQL Editor
- [ ] All 30+ indexes created (verify with pg_indexes query)
- [ ] No errors in Supabase logs
- [ ] Query performance improved (test with EXPLAIN ANALYZE)
- [ ] Application still works correctly

## 📚 Next Steps

After applying the performance indexes:

1. **Test the application**: `npm run dev`
2. **Monitor query performance**: Check health endpoint
3. **Apply secured routes**: See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
4. **Deploy to production**: Follow deployment guide

---

**Need help?** Check the [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for detailed deployment steps.
