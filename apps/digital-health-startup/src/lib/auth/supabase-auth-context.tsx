'use client';

import { User, Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { createClient } from '@/lib/supabase/client';

// Production-ready TypeScript interfaces
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  tenant_id: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  userProfile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Production-ready logging
const log = {
  info: (message: string, ...args: unknown[]) => {
    if (!IS_PRODUCTION) console.log(`[Auth]`, message, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    if (!IS_PRODUCTION) console.warn(`[Auth]`, message, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[Auth]`, message, ...args);
  }
};

export function SupabaseAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Create a single Supabase client instance
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    let subscription: ReturnType<ReturnType<typeof supabase.auth.onAuthStateChange>> | null = null;

    const getInitialSession = async () => {
      try {
        // Production: Don't allow mock auth unless explicitly in development
        const useMockAuth =
          !IS_PRODUCTION &&
          (!SUPABASE_URL ||
           SUPABASE_URL === 'undefined' ||
           SUPABASE_URL === 'YOUR_SUPABASE_URL');

        if (useMockAuth) {
          log.warn('Supabase not configured - using mock authentication');

          const mockUserData = localStorage.getItem('vital-mock-user');
          const mockSessionData = localStorage.getItem('vital-mock-session');

          if (mockUserData && mockSessionData) {
            try {
              const mockUser = JSON.parse(mockUserData) as User;
              const mockSession = JSON.parse(mockSessionData) as Session;
              if (mounted) {
                setUser(mockUser);
                setSession(mockSession);
                log.info('Mock user loaded:', mockUser.email);
              }
            } catch (error) {
              log.error('Error parsing mock user data:', error);
            }
          }
          if (mounted) setLoading(false);
          return;
        }

        // Production: Real Supabase authentication
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        console.log('🔍 [Auth Debug] getInitialSession - Session check:', {
          hasSession: !!currentSession,
          hasUser: !!currentSession?.user,
          userEmail: currentSession?.user?.email,
          error: error?.message,
          sessionExpiry: currentSession?.expires_at,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          isProduction: IS_PRODUCTION
        });

        if (error) {
          log.error('Error getting session:', error);
        } else if (mounted && currentSession?.user) {
          // Check if session is still valid
          const now = Math.floor(Date.now() / 1000);
          const expiresAt = currentSession.expires_at || 0;
          
          if (expiresAt > now) {
            setSession(currentSession);
            setUser(currentSession.user);
            console.log('✅ [Auth Debug] User session set:', currentSession.user.email);
            // Create immediate profile from session
            createProfileFromSession(currentSession.user);
          } else {
            console.log('❌ [Auth Debug] Session expired, clearing');
            setSession(null);
            setUser(null);
            setUserProfile(null);
          }
        } else {
          console.log('❌ [Auth Debug] No valid session found');
        }
      } catch (error) {
        log.error('Error in getInitialSession:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Initialize session
    getInitialSession();

    // Listen for auth state changes (only if Supabase is configured)
    if (SUPABASE_URL && SUPABASE_URL !== 'undefined') {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('🔄 [Auth Debug] Auth state changed:', {
            event,
            hasSession: !!newSession,
            hasUser: !!newSession?.user,
            userEmail: newSession?.user?.email,
            currentUserEmail: user?.email
          });

          if (!mounted) return;

          // Prevent clearing session if we already have a valid user and this is just a refresh
          if (event === 'TOKEN_REFRESHED' && user && newSession?.user?.id === user.id) {
            console.log('✅ [Auth Debug] Token refreshed, keeping existing user');
            setSession(newSession);
            return;
          }

          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (newSession?.user) {
            console.log('✅ [Auth Debug] Auth state change - User set:', newSession.user.email);
            // Immediate profile creation - non-blocking
            createProfileFromSession(newSession.user);
          } else {
            console.log('❌ [Auth Debug] Auth state change - No user, clearing profile');
            setUserProfile(null);
          }

          setLoading(false);
        }
      );
      subscription = authSubscription;
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Create profile immediately from session user data
  const createProfileFromSession = (authUser: User) => {
    const profile: UserProfile = {
      id: authUser.id,
      email: authUser.email || 'user@example.com',
      full_name: authUser.user_metadata?.full_name ||
                 authUser.user_metadata?.name ||
                 authUser.email?.split('@')[0] ||
                 'User',
      role: authUser.user_metadata?.role || 'user',
      tenant_id: authUser.user_metadata?.tenant_id || null,
      created_at: authUser.created_at,
      updated_at: new Date().toISOString()
    };

    setUserProfile(profile);
    log.info('Profile created from session:', profile.email);

    // Optional: Fetch from database in background (non-blocking)
    fetchUserProfileInBackground(authUser.id, profile);
  };

  // Background profile fetch - doesn't block login
  const fetchUserProfileInBackground = async (userId: string, fallbackProfile: UserProfile) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        // Update with database profile if available
        setUserProfile(data as UserProfile);
        log.info('Profile updated from database:', data.email);
      } else {
        log.info('Using session-based profile (database profile not found)');
      }
    } catch (error) {
      log.warn('Profile database fetch failed, using session data');
      // Keep using the fallback profile
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      if (!SUPABASE_URL || SUPABASE_URL === 'undefined') {
        // Development mode - clear mock user data
        log.info('Development mode: Clearing mock user data');
        localStorage.removeItem('vital-mock-user');
        localStorage.removeItem('vital-mock-session');
        setUser(null);
        setSession(null);
        setUserProfile(null);
      } else {
        // Production mode - use real Supabase signOut
        const { error } = await supabase.auth.signOut();
        if (error) {
          log.error('Error signing out:', error);
          throw error;
        }
        setUser(null);
        setSession(null);
        setUserProfile(null);
      }
    } catch (error) {
      log.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    userProfile
  };

  // Debug logging for user state
  console.log('🔍 [Auth Debug] AuthContext value:', {
    hasUser: !!user,
    userEmail: user?.email,
    hasSession: !!session,
    hasProfile: !!userProfile,
    loading
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a default context during SSR/static generation
    return {
      user: null,
      session: null,
      loading: true,
      signOut: async () => {},
      userProfile: null
    };
  }
  return context;
}

export default AuthContext;
