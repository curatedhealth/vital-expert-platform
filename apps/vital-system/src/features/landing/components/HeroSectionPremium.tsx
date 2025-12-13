'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { BRAND_MESSAGING } from '@/lib/brand/brand-tokens';
import { GeometricBackground } from './GeometricBackground';
import { GRADIENT_TEXT_STYLE, SHADOWS, tw } from '../styles/design-tokens';

/**
 * Premium Hero Section
 *
 * World-class hero with:
 * - Abstract geometric visualization
 * - Refined typography with gradient text
 * - Sophisticated animations
 * - Premium depth and layering
 */

interface HeroSectionPremiumProps {
  onGetStarted?: () => void;
  onWatchDemo?: () => void;
}

export function HeroSectionPremium({ onGetStarted, onWatchDemo }: HeroSectionPremiumProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#FAFAF9]">
      {/* Geometric Background */}
      <GeometricBackground shapeCount={28} enableParallax />

      {/* Subtle noise texture for premium feel */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />

      {/* Main Content */}
      <div className={`relative z-10 ${tw.containerWide} py-20 md:py-28 lg:py-32`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left: Content */}
          <div className="lg:col-span-6 xl:col-span-5">
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vital-primary-50 border border-vital-primary-100">
                <Sparkles className="w-4 h-4 text-vital-primary-600" />
                <span className="text-sm font-medium text-vital-primary-700 tracking-wide">
                  Agentic Intelligence Platform
                </span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-semibold text-stone-800 mb-6 leading-[1.1] tracking-tight"
            >
              <span className="block">Human Genius,</span>
              <span style={GRADIENT_TEXT_STYLE} className="block">
                Amplified.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-lg md:text-xl text-stone-600 mb-8 max-w-lg leading-relaxed"
            >
              {BRAND_MESSAGING.philosophy}
            </motion.p>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap gap-8 mb-10"
            >
              {[
                { value: '90%', label: 'Faster Insights' },
                { value: '5', label: 'Agent Levels' },
                { value: '24/7', label: 'Available' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-stone-800">{stat.value}</div>
                  <div className="text-sm text-stone-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Button
                onClick={onGetStarted}
                className="bg-vital-primary-600 hover:bg-vital-primary-700 text-white px-8 py-6 text-lg rounded-xl font-medium transition-all duration-200 group"
                style={{ boxShadow: SHADOWS.purpleGlow }}
              >
                {BRAND_MESSAGING.cta.primary}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={onWatchDemo}
                variant="outline"
                className="border-stone-300 text-stone-700 hover:border-vital-primary-600 hover:text-vital-primary-600 px-6 py-6 text-lg rounded-xl font-medium transition-all duration-200"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Indicator */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-8 text-sm text-stone-400"
            >
              No credit card required. Start in minutes.
            </motion.p>
          </div>

          {/* Right: Visual / Abstract Composition */}
          <div className="lg:col-span-6 xl:col-span-7 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Main visualization container */}
              <div className="relative aspect-square max-w-lg mx-auto lg:max-w-none">
                {/* Large purple circle */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(144, 85, 224, 0.15) 0%, rgba(144, 85, 224, 0.05) 50%, transparent 70%)',
                  }}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Orbiting shapes */}
                <motion.div
                  className="absolute top-[15%] right-[10%] w-16 h-16"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <svg viewBox="0 0 64 64" className="w-full h-full">
                    <circle cx="32" cy="32" r="28" fill="#9055E0" fillOpacity="0.2" />
                    <circle cx="32" cy="32" r="20" fill="#9055E0" fillOpacity="0.3" />
                    <circle cx="32" cy="32" r="12" fill="#9055E0" />
                  </svg>
                </motion.div>

                <motion.div
                  className="absolute bottom-[20%] left-[5%] w-14 h-14"
                  animate={{
                    y: [0, 8, 0],
                    rotate: [45, 55, 45],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                >
                  <svg viewBox="0 0 56 56" className="w-full h-full">
                    <rect x="8" y="8" width="40" height="40" rx="6" fill="#F59E0B" fillOpacity="0.3" transform="rotate(45 28 28)" />
                    <rect x="14" y="14" width="28" height="28" rx="4" fill="#F59E0B" transform="rotate(45 28 28)" />
                  </svg>
                </motion.div>

                <motion.div
                  className="absolute top-[40%] right-[5%] w-12 h-12"
                  animate={{
                    y: [0, -6, 0],
                    x: [0, 4, 0],
                  }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                >
                  <svg viewBox="0 0 48 48" className="w-full h-full">
                    <polygon points="24,4 44,40 4,40" fill="#10B981" fillOpacity="0.3" />
                    <polygon points="24,12 38,36 10,36" fill="#10B981" />
                  </svg>
                </motion.div>

                <motion.div
                  className="absolute bottom-[10%] right-[25%] w-10 h-10"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                  }}
                >
                  <svg viewBox="0 0 40 40" className="w-full h-full">
                    <polygon points="20,2 38,20 20,38 2,20" fill="#EC4899" fillOpacity="0.3" />
                    <polygon points="20,8 32,20 20,32 8,20" fill="#EC4899" />
                  </svg>
                </motion.div>

                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                  <defs>
                    <linearGradient id="heroLine1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9055E0" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="heroLine2" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#9055E0" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M 320 80 Q 200 150 100 300"
                    stroke="url(#heroLine1)"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                  />
                  <motion.path
                    d="M 80 120 Q 200 200 350 320"
                    stroke="url(#heroLine2)"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.8 }}
                  />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}

export default HeroSectionPremium;
