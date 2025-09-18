import { createClient } from '@supabase/supabase-js';
import { JTBDExecutionEngine, ExecutionContext, StepResult } from './execution-engine';
import { DynamicAgentSelector } from '../agents/dynamic-agent-selector';
import {
  EnhancedWorkflowStep,
  EnhancedWorkflowDefinition,
  EnhancedExecutionContext,
  ConditionalNext,
  ParallelBranch,
  ErrorStrategy,
  SuccessCriteria,
  WorkflowAnalytics
} from '@/types/workflow-enhanced';
import { Agent } from '../agents/agent-service';

export interface EnhancedStepResult extends StepResult {
  confidence?: number;
  reasoning?: string;
  citations?: string[];
  quality_score?: number;
  agent_performance?: {
    execution_time: number;
    success: boolean;
    error_count: number;
  };
}

export class EnhancedJTBDExecutionEngine extends JTBDExecutionEngine {
  private agentSelector: DynamicAgentSelector;
  private workflowAnalytics: Map<string, WorkflowAnalyticsTracker> = new Map();
  private conditionalEvaluator: ConditionalEvaluator;
  private parallelExecutor: ParallelExecutor;

  constructor(supabase?: any) {
    super(supabase);
    this.agentSelector = new DynamicAgentSelector(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.conditionalEvaluator = new ConditionalEvaluator();
    this.parallelExecutor = new ParallelExecutor();
  }

  /**
   * Execute enhanced workflow with conditional logic, parallel execution, and dynamic agent selection
   */
  async executeEnhancedWorkflow(
    executionId: number,
    workflow: EnhancedWorkflowDefinition,
    inputData?: any
  ): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (!context) throw new Error(`Execution ${executionId} not found`);

    const enhancedContext: EnhancedExecutionContext = {
      ...context,
      workflow_id: workflow.id,
      execution_mode: context.execution_mode,
      input_data: inputData || context.input_data,
      conditional_state: {},
      parallel_state: {
        active_branches: [],
        completed_branches: [],
        waiting_for_merge: false
      }
    };

    const analytics = new WorkflowAnalyticsTracker(workflow.id, executionId);
    this.workflowAnalytics.set(executionId.toString(), analytics);

    try {
      console.log(`🚀 Starting enhanced workflow execution: ${workflow.name}`);
      analytics.startExecution();

      // Initialize workflow state
      const workflowState = new EnhancedWorkflowState(workflow, enhancedContext);

      // Execute workflow with enhanced features
      while (!workflowState.isComplete()) {
        const nextSteps = workflowState.getNextExecutableSteps();

        if (nextSteps.length === 0) {
          if (workflowState.hasPausedSteps()) {
            await this.handlePausedSteps(workflowState);
            continue;
          }
          break;
        }

        // Check for parallel execution groups
        const parallelGroups = this.groupParallelSteps(nextSteps);

        for (const group of parallelGroups) {
          if (group.length > 1) {
            console.log(`⚡ Executing ${group.length} steps in parallel`);
            await this.executeParallelSteps(group, workflowState, analytics, enhancedContext);
          } else {
            await this.executeEnhancedStep(group[0], workflowState, analytics, enhancedContext);
          }
        }

        // Apply workflow-level error strategies if needed
        const errorCount = workflowState.getGlobalErrorCount();
        if (errorCount > 0) {
          await this.applyErrorStrategies(workflow.error_strategies, errorCount, enhancedContext);
        }
      }

      // Validate success criteria
      const success = await this.validateSuccessCriteria(
        workflow.success_criteria,
        workflowState,
        enhancedContext
      );

      await this.completeEnhancedExecution(executionId, success, analytics, workflowState);
      console.log(`✅ Enhanced workflow execution ${executionId} completed successfully`);

    } catch (error) {
      await this.handleEnhancedExecutionError(executionId, error, analytics);
      throw error;
    }
  }

  /**
   * Execute a single enhanced workflow step with all advanced features
   */
  private async executeEnhancedStep(
    step: EnhancedWorkflowStep,
    workflowState: EnhancedWorkflowState,
    analytics: WorkflowAnalyticsTracker,
    context: EnhancedExecutionContext
  ): Promise<void> {
    const startTime = Date.now();
    console.log(`🔧 Executing enhanced step: ${step.step_name}`);

    try {
      // Pre-execution validation
      if (step.validation_rules) {
        await this.validateStepInputs(step, workflowState);
      }

      // Dynamic agent selection
      const agent = await this.selectAgentForStep(step, context);

      // Execute with enhanced features
      const result = await this.executeWithEnhancedAgent(
        step,
        agent,
        workflowState,
        context
      );

      // Post-execution processing
      const executionTime = Date.now() - startTime;

      // Record agent performance
      await this.agentSelector.recordAgentPerformance(
        agent.id,
        step.id,
        step.jtbd_id,
        {
          executionTime: Math.round(executionTime / 1000),
          success: result.status === 'Completed',
          qualityScore: result.confidence,
          errorCount: workflowState.getStepErrorCount(step.id)
        }
      );

      // Update workflow state
      workflowState.completeStep(step.id, result);

      // Evaluate conditional logic
      await this.evaluateConditionalLogic(step, result, workflowState, context);

      // Record analytics
      analytics.recordStepExecution(step.id, executionTime, true, agent.id);

    } catch (error) {
      const executionTime = Date.now() - startTime;
      analytics.recordStepExecution(step.id, executionTime, false);

      // Handle step-specific errors with retry logic
      if (step.retry_config && workflowState.getStepRetryCount(step.id) < step.retry_config.max_retries) {
        console.log(`🔄 Retrying step ${step.step_name} (attempt ${workflowState.getStepRetryCount(step.id) + 1})`);

        await this.delay(step.retry_config.retry_delay_ms);
        workflowState.incrementStepRetry(step.id);

        // Retry the step
        return this.executeEnhancedStep(step, workflowState, analytics, context);
      }

      await this.handleStepError(step, error, workflowState);
      throw error;
    }
  }

  /**
   * Select optimal agent for step using dynamic selection
   */
  private async selectAgentForStep(
    step: EnhancedWorkflowStep,
    context: EnhancedExecutionContext
  ): Promise<Agent> {
    const availableAgents = await this.agentService.getActiveAgents();

    const selectedAgent = await this.agentSelector.selectOptimalAgent(
      step,
      context as ExecutionContext,
      availableAgents,
      step.agent_selection
    );

    // Handle consensus selection (multiple agents)
    if (Array.isArray(selectedAgent)) {
      // For now, use the first agent (consensus handling would be more complex)
      return selectedAgent[0];
    }

    return selectedAgent;
  }

  /**
   * Execute step with enhanced agent capabilities
   */
  private async executeWithEnhancedAgent(
    step: EnhancedWorkflowStep,
    agent: Agent,
    workflowState: EnhancedWorkflowState,
    context: EnhancedExecutionContext
  ): Promise<EnhancedStepResult> {
    console.log(`🤖 Using agent ${agent.name} for step: ${step.step_name}`);

    // Prepare enhanced context for the agent
    const agentContext = {
      step_description: step.step_description,
      input_schema: step.input_schema,
      output_schema: step.output_schema,
      previous_results: workflowState.getAccumulatedResults(),
      workflow_context: {
        name: context.workflow_id,
        category: 'Enhanced Workflow',
        current_step: context.current_step,
        total_steps: context.total_steps
      },
      user_input: context.input_data,
      conditional_state: context.conditional_state,
      quality_requirements: step.monitoring_config?.quality_thresholds
    };

    // Build enhanced prompt
    const prompt = this.buildEnhancedAgentPrompt(agent, step, agentContext);

    try {
      const response = await this.llmOrchestrator.query(
        prompt,
        JSON.stringify(agentContext),
        'enhanced-agent',
        {
          temperature: 0.3,
          maxTokens: 2000,
          timeout: step.timeout_config?.timeout_ms || 120000
        }
      );

      return {
        step_number: step.step_number,
        status: 'Completed',
        agent_used: agent.id,
        execution_time_minutes: 0, // Will be set by caller
        output_data: {
          agent_response: response.content,
          confidence: response.confidence,
          reasoning: response.reasoning,
          citations: response.citations || [],
          structured_output: this.extractEnhancedOutput(response.content, step)
        },
        confidence: response.confidence,
        reasoning: response.reasoning,
        citations: response.citations || []
      };

    } catch (error) {
      throw new Error(`Agent execution failed: ${error.message}`);
    }
  }

  /**
   * Execute multiple steps in parallel
   */
  private async executeParallelSteps(
    steps: EnhancedWorkflowStep[],
    workflowState: EnhancedWorkflowState,
    analytics: WorkflowAnalyticsTracker,
    context: EnhancedExecutionContext
  ): Promise<void> {
    const promises = steps.map(step =>
      this.executeEnhancedStep(step, workflowState, analytics, context)
        .catch(error => ({ step, error }))
    );

    const results = await Promise.allSettled(promises);

    // Handle failures
    const failures = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && 'error' in r.value));
    if (failures.length > 0) {
      console.error(`${failures.length} parallel steps failed`);
      // Could implement partial failure handling here
    }
  }

  /**
   * Evaluate conditional logic for step transitions
   */
  private async evaluateConditionalLogic(
    step: EnhancedWorkflowStep,
    result: EnhancedStepResult,
    workflowState: EnhancedWorkflowState,
    context: EnhancedExecutionContext
  ): Promise<void> {
    if (!step.conditional_next || step.conditional_next.length === 0) return;

    // Sort conditions by priority
    const sortedConditions = [...step.conditional_next].sort(
      (a, b) => (a.priority || 999) - (b.priority || 999)
    );

    for (const condition of sortedConditions) {
      const shouldExecute = this.conditionalEvaluator.evaluate(
        condition.condition,
        result,
        workflowState,
        context
      );

      if (shouldExecute) {
        console.log(`✅ Condition met: ${condition.condition} -> ${condition.next_step_id}`);

        // Apply data transformation if specified
        if (condition.transform_data) {
          const transformedData = this.applyDataTransformation(
            result.output_data,
            condition.transform_data
          );
          workflowState.setStepInput(condition.next_step_id, transformedData);
        }

        // Update conditional state
        context.conditional_state[`${step.id}_to_${condition.next_step_id}`] = {
          condition: condition.condition,
          triggered_at: new Date().toISOString(),
          input_data: result.output_data
        };

        // Queue next step
        workflowState.queueStep(condition.next_step_id);
        break; // Execute only first matching condition
      }
    }
  }

  /**
   * Group steps for parallel execution
   */
  private groupParallelSteps(steps: EnhancedWorkflowStep[]): EnhancedWorkflowStep[][] {
    const groups: EnhancedWorkflowStep[][] = [];
    const parallelGroup: EnhancedWorkflowStep[] = [];
    const sequentialSteps: EnhancedWorkflowStep[] = [];

    for (const step of steps) {
      if (step.is_parallel) {
        parallelGroup.push(step);
      } else {
        sequentialSteps.push(step);
      }
    }

    // Add parallel group if exists
    if (parallelGroup.length > 0) {
      groups.push(parallelGroup);
    }

    // Add sequential steps as individual groups
    sequentialSteps.forEach(step => groups.push([step]));

    return groups;
  }

  /**
   * Validate workflow success criteria
   */
  private async validateSuccessCriteria(
    criteria: SuccessCriteria,
    workflowState: EnhancedWorkflowState,
    context: EnhancedExecutionContext
  ): Promise<boolean> {
    if (!criteria) return true;

    const results = workflowState.getAccumulatedResults();

    // Check required outputs
    for (const required of criteria.required_outputs || []) {
      const found = results.some(r =>
        r.output_data && Object.keys(r.output_data).includes(required)
      );
      if (!found) {
        console.warn(`❌ Missing required output: ${required}`);
        return false;
      }
    }

    // Check quality thresholds
    for (const [metric, threshold] of Object.entries(criteria.quality_thresholds || {})) {
      const value = this.calculateQualityMetric(metric, results);
      if (value < threshold) {
        console.warn(`❌ Quality threshold not met: ${metric} (${value} < ${threshold})`);
        return false;
      }
    }

    // Check validation rules
    if (criteria.validation_checks) {
      for (const check of criteria.validation_checks) {
        const passed = await this.validateCheck(check, results, context);
        if (!passed) {
          console.warn(`❌ Validation check failed: ${check}`);
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Apply workflow-level error strategies
   */
  private async applyErrorStrategies(
    strategies: ErrorStrategy[],
    errorCount: number,
    context: EnhancedExecutionContext
  ): Promise<void> {
    for (const strategy of strategies) {
      // Check if strategy should be applied based on error count or other conditions
      if (this.shouldApplyErrorStrategy(strategy, errorCount, context)) {
        console.log(`🚨 Applying error strategy: ${strategy.name}`);
        await this.executeErrorStrategy(strategy, context);
      }
    }
  }

  /**
   * Build enhanced prompt for agent execution
   */
  private buildEnhancedAgentPrompt(
    agent: Agent,
    step: EnhancedWorkflowStep,
    context: any
  ): string {
    return `
You are ${agent.name}: ${agent.description}

**Enhanced Workflow Task**: Execute step "${step.step_name}" in a pharmaceutical workflow.

**Step Details**:
- Description: ${step.step_description}
- Required Capabilities: ${step.required_capabilities?.join(', ') || 'General'}
- Expected Duration: ${step.estimated_duration} minutes
- Quality Thresholds: ${JSON.stringify(context.quality_requirements || {})}

**Workflow Context**:
- Workflow: ${context.workflow_context.name}
- Progress: Step ${context.workflow_context.current_step} of ${context.workflow_context.total_steps}
- Previous Results: ${JSON.stringify(context.previous_results?.slice(-2) || [], null, 2)}

**Input Data**: ${JSON.stringify(context.user_input || {}, null, 2)}

**Conditional State**: ${JSON.stringify(context.conditional_state || {}, null, 2)}

Please execute this step using your specialized capabilities. Provide:
1. Detailed execution results with specific, actionable outputs
2. Key findings and insights relevant to pharmaceutical workflows
3. Quality assessment and confidence level (0.0-1.0)
4. Any regulatory compliance considerations
5. Recommendations for next steps or optimizations
6. Supporting reasoning and citations where applicable

Focus on delivering high-quality, pharmaceutical industry-specific results that advance the workflow objectives.
`;
  }

  /**
   * Extract enhanced structured output from agent response
   */
  private extractEnhancedOutput(content: string, step: EnhancedWorkflowStep): any {
    // Enhanced parsing logic for structured outputs
    const sections = content.split('\n').filter(line => line.trim());

    return {
      summary: this.extractSection(sections, ['summary', 'overview', 'result']),
      key_findings: this.extractSection(sections, ['findings', 'insights', 'analysis']),
      recommendations: this.extractSection(sections, ['recommendations', 'next steps', 'suggestions']),
      regulatory_notes: this.extractSection(sections, ['regulatory', 'compliance', 'fda']),
      quality_metrics: this.extractQualityMetrics(content),
      structured_data: this.extractStructuredData(content, step),
      raw_content: content
    };
  }

  /**
   * Helper methods for enhanced execution
   */
  private extractSection(sections: string[], keywords: string[]): string[] {
    return sections.filter(line =>
      keywords.some(keyword => line.toLowerCase().includes(keyword))
    );
  }

  private extractQualityMetrics(content: string): any {
    const metrics: any = {};

    // Extract confidence if mentioned
    const confidenceMatch = content.match(/confidence[:\s]+([\d.]+)/i);
    if (confidenceMatch) {
      metrics.confidence = parseFloat(confidenceMatch[1]);
    }

    // Extract other quality indicators
    const qualityMatch = content.match(/quality[:\s]+([\d.]+)/i);
    if (qualityMatch) {
      metrics.quality_score = parseFloat(qualityMatch[1]);
    }

    return metrics;
  }

  private extractStructuredData(content: string, step: EnhancedWorkflowStep): any {
    // Extract structured data based on step type and expected outputs
    const data: any = {};

    if (step.output_schema) {
      // Use output schema to guide extraction
      const properties = step.output_schema.properties || {};
      for (const [key, _] of Object.entries(properties)) {
        const regex = new RegExp(`${key}[:\s]+([^\n]+)`, 'i');
        const match = content.match(regex);
        if (match) {
          data[key] = match[1].trim();
        }
      }
    }

    return data;
  }

  private calculateQualityMetric(metric: string, results: EnhancedStepResult[]): number {
    switch (metric) {
      case 'confidence':
        return results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length;
      case 'completeness':
        return results.filter(r => r.status === 'Completed').length / results.length;
      case 'regulatory_confidence':
        return results
          .filter(r => r.output_data?.regulatory_notes)
          .reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length || 0;
      default:
        return 0.5;
    }
  }

  private async validateCheck(check: string, results: EnhancedStepResult[], context: EnhancedExecutionContext): Promise<boolean> {
    // Implement specific validation checks
    switch (check) {
      case 'All FDA required forms completed':
        return results.some(r => r.output_data?.fda_forms);
      case 'Clinical evidence meets FDA standards':
        return results.some(r => r.output_data?.clinical_evidence && r.confidence > 0.8);
      default:
        return true;
    }
  }

  private shouldApplyErrorStrategy(strategy: ErrorStrategy, errorCount: number, context: EnhancedExecutionContext): boolean {
    // Logic to determine if error strategy should be applied
    return errorCount >= 3 || strategy.error_types.includes('critical');
  }

  private async executeErrorStrategy(strategy: ErrorStrategy, context: EnhancedExecutionContext): Promise<void> {
    // Execute the error strategy action
    switch (strategy.action) {
      case 'pause_and_notify':
        console.log(`⏸️ Pausing execution for error strategy: ${strategy.name}`);
        // Implementation for pausing and notification
        break;
      case 'retry_with_backoff':
        console.log(`🔄 Retrying with backoff: ${strategy.name}`);
        // Implementation for retry logic
        break;
      default:
        console.log(`🚨 Executing error strategy: ${strategy.action}`);
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async handlePausedSteps(workflowState: EnhancedWorkflowState): Promise<void> {
    // Handle paused steps (wait for user input, etc.)
    console.log('⏸️ Workflow paused - waiting for user input');
    // Implementation would depend on specific pause reasons
  }

  private async completeEnhancedExecution(
    executionId: number,
    success: boolean,
    analytics: WorkflowAnalyticsTracker,
    workflowState: EnhancedWorkflowState
  ): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (!context) return;

    // Record final analytics
    const analyticsData = analytics.getAnalytics();

    await this.supabase
      .from('workflow_analytics')
      .insert([analyticsData]);

    // Update execution status
    await this.jtbdService.updateExecutionStatus(executionId, success ? 'Completed' : 'Failed', {
      completion_timestamp: new Date().toISOString(),
      total_steps: context.total_steps,
      final_results: workflowState.getAccumulatedResults(),
      analytics: analyticsData
    });

    this.activeExecutions.delete(executionId);
    this.workflowAnalytics.delete(executionId.toString());
  }

  private async handleEnhancedExecutionError(
    executionId: number,
    error: any,
    analytics: WorkflowAnalyticsTracker
  ): Promise<void> {
    console.error(`❌ Enhanced execution ${executionId} error:`, error);

    const analyticsData = analytics.getAnalytics();
    analyticsData.error_summary = {
      error_message: error.message,
      error_type: error.constructor.name,
      failed_at: new Date().toISOString()
    };

    await this.supabase
      .from('workflow_analytics')
      .insert([analyticsData]);

    await this.jtbdService.updateExecutionStatus(executionId, 'Failed', {
      error_message: error.message,
      failure_timestamp: new Date().toISOString(),
      analytics: analyticsData
    });

    this.activeExecutions.delete(executionId);
    this.workflowAnalytics.delete(executionId.toString());
  }
}

/**
 * Enhanced workflow state management
 */
class EnhancedWorkflowState {
  private completedSteps = new Set<string>();
  private queuedSteps = new Set<string>();
  private pausedSteps = new Set<string>();
  private stepResults = new Map<string, EnhancedStepResult>();
  private stepInputs = new Map<string, any>();
  private stepErrors = new Map<string, number>();
  private stepRetries = new Map<string, number>();
  private globalErrorCount = 0;

  constructor(
    private workflow: EnhancedWorkflowDefinition,
    private context: EnhancedExecutionContext
  ) {
    this.initializeEntrySteps();
  }

  private initializeEntrySteps(): void {
    // Find steps with no dependencies
    const entrySteps = this.workflow.steps.filter(step => {
      const hasIncoming = this.workflow.steps.some(otherStep =>
        otherStep.conditional_next?.some(cond => cond.next_step_id === step.id)
      );
      return !hasIncoming;
    });

    entrySteps.forEach(step => this.queuedSteps.add(step.id));
  }

  getNextExecutableSteps(): EnhancedWorkflowStep[] {
    return this.workflow.steps.filter(step =>
      this.queuedSteps.has(step.id) &&
      !this.completedSteps.has(step.id) &&
      !this.pausedSteps.has(step.id)
    );
  }

  completeStep(stepId: string, result: EnhancedStepResult): void {
    this.completedSteps.add(stepId);
    this.queuedSteps.delete(stepId);
    this.pausedSteps.delete(stepId);
    this.stepResults.set(stepId, result);
    this.stepRetries.delete(stepId); // Reset retry count on success
  }

  queueStep(stepId: string): void {
    if (!this.completedSteps.has(stepId)) {
      this.queuedSteps.add(stepId);
    }
  }

  pauseStep(stepId: string): void {
    this.pausedSteps.add(stepId);
    this.queuedSteps.delete(stepId);
  }

  isComplete(): boolean {
    return this.queuedSteps.size === 0 && this.pausedSteps.size === 0;
  }

  hasPausedSteps(): boolean {
    return this.pausedSteps.size > 0;
  }

  getAccumulatedResults(): EnhancedStepResult[] {
    return Array.from(this.stepResults.values());
  }

  setStepInput(stepId: string, inputData: any): void {
    this.stepInputs.set(stepId, inputData);
  }

  getStepInput(stepId: string): any {
    return this.stepInputs.get(stepId);
  }

  getStepErrorCount(stepId: string): number {
    return this.stepErrors.get(stepId) || 0;
  }

  incrementStepError(stepId: string): void {
    this.stepErrors.set(stepId, (this.stepErrors.get(stepId) || 0) + 1);
    this.globalErrorCount++;
  }

  getStepRetryCount(stepId: string): number {
    return this.stepRetries.get(stepId) || 0;
  }

  incrementStepRetry(stepId: string): void {
    this.stepRetries.set(stepId, (this.stepRetries.get(stepId) || 0) + 1);
  }

  getGlobalErrorCount(): number {
    return this.globalErrorCount;
  }
}

/**
 * Conditional logic evaluator
 */
class ConditionalEvaluator {
  evaluate(
    condition: string,
    result: EnhancedStepResult,
    workflowState: EnhancedWorkflowState,
    context: EnhancedExecutionContext
  ): boolean {
    const evaluationContext = {
      output: result.output_data,
      confidence: result.confidence,
      status: result.status,
      accumulated_results: workflowState.getAccumulatedResults(),
      conditional_state: context.conditional_state
    };

    try {
      const func = new Function(...Object.keys(evaluationContext), `return ${condition}`);
      return func(...Object.values(evaluationContext));
    } catch (error) {
      console.error(`Failed to evaluate condition: ${condition}`, error);
      return false;
    }
  }
}

/**
 * Parallel execution manager
 */
class ParallelExecutor {
  // Future implementation for advanced parallel execution strategies
}

/**
 * Workflow analytics tracker
 */
class WorkflowAnalyticsTracker {
  private startTime: number = 0;
  private stepDurations = new Map<string, number>();
  private stepSuccesses = new Map<string, boolean>();
  private agentUtilization = new Map<string, number>();
  private bottlenecks: string[] = [];

  constructor(
    private workflowId: string,
    private executionId: number
  ) {}

  startExecution(): void {
    this.startTime = Date.now();
  }

  recordStepExecution(stepId: string, duration: number, success: boolean, agentId?: string): void {
    this.stepDurations.set(stepId, duration);
    this.stepSuccesses.set(stepId, success);

    if (agentId) {
      this.agentUtilization.set(agentId, (this.agentUtilization.get(agentId) || 0) + duration);
    }

    // Identify bottlenecks (steps taking >5 minutes)
    if (duration > 300000) {
      this.bottlenecks.push(stepId);
    }
  }

  getAnalytics(): WorkflowAnalytics {
    return {
      workflow_id: this.workflowId,
      execution_id: this.executionId,
      total_duration: Date.now() - this.startTime,
      step_durations: Object.fromEntries(this.stepDurations),
      agent_utilization: Object.fromEntries(this.agentUtilization),
      bottlenecks: this.bottlenecks,
      cost_breakdown: {
        total_cost: this.calculateTotalCost(),
        cost_by_agent: this.calculateCostByAgent(),
        cost_by_step: this.calculateCostByStep()
      },
      optimization_opportunities: this.identifyOptimizations(),
      recorded_at: new Date().toISOString()
    };
  }

  private calculateTotalCost(): number {
    // Simple cost calculation based on duration
    const totalDuration = Array.from(this.stepDurations.values()).reduce((sum, duration) => sum + duration, 0);
    return totalDuration * 0.0001; // $0.0001 per millisecond
  }

  private calculateCostByAgent(): Record<string, number> {
    const costs: Record<string, number> = {};
    for (const [agentId, duration] of this.agentUtilization) {
      costs[agentId] = duration * 0.0001;
    }
    return costs;
  }

  private calculateCostByStep(): Record<string, number> {
    const costs: Record<string, number> = {};
    for (const [stepId, duration] of this.stepDurations) {
      costs[stepId] = duration * 0.0001;
    }
    return costs;
  }

  private identifyOptimizations(): any[] {
    const opportunities = [];

    // Identify bottlenecks
    for (const stepId of this.bottlenecks) {
      opportunities.push({
        type: 'timeout_adjustment',
        description: `Step ${stepId} is taking longer than expected`,
        potential_savings: {
          time_minutes: 5
        },
        implementation_difficulty: 'medium'
      });
    }

    return opportunities;
  }
}

// Export singleton instance
export const enhancedJTBDExecutionEngine = new EnhancedJTBDExecutionEngine();