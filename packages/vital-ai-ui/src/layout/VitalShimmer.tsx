'use client';

/**
 * VitalShimmer - Animated Text Shimmer Effect
 * 
 * Provides an animated shimmer effect that sweeps across text, perfect for 
 * indicating loading states, progressive reveals, or drawing attention to 
 * dynamic content in AI applications.
 * 
 * Features:
 * - Smooth animated shimmer effect using CSS gradients and Framer Motion
 * - Customizable animation duration and spread
 * - Polymorphic component - render as any HTML element via the `as` prop
 * - Automatic spread calculation based on text length
 * - Theme-aware styling using CSS custom properties
 * - Infinite looping animation with linear easing
 * - TypeScript support with proper type definitions
 * - Memoized for optimal performance
 * - Responsive and accessible design
 * - Uses `text-transparent` with background-clip for crisp text rendering
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <VitalShimmer>Thinking...</VitalShimmer>
 * 
 * // Custom duration
 * <VitalShimmer duration={3}>Processing your request</VitalShimmer>
 * 
 * // As different element
 * <VitalShimmer as="span" duration={1.5}>Loading</VitalShimmer>
 * 
 * // Custom spread
 * <VitalShimmer spread={3}>AI is analyzing...</VitalShimmer>
 * ```
 */

import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import {
  type CSSProperties,
  type ElementType,
  type JSX,
  memo,
  useMemo,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export type VitalShimmerProps = {
  /** The text content to apply the shimmer effect to */
  children: string;
  /** The HTML element or React component to render */
  as?: ElementType;
  /** Additional CSS classes to apply to the component */
  className?: string;
  /** The duration of the shimmer animation in seconds */
  duration?: number;
  /** The spread multiplier for the shimmer gradient, multiplied by text length */
  spread?: number;
};

// Also export as TextShimmerProps for compatibility
export type TextShimmerProps = VitalShimmerProps;

// ============================================================================
// Component
// ============================================================================

const ShimmerComponent = ({
  children,
  as: Component = 'p',
  className,
  duration = 2,
  spread = 2,
}: VitalShimmerProps) => {
  // Create motion-enhanced version of the component
  const MotionComponent = motion.create(
    Component as keyof JSX.IntrinsicElements
  );

  // Calculate dynamic spread based on text length
  const dynamicSpread = useMemo(
    () => (children?.length ?? 0) * spread,
    [children, spread]
  );

  return (
    <MotionComponent
      animate={{ backgroundPosition: '0% center' }}
      className={cn(
        'relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent',
        '[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]',
        className
      )}
      initial={{ backgroundPosition: '100% center' }}
      style={
        {
          '--spread': `${dynamicSpread}px`,
          backgroundImage:
            'var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))',
        } as CSSProperties
      }
      transition={{
        repeat: Number.POSITIVE_INFINITY,
        duration,
        ease: 'linear',
      }}
    >
      {children}
    </MotionComponent>
  );
};

export const VitalShimmer = memo(ShimmerComponent);

VitalShimmer.displayName = 'VitalShimmer';

// ============================================================================
// Aliases (ai-elements compatibility)
// ============================================================================

/** @alias VitalShimmer */
export const Shimmer = VitalShimmer;

/** @alias VitalShimmer */
export const TextShimmer = VitalShimmer;

export default VitalShimmer;
