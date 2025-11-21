-- Standalone RBAC and Authentication System
-- Works without Supabase - uses standard PostgreSQL

-- Create auth schema for user management
CREATE SCHEMA IF NOT EXISTS auth;

-- Users table (replaces Supabase auth.users)
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  encrypted_password TEXT,
  email_confirmed BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ
);

-- User roles enum
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'admin',
  'manager',
  'user',
  'viewer'
);

-- Permission scopes enum
CREATE TYPE permission_scope AS ENUM (
  'agents',
  'capabilities',
  'workflows',
  'analytics',
  'system_settings',
  'user_management',
  'audit_logs',
  'org_functions',
  'org_departments',
  'org_roles',
  'org_responsibilities'
);

-- Permission actions enum
CREATE TYPE permission_action AS ENUM (
  'create',
  'read',
  'update',
  'delete',
  'execute',
  'manage'
);

-- User profiles table with role assignments
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  role user_role NOT NULL DEFAULT 'user',
  department VARCHAR(100),
  organization VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Role permissions mapping table
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  scope permission_scope NOT NULL,
  action permission_action NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role, scope, action)
);

-- Security audit log table
CREATE TABLE security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default role permissions
INSERT INTO role_permissions (role, scope, action) VALUES
-- Super Admin - Full access to everything
('super_admin', 'agents', 'create'),
('super_admin', 'agents', 'read'),
('super_admin', 'agents', 'update'),
('super_admin', 'agents', 'delete'),
('super_admin', 'agents', 'manage'),
('super_admin', 'capabilities', 'create'),
('super_admin', 'capabilities', 'read'),
('super_admin', 'capabilities', 'update'),
('super_admin', 'capabilities', 'delete'),
('super_admin', 'capabilities', 'manage'),
('super_admin', 'workflows', 'create'),
('super_admin', 'workflows', 'read'),
('super_admin', 'workflows', 'update'),
('super_admin', 'workflows', 'delete'),
('super_admin', 'workflows', 'execute'),
('super_admin', 'analytics', 'read'),
('super_admin', 'analytics', 'manage'),
('super_admin', 'system_settings', 'read'),
('super_admin', 'system_settings', 'update'),
('super_admin', 'system_settings', 'manage'),
('super_admin', 'user_management', 'create'),
('super_admin', 'user_management', 'read'),
('super_admin', 'user_management', 'update'),
('super_admin', 'user_management', 'delete'),
('super_admin', 'user_management', 'manage'),
('super_admin', 'audit_logs', 'read'),
('super_admin', 'org_functions', 'create'),
('super_admin', 'org_functions', 'read'),
('super_admin', 'org_functions', 'update'),
('super_admin', 'org_functions', 'delete'),
('super_admin', 'org_departments', 'create'),
('super_admin', 'org_departments', 'read'),
('super_admin', 'org_departments', 'update'),
('super_admin', 'org_departments', 'delete'),
('super_admin', 'org_roles', 'create'),
('super_admin', 'org_roles', 'read'),
('super_admin', 'org_roles', 'update'),
('super_admin', 'org_roles', 'delete'),
('super_admin', 'org_responsibilities', 'create'),
('super_admin', 'org_responsibilities', 'read'),
('super_admin', 'org_responsibilities', 'update'),
('super_admin', 'org_responsibilities', 'delete'),

-- Admin - Almost full access except critical system settings
('admin', 'agents', 'create'),
('admin', 'agents', 'read'),
('admin', 'agents', 'update'),
('admin', 'agents', 'delete'),
('admin', 'capabilities', 'create'),
('admin', 'capabilities', 'read'),
('admin', 'capabilities', 'update'),
('admin', 'capabilities', 'delete'),
('admin', 'workflows', 'create'),
('admin', 'workflows', 'read'),
('admin', 'workflows', 'update'),
('admin', 'workflows', 'delete'),
('admin', 'workflows', 'execute'),
('admin', 'analytics', 'read'),
('admin', 'system_settings', 'read'),
('admin', 'system_settings', 'update'),
('admin', 'audit_logs', 'read'),
('admin', 'org_functions', 'read'),
('admin', 'org_functions', 'update'),
('admin', 'org_departments', 'read'),
('admin', 'org_departments', 'update'),
('admin', 'org_roles', 'read'),
('admin', 'org_roles', 'update'),
('admin', 'org_responsibilities', 'read'),
('admin', 'org_responsibilities', 'update'),

-- Manager - Can manage agents and workflows
('manager', 'agents', 'create'),
('manager', 'agents', 'read'),
('manager', 'agents', 'update'),
('manager', 'agents', 'delete'),
('manager', 'capabilities', 'read'),
('manager', 'workflows', 'create'),
('manager', 'workflows', 'read'),
('manager', 'workflows', 'update'),
('manager', 'workflows', 'execute'),
('manager', 'analytics', 'read'),
('manager', 'org_functions', 'read'),
('manager', 'org_departments', 'read'),
('manager', 'org_roles', 'read'),
('manager', 'org_responsibilities', 'read'),

-- User - Basic operational access
('user', 'agents', 'read'),
('user', 'capabilities', 'read'),
('user', 'workflows', 'read'),
('user', 'workflows', 'execute'),
('user', 'analytics', 'read'),
('user', 'org_functions', 'read'),
('user', 'org_departments', 'read'),
('user', 'org_roles', 'read'),

-- Viewer - Read-only access
('viewer', 'agents', 'read'),
('viewer', 'capabilities', 'read'),
('viewer', 'workflows', 'read'),
('viewer', 'analytics', 'read');

-- Create super admin user
INSERT INTO auth.users (email, email_confirmed, is_active)
VALUES ('hicham.naim@curated.health', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Create super admin profile
INSERT INTO user_profiles (user_id, email, full_name, role, department, organization, is_active)
SELECT
  id,
  'hicham.naim@curated.health',
  'Hicham Naim',
  'super_admin',
  'Engineering',
  'Curated Health',
  TRUE
FROM auth.users
WHERE email = 'hicham.naim@curated.health'
ON CONFLICT (email) DO UPDATE SET
  role = 'super_admin',
  full_name = 'Hicham Naim',
  department = 'Engineering',
  organization = 'Curated Health',
  is_active = TRUE,
  updated_at = NOW();

-- Create indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_role_permissions_scope_action ON role_permissions(scope, action);
CREATE INDEX idx_security_audit_user_id ON security_audit_log(user_id);
CREATE INDEX idx_security_audit_created_at ON security_audit_log(created_at);
CREATE INDEX idx_security_audit_action ON security_audit_log(action);
CREATE INDEX idx_auth_users_email ON auth.users(email);

-- Helper function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
  user_email TEXT,
  required_scope permission_scope,
  required_action permission_action
) RETURNS BOOLEAN AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val
  FROM user_profiles
  WHERE email = user_email AND is_active = TRUE;

  IF user_role_val IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM role_permissions
    WHERE role = user_role_val
    AND scope = required_scope
    AND action = required_action
  );
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if user is admin or super admin
CREATE OR REPLACE FUNCTION is_admin_user(user_email TEXT) RETURNS BOOLEAN AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val
  FROM user_profiles
  WHERE email = user_email AND is_active = TRUE;

  RETURN user_role_val IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_email TEXT) RETURNS user_role AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val
  FROM user_profiles
  WHERE email = user_email AND is_active = TRUE;

  RETURN user_role_val;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auth_users_updated_at
  BEFORE UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO PUBLIC;
GRANT SELECT, INSERT, UPDATE ON auth.users TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO PUBLIC;
GRANT SELECT ON role_permissions TO PUBLIC;
GRANT INSERT ON security_audit_log TO PUBLIC;
