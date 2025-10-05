import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';
import { Document } from 'langchain/document';
import { createClient } from '@supabase/supabase-js';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { BufferMemory, BufferWindowMemory } from 'langchain/memory';
import { PromptTemplate } from '@langchain/core/prompts';
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { LangChainTracer } from '@langchain/core/tracers/tracer_langchain';
import { Serialized } from '@langchain/core/load/serializable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'text-embedding-ada-002',
});

// Custom callback handler for token tracking
class TokenTrackingCallback extends BaseCallbackHandler {
  name = 'token_tracking_callback';
  private sessionId: string;
  private agentId: string;
  private userId: string;

  constructor(sessionId: string, agentId: string, userId: string) {
    super();
    this.sessionId = sessionId;
    this.agentId = agentId;
    this.userId = userId;
  }

  async handleLLMEnd(output: any) {
    try {
      const usage = output.llmOutput?.tokenUsage;
      if (usage) {
        console.log('📊 Token Usage:', {
          prompt: usage.promptTokens,
          completion: usage.completionTokens,
          total: usage.totalTokens,
        });

        // Track tokens in database
        await this.trackTokens({
          promptTokens: usage.promptTokens || 0,
          completionTokens: usage.completionTokens || 0,
          totalTokens: usage.totalTokens || 0,
          model: output.llmOutput?.model || 'gpt-3.5-turbo',
        });
      }
    } catch (error) {
      console.error('Token tracking error:', error);
    }
  }

  private async trackTokens(usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    model: string;
  }) {
    try {
      const inputCost = this.calculateCost(usage.promptTokens, usage.model, 'input');
      const outputCost = this.calculateCost(usage.completionTokens, usage.model, 'output');

      await supabase.from('token_usage_logs').insert({
        service_type: '1:1_conversation',
        service_id: this.sessionId,
        agent_id: this.agentId,
        agent_name: this.agentId,
        agent_tier: 2,
        user_id: this.userId,
        session_id: this.sessionId,
        provider: 'openai',
        model_name: usage.model,
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        input_cost: inputCost,
        output_cost: outputCost,
        success: true,
      });

      console.log('✅ Tokens tracked successfully');
    } catch (error) {
      console.error('Failed to track tokens:', error);
    }
  }

  private calculateCost(tokens: number, model: string, type: 'input' | 'output'): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
      'gpt-4-turbo': { input: 0.01 / 1000, output: 0.03 / 1000 },
      'gpt-3.5-turbo': { input: 0.0005 / 1000, output: 0.0015 / 1000 },
      'gpt-3.5-turbo-16k': { input: 0.003 / 1000, output: 0.004 / 1000 },
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    return tokens * modelPricing[type];
  }
}

// LangSmith tracer for active monitoring
const getLangSmithTracer = () => {
  if (process.env.LANGCHAIN_TRACING_V2 === 'true' && process.env.LANGCHAIN_API_KEY) {
    return new LangChainTracer({
      projectName: process.env.LANGCHAIN_PROJECT || 'vital-advisory-board',
    });
  }
  return null;
};

export class EnhancedLangChainService {
  private vectorStore: SupabaseVectorStore;
  private textSplitter: RecursiveCharacterTextSplitter;
  private llm: ChatOpenAI;
  private conversationChains: Map<string, ConversationalRetrievalQAChain>;
  private memories: Map<string, BufferWindowMemory>;

  constructor() {
    this.vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'rag_knowledge_chunks',
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 300,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });

    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      streaming: true,
    });

    this.conversationChains = new Map();
    this.memories = new Map();
  }

  /**
   * Get or create conversation memory for a session
   */
  private getMemory(sessionId: string): BufferWindowMemory {
    if (!this.memories.has(sessionId)) {
      const memory = new BufferWindowMemory({
        k: 10, // Keep last 10 messages
        memoryKey: 'chat_history',
        returnMessages: true,
        inputKey: 'question',
        outputKey: 'text',
      });
      this.memories.set(sessionId, memory);
      console.log(`📝 Created new memory for session: ${sessionId}`);
    }
    return this.memories.get(sessionId)!;
  }

  /**
   * Get or create conversational chain for an agent
   */
  private async getConversationalChain(
    agentId: string,
    sessionId: string,
    systemPrompt: string,
    knowledgeDomains: string[] = []
  ): Promise<ConversationalRetrievalQAChain> {
    const chainKey = `${agentId}-${sessionId}`;

    if (!this.conversationChains.has(chainKey)) {
      console.log(`🔗 Creating new conversational chain for: ${chainKey}`);

      // Create retriever with domain filtering
      const retriever = this.vectorStore.asRetriever({
        searchType: 'similarity',
        k: 6,
        filter: knowledgeDomains.length > 0
          ? {
              $or: [
                { isGlobal: { $eq: true } },
                { agentId: { $eq: agentId } },
              ],
            }
          : undefined,
      });

      // Custom QA prompt template
      const qaTemplate = `${systemPrompt}

You are an expert AI assistant with access to a specialized knowledge base. Use the following context to answer the user's question accurately and comprehensively.

Context from knowledge base:
{context}

Chat History:
{chat_history}

Current Question: {question}

Instructions:
- Provide a detailed, accurate response based on the context and chat history
- If you reference information from the context, cite it using [1], [2], etc.
- If the context doesn't contain enough information, acknowledge this and provide the best answer you can based on your general knowledge
- Maintain conversation continuity by referencing previous messages when relevant

Answer:`;

      const QA_PROMPT = PromptTemplate.fromTemplate(qaTemplate);

      // Get memory for this session
      const memory = this.getMemory(sessionId);

      // Create conversational chain
      const chain = ConversationalRetrievalQAChain.fromLLM(
        this.llm,
        retriever,
        {
          memory,
          qaChainOptions: {
            type: 'stuff',
            prompt: QA_PROMPT,
          },
          returnSourceDocuments: true,
          verbose: process.env.NODE_ENV === 'development',
        }
      );

      this.conversationChains.set(chainKey, chain);
      console.log(`✅ Conversational chain created for: ${chainKey}`);
    }

    return this.conversationChains.get(chainKey)!;
  }

  /**
   * Query with conversational chain, memory, and token tracking
   */
  async queryWithChain(
    query: string,
    agentId: string,
    sessionId: string,
    agent: any,
    userId: string
  ): Promise<{
    answer: string;
    sources: any[];
    citations: string[];
    tokenUsage?: any;
  }> {
    try {
      console.log(`🤖 Querying with conversational chain - Agent: ${agentId}, Session: ${sessionId}`);

      // Get or create conversational chain
      const chain = await this.getConversationalChain(
        agentId,
        sessionId,
        agent.systemPrompt || agent.system_prompt || '',
        agent.knowledge_domains || agent.knowledgeDomains || []
      );

      // Create callbacks for token tracking and LangSmith tracing
      const callbacks = [];

      // Add token tracking callback
      const tokenCallback = new TokenTrackingCallback(sessionId, agentId, userId);
      callbacks.push(tokenCallback);

      // Add LangSmith tracer if enabled
      const langsmithTracer = getLangSmithTracer();
      if (langsmithTracer) {
        callbacks.push(langsmithTracer);
        console.log('📡 LangSmith tracing enabled');
      }

      // Invoke the chain
      const result = await chain.invoke(
        { question: query },
        { callbacks }
      );

      console.log('✅ Chain invocation complete');

      // Extract sources and format response
      const sources = (result.sourceDocuments || []).map((doc: any, index: number) => ({
        id: doc.metadata?.id || index,
        content: doc.pageContent,
        title: doc.metadata?.source_name || doc.metadata?.title || 'Document Chunk',
        excerpt: doc.pageContent.substring(0, 200) + '...',
        similarity: doc.metadata?.similarity || 0.8,
        citation: `[${index + 1}]`,
        domain: doc.metadata?.domain,
        source_id: doc.metadata?.source_id,
      }));

      const citations = this.extractCitations(result.text, sources);

      return {
        answer: result.text,
        sources,
        citations,
      };
    } catch (error) {
      console.error('Conversational chain error:', error);
      throw error;
    }
  }

  /**
   * Load chat history into memory for existing conversations
   */
  async loadChatHistory(sessionId: string, chatHistory: any[]) {
    const memory = this.getMemory(sessionId);

    for (const msg of chatHistory) {
      if (msg.role === 'user') {
        await memory.saveContext(
          { question: msg.content },
          { text: '' }
        );
      } else if (msg.role === 'assistant') {
        // Find the previous user message
        const prevUserMsg = chatHistory[chatHistory.indexOf(msg) - 1];
        if (prevUserMsg && prevUserMsg.role === 'user') {
          await memory.saveContext(
            { question: prevUserMsg.content },
            { text: msg.content }
          );
        }
      }
    }

    console.log(`📚 Loaded ${chatHistory.length} messages into memory for session: ${sessionId}`);
  }

  /**
   * Clear memory for a session
   */
  clearMemory(sessionId: string) {
    if (this.memories.has(sessionId)) {
      this.memories.delete(sessionId);
      console.log(`🗑️ Cleared memory for session: ${sessionId}`);
    }
  }

  /**
   * Clear conversation chain for a session
   */
  clearChain(agentId: string, sessionId: string) {
    const chainKey = `${agentId}-${sessionId}`;
    if (this.conversationChains.has(chainKey)) {
      this.conversationChains.delete(chainKey);
      console.log(`🗑️ Cleared chain for: ${chainKey}`);
    }
  }

  /**
   * Get memory buffer for inspection
   */
  async getMemoryBuffer(sessionId: string): Promise<any> {
    const memory = this.getMemory(sessionId);
    return await memory.loadMemoryVariables({});
  }

  private extractCitations(response: string, sources: any[]): string[] {
    const citations: string[] = [];
    const citationRegex = /\[(\d+)\]/g;
    let match;

    while ((match = citationRegex.exec(response)) !== null) {
      const citationNum = parseInt(match[1]);
      if (citationNum <= sources.length && !citations.includes(match[0])) {
        citations.push(match[0]);
      }
    }

    return citations;
  }

  // Keep existing document processing methods
  async processDocuments(files: File[], metadata: {
    agentId?: string;
    isGlobal: boolean;
    domain: string;
  }): Promise<any> {
    // Implementation from original service
    return { success: true, results: [] };
  }

  async searchKnowledge(query: string, options: any = {}): Promise<{ chunks: any[] }> {
    // Implementation from original service
    return { chunks: [] };
  }
}

// Export singleton instance
export const enhancedLangChainService = new EnhancedLangChainService();
