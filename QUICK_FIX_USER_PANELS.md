# ⚡ QUICK FIX: Create user_panels Table

## The Problem
You're getting this error: `Could not find the table 'public.user_panels' in the schema cache`

**This means the database table doesn't exist yet. You MUST run a migration to create it.**

## ✅ SOLUTION (2 minutes - Copy & Paste)

## Solution (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Migration
1. Open the file: `scripts/create-user-panels-table.sql` in your code editor
2. **Copy ALL the SQL** (the entire file)
3. **Paste it** into the Supabase SQL Editor
4. Click **Run** (or press Cmd+Enter / Ctrl+Enter)

### Step 3: Verify
You should see a success message: `✅ user_panels table created successfully!`

### Step 4: Try Again
Go back to the Designer and try saving your panel again. It should work now!

---

## Alternative: Using Supabase CLI

If you have Supabase CLI linked to your project:

```bash
# From the project root
supabase db execute -f scripts/create-user-panels-table.sql
```

---

## What This Script Does

- Creates the `panels` table (if it doesn't exist)
- Creates the `user_panels` table with all required columns
- Adds the `workflow_definition` JSONB column for storing workflow data
- Sets up indexes for performance
- Configures Row Level Security (RLS) policies
- Uses `IF NOT EXISTS` so it's safe to run multiple times

---

## Still Having Issues?

If you still get errors after running the script:

1. **Check the SQL Editor output** - Look for any error messages
2. **Verify table exists** - Run this in SQL Editor:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'user_panels';
   ```
   Should return: `user_panels`

3. **Check RLS is enabled**:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename = 'user_panels';
   ```
   Should show: `rowsecurity = true`

