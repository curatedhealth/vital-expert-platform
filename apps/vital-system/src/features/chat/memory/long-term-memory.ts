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
}

export const createLongTermMemory = (config?: LongTermMemoryConfig): LongTermMemory => {
  return new LongTermMemory(config);
};

export default LongTermMemory;
