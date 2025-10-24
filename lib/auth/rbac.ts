/**
 * Role-Based Access Control (RBAC) System
 *
 * Defines roles, permissions, and access control logic
 * Integrates with Supabase RLS policies
 */

// ============================================================================
// TYPES
// ============================================================================

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer',
  GUEST = 'guest',
}

export enum Permission {
  // Agent Management
  AGENTS_VIEW = 'agents:view',
  AGENTS_CREATE = 'agents:create',
  AGENTS_EDIT = 'agents:edit',
  AGENTS_DELETE = 'agents:delete',
  AGENTS_PUBLISH = 'agents:publish',

  // Chat & Conversations
  CHAT_USE = 'chat:use',
  CHAT_HISTORY_VIEW = 'chat:history:view',
  CHAT_HISTORY_DELETE = 'chat:history:delete',

  // Knowledge Management
  KNOWLEDGE_VIEW = 'knowledge:view',
  KNOWLEDGE_UPLOAD = 'knowledge:upload',
  KNOWLEDGE_EDIT = 'knowledge:edit',
  KNOWLEDGE_DELETE = 'knowledge:delete',

  // Users & Permissions
  USERS_VIEW = 'users:view',
  USERS_INVITE = 'users:invite',
  USERS_MANAGE = 'users:manage',
  USERS_DELETE = 'users:delete',

  // Organization Management
  ORG_VIEW = 'org:view',
  ORG_EDIT = 'org:edit',
  ORG_SETTINGS = 'org:settings',
  ORG_BILLING = 'org:billing',

  // Prompts
  PROMPTS_VIEW = 'prompts:view',
  PROMPTS_EDIT = 'prompts:edit',
  PROMPTS_CREATE = 'prompts:create',

  // Analytics & Reporting
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',

  // System Admin
  SYSTEM_SETTINGS = 'system:settings',
  SYSTEM_LOGS = 'system:logs',
  SYSTEM_AUDIT = 'system:audit',
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
  tier: number; // 1 = highest, 5 = lowest
}

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.SUPER_ADMIN]: {
    role: UserRole.SUPER_ADMIN,
    tier: 1,
    description: 'Full system access, can manage all users and settings',
    permissions: Object.values(Permission), // All permissions
  },

  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    tier: 2,
    description: 'Organization administrator, can manage users and resources',
    permissions: [
      // Agent Management
      Permission.AGENTS_VIEW,
      Permission.AGENTS_CREATE,
      Permission.AGENTS_EDIT,
      Permission.AGENTS_DELETE,
      Permission.AGENTS_PUBLISH,

      // Chat
      Permission.CHAT_USE,
      Permission.CHAT_HISTORY_VIEW,
      Permission.CHAT_HISTORY_DELETE,

      // Knowledge
      Permission.KNOWLEDGE_VIEW,
      Permission.KNOWLEDGE_UPLOAD,
      Permission.KNOWLEDGE_EDIT,
      Permission.KNOWLEDGE_DELETE,

      // Users
      Permission.USERS_VIEW,
      Permission.USERS_INVITE,
      Permission.USERS_MANAGE,

      // Organization
      Permission.ORG_VIEW,
      Permission.ORG_EDIT,
      Permission.ORG_SETTINGS,
      Permission.ORG_BILLING,

      // Prompts
      Permission.PROMPTS_VIEW,
      Permission.PROMPTS_EDIT,
      Permission.PROMPTS_CREATE,

      // Analytics
      Permission.ANALYTICS_VIEW,
      Permission.ANALYTICS_EXPORT,
    ],
  },

  [UserRole.MANAGER]: {
    role: UserRole.MANAGER,
    tier: 3,
    description: 'Team manager, can create and manage agents',
    permissions: [
      Permission.AGENTS_VIEW,
      Permission.AGENTS_CREATE,
      Permission.AGENTS_EDIT,
      Permission.AGENTS_PUBLISH,

      Permission.CHAT_USE,
      Permission.CHAT_HISTORY_VIEW,

      Permission.KNOWLEDGE_VIEW,
      Permission.KNOWLEDGE_UPLOAD,
      Permission.KNOWLEDGE_EDIT,

      Permission.USERS_VIEW,
      Permission.USERS_INVITE,

      Permission.ORG_VIEW,

      Permission.PROMPTS_VIEW,
      Permission.PROMPTS_CREATE,

      Permission.ANALYTICS_VIEW,
    ],
  },

  [UserRole.USER]: {
    role: UserRole.USER,
    tier: 4,
    description: 'Standard user, can use agents and manage own content',
    permissions: [
      Permission.AGENTS_VIEW,
      Permission.AGENTS_CREATE, // Can create personal agents

      Permission.CHAT_USE,
      Permission.CHAT_HISTORY_VIEW,

      Permission.KNOWLEDGE_VIEW,
      Permission.KNOWLEDGE_UPLOAD,

      Permission.ORG_VIEW,

      Permission.PROMPTS_VIEW,

      Permission.ANALYTICS_VIEW,
    ],
  },

  [UserRole.VIEWER]: {
    role: UserRole.VIEWER,
    tier: 5,
    description: 'Read-only access, can view but not modify',
    permissions: [
      Permission.AGENTS_VIEW,
      Permission.CHAT_USE,
      Permission.CHAT_HISTORY_VIEW,
      Permission.KNOWLEDGE_VIEW,
      Permission.ORG_VIEW,
      Permission.PROMPTS_VIEW,
      Permission.ANALYTICS_VIEW,
    ],
  },

  [UserRole.GUEST]: {
    role: UserRole.GUEST,
    tier: 6,
    description: 'Limited access for trial users',
    permissions: [
      Permission.AGENTS_VIEW,
      Permission.CHAT_USE,
    ],
  },
};

// ============================================================================
// PERMISSION CHECKING FUNCTIONS
// ============================================================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const rolePerms = ROLE_PERMISSIONS[role];
  if (!rolePerms) return false;

  return rolePerms.permissions.includes(permission);
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Check if a user's role tier is equal to or higher than required tier
 */
export function hasRoleTier(userRole: UserRole, requiredTier: number): boolean {
  const rolePerms = ROLE_PERMISSIONS[userRole];
  if (!rolePerms) return false;

  return rolePerms.tier <= requiredTier;
}

/**
 * Check if user role is higher than another role
 */
export function isRoleHigherThan(userRole: UserRole, compareRole: UserRole): boolean {
  const userTier = ROLE_PERMISSIONS[userRole]?.tier || 999;
  const compareTier = ROLE_PERMISSIONS[compareRole]?.tier || 999;

  return userTier < compareTier;
}

// ============================================================================
// RESOURCE OWNERSHIP CHECKS
// ============================================================================

export interface ResourceOwnership {
  userId: string;
  organizationId?: string;
  isPublic?: boolean;
  createdBy?: string;
}

/**
 * Check if user can access a resource based on ownership and role
 */
export function canAccessResource(
  userRole: UserRole,
  userId: string,
  resource: ResourceOwnership,
  requiredPermission: Permission
): boolean {
  // Check if user has the required permission
  if (!hasPermission(userRole, requiredPermission)) {
    return false;
  }

  // Public resources are accessible to anyone with the permission
  if (resource.isPublic) {
    return true;
  }

  // Owner always has access
  if (resource.userId === userId || resource.createdBy === userId) {
    return true;
  }

  // Admins and super admins can access organization resources
  if (resource.organizationId) {
    if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user can modify a resource
 */
export function canModifyResource(
  userRole: UserRole,
  userId: string,
  resource: ResourceOwnership
): boolean {
  // Owner can always modify their own resources
  if (resource.userId === userId || resource.createdBy === userId) {
    return true;
  }

  // Admins can modify organization resources
  if (resource.organizationId) {
    if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// RLS POLICY HELPERS
// ============================================================================

/**
 * Get RLS filter for user's accessible resources
 * Used in Supabase queries to enforce row-level security
 */
export function getRLSFilter(userId: string, organizationId?: string) {
  return {
    or: [
      { user_id: userId }, // User's own resources
      { created_by: userId }, // Resources created by user
      { is_public: true }, // Public resources
      ...(organizationId ? [{ organization_id: organizationId }] : []), // Org resources
    ],
  };
}

/**
 * Get role-based WHERE clause for Supabase queries
 */
export function getRoleBasedFilter(
  userRole: UserRole,
  userId: string,
  organizationId?: string
) {
  // Super admins see everything
  if (userRole === UserRole.SUPER_ADMIN) {
    return {};
  }

  // Admins see all organization resources
  if (userRole === UserRole.ADMIN && organizationId) {
    return {
      or: [
        { organization_id: organizationId },
        { is_public: true },
      ],
    };
  }

  // Regular users see own resources and public resources
  return getRLSFilter(userId, organizationId);
}

// ============================================================================
// ROLE MANAGEMENT
// ============================================================================

/**
 * Get default role for new users
 */
export function getDefaultRole(): UserRole {
  return UserRole.USER;
}

/**
 * Validate role assignment
 */
export function canAssignRole(
  assignerRole: UserRole,
  targetRole: UserRole
): boolean {
  // Super admins can assign any role
  if (assignerRole === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Admins can assign roles below admin
  if (assignerRole === UserRole.ADMIN) {
    return targetRole !== UserRole.SUPER_ADMIN;
  }

  // Others cannot assign roles
  return false;
}

/**
 * Get available roles that a user can assign
 */
export function getAssignableRoles(assignerRole: UserRole): UserRole[] {
  if (assignerRole === UserRole.SUPER_ADMIN) {
    return Object.values(UserRole);
  }

  if (assignerRole === UserRole.ADMIN) {
    return [
      UserRole.ADMIN,
      UserRole.MANAGER,
      UserRole.USER,
      UserRole.VIEWER,
      UserRole.GUEST,
    ];
  }

  return [];
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  UserRole,
  Permission,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRoleTier,
  isRoleHigherThan,
  canAccessResource,
  canModifyResource,
  getRLSFilter,
  getRoleBasedFilter,
  getDefaultRole,
  canAssignRole,
  getAssignableRoles,
};
