'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
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
            role: 'user'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
        } else {
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
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
    signOut,
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
      signOut: async () => {},
      userProfile: null,
      error: null,
      isInitialized: false
    };
  }
  return context;
}

export default AuthContext;
