# Debug Step 1 Migration

## ⚠️ Table Not Created - Troubleshooting

If `knowledge_domains_new` table doesn't exist after running Step 1, let's debug:

---

## 🔍 Step 1: Check for Errors

When you ran the migration, did you see:
- ✅ Success messages?
- ❌ Error messages?
- ⚠️  Warnings?

**Check the migration output** - Scroll through and look for any errors in red.

---

## 🔍 Step 2: Check What Tables Exist

Run this to see all domain-related tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%domain%'
ORDER BY table_name;
```

This shows:
- `knowledge_domains` (old table)
- `knowledge_domains_new` (should exist after Step 1)
- Any other domain tables

---

## 🔍 Step 3: Check ENUM Types

The migration creates ENUM types first. Check if they exist:

```sql
SELECT typname 
FROM pg_type 
WHERE typname IN ('domain_scope', 'access_policy_level', 'maturity_level', 'exposure_level')
ORDER BY typname;
```

**Expected**: Should show 4 rows

If you see 0 rows → The migration didn't run properly.

---

## 🔍 Step 4: Check for Table Creation Permission

Run this to check your database permissions:

```sql
SELECT 
  current_user,
  current_database(),
  current_schema();
```

Make sure you're running as a user with CREATE TABLE permissions.

---

## 🔍 Step 5: Try Creating Table Manually

If the migration failed, try creating the table manually:

```sql
-- Create ENUM types first
DO $$ BEGIN
  CREATE TYPE domain_scope AS ENUM ('global', 'enterprise', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE access_policy_level AS ENUM (
    'public',
    'enterprise_confidential',
    'team_confidential',
    'personal_draft'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE maturity_level AS ENUM ('Established', 'Specialized', 'Emerging', 'Draft');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE exposure_level AS ENUM ('High', 'Medium', 'Low', 'None');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Then create table (minimal version for testing)
CREATE TABLE IF NOT EXISTS public.knowledge_domains_new (
  domain_id TEXT PRIMARY KEY,
  parent_domain_id TEXT,
  function_id TEXT NOT NULL,
  function_name TEXT NOT NULL,
  domain_name TEXT NOT NULL,
  domain_scope domain_scope NOT NULL DEFAULT 'global',
  access_policy access_policy_level DEFAULT 'public',
  rag_priority_weight DECIMAL(3,2) DEFAULT 0.9,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Then check again:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'knowledge_domains_new';
```

Should return 1 row now.

---

## 🔍 Step 6: Check Migration Output

Look at the migration script output. Did you see:

✅ Success message:
```
✅ Unified RAG Domain Architecture migration completed!
```

OR

❌ Error messages like:
```
ERROR: ...
```

---

## 🚨 Common Issues

### Issue 1: Migration Ran But Table Not Visible
- **Solution**: Refresh your SQL Editor or check different schema

### Issue 2: Permission Denied
- **Solution**: Make sure you're using service role key or have CREATE TABLE permissions

### Issue 3: Transaction Rolled Back
- **Solution**: Check if there were errors that caused rollback

### Issue 4: Wrong Database
- **Solution**: Make sure you're running in the correct Supabase project

---

## ✅ Next Steps

1. **Check for errors** in migration output
2. **Run the debug queries** above
3. **Share the results** - What do you see?

If the table still doesn't exist, we can:
- Run the manual table creation above
- Check for specific errors
- Create a simplified migration

---

**Let's find out why the table wasn't created!** 🔍

