-- ============================================================================
-- Ensure Profiles Table Exists
-- ============================================================================
-- This migration ensures the profiles table exists for user management
-- If it already exists, this will be a no-op

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  organization TEXT,
  organization_id UUID,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id) WHERE organization_id IS NOT NULL;

-- Add updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
CREATE POLICY "Service role can manage profiles"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users';

