'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { AlertCircle, Clock, Zap } from 'lucide-react';
import { SHADOWS } from '../styles/design-tokens';

/**
 * Premium Problem Section
 *
 * Visual storytelling of the "before state"
 * - Pain points with icons
 * - Scattered geometry representing chaos
 * - Elegant card design with depth
 */

const PAIN_POINTS = [
  {
    icon: AlertCircle,
    title: 'Fragmented Knowledge',
    description: 'Critical insights scattered across teams, tools, and documents. Context lost in silos.',
    color: '#9055E0',
  },
  {
    icon: Clock,
    title: 'Time-Consuming Research',
    description: 'Hours spent gathering information that should take minutes. Decisions delayed.',
    color: '#F59E0B',
  },
  {
    icon: Zap,
    title: 'Wasted Potential',
    description: 'Brilliant ideas never reach their full potential. Innovation bottlenecked by process.',
    color: '#EC4899',
  },
];

export function ProblemSectionPremium() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Scattered geometry background - representing chaos */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <svg className="w-full h-full" viewBox="0 0 1200 600">
          {/* Scattered squares */}
          <rect x="100" y="50" width="40" height="40" fill="#F59E0B" transform="rotate(15 120 70)" />
          <rect x="200" y="400" width="30" height="30" fill="#F59E0B" transform="rotate(-20 215 415)" />
          <rect x="1000" y="100" width="50" height="50" fill="#F59E0B" transform="rotate(45 1025 125)" />
          <rect x="800" y="450" width="35" height="35" fill="#F59E0B" transform="rotate(30 817 467)" />

          {/* Scattered circles */}
          <circle cx="150" cy="300" r="25" fill="#9055E0" />
          <circle cx="500" cy="80" r="20" fill="#9055E0" />
          <circle cx="900" cy="350" r="30" fill="#9055E0" />
          <circle cx="1100" cy="500" r="18" fill="#9055E0" />

          {/* Scattered triangles */}
          <polygon points="400,150 420,190 380,190" fill="#10B981" transform="rotate(25 400 170)" />
          <polygon points="700,500 730,560 670,560" fill="#10B981" transform="rotate(-15 700 530)" />
          <polygon points="1050,300 1080,360 1020,360" fill="#10B981" transform="rotate(40 1050 330)" />
        </svg>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-sm font-medium tracking-wide uppercase text-stone-400 mb-4"
          >
            The Challenge
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-semibold text-stone-800 mb-6 leading-tight"
          >
            Knowledge workers face an{' '}
            <span className="text-stone-400">overwhelming reality</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-stone-600"
          >
            In a world of information overload, even the brightest minds struggle to synthesize
            insights and make confident decisions quickly.
          </motion.p>
        </div>

        {/* Pain Point Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PAIN_POINTS.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="group relative"
              >
                <div
                  className="relative bg-[#FAFAF9] rounded-2xl p-8 border border-stone-100 transition-all duration-300 group-hover:-translate-y-1"
                  style={{
                    boxShadow: SHADOWS.sm,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${point.color}15` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: point.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-stone-800 mb-3">
                    {point.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed">
                    {point.description}
                  </p>

                  {/* Accent line */}
                  <div
                    className="absolute bottom-0 left-8 right-8 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: point.color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ProblemSectionPremium;
