-- Add organizational permissions to RBAC system

-- Add new permission scopes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'capabilities' AND enumtypid = 'permission_scope'::regtype) THEN
        ALTER TYPE permission_scope ADD VALUE 'capabilities';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'org_functions' AND enumtypid = 'permission_scope'::regtype) THEN
        ALTER TYPE permission_scope ADD VALUE 'org_functions';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'org_departments' AND enumtypid = 'permission_scope'::regtype) THEN
        ALTER TYPE permission_scope ADD VALUE 'org_departments';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'org_roles' AND enumtypid = 'permission_scope'::regtype) THEN
        ALTER TYPE permission_scope ADD VALUE 'org_roles';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'org_responsibilities' AND enumtypid = 'permission_scope'::regtype) THEN
        ALTER TYPE permission_scope ADD VALUE 'org_responsibilities';
    END IF;
END$$;

-- Insert permissions for organizational entities
INSERT INTO role_permissions (role, scope, action) VALUES
-- Super Admin - Organizational entities
('super_admin', 'capabilities', 'create'),
('super_admin', 'capabilities', 'read'),
('super_admin', 'capabilities', 'update'),
('super_admin', 'capabilities', 'delete'),
('super_admin', 'capabilities', 'manage'),
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

-- Admin
('admin', 'capabilities', 'create'),
('admin', 'capabilities', 'read'),
('admin', 'capabilities', 'update'),
('admin', 'capabilities', 'delete'),
('admin', 'org_functions', 'read'),
('admin', 'org_functions', 'update'),
('admin', 'org_departments', 'read'),
('admin', 'org_departments', 'update'),
('admin', 'org_roles', 'read'),
('admin', 'org_roles', 'update'),
('admin', 'org_responsibilities', 'read'),
('admin', 'org_responsibilities', 'update'),

-- LLM Manager
('llm_manager', 'capabilities', 'read'),
('llm_manager', 'org_functions', 'read'),
('llm_manager', 'org_departments', 'read'),
('llm_manager', 'org_roles', 'read'),

-- User
('user', 'capabilities', 'read'),
('user', 'org_functions', 'read'),
('user', 'org_departments', 'read'),
('user', 'org_roles', 'read'),

-- Viewer
('viewer', 'capabilities', 'read')
ON CONFLICT (role, scope, action) DO NOTHING;
