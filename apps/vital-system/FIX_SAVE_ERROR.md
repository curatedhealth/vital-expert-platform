# Fix Panel Save Error - Complete Guide

## Current Issue

**Error:** `Failed to save panel` when trying to save changes in the panel designer.

**Root Cause:** The `user_panels` table doesn't exist in your Supabase database.

---

## Solution Options

You have **3 options** to fix this:

### ✅ Option 1: Create the Table (Recommended - 2 minutes)

This is the proper solution that enables full panel customization functionality.

#### Steps:

1. **Open Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq
   ```

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Paste the SQL**

   Copy this entire SQL block:

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

4. **Click "Run"**
   - You should see: `"user_panels table created successfully!"`

5. **Done!** Go back to your app and try saving again.

---

### 🔄 Option 2: Temporary Workaround (If you can't create table now)

If you can't create the table right now, you can work around it:

1. **View the panel (read-only mode)**
   - You can still view and test the panel
   - Changes won't be saved, but you can test functionality

2. **Copy the workflow definition**
   - Open browser console (F12)
   - Copy the workflow JSON
   - Save it locally for later

3. **Re-create when table is ready**
   - Once the table is created, you can restore your work

---

### 🛠️ Option 3: Use Script to Verify & Test

Run this script to check the status and get detailed info:

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('='.repeat(60));
  console.log('Panel Save Diagnostic');
  console.log('='.repeat(60));

  // Check if user_panels table exists
  const { data, error } = await supabase
    .from('user_panels')
    .select('id')
    .limit(1);

  if (error && error.code === 'PGRST205') {
    console.log('\\n❌ PROBLEM FOUND');
    console.log('   The user_panels table does NOT exist.');
    console.log('\\n📋 SOLUTION:');
    console.log('   1. Go to Supabase Dashboard');
    console.log('   2. SQL Editor → New Query');
    console.log('   3. Copy SQL from: create-user-panels-table.sql');
    console.log('   4. Paste and Run');
    console.log('\\n💡 Quick Link:');
    console.log('   https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql/new');
  } else if (error) {
    console.log('\\n❌ Unexpected Error:', error.message);
  } else {
    console.log('\\n✅ Table exists!');
    console.log('   Panels:', data?.length || 0);
    console.log('\\n   Save should work now.');
  }
  console.log('\\n' + '='.repeat(60));
})();
"
```

---

## Why This Happens

### Architecture Overview:

```
┌──────────────────────────────────────────────┐
│  Frontend (Next.js)                          │
│  - Panel Designer UI                         │
│  - Workflow Editor                           │
└────────────────┬─────────────────────────────┘
                 │ HTTP POST
                 │ /api/panels/[slug]
                 ▼
┌──────────────────────────────────────────────┐
│  API Route                                   │
│  - Validates user authentication             │
│  - Prepares panel data                       │
└────────────────┬─────────────────────────────┘
                 │ INSERT/UPDATE
                 ▼
┌──────────────────────────────────────────────┐
│  Supabase Database                           │
│  ❌ user_panels table (MISSING)              │
└──────────────────────────────────────────────┘
```

### What Should Happen:

```
User makes changes → Clicks Save → API saves to user_panels
                                   ↓
                              ✅ Success!
                              Panel saved to database
```

### What's Happening Now:

```
User makes changes → Clicks Save → API tries to save
                                   ↓
                              ❌ Table not found!
                              Error: PGRST205
```

---

## Verification After Fix

After creating the table, verify it works:

### 1. Check Table Exists

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { error } = await supabase.from('user_panels').select('id').limit(1);
  console.log(error ? '❌ Table not found' : '✅ Table exists');
})();
"
```

### 2. Test Save from UI

1. Open panel: `http://localhost:3000/ask-panel/test-panel-drug-hash-jcnodk`
2. Make a change (move a node)
3. Click "Save"
4. Should see: "Panel saved successfully!"

### 3. Verify in Database

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data } = await supabase
    .from('user_panels')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('Recent panels:');
  data?.forEach(p => console.log('  -', p.name));
})();
"
```

---

## Troubleshooting

### Error: "User not authenticated"

**Solution:** You need to be logged in. The API checks authentication.

```javascript
// Check if you're logged in
// In browser console:
const supabase = createClient(/* ... */);
const { data } = await supabase.auth.getSession();
console.log('User:', data.session?.user?.email);
```

### Error: "At least one agent is required"

**Solution:** Your workflow must have at least one agent node.

The constraint check:
```sql
CONSTRAINT user_panels_has_agents
  CHECK (array_length(selected_agents, 1) > 0)
```

### Error: "Permission denied" (After creating table)

**Solution:** RLS policies might not be set up. Run this:

```sql
-- Enable RLS
ALTER TABLE user_panels ENABLE ROW LEVEL SECURITY;

-- Add policies (already included in main SQL above)
CREATE POLICY "Users can view own panels" ON user_panels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create panels" ON user_panels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own panels" ON user_panels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own panels" ON user_panels
  FOR DELETE USING (auth.uid() = user_id);
```

### Error: "Invalid mode or framework"

**Solution:** Check your request payload. Must use:
- **mode:** `'sequential'`, `'collaborative'`, or `'hybrid'`
- **framework:** `'langgraph'`, `'autogen'`, or `'crewai'`

---

## Quick Reference

### Files in This Directory:

1. **`create-user-panels-table.sql`** - SQL to create table (copy/paste to Supabase)
2. **`FIX_SAVE_ERROR.md`** - This guide
3. **`PANEL_SAVE_FIX.md`** - Detailed explanation
4. **`setup-user-panels-table.js`** - Shows SQL with instructions

### Commands:

```bash
# Check if table exists
node -e "require('./test-connection.js')" # Use existing test script

# Create new test panel (after table exists)
node create-test-panel.js

# View all panels
node view-panel.js

# View specific panel
node view-panel.js <panel-id>
```

### Links:

- **Supabase Dashboard:** https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq
- **SQL Editor:** https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql/new
- **Local Panel:** http://localhost:3000/ask-panel/test-panel-drug-hash-jcnodk

---

## Next Steps

1. ✅ **Create the table** using Option 1 above
2. ✅ **Test save** in the UI
3. ✅ **Verify** panel saved to database
4. ✅ **Customize** your workflows
5. ✅ **Create more panels** as needed

---

## Summary

**Problem:** Save fails because `user_panels` table doesn't exist

**Solution:** Run SQL in Supabase SQL Editor to create table

**Time Required:** 2 minutes

**Files Provided:**
- SQL script: `create-user-panels-table.sql`
- This guide: `FIX_SAVE_ERROR.md`
- Detailed docs: `PANEL_SAVE_FIX.md`

**After Fix:** Save will work perfectly! ✅

---

**Need Help?** The SQL is ready in `create-user-panels-table.sql` - just copy and paste into Supabase SQL Editor!
