/**
 * Enhanced VITAL Path Core Integration System
 *
 * Master integration layer that orchestrates all Phase 2 enhanced components:
 * - Advanced Consensus Building
 * - Enhanced Workflow Orchestration
 * - Comprehensive Monitoring
 * - Clinical Validation Framework
 * - Production-ready UI Components
 */

import { EventEmitter } from 'events';

import { createClient } from '@supabase/supabase-js';

import { ComplianceFramework } from './compliance/ComplianceFramework';
import { AdvancedConsensusBuilder } from './consensus/AdvancedConsensusBuilder';
import { ComprehensiveMonitoringSystem, MonitoringConfig } from './monitoring/ComprehensiveMonitoringSystem';
import { MultiModelOrchestrator } from './orchestration/MultiModelOrchestrator';
import { EnhancedRAGSystem } from './rag/EnhancedRAGSystem';
import { ClinicalValidationFramework } from './validation/ClinicalValidationFramework';
import { EnhancedWorkflowOrchestrator, WorkflowState, WorkflowConfig } from './workflows/EnhancedWorkflowOrchestrator';

export interface EnhancedCoreConfig {
  // Service configuration
  serviceName: string;
  serviceVersion: string;
  environment: 'development' | 'staging' | 'production';

  // Model configuration
  openaiApiKey?: string;
  anthropicApiKey?: string;
  defaultModel: string;

  // Database configuration
  supabaseUrl?: string;
  supabaseServiceKey?: string;

  // Monitoring configuration
  monitoring: MonitoringConfig;

  // Feature flags
  enableAdvancedConsensus: boolean;
  enableClinicalValidation: boolean;
  enableRealTimeMonitoring: boolean;
  enableComplianceChecking: boolean;

  // Performance configuration
  maxConcurrentQueries: number;
  queryTimeoutMs: number;
  cacheEnabled: boolean;

  // Security configuration
  enableAuditLogging: boolean;
  enableEncryption: boolean;
}

export interface QueryRequest {
  id: string;
  query: string;
  userId: string;
  sessionId: string;
  context?: {
    userType?: string;
    urgency?: 'low' | 'normal' | 'high' | 'urgent';
    clinicalContext?: any;
    requiresValidation?: boolean;
    maxResponseTime?: number;
  };
}

export interface QueryResponse {
  id: string;
  query: string;
  response: string;
  confidence: number;
  evidenceLevel: string;

  // Enhanced metadata
  agentsUsed: string[];
  consensusMethod: string;
  responseTimeMs: number;
  totalCost: number;

  // Validation results
  clinicalValidation?: {
    isValid: boolean;
    safetyScore: number;
    violations: unknown[];
    recommendations: string[];
  };

  // Compliance status
  complianceStatus?: {
    hipaaCompliant: boolean;
    gdprCompliant: boolean;
    fdaCompliant: boolean;
  };

  // Citations and evidence
  citations: string[];
  supportingEvidence: unknown[];

  timestamp: Date;
}

export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  version: string;

  components: {
    orchestrator: { status: string; responseTime: number };
    ragSystem: { status: string; documentsIndexed: number };
    consensus: { status: string; averageQuality: number };
    monitoring: { status: string; metricsCollected: number };
    validation: { status: string; validationsPerformed: number };
    compliance: { status: string; complianceRate: number };
  };

  performance: {
    queriesPerSecond: number;
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
  };

  resources: {
    cpuUsage: number;
    memoryUsage: number;
    activeConnections: number;
    queueDepth: number;
  };
}

export class EnhancedVitalPathCore extends EventEmitter {
  private config: EnhancedCoreConfig;

  // Core components
  private orchestrator!: MultiModelOrchestrator;
  private ragSystem!: EnhancedRAGSystem;
  private consensusBuilder!: AdvancedConsensusBuilder;
  private workflowOrchestrator!: EnhancedWorkflowOrchestrator;
  private monitoringSystem!: ComprehensiveMonitoringSystem;
  private clinicalValidator!: ClinicalValidationFramework;
  private complianceFramework!: ComplianceFramework;

  // System state
  private initialized = false;
  private activeQueries = new Map<string, Date>();
  private queryQueue: QueryRequest[] = [];
  private performanceMetrics = {
    totalQueries: 0,
    successfulQueries: 0,
    averageResponseTime: 0,
    totalCost: 0,
  };

  constructor(config: EnhancedCoreConfig) {
    super();
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.emit('initialization_started');

    try {
      // Initialize monitoring first for observability
      await this.initializeMonitoring();

      // Initialize core components
      await this.initializeLLMOrchestrator();
      await this.initializeRAGSystem();
      await this.initializeConsensusBuilder();
      await this.initializeClinicalValidator();
      await this.initializeComplianceFramework();

      // Initialize workflow orchestrator with all components
      await this.initializeWorkflowOrchestrator();

      // Setup event handlers and integrations
      await this.setupEventHandlers();
      await this.setupHealthChecks();

      this.initialized = true;
      this.emit('initialization_completed');

      // } catch (error) {
      this.emit('initialization_failed', error);
      throw new Error(`Failed to initialize Enhanced VITAL Path Core: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async initializeMonitoring(): Promise<void> {
    this.monitoringSystem = new ComprehensiveMonitoringSystem(this.config.monitoring);

    this.monitoringSystem.on('alert_triggered', (alert) => {
      this.emit('system_alert', alert);
      // console.warn(`🚨 System Alert: ${alert.title} (${alert.severity})`);
    });

    // }

  private async initializeLLMOrchestrator(): Promise<void> {
    this.orchestrator = new MultiModelOrchestrator({
      openaiApiKey: this.config.openaiApiKey || '',
      anthropicApiKey: this.config.anthropicApiKey || '',
      defaultModel: this.config.defaultModel,
      enableCaching: this.config.cacheEnabled,
      maxConcurrentRequests: this.config.maxConcurrentQueries,
      requestTimeoutMs: this.config.queryTimeoutMs,
    });

    // Initialize if method exists
    if ('initialize' in this.orchestrator && typeof this.orchestrator.initialize === 'function') {
      await this.orchestrator.initialize();
    }
    // }

  private async initializeRAGSystem(): Promise<void> {
    this.ragSystem = new EnhancedRAGSystem({
      supabaseUrl: this.config.supabaseUrl || '',
      supabaseServiceKey: this.config.supabaseServiceKey,
      openaiApiKey: this.config.openaiApiKey || '',
      enableHybridSearch: true,
      enableReranking: true,
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // Initialize if method exists
    if ('initialize' in this.ragSystem && typeof this.ragSystem.initialize === 'function') {
      await this.ragSystem.initialize();
    }
    // }

  private async initializeConsensusBuilder(): Promise<void> {
    if (!this.config.enableAdvancedConsensus) {
      // return;
    }

    this.consensusBuilder = new AdvancedConsensusBuilder();

    this.consensusBuilder.on('consensus_complete', (result) => {
      this.monitoringSystem?.recordAgentMetrics({
        agentId: 'consensus_builder',
        responseTime: result.metadata?.consensusTime || 0,
        confidence: result.confidence,
        tokensUsed: 0,
        cost: 0,
        success: true,
        timestamp: new Date(),
      });
    });

    // }

  private async initializeClinicalValidator(): Promise<void> {
    if (!this.config.enableClinicalValidation) {
      // return;
    }

    this.clinicalValidator = new ClinicalValidationFramework();

    this.clinicalValidator.on('validation_completed', (result) => {
      this.emit('clinical_validation_completed', result);
    });

    // }

  private async initializeComplianceFramework(): Promise<void> {
    if (!this.config.enableComplianceChecking) {
      // return;
    }

    // Create Supabase client for compliance framework

      this.config.supabaseUrl || '',
      this.config.supabaseServiceKey || '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    this.complianceFramework = new ComplianceFramework(complianceSupabase as unknown);

    // Initialize if method exists
    if ('initialize' in this.complianceFramework && typeof this.complianceFramework.initialize === 'function') {
      await this.complianceFramework.initialize();
    }
    // }

  private async initializeWorkflowOrchestrator(): Promise<void> {
    const workflowConfig: WorkflowConfig = {
      maxRetries: 3,
      timeoutMs: this.config.queryTimeoutMs,
      enableParallelExecution: true,
      enableClinicalValidation: this.config.enableClinicalValidation,
      enableComplianceChecking: this.config.enableComplianceChecking,
      consensusBuilder: this.consensusBuilder,
      orchestrator: this.orchestrator,
      ragSystem: this.ragSystem,
    };

    this.workflowOrchestrator = new EnhancedWorkflowOrchestrator(workflowConfig);

    this.workflowOrchestrator.on('workflow_completed', (result) => {
      this.handleWorkflowCompleted(result);
    });

    this.workflowOrchestrator.on('workflow_failed', (error) => {
      this.handleWorkflowFailed(error);
    });

    // }

  private async setupEventHandlers(): Promise<void> {
    // Performance monitoring
    this.on('query_completed', (response: QueryResponse) => {
      this.updatePerformanceMetrics(response);

      if (this.config.enableRealTimeMonitoring) {
        this.monitoringSystem?.recordAgentMetrics({
          agentId: 'system',
          responseTime: response.responseTimeMs,
          confidence: response.confidence,
          tokensUsed: 0, // Would extract from response metadata
          cost: response.totalCost,
          success: true,
          timestamp: response.timestamp,
        });
      }
    });

    // Error handling
    this.on('query_failed', (error) => {
      this.monitoringSystem?.recordAgentMetrics({
        agentId: 'system',
        responseTime: 0,
        confidence: 0,
        tokensUsed: 0,
        cost: 0,
        success: false,
        errorType: error.type,
        timestamp: new Date(),
      });
    });

    // }

  private async setupHealthChecks(): Promise<void> {
    // Periodic health checks every 30 seconds
    setInterval(async () => {
      try {

        this.emit('health_check', status);

        if (status.status === 'unhealthy') {
          this.emit('system_unhealthy', status);
        }
      } catch (error) {
        // console.error('Health check failed:', error);
      }
    }, 30000);

    // }

  // Public API
  async processQuery(request: QueryRequest): Promise<QueryResponse> {
    if (!this.initialized) {
      throw new Error('System not initialized. Call initialize() first.');
    }

    // Check rate limiting
    if (this.activeQueries.size >= this.config.maxConcurrentQueries) {
      this.queryQueue.push(request);
      throw new Error('Query queue full. Please try again later.');
    }

    this.activeQueries.set(request.id, new Date());
    this.emit('query_started', request);

    try {
      // Track query execution

        'enhanced_core',
        'process_query',
        async () => {
          return await this.executeQuery(request);
        }
      );

      this.activeQueries.delete(request.id);
      this.processQueue();

      this.emit('query_completed', finalResponse);

      return finalResponse;

    } catch (error) {
      this.activeQueries.delete(request.id);
      this.processQueue();

      const errorResponse: QueryResponse = {
        id: request.id,
        query: request.query,
        response: `I apologize, but I encountered an error processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0,
        evidenceLevel: '5',
        agentsUsed: [],
        consensusMethod: 'error',
        responseTimeMs: Date.now() - startTime,
        totalCost: 0,
        citations: [],
        supportingEvidence: [],
        timestamp: new Date(),
      };

      this.emit('query_failed', { request, error, response: errorResponse });
      return errorResponse;
    }
  }

  private async executeQuery(request: QueryRequest): Promise<QueryResponse> {

    // Create workflow state
    const workflowState: Partial<WorkflowState> = {
      query: request.query,
      queryId: request.id,
      sessionId: request.sessionId,
      userId: request.userId,
      userContext: request.context || { /* TODO: implement */ },
      urgencyLevel: request.context?.urgency || 'normal',
      requiresClinicalValidation: request.context?.requiresValidation || false,
    };

    // Execute workflow

    // Build response
    const response: QueryResponse = {
      id: request.id,
      query: request.query,
      response: result.finalResponse,
      confidence: result.confidence,
      evidenceLevel: result.evidenceLevel,
      agentsUsed: result.selectedAgents,
      consensusMethod: result.consensusResult?.consensusMethod || 'single_agent',
      responseTimeMs: Date.now() - startTime,
      totalCost: result.totalCost,
      citations: result.citations,
      supportingEvidence: [],
      timestamp: new Date(),
    };

    // Add clinical validation if performed
    if (this.config.enableClinicalValidation && result.validationResults?.clinical) {
      response.clinicalValidation = {
        isValid: result.validationResults.clinical.isValid,
        safetyScore: result.validationResults.clinical.safetyScore || 1.0,
        violations: result.validationResults.clinical.violations || [],
        recommendations: result.validationResults.clinical.recommendations || [],
      };
    }

    // Add compliance status if checked
    if (this.config.enableComplianceChecking && result.validationResults?.compliance) {
      response.complianceStatus = {
        hipaaCompliant: result.validationResults.compliance.hipaa || false,
        gdprCompliant: result.validationResults.compliance.gdpr || false,
        fdaCompliant: result.validationResults.compliance.fdaPart11 || false,
      };
    }

    return response;
  }

  private processQueue(): void {
    if (this.queryQueue.length > 0 && this.activeQueries.size < this.config.maxConcurrentQueries) {

      if (nextRequest) {
        // Process next query asynchronously
        this.processQuery(nextRequest).catch(error => {
          // console.error('Queued query failed:', error);
        });
      }
    }
  }

  private handleWorkflowCompleted(result: WorkflowState): void {
    // Update performance metrics
    this.performanceMetrics.totalQueries++;
    this.performanceMetrics.successfulQueries++;
    this.performanceMetrics.averageResponseTime =
      (this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalQueries - 1) + result.totalLatencyMs) /
      this.performanceMetrics.totalQueries;
    this.performanceMetrics.totalCost += result.totalCost;
  }

  private handleWorkflowFailed(error: unknown): void {
    this.performanceMetrics.totalQueries++;
    // console.error('Workflow failed:', error);
  }

  private updatePerformanceMetrics(response: QueryResponse): void {
    // Update internal metrics
    this.performanceMetrics.totalQueries++;
    if (response.confidence > 0.5) {
      this.performanceMetrics.successfulQueries++;
    }
  }

  async getSystemStatus(): Promise<SystemStatus> {

    // Get component health

      orchestrator: await this.getOrchestratorStatus(),
      ragSystem: await this.getRAGSystemStatus(),
      consensus: await this.getConsensusStatus(),
      monitoring: await this.getMonitoringStatus(),
      validation: await this.getValidationStatus(),
      compliance: await this.getComplianceStatus(),
    };

    // Calculate overall status

      ? 'unhealthy'
      : componentStatuses.includes('degraded')
        ? 'degraded'
        : 'healthy';

    // Performance metrics

      queriesPerSecond: this.performanceMetrics.totalQueries / uptime,
      averageResponseTime: this.performanceMetrics.averageResponseTime,
      successRate: this.performanceMetrics.totalQueries > 0
        ? this.performanceMetrics.successfulQueries / this.performanceMetrics.totalQueries
        : 1.0,
      errorRate: this.performanceMetrics.totalQueries > 0
        ? 1 - (this.performanceMetrics.successfulQueries / this.performanceMetrics.totalQueries)
        : 0.0,
    };

    // Resource metrics

      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      memoryUsage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      activeConnections: this.activeQueries.size,
      queueDepth: this.queryQueue.length,
    };

    return {
      status: overallStatus,
      uptime,
      version: this.config.serviceVersion,
      components,
      performance,
      resources,
    };
  }

  // Component status methods
  private async getOrchestratorStatus(): Promise<{ status: string; responseTime: number }> {
    try {

      // Test orchestrator with a simple health check

      return { status: 'healthy', responseTime };
    } catch (error) {
      return { status: 'unhealthy', responseTime: -1 };
    }
  }

  private async getRAGSystemStatus(): Promise<{ status: string; documentsIndexed: number }> {
    try {
      // Would check RAG system health and document count
      return { status: 'healthy', documentsIndexed: 1000 }; // Placeholder
    } catch (error) {
      return { status: 'unhealthy', documentsIndexed: 0 };
    }
  }

  private async getConsensusStatus(): Promise<{ status: string; averageQuality: number }> {
    if (!this.config.enableAdvancedConsensus) {
      return { status: 'disabled', averageQuality: 0 };
    }
    return { status: 'healthy', averageQuality: 0.85 }; // Placeholder
  }

  private async getMonitoringStatus(): Promise<{ status: string; metricsCollected: number }> {
    try {

      return {
        status: health?.status || 'unknown',
        metricsCollected: 10000, // Placeholder
      };
    } catch (error) {
      return { status: 'unhealthy', metricsCollected: 0 };
    }
  }

  private async getValidationStatus(): Promise<{ status: string; validationsPerformed: number }> {
    if (!this.config.enableClinicalValidation) {
      return { status: 'disabled', validationsPerformed: 0 };
    }

    return {
      status: 'healthy',
      validationsPerformed: stats?.totalValidations || 0,
    };
  }

  private async getComplianceStatus(): Promise<{ status: string; complianceRate: number }> {
    if (!this.config.enableComplianceChecking) {
      return { status: 'disabled', complianceRate: 0 };
    }
    return { status: 'healthy', complianceRate: 0.98 }; // Placeholder
  }

  // System management
  async shutdown(): Promise<void> {
    // try {
      // Wait for active queries to complete (with timeout)

      while (this.activeQueries.size > 0 && (Date.now() - startTime) < shutdownTimeout) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Shutdown components (only if shutdown method exists)
      if (this.monitoringSystem && 'shutdown' in this.monitoringSystem && typeof this.monitoringSystem.shutdown === 'function') {
        await this.monitoringSystem.shutdown();
      }
      if (this.ragSystem && 'shutdown' in this.ragSystem && typeof this.ragSystem.shutdown === 'function') {
        await this.ragSystem.shutdown();
      }
      if (this.orchestrator && 'shutdown' in this.orchestrator && typeof this.orchestrator.shutdown === 'function') {
        await this.orchestrator.shutdown();
      }

      this.removeAllListeners();
      this.initialized = false;

      // } catch (error) {
      // console.error('Error during shutdown:', error);
    }
  }

  // Getters for component access (for testing and debugging)
  get isInitialized(): boolean {
    return this.initialized;
  }

  get activeQueryCount(): number {
    return this.activeQueries.size;
  }

  get queuedQueryCount(): number {
    return this.queryQueue.length;
  }

  get metrics(): typeof this.performanceMetrics {
    return { ...this.performanceMetrics };
  }
}

export default EnhancedVitalPathCore;