'use client';

/**
 * PersonaFocusView - VITAL Brand Guidelines v6.0
 *
 * Priority-focused view showing top personas by composite score
 * Extracted from personas/page.tsx for maintainability
 */

import React from 'react';
import { Card, CardContent, Button } from '@vital/ui';
import { PersonaCard, type Persona } from '@/components/personas';

interface PersonaFocusViewProps {
  personas: Persona[];
  onPersonaClick: (persona: Persona) => void;
  onResetSort?: () => void;
}

export function PersonaFocusView({ personas, onPersonaClick, onResetSort }: PersonaFocusViewProps) {
  return (
    <div className="space-y-6">
      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {personas.slice(0, 3).map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            onClick={onPersonaClick}
          />
        ))}
      </div>

      {/* Focus Order List */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-neutral-500">Top opportunities</p>
              <h3 className="text-xl font-bold text-neutral-900">Focus Order</h3>
              <p className="text-sm text-neutral-500">Sorted by composite priority (AI readiness, work complexity, JTBD load)</p>
            </div>
            {onResetSort && (
              <Button variant="outline" size="sm" onClick={onResetSort}>
                Reset priority sort
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {personas.slice(0, 12).map((persona, index) => {
              const aiScore = Number(persona.ai_readiness_score ?? 0);
              const workScore = Number(persona.work_complexity_score ?? 0);
              const aiLabel = Number.isFinite(aiScore) && aiScore > 0 ? `${Math.round(aiScore * 100)}% AI` : 'AI —';
              const workLabel = Number.isFinite(workScore) && workScore > 0 ? `${Math.round(workScore * 100)}% Work` : 'Work —';

              return (
                <div
                  key={persona.id}
                  className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3 hover:bg-stone-50 hover:border-purple-300 cursor-pointer transition-all duration-150"
                  onClick={() => onPersonaClick(persona)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white font-semibold flex items-center justify-center shadow-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">{persona.name}</p>
                      <p className="text-xs text-stone-500">{persona.title || persona.function_name || persona.role_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-cyan-600 font-semibold">{aiLabel}</div>
                    <div className="text-purple-600 font-semibold">{workLabel}</div>
                    <div className="text-stone-600 font-medium">{persona.jtbds_count || 0} JTBDs</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
