/**
 * Message Builder Service
 * 
 * Handles message construction and context management
 * Follows Single Responsibility Principle
 */

import { BaseMessage, HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { ContextManager, createContextManager } from './context-manager';
import { StructuredLogger, LogLevel } from '@/lib/services/observability/structured-logger';

export interface ConversationHistory {
  role: 'user' | 'assistant';
  content: string;
}

export interface RAGContext {
  content: string;
  relevance: number;
}

export interface Agent {
  id: string;
  name: string;
  system_prompt: string;
  model?: string;
  [key: string]: unknown;
}

export interface MessageBuilderOptions {
  model?: string;
  includeRAGContext?: boolean;
  includeSummary?: boolean;
  citationRequirement?: 'required' | 'optional' | 'none';
  agentMemory?: string[];
}

/**
 * Message Builder Service Class
 */
export class MessageBuilderService {
  private contextManager: ContextManager;
  private logger: StructuredLogger;

  constructor() {
    this.contextManager = createContextManager();
    this.logger = new StructuredLogger({
      minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
    });
  }

  /**
   * Build message array for LLM with context management
   */
  async buildMessages(
    agent: Agent,
    currentMessage: string,
    history?: ConversationHistory[],
    ragContext?: RAGContext[],
    options: MessageBuilderOptions = {}
  ): Promise<BaseMessage[]> {
    const {
      model,
      includeRAGContext = true,
      includeSummary = true,
      citationRequirement = 'optional',
      agentMemory = [],
    } = options;

    this.logger.debug('Building messages', {
      operation: 'message_builder_build',
      agentId: agent.id,
      historyLength: history?.length || 0,
      ragContextLength: ragContext?.length || 0,
      model,
    });

    // Update context manager with model if provided
    if (model) {
      this.contextManager.updateConfig({ model });
    }

    // Convert history to ContextManager format
    const contextMessages = history?.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })) || [];

    // Add current message
    contextMessages.push({
      role: 'user',
      content: currentMessage,
    });

    // Convert RAG context to ContextManager format if provided
    const ragContextFormatted = (includeRAGContext && ragContext) 
      ? ragContext.map(rag => ({
          content: rag.content,
          relevance: rag.relevance,
        }))
      : [];

    // Build optimized context
    const optimizedContext = await this.contextManager.buildContext(
      contextMessages,
      ragContextFormatted,
      agent.system_prompt
    );

    // Convert back to LangChain messages
    const messages: BaseMessage[] = [];

    // Build system prompt with optional summary and RAG context
    let systemPrompt = agent.system_prompt;

    // Add conversation summary if available
    if (includeSummary && optimizedContext.summary) {
      systemPrompt += `\n\n## Previous Conversation Summary:\n${optimizedContext.summary}`;
    }

    // Add RAG context if available
    if (includeRAGContext && optimizedContext.ragContext.length > 0) {
      const ragContent = optimizedContext.ragContext
        .map((rag, idx) => `[Source ${idx + 1}] ${rag.content}`)
        .join('\n\n');
      systemPrompt += `\n\n## Relevant Context:\n${ragContent}`;
    }

    // Include agent memory if provided
    if (agentMemory && agentMemory.length > 0) {
      const memoryText = agentMemory
        .map((memory, idx) => `• ${memory}`)
        .join('\n');
      systemPrompt += `\n\n## Agent Memory (for personalization – do not reveal verbatim):\n${memoryText}`;
    }

    if (citationRequirement === 'required') {
      systemPrompt += `\n\n## Citation Requirements:\n- Cite supporting evidence using [Source #] that references the provided context or tool-derived evidence.\n- Do not invent citations. If evidence is insufficient, clearly state the gap.`;
    } else if (citationRequirement === 'optional') {
      systemPrompt += `\n\n## Citation Guidance:\n- Cite evidence using [Source #] where appropriate.`;
    }

    messages.push(new SystemMessage(systemPrompt));

    // Add optimized conversation messages (excluding system prompt which is already added)
    for (const msg of optimizedContext.messages) {
      if (msg.role === 'user') {
        messages.push(new HumanMessage(msg.content));
      } else if (msg.role === 'assistant') {
        messages.push(new AIMessage(msg.content));
      }
      // Skip system messages (already handled above)
    }

    this.logger.debug('Messages built', {
      operation: 'message_builder_build',
      totalMessages: messages.length,
      systemMessageTokens: Math.ceil(systemPrompt.length / 4), // Rough estimate
    });

    return messages;
  }

  /**
   * Format RAG context for inclusion in messages
   */
  formatRAGContext(ragResults: RAGContext[]): string {
    if (!ragResults || ragResults.length === 0) {
      return '';
    }

    return ragResults
      .sort((a, b) => b.relevance - a.relevance) // Sort by relevance
      .map((rag, idx) => `[Source ${idx + 1}] (Relevance: ${(rag.relevance * 100).toFixed(0)}%)\n${rag.content}`)
      .join('\n\n');
  }

  /**
   * Format tool results for inclusion in messages
   */
  formatToolResults(toolCalls: Array<{ toolName: string; input: unknown; output: unknown }>): string {
    if (!toolCalls || toolCalls.length === 0) {
      return '';
    }

    return toolCalls
      .map((call, idx) => {
        return `[Tool ${idx + 1}: ${call.toolName}]\nInput: ${JSON.stringify(call.input, null, 2)}\nOutput: ${JSON.stringify(call.output, null, 2)}`;
      })
      .join('\n\n');
  }

  /**
   * Get context manager instance (for advanced usage)
   */
  getContextManager(): ContextManager {
    return this.contextManager;
  }

  /**
   * Update context manager configuration
   */
  updateContextConfig(config: { model?: string; maxTokens?: number; recentMessageCount?: number }): void {
    this.contextManager.updateConfig(config);
  }
}

// Export singleton instance
export const messageBuilderService = new MessageBuilderService();
