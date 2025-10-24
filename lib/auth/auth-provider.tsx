'use client';

/**
 * Enhanced Authentication Provider with RBAC Integration
 *
 * Combines Supabase authentication with Role-Based Access Control
 * Provides hooks for permission checking, role validation, and protected routes
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { UserRole, Permission, hasPermission, hasAnyPermission, hasAllPermissions, getDefaultRole } from './rbac';

// ============================================================================
// TYPES
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  organization_id?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface AuthContextType {
  // User & Session
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;

  // Authentication Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // Role & Permission Checks
  role: UserRole | null;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isRole: (role: UserRole) => boolean;
  isRoleOrHigher: (role: UserRole) => boolean;

  // RLS Context
  userId: string | null;
  organizationId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// AUTH PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);

        // Create default profile if it doesn't exist
        const newProfile: Partial<UserProfile> = {
          id: userId,
          email: user?.email || '',
          role: getDefaultRole(),
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0],
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          setUserProfile(createdProfile as UserProfile);
        }
      } else {
        setUserProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) {
      throw new Error('No authenticated user');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUserProfile(data as UserProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // ============================================================================
  // AUTHENTICATION ACTIONS
  // ============================================================================

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.user);

      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      // Create profile with default role
      if (data.user) {
        const newProfile: Partial<UserProfile> = {
          id: data.user.id,
          email: email,
          role: getDefaultRole(),
          full_name: metadata?.full_name || email.split('@')[0],
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setUser(null);
      setSession(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  // ============================================================================
  // ROLE & PERMISSION CHECKS
  // ============================================================================

  const checkPermission = (permission: Permission): boolean => {
    if (!userProfile?.role) return false;
    return hasPermission(userProfile.role, permission);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!userProfile?.role) return false;
    return hasAnyPermission(userProfile.role, permissions);
  };

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!userProfile?.role) return false;
    return hasAllPermissions(userProfile.role, permissions);
  };

  const isRole = (role: UserRole): boolean => {
    return userProfile?.role === role;
  };

  const isRoleOrHigher = (role: UserRole): boolean => {
    if (!userProfile?.role) return false;

    const roleTiers: Record<UserRole, number> = {
      [UserRole.SUPER_ADMIN]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.MANAGER]: 3,
      [UserRole.USER]: 4,
      [UserRole.VIEWER]: 5,
      [UserRole.GUEST]: 6,
    };

    const userTier = roleTiers[userProfile.role] || 999;
    const requiredTier = roleTiers[role] || 999;

    return userTier <= requiredTier;
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AuthContextType = {
    // User & Session
    user,
    session,
    userProfile,
    loading,

    // Authentication Actions
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,

    // Role & Permission Checks
    role: userProfile?.role || null,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    isRole,
    isRoleOrHigher,

    // RLS Context
    userId: user?.id || null,
    organizationId: userProfile?.organization_id || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Main auth hook - provides full auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to require authentication - redirects to login if not authenticated
 */
export function useRequireAuth(redirectUrl: string = '/auth/login') {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = redirectUrl;
    }
  }, [user, loading, redirectUrl]);

  return { user, loading };
}

/**
 * Hook to check a specific permission
 */
export function usePermission(permission: Permission): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

/**
 * Hook to check multiple permissions (OR logic)
 */
export function useAnyPermission(permissions: Permission[]): boolean {
  const { hasAnyPermission } = useAuth();
  return hasAnyPermission(permissions);
}

/**
 * Hook to check multiple permissions (AND logic)
 */
export function useAllPermissions(permissions: Permission[]): boolean {
  const { hasAllPermissions } = useAuth();
  return hasAllPermissions(permissions);
}

/**
 * Hook to check user role
 */
export function useRole(): UserRole | null {
  const { role } = useAuth();
  return role;
}

/**
 * Hook to require specific permission - shows error if not authorized
 */
export function useRequirePermission(permission: Permission, fallbackUrl: string = '/') {
  const { hasPermission, loading } = useAuth();
  const authorized = hasPermission(permission);

  useEffect(() => {
    if (!loading && !authorized) {
      window.location.href = fallbackUrl;
    }
  }, [authorized, loading, fallbackUrl]);

  return authorized;
}

/**
 * Hook to require specific role - shows error if not authorized
 */
export function useRequireRole(role: UserRole, fallbackUrl: string = '/') {
  const { isRoleOrHigher, loading } = useAuth();
  const authorized = isRoleOrHigher(role);

  useEffect(() => {
    if (!loading && !authorized) {
      window.location.href = fallbackUrl;
    }
  }, [authorized, loading, fallbackUrl]);

  return authorized;
}

export default AuthContext;
