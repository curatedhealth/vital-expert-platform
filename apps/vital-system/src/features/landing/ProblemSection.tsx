'use client';

import { AlertTriangle, Clock, Layers } from 'lucide-react';

/**
 * Problem Section
 *
 * Highlights the challenges knowledge workers face:
 * - Drowning in complexity
 * - Fragmented processes
 * - Wasted potential
 *
 * Domain-agnostic language (not healthcare-specific)
 */

export function ProblemSection() {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 bg-stone-50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left column - Problem statement */}
          <div>
            <p className="text-vital-primary-600 font-semibold mb-3 uppercase tracking-wide text-sm">
              The Challenge
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-800 leading-tight">
              Knowledge workers are drowning in complexity
            </h2>
          </div>

          {/* Right column - Details */}
          <div>
            <p className="text-stone-600 text-lg mb-8 leading-relaxed">
              Current ways of working trap talented professionals in endless
              non-value-adding tasks. Human expertise is expensive and limited.
              With the rise of AI, expectations are higher than ever, yet current
              tools have limited impact. It&apos;s time to change that.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Problem 1 */}
              <div className="flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-2">
                  Fragmented processes
                </h3>
                <p className="text-stone-600">
                  Disconnected tools and generalist solutions prevent deep
                  strategic thinking. Experts have limited bandwidth.
                </p>
              </div>

              {/* Problem 2 */}
              <div className="flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-2">
                  Wasted potential
                </h3>
                <p className="text-stone-600">
                  Critical talent spends 50-70% of their time on mundane tasks
                  instead of solving complex challenges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProblemSection;
