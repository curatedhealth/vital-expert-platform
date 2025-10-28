# 🔐 Superadmin Setup Guide

This guide will give you **superadmin access** to bypass all RLS restrictions and access all knowledge domains.

---

## Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql/new
2. You'll see a SQL editor

### Step 2: Run This SQL

Copy and paste this entire SQL block into the SQL editor:

```sql
-- ============================================================================
-- SUPERADMIN SETUP - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================================================

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'superadmin')),
  tenant_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- 2. Create unique constraint (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_roles_user_id_tenant_id_key'
  ) THEN
    ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_user_id_tenant_id_key
    UNIQUE (user_id, tenant_id);
  END IF;
END $$;

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 4. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Create helper function
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6. Grant superadmin to first user (YOU!)
DO $$
DECLARE
  v_user_id UUID;
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Get the first user (you!)
  SELECT id INTO v_user_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Assign superadmin role
    INSERT INTO public.user_roles (user_id, role, tenant_id)
    VALUES (v_user_id, 'superadmin', v_platform_tenant_id)
    ON CONFLICT (user_id, tenant_id)
    DO UPDATE SET role = 'superadmin';

    RAISE NOTICE 'Granted superadmin to user: %', v_user_id;
  END IF;
END $$;

-- 7. Update RLS policies for knowledge_domains
DROP POLICY IF EXISTS "Allow public read access to knowledge_domains" ON public.knowledge_domains;
DROP POLICY IF EXISTS "Superadmins have full access to knowledge_domains" ON public.knowledge_domains;

CREATE POLICY "Allow public read access to knowledge_domains"
  ON public.knowledge_domains
  FOR SELECT
  USING (true OR public.is_superadmin());

CREATE POLICY "Superadmins have full access to knowledge_domains"
  ON public.knowledge_domains
  FOR ALL
  USING (public.is_superadmin());

-- 8. Update other key tables
DO $$
BEGIN
  -- Agents
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'agents') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Superadmins full access" ON public.agents';
    EXECUTE 'CREATE POLICY "Superadmins full access" ON public.agents FOR ALL USING (public.is_superadmin())';
  END IF;

  -- Tenants
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tenants') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Superadmins full access" ON public.tenants';
    EXECUTE 'CREATE POLICY "Superadmins full access" ON public.tenants FOR ALL USING (public.is_superadmin())';
  END IF;

  -- Knowledge documents
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'knowledge_documents') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Superadmins full access" ON public.knowledge_documents';
    EXECUTE 'CREATE POLICY "Superadmins full access" ON public.knowledge_documents FOR ALL USING (public.is_superadmin())';
  END IF;

  -- RAG feedback
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'rag_user_feedback') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Superadmins full access" ON public.rag_user_feedback';
    EXECUTE 'CREATE POLICY "Superadmins full access" ON public.rag_user_feedback FOR ALL USING (public.is_superadmin())';
  END IF;
END $$;

-- 9. Verify setup
SELECT
  u.email,
  ur.role,
  ur.tenant_id,
  ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'superadmin';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ SUPERADMIN SETUP COMPLETE!';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE 'You now have full access to all tables and data';
  RAISE NOTICE 'Refresh your browser to see the changes';
END $$;
```

### Step 3: Click "RUN" button

The SQL will execute and you'll see:
- ✅ SUPERADMIN SETUP COMPLETE!
- Your email address with role 'superadmin'

### Step 4: Refresh Your Browser

1. Go back to your app: http://localhost:3000/knowledge?tab=upload
2. **Hard refresh**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)
3. Click "Knowledge Domain" dropdown
4. You should now see all 54 knowledge domains!

---

## What This Does

1. **Creates `user_roles` table** - Stores user role assignments
2. **Creates `is_superadmin()` function** - Checks if current user is superadmin
3. **Grants you superadmin** - Assigns superadmin role to the first user (you!)
4. **Updates RLS policies** - Allows superadmin to bypass all restrictions
5. **Applies to key tables**:
   - `knowledge_domains` - All 54 domains accessible
   - `agents` - All agents accessible
   - `tenants` - All tenants accessible
   - `knowledge_documents` - All documents accessible
   - `rag_user_feedback` - All feedback accessible

---

## Verification

After running the SQL, verify your superadmin status:

```sql
-- Check your role
SELECT
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.id = auth.uid();

-- Test the function
SELECT public.is_superadmin();
-- Should return: true

-- Check knowledge domains access
SELECT COUNT(*) FROM knowledge_domains;
-- Should return: 54
```

---

## Troubleshooting

### Issue: "No users found"

**Solution**: Make sure you're logged in to your app first:
1. Go to http://localhost:3000
2. Log in with your Supabase account
3. Then run the SQL again

### Issue: Still can't see domains

**Solution**: Clear your browser cache completely:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use incognito/private mode

### Issue: SQL errors

**Solution**: Run each section separately:
1. First run: Steps 1-4 (create table and function)
2. Then run: Step 5 (grant superadmin)
3. Finally run: Steps 6-7 (update policies)

---

## Security Note

⚠️ **Superadmin has FULL access to everything!**

- Use only in development
- For production, create more granular roles
- Consider revoking superadmin after testing:

```sql
DELETE FROM public.user_roles
WHERE role = 'superadmin'
AND user_id = auth.uid();
```

---

## Alternative: Manual Role Assignment

If you know your user ID, you can manually assign superadmin:

```sql
-- Replace YOUR_USER_ID with your actual UUID
INSERT INTO public.user_roles (user_id, role, tenant_id)
VALUES (
  'YOUR_USER_ID',  -- Replace this!
  'superadmin',
  '00000000-0000-0000-0000-000000000001'  -- Platform tenant
)
ON CONFLICT (user_id, tenant_id)
DO UPDATE SET role = 'superadmin';
```

To find your user ID:
```sql
SELECT id, email FROM auth.users ORDER BY created_at LIMIT 5;
```

---

## Next Steps

After superadmin is set up:

1. ✅ You can access all 54 knowledge domains
2. ✅ Upload files to any domain
3. ✅ View all feedback analytics
4. ✅ Manage all agents and tenants
5. ✅ No more RLS restrictions!

---

**Need Help?**

If you encounter any issues, let me know and I'll help troubleshoot!
