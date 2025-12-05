'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  Users,
  Zap,
  Target,
  AlertCircle,
  CheckCircle2,
  Activity,
  RefreshCw,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Hash,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
interface SearchMetrics {
  totalSearches: number;
  searchesTrend: number; // percentage change
  avgResponseTime: number;
  responseTimeTrend: number;
  successRate: number;
  successRateTrend: number;
  uniqueUsers: number;
  usersTrend: number;
}

interface SourcePerformance {
  source: string;
  queries: number;
  avgTime: number;
  successRate: number;
  avgResults: number;
}

interface PopularQuery {
  query: string;
  count: number;
  avgTime: number;
  avgResults: number;
  trend: 'up' | 'down' | 'stable';
}

interface StrategyPerformance {
  strategy: string;
  queries: number;
  avgTime: number;
  avgScore: number;
  successRate: number;
}

interface DailyMetric {
  date: string;
  searches: number;
  avgTime: number;
  successRate: number;
}

interface AnalyticsData {
  metrics: SearchMetrics;
  sourcePerformance: SourcePerformance[];
  popularQueries: PopularQuery[];
  strategyPerformance: StrategyPerformance[];
  dailyMetrics: DailyMetric[];
  failedQueries: { query: string; error: string; count: number }[];
}

// Mini Chart Component (simplified bar chart)
function MiniBarChart({
  data,
  height = 60,
  color = '#6366f1',
}: {
  data: number[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 rounded-t transition-all"
          style={{
            height: `${((value - min) / range) * 100}%`,
            minHeight: 4,
            backgroundColor: color,
            opacity: 0.3 + (i / data.length) * 0.7,
          }}
        />
      ))}
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  trend,
  trendLabel,
  icon,
  suffix = '',
  chartData,
  chartColor,
}: {
  title: string;
  value: string | number;
  trend: number;
  trendLabel: string;
  icon: React.ReactNode;
  suffix?: string;
  chartData?: number[];
  chartColor?: string;
}) {
  const isPositive = trend > 0;
  const trendIcon = isPositive ? (
    <ArrowUpRight className="h-3 w-3" />
  ) : trend < 0 ? (
    <ArrowDownRight className="h-3 w-3" />
  ) : null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              {icon}
              <span className="text-xs font-medium">{title}</span>
            </div>
            <p className="text-2xl font-bold">
              {value}
              {suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
            </p>
            <div
              className={`flex items-center gap-1 text-xs ${
                isPositive ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground'
              }`}
            >
              {trendIcon}
              <span>
                {trend > 0 ? '+' : ''}
                {trend.toFixed(1)}% {trendLabel}
              </span>
            </div>
          </div>
          {chartData && (
            <div className="w-20">
              <MiniBarChart data={chartData} height={40} color={chartColor} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Performance Table Row
function PerformanceRow({
  rank,
  label,
  value1,
  value2,
  value3,
  value4,
  barColor,
  barValue,
}: {
  rank?: number;
  label: string;
  value1: string | number;
  value2: string | number;
  value3: string | number;
  value4?: string | number;
  barColor?: string;
  barValue?: number;
}) {
  return (
    <div className="flex items-center gap-4 py-2 border-b last:border-0">
      {rank !== undefined && (
        <span className="text-sm font-medium text-muted-foreground w-6">{rank}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        {barValue !== undefined && (
          <div className="w-full h-1 bg-muted rounded-full mt-1">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, barValue)}%`,
                backgroundColor: barColor || '#6366f1',
              }}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="w-16 text-right">{value1}</span>
        <span className="w-16 text-right">{value2}</span>
        <span className="w-16 text-right">{value3}</span>
        {value4 !== undefined && <span className="w-16 text-right">{value4}</span>}
      </div>
    </div>
  );
}

// Generate mock analytics data
function generateMockAnalytics(): AnalyticsData {
  return {
    metrics: {
      totalSearches: 12847,
      searchesTrend: 15.2,
      avgResponseTime: 342,
      responseTimeTrend: -8.5,
      successRate: 94.7,
      successRateTrend: 2.1,
      uniqueUsers: 234,
      usersTrend: 12.8,
    },
    sourcePerformance: [
      { source: 'Knowledge Base', queries: 5420, avgTime: 245, successRate: 98.2, avgResults: 12.5 },
      { source: 'PubMed', queries: 3215, avgTime: 520, successRate: 92.1, avgResults: 8.3 },
      { source: 'ClinicalTrials', queries: 2180, avgTime: 680, successRate: 89.5, avgResults: 15.2 },
      { source: 'FDA OpenFDA', queries: 1420, avgTime: 380, successRate: 91.8, avgResults: 6.1 },
      { source: 'Unified Search', queries: 612, avgTime: 890, successRate: 87.3, avgResults: 24.7 },
    ],
    popularQueries: [
      { query: 'adalimumab efficacy', count: 234, avgTime: 320, avgResults: 15, trend: 'up' },
      { query: 'rheumatoid arthritis treatment', count: 189, avgTime: 410, avgResults: 22, trend: 'up' },
      { query: 'FDA approval process', count: 156, avgTime: 280, avgResults: 8, trend: 'stable' },
      { query: 'TNF-alpha inhibitors', count: 142, avgTime: 350, avgResults: 18, trend: 'up' },
      { query: 'phase 3 clinical trials', count: 128, avgTime: 560, avgResults: 31, trend: 'down' },
      { query: 'biosimilar regulations', count: 98, avgTime: 290, avgResults: 12, trend: 'stable' },
      { query: 'secukinumab dosing', count: 87, avgTime: 240, avgResults: 9, trend: 'up' },
      { query: 'EMA guidelines', count: 76, avgTime: 380, avgResults: 14, trend: 'down' },
    ],
    strategyPerformance: [
      { strategy: 'Hybrid', queries: 6840, avgTime: 380, avgScore: 0.82, successRate: 96.1 },
      { strategy: 'Vector', queries: 3120, avgTime: 220, avgScore: 0.78, successRate: 94.2 },
      { strategy: 'Keyword', queries: 1980, avgTime: 180, avgScore: 0.71, successRate: 91.5 },
      { strategy: 'Entity', queries: 907, avgTime: 290, avgScore: 0.85, successRate: 93.8 },
    ],
    dailyMetrics: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      searches: 800 + Math.floor(Math.random() * 400),
      avgTime: 300 + Math.floor(Math.random() * 100),
      successRate: 90 + Math.random() * 8,
    })),
    failedQueries: [
      { query: 'rare disease treatment xyz', error: 'No results found', count: 12 },
      { query: 'clinical trial NCT9999999', error: 'Invalid NCT ID', count: 8 },
      { query: '', error: 'Empty query', count: 5 },
    ],
  };
}

// Main Search Analytics Dashboard
export function SearchAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | '90d'>('14d');

  // Fetch analytics data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/knowledge/analytics?range=${timeRange}`);
      // const data = await response.json();
      // setData(data);

      // Mock data
      setData(generateMockAnalytics());
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Search Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Performance metrics and usage insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
            <SelectTrigger className="w-[130px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="14d">Last 14 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Searches"
          value={data.metrics.totalSearches.toLocaleString()}
          trend={data.metrics.searchesTrend}
          trendLabel="vs previous period"
          icon={<Search className="h-4 w-4" />}
          chartData={data.dailyMetrics.map((d) => d.searches)}
          chartColor="#6366f1"
        />
        <MetricCard
          title="Avg Response Time"
          value={data.metrics.avgResponseTime}
          suffix="ms"
          trend={data.metrics.responseTimeTrend}
          trendLabel="vs previous period"
          icon={<Clock className="h-4 w-4" />}
          chartData={data.dailyMetrics.map((d) => d.avgTime)}
          chartColor="#22c55e"
        />
        <MetricCard
          title="Success Rate"
          value={data.metrics.successRate.toFixed(1)}
          suffix="%"
          trend={data.metrics.successRateTrend}
          trendLabel="vs previous period"
          icon={<CheckCircle2 className="h-4 w-4" />}
          chartData={data.dailyMetrics.map((d) => d.successRate)}
          chartColor="#f59e0b"
        />
        <MetricCard
          title="Unique Users"
          value={data.metrics.uniqueUsers}
          trend={data.metrics.usersTrend}
          trendLabel="vs previous period"
          icon={<Users className="h-4 w-4" />}
          chartColor="#ec4899"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Source Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Source Performance
            </CardTitle>
            <CardDescription>Search performance by data source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-4 pb-2 text-xs font-medium text-muted-foreground">
                <span className="flex-1">Source</span>
                <span className="w-16 text-right">Queries</span>
                <span className="w-16 text-right">Avg Time</span>
                <span className="w-16 text-right">Success</span>
                <span className="w-16 text-right">Avg Results</span>
              </div>
              {data.sourcePerformance.map((source) => (
                <PerformanceRow
                  key={source.source}
                  label={source.source}
                  value1={source.queries.toLocaleString()}
                  value2={`${source.avgTime}ms`}
                  value3={`${source.successRate}%`}
                  value4={source.avgResults.toFixed(1)}
                  barValue={(source.queries / data.sourcePerformance[0].queries) * 100}
                  barColor="#6366f1"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strategy Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Strategy Performance
            </CardTitle>
            <CardDescription>Search strategy comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-4 pb-2 text-xs font-medium text-muted-foreground">
                <span className="flex-1">Strategy</span>
                <span className="w-16 text-right">Queries</span>
                <span className="w-16 text-right">Avg Time</span>
                <span className="w-16 text-right">Avg Score</span>
                <span className="w-16 text-right">Success</span>
              </div>
              {data.strategyPerformance.map((strategy) => (
                <PerformanceRow
                  key={strategy.strategy}
                  label={strategy.strategy}
                  value1={strategy.queries.toLocaleString()}
                  value2={`${strategy.avgTime}ms`}
                  value3={strategy.avgScore.toFixed(2)}
                  value4={`${strategy.successRate}%`}
                  barValue={(strategy.queries / data.strategyPerformance[0].queries) * 100}
                  barColor="#22c55e"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Popular Queries
          </CardTitle>
          <CardDescription>Most frequently searched terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-center gap-4 pb-2 text-xs font-medium text-muted-foreground">
              <span className="w-6">#</span>
              <span className="flex-1">Query</span>
              <span className="w-16 text-right">Count</span>
              <span className="w-16 text-right">Avg Time</span>
              <span className="w-16 text-right">Results</span>
            </div>
            {data.popularQueries.map((q, i) => (
              <div key={q.query} className="flex items-center gap-4 py-2 border-b last:border-0">
                <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{q.query}</span>
                  {q.trend === 'up' && (
                    <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900">
                      <TrendingUp className="h-3 w-3" />
                    </Badge>
                  )}
                  {q.trend === 'down' && (
                    <Badge variant="secondary" className="text-red-600 bg-red-100 dark:bg-red-900">
                      <TrendingDown className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
                <span className="w-16 text-right text-sm text-muted-foreground">
                  {q.count.toLocaleString()}
                </span>
                <span className="w-16 text-right text-sm text-muted-foreground">{q.avgTime}ms</span>
                <span className="w-16 text-right text-sm text-muted-foreground">{q.avgResults}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Failed Queries */}
      {data.failedQueries.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              Failed Queries
            </CardTitle>
            <CardDescription>Queries that returned errors or no results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.failedQueries.map((q, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30"
                >
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">
                      {q.query || '(empty query)'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {q.error}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{q.count}x</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SearchAnalyticsDashboard;
