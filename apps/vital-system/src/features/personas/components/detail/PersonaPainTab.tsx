'use client';

import React from 'react';
import { Card, CardContent, Badge } from '@vital/ui';
import { AlertCircle, Zap } from 'lucide-react';

interface PainPoint {
  id?: string;
  pain_point_text?: string;
  pain_description?: string;
  pain_category?: string;
  severity?: string;
}

interface Challenge {
  id?: string;
  challenge_text?: string;
  challenge_description?: string;
  challenge_type?: string;
  impact_level?: string;
}

interface PersonaPainTabProps {
  painPoints: PainPoint[];
  challenges: Challenge[];
}

/**
 * Tab content showing persona's pain points and challenges
 * VITAL Brand Guidelines v6.0 compliant
 */
export function PersonaPainTab({ painPoints, challenges }: PersonaPainTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pain Points */}
      <Card className="border border-stone-200 shadow-sm bg-white">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <div>
              <h3 className="text-lg font-bold text-stone-800">Pain Points</h3>
              <p className="text-sm text-stone-500">Frictions this persona feels</p>
            </div>
          </div>

          {painPoints.length === 0 && (
            <p className="text-sm text-stone-500">No pain points captured.</p>
          )}

          <div className="space-y-3">
            {painPoints.map((point, idx) => (
              <div
                key={point.id || idx}
                className="rounded-lg border border-rose-100 bg-rose-50 p-3 transition-all duration-150 hover:border-rose-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-stone-800">
                    {point.pain_point_text || point.pain_description}
                  </p>
                  {point.severity && (
                    <Badge variant="outline" className="text-xs border-rose-200 text-rose-700">
                      {point.severity}
                    </Badge>
                  )}
                </div>
                {point.pain_category && (
                  <p className="text-xs text-stone-500 mt-1">Category: {point.pain_category}</p>
                )}
                {point.pain_description && point.pain_description !== point.pain_point_text && (
                  <p className="text-xs text-stone-600 mt-1">{point.pain_description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Challenges */}
      <Card className="border border-stone-200 shadow-sm bg-white">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="text-lg font-bold text-stone-800">Challenges</h3>
              <p className="text-sm text-stone-500">Operational blockers</p>
            </div>
          </div>

          {challenges.length === 0 && (
            <p className="text-sm text-stone-500">No challenges captured.</p>
          )}

          <div className="space-y-3">
            {challenges.map((challenge, idx) => (
              <div
                key={challenge.id || idx}
                className="rounded-lg border border-amber-100 bg-amber-50 p-3 transition-all duration-150 hover:border-amber-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-stone-800">
                    {challenge.challenge_text || challenge.challenge_description}
                  </p>
                  {challenge.impact_level && (
                    <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                      {challenge.impact_level}
                    </Badge>
                  )}
                </div>
                {challenge.challenge_type && (
                  <p className="text-xs text-stone-500 mt-1">Type: {challenge.challenge_type}</p>
                )}
                {challenge.challenge_description && challenge.challenge_description !== challenge.challenge_text && (
                  <p className="text-xs text-stone-600 mt-1">{challenge.challenge_description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
