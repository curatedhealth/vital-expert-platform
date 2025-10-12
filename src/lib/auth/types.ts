export type UserRole = 'super_admin' | 'admin' | 'llm_manager' | 'user' | 'viewer';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string | null;
  organization_id?: string | null;
  job_title?: string | null;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  profile?: UserProfile;
  avatar_url?: string | null;
  organization_id?: string | null;
  job_title?: string | null;
  preferences?: Record<string, any>;
}

export interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  session: any;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

export interface AuthState {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'users:read', 'users:write', 'users:delete',
    'admin:read', 'admin:write', 'admin:delete',
    'system:read', 'system:write', 'system:delete',
    'agents:read', 'agents:write', 'agents:delete',
    'workflows:read', 'workflows:write', 'workflows:delete',
    'analytics:read', 'analytics:write',
    'settings:read', 'settings:write'
  ],
  admin: [
    'users:read', 'users:write',
    'agents:read', 'agents:write', 'agents:delete',
    'workflows:read', 'workflows:write', 'workflows:delete',
    'analytics:read', 'analytics:write',
    'settings:read', 'settings:write'
  ],
  llm_manager: [
    'agents:read', 'agents:write',
    'workflows:read', 'workflows:write',
    'analytics:read',
    'settings:read'
  ],
  user: [
    'agents:read',
    'workflows:read',
    'analytics:read'
  ],
  viewer: [
    'agents:read',
    'workflows:read'
  ]
};

// Role hierarchy for permission checking
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 5,
  admin: 4,
  llm_manager: 3,
  user: 2,
  viewer: 1
};
