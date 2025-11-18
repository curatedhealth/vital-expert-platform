/**
 * Session Manager Service
 * 
 * Manages conversation sessions for Mode 1: Interactive Manual
 * Handles session creation, retrieval, updates, and expiration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  AskExpertSession,
  CreateSessionParams,
  UpdateSessionStatsParams,
  SessionQueryParams,
} from '../types/session.types';

export class SessionManager {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new conversation session
   */
  async createSession(params: CreateSessionParams): Promise<AskExpertSession> {
    const { data, error } = await this.supabase
      .from('ask_expert_sessions')
      .insert({
        tenant_id: params.tenant_id,
        user_id: params.user_id,
        agent_id: params.agent_id,
        mode: 'mode_1_interactive_manual',
        status: 'active',
        metadata: params.metadata || {},
        total_messages: 0,
        total_tokens: 0,
        total_cost: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return this.mapToSession(data);
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<AskExpertSession | null> {
    const { data, error } = await this.supabase
      .from('ask_expert_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error(`Failed to get session: ${error.message}`);
    }

    return this.mapToSession(data);
  }

  /**
   * Get active session for user and agent
   */
  async getActiveSession(
    userId: string,
    agentId: string,
    tenantId?: string
  ): Promise<AskExpertSession | null> {
    let query = this.supabase
      .from('ask_expert_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('agent_id', agentId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get active session: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return null;
    }

    return this.mapToSession(data[0]);
  }

  /**
   * Update session statistics
   */
  async updateSessionStats(
    sessionId: string,
    updates: UpdateSessionStatsParams
  ): Promise<AskExpertSession> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.message_count !== undefined) {
      updateData.total_messages = updates.message_count;
    }

    if (updates.tokens !== undefined) {
      updateData.total_tokens = updates.tokens;
    }

    if (updates.cost !== undefined) {
      updateData.total_cost = updates.cost;
    }

    const { data, error } = await this.supabase
      .from('ask_expert_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update session stats: ${error.message}`);
    }

    return this.mapToSession(data);
  }

  /**
   * Load conversation history for a session (last N turns)
   */
  async loadConversationHistory(
    sessionId: string,
    limit: number = 10
  ): Promise<Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>> {
    const { data, error } = await this.supabase
      .from('ask_expert_messages')
      .select('role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(limit * 2); // Get pairs of user/assistant messages

    if (error) {
      throw new Error(`Failed to load conversation history: ${error.message}`);
    }

    return (data || []).map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.created_at,
    }));
  }

  /**
   * End a session
   */
  async endSession(sessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('ask_expert_sessions')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) {
      throw new Error(`Failed to end session: ${error.message}`);
    }
  }

  /**
   * Pause a session (for resumption later)
   */
  async pauseSession(sessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('ask_expert_sessions')
      .update({
        status: 'paused',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) {
      throw new Error(`Failed to pause session: ${error.message}`);
    }
  }

  /**
   * Resume a paused session
   */
  async resumeSession(sessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('ask_expert_sessions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) {
      throw new Error(`Failed to resume session: ${error.message}`);
    }
  }

  /**
   * Check and expire idle sessions (older than 30 minutes)
   */
  async expireIdleSessions(): Promise<number> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data, error } = await this.supabase
      .from('ask_expert_sessions')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('status', 'active')
      .lt('updated_at', thirtyMinutesAgo)
      .select();

    if (error) {
      console.error('Failed to expire idle sessions:', error);
      return 0;
    }

    return data?.length || 0;
  }

  /**
   * Query sessions with filters
   */
  async querySessions(params: SessionQueryParams): Promise<AskExpertSession[]> {
    let query = this.supabase.from('ask_expert_sessions').select('*');

    if (params.tenant_id) {
      query = query.eq('tenant_id', params.tenant_id);
    }

    if (params.user_id) {
      query = query.eq('user_id', params.user_id);
    }

    if (params.agent_id) {
      query = query.eq('agent_id', params.agent_id);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    query = query.order('created_at', { ascending: false });

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to query sessions: ${error.message}`);
    }

    return (data || []).map((s) => this.mapToSession(s));
  }

  /**
   * Map database record to AskExpertSession
   */
  private mapToSession(data: {
    id: string;
    tenant_id: string;
    user_id: string;
    agent_id: string;
    mode: string;
    status: string;
    metadata: Record<string, unknown> | null;
    total_messages: number;
    total_tokens: number;
    total_cost: number;
    created_at: string;
    updated_at: string;
    ended_at: string | null;
  }): AskExpertSession {
    return {
      id: data.id,
      tenant_id: data.tenant_id,
      user_id: data.user_id,
      agent_id: data.agent_id,
      mode: data.mode || 'mode_1_interactive_manual',
      status: data.status || 'active',
      metadata: data.metadata || {},
      total_messages: data.total_messages || 0,
      total_tokens: data.total_tokens || 0,
      total_cost: data.total_cost || 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      ended_at: data.ended_at,
    };
  }
}

