'use client';

import { cn } from '@/lib/utils';
import { 
  User, 
  CheckCircle, 
  Clock, 
  Zap,
  MoreHorizontal,
  Star,
  TrendingUp
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
type AgentStatus = 'idle' | 'active' | 'busy' | 'offline';

interface AgentMetrics {
  tasksCompleted: number;
  successRate: number;
  avgResponseTime: number;
  rating?: number;
}

interface Agent {
  id: string;
  name: string;
  level: AgentLevel;
  domain: string;
  description?: string;
  avatar?: string;
  status: AgentStatus;
  capabilities: string[];
  metrics?: AgentMetrics;
}

interface VitalAgentCardProps {
  agent: Agent;
  variant?: 'default' | 'compact' | 'detailed';
  isSelected?: boolean;
  onSelect?: (agent: Agent) => void;
  onViewDetails?: (agent: Agent) => void;
  className?: string;
}

const levelColors: Record<AgentLevel, string> = {
  L1: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  L2: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  L3: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  L4: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  L5: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const statusConfig: Record<AgentStatus, { color: string; label: string }> = {
  idle: { color: 'bg-green-500', label: 'Available' },
  active: { color: 'bg-blue-500', label: 'Active' },
  busy: { color: 'bg-yellow-500', label: 'Busy' },
  offline: { color: 'bg-slate-400', label: 'Offline' },
};

/**
 * VitalAgentCard - Agent display card component
 * 
 * Shows agent information with level, status, capabilities,
 * and performance metrics in various display variants.
 */
export function VitalAgentCard({
  agent,
  variant = 'default',
  isSelected = false,
  onSelect,
  onViewDetails,
  className
}: VitalAgentCardProps) {
  const status = statusConfig[agent.status];
  
  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          "flex items-center gap-3 p-2 rounded-lg border transition-colors cursor-pointer",
          isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50",
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
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
            status.color
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{agent.name}</span>
            <Badge className={cn("text-xs px-1 py-0", levelColors[agent.level])}>
              {agent.level}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">{agent.domain}</span>
        </div>
        
        {isSelected && <CheckCircle className="h-4 w-4 text-primary shrink-0" />}
      </div>
    );
  }
  
  if (variant === 'detailed') {
    return (
      <div className={cn(
        "border rounded-lg p-4 space-y-4",
        isSelected && "border-primary bg-primary/5",
        className
      )}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                {agent.avatar ? (
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                ) : (
                  <AvatarFallback className="text-lg">{agent.name[0]}</AvatarFallback>
                )}
              </Avatar>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background",
                status.color
              )} />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{agent.name}</h4>
                <Badge className={levelColors[agent.level]}>{agent.level}</Badge>
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
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelect?.(agent)}>
                {isSelected ? 'Deselect' : 'Select'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Description */}
        {agent.description && (
          <p className="text-sm text-muted-foreground">{agent.description}</p>
        )}
        
        {/* Capabilities */}
        {agent.capabilities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.slice(0, 4).map((cap) => (
              <Badge key={cap} variant="outline" className="text-xs">
                {cap}
              </Badge>
            ))}
            {agent.capabilities.length > 4 && (
              <Badge variant="outline" className="text-xs">
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
                  "h-4 w-4",
                  i < agent.metrics!.rating! 
                    ? "text-yellow-500 fill-yellow-500" 
                    : "text-muted-foreground"
                )} 
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">
              ({agent.metrics.rating.toFixed(1)})
            </span>
          </div>
        )}
        
        {/* Action */}
        {onSelect && (
          <Button
            variant={isSelected ? "secondary" : "outline"}
            className="w-full"
            onClick={() => onSelect(agent)}
          >
            {isSelected ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Selected
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Select Agent
              </>
            )}
          </Button>
        )}
      </div>
    );
  }
  
  // Default variant
  return (
    <div 
      className={cn(
        "border rounded-lg p-3 transition-colors cursor-pointer",
        isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50",
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
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
            status.color
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{agent.name}</span>
            <Badge className={cn("text-xs", levelColors[agent.level])}>
              {agent.level}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{agent.domain}</p>
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
    </div>
  );
}

export default VitalAgentCard;
