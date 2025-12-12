'use client';

/**
 * VITAL Platform - Autonomous Deep Research
 *
 * Mode 3: Manual expert selection (user picks research lead) - ?mode=manual
 * Mode 4: Auto expert selection (Fusion Intelligence selects team) - ?mode=auto
 *
 * Query param determines initial mode. MissionInput component handles goal entry.
 * Sidebar handles expert selection (Mode 3 only).
 */

import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMode3Mission } from '@/features/ask-expert/hooks';
import { MissionInput, type MissionConfig, type SelectedExpert } from '@/features/ask-expert/components/MissionInput';
import { VitalStreamText } from '@/components/vital-ai-ui/conversation/VitalStreamText';
import { VitalThinking } from '@/components/vital-ai-ui/reasoning/VitalThinking';
import { VitalCitation } from '@/components/vital-ai-ui/reasoning/VitalCitation';
import { VitalToolInvocation } from '@/components/vital-ai-ui/reasoning/VitalToolInvocation';
import { VitalWorkflowProgress } from '@/components/vital-ai-ui/workflow/VitalWorkflowProgress';
import { VitalHITLCheckpoint } from '@/components/vital-ai-ui/workflow/VitalHITLCheckpoint';
import { VitalCostTracker } from '@/components/vital-ai-ui/workflow/VitalCostTracker';
import { VitalDelegationFlow } from '@/components/vital-ai-ui/agents/VitalDelegationFlow';
import { VitalArtifact } from '@/components/vital-ai-ui/documents/VitalArtifact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Target,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
} from 'lucide-react';

function AutonomousContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const autoSelect = mode === 'auto';

  const [showArtifacts, setShowArtifacts] = useState(false);
  const [sidebarSelectedExpert, setSidebarSelectedExpert] = useState<SelectedExpert | null>(null);

  const {
    mission,
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
  } = useMode3Mission({
    onError: (err) => console.error('Mission error:', err),
    onCheckpoint: (cp) => console.log('Checkpoint received:', cp),
    onStepComplete: (step) => console.log('Step complete:', step),
    onMissionComplete: (result) => console.log('Mission complete:', result),
    tenantId: '00000000-0000-0000-0000-000000000001',
    autoSelectExpert: autoSelect, // Mode 4 when true
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentContent, currentReasoning]);

  // Listen for expert selection events from sidebar (Mode 3)
  // Immediately call selectExpert on the hook so it's ready when mission starts
  useEffect(() => {
    interface ExpertSelectedEvent {
      expertId: string;
      expert: { id: string; name: string; level: string; specialty: string };
    }

    const handleExpertSelected = (event: CustomEvent<ExpertSelectedEvent>) => {
      const { expert } = event.detail;

      // Update local state for UI display
      setSidebarSelectedExpert({
        id: expert.id,
        name: expert.name,
        level: expert.level,
        specialty: expert.specialty,
      });

      // Immediately register expert with the hook (required before startMission)
      selectExpert({
        id: expert.id,
        name: expert.name,
        level: (expert.level as 'L1' | 'L2' | 'L3') || 'L2',
        specialty: expert.specialty,
      });
    };

    window.addEventListener('ask-expert:expert-selected', handleExpertSelected as EventListener);

    // On mount, request current selection from sidebar (in case it was set before we mounted)
    if (!autoSelect) {
      window.dispatchEvent(new CustomEvent('ask-expert:request-selection'));
    }

    return () => {
      window.removeEventListener('ask-expert:expert-selected', handleExpertSelected as EventListener);
    };
  }, [selectExpert, autoSelect]);

  // Handler for starting mission from MissionInput component
  const handleStartMission = useCallback(
    (goal: string, config: MissionConfig) => {
      // Expert is already selected via the event listener above
      // Just start the mission with the config
      startMission(goal, {
        enableRag: config.enableRag,
        enableWebSearch: config.enableWebSearch,
        maxIterations: config.maxIterations,
        hitlEnabled: config.hitlEnabled,
        templateId: config.templateId,
      });
    },
    [startMission]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Mode Header */}
      <header className="px-6 py-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {autoSelect ? (
                <Sparkles className="h-5 w-5 text-amber-500" />
              ) : (
                <Target className="h-5 w-5 text-emerald-500" />
              )}
              <h1 className="text-xl font-semibold">
                {mission?.goal || (autoSelect ? 'Research Auto' : 'Research Manual')}
              </h1>
              <Badge variant="outline" className="text-xs">
                Mode {autoSelect ? '4' : '3'}
              </Badge>
            </div>
            {mission && (
              <div className="flex items-center gap-3 mt-1">
                <Badge
                  variant={
                    mission.status === 'completed'
                      ? 'default'
                      : mission.status === 'failed'
                        ? 'destructive'
                        : mission.status === 'paused'
                          ? 'secondary'
                          : 'outline'
                  }
                >
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

          <div className="flex items-center gap-2">
            {/* Mission Control Buttons */}
            {isRunning && !isPaused && (
              <Button onClick={pauseMission} variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}

            {isPaused && (
              <Button onClick={resumeMission} size="sm">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}

            {(isRunning || isPaused) && (
              <Button onClick={cancelMission} variant="destructive" size="sm">
                <Square className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}

            {mission?.finalOutput && (
              <Button variant="outline" size="sm" onClick={() => setShowArtifacts(!showArtifacts)}>
                <FileText className="h-4 w-4 mr-2" />
                {showArtifacts ? 'Hide' : 'View'} Artifacts
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {progress && (
          <div className="mt-4" data-testid="progress-timeline">
            <VitalWorkflowProgress
              steps={
                progress.subSteps?.map((s, i) => ({
                  id: String(i),
                  name: s.name,
                  status: s.status,
                  duration: 0,
                })) || []
              }
              currentStepId={
                progress.subSteps?.findIndex((s) => s.status === 'active')?.toString() || '0'
              }
              totalProgress={progress.progress}
            />
          </div>
        )}
      </header>

      {/* Cost Tracker (compact bar below header) */}
      {currentCost && (
        <div className="px-6 py-2 border-b bg-muted/20" data-testid="cost-tracker">
          <VitalCostTracker
            currentCost={currentCost.currentCost}
            budgetLimit={currentCost.budgetLimit}
            breakdown={currentCost.breakdown}
            tokenCount={0}
            variant="compact"
          />
        </div>
      )}

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

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden" data-testid={isRunning ? 'mission-active' : undefined}>
        {/* Execution Log */}
        <ScrollArea ref={scrollRef} className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Mission Input - shown when no mission is running */}
            {!mission && !isRunning && (
              <MissionInput
                autoSelect={autoSelect}
                selectedExpert={sidebarSelectedExpert}
                onStartMission={handleStartMission}
                isRunning={isRunning}
              />
            )}

            {/* Current Reasoning/Thinking */}
            {currentReasoning.length > 0 && (
              <VitalThinking
                steps={currentReasoning.map((r) => ({
                  id: r.id,
                  step: r.step,
                  content: r.content,
                  status:
                    r.status === 'complete' ? 'complete' : r.status === 'error' ? 'error' : 'thinking',
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
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Evidence & Citations
                </h4>
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

        {/* Artifacts Panel (conditionally shown) */}
        {showArtifacts && mission?.artifacts && (
          <aside className="w-96 border-l bg-muted/30 p-4 overflow-auto">
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
    </div>
  );
}

export default function AutonomousResearchPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
      <AutonomousContent />
    </Suspense>
  );
}
