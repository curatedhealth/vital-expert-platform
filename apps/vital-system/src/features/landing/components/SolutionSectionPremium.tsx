'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { SHADOWS, GRADIENT_TEXT_STYLE } from '../styles/design-tokens';

/**
 * Premium Solution Section
 *
 * "After State" transformation visualization
 * - Organized geometry (chaos → order)
 * - Key value propositions
 * - Social proof metrics
 */

const VALUE_PROPS = [
  'Synthesize insights from any domain in seconds',
  'Multi-agent collaboration for complex decisions',
  'Continuous learning that compounds over time',
  'Enterprise-grade security and compliance',
];

const METRICS = [
  { value: '50%', label: 'Faster Decisions', sublabel: 'Average time saved' },
  { value: '3x', label: 'More Insights', sublabel: 'Per research session' },
  { value: '40%', label: 'Cost Reduction', sublabel: 'In knowledge work' },
];

interface SolutionSectionPremiumProps {
  onExplore?: () => void;
}

export function SolutionSectionPremium({ onExplore }: SolutionSectionPremiumProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} id="solution" className="relative py-24 md:py-32 bg-[#FAFAF9] overflow-hidden">
      {/* Organized geometry background - representing order */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial gradient accent */}
        <div
          className="absolute top-0 right-0 w-[800px] h-[800px] -translate-y-1/2 translate-x-1/3 opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #9055E0 0%, transparent 70%)',
          }}
        />

        {/* Connection lines - organized pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
          <defs>
            <linearGradient id="solutionLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9055E0" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="url(#solutionLine)" strokeWidth="1" />
          <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="url(#solutionLine)" strokeWidth="1" />
          <line x1="10%" y1="70%" x2="90%" y2="70%" stroke="url(#solutionLine)" strokeWidth="1" />
          <circle cx="10%" cy="30%" r="4" fill="#9055E0" />
          <circle cx="50%" cy="30%" r="4" fill="#6366F1" />
          <circle cx="90%" cy="30%" r="4" fill="#EC4899" />
          <circle cx="10%" cy="50%" r="4" fill="#10B981" />
          <circle cx="50%" cy="50%" r="4" fill="#9055E0" />
          <circle cx="90%" cy="50%" r="4" fill="#F59E0B" />
        </svg>
      </div>

      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-6"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">The Breakthrough</span>
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-semibold text-stone-800 mb-6 leading-tight"
            >
              Transform chaos into{' '}
              <span style={GRADIENT_TEXT_STYLE}>compounding insight</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-stone-600 mb-8 leading-relaxed"
            >
              VITAL orchestrates expertise across domains, synthesizing scattered knowledge into
              structured understanding that grows with every interaction.
            </motion.p>

            {/* Value Props */}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4 mb-10"
            >
              {VALUE_PROPS.map((prop, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-stone-700">{prop}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button
                onClick={onExplore}
                className="bg-vital-primary-600 hover:bg-vital-primary-700 text-white px-8 py-6 text-lg rounded-xl font-medium transition-all duration-200 group"
                style={{ boxShadow: SHADOWS.purpleGlow }}
              >
                Explore the Platform
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>

          {/* Right: Metrics Cards */}
          <div className="grid gap-6">
            {METRICS.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="group"
              >
                <div
                  className="bg-white rounded-2xl p-8 border border-stone-100 transition-all duration-300 group-hover:-translate-y-1"
                  style={{ boxShadow: SHADOWS.md }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl md:text-5xl font-bold text-stone-800 mb-2">
                        {metric.value}
                      </div>
                      <div className="text-lg font-medium text-stone-700">{metric.label}</div>
                      <div className="text-sm text-stone-500">{metric.sublabel}</div>
                    </div>

                    {/* Decorative element */}
                    <div className="hidden sm:block">
                      <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-20">
                        {index === 0 && (
                          <circle cx="40" cy="40" r="35" fill="#9055E0" />
                        )}
                        {index === 1 && (
                          <rect x="10" y="10" width="60" height="60" rx="8" fill="#F59E0B" />
                        )}
                        {index === 2 && (
                          <polygon points="40,5 75,70 5,70" fill="#10B981" />
                        )}
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SolutionSectionPremium;
