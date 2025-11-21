# Platform Instability Fix Instructions

## Problem Diagnosed

From your screenshot, the console shows:
```
[TenantContext] Loading timeout reached, using Platform Tenant
```

This means the TenantContext is trying to query the database for user tenants/roles, but those queries are timing out after 5 seconds.

## Root Causes

1. **Database Connectivity Issues** - Supabase queries taking too long or failing
2. **Missing Database Tables/Policies** - The `user_tenants` table may not exist or have wrong RLS policies
3. **Network Issues** - Slow connection to remote Supabase

## Immediate Solution: Restart Your Dev Server

### Step 1: Kill Your Current Server

In the terminal where you manually started `npm run dev`, press:

```
Ctrl+C
```

Wait for it to stop completely.

### Step 2: Verify Port is Clear

```bash
lsof -ti:3000
```

If it returns a number, kill it:

```bash
lsof -ti:3000 | xargs kill -9
```

### Step 3: Clear Next.js Cache

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
rm -rf .next
```

### Step 4: Start Fresh Server

```bash
npm run dev
```

### Step 5: Test Stability

1. Go to http://localhost:3000
2. Sign in with: **hicham.naim@curated.health**
3. Go to http://localhost:3000/knowledge?tab=upload
4. Check if page loads without "Loading timeout" errors

---

## Long-Term Solution: Fix Database Schema

The instability is caused by missing or misconfigured `user_tenants` table. Let me check if this table exists and create it if needed.

### Check if user_tenants Table Exists

Go to Supabase SQL Editor: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql/new

Run this query:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_tenants', 'tenants', 'user_roles');
```

### Expected Result

You should see 3 tables:
- `tenants`
- `user_tenants`
- `user_roles`

### If user_tenants is Missing

If `user_tenants` doesn't exist, that's the problem! The TenantContext is trying to query a table that doesn't exist.

We need to either:

**Option A: Create the missing table**
```sql
CREATE TABLE IF NOT EXISTS public.user_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'member', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- Enable RLS
ALTER TABLE public.user_tenants ENABLE ROW LEVEL SECURITY;

-- Allow superadmins full access
CREATE POLICY "Superadmins have full access to user_tenants"
  ON public.user_tenants
  FOR ALL
  USING (public.is_superadmin());

-- Allow users to see their own tenants
CREATE POLICY "Users can view their own tenants"
  ON public.user_tenants
  FOR SELECT
  USING (auth.uid() = user_id);
```

**Option B: Simplify TenantContext to not require user_tenants**

Modify the code to skip the `user_tenants` query and just use superadmin status from `user_roles`.

---

## Alternative Quick Fix: Disable TenantContext Queries for Logged-In Users

If you want to bypass the database issues entirely, we can modify TenantContext to:

1. Check if user is logged in
2. If yes, immediately load Platform Tenant without any database queries
3. Skip all the `user_tenants` queries

This would make the app stable but you'd lose multi-tenant functionality (which you're not using anyway since you're just testing).

---

## Current Status

**What's Happening:**
- You're logged in successfully ✅
- TenantContext is timing out trying to load your tenant assignments ⏱️
- App falls back to Platform Tenant but with delays/instability ⚠️

**What You Need:**
- Either fix the database schema (add `user_tenants` table)
- Or simplify TenantContext to skip those queries for superadmins

**Quick Test:**
1. Restart dev server (clear .next cache)
2. If still unstable, check if `user_tenants` table exists
3. If missing, create it with SQL above

---

## Next Steps

Please do ONE of the following:

### Option 1: Restart Server (Try This First)
```bash
# In your terminal
Ctrl+C  # Stop current server
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
rm -rf .next
npm run dev
```

### Option 2: Check Database Tables
Go to Supabase and run the SQL query above to see which tables exist.

### Option 3: Tell Me What Tables Exist
Copy the result of the SQL query and paste it here, and I'll create the missing tables for you.

---

## Why This Happened

The TenantContext was designed for multi-tenant apps where users can belong to multiple tenants. It queries the `user_tenants` table to find out which tenants you have access to.

However, this table may not have been created in your Supabase instance, causing the queries to fail/timeout, resulting in the instability you're seeing.

---

**TL;DR:** Restart your dev server with cache cleared. If still unstable, check if `user_tenants` table exists in Supabase.
