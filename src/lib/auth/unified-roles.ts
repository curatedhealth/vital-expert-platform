// Unified Role and Permission System
// Single source of truth for all role definitions and permissions

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  LLM_MANAGER = 'llm_manager',
  USER = 'user',
  VIEWER = 'viewer'
}

export enum PermissionScope {
  LLM_PROVIDERS = 'llm_providers',
  AGENTS = 'agents',
  WORKFLOWS = 'workflows',
  ANALYTICS = 'analytics',
  SYSTEM_SETTINGS = 'system_settings',
  USER_MANAGEMENT = 'user_management',
  AUDIT_LOGS = 'audit_logs',
  ORGANIZATIONS = 'organizations',
  PROJECTS = 'projects',
  KNOWLEDGE = 'knowledge',
  CLINICAL = 'clinical'
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  MANAGE = 'manage'
}

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 5,
  [UserRole.ADMIN]: 4,
  [UserRole.LLM_MANAGER]: 3,
  [UserRole.USER]: 2,
  [UserRole.VIEWER]: 1
};

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Administrator',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.LLM_MANAGER]: 'LLM Manager',
  [UserRole.USER]: 'User',
  [UserRole.VIEWER]: 'Viewer'
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Full system access with all permissions',
  [UserRole.ADMIN]: 'Administrative access to most system functions',
  [UserRole.LLM_MANAGER]: 'Manages LLM providers and AI configurations',
  [UserRole.USER]: 'Standard user with basic system access',
  [UserRole.VIEWER]: 'Read-only access to system data'
};

// Scope display names
export const SCOPE_DISPLAY_NAMES: Record<PermissionScope, string> = {
  [PermissionScope.LLM_PROVIDERS]: 'LLM Providers',
  [PermissionScope.AGENTS]: 'Agents',
  [PermissionScope.WORKFLOWS]: 'Workflows',
  [PermissionScope.ANALYTICS]: 'Analytics',
  [PermissionScope.SYSTEM_SETTINGS]: 'System Settings',
  [PermissionScope.USER_MANAGEMENT]: 'User Management',
  [PermissionScope.AUDIT_LOGS]: 'Audit Logs',
  [PermissionScope.ORGANIZATIONS]: 'Organizations',
  [PermissionScope.PROJECTS]: 'Projects',
  [PermissionScope.KNOWLEDGE]: 'Knowledge Base',
  [PermissionScope.CLINICAL]: 'Clinical Data'
};

// Action display names
export const ACTION_DISPLAY_NAMES: Record<PermissionAction, string> = {
  [PermissionAction.CREATE]: 'Create',
  [PermissionAction.READ]: 'Read',
  [PermissionAction.UPDATE]: 'Update',
  [PermissionAction.DELETE]: 'Delete',
  [PermissionAction.EXECUTE]: 'Execute',
  [PermissionAction.MANAGE]: 'Manage'
};

// Permission matrix - defines what each role can do
export const ROLE_PERMISSIONS: Record<UserRole, Set<string>> = {
  [UserRole.SUPER_ADMIN]: new Set(['*:*']), // All permissions
  [UserRole.ADMIN]: new Set([
    'agents:*', 'workflows:*', 'analytics:read', 'analytics:create',
    'llm_providers:*', 'audit_logs:read', 'user_management:*',
    'organizations:read', 'organizations:update', 'projects:*',
    'knowledge:*', 'clinical:read', 'system_settings:read'
  ]),
  [UserRole.LLM_MANAGER]: new Set([
    'llm_providers:*', 'agents:read', 'agents:create', 'agents:update',
    'workflows:read', 'workflows:execute', 'analytics:read',
    'knowledge:read', 'knowledge:create', 'knowledge:update'
  ]),
  [UserRole.USER]: new Set([
    'agents:read', 'agents:create', 'workflows:read', 'workflows:execute',
    'analytics:read', 'projects:read', 'projects:create', 'projects:update',
    'knowledge:read', 'knowledge:create', 'clinical:read'
  ]),
  [UserRole.VIEWER]: new Set([
    'agents:read', 'workflows:read', 'analytics:read', 'projects:read',
    'knowledge:read', 'clinical:read'
  ])
};

// Helper functions
export function canUserAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function hasPermission(
  role: UserRole,
  scope: PermissionScope,
  action: PermissionAction
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.has('*:*') || 
         permissions.has(`${scope}:*`) || 
         permissions.has(`${scope}:${action}`);
}

export function isHigherRole(userRole: UserRole, compareRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[compareRole];
}

export function getRolePermissions(role: UserRole): string[] {
  return Array.from(ROLE_PERMISSIONS[role]);
}

export function validatePermissionString(permission: string): boolean {
  const [scope, action] = permission.split(':');
  return Object.values(PermissionScope).includes(scope as PermissionScope) &&
         Object.values(PermissionAction).includes(action as PermissionAction);
}

// Type definitions for better TypeScript support
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  role: UserRole;
  organization_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionCheck {
  scope: PermissionScope;
  action: PermissionAction;
  granted: boolean;
  reason?: string;
}

export interface RolePermission {
  role: UserRole;
  scope: PermissionScope;
  action: PermissionAction;
  granted: boolean;
}
