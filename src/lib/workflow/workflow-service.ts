import { createClient } from '@supabase/supabase-js';
import {
  EnhancedWorkflowDefinition,
  WorkflowTemplate,
  WorkflowExecution,
  AgentPerformanceMetrics,
  WorkflowAnalytics,
  ValidationResult,
  AgentSelectionStrategy,
  EnhancedWorkflowStep,
  ExecutionStatus,
  AgentSelectionCriteria
} from '@/types/workflow-enhanced';
import { Agent } from '@/lib/agents/agent-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export class EnhancedWorkflowService {
  private supabase = createClient(supabaseUrl, supabaseKey);

  // Workflow Template Management
  async getWorkflowTemplates(filters?: {
    category?: string;
    industry_tags?: string[];
    complexity_level?: string;
    is_public?: boolean;
  }): Promise<WorkflowTemplate[]> {
    let query = this.supabase
      .from('workflow_templates')
      .select('*')
      .order('usage_count', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.complexity_level) {
      query = query.eq('complexity_level', filters.complexity_level);
    }

    if (filters?.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }

    if (filters?.industry_tags && filters.industry_tags.length > 0) {
      query = query.overlaps('industry_tags', filters.industry_tags);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching workflow templates:', error);
      throw error;
    }

    return data || [];
  }

  async createWorkflowTemplate(template: Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowTemplate> {
    const { data, error } = await this.supabase
      .from('workflow_templates')
      .insert([template])
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow template:', error);
      throw error;
    }

    return data;
  }

  async updateWorkflowTemplate(id: string, updates: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
    const { data, error } = await this.supabase
      .from('workflow_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating workflow template:', error);
      throw error;
    }

    return data;
  }

  async deleteWorkflowTemplate(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('workflow_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting workflow template:', error);
      throw error;
    }
  }

  // Dynamic Agent Selection
  async selectOptimalAgent(
    step: EnhancedWorkflowStep,
    availableAgents: Agent[],
    selectionStrategy?: AgentSelectionStrategy
  ): Promise<Agent | Agent[]> {
    const strategy = selectionStrategy || step.agent_selection;

    if (!strategy) {
      // Default to first available agent with required capabilities
      return this.selectByCapabilities(step, availableAgents);
    }

    switch (strategy.strategy) {
      case 'capability_based':
        return this.selectByCapabilities(step, availableAgents, strategy.criteria);

      case 'automatic':
        return this.selectByPerformance(step, availableAgents, strategy.criteria);

      case 'load_balanced':
        return this.selectByLoadBalancing(step, availableAgents, strategy.criteria);

      case 'consensus':
        return this.selectForConsensus(step, availableAgents, strategy);

      case 'manual':
      default:
        return availableAgents[0]; // Return first agent for manual selection
    }
  }

  private async selectByCapabilities(
    step: EnhancedWorkflowStep,
    availableAgents: Agent[],
    criteria?: AgentSelectionCriteria
  ): Promise<Agent> {
    const requiredCapabilities = step.required_capabilities || [];

    // Filter agents by required capabilities
    const capableAgents = availableAgents.filter(agent => {
      return requiredCapabilities.every(capability =>
        agent.capabilities?.includes(capability)
      );
    });

    if (capableAgents.length === 0) {
      throw new Error(`No agents found with required capabilities: ${requiredCapabilities.join(', ')}`);
    }

    // If criteria specified, rank by preferred capabilities and performance
    if (criteria) {
      const rankedAgents = await this.rankAgentsByCriteria(capableAgents, criteria, step.id.toString());
      return rankedAgents[0];
    }

    return capableAgents[0];
  }

  private async selectByPerformance(
    step: EnhancedWorkflowStep,
    availableAgents: Agent[],
    criteria?: AgentSelectionCriteria
  ): Promise<Agent> {
    // Get performance metrics for all available agents
    const agentPerformance = await this.getAgentPerformanceMetrics(
      availableAgents.map(a => a.id),
      step.id.toString()
    );

    // Rank agents by performance metrics
    const rankedAgents = availableAgents
      .map(agent => {
        const performance = agentPerformance.find(p => p.agent_id === agent.id);
        return {
          agent,
          score: this.calculatePerformanceScore(performance, criteria)
        };
      })
      .sort((a, b) => b.score - a.score);

    return rankedAgents[0].agent;
  }

  private async selectByLoadBalancing(
    step: EnhancedWorkflowStep,
    availableAgents: Agent[],
    criteria?: AgentSelectionCriteria
  ): Promise<Agent> {
    // Get current workload for each agent
    const workloads = await this.getAgentCurrentWorkloads(availableAgents.map(a => a.id));

    // Select agent with lowest workload that meets criteria
    const sortedByWorkload = availableAgents
      .map(agent => ({
        agent,
        workload: workloads[agent.id] || 0
      }))
      .sort((a, b) => a.workload - b.workload);

    return sortedByWorkload[0].agent;
  }

  private async selectForConsensus(
    step: EnhancedWorkflowStep,
    availableAgents: Agent[],
    strategy: AgentSelectionStrategy
  ): Promise<Agent[]> {
    const consensusConfig = strategy.consensus_config;
    if (!consensusConfig) {
      throw new Error('Consensus configuration required for consensus strategy');
    }

    // Select multiple agents based on performance and capabilities
    const rankedAgents = await this.rankAgentsByCriteria(
      availableAgents,
      strategy.criteria,
      step.id.toString()
    );

    const selectedCount = Math.min(
      Math.max(consensusConfig.min_agents, 2),
      Math.min(consensusConfig.max_agents, rankedAgents.length)
    );

    return rankedAgents.slice(0, selectedCount);
  }

  private async rankAgentsByCriteria(
    agents: Agent[],
    criteria?: AgentSelectionCriteria,
    stepId?: string
  ): Promise<Agent[]> {
    if (!criteria) {
      return agents;
    }

    const agentPerformance = await this.getAgentPerformanceMetrics(
      agents.map(a => a.id),
      stepId
    );

    return agents
      .map(agent => {
        const performance = agentPerformance.find(p => p.agent_id === agent.id);
        return {
          agent,
          score: this.calculatePerformanceScore(performance, criteria)
        };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.agent);
  }

  private calculatePerformanceScore(
    performance?: AgentPerformanceMetrics,
    criteria?: AgentSelectionCriteria
  ): number {
    if (!performance || !criteria) {
      return Math.random(); // Random score if no data
    }

    let score = 0;
    let weights = 0;

    // Success rate weight
    if (criteria.min_success_rate !== undefined) {
      const successWeight = criteria.performance_weight || 0.4;
      score += performance.success_rate * successWeight;
      weights += successWeight;
    }

    // Quality score weight
    if (performance.quality_score !== undefined) {
      const qualityWeight = criteria.performance_weight || 0.3;
      score += performance.quality_score * qualityWeight;
      weights += qualityWeight;
    }

    // Cost efficiency (inverse of cost per token)
    if (criteria.max_cost_per_token !== undefined && performance.cost_per_token > 0) {
      const costWeight = criteria.cost_weight || 0.2;
      const costScore = Math.max(0, 1 - (performance.cost_per_token / criteria.max_cost_per_token));
      score += costScore * costWeight;
      weights += costWeight;
    }

    // Availability weight (simplified - could be enhanced with real-time data)
    const availabilityWeight = criteria.availability_weight || 0.1;
    score += 1.0 * availabilityWeight; // Assume all agents are available
    weights += availabilityWeight;

    return weights > 0 ? score / weights : Math.random();
  }

  // Performance Metrics and Analytics
  async recordAgentPerformance(metrics: Omit<AgentPerformanceMetrics, 'id' | 'recorded_at'>): Promise<void> {
    const { error } = await this.supabase
      .from('agent_performance_metrics')
      .insert([{
        ...metrics,
        recorded_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error recording agent performance:', error);
      throw error;
    }
  }

  async getAgentPerformanceMetrics(
    agentIds: string[],
    stepId?: string,
    timeRange?: { start: string; end: string }
  ): Promise<AgentPerformanceMetrics[]> {
    let query = this.supabase
      .from('agent_performance_metrics')
      .select('*')
      .in('agent_id', agentIds);

    if (stepId) {
      query = query.eq('step_id', stepId);
    }

    if (timeRange) {
      query = query
        .gte('recorded_at', timeRange.start)
        .lte('recorded_at', timeRange.end);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching agent performance metrics:', error);
      throw error;
    }

    return data || [];
  }

  async getAgentCurrentWorkloads(agentIds: string[]): Promise<Record<string, number>> {
    // Query current executions to determine workload
    // This is a simplified implementation - could be enhanced with real-time data
    const { data, error } = await this.supabase
      .from('jtbd_executions')
      .select('agent_id')
      .in('agent_id', agentIds)
      .eq('status', 'running');

    if (error) {
      console.error('Error fetching agent workloads:', error);
      return {};
    }

    const workloads: Record<string, number> = {};
    agentIds.forEach(id => workloads[id] = 0);

    data?.forEach(execution => {
      if (execution.agent_id) {
        workloads[execution.agent_id] = (workloads[execution.agent_id] || 0) + 1;
      }
    });

    return workloads;
  }

  // Workflow Validation
  async validateWorkflow(workflow: EnhancedWorkflowDefinition): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Basic structure validation
    await this.validateBasicStructure(workflow, errors, warnings);

    // Step validation
    await this.validateSteps(workflow, errors, warnings);

    // Conditional logic validation
    await this.validateConditionalLogic(workflow, errors, warnings);

    // Parallel execution validation
    await this.validateParallelExecution(workflow, errors, warnings);

    // Agent assignment validation
    await this.validateAgentAssignments(workflow, errors, warnings);

    // Dependencies validation
    await this.validateDependencies(workflow, errors, warnings);

    // Success criteria validation
    await this.validateSuccessCriteria(workflow, errors, warnings);

    // Performance constraints validation
    await this.validatePerformanceConstraints(workflow, errors, warnings);

    return {
      is_valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async validateBasicStructure(
    workflow: EnhancedWorkflowDefinition,
    errors: any[],
    warnings: any[]
  ): Promise<void> {
    // Required fields
    if (!workflow.name || workflow.name.trim().length === 0) {
      errors.push({
        error_type: 'missing_required_field',
        message: 'Workflow name is required',
        field: 'name',
        severity: 'error'
      });
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push({
        error_type: 'missing_required_field',
        message: 'Workflow must have at least one step',
        field: 'steps',
        severity: 'error'
      });
      return; // Can't validate further without steps
    }

    // Validate execution configuration
    if (!workflow.execution_config) {
      errors.push({
        error_type: 'missing_required_field',
        message: 'Execution configuration is required',
        field: 'execution_config',
        severity: 'error'
      });
    }

    // Check for reasonable duration estimate
    if (workflow.estimated_duration && workflow.estimated_duration > 10080) { // 1 week
      warnings.push({
        warning_type: 'long_duration',
        message: 'Workflow duration exceeds one week',
        field: 'estimated_duration'
      });
    }
  }

  private async validateSteps(
    workflow: EnhancedWorkflowDefinition,
    errors: any[],
    warnings: any[]
  ): Promise<void> {
    if (!workflow.steps) return;

    const stepIds = new Set<string>();

    for (const step of workflow.steps) {
      // Check for duplicate step IDs
      if (stepIds.has(step.id.toString())) {
        errors.push({
          error_type: 'duplicate_step_id',
          step_id: step.id.toString(),
          message: `Duplicate step ID: ${step.id}`,
          severity: 'error'
        });
      }
      stepIds.add(step.id.toString());

      // Validate required fields
      if (!step.step_name || step.step_name.trim().length === 0) {
        errors.push({
          error_type: 'missing_step_name',
          step_id: step.id.toString(),
          message: 'Step name is required',
          severity: 'error'
        });
      }

      // Validate capabilities
      if (!step.required_capabilities || step.required_capabilities.length === 0) {
        warnings.push({
          warning_type: 'no_required_capabilities',
          step_id: step.id.toString(),
          message: 'No required capabilities specified for step'
        });
      }

      // Validate timeout configuration
      if (step.timeout_config) {
        if (step.timeout_config.execution_timeout <= 0) {
          errors.push({
            error_type: 'invalid_timeout',
            step_id: step.id.toString(),
            message: 'Execution timeout must be positive',
            severity: 'error'
          });
        }
      }

      // Validate retry configuration
      if (step.retry_config) {
        if (step.retry_config.max_attempts < 1) {
          errors.push({
            error_type: 'invalid_retry_config',
            step_id: step.id.toString(),
            message: 'Max retry attempts must be at least 1',
            severity: 'error'
          });
        }
      }
    }
  }

  private async validateConditionalLogic(
    workflow: EnhancedWorkflowDefinition,
    errors: any[],
    warnings: any[]
  ): Promise<void> {
    if (!workflow.steps) return;

    const stepIds = new Set(workflow.steps.map(s => s.id.toString()));

    for (const step of workflow.steps) {
      if (step.conditional_next) {
        for (const condition of step.conditional_next) {
          // Validate next step exists
          if (!stepIds.has(condition.next_step_id)) {
            errors.push({
              error_type: 'invalid_next_step',
              step_id: step.id.toString(),
              message: `Next step '${condition.next_step_id}' does not exist`,
              severity: 'error'
            });
          }

          // Validate condition expression (basic check)
          if (!condition.condition || condition.condition.trim().length === 0) {
            errors.push({
              error_type: 'empty_condition',
              step_id: step.id.toString(),
              message: 'Conditional next step requires a condition expression',
              severity: 'error'
            });
          }
        }
      }
    }
  }

  private async validateParallelExecution(
    workflow: EnhancedWorkflowDefinition,
    errors: any[],
    warnings: any[]
  ): Promise<void> {
    if (!workflow.parallel_branches) return;

    const stepIds = new Set(workflow.steps?.map(s => s.id.toString()) || []);

    for (const branch of workflow.parallel_branches) {
      // Validate all steps in branch exist
      for (const stepId of branch.steps) {
        if (!stepIds.has(stepId)) {
          errors.push({
            error_type: 'invalid_parallel_step',
            message: `Parallel branch references non-existent step: ${stepId}`,
            severity: 'error'
          });
        }
      }

      // Check for reasonable branch size
      if (branch.steps.length > 10) {
        warnings.push({
          warning_type: 'large_parallel_branch',
          message: `Parallel branch '${branch.name}' has many steps (${branch.steps.length})`,
        });
      }
    }
  }

  private async validateAgentAssignments(
    workflow: EnhancedWorkflowDefinition,
    errors: any[],
    warnings: any[]
  ): Promise<void> {
    if (!workflow.steps) return;

    for (const step of workflow.steps) {
      if (step.agent_selection) {
        const strategy = step.agent_selection;

        // Validate consensus configuration
        if (strategy.strategy === 'consensus' && !strategy.consensus_config) {
          errors.push({
            error_type: 'missing_consensus_config',
            step_id: step.id.toString(),
            message: 'Consensus strategy requires consensus configuration',
            severity: 'error'
          });
        }

        // Validate consensus thresholds
        if (strategy.consensus_config) {
          const config = strategy.consensus_config;
          if (config.min_agents < 2) {
            errors.push({
              error_type: 'invalid_consensus_config',
              step_id: step.id.toString(),
              message: 'Consensus requires at least 2 agents',
              severity: 'error'
            });
          }

          if (config.agreement_threshold < 0 || config.agreement_threshold > 1) {
            errors.push({
              error_type: 'invalid_consensus_config',
              step_id: step.id.toString(),
              message: 'Agreement threshold must be between 0 and 1',
              severity: 'error'
            });
          }
        }
      }
    }
  }

  private async validateDependencies(
    workflow: EnhancedWorkflowDefinition,
    errors: any[],
    warnings: any[]
  ): Promise<void> {
    if (!workflow.steps) return;

    // Check for circular dependencies
    if (this.hasCircularDependency(workflow)) {
      errors.push({
        error_type: 'circular_dependency',
        message: 'Workflow contains circular dependencies',
        severity: 'error'
      });
    }

    // Check for unreachable steps
    const reachableSteps = this.findReachableSteps(workflow);
    const allStepIds = new Set(workflow.steps.map(s => s.id.toString()));

    for (const stepId of allStepIds) {
      if (!reachableSteps.has(stepId)) {
        warnings.push({
          warning_type: 'unreachable_step',
          step_id: stepId,
          message: `Step is unreachable from workflow entry points`
        });
      }
    }

    // Check for dead ends (steps with no next steps and not marked as final)
    for (const step of workflow.steps) {
      const hasNextSteps = step.conditional_next && step.conditional_next.length > 0;
      const isInParallelBranch = workflow.parallel_branches?.some(branch =>
        branch.steps.includes(step.id.toString())
      );

      if (!hasNextSteps && !isInParallelBranch) {
        const isLastStep = step.step_number === Math.max(...workflow.steps.map(s => s.step_number));
        if (!isLastStep) {
          warnings.push({
            warning_type: 'potential_dead_end',
            step_id: step.id.toString(),
            message: 'Step has no next steps and may be a dead end'
          });
        }
      }
    }
  }

  private async validateSuccessCriteria(
    workflow: EnhancedWorkflowDefinition,
    errors: any[],
    warnings: any[]
  ): Promise<void> {
    if (!workflow.success_criteria) {
      warnings.push({
        warning_type: 'missing_success_criteria',
        message: 'Workflow has no defined success criteria'
      });
      return;
    }

    const criteria = workflow.success_criteria;

    // Validate required outputs
    if (criteria.required_outputs && criteria.required_outputs.length > 0) {
      const allPossibleOutputs = new Set(
        workflow.steps?.flatMap(step =>
          Object.keys(step.output_schema?.properties || {})
        ) || []
      );

      for (const requiredOutput of criteria.required_outputs) {
        if (!allPossibleOutputs.has(requiredOutput)) {
          warnings.push({
            warning_type: 'missing_required_output',
            message: `Required output '${requiredOutput}' is not produced by any step`
          });
        }
      }
    }

    // Validate quality thresholds
    if (criteria.quality_thresholds) {
      for (const [metric, threshold] of Object.entries(criteria.quality_thresholds)) {
        if (typeof threshold !== 'number' || threshold < 0 || threshold > 1) {
          errors.push({
            error_type: 'invalid_quality_threshold',
            message: `Quality threshold for '${metric}' must be between 0 and 1`,
            severity: 'error'
          });
        }
      }
    }
  }

  private async validatePerformanceConstraints(
    workflow: EnhancedWorkflowDefinition,
    errors: any[],
    warnings: any[]
  ): Promise<void> {
    if (!workflow.steps) return;

    let totalEstimatedDuration = 0;

    for (const step of workflow.steps) {
      if (step.estimated_duration) {
        totalEstimatedDuration += step.estimated_duration;
      }

      // Check for reasonable timeout values
      if (step.timeout_config) {
        if (step.timeout_config.execution_timeout > 3600000) { // 1 hour
          warnings.push({
            warning_type: 'long_timeout',
            step_id: step.id.toString(),
            message: 'Step timeout exceeds 1 hour'
          });
        }
      }
    }

    // Check if total duration matches workflow estimate
    if (workflow.estimated_duration && totalEstimatedDuration > 0) {
      const difference = Math.abs(workflow.estimated_duration - totalEstimatedDuration);
      if (difference > workflow.estimated_duration * 0.2) { // 20% difference
        warnings.push({
          warning_type: 'duration_mismatch',
          message: 'Workflow estimated duration differs significantly from sum of step durations'
        });
      }
    }
  }

  private hasCircularDependency(workflow: EnhancedWorkflowDefinition): boolean {
    if (!workflow.steps) return false;

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) {
        return true; // Found cycle
      }

      if (visited.has(stepId)) {
        return false;
      }

      visited.add(stepId);
      recursionStack.add(stepId);

      const step = workflow.steps.find(s => s.id.toString() === stepId);
      if (step?.conditional_next) {
        for (const condition of step.conditional_next) {
          if (dfs(condition.next_step_id)) {
            return true;
          }
        }
      }

      recursionStack.delete(stepId);
      return false;
    };

    // Check all steps
    for (const step of workflow.steps) {
      if (dfs(step.id.toString())) {
        return true;
      }
    }

    return false;
  }

  private findReachableSteps(workflow: EnhancedWorkflowDefinition): Set<string> {
    if (!workflow.steps) return new Set();

    const reachable = new Set<string>();
    const visited = new Set<string>();

    // Find entry points (steps with no incoming edges)
    const hasIncoming = new Set<string>();
    for (const step of workflow.steps) {
      if (step.conditional_next) {
        for (const condition of step.conditional_next) {
          hasIncoming.add(condition.next_step_id);
        }
      }
    }

    const entryPoints = workflow.steps
      .filter(step => !hasIncoming.has(step.id.toString()))
      .map(step => step.id.toString());

    const dfs = (stepId: string) => {
      if (visited.has(stepId)) return;
      visited.add(stepId);
      reachable.add(stepId);

      const step = workflow.steps.find(s => s.id.toString() === stepId);
      if (step?.conditional_next) {
        for (const condition of step.conditional_next) {
          dfs(condition.next_step_id);
        }
      }
    };

    // Start DFS from all entry points
    for (const entryPoint of entryPoints) {
      dfs(entryPoint);
    }

    return reachable;
  }

  // Workflow Analytics
  async recordWorkflowAnalytics(analytics: Omit<WorkflowAnalytics, 'id' | 'recorded_at'>): Promise<void> {
    const { error } = await this.supabase
      .from('workflow_analytics')
      .insert([{
        ...analytics,
        recorded_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error recording workflow analytics:', error);
      throw error;
    }
  }

  async getWorkflowAnalytics(
    workflowId: string,
    timeRange?: { start: string; end: string }
  ): Promise<WorkflowAnalytics[]> {
    let query = this.supabase
      .from('workflow_analytics')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('recorded_at', { ascending: false });

    if (timeRange) {
      query = query
        .gte('recorded_at', timeRange.start)
        .lte('recorded_at', timeRange.end);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching workflow analytics:', error);
      throw error;
    }

    return data || [];
  }

  // Utility methods
  async incrementTemplateUsage(templateId: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_template_usage', {
      template_id: templateId
    });

    if (error) {
      console.error('Error incrementing template usage:', error);
    }
  }

  async rateTemplate(templateId: string, rating: number): Promise<void> {
    // Update template rating (simplified - could implement proper rating aggregation)
    const { error } = await this.supabase
      .from('workflow_templates')
      .update({ rating })
      .eq('id', templateId);

    if (error) {
      console.error('Error rating template:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const workflowService = new EnhancedWorkflowService();