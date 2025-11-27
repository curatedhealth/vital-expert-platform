/**
 * Agent Memory Service
 *
 * Stores and retrieves lightweight agent memories (personalization notes,
 * conversation highlights, validated guidance) in Supabase.
 *
 * Memories are appended after successful interactions and replayed as part of
 * the system prompt on subsequent requests.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/environment';
import { StructuredLogger, LogLevel } from '@/lib/services/observability/structured-logger';

export interface AgentMemoryRecord {
  id: string;
  agent_id: string;
  summary: string;
  details?: string | null;
  created_at: string;
}

export interface AgentMemoryInput {
  summary: string;
  details?: string;
  metadata?: Record<string, unknown>;
}

class AgentMemoryService {
  private supabase;
  private logger: StructuredLogger;

  constructor() {
    const config = env.get();
    const url = config.NEXT_PUBLIC_SUPABASE_URL;
    const key = config.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      console.warn('⚠️ [AgentMemoryService] Supabase configuration missing, some features may be disabled');
      this.supabase = null as any;
    } else {
      this.supabase = createClient(url, key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }

    this.logger = new StructuredLogger({
      minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
    });
  }

  /**
   * Load recent memories for an agent.
   */
  async getAgentMemory(agentId: string, limit = 5): Promise<AgentMemoryRecord[]> {
    try {
      const { data, error } = await this.supabase
        .from('agent_memories')
        .select('id, agent_id, summary, details, created_at')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.logger.warn('Failed to load agent memory', { agentId }, error);
        return [];
      }

      return data || [];
    } catch (error) {
      this.logger.warn('Unexpected error loading agent memory', { agentId }, error as Error);
      return [];
    }
  }

  /**
   * Append a memory entry. Fire-and-forget – callers should not await unless needed.
   */
  async addMemory(agentId: string, input: AgentMemoryInput): Promise<void> {
    if (!input.summary || input.summary.trim().length === 0) {
      return;
    }

    try {
      const payload = {
        agent_id: agentId,
        summary: input.summary.trim().substring(0, 500),
        details: input.details ? input.details.substring(0, 2000) : null,
        metadata: input.metadata || {},
      };

      const { error } = await this.supabase.from('agent_memories').insert(payload);
      if (error) {
        this.logger.warn('Failed to insert agent memory', { agentId }, error);
      }
    } catch (error) {
      this.logger.warn('Unexpected error inserting agent memory', { agentId }, error as Error);
    }
  }
}

const agentMemoryService = new AgentMemoryService();

export function getAgentMemoryService(): AgentMemoryService {
  return agentMemoryService;
}

