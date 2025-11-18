-- Drop existing policies that conflict with migrations
-- This allows migrations to re-create them safely

DO $$
DECLARE
    pol record;
BEGIN
    -- Drop all existing policies on profiles table
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;

    -- Drop all existing policies on other common tables
    FOR pol IN
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('organizations', 'llm_providers', 'chat_sessions', 'workflows')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
        RAISE NOTICE 'Dropped policy: % on %', pol.policyname, pol.tablename;
    END LOOP;

    RAISE NOTICE 'All conflicting policies dropped. Migrations can now proceed.';
END $$;
