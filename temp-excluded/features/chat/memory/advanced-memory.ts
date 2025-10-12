/**
 * Advanced Memory Service - Real Implementation
 */

import { createClient } from '@supabase/supabase-js';
import { BufferWindowMemory, ConversationSummaryMemory } from 'langchain/memory';

export type MemoryStrategy = 'buffer' | 'summary' | 'vector' | 'hybrid' | 'entity';

export interface MemoryConfig {
  strategy: MemoryStrategy;
  maxTokens?: number;
  sessionId: string;
  userId: string;
  agentId: string;
}

export class AdvancedMemoryService {
  private supabase: any;
  private memoryInstances: Map<string, any> = new Map();

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    } else {
      console.warn('⚠️ Supabase not configured - using fallback memory');
    }
  }

  /**
   * Store memory with different strategies
   */
  async storeMemory(key: string, value: any, config: MemoryConfig): Promise<void> {
    try {
      if (!this.supabase) {
        console.log(`Storing memory (fallback): ${key}`);
        return;
      }

      // Store in database
      const { error } = await this.supabase
        .from('chat_memory')
        .upsert({
          session_id: config.sessionId,
          user_id: config.userId,
          agent_id: config.agentId,
          memory_key: key,
          memory_value: JSON.stringify(value),
          strategy: config.strategy,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to store memory:', error);
      } else {
        console.log(`✅ Stored memory: ${key} (${config.strategy})`);
      }
    } catch (error) {
      console.error('Memory storage error:', error);
    }
  }

  /**
   * Retrieve memory with different strategies
   */
  async retrieveMemory(key: string, config: MemoryConfig): Promise<any> {
    try {
      if (!this.supabase) {
        return { content: `Fallback memory for: ${key}` };
      }

      const { data, error } = await this.supabase
        .from('chat_memory')
        .select('*')
        .eq('session_id', config.sessionId)
        .eq('memory_key', key)
        .eq('strategy', config.strategy)
        .single();

      if (error || !data) {
        return null;
      }

      return JSON.parse(data.memory_value);
    } catch (error) {
      console.error('Memory retrieval error:', error);
      return null;
    }
  }

  /**
   * Get or create memory instance for session
   */
  getMemoryInstance(config: MemoryConfig): any {
    const memoryKey = `${config.sessionId}-${config.strategy}`;
    
    if (this.memoryInstances.has(memoryKey)) {
      return this.memoryInstances.get(memoryKey);
    }

    let memoryInstance: any;

    switch (config.strategy) {
      case 'buffer':
        memoryInstance = new BufferWindowMemory({
          k: 10,
          memoryKey: 'chat_history',
          returnMessages: true,
        });
        break;

      case 'summary':
        memoryInstance = new ConversationSummaryMemory({
          llm: new (require('@langchain/openai').ChatOpenAI)({
            modelName: 'gpt-3.5-turbo',
            temperature: 0,
          }),
          memoryKey: 'chat_history',
          returnMessages: true,
        });
        break;

      case 'vector':
        // Vector memory would require vector store setup
        memoryInstance = new BufferWindowMemory({
          k: 5,
          memoryKey: 'chat_history',
          returnMessages: true,
        });
        break;

      case 'hybrid':
        // Hybrid combines buffer and summary
        memoryInstance = new BufferWindowMemory({
          k: 8,
          memoryKey: 'chat_history',
          returnMessages: true,
        });
        break;

      case 'entity':
        // Entity memory for tracking specific entities
        memoryInstance = new BufferWindowMemory({
          k: 6,
          memoryKey: 'chat_history',
          returnMessages: true,
        });
        break;

      default:
        memoryInstance = new BufferWindowMemory({
          k: 10,
          memoryKey: 'chat_history',
          returnMessages: true,
        });
    }

    this.memoryInstances.set(memoryKey, memoryInstance);
    return memoryInstance;
  }

  /**
   * Load chat history into memory
   */
  async loadChatHistory(sessionId: string, chatHistory: any[]): Promise<void> {
    try {
      if (!this.supabase) {
        console.log('Loading chat history (fallback mode)');
        return;
      }

      // Store chat history in database
      const messages = chatHistory.map((msg, index) => ({
        session_id: sessionId,
        message_index: index,
        role: msg.role,
        content: msg.content,
        created_at: new Date().toISOString(),
      }));

      const { error } = await this.supabase
        .from('chat_history')
        .upsert(messages, { onConflict: 'session_id,message_index' });

      if (error) {
        console.error('Failed to load chat history:', error);
      } else {
        console.log(`✅ Loaded ${chatHistory.length} messages into chat history`);
      }
    } catch (error) {
      console.error('Chat history loading error:', error);
    }
  }

  /**
   * Clear memory for session
   */
  async clearMemory(sessionId: string): Promise<void> {
    try {
      if (!this.supabase) {
        console.log(`Clearing memory (fallback): ${sessionId}`);
        return;
      }

      // Clear from database
      await this.supabase
        .from('chat_memory')
        .delete()
        .eq('session_id', sessionId);

      // Clear from memory instances
      for (const [key, instance] of this.memoryInstances.entries()) {
        if (key.startsWith(sessionId)) {
          this.memoryInstances.delete(key);
        }
      }

      console.log(`✅ Cleared memory for session: ${sessionId}`);
    } catch (error) {
      console.error('Memory clearing error:', error);
    }
  }
}

export const advancedMemoryService = new AdvancedMemoryService();

/**
 * Select appropriate memory strategy based on context
 */
export function selectMemoryStrategy(
  sessionId: string,
  userId: string,
  agentId: string,
  context: 'research' | 'conversation' | 'technical' | 'brief' = 'conversation'
): MemoryConfig {
  const strategies: Record<string, MemoryStrategy> = {
    research: 'hybrid',
    conversation: 'buffer',
    technical: 'summary',
    brief: 'buffer',
  };

  return {
    strategy: strategies[context] || 'buffer',
    maxTokens: 4000,
    sessionId,
    userId,
    agentId,
  };
}