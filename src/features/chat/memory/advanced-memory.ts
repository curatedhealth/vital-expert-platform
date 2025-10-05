import {
  BufferMemory,
  BufferWindowMemory,
  ConversationSummaryMemory,
  VectorStoreRetrieverMemory,
} from 'langchain/memory';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createClient } from '@supabase/supabase-js';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { Redis } from '@upstash/redis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'text-embedding-ada-002',
});

const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'gpt-3.5-turbo',
  temperature: 0,
});

/**
 * Memory Manager
 * Provides different memory strategies based on conversation needs
 */
export class MemoryManager {
  private sessionId: string;
  private userId: string;
  private agentId: string;

  constructor(sessionId: string, userId: string, agentId: string) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.agentId = agentId;
  }

  /**
   * Buffer Window Memory
   * Keeps last N messages in memory (fast, limited context)
   */
  async getBufferWindowMemory(windowSize: number = 10): Promise<BufferWindowMemory> {
    const memory = new BufferWindowMemory({
      k: windowSize,
      memoryKey: 'chat_history',
      returnMessages: true,
      inputKey: 'input',
      outputKey: 'output',
    });

    // Load existing chat history from database
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('session_id', this.sessionId)
      .order('created_at', { ascending: true })
      .limit(windowSize);

    if (messages) {
      for (const msg of messages) {
        if (msg.role === 'user') {
          await memory.chatHistory.addMessage(new HumanMessage(msg.content));
        } else {
          await memory.chatHistory.addMessage(new AIMessage(msg.content));
        }
      }
    }

    return memory;
  }

  /**
   * Conversation Summary Memory
   * Summarizes old messages, keeps full recent messages (balanced)
   */
  async getSummaryMemory(): Promise<ConversationSummaryMemory> {
    const memory = new ConversationSummaryMemory({
      llm,
      memoryKey: 'chat_history',
      returnMessages: true,
      inputKey: 'input',
      outputKey: 'output',
    });

    // Load existing chat history
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('session_id', this.sessionId)
      .order('created_at', { ascending: true });

    if (messages) {
      for (const msg of messages) {
        if (msg.role === 'user') {
          await memory.chatHistory.addMessage(new HumanMessage(msg.content));
        } else {
          await memory.chatHistory.addMessage(new AIMessage(msg.content));
        }
      }
    }

    return memory;
  }

  /**
   * Vector Store Memory
   * Stores all messages in vector database, retrieves most relevant (semantic search)
   */
  async getVectorStoreMemory(k: number = 6): Promise<VectorStoreRetrieverMemory | BufferWindowMemory> {
    try {
      const vectorStore = new SupabaseVectorStore(embeddings, {
        client: supabase,
        tableName: 'chat_memory_vectors',
        queryName: 'match_chat_memory',
      });

      const retriever = vectorStore.asRetriever({
        searchType: 'similarity',
        k,
        filter: {
          session_id: { $eq: this.sessionId },
        },
      });

      const memory = new VectorStoreRetrieverMemory({
        vectorStoreRetriever: retriever,
        memoryKey: 'chat_history',
        returnDocs: true,
        inputKey: 'input',
        outputKey: 'output',
      });

      return memory;
    } catch (error) {
      console.warn('Vector store memory not available, falling back to buffer memory:', error);
      // Fallback to buffer memory if vector store fails
      return await this.getBufferWindowMemory(k);
    }
  }

  /**
   * Hybrid Memory Strategy
   * Combines buffer window for recent context + vector store for semantic search
   */
  async getHybridMemory(windowSize: number = 10, vectorK: number = 4) {
    const bufferMemory = await this.getBufferWindowMemory(windowSize);
    const vectorMemory = await this.getVectorStoreMemory(vectorK);

    return {
      buffer: bufferMemory,
      vector: vectorMemory,

      async loadMemoryVariables(inputs: any) {
        const bufferContext = await bufferMemory.loadMemoryVariables(inputs);
        const vectorContext = await vectorMemory.loadMemoryVariables(inputs);

        // Combine both contexts
        return {
          recent_history: bufferContext.chat_history,
          relevant_history: vectorContext.chat_history,
        };
      },

      async saveContext(inputs: any, outputs: any) {
        await bufferMemory.saveContext(inputs, outputs);
        await vectorMemory.saveContext(inputs, outputs);

        // Also save to PostgreSQL for persistence
        await this.saveToDatabaseAndNotion(inputs, outputs);
      },
    };
  }

  /**
   * Entity Memory
   * Tracks entities (patients, devices, trials) mentioned across conversation
   */
  async getEntityMemory() {
    const entityStore = await this.loadEntitiesFromDB();

    return {
      entities: entityStore,

      async extractAndStoreEntities(message: string) {
        // Use LLM to extract entities
        const prompt = `Extract key entities from this message. Return JSON array of entities with type and value.

        Types: patient_id, device_name, trial_id, study_name, drug_name, condition, regulatory_pathway

        Message: ${message}

        Format: [{"type": "device_name", "value": "SmartPump 3000", "context": "brief context"}]`;

        const response = await llm.invoke(prompt);
        const entities = JSON.parse(response.content as string);

        // Store entities
        for (const entity of entities) {
          entityStore.set(entity.value, {
            type: entity.type,
            value: entity.value,
            context: entity.context,
            firstMentioned: new Date(),
            lastMentioned: new Date(),
            mentionCount: (entityStore.get(entity.value)?.mentionCount || 0) + 1,
          });
        }

        // Persist to database
        await this.saveEntitiesToDB(entityStore);

        return entities;
      },

      async getEntity(entityValue: string) {
        return entityStore.get(entityValue);
      },

      async getAllEntities() {
        return Array.from(entityStore.values());
      },

      async getEntitiesByType(type: string) {
        return Array.from(entityStore.values()).filter((e) => e.type === type);
      },
    };
  }

  /**
   * Redis-backed Memory (for production scale)
   * Fast, distributed memory storage
   */
  async getRedisMemory() {
    // Only initialize if Redis is configured
    if (!process.env.UPSTASH_REDIS_URL) {
      console.warn('⚠️ Redis not configured, falling back to buffer memory');
      return this.getBufferWindowMemory();
    }

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    });

    const memoryKey = `chat:${this.sessionId}:history`;

    return {
      async loadMemoryVariables() {
        const messages = await redis.lrange(memoryKey, 0, -1);
        return {
          chat_history: messages.map((m: any) => {
            const parsed = JSON.parse(m);
            return parsed.role === 'user'
              ? new HumanMessage(parsed.content)
              : new AIMessage(parsed.content);
          }),
        };
      },

      async saveContext(inputs: any, outputs: any) {
        await redis.rpush(
          memoryKey,
          JSON.stringify({ role: 'user', content: inputs.input })
        );
        await redis.rpush(
          memoryKey,
          JSON.stringify({ role: 'assistant', content: outputs.output })
        );

        // Set expiry (7 days)
        await redis.expire(memoryKey, 7 * 24 * 60 * 60);
      },

      async clear() {
        await redis.del(memoryKey);
      },
    };
  }

  /**
   * Persistent PostgreSQL Storage
   */
  private async saveToDatabaseAndNotion(inputs: any, outputs: any) {
    // Save to PostgreSQL
    const { data: userMessage } = await supabase
      .from('chat_messages')
      .insert({
        session_id: this.sessionId,
        user_id: this.userId,
        agent_id: this.agentId,
        role: 'user',
        content: inputs.input,
      })
      .select()
      .single();

    const { data: assistantMessage } = await supabase
      .from('chat_messages')
      .insert({
        session_id: this.sessionId,
        user_id: this.userId,
        agent_id: this.agentId,
        role: 'assistant',
        content: outputs.output,
      })
      .select()
      .single();

    // Also save to vector store for semantic search
    await this.saveToVectorStore(inputs.input, outputs.output);
  }

  /**
   * Save to Vector Store for Semantic Memory Search
   */
  private async saveToVectorStore(userInput: string, assistantOutput: string) {
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'chat_memory_vectors',
    });

    await vectorStore.addDocuments([
      {
        pageContent: `User: ${userInput}\nAssistant: ${assistantOutput}`,
        metadata: {
          session_id: this.sessionId,
          user_id: this.userId,
          agent_id: this.agentId,
          created_at: new Date().toISOString(),
        },
      },
    ]);
  }

  /**
   * Load Entities from Database
   */
  private async loadEntitiesFromDB() {
    const { data: entities } = await supabase
      .from('conversation_entities')
      .select('*')
      .eq('session_id', this.sessionId);

    const entityMap = new Map();
    entities?.forEach((entity) => {
      entityMap.set(entity.value, entity);
    });

    return entityMap;
  }

  /**
   * Save Entities to Database
   */
  private async saveEntitiesToDB(entityStore: Map<string, any>) {
    const entities = Array.from(entityStore.values()).map((entity) => ({
      session_id: this.sessionId,
      user_id: this.userId,
      type: entity.type,
      value: entity.value,
      context: entity.context,
      first_mentioned: entity.firstMentioned,
      last_mentioned: entity.lastMentioned,
      mention_count: entity.mentionCount,
    }));

    await supabase.from('conversation_entities').upsert(entities, {
      onConflict: 'session_id,value',
    });
  }
}

/**
 * Memory Strategy Selector
 * Automatically selects best memory strategy based on conversation characteristics
 */
export async function selectMemoryStrategy(
  sessionId: string,
  userId: string,
  agentId: string,
  conversationType: 'short' | 'long' | 'technical' | 'research'
) {
  const manager = new MemoryManager(sessionId, userId, agentId);

  switch (conversationType) {
    case 'short':
      // Quick queries, limited context needed
      return manager.getBufferWindowMemory(5);

    case 'long':
      // Extended conversations, use buffer memory (vector store disabled due to missing match_chat_memory function)
      return manager.getBufferWindowMemory(20);

    case 'technical':
      // Technical discussions, need entity tracking
      const entityMemory = await manager.getEntityMemory();
      const bufferMemory = await manager.getBufferWindowMemory(10);
      return { buffer: bufferMemory, entities: entityMemory };

    case 'research':
      // Research queries, need semantic search
      return manager.getHybridMemory(10, 6);

    default:
      return manager.getBufferWindowMemory(10);
  }
}

/**
 * Create database table for chat memory vectors (run once)
 */
export async function setupChatMemoryVectorTable() {
  const { error } = await supabase.rpc('create_chat_memory_vectors_table');

  if (error) {
    console.error('Error creating chat memory vectors table:', error);
  } else {
    console.log('✅ Chat memory vectors table created');
  }
}

/**
 * Create database table for conversation entities (run once)
 */
export async function setupConversationEntitiesTable() {
  const { error } = await supabase.rpc('create_conversation_entities_table');

  if (error) {
    console.error('Error creating conversation entities table:', error);
  } else {
    console.log('✅ Conversation entities table created');
  }
}
