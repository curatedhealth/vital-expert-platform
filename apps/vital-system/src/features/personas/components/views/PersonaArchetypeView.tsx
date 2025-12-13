'use client';

/**
 * PersonaArchetypeView - VITAL Brand Guidelines v6.0
 *
 * Groups personas by MECE archetype classification
 * Extracted from personas/page.tsx for maintainability
 */

import React from 'react';
import { Badge } from '@vital/ui';
import { Users, Zap, Brain, Lightbulb, AlertTriangle } from 'lucide-react';
import { PersonaCard, type Persona } from '@/components/personas';

interface PersonaArchetypeViewProps {
  personas: Persona[];
  onPersonaClick: (persona: Persona) => void;
}

/**
 * Archetype configuration - VITAL Brand Guidelines v6.0
 * Uses warm purple (#9055E0) as primary accent with complementary colors
 * Stone neutrals for backgrounds (stone-50, stone-100)
 */
const archetypeConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string; description: string }> = {
  AUTOMATOR: {
    icon: <Zap className="h-6 w-6" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 border-cyan-200',
    description: 'High AI readiness + Low complexity: Efficiency-focused, automation champions',
  },
  ORCHESTRATOR: {
    icon: <Brain className="h-6 w-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    description: 'High AI readiness + High complexity: Strategic leaders, AI power users',
  },
  LEARNER: {
    icon: <Lightbulb className="h-6 w-6" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    description: 'Low AI readiness + Low complexity: Building skills, needs guidance',
  },
  SKEPTIC: {
    icon: <AlertTriangle className="h-6 w-6" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'Low AI readiness + High complexity: Proof-driven, values multiple perspectives',
  },
};

const ARCHETYPES = ['AUTOMATOR', 'ORCHESTRATOR', 'LEARNER', 'SKEPTIC'] as const;

export function PersonaArchetypeView({ personas, onPersonaClick }: PersonaArchetypeViewProps) {
  // Get personas without archetype assignment
  const unknownPersonas = personas.filter(p => !p.derived_archetype && !p.archetype);

  return (
    <div className="space-y-8">
      {ARCHETYPES.map(archetype => {
        const archetypePersonas = personas.filter(p =>
          p.derived_archetype === archetype || p.archetype === archetype
        );
        const config = archetypeConfig[archetype];

        return (
          <div key={archetype}>
            <div className="flex items-center gap-3 mb-2">
              <div className={config.color}>{config.icon}</div>
              <h2 className={`text-2xl font-bold ${config.color}`}>{archetype}</h2>
              <Badge variant={archetypePersonas.length > 0 ? "default" : "secondary"}>
                {archetypePersonas.length}
              </Badge>
            </div>
            <p className="text-sm text-neutral-600 mb-4">{config.description}</p>
            {archetypePersonas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archetypePersonas.map((persona) => (
                  <PersonaCard
                    key={persona.id}
                    persona={persona}
                    compact
                    onClick={onPersonaClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-neutral-500 italic py-4 border-l-4 border-neutral-200 pl-4">
                No personas with this archetype
              </div>
            )}
          </div>
        );
      })}

      {/* Unassigned Personas */}
      {unknownPersonas.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-6 w-6 text-neutral-500" />
            <h2 className="text-2xl font-bold text-neutral-500">Unassigned</h2>
            <Badge variant="secondary">{unknownPersonas.length}</Badge>
          </div>
          <p className="text-sm text-neutral-600 mb-4">Personas without MECE archetype assignment</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unknownPersonas.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                compact
                onClick={onPersonaClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
