'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  UserCircle,
  Zap,
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Layers,
} from 'lucide-react';
import type { Persona, PersonaArchetype, ARCHETYPE_INFO } from './types';

// Archetype styling
const archetypeStyles: Record<string, { color: string; bgColor: string; icon: React.ReactNode }> = {
  AUTOMATOR: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  ORCHESTRATOR: {
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: <Brain className="h-3.5 w-3.5" />,
  },
  LEARNER: {
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    icon: <Lightbulb className="h-3.5 w-3.5" />,
  },
  SKEPTIC: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

const serviceLayerStyles: Record<string, { label: string; color: string }> = {
  L1_expert: { label: 'L1', color: 'bg-slate-100 text-slate-700' },
  L2_panel: { label: 'L2', color: 'bg-indigo-100 text-indigo-700' },
  L3_workflow: { label: 'L3', color: 'bg-cyan-100 text-cyan-700' },
  L4_solution: { label: 'L4', color: 'bg-emerald-100 text-emerald-700' },
};

interface PersonaCardProps {
  persona: Persona;
  compact?: boolean;
  onClick?: (persona: Persona) => void;
}

export function PersonaCard({ persona, compact = false, onClick }: PersonaCardProps) {
  const jtbdsCount = persona.jtbds_count || 0;
  const goalsCount = persona.goals_count || 0;
  const challengesCount = persona.challenges_count || 0;
  
  const archetype = persona.derived_archetype || persona.archetype;
  const archetypeStyle = archetype ? archetypeStyles[archetype] : null;
  const serviceLayer = persona.preferred_service_layer;
  const serviceStyle = serviceLayer ? serviceLayerStyles[serviceLayer] : null;
  
  // Parse scores (they might be strings from DB)
  const aiReadiness = typeof persona.ai_readiness_score === 'string' 
    ? parseFloat(persona.ai_readiness_score) 
    : persona.ai_readiness_score;
  const workComplexity = typeof persona.work_complexity_score === 'string'
    ? parseFloat(persona.work_complexity_score)
    : persona.work_complexity_score;

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer flex flex-col h-full min-h-[340px] max-h-[340px]"
      onClick={() => onClick?.(persona)}
    >
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <UserCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <CardTitle className="text-base font-semibold truncate">{persona.name}</CardTitle>
            </div>
            {persona.title && (
              <p className="text-sm font-medium text-gray-700 truncate">{persona.title}</p>
            )}
          </div>
          {/* Archetype Badge */}
          {archetype && archetypeStyle && (
            <Badge variant="outline" className={`${archetypeStyle.bgColor} ${archetypeStyle.color} text-xs flex-shrink-0 flex items-center gap-1`}>
              {archetypeStyle.icon}
              {archetype}
            </Badge>
          )}
        </div>
        {!compact && (persona.tagline || persona.one_liner) && (
          <CardDescription className="line-clamp-2 text-xs mt-1">
            {persona.tagline || persona.one_liner}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden pb-3">
        <div className="space-y-3 flex-1 overflow-y-auto">
          {/* Organizational Badges */}
          <div className="flex flex-wrap gap-1.5">
            {persona.function_name && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                {persona.function_name}
              </Badge>
            )}
            {persona.department_name && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                {persona.department_name}
              </Badge>
            )}
            {persona.seniority_level && (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                {persona.seniority_level}
              </Badge>
            )}
            {/* Service Layer Badge */}
            {serviceLayer && serviceStyle && (
              <Badge className={`${serviceStyle.color} text-xs`}>
                <Layers className="h-3 w-3 mr-1" />
                {serviceStyle.label}
              </Badge>
            )}
          </div>

          {/* AI Readiness & Work Complexity Scores */}
          {!compact && (aiReadiness !== undefined || workComplexity !== undefined) && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              {aiReadiness !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-blue-500" />
                      AI Readiness
                    </span>
                    <span className="font-medium">{Math.round(aiReadiness * 100)}%</span>
                  </div>
                  <Progress value={aiReadiness * 100} className="h-1.5" />
                </div>
              )}
              {workComplexity !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Brain className="h-3 w-3 text-purple-500" />
                      Work Complexity
                    </span>
                    <span className="font-medium">{Math.round(workComplexity * 100)}%</span>
                  </div>
                  <Progress value={workComplexity * 100} className="h-1.5" />
                </div>
              )}
            </div>
          )}

          {/* Data Points - JTBDs, Goals, Challenges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
            <div className="flex flex-col items-center gap-0.5">
              <Target className="h-4 w-4 text-blue-500" />
              <div className="text-sm font-semibold text-gray-700">{jtbdsCount}</div>
              <div className="text-[10px] text-gray-500">JTBDs</div>
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div className="text-sm font-semibold text-gray-700">{goalsCount}</div>
              <div className="text-[10px] text-gray-500">Goals</div>
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div className="text-sm font-semibold text-gray-700">{challengesCount}</div>
              <div className="text-[10px] text-gray-500">Challenges</div>
            </div>
          </div>

          {/* Geographic Scope & Data Quality */}
          {!compact && (persona.geographic_scope || persona.data_quality_score) && (
            <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
              {persona.geographic_scope && (
                <span className="truncate">{persona.geographic_scope}</span>
              )}
              {persona.data_quality_score && (
                <span className="flex items-center gap-1">
                  Quality: {Math.round(parseFloat(String(persona.data_quality_score)) * 100)}%
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
