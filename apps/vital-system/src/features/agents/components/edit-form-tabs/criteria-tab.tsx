/**
 * Criteria Tab Component
 * Extracted from agent-edit-form-enhanced.tsx
 *
 * Handles success criteria configuration:
 * - Auto-generated criteria based on agent level
 * - Target percentage configuration
 * - Level-specific guidance
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import type { AgentLevelNumber } from '../../types/agent.types';
import type { EditFormTabProps } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface CriteriaTabProps extends EditFormTabProps {
  /** Current agent level (1-5) */
  currentLevel: AgentLevelNumber;
}

// ============================================================================
// LEVEL-SPECIFIC CRITERIA DESCRIPTIONS
// ============================================================================

const LEVEL_CRITERIA_INFO: Record<
  AgentLevelNumber,
  {
    description: string;
    defaultTargets: {
      accuracy: number;
      responseTime: string;
      satisfaction: number;
    };
  }
> = {
  1: {
    description:
      'L1 Master agents require highest accuracy for orchestration decisions. Focus on coordination quality and delegation effectiveness.',
    defaultTargets: {
      accuracy: 98,
      responseTime: '< 500ms for routing',
      satisfaction: 95,
    },
  },
  2: {
    description:
      'L2 Expert agents need high domain accuracy. Focus on expert-level response quality and knowledge application.',
    defaultTargets: {
      accuracy: 95,
      responseTime: '< 3s for responses',
      satisfaction: 90,
    },
  },
  3: {
    description:
      'L3 Specialist agents focus on task-specific accuracy. Measure precision in specialized domain tasks.',
    defaultTargets: {
      accuracy: 92,
      responseTime: '< 5s for analysis',
      satisfaction: 88,
    },
  },
  4: {
    description:
      'L4 Worker agents prioritize reliable task execution. Focus on consistency and throughput.',
    defaultTargets: {
      accuracy: 90,
      responseTime: '< 10s for tasks',
      satisfaction: 85,
    },
  },
  5: {
    description:
      'L5 Tool agents require deterministic execution. Focus on API reliability and speed.',
    defaultTargets: {
      accuracy: 99,
      responseTime: '< 1s for operations',
      satisfaction: 95,
    },
  },
};

// ============================================================================
// CRITERIA TAB COMPONENT
// ============================================================================

export function CriteriaTab({ currentLevel }: CriteriaTabProps) {
  const levelInfo = LEVEL_CRITERIA_INFO[currentLevel];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Success Criteria Targets</CardTitle>
          <CardDescription>
            Adjust target percentages for success metrics (auto-populated based on agent level)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Success criteria will be auto-generated when the agent is saved based on the selected
            level. You can customize targets after creation.
          </p>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Current Level: <strong>L{currentLevel}</strong> - Default success criteria will be
              applied
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Level-Specific Guidance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Level {currentLevel} Criteria Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{levelInfo.description}</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Accuracy Target</p>
              <p className="text-2xl font-bold text-primary">{levelInfo.defaultTargets.accuracy}%</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Response Time</p>
              <p className="text-lg font-semibold">{levelInfo.defaultTargets.responseTime}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Satisfaction</p>
              <p className="text-2xl font-bold text-green-600">
                {levelInfo.defaultTargets.satisfaction}%
              </p>
            </div>
          </div>

          <div className="p-3 border border-dashed rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> These are default targets based on agent level best practices.
              After creating the agent, you can configure custom success criteria with specific KPIs,
              thresholds, and measurement periods.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
