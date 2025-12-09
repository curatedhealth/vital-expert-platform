/**
 * VitalLevelBadge - Agent Level Badge Component
 * 
 * Displays the agent's hierarchy level (L1-L5) with appropriate
 * styling, icons, and optional labels.
 * 
 * @packageDocumentation
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { 
  getAgentLevelColor, 
  getAgentLevelIcon,
  AGENT_LEVEL_COLORS 
} from './constants';
import type { AgentLevelNumber } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface VitalLevelBadgeProps {
  /** Agent level (1-5) */
  level: AgentLevelNumber;
  
  /** Badge size */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  
  /** Display variant */
  variant?: 'default' | 'outline' | 'solid' | 'gradient';
  
  /** Show level name (e.g., "Expert") */
  showLabel?: boolean;
  
  /** Show level icon */
  showIcon?: boolean;
  
  /** Use abbreviated label (e.g., "L2" vs "L2 Expert") */
  abbreviated?: boolean;
  
  /** Enable hover effects */
  interactive?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Click handler */
  onClick?: () => void;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const SIZE_CONFIG = {
  xs: {
    padding: 'px-1.5 py-0.5',
    gap: 'gap-0.5',
    text: 'text-[10px]',
    icon: 'w-2.5 h-2.5',
  },
  sm: {
    padding: 'px-2 py-0.5',
    gap: 'gap-1',
    text: 'text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    padding: 'px-2.5 py-1',
    gap: 'gap-1.5',
    text: 'text-xs',
    icon: 'w-3.5 h-3.5',
  },
  lg: {
    padding: 'px-3 py-1.5',
    gap: 'gap-2',
    text: 'text-sm',
    icon: 'w-4 h-4',
  },
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * VitalLevelBadge displays the agent's level with consistent styling.
 * 
 * Features:
 * - Level-specific colors and gradients
 * - Multiple size and variant options
 * - Optional icon and label display
 * - Hover effects for interactive contexts
 * 
 * @example
 * ```tsx
 * // Simple badge
 * <VitalLevelBadge level={2} />
 * 
 * // With label
 * <VitalLevelBadge level={2} showLabel showIcon />
 * 
 * // Large gradient badge
 * <VitalLevelBadge level={1} size="lg" variant="gradient" showLabel showIcon />
 * ```
 */
export function VitalLevelBadge({
  level,
  size = 'md',
  variant = 'default',
  showLabel = false,
  showIcon = true,
  abbreviated = false,
  interactive = false,
  className,
  onClick,
}: VitalLevelBadgeProps) {
  const levelConfig = getAgentLevelColor(level);
  const Icon = getAgentLevelIcon(level);
  const sizeConfig = SIZE_CONFIG[size];
  
  // Compute variant-specific classes
  const variantClasses = React.useMemo(() => {
    switch (variant) {
      case 'outline':
        return cn(
          'bg-transparent border',
          levelConfig.tailwind.borderSolid,
          levelConfig.tailwind.textSoft
        );
      case 'solid':
        return cn(
          'border border-transparent',
          levelConfig.tailwind.bgSoft,
          levelConfig.tailwind.textSoft
        );
      case 'gradient':
        return cn(
          levelConfig.tailwind.bg,
          levelConfig.tailwind.text,
          'border border-transparent'
        );
      default: // 'default' - subtle background with soft border
        return cn(
          levelConfig.tailwind.bgSoft,
          levelConfig.tailwind.textSoft,
          'border',
          levelConfig.tailwind.border
        );
    }
  }, [variant, levelConfig]);
  
  // Generate label text
  const labelText = React.useMemo(() => {
    if (abbreviated) {
      return `L${level}`;
    }
    if (showLabel) {
      return `L${level} ${levelConfig.name}`;
    }
    return `L${level}`;
  }, [level, levelConfig.name, showLabel, abbreviated]);
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg font-semibold',
        'backdrop-blur-sm transition-all duration-200',
        sizeConfig.padding,
        sizeConfig.gap,
        sizeConfig.text,
        variantClasses,
        interactive && 'cursor-pointer hover:scale-105',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      title={`Level ${level} - ${levelConfig.name}: ${levelConfig.description}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {showIcon && <Icon className={sizeConfig.icon} aria-hidden="true" />}
      <span className="font-bold whitespace-nowrap">{labelText}</span>
    </span>
  );
}

// ============================================================================
// LEVEL BADGE GROUP (for displaying all levels)
// ============================================================================

export interface VitalLevelBadgeGroupProps {
  /** Currently selected level */
  selectedLevel?: AgentLevelNumber;
  
  /** Levels to display (defaults to all) */
  levels?: AgentLevelNumber[];
  
  /** Badge size */
  size?: 'xs' | 'sm' | 'md';
  
  /** Called when a level is selected */
  onSelect?: (level: AgentLevelNumber) => void;
  
  /** Show only the badge without labels */
  compact?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays a group of level badges for selection or display
 */
export function VitalLevelBadgeGroup({
  selectedLevel,
  levels = [1, 2, 3, 4, 5],
  size = 'sm',
  onSelect,
  compact = false,
  className,
}: VitalLevelBadgeGroupProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {levels.map((level) => (
        <VitalLevelBadge
          key={level}
          level={level}
          size={size}
          variant={selectedLevel === level ? 'gradient' : 'outline'}
          showIcon={!compact}
          showLabel={!compact}
          interactive={!!onSelect}
          onClick={onSelect ? () => onSelect(level) : undefined}
        />
      ))}
    </div>
  );
}

// ============================================================================
// LEVEL INDICATOR (minimal dot version)
// ============================================================================

export interface VitalLevelIndicatorProps {
  /** Agent level (1-5) */
  level: AgentLevelNumber;
  
  /** Indicator size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Show pulsing animation */
  pulse?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

const INDICATOR_SIZES = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
} as const;

/**
 * Minimal level indicator dot
 */
export function VitalLevelIndicator({
  level,
  size = 'md',
  pulse = false,
  className,
}: VitalLevelIndicatorProps) {
  const levelConfig = getAgentLevelColor(level);
  
  return (
    <span
      className={cn(
        'inline-block rounded-full',
        INDICATOR_SIZES[size],
        pulse && 'animate-pulse',
        className
      )}
      style={{ background: levelConfig.gradient }}
      title={`Level ${level} - ${levelConfig.name}`}
      aria-label={`Level ${level}`}
    />
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default VitalLevelBadge;
