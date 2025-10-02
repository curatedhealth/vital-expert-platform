/**
 * Agent Orchestrator
 * Coordinates multi-agent workflows and manages agent interactions
 */

import { LibraryLoader } from '@/lib/utils/library-loader';
import {
  AgentResponse,
  ExecutionContext,
  WorkflowDefinition,
  WorkflowStep,
  WorkflowExecution,
  AgentInteraction,
  ComplianceLevel
} from '@/types/digital-health-agent.types';

// Import Tier 1 agents
import { ClinicalTrialDesigner } from '../tier1/ClinicalTrialDesigner';
import { FDARegulatoryStrategist } from '../tier1/FDARegulatoryStrategist';
import { HIPAAComplianceOfficer } from '../tier1/HIPAAComplianceOfficer';
import { QMSArchitect } from '../tier1/QMSArchitect';
import { ReimbursementStrategist } from '../tier1/ReimbursementStrategist';

import { DigitalHealthAgent } from './DigitalHealthAgent';

export class AgentOrchestrator {
  protected agents: Map<string, DigitalHealthAgent> = new Map();
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private activeExecutions: Map<string, WorkflowExecution> = new Map();
  private libraryLoader: LibraryLoader;

  constructor() {
    this.libraryLoader = new LibraryLoader();
  }

  /**
   * Initialize the orchestrator with all available agents
   */
  async initialize(): Promise<void> {
    try {
      // Initialize Tier 1 agents
      await this.registerAgent(new FDARegulatoryStrategist());
      await this.registerAgent(new ClinicalTrialDesigner());
      await this.registerAgent(new HIPAAComplianceOfficer());
      await this.registerAgent(new ReimbursementStrategist());
      await this.registerAgent(new QMSArchitect());

      // Load predefined workflows
      await this.loadWorkflows();
    } catch (error) {
      console.error('❌ Failed to initialize Agent Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Register an agent with the orchestrator
   */
  private async registerAgent(agent: DigitalHealthAgent): Promise<void> {
    await agent.initialize();
    const config = agent.getConfig();
    this.agents.set(config.name, agent);
  }

  /**
   * Load predefined workflows from configuration
   */
  private async loadWorkflows(): Promise<void> {
    // Define common workflows for digital health development
    const workflows: WorkflowDefinition[] = [
      {
        workflow_id: 'regulatory-pathway-analysis',
        name: 'Complete Regulatory Pathway Analysis',
        description: 'Comprehensive analysis involving regulatory strategy, clinical requirements, and compliance',
        steps: [
          {
            step_id: 'regulatory-strategy',
            agent_name: 'fda-regulatory-strategist',
            prompt_title: 'Create FDA Regulatory Strategy',
            required_inputs: ['device_name', 'intended_use', 'device_description', 'technology_type'],
            output_mapping: { pathway: 'regulatory_pathway', timeline: 'regulatory_timeline' }
          },
          {
            step_id: 'clinical-design',
            agent_name: 'clinical-trial-designer',
            prompt_title: 'Design Pivotal Trial Protocol',
            required_inputs: ['device_name', 'indication', 'intended_use', 'regulatory_path'],
            depends_on: ['regulatory-strategy'],
            input_mapping: { regulatory_path: 'regulatory_pathway' }
          },
          {
            step_id: 'hipaa-assessment',
            agent_name: 'hipaa-compliance-officer',
            prompt_title: 'Conduct HIPAA Risk Assessment',
            required_inputs: ['organization_type', 'phi_types_handled', 'systems_involved'],
            depends_on: ['regulatory-strategy']
          }
        ],
        estimated_duration_minutes: 15,
        compliance_level: ComplianceLevel.CRITICAL
      },
      {
        workflow_id: 'market-access-strategy',
        name: 'Complete Market Access Strategy',
        description: 'End-to-end market access planning including regulatory, reimbursement, and quality',
        steps: [
          {
            step_id: 'regulatory-pathway',
            agent_name: 'fda-regulatory-strategist',
            prompt_title: 'Create FDA Regulatory Strategy',
            required_inputs: ['device_name', 'intended_use', 'device_description'],
            output_mapping: { pathway: 'regulatory_pathway', timeline: 'regulatory_timeline' }
          },
          {
            step_id: 'reimbursement-strategy',
            agent_name: 'reimbursement-strategist',
            prompt_title: 'Develop Reimbursement Strategy',
            required_inputs: ['device_name', 'intended_use', 'clinical_setting', 'target_population'],
            depends_on: ['regulatory-pathway']
          },
          {
            step_id: 'qms-requirements',
            agent_name: 'qms-architect',
            prompt_title: 'Design QMS Architecture',
            required_inputs: ['device_types', 'regulatory_markets'],
            depends_on: ['regulatory-pathway'],
            input_mapping: { regulatory_markets: 'regulatory_pathway' }
          }
        ],
        estimated_duration_minutes: 20,
        compliance_level: ComplianceLevel.HIGH
      },
      {
        workflow_id: 'clinical-development-plan',
        name: 'Clinical Development Planning',
        description: 'Comprehensive clinical development strategy with regulatory and quality considerations',
        steps: [
          {
            step_id: 'trial-design',
            agent_name: 'clinical-trial-designer',
            prompt_title: 'Design Pivotal Trial Protocol',
            required_inputs: ['device_name', 'indication', 'intended_use', 'comparator'],
            output_mapping: { sample_size: 'required_subjects', duration: 'study_duration' }
          },
          {
            step_id: 'regulatory-alignment',
            agent_name: 'fda-regulatory-strategist',
            prompt_title: 'Plan Pre-Submission Meeting',
            required_inputs: ['device_name', 'intended_use', 'regulatory_questions'],
            depends_on: ['trial-design']
          },
          {
            step_id: 'quality-requirements',
            agent_name: 'qms-architect',
            prompt_title: 'Create Risk Management Plan',
            required_inputs: ['device_name', 'intended_use', 'known_hazards'],
            depends_on: ['trial-design']
          },
          {
            step_id: 'data-protection',
            agent_name: 'hipaa-compliance-officer',
            prompt_title: 'Create Privacy Policies',
            required_inputs: ['organization_name', 'organization_type', 'phi_uses'],
            depends_on: ['trial-design']
          }
        ],
        estimated_duration_minutes: 25,
        compliance_level: ComplianceLevel.CRITICAL
      }
    ];

    workflows.forEach(workflow => {
      this.workflows.set(workflow.workflow_id, workflow);
    });
  }

  /**
   * Execute a workflow with given inputs
   */
  async executeWorkflow(
    workflowId: string,
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow '${workflowId}' not found`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const execution: WorkflowExecution = {
      execution_id: executionId,
      workflow_id: workflowId,
      status: 'running',
      started_at: new Date().toISOString(),
      inputs,
      context,
      steps_completed: 0,
      total_steps: workflow.steps.length,
      step_results: { /* TODO: implement */ },
      interactions: []
    };

    this.activeExecutions.set(executionId, execution);
    try {
      // Execute steps in dependency order
      const stepOrder = this.calculateStepOrder(workflow.steps);

      for (const stepId of stepOrder) {
        const step = workflow.steps.find(s => s.step_id === stepId);
        if (!step) continue;
        const stepResult = await this.executeStep(step, execution);
        // Validate stepId before using as object key
        if (this.isValidKey(stepId)) {
          // Use direct assignment with validated key
          // eslint-disable-next-line security/detect-object-injection
          execution.step_results[stepId] = stepResult;
        } else {
          throw new Error(`Invalid stepId: ${stepId}`);
        }
        execution.steps_completed++;

        // Log the interaction
        const interaction: AgentInteraction = {
          interaction_id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          timestamp: new Date().toISOString(),
          agent_name: step.agent_name,
          action: step.prompt_title,
          inputs: stepResult.inputs_used,
          outputs: stepResult.response,
          success: stepResult.response.success,
          execution_time: stepResult.response.execution_time || 0
        };
        execution.interactions.push(interaction);
      }

      execution.status = 'completed';
      execution.completed_at = new Date().toISOString();

      const duration = this.calculateExecutionDuration(execution);
      console.log(`✅ Workflow completed: ${workflow.name} (${duration} minutes)`);

    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completed_at = new Date().toISOString();

      console.error(`❌ Workflow execution failed: ${workflow.name}`, error);
    }

    return execution;
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<{
    response: AgentResponse;
    inputs_used: Record<string, unknown>;
  }> {
    const agent = this.agents.get(step.agent_name);
    if (!agent) {
      throw new Error(`Agent '${step.agent_name}' not found`);
    }

    // Prepare inputs for this step
    const stepInputs = this.prepareStepInputs(step, execution);

    // Execute the prompt
    const response = await agent.executePrompt(
      step.prompt_title,
      stepInputs,
      execution.context
    );

    return {
      response,
      inputs_used: stepInputs
    };
  }

  /**
   * Prepare inputs for a workflow step
   */
  private prepareStepInputs(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Record<string, unknown> {
    const inputs: Record<string, unknown> = { /* TODO: implement */ };

    // Start with required inputs from workflow inputs
    step.required_inputs.forEach(inputKey => {
      // Validate inputKey before using as object key
      if (this.isValidKey(inputKey)) {
        // Use hasOwnProperty check and direct assignment for safer property access
        if (Object.prototype.hasOwnProperty.call(execution.inputs, inputKey)) {
          // Use direct assignment with validated key
          // eslint-disable-next-line security/detect-object-injection
          inputs[inputKey] = execution.inputs[inputKey];
        }
      } else {
        console.warn(`Invalid inputKey: ${inputKey}`);
      }
    });

    // Apply input mapping from previous steps
    if (step.input_mapping && step.depends_on) {
      for (const [targetKey, sourceKey] of Object.entries(step.input_mapping)) {
        // Validate keys before using as object keys
        if (this.isValidKey(targetKey) && this.isValidKey(sourceKey)) {
          for (const dependencyStepId of step.depends_on) {
            // Validate dependencyStepId before using as object key
            if (this.isValidKey(dependencyStepId)) {
              // Use hasOwnProperty check for safer property access
              if (Object.prototype.hasOwnProperty.call(execution.step_results, dependencyStepId)) {
                // eslint-disable-next-line security/detect-object-injection
                const dependencyResult = execution.step_results[dependencyStepId];
                if (dependencyResult?.response?.data && Object.prototype.hasOwnProperty.call(dependencyResult.response.data, sourceKey)) {
                  // Use direct assignment with validated key
                  // eslint-disable-next-line security/detect-object-injection
                  inputs[targetKey] = dependencyResult.response.data[sourceKey];
                  break;
                }
              }
            }
          }
        } else {
          console.warn(`Invalid mapping keys: targetKey=${targetKey}, sourceKey=${sourceKey}`);
        }
      }
    }

    return inputs;
  }

  /**
   * Validate if a key is safe to use as an object property
   */
  private isValidKey(key: string): boolean {
    return typeof key === 'string' && 
           key.length > 0 && 
           key.length < 100 && 
           /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(key);
  }

  /**
   * Safely set a property on an object to avoid injection vulnerabilities
   */
  private safeSetProperty(obj: Record<string, unknown>, key: string, value: unknown): void {
    if (this.isValidKey(key)) {
      // Use Object.defineProperty for safe property assignment
      Object.defineProperty(obj, key, {
        value: value,
        writable: true,
        enumerable: true,
        configurable: true
      });
    } else {
      throw new Error(`Invalid key for property assignment: ${key}`);
    }
  }

  /**
   * Calculate execution order based on dependencies
   */
  private calculateStepOrder(steps: WorkflowStep[]): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (stepId: string) => {
      if (visiting.has(stepId)) {
        throw new Error(`Circular dependency detected involving step: ${stepId}`);
      }
      if (visited.has(stepId)) {
        return;
      }

      visiting.add(stepId);

      const step = steps.find(s => s.step_id === stepId);
      if (step?.depends_on) {
        step.depends_on.forEach(depId => visit(depId));
      }

      visiting.delete(stepId);
      visited.add(stepId);
      order.push(stepId);
    };

    steps.forEach(step => {
      if (!visited.has(step.step_id)) {
        visit(step.step_id);
      }
    });

    return order;
  }

  /**
   * Calculate execution duration in minutes
   */
  private calculateExecutionDuration(execution: WorkflowExecution): number {
    if (!execution.completed_at) return 0;

    const start = new Date(execution.started_at).getTime();
    const end = new Date(execution.completed_at).getTime();
    return Math.round((end - start) / (1000 * 60) * 10) / 10; // Round to 1 decimal
  }

  /**
   * Get available workflows
   */
  getAvailableWorkflows(): Array<{
    workflow_id: string;
    name: string;
    description: string;
    required_inputs: string[];
    estimated_duration_minutes: number;
  }> {
    return Array.from(this.workflows.values()).map(workflow => ({
      workflow_id: workflow.workflow_id,
      name: workflow.name,
      description: workflow.description,
      required_inputs: this.getWorkflowRequiredInputs(workflow),
      estimated_duration_minutes: workflow.estimated_duration_minutes
    }));
  }

  /**
   * Get required inputs for a workflow
   */
  private getWorkflowRequiredInputs(workflow: WorkflowDefinition): string[] {
    const allInputs = new Set<string>();

    workflow.steps.forEach(step => {
      step.required_inputs.forEach(input => {
        // Only include inputs that aren't mapped from other steps
        const isMapped = workflow.steps.some(otherStep =>
          otherStep.output_mapping && Object.values(otherStep.output_mapping).includes(input)
        );

        if (!isMapped) {
          allInputs.add(input);
        }
      });
    });

    return Array.from(allInputs);
  }

  /**
   * Get execution status
   */
  getExecutionStatus(executionId: string): WorkflowExecution | undefined {
    return this.activeExecutions.get(executionId);
  }

  /**
   * Get all active executions
   */
  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Get agent status
   */
  getAgentStatus(): Array<{
    name: string;
    display_name: string;
    status: string;
    capabilities_loaded: number;
    prompts_loaded: number;
  }> {
    return Array.from(this.agents.values()).map(agent => agent.getStatus());
  }

  /**
   * Execute a single agent prompt (direct execution)
   */
  async executeAgentPrompt(
    agentName: string,
    promptTitle: string,
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<AgentResponse> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent '${agentName}' not found`);
    }
    const response = await agent.executePrompt(promptTitle, inputs, context);
    return response;
  }

  /**
   * Get agent capabilities
   */
  getAgentCapabilities(agentName: string): string[] {
    const agent = this.agents.get(agentName);
    return agent ? agent.getCapabilities() : [];
  }

  /**
   * Get agent prompts
   */
  getAgentPrompts(agentName: string): string[] {
    const agent = this.agents.get(agentName);
    return agent ? agent.getPrompts() : [];
  }

  /**
   * Cleanup completed executions (memory management)
   */
  cleanupExecutions(olderThanHours: number = 24): void {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

    for (const [executionId, execution] of this.activeExecutions.entries()) {
      const executionTime = new Date(execution.started_at).getTime();

      if (executionTime < cutoffTime && (execution.status === 'completed' || execution.status === 'failed')) {
        this.activeExecutions.delete(executionId);
      }
    }
  }
}