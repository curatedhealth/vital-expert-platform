import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// LangChain Best Practice: Structured schema with detailed descriptions
const EMASearchSchema = z.object({
  searchType: z.enum(['medicine', 'epar', 'safety', 'clinical_data'])
    .describe('Type of EMA database to search'),
  query: z.string().describe('Search query (drug name, active substance, or condition)'),
  status: z.enum(['authorised', 'withdrawn', 'refused', 'all'])
    .optional()
    .default('all')
    .describe('Authorization status filter'),
  therapeuticArea: z.string().optional().describe('Therapeutic area filter'),
  maxResults: z.number().optional().default(10).describe('Maximum results to return')
});

export class EMADatabaseTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: 'ema_database',
      description: `Search European Medicines Agency for:
        - Drug approvals and marketing authorizations
        - EPARs (European Public Assessment Reports)
        - Safety updates and pharmacovigilance data
        - Clinical trial data and orphan designations
        Use for EU regulatory information and drug approval status in Europe.`,
      schema: EMASearchSchema,
      func: async (input) => this.search(input)
    });
  }
  
  private async search(input: z.infer<typeof EMASearchSchema>): Promise<string> {
    try {
      const baseUrl = 'https://www.ema.europa.eu/api/v1';
      const endpoint = this.getEndpoint(input.searchType);
      
      // Build query parameters
      const params = new URLSearchParams({
        q: input.query,
        limit: input.maxResults.toString(),
        ...(input.status !== 'all' && { status: input.status }),
        ...(input.therapeuticArea && { therapeutic_area: input.therapeuticArea })
      });
      
      const response = await fetch(`${baseUrl}${endpoint}?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'VITAL-Expert/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`EMA API error: ${response.status}`);
      }
      
      const data = await response.json();
      return this.formatResults(data, input.searchType);
      
    } catch (error) {
      console.error('EMA search error:', error);
      // Fallback to structured web scraping
      return this.fallbackSearch(input);
    }
  }
  
  private getEndpoint(searchType: string): string {
    const endpoints = {
      'medicine': '/medicines',
      'epar': '/documents/epar',
      'safety': '/safety-updates',
      'clinical_data': '/clinical-data'
    };
    return endpoints[searchType] || '/medicines';
  }
  
  private formatResults(data: any, searchType: string): string {
    if (!data || (!data.results && !Array.isArray(data))) {
      return 'No results found in EMA database';
    }
    
    const results = data.results || data;
    
    return results.slice(0, 10).map((item: any, index: number) => {
      if (searchType === 'medicine') {
        return `
Medicine ${index + 1}:
Name: ${item.medicine_name || item.name}
Active Substance: ${item.active_substance}
Authorization Status: ${item.authorization_status}
Authorization Date: ${item.authorization_date}
Marketing Authorization Holder: ${item.mah}
Therapeutic Area: ${item.therapeutic_area}
ATC Code: ${item.atc_code}
EPAR URL: ${item.epar_url || 'N/A'}
`;
      } else if (searchType === 'epar') {
        return `
EPAR ${index + 1}:
Product: ${item.product_name}
Procedure Type: ${item.procedure_type}
Assessment Date: ${item.assessment_date}
Opinion: ${item.chmp_opinion}
Document URL: ${item.document_url}
Summary: ${item.summary?.substring(0, 500)}...
`;
      } else if (searchType === 'safety') {
        return `
Safety Update ${index + 1}:
Product: ${item.product_name}
Type: ${item.safety_type}
Date: ${item.date_posted}
Description: ${item.description}
Action Required: ${item.regulatory_action || 'None specified'}
PRAC Recommendation: ${item.prac_recommendation || 'N/A'}
`;
      }
      return `Result ${index + 1}: ${JSON.stringify(item)}`;
    }).join('\n---\n');
  }
  
  private async fallbackSearch(input: z.infer<typeof EMASearchSchema>): Promise<string> {
    // Fallback implementation for when API is not available
    return `EMA database search for "${input.query}" is temporarily unavailable. Please try again later or use alternative regulatory databases.`;
  }
}
