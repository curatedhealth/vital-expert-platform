import { createClient } from '@supabase/supabase-js';
import { SecurityAuditLog, UserRole } from '@/types/auth.types';

/**
 * Security Audit Logging Service
 * Implements comprehensive audit logging for compliance with healthcare regulations
 * Supports HIPAA, SOX, and other regulatory requirements
 */

export enum AuditAction {
  // Authentication Actions
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',

  // Authorization Actions
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  FORBIDDEN_ACCESS = 'FORBIDDEN_ACCESS',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ROLE_CHANGED = 'ROLE_CHANGED',

  // LLM Provider Actions
  LLM_PROVIDER_CREATED = 'LLM_PROVIDER_CREATED',
  LLM_PROVIDER_UPDATED = 'LLM_PROVIDER_UPDATED',
  LLM_PROVIDER_DELETED = 'LLM_PROVIDER_DELETED',
  LLM_PROVIDER_ACTIVATED = 'LLM_PROVIDER_ACTIVATED',
  LLM_PROVIDER_DEACTIVATED = 'LLM_PROVIDER_DEACTIVATED',
  LLM_PROVIDER_HEALTH_CHECK = 'LLM_PROVIDER_HEALTH_CHECK',

  // API Key Actions
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_UPDATED = 'API_KEY_UPDATED',
  API_KEY_DELETED = 'API_KEY_DELETED',
  API_KEY_ROTATED = 'API_KEY_ROTATED',
  API_KEY_ACCESSED = 'API_KEY_ACCESSED',
  API_KEY_LEAKED = 'API_KEY_LEAKED',

  // Agent Actions
  AGENT_CREATED = 'AGENT_CREATED',
  AGENT_UPDATED = 'AGENT_UPDATED',
  AGENT_DELETED = 'AGENT_DELETED',
  AGENT_EXECUTED = 'AGENT_EXECUTED',

  // Workflow Actions
  WORKFLOW_CREATED = 'WORKFLOW_CREATED',
  WORKFLOW_UPDATED = 'WORKFLOW_UPDATED',
  WORKFLOW_DELETED = 'WORKFLOW_DELETED',
  WORKFLOW_EXECUTED = 'WORKFLOW_EXECUTED',

  // System Actions
  SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',
  BACKUP_CREATED = 'BACKUP_CREATED',
  BACKUP_RESTORED = 'BACKUP_RESTORED',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_IMPORT = 'DATA_IMPORT',

  // Security Events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  COMPLIANCE_VIOLATION = 'COMPLIANCE_VIOLATION',

  // Admin Actions
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_ASSIGNED = 'USER_ROLE_ASSIGNED',
  ADMIN_ACCESS = 'ADMIN_ACCESS',
  SUPER_ADMIN_ACCESS = 'SUPER_ADMIN_ACCESS'
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AuditLogEntry {
  userId?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  severity?: AuditSeverity;
  errorMessage?: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private supabase!: ReturnType<typeof createClient>;
  private isEnabled: boolean = true;
  private batchSize: number = 100;
  private batchTimeout: number = 5000; // 5 seconds
  private pendingLogs: AuditLogEntry[] = [];
  private batchTimer?: NodeJS.Timeout;

  private constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase configuration missing - audit logging disabled');
      this.isEnabled = false;
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log a single audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      const auditEntry = this.enrichLogEntry(entry);

      // For critical events, log immediately
      if (entry.severity === AuditSeverity.CRITICAL || !entry.success) {
        await this.writeToDatabase([auditEntry]);
      } else {
        // Add to batch for less critical events
        this.addToBatch(auditEntry);
      }
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw error to avoid disrupting application flow
    }
  }

  /**
   * Log multiple audit events
   */
  async logBatch(entries: AuditLogEntry[]): Promise<void> {
    if (!this.isEnabled || entries.length === 0) {
      return;
    }

    try {
      const enrichedEntries = entries.map(entry => this.enrichLogEntry(entry));
      await this.writeToDatabase(enrichedEntries);
    } catch (error) {
      console.error('Failed to log audit batch:', error);
    }
  }

  /**
   * Enrich log entry with additional metadata
   */
  private enrichLogEntry(entry: AuditLogEntry): AuditLogEntry {
    return {
      ...entry,
      timestamp: entry.timestamp || new Date(),
      severity: entry.severity || this.determineSeverity(entry),
      metadata: {
        ...entry.metadata,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      }
    };
  }

  /**
   * Determine severity based on action and success
   */
  private determineSeverity(entry: AuditLogEntry): AuditSeverity {
    if (!entry.success) {
      switch (entry.action) {
        case AuditAction.LOGIN_FAILED:
        case AuditAction.UNAUTHORIZED_ACCESS:
        case AuditAction.FORBIDDEN_ACCESS:
          return AuditSeverity.MEDIUM;
        case AuditAction.SECURITY_VIOLATION:
        case AuditAction.API_KEY_LEAKED:
        case AuditAction.COMPLIANCE_VIOLATION:
          return AuditSeverity.CRITICAL;
        default:
          return AuditSeverity.LOW;
      }
    }

    switch (entry.action) {
      case AuditAction.SUPER_ADMIN_ACCESS:
      case AuditAction.SYSTEM_CONFIG_CHANGED:
      case AuditAction.ROLE_CHANGED:
        return AuditSeverity.HIGH;
      case AuditAction.ADMIN_ACCESS:
      case AuditAction.API_KEY_CREATED:
      case AuditAction.API_KEY_DELETED:
        return AuditSeverity.MEDIUM;
      default:
        return AuditSeverity.LOW;
    }
  }

  /**
   * Add entry to batch processing queue
   */
  private addToBatch(entry: AuditLogEntry): void {
    this.pendingLogs.push(entry);

    if (this.pendingLogs.length >= this.batchSize) {
      this.flushBatch();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushBatch();
      }, this.batchTimeout);
    }
  }

  /**
   * Flush pending logs to database
   */
  private async flushBatch(): Promise<void> {
    if (this.pendingLogs.length === 0) {
      return;
    }

    const logsToWrite = [...this.pendingLogs];
    this.pendingLogs = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    try {
      await this.writeToDatabase(logsToWrite);
    } catch (error) {
      console.error('Failed to flush audit batch:', error);
      // Re-add logs to queue for retry
      this.pendingLogs.unshift(...logsToWrite);
    }
  }

  /**
   * Write audit logs to database
   */
  private async writeToDatabase(entries: AuditLogEntry[]): Promise<void> {
    const dbEntries = entries.map(entry => ({
      user_id: entry.userId || null,
      action: entry.action,
      resource_type: entry.resourceType || null,
      resource_id: entry.resourceId || null,
      old_values: entry.oldValues || null,
      new_values: entry.newValues || null,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
      success: entry.success,
      error_message: entry.errorMessage || null,
      created_at: entry.timestamp || new Date()
    }));

    const { error } = await this.supabase
      .from('security_audit_log' as any)
      .insert(dbEntries as any);

    if (error) {
      throw new Error(`Database write failed: ${error.message}`);
    }
  }

  /**
   * Search audit logs with filters
   */
  async searchLogs(filters: {
    userId?: string;
    action?: AuditAction;
    resourceType?: string;
    success?: boolean;
    startDate?: Date;
    endDate?: Date;
    severity?: AuditSeverity;
    limit?: number;
    offset?: number;
  }): Promise<SecurityAuditLog[]> {
    if (!this.isEnabled) {
      return [];
    }

    let query = this.supabase
      .from('security_audit_log')
      .select('*')
      .order('created_at', { ascending: false });

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
      query = query.gte('created_at', filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to search audit logs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get audit statistics
   */
  async getStatistics(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<{
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    criticalEvents: number;
    topActions: Array<{ action: string; count: number }>;
    userActivity: Array<{ user_id: string; count: number }>;
  }> {
    if (!this.isEnabled) {
      return {
        totalEvents: 0,
        successfulEvents: 0,
        failedEvents: 0,
        criticalEvents: 0,
        topActions: [],
        userActivity: []
      };
    }

    const now = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    // Get basic statistics
    const { data: logs } = await this.supabase
      .from('security_audit_log')
      .select('action, user_id, success')
      .gte('created_at', startDate.toISOString());

    if (!logs) {
      throw new Error('Failed to fetch audit statistics');
    }

    const totalEvents = logs.length;
    const successfulEvents = logs.filter((log: any) => log.success).length;
    const failedEvents = totalEvents - successfulEvents;

    // Critical events (approximate - would need severity column)
    const criticalActions = [
      AuditAction.SECURITY_VIOLATION,
      AuditAction.API_KEY_LEAKED,
      AuditAction.COMPLIANCE_VIOLATION
    ];
    const criticalEvents = logs.filter((log: any) => criticalActions.includes(log.action as AuditAction)).length;

    // Top actions
    const actionCounts = logs.reduce((acc: any, log: any) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count: count as number }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 10);

    // User activity
    const userCounts = logs.reduce((acc: any, log: any) => {
      if (log.user_id) {
        acc[log.user_id] = (acc[log.user_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const userActivity = Object.entries(userCounts)
      .map(([user_id, count]) => ({ user_id, count: count as number }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 10);

    return {
      totalEvents,
      successfulEvents,
      failedEvents,
      criticalEvents,
      topActions,
      userActivity
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<{
    period: string;
    totalEvents: number;
    securityViolations: number;
    failedAccess: number;
    dataAccess: number;
    adminActions: number;
    complianceScore: number;
    recommendations: string[];
  }> {
    const logs = await this.searchLogs({ startDate, endDate, limit: 10000 });

    const securityViolations = logs.filter(log =>
      [AuditAction.SECURITY_VIOLATION, AuditAction.SUSPICIOUS_ACTIVITY, AuditAction.API_KEY_LEAKED]
        .includes(log.action as AuditAction)
    ).length;

    const failedAccess = logs.filter(log =>
      !log.success && [AuditAction.UNAUTHORIZED_ACCESS, AuditAction.FORBIDDEN_ACCESS]
        .includes(log.action as AuditAction)
    ).length;

    const dataAccess = logs.filter((log: any) =>
      [AuditAction.DATA_EXPORT, AuditAction.DATA_IMPORT, AuditAction.LLM_PROVIDER_CREATED]
        .includes(log.action as AuditAction)
    ).length;

    const adminActions = logs.filter((log: any) =>
      [AuditAction.ADMIN_ACCESS, AuditAction.SUPER_ADMIN_ACCESS, AuditAction.ROLE_CHANGED]
        .includes(log.action as AuditAction)
    ).length;

    // Calculate compliance score (0-100)
    const totalEvents = logs.length;
    const violationRate = totalEvents > 0 ? (securityViolations + failedAccess) / totalEvents : 0;
    const complianceScore = Math.max(0, Math.round((1 - violationRate) * 100));

    const recommendations: string[] = [];

    if (securityViolations > 0) {
      recommendations.push('Investigate and address security violations');
    }

    if (failedAccess > totalEvents * 0.05) {
      recommendations.push('Review access controls - high rate of failed access attempts');
    }

    if (adminActions > totalEvents * 0.1) {
      recommendations.push('Monitor administrative actions - consider additional approvals');
    }

    if (complianceScore < 95) {
      recommendations.push('Implement additional security monitoring and controls');
    }

    return {
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalEvents,
      securityViolations,
      failedAccess,
      dataAccess,
      adminActions,
      complianceScore,
      recommendations
    };
  }

  /**
   * Cleanup old audit logs
   */
  async cleanup(retentionDays: number = 365): Promise<number> {
    if (!this.isEnabled) {
      return 0;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { count, error } = await this.supabase
      .from('security_audit_log')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      throw new Error(`Failed to cleanup audit logs: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Ensure batch is flushed on shutdown
   */
  async shutdown(): Promise<void> {
    await this.flushBatch();
  }
}

// Singleton instance
export const auditLogger = AuditLogger.getInstance();

// Convenience methods for common audit events
export const auditLoggers = {
  logLogin: (userId: string, success: boolean, ipAddress?: string, userAgent?: string, errorMessage?: string) =>
    auditLogger.log({
      userId,
      action: success ? AuditAction.LOGIN_SUCCESS : AuditAction.LOGIN_FAILED,
      success,
      ipAddress,
      userAgent,
      errorMessage,
      severity: success ? AuditSeverity.LOW : AuditSeverity.MEDIUM
    }),

  logApiAccess: (userId: string, resourceType: string, resourceId: string, success: boolean, ipAddress?: string) =>
    auditLogger.log({
      userId,
      action: AuditAction.PERMISSION_GRANTED,
      resourceType,
      resourceId,
      success,
      ipAddress,
      severity: AuditSeverity.LOW
    }),

  logSecurityViolation: (userId: string | undefined, action: string, details: string, ipAddress?: string) =>
    auditLogger.log({
      userId,
      action: AuditAction.SECURITY_VIOLATION,
      resourceType: 'security',
      success: false,
      errorMessage: details,
      ipAddress,
      severity: AuditSeverity.CRITICAL
    }),

  logDataAccess: (userId: string, resourceType: string, resourceId: string, operation: 'read' | 'write') =>
    auditLogger.log({
      userId,
      action: operation === 'read' ? AuditAction.DATA_EXPORT : AuditAction.DATA_IMPORT,
      resourceType,
      resourceId,
      success: true,
      severity: AuditSeverity.MEDIUM
    })
};

export default AuditLogger;