/**
 * Domain-Specific RAG Service
 * 
 * Provides domain-specific RAG interfaces that feel like separate RAGs
 * while using a single efficient Pinecone namespace with metadata filtering.
 * 
 * Value Proposition: Show richness of knowledge domains while maintaining
 * operational efficiency of single namespace storage.
 */

import { pineconeVectorService } from '../vectorstore/pinecone-vector-service';
import { createClient } from '@supabase/supabase-js';

export interface DomainRAGQuery {
  text: string;
  domain: string | string[]; // Single domain or array for multi-domain
  topK?: number;
  minScore?: number;
  includeMetadata?: boolean;
}

export interface DomainRAGResult {
  content: string;
  similarity: number;
  domain: string;
  source_title?: string;
  chunk_id: string;
  document_id: string;
  metadata?: Record<string, any>;
}

export interface DomainRAGStats {
  domain: string;
  totalChunks: number;
  totalDocuments: number;
  lastUpdated?: Date;
  coverage?: {
    documents: number;
    chunks: number;
  };
}

export class DomainSpecificRAGService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials required');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Query a single domain's RAG
   * Returns results from only the specified domain
   */
  async queryDomainRAG(query: DomainRAGQuery): Promise<DomainRAGResult[]> {
    const domain = Array.isArray(query.domain) ? query.domain[0] : query.domain;
    
    const results = await pineconeVectorService.search({
      text: query.text,
      topK: query.topK || 10,
      minScore: query.minScore || 0.7,
      filter: {
        domain: { '$eq': domain }
      },
      namespace: 'domains-knowledge' // Named namespace for all knowledge chunks
    });

    return results.map(result => ({
      content: result.content,
      similarity: result.similarity,
      domain: result.domain || domain,
      source_title: result.source_title,
      chunk_id: result.chunk_id,
      document_id: result.document_id,
      metadata: result.metadata
    }));
  }

  /**
   * Query multiple domains simultaneously
   * Returns results ranked across all specified domains
   */
  async queryMultiDomainRAG(query: DomainRAGQuery): Promise<DomainRAGResult[]> {
    const domains = Array.isArray(query.domain) ? query.domain : [query.domain];
    
    // Build OR filter for multiple domains
    const domainFilter = domains.length === 1
      ? { domain: { '$eq': domains[0] } }
      : {
          '$or': domains.map(d => ({ domain: { '$eq': d } }))
        };

    const results = await pineconeVectorService.search({
      text: query.text,
      topK: query.topK || 20, // Higher for multi-domain
      minScore: query.minScore || 0.7,
      filter: domainFilter,
      namespace: 'domains-knowledge' // Named namespace for all knowledge chunks
    });

    // Group and rank by domain
    return results.map(result => ({
      content: result.content,
      similarity: result.similarity,
      domain: result.domain || 'unknown',
      source_title: result.source_title,
      chunk_id: result.chunk_id,
      document_id: result.document_id,
      metadata: result.metadata
    }));
  }

  /**
   * Get statistics for a specific domain
   * Shows richness and coverage of each domain
   */
  async getDomainStats(domain: string): Promise<DomainRAGStats> {
    // Query Supabase for domain stats
    const { data: documents, error: docError } = await this.supabase
      .from('knowledge_documents')
      .select('id', { count: 'exact', head: true })
      .eq('domain', domain)
      .eq('status', 'completed');

    const { data: chunks, error: chunkError } = await this.supabase
      .from('document_chunks')
      .select('id', { count: 'exact', head: true })
      .eq('knowledge_documents.domain', domain);

    if (docError || chunkError) {
      throw new Error(`Failed to get stats for domain ${domain}`);
    }

    // Get last updated timestamp
    const { data: lastDoc } = await this.supabase
      .from('knowledge_documents')
      .select('updated_at')
      .eq('domain', domain)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    return {
      domain,
      totalDocuments: documents?.length || 0,
      totalChunks: chunks?.length || 0,
      lastUpdated: lastDoc?.updated_at ? new Date(lastDoc.updated_at) : undefined,
      coverage: {
        documents: documents?.length || 0,
        chunks: chunks?.length || 0,
      }
    };
  }

  /**
   * Get statistics for all domains
   * Used to showcase domain richness
   */
  async getAllDomainsStats(): Promise<DomainRAGStats[]> {
    // Get all active domains
    const { data: domains, error } = await this.supabase
      .from('knowledge_domains')
      .select('slug, name')
      .eq('is_active', true);

    if (error || !domains) {
      throw new Error('Failed to fetch domains');
    }

    // Get stats for each domain
    const statsPromises = domains.map(d => this.getDomainStats(d.slug));
    const stats = await Promise.all(statsPromises);

    // Sort by total documents (most rich first)
    return stats.sort((a, b) => b.totalDocuments - a.totalDocuments);
  }

  /**
   * Get domain-specific RAG recommendations
   * Based on query, suggests which domains are most relevant
   */
  async recommendDomainsForQuery(query: string, topN: number = 3): Promise<string[]> {
    // Search across all domains with lower threshold
    const results = await pineconeVectorService.search({
      text: query,
      topK: 50, // Cast wider net
      minScore: 0.6, // Lower threshold for discovery
      namespace: ''
    });

    // Count domains in results
    const domainCounts: Record<string, number> = {};
    results.forEach(result => {
      if (result.domain) {
        domainCounts[result.domain] = (domainCounts[result.domain] || 0) + 1;
      }
    });

    // Sort by frequency and return top N
    const sorted = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([domain]) => domain);

    return sorted;
  }

  /**
   * Compare domains: Show which domains have content for a query
   * Useful for showing domain richness/comparison
   */
  async compareDomainsForQuery(query: string, domains: string[]): Promise<Record<string, number>> {
    // Query each domain and get result counts
    const comparisons: Record<string, number> = {};

    await Promise.all(
      domains.map(async (domain) => {
        try {
          const results = await this.queryDomainRAG({
            text: query,
            domain,
            topK: 10,
            minScore: 0.7
          });
          comparisons[domain] = results.length;
        } catch (error) {
          comparisons[domain] = 0;
        }
      })
    );

    return comparisons;
  }

  /**
   * Search with domain boost
   * Boosts results from preferred domains
   */
  async queryWithDomainBoost(
    query: string,
    preferredDomains: string[],
    options: { topK?: number; minScore?: number } = {}
  ): Promise<DomainRAGResult[]> {
    // Get results from all domains
    const allResults = await pineconeVectorService.search({
      text: query,
      topK: (options.topK || 10) * 2, // Get more to re-rank
      minScore: options.minScore || 0.6,
      namespace: ''
    });

    // Boost preferred domains
    const boosted = allResults.map(result => {
      const isPreferred = preferredDomains.includes(result.domain || '');
      const boost = isPreferred ? 1.2 : 1.0;
      
      return {
        ...result,
        similarity: Math.min(result.similarity * boost, 1.0), // Cap at 1.0
        boosted: isPreferred
      };
    });

    // Re-sort by boosted similarity
    boosted.sort((a, b) => b.similarity - a.similarity);

    // Return top K
    return boosted.slice(0, options.topK || 10).map(result => ({
      content: result.content,
      similarity: result.similarity,
      domain: result.domain || 'unknown',
      source_title: result.source_title,
      chunk_id: result.chunk_id,
      document_id: result.document_id,
      metadata: result.metadata
    }));
  }

  /**
   * Get domain coverage visualization data
   * For UI to show richness of each domain
   */
  async getDomainCoverage(): Promise<Array<{
    domain: string;
    domainName: string;
    tier: number;
    documents: number;
    chunks: number;
    coveragePercent: number;
    color?: string;
  }>> {
    const { data: domains } = await this.supabase
      .from('knowledge_domains')
      .select('slug, name, tier, color');

    if (!domains) return [];

    // Get total counts across all domains
    const { count: totalDocs } = await this.supabase
      .from('knowledge_documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Get stats for each domain
    const coverage = await Promise.all(
      domains.map(async (domain) => {
        const stats = await this.getDomainStats(domain.slug);
        const coveragePercent = totalDocs ? (stats.totalDocuments / totalDocs) * 100 : 0;

        return {
          domain: domain.slug,
          domainName: domain.name,
          tier: domain.tier,
          documents: stats.totalDocuments,
          chunks: stats.totalChunks,
          coveragePercent,
          color: domain.color
        };
      })
    );

    return coverage.sort((a, b) => b.documents - a.documents);
  }
}

// Export singleton instance
export const domainSpecificRAGService = new DomainSpecificRAGService();

