/**
 * VitalAgentStatus - Agent Status Badge Component
 * 
 * Displays the agent's operational status (active, testing, development, etc.)
 * and availability status (available, busy, offline).
 * 
 * @packageDocumentation
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { getStatusColor, getAvailabilityColor, STATUS_COLORS, AVAILABILITY_COLORS } from './constants';
import type { AgentStatus, AgentAvailability } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface VitalAgentStatusBadgeProps {
  /** Agent status */
  status: AgentStatus | 'inactive';
  
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Show animated pulse dot */
  showDot?: boolean;
  
  /** Show glow effect */
  showGlow?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

export interface VitalAgentAvailabilityDotProps {
  /** Availability status */
  availability: AgentAvailability;
  
  /** Dot size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Show label */
  showLabel?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const SIZE_CONFIG = {
  sm: {
    badge: 'px-1.5 py-0.5 text-[10px]',
    dot: 'w-1.5 h-1.5',
    gap: 'gap-1',
  },
  md: {
    badge: 'px-2 py-0.5 text-xs',
    dot: 'w-2 h-2',
    gap: 'gap-1.5',
  },
  lg: {
    badge: 'px-2.5 py-1 text-sm',
    dot: 'w-2.5 h-2.5',
    gap: 'gap-2',
  },
} as const;

const AVAILABILITY_DOT_SIZES = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
} as const;

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

/**
 * Displays the agent's operational status with appropriate styling.
 * 
 * @example
 * ```tsx
 * <VitalAgentStatusBadge status="active" />
 * <VitalAgentStatusBadge status="testing" size="lg" showGlow />
 * ```
 */
export function VitalAgentStatusBadge({
  status,
  size = 'md',
  showDot = true,
  showGlow = false,
  className,
}: VitalAgentStatusBadgeProps) {
  const statusConfig = getStatusColor(status);
  const sizeConfig = SIZE_CONFIG[size];
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        'border backdrop-blur-sm transition-all duration-200',
        sizeConfig.badge,
        sizeConfig.gap,
        statusConfig.bg,
        statusConfig.text,
        statusConfig.border,
        showGlow && statusConfig.glow,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full',
            sizeConfig.dot,
            statusConfig.dot,
            status === 'active' && 'animate-pulse'
          )}
          aria-hidden="true"
        />
      )}
      <span>{statusConfig.label}</span>
    </span>
  );
}

// ============================================================================
// AVAILABILITY DOT COMPONENT
// ============================================================================

/**
 * Minimal availability indicator dot with optional label.
 * 
 * @example
 * ```tsx
 * <VitalAgentAvailabilityDot availability="available" />
 * <VitalAgentAvailabilityDot availability="busy" showLabel />
 * ```
 */
export function VitalAgentAvailabilityDot({
  availability,
  size = 'md',
  showLabel = false,
  className,
}: VitalAgentAvailabilityDotProps) {
  const availabilityConfig = getAvailabilityColor(availability);
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        className
      )}
      title={availabilityConfig.label}
    >
      <span
        className={cn(
          'rounded-full',
          AVAILABILITY_DOT_SIZES[size],
          availabilityConfig.dot
        )}
        aria-label={availabilityConfig.label}
      />
      {showLabel && (
        <span className={cn('text-xs', availabilityConfig.text)}>
          {availabilityConfig.label}
        </span>
      )}
    </span>
  );
}

// ============================================================================
// COMBINED STATUS COMPONENT
// ============================================================================

export interface VitalAgentStatusProps {
  /** Agent operational status */
  status?: AgentStatus | 'inactive';
  
  /** Agent availability status */
  availability?: AgentAvailability;
  
  /** Display variant */
  variant?: 'badge' | 'dot' | 'full';
  
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Unified status component that can display operational status, 
 * availability, or both depending on the variant.
 * 
 * @example
 * ```tsx
 * // Just operational status
 * <VitalAgentStatus status="active" />
 * 
 * // Just availability
 * <VitalAgentStatus availability="busy" variant="dot" />
 * 
 * // Both statuses
 * <VitalAgentStatus status="active" availability="available" variant="full" />
 * ```
 */
export function VitalAgentStatus({
  status,
  availability,
  variant = 'badge',
  size = 'md',
  className,
}: VitalAgentStatusProps) {
  if (variant === 'dot' && availability) {
    return (
      <VitalAgentAvailabilityDot
        availability={availability}
        size={size}
        className={className}
      />
    );
  }
  
  if (variant === 'badge' && status) {
    return (
      <VitalAgentStatusBadge
        status={status}
        size={size}
        className={className}
      />
    );
  }
  
  // Full variant - show both
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {status && (
        <VitalAgentStatusBadge
          status={status}
          size={size}
          showDot={false}
        />
      )}
      {availability && (
        <VitalAgentAvailabilityDot
          availability={availability}
          size={size}
          showLabel
        />
      )}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default VitalAgentStatus;
