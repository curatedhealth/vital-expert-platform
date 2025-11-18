/**
 * Workflow Analytics Tracking
 * 
 * Utilities for tracking workflow execution, steps, and performance.
 */

import { getAnalyticsService } from '@/lib/analytics/UnifiedAnalyticsService';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

/**
 * Track workflow start
 */
export async function trackWorkflowStart(params: {
  workflowId: string;
  workflowName: string;
  userId: string;
  sessionId?: string;
  inputData?: Record<string, any>;
}) {
  const analytics = getAnalyticsService();
  
  await analytics.trackEvent({
    tenant_id: STARTUP_TENANT_ID,
    user_id: params.userId,
    session_id: params.sessionId,
    event_type: 'workflow_started',
    event_category: 'business_metric',
    event_data: {
      workflow_id: params.workflowId,
      workflow_name: params.workflowName,
      input_data: params.inputData,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Track workflow completion
 */
export async function trackWorkflowComplete(params: {
  workflowId: string;
  workflowName: string;
  userId: string;
  sessionId?: string;
  executionTimeMs: number;
  stepsCompleted: number;
  outputData?: Record<string, any>;
  cost?: number;
}) {
  const analytics = getAnalyticsService();
  
  // Track completion event
  await analytics.trackEvent({
    tenant_id: STARTUP_TENANT_ID,
    user_id: params.userId,
    session_id: params.sessionId,
    event_type: 'workflow_completed',
    event_category: 'business_metric',
    event_data: {
      workflow_id: params.workflowId,
      workflow_name: params.workflowName,
      execution_time_ms: params.executionTimeMs,
      steps_completed: params.stepsCompleted,
      output_data: params.outputData,
      timestamp: new Date().toISOString(),
    },
  });
  
  // Track as agent execution for performance metrics
  await analytics.trackAgentExecution({
    tenant_id: STARTUP_TENANT_ID,
    user_id: params.userId,
    session_id: params.sessionId,
    agent_id: params.workflowId,
    agent_type: 'workflow',
    execution_time_ms: params.executionTimeMs,
    success: true,
    cost_usd: params.cost,
    metadata: {
      workflow_name: params.workflowName,
      steps_completed: params.stepsCompleted,
    },
  });
}

/**
 * Track workflow failure
 */
export async function trackWorkflowFailure(params: {
  workflowId: string;
  workflowName: string;
  userId: string;
  sessionId?: string;
  executionTimeMs: number;
  errorType: string;
  errorMessage: string;
  failedStep?: string;
}) {
  const analytics = getAnalyticsService();
  
  // Track failure event
  await analytics.trackEvent({
    tenant_id: STARTUP_TENANT_ID,
    user_id: params.userId,
    session_id: params.sessionId,
    event_type: 'workflow_failed',
    event_category: 'system_health',
    event_data: {
      workflow_id: params.workflowId,
      workflow_name: params.workflowName,
      execution_time_ms: params.executionTimeMs,
      error_type: params.errorType,
      error_message: params.errorMessage,
      failed_step: params.failedStep,
      timestamp: new Date().toISOString(),
    },
  });
  
  // Track as failed agent execution
  await analytics.trackAgentExecution({
    tenant_id: STARTUP_TENANT_ID,
    user_id: params.userId,
    session_id: params.sessionId,
    agent_id: params.workflowId,
    agent_type: 'workflow',
    execution_time_ms: params.executionTimeMs,
    success: false,
    error_type: params.errorType,
    error_message: params.errorMessage,
    metadata: {
      workflow_name: params.workflowName,
      failed_step: params.failedStep,
    },
  });
}

/**
 * Track workflow step execution
 */
export async function trackWorkflowStep(params: {
  workflowId: string;
  workflowName: string;
  userId: string;
  sessionId?: string;
  stepName: string;
  stepIndex: number;
  executionTimeMs: number;
  success: boolean;
  error?: string;
}) {
  const analytics = getAnalyticsService();
  
  await analytics.trackEvent({
    tenant_id: STARTUP_TENANT_ID,
    user_id: params.userId,
    session_id: params.sessionId,
    event_type: 'workflow_step_executed',
    event_category: 'system_health',
    event_data: {
      workflow_id: params.workflowId,
      workflow_name: params.workflowName,
      step_name: params.stepName,
      step_index: params.stepIndex,
      execution_time_ms: params.executionTimeMs,
      success: params.success,
      error: params.error,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Workflow Tracker Class - For easier workflow tracking
 */
export class WorkflowTracker {
  private workflowId: string;
  private workflowName: string;
  private userId: string;
  private sessionId?: string;
  private startTime: number;
  private stepsCompleted: number = 0;
  private totalCost: number = 0;

  constructor(params: {
    workflowId: string;
    workflowName: string;
    userId: string;
    sessionId?: string;
  }) {
    this.workflowId = params.workflowId;
    this.workflowName = params.workflowName;
    this.userId = params.userId;
    this.sessionId = params.sessionId;
    this.startTime = Date.now();
  }

  /**
   * Track workflow start (call this at the beginning)
   */
  async start(inputData?: Record<string, any>) {
    await trackWorkflowStart({
      workflowId: this.workflowId,
      workflowName: this.workflowName,
      userId: this.userId,
      sessionId: this.sessionId,
      inputData,
    });
  }

  /**
   * Track a workflow step
   */
  async trackStep(stepName: string, executionTimeMs: number, success: boolean, error?: string) {
    await trackWorkflowStep({
      workflowId: this.workflowId,
      workflowName: this.workflowName,
      userId: this.userId,
      sessionId: this.sessionId,
      stepName,
      stepIndex: this.stepsCompleted,
      executionTimeMs,
      success,
      error,
    });

    if (success) {
      this.stepsCompleted++;
    }
  }

  /**
   * Add cost to the workflow
   */
  addCost(cost: number) {
    this.totalCost += cost;
  }

  /**
   * Track workflow completion (call this at the end)
   */
  async complete(outputData?: Record<string, any>) {
    const executionTime = Date.now() - this.startTime;
    
    await trackWorkflowComplete({
      workflowId: this.workflowId,
      workflowName: this.workflowName,
      userId: this.userId,
      sessionId: this.sessionId,
      executionTimeMs: executionTime,
      stepsCompleted: this.stepsCompleted,
      outputData,
      cost: this.totalCost,
    });
  }

  /**
   * Track workflow failure (call this if workflow fails)
   */
  async fail(error: Error, failedStep?: string) {
    const executionTime = Date.now() - this.startTime;
    
    await trackWorkflowFailure({
      workflowId: this.workflowId,
      workflowName: this.workflowName,
      userId: this.userId,
      sessionId: this.sessionId,
      executionTimeMs: executionTime,
      errorType: error.name,
      errorMessage: error.message,
      failedStep,
    });
  }
}

/**
 * Example Usage:
 * 
 * const tracker = new WorkflowTracker({
 *   workflowId: 'wf-123',
 *   workflowName: 'Document Analysis',
 *   userId: 'user-456',
 * });
 * 
 * await tracker.start({ document_id: 'doc-789' });
 * 
 * try {
 *   // Step 1
 *   const step1Start = Date.now();
 *   await processStep1();
 *   await tracker.trackStep('extract_text', Date.now() - step1Start, true);
 *   
 *   // Step 2
 *   const step2Start = Date.now();
 *   const result = await processStep2();
 *   tracker.addCost(0.05); // Add LLM cost
 *   await tracker.trackStep('analyze_content', Date.now() - step2Start, true);
 *   
 *   await tracker.complete({ analysis_result: result });
 * } catch (error) {
 *   await tracker.fail(error, 'analyze_content');
 * }
 */

