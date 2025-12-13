'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Pill, Rocket, Building2, Briefcase } from 'lucide-react';

/**
 * Audience Section
 *
 * Who benefits from VITAL:
 * - Pharma/Biotech (starting vertical, NOT the identity)
 * - Startups & Innovation Labs
 * - Enterprise & Corporate
 * - Consultants & Advisors
 *
 * Domain-agnostic positioning - these are STARTING POINTS, not limitations
 */

const AUDIENCES = [
  {
    id: 'pharma',
    title: 'Pharma & Biotech',
    icon: Pill,
    description:
      'Accelerate product development, generate regulatory documentation, optimize market access, and improve commercial strategy.',
    color: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
    },
  },
  {
    id: 'startups',
    title: 'Startups & Innovation',
    icon: Rocket,
    description:
      'Gain critical domain knowledge, validate product roadmaps, decrease time-to-market, and launch innovative products faster.',
    color: {
      bg: 'bg-pink-100',
      text: 'text-pink-600',
    },
  },
  {
    id: 'enterprise',
    title: 'Enterprise & Corporate',
    icon: Building2,
    description:
      'Enhance decision-making efficiency, optimize value assessment, and transform complex challenges into actionable insights.',
    color: {
      bg: 'bg-amber-100',
      text: 'text-amber-600',
    },
  },
  {
    id: 'consultants',
    title: 'Consultants & Advisors',
    icon: Briefcase,
    description:
      'Scale your expertise with AI-powered insights analysis and strategic recommendations from specialized agents.',
    color: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
    },
  },
];

interface AudienceSectionProps {
  onComparePlans?: () => void;
  onContactSales?: () => void;
}

export function AudienceSection({ onComparePlans, onContactSales }: AudienceSectionProps) {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 bg-stone-50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
          {/* Left column - Header */}
          <div>
            <p className="text-vital-primary-600 font-semibold mb-3 uppercase tracking-wide text-sm">
              Empower
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-4 leading-tight">
              Who benefits from our platform?
            </h2>
            <p className="text-stone-600 text-lg mb-8">
              Our fit-for-purpose solution transforms complex challenges into
              precise, concrete steps for professionals in all areas.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                onClick={onComparePlans}
                variant="outline"
                className="border-stone-300"
              >
                Compare Plans
              </Button>
              <Button
                onClick={onContactSales}
                variant="ghost"
                className="text-vital-primary-600 hover:text-vital-primary-700"
              >
                Contact Sales
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right column - Audience Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {AUDIENCES.map((audience) => {
              const Icon = audience.icon;

              return (
                <div key={audience.id} className="flex flex-col">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl ${audience.color.bg} flex items-center justify-center mb-5`}
                  >
                    <Icon className={`w-7 h-7 ${audience.color.text}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-stone-800 mb-3">
                    {audience.title}
                  </h3>

                  {/* Description */}
                  <p className="text-stone-600 leading-relaxed">
                    {audience.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AudienceSection;
