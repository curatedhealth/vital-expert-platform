/**
 * Expert Tools Service
 *
 * Provides dynamic capabilities for Virtual Advisory Board experts:
 * - Web search (Tavily API)
 * - Calculator (math operations)
 * - Knowledge base retrieval (RAG)
 *
 * Enables experts to fetch real-time data instead of relying solely on LLM knowledge.
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ToolCall {
  toolName: string;
  input: any;
  output: string;
  timestamp: string;
  duration: number;
}

export interface ToolUsageStats {
  toolName: string;
  callCount: number;
  totalDuration: number;
  avgDuration: number;
  successRate: number;
}

// ============================================================================
// WEB SEARCH TOOL (Tavily API)
// ============================================================================

/**
 * Web search tool using Tavily API
 * Enables experts to search for real-time information
 */
export const createWebSearchTool = () => {
  return new DynamicStructuredTool({
    name: 'web_search',
    description: 'Search the web for current information, news, research papers, regulatory updates, clinical trial data, or drug approvals. Use this when you need real-time or recent information not in your training data.',
    schema: z.object({
      query: z.string().describe('The search query (e.g., "FDA approval psoriasis biologics 2024")'),
      maxResults: z.number().optional().default(5).describe('Maximum number of results to return (1-10)')
    }),
    func: async ({ query, maxResults = 5 }) => {
      const startTime = Date.now();

      try {
        const apiKey = process.env.TAVILY_API_KEY;

        if (!apiKey) {
          return JSON.stringify({
            error: 'Tavily API key not configured. Please set TAVILY_API_KEY environment variable.',
            suggestion: 'Proceeding with general knowledge only.'
          });
        }

        // Call Tavily Search API
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            api_key: apiKey,
            query,
            max_results: Math.min(maxResults, 10),
            search_depth: 'advanced',
            include_answer: true,
            include_domains: [
              'clinicaltrials.gov',
              'fda.gov',
              'ema.europa.eu',
              'pubmed.ncbi.nlm.nih.gov',
              'nejm.org',
              'thelancet.com',
              'bmj.com'
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`Tavily API error: ${response.statusText}`);
        }

        const data = await response.json();
        const duration = Date.now() - startTime;

        // Format results
        const results = data.results?.slice(0, maxResults).map((result: any, idx: number) => ({
          rank: idx + 1,
          title: result.title,
          url: result.url,
          content: result.content?.substring(0, 300),
          score: result.score
        })) || [];

        return JSON.stringify({
          query,
          answer: data.answer || 'No direct answer available',
          sources: results,
          duration_ms: duration,
          timestamp: new Date().toISOString()
        }, null, 2);

      } catch (error: any) {
        console.error('Web search error:', error);
        return JSON.stringify({
          error: error.message || 'Web search failed',
          query,
          suggestion: 'Proceeding with general knowledge only.'
        });
      }
    }
  });
};

// ============================================================================
// CALCULATOR TOOL
// ============================================================================

/**
 * Calculator tool for mathematical operations
 * Enables experts to perform precise calculations
 */
export const createCalculatorTool = () => {
  return new DynamicStructuredTool({
    name: 'calculator',
    description: 'Perform mathematical calculations including arithmetic, percentages, financial calculations (NPV, ROI), statistical operations, and unit conversions. Use this for precise numeric operations.',
    schema: z.object({
      expression: z.string().describe('Mathematical expression to evaluate (e.g., "1500000 * 0.15" or "sqrt(100)")'),
      context: z.string().optional().describe('Optional context explaining what this calculation represents')
    }),
    func: async ({ expression, context }) => {
      const startTime = Date.now();

      try {
        // Safety: Only allow safe mathematical operations
        const safeExpression = expression
          .replace(/[^0-9+\-*/().%\s,]/g, '') // Remove unsafe characters
          .replace(/,/g, ''); // Remove commas

        if (!safeExpression || safeExpression.length === 0) {
          throw new Error('Invalid mathematical expression');
        }

        // Extended math functions
        const mathFunctions: Record<string, (...args: number[]) => number> = {
          sqrt: Math.sqrt,
          pow: Math.pow,
          abs: Math.abs,
          round: Math.round,
          floor: Math.floor,
          ceil: Math.ceil,
          log: Math.log,
          exp: Math.exp,
          sin: Math.sin,
          cos: Math.cos,
          tan: Math.tan
        };

        // Create safe evaluation context
        let result: number;

        // Check for function calls
        const funcMatch = expression.match(/^(\w+)\(([\d.,\s]+)\)$/);
        if (funcMatch) {
          const [, funcName, argsStr] = funcMatch;
          const func = mathFunctions[funcName.toLowerCase()];

          if (func) {
            const args = argsStr.split(',').map(arg => parseFloat(arg.trim()));
            result = func(...args);
          } else {
            throw new Error(`Unknown function: ${funcName}`);
          }
        } else {
          // Evaluate basic expression
          result = Function('"use strict"; return (' + safeExpression + ')')();
        }

        const duration = Date.now() - startTime;

        return JSON.stringify({
          expression,
          result,
          context: context || 'Mathematical calculation',
          formatted: result.toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0
          }),
          duration_ms: duration,
          timestamp: new Date().toISOString()
        }, null, 2);

      } catch (error: any) {
        console.error('Calculator error:', error);
        return JSON.stringify({
          error: error.message || 'Calculation failed',
          expression,
          suggestion: 'Please verify the mathematical expression syntax.'
        });
      }
    }
  });
};

// ============================================================================
// KNOWLEDGE BASE TOOL (RAG)
// ============================================================================

/**
 * Knowledge base retrieval tool (RAG integration)
 * Enables experts to query internal company knowledge base
 */
export const createKnowledgeBaseTool = () => {
  return new DynamicStructuredTool({
    name: 'knowledge_base',
    description: 'Search internal company knowledge base for proprietary information, clinical trial results, regulatory submissions, internal guidelines, or company-specific data. Use this for internal/confidential information.',
    schema: z.object({
      query: z.string().describe('Search query for internal knowledge base'),
      category: z.enum(['clinical', 'regulatory', 'commercial', 'manufacturing', 'safety', 'general'])
        .optional()
        .describe('Optional category to narrow search'),
      topK: z.number().optional().default(3).describe('Number of relevant documents to retrieve (1-10)')
    }),
    func: async ({ query, category, topK = 3 }) => {
      try {
        // Import RAG connector (connects to existing VITAL RAG system with 1,268 chunks)
        const { searchKnowledgeBase } = await import('./expert-tools-rag-connector');

        // Search the knowledge base
        const result = await searchKnowledgeBase(query, category, topK);

        // If no results found, provide helpful message
        if (result.count === 0) {
          return JSON.stringify({
            ...result,
            message: 'No relevant documents found in knowledge base (1,268 chunks searched)',
            suggestion: 'Try broader search terms or different category',
            available_categories: ['clinical', 'regulatory', 'commercial', 'manufacturing', 'safety', 'general']
          }, null, 2);
        }

        // Return successful results
        return JSON.stringify(result, null, 2);

      } catch (error: any) {
        console.error('Knowledge base error:', error);
        return JSON.stringify({
          error: error.message || 'Knowledge base search failed',
          query,
          category,
          suggestion: 'Ensure OPENAI_API_KEY is configured and Supabase is running',
          troubleshooting: {
            check_openai_key: 'Verify OPENAI_API_KEY in .env.local',
            check_supabase: 'Ensure Supabase is running (docker ps | grep supabase)',
            check_chunks: 'Verify knowledge chunks exist in rag_knowledge_chunks table'
          }
        });
      }
    }
  });
};

// ============================================================================
// PUBMED SEARCH TOOL
// ============================================================================

/**
 * PubMed search tool for medical/scientific literature
 * Enables experts to search peer-reviewed research
 */
export const createPubMedSearchTool = () => {
  return new DynamicStructuredTool({
    name: 'pubmed_search',
    description: 'Search PubMed for peer-reviewed medical and scientific research papers. Use this to find clinical evidence, study results, systematic reviews, or meta-analyses.',
    schema: z.object({
      query: z.string().describe('Search query for PubMed (e.g., "psoriasis biologic therapy efficacy")'),
      maxResults: z.number().optional().default(5).describe('Maximum number of results (1-20)')
    }),
    func: async ({ query, maxResults = 5 }) => {
      const startTime = Date.now();

      try {
        // PubMed E-utilities API (free, no API key required for basic use)
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&sort=relevance`;

        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        const pmids = searchData.esearchresult?.idlist || [];

        if (pmids.length === 0) {
          return JSON.stringify({
            query,
            results: [],
            message: 'No articles found',
            suggestion: 'Try broader search terms or different keywords'
          });
        }

        // Fetch article details
        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`;
        const summaryResponse = await fetch(summaryUrl);
        const summaryData = await summaryResponse.json();

        const duration = Date.now() - startTime;

        const results = pmids.map((pmid: string) => {
          const article = summaryData.result[pmid];
          return {
            pmid,
            title: article?.title || 'Title unavailable',
            authors: article?.authors?.slice(0, 3).map((a: any) => a.name).join(', ') || 'Authors unavailable',
            journal: article?.source || 'Journal unavailable',
            pubdate: article?.pubdate || 'Date unavailable',
            url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
          };
        });

        return JSON.stringify({
          query,
          count: results.length,
          results,
          duration_ms: duration,
          timestamp: new Date().toISOString()
        }, null, 2);

      } catch (error: any) {
        console.error('PubMed search error:', error);
        return JSON.stringify({
          error: error.message || 'PubMed search failed',
          query,
          suggestion: 'Proceeding with general medical knowledge only.'
        });
      }
    }
  });
};

// ============================================================================
// TOOL REGISTRY
// ============================================================================

/**
 * Get specific tools by name
 */
export const getToolsByName = (toolNames: string[]) => {
  const allTools = getAllExpertTools();
  return allTools.filter(tool => toolNames.includes(tool.name));
};

/**
 * Tool usage tracker
 */
export class ToolUsageTracker {
  private usage: Map<string, ToolCall[]> = new Map();

  trackToolCall(toolCall: ToolCall): void {
    const existing = this.usage.get(toolCall.toolName) || [];
    existing.push(toolCall);
    this.usage.set(toolCall.toolName, existing);
  }

  getStats(): ToolUsageStats[] {
    const stats: ToolUsageStats[] = [];

    for (const [toolName, calls] of this.usage.entries()) {
      const totalDuration = calls.reduce((sum, call) => sum + call.duration, 0);
      const successCount = calls.filter(call => !call.output.includes('error')).length;

      stats.push({
        toolName,
        callCount: calls.length,
        totalDuration,
        avgDuration: totalDuration / calls.length,
        successRate: successCount / calls.length
      });
    }

    return stats;
  }

  getToolCalls(toolName?: string): ToolCall[] {
    if (toolName) {
      return this.usage.get(toolName) || [];
    }

    // Return all tool calls
    const allCalls: ToolCall[] = [];
    for (const calls of this.usage.values()) {
      allCalls.push(...calls);
    }
    return allCalls;
  }

  reset(): void {
    this.usage.clear();
  }
}

// Global tool usage tracker
export const toolUsageTracker = new ToolUsageTracker();

// ============================================================================
// GET ALL TOOLS (including Evidence Retrieval & Clinical Standards Tools)
// ============================================================================

import { getAllEvidenceTools } from './evidence-retrieval';
import { getAllClinicalStandardsTools } from './clinical-standards-tools';

export function getAllExpertTools() {
  const baseTools = [
    createWebSearchTool(),
    createCalculatorTool(),
    createKnowledgeBaseTool(),
    createPubMedSearchTool()
  ];

  const evidenceTools = getAllEvidenceTools();
  const clinicalStandardsTools = getAllClinicalStandardsTools();

  return [...baseTools, ...evidenceTools, ...clinicalStandardsTools];
}
