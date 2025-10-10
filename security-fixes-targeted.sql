-- Targeted Security Fixes
-- This script applies security fixes based on the actual database schema

-- Step 1: Create helper functions for organization isolation
-- (These will work regardless of table structure)

CREATE OR REPLACE FUNCTION get_user_organization_id() RETURNS UUID AS $$
BEGIN
  -- Try to get organization_id from user_profiles first
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
    RETURN (
      SELECT organization_id
      FROM user_profiles
      WHERE user_id = auth.uid()
      AND is_active = true
      LIMIT 1
    );
  END IF;
  
  -- Fallback: return null if no organization found
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_organization_admin() RETURNS BOOLEAN AS $$
BEGIN
  -- Try to get role from user_profiles first
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
    RETURN (
      SELECT role IN ('admin', 'super_admin')
      FROM user_profiles
      WHERE user_id = auth.uid()
      AND is_active = true
      LIMIT 1
    );
  END IF;
  
  -- Fallback: return false if no role found
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 2: Enable RLS on tables that exist
-- Check and enable RLS on common tables

DO $$
DECLARE
    table_name text;
    tables_to_check text[] := ARRAY[
        'user_profiles', 'profiles', 'users', 'agents', 'workflows', 
        'knowledge_documents', 'audit_logs', 'organizations', 'projects',
        'documents', 'workflow_executions', 'citations', 'milestones', 
        'invitations', 'usage_metrics', 'notifications'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name AND table_schema = 'public') THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
            RAISE NOTICE 'Enabled RLS on table: %', table_name;
        END IF;
    END LOOP;
END $$;

-- Step 3: Create basic RLS policies for tables that exist and have organization_id column
-- This will only create policies for tables that actually exist and have the right structure

DO $$
DECLARE
    table_name text;
    tables_to_check text[] := ARRAY[
        'user_profiles', 'profiles', 'users', 'agents', 'workflows', 
        'knowledge_documents', 'audit_logs', 'organizations', 'projects',
        'documents', 'workflow_executions', 'citations', 'milestones', 
        'invitations', 'usage_metrics', 'notifications'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        -- Check if table exists and has organization_id column
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables t
            JOIN information_schema.columns c ON t.table_name = c.table_name
            WHERE t.table_name = table_name 
            AND t.table_schema = 'public'
            AND c.column_name = 'organization_id'
        ) THEN
            -- Drop existing policy if it exists
            EXECUTE format('DROP POLICY IF EXISTS "org_isolation_%s" ON %I', table_name, table_name);
            
            -- Create new organization isolation policy
            EXECUTE format('
                CREATE POLICY "org_isolation_%s" ON %I
                FOR ALL USING (
                    organization_id = get_user_organization_id() OR
                    is_organization_admin()
                )', table_name, table_name);
            
            RAISE NOTICE 'Created RLS policy for table: %', table_name;
        END IF;
    END LOOP;
END $$;

-- Step 4: Create indexes for performance (only for tables that exist and have organization_id)
DO $$
DECLARE
    table_name text;
    tables_to_check text[] := ARRAY[
        'user_profiles', 'profiles', 'users', 'agents', 'workflows', 
        'knowledge_documents', 'audit_logs', 'organizations', 'projects',
        'documents', 'workflow_executions', 'citations', 'milestones', 
        'invitations', 'usage_metrics', 'notifications'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        -- Check if table exists and has organization_id column
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables t
            JOIN information_schema.columns c ON t.table_name = c.table_name
            WHERE t.table_name = table_name 
            AND t.table_schema = 'public'
            AND c.column_name = 'organization_id'
        ) THEN
            -- Create index for organization_id
            EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_org ON %I(organization_id)', table_name, table_name);
            RAISE NOTICE 'Created index for table: %', table_name;
        END IF;
    END LOOP;
END $$;

-- Step 5: Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_organization_admin() TO authenticated;

-- Step 6: Show summary of what was applied
SELECT 
    'RLS Status' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;
