'use client';

import { User, Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

export const sanitizeDisplayName = (
  candidate: string | null | undefined,
  fallbackEmail?: string | null,
): string => {
  const trimmed = candidate?.trim();
  if (!trimmed) {
    return fallbackEmail?.split('@')[0] || 'User';
  }

  const normalized = trimmed.toLowerCase();
  if (['anonymous', 'anonymous user', 'user'].includes(normalized)) {
    return fallbackEmail?.split('@')[0] || 'User';
  }

  return trimmed;
};

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

interface Organization {
  id: string;
  name: string;
  slug: string;
  tenant_type: string;
  tenant_key: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  userProfile: UserProfile | null;
  organization: Organization | null;
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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  // Use the singleton Supabase client instance (created once per browser session)
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    let mounted = true;
    let subscription: ReturnType<ReturnType<typeof supabase.auth.onAuthStateChange>> | null = null;

    const getInitialSession = async () => {
      try {
        const debugEnabled = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_AUTH_DEBUG === 'true';
        if (debugEnabled) {
          console.debug('🚀 [Auth Debug] getInitialSession - Starting session check');
          console.debug('🚀 [Auth Debug] Supabase URL configured:', !!SUPABASE_URL);
          console.debug('🚀 [Auth Debug] Is Production:', IS_PRODUCTION);
        }

        // Production: Don't allow mock auth unless explicitly in development
        const useMockAuth =
          !IS_PRODUCTION &&
          (!SUPABASE_URL ||
           SUPABASE_URL === 'undefined' ||
           SUPABASE_URL === 'YOUR_SUPABASE_URL');

        if (useMockAuth) {
          console.log('⚠️  [Auth Debug] Using mock auth (Supabase not configured)');
          log.warn('Supabase configuration missing; authentication disabled in this environment.');
          if (mounted) {
            setUser(null);
            setSession(null);
            setUserProfile(null);
            setOrganization(null);
            setLoading(false);
          }
          return;
        }

        // Production: Real Supabase authentication
        if (debugEnabled) {
          console.debug('🔑 [Auth Debug] Calling supabase.auth.getSession()...');
        }
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (debugEnabled) {
          console.debug('🔑 [Auth Debug] getSession() returned:', { hasSession: !!currentSession, errorMsg: error?.message });
          console.debug('🔍 [Auth Debug] getInitialSession - Session check:', {
          hasSession: !!currentSession,
          hasUser: !!currentSession?.user,
          userId: currentSession?.user?.id,
          userEmail: currentSession?.user?.email,
          error: error?.message,
          sessionExpiry: currentSession?.expires_at,
          expiresAtDate: currentSession?.expires_at ? new Date(currentSession.expires_at * 1000).toISOString() : null,
          nowDate: new Date().toISOString(),
          isExpired: currentSession?.expires_at ? currentSession.expires_at <= Math.floor(Date.now() / 1000) : null,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          isProduction: IS_PRODUCTION,
          userMetadata: currentSession?.user?.user_metadata
          });
        }

        if (error) {
          log.error('Error getting session:', error);
        } else if (mounted && currentSession?.user) {
          // Check if session is still valid
          const now = Math.floor(Date.now() / 1000);
          const expiresAt = currentSession.expires_at || 0;
          
          if (expiresAt > now) {
            setSession(currentSession);
            setUser(currentSession.user);
            if (debugEnabled) {
              console.debug('✅ [Auth Debug] User session set:', currentSession.user.email);
            }
            // Create immediate profile from session
            createProfileFromSession(currentSession.user);
          } else {
            if (debugEnabled) {
              console.debug('❌ [Auth Debug] Session expired, clearing');
            }
            setSession(null);
            setUser(null);
            setUserProfile(null);
            setOrganization(null);
          }
        } else {
          if (debugEnabled) {
            console.debug('❌ [Auth Debug] No valid session found');
          }
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
          const debugEnabled = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_AUTH_DEBUG === 'true';
          if (debugEnabled) {
            console.debug('🔄 [Auth Debug] Auth state changed:', {
              event,
              hasSession: !!newSession,
              hasUser: !!newSession?.user,
              userEmail: newSession?.user?.email,
              currentUserEmail: user?.email
            });
          }

          if (!mounted) return;

          // Prevent clearing session if we already have a valid user and this is just a refresh
          if (event === 'TOKEN_REFRESHED' && user && newSession?.user?.id === user.id) {
            if (debugEnabled) {
              console.debug('✅ [Auth Debug] Token refreshed, keeping existing user');
            }
            setSession(newSession);
            return;
          }

          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (newSession?.user) {
            if (debugEnabled) {
              console.debug('✅ [Auth Debug] Auth state change - User set:', newSession.user.email);
            }
            // Immediate profile creation - non-blocking
            createProfileFromSession(newSession.user);
          } else {
            if (debugEnabled) {
              console.debug('❌ [Auth Debug] Auth state change - No user, clearing profile');
            }
            setUserProfile(null);
            setOrganization(null);
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
    const debugEnabled = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_AUTH_DEBUG === 'true';
    if (debugEnabled) {
      console.debug('📝 [Auth Debug] Creating profile from session for user:', authUser.id, authUser.email);
    }

    const primaryEmail =
      authUser.email ||
      authUser.user_metadata?.email ||
      authUser.user_metadata?.preferred_username ||
      authUser.user_metadata?.user_name ||
      authUser.user_metadata?.login ||
      '';

    const resolvedFullName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.user_metadata?.display_name ||
      authUser.user_metadata?.preferred_username ||
      authUser.user_metadata?.user_name ||
      primaryEmail.split('@')[0] ||
      'User';

    const profile: UserProfile = {
      id: authUser.id,
      email: primaryEmail || 'user@example.com',
      full_name: resolvedFullName,
      role: authUser.user_metadata?.role || 'user',
      tenant_id: authUser.user_metadata?.tenant_id || null,
      created_at: authUser.created_at,
      updated_at: new Date().toISOString(),
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
        // Merge database profile with session data, prioritizing database values
        const mergedProfile: UserProfile = {
          ...fallbackProfile,
          ...data,
          // Ensure we have a proper name
          full_name:
            data.full_name ||
            fallbackProfile.full_name ||
            data.email?.split('@')[0] ||
            fallbackProfile.email?.split('@')[0] ||
            'User',
        };
        setUserProfile(mergedProfile);
        log.info('Profile updated from database:', mergedProfile.email, 'Name:', mergedProfile.full_name);
      } else {
        log.info('Using session-based profile (database profile not found)');
      }

      // NOTE: For panel testing and simplified local development, we skip
      // organization lookups from the `users` table entirely. This avoids
      // hitting strict RLS on `public.users` and allows the app to function
      // without a configured organization_id.
      //
      // If you later need full multi-tenant org support, you can re‑enable
      // the organization fetch with a dedicated feature flag.
    } catch (error) {
      log.warn('Profile/Organization database fetch failed, using session data');
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
        setOrganization(null);
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
        setOrganization(null);
      }

      // Redirect to login page after successful sign out
      router.push('/login');
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
    userProfile,
    organization
  };

  // Debug logging for user state (only in development and when explicitly enabled)
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_AUTH_DEBUG === 'true') {
    console.debug('🔍 [Auth Debug] AuthContext value:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasSession: !!session,
      hasProfile: !!userProfile,
      loading
    });
  }

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
      userProfile: null,
      organization: null
    };
  }
  return context;
}

export default AuthContext;
