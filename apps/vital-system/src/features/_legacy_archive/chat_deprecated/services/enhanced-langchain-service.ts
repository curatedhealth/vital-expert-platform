/**
 * @deprecated This service is deprecated and no longer used.
 *
 * Enhanced LangChain Service - DEPRECATED STUB
 *
 * This service used LangChain directly, violating the Golden Rule.
 * All AI/ML services must be in Python and accessed via API Gateway.
 *
 * RAG operations now use the Python AI Engine via API Gateway (Golden Rule compliant).
 *
 * DO NOT USE: All RAG operations now go through API Gateway -> Python AI Engine.
 *
 * This file is kept as a stub for backwards compatibility and should be removed.
 */

export interface EnhancedLangChainConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface QueryResult {
  answer: string;
  sources: any[];
  citations: string[];
  tokenUsage: any;
}

/**
 * @deprecated Use Python AI Engine via API Gateway instead.
 * This stub class provides no-op implementations for backwards compatibility.
 */
export class EnhancedLangChainService {
  private config: EnhancedLangChainConfig;

  constructor(config: EnhancedLangChainConfig) {
    this.config = config;
    console.warn('[DEPRECATED] EnhancedLangChainService is deprecated. Use Python AI Engine via API Gateway.');
  }

  /**
   * @deprecated No-op - use Python AI Engine
   */
  async queryWithChain(
    question: string,
    agentId: string,
    sessionId: string,
    agent: any,
    userId: string
  ): Promise<QueryResult> {
    console.warn('[DEPRECATED] queryWithChain is deprecated. Use Python AI Engine.');
    return {
      answer: '',
      sources: [],
      citations: [],
      tokenUsage: {},
    };
  }

  /**
   * @deprecated No-op - memory is handled by Python AI Engine
   */
  async loadChatHistory(sessionId: string, chatHistory: any[]): Promise<void> {
    console.warn('[DEPRECATED] loadChatHistory is deprecated. Memory is handled by Python AI Engine.');
    // No-op - deprecated
  }

  /**
   * @deprecated No-op
   */
  async getMemoryBuffer(sessionId: string): Promise<any[]> {
    console.warn('[DEPRECATED] getMemoryBuffer is deprecated.');
    return [];
  }

  /**
   * @deprecated No-op
   */
  clearMemory(sessionId: string): void {
    console.warn('[DEPRECATED] clearMemory is deprecated.');
  }

  /**
   * @deprecated No-op
   */
  clearChain(agentId: string, sessionId: string): void {
    console.warn('[DEPRECATED] clearChain is deprecated.');
  }

  /**
   * @deprecated No-op - use Python AI Engine RAG
   */
  async searchKnowledge(query: string, options?: { limit?: number }): Promise<{ chunks: any[] }> {
    console.warn('[DEPRECATED] searchKnowledge is deprecated. Use Python AI Engine RAG.');
    return { chunks: [] };
  }

  /**
   * @deprecated No-op - use Python AI Engine
   */
  async processQuery(query: string): Promise<{ answer: string; sources: string[] }> {
    console.warn('[DEPRECATED] processQuery is deprecated. Use Python AI Engine.');
    return {
      answer: '',
      sources: [],
    };
  }
}

// Create singleton stub instance
export const enhancedLangChainService = new EnhancedLangChainService({
  model: 'gpt-3.5-turbo',
  temperature: 0.1,
  maxTokens: 2000
});
