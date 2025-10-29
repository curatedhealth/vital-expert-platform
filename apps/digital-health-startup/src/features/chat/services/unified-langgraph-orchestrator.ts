/**
 * @fileoverview Unified LangGraph Orchestrator - Enterprise AI/ML Workflow Engine
 * @module features/chat/services
 * @description Production-grade, state-machine based orchestration for all AI/ML workflows
 *
 * Architecture Principles:
 * - Single Responsibility: Each node has one clear purpose
 * - Open/Closed: Extensible through nodes, closed for core logic modification
 * - Dependency Inversion: Depends on abstractions (LangChain), not implementations
 * - Interface Segregation: Clean state interfaces for each workflow stage
 *
 * Design Patterns:
 * - State Machine (LangGraph): Deterministic workflow execution
 * - Strategy Pattern: Different execution strategies per mode
 * - Chain of Responsibility: Node pipeline processing
 * - Observer Pattern: Real-time state streaming
 * - Command Pattern: Encapsulated node operations
 *
 * Industry Standards:
 * - OpenAI Function Calling best practices
 * - LangChain ReAct agent patterns
 * - Anthropic Claude prompt engineering guidelines
 * - Google Vertex AI orchestration patterns
 *
 * @author VITAL AI Platform Team
 * @version 2.0.0
 * @license Proprietary
 */

import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { MemorySaver } from '@langchain/langgraph';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { Document } from '@langchain/core/documents';
import { RunnableSequence } from '@langchain/core/runnables';

// ============================================================================
// TYPE DEFINITIONS & VALIDATION SCHEMAS
// ============================================================================

/**
 * Execution modes supported by the orchestrator
 * Based on 5-mode consultation system specification
 * @see UPDATED_5_MODES_MATRIX_2.md for complete specifications
 */
export enum OrchestrationMode {
  // === NEW 5-MODE SYSTEM (Production) ===

  /** Mode 1: Query-Automatic - One-shot with 3-5 auto-selected experts, parallel execution, 2-3s response */
  QUERY_AUTOMATIC = 'query_automatic',

  /** Mode 2: Query-Manual - One-shot with 1 user-selected expert, fastest path, 1-2s response */
  QUERY_MANUAL = 'query_manual',

  /** Mode 3: Chat-Automatic - Multi-turn with dynamic expert switching, context accumulation */
  CHAT_AUTOMATIC = 'chat_automatic',

  /** Mode 4: Chat-Manual - Multi-turn with single persistent expert, consistent voice */
  CHAT_MANUAL = 'chat_manual',

  /** Mode 5: Agent - Goal-oriented execution with planning, tools, and human-in-the-loop checkpoints */
  AGENT = 'agent',

  // === LEGACY MODES (Deprecated - For backward compatibility) ===
  /** @deprecated Use QUERY_MANUAL instead */
  SINGLE = 'single',
  /** @deprecated Use QUERY_AUTOMATIC instead */
  MULTI = 'multi',
  /** @deprecated Use QUERY_AUTOMATIC with more experts instead */
  PANEL = 'panel',
  /** @deprecated Use AGENT instead */
  AUTONOMOUS = 'autonomous',
  /** @deprecated Use QUERY_AUTOMATIC instead */
  AUTO = 'auto'
}

/**
 * Compliance levels for healthcare regulations
 * @standards HIPAA, GDPR, FDA 21 CFR Part 11
 */
export enum ComplianceLevel {
  STANDARD = 'standard',
  HIPAA = 'hipaa',
  GDPR = 'gdpr',
  FDA = 'fda'
}

/**
 * Intent classification result with confidence scoring
 * Uses OpenAI function calling for structured output
 */
export const IntentSchema = z.object({
  primaryIntent: z.enum(['question', 'task', 'consultation', 'analysis', 'generation']),
  primaryDomain: z.string().describe('Primary knowledge domain (e.g., regulatory, clinical, technical)'),
  domains: z.array(z.string()).describe('All relevant knowledge domains'),
  confidence: z.number().min(0).max(1).describe('Confidence score for classification'),
  complexity: z.enum(['low', 'medium', 'high', 'very-high']),
  urgency: z.enum(['low', 'standard', 'high', 'urgent']),
  requiresMultipleExperts: z.boolean(),
  reasoning: z.string().describe('Explanation of classification decision')
});

export type IntentResult = z.infer<typeof IntentSchema>;

/**
 * Agent ranking with multi-factor scoring
 * Implements RAG-based semantic similarity + metadata boosting
 */
export interface RankedAgent {
  agent: any; // Full agent object
  score: number; // Composite score 0-1
  reasoning: string; // Explanation of ranking
  factors: {
    semanticSimilarity: number; // Vector similarity 0-1
    domainMatch: number; // Domain overlap 0-1
    tierBoost: number; // Tier 1 gets boost
    popularityScore: number; // Historical performance
    availabilityScore: number; // Current load
  };
}

/**
 * Agent response with provenance tracking
 */
export interface AgentResponse {
  agentId: string;
  agentName: string;
  content: string;
  confidence: number;
  reasoning: string;
  sources: Document[];
  citations: string[];
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  latency: number;
  timestamp: Date;
}

/**
 * Performance metrics for observability
 * @see OpenTelemetry standards for distributed tracing
 */
export interface PerformanceMetrics {
  intentClassification: number;
  domainDetection: number;
  agentSelection: number;
  contextRetrieval: number;
  execution: number;
  synthesis: number;
  total: number;
}

/**
 * Token usage tracking for cost management
 * @standards OpenAI token counting methodology
 */
export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
  estimatedCost: number; // In USD
}

// ============================================================================
// STATE ANNOTATION - SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * Unified State Schema for all AI/ML workflows
 *
 * This is the single source of truth for orchestration state.
 * All nodes read from and write to this state.
 *
 * Best Practices:
 * - Use reducers for state accumulation (logs, messages, etc.)
 * - Use default factories for initial values
 * - Use type-safe annotations
 * - Document all state properties
 *
 * @architecture Inspired by Redux, Zustand, and LangGraph best practices
 */
export const UnifiedOrchestrationState = Annotation.Root({
  // ===== INPUT PARAMETERS =====
  /** User's natural language query */
  query: Annotation<string>(),

  /** Execution mode determining workflow path */
  mode: Annotation<OrchestrationMode>({
    default: () => OrchestrationMode.AUTO
  }),

  /** User identifier for personalization and audit */
  userId: Annotation<string>(),

  /** Session identifier for conversation continuity */
  sessionId: Annotation<string>(),

  /** Optional conversation context */
  conversationId: Annotation<string | null>({
    default: () => null
  }),

  /** Multi-tenant identifier */
  tenantId: Annotation<string | null>({
    default: () => null
  }),

  /** Compliance level for regulatory requirements */
  complianceLevel: Annotation<ComplianceLevel>({
    default: () => ComplianceLevel.STANDARD
  }),

  // ===== CONVERSATION CONTEXT =====
  /** Chat history for context-aware responses */
  chatHistory: Annotation<BaseMessage[]>({
    reducer: (current, update) => [...current, ...(Array.isArray(update) ? update : [update])],
    default: () => []
  }),

  // ===== INTENT & CLASSIFICATION =====
  /** Classified intent from query analysis */
  intent: Annotation<IntentResult | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  /** Detected knowledge domains */
  domains: Annotation<string[]>({
    reducer: (current, update) => [...new Set([...current, ...(Array.isArray(update) ? update : [update])])],
    default: () => []
  }),

  /** Overall confidence in routing decision */
  confidence: Annotation<number>({
    reducer: (_current, update) => update,
    default: () => 0
  }),

  // ===== AGENT SELECTION =====
  /** Candidate agents from initial filtering */
  candidateAgents: Annotation<any[]>({
    reducer: (_current, update) => update,
    default: () => []
  }),

  /** Selected agents for execution */
  selectedAgents: Annotation<any[]>({
    reducer: (_current, update) => update,
    default: () => []
  }),

  /** Ranked agents with scoring */
  rankedAgents: Annotation<RankedAgent[]>({
    reducer: (_current, update) => update,
    default: () => []
  }),

  // ===== RAG & KNOWLEDGE RETRIEVAL =====
  /** Retrieved context from vector store */
  retrievedContext: Annotation<Document[]>({
    reducer: (current, update) => [...current, ...(Array.isArray(update) ? update : [update])],
    default: () => []
  }),

  /** Source documents with metadata */
  sources: Annotation<any[]>({
    reducer: (current, update) => [...current, ...(Array.isArray(update) ? update : [update])],
    default: () => []
  }),

  /** Citation strings for attribution */
  citations: Annotation<string[]>({
    reducer: (current, update) => [...current, ...(Array.isArray(update) ? update : [update])],
    default: () => []
  }),

  // ===== EXECUTION =====
  /** Agent responses mapped by agent ID */
  agentResponses: Annotation<Map<string, AgentResponse>>({
    reducer: (current, update) => new Map([...current, ...update]),
    default: () => new Map()
  }),

  /** Tool calls made during execution */
  toolCalls: Annotation<any[]>({
    reducer: (current, update) => [...current, ...(Array.isArray(update) ? update : [update])],
    default: () => []
  }),

  // ===== CONSENSUS & SYNTHESIS =====
  /** Whether consensus reached in multi-agent mode */
  consensusReached: Annotation<boolean>({
    reducer: (_current, update) => update,
    default: () => false
  }),

  /** Consensus points from panel discussion */
  consensus: Annotation<string[]>({
    reducer: (current, update) => [...current, ...(Array.isArray(update) ? update : [update])],
    default: () => []
  }),

  /** Dissenting opinions */
  dissent: Annotation<string[]>({
    reducer: (current, update) => [...current, ...(Array.isArray(update) ? update : [update])],
    default: () => []
  }),

  // ===== OUTPUT =====
  /** Final synthesized response */
  finalResponse: Annotation<string>({
    reducer: (_current, update) => update,
    default: () => ''
  }),

  /** Additional metadata for the response */
  metadata: Annotation<Record<string, any>>({
    reducer: (current, update) => ({ ...current, ...update }),
    default: () => ({})
  }),

  // ===== HUMAN-IN-THE-LOOP (HITL) =====
  /** Reason for interruption (if any) */
  interruptReason: Annotation<string | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  /** Human approval status */
  humanApproval: Annotation<boolean | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  /** Feedback from human reviewer */
  humanFeedback: Annotation<string | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  // ===== MODE-SPECIFIC STATE (5-Mode System) =====

  /** Mode 3 & 4: Turn counter for multi-turn chat modes */
  turnCount: Annotation<number>({
    reducer: (_current, update) => update,
    default: () => 0
  }),

  /** Mode 3: Previous agents used in chat-automatic mode for context */
  previousAgents: Annotation<string[]>({
    reducer: (current, update) => [...current, ...(Array.isArray(update) ? update : [update])],
    default: () => []
  }),

  /** Mode 3: Conversation context accumulated over turns */
  conversationContext: Annotation<string>({
    reducer: (current, update) => current ? `${current}\n\n${update}` : update,
    default: () => ''
  }),

  /** Mode 5: Task plan for goal-oriented execution */
  taskPlan: Annotation<{
    goal: string;
    steps: Array<{ id: string; description: string; status: 'pending' | 'in_progress' | 'completed' | 'failed' }>;
    currentStep: number;
  } | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  /** Mode 5: Checkpoints for human approval */
  checkpoints: Annotation<Array<{
    id: string;
    type: 'approval' | 'review' | 'decision' | 'safety';
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: Date;
  }>>({
    reducer: (current, update) => [...current, ...(Array.isArray(update) ? update : [update])],
    default: () => []
  }),

  /** Mode 5: Active checkpoint awaiting human input */
  activeCheckpoint: Annotation<string | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  /** Mode 2 & 4: Manually selected agent ID (user choice) */
  manualAgentId: Annotation<string | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  /** Mode 4: Persistent agent ID for chat-manual */
  persistentAgentId: Annotation<string | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  /** All modes: Consultation category for routing and tracking */
  consultationCategory: Annotation<'query' | 'chat' | 'agent' | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  /** All modes: Whether agent selection is automatic or manual */
  selectionType: Annotation<'automatic' | 'manual' | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  // ===== MONITORING & OBSERVABILITY =====
  /** Token usage for cost tracking */
  tokenUsage: Annotation<TokenUsage>({
    reducer: (current, update) => ({
      prompt: (current?.prompt || 0) + (update?.prompt || 0),
      completion: (current?.completion || 0) + (update?.completion || 0),
      total: (current?.total || 0) + (update?.total || 0),
      estimatedCost: (current?.estimatedCost || 0) + (update?.estimatedCost || 0)
    }),
    default: () => ({ prompt: 0, completion: 0, total: 0, estimatedCost: 0 })
  }),

  /** Performance metrics for each stage */
  performance: Annotation<PerformanceMetrics>({
    reducer: (current, update) => ({ ...current, ...update }),
    default: () => ({
      intentClassification: 0,
      domainDetection: 0,
      agentSelection: 0,
      contextRetrieval: 0,
      execution: 0,
      synthesis: 0,
      total: 0
    })
  }),

  /** Execution logs for debugging */
  logs: Annotation<string[]>({
    reducer: (current, update) => [...current, ...(Array.isArray(update) ? update : [update])],
    default: () => []
  }),

  /** Error information */
  error: Annotation<Error | null>({
    reducer: (_current, update) => update,
    default: () => null
  })
});

export type UnifiedState = typeof UnifiedOrchestrationState.State;

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/**
 * Model configurations per tier and use case
 * @see OpenAI model documentation for capabilities
 */
export const MODEL_CONFIG = {
  // Tier 1: Strategic, high-stakes decisions
  tier1: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.1, // Low temperature for consistency
    maxTokens: 4096,
    topP: 0.95
  },
  // Tier 2: Specialized domain experts
  tier2: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.3,
    maxTokens: 3072,
    topP: 0.9
  },
  // Tier 3: General assistance
  tier3: {
    model: 'gpt-3.5-turbo-0125',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9
  },
  // Intent classification: Fast, structured output
  intent: {
    model: 'gpt-3.5-turbo-0125',
    temperature: 0,
    maxTokens: 500
  },
  // Embedding: Latest Ada model
  embedding: {
    model: 'text-embedding-3-large',
    dimensions: 3072
  }
} as const;

/**
 * Token pricing for cost estimation
 * @updated 2024-01 pricing
 */
const TOKEN_PRICING = {
  'gpt-4-turbo-preview': { input: 0.01 / 1000, output: 0.03 / 1000 },
  'gpt-3.5-turbo-0125': { input: 0.0005 / 1000, output: 0.0015 / 1000 },
  'text-embedding-3-large': { input: 0.00013 / 1000, output: 0 }
} as const;

// ============================================================================
// UNIFIED ORCHESTRATOR CLASS
// ============================================================================

/**
 * UnifiedLangGraphOrchestrator
 *
 * Enterprise-grade AI workflow orchestrator built on LangGraph.
 * Handles all AI/ML operations through deterministic state machines.
 *
 * Key Features:
 * - Multi-mode execution (single, multi, panel, autonomous)
 * - Automatic agent selection with RAG-based ranking
 * - Human-in-the-loop checkpoints
 * - Comprehensive observability and tracing
 * - State persistence and recovery
 * - Cost tracking and optimization
 *
 * Usage:
 * ```typescript
 * const orchestrator = UnifiedLangGraphOrchestrator.getInstance();
 * const result = await orchestrator.execute({
 *   query: "What are FDA requirements for SaMD?",
 *   mode: OrchestrationMode.AUTO,
 *   userId: "user123",
 *   sessionId: "session456"
 * });
 * ```
 *
 * @class
 * @singleton
 */
export class UnifiedLangGraphOrchestrator {
  private static instance: UnifiedLangGraphOrchestrator;

  private llm: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;
  private vectorStore: SupabaseVectorStore | null = null;
  private supabase: SupabaseClient | null = null;
  private workflow: any = null;
  private checkpointer: MemorySaver;

  /**
   * Private constructor for singleton pattern
   * Initializes LangChain components
   */
  private constructor() {
    // Initialize LLM with best practices
    this.llm = new ChatOpenAI({
      modelName: MODEL_CONFIG.tier2.model,
      temperature: MODEL_CONFIG.tier2.temperature,
      maxTokens: MODEL_CONFIG.tier2.maxTokens,
      openAIApiKey: process.env.OPENAI_API_KEY,
      streaming: true, // Enable streaming for better UX
      verbose: process.env.NODE_ENV === 'development'
    });

    // Initialize embeddings
    this.embeddings = new OpenAIEmbeddings({
      modelName: MODEL_CONFIG.embedding.model,
      openAIApiKey: process.env.OPENAI_API_KEY,
      dimensions: MODEL_CONFIG.embedding.dimensions
    });

    // Initialize checkpointer for state persistence
    this.checkpointer = new MemorySaver();

    // Initialize Supabase connection
    this.initializeSupabase();

    // Build the workflow
    this.workflow = this.buildWorkflow();
  }

  /**
   * Singleton instance getter
   * @returns {UnifiedLangGraphOrchestrator} The singleton instance
   */
  public static getInstance(): UnifiedLangGraphOrchestrator {
    if (!UnifiedLangGraphOrchestrator.instance) {
      UnifiedLangGraphOrchestrator.instance = new UnifiedLangGraphOrchestrator();
    }
    return UnifiedLangGraphOrchestrator.instance;
  }

  /**
   * Initialize Supabase client and vector store
   * @private
   */
  private async initializeSupabase(): Promise<void> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase not configured - RAG features will be disabled');
      return;
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);

      this.vectorStore = new SupabaseVectorStore(this.embeddings, {
        client: this.supabase,
        tableName: 'knowledge_base_documents',
        queryName: 'match_documents'
      });

      console.log('✅ Supabase vector store initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error);
    }
  }

  // ============================================================================
  // WORKFLOW CONSTRUCTION
  // ============================================================================

  /**
   * Build the unified LangGraph workflow for 5-mode system
   *
   * Workflow stages:
   * 1. classify_intent - Understand what user wants
   * 2. detect_domains - Identify knowledge domains
   * 3. select_agents - Choose best agent(s)
   * 4. retrieve_context - Get relevant knowledge
   * 5. [Mode-specific] Execute - Run agent(s) based on mode
   * 6. synthesize - Combine results
   *
   * Mode 5 (Agent) additional stages:
   * - plan_task - Break down goal into steps
   * - execute_agent - Execute with tools and checkpoints
   * - check_approval - Human-in-the-loop gates
   *
   * @returns {CompiledGraph} Compiled LangGraph workflow
   * @private
   */
  private buildWorkflow() {
    const workflow = new StateGraph(UnifiedOrchestrationState);

    // === SHARED NODES (All Modes) ===
    workflow.addNode('classify_intent', this.classifyIntent.bind(this));
    workflow.addNode('detect_domains', this.detectDomains.bind(this));
    workflow.addNode('select_agents', this.selectAgents.bind(this));
    workflow.addNode('retrieve_context', this.retrieveContext.bind(this));

    // === EXECUTION NODES (Mode-Specific) ===
    workflow.addNode('execute_single', this.executeSingleAgent.bind(this));  // Mode 2, 4
    workflow.addNode('execute_multi', this.executeMultiAgent.bind(this));    // Mode 1, 3
    workflow.addNode('execute_panel', this.executePanel.bind(this));         // Legacy
    workflow.addNode('execute_agent', this.executeAgent.bind(this));         // Mode 5

    // === MODE 5 NODES (Agent with Planning & Checkpoints) ===
    workflow.addNode('plan_task', this.planTask.bind(this));
    workflow.addNode('check_approval', this.checkApproval.bind(this));

    // === SYNTHESIS NODE (All Modes) ===
    workflow.addNode('synthesize', this.synthesizeResponse.bind(this));

    // === WORKFLOW EDGES ===

    // Shared initial flow
    workflow.addEdge(START, 'classify_intent');
    workflow.addEdge('classify_intent', 'detect_domains');
    workflow.addEdge('detect_domains', 'select_agents');
    workflow.addEdge('select_agents', 'retrieve_context');

    // Conditional routing based on mode
    workflow.addConditionalEdges(
      'retrieve_context',
      this.routeExecution.bind(this),
      {
        single: 'execute_single',
        multi: 'execute_multi',
        panel: 'execute_panel',
        agent: 'plan_task'  // Mode 5: Add planning stage
      }
    );

    // Mode 5: Task planning → Execution with checkpoints
    workflow.addEdge('plan_task', 'execute_agent');
    workflow.addConditionalEdges(
      'execute_agent',
      this.routeCheckpoint.bind(this),
      {
        continue: 'synthesize',
        checkpoint: 'check_approval'  // Interrupt for human approval
      }
    );
    workflow.addEdge('check_approval', 'execute_agent'); // Loop back after approval

    // All execution paths converge to synthesis
    workflow.addEdge('execute_single', 'synthesize');
    workflow.addEdge('execute_multi', 'synthesize');
    workflow.addEdge('execute_panel', 'synthesize');
    workflow.addEdge('synthesize', END);

    // Compile with checkpointer for state persistence & human-in-the-loop
    return workflow.compile({
      checkpointer: this.checkpointer,
      // Enable interrupts for human-in-the-loop (Mode 5)
      interruptBefore: ['check_approval']
    });
  }

  /**
   * Node 1: Classify Intent
   *
   * Uses OpenAI function calling for structured intent extraction
   * Following best practices from OpenAI Function Calling guide
   *
   * @param state Current workflow state
   * @returns Updated state with intent classification
   */
  private async classifyIntent(state: UnifiedState): Promise<Partial<UnifiedState>> {
    const startTime = Date.now();

    try {
      // Use specialized model for intent classification
      const intentLLM = new ChatOpenAI({
        modelName: MODEL_CONFIG.intent.model,
        temperature: MODEL_CONFIG.intent.temperature, // Zero for consistency
        maxTokens: MODEL_CONFIG.intent.maxTokens,
        openAIApiKey: process.env.OPENAI_API_KEY
      });

      // Configure structured output with Zod schema
      const structuredLLM = intentLLM.withStructuredOutput(IntentSchema);

      // System prompt for intent classification
      const INTENT_SYSTEM_PROMPT = `You are an expert intent classifier for a healthcare AI platform.

Your task is to analyze user queries and extract:
1. Primary intent (question, task, consultation, analysis, generation)
2. Knowledge domains (regulatory, clinical, technical, business, etc.)
3. Complexity level (low, medium, high, very-high)
4. Whether multiple experts are needed

Be precise and confident in your classifications.`;

      // Invoke with structured output
      const result = await structuredLLM.invoke([
        new SystemMessage(INTENT_SYSTEM_PROMPT),
        new HumanMessage(state.query)
      ]);

      const latency = Date.now() - startTime;

      return {
        intent: result,
        confidence: result.confidence,
        logs: [
          `✅ Intent classified: ${result.primaryIntent}`,
          `   Primary domain: ${result.primaryDomain}`,
          `   Confidence: ${(result.confidence * 100).toFixed(1)}%`,
          `   Complexity: ${result.complexity}`,
          `   Multi-expert: ${result.requiresMultipleExperts ? 'Yes' : 'No'}`,
          `   Latency: ${latency}ms`
        ],
        performance: { intentClassification: latency }
      };
    } catch (error) {
      console.error('❌ Intent classification failed:', error);
      // Graceful degradation - use keyword-based fallback
      return {
        intent: {
          primaryIntent: 'question',
          primaryDomain: 'general',
          domains: ['general'],
          confidence: 0.5,
          complexity: 'medium',
          urgency: 'standard',
          requiresMultipleExperts: false,
          reasoning: 'Fallback classification due to error'
        },
        confidence: 0.5,
        logs: ['⚠️  Intent classification failed, using fallback'],
        performance: { intentClassification: Date.now() - startTime }
      };
    }
  }

  /**
   * Node 2: Detect Domains
   *
   * Hybrid approach: keyword-based fast path + semantic search fallback
   * Optimized for performance while maintaining accuracy
   *
   * @param state Current workflow state
   * @returns Updated state with detected domains
   */
  private async detectDomains(state: UnifiedState): Promise<Partial<UnifiedState>> {
    const startTime = Date.now();

    try {
      // Start with domains from intent if available
      const intentDomains = state.intent?.domains || [];

      // Use LLM-based domain detection instead of hardcoded regex
      const keywordDomains = await this.detectDomainsFromKeywords(state.query);

      // Combine and deduplicate
      const allDomains = [...new Set([...intentDomains, ...keywordDomains])];

      // If confidence is low or no domains found, use semantic search
      if (allDomains.length === 0 || state.confidence < 0.7) {
        if (this.vectorStore) {
          // Generate embedding for semantic search
          const embedding = await this.embeddings.embedQuery(state.query);

          // Search for similar documents to identify domains
          const similar = await this.vectorStore.similaritySearchVectorWithScore(
            embedding,
            5
          );

          // Extract domains from similar documents
          const semanticDomains = similar
            .filter(([_, score]) => score > 0.75)
            .flatMap(([doc, _]) => doc.metadata.domains || []);

          allDomains.push(...semanticDomains);
        }
      }

      const finalDomains = [...new Set(allDomains)];
      const latency = Date.now() - startTime;

      return {
        domains: finalDomains,
        logs: [
          `✅ Domains detected: ${finalDomains.join(', ')}`,
          `   Count: ${finalDomains.length}`,
          `   Method: ${keywordDomains.length > 0 ? 'Keyword' : 'Semantic'}`,
          `   Latency: ${latency}ms`
        ],
        performance: { domainDetection: latency }
      };
    } catch (error) {
      console.error('❌ Domain detection failed:', error);
      // Fallback to intent domains or general
      return {
        domains: state.intent?.domains || ['general'],
        logs: ['⚠️  Domain detection failed, using intent domains'],
        performance: { domainDetection: Date.now() - startTime }
      };
    }
  }

  /**
   * Helper: Detect domains using LLM-based classification
   * Uses LangChain structured output for reliable domain detection
   *
   * @param query User query
   * @returns Array of detected domains
   */
  private async detectDomainsFromKeywords(query: string): Promise<string[]> {
    try {
      // Use LLM for domain detection instead of hardcoded regex
      const domainLLM = new ChatOpenAI({
        modelName: MODEL_CONFIG.intent.model,
        temperature: 0,
        maxTokens: 200,
        openAIApiKey: process.env.OPENAI_API_KEY
      });

      // Define domain detection schema
      const DomainSchema = z.object({
        domains: z.array(z.string()).describe('Detected knowledge domains from the query'),
        confidence: z.number().min(0).max(1).describe('Confidence in domain classification')
      });

      const structuredLLM = domainLLM.withStructuredOutput(DomainSchema);

      const DOMAIN_PROMPT = `Analyze this query and identify relevant knowledge domains.

Available domains:
- regulatory: FDA, compliance, submissions, approvals
- clinical: Patient care, trials, medical procedures, diagnosis
- technical: Software, algorithms, AI/ML, engineering
- quality: Quality systems, safety, risk management, ISO/IEC
- market-access: Reimbursement, pricing, commercial, payer
- data-analytics: Data analysis, statistics, metrics, KPIs
- research: Scientific research, studies, investigations
- operations: Business operations, processes, workflow

Query: ${query}

Return the most relevant domains (1-3 typically).`;

      const result = await structuredLLM.invoke([
        new SystemMessage(DOMAIN_PROMPT)
      ]);

      return result.domains || [];

    } catch (error) {
      console.warn('⚠️  LLM domain detection failed, using fallback:', error);

      // Minimal fallback: return generic domain
      return ['general'];
    }
  }

  /**
   * Node 3: Select Agents
   *
   * Multi-factor RAG-based agent ranking and selection
   * Implements sophisticated scoring algorithm with:
   * - Semantic similarity (vector search)
   * - Domain overlap (metadata matching)
   * - Tier boosting (Tier 1 priority)
   * - Popularity score (historical performance)
   * - Availability (current load)
   *
   * @param state Current workflow state
   * @returns Updated state with selected agents
   */
  private async selectAgents(state: UnifiedState): Promise<Partial<UnifiedState>> {
    const startTime = Date.now();

    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Step 1: Filter candidate agents from database (fast)
      // Note: Removed knowledge_domains filter - column doesn't exist in schema
      const { data: candidates, error } = await this.supabase
        .from('agents')
        .select('*')
        .limit(20);

      if (error) throw error;

      if (!candidates || candidates.length === 0) {
        return {
          candidateAgents: [],
          selectedAgents: [],
          rankedAgents: [],
          logs: ['⚠️  No agents found for domains'],
          performance: { agentSelection: Date.now() - startTime }
        };
      }

      // Step 2: Generate query embedding for semantic similarity
      const queryEmbedding = await this.embeddings.embedQuery(state.query);

      // Step 3: Rank agents using multi-factor scoring
      const ranked: RankedAgent[] = await Promise.all(
        candidates.map(async (agent) => {
          // Factor 1: Semantic similarity (40% weight)
          const semanticSim = await this.calculateSemanticSimilarity(
            queryEmbedding,
            agent.description || ''
          );

          // Factor 2: Domain overlap (25% weight)
          const agentDomains = agent.knowledge_domains || [];
          const domainOverlap = this.calculateDomainOverlap(state.domains, agentDomains);

          // Factor 3: Tier boost (20% weight)
          const tierBoost = this.calculateTierBoost(agent.tier);

          // Factor 4: Popularity score (10% weight)
          const popularity = agent.metadata?.usage_count || 0;
          const popularityScore = Math.min(popularity / 100, 1);

          // Factor 5: Availability (5% weight)
          const availabilityScore = 1; // TODO: Implement real-time load tracking

          // Composite score (configurable weights from environment or defaults)
          const weights = {
            semantic: parseFloat(process.env.AGENT_WEIGHT_SEMANTIC || '0.4'),
            domain: parseFloat(process.env.AGENT_WEIGHT_DOMAIN || '0.25'),
            tier: parseFloat(process.env.AGENT_WEIGHT_TIER || '0.2'),
            popularity: parseFloat(process.env.AGENT_WEIGHT_POPULARITY || '0.1'),
            availability: parseFloat(process.env.AGENT_WEIGHT_AVAILABILITY || '0.05')
          };

          const score =
            semanticSim * weights.semantic +
            domainOverlap * weights.domain +
            tierBoost * weights.tier +
            popularityScore * weights.popularity +
            availabilityScore * weights.availability;

          return {
            agent,
            score,
            reasoning: this.generateRankingReasoning(semanticSim, domainOverlap, tierBoost, agent),
            factors: {
              semanticSimilarity: semanticSim,
              domainMatch: domainOverlap,
              tierBoost,
              popularityScore,
              availabilityScore
            }
          };
        })
      );

      // Sort by score descending
      ranked.sort((a, b) => b.score - a.score);

      // Step 4: Apply selection strategy based on mode
      const selected = this.applySelectionStrategy(ranked, state);

      const latency = Date.now() - startTime;

      return {
        candidateAgents: candidates,
        rankedAgents: ranked,
        selectedAgents: selected.map(r => r.agent),
        logs: [
          `✅ Agent selection completed`,
          `   Candidates: ${candidates.length}`,
          `   Selected: ${selected.length}`,
          `   Top agent: ${selected[0]?.agent.name} (score: ${(selected[0]?.score * 100).toFixed(1)}%)`,
          `   Latency: ${latency}ms`
        ],
        performance: { agentSelection: latency }
      };
    } catch (error) {
      console.error('❌ Agent selection failed:', error);
      return {
        candidateAgents: [],
        selectedAgents: [],
        rankedAgents: [],
        logs: ['⚠️  Agent selection failed, no agents available'],
        performance: { agentSelection: Date.now() - startTime }
      };
    }
  }

  /**
   * Helper: Calculate semantic similarity between query and agent description
   * Uses cosine similarity between embeddings
   */
  private async calculateSemanticSimilarity(queryEmbedding: number[], agentDescription: string): Promise<number> {
    try {
      const agentEmbedding = await this.embeddings.embedQuery(agentDescription);
      return this.cosineSimilarity(queryEmbedding, agentEmbedding);
    } catch (error) {
      console.warn('Failed to calculate semantic similarity:', error);
      return 0.5; // Fallback to neutral score
    }
  }

  /**
   * Helper: Cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Helper: Calculate domain overlap percentage
   */
  private calculateDomainOverlap(queryDomains: string[], agentDomains: string[]): number {
    if (queryDomains.length === 0) return 0.5;

    const overlap = queryDomains.filter(d => agentDomains.includes(d)).length;
    return overlap / queryDomains.length;
  }

  /**
   * Helper: Calculate tier boost score
   * Uses configurable tier weights (can be overridden via environment variables)
   */
  private calculateTierBoost(tier: string | number | null): number {
    const tierNum = typeof tier === 'string' ? parseInt(tier) : tier;

    // Configurable tier weights (defaults: Tier 1=1.0, Tier 2=0.7, Tier 3=0.4)
    const tierWeights: Record<number, number> = {
      1: parseFloat(process.env.TIER_1_WEIGHT || '1.0'),
      2: parseFloat(process.env.TIER_2_WEIGHT || '0.7'),
      3: parseFloat(process.env.TIER_3_WEIGHT || '0.4')
    };

    return tierWeights[tierNum || 0] || parseFloat(process.env.TIER_DEFAULT_WEIGHT || '0.5');
  }

  /**
   * Helper: Generate human-readable ranking reasoning
   * Uses configurable thresholds instead of hardcoded values
   */
  private generateRankingReasoning(
    semanticSim: number,
    domainMatch: number,
    tierBoost: number,
    agent: any
  ): string {
    const reasons: string[] = [];

    // Configurable thresholds for reasoning
    const semanticExcellent = parseFloat(process.env.SEMANTIC_EXCELLENT_THRESHOLD || '0.8');
    const semanticGood = parseFloat(process.env.SEMANTIC_GOOD_THRESHOLD || '0.6');
    const domainStrong = parseFloat(process.env.DOMAIN_STRONG_THRESHOLD || '0.7');
    const domainRelevant = parseFloat(process.env.DOMAIN_RELEVANT_THRESHOLD || '0.4');

    if (semanticSim > semanticExcellent) reasons.push('excellent semantic match');
    else if (semanticSim > semanticGood) reasons.push('good semantic match');

    if (domainMatch > domainStrong) reasons.push('strong domain expertise');
    else if (domainMatch > domainRelevant) reasons.push('relevant domain knowledge');

    // Tier-based reasoning (dynamic based on tier value)
    if (agent.tier === 1 || tierBoost >= 0.9) reasons.push('Tier 1 strategic expert');
    else if (agent.tier === 2 || tierBoost >= 0.6) reasons.push('Tier 2 specialist');
    else if (agent.tier === 3) reasons.push('Tier 3 assistant');

    return reasons.join(', ') || 'general match';
  }

  /**
   * Helper: Apply selection strategy based on 5-mode system
   * @see UPDATED_5_MODES_MATRIX_2.md for specifications
   */
  private applySelectionStrategy(ranked: RankedAgent[], state: UnifiedState): RankedAgent[] {
    let numAgents = 1; // Default
    let selected: RankedAgent[] = [];

    // === 5-MODE SYSTEM SELECTION ===
    switch (state.mode) {
      case OrchestrationMode.QUERY_AUTOMATIC:
        // Mode 1: 3-5 experts based on complexity
        if (state.intent?.complexity === 'very-high') {
          numAgents = 5;
        } else if (state.intent?.complexity === 'high') {
          numAgents = 4;
        } else {
          numAgents = 3; // Default for Mode 1
        }
        selected = ranked.slice(0, numAgents);
        break;

      case OrchestrationMode.QUERY_MANUAL:
        // Mode 2: 1 manually selected expert
        if (state.manualAgentId) {
          const manualAgent = ranked.find(r => r.agent.id === state.manualAgentId);
          selected = manualAgent ? [manualAgent] : [ranked[0]]; // Fallback to top if not found
        } else {
          selected = [ranked[0]]; // Default to top ranked
        }
        break;

      case OrchestrationMode.CHAT_AUTOMATIC:
        // Mode 3: Dynamic selection, avoid recent agents if possible
        const recentAgentIds = state.previousAgents.slice(-2); // Last 2 agents
        const freshAgents = ranked.filter(r => !recentAgentIds.includes(r.agent.id));
        const candidates = freshAgents.length > 0 ? freshAgents : ranked;

        // Select 1-2 agents based on query complexity change
        if (state.intent?.complexity === 'high' || state.intent?.complexity === 'very-high') {
          numAgents = 2; // Bring in additional perspective
        } else {
          numAgents = 1;
        }
        selected = candidates.slice(0, numAgents);
        break;

      case OrchestrationMode.CHAT_MANUAL:
        // Mode 4: Single persistent expert (use persistentAgentId if set)
        if (state.persistentAgentId) {
          const persistentAgent = ranked.find(r => r.agent.id === state.persistentAgentId);
          selected = persistentAgent ? [persistentAgent] : [ranked[0]];
        } else if (state.manualAgentId) {
          const manualAgent = ranked.find(r => r.agent.id === state.manualAgentId);
          selected = manualAgent ? [manualAgent] : [ranked[0]];
        } else {
          selected = [ranked[0]];
        }
        break;

      case OrchestrationMode.AGENT:
        // Mode 5: Task-oriented, may need multiple experts for different phases
        // Start with 1 primary agent, can expand based on task plan
        if (state.taskPlan && state.taskPlan.steps.length > 3) {
          numAgents = 2; // Complex task may need multiple specialists
        } else {
          numAgents = 1;
        }
        selected = ranked.slice(0, numAgents);
        break;

      // === LEGACY MODE COMPATIBILITY ===
      case OrchestrationMode.SINGLE:
        selected = [ranked[0]];
        break;

      case OrchestrationMode.MULTI:
        numAgents = 3;
        selected = ranked.slice(0, numAgents);
        break;

      case OrchestrationMode.PANEL:
        numAgents = 5;
        selected = ranked.slice(0, numAgents);
        break;

      case OrchestrationMode.AUTONOMOUS:
        selected = [ranked[0]];
        break;

      case OrchestrationMode.AUTO:
        // Legacy auto: map to QUERY_AUTOMATIC logic
        if (state.intent?.complexity === 'very-high') {
          numAgents = 5;
        } else if (state.intent?.complexity === 'high') {
          numAgents = 3;
        } else {
          numAgents = 1;
        }
        selected = ranked.slice(0, numAgents);
        break;

      default:
        selected = [ranked[0]];
    }

    return selected;
  }

  /**
   * Node 4: Retrieve Context - Enhanced with Advanced RAG
   * 
   * ⚠️ IMPORTANT: RAG is ALWAYS enabled for all modes - this node always executes.
   * All queries benefit from knowledge base context retrieval.
   *
   * Integrates multiple RAG services for optimal context retrieval:
   * - UnifiedRAGService: Production-grade multi-strategy RAG
   * - EnhancedRAGService: RAGAs evaluation + semantic chunking + caching
   * - Redis caching: 70-80% cost reduction
   * - Semantic similarity: Find similar cached queries
   *
   * Strategy selection based on mode:
   * - Mode 1 (Query-Automatic): hybrid search with re-ranking
   * - Mode 2 (Query-Manual): agent-optimized search
   * - Mode 3 (Chat-Automatic): semantic search with context accumulation
   * - Mode 4 (Chat-Manual): agent-optimized with persistent context
   * - Mode 5 (Agent): entity-aware search for complex tasks
   */
  private async retrieveContext(state: UnifiedState): Promise<Partial<UnifiedState>> {
    const startTime = Date.now();
    // RAG is always enabled - this node always executes for all modes

    try {
      // Import advanced RAG services
      const { unifiedRAGService } = await import('../../../lib/services/rag/unified-rag-service');
      const { enhancedRAGService } = await import('../../rag/services/enhanced-rag-service');

      // Determine RAG strategy based on mode
      let ragStrategy: 'semantic' | 'hybrid' | 'keyword' | 'agent-optimized' | 'entity-aware' = 'hybrid';
      let useEnhancedRAG = false;

      switch (state.mode) {
        case OrchestrationMode.QUERY_AUTOMATIC:
          // Mode 1: Hybrid search with multiple experts
          ragStrategy = 'hybrid';
          useEnhancedRAG = true; // Use evaluation and caching
          break;

        case OrchestrationMode.QUERY_MANUAL:
          // Mode 2: Agent-optimized for single expert
          ragStrategy = 'agent-optimized';
          useEnhancedRAG = false; // Direct RAG for speed
          break;

        case OrchestrationMode.CHAT_AUTOMATIC:
          // Mode 3: Semantic search with context building
          ragStrategy = 'semantic';
          useEnhancedRAG = true; // Cache for conversation continuity
          break;

        case OrchestrationMode.CHAT_MANUAL:
          // Mode 4: Agent-optimized for persistent expert
          ragStrategy = 'agent-optimized';
          useEnhancedRAG = true; // Cache persistent agent context
          break;

        case OrchestrationMode.AGENT:
          // Mode 5: Entity-aware for complex tasks
          ragStrategy = 'entity-aware';
          useEnhancedRAG = true; // Full evaluation and chunking
          break;

        default:
          ragStrategy = 'hybrid';
          useEnhancedRAG = false;
      }

      console.log(`🔍 Retrieving context using ${ragStrategy} strategy (Enhanced: ${useEnhancedRAG})`);

      // Get primary agent for agent-optimized search
      const primaryAgentId = state.selectedAgents?.[0]?.id;

      let retrievedDocs: any[] = [];
      let ragMetadata: any = {};

      if (useEnhancedRAG) {
        // Use Enhanced RAG with evaluation, caching, and semantic chunking
        const result = await enhancedRAGService.queryEnhanced(
          state.query,
          ragStrategy,
          state.userId,
          state.sessionId
        );

        retrievedDocs = result.sources;
        ragMetadata = result.metadata;

        console.log(`  ✅ Enhanced RAG: ${retrievedDocs.length} sources (cached: ${result.metadata.cached})`);

      } else {
        // Use Unified RAG for direct, fast retrieval
        const result = await unifiedRAGService.query({
          text: state.query,
          agentId: primaryAgentId,
          userId: state.userId,
          sessionId: state.sessionId,
          domain: state.domains?.[0],
          maxResults: 10,
          similarityThreshold: 0.7,
          strategy: ragStrategy,
          includeMetadata: true,
        });

        retrievedDocs = result.sources;
        ragMetadata = result.metadata;

        console.log(`  ✅ Unified RAG: ${retrievedDocs.length} sources (strategy: ${ragStrategy})`);
      }

      // Build context string
      const context = retrievedDocs
        .map((doc, idx) => {
          const title = doc.metadata?.title || 'Unknown Source';
          const domain = doc.metadata?.domain || '';
          return `[${idx + 1}] ${title}${domain ? ` (${domain})` : ''}:\n${doc.pageContent}\n`;
        })
        .join('\n---\n');

      // Extract citations
      const citations = retrievedDocs
        .map((doc, idx) => {
          const title = doc.metadata?.title || 'Unknown Source';
          const source = doc.metadata?.source || doc.metadata?.document_id || '';
          return `[${idx + 1}] ${title}${source ? ` - ${source}` : ''}`;
        })
        .filter((citation, idx, self) => self.indexOf(citation) === idx); // Remove duplicates

      const latency = Date.now() - startTime;

      return {
        retrievedContext: retrievedDocs,
        sources: retrievedDocs,
        citations,
        logs: [
          `✅ Context retrieved using ${ragStrategy} strategy`,
          `   Sources: ${retrievedDocs.length}`,
          `   Cached: ${ragMetadata.cached ? 'Yes' : 'No'}`,
          `   Enhanced: ${useEnhancedRAG ? 'Yes' : 'No'}`,
          `   Latency: ${latency}ms`,
          `   RAG Response Time: ${ragMetadata.responseTime}ms`
        ],
        metadata: {
          ragStrategy,
          ragMetadata,
          contextLength: context.length,
          useEnhancedRAG
        },
        performance: { contextRetrieval: latency }
      };

    } catch (error) {
      console.error('❌ Context retrieval failed:', error);

      // Fallback: Try basic retrieval
      try {
        const { retrieveContext } = await import('./unified-langgraph-orchestrator-nodes');
        return retrieveContext(state);
      } catch (fallbackError) {
        console.error('❌ Fallback context retrieval also failed:', fallbackError);

        return {
          retrievedContext: [],
          sources: [],
          citations: [],
          logs: ['⚠️ Context retrieval failed, proceeding without RAG context'],
          performance: { contextRetrieval: Date.now() - startTime }
        };
      }
    }
  }

  /**
   * Node 5: Execute Single Agent - Delegate to implementation file
   */
  private async executeSingleAgent(state: UnifiedState): Promise<Partial<UnifiedState>> {
    const { executeSingleAgent } = await import('./unified-langgraph-orchestrator-nodes');
    return executeSingleAgent(state);
  }

  /**
   * Node 6: Execute Multi-Agent - Delegate to implementation file
   */
  private async executeMultiAgent(state: UnifiedState): Promise<Partial<UnifiedState>> {
    const { executeMultiAgent } = await import('./unified-langgraph-orchestrator-nodes');
    return executeMultiAgent(state);
  }

  /**
   * Node 7: Execute Panel - Delegate to implementation file
   */
  private async executePanel(state: UnifiedState): Promise<Partial<UnifiedState>> {
    const { executePanel } = await import('./unified-langgraph-orchestrator-nodes');
    return executePanel(state);
  }

  /**
   * Node 8: Synthesize Response - Delegate to implementation file
   */
  private async synthesizeResponse(state: UnifiedState): Promise<Partial<UnifiedState>> {
    const { synthesizeResponse } = await import('./unified-langgraph-orchestrator-nodes');
    return synthesizeResponse(state);
  }

  /**
   * Mode 5 Node: Plan Task
   * Break down goal into actionable steps using LangChain structured output
   */
  private async planTask(state: UnifiedState): Promise<Partial<UnifiedState>> {
    const startTime = Date.now();

    try {
      // Use specialized model for task planning
      const planningLLM = new ChatOpenAI({
        modelName: MODEL_CONFIG.tier1.model,
        temperature: 0.2, // Low temperature for structured planning
        maxTokens: 2048,
        openAIApiKey: process.env.OPENAI_API_KEY
      });

      // Define task plan schema for structured output
      const TaskPlanSchema = z.object({
        steps: z.array(z.object({
          id: z.string().describe('Unique step identifier (e.g., step-1, step-2)'),
          description: z.string().describe('Clear, actionable description of the step'),
          requiresApproval: z.boolean().describe('Whether this step needs human approval before proceeding')
        })).min(1).max(7).describe('Logical sequence of 1-7 actionable steps')
      });

      const structuredLLM = planningLLM.withStructuredOutput(TaskPlanSchema);

      const PLANNING_PROMPT = `You are an expert task planner for healthcare AI systems.

Your goal: Break down the user's goal into clear, actionable steps.

User Goal: ${state.query}

Create a step-by-step plan with:
1. Clear, specific actions
2. Logical sequence
3. 1-7 steps (prefer fewer, better-defined steps)
4. Mark steps requiring human approval (e.g., final decisions, approvals, sensitive actions)

Consider:
- Regulatory compliance checkpoints
- Data validation steps
- Review and approval gates
- Testing and verification
- Documentation and reporting`;

      const result = await structuredLLM.invoke([
        new SystemMessage(PLANNING_PROMPT)
      ]);

      // Convert to internal plan format with status
      const plan = {
        goal: state.query,
        steps: result.steps.map((step, idx) => ({
          id: step.id,
          description: step.description,
          requiresApproval: step.requiresApproval,
          status: idx === 0 ? 'in_progress' as const : 'pending' as const
        })),
        currentStep: 0
      };

      const latency = Date.now() - startTime;

      return {
        taskPlan: plan,
        logs: [
          `✅ Task plan created`,
          `   Goal: ${state.query}`,
          `   Steps: ${plan.steps.length}`,
          `   Latency: ${latency}ms`
        ]
      };
    } catch (error) {
      console.error('❌ Task planning failed:', error);

      // Return error state instead of null
      return {
        taskPlan: null,
        logs: [`⚠️  Task planning failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        error: error as Error
      };
    }
  }

  /**
   * Mode 5 Node: Execute Agent with Tools & Checkpoints
   */
  private async executeAgent(state: UnifiedState): Promise<Partial<UnifiedState>> {
    const startTime = Date.now();

    // Delegate to implementation file (similar to other execution nodes)
    // For now, use single agent execution
    const result = await this.executeSingleAgent(state);

    // Check if we need a checkpoint
    const needsCheckpoint = state.taskPlan &&
      state.taskPlan.currentStep < state.taskPlan.steps.length - 1;

    if (needsCheckpoint) {
      // Create a checkpoint for next step
      const nextStep = state.taskPlan.steps[state.taskPlan.currentStep + 1];
      const checkpoint = {
        id: `checkpoint-${nextStep.id}`,
        type: 'approval' as const,
        description: `Approve proceeding to: ${nextStep.description}`,
        status: 'pending' as const,
        timestamp: new Date()
      };

      return {
        ...result,
        activeCheckpoint: checkpoint.id,
        checkpoints: [checkpoint]
      };
    }

    return result;
  }

  /**
   * Mode 5 Node: Check Approval (Human-in-the-Loop)
   */
  private async checkApproval(state: UnifiedState): Promise<Partial<UnifiedState>> {
    // This node waits for human approval
    // In production, this would:
    // 1. Send notification to user
    // 2. Wait for approval/rejection
    // 3. Resume execution based on decision

    if (state.humanApproval === true) {
      // Approved - advance to next step
      if (state.taskPlan) {
        const updatedPlan = {
          ...state.taskPlan,
          currentStep: state.taskPlan.currentStep + 1,
          steps: state.taskPlan.steps.map((step, idx) =>
            idx === state.taskPlan!.currentStep
              ? { ...step, status: 'completed' as const }
              : step
          )
        };

        return {
          taskPlan: updatedPlan,
          activeCheckpoint: null,
          logs: ['✅ Checkpoint approved, proceeding to next step']
        };
      }
    }

    // Rejected or pending
    return {
      interruptReason: 'Awaiting human approval',
      logs: ['⏸️  Execution paused at checkpoint']
    };
  }

  /**
   * Route checkpoint decision for Mode 5
   */
  private routeCheckpoint(state: UnifiedState): string {
    // If there's an active checkpoint, route to approval
    if (state.activeCheckpoint) {
      return 'checkpoint';
    }
    // Otherwise continue to synthesis
    return 'continue';
  }

  /**
   * Route execution based on 5-mode system
   * Determines which execution node to use
   */
  private routeExecution(state: UnifiedState): string {
    // === 5-MODE SYSTEM ROUTING ===
    switch (state.mode) {
      case OrchestrationMode.QUERY_AUTOMATIC:
        // Mode 1: Always multi-agent (3-5 experts in parallel)
        return 'multi';

      case OrchestrationMode.QUERY_MANUAL:
        // Mode 2: Always single agent (user selected)
        return 'single';

      case OrchestrationMode.CHAT_AUTOMATIC:
        // Mode 3: Single or multi based on how many agents selected
        return state.selectedAgents.length > 1 ? 'multi' : 'single';

      case OrchestrationMode.CHAT_MANUAL:
        // Mode 4: Always single persistent agent
        return 'single';

      case OrchestrationMode.AGENT:
        // Mode 5: Use agent mode with checkpoints
        return 'agent';

      // === LEGACY MODE COMPATIBILITY ===
      case OrchestrationMode.SINGLE:
        return 'single';

      case OrchestrationMode.MULTI:
        return 'multi';

      case OrchestrationMode.PANEL:
        return 'panel';

      case OrchestrationMode.AUTONOMOUS:
        return 'agent';

      case OrchestrationMode.AUTO:
        return state.selectedAgents.length > 1 ? 'multi' : 'single';

      default:
        return 'single';
    }
  }

  /**
   * Main execution entry point
   * @param {Partial<UnifiedState>} input - Initial state
   * @returns {Promise<UnifiedState>} Final state with response
   */
  public async execute(input: Partial<UnifiedState>): Promise<UnifiedState> {
    const sessionId = input.sessionId || `session-${Date.now()}`;

    try {
      const result = await this.workflow.invoke(input, {
        configurable: { thread_id: sessionId }
      });

      return result;
    } catch (error) {
      console.error('❌ Orchestration error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const unifiedOrchestrator = UnifiedLangGraphOrchestrator.getInstance();
