'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Zap,
  Brain,
  Lightbulb,
  AlertTriangle,
  Layers,
  TrendingUp,
} from 'lucide-react';
import type { PersonaStats } from './types';

interface PersonaStatsCardsProps {
  stats: PersonaStats;
}

// Archetype icons and colors
const archetypeConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string; borderColor: string }> = {
  AUTOMATOR: {
    icon: <Zap className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  ORCHESTRATOR: {
    icon: <Brain className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  LEARNER: {
    icon: <Lightbulb className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  SKEPTIC: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
};

export function PersonaStatsCards({ stats }: PersonaStatsCardsProps) {
  const byArchetype = stats.byArchetype || {};
  const archetypeTotal = Object.values(byArchetype).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="space-y-6 mb-8">
      {/* Top Row - Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-neutral-600 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Total Personas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-neutral-600 flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-500" />
              Avg AI Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.avgAiReadiness ? `${Math.round(stats.avgAiReadiness * 100)}%` : '—'}
            </div>
            {stats.avgAiReadiness && (
              <Progress value={stats.avgAiReadiness * 100} className="h-1.5 mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-neutral-600 flex items-center gap-1">
              <Brain className="h-3 w-3 text-purple-500" />
              Avg Work Complexity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {stats.avgWorkComplexity ? `${Math.round(stats.avgWorkComplexity * 100)}%` : '—'}
            </div>
            {stats.avgWorkComplexity && (
              <Progress value={stats.avgWorkComplexity * 100} className="h-1.5 mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-neutral-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              Org Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">Functions:</span>
                <span className="font-semibold">{stats.totalFunctions ?? Object.keys(stats.byFunction).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Departments:</span>
                <span className="font-semibold">{stats.totalDepartments ?? Object.keys(stats.byDepartment).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Roles:</span>
                <span className="font-semibold">{stats.totalRoles ?? Object.keys(stats.byRole).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Archetype Distribution */}
      {archetypeTotal > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-700">
              MECE Archetype Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['AUTOMATOR', 'ORCHESTRATOR', 'LEARNER', 'SKEPTIC'].map((archetype) => {
                const config = archetypeConfig[archetype];
                const count = byArchetype[archetype] || 0;
                const percentage = archetypeTotal > 0 ? Math.round((count / archetypeTotal) * 100) : 0;
                
                return (
                  <div 
                    key={archetype}
                    className={`p-4 rounded-lg border-2 ${config.bgColor} ${config.borderColor}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={config.color}>{config.icon}</div>
                      <span className={`text-sm font-medium ${config.color}`}>{archetype}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-bold ${config.color}`}>{count}</span>
                      <span className="text-sm text-neutral-500">({percentage}%)</span>
                    </div>
                    <Progress value={percentage} className="h-1.5 mt-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Layer Distribution */}
      {stats.byServiceLayer && Object.keys(stats.byServiceLayer).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Service Layer Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'L1_expert', label: 'L1 Expert', desc: 'Quick answers', color: 'bg-slate-100 text-slate-700 border-slate-200' },
                { key: 'L2_panel', label: 'L2 Panel', desc: 'Multi-expert', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
                { key: 'L3_workflow', label: 'L3 Workflow', desc: 'Guided process', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
                { key: 'L4_solution', label: 'L4 Solution', desc: 'End-to-end', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
              ].map(({ key, label, desc, color }) => {
                const count = stats.byServiceLayer?.[key] || 0;
                return (
                  <div key={key} className={`p-3 rounded-lg border ${color}`}>
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-neutral-500 mb-1">{desc}</div>
                    <div className="text-xl font-bold">{count}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

