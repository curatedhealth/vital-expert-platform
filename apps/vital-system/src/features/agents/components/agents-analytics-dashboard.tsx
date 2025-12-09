'use client';

import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  MessageSquare,
  Clock,
  Target,
  Award,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ClientAgent } from '../types/agent-schema';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface AgentsAnalyticsDashboardProps {
  agents: ClientAgent[];
  usageData?: AgentUsageData[];
}

interface AgentUsageData {
  agentId: string;
  totalQueries: number;
  successfulQueries: number;
  averageResponseTime: number; // milliseconds
  totalCost: number;
  userSatisfactionScore: number; // 0-5
  lastUsed: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

interface TopAgentMetric {
  agent: ClientAgent;
  value: number;
  label: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateAgentMetrics(agents: ClientAgent[], usageData?: AgentUsageData[]) {
  const total = agents.length;
  const active = agents.filter((a) => a.status === 'active').length;
  const testing = agents.filter((a) => a.status === 'testing').length;

  const byLevel = {
    level1: agents.filter((a) => a.tier === '1' || a.tier === 1).length,
    level2: agents.filter((a) => a.tier === '2' || a.tier === 2).length,
    level3: agents.filter((a) => a.tier === '3' || a.tier === 3).length,
    level4: agents.filter((a) => a.tier === '4' || a.tier === 4).length,
    level5: agents.filter((a) => a.tier === '5' || a.tier === 5).length,
  };

  const totalQueries = usageData?.reduce((sum, d) => sum + d.totalQueries, 0) || 0;
  const totalCost = usageData?.reduce((sum, d) => sum + d.totalCost, 0) || 0;
  const averageSatisfaction =
    usageData?.reduce((sum, d) => sum + d.userSatisfactionScore, 0) / (usageData?.length || 1) || 0;

  const successRate =
    usageData && usageData.length > 0
      ? (usageData.reduce((sum, d) => sum + d.successfulQueries, 0) / totalQueries) * 100
      : 0;

  return {
    total,
    active,
    testing,
    byLevel,
    totalQueries,
    totalCost,
    averageSatisfaction,
    successRate,
  };
}

function getTopAgentsByMetric(
  agents: ClientAgent[],
  usageData: AgentUsageData[],
  metric: 'queries' | 'cost' | 'satisfaction' | 'speed',
  limit: number = 5
): TopAgentMetric[] {
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  const metricsWithAgents = usageData
    .map((data) => {
      const agent = agentMap.get(data.agentId);
      if (!agent) return null;

      let value = 0;
      let label = '';

      switch (metric) {
        case 'queries':
          value = data.totalQueries;
          label = `${value.toLocaleString()} queries`;
          break;
        case 'cost':
          value = data.totalCost;
          label = `$${value.toFixed(2)}`;
          break;
        case 'satisfaction':
          value = data.userSatisfactionScore;
          label = `${value.toFixed(1)}/5.0`;
          break;
        case 'speed':
          value = -data.averageResponseTime; // Negative so faster = higher
          label = `${Math.abs(value).toFixed(0)}ms avg`;
          break;
      }

      return { agent, value, label };
    })
    .filter((item): item is TopAgentMetric => item !== null)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  return metricsWithAgents;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// ============================================================================
// Sub-Components
// ============================================================================

function MetricCard({ title, value, description, icon: Icon, trend, color }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('p-2 rounded-lg', color || 'bg-primary/10')}>
          <Icon className={cn('h-4 w-4', color ? 'text-current' : 'text-primary')} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {Math.abs(trend.value)}% vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AgentsAnalyticsDashboard({
  agents,
  usageData = [],
}: AgentsAnalyticsDashboardProps) {
  const metrics = useMemo(() => calculateAgentMetrics(agents, usageData), [agents, usageData]);

  const topAgentsByQueries = useMemo(
    () => getTopAgentsByMetric(agents, usageData, 'queries'),
    [agents, usageData]
  );

  const topAgentsByCost = useMemo(
    () => getTopAgentsByMetric(agents, usageData, 'cost'),
    [agents, usageData]
  );

  const topAgentsBySatisfaction = useMemo(
    () => getTopAgentsByMetric(agents, usageData, 'satisfaction'),
    [agents, usageData]
  );

  const topAgentsBySpeed = useMemo(
    () => getTopAgentsByMetric(agents, usageData, 'speed'),
    [agents, usageData]
  );

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Queries"
          value={metrics.totalQueries.toLocaleString()}
          description="Across all agents"
          icon={MessageSquare}
          trend={{ value: 12.5, isPositive: true }}
        />

        <MetricCard
          title="Total Cost"
          value={formatCurrency(metrics.totalCost)}
          description="This month"
          icon={DollarSign}
          color="bg-amber-50 text-amber-600"
          trend={{ value: 8.3, isPositive: false }}
        />

        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate.toFixed(1)}%`}
          description="Successful completions"
          icon={Target}
          color="bg-green-50 text-green-600"
          trend={{ value: 3.2, isPositive: true }}
        />

        <MetricCard
          title="Satisfaction"
          value={`${metrics.averageSatisfaction.toFixed(1)}/5.0`}
          description="Average user rating"
          icon={Award}
          color="bg-purple-50 text-purple-600"
          trend={{ value: 5.1, isPositive: true }}
        />
      </div>

      {/* Agent Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribution by Status
            </CardTitle>
            <CardDescription>Active vs Testing vs Inactive agents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active</span>
                <span className="font-medium">
                  {metrics.active} ({((metrics.active / metrics.total) * 100).toFixed(0)}%)
                </span>
              </div>
              <Progress value={(metrics.active / metrics.total) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Testing</span>
                <span className="font-medium">
                  {metrics.testing} ({((metrics.testing / metrics.total) * 100).toFixed(0)}%)
                </span>
              </div>
              <Progress
                value={(metrics.testing / metrics.total) * 100}
                className="h-2 bg-yellow-100"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Inactive</span>
                <span className="font-medium">
                  {metrics.total - metrics.active - metrics.testing} (
                  {(((metrics.total - metrics.active - metrics.testing) / metrics.total) * 100).toFixed(0)}
                  %)
                </span>
              </div>
              <Progress
                value={((metrics.total - metrics.active - metrics.testing) / metrics.total) * 100}
                className="h-2 bg-neutral-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribution by Level
            </CardTitle>
            <CardDescription>L1 Master → L5 Tool hierarchy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">L1: Master</span>
                <span className="font-medium">
                  {metrics.byLevel.level1} ({((metrics.byLevel.level1 / metrics.total) * 100).toFixed(0)}%)
                </span>
              </div>
              <Progress value={(metrics.byLevel.level1 / metrics.total) * 100} className="h-2 bg-purple-100" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">L2: Expert</span>
                <span className="font-medium">
                  {metrics.byLevel.level2} ({((metrics.byLevel.level2 / metrics.total) * 100).toFixed(0)}%)
                </span>
              </div>
              <Progress value={(metrics.byLevel.level2 / metrics.total) * 100} className="h-2 bg-blue-100" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">L3: Specialist</span>
                <span className="font-medium">
                  {metrics.byLevel.level3} ({((metrics.byLevel.level3 / metrics.total) * 100).toFixed(0)}%)
                </span>
              </div>
              <Progress value={(metrics.byLevel.level3 / metrics.total) * 100} className="h-2 bg-emerald-100" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">L4: Worker</span>
                <span className="font-medium">
                  {metrics.byLevel.level4} ({((metrics.byLevel.level4 / metrics.total) * 100).toFixed(0)}%)
                </span>
              </div>
              <Progress value={(metrics.byLevel.level4 / metrics.total) * 100} className="h-2 bg-amber-100" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">L5: Tool</span>
                <span className="font-medium">
                  {metrics.byLevel.level5} ({((metrics.byLevel.level5 / metrics.total) * 100).toFixed(0)}%)
                </span>
              </div>
              <Progress value={(metrics.byLevel.level5 / metrics.total) * 100} className="h-2 bg-neutral-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Performing Agents</CardTitle>
          <CardDescription>Ranked by various performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="queries">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="queries">Most Used</TabsTrigger>
              <TabsTrigger value="satisfaction">Highest Rated</TabsTrigger>
              <TabsTrigger value="speed">Fastest</TabsTrigger>
              <TabsTrigger value="cost">Highest Cost</TabsTrigger>
            </TabsList>

            <TabsContent value="queries" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Total Queries</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topAgentsByQueries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No usage data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    topAgentsByQueries.map(({ agent, label }, index) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold">
                              {index + 1}
                            </div>
                            <Avatar className="h-8 w-8 border">
                              {agent.avatar?.startsWith('/') ? (
                                <AvatarImage src={agent.avatar} alt={agent.display_name} />
                              ) : (
                                <AvatarFallback className="text-xs">
                                  {agent.avatar || getInitials(agent.display_name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{agent.display_name}</p>
                              <p className="text-xs text-muted-foreground">{agent.model}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            L{agent.tier}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{label}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="satisfaction" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topAgentsBySatisfaction.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No usage data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    topAgentsBySatisfaction.map(({ agent, label }, index) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold">
                              {index + 1}
                            </div>
                            <Avatar className="h-8 w-8 border">
                              {agent.avatar?.startsWith('/') ? (
                                <AvatarImage src={agent.avatar} alt={agent.display_name} />
                              ) : (
                                <AvatarFallback className="text-xs">
                                  {agent.avatar || getInitials(agent.display_name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{agent.display_name}</p>
                              <p className="text-xs text-muted-foreground">{agent.model}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            L{agent.tier}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{label}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="speed" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Avg Response Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topAgentsBySpeed.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No usage data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    topAgentsBySpeed.map(({ agent, label }, index) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold">
                              {index + 1}
                            </div>
                            <Avatar className="h-8 w-8 border">
                              {agent.avatar?.startsWith('/') ? (
                                <AvatarImage src={agent.avatar} alt={agent.display_name} />
                              ) : (
                                <AvatarFallback className="text-xs">
                                  {agent.avatar || getInitials(agent.display_name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{agent.display_name}</p>
                              <p className="text-xs text-muted-foreground">{agent.model}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            L{agent.tier}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{label}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="cost" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topAgentsByCost.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No usage data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    topAgentsByCost.map(({ agent, label }, index) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold">
                              {index + 1}
                            </div>
                            <Avatar className="h-8 w-8 border">
                              {agent.avatar?.startsWith('/') ? (
                                <AvatarImage src={agent.avatar} alt={agent.display_name} />
                              ) : (
                                <AvatarFallback className="text-xs">
                                  {agent.avatar || getInitials(agent.display_name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{agent.display_name}</p>
                              <p className="text-xs text-muted-foreground">{agent.model}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            L{agent.tier}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm text-amber-600">
                          {label}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
