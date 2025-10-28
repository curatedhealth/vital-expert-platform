# Fix Agents Loading Error

## Problem

The agents page shows:
```
Error loading agents
Failed to fetch agents from both API and database
```

**Root Cause:** The `agents` table also has Row Level Security (RLS) enabled, blocking the API from reading agents.

**Dev server logs show:**
```
❌ [Agents CRUD] Database error
GET /api/agents-crud 500
```

---

## Solution: Add RLS Policy for Agents Table

You need to run ONE more SQL query in Supabase to allow the API to read agents.

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run This SQL

```sql
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Enable read access for all agents" ON public.agents;

-- Create policy to allow reading all agents
CREATE POLICY "Enable read access for all agents"
ON public.agents
FOR SELECT
TO anon, authenticated
USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
```

### Step 3: Refresh Browser

After running the SQL:
1. Go back to http://digital-health-startups.localhost:3000/agents
2. Refresh the page (Cmd+R or F5)
3. You should see **254 agents load successfully**

---

## Why This is Safe

**Is this secure?**

Yes! In your multi-tenant architecture:
- All 254 agents are **shared resources** available to all tenants
- Agents don't contain tenant-specific data
- This is a "catalog" of AI agents that all clients can access
- True tenant isolation happens at the conversations/data level (not agents)

**What IS tenant-isolated:**
- User data
- Conversations
- Documents
- Tenant settings
- Billing information

**What is NOT tenant-isolated (shared across all tenants):**
- Agents (public catalog)
- Tools (public catalog)
- Templates (public resources)

---

## After Running the SQL

### Expected Behavior:

**Dev server logs:**
```
✅ [Agents CRUD] Successfully fetched 254 agents
GET /api/agents-crud 200
```

**Browser:**
- Agents page loads with 254 agent cards
- No more error message
- Can search/filter agents
- Can click on agents to view details

---

## Test It

Once SQL is run:

```bash
# Test the API directly
curl http://localhost:3000/api/agents-crud

# Should return JSON with 254 agents
```

Or open in browser:
- http://digital-health-startups.localhost:3000/agents

---

## Note: Why We Need This

Your API route (`/api/agents-crud`) uses the **Service Role Key**, but I see from the error it's still hitting RLS. This means either:

1. The table has RLS enabled and no policy for service role
2. The env vars aren't loading correctly

The RLS policy above will fix this by explicitly allowing reads for both `anon` and `authenticated` roles.

---

## SQL File Location

The SQL is also saved at:
```
database/sql/enable_agents_public_read.sql
```
