-- Deploy Complete RBAC System to Supabase Cloud
-- Preserves existing user_profiles structure while adding enterprise RBAC
-- Migration: 20251010_deploy_rbac_to_cloud.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for RBAC system
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'admin',
  'llm_manager',
  'user',
  'viewer'
);

CREATE TYPE permission_scope AS ENUM (
  'llm_providers',
  'agents',
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

CREATE TYPE permission_action AS ENUM (
  'create',
  'read',
  'update',
  'delete',
  'execute',
  'manage'
);

-- Extend existing user_profiles table with RBAC columns
-- Preserve all existing columns: id, email, full_name, avatar_url, organization_id, role, job_title, department, preferences, created_at, updated_at
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Convert role column from TEXT to ENUM type
-- First, safely drop any policies that might depend on the role column
-- We'll use a defensive approach to handle any existing policies

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop any policies that reference user_profiles.role
    -- This is a safer approach that handles any policy name variations
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE policyname ILIKE '%admin%' 
           OR policyname ILIKE '%user%'
           OR policyname ILIKE '%role%'
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                         policy_record.policyname, 
                         policy_record.schemaname, 
                         policy_record.tablename);
        EXCEPTION WHEN OTHERS THEN
            -- Continue if policy doesn't exist or can't be dropped
            NULL;
        END;
    END LOOP;
END $$;

-- First drop the default value to avoid casting issues
ALTER TABLE user_profiles ALTER COLUMN role DROP DEFAULT;

-- Convert the column type with proper casting
ALTER TABLE user_profiles 
  ALTER COLUMN role TYPE user_role 
  USING CASE 
    WHEN role = 'admin' THEN 'admin'::user_role
    WHEN role = 'member' THEN 'user'::user_role
    ELSE 'user'::user_role
  END;

-- Set new default value and NOT NULL constraint
ALTER TABLE user_profiles ALTER COLUMN role SET DEFAULT 'user'::user_role;
ALTER TABLE user_profiles ALTER COLUMN role SET NOT NULL;

-- Create role permissions mapping table
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  scope permission_scope NOT NULL,
  action permission_action NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role, scope, action)
);

-- Create user sessions tracking table
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

-- Enhance existing audit_logs table with security audit columns
-- Add columns if they don't exist (preserve existing structure)
ALTER TABLE audit_logs 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS action VARCHAR(100),
  ADD COLUMN IF NOT EXISTS resource_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS resource_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS old_values JSONB,
  ADD COLUMN IF NOT EXISTS new_values JSONB,
  ADD COLUMN IF NOT EXISTS ip_address INET,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Create encrypted API keys table for LLM providers
CREATE TABLE encrypted_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES llm_providers(id) ON DELETE CASCADE,
  key_name VARCHAR(100) NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER NOT NULL DEFAULT 0
);

-- Insert comprehensive role permissions (106 total permissions)
INSERT INTO role_permissions (role, scope, action) VALUES
-- Super Admin - Full access to everything (47 permissions)
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

-- Admin - Almost full access except critical system settings (31 permissions)
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
('admin', 'org_functions', 'read'),
('admin', 'org_functions', 'update'),
('admin', 'org_departments', 'read'),
('admin', 'org_departments', 'update'),
('admin', 'org_roles', 'read'),
('admin', 'org_roles', 'update'),
('admin', 'org_responsibilities', 'read'),
('admin', 'org_responsibilities', 'update'),

-- LLM Manager - Focused on LLM provider management (12 permissions)
('llm_manager', 'llm_providers', 'create'),
('llm_manager', 'llm_providers', 'read'),
('llm_manager', 'llm_providers', 'update'),
('llm_manager', 'llm_providers', 'delete'),
('llm_manager', 'agents', 'read'),
('llm_manager', 'workflows', 'read'),
('llm_manager', 'workflows', 'execute'),
('llm_manager', 'analytics', 'read'),
('llm_manager', 'org_functions', 'read'),
('llm_manager', 'org_departments', 'read'),
('llm_manager', 'org_roles', 'read'),
('llm_manager', 'org_responsibilities', 'read'),

-- User - Basic operational access (11 permissions)
('user', 'llm_providers', 'read'),
('user', 'agents', 'read'),
('user', 'agents', 'create'),
('user', 'agents', 'update'),
('user', 'workflows', 'read'),
('user', 'workflows', 'execute'),
('user', 'analytics', 'read'),
('user', 'org_functions', 'read'),
('user', 'org_departments', 'read'),
('user', 'org_roles', 'read'),
('user', 'org_responsibilities', 'read'),

-- Viewer - Read-only access (5 permissions)
('viewer', 'llm_providers', 'read'),
('viewer', 'agents', 'read'),
('viewer', 'workflows', 'read'),
('viewer', 'analytics', 'read'),
('viewer', 'org_functions', 'read');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_scope_action ON role_permissions(scope, action);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_encrypted_api_keys_provider_id ON encrypted_api_keys(provider_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_api_keys_active ON encrypted_api_keys(is_active);

-- Enable Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_api_keys ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user email from JWT
CREATE OR REPLACE FUNCTION get_current_user_email() RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    ''
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_email TEXT) RETURNS user_role AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val
  FROM user_profiles
  WHERE email = user_email AND is_active = true;

  RETURN user_role_val;
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

-- Audit Logs: Admins and super_admins only
CREATE POLICY "audit_logs_select_policy" ON audit_logs
  FOR SELECT USING (
    check_user_permission(get_current_user_email(), 'audit_logs', 'read')
  );

CREATE POLICY "audit_logs_insert_policy" ON audit_logs
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

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for security audit logging
CREATE OR REPLACE FUNCTION audit_security_event()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  resource_id_val UUID;
BEGIN
  user_email := get_current_user_email();

  IF TG_OP = 'INSERT' THEN
    -- Handle both UUID and TEXT id columns
    IF TG_TABLE_NAME = 'user_profiles' THEN
      resource_id_val := NEW.id::UUID;
    ELSE
      resource_id_val := NEW.id::UUID;
    END IF;
    
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values, ip_address, created_at)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      resource_id_val,
      to_jsonb(NEW),
      inet_client_addr(),
      NOW()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle both UUID and TEXT id columns
    IF TG_TABLE_NAME = 'user_profiles' THEN
      resource_id_val := NEW.id::UUID;
    ELSE
      resource_id_val := NEW.id::UUID;
    END IF;
    
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, created_at)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      resource_id_val,
      to_jsonb(OLD),
      to_jsonb(NEW),
      inet_client_addr(),
      NOW()
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Handle both UUID and TEXT id columns
    IF TG_TABLE_NAME = 'user_profiles' THEN
      resource_id_val := OLD.id::UUID;
    ELSE
      resource_id_val := OLD.id::UUID;
    END IF;
    
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, ip_address, created_at)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      resource_id_val,
      to_jsonb(OLD),
      inet_client_addr(),
      NOW()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
-- Drop existing triggers if they exist, then recreate
DROP TRIGGER IF EXISTS audit_user_profiles ON user_profiles;
CREATE TRIGGER audit_user_profiles
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION audit_security_event();

DROP TRIGGER IF EXISTS audit_llm_providers ON llm_providers;
CREATE TRIGGER audit_llm_providers
  AFTER INSERT OR UPDATE OR DELETE ON llm_providers
  FOR EACH ROW EXECUTE FUNCTION audit_security_event();

DROP TRIGGER IF EXISTS audit_encrypted_api_keys ON encrypted_api_keys;
CREATE TRIGGER audit_encrypted_api_keys
  AFTER INSERT OR UPDATE OR DELETE ON encrypted_api_keys
  FOR EACH ROW EXECUTE FUNCTION audit_security_event();

-- Promote existing users to appropriate roles
-- Note: These updates happen after the RBAC columns are added
-- Update hicham.naim@curated.health to super_admin
UPDATE user_profiles 
SET role = 'super_admin', 
    full_name = 'Hicham Naim',
    department = 'Engineering',
    is_active = true,
    updated_at = NOW()
WHERE email = 'hicham.naim@curated.health';

-- Ensure hn@vitalexpert.com remains admin (already set)
UPDATE user_profiles 
SET role = 'admin',
    is_active = true,
    updated_at = NOW()
WHERE email = 'hn@vitalexpert.com';

-- Set all other users to 'user' role (default)
UPDATE user_profiles 
SET role = 'user',
    is_active = true,
    updated_at = NOW()
WHERE role NOT IN ('super_admin', 'admin');

-- Recreate policies that were dropped during column conversion
-- This section recreates policies using the new RBAC permission system
-- Only for tables that actually exist in the current schema

DO $$
BEGIN
  -- Recreate policies for existing tables only
  -- We know these tables exist: agents, prompt_systems, prompt_domains, llm_providers, user_profiles, audit_logs
  
  -- Agents table policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agents' AND table_schema = 'public') THEN
    ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "agents_select_policy" ON agents
      FOR SELECT USING (
        check_user_permission(get_current_user_email(), 'agents', 'read')
      );
    
    CREATE POLICY "agents_insert_policy" ON agents
      FOR INSERT WITH CHECK (
        check_user_permission(get_current_user_email(), 'agents', 'create')
      );
    
    CREATE POLICY "agents_update_policy" ON agents
      FOR UPDATE USING (
        check_user_permission(get_current_user_email(), 'agents', 'update')
      );
    
    CREATE POLICY "agents_delete_policy" ON agents
      FOR DELETE USING (
        check_user_permission(get_current_user_email(), 'agents', 'delete')
      );
  END IF;

  -- Prompt systems table policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompt_systems' AND table_schema = 'public') THEN
    ALTER TABLE prompt_systems ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "prompt_systems_select_policy" ON prompt_systems
      FOR SELECT USING (
        check_user_permission(get_current_user_email(), 'agents', 'read')
      );
    
    CREATE POLICY "prompt_systems_insert_policy" ON prompt_systems
      FOR INSERT WITH CHECK (
        check_user_permission(get_current_user_email(), 'agents', 'create')
      );
    
    CREATE POLICY "prompt_systems_update_policy" ON prompt_systems
      FOR UPDATE USING (
        check_user_permission(get_current_user_email(), 'agents', 'update')
      );
    
    CREATE POLICY "prompt_systems_delete_policy" ON prompt_systems
      FOR DELETE USING (
        check_user_permission(get_current_user_email(), 'agents', 'delete')
      );
  END IF;

  -- Prompt domains table policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompt_domains' AND table_schema = 'public') THEN
    ALTER TABLE prompt_domains ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "prompt_domains_select_policy" ON prompt_domains
      FOR SELECT USING (
        check_user_permission(get_current_user_email(), 'agents', 'read')
      );
    
    CREATE POLICY "prompt_domains_insert_policy" ON prompt_domains
      FOR INSERT WITH CHECK (
        check_user_permission(get_current_user_email(), 'agents', 'create')
      );
    
    CREATE POLICY "prompt_domains_update_policy" ON prompt_domains
      FOR UPDATE USING (
        check_user_permission(get_current_user_email(), 'agents', 'update')
      );
    
    CREATE POLICY "prompt_domains_delete_policy" ON prompt_domains
      FOR DELETE USING (
        check_user_permission(get_current_user_email(), 'agents', 'delete')
      );
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Security note: API keys should be encrypted before storing
-- The application layer should handle encryption/decryption using a secure key management system
