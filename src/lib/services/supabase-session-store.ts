/**
 * Supabase Session Store
 * Alternative to SQLite for session persistence in Vercel
 */

import { createClient } from '@supabase/supabase-js';

export interface SessionData {
  threadId: string;
  state: any;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class SupabaseSessionStore {
  private supabase: any;
  private tableName = 'session_store';

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase not configured for session store - using in-memory fallback');
      this.supabase = null;
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initializeTable();
  }

  private async initializeTable() {
    if (!this.supabase) return;

    try {
      // Create session store table if it doesn't exist
      const { error } = await this.supabase.rpc('create_session_store_table');
      if (error && !error.message.includes('already exists')) {
        console.warn('Failed to create session store table:', error.message);
      }
    } catch (error) {
      console.warn('Session store table initialization skipped:', error);
    }
  }

  async save(threadId: string, state: any, metadata?: Record<string, any>): Promise<void> {
    if (!this.supabase) {
      console.warn('Session store not available - data not persisted');
      return;
    }

    try {
      const sessionData: SessionData = {
        threadId,
        state,
        timestamp: new Date().toISOString(),
        metadata,
      };

      const { error } = await this.supabase
        .from(this.tableName)
        .upsert(sessionData, { onConflict: 'threadId' });

      if (error) {
        console.error('Failed to save session:', error);
      }
    } catch (error) {
      console.error('Session save error:', error);
    }
  }

  async load(threadId: string): Promise<any | null> {
    if (!this.supabase) {
      console.warn('Session store not available - returning null');
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('threadId', threadId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No session found
          return null;
        }
        console.error('Failed to load session:', error);
        return null;
      }

      return data?.state || null;
    } catch (error) {
      console.error('Session load error:', error);
      return null;
    }
  }

  async delete(threadId: string): Promise<void> {
    if (!this.supabase) {
      console.warn('Session store not available - delete skipped');
      return;
    }

    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('threadId', threadId);

      if (error) {
        console.error('Failed to delete session:', error);
      }
    } catch (error) {
      console.error('Session delete error:', error);
    }
  }

  async list(): Promise<SessionData[]> {
    if (!this.supabase) {
      console.warn('Session store not available - returning empty list');
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Failed to list sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Session list error:', error);
      return [];
    }
  }

  async cleanup(olderThanHours: number = 24): Promise<void> {
    if (!this.supabase) {
      console.warn('Session store not available - cleanup skipped');
      return;
    }

    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - olderThanHours);

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .lt('timestamp', cutoffTime.toISOString());

      if (error) {
        console.error('Failed to cleanup old sessions:', error);
      } else {
        console.log(`✅ Cleaned up sessions older than ${olderThanHours} hours`);
      }
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }
}

// Export singleton instance
export const sessionStore = new SupabaseSessionStore();
