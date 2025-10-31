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
  knowledge_domains?: string[]; // Agent Store format
  certifications?: string[];
  experience?: string;
  availability?: 'online' | 'busy' | 'offline';
  responseTime?: number; // in seconds
  averageResponseTime?: number; // in seconds (from stats)
  confidence?: number; // 0-1
  confidenceLevel?: number; // 0-100 (from stats)
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

          {/* Expertise/Capabilities - Display all knowledge_domains with color coding */}
          {(() => {
            const expertiseList = agent.knowledge_domains || agent.expertise || agent.capabilities || [];
            if (expertiseList.length === 0) return null;
            
            const displayedCount = 2;
            const remainingCount = expertiseList.length - displayedCount;
            
            // Color mapping for domains (healthcare-focused)
            const getDomainColor = (domain: string) => {
              const lower = domain.toLowerCase();
              if (lower.includes('regulatory') || lower.includes('fda')) return 'bg-blue-100 text-blue-700 border-blue-200';
              if (lower.includes('clinical') || lower.includes('trial')) return 'bg-green-100 text-green-700 border-green-200';
              if (lower.includes('safety') || lower.includes('pharmacovigilance')) return 'bg-red-100 text-red-700 border-red-200';
              if (lower.includes('market') || lower.includes('access')) return 'bg-purple-100 text-purple-700 border-purple-200';
              return 'bg-gray-100 text-gray-700 border-gray-200';
            };
            
            return (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">Expertise Areas:</h4>
                <div className="flex flex-wrap gap-1">
                  {expertiseList.slice(0, displayedCount).map((domain, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className={cn("text-xs border", getDomainColor(domain))}
                    >
                      {domain}
                    </Badge>
                  ))}
                  {remainingCount > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-xs cursor-help">
                            +{remainingCount} more
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            {expertiseList.slice(displayedCount).map((domain, idx) => (
                              <p key={idx} className="text-xs">{domain}</p>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Full Statistics Grid */}
          {showStats && (
            <div className="space-y-3 pt-3 border-t">
              <div className="grid grid-cols-2 gap-3">
                {/* Response Time with average calculation */}
                {(agent.responseTime !== undefined || agent.averageResponseTime !== undefined) && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Response Time</span>
                    </div>
                    <p className="text-sm font-medium">
                      {(agent.averageResponseTime ?? agent.responseTime ?? 0).toFixed(1)}s avg
                    </p>
                  </div>
                )}

                {/* Success Rate with checkmark indicator */}
                {agent.successRate !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle className={cn(
                        "h-3 w-3",
                        agent.successRate >= 90 ? "text-green-600" :
                        agent.successRate >= 70 ? "text-yellow-600" : "text-red-600"
                      )} />
                      <span>Success Rate</span>
                    </div>
                    <p className="text-sm font-medium">{agent.successRate}%</p>
                    <Progress 
                      value={agent.successRate} 
                      className={cn(
                        "h-1.5",
                        agent.successRate >= 90 ? "[&>div]:bg-green-600" :
                        agent.successRate >= 70 ? "[&>div]:bg-yellow-600" : "[&>div]:bg-red-600"
                      )} 
                    />
                  </div>
                )}

                {/* Satisfaction Score with 5-star visualization */}
                {agent.satisfactionScore !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className={cn(
                        "h-3 w-3",
                        agent.satisfactionScore >= 4.5 ? "text-yellow-500 fill-yellow-500" :
                        agent.satisfactionScore >= 3.5 ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
                      )} />
                      <span>Satisfaction</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium">{agent.satisfactionScore.toFixed(1)}</p>
                      <span className="text-xs text-muted-foreground">/ 5.0</span>
                    </div>
                    {/* Star visualization */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-3 w-3",
                            star <= Math.round(agent.satisfactionScore)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Total Consultations with formatted number */}
                {agent.totalConsultations !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>Consultations</span>
                    </div>
                    <p className="text-sm font-medium">
                      {agent.totalConsultations.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Confidence Progress Bar */}
              {(agent.confidenceLevel !== undefined || agent.confidence !== undefined) && (
                <div className="space-y-1.5 pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Confidence Level</span>
                    <span className="font-semibold">
                      {Math.round(agent.confidenceLevel ?? (agent.confidence ?? 0) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={agent.confidenceLevel ?? (agent.confidence ?? 0) * 100} 
                    className={cn(
                      "h-2",
                      (agent.confidenceLevel ?? (agent.confidence ?? 0) * 100) > 80 ? "[&>div]:bg-green-600" :
                      (agent.confidenceLevel ?? (agent.confidence ?? 0) * 100) >= 50 ? "[&>div]:bg-yellow-600" : "[&>div]:bg-red-600"
                    )} 
                  />
                </div>
              )}
            </div>
          )}

          {/* Certifications & Awards */}
          {agent.certifications && agent.certifications.length > 0 && (
            <div className="space-y-2 pt-3 border-t">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Award className="h-3 w-3" />
                  <span>Certifications</span>
                </div>
                {/* Top-rated indicator for score >= 4.5 */}
                {agent.satisfactionScore !== undefined && agent.satisfactionScore >= 4.5 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-0.5 text-xs text-yellow-600">
                          <Award className="h-3 w-3 fill-yellow-500" />
                          <span className="font-medium">Top-Rated</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Rated {agent.satisfactionScore.toFixed(1)}/5.0 by users</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {agent.certifications.map((cert, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      // Badge variants based on certification type
                      cert.toLowerCase().includes('fda') && "border-blue-300 text-blue-700 bg-blue-50",
                      cert.toLowerCase().includes('iso') && "border-green-300 text-green-700 bg-green-50",
                      cert.toLowerCase().includes('hipaa') && "border-purple-300 text-purple-700 bg-purple-50"
                    )}
                  >
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
