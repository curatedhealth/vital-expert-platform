import { createClient } from '@supabase/supabase-js';

export interface QueryPerformanceMetrics {
  queryText: string;
  calls: number;
  totalTime: number;
  meanTime: number;
  rows: number;
  sharedBlksHit: number;
  sharedBlksRead: number;
}

export interface IndexUsageStats {
  schemaname: string;
  tablename: string;
  indexname: string;
  idxScan: number;
  idxTupRead: number;
  idxTupFetch: number;
}

export interface TableStats {
  schemaname: string;
  tablename: string;
  nTupIns: number;
  nTupUpd: number;
  nTupDel: number;
  nLiveTup: number;
  nDeadTup: number;
  lastVacuum: string | null;
  lastAutovacuum: string | null;
  lastAnalyze: string | null;
  lastAutoanalyze: string | null;
}

export interface OptimizationRecommendation {
  type: 'index' | 'query' | 'maintenance' | 'configuration';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  sql?: string;
}

export class QueryOptimizationService {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Analyze query performance
   */
  async analyzeQueryPerformance(): Promise<QueryPerformanceMetrics[]> {
    try {
      const { data, error } = await this.supabase.rpc('analyze_query_performance');
      
      if (error) {
        console.error('Error analyzing query performance:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error analyzing query performance:', error);
      return [];
    }
  }

  /**
   * Get index usage statistics
   */
  async getIndexUsageStats(): Promise<IndexUsageStats[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_index_usage_stats');
      
      if (error) {
        console.error('Error getting index usage stats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting index usage stats:', error);
      return [];
    }
  }

  /**
   * Get table statistics
   */
  async getTableStats(): Promise<TableStats[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_table_stats');
      
      if (error) {
        console.error('Error getting table stats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting table stats:', error);
      return [];
    }
  }

  /**
   * Refresh materialized views
   */
  async refreshMaterializedViews(): Promise<boolean> {
    try {
      const { error } = await this.supabase.rpc('refresh_materialized_views');
      
      if (error) {
        console.error('Error refreshing materialized views:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error refreshing materialized views:', error);
      return false;
    }
  }

  /**
   * Run query optimization
   */
  async optimizeQueries(): Promise<boolean> {
    try {
      const { error } = await this.supabase.rpc('optimize_queries');
      
      if (error) {
        console.error('Error optimizing queries:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error optimizing queries:', error);
      return false;
    }
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];
    
    try {
      // Analyze query performance
      const queryMetrics = await this.analyzeQueryPerformance();
      const indexStats = await this.getIndexUsageStats();
      const tableStats = await this.getTableStats();

      // Find slow queries
      const slowQueries = queryMetrics.filter(q => q.meanTime > 100); // Queries taking more than 100ms on average
      if (slowQueries.length > 0) {
        recommendations.push({
          type: 'query',
          priority: 'high',
          title: 'Slow Queries Detected',
          description: `${slowQueries.length} queries are taking more than 100ms on average`,
          impact: 'High - User experience degradation',
          effort: 'medium',
          sql: slowQueries.map(q => q.queryText).join('\n\n')
        });
      }

      // Find unused indexes
      const unusedIndexes = indexStats.filter(idx => idx.idxScan === 0);
      if (unusedIndexes.length > 0) {
        recommendations.push({
          type: 'index',
          priority: 'medium',
          title: 'Unused Indexes',
          description: `${unusedIndexes.length} indexes are not being used`,
          impact: 'Medium - Storage waste and maintenance overhead',
          effort: 'low',
          sql: unusedIndexes.map(idx => `DROP INDEX IF EXISTS ${idx.indexname};`).join('\n')
        });
      }

      // Find tables that need vacuum
      const tablesNeedingVacuum = tableStats.filter(t => 
        t.nDeadTup > t.nLiveTup * 0.1 && // More than 10% dead tuples
        (t.lastVacuum === null || new Date(t.lastVacuum) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Not vacuumed in last 7 days
      );
      if (tablesNeedingVacuum.length > 0) {
        recommendations.push({
          type: 'maintenance',
          priority: 'medium',
          title: 'Tables Need Vacuum',
          description: `${tablesNeedingVacuum.length} tables have high dead tuple ratio and need vacuum`,
          impact: 'Medium - Query performance degradation',
          effort: 'low',
          sql: tablesNeedingVacuum.map(t => `VACUUM ANALYZE ${t.tablename};`).join('\n')
        });
      }

      // Find tables that need analyze
      const tablesNeedingAnalyze = tableStats.filter(t => 
        t.lastAnalyze === null || new Date(t.lastAnalyze) < new Date(Date.now() - 24 * 60 * 60 * 1000) // Not analyzed in last 24 hours
      );
      if (tablesNeedingAnalyze.length > 0) {
        recommendations.push({
          type: 'maintenance',
          priority: 'low',
          title: 'Tables Need Analyze',
          description: `${tablesNeedingAnalyze.length} tables need statistics update`,
          impact: 'Low - Query planning accuracy',
          effort: 'low',
          sql: tablesNeedingAnalyze.map(t => `ANALYZE ${t.tablename};`).join('\n')
        });
      }

      // Check for missing indexes on frequently queried columns
      const frequentQueries = queryMetrics.filter(q => q.calls > 100);
      const missingIndexRecommendations = this.identifyMissingIndexes(frequentQueries);
      recommendations.push(...missingIndexRecommendations);

      return recommendations;

    } catch (error) {
      console.error('Error getting optimization recommendations:', error);
      return [];
    }
  }

  /**
   * Identify missing indexes based on query patterns
   */
  private identifyMissingIndexes(queries: QueryPerformanceMetrics[]): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    // Look for common patterns that might benefit from indexes
    const patterns = [
      {
        pattern: /WHERE.*organization_id.*=.*\?/i,
        index: 'CREATE INDEX IF NOT EXISTS idx_organization_id ON {table}(organization_id);',
        description: 'Queries filtering by organization_id'
      },
      {
        pattern: /WHERE.*user_id.*=.*\?/i,
        index: 'CREATE INDEX IF NOT EXISTS idx_user_id ON {table}(user_id);',
        description: 'Queries filtering by user_id'
      },
      {
        pattern: /WHERE.*status.*=.*\?/i,
        index: 'CREATE INDEX IF NOT EXISTS idx_status ON {table}(status);',
        description: 'Queries filtering by status'
      },
      {
        pattern: /ORDER BY.*created_at/i,
        index: 'CREATE INDEX IF NOT EXISTS idx_created_at ON {table}(created_at);',
        description: 'Queries ordering by created_at'
      },
      {
        pattern: /WHERE.*timestamp.*>=.*\?/i,
        index: 'CREATE INDEX IF NOT EXISTS idx_timestamp ON {table}(timestamp);',
        description: 'Queries filtering by timestamp range'
      }
    ];

    for (const query of queries) {
      for (const pattern of patterns) {
        if (pattern.pattern.test(query.queryText)) {
          // Extract table name from query (simplified)
          const tableMatch = query.queryText.match(/FROM\s+(\w+)/i);
          if (tableMatch) {
            const tableName = tableMatch[1];
            const indexSql = pattern.index.replace('{table}', tableName);
            
            recommendations.push({
              type: 'index',
              priority: 'medium',
              title: `Missing Index for ${tableName}`,
              description: pattern.description,
              impact: 'Medium - Query performance improvement',
              effort: 'low',
              sql: indexSql
            });
          }
        }
      }
    }

    return recommendations;
  }

  /**
   * Execute optimization recommendation
   */
  async executeRecommendation(recommendation: OptimizationRecommendation): Promise<boolean> {
    if (!recommendation.sql) {
      return false;
    }

    try {
      // Split SQL into individual statements
      const statements = recommendation.sql.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await this.supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.error('Error executing SQL:', error);
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error executing recommendation:', error);
      return false;
    }
  }

  /**
   * Get performance dashboard data
   */
  async getPerformanceDashboard(): Promise<{
    slowQueries: QueryPerformanceMetrics[];
    unusedIndexes: IndexUsageStats[];
    tableStats: TableStats[];
    recommendations: OptimizationRecommendation[];
  }> {
    const [slowQueries, unusedIndexes, tableStats, recommendations] = await Promise.all([
      this.analyzeQueryPerformance().then(queries => queries.filter(q => q.meanTime > 50)),
      this.getIndexUsageStats().then(indexes => indexes.filter(idx => idx.idxScan === 0)),
      this.getTableStats(),
      this.getOptimizationRecommendations()
    ]);

    return {
      slowQueries,
      unusedIndexes,
      tableStats,
      recommendations
    };
  }
}

// Singleton instance
let queryOptimizationService: QueryOptimizationService | null = null;

export function getQueryOptimizationService(): QueryOptimizationService {
  if (!queryOptimizationService) {
    queryOptimizationService = new QueryOptimizationService();
  }
  return queryOptimizationService;
}
