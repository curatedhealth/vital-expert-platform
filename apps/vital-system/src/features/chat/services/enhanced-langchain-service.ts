/**
 * @deprecated This service is deprecated and no longer used.
 * 
 * Enhanced LangChain Service - Complete Implementation
 * 
 * This service uses LangChain directly (ChatOpenAI, OpenAIEmbeddings), violating the Golden Rule.
 * All AI/ML services must be in Python and accessed via API Gateway.
 * 
 * RAG operations now use the Python AI Engine via API Gateway (Golden Rule compliant).
 * 
 * DO NOT USE: All RAG operations now go through API Gateway → Python AI Engine.
 * 
 * This file is kept for reference only and should be removed in a future cleanup.
 * 
 * Provides RAG, memory, and conversational chain capabilities
 */

import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { ChatOpenAI , OpenAIEmbeddings } from '@langchain/openai';
import { createClient } from '@supabase/supabase-js';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { BufferWindowMemory } from 'langchain/memory';

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

export class EnhancedLangChainService {
  private config: EnhancedLangChainConfig;
  private llm: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;
  private vectorStore: SupabaseVectorStore | null = null;
  private memory: Map<string, BufferWindowMemory> = new Map();
  private chains: Map<string, ConversationalRetrievalQAChain> = new Map();
  private supabase: any = null;

  constructor(config: EnhancedLangChainConfig) {
    this.config = config;
    
    // Initialize LLM
    this.llm = new ChatOpenAI({
      modelName: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize embeddings with latest model
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-large', // Use latest high-quality model
    });

    // Initialize Supabase if configured
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      try {
        // Initialize vector store
        this.vectorStore = new SupabaseVectorStore(this.embeddings, {
          client: this.supabase,
          tableName: 'knowledge_base_documents',
          queryName: 'match_documents',
        });
        console.log('✅ Enhanced LangChain service initialized with Supabase');
      } catch (error) {
        console.warn('⚠️ Failed to initialize vector store:', error);
      }
    } else {
      console.warn('⚠️ Supabase not configured - RAG features will be limited');
    }
  }

  /**
   * Query with conversational chain
   */
  async queryWithChain(
    question: string,
    agentId: string,
    sessionId: string,
    agent: any,
    userId: string
  ): Promise<QueryResult> {
    try {
      // Get or create memory for this session
      const memory = this.getOrCreateMemory(sessionId);
      
      // Get or create chain for this agent
      const chain = await this.getOrCreateChain(agentId, sessionId, agent);

      // Execute query
      const result = await chain.call({
        question,
        chat_history: memory.chatHistory,
      });

      // Update memory
      memory.saveContext(
        { input: question },
        { output: result.text }
      );

      // Extract sources and citations
      const sources = result.sourceDocuments || [];
      const citations = sources.map((doc: Document, index: number) => 
        `[${index + 1}] ${doc.metadata?.source || 'Unknown source'}`
      );

      return {
        answer: result.text,
        sources: sources.map((doc: Document) => ({
          content: doc.pageContent,
          metadata: doc.metadata,
        })),
        citations,
        tokenUsage: result.tokenUsage || {},
      };
    } catch (error) {
      console.error('Query with chain failed:', error);
      
      // Fallback to simple LLM call
      return this.fallbackQuery(question, agent);
    }
  }

  /**
   * Fallback query when chain fails
   */
  private async fallbackQuery(question: string, agent: any): Promise<QueryResult> {
    try {
      const systemPrompt = agent?.system_prompt || 
        'You are a helpful AI assistant specializing in medical device development and regulatory affairs.';
      
      const response = await this.llm.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ]);

      return {
        answer: response.content as string,
        sources: [],
        citations: [],
        tokenUsage: {},
      };
    } catch (error) {
      console.error('Fallback query failed:', error);
      return {
        answer: 'I apologize, but I encountered an error processing your request. Please try again.',
        sources: [],
        citations: [],
        tokenUsage: {},
      };
    }
  }

  /**
   * Get or create memory for session
   */
  private getOrCreateMemory(sessionId: string): BufferWindowMemory {
    if (!this.memory.has(sessionId)) {
      this.memory.set(sessionId, new BufferWindowMemory({
        k: 10, // Keep last 10 messages
        memoryKey: 'chat_history',
        returnMessages: true,
      }));
    }
    return this.memory.get(sessionId)!;
  }

  /**
   * Get or create chain for agent
   */
  private async getOrCreateChain(
    agentId: string,
    sessionId: string,
    agent: any
  ): Promise<ConversationalRetrievalQAChain> {
    const chainKey = `${agentId}-${sessionId}`;
    
    if (!this.chains.has(chainKey)) {
      const memory = this.getOrCreateMemory(sessionId);
      
      // Create retriever (use vector store if available, otherwise create a simple one)
      const retriever = this.vectorStore 
        ? this.vectorStore.asRetriever({ k: 5 })
        : this.createSimpleRetriever();

      // Create chain
      const chain = ConversationalRetrievalQAChain.fromLLM(
        this.llm,
        retriever,
        {
          memory,
          returnSourceDocuments: true,
          qaTemplate: this.buildQATemplate(agent),
        }
      );

      this.chains.set(chainKey, chain);
    }

    return this.chains.get(chainKey)!;
  }

  /**
   * Create a simple retriever when vector store is not available
   */
  private createSimpleRetriever() {
    return {
      getRelevantDocuments: async (query: string) => {
        // Return empty documents for now
        // In a real implementation, you might search a simple database
        return [];
      }
    };
  }

  /**
   * Build QA template for agent
   */
  private buildQATemplate(agent: any): string {
    const agentName = agent?.name || agent?.display_name || 'AI Assistant';
    const agentDescription = agent?.description || '';
    const systemPrompt = agent?.system_prompt || '';

    return `You are ${agentName}, ${agentDescription}

${systemPrompt}

Use the following pieces of context to answer the question at the end. If you don't know the answer based on the context, just say that you don't know, don't try to make up an answer.

Context:
{context}

Question: {question}
Helpful Answer:`;
  }

  /**
   * Load chat history into memory
   */
  async loadChatHistory(sessionId: string, chatHistory: any[]): Promise<void> {
    const memory = this.getOrCreateMemory(sessionId);
    
    // Clear existing memory
    memory.clear();
    
    // Load chat history
    for (const message of chatHistory) {
      if (message.role === 'user') {
        memory.chatHistory.push({ role: 'human', content: message.content });
      } else if (message.role === 'assistant') {
        memory.chatHistory.push({ role: 'ai', content: message.content });
      }
    }
  }

  /**
   * Get memory buffer for session
   */
  async getMemoryBuffer(sessionId: string): Promise<any> {
    const memory = this.memory.get(sessionId);
    return memory ? memory.chatHistory : [];
  }

  /**
   * Clear memory for session
   */
  clearMemory(sessionId: string): void {
    const memory = this.memory.get(sessionId);
    if (memory) {
      memory.clear();
    }
    this.memory.delete(sessionId);
  }

  /**
   * Clear chain for agent and session
   */
  clearChain(agentId: string, sessionId: string): void {
    const chainKey = `${agentId}-${sessionId}`;
    this.chains.delete(chainKey);
  }

  /**
   * Search knowledge base
   */
  async searchKnowledge(query: string, options?: { limit?: number }): Promise<{ chunks: any[] }> {
    if (!this.vectorStore) {
      return { chunks: [] };
    }

    try {
      const results = await this.vectorStore.similaritySearchWithScore(
        query,
        options?.limit || 5
      );

      return {
        chunks: results.map(([doc, score]) => ({
          content: doc.pageContent,
          metadata: doc.metadata,
          score,
        })),
      };
    } catch (error) {
      console.error('Knowledge search failed:', error);
      return { chunks: [] };
    }
  }

  /**
   * Process query (legacy method for compatibility)
   */
  async processQuery(query: string): Promise<{ answer: string; sources: string[] }> {
    const result = await this.fallbackQuery(query, {});
    return {
      answer: result.answer,
      sources: result.sources.map((s: any) => s.content),
    };
  }
}

// Create singleton instance
export const enhancedLangChainService = new EnhancedLangChainService({
  model: 'gpt-3.5-turbo',
  temperature: 0.1,
  maxTokens: 2000
});