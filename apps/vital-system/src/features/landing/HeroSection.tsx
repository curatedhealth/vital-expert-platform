'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { BRAND_MESSAGING } from '@/lib/brand/brand-tokens';

/**
 * Hero Section
 *
 * "Human Genius, Amplified" - Main hero section with:
 * - Primary tagline and value proposition
 * - CTA buttons
 * - Visual background treatment
 */

interface HeroSectionProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}

export function HeroSection({ onGetStarted, onLearnMore }: HeroSectionProps) {
  return (
    <section className="relative px-[5%] py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-vital-primary-50 via-[#FAFAF9] to-stone-100 -z-10" />

      {/* Decorative shapes */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-vital-primary-100 rounded-full blur-3xl opacity-40 -z-10" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-30 -z-10" />

      <div className="container mx-auto">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vital-primary-100 text-vital-primary-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-vital-primary-600 animate-pulse" />
            Agentic Intelligence Platform
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-stone-800 mb-6 leading-tight">
            {BRAND_MESSAGING.tagline}
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-stone-600 mb-4 max-w-2xl leading-relaxed">
            {BRAND_MESSAGING.philosophy}
          </p>

          {/* Value proposition */}
          <p className="text-base text-stone-500 mb-8 max-w-xl">
            Empower your team with ultra-customizable AI agents that accelerate
            decision-making and innovation. The right AI agent for every task.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={onGetStarted}
              className="bg-vital-primary-600 hover:bg-vital-primary-700 text-white px-8 py-6 text-lg rounded-xl"
            >
              {BRAND_MESSAGING.cta.primary}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={onLearnMore}
              variant="outline"
              className="border-stone-300 text-stone-700 hover:bg-stone-50 px-8 py-6 text-lg rounded-xl"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-stone-200 w-full max-w-2xl">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-vital-primary-600">90%</p>
              <p className="text-sm text-stone-500 mt-1">Faster insights</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-vital-primary-600">5</p>
              <p className="text-sm text-stone-500 mt-1">Agent levels</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-vital-primary-600">24/7</p>
              <p className="text-sm text-stone-500 mt-1">Available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
