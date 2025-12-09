'use client';

import { cn } from '../lib/utils';
import {
  Sparkles,
  ChevronRight,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  Info,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface RecommendationReason {
  factor: string;
  weight: number;
  explanation: string;
}

export interface TemplateRecommendation {
  templateId: string;
  templateName: string;
  matchScore: number; // 0-100
  reasoning: string;
  reasons: RecommendationReason[];
  estimatedTime: string;
  estimatedCost: number;
  agentCount: number;
  highlights?: string[];
}

export interface VitalTemplateRecommendationProps {
  /** Recommendation data */
  recommendation: TemplateRecommendation;
  /** The user's original query */
  userQuery?: string;
  /** Whether to show detailed reasoning */
  showReasoning?: boolean;
  /** Whether to show match factors */
  showFactors?: boolean;
  /** Callback when template selected */
  onSelect: (templateId: string) => void;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Callback for feedback */
  onFeedback?: (templateId: string, helpful: boolean) => void;
  /** Custom class name */
  className?: string;
}

/**
 * VitalTemplateRecommendation - Proactive Template Suggestion
 * 
 * Proactive UI card suggesting the best template for a user's vague query.
 * Shows "87% Match" badge and "Why this fits" explanation.
 * 
 * Used with AI SDK to recommend missions based on user queries.
 * 
 * @example
 * ```tsx
 * <VitalTemplateRecommendation
 *   recommendation={{
 *     templateId: 'drug-interaction',
 *     templateName: 'Drug Interaction Analysis',
 *     matchScore: 87,
 *     reasoning: 'Your query mentions drug combinations...',
 *     reasons: [
 *       { factor: 'Query Keywords', weight: 40, explanation: 'Mentions drug interactions' },
 *     ]
 *   }}
 *   userQuery="What happens when I take aspirin with ibuprofen?"
 *   onSelect={(id) => startMission(id)}
 * />
 * ```
 */
export function VitalTemplateRecommendation({
  recommendation,
  userQuery,
  showReasoning = true,
  showFactors = false,
  onSelect,
  onDismiss,
  onFeedback,
  className,
}: VitalTemplateRecommendationProps) {
  const {
    templateId,
    templateName,
    matchScore,
    reasoning,
    reasons,
    estimatedTime,
    estimatedCost,
    agentCount,
    highlights,
  } = recommendation;

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 80) return 'Great Match';
    if (score >= 70) return 'Good Match';
    if (score >= 60) return 'Partial Match';
    return 'Possible Match';
  };

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {/* Sparkle accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recommended Mission</p>
              <CardTitle className="text-lg">{templateName}</CardTitle>
            </div>
          </div>

          {/* Match Score Badge */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={cn('text-lg font-bold px-3', getMatchColor(matchScore))}>
                  {matchScore}%
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getMatchLabel(matchScore)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Match Progress */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Match Confidence</span>
            <span className={cn('font-medium', getMatchColor(matchScore).split(' ')[0])}>
              {getMatchLabel(matchScore)}
            </span>
          </div>
          <Progress value={matchScore} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* User Query Context */}
        {userQuery && (
          <div className="p-3 rounded-lg bg-muted/50 border-l-2 border-primary">
            <p className="text-xs text-muted-foreground mb-1">Your Query</p>
            <p className="text-sm italic">"{userQuery}"</p>
          </div>
        )}

        {/* Why This Fits */}
        {showReasoning && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Why this fits</span>
            </div>
            <p className="text-sm text-muted-foreground">{reasoning}</p>
          </div>
        )}

        {/* Match Factors */}
        {showFactors && reasons.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Match Factors</span>
            {reasons.map((reason, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{reason.factor}</span>
                    <span className="text-muted-foreground">{reason.weight}%</span>
                  </div>
                  <Progress value={reason.weight} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Highlights */}
        {highlights && highlights.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded"
              >
                <CheckCircle className="h-3 w-3" />
                {highlight}
              </div>
            ))}
          </div>
        )}

        {/* Estimates */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {estimatedTime}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {agentCount} agents
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            ~${estimatedCost.toFixed(2)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-3 border-t bg-muted/30 pt-4">
        <div className="flex items-center gap-2 w-full">
          {onDismiss && (
            <Button variant="outline" className="flex-1" onClick={onDismiss}>
              Not what I need
            </Button>
          )}
          <Button className="flex-1" onClick={() => onSelect(templateId)}>
            Start Mission
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Feedback */}
        {onFeedback && (
          <div className="flex items-center justify-center gap-4 w-full pt-2 border-t">
            <span className="text-xs text-muted-foreground">Was this helpful?</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onFeedback(templateId, true)}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onFeedback(templateId, false)}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default VitalTemplateRecommendation;
