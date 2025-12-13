'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Pill,
  Cpu,
  Briefcase,
  GraduationCap,
  Building2,
  FlaskConical,
  LineChart,
  Shield,
  ArrowRight,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { DOMAIN_OPTIONS, BRAND_MESSAGING } from '@/lib/brand/brand-tokens';

/**
 * Domain Selection Component
 *
 * Onboarding step for selecting the user's starting domain.
 * VITAL is multi-vertical - pharma is ONE option, not THE identity.
 */

// Map icon names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Pill,
  Cpu,
  Briefcase,
  GraduationCap,
  Building2,
  FlaskConical,
  LineChart,
  Shield,
};

interface DomainSelectionProps {
  onComplete: (domainId: string) => void;
  onBack?: () => void;
  className?: string;
}

export function DomainSelection({
  onComplete,
  onBack,
  className,
}: DomainSelectionProps) {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selectedDomain) return;

    setIsSubmitting(true);
    try {
      await onComplete(selectedDomain);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('min-h-screen bg-[#FAFAF9]', className)}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-stone-800 mb-3">
            Choose your starting domain
          </h1>
          <p className="text-lg text-stone-600 max-w-xl mx-auto">
            VITAL adapts to your domain while enabling cross-domain insights.
            You can always explore other domains later.
          </p>
        </div>

        {/* Domain Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {DOMAIN_OPTIONS.map((domain) => {
            const Icon = ICON_MAP[domain.icon] || Briefcase;
            const isSelected = selectedDomain === domain.id;

            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => setSelectedDomain(domain.id)}
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
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-vital-primary-600 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </span>
                )}

                {/* Content */}
                <div className="flex items-center gap-4">
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

                  <span
                    className={cn(
                      'font-medium',
                      isSelected ? 'text-vital-primary-700' : 'text-stone-800'
                    )}
                  >
                    {domain.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Value proposition */}
        <div className="bg-stone-100 rounded-xl p-6 mb-10">
          <p className="text-center text-stone-600 text-sm">
            <span className="font-semibold text-stone-800">
              {BRAND_MESSAGING.valueProps.speed}
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-stone-500 hover:text-stone-700 text-sm font-medium transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <Button
            onClick={handleContinue}
            disabled={!selectedDomain || isSubmitting}
            className={cn(
              'bg-vital-primary-600 hover:bg-vital-primary-700 text-white',
              'px-6 py-2.5 rounded-lg font-medium',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
          >
            {isSubmitting ? (
              'Getting Started...'
            ) : (
              <>
                Get Started
                <ArrowRight size={16} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DomainSelection;
