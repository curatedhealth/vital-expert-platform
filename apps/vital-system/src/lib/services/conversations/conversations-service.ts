/**
 * Conversations Service
 * 
 * Manages user conversations in the database (replaces localStorage)
 * Similar architecture to UserAgentsService
 */

import { createClient } from '@supabase/supabase-js';
import { createLogger } from '../observability/structured-logger';
import {
  DatabaseConnectionError,
  ConversationOperationError,
} from '../../errors/agent-errors';

export interface Conversation {
  id: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
  }>;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  userId?: string;
  agentId?: string;
  mode?: string;
}

export interface ConversationRecord {
  id: string;
  user_id: string;
  tenant_id?: string;
  title: string;
  messages: any; // JSONB in database
  agent_id?: string;
  mode?: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface MigrationResult {
  success: boolean;
  migrated: number;
  errors: number;
  errorDetails?: string[];
}

export class ConversationsService {
  private supabase: ReturnType<typeof createClient> | null = null;
  private logger;

  constructor() {
    // Lazy initialization - don't throw on missing env vars
    // Will be checked when actually used
    this.logger = createLogger();
    
    // Try to initialize if env vars are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
  }

  /**
   * Initialize Supabase client if not already initialized
   */
  private ensureInitialized(): void {
    if (!this.supabase) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration missing for ConversationsService. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
      }

      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    this.ensureInitialized();
    
    const operationId = `get_conversations_${Date.now()}`;
    const startTime = Date.now();

    this.logger.info('conversations_fetch_started', {
      operation: 'getUserConversations',
      operationId,
      userId,
    });

    try {
      const { data, error } = await this.supabase
        .from('user_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array (graceful degradation)
        if (error.code === '42P01') {
          this.logger.warn('conversations_table_not_found', {
            operationId,
            userId,
            fallback: 'empty_array',
          });
          return [];
        }

        throw new DatabaseConnectionError('Failed to fetch conversations', {
          cause: error as Error,
          context: { userId, operationId },
        });
      }

      const conversations: Conversation[] = (data || []).map((record: ConversationRecord) => ({
        id: record.id,
        title: record.title,
        messages: record.messages || [],
        createdAt: new Date(record.created_at).getTime(),
        updatedAt: new Date(record.updated_at).getTime(),
        isPinned: record.is_pinned || false,
        userId: record.user_id,
        agentId: record.agent_id,
        mode: record.mode,
      }));

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('conversations_fetched', duration, {
        operation: 'getUserConversations',
        operationId,
        userId,
        count: conversations.length,
      });

      return conversations;
    } catch (error) {
      this.logger.error(
        'conversations_fetch_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'getUserConversations', operationId, userId }
      );
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    userId: string,
    conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Conversation> {
    this.ensureInitialized();
    
    const operationId = `create_conversation_${Date.now()}`;
    const startTime = Date.now();

    this.logger.info('conversation_create_started', {
      operation: 'createConversation',
      operationId,
      userId,
      title: conversation.title,
    });

    try {
      const now = new Date().toISOString();
      
      const { data, error } = await this.supabase
        .from('user_conversations')
        .insert({
          user_id: userId,
          title: conversation.title || 'New Conversation',
          messages: conversation.messages || [],
          agent_id: conversation.agentId || null,
          mode: conversation.mode || null,
          is_pinned: conversation.isPinned || false,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist - simulate success with in-memory fallback
          this.logger.warn('conversations_table_not_found', {
            operationId,
            userId,
            fallback: 'in_memory',
          });
          
          // Return a mock conversation (will be lost on refresh, but app won't crash)
          return {
            id: `temp_${Date.now()}`,
            title: conversation.title || 'New Conversation',
            messages: conversation.messages || [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isPinned: conversation.isPinned,
            userId,
            agentId: conversation.agentId,
            mode: conversation.mode,
          };
        }

        throw new DatabaseConnectionError('Failed to create conversation', {
          cause: error as Error,
          context: { userId, operationId },
        });
      }

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('conversation_created', duration, {
        operation: 'createConversation',
        operationId,
        userId,
        conversationId: data.id,
      });

      return {
        id: data.id,
        title: data.title,
        messages: data.messages || [],
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
        isPinned: data.is_pinned || false,
        userId: data.user_id,
        agentId: data.agent_id,
        mode: data.mode,
      };
    } catch (error) {
      this.logger.error(
        'conversation_create_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'createConversation', operationId, userId }
      );
      throw error;
    }
  }

  /**
   * Update an existing conversation
   */
  async updateConversation(
    userId: string,
    conversationId: string,
    updates: Partial<Pick<Conversation, 'title' | 'messages' | 'isPinned' | 'agentId' | 'mode'>>
  ): Promise<Conversation> {
    this.ensureInitialized();
    
    const operationId = `update_conversation_${Date.now()}`;
    const startTime = Date.now();

    this.logger.info('conversation_update_started', {
      operation: 'updateConversation',
      operationId,
      userId,
      conversationId,
    });

    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.messages !== undefined) updateData.messages = updates.messages;
      if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;
      if (updates.agentId !== undefined) updateData.agent_id = updates.agentId;
      if (updates.mode !== undefined) updateData.mode = updates.mode;

      const { data, error } = await this.supabase
        .from('user_conversations')
        .update(updateData)
        .eq('id', conversationId)
        .eq('user_id', userId) // Security: ensure user owns this conversation
        .select()
        .single();

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist - return success (fallback to in-memory)
          this.logger.warn('conversations_table_not_found', {
            operationId,
            userId,
            conversationId,
            fallback: 'in_memory',
          });
          // In-memory update would be handled by component state
          throw new ConversationOperationError('Conversations table not initialized', {
            context: { userId, conversationId },
          });
        }

        throw new DatabaseConnectionError('Failed to update conversation', {
          cause: error as Error,
          context: { userId, conversationId, operationId },
        });
      }

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('conversation_updated', duration, {
        operation: 'updateConversation',
        operationId,
        userId,
        conversationId,
      });

      return {
        id: data.id,
        title: data.title,
        messages: data.messages || [],
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
        isPinned: data.is_pinned || false,
        userId: data.user_id,
        agentId: data.agent_id,
        mode: data.mode,
      };
    } catch (error) {
      this.logger.error(
        'conversation_update_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'updateConversation', operationId, userId, conversationId }
      );
      throw error;
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    this.ensureInitialized();
    
    const operationId = `delete_conversation_${Date.now()}`;
    const startTime = Date.now();

    this.logger.info('conversation_delete_started', {
      operation: 'deleteConversation',
      operationId,
      userId,
      conversationId,
    });

    try {
      const { error } = await this.supabase
        .from('user_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', userId); // Security: ensure user owns this conversation

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist - log but don't fail
          this.logger.warn('conversations_table_not_found', {
            operationId,
            userId,
            conversationId,
            fallback: 'noop',
          });
          return;
        }

        throw new DatabaseConnectionError('Failed to delete conversation', {
          cause: error as Error,
          context: { userId, conversationId, operationId },
        });
      }

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('conversation_deleted', duration, {
        operation: 'deleteConversation',
        operationId,
        userId,
        conversationId,
      });
    } catch (error) {
      this.logger.error(
        'conversation_delete_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'deleteConversation', operationId, userId, conversationId }
      );
      throw error;
    }
  }

  /**
   * Migrate conversations from localStorage to database
   */
  async migrateFromLocalStorage(userId: string): Promise<MigrationResult> {
    // For migration, we can proceed even if Supabase isn't configured
    // (it will fail gracefully when trying to insert)
    if (typeof window === 'undefined') {
      return { success: true, migrated: 0, errors: 0 };
    }

    try {
      this.ensureInitialized();
    } catch (error) {
      // If Supabase isn't configured, just return success with no migration
      this.logger.warn('conversations_migration_skipped_no_supabase', {
        userId,
        reason: 'Supabase not configured',
      });
      return { success: true, migrated: 0, errors: 0 };
    }
    
    const operationId = `migrate_conversations_${Date.now()}`;
    const startTime = Date.now();

    this.logger.info('conversations_migration_started', {
      operation: 'migrateFromLocalStorage',
      operationId,
      userId,
    });

    try {
      const saved = localStorage.getItem('vital-conversations');
      if (!saved) {
        this.logger.info('conversations_migration_no_data', {
          operationId,
          userId,
        });
        return { success: true, migrated: 0, errors: 0 };
      }

      const conversations: Conversation[] = JSON.parse(saved);
      if (!Array.isArray(conversations) || conversations.length === 0) {
        return { success: true, migrated: 0, errors: 0 };
      }

      let migrated = 0;
      let errors = 0;
      const errorDetails: string[] = [];

      // Batch insert conversations
      const conversationsToCreate = conversations.map((conv) => ({
        user_id: userId,
        title: conv.title || 'New Conversation',
        messages: conv.messages || [],
        agent_id: conv.agentId || null,
        mode: conv.mode || null,
        is_pinned: conv.isPinned || false,
        created_at: new Date(conv.createdAt || Date.now()).toISOString(),
        updated_at: new Date(conv.updatedAt || Date.now()).toISOString(),
      }));

      // Try to insert all at once
      const { data, error } = await this.supabase
        .from('user_conversations')
        .insert(conversationsToCreate)
        .select();

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist - can't migrate
          this.logger.warn('conversations_migration_table_not_found', {
            operationId,
            userId,
            message: 'Table not initialized, skipping migration',
          });
          return {
            success: false,
            migrated: 0,
            errors: conversations.length,
            errorDetails: ['Table user_conversations does not exist. Please run migration.'],
          };
        }

        // Fallback: try one by one
        this.logger.warn('conversations_migration_batch_failed', {
          operationId,
          userId,
          error: error.message,
          fallback: 'one_by_one',
        });

        for (const conv of conversations) {
          try {
            await this.createConversation(userId, {
              title: conv.title,
              messages: conv.messages,
              isPinned: conv.isPinned,
              agentId: conv.agentId,
              mode: conv.mode,
            });
            migrated++;
          } catch (err) {
            errors++;
            errorDetails.push(`Failed to migrate conversation ${conv.id}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      } else {
        migrated = data?.length || 0;
      }

      // Clear localStorage on success
      if (migrated > 0 && errors === 0) {
        localStorage.removeItem('vital-conversations');
        localStorage.removeItem('vital-conversations-copy');
        this.logger.info('conversations_migration_localStorage_cleared', {
          operationId,
          userId,
        });
      }

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('conversations_migration_completed', duration, {
        operation: 'migrateFromLocalStorage',
        operationId,
        userId,
        migrated,
        errors,
      });

      return {
        success: errors === 0,
        migrated,
        errors,
        errorDetails: errors > 0 ? errorDetails : undefined,
      };
    } catch (error) {
      this.logger.error(
        'conversations_migration_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'migrateFromLocalStorage', operationId, userId }
      );
      return {
        success: false,
        migrated: 0,
        errors: 1,
        errorDetails: [error instanceof Error ? error.message : String(error)],
      };
    }
  }
}

// Export singleton instance
export const conversationsService = new ConversationsService();

