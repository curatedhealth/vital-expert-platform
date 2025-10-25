// Authentication and Authorization Types

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
  AUDIT_LOGS = 'audit_logs'
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  MANAGE = 'manage'
}

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  department?: string;
  organization?: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
}

export interface RolePermission {
  id: string;
  role: UserRole;
  scope: PermissionScope;
  action: PermissionAction;
  created_at: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  expires_at: Date;
  created_at: Date;
  ended_at?: Date;
}

export interface SecurityAuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  created_at: Date;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  profile?: UserProfile;
}

export interface PermissionCheck {
  scope: PermissionScope;
  action: PermissionAction;
}

// Role hierarchies for UI display
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
  [UserRole.SUPER_ADMIN]: 'Full system access including user management and system settings',
  [UserRole.ADMIN]: 'Administrative access to most features except user management',
  [UserRole.LLM_MANAGER]: 'Specialized access for managing LLM providers and configurations',
  [UserRole.USER]: 'Standard user access for creating and managing agents and workflows',
  [UserRole.VIEWER]: 'Read-only access to view data and reports'
};

// Permission scope display names
export const SCOPE_DISPLAY_NAMES: Record<PermissionScope, string> = {
  [PermissionScope.LLM_PROVIDERS]: 'LLM Providers',
  [PermissionScope.AGENTS]: 'AI Agents',
  [PermissionScope.WORKFLOWS]: 'Workflows',
  [PermissionScope.ANALYTICS]: 'Analytics',
  [PermissionScope.SYSTEM_SETTINGS]: 'System Settings',
  [PermissionScope.USER_MANAGEMENT]: 'User Management',
  [PermissionScope.AUDIT_LOGS]: 'Audit Logs'
};

// Permission action display names
export const ACTION_DISPLAY_NAMES: Record<PermissionAction, string> = {
  [PermissionAction.CREATE]: 'Create',
  [PermissionAction.READ]: 'View',
  [PermissionAction.UPDATE]: 'Edit',
  [PermissionAction.DELETE]: 'Delete',
  [PermissionAction.EXECUTE]: 'Execute',
  [PermissionAction.MANAGE]: 'Manage'
};

// Helper functions
export function canUserAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  // Use switch statements to avoid object injection
  const getUserRoleLevel = (role: UserRole): number => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 5;
      case UserRole.ADMIN: return 4;
      case UserRole.MANAGER: return 3;
      case UserRole.USER: return 2;
      case UserRole.GUEST: return 1;
      default: return 0;
    }
  };
  
  return getUserRoleLevel(userRole) >= getUserRoleLevel(requiredRole);
}

export function isHigherRole(role1: UserRole, role2: UserRole): boolean {
  // Use switch statements to avoid object injection
  const getUserRoleLevel = (role: UserRole): number => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 5;
      case UserRole.ADMIN: return 4;
      case UserRole.MANAGER: return 3;
      case UserRole.USER: return 2;
      case UserRole.GUEST: return 1;
      default: return 0;
    }
  };
  
  return getUserRoleLevel(role1) > getUserRoleLevel(role2);
}

export function getRoleColor(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return 'text-red-600 bg-red-50 border-red-200';
    case UserRole.ADMIN:
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case UserRole.LLM_MANAGER:
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case UserRole.USER:
      return 'text-green-600 bg-green-50 border-green-200';
    case UserRole.VIEWER:
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export interface ApiError {
  error: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total_count: number;
  page: number;
  page_size: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Session management types
export interface SessionInfo {
  user: AuthenticatedUser;
  session: UserSession;
  permissions: PermissionCheck[];
  rateLimits: Record<string, RateLimitInfo>;
}

export default {
  UserRole,
  PermissionScope,
  PermissionAction,
  ROLE_HIERARCHY,
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
  SCOPE_DISPLAY_NAMES,
  ACTION_DISPLAY_NAMES,
  canUserAccess,
  isHigherRole,
  getRoleColor
};