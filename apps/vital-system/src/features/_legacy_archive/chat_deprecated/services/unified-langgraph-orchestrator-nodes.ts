/**
 * @fileoverview Unified LangGraph Orchestrator - Complete Node Implementations
 * @module features/chat/services
 * @description Production-ready node implementations for all workflow stages
 *
 * This file contains the remaining node implementations for:
 * - retrieveContext (Node 4): Pinecone + Supabase hybrid RAG
 * - executeSingleAgent (Node 5): Single expert execution
 * - executeMultiAgent (Node 6): Multi-expert parallel execution
 * - executePanel (Node 7): Panel discussion with deliberation
 * - synthesizeResponse (Node 8): Intelligent response synthesis
 *
 * Architecture:
 * - Pinecone: Vector embeddings and semantic search
 * - Supabase: Metadata, relations, and GraphRAG
 * - Hybrid approach for maximum accuracy and relevance
 *
 * @author VITAL AI Platform Team
 * @version 2.0.0
 * @license Proprietary
 */

import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import type { UnifiedState, AgentResponse, MODEL_CONFIG } from './unified-langgraph-orchestrator';
import { unifiedRAGService } from '../../../lib/services/rag/unified-rag-service';
import { pineconeVectorService } from '../../../lib/services/vectorstore/pinecone-vector-service';

/**
 * Node 4: Retrieve Context
 *
 * Uses Pinecone + Supabase GraphRAG hybrid approach:
 * 1. Pinecone for vector similarity search
 * 2. Supabase for metadata enrichment and relations
 * 3. Agent-optimized retrieval with domain boosting
 *
 * @param state Current workflow state
 * @returns Updated state with retrieved context
 */
export async function retrieveContext(state: UnifiedState): Promise<Partial<UnifiedState>> {
  const startTime = Date.now();

  try {
    // Skip if no agents selected
    if (!state.selectedAgents || state.selectedAgents.length === 0) {
      return {
        retrievedContext: [],
        sources: [],
        logs: ['⚠️  No agents selected, skipping context retrieval'],
        performance: { contextRetrieval: Date.now() - startTime }
      };
    }

    // Strategy: Use agent-optimized search for each selected agent
    const contextPromises = state.selectedAgents.map(async (agent) => {
      try {
        // Use unified RAG service with Pinecone + Supabase
        const result = await unifiedRAGService.query({
          text: state.query,
          agentId: agent.id,
          userId: state.userId,
          sessionId: state.sessionId,
          domain: state.domains[0], // Primary domain
          maxResults: 5, // 5 sources per agent
          similarityThreshold: 0.75,
          strategy: 'agent-optimized', // Uses Pinecone with agent domain boosting
        });

        return result.sources;
      } catch (error) {
        console.error(`❌ Context retrieval failed for agent ${agent.name}:`, error);
        return [];
      }
    });

    const contextPerAgent = await Promise.all(contextPromises);

    // Flatten and deduplicate sources
    const allSources = contextPerAgent.flat();
    const uniqueSources = Array.from(
      new Map(allSources.map(doc => [doc.metadata.id, doc])).values()
    );

    // Extract citations
    const citations = uniqueSources
      .map(doc => doc.metadata.title || doc.metadata.source || 'Unknown source')
      .filter((v, i, a) => a.indexOf(v) === i); // Unique

    const latency = Date.now() - startTime;

    return {
      retrievedContext: uniqueSources,
      sources: uniqueSources.map(doc => ({
        id: doc.metadata.id,
        title: doc.metadata.title,
        content: doc.pageContent,
        similarity: doc.metadata.similarity,
        domain: doc.metadata.domain
      })),
      citations,
      logs: [
        `✅ Context retrieval completed (Pinecone + Supabase)`,
        `   Sources per agent: ${contextPerAgent.map(c => c.length).join(', ')}`,
        `   Total sources: ${allSources.length}`,
        `   Unique sources: ${uniqueSources.length}`,
        `   Latency: ${latency}ms`
      ],
      performance: { contextRetrieval: latency }
    };

  } catch (error) {
    console.error('❌ Context retrieval failed:', error);
    return {
      retrievedContext: [],
      sources: [],
      logs: ['⚠️  Context retrieval failed, proceeding without RAG'],
      performance: { contextRetrieval: Date.now() - startTime }
    };
  }
}

/**
 * Node 5: Execute Single Agent
 *
 * Executes a single expert with streaming support
 * Follows OpenAI best practices for model configuration
 *
 * @param state Current workflow state
 * @returns Updated state with agent response
 */
export async function executeSingleAgent(state: UnifiedState): Promise<Partial<UnifiedState>> {
  const startTime = Date.now();

  try {
    const agent = state.selectedAgents[0];
    if (!agent) {
      throw new Error('No agent available for execution');
    }

    // Get model config based on agent tier
    const modelConfig = getModelConfig(agent.tier);

    // Initialize LLM
    const llm = new ChatOpenAI({
      modelName: modelConfig.model,
      temperature: modelConfig.temperature,
      maxTokens: modelConfig.maxTokens,
      openAIApiKey: process.env.OPENAI_API_KEY,
      streaming: false, // Set to true for streaming in production
    });

    // Build rich context from retrieved sources with RAG metadata
    const context = state.retrievedContext.length > 0
      ? state.retrievedContext
          .map((doc, i) => {
            const title = doc.metadata?.title || 'Unknown Source';
            const domain = doc.metadata?.domain || '';
            const similarity = doc.metadata?.similarity ? ` (${(doc.metadata.similarity * 100).toFixed(0)}% relevant)` : '';
            return `[Source ${i + 1}] ${title}${domain ? ` [${domain}]` : ''}${similarity}:\n${doc.pageContent}`;
          })
          .join('\n\n---\n\n')
      : 'No additional context available. Please use your expertise to provide the best answer.';

    // Build enhanced system prompt with RAG guidance
    const systemPrompt = buildEnhancedSystemPrompt(agent, context, state);

    // Execute LLM call
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      ...state.chatHistory,
      new HumanMessage(state.query)
    ]);

    // Calculate token usage
    const tokenUsage = estimateTokenUsage(
      systemPrompt + state.query,
      response.content.toString(),
      modelConfig.model
    );

    const latency = Date.now() - startTime;

    // Create agent response
    const agentResponse: AgentResponse = {
      agentId: agent.id,
      agentName: agent.name,
      content: response.content.toString(),
      confidence: 0.9, // Would use structured output for real confidence
      reasoning: `Expert analysis from ${agent.name}`,
      sources: state.retrievedContext,
      citations: state.citations,
      tokenUsage: tokenUsage,
      latency,
      timestamp: new Date()
    };

    // Update agent responses map
    const responses = new Map(state.agentResponses);
    responses.set(agent.id, agentResponse);

    return {
      agentResponses: responses,
      logs: [
        `✅ Single agent execution completed`,
        `   Agent: ${agent.name}`,
        `   Model: ${modelConfig.model}`,
        `   Tokens: ${tokenUsage.total}`,
        `   Latency: ${latency}ms`
      ],
      tokenUsage,
      performance: { execution: latency }
    };

  } catch (error) {
    console.error('❌ Single agent execution failed:', error);
    return {
      logs: ['⚠️  Single agent execution failed'],
      performance: { execution: Date.now() - startTime },
      error: error as Error
    };
  }
}

/**
 * Node 6: Execute Multi-Agent (Parallel)
 *
 * Executes multiple agents in parallel with consensus building
 * Optimized for speed with Promise.all
 *
 * @param state Current workflow state
 * @returns Updated state with all agent responses
 */
export async function executeMultiAgent(state: UnifiedState): Promise<Partial<UnifiedState>> {
  const startTime = Date.now();

  try {
    if (!state.selectedAgents || state.selectedAgents.length === 0) {
      throw new Error('No agents available for execution');
    }

    // Execute all agents in parallel
    const executionPromises = state.selectedAgents.map(async (agent) => {
      try {
        const modelConfig = getModelConfig(agent.tier);

        const llm = new ChatOpenAI({
          modelName: modelConfig.model,
          temperature: modelConfig.temperature,
          maxTokens: modelConfig.maxTokens,
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

        // Filter context relevant to this agent's domain
        const relevantContext = state.retrievedContext
          .filter(doc =>
            !doc.metadata.domain ||
            doc.metadata.domain === agent.metadata?.primary_domain ||
            agent.capabilities?.includes(doc.metadata.domain)
          )
          .slice(0, 5); // Top 5 per agent

        const context = relevantContext.length > 0
          ? relevantContext.map((doc, i) => `[Source ${i + 1}]: ${doc.pageContent}`).join('\n\n')
          : 'No additional context available.';

        const systemPrompt = buildSystemPrompt(agent, context);

        const response = await llm.invoke([
          new SystemMessage(systemPrompt),
          ...state.chatHistory,
          new HumanMessage(state.query)
        ]);

        const tokenUsage = estimateTokenUsage(
          systemPrompt + state.query,
          response.content.toString(),
          modelConfig.model
        );

        const agentResponse: AgentResponse = {
          agentId: agent.id,
          agentName: agent.name,
          content: response.content.toString(),
          confidence: 0.85,
          reasoning: `Expert perspective from ${agent.name}`,
          sources: relevantContext,
          citations: relevantContext.map(doc => doc.metadata.title || 'Unknown'),
          tokenUsage,
          latency: Date.now() - startTime,
          timestamp: new Date()
        };

        return { agentId: agent.id, response: agentResponse, tokenUsage };

      } catch (error) {
        console.error(`❌ Agent ${agent.name} execution failed:`, error);
        return null;
      }
    });

    const results = (await Promise.all(executionPromises)).filter(r => r !== null);

    // Build responses map
    const responses = new Map(state.agentResponses);
    results.forEach(result => {
      if (result) responses.set(result.agentId, result.response);
    });

    // Calculate total token usage
    const totalTokenUsage = results.reduce(
      (acc, result) => ({
        prompt: acc.prompt + (result?.tokenUsage.prompt || 0),
        completion: acc.completion + (result?.tokenUsage.completion || 0),
        total: acc.total + (result?.tokenUsage.total || 0),
        estimatedCost: acc.estimatedCost + (result?.tokenUsage.estimatedCost || 0)
      }),
      { prompt: 0, completion: 0, total: 0, estimatedCost: 0 }
    );

    // Check for consensus
    const consensusReached = await checkConsensus(Array.from(responses.values()));

    const latency = Date.now() - startTime;

    return {
      agentResponses: responses,
      consensusReached,
      logs: [
        `✅ Multi-agent execution completed`,
        `   Agents: ${results.length}/${state.selectedAgents.length} succeeded`,
        `   Consensus: ${consensusReached ? 'Yes' : 'No'}`,
        `   Total tokens: ${totalTokenUsage.total}`,
        `   Latency: ${latency}ms`
      ],
      tokenUsage: totalTokenUsage,
      performance: { execution: latency }
    };

  } catch (error) {
    console.error('❌ Multi-agent execution failed:', error);
    return {
      logs: ['⚠️  Multi-agent execution failed'],
      performance: { execution: Date.now() - startTime },
      error: error as Error
    };
  }
}

/**
 * Node 7: Execute Panel (Deliberation)
 *
 * Implements panel discussion with multiple deliberation rounds
 * Agents build on each other's responses
 *
 * @param state Current workflow state
 * @returns Updated state with panel discussion results
 */
export async function executePanel(state: UnifiedState): Promise<Partial<UnifiedState>> {
  const startTime = Date.now();

  try {
    // First round: All agents respond independently (parallel)
    const firstRoundResult = await executeMultiAgent(state);

    // Check consensus after first round
    if (firstRoundResult.consensusReached) {
      return {
        ...firstRoundResult,
        logs: [
          ...(firstRoundResult.logs || []),
          '✅ Consensus reached in first round, no deliberation needed'
        ]
      };
    }

    // Second round: Deliberation with previous responses as context
    const panelContext = Array.from((firstRoundResult.agentResponses as Map<string, AgentResponse>).values())
      .map(resp => `${resp.agentName}: ${resp.content}`)
      .join('\n\n---\n\n');

    // Re-execute with panel context
    const deliberationState: UnifiedState = {
      ...state,
      chatHistory: [
        ...state.chatHistory,
        new SystemMessage(`Previous expert opinions:\n\n${panelContext}\n\nPlease consider these perspectives and provide your refined analysis.`)
      ]
    };

    const secondRoundResult = await executeMultiAgent(deliberationState);

    const latency = Date.now() - startTime;

    return {
      ...secondRoundResult,
      logs: [
        `✅ Panel execution completed with deliberation`,
        `   Rounds: 2`,
        `   Final consensus: ${secondRoundResult.consensusReached ? 'Yes' : 'No'}`,
        `   Total latency: ${latency}ms`
      ],
      performance: { execution: latency }
    };

  } catch (error) {
    console.error('❌ Panel execution failed:', error);
    return {
      logs: ['⚠️  Panel execution failed'],
      performance: { execution: Date.now() - startTime },
      error: error as Error
    };
  }
}

/**
 * Node 8: Synthesize Response
 *
 * Intelligently combines agent responses into final answer
 * Uses LLM to merge perspectives and resolve conflicts
 *
 * @param state Current workflow state
 * @returns Updated state with final synthesized response
 */
export async function synthesizeResponse(state: UnifiedState): Promise<Partial<UnifiedState>> {
  const startTime = Date.now();

  try {
    const responses = Array.from(state.agentResponses.values());

    if (responses.length === 0) {
      return {
        finalResponse: 'I apologize, but I was unable to generate a response. Please try again.',
        logs: ['⚠️  No agent responses to synthesize'],
        performance: { synthesis: Date.now() - startTime }
      };
    }

    // Single agent: Return response directly
    if (responses.length === 1) {
      return {
        finalResponse: responses[0].content,
        logs: [
          `✅ Response synthesis completed (single agent)`,
          `   Agent: ${responses[0].agentName}`,
          `   Latency: ${Date.now() - startTime}ms`
        ],
        performance: { synthesis: Date.now() - startTime }
      };
    }

    // Multi-agent: Use LLM to synthesize
    const llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.3,
      maxTokens: 2048,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const agentPerspectives = responses
      .map((resp, i) => `**Expert ${i + 1} (${resp.agentName})**:\n${resp.content}`)
      .join('\n\n');

    const synthesisPrompt = `You are a synthesis expert. Multiple domain experts have provided their perspectives on a question.

Your task:
1. Integrate all perspectives into a coherent, comprehensive answer
2. Highlight areas of consensus
3. Note any divergent opinions with rationale
4. Provide a balanced, nuanced response
5. Cite specific experts when mentioning their points

Original Question: ${state.query}

Expert Perspectives:
${agentPerspectives}

Synthesize these perspectives into a single, comprehensive response:`;

    const synthesis = await llm.invoke([new HumanMessage(synthesisPrompt)]);

    const latency = Date.now() - startTime;

    return {
      finalResponse: synthesis.content.toString(),
      metadata: {
        synthesis_method: 'llm_integration',
        num_perspectives: responses.length,
        consensus_level: state.consensusReached ? 'high' : 'moderate'
      },
      logs: [
        `✅ Response synthesis completed`,
        `   Perspectives merged: ${responses.length}`,
        `   Consensus: ${state.consensusReached ? 'Yes' : 'No'}`,
        `   Synthesis latency: ${latency}ms`
      ],
      performance: { synthesis: latency }
    };

  } catch (error) {
    console.error('❌ Response synthesis failed:', error);
    // Fallback: Concatenate responses
    const fallback = Array.from(state.agentResponses.values())
      .map(resp => `**${resp.agentName}**:\n${resp.content}`)
      .join('\n\n---\n\n');

    return {
      finalResponse: fallback || 'Unable to generate response.',
      logs: ['⚠️  Synthesis failed, using fallback concatenation'],
      performance: { synthesis: Date.now() - startTime }
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get model configuration based on agent tier
 */
function getModelConfig(tier: string | number | null): {
  model: string;
  temperature: number;
  maxTokens: number;
} {
  const tierNum = typeof tier === 'string' ? parseInt(tier) : tier;

  switch (tierNum) {
    case 1:
      return {
        model: 'gpt-4-turbo-preview',
        temperature: 0.1,
        maxTokens: 4096
      };
    case 2:
      return {
        model: 'gpt-4-turbo-preview',
        temperature: 0.3,
        maxTokens: 3072
      };
    case 3:
      return {
        model: 'gpt-3.5-turbo-0125',
        temperature: 0.7,
        maxTokens: 2048
      };
    default:
      return {
        model: 'gpt-3.5-turbo-0125',
        temperature: 0.5,
        maxTokens: 2048
      };
  }
}

/**
 * Build system prompt for agent with context (Legacy - kept for backwards compatibility)
 */
function buildSystemPrompt(agent: any, context: string): string {
  return `You are ${agent.name}, ${agent.description || 'an expert AI assistant'}.

${agent.capabilities ? `Your areas of expertise include: ${agent.capabilities.join(', ')}.` : ''}

${agent.system_prompt || 'Provide accurate, well-reasoned responses based on your expertise.'}

${context !== 'No additional context available.' ? `\n\nRelevant Context:\n${context}` : ''}

Guidelines:
- Be precise and professional
- Cite sources when using provided context
- Acknowledge uncertainty when appropriate
- Provide actionable insights
- Use domain-specific terminology correctly

Respond to the user's query:`;
}

/**
 * Build enhanced system prompt with RAG guidance
 * Includes instructions for using retrieved context effectively
 */
function buildEnhancedSystemPrompt(agent: any, context: string, state: UnifiedState): string {
  const hasContext = context !== 'No additional context available. Please use your expertise to provide the best answer.';
  const ragStrategy = state.metadata?.ragStrategy || 'hybrid';
  const numSources = state.retrievedContext?.length || 0;

  return `You are ${agent.display_name || agent.name}, ${agent.description || 'an expert AI assistant'}.

**Your Expertise:**
${agent.knowledge_domains && agent.knowledge_domains.length > 0
  ? `- Knowledge Domains: ${agent.knowledge_domains.join(', ')}`
  : ''}
${agent.capabilities && agent.capabilities.length > 0
  ? `- Capabilities: ${agent.capabilities.join(', ')}`
  : ''}
${agent.tier ? `- Expert Level: Tier ${agent.tier}` : ''}

**Your Instructions:**
${agent.system_prompt || 'Provide accurate, well-reasoned responses based on your expertise and the provided context.'}

${hasContext ? `
**Knowledge Base Context (Retrieved via ${ragStrategy} search - ${numSources} sources):**

${context}

**How to Use This Context:**
1. **Prioritize Relevance**: Focus on sources with high relevance scores
2. **Cite Sources**: Reference specific sources using [Source N] notation
3. **Synthesize**: Integrate context with your expertise, don't just quote
4. **Verify**: Cross-reference information across sources when possible
5. **Acknowledge Limitations**: If context doesn't fully answer the query, say so
6. **Be Critical**: Evaluate source quality and note any conflicts between sources
` : `
**Note**: No specific context was retrieved from the knowledge base. Rely on your training and expertise to provide the best answer.
`}

**Response Guidelines:**
- **Accuracy First**: Base your response on verifiable information
- **Cite Evidence**: Reference specific sources or your expertise
- **Be Comprehensive**: Address all aspects of the query
- **Acknowledge Uncertainty**: State when you're unsure or information is limited
- **Actionable Insights**: Provide practical, implementable advice when applicable
- **Domain Terminology**: Use appropriate technical language for your field
${state.complianceLevel && state.complianceLevel !== 'standard' ? `- **Compliance**: Ensure response meets ${state.complianceLevel.toUpperCase()} requirements` : ''}

Now, respond to the user's query with expertise and precision:`;
}

/**
 * Estimate token usage and cost
 */
function estimateTokenUsage(
  prompt: string,
  completion: string,
  model: string
): { prompt: number; completion: number; total: number; estimatedCost: number } {
  // Rough estimation: 1 token ≈ 4 characters
  const promptTokens = Math.ceil(prompt.length / 4);
  const completionTokens = Math.ceil(completion.length / 4);
  const total = promptTokens + completionTokens;

  // Pricing (per 1K tokens)
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo-0125': { input: 0.0005, output: 0.0015 }
  };

  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo-0125'];
  const cost = (promptTokens / 1000) * modelPricing.input + (completionTokens / 1000) * modelPricing.output;

  return {
    prompt: promptTokens,
    completion: completionTokens,
    total,
    estimatedCost: cost
  };
}

/**
 * Check if agents reached consensus
 * Simple implementation - can be enhanced with semantic similarity
 */
async function checkConsensus(responses: AgentResponse[]): Promise<boolean> {
  if (responses.length < 2) return true;

  // Check for high confidence across all responses
  const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;

  // Simple heuristic: consensus if average confidence > 0.8
  return avgConfidence > 0.8;
}
