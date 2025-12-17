'use client';

/**
 * VitalMissionExecution - Live Mission Execution Display
 *
 * Real-time streaming display for Mode 3/4 autonomous mission execution.
 * Shows progress, agent activities, checkpoints, and artifacts as they stream in.
 *
 * Features:
 * - Real-time SSE streaming visualization
 * - Progress timeline with phase indicators
 * - Agent activity feed with status updates
 * - HITL checkpoint approval interface
 * - Artifact collection display
 * - Token/cost tracking
 * - Pause/Resume/Cancel controls
 *
 * Used by: Mode 3 (Expert Control), Mode 4 (AI Wizard)
 *
 * @example
 * ```tsx
 * <VitalMissionExecution
 *   missionId="mission-123"
 *   status="executing"
 *   progress={45}
 *   events={streamEvents}
 *   checkpoints={hitlCheckpoints}
 *   onApproveCheckpoint={(id) => approveCheckpoint(id)}
 *   onPause={() => pauseMission()}
 *   onResume={() => resumeMission()}
 *   onCancel={() => cancelMission()}
 * />
 * ```
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Brain,
  FileText,
  MessageSquare,
  Search,
  Database,
  Globe,
  Sparkles,
  User,
  Bot,
  ArrowRight,
  RefreshCw,
  Download,
  ExternalLink,
  Coins,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// =============================================================================
// TYPES
// =============================================================================

export type MissionStatus =
  | 'initializing'
  | 'executing'
  | 'paused'
  | 'awaiting_approval'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type EventType =
  | 'thinking'
  | 'searching'
  | 'analyzing'
  | 'writing'
  | 'tool_call'
  | 'agent_handoff'
  | 'checkpoint_reached'
  | 'artifact_created'
  | 'error'
  | 'message'
  | 'progress_update';

export interface MissionEvent {
  /** Unique event ID */
  id: string;
  /** Event type for icon/styling */
  type: EventType;
  /** Human-readable message */
  message: string;
  /** Agent that generated the event */
  agentName?: string;
  /** Agent level (L1-L5) for hierarchy display */
  agentLevel?: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  /** Agent avatar */
  agentAvatar?: string;
  /** Additional details (tool name, artifact info, etc.) */
  details?: Record<string, unknown>;
  /** Timestamp */
  timestamp: Date;
  /** Duration in ms (for completed actions) */
  durationMs?: number;
}

export interface HITLCheckpoint {
  /** Checkpoint ID */
  id: string;
  /** Checkpoint name */
  name: string;
  /** Description of what needs approval */
  description: string;
  /** Summary of work completed so far */
  workSummary?: string;
  /** Proposed next action */
  proposedAction?: string;
  /** Status */
  status: 'pending' | 'approved' | 'rejected';
  /** Timestamp when checkpoint was reached */
  reachedAt: Date;
  /** Timestamp when checkpoint was resolved */
  resolvedAt?: Date;
}

export interface MissionArtifact {
  /** Artifact ID */
  id: string;
  /** Artifact type */
  type: 'document' | 'chart' | 'table' | 'summary' | 'citation' | 'raw_data';
  /** Title */
  title: string;
  /** Short description */
  description?: string;
  /** Preview content (first N chars or thumbnail URL) */
  preview?: string;
  /** Full content URL or inline content */
  content?: string;
  /** File size in bytes */
  sizeBytes?: number;
  /** Creation timestamp */
  createdAt: Date;
}

export interface MissionMetrics {
  /** Elapsed time in seconds */
  elapsedSeconds: number;
  /** Estimated remaining time in seconds */
  estimatedRemainingSeconds?: number;
  /** Total tokens used */
  tokensUsed: number;
  /** Estimated cost in USD */
  estimatedCostUsd: number;
  /** Number of tool calls made */
  toolCalls: number;
  /** Number of agent handoffs */
  agentHandoffs: number;
  /** Sources consulted */
  sourcesConsulted: number;
}

export interface VitalMissionExecutionProps {
  /** Mission ID */
  missionId: string;
  /** Mission title/goal */
  missionTitle?: string;
  /** Current status */
  status: MissionStatus;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current phase name */
  currentPhase?: string;
  /** Stream of events */
  events: MissionEvent[];
  /** HITL checkpoints */
  checkpoints?: HITLCheckpoint[];
  /** Collected artifacts */
  artifacts?: MissionArtifact[];
  /** Execution metrics */
  metrics?: MissionMetrics;
  /** Called when user approves a checkpoint */
  onApproveCheckpoint?: (checkpointId: string, feedback?: string) => void;
  /** Called when user rejects a checkpoint */
  onRejectCheckpoint?: (checkpointId: string, reason: string) => void;
  /** Called when user pauses mission */
  onPause?: () => void;
  /** Called when user resumes mission */
  onResume?: () => void;
  /** Called when user cancels mission */
  onCancel?: () => void;
  /** Called when user downloads an artifact */
  onDownloadArtifact?: (artifactId: string) => void;
  /** Mode 3 or Mode 4 - affects theming */
  mode?: 'mode3' | 'mode4';
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getEventIcon(type: EventType) {
  switch (type) {
    case 'thinking':
      return <Brain className="w-4 h-4" />;
    case 'searching':
      return <Search className="w-4 h-4" />;
    case 'analyzing':
      return <Zap className="w-4 h-4" />;
    case 'writing':
      return <FileText className="w-4 h-4" />;
    case 'tool_call':
      return <Database className="w-4 h-4" />;
    case 'agent_handoff':
      return <RefreshCw className="w-4 h-4" />;
    case 'checkpoint_reached':
      return <AlertTriangle className="w-4 h-4" />;
    case 'artifact_created':
      return <Download className="w-4 h-4" />;
    case 'error':
      return <XCircle className="w-4 h-4" />;
    case 'message':
      return <MessageSquare className="w-4 h-4" />;
    case 'progress_update':
      return <ArrowRight className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
}

function getEventColor(type: EventType) {
  switch (type) {
    case 'thinking':
      return 'text-purple-600 bg-purple-50';
    case 'searching':
      return 'text-blue-600 bg-blue-50';
    case 'analyzing':
      return 'text-amber-600 bg-amber-50';
    case 'writing':
      return 'text-green-600 bg-green-50';
    case 'tool_call':
      return 'text-cyan-600 bg-cyan-50';
    case 'agent_handoff':
      return 'text-indigo-600 bg-indigo-50';
    case 'checkpoint_reached':
      return 'text-orange-600 bg-orange-50';
    case 'artifact_created':
      return 'text-emerald-600 bg-emerald-50';
    case 'error':
      return 'text-red-600 bg-red-50';
    case 'message':
      return 'text-slate-600 bg-slate-50';
    case 'progress_update':
      return 'text-violet-600 bg-violet-50';
    default:
      return 'text-slate-600 bg-slate-50';
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function formatCost(usd: number): string {
  return `$${usd.toFixed(4)}`;
}

function formatTokens(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(2)}M`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function VitalMissionExecution({
  missionId,
  missionTitle,
  status,
  progress,
  currentPhase,
  events,
  checkpoints = [],
  artifacts = [],
  metrics,
  onApproveCheckpoint,
  onRejectCheckpoint,
  onPause,
  onResume,
  onCancel,
  onDownloadArtifact,
  mode = 'mode3',
  className,
}: VitalMissionExecutionProps) {
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [expandedCheckpoint, setExpandedCheckpoint] = useState<string | null>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest event
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  // Color theming based on mode
  const themeColors = useMemo(() => ({
    primary: mode === 'mode3' ? 'purple' : 'amber',
    gradient: mode === 'mode3'
      ? 'from-purple-500 to-purple-700'
      : 'from-amber-500 to-amber-700',
    shadow: mode === 'mode3' ? 'shadow-purple-500/25' : 'shadow-amber-500/25',
    border: mode === 'mode3' ? 'border-purple-200' : 'border-amber-200',
    bg: mode === 'mode3' ? 'bg-purple-50' : 'bg-amber-50',
    text: mode === 'mode3' ? 'text-purple-700' : 'text-amber-700',
  }), [mode]);

  // Get pending checkpoint
  const pendingCheckpoint = checkpoints.find((cp) => cp.status === 'pending');

  // Limit displayed events unless showing all
  const displayedEvents = showAllEvents ? events : events.slice(-20);

  // Status indicator - NO SPINNERS in header (Activity Feed shows detailed progress)
  const statusConfig = useMemo(() => {
    switch (status) {
      case 'initializing':
        return { icon: <Play className="w-4 h-4" />, label: 'Starting', color: 'text-purple-600' };
      case 'executing':
        return { icon: <Play className="w-4 h-4" />, label: 'Executing', color: 'text-green-600' };
      case 'paused':
        return { icon: <Pause className="w-4 h-4" />, label: 'Paused', color: 'text-amber-600' };
      case 'awaiting_approval':
        return { icon: <AlertTriangle className="w-4 h-4" />, label: 'Awaiting Approval', color: 'text-orange-600' };
      case 'completed':
        return { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Completed', color: 'text-green-600' };
      case 'failed':
        return { icon: <XCircle className="w-4 h-4" />, label: 'Failed', color: 'text-red-600' };
      case 'cancelled':
        return { icon: <Square className="w-4 h-4" />, label: 'Cancelled', color: 'text-slate-600' };
      default:
        return { icon: <Play className="w-4 h-4" />, label: 'Ready', color: 'text-slate-600' };
    }
  }, [status]);

  return (
    <div className={cn('flex flex-col h-full bg-white rounded-xl border', className)}>
      {/* Header */}
      <div className={cn('p-4 border-b', themeColors.bg)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br',
              themeColors.gradient,
              themeColors.shadow
            )}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                {missionTitle || 'Mission Execution'}
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className={cn('flex items-center gap-1', statusConfig.color)}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
                {currentPhase && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{currentPhase}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {status === 'executing' && onPause && (
              <Button variant="outline" size="sm" onClick={onPause}>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
            )}
            {status === 'paused' && onResume && (
              <Button variant="outline" size="sm" onClick={onResume}>
                <Play className="w-4 h-4 mr-1" />
                Resume
              </Button>
            )}
            {(status === 'executing' || status === 'paused') && onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel} className="text-red-600 hover:text-red-700">
                <Square className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className={cn('font-medium', themeColors.text)}>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Events Feed */}
        <div className="flex-1 flex flex-col border-r">
          <div className="p-3 border-b bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Activity Feed</span>
            {events.length > 20 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllEvents(!showAllEvents)}
              >
                {showAllEvents ? 'Show Recent' : `Show All (${events.length})`}
                {showAllEvents ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </Button>
            )}
          </div>

          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2">
              {displayedEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    'flex items-start gap-3 p-2 rounded-lg transition-colors',
                    event.type === 'error' && 'bg-red-50'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    getEventColor(event.type)
                  )}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {event.agentName && (
                        <span className="text-xs font-medium text-slate-500">
                          {event.agentName}
                        </span>
                      )}
                      {event.agentLevel && (
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-[10px] font-semibold',
                          event.agentLevel === 'L1' && 'bg-slate-100 text-slate-600',
                          event.agentLevel === 'L2' && 'bg-blue-100 text-blue-600',
                          event.agentLevel === 'L3' && 'bg-violet-100 text-violet-600',
                          event.agentLevel === 'L4' && 'bg-purple-100 text-purple-600',
                          event.agentLevel === 'L5' && 'bg-fuchsia-100 text-fuchsia-700'
                        )}>
                          {event.agentLevel}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                      {event.durationMs && (
                        <span className="text-xs text-slate-400">
                          ({event.durationMs}ms)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 mt-0.5">{event.message}</p>
                  </div>
                </div>
              ))}
              <div ref={eventsEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Right Sidebar - Checkpoints & Artifacts */}
        <div className="w-80 flex flex-col">
          {/* Pending Checkpoint Alert */}
          {pendingCheckpoint && (
            <div className="p-3 bg-orange-50 border-b border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Approval Required</span>
              </div>
              <p className="text-sm text-orange-700 mb-3">{pendingCheckpoint.description}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => onApproveCheckpoint?.(pendingCheckpoint.id)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700"
                  onClick={() => onRejectCheckpoint?.(pendingCheckpoint.id, 'User rejected')}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          )}

          {/* Metrics */}
          {metrics && (
            <div className="p-3 border-b">
              <span className="text-sm font-medium text-slate-700 mb-2 block">Metrics</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Timer className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{formatDuration(metrics.elapsedSeconds)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{formatCost(metrics.estimatedCostUsd)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{formatTokens(metrics.tokensUsed)} tokens</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Database className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{metrics.toolCalls} tools</span>
                </div>
              </div>
            </div>
          )}

          {/* Artifacts */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b bg-slate-50">
              <span className="text-sm font-medium text-slate-700">
                Artifacts ({artifacts.length})
              </span>
            </div>
            <ScrollArea className="flex-1 p-3">
              {artifacts.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No artifacts yet
                </p>
              ) : (
                <div className="space-y-2">
                  {artifacts.map((artifact) => (
                    <div
                      key={artifact.id}
                      className="p-2 rounded-lg border bg-white hover:border-slate-300 transition-colors cursor-pointer"
                      onClick={() => onDownloadArtifact?.(artifact.id)}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700 truncate flex-1">
                          {artifact.title}
                        </span>
                        <Download className="w-4 h-4 text-slate-400" />
                      </div>
                      {artifact.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {artifact.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Checkpoints History */}
          {checkpoints.length > 0 && (
            <div className="border-t">
              <Collapsible>
                <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">
                    Checkpoints ({checkpoints.length})
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-3 pt-0 space-y-2">
                    {checkpoints.map((checkpoint) => (
                      <div
                        key={checkpoint.id}
                        className={cn(
                          'p-2 rounded-lg text-sm',
                          checkpoint.status === 'approved' && 'bg-green-50 text-green-700',
                          checkpoint.status === 'rejected' && 'bg-red-50 text-red-700',
                          checkpoint.status === 'pending' && 'bg-orange-50 text-orange-700'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {checkpoint.status === 'approved' && <CheckCircle2 className="w-4 h-4" />}
                          {checkpoint.status === 'rejected' && <XCircle className="w-4 h-4" />}
                          {checkpoint.status === 'pending' && <AlertTriangle className="w-4 h-4" />}
                          <span className="font-medium">{checkpoint.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VitalMissionExecution;
