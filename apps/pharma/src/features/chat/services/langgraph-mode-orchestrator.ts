/**
 * LangGraph Mode Orchestrator
 * 
 * This orchestrator wraps the existing mode handlers (Mode 1-4) with LangGraph
 * workflow management, adding:
 * - State persistence across conversations
 * - Workflow visualization and tracking
 * - Memory management
 * - Human-in-the-loop checkpoints
 * - Error recovery
 * 
 * Architecture:
 * - Complies with Golden Rule: AI/ML calls go to Python AI Engine
 * - LangGraph provides workflow orchestration layer
 * - Mode handlers remain as they are (calling Python AI Engine)
 * - Adds state management, memory, and checkpointing
 * 
 * @module features/chat/services
 */

import { StateGraph, END, START, MemorySaver, Annotation } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { 
  executeMode1, 
  Mode1Config 
} from './mode1-manual-interactive';
import {
  executeMode2,
  Mode2Config
} from './mode2-automatic-agent-selection';
import {
  executeMode3,
  Mode3Config
} from './mode3-autonomous-automatic';
import {
  executeMode4,
  Mode4Config
} from './mode4-autonomous-manual';

// ============================================================================
// STATE DEFINITIONS
// ============================================================================

/**
 * Unified state for all 4 modes with LangGraph state management
 */
export const LangGraphModeState = Annotation.Root({
  // Input fields
  mode: Annotation<string>(),
  agentId: Annotation<string | undefined>(),
  message: Annotation<string>(),
  conversationHistory: Annotation<Array<{ role: 'user' | 'assistant'; content: string }>>({
    reducer: (current, update) => update ?? current,
    default: () => []
  }),
  
  // Configuration
  enableRAG: Annotation<boolean>({
    default: () => true
  }),
  enableTools: Annotation<boolean>({
    default: () => false
  }),
  requestedTools: Annotation<string[] | undefined>(),
  selectedRagDomains: Annotation<string[] | undefined>(),
  model: Annotation<string | undefined>(),
  temperature: Annotation<number | undefined>(),
  maxTokens: Annotation<number | undefined>(),
  userId: Annotation<string | undefined>(),
  tenantId: Annotation<string | undefined>(),
  sessionId: Annotation<string | undefined>(),
  
  // Execution state
  currentStep: Annotation<string>({
    default: () => 'initializing'
  }),
  error: Annotation<string | undefined>(),
  
  // Response accumulation
  streamedChunks: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  finalResponse: Annotation<string | undefined>(),
  metadata: Annotation<Record<string, any>>({
    reducer: (current, update) => ({ ...current, ...update }),
    default: () => ({})
  }),
  
  // Workflow tracking
  startTime: Annotation<number>({
    default: () => Date.now()
  }),
  endTime: Annotation<number | undefined>(),
  totalTokens: Annotation<number>({
    default: () => 0
  }),
  
  // Memory and checkpoints
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
});

export type LangGraphModeStateType = typeof LangGraphModeState.State;

// ============================================================================
// WORKFLOW NODES
// ============================================================================

/**
 * Node: Validate Input
 * Ensures all required fields are present before execution
 */
async function validateInput(state: LangGraphModeStateType): Promise<Partial<LangGraphModeStateType>> {
  console.log('🔍 [LangGraph] Validating input...');
  
  if (!state.mode || !state.message) {
    return {
      currentStep: 'error',
      error: 'Missing required fields: mode and message are required'
    };
  }
  
  // Mode-specific validation
  if ((state.mode === 'manual' || state.mode === 'multi-expert') && !state.agentId) {
    return {
      currentStep: 'error',
      error: 'Agent ID required for manual and multi-expert modes'
    };
  }
  
  return {
    currentStep: 'validated',
    messages: [new HumanMessage(state.message)]
  };
}

/**
 * Node: Execute Mode Handler
 * Routes to appropriate mode handler and executes with streaming
 */
async function executeMode(state: LangGraphModeStateType): Promise<Partial<LangGraphModeStateType>> {
  console.log(`🎯 [LangGraph] Executing ${state.mode} mode...`);
  
  const streamedChunks: string[] = [];
  let metadata: Record<string, any> = {};
  
  try {
    switch (state.mode) {
      case 'manual': {
        // MODE 1: Manual Interactive
        const config: Mode1Config = {
          agentId: state.agentId!,
          message: state.message,
          conversationHistory: state.conversationHistory,
          enableRAG: state.enableRAG,
          enableTools: state.enableTools,
          requestedTools: state.requestedTools,
          selectedRagDomains: state.selectedRagDomains,
          model: state.model,
          temperature: state.temperature,
          maxTokens: state.maxTokens,
          userId: state.userId,
          tenantId: state.tenantId,
          sessionId: state.sessionId,
        };
        
        const mode1Stream = executeMode1(config);
        
        for await (const chunk of mode1Stream) {
          // Check if it's a metadata chunk
          if (typeof chunk === 'string' && chunk.startsWith('__mode1_meta__')) {
            const meta = JSON.parse(chunk.slice('__mode1_meta__'.length));
            metadata = { ...metadata, ...meta };
          } else {
            // Regular content chunk
            streamedChunks.push(chunk);
          }
        }
        
        break;
      }
      
      case 'automatic': {
        // MODE 2: Automatic Agent Selection
        const config: Mode2Config = {
          message: state.message,
          conversationHistory: state.conversationHistory,
          enableRAG: state.enableRAG,
          enableTools: state.enableTools,
          model: state.model,
          temperature: state.temperature,
          maxTokens: state.maxTokens,
          userId: state.userId,
          tenantId: state.tenantId,
          sessionId: state.sessionId,
        };
        
        const mode2Stream = await executeMode2(config);
        
        for await (const chunk of mode2Stream) {
          if (typeof chunk === 'object' && chunk.content) {
            streamedChunks.push(chunk.content);
            if (chunk.selectedAgent) {
              metadata.selectedAgent = chunk.selectedAgent;
            }
            if (chunk.selectionReason) {
              metadata.selectionReason = chunk.selectionReason;
            }
            if (chunk.confidence) {
              metadata.confidence = chunk.confidence;
            }
          } else if (typeof chunk === 'string') {
            streamedChunks.push(chunk);
          }
        }
        
        break;
      }
      
      case 'autonomous': {
        // MODE 3: Autonomous-Automatic
        const config: Mode3Config = {
          message: state.message,
          conversationHistory: state.conversationHistory,
          enableRAG: state.enableRAG,
          enableTools: state.enableTools,
          model: state.model,
          temperature: state.temperature,
          maxTokens: state.maxTokens,
          userId: state.userId,
          tenantId: state.tenantId,
          sessionId: state.sessionId,
        };
        
        const mode3Stream = await executeMode3(config);
        
        for await (const chunk of mode3Stream) {
          if (typeof chunk === 'object') {
            if (chunk.type === 'content' && chunk.content) {
              streamedChunks.push(chunk.content);
            }
            // Collect autonomous metadata
            if (chunk.goalUnderstanding) metadata.goalUnderstanding = chunk.goalUnderstanding;
            if (chunk.executionPlan) metadata.executionPlan = chunk.executionPlan;
            if (chunk.iterations) metadata.iterations = chunk.iterations;
          }
        }
        
        break;
      }
      
      case 'multi-expert': {
        // MODE 4: Multi-Expert
        const config: Mode4Config = {
          agentId: state.agentId!,
          message: state.message,
          conversationHistory: state.conversationHistory,
          enableRAG: state.enableRAG,
          enableTools: state.enableTools,
          model: state.model,
          temperature: state.temperature,
          maxTokens: state.maxTokens,
          userId: state.userId,
          tenantId: state.tenantId,
          sessionId: state.sessionId,
        };
        
        const mode4Stream = await executeMode4(config);
        
        for await (const chunk of mode4Stream) {
          if (typeof chunk === 'object') {
            if (chunk.type === 'content' && chunk.content) {
              streamedChunks.push(chunk.content);
            }
            // Collect metadata
            Object.assign(metadata, chunk.metadata || {});
          }
        }
        
        break;
      }
      
      default:
        throw new Error(`Unknown mode: ${state.mode}`);
    }
    
    const finalResponse = streamedChunks.filter(c => !c.startsWith('__mode')).join('');
    
    return {
      currentStep: 'completed',
      streamedChunks,
      finalResponse,
      metadata,
      messages: [...state.messages, new AIMessage(finalResponse)],
      endTime: Date.now()
    };
    
  } catch (error) {
    console.error('❌ [LangGraph] Mode execution error:', error);
    return {
      currentStep: 'error',
      error: error instanceof Error ? error.message : String(error),
      endTime: Date.now()
    };
  }
}

/**
 * Node: Finalize
 * Adds any final processing, logging, analytics
 */
async function finalize(state: LangGraphModeStateType): Promise<Partial<LangGraphModeStateType>> {
  console.log('✅ [LangGraph] Finalizing workflow...');
  
  const duration = state.endTime ? state.endTime - state.startTime : Date.now() - state.startTime;
  
  console.log(`✅ [LangGraph] Workflow completed in ${duration}ms`);
  console.log(`📊 [LangGraph] Total chunks: ${state.streamedChunks.length}`);
  console.log(`📝 [LangGraph] Final response length: ${state.finalResponse?.length || 0} chars`);
  
  return {
    metadata: {
      ...state.metadata,
      duration,
      chunksCount: state.streamedChunks.length,
      responseLength: state.finalResponse?.length || 0
    }
  };
}

// ============================================================================
// WORKFLOW ROUTER
// ============================================================================

/**
 * Conditional router: determines next step based on current state
 */
function routeNext(state: LangGraphModeStateType): string {
  if (state.currentStep === 'error') {
    return 'finalize';
  }
  if (state.currentStep === 'validated') {
    return 'execute';
  }
  if (state.currentStep === 'completed') {
    return 'finalize';
  }
  return END;
}

// ============================================================================
// WORKFLOW BUILDER
// ============================================================================

/**
 * Build LangGraph workflow with state management and checkpointing
 */
export function buildLangGraphModeWorkflow() {
  const workflow = new StateGraph(LangGraphModeState);
  
  // Add nodes
  workflow.addNode('validate', validateInput);
  workflow.addNode('execute', executeMode);
  workflow.addNode('finalize', finalize);
  
  // Add edges
  workflow.addEdge(START, 'validate');
  
  workflow.addConditionalEdges('validate', routeNext, {
    execute: 'execute',
    finalize: 'finalize'
  });
  
  workflow.addConditionalEdges('execute', routeNext, {
    finalize: 'finalize'
  });
  
  workflow.addEdge('finalize', END);
  
  // Compile with memory saver for state persistence
  const memory = new MemorySaver();
  
  return workflow.compile({
    checkpointer: memory
  });
}

// ============================================================================
// EXECUTION FUNCTIONS
// ============================================================================

/**
 * Execute workflow with LangGraph (non-streaming)
 */
export async function executeLangGraphMode(config: {
  mode: string;
  agentId?: string;
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  enableRAG?: boolean;
  enableTools?: boolean;
  requestedTools?: string[];
  selectedRagDomains?: string[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
  tenantId?: string;
  sessionId?: string;
}) {
  console.log('🚀 [LangGraph] Starting workflow execution...');
  
  const workflow = buildLangGraphModeWorkflow();
  const sessionId = config.sessionId || `session-${Date.now()}`;
  
  const result = await workflow.invoke(config, {
    configurable: {
      thread_id: sessionId
    }
  });
  
  console.log('✅ [LangGraph] Workflow completed successfully');
  
  return result;
}

/**
 * Stream workflow execution with LangGraph
 * Yields state updates after each node execution
 */
export async function* streamLangGraphMode(config: {
  mode: string;
  agentId?: string;
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  enableRAG?: boolean;
  enableTools?: boolean;
  requestedTools?: string[];
  selectedRagDomains?: string[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
  tenantId?: string;
  sessionId?: string;
}) {
  console.log('🌊 [LangGraph] Starting streaming workflow...');
  
  const workflow = buildLangGraphModeWorkflow();
  const sessionId = config.sessionId || `session-${Date.now()}`;
  
  // Stream workflow execution - yields after each node
  for await (const event of workflow.stream(config, {
    configurable: {
      thread_id: sessionId
    }
  })) {
    // Event format: { nodeName: nodeOutput }
    const [nodeName, nodeOutput] = Object.entries(event)[0];
    
    yield {
      type: 'workflow_step',
      step: nodeName,
      state: nodeOutput,
      timestamp: new Date().toISOString()
    };
  }
  
  console.log('✅ [LangGraph] Streaming workflow completed');
}

/**
 * Get workflow state for a session (useful for resuming conversations)
 */
export async function getLangGraphState(sessionId: string) {
  const workflow = buildLangGraphModeWorkflow();
  
  try {
    const state = await workflow.getState({
      configurable: {
        thread_id: sessionId
      }
    });
    
    return state;
  } catch (error) {
    console.error('❌ [LangGraph] Failed to get state:', error);
    return null;
  }
}

/**
 * Update workflow state (for human-in-the-loop interventions)
 */
export async function updateLangGraphState(
  sessionId: string,
  updates: Partial<LangGraphModeStateType>
) {
  const workflow = buildLangGraphModeWorkflow();
  
  try {
    await workflow.updateState(
      {
        configurable: {
          thread_id: sessionId
        }
      },
      updates
    );
    
    console.log('✅ [LangGraph] State updated successfully');
    return true;
  } catch (error) {
    console.error('❌ [LangGraph] Failed to update state:', error);
    return false;
  }
}

