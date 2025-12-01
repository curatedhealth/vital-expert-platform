# Quick Fix: User Agents Service Unavailable

## Problem
The error "User agents service temporarily unavailable" appears when trying to add agents to chat. This means the `user_agents` table doesn't exist in your Supabase database.

## Solution

### Option 1: Via Supabase Dashboard (RECOMMENDED - FASTEST)

1. **Open Supabase Dashboard**:
   - Go to: https://bomltkhixeatxuoxmolq.supabase.co
   - Navigate to: **SQL Editor**

2. **Run this SQL**:

```sql
-- Create user_agents table
CREATE TABLE IF NOT EXISTS user_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    original_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    is_user_copy BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_agent_id ON user_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_original_agent_id ON user_agents(original_agent_id);

-- Enable RLS
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own agent relationships" ON user_agents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent relationships" ON user_agents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent relationships" ON user_agents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent relationships" ON user_agents
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to user_agents" ON user_agents
    FOR ALL TO service_role USING (true) WITH CHECK (true);
```

3. **Click "Run"** button

4. **Refresh your browser** and try adding an agent again

### Option 2: Via Command Line

Run the migration:
```bash
cd apps/vital-system
npx supabase migration up
```

Or apply the specific migration:
```bash
psql $DATABASE_URL -f apps/vital-system/supabase/migrations/20250128000000_create_user_agents_table.sql
```

### Option 3: Via Node Script

```bash
npx tsx scripts/fix-user-agents-via-api.ts
```

## Verification

After running any of the above, verify the table exists:

1. Go to Supabase Dashboard > **Table Editor**
2. Look for `user_agents` table in the list
3. You should see these columns:
   - id
   - user_id
   - agent_id
   - original_agent_id
   - is_user_copy
   - added_at
   - last_used_at
   - usage_count
   - is_active
   - metadata
   - created_at
   - updated_at

## Test the Fix

1. Go to `/agents` page
2. Click "Add to Chat" on any agent
3. You should see: "✅ [Agent Name] has been added to your chat list!"
4. Navigate to `/chat` page
5. The agent should appear in the "My Agents" sidebar section

## If Still Not Working

Check the browser console for errors:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for any red errors
4. Share the error message for further debugging








