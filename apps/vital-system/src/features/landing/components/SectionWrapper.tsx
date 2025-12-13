'use client';

import { ReactNode, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ANIMATIONS, tw } from '../styles/design-tokens';

/**
 * Section Wrapper Component
 *
 * Provides consistent section styling with scroll-triggered animations
 */

interface SectionWrapperProps {
  children: ReactNode;
  id?: string;
  className?: string;
  background?: 'canvas' | 'surface' | 'white' | 'gradient' | 'none';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  stagger?: boolean;
}

const BACKGROUND_CLASSES = {
  canvas: 'bg-[#FAFAF9]',
  surface: 'bg-[#F5F5F4]',
  white: 'bg-white',
  gradient: 'bg-gradient-to-b from-[#FAFAF9] via-[#FAFAF9] to-white',
  none: '',
};

const PADDING_CLASSES = {
  sm: 'py-16 md:py-20',
  md: 'py-20 md:py-28',
  lg: 'py-24 md:py-32',
  xl: 'py-28 md:py-36 lg:py-44',
};

export function SectionWrapper({
  children,
  id,
  className = '',
  background = 'canvas',
  padding = 'md',
  animate = true,
  stagger = false,
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = stagger
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
        },
      }
    : {
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
        },
      };

  if (!animate) {
    return (
      <section
        id={id}
        className={cn(
          'relative overflow-hidden',
          BACKGROUND_CLASSES[background],
          PADDING_CLASSES[padding],
          className
        )}
      >
        <div className={tw.containerWide}>{children}</div>
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={cn(
        'relative overflow-hidden',
        BACKGROUND_CLASSES[background],
        PADDING_CLASSES[padding],
        className
      )}
    >
      <div className={tw.containerWide}>{children}</div>
    </motion.section>
  );
}

// Child component for staggered animations
export function AnimatedChild({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default SectionWrapper;
