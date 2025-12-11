'use client';

/**
 * VITAL Platform - Mode 4: Background Dashboard Page
 * 
 * Mode 4: Auto Autonomous (Background Dashboard)
 * - System AUTOMATICALLY selects expert team via Fusion Intelligence
 * - Fire-and-forget background execution
 * - Pre-flight validation before launch
 * - Periodic progress updates and notifications
 * - Target latency: Minutes to hours depending on complexity
 * 
 * Integrates Phase 3 UI components with Phase 4 streaming hooks.
 */

import { useState } from 'react';
import { useMode4Background } from '@/features/ask-expert/hooks/useMode4Background';
import { useMissionStream } from '@/features/ask-expert/hooks/useMissionStream';
import { VitalPreFlightCheck } from '@/components/vital-ai-ui/workflow/VitalPreFlightCheck';
import { VitalTeamAssemblyView } from '@/components/vital-ai-ui/mission/VitalTeamAssemblyView';
import { VitalWorkflowProgress } from '@/components/vital-ai-ui/workflow/VitalWorkflowProgress';
import { VitalHITLCheckpoint } from '@/components/vital-ai-ui/workflow/VitalHITLCheckpoint';
import { VitalCostTracker } from '@/components/vital-ai-ui/workflow/VitalCostTracker';
import { VitalFusionExplanation } from '@/components/vital-ai-ui/fusion/VitalFusionExplanation';
import { VitalArtifact } from '@/components/vital-ai-ui/documents/VitalArtifact';
import { VitalThinking } from '@/components/vital-ai-ui/reasoning/VitalThinking';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertCircle, 
  Rocket, 
  Users, 
  Play, 
  Pause, 
  Square, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileText,
  Bell,
  BellOff,
  RefreshCw,
  Download,
  History,
  Settings,
  ChevronRight,
  Zap,
  Shield,
  Brain,
  MoreVertical,
  Loader2,
} from 'lucide-react';

export default function Mode4BackgroundDashboardPage() {
  const [goalInput, setGoalInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [activeTab, setActiveTab] = useState<'mission' | 'history' | 'notifications'>('mission');
  const [showPreFlight, setShowPreFlight] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | undefined>();
  const { events: missionEvents } = useMissionStream(streamUrl);

  const {
    // Mission state
    mission,
    missions,
    currentPhase,
    currentSteps,
    currentCost,
    fusionEvidence,
    
    // Pre-flight state
    preFlightChecks,
    isPreFlightRunning,
    preFlightPassed,
    
    // Team state
    assembledTeam,
    isAssemblingTeam,
    
    // Checkpoint state
    pendingCheckpoint,
    checkpointTimeRemaining,
    
    // Notifications
    notifications,
    unreadCount,
    
    // Connection state
    isConnected,
    isPolling,
    error,
    
    // Actions
    createMission,
    runPreFlight,
    launchMission,
    pauseMission,
    resumeMission,
    cancelMission,
    approveCheckpoint,
    rejectCheckpoint,
    markNotificationRead,
    clearNotifications,
    downloadArtifact,
    getMissionHistory,
    retryFailedMission,
  } = useMode4Background({
    onError: (err) => console.error('Mission error:', err),
    onPreFlightComplete: (passed, checks) => console.log('Pre-flight:', passed, checks),
    onMissionStart: (m) => console.log('Mission started:', m),
    onMissionComplete: (m) => console.log('Mission complete:', m),
    onCheckpoint: (cp) => console.log('Checkpoint:', cp),
    onTeamAssembled: (team) => console.log('Team assembled:', team),
    onArtifactReady: (artifact) => console.log('Artifact ready:', artifact),
  });

  const handleCreateMission = () => {
    if (goalInput.trim()) {
      createMission(goalInput.trim(), {
        title: titleInput.trim() || undefined,
        priority: 'normal',
        enableRag: true,
        enableWebSearch: true,
        enableAllTools: true,
        notifyOnComplete: true,
        notifyOnCheckpoint: true,
      });
      setShowPreFlight(true);

      const payload = {
        mode: 4,
        goal: goalInput.trim(),
        template_id: 'understand_deep_dive',
        user_context: {},
      };
      fetch('/api/v1/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'demo-tenant' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => setStreamUrl(data.stream_url))
        .catch(() => setStreamUrl(undefined));
    }
  };

  const handleRunPreFlight = async () => {
    const passed = await runPreFlight();
    if (passed) {
      // Auto-launch after successful pre-flight
      // User can also choose to launch manually
    }
  };

  const getMissionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'outline';
      case 'paused': return 'secondary';
      case 'failed': return 'destructive';
      case 'cancelled': return 'secondary';
      default: return 'outline';
    }
  };

  const getMissionStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'running': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled': return <Square className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Panel - Mission Creation */}
      <aside className="w-96 border-r bg-muted/30 flex flex-col" data-testid="mission-form">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Background Mission
            </h1>
            {isPolling && (
              <Badge variant="outline" className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Syncing
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Mode 4: Auto Team Selection + Fire-and-Forget
          </p>
        </div>

        {/* Mission Setup Form */}
        {!mission && (
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Mission Title (Optional)</label>
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g., Q4 Market Analysis"
                disabled={!!mission}
                data-testid="mission-title"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Research Goal</label>
              <Textarea
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Describe your research objective in detail. The AI will automatically assemble the best expert team and execute autonomously."
                className="min-h-[160px] resize-none"
                disabled={!!mission}
                data-testid="goal-input"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>Automatic team assembly via Fusion Intelligence</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Pre-flight validation before launch</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="h-4 w-4" />
                <span>Autonomous execution with checkpoints</span>
              </div>
            </div>

            <Button 
              onClick={handleCreateMission} 
              className="w-full"
              disabled={!goalInput.trim()}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Initialize Mission
            </Button>
          </div>
        )}

        {/* Pre-Flight Status */}
        {mission && mission.status === 'idle' && (
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Pre-Flight Checks
                </CardTitle>
                <CardDescription>
                  Validating mission requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {preFlightChecks.map((check) => (
                  <div key={check.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {check.status === 'passed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {check.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      {check.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      {check.status === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
                      {check.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                      {check.name}
                    </span>
                    {check.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                {preFlightPassed === null && (
                  <Button 
                    onClick={handleRunPreFlight} 
                    className="w-full"
                    disabled={isPreFlightRunning}
                  >
                    {isPreFlightRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Running Checks...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Run Pre-Flight
                      </>
                    )}
                  </Button>
                )}
                {preFlightPassed === true && (
                  <Button onClick={launchMission} className="w-full" data-testid="start-mission">
                    <Rocket className="h-4 w-4 mr-2" />
                    Launch Mission
                  </Button>
                )}
                {preFlightPassed === false && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Pre-flight failed. Review and fix issues before launching.
                    </AlertDescription>
                  </Alert>
                )}
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Running Mission Controls */}
        {mission && (mission.status === 'running' || mission.status === 'paused' || mission.status === 'queued') && (
          <div className="p-4 space-y-4" data-testid="mission-active">
            {/* Mission Status Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{mission.title}</CardTitle>
                  <Badge variant={getMissionStatusColor(mission.status)}>
                    {mission.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={mission.progress} className="h-2 mb-2" data-testid="progress-timeline" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{mission.progress}% complete</span>
                  {currentPhase && <span>{currentPhase}</span>}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                {mission.status === 'running' && (
                  <Button onClick={pauseMission} variant="outline" size="sm" className="flex-1">
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                )}
                {mission.status === 'paused' && (
                  <Button onClick={resumeMission} size="sm" className="flex-1">
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                )}
                <Button onClick={cancelMission} variant="destructive" size="sm" className="flex-1">
                  <Square className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </CardFooter>
            </Card>

            {/* Cost Tracker */}
            {currentCost && (
              <VitalCostTracker
                currentCost={currentCost.currentCost}
                budgetLimit={currentCost.budgetLimit}
                breakdown={currentCost.breakdown}
                tokenCount={0}
                variant="detailed"
              />
            )}
          </div>
        )}

        {/* Completed Mission Summary */}
        {mission && (mission.status === 'completed' || mission.status === 'failed') && (
          <div className="p-4 space-y-4">
            <Card className={mission.status === 'completed' ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {mission.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    {mission.status === 'completed' ? 'Mission Complete' : 'Mission Failed'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {mission.completedAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Completed {new Date(mission.completedAt).toLocaleString()}
                  </div>
                )}
                {mission.actualCost && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Total Cost: ${mission.actualCost.toFixed(4)}</span>
                  </div>
                )}
                {mission.errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{mission.errorMessage}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                {mission.status === 'failed' && (
                  <Button onClick={() => retryFailedMission(mission.id)} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Mission
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setGoalInput('');
                setTitleInput('');
                // Reset mission state would need to be added to the hook
              }}
            >
              Start New Mission
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Tab Navigation */}
        <header className="px-6 py-3 border-b">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="mission" className="flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Current Mission
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              {activeTab === 'notifications' && notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearNotifications}>
                  <BellOff className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </Tabs>
        </header>

        {/* Tab Content */}
        <ScrollArea className="flex-1">
          {/* Mission Tab */}
          {activeTab === 'mission' && (
            <div className="p-6 space-y-6">
              {/* HITL Checkpoint */}
              {pendingCheckpoint && (
                <Alert className="border-yellow-300 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle>Checkpoint Requires Attention</AlertTitle>
                  <AlertDescription className="mt-2">
                    <VitalHITLCheckpoint
                      checkpoint={{
                        id: pendingCheckpoint.id,
                        type: pendingCheckpoint.type,
                        title: pendingCheckpoint.title,
                        description: pendingCheckpoint.description,
                        status: 'pending',
                        timeout: pendingCheckpoint.timeout,
                        options: pendingCheckpoint.options,
                      }}
                      timeRemaining={checkpointTimeRemaining}
                      onApprove={(option) => approveCheckpoint(option)}
                      onReject={(reason) => rejectCheckpoint(reason)}
                    />
                  </AlertDescription>
                </Alert>
              )}

              {/* Welcome state */}
              {!mission && (
                <Card className="p-8 text-center">
                  <Rocket className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Background Dashboard</h3>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    Define a complex research goal and let VITAL automatically assemble the optimal
                    expert team using Fusion Intelligence. The mission runs in the background with
                    periodic updates and checkpoints.
                  </p>
                  <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <Card className="p-4 text-center">
                      <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium text-sm">Automatic Team</h4>
                      <p className="text-xs text-muted-foreground">AI-selected experts via Fusion</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium text-sm">Autonomous</h4>
                      <p className="text-xs text-muted-foreground">Fire-and-forget execution</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium text-sm">Safe</h4>
                      <p className="text-xs text-muted-foreground">Pre-flight + checkpoints</p>
                    </Card>
                  </div>
                </Card>
              )}

              {/* Team Assembly */}
              {(isAssemblingTeam || assembledTeam.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Expert Team
                      {isAssemblingTeam && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                    </CardTitle>
                    <CardDescription>
                      {isAssemblingTeam 
                        ? 'Fusion Intelligence is selecting the optimal team...' 
                        : `${assembledTeam.length} experts assembled`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VitalTeamAssemblyView
                      experts={assembledTeam}
                      isAssembling={isAssemblingTeam}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Fusion Evidence */}
              {fusionEvidence && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Fusion Intelligence Reasoning</CardTitle>
                    <CardDescription>How the expert team was selected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VitalFusionExplanation
                      evidence={{
                        vectorScores: Object.entries(fusionEvidence.evidence.vectorScores)
                          .map(([id, score]) => ({ agentId: id, name: id, score })),
                        graphPaths: fusionEvidence.evidence.graphPaths.map(p => ({
                          path: p,
                          relevance: 0.8
                        })),
                        relationalPatterns: Object.entries(fusionEvidence.evidence.relationalPatterns)
                          .map(([pattern, freq]) => ({
                            pattern,
                            frequency: freq,
                            success: 90
                          })),
                        weights: fusionEvidence.weights,
                        retrievalTimeMs: fusionEvidence.retrievalTimeMs
                      }}
                      selectedExperts={fusionEvidence.selectedExperts.map(e => ({
                        id: e.id,
                        name: e.name,
                        role: e.role,
                        confidence: e.confidence > 0.8 ? 'high' : e.confidence > 0.5 ? 'medium' : 'low',
                        evidence: { vector: 0.9, graph: 0.8, relational: 0.7 }
                      }))}
                      reasoning={fusionEvidence.reasoning}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Progress Steps */}
              {currentSteps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Execution Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VitalWorkflowProgress
                      steps={currentSteps.map(s => ({
                        id: s.id,
                        name: s.title,
                        status: s.status,
                        duration: s.endTime && s.startTime 
                          ? Math.round((s.endTime.getTime() - s.startTime.getTime()) / 1000) 
                          : 0,
                      }))}
                      currentStepId={currentSteps.find(s => s.status === 'active')?.id || ''}
                      totalProgress={mission?.progress || 0}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Artifacts */}
              {mission?.artifacts && mission.artifacts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Generated Artifacts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {mission.artifacts.map((artifact) => (
                      <Card key={artifact.id} className="relative">
                        <CardContent className="pt-4">
                          <VitalArtifact
                            type={artifact.type}
                            title={artifact.title}
                            content={artifact.content}
                            format={artifact.format}
                          />
                        </CardContent>
                        {artifact.status === 'ready' && artifact.downloadUrl && (
                          <CardFooter>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => downloadArtifact(artifact.id)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              )}

              {streamUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Mission Stream (API)</CardTitle>
                    <CardDescription>{streamUrl}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted rounded p-3 text-xs overflow-x-auto">
                      {JSON.stringify(missionEvents, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* Error display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-6 space-y-4">
              {notifications.length === 0 ? (
                <Card className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Notifications</h3>
                  <p className="text-muted-foreground">
                    You'll receive notifications about mission progress and checkpoints here.
                  </p>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <Card 
                    key={notification.id}
                    className={`cursor-pointer transition-colors ${
                      !notification.read ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <CardContent className="py-3 flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'error' ? 'bg-red-100 text-red-600' :
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        notification.type === 'success' ? 'bg-green-100 text-green-600' :
                        notification.type === 'checkpoint' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {notification.type === 'error' && <AlertCircle className="h-4 w-4" />}
                        {notification.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                        {notification.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                        {notification.type === 'checkpoint' && <Shield className="h-4 w-4" />}
                        {notification.type === 'info' && <Bell className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{notification.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        {notification.actionRequired && (
                          <Badge variant="outline" className="mt-2">Action Required</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Mission History</h3>
                <Button variant="outline" size="sm" onClick={() => getMissionHistory()}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>

              {missions.length === 0 ? (
                <Card className="p-8 text-center">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Past Missions</h3>
                  <p className="text-muted-foreground">
                    Your completed and cancelled missions will appear here.
                  </p>
                </Card>
              ) : (
                missions.map((m) => (
                  <Card key={m.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getMissionStatusIcon(m.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{m.title}</span>
                              <Badge variant={getMissionStatusColor(m.status)}>
                                {m.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {m.goal}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                              {m.team.length > 0 && (
                                <span>{m.team.length} experts</span>
                              )}
                              {m.actualCost && (
                                <span>${m.actualCost.toFixed(4)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {m.status === 'failed' && (
                              <DropdownMenuItem onClick={() => retryFailedMission(m.id)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
  );
}
