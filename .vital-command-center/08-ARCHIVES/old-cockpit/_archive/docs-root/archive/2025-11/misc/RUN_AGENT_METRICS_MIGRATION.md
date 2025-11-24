# How to Run Agent Metrics Migration

## Option 1: Using Supabase CLI (Recommended)

```bash
# Navigate to project root
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Run migration
supabase migration up
```

Or if you need to apply a specific migration:
```bash
supabase db push
```

## Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/20250129000004_create_agent_metrics_table.sql`
4. Copy the entire contents
5. Paste into SQL Editor
6. Click **Run**

## Option 3: Using psql (Direct Database)

```bash
# Set your database connection string
export DATABASE_URL="postgresql://user:password@host:port/database"

# Run the migration
psql $DATABASE_URL < supabase/migrations/20250129000004_create_agent_metrics_table.sql
```

## Option 4: Using Node.js Script

```bash
# Run the TypeScript migration runner (if it exists)
npm run migrate
# OR
ts-node scripts/run-all-migrations.ts
```

---

## What This Migration Does

✅ Creates `agent_metrics` table for per-operation tracking  
✅ Creates indexes for performance  
✅ Sets up Row Level Security (RLS) policies  
✅ Creates `agent_metrics_daily` view for aggregations  
✅ Adds helpful comments/documentation  

---

## Verification

After running the migration, verify it worked:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'agent_metrics'
);

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'agent_metrics';

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'agent_metrics';
```

---

## Troubleshooting

### Error: "relation already exists"
- The table might already exist
- You can drop it first: `DROP TABLE IF EXISTS agent_metrics CASCADE;`
- Or modify the migration to use `CREATE TABLE IF NOT EXISTS` (already in place)

### Error: "permission denied"
- Make sure you're using a database user with CREATE privileges
- Or use the Supabase service role key

### Error: "syntax error at or near '#'"
- Don't copy bash comments or instructions
- Only copy the SQL code from the migration file
- The file uses `--` for SQL comments (which is correct)

---

## Important Notes

- The migration uses `DROP TABLE IF EXISTS` for clean re-runs
- All objects are created in the `public` schema
- RLS is enabled for tenant isolation
- Indexes are optimized for common query patterns

