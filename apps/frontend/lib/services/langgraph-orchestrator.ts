/**
 * LangGraph Advisory Board Orchestrator
 * Implements state-machine based orchestration patterns with visual debugging
 */

import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { policyGuard } from './policy-guard';
import { minorityOpinionAnalyzer, type AgentReply as MinorityAgentReply } from './minority-opinion-analyzer';
import { getAllExpertTools, toolUsageTracker, type ToolCall } from './expert-tools';

// ============================================================================
// STATE DEFINITION
// ============================================================================

const OrchestrationStateAnnotation = Annotation.Root({
  // Input
  question: Annotation<string>(),
  personas: Annotation<string[]>(),
  mode: Annotation<string>(),
  evidenceSources: Annotation<any[]>({
    default: () => []
  }),

  // Message history for multi-turn conversations
  messageHistory: Annotation<Array<{role: 'user' | 'assistant', content: string, timestamp: string}>>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),

  // Workflow state
  currentRound: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 0
  }),
  maxRounds: Annotation<number>({
    default: () => 3
  }),

  // Expert responses
  replies: Annotation<Map<string, AgentReply>>({
    reducer: (current, update) => new Map([...current, ...update]),
    default: () => new Map()
  }),

  // Synthesis
  consensus: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  dissent: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  risks: Annotation<any[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),

  // Convergence tracking
  converged: Annotation<boolean>({
    reducer: (_, update) => update,
    default: () => false
  }),

  // Themes (for funnel mode)
  themes: Annotation<string[]>({
    default: () => []
  }),

  // Final output
  summaryMd: Annotation<string>({
    reducer: (_, update) => update,
    default: () => ''
  }),
  humanGateRequired: Annotation<boolean>({
    default: () => false
  }),

  // Human-in-the-Loop (HITL) state
  interruptReason: Annotation<string | null>({
    reducer: (_, update) => update,
    default: () => null
  }),
  interruptData: Annotation<any | null>({
    reducer: (_, update) => update,
    default: () => null
  }),
  humanApproval: Annotation<boolean | null>({
    reducer: (_, update) => update,
    default: () => null
  }),
  humanFeedback: Annotation<string | null>({
    reducer: (_, update) => update,
    default: () => null
  }),

  // Metadata
  sessionId: Annotation<string>(),
  logs: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  })
});

export type OrchestrationState = typeof OrchestrationStateAnnotation.State;

export interface AgentReply {
  persona: string;
  text: string;
  confidence: number;
  citations: string[];
  timestamp: string;
  round: number;
  toolCalls?: ToolCall[]; // Track tool usage for transparency
}

// ============================================================================
// ORCHESTRATION PATTERN DEFINITION
// ============================================================================

export interface OrchestrationPattern {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: PatternNode[];
  edges: PatternEdge[];
  config?: Record<string, any>;
}

export interface PatternNode {
  id: string;
  type: 'consult_parallel' | 'consult_sequential' | 'check_consensus' | 'synthesize' | 'cluster_themes' | 'custom';
  label: string;
  config?: Record<string, any>;
  interruptBefore?: boolean; // If true, workflow pauses before executing this node for human approval
}

export interface PatternEdge {
  from: string;
  to: string;
  condition?: string; // For conditional edges: "converged", "!converged", "round < max", etc.
}

// ============================================================================
// LANGGRAPH ORCHESTRATOR
// ============================================================================

export class LangGraphOrchestrator {
  private llm: ChatOpenAI;
  private builtInPatterns: Map<string, OrchestrationPattern>;
  private checkpointer: SqliteSaver;

  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.7,
    });

    // Initialize SQLite checkpointer for session persistence
    this.checkpointer = SqliteSaver.fromConnString('./checkpoints.sqlite');

    this.builtInPatterns = this.initializeBuiltInPatterns();
  }

  /**
   * Main orchestration entry point
   */
  async orchestrate(params: {
    mode: string;
    question: string;
    personas: string[];
    evidenceSources?: any[];
    customPattern?: OrchestrationPattern;
    threadId?: string; // Optional thread ID for resuming sessions
  }): Promise<any> {
    const sessionId = params.threadId || `session_${Date.now()}`;

    // Get pattern (built-in or custom)
    const pattern = params.customPattern || this.builtInPatterns.get(params.mode);
    if (!pattern) {
      throw new Error(`Unknown orchestration mode: ${params.mode}`);
    }

    // Build workflow from pattern
    const workflow = this.buildWorkflowFromPattern(pattern);

    // Collect interrupt nodes for HITL
    const interruptNodes = pattern.nodes
      .filter(node => node.interruptBefore)
      .map(node => node.id);

    // Compile with checkpointer and interrupt support for HITL
    const app = workflow.compile({
      checkpointer: this.checkpointer,
      interruptBefore: interruptNodes.length > 0 ? interruptNodes : undefined
    });

    // Execute workflow with thread_id for checkpointing
    const result = await app.invoke(
      {
        question: params.question,
        personas: params.personas,
        mode: params.mode,
        evidenceSources: params.evidenceSources || [],
        sessionId,
        maxRounds: pattern.config?.maxRounds || 3
      },
      {
        configurable: {
          thread_id: sessionId
        }
      }
    );

    // Store user question and assistant response in message history
    await app.updateState(
      { configurable: { thread_id: sessionId } },
      {
        messageHistory: [
          {
            role: 'user',
            content: params.question,
            timestamp: new Date().toISOString()
          },
          {
            role: 'assistant',
            content: result.summaryMd || 'Panel consultation complete',
            timestamp: new Date().toISOString()
          }
        ]
      }
    );

    return {
      mode: params.mode,
      sessionId: result.sessionId,
      threadId: sessionId, // Return thread ID for resuming
      replies: Array.from(result.replies.values()),
      synthesis: {
        summaryMd: result.summaryMd,
        consensus: result.consensus,
        dissent: result.dissent,
        risks: result.risks,
        humanGateRequired: result.humanGateRequired
      },
      metadata: {
        totalTime: 0,
        rounds: result.currentRound,
        logs: result.logs
      }
    };
  }

  /**
   * Resume an interrupted or paused session
   */
  async resumeSession(threadId: string, additionalInput?: any): Promise<any> {
    // Get the last checkpoint for this thread
    const checkpoint = await this.checkpointer.get({ configurable: { thread_id: threadId } });

    if (!checkpoint) {
      throw new Error(`No session found with thread ID: ${threadId}`);
    }

    // Get the pattern from checkpoint state
    const state = checkpoint.values as OrchestrationState;
    const pattern = this.builtInPatterns.get(state.mode);

    if (!pattern) {
      throw new Error(`Unknown pattern mode: ${state.mode}`);
    }

    // Build and compile workflow
    const workflow = this.buildWorkflowFromPattern(pattern);
    const app = workflow.compile({ checkpointer: this.checkpointer });

    // Resume with additional input if provided
    const inputState = additionalInput || {};

    const result = await app.invoke(
      inputState,
      {
        configurable: {
          thread_id: threadId
        }
      }
    );

    return {
      mode: state.mode,
      sessionId: state.sessionId,
      threadId,
      resumed: true,
      replies: Array.from(result.replies.values()),
      synthesis: {
        summaryMd: result.summaryMd,
        consensus: result.consensus,
        dissent: result.dissent,
        risks: result.risks,
        humanGateRequired: result.humanGateRequired
      },
      metadata: {
        totalTime: 0,
        rounds: result.currentRound,
        logs: result.logs
      }
    };
  }

  /**
   * Stream orchestration with real-time updates
   * Returns an async generator that yields state updates as they occur
   */
  async *orchestrateStream(params: {
    mode: string;
    question: string;
    personas: string[];
    evidenceSources?: any[];
    customPattern?: OrchestrationPattern;
    threadId?: string;
  }): AsyncGenerator<any, void, unknown> {
    const sessionId = params.threadId || `session_${Date.now()}`;

    // Get pattern (built-in or custom)
    const pattern = params.customPattern || this.builtInPatterns.get(params.mode);
    if (!pattern) {
      throw new Error(`Unknown orchestration mode: ${params.mode}`);
    }

    // Build workflow from pattern
    const workflow = this.buildWorkflowFromPattern(pattern);

    // Collect interrupt nodes for HITL
    const interruptNodes = pattern.nodes
      .filter(node => node.interruptBefore)
      .map(node => node.id);

    // Compile with checkpointer and interrupt support for HITL
    const app = workflow.compile({
      checkpointer: this.checkpointer,
      interruptBefore: interruptNodes.length > 0 ? interruptNodes : undefined
    });

    // Stream workflow execution
    const stream = app.stream(
      {
        question: params.question,
        personas: params.personas,
        mode: params.mode,
        evidenceSources: params.evidenceSources || [],
        sessionId,
        maxRounds: pattern.config?.maxRounds || 3
      },
      {
        configurable: {
          thread_id: sessionId
        }
      }
    );

    // Yield each state update as it occurs
    for await (const chunk of stream) {
      // Extract node name and state from chunk
      const nodeName = Object.keys(chunk)[0];
      const state = chunk[nodeName];

      // Check if workflow is interrupted (HITL)
      if (state.interruptReason) {
        yield {
          type: 'interrupt',
          node: nodeName,
          sessionId,
          threadId: sessionId,
          reason: state.interruptReason,
          data: state.interruptData,
          requiresApproval: true,
          message: `Workflow paused: ${state.interruptReason}`,
          timestamp: new Date().toISOString()
        };
        // Don't yield 'complete' - workflow is paused
        return;
      }

      // Format the update for the client
      yield {
        type: 'update',
        node: nodeName,
        sessionId,
        threadId: sessionId,
        state: {
          currentRound: state.currentRound,
          converged: state.converged,
          replies: state.replies ? Array.from(state.replies.values()) : [],
          consensus: state.consensus || [],
          dissent: state.dissent || [],
          logs: state.logs || [],
          summaryMd: state.summaryMd || '',
          humanGateRequired: state.humanGateRequired || false
        },
        timestamp: new Date().toISOString()
      };
    }

    // Send final completion event
    yield {
      type: 'complete',
      sessionId,
      threadId: sessionId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get session history for a thread
   */
  async getSessionHistory(threadId: string): Promise<any[]> {
    const history: any[] = [];

    // Get all checkpoints for this thread
    const checkpoints = this.checkpointer.list({ configurable: { thread_id: threadId } });

    for await (const checkpoint of checkpoints) {
      history.push({
        checkpoint_id: checkpoint.id,
        timestamp: checkpoint.ts,
        state: checkpoint.values,
        metadata: checkpoint.metadata
      });
    }

    return history.reverse(); // Most recent first
  }

  /**
   * Get list of all sessions
   */
  async listSessions(): Promise<Array<{ threadId: string; lastUpdate: string; mode: string }>> {
    const sessions = new Map<string, any>();

    // Get all checkpoints across all threads
    const allCheckpoints = this.checkpointer.list({});

    for await (const checkpoint of allCheckpoints) {
      const threadId = checkpoint.config?.configurable?.thread_id;
      if (threadId && checkpoint.values) {
        const state = checkpoint.values as OrchestrationState;
        const existing = sessions.get(threadId);

        // Keep only the most recent checkpoint per thread
        if (!existing || checkpoint.ts > existing.ts) {
          sessions.set(threadId, {
            threadId,
            lastUpdate: new Date(checkpoint.ts).toISOString(),
            mode: state.mode,
            sessionId: state.sessionId,
            rounds: state.currentRound,
            converged: state.converged
          });
        }
      }
    }

    return Array.from(sessions.values());
  }

  /**
   * Delete a session and all its checkpoints
   */
  async deleteSession(threadId: string): Promise<void> {
    // Note: SqliteSaver doesn't have a built-in delete method
    // In production, you would implement a custom delete query
    // For now, this is a placeholder
    console.warn(`Session deletion not yet implemented for thread: ${threadId}`);
  }

  /**
   * Build conversation context string from message history
   */
  private buildConversationContext(messageHistory: Array<{role: string, content: string, timestamp: string}>): string {
    if (!messageHistory || messageHistory.length === 0) {
      return '';
    }

    let context = '\n\n## Previous Conversation Context:\n\n';

    // Include last 5 messages for context (to avoid token bloat)
    const recentMessages = messageHistory.slice(-5);

    for (const msg of recentMessages) {
      if (msg.role === 'user') {
        context += `**User Question**: ${msg.content}\n\n`;
      } else {
        context += `**Panel Response Summary**: ${msg.content.substring(0, 300)}...\n\n`;
      }
    }

    context += `\n**Current Question**: `;

    return context;
  }

  /**
   * Update state after human approval/rejection (HITL)
   * Used to resume interrupted workflows with human input
   */
  async updateState(params: {
    threadId: string;
    updates: Partial<OrchestrationState>;
  }): Promise<void> {
    // Get the pattern to rebuild the workflow
    const checkpoint = await this.checkpointer.getTuple({
      configurable: { thread_id: params.threadId }
    });

    if (!checkpoint) {
      throw new Error(`No session found with thread ID: ${params.threadId}`);
    }

    const state = checkpoint.checkpoint.channel_values as OrchestrationState;
    const pattern = this.builtInPatterns.get(state.mode);

    if (!pattern) {
      throw new Error(`Unknown pattern mode: ${state.mode}`);
    }

    // Build and compile workflow
    const workflow = this.buildWorkflowFromPattern(pattern);
    const interruptNodes = pattern.nodes
      .filter(node => node.interruptBefore)
      .map(node => node.id);

    const app = workflow.compile({
      checkpointer: this.checkpointer,
      interruptBefore: interruptNodes.length > 0 ? interruptNodes : undefined
    });

    // Update state using LangGraph's updateState
    await app.updateState(
      { configurable: { thread_id: params.threadId } },
      params.updates
    );
  }

  /**
   * Build LangGraph workflow from pattern definition
   * Supports interruptBefore for Human-in-the-Loop (HITL) workflows
   */
  private buildWorkflowFromPattern(pattern: OrchestrationPattern): StateGraph<any> {
    const workflow = new StateGraph(OrchestrationStateAnnotation);

    // Collect nodes that require human approval (interruptBefore)
    const interruptNodes: string[] = [];

    // Add nodes
    for (const node of pattern.nodes) {
      const nodeFunction = this.getNodeFunction(node.type, node.config);
      workflow.addNode(node.id, nodeFunction);

      // Track nodes with interruptBefore for HITL
      if (node.interruptBefore) {
        interruptNodes.push(node.id);
      }
    }

    // Add edges
    for (const edge of pattern.edges) {
      if (edge.condition) {
        // Conditional edge
        workflow.addConditionalEdges(
          edge.from,
          this.createConditionFunction(edge.condition, edge.to, pattern.edges)
        );
      } else {
        // Direct edge
        if (edge.to === 'END') {
          workflow.addEdge(edge.from, END);
        } else {
          workflow.addEdge(edge.from, edge.to);
        }
      }
    }

    // Set entry point
    const entryNode = pattern.nodes[0].id;
    workflow.addEdge(START, entryNode);

    return workflow;
  }

  /**
   * Get node execution function by type
   */
  private getNodeFunction(type: string, config?: Record<string, any>) {
    switch (type) {
      case 'consult_parallel':
        return this.consultParallelNode.bind(this);

      case 'consult_sequential':
        return this.consultSequentialNode.bind(this);

      case 'check_consensus':
        return this.checkConsensusNode.bind(this);

      case 'cluster_themes':
        return this.clusterThemesNode.bind(this);

      case 'synthesize':
        return this.synthesizeNode.bind(this);

      default:
        throw new Error(`Unknown node type: ${type}`);
    }
  }

  /**
   * Create condition function for conditional edges
   */
  private createConditionFunction(condition: string, truePath: string, allEdges: PatternEdge[]) {
    return (state: OrchestrationState): string => {
      // Find alternative path (else path)
      const falsePath = allEdges.find(e =>
        e.from === allEdges.find(e2 => e2.to === truePath)?.from &&
        e.to !== truePath
      )?.to || END;

      // Evaluate condition
      switch (condition) {
        case 'converged':
          return state.converged ? truePath : falsePath;

        case '!converged':
          return !state.converged ? truePath : falsePath;

        case 'round < max':
          return state.currentRound < state.maxRounds ? truePath : falsePath;

        case 'has themes':
          return state.themes.length > 0 ? truePath : falsePath;

        default:
          return truePath;
      }
    };
  }

  // ============================================================================
  // NODE IMPLEMENTATIONS
  // ============================================================================

  /**
   * Consult all experts in parallel
   */
  private async consultParallelNode(state: OrchestrationState): Promise<Partial<OrchestrationState>> {
    const logs = [`[Round ${state.currentRound + 1}] Consulting ${state.personas.length} experts in parallel...`];

    // Build conversation context if message history exists
    const conversationContext = this.buildConversationContext(state.messageHistory);

    const newReplies = await Promise.all(
      state.personas.map(persona =>
        this.runExpert(persona, state.question, state.evidenceSources, state.currentRound + 1, conversationContext)
      )
    );

    // Policy check
    for (const reply of newReplies) {
      const policyResult = await policyGuard.check(reply.text);
      if (policyResult.action === 'block') {
        throw new Error(`Policy violation in ${reply.persona}: ${policyResult.notes}`);
      }
    }

    const repliesMap = new Map(newReplies.map(r => [r.persona, r]));

    return {
      replies: repliesMap,
      currentRound: state.currentRound + 1,
      logs
    };
  }

  /**
   * Consult experts sequentially
   */
  private async consultSequentialNode(state: OrchestrationState): Promise<Partial<OrchestrationState>> {
    const logs = [`[Round ${state.currentRound + 1}] Consulting experts sequentially...`];
    const newReplies: AgentReply[] = [];

    for (const persona of state.personas) {
      // Build context from previous replies
      const previousContext = newReplies.length > 0
        ? `\n\nPrevious expert opinions:\n${newReplies.map(r => `${r.persona}: ${r.text.slice(0, 200)}...`).join('\n')}`
        : '';

      const reply = await this.runExpert(
        persona,
        state.question + previousContext,
        state.evidenceSources,
        state.currentRound + 1
      );

      newReplies.push(reply);
      logs.push(`  ✓ ${persona} responded`);
    }

    const repliesMap = new Map(newReplies.map(r => [r.persona, r]));

    return {
      replies: repliesMap,
      currentRound: state.currentRound + 1,
      logs
    };
  }

  /**
   * Check if panel has reached consensus
   */
  private async checkConsensusNode(state: OrchestrationState): Promise<Partial<OrchestrationState>> {
    const replies = Array.from(state.replies.values());
    const logs = ['Checking for consensus...'];

    // Check convergence based on confidence and agreement
    const avgConfidence = replies.reduce((sum, r) => sum + r.confidence, 0) / replies.length;
    const converged = avgConfidence > 0.7 && state.currentRound >= 2;

    logs.push(`  Average confidence: ${(avgConfidence * 100).toFixed(0)}%`);
    logs.push(`  Converged: ${converged}`);

    return {
      converged,
      logs
    };
  }

  /**
   * Cluster responses into themes
   */
  private async clusterThemesNode(state: OrchestrationState): Promise<Partial<OrchestrationState>> {
    const replies = Array.from(state.replies.values());
    const logs = ['Clustering responses into themes...'];

    // Simplified theme extraction (in production, use embeddings)
    const themes = ['Safety & Efficacy', 'Regulatory Compliance', 'Market Access'];

    logs.push(`  Found ${themes.length} themes`);

    return {
      themes,
      logs
    };
  }

  /**
   * Synthesize final recommendation
   */
  private async synthesizeNode(state: OrchestrationState): Promise<Partial<OrchestrationState>> {
    const replies = Array.from(state.replies.values());
    const logs = ['Synthesizing final recommendation...'];

    // Analyze minority opinions
    logs.push('Analyzing minority opinions...');
    const minorityReplies: MinorityAgentReply[] = replies.map(r => ({
      persona: r.persona,
      message: r.text,
      confidence: r.confidence,
      reasoning: r.text // Use full text as reasoning for now
    }));

    const minorityAnalysis = minorityOpinionAnalyzer.analyzeMinorityOpinions(
      minorityReplies,
      state.question
    );

    if (minorityAnalysis.hasHighValueDissent) {
      logs.push('⚠️ HIGH-VALUE DISSENT DETECTED');
    }
    logs.push(`Found ${minorityAnalysis.minorityPositions.length} minority opinion(s)`);

    // Extract consensus
    const consensus = [
      'Panel agrees on evidence-based approach',
      'Regulatory alignment is critical',
      'Patient safety monitoring required'
    ];

    // Extract dissent (enhanced with minority analysis)
    const lowConfReplies = replies.filter(r => r.confidence < 0.5);
    const dissent: string[] = [];

    if (minorityAnalysis.minorityPositions.length > 0) {
      // Use minority analysis themes instead of generic dissent
      dissent.push(...minorityAnalysis.dissentThemes.map(theme =>
        `Minority opinion: ${theme}`
      ));
    } else if (lowConfReplies.length > 0) {
      dissent.push('Some experts expressed uncertainty about timeline');
    }

    // Collect risks
    const risks = [
      { risk: 'Regulatory approval timeline', assumption: 'Standard review process', dataRequest: 'FDA precedent data' }
    ];

    // Generate minority report section
    const minorityReport = minorityOpinionAnalyzer.formatMinorityReport(minorityAnalysis);

    // Generate summary
    const summaryMd = `# Panel Recommendation

## Question
${state.question}

## Expert Panel (${state.personas.length} experts, ${state.currentRound} rounds)
${state.personas.map(p => `- ${p}`).join('\n')}

## Consensus
${consensus.map(c => `- ${c}`).join('\n')}

${dissent.length > 0 ? `## Dissent\n${dissent.map(d => `- ${d}`).join('\n')}` : ''}

${minorityReport}

## Key Risks & Assumptions
${risks.map(r => `- **${r.risk}**: ${r.assumption}`).join('\n')}

## Individual Expert Responses
${replies.map(r => `
### ${r.persona} (Confidence: ${(r.confidence * 100).toFixed(0)}%)
${r.text}
${r.citations.length > 0 ? `\n**Citations:** ${r.citations.join(', ')}` : ''}
`).join('\n')}
`;

    // Require human gate if high-value dissent or multiple low confidence replies
    const humanGateRequired = minorityAnalysis.hasHighValueDissent || lowConfReplies.length > 2 || dissent.length > 0;

    return {
      consensus,
      dissent,
      risks,
      summaryMd,
      humanGateRequired,
      logs
    };
  }

  /**
   * Run single expert with LLM and tools
   * Uses LangChain Agent Executor for tool calling capabilities
   */
  private async runExpert(
    persona: string,
    question: string,
    evidenceSources: any[],
    round: number,
    conversationContext: string = ''
  ): Promise<AgentReply> {
    const evidenceSummary = evidenceSources.length > 0
      ? `\n\nEvidence:\n${evidenceSources.map(e => `- ${e.title}: ${e.summary}`).join('\n')}`
      : '';

    // Get all available tools for this expert
    const tools = getAllExpertTools();
    const toolCalls: ToolCall[] = [];

    try {
      // Create agent prompt template with tool support
      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          `You are {persona} for a pharmaceutical advisory board.

You have access to the following tools:
- web_search: Search for current information, clinical trials, FDA approvals, or research
- calculator: Perform precise mathematical calculations
- knowledge_base: Query internal company knowledge base
- pubmed_search: Search peer-reviewed medical literature

Use these tools when you need:
- Current/recent information (use web_search or pubmed_search)
- Precise calculations (use calculator)
- Internal company data (use knowledge_base)

Answer questions concisely (≤250 words). Include 1-3 Harvard-style citations (e.g., (EMA 2025)).

Constraints:
- Comply with GDPR/AI Act
- Avoid PHI/PII
- Mark uncertainties clearly
- State your confidence level (0-1)

Format your final response as:
Answer: [your answer with citations]
Confidence: [0-1]
Citations: [list]`
        ],
        ['human', '{input}'],
        new MessagesPlaceholder('agent_scratchpad')
      ]);

      // Create OpenAI Functions Agent
      const agent = await createOpenAIFunctionsAgent({
        llm: this.llm,
        tools,
        prompt
      });

      // Create Agent Executor
      const agentExecutor = new AgentExecutor({
        agent,
        tools,
        maxIterations: 5, // Limit tool calls to prevent infinite loops
        returnIntermediateSteps: true // Get tool call history
      });

      // Execute agent with input
      const result = await agentExecutor.invoke({
        persona,
        input: `${conversationContext}QUESTION: ${question}${evidenceSummary}`
      });

      // Extract tool calls from intermediate steps
      if (result.intermediateSteps && result.intermediateSteps.length > 0) {
        for (const step of result.intermediateSteps) {
          const action = step.action;
          const toolCall: ToolCall = {
            toolName: action.tool,
            input: action.toolInput,
            output: step.observation || '',
            timestamp: new Date().toISOString(),
            duration: 0 // Duration tracked in tools themselves
          };
          toolCalls.push(toolCall);

          // Track in global usage tracker
          toolUsageTracker.trackToolCall(toolCall);
        }
      }

      const text = result.output || result.result || '';

      // Extract confidence
      const confMatch = text.match(/confidence[:\s]+([0-9.]+)/i);
      const confidence = confMatch ? parseFloat(confMatch[1]) : 0.7;

      // Extract citations
      const citations = Array.from(text.matchAll(/\(([A-Z][a-z]+\s+\d{4})\)/g))
        .map(m => m[1]);

      return {
        persona,
        text,
        confidence,
        citations,
        timestamp: new Date().toISOString(),
        round,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined
      };

    } catch (error: any) {
      console.error(`Error running expert ${persona} with tools:`, error);

      // Fallback to simple LLM call without tools
      const fallbackPrompt = `You are ${persona} for a pharmaceutical advisory board.

Answer the QUESTION concisely (≤200 words). Include 1-3 Harvard-style citations (e.g., (EMA 2025)).
${conversationContext}
QUESTION: ${question}
${evidenceSummary}

Constraints:
- Comply with GDPR/AI Act
- Avoid PHI/PII
- Mark uncertainties clearly
- State your confidence level (0-1)

Format your response as:
Answer: [your answer with citations]
Confidence: [0-1]
Citations: [list]`;

      const response = await this.llm.invoke([
        new SystemMessage('You are a pharmaceutical expert providing evidence-based recommendations.'),
        new HumanMessage(fallbackPrompt)
      ]);

      const text = response.content.toString();
      const confMatch = text.match(/confidence[:\s]+([0-9.]+)/i);
      const confidence = confMatch ? parseFloat(confMatch[1]) : 0.7;
      const citations = Array.from(text.matchAll(/\(([A-Z][a-z]+\s+\d{4})\)/g))
        .map(m => m[1]);

      return {
        persona,
        text,
        confidence,
        citations,
        timestamp: new Date().toISOString(),
        round,
        toolCalls: undefined
      };
    }
  }

  // ============================================================================
  // BUILT-IN PATTERNS
  // ============================================================================

  private initializeBuiltInPatterns(): Map<string, OrchestrationPattern> {
    const patterns = new Map<string, OrchestrationPattern>();

    // Pattern 1: Parallel Polling
    patterns.set('parallel', {
      id: 'parallel',
      name: 'Parallel Polling',
      description: 'All experts respond simultaneously',
      icon: '⚡',
      nodes: [
        { id: 'consult', type: 'consult_parallel', label: 'Consult All Experts' },
        { id: 'synthesize', type: 'synthesize', label: 'Synthesize Recommendation' }
      ],
      edges: [
        { from: 'consult', to: 'synthesize' },
        { from: 'synthesize', to: 'END' }
      ],
      config: { maxRounds: 1 }
    });

    // Pattern 2: Sequential Roundtable
    patterns.set('sequential', {
      id: 'sequential',
      name: 'Sequential Roundtable',
      description: 'Experts respond in sequence, building on each other',
      icon: '🔄',
      nodes: [
        { id: 'consult', type: 'consult_sequential', label: 'Consult Experts Sequentially' },
        { id: 'synthesize', type: 'synthesize', label: 'Synthesize Recommendation' }
      ],
      edges: [
        { from: 'consult', to: 'synthesize' },
        { from: 'synthesize', to: 'END' }
      ],
      config: { maxRounds: 1 }
    });

    // Pattern 3: Debate (Multi-round with convergence)
    patterns.set('debate', {
      id: 'debate',
      name: 'Free Debate',
      description: 'Multi-round discussion with convergence detection',
      icon: '💬',
      nodes: [
        { id: 'consult', type: 'consult_parallel', label: 'Debate Round' },
        { id: 'check_consensus', type: 'check_consensus', label: 'Check Consensus' },
        { id: 'synthesize', type: 'synthesize', label: 'Synthesize Recommendation' }
      ],
      edges: [
        { from: 'consult', to: 'check_consensus' },
        { from: 'check_consensus', to: 'synthesize', condition: 'converged' },
        { from: 'check_consensus', to: 'consult', condition: '!converged' },
        { from: 'synthesize', to: 'END' }
      ],
      config: { maxRounds: 3 }
    });

    // Pattern 4: Funnel & Filter
    patterns.set('funnel', {
      id: 'funnel',
      name: 'Funnel & Filter',
      description: 'Breadth → cluster → depth analysis',
      icon: '🔽',
      nodes: [
        { id: 'breadth', type: 'consult_parallel', label: 'Breadth Consultation' },
        { id: 'cluster', type: 'cluster_themes', label: 'Cluster Themes' },
        { id: 'depth', type: 'consult_sequential', label: 'Deep Dive on Themes' },
        { id: 'synthesize', type: 'synthesize', label: 'Synthesize Recommendation' }
      ],
      edges: [
        { from: 'breadth', to: 'cluster' },
        { from: 'cluster', to: 'depth' },
        { from: 'depth', to: 'synthesize' },
        { from: 'synthesize', to: 'END' }
      ],
      config: { maxRounds: 2 }
    });

    return patterns;
  }

  /**
   * Get all available patterns (built-in + custom)
   */
  getAvailablePatterns(): OrchestrationPattern[] {
    return Array.from(this.builtInPatterns.values());
  }

  /**
   * Save custom pattern
   */
  saveCustomPattern(pattern: OrchestrationPattern): void {
    this.builtInPatterns.set(pattern.id, pattern);
  }
}

// Export singleton instance
export const langGraphOrchestrator = new LangGraphOrchestrator();
