import { Star, CheckCircle, Zap, Shield, Target, MessageSquarePlus } from 'lucide-react';
import React from 'react';

import { AgentAvatar } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent } from '@vital/ui';
import { type Agent } from '@/lib/stores/chat-store';
import { cn } from '@vital/ui/lib/utils';

interface EnhancedAgentCardProps {
  agent: Agent;
  isSelected?: boolean;
  isBestMatch?: boolean;
  onClick?: () => void;
  onAddToChat?: (agent: Agent) => void;
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
    card: 'p-3',
    avatar: 'w-10 h-10',
    title: 'text-sm font-semibold',
    description: 'text-xs',
    reasoning: 'text-xs',
    badge: 'text-xs px-2 py-1'
  },
  md: {
    card: 'p-4',
    avatar: 'w-12 h-12',
    title: 'text-base font-semibold',
    description: 'text-sm',
    reasoning: 'text-xs',
    badge: 'text-xs px-2 py-1'
  },
  lg: {
    card: 'p-5',
    avatar: 'w-16 h-16',
    title: 'text-lg font-semibold',
    description: 'text-sm',
    reasoning: 'text-sm',
    badge: 'text-sm px-3 py-1'
  }
};

export function EnhancedAgentCard({
  agent,
  isSelected = false,
  isBestMatch = false,
  onClick,
  onAddToChat,
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
        'group cursor-pointer transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02] hover:border-vital-primary-300',
        'focus:outline-none focus:ring-2 focus:ring-vital-primary-500 focus:ring-offset-2',
        isSelected && 'ring-2 ring-vital-primary-500 bg-vital-primary-100/50 border-vital-primary-500 border-2',
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
        <div className="flex items-start gap-4">
          {/* Enhanced Avatar */}
          <div className="flex-shrink-0 relative">
            <div className={cn(
              'rounded-xl overflow-hidden border-2 transition-all duration-200',
              'group-hover:border-vital-primary-300 group-hover:shadow-md',
              isSelected && 'border-vital-primary-400 shadow-md',
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
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-1 shadow-lg">
                <Star className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header with Title and Badges */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  'text-gray-900 truncate group-hover:text-vital-primary-700 transition-colors',
                  config.title
                )}>
                  {agent.display_name || agent.name}
                </h4>
                
                {/* Role/Department */}
                {(agent.role || agent.department || agent.business_function) && (
                  <p className={cn(
                    'text-gray-600 truncate mt-0.5',
                    config.description
                  )}>
                    {agent.role || agent.department || agent.business_function}
                  </p>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-col gap-1 items-end">
                {isBestMatch && (
                  <Badge 
                    className={cn(
                      'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-sm',
                      config.badge
                    )}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Best Match
                  </Badge>
                )}
                
                {showTier && tierInfo && (
                  <Badge 
                    variant="outline"
                    className={cn(
                      'font-medium border-2',
                      tierInfo.color,
                      config.badge
                    )}
                  >
                    <TierIcon className="w-3 h-3 mr-1" />
                    {tierInfo.label}
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <p className={cn(
              'text-gray-600 mb-2 line-clamp-2',
              config.description
            )}>
              {agent.description}
            </p>

            {/* Reasoning */}
            {showReasoning && agent.reasoning && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <p className={cn(
                  'text-gray-500 italic',
                  config.reasoning
                )}>
                  {agent.reasoning}
                </p>
              </div>
            )}

            {/* Capabilities/Tags */}
            {agent.capabilities && agent.capabilities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {agent.capabilities.slice(0, 3).map((capability, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={cn(
                      'text-xs px-2 py-0.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors',
                      config.badge
                    )}
                  >
                    {capability}
                  </Badge>
                ))}
                {agent.capabilities.length > 3 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs px-2 py-0.5 text-gray-500',
                      config.badge
                    )}
                  >
                    +{agent.capabilities.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Domain Expertise */}
            {agent.domain_expertise && (
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs px-2 py-0.5 bg-vital-primary-100 text-vital-primary-700 border-vital-primary-200',
                    config.badge
                  )}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {agent.domain_expertise}
                </Badge>
              </div>
            )}

            {/* Add to Chat Button */}
            {onAddToChat && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToChat(agent);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-vital-primary-500 text-vital-primary-600 hover:bg-vital-primary-100 hover:text-vital-primary-700"
                >
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
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
