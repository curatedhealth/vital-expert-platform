'use client';

/**
 * Reusable Agent Cards
 *
 * Consistent agent card components used across all views:
 * - AgentCardMinimal: Compact inline display
 * - AgentCardCompact: Grid/list card display
 * - AgentCardDetailed: Full details card
 * - AgentCardSelectable: Card with selection state
 *
 * Built with @vital/ui components following Brand Guidelines V6.
 */

import React from 'react';
import {
  Star,
  Sparkles,
  CheckCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import { Badge } from '../badge';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { AgentAvatar as BaseAgentAvatar } from '../agent-avatar';
import { AgentStatusIcon, type AgentStatusType } from './agent-status-icon';
import { ActionButtonGroup, type ActionButtonGroupProps } from './action-buttons';
import { cn } from '../../lib/utils';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Simplified agent data for card components.
 * Import from @vital/ui types for full Agent interface.
 */
export interface AgentCardData {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  avatar?: string;
  avatar_url?: string;
  status?: AgentStatusType | string;
  /** Agent level (1-5) from L1-L5 hierarchy */
  level?: 1 | 2 | 3 | 4 | 5;
  model?: string;
  temperature?: number;
  is_custom?: boolean;
  function_name?: string;
  department_name?: string;
  role_name?: string;
  /** @deprecated Use function_name */
  business_function?: string;
  capabilities?: string[];
  knowledge_domains?: string[];
  metrics?: {
    conversations?: number;
    successRate?: number;
    avgResponseTime?: number;
    rating?: number;
  };
}

// ============================================================================
// LEVEL BADGE
// ============================================================================

const LEVEL_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'L1', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  2: { label: 'L2', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  3: { label: 'L3', color: 'bg-green-100 text-green-700 border-green-200' },
  4: { label: 'L4', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  5: { label: 'L5', color: 'bg-stone-100 text-stone-700 border-stone-200' },
};

export const LevelBadge: React.FC<{ level: number; className?: string }> = ({
  level,
  className,
}) => {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
  return (
    <Badge variant="outline" className={cn('text-xs border', config.color, className)}>
      {config.label}
    </Badge>
  );
};

// ============================================================================
// TIER BADGE (DEPRECATED - Use LevelBadge instead)
// ============================================================================

/**
 * @deprecated Tier system removed. Use LevelBadge with level (1-5) instead.
 * Kept for backwards compatibility during migration.
 */
const TIER_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'L4/L5', color: 'bg-stone-100 text-stone-600' },
  2: { label: 'L2/L3', color: 'bg-blue-100 text-blue-600' },
  3: { label: 'L1', color: 'bg-purple-100 text-purple-600' },
};

/**
 * @deprecated Use LevelBadge instead. Tier system (1-3) replaced by L1-L5.
 */
export const TierBadge: React.FC<{ tier: number; className?: string }> = ({
  tier,
  className,
}) => {
  const config = TIER_CONFIG[tier] || TIER_CONFIG[1];
  return (
    <Badge className={cn('text-xs', config.color, className)}>
      {config.label}
    </Badge>
  );
};

// ============================================================================
// AGENT AVATAR (Wrapper for base AgentAvatar with status indicator)
// ============================================================================

export interface AgentAvatarWithStatusProps {
  agent: AgentCardData;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: 'sm' as const,
  md: 'md' as const,
  lg: 'lg' as const,
};

const STATUS_DOT_SIZES = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
};

export const AgentAvatarWithStatus: React.FC<AgentAvatarWithStatusProps> = ({
  agent,
  size = 'md',
  showStatus = true,
  className,
}) => {
  const statusColor = {
    active: 'bg-green-500',
    inactive: 'bg-stone-400',
    draft: 'bg-amber-500',
    error: 'bg-red-500',
  }[agent.status as string] || 'bg-stone-400';

  return (
    <div className={cn('relative', className)}>
      <BaseAgentAvatar
        avatar={agent.avatar_url || agent.avatar}
        name={agent.display_name || agent.name}
        size={SIZE_MAP[size]}
        level={agent.level}
        businessFunction={agent.business_function || agent.function_name}
      />
      {showStatus && (
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white',
            STATUS_DOT_SIZES[size],
            statusColor
          )}
        />
      )}
    </div>
  );
};

// ============================================================================
// AGENT CARD MINIMAL
// ============================================================================

export interface AgentCardMinimalProps {
  agent: AgentCardData;
  onClick?: () => void;
  isSelected?: boolean;
  showLevel?: boolean;
  className?: string;
}

export const AgentCardMinimal: React.FC<AgentCardMinimalProps> = ({
  agent,
  onClick,
  isSelected,
  showLevel = true,
  className,
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-3 p-2 rounded-lg border w-full text-left transition-colors',
      isSelected
        ? 'border-purple-300 bg-purple-50'
        : 'border-transparent hover:bg-stone-50',
      className
    )}
  >
    <AgentAvatarWithStatus agent={agent} size="sm" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm text-stone-800 truncate">
          {agent.display_name || agent.name}
        </span>
        {showLevel && agent.level && <LevelBadge level={agent.level} />}
      </div>
      {agent.function_name && (
        <span className="text-xs text-stone-500 truncate block">
          {agent.function_name}
        </span>
      )}
    </div>
    {isSelected && <CheckCircle className="h-4 w-4 text-purple-600 shrink-0" />}
  </button>
);

// ============================================================================
// AGENT CARD COMPACT
// ============================================================================

export interface AgentCardCompactProps {
  agent: AgentCardData;
  onClick?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  showActions?: boolean;
  actions?: Omit<ActionButtonGroupProps, 'isActive' | 'isCustom'>;
  className?: string;
}

export const AgentCardCompact: React.FC<AgentCardCompactProps> = ({
  agent,
  onClick,
  onSelect,
  isSelected,
  showActions = false,
  actions,
  className,
}) => (
  <Card
    className={cn(
      'hover:shadow-md transition-all cursor-pointer',
      isSelected && 'ring-2 ring-purple-300 bg-purple-50/50',
      className
    )}
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        {onSelect && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect()}
            onClick={(e) => e.stopPropagation()}
            className="mt-1"
          />
        )}
        <AgentAvatarWithStatus agent={agent} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-stone-800 truncate">
              {agent.display_name || agent.name}
            </h4>
            {agent.level && <LevelBadge level={agent.level} />}
            {agent.is_custom && (
              <Badge variant="outline" className="text-xs">
                Custom
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
            <AgentStatusIcon status={(agent.status as AgentStatusType) || 'active'} size="sm" />
            <span className="capitalize">{agent.status || 'active'}</span>
          </div>
          {agent.description && (
            <p className="text-sm text-stone-500 mt-2 line-clamp-2">
              {agent.description}
            </p>
          )}
        </div>
        {showActions && actions && (
          <ActionButtonGroup
            {...actions}
            isActive={agent.status === 'active'}
            isCustom={agent.is_custom}
            showInMenu
          />
        )}
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// AGENT CARD DETAILED
// ============================================================================

export interface AgentCardDetailedProps {
  agent: AgentCardData;
  onClick?: () => void;
  onChat?: () => void;
  showMetrics?: boolean;
  showCapabilities?: boolean;
  actions?: Omit<ActionButtonGroupProps, 'isActive' | 'isCustom'>;
  className?: string;
}

export const AgentCardDetailed: React.FC<AgentCardDetailedProps> = ({
  agent,
  onClick,
  onChat,
  showMetrics = true,
  showCapabilities = true,
  actions,
  className,
}) => (
  <Card
    className={cn('hover:shadow-md transition-all', className)}
  >
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <AgentAvatarWithStatus agent={agent} size="lg" />
          <div>
            <CardTitle className="text-lg text-stone-800">
              {agent.display_name || agent.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {agent.level && <LevelBadge level={agent.level} />}
              <AgentStatusIcon
                status={(agent.status as AgentStatusType) || 'active'}
                size="sm"
                showLabel
              />
            </CardDescription>
          </div>
        </div>
        {actions && (
          <ActionButtonGroup
            {...actions}
            isActive={agent.status === 'active'}
            isCustom={agent.is_custom}
          />
        )}
      </div>
    </CardHeader>

    <CardContent className="space-y-4">
      {/* Description */}
      {agent.description && (
        <p className="text-sm text-stone-600">{agent.description}</p>
      )}

      {/* Org Info */}
      {(agent.function_name || agent.department_name || agent.role_name) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {agent.function_name && (
            <Badge variant="outline">{agent.function_name}</Badge>
          )}
          {agent.department_name && (
            <Badge variant="outline">{agent.department_name}</Badge>
          )}
          {agent.role_name && (
            <Badge variant="outline">{agent.role_name}</Badge>
          )}
        </div>
      )}

      {/* Capabilities */}
      {showCapabilities && agent.capabilities && agent.capabilities.length > 0 && (
        <div className="space-y-1.5">
          <h5 className="text-xs font-medium text-stone-500 uppercase">Capabilities</h5>
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.slice(0, 5).map((cap, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {cap}
              </Badge>
            ))}
            {agent.capabilities.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{agent.capabilities.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Metrics */}
      {showMetrics && agent.metrics && (
        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
          {agent.metrics.conversations !== undefined && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-stone-700">
                <MessageSquare className="h-3 w-3" />
                <span className="font-medium">{agent.metrics.conversations}</span>
              </div>
              <span className="text-xs text-stone-500">Chats</span>
            </div>
          )}
          {agent.metrics.successRate !== undefined && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-stone-700">
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium">{agent.metrics.successRate}%</span>
              </div>
              <span className="text-xs text-stone-500">Success</span>
            </div>
          )}
          {agent.metrics.rating !== undefined && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500">
                <Star className="h-3 w-3 fill-current" />
                <span className="font-medium text-stone-700">
                  {agent.metrics.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-stone-500">Rating</span>
            </div>
          )}
        </div>
      )}

      {/* Model Info */}
      <div className="flex items-center gap-4 pt-3 border-t text-xs text-stone-400">
        {agent.model && (
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {agent.model}
          </span>
        )}
        {agent.temperature !== undefined && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Temp: {agent.temperature}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {onChat && (
          <Button onClick={onChat} className="flex-1 gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </Button>
        )}
        {onClick && (
          <Button variant="outline" onClick={onClick} className="gap-2">
            View Details
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// AGENT CARD SELECTABLE (for comparison, bulk actions)
// ============================================================================

export interface AgentCardSelectableProps {
  agent: AgentCardData;
  isSelected: boolean;
  onSelect: (agent: AgentCardData) => void;
  disabled?: boolean;
  className?: string;
}

export const AgentCardSelectable: React.FC<AgentCardSelectableProps> = ({
  agent,
  isSelected,
  onSelect,
  disabled,
  className,
}) => (
  <Card
    className={cn(
      'transition-all cursor-pointer',
      isSelected
        ? 'ring-2 ring-purple-400 bg-purple-50'
        : 'hover:border-purple-200 hover:bg-stone-50',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
    onClick={() => !disabled && onSelect(agent)}
  >
    <CardContent className="p-3">
      <div className="flex items-center gap-3">
        <Checkbox checked={isSelected} disabled={disabled} />
        <AgentAvatarWithStatus agent={agent} size="sm" showStatus={false} />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm text-stone-800 truncate block">
            {agent.display_name || agent.name}
          </span>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            {agent.level && <LevelBadge level={agent.level} />}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default AgentCardCompact;
