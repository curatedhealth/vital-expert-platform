# VITAL Path - Auth & RBAC Quick Reference

## Current Status ✅

✅ **RBAC System Active** - 106 total permissions configured
✅ **5 User Roles** - super_admin, admin, manager, user, viewer
✅ **11 Permission Scopes** - All platform features covered
✅ **Super Admin Configured** - hicham.naim@curated.health

## Permission Count by Role

| Role | Total Permissions |
|------|-------------------|
| Super Admin | 47 |
| Admin | 31 |
| Manager | 12 |
| User | 11 |
| Viewer | 5 |

## Role Capabilities Summary

### 🔴 Super Admin
- **Full system control**
- Create/manage users
- Modify system settings
- Access audit logs
- Manage all organizational data

### 🟠 Admin
- **Administrative access**
- Manage agents, capabilities, workflows
- Update organizational data
- View audit logs
- ❌ Cannot manage users or critical settings

### 🟡 Manager
- **Operational management**
- Create/manage agents and workflows
- View all organizational data
- Execute workflows
- ❌ Cannot modify system settings

### 🟢 User
- **Standard access**
- View all resources
- Execute workflows
- View analytics
- ❌ Cannot create or modify resources

### 🔵 Viewer
- **Read-only**
- View agents, capabilities, workflows
- View analytics
- ❌ Cannot execute or modify anything

## Database Functions

```sql
-- Check if user has permission
SELECT check_user_permission('email@example.com', 'agents', 'create');

-- Check if user is admin
SELECT is_admin_user('email@example.com');

-- Get user role
SELECT get_user_role('email@example.com');
```

## Adding New User (Super Admin Only)

```sql
-- 1. Create auth user
INSERT INTO auth.users (email, email_confirmed, is_active)
VALUES ('newuser@example.com', TRUE, TRUE);

-- 2. Create user profile
INSERT INTO user_profiles (user_id, email, full_name, role, organization)
SELECT id, 'newuser@example.com', 'Full Name', 'user', 'Organization'
FROM auth.users WHERE email = 'newuser@example.com';
```

## Permission Scopes

1. `agents` - AI Agents
2. `capabilities` - Agent Capabilities
3. `workflows` - Workflows
4. `analytics` - Analytics
5. `system_settings` - System Config
6. `user_management` - Users & Roles
7. `audit_logs` - Security Logs
8. `org_functions` - Org Functions
9. `org_departments` - Departments
10. `org_roles` - Roles
11. `org_responsibilities` - Responsibilities

## Permission Actions

- `create` - Create new resources
- `read` - View resources
- `update` - Modify resources
- `delete` - Remove resources
- `execute` - Run workflows
- `manage` - Full control

## Security Audit

All sensitive operations are logged in `security_audit_log`:
- User authentication
- Profile changes
- Resource access
- Permission checks

## Migration Files

1. `20250919150000_user_roles_rbac.sql` - Initial RBAC
2. `20251004100000_standalone_rbac_auth.sql` - Standalone auth
3. `20251004110000_add_org_permissions.sql` - Org permissions

## Quick Checks

```sql
-- View all users
SELECT email, role, is_active FROM user_profiles;

-- View permissions for a role
SELECT scope, action FROM role_permissions WHERE role = 'admin';

-- Recent audit log
SELECT * FROM security_audit_log ORDER BY created_at DESC LIMIT 10;
```

## Support

For detailed documentation, see [AUTH_RBAC_GUIDE.md](./AUTH_RBAC_GUIDE.md)
