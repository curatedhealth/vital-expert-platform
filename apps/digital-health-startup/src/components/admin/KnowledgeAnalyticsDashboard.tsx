'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, FileText, BarChart3, Clock, Star, Eye, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsData {
  // Quality metrics
  avgQualityScore: number;
  avgCredibilityScore: number;
  avgFreshnessScore: number;
  
  // Content distribution
  totalDocuments: number;
  documentsByDomain: Record<string, number>;
  documentsByFirm: Record<string, number>;
  documentsByReportType: Record<string, number>;
  
  // Quality distribution
  qualityDistribution: {
    excellent: number;  // 9-10
    high: number;       // 7-9
    medium: number;     // 5-7
    low: number;        // 0-5
  };
  
  // Top content
  topQualityDocuments: Array<{
    id: string;
    title: string;
    firm: string;
    quality_score: number;
    credibility_score: number;
    publication_date: string;
  }>;
  
  topViewedDocuments: Array<{
    id: string;
    title: string;
    firm: string;
    view_count: number;
    domain: string;
  }>;
  
  // RAG patterns
  mostRetrievedDocuments: Array<{
    id: string;
    title: string;
    query_history_count: number;
    last_retrieved_at: string;
  }>;
  
  avgRAGPriorityWeight: number;
  
  // Engagement metrics
  totalViews: number;
  totalDownloads: number;
  avgReadTime: number;
  
  // Freshness trends
  recentDocuments: number;  // < 3 months
  staleDocuments: number;   // > 2 years
  
  // Firm statistics
  firmStats: Array<{
    firm: string;
    document_count: number;
    avg_quality: number;
    avg_views: number;
  }>;
}

export default function KnowledgeAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedDomain]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/knowledge?range=${timeRange}&domain=${selectedDomain}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base Analytics</h1>
          <p className="text-gray-600 mt-2">
            Quality trends, popular content, and RAG performance metrics
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {Object.keys(data.documentsByDomain).map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain.replace(/_/g, ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalDocuments.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              Across {Object.keys(data.documentsByDomain).length} domains
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality Score</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgQualityScore.toFixed(2)}</div>
            <div className="flex items-center mt-1">
              <Badge variant={data.avgQualityScore >= 8 ? 'success' : 'secondary'} className="text-xs">
                {data.avgQualityScore >= 9 ? 'Excellent' : data.avgQualityScore >= 7 ? 'High' : 'Medium'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalViews.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {data.totalDownloads.toLocaleString()} downloads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Read Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(data.avgReadTime / 60)}m</div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(data.avgReadTime)} seconds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Score Distribution</CardTitle>
          <CardDescription>
            Distribution of documents across quality tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="font-medium">Excellent (9-10)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{data.qualityDistribution.excellent}</span>
                <Badge variant="outline">
                  {((data.qualityDistribution.excellent / data.totalDocuments) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(data.qualityDistribution.excellent / data.totalDocuments) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="font-medium">High (7-9)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{data.qualityDistribution.high}</span>
                <Badge variant="outline">
                  {((data.qualityDistribution.high / data.totalDocuments) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(data.qualityDistribution.high / data.totalDocuments) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span className="font-medium">Medium (5-7)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{data.qualityDistribution.medium}</span>
                <Badge variant="outline">
                  {((data.qualityDistribution.medium / data.totalDocuments) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all"
                style={{ width: `${(data.qualityDistribution.medium / data.totalDocuments) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="font-medium">Low (0-5)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{data.qualityDistribution.low}</span>
                <Badge variant="outline">
                  {((data.qualityDistribution.low / data.totalDocuments) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${(data.qualityDistribution.low / data.totalDocuments) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Quality Documents & Most Viewed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top Quality Documents
            </CardTitle>
            <CardDescription>Highest quality scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topQualityDocuments.map((doc, idx) => (
                <div key={doc.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center font-bold text-yellow-700">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{doc.firm}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        Q: {doc.quality_score.toFixed(1)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        C: {doc.credibility_score.toFixed(1)}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(doc.publication_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              Most Viewed Documents
            </CardTitle>
            <CardDescription>Highest engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topViewedDocuments.map((doc, idx) => (
                <div key={doc.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{doc.firm}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {doc.view_count.toLocaleString()} views
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {doc.domain}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RAG Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            RAG Retrieval Patterns
          </CardTitle>
          <CardDescription>
            Most frequently retrieved documents in RAG queries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.mostRetrievedDocuments.map((doc, idx) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center font-bold text-purple-700">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Retrieved {doc.query_history_count} times
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Last: {new Date(doc.last_retrieved_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average RAG Priority Weight:</span>
              <span className="text-2xl font-bold text-purple-600">
                {data.avgRAGPriorityWeight.toFixed(3)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Firm Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            Firm Performance
          </CardTitle>
          <CardDescription>
            Quality and engagement metrics by consulting firm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-medium">Firm</th>
                  <th className="text-center py-2 px-4 font-medium">Documents</th>
                  <th className="text-center py-2 px-4 font-medium">Avg Quality</th>
                  <th className="text-center py-2 px-4 font-medium">Avg Views</th>
                </tr>
              </thead>
              <tbody>
                {data.firmStats.map((firm) => (
                  <tr key={firm.firm} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{firm.firm}</td>
                    <td className="text-center py-3 px-4">{firm.document_count}</td>
                    <td className="text-center py-3 px-4">
                      <Badge
                        variant={firm.avg_quality >= 9 ? 'success' : firm.avg_quality >= 7 ? 'default' : 'secondary'}
                      >
                        {firm.avg_quality.toFixed(2)}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">{Math.round(firm.avg_views)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Freshness Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Content Freshness
          </CardTitle>
          <CardDescription>
            Age distribution of knowledge base content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Recent Content</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{data.recentDocuments}</p>
              <p className="text-xs text-green-600 mt-1">Published in last 3 months</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Mid-Age Content</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {data.totalDocuments - data.recentDocuments - data.staleDocuments}
              </p>
              <p className="text-xs text-blue-600 mt-1">3 months to 2 years old</p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700 font-medium">Stale Content</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{data.staleDocuments}</p>
              <p className="text-xs text-yellow-600 mt-1">Over 2 years old</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

