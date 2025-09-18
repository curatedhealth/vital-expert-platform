import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

export interface RAGSearchResult {
  content: string;
  metadata: {
    title?: string;
    source?: string;
    phase?: string;
    document_type?: string;
    relevance_score: number;
    page_number?: number;
    section?: string;
  };
  similarity: number;
  citation_id: number;
}

export interface RAGResponse {
  sources: RAGSearchResult[];
  context: string;
  enhanced_query?: string;
  search_strategy: string;
}

export class SupabaseRAGService {
  private supabase: any;
  private openai: OpenAI | null = null;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-key') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Enhanced search that uses query expansion and multiple search strategies
   */
  async enhancedSearch(
    query: string,
    options: {
      agentType?: string;
      phase?: string;
      maxResults?: number;
      similarityThreshold?: number;
      includeMetadata?: boolean;
    } = {}
  ): Promise<RAGResponse> {
    const {
      agentType = 'general',
      phase,
      maxResults = 5,
      similarityThreshold = 0.7,
      includeMetadata = true,
    } = options;

    try {
      // Step 1: Query enhancement for better retrieval
      const enhancedQuery = await this.enhanceQuery(query, agentType);

      // Step 2: Multi-strategy search
      const searchStrategies = await this.executeMultiStrategySearch(
        enhancedQuery || query,
        {
          agentType,
          phase,
          maxResults: maxResults * 2, // Get more results to filter
          includeMetadata,
        }
      );

      // Step 3: Deduplicate and rank results
      const rankedResults = this.rankAndDeduplicateResults(
        searchStrategies.results,
        query,
        similarityThreshold
      );

      // Step 4: Select top results
      const topResults = rankedResults.slice(0, maxResults);

      // Step 5: Generate context
      const context = this.generateContext(topResults, agentType);

      return {
        sources: topResults.map((result, index) => ({
          ...result,
          citation_id: index + 1,
        })),
        context,
        enhanced_query: enhancedQuery,
        search_strategy: searchStrategies.strategy,
      };

    } catch (error) {
      console.error('RAG search error:', error);

      // Fallback to simple search
      return this.fallbackSearch(query, options);
    }
  }

  /**
   * Enhance the user query for better retrieval
   */
  private async enhanceQuery(query: string, agentType: string): Promise<string | null> {
    if (!this.openai) return null;

    try {
      const enhancementPrompt = this.getQueryEnhancementPrompt(agentType);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: enhancementPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.3,
        max_tokens: 150,
      });

      return response.choices[0]?.message?.content?.trim() || null;
    } catch (error) {
      console.error('Query enhancement error:', error);
      return null;
    }
  }

  /**
   * Execute multiple search strategies using Supabase vector search
   */
  private async executeMultiStrategySearch(
    query: string,
    options: {
      agentType: string;
      phase?: string;
      maxResults: number;
      includeMetadata: boolean;
    }
  ): Promise<{ results: RAGSearchResult[]; strategy: string }> {
    const strategies = [];

    // Strategy 1: Direct semantic search using Supabase vector similarity
    try {
      const directResults = await this.performVectorSearch(query, {
        limit: options.maxResults,
        threshold: 0.5,
        filters: this.buildSupabaseFilter(options.agentType, options.phase),
      });

      strategies.push({
        name: 'semantic',
        results: this.formatSupabaseResults(directResults),
        weight: 1.0,
      });
    } catch (error) {
      console.error('Direct search error:', error);
    }

    // Strategy 2: Keyword-enhanced search
    try {
      const keywords = this.extractKeywords(query);
      const keywordQuery = `${query} ${keywords.join(' ')}`;

      const keywordResults = await this.performVectorSearch(keywordQuery, {
        limit: Math.floor(options.maxResults / 2),
        threshold: 0.4,
        filters: this.buildSupabaseFilter(options.agentType, options.phase),
      });

      strategies.push({
        name: 'keyword',
        results: this.formatSupabaseResults(keywordResults),
        weight: 0.7,
      });
    } catch (error) {
      console.error('Keyword search error:', error);
    }

    // Strategy 3: Phase-specific search (if phase is specified)
    if (options.phase) {
      try {
        const phaseResults = await this.performVectorSearch(query, {
          limit: Math.floor(options.maxResults / 3),
          threshold: 0.6,
          filters: { phase: { eq: options.phase } },
        });

        strategies.push({
          name: 'phase-specific',
          results: this.formatSupabaseResults(phaseResults),
          weight: 0.8,
        });
      } catch (error) {
        console.error('Phase search error:', error);
      }
    }

    // Combine all strategies
    const allResults: RAGSearchResult[] = [];
    const strategyNames: string[] = [];

    strategies.forEach((strategy) => {
      allResults.push(...strategy.results.map(result => ({
        ...result,
        similarity: result.similarity * strategy.weight,
      })));
      strategyNames.push(strategy.name);
    });

    return {
      results: allResults,
      strategy: strategyNames.join(' + '),
    };
  }

  /**
   * Perform vector search using Supabase vector similarity
   */
  private async performVectorSearch(
    query: string,
    options: {
      limit: number;
      threshold: number;
      filters?: any;
    }
  ): Promise<any[]> {
    try {
      // Generate embedding for the query
      const embedding = await this.generateEmbedding(query);

      if (!embedding) {
        throw new Error('Failed to generate embedding');
      }

      // Build the query
      let supabaseQuery = this.supabase
        .from('knowledge_base')
        .select('*')
        .order('similarity', { ascending: false })
        .limit(options.limit);

      // Add vector similarity search
      if (embedding) {
        // Use SQL function for vector similarity
        supabaseQuery = supabaseQuery.rpc('search_knowledge_base', {
          query_embedding: embedding,
          match_threshold: options.threshold,
          match_count: options.limit,
        });
      }

      // Add filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (typeof value === 'object' && value.eq) {
            supabaseQuery = supabaseQuery.eq(key, value.eq);
          } else if (typeof value === 'object' && value.in) {
            supabaseQuery = supabaseQuery.in(key, value.in);
          } else {
            supabaseQuery = supabaseQuery.eq(key, value);
          }
        });
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        console.error('Supabase search error:', error);
        // Fallback to simple text search
        return this.performTextSearch(query, options);
      }

      return data || [];
    } catch (error) {
      console.error('Vector search error:', error);
      // Fallback to simple text search
      return this.performTextSearch(query, options);
    }
  }

  /**
   * Fallback text search when vector search fails
   */
  private async performTextSearch(
    query: string,
    options: {
      limit: number;
      threshold: number;
      filters?: any;
    }
  ): Promise<any[]> {
    try {
      let supabaseQuery = this.supabase
        .from('knowledge_base')
        .select('*')
        .textSearch('content', query, {
          type: 'websearch',
          config: 'english',
        })
        .limit(options.limit);

      // Add filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (typeof value === 'object' && value.eq) {
            supabaseQuery = supabaseQuery.eq(key, value.eq);
          } else if (typeof value === 'object' && value.in) {
            supabaseQuery = supabaseQuery.in(key, value.in);
          } else {
            supabaseQuery = supabaseQuery.eq(key, value);
          }
        });
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        console.error('Text search error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Text search fallback error:', error);
      return [];
    }
  }

  /**
   * Generate embedding using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.openai) return null;

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      return null;
    }
  }

  /**
   * Format Supabase results to RAGSearchResult format
   */
  private formatSupabaseResults(results: any[]): RAGSearchResult[] {
    return results.map((result) => ({
      content: result.content || '',
      metadata: {
        title: result.title,
        source: result.source,
        phase: result.phase,
        document_type: result.content_type,
        relevance_score: result.similarity || 0,
        page_number: result.metadata?.page_number,
        section: result.metadata?.section,
      },
      similarity: result.similarity || 0,
      citation_id: 0, // Will be set later
    }));
  }

  /**
   * Build filter for Supabase search
   */
  private buildSupabaseFilter(agentType: string, phase?: string): any {
    const filter: any = {};

    // Agent-specific filtering
    const agentFilters: Record<string, any> = {
      'regulatory-expert': {
        content_type: { in: ['regulation', 'guideline', 'best_practice'] }
      },
      'clinical-researcher': {
        content_type: { in: ['clinical', 'research', 'protocol'] }
      },
      'market-access': {
        content_type: { in: ['market', 'economics', 'payer'] }
      },
      'technical-architect': {
        content_type: { in: ['technical', 'architecture', 'security'] }
      },
      'business-strategist': {
        content_type: { in: ['business', 'strategy', 'commercial'] }
      },
    };

    if (agentFilters[agentType]) {
      Object.assign(filter, agentFilters[agentType]);
    }

    // Phase-specific filtering
    if (phase) {
      filter.phase = { eq: phase };
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
  }

  /**
   * Rank and deduplicate search results
   */
  private rankAndDeduplicateResults(
    results: RAGSearchResult[],
    originalQuery: string,
    threshold: number
  ): RAGSearchResult[] {
    // Remove duplicates based on content similarity
    const uniqueResults: RAGSearchResult[] = [];
    const seenContent = new Set<string>();

    for (const result of results) {
      if (result.similarity < threshold) continue;

      const contentHash = this.generateContentHash(result.content);
      if (!seenContent.has(contentHash)) {
        seenContent.add(contentHash);
        uniqueResults.push(result);
      }
    }

    // Sort by relevance score
    return uniqueResults.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Generate context from search results
   */
  private generateContext(results: RAGSearchResult[], agentType: string): string {
    if (results.length === 0) return '';

    const contextSections = results.map((result, index) => {
      const citation = `[${index + 1}]`;
      const source = result.metadata.title || result.metadata.source || 'Unknown source';

      return `${citation} ${source}:\n${result.content}\n`;
    });

    const contextHeader = this.getContextHeader(agentType);

    return `${contextHeader}\n\n${contextSections.join('\n')}`;
  }

  /**
   * Fallback search for when enhanced search fails
   */
  private async fallbackSearch(
    query: string,
    options: any
  ): Promise<RAGResponse> {
    try {
      const results = await this.performTextSearch(query, {
        limit: options.maxResults || 3,
        threshold: 0.3,
        filters: this.buildSupabaseFilter(options.agentType, options.phase),
      });

      const formattedResults = this.formatSupabaseResults(results);

      return {
        sources: formattedResults.map((result, index) => ({
          ...result,
          citation_id: index + 1,
        })),
        context: this.generateContext(formattedResults, options.agentType || 'general'),
        search_strategy: 'fallback',
      };
    } catch (error) {
      console.error('Fallback search error:', error);
      return {
        sources: [],
        context: '',
        search_strategy: 'failed',
      };
    }
  }

  /**
   * Extract keywords from query
   */
  private extractKeywords(query: string): string[] {
    // Simple keyword extraction - could be enhanced with NLP
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'since', 'without', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must']);

    const words = query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    return [...new Set(words)]; // Remove duplicates
  }

  /**
   * Generate content hash for deduplication
   */
  private generateContentHash(content: string): string {
    // Simple hash based on normalized content
    const normalized = content.toLowerCase().replace(/\s+/g, ' ').trim();
    return normalized.slice(0, 100); // Use first 100 chars as hash
  }

  /**
   * Get query enhancement prompt for different agent types
   */
  private getQueryEnhancementPrompt(agentType: string): string {
    const prompts: Record<string, string> = {
      'regulatory-expert': 'You are helping enhance a search query for regulatory information. Expand the query with relevant regulatory terms, compliance keywords, and FDA/EMA terminology while keeping it focused and specific.',
      'clinical-researcher': 'You are helping enhance a search query for clinical research information. Add relevant clinical trial terms, research methodology keywords, and medical terminology while maintaining specificity.',
      'market-access': 'You are helping enhance a search query for market access information. Include health economics terms, payer terminology, and reimbursement keywords while keeping the query targeted.',
      'technical-architect': 'You are helping enhance a search query for technical information. Add relevant technology terms, architecture keywords, and security terminology while maintaining focus.',
      'business-strategist': 'You are helping enhance a search query for business strategy information. Include business development terms, commercial keywords, and strategic terminology while keeping it specific.',
    };

    return prompts[agentType] || 'You are helping enhance a search query. Add relevant terms and keywords while keeping the query focused and specific.';
  }

  /**
   * Get context header for different agent types
   */
  private getContextHeader(agentType: string): string {
    const headers: Record<string, string> = {
      'regulatory-expert': 'Based on the following regulatory guidance and compliance information:',
      'clinical-researcher': 'Based on the following clinical research and medical literature:',
      'market-access': 'Based on the following market access and health economics information:',
      'technical-architect': 'Based on the following technical documentation and architecture guidelines:',
      'business-strategist': 'Based on the following business strategy and commercial information:',
    };

    return headers[agentType] || 'Based on the following relevant information:';
  }
}