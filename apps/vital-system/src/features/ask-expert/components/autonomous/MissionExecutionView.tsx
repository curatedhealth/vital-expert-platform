'use client';

/**
 * VITAL Platform - MissionExecutionView Component
 *
 * Main execution view for autonomous missions (Modes 3 & 4).
 * Orchestrates the entire mission lifecycle with:
 * - Real-time SSE event handling (15+ event types)
 * - Task progress tracking
 * - HITL checkpoint management
 * - Progressive disclosure of reasoning
 * - Artifact and source collection
 *
 * Aligned with: services/ai-engine/docs/FRONTEND_INTEGRATION_REFERENCE.md
 *
 * Design System: VITAL Brand v6.0 (Purple Theme #9055E0)
 * Phase 3 Implementation - December 11, 2025
 */

import { useState, useEffect, useCallback, useReducer, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  StopCircle,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Clock,
  Zap,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Brain,
  Target,
  FileText,
  Link2,
  MessageSquare,
  Users,
  Settings,
  Maximize2,
  Minimize2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Expert } from '../interactive/ExpertPicker';
import { StrategyPane, type Strategy } from './StrategyPane';

// Import comprehensive types from mission-runners
import type {
  MissionTemplate,
  MissionTask,
  MissionConfig,
  MissionStatus,
  MissionEvent,
  Artifact,
  Source,
  Checkpoint,
  QualityMetric,
  AgentLevel,
} from '../../types/mission-runners';

// =============================================================================
// TYPES
// =============================================================================

export interface MissionExecutionViewProps {
  /** Mission template being executed */
  template: MissionTemplate;
  /** Selected expert agent */
  expert: Expert;
  /** User configuration */
  config: MissionConfig;
  /** Mission ID (from API) */
  missionId?: string;
  /** Callback when mission completes */
  onComplete: (result: MissionResult) => void;
  /** Callback when mission fails */
  onError: (error: string) => void;
  /** Callback to abort mission */
  onAbort: () => void;
  /** Custom class names */
  className?: string;
}

export interface MissionResult {
  missionId: string;
  outputs: Record<string, unknown>;
  artifacts: Artifact[];
  sources: Source[];
  qualityScores: Record<QualityMetric, number>;
  totalCost: number;
  totalTokens: number;
  totalDuration: number;
}

interface ExecutionState {
  status: MissionStatus;
  currentTaskId: string | null;
  completedTasks: string[];
  failedTasks: string[];
  taskProgress: Record<string, number>;
  taskOutputs: Record<string, unknown>;
  artifacts: Artifact[];
  sources: Source[];
  qualityScores: Record<string, number>;
  thinkingContent: string;
  reasoningSteps: Array<{ step: number; content: string }>;
  delegations: Array<{ from: string; to: string; reason: string }>;
  checkpointPending: Checkpoint | null;
  totalCost: number;
  totalTokens: number;
  startedAt: Date | null;
  error: string | null;
}

type ExecutionAction =
  | { type: 'MISSION_STARTED'; missionId: string }
  | { type: 'TASK_STARTED'; taskId: string; taskName: string; level: AgentLevel }
  | { type: 'TASK_PROGRESS'; taskId: string; progress: number; message: string }
  | { type: 'TASK_COMPLETED'; taskId: string; output: unknown; durationMs: number }
  | { type: 'TASK_FAILED'; taskId: string; error: string }
  | { type: 'CHECKPOINT_REACHED'; checkpoint: Checkpoint }
  | { type: 'CHECKPOINT_RESOLVED'; checkpointId: string; decision: string }
  | { type: 'DELEGATION'; from: string; to: string; reason: string }
  | { type: 'THINKING'; agentId: string; content: string }
  | { type: 'REASONING'; step: number; content: string }
  | { type: 'ARTIFACT_CREATED'; artifact: Artifact }
  | { type: 'SOURCE_FOUND'; source: Source }
  | { type: 'QUALITY_SCORE'; metric: string; score: number }
  | { type: 'BUDGET_WARNING'; currentCost: number; maxCost: number }
  | { type: 'MISSION_COMPLETED'; outputs: unknown; totalCost: number; totalDuration: number }
  | { type: 'MISSION_FAILED'; error: string; failedTask?: string }
  | { type: 'MISSION_PAUSED'; reason: string }
  | { type: 'RESET' };

// =============================================================================
// REDUCER
// =============================================================================

const initialState: ExecutionState = {
  status: 'pending',
  currentTaskId: null,
  completedTasks: [],
  failedTasks: [],
  taskProgress: {},
  taskOutputs: {},
  artifacts: [],
  sources: [],
  qualityScores: {},
  thinkingContent: '',
  reasoningSteps: [],
  delegations: [],
  checkpointPending: null,
  totalCost: 0,
  totalTokens: 0,
  startedAt: null,
  error: null,
};

function executionReducer(state: ExecutionState, action: ExecutionAction): ExecutionState {
  switch (action.type) {
    case 'MISSION_STARTED':
      return {
        ...state,
        status: 'running',
        startedAt: new Date(),
        error: null,
      };

    case 'TASK_STARTED':
      return {
        ...state,
        currentTaskId: action.taskId,
        taskProgress: { ...state.taskProgress, [action.taskId]: 0 },
        thinkingContent: '',
      };

    case 'TASK_PROGRESS':
      return {
        ...state,
        taskProgress: { ...state.taskProgress, [action.taskId]: action.progress },
      };

    case 'TASK_COMPLETED':
      return {
        ...state,
        currentTaskId: null,
        completedTasks: [...state.completedTasks, action.taskId],
        taskProgress: { ...state.taskProgress, [action.taskId]: 100 },
        taskOutputs: { ...state.taskOutputs, [action.taskId]: action.output },
      };

    case 'TASK_FAILED':
      return {
        ...state,
        currentTaskId: null,
        failedTasks: [...state.failedTasks, action.taskId],
        error: action.error,
      };

    case 'CHECKPOINT_REACHED':
      return {
        ...state,
        status: 'paused',
        checkpointPending: action.checkpoint,
      };

    case 'CHECKPOINT_RESOLVED':
      return {
        ...state,
        status: 'running',
        checkpointPending: null,
      };

    case 'DELEGATION':
      return {
        ...state,
        delegations: [...state.delegations, { from: action.from, to: action.to, reason: action.reason }],
      };

    case 'THINKING':
      return {
        ...state,
        thinkingContent: action.content,
      };

    case 'REASONING':
      return {
        ...state,
        reasoningSteps: [...state.reasoningSteps, { step: action.step, content: action.content }],
      };

    case 'ARTIFACT_CREATED':
      return {
        ...state,
        artifacts: [...state.artifacts, action.artifact],
      };

    case 'SOURCE_FOUND':
      return {
        ...state,
        sources: [...state.sources, action.source],
      };

    case 'QUALITY_SCORE':
      return {
        ...state,
        qualityScores: { ...state.qualityScores, [action.metric]: action.score },
      };

    case 'BUDGET_WARNING':
      return state; // Could show warning UI

    case 'MISSION_COMPLETED':
      return {
        ...state,
        status: 'completed',
        totalCost: action.totalCost,
      };

    case 'MISSION_FAILED':
      return {
        ...state,
        status: 'failed',
        error: action.error,
      };

    case 'MISSION_PAUSED':
      return {
        ...state,
        status: 'paused',
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getTaskStatus = (
  taskId: string,
  currentTaskId: string | null,
  completedTasks: string[],
  failedTasks: string[]
): 'pending' | 'active' | 'complete' | 'failed' => {
  if (completedTasks.includes(taskId)) return 'complete';
  if (failedTasks.includes(taskId)) return 'failed';
  if (taskId === currentTaskId) return 'active';
  return 'pending';
};

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

const formatCost = (cost: number): string => {
  return `$${cost.toFixed(2)}`;
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface TaskCardProps {
  task: MissionTask;
  status: 'pending' | 'active' | 'complete' | 'failed';
  progress: number;
  output?: unknown;
  isExpanded: boolean;
  onToggle: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  status,
  progress,
  output,
  isExpanded,
  onToggle,
}) => {
  const statusConfig = {
    pending: { icon: <div className="w-4 h-4 rounded-full border-2 border-neutral-400" />, color: 'text-neutral-400' },
    active: { icon: <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />, color: 'text-purple-500' },
    complete: { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, color: 'text-green-500' },
    failed: { icon: <AlertTriangle className="w-4 h-4 text-red-500" />, color: 'text-red-500' },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-neutral-800/50 rounded-lg border transition-colors',
        status === 'active' ? 'border-purple-500/50' : 'border-neutral-700/50',
        status === 'failed' && 'border-red-500/50'
      )}
    >
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center gap-3 text-left"
      >
        {config.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={cn('text-sm font-medium', config.color)}>
              {task.name}
            </p>
            <span className="text-xs text-neutral-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.estimatedMinutes}m
            </span>
          </div>
          {status === 'active' && (
            <div className="mt-2">
              <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 border-t border-neutral-700/50">
              <p className="text-xs text-neutral-400 mt-2">
                {task.description}
              </p>
              {task.tools && task.tools.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.tools.map(tool => (
                    <span
                      key={tool}
                      className="px-2 py-0.5 text-xs bg-neutral-700/50 text-neutral-300 rounded"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              )}
              {status === 'complete' && output != null && (
                <div className="mt-2 p-2 bg-green-500/10 rounded text-xs text-green-300">
                  {typeof output === 'string' ? output : 'Task completed successfully'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const MissionExecutionView: React.FC<MissionExecutionViewProps> = ({
  template,
  expert,
  config,
  missionId,
  onComplete,
  onError,
  onAbort,
  className,
}) => {
  const [state, dispatch] = useReducer(executionReducer, initialState);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showStrategy, setShowStrategy] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Build strategy from template
  const strategy: Strategy = useMemo(() => ({
    overview: `Executing "${template.name}" mission with ${expert.name}`,
    approach: template.longDescription || template.description,
    steps: template.tasks.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description,
      estimatedDuration: `${task.estimatedMinutes}m`,
      tools: task.tools || [],
      status: getTaskStatus(task.id, state.currentTaskId, state.completedTasks, state.failedTasks),
    })),
    expectedOutputs: template.outputs?.map(o => ({
      id: o.name,
      name: o.name,
      type: o.type === 'markdown' ? 'document' : o.type === 'structured_data' ? 'data' : 'summary' as const,
      description: o.description,
    })) || [],
    estimatedTotalDuration: `${template.estimatedDurationMin}-${template.estimatedDurationMax} min`,
    confidence: 85,
  }), [template, expert, state.currentTaskId, state.completedTasks, state.failedTasks]);

  // Calculate progress
  const overallProgress = useMemo(() => {
    if (!template.tasks.length) return 0;
    return Math.round((state.completedTasks.length / template.tasks.length) * 100);
  }, [state.completedTasks.length, template.tasks.length]);

  // Calculate elapsed time
  const elapsedTime = useMemo(() => {
    if (!state.startedAt) return '0s';
    const elapsed = Date.now() - state.startedAt.getTime();
    return formatDuration(elapsed);
  }, [state.startedAt]);

  // Toggle task expansion
  const toggleTask = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  // Handle checkpoint decisions
  const handleCheckpointDecision = useCallback((decision: 'approve' | 'reject' | 'modify') => {
    if (!state.checkpointPending) return;

    // In real implementation, send decision to API
    dispatch({
      type: 'CHECKPOINT_RESOLVED',
      checkpointId: state.checkpointPending.id,
      decision
    });
  }, [state.checkpointPending]);

  // SSE event handler (would connect to real API)
  const handleSSEEvent = useCallback((event: MissionEvent) => {
    switch (event.event) {
      case 'mission_started':
        dispatch({ type: 'MISSION_STARTED', missionId: event.missionId });
        break;
      case 'task_started':
        dispatch({ type: 'TASK_STARTED', taskId: event.taskId, taskName: event.taskName, level: event.level });
        break;
      case 'task_progress':
        dispatch({ type: 'TASK_PROGRESS', taskId: event.taskId, progress: event.progress, message: event.message });
        break;
      case 'task_completed':
        dispatch({ type: 'TASK_COMPLETED', taskId: event.taskId, output: event.output, durationMs: event.durationMs });
        break;
      case 'checkpoint_reached':
        // Find checkpoint from template
        const checkpoint = template.checkpoints.find(c => c.id === event.checkpointId);
        if (checkpoint) {
          dispatch({ type: 'CHECKPOINT_REACHED', checkpoint });
        }
        break;
      case 'checkpoint_resolved':
        dispatch({ type: 'CHECKPOINT_RESOLVED', checkpointId: event.checkpointId, decision: event.decision });
        break;
      case 'delegation':
        dispatch({ type: 'DELEGATION', from: event.fromAgent, to: event.toAgent, reason: event.reason });
        break;
      case 'thinking':
        dispatch({ type: 'THINKING', agentId: event.agentId, content: event.content });
        break;
      case 'reasoning':
        dispatch({ type: 'REASONING', step: event.step, content: event.content });
        break;
      case 'artifact_created':
        dispatch({
          type: 'ARTIFACT_CREATED',
          artifact: {
            id: event.artifactId,
            name: event.name,
            type: event.type as Artifact['type'],
            format: '',
            createdAt: new Date().toISOString(),
          },
        });
        break;
      case 'source_found':
        dispatch({
          type: 'SOURCE_FOUND',
          source: {
            id: event.sourceId,
            title: event.title,
            url: event.url,
            type: 'website',
          },
        });
        break;
      case 'quality_score':
        dispatch({ type: 'QUALITY_SCORE', metric: event.metric, score: event.score });
        break;
      case 'mission_completed':
        dispatch({ type: 'MISSION_COMPLETED', outputs: event.outputs, totalCost: event.totalCost, totalDuration: event.totalDuration });
        onComplete({
          missionId: missionId || '',
          outputs: event.outputs as Record<string, unknown>,
          artifacts: state.artifacts,
          sources: state.sources,
          qualityScores: state.qualityScores as Record<QualityMetric, number>,
          totalCost: event.totalCost,
          totalTokens: state.totalTokens,
          totalDuration: event.totalDuration,
        });
        break;
      case 'mission_failed':
        dispatch({ type: 'MISSION_FAILED', error: event.error, failedTask: event.failedTask });
        onError(event.error);
        break;
    }
  }, [template.checkpoints, missionId, onComplete, onError, state.artifacts, state.sources, state.qualityScores, state.totalTokens]);

  // Simulate mission start (in real implementation, connect to SSE)
  useEffect(() => {
    // Auto-start mission when component mounts
    if (state.status === 'pending') {
      // Simulate mission start
      setTimeout(() => {
        handleSSEEvent({ event: 'mission_started', missionId: missionId || 'sim-001', templateId: template.id });

        // Simulate first task starting
        if (template.tasks.length > 0) {
          setTimeout(() => {
            handleSSEEvent({
              event: 'task_started',
              taskId: template.tasks[0].id,
              taskName: template.tasks[0].name,
              level: template.tasks[0].assignedLevel,
            });
          }, 500);
        }
      }, 100);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'flex flex-col h-full bg-neutral-950',
        isFullscreen && 'fixed inset-0 z-50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{template.name}</h2>
            <p className="text-sm text-neutral-400">
              Expert: {expert.name} • {state.status === 'running' ? 'In Progress' : state.status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Indicators */}
          <div className="flex items-center gap-4 mr-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-neutral-500" />
              <span className="text-neutral-300">{elapsedTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-neutral-500" />
              <span className="text-neutral-300">{formatCost(state.totalCost)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-neutral-500" />
              <span className="text-neutral-300">{overallProgress}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          {state.status === 'running' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: 'MISSION_PAUSED', reason: 'User requested' })}
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          )}
          {state.status === 'paused' && !state.checkpointPending && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: 'MISSION_STARTED', missionId: missionId || '' })}
              className="border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              <Play className="w-4 h-4 mr-1" />
              Resume
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onAbort}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <StopCircle className="w-4 h-4 mr-1" />
            Abort
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-neutral-800">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Strategy & Tasks */}
        <div className="w-1/3 border-r border-neutral-800 flex flex-col overflow-hidden">
          {/* Strategy Section */}
          <div className="p-4 border-b border-neutral-800">
            <button
              onClick={() => setShowStrategy(!showStrategy)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-medium text-white">Mission Strategy</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-neutral-400 transition-transform',
                  !showStrategy && '-rotate-90'
                )}
              />
            </button>
          </div>

          <AnimatePresence>
            {showStrategy && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4">
                  <StrategyPane
                    strategy={strategy}
                    currentStepId={state.currentTaskId || undefined}
                    isExpanded={true}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tasks Section */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-white mb-3">Tasks</h3>
            <div className="space-y-2">
              {template.tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  status={getTaskStatus(task.id, state.currentTaskId, state.completedTasks, state.failedTasks)}
                  progress={state.taskProgress[task.id] || 0}
                  output={state.taskOutputs[task.id]}
                  isExpanded={expandedTasks.has(task.id)}
                  onToggle={() => toggleTask(task.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Live Output */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Checkpoint Banner */}
          <AnimatePresence>
            {state.checkpointPending && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-amber-500/10 border-b border-amber-500/30"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-amber-300">
                        Checkpoint: {state.checkpointPending.name}
                      </h4>
                      <p className="text-sm text-amber-200/70 mt-1">
                        {state.checkpointPending.description}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleCheckpointDecision('approve')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Approve & Continue
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckpointDecision('modify')}
                          className="border-amber-500/50 text-amber-300"
                        >
                          Modify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckpointDecision('reject')}
                          className="border-red-500/50 text-red-300"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Thinking/Reasoning Display */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Current Thinking */}
            {state.thinkingContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">Agent Thinking</span>
                </div>
                <p className="text-sm text-neutral-300 whitespace-pre-wrap">
                  {state.thinkingContent}
                </p>
              </motion.div>
            )}

            {/* Reasoning Steps */}
            {state.reasoningSteps.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  Reasoning Chain
                </h4>
                <div className="space-y-2">
                  {state.reasoningSteps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-3 p-3 bg-neutral-800/50 rounded-lg"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs flex items-center justify-center">
                        {step.step}
                      </span>
                      <p className="text-sm text-neutral-300">{step.content}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Delegations */}
            {state.delegations.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Agent Delegations
                </h4>
                <div className="space-y-2">
                  {state.delegations.map((del, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 p-2 bg-cyan-500/10 rounded-lg text-sm"
                    >
                      <span className="text-cyan-300">{del.from}</span>
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                      <span className="text-cyan-300">{del.to}</span>
                      <span className="text-neutral-400 text-xs ml-2">({del.reason})</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Artifacts */}
            {state.artifacts.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-400" />
                  Generated Artifacts
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {state.artifacts.map(artifact => (
                    <motion.div
                      key={artifact.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                    >
                      <p className="text-sm font-medium text-green-300">{artifact.name}</p>
                      <p className="text-xs text-neutral-400 mt-1">{artifact.type}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            {state.sources.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-purple-400" />
                  Sources Found
                </h4>
                <div className="space-y-2">
                  {state.sources.map(source => (
                    <motion.div
                      key={source.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 p-2 bg-purple-500/10 rounded-lg"
                    >
                      <Link2 className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-purple-300 truncate">{source.title}</span>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400 hover:underline ml-auto"
                        >
                          Open
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!state.thinkingContent && state.reasoningSteps.length === 0 && state.status === 'running' && (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p className="text-sm">Processing mission...</p>
                <p className="text-xs text-neutral-500 mt-1">Agent output will appear here</p>
              </div>
            )}
          </div>

          {/* Quality Scores Footer */}
          {Object.keys(state.qualityScores).length > 0 && (
            <div className="p-3 border-t border-neutral-800 bg-neutral-900/50">
              <div className="flex items-center gap-4">
                <span className="text-xs text-neutral-500">Quality Scores:</span>
                {Object.entries(state.qualityScores).map(([metric, score]) => (
                  <div key={metric} className="flex items-center gap-1">
                    <span className="text-xs text-neutral-400">{metric}:</span>
                    <span className={cn(
                      'text-xs font-medium',
                      score >= 0.8 ? 'text-green-400' : score >= 0.6 ? 'text-amber-400' : 'text-red-400'
                    )}>
                      {(score * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MissionExecutionView;
