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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check if Supabase is configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        
        // Use mock authentication if Supabase is not properly configured
        const useMockAuth = !supabaseUrl || supabaseUrl === 'undefined' || 
                           supabaseUrl.includes('xazinxsiglqokwfmogyk') ||
                           localStorage.getItem('vital-use-mock-auth') === 'true';
        
        if (useMockAuth) {
          console.log('⚠️ Supabase not configured, checking for mock user in localStorage');
          
          // Check for existing mock user in localStorage
          const mockUserData = localStorage.getItem('vital-mock-user');
          const mockSessionData = localStorage.getItem('vital-mock-session');
          
          if (mockUserData && mockSessionData) {
            try {
              const mockUser = JSON.parse(mockUserData) as User;
              const mockSession = JSON.parse(mockSessionData) as Session;
              setUser(mockUser);
              setSession(mockSession);
              console.log('✅ Mock user loaded from localStorage:', mockUser.email);
            } catch (error) {
              console.error('Error parsing mock user data:', error);
              // Fallback to default mock user
              const mockUser = {
                id: 'mock-user-1',
                email: 'dev@vitalexpert.com',
                user_metadata: { name: 'Development User' }
              } as User;
              setUser(mockUser);
              setSession({ user: mockUser } as Session);
            }
          } else {
            // No mock user found, create a default development user
            console.log('No mock user found, creating default development user');
            const defaultUser = {
              id: 'dev-user-1',
              email: 'dev@vitalexpert.com',
              user_metadata: { name: 'Development User' }
            } as User;
            setUser(defaultUser);
            setSession({ user: defaultUser } as Session);
          }
          setLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes (only if Supabase is configured)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let subscription: any = null;
    
    if (supabaseUrl) {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
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
      subscription = authSubscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
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
      
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xazinxsiglqokwfmogyk.supabase.co';
      
      if (!supabaseUrl || supabaseUrl === 'undefined') {
        // Development mode - clear mock user data
        console.log('🔧 Development mode: Clearing mock user data');
        localStorage.removeItem('vital-mock-user');
        localStorage.removeItem('vital-mock-session');
        setUser(null);
        setSession(null);
        setUserProfile(null);
      } else {
        // Production mode - use real Supabase signOut
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Sign out error:', error);
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
