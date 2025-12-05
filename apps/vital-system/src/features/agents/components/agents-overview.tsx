/**
 * AgentsOverview - Minimalist Dashboard
 * Following VITAL Brand Guidelines v5.0
 * 
 * Colors:
 * - Expert Purple: #9B5DE0
 * - Pharma Blue: #0046FF
 * - Systems Teal: #00B5AD
 * - Velocity Orange: #FF6B00
 * - Neutral-900: #1A1A1A
 * - Neutral-600: #555555
 * - Uses Tailwind's border/background tokens for consistency
 */

'use client';

import { Crown, Star, Shield, Wrench, Cog, Users, Zap, TrendingUp, Activity, Filter } from 'lucide-react';
import { useMemo, useEffect } from 'react';

import { Badge } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { useAgentsFilter } from '@/contexts/agents-filter-context';
import { useAgentsStore } from '@/lib/stores/agents-store';

// ============================================================================
// VITAL BRAND COLORS
// ============================================================================

const COLORS = {
  // Primary
  expertPurple: '#9B5DE0',
  pharmaBue: '#0046FF',
  systemsTeal: '#00B5AD',
  velocityOrange: '#FF6B00',
  researchIndigo: '#4F46E5',
  foresightPink: '#FF3796',
  
  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Neutrals
  neutral900: '#1A1A1A',
  neutral600: '#555555',
  neutral400: '#BFBFBF',
};

// Level configuration with VITAL colors
const levelConfig = {
  1: { label: 'L1 Master', color: COLORS.expertPurple, icon: Crown },
  2: { label: 'L2 Expert', color: COLORS.pharmaBue, icon: Star },
  3: { label: 'L3 Specialist', color: COLORS.systemsTeal, icon: Shield },
  4: { label: 'L4 Worker', color: COLORS.velocityOrange, icon: Wrench },
  5: { label: 'L5 Tool', color: COLORS.neutral600, icon: Cog },
};

export function AgentsOverview() {
  const { agents, loadAgents, isLoading, error } = useAgentsStore();
  const { searchQuery, multiFilters, activeFilterCount } = useAgentsFilter();

  useEffect(() => {
    if (agents.length === 0) {
      loadAgents(false).catch(console.error);
    }
  }, []);

  // Filter agents based on multi-select filters from context
  const filteredAgents = useMemo(() => {
    return agents.filter((agent: any) => {
      // Search filter
      const matchesSearch = !searchQuery ||
        (agent.display_name || agent.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (agent.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Multi-select function filter
      const matchesFunction = multiFilters.functions.size === 0 ||
        multiFilters.functions.has(agent.function_id) ||
        multiFilters.functions.has(agent.business_function) ||
        multiFilters.functions.has(agent.function_name);

      // Multi-select department filter
      const matchesDepartment = multiFilters.departments.size === 0 ||
        multiFilters.departments.has(agent.department_id) ||
        multiFilters.departments.has(agent.department) ||
        multiFilters.departments.has(agent.department_name);

      // Multi-select role filter
      const matchesRole = multiFilters.roles.size === 0 ||
        multiFilters.roles.has(agent.role_id) ||
        multiFilters.roles.has(agent.role) ||
        multiFilters.roles.has(agent.role_name);

      // Multi-select level filter
      const matchesLevel = multiFilters.levels.size === 0 ||
        multiFilters.levels.has(agent.agent_level_id) ||
        multiFilters.levels.has(String(agent.agent_level)) ||
        multiFilters.levels.has(agent.agent_level_name) ||
        multiFilters.levels.has(String(agent.tier));

      // Multi-select status filter
      const matchesStatus = multiFilters.statuses.size === 0 ||
        multiFilters.statuses.has(agent.status);

      return matchesSearch && matchesFunction && matchesDepartment && matchesRole && matchesLevel && matchesStatus;
    });
  }, [agents, searchQuery, multiFilters]);

  const statistics = useMemo(() => {
    const total = filteredAgents.length;
    const active = filteredAgents.filter((a: any) => a.status === 'active').length;
    const canSpawn = filteredAgents.filter((a: any) => (a.tier || 2) <= 3).length;

    // Count by level (L1-L5)
    const byLevel = {
      1: filteredAgents.filter((a: any) => a.tier === 1).length,
      2: filteredAgents.filter((a: any) => a.tier === 2 || !a.tier).length, // Default to L2
      3: filteredAgents.filter((a: any) => a.tier === 3).length,
      4: filteredAgents.filter((a: any) => a.tier === 4).length,
      5: filteredAgents.filter((a: any) => a.tier === 5).length,
    };

    const byStatus = {
      active: filteredAgents.filter((a: any) => a.status === 'active').length,
      development: filteredAgents.filter((a: any) => a.status === 'development').length,
      testing: filteredAgents.filter((a: any) => a.status === 'testing').length,
      inactive: filteredAgents.filter((a: any) => a.status === 'inactive').length,
    };

    const byFunction = filteredAgents.reduce((acc, agent) => {
      const func = agent.business_function || agent.function_name || 'Unassigned';
      acc[func] = (acc[func] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topFunctions = Object.entries(byFunction)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { total, active, canSpawn, byLevel, byStatus, topFunctions };
  }, [filteredAgents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div 
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: COLORS.expertPurple, borderTopColor: 'transparent' }}
          />
          <p style={{ color: COLORS.neutral600 }}>Loading agents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center" style={{ color: COLORS.error }}>
          <p className="font-semibold">Error loading agents</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Filters Indicator */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/50">
          <Filter className="w-4 h-4" style={{ color: COLORS.expertPurple }} />
          <span className="text-sm text-[#555555]">
            Showing filtered results ({activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''})
          </span>
          <div className="flex flex-wrap gap-2 ml-2">
            {Array.from(multiFilters.functions).map(func => (
              <Badge key={`func-${func}`} variant="secondary" className="text-xs">
                {func}
              </Badge>
            ))}
            {Array.from(multiFilters.departments).map(dept => (
              <Badge key={`dept-${dept}`} variant="secondary" className="text-xs">
                {dept}
              </Badge>
            ))}
            {Array.from(multiFilters.roles).map(role => (
              <Badge key={`role-${role}`} variant="secondary" className="text-xs">
                {role}
              </Badge>
            ))}
            {Array.from(multiFilters.levels).map(level => (
              <Badge key={`level-${level}`} variant="secondary" className="text-xs">
                Level {level}
              </Badge>
            ))}
            {Array.from(multiFilters.statuses).map(status => (
              <Badge key={`status-${status}`} variant="secondary" className="text-xs">
                {status}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics - Clean cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Agents */}
        <Card className="border-border bg-background">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#555555] uppercase tracking-wide">Total Agents</p>
                <p className="text-3xl font-bold text-[#1A1A1A] mt-1">{statistics.total}</p>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${COLORS.expertPurple}15` }}
              >
                <Users className="w-5 h-5" style={{ color: COLORS.expertPurple }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active */}
        <Card className="border-border bg-background">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#555555] uppercase tracking-wide">Active</p>
                <p className="text-3xl font-bold mt-1" style={{ color: COLORS.success }}>{statistics.active}</p>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${COLORS.success}15` }}
              >
                <Activity className="w-5 h-5" style={{ color: COLORS.success }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Can Spawn */}
        <Card className="border-border bg-background">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#555555] uppercase tracking-wide">Can Spawn</p>
                <p className="text-3xl font-bold mt-1" style={{ color: COLORS.systemsTeal }}>{statistics.canSpawn}</p>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${COLORS.systemsTeal}15` }}
              >
                <Zap className="w-5 h-5" style={{ color: COLORS.systemsTeal }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Rate */}
        <Card className="border-border bg-background">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#555555] uppercase tracking-wide">Active Rate</p>
                <p className="text-3xl font-bold text-[#1A1A1A] mt-1">
                  {statistics.total > 0 ? Math.round((statistics.active / statistics.total) * 100) : 0}%
                </p>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${COLORS.pharmaBue}15` }}
              >
                <TrendingUp className="w-5 h-5" style={{ color: COLORS.pharmaBue }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Distribution */}
      <Card className="border-border bg-background">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-[#1A1A1A]">
            Agents by Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {([1, 2, 3, 4, 5] as const).map((level) => {
              const config = levelConfig[level];
              const count = statistics.byLevel[level];
              const Icon = config.icon;
              
              return (
                <div 
                  key={level}
                  className="text-center p-4 rounded-xl border border-border bg-white"
                >
                  <div 
                    className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: config.color }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{count}</p>
                  <p className="text-[10px] font-medium text-[#555555] uppercase tracking-wide mt-1">
                    {config.label}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="border-border bg-background">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-[#1A1A1A]">
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'active', label: 'Active', color: COLORS.success },
              { key: 'development', label: 'Development', color: COLORS.info },
              { key: 'testing', label: 'Testing', color: COLORS.warning },
              { key: 'inactive', label: 'Inactive', color: COLORS.neutral400 },
            ].map(({ key, label, color }) => {
              const count = statistics.byStatus[key as keyof typeof statistics.byStatus];
              const percentage = statistics.total > 0 ? (count / statistics.total) * 100 : 0;
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm font-medium text-[#1A1A1A]">{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#1A1A1A]">{count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top Business Functions */}
        <Card className="border-border bg-background">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-[#1A1A1A]">
              Top Business Functions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statistics.topFunctions.map(([func, count], index) => {
              const percentage = statistics.total > 0 ? (count / statistics.total) * 100 : 0;
              
              return (
                <div key={func} className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: COLORS.expertPurple }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#1A1A1A] truncate">
                        {func.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-semibold text-[#555555] ml-2">
                        {count}
                      </span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: COLORS.expertPurple 
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
