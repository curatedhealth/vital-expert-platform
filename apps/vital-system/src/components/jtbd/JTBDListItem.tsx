/**
 * JTBDListItem - Jobs-to-Be-Done List Item Component - Brand Guidelines v6.0
 *
 * Displays a single JTBD in horizontal list format
 *
 * Design System:
 * - Primary Accent: #9055E0 (Warm Purple) via Tailwind purple-600
 * - Canvas: stone-50, Surface: white with stone-200 border
 * - Text: stone-600/700/800
 * - Transitions: 150ms for interactions
 *
 * @since December 2025
 */
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type JTBD,
  getPriorityColor,
  getStatusColor,
  getOdiTierColor,
} from './types';

export interface JTBDListItemProps {
  jtbd: JTBD;
  onClick?: (jtbd: JTBD) => void;
  className?: string;
}

export function JTBDListItem({ jtbd, onClick, className = '' }: JTBDListItemProps) {
  return (
    <Card
      className={cn(
        'group cursor-pointer',
        'bg-white border border-stone-200 rounded-lg',
        'transition-all duration-150 ease-out',
        'hover:bg-stone-50 hover:border-purple-300',
        'hover:shadow-[0_4px_12px_rgba(144,85,224,0.08)]',
        className
      )}
      onClick={() => onClick?.(jtbd)}
    >
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {jtbd.code && (
                  <span className="text-xs font-mono text-stone-500">{jtbd.code}</span>
                )}
                {jtbd.category && (
                  <Badge variant="outline" className="text-xs border-stone-200 text-stone-600">
                    {jtbd.category}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold line-clamp-1 text-stone-800">{jtbd.job_statement}</h3>
              {jtbd.description && (
                <p className="text-sm text-stone-500 line-clamp-1">
                  {jtbd.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {jtbd.opportunity_score && (
              <div className="text-xs text-right">
                <span className="text-stone-500">ODI</span>
                <div className="font-bold text-purple-600">{jtbd.opportunity_score}</div>
              </div>
            )}

            {jtbd.priority && (
              <Badge className={getPriorityColor(jtbd.priority)}>
                {jtbd.priority}
              </Badge>
            )}

            {jtbd.status && (
              <Badge className={getStatusColor(jtbd.status)}>
                {jtbd.status}
              </Badge>
            )}

            {jtbd.odi_tier && (
              <Badge className={getOdiTierColor(jtbd.odi_tier)}>
                {jtbd.odi_tier}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default JTBDListItem;
