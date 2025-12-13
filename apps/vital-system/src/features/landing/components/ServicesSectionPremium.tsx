'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, MessageSquare, Users, GitBranch, Boxes } from 'lucide-react';
import { SERVICE_LAYERS } from '@/lib/brand/brand-tokens';
import { SHADOWS } from '../styles/design-tokens';

/**
 * Premium Services Section
 *
 * Four AI service layers with:
 * - Interactive cards with depth
 * - Atomic geometry icons
 * - Hover animations
 * - Timing indicators
 */

const SERVICE_CONFIG = {
  'ask-expert': {
    icon: MessageSquare,
    shape: 'circle',
    color: '#9055E0',
    bgColor: 'rgba(144, 85, 224, 0.08)',
    borderColor: 'rgba(144, 85, 224, 0.2)',
  },
  'expert-panel': {
    icon: Users,
    shape: 'square',
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.08)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  workflows: {
    icon: GitBranch,
    shape: 'triangle',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  solutions: {
    icon: Boxes,
    shape: 'diamond',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
};

interface ServicesSectionPremiumProps {
  onServiceClick?: (serviceId: string) => void;
}

export function ServicesSectionPremium({ onServiceClick }: ServicesSectionPremiumProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #78716C 1px, transparent 1px),
            linear-gradient(to bottom, #78716C 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-sm font-medium tracking-wide uppercase text-vital-primary-600 mb-4"
          >
            Capabilities
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-semibold text-stone-800 mb-6 leading-tight"
          >
            Four powerful ways to amplify your work
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-stone-600"
          >
            From instant answers to complex orchestration. Choose the right level of engagement
            for every challenge.
          </motion.p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICE_LAYERS.map((service, index) => {
            const config = SERVICE_CONFIG[service.id as keyof typeof SERVICE_CONFIG] || SERVICE_CONFIG['ask-expert'];
            const Icon = config.icon;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                onClick={() => onServiceClick?.(service.id)}
                className="group cursor-pointer"
              >
                <div
                  className="relative h-full bg-[#FAFAF9] rounded-2xl p-6 lg:p-8 border-2 transition-all duration-300 group-hover:-translate-y-2"
                  style={{
                    borderColor: config.borderColor,
                    boxShadow: SHADOWS.sm,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = config.color;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = SHADOWS.lg;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = config.borderColor;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = SHADOWS.sm;
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    <Icon className="w-7 h-7" style={{ color: config.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-stone-800 mb-3">
                    {service.name}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: config.bgColor,
                        color: config.color,
                      }}
                    >
                      {service.timing}
                    </span>
                    <ArrowRight
                      className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                      style={{ color: config.color }}
                    />
                  </div>

                  {/* Decorative shape */}
                  <div className="absolute top-4 right-4 opacity-[0.08]">
                    <svg width="48" height="48" viewBox="0 0 48 48">
                      {config.shape === 'circle' && (
                        <circle cx="24" cy="24" r="20" fill={config.color} />
                      )}
                      {config.shape === 'square' && (
                        <rect x="4" y="4" width="40" height="40" rx="6" fill={config.color} />
                      )}
                      {config.shape === 'triangle' && (
                        <polygon points="24,4 44,40 4,40" fill={config.color} />
                      )}
                      {config.shape === 'diamond' && (
                        <polygon points="24,2 46,24 24,46 2,24" fill={config.color} />
                      )}
                    </svg>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServicesSectionPremium;
