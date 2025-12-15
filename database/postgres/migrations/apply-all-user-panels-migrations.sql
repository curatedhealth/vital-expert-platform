-- ============================================================================
-- Apply All User Panels Migrations (Consolidated)
-- ============================================================================
-- This script applies all necessary migrations for the user_panels feature.
-- Run this in Supabase SQL Editor if automatic migration deployment fails.
--
-- Migrations included:
--   1. Ensure profiles table exists
--   2. Create user_panels table with RLS
--   3. Add workflow_definition column
--
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Ensure Profiles Table Exists
-- ============================================================================
-- From: 20251126000002_ensure_profiles_table.sql

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Service role can manage profiles'
  ) THEN
    CREATE POLICY "Service role can manage profiles"
      ON public.profiles
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- 2. Create User Panels Table
-- ============================================================================
-- From: 20251126000003_create_user_panels_table.sql

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create user_panels table
CREATE TABLE IF NOT EXISTS public.user_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID,
  organization_id UUID,

  -- Panel Identity
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,

  -- Template Reference (optional - can be based on a template or fully custom)
  base_panel_slug TEXT,
  is_template_based BOOLEAN DEFAULT false,

  -- Panel Configuration
  mode TEXT NOT NULL CHECK (mode IN ('sequential', 'collaborative', 'hybrid')),
  framework TEXT NOT NULL CHECK (framework IN ('langgraph', 'autogen', 'crewai')),

  -- Custom Agent Selection
  selected_agents TEXT[] NOT NULL DEFAULT '{}',
  suggested_agents TEXT[] DEFAULT '{}',

  -- Custom Settings
  custom_settings JSONB DEFAULT '{}',
  default_settings JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',
  icon TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Sharing & Visibility
  is_public BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT user_panels_name_not_empty CHECK (char_length(name) > 0),
  CONSTRAINT user_panels_has_agents CHECK (array_length(selected_agents, 1) > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_panels_user_id ON public.user_panels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_panels_tenant_id ON public.user_panels(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_panels_base_panel_slug ON public.user_panels(base_panel_slug) WHERE base_panel_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_panels_category ON public.user_panels(category);
CREATE INDEX IF NOT EXISTS idx_user_panels_favorite ON public.user_panels(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_user_panels_last_used ON public.user_panels(user_id, last_used_at DESC) WHERE last_used_at IS NOT NULL;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_user_panels_updated_at ON public.user_panels;
CREATE TRIGGER update_user_panels_updated_at
  BEFORE UPDATE ON public.user_panels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.user_panels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_panels' AND policyname = 'Users can read own panels'
  ) THEN
    CREATE POLICY "Users can read own panels"
      ON public.user_panels
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_panels' AND policyname = 'Users can read public panels'
  ) THEN
    CREATE POLICY "Users can read public panels"
      ON public.user_panels
      FOR SELECT
      TO authenticated
      USING (is_public = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_panels' AND policyname = 'Users can create own panels'
  ) THEN
    CREATE POLICY "Users can create own panels"
      ON public.user_panels
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_panels' AND policyname = 'Users can update own panels'
  ) THEN
    CREATE POLICY "Users can update own panels"
      ON public.user_panels
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_panels' AND policyname = 'Users can delete own panels'
  ) THEN
    CREATE POLICY "Users can delete own panels"
      ON public.user_panels
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_panels' AND policyname = 'Service role can manage user panels'
  ) THEN
    CREATE POLICY "Service role can manage user panels"
      ON public.user_panels
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- 3. Add workflow_definition Column
-- ============================================================================
-- From: 20251127000001_add_workflow_definition_to_user_panels.sql

-- Add workflow_definition column to user_panels
ALTER TABLE public.user_panels
ADD COLUMN IF NOT EXISTS workflow_definition JSONB DEFAULT '{}'::jsonb;

-- Add comment
COMMENT ON TABLE public.user_panels IS 'User-created custom panels based on templates or fully custom';
COMMENT ON COLUMN public.user_panels.base_panel_slug IS 'Reference to template panel this was based on (if any)';
COMMENT ON COLUMN public.user_panels.selected_agents IS 'User-selected agents for this panel (can be 2, 5, 10, etc.)';
COMMENT ON COLUMN public.user_panels.custom_settings IS 'User-customized settings overriding template defaults';
COMMENT ON COLUMN public.user_panels.workflow_definition IS 'Complete workflow definition including nodes, edges, and phases from the designer';

-- Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_user_panels_workflow_definition ON public.user_panels USING GIN (workflow_definition);

-- ============================================================================
-- Verification
-- ============================================================================

-- Show summary
DO $$
DECLARE
  panel_count INTEGER;
  has_workflow_col BOOLEAN;
BEGIN
  -- Check if workflow_definition column exists
  SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_panels'
    AND column_name = 'workflow_definition'
  ) INTO has_workflow_col;

  -- Count existing panels
  SELECT COUNT(*) INTO panel_count FROM public.user_panels;

  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Migration Summary';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Profiles table: %', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'profiles') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'User panels table: %', CASE WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_panels') THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'Workflow definition column: %', CASE WHEN has_workflow_col THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'Existing panels: %', panel_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ All migrations applied successfully!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
END $$;

COMMIT;
