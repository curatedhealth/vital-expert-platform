/**
 * HIPAA Compliance Middleware
 * Integrates compliance checks into agent execution pipeline
 */

import { HIPAAComplianceManager, DataProcessingRequest, ComplianceValidationResult } from './hipaa-compliance';
import { DigitalHealthAgent } from '../../agents/core/DigitalHealthAgent';
import {
  AgentResponse,
  ExecutionContext,
  ComplianceLevel,
  ComplianceError
} from '@/types/digital-health-agent.types';

export interface ComplianceMiddlewareConfig {
  enablePHIDetection: boolean;
  enableAuditLogging: boolean;
  strictMode: boolean; // Blocks non-compliant operations
  alertThreshold: number; // Risk score threshold for alerts
}

export interface ProtectedAgentResponse extends AgentResponse {
  compliance_status: {
    validated: boolean;
    risk_score: number;
    phi_detected: boolean;
    audit_trail_id?: string;
    redacted_content?: string;
  };
}

export class ComplianceMiddleware {
  private complianceManager: HIPAAComplianceManager;
  private config: ComplianceMiddlewareConfig;

  constructor(config: Partial<ComplianceMiddlewareConfig> = {}) {
    this.complianceManager = new HIPAAComplianceManager();
    this.config = {
      enablePHIDetection: true,
      enableAuditLogging: true,
      strictMode: true,
      alertThreshold: 50,
      ...config
    };
  }

  /**
   * Wrap agent execution with compliance checks
   */
  async executeWithCompliance(
    agent: DigitalHealthAgent,
    promptTitle: string,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<ProtectedAgentResponse> {
    const agentConfig = agent.getConfig();

    // Step 1: Pre-execution compliance validation
    const preExecutionRequest: DataProcessingRequest = {
      user_id: context.user_id,
      resource_type: 'agent',
      resource_id: agentConfig.name,
      action: 'execute',
      purpose: `Execute ${promptTitle} prompt for healthcare analysis`,
      data_content: inputs,
      context
    };

    console.log(`🔒 Validating HIPAA compliance for: ${agentConfig.display_name}`);

    let validationResult: ComplianceValidationResult;
    try {
      validationResult = await this.complianceManager.validateCompliance(preExecutionRequest);
    } catch (error) {
      console.error('❌ Compliance validation failed:', error);
      throw new ComplianceError(
        `Compliance validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'VALIDATION_FAILED',
        'critical'
      );
    }

    // Step 2: Handle compliance violations
    if (!validationResult.compliant && this.config.strictMode) {
      const criticalViolations = validationResult.violations.filter(v => v.severity === 'critical');
      if (criticalViolations.length > 0) {
        const violationMessages = criticalViolations.map(v => v.description).join('; ');

        // Create compliance record for blocked access
        await this.complianceManager.createComplianceRecord(preExecutionRequest, validationResult);

        throw new ComplianceError(
          `Critical HIPAA violations detected: ${violationMessages}`,
          'COMPLIANCE_VIOLATION',
          'critical'
        );
      }
    }

    // Step 3: Sanitize inputs if PHI detected
    let sanitizedInputs = inputs;
    let phiDetected = false;

    if (this.config.enablePHIDetection) {
      const phiResult = this.complianceManager.detectPHI(inputs);
      if (phiResult.containsPHI) {
        phiDetected = true;
        console.warn(`⚠️  PHI detected in inputs: ${phiResult.phiTypes.join(', ')}`);

        if (this.config.strictMode && agentConfig.metadata.compliance_level === ComplianceLevel.CRITICAL) {
          // For critical compliance agents, redact PHI
          try {
            sanitizedInputs = JSON.parse(phiResult.redactedContent || '{}');
            console.log(`🔒 PHI redacted for critical compliance agent`);
          } catch {
            sanitizedInputs = { ...inputs, _phi_redacted: true };
          }
        }
      }
    }

    // Step 4: Execute agent with sanitized inputs
    console.log(`🤖 Executing agent: ${agentConfig.display_name}`);

    let agentResponse: AgentResponse;
    try {
      agentResponse = await agent.executePrompt(promptTitle, sanitizedInputs, context);
    } catch (error) {
      console.error(`❌ Agent execution failed: ${agentConfig.display_name}`, error);

      // Log failed execution for compliance
      const failedValidationResult: ComplianceValidationResult = {
        compliant: false,
        violations: [{
          type: 'EXECUTION_FAILED',
          severity: 'high',
          description: `Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          remediation: 'Review agent configuration and inputs'
        }],
        riskScore: 30,
        recommendations: ['Investigate execution failure', 'Review error logs']
      };

      await this.complianceManager.createComplianceRecord(preExecutionRequest, failedValidationResult);
      throw error;
    }

    // Step 5: Post-execution compliance validation
    const postExecutionRequest: DataProcessingRequest = {
      user_id: context.user_id,
      resource_type: 'data',
      resource_id: `output_${agentConfig.name}`,
      action: 'read',
      purpose: `Review output from ${promptTitle}`,
      data_content: agentResponse.content,
      context
    };

    const outputValidation = await this.complianceManager.validateCompliance(postExecutionRequest);

    // Step 6: Sanitize output if needed
    let sanitizedResponse = agentResponse;
    let outputRedacted = false;

    if (this.config.enablePHIDetection && agentResponse.content) {
      const outputPhiResult = this.complianceManager.detectPHI(agentResponse.content);
      if (outputPhiResult.containsPHI) {
        console.warn(`⚠️  PHI detected in agent output: ${outputPhiResult.phiTypes.join(', ')}`);

        if (this.config.strictMode) {
          sanitizedResponse = {
            ...agentResponse,
            content: outputPhiResult.redactedContent || agentResponse.content
          };
          outputRedacted = true;
        }
      }
    }

    // Step 7: Create compliance record
    const finalValidationResult: ComplianceValidationResult = {
      compliant: validationResult.compliant && outputValidation.compliant,
      violations: [...validationResult.violations, ...outputValidation.violations],
      riskScore: Math.max(validationResult.riskScore, outputValidation.riskScore),
      recommendations: [...validationResult.recommendations, ...outputValidation.recommendations]
    };

    const complianceRecord = await this.complianceManager.createComplianceRecord(
      preExecutionRequest,
      finalValidationResult
    );

    // Step 8: Generate alerts if needed
    if (finalValidationResult.riskScore >= this.config.alertThreshold) {
      await this.generateComplianceAlert(
        agentConfig.name,
        context.user_id,
        finalValidationResult,
        complianceRecord.audit_trail_id
      );
    }

    // Step 9: Return protected response
    const protectedResponse: ProtectedAgentResponse = {
      ...sanitizedResponse,
      compliance_status: {
        validated: true,
        risk_score: finalValidationResult.riskScore,
        phi_detected: phiDetected || outputRedacted,
        audit_trail_id: complianceRecord.audit_trail_id,
        redacted_content: outputRedacted ? agentResponse.content : undefined
      }
    };

    console.log(`✅ Compliance validation complete: Risk Score ${finalValidationResult.riskScore}`);

    return protectedResponse;
  }

  /**
   * Generate compliance alert
   */
  private async generateComplianceAlert(
    agentName: string,
    userId: string,
    validationResult: ComplianceValidationResult,
    auditTrailId: string
  ): Promise<void> {
    const alert = {
      timestamp: new Date().toISOString(),
      type: 'COMPLIANCE_RISK',
      severity: validationResult.riskScore >= 80 ? 'CRITICAL' : 'HIGH',
      message: `High-risk compliance event detected for agent ${agentName}`,
      details: {
        user_id: userId,
        agent_name: agentName,
        risk_score: validationResult.riskScore,
        violations: validationResult.violations,
        audit_trail_id: auditTrailId
      }
    };

    // In production, send to monitoring system, security team, etc.
    console.warn(`🚨 COMPLIANCE ALERT:`, alert);

    // Log to compliance manager for reporting
    // Could integrate with external alerting systems (Slack, PagerDuty, etc.)
  }

  /**
   * Validate workflow compliance before execution
   */
  async validateWorkflowCompliance(
    workflowId: string,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<ComplianceValidationResult> {
    const request: DataProcessingRequest = {
      user_id: context.user_id,
      resource_type: 'data',
      resource_id: workflowId,
      action: 'execute',
      purpose: `Execute workflow ${workflowId}`,
      data_content: inputs,
      context
    };

    return await this.complianceManager.validateCompliance(request);
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(timeRange: { start: string; end: string }) {
    return this.complianceManager.generateComplianceReport(timeRange);
  }

  /**
   * Get audit trail for user
   */
  getAuditTrail(userId: string, timeRange?: { start: string; end: string }) {
    const auditLog = this.complianceManager.getAuditLog(timeRange);
    return auditLog.filter(entry => entry.user_id === userId);
  }

  /**
   * Check if user has compliance violations
   */
  hasRecentViolations(userId: string, days: number = 7): boolean {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentRecords = this.complianceManager.getComplianceRecords(userId);
    return recentRecords.some(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate > cutoffDate && !record.authorization_basis.includes('Compliant');
    });
  }

  /**
   * Get compliance status for agent
   */
  getAgentComplianceStatus(agentName: string): {
    totalExecutions: number;
    compliantExecutions: number;
    averageRiskScore: number;
    lastViolation?: string;
  } {
    const auditLog = this.complianceManager.getAuditLog();
    const agentExecutions = auditLog.filter(entry =>
      entry.agent_name === agentName || entry.action.includes(agentName)
    );

    const totalExecutions = agentExecutions.length;
    const compliantExecutions = agentExecutions.filter(entry => entry.success).length;

    // Mock risk score calculation - in production, track actual risk scores
    const averageRiskScore = compliantExecutions === totalExecutions ? 10 : 25;

    const lastViolation = agentExecutions
      .filter(entry => !entry.success)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    return {
      totalExecutions,
      compliantExecutions,
      averageRiskScore,
      lastViolation: lastViolation?.timestamp
    };
  }

  /**
   * Update compliance configuration
   */
  updateConfig(newConfig: Partial<ComplianceMiddlewareConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log(`🔒 Compliance configuration updated:`, this.config);
  }

  /**
   * Get current compliance configuration
   */
  getConfig(): ComplianceMiddlewareConfig {
    return { ...this.config };
  }
}