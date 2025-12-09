/**
 * VitalAgentCardRich - Rich/Detailed Agent Card Variant
 * 
 * Full-featured card for use in:
 * - Agent detail pages
 * - Featured agent spotlights
 * - Comparison panels
 * - Admin dashboards
 * - Expanded views
 * 
 * Height: 320px+ (auto-expand)
 * Shows: Full avatar, complete info, metrics, capabilities,
 *        knowledge domains, tools, system prompt preview
 * 
 * @packageDocumentation
 */

'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { VitalAgentAvatar } from '../VitalAgentAvatar';
import { VitalLevelBadge } from '../VitalLevelBadge';
import { VitalAgentStatusBadge } from '../VitalAgentStatus';
import { VitalAgentActions } from '../VitalAgentActions';
import { VitalAgentMetrics, VitalAgentRating } from '../VitalAgentMetrics';
import {
  Building2,
  Briefcase,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Wrench,
  Brain,
  BookOpen,
  MessageSquare,
  Settings2,
  FileText,
} from 'lucide-react';
import { 
  getAgentLevelNumber, 
  getAgentCapabilities, 
  getAgentKnowledgeDomains,
  canAgentSpawn 
} from '../types';
import { getAgentLevelColor, CARD_VARIANT_CONFIG } from '../constants';
import type { VitalAgentCardRichProps, VitalAgent } from '../types';

// ============================================================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================================================

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  children,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  return (
    <div className={cn('border-t border-border/50', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between w-full py-3',
          'text-sm font-medium text-foreground',
          'hover:text-primary transition-colors'
        )}
      >
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 text-muted-foreground">{icon}</span>
          <span>{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      
      {isOpen && (
        <div className="pb-4 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// BADGE LIST COMPONENT
// ============================================================================

interface BadgeListProps {
  items: string[];
  variant?: 'default' | 'outline' | 'primary';
  maxVisible?: number;
  className?: string;
}

function BadgeList({ items, variant = 'default', maxVisible, className }: BadgeListProps) {
  const visibleItems = maxVisible ? items.slice(0, maxVisible) : items;
  const hiddenCount = maxVisible ? Math.max(0, items.length - maxVisible) : 0;
  
  const variantClasses = {
    default: 'bg-muted text-muted-foreground border-transparent',
    outline: 'bg-transparent text-foreground border-border',
    primary: 'bg-primary/10 text-primary border-primary/20',
  };
  
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {visibleItems.map((item) => (
        <span
          key={item}
          className={cn(
            'inline-flex px-2.5 py-1 rounded-lg text-xs font-medium',
            'border transition-colors',
            variantClasses[variant]
          )}
        >
          {item}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground">
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * VitalAgentCardRich is the most detailed card variant.
 * 
 * Provides comprehensive agent information with:
 * - 80px avatar with prominent glow effect
 * - Full agent name and tagline
 * - Level badge with icon and name
 * - Complete description (no truncation)
 * - All capabilities and knowledge domains
 * - Performance metrics (success rate, response time, rating)
 * - Tool assignments (collapsible)
 * - System prompt preview (collapsible)
 * - Full action toolbar
 * - Edit/Delete buttons (if authorized)
 * 
 * @example
 * ```tsx
 * <VitalAgentCardRich
 *   agent={agent}
 *   onSelect={handleSelect}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   canEdit={true}
 *   canDelete={true}
 *   showMetrics
 *   showTools
 * />
 * ```
 */
export const VitalAgentCardRich = React.forwardRef<HTMLDivElement, VitalAgentCardRichProps>(
  (
    {
      agent,
      isSelected = false,
      isBookmarked = false,
      isInComparison = false,
      featured = false,
      showActions = true,
      showCapabilities = true,
      showMetrics = true,
      showTools = true,
      showSystemPrompt = false,
      collapsedByDefault = true,
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
    // Compute level and config
    const agentLevel = getAgentLevelNumber(agent);
    const levelConfig = getAgentLevelColor(agentLevel);
    const variantConfig = CARD_VARIANT_CONFIG.rich;
    
    // Get display data
    const displayName = agent.display_name || agent.name;
    const capabilities = getAgentCapabilities(agent);
    const knowledgeDomains = getAgentKnowledgeDomains(agent);
    const canSpawn = canAgentSpawn(agent);
    
    // Get tools
    const tools = agent.assigned_tools?.filter(t => t.is_enabled !== false) || [];
    
    // Handle click
    const handleClick = () => {
      onSelect?.(agent);
    };
    
    return (
      <article
        ref={ref}
        onClick={handleClick}
        className={cn(
          // Base styles
          'group relative cursor-pointer outline-none',
          'rounded-2xl overflow-hidden',
          'transition-all duration-300 ease-out',
          
          // Border and shadow
          'border-2',
          isSelected
            ? 'border-primary shadow-xl'
            : 'border-border/50 hover:border-border',
          
          // Background
          'bg-card',
          isSelected && 'bg-primary/5',
          
          // Focus styles
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          
          className
        )}
        style={{
          minHeight: variantConfig.minHeight,
          ...style,
        }}
        aria-label={`${displayName} - Level ${agentLevel} ${levelConfig.name} agent - detailed view`}
        tabIndex={0}
      >
        {/* Background gradient pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: levelConfig.bgPattern }}
          aria-hidden="true"
        />
        
        {/* Content */}
        <div 
          className="relative"
          style={{ padding: variantConfig.padding }}
        >
          {/* Header Section */}
          <div className="flex gap-5">
            {/* Avatar */}
            <div className="shrink-0">
              <VitalAgentAvatar
                agent={agent}
                size={variantConfig.avatarSize}
                level={agentLevel}
                showLevelIndicator
                showGlow
                animated
              />
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {/* Level Badge */}
                  <VitalLevelBadge
                    level={agentLevel}
                    size="md"
                    variant="gradient"
                    showIcon
                    showLabel
                    className="mb-2"
                  />
                  
                  {/* Name */}
                  <h2
                    className={cn(
                      'font-bold leading-tight',
                      variantConfig.titleSize
                    )}
                  >
                    {displayName}
                  </h2>
                  
                  {/* Tagline */}
                  {agent.tagline && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {agent.tagline}
                    </p>
                  )}
                  
                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                    {agent.function_name && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        <span>{agent.function_name}</span>
                      </div>
                    )}
                    {agent.department_name && (
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        <span>{agent.department_name}</span>
                      </div>
                    )}
                    {canSpawn && (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <Zap className="w-4 h-4" />
                        <span>Can spawn agents</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Status & Featured */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <VitalAgentStatusBadge
                    status={agent.status || 'active'}
                    size="md"
                    showGlow={agent.status === 'active'}
                  />
                  
                  {featured && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold shadow-lg">
                      <Sparkles className="w-3.5 h-3.5" />
                      Featured
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              {showActions && (
                <div className="mt-4">
                  <VitalAgentActions
                    agent={agent}
                    direction="horizontal"
                    size="md"
                    variant="outline"
                    showLabels
                    maxVisible={5}
                    isBookmarked={isBookmarked}
                    isInComparison={isInComparison}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    canDuplicate={canDuplicate}
                    onSelect={onSelect}
                    onAddToChat={onAddToChat}
                    onBookmark={onBookmark}
                    onDuplicate={onDuplicate}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onCompare={onCompare}
                    onViewDetails={onViewDetails}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Description */}
          {agent.description && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Description
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {agent.description}
              </p>
            </div>
          )}
          
          {/* Metrics */}
          {showMetrics && agent.metrics && (
            <div className="mt-6 p-4 rounded-xl bg-muted/50">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-muted-foreground" />
                Performance Metrics
              </h3>
              <VitalAgentMetrics
                metrics={agent.metrics}
                layout="grid"
                size="md"
                showIcons
                showLabels
              />
              
              {/* Rating if available */}
              {agent.metrics.rating && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <VitalAgentRating
                    rating={agent.metrics.rating}
                    size="md"
                    showValue
                    reviewCount={agent.metrics.total_consultations}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Capabilities */}
          {showCapabilities && capabilities.length > 0 && (
            <CollapsibleSection
              title={`Capabilities (${capabilities.length})`}
              icon={<Brain />}
              defaultOpen={!collapsedByDefault}
              className="mt-4"
            >
              <BadgeList items={capabilities} variant="primary" />
            </CollapsibleSection>
          )}
          
          {/* Knowledge Domains */}
          {knowledgeDomains.length > 0 && (
            <CollapsibleSection
              title={`Knowledge Domains (${knowledgeDomains.length})`}
              icon={<BookOpen />}
              defaultOpen={!collapsedByDefault}
            >
              <BadgeList items={knowledgeDomains} variant="outline" />
            </CollapsibleSection>
          )}
          
          {/* Tools */}
          {showTools && tools.length > 0 && (
            <CollapsibleSection
              title={`Assigned Tools (${tools.length})`}
              icon={<Wrench />}
              defaultOpen={false}
            >
              <div className="space-y-2">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tool.name}
                      </p>
                      {tool.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {tool.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
          
          {/* System Prompt Preview */}
          {showSystemPrompt && agent.system_prompt && (
            <CollapsibleSection
              title="System Prompt"
              icon={<MessageSquare />}
              defaultOpen={false}
            >
              <div className="p-3 rounded-lg bg-muted/50 font-mono text-xs text-muted-foreground max-h-40 overflow-y-auto">
                {agent.system_prompt.slice(0, 500)}
                {agent.system_prompt.length > 500 && '...'}
              </div>
            </CollapsibleSection>
          )}
          
          {/* Prompt Starters */}
          {agent.prompt_starters && agent.prompt_starters.length > 0 && (
            <CollapsibleSection
              title={`Prompt Starters (${agent.prompt_starters.length})`}
              icon={<MessageSquare />}
              defaultOpen={false}
            >
              <div className="space-y-2">
                {agent.prompt_starters.slice(0, 5).map((starter) => (
                  <div
                    key={starter.id}
                    className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                  >
                    {starter.icon && <span>{starter.icon}</span>}
                    <span className="text-muted-foreground">{starter.text}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      </article>
    );
  }
);

VitalAgentCardRich.displayName = 'VitalAgentCardRich';

// ============================================================================
// SKELETON
// ============================================================================

export interface VitalAgentCardRichSkeletonProps {
  className?: string;
}

/**
 * Skeleton loading state for rich card
 */
export function VitalAgentCardRichSkeleton({ className }: VitalAgentCardRichSkeletonProps) {
  const variantConfig = CARD_VARIANT_CONFIG.rich;
  
  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden bg-card border-2 border-border/50',
        'animate-pulse',
        className
      )}
      style={{ minHeight: variantConfig.minHeight }}
    >
      <div style={{ padding: variantConfig.padding }}>
        {/* Header */}
        <div className="flex gap-5">
          {/* Avatar skeleton */}
          <div
            className="rounded-xl bg-muted shrink-0"
            style={{ width: variantConfig.avatarSize, height: variantConfig.avatarSize }}
          />
          
          {/* Info skeleton */}
          <div className="flex-1 space-y-3">
            <div className="h-6 w-24 bg-muted rounded-lg" />
            <div className="h-7 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
            <div className="flex gap-4 mt-3">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-9 w-28 bg-muted rounded-lg" />
              <div className="h-9 w-24 bg-muted rounded-lg" />
              <div className="h-9 w-24 bg-muted rounded-lg" />
            </div>
          </div>
          
          {/* Status skeleton */}
          <div className="h-6 w-20 bg-muted rounded-full shrink-0" />
        </div>
        
        {/* Description skeleton */}
        <div className="mt-6 space-y-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-4/6 bg-muted rounded" />
        </div>
        
        {/* Metrics skeleton */}
        <div className="mt-6 p-4 rounded-xl bg-muted/50">
          <div className="h-4 w-32 bg-muted rounded mb-3" />
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-5 w-12 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-12 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-12 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-12 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          </div>
        </div>
        
        {/* Sections skeleton */}
        <div className="mt-4 space-y-4">
          <div className="border-t border-border/50 pt-3">
            <div className="h-5 w-32 bg-muted rounded" />
          </div>
          <div className="border-t border-border/50 pt-3">
            <div className="h-5 w-40 bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default VitalAgentCardRich;
