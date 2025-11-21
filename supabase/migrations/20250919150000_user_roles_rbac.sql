-- User Roles and RBAC Migration
-- Implements comprehensive role-based access control for LLM management system
-- Provides security layers to prevent unauthorized access and bridges

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'admin',
  'llm_manager',
  'user',
  'viewer'
);

-- Permission scopes enum
CREATE TYPE permission_scope AS ENUM (
  'llm_providers',
  'agents',
  'workflows',
  'analytics',
  'system_settings',
  'user_management',
  'audit_logs'
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  role user_role NOT NULL DEFAULT 'user',
  department VARCHAR(100),
  organization VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Role permissions mapping table
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  scope permission_scope NOT NULL,
  action permission_action NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role, scope, action)
);

-- User session tracking for security
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Security audit log table
CREATE TABLE security_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- API key management for LLM providers (encrypted storage)
CREATE TABLE encrypted_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES llm_providers(id) ON DELETE CASCADE,
  key_name VARCHAR(100) NOT NULL,
  encrypted_key TEXT NOT NULL, -- Will store encrypted API keys
  key_hash VARCHAR(255) NOT NULL, -- For verification without decryption
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER NOT NULL DEFAULT 0
);

-- Insert default role permissions
INSERT INTO role_permissions (role, scope, action) VALUES
-- Super Admin - Full access to everything
('super_admin', 'llm_providers', 'create'),
('super_admin', 'llm_providers', 'read'),
('super_admin', 'llm_providers', 'update'),
('super_admin', 'llm_providers', 'delete'),
('super_admin', 'llm_providers', 'manage'),
('super_admin', 'agents', 'create'),
('super_admin', 'agents', 'read'),
('super_admin', 'agents', 'update'),
('super_admin', 'agents', 'delete'),
('super_admin', 'agents', 'manage'),
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

-- Admin - Almost full access except user management
('admin', 'llm_providers', 'create'),
('admin', 'llm_providers', 'read'),
('admin', 'llm_providers', 'update'),
('admin', 'llm_providers', 'delete'),
('admin', 'llm_providers', 'manage'),
('admin', 'agents', 'create'),
('admin', 'agents', 'read'),
('admin', 'agents', 'update'),
('admin', 'agents', 'delete'),
('admin', 'agents', 'manage'),
('admin', 'workflows', 'create'),
('admin', 'workflows', 'read'),
('admin', 'workflows', 'update'),
('admin', 'workflows', 'delete'),
('admin', 'workflows', 'execute'),
('admin', 'analytics', 'read'),
('admin', 'system_settings', 'read'),
('admin', 'system_settings', 'update'),
('admin', 'audit_logs', 'read'),

-- LLM Manager - Focused on LLM provider management
('llm_manager', 'llm_providers', 'create'),
('llm_manager', 'llm_providers', 'read'),
('llm_manager', 'llm_providers', 'update'),
('llm_manager', 'llm_providers', 'delete'),
('llm_manager', 'agents', 'read'),
('llm_manager', 'workflows', 'read'),
('llm_manager', 'workflows', 'execute'),
('llm_manager', 'analytics', 'read'),

-- User - Basic operational access
('user', 'llm_providers', 'read'),
('user', 'agents', 'read'),
('user', 'agents', 'create'),
('user', 'agents', 'update'),
('user', 'workflows', 'read'),
('user', 'workflows', 'execute'),
('user', 'analytics', 'read'),

-- Viewer - Read-only access
('viewer', 'llm_providers', 'read'),
('viewer', 'agents', 'read'),
('viewer', 'workflows', 'read'),
('viewer', 'analytics', 'read');

-- Create the super admin user profile for Hicham Naim
INSERT INTO user_profiles (user_id, email, full_name, role, department, organization, is_active, created_at)
SELECT
  id,
  'hicham.naim@curated.health',
  'Hicham Naim',
  'super_admin',
  'Engineering',
  'Curated Health',
  true,
  NOW()
FROM auth.users
WHERE email = 'hicham.naim@curated.health'
ON CONFLICT (email) DO UPDATE SET
  role = 'super_admin',
  full_name = 'Hicham Naim',
  department = 'Engineering',
  organization = 'Curated Health',
  is_active = true,
  updated_at = NOW();

-- If user doesn't exist in auth.users, we'll handle this in the application layer

-- Create indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_role_permissions_scope_action ON role_permissions(scope, action);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_security_audit_user_id ON security_audit_log(user_id);
CREATE INDEX idx_security_audit_created_at ON security_audit_log(created_at);
CREATE INDEX idx_security_audit_action ON security_audit_log(action);
CREATE INDEX idx_encrypted_api_keys_provider_id ON encrypted_api_keys(provider_id);
CREATE INDEX idx_encrypted_api_keys_active ON encrypted_api_keys(is_active);

-- Enable Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_api_keys ENABLE ROW LEVEL SECURITY;

-- Helper function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
  user_email TEXT,
  required_scope permission_scope,
  required_action permission_action
) RETURNS BOOLEAN AS $$
DECLARE
  user_role_val user_role;
BEGIN
  -- Get user role
  SELECT role INTO user_role_val
  FROM user_profiles
  WHERE email = user_email AND is_active = true;

  -- If user not found, deny access
  IF user_role_val IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user has the required permission
  RETURN EXISTS (
    SELECT 1
    FROM role_permissions
    WHERE role = user_role_val
    AND scope = required_scope
    AND action = required_action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user email
CREATE OR REPLACE FUNCTION get_current_user_email() RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    ''
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin or super admin
CREATE OR REPLACE FUNCTION is_admin_user(user_email TEXT) RETURNS BOOLEAN AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val
  FROM user_profiles
  WHERE email = user_email AND is_active = true;

  RETURN user_role_val IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies

-- User Profiles: Users can see their own profile, admins can see all
CREATE POLICY "user_profiles_select_policy" ON user_profiles
  FOR SELECT USING (
    email = get_current_user_email() OR
    is_admin_user(get_current_user_email())
  );

CREATE POLICY "user_profiles_insert_policy" ON user_profiles
  FOR INSERT WITH CHECK (
    check_user_permission(get_current_user_email(), 'user_management', 'create')
  );

CREATE POLICY "user_profiles_update_policy" ON user_profiles
  FOR UPDATE USING (
    email = get_current_user_email() OR
    check_user_permission(get_current_user_email(), 'user_management', 'update')
  );

CREATE POLICY "user_profiles_delete_policy" ON user_profiles
  FOR DELETE USING (
    check_user_permission(get_current_user_email(), 'user_management', 'delete')
  );

-- Role Permissions: Read-only for all authenticated users
CREATE POLICY "role_permissions_select_policy" ON role_permissions
  FOR SELECT USING (true);

-- User Sessions: Users can see their own sessions, admins can see all
CREATE POLICY "user_sessions_select_policy" ON user_sessions
  FOR SELECT USING (
    user_id = auth.uid() OR
    is_admin_user(get_current_user_email())
  );

CREATE POLICY "user_sessions_insert_policy" ON user_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_sessions_update_policy" ON user_sessions
  FOR UPDATE USING (
    user_id = auth.uid() OR
    is_admin_user(get_current_user_email())
  );

-- Security Audit Log: Admins only
CREATE POLICY "security_audit_select_policy" ON security_audit_log
  FOR SELECT USING (
    check_user_permission(get_current_user_email(), 'audit_logs', 'read')
  );

CREATE POLICY "security_audit_insert_policy" ON security_audit_log
  FOR INSERT WITH CHECK (true); -- Allow system to insert audit logs

-- Encrypted API Keys: LLM managers and admins only
CREATE POLICY "encrypted_api_keys_select_policy" ON encrypted_api_keys
  FOR SELECT USING (
    check_user_permission(get_current_user_email(), 'llm_providers', 'read')
  );

CREATE POLICY "encrypted_api_keys_insert_policy" ON encrypted_api_keys
  FOR INSERT WITH CHECK (
    check_user_permission(get_current_user_email(), 'llm_providers', 'create')
  );

CREATE POLICY "encrypted_api_keys_update_policy" ON encrypted_api_keys
  FOR UPDATE USING (
    check_user_permission(get_current_user_email(), 'llm_providers', 'update')
  );

CREATE POLICY "encrypted_api_keys_delete_policy" ON encrypted_api_keys
  FOR DELETE USING (
    check_user_permission(get_current_user_email(), 'llm_providers', 'delete')
  );

-- Update existing LLM providers table RLS policies
DROP POLICY IF EXISTS "llm_providers_select_policy" ON llm_providers;
DROP POLICY IF EXISTS "llm_providers_insert_policy" ON llm_providers;
DROP POLICY IF EXISTS "llm_providers_update_policy" ON llm_providers;
DROP POLICY IF EXISTS "llm_providers_delete_policy" ON llm_providers;

CREATE POLICY "llm_providers_select_policy" ON llm_providers
  FOR SELECT USING (
    check_user_permission(get_current_user_email(), 'llm_providers', 'read')
  );

CREATE POLICY "llm_providers_insert_policy" ON llm_providers
  FOR INSERT WITH CHECK (
    check_user_permission(get_current_user_email(), 'llm_providers', 'create')
  );

CREATE POLICY "llm_providers_update_policy" ON llm_providers
  FOR UPDATE USING (
    check_user_permission(get_current_user_email(), 'llm_providers', 'update')
  );

CREATE POLICY "llm_providers_delete_policy" ON llm_providers
  FOR DELETE USING (
    check_user_permission(get_current_user_email(), 'llm_providers', 'delete')
  );

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

-- Create trigger for security audit logging
CREATE OR REPLACE FUNCTION audit_security_event()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  user_email := get_current_user_email();

  IF TG_OP = 'INSERT' THEN
    INSERT INTO security_audit_log (user_id, action, resource_type, resource_id, new_values, ip_address)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(NEW),
      inet_client_addr()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO security_audit_log (user_id, action, resource_type, resource_id, old_values, new_values, ip_address)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(OLD),
      to_jsonb(NEW),
      inet_client_addr()
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO security_audit_log (user_id, action, resource_type, resource_id, old_values, ip_address)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      OLD.id::TEXT,
      to_jsonb(OLD),
      inet_client_addr()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_user_profiles
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION audit_security_event();

CREATE TRIGGER audit_llm_providers
  AFTER INSERT OR UPDATE OR DELETE ON llm_providers
  FOR EACH ROW EXECUTE FUNCTION audit_security_event();

CREATE TRIGGER audit_encrypted_api_keys
  AFTER INSERT OR UPDATE OR DELETE ON encrypted_api_keys
  FOR EACH ROW EXECUTE FUNCTION audit_security_event();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Security note: API keys should be encrypted before storing
-- The application layer should handle encryption/decryption using a secure key management system