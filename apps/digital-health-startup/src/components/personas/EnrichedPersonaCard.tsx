'use client';

/**
 * Enriched Persona Card
 * Displays persona with strategic pillars, JTBDs, and pain points
 */

import React from 'react';
import { User, Briefcase, Target, AlertCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import {
  usePersonaStrategicSummary,
  usePersonaJTBDSummary,
} from '@/hooks/usePersonaMappings';

interface EnrichedPersonaCardProps {
  personaUniqueId: string;
  personaName: string;
  personaCode: string;
  personaTier?: string;
  personaPriority?: number;
  personaIndustry?: string;
  onViewDetails?: () => void;
}

export function EnrichedPersonaCard({
  personaUniqueId,
  personaName,
  personaCode,
  personaTier,
  personaPriority,
  personaIndustry,
  onViewDetails,
}: EnrichedPersonaCardProps) {
  const { data: spSummary, loading: spLoading } = usePersonaStrategicSummary(personaUniqueId);
  const { data: jtbdSummary, loading: jtbdLoading } = usePersonaJTBDSummary(personaUniqueId);

  const loading = spLoading || jtbdLoading;

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Priority color
  const getPriorityColor = (priority?: number) => {
    if (!priority) return 'bg-gray-500';
    if (priority >= 8.5) return 'bg-green-500';
    if (priority >= 7.5) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {/* Avatar and Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{personaName}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {personaCode === 'P001' && 'VP Medical Affairs / Chief Medical Officer'}
                {personaCode === 'P002' && 'Medical Director / Therapeutic Area Lead'}
                {personaCode === 'PADA11' && 'Senior Medical Science Liaison'}
              </p>
            </div>
          </div>

          {/* Priority Badge */}
          {personaPriority && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(personaPriority)}`} />
              <span className="text-sm font-medium text-gray-600">
                {personaPriority.toFixed(1)}/10
              </span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex gap-2 mt-3">
          <Badge variant="secondary">{personaCode}</Badge>
          {personaTier && <Badge variant="outline">Tier {personaTier}</Badge>}
          {personaIndustry && <Badge variant="outline">{personaIndustry}</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {/* Strategic Pillars */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Strategic Pillars</span>
              </div>
              <span className="font-semibold text-blue-600">
                {spSummary?.strategic_pillar_count || 0}
              </span>
            </div>

            {/* JTBDs */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">JTBDs</span>
                </div>
                <span className="font-semibold text-blue-600">
                  {jtbdSummary?.total_jtbds || 0}
                </span>
              </div>
              <div className="flex gap-2 ml-6">
                <Badge variant="default" className="text-xs">
                  {jtbdSummary?.primary_jtbds || 0} Primary
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {((jtbdSummary?.total_jtbds || 0) - (jtbdSummary?.primary_jtbds || 0))} Secondary
                </Badge>
              </div>
            </div>

            {/* Pain Points */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Pain Points</span>
              </div>
              <span className="font-semibold text-orange-600">
                {spSummary?.total_pain_points || 0}
              </span>
            </div>

            {/* Strategic Pillars Badges */}
            {spSummary?.strategic_pillars && spSummary.strategic_pillars.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-2">Focus Areas:</p>
                <div className="flex flex-wrap gap-1">
                  {spSummary.strategic_pillars.slice(0, 4).map((code) => (
                    <Badge key={code} variant="outline" className="text-xs">
                      {code}
                    </Badge>
                  ))}
                  {spSummary.strategic_pillars.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{spSummary.strategic_pillars.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* View Details Button */}
            <Button
              variant="ghost"
              className="w-full mt-2"
              onClick={onViewDetails}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
