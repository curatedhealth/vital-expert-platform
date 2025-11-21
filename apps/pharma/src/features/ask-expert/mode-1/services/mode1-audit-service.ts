/**
 * Mode 1 Audit Service
 * 
 * Provides audit logging for Mode 1 critical operations
 * Ensures compliance (SOC 2, HIPAA) and security audit trail
 */

import { AuditLogger, AuditAction, AuditSeverity } from '../../../../lib/security/audit-logger';

export interface Mode1AuditContext {
  userId?: string;
  tenantId?: string;
  agentId: string;
  sessionId?: string;
  requestId?: string;
  executionPath?: 'direct' | 'rag' | 'tools' | 'rag+tools';
  cost?: number;
  tokens?: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Mode 1 Audit Service
 * Wraps AuditLogger with Mode 1 specific actions
 */
export class Mode1AuditService {
  private auditLogger: AuditLogger;

  constructor() {
    this.auditLogger = AuditLogger.getInstance();
  }

  /**
   * Log session creation
   */
  async logSessionCreated(context: Mode1AuditContext): Promise<void> {
    await this.auditLogger.log({
      userId: context.userId,
      action: AuditAction.AGENT_EXECUTED, // Use existing action
      resourceType: 'mode1_session',
      resourceId: context.sessionId,
      success: true,
      severity: AuditSeverity.LOW,
      metadata: {
        tenantId: context.tenantId,
        agentId: context.agentId,
        action: 'SESSION_CREATED',
        timestamp: new Date().toISOString(),
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log session end
   */
  async logSessionEnded(context: Mode1AuditContext, stats: {
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
  }): Promise<void> {
    await this.auditLogger.log({
      userId: context.userId,
      action: AuditAction.AGENT_EXECUTED,
      resourceType: 'mode1_session',
      resourceId: context.sessionId,
      success: true,
      severity: AuditSeverity.LOW,
      metadata: {
        tenantId: context.tenantId,
        agentId: context.agentId,
        action: 'SESSION_ENDED',
        stats,
        timestamp: new Date().toISOString(),
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log message save
   */
  async logMessageSaved(context: Mode1AuditContext, messageType: 'user' | 'assistant'): Promise<void> {
    await this.auditLogger.log({
      userId: context.userId,
      action: AuditAction.AGENT_EXECUTED,
      resourceType: 'mode1_message',
      resourceId: context.sessionId,
      success: true,
      severity: AuditSeverity.LOW,
      metadata: {
        tenantId: context.tenantId,
        agentId: context.agentId,
        sessionId: context.sessionId,
        action: 'MESSAGE_SAVED',
        messageType,
        tokens: context.tokens,
        cost: context.cost,
        timestamp: new Date().toISOString(),
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log tool execution
   */
  async logToolExecution(
    context: Mode1AuditContext,
    toolName: string,
    toolInput: Record<string, unknown>,
    toolResult: { success: boolean; error?: string }
  ): Promise<void> {
    await this.auditLogger.log({
      userId: context.userId,
      action: AuditAction.AGENT_EXECUTED,
      resourceType: 'mode1_tool',
      resourceId: toolName,
      success: toolResult.success,
      severity: toolResult.success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
      errorMessage: toolResult.error,
      metadata: {
        tenantId: context.tenantId,
        agentId: context.agentId,
        sessionId: context.sessionId,
        requestId: context.requestId,
        action: 'TOOL_EXECUTED',
        toolName,
        toolInput: this.sanitizeForAudit(toolInput), // Remove sensitive data
        executionPath: context.executionPath,
        timestamp: new Date().toISOString(),
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log agent access
   */
  async logAgentAccess(
    context: Mode1AuditContext,
    success: boolean,
    error?: string
  ): Promise<void> {
    await this.auditLogger.log({
      userId: context.userId,
      action: AuditAction.AGENT_EXECUTED,
      resourceType: 'agent',
      resourceId: context.agentId,
      success,
      severity: success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
      errorMessage: error,
      metadata: {
        tenantId: context.tenantId,
        agentId: context.agentId,
        requestId: context.requestId,
        action: 'AGENT_ACCESSED',
        executionPath: context.executionPath,
        timestamp: new Date().toISOString(),
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log cost tracking
   */
  async logCostTracking(
    context: Mode1AuditContext,
    costDetails: {
      tokens: number;
      cost: number;
      model?: string;
      executionPath?: string;
    }
  ): Promise<void> {
    await this.auditLogger.log({
      userId: context.userId,
      action: AuditAction.AGENT_EXECUTED,
      resourceType: 'mode1_request',
      resourceId: context.requestId,
      success: true,
      severity: AuditSeverity.LOW,
      metadata: {
        tenantId: context.tenantId,
        agentId: context.agentId,
        sessionId: context.sessionId,
        requestId: context.requestId,
        action: 'COST_TRACKED',
        costDetails,
        timestamp: new Date().toISOString(),
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log security violation
   */
  async logSecurityViolation(
    context: Mode1AuditContext,
    violation: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    await this.auditLogger.log({
      userId: context.userId,
      action: AuditAction.SECURITY_VIOLATION,
      resourceType: 'mode1_request',
      resourceId: context.requestId,
      success: false,
      severity: AuditSeverity.CRITICAL,
      errorMessage: violation,
      metadata: {
        tenantId: context.tenantId,
        agentId: context.agentId,
        sessionId: context.sessionId,
        requestId: context.requestId,
        action: 'SECURITY_VIOLATION',
        violation,
        details: this.sanitizeForAudit(details || {}),
        timestamp: new Date().toISOString(),
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  /**
   * Sanitize data for audit logs (remove sensitive information)
   */
  private sanitizeForAudit(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'apiKey', 'secret', 'token', 'authorization', 'credential'];
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}

// Export singleton instance
export const mode1AuditService = new Mode1AuditService();

