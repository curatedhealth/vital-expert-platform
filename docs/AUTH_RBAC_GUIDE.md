# VITAL Path - Authentication & Role-Based Access Control (RBAC) Guide

## Overview

The VITAL Path platform implements a comprehensive Role-Based Access Control (RBAC) system to manage user permissions across all platform features. This guide documents the complete auth system, roles, permissions, and implementation details.

## Table of Contents

1. [User Roles](#user-roles)
2. [Permission Scopes](#permission-scopes)
3. [Permission Matrix](#permission-matrix)
4. [Database Schema](#database-schema)
5. [Implementation](#implementation)
6. [Security Features](#security-features)

## User Roles

The platform supports 5 distinct user roles with hierarchical permissions:

### 1. Super Admin (`super_admin`)
- **Full system access** - Complete control over all platform features
- Can manage users, roles, and system settings
- Access to all audit logs and security features
- Primary contact: Hicham Naim (hicham.naim@curated.health)

### 2. Admin (`admin`)
- **Administrative access** - Can manage most platform features
- Cannot modify critical system settings
- Cannot create/delete super admins
- Can view audit logs
- Suitable for: Platform administrators, team leads

### 3. Manager (`manager`)
- **Operational management** - Can create and manage agents, workflows
- Cannot modify system settings or user permissions
- Cannot access sensitive audit logs
- Suitable for: Department managers, project leads

### 4. User (`user`)
- **Standard access** - Can use the platform features
- Read access to most resources
- Can execute workflows
- Can view analytics
- Suitable for: Regular platform users, analysts

### 5. Viewer (`viewer`)
- **Read-only access** - Can only view resources
- Cannot create, update, or delete anything
- Cannot execute workflows
- Suitable for: Stakeholders, observers, auditors

## Permission Scopes

The system defines 11 permission scopes covering all platform features:

1. **`agents`** - AI Agent management
2. **`capabilities`** - Agent capabilities registry
3. **`workflows`** - Workflow orchestration
4. **`analytics`** - Analytics and reporting
5. **`system_settings`** - Platform configuration
6. **`user_management`** - User and role management
7. **`audit_logs`** - Security audit logs
8. **`org_functions`** - Organizational functions
9. **`org_departments`** - Organizational departments
10. **`org_roles`** - Organizational roles
11. **`org_responsibilities`** - Role responsibilities
12. **`llm_providers`** - LLM provider configuration (legacy)

## Permission Actions

Each scope supports 6 permission actions:

- **`create`** - Create new resources
- **`read`** - View resources
- **`update`** - Modify existing resources
- **`delete`** - Remove resources
- **`execute`** - Execute workflows/operations
- **`manage`** - Full administrative control

## Permission Matrix

### Super Admin Permissions

| Scope | Create | Read | Update | Delete | Execute | Manage |
|-------|--------|------|--------|--------|---------|--------|
| Agents | ✅ | ✅ | ✅ | ✅ | - | ✅ |
| Capabilities | ✅ | ✅ | ✅ | ✅ | - | ✅ |
| Workflows | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Analytics | - | ✅ | - | - | - | ✅ |
| System Settings | - | ✅ | ✅ | - | - | ✅ |
| User Management | ✅ | ✅ | ✅ | ✅ | - | ✅ |
| Audit Logs | - | ✅ | - | - | - | - |
| Org Functions | ✅ | ✅ | ✅ | ✅ | - | - |
| Org Departments | ✅ | ✅ | ✅ | ✅ | - | - |
| Org Roles | ✅ | ✅ | ✅ | ✅ | - | - |
| Org Responsibilities | ✅ | ✅ | ✅ | ✅ | - | - |

### Admin Permissions

| Scope | Create | Read | Update | Delete | Execute | Manage |
|-------|--------|------|--------|--------|---------|--------|
| Agents | ✅ | ✅ | ✅ | ✅ | - | ✅ |
| Capabilities | ✅ | ✅ | ✅ | ✅ | - | - |
| Workflows | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Analytics | - | ✅ | - | - | - | - |
| System Settings | - | ✅ | ✅ | - | - | - |
| User Management | ❌ | ❌ | ❌ | ❌ | - | ❌ |
| Audit Logs | - | ✅ | - | - | - | - |
| Org Functions | ❌ | ✅ | ✅ | ❌ | - | - |
| Org Departments | ❌ | ✅ | ✅ | ❌ | - | - |
| Org Roles | ❌ | ✅ | ✅ | ❌ | - | - |
| Org Responsibilities | ❌ | ✅ | ✅ | ❌ | - | - |

### Manager Permissions

| Scope | Create | Read | Update | Delete | Execute | Manage |
|-------|--------|------|--------|--------|---------|--------|
| Agents | ✅ | ✅ | ✅ | ✅ | - | - |
| Capabilities | ❌ | ✅ | ❌ | ❌ | - | - |
| Workflows | ✅ | ✅ | ✅ | ❌ | ✅ | - |
| Analytics | - | ✅ | - | - | - | - |
| Org Functions | ❌ | ✅ | ❌ | ❌ | - | - |
| Org Departments | ❌ | ✅ | ❌ | ❌ | - | - |
| Org Roles | ❌ | ✅ | ❌ | ❌ | - | - |

### User Permissions

| Scope | Create | Read | Update | Delete | Execute | Manage |
|-------|--------|------|--------|--------|---------|--------|
| Agents | ❌ | ✅ | ❌ | ❌ | - | - |
| Capabilities | ❌ | ✅ | ❌ | ❌ | - | - |
| Workflows | ❌ | ✅ | ❌ | ❌ | ✅ | - |
| Analytics | - | ✅ | - | - | - | - |
| Org Functions | ❌ | ✅ | ❌ | ❌ | - | - |
| Org Departments | ❌ | ✅ | ❌ | ❌ | - | - |
| Org Roles | ❌ | ✅ | ❌ | ❌ | - | - |

### Viewer Permissions

| Scope | Create | Read | Update | Delete | Execute | Manage |
|-------|--------|------|--------|--------|---------|--------|
| Agents | ❌ | ✅ | ❌ | ❌ | ❌ | - |
| Capabilities | ❌ | ✅ | ❌ | ❌ | ❌ | - |
| Workflows | ❌ | ✅ | ❌ | ❌ | ❌ | - |
| Analytics | - | ✅ | - | - | - | - |

## Database Schema

### Core Tables

#### `auth.users`
```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  encrypted_password TEXT,
  email_confirmed BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ
);
```

#### `user_profiles`
```sql
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
```

#### `role_permissions`
```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  scope permission_scope NOT NULL,
  action permission_action NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role, scope, action)
);
```

#### `security_audit_log`
```sql
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
```

## Implementation

### Checking Permissions

Use the `check_user_permission()` function:

```sql
SELECT check_user_permission(
  'user@example.com',
  'agents',
  'create'
);
-- Returns: true/false
```

### Checking Admin Status

```sql
SELECT is_admin_user('user@example.com');
-- Returns: true if admin or super_admin
```

### Getting User Role

```sql
SELECT get_user_role('user@example.com');
-- Returns: user_role enum
```

### Application Layer Integration

#### Next.js API Route Example

```typescript
import { checkUserPermission } from '@/lib/auth/permissions';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const hasPermission = await checkUserPermission(
    session.user.email,
    'agents',
    'create'
  );

  if (!hasPermission) {
    return new Response('Forbidden', { status: 403 });
  }

  // Proceed with operation
}
```

#### React Component Example

```typescript
import { useAuth } from '@/features/auth/hooks';
import { usePermission } from '@/features/auth/hooks/usePermission';

export function CreateAgentButton() {
  const { user } = useAuth();
  const canCreate = usePermission('agents', 'create');

  if (!canCreate) {
    return null; // Or disabled button
  }

  return <button onClick={handleCreate}>Create Agent</button>;
}
```

## Security Features

### 1. Audit Logging
All sensitive operations are automatically logged in `security_audit_log`:
- User authentication events
- User profile changes
- Role modifications
- Resource access

### 2. Session Management
- Secure session tokens
- Session expiration tracking
- IP address logging
- User agent tracking

### 3. Password Security
- Encrypted password storage
- Secure password hashing (application layer)
- Password reset functionality

### 4. Access Control
- Row Level Security (RLS) policies
- Permission-based access control
- Hierarchical role system
- Granular permission actions

## Migration Files

1. **`20250919150000_user_roles_rbac.sql`** - Initial RBAC setup (Supabase-based)
2. **`20251004100000_standalone_rbac_auth.sql`** - Standalone auth system
3. **`20251004110000_add_org_permissions.sql`** - Organizational permissions
4. **`20251004000000_admin_tier_lifecycle_permissions.sql`** - Admin field permissions

## Current Super Admin

**Name:** Hicham Naim
**Email:** hicham.naim@curated.health
**Department:** Engineering
**Organization:** Curated Health
**Role:** Super Admin

## Adding New Users

### Via SQL
```sql
-- Create user
INSERT INTO auth.users (email, email_confirmed, is_active)
VALUES ('newuser@example.com', TRUE, TRUE);

-- Create profile with role
INSERT INTO user_profiles (user_id, email, full_name, role, organization)
SELECT
  id,
  'newuser@example.com',
  'New User',
  'user',  -- or 'admin', 'manager', etc.
  'Your Organization'
FROM auth.users
WHERE email = 'newuser@example.com';
```

### Via Application
Use the user management API endpoints (super_admin only):
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Troubleshooting

### User Can't Access Resource

1. Check user profile exists and is active:
```sql
SELECT * FROM user_profiles WHERE email = 'user@example.com';
```

2. Check role permissions:
```sql
SELECT * FROM role_permissions
WHERE role = (SELECT role FROM user_profiles WHERE email = 'user@example.com');
```

3. Check permission function:
```sql
SELECT check_user_permission('user@example.com', 'agents', 'read');
```

### Permission Not Working

1. Verify permission exists:
```sql
SELECT * FROM role_permissions
WHERE scope = 'desired_scope' AND action = 'desired_action';
```

2. Add missing permission:
```sql
INSERT INTO role_permissions (role, scope, action)
VALUES ('desired_role', 'desired_scope', 'desired_action')
ON CONFLICT DO NOTHING;
```

## Best Practices

1. **Least Privilege** - Grant minimum necessary permissions
2. **Regular Audits** - Review audit logs regularly
3. **Role Assignment** - Assign roles based on job function
4. **Session Security** - Implement session timeout
5. **Password Policy** - Enforce strong passwords
6. **Access Review** - Periodic review of user access

## Future Enhancements

- [ ] Multi-factor authentication (MFA)
- [ ] OAuth/SAML integration
- [ ] Fine-grained resource permissions
- [ ] Time-based access control
- [ ] Approval workflows for sensitive operations
- [ ] Advanced audit log analytics
