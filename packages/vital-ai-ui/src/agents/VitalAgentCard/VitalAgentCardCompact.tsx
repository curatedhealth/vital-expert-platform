/**
 * VitalAgentCardCompact - Compact Agent Card Variant
 * 
 * Standard grid view card for use in:
 * - Agent grid views
 * - Search results
 * - Agent selection modals
 * - Tablet views
 * 
 * Height: 180-220px
 * Shows: Avatar, Name, Level badge with label, Description (2 lines),
 *        Capability badges, Function/Dept tags, Action buttons
 * 
 * @packageDocumentation
 */

'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { VitalAgentAvatar } from '../VitalAgentAvatar';
import { VitalLevelBadge } from '../VitalLevelBadge';
import { VitalAgentStatusBadge } from '../VitalAgentStatus';
import { VitalQuickActions } from '../VitalAgentActions';
import { Building2, Briefcase, Zap, Sparkles } from 'lucide-react';
import { getAgentLevelNumber, getAgentCapabilities, canAgentSpawn } from '../types';
import { getAgentLevelColor, CARD_VARIANT_CONFIG } from '../constants';
import type { VitalAgentCardCompactProps } from '../types';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * VitalAgentCardCompact is the standard card variant for grid displays.
 * 
 * Provides a balanced view of agent information with:
 * - 56px avatar with level indicator and glow
 * - Agent name and tagline
 * - Level badge with name (e.g., "L2 Expert")
 * - 2-line description with truncation
 * - Up to 3 capability badges
 * - Function and department tags
 * - "Can spawn" indicator for L1-L3
 * - Hover action buttons
 * 
 * @example
 * ```tsx
 * <VitalAgentCardCompact
 *   agent={agent}
 *   onSelect={handleSelect}
 *   onAddToChat={handleAddToChat}
 *   onBookmark={handleBookmark}
 *   isBookmarked={bookmarkedIds.includes(agent.id)}
 * />
 * ```
 */
export const VitalAgentCardCompact = React.forwardRef<HTMLDivElement, VitalAgentCardCompactProps>(
  (
    {
      agent,
      isSelected = false,
      isBookmarked = false,
      isInComparison = false,
      featured = false,
      showActions = true,
      showCapabilities = true,
      className,
      style,
      animationDelay = 0,
      onSelect,
      onAddToChat,
      onBookmark,
      onDuplicate,
      onEdit,
      onDelete,
      onCompare,
      onViewDetails,
      canEdit = false,
      canDelete = false,
      canDuplicate = true,
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    
    // Compute level and config
    const agentLevel = getAgentLevelNumber(agent);
    const levelConfig = getAgentLevelColor(agentLevel);
    const variantConfig = CARD_VARIANT_CONFIG.compact;
    
    // Get display data
    const displayName = agent.display_name || agent.name;
    const capabilities = getAgentCapabilities(agent);
    const canSpawn = canAgentSpawn(agent);
    
    // Handle click
    const handleClick = () => {
      onSelect?.(agent);
    };
    
    // Handle keyboard
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
        e.preventDefault();
        onSelect(agent);
      }
    };
    
    return (
      <article
        ref={ref}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          // Base styles
          'group relative cursor-pointer outline-none',
          'rounded-2xl overflow-hidden',
          'transition-all duration-300 ease-out',
          
          // Border and shadow
          'border',
          isSelected
            ? 'border-primary shadow-lg'
            : 'border-border/50 hover:border-border',
          
          // Background
          'bg-card',
          isSelected && 'bg-primary/5',
          
          // Hover effects
          'hover:shadow-xl hover:-translate-y-1',
          
          // Focus styles
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          
          className
        )}
        style={{
          height: variantConfig.height,
          boxShadow: isHovered && !isSelected
            ? `0 20px 40px ${levelConfig.shadowColor}`
            : undefined,
          ...style,
        }}
        aria-label={`${displayName} - Level ${agentLevel} ${levelConfig.name} agent`}
        aria-selected={isSelected}
      >
        {/* Background gradient pattern */}
        <div
          className={cn(
            'absolute inset-0 opacity-0 transition-opacity duration-500',
            'group-hover:opacity-30'
          )}
          style={{ background: levelConfig.bgPattern }}
          aria-hidden="true"
        />
        
        {/* Gradient border on hover */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl transition-opacity duration-500',
            'opacity-0 group-hover:opacity-100 pointer-events-none'
          )}
          style={{
            background: levelConfig.gradient,
            padding: '1.5px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMaskComposite: 'xor',
          }}
          aria-hidden="true"
        />
        
        {/* Featured badge */}
        {featured && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold shadow-lg">
              <Sparkles className="w-3 h-3" />
              Featured
            </div>
          </div>
        )}
        
        {/* Content */}
        <div 
          className="relative h-full flex flex-col"
          style={{ padding: variantConfig.padding }}
        >
          {/* Header: Avatar + Info + Status */}
          <div className="flex gap-3">
            {/* Avatar */}
            <VitalAgentAvatar
              agent={agent}
              size={variantConfig.avatarSize}
              level={agentLevel}
              showLevelIndicator
              showGlow={isHovered}
              animated
            />
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Level Badge */}
              <div className="mb-1.5">
                <VitalLevelBadge
                  level={agentLevel}
                  size="sm"
                  variant="default"
                  showIcon
                  showLabel
                />
              </div>
              
              {/* Name */}
              <h3
                className={cn(
                  'font-semibold leading-tight line-clamp-1',
                  'group-hover:text-primary transition-colors duration-300',
                  variantConfig.titleSize
                )}
                title={displayName}
              >
                {displayName}
              </h3>
              
              {/* Tagline */}
              {agent.tagline && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {agent.tagline}
                </p>
              )}
            </div>
            
            {/* Status */}
            <div className="shrink-0">
              <VitalAgentStatusBadge
                status={agent.status || 'active'}
                size="sm"
              />
            </div>
          </div>
          
          {/* Description */}
          <div className="flex-1 mt-3">
            <p
              className="text-sm text-muted-foreground leading-relaxed line-clamp-2"
              title={agent.description}
            >
              {agent.description}
            </p>
          </div>
          
          {/* Capabilities */}
          {showCapabilities && capabilities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {capabilities.slice(0, variantConfig.maxCapabilities).map((cap) => (
                <span
                  key={cap}
                  className={cn(
                    'inline-flex px-2 py-0.5 rounded-md text-xs',
                    'bg-muted text-muted-foreground',
                    'border border-transparent'
                  )}
                >
                  {cap}
                </span>
              ))}
              {capabilities.length > variantConfig.maxCapabilities && (
                <span className="inline-flex px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground">
                  +{capabilities.length - variantConfig.maxCapabilities}
                </span>
              )}
            </div>
          )}
          
          {/* Footer: Metadata + Actions */}
          <div className="mt-auto pt-3 flex items-end justify-between">
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {agent.function_name && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[100px]">{agent.function_name}</span>
                </div>
              )}
              {agent.department_name && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[100px]">{agent.department_name}</span>
                </div>
              )}
              {canSpawn && (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Can spawn</span>
                </div>
              )}
            </div>
            
            {/* Actions (shown on hover) */}
            {showActions && (
              <div
                className={cn(
                  'transition-opacity duration-200',
                  isHovered ? 'opacity-100' : 'opacity-0'
                )}
              >
                <VitalQuickActions
                  agent={agent}
                  onAddToChat={onAddToChat}
                  onBookmark={onBookmark}
                  onDuplicate={onDuplicate}
                  isBookmarked={isBookmarked}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Hover shine effect */}
        <div
          className={cn(
            'absolute inset-0 pointer-events-none',
            'bg-gradient-to-br from-white/5 via-transparent to-transparent',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-500'
          )}
          aria-hidden="true"
        />
      </article>
    );
  }
);

VitalAgentCardCompact.displayName = 'VitalAgentCardCompact';

// ============================================================================
// SKELETON
// ============================================================================

export interface VitalAgentCardCompactSkeletonProps {
  className?: string;
}

/**
 * Skeleton loading state for compact card
 */
export function VitalAgentCardCompactSkeleton({ className }: VitalAgentCardCompactSkeletonProps) {
  const variantConfig = CARD_VARIANT_CONFIG.compact;
  
  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden bg-card border border-border/50',
        'animate-pulse',
        className
      )}
      style={{ height: variantConfig.height }}
    >
      <div 
        className="h-full flex flex-col"
        style={{ padding: variantConfig.padding }}
      >
        {/* Header */}
        <div className="flex gap-3">
          {/* Avatar skeleton */}
          <div
            className="rounded-xl bg-muted shrink-0"
            style={{ width: variantConfig.avatarSize, height: variantConfig.avatarSize }}
          />
          
          {/* Info skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-5 w-20 bg-muted rounded-lg" />
            <div className="h-5 w-3/4 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted rounded" />
          </div>
          
          {/* Status skeleton */}
          <div className="h-5 w-16 bg-muted rounded-full shrink-0" />
        </div>
        
        {/* Description skeleton */}
        <div className="flex-1 mt-4 space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
        </div>
        
        {/* Capabilities skeleton */}
        <div className="flex gap-1 mt-2">
          <div className="h-5 w-16 bg-muted rounded-md" />
          <div className="h-5 w-20 bg-muted rounded-md" />
          <div className="h-5 w-12 bg-muted rounded-md" />
        </div>
        
        {/* Footer skeleton */}
        <div className="mt-auto pt-3 flex justify-between">
          <div className="flex gap-3">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded" />
          </div>
        </div>
      </div>
      
      {/* Shimmer effect */}
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        }}
        aria-hidden="true"
      />
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default VitalAgentCardCompact;
