'use client';

import { cn } from '@/lib/utils';
import { AtomicIcon, type AtomicShape } from './atomic-icons';
import { VITAL_COLORS } from '@/lib/brand/brand-tokens';

/**
 * Tier Badge Component
 *
 * Visual representation of agent tier levels:
 * - Tier 1 (Foundational): Circle, Purple
 * - Tier 2 (Specialist): Square, Amber
 * - Tier 3 (Ultra-Specialist): Triangle, Emerald
 */

export type TierLevel = 1 | 2 | 3;
export type TierBadgeVariant = 'default' | 'compact' | 'icon-only' | 'pill';

interface TierBadgeProps {
  tier: TierLevel;
  variant?: TierBadgeVariant;
  showLabel?: boolean;
  className?: string;
}

interface TierConfig {
  shape: AtomicShape;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const TIER_CONFIG: Record<TierLevel, TierConfig> = {
  1: {
    shape: 'circle',
    label: 'Foundational',
    shortLabel: 'T1',
    color: VITAL_COLORS.tier[1].primary,
    bgColor: VITAL_COLORS.tier[1].bg,
    borderColor: VITAL_COLORS.tier[1].border,
    textColor: VITAL_COLORS.tier[1].primary,
  },
  2: {
    shape: 'square',
    label: 'Specialist',
    shortLabel: 'T2',
    color: VITAL_COLORS.tier[2].primary,
    bgColor: VITAL_COLORS.tier[2].bg,
    borderColor: VITAL_COLORS.tier[2].border,
    textColor: VITAL_COLORS.tier[2].primary,
  },
  3: {
    shape: 'triangle',
    label: 'Ultra-Specialist',
    shortLabel: 'T3',
    color: VITAL_COLORS.tier[3].primary,
    bgColor: VITAL_COLORS.tier[3].bg,
    borderColor: VITAL_COLORS.tier[3].border,
    textColor: VITAL_COLORS.tier[3].primary,
  },
};

export function TierBadge({
  tier,
  variant = 'default',
  showLabel = true,
  className,
}: TierBadgeProps) {
  const config = TIER_CONFIG[tier];

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <span className={cn('inline-flex', className)}>
        <AtomicIcon shape={config.shape} size="sm" color={config.color} />
      </span>
    );
  }

  // Determine size classes based on variant
  const sizeClasses = {
    default: 'px-2.5 py-1 text-xs',
    compact: 'px-1.5 py-0.5 text-[10px]',
    pill: 'px-3 py-1.5 text-xs',
  };

  const label = variant === 'compact' ? config.shortLabel : config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors',
        sizeClasses[variant],
        className
      )}
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
        color: config.textColor,
      }}
    >
      <AtomicIcon
        shape={config.shape}
        size={variant === 'compact' ? 'xs' : 'sm'}
        color={config.color}
      />
      {showLabel && <span>{label}</span>}
    </span>
  );
}

// Preset exports for convenience
export function FoundationalBadge(props: Omit<TierBadgeProps, 'tier'>) {
  return <TierBadge tier={1} {...props} />;
}

export function SpecialistBadge(props: Omit<TierBadgeProps, 'tier'>) {
  return <TierBadge tier={2} {...props} />;
}

export function UltraSpecialistBadge(props: Omit<TierBadgeProps, 'tier'>) {
  return <TierBadge tier={3} {...props} />;
}

// Helper to get tier from string
export function getTierFromLevel(level: number | string): TierLevel {
  const numLevel = typeof level === 'string' ? parseInt(level, 10) : level;
  if (numLevel >= 3) return 3;
  if (numLevel >= 2) return 2;
  return 1;
}

// Helper to get tier config
export function getTierConfig(tier: TierLevel): TierConfig {
  return TIER_CONFIG[tier];
}

export default TierBadge;
