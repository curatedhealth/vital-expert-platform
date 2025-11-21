'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  UserCircle,
  Clock,
  Users,
  MapPin,
  DollarSign,
  AlertCircle,
  Target,
  TrendingUp,
  Award,
} from 'lucide-react';
import type { Persona } from './types';

interface PersonaCardProps {
  persona: Persona;
  compact?: boolean;
  onClick?: (persona: Persona) => void;
}

export function PersonaCard({ persona, compact = false, onClick }: PersonaCardProps) {
  // Calculate data points
  const responsibilitiesCount = persona.key_responsibilities?.length || 0;
  const painPointsCount = persona.pain_points_count || 0;
  const jtbdsCount = persona.jtbds_count || 0;
  const goalsCount = persona.goals_count || 0;
  const challengesCount = persona.challenges_count || 0;

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer flex flex-col h-full min-h-[320px] max-h-[320px]"
      onClick={() => onClick?.(persona)}
    >
      <CardHeader className="pb-3 flex-shrink-0">
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
          {persona.seniority_level && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs flex-shrink-0">
              {persona.seniority_level}
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
            {persona.role_name && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {persona.role_name}
              </Badge>
            )}
            {persona.department_name && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                {persona.department_name}
              </Badge>
            )}
            {persona.function_name && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                {persona.function_name}
              </Badge>
            )}
            {/* Fallback to slugs if names not available */}
            {!persona.role_name && persona.role_slug && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {persona.role_slug}
              </Badge>
            )}
            {!persona.department_name && persona.department_slug && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                {persona.department_slug}
              </Badge>
            )}
            {!persona.function_name && persona.function_slug && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                {persona.function_slug}
              </Badge>
            )}
          </div>

          {/* Key Metrics Grid */}
          {!compact && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {persona.years_of_experience && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{persona.years_of_experience} yrs</span>
                </div>
              )}
              
              {persona.team_size_typical && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Users className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{persona.team_size_typical} team</span>
                </div>
              )}

              {persona.geographic_scope && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{persona.geographic_scope}</span>
                </div>
              )}

              {persona.salary_median_usd && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <DollarSign className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">${(persona.salary_median_usd / 1000).toFixed(0)}k</span>
                </div>
              )}
            </div>
          )}

          {/* Data Points - Pain Points, JTBDs, Goals, Challenges */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            {painPointsCount > 0 && (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-700">{painPointsCount}</div>
                  <div className="text-[10px] text-gray-500 truncate">Pain Points</div>
                </div>
              </div>
            )}

            {jtbdsCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-700">{jtbdsCount}</div>
                  <div className="text-[10px] text-gray-500 truncate">JTBDs</div>
                </div>
              </div>
            )}

            {goalsCount > 0 && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-700">{goalsCount}</div>
                  <div className="text-[10px] text-gray-500 truncate">Goals</div>
                </div>
              </div>
            )}

            {challengesCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-700">{challengesCount}</div>
                  <div className="text-[10px] text-gray-500 truncate">Challenges</div>
                </div>
              </div>
            )}

            {responsibilitiesCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-700">{responsibilitiesCount}</div>
                  <div className="text-[10px] text-gray-500 truncate">Responsibilities</div>
                </div>
              </div>
            )}
          </div>

          {/* Tags - Show only if space allows */}
          {persona.tags && persona.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {persona.tags.slice(0, 2).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
              {persona.tags.length > 2 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  +{persona.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
