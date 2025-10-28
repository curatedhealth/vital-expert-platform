/**
 * MODE 2: AUTOMATIC AGENT SELECTION
 * 
 * Intelligent orchestrator that automatically selects the best agent for user queries,
 * then delegates to Mode 1 for execution with the same interactive features.
 * 
 * Features:
 * - Automatic agent selection via Pinecone semantic search
 * - Domain classification for agent filtering
 * - Intent analysis for capability matching
 * - Same RAG/Tools/Chat capabilities as Mode 1
 * - LangGraph workflow for orchestration
 * - Streaming responses with agent selection metadata
 */

import { StateGraph, START, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { Mode1ManualInteractiveHandler, type Mode1Config } from './mode1-manual-interactive';
import { agentSelectorService, type Agent, type QueryAnalysis, type AgentSelectionResult } from './agent-selector-service';

// ============================================================================
// TYPES
// ============================================================================

export interface Mode2Config {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  enableRAG?: boolean;
  enableTools?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
}

/**
 * Mode 2 State Definition for LangGraph Workflow
 * 
 * This interface defines the complete state that flows through the Mode 2 LangGraph workflow.
 * Each node in the workflow can read from and write to this state.
 */
export interface Mode2State {
  // Input
  query: string;                    // User query text
  conversationHistory: BaseMessage[]; // Conversation history in LangChain format
  config: Mode2Config;             // Configuration object
  
  // Agent Selection Process
  detectedIntent: string;          // Extracted intent from query analysis
  detectedDomains: string[];       // Extracted domains from query analysis
  queryAnalysis: QueryAnalysis;    // Complete query analysis result
  candidateAgents: Agent[];        // Agents found via Pinecone search
  selectedAgent: Agent;            // Best agent selected by ranking
  agentSelectionReason: string;     // Human-readable reason for selection
  selectionConfidence: number;     // Confidence score (0-1)
  
  // Mode 1 Execution
  mode1Response: string;           // Response from Mode 1 handler
  mode1Config: Mode1Config;        // Configuration passed to Mode 1
  
  // Metadata
  executionTime: number;           // Total execution time in ms
  timestamp: string;               // ISO timestamp
  error?: string;                  // Error message if workflow fails
}

export interface Mode2StreamChunk {
  type: 'agent_selection' | 'selection_reason' | 'chunk' | 'done';
  content?: string;
  selectedAgent?: Agent;
  selectionReason?: string;
  confidence?: number;
  timestamp?: string;
}

// ============================================================================
// MODE 2 HANDLER CLASS
// ============================================================================

export class Mode2AutomaticAgentSelectionHandler {
  private mode1Handler: Mode1ManualInteractiveHandler;

  constructor() {
    this.mode1Handler = new Mode1ManualInteractiveHandler();
  }

  /**
   * Main entry point for Mode 2
   * Returns streaming generator with agent selection and response
   */
  async execute(config: Mode2Config): Promise<AsyncGenerator<Mode2StreamChunk>> {
    console.log('🎯 [Mode 2] Starting Automatic Agent Selection mode');
    console.log(`   Query: "${config.message}"`);
    console.log(`   RAG: ${config.enableRAG ? 'ON' : 'OFF'}`);
    console.log(`   Tools: ${config.enableTools ? 'ON' : 'OFF'}`);
    console.log(`   Model: ${config.model || 'default'}`);

    const startTime = Date.now();

    try {
      // Convert conversation history to BaseMessage format
      const baseMessages: BaseMessage[] = (config.conversationHistory || []).map(msg => {
        if (msg.role === 'user') {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });

      // Initialize state
      const initialState: Mode2State = {
        query: config.message,
        conversationHistory: baseMessages,
        config,
        detectedIntent: '',
        detectedDomains: [],
        queryAnalysis: {} as QueryAnalysis,
        candidateAgents: [],
        selectedAgent: {} as Agent,
        agentSelectionReason: '',
        selectionConfidence: 0,
        mode1Response: '',
        mode1Config: {} as Mode1Config,
        executionTime: 0,
        timestamp: new Date().toISOString()
      };

      // Execute LangGraph workflow
      const workflow = this.buildMode2Workflow();
      const result = await workflow.invoke(initialState);

      // Calculate execution time
      const executionTime = Date.now() - startTime;
      result.executionTime = executionTime;

      console.log(`✅ [Mode 2] Execution completed in ${executionTime}ms`);
      console.log(`   Selected Agent: ${result.selectedAgent.name}`);
      console.log(`   Confidence: ${result.selectionConfidence.toFixed(3)}`);

      // Return streaming generator
      return this.createStreamingGenerator(result);

    } catch (error) {
      console.error('❌ [Mode 2] Execution failed:', error);
      throw error;
    }
  }

  /**
   * Build proper LangGraph workflow for Mode 2
   * 
   * This creates a StateGraph with proper schema following LangGraph best practices:
   * - Uses BaseMessage[] for conversation history
   * - Proper state management with channels
   * - Clear node definitions and edges
   * - Error handling and recovery
   */
  private buildMode2Workflow() {
    const workflow = new StateGraph<Mode2State>({
      channels: {
        query: { value: (x: string, y: string) => y ?? x },
        conversationHistory: { value: (x: BaseMessage[], y: BaseMessage[]) => y ?? x },
        config: { value: (x: Mode2Config, y: Mode2Config) => y ?? x },
        detectedIntent: { value: (x: string, y: string) => y ?? x },
        detectedDomains: { value: (x: string[], y: string[]) => y ?? x },
        queryAnalysis: { value: (x: QueryAnalysis, y: QueryAnalysis) => y ?? x },
        candidateAgents: { value: (x: Agent[], y: Agent[]) => y ?? x },
        selectedAgent: { value: (x: Agent, y: Agent) => y ?? x },
        agentSelectionReason: { value: (x: string, y: string) => y ?? x },
        selectionConfidence: { value: (x: number, y: number) => y ?? x },
        mode1Response: { value: (x: string, y: string) => y ?? x },
        mode1Config: { value: (x: Mode1Config, y: Mode1Config) => y ?? x },
        executionTime: { value: (x: number, y: number) => y ?? x },
        timestamp: { value: (x: string, y: string) => y ?? x },
        error: { value: (x: string | undefined, y: string | undefined) => y ?? x }
      }
    });

    // Add workflow nodes
    workflow.addNode('analyze_query', this.analyzeQueryNode.bind(this));
    workflow.addNode('find_candidates', this.findCandidatesNode.bind(this));
    workflow.addNode('rank_and_select', this.rankAndSelectNode.bind(this));
    workflow.addNode('execute_mode1', this.executeMode1Node.bind(this));

    // Define workflow edges
    workflow.addEdge(START, 'analyze_query');
    workflow.addEdge('analyze_query', 'find_candidates');
    workflow.addEdge('find_candidates', 'rank_and_select');
    workflow.addEdge('rank_and_select', 'execute_mode1');
    workflow.addEdge('execute_mode1', END);

    return workflow.compile();
  }

  /**
   * Node 1: Analyze query to extract intent and domains
   */
  private async analyzeQueryNode(state: Mode2State): Promise<Partial<Mode2State>> {
    console.log('🔍 [Mode 2] Analyzing query for intent and domains...');

    try {
      const analysis = await agentSelectorService.analyzeQuery(state.query);

      console.log(`✅ [Mode 2] Query analysis complete:`, {
        intent: analysis.intent,
        domains: analysis.domains,
        complexity: analysis.complexity,
        confidence: analysis.confidence
      });

      return {
        detectedIntent: analysis.intent,
        detectedDomains: analysis.domains,
        queryAnalysis: analysis
      };

    } catch (error) {
      console.error('❌ [Mode 2] Query analysis failed:', error);
      
      // Fallback analysis
      return {
        detectedIntent: 'general',
        detectedDomains: [],
        queryAnalysis: {
          intent: 'general',
          domains: [],
          complexity: 'medium',
          keywords: [],
          medicalTerms: [],
          confidence: 0.5
        }
      };
    }
  }

  /**
   * Node 2: Find candidate agents using Pinecone semantic search
   */
  private async findCandidatesNode(state: Mode2State): Promise<Partial<Mode2State>> {
    console.log('🔍 [Mode 2] Searching for candidate agents...');

    try {
      const candidates = await agentSelectorService.findCandidateAgents(
        state.query,
        state.detectedDomains,
        10
      );

      console.log(`✅ [Mode 2] Found ${candidates.length} candidate agents`);

      return {
        candidateAgents: candidates
      };

    } catch (error) {
      console.error('❌ [Mode 2] Agent search failed:', error);
      
      // Return empty array as fallback
      return {
        candidateAgents: []
      };
    }
  }

  /**
   * Node 3: Rank agents and select the best one
   */
  private async rankAndSelectNode(state: Mode2State): Promise<Partial<Mode2State>> {
    console.log('📊 [Mode 2] Ranking and selecting best agent...');

    try {
      if (state.candidateAgents.length === 0) {
        throw new Error('No candidate agents found');
      }

      const rankings = agentSelectorService.rankAgents(
        state.candidateAgents,
        state.query,
        state.queryAnalysis
      );

      const selectedAgent = rankings[0];
      const confidence = Math.min(selectedAgent.score + state.queryAnalysis.confidence, 1);

      console.log(`✅ [Mode 2] Agent selection complete:`, {
        selectedAgent: selectedAgent.agent.name,
        confidence: confidence.toFixed(3),
        reason: selectedAgent.reason
      });

      return {
        selectedAgent: selectedAgent.agent,
        agentSelectionReason: selectedAgent.reason,
        selectionConfidence: confidence
      };

    } catch (error) {
      console.error('❌ [Mode 2] Agent ranking failed:', error);
      
      // Fallback to first available agent
      if (state.candidateAgents.length > 0) {
        const fallbackAgent = state.candidateAgents[0];
        return {
          selectedAgent: fallbackAgent,
          agentSelectionReason: 'fallback selection due to ranking error',
          selectionConfidence: 0.3
        };
      }

      throw new Error('No agents available for selection');
    }
  }

  /**
   * Node 4: Execute with Mode 1 handler
   */
  private async executeMode1Node(state: Mode2State): Promise<Partial<Mode2State>> {
    console.log('🚀 [Mode 2] Executing with Mode 1 handler...');
    console.log(`   Selected Agent: ${state.selectedAgent.name}`);

    try {
      // Create Mode 1 configuration
      const mode1Config: Mode1Config = {
        agentId: state.selectedAgent.id,
        message: state.query,
        conversationHistory: state.conversationHistory.map(msg => ({
          role: msg.constructor.name === 'HumanMessage' ? 'user' as const : 'assistant' as const,
          content: msg.content as string
        })),
        enableRAG: state.config.enableRAG ?? true,
        enableTools: state.config.enableTools ?? false,
        model: state.config.model,
        temperature: state.config.temperature ?? 0.7,
        maxTokens: state.config.maxTokens ?? 2000,
        selectedByOrchestrator: true
      };

      // Execute Mode 1 and collect response
      const mode1Stream = await this.mode1Handler.execute(mode1Config);
      let fullResponse = '';

      for await (const chunk of mode1Stream) {
        fullResponse += chunk;
      }

      console.log(`✅ [Mode 2] Mode 1 execution completed`);

      return {
        mode1Response: fullResponse,
        mode1Config
      };

    } catch (error) {
      console.error('❌ [Mode 2] Mode 1 execution failed:', error);
      
      return {
        mode1Response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        mode1Config: {} as Mode1Config
      };
    }
  }

  /**
   * Create streaming generator for real-time updates
   */
  private async *createStreamingGenerator(result: Mode2State): AsyncGenerator<Mode2StreamChunk> {
    // Stream agent selection info
    yield {
      type: 'agent_selection',
      selectedAgent: result.selectedAgent,
      confidence: result.selectionConfidence,
      timestamp: result.timestamp
    };

    // Stream selection reason
    yield {
      type: 'selection_reason',
      content: `Selected ${result.selectedAgent.name}: ${result.agentSelectionReason}`,
      selectionReason: result.agentSelectionReason,
      timestamp: result.timestamp
    };

    // Stream the actual response from Mode 1
    // For now, we'll stream the full response, but in a real implementation
    // we might want to stream it chunk by chunk as it's generated
    const responseChunks = result.mode1Response.split(' ');
    for (let i = 0; i < responseChunks.length; i++) {
      const chunk = responseChunks[i] + (i < responseChunks.length - 1 ? ' ' : '');
      
      yield {
        type: 'chunk',
        content: chunk,
        timestamp: result.timestamp
      };

      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Stream completion
    yield {
      type: 'done',
      timestamp: result.timestamp
    };
  }

  /**
   * Get agent selection statistics for monitoring
   */
  getSelectionStats(result: Mode2State) {
    return {
      selectedAgent: result.selectedAgent.name,
      confidence: result.selectionConfidence,
      reasoning: result.agentSelectionReason,
      executionTime: result.executionTime,
      candidateCount: result.candidateAgents.length,
      queryAnalysis: {
        intent: result.detectedIntent,
        domains: result.detectedDomains,
        complexity: result.queryAnalysis.complexity
      }
    };
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Execute Mode 2 with automatic agent selection
 */
export async function executeMode2(config: Mode2Config): Promise<AsyncGenerator<Mode2StreamChunk>> {
  const handler = new Mode2AutomaticAgentSelectionHandler();
  return handler.execute(config);
}

/**
 * Get agent selection result without streaming (for testing)
 */
export async function selectAgentForQuery(query: string): Promise<AgentSelectionResult> {
  return agentSelectorService.selectBestAgent(query);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate Mode 2 configuration
 */
export function validateMode2Config(config: Mode2Config): string[] {
  const errors: string[] = [];

  if (!config.message || config.message.trim().length === 0) {
    errors.push('Message is required');
  }

  if (config.message && config.message.length > 4000) {
    errors.push('Message is too long (max 4000 characters)');
  }

  if (config.conversationHistory && config.conversationHistory.length > 50) {
    errors.push('Conversation history is too long (max 50 messages)');
  }

  if (config.temperature && (config.temperature < 0 || config.temperature > 2)) {
    errors.push('Temperature must be between 0 and 2');
  }

  if (config.maxTokens && (config.maxTokens < 100 || config.maxTokens > 8000)) {
    errors.push('Max tokens must be between 100 and 8000');
  }

  return errors;
}

/**
 * Format agent selection for display
 */
export function formatAgentSelection(agent: Agent, reason: string, confidence: number): string {
  return `${agent.name} (${(confidence * 100).toFixed(1)}% confidence) - ${reason}`;
}
