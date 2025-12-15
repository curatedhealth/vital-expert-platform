# Tenant ID Database Checks - Guide

## Timeout Issue

The comprehensive diagnostic queries may timeout on large databases. Use these strategies:

## Recommended Approach

### Option 1: Run Simple Queries Individually

Use `check_tenant_id_simple.sql` and run **one query at a time**:

```sql
-- Run this first
SELECT COUNT(*) as tables_with_tenant_id
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id';
```

Then run each subsequent query separately.

### Option 2: Use Optimized Queries

Use `diagnose_tenant_id_issues_optimized.sql` which includes:
- LIMIT clauses to prevent large result sets
- More efficient CTEs
- Focused queries

### Option 3: Filter by Table Pattern

If you want to check specific table categories, add WHERE clauses:

```sql
-- Check only agent tables
SELECT table_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
  AND table_name LIKE 'agent%'
ORDER BY table_name;
```

## Quick Checks

### 1. Count Tables with tenant_id
```sql
SELECT COUNT(DISTINCT table_name) 
FROM information_schema.columns
WHERE table_schema = 'public' AND column_name = 'tenant_id';
```

### 2. Check Nullable Columns
```sql
SELECT table_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND column_name = 'tenant_id' 
  AND is_nullable = 'YES'
LIMIT 20;
```

### 3. Check Foreign Keys
```sql
SELECT tc.table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'tenants'
  AND kcu.column_name = 'tenant_id'
LIMIT 20;
```

## Files Available

1. **check_tables_with_tenant_id.sql** - Original comprehensive queries (may timeout)
2. **check_tenant_id_simple.sql** - Lightweight queries (run one at a time)
3. **diagnose_tenant_id_issues_optimized.sql** - Optimized with LIMITs
4. **tenant_id_tables_summary.md** - Summary of all 259 tables found

## What We Already Know

From the successful query, we know:
- **259 tables** have tenant_id columns
- Mix of nullable and NOT NULL columns
- Categories: agents, JTBD, personas, org structure, etc.
- See `tenant_id_tables_summary.md` for full breakdown

## Next Steps

1. Run simple queries individually to avoid timeouts
2. Focus on specific table categories if needed
3. Use the summary document to prioritize which tables to check
4. Consider increasing statement timeout if you have database admin access
