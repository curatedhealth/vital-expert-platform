# Fix: Apply User Panels Migrations

## Problem
When saving a custom panel in the workflow designer, you're getting an empty error `{}`. This is because the database migrations haven't been applied yet, specifically the `workflow_definition` column is missing from the `user_panels` table.

## Solution: Apply Migrations

Choose ONE of the following methods:

---

### Method 1: Using Supabase CLI (Recommended)

**Prerequisites:** Docker must be running

```bash
# 1. Start Docker (if not running)
# macOS: Open Docker Desktop or OrbStack

# 2. Start Supabase local instance
supabase start

# 3. Apply migrations
supabase db push

# 4. Verify migrations
supabase db execute -f scripts/verify-user-panels-schema.sql
```

---

### Method 2: Using Supabase Dashboard (Easiest)

**No Docker required - works immediately**

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Apply All Migrations**
   - Copy the entire contents of:
     ```
     scripts/apply-all-user-panels-migrations.sql
     ```
   - Paste into the SQL Editor
   - Click **Run** (or press Cmd+Enter)

4. **Verify Success**
   - You should see a success message:
     ```
     ✅ All migrations applied successfully!
     ```
   - The message will show:
     - Profiles table: ✅ EXISTS
     - User panels table: ✅ EXISTS
     - Workflow definition column: ✅ EXISTS

---

### Method 3: Manual Verification

If you want to check if migrations are already applied:

1. Go to Supabase Dashboard → SQL Editor
2. Run this query:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'user_panels'
   AND column_name = 'workflow_definition';
   ```
3. If it returns a row, migrations are applied ✅
4. If it returns empty, run Method 2 above

---

## After Applying Migrations

1. **Restart your development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Test saving a panel:**
   - Go to the Workflow Designer
   - Create a workflow with at least one agent node
   - Click "Save as Custom Panel"
   - Fill in the panel name and description
   - Click "Save Panel"
   - You should see: ✅ "Panel saved successfully!"

---

## What These Migrations Do

1. **`20251126000002_ensure_profiles_table.sql`**
   - Creates the `profiles` table for user data
   - Adds RLS policies for security

2. **`20251126000003_create_user_panels_table.sql`**
   - Creates the `user_panels` table for custom panels
   - Adds columns: name, description, mode, framework, selected_agents, etc.
   - Sets up RLS policies (users can only see/edit their own panels)

3. **`20251127000001_add_workflow_definition_to_user_panels.sql`**
   - **Critical:** Adds the `workflow_definition` JSONB column
   - This column stores the complete workflow (nodes, edges, phases)
   - Without this, saving panels will fail

---

## Troubleshooting

### Error: "table user_panels does not exist"
- Run Method 2 above (Supabase Dashboard)
- This will create the table

### Error: "column workflow_definition does not exist"
- Run Method 2 above
- This will add the missing column

### Still getting empty error `{}`
1. Check browser console (F12) for detailed error
2. Check Network tab → find `/api/user-panels` request
3. Look at the response body for actual error details
4. Share the error with the development team

### Docker issues (Method 1)
- Make sure Docker Desktop or OrbStack is running
- Check: `docker ps` should show Supabase containers
- If not running: `supabase start`

---

## Files Created

- ✅ `scripts/apply-all-user-panels-migrations.sql` - Consolidated migration (use in dashboard)
- ✅ `scripts/verify-user-panels-schema.sql` - Verification query
- ✅ `scripts/deploy-user-panels-migrations.sh` - Automated deployment (requires Docker)

---

## Quick Start (Copy/Paste)

**For Supabase Dashboard:**

1. Copy this file: `scripts/apply-all-user-panels-migrations.sql`
2. Paste and run in: https://supabase.com/dashboard → SQL Editor
3. Restart your dev server
4. Test saving a panel

**Done! 🎉**
