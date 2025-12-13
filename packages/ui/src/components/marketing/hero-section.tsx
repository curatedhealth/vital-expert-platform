'use client';

import { ReactNode } from 'react';
import { ArrowUpRight, PlayCircle } from 'lucide-react';
import { Button } from '../button';
import { cn } from '../../lib/utils';

/**
 * HeroSection Component
 *
 * Clean, centered hero section inspired by shadcnui-blocks
 * Aligned with VITAL Brand Guidelines v6.0:
 * - Warm stone background (#FAFAF9)
 * - Purple accent (#9055E0)
 * - "Human Genius, Amplified" messaging
 */

interface HeroSectionProps {
  badge?: {
    text: string;
    href?: string;
  };
  headline: string | ReactNode;
  subheadline?: string;
  primaryCTA?: {
    text: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryCTA?: {
    text: string;
    onClick?: () => void;
    href?: string;
    icon?: 'play' | 'arrow';
  };
  className?: string;
  children?: ReactNode;
}

export function HeroSection({
  badge,
  headline,
  subheadline,
  primaryCTA,
  secondaryCTA,
  className,
  children,
}: HeroSectionProps) {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center px-6',
      className
    )}>
      <div className="relative z-10 text-center max-w-3xl">
        {/* Badge */}
        {badge && (
          badge.href ? (
            <a
              href={badge.href}
              className="inline-flex items-center rounded-full py-1.5 px-4 border border-stone-200 bg-white/80 backdrop-blur-sm text-stone-600 hover:bg-white/90 transition-colors text-sm font-medium"
            >
              {badge.text}
              <ArrowUpRight className="ml-1.5 w-4 h-4" />
            </a>
          ) : (
            <span className="inline-flex items-center rounded-full py-1.5 px-4 border border-stone-200 bg-white/80 backdrop-blur-sm text-stone-600 text-sm font-medium">
              {badge.text}
              <ArrowUpRight className="ml-1.5 w-4 h-4" />
            </span>
          )
        )}

        {/* Headline */}
        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-stone-800 leading-[1.1]">
          {headline}
        </h1>

        {/* Subheadline */}
        {subheadline && (
          <p className="mt-6 text-lg md:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
            {subheadline}
          </p>
        )}

        {/* CTAs */}
        {(primaryCTA || secondaryCTA) && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {primaryCTA && (
              <Button
                size="lg"
                className="rounded-full text-base px-8 bg-vital-primary-600 hover:bg-vital-primary-700"
                onClick={primaryCTA.onClick}
                asChild={!!primaryCTA.href}
              >
                {primaryCTA.href ? (
                  <a href={primaryCTA.href}>
                    {primaryCTA.text}
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </a>
                ) : (
                  <>
                    {primaryCTA.text}
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            )}

            {secondaryCTA && (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full text-base px-8 border-stone-300 text-stone-700 hover:bg-stone-100 shadow-none"
                onClick={secondaryCTA.onClick}
                asChild={!!secondaryCTA.href}
              >
                {secondaryCTA.href ? (
                  <a href={secondaryCTA.href}>
                    {secondaryCTA.icon === 'play' && <PlayCircle className="mr-2 h-5 w-5" />}
                    {secondaryCTA.text}
                    {secondaryCTA.icon === 'arrow' && <ArrowUpRight className="ml-2 h-5 w-5" />}
                  </a>
                ) : (
                  <>
                    {secondaryCTA.icon === 'play' && <PlayCircle className="mr-2 h-5 w-5" />}
                    {secondaryCTA.text}
                    {secondaryCTA.icon === 'arrow' && <ArrowUpRight className="ml-2 h-5 w-5" />}
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Optional children for custom content */}
        {children}
      </div>
    </div>
  );
}

export default HeroSection;
