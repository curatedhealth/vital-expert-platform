'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Target,
  Zap,
  BarChart3,
  Users,
  CheckCircle2,
  AlertCircle,
  Info,
  DollarSign,
  Scale,
  Award,
  MessageSquare,
  Send,
  Loader2,
  Brain,
  Lightbulb
} from 'lucide-react';

interface ValueInsight {
  type: 'distribution' | 'opportunity' | 'ai_readiness' | 'driver' | 'strategic' | 'impact' | 'benchmark' | 'benefit';
  title: string;
  description: string;
  metric: number;
  trend?: 'up' | 'down' | 'stable';
  actionable: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  evidence: {
    data_points: number;
    confidence: number;
    source: string;
  };
}

interface InsightsResponse {
  success: boolean;
  insights: ValueInsight[];
  metadata: {
    generated_at: string;
    tenant_id: string;
    total_insights: number;
    actionable_insights: number;
    total_jtbds: number;
  };
}

interface InvestigatorResponse {
  success: boolean;
  response: string;
  analysis_type?: string;
  recommendations: Array<{
    text: string;
    priority: string;
    category: string;
  }>;
  citations: Array<{
    source: string;
    type: string;
  }>;
  confidence: number;
  model_used: string;
  reasoning_steps: string[];
  timestamp: string;
}

interface Suggestion {
  question: string;
  category: string;
  description: string;
}

const ICON_MAP = {
  distribution: BarChart3,
  opportunity: Target,
  ai_readiness: Zap,
  driver: Users,
  strategic: Sparkles,
  impact: DollarSign,
  benchmark: Scale,
  benefit: Award
};

const PRIORITY_COLORS = {
  critical: 'destructive',
  high: 'default',
  medium: 'secondary',
  low: 'outline'
} as const;

const PRIORITY_ICONS = {
  critical: AlertCircle,
  high: AlertCircle,
  medium: Info,
  low: CheckCircle2
};

interface AIPoweredInsightProps {
  tenantId?: string;
  compact?: boolean;
}

export function AIPoweredInsight({ tenantId, compact = false }: AIPoweredInsightProps) {
  const [insights, setInsights] = useState<ValueInsight[]>([]);
  const [metadata, setMetadata] = useState<InsightsResponse['metadata'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Value Investigator state
  const [query, setQuery] = useState('');
  const [investigating, setInvestigating] = useState(false);
  const [investigatorResponse, setInvestigatorResponse] = useState<InvestigatorResponse | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeTab, setActiveTab] = useState('insights');

  // Fetch static insights
  useEffect(() => {
    async function fetchInsights() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (tenantId) params.set('tenant_id', tenantId);

        const response = await fetch(`/api/value/insights?${params}`);
        const data: InsightsResponse = await response.json();

        if (data.success) {
          setInsights(data.insights);
          setMetadata(data.metadata);
          setError(null);
        } else {
          setError('Failed to generate insights');
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError('Failed to load insights');
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [tenantId]);

  // Fetch suggestions
  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const response = await fetch('/api/value/investigate');
        const data = await response.json();
        if (data.suggestions) {
          setSuggestions(data.suggestions);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }

    fetchSuggestions();
  }, []);

  // Investigate with Value Investigator agent
  const handleInvestigate = useCallback(async (questionQuery?: string) => {
    const queryToUse = questionQuery || query;
    if (!queryToUse.trim()) return;

    try {
      setInvestigating(true);
      setActiveTab('investigate');

      const response = await fetch('/api/value/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToUse,
          tenant_id: tenantId,
        }),
      });

      const data: InvestigatorResponse = await response.json();
      setInvestigatorResponse(data);
      setQuery('');
    } catch (err) {
      console.error('Error investigating:', err);
      setInvestigatorResponse({
        success: false,
        response: 'Failed to connect to the Value Investigator. Please try again.',
        recommendations: [],
        citations: [],
        confidence: 0,
        model_used: 'error',
        reasoning_steps: [],
        timestamp: new Date().toISOString(),
      });
    } finally {
      setInvestigating(false);
    }
  }, [query, tenantId]);

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-neutral-400" />;
    }
  };

  const renderInsightCard = (insight: ValueInsight, index: number) => {
    const Icon = ICON_MAP[insight.type];

    return (
      <Alert
        key={index}
        className={`relative border-l-4 ${
          insight.priority === 'critical'
            ? 'border-l-red-500 bg-red-50 dark:bg-red-950/10'
            : insight.priority === 'high'
            ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/10'
            : insight.priority === 'medium'
            ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/10'
            : 'border-l-neutral-300 bg-neutral-50 dark:bg-neutral-950/10'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="font-medium text-sm leading-tight flex items-center gap-1.5">
                {insight.title}
                {getTrendIcon(insight.trend)}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant={PRIORITY_COLORS[insight.priority]} className="text-xs px-1.5 py-0">
                  {insight.priority}
                </Badge>
                {insight.actionable && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                    Action
                  </Badge>
                )}
              </div>
            </div>

            <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
              {insight.description}
            </AlertDescription>

            {!compact && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  {insight.evidence.data_points} points
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {Math.round(insight.evidence.confidence * 100)}%
                </span>
                <span className="italic truncate">
                  {insight.evidence.source}
                </span>
              </div>
            )}
          </div>
        </div>
      </Alert>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className={compact ? 'pb-2' : undefined}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Analyzing ontology data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    // Compact mode - just show insights
    const displayInsights = insights.slice(0, 3);

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            {metadata?.actionable_insights} actionable from {metadata?.total_insights} insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayInsights.map((insight, index) => renderInsightCard(insight, index))}

          {insights.length > 3 && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              +{insights.length - 3} more insights available
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full mode with tabs
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI-Powered Value Analysis
        </CardTitle>
        <CardDescription>
          {metadata?.actionable_insights} actionable from {metadata?.total_insights} insights | {metadata?.total_jtbds} JTBDs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Query Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ask the Value Investigator..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvestigate()}
              className="pl-10"
              disabled={investigating}
            />
          </div>
          <Button
            onClick={() => handleInvestigate()}
            disabled={investigating || !query.trim()}
            size="sm"
          >
            {investigating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Suggested Questions */}
        {suggestions.length > 0 && !investigatorResponse && (
          <div className="flex flex-wrap gap-1.5">
            {suggestions.slice(0, 4).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  setQuery(suggestion.question);
                  handleInvestigate(suggestion.question);
                }}
                disabled={investigating}
              >
                <Lightbulb className="h-3 w-3 mr-1" />
                {suggestion.question.substring(0, 40)}...
              </Button>
            ))}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="insights" className="text-xs">
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              Data Insights ({insights.length})
            </TabsTrigger>
            <TabsTrigger value="investigate" className="text-xs">
              <Brain className="h-3.5 w-3.5 mr-1.5" />
              AI Investigation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-3 mt-3">
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : insights.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No insights available yet. Ensure JTBD data, value categories, and AI suitability scores are populated.
                </AlertDescription>
              </Alert>
            ) : (
              insights.map((insight, index) => renderInsightCard(insight, index))
            )}
          </TabsContent>

          <TabsContent value="investigate" className="mt-3">
            {investigating ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <p className="text-sm text-muted-foreground">Value Investigator analyzing...</p>
              </div>
            ) : investigatorResponse ? (
              <div className="space-y-4">
                {/* Model & Confidence Badge */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    {investigatorResponse.model_used}
                  </Badge>
                  <Badge
                    variant={investigatorResponse.confidence >= 0.8 ? 'default' :
                             investigatorResponse.confidence >= 0.6 ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {Math.round(investigatorResponse.confidence * 100)}% confidence
                  </Badge>
                </div>

                {/* Response */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {investigatorResponse.response}
                  </div>
                </div>

                {/* Recommendations */}
                {investigatorResponse.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Recommendations
                    </h4>
                    <div className="space-y-1.5">
                      {investigatorResponse.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className={`text-xs p-2 rounded border-l-2 ${
                            rec.priority === 'high'
                              ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/10'
                              : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/10'
                          }`}
                        >
                          {rec.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Citations */}
                {investigatorResponse.citations.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Sources: </span>
                    {investigatorResponse.citations.map((cit, index) => (
                      <span key={index}>
                        {cit.source}
                        {index < investigatorResponse.citations.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium">Ask the Value Investigator</p>
                  <p className="text-xs text-muted-foreground">
                    Get AI-powered analysis of your value framework data using Claude Opus 4.5
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default AIPoweredInsight;
