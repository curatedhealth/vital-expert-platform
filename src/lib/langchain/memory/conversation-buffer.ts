import { BufferWindowMemory } from "langchain/memory";
import { ConversationSummaryMemory } from "langchain/memory";
import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xazinxsiglqokwfmogyk.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.YourServiceRoleKeyHere'
);

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface MemoryConfig {
  bufferSize: number;
  summaryThreshold: number;
  useDatabase: boolean;
  sessionId: string;
}

export class HybridConversationMemory {
  private bufferMemory: BufferWindowMemory;
  private summaryMemory: ConversationSummaryMemory;
  private sessionId: string;
  private config: MemoryConfig;
  private llm: ChatOpenAI;
  
  constructor(sessionId: string, config: Partial<MemoryConfig> = {}) {
    this.sessionId = sessionId;
    this.config = {
      bufferSize: 10,
      summaryThreshold: 20,
      useDatabase: true,
      sessionId,
      ...config
    };
    
    // Initialize LLM for summarization
    this.llm = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.3,
      maxTokens: 1000
    });
    
    // Initialize buffer memory
    this.bufferMemory = new BufferWindowMemory({
      k: this.config.bufferSize,
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
      outputKey: "output"
    });
    
    // Initialize summary memory
    this.summaryMemory = new ConversationSummaryMemory({
      llm: this.llm,
      returnMessages: true,
      memoryKey: "conversation_summary",
      inputKey: "input",
      outputKey: "output"
    });
  }
  
  async loadFromDatabase(): Promise<ConversationMessage[]> {
    if (!this.config.useDatabase) {
      return [];
    }
    
    try {
      console.log(`📚 Loading conversation history for session: ${this.sessionId}`);
      
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('session_id', this.sessionId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ Failed to load conversation from database:', error);
        return [];
      }
      
      const messages: ConversationMessage[] = (data || []).map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        metadata: msg.metadata || {}
      }));
      
      console.log(`✅ Loaded ${messages.length} messages from database`);
      return messages;
      
    } catch (error) {
      console.error('❌ Error loading conversation from database:', error);
      return [];
    }
  }
  
  async saveToDatabase(message: ConversationMessage): Promise<void> {
    if (!this.config.useDatabase) {
      return;
    }
    
    try {
      await supabaseAdmin.from('messages').insert({
        session_id: this.sessionId,
        content: message.content,
        role: message.role,
        metadata: message.metadata || {},
        created_at: message.timestamp.toISOString()
      });
      
      console.log(`💾 Saved message to database: ${message.role}`);
      
    } catch (error) {
      console.error('❌ Failed to save message to database:', error);
    }
  }
  
  async addMessage(message: ConversationMessage): Promise<void> {
    // Save to database
    await this.saveToDatabase(message);
    
    // Add to buffer memory
    const baseMessage = message.role === 'user' 
      ? new HumanMessage(message.content)
      : new AIMessage(message.content);
    
    await this.bufferMemory.saveContext(
      { input: message.content },
      { output: message.content }
    );
    
    // Check if we need to create a summary
    const bufferMessages = await this.bufferMemory.loadMemoryVariables({});
    const messageCount = bufferMessages.chat_history?.length || 0;
    
    if (messageCount >= this.config.summaryThreshold) {
      await this.createSummary();
    }
  }
  
  async createSummary(): Promise<string> {
    try {
      console.log(`📝 Creating conversation summary for session: ${this.sessionId}`);
      
      const bufferMessages = await this.bufferMemory.loadMemoryVariables({});
      const messages = bufferMessages.chat_history || [];
      
      if (messages.length === 0) {
        return "";
      }
      
      // Create summary using the summary memory
      const summary = await this.summaryMemory.predictNewSummary(
        messages,
        "Please provide a concise summary of this conversation, focusing on key topics, decisions, and important information."
      );
      
      console.log(`✅ Created conversation summary`);
      return summary;
      
    } catch (error) {
      console.error('❌ Failed to create conversation summary:', error);
      return "";
    }
  }
  
  async getConversationHistory(): Promise<BaseMessage[]> {
    try {
      const bufferMessages = await this.bufferMemory.loadMemoryVariables({});
      return bufferMessages.chat_history || [];
    } catch (error) {
      console.error('❌ Failed to get conversation history:', error);
      return [];
    }
  }
  
  async getSummary(): Promise<string> {
    try {
      const summaryMessages = await this.summaryMemory.loadMemoryVariables({});
      return summaryMessages.conversation_summary || "";
    } catch (error) {
      console.error('❌ Failed to get conversation summary:', error);
      return "";
    }
  }
  
  async clearMemory(): Promise<void> {
    try {
      // Clear buffer memory
      await this.bufferMemory.clear();
      
      // Clear summary memory
      await this.summaryMemory.clear();
      
      // Clear from database if enabled
      if (this.config.useDatabase) {
        await supabaseAdmin
          .from('messages')
          .delete()
          .eq('session_id', this.sessionId);
      }
      
      console.log(`🗑️ Cleared all memory for session: ${this.sessionId}`);
      
    } catch (error) {
      console.error('❌ Failed to clear memory:', error);
    }
  }
  
  async getMemoryStats(): Promise<{
    bufferSize: number;
    summaryLength: number;
    totalMessages: number;
    lastActivity: Date | null;
  }> {
    try {
      const bufferMessages = await this.bufferMemory.loadMemoryVariables({});
      const summaryMessages = await this.summaryMemory.loadMemoryVariables({});
      
      const bufferSize = bufferMessages.chat_history?.length || 0;
      const summaryLength = summaryMessages.conversation_summary?.length || 0;
      
      // Get total message count from database
      let totalMessages = 0;
      if (this.config.useDatabase) {
        const { count } = await supabaseAdmin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', this.sessionId);
        
        totalMessages = count || 0;
      }
      
      // Get last activity
      let lastActivity: Date | null = null;
      if (this.config.useDatabase) {
        const { data } = await supabaseAdmin
          .from('messages')
          .select('created_at')
          .eq('session_id', this.sessionId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data) {
          lastActivity = new Date(data.created_at);
        }
      }
      
      return {
        bufferSize,
        summaryLength,
        totalMessages,
        lastActivity
      };
      
    } catch (error) {
      console.error('❌ Failed to get memory stats:', error);
      return {
        bufferSize: 0,
        summaryLength: 0,
        totalMessages: 0,
        lastActivity: null
      };
    }
  }
  
  async exportConversation(): Promise<{
    sessionId: string;
    messages: ConversationMessage[];
    summary: string;
    stats: any;
  }> {
    const messages = await this.loadFromDatabase();
    const summary = await this.getSummary();
    const stats = await this.getMemoryStats();
    
    return {
      sessionId: this.sessionId,
      messages,
      summary,
      stats
    };
  }
}

export default HybridConversationMemory;
