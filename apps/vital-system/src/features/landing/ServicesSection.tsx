'use client';

import { ArrowRight, MessageSquare, Users, GitBranch, Boxes } from 'lucide-react';
import { SERVICE_LAYERS } from '@/lib/brand/brand-tokens';

/**
 * Services Section
 *
 * Four Powerful AI Services:
 * 1. Ask Expert - Direct consultation (<3 seconds)
 * 2. Expert Panel - Multi-agent deliberation (10-30 seconds)
 * 3. Workflows - Multi-step with checkpoints (Minutes to hours)
 * 4. Solutions Builder - End-to-end orchestration (Hours to days)
 */

// Map service IDs to icons
const SERVICE_ICONS = {
  'ask-expert': MessageSquare,
  'expert-panel': Users,
  workflows: GitBranch,
  solutions: Boxes,
};

// Map service IDs to colors
const SERVICE_COLORS = {
  'ask-expert': {
    bg: 'bg-violet-100',
    text: 'text-violet-600',
    border: 'border-violet-200',
    hover: 'hover:border-violet-400',
  },
  'expert-panel': {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    hover: 'hover:border-indigo-400',
  },
  workflows: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    hover: 'hover:border-emerald-400',
  },
  solutions: {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    border: 'border-amber-200',
    hover: 'hover:border-amber-400',
  },
};

interface ServicesSectionProps {
  onServiceClick?: (serviceId: string) => void;
}

export function ServicesSection({ onServiceClick }: ServicesSectionProps) {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 bg-white">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-vital-primary-600 font-semibold mb-3 uppercase tracking-wide text-sm">
            Accelerate
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-4">
            Unlock your creative potential
          </h2>
          <p className="text-stone-600 text-lg">
            Four powerful AI services designed to transform the way you work.
            No coding skills required. Compliance by design.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICE_LAYERS.map((service) => {
            const Icon = SERVICE_ICONS[service.id as keyof typeof SERVICE_ICONS] || MessageSquare;
            const colors = SERVICE_COLORS[service.id as keyof typeof SERVICE_COLORS] || SERVICE_COLORS['ask-expert'];

            return (
              <div
                key={service.id}
                onClick={() => onServiceClick?.(service.id)}
                className={`
                  group flex flex-col p-6 rounded-2xl border-2 bg-[#FAFAF9]
                  ${colors.border} ${colors.hover}
                  transition-all duration-200 cursor-pointer
                  hover:shadow-lg hover:-translate-y-1
                `}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-stone-800 mb-2">
                  {service.name}
                </h3>

                {/* Description */}
                <p className="text-stone-600 text-sm flex-grow mb-4">
                  {service.description}
                </p>

                {/* Timing */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${colors.text}`}>
                    {service.timing}
                  </span>
                  <ArrowRight className={`w-4 h-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
