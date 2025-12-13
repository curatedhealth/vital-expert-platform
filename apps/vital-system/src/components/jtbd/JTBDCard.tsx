/**
 * JTBDCard - Jobs-to-Be-Done Card Component
 *
 * Displays a single JTBD in card format with ODI metrics
 */
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, BarChart3, Clock, Shield } from 'lucide-react';
import {
  type JTBD,
  getPriorityColor,
  getStatusColor,
  getComplexityColor,
  getOdiTierColor,
} from './types';

export interface JTBDCardProps {
  jtbd: JTBD;
  compact?: boolean;
  onClick?: (jtbd: JTBD) => void;
  className?: string;
}

export function JTBDCard({ jtbd, compact = false, onClick, className = '' }: JTBDCardProps) {
  return (
    <Card
      className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}
      onClick={() => onClick?.(jtbd)}
    >
      <CardHeader className={compact ? 'pb-3' : ''}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              {jtbd.code && (
                <span className="text-xs font-mono text-neutral-500">{jtbd.code}</span>
              )}
            </div>
            <CardTitle className="text-base line-clamp-2">{jtbd.job_statement}</CardTitle>
          </div>
          {jtbd.odi_tier && (
            <Badge className={`ml-2 ${getOdiTierColor(jtbd.odi_tier)}`}>
              {jtbd.odi_tier}
            </Badge>
          )}
        </div>
        {!compact && jtbd.description && (
          <CardDescription className="line-clamp-2 mt-2">
            {jtbd.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Primary Badges */}
          <div className="flex flex-wrap gap-2">
            {jtbd.priority && (
              <Badge className={getPriorityColor(jtbd.priority)}>
                {jtbd.priority.toUpperCase()}
              </Badge>
            )}

            {jtbd.status && (
              <Badge className={getStatusColor(jtbd.status)}>
                {jtbd.status}
              </Badge>
            )}

            {jtbd.complexity && (
              <Badge className={getComplexityColor(jtbd.complexity)}>
                {jtbd.complexity.replace('_', ' ')}
              </Badge>
            )}
          </div>

          {/* Category & Type */}
          <div className="flex flex-wrap gap-2">
            {jtbd.category && (
              <Badge variant="outline" className="text-xs">
                {jtbd.category}
              </Badge>
            )}
            {jtbd.job_category && jtbd.job_category !== jtbd.category && (
              <Badge variant="outline" className="text-xs bg-blue-50">
                {jtbd.job_category}
              </Badge>
            )}
            {jtbd.recommended_service_layer && (
              <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">
                {jtbd.recommended_service_layer}
              </Badge>
            )}
          </div>

          {/* ODI Scores */}
          {!compact && (jtbd.opportunity_score || jtbd.importance_score) && (
            <div className="space-y-2 pt-2 border-t">
              {jtbd.opportunity_score && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Opportunity
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={Math.min((jtbd.opportunity_score / 20) * 100, 100)} className="w-16 h-1.5" />
                    <span className="font-medium">{jtbd.opportunity_score}</span>
                  </div>
                </div>
              )}
              {jtbd.importance_score && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600 flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Importance
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={(jtbd.importance_score / 10) * 100} className="w-16 h-1.5" />
                    <span className="font-medium">{jtbd.importance_score}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Additional Metadata */}
          {!compact && (
            <div className="text-xs text-neutral-500 space-y-1 pt-2">
              {jtbd.frequency && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{jtbd.frequency}</span>
                </div>
              )}
              {jtbd.compliance_sensitivity && (
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Compliance: {jtbd.compliance_sensitivity}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default JTBDCard;
