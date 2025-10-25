/**
 * Verification Storage Service
 *
 * Manages storage and retrieval of verification visualizations
 * Supports both database storage and in-memory caching
 */

import { createClient } from '@supabase/supabase-js';

export interface StoredVerification {
  id: string;
  extraction_run_id: string;
  html_content: string;
  metadata: {
    total_entities: number;
    avg_confidence: number;
    entity_types: Record<string, number>;
    created_at: string;
  };
  created_at: string;
  expires_at: string;
  accessed_count: number;
  last_accessed_at: string | null;
}

class VerificationStorageService {
  private cache: Map<string, StoredVerification> = new Map();
  private readonly DEFAULT_EXPIRY_DAYS = 30;

  /**
   * Store verification visualization
   */
  async store(params: {
    id: string;
    extraction_run_id: string;
    html_content: string;
    metadata: StoredVerification['metadata'];
    expiryDays?: number;
  }): Promise<StoredVerification> {
    const expiryDays = params.expiryDays || this.DEFAULT_EXPIRY_DAYS;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);

    const verification: StoredVerification = {
      id: params.id,
      extraction_run_id: params.extraction_run_id,
      html_content: params.html_content,
      metadata: params.metadata,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      accessed_count: 0,
      last_accessed_at: null
    };

    // Store in cache
    this.cache.set(params.id, verification);

    // Store in database
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase
          .from('verification_visualizations')
          .upsert({
            id: verification.id,
            extraction_run_id: verification.extraction_run_id,
            html_content: verification.html_content,
            metadata: verification.metadata,
            created_at: verification.created_at,
            expires_at: verification.expires_at,
            accessed_count: verification.accessed_count,
            last_accessed_at: verification.last_accessed_at
          });
      }
    } catch (error) {
      console.error('Failed to store verification in database:', error);
      // Continue - cache storage is sufficient
    }

    return verification;
  }

  /**
   * Retrieve verification visualization
   */
  async retrieve(id: string): Promise<StoredVerification | null> {
    // Check cache first
    let verification = this.cache.get(id);

    if (verification) {
      // Check if expired
      if (new Date() > new Date(verification.expires_at)) {
        this.cache.delete(id);
        await this.deleteFromDatabase(id);
        return null;
      }

      // Update access tracking
      verification.accessed_count++;
      verification.last_accessed_at = new Date().toISOString();
      this.cache.set(id, verification);
      await this.updateAccessTracking(id, verification.accessed_count, verification.last_accessed_at);

      return verification;
    }

    // Fallback to database
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return null;
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data, error } = await supabase
        .from('verification_visualizations')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      verification = data as StoredVerification;

      // Check if expired
      if (new Date() > new Date(verification.expires_at)) {
        await this.deleteFromDatabase(id);
        return null;
      }

      // Update access tracking
      verification.accessed_count++;
      verification.last_accessed_at = new Date().toISOString();

      // Add to cache
      this.cache.set(id, verification);
      await this.updateAccessTracking(id, verification.accessed_count, verification.last_accessed_at);

      return verification;
    } catch (error) {
      console.error('Failed to retrieve verification from database:', error);
      return null;
    }
  }

  /**
   * List all verifications for an extraction run
   */
  async listByExtractionRun(extractionRunId: string): Promise<StoredVerification[]> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        // Fallback to cache
        return Array.from(this.cache.values()).filter(
          v => v.extraction_run_id === extractionRunId
        );
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data, error } = await supabase
        .from('verification_visualizations')
        .select('*')
        .eq('extraction_run_id', extractionRunId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as StoredVerification[];
    } catch (error) {
      console.error('Failed to list verifications:', error);
      // Fallback to cache
      return Array.from(this.cache.values()).filter(
        v => v.extraction_run_id === extractionRunId
      );
    }
  }

  /**
   * Delete verification
   */
  async delete(id: string): Promise<void> {
    this.cache.delete(id);
    await this.deleteFromDatabase(id);
  }

  /**
   * Delete expired verifications (cleanup task)
   */
  async cleanupExpired(): Promise<number> {
    let deletedCount = 0;

    // Cleanup cache
    const now = new Date();
    for (const [id, verification] of this.cache.entries()) {
      if (now > new Date(verification.expires_at)) {
        this.cache.delete(id);
        deletedCount++;
      }
    }

    // Cleanup database
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data, error } = await supabase
          .from('verification_visualizations')
          .delete()
          .lt('expires_at', now.toISOString())
          .select('id');

        if (!error && data) {
          deletedCount += data.length;
        }
      }
    } catch (error) {
      console.error('Failed to cleanup database:', error);
    }

    return deletedCount;
  }

  /**
   * Get statistics about stored verifications
   */
  async getStats(): Promise<{
    total: number;
    expired: number;
    active: number;
    totalAccesses: number;
    avgAccessesPerVisualization: number;
  }> {
    const now = new Date();
    let total = 0;
    let expired = 0;
    let active = 0;
    let totalAccesses = 0;

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data, error } = await supabase
          .from('verification_visualizations')
          .select('expires_at, accessed_count');

        if (!error && data) {
          total = data.length;
          for (const item of data) {
            if (new Date(item.expires_at) < now) {
              expired++;
            } else {
              active++;
            }
            totalAccesses += item.accessed_count || 0;
          }
        }
      }
    } catch (error) {
      console.error('Failed to get stats from database:', error);
      // Fallback to cache
      for (const verification of this.cache.values()) {
        total++;
        if (now > new Date(verification.expires_at)) {
          expired++;
        } else {
          active++;
        }
        totalAccesses += verification.accessed_count;
      }
    }

    return {
      total,
      expired,
      active,
      totalAccesses,
      avgAccessesPerVisualization: total > 0 ? totalAccesses / total : 0
    };
  }

  /**
   * Private helper: Update access tracking in database
   */
  private async updateAccessTracking(
    id: string,
    accessedCount: number,
    lastAccessedAt: string
  ): Promise<void> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase
          .from('verification_visualizations')
          .update({
            accessed_count: accessedCount,
            last_accessed_at: lastAccessedAt
          })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Failed to update access tracking:', error);
    }
  }

  /**
   * Private helper: Delete from database
   */
  private async deleteFromDatabase(id: string): Promise<void> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase
          .from('verification_visualizations')
          .delete()
          .eq('id', id);
      }
    } catch (error) {
      console.error('Failed to delete from database:', error);
    }
  }
}

// Export singleton instance
export const verificationStorageService = new VerificationStorageService();
