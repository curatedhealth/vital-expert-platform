/**
 * JTBDListItem - Jobs-to-Be-Done List Item Component
 *
 * Displays a single JTBD in horizontal list format
 */
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
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
      className={`cursor-pointer hover:bg-neutral-50 dark:hover:bg-gray-800/50 ${className}`}
      onClick={() => onClick?.(jtbd)}
    >
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {jtbd.code && (
                  <span className="text-xs font-mono text-neutral-500">{jtbd.code}</span>
                )}
                {jtbd.category && (
                  <Badge variant="outline" className="text-xs">
                    {jtbd.category}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold line-clamp-1">{jtbd.job_statement}</h3>
              {jtbd.description && (
                <p className="text-sm text-neutral-500 line-clamp-1">
                  {jtbd.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {jtbd.opportunity_score && (
              <div className="text-xs text-right">
                <span className="text-neutral-500">ODI</span>
                <div className="font-bold text-blue-600">{jtbd.opportunity_score}</div>
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
