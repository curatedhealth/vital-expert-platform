# Quick Fix: Apply User Panels Migrations Now

## The Problem
The save panel error `{}` is caused by missing database migrations. The `workflow_definition` column doesn't exist yet in your `user_panels` table.

## The Solution (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your VITAL project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy and Run the Migration

1. **Open this file** in your code editor:
   ```
   scripts/apply-all-user-panels-migrations.sql
   ```

2. **Copy the ENTIRE file content** (Cmd+A, then Cmd+C)

3. **Paste into Supabase SQL Editor** (Cmd+V)

4. **Click "Run"** (or press Cmd+Enter)

5. **Wait 2-3 seconds** - You should see output messages including:
   ```
   ✅ All migrations applied successfully!
   ```

### Step 3: Restart Your Dev Server

```bash
# Stop your current dev server (Ctrl+C)
npm run dev
```

### Step 4: Test Saving a Panel

1. Go to the Workflow Designer
2. Add at least one agent node to your workflow
3. Click "Save as Custom Panel"
4. Fill in the panel name
5. Click "Save Panel"

**Expected Result:** ✅ "Panel saved successfully!"

---

## What the Migration Does

The SQL script creates three things:

1. **`profiles` table** - Stores user profile data
2. **`user_panels` table** - Stores custom panels with:
   - name, description, mode, framework
   - selected_agents array
   - metadata, tags, icons
3. **`workflow_definition` column** - **CRITICAL** - Stores your workflow nodes and edges

Without the `workflow_definition` column, the save will fail silently with `{}`.

---

## Alternative: CLI Method (if Docker is running)

If you have Docker running and want to use Supabase CLI:

```bash
# Start Supabase (first time may take 5-10 minutes to pull images)
supabase start

# Apply migrations
supabase db push

# Check status
supabase db execute -f scripts/verify-user-panels-schema.sql
```

---

## Verification

After running the migration, you can verify it worked by running this query in SQL Editor:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_panels'
ORDER BY ordinal_position;
```

You should see a row for `workflow_definition` with type `jsonb`.

---

## Still Having Issues?

1. **Check browser console** (F12) → Console tab
2. **Check Network tab** → Find `/api/user-panels` request → Response tab
3. Share the actual error message

The error is currently empty `{}` because the frontend error handling can't parse the response. After migrations, you'll get proper error messages if something goes wrong.

---

## Files Reference

- **Migration SQL:** `scripts/apply-all-user-panels-migrations.sql`
- **Verification SQL:** `scripts/verify-user-panels-schema.sql`
- **Deployment Guide:** `APPLY_USER_PANELS_MIGRATIONS.md`
