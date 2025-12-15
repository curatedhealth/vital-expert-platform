/**
 * Database Query Tool
 * 
 * Queries internal database for clinical trials, regulatory history, etc.
 * Provides structured access to company data with proper tenant isolation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BaseTool, ToolContext, ToolExecutionResult } from './base-tool';
import { logger } from '@vital/utils';

export type DatabaseQueryType =
  | 'clinical_trials'
  | 'regulatory_history'
  | 'company_data'
  | 'agents';

export interface DatabaseQueryFilters {
  status?: string;
  tier?: number;
  search?: string;
  domain?: string;
  tags?: string[];
  start_date?: string;
  end_date?: string;
  document_type?: string;
}

export interface DatabaseQueryToolInput {
  query_type: DatabaseQueryType;
  filters?: DatabaseQueryFilters;
  limit?: number;
}

export interface KnowledgeDocumentResult {
  id: string;
  title: string;
  domain?: string | null;
  status?: string | null;
  tags?: string[];
  summary?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AgentQueryResult {
  id: string;
  name: string;
  display_name: string;
  description: string;
  capabilities: string[];
  tier: number | null;
  status: string | null;
  knowledge_domains: string[];
  tools: string[];
}

export type DatabaseQueryResult =
  | KnowledgeDocumentResult[]
  | AgentQueryResult[];

export class DatabaseQueryTool extends BaseTool<DatabaseQueryToolInput, { query_type: DatabaseQueryType; results: DatabaseQueryResult; count: number }> {
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
    input: DatabaseQueryToolInput,
    context: ToolContext
  ): Promise<ToolExecutionResult<{ query_type: DatabaseQueryType; results: DatabaseQueryResult; count: number }>> {
    const startTime = Date.now();

    try {
      this.validateInput(input);

      const queryType = input.query_type;
      const filters = input.filters ?? {};
      const limit = input.limit ?? 10;
      const tenantId = typeof context.tenant_id === 'string' ? context.tenant_id : undefined;

      logger.info('Database query executing', { queryType, filters, tenantId, limit });

      let results: DatabaseQueryResult;

      switch (queryType) {
        case 'clinical_trials':
          results = await this.queryKnowledgeDocuments(
            { ...filters, domain: filters.domain ?? 'clinical_trials', document_type: filters.document_type ?? 'clinical_trial' },
            tenantId,
            limit
          );
          break;

        case 'regulatory_history':
          results = await this.queryKnowledgeDocuments(
            { ...filters, domain: filters.domain ?? 'regulatory' },
            tenantId,
            limit
          );
          break;

        case 'company_data':
          results = await this.queryKnowledgeDocuments(
            { ...filters, domain: filters.domain ?? 'company_intelligence' },
            tenantId,
            limit
          );
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
          count: Array.isArray(results) ? results.length : 0,
        },
        duration_ms,
      };
    } catch (error) {
      const duration_ms = Date.now() - startTime;
      logger.error('Database query failed', { error, queryType, filters, tenantId });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database query error',
        duration_ms,
      };
    }
  }

  private async queryAgents(
    filters: DatabaseQueryFilters,
    tenantId?: string,
    limit: number = 10
  ): Promise<AgentQueryResult[]> {
    let query = this.supabase
      .from('agents')
      .select('id, name, display_name, description, capabilities, tier, status, metadata')
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

    if (tenantId) {
      // Tenant isolation: prefer tenant_id or organization_id columns if present
      query = query.or(`tenant_id.eq.${tenantId},organization_id.eq.${tenantId}`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    return (data || []).map((agent: Record<string, unknown>) => {
      const metadata = (agent.metadata as Record<string, unknown> | null) ?? {};
      const knowledgeDomains = Array.isArray(metadata.knowledge_domains)
        ? metadata.knowledge_domains.filter((domain): domain is string => typeof domain === 'string')
        : Array.isArray((agent as Record<string, unknown>).knowledge_domains)
          ? ((agent as Record<string, unknown>).knowledge_domains as unknown[]).filter((domain): domain is string => typeof domain === 'string')
          : [];

      const tools = Array.isArray(metadata.tools)
        ? metadata.tools.filter((tool): tool is string => typeof tool === 'string')
        : [];

      return {
        id: String(agent.id),
        name: String(agent.name ?? ''),
        display_name: String(agent.display_name ?? agent.name ?? ''),
        description: String(agent.description ?? ''),
        capabilities: Array.isArray(agent.capabilities) ? (agent.capabilities as string[]) : [],
        tier: typeof agent.tier === 'number' ? agent.tier : null,
        status: typeof agent.status === 'string' ? agent.status : null,
        knowledge_domains: knowledgeDomains,
        tools,
      };
    });
  }

  private async queryKnowledgeDocuments(
    filters: DatabaseQueryFilters,
    tenantId?: string,
    limit: number = 10
  ): Promise<KnowledgeDocumentResult[]> {
    let query = this.supabase
      .from('knowledge_documents')
      .select('id, title, status, domain, tags, metadata, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (tenantId) {
      query = query.or(`tenant_id.eq.${tenantId},organization_id.eq.${tenantId}`);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.domain) {
      query = query.eq('domain', filters.domain);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      if (error.code === '42703') {
        // Column not found (older schema). Retry with minimal column selection.
        const fallback = await this.supabase
          .from('knowledge_documents')
          .select('id, title, metadata, created_at, updated_at')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (fallback.error) {
          throw new Error(`Knowledge documents query failed: ${fallback.error.message}`);
        }

        return this.mapKnowledgeDocuments(fallback.data ?? [], filters);
      }

      throw new Error(`Knowledge documents query failed: ${error.message}`);
    }

    return this.mapKnowledgeDocuments(data ?? [], filters);
  }

  private mapKnowledgeDocuments(
    rows: Array<Record<string, unknown>>,
    filters: DatabaseQueryFilters
  ): KnowledgeDocumentResult[] {
    return rows
      .map((row) => {
        const metadata = (row.metadata as Record<string, unknown> | null) ?? {};
        const status =
          (typeof row.status === 'string' && row.status) ||
          (typeof metadata.status === 'string' ? metadata.status : null);
        const domain =
          (typeof row.domain === 'string' && row.domain) ||
          (typeof metadata.domain === 'string' ? metadata.domain : null) ||
          (typeof metadata.category === 'string' ? metadata.category : null);

        const summary =
          typeof (row as Record<string, unknown>).summary === 'string'
            ? ((row as Record<string, unknown>).summary as string)
            : typeof metadata.description === 'string'
              ? metadata.description
              : null;

        const tags = Array.isArray(row.tags)
          ? row.tags.filter((tag): tag is string => typeof tag === 'string')
          : Array.isArray(metadata.tags)
            ? (metadata.tags as unknown[]).filter((tag): tag is string => typeof tag === 'string')
            : [];

        return {
          id: String(row.id),
          title: typeof row.title === 'string' ? row.title : 'Untitled document',
          domain,
          status,
          tags,
          summary,
          created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
          updated_at: typeof row.updated_at === 'string' ? row.updated_at : undefined,
          metadata,
        };
      })
      .filter((doc) => {
        if (filters.document_type) {
          const docType =
            (doc.metadata?.document_type as string | undefined) ||
            (doc.metadata?.type as string | undefined);
          if (!docType || docType !== filters.document_type) {
            return false;
          }
        }
        return true;
      });
  }
}
