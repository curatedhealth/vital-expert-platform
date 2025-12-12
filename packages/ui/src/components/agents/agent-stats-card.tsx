'use client';

/**
 * AgentStatsCard - Reusable stats display for agent counts
 *
 * Used in both Agents view and Agent Builder for consistent stats presentation.
 * Follows Brand Guidelines V6 with stone neutrals.
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface AgentStats {
  total: number;
  active: number;
  inactive: number;
  custom?: number;
}

export interface AgentStatsCardProps {
  stats: AgentStats;
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * AgentStatsCard - Displays agent statistics in a grid
 *
 * @example
 * <AgentStatsCard stats={{ total: 100, active: 80, inactive: 15, custom: 5 }} />
 */
export const AgentStatsCard: React.FC<AgentStatsCardProps> = ({
  stats,
  variant = 'compact',
  className,
}) => {
  const items = [
    { label: 'Total', value: stats.total, color: 'text-stone-800' },
    { label: 'Active', value: stats.active, color: 'text-green-600' },
    { label: 'Inactive', value: stats.inactive, color: 'text-stone-400' },
    ...(stats.custom !== undefined
      ? [{ label: 'Custom', value: stats.custom, color: 'text-purple-600' }]
      : []),
  ];

  if (variant === 'compact') {
    return (
      <div className={cn('grid grid-cols-2 gap-2', className)}>
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-lg p-2 border border-stone-200"
          >
            <div className={cn('text-lg font-bold', item.color)}>
              {item.value}
            </div>
            <div className="text-xs text-stone-500">{item.label}</div>
          </div>
        ))}
      </div>
    );
  }

  // Full variant - horizontal layout
  return (
    <div className={cn('flex items-center gap-6', className)}>
      {items.map((item, idx) => (
        <React.Fragment key={item.label}>
          {idx > 0 && <div className="h-8 w-px bg-stone-200" />}
          <div className="text-center">
            <div className={cn('text-2xl font-bold', item.color)}>
              {item.value}
            </div>
            <div className="text-xs text-stone-500">{item.label}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

AgentStatsCard.displayName = 'AgentStatsCard';

export default AgentStatsCard;
