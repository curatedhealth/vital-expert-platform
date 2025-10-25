import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';

import {
  UserRole,
  PermissionScope,
  PermissionAction,
  UserProfile,
  AuthenticatedUser,
  ROLE_HIERARCHY
} from '@vital/sdk/types';

interface AuthState {
  user: AuthenticatedUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (scope: PermissionScope, action: PermissionAction) => boolean;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  canAccess: (requiredRole: UserRole) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const _useAuthState = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
    initialized: false
  });

  const supabase = createClientComponentClient();

  // Permission mappings (should match the backend)
  const rolePermissions = new Map<UserRole, Set<string>>([
    [UserRole.SUPER_ADMIN, new Set([
      'llm_providers:create', 'llm_providers:read', 'llm_providers:update', 'llm_providers:delete', 'llm_providers:manage',
      'agents:create', 'agents:read', 'agents:update', 'agents:delete', 'agents:manage',
      'workflows:create', 'workflows:read', 'workflows:update', 'workflows:delete', 'workflows:execute',
      'analytics:read', 'analytics:manage',
      'system_settings:read', 'system_settings:update', 'system_settings:manage',
      'user_management:create', 'user_management:read', 'user_management:update', 'user_management:delete', 'user_management:manage',
      'audit_logs:read'
    ])],
    [UserRole.ADMIN, new Set([
      'llm_providers:create', 'llm_providers:read', 'llm_providers:update', 'llm_providers:delete', 'llm_providers:manage',
      'agents:create', 'agents:read', 'agents:update', 'agents:delete', 'agents:manage',
      'workflows:create', 'workflows:read', 'workflows:update', 'workflows:delete', 'workflows:execute',
      'analytics:read',
      'system_settings:read', 'system_settings:update',
      'audit_logs:read'
    ])],
    [UserRole.LLM_MANAGER, new Set([
      'llm_providers:create', 'llm_providers:read', 'llm_providers:update', 'llm_providers:delete',
      'agents:read',
      'workflows:read', 'workflows:execute',
      'analytics:read'
    ])],
    [UserRole.USER, new Set([
      'llm_providers:read',
      'agents:read', 'agents:create', 'agents:update',
      'workflows:read', 'workflows:execute',
      'analytics:read'
    ])],
    [UserRole.VIEWER, new Set([
      'llm_providers:read',
      'agents:read',
      'workflows:read',
      'analytics:read'
    ])]
  ]);

  const fetchUserProfile = useCallback(async (user: User): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, [supabase]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user);

        if (!profile || !profile.is_active) {
          await supabase.auth.signOut();
          throw new Error('Account is not active or does not exist');
        }

        const authenticatedUser: AuthenticatedUser = {
          id: data.user.id,
          email: profile.email,
          role: profile.role,
          isActive: profile.is_active,
          profile
        };

        setState({
          user: authenticatedUser,
          profile,
          loading: false,
          error: null,
          initialized: true
        });

        // Update last login
        await supabase
          .from('user_profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('user_id', data.user.id);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      }));
      throw error;
    }
  }, [supabase, fetchUserProfile]);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await supabase.auth.signOut();
      setState({
        user: null,
        profile: null,
        loading: false,
        error: null,
        initialized: true
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      }));
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await fetchUserProfile(user);
        if (profile) {
          const authenticatedUser: AuthenticatedUser = {
            id: user.id,
            email: profile.email,
            role: profile.role,
            isActive: profile.is_active,
            profile
          };

          setState(prev => ({
            ...prev,
            user: authenticatedUser,
            profile
          }));
        }
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  }, [state.user, supabase, fetchUserProfile]);

  const hasPermission = useCallback((scope: PermissionScope, action: PermissionAction): boolean => {
    if (!state.user) return false;

    const userPermissions = rolePermissions.get(state.user.role);
    if (!userPermissions) return false;

    const permissionKey = `${scope}:${action}`;
    return userPermissions.has(permissionKey);
  }, [state.user, rolePermissions]);

  const hasRole = useCallback((role: UserRole): boolean => {
    return state.user?.role === role;
  }, [state.user]);

  const isAdmin = useCallback((): boolean => {
    return state.user?.role === UserRole.ADMIN || state.user?.role === UserRole.SUPER_ADMIN;
  }, [state.user]);

  const isSuperAdmin = useCallback((): boolean => {
    return state.user?.role === UserRole.SUPER_ADMIN;
  }, [state.user]);

  const canAccess = useCallback((requiredRole: UserRole): boolean => {
    if (!state.user) return false;
    // eslint-disable-next-line security/detect-object-injection
    return ROLE_HIERARCHY[state.user.role] >= ROLE_HIERARCHY[requiredRole];
  }, [state.user]);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          const profile = await fetchUserProfile(session.user);

          if (profile && profile.is_active) {
            const authenticatedUser: AuthenticatedUser = {
              id: session.user.id,
              email: profile.email,
              role: profile.role,
              isActive: profile.is_active,
              profile
            };

            setState({
              user: authenticatedUser,
              profile,
              loading: false,
              error: null,
              initialized: true
            });
          } else {
            setState({
              user: null,
              profile: null,
              loading: false,
              error: null,
              initialized: true
            });
          }
        } else if (isMounted) {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: null,
            initialized: true
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Initialization failed',
            initialized: true
          });
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user);

          if (profile && profile.is_active) {
            const authenticatedUser: AuthenticatedUser = {
              id: session.user.id,
              email: profile.email,
              role: profile.role,
              isActive: profile.is_active,
              profile
            };

            setState({
              user: authenticatedUser,
              profile,
              loading: false,
              error: null,
              initialized: true
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: null,
            initialized: true
          });
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  return {
    ...state,
    signIn,
    signOut,
    hasPermission,
    hasRole,
    isAdmin,
    isSuperAdmin,
    canAccess,
    refreshProfile
  };
};

// Helper hook for specific permission checks
export const _usePermission = (scope: PermissionScope, action: PermissionAction) => {
  const { hasPermission } = useAuth();
  return hasPermission(scope, action);
};

// Helper hook for role checks
export const _useRole = (role: UserRole) => {
  const { hasRole } = useAuth();
  return hasRole(role);
};

// Helper hook for admin checks
export const _useAdmin = () => {
  const { isAdmin } = useAuth();
  return isAdmin();
};

export { AuthContext };
export type { AuthContextType };