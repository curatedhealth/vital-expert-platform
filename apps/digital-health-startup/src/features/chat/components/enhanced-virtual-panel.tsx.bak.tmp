'use client';

import {
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  Brain,
  Lightbulb,
  AlertCircle,
  Target,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Progress } from '@vital/ui';
import { useAgentsStore } from '@/lib/stores/agents-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { cn } from '@/shared/services/utils';

import {
  ExpertOrchestrator,
  VirtualPanel,
  SessionOutput,
  FacilitationEngine,
  SessionType,
  UseCaseType
} from '../services/expert-orchestrator';

interface EnhancedVirtualPanelProps {
  question: string;
  panelType?: UseCaseType;
  sessionType?: SessionType;
  onComplete?: (output: SessionOutput) => void;
  className?: string;
  predefinedExpertIds?: string[];
}

interface PanelPhase {
  id: string;
  name: string;
  description: string;
  duration: number;
  status: 'pending' | 'active' | 'completed';
  progress: number;
}

interface ExpertVote {
  expertId: string;
  option: string;
  confidence: number;
  rationale: string;
  timestamp: Date;
}

export function EnhancedVirtualPanel({
  question,
  panelType = 'medical-board',
  sessionType = 'ADVISORY',
  onComplete,
  className,
  predefinedExpertIds
}: EnhancedVirtualPanelProps) {

  const [orchestrator] = useState(() => new ExpertOrchestrator(new FacilitationEngine(), agentsStore));
  const [panel, setPanel] = useState<VirtualPanel | null>(null);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [sessionStatus, setSessionStatus] = useState<'initializing' | 'assembling' | 'facilitating' | 'voting' | 'synthesizing' | 'completed'>('initializing');
  const [sessionOutput, setSessionOutput] = useState<SessionOutput | null>(null);
  const [phases, setPhases] = useState<PanelPhase[]>([]);
  const [votes, setVotes] = useState<ExpertVote[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    initializeSession();
  }, [question, panelType, sessionType, predefinedExpertIds]);

    setSessionStatus('assembling');

    try {
      let assembledPanel: VirtualPanel;

      if (predefinedExpertIds && predefinedExpertIds.length > 0) {
        // Use predefined experts for custom panel
        assembledPanel = await orchestrator.buildCustomPanel(predefinedExpertIds, sessionType);
      } else {
        // Assemble expert panel based on query
        assembledPanel = await orchestrator.assemblePanelForQuery(question, panelType);
      }

      setPanel(assembledPanel);

      // Initialize phases based on facilitation strategy
      const initialPhases: PanelPhase[] = assembledPanel.facilitationStrategy.phases.map((phase, index) => ({
        id: phase.name.toLowerCase().replace(/\s+/g, '-'),
        name: phase.name,
        description: phase.objective,
        duration: phase.duration,
        status: index === 0 ? 'active' : 'pending',
        progress: 0
      }));

      setPhases(initialPhases);
      setSessionStatus('facilitating');

      // Start facilitation process
      setTimeout(() => {
        facilitateSession(assembledPanel);
      }, 1000);

    } catch (error) {
      // console.error('Failed to initialize panel session:', error);
    }
  };

    // Simulate phase progression
    for (let __i = 0; i < phases.length; i++) {
      setCurrentPhase(i);

      // Update phase status
      setPhases(prev => prev.map((phase, index) => ({
        ...phase,
        status: index === i ? 'active' : index < i ? 'completed' : 'pending',
        progress: index === i ? 0 : index < i ? 100 : 0
      })));

      // Simulate phase execution
      // eslint-disable-next-line security/detect-object-injection
      await executePhase(phases[i], panel);

      // Complete current phase
      setPhases(prev => prev.map((phase, index) => ({
        ...phase,
        status: index === i ? 'completed' : phase.status,
        progress: index === i ? 100 : phase.progress
      })));
    }

    // Move to voting phase
    setSessionStatus('voting');
    await simulateVoting(panel);

    // Synthesize results
    setSessionStatus('synthesizing');

    setSessionOutput(output);
    setSessionStatus('completed');

    if (onComplete) {
      onComplete(output);
    }
  };

    return new Promise((resolve) => {

        progress += 5;
        setPhases(prev => prev.map(p =>
          p.id === phase.id ? { ...p, progress: Math.min(progress, 100) } : p
        ));

        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, duration / 20); // Update progress 20 times during phase
    });
  };

    return new Promise((resolve) => {

        { id: 'approve', label: 'Approve Recommendation', description: 'Accept the proposed approach' },
        { id: 'modify', label: 'Approve with Modifications', description: 'Accept with suggested changes' },
        { id: 'reject', label: 'Request Major Changes', description: 'Significant revisions needed' }
      ];

      // Simulate expert voting
      panel.experts.forEach((expert, index) => {
        setTimeout(() => {
          const vote: ExpertVote = {
            expertId: expert.id,
            option: votingOptions[Math.floor(Math.random() * votingOptions.length)].id,
            confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
            rationale: `Based on my ${expert.expertise.primary[0]} expertise, this approach ${Math.random() > 0.5 ? 'aligns well with' : 'requires consideration of'} current best practices.`,
            timestamp: new Date()
          };

          setVotes(prev => [...prev, vote]);
        }, (index + 1) * 2000); // Stagger votes
      });

      // Complete voting after all experts have voted
      setTimeout(() => {
        resolve();
      }, panel.experts.length * 2000 + 1000);
    });
  };

    switch (phaseName.toLowerCase()) {
      case 'context setting': return Brain;
      case 'expert input': return Lightbulb;
      case 'discussion': return MessageSquare;
      case 'recommendations': return Target;
      default: return Settings;
    }
  };

    if (sessionStatus === 'voting') {

      return vote ? 'voted' : 'voting';
    }

    switch (sessionStatus) {
      case 'facilitating': return 'contributing';
      case 'completed': return 'completed';
      default: return 'ready';
    }
  };

    switch (status) {
      case 'voted': case 'completed': return 'text-green-600';
      case 'voting': case 'contributing': return 'text-blue-600';
      case 'ready': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

    switch (status) {
      case 'voted': case 'completed': return CheckCircle;
      case 'voting': case 'contributing': return Clock;
      case 'ready': return AlertCircle;
      default: return Clock;
    }
  };

    if (sessionStatus === 'completed') return 100;
    if (sessionStatus === 'synthesizing') return 90;
    if (sessionStatus === 'voting') return 80;
    if (sessionStatus === 'facilitating') {

      // eslint-disable-next-line security/detect-object-injection

      return Math.floor(((completedPhases * 100) + activePhaseProgress) / phases.length * 0.8);
    }
    return 20;
  };

  if (!panel) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Users className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <CardTitle>Assembling Expert Panel</CardTitle>
              <p className="text-sm text-muted-foreground">Finding the best experts for your question...</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Analyzing query and matching expertise...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Enhanced Virtual Expert Panel</CardTitle>
              <p className="text-sm text-muted-foreground">
                {panel.experts.length} experts • {sessionStatus.replace('-', ' ').toUpperCase()}
              </p>
            </div>
          </div>
          <Badge variant="secondary">
            {sessionStatus === 'completed' ? 'Session Complete' : 'Active Session'}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Session Progress</span>
            <span>{getOverallProgress()}%</span>
          </div>
          <Progress value={getOverallProgress()} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="experts">Experts</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Question Display */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">Session Question:</h4>
                <p className="text-sm">{question}</p>
              </CardContent>
            </Card>

            {/* Current Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{panel.experts.length}</div>
                  <div className="text-xs text-muted-foreground">Experts</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {phases.filter(p => p.status === 'completed').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Phases Done</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{votes.length}</div>
                  <div className="text-xs text-muted-foreground">Votes Cast</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {sessionOutput?.recommendations.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Recommendations</div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="experts" className="space-y-4">
            <div className="grid gap-4">
              {panel.experts.map((expert) => {

                return (
                  <Card key={expert.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{expert.avatar}</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{expert.name}</h4>
                            <StatusIcon className={cn("h-4 w-4", getStatusColor(status))} />
                          </div>
                          <p className="text-sm text-muted-foreground">{expert.role}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {expert.expertise.primary.map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-muted-foreground">Rating: {expert.performance.avgRating}/5</div>
                        <div className="text-muted-foreground">Cases: {expert.performance.casesHandled}</div>
                      </div>
                    </div>
                    {vote && (
                      <div className="mt-3 p-2 bg-muted/50 rounded">
                        <div className="text-xs font-medium">Vote: {vote.option}</div>
                        <div className="text-xs text-muted-foreground">Confidence: {vote.confidence}%</div>
                        <div className="text-xs text-muted-foreground mt-1">{vote.rationale}</div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="phases" className="space-y-4">
            <div className="space-y-3">
              {phases.map((phase, index) => {

                return (
                  <Card
                    key={phase.id}
                    className={cn(
                      "p-4",
                      phase.status === 'active' && "border-blue-500 bg-blue-50",
                      phase.status === 'completed' && "border-green-500 bg-green-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          phase.status === 'completed' ? "bg-green-500" :
                          phase.status === 'active' ? "bg-blue-500" : "bg-gray-400"
                        )}>
                          <PhaseIcon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">{phase.name}</h4>
                          <p className="text-sm text-muted-foreground">{phase.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {phase.status === 'completed' ? '✓ Complete' :
                           phase.status === 'active' ? '⏳ Active' : '⏸️ Pending'}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {phase.duration} min
                        </div>
                      </div>
                    </div>
                    {phase.status === 'active' && (
                      <div className="mt-3">
                        <Progress value={phase.progress} className="h-1.5" />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {sessionOutput ? (
              <div className="space-y-4">
                {/* Executive Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{sessionOutput.executiveSummary}</p>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                {sessionOutput.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sessionOutput.recommendations.map((rec) => (
                        <div key={rec.id} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={rec.priority === 'high' ? 'destructive' : 'outline'}>
                              {rec.priority} priority
                            </Badge>
                            <span className="text-xs text-muted-foreground">{rec.timeline}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Next Steps */}
                {sessionOutput.nextSteps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {sessionOutput.nextSteps.map((step) => (
                        <div key={step.id} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <span className="text-sm">{step.description}</span>
                            <div className="text-xs text-muted-foreground">
                              Owner: {step.owner} • Due: {step.deadline.toDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">
                    Session results will appear here once the panel completes their review.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}