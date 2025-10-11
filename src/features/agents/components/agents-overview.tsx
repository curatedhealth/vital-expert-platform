'use client';

import { Brain, Users, Zap, TrendingUp, Activity, Award } from 'lucide-react';
import { useMemo, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentsStore } from '@/lib/stores/agents-store';

export function AgentsOverview() {
  const { agents, loadAgents, isLoading, error } = useAgentsStore();

  // Load all agents on mount
  useEffect(() => {
    console.log('AgentsOverview mounted, agents.length:', agents.length);
    if (agents.length === 0) {
      console.log('Loading agents...');
      loadAgents(true).then(() => {
        console.log('Agents loaded successfully');
      }).catch(err => {
        console.error('Failed to load agents:', err);
      });
    }
  }, []);

  console.log('AgentsOverview render - agents count:', agents.length, 'isLoading:', isLoading, 'error:', error);

  const statistics = useMemo(() => {
    const total = agents.length;
    const active = agents.filter(a => a.status === 'active').length;
    const custom = agents.filter(a => a.is_custom).length;
    const byTier = {
      core: agents.filter(a => a.tier === 0).length,
      tier1: agents.filter(a => a.tier === 1).length,
      tier2: agents.filter(a => a.tier === 2).length,
      tier3: agents.filter(a => a.tier === 3).length,
    };
    const byStatus = {
      active: agents.filter(a => a.status === 'active').length,
      development: agents.filter(a => a.status === 'development').length,
      testing: agents.filter(a => a.status === 'testing').length,
      inactive: agents.filter(a => a.status === 'inactive').length,
    };
    const byFunction = agents.reduce((acc, agent) => {
      const func = agent.business_function || 'Unassigned';
      acc[func] = (acc[func] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topFunctions = Object.entries(byFunction)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const byDepartment = agents.reduce((acc, agent) => {
      const dept = agent.department || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topDepartments = Object.entries(byDepartment)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      total,
      active,
      custom,
      byTier,
      byStatus,
      topFunctions,
      topDepartments,
    };
  }, [agents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-progress-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-medical-gray">Loading agents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading agents</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-deep-charcoal">Agents Overview</h1>
        <p className="text-medical-gray">
          Dashboard and statistics for your AI agent ecosystem
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all tiers and functions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.active}</div>
            <p className="text-xs text-muted-foreground">
              {((statistics.active / statistics.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Agents</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statistics.custom}</div>
            <p className="text-xs text-muted-foreground">
              User-created agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Core Agents</CardTitle>
            <Award className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{statistics.byTier.core}</div>
            <p className="text-xs text-muted-foreground">
              Premium tier agents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Agents by Tier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 border-purple-300">
                    Core
                  </Badge>
                  <span className="text-sm text-gray-600">Premium specialists</span>
                </div>
                <span className="font-semibold">{statistics.byTier.core}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${(statistics.byTier.core / statistics.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">Tier 1</Badge>
                  <span className="text-sm text-gray-600">Advanced agents</span>
                </div>
                <span className="font-semibold">{statistics.byTier.tier1}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${(statistics.byTier.tier1 / statistics.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-50 text-green-700 border-green-200">Tier 2</Badge>
                  <span className="text-sm text-gray-600">Standard agents</span>
                </div>
                <span className="font-semibold">{statistics.byTier.tier2}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(statistics.byTier.tier2 / statistics.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-50 text-orange-700 border-orange-200">Tier 3</Badge>
                  <span className="text-sm text-gray-600">Basic agents</span>
                </div>
                <span className="font-semibold">{statistics.byTier.tier3}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${(statistics.byTier.tier3 / statistics.total) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Agents by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                  <span className="text-sm text-gray-600">Production ready</span>
                </div>
                <span className="font-semibold">{statistics.byStatus.active}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(statistics.byStatus.active / statistics.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">Development</Badge>
                  <span className="text-sm text-gray-600">In progress</span>
                </div>
                <span className="font-semibold">{statistics.byStatus.development}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${(statistics.byStatus.development / statistics.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Testing</Badge>
                  <span className="text-sm text-gray-600">Under review</span>
                </div>
                <span className="font-semibold">{statistics.byStatus.testing}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{ width: `${(statistics.byStatus.testing / statistics.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200">Inactive</Badge>
                  <span className="text-sm text-gray-600">Not deployed</span>
                </div>
                <span className="font-semibold">{statistics.byStatus.inactive}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-500"
                  style={{ width: `${(statistics.byStatus.inactive / statistics.total) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Business Functions and Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Business Functions */}
        <Card>
          <CardHeader>
            <CardTitle>Top Business Functions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statistics.topFunctions.map(([func, count], index) => (
                <div key={func} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{func.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-semibold">{count} agents</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500"
                        style={{ width: `${(count / statistics.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Departments */}
        <Card>
          <CardHeader>
            <CardTitle>Top Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statistics.topDepartments.map(([dept, count], index) => (
                <div key={dept} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{dept.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-semibold">{count} agents</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500"
                        style={{ width: `${(count / statistics.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
