/**
 * Message Manager Service
 * 
 * Manages message storage and retrieval for Mode 1 conversations
 * Handles structured message storage with metadata, cost tracking, and history management
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface MessageMetadata {
  cost?: number;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  thinking_steps?: Array<{
    step: string;
    description: string;
    timestamp: string;
  }>;
  tools_used?: Array<{
    tool_name: string;
    input: Record<string, any>;
    output: any;
    duration_ms: number;
  }>;
  rag_sources?: Array<{
    id: string;
    title: string;
    url?: string;
    similarity: number;
  }>;
  model?: string;
  [key: string]: any;
}

export interface SaveMessageParams {
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent_id?: string;
  metadata?: MessageMetadata;
  tokens?: number;
  cost?: number;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent_id?: string;
  metadata: MessageMetadata;
  tokens?: number;
  cost?: number;
  created_at: string;
}

export class MessageManager {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Save a message to the database
   */
  async saveMessage(params: SaveMessageParams): Promise<Message> {
    const { data, error } = await this.supabase
      .from('ask_expert_messages')
      .insert({
        session_id: params.session_id,
        role: params.role,
        content: params.content,
        agent_id: params.agent_id,
        metadata: params.metadata || {},
        tokens: params.tokens,
        cost: params.cost,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save message: ${error.message}`);
    }

    return this.mapToMessage(data);
  }

  /**
   * Get messages for a session (with pagination)
   */
  async getMessages(
    sessionId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('ask_expert_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }

    return (data || []).map((msg) => this.mapToMessage(msg));
  }

  /**
   * Get conversation history formatted for LLM (last N turns)
   */
  async getConversationHistory(
    sessionId: string,
    limit: number = 10
  ): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
    const messages = await this.getMessages(sessionId, limit * 2, 0);

    return messages
      .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
  }

  /**
   * Get message by ID
   */
  async getMessage(messageId: string): Promise<Message | null> {
    const { data, error } = await this.supabase
      .from('ask_expert_messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get message: ${error.message}`);
    }

    return this.mapToMessage(data);
  }

  /**
   * Update message metadata
   */
  async updateMessageMetadata(
    messageId: string,
    metadata: Partial<MessageMetadata>
  ): Promise<Message> {
    const { data: existing } = await this.supabase
      .from('ask_expert_messages')
      .select('metadata')
      .eq('id', messageId)
      .single();

    if (!existing) {
      throw new Error(`Message ${messageId} not found`);
    }

    const mergedMetadata = {
      ...(existing.metadata || {}),
      ...metadata,
    };

    const { data, error } = await this.supabase
      .from('ask_expert_messages')
      .update({ metadata: mergedMetadata })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update message metadata: ${error.message}`);
    }

    return this.mapToMessage(data);
  }

  /**
   * Delete messages for a session (cleanup)
   */
  async deleteSessionMessages(sessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('ask_expert_messages')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      throw new Error(`Failed to delete session messages: ${error.message}`);
    }
  }

  /**
   * Get message count for a session
   */
  async getMessageCount(sessionId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('ask_expert_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (error) {
      throw new Error(`Failed to get message count: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Summarize conversation history for long conversations
   * Returns summary + recent messages for context window management
   */
  async getSummarizedHistory(
    sessionId: string,
    maxRecentTurns: number = 5
  ): Promise<{
    summary: string;
    recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
    totalMessages: number;
  }> {
    const allMessages = await this.getMessages(sessionId, 100, 0);
    const totalMessages = allMessages.length;

    if (totalMessages <= maxRecentTurns * 2) {
      // Short conversation, return as-is
      return {
        summary: '',
        recentMessages: allMessages
          .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
          .slice(-maxRecentTurns * 2)
          .map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
        totalMessages,
      };
    }

    // Long conversation - summarize early messages, keep recent
    const recentMessages = allMessages
      .slice(-maxRecentTurns * 2)
      .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    const earlyMessages = allMessages.slice(0, -maxRecentTurns * 2);
    const summary = this.generateSummary(earlyMessages);

    return {
      summary,
      recentMessages,
      totalMessages,
    };
  }

  /**
   * Generate a summary of early conversation messages
   */
  private generateSummary(messages: Message[]): string {
    const userMessages = messages
      .filter((msg) => msg.role === 'user')
      .map((msg) => msg.content.substring(0, 100))
      .join('; ');

    return `Previous conversation context (${messages.length} messages): ${userMessages.substring(0, 500)}...`;
  }

  /**
   * Map database record to Message
   */
  private mapToMessage(data: any): Message {
    return {
      id: data.id,
      session_id: data.session_id,
      role: data.role,
      content: data.content,
      agent_id: data.agent_id,
      metadata: data.metadata || {},
      tokens: data.tokens,
      cost: data.cost,
      created_at: data.created_at,
    };
  }
}

