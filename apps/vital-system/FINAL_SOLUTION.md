# Final Solution: Panel Save Fix

## Current Status

✅ **Problem Identified**: The `user_panels` table does not exist in your Supabase database.

✅ **SQL Created**: Complete SQL ready to execute (`create-user-panels-table.sql`)

❌ **Blocker**: Cannot execute SQL programmatically due to Supabase API/CLI limitations

## What You Need to Do (2 Minutes)

### Step 1: Open Supabase SQL Editor

Click this link:
```
https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql/new
```

### Step 2: Copy the SQL

The SQL is in the file `create-user-panels-table.sql` in your project root.

Or copy it from here:

```sql
-- Create user_panels table
CREATE TABLE IF NOT EXISTS user_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID,
  organization_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'panel',
  base_panel_slug TEXT,
  is_template_based BOOLEAN DEFAULT false,
  mode TEXT NOT NULL CHECK (mode IN ('sequential', 'collaborative', 'hybrid')),
  framework TEXT NOT NULL CHECK (framework IN ('langgraph', 'autogen', 'crewai')),
  selected_agents TEXT[] NOT NULL,
  suggested_agents TEXT[] DEFAULT '{}',
  custom_settings JSONB DEFAULT '{}',
  default_settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  icon TEXT,
  tags TEXT[] DEFAULT '{}',
  workflow_definition JSONB,
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_panels_has_agents CHECK (array_length(selected_agents, 1) > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_panels_user_id ON user_panels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_panels_base_panel_slug ON user_panels(base_panel_slug);
CREATE INDEX IF NOT EXISTS idx_user_panels_category ON user_panels(category);
CREATE INDEX IF NOT EXISTS idx_user_panels_is_favorite ON user_panels(is_favorite);
CREATE INDEX IF NOT EXISTS idx_user_panels_last_used ON user_panels(last_used_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_user_panels_created_at ON user_panels(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE user_panels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own panels" ON user_panels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create panels" ON user_panels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own panels" ON user_panels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own panels" ON user_panels
  FOR DELETE USING (auth.uid() = user_id);

-- Success message
SELECT 'user_panels table created successfully!' AS result;
```

### Step 3: Paste and Run

1. Paste the SQL into the Supabase SQL Editor
2. Click the "Run" button
3. You should see: `"user_panels table created successfully!"`

### Step 4: Verify It Worked

Run this command in your terminal:

```bash
node scripts/insert-panels.js
```

You should see:
```
✅ user_panels table EXISTS!
✅ Insert successful!
✅ SAVE FUNCTIONALITY IS WORKING!
```

### Step 5: Test in Your App

1. Go to: `http://localhost:3000/ask-panel/test-panel-drug-hash-jcnodk`
2. Make a change in the workflow designer
3. Click "Save"
4. It should now save successfully! ✅

## Why Programmatic Creation Failed

We attempted multiple approaches:

1. **Supabase CLI** - Requires migration files in specific directory structure
2. **psql** - Not installed on your system
3. **node-postgres** - DNS resolution failed: `ENOTFOUND db.bomltkhixeatxuoxmolq.supabase.co`
4. **Supabase REST API** - PostgREST doesn't support DDL (CREATE TABLE) operations

The only reliable method is manual execution via Supabase Dashboard SQL Editor.

## What This Table Does

The `user_panels` table stores customized panels that users create:

- **Base Template**: `panels` table (system-wide templates)
- **User Customizations**: `user_panels` table (your custom workflows)

When you save a panel, it creates/updates an entry in `user_panels` that links to the base template via `base_panel_slug`.

## After This Fix

✅ Save button will work
✅ Your panel changes will persist
✅ You can create multiple custom panels
✅ Each panel can have different agent configurations

## Need Help?

If you see any errors after running the SQL, check:

1. **User not authenticated**: Make sure you're logged in
2. **Permission denied**: RLS policies may need adjustment
3. **Invalid mode/framework**: Check your panel configuration

All the SQL and RLS policies are already included in the script above, so you shouldn't encounter these issues.

---

**Summary**: Copy the SQL → Paste in Supabase SQL Editor → Run → Test → Done! ✅
