'use client';

/**
 * VitalMissionComplete - Mission Results Display
 *
 * Final results view for completed Mode 3/4 autonomous missions.
 * Shows deliverables, artifacts, executive summary, and follow-up actions.
 *
 * Features:
 * - Executive summary with key findings
 * - Downloadable artifacts (documents, charts, data)
 * - Full transcript/log access
 * - Share/Export functionality
 * - Feedback collection
 * - Related mission suggestions
 * - Execution metrics summary
 *
 * Used by: Mode 3 (Expert Control), Mode 4 (AI Wizard)
 *
 * @example
 * ```tsx
 * <VitalMissionComplete
 *   missionId="mission-123"
 *   result={missionResult}
 *   artifacts={artifacts}
 *   metrics={executionMetrics}
 *   onDownloadArtifact={(id) => download(id)}
 *   onShare={() => shareMission()}
 *   onNewMission={() => startNewMission()}
 * />
 * ```
 */

import { useState, useCallback, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  CheckCircle2,
  XCircle,
  Download,
  Share2,
  FileText,
  BarChart3,
  Table,
  Quote,
  Database,
  Clock,
  Coins,
  Zap,
  Users,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
  BookOpen,
  Target,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// =============================================================================
// TYPES
// =============================================================================

export type MissionOutcome = 'success' | 'partial' | 'failed' | 'cancelled';
export type ArtifactType = 'document' | 'chart' | 'table' | 'summary' | 'citation' | 'raw_data' | 'other';

export interface MissionResult {
  /** Overall outcome */
  outcome: MissionOutcome;
  /** Executive summary (markdown) */
  executiveSummary: string;
  /** Key findings/insights */
  keyFindings?: string[];
  /** Recommendations */
  recommendations?: string[];
  /** Caveats or limitations */
  caveats?: string[];
  /** Confidence level (0-100) */
  confidenceLevel?: number;
  /** Sources consulted count */
  sourcesConsulted?: number;
}

export interface MissionArtifact {
  /** Artifact ID */
  id: string;
  /** Artifact type (optional - defaults to 'other' if missing or unknown) */
  type?: ArtifactType | string;
  /** Title */
  title: string;
  /** Description */
  description?: string;
  /** File size in bytes */
  sizeBytes?: number;
  /** MIME type */
  mimeType?: string;
  /** Preview content (markdown or URL) */
  preview?: string;
  /** Download URL */
  downloadUrl?: string;
  /** Creation timestamp */
  createdAt: Date;
}

export interface ExecutionMetrics {
  /** Total duration in seconds */
  totalDurationSeconds: number;
  /** Tokens used */
  tokensUsed: number;
  /** Estimated cost in USD */
  estimatedCostUsd: number;
  /** Number of agent handoffs */
  agentHandoffs: number;
  /** Number of tool calls */
  toolCalls: number;
  /** Number of checkpoints passed */
  checkpointsPassed: number;
  /** Sources consulted */
  sourcesConsulted: number;
}

export interface RelatedMission {
  /** Template ID */
  templateId: string;
  /** Template name */
  name: string;
  /** Description */
  description: string;
  /** Family/category */
  family: string;
}

export interface VitalMissionCompleteProps {
  /** Mission ID */
  missionId: string;
  /** Mission title/goal */
  missionTitle: string;
  /** Mission result */
  result: MissionResult;
  /** Collected artifacts */
  artifacts: MissionArtifact[];
  /** Execution metrics */
  metrics?: ExecutionMetrics;
  /** Agent team that executed the mission */
  teamAgents?: Array<{ name: string; avatar?: string; role: string }>;
  /** Related missions for follow-up */
  relatedMissions?: RelatedMission[];
  /** Called when user downloads an artifact */
  onDownloadArtifact?: (artifactId: string) => void;
  /** Called when user downloads all artifacts */
  onDownloadAll?: () => void;
  /** Called when user shares the mission */
  onShare?: () => void;
  /** Called when user copies results */
  onCopy?: () => void;
  /** Called when user submits feedback */
  onFeedback?: (rating: 'positive' | 'negative', comment?: string) => void;
  /** Called when user starts a new mission */
  onNewMission?: () => void;
  /** Called when user selects a related mission */
  onSelectRelatedMission?: (templateId: string) => void;
  /** Called when user views full transcript */
  onViewTranscript?: () => void;
  /** Mode 3 or Mode 4 - affects theming */
  mode?: 'mode3' | 'mode4';
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getArtifactIcon(type: ArtifactType) {
  switch (type) {
    case 'document':
      return <FileText className="w-4 h-4" />;
    case 'chart':
      return <BarChart3 className="w-4 h-4" />;
    case 'table':
      return <Table className="w-4 h-4" />;
    case 'summary':
      return <BookOpen className="w-4 h-4" />;
    case 'citation':
      return <Quote className="w-4 h-4" />;
    case 'raw_data':
      return <Database className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function formatTokens(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(2)}M`;
}

function getOutcomeConfig(outcome: MissionOutcome) {
  switch (outcome) {
    case 'success':
      return {
        icon: <CheckCircle2 className="w-6 h-6" />,
        label: 'Mission Completed',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
      };
    case 'partial':
      return {
        icon: <AlertTriangle className="w-6 h-6" />,
        label: 'Partial Completion',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
      };
    case 'failed':
      return {
        icon: <XCircle className="w-6 h-6" />,
        label: 'Mission Failed',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
      };
    case 'cancelled':
      return {
        icon: <XCircle className="w-6 h-6" />,
        label: 'Mission Cancelled',
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
      };
    default:
      return {
        icon: <Info className="w-6 h-6" />,
        label: 'Unknown',
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
      };
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function VitalMissionComplete({
  missionId,
  missionTitle,
  result,
  artifacts,
  metrics,
  teamAgents = [],
  relatedMissions = [],
  onDownloadArtifact,
  onDownloadAll,
  onShare,
  onCopy,
  onFeedback,
  onNewMission,
  onSelectRelatedMission,
  onViewTranscript,
  mode = 'mode3',
  className,
}: VitalMissionCompleteProps) {
  const [feedbackRating, setFeedbackRating] = useState<'positive' | 'negative' | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

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
    button: mode === 'mode3'
      ? 'bg-purple-600 hover:bg-purple-700'
      : 'bg-amber-600 hover:bg-amber-700',
  }), [mode]);

  const outcomeConfig = getOutcomeConfig(result.outcome);

  // Handle feedback submission
  const handleFeedbackSubmit = useCallback(() => {
    if (feedbackRating && onFeedback) {
      onFeedback(feedbackRating, feedbackComment || undefined);
      setShowFeedbackForm(false);
    }
  }, [feedbackRating, feedbackComment, onFeedback]);

  // Group artifacts by type (handles unknown types gracefully)
  const artifactsByType = useMemo(() => {
    const knownTypes: ArtifactType[] = ['document', 'chart', 'table', 'summary', 'citation', 'raw_data', 'other'];
    const grouped: Record<ArtifactType, MissionArtifact[]> = {
      document: [],
      chart: [],
      table: [],
      summary: [],
      citation: [],
      raw_data: [],
      other: [],
    };
    artifacts.forEach((artifact) => {
      // Handle missing or unknown artifact types
      const type = artifact.type && knownTypes.includes(artifact.type)
        ? artifact.type
        : 'other';
      grouped[type].push(artifact);
    });
    return grouped;
  }, [artifacts]);

  return (
    <div className={cn('flex flex-col h-full bg-white rounded-xl border overflow-hidden', className)}>
      {/* Success Header */}
      <div className={cn('p-6 border-b', outcomeConfig.bg)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center',
              outcomeConfig.bg,
              outcomeConfig.border,
              'border-2'
            )}>
              <span className={outcomeConfig.color}>{outcomeConfig.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('text-sm font-medium', outcomeConfig.color)}>
                  {outcomeConfig.label}
                </span>
                {result.confidenceLevel && (
                  <Badge variant="outline" className="text-xs">
                    {result.confidenceLevel}% confidence
                  </Badge>
                )}
              </div>
              <h1 className="text-xl font-bold text-slate-900">{missionTitle}</h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            )}
            {onCopy && (
              <Button variant="outline" size="sm" onClick={onCopy}>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            )}
            {onDownloadAll && artifacts.length > 0 && (
              <Button
                size="sm"
                className={themeColors.button}
                onClick={onDownloadAll}
              >
                <Download className="w-4 h-4 mr-1" />
                Download All
              </Button>
            )}
          </div>
        </div>

        {/* Metrics Bar */}
        {metrics && (
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{formatDuration(metrics.totalDurationSeconds)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Coins className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">${metrics.estimatedCostUsd.toFixed(4)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{formatTokens(metrics.tokensUsed)} tokens</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{metrics.sourcesConsulted} sources</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{metrics.agentHandoffs} handoffs</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 pt-4 border-b">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="artifacts">
                Artifacts {artifacts.length > 0 && `(${artifacts.length})`}
              </TabsTrigger>
              {teamAgents.length > 0 && (
                <TabsTrigger value="team">Team</TabsTrigger>
              )}
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            {/* Summary Tab */}
            <TabsContent value="summary" className="p-6 m-0">
              {/* Executive Summary */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Executive Summary</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap">{result.executiveSummary}</p>
                </div>
              </div>

              {/* Key Findings */}
              {result.keyFindings && result.keyFindings.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">Key Findings</h2>
                  <ul className="space-y-2">
                    {result.keyFindings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium',
                          themeColors.bg,
                          themeColors.text
                        )}>
                          {idx + 1}
                        </div>
                        <p className="text-slate-700">{finding}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">Recommendations</h2>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                        <Target className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-700">{rec}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Caveats */}
              {result.caveats && result.caveats.length > 0 && (
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Caveats & Limitations ({result.caveats.length})</span>
                    <ChevronDown className="w-4 h-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <ul className="space-y-2">
                      {result.caveats.map((caveat, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-700">{caveat}</p>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </TabsContent>

            {/* Artifacts Tab */}
            <TabsContent value="artifacts" className="p-6 m-0">
              {artifacts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No artifacts were generated</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(artifactsByType).map(([type, typeArtifacts]) => {
                    if (typeArtifacts.length === 0) return null;
                    return (
                      <div key={type}>
                        <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                          {getArtifactIcon(type as ArtifactType)}
                          {type.replace('_', ' ')}s ({typeArtifacts.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {typeArtifacts.map((artifact) => (
                            <div
                              key={artifact.id}
                              className="p-4 rounded-xl border bg-white hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
                              onClick={() => onDownloadArtifact?.(artifact.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  'w-10 h-10 rounded-lg flex items-center justify-center',
                                  themeColors.bg,
                                  themeColors.text
                                )}>
                                  {getArtifactIcon(artifact.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-slate-900 truncate">
                                    {artifact.title}
                                  </h4>
                                  {artifact.description && (
                                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                                      {artifact.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                    <span>{formatFileSize(artifact.sizeBytes)}</span>
                                    {artifact.mimeType && (
                                      <>
                                        <span>•</span>
                                        <span>{artifact.mimeType}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <Download className="w-4 h-4 text-slate-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="p-6 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamAgents.map((agent, idx) => (
                  <div key={idx} className="p-4 rounded-xl border bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        {agent.avatar ? (
                          <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <Users className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{agent.name}</h4>
                        <p className="text-sm text-slate-500">{agent.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="p-6 m-0">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-50">
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Mission ID</h3>
                  <code className="text-sm text-slate-800">{missionId}</code>
                </div>

                {onViewTranscript && (
                  <Button variant="outline" className="w-full" onClick={onViewTranscript}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Full Transcript
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Footer - Feedback & Next Actions */}
      <div className="p-4 border-t bg-slate-50">
        {/* Feedback Section */}
        {onFeedback && !feedbackRating && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-600">Was this mission helpful?</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFeedbackRating('positive');
                  setShowFeedbackForm(true);
                }}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Yes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFeedbackRating('negative');
                  setShowFeedbackForm(true);
                }}
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                No
              </Button>
            </div>
          </div>
        )}

        {showFeedbackForm && (
          <div className="mb-4 p-3 rounded-lg border bg-white">
            <p className="text-sm text-slate-600 mb-2">
              {feedbackRating === 'positive' ? 'What did you like?' : 'How can we improve?'}
            </p>
            <Textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Optional: Add a comment..."
              className="mb-2"
              rows={2}
            />
            <Button size="sm" onClick={handleFeedbackSubmit}>
              Submit Feedback
            </Button>
          </div>
        )}

        {/* Related Missions */}
        {relatedMissions.length > 0 && (
          <div className="mb-4">
            <span className="text-sm font-medium text-slate-600 block mb-2">Related Missions</span>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {relatedMissions.map((mission) => (
                <Button
                  key={mission.templateId}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => onSelectRelatedMission?.(mission.templateId)}
                >
                  <span>{mission.name}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* New Mission Button */}
        {onNewMission && (
          <Button
            className={cn('w-full', themeColors.button)}
            onClick={onNewMission}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Start New Mission
          </Button>
        )}
      </div>
    </div>
  );
}

export default VitalMissionComplete;
