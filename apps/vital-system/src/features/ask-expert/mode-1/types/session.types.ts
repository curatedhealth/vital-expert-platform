/**
 * Mode 1 Session Types
 * 
 * Type definitions for conversation session management
 */

export interface AskExpertSession {
  id: string;
  tenant_id: string;
  user_id: string;
  agent_id: string;
  mode: 'mode_1_interactive_manual';
  status: 'active' | 'paused' | 'ended';
  metadata: Record<string, any>;
  total_messages: number;
  total_tokens: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
  ended_at?: string;
}

export interface CreateSessionParams {
  tenant_id: string;
  user_id: string;
  agent_id: string;
  metadata?: Record<string, any>;
}

export interface UpdateSessionStatsParams {
  message_count?: number;
  tokens?: number;
  cost?: number;
}

export interface SessionQueryParams {
  tenant_id?: string;
  user_id?: string;
  agent_id?: string;
  status?: AskExpertSession['status'];
  limit?: number;
  offset?: number;
}

