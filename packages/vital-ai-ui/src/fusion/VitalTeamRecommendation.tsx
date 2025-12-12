'use client';

import { cn } from '../lib/utils';
import { 
  Users, 
  CheckCircle, 
  Sparkles,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Progress } from '@vital/ui';

type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4';

interface RecommendedAgent {
  id: string;
  name: string;
  level: AgentLevel;
  role: string;
  avatar?: string;
  matchScore: number;
  reasons: string[];
  historicalSuccess?: number;
}

interface VitalTeamRecommendationProps {
  agents: RecommendedAgent[];
  overallConfidence: number;
  reasoning: string;
  estimatedTime?: string;
  onAccept?: () => void;
  onModify?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
  className?: string;
}

const levelColors: Record<AgentLevel, string> = {
  L1: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 ring-purple-500',
  L2: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 ring-blue-500',
  L3: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 ring-green-500',
  L4: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 ring-orange-500',
};

/**
 * VitalTeamRecommendation - Team recommendation card
 * 
 * Shows AI-recommended team composition with confidence scores,
 * match reasons, and accept/modify/reject actions.
 */
export function VitalTeamRecommendation({
  agents,
  overallConfidence,
  reasoning,
  estimatedTime,
  onAccept,
  onModify,
  onReject,
  isLoading = false,
  className
}: VitalTeamRecommendationProps) {
  const confidenceColor = overallConfidence >= 0.8 
    ? 'text-green-600' 
    : overallConfidence >= 0.5 
      ? 'text-yellow-600' 
      : 'text-red-600';
  
  return (
    <div className={cn(
      "border rounded-lg overflow-hidden",
      "bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-950/30",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b bg-white/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-purple-100 dark:bg-purple-900">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-medium">Recommended Team</h4>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={confidenceColor}>
              {(overallConfidence * 100).toFixed(0)}% confidence
            </Badge>
            {estimatedTime && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                ~{estimatedTime}
              </Badge>
            )}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{reasoning}</p>
      </div>
      
      {/* Team members */}
      <div className="p-4 space-y-3">
        {agents.map((agent, index) => (
          <div 
            key={agent.id}
            className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border"
          >
            {/* Avatar with level ring */}
            <div className="relative">
              <Avatar className={cn(
                "h-10 w-10 ring-2",
                levelColors[agent.level].split(' ').pop()
              )}>
                {agent.avatar ? (
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                ) : (
                  <AvatarFallback>{agent.name[0]}</AvatarFallback>
                )}
              </Avatar>
              <Badge 
                className={cn(
                  "absolute -bottom-1 -right-1 h-5 w-5 p-0 justify-center text-xs",
                  levelColors[agent.level]
                )}
              >
                {agent.level}
              </Badge>
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{agent.name}</span>
                {index === 0 && (
                  <Badge variant="outline" className="text-xs">Lead</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{agent.role}</p>
              
              {/* Reasons */}
              <div className="flex flex-wrap gap-1 mt-1">
                {agent.reasons.slice(0, 2).map((reason, i) => (
                  <span 
                    key={i}
                    className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Scores */}
            <div className="text-right space-y-1">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span className="text-sm font-medium">
                  {(agent.matchScore * 100).toFixed(0)}%
                </span>
              </div>
              {agent.historicalSuccess !== undefined && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  {agent.historicalSuccess}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="p-4 border-t bg-muted/30 flex gap-2">
        {onReject && (
          <Button
            variant="ghost"
            onClick={onReject}
            disabled={isLoading}
            className="text-muted-foreground"
          >
            Reject
          </Button>
        )}
        <div className="flex-1" />
        {onModify && (
          <Button
            variant="outline"
            onClick={onModify}
            disabled={isLoading}
          >
            Modify Team
          </Button>
        )}
        {onAccept && (
          <Button
            onClick={onAccept}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Accept Team
          </Button>
        )}
      </div>
    </div>
  );
}

export default VitalTeamRecommendation;
