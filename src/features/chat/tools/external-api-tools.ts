/**
 * Simplified External API Tools
 */

export class TavilySearchTool {
  async search(query: string): Promise<any> {
    // Mock implementation
    return {
      results: [
        { title: `Mock search result for: ${query}`, url: 'https://example.com' }
      ]
    };
  }
}

export class WikipediaTool {
  async search(query: string): Promise<any> {
    // Mock implementation
    return {
      content: `Mock Wikipedia content for: ${query}`
    };
  }
}

export const tavilySearchTool = new TavilySearchTool();
export const wikipediaTool = new WikipediaTool();

// Export the missing tools that other files are trying to import
export const euMedicalDeviceTool = new TavilySearchTool();
export const pubmedSearchTool = new WikipediaTool();
export const arxivSearchTool = new TavilySearchTool();