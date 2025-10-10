import { createClient } from '@supabase/supabase-js';
import { AuditLogger, AuditAction, AuditSeverity } from '@/lib/security/audit-logger';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'super_admin' | 'admin' | 'manager' | 'user' | 'viewer';
  department: string | null;
  organization: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  organization?: string;
  department?: string;
}

export interface UserPagination {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}

export interface UserResponse {
  data: UserProfile[];
  pagination: UserPagination;
}

export class UserManagementService {
  private supabase;
  private auditLogger: AuditLogger;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.auditLogger = AuditLogger.getInstance();
  }

  /**
   * Get current user's profile and role
   */
  async getCurrentUser(): Promise<{ user: any; profile: UserProfile | null; isSuperAdmin: boolean }> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: profile, error: profileError } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      throw new Error('User profile not found');
    }

    const isSuperAdmin = profile.role === 'super_admin';

    return { user, profile, isSuperAdmin };
  }

  /**
   * Get users with filters and pagination
   */
  async getUsers(
    filters: UserFilters = {},
    pagination: Omit<UserPagination, 'total' | 'totalPages'> = { page: 1, limit: 50 }
  ): Promise<UserResponse> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
    }

    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters.organization) {
      query = query.eq('organization', filters.organization);
    }

    if (filters.department) {
      query = query.eq('department', filters.department);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  /**
   * Update user role
   */
  async updateUserRole(
    userId: string, 
    newRole: string, 
    currentUserId: string
  ): Promise<void> {
    const { profile: currentProfile, isSuperAdmin } = await this.getCurrentUser();
    
    if (!currentProfile) {
      throw new Error('Current user profile not found');
    }

    // Check permissions
    if (newRole === 'super_admin' && !isSuperAdmin) {
      throw new Error('Only super admins can assign super admin role');
    }

    // Get current user data for audit
    const currentUser = await this.getUserById(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    const oldRole = currentUser.role;

    // Update user role
    const { error } = await this.supabase
      .from('user_profiles')
      .update({ 
        role: newRole,
        updated_by: currentUserId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }

    // Log audit event
    await this.auditLogger.log({
      action: AuditAction.USER_ROLE_ASSIGNED,
      resourceType: 'user_profile',
      resourceId: userId,
      oldValues: { role: oldRole },
      newValues: { role: newRole },
      success: true,
      severity: AuditSeverity.MEDIUM,
      metadata: {
        updatedBy: currentUserId,
        userEmail: currentUser.email
      }
    });
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(
    userId: string, 
    isActive: boolean, 
    currentUserId: string
  ): Promise<void> {
    const { profile: currentProfile, isSuperAdmin } = await this.getCurrentUser();
    
    if (!currentProfile) {
      throw new Error('Current user profile not found');
    }

    // Get current user data for audit
    const currentUser = await this.getUserById(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    const oldStatus = currentUser.is_active;

    // Update user status
    const { error } = await this.supabase
      .from('user_profiles')
      .update({ 
        is_active: isActive,
        updated_by: currentUserId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }

    // Log audit event
    await this.auditLogger.log({
      action: isActive ? AuditAction.USER_UPDATED : AuditAction.USER_DELETED,
      resourceType: 'user_profile',
      resourceId: userId,
      oldValues: { is_active: oldStatus },
      newValues: { is_active: isActive },
      success: true,
      severity: AuditSeverity.MEDIUM,
      metadata: {
        updatedBy: currentUserId,
        userEmail: currentUser.email,
        action: isActive ? 'user_activated' : 'user_deactivated'
      }
    });
  }

  /**
   * Get filter options for dropdowns
   */
  async getFilterOptions() {
    const [rolesResult, organizationsResult, departmentsResult] = await Promise.all([
      this.supabase
        .from('user_profiles')
        .select('role')
        .not('role', 'is', null),
      this.supabase
        .from('user_profiles')
        .select('organization')
        .not('organization', 'is', null),
      this.supabase
        .from('user_profiles')
        .select('department')
        .not('department', 'is', null)
    ]);

    const roles = [...new Set(rolesResult.data?.map(item => item.role) || [])].sort();
    const organizations = [...new Set(organizationsResult.data?.map(item => item.organization) || [])].sort();
    const departments = [...new Set(departmentsResult.data?.map(item => item.department) || [])].sort();

    return {
      roles,
      organizations,
      departments
    };
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('role, is_active, created_at');

    if (error) {
      throw new Error(`Failed to fetch user stats: ${error.message}`);
    }

    const total = data?.length || 0;
    const active = data?.filter(user => user.is_active).length || 0;
    const inactive = total - active;

    // Group by role
    const roleCounts = data?.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Group by organization
    const orgCounts = data?.reduce((acc, user) => {
      const org = user.organization || 'Unknown';
      acc[org] = (acc[org] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      total,
      active,
      inactive,
      roleCounts,
      orgCounts
    };
  }
}
