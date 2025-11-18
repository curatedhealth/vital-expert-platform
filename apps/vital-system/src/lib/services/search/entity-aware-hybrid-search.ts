/**
 * Entity-Aware Hybrid Search
 * Combines vector search, keyword search, and entity-based search
 * for medical/regulatory content with precise entity matching
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { embeddingService } from '../embeddings/openai-embedding-service';
import { pineconeVectorService } from '../vectorstore/pinecone-vector-service';

export interface EntityAwareSearchQuery {
  text: string;
  agentId?: string;
  userId?: string;
  domain?: string;
  phase?: string;
  maxResults?: number;
  similarityThreshold?: number;
  filters?: SearchFilters;
  strategy?: 'vector' | 'keyword' | 'entity' | 'hybrid';
}

export interface SearchFilters {
  organizationId?: string;
  domain?: string;
  tags?: string[];
  dateRange?: { start: Date; end: Date };
  entityTypes?: string[];
}

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  content: string;
  metadata: any;
  scores: {
    vector?: number;
    keyword?: number;
    entity?: number;
    combined: number;
  };
  matched_entities?: MatchedEntity[];
  source_title?: string;
  domain?: string;
}

export interface MatchedEntity {
  entity_id: string;
  entity_type: string;
  entity_text: string;
  match_type: 'exact' | 'partial' | 'semantic';
  confidence: number;
}

export interface QueryEntity {
  text: string;
  type: string;
  attributes: Record<string, any>;
  importance: number;
}

export class EntityAwareHybridSearch {
  private supabase: SupabaseClient;

  constructor(config?: { supabaseUrl?: string; supabaseKey?: string }) {
    this.supabase = createClient(
      config?.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      config?.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Main search method that routes to appropriate strategy
   */
  async search(query: EntityAwareSearchQuery): Promise<SearchResult[]> {
    const startTime = Date.now();
    const strategy = query.strategy || 'hybrid';

    console.log(`🔍 Performing ${strategy} search for: "${query.text.substring(0, 50)}..."`);

    try {
      let results: SearchResult[];

      switch (strategy) {
        case 'vector':
          results = await this.vectorSearch(query);
          break;
        case 'keyword':
          results = await this.keywordSearch(query);
          break;
        case 'entity':
          results = await this.entitySearch(query);
          break;
        case 'hybrid':
        default:
          results = await this.hybridSearch(query);
          break;
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Search completed in ${duration}ms, found ${results.length} results`);

      return results;

    } catch (error) {
      console.error('❌ Search failed:', error);
      throw error;
    }
  }

  /**
   * Hybrid search combining vector, keyword, and entity search
   */
  private async hybridSearch(query: EntityAwareSearchQuery): Promise<SearchResult[]> {
    // Step 1: Extract entities from query
    const queryEntities = await this.extractQueryEntities(query.text);
    console.log(`  📋 Extracted ${queryEntities.length} entities from query`);

    // Step 2: Run all search strategies in parallel
    const [vectorResults, keywordResults, entityResults] = await Promise.all([
      this.vectorSearch(query).catch(() => []),
      this.keywordSearch(query).catch(() => []),
      queryEntities.length > 0 ? this.entitySearchByExtracted(queryEntities, query.filters).catch(() => []) : Promise.resolve([]),
    ]);

    console.log(`  📊 Vector: ${vectorResults.length}, Keyword: ${keywordResults.length}, Entity: ${entityResults.length}`);

    // Step 3: Fusion with configurable weights
    const fusedResults = this.fuseResults(vectorResults, keywordResults, entityResults, {
      vectorWeight: 0.4,
      keywordWeight: 0.3,
      entityWeight: 0.3,
    });

    // Step 4: Rerank based on entity matching
    const reranked = this.rerankByEntityRelevance(fusedResults, queryEntities);

    // Step 5: Return top results
    return reranked.slice(0, query.maxResults || 10);
  }

  /**
   * Pure vector similarity search using Pinecone
   */
  private async vectorSearch(query: EntityAwareSearchQuery): Promise<SearchResult[]> {
    // Use Pinecone for vector search
    const results = await pineconeVectorService.search({
      text: query.text,
      topK: query.maxResults || 30,  // Cast wider net for fusion
      minScore: query.similarityThreshold || 0.7,
      filter: query.domain ? { domain: query.domain } : undefined,
    });

    return results.map((result: any) => ({
      chunk_id: result.chunk_id,
      document_id: result.document_id,
      content: result.content,
      metadata: result.metadata,
      scores: {
        vector: result.similarity,
        combined: result.similarity,
      },
      source_title: result.source_title,
      domain: result.domain,
    }));
  }

  /**
   * Keyword-based full-text search using PostgreSQL
   */
  private async keywordSearch(query: EntityAwareSearchQuery): Promise<SearchResult[]> {
    const { data, error } = await this.supabase
      .from('document_chunks')
      .select(`
        id,
        content,
        metadata,
        document_id,
        knowledge_documents!inner(
          title,
          domain,
          tags
        )
      `)
      .textSearch('content', query.text, {
        type: 'websearch',
        config: 'english',
      })
      .limit(query.maxResults || 20);

    if (error) {
      throw new Error(`Keyword search failed: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      chunk_id: row.id,
      document_id: row.document_id,
      content: row.content,
      metadata: row.metadata,
      scores: {
        keyword: 1.0, // Would use ts_rank if available
        combined: 1.0,
      },
      source_title: row.knowledge_documents?.title,
      domain: row.knowledge_documents?.domain,
    }));
  }

  /**
   * Entity-based search using extracted entities from chunks
   */
  private async entitySearch(query: EntityAwareSearchQuery): Promise<SearchResult[]> {
    const queryEntities = await this.extractQueryEntities(query.text);
    return this.entitySearchByExtracted(queryEntities, query.filters);
  }

  /**
   * Search by pre-extracted query entities
   */
  private async entitySearchByExtracted(
    queryEntities: QueryEntity[],
    filters?: SearchFilters
  ): Promise<SearchResult[]> {
    if (queryEntities.length === 0) return [];

    // Build entity search query
    // This searches in the metadata->>'entities' JSONB field
    const entityTexts = queryEntities.map((e: any) => e.text.toLowerCase());

    const { data, error } = await this.supabase.rpc('search_by_entities', {
      entity_texts: entityTexts,
      entity_types: queryEntities.map((e: any) => e.type),
      max_results: 50,
    }).catch(async () => {
      // Fallback if function doesn't exist - use direct query
      const { data: fallbackData } = await this.supabase
        .from('document_chunks')
        .select('*')
        .or(entityTexts.map(text => `metadata->>extracted_entities.ilike.%${text}%`).join(','))
        .limit(50);

      return { data: fallbackData, error: null };
    });

    if (error) {
      console.warn('Entity search failed, returning empty results:', error);
      return [];
    }

    return (data || []).map((row: any) => {
      const matchedEntities = this.findMatchedEntities(row.metadata?.extracted_entities || [], queryEntities);

      return {
        chunk_id: row.id || row.chunk_id,
        document_id: row.document_id,
        content: row.content,
        metadata: row.metadata,
        scores: {
          entity: matchedEntities.length / queryEntities.length,
          combined: matchedEntities.length / queryEntities.length,
        },
        matched_entities: matchedEntities,
        source_title: row.source_title,
        domain: row.domain,
      };
    });
  }

  /**
   * Extract entities from user query using simple NLP
   * (In production, this would call LangExtract)
   */
  private async extractQueryEntities(queryText: string): Promise<QueryEntity[]> {
    const entities: QueryEntity[] = [];

    // Simple medical entity extraction patterns
    const medPatterns = {
      medication: /\b(aspirin|metformin|insulin|lisinopril|atorvastatin|amlodipine|levothyroxine|metoprolol|albuterol|omeprazole)\b/gi,
      diagnosis: /\b(diabetes|hypertension|asthma|copd|pneumonia|covid-19|cancer|heart failure|stroke)\b/gi,
      procedure: /\b(surgery|biopsy|endoscopy|colonoscopy|mri|ct scan|x-ray|ultrasound)\b/gi,
    };

    for (const [type, pattern] of Object.entries(medPatterns)) {
      const matches = queryText.match(pattern) || [];
      matches.forEach(match => {
        entities.push({
          text: match,
          type: type,
          attributes: {},
          importance: 1.0,
        });
      });
    }

    // Extract numeric constraints (dosages, ages, etc.)
    const numericPattern = /(\d+\.?\d*)\s*(mg|g|ml|years?|months?|%)/gi;
    let numericMatch;
    while ((numericMatch = numericPattern.exec(queryText)) !== null) {
      entities.push({
        text: numericMatch[0],
        type: 'numeric_constraint',
        attributes: {
          value: numericMatch[1],
          unit: numericMatch[2],
        },
        importance: 0.7,
      });
    }

    return entities;
  }

  /**
   * Fuse results from multiple search strategies
   */
  private fuseResults(
    vectorResults: SearchResult[],
    keywordResults: SearchResult[],
    entityResults: SearchResult[],
    weights: { vectorWeight: number; keywordWeight: number; entityWeight: number }
  ): SearchResult[] {
    const resultsMap = new Map<string, SearchResult>();

    // Add vector results
    vectorResults.forEach(result => {
      resultsMap.set(result.chunk_id, {
        ...result,
        scores: {
          ...result.scores,
          combined: (result.scores.vector || 0) * weights.vectorWeight,
        },
      });
    });

    // Merge keyword results
    keywordResults.forEach(result => {
      const existing = resultsMap.get(result.chunk_id);
      if (existing) {
        existing.scores.keyword = result.scores.keyword;
        existing.scores.combined += (result.scores.keyword || 0) * weights.keywordWeight;
      } else {
        resultsMap.set(result.chunk_id, {
          ...result,
          scores: {
            ...result.scores,
            combined: (result.scores.keyword || 0) * weights.keywordWeight,
          },
        });
      }
    });

    // Merge entity results
    entityResults.forEach(result => {
      const existing = resultsMap.get(result.chunk_id);
      if (existing) {
        existing.scores.entity = result.scores.entity;
        existing.scores.combined += (result.scores.entity || 0) * weights.entityWeight;
        existing.matched_entities = result.matched_entities;
      } else {
        resultsMap.set(result.chunk_id, {
          ...result,
          scores: {
            ...result.scores,
            combined: (result.scores.entity || 0) * weights.entityWeight,
          },
        });
      }
    });

    // Sort by combined score
    return Array.from(resultsMap.values()).sort((a, b) => b.scores.combined - a.scores.combined);
  }

  /**
   * Rerank results based on entity matching quality
   */
  private rerankByEntityRelevance(
    results: SearchResult[],
    queryEntities: QueryEntity[]
  ): SearchResult[] {
    if (queryEntities.length === 0) return results;

    return results.map((result: any) => {
      // Boost score based on entity matches
      const entityBoost = (result.matched_entities?.length || 0) / queryEntities.length;
      const boostedScore = result.scores.combined * (1 + entityBoost * 0.3); // 30% boost

      return {
        ...result,
        scores: {
          ...result.scores,
          combined: boostedScore,
        },
      };
    }).sort((a, b) => b.scores.combined - a.scores.combined);
  }

  /**
   * Find which query entities matched in the chunk
   */
  private findMatchedEntities(
    chunkEntities: any[],
    queryEntities: QueryEntity[]
  ): MatchedEntity[] {
    const matched: MatchedEntity[] = [];

    queryEntities.forEach(qEntity => {
      const chunkEntity = chunkEntities.find(cEntity =>
        cEntity.text?.toLowerCase().includes(qEntity.text.toLowerCase()) ||
        qEntity.text.toLowerCase().includes(cEntity.text?.toLowerCase())
      );

      if (chunkEntity) {
        matched.push({
          entity_id: chunkEntity.id || 'unknown',
          entity_type: chunkEntity.type || qEntity.type,
          entity_text: chunkEntity.text || qEntity.text,
          match_type: chunkEntity.text?.toLowerCase() === qEntity.text.toLowerCase() ? 'exact' : 'partial',
          confidence: chunkEntity.confidence || 0.8,
        });
      }
    });

    return matched;
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(organizationId: string): Promise<{
    totalSearches: number;
    avgResults: number;
    topQueries: Array<{ query: string; count: number }>;
    strategyDistribution: Record<string, number>;
  }> {
    // This would query from a search_logs table
    return {
      totalSearches: 0,
      avgResults: 0,
      topQueries: [],
      strategyDistribution: {},
    };
  }
}

// Export singleton
export const entityAwareHybridSearch = new EntityAwareHybridSearch();
