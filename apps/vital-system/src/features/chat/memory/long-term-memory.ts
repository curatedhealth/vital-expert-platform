/**
 * Long-term memory service stub
 * TODO: Implement conversation memory persistence when chat feature is developed
 */

import type { ConversationMemory } from '../types/conversation.types';

export interface LongTermMemoryConfig {
  maxMessages?: number;
  summarizeThreshold?: number;
}

export class LongTermMemory {
  private config: LongTermMemoryConfig;
  private memories: Map<string, ConversationMemory>;

  constructor(config: LongTermMemoryConfig = {}) {
    this.config = {
      maxMessages: config.maxMessages ?? 100,
      summarizeThreshold: config.summarizeThreshold ?? 50,
    };
    this.memories = new Map();
  }

  async save(conversationId: string, memory: ConversationMemory): Promise<void> {
    // TODO: Implement persistence to database
    this.memories.set(conversationId, memory);
  }

  async load(conversationId: string): Promise<ConversationMemory | null> {
    // TODO: Implement loading from database
    return this.memories.get(conversationId) ?? null;
  }

  async delete(conversationId: string): Promise<void> {
    // TODO: Implement deletion from database
    this.memories.delete(conversationId);
  }

  async summarize(_conversationId: string): Promise<string> {
    // TODO: Implement conversation summarization
    console.warn('LongTermMemory.summarize is not implemented');
    return '';
  }

  // Methods for memory key-based access (used by API routes)
  async retrieveLongTermMemory(memoryKey: string): Promise<Record<string, unknown> | null> {
    // TODO: Implement retrieval from database
    console.warn('LongTermMemory.retrieveLongTermMemory is not implemented');
    void memoryKey;
    return null;
  }

  async storeLongTermMemory(memoryKey: string, data: Record<string, unknown>): Promise<void> {
    // TODO: Implement storage to database
    console.warn('LongTermMemory.storeLongTermMemory is not implemented');
    void memoryKey;
    void data;
  }
}

export const createLongTermMemory = (config?: LongTermMemoryConfig): LongTermMemory => {
  return new LongTermMemory(config);
};

// Auto-learning memory stub
export interface AutoLearningMemory {
  extractFacts(userId: string, userMessage: string, assistantMessage: string): Promise<unknown[]>;
  load(userId: string): Promise<Record<string, unknown> | null>;
  save(sessionId: string, data: Record<string, unknown>): Promise<void>;
}

// Factory for auto-learning memory - matches expected signature from API routes
export const createAutoLearningMemory = (
  userId?: string,
  enableLearning?: boolean
): AutoLearningMemory => {
  void userId;
  void enableLearning;
  return {
    async extractFacts(_userId: string, _userMessage: string, _assistantMessage: string): Promise<unknown[]> {
      // TODO: Implement fact extraction
      console.warn('AutoLearningMemory.extractFacts is not implemented');
      return [];
    },
    async load(_userId: string): Promise<Record<string, unknown> | null> {
      // TODO: Implement loading user context
      console.warn('AutoLearningMemory.load is not implemented');
      return null;
    },
    async save(_sessionId: string, _data: Record<string, unknown>): Promise<void> {
      // TODO: Implement saving conversation data
      console.warn('AutoLearningMemory.save is not implemented');
    },
  };
};

// Singleton instance for service usage
export const longTermMemoryService = new LongTermMemory();

export default LongTermMemory;
