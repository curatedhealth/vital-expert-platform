'use client';

import { cn } from '@/lib/utils';
import {
  User,
  CheckCircle,
  Clock,
  Zap,
  MoreHorizontal,
  Star,
  TrendingUp,
  MessageSquare,
  Eye,
  UserPlus,
  Settings,
  Globe,
  Folder,
  Activity,
  Calendar,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { VitalLevelBadge, type AgentLevel, isConversationalLevel } from './VitalLevelBadge';
import { VitalPersonalityBadge, type PersonalitySlug } from './VitalPersonalityBadge';

type AgentStatus = 'idle' | 'active' | 'busy' | 'offline';

interface AgentMetrics {
  tasksCompleted: number;
  successRate: number;
  avgResponseTime: number;
  rating?: number;
}

interface AgentContext {
  regions?: string[];
  domains?: string[];
  therapeuticAreas?: string[];
  phases?: string[];
}

interface EnhancedAgent {
  id: string;
  name: string;
  displayName?: string;
  level: AgentLevel;
  domain: string;
  description?: string;
  avatar?: string;
  status: AgentStatus;
  capabilities: string[];
  metrics?: AgentMetrics;
  
  // New: Personality Type
  personality?: PersonalitySlug | string;
  
  // New: Context assignments
  context?: AgentContext;
  
  // New: System prompt preview
  systemPromptPreview?: string;
}

interface VitalAgentCardEnhancedProps {
  agent: EnhancedAgent;
  variant?: 'minimal' | 'compact' | 'default' | 'detailed';
  isSelected?: boolean;
  onSelect?: (agent: EnhancedAgent) => void;
  onStartChat?: (agent: EnhancedAgent) => void;
  onViewDetails?: (agent: EnhancedAgent) => void;
  onConfigure?: (agent: EnhancedAgent) => void;
  onAddToTeam?: (agent: EnhancedAgent) => void;
  showInteractionConstraints?: boolean;
  className?: string;
}

const statusConfig: Record<AgentStatus, { color: string; label: string }> = {
  idle: { color: 'bg-green-500', label: 'Available' },
  active: { color: 'bg-blue-500', label: 'Active' },
  busy: { color: 'bg-yellow-500', label: 'Busy' },
  offline: { color: 'bg-slate-400', label: 'Offline' },
};

/**
 * VitalAgentCardEnhanced - Enhanced agent display with 5-Level Agent OS features
 * 
 * New features vs original VitalAgentCard:
 * - Level badge with L1-L5 styling and tooltips
 * - Personality type badge
 * - Context display (regions, domains, TAs, phases)
 * - Interaction constraints (L4/L5 not conversational)
 * - Minimal variant for lists
 * 
 * Reference: AGENT_VIEW_PRD_v4.md
 */
export function VitalAgentCardEnhanced({
  agent,
  variant = 'default',
  isSelected = false,
  onSelect,
  onStartChat,
  onViewDetails,
  onConfigure,
  onAddToTeam,
  showInteractionConstraints = true,
  className,
}: VitalAgentCardEnhancedProps) {
  const status = statusConfig[agent.status];
  const isConversational = isConversationalLevel(agent.level);

  // Minimal variant - just for lists/autocomplete
  if (variant === 'minimal') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 p-1.5 rounded transition-colors cursor-pointer',
          isSelected ? 'bg-primary/10' : 'hover:bg-muted/50',
          className
        )}
        onClick={() => onSelect?.(agent)}
      >
        <Avatar className="h-6 w-6">
          {agent.avatar ? (
            <AvatarImage src={agent.avatar} alt={agent.name} />
          ) : (
            <AvatarFallback className="text-xs">
              {agent.name[0]}
            </AvatarFallback>
          )}
        </Avatar>
        <span className="text-sm truncate flex-1">{agent.displayName || agent.name}</span>
        <VitalLevelBadge level={agent.level} variant="compact" showTooltip={false} />
        {isSelected && <CheckCircle className="h-3 w-3 text-primary" />}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-2 rounded-lg border transition-colors cursor-pointer',
          isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
          !isConversational && 'opacity-75',
          className
        )}
        onClick={() => onSelect?.(agent)}
      >
        <div className="relative">
          <Avatar className="h-8 w-8">
            {agent.avatar ? (
              <AvatarImage src={agent.avatar} alt={agent.name} />
            ) : (
              <AvatarFallback>{agent.name[0]}</AvatarFallback>
            )}
          </Avatar>
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
              status.color
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">
              {agent.displayName || agent.name}
            </span>
            <VitalLevelBadge level={agent.level} variant="compact" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{agent.domain}</span>
            {agent.personality && (
              <VitalPersonalityBadge
                personality={agent.personality}
                variant="compact"
                showIcon={false}
                showTooltip={false}
              />
            )}
          </div>
        </div>

        {isSelected && <CheckCircle className="h-4 w-4 text-primary shrink-0" />}
      </div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div
        className={cn(
          'border rounded-lg p-4 space-y-4',
          isSelected && 'border-primary bg-primary/5',
          !isConversational && 'border-dashed',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                {agent.avatar ? (
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                ) : (
                  <AvatarFallback className="text-lg">
                    {agent.name[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background',
                  status.color
                )}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{agent.displayName || agent.name}</h4>
                <VitalLevelBadge level={agent.level} />
              </div>
              <p className="text-sm text-muted-foreground">{agent.domain}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails?.(agent)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {isConversational && (
                <>
                  <DropdownMenuItem onClick={() => onStartChat?.(agent)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onConfigure?.(agent)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddToTeam?.(agent)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add to Team
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSelect?.(agent)}>
                {isSelected ? 'Deselect' : 'Select'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Personality */}
        {agent.personality && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Personality:</span>
            <VitalPersonalityBadge personality={agent.personality} showTemperature />
          </div>
        )}

        {/* Description */}
        {agent.description && (
          <p className="text-sm text-muted-foreground">{agent.description}</p>
        )}

        {/* Context */}
        {agent.context && (
          <div className="space-y-2">
            {agent.context.regions && agent.context.regions.length > 0 && (
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {agent.context.regions.map((region) => (
                    <Badge key={region} variant="outline" className="text-xs py-0">
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {agent.context.domains && agent.context.domains.length > 0 && (
              <div className="flex items-center gap-2">
                <Folder className="h-3 w-3 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {agent.context.domains.map((domain) => (
                    <Badge key={domain} variant="outline" className="text-xs py-0">
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {agent.context.therapeuticAreas && agent.context.therapeuticAreas.length > 0 && (
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {agent.context.therapeuticAreas.slice(0, 3).map((ta) => (
                    <Badge key={ta} variant="outline" className="text-xs py-0">
                      {ta}
                    </Badge>
                  ))}
                  {agent.context.therapeuticAreas.length > 3 && (
                    <Badge variant="outline" className="text-xs py-0">
                      +{agent.context.therapeuticAreas.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {agent.context.phases && agent.context.phases.length > 0 && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {agent.context.phases.map((phase) => (
                    <Badge key={phase} variant="outline" className="text-xs py-0">
                      {phase}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Capabilities */}
        {agent.capabilities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.slice(0, 4).map((cap) => (
              <Badge key={cap} variant="secondary" className="text-xs">
                {cap}
              </Badge>
            ))}
            {agent.capabilities.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{agent.capabilities.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Metrics */}
        {agent.metrics && (
          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="font-medium">{agent.metrics.tasksCompleted}</span>
              </div>
              <span className="text-xs text-muted-foreground">Tasks</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3 text-blue-500" />
                <span className="font-medium">{agent.metrics.successRate}%</span>
              </div>
              <span className="text-xs text-muted-foreground">Success</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-3 w-3 text-orange-500" />
                <span className="font-medium">{agent.metrics.avgResponseTime}s</span>
              </div>
              <span className="text-xs text-muted-foreground">Avg Time</span>
            </div>
          </div>
        )}

        {/* Rating */}
        {agent.metrics?.rating && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < agent.metrics!.rating!
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-muted-foreground'
                )}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">
              ({agent.metrics.rating.toFixed(1)})
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isConversational ? (
            <>
              <Button
                variant={isSelected ? 'secondary' : 'default'}
                className="flex-1"
                onClick={() => onStartChat?.(agent)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
              {onAddToTeam && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onAddToTeam(agent)}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onViewDetails?.(agent)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Specs
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Workers and Tools are stateless utilities, not conversational agents.
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        'border rounded-lg p-3 transition-colors cursor-pointer',
        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
        !isConversational && 'border-dashed opacity-90',
        className
      )}
      onClick={() => onSelect?.(agent)}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            {agent.avatar ? (
              <AvatarImage src={agent.avatar} alt={agent.name} />
            ) : (
              <AvatarFallback>{agent.name[0]}</AvatarFallback>
            )}
          </Avatar>
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
              status.color
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{agent.displayName || agent.name}</span>
            <VitalLevelBadge level={agent.level} variant="compact" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground truncate">{agent.domain}</p>
            {agent.personality && (
              <VitalPersonalityBadge
                personality={agent.personality}
                variant="compact"
                showIcon={false}
              />
            )}
          </div>
        </div>

        {isSelected && <CheckCircle className="h-5 w-5 text-primary shrink-0" />}
      </div>

      {agent.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {agent.capabilities.slice(0, 3).map((cap) => (
            <Badge key={cap} variant="secondary" className="text-xs py-0">
              {cap}
            </Badge>
          ))}
        </div>
      )}

      {/* Non-conversational indicator */}
      {showInteractionConstraints && !isConversational && (
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>View specs only - shared utility</span>
        </div>
      )}
    </div>
  );
}

export default VitalAgentCardEnhanced;
