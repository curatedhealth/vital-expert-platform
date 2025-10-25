/**
 * Collaboration Panel Component
 * Shows multi-agent collaboration progress and consensus building
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Brain,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Eye,
  MessageSquare,
  Target
} from 'lucide-react';
import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/ui/collapsible';
import { Progress } from '@/shared/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/services/utils';
import type {
  CollaborationState,
  ConsensusResult,
  Agent,
  AgentResponse,
  Conflict
} from '@/types/chat.types';

interface CollaborationPanelProps {
  state: CollaborationState;
  consensus?: ConsensusResult;
  className?: string;
  showDetails?: boolean;
}

const AgentStatusBadge: React.FC<{ status: string }> = ({ status }) => {

    pending: { color: 'bg-gray-100 text-gray-700', icon: Clock },
    analyzing: { color: 'bg-blue-100 text-blue-700', icon: Brain },
    'building-consensus': { color: 'bg-purple-100 text-purple-700', icon: Users },
    completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle }
  };

  return (
    <Badge variant="outline" className={cn('text-xs', config.color)}>
      <StatusIcon className="h-3 w-3 mr-1" />
      {status.replace('-', ' ')}
    </Badge>
  );
};

const AgentResponseCard: React.FC<{
  response: AgentResponse;
  onViewDetails?: () => void;
}> = ({ response, onViewDetails }) => {

    const iconMap: Record<string, string> = {
      'digital-therapeutics-expert': '💊',
      'fda-regulatory-strategist': '🏛️',
      'clinical-trial-designer': '🔬',
      'medical-safety-officer': '🛡️',
      'ai-ml-clinical-specialist': '🤖'
    };
    return iconMap[agent.type] || '👨‍⚕️';
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 border">
            <AvatarFallback className="text-xs">
              {getAgentIcon(response.agent)}
            </AvatarFallback>
            {response.agent.icon && (
              <AvatarImage src={response.agent.icon} alt={response.agent.name} />
            )}
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{response.agent.name}</h4>
              <AgentStatusBadge status={response.status} />
            </div>

            {response.preview && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {response.preview}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Confidence:
                </span>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(response.confidence * 100)}%
                </Badge>
              </div>

              {response.status !== 'composing' && response.status !== 'thinking' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewDetails}
                  className="h-6 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}
            </div>

            {response.progress > 0 && response.progress < 100 && (
              <div className="space-y-1">
                <Progress value={response.progress} className="h-1" />
                <div className="text-xs text-muted-foreground text-right">
                  {response.progress.toFixed(0)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ConflictIndicator: React.FC<{ conflicts: Conflict[] }> = ({ conflicts }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (conflicts.length === 0) return null;

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
      <CardContent className="p-4">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-sm">
                  {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} detected
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          <div className="mt-2 flex items-center gap-2">
            {highSeverityCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {highSeverityCount} high
              </Badge>
            )}
            {mediumSeverityCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {mediumSeverityCount} medium
              </Badge>
            )}
            {lowSeverityCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {lowSeverityCount} low
              </Badge>
            )}
          </div>

          <CollapsibleContent>
            <div className="mt-3 space-y-2">
              {conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="p-2 bg-background rounded border text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge
                      variant={
                        conflict.severity === 'high' ? 'destructive' :
                        conflict.severity === 'medium' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {conflict.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {conflict.severity}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{conflict.description}</p>
                  {conflict.resolution && (
                    <p className="mt-1 text-green-700 dark:text-green-300">
                      <strong>Resolution:</strong> {conflict.resolution}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

const ConsensusIndicator: React.FC<{ consensusLevel: number }> = ({ consensusLevel }) => {

    if (level >= 0.8) return 'text-green-600';
    if (level >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

    if (level >= 0.8) return 'Strong consensus';
    if (level >= 0.6) return 'Moderate consensus';
    if (level >= 0.4) return 'Weak consensus';
    return 'No consensus';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">Agent Consensus</span>
          <span className={cn('text-sm font-medium', getColor(consensusLevel))}>
            {percentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full',
              consensusLevel >= 0.8 ? 'bg-green-500' :
              consensusLevel >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {getLabel(consensusLevel)}
        </p>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              consensusLevel >= 0.8 ? 'bg-green-100 text-green-600' :
              consensusLevel >= 0.6 ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            )}>
              <Target className="h-4 w-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Consensus score: {percentage}%</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  state,
  consensus,
  className,
  showDetails = false
}) => {
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

  if (!state.isActive) return null;

  return (
    <Card className={cn('border-blue-200 bg-blue-50/30 dark:bg-blue-900/10', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            Expert Collaboration
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {state.activeAgents.length} experts
            </Badge>
            <AgentStatusBadge status={state.status} />
          </div>
        </div>

        {state.status !== 'pending' && (
          <ConsensusIndicator consensusLevel={state.consensusLevel} />
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active agents responses */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-3 w-3" />
            Agent Responses
          </h4>

          <div className="grid gap-2">
            <AnimatePresence>
              {state.responses.map((response) => (
                <motion.div
                  key={response.agentId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <AgentResponseCard
                    response={response}
                    onViewDetails={() => setExpandedResponse(
                      expandedResponse === response.agentId ? null : response.agentId
                    )}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Conflicts */}
        {state.conflicts && state.conflicts.length > 0 && (
          <ConflictIndicator conflicts={state.conflicts} />
        )}

        {/* Consensus results */}
        {consensus && state.status === 'completed' && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">Consensus Reached</span>
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                  {Math.round(consensus.confidence * 100)}% confidence
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Strategy:</strong> {consensus.resolutionStrategy}
                </p>

                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">Contributing experts:</span>
                  {consensus.contributingAgents.map((agent, index) => (
                    <Badge key={agent.id} variant="secondary" className="text-xs">
                      {agent.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {showDetails && consensus.reasoning && (
                <div className="mt-3 p-2 bg-background rounded border">
                  <p className="text-xs text-muted-foreground">
                    <strong>Reasoning:</strong> {consensus.reasoning}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Progress indicator for active collaboration */}
        {state.status === 'analyzing' || state.status === 'building-consensus' ? (
          <div className="flex items-center gap-2 p-2 bg-background rounded border">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="h-4 w-4 text-blue-600" />
            </motion.div>
            <span className="text-sm text-muted-foreground">
              {state.status === 'analyzing' ? 'Experts analyzing query...' : 'Building consensus...'}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};