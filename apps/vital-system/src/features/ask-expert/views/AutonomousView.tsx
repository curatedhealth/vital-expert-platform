'use client';

/**
 * VITAL Platform - AutonomousView Component
 *
 * Master view for Modes 3 & 4 (Autonomous/Background modes):
 * - Mode 3 (Deep Research): Agent selected from SIDEBAR → Configure mission → Autonomous execution
 * - Mode 4 (Background): AI selects expert (FusionSelector) → Autonomous execution
 *
 * Mission Phases:
 * Mode 3: goal → template → briefing → execution → complete (agent from sidebar)
 * Mode 4: mission_family → goal → template → briefing → execution → complete
 *
 * Key Differences:
 * - Mode 3: User selects agent from SIDEBAR, then main view shows mission configuration
 * - Mode 4: User selects mission FAMILY first, AI auto-selects agents
 *
 * Architecture:
 * - Uses streamReducer for centralized SSE state management
 * - HITL checkpoints for human approval at critical points
 * - Purple theme for Mode 3, Amber for Mode 4
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 * Phase 3 Implementation - December 13, 2025
 * REFACTORED to use @vital/ai-ui shared components
 */

import { useState, useReducer, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  BarChart3,
  Sparkles,
  Library,
  Loader2,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// SHARED COMPONENTS FROM @vital/ai-ui
// Mission flow components for Mode 3/4 autonomous research
// ============================================================================
import {
  VitalMissionGoalInput,
  VitalMissionBriefing,
  VitalMissionExecution,
  VitalMissionComplete,
  VitalTemplateRecommendation,
  type MissionEvent,
  type HITLCheckpoint,
  type MissionArtifact as ExecutionArtifact,
  type MissionMetrics,
  type MissionStatus,
  type MissionResult,
  type MissionArtifact,
  type BriefingTemplate,
  type BriefingExpert,
  type MissionBriefingConfig,
  type CompleteExecutionMetrics,
  type TemplateRecommendationType,
} from '@vital/ai-ui';

// Streaming infrastructure
import {
  streamReducer,
  initialStreamState,
  streamActions,
  streamSelectors,
} from '../hooks/streamReducer';
import {
  useSSEStream,
  type TokenEvent,
  type ReasoningEvent,
  type CitationEvent,
  type ToolCallEvent,
  type CheckpointEvent,
  type ProgressEvent,
  type ArtifactEvent,
  type DoneEvent,
  type ErrorEvent,
} from '../hooks/useSSEStream';

// Phase 2 Interactive components - Expert type for state management
// Note: Agent selection happens via SIDEBAR for Mode 3, not in this view
import { type Expert } from '../components/interactive/ExpertPicker';
// FusionSelector for Mode 4 AI-assisted selection (if needed in future)
import { FusionSelector } from '../components/interactive/FusionSelector';

// Mission Input Component for research goal entry
import { MissionInput, type MissionConfig as MissionInputConfig } from '../components/MissionInput';

// Phase 3 Mission Template System - CANONICAL TYPES
import {
  TemplateGallery,
  TemplatePreview,
  TemplateCustomizer,
  type TemplateCardData,
  type TemplatePreviewData,
  type MissionCustomizations,
  DEFAULT_MISSION_TEMPLATES,
} from '../components/missions';

// Canonical types from mission-runners.ts
import type {
  MissionTemplate as CanonicalMissionTemplate,
  MissionConfig as CanonicalMissionConfig,
  InputField as CanonicalInputField,
  MissionFamily,
} from '../types/mission-runners';

// Mission Family Selector for Mode 3 (mission-first flow)
import { MissionFamilySelector } from '../components/autonomous/MissionFamilySelector';

// =============================================================================
// TYPES (Local view-specific types that extend canonical types)
// =============================================================================

export type AutonomousMode = 'mode3' | 'mode4';

// Mode 3 Flow: goal → recommendation → briefing → execution → complete (agent from sidebar)
// Mode 4 Flow: mission_family → goal → recommendation → briefing → execution → complete
// Note: 'template' phase is the full library, accessible via "Browse all templates" toggle
export type MissionPhase = 'mission_family' | 'selection' | 'goal' | 'recommendation' | 'template' | 'briefing' | 'execution' | 'complete';

// Local simplified template for the view's internal state
// Uses legacy format for backward compatibility with existing UI
interface LocalMissionTemplate {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: 'research' | 'analysis' | 'report' | 'review' | 'synthesis';
  estimatedDuration: string;
  complexity: 'simple' | 'moderate' | 'complex';
  requiredInputs: LocalInputField[];
  defaultCheckpoints: LocalCheckpointConfig[];
  steps: LocalMissionStep[];
  tags: string[];
}

interface LocalInputField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'file' | 'select' | 'multiselect';
  required: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
}

interface LocalMissionStep {
  id: string;
  name: string;
  description: string;
  estimatedDuration: string;
  tools?: string[];
}

interface LocalCheckpointConfig {
  type: 'plan' | 'tool' | 'subagent' | 'critical' | 'final';
  description: string;
  timeout?: number;
  autoApprove?: boolean;
}

interface LocalMissionConfig {
  inputs: Record<string, unknown>;
  autonomyBand: 'supervised' | 'guided' | 'autonomous';
  checkpointOverrides?: Record<string, boolean>;
  maxBudget?: number;
  deadline?: Date;
}

export interface AutonomousViewProps {
  /** Mode 3 = manual expert + autonomous, Mode 4 = AI expert + autonomous */
  mode: AutonomousMode;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Optional pre-selected expert ID (skips selection phase) */
  initialExpertId?: string;
  /** Optional mission template ID (skips template phase) */
  initialTemplateId?: string;
  /** Custom class names */
  className?: string;
  /** Callback when mission completes */
  onMissionComplete?: (missionId: string, artifacts: unknown[]) => void;
  /** Callback when mission fails */
  onMissionFail?: (error: Error) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AutonomousView({
  mode,
  tenantId,
  initialExpertId,
  initialTemplateId,
  className,
  onMissionComplete,
  onMissionFail,
}: AutonomousViewProps) {
  // =========================================================================
  // STATE
  // =========================================================================

  // Mission ID
  const [missionId] = useState(() => uuidv4());

  // Phase management
  const [phase, setPhase] = useState<MissionPhase>(() => {
    // Skip to template/briefing if we have an initial expert ID
    if (initialExpertId) {
      return initialTemplateId ? 'briefing' : 'template';
    }
    // Mode 3: Start with GOAL phase (agent already selected from sidebar)
    // Mode 4: Start with MISSION FAMILY selection (mission-first, AI auto-selects agents)
    return mode === 'mode4' ? 'mission_family' : 'goal';
  });

  // Mission state
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<MissionFamily | null>(null);
  const [templates, setTemplates] = useState<LocalMissionTemplate[]>([]);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LocalMissionTemplate | null>(null);
  const [missionConfig, setMissionConfig] = useState<LocalMissionConfig | null>(null);
  const [missionGoal, setMissionGoal] = useState<string>('');

  // Template preview/customizer modals
  const [previewTemplate, setPreviewTemplate] = useState<TemplatePreviewData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [customizerTemplate, setCustomizerTemplate] = useState<TemplateCardData | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // AI Recommendation state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<TemplateRecommendationType[]>([]);
  const [showAllTemplates, setShowAllTemplates] = useState(false);

  // Stream state (centralized via reducer)
  const [streamState, dispatch] = useReducer(streamReducer, initialStreamState);

  // Debug: Track phase changes
  useEffect(() => {
    logger.debug('[AutonomousView] Phase changed', { phase, mode, selectedExpert: selectedExpert?.name || 'none' });
  }, [phase, mode, selectedExpert]);

  // Load mission templates from backend (replaces mock data)
  useEffect(() => {
    let isMounted = true;

    const loadTemplates = async () => {
      setIsTemplatesLoading(true);
      try {
        const response = await fetch('/api/ask-expert/missions/templates');
        if (!response.ok) {
          throw new Error('Failed to load mission templates');
        }

        const payload = await response.json();
        const rawTemplates = payload?.templates || payload?.data || [];

        const mappedTemplates: LocalMissionTemplate[] = rawTemplates.map((tpl: any, index: number) => ({
          id: tpl.slug || tpl.id || `template-${index}`,
          name: tpl.name || tpl.title || 'Mission Template',
          description: tpl.description || '',
          icon: BookOpen,
          category: tpl.category || 'research',
          estimatedDuration: tpl.estimatedDuration || tpl.estimated_hours || '10-20 min',
          complexity: tpl.complexity || 'moderate',
          requiredInputs: tpl.requiredInputs || tpl.inputs || [],
          defaultCheckpoints: tpl.defaultCheckpoints || tpl.checkpoints || [],
          steps: tpl.steps || tpl.tasks || [],
          tags: tpl.tags || [],
        }));

        if (isMounted) {
          setTemplates(mappedTemplates);
          if (initialTemplateId) {
            const initial = mappedTemplates.find((t) => t.id === initialTemplateId);
            if (initial) {
              setSelectedTemplate(initial);
            }
          }
        }
      } catch (error) {
        console.error('[AutonomousView] Failed to load templates', error);
        if (isMounted) {
          setTemplates([]);
          setSelectedTemplate(null);
        }
      } finally {
        if (isMounted) {
          setIsTemplatesLoading(false);
        }
      }
    };

    loadTemplates();

    return () => {
      isMounted = false;
    };
  }, [initialTemplateId]);

  // Mode 3: Listen for expert selection from sidebar
  // The sidebar emits 'ask-expert:expert-selected' when user picks an agent
  useEffect(() => {
    if (mode !== 'mode3') return;

    const handleExpertSelected = (event: CustomEvent) => {
      const { expert } = event.detail || {};
      if (expert) {
        console.log('[AutonomousView] Expert selected from sidebar:', expert.name);
        setSelectedExpert({
          id: expert.id,
          name: expert.name,
          level: expert.level || 'L2',
          domain: expert.specialty || '',
        } as Expert);
      }
    };

    // Listen for expert selection events from sidebar
    window.addEventListener('ask-expert:expert-selected', handleExpertSelected as EventListener);

    // On mount, request current selection in case user already selected an agent
    window.dispatchEvent(new CustomEvent('ask-expert:request-selection'));
    console.log('[AutonomousView] Mode 3 mounted - requesting current expert selection');

    return () => {
      window.removeEventListener('ask-expert:expert-selected', handleExpertSelected as EventListener);
    };
  }, [mode]);

  // =========================================================================
  // DERIVED STATE
  // =========================================================================

  const isExecuting = useMemo(
    () => ['streaming', 'thinking', 'checkpoint_pending'].includes(streamState.status),
    [streamState.status]
  );

  const hasActiveCheckpoint = useMemo(
    () => streamSelectors.hasActiveCheckpoint(streamState),
    [streamState]
  );

  // Convert DEFAULT_MISSION_TEMPLATES to TemplateCardData format for gallery
  const galleryTemplates: TemplateCardData[] = useMemo(() => {
    return DEFAULT_MISSION_TEMPLATES.map((template) => ({
      id: template.id!,
      name: template.name!,
      family: template.family!,
      category: template.category!,
      description: template.description!,
      complexity: template.complexity!,
      estimatedDurationMin: template.estimatedDurationMin ?? 30,
      estimatedDurationMax: template.estimatedDurationMax ?? 60,
      estimatedCostMin: template.estimatedCostMin ?? 1.0,
      estimatedCostMax: template.estimatedCostMax ?? 5.0,
      tags: template.tags ?? [],
      minAgents: template.minAgents,
      maxAgents: template.maxAgents,
      exampleQueries: template.exampleQueries,
    }));
  }, []);

  // Briefing template data for VitalMissionBriefing
  const briefingTemplate: BriefingTemplate | null = useMemo(() => {
    if (!selectedTemplate) return null;
    return {
      id: selectedTemplate.id,
      name: selectedTemplate.name,
      description: selectedTemplate.description,
      category: selectedTemplate.category,
      complexity: selectedTemplate.complexity,
      estimatedDuration: selectedTemplate.estimatedDuration,
      requiredInputs: selectedTemplate.requiredInputs.map((input) => ({
        id: input.id,
        name: input.name,
        type: input.type as 'text' | 'textarea' | 'select' | 'file',
        required: input.required,
        placeholder: input.placeholder,
        options: input.options,
        description: input.description,
      })),
      defaultCheckpoints: selectedTemplate.defaultCheckpoints.map((cp) => ({
        type: cp.type as 'plan' | 'tool' | 'subagent' | 'critical' | 'final',
        description: cp.description,
      })),
    };
  }, [selectedTemplate]);

  // Briefing experts for VitalMissionBriefing
  const briefingExperts: BriefingExpert[] = useMemo(() => {
    if (!selectedExpert) return [];
    return [{
      id: selectedExpert.id,
      name: selectedExpert.name,
      role: selectedExpert.domain || 'Expert',
      avatar: selectedExpert.avatar,
      isPrimary: true,
    }];
  }, [selectedExpert]);

  // Map stream state to execution events for VitalMissionExecution
  const executionEvents: MissionEvent[] = useMemo(() => {
    const events: MissionEvent[] = [];

    // Add reasoning steps as events
    streamState.reasoning.forEach((step) => {
      events.push({
        id: step.id,
        type: 'thinking',
        timestamp: new Date(),
        message: `${step.step}: ${step.content}`,
        details: { status: step.status },
      });
    });

    // Add tool calls as events
    streamState.toolCalls.forEach((tool) => {
      events.push({
        id: tool.id,
        type: 'tool_call',
        timestamp: new Date(),
        message: `Tool: ${tool.toolName} - ${tool.status === 'success' ? 'Completed successfully' : tool.status === 'error' ? 'Failed' : 'Running...'}`,
        details: { toolName: tool.toolName, status: tool.status },
      });
    });

    return events;
  }, [streamState.reasoning, streamState.toolCalls]);

  // Map stream artifacts to execution artifacts
  const executionArtifacts: ExecutionArtifact[] = useMemo(() => {
    return streamState.artifacts.map((artifact) => ({
      id: artifact.id,
      type: (artifact.artifactType === 'report' ? 'document' :
             artifact.artifactType === 'data' ? 'raw_data' :
             artifact.artifactType === 'visualization' ? 'chart' :
             artifact.artifactType) as 'document' | 'chart' | 'table' | 'summary' | 'citation' | 'raw_data',
      title: artifact.title || 'Untitled Artifact',
      description: artifact.artifactType,
      preview: artifact.content?.substring(0, 200),
      sizeBytes: artifact.content?.length || 0,
      createdAt: new Date(),
    }));
  }, [streamState.artifacts]);

  // Map checkpoint to HITL checkpoint
  const executionCheckpoints: HITLCheckpoint[] = useMemo(() => {
    if (!streamState.checkpoint) return [];
    return [{
      id: streamState.checkpoint.id,
      name: `${streamState.checkpoint.type} Checkpoint`,
      description: streamState.checkpoint.description,
      status: 'pending',
      reachedAt: new Date(),
    }];
  }, [streamState.checkpoint]);

  // Execution metrics (aligned with VitalMissionExecution MissionMetrics type)
  const executionMetrics: MissionMetrics | undefined = useMemo(() => {
    if (!streamState.progress) return undefined;
    const elapsedSeconds = streamState.startedAt
      ? Math.floor((Date.now() - streamState.startedAt) / 1000)
      : 0;
    return {
      elapsedSeconds,
      estimatedRemainingSeconds: undefined,
      tokensUsed: streamState.contentTokens || 0,
      estimatedCostUsd: streamState.accumulatedCost || 0,
      toolCalls: streamState.toolCalls?.length || 0,
      agentHandoffs: streamState.delegations?.length || 0,
      sourcesConsulted: streamState.citations?.length || 0,
    };
  }, [streamState.progress, streamState.startedAt, streamState.contentTokens, streamState.accumulatedCost, streamState.toolCalls, streamState.delegations, streamState.citations]);

  // Mission status mapping (aligned with VitalMissionExecution MissionStatus type)
  // Valid MissionStatus: 'initializing' | 'executing' | 'paused' | 'awaiting_approval' | 'completed' | 'failed' | 'cancelled'
  const executionStatus: MissionStatus = useMemo(() => {
    switch (streamState.status) {
      case 'connecting':
        return 'initializing';
      case 'streaming':
      case 'thinking':
        return 'executing';
      case 'checkpoint_pending':
        return 'awaiting_approval';
      case 'paused':
        return 'paused';
      case 'complete':
        return 'completed';
      case 'error':
        return 'failed';
      case 'idle':
      default:
        return 'initializing';
    }
  }, [streamState.status]);

  // Mission result for complete phase (aligned with VitalMissionComplete types)
  const missionResult: MissionResult | null = useMemo(() => {
    if (phase !== 'complete') return null;
    return {
      outcome: streamState.status === 'error' ? 'failed' : 'success',
      executiveSummary: streamState.content?.substring(0, 1000) || 'Mission completed successfully.',
      keyFindings: [], // Would be populated from mission response
      recommendations: [],
      caveats: [],
      confidenceLevel: 85, // Default confidence
      sourcesConsulted: streamState.citations?.length || 0,
    };
  }, [phase, streamState.content, streamState.status, streamState.citations]);

  // Complete phase artifacts (aligned with VitalMissionComplete types)
  const completeArtifacts: MissionArtifact[] = useMemo(() => {
    return streamState.artifacts.map((artifact) => ({
      id: artifact.id,
      type: (artifact.artifactType === 'report' ? 'document' :
             artifact.artifactType === 'data' ? 'raw_data' :
             artifact.artifactType === 'visualization' ? 'chart' :
             artifact.artifactType) as 'document' | 'chart' | 'table' | 'summary' | 'citation' | 'raw_data',
      title: artifact.title || 'Untitled Artifact',
      description: artifact.artifactType,
      sizeBytes: artifact.content?.length || 0,
      mimeType: 'application/pdf',
      preview: artifact.content?.substring(0, 200),
      downloadUrl: '#',
      createdAt: new Date(),
    }));
  }, [streamState.artifacts]);

  // Execution metrics for complete phase (aligned with VitalMissionComplete ExecutionMetrics type)
  const completeMetrics: CompleteExecutionMetrics | undefined = useMemo(() => {
    if (!streamState.progress) return undefined;
    const totalDurationSeconds = streamState.startedAt
      ? Math.floor((Date.now() - streamState.startedAt) / 1000)
      : 0;
    return {
      totalDurationSeconds,
      tokensUsed: streamState.contentTokens || 0,
      estimatedCostUsd: streamState.accumulatedCost || 0,
      agentHandoffs: streamState.delegations?.length || 0,
      toolCalls: streamState.toolCalls?.length || 0,
      checkpointsPassed: streamState.checkpointHistory?.length || 0,
      sourcesConsulted: streamState.citations?.length || 0,
    };
  }, [streamState.progress, streamState.startedAt, streamState.contentTokens, streamState.accumulatedCost, streamState.delegations, streamState.toolCalls, streamState.checkpointHistory, streamState.citations]);

  // =========================================================================
  // SSE STREAM HOOK
  // =========================================================================

  const { connect, disconnect } = useSSEStream({
    url: mode === 'mode3'
      ? '/api/expert/mode3/stream'
      : '/api/expert/mode4/stream',

    onToken: useCallback((event: TokenEvent) => {
      dispatch(streamActions.appendContent(event));
    }, []),

    onReasoning: useCallback((event: ReasoningEvent) => {
      dispatch(streamActions.addReasoning(event));
    }, []),

    onCitation: useCallback((event: CitationEvent) => {
      dispatch(streamActions.addCitation(event));
    }, []),

    onToolCall: useCallback((event: ToolCallEvent) => {
      if (event.status === 'calling') {
        dispatch(streamActions.startTool(event));
      } else {
        dispatch(streamActions.toolResult(event));
      }
    }, []),

    onCheckpoint: useCallback((event: CheckpointEvent) => {
      dispatch({ type: 'CHECKPOINT_RECEIVED', payload: event });
    }, []),

    onProgress: useCallback((event: ProgressEvent) => {
      dispatch({ type: 'PROGRESS_UPDATE', payload: event });
    }, []),

    onArtifact: useCallback((event: ArtifactEvent) => {
      dispatch(streamActions.addArtifact(event));
    }, []),

    onDone: useCallback((event: DoneEvent) => {
      dispatch(streamActions.complete(event));
      setPhase('complete');
      onMissionComplete?.(missionId, streamState.artifacts);
    }, [missionId, streamState.artifacts, onMissionComplete]),

    onError: useCallback((event: ErrorEvent) => {
      dispatch(streamActions.error(event));
      onMissionFail?.(new Error(event.message));
    }, [onMissionFail]),

    autoReconnect: true,
    maxReconnectAttempts: 3,
    reconnectDelayMs: 2000,
  });

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleExpertSelect = useCallback((expert: Expert) => {
    console.log('[AutonomousView] Expert selected:', expert.name, '- transitioning to goal phase');
    setSelectedExpert(expert);
    setPhase('goal');  // Go to mission goal input phase
  }, []);

  // Mode 3: Handle mission family selection (mission-first flow)
  const handleFamilySelect = useCallback((family: MissionFamily) => {
    console.log('[AutonomousView] Mission family selected:', family, '- transitioning to goal phase');
    setSelectedFamily(family);
    setPhase('goal');  // Go to goal input, then filtered template selection
  }, []);

  // Handle mission start from MissionInput component (legacy)
  const handleMissionStart = useCallback((goal: string, config: MissionInputConfig) => {
    setMissionGoal(goal);
    // Store the config from MissionInput for later use
    setMissionConfig({
      inputs: { goal },
      autonomyBand: config.hitlEnabled ? 'guided' : 'autonomous',
    });
    setPhase('template');  // Proceed to template selection
  }, []);

  // Handle goal submission from VitalMissionGoalInput (new shared component)
  // Now goes to recommendation phase for AI-powered template suggestions
  const handleGoalSubmit = useCallback(async (goal: string) => {
    console.log('[AutonomousView] Goal submitted:', goal.substring(0, 50) + '...');
    setMissionGoal(goal);
    setIsAnalyzing(true);
    setPhase('recommendation');  // Go to AI recommendation phase instead of full template library

    // Simulate AI analysis with intelligent template matching
    // In production, this would call the backend API for semantic matching
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate analysis time

      // Simple keyword-based matching for now (would be AI-powered in production)
      const goalLower = goal.toLowerCase();
      const matchedTemplates: TemplateRecommendationType[] = [];

      // Analyze goal and score templates
      DEFAULT_MISSION_TEMPLATES.forEach((template) => {
        if (!template.id || !template.name || !template.description) return;

        let score = 50; // Base score
        const reasons: { factor: string; weight: number; explanation: string }[] = [];

        // Check keyword matches in template name, description, tags
        const templateText = `${template.name} ${template.description} ${(template.tags || []).join(' ')} ${(template.exampleQueries || []).join(' ')}`.toLowerCase();

        // Keyword matching logic
        const keywords = goalLower.split(/\s+/).filter(w => w.length > 3);
        const matchedKeywords = keywords.filter(k => templateText.includes(k));
        if (matchedKeywords.length > 0) {
          const keywordBonus = Math.min(matchedKeywords.length * 10, 30);
          score += keywordBonus;
          reasons.push({
            factor: 'Keyword Match',
            weight: keywordBonus,
            explanation: `Matches: ${matchedKeywords.slice(0, 3).join(', ')}`,
          });
        }

        // Example query similarity
        const exampleQueries = template.exampleQueries || [];
        const hasExampleMatch = exampleQueries.some(eq => {
          const eqWords = eq.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          return eqWords.some(w => goalLower.includes(w));
        });
        if (hasExampleMatch) {
          score += 15;
          reasons.push({
            factor: 'Query Pattern',
            weight: 15,
            explanation: 'Similar to recommended use cases',
          });
        }

        // Category relevance
        if (template.category && goalLower.includes(template.category.toLowerCase())) {
          score += 10;
          reasons.push({
            factor: 'Category Match',
            weight: 10,
            explanation: `Category: ${template.category}`,
          });
        }

        // Add to matches if score is reasonable
        if (score >= 55) {
          matchedTemplates.push({
            templateId: template.id,
            templateName: template.name,
            matchScore: Math.min(score, 95), // Cap at 95%
            reasoning: template.description || 'Matches your research query',
            reasons,
            estimatedTime: `${template.estimatedDurationMin || 30}-${template.estimatedDurationMax || 60} min`,
            estimatedCost: (template.estimatedCostMin || 1.0 + (template.estimatedCostMax || 5.0)) / 2,
            agentCount: template.maxAgents || 3,
            highlights: (template.tags || []).slice(0, 3),
          });
        }
      });

      // Sort by score and take top 3
      matchedTemplates.sort((a, b) => b.matchScore - a.matchScore);
      setRecommendations(matchedTemplates.slice(0, 3));

      console.log('[AutonomousView] AI recommendations:', matchedTemplates.slice(0, 3).map(r => r.templateName));
    } catch (error) {
      console.error('[AutonomousView] Error analyzing goal:', error);
      // Fallback to showing all templates if analysis fails
      setPhase('template');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleTemplateSelect = useCallback((template: LocalMissionTemplate) => {
    setSelectedTemplate(template);
    setPhase('briefing');
  }, []);

  const handleLaunch = useCallback(async (config: LocalMissionConfig) => {
    if (!selectedTemplate || !selectedExpert) return;

    setMissionConfig(config);
    setPhase('execution');
    dispatch(streamActions.reset());
    dispatch(streamActions.connect());

    await connect({
      mission_id: missionId,
      template_id: selectedTemplate.id,
      agent_id: selectedExpert.id,
      inputs: config.inputs,
      autonomy_band: config.autonomyBand,
      tenant_id: tenantId,
      mode,
      checkpoint_config: selectedTemplate.defaultCheckpoints,
      goal: missionGoal,
    });
  }, [selectedTemplate, selectedExpert, missionId, tenantId, mode, connect, missionGoal]);

  // Handle launch from VitalMissionBriefing component
  // MissionBriefingConfig uses: inputs, autonomyBand, checkpointOverrides, maxBudget, deadline
  const handleBriefingLaunch = useCallback((config: MissionBriefingConfig) => {
    console.log('[AutonomousView] Briefing launch with config:', config);
    handleLaunch({
      inputs: config.inputs,
      autonomyBand: config.autonomyBand,
      checkpointOverrides: config.checkpointOverrides || {},
      maxBudget: config.maxBudget,
    });
  }, [handleLaunch]);

  const handleCheckpointResponse = useCallback(async (
    checkpointId: string,
    decision: 'approve' | 'reject' | 'modify',
    data?: unknown
  ) => {
    dispatch({
      type: 'CHECKPOINT_RESPONDED',
      payload: { checkpointId, response: decision },
    });

    try {
      await fetch(`/api/expert/mission/checkpoint/${checkpointId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, data }),
      });
    } catch (error) {
      console.error('Failed to respond to checkpoint:', error);
      // The stream will handle reconnection
    }
  }, [missionId]);

  const handleBackToTemplate = useCallback(() => {
    setPhase('template');
  }, []);

  const handleBackToMissionFamily = useCallback(() => {
    // Mode 4 only: Go back to mission family selection
    // Mode 3 doesn't use this - agent is selected via sidebar, no back navigation needed
    setPhase('mission_family');
    setSelectedFamily(null);
    setMissionGoal('');
  }, []);

  const handleBackToGoal = useCallback(() => {
    setPhase('goal');
  }, []);

  // Template Preview/Customizer handlers - WIRED December 11, 2025
  const handleTemplatePreview = useCallback((templateId: string) => {
    const template = DEFAULT_MISSION_TEMPLATES.find((t) => t.id === templateId);
    if (template && template.id && template.name && template.family && template.category && template.description && template.complexity) {
      // Convert to preview data format
      const previewData: TemplatePreviewData = {
        id: template.id,
        name: template.name,
        family: template.family,
        category: template.category,
        description: template.description,
        longDescription: template.description, // Could be extended
        complexity: template.complexity,
        estimatedDurationMin: template.estimatedDurationMin ?? 30,
        estimatedDurationMax: template.estimatedDurationMax ?? 60,
        estimatedCostMin: template.estimatedCostMin ?? 1.0,
        estimatedCostMax: template.estimatedCostMax ?? 5.0,
        tags: template.tags ?? [],
        minAgents: template.minAgents,
        maxAgents: template.maxAgents,
        exampleQueries: template.exampleQueries,
        expectedInputs: template.requiredInputs?.map((input) => ({
          name: input.name,
          type: input.type as 'text' | 'file' | 'url' | 'selection',
          description: input.description || '',
          required: input.required ?? false,
          example: input.placeholder,
        })),
        expectedOutputs: template.tasks?.map((task) => ({
          name: task.name,
          type: 'report' as const,
          description: task.description || '',
        })),
      };
      setPreviewTemplate(previewData);
      setIsPreviewOpen(true);
    }
  }, []);

  const handleTemplateSelectFromGallery = useCallback((templateId: string) => {
    const template = DEFAULT_MISSION_TEMPLATES.find((t) => t.id === templateId);
    if (template && template.id && template.name && template.family && template.category && template.description && template.complexity) {
      // Convert to customizer format and open customizer
      const customizerData: TemplateCardData = {
        id: template.id,
        name: template.name,
        family: template.family,
        category: template.category,
        description: template.description,
        complexity: template.complexity,
        estimatedDurationMin: template.estimatedDurationMin ?? 30,
        estimatedDurationMax: template.estimatedDurationMax ?? 60,
        estimatedCostMin: template.estimatedCostMin ?? 1.0,
        estimatedCostMax: template.estimatedCostMax ?? 5.0,
        tags: template.tags ?? [],
        minAgents: template.minAgents,
        maxAgents: template.maxAgents,
        exampleQueries: template.exampleQueries,
      };
      setCustomizerTemplate(customizerData);
      setIsCustomizerOpen(true);
    }
  }, []);

  const handleCustomizerLaunch = useCallback((templateId: string, customizations: MissionCustomizations) => {
    const template = templates.find((t) => t.id === templateId) || templates[0];
    if (template) {
      setSelectedTemplate(template);
    }
    setIsCustomizerOpen(false);

    // Convert customizations to mission config
    const config: LocalMissionConfig = {
      inputs: {},
      autonomyBand: customizations.requireHumanApproval ? 'supervised' : 'autonomous',
      maxBudget: customizations.maxBudget ?? undefined,
    };

    handleLaunch(config);
  }, [handleLaunch, templates]);

  // Handle selecting a recommended template - goes directly to briefing
  const handleRecommendationSelect = useCallback((templateId: string) => {
    const template =
      templates.find((t) => t.id === templateId) ||
      (() => {
        const canonical = DEFAULT_MISSION_TEMPLATES.find((t) => t.id === templateId);
        if (canonical && canonical.name && canonical.description) {
          return {
            id: canonical.id!,
            name: canonical.name!,
            description: canonical.description!,
            icon: BookOpen, // Default icon
            category: (canonical.category as LocalMissionTemplate['category']) || 'research',
            estimatedDuration: `${canonical.estimatedDurationMin || 30}-${canonical.estimatedDurationMax || 60} min`,
            complexity: (canonical.complexity as LocalMissionTemplate['complexity']) || 'moderate',
            requiredInputs: (canonical.requiredInputs || []).map((input) => ({
              id: input.name,
              name: input.name,
              type: input.type as 'text' | 'textarea' | 'file' | 'select' | 'multiselect',
              required: input.required ?? false,
              placeholder: input.placeholder,
              description: input.description,
            })),
            defaultCheckpoints: [],
            steps: [],
            tags: canonical.tags || [],
          } as LocalMissionTemplate;
        }
        return templates[0] ?? null;
      })();

    if (!template) {
      console.error('[AutonomousView] No templates available for recommendation');
      return;
    }

    console.log('[AutonomousView] Selected recommended template:', template.name);
    setSelectedTemplate(template);
    setShowAllTemplates(false);
    setPhase('briefing');  // Skip full library, go directly to briefing
  }, [templates]);

  // Handle dismissing a recommendation (user wants something else)
  const handleRecommendationDismiss = useCallback(() => {
    console.log('[AutonomousView] Recommendation dismissed, showing all templates');
    setShowAllTemplates(true);
  }, []);

  // Handle browsing the full template library
  const handleBrowseAllTemplates = useCallback(() => {
    console.log('[AutonomousView] User wants to browse all templates');
    setShowAllTemplates(true);
    setPhase('template');  // Go to full template library
  }, []);

  // Handle going back from template library to recommendations
  const handleBackToRecommendations = useCallback(() => {
    setShowAllTemplates(false);
    setPhase('recommendation');
  }, []);

  const handleNewMission = useCallback(() => {
    // Reset everything for a new mission
    dispatch(streamActions.reset());
    setSelectedTemplate(null);
    setMissionConfig(null);
    setRecommendations([]);
    setShowAllTemplates(false);
    setPhase('goal');  // Back to goal input, not template library
  }, []);

  const handleAbortMission = useCallback(() => {
    disconnect();
    dispatch(streamActions.reset());
    setPhase('template');
  }, [disconnect]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className={cn(
      'flex flex-col h-full bg-white',
      // Autonomous mode uses purple accent
      'autonomous-view--purple-theme',
      className
    )}>
      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════════════
            MISSION FAMILY SELECTION PHASE (Mode 4 Only)
            Entry point for Mode 4 Background Missions - users select a mission
            family (e.g., Deep Research, Evaluation, Investigation) before
            defining their research goal. AI will auto-select appropriate agents.
            Mode 3 uses agent selection phase instead (agent-first flow).
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'mission_family' && (
          <motion.div
            key="mission_family"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 overflow-auto"
          >
            <MissionFamilySelector
              onSelectFamily={handleFamilySelect}
              researchGoal={missionGoal}
              className="h-full"
            />
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            MISSION GOAL INPUT PHASE
            User enters their research question/goal
            Uses VitalMissionGoalInput from @vital/ai-ui for rich input
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'goal' && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 overflow-auto"
          >
            <div className="max-w-3xl mx-auto p-6">
              {/* Back navigation - Only show for Mode 4 (mission-first flow) */}
              {/* Mode 3 has no back - agent is selected via sidebar */}
              {mode === 'mode4' && (
                <div className="mb-6">
                  <button
                    onClick={handleBackToMissionFamily}
                    className="text-sm flex items-center gap-1 transition-colors text-amber-600 hover:text-amber-800"
                  >
                    ← Back to mission selection
                  </button>
                </div>
              )}

              {/* SHARED COMPONENT: VitalMissionGoalInput from @vital/ai-ui */}
              <VitalMissionGoalInput
                mode={mode}
                industry="pharmaceutical"
                onSubmit={handleGoalSubmit}
                isAnalyzing={isExecuting}
                initialValue={missionGoal}
                showExamples={true}
                title={mode === 'mode3'
                  ? `Research with ${selectedExpert?.name || 'Expert'}`
                  : undefined
                }
                description={mode === 'mode3' && selectedExpert
                  ? `Define your research goal for ${selectedExpert.name} to investigate autonomously.`
                  : undefined
                }
              />
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            AI RECOMMENDATION PHASE (NEW - December 13, 2025)
            AI analyzes user's goal and suggests best-matching templates
            Users can select a recommendation OR browse all templates
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'recommendation' && (
          <motion.div
            key="recommendation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 overflow-auto"
          >
            <div className="max-w-4xl mx-auto p-6">
              {/* Header with back navigation */}
              <div className="mb-6">
                <button
                  onClick={handleBackToGoal}
                  className="text-sm flex items-center gap-1 transition-colors text-purple-600 hover:text-purple-800 mb-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Edit research goal
                </button>

                {/* User's goal display */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-slate-50 border border-purple-100 mb-6">
                  <p className="text-xs text-purple-600 mb-1 font-medium">Your Research Goal</p>
                  <p className="text-slate-700">{missionGoal}</p>
                </div>
              </div>

              {/* Analyzing state */}
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-purple-200 opacity-50" />
                    <div className="relative p-4 rounded-full bg-purple-100">
                      <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Analyzing your research goal...</h3>
                    <p className="text-sm text-slate-500">Finding the best mission template for your needs</p>
                  </div>
                  <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                </div>
              )}

              {/* Recommendations display */}
              {!isAnalyzing && recommendations.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h2 className="text-xl font-semibold text-slate-800">
                      Recommended Missions
                    </h2>
                    <span className="text-sm text-slate-500">
                      ({recommendations.length} suggestions)
                    </span>
                  </div>

                  {/* Top recommendation - featured */}
                  {recommendations[0] && (
                    <div className="mb-4">
                      <VitalTemplateRecommendation
                        recommendation={recommendations[0]}
                        userQuery={missionGoal}
                        showReasoning={true}
                        showFactors={true}
                        onSelect={handleRecommendationSelect}
                        onDismiss={handleRecommendationDismiss}
                        className="shadow-lg border-2 border-purple-200"
                      />
                    </div>
                  )}

                  {/* Additional recommendations */}
                  {recommendations.length > 1 && (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600 font-medium">Other good options:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.slice(1).map((rec) => (
                          <VitalTemplateRecommendation
                            key={rec.templateId}
                            recommendation={rec}
                            showReasoning={false}
                            showFactors={false}
                            onSelect={handleRecommendationSelect}
                            className="bg-slate-50/50"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Browse all templates toggle */}
                  <div className="pt-6 border-t">
                    <button
                      onClick={handleBrowseAllTemplates}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-purple-600 transition-colors group"
                    >
                      <Library className="h-4 w-4 group-hover:text-purple-600" />
                      <span>Browse all {DEFAULT_MISSION_TEMPLATES.length} templates in library</span>
                    </button>
                  </div>
                </div>
              )}

              {/* No recommendations - show browse option */}
              {!isAnalyzing && recommendations.length === 0 && (
                <div className="text-center py-12 space-y-4">
                  <div className="p-4 rounded-full bg-amber-100 inline-block">
                    <Library className="h-8 w-8 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      No strong matches found
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Your query is unique! Browse our template library to find the right mission.
                    </p>
                    <button
                      onClick={handleBrowseAllTemplates}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Library className="h-4 w-4" />
                      Browse All Templates
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TEMPLATE SELECTION PHASE (Full Library)
            Gallery of mission templates filtered by expert capabilities
            ENHANCED December 11, 2025 - Using new Mission Template System
            Now accessible via "Browse all templates" from recommendation phase
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'template' && (
          <motion.div
            key="template"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {/* Header with back navigation */}
            <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center justify-between">
                <button
                  onClick={recommendations.length > 0 ? handleBackToRecommendations : handleBackToGoal}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {recommendations.length > 0 ? 'Back to recommendations' : 'Back to mission goal'}
                </button>
                {selectedExpert && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>Expert:</span>
                    <span className="font-medium text-purple-700">{selectedExpert.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Template Gallery */}
            <div className="flex-1 overflow-auto p-6">
              <TemplateGallery
                templates={galleryTemplates}
                onSelect={handleTemplateSelectFromGallery}
                onPreview={handleTemplatePreview}
                showSearch={true}
                showCategories={true}
                showFilters={true}
                initialViewMode="grid"
              />
            </div>

            {/* Template Preview Modal */}
            <TemplatePreview
              template={previewTemplate}
              isOpen={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
              onUseTemplate={(id) => {
                setIsPreviewOpen(false);
                handleTemplateSelectFromGallery(id);
              }}
              onCustomize={(id) => {
                setIsPreviewOpen(false);
                handleTemplateSelectFromGallery(id);
              }}
            />

            {/* Template Customizer Drawer */}
            <TemplateCustomizer
              template={customizerTemplate}
              isOpen={isCustomizerOpen}
              onClose={() => setIsCustomizerOpen(false)}
              onLaunch={handleCustomizerLaunch}
            />
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            MISSION BRIEFING PHASE (Pre-flight)
            Configure inputs, autonomy level, and checkpoints
            Uses VitalMissionBriefing from @vital/ai-ui
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'briefing' && (
          <motion.div
            key="briefing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 overflow-auto"
          >
            {/* SHARED COMPONENT: VitalMissionBriefing from @vital/ai-ui */}
            {briefingTemplate && (
              <VitalMissionBriefing
                mode={mode}
                researchGoal={missionGoal}
                template={briefingTemplate}
                expert={briefingExperts[0]}
                isLaunching={isExecuting}
                onLaunch={handleBriefingLaunch}
                onBack={handleBackToTemplate}
              />
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            MISSION EXECUTION PHASE
            Progressive disclosure of mission progress
            Uses VitalMissionExecution from @vital/ai-ui
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'execution' && (
          <motion.div
            key="execution"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-hidden"
          >
            {/* SHARED COMPONENT: VitalMissionExecution from @vital/ai-ui */}
            <VitalMissionExecution
              missionId={missionId}
              missionTitle={selectedTemplate?.name || 'Research Mission'}
              status={executionStatus}
              progress={streamState.progress?.progress || 0}
              currentPhase={streamState.progress?.stage}
              events={executionEvents}
              checkpoints={executionCheckpoints}
              artifacts={executionArtifacts}
              metrics={executionMetrics}
              onApproveCheckpoint={(id, feedback) => handleCheckpointResponse(id, 'approve', { feedback })}
              onRejectCheckpoint={(id, reason) => handleCheckpointResponse(id, 'reject', { reason })}
              onPause={() => console.log('[AutonomousView] Pause requested')}
              onResume={() => console.log('[AutonomousView] Resume requested')}
              onCancel={handleAbortMission}
              onDownloadArtifact={(id) => console.log('[AutonomousView] Download artifact:', id)}
              mode={mode}
            />
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            MISSION COMPLETE PHASE
            Results, artifacts, and next actions
            Uses VitalMissionComplete from @vital/ai-ui
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'complete' && missionResult && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-hidden"
          >
            {/* SHARED COMPONENT: VitalMissionComplete from @vital/ai-ui */}
            <VitalMissionComplete
              missionId={missionId}
              missionTitle={selectedTemplate?.name || missionGoal.substring(0, 50) || 'Research Mission'}
              result={missionResult}
              artifacts={completeArtifacts}
              metrics={completeMetrics}
              teamAgents={selectedExpert ? [{
                name: selectedExpert.name,
                avatar: selectedExpert.avatar,
                role: selectedExpert.domain || 'Expert',
              }] : []}
              onDownloadArtifact={(artifactId) => {
                console.log('[AutonomousView] Download artifact:', artifactId);
                // TODO: Implement artifact download
              }}
              onDownloadAll={() => {
                console.log('[AutonomousView] Download all artifacts');
                // TODO: Implement bulk download
              }}
              onShare={() => {
                console.log('[AutonomousView] Share mission results');
                // TODO: Implement share functionality
              }}
              onCopy={() => {
                navigator.clipboard.writeText(missionResult.executiveSummary);
                console.log('[AutonomousView] Copied to clipboard');
              }}
              onFeedback={(rating, comment) => {
                console.log('[AutonomousView] Feedback:', rating, comment);
                // TODO: Send feedback to backend
              }}
              onNewMission={handleNewMission}
              onViewTranscript={() => {
                console.log('[AutonomousView] View transcript');
                // TODO: Implement transcript viewer
              }}
              mode={mode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AutonomousView;
