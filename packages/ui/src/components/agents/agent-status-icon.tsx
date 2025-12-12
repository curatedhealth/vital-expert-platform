'use client';

/**
 * AgentStatusIcon - Consistent status icons for agents
 *
 * Used across Agents view and Agent Builder for unified status display.
 */

import React from 'react';
import {
  CheckCircle,
  PauseCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type AgentStatusType =
  | 'active'
  | 'inactive'
  | 'draft'
  | 'error'
  | 'warning'
  | 'loading';

export interface AgentStatusIconProps {
  status: AgentStatusType | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const statusConfig: Record<
  AgentStatusType,
  { icon: React.ElementType; color: string; label: string }
> = {
  active: {
    icon: CheckCircle,
    color: 'text-green-500',
    label: 'Active',
  },
  inactive: {
    icon: PauseCircle,
    color: 'text-stone-400',
    label: 'Inactive',
  },
  draft: {
    icon: Clock,
    color: 'text-yellow-500',
    label: 'Draft',
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    label: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    label: 'Warning',
  },
  loading: {
    icon: Loader2,
    color: 'text-blue-500 animate-spin',
    label: 'Loading',
  },
};

/**
 * AgentStatusIcon - Renders status icon with optional label
 *
 * @example
 * <AgentStatusIcon status="active" size="md" showLabel />
 */
export const AgentStatusIcon: React.FC<AgentStatusIconProps> = ({
  status,
  size = 'md',
  className,
  showLabel = false,
}) => {
  const config = statusConfig[status as AgentStatusType] || statusConfig.error;
  const Icon = config.icon;

  if (showLabel) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <Icon className={cn(sizeClasses[size], config.color)} />
        <span className="text-xs text-stone-600 capitalize">{config.label}</span>
      </div>
    );
  }

  return <Icon className={cn(sizeClasses[size], config.color, className)} />;
};

AgentStatusIcon.displayName = 'AgentStatusIcon';

/**
 * Get status color for badges
 */
export const getStatusBadgeVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    case 'error':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default AgentStatusIcon;
