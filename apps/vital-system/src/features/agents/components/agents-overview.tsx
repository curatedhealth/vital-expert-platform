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
 * - Neutral-200: #E8E5DC
 * - Warm Ivory: #FAF8F1
 */

'use client';

import { Crown, Star, Shield, Wrench, Cog, Users, Zap, TrendingUp, Activity } from 'lucide-react';
import { useMemo, useEffect } from 'react';

import { Badge } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
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
  neutral200: '#E8E5DC',
  warmIvory: '#FAF8F1',
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

  useEffect(() => {
    if (agents.length === 0) {
      loadAgents(false).catch(console.error);
    }
  }, []);

  const statistics = useMemo(() => {
    const total = agents.length;
    const active = agents.filter((a: any) => a.status === 'active').length;
    const canSpawn = agents.filter((a: any) => (a.tier || 2) <= 3).length;
    
    // Count by level (L1-L5)
    const byLevel = {
      1: agents.filter((a: any) => a.tier === 1).length,
      2: agents.filter((a: any) => a.tier === 2 || !a.tier).length, // Default to L2
      3: agents.filter((a: any) => a.tier === 3).length,
      4: agents.filter((a: any) => a.tier === 4).length,
      5: agents.filter((a: any) => a.tier === 5).length,
    };
    
    const byStatus = {
      active: agents.filter((a: any) => a.status === 'active').length,
      development: agents.filter((a: any) => a.status === 'development').length,
      testing: agents.filter((a: any) => a.status === 'testing').length,
      inactive: agents.filter((a: any) => a.status === 'inactive').length,
    };
    
    const byFunction = agents.reduce((acc, agent) => {
      const func = agent.business_function || 'Unassigned';
      acc[func] = (acc[func] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topFunctions = Object.entries(byFunction)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { total, active, canSpawn, byLevel, byStatus, topFunctions };
  }, [agents]);

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
      {/* Key Metrics - Clean cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Agents */}
        <Card className="border-[#E8E5DC] bg-[#FAF8F1]">
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
        <Card className="border-[#E8E5DC] bg-[#FAF8F1]">
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
        <Card className="border-[#E8E5DC] bg-[#FAF8F1]">
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
        <Card className="border-[#E8E5DC] bg-[#FAF8F1]">
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
      <Card className="border-[#E8E5DC] bg-[#FAF8F1]">
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
                  className="text-center p-4 rounded-xl border border-[#E8E5DC] bg-white"
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
        <Card className="border-[#E8E5DC] bg-[#FAF8F1]">
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
                  <div className="h-1.5 bg-[#E8E5DC] rounded-full overflow-hidden">
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
        <Card className="border-[#E8E5DC] bg-[#FAF8F1]">
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
                    <div className="h-1 bg-[#E8E5DC] rounded-full overflow-hidden">
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
