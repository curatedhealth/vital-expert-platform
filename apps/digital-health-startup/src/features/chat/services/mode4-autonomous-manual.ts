/**
 * Mode 4: Autonomous-Manual Service
 * 
 * This service implements autonomous reasoning with manual agent selection.
 * Uses ReAct + Chain-of-Thought methodology with user-selected agent.
 * 
 * Architecture:
 * User Query + Selected Agent → Goal Understanding → ReAct Loop → Final Answer
 */

import { StateGraph, START, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { CompiledStateGraph } from '@langchain/langgraph';
import { 
  Mode4Config, 
  Mode4State, 
  AutonomousStreamChunk,
  AutonomousEvidenceSource,
  AutonomousCitation,
  Agent,
  GoalUnderstanding,
  CoTSubQuestion,
  ExecutionPlan,
  ReActIteration
} from './autonomous-types';
import { chainOfThoughtEngine } from './chain-of-thought-engine';
import { reActEngine } from './react-engine';

// ============================================================================
// MODE 4 SERVICE CLASS
// ============================================================================

export class Mode4AutonomousManualHandler {
  private workflow: CompiledStateGraph<Mode4State, Partial<Mode4State>>;
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.workflow = this.buildMode4Workflow();
  }

  /**
   * Execute Mode 4: Autonomous-Manual
   */
  async execute(config: Mode4Config): Promise<AsyncGenerator<AutonomousStreamChunk>> {
    const executionId = `mode4-${Date.now()}`;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🤖 [Mode 4] Starting Autonomous-Manual execution [${executionId}]`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📝 Query: "${config.message.substring(0, 100)}${config.message.length > 100 ? '...' : ''}"`);
    console.log(`👤 Agent ID: ${config.agentId}`);
    console.log(`🔧 RAG: ${config.enableRAG ? '✅ enabled' : '❌ disabled'}`);
    console.log(`🛠️  Tools: ${config.enableTools ? '✅ enabled' : '❌ disabled'}`);
    console.log(`🔁 Max Iterations: ${config.maxIterations || 10}`);
    console.log(`🎯 Confidence Threshold: ${config.confidenceThreshold || 0.95}`);
    console.log(`🤖 Model: ${config.model || 'default'}`);
    console.log(`💬 Conversation History: ${config.conversationHistory?.length || 0} messages`);

    const startTime = Date.now();
    const stepStartTimes: Record<string, number> = {};

    try {
      console.log(`\n📋 [Mode 4:${executionId}] Step 1: Preparing conversation history...`);
      stepStartTimes.preparation = Date.now();
      
      // Convert conversation history to BaseMessage format
      const baseMessages: BaseMessage[] = (config.conversationHistory || []).map(msg => {
        if (msg.role === 'user') {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });
      console.log(`✅ [Mode 4:${executionId}] Converted ${baseMessages.length} messages to BaseMessage format`);

      // Initialize state (partial - will be populated by workflow nodes)
      const initialState: Partial<Mode4State> = {
        query: config.message,
        conversationHistory: baseMessages,
        config,
        subQuestions: [],
        iterations: [],
        currentPhase: 'initial',
        currentIteration: 0,
        finalAnswer: '',
        confidence: 0,
        toolsUsed: [],
        ragContexts: [],
        sources: [],
        citations: [],
        executionTime: 0,
        timestamp: new Date().toISOString(),
        agentExpertise: []
      };
      console.log(`✅ [Mode 4:${executionId}] Initial state prepared`);
      console.log(`\n🔄 [Mode 4:${executionId}] Step 2: Executing LangGraph workflow...`);
      stepStartTimes.workflow = Date.now();

      let result: Mode4State;
      try {
        // Execute LangGraph workflow
        // Type assertion needed because LangGraph returns partial state updates
        result = await this.workflow.invoke(initialState as Mode4State) as Mode4State;
        
        const workflowTime = Date.now() - stepStartTimes.workflow;
        console.log(`✅ [Mode 4:${executionId}] Workflow completed in ${workflowTime}ms`);
      } catch (workflowError) {
        const workflowTime = Date.now() - stepStartTimes.workflow;
        console.error(`❌ [Mode 4:${executionId}] Workflow invocation failed after ${workflowTime}ms`);
        console.error(`❌ [Mode 4:${executionId}] Workflow error:`, workflowError);
        if (workflowError instanceof Error) {
          console.error(`❌ [Mode 4:${executionId}] Error message:`, workflowError.message);
          console.error(`❌ [Mode 4:${executionId}] Error stack:`, workflowError.stack);
        }
        throw new Error(`LangGraph workflow failed: ${workflowError instanceof Error ? workflowError.message : 'Unknown workflow error'}`);
      }

      console.log(`\n🔍 [Mode 4:${executionId}] Step 3: Validating workflow results...`);
      stepStartTimes.validation = Date.now();

      // Check for errors in the result
      if (result.error) {
        console.error(`❌ [Mode 4:${executionId}] Workflow returned error: ${result.error}`);
        throw new Error(result.error);
      }

      // Validate required fields are present
      if (!result.selectedAgent || !result.selectedAgent.id) {
        console.error(`❌ [Mode 4:${executionId}] Validation failed: selectedAgent is missing`);
        console.error(`   selectedAgent:`, result.selectedAgent);
        throw new Error('Agent loading failed: selectedAgent is missing');
      }
      console.log(`✅ [Mode 4:${executionId}] Agent loaded: ${result.selectedAgent.display_name || result.selectedAgent.name}`);

      if (!result.goalUnderstanding || !result.goalUnderstanding.translatedGoal) {
        console.error(`❌ [Mode 4:${executionId}] Validation failed: goalUnderstanding is missing`);
        console.error(`   goalUnderstanding:`, result.goalUnderstanding);
        throw new Error('Goal understanding failed: goalUnderstanding is missing');
      }
      console.log(`✅ [Mode 4:${executionId}] Goal understood: "${result.goalUnderstanding.translatedGoal.substring(0, 80)}..."`);

      if (!result.finalAnswer && result.iterations.length === 0) {
        console.error(`❌ [Mode 4:${executionId}] Validation failed: No iterations and no final answer`);
        console.error(`   iterations: ${result.iterations.length}, finalAnswer length: ${result.finalAnswer?.length || 0}`);
        throw new Error('Execution failed: No iterations completed and no final answer');
      }
      console.log(`✅ [Mode 4:${executionId}] Execution completed: ${result.iterations.length} iterations, finalAnswer: ${result.finalAnswer ? 'present' : 'missing'}`);
      console.log(`✅ [Mode 4:${executionId}] Final confidence: ${(result.confidence * 100).toFixed(1)}%`);

      const validationTime = Date.now() - stepStartTimes.validation;
      console.log(`✅ [Mode 4:${executionId}] Validation completed in ${validationTime}ms`);

      console.log(`\n📡 [Mode 4:${executionId}] Step 4: Streaming results...`);
      stepStartTimes.streaming = Date.now();

      // Stream the results
      return this.streamMode4Results(result, startTime, executionId);

    } catch (error) {
      const errorTime = Date.now() - startTime;
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error(`❌ [Mode 4:${executionId}] Execution failed after ${errorTime}ms`);
      console.error(`❌ [Mode 4:${executionId}] Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
      console.error(`❌ [Mode 4:${executionId}] Error message: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error && error.stack) {
        console.error(`❌ [Mode 4:${executionId}] Stack trace:`);
        console.error(error.stack);
      }
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Yield error chunk for proper error handling in frontend
      return (async function* () {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        yield {
          type: 'error' as const,
          content: errorMessage,
          message: errorMessage,
          metadata: {
            executionId,
            executionTime: errorTime
          },
          timestamp: new Date().toISOString()
        };
      })();
    }
  }

  private mapSimilarityToEvidenceLevel(similarity?: number) {
    if (typeof similarity !== 'number') {
      return 'Unknown';
    }
    if (similarity >= 0.85) {
      return 'A';
    }
    if (similarity >= 0.7) {
      return 'B';
    }
    if (similarity >= 0.55) {
      return 'C';
    }
    return 'D';
  }

  private toBranchSource(
    source: AutonomousEvidenceSource,
    index: number
  ) {
    return {
      id: source.id || `source-${index + 1}`,
      title: source.title || `Source ${index + 1}`,
      url: source.url,
      excerpt: source.excerpt,
      similarity: source.similarity,
      domain: source.domain,
      organization: source.organization,
      evidenceLevel: this.mapSimilarityToEvidenceLevel(source.similarity),
      lastUpdated: source.lastUpdated,
    };
  }

  private formatMetaEvent(event: Record<string, unknown>): string {
    return `__mode1_meta__${JSON.stringify(event)}`;
  }

  private buildFinalMetaChunk(
    result: Mode4State,
    sources: AutonomousEvidenceSource[],
    citations: AutonomousCitation[],
    startTime: number
  ): string {
    const branchSources = sources.map((source, idx) => this.toBranchSource(source, idx));
    const sourceMap = new Map<string, any>();
    branchSources.forEach((source) => {
      if (source.id) {
        sourceMap.set(String(source.id), source);
      }
    });

    const normalizedCitations = (citations && citations.length > 0 ? citations : this.defaultCitationsFromSources(sources)).map(
      (citation, idx) => {
        const candidateSourceIds = [
          ...(citation.sources?.map((src) => src.id).filter(Boolean) as string[]),
          citation.sourceId,
          branchSources[idx]?.id,
        ].filter(Boolean) as string[];

        const mappedSources = candidateSourceIds
          .map((id) => sourceMap.get(String(id)))
          .filter(Boolean);

        if (mappedSources.length === 0 && branchSources[idx]) {
          mappedSources.push(branchSources[idx]);
        }

        const uniqueSources = Array.from(
          new Map(mappedSources.map((item) => [item.id, item])).values()
        );

        return {
          number: citation.number ?? idx + 1,
          sourceId: uniqueSources[0]?.id ?? citation.sourceId ?? branchSources[idx]?.id,
          sources: uniqueSources,
        };
      }
    );

    const reasoning = result.iterations
      ?.map((iteration) => iteration.reflection)
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    const durationMs = result.executionTime || Math.max(0, Date.now() - startTime);
    const uniqueDomains = Array.from(
      new Set(
        sources
          .map((source) => source.domain)
          .filter((domain): domain is string => typeof domain === 'string' && domain.trim().length > 0)
      )
    );

    return this.formatMetaEvent({
      event: 'final',
      executionPath: 'mode4_autonomous',
      durationMs,
      rag: {
        totalSources: sources.length,
        strategy: 'autonomous-react',
        domains: uniqueDomains,
        cacheHit: false,
        retrievalTimeMs: durationMs,
      },
      tools: {
        allowed: Array.from(new Set(result.toolsUsed || [])),
        used: Array.from(new Set(result.toolsUsed || [])),
        totals: {
          calls: result.toolsUsed?.length ?? 0,
          success: result.toolsUsed?.length ?? 0,
          failure: 0,
          totalTimeMs: durationMs,
        },
      },
      branches: [
        {
          id: branchSources[0]?.id || 'mode4-branch-0',
          content: result.finalAnswer,
          confidence: result.confidence,
          citations: normalizedCitations,
          sources: branchSources,
          createdAt: new Date().toISOString(),
          reasoning,
        },
      ],
      currentBranch: 0,
      confidence: result.confidence,
      citations: normalizedCitations,
    });
  }

  private defaultCitationsFromSources(
    sources: AutonomousEvidenceSource[]
  ): AutonomousCitation[] {
    return sources.map((source, idx) => ({
      number: idx + 1,
      sourceId: source.id || `source-${idx + 1}`,
      sources: [source],
    }));
  }
  /**
   * Build LangGraph workflow for Mode 4
   */
  buildMode4Workflow(): CompiledStateGraph<Mode4State, Partial<Mode4State>> {
    const workflow = new StateGraph<Mode4State>({
      channels: {
        query: { value: (x: string, y: string) => y ?? x },
        conversationHistory: { value: (x: BaseMessage[], y: BaseMessage[]) => y ?? x },
        config: { value: (x: Mode4Config, y: Mode4Config) => y ?? x },
        goalUnderstanding: { value: (x: GoalUnderstanding, y: GoalUnderstanding) => y ?? x },
        executionPlan: { value: (x: ExecutionPlan, y: ExecutionPlan) => y ?? x },
        subQuestions: { value: (x: CoTSubQuestion[], y: CoTSubQuestion[]) => y ?? x },
        iterations: { value: (x: ReActIteration[], y: ReActIteration[]) => y ?? x },
        currentPhase: { value: (x: string, y: string) => y ?? x },
        currentIteration: { value: (x: number, y: number) => y ?? x },
        finalAnswer: { value: (x: string, y: string) => y ?? x },
        confidence: { value: (x: number, y: number) => y ?? x },
        toolsUsed: { value: (x: string[], y: string[]) => y ?? x },
        ragContexts: { value: (x: string[], y: string[]) => y ?? x },
        sources: { value: (x: AutonomousEvidenceSource[], y: AutonomousEvidenceSource[]) => y ?? x },
        citations: { value: (x: AutonomousCitation[], y: AutonomousCitation[]) => y ?? x },
        executionTime: { value: (x: number, y: number) => y ?? x },
        timestamp: { value: (x: string, y: string) => y ?? x },
        error: { value: (x: string | undefined, y: string | undefined) => y ?? x },
        selectedAgent: { value: (x: Agent, y: Agent) => y ?? x },
        agentExpertise: { value: (x: string[], y: string[]) => y ?? x },
        streamingSteps: { value: (x: any[], y: any[]) => y ?? x }
      }
    });

    // Add workflow nodes
    workflow.addNode('load_agent', this.loadAgentNode.bind(this));
    workflow.addNode('understand_goal', this.understandGoalNode.bind(this));
    workflow.addNode('decompose_goal', this.decomposeGoalNode.bind(this));
    workflow.addNode('create_plan', this.createPlanNode.bind(this));
    workflow.addNode('execute_react', this.executeReActNode.bind(this));
    workflow.addNode('synthesize_answer', this.synthesizeAnswerNode.bind(this));

    // Define workflow edges (linear flow - errors are checked in validation phase)
    workflow.addEdge(START, 'load_agent');
    workflow.addEdge('load_agent', 'understand_goal');
    workflow.addEdge('understand_goal', 'decompose_goal');
    workflow.addEdge('decompose_goal', 'create_plan');
    workflow.addEdge('create_plan', 'execute_react');
    workflow.addEdge('execute_react', 'synthesize_answer');
    workflow.addEdge('synthesize_answer', END);

    return workflow.compile();
  }

  // ============================================================================
  // WORKFLOW NODES
  // ============================================================================

  /**
   * Node 1: Load Selected Agent from Database
   */
  private async loadAgentNode(state: Mode4State): Promise<Partial<Mode4State>> {
    const nodeStartTime = Date.now();
    console.log(`\n  📍 [Mode 4] Workflow Node 1/6: Loading agent (ID: ${state.config.agentId})...`);

    try {
      const { data, error } = await this.supabase
        .from('agents')
        .select('id, name, display_name, system_prompt, model, capabilities, metadata, specialties, tier, description')
        .eq('id', state.config.agentId)
        .single();

      if (error) {
        console.error(`  ❌ [Mode 4] Node 1 failed: Database error fetching agent`);
        console.error(`  ❌ [Mode 4] Error code: ${error.code}, message: ${error.message}`);
        return { error: `Agent not found: ${state.config.agentId}` };
      }

      if (!data) {
        console.error(`  ❌ [Mode 4] Node 1 failed: Agent not found in database`);
        console.error(`  ❌ [Mode 4] Agent ID queried: ${state.config.agentId}`);
        return { error: `Agent not found: ${state.config.agentId}` };
      }

      console.log(`  ✅ [Mode 4] Node 1: Agent data retrieved from database`);

      // Extract tools from metadata if present
      const tools = data.metadata?.tools || [];
      const capabilities = data.capabilities || [];
      const specialties = data.specialties ? (typeof data.specialties === 'string' ? [data.specialties] : data.specialties) : [];

      const selectedAgent: Agent = {
        id: data.id,
        name: data.name,
        display_name: data.display_name || data.name,
        system_prompt: data.system_prompt || 'You are an expert assistant.',
        model: data.model || 'gpt-4',
        capabilities: capabilities,
        tools: tools,
        knowledge_domain: specialties[0] || 'general',
        tier: data.tier || 1,
        specialties: specialties
      };

      const agentExpertise = [
        ...specialties,
        ...capabilities,
        data.description || 'general knowledge'
      ].filter((item, index, self) => self.indexOf(item) === index); // Remove duplicates

      const nodeTime = Date.now() - nodeStartTime;
      console.log(`  ✅ [Mode 4] Node 1 completed in ${nodeTime}ms`);
      console.log(`     Agent: ${selectedAgent.display_name} (ID: ${selectedAgent.id})`);
      console.log(`     Model: ${selectedAgent.model} | Tier: ${selectedAgent.tier}`);
      console.log(`     Capabilities: ${capabilities.length} | Tools: ${tools.length} | Specialties: ${specialties.length}`);
      if (agentExpertise.length > 0) {
        console.log(`     Expertise: ${agentExpertise.slice(0, 3).join(', ')}${agentExpertise.length > 3 ? '...' : ''}`);
      }
      
      return { 
        selectedAgent,
        agentExpertise
      };
    } catch (error) {
      const nodeTime = Date.now() - nodeStartTime;
      console.error(`  ❌ [Mode 4] Node 1 failed after ${nodeTime}ms`);
      console.error(`  ❌ [Mode 4] Error:`, error);
      return { error: `Agent loading failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 2: Understand Goal with Selected Agent
   */
  private async understandGoalNode(state: Mode4State): Promise<Partial<Mode4State>> {
    const nodeStartTime = Date.now();
    console.log(`\n  📍 [Mode 4] Workflow Node 2/6: Understanding goal...`);

    try {
      const goalUnderstanding = await chainOfThoughtEngine.understandGoal(
        state.query, 
        state.selectedAgent
      );
      
      const nodeTime = Date.now() - nodeStartTime;
      console.log(`  ✅ [Mode 4] Node 2 completed in ${nodeTime}ms`);
      console.log(`     Goal Type: ${goalUnderstanding.goalType} | Complexity: ${goalUnderstanding.complexity}`);
      console.log(`     Translated Goal: "${goalUnderstanding.translatedGoal.substring(0, 80)}..."`);
      console.log(`     Estimated Steps: ${goalUnderstanding.estimatedSteps}`);
      console.log(`     Required Domains: ${goalUnderstanding.requiredDomains.join(', ') || 'none'}`);
      
      return { goalUnderstanding };
    } catch (error) {
      const nodeTime = Date.now() - nodeStartTime;
      console.error(`  ❌ [Mode 4] Node 2 failed after ${nodeTime}ms`);
      console.error(`  ❌ [Mode 4] Error:`, error);
      return { error: `Goal understanding failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 3: Decompose Goal with Selected Agent
   */
  private async decomposeGoalNode(state: Mode4State): Promise<Partial<Mode4State>> {
    const nodeStartTime = Date.now();
    console.log(`\n  📍 [Mode 4] Workflow Node 3/6: Decomposing goal...`);

    try {
      const subQuestions = await chainOfThoughtEngine.decomposeGoal(
        state.goalUnderstanding,
        state.selectedAgent
      );

      const prioritizedQuestions = await chainOfThoughtEngine.prioritizeQuestions(subQuestions);

      const nodeTime = Date.now() - nodeStartTime;
      const criticalCount = prioritizedQuestions.filter(q => q.priority === 'critical').length;
      const importantCount = prioritizedQuestions.filter(q => q.priority === 'important').length;
      console.log(`  ✅ [Mode 4] Node 3 completed in ${nodeTime}ms`);
      console.log(`     Sub-questions: ${prioritizedQuestions.length} total`);
      console.log(`     Priority breakdown: ${criticalCount} critical, ${importantCount} important, ${prioritizedQuestions.length - criticalCount - importantCount} nice-to-have`);
      
      return { subQuestions: prioritizedQuestions };
    } catch (error) {
      const nodeTime = Date.now() - nodeStartTime;
      console.error(`  ❌ [Mode 4] Node 3 failed after ${nodeTime}ms`);
      console.error(`  ❌ [Mode 4] Error:`, error);
      return { error: `Goal decomposition failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 4: Create Execution Plan
   */
  private async createPlanNode(state: Mode4State): Promise<Partial<Mode4State>> {
    const nodeStartTime = Date.now();
    console.log(`\n  📍 [Mode 4] Workflow Node 4/6: Creating execution plan...`);

    try {
      const executionPlan = await chainOfThoughtEngine.createExecutionPlan(
        state.goalUnderstanding,
        state.subQuestions,
        state.selectedAgent
      );

      const nodeTime = Date.now() - nodeStartTime;
      console.log(`  ✅ [Mode 4] Node 4 completed in ${nodeTime}ms`);
      console.log(`     Phases: ${executionPlan.phases.length}`);
      console.log(`     Estimated Duration: ${executionPlan.estimatedDuration}s`);
      console.log(`     Max Iterations: ${executionPlan.maxIterations}`);
      console.log(`     Checkpoint Strategy: ${executionPlan.checkpointStrategy}`);
      executionPlan.phases.forEach((phase, idx) => {
        console.log(`       Phase ${idx + 1}: ${phase.name} (${phase.estimatedIterations} iterations, ${phase.subQuestions.length} sub-questions)`);
      });
      
      return { executionPlan };
    } catch (error) {
      const nodeTime = Date.now() - nodeStartTime;
      console.error(`  ❌ [Mode 4] Node 4 failed after ${nodeTime}ms`);
      console.error(`  ❌ [Mode 4] Error:`, error);
      return { error: `Execution plan creation failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 5: Execute ReAct Loop
   */
  private async executeReActNode(state: Mode4State): Promise<Partial<Mode4State>> {
    const nodeStartTime = Date.now();
    console.log(`\n  📍 [Mode 4] Workflow Node 5/6: Executing ReAct loop...`);
    console.log(`     Max Iterations: ${state.config.maxIterations || 10}`);
    console.log(`     Confidence Threshold: ${(state.config.confidenceThreshold || 0.95) * 100}%`);

    // Validate required state is present
    if (!state.selectedAgent || !state.selectedAgent.id) {
      console.error(`  ❌ [Mode 4] Node 5 failed: selectedAgent is missing`);
      console.error(`     selectedAgent:`, state.selectedAgent);
      return { error: 'ReAct execution failed: selectedAgent is missing' };
    }

    if (!state.goalUnderstanding || !state.goalUnderstanding.translatedGoal) {
      console.error(`  ❌ [Mode 4] Node 5 failed: goalUnderstanding is missing`);
      console.error(`     goalUnderstanding:`, state.goalUnderstanding);
      return { error: 'ReAct execution failed: goalUnderstanding is missing' };
    }

    if (!state.executionPlan || !state.executionPlan.phases || state.executionPlan.phases.length === 0) {
      console.error(`  ❌ [Mode 4] Node 5 failed: executionPlan is missing or invalid`);
      console.error(`     executionPlan:`, state.executionPlan);
      return { error: 'ReAct execution failed: executionPlan is missing or invalid' };
    }

    if (!state.subQuestions || state.subQuestions.length === 0) {
      console.error(`  ❌ [Mode 4] Node 5 failed: subQuestions is missing or empty`);
      console.error(`     subQuestions:`, state.subQuestions);
      return { error: 'ReAct execution failed: subQuestions is missing or empty' };
    }

    try {
      // Create a streaming callback that will yield steps in real-time
      const streamingSteps: Array<{ type: string; content: string; metadata?: any }> = [];
      
      const reactResult = await reActEngine.executeReActLoop(
        state.goalUnderstanding,
        state.subQuestions,
        state.executionPlan,
        state.selectedAgent,
        state.config.maxIterations || 10,
        state.config.confidenceThreshold || 0.95,
        state.config.enableRAG !== false, // Default to true, only disable if explicitly false
        (step) => {
          // Collect steps for streaming
          streamingSteps.push(step);
        }
      );

      // Store streaming steps in state for later streaming
      state.streamingSteps = streamingSteps;

      const nodeTime = Date.now() - nodeStartTime;
      console.log(`  ✅ [Mode 4] Node 5 completed in ${nodeTime}ms`);
      console.log(`     Iterations: ${reactResult.iterations.length}`);
      console.log(`     Final Confidence: ${(reactResult.confidence * 100).toFixed(1)}%`);
      console.log(`     Tools Used: ${reactResult.toolsUsed.length > 0 ? reactResult.toolsUsed.join(', ') : 'none'}`);
      console.log(`     Final Answer Length: ${reactResult.finalAnswer.length} characters`);
      
      return {
        iterations: reactResult.iterations,
        finalAnswer: reactResult.finalAnswer,
        confidence: reactResult.confidence,
        toolsUsed: reactResult.toolsUsed,
        ragContexts: reactResult.ragContexts,
        sources: reactResult.sources,
        citations: reactResult.citations
      };
    } catch (error) {
      const nodeTime = Date.now() - nodeStartTime;
      console.error(`  ❌ [Mode 4] Node 5 failed after ${nodeTime}ms`);
      console.error(`  ❌ [Mode 4] Error:`, error);
      return { error: `ReAct execution failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 6: Synthesize Final Answer
   */
  private async synthesizeAnswerNode(state: Mode4State): Promise<Partial<Mode4State>> {
    const nodeStartTime = Date.now();
    console.log(`\n  📍 [Mode 4] Workflow Node 6/6: Synthesizing final answer...`);

    try {
      // The final answer is already synthesized in the ReAct loop
      // This node calculates execution time and validates the answer
      
      const executionTime = Date.now() - new Date(state.timestamp).getTime();
      
      const nodeTime = Date.now() - nodeStartTime;
      console.log(`  ✅ [Mode 4] Node 6 completed in ${nodeTime}ms`);
      console.log(`     Total Execution Time: ${executionTime}ms (${(executionTime / 1000).toFixed(2)}s)`);
      console.log(`     Final Answer Ready: ${state.finalAnswer ? '✅ Yes' : '❌ No'}`);
      console.log(`     Answer Length: ${state.finalAnswer?.length || 0} characters`);
      
      return { executionTime };
    } catch (error) {
      const nodeTime = Date.now() - nodeStartTime;
      console.error(`  ❌ [Mode 4] Node 6 failed after ${nodeTime}ms`);
      console.error(`  ❌ [Mode 4] Error:`, error);
      return { error: `Final answer synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  // ============================================================================
  // STREAMING RESULTS
  // ============================================================================

  private async *streamMode4Results(
    result: Mode4State, 
    startTime: number,
    executionId?: string
  ): AsyncGenerator<AutonomousStreamChunk> {
    const streamStartTime = Date.now();
    console.log(`  📡 [Mode 4:${executionId}] Starting to stream results...`);

    try {
      // Stream agent loading
      yield {
        type: 'agent_selection',
        content: `Using Agent: ${result.selectedAgent?.name || result.selectedAgent?.display_name || 'Unknown Agent'}`,
        metadata: {
          agent: result.selectedAgent,
          confidence: 1.0 // Manual selection has full confidence
        },
        timestamp: new Date().toISOString()
      };

      // Stream goal understanding
      yield {
        type: 'goal_understanding',
        content: `Goal: ${result.goalUnderstanding.translatedGoal}`,
        metadata: {
          confidence: result.confidence,
          agent: result.selectedAgent
        },
        timestamp: new Date().toISOString()
      };

      // Stream execution plan
      yield {
        type: 'execution_plan',
        content: `Execution Plan: ${result.executionPlan.phases.length} phases, ${result.subQuestions.length} sub-questions`,
        metadata: {
          phases: result.executionPlan.phases.length,
          subQuestions: result.subQuestions.length
        },
        timestamp: new Date().toISOString()
      };

      // Stream all detailed ReAct steps in real-time
      // First stream the detailed steps collected during execution
      if (result.streamingSteps && result.streamingSteps.length > 0) {
        for (const step of result.streamingSteps) {
          yield {
            type: step.type,
            content: step.content,
            metadata: {
              ...step.metadata,
              timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
          };
        }
      } else {
        // Fallback: Stream iterations if detailed steps aren't available
        for (const iteration of result.iterations) {
          yield {
            type: 'iteration_start',
            content: `Iteration ${iteration.iteration + 1}`,
            metadata: {
              iteration: iteration.iteration,
              confidence: iteration.confidence
            },
            timestamp: new Date().toISOString()
          };

          yield {
            type: 'thought',
            content: iteration.thought,
            metadata: {
              iteration: iteration.iteration,
              phase: 'thinking'
            },
            timestamp: new Date().toISOString()
          };

          yield {
            type: 'action',
            content: iteration.action,
            metadata: {
              iteration: iteration.iteration,
              phase: 'acting',
              toolsUsed: iteration.toolsUsed
            },
            timestamp: new Date().toISOString()
          };

          yield {
            type: 'observation',
            content: iteration.observation,
            metadata: {
              iteration: iteration.iteration,
              phase: 'observing',
              ragContext: iteration.ragContext
            },
            timestamp: new Date().toISOString()
          };

          yield {
            type: 'reflection',
            content: iteration.reflection,
            metadata: {
              iteration: iteration.iteration,
              phase: 'reflecting',
              confidence: iteration.confidence
            },
            timestamp: new Date().toISOString()
          };
        }
      }

      const normalizedSources = Array.isArray(result.sources) ? result.sources : [];
      const normalizedCitations = Array.isArray(result.citations) ? result.citations : [];

      const finalMetaChunk = this.buildFinalMetaChunk(result, normalizedSources, normalizedCitations, startTime);
      yield {
        type: 'chunk',
        content: finalMetaChunk,
        timestamp: new Date().toISOString()
      };

      if (normalizedSources.length > 0) {
        const sourcePayloads = normalizedSources.map((source, idx) => this.toBranchSource(source, idx));
        const domains = Array.from(
          new Set(
            sourcePayloads
              .map((source) => source.domain)
              .filter((domain): domain is string => typeof domain === 'string' && domain.trim().length > 0)
          )
        );

        yield {
          type: 'sources',
          sources: sourcePayloads,
          metadata: {
            totalSources: sourcePayloads.length,
            domains,
          },
          timestamp: new Date().toISOString()
        };
      }

      // Stream final answer
      yield {
        type: 'final_answer',
        content: result.finalAnswer,
        metadata: {
          confidence: result.confidence,
          toolsUsed: result.toolsUsed,
          iterations: result.iterations.length
        },
        timestamp: new Date().toISOString()
      };

      // Stream completion
      yield {
        type: 'done',
        content: 'Mode 4 execution completed',
        metadata: {
          executionTime: result.executionTime,
          totalIterations: result.iterations.length,
          finalConfidence: result.confidence,
          totalSources: normalizedSources.length
        },
        sources: normalizedSources.map((source, idx) => this.toBranchSource(source, idx)),
        timestamp: new Date().toISOString()
      };

      const streamTime = Date.now() - streamStartTime;
      const totalTime = Date.now() - startTime;
      console.log(`  ✅ [Mode 4:${executionId}] Streaming completed in ${streamTime}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ [Mode 4:${executionId}] EXECUTION COMPLETE`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`⏱️  Total Time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
      console.log(`🔄 Iterations: ${result.iterations.length}`);
      console.log(`🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`🛠️  Tools Used: ${result.toolsUsed.length}`);
      console.log(`📝 Answer Length: ${result.finalAnswer.length} characters`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
      const streamTime = Date.now() - streamStartTime;
      console.error(`  ❌ [Mode 4:${executionId}] Streaming failed after ${streamTime}ms`);
      console.error(`  ❌ [Mode 4:${executionId}] Error:`, error);
      yield {
        type: 'error',
        content: `Streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// ============================================================================
// EXPORT FUNCTION
// ============================================================================

/**
 * Execute Mode 4: Autonomous-Manual
 */
// Use API Gateway URL for compliance with Golden Rule (Python services via gateway)
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  process.env.AI_ENGINE_URL || // Fallback for compatibility
  'http://localhost:3001'; // Default to API Gateway

interface Mode4AutonomousManualApiResponse {
  agent_id: string;
  content: string;
  confidence: number;
  citations: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
  processing_time_ms: number;
  autonomous_reasoning: {
    iterations: number;
    tools_used: string[];
    reasoning_steps: string[];
    confidence_threshold: number;
    max_iterations: number;
  };
}

/**
 * Build metadata chunk string to keep the UI streaming helpers working.
 */
function buildMetadataChunk(eventPayload: Record<string, unknown>): string {
  return `__mode4_meta__${JSON.stringify(eventPayload)}`;
}

/**
 * Convert Python response citations into the structure expected by the UI.
 */
function mapCitationsToSources(citations: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return citations.map((citation, index) => ({
    id: String(citation.id ?? `source-${index + 1}`),
    url: citation.url ?? citation.link ?? '#',
    title: citation.title ?? citation.name ?? `Source ${index + 1}`,
    excerpt: citation.relevant_quote ?? citation.excerpt ?? citation.summary ?? '',
    similarity: citation.similarity ?? citation.confidence_score ?? undefined,
    domain: citation.domain,
    evidenceLevel: citation.evidence_level ?? citation.evidenceLevel ?? 'Unknown',
    organization: citation.organization,
    reliabilityScore: citation.reliabilityScore,
    lastUpdated: citation.lastUpdated,
  }));
}

export async function* executeMode4(config: Mode4Config): AsyncGenerator<AutonomousStreamChunk> {
  const requestId = `mode4_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();

  try {
    const payload = {
      agent_id: config.agentId,
      message: config.message,
      enable_rag: config.enableRAG !== false,
      enable_tools: config.enableTools ?? true,
      selected_rag_domains: config.selectedRagDomains ?? [],
      requested_tools: config.requestedTools ?? [],
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 2000,
      max_iterations: config.maxIterations ?? 10,
      confidence_threshold: config.confidenceThreshold ?? 0.95,
      user_id: config.userId,
      tenant_id: config.tenantId,
      session_id: config.sessionId,
      conversation_history: config.conversationHistory ?? [],
    };

    // Call via API Gateway to comply with Golden Rule (Python services via gateway)
    const response = await fetch(`${API_GATEWAY_URL}/api/mode4/autonomous-manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.detail || errorBody.error || `API Gateway responded with status ${response.status}`);
    }

    const result = (await response.json()) as Mode4AutonomousManualApiResponse;

    // Emit autonomous reasoning metadata
    if (result.autonomous_reasoning) {
      yield {
        type: 'reasoning_start',
        metadata: {
          max_iterations: result.autonomous_reasoning.max_iterations,
          confidence_threshold: result.autonomous_reasoning.confidence_threshold,
          agent_id: result.agent_id,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Emit RAG sources if available
    const sources = mapCitationsToSources(result.citations || []);
    if (sources.length > 0) {
      yield buildMetadataChunk({
        event: 'rag_sources',
        total: sources.length,
        sources,
        strategy: 'python_orchestrator',
        cacheHit: false,
        domains: config.selectedRagDomains ?? [],
      });
    }

    // Emit final metadata
    yield buildMetadataChunk({
      event: 'final',
      confidence: result.confidence,
      rag: {
        totalSources: sources.length,
        strategy: 'python_orchestrator',
        domains: config.selectedRagDomains ?? [],
        cacheHit: false,
        retrievalTimeMs: result.processing_time_ms,
      },
      autonomous_reasoning: result.autonomous_reasoning,
      citations: result.citations ?? [],
    });

    // Emit response content
    yield {
      type: 'content',
      content: result.content,
      metadata: {
        confidence: result.confidence,
        iterations: result.autonomous_reasoning?.iterations ?? 0,
        toolsUsed: result.autonomous_reasoning?.tools_used ?? [],
        agentId: result.agent_id,
      },
      timestamp: new Date().toISOString(),
    };

    // Emit completion
    yield {
      type: 'done',
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    yield {
      type: 'error',
      content: `Error: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    };
    throw error;
  }
}

}
