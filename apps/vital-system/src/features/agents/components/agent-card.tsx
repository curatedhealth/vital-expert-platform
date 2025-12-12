/**
 * AgentCard Component
 * Displays agent information in a card format with multiple size variants
 *
 * Based on shadcn/ui Card component
 * @see /apps/vital-system/src/components/ui/card.tsx
 *
 * This is the PRIMARY AgentCard for the Agent views (agent library, agent grid).
 * Features: Size variants (compact/comfortable/detailed), level badges, metadata display.
 *
 * Note: @vital/ui has simpler card variants for other use cases:
 * - AgentCardMinimal: Inline compact display
 * - AgentCardCompact: Simple grid cards
 * - AgentCardDetailed: Full details
 * - EnhancedAgentCard: Premium design with animations
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LevelBadge } from './level-badge';
import type { Agent, AgentLevelNumber } from '../types/agent.types';
import { CARD_SIZES, getAgentLevelColor, canLevelSpawn } from '../constants/design-tokens';
import { Building2, Briefcase, Zap, CheckCircle2, Copy, Bookmark, MessageSquarePlus } from 'lucide-react';

// ============================================================================
// AGENT CARD VARIANTS
// ============================================================================

const agentCardVariants = cva(
  'group relative cursor-pointer transition-all duration-200 overflow-hidden',
  {
    variants: {
      size: {
        compact: 'h-[240px]',
        comfortable: 'h-[320px]',
        detailed: 'h-[400px]',
      },
      interactive: {
        true: 'hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]',
        false: '',
      },
    },
    defaultVariants: {
      size: 'comfortable',
      interactive: true,
    },
  }
);

// ============================================================================
// AGENT CARD PROPS
// ============================================================================

export interface AgentCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'size' | 'onSelect'>,
    VariantProps<typeof agentCardVariants> {
  agent: Agent;
  onSelect?: (agent: Agent) => void;
  onDuplicate?: (agent: Agent, e: React.MouseEvent) => void;
  onBookmark?: (agent: Agent, e: React.MouseEvent) => void;
  onAddToChat?: (agent: Agent, e: React.MouseEvent) => void;
  showMetadata?: boolean;
  showSpawning?: boolean;
  featured?: boolean;
}

// ============================================================================
// AGENT CARD COMPONENT
// ============================================================================

/**
 * AgentCard - Displays agent information in a card format
 *
 * @example
 * // Basic usage
 * <AgentCard agent={agent} />
 *
 * // Compact size
 * <AgentCard agent={agent} size="compact" />
 *
 * // With click handler
 * <AgentCard agent={agent} onSelect={(agent) => console.log(agent)} />
 *
 * // Non-interactive (no hover effects)
 * <AgentCard agent={agent} interactive={false} />
 */
export const AgentCard = React.forwardRef<HTMLDivElement, AgentCardProps>(
  (
    {
      agent,
      size = 'comfortable',
      interactive = true,
      onSelect,
      onDuplicate,
      onBookmark,
      onAddToChat,
      showMetadata = true,
      showSpawning = true,
      featured = false,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    // Get card size configuration
    const sizeConfig = CARD_SIZES[size || 'comfortable'];

    // Get agent level for color theming
    const agentLevel = agent.agent_levels?.level_number as AgentLevelNumber;
    const levelConfig = agentLevel ? getAgentLevelColor(agentLevel) : null;

    // Handle card click
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (onSelect) {
        onSelect(agent);
      }
      onClick?.(e);
    };

    // Handle keyboard interaction
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
        e.preventDefault();
        onSelect(agent);
      }
    };

    // Get status color
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      testing: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      development: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100',
      inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      deprecated: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      archived: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100',
    };

    return (
      <article
        ref={ref}
        className={cn(agentCardVariants({ size, interactive }), className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={`${agent.name} - ${agent.agent_levels?.level_name || 'Unknown'} level agent`}
        {...props}
      >
        <Card className="h-full flex flex-row relative overflow-hidden">
          {/* Featured badge (optional) */}
          {featured && (
            <div className="absolute top-2 right-2 z-10">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs font-medium dark:bg-yellow-900 dark:text-yellow-100">
                <Zap className="w-3 h-3" />
                Featured
              </span>
            </div>
          )}

          {/* Left Section - Avatar */}
          <div className="flex-shrink-0 p-4 flex items-center">
            <div
              className="relative rounded-lg overflow-hidden border-2"
              style={{
                width: sizeConfig.avatarSize,
                height: sizeConfig.avatarSize,
                borderColor: levelConfig?.base || 'transparent'
              }}
            >
              {agent.avatar_url ? (
                <Image
                  src={agent.avatar_url}
                  alt={agent.avatar_description || agent.name}
                  fill
                  className="object-cover"
                  sizes={`${sizeConfig.avatarSize}px`}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: levelConfig?.base }}
                >
                  {agent.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Content */}
          <div className="flex-1 flex flex-col min-w-0 py-4 pr-4">
            {/* Header - Name and Level */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                {/* Level Badge */}
                {agentLevel && (
                  <LevelBadge
                    level={agentLevel}
                    size="sm"
                    showLabel={size !== 'compact'}
                    className="mb-1.5"
                  />
                )}

                {/* Agent Name */}
                <h3
                  className={cn(
                    'font-semibold leading-tight line-clamp-1',
                    sizeConfig.titleSize
                  )}
                  title={agent.name}
                >
                  {agent.name}
                </h3>

                {/* Tagline (if available and not compact) */}
                {agent.tagline && size !== 'compact' && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {agent.tagline}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              {agent.status && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0',
                    statusColors[agent.status]
                  )}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </span>
              )}
            </div>

            {/* Description */}
            <p
              className={cn(
                'text-sm text-muted-foreground mb-2 flex-1',
                `line-clamp-${sizeConfig.descriptionLines}`
              )}
              title={agent.description}
            >
              {agent.description}
            </p>

            {/* Footer - Metadata and Actions */}
            <div className="flex items-end justify-between gap-2 mt-auto">
              {/* Metadata */}
              {showMetadata && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-1 min-w-0">
                  {/* Function */}
                  {agent.function_name && (
                    <div className="flex items-center gap-1 min-w-0">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate" title={agent.function_name}>
                        {agent.function_name}
                      </span>
                    </div>
                  )}

                  {/* Department */}
                  {agent.department_name && (
                    <div className="flex items-center gap-1 min-w-0">
                      <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate" title={agent.department_name}>
                        {agent.department_name}
                      </span>
                    </div>
                  )}

                  {/* Spawning Capability (optional) */}
                  {showSpawning && agentLevel && canLevelSpawn(agentLevel, 5) && (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="whitespace-nowrap">Can spawn</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {onDuplicate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(agent, e);
                    }}
                    title="Duplicate agent"
                    aria-label="Duplicate agent"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onBookmark && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookmark(agent, e);
                    }}
                    title="Bookmark agent"
                    aria-label="Bookmark agent"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onAddToChat && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToChat(agent, e);
                    }}
                    title="Add to chat"
                    aria-label="Add agent to chat"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </article>
    );
  }
);

AgentCard.displayName = 'AgentCard';

// ============================================================================
// AGENT CARD SKELETON (Loading State)
// ============================================================================

export const AgentCardSkeleton: React.FC<{
  size?: 'compact' | 'comfortable' | 'detailed';
}> = ({ size = 'comfortable' }) => {
  const sizeConfig = CARD_SIZES[size];

  return (
    <div className={cn('h-full', agentCardVariants({ size, interactive: false }))}>
      <Card className="h-full flex flex-col animate-pulse">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {/* Avatar skeleton */}
            <div
              className="flex-shrink-0 rounded-lg bg-muted"
              style={{
                width: sizeConfig.avatarSize,
                height: sizeConfig.avatarSize
              }}
            />

            {/* Name skeleton */}
            <div className="flex-1 space-y-2">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-5 w-full bg-muted rounded" />
              {size !== 'compact' && (
                <div className="h-3 w-3/4 bg-muted rounded" />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-3 space-y-3">
          {/* Description skeleton */}
          <div className="space-y-2">
            {Array.from({ length: sizeConfig.descriptionLines }).map((_, i) => (
              <div
                key={i}
                className="h-3 bg-muted rounded"
                style={{ width: i === sizeConfig.descriptionLines - 1 ? '60%' : '100%' }}
              />
            ))}
          </div>

          {/* Metadata skeleton */}
          <div className="space-y-1.5">
            <div className="h-3 w-32 bg-muted rounded" />
            <div className="h-3 w-28 bg-muted rounded" />
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="h-6 w-20 bg-muted rounded" />
        </CardFooter>
      </Card>
    </div>
  );
};

AgentCardSkeleton.displayName = 'AgentCardSkeleton';

// ============================================================================
// EXPORTS
// ============================================================================

export { agentCardVariants };
