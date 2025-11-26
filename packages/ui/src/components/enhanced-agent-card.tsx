/**
 * EnhancedAgentCard - Minimalist Design
 * Following VITAL Brand Guidelines v5.0
 * 
 * Design Principles:
 * - Warm Ivory Background (#FAF8F1)
 * - Atomic geometry (circles, squares)
 * - Clean tenant-based color badges
 * - Inter typography
 * - Intentional minimalism
 * - VITAL Icons for actions
 */

import { Crown, Star, Shield, Wrench, Cog, Edit, Trash2, MoreVertical, Zap, Plus, Copy, Bookmark, BookmarkCheck, MessageSquarePlus } from 'lucide-react';
import React from 'react';
import Image from 'next/image';

import { AgentAvatar } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent } from '@vital/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@vital/ui';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@vital/ui';
import { type Agent } from '@/lib/stores/chat-store';
import { cn } from '@vital/ui/lib/utils';

interface EnhancedAgentCardProps {
  agent: Agent;
  isSelected?: boolean;
  isBestMatch?: boolean;
  onClick?: () => void;
  onAddToChat?: (agent: Agent) => void;
  onDuplicate?: (agent: Agent) => void;
  onBookmark?: (agent: Agent) => void;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  isBookmarked?: boolean;
  className?: string;
  showReasoning?: boolean;
  showLevel?: boolean;
  showLevelName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// VITAL BRAND COLORS (from Brand Guidelines v5.0)
// ============================================================================

// Agent Level Colors - Based on AgentOS 3.0 Hierarchy
const levelConfig = {
  1: { 
    label: 'L1 Master',
    name: 'Master',
    // Expert Purple - Strategy, Intelligence
    bg: 'bg-[#9B5DE0]',
    text: 'text-white',
    border: 'border-[#9B5DE0]/20',
    icon: Crown,
    description: 'Orchestrator'
  },
  2: { 
    label: 'L2 Expert',
    name: 'Expert',
    // Pharma Blue - Precision, Compliance
    bg: 'bg-[#0046FF]',
    text: 'text-white',
    border: 'border-[#0046FF]/20',
    icon: Star,
    description: 'Domain Specialist'
  },
  3: { 
    label: 'L3 Specialist',
    name: 'Specialist',
    // Systems Teal - Infrastructure, Flow
    bg: 'bg-[#00B5AD]',
    text: 'text-white',
    border: 'border-[#00B5AD]/20',
    icon: Shield,
    description: 'Sub-Expert'
  },
  4: { 
    label: 'L4 Worker',
    name: 'Worker',
    // Velocity Orange - Energy, Acceleration
    bg: 'bg-[#FF6B00]',
    text: 'text-white',
    border: 'border-[#FF6B00]/20',
    icon: Wrench,
    description: 'Task Executor'
  },
  5: { 
    label: 'L5 Tool',
    name: 'Tool',
    // Neutral-600 - Utility
    bg: 'bg-[#555555]',
    text: 'text-white',
    border: 'border-[#555555]/20',
    icon: Cog,
    description: 'Integration'
  }
};

// Status Colors - Semantic States
const statusConfig = {
  active: {
    dot: 'bg-[#22c55e]',
    text: 'text-[#22c55e]',
    label: 'Active'
  },
  testing: {
    dot: 'bg-[#f59e0b]',
    text: 'text-[#f59e0b]',
    label: 'Testing'
  },
  development: {
    dot: 'bg-[#3b82f6]',
    text: 'text-[#3b82f6]',
    label: 'Dev'
  },
  inactive: {
    dot: 'bg-[#9ca3af]',
    text: 'text-[#9ca3af]',
    label: 'Inactive'
  }
};

// Size configurations
const sizeConfig = {
  sm: {
    card: 'p-3',
    avatar: 'w-10 h-10',
    title: 'text-sm font-semibold',
    description: 'text-xs',
    badge: 'text-[10px] px-1.5 py-0.5',
    gap: 'gap-2.5'
  },
  md: {
    card: 'p-4',
    avatar: 'w-12 h-12',
    title: 'text-sm font-semibold',
    description: 'text-xs',
    badge: 'text-[11px] px-2 py-0.5',
    gap: 'gap-3'
  },
  lg: {
    card: 'p-5',
    avatar: 'w-14 h-14',
    title: 'text-base font-semibold',
    description: 'text-sm',
    badge: 'text-xs px-2.5 py-1',
    gap: 'gap-4'
  }
};

// ============================================================================
// LEVEL BADGE COMPONENT - Minimalist
// ============================================================================

function LevelBadge({ 
  level, 
  size = 'md' 
}: { 
  level: number; 
  size?: 'sm' | 'md' | 'lg';
}) {
  const config = levelConfig[level as keyof typeof levelConfig];
  if (!config) return null;
  
  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-0.5',
    md: 'text-[10px] px-2 py-0.5 gap-1',
    lg: 'text-[11px] px-2.5 py-1 gap-1'
  };
  
  return (
    <span className={cn(
      'inline-flex items-center rounded-md font-medium',
      config.bg,
      config.text,
      sizeClasses[size]
    )}>
      <Icon className="w-2.5 h-2.5" />
      <span>{config.label}</span>
    </span>
  );
}

// ============================================================================
// STATUS INDICATOR - Minimal Dot
// ============================================================================

function StatusIndicator({ 
  status,
  showLabel = false 
}: { 
  status: string;
  showLabel?: boolean;
}) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
  
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {showLabel && (
        <span className={cn('text-[10px] font-medium', config.text)}>
          {config.label}
        </span>
      )}
    </span>
  );
}

// ============================================================================
// ACTION ICONS - Using Lucide React Icons
// ============================================================================

// Icon mapping for action buttons using Lucide React
const ActionIcons = {
  add: MessageSquarePlus,
  duplicate: Copy,
  bookmark: Bookmark,
  'bookmark-filled': BookmarkCheck,
} as const;

// ============================================================================
// MAIN CARD COMPONENT
// ============================================================================

export function EnhancedAgentCard({
  agent,
  isSelected = false,
  isBestMatch = false,
  onClick,
  onAddToChat,
  onDuplicate,
  onBookmark,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  isBookmarked = false,
  className,
  showReasoning = true,
  showLevel = true,
  showLevelName = true,
  size = 'md'
}: EnhancedAgentCardProps) {
  const config = sizeConfig[size];
  
  // Determine agent level (1-5)
  const agentLevel = agent.tier !== undefined 
    ? Math.min(Math.max(agent.tier, 1), 5) 
    : 2; // Default to L2 Expert
  
  const levelInfo = levelConfig[agentLevel as keyof typeof levelConfig];
  const agentStatus = (agent as any).status || 'active';

  return (
    <Card
      className={cn(
        // Base styles - Warm Ivory aesthetic
        'group relative cursor-pointer',
        'bg-[#FAF8F1] border border-[#E8E5DC]',
        'rounded-xl overflow-hidden',
        // Transitions
        'transition-all duration-200 ease-out',
        // Hover state - subtle lift
        'hover:border-[#BFBFBF] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
        // Focus state
        'focus:outline-none focus:ring-2 focus:ring-[#9B5DE0]/30 focus:ring-offset-1',
        // Selected state
        isSelected && 'ring-2 ring-[#9B5DE0] border-[#9B5DE0] bg-[#9B5DE0]/5',
        config.card,
        className
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Select agent ${agent.display_name || agent.name}`}
    >
      <CardContent className="p-0">
        <div className={cn('flex items-start', config.gap)}>
          
          {/* Avatar - Clean circular design */}
          <div className="flex-shrink-0 relative">
            <div className={cn(
              'rounded-xl overflow-hidden',
              'border-2 border-[#E8E5DC]',
              'bg-white',
              'transition-all duration-200',
              'group-hover:border-[#9B5DE0]/30',
              isSelected && 'border-[#9B5DE0]',
              config.avatar
            )}>
              <AgentAvatar
                agent={agent}
                size={size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'xl'}
                className="w-full h-full"
                level={agentLevel}
                businessFunction={agent.business_function}
              />
            </div>
            
            {/* Can Spawn indicator */}
            {agentLevel <= 3 && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#22c55e] border-2 border-[#FAF8F1] flex items-center justify-center">
                <Zap className="w-2 h-2 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header Row: Level Badge + Level Name + Status */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                {showLevel && <LevelBadge level={agentLevel} size={size} />}
                {showLevelName && levelInfo && (
                  <span className={cn(
                    'font-semibold text-[#1A1A1A]',
                    size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-[11px]' : 'text-xs'
                  )}>
                    {levelInfo.name}
                  </span>
                )}
                <StatusIndicator status={agentStatus} />
              </div>
              
              {/* Actions Menu (for Edit/Delete) */}
              {(canEdit || canDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-[#555555] hover:text-[#1A1A1A] hover:bg-[#E8E5DC]"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 bg-white border-[#E8E5DC]">
                    {canEdit && onEdit && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(agent);
                        }}
                        className="text-[#1A1A1A] focus:bg-[#FAF8F1]"
                      >
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canDelete && onDelete && (
                      <>
                        {canEdit && <DropdownMenuSeparator className="bg-[#E8E5DC]" />}
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${agent.display_name || agent.name}"?`)) {
                              onDelete(agent);
                            }
                          }}
                          className="text-[#EF4444] focus:text-[#EF4444] focus:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Agent Name */}
            <h4 className={cn(
              'text-[#1A1A1A] truncate',
              'group-hover:text-[#9B5DE0] transition-colors',
              config.title
            )}>
              {agent.display_name || agent.name}
            </h4>
            
            {/* Function/Department - Muted */}
            {(agent.business_function || agent.department) && (
              <p className={cn(
                'text-[#555555] truncate mt-0.5',
                config.description
              )}>
                {agent.business_function || agent.department}
              </p>
            )}

            {/* Description - 2 lines max */}
            <p className={cn(
              'text-[#555555] mt-1.5 line-clamp-2 leading-relaxed',
              config.description
            )}>
              {agent.description}
            </p>

            {/* Capabilities - Minimal pills */}
            {agent.capabilities && agent.capabilities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {agent.capabilities.slice(0, 2).map((capability, index) => (
                  <span
                    key={index}
                    className={cn(
                      'inline-flex items-center rounded-md',
                      'bg-[#E8E5DC] text-[#555555]',
                      'font-medium',
                      config.badge
                    )}
                  >
                    {capability}
                  </span>
                ))}
                {agent.capabilities.length > 2 && (
                  <span className={cn(
                    'inline-flex items-center rounded-md',
                    'bg-transparent text-[#9B5DE0] border border-[#9B5DE0]/30',
                    'font-medium',
                    config.badge
                  )}>
                    +{agent.capabilities.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons Row - ADD, DUPLICATE, BOOKMARK */}
            <div className="mt-3 pt-3 border-t border-[#E8E5DC]">
              <div className="flex items-center justify-between gap-2">
                {/* Add to Chat - Primary Action */}
                {onAddToChat && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToChat(agent);
                          }}
                          variant="outline"
                          size="sm"
                          className={cn(
                            'flex-1',
                            'border-[#9B5DE0]/30 text-[#9B5DE0]',
                            'hover:bg-[#9B5DE0] hover:text-white hover:border-[#9B5DE0]',
                            'transition-all duration-200',
                            size === 'sm' && 'h-7 text-xs',
                            size === 'md' && 'h-8 text-xs',
                            size === 'lg' && 'h-9 text-sm'
                          )}
                        >
                          <MessageSquarePlus className="w-3.5 h-3.5 mr-1.5" />
                          Add
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-[#1A1A1A] text-white text-xs">
                        Add to Chat
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Duplicate Button */}
                {onDuplicate && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(agent);
                          }}
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'text-[#555555] hover:text-[#9B5DE0] hover:bg-[#9B5DE0]/10',
                            'transition-all duration-200',
                            size === 'sm' ? 'h-7 w-7' : size === 'md' ? 'h-8 w-8' : 'h-9 w-9'
                          )}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-[#1A1A1A] text-white text-xs">
                        Duplicate Agent
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Bookmark Button */}
                {onBookmark && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookmark(agent);
                          }}
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'transition-all duration-200',
                            isBookmarked 
                              ? 'text-[#9B5DE0] bg-[#9B5DE0]/10' 
                              : 'text-[#555555] hover:text-[#9B5DE0] hover:bg-[#9B5DE0]/10',
                            size === 'sm' ? 'h-7 w-7' : size === 'md' ? 'h-8 w-8' : 'h-9 w-9'
                          )}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-[#1A1A1A] text-white text-xs">
                        {isBookmarked ? 'Remove Bookmark' : 'Bookmark Agent'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GRID CONTAINER
// ============================================================================

interface AgentCardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function AgentCardGrid({ 
  children, 
  className,
  columns = 1 
}: AgentCardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={cn(
      'grid gap-4',
      gridCols[columns],
      className
    )}>
      {children}
    </div>
  );
}
