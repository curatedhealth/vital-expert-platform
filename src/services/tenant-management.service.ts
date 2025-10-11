import { createClient } from '@supabase/supabase-js';

import { AuditLogger, AuditAction, AuditSeverity } from '@/lib/security/audit-logger';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  subscription_tier: 'starter' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'trial' | 'cancelled';
  trial_ends_at: string | null;
  max_projects: number;
  max_users: number;
  settings: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  business_function_id: string | null;
  parent_department_id: string | null;
  hipaa_required: boolean;
  gdpr_required: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  business_function_name?: string;
  parent_department_name?: string;
}

export interface BusinessFunction {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrgRole {
  id: string;
  name: string;
  description: string | null;
  business_function_id: string | null;
  department_id: string | null;
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'principal' | 'executive';
  required_skills: string[];
  salary_range: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  business_function_name?: string;
  department_name?: string;
}

export interface TenantStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalUsers: number;
  totalDepartments: number;
  totalRoles: number;
  subscriptionBreakdown: Record<string, number>;
}

export interface TenantFilters {
  search?: string;
  subscriptionTier?: string;
  subscriptionStatus?: string;
  isActive?: boolean;
}

export interface TenantPagination {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}

export interface TenantResponse {
  data: Organization[];
  pagination: TenantPagination;
}

export class TenantManagementService {
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
  async getCurrentUser(): Promise<{ user: any; profile: any; isSuperAdmin: boolean }> {
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
   * Get organizations with filters and pagination
   */
  async getOrganizations(
    filters: TenantFilters = {},
    pagination: Omit<TenantPagination, 'total' | 'totalPages'> = { page: 1, limit: 50 }
  ): Promise<TenantResponse> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('organizations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
    }

    if (filters.subscriptionTier) {
      query = query.eq('subscription_tier', filters.subscriptionTier);
    }

    if (filters.subscriptionStatus) {
      query = query.eq('subscription_status', filters.subscriptionStatus);
    }

    if (filters.isActive !== undefined) {
      query = query.eq('subscription_status', filters.isActive ? 'active' : 'inactive');
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch organizations: ${error.message}`);
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
   * Create new organization
   */
  async createOrganization(
    orgData: Omit<Organization, 'id' | 'created_at' | 'updated_at'>,
    currentUserId: string
  ): Promise<Organization> {
    const { data, error } = await this.supabase
      .from('organizations')
      .insert({
        ...orgData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create organization: ${error.message}`);
    }

    // Log audit event
    await this.auditLogger.log({
      action: AuditAction.USER_CREATED, // Using existing action for org creation
      resourceType: 'organization',
      resourceId: data.id,
      newValues: {
        name: orgData.name,
        subscription_tier: orgData.subscription_tier,
        max_users: orgData.max_users,
        max_projects: orgData.max_projects
      },
      success: true,
      severity: AuditSeverity.MEDIUM,
      metadata: {
        createdBy: currentUserId,
        action: 'organization_created'
      }
    });

    return data;
  }

  /**
   * Update organization
   */
  async updateOrganization(
    orgId: string,
    updates: Partial<Organization>,
    currentUserId: string
  ): Promise<Organization> {
    // Get current org for audit
    const { data: currentOrg, error: fetchError } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (fetchError || !currentOrg) {
      throw new Error('Organization not found');
    }

    const { data, error } = await this.supabase
      .from('organizations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', orgId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update organization: ${error.message}`);
    }

    // Log audit event
    await this.auditLogger.log({
      action: AuditAction.USER_UPDATED,
      resourceType: 'organization',
      resourceId: orgId,
      oldValues: currentOrg,
      newValues: updates,
      success: true,
      severity: AuditSeverity.MEDIUM,
      metadata: {
        updatedBy: currentUserId,
        action: 'organization_updated'
      }
    });

    return data;
  }

  /**
   * Get departments with business function info
   */
  async getDepartments(): Promise<Department[]> {
    const { data, error } = await this.supabase
      .from('departments')
      .select(`
        *,
        business_functions!inner(name),
        parent_department:departments!parent_department_id(name)
      `)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch departments: ${error.message}`);
    }

    return data?.map(dept => ({
      ...dept,
      business_function_name: dept.business_functions?.name,
      parent_department_name: dept.parent_department?.name
    })) || [];
  }

  /**
   * Get business functions
   */
  async getBusinessFunctions(): Promise<BusinessFunction[]> {
    const { data, error } = await this.supabase
      .from('business_functions')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch business functions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get organizational roles
   */
  async getOrgRoles(): Promise<OrgRole[]> {
    const { data, error } = await this.supabase
      .from('org_roles')
      .select(`
        *,
        business_functions!inner(name),
        departments!inner(name)
      `)
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch organizational roles: ${error.message}`);
    }

    return data?.map(role => ({
      ...role,
      business_function_name: role.business_functions?.name,
      department_name: role.departments?.name
    })) || [];
  }

  /**
   * Get tenant statistics
   */
  async getTenantStats(): Promise<TenantStats> {
    const [orgsResult, usersResult, deptsResult, rolesResult] = await Promise.all([
      this.supabase.from('organizations').select('subscription_tier, subscription_status'),
      this.supabase.from('user_profiles').select('id'),
      this.supabase.from('departments').select('id'),
      this.supabase.from('org_roles').select('id')
    ]);

    const organizations = orgsResult.data || [];
    const users = usersResult.data || [];
    const departments = deptsResult.data || [];
    const roles = rolesResult.data || [];

    const subscriptionBreakdown = organizations.reduce((acc, org) => {
      acc[org.subscription_tier] = (acc[org.subscription_tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeOrganizations = organizations.filter(org => org.subscription_status === 'active').length;

    return {
      totalOrganizations: organizations.length,
      activeOrganizations,
      totalUsers: users.length,
      totalDepartments: departments.length,
      totalRoles: roles.length,
      subscriptionBreakdown
    };
  }

  /**
   * Invite user to organization
   */
  async inviteUser(
    email: string,
    organizationId: string,
    role: string,
    departmentId?: string,
    currentUserId: string
  ): Promise<void> {
    // This would typically integrate with an email service
    // For now, we'll just log the invitation
    
    await this.auditLogger.log({
      action: AuditAction.USER_CREATED,
      resourceType: 'user_invitation',
      resourceId: organizationId,
      newValues: {
        email,
        organization_id: organizationId,
        role,
        department_id: departmentId
      },
      success: true,
      severity: AuditSeverity.LOW,
      metadata: {
        invitedBy: currentUserId,
        action: 'user_invited'
      }
    });

    // In a real implementation, you would:
    // 1. Create invitation record
    // 2. Send email with invitation link
    // 3. Handle invitation acceptance flow
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(orgId: string): Promise<Organization | null> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Organization not found
      }
      throw new Error(`Failed to fetch organization: ${error.message}`);
    }

    return data;
  }
}
