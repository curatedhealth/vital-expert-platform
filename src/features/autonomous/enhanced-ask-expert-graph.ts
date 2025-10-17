import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { StateGraph, END, START, MemorySaver, Annotation } from '@langchain/langgraph';
import { createClient } from '@supabase/supabase-js';

import { enhancedLangChainService } from '../chat/services/enhanced-langchain-service';
import {
  routeByModeNode,
  suggestAgentsNode,
  selectAgentAutomaticNode,
  processWithAgentNormalNode,
  processWithAgentAutonomousNode,
  synthesizeResponseNode,
  getStepDescription,
  type ToolOption
} from '../chat/services/workflow-nodes-fixed';

// Import autonomous workflow nodes
import {
  extractGoalNode,
  generateTasksNode,
  selectNextTaskNode,
  executeTaskNode,
  reflectOnResultNode,
  evaluateProgressNode,
  generateNewTasksNode,
  checkGoalAchievementNode
} from './autonomous-workflow-nodes';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase configuration missing - budget checking will be disabled');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Enhanced State definition for Mode-Aware Multi-Agent workflow with Autonomous capabilities
 * Extends the original AskExpertState with autonomous mode capabilities
 */
const EnhancedModeAwareWorkflowState = Annotation.Root({
  // Core workflow state
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => current.concat(update),
  }),
  query: Annotation<string>(),
  agentId: Annotation<string | null>(),
  selectedAgent: Annotation<any>({
    reducer: (current: any, update: any) => {
      console.log('🔄 [State] selectedAgent reducer called:', {
        currentType: typeof current,
        updateType: typeof update,
        currentHasId: current?.id,
        updateHasId: update?.id,
        updateValue: update
      });

      // LangGraph Expert Pattern: Always prefer update over current
      if (update !== null && update !== undefined) {
        console.log('✅ [State] Using update value:', update);
        return update;
      }

      if (current) {
        console.log('✅ [State] No update, keeping current:', current);
        return current;
      }

      console.log('⚠️ [State] No current or update, returning null');
      return null;
    },
    default: () => null
  }),
  suggestedAgents: Annotation<any[]>(),
  context: Annotation<string>(),
  sources: Annotation<any[]>(),
  toolCalls: Annotation<any[]>(),
  answer: Annotation<string>(),
  citations: Annotation<string[]>(),
  tokenUsage: Annotation<any>(),
  metadata: Annotation<Record<string, any>>(),
  
  // Mode context
  interactionMode: Annotation<'automatic' | 'manual'>(),
  autonomousMode: Annotation<boolean>(),
  userId: Annotation<string>(),
  sessionId: Annotation<string>(),
  
  // User-selected tools (for normal mode)
  selectedTools: Annotation<string[]>({
    value: (x: string[], y: string[]) => y ?? x,
    default: () => []
  }),
  availableTools: Annotation<ToolOption[]>({
    value: (x: ToolOption[], y: ToolOption[]) => y ?? x,
    default: () => []
  }),
  
  // Workflow control
  workflowStep: Annotation<string>(),
  requiresUserInput: Annotation<boolean>(),
  
  // Autonomous mode state
  goal: Annotation<any>({
    reducer: (current, update) => update || current,
    default: () => null
  }),
  taskQueue: Annotation<any[]>({
    reducer: (current, update) => [...(current || []), ...(update || [])],
    default: () => []
  }),
  completedTasks: Annotation<any[]>({
    reducer: (current, update) => [...(current || []), ...(update || [])],
    default: () => []
  }),
  currentTask: Annotation<any>({
    reducer: (current, update) => update || current,
    default: () => null
  }),
  workingMemory: Annotation<any>({
    reducer: (current, update) => ({ ...current, ...update }),
    default: () => ({ facts: [], insights: [], hypotheses: [] })
  }),
  episodicMemory: Annotation<any[]>({
    reducer: (current, update) => [...(current || []), ...(update || [])],
    default: () => []
  }),
  evidenceChain: Annotation<any[]>({
    reducer: (current, update) => [...(current || []), ...(update || [])],
    default: () => []
  }),
  reasoningSteps: Annotation<any[]>({
    reducer: (current, update) => [...(current || []), ...(update || [])],
    default: () => []
  }),
  progress: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 0
  }),
  totalCost: Annotation<number>({
    reducer: (current, update) => (current || 0) + (update || 0),
    default: () => 0
  }),
  confidenceScore: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 0
  }),
  shouldStop: Annotation<boolean>({
    reducer: (_, update) => update,
    default: () => false
  }),
  requiresIntervention: Annotation<boolean>({
    reducer: (_, update) => update,
    default: () => false
  }),
  currentStep: Annotation<string>({
    reducer: (_, update) => update,
    default: () => 'Starting'
  }),
  
  // Legacy fields for backward compatibility
  question: Annotation<string>(),
  agent: Annotation<any>(),
  ragEnabled: Annotation<boolean>(),
  error: Annotation<string>()
});

/**
 * Create Enhanced Mode-Aware Multi-Agent Workflow Graph with Autonomous capabilities
 * Supports all 4 mode combinations: Manual/Automatic + Normal/Autonomous
 */
export function createEnhancedModeAwareWorkflowGraph() {
  console.log('🔧 [Enhanced LangGraph] Creating enhanced mode-aware multi-agent workflow graph with autonomous capabilities');
  
  try {
    const graph = new StateGraph(EnhancedModeAwareWorkflowState)
      // Core workflow nodes
      .addNode("routeByMode", routeByModeNode)
      .addNode("suggestAgents", suggestAgentsNode)
      .addNode("selectAgentAutomatic", selectAgentAutomaticNode)
      .addNode("processWithAgent", processWithAgentNormalNode)
      .addNode("processWithAgentAutonomous", processWithAgentAutonomousNode)
      .addNode("synthesizeResponse", synthesizeResponseNode)
      
      // Autonomous mode nodes
      .addNode("extractGoal", extractGoalNode)
      .addNode("generateTasks", generateTasksNode)
      .addNode("selectNextTask", selectNextTaskNode)
      .addNode("executeTask", executeTaskNode)
      .addNode("reflectOnResult", reflectOnResultNode)
      .addNode("evaluateProgress", evaluateProgressNode)
      .addNode("generateNewTasks", generateNewTasksNode)
      .addNode("checkGoalAchievement", checkGoalAchievementNode)
      
      // Workflow edges
      .addEdge(START, "routeByMode")
      
      // Smart routing based on mode and agent availability
      .addConditionalEdges("routeByMode", (state) => {
        console.log(`🔀 [Enhanced Workflow] Smart routing: mode=${state.interactionMode}, autonomous=${state.autonomousMode}, hasAgent=${!!state.selectedAgent?.id}`);
        
        // Direct processing for manual mode with pre-selected agent
        if (state.interactionMode === 'manual' && state.selectedAgent?.id) {
          console.log(`✅ [Enhanced Workflow] Direct processing: Manual mode with agent ${state.selectedAgent.name}`);
          return state.autonomousMode ? 'autonomous_manual' : 'process_direct';
        }
        
        // Agent selection for manual mode without agent
        if (state.interactionMode === 'manual') {
          console.log(`⏳ [Enhanced Workflow] Agent selection: Manual mode without agent`);
          return 'manual_selection';
        }
        
        // Automatic mode - select agent and process
        console.log(`🤖 [Enhanced Workflow] Automatic processing: Selecting agent and processing`);
        return state.autonomousMode ? 'autonomous_automatic' : 'automatic_processing';
      }, {
        process_direct: "processWithAgent",
        manual_selection: "suggestAgents", 
        automatic_processing: "selectAgentAutomatic",
        autonomous_manual: "extractGoal",
        autonomous_automatic: "extractGoal"
      })
      
      // Manual agent selection flow
      .addConditionalEdges("suggestAgents", (state) => {
        if (state.selectedAgent?.id) {
          console.log(`✅ [Enhanced Workflow] Agent selected: ${state.selectedAgent.name}`);
          return state.autonomousMode ? 'autonomous_manual' : 'process';
        }
        console.log(`⏳ [Enhanced Workflow] Waiting for agent selection`);
        return 'wait';
      }, {
        process: "processWithAgent",
        wait: "suggestAgents",
        autonomous_manual: "extractGoal"
      })
      
      // Automatic agent selection flow
      .addConditionalEdges("selectAgentAutomatic", (state) => {
        return state.autonomousMode ? 'autonomous_automatic' : 'normal';
      }, {
        normal: "processWithAgent",
        autonomous_automatic: "extractGoal"
      })
      
      // Autonomous mode workflow
      .addEdge("extractGoal", "generateTasks")
      .addEdge("generateTasks", "selectNextTask")
      
      // Main autonomous execution loop
      .addConditionalEdges("selectNextTask", (state) => {
        if (state.requiresIntervention) {
          return 'intervention_required';
        }
        if (state.shouldStop) {
          return 'synthesizeResponse';
        }
        if (state.currentTask) {
          return 'execute_task';
        }
        return 'generate_new_tasks';
      }, {
        intervention_required: "synthesizeResponse",
        synthesizeResponse: "synthesizeResponse",
        execute_task: "executeTask",
        generate_new_tasks: "generateNewTasks"
      })
      
      .addEdge("executeTask", "reflectOnResult")
      .addEdge("reflectOnResult", "evaluateProgress")
      .addEdge("evaluateProgress", "checkGoalAchievement")
      
      .addConditionalEdges("checkGoalAchievement", (state) => {
        if (state.shouldStop) {
          return 'synthesizeResponse';
        }
        if (state.requiresIntervention) {
          return 'synthesizeResponse';
        }
        return 'selectNextTask';
      }, {
        synthesizeResponse: "synthesizeResponse",
        selectNextTask: "selectNextTask"
      })
      
      .addEdge("generateNewTasks", "selectNextTask")
      
      // Normal mode processing
      .addEdge("processWithAgent", "synthesizeResponse")
      .addEdge("processWithAgentAutonomous", "synthesizeResponse")
      
      // Response synthesis to completion
      .addEdge("synthesizeResponse", END);

    console.log('✅ [Enhanced LangGraph] Enhanced workflow graph created successfully');
    return graph;
  } catch (error) {
    console.error('❌ [Enhanced LangGraph] Workflow compilation failed:', error);
    console.error('❌ [Enhanced LangGraph] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    throw new Error(`Enhanced workflow compilation failed: ${error?.message}`);
  }
}

/**
 * Compile Enhanced Mode-Aware Workflow with Checkpointing
 */
export function compileEnhancedModeAwareWorkflow() {
  const workflow = createEnhancedModeAwareWorkflowGraph();
  const checkpointer = new MemorySaver();
  const app = workflow.compile({ checkpointer });
  
  console.log('✅ Enhanced mode-aware workflow compiled with checkpointing');
  return app;
}

/**
 * Execute Enhanced Mode-Aware Workflow
 * Handles all 4 mode combinations with autonomous capabilities
 */
export async function executeEnhancedModeAwareWorkflow(input: {
  query: string;
  agentId?: string;
  sessionId: string;
  userId: string;
  selectedAgent?: any;
  interactionMode: 'automatic' | 'manual';
  autonomousMode: boolean;
  selectedTools?: string[];
  chatHistory: any[];
  maxIterations?: number;
  maxCost?: number;
  supervisionLevel?: 'none' | 'low' | 'medium' | 'high';
}) {
  console.log(`🚀 Executing enhanced mode-aware workflow: ${input.interactionMode} + ${input.autonomousMode ? 'Autonomous' : 'Normal'}`);
  
  const app = compileEnhancedModeAwareWorkflow();
  
  // Convert chat history to BaseMessage format
  const messages: BaseMessage[] = (input.chatHistory || []).map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });

  // Add current query
  messages.push(new HumanMessage(input.query));

  // Execute workflow
  const result = await app.invoke(
    {
      messages,
      query: input.query,
      agentId: input.agentId || null,
      selectedAgent: input.selectedAgent || null,
      suggestedAgents: [],
      context: '',
      sources: [],
      toolCalls: [],
      answer: '',
      citations: [],
      tokenUsage: {},
      metadata: {},
      interactionMode: input.interactionMode,
      autonomousMode: input.autonomousMode,
      userId: input.userId,
      sessionId: input.sessionId,
      selectedTools: input.selectedTools || [],
      availableTools: [],
      workflowStep: 'starting',
      requiresUserInput: false,
      // Autonomous mode state
      goal: null,
      taskQueue: [],
      completedTasks: [],
      currentTask: null,
      workingMemory: { facts: [], insights: [], hypotheses: [] },
      episodicMemory: [],
      evidenceChain: [],
      reasoningSteps: [],
      progress: 0,
      totalCost: 0,
      confidenceScore: 0,
      shouldStop: false,
      requiresIntervention: false,
      currentStep: 'Starting',
      // Legacy fields
      question: input.query,
      agent: input.selectedAgent,
      ragEnabled: input.autonomousMode,
      error: ''
    },
    {
      configurable: {
        thread_id: input.sessionId,
      },
    }
  );

  console.log('✅ Enhanced mode-aware workflow execution complete');
  return result;
}

/**
 * Stream Enhanced Mode-Aware Workflow (for real-time updates)
 */
export async function* streamEnhancedModeAwareWorkflow(input: {
  query: string;
  agentId?: string;
  sessionId: string;
  userId: string;
  selectedAgent?: any;
  interactionMode: 'automatic' | 'manual';
  autonomousMode: boolean;
  selectedTools?: string[];
  chatHistory: any[];
  maxIterations?: number;
  maxCost?: number;
  supervisionLevel?: 'none' | 'low' | 'medium' | 'high';
}) {
  
  console.log(`🌊 Starting streaming enhanced mode-aware workflow: ${input.interactionMode} + ${input.autonomousMode ? 'Autonomous' : 'Normal'}`);
  console.log(`🔍 [Enhanced Workflow] Input parameters:`, {
    query: input.query,
    selectedAgent: input.selectedAgent?.name,
    interactionMode: input.interactionMode,
    autonomousMode: input.autonomousMode,
    selectedTools: input.selectedTools
  });
  
  // CRITICAL: Validate manual mode requirements
  if (input.interactionMode === 'manual' && !input.selectedAgent) {
    console.error('❌ [Enhanced Workflow] Manual mode requires agent');
    yield {
      type: 'error',
      content: 'Please select an AI agent before sending a message in Manual Mode.',
      data: { 
        code: 'NO_AGENT_SELECTED',
        interactionMode: input.interactionMode 
      }
    };
    return;
  }
  
  // Validate agent structure
  if (input.selectedAgent && !input.selectedAgent.id) {
    console.error('❌ [Enhanced Workflow] Invalid agent structure');
    yield {
      type: 'error',
      content: 'Invalid agent selected. Please select another agent.',
      data: { code: 'INVALID_AGENT' }
    };
    return;
  }
  
  const app = compileEnhancedModeAwareWorkflow();
  
  // Convert chat history to BaseMessage format
  const messages: BaseMessage[] = (input.chatHistory || []).map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });

  // Add current query
  messages.push(new HumanMessage(input.query));
  
  console.log('📝 [Enhanced Streaming Workflow] Initialized messages:', {
    chatHistoryLength: input.chatHistory?.length || 0,
    totalMessages: messages.length,
    messageTypes: messages.map(m => m._getType())
  });

  // Stream workflow execution
  console.log('🚀 [Enhanced Workflow] Starting workflow execution with state:', {
    messages: messages.length,
    query: input.query,
    selectedAgent: input.selectedAgent?.name,
    selectedAgentId: input.selectedAgent?.id,
    interactionMode: input.interactionMode,
    autonomousMode: input.autonomousMode
  });
  
  const stream = await app.stream(
    {
      messages,
      query: input.query,
      agentId: input.agentId || null,
      selectedAgent: input.selectedAgent || null,
      suggestedAgents: [],
      context: '',
      sources: [],
      toolCalls: [],
      answer: '',
      citations: [],
      tokenUsage: {},
      metadata: {},
      interactionMode: input.interactionMode,
      autonomousMode: input.autonomousMode,
      userId: input.userId,
      sessionId: input.sessionId,
      selectedTools: input.selectedTools || [],
      availableTools: [],
      workflowStep: 'starting',
      requiresUserInput: false,
      // Autonomous mode state
      goal: null,
      taskQueue: [],
      completedTasks: [],
      currentTask: null,
      workingMemory: { facts: [], insights: [], hypotheses: [] },
      episodicMemory: [],
      evidenceChain: [],
      reasoningSteps: [],
      progress: 0,
      totalCost: 0,
      confidenceScore: 0,
      shouldStop: false,
      requiresIntervention: false,
      currentStep: 'Starting',
      // Legacy fields
      question: input.query,
      agent: input.selectedAgent,
      ragEnabled: input.autonomousMode,
      error: ''
    },
    {
      configurable: {
        thread_id: input.sessionId,
      },
      streamMode: "updates"
    }
  );
  
  console.log('✅ [Enhanced Workflow] Stream created, starting to process events...');

  // Yield step-by-step updates with real-time reasoning
  let hasGeneratedAnswer = false;
  let eventCount = 0;
  
  console.log('🔄 [Enhanced Workflow] Starting to process stream events...');
  
  try {
    console.log('🚨 [Enhanced Workflow] ===== ENTERING STREAM LOOP =====');
    
    for await (const event of stream) {
      console.log('🚨 [Enhanced Workflow] ===== STREAM EVENT RECEIVED =====');
      try {
        eventCount++;
        console.log(`📊 [Enhanced Workflow] Processing event #${eventCount}`);
        console.log('🔍 [Stream] Raw event structure:', {
          keys: Object.keys(event),
          eventType: typeof event,
          eventValue: event
        });
        
        // LangGraph stream in "values" mode returns { nodeName: state } format
        const nodeName = Object.keys(event)[0];
        const state = (event as any)[nodeName];
        
        // Validate event structure
        if (!nodeName || !state) {
          throw new Error('Malformed stream event');
        }
    
        console.log('🔍 [Stream] Node execution:', {
          nodeName,
          stateKeys: Object.keys(state),
          workflowStep: state.workflowStep,
          hasAnswer: !!state.answer,
          hasReasoningSteps: !!(state.reasoningSteps?.length),
          answerLength: state.answer?.length || 0,
          contextLength: state.context?.length || 0,
          selectedAgent: state.selectedAgent?.name,
          selectedAgentId: state.selectedAgent?.id,
          interactionMode: state.interactionMode,
          autonomousMode: state.autonomousMode,
          // Autonomous mode specific
          hasGoal: !!state.goal,
          taskQueueLength: state.taskQueue?.length || 0,
          completedTasksLength: state.completedTasks?.length || 0,
          currentTask: state.currentTask?.description || null,
          progress: state.progress || 0,
          totalCost: state.totalCost || 0
        });
        
        // Enhanced step description for autonomous mode
        const stepDescription = getEnhancedStepDescription(
          nodeName,
          state,
          input.interactionMode,
          input.autonomousMode,
          state.selectedAgent
        );
        
        // Send detailed reasoning events based on actual workflow state
        const reasoningData = {
          workflowStep: state.workflowStep || nodeName,
          selectedAgent: (state.selectedAgent || input.selectedAgent) ? {
            id: (state.selectedAgent || input.selectedAgent).id,
            name: (state.selectedAgent || input.selectedAgent).name,
            display_name: (state.selectedAgent || input.selectedAgent).display_name
          } : null,
          query: state.query,
          agentId: state.agentId,
          timestamp: Date.now(),
          mode: `${input.interactionMode}_${input.autonomousMode ? 'autonomous' : 'normal'}`,
          agent: (state.selectedAgent || input.selectedAgent)?.display_name || (state.selectedAgent || input.selectedAgent)?.name || 'System',
          interactionMode: input.interactionMode,
          autonomousMode: input.autonomousMode,
          // Autonomous mode specific data
          goal: state.goal ? {
            description: state.goal.description,
            criteriaCount: state.goal.successCriteria?.length || 0
          } : null,
          taskQueue: state.taskQueue?.length || 0,
          completedTasks: state.completedTasks?.length || 0,
          currentTask: state.currentTask ? {
            description: state.currentTask.description,
            type: state.currentTask.type,
            priority: state.currentTask.priority
          } : null,
          progress: state.progress || 0,
          totalCost: state.totalCost || 0,
          confidenceScore: state.confidenceScore || 0,
          // Include only essential metadata
          metadata: state.metadata ? {
            processing_mode: state.metadata.processing_mode,
            modeReasoning: state.metadata.modeReasoning,
            agentUsed: state.metadata.agentUsed,
            reasoningSteps: state.reasoningSteps || []
          } : {}
        };
        
        // Ensure data is JSON serializable
        const sanitizedData = JSON.parse(JSON.stringify(reasoningData));
        
        yield {
          type: 'reasoning',
          step: state.workflowStep || nodeName,
          description: stepDescription,
          data: sanitizedData
        };
        
        // Send autonomous mode specific updates
        if (input.autonomousMode) {
          // Goal extraction update
          if (nodeName === 'extractGoal' && state.goal) {
            yield {
              type: 'goal',
              goal: state.goal,
              message: `Goal extracted: ${state.goal.description.substring(0, 100)}...`
            };
          }
          
          // Task generation update
          if (nodeName === 'generateTasks' && state.taskQueue) {
            yield {
              type: 'tasks',
              tasks: state.taskQueue,
              message: `Generated ${state.taskQueue.length} tasks`
            };
          }
          
          // Task execution update
          if (nodeName === 'executeTask' && state.currentTask) {
            yield {
              type: 'task_execution',
              task: state.currentTask,
              message: `Executing task: ${state.currentTask.description.substring(0, 100)}...`
            };
          }
          
          // Progress update
          if (state.progress !== undefined) {
            yield {
              type: 'progress',
              progress: state.progress,
              completedTasks: state.completedTasks?.length || 0,
              totalCost: state.totalCost || 0,
              message: `Progress: ${Math.round(state.progress)}% (${state.completedTasks?.length || 0} tasks completed)`
            };
          }
        }
        
        // If this is the final step with an answer, send it as content
        if (state.answer && (state.workflowStep === 'response_generated' || state.workflowStep === 'complete')) {
          console.log('📤 [Enhanced Workflow] Sending final answer as content:', {
            answerLength: state.answer.length,
            workflowStep: state.workflowStep,
            agent: state.selectedAgent?.name
          });
          
          hasGeneratedAnswer = true;
          
          const contentMetadata = {
            agent: state.selectedAgent ? {
              id: state.selectedAgent.id,
              name: state.selectedAgent.name,
              display_name: state.selectedAgent.display_name
            } : null,
            sources: state.sources || [],
            citations: state.citations || [],
            tokenUsage: state.tokenUsage || {},
            reasoning: stepDescription,
            workflowSteps: state.metadata?.workflowSteps || [],
            interactionMode: input.interactionMode,
            autonomousMode: input.autonomousMode,
            reasoningSteps: state.reasoningSteps || [],
            // Autonomous mode specific metadata
            goal: state.goal,
            completedTasks: state.completedTasks?.length || 0,
            progress: state.progress || 0,
            totalCost: state.totalCost || 0,
            confidenceScore: state.confidenceScore || 0
          };
          
          yield {
            type: 'content',
            content: state.answer,
            metadata: contentMetadata
          };
          
          // Send final event to indicate completion
          yield {
            type: 'final',
            content: state.answer,
            metadata: contentMetadata
          };
        }
        
        // Debug: Log all events to see what's being generated
        console.log('📊 [Enhanced Workflow] Event details:', {
          nodeName,
          workflowStep: state.workflowStep,
          hasAnswer: !!state.answer,
          answerLength: state.answer?.length || 0,
          selectedAgent: state.selectedAgent?.name,
          hasReasoningSteps: !!(state.reasoningSteps?.length),
          stateKeys: Object.keys(state)
        });
      } catch (eventError) {
        console.error('❌ Event processing error:', eventError);
        yield {
          type: 'error:event',
          message: String(eventError)
        };
        // Continue processing other events
      }
    }
  } catch (streamError) {
    console.error('🚨 [Enhanced Workflow] ===== FATAL STREAM ERROR =====');
    console.error('❌ Fatal stream error:', streamError);
    console.error('❌ Error type:', typeof streamError);
    console.error('❌ Error message:', streamError?.message);
    console.error('❌ Error stack:', streamError?.stack);
    console.error('🚨 [Enhanced Workflow] ===== END ERROR =====');
    
    yield {
      type: 'error:fatal',
      message: String(streamError)
    };
  } finally {
    console.log(`🏁 [Enhanced Workflow] Stream processing complete. Total events: ${eventCount}, Answer generated: ${hasGeneratedAnswer}`);
  }
  
  // Fallback: If no answer was generated, send a default response
  if (!hasGeneratedAnswer) {
    console.log('⚠️ [Enhanced Workflow] No answer generated, sending fallback response');
    const fallbackMetadata = {
      agent: null,
      sources: [],
      citations: [],
      tokenUsage: {},
      reasoning: 'Enhanced workflow completed without generating a response - fallback activated',
      workflowSteps: [],
      error: 'No answer generated by enhanced workflow',
      fallbackUsed: true,
      interactionMode: input.interactionMode,
      autonomousMode: input.autonomousMode,
      reasoningSteps: []
    };
    
    yield {
      type: 'content',
      content: 'I apologize, but I encountered an issue while processing your request. This might be due to a temporary service issue. Please try rephrasing your question or contact support if the problem persists.',
      metadata: fallbackMetadata
    };
    
    // Send final and complete events for fallback
    yield {
      type: 'final',
      content: 'I apologize, but I encountered an issue while processing your request. This might be due to a temporary service issue. Please try rephrasing your question or contact support if the problem persists.',
      metadata: fallbackMetadata
    };
  }
  
  // Always send complete event at the end
  yield {
    type: 'complete',
    content: 'Enhanced workflow completed successfully'
  };
}

/**
 * Get enhanced step description for autonomous mode
 */
function getEnhancedStepDescription(
  nodeName: string,
  state: any,
  mode: string,
  autonomous: boolean,
  agent: any
): string {
  const agentName = agent?.display_name || agent?.name || 'AI Assistant';
  
  // Autonomous mode specific descriptions
  if (autonomous) {
    switch (nodeName) {
      case 'extractGoal':
        return `🎯 Extracting goal from your request...`;
      case 'generateTasks':
        return `📋 Generating tasks to achieve your goal...`;
      case 'selectNextTask':
        return `🎯 Selecting next task to execute...`;
      case 'executeTask':
        return `🚀 Executing task: ${state.currentTask?.description?.substring(0, 50) || 'Current task'}...`;
      case 'reflectOnResult':
        return `🤔 Reflecting on task results and extracting insights...`;
      case 'evaluateProgress':
        return `📊 Evaluating progress toward goal (${state.progress || 0}%)...`;
      case 'generateNewTasks':
        return `🔄 Generating new tasks based on progress...`;
      case 'checkGoalAchievement':
        return `🎯 Checking if goal has been achieved...`;
      default:
        return `🔄 ${agentName} is working on your autonomous request...`;
    }
  }
  
  // Fall back to original step descriptions for normal mode
  switch (nodeName) {
    case 'routing':
      return `🔀 Routing request in ${mode} mode`;
    case 'agent_suggestion':
      return `🎯 Finding relevant experts for your question`;
    case 'agent_selection':
      return `🤖 Selecting best expert: ${agentName}`;
    case 'processing':
      return `🔄 ${agentName} is analyzing your question`;
    case 'autonomous_processing':
      return `🤖 ${agentName} is processing with advanced tools`;
    case 'synthesis':
      return `📝 Synthesizing comprehensive response`;
    default:
      return `🔄 ${agentName} is working on your request`;
  }
}
