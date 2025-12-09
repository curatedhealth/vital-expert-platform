'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Star,
  Target,
  Cog,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Agent Level type following 5-Level Agent OS Architecture
 * L1: Master Orchestrator
 * L2: Domain Expert (PRIMARY user selection)
 * L3: Task Specialist
 * L4: Context Worker (shared, stateless)
 * L5: Tool (shared, deterministic)
 */
export type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

interface LevelConfig {
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  isConversational: boolean;
  model: string;
  tokenBudget: string;
  costPerQuery: string;
}

const levelConfigs: Record<AgentLevel, LevelConfig> = {
  L1: {
    icon: Crown,
    label: 'Master',
    description: 'Strategic orchestration and team coordination',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
    isConversational: true,
    model: 'claude-3-5-sonnet',
    tokenBudget: '2,000-2,500',
    costPerQuery: '$0.10-0.50',
  },
  L2: {
    icon: Star,
    label: 'Expert',
    description: 'Primary domain expertise - Start conversations here',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    isConversational: true,
    model: 'claude-3-5-sonnet',
    tokenBudget: '1,500-2,000',
    costPerQuery: '$0.05-0.15',
  },
  L3: {
    icon: Target,
    label: 'Specialist',
    description: 'Focused task execution under L2 Expert direction',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/50',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    isConversational: true,
    model: 'claude-3-5-haiku',
    tokenBudget: '1,000-1,500',
    costPerQuery: '$0.01-0.05',
  },
  L4: {
    icon: Cog,
    label: 'Worker',
    description: 'Shared stateless execution - Not conversational',
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-100 dark:bg-orange-900/50',
    borderColor: 'border-orange-200 dark:border-orange-800',
    iconColor: 'text-orange-600 dark:text-orange-400',
    isConversational: false,
    model: 'claude-3-5-haiku',
    tokenBudget: '300-500',
    costPerQuery: '$0.005-0.01',
  },
  L5: {
    icon: Wrench,
    label: 'Tool',
    description: 'Deterministic utility functions - No LLM',
    color: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-slate-200 dark:border-slate-700',
    iconColor: 'text-slate-600 dark:text-slate-400',
    isConversational: false,
    model: 'N/A (deterministic)',
    tokenBudget: '100-200',
    costPerQuery: '$0.001',
  },
};

interface VitalLevelBadgeProps {
  level: AgentLevel;
  variant?: 'default' | 'compact' | 'detailed' | 'icon-only';
  showTooltip?: boolean;
  showIcon?: boolean;
  className?: string;
}

/**
 * VitalLevelBadge - Displays agent level with appropriate styling
 * 
 * Following 5-Level Agent OS Architecture:
 * - L1 Master: Purple, Crown icon
 * - L2 Expert: Blue, Star icon (PRIMARY)
 * - L3 Specialist: Green, Target icon
 * - L4 Worker: Orange, Cog icon (shared)
 * - L5 Tool: Slate, Wrench icon (shared)
 * 
 * Reference: AGENT_VIEW_PRD_v4.md Section 1.1
 */
export function VitalLevelBadge({
  level,
  variant = 'default',
  showTooltip = true,
  showIcon = true,
  className,
}: VitalLevelBadgeProps) {
  const config = levelConfigs[level];
  const Icon = config.icon;

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        config.bgColor,
        config.borderColor,
        config.color,
        'font-medium transition-colors',
        variant === 'compact' && 'text-xs px-1.5 py-0',
        variant === 'detailed' && 'text-sm px-3 py-1',
        variant === 'icon-only' && 'p-1',
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            config.iconColor,
            variant === 'compact' ? 'h-3 w-3' : 'h-4 w-4',
            variant !== 'icon-only' && 'mr-1'
          )}
        />
      )}
      {variant !== 'icon-only' && (
        <>
          {level}
          {variant === 'detailed' && (
            <span className="ml-1 font-normal opacity-80">
              {config.label}
            </span>
          )}
        </>
      )}
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className={cn('h-4 w-4', config.iconColor)} />
            <span className="font-semibold">
              {level} {config.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{config.description}</p>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t">
            <div>
              <span className="text-muted-foreground">Model:</span>
              <span className="ml-1 font-medium">{config.model}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Cost:</span>
              <span className="ml-1 font-medium">{config.costPerQuery}</span>
            </div>
          </div>
          {!config.isConversational && (
            <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 pt-1 border-t">
              <Cog className="h-3 w-3" />
              <span>Shared utility - not conversational</span>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Helper to get level configuration
 */
export function getLevelConfig(level: AgentLevel): LevelConfig {
  return levelConfigs[level];
}

/**
 * Helper to check if level is conversational
 */
export function isConversationalLevel(level: AgentLevel): boolean {
  return levelConfigs[level].isConversational;
}

/**
 * Helper to get level icon component
 */
export function getLevelIcon(level: AgentLevel): LucideIcon {
  return levelConfigs[level].icon;
}

export default VitalLevelBadge;
