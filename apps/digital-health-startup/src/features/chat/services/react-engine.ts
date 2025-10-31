/**
 * @deprecated This engine is deprecated and no longer used.
 * 
 * ReAct Engine for Autonomous Modes
 * 
 * This engine was used by the deprecated `Mode3AutonomousAutomaticHandler` class.
 * Mode 3 and Mode 4 now use the Python AI Engine via API Gateway (Golden Rule compliant).
 * 
 * The Python services handle ReAct logic for autonomous reasoning.
 * 
 * DO NOT USE: Mode 3/4 execution now goes through API Gateway → Python AI Engine.
 * 
 * This file is kept for reference only and should be removed in a future cleanup.
 */

import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { 
  ReActIteration, 
  CoTSubQuestion, 
  GoalUnderstanding, 
  ExecutionPlan,
  ConfidenceAssessment,
  ToolExecutionResult,
  AutonomousTool,
  Agent,
  AutonomousEvidenceSource,
  AutonomousCitation
} from './autonomous-types';
import { unifiedRAGService } from '../../../lib/services/rag/unified-rag-service';

// ============================================================================
// REACT ENGINE CLASS
// ============================================================================

export class ReActEngine {
  private llm: ChatOpenAI;
  private availableTools: Map<string, AutonomousTool> = new Map();
  private enableRAG: boolean = true; // Default to enabled
  private collectedSources: AutonomousEvidenceSource[] = [];

  constructor() {
    this.llm = new ChatOpenAI({
      model: 'gpt-4',
      temperature: 0.7, // Higher temperature for creative reasoning
      maxTokens: 2000,
    });

    this.initializeTools();
  }

  /**
   * Execute the ReAct loop for autonomous reasoning with streaming support
   */
  async executeReActLoop(
    goalUnderstanding: GoalUnderstanding,
    subQuestions: CoTSubQuestion[],
    executionPlan: ExecutionPlan,
    agent: Agent,
    maxIterations: number = 10,
    confidenceThreshold: number = 0.95,
    enableRAG: boolean = true, // Default to true - RAG is essential for reasoning
    onStep?: (step: { type: string; content: string; metadata?: any }) => void // Streaming callback
  ): Promise<{
    iterations: ReActIteration[];
    finalAnswer: string;
    confidence: number;
    toolsUsed: string[];
    ragContexts: string[];
    sources: AutonomousEvidenceSource[];
    citations: AutonomousCitation[];
  }> {
    console.log('🔄 [ReAct] Starting ReAct loop execution...');
    console.log(`   RAG: ${enableRAG ? '✅ enabled' : '❌ disabled'}`);

    // Validate agent is provided and has required properties
    if (!agent) {
      throw new Error('Agent is required for ReAct execution but was not provided');
    }

    if (!agent.id) {
      throw new Error('Agent ID is required for ReAct execution but was not provided');
    }

    if (!agent.name && !agent.display_name) {
      throw new Error('Agent name or display_name is required for ReAct execution');
    }

    const iterations: ReActIteration[] = [];
    let currentIteration = 0;
    let overallConfidence = 0;
    const toolsUsed: string[] = [];
    this.collectedSources = [];
    const ragContexts: string[] = [];
    
    // Store enableRAG for use in action execution
    this.enableRAG = enableRAG;

    // Initialize state
    let currentPhase = executionPlan.phases[0]?.id || 'initial';
    let activeSubQuestions = subQuestions.filter(q => q.status === 'pending');

    while (currentIteration < maxIterations && overallConfidence < confidenceThreshold) {
      console.log(`🔄 [ReAct] Iteration ${currentIteration + 1}/${maxIterations}`);

      try {
        // Stream iteration start
        if (onStep) {
          onStep({
            type: 'iteration_start',
            content: `Starting iteration ${currentIteration + 1}`,
            metadata: { iteration: currentIteration }
          });
        }

        // THINK: Reason about current state
        if (onStep) {
          onStep({
            type: 'thinking_start',
            content: 'Analyzing current state and determining next steps...',
            metadata: { iteration: currentIteration, phase: 'thinking' }
          });
        }
        
        const thought = await this.think(
          goalUnderstanding,
          activeSubQuestions,
          iterations,
          currentPhase,
          agent
        );

        if (onStep) {
          onStep({
            type: 'thought',
            content: thought,
            metadata: { iteration: currentIteration, phase: 'thinking' }
          });
        }

        // ACT: Decide and execute action
        if (onStep) {
          onStep({
            type: 'action_decision_start',
            content: 'Deciding on next action...',
            metadata: { iteration: currentIteration, phase: 'deciding' }
          });
        }

        const action = await this.decideAction(
          thought,
          activeSubQuestions,
          iterations,
          agent
        );

        if (onStep) {
          onStep({
            type: 'action_decided',
            content: action,
            metadata: { iteration: currentIteration, phase: 'deciding' }
          });
        }

        if (onStep) {
          onStep({
            type: 'action_execution_start',
            content: 'Executing action...',
            metadata: { iteration: currentIteration, phase: 'executing' }
          });
        }

        const actionResult = await this.executeAction(action, agent);
        toolsUsed.push(...actionResult.toolsUsed);
        if (actionResult.ragContext) {
          ragContexts.push(actionResult.ragContext);
        }
        const iterationSources = Array.isArray(actionResult.sources) ? actionResult.sources : [];

        if (onStep) {
          onStep({
            type: 'action_executed',
            content: `Action executed. Result: ${actionResult.result.substring(0, 200)}${actionResult.result.length > 200 ? '...' : ''}`,
            metadata: {
              iteration: currentIteration,
              phase: 'executing',
              toolsUsed: actionResult.toolsUsed,
              ragContext: actionResult.ragContext ? 'Available' : 'None'
            }
          });
        }

        // OBSERVE: Process the result
        if (onStep) {
          onStep({
            type: 'observation_start',
            content: 'Processing action results...',
            metadata: { iteration: currentIteration, phase: 'observing' }
          });
        }

        const observation = await this.observe(
          actionResult,
          activeSubQuestions,
          iterations
        );

        if (onStep) {
          onStep({
            type: 'observation',
            content: observation,
            metadata: { iteration: currentIteration, phase: 'observing' }
          });
        }

        // REFLECT: Learn from the observation
        if (onStep) {
          onStep({
            type: 'reflection_start',
            content: 'Reflecting on what we learned...',
            metadata: { iteration: currentIteration, phase: 'reflecting' }
          });
        }

        const reflection = await this.reflect(
          observation,
          thought,
          action,
          activeSubQuestions,
          agent
        );

        if (onStep) {
          onStep({
            type: 'reflection',
            content: reflection,
            metadata: { iteration: currentIteration, phase: 'reflecting' }
          });
        }

        // Update sub-questions based on new information
        activeSubQuestions = await this.updateSubQuestions(
          activeSubQuestions,
          observation,
          reflection
        );

        // Assess overall progress
        overallConfidence = await this.assessProgress(
          iterations,
          activeSubQuestions,
          goalUnderstanding
        );

        // Create iteration record
        const iteration: ReActIteration = {
          iteration: currentIteration,
          thought,
          action,
          observation,
          reflection,
          confidence: overallConfidence,
          toolsUsed: actionResult.toolsUsed,
          ragContext: actionResult.ragContext,
          sources: iterationSources
        };

        iterations.push(iteration);

        console.log(`✅ [ReAct] Iteration ${currentIteration + 1} completed (confidence: ${overallConfidence.toFixed(2)})`);

        // Check if we should continue
        if (overallConfidence >= confidenceThreshold) {
          console.log('🎯 [ReAct] Confidence threshold reached, stopping loop');
          break;
        }

        currentIteration++;

      } catch (error) {
        console.error(`❌ [ReAct] Error in iteration ${currentIteration + 1}:`, error);
        
        // Create error iteration
        const errorIteration: ReActIteration = {
          iteration: currentIteration,
          thought: `Error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
          action: 'error_handling',
          observation: 'Error prevented normal execution',
          reflection: 'Need to recover from error state',
          confidence: Math.max(0, overallConfidence - 0.1),
          toolsUsed: [],
          ragContext: undefined
        };

        iterations.push(errorIteration);
        currentIteration++;
      }
    }

    const normalizedSources = this.getNormalizedSources();
    const citations = this.buildCitationsFromSources(normalizedSources);

    // Generate final answer
    const finalAnswer = await this.synthesizeFinalAnswer(
      iterations,
      activeSubQuestions,
      goalUnderstanding,
      agent,
      normalizedSources
    );

    console.log(`✅ [ReAct] Loop completed after ${iterations.length} iterations`);

    return {
      iterations,
      finalAnswer,
      confidence: overallConfidence,
      toolsUsed: [...new Set(toolsUsed)], // Remove duplicates
      ragContexts,
      sources: normalizedSources,
      citations
    };
  }

  /**
   * THINK: Reason about current state and what to do next
   */
  private async think(
    goalUnderstanding: GoalUnderstanding,
    activeSubQuestions: CoTSubQuestion[],
    previousIterations: ReActIteration[],
    currentPhase: string,
    agent: Agent
  ): Promise<string> {
    console.log('🧠 [ReAct] Thinking phase...');

    const systemPrompt = `
You are an expert at reasoning about complex problems using structured thinking.

Current Context:
- Goal: ${goalUnderstanding.translatedGoal}
- Phase: ${currentPhase}
- Active Questions: ${activeSubQuestions.length}
- Previous Iterations: ${previousIterations.length}

Agent Profile:
- Name: ${agent.name || agent.display_name || 'Unknown Agent'}
- Specialties: ${agent.specialties?.join(', ') || 'General'}
- Capabilities: ${agent.capabilities?.join(', ') || 'General'}

Think step by step about:
1. What has been accomplished so far?
2. What gaps remain in our understanding?
3. What should be the next priority?
4. What approach would be most effective?

Provide clear, structured reasoning about the current state and next steps.
`;

    const recentIterations = previousIterations.slice(-3); // Last 3 iterations for context
    const iterationContext = recentIterations.map(iter => 
      `Iteration ${iter.iteration}: ${iter.thought} → ${iter.action} → ${iter.observation}`
    ).join('\n');

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`
Recent Iterations:
${iterationContext || 'No previous iterations'}

Active Sub-Questions:
${activeSubQuestions.map(q => `- ${q.question} (${q.priority}, ${q.status})`).join('\n')}

What should we focus on next?
`)
    ];

    try {
      const response = await this.llm.invoke(messages);
      const thought = response.content as string;
      
      console.log('✅ [ReAct] Thinking completed');
      return thought;
    } catch (error) {
      console.error('❌ [ReAct] Thinking failed:', error);
      return `Error in thinking phase: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * ACT: Decide what action to take based on thinking
   */
  private async decideAction(
    thought: string,
    activeSubQuestions: CoTSubQuestion[],
    previousIterations: ReActIteration[],
    agent: Agent
  ): Promise<string> {
    console.log('🎯 [ReAct] Deciding action...');

    const systemPrompt = `
You are an expert at deciding the best action to take based on reasoning.

Available Actions:
1. "search_knowledge" - Search for information using RAG
2. "use_tool" - Execute a specific tool
3. "analyze_data" - Analyze existing information
4. "synthesize" - Combine information from multiple sources
5. "validate_answer" - Check if a question has been answered
6. "move_to_next_phase" - Progress to next execution phase

CRITICAL: You MUST respond in this EXACT format:
ACTION: [action_type] | PARAMETERS: [json_parameters] | REASONING: [why this action]

Examples:
ACTION: search_knowledge | PARAMETERS: {"query": "clinical trial requirements"} | REASONING: Need regulatory information
ACTION: analyze_data | PARAMETERS: {"data": "market research"} | REASONING: Analyze market data for strategy
`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`
Thinking: ${thought}

Active Sub-Questions:
${activeSubQuestions.map(q => `- ${q.question} (${q.priority})`).join('\n')}

Agent Capabilities: ${agent.capabilities?.join(', ') || 'General'}
Agent Tools: ${agent.tools?.join(', ') || 'None'}

What action should we take next?
`)
    ];

    try {
      const response = await this.llm.invoke(messages);
      const action = response.content as string;
      
      console.log('✅ [ReAct] Action decided');
      return action;
    } catch (error) {
      console.error('❌ [ReAct] Action decision failed:', error);
      return `ACTION: error_handling | PARAMETERS: {} | REASONING: Error in action decision`;
    }
  }

  /**
   * Execute the decided action
   */
  private async executeAction(
    action: string,
    agent: Agent
  ): Promise<{
    result: string;
    toolsUsed: string[];
    ragContext?: string;
    sources?: AutonomousEvidenceSource[];
  }> {
    console.log('⚡ [ReAct] Executing action...');

    try {
      // Parse action with more flexible regex
      let actionMatch = action.match(/ACTION:\s*(\w+)\s*\|\s*PARAMETERS:\s*(.+?)\s*\|\s*REASONING:\s*(.+)/);
      
      // If strict format fails, try to extract action type from the text
      if (!actionMatch) {
        const actionTypeMatch = action.match(/(?:ACTION|action):\s*(\w+)/i);
        if (actionTypeMatch) {
          const actionType = actionTypeMatch[1].toLowerCase();
          // Create a default action structure
          actionMatch = [action, actionType, '{}', action];
        }
      }
      
      if (!actionMatch) {
        // If no action format found, treat as a general reasoning action
        console.log('⚠️ [ReAct] No structured action found, treating as general reasoning');
        return {
          result: `General reasoning: ${action}`,
          toolsUsed: [],
          ragContext: undefined
        };
      }

      const [, actionType, parametersStr, reasoning] = actionMatch;
      let parameters: any = {};
      
      try {
        parameters = JSON.parse(parametersStr);
      } catch (parseError) {
        console.log('⚠️ [ReAct] Could not parse parameters, using empty object');
        parameters = {};
      }

      let result: string;
      let toolsUsed: string[] = [];
      let ragContext: string | undefined;
      let evidenceSources: AutonomousEvidenceSource[] = [];

      switch (actionType) {
        case 'search_knowledge':
          const ragResult = await this.executeRAGSearch(parameters.query, agent, this.enableRAG);
          result = ragResult.content;
          ragContext = ragResult.context;
          toolsUsed.push('rag_search');
          evidenceSources = ragResult.sources;
          break;

        case 'use_tool':
          const toolResult = await this.executeTool(parameters.tool, parameters.input);
          result = toolResult.output;
          toolsUsed.push(parameters.tool);
          break;

        case 'analyze_data':
          result = await this.analyzeData(parameters.data, agent);
          toolsUsed.push('data_analysis');
          break;

        case 'synthesize':
          result = await this.synthesizeInformation(parameters.sources, agent);
          toolsUsed.push('synthesis');
          break;

        case 'validate_answer':
          result = await this.validateAnswer(parameters.question, parameters.answer);
          toolsUsed.push('validation');
          break;

        default:
          result = `Unknown action type: ${actionType}`;
      }

      console.log(`✅ [ReAct] Action executed: ${actionType}`);
      return { result, toolsUsed, ragContext, sources: evidenceSources };

    } catch (error) {
      console.error('❌ [ReAct] Action execution failed:', error);
      return {
        result: `Action execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        toolsUsed: [],
        ragContext: undefined,
        sources: []
      };
    }
  }

  /**
   * OBSERVE: Process the result of the action
   */
  private async observe(
    actionResult: { result: string; toolsUsed: string[]; ragContext?: string },
    activeSubQuestions: CoTSubQuestion[],
    previousIterations: ReActIteration[]
  ): Promise<string> {
    console.log('👁️ [ReAct] Observing results...');

    const systemPrompt = `
You are an expert at observing and interpreting the results of actions.

Analyze the action result and provide a clear observation about:
1. What information was obtained?
2. How does this relate to the active sub-questions?
3. What new insights emerged?
4. What questions remain unanswered?

Be specific and objective in your observation.
`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`
Action Result: ${actionResult.result}
Tools Used: ${actionResult.toolsUsed.join(', ')}
${actionResult.ragContext ? `RAG Context: ${actionResult.ragContext}` : ''}

Active Sub-Questions:
${activeSubQuestions.map(q => `- ${q.question}`).join('\n')}

What do you observe from this result?
`)
    ];

    try {
      const response = await this.llm.invoke(messages);
      const observation = response.content as string;
      
      console.log('✅ [ReAct] Observation completed');
      return observation;
    } catch (error) {
      console.error('❌ [ReAct] Observation failed:', error);
      return `Observation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * REFLECT: Learn from the observation
   */
  private async reflect(
    observation: string,
    thought: string,
    action: string,
    activeSubQuestions: CoTSubQuestion[],
    agent: Agent
  ): Promise<string> {
    console.log('🤔 [ReAct] Reflecting on results...');

    const systemPrompt = `
You are an expert at reflecting on actions and learning from results.

Based on the observation, reflect on:
1. What was learned from this iteration?
2. How does this advance our understanding?
3. What worked well and what didn't?
4. What should we do differently next time?
5. How confident are we in our progress?

Provide thoughtful reflection that will guide future iterations.
`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`
Previous Thought: ${thought}
Action Taken: ${action}
Observation: ${observation}

Active Sub-Questions:
${activeSubQuestions.map(q => `- ${q.question} (${q.status})`).join('\n')}

What have we learned from this iteration?
`)
    ];

    try {
      const response = await this.llm.invoke(messages);
      const reflection = response.content as string;
      
      console.log('✅ [ReAct] Reflection completed');
      return reflection;
    } catch (error) {
      console.error('❌ [ReAct] Reflection failed:', error);
      return `Reflection failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Update sub-questions based on new information
   */
  private async updateSubQuestions(
    subQuestions: CoTSubQuestion[],
    observation: string,
    reflection: string
  ): Promise<CoTSubQuestion[]> {
    console.log('📝 [ReAct] Updating sub-questions...');

    // Simple heuristic-based update for now
    // In a more sophisticated implementation, this would use LLM to determine which questions are answered
    const updatedQuestions = subQuestions.map(question => {
      // Check if the observation contains information relevant to this question
      const questionKeywords = question.question.toLowerCase().split(' ');
      const observationLower = observation.toLowerCase();
      
      const relevanceScore = questionKeywords.filter(keyword => 
        observationLower.includes(keyword)
      ).length / questionKeywords.length;

      if (relevanceScore > 0.3) {
        return {
          ...question,
          status: 'answered' as const,
          answer: observation,
          confidence: Math.min(0.9, relevanceScore + 0.3)
        };
      }

      return question;
    });

    console.log(`✅ [ReAct] Updated ${updatedQuestions.filter(q => q.status === 'answered').length} sub-questions`);
    return updatedQuestions;
  }

  /**
   * Assess overall progress and confidence
   */
  private async assessProgress(
    iterations: ReActIteration[],
    subQuestions: CoTSubQuestion[],
    goalUnderstanding: GoalUnderstanding
  ): Promise<number> {
    console.log('📊 [ReAct] Assessing progress...');

    // Calculate confidence based on multiple factors
    const answeredQuestions = subQuestions.filter(q => q.status === 'answered');
    const questionProgress = answeredQuestions.length / subQuestions.length;

    const avgIterationConfidence = iterations.length > 0 
      ? iterations.reduce((sum, iter) => sum + iter.confidence, 0) / iterations.length
      : 0;

    const iterationProgress = Math.min(1, iterations.length / goalUnderstanding.estimatedSteps);

    // Weighted confidence calculation
    const overallConfidence = (
      questionProgress * 0.4 +
      avgIterationConfidence * 0.3 +
      iterationProgress * 0.3
    );

    console.log(`✅ [ReAct] Progress assessed: ${overallConfidence.toFixed(2)}`);
    return Math.min(1, overallConfidence);
  }

  /**
   * Synthesize final answer from all iterations
   */
  private async synthesizeFinalAnswer(
    iterations: ReActIteration[],
    subQuestions: CoTSubQuestion[],
    goalUnderstanding: GoalUnderstanding,
    agent: Agent,
    sources: AutonomousEvidenceSource[]
  ): Promise<string> {
    console.log('📝 [ReAct] Synthesizing final answer...');

    const systemPrompt = `
You are an expert at synthesizing complex information into a comprehensive final answer.

Given all the iterations and sub-questions, create a final answer that:
1. Directly addresses the original goal
2. Incorporates all relevant findings
3. Provides clear, actionable insights
4. Maintains the agent's expertise perspective
5. Is well-structured and easy to understand

Be comprehensive but concise, and ensure the answer is valuable to the user.

When referencing factual statements, cite supporting evidence using square brackets with the source number (e.g., [1]).
Only use numbers that correspond to the provided source list.
`;

    const iterationSummary = iterations.map(iter => 
      `Iteration ${iter.iteration}: ${iter.thought} → ${iter.action} → ${iter.observation} → ${iter.reflection}`
    ).join('\n');

    const answeredQuestions = subQuestions.filter(q => q.status === 'answered');
    const sourcesSection = sources.length > 0
      ? `Available Sources:\n${sources.map((source, idx) => {
          const base = `[${idx + 1}] ${source.title || 'Untitled source'}`;
          const urlPart = source.url ? ` (${source.url})` : '';
          return `${base}${urlPart}`;
        }).join('\n')}`
      : 'No external sources were collected. Rely on internal reasoning while noting the lack of evidence.';

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`
Original Goal: ${goalUnderstanding.translatedGoal}
Agent: ${agent.name || agent.display_name || 'Unknown Agent'} (${agent.specialties?.join(', ') || 'General'})

Iterations Summary:
${iterationSummary}

Answered Sub-Questions:
${answeredQuestions.map(q => `- ${q.question}: ${q.answer}`).join('\n')}

${sourcesSection}

Create a comprehensive final answer.
`)
    ];

    try {
      const response = await this.llm.invoke(messages);
      const finalAnswer = response.content as string;
      
      console.log('✅ [ReAct] Final answer synthesized');
      return finalAnswer;
    } catch (error) {
      console.error('❌ [ReAct] Final answer synthesis failed:', error);
      return `Final answer synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // ============================================================================
  // ACTION EXECUTION HELPERS
  // ============================================================================

  private async executeRAGSearch(
    query: string,
    agent: Agent,
    enableRAG: boolean = true
  ): Promise<{ content: string; context: string; sources: AutonomousEvidenceSource[] }> {
    if (!enableRAG) {
      console.log('⚠️  [ReAct] RAG is disabled - skipping knowledge search');
      return {
        content: 'RAG is disabled. Using only agent knowledge base.',
        context: '',
        sources: []
      };
    }

    try {
      // Use real unifiedRAGService with proper parameters
      const ragResult = await unifiedRAGService.query({
        text: query,
        agentId: agent.id,
        domain: agent.knowledge_domain,
        maxResults: 5,
        similarityThreshold: 0.7,
        strategy: 'agent-optimized'
      });

      const sources: AutonomousEvidenceSource[] = Array.isArray(ragResult.sources)
        ? ragResult.sources.map((doc: any, idx: number) => {
            const metadata = doc.metadata || {};
            const similarity =
              typeof metadata.similarity === 'number'
                ? metadata.similarity
                : typeof metadata.score === 'number'
                  ? metadata.score
                  : undefined;
            return {
              id:
                metadata.id ||
                doc.id ||
                metadata.document_id ||
                metadata.source_id ||
                `rag-source-${idx + 1}`,
              title:
                metadata.source_title ||
                metadata.title ||
                doc.title ||
                `Source ${idx + 1}`,
              url: metadata.url || metadata.link || undefined,
              excerpt:
                doc.pageContent ||
                metadata.excerpt ||
                metadata.summary ||
                undefined,
              similarity,
              domain: metadata.domain,
              organization: metadata.organization,
              provider: metadata.provider,
              sourceType: metadata.source_type || metadata.type,
              lastUpdated: metadata.updated_at || metadata.last_updated || metadata.published_at,
            };
          })
        : [];

      if (sources.length > 0) {
        this.addEvidenceSources(sources);
      }

      return {
        content: ragResult.answer || 'No relevant context found',
        context: Array.isArray(ragResult.sources)
          ? ragResult.sources
              .map((s: any) => s.pageContent || s.content || '')
              .filter((segment: string) => segment && segment.trim().length > 0)
              .join('\n')
          : '',
        sources
      };
    } catch (error) {
      console.error('RAG search failed:', error);
      return {
        content: `RAG search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: '',
        sources: []
      };
    }
  }

  private addEvidenceSources(sources: AutonomousEvidenceSource[]): void {
    for (const source of sources) {
      if (!source) {
        continue;
      }
      const identifierCandidate =
        typeof source.url === 'string' && source.url.trim().length > 0
          ? source.url.trim().toLowerCase()
          : source.id && source.id.trim().length > 0
            ? source.id.trim().toLowerCase()
            : source.title && source.title.trim().length > 0
              ? source.title.trim().toLowerCase()
              : undefined;

      const alreadyExists = identifierCandidate
        ? this.collectedSources.some((existing) => {
            const existingKey =
              (existing.url && existing.url.toLowerCase()) ||
              (existing.id && existing.id.toLowerCase()) ||
              (existing.title && existing.title.toLowerCase());
            return existingKey === identifierCandidate;
          })
        : false;

      if (alreadyExists) {
        continue;
      }

      const normalizedId =
        source.id && source.id.trim().length > 0
          ? source.id
          : identifierCandidate && identifierCandidate.length > 0
            ? identifierCandidate
            : `source-${this.collectedSources.length + 1}`;

      this.collectedSources.push({
        ...source,
        id: normalizedId,
      });
    }
  }

  private getNormalizedSources(): AutonomousEvidenceSource[] {
    const unique = new Map<string, AutonomousEvidenceSource>();

    this.collectedSources.forEach((source) => {
      if (!source) {
        return;
      }

      const candidateKey =
        (typeof source.id === 'string' && source.id.trim().length > 0 && source.id.trim().toLowerCase()) ||
        (typeof source.url === 'string' && source.url.trim().length > 0 && source.url.trim().toLowerCase()) ||
        (typeof source.title === 'string' && source.title.trim().length > 0 && source.title.trim().toLowerCase());

      const key = candidateKey ?? `source-${unique.size + 1}`;

      if (!unique.has(key)) {
        const normalizedId =
          source.id && source.id.trim().length > 0
            ? source.id
            : candidateKey && candidateKey.length > 0
              ? candidateKey
              : `source-${unique.size + 1}`;

        unique.set(key, {
          ...source,
          id: normalizedId,
        });
      }
    });

    return Array.from(unique.values()).map((source, idx) => ({
      ...source,
      id: source.id && source.id.trim().length > 0 ? source.id : `source-${idx + 1}`,
    }));
  }

  private buildCitationsFromSources(sources: AutonomousEvidenceSource[]): AutonomousCitation[] {
    return sources.map((source, index) => ({
      number: index + 1,
      sourceId: source.id,
      sources: [source],
    }));
  }

  private async executeTool(toolName: string, input: any): Promise<ToolExecutionResult> {
    const tool = this.availableTools.get(toolName);
    if (!tool) {
      return {
        toolName,
        input,
        output: `Tool ${toolName} not available`,
        success: false,
        error: 'Tool not found',
        executionTime: 0
      };
    }

    try {
      const startTime = Date.now();
      const result = await tool.execute(input);
      const executionTime = Date.now() - startTime;
      
      return {
        ...result,
        executionTime
      };
    } catch (error) {
      return {
        toolName,
        input,
        output: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0
      };
    }
  }

  private async analyzeData(data: any, agent: Agent): Promise<string> {
    console.log('🔍 [ReAct] Analyzing data...');
    
    const systemPrompt = `
You are ${agent.name || agent.display_name || 'an expert'}, an expert in ${agent.specialties?.join(', ') || 'data analysis'}.

Analyze the provided data and provide insights:
1. What patterns do you see?
2. What are the key findings?
3. What recommendations can you make?
4. What questions does this raise?

Be specific and actionable in your analysis.
`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`Please analyze this data:\n\n${JSON.stringify(data, null, 2)}`)
    ];

    try {
      const response = await this.llm.invoke(messages);
      return response.content as string;
    } catch (error) {
      console.error('Data analysis failed:', error);
      return `Data analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async synthesizeInformation(sources: any[], agent: Agent): Promise<string> {
    console.log('📝 [ReAct] Synthesizing information...');
    
    // Limit sources to prevent context length issues
    const maxSources = 5;
    const limitedSources = sources.slice(0, maxSources);
    
    if (sources.length > maxSources) {
      console.log(`⚠️ [ReAct] Limiting sources from ${sources.length} to ${maxSources} to prevent context overflow`);
    }
    
    const systemPrompt = `
You are ${agent.name || agent.display_name || 'an expert'}, an expert in ${agent.specialties?.join(', ') || 'information synthesis'}.

Synthesize information from multiple sources into a coherent, comprehensive response:
1. Identify common themes and patterns
2. Resolve any contradictions between sources
3. Provide a unified perspective
4. Highlight key insights and recommendations

Be thorough but concise in your synthesis. Focus on the most important information.
`;

    // Truncate source content to prevent context overflow
    const sourceTexts = limitedSources.map((source, index) => {
      let content = typeof source === 'string' ? source : JSON.stringify(source, null, 2);
      // Limit each source to 1000 characters
      if (content.length > 1000) {
        content = content.substring(0, 1000) + '... [truncated]';
      }
      return `Source ${index + 1}:\n${content}`;
    }).join('\n\n');

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`Please synthesize information from these sources:\n\n${sourceTexts}`)
    ];

    try {
      const response = await this.llm.invoke(messages);
      return response.content as string;
    } catch (error) {
      console.error('Information synthesis failed:', error);
      return `Information synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async validateAnswer(question: string, answer: string): Promise<string> {
    console.log('✅ [ReAct] Validating answer...');
    
    const systemPrompt = `
You are an expert at validating answers to complex questions.

Evaluate the answer against the question:
1. Does the answer directly address the question?
2. Is the answer complete and comprehensive?
3. Is the answer accurate and well-reasoned?
4. What is the confidence level (0-1)?

Provide a structured validation with specific feedback.
`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`
Question: ${question}

Answer: ${answer}

Please validate this answer.
`)
    ];

    try {
      const response = await this.llm.invoke(messages);
      return response.content as string;
    } catch (error) {
      console.error('Answer validation failed:', error);
      return `Answer validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // ============================================================================
  // TOOL MANAGEMENT
  // ============================================================================

  private initializeTools(): void {
    // Initialize available tools
    // This would be expanded with actual tool implementations
    console.log('🔧 [ReAct] Initializing tools...');
  }

  public registerTool(tool: AutonomousTool): void {
    this.availableTools.set(tool.name, tool);
    console.log(`🔧 [ReAct] Registered tool: ${tool.name}`);
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const reActEngine = new ReActEngine();
