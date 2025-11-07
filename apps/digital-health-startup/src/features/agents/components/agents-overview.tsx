'use client';

import { Brain, Users, Zap, TrendingUp, Activity, Target, Workflow, BookOpen, Settings, Lightbulb } from 'lucide-react';
import { useMemo, useEffect } from 'react';

import { Badge } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
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
    const active = agents.filter((a: any) => a.status === 'active' || a.is_active === true).length;
    const custom = agents.filter((a: any) => a.is_custom).length;
    
    // New category-based statistics
    const byCategory = {
      deep_agent: agents.filter((a: any) => a.agent_category === 'deep_agent').length,
      universal_task_subagent: agents.filter((a: any) => a.agent_category === 'universal_task_subagent').length,
      multi_expert_orchestration: agents.filter((a: any) => a.agent_category === 'multi_expert_orchestration').length,
      specialized_knowledge: agents.filter((a: any) => a.agent_category === 'specialized_knowledge').length,
      process_automation: agents.filter((a: any) => a.agent_category === 'process_automation').length,
      autonomous_problem_solving: agents.filter((a: any) => a.agent_category === 'autonomous_problem_solving').length,
    };
    
    const byStatus = {
      active: agents.filter((a: any) => a.status === 'active' || a.is_active === true).length,
      development: agents.filter((a: any) => a.status === 'development').length,
      testing: agents.filter((a: any) => a.status === 'testing').length,
      inactive: agents.filter((a: any) => a.status === 'inactive' || a.is_active === false).length,
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
      byCategory,
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
          Dashboard and statistics for your AI agent ecosystem by category
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
              Across all categories
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
              {statistics.total > 0 ? ((statistics.active / statistics.total) * 100).toFixed(1) : '0.0'}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deep Agents</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statistics.byCategory.deep_agent}</div>
            <p className="text-xs text-muted-foreground">
              Strategic consultants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specialized</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.byCategory.specialized_knowledge}</div>
            <p className="text-xs text-muted-foreground">
              Domain experts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Agents by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 border-purple-300">
                    Deep Agent
                  </Badge>
                  <span className="text-sm text-gray-600">Strategic consultants</span>
                </div>
                <span className="font-semibold">{statistics.byCategory.deep_agent}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${statistics.total > 0 ? (statistics.byCategory.deep_agent / statistics.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-50 text-green-700 border-green-200">Task Subagent</Badge>
                  <span className="text-sm text-gray-600">Data analysts</span>
                </div>
                <span className="font-semibold">{statistics.byCategory.universal_task_subagent}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${statistics.total > 0 ? (statistics.byCategory.universal_task_subagent / statistics.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200">Orchestration</Badge>
                  <span className="text-sm text-gray-600">Multi-expert coordination</span>
                </div>
                <span className="font-semibold">{statistics.byCategory.multi_expert_orchestration}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500"
                  style={{ width: `${statistics.total > 0 ? (statistics.byCategory.multi_expert_orchestration / statistics.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">Specialized</Badge>
                  <span className="text-sm text-gray-600">Domain experts</span>
                </div>
                <span className="font-semibold">{statistics.byCategory.specialized_knowledge}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${statistics.total > 0 ? (statistics.byCategory.specialized_knowledge / statistics.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-50 text-orange-700 border-orange-200">Automation</Badge>
                  <span className="text-sm text-gray-600">Process automation</span>
                </div>
                <span className="font-semibold">{statistics.byCategory.process_automation}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${statistics.total > 0 ? (statistics.byCategory.process_automation / statistics.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-50 text-red-700 border-red-200">Problem Solving</Badge>
                  <span className="text-sm text-gray-600">Autonomous intelligence</span>
                </div>
                <span className="font-semibold">{statistics.byCategory.autonomous_problem_solving}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${statistics.total > 0 ? (statistics.byCategory.autonomous_problem_solving / statistics.total) * 100 : 0}%` }}
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
