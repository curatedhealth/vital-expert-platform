'use client';

import React from 'react';
import { Card, CardContent, Badge } from '@vital/ui';
import {
  Target,
  AlertCircle,
  TrendingUp,
  Zap,
  DollarSign,
  Shield,
  Globe,
} from 'lucide-react';
import type { Persona } from '@/components/personas/types';

interface PersonaSummaryCardProps {
  persona: Persona;
}

/**
 * Sticky summary card showing persona overview, stats, and key attributes
 * VITAL Brand Guidelines v6.0 compliant
 */
export function PersonaSummaryCard({ persona }: PersonaSummaryCardProps) {
  // Calculate data points
  const responsibilitiesCount = (persona as any).key_responsibilities?.length || 0;
  const painPointsCount = (persona as any).pain_points?.length || 0;
  const jtbdsCount = (persona as any).jtbds?.length || persona.jtbds_count || 0;
  const goalsCount = persona.goals?.length || (persona as any).goals_count || 0;
  const challengesCount = persona.challenges?.length || (persona as any).challenges_count || 0;

  // Extract attributes
  const archetype = (persona as any).archetype || (persona as any).derived_archetype;
  const personaType = (persona as any).persona_type;
  const budgetAuthority = (persona as any).budget_authority;
  const decisionStyle = (persona as any).decision_making_style;
  const riskTolerance = (persona as any).risk_tolerance;
  const geoScope = (persona as any).geographic_scope;

  return (
    <Card className="border border-stone-200 shadow-sm sticky top-4 bg-white">
      <CardContent className="p-6 space-y-4">
        {/* Avatar and Name */}
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xl font-bold shadow-md">
            {persona.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-stone-800 leading-tight">{persona.name}</h1>
            {persona.title && <p className="text-sm text-stone-700">{persona.title}</p>}
            {(persona.tagline || persona.one_liner) && (
              <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                {persona.tagline || persona.one_liner}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {archetype && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
              {archetype}
            </Badge>
          )}
          {personaType && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              {personaType}
            </Badge>
          )}
          {persona.seniority_level && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
              {persona.seniority_level}
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-purple-50 border border-purple-100 p-3 transition-all duration-150 hover:border-purple-300">
            <div className="text-xs text-purple-600 flex items-center gap-1">
              <Target className="h-4 w-4" /> JTBDs
            </div>
            <div className="text-2xl font-bold text-purple-700">{jtbdsCount}</div>
          </div>
          <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 transition-all duration-150 hover:border-rose-300">
            <div className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> Pain
            </div>
            <div className="text-2xl font-bold text-rose-700">{painPointsCount}</div>
          </div>
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 transition-all duration-150 hover:border-emerald-300">
            <div className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Goals
            </div>
            <div className="text-2xl font-bold text-emerald-700">{goalsCount}</div>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 transition-all duration-150 hover:border-amber-300">
            <div className="text-xs text-amber-600 flex items-center gap-1">
              <Zap className="h-4 w-4" /> Challenges
            </div>
            <div className="text-2xl font-bold text-amber-700">{challengesCount}</div>
          </div>
        </div>

        {/* Decision & Influence */}
        <div className="space-y-3">
          {(budgetAuthority || decisionStyle || riskTolerance || geoScope) && (
            <div>
              <p className="text-xs font-semibold text-stone-600 mb-1">Decision & Influence</p>
              <div className="space-y-1 text-sm text-stone-700">
                {budgetAuthority && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" /> {budgetAuthority}
                  </div>
                )}
                {decisionStyle && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-amber-500" /> {decisionStyle}
                  </div>
                )}
                {riskTolerance && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" /> {riskTolerance}
                  </div>
                )}
                {geoScope && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-purple-600" /> {geoScope}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Org Placement */}
          {(persona.department_slug || persona.function_slug || persona.role_slug) && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-stone-600">Org placement</p>
              <div className="flex flex-wrap gap-2">
                {persona.function_slug && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                    {persona.function_slug}
                  </Badge>
                )}
                {persona.department_slug && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    {persona.department_slug}
                  </Badge>
                )}
                {persona.role_slug && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    {persona.role_slug}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Top Responsibilities */}
          {(persona as any).key_responsibilities && (persona as any).key_responsibilities.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-600">Top responsibilities</p>
              <ul className="space-y-1">
                {(persona as any).key_responsibilities.slice(0, 3).map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-stone-700 flex gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-2" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
