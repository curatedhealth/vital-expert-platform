'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { AUTH_CONFIG } from '@/config';
import { AuthContextType, AuthUser, UserRole, UserProfile } from './types';
import { sessionSync } from './session-sync';
import { authErrorRecovery } from '@/error-recovery';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Convert Supabase user to AuthUser with role from database
  const createAuthUser = eCallback(async (supabaseUser: SupabaseUser): Promise<AuthUser> => {
    try {
      // Fetch user profile from user_profiles table
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, is_active, avatar_url, organization_id, job_title, preferences')
        .eq('user_id', supabaseUser.id)
        .single();

      if (profileError) {
        console.warn('Profile not found, creating default profile:', profileError.message);
        
        // Create default profile for new user
        const defaultRole: UserRole = TH_CONFIG.superAdminEmails.includes(supabaseUser.email || '') 
          ? 'super_admin' 
          : 'user';
          
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: supabaseUser.id,
            email: supabaseUser.email,
            role: defaultRole,
            is_active: true,
            avatar_url: null,
            organization_id: null,
            job_title: null,
            preferences: {}
          })
          .select()
          .single();

        if (createError) {
          console.error('Failed to create user profile:', createError);
          // Return user with default role even if profile creation fails
          return {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            role: defaultRole,
            isActive: true
          };
        }

        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          role: newProfile.role as UserRole,
          isActive: newProfile.is_active,
          profile: newProfile as UserProfile
        };
      }

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: profile.role as UserRole,
        isActive: profile.is_active,
        profile: {
          user_id: supabaseUser.id,
          email: supabaseUser.email || '',
          role: profile.role as UserRole,
          is_active: profile.is_active,
          avatar_url: profile.avatar_url,
          organization_id: profile.organization_id,
          job_title: profile.job_title,
          preferences: profile.preferences || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error creating auth user:', error);
      // Return user with default role on error
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: 'user',
        isActive: true
      };
    }
  }, []);

  // Retry mechanism for failed operations
  const withRetry = eCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    try {
      const result = ait operation();
      setRetryCount(0); // Reset retry count on success
      return result;
    } catch (error) {
      console.error(`${operationName} failed (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < AUTH_CONFIG.retryAttempts) {
        setRetryCount(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, AUTH_CONFIG.retryDelay * retryCount));
        return withRetry(operation, operationName);
      }
      
      throw error;
    }
  }, [retryCount]);

  // Initialize authentication
  const initializeAuth = eCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session }, error } = await authErrorRecovery.retry(
        () => supabase.auth.getSession(),
        'getSession'
      );
      
      if (error) {
        throw new Error(`Session error: ${error.message}`);
      }

      if (session?.user) {
        const authUser = await createAuthUser(session.user);
        setUser(authUser);
        setSession(session);
        console.log('✅ User authenticated:', authUser.email, 'Role:', authUser.role);
      } else {
        setUser(null);
        setSession(null);
        console.log('ℹ️ No active session');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      const friendlyMessage = thErrorRecovery.getUserFriendlyMessage(error);
      setError(friendlyMessage);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [createAuthUser]);

  // Session refresh mechanism
  const refreshSession = eCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw new Error(`Session refresh error: ${error.message}`);
      }

      if (session?.user) {
        const authUser = await createAuthUser(session.user);
        setUser(authUser);
        setSession(session);
        console.log('✅ Session refreshed for:', authUser.email);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      setError(error instanceof Error ? error.message : 'Session refresh failed');
    }
  }, [createAuthUser]);

  // Sign in function
  const signIn = eCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await authErrorRecovery.retry(
        () => supabase.auth.signInWithPassword({ email, password }),
        'signIn'
      );

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        const authUser = await createAuthUser(data.user);
        setUser(authUser);
        setSession(data.session);
        console.log('✅ User signed in:', authUser.email, 'Role:', authUser.role);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      const friendlyMessage = thErrorRecovery.getUserFriendlyMessage(error);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [createAuthUser]);

  // Sign out function
  const signOut = eCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear local state immediately
      setUser(null);
      setSession(null);

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }

      console.log('✅ User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error instanceof Error ? error.message : 'Sign out failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error function
  const clearError = eCallback(() => {
    setError(null);
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setError(null);

        if (session?.user) {
          const authUser = await createAuthUser(session.user);
          setUser(authUser);
          setSession(session);
        } else {
          setUser(null);
          setSession(null);
        }

        setLoading(false);
      }
    );

    // Set up cross-tab session sync
    const unsubscribeSync = ssionSync.subscribe(() => {
      // Refresh auth state when session changes in other tabs
      initializeAuth();
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeSync();
    };
  }, [createAuthUser, initializeAuth]);

  // Auto-refresh session
  useEffect(() => {
    if (!session || !user) return;

    const interval = tInterval(() => {
      refreshSession();
    }, AUTH_CONFIG.sessionRefreshInterval);

    return () => clearInterval(interval);
  }, [session, user, refreshSession]);

  // Refresh session on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (session && user) {
        refreshSession();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [session, user, refreshSession]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    isInitialized,
    signIn,
    signOut,
    refreshSession,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
