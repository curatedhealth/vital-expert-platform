/**
 * Context Manager for Mode 1
 * 
 * Manages conversation context to prevent token overflow
 * Implements smart prioritization and summarization
 */

import { TokenCounter, getContextLimit, MODEL_TOKEN_LIMITS } from '../utils/token-counter';
import { ChatOpenAI } from '@langchain/openai';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  id?: string;
}

export interface RAGContext {
  content: string;
  relevance: number;
  source?: string;
}

export interface ContextBuildResult {
  messages: Message[];
  ragContext: RAGContext[];
  summary?: string;
  totalTokens: number;
  tokensUsed: {
    messages: number;
    rag: number;
    summary: number;
  };
}

export interface ContextManagerConfig {
  model?: string;
  maxTokens?: number;
  recentMessageCount?: number; // Number of recent messages to always keep
  summarizationThreshold?: number; // Threshold for triggering summarization (0.75 = 75% of max)
}

/**
 * Context Manager Class
 */
export class ContextManager {
  private tokenCounter: TokenCounter;
  private config: Required<ContextManagerConfig>;
  private llm?: ChatOpenAI; // For summarization

  constructor(config: ContextManagerConfig = {}) {
    this.config = {
      model: config.model || 'default',
      maxTokens: config.maxTokens || getContextLimit(config.model),
      recentMessageCount: config.recentMessageCount ?? 5,
      summarizationThreshold: config.summarizationThreshold ?? 0.75,
    };
    
    this.tokenCounter = new TokenCounter(this.config.model);
    
    // Initialize LLM for summarization if OpenAI key is available
    if (process.env.OPENAI_API_KEY && this.config.model.includes('gpt')) {
      this.llm = new ChatOpenAI({
        modelName: 'gpt-3.5-turbo', // Use cheaper model for summarization
        temperature: 0.3, // Lower temperature for more consistent summaries
        maxTokens: 150, // Short summaries
      });
    }
  }

  /**
   * Build optimized context from messages and RAG results
   */
  async buildContext(
    messages: Message[],
    ragContext: RAGContext[] = [],
    systemPrompt?: string
  ): Promise<ContextBuildResult> {
    const contextLimit = this.config.maxTokens;
    const summarizationThreshold = contextLimit * this.config.summarizationThreshold;
    
    // Start with system prompt if provided
    let totalTokens = systemPrompt ? await this.tokenCounter.countTokens(systemPrompt) : 0;
    const tokensUsed = {
      messages: 0,
      rag: 0,
      summary: 0,
    };

    // Priority 1: Keep recent messages (last N messages)
    const recentMessages = messages.slice(-this.config.recentMessageCount);
    const olderMessages = messages.slice(0, -this.config.recentMessageCount);
    
    let contextMessages: Message[] = [];
    let includedRAG: RAGContext[] = [];
    let summary: string | undefined;

    // Count tokens in recent messages
    for (const msg of recentMessages) {
      const msgTokens = await this.tokenCounter.countTokens(msg.content);
      if (totalTokens + msgTokens <= summarizationThreshold) {
        contextMessages.push(msg);
        totalTokens += msgTokens;
        tokensUsed.messages += msgTokens;
      } else {
        // Stop if we'd exceed threshold
        break;
      }
    }

    // Priority 2: Add RAG context (sorted by relevance)
    const sortedRAG = [...ragContext].sort((a, b) => b.relevance - a.relevance);
    for (const rag of sortedRAG) {
      const ragTokens = await this.tokenCounter.countTokens(rag.content);
      if (totalTokens + ragTokens <= contextLimit) {
        includedRAG.push(rag);
        totalTokens += ragTokens;
        tokensUsed.rag += ragTokens;
      } else {
        break;
      }
    }

    // Priority 3: Summarize older messages if we have room
    if (olderMessages.length > 0 && totalTokens < summarizationThreshold) {
      const remainingTokens = summarizationThreshold - totalTokens;
      
      try {
        summary = await this.summarizeMessages(olderMessages, remainingTokens);
        if (summary) {
          const summaryTokens = await this.tokenCounter.countTokens(summary);
          totalTokens += summaryTokens;
          tokensUsed.summary += summaryTokens;
        }
      } catch (error) {
        console.warn('[ContextManager] Summarization failed, skipping older messages:', error);
        // Continue without summary - better than failing
      }
    }

    // Add system prompt at the beginning if provided
    const finalMessages: Message[] = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...contextMessages]
      : contextMessages;

    return {
      messages: finalMessages,
      ragContext: includedRAG,
      summary,
      totalTokens,
      tokensUsed,
    };
  }

  /**
   * Summarize older messages
   */
  private async summarizeMessages(
    messages: Message[],
    maxTokens: number
  ): Promise<string | undefined> {
    if (!this.llm || messages.length === 0) {
      return undefined;
    }

    try {
      // Build summary prompt
      const conversationText = messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      const summaryPrompt = `Summarize the following conversation history in 2-3 sentences, capturing the main topics and key decisions:

${conversationText}

Summary:`;

      // Check if prompt fits
      const promptTokens = await this.tokenCounter.countTokens(summaryPrompt);
      if (promptTokens > maxTokens * 0.8) {
        // Prompt too long, use simpler approach
        return this.createSimpleSummary(messages);
      }

      // Generate summary using LLM
      const response = await this.llm.invoke(summaryPrompt);
      return response.content as string;
    } catch (error) {
      console.warn('[ContextManager] LLM summarization failed, using simple summary:', error);
      return this.createSimpleSummary(messages);
    }
  }

  /**
   * Create simple summary without LLM (fallback)
   */
  private createSimpleSummary(messages: Message[]): string {
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    
    const topics = userMessages
      .map(m => {
        // Extract key topics from first 50 chars
        const content = m.content.substring(0, 50);
        return content.split(/[.?!]/)[0];
      })
      .filter(Boolean);

    return `Previous conversation covered: ${topics.slice(0, 3).join(', ')}. ${
      userMessages.length
    } user messages and ${assistantMessages.length} assistant responses.`;
  }

  /**
   * Check if context would exceed limit
   */
  async wouldExceedLimit(
    messages: Message[],
    ragContext: RAGContext[] = [],
    systemPrompt?: string
  ): Promise<boolean> {
    const result = await this.buildContext(messages, ragContext, systemPrompt);
    return result.totalTokens >= this.config.maxTokens;
  }

  /**
   * Get current config
   */
  getConfig(): Required<ContextManagerConfig> {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<ContextManagerConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
    
    if (config.model) {
      this.tokenCounter = new TokenCounter(config.model);
      if (!config.maxTokens) {
        this.config.maxTokens = getContextLimit(config.model);
      }
    }
  }
}

/**
 * Create a context manager instance
 */
export function createContextManager(config?: ContextManagerConfig): ContextManager {
  return new ContextManager(config);
}

