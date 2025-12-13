'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { BRAND_MESSAGING } from '@/lib/brand/brand-tokens';
import { SHADOWS, GRADIENT_TEXT_STYLE } from '../styles/design-tokens';

/**
 * Premium CTA Section
 *
 * Final call-to-action with:
 * - Bold gradient background
 * - Geometric accents
 * - Premium buttons with glow
 * - Trust indicators
 */

interface CTASectionPremiumProps {
  onGetStarted?: () => void;
  onScheduleDemo?: () => void;
}

export function CTASectionPremium({ onGetStarted, onScheduleDemo }: CTASectionPremiumProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-[#FAFAF9] overflow-hidden">
      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #292524 0%, #44403C 100%)',
          }}
        >
          {/* Geometric background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Large purple circle glow */}
            <div
              className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(144, 85, 224, 0.3) 0%, transparent 70%)',
              }}
            />
            <div
              className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
              }}
            />

            {/* Geometric shapes */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
              {/* Grid pattern */}
              <defs>
                <pattern id="ctaGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#ctaGrid)" />

              {/* Floating shapes */}
              <circle cx="15%" cy="25%" r="40" fill="#9055E0" />
              <rect x="80%" y="20%" width="50" height="50" rx="8" fill="#F59E0B" transform="rotate(15 85% 30%)" />
              <polygon points="85,350 110,400 60,400" fill="#10B981" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center py-16 md:py-24 px-8 md:px-16">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-white/90">Beta Program Open</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-6 leading-tight max-w-3xl mx-auto"
            >
              Ready to amplify{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                your genius
              </span>
              ?
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg text-white/70 mb-10 max-w-xl mx-auto"
            >
              Join innovative teams using VITAL to transform how they work.
              Early adopters receive priority onboarding and dedicated support.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Button
                onClick={onGetStarted}
                className="bg-white text-stone-800 hover:bg-white/90 px-8 py-6 text-lg rounded-xl font-medium transition-all duration-200 group"
                style={{ boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2)' }}
              >
                {BRAND_MESSAGING.cta.primary}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={onScheduleDemo}
                variant="outline"
                className="border-white/30 bg-white/5 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl font-medium transition-all duration-200"
              >
                <Calendar className="mr-2 w-5 h-5" />
                Schedule Demo
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-12 pt-8 border-t border-white/10"
            >
              <p className="text-white/50 text-sm mb-4">Trusted by innovative teams at</p>
              <div className="flex items-center justify-center gap-8 opacity-50">
                {/* Placeholder logos - using text for now */}
                <span className="text-white font-semibold text-lg">vital.expert</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CTASectionPremium;
