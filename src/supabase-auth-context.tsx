'use client';

import { User, Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  userProfile: any;
  error: string | null;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function SupabaseAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Always use mock authentication for pre-production testing
        console.log('🧪 Using mock authentication for pre-production testing');
        const mockUser = {
          id: 'dev-user-123',
          email: 'test@example.com',
          user_metadata: {
            full_name: 'Test User'
          }
        } as User;
        
        const mockSession = {
          user: mockUser,
          access_token: 'dev-token',
          refresh_token: 'dev-refresh-token',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer'
        } as Session;

        setUser(mockUser);
        setSession(mockSession);
        
        // Set mock user profile for testing
        setUserProfile({
          id: 'dev-user-123',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'admin',
          organization: 'Vital Expert',
          avatar_url: null,
          phone: null,
          timezone: 'UTC',
          preferences: {}
        });
        
        console.log('✅ Mock user loaded for pre-production testing');
        setIsInitialized(true);
        setLoading(false);
        return;

        console.log('🌐 Using Supabase authentication');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setError(`Authentication error: ${error.message}`);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
          console.log('✅ Supabase session loaded:', session?.user?.email || 'No user');
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setError(`Initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsInitialized(true);
        setLoading(false);
      }
    };

    getInitialSession();

    // Skip auth state changes in development mode or when using mock auth
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      return;
    }

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setError(null); // Clear any previous errors
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
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // Create a basic profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user?.email,
            full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0],
            role: 'user',
            organization: null,
            avatar_url: null,
            phone: null,
            timezone: 'UTC',
            preferences: {}
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          // Set a default profile even if creation fails
          setUserProfile({
            id: userId,
            email: user?.email,
            full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0],
            role: 'user',
            organization: null,
            avatar_url: null,
            phone: null,
            timezone: 'UTC',
            preferences: {}
          });
        } else {
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Set a default profile even if there's an error
      setUserProfile({
        id: userId,
        email: user?.email,
        full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0],
        role: 'user',
        organization: null,
        avatar_url: null,
        phone: null,
        timezone: 'UTC',
        preferences: {}
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 Signing in user:', email);
      
      // Always use mock authentication for pre-production testing
      console.log('🧪 Using mock authentication for testing');
        
        // Simulate a brief delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser = {
          id: 'dev-user-123',
          email: email.trim(),
          user_metadata: {
            full_name: 'Test User'
          }
        } as User;
        
        const mockSession = {
          user: mockUser,
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer'
        } as Session;

        setUser(mockUser);
        setSession(mockSession);
        
        // Set mock user profile
        setUserProfile({
          id: 'dev-user-123',
          email: email.trim(),
          full_name: 'Test User',
          role: 'admin',
          organization: 'Vital Expert',
          avatar_url: null,
          phone: null,
          timezone: 'UTC',
          preferences: {}
        });
        
        console.log('✅ Mock authentication successful for:', email);
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.error('Sign in error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchUserProfile(data.user.id);
        console.log('✅ Successfully signed in:', data.user.email);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('🔐 Signing out user...');
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setError(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        // Don't throw error, just log it
      } else {
        console.log('✅ Successfully signed out');
      }
      
      // Force redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear local state and redirect
      setUser(null);
      setSession(null);
      setUserProfile(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut,
    clearError,
    userProfile,
    error,
    isInitialized
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
    // Return a default context during SSR/static generation
    return {
      user: null,
      session: null,
      loading: true,
      signIn: async () => {},
      signOut: async () => {},
      clearError: () => {},
      userProfile: null,
      error: null,
      isInitialized: false
    };
  }
  return context;
}

export default AuthContext;
