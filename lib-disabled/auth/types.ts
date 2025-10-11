import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'super_admin' | 'admin' | 'llm_manager' | 'user' | 'viewer';

export interface UserProfile {
  user_id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string;
  organization_id?: string;
  job_title?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  profile?: UserProfile;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}
