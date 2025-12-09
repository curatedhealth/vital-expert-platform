/**
 * VitalAgentCardMinimal - Minimal Agent Card Variant
 * 
 * Compact inline card for use in:
 * - Chat sidebars
 * - Dropdown selectors
 * - Inline mentions
 * - Mobile views
 * 
 * Height: 64-80px
 * Shows: Avatar, Name, Level badge, Status dot
 * 
 * @packageDocumentation
 */

'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { VitalAgentAvatar } from '../VitalAgentAvatar';
import { VitalLevelBadge } from '../VitalLevelBadge';
import { VitalAgentAvailabilityDot } from '../VitalAgentStatus';
import { MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import { getAgentLevelNumber } from '../types';
import type { VitalAgentCardMinimalProps, VitalAgent } from '../types';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * VitalAgentCardMinimal is the most compact card variant.
 * 
 * Designed for space-constrained contexts where you need to display
 * many agents in a list or selector format.
 * 
 * Features:
 * - 40px avatar with level indicator
 * - Agent name (truncated)
 * - Level badge (L1-L5 only, no label)
 * - Status/availability dot
 * - Single action on hover (add to chat)
 * - Selection state indicator
 * 
 * @example
 * ```tsx
 * // In a sidebar list
 * <VitalAgentCardMinimal
 *   agent={agent}
 *   onSelect={handleSelect}
 *   isSelected={selectedId === agent.id}
 * />
 * 
 * // With add to chat action
 * <VitalAgentCardMinimal
 *   agent={agent}
 *   onAddToChat={handleAddToChat}
 *   showActions
 * />
 * ```
 */
export const VitalAgentCardMinimal = React.forwardRef<HTMLDivElement, VitalAgentCardMinimalProps>(
  (
    {
      agent,
      isSelected = false,
      isBookmarked = false,
      showActions = true,
      className,
      style,
      animationDelay = 0,
      onSelect,
      onAddToChat,
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    
    // Compute level
    const agentLevel = getAgentLevelNumber(agent);
    
    // Get display name
    const displayName = agent.display_name || agent.name;
    
    // Get secondary text (department or role)
    const secondaryText = agent.department_name || agent.role_name || agent.function_name;
    
    // Handle click
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect?.(agent);
    };
    
    // Handle keyboard
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
        e.preventDefault();
        onSelect(agent);
      }
    };
    
    // Handle add to chat
    const handleAddToChat = (e: React.MouseEvent) => {
      e.stopPropagation();
      onAddToChat?.(agent);
    };
    
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          // Base styles
          'group relative flex items-center gap-3',
          'p-2 sm:p-3 rounded-xl',
          'transition-all duration-200 ease-out',
          'cursor-pointer outline-none',
          
          // Border and background
          'border',
          isSelected
            ? 'border-primary bg-primary/5 dark:bg-primary/10'
            : 'border-transparent hover:border-border hover:bg-muted/50',
          
          // Focus styles
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          
          className
        )}
        style={{
          ...style,
          animationDelay: `${animationDelay}ms`,
        }}
        aria-label={`${displayName} - Level ${agentLevel} agent`}
        aria-selected={isSelected}
      >
        {/* Avatar */}
        <VitalAgentAvatar
          agent={agent}
          sizePreset="sm"
          level={agentLevel}
          showLevelIndicator
          showGlow={false}
          animated={false}
        />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Name */}
            <span 
              className={cn(
                'font-medium text-sm truncate',
                isSelected && 'text-primary'
              )}
              title={displayName}
            >
              {displayName}
            </span>
            
            {/* Level Badge */}
            <VitalLevelBadge
              level={agentLevel}
              size="xs"
              variant="solid"
              showIcon={false}
              showLabel={false}
            />
          </div>
          
          {/* Secondary text */}
          {secondaryText && (
            <span className="text-xs text-muted-foreground truncate block">
              {secondaryText}
            </span>
          )}
        </div>
        
        {/* Right side - Status or Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Availability dot */}
          {agent.availability_status && (
            <VitalAgentAvailabilityDot
              availability={agent.availability_status}
              size="sm"
            />
          )}
          
          {/* Selection indicator */}
          {isSelected && (
            <CheckCircle2 
              className="h-4 w-4 text-primary shrink-0" 
              aria-label="Selected"
            />
          )}
          
          {/* Add to chat action (shown on hover) */}
          {showActions && onAddToChat && !isSelected && (
            <button
              type="button"
              onClick={handleAddToChat}
              className={cn(
                'h-7 w-7 rounded-lg flex items-center justify-center',
                'bg-primary/10 text-primary hover:bg-primary/20',
                'transition-all duration-200',
                'opacity-0 group-hover:opacity-100',
                'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary'
              )}
              title="Add to Chat"
              aria-label="Add to Chat"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

VitalAgentCardMinimal.displayName = 'VitalAgentCardMinimal';

// ============================================================================
// SKELETON
// ============================================================================

export interface VitalAgentCardMinimalSkeletonProps {
  className?: string;
}

/**
 * Skeleton loading state for minimal card
 */
export function VitalAgentCardMinimalSkeleton({ className }: VitalAgentCardMinimalSkeletonProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl animate-pulse',
        className
      )}
    >
      {/* Avatar skeleton */}
      <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
      
      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-8 bg-muted rounded-lg" />
        </div>
        <div className="h-3 w-20 bg-muted rounded" />
      </div>
      
      {/* Right side skeleton */}
      <div className="w-3 h-3 rounded-full bg-muted shrink-0" />
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default VitalAgentCardMinimal;
