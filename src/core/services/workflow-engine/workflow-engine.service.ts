/**
 * Workflow Engine Service - Core service for workflow orchestration
 * 
 * This service implements the core business logic for orchestrating
 * chat workflows, including agent selection, query processing, and
 * response generation. It follows clean architecture principles by
 * being framework-agnostic and focused on business logic.
 */

import { Agent } from '@/core/domain/entities';
import { AgentOrchestrator, AgentSelectionResult } from '../agent-orchestrator';

export interface WorkflowState {
  query: string;
  agent: Agent | null;
  mode: {
    selection: 'manual' | 'automatic';
    interaction: 'interactive' | 'autonomous';
  };
  context: any;
  response: string;
  status: 'pending' | 'running' | 'paused' | 'complete' | 'error';
  currentStep: string;
  requiresInput: boolean;
  error?: string;
  metadata?: {
    processingTime: number;
    tokenUsage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    reasoning: string[];
    sources: string[];
    citations: string[];
  };
}

export interface WorkflowInput {
  query: string;
  agent?: Agent | null;
  mode: {
    selection: 'manual' | 'automatic';
    interaction: 'interactive' | 'autonomous';
  };
  context?: any;
  userId?: string;
  sessionId?: string;
  chatHistory?: any[];
}

export interface WorkflowEvent {
  type: 'reasoning' | 'agent_selected' | 'user_input_required' | 'content' | 'final' | 'complete' | 'error';
  step: string;
  description?: string;
  data?: any;
  content?: string;
  agent?: Agent;
  confidence?: number;
  reasoning?: string;
  error?: string;
  state?: WorkflowState;
}

export interface WorkflowResult {
  success: boolean;
  response: string;
  agent: Agent | null;
  processingTime: number;
  metadata: WorkflowState['metadata'];
  error?: string;
}

export class WorkflowEngine {
  private state: WorkflowState;
  private availableAgents: Agent[] = [];

  constructor(
    private readonly agentOrchestrator: AgentOrchestrator
  ) {
    this.state = this.initializeState();
  }

  /**
   * Execute workflow with streaming events
   */
  async *execute(input: WorkflowInput): AsyncGenerator<WorkflowEvent> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 [WorkflowEngine] Starting workflow execution');
      console.log(`📝 Query: "${input.query.substring(0, 100)}..."`);
      console.log(`🎯 Mode: ${input.mode.selection}/${input.mode.interaction}`);

      // Initialize workflow state
      this.state = this.initializeState(input);
      
      // Step 1: Agent selection (if needed)
      if (!this.state.agent) {
        yield* this.selectAgent(input);
      }

      // Check if workflow was paused for user input
      if (this.state.requiresInput) {
        yield {
          type: 'user_input_required',
          step: 'agent_selection',
          description: 'Please select an agent to continue',
          data: { availableAgents: this.availableAgents }
        };
        return;
      }

      // Step 2: Process query with selected agent
      yield* this.processQuery(input);

      // Step 3: Generate response
      yield* this.generateResponse(input);

      // Step 4: Complete workflow
      const processingTime = Date.now() - startTime;
      this.state.metadata = {
        ...this.state.metadata,
        processingTime,
        tokenUsage: this.state.metadata?.tokenUsage || {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        }
      };

      yield {
        type: 'complete',
        step: 'workflow_complete',
        description: 'Workflow completed successfully',
        state: this.state
      };

    } catch (error) {
      console.error('❌ [WorkflowEngine] Workflow execution failed:', error);
      
      yield {
        type: 'error',
        step: 'workflow_error',
        description: 'Workflow execution failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        state: this.state
      };
    }
  }

  /**
   * Resume workflow after user input
   */
  async resume(agent: Agent): Promise<WorkflowResult> {
    try {
      console.log('🔄 [WorkflowEngine] Resuming workflow with agent:', agent.name);
      
      this.state.agent = agent;
      this.state.requiresInput = false;
      this.state.status = 'running';

      // Continue with query processing
      const result = await this.processQueryWithAgent(this.state.query, agent);
      
      return {
        success: true,
        response: result.response,
        agent: agent,
        processingTime: result.processingTime,
        metadata: result.metadata
      };

    } catch (error) {
      console.error('❌ [WorkflowEngine] Failed to resume workflow:', error);
      
      return {
        success: false,
        response: '',
        agent: null,
        processingTime: 0,
        metadata: undefined,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get current workflow state
   */
  getState(): WorkflowState {
    return { ...this.state };
  }

  /**
   * Set available agents for selection
   */
  setAvailableAgents(agents: Agent[]): void {
    this.availableAgents = agents;
  }

  /**
   * Initialize workflow state
   */
  private initializeState(input?: WorkflowInput): WorkflowState {
    return {
      query: input?.query || '',
      agent: input?.agent || null,
      mode: input?.mode || {
        selection: 'automatic',
        interaction: 'interactive'
      },
      context: input?.context || {},
      response: '',
      status: 'pending',
      currentStep: 'initializing',
      requiresInput: false,
      metadata: {
        processingTime: 0,
        tokenUsage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        },
        reasoning: [],
        sources: [],
        citations: []
      }
    };
  }

  /**
   * Select agent for the workflow
   */
  private async *selectAgent(input: WorkflowInput): AsyncGenerator<WorkflowEvent> {
    this.state.currentStep = 'agent_selection';
    this.state.status = 'running';

    yield {
      type: 'reasoning',
      step: 'agent_selection',
      description: 'Selecting best agent for query...'
    };

    if (this.state.mode.selection === 'manual') {
      // Get agent suggestions for manual selection
      const suggestions = await this.agentOrchestrator.suggestAgents(
        input.query,
        this.availableAgents,
        3,
        {
          chatHistory: input.chatHistory,
          currentMode: input.mode.selection
        }
      );

      this.availableAgents = suggestions;
      this.state.requiresInput = true;
      this.state.status = 'paused';

      yield {
        type: 'user_input_required',
        step: 'agent_selection',
        description: 'Please select an agent from the suggestions',
        data: { 
          suggestions: suggestions.map(agent => ({
            id: agent.id,
            name: agent.name,
            displayName: agent.displayName,
            description: agent.description,
            tier: agent.tier
          }))
        }
      };

      return;
    }

    // Automatic selection
    try {
      const result = await this.agentOrchestrator.selectBestAgent(
        input.query,
        this.availableAgents,
        {
          chatHistory: input.chatHistory,
          currentMode: input.mode.selection
        }
      );

      if (result.selected) {
        this.state.agent = result.selected;
        
        yield {
          type: 'agent_selected',
          step: 'agent_selection',
          description: `Selected agent: ${result.selected.name}`,
          agent: result.selected,
          confidence: result.confidence,
          reasoning: result.reasoning
        };
      } else {
        throw new Error('No suitable agent found');
      }

    } catch (error) {
      console.error('❌ [WorkflowEngine] Agent selection failed:', error);
      throw error;
    }
  }

  /**
   * Process query with selected agent
   */
  private async *processQuery(input: WorkflowInput): AsyncGenerator<WorkflowEvent> {
    if (!this.state.agent) {
      throw new Error('No agent selected for query processing');
    }

    this.state.currentStep = 'query_processing';
    
    yield {
      type: 'reasoning',
      step: 'query_processing',
      description: `Processing query with ${this.state.agent.name}...`
    };

    try {
      const result = await this.processQueryWithAgent(input.query, this.state.agent);
      this.state.response = result.response;
      this.state.metadata = result.metadata;

      yield {
        type: 'content',
        step: 'query_processing',
        description: 'Query processed successfully',
        content: result.response
      };

    } catch (error) {
      console.error('❌ [WorkflowEngine] Query processing failed:', error);
      throw error;
    }
  }

  /**
   * Generate final response
   */
  private async *generateResponse(input: WorkflowInput): AsyncGenerator<WorkflowEvent> {
    this.state.currentStep = 'response_generation';
    this.state.status = 'running';

    yield {
      type: 'reasoning',
      step: 'response_generation',
      description: 'Generating final response...'
    };

    // Add any final processing here
    const finalResponse = this.state.response;

    yield {
      type: 'final',
      step: 'response_generation',
      description: 'Response generated successfully',
      content: finalResponse
    };

    this.state.status = 'complete';
  }

  /**
   * Process query with specific agent
   */
  private async processQueryWithAgent(
    query: string,
    agent: Agent
  ): Promise<{
    response: string;
    processingTime: number;
    metadata: WorkflowState['metadata'];
  }> {
    const startTime = Date.now();

    try {
      console.log(`🤖 [WorkflowEngine] Processing with agent: ${agent.name}`);

      // This is where you would integrate with the actual agent execution
      // For now, we'll simulate the processing
      const response = await this.simulateAgentProcessing(query, agent);
      const processingTime = Date.now() - startTime;

      return {
        response,
        processingTime,
        metadata: {
          processingTime,
          tokenUsage: {
            promptTokens: Math.floor(query.length / 4), // Rough estimate
            completionTokens: Math.floor(response.length / 4),
            totalTokens: Math.floor((query.length + response.length) / 4)
          },
          reasoning: [`Processed query with ${agent.name}`, `Agent tier: ${agent.tier}`],
          sources: [],
          citations: []
        }
      };

    } catch (error) {
      console.error('❌ [WorkflowEngine] Agent processing failed:', error);
      throw error;
    }
  }

  /**
   * Simulate agent processing (replace with actual implementation)
   */
  private async simulateAgentProcessing(query: string, agent: Agent): Promise<string> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate a simulated response based on agent capabilities
    const capabilities = agent.capabilities.join(', ');
    const domains = agent.knowledgeDomains.join(', ');

    return `I'm ${agent.displayName}, a ${agent.tier === 3 ? 'Tier 3' : agent.tier === 2 ? 'Tier 2' : 'Tier 1'} AI agent specializing in ${domains}. 

My capabilities include: ${capabilities}

Regarding your query "${query}": I can help you with this topic using my expertise in the relevant domain. Let me provide you with a comprehensive response based on my knowledge and capabilities.

[This is a simulated response - replace with actual agent processing]`;
  }
}
