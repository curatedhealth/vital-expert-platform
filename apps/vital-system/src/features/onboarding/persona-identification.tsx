'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Search,
  Layers,
  GitBranch,
  Beaker,
  Building,
  Compass,
  Map,
  FlaskConical,
  Maximize,
  Mountain,
  ArrowRight,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { INNOVATOR_PERSONAS, BRAND_MESSAGING } from '@/lib/brand/brand-tokens';

/**
 * Persona Identification Component
 *
 * First-run onboarding experience that identifies the user's innovator type.
 * Based on 10 innovator persona archetypes from Brand Guidelines.
 */

// Map icon names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Search,
  Layers,
  GitBranch,
  Beaker,
  Building,
  Compass,
  Map,
  FlaskConical,
  Maximize,
  Mountain,
};

interface PersonaIdentificationProps {
  onComplete: (personaId: string) => void;
  onSkip?: () => void;
  className?: string;
}

export function PersonaIdentification({
  onComplete,
  onSkip,
  className,
}: PersonaIdentificationProps) {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selectedPersona) return;

    setIsSubmitting(true);
    try {
      await onComplete(selectedPersona);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('min-h-screen bg-[#FAFAF9]', className)}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-stone-800 mb-3">
            What kind of innovator are you?
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {BRAND_MESSAGING.philosophy}
          </p>
        </div>

        {/* Persona Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {INNOVATOR_PERSONAS.map((persona) => {
            const Icon = ICON_MAP[persona.icon] || Search;
            const isSelected = selectedPersona === persona.id;

            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => setSelectedPersona(persona.id)}
                className={cn(
                  'relative p-5 rounded-xl border-2 text-left transition-all duration-200',
                  'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-vital-primary-600/20',
                  isSelected
                    ? 'border-vital-primary-600 bg-vital-primary-50 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                )}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-vital-primary-600 flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </span>
                )}

                {/* Content */}
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      isSelected
                        ? 'bg-vital-primary-600 text-white'
                        : 'bg-stone-100 text-stone-600'
                    )}
                  >
                    <Icon size={24} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={cn(
                        'font-semibold mb-1',
                        isSelected ? 'text-vital-primary-700' : 'text-stone-800'
                      )}
                    >
                      {persona.name}
                    </h3>
                    <p className="text-sm text-stone-600 mb-3">
                      {persona.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.traits.map((trait) => (
                        <span
                          key={trait}
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            isSelected
                              ? 'bg-vital-primary-100 text-vital-primary-700'
                              : 'bg-stone-100 text-stone-600'
                          )}
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {onSkip ? (
            <button
              type="button"
              onClick={onSkip}
              className="text-stone-500 hover:text-stone-700 text-sm font-medium transition-colors"
            >
              Skip for now
            </button>
          ) : (
            <div />
          )}

          <Button
            onClick={handleContinue}
            disabled={!selectedPersona || isSubmitting}
            className={cn(
              'bg-vital-primary-600 hover:bg-vital-primary-700 text-white',
              'px-6 py-2.5 rounded-lg font-medium',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
          >
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                Continue
                <ArrowRight size={16} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PersonaIdentification;
