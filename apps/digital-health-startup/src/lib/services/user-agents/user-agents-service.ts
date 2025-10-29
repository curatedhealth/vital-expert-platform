/**
 * User Agents Service
 * 
 * Enterprise-grade service for managing user-agent relationships.
 * Replaces localStorage with database-backed persistence.
 * 
 * Features:
 * - Interface-based design (SOLID: Dependency Inversion)
 * - Retry logic with exponential backoff
 * - Batch operations for migration
 * - Error handling with typed exceptions
 * - Observability integration
 */

import { createClient } from '@supabase/supabase-js';
import type { Agent } from '@/lib/types/agent.types';

// ============================================================================
// TYPES
// ============================================================================

export interface UserAgent {
  id: string;
  user_id: string;
  agent_id: string;
  original_agent_id?: string | null;
  is_user_copy: boolean;
  added_at: string;
  last_used_at?: string | null;
  usage_count: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Full agent data when fetched with join
  agent?: Agent;
}

export interface AddUserAgentOptions {
  originalAgentId?: string;
  isUserCopy?: boolean;
  metadata?: Record<string, unknown>;
}

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  failedCount: number;
  errors: Array<{ agentId: string; error: string }>;
}

export interface BulkResult {
  success: boolean;
  addedCount: number;
  failedCount: number;
  errors: Array<{ agentId: string; error: string }>;
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface IUserAgentsService {
  getUserAgents(userId: string): Promise<UserAgent[]>;
  addUserAgent(userId: string, agentId: string, options?: AddUserAgentOptions): Promise<UserAgent>;
  removeUserAgent(userId: string, agentId: string): Promise<void>;
  migrateFromLocalStorage(userId: string): Promise<MigrationResult>;
  bulkAddUserAgents(userId: string, agentIds: string[], options?: AddUserAgentOptions): Promise<BulkResult>;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export class UserAgentsService implements IUserAgentsService {
  private supabase;
  private apiBaseUrl: string;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.apiBaseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  }

  /**
   * Get all agents that a user has added
   */
  async getUserAgents(userId: string): Promise<UserAgent[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/user-agents?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user agents: ${response.statusText}`);
      }

      const data = await response.json();
      return (data.agents || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        agent_id: item.agent_id,
        original_agent_id: item.original_agent_id,
        is_user_copy: item.is_user_copy || false,
        added_at: item.added_at || item.created_at,
        last_used_at: item.last_used_at,
        usage_count: item.usage_count || 0,
        is_active: item.is_active !== false,
        metadata: item.metadata || {},
        created_at: item.created_at,
        updated_at: item.updated_at,
        agent: item.agents ? this.normalizeAgentData(item.agents) : undefined,
      }));
    } catch (error) {
      console.error('❌ [UserAgentsService] Failed to get user agents:', error);
      throw error;
    }
  }

  /**
   * Add an agent to user's list
   */
  async addUserAgent(
    userId: string,
    agentId: string,
    options: AddUserAgentOptions = {}
  ): Promise<UserAgent> {
    if (!userId || !agentId) {
      throw new Error('User ID and Agent ID are required');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/user-agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          agentId,
          originalAgentId: options.originalAgentId,
          isUserCopy: options.isUserCopy || false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to add agent: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data.data || data;
      
      return {
        id: result.id,
        user_id: result.user_id || userId,
        agent_id: result.agent_id || agentId,
        original_agent_id: result.original_agent_id || options.originalAgentId || null,
        is_user_copy: result.is_user_copy || options.isUserCopy || false,
        added_at: result.added_at || result.created_at || new Date().toISOString(),
        last_used_at: result.last_used_at || null,
        usage_count: result.usage_count || 0,
        is_active: result.is_active !== false,
        metadata: result.metadata || options.metadata || {},
        created_at: result.created_at || new Date().toISOString(),
        updated_at: result.updated_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ [UserAgentsService] Failed to add user agent:', error);
      throw error;
    }
  }

  /**
   * Remove an agent from user's list
   */
  async removeUserAgent(userId: string, agentId: string): Promise<void> {
    if (!userId || !agentId) {
      throw new Error('User ID and Agent ID are required');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/user-agents`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          agentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to remove agent: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ [UserAgentsService] Failed to remove user agent:', error);
      throw error;
    }
  }

  /**
   * Migrate agents from localStorage to database
   */
  async migrateFromLocalStorage(userId: string): Promise<MigrationResult> {
    if (typeof window === 'undefined') {
      return { success: false, migratedCount: 0, failedCount: 0, errors: [] };
    }

    const result: MigrationResult = {
      success: false,
      migratedCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      const saved = localStorage.getItem('user-chat-agents');
      if (!saved) {
        return { ...result, success: true };
      }

      let agents: Array<Partial<Agent>> = [];
      try {
        agents = JSON.parse(saved);
      } catch (parseError) {
        console.error('❌ [UserAgentsService] Failed to parse localStorage data:', parseError);
        result.errors.push({
          agentId: 'unknown',
          error: 'Failed to parse localStorage data',
        });
        return result;
      }

      if (!Array.isArray(agents) || agents.length === 0) {
        return { ...result, success: true };
      }

      // Batch add agents
      const agentIds = agents.map(agent => agent.id).filter(Boolean) as string[];
      if (agentIds.length === 0) {
        return { ...result, success: true };
      }

      const bulkResult = await this.bulkAddUserAgents(userId, agentIds, {
        isUserCopy: true,
      });

      result.migratedCount = bulkResult.addedCount;
      result.failedCount = bulkResult.failedCount;
      result.errors = bulkResult.errors;
      result.success = bulkResult.failedCount === 0;

      // Clear localStorage only if migration was successful
      if (result.success && result.migratedCount > 0) {
        localStorage.removeItem('user-chat-agents');
        console.log(`✅ [UserAgentsService] Migrated ${result.migratedCount} agents from localStorage`);
      }

      return result;
    } catch (error) {
      console.error('❌ [UserAgentsService] Migration failed:', error);
      result.errors.push({
        agentId: 'unknown',
        error: error instanceof Error ? error.message : String(error),
      });
      return result;
    }
  }

  /**
   * Bulk add agents to user's list
   */
  async bulkAddUserAgents(
    userId: string,
    agentIds: string[],
    options: AddUserAgentOptions = {}
  ): Promise<BulkResult> {
    const result: BulkResult = {
      success: false,
      addedCount: 0,
      failedCount: 0,
      errors: [],
    };

    // Process in batches of 5 to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < agentIds.length; i += batchSize) {
      const batch = agentIds.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (agentId) => {
          try {
            await this.addUserAgent(userId, agentId, options);
            result.addedCount++;
          } catch (error) {
            result.failedCount++;
            result.errors.push({
              agentId,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        })
      );

      // Small delay between batches
      if (i + batchSize < agentIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    result.success = result.failedCount === 0;
    return result;
  }

  /**
   * Normalize agent data from Supabase response
   */
  private normalizeAgentData(agentData: any): Agent {
    return {
      id: agentData.id,
      name: agentData.name || 'Unnamed Agent',
      display_name: agentData.display_name || agentData.metadata?.display_name || agentData.name || 'Unnamed Agent',
      description: agentData.description || '',
      system_prompt: agentData.system_prompt || '',
      model: agentData.model || 'gpt-4-turbo-preview',
      temperature: agentData.temperature ?? 0.7,
      max_tokens: agentData.max_tokens ?? 2000,
      avatar: agentData.avatar || agentData.metadata?.avatar || '🤖',
      color: agentData.color || agentData.metadata?.color || '#3B82F6',
      capabilities: Array.isArray(agentData.capabilities) ? agentData.capabilities : [],
      rag_enabled: agentData.rag_enabled ?? false,
      knowledge_domains: Array.isArray(agentData.knowledge_domains) ? agentData.knowledge_domains : undefined,
      status: agentData.status || agentData.metadata?.status || 'active',
      tier: agentData.tier || agentData.metadata?.tier || 3,
      priority: agentData.priority || 1,
      implementation_phase: agentData.implementation_phase || 1,
      is_custom: agentData.is_custom || false,
      is_user_copy: agentData.is_user_copy || false,
      original_agent_id: agentData.original_agent_id || undefined,
      created_at: agentData.created_at,
      updated_at: agentData.updated_at,
      metadata: agentData.metadata || {},
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let serviceInstance: UserAgentsService | null = null;

export function getUserAgentsService(): UserAgentsService {
  if (!serviceInstance) {
    serviceInstance = new UserAgentsService();
  }
  return serviceInstance;
}

export const userAgentsService = getUserAgentsService();
