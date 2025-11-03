/**
 * Shared Multi-Framework Orchestrator
 * 
 * Central service for executing workflows across LangGraph, AutoGen, and CrewAI.
 * Used by: Ask Expert, Ask Panel, Workflow Designer, Solution Builder
 * 
 * This orchestrator provides a unified interface for all AI framework execution,
 * allowing any service to use any framework without tight coupling.
 */

import type { Message } from '@/types/chat';

// ============================================================================
// FRAMEWORK TYPES
// ============================================================================

export enum Framework {
  LangGraph = 'langgraph',
  AutoGen = 'autogen',
  CrewAI = 'crewai',
}

export enum ExecutionMode {
  Sequential = 'sequential',        // One step at a time
  Parallel = 'parallel',           // Multiple steps concurrently
  Conversational = 'conversational', // Multi-agent discussion
  Hierarchical = 'hierarchical',   // Delegated task execution
}

// ============================================================================
// SHARED TYPES
// ============================================================================

export interface AgentDefinition {
  id: string;
  role: string;
  goal?: string;
  backstory?: string;
  systemPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
  allowDelegation?: boolean;
}

export interface WorkflowConfig {
  framework: Framework;
  mode: ExecutionMode;
  agents: AgentDefinition[];
  maxRounds?: number;
  requireConsensus?: boolean;
  streaming?: boolean;
  checkpoints?: boolean;
  timeout?: number;
}

export interface ExecutionRequest {
  workflow: WorkflowConfig;
  input: {
    message?: string;
    messages?: Message[];
    context?: Record<string, any>;
  };
  metadata?: {
    userId?: string;
    sessionId?: string;
    source?: 'ask-expert' | 'ask-panel' | 'workflow-designer' | 'solution-builder';
  };
}

export interface ExecutionResult {
  success: boolean;
  framework: Framework;
  outputs: {
    messages?: Message[];
    result?: any;
    state?: Record<string, any>;
  };
  metadata: {
    duration: number;
    tokensUsed: number;
    agentsInvolved: string[];
    executionPath?: string[];
  };
  error?: string;
}

// ============================================================================
// SHARED MULTI-FRAMEWORK ORCHESTRATOR
// ============================================================================

export class MultiFrameworkOrchestrator {
  /**
   * Execute workflow using the appropriate framework
   */
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    console.log(`🎯 [Orchestrator] Executing ${request.workflow.framework} workflow`);
    console.log(`⚙️ [Orchestrator] Mode: ${request.workflow.mode}`);
    console.log(`👥 [Orchestrator] Agents: ${request.workflow.agents.length}`);
    console.log(`📍 [Orchestrator] Source: ${request.metadata?.source || 'unknown'}`);
    
    try {
      let result: ExecutionResult;
      
      switch (request.workflow.framework) {
        case Framework.LangGraph:
          result = await this.executeLangGraph(request);
          break;
        case Framework.AutoGen:
          result = await this.executeAutoGen(request);
          break;
        case Framework.CrewAI:
          result = await this.executeCrewAI(request);
          break;
        default:
          throw new Error(`Unsupported framework: ${request.workflow.framework}`);
      }
      
      const duration = Date.now() - startTime;
      result.metadata.duration = duration;
      
      console.log(`✅ [Orchestrator] Execution complete in ${duration}ms`);
      
      return result;
      
    } catch (error) {
      console.error(`❌ [Orchestrator] Execution failed:`, error);
      
      return {
        success: false,
        framework: request.workflow.framework,
        outputs: {},
        metadata: {
          duration: Date.now() - startTime,
          tokensUsed: 0,
          agentsInvolved: [],
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Execute using LangGraph
   */
  private async executeLangGraph(request: ExecutionRequest): Promise<ExecutionResult> {
    const response = await fetch('/api/frameworks/langgraph/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('LangGraph execution failed');
    }
    
    return await response.json();
  }
  
  /**
   * Execute using AutoGen
   */
  private async executeAutoGen(request: ExecutionRequest): Promise<ExecutionResult> {
    const response = await fetch('/api/frameworks/autogen/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('AutoGen execution failed');
    }
    
    return await response.json();
  }
  
  /**
   * Execute using CrewAI
   */
  private async executeCrewAI(request: ExecutionRequest): Promise<ExecutionResult> {
    const response = await fetch('/api/frameworks/crewai/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('CrewAI execution failed');
    }
    
    return await response.json();
  }
  
  /**
   * Recommend best framework for a given configuration
   */
  recommendFramework(config: {
    agentCount: number;
    needsConversation: boolean;
    needsState: boolean;
    needsDelegation: boolean;
    complexity: 'low' | 'medium' | 'high';
  }): Framework {
    // AutoGen: Best for multi-agent conversations
    if (config.needsConversation && config.agentCount >= 3) {
      return Framework.AutoGen;
    }
    
    // CrewAI: Best for task delegation and hierarchical workflows
    if (config.needsDelegation && config.complexity === 'high') {
      return Framework.CrewAI;
    }
    
    // LangGraph: Best for state management and routing
    if (config.needsState || config.complexity === 'medium') {
      return Framework.LangGraph;
    }
    
    // Default to LangGraph (most flexible)
    return Framework.LangGraph;
  }
  
  /**
   * Generate code for a framework (for export/preview)
   */
  async generateCode(request: ExecutionRequest): Promise<string> {
    const response = await fetch('/api/frameworks/generate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        framework: request.workflow.framework,
        workflow: request.workflow,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Code generation failed');
    }
    
    const result = await response.json();
    return result.code;
  }
}

// Singleton instance
export const multiFrameworkOrchestrator = new MultiFrameworkOrchestrator();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Execute workflow with automatic framework selection
 */
export async function executeWorkflow(
  agents: AgentDefinition[],
  input: ExecutionRequest['input'],
  options?: {
    mode?: ExecutionMode;
    preferredFramework?: Framework;
    source?: ExecutionRequest['metadata']['source'];
  }
): Promise<ExecutionResult> {
  const orchestrator = multiFrameworkOrchestrator;
  
  // Determine framework
  let framework = options?.preferredFramework;
  if (!framework) {
    framework = orchestrator.recommendFramework({
      agentCount: agents.length,
      needsConversation: options?.mode === ExecutionMode.Conversational,
      needsState: options?.mode === ExecutionMode.Sequential,
      needsDelegation: options?.mode === ExecutionMode.Hierarchical,
      complexity: agents.length > 5 ? 'high' : agents.length > 2 ? 'medium' : 'low',
    });
  }
  
  return orchestrator.execute({
    workflow: {
      framework,
      mode: options?.mode || ExecutionMode.Sequential,
      agents,
    },
    input,
    metadata: {
      source: options?.source,
    },
  });
}

/**
 * Quick execution for Ask Expert (single agent, LangGraph)
 */
export async function executeExpert(
  role: string,
  systemPrompt: string,
  message: string,
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<ExecutionResult> {
  return executeWorkflow(
    [
      {
        id: 'expert',
        role,
        systemPrompt,
        model: options?.model || 'gpt-4o',
        temperature: options?.temperature || 0.7,
      },
    ],
    { message },
    { source: 'ask-expert', mode: ExecutionMode.Sequential }
  );
}

/**
 * Quick execution for Ask Panel (multi-agent, AutoGen)
 */
export async function executePanel(
  experts: Array<{ role: string; systemPrompt: string }>,
  question: string,
  options?: {
    requireConsensus?: boolean;
    maxRounds?: number;
  }
): Promise<ExecutionResult> {
  return executeWorkflow(
    experts.map((expert, idx) => ({
      id: `expert_${idx}`,
      role: expert.role,
      systemPrompt: expert.systemPrompt,
    })),
    { message: question },
    {
      source: 'ask-panel',
      mode: ExecutionMode.Conversational,
      preferredFramework: Framework.AutoGen,
    }
  );
}

/**
 * Quick execution for Solution Builder (task-based, CrewAI)
 */
export async function executeSolutionBuilder(
  tasks: Array<{
    role: string;
    goal: string;
    backstory: string;
  }>,
  requirements: Record<string, any>
): Promise<ExecutionResult> {
  return executeWorkflow(
    tasks.map((task, idx) => ({
      id: `agent_${idx}`,
      role: task.role,
      goal: task.goal,
      backstory: task.backstory,
      systemPrompt: `Role: ${task.role}\nGoal: ${task.goal}\nBackstory: ${task.backstory}`,
      allowDelegation: idx < tasks.length - 1, // All except last can delegate
    })),
    { context: requirements },
    {
      source: 'solution-builder',
      mode: ExecutionMode.Hierarchical,
      preferredFramework: Framework.CrewAI,
    }
  );
}

