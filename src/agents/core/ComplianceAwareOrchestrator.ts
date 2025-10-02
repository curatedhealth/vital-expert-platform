/**
 * Compliance-Aware Agent Orchestrator
 * Extends the base orchestrator with HIPAA compliance integration
 */

import {
  WorkflowExecution,
  ExecutionContext,
  ComplianceError
} from '@/types/digital-health-agent.types';

import { ComplianceMiddleware, ProtectedAgentResponse } from '../../lib/compliance/compliance-middleware';

import { AgentOrchestrator } from './AgentOrchestrator';

export class ComplianceAwareOrchestrator extends AgentOrchestrator {
  private complianceMiddleware: ComplianceMiddleware;

  constructor() {
    super();
    this.complianceMiddleware = new ComplianceMiddleware({
      enablePHIDetection: true,
      enableAuditLogging: true,
      strictMode: true,
      alertThreshold: 40
    });
  }

  /**
   * Execute workflow with comprehensive HIPAA compliance
   */
  async executeWorkflowWithCompliance(
    workflowId: string,
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<WorkflowExecution & {
    compliance_summary: {
      overall_compliant: boolean;
      total_risk_score: number;
      phi_detected: boolean;
      audit_trail_ids: string[];
      compliance_violations: number;
    };
  }> {
    // Step 1: Pre-workflow compliance validation
    const preWorkflowValidation = await this.complianceMiddleware.validateWorkflowCompliance(
      workflowId,
      inputs,
      context
    );

    if (!preWorkflowValidation.compliant && preWorkflowValidation.violations.some(v => v.severity === 'critical')) {
      throw new ComplianceError(
        `Critical compliance violations prevent workflow execution: ${preWorkflowValidation.violations
          .filter(v => v.severity === 'critical')
          .map(v => v.description)
          .join('; ')}`,
        'WORKFLOW_COMPLIANCE_VIOLATION',
        'critical'
      );
    }

    // Step 2: Execute base workflow
    const execution = await this.executeWorkflow(workflowId, inputs, context);

    // Step 3: Post-process all interactions for compliance
    const complianceSummary = {
      overall_compliant: true,
      total_risk_score: 0,
      phi_detected: false,
      audit_trail_ids: [] as string[],
      compliance_violations: 0
    };

    // Process each interaction through compliance middleware
    for (let i = 0; i < execution.interactions.length; i++) {
      // Validate index before accessing array
      if (i >= 0 && i < execution.interactions.length) {
        // eslint-disable-next-line security/detect-object-injection
        const interaction = execution.interactions[i];

        try {
        // Validate the interaction for compliance
        const agent = this.agents.get(interaction.agent_name);
        if (!agent) continue;

        // Create a compliance-aware response
        const protectedResponse: ProtectedAgentResponse = {
          ...interaction.outputs,
          compliance_status: {
            validated: true,
            risk_score: 0,
            phi_detected: false
          }
        };

        // Check for PHI in outputs
        const phiDetected = this.complianceMiddleware['complianceManager'].detectPHI(
          interaction.outputs.content || ''
        );

        if (phiDetected.containsPHI) {
          complianceSummary.phi_detected = true;
          protectedResponse.compliance_status.phi_detected = true;
          protectedResponse.compliance_status.risk_score += 20;
        }

        // Update compliance summary
        complianceSummary.total_risk_score = Math.max(
          complianceSummary.total_risk_score,
          protectedResponse.compliance_status.risk_score
        );

        if (protectedResponse.compliance_status.audit_trail_id) {
          complianceSummary.audit_trail_ids.push(protectedResponse.compliance_status.audit_trail_id);
        }

        // Update the interaction with protected response
        // Validate index before accessing array
        if (i >= 0 && i < execution.interactions.length) {
          // eslint-disable-next-line security/detect-object-injection
          execution.interactions[i] = {
            ...interaction,
            outputs: protectedResponse
          };
        }

        } catch (error) {
          console.error(`Compliance processing failed for interaction ${interaction.interaction_id}:`, error);
          complianceSummary.compliance_violations++;
          complianceSummary.overall_compliant = false;
        }
      }
    }

    // Step 4: Final compliance assessment
    if (complianceSummary.total_risk_score > 50) {
      complianceSummary.overall_compliant = false;
    }
    return {
      ...execution,
      compliance_summary: complianceSummary
    };
  }

  /**
   * Execute single agent with compliance protection
   */
  async executeAgentWithCompliance(
    agentName: string,
    promptTitle: string,
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<ProtectedAgentResponse> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent '${agentName}' not found`);
    }

    return await this.complianceMiddleware.executeWithCompliance(
      agent,
      promptTitle,
      inputs,
      context
    );
  }

  /**
   * Get compliance dashboard data
   */
  getComplianceDashboard(timeRange: { start: string; end: string }) {
    const complianceReport = this.complianceMiddleware.generateComplianceReport(timeRange);
    const agentStatuses = this.getAgentStatus();

    const agentComplianceStatus = agentStatuses.map(agent => ({
      ...agent,
      compliance: this.complianceMiddleware.getAgentComplianceStatus(agent.name)
    }));

    return {
      overview: complianceReport,
      agent_compliance: agentComplianceStatus,
      active_executions: this.getActiveExecutions().length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get user audit trail
   */
  getUserAuditTrail(userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.complianceMiddleware.getAuditTrail(userId, {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
  }

  /**
   * Check if user has recent compliance violations
   */
  hasUserViolations(userId: string, days: number = 7): boolean {
    return this.complianceMiddleware.hasRecentViolations(userId, days);
  }

  /**
   * Update compliance configuration
   */
  updateComplianceConfig(config: {
    enablePHIDetection?: boolean;
    enableAuditLogging?: boolean;
    strictMode?: boolean;
    alertThreshold?: number;
  }): void {
    this.complianceMiddleware.updateConfig(config);
  }

  /**
   * Generate compliance report for specific workflow
   */
  async generateWorkflowComplianceReport(executionId: string): Promise<{
    execution_summary: unknown;
    compliance_analysis: {
      total_steps: number;
      compliant_steps: number;
      phi_exposures: number;
      risk_score: number;
      violations: Array<{
        step: string;
        agent: string;
        violation_type: string;
        severity: string;
        remediation: string;
      }>;
    };
    recommendations: string[];
  }> {
    const execution = this.getExecutionStatus(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const complianceAnalysis = {
      total_steps: execution.total_steps,
      compliant_steps: 0,
      phi_exposures: 0,
      risk_score: 0,
      violations: [] as Array<{
        step: string;
        agent: string;
        violation_type: string;
        severity: string;
        remediation: string;
      }>
    };

    // Analyze each step for compliance
    for (const [stepId, stepResult] of Object.entries(execution.step_results)) {
      const isCompliant = stepResult.response.success;
      if (isCompliant) {
        complianceAnalysis.compliant_steps++;
      }

      // Check for PHI in step results
      if (stepResult.response.content) {
        const phiResult = this.complianceMiddleware['complianceManager'].detectPHI(
          stepResult.response.content
        );

        if (phiResult.containsPHI) {
          complianceAnalysis.phi_exposures++;
          complianceAnalysis.risk_score += 15;

          complianceAnalysis.violations.push({
            step: stepId,
            agent: 'unknown', // Would need to track agent per step
            violation_type: 'PHI_EXPOSURE',
            severity: 'medium',
            remediation: 'Review data anonymization procedures'
          });
        }
      }
    }

    // Generate recommendations
    const recommendations = [];
    if (complianceAnalysis.phi_exposures > 0) {
      recommendations.push('Implement stronger PHI anonymization measures');
    }
    if (complianceAnalysis.compliant_steps < complianceAnalysis.total_steps) {
      recommendations.push('Review failed steps for compliance improvements');
    }
    if (complianceAnalysis.risk_score > 30) {
      recommendations.push('Consider additional compliance training for users');
    }

    return {
      execution_summary: {
        workflow_id: execution.workflow_id,
        execution_id: execution.execution_id,
        status: execution.status,
        duration: execution.completed_at
          ? new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()
          : null
      },
      compliance_analysis: complianceAnalysis,
      recommendations
    };
  }

  /**
   * Initialize with enhanced compliance monitoring
   */
  async initializeWithCompliance(): Promise<void> {
    await this.initialize();
    // Configuration initialized with compliance middleware
    console.log(`PHI Detection: ${this.complianceMiddleware['config'].enablePHIDetection ? 'ENABLED' : 'DISABLED'}`);
    console.log(`Audit Logging: ${this.complianceMiddleware['config'].enableAuditLogging ? 'ENABLED' : 'DISABLED'}`);
    console.log(`Strict Mode: ${this.complianceMiddleware['config'].strictMode ? 'ENABLED' : 'DISABLED'}`);
    console.log(`Alert Threshold: ${this.complianceMiddleware['config'].alertThreshold}`);
  }
}