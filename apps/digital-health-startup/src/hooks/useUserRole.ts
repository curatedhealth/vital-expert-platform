import { useState, useEffect } from 'react';

import { createClient } from '@vital/sdk/client';

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

      let role: UserRole = 'user';
      let email = user.email || '';
      let full_name: string | undefined;

      // First, try to get role from user_roles table (new multi-tenant system)
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      // Priority 1: Check user_roles table (highest priority - multi-tenant system)
      if (userRoleData?.role) {
        // Keep the role as-is from user_roles table (don't normalize)
        // We'll check for both 'superadmin' and 'super_admin' in the isSuperAdmin/isAdmin functions
        role = (userRoleData.role === 'superadmin' || userRoleData.role === 'super_admin' || userRoleData.role === 'admin')
          ? (userRoleData.role === 'superadmin' ? 'super_admin' : userRoleData.role as UserRole)
          : 'user';
      }

      // Then fetch user profile from profiles table for additional info
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        email = profileData.email || email;
        full_name = profileData.full_name;
        // Only use role from profiles if we didn't find role in user_roles (lower priority)
        if (!userRoleData?.role && profileData.role) {
          role = (profileData.role === 'super_admin' || profileData.role === 'admin') 
            ? profileData.role as UserRole 
            : 'user';
        }
      } else {
        // Fallback to user_profiles table
        const { data: fallbackData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fallbackData) {
          email = fallbackData.email || email;
          full_name = fallbackData.full_name;
          // Only use role from user_profiles if we didn't find role in user_roles or profiles
          if (!userRoleData?.role && fallbackData.role) {
            role = (fallbackData.role === 'super_admin' || fallbackData.role === 'admin')
              ? fallbackData.role as UserRole
              : 'user';
          }
        }
      }

      // Set the user profile
      setUserProfile({
        id: user.id,
        user_id: user.id,
        email,
        full_name,
        role,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      console.log('[useUserRole] Loaded profile:', { 
        email, 
        role, 
        fromUserRoles: !!userRoleData?.role,
        rawRoleFromUserRoles: userRoleData?.role,
        profileRole: profileData?.role,
        isSuperAdminResult: role === 'super_admin' || role === 'superadmin',
        isAdminResult: role === 'admin' || role === 'super_admin' || role === 'superadmin'
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const isSuperAdmin = () => {
    // Check both normalized and raw role formats
    const role = userProfile?.role;
    return role === 'super_admin' || role === 'superadmin';
  };

  const isAdmin = () => {
    // Check both normalized and raw role formats
    const role = userProfile?.role;
    return role === 'admin' || role === 'super_admin' || role === 'superadmin';
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
