/**
 * VITAL Path Core Integration Layer
 * Orchestrates all Phase 1 enhancement systems
 */

import { EventEmitter } from 'events';

import { ComplianceFramework, ComplianceContext } from './compliance/ComplianceFramework';
import { ObservabilitySystem } from './monitoring/ObservabilitySystem';
import { MultiModelOrchestrator } from './orchestration/MultiModelOrchestrator';
import { EnhancedRAGSystem } from './rag/EnhancedRAGSystem';
import { LangGraphWorkflowEngine } from './workflows/LangGraphWorkflowEngine';

// Core Integration Types
export interface VitalPathRequest {
  id: string;
  type: 'query' | 'workflow' | 'analysis' | 'compliance_check';
  query: string;
  userId?: string;
  userRole?: string;
  domain: string;
  context?: {
    urgency: 'low' | 'normal' | 'high' | 'critical';
    complexity: 'simple' | 'moderate' | 'complex';
    dataType: 'PHI' | 'PII' | 'clinical_data' | 'device_data' | 'research_data' | 'public';
    location?: string;
    sessionId?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface VitalPathResponse {
  id: string;
  requestId: string;
  success: boolean;
  response?: string;
  workflowId?: string;
  evidence?: unknown[];
  metrics: {
    processingTime: number;
    llmLatency?: number;
    ragLatency?: number;
    workflowLatency?: number;
    complianceLatency?: number;
    totalCost?: number;
    providerUsed?: string;
  };
  compliance: {
    compliant: boolean;
    violations: unknown[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  traceId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface SystemHealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    orchestrator: 'healthy' | 'degraded' | 'unhealthy';
    rag: 'healthy' | 'degraded' | 'unhealthy';
    workflows: 'healthy' | 'degraded' | 'unhealthy';
    observability: 'healthy' | 'degraded' | 'unhealthy';
    compliance: 'healthy' | 'degraded' | 'unhealthy';
  };
  metrics: {
    activeRequests: number;
    queuedWorkflows: number;
    complianceRate: number;
    averageLatency: number;
  };
  timestamp: Date;
}

// Main VITAL Path Core System
export class VitalPathCore extends EventEmitter {
  private orchestrator!: MultiModelOrchestrator;
  private ragSystem!: EnhancedRAGSystem;
  private workflowEngine!: LangGraphWorkflowEngine;
  private observability!: ObservabilitySystem;
  private compliance!: ComplianceFramework;

  private activeRequests: Map<string, VitalPathRequest> = new Map();
  private requestMetrics: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializeSystems();
    this.setupEventHandling();
  }

  private initializeSystems(): void {
    this.orchestrator = new MultiModelOrchestrator({
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
      fallbackStrategy: 'sequential',
      maxRetries: 3,
      defaultTimeout: 30000
    });
    this.ragSystem = new EnhancedRAGSystem({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      openaiApiKey: process.env.OPENAI_API_KEY!
    });
    this.workflowEngine = new LangGraphWorkflowEngine();
    this.observability = new ObservabilitySystem(
      require('@supabase/supabase-js').createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
    );
    this.compliance = new ComplianceFramework(
      require('@supabase/supabase-js').createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
    );

    this.emit('systemsInitialized');
  }

  private setupEventHandling(): void {
    // Monitor system health
    this.orchestrator.on('providerError', (error) => {
      this.observability.metrics.incrementCounter('provider_errors', {
        provider: error.provider,
        error_type: error.type
      });
    });

    this.workflowEngine.on('workflowFailed', (event) => {
      this.observability.metrics.incrementCounter('workflow_failures', {
        workflow: event.state.name,
        error: event.error
      });
    });

    this.compliance.on('complianceViolation', (event) => {
      this.observability.metrics.incrementCounter('compliance_violations', {
        rule: event.rule.id,
        severity: event.result.riskLevel
      });
    });

    // Performance monitoring
    this.orchestrator.on('queryProcessed', (result) => {
      this.observability.metrics.recordHistogram('llm_latency', result.latency, {
        provider: result.provider,
        model: result.model
      });
    });

    this.ragSystem.on('retrievalCompleted', (result) => {
      this.observability.metrics.recordHistogram('rag_latency', result.latency, {
        query_type: result.strategy,
        documents_found: result.documents.length.toString()
      });
    });

    this.emit('eventHandlingSetup');
  }

  // Main Processing Method
  async processRequest(request: VitalPathRequest): Promise<VitalPathResponse> {

    try {
      // Store active request
      this.activeRequests.set(request.id, request);
      this.observability.metrics.incrementCounter('requests_total', {
        type: request.type,
        domain: request.domain
      });

      // Create compliance context
      const complianceContext: ComplianceContext = {
        operation: request.type,
        userId: request.userId,
        userRole: request.userRole,
        dataType: request.context?.dataType || 'public',
        location: request.context?.location,
        timestamp: new Date(),
        metadata: request.metadata
      };

      // Step 1: Compliance Pre-Check

        'compliance_check', 'compliance-framework', traceId
      );

        compliant: complianceViolations.length === 0,
        violations: complianceViolations,
        riskLevel: this.calculateRiskLevel(complianceResults)
      };

      this.observability.tracing.finishSpan(complianceSpan, 'ok');

      // Block critical compliance violations
      if (overallCompliance.riskLevel === 'critical') {
        throw new Error(`Critical compliance violations detected: ${
          complianceViolations.filter(v => v.severity === 'critical')
            .map(v => v.description).join(', ')
        }`);
      }

      let response: VitalPathResponse;

      // Route based on request type
      switch (request.type) {
        case 'query':
          response = await this.processQuery(request, traceId, overallCompliance);
          break;

        case 'workflow':
          response = await this.processWorkflow(request, traceId, overallCompliance);
          break;

        case 'analysis':
          response = await this.processAnalysis(request, traceId, overallCompliance);
          break;

        case 'compliance_check':
          response = await this.processComplianceCheck(request, traceId, overallCompliance);
          break;

        default:
          throw new Error(`Unknown request type: ${request.type}`);
      }

      // Calculate final metrics

      response.metrics.processingTime = processingTime;

      // Record success metrics
      this.observability.metrics.recordHistogram('request_duration', processingTime, {
        type: request.type,
        domain: request.domain,
        success: 'true'
      });

      // Log audit trail
      await this.compliance.auditTrail.logEvent({
        userId: request.userId || 'anonymous',
        userRole: request.userRole || 'user',
        operation: request.type,
        resource: request.domain,
        outcome: 'success',
        complianceFlags: {
          hipaa: request.context?.dataType === 'PHI',
          gdpr: request.context?.dataType === 'PII',
          fda21cfr11: request.context?.dataType === 'clinical_data'
        },
        metadata: {
          requestId: request.id,
          processingTime,
          complianceStatus: overallCompliance
        }
      });

      this.observability.tracing.finishSpan(traceId, 'ok');
      this.activeRequests.delete(request.id);

      return response;

    } catch (error) {

      // Record failure metrics
      this.observability.metrics.recordHistogram('request_duration', processingTime, {
        type: request.type,
        domain: request.domain,
        success: 'false'
      });

      this.observability.metrics.incrementCounter('request_errors', {
        type: request.type,
        domain: request.domain,
        error_type: error instanceof Error ? error.constructor.name : 'unknown'
      });

      // Log audit trail for failure
      await this.compliance.auditTrail.logEvent({
        userId: request.userId || 'anonymous',
        userRole: request.userRole || 'user',
        operation: request.type,
        resource: request.domain,
        outcome: 'failure',
        complianceFlags: {
          hipaa: request.context?.dataType === 'PHI',
          gdpr: request.context?.dataType === 'PII',
          fda21cfr11: request.context?.dataType === 'clinical_data'
        },
        metadata: {
          requestId: request.id,
          error: errorMessage,
          processingTime
        }
      });

      this.observability.tracing.finishSpan(traceId, 'error', errorMessage);
      this.activeRequests.delete(request.id);

      return {
        id: this.generateResponseId(),
        requestId: request.id,
        success: false,
        metrics: { processingTime },
        compliance: {
          compliant: false,
          violations: [{ type: 'processing_error', description: errorMessage, severity: 'high' }],
          riskLevel: 'high'
        },
        traceId,
        timestamp: new Date(),
        metadata: { error: errorMessage }
      };
    }
  }

  // Specialized Processing Methods
  private async processQuery(
    request: VitalPathRequest,
    traceId: string,
    compliance: unknown
  ): Promise<VitalPathResponse> {

    let evidence: unknown[] = [];

    // Step 1: RAG Retrieval

    try {

        text: request.query,
        limit: 10,
        options: {
          use_reranking: true
        }
      });

      ragLatency = Date.now() - ragStart;
      evidence = retrievalResult.chunks;
      this.observability.tracing.finishSpan(ragSpan, 'ok');

    } catch (error) {
      this.observability.tracing.finishSpan(ragSpan, 'error', error instanceof Error ? error.message : 'RAG failed');
      // Continue without RAG results
    }

    // Step 2: LLM Processing

    try {

        urgency: request.context?.urgency || 'normal',
        domain: request.domain,
        complexity: request.context?.complexity || 'moderate'
      });

      llmLatency = llmResponse.latency;
      this.observability.tracing.finishSpan(llmSpan, 'ok');

      return {
        id: this.generateResponseId(),
        requestId: request.id,
        success: true,
        response: llmResponse.content,
        evidence,
        metrics: {
          processingTime: Date.now() - startTime,
          ragLatency,
          llmLatency,
          totalCost: llmResponse.cost,
          providerUsed: llmResponse.provider
        },
        compliance,
        traceId,
        timestamp: new Date()
      };

    } catch (error) {
      this.observability.tracing.finishSpan(llmSpan, 'error', error instanceof Error ? error.message : 'LLM failed');
      throw error;
    }
  }

  private async processWorkflow(
    request: VitalPathRequest,
    traceId: string,
    compliance: unknown
  ): Promise<VitalPathResponse> {

    try {
      // Determine workflow based on request

        workflowId,
        {
          query: request.query,
          domain: request.domain,
          context: request.context
        },
        {
          domain: request.domain,
          urgency: request.context?.urgency || 'normal',
          userId: request.userId,
          sessionId: request.context?.sessionId,
          compliance: {
            hipaa: compliance.violations.some((v: unknown) => v.type.includes('hipaa')),
            gdpr: compliance.violations.some((v: unknown) => v.type.includes('gdpr')),
            fda21cfr11: compliance.violations.some((v: unknown) => v.type.includes('fda')),
            auditRequired: true
          },
          tags: [request.type, request.domain]
        }
      );

      this.observability.tracing.finishSpan(workflowSpan, 'ok');

      return {
        id: this.generateResponseId(),
        requestId: request.id,
        success: true,
        workflowId: workflowStateId,
        metrics: {
          processingTime: Date.now() - Date.now(),
          workflowLatency: 0 // Will be updated when workflow completes
        },
        compliance,
        traceId,
        timestamp: new Date(),
        metadata: { workflowState: 'started' }
      };

    } catch (error) {
      this.observability.tracing.finishSpan(workflowSpan, 'error', error instanceof Error ? error.message : 'Workflow failed');
      throw error;
    }
  }

  private async processAnalysis(
    request: VitalPathRequest,
    traceId: string,
    compliance: unknown
  ): Promise<VitalPathResponse> {
    // Implement analysis processing logic
    return {
      id: this.generateResponseId(),
      requestId: request.id,
      success: true,
      response: `Analysis results for: ${request.query}`,
      metrics: { processingTime: 0 },
      compliance,
      traceId,
      timestamp: new Date()
    };
  }

  private async processComplianceCheck(
    request: VitalPathRequest,
    traceId: string,
    compliance: unknown
  ): Promise<VitalPathResponse> {
    return {
      id: this.generateResponseId(),
      requestId: request.id,
      success: true,
      response: `Compliance check results: ${compliance.compliant ? 'Passed' : 'Failed'}`,
      metrics: { processingTime: 0 },
      compliance,
      traceId,
      timestamp: new Date(),
      metadata: { complianceDetails: compliance }
    };
  }

  // Helper Methods
  private selectWorkflowForRequest(request: VitalPathRequest): string {
    // Select appropriate workflow based on request characteristics
    if (request.domain === 'clinical' || request.context?.dataType === 'clinical_data') {
      return 'clinical-query';
    }
    return 'clinical-query'; // Default for now
  }

  private calculateRiskLevel(results: unknown[]): 'low' | 'medium' | 'high' | 'critical' {

    if (riskLevels.includes('critical')) return 'critical';
    if (riskLevels.includes('high')) return 'high';
    if (riskLevels.includes('medium')) return 'medium';
    return 'low';
  }

  private generateResponseId(): string {
    return `resp_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  // System Management Methods
  async getSystemHealth(): Promise<SystemHealthStatus> {

    return {
      overall: observabilityHealth.status,
      services: {
        orchestrator: 'healthy', // Would check orchestrator health
        rag: 'healthy', // Would check RAG system health
        workflows: workflowMetrics.activeWorkflows > 100 ? 'degraded' : 'healthy',
        observability: observabilityHealth.status,
        compliance: 'healthy' // Would check compliance system health
      },
      metrics: {
        activeRequests: this.activeRequests.size,
        queuedWorkflows: workflowMetrics.queuedWorkflows,
        complianceRate: 95.0, // Would calculate from actual data
        averageLatency: workflowMetrics.averageExecutionTime
      },
      timestamp: new Date()
    };
  }

  async getMetrics(): Promise<unknown> {
    return {
      orchestrator: { /* TODO: implement */ }, // this.orchestrator.getMetrics(),
      workflows: this.workflowEngine.getMetrics(),
      observability: this.observability.metrics.getMetrics(),
      systemStatus: await this.getSystemStatus()
    };
  }

  private async getSystemStatus() {
    return this.observability.getSystemStatus();
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    this.emit('systemShutdown');

    // Wait for active requests to complete

    if (activeRequestIds.length > 0) {
      // // Would implement proper graceful shutdown logic
    }

    // Cleanup resources
    this.activeRequests.clear();
    this.requestMetrics.clear();

    this.emit('systemShutdownComplete');
  }

  // Static factory method
  static create(): VitalPathCore {
    return new VitalPathCore();
  }
}

// Export singleton instance
export const __vitalPathCore = VitalPathCore.create();