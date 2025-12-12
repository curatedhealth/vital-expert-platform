/**
 * Level Tab Component
 * Extracted from agent-edit-form-enhanced.tsx
 *
 * Handles agent level selection and responsibilities:
 * - Visual 5-level grid selector (L1-L5)
 * - Level descriptions explaining each tier
 * - Responsibilities multi-select
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, List } from 'lucide-react';
import type { AgentLevelNumber } from '../../types/agent.types';
import { AGENT_LEVEL_COLORS } from '../../constants/design-tokens';
import type { EditFormTabProps, DropdownOption } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface LevelTabProps extends EditFormTabProps {
  /** Current selected level (1-5) */
  currentLevel: AgentLevelNumber;
  /** Callback when level changes */
  onLevelChange: (level: AgentLevelNumber) => void;
  /** Available responsibilities for selection */
  responsibilities: DropdownOption[];
  /** Whether dropdown data is loading */
  loadingDropdowns?: boolean;
  /** Multi-select dropdown component (passed from parent) */
  MultiSelectDropdown: React.ComponentType<{
    options: DropdownOption[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    loading?: boolean;
    emptyMessage?: string;
  }>;
}

// ============================================================================
// LEVEL DESCRIPTIONS
// ============================================================================

const LEVEL_DESCRIPTIONS: Record<AgentLevelNumber, { short: string; long: string }> = {
  1: {
    short: 'Full autonomy',
    long: 'Top-level orchestrators that coordinate entire workflows and manage other agents. Full decision-making authority.',
  },
  2: {
    short: 'High autonomy',
    long: 'Expert advisors with high autonomy. Can manage L3-L5 agents and make domain-specific decisions.',
  },
  3: {
    short: 'Specialist',
    long: 'Specialized agents focused on specific domains. Execute complex tasks within their expertise.',
  },
  4: {
    short: 'Task executor',
    long: 'Task-focused agents that execute specific operations. Reliable, repeatable task execution.',
  },
  5: {
    short: 'API/Tool',
    long: 'Pure tools and APIs. Deterministic, fast execution. May use LLM for parameter extraction.',
  },
};

// ============================================================================
// LEVEL TAB COMPONENT
// ============================================================================

export function LevelTab({
  formState,
  updateField,
  currentLevel,
  onLevelChange,
  responsibilities,
  loadingDropdowns = false,
  MultiSelectDropdown,
}: LevelTabProps) {
  const levelConfig = AGENT_LEVEL_COLORS[currentLevel];

  return (
    <div className="space-y-4">
      {/* Agent Level Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Agent Level
          </CardTitle>
          <CardDescription>
            Select the agent's position in the hierarchy (L1 = Orchestrator, L5 = Tool)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {([1, 2, 3, 4, 5] as AgentLevelNumber[]).map((level) => {
              const config = AGENT_LEVEL_COLORS[level];
              const isSelected = currentLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onLevelChange(level)}
                  className={cn(
                    'p-4 border-2 rounded-lg text-center transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="font-bold text-lg">L{level}</div>
                  <div className="text-sm font-medium">{config.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {LEVEL_DESCRIPTIONS[level].short}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Level Description */}
      <Card>
        <CardContent className="pt-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold">
                  Level {currentLevel}: {levelConfig?.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {LEVEL_DESCRIPTIONS[currentLevel].long}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <List className="h-4 w-4" />
            Responsibilities
          </CardTitle>
          <CardDescription>
            Define what this agent is accountable for at Level {currentLevel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-full overflow-hidden">
            <MultiSelectDropdown
              options={responsibilities}
              selected={formState.responsibilities}
              onChange={(selected) => updateField('responsibilities', selected)}
              placeholder="Search responsibilities..."
              loading={loadingDropdowns}
              emptyMessage="No responsibilities found in database"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
