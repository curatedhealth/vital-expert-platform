import { Star, CheckCircle, Zap, Shield, Target, MessageSquarePlus, Edit, Trash2, MoreVertical } from 'lucide-react';
import React from 'react';

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
import { type Agent } from '@/lib/stores/chat-store';
import { cn } from '@vital/ui/lib/utils';

interface EnhancedAgentCardProps {
  agent: Agent;
  isSelected?: boolean;
  isBestMatch?: boolean;
  onClick?: () => void;
  onAddToChat?: (agent: Agent) => void;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  className?: string;
  showReasoning?: boolean;
  showTier?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const tierConfig = {
  0: { 
    label: 'Core', 
    color: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 border-purple-300',
    icon: Star
  },
  1: { 
    label: 'Tier 1', 
    color: 'bg-vital-primary-100 text-vital-primary-700 border-vital-primary-200',
    icon: Shield
  },
  2: { 
    label: 'Tier 2', 
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle
  },
  3: { 
    label: 'Tier 3', 
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: Target
  }
};

const sizeConfig = {
  sm: {
    card: 'p-2.5',
    avatar: 'w-10 h-10',
    title: 'text-xs font-semibold',
    description: 'text-xs',
    reasoning: 'text-xs',
    badge: 'text-xs px-1.5 py-0.5',
    gap: 'gap-2'
  },
  md: {
    card: 'p-3',
    avatar: 'w-12 h-12',
    title: 'text-sm font-semibold',
    description: 'text-xs',
    reasoning: 'text-xs',
    badge: 'text-xs px-2 py-0.5',
    gap: 'gap-3'
  },
  lg: {
    card: 'p-4',
    avatar: 'w-14 h-14',
    title: 'text-base font-semibold',
    description: 'text-sm',
    reasoning: 'text-xs',
    badge: 'text-xs px-2 py-1',
    gap: 'gap-3'
  }
};

export function EnhancedAgentCard({
  agent,
  isSelected = false,
  isBestMatch = false,
  onClick,
  onAddToChat,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  className,
  showReasoning = true,
  showTier = true,
  size = 'md'
}: EnhancedAgentCardProps) {
  const config = sizeConfig[size];
  const tierInfo = agent.tier !== undefined ? tierConfig[agent.tier as keyof typeof tierConfig] : null;
  const TierIcon = tierInfo?.icon || Target;

  return (
    <Card
      className={cn(
        'group relative cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-vital-primary-300',
        'focus:outline-none focus:ring-2 focus:ring-vital-primary-500 focus:ring-offset-1',
        isSelected && 'ring-2 ring-vital-primary-500 bg-vital-primary-50 border-vital-primary-500',
        'border border-gray-200',
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
          {/* Enhanced Avatar */}
          <div className="flex-shrink-0 relative">
            <div className={cn(
              'rounded-lg overflow-hidden border transition-all duration-200',
              'group-hover:border-vital-primary-300',
              isSelected && 'border-vital-primary-400',
              'border-gray-200 bg-gray-50',
              config.avatar
            )}>
              <AgentAvatar
                agent={agent}
                size={size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'xl'}
                className="w-full h-full"
              />
            </div>
            
            {/* Best Match Badge */}
            {isBestMatch && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-0.5 shadow-md">
                <Star className="w-2.5 h-2.5" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header with Title, Badges, and Actions */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  'text-gray-900 truncate group-hover:text-vital-primary-700 transition-colors font-semibold',
                  config.title
                )}>
                  {agent.display_name || agent.name}
                </h4>
                
                {/* Role/Department */}
                {(agent.role || agent.department || agent.business_function) && (
                  <p className={cn(
                    'text-gray-500 truncate mt-0.5',
                    config.description
                  )}>
                    {agent.role || agent.department || agent.business_function}
                  </p>
                )}
              </div>

              {/* Badges and Actions Menu */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Badges */}
                <div className="flex flex-col gap-1 items-end">
                  {isBestMatch && (
                    <Badge 
                      className={cn(
                        'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0',
                        config.badge
                      )}
                    >
                      <Star className="w-2.5 h-2.5 mr-0.5" />
                      Best
                    </Badge>
                  )}
                  
                  {showTier && tierInfo && (
                    <Badge 
                      variant="outline"
                      className={cn(
                        'font-medium border',
                        tierInfo.color,
                        config.badge
                      )}
                    >
                      <TierIcon className="w-2.5 h-2.5 mr-0.5" />
                      {tierInfo.label}
                    </Badge>
                  )}
                </div>

                {/* Actions Menu */}
                {(canEdit || canDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          'h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
                          config.badge.includes('text-xs') && 'h-5 w-5'
                        )}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {canEdit && onEdit && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(agent);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canDelete && onDelete && (
                        <>
                          {canEdit && <DropdownMenuSeparator />}
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to delete "${agent.display_name || agent.name}"? This action cannot be undone.`)) {
                                onDelete(agent);
                              }
                            }}
                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Description */}
            <p className={cn(
              'text-gray-600 mb-1.5 line-clamp-2',
              config.description
            )}>
              {agent.description}
            </p>

            {/* Capabilities/Tags - Compact */}
            {agent.capabilities && agent.capabilities.length > 0 && (
              <div className="mb-1.5 flex flex-wrap gap-1">
                {agent.capabilities.slice(0, 2).map((capability, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={cn(
                      'text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600',
                      config.badge
                    )}
                  >
                    {capability}
                  </Badge>
                ))}
                {agent.capabilities.length > 2 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs px-1.5 py-0.5 text-gray-500 border-gray-200',
                      config.badge
                    )}
                  >
                    +{agent.capabilities.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Add to Chat Button - Compact */}
            {onAddToChat && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToChat(agent);
                  }}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'w-full border-vital-primary-300 text-vital-primary-600 hover:bg-vital-primary-50 hover:text-vital-primary-700 hover:border-vital-primary-400',
                    size === 'sm' && 'h-7 text-xs',
                    size === 'md' && 'h-8 text-xs',
                    size === 'lg' && 'h-9 text-sm'
                  )}
                >
                  <MessageSquarePlus className={cn(
                    'mr-1.5',
                    size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'
                  )} />
                  Add to Chat
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Grid container component for consistent layout
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
/* Cache bust 1761607345 */
