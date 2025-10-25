/**
 * RAG Analytics Component
 * Shows usage analytics and performance metrics for RAG databases
 */

'use client';

import { BarChart3, TrendingUp, Clock, Target, Database, Users } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/shared/components/ui';

interface RagAnalyticsProps {
  agentName: string;
  assignedRagDatabases: Array<{
    id: string;
    display_name: string;
    rag_type: string;
    document_count: number;
    assignment_priority?: number;
    last_used_at?: string;
  }>;
}

export const RagAnalytics: React.FC<RagAnalyticsProps> = ({
  agentName,
  assignedRagDatabases
}) => {
  // Mock analytics data - in real implementation, this would come from the database
  const mockAnalytics = {
    totalQueries: 1247,
    avgResponseTime: 340,
    avgRelevanceScore: 0.87,
    topPerformingRag: assignedRagDatabases[0]?.display_name || 'N/A',
    queryTrends: [
      { month: 'Jan', queries: 89 },
      { month: 'Feb', queries: 124 },
      { month: 'Mar', queries: 167 },
      { month: 'Apr', queries: 203 },
      { month: 'May', queries: 189 },
      { month: 'Jun', queries: 234 }
    ],
    ragUsage: assignedRagDatabases.map((rag, index) => ({
      ...rag,
      usage_count: Math.floor(Math.random() * 500) + 50,
      avg_relevance: 0.75 + (Math.random() * 0.2),
      response_time: 200 + Math.floor(Math.random() * 300)
    }))
  };

  const formatScore = (score: number): string => {
    return `${Math.round(score * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Queries</p>
                <p className="text-2xl font-bold">{analyticsData.totalQueries.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{analyticsData.avgResponseTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Relevance</p>
                <p className="text-2xl font-bold">{formatRelevanceScore(analyticsData.avgRelevanceScore)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active RAG DBs</p>
                <p className="text-2xl font-bold">{assignedRagDatabases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RAG Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            RAG Database Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsData.ragUsage.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">RAG Database</th>
                    <th className="text-left p-2 font-medium">Type</th>
                    <th className="text-left p-2 font-medium">Usage Count</th>
                    <th className="text-left p-2 font-medium">Avg Relevance</th>
                    <th className="text-left p-2 font-medium">Response Time</th>
                    <th className="text-left p-2 font-medium">Priority</th>
                    <th className="text-left p-2 font-medium">Last Used</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.ragUsage.map((rag) => (
                    <tr key={rag.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="font-medium">{rag.display_name}</div>
                      </td>
                      <td className="p-2">
                        <Badge variant={rag.rag_type === 'global' ? 'secondary' : 'default'} className="text-xs">
                          {rag.rag_type === 'global' ? 'Global' : 'Agent'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <span className="font-medium">{rag.usage_count.toLocaleString()}</span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatRelevanceScore(rag.avg_relevance)}</span>
                          <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all"
                              style={{ width: `${rag.avg_relevance * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-medium">{rag.response_time}ms</span>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">
                          {rag.assignment_priority || 50}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {rag.last_used_at ? new Date(rag.last_used_at).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No RAG Analytics Available</h3>
              <p className="text-muted-foreground">
                Assign RAG databases to {agentName} to view performance analytics.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Query Trends (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.queryTrends.map((trend, index) => (
              <div key={trend.month} className="flex items-center justify-between">
                <span className="text-sm font-medium">{trend.month}</span>
                <div className="flex items-center gap-3 flex-1 ml-4">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${(trend.queries / 250) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{trend.queries}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            RAG Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <h4 className="font-medium text-sm text-green-800">High Performance</h4>
                <p className="text-sm text-green-700">
                  Your agent maintains an excellent average relevance score of {formatRelevanceScore(analyticsData.avgRelevanceScore)},
                  indicating that RAG queries are returning highly relevant results.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <h4 className="font-medium text-sm text-blue-800">Response Time</h4>
                <p className="text-sm text-blue-700">
                  Average response time of {analyticsData.avgResponseTime}ms is within acceptable range.
                  Consider optimizing chunk sizes if response time increases above 500ms.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
              <div>
                <h4 className="font-medium text-sm text-yellow-800">Usage Patterns</h4>
                <p className="text-sm text-yellow-700">
                  Query volume has been increasing monthly. Consider adding more specialized RAG databases
                  to handle growing demand and maintain response quality.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};