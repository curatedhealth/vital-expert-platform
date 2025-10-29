/**
 * MODE 1: MANUAL INTERACTIVE
 *
 * Simple, focused handler for manual agent selection mode.
 * User selects ONE agent, optionally enables RAG/Tools, and chats.
 *
 * Features:
 * - User manually selects agent
 * - Direct LLM call (user's choice: GPT-4, Claude, etc.)
 * - Optional RAG (manual enable/disable)
 * - Optional Tools (manual enable/disable)
 * - Simple LangGraph for tool execution
 * - Streaming responses
 */

import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import { createClient } from '@supabase/supabase-js';
import { validateMode1Env } from '../../../lib/config/env-validation';
import {
  withTimeout,
  withTimeoutGenerator,
  MODE1_TIMEOUTS,
  TimeoutError,
} from '../../ask-expert/mode-1/utils/timeout-handler';
import { ToolRegistry } from '../../ask-expert/mode-1/tools/tool-registry';
import { convertRegistryToLangChainTools } from '../../ask-expert/mode-1/tools/langchain-tool-adapter';

// ============================================================================
// TYPES
// ============================================================================

export interface Mode1Config {
  agentId: string;
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  enableRAG?: boolean;
  enableTools?: boolean;
  model?: string; // Override from prompt composer
  temperature?: number;
  maxTokens?: number;
  selectedByOrchestrator?: boolean; // Track if selected by Mode 2 orchestrator
}

export interface Agent {
  id: string;
  name: string;
  system_prompt: string;
  model?: string;
  capabilities?: string[];
  tools?: string[];
  knowledge_domains?: string[]; // RAG domains for this agent (array of domain strings)
  metadata?: any;
}

// ============================================================================
// MODE 1 HANDLER CLASS
// ============================================================================

export class Mode1ManualInteractiveHandler {
  private supabase;
  private llm: any;
  private toolRegistry: ToolRegistry;

  constructor() {
    // Validate environment variables on initialization
    const env = validateMode1Env();
    
    this.supabase = createClient(env.supabaseUrl, env.supabaseServiceKey);
    
    // Initialize tool registry
    this.toolRegistry = new ToolRegistry(
      env.supabaseUrl,
      env.supabaseServiceKey,
      process.env.TAVILY_API_KEY || process.env.BRAVE_API_KEY
    );
  }

  /**
   * Main entry point for Mode 1
   */
  async execute(config: Mode1Config): Promise<AsyncGenerator<string>> {
    console.log('🎯 [Mode 1] Starting Manual Interactive mode');
    console.log(`   Agent ID: ${config.agentId}`);
    console.log(`   RAG: ${config.enableRAG ? 'ON' : 'OFF'}`);
    console.log(`   Tools: ${config.enableTools ? 'ON' : 'OFF'}`);
    console.log(`   Model: ${config.model || 'default'}`);

    // Step 1: Get agent from database
    const agent = await this.getAgent(config.agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${config.agentId}`);
    }

    // Log agent's RAG domains
    if (agent.knowledge_domains && agent.knowledge_domains.length > 0) {
      console.log(`   Agent RAG Domains: ${agent.knowledge_domains.join(', ')}`);
    }

    // Step 2: Initialize LLM (use model from config or agent default)
    const modelToUse = config.model || agent.model || 'gpt-4-turbo-preview';
    this.llm = this.initializeLLM(modelToUse, config.temperature, config.maxTokens);

    // Step 3: Build conversation context
    const messages = this.buildMessages(agent, config.message, config.conversationHistory);

    // Step 4: Execute based on options
    if (config.enableRAG && config.enableTools) {
      // RAG + Tools: Full LangGraph workflow
      return this.executeWithRAGAndTools(agent, messages, config);
    } else if (config.enableRAG) {
      // RAG only: Retrieve context and call LLM
      return this.executeWithRAG(agent, messages, config);
    } else if (config.enableTools) {
      // Tools only: LangGraph with tool execution
      return this.executeWithTools(agent, messages, config);
    } else {
      // Simple: Direct LLM call
      return this.executeDirect(messages);
    }
  }

  /**
   * Get agent from database
   */
  private async getAgent(agentId: string): Promise<Agent | null> {
    const { data, error } = await this.supabase
      .from('agents')
      .select('id, name, system_prompt, model, capabilities, metadata, knowledge_domains')
      .eq('id', agentId)
      .single();

    if (error) {
      console.error('❌ [Mode 1] Failed to fetch agent:', error);
      return null;
    }

    // Extract tools from metadata if present
    const tools = data.metadata?.tools || [];

    return {
      ...data,
      tools,
      knowledge_domains: data.knowledge_domains || []
    };
  }

  /**
   * Initialize LLM based on model selection
   */
  private initializeLLM(model: string, temperature = 0.7, maxTokens = 2000) {
    if (model.includes('claude')) {
      return new ChatAnthropic({
        modelName: model,
        temperature,
        maxTokens,
        apiKey: process.env.ANTHROPIC_API_KEY,
        streaming: true
      });
    } else {
      return new ChatOpenAI({
        modelName: model,
        temperature,
        maxTokens,
        openAIApiKey: process.env.OPENAI_API_KEY,
        streaming: true
      });
    }
  }

  /**
   * Build message array for LLM
   */
  private buildMessages(
    agent: Agent,
    currentMessage: string,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ) {
    const messages: any[] = [
      new SystemMessage(agent.system_prompt)
    ];

    // Add conversation history
    if (history && history.length > 0) {
      history.forEach(msg => {
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content));
        } else {
          messages.push(new AIMessage(msg.content));
        }
      });
    }

    // Add current message
    messages.push(new HumanMessage(currentMessage));

    return messages;
  }

  /**
   * OPTION 1: Direct LLM call (no RAG, no tools)
   */
  private async *executeDirect(messages: any[]): AsyncGenerator<string> {
    console.log('💬 [Mode 1] Executing direct LLM call');

    try {
      // Wrap LLM streaming with timeout
      const stream = await withTimeout(
        this.llm.stream(messages),
        MODE1_TIMEOUTS.LLM_CALL,
        'LLM call timed out after 30 seconds'
      );

      // Stream chunks with timeout protection
      const generator = this.streamChunks(stream);
      yield* withTimeoutGenerator(
        generator,
        MODE1_TIMEOUTS.LLM_CALL,
        'LLM streaming timed out'
      );

      console.log('✅ [Mode 1] Direct execution completed');
    } catch (error) {
      console.error('❌ [Mode 1] Direct execution failed:', error);
      if (error instanceof TimeoutError) {
        yield `Error: Request timed out. Please try again with a shorter message or contact support if the issue persists.`;
      } else {
        yield `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }
  }

  /**
   * Helper to stream chunks from LLM
   */
  private async *streamChunks(stream: any): AsyncGenerator<string> {
    for await (const chunk of stream) {
      if (chunk.content) {
        yield chunk.content;
      }
    }
  }

  /**
   * OPTION 2: With RAG (retrieve relevant context first)
   */
  private async *executeWithRAG(
    agent: Agent,
    messages: any[],
    config: Mode1Config
  ): AsyncGenerator<string> {
    console.log('📚 [Mode 1] Executing with RAG');

    try {
      // Retrieve relevant context with timeout (using agent's first knowledge domain)
      const ragDomain = agent.knowledge_domains?.[0];
      const ragContext = await withTimeout(
        this.retrieveRAGContext(config.message, agent, ragDomain),
        MODE1_TIMEOUTS.RAG_RETRIEVAL,
        'RAG retrieval timed out after 10 seconds'
      );

      // Inject RAG context into system message
      const enhancedMessages = [...messages];
      if (ragContext) {
        enhancedMessages[0] = new SystemMessage(
          `${agent.system_prompt}\n\n## Relevant Context:\n${ragContext}`
        );
      }

      // Stream response with timeout
      const stream = await withTimeout(
        this.llm.stream(enhancedMessages),
        MODE1_TIMEOUTS.LLM_CALL,
        'LLM call timed out after 30 seconds'
      );

      const generator = this.streamChunks(stream);
      yield* withTimeoutGenerator(
        generator,
        MODE1_TIMEOUTS.LLM_CALL,
        'LLM streaming timed out'
      );

      console.log('✅ [Mode 1] RAG execution completed');
    } catch (error) {
      console.error('❌ [Mode 1] RAG execution failed:', error);
      if (error instanceof TimeoutError) {
        yield `Error: ${error.message}. Please try again.`;
      } else {
        yield `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }
  }

  /**
   * OPTION 3: With Tools (real execution)
   * Uses LangChain function calling to execute tools dynamically
   */
  private async *executeWithTools(
    agent: Agent,
    messages: any[],
    config: Mode1Config
  ): AsyncGenerator<string> {
    console.log('🛠️  [Mode 1] Executing with tools (real execution)');

    try {
      // Convert tools to LangChain format
      const langchainTools = convertRegistryToLangChainTools(this.toolRegistry);
      
      // Bind tools to LLM for function calling
      const llmWithTools = this.llm.bindTools(langchainTools);

      // Build enhanced system prompt
      const systemPrompt = `${agent.system_prompt}\n\n## Available Tools:\n${langchainTools.map(t => `- ${t.name}: ${t.description}`).join('\n')}\n\nUse tools when you need current information, calculations, or database queries.`;
      const enhancedMessages = [
        new SystemMessage(systemPrompt),
        ...messages.slice(1) // Skip existing system message if any
      ];

      // Execute tool calling loop (max 5 iterations to prevent infinite loops)
      let currentMessages = enhancedMessages;
      let iterations = 0;
      const maxIterations = 5;
      let finalResponse = '';

      while (iterations < maxIterations) {
        iterations++;
        console.log(`   [Mode 1] Tool execution iteration ${iterations}/${maxIterations}`);

        // Call LLM with tools
        const response = await withTimeout(
          llmWithTools.invoke(currentMessages),
          MODE1_TIMEOUTS.LLM_CALL,
          'LLM call timed out after 30 seconds'
        );

        // Check if LLM wants to call a tool
        // In LangChain, tool calls are in response.tool_calls (array)
        const toolCalls = (response as any).tool_calls || [];
        
        if (toolCalls.length === 0) {
          // No tool calls, this is the final response
          finalResponse = response.content;
          break;
        }

        // Execute tool calls
        const toolMessages: ToolMessage[] = [];
        for (const toolCall of toolCalls) {
          const toolName = toolCall.name || toolCall.function?.name;
          const toolArgs = toolCall.args || (toolCall.function?.arguments ? JSON.parse(toolCall.function.arguments) : {});
          const toolCallId = toolCall.id || toolCall.tool_call_id || `call_${Date.now()}`;
          
          console.log(`   [Mode 1] Executing tool: ${toolName}`);
          
          try {
            const toolResult = await withTimeout(
              this.toolRegistry.executeTool(
                toolName,
                toolArgs,
                {
                  agent_id: agent.id,
                }
              ),
              MODE1_TIMEOUTS.TOOL_EXECUTION,
              `Tool ${toolName} execution timed out`
            );

            toolMessages.push(
              new ToolMessage({
                content: toolResult.success 
                  ? JSON.stringify(toolResult.result)
                  : `Error: ${toolResult.error}`,
                tool_call_id: toolCallId,
              })
            );
          } catch (error) {
            toolMessages.push(
              new ToolMessage({
                content: `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`,
                tool_call_id: toolCallId,
              })
            );
          }
        }

        // Add response and tool results to messages for next iteration
        currentMessages = [
          ...currentMessages,
          response,
          ...toolMessages,
        ];
      }

      // Stream final response
      if (finalResponse) {
        // Simulate streaming by yielding in chunks (word by word for realistic effect)
        const words = finalResponse.split(' ');
        for (const word of words) {
          yield word + ' ';
          // Small delay for realistic streaming effect
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      } else if (iterations >= maxIterations) {
        yield 'Maximum tool execution iterations reached. Please try with a more specific query.';
      } else {
        yield 'Tool execution completed. Generating response...';
      }

      console.log('✅ [Mode 1] Tool execution completed');
    } catch (error) {
      console.error('❌ [Mode 1] Tool execution failed:', error);
      if (error instanceof TimeoutError) {
        yield `Error: ${error.message}. Please try again.`;
      } else {
        yield `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }
  }

  /**
   * OPTION 4: With RAG + Tools (real execution)
   * Combines RAG context retrieval with tool execution
   */
  private async *executeWithRAGAndTools(
    agent: Agent,
    messages: any[],
    config: Mode1Config
  ): AsyncGenerator<string> {
    console.log('📚🛠️  [Mode 1] Executing with RAG + Tools (real execution)');

    try {
      // Get RAG context with timeout (using agent's first knowledge domain)
      const ragDomain = agent.knowledge_domains?.[0];
      const ragContext = await withTimeout(
        this.retrieveRAGContext(config.message, agent, ragDomain),
        MODE1_TIMEOUTS.RAG_RETRIEVAL,
        'RAG retrieval timed out after 10 seconds'
      );

      // Convert tools to LangChain format
      const langchainTools = convertRegistryToLangChainTools(this.toolRegistry);
      
      // Bind tools to LLM for function calling
      const llmWithTools = this.llm.bindTools(langchainTools);

      // Build enhanced system prompt with RAG context and tools
      const systemPrompt = `${agent.system_prompt}\n\n## Available Tools:\n${langchainTools.map(t => `- ${t.name}: ${t.description}`).join('\n')}\n\n## Relevant Context from Knowledge Base:\n${ragContext || 'No additional context found.'}\n\nUse tools when you need current information, calculations, or database queries beyond the provided context.`;
      
      const enhancedMessages = [
        new SystemMessage(systemPrompt),
        ...messages.slice(1) // Skip existing system message if any
      ];

      // Execute tool calling loop (max 5 iterations)
      let currentMessages = enhancedMessages;
      let iterations = 0;
      const maxIterations = 5;
      let finalResponse = '';

      while (iterations < maxIterations) {
        iterations++;
        console.log(`   [Mode 1] RAG + Tools iteration ${iterations}/${maxIterations}`);

        // Call LLM with tools
        const response = await withTimeout(
          llmWithTools.invoke(currentMessages),
          MODE1_TIMEOUTS.LLM_CALL,
          'LLM call timed out after 30 seconds'
        );

        // Check if LLM wants to call a tool
        const toolCalls = (response as any).tool_calls || [];
        
        if (toolCalls.length === 0) {
          // No tool calls, this is the final response
          finalResponse = response.content;
          break;
        }

        // Execute tool calls
        const toolMessages: ToolMessage[] = [];
        for (const toolCall of toolCalls) {
          const toolName = toolCall.name || toolCall.function?.name;
          const toolArgs = toolCall.args || (toolCall.function?.arguments ? JSON.parse(toolCall.function.arguments) : {});
          const toolCallId = toolCall.id || toolCall.tool_call_id || `call_${Date.now()}`;
          
          console.log(`   [Mode 1] Executing tool: ${toolName}`);
          
          try {
            const toolResult = await withTimeout(
              this.toolRegistry.executeTool(
                toolName,
                toolArgs,
                {
                  agent_id: agent.id,
                }
              ),
              MODE1_TIMEOUTS.TOOL_EXECUTION,
              `Tool ${toolName} execution timed out`
            );

            toolMessages.push(
              new ToolMessage({
                content: toolResult.success 
                  ? JSON.stringify(toolResult.result)
                  : `Error: ${toolResult.error}`,
                tool_call_id: toolCallId,
              })
            );
          } catch (error) {
            toolMessages.push(
              new ToolMessage({
                content: `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`,
                tool_call_id: toolCallId,
              })
            );
          }
        }

        // Add response and tool results to messages for next iteration
        currentMessages = [
          ...currentMessages,
          response,
          ...toolMessages,
        ];
      }

      // Stream final response
      if (finalResponse) {
        const words = finalResponse.split(' ');
        for (const word of words) {
          yield word + ' ';
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      } else if (iterations >= maxIterations) {
        yield 'Maximum tool execution iterations reached. Please try with a more specific query.';
      } else {
        yield 'RAG + Tool execution completed. Generating response...';
      }

      console.log('✅ [Mode 1] RAG + Tools execution completed');
    } catch (error) {
      console.error('❌ [Mode 1] RAG + Tools execution failed:', error);
      if (error instanceof TimeoutError) {
        yield `Error: ${error.message}. Please try again.`;
      } else {
        yield `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }
  }

  /**
   * Retrieve enhanced RAG context from knowledge base
   * Uses multiple strategies and domains for better results
   */
  private async retrieveRAGContext(query: string, agent: Agent, ragDomain?: string): Promise<string> {
    console.log('🔍 [Mode 1] Retrieving enhanced RAG context...');
    
    try {
      // Import EnhancedRAGService
      const { enhancedRAGService } = await import('../../ask-expert/mode-1/services/enhanced-rag-service');
      
      // Use all knowledge domains if available, otherwise use single domain
      const knowledgeDomains = agent.knowledge_domains && agent.knowledge_domains.length > 0
        ? agent.knowledge_domains
        : ragDomain
        ? [ragDomain]
        : [];

      // Retrieve enhanced context
      const ragContext = await enhancedRAGService.retrieveContext({
        query,
        agentId: agent.id,
        knowledgeDomains,
        maxResults: 5,
        similarityThreshold: 0.7,
        includeUrls: true,
      });

      if (ragContext.totalSources > 0) {
        console.log(`✅ [Mode 1] Retrieved ${ragContext.totalSources} sources from ${ragContext.domainsSearched.join(', ')} (${ragContext.retrievalTime}ms)`);
        
        // Return formatted context with metadata
        return ragContext.context;
      }

      console.log('ℹ️  [Mode 1] No relevant documents found');
      return ''; // Return empty string - Mode 1 will proceed without RAG context

    } catch (error) {
      console.error('❌ [Mode 1] Enhanced RAG retrieval error:', error);
      // Fallback to basic retrieval on error
      try {
        const { unifiedRAGService } = await import('../../../lib/services/rag/unified-rag-service');
        const ragResult = await unifiedRAGService.query({
          text: query,
          agentId: agent.id,
          domain: ragDomain,
          maxResults: 3,
          similarityThreshold: 0.7,
          strategy: 'semantic',
          includeMetadata: true,
        });

        if (ragResult.sources && ragResult.sources.length > 0) {
          const context = ragResult.sources
            .map((doc, i) => `[${i + 1}] ${doc.pageContent}\n   Source: ${doc.metadata?.source_title || doc.metadata?.title || 'Document'}`)
            .join('\n\n');
          console.log(`✅ [Mode 1] Fallback retrieval: ${ragResult.sources.length} documents`);
          return context;
        }
      } catch (fallbackError) {
        console.error('❌ [Mode 1] Fallback RAG retrieval also failed:', fallbackError);
      }
      
      return '';
    }
  }

  /**
   * Get embedding for RAG query
   */
  private async getEmbedding(text: string): Promise<number[]> {
    // Use OpenAI embeddings
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });

    const data = await response.json();
    return data.data[0].embedding;
  }


}

// ============================================================================
// EXPORT
// ============================================================================

export async function executeMode1(config: Mode1Config): Promise<AsyncGenerator<string>> {
  const handler = new Mode1ManualInteractiveHandler();
  return handler.execute(config);
}
