'use client';

import { createContext, useContext, useEffect, useState } from 'react';
// import { User, Session } from '@supabase/supabase-js';
// import { supabase } from '@vital/sdk/client';

// Temporary types for development
interface User {
  id: string;
  email?: string;
}

interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  userProfile: unknown | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => { /* TODO: implement */ },
  userProfile: null,
});

export const __useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // const __fetchUserProfile = async (user: User) => {
  //   // Temporary mock implementation
  //   return {
  //     user_id: user.id,
  //     email: user.email,
  //     role: 'user',
  //     is_active: true
  //   };
  // };

  useEffect(() => {
    // Simple initialization without Supabase calls that might fail
    const initAuth = async () => {
      try {
        // Set loading to false immediately for now
        // In the future, we can add proper auth initialization here
        setLoading(false);
      } catch (error) {
        // console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signOut = async () => {
    // Temporary mock implementation
    setUser(null);
    setSession(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
