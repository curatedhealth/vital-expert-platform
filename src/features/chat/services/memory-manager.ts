/**
 * Advanced Memory Manager for LangGraph
 * Provides persistent, scalable memory management
 */

import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { createClient } from '@supabase/supabase-js';

export interface MemorySession {
  sessionId: string;
  userId: string;
  messages: BaseMessage[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export class MemoryManager {
  private supabase: any;
  private memoryCache = new Map<string, MemorySession>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
  }

  /**
   * Get or create memory session
   */
  async getOrCreateSession(sessionId: string, userId: string): Promise<MemorySession> {
    // Check cache first
    const cached = this.memoryCache.get(sessionId);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    // Load from database
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('chat_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (data && !error) {
          const session: MemorySession = {
            sessionId: data.session_id,
            userId: data.user_id,
            messages: this.deserializeMessages(data.messages),
            metadata: data.metadata || {},
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
          
          this.memoryCache.set(sessionId, session);
          return session;
        }
      } catch (error) {
        console.warn('Failed to load session from database:', error);
      }
    }

    // Create new session
    const newSession: MemorySession = {
      sessionId,
      userId,
      messages: [],
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.memoryCache.set(sessionId, newSession);
    return newSession;
  }

  /**
   * Add message to session
   */
  async addMessage(sessionId: string, message: BaseMessage): Promise<void> {
    const session = await this.getOrCreateSession(sessionId, 'unknown');
    session.messages.push(message);
    session.updatedAt = new Date().toISOString();
    
    // Update cache
    this.memoryCache.set(sessionId, session);
    
    // Persist to database
    await this.persistSession(session);
  }

  /**
   * Get recent messages (last N messages)
   */
  async getRecentMessages(sessionId: string, limit: number = 10): Promise<BaseMessage[]> {
    const session = await this.getOrCreateSession(sessionId, 'unknown');
    return session.messages.slice(-limit);
  }

  /**
   * Clear session memory
   */
  async clearSession(sessionId: string): Promise<void> {
    this.memoryCache.delete(sessionId);
    
    if (this.supabase) {
      try {
        await this.supabase
          .from('chat_sessions')
          .delete()
          .eq('session_id', sessionId);
      } catch (error) {
        console.warn('Failed to clear session from database:', error);
      }
    }
  }

  /**
   * Persist session to database
   */
  private async persistSession(session: MemorySession): Promise<void> {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('chat_sessions')
        .upsert({
          session_id: session.sessionId,
          user_id: session.userId,
          messages: this.serializeMessages(session.messages),
          metadata: session.metadata,
          updated_at: session.updatedAt
        });

      if (error) {
        console.error('Failed to persist session:', error);
      }
    } catch (error) {
      console.error('Database persistence error:', error);
    }
  }

  /**
   * Serialize messages for database storage
   */
  private serializeMessages(messages: BaseMessage[]): any[] {
    return messages.map(msg => ({
      type: msg._getType(),
      content: msg.content,
      additional_kwargs: msg.additional_kwargs || {}
    }));
  }

  /**
   * Deserialize messages from database
   */
  private deserializeMessages(data: any[]): BaseMessage[] {
    return data.map(item => {
      if (item.type === 'human') {
        return new HumanMessage(item.content);
      } else {
        return new AIMessage(item.content);
      }
    });
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(session: MemorySession): boolean {
    const now = Date.now();
    const updated = new Date(session.updatedAt).getTime();
    return (now - updated) < this.CACHE_TTL;
  }
}

// Singleton instance
export const memoryManager = new MemoryManager();
