'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Zap, TrendingDown } from 'lucide-react';
import { BRAND_MESSAGING } from '@/lib/brand/brand-tokens';

/**
 * Solution Section
 *
 * Presents VITAL as the breakthrough solution:
 * - Customizable AI agents for every task
 * - Key metrics (50%+ faster, 50%+ cost reduction)
 * - Visual demonstration area
 */

interface SolutionSectionProps {
  onExplore?: () => void;
  onWatchDemo?: () => void;
}

export function SolutionSection({ onExplore, onWatchDemo }: SolutionSectionProps) {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 bg-[#FAFAF9]">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start mb-16">
          {/* Left column - Solution statement */}
          <div>
            <p className="text-vital-primary-600 font-semibold mb-3 uppercase tracking-wide text-sm">
              Breakthrough Solution
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 leading-tight">
              {BRAND_MESSAGING.valueProps.agents}
            </h2>
          </div>

          {/* Right column - Details */}
          <div>
            <p className="text-stone-600 text-lg mb-8 leading-relaxed">
              From a simple question to an extensive end-to-end process, we&apos;ve
              got you covered. Our platform enables rapid, intelligent workflow
              creation tailored to your specific needs. {BRAND_MESSAGING.valueProps.hierarchy}.
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-4xl font-bold text-stone-800">&gt;50%</span>
                </div>
                <p className="text-stone-600 text-sm">
                  Faster decision-making with intelligent virtual experts
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-4xl font-bold text-stone-800">&gt;50%</span>
                </div>
                <p className="text-stone-600 text-sm">
                  Reduced operational costs through automated optimization
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Button
                onClick={onExplore}
                className="bg-vital-primary-600 hover:bg-vital-primary-700 text-white"
              >
                Explore Platform
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                onClick={onWatchDemo}
                variant="outline"
                className="border-stone-300"
              >
                <Play className="mr-2 w-4 h-4" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Platform Preview */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-vital-primary-600 to-vital-primary-800 p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          <div className="relative text-center text-white">
            <p className="text-lg opacity-90 mb-4">Platform Preview</p>
            <div className="aspect-video max-w-4xl mx-auto bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 rounded-full w-20 h-20"
              >
                <Play className="w-10 h-10" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SolutionSection;
