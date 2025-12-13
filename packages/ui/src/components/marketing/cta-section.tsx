'use client';

import { ReactNode } from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '../button';
import { cn } from '../../lib/utils';

/**
 * CTASection Component
 *
 * Call-to-action section with dark gradient background
 * Aligned with VITAL Brand Guidelines v6.0
 */

interface CTASectionProps {
  badge?: string;
  headline: string | ReactNode;
  description?: string;
  primaryCTA?: {
    text: string;
    onClick?: () => void;
  };
  secondaryCTA?: {
    text: string;
    onClick?: () => void;
    icon?: 'calendar' | 'arrow';
  };
  className?: string;
  children?: ReactNode;
}

export function CTASection({
  badge,
  headline,
  description,
  primaryCTA,
  secondaryCTA,
  className,
  children,
}: CTASectionProps) {
  return (
    <section className={cn('py-20 md:py-28', className)}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div
          className="relative rounded-3xl overflow-hidden py-16 md:py-20 px-8 md:px-16 text-center"
          style={{
            background: 'linear-gradient(135deg, #292524 0%, #44403C 100%)',
          }}
        >
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(144, 85, 224, 0.25) 0%, transparent 70%)',
              }}
            />
            <div
              className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
              }}
            />
          </div>

          <div className="relative z-10">
            {/* Badge */}
            {badge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-white/90">{badge}</span>
              </div>
            )}

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-6 leading-tight max-w-3xl mx-auto">
              {headline}
            </h2>

            {/* Description */}
            {description && (
              <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
                {description}
              </p>
            )}

            {/* CTAs */}
            {(primaryCTA || secondaryCTA) && (
              <div className="flex flex-wrap items-center justify-center gap-4">
                {primaryCTA && (
                  <Button
                    onClick={primaryCTA.onClick}
                    size="lg"
                    className="bg-white text-stone-800 hover:bg-white/90 rounded-full px-8 text-base font-medium"
                    style={{ boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2)' }}
                  >
                    {primaryCTA.text}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                )}
                {secondaryCTA && (
                  <Button
                    onClick={secondaryCTA.onClick}
                    variant="outline"
                    size="lg"
                    className="border-white/30 bg-white/5 text-white hover:bg-white/10 rounded-full px-8 text-base font-medium"
                  >
                    {secondaryCTA.icon === 'calendar' && <Calendar className="mr-2 w-5 h-5" />}
                    {secondaryCTA.text}
                    {secondaryCTA.icon === 'arrow' && <ArrowRight className="ml-2 w-5 h-5" />}
                  </Button>
                )}
              </div>
            )}

            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
