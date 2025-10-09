import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type UserRole = 'super_admin' | 'admin' | 'user';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export function useUserRole() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      // Fetch user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // User doesn't have a profile yet - create default user profile
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.email,
            role: 'user' // Default role
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          setUserProfile(null);
        } else {
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const isSuperAdmin = () => {
    return userProfile?.role === 'super_admin';
  };

  const isAdmin = () => {
    return userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
  };

  const canEditAgent = (agent: any) => {
    if (!userProfile) return false;

    // Super admin can edit everything
    if (isSuperAdmin()) return true;

    // User can only edit their own custom agents (not library agents)
    return agent.created_by === userProfile.user_id &&
           agent.is_custom === true &&
           agent.is_library_agent !== true;
  };

  const canDeleteAgent = (agent: any) => {
    // Same logic as edit for now
    return canEditAgent(agent);
  };

  const canCreateAgent = () => {
    // All authenticated users can create agents
    return userProfile !== null;
  };

  return {
    userProfile,
    loading,
    isSuperAdmin,
    isAdmin,
    canEditAgent,
    canDeleteAgent,
    canCreateAgent,
    refetch: loadUserProfile
  };
}
