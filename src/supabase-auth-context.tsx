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
    // AUTH DISABLED FOR TESTING - Always set as logged in
    console.log('🔓 AUTH DISABLED - Auto-logging in for testing');
    
    const mockUser = {
      id: 'test-user-123',
      email: 'test@vitalexpert.com',
      user_metadata: {
        full_name: 'Test User'
      }
    } as User;
    
    const mockSession = {
      user: mockUser,
      access_token: 'test-token',
      refresh_token: 'test-refresh-token',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer'
    } as Session;

    setUser(mockUser);
    setSession(mockSession);
    
    // Set mock user profile for testing
    setUserProfile({
      id: 'test-user-123',
      email: 'test@vitalexpert.com',
      full_name: 'Test User',
      role: 'user',
      organization: 'Vital Expert',
      avatar_url: null,
      phone: null,
      timezone: 'UTC',
      preferences: {}
    });
    
    console.log('✅ Auto-logged in for testing - Auth disabled');
    setIsInitialized(true);
    setLoading(false);
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
    // AUTH DISABLED - Always succeed immediately
    console.log('🔓 AUTH DISABLED - Auto-login successful for:', email);
    return;
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
    // AUTH DISABLED - Return logged in state during SSR/static generation
    return {
      user: {
        id: 'test-user-123',
        email: 'test@vitalexpert.com',
        user_metadata: { full_name: 'Test User' }
      },
      session: {
        user: {
          id: 'test-user-123',
          email: 'test@vitalexpert.com',
          user_metadata: { full_name: 'Test User' }
        },
        access_token: 'test-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer'
      },
      loading: false,
      signIn: async () => {},
      signOut: async () => {},
      clearError: () => {},
      userProfile: {
        id: 'test-user-123',
        email: 'test@vitalexpert.com',
        full_name: 'Test User',
        role: 'user',
        organization: 'Vital Expert',
        avatar_url: null,
        phone: null,
        timezone: 'UTC',
        preferences: {}
      },
      error: null,
      isInitialized: true
    };
  }
  return context;
}

export default AuthContext;
