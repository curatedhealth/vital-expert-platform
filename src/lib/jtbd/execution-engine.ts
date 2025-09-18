import { createClient } from '@supabase/supabase-js';
import { AgentService, type Agent } from '@/lib/agents/agent-service';
import { JTBDService, type DetailedJTBD, type JTBDProcessStep, type JTBDExecution } from '@/lib/jtbd/jtbd-service';
import { llmOrchestrator } from '@/lib/llm/orchestrator';

export interface ExecutionContext {
  execution_id: number;
  jtbd_id: string;
  user_id: string;
  execution_mode: 'Automated' | 'Semi-automated' | 'Manual';
  input_data?: any;
  current_step: number;
  total_steps: number;
  accumulated_results: any[];
  error_count: number;
  start_time: Date;
  agent_assignments?: { [stepNumber: number]: string };
}

export interface StepResult {
  step_number: number;
  status: 'Completed' | 'Failed' | 'Skipped' | 'User_Input_Required';
  agent_used?: string;
  execution_time_minutes: number;
  output_data?: any;
  error_message?: string;
  user_feedback_required?: boolean;
  next_step_recommendations?: string[];
}

export interface ExecutionProgress {
  execution_id: number;
  current_step: number;
  total_steps: number;
  progress_percentage: number;
  status: 'Running' | 'Paused' | 'Completed' | 'Failed';
  current_step_name: string;
  estimated_remaining_minutes: number;
  step_results: StepResult[];
  live_updates: string[];
}

export class JTBDExecutionEngine {
  private supabase: any;
  private agentService: AgentService;
  private jtbdService: JTBDService;
  private llmOrchestrator: typeof llmOrchestrator;
  private activeExecutions: Map<number, ExecutionContext> = new Map();

  constructor(customSupabase?: any) {
    this.supabase = customSupabase || createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.agentService = new AgentService();
    this.jtbdService = new JTBDService(this.supabase);
    this.llmOrchestrator = llmOrchestrator;
  }

  /**
   * Start executing a JTBD workflow
   */
  async startExecution(request: {
    jtbd_id: string;
    user_id: string;
    execution_mode: 'Automated' | 'Semi-automated' | 'Manual';
    input_data?: any;
    agent_assignments?: { [stepNumber: number]: string };
  }): Promise<{ execution_id: number; status: string }> {
    try {
      console.log(`🚀 Starting JTBD execution: ${request.jtbd_id}`);

      // 1. Get detailed JTBD information
      const jtbd = await this.jtbdService.getDetailedJTBD(request.jtbd_id);
      if (!jtbd) {
        throw new Error(`JTBD ${request.jtbd_id} not found`);
      }

      // 2. Validate execution readiness
      const validation = await this.validateExecutionReadiness(jtbd);
      if (!validation.isReady) {
        throw new Error(`JTBD not ready for execution: ${validation.reasons.join(', ')}`);
      }

      // 3. Create execution record
      const execution = await this.jtbdService.startExecution({
        jtbd_id: request.jtbd_id,
        user_id: request.user_id,
        execution_mode: request.execution_mode,
        input_data: request.input_data
      });

      // 4. Set up execution context
      const context: ExecutionContext = {
        execution_id: execution.id,
        jtbd_id: request.jtbd_id,
        user_id: request.user_id,
        execution_mode: request.execution_mode,
        input_data: request.input_data,
        current_step: 0,
        total_steps: jtbd.process_steps.length,
        accumulated_results: [],
        error_count: 0,
        start_time: new Date(),
        agent_assignments: request.agent_assignments
      };

      this.activeExecutions.set(execution.id, context);

      // 5. Start execution in background
      this.executeWorkflow(execution.id, jtbd).catch(error => {
        console.error(`❌ Execution ${execution.id} failed:`, error);
        this.handleExecutionError(execution.id, error);
      });

      return {
        execution_id: execution.id,
        status: 'Started'
      };

    } catch (error) {
      console.error('Failed to start JTBD execution:', error);
      throw error;
    }
  }

  /**
   * Execute the JTBD workflow step by step
   */
  private async executeWorkflow(executionId: number, jtbd: DetailedJTBD): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (!context) {
      throw new Error(`Execution context ${executionId} not found`);
    }

    console.log(`🔄 Starting workflow execution for JTBD: ${jtbd.title}`);

    try {
      // Sort process steps by step_number
      const steps = jtbd.process_steps.sort((a, b) => a.step_number - b.step_number);

      for (const step of steps) {
        context.current_step = step.step_number;

        console.log(`⏳ Executing step ${step.step_number}: ${step.step_name}`);

        // Update execution status
        await this.updateExecutionProgress(executionId, {
          current_step: step.step_number,
          status: 'Running'
        });

        // Execute the step
        const stepResult = await this.executeStep(context, step, jtbd);
        context.accumulated_results.push(stepResult);

        // Handle step result
        if (stepResult.status === 'Failed') {
          context.error_count++;

          if (context.error_count >= 3 || stepResult.error_message?.includes('CRITICAL')) {
            throw new Error(`Step ${step.step_number} failed: ${stepResult.error_message}`);
          }

          console.log(`⚠️ Step ${step.step_number} failed, but continuing: ${stepResult.error_message}`);
        }

        if (stepResult.status === 'User_Input_Required') {
          console.log(`⏸️ Pausing execution at step ${step.step_number} - user input required`);
          await this.updateExecutionProgress(executionId, {
            status: 'Paused',
            current_step: step.step_number
          });
          return; // Pause execution
        }

        // Add delay between steps for stability
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // All steps completed successfully
      await this.completeExecution(executionId);
      console.log(`✅ JTBD execution ${executionId} completed successfully`);

    } catch (error) {
      await this.handleExecutionError(executionId, error);
      throw error;
    }
  }

  /**
   * Execute a single process step
   */
  private async executeStep(
    context: ExecutionContext,
    step: JTBDProcessStep,
    jtbd: DetailedJTBD
  ): Promise<StepResult> {
    const startTime = Date.now();

    try {
      // Check for custom agent assignment first, then fallback to step.agent_id
      const assignedAgent = context.agent_assignments?.[step.step_number] || step.agent_id;

      console.log(`🔧 Executing step: ${step.step_name} (Agent: ${assignedAgent || 'LLM'})`);

      let result: any;
      let agentUsed = 'system';

      if (assignedAgent) {
        // Use custom assigned agent or step's default agent
        result = await this.executeWithAgent(step, context, jtbd, assignedAgent);
        agentUsed = assignedAgent;
      } else {
        // Use LLM orchestrator for general tasks
        result = await this.executeWithLLM(step, context, jtbd);
        agentUsed = 'llm-orchestrator';
      }

      const executionTime = Math.round((Date.now() - startTime) / 1000 / 60); // minutes

      return {
        step_number: step.step_number,
        status: 'Completed',
        agent_used: agentUsed,
        execution_time_minutes: executionTime,
        output_data: result,
        next_step_recommendations: await this.generateNextStepRecommendations(step, result, jtbd)
      };

    } catch (error) {
      const executionTime = Math.round((Date.now() - startTime) / 1000 / 60);

      return {
        step_number: step.step_number,
        status: 'Failed',
        execution_time_minutes: executionTime,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        next_step_recommendations: ['Review error and retry', 'Skip step if non-critical', 'Contact support']
      };
    }
  }

  /**
   * Execute step using a specific agent
   */
  private async executeWithAgent(
    step: JTBDProcessStep,
    context: ExecutionContext,
    jtbd: DetailedJTBD,
    agentId: string
  ): Promise<any> {
    console.log(`🤖 Using agent ${agentId} for step: ${step.step_name}`);

    // Get agent details
    const agents = await this.agentService.getActiveAgents();
    const agent = agents.find(a => a.id === agentId);

    if (!agent) {
      throw new Error(`Agent ${agentId} not found or inactive`);
    }

    // Prepare context for the agent
    const agentContext = {
      step_description: step.step_description,
      input_schema: step.input_schema,
      output_schema: step.output_schema,
      previous_results: context.accumulated_results,
      jtbd_context: {
        title: jtbd.title,
        goal: jtbd.goal,
        function: jtbd.function,
        business_value: jtbd.business_value
      },
      user_input: context.input_data
    };

    // Use LLM orchestrator to interface with the agent
    const prompt = this.buildAgentPrompt(agent, step, agentContext);
    const response = await this.llmOrchestrator.query(
      prompt,
      JSON.stringify(agentContext),
      'regulatory-expert', // Default to regulatory expert for now
      { temperature: 0.3, maxTokens: 1500 }
    );

    return {
      agent_response: response.content,
      confidence: response.confidence,
      reasoning: response.reasoning,
      citations: response.citations || []
    };
  }

  /**
   * Execute step using LLM orchestrator
   */
  private async executeWithLLM(
    step: JTBDProcessStep,
    context: ExecutionContext,
    jtbd: DetailedJTBD
  ): Promise<any> {
    console.log(`🧠 Using LLM orchestrator for step: ${step.step_name}`);

    const stepContext = {
      step_description: step.step_description,
      previous_results: context.accumulated_results,
      jtbd_context: {
        title: jtbd.title,
        goal: jtbd.goal,
        function: jtbd.function,
        business_value: jtbd.business_value
      },
      user_input: context.input_data
    };

    const prompt = `
Execute the following step in a pharmaceutical digital health workflow:

**Step**: ${step.step_name}
**Description**: ${step.step_description}
**JTBD Goal**: ${jtbd.goal}
**Business Value**: ${jtbd.business_value}

**Context from Previous Steps**:
${context.accumulated_results.map((r, i) => `Step ${i + 1}: ${JSON.stringify(r.output_data || {})}`).join('\n')}

**User Input**: ${JSON.stringify(context.input_data || {})}

Please execute this step and provide:
1. Specific actionable outputs
2. Key insights or findings
3. Recommendations for next steps
4. Any regulatory or compliance considerations
5. Estimated confidence level (1-10)

Focus on practical, implementable results that advance the pharmaceutical workflow.
`;

    const response = await this.llmOrchestrator.query(
      prompt,
      JSON.stringify(stepContext),
      'regulatory-expert',
      { temperature: 0.4, maxTokens: 2000 }
    );

    return {
      llm_response: response.content,
      confidence: response.confidence,
      reasoning: response.reasoning,
      step_output: this.extractStructuredOutput(response.content, step)
    };
  }

  /**
   * Build a specialized prompt for agent execution
   */
  private buildAgentPrompt(agent: Agent, step: JTBDProcessStep, context: any): string {
    return `
You are ${agent.name}: ${agent.description}

**Current Task**: Execute step "${step.step_name}" in a pharmaceutical JTBD workflow.

**Step Details**:
- Description: ${step.step_description}
- Required Capabilities: ${step.required_capabilities?.join(', ') || 'General'}
- Expected Duration: ${step.estimated_duration} minutes

**JTBD Context**:
- Title: ${context.jtbd_context.title}
- Goal: ${context.jtbd_context.goal}
- Function: ${context.jtbd_context.function}
- Business Value: ${context.jtbd_context.business_value}

**Previous Results**: ${JSON.stringify(context.previous_results, null, 2)}

**User Input**: ${JSON.stringify(context.user_input || {}, null, 2)}

Please execute this step using your specialized capabilities. Provide:
1. Detailed execution results
2. Key findings and insights
3. Regulatory compliance notes (if applicable)
4. Recommendations for optimization
5. Quality assurance checks performed

Be specific and actionable in your response.
`;
  }

  /**
   * Extract structured output from LLM response
   */
  private extractStructuredOutput(content: string, step: JTBDProcessStep): any {
    // Simple parsing - in production, you'd want more sophisticated extraction
    const sections = content.split('\n').filter(line => line.trim());

    return {
      summary: sections.slice(0, 3).join(' '),
      key_insights: sections.filter(line => line.includes('insight') || line.includes('finding')),
      recommendations: sections.filter(line => line.includes('recommend') || line.includes('suggest')),
      compliance_notes: sections.filter(line => line.includes('regulatory') || line.includes('compliance')),
      raw_content: content
    };
  }

  /**
   * Generate recommendations for next steps
   */
  private async generateNextStepRecommendations(
    currentStep: JTBDProcessStep,
    stepResult: any,
    jtbd: DetailedJTBD
  ): Promise<string[]> {
    const nextStep = jtbd.process_steps.find(s => s.step_number === currentStep.step_number + 1);

    const recommendations = [
      `Continue to next step: ${nextStep?.step_name || 'Workflow completion'}`,
      'Review step results for quality assurance',
      'Document insights for future executions'
    ];

    if (stepResult.confidence && stepResult.confidence < 7) {
      recommendations.push('Consider expert review due to lower confidence');
    }

    if (stepResult.compliance_notes?.length > 0) {
      recommendations.push('Ensure regulatory requirements are met');
    }

    return recommendations;
  }

  /**
   * Validate if JTBD is ready for execution
   */
  private async validateExecutionReadiness(jtbd: DetailedJTBD): Promise<{
    isReady: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];

    if (!jtbd.process_steps || jtbd.process_steps.length === 0) {
      reasons.push('No process steps defined');
    }

    if (jtbd.maturity_level === 'Research' || jtbd.maturity_level === 'Concept') {
      reasons.push(`JTBD maturity level (${jtbd.maturity_level}) too early for execution`);
    }

    if (jtbd.complexity === 'High' && !jtbd.process_steps.some(s => s.agent_id)) {
      reasons.push('High complexity JTBD requires at least one specialized agent');
    }

    return {
      isReady: reasons.length === 0,
      reasons
    };
  }

  /**
   * Update execution progress in database
   */
  private async updateExecutionProgress(executionId: number, updates: Partial<{
    current_step: number;
    status: string;
    progress_data: any;
  }>): Promise<void> {
    await this.jtbdService.updateExecutionStatus(executionId, updates.status || 'Running', {
      current_step: updates.current_step,
      ...updates.progress_data
    });
  }

  /**
   * Complete execution successfully
   */
  private async completeExecution(executionId: number): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (!context) return;

    await this.jtbdService.updateExecutionStatus(executionId, 'Completed', {
      completion_timestamp: new Date().toISOString(),
      total_steps: context.total_steps,
      final_results: context.accumulated_results
    });

    this.activeExecutions.delete(executionId);
  }

  /**
   * Handle execution error
   */
  private async handleExecutionError(executionId: number, error: any): Promise<void> {
    console.error(`❌ Execution ${executionId} error:`, error);

    await this.jtbdService.updateExecutionStatus(executionId, 'Failed', {
      error_message: error.message,
      failure_timestamp: new Date().toISOString()
    });

    this.activeExecutions.delete(executionId);
  }

  /**
   * Get execution progress
   */
  async getExecutionProgress(executionId: number): Promise<ExecutionProgress | null> {
    const context = this.activeExecutions.get(executionId);
    if (!context) {
      // Check database for completed/failed executions
      const execution = await this.jtbdService.getExecution(executionId);
      if (!execution) return null;

      return {
        execution_id: executionId,
        current_step: execution.progress_data?.current_step || 0,
        total_steps: execution.progress_data?.total_steps || 0,
        progress_percentage: 100,
        status: execution.status as any,
        current_step_name: 'Completed',
        estimated_remaining_minutes: 0,
        step_results: execution.progress_data?.final_results || [],
        live_updates: [`Execution ${execution.status?.toLowerCase()}`]
      };
    }

    const progressPercentage = context.total_steps > 0
      ? Math.round((context.current_step / context.total_steps) * 100)
      : 0;

    const estimatedRemaining = Math.max(0,
      (context.total_steps - context.current_step) * 5 // Estimate 5 minutes per step
    );

    return {
      execution_id: executionId,
      current_step: context.current_step,
      total_steps: context.total_steps,
      progress_percentage: progressPercentage,
      status: 'Running',
      current_step_name: `Step ${context.current_step}`,
      estimated_remaining_minutes: estimatedRemaining,
      step_results: context.accumulated_results,
      live_updates: [
        `Started at ${context.start_time.toLocaleTimeString()}`,
        `Processing step ${context.current_step} of ${context.total_steps}`,
        `${context.error_count} errors encountered`
      ]
    };
  }

  /**
   * Pause execution
   */
  async pauseExecution(executionId: number): Promise<boolean> {
    const context = this.activeExecutions.get(executionId);
    if (!context) return false;

    await this.updateExecutionProgress(executionId, { status: 'Paused' });
    return true;
  }

  /**
   * Resume execution
   */
  async resumeExecution(executionId: number, userInput?: any): Promise<boolean> {
    const context = this.activeExecutions.get(executionId);
    if (!context) return false;

    if (userInput) {
      context.input_data = { ...context.input_data, ...userInput };
    }

    await this.updateExecutionProgress(executionId, { status: 'Running' });

    // Resume workflow execution
    const jtbd = await this.jtbdService.getDetailedJTBD(context.jtbd_id);
    if (jtbd) {
      this.executeWorkflow(executionId, jtbd).catch(error => {
        this.handleExecutionError(executionId, error);
      });
    }

    return true;
  }
}

// Export singleton instance
export const jtbdExecutionEngine = new JTBDExecutionEngine();