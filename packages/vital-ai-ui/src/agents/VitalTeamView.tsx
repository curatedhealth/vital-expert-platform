'use client';

import { cn } from '../../lib/utils';
import { 
  Users, 
  ChevronRight, 
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';

type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

interface TeamMember {
  id: string;
  name: string;
  level: AgentLevel;
  role: string;
  avatar?: string;
  isLead?: boolean;
}

interface TeamMetrics {
  totalTasks: number;
  completedTasks: number;
  avgResponseTime: number;
  successRate: number;
}

interface VitalTeamViewProps {
  name: string;
  members: TeamMember[];
  metrics?: TeamMetrics;
  isActive?: boolean;
  onViewDetails?: () => void;
  variant?: 'card' | 'inline' | 'expanded';
  className?: string;
}

const levelColors: Record<AgentLevel, string> = {
  L1: 'ring-purple-500',
  L2: 'ring-blue-500',
  L3: 'ring-green-500',
  L4: 'ring-orange-500',
  L5: 'ring-slate-500',
};

/**
 * VitalTeamView - Team composition display component
 * 
 * Shows team members with their roles, levels, and optional
 * team performance metrics.
 */
export function VitalTeamView({
  name,
  members,
  metrics,
  isActive = false,
  onViewDetails,
  variant = 'card',
  className
}: VitalTeamViewProps) {
  const leadMember = members.find(m => m.isLead);
  const otherMembers = members.filter(m => !m.isLead);
  
  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-center gap-3",
        className
      )}>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{name}</span>
        </div>
        
        <div className="flex -space-x-2">
          {members.slice(0, 4).map((member) => (
            <Avatar 
              key={member.id} 
              className={cn(
                "h-6 w-6 border-2 border-background ring-1",
                levelColors[member.level]
              )}
            >
              {member.avatar ? (
                <AvatarImage src={member.avatar} alt={member.name} />
              ) : (
                <AvatarFallback className="text-xs">
                  {member.name[0]}
                </AvatarFallback>
              )}
            </Avatar>
          ))}
          {members.length > 4 && (
            <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
              +{members.length - 4}
            </div>
          )}
        </div>
        
        {isActive && (
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )}
      </div>
    );
  }
  
  if (variant === 'expanded') {
    return (
      <div className={cn(
        "border rounded-lg p-4 space-y-4",
        isActive && "border-primary",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">{name}</h4>
            {isActive && (
              <Badge variant="secondary" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
          <Badge variant="outline">{members.length} members</Badge>
        </div>
        
        {/* Lead */}
        {leadMember && (
          <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
            <Avatar className={cn(
              "h-10 w-10 ring-2",
              levelColors[leadMember.level]
            )}>
              {leadMember.avatar ? (
                <AvatarImage src={leadMember.avatar} alt={leadMember.name} />
              ) : (
                <AvatarFallback>{leadMember.name[0]}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{leadMember.name}</span>
                <Badge variant="outline" className="text-xs">Lead</Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {leadMember.level} · {leadMember.role}
              </span>
            </div>
          </div>
        )}
        
        {/* Members */}
        <div className="space-y-2">
          {otherMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <Avatar className={cn(
                "h-8 w-8 ring-1",
                levelColors[member.level]
              )}>
                {member.avatar ? (
                  <AvatarImage src={member.avatar} alt={member.name} />
                ) : (
                  <AvatarFallback className="text-sm">
                    {member.name[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm">{member.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {member.level} · {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-3 gap-4 pt-3 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="font-medium">
                  {metrics.completedTasks}/{metrics.totalTasks}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">Tasks</span>
            </div>
            <div className="text-center">
              <span className="font-medium">{metrics.successRate}%</span>
              <div className="text-xs text-muted-foreground">Success</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-3 w-3 text-blue-500" />
                <span className="font-medium">{metrics.avgResponseTime}s</span>
              </div>
              <span className="text-xs text-muted-foreground">Avg Time</span>
            </div>
          </div>
        )}
        
        {onViewDetails && (
          <Button variant="outline" className="w-full" onClick={onViewDetails}>
            View Details
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    );
  }
  
  // Card variant (default)
  return (
    <div 
      className={cn(
        "border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors",
        isActive && "border-primary bg-primary/5",
        className
      )}
      onClick={onViewDetails}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{name}</span>
        </div>
        {isActive && (
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {members.slice(0, 5).map((member) => (
            <Avatar 
              key={member.id} 
              className={cn(
                "h-7 w-7 border-2 border-background ring-1",
                levelColors[member.level]
              )}
            >
              {member.avatar ? (
                <AvatarImage src={member.avatar} alt={member.name} />
              ) : (
                <AvatarFallback className="text-xs">
                  {member.name[0]}
                </AvatarFallback>
              )}
            </Avatar>
          ))}
          {members.length > 5 && (
            <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
              +{members.length - 5}
            </div>
          )}
        </div>
        
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

export default VitalTeamView;
