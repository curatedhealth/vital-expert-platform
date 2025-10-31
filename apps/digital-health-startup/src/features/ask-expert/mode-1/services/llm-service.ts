/**
 * LLM Service
 * 
 * Handles LLM initialization, configuration, and invocation
 * Follows Single Responsibility Principle
 */

import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseMessage, HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { StructuredLogger, LogLevel } from '@/lib/services/observability/structured-logger';
import {
  withTimeout,
  withTimeoutGenerator,
  MODE1_TIMEOUTS,
} from '../utils/timeout-handler';
import { llmCircuitBreaker } from '../utils/circuit-breaker';

export interface LLMConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}

export interface LLMInvokeOptions {
  tools?: any[];
  timeout?: number;
}

/**
 * LLM Service Class
 */
export class LLMService {
  private logger: StructuredLogger;

  constructor() {
    this.logger = new StructuredLogger({
      minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
    });
  }

  /**
   * Initialize LLM based on model selection
   */
  initializeLLM(config: LLMConfig): BaseChatModel {
    const { model, temperature = 0.7, maxTokens = 2000, streaming = true } = config;

    this.logger.debug('Initializing LLM', {
      operation: 'llm_initialize',
      model,
      temperature,
      maxTokens,
    });

    if (model.includes('claude')) {
      return new ChatAnthropic({
        modelName: model,
        temperature,
        maxTokens,
        apiKey: process.env.ANTHROPIC_API_KEY,
        streaming,
      });
    } else {
      return new ChatOpenAI({
        modelName: model,
        temperature,
        maxTokens,
        openAIApiKey: process.env.OPENAI_API_KEY,
        streaming,
      });
    }
  }

  /**
   * Stream LLM response with timeout and circuit breaker protection
   */
  async *streamLLM(
    llm: BaseChatModel,
    messages: BaseMessage[],
    options: LLMInvokeOptions = {}
  ): AsyncGenerator<string> {
    const { tools, timeout = MODE1_TIMEOUTS.LLM_CALL } = options;

    this.logger.debug('Streaming LLM response', {
      operation: 'llm_stream',
      messageCount: messages.length,
      hasTools: !!tools && tools.length > 0,
    });

    try {
      // Bind tools if provided
      const llmWithTools = tools && tools.length > 0 
        ? llm.bindTools(tools)
        : llm;

      // Use circuit breaker for LLM calls
      const stream = await llmCircuitBreaker.execute(
        async () => {
          return await withTimeout(
            llmWithTools.stream(messages),
            timeout,
            `LLM call timed out after ${timeout}ms`
          );
        },
        async () => {
          // Fallback: return empty stream
          return (async function* () {
            yield '';
          })();
        }
      );

      // Stream chunks with timeout protection
      const generator = this.streamChunks(stream);
      yield* withTimeoutGenerator(
        generator,
        timeout,
        'LLM streaming timed out'
      );

      this.logger.debug('LLM streaming completed', {
        operation: 'llm_stream',
      });
    } catch (error) {
      this.logger.error('LLM streaming failed', error instanceof Error ? error : new Error(String(error)), {
        operation: 'llm_stream',
      });
      throw error;
    }
  }

  /**
   * Invoke LLM (non-streaming) with timeout and circuit breaker protection
   * Returns the full response object (for tool calling support)
   */
  async invokeLLM(
    llm: BaseChatModel,
    messages: BaseMessage[],
    options: LLMInvokeOptions = {}
  ): Promise<any> {
    const { tools, timeout = MODE1_TIMEOUTS.LLM_CALL } = options;

    this.logger.debug('Invoking LLM', {
      operation: 'llm_invoke',
      messageCount: messages.length,
      hasTools: !!tools && tools.length > 0,
    });

    try {
      // Bind tools if provided
      const llmWithTools = tools && tools.length > 0 
        ? llm.bindTools(tools)
        : llm;

      // Use circuit breaker for LLM calls
      const response = await llmCircuitBreaker.execute(
        async () => {
          return await withTimeout(
            llmWithTools.invoke(messages),
            timeout,
            `LLM call timed out after ${timeout}ms`
          );
        },
        async () => {
          // Fallback: return empty response
          return { content: '', tool_calls: [] } as any;
        }
      );

      this.logger.debug('LLM invoke completed', {
        operation: 'llm_invoke',
      });

      // Return full response object (includes content, tool_calls, etc.)
      return response;
    } catch (error) {
      this.logger.error('LLM invoke failed', error instanceof Error ? error : new Error(String(error)), {
        operation: 'llm_invoke',
      });
      throw error;
    }
  }

  /**
   * Invoke LLM and return only content (convenience method)
   */
  async invokeLLMSimple(
    llm: BaseChatModel,
    messages: BaseMessage[],
    options: LLMInvokeOptions = {}
  ): Promise<string> {
    const response = await this.invokeLLM(llm, messages, options);
    return response.content as string;
  }

  /**
   * Helper to stream chunks from LLM response
   */
  private async *streamChunks(stream: any): AsyncGenerator<string> {
    for await (const chunk of stream) {
      if (chunk.content) {
        yield chunk.content;
      }
    }
  }
}

// Export singleton instance
export const llmService = new LLMService();
