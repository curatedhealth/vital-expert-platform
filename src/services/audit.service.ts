import { createClient } from '@supabase/supabase-js';

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resourceType?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AuditLogPagination {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}

export interface AuditLogResponse {
  data: AuditLogEntry[];
  pagination: AuditLogPagination;
}

export class AuditService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Get audit logs with filters and pagination
   */
  async getAuditLogs(
    filters: AuditLogFilters = {},
    pagination: Omit<AuditLogPagination, 'total' | 'totalPages'> = { page: 1, limit: 50 }
  ): Promise<AuditLogResponse> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('security_audit_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.resourceType) {
      query = query.eq('resource_type', filters.resourceType);
    }

    if (filters.success !== undefined) {
      query = query.eq('success', filters.success);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters.search) {
      query = query.or(`action.ilike.%${filters.search}%,resource_type.ilike.%${filters.search}%,resource_id.ilike.%${filters.search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
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
   * Get unique values for filter dropdowns
   */
  async getFilterOptions() {
    const [actionsResult, resourceTypesResult] = await Promise.all([
      this.supabase
        .from('security_audit_log')
        .select('action')
        .not('action', 'is', null),
      this.supabase
        .from('security_audit_log')
        .select('resource_type')
        .not('resource_type', 'is', null)
    ]);

    const actions = [...new Set(actionsResult.data?.map(item => item.action) || [])].sort();
    const resourceTypes = [...new Set(resourceTypesResult.data?.map(item => item.resource_type) || [])].sort();

    return {
      actions,
      resourceTypes
    };
  }

  /**
   * Get audit log statistics
   */
  async getAuditStats(startDate?: string, endDate?: string) {
    let query = this.supabase
      .from('security_audit_log')
      .select('action, success, created_at');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Security audit log table not found, returning empty stats:', error.message);
      return {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0,
        topActions: [],
        hourlyStats: []
      };
    }

    const total = data?.length || 0;
    const successful = data?.filter(item => item.success).length || 0;
    const failed = total - successful;

    // Group by action
    const actionCounts = data?.reduce((acc, item) => {
      acc[item.action] = (acc[item.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      actionCounts
    };
  }

  /**
   * Export audit logs to CSV format
   */
  async exportToCSV(filters: AuditLogFilters = {}): Promise<string> {
    const response = await this.getAuditLogs(filters, { page: 1, limit: 10000 }); // Large limit for export
    
    if (response.data.length === 0) {
      return 'No data to export';
    }

    const headers = [
      'ID',
      'User ID',
      'Action',
      'Resource Type',
      'Resource ID',
      'Success',
      'IP Address',
      'User Agent',
      'Error Message',
      'Created At'
    ];

    const rows = response.data.map(entry => [
      entry.id,
      entry.user_id || '',
      entry.action,
      entry.resource_type || '',
      entry.resource_id || '',
      entry.success ? 'Yes' : 'No',
      entry.ip_address || '',
      entry.user_agent || '',
      entry.error_message || '',
      entry.created_at
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }
}
