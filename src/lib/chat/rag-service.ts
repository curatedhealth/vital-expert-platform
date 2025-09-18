import { PineconeService } from '@/lib/pinecone/client';
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

export class RAGService {
  private pinecone: PineconeService;
  private openai: OpenAI | null = null;

  constructor() {
    this.pinecone = new PineconeService();

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
   * Execute multiple search strategies and combine results
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

    // Strategy 1: Direct semantic search
    try {
      const directResults = await this.pinecone.searchSimilar(query, {
        topK: options.maxResults,
        filter: this.buildFilter(options.agentType, options.phase),
        includeMetadata: options.includeMetadata,
      });

      strategies.push({
        name: 'semantic',
        results: this.formatPineconeResults(directResults),
        weight: 1.0,
      });
    } catch (error) {
      console.error('Direct search error:', error);
    }

    // Strategy 2: Keyword-enhanced search
    try {
      const keywords = this.extractKeywords(query);
      const keywordQuery = `${query} ${keywords.join(' ')}`;

      const keywordResults = await this.pinecone.searchSimilar(keywordQuery, {
        topK: Math.floor(options.maxResults / 2),
        filter: this.buildFilter(options.agentType, options.phase),
        includeMetadata: options.includeMetadata,
      });

      strategies.push({
        name: 'keyword',
        results: this.formatPineconeResults(keywordResults),
        weight: 0.7,
      });
    } catch (error) {
      console.error('Keyword search error:', error);
    }

    // Strategy 3: Phase-specific search (if phase is specified)
    if (options.phase) {
      try {
        const phaseResults = await this.pinecone.searchSimilar(query, {
          topK: Math.floor(options.maxResults / 3),
          filter: { phase: options.phase },
          includeMetadata: options.includeMetadata,
        });

        strategies.push({
          name: 'phase-specific',
          results: this.formatPineconeResults(phaseResults),
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
   * Format Pinecone results to RAGSearchResult format
   */
  private formatPineconeResults(results: any[]): RAGSearchResult[] {
    return results.map((result) => ({
      content: result.pageContent || result.content || '',
      metadata: {
        title: result.metadata?.title,
        source: result.metadata?.source,
        phase: result.metadata?.phase,
        document_type: result.metadata?.document_type,
        relevance_score: result.metadata?.score || result.score || 0,
        page_number: result.metadata?.page_number,
        section: result.metadata?.section,
      },
      similarity: result.metadata?.score || result.score || 0,
      citation_id: 0, // Will be set later
    }));
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
      const results = await this.pinecone.searchSimilar(query, {
        topK: options.maxResults || 3,
        filter: this.buildFilter(options.agentType, options.phase),
      });

      const formattedResults = this.formatPineconeResults(results);

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
   * Build filter for Pinecone search
   */
  private buildFilter(agentType: string, phase?: string): any {
    const filter: any = {};

    // Agent-specific filtering
    const agentFilters: Record<string, any> = {
      'regulatory-expert': { document_type: { $in: ['regulation', 'guidance', 'compliance'] } },
      'clinical-researcher': { document_type: { $in: ['clinical', 'research', 'protocol'] } },
      'market-access': { document_type: { $in: ['market', 'economics', 'payer'] } },
      'technical-architect': { document_type: { $in: ['technical', 'architecture', 'security'] } },
      'business-strategist': { document_type: { $in: ['business', 'strategy', 'commercial'] } },
    };

    if (agentFilters[agentType]) {
      Object.assign(filter, agentFilters[agentType]);
    }

    // Phase-specific filtering
    if (phase) {
      filter.phase = phase;
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
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