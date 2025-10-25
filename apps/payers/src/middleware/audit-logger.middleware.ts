/**
 * VITAL Path Audit Logger Middleware
 * Comprehensive audit logging for healthcare compliance and security monitoring
 */

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  type: AuditEventType;
  category: AuditCategory;
  severity: AuditSeverity;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  requestId?: string;
  data: Record<string, unknown>;
  outcome: 'success' | 'failure' | 'warning';
  processingTime?: number;
}

type AuditEventType =
  | 'API_REQUEST'
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'DATA_ACCESS'
  | 'PHI_ACCESS'
  | 'MEDICAL_QUERY'
  | 'AGENT_INTERACTION'
  | 'COMPLIANCE_CHECK'
  | 'SECURITY_EVENT'
  | 'SYSTEM_ERROR'
  | 'MEDICAL_SAFETY'
  | 'HIPAA_VALIDATION';

type AuditCategory =
  | 'SECURITY'
  | 'COMPLIANCE'
  | 'MEDICAL'
  | 'SYSTEM'
  | 'USER_ACTIVITY'
  | 'DATA_PROCESSING';

type AuditSeverity =
  | 'INFO'
  | 'WARNING'
  | 'ERROR'
  | 'CRITICAL';

class HealthcareAuditLogger {
  private logBuffer: AuditLogEntry[] = [];
  private readonly bufferSize = 100;
  private readonly flushInterval = 30000; // 30 seconds

  constructor() {
    // Start periodic flush
    setInterval(() => this.flush(), this.flushInterval);

    // Flush on process exit
    process.on('beforeExit', () => this.flush());
    process.on('SIGINT', () => this.flush());
    process.on('SIGTERM', () => this.flush());
  }

  // API Request Logging
  async logAPIRequest(
    outcome: 'success' | 'failure' | 'warning',
    data: {
      requestId: string;
      userId?: string;
      sessionId?: string;
      ip?: string;
      userAgent?: string;
      path: string;
      method: string;
      agentType?: string;
      riskLevel?: string;
      processingTime: number;
      responseSize?: number;
      errorCode?: number;
    }
  ): Promise<void> {
    await this.log({
      type: 'API_REQUEST',
      category: 'USER_ACTIVITY',
      severity: outcome === 'failure' ? 'ERROR' : 'INFO',
      userId: data.userId,
      sessionId: data.sessionId,
      ip: data.ip,
      userAgent: data.userAgent,
      endpoint: data.path,
      method: data.method,
      requestId: data.requestId,
      processingTime: data.processingTime,
      outcome,
      data: {
        agentType: data.agentType,
        riskLevel: data.riskLevel,
        responseSize: data.responseSize,
        errorCode: data.errorCode
      }
    });
  }

  // Authentication Events
  async logAuthenticationEvent(
    outcome: 'success' | 'failure',
    data: {
      userId?: string;
      ip?: string;
      userAgent?: string;
      method: string;
      reason?: string;
      mfaRequired?: boolean;
      sessionId?: string;
    }
  ): Promise<void> {
    await this.log({
      type: 'AUTHENTICATION',
      category: 'SECURITY',
      severity: outcome === 'failure' ? 'WARNING' : 'INFO',
      userId: data.userId,
      sessionId: data.sessionId,
      ip: data.ip,
      userAgent: data.userAgent,
      outcome,
      data: {
        authMethod: data.method,
        failureReason: data.reason,
        mfaRequired: data.mfaRequired
      }
    });
  }

  // Security Events
  async logSecurityEvent(
    eventType: 'AUTH_FAILURE' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY' | 'INTRUSION_ATTEMPT',
    data: {
      requestId?: string;
      userId?: string;
      ip?: string;
      path?: string;
      reason?: string;
      limit?: number;
      current?: number;
      blocked?: boolean;
    }
  ): Promise<void> {
    await this.log({
      type: 'SECURITY_EVENT',
      category: 'SECURITY',
      severity: data.blocked ? 'ERROR' : 'WARNING',
      userId: data.userId,
      ip: data.ip,
      endpoint: data.path,
      requestId: data.requestId,
      outcome: data.blocked ? 'failure' : 'warning',
      data: {
        eventType,
        reason: data.reason,
        rateLimit: data.limit,
        currentCount: data.current,
        blocked: data.blocked
      }
    });
  }

  // HIPAA Compliance Events
  async logComplianceViolation(
    violationType: 'HIPAA_VIOLATION' | 'PHI_EXPOSURE' | 'UNAUTHORIZED_ACCESS',
    data: {
      requestId: string;
      userId?: string;
      violations?: string[];
      phiTypes?: string[];
      endpoint?: string;
      sanitized?: boolean;
    }
  ): Promise<void> {
    await this.log({
      type: 'COMPLIANCE_CHECK',
      category: 'COMPLIANCE',
      severity: 'CRITICAL',
      userId: data.userId,
      endpoint: data.endpoint,
      requestId: data.requestId,
      outcome: 'failure',
      data: {
        violationType,
        violations: data.violations,
        phiTypes: data.phiTypes,
        sanitized: data.sanitized
      }
    });
  }

  // Medical Safety Events
  async logMedicalSafetyAlert(
    alertType: 'SAFETY_CONCERN' | 'EMERGENCY_DETECTED' | 'MEDICATION_INTERACTION' | 'CRITICAL_ALERT',
    data: {
      requestId: string;
      userId?: string;
      concerns?: string[];
      riskLevel: string;
      requiresReview?: boolean;
      agentType?: string;
      medicalDomain?: string;
    }
  ): Promise<void> {
    await this.log({
      type: 'MEDICAL_SAFETY',
      category: 'MEDICAL',
      severity: data.riskLevel === 'critical' ? 'CRITICAL' : 'WARNING',
      userId: data.userId,
      requestId: data.requestId,
      outcome: 'warning',
      data: {
        alertType,
        concerns: data.concerns,
        riskLevel: data.riskLevel,
        requiresSpecialistReview: data.requiresReview,
        agentType: data.agentType,
        medicalDomain: data.medicalDomain
      }
    });
  }

  // Medical Query Logging
  async logMedicalQuery(data: {
    requestId: string;
    userId?: string;
    agentType: string;
    query: string;
    responseTime: number;
    confidenceScore?: number;
    citations?: string[];
    warningsGenerated?: string[];
    outcome: 'success' | 'failure';
  }): Promise<void> {
    await this.log({
      type: 'MEDICAL_QUERY',
      category: 'MEDICAL',
      severity: 'INFO',
      userId: data.userId,
      requestId: data.requestId,
      processingTime: data.responseTime,
      outcome: data.outcome,
      data: {
        agentType: data.agentType,
        queryLength: data.query.length,
        confidenceScore: data.confidenceScore,
        citationCount: data.citations?.length || 0,
        warningCount: data.warningsGenerated?.length || 0,
        hasHighRiskContent: data.warningsGenerated && data.warningsGenerated.length > 0
      }
    });
  }

  // Agent Interaction Logging
  async logAgentInteraction(data: {
    requestId: string;
    userId?: string;
    agentType: string;
    collaborationMode: boolean;
    agentCount?: number;
    consensusLevel?: number;
    processingTime: number;
    outcome: 'success' | 'failure' | 'warning';
  }): Promise<void> {
    await this.log({
      type: 'AGENT_INTERACTION',
      category: 'USER_ACTIVITY',
      severity: 'INFO',
      userId: data.userId,
      requestId: data.requestId,
      processingTime: data.processingTime,
      outcome: data.outcome,
      data: {
        agentType: data.agentType,
        collaborationMode: data.collaborationMode,
        agentCount: data.agentCount,
        consensusLevel: data.consensusLevel
      }
    });
  }

  // PHI Access Logging
  async logPHIAccess(data: {
    requestId: string;
    userId: string;
    patientId?: string;
    dataType: string;
    accessReason: string;
    authorized: boolean;
    minimumNecessary: boolean;
  }): Promise<void> {
    await this.log({
      type: 'PHI_ACCESS',
      category: 'COMPLIANCE',
      severity: data.authorized ? 'INFO' : 'ERROR',
      userId: data.userId,
      requestId: data.requestId,
      outcome: data.authorized ? 'success' : 'failure',
      data: {
        patientId: data.patientId,
        dataType: data.dataType,
        accessReason: data.accessReason,
        authorized: data.authorized,
        minimumNecessary: data.minimumNecessary
      }
    });
  }

  // System Error Logging
  async logSystemError(
    errorType: 'MIDDLEWARE_ERROR' | 'DATABASE_ERROR' | 'API_ERROR' | 'INTEGRATION_ERROR',
    data: {
      requestId?: string;
      error: string;
      stack?: string;
      path?: string;
      userId?: string;
      processingTime?: number;
    }
  ): Promise<void> {
    await this.log({
      type: 'SYSTEM_ERROR',
      category: 'SYSTEM',
      severity: 'ERROR',
      userId: data.userId,
      endpoint: data.path,
      requestId: data.requestId,
      processingTime: data.processingTime,
      outcome: 'failure',
      data: {
        errorType,
        errorMessage: data.error,
        stackTrace: data.stack
      }
    });
  }

  // Core logging method
  private async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const logEntry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      ...entry
    };

    // Add to buffer
    this.logBuffer.push(logEntry);

    // Flush if buffer is full or this is a critical event
    if (this.logBuffer.length >= this.bufferSize || entry.severity === 'CRITICAL') {
      await this.flush();
    }

    // Also log critical events immediately to console
    if (entry.severity === 'CRITICAL') {
      // console.error('CRITICAL AUDIT EVENT:', logEntry);
    }
  }

  // Flush logs to persistent storage
  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    this.logBuffer = [];

    try {
      // In production, send to multiple destinations:
      // 1. Database for querying
      // 2. External SIEM for security monitoring
      // 3. HIPAA audit log service
      // 4. File system for backup

      await this.persistToDatabse(logsToFlush);
      await this.sendToSIEM(logsToFlush);
      await this.writeToFileSystem(logsToFlush);

      // Also send critical events to monitoring service

      if (criticalLogs.length > 0) {
        await this.sendToMonitoringService(criticalLogs);
      }

    } catch (error) {
      // console.error('Failed to flush audit logs:', error);

      // Re-add logs to buffer on failure (but prevent infinite growth)
      if (this.logBuffer.length < this.bufferSize * 2) {
        this.logBuffer.unshift(...logsToFlush);
      }
    }
  }

  private async persistToDatabse(logs: AuditLogEntry[]): Promise<void> {
    // Implementation would insert logs into audit database table
    // For now, log to console in development
    if (process.env.NODE_ENV === 'development') {
      logs.forEach(log => {
        // ,
        //   userId: log.userId,
        //   endpoint: log.endpoint,
        //   outcome: log.outcome,
        //   data: log.data
        // });
      });
    }
  }

  private async sendToSIEM(logs: AuditLogEntry[]): Promise<void> {
    // Implementation would send logs to Security Information and Event Management system
    // e.g., Splunk, ELK Stack, or cloud-based SIEM
  }

  private async writeToFileSystem(logs: AuditLogEntry[]): Promise<void> {
    // Implementation would write logs to rotating file system for backup
    // Important for HIPAA compliance - must retain logs for required period
  }

  private async sendToMonitoringService(logs: AuditLogEntry[]): Promise<void> {
    // Implementation would send critical events to monitoring service
    // e.g., PagerDuty, DataDog, or custom alerting system
  }

  private generateLogId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods for querying logs (would query database in production)
  async searchLogs(criteria: {
    startTime?: Date;
    endTime?: Date;
    userId?: string;
    type?: AuditEventType;
    severity?: AuditSeverity;
    endpoint?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    // Implementation would query database
    return [];
  }

  async getComplianceReport(timeRange: { start: Date; end: Date }): Promise<{
    totalEvents: number;
    hipaaViolations: number;
    securityEvents: number;
    criticalAlerts: number;
    userActivity: Record<string, number>;
  }> {
    // Implementation would generate compliance report from database
    return {
      totalEvents: 0,
      hipaaViolations: 0,
      securityEvents: 0,
      criticalAlerts: 0,
      userActivity: { /* TODO: implement */ }
    };
  }
}

// Create singleton instance
export const __auditLogger = new HealthcareAuditLogger();

// Export types for use in other modules
export type {
  AuditLogEntry,
  AuditEventType,
  AuditCategory,
  AuditSeverity
};
export { HealthcareAuditLogger };