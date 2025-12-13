'use client';

import React from 'react';
import { Card, CardContent, Badge } from '@vital/ui';
import { Target } from 'lucide-react';

interface JTBD {
  id?: string;
  is_primary?: boolean;
  relevance_score?: number;
  jobs_to_be_done?: {
    name?: string;
    code?: string;
    description?: string;
  };
}

interface PersonaJTBDTabProps {
  jtbds: JTBD[];
}

/**
 * Tab content showing persona's Jobs to Be Done
 * VITAL Brand Guidelines v6.0 compliant
 */
export function PersonaJTBDTab({ jtbds }: PersonaJTBDTabProps) {
  return (
    <Card className="border border-stone-200 shadow-sm bg-white">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-purple-600" />
          <div>
            <h2 className="text-lg font-bold text-stone-800">Jobs to be Done</h2>
            <p className="text-sm text-stone-500">Primary and supporting jobs linked to this persona</p>
          </div>
        </div>

        {jtbds.length === 0 && (
          <p className="text-sm text-stone-500">No JTBDs mapped yet.</p>
        )}

        <div className="space-y-3">
          {jtbds.map((jtbd, index) => (
            <div
              key={jtbd.id || index}
              className="p-4 rounded-lg border border-purple-100 bg-purple-50 transition-all duration-150 hover:border-purple-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-800">
                    {jtbd.jobs_to_be_done?.name || `JTBD #${index + 1}`}
                  </p>
                  {jtbd.jobs_to_be_done?.code && (
                    <p className="text-xs text-stone-500">Code: {jtbd.jobs_to_be_done.code}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {jtbd.is_primary && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                      Primary
                    </Badge>
                  )}
                  {jtbd.relevance_score && (
                    <Badge variant="outline" className="text-xs border-stone-300">
                      Relevance {(jtbd.relevance_score * 100).toFixed(0)}%
                    </Badge>
                  )}
                </div>
              </div>
              {jtbd.jobs_to_be_done?.description && (
                <p className="text-sm text-stone-700 mt-1">{jtbd.jobs_to_be_done.description}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
