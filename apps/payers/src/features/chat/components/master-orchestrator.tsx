'use client';

import {
  GitBranch,
  Brain,
  Target,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Route,
  Settings
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@vital/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui/components/card';
import { Progress } from '@vital/ui/components/progress';
import { cn } from '@/shared/services/utils';

import { ChatMode } from './chat-mode-selector';

interface OrchestrationStep {
  id: string;
  title: string;
  description: string;
  type: 'triage' | 'analysis' | 'routing' | 'execution' | 'validation' | 'delivery';
  status: 'pending' | 'processing' | 'complete' | 'error';
  duration?: number;
  result?: any;
  confidence?: number;
}

interface RoutingDecision {
  recommendedMode: ChatMode;
  confidence: number;
  reasoning: string;
  alternativeOptions: Array<{
    mode: ChatMode;
    score: number;
    reason: string;
  }>;
  requiredAgents?: string[];
  estimatedComplexity: 'low' | 'medium' | 'high' | 'very-high';
}

interface MasterOrchestratorProps {
  query: string;
  onRoutingComplete: (decision: RoutingDecision) => void;
  onStepComplete?: (step: OrchestrationStep) => void;
  className?: string;
}

const ORCHESTRATION_STEPS: Omit<OrchestrationStep, 'status' | 'duration' | 'result' | 'confidence'>[] = [
  {
    id: 'intake',
    title: 'Query Analysis',
    description: 'Analyzing query complexity, domain, and intent',
    type: 'triage'
  },
  {
    id: 'context',
    title: 'Context Assessment',
    description: 'Evaluating available knowledge base and agent capabilities',
    type: 'analysis'
  },
  {
    id: 'routing',
    title: 'Intelligent Routing',
    description: 'Determining optimal execution strategy and mode',
    type: 'routing'
  },
  {
    id: 'preparation',
    title: 'Resource Preparation',
    description: 'Preparing agents, prompts, and execution environment',
    type: 'execution'
  },
  {
    id: 'validation',
    title: 'Quality Validation',
    description: 'Validating routing decision and readiness',
    type: 'validation'
  }
];

export function MasterOrchestrator({ query, onRoutingComplete, onStepComplete, className }: MasterOrchestratorProps) {
  const [steps, setSteps] = useState<OrchestrationStep[]>(
    ORCHESTRATION_STEPS.map(step => ({ ...step, status: 'pending' as const }))
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [routingDecision, setRoutingDecision] = useState<RoutingDecision | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (query && !isProcessing) {
      startOrchestration();
    }
  }, [query, isProcessing]);

    setIsProcessing(true);

    for (let __i = 0; i < steps.length; i++) {
      await processStep(i);
      setCurrentStep(i + 1);
    }

    // Generate final routing decision

    setRoutingDecision(decision);
    onRoutingComplete(decision);

    setIsProcessing(false);
  };

    return new Promise((resolve) => {
      // Mark step as processing
      setSteps(prev => prev.map((step, index) =>
        index === stepIndex ? { ...step, status: 'processing' } : step
      ));

      // Simulate processing time

      setTimeout(() => {
        // eslint-disable-next-line security/detect-object-injection

        setSteps(prev => prev.map((step, index) =>
          index === stepIndex
            ? {
                ...step,
                status: 'complete',
                duration: Math.floor(processingTime),
                result: result.data,
                confidence: result.confidence
              }
            : step
        ));

        if (onStepComplete) {
          // eslint-disable-next-line security/detect-object-injection
          onStepComplete(steps[stepIndex]);
        }

        resolve();
      }, processingTime);
    });
  };

    switch (step.id) {
      case 'intake':
        return analyzeQueryComplexity(query);
      case 'context':
        return assessContext(query);
      case 'routing':
        return determineRouting(query);
      case 'preparation':
        return prepareResources(query);
      case 'validation':
        return validateDecision(query);
      default:
        return { data: 'Processed', confidence: 85 };
    }
  };

    // Simple heuristics for demo

                      query.length > 100 ? 'medium' : 'low';

    return {
      data: {
        complexity,
        hasMultipleConcepts,
        hasQuestions,
        hasComparison,
        wordCount: query.split(' ').length
      },
      confidence: 92
    };
  };

      query.toLowerCase().includes(domain) ||
      query.toLowerCase().includes(domain.replace('-', ' '))
    );

    return {
      data: {
        availableAgents: 12,
        relevantKnowledge: Math.floor(Math.random() * 50) + 20,
        detectedDomains,
        contextRichness: detectedDomains.length > 1 ? 'high' : 'medium'
      },
      confidence: 88
    };
  };

    // Simple routing logic

    let recommendedMode: ChatMode = 'single-agent';
    if (needsMultipleExperts) recommendedMode = 'virtual-panel';
    else if (isWorkflow) recommendedMode = 'orchestrated-workflow';
    else if (isGoalOriented) recommendedMode = 'jobs-framework';

    return {
      data: {
        recommendedMode,
        factors: { isComplex, needsMultipleExperts, isWorkflow, isGoalOriented }
      },
      confidence: 85
    };
  };

    return {
      data: {
        agentsLoaded: 5,
        promptsGenerated: 3,
        knowledgeIndexed: Math.floor(Math.random() * 100) + 50
      },
      confidence: 95
    };
  };

    return {
      data: {
        validationPassed: true,
        qualityScore: Math.floor(Math.random() * 20) + 80,
        readinessLevel: 'high'
      },
      confidence: 93
    };
  };

    // Combine step results to make routing decision

    return {
      recommendedMode: routingResult?.recommendedMode || 'single-agent',
      confidence: 87,
      reasoning: "Based on query analysis, this appears to require multi-expert collaboration for optimal results. The complexity level and domain requirements suggest a panel approach would provide more comprehensive insights.",
      alternativeOptions: [
        {
          mode: 'single-agent',
          score: 75,
          reason: "Direct expert consultation could handle this efficiently"
        },
        {
          mode: 'orchestrated-workflow',
          score: 65,
          reason: "Could be structured as a step-by-step process"
        }
      ],
      requiredAgents: ['regulatory-expert', 'clinical-researcher', 'medical-officer'],
      estimatedComplexity: complexityResult?.complexity || 'medium'
    };
  };

    return Math.floor((completedSteps / steps.length) * 100);
  };

    switch (step.type) {
      case 'triage': return Brain;
      case 'analysis': return Target;
      case 'routing': return Route;
      case 'execution': return Zap;
      case 'validation': return CheckCircle;
      default: return Settings;
    }
  };

    switch (step.status) {
      case 'complete': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Master Orchestrator System</CardTitle>
              <p className="text-sm text-muted-foreground">Intelligent routing and triage</p>
            </div>
          </div>
          <Badge variant={isProcessing ? 'default' : 'secondary'}>
            {isProcessing ? 'Processing' : 'Ready'}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{getOverallProgress()}%</span>
          </div>
          <Progress value={getOverallProgress()} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Query Display */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-2">Processing Query:</h4>
            <p className="text-sm">{query}</p>
          </CardContent>
        </Card>

        {/* Orchestration Steps */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Orchestration Pipeline:</h4>
          <div className="space-y-3">
            {steps.map((step, index) => {

              return (
                <div key={step.id} className="flex items-start space-x-3">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                    step.status === 'complete' && "bg-green-100 border-green-500",
                    step.status === 'processing' && "bg-blue-100 border-blue-500 animate-pulse",
                    step.status === 'error' && "bg-red-100 border-red-500",
                    step.status === 'pending' && "bg-muted border-muted-foreground"
                  )}>
                    {step.status === 'complete' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {step.status === 'processing' && <Icon className="h-4 w-4 text-blue-600 animate-pulse" />}
                    {step.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {step.status === 'pending' && <Icon className="h-4 w-4 text-muted-foreground" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-sm">{step.title}</h5>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {step.duration && (
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {step.duration}ms
                          </span>
                        )}
                        {step.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {step.confidence}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {step.result && (
                      <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                        <pre className="whitespace-pre-wrap text-muted-foreground">
                          {JSON.stringify(step.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {index < steps.length - 1 && (
                    <div className="absolute left-4 mt-8 w-0.5 h-8 bg-muted" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Routing Decision */}
        {routingDecision && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Route className="h-5 w-5 mr-2" />
                Routing Decision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Recommended Mode:</span>
                <Badge variant="default" className="bg-blue-600">
                  {routingDecision.recommendedMode.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Confidence:</span>
                <div className="flex-1 flex items-center space-x-2">
                  <Progress value={routingDecision.confidence} className="h-2" />
                  <span className="text-sm">{routingDecision.confidence}%</span>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-sm mb-2">Reasoning:</h5>
                <p className="text-sm text-muted-foreground">{routingDecision.reasoning}</p>
              </div>

              {routingDecision.alternativeOptions.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2">Alternative Options:</h5>
                  <div className="space-y-2">
                    {routingDecision.alternativeOptions.map((option, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>{option.mode.replace('-', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">Score: {option.score}%</span>
                          <Badge variant="outline" className="text-xs">
                            {option.reason}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}