'use client';

/**
 * VITAL Platform - Mode 3: Deep Research Page
 * 
 * Mode 3: Manual Autonomous
 * - User MANUALLY selects expert
 * - Autonomous goal-driven execution (ReAct pattern)
 * - HITL checkpoints for critical decisions
 * - Target latency: 30s-5min depending on complexity
 * 
 * Integrates Phase 3 UI components with Phase 4 streaming hooks.
 */

import { useState, useRef, useEffect } from 'react';
import { useMode3Mission } from '@/features/ask-expert/hooks';
import { VitalStreamText } from '@/components/vital-ai-ui/conversation/VitalStreamText';
import { VitalThinking } from '@/components/vital-ai-ui/reasoning/VitalThinking';
import { VitalCitation } from '@/components/vital-ai-ui/reasoning/VitalCitation';
import { VitalToolInvocation } from '@/components/vital-ai-ui/reasoning/VitalToolInvocation';
import { VitalWorkflowProgress } from '@/components/vital-ai-ui/workflow/VitalWorkflowProgress';
import { VitalHITLCheckpoint } from '@/components/vital-ai-ui/workflow/VitalHITLCheckpoint';
import { VitalCostTracker } from '@/components/vital-ai-ui/workflow/VitalCostTracker';
import { VitalAgentCard } from '@/components/vital-ai-ui/agents/VitalAgentCard';
import { VitalDelegationFlow } from '@/components/vital-ai-ui/agents/VitalDelegationFlow';
import { VitalArtifact } from '@/components/vital-ai-ui/documents/VitalArtifact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertCircle, 
  Target, 
  User, 
  Play, 
  Pause, 
  Square, 
  CheckCircle2, 
  Clock, 
  FileText,
} from 'lucide-react';

// Mock experts for demo
const RESEARCH_EXPERTS = [
  {
    id: 'research-expert-1',
    name: 'Dr. Emma Watson',
    domain: 'Clinical Research',
    level: 'L2' as const,
    specialty: 'Systematic Reviews',
    description: 'Expert in meta-analyses, systematic reviews, and evidence synthesis.',
  },
  {
    id: 'research-expert-2',
    name: 'Dr. Michael Chang',
    domain: 'Regulatory Science',
    level: 'L2' as const,
    specialty: 'Global Submissions',
    description: 'Specialized in multi-regional regulatory strategy and dossier preparation.',
  },
  {
    id: 'research-expert-3',
    name: 'Dr. Lisa Anderson',
    domain: 'Market Access',
    level: 'L2' as const,
    specialty: 'HTA Analysis',
    description: 'Focused on health technology assessment and value demonstration.',
  },
];

export default function Mode3DeepResearchPage() {
  const [goalInput, setGoalInput] = useState('');
  const [showArtifacts, setShowArtifacts] = useState(false);
  
  const {
    mission,
    currentStep,
    currentContent,
    currentReasoning,
    currentCitations,
    currentToolCalls,
    currentDelegations,
    progress,
    currentCost,
    checkpointState,
    selectedExpert,
    isRunning,
    isPaused,
    error,
    startMission,
    selectExpert,
    pauseMission,
    resumeMission,
    cancelMission,
    approveCheckpoint,
    rejectCheckpoint,
    extendCheckpointTimeout,
    isExpertSelected,
  } = useMode3Mission({
    onError: (err) => console.error('Mission error:', err),
    onCheckpoint: (cp) => console.log('Checkpoint received:', cp),
    onStepComplete: (step) => console.log('Step complete:', step),
    onMissionComplete: (result) => console.log('Mission complete:', result),
    tenantId: '00000000-0000-0000-0000-000000000001',
  });

  // Preselect first expert so the start button can enable immediately
  useEffect(() => {
    if (!selectedExpert && RESEARCH_EXPERTS.length > 0) {
      selectExpert(RESEARCH_EXPERTS[0]);
    }
  }, [selectedExpert, selectExpert]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentContent, currentReasoning]);

  const handleStartMission = () => {
    if (!goalInput.trim()) return;

    startMission(goalInput.trim(), {
      enableRag: true,
      enableWebSearch: true,
      maxIterations: 15,
      hitlEnabled: true,
      templateId: 'understand_deep_dive',
    });
    setShowArtifacts(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Panel - Expert Selection & Mission Setup */}
      <aside className="w-80 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Deep Research
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Mode 3: Autonomous Execution with Checkpoints
          </p>
        </div>

        {/* Expert Selection */}
        <div className="p-4 border-b" data-testid="expert-selector">
          <h3 className="text-sm font-medium mb-3">Select Research Lead</h3>
          <div className="space-y-2">
            {RESEARCH_EXPERTS.map((expert) => (
              <Card
                key={expert.id}
                data-testid="expert-card"
                data-selected={selectedExpert?.id === expert.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedExpert?.id === expert.id ? 'border-primary bg-primary/5' : ''
                } ${isRunning ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => !isRunning && selectExpert(expert)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{expert.name}</span>
                        <Badge variant="outline" className="text-xs">{expert.level}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{expert.specialty}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Goal Input */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-medium mb-2">Research Goal</h3>
          <Textarea
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="Describe your research goal in detail..."
            className="flex-1 min-h-[120px] resize-none"
            disabled={isRunning}
            data-testid="goal-input"
          />
          
          {/* Action Buttons */}
          <div className="mt-4 space-y-2">
            {!isRunning && !mission && (
              <Button 
                onClick={handleStartMission} 
                className="w-full"
                data-testid="start-mission"
                disabled={!goalInput.trim() || !isExpertSelected || isRunning}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Research Mission
              </Button>
            )}
            
            {isRunning && !isPaused && (
              <Button onClick={pauseMission} variant="outline" className="w-full">
                <Pause className="h-4 w-4 mr-2" />
                Pause Mission
              </Button>
            )}
            
            {isPaused && (
              <Button onClick={resumeMission} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Resume Mission
              </Button>
            )}
            
            {(isRunning || isPaused) && (
              <Button onClick={cancelMission} variant="destructive" className="w-full">
                <Square className="h-4 w-4 mr-2" />
                Cancel Mission
              </Button>
            )}
          </div>
        </div>

        {/* Cost Tracker */}
        {currentCost && (
          <div className="p-4 border-t" data-testid="cost-tracker">
            <VitalCostTracker
              currentCost={currentCost.currentCost}
              budgetLimit={currentCost.budgetLimit}
              breakdown={currentCost.breakdown}
              tokenCount={0}
              variant="compact"
            />
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col" data-testid={isRunning ? 'mission-active' : undefined}>
        {/* Mission Header */}
        <header className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                {mission?.goal || 'Research Mission'}
              </h1>
              {mission && (
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant={
                    mission.status === 'completed' ? 'default' :
                    mission.status === 'failed' ? 'destructive' :
                    mission.status === 'paused' ? 'secondary' : 'outline'
                  }>
                    {mission.status}
                  </Badge>
                  {mission.durationMs && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.round(mission.durationMs / 1000)}s
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {mission?.finalOutput && (
              <Button variant="outline" onClick={() => setShowArtifacts(!showArtifacts)}>
                <FileText className="h-4 w-4 mr-2" />
                {showArtifacts ? 'Hide' : 'View'} Artifacts
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          {progress && (
            <div className="mt-4" data-testid="progress-timeline">
              <VitalWorkflowProgress
                steps={progress.subSteps?.map((s, i) => ({
                  id: String(i),
                  name: s.name,
                  status: s.status,
                  duration: 0,
                })) || []}
                currentStepId={progress.subSteps?.findIndex(s => s.status === 'active')?.toString() || '0'}
                totalProgress={progress.progress}
              />
            </div>
          )}
        </header>

        {/* HITL Checkpoint Modal */}
        {checkpointState.isOpen && checkpointState.checkpoint && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border-b">
            <VitalHITLCheckpoint
              checkpoint={{
                id: checkpointState.checkpoint.id,
                type: checkpointState.checkpoint.type,
                title: checkpointState.checkpoint.title,
                description: checkpointState.checkpoint.description,
                status: 'pending',
                timeout: checkpointState.checkpoint.timeout,
                options: checkpointState.checkpoint.options,
              }}
              timeRemaining={checkpointState.timeRemaining}
              onApprove={(option) => approveCheckpoint(option)}
              onReject={(reason) => rejectCheckpoint(reason)}
              onExtendTime={() => extendCheckpointTimeout(60)}
            />
          </div>
        )}

        {/* Execution Log */}
        <ScrollArea ref={scrollRef} className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Welcome message when no mission */}
            {!mission && !isRunning && (
              <Card className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Deep Research Mode</h3>
                <p className="text-muted-foreground mb-4">
                  Define a research goal and select an expert to begin autonomous investigation.
                  The system will work through the problem step-by-step, requesting your approval
                  at critical decision points.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span>✓ Multi-step reasoning</span>
                  <span>✓ Tool execution</span>
                  <span>✓ Sub-agent delegation</span>
                  <span>✓ HITL checkpoints</span>
                </div>
              </Card>
            )}

            {/* Current Reasoning/Thinking */}
            {currentReasoning.length > 0 && (
              <VitalThinking
                steps={currentReasoning.map((r) => ({
                  id: r.id,
                  step: r.step,
                  content: r.content,
                  status: r.status === 'complete' ? 'complete' : r.status === 'error' ? 'error' : 'thinking',
                  agentLevel: r.agentLevel,
                  durationMs: r.durationMs,
                }))}
                showTimings={true}
              />
            )}

            {/* Tool Calls */}
            {currentToolCalls.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Tool Executions</h4>
                {currentToolCalls.map((tool) => (
                  <VitalToolInvocation
                    key={tool.id}
                    toolName={tool.toolName}
                    status={tool.status === 'calling' ? 'running' : tool.status}
                    input={tool.input}
                    output={tool.output}
                    durationMs={tool.durationMs}
                    error={tool.error}
                  />
                ))}
              </div>
            )}

            {/* Delegations */}
            {currentDelegations.length > 0 && (
              <VitalDelegationFlow
                delegations={currentDelegations.map((d, i) => ({
                  id: String(i),
                  fromAgent: { id: d.fromAgentId, name: d.fromAgentName, level: d.fromLevel },
                  toAgent: { id: d.toAgentId, name: d.toAgentName, level: d.toLevel },
                  task: d.task,
                  reason: d.reason,
                  status: 'active',
                }))}
              />
            )}

            {/* Current Output */}
            {currentContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <VitalStreamText content={currentContent} isStreaming={isRunning} />
                </CardContent>
              </Card>
            )}

            {/* Citations */}
            {currentCitations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Evidence & Citations</h4>
                <div className="flex flex-wrap gap-2">
                  {currentCitations.map((citation) => (
                    <VitalCitation
                      key={citation.id}
                      citation={{
                        id: citation.id,
                        number: citation.index,
                        source: citation.source,
                        title: citation.title,
                        excerpt: citation.excerpt,
                        url: citation.url,
                        confidence: citation.confidence,
                      }}
                      variant="card"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Mission Output */}
            {mission?.status === 'completed' && mission.finalOutput && (
              <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    Research Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VitalStreamText content={mission.finalOutput} isStreaming={false} />
                </CardContent>
              </Card>
            )}

            {/* Error display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Mission Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* Artifacts Panel (conditionally shown) */}
      {showArtifacts && mission?.artifacts && (
        <aside className="w-96 border-l bg-muted/30 p-4">
          <h3 className="font-medium mb-4">Generated Artifacts</h3>
          <div className="space-y-4">
            {mission.artifacts.map((artifact) => (
              <VitalArtifact
                key={artifact.id}
                type={artifact.type}
                title={artifact.title}
                content={artifact.content}
                format={artifact.format}
              />
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
