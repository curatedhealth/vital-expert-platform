# Panel Save Error Fix

## Issue
When trying to save changes in the panel designer, encountered this error:

```
Failed to save panel
at handleSave (src/app/(app)/ask-panel/[slug]/page.tsx:178:15)
```

**Root Cause:** The panel was created in the `panels` table (template table), but the save operation tries to save to the `user_panels` table which doesn't exist yet.

---

## Architecture Understanding

### Two Tables for Panels

1. **`panels` table** - Template panels (read-only for users)
   - System-wide panel templates
   - Created by admins/scripts
   - Used as base templates
   - Example: Socratic Panel, Strategy Panel

2. **`user_panels` table** - User customizations (read-write for users)
   - User-specific panel configurations
   - Based on templates from `panels` table
   - Stores workflow customizations
   - Stores agent selections
   - User can save/update/delete

### How It Works

```
┌─────────────┐
│   panels    │ ← Template table (system-wide)
│  (templates)│
└──────┬──────┘
       │
       │ base_panel_slug
       │
       ▼
┌─────────────┐
│ user_panels │ ← User customizations
│  (instances)│
└─────────────┘
```

When a user:
1. Opens a panel: Loads template from `panels`
2. Customizes workflow: Changes are in memory
3. Clicks "Save": Creates/updates entry in `user_panels`
4. Future loads: Merges template + user customizations

---

## Solution

### Step 1: Create `user_panels` Table

You need to run the SQL manually in Supabase SQL Editor because PostgREST doesn't support DDL operations.

#### Quick Steps:
1. Go to: https://supabase.com/dashboard
2. Select your project: `bomltkhixeatxuoxmolq`
3. Navigate to: **SQL Editor**
4. Click **"New Query"**
5. Copy the SQL from `create-user-panels-table.sql` (it's in this directory)
6. Paste and click **"Run"**
7. You should see: `"user_panels table created successfully!"`

#### What the SQL Does:

```sql
-- Creates the table with all required columns
CREATE TABLE user_panels (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,              -- Who created it
  name TEXT NOT NULL,                 -- Panel name
  base_panel_slug TEXT,               -- Links to panels table
  mode TEXT NOT NULL,                 -- sequential/collaborative/hybrid
  framework TEXT NOT NULL,            -- langgraph/autogen/crewai
  selected_agents TEXT[] NOT NULL,    -- Agent IDs from workflow
  workflow_definition JSONB,          -- Complete workflow structure
  is_favorite BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- ... other columns

  -- Ensures at least one agent is selected
  CONSTRAINT user_panels_has_agents
    CHECK (array_length(selected_agents, 1) > 0)
);

-- Creates indexes for better performance
CREATE INDEX idx_user_panels_user_id ON user_panels(user_id);
CREATE INDEX idx_user_panels_base_panel_slug ON user_panels(base_panel_slug);
-- ... other indexes

-- Auto-updates updated_at timestamp
CREATE TRIGGER update_user_panels_updated_at ...
```

---

### Step 2: Understanding the Save Flow

#### What Happens When You Save:

1. **User makes changes** in workflow designer
   - Adds/removes agents
   - Changes node positions
   - Modifies connections

2. **User clicks "Save"**
   - Frontend collects:
     - Panel name
     - Selected agent IDs (from workflow nodes)
     - Complete workflow definition
     - Mode and framework settings

3. **POST to `/api/panels/[slug]`**
   ```javascript
   POST /api/panels/test-panel-drug-hash-jcnodk
   {
     name: "My Custom Panel",
     description: "Panel description",
     mode: "sequential",
     framework: "langgraph",
     selected_agents: ["agent-id-1", "agent-id-2"],
     workflow_definition: {
       nodes: [...],
       edges: [...]
     }
   }
   ```

4. **API saves to `user_panels`**
   ```javascript
   // Check if user already has a panel with this name
   const existing = await supabase
     .from('user_panels')
     .select('id')
     .eq('user_id', user.id)
     .eq('base_panel_slug', slug)
     .eq('name', name)
     .maybeSingle();

   if (existing) {
     // Update existing panel
     await supabase
       .from('user_panels')
       .update(panelData)
       .eq('id', existing.id);
   } else {
     // Create new panel
     await supabase
       .from('user_panels')
       .insert(panelData);
   }
   ```

5. **Success response**
   - Panel saved to database
   - UI shows success message
   - Panel available for future use

---

## Why Two Tables?

### Benefits of This Architecture:

1. **Template Reusability**
   - One template (`panels`) → Many customizations (`user_panels`)
   - Updates to templates don't affect user customizations

2. **User Isolation**
   - Each user has their own customizations
   - Changes don't affect other users

3. **Flexibility**
   - Users can create multiple variants of same template
   - Different agent selections for different use cases

4. **Performance**
   - Templates cached at system level
   - User data loaded on demand

### Example Flow:

```
User A opens "Strategy Panel" template
  → Customizes: adds "Market Analyst" agent
  → Saves as "My Strategy Panel"
  → Stored in user_panels with user_id = A

User B opens same "Strategy Panel" template
  → Customizes: adds "Financial Analyst" agent
  → Saves as "Financial Strategy"
  → Stored in user_panels with user_id = B

Both users see their own versions
Template remains unchanged for others
```

---

## Testing the Fix

### Step 1: Verify Table Created

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
  const { data, error } = await supabase
    .from('user_panels')
    .select('id')
    .limit(1);

  if (error) {
    if (error.code === 'PGRST204' || error.message.includes('no rows')) {
      console.log('✅ Table exists (empty)');
    } else {
      console.log('❌ Error:', error.message);
    }
  } else {
    console.log('✅ Table exists with', data?.length || 0, 'panels');
  }
})();
"
```

### Step 2: Test Save from UI

1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/ask-panel/test-panel-drug-hash-jcnodk`
3. Open workflow designer
4. Make a change (add/move a node)
5. Click "Save"
6. ✅ Should save without errors

### Step 3: Verify Panel Saved

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
  const { data: panels } = await supabase
    .from('user_panels')
    .select('id, name, base_panel_slug, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('User panels:');
  panels?.forEach(p => {
    console.log('  -', p.name, '(based on:', p.base_panel_slug, ')');
  });
})();
"
```

---

## Common Errors After Setup

### 1. "User not authenticated"
**Solution:** Make sure you're logged in. The API requires authentication.

### 2. "At least one agent is required"
**Solution:** The workflow must have at least one agent node.

### 3. "Invalid mode or framework"
**Solution:** Mode must be: sequential, collaborative, or hybrid
Framework must be: langgraph, autogen, or crewai

### 4. "Permission denied"
**Solution:** Check Row Level Security (RLS) policies on user_panels table.
You may need to add policies:

```sql
-- Enable RLS
ALTER TABLE user_panels ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own panels
CREATE POLICY "Users can view own panels" ON user_panels
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create panels
CREATE POLICY "Users can create panels" ON user_panels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own panels
CREATE POLICY "Users can update own panels" ON user_panels
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own panels
CREATE POLICY "Users can delete own panels" ON user_panels
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Files Reference

### Created/Updated Files:

1. ✅ `create-user-panels-table.sql` - SQL to create table
2. ✅ `setup-user-panels-table.js` - Script showing SQL instructions
3. ✅ `PANEL_SAVE_FIX.md` - This documentation
4. ✅ Test panel in database: `test-panel-drug-hash-jcnodk`

### API Endpoints:

- `GET /api/panels/[slug]` - Fetch panel template + user customizations
- `POST /api/panels/[slug]` - Save user customizations
- `GET /api/user-panels` - List user's custom panels
- `POST /api/user-panels` - Create new user panel

---

## Summary

### The Problem:
- ❌ Panel was in `panels` table (templates)
- ❌ Save tried to write to `user_panels` table
- ❌ `user_panels` table didn't exist

### The Solution:
1. ✅ Create `user_panels` table using SQL script
2. ✅ Set up proper RLS policies (optional but recommended)
3. ✅ Test save functionality

### Next Steps:
1. Run the SQL in Supabase SQL Editor
2. Verify table created successfully
3. Test saving a panel from the UI
4. Create more custom panels as needed

---

**Status:** Ready to implement
**Required Action:** Run SQL in Supabase SQL Editor
**SQL File:** `create-user-panels-table.sql`
**Estimated Time:** 2 minutes
