'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserCircle, 
  Clock, 
  AlertCircle, 
  Target, 
  TrendingUp, 
  Award,
  Users,
} from 'lucide-react';
import type { Persona } from './types';

interface PersonaListItemProps {
  persona: Persona;
  onClick?: (persona: Persona) => void;
}

export function PersonaListItem({ persona, onClick }: PersonaListItemProps) {
  // Calculate data points
  const responsibilitiesCount = persona.key_responsibilities?.length || 0;
  const painPointsCount = persona.pain_points_count || 0;
  const jtbdsCount = persona.jtbds_count || 0;
  const goalsCount = persona.goals_count || 0;
  const challengesCount = persona.challenges_count || 0;

  return (
    <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onClick?.(persona)}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <UserCircle className="h-6 w-6 text-gray-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{persona.name}</h3>
                {persona.seniority_level && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                    {persona.seniority_level}
                  </Badge>
                )}
              </div>
              {persona.title && (
                <p className="text-sm font-medium text-gray-700 mb-1 truncate">{persona.title}</p>
              )}
              {(persona.tagline || persona.one_liner) && (
                <p className="text-sm text-gray-500 line-clamp-1">
                  {persona.tagline || persona.one_liner}
                </p>
              )}
              
              {/* Key Information Row */}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                {persona.years_of_experience && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {persona.years_of_experience} yrs
                  </span>
                )}
                {persona.function_name && (
                  <span className="truncate">{persona.function_name}</span>
                )}
                {!persona.function_name && persona.function_slug && (
                  <span className="truncate">{persona.function_slug}</span>
                )}
                {persona.department_name && (
                  <span className="truncate">• {persona.department_name}</span>
                )}
                {!persona.department_name && persona.department_slug && (
                  <span className="truncate">• {persona.department_slug}</span>
                )}
              </div>

              {/* Data Points Row */}
              <div className="flex items-center gap-4 mt-2">
                {painPointsCount > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    <span className="font-semibold text-gray-700">{painPointsCount}</span>
                    <span className="text-gray-500">Pain Points</span>
                  </div>
                )}
                {jtbdsCount > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Target className="h-3.5 w-3.5 text-blue-500" />
                    <span className="font-semibold text-gray-700">{jtbdsCount}</span>
                    <span className="text-gray-500">JTBDs</span>
                  </div>
                )}
                {goalsCount > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                    <span className="font-semibold text-gray-700">{goalsCount}</span>
                    <span className="text-gray-500">Goals</span>
                  </div>
                )}
                {challengesCount > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Award className="h-3.5 w-3.5 text-orange-500" />
                    <span className="font-semibold text-gray-700">{challengesCount}</span>
                    <span className="text-gray-500">Challenges</span>
                  </div>
                )}
                {responsibilitiesCount > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Users className="h-3.5 w-3.5 text-purple-500" />
                    <span className="font-semibold text-gray-700">{responsibilitiesCount}</span>
                    <span className="text-gray-500">Responsibilities</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {persona.role_name && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {persona.role_name}
              </Badge>
            )}
            {!persona.role_name && persona.role_slug && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {persona.role_slug}
              </Badge>
            )}
            {persona.department_name && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                {persona.department_name}
              </Badge>
            )}
            {!persona.department_name && persona.department_slug && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                {persona.department_slug}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
