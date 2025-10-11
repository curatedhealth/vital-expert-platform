import { createClient } from '@supabase/supabase-js';

import { UserRole, PermissionScope, PermissionAction, hasPermission } from '@/lib/auth/unified-roles';

export class PermissionService {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Check if a user has a specific permission
   */
  static hasPermission(
    role: UserRole, 
    scope: PermissionScope, 
    action: PermissionAction
  ): boolean {
    return hasPermission(role, scope, action);
  }

  /**
   * Validate permission for a user by fetching their role from database
   */
  static async validatePermission(
    userId: string,
    scope: PermissionScope,
    action: PermissionAction
  ): Promise<boolean> {
    try {
      // Fetch user role from database
      const { data: userProfile, error } = await this.supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !userProfile) {
        console.error('Failed to fetch user profile:', error);
        return false;
      }

      // Check permission using role
      const hasAccess = this.hasPermission(
        userProfile.role as UserRole, 
        scope, 
        action
      );

      // Log permission check for audit
      await this.logPermissionCheck(userId, scope, action, hasAccess);

      return hasAccess;
    } catch (error) {
      console.error('Permission validation error:', error);
      return false;
    }
  }

  /**
   * Get all permissions for a specific role
   */
  static getRolePermissions(role: UserRole): string[] {
    const permissions: string[] = [];
    
    // Check all scope/action combinations
    Object.values(PermissionScope).forEach(scope => {
      Object.values(PermissionAction).forEach(action => {
        if (this.hasPermission(role, scope, action)) {
          permissions.push(`${scope}:${action}`);
        }
      });
    });

    return permissions;
  }

  /**
   * Check if user can access a specific resource
   */
  static async canAccessResource(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: PermissionAction
  ): Promise<boolean> {
    try {
      // Map resource types to permission scopes
      const scopeMap: Record<string, PermissionScope> = {
        'agent': PermissionScope.AGENTS,
        'workflow': PermissionScope.WORKFLOWS,
        'project': PermissionScope.PROJECTS,
        'knowledge': PermissionScope.KNOWLEDGE,
        'user': PermissionScope.USER_MANAGEMENT,
        'organization': PermissionScope.ORGANIZATIONS,
        'clinical': PermissionScope.CLINICAL
      };

      const scope = scopeMap[resourceType];
      if (!scope) {
        return false;
      }

      // Check basic permission
      const hasBasicPermission = await this.validatePermission(userId, scope, action);
      if (!hasBasicPermission) {
        return false;
      }

      // Check resource-specific access (organization isolation)
      const { data: userProfile } = await this.supabase
        .from('user_profiles')
        .select('organization_id, role')
        .eq('user_id', userId)
        .single();

      if (!userProfile) {
        return false;
      }

      // Super admins can access all resources
      if (userProfile.role === UserRole.SUPER_ADMIN) {
        return true;
      }

      // Check if resource belongs to user's organization
      const { data: resource } = await this.supabase
        .from(resourceType + 's') // Pluralize resource type
        .select('organization_id')
        .eq('id', resourceId)
        .single();

      if (!resource) {
        return false;
      }

      return resource.organization_id === userProfile.organization_id;
    } catch (error) {
      console.error('Resource access check error:', error);
      return false;
    }
  }

  /**
   * Get user's effective permissions
   */
  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const { data: userProfile } = await this.supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (!userProfile) {
        return [];
      }

      return this.getRolePermissions(userProfile.role as UserRole);
    } catch (error) {
      console.error('Get user permissions error:', error);
      return [];
    }
  }

  /**
   * Check if user has admin privileges
   */
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data: userProfile } = await this.supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (!userProfile) {
        return false;
      }

      return [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(userProfile.role as UserRole);
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  }

  /**
   * Check if user is super admin
   */
  static async isSuperAdmin(userId: string): Promise<boolean> {
    try {
      const { data: userProfile } = await this.supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (!userProfile) {
        return false;
      }

      return userProfile.role === UserRole.SUPER_ADMIN;
    } catch (error) {
      console.error('Super admin check error:', error);
      return false;
    }
  }

  /**
   * Log permission check for audit trail
   */
  private static async logPermissionCheck(
    userId: string,
    scope: PermissionScope,
    action: PermissionAction,
    granted: boolean
  ): Promise<void> {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'permission_check',
          resource_type: 'permission',
          resource_id: `${scope}:${action}`,
          success: granted,
          metadata: {
            scope,
            action,
            granted,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Failed to log permission check:', error);
    }
  }

  /**
   * Validate API key permissions
   */
  static async validateApiKeyPermission(
    apiKey: string,
    scope: PermissionScope,
    action: PermissionAction
  ): Promise<boolean> {
    try {
      const { data: keyData } = await this.supabase
        .from('api_keys')
        .select('permissions, is_active')
        .eq('key_hash', apiKey)
        .eq('is_active', true)
        .single();

      if (!keyData) {
        return false;
      }

      const permissions = keyData.permissions || [];
      const permissionString = `${scope}:${action}`;

      return permissions.includes('*:*') || 
             permissions.includes(`${scope}:*`) || 
             permissions.includes(permissionString);
    } catch (error) {
      console.error('API key permission validation error:', error);
      return false;
    }
  }

  /**
   * Get organization-scoped permissions
   */
  static async getOrganizationPermissions(
    userId: string,
    organizationId: string
  ): Promise<string[]> {
    try {
      const { data: userProfile } = await this.supabase
        .from('user_profiles')
        .select('role, organization_id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (!userProfile) {
        return [];
      }

      // Check if user belongs to the organization
      if (userProfile.organization_id !== organizationId) {
        return [];
      }

      return this.getRolePermissions(userProfile.role as UserRole);
    } catch (error) {
      console.error('Organization permissions error:', error);
      return [];
    }
  }
}
