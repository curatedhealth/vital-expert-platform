'use client';

/**
 * VITAL Platform - Panel Autonomous Mode (Mode 4)
 *
 * Autonomous panel discussion with multi-expert parallel execution,
 * consensus building, iterative refinement, and HITL checkpoints.
 *
 * Features:
 * - Fusion Intelligence for expert auto-selection
 * - Multi-round expert discussions
 * - Real-time consensus analysis
 * - HITL checkpoints for human review
 * - Quality gates (RACE/FACT metrics)
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useCallback, Suspense } from 'react';
import {
  ArrowLeft,
  Loader2,
  Users,
  Sparkles,
  Brain,
  Swords,
  Vote,
  Target,
  Send,
  Play,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/shared/components/ui/card';
import { Badge } from '@/lib/shared/components/ui/badge';
import { Button } from '@/lib/shared/components/ui/button';
import { Input } from '@/lib/shared/components/ui/input';
import { Textarea } from '@/lib/shared/components/ui/textarea';
import { Label } from '@/lib/shared/components/ui/label';
import { Slider } from '@/lib/shared/components/ui/slider';
import { Switch } from '@/lib/shared/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/shared/components/ui/select';
import { useToast } from '@/hooks/use-toast';

import { usePanelMission } from '@/features/ask-panel/hooks';
import { PanelAutonomousView } from '@/features/ask-panel/components';
import type { PanelType } from '@/lib/api/panel-client';

// Panel type metadata
const PANEL_TYPES: Array<{
  type: PanelType;
  title: string;
  icon: React.ReactNode;
  description: string;
  bestFor: string;
}> = [
  {
    type: 'structured',
    title: 'Structured Panel',
    icon: <Users className="h-5 w-5" />,
    description: 'Sequential moderated discussion',
    bestFor: 'Systematic analysis of complex topics',
  },
  {
    type: 'open',
    title: 'Open Panel',
    icon: <Sparkles className="h-5 w-5" />,
    description: 'Free-form brainstorming',
    bestFor: 'Generating diverse perspectives',
  },
  {
    type: 'socratic',
    title: 'Socratic Panel',
    icon: <Brain className="h-5 w-5" />,
    description: 'Dialectical questioning',
    bestFor: 'Deep exploration of assumptions',
  },
  {
    type: 'adversarial',
    title: 'Adversarial Panel',
    icon: <Swords className="h-5 w-5" />,
    description: 'Pro/con debate format',
    bestFor: 'Testing ideas and finding weaknesses',
  },
  {
    type: 'delphi',
    title: 'Delphi Panel',
    icon: <Vote className="h-5 w-5" />,
    description: 'Consensus with anonymous voting',
    bestFor: 'Building expert consensus',
  },
  {
    type: 'hybrid',
    title: 'Hybrid Panel',
    icon: <Target className="h-5 w-5" />,
    description: 'Human-AI collaboration',
    bestFor: 'Complex decisions requiring review',
  },
];

function PanelAutonomousContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // Get initial panel type from query params
  const initialType = (searchParams.get('type') as PanelType) || 'structured';

  // Form state
  const [goal, setGoal] = useState('');
  const [context, setContext] = useState('');
  const [panelType, setPanelType] = useState<PanelType>(initialType);
  const [maxRounds, setMaxRounds] = useState(3);
  const [consensusThreshold, setConsensusThreshold] = useState(0.7);
  const [autoApproveCheckpoints, setAutoApproveCheckpoints] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Panel mission hook
  const {
    state,
    isLoading,
    isStreaming,
    isCheckpointPending,
    startMission,
    resolveCheckpoint,
    pauseMission,
    resumeMission,
    cancelMission,
    reset,
  } = usePanelMission({
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    onCheckpoint: (checkpoint) => {
      toast({
        title: 'Checkpoint Reached',
        description: checkpoint.title,
      });
    },
    onMissionComplete: (output) => {
      toast({
        title: 'Panel Complete',
        description: `Consensus reached with ${output.expertCount} experts`,
      });
    },
    onNotification: (message, type) => {
      toast({
        title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
        description: message,
        variant: type === 'error' ? 'destructive' : 'default',
      });
    },
  });

  // Handle start
  const handleStart = useCallback(() => {
    if (!goal.trim()) {
      toast({
        title: 'Goal Required',
        description: 'Please enter a question or goal for the panel',
        variant: 'destructive',
      });
      return;
    }

    setHasStarted(true);
    startMission(goal, panelType, {
      context: context || undefined,
      maxRounds,
      consensusThreshold,
      autoApproveCheckpoints,
    });
  }, [goal, panelType, context, maxRounds, consensusThreshold, autoApproveCheckpoints, startMission, toast]);

  // Handle reset
  const handleReset = useCallback(() => {
    reset();
    setHasStarted(false);
    setGoal('');
    setContext('');
  }, [reset]);

  // Get panel type metadata
  const selectedPanelMeta = PANEL_TYPES.find((p) => p.type === panelType) || PANEL_TYPES[0];

  // Show mission view once started
  if (hasStarted) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center justify-between bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/ask-panel')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                {selectedPanelMeta.icon}
              </div>
              <div>
                <h1 className="font-semibold">{selectedPanelMeta.title}</h1>
                <p className="text-xs text-muted-foreground line-clamp-1">{goal}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {state.status === 'completed' || state.status === 'failed' || state.status === 'cancelled' ? (
              <Button variant="outline" onClick={handleReset}>
                Start New Panel
              </Button>
            ) : null}
          </div>
        </div>

        {/* Mission View */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto">
            <PanelAutonomousView
              state={state}
              isLoading={isLoading}
              isStreaming={isStreaming}
              onResolveCheckpoint={resolveCheckpoint}
              onPause={pauseMission}
              onResume={resumeMission}
              onCancel={cancelMission}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show configuration form
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center gap-3 bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => router.push('/ask-panel')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold">Autonomous Panel</h1>
            <p className="text-xs text-muted-foreground">Multi-expert discussion with consensus</p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Panel Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Panel Type</CardTitle>
              <CardDescription>Choose the discussion format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PANEL_TYPES.map((panel) => (
                  <motion.button
                    key={panel.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPanelType(panel.type)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      panelType === panel.type
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`${panelType === panel.type ? 'text-purple-600' : 'text-muted-foreground'}`}>
                        {panel.icon}
                      </div>
                      <span className="font-medium text-sm">{panel.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{panel.description}</p>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goal Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question or Goal</CardTitle>
              <CardDescription>What would you like the panel to discuss?</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your question or goal for the panel discussion..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          {/* Context (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Context</CardTitle>
              <CardDescription>Optional background information</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Provide any relevant context, constraints, or background information..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-[80px]"
              />
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Advanced Options</CardTitle>
              <CardDescription>Fine-tune the panel discussion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Max Rounds */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Maximum Rounds</Label>
                  <span className="text-sm text-muted-foreground">{maxRounds}</span>
                </div>
                <Slider
                  value={[maxRounds]}
                  onValueChange={(v) => setMaxRounds(v[0])}
                  min={1}
                  max={5}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  Number of discussion rounds before final synthesis
                </p>
              </div>

              {/* Consensus Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Consensus Threshold</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(consensusThreshold * 100)}%
                  </span>
                </div>
                <Slider
                  value={[consensusThreshold * 100]}
                  onValueChange={(v) => setConsensusThreshold(v[0] / 100)}
                  min={50}
                  max={95}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum agreement level to conclude early
                </p>
              </div>

              {/* Auto-approve Checkpoints */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve Checkpoints</Label>
                  <p className="text-xs text-muted-foreground">
                    Skip HITL review points and continue automatically
                  </p>
                </div>
                <Switch
                  checked={autoApproveCheckpoints}
                  onCheckedChange={setAutoApproveCheckpoints}
                />
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <div className="flex justify-end gap-3 pb-6">
            <Button variant="outline" onClick={() => router.push('/ask-panel')}>
              Cancel
            </Button>
            <Button
              onClick={handleStart}
              disabled={!goal.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Panel Discussion
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PanelAutonomousPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <PanelAutonomousContent />
    </Suspense>
  );
}
