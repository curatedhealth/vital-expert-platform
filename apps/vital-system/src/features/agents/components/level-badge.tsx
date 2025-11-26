/**
 * LevelBadge Component
 * Displays agent level with color-coded badge
 *
 * Based on shadcn/ui Badge component
 * @see /apps/vital-system/src/components/ui/badge.tsx
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { AgentLevel } from '../constants/design-tokens';
import { getAgentLevelColor } from '../constants/design-tokens';

// ============================================================================
// LEVEL BADGE VARIANTS
// ============================================================================

const levelBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border font-semibold transition-all duration-200',
  {
    variants: {
      level: {
        1: 'border-purple-600/20 bg-purple-600 text-white shadow-sm hover:shadow-md hover:scale-105',
        2: 'border-blue-600/20 bg-blue-600 text-white shadow-sm hover:shadow-md hover:scale-105',
        3: 'border-green-600/20 bg-green-600 text-white shadow-sm hover:shadow-md hover:scale-105',
        4: 'border-orange-600/20 bg-orange-600 text-black shadow-sm hover:shadow-md hover:scale-105',
        5: 'border-gray-600/20 bg-gray-600 text-white shadow-sm hover:shadow-md hover:scale-105',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
        xl: 'px-4 py-2 text-base',
      },
      variant: {
        solid: '',
        outline: 'bg-transparent border-2',
        ghost: 'bg-transparent border-transparent hover:bg-opacity-10',
      },
    },
    compoundVariants: [
      // Outline variants with level-specific colors
      {
        level: 1,
        variant: 'outline',
        className: 'text-purple-600 border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950',
      },
      {
        level: 2,
        variant: 'outline',
        className: 'text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950',
      },
      {
        level: 3,
        variant: 'outline',
        className: 'text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950',
      },
      {
        level: 4,
        variant: 'outline',
        className: 'text-orange-600 border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950',
      },
      {
        level: 5,
        variant: 'outline',
        className: 'text-gray-600 border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950',
      },
      // Ghost variants
      {
        level: 1,
        variant: 'ghost',
        className: 'text-purple-600 hover:bg-purple-600',
      },
      {
        level: 2,
        variant: 'ghost',
        className: 'text-blue-600 hover:bg-blue-600',
      },
      {
        level: 3,
        variant: 'ghost',
        className: 'text-green-600 hover:bg-green-600',
      },
      {
        level: 4,
        variant: 'ghost',
        className: 'text-orange-600 hover:bg-orange-600',
      },
      {
        level: 5,
        variant: 'ghost',
        className: 'text-gray-600 hover:bg-gray-600',
      },
    ],
    defaultVariants: {
      level: 1,
      size: 'md',
      variant: 'solid',
    },
  }
);

// ============================================================================
// LEVEL BADGE PROPS
// ============================================================================

export interface LevelBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof levelBadgeVariants> {
  level: AgentLevel;
  showLabel?: boolean;
  showIcon?: boolean;
  icon?: React.ReactNode;
  interactive?: boolean;
}

// ============================================================================
// LEVEL BADGE COMPONENT
// ============================================================================

/**
 * LevelBadge - Displays agent level with color-coded badge
 *
 * @example
 * // Basic usage
 * <LevelBadge level={1} />
 *
 * // With label
 * <LevelBadge level={2} showLabel />
 *
 * // Outline variant
 * <LevelBadge level={3} variant="outline" />
 *
 * // Large size
 * <LevelBadge level={4} size="lg" />
 *
 * // Interactive (clickable)
 * <LevelBadge level={5} interactive onClick={() => console.log('Clicked')} />
 */
export const LevelBadge = React.forwardRef<HTMLDivElement, LevelBadgeProps>(
  (
    {
      level,
      size,
      variant,
      showLabel = false,
      showIcon = false,
      icon,
      interactive = false,
      className,
      ...props
    },
    ref
  ) => {
    const levelConfig = getAgentLevelColor(level);

    return (
      <div
        ref={ref}
        className={cn(
          levelBadgeVariants({ level, size, variant }),
          interactive && 'cursor-pointer hover:scale-110',
          className
        )}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {/* Level number */}
        <span className="font-bold">L{level}</span>

        {/* Optional icon */}
        {showIcon && icon && <span className="inline-flex">{icon}</span>}

        {/* Optional label */}
        {showLabel && (
          <span className="hidden sm:inline-block">{levelConfig.name}</span>
        )}
      </div>
    );
  }
);

LevelBadge.displayName = 'LevelBadge';

// ============================================================================
// LEVEL INDICATOR (minimal version for tight spaces)
// ============================================================================

export interface LevelIndicatorProps {
  level: AgentLevel;
  size?: number;
  className?: string;
}

/**
 * LevelIndicator - Minimal colored dot indicator for agent level
 * Use in tight spaces where full badge doesn't fit
 *
 * @example
 * <LevelIndicator level={1} size={8} />
 */
export const LevelIndicator: React.FC<LevelIndicatorProps> = ({
  level,
  size = 8,
  className,
}) => {
  const levelConfig = getAgentLevelColor(level);

  return (
    <span
      className={cn('inline-block rounded-full', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: levelConfig.base,
      }}
      title={`Level ${level}: ${levelConfig.name}`}
      aria-label={`Level ${level}: ${levelConfig.name}`}
    />
  );
};

LevelIndicator.displayName = 'LevelIndicator';

// ============================================================================
// EXPORTS
// ============================================================================

export { levelBadgeVariants };
