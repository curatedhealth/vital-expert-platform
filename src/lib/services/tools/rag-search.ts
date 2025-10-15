import { Tool } from '@langchain/core/tools';
import { z } from 'zod';

const RAGSearchSchema = z.object({
  query: z.string().describe('The search query'),
  maxResults: z.number().optional().default(5),
  filter: z.object({
    domain: z.string().optional(),
    source: z.string().optional(),
    date: z.string().optional()
  }).optional()
});

export class RAGSearchTool extends Tool {
  name = 'rag_search';
  description = 'Search internal knowledge base and documents. Use for company-specific or domain-specific information.';
  
  schema = RAGSearchSchema;
  
  async _call(input: z.infer<typeof RAGSearchSchema>): Promise<string> {
    try {
      // Placeholder implementation - in production, integrate with actual vector store
      const response = await fetch('/api/tools/rag-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      
      if (!response.ok) {
        throw new Error(`RAG search failed: ${response.statusText}`);
      }
      
      const results = await response.json();
      return this.formatResults(results);
    } catch (error) {
      console.error('RAG search error:', error);
      return `Knowledge base search failed: ${error.message}`;
    }
  }
  
  private formatResults(results: any[]): string {
    if (!results || results.length === 0) {
      return 'No relevant documents found in knowledge base';
    }
    
    return results.map((result, index) => {
      return `
Document ${index + 1}:
Score: ${result.score?.toFixed(3) || 'N/A'}
Title: ${result.title || 'Untitled'}
Source: ${result.source || 'Unknown'}
Domain: ${result.domain || 'General'}
Content:
${result.content || 'No content available'}
`;
    }).join('\n---\n');
  }
}
