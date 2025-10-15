import { Tool } from '@langchain/core/tools';
import { z } from 'zod';

const WebSearchSchema = z.object({
  query: z.string().describe('The search query'),
  maxResults: z.number().optional().default(5).describe('Maximum number of results')
});

export class WebSearchTool extends Tool {
  name = 'web_search';
  description = 'Search the web for current information. Use this when you need up-to-date information or facts about current events.';
  
  schema = WebSearchSchema;
  
  async _call(input: z.infer<typeof WebSearchSchema>): Promise<string> {
    try {
      // Use Brave Search API or Google Custom Search
      const response = await fetch('/api/tools/web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const results = await response.json();
      
      // Format results for LLM consumption
      return this.formatResults(results);
    } catch (error) {
      console.error('Web search error:', error);
      return `Search failed: ${error.message}`;
    }
  }
  
  private formatResults(results: any[]): string {
    if (!results || results.length === 0) {
      return 'No results found';
    }
    
    return results.map((result, index) => {
      return `
Result ${index + 1}:
Title: ${result.title}
URL: ${result.url}
Snippet: ${result.snippet}
Published: ${result.publishedDate || 'Unknown'}
`;
    }).join('\n---\n');
  }
}
