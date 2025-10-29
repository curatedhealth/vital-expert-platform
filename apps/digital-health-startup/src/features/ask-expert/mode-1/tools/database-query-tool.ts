/**
 * Database Query Tool
 * 
 * Queries internal database for clinical trials, regulatory history, etc.
 * Provides structured access to company data with proper tenant isolation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BaseTool, ToolContext, ToolExecutionResult } from './base-tool';

export class DatabaseQueryTool extends BaseTool {
  readonly name = 'database_query';
  readonly description =
    'Query internal database for clinical trials, regulatory history, or company data. Provides structured access to organizational knowledge with proper filtering.';

  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    super();
    this.supabase = createClient(supabaseUrl, supabaseKey);
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
            query_type: {
              type: 'string',
              enum: ['clinical_trials', 'regulatory_history', 'company_data', 'agents'],
              description: 'Type of data to query from the database',
            },
            filters: {
              type: 'object',
              description: 'Filter criteria for the query (e.g., {status: "active", phase: "3"})',
              additionalProperties: true,
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return',
              default: 10,
            },
          },
          required: ['query_type'],
        },
      },
    };
  }

  async execute(
    input: Record<string, any>,
    context: ToolContext
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    try {
      this.validateInput(input);

      const queryType = input.query_type;
      const filters = input.filters || {};
      const limit = input.limit || 10;
      const tenantId = context.tenant_id;

      console.log(`🗄️  [Database Query] Executing ${queryType} query`);

      let results: any[];

      switch (queryType) {
        case 'clinical_trials':
          results = await this.queryClinicalTrials(filters, tenantId, limit);
          break;

        case 'regulatory_history':
          results = await this.queryRegulatoryHistory(filters, tenantId, limit);
          break;

        case 'company_data':
          results = await this.queryCompanyData(filters, tenantId, limit);
          break;

        case 'agents':
          results = await this.queryAgents(filters, tenantId, limit);
          break;

        default:
          throw new Error(`Unknown query type: ${queryType}`);
      }

      const duration_ms = Date.now() - startTime;

      return {
        success: true,
        result: {
          query_type: queryType,
          results,
          count: results.length,
        },
        duration_ms,
      };
    } catch (error) {
      const duration_ms = Date.now() - startTime;
      console.error(`❌ [Database Query] Query failed:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database query error',
        duration_ms,
      };
    }
  }

  private async queryClinicalTrials(
    filters: Record<string, any>,
    tenantId?: string,
    limit: number = 10
  ): Promise<any[]> {
    // Placeholder: Query clinical_trials table if it exists
    // For now, return empty array as this table may not exist yet
    console.log(`   Querying clinical trials with filters:`, filters);
    return [];
  }

  private async queryRegulatoryHistory(
    filters: Record<string, any>,
    tenantId?: string,
    limit: number = 10
  ): Promise<any[]> {
    // Placeholder: Query regulatory history
    console.log(`   Querying regulatory history with filters:`, filters);
    return [];
  }

  private async queryCompanyData(
    filters: Record<string, any>,
    tenantId?: string,
    limit: number = 10
  ): Promise<any[]> {
    // Placeholder: Query company/project data
    console.log(`   Querying company data with filters:`, filters);
    return [];
  }

  private async queryAgents(
    filters: Record<string, any>,
    tenantId?: string,
    limit: number = 10
  ): Promise<any[]> {
    let query = this.supabase
      .from('agents')
      .select('id, name, display_name, description, capabilities, tier, status')
      .limit(limit);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.tier) {
      query = query.eq('tier', filters.tier);
    }

    if (filters.search) {
      // Full-text search on name or description
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    return data || [];
  }
}

