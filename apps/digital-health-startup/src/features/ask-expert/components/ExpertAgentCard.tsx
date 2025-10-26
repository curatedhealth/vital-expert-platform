'use client';

import { motion } from 'framer-motion';
import {
  Award, BookOpen, Clock, MessageSquare, Star,
  TrendingUp, CheckCircle, Activity, Sparkles
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@vital/ui';
import { Progress } from '@vital/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';

interface ExpertAgent {
  id: string;
  name: string;
  type?: string;
  title?: string;
  specialty?: string;
  avatar?: string;
  description: string;
  expertise?: string[];
  capabilities?: string[];
  certifications?: string[];
  experience?: string;
  availability?: 'online' | 'busy' | 'offline';
  responseTime?: number; // in seconds
  confidence?: number; // 0-1
  totalConsultations?: number;
  satisfactionScore?: number; // 0-5
  successRate?: number; // 0-100
  recentTopics?: string[];
}

interface ExpertAgentCardProps {
  agent: ExpertAgent;
  isSelected?: boolean;
  isActive?: boolean;
  onSelect?: (agentId: string) => void;
  variant?: 'compact' | 'detailed' | 'minimal';
  showStats?: boolean;
  className?: string;
}

export function ExpertAgentCard({
  agent,
  isSelected = false,
  isActive = false,
  onSelect,
  variant = 'detailed',
  showStats = true,
  className
}: ExpertAgentCardProps) {

  const availability = agent.availability || 'online';
  const availabilityConfig = {
    online: {
      color: 'bg-green-500',
      text: 'Available',
      pulse: true
    },
    busy: {
      color: 'bg-yellow-500',
      text: 'Busy',
      pulse: false
    },
    offline: {
      color: 'bg-gray-400',
      text: 'Offline',
      pulse: false
    }
  };

  const availabilityStatus = availabilityConfig[availability];

  // Compact variant for inline display
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={cn(
            "cursor-pointer transition-all",
            isSelected && "ring-2 ring-blue-600",
            isActive && "bg-blue-50/50",
            className
          )}
          onClick={() => onSelect?.(agent.id)}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {agent.name.split(' ').map((n: any) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                  availabilityStatus.color,
                  availabilityStatus.pulse && "animate-pulse"
                )} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {agent.specialty || agent.description}
                </p>
              </div>

              {isActive && (
                <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Minimal variant for avatars
  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative cursor-pointer"
              onClick={() => onSelect?.(agent.id)}
            >
              <Avatar className={cn(
                "h-8 w-8",
                isSelected && "ring-2 ring-blue-600 ring-offset-2"
              )}>
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                  {agent.name.split(' ').map((n: any) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white",
                availabilityStatus.color,
                availabilityStatus.pulse && "animate-pulse"
              )} />
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{agent.name}</p>
              <p className="text-xs text-muted-foreground">
                {agent.specialty || agent.description}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200",
          isSelected && "ring-2 ring-blue-600 shadow-lg",
          isActive && "bg-blue-50/50",
          className
        )}
        onClick={() => onSelect?.(agent.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            {/* Avatar & Status */}
            <div className="flex items-start gap-3">
              <div className="relative">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                    {agent.name.split(' ').map((n: any) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white",
                  availabilityStatus.color,
                  availabilityStatus.pulse && "animate-pulse"
                )} />
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-base leading-none">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {agent.title || agent.specialty || agent.type}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className={cn(
                    "inline-block w-2 h-2 rounded-full",
                    availabilityStatus.color
                  )} />
                  <span>{availabilityStatus.text}</span>
                </div>
              </div>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-blue-600"
              >
                <CheckCircle className="h-5 w-5" />
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-foreground line-clamp-2">
            {agent.description}
          </p>

          {/* Expertise/Capabilities */}
          {(agent.expertise || agent.capabilities) && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Expertise:</h4>
              <div className="flex flex-wrap gap-1">
                {(agent.expertise || agent.capabilities || []).slice(0, 4).map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {(agent.expertise || agent.capabilities || []).length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{(agent.expertise || agent.capabilities || []).length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          {showStats && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t">
              {/* Response Time */}
              {agent.responseTime !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Response</span>
                  </div>
                  <p className="text-sm font-medium">{agent.responseTime}s avg</p>
                </div>
              )}

              {/* Total Consultations */}
              {agent.totalConsultations !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    <span>Sessions</span>
                  </div>
                  <p className="text-sm font-medium">{agent.totalConsultations.toLocaleString()}</p>
                </div>
              )}

              {/* Satisfaction Score */}
              {agent.satisfactionScore !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3" />
                    <span>Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium">{agent.satisfactionScore.toFixed(1)}</p>
                    <span className="text-xs text-muted-foreground">/ 5.0</span>
                  </div>
                </div>
              )}

              {/* Success Rate */}
              {agent.successRate !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>Success</span>
                  </div>
                  <p className="text-sm font-medium">{agent.successRate}%</p>
                  <Progress value={agent.successRate} className="h-1" />
                </div>
              )}
            </div>
          )}

          {/* Certifications */}
          {agent.certifications && agent.certifications.length > 0 && (
            <div className="space-y-2 pt-3 border-t">
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Award className="h-3 w-3" />
                <span>Certifications</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {agent.certifications.slice(0, 2).map((cert, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            className="w-full"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(agent.id);
            }}
          >
            {isSelected ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Selected
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Select Expert
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
