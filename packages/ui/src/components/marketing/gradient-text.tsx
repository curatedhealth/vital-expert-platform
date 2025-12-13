'use client';

import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * GradientText Component
 *
 * Brand-aligned gradient text for emphasis
 * Uses VITAL atomic geometry colors:
 * - Purple (#9055E0) - Insight
 * - Indigo (#6366F1) - Connection
 * - Pink (#EC4899) - Decision
 */

interface GradientTextProps {
  children: ReactNode;
  variant?: 'default' | 'purple' | 'warm' | 'cool';
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p';
}

const gradients = {
  default: 'from-vital-primary-600 via-indigo-500 to-pink-500',
  purple: 'from-vital-primary-600 to-vital-primary-400',
  warm: 'from-amber-500 via-orange-500 to-pink-500',
  cool: 'from-indigo-500 via-purple-500 to-pink-500',
};

export function GradientText({
  children,
  variant = 'default',
  className,
  as: Component = 'span',
}: GradientTextProps) {
  return (
    <Component
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent',
        gradients[variant],
        className
      )}
    >
      {children}
    </Component>
  );
}

export default GradientText;
