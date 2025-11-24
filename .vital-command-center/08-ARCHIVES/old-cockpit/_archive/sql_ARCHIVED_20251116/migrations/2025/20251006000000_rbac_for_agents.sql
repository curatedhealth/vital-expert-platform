-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'super_admin', 'admin', 'user'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Add comment
COMMENT ON TABLE user_profiles IS 'User profiles with RBAC roles for agent management';
COMMENT ON COLUMN user_profiles.role IS 'User role: super_admin (full access), admin (manage own org agents), user (copy and create only)';

-- Update agents table to ensure proper fields
ALTER TABLE agents
  ALTER COLUMN is_custom SET DEFAULT true,
  ALTER COLUMN created_by DROP NOT NULL;

-- Add is_library_agent column to distinguish official library agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_library_agent BOOLEAN DEFAULT false;

-- Update existing agents without created_by to be library agents
UPDATE agents SET is_library_agent = true, is_custom = false WHERE created_by IS NULL;

-- Create RLS policies for agent access control

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all agents" ON agents;
DROP POLICY IF EXISTS "Users can insert own agents" ON agents;
DROP POLICY IF EXISTS "Users can update own agents" ON agents;
DROP POLICY IF EXISTS "Users can delete own agents" ON agents;
DROP POLICY IF EXISTS "Super admins can do everything" ON agents;

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can view all agents (library + their own)
CREATE POLICY "Users can view all agents"
  ON agents FOR SELECT
  USING (true);

-- 2. Users can only insert their own custom agents
CREATE POLICY "Users can insert own agents"
  ON agents FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND is_custom = true
    AND is_library_agent = false
  );

-- 3. Super admins can update any agent
CREATE POLICY "Super admins can update any agent"
  ON agents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- 4. Regular users can only update their own custom agents
CREATE POLICY "Users can update own agents"
  ON agents FOR UPDATE
  USING (
    auth.uid() = created_by
    AND is_custom = true
    AND is_library_agent = false
  );

-- 5. Super admins can delete any agent
CREATE POLICY "Super admins can delete any agent"
  ON agents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- 6. Regular users can only delete their own custom agents
CREATE POLICY "Users can delete own agents"
  ON agents FOR DELETE
  USING (
    auth.uid() = created_by
    AND is_custom = true
    AND is_library_agent = false
  );

-- Create helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user can edit agent
CREATE OR REPLACE FUNCTION can_edit_agent(agent_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  agent_record RECORD;
BEGIN
  SELECT * INTO agent_record FROM agents WHERE id = agent_id;

  -- Super admin can edit anything
  IF is_super_admin() THEN
    RETURN true;
  END IF;

  -- User can edit their own custom agents
  IF agent_record.created_by = auth.uid() AND agent_record.is_custom = true THEN
    RETURN true;
  END IF;

  -- Cannot edit library agents
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert a default super admin will be done after first user signs up
-- Uncomment and update this after you have a real user ID:
-- INSERT INTO user_profiles (user_id, email, full_name, role)
-- VALUES (
--   'YOUR-USER-ID-HERE',
--   'admin@vital.com',
--   'Super Admin',
--   'super_admin'
-- ) ON CONFLICT (user_id) DO NOTHING;

COMMENT ON FUNCTION is_super_admin IS 'Check if current user has super_admin role';
COMMENT ON FUNCTION can_edit_agent IS 'Check if current user can edit a specific agent';
