# Database Migrations Guide

## Overview

This guide provides step-by-step instructions for running the database migrations that create essential tables for the agent system.

---

## Prerequisites

1. **Access to Supabase Dashboard**: You need admin access to your Supabase project
2. **SQL Editor Access**: Access to the Supabase SQL Editor or database connection

---

## Migration Files

The following migration files are ready to be executed:

1. **`supabase/migrations/20250129000003_create_agent_relationship_graph.sql`**
   - Creates `agent_relationships` table
   - Creates `agent_knowledge_graph` table
   - Sets up indexes and RLS policies

2. **`supabase/migrations/20250129000004_create_agent_metrics_table.sql`**
   - Creates `agent_metrics` table (detailed per-operation tracking)
   - Creates `agent_metrics_daily` materialized view (daily aggregations)
   - Sets up indexes and RLS policies

---

## Option 1: Supabase SQL Editor (Recommended)

### Steps:

1. **Navigate to SQL Editor**
   - Go to your Supabase project dashboard
   - Click on "SQL Editor" in the sidebar
   - Click "New Query"

2. **Run Agent Relationship Graph Migration**
   - Open `supabase/migrations/20250129000003_create_agent_relationship_graph.sql`
   - Copy the entire SQL content
   - Paste into SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

3. **Verify Agent Relationship Tables**
   - Run this query to verify:
   ```sql
   SELECT 
     (SELECT COUNT(*) FROM agent_relationships) as relationships_count,
     (SELECT COUNT(*) FROM agent_knowledge_graph) as knowledge_nodes_count;
   ```
   - Should return counts (may be 0 if no data yet)

4. **Run Agent Metrics Migration**
   - Open `supabase/migrations/20250129000004_create_agent_metrics_table.sql`
   - Copy the entire SQL content
   - Paste into SQL Editor
   - Click "Run"

5. **Verify Agent Metrics Table**
   - Run this query to verify:
   ```sql
   SELECT 
     COUNT(*) as total_metrics,
     COUNT(DISTINCT agent_id) as unique_agents,
     COUNT(DISTINCT operation_type) as operation_types
   FROM agent_metrics;
   ```
   - Should return counts (may be 0 if no metrics recorded yet)

6. **Check Indexes**
   - Run this query to verify indexes were created:
   ```sql
   SELECT indexname 
   FROM pg_indexes 
   WHERE tablename IN ('agent_relationships', 'agent_knowledge_graph', 'agent_metrics')
   ORDER BY tablename, indexname;
   ```
   - Should list all indexes

---

## Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Navigate to project root
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Link to your Supabase project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

---

## Option 3: psql Command Line

If you have direct database access:

```bash
# Get connection string from Supabase Dashboard > Settings > Database

# Run migrations
psql "YOUR_CONNECTION_STRING" -f supabase/migrations/20250129000003_create_agent_relationship_graph.sql
psql "YOUR_CONNECTION_STRING" -f supabase/migrations/20250129000004_create_agent_metrics_table.sql
```

---

## Verification Checklist

After running migrations, verify:

- [ ] `agent_relationships` table exists
- [ ] `agent_knowledge_graph` table exists
- [ ] `agent_metrics` table exists
- [ ] `agent_metrics_daily` view exists
- [ ] RLS policies are enabled
- [ ] Indexes are created (check with `\d tablename` in psql or SQL Editor)

### Verification Queries

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('agent_relationships', 'agent_knowledge_graph', 'agent_metrics');

-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('agent_relationships', 'agent_knowledge_graph', 'agent_metrics');

-- Check indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('agent_relationships', 'agent_knowledge_graph', 'agent_metrics')
ORDER BY tablename, indexname;
```

---

## Troubleshooting

### Error: "relation already exists"
- The table/view already exists. You can either:
  - Drop and recreate (if safe): `DROP TABLE IF EXISTS tablename CASCADE;`
  - Or skip the migration if it's already applied

### Error: "permission denied"
- Check that you're using a user with sufficient privileges
- For Supabase, use the service role key or ensure your user has admin privileges

### Error: "syntax error"
- Make sure you copied the entire SQL file
- Check for any syntax issues (though files should be valid)
- Verify you're running in the correct database/schema

### RLS Policies Not Working
- Ensure RLS is enabled: `ALTER TABLE tablename ENABLE ROW LEVEL SECURITY;`
- Verify policies exist: `SELECT * FROM pg_policies WHERE tablename = 'tablename';`

---

## What These Migrations Enable

### Agent Relationship Graph
- **Enables**: Graph-based agent relationships (collaborates, supervises, delegates)
- **Used By**: GraphRAG service for relationship-aware agent search
- **Tables**: `agent_relationships`, `agent_knowledge_graph`

### Agent Metrics
- **Enables**: Detailed tracking of agent operations (search, selection, mode execution)
- **Used By**: Analytics API, Agent Metrics Service, Prometheus integration
- **Tables**: `agent_metrics`, `agent_metrics_daily` (view)

---

## Next Steps

After migrations are complete:

1. ✅ Verify tables exist (use verification queries above)
2. ✅ Test agent operations - metrics should start recording
3. ✅ Check Analytics Dashboard - should show data from `agent_metrics`
4. ✅ Test GraphRAG search - should use relationship graph

---

**Status**: 📋 Ready to Execute  
**Date**: January 29, 2025  
**Estimated Time**: 5-10 minutes

