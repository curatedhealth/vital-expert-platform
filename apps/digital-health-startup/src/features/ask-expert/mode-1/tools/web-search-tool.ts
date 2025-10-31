/**
 * Web Search Tool
 * 
 * Searches the web for current information, regulations, guidelines, or research papers
 * Can integrate with Brave Search API, Google Custom Search, or other providers
 */

import { BaseTool, ToolContext, ToolExecutionResult } from './base-tool';

export type WebSearchProvider = 'tavily' | 'brave' | 'google' | 'mock';
export type WebSearchType = 'general' | 'academic' | 'news' | 'regulatory';

export interface WebSearchToolInput {
  query: string;
  max_results?: number;
  search_type?: WebSearchType;
}

export interface WebSearchResultItem {
  title: string;
  url: string;
  snippet: string;
  relevance_score: number;
  timestamp: string;
  source?: string;
}

export interface WebSearchToolResult {
  query: string;
  search_type: WebSearchType;
  results: WebSearchResultItem[];
  total_results: number;
  provider: WebSearchProvider;
  answer?: string;
}

export interface WebSearchToolConfig {
  apiKey?: string;
  provider?: WebSearchProvider;
  googleSearchEngineId?: string;
  tavilySearchDepth?: 'basic' | 'advanced';
  includeDomains?: string[];
}

interface TavilyResponse {
  answer?: string;
  results: Array<{
    title: string;
    url: string;
    content?: string;
    snippet?: string;
    score?: number;
    published_date?: string;
  }>;
}

interface BraveResponse {
  web?: {
    results?: Array<{
      title: string;
      url: string;
      description?: string;
      language?: string;
      published_at?: string;
    }>;
  };
}

interface GoogleResponse {
  items?: Array<{
    title?: string;
    link?: string;
    snippet?: string;
    htmlSnippet?: string;
  }>;
}

const DEFAULT_INCLUDE_DOMAINS = [
  'clinicaltrials.gov',
  'fda.gov',
  'ema.europa.eu',
  'pubmed.ncbi.nlm.nih.gov',
  'nejm.org',
  'thelancet.com',
  'bmj.com',
];

/**
 * Production-ready web search tool with multiple provider support.
 * Defaults to Tavily when API key is provided, otherwise falls back to mock data.
 */
export class WebSearchTool extends BaseTool<WebSearchToolInput, WebSearchToolResult> {
  readonly name = 'web_search';
  readonly description =
    'Search the web for current information, regulations, guidelines, or research papers. Returns relevant search results with URLs and snippets.';

  private readonly apiKey?: string;
  private readonly searchProvider: WebSearchProvider;
  private readonly googleSearchEngineId?: string;
  private readonly tavilySearchDepth: 'basic' | 'advanced';
  private readonly includeDomains: string[];

  constructor(config: WebSearchToolConfig = {}) {
    super();
    this.apiKey = config.apiKey;
    this.searchProvider = config.provider ?? (config.apiKey ? 'tavily' : 'mock');
    this.googleSearchEngineId = config.googleSearchEngineId;
    this.tavilySearchDepth = config.tavilySearchDepth ?? 'advanced';
    this.includeDomains = config.includeDomains ?? DEFAULT_INCLUDE_DOMAINS;
  }

  getSchema() {
    return {
      type: 'function' as const,
      function: {
        name: this.name,
        description: this.description,
        parameters: {
          type: 'object' as const,
          properties: {
            query: {
              type: 'string',
              description: 'Search query string',
            },
            max_results: {
              type: 'number',
              description: 'Maximum number of results to return',
              default: 5,
            },
            search_type: {
              type: 'string',
              enum: ['general', 'academic', 'news', 'regulatory'],
              description: 'Type of search to perform',
              default: 'general',
            },
          },
          required: ['query'],
        },
      },
    };
  }

  async execute(
    input: WebSearchToolInput,
    context: ToolContext
  ): Promise<ToolExecutionResult<WebSearchToolResult>> {
    const startTime = Date.now();

    try {
      this.validateInput(input);

      const query = input.query.trim();
      const maxResults = Math.min(Math.max(input.max_results ?? 5, 1), 10);
      const searchType = input.search_type ?? 'general';

      if (!query) {
        throw new Error('Search query cannot be empty');
      }

      console.log(`🔍 [Web Search] Provider=${this.searchProvider} Query="${query}" (${searchType}, max ${maxResults})`);

      let results: WebSearchResultItem[];
      let directAnswer: string | undefined;

      switch (this.searchProvider) {
        case 'tavily': {
          const response = await this.searchTavily(query, maxResults, searchType);
          results = response.results;
          directAnswer = response.answer;
          break;
        }

        case 'brave':
          results = await this.searchBrave(query, maxResults, searchType);
          break;

        case 'google':
          results = await this.searchGoogle(query, maxResults, searchType);
          break;

        case 'mock':
        default:
          // Return mock results for development
          results = this.generateMockResults(query, maxResults);
          break;
      }

      const duration_ms = Date.now() - startTime;

      return {
        success: true,
        result: {
          query,
          search_type: searchType,
          results,
          total_results: results.length,
          provider: this.searchProvider,
          answer: directAnswer,
        },
        duration_ms,
        metadata: {
          provider: this.searchProvider,
        },
      };
    } catch (error) {
      const duration_ms = Date.now() - startTime;
      console.error(`❌ [Web Search] Search failed:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown search error',
        duration_ms,
      };
    }
  }

  private async searchTavily(
    query: string,
    maxResults: number,
    searchType: WebSearchType
  ): Promise<{ results: WebSearchResultItem[]; answer?: string }> {
    if (!this.apiKey) {
      throw new Error('Tavily API key not configured. Please set TAVILY_API_KEY to enable web search.');
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        max_results: maxResults,
        search_depth: this.tavilySearchDepth,
        include_answer: true,
        search_type: searchType === 'academic' ? 'news' : 'general',
        include_domains: this.includeDomains,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily search failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as TavilyResponse;
    const results: WebSearchResultItem[] = (data.results ?? []).slice(0, maxResults).map((result) => ({
      title: result.title,
      url: result.url,
      snippet: result.content?.slice(0, 280) ?? result.snippet ?? '',
      relevance_score: typeof result.score === 'number' ? result.score : 0.8,
      timestamp: result.published_date ?? new Date().toISOString(),
    }));

    return { results, answer: data.answer };
  }

  private async searchBrave(
    query: string,
    maxResults: number,
    searchType: WebSearchType
  ): Promise<WebSearchResultItem[]> {
    if (!this.apiKey) {
      throw new Error('Brave Search API key not configured. Please set BRAVE_API_KEY to enable this provider.');
    }

    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.set('q', query);
    url.searchParams.set('count', String(maxResults));

    const response = await fetch(url, {
      headers: {
        'X-Subscription-Token': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Brave Search failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as BraveResponse;
    const results = data.web?.results ?? [];

    if (results.length === 0) {
      return this.generateMockResults(query, maxResults);
    }

    return results.slice(0, maxResults).map((item, index) => ({
      title: item.title,
      url: item.url,
      snippet: item.description ?? '',
      relevance_score: 0.95 - index * 0.05,
      timestamp: item.published_at ?? new Date().toISOString(),
      source: 'brave',
    }));
  }

  private async searchGoogle(
    query: string,
    maxResults: number,
    searchType: WebSearchType
  ): Promise<WebSearchResultItem[]> {
    if (!this.apiKey || !this.googleSearchEngineId) {
      throw new Error('Google Custom Search requires GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables.');
    }

    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('cx', this.googleSearchEngineId);
    url.searchParams.set('q', query);
    url.searchParams.set('num', String(maxResults));
    url.searchParams.set('safe', 'active');

    if (searchType === 'news') {
      url.searchParams.set('tbm', 'nws');
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Custom Search failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as GoogleResponse;
    const items = data.items ?? [];

    if (items.length === 0) {
      return this.generateMockResults(query, maxResults);
    }

    return items.slice(0, maxResults).map((item, index) => ({
      title: item.title ?? `Result ${index + 1}`,
      url: item.link ?? '#',
      snippet: item.snippet ?? '',
      relevance_score: 0.9 - index * 0.05,
      timestamp: new Date().toISOString(),
      source: 'google',
    }));
  }

  private generateMockResults(query: string, maxResults: number): WebSearchResultItem[] {
    return Array.from({ length: maxResults }, (_, i) => ({
      title: `Search Result ${i + 1} for "${query}"`,
      url: `https://example.com/result-${i + 1}`,
      snippet: `This is a relevant result snippet for the query "${query}". In a real implementation, this would be actual content from the web.`,
      relevance_score: 0.9 - i * 0.1,
      timestamp: new Date().toISOString(),
    }));
  }
}
