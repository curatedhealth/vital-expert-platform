'use client';

/**
 * VITAL Platform - AutonomousView Component
 *
 * Master view for Modes 3 & 4 (Autonomous/Background modes):
 * - Mode 3 (Deep Research): Manual expert selection → Autonomous execution
 * - Mode 4 (Background): AI selects expert (FusionSelector) → Autonomous execution
 *
 * Mission Phases:
 * 1. Selection - Expert selection (Mode 3: manual, Mode 4: AI)
 * 2. Template - Mission template gallery
 * 3. Briefing - Pre-flight configuration modal
 * 4. Execution - Autonomous execution with progressive disclosure
 * 5. Complete - Results and artifacts
 *
 * Architecture:
 * - Uses streamReducer for centralized SSE state management
 * - HITL checkpoints for human approval at critical points
 * - Purple theme for autonomous modes (vs blue for interactive)
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 * Phase 3 Implementation - December 11, 2025
 */

import { useState, useReducer, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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

// Phase 2 Interactive components (reused for expert selection)
// Expert type is defined in ExpertPicker
import { ExpertPicker, type Expert } from '../components/interactive/ExpertPicker';
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
} from '../types/mission-runners';

// =============================================================================
// TYPES (Local view-specific types that extend canonical types)
// =============================================================================

export type AutonomousMode = 'mode3' | 'mode4';

export type MissionPhase = 'selection' | 'goal' | 'template' | 'briefing' | 'execution' | 'complete';

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
// MOCK DATA (Replace with real API calls)
// =============================================================================

const MOCK_TEMPLATES: LocalMissionTemplate[] = [
  {
    id: 'literature-review',
    name: 'Literature Review',
    description: 'Comprehensive review of scientific literature on a topic',
    icon: BookOpen,
    category: 'research',
    estimatedDuration: '15-30 min',
    complexity: 'moderate',
    requiredInputs: [
      {
        id: 'topic',
        name: 'Research Topic',
        type: 'textarea',
        required: true,
        placeholder: 'Enter the topic or research question...',
      },
      {
        id: 'scope',
        name: 'Scope',
        type: 'select',
        required: true,
        options: ['Last 5 years', 'Last 10 years', 'All time'],
      },
    ],
    defaultCheckpoints: [
      { type: 'plan', description: 'Review search strategy', timeout: 300 },
      { type: 'critical', description: 'Validate key findings', timeout: 600 },
      { type: 'final', description: 'Approve final report', timeout: 900 },
    ],
    steps: [
      { id: '1', name: 'Search Strategy', description: 'Define search terms and databases', estimatedDuration: '2 min' },
      { id: '2', name: 'Literature Search', description: 'Search PubMed, Google Scholar, etc.', estimatedDuration: '5 min', tools: ['pubmed_search', 'google_scholar'] },
      { id: '3', name: 'Screening', description: 'Filter and rank relevant papers', estimatedDuration: '8 min' },
      { id: '4', name: 'Analysis', description: 'Extract key findings and themes', estimatedDuration: '10 min' },
      { id: '5', name: 'Synthesis', description: 'Generate comprehensive review', estimatedDuration: '5 min' },
    ],
    tags: ['research', 'literature', 'review', 'systematic'],
  },
  {
    id: 'competitive-analysis',
    name: 'Competitive Analysis',
    description: 'Analyze competitor landscape and market positioning',
    icon: BarChart3,
    category: 'analysis',
    estimatedDuration: '20-45 min',
    complexity: 'complex',
    requiredInputs: [
      {
        id: 'product',
        name: 'Product/Drug Name',
        type: 'text',
        required: true,
        placeholder: 'Enter product name...',
      },
      {
        id: 'competitors',
        name: 'Known Competitors',
        type: 'textarea',
        required: false,
        placeholder: 'Optional: List known competitors...',
      },
    ],
    defaultCheckpoints: [
      { type: 'plan', description: 'Approve analysis scope', timeout: 300 },
      { type: 'tool', description: 'Validate data sources', timeout: 300 },
      { type: 'critical', description: 'Review competitive matrix', timeout: 600 },
      { type: 'final', description: 'Approve final analysis', timeout: 900 },
    ],
    steps: [
      { id: '1', name: 'Market Scan', description: 'Identify all competitors', estimatedDuration: '5 min' },
      { id: '2', name: 'Data Collection', description: 'Gather competitive data', estimatedDuration: '15 min', tools: ['web_search', 'database_query'] },
      { id: '3', name: 'Analysis', description: 'Build competitive matrix', estimatedDuration: '15 min' },
      { id: '4', name: 'Insights', description: 'Generate strategic insights', estimatedDuration: '10 min' },
    ],
    tags: ['competitive', 'market', 'analysis', 'strategy'],
  },
];

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
    // Skip selection if we have an initial expert ID
    if (initialExpertId) {
      return initialTemplateId ? 'briefing' : 'template';
    }
    // Mode 3 always starts with manual selection
    // Mode 4 also starts with selection (FusionSelector needs query first)
    return 'selection';
  });

  // Mission state
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<LocalMissionTemplate | null>(
    initialTemplateId ? MOCK_TEMPLATES.find(t => t.id === initialTemplateId) || null : null
  );
  const [missionConfig, setMissionConfig] = useState<LocalMissionConfig | null>(null);
  const [missionGoal, setMissionGoal] = useState<string>('');

  // Template preview/customizer modals
  const [previewTemplate, setPreviewTemplate] = useState<TemplatePreviewData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [customizerTemplate, setCustomizerTemplate] = useState<TemplateCardData | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Stream state (centralized via reducer)
  const [streamState, dispatch] = useReducer(streamReducer, initialStreamState);

  // Debug: Track phase changes
  useEffect(() => {
    console.log('[AutonomousView] Phase changed to:', phase, '| mode:', mode, '| selectedExpert:', selectedExpert?.name || 'none');
  }, [phase, mode, selectedExpert]);

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

  // Handle mission start from MissionInput component
  const handleMissionStart = useCallback((goal: string, config: MissionInputConfig) => {
    setMissionGoal(goal);
    // Store the config from MissionInput for later use
    setMissionConfig({
      inputs: { goal },
      autonomyBand: config.hitlEnabled ? 'guided' : 'autonomous',
    });
    setPhase('template');  // Proceed to template selection
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
    });
  }, [selectedTemplate, selectedExpert, missionId, tenantId, mode, connect]);

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

  const handleBackToSelection = useCallback(() => {
    setPhase('selection');
    setSelectedExpert(null);
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
    const template = MOCK_TEMPLATES.find((t) => t.id === templateId) || MOCK_TEMPLATES[0];
    setSelectedTemplate(template);
    setIsCustomizerOpen(false);

    // Convert customizations to mission config
    const config: LocalMissionConfig = {
      inputs: {},
      autonomyBand: customizations.requireHumanApproval ? 'supervised' : 'autonomous',
      maxBudget: customizations.maxBudget ?? undefined,
    };

    handleLaunch(config);
  }, [handleLaunch]);

  const handleNewMission = useCallback(() => {
    // Reset everything for a new mission
    dispatch(streamActions.reset());
    setSelectedTemplate(null);
    setMissionConfig(null);
    setPhase('template');
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
            EXPERT SELECTION PHASE
            Mode 3: ExpertPicker (manual grid selection)
            Mode 4: FusionSelector (AI selects based on query)
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 overflow-auto"
          >
            {mode === 'mode3' ? (
              <ExpertPicker
                tenantId={tenantId}
                onSelect={handleExpertSelect}
                initialCategory="deep-research"
              />
            ) : (
              <FusionSelector
                tenantId={tenantId}
                mode="mode4"
                onQuerySubmit={(query) => {
                  // In Mode 4, submitting query starts mission configuration
                  setMissionGoal(query);
                  setPhase('goal');  // Go to goal phase for additional config
                }}
                onExpertSelected={handleExpertSelect}
              />
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            MISSION GOAL INPUT PHASE
            User enters their research question/goal and configures options
            Uses MissionInput component for rich input experience
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
              {/* Back navigation */}
              <div className="mb-6">
                <button
                  onClick={handleBackToSelection}
                  className={cn(
                    'text-sm flex items-center gap-1 transition-colors',
                    mode === 'mode3'
                      ? 'text-emerald-600 hover:text-emerald-800'
                      : 'text-amber-600 hover:text-amber-800'
                  )}
                >
                  ← Back to expert selection
                </button>
              </div>

              {/* Mission Input Component */}
              <MissionInput
                autoSelect={mode === 'mode4'}
                selectedExpert={selectedExpert ? {
                  id: selectedExpert.id,
                  name: selectedExpert.name,
                  level: selectedExpert.level || 'L2',
                  specialty: selectedExpert.domain || selectedExpert.tagline || '',
                } : null}
                onStartMission={handleMissionStart}
                isRunning={isExecuting}
              />
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TEMPLATE SELECTION PHASE
            Gallery of mission templates filtered by expert capabilities
            ENHANCED December 11, 2025 - Using new Mission Template System
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
                  onClick={handleBackToGoal}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  ← Back to mission goal
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
            {/* Placeholder for MissionBriefing */}
            <div className="max-w-2xl mx-auto p-6">
              <div className="mb-6">
                <button
                  onClick={handleBackToTemplate}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  ← Back to templates
                </button>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-xl border border-purple-100 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {selectedTemplate?.icon && (() => {
                    const TemplateIcon = selectedTemplate.icon;
                    return <TemplateIcon className="w-8 h-8 text-purple-600" />;
                  })()}
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {selectedTemplate?.name}
                    </h2>
                    <p className="text-sm text-slate-600">
                      with {selectedExpert?.name}
                    </p>
                  </div>
                </div>
                <p className="text-slate-600">{selectedTemplate?.description}</p>
              </div>

              {/* Mission Inputs (placeholder) */}
              <div className="space-y-4 mb-6">
                <h3 className="font-medium text-slate-900">Mission Inputs</h3>
                {selectedTemplate?.requiredInputs.map((input) => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {input.name}
                      {input.required && <span className="text-red-500">*</span>}
                    </label>
                    {input.type === 'textarea' ? (
                      <textarea
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder={input.placeholder}
                        rows={3}
                      />
                    ) : input.type === 'select' ? (
                      <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                        <option value="">Select...</option>
                        {input.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder={input.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Autonomy Band */}
              <div className="mb-6">
                <h3 className="font-medium text-slate-900 mb-3">Autonomy Level</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['supervised', 'guided', 'autonomous'] as const).map((band) => (
                    <button
                      key={band}
                      className={cn(
                        'p-3 rounded-lg border-2 text-center transition-all',
                        band === 'guided'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-slate-200 hover:border-purple-300'
                      )}
                    >
                      <div className="font-medium capitalize">{band}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {band === 'supervised' && 'Approve every step'}
                        {band === 'guided' && 'Key checkpoints only'}
                        {band === 'autonomous' && 'Minimal interruption'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Launch Button */}
              <button
                onClick={() => handleLaunch({
                  inputs: {},
                  autonomyBand: 'guided',
                })}
                className={cn(
                  'w-full py-4 rounded-xl font-semibold text-white transition-all',
                  'bg-gradient-to-r from-purple-600 to-purple-700',
                  'hover:from-purple-700 hover:to-purple-800',
                  'shadow-lg shadow-purple-500/25'
                )}
              >
                Launch Mission
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            MISSION EXECUTION PHASE
            Progressive disclosure of mission progress
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'execution' && (
          <motion.div
            key="execution"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-hidden"
          >
            {/* Placeholder for MissionExecutionView */}
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="border-b bg-gradient-to-r from-purple-50 to-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedTemplate?.icon && (() => {
                      const TemplateIcon = selectedTemplate.icon;
                      return <TemplateIcon className="w-6 h-6 text-purple-600" />;
                    })()}
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {selectedTemplate?.name}
                      </h2>
                      <p className="text-sm text-slate-600">
                        {selectedExpert?.name} • {streamState.status}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleAbortMission}
                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Abort Mission
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-2">
                  {isExecuting && (
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  )}
                  <span className="text-sm font-medium text-slate-700">
                    {streamState.progress?.stage || 'Initializing mission...'}
                  </span>
                </div>
                <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${streamState.progress?.progress || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Step {(streamState.progress?.subSteps?.filter(s => s.status === 'complete').length ?? 0) + 1} of {streamState.progress?.subSteps?.length ?? '?'}</span>
                  <span>{streamState.progress?.progress || 0}%</span>
                </div>
              </div>

              {/* Checkpoint (if pending) */}
              {hasActiveCheckpoint && streamState.checkpoint && (
                <div className="p-4 bg-amber-50 border-b border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      !
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-amber-900">
                        Checkpoint: {streamState.checkpoint.type}
                      </h3>
                      <p className="text-sm text-amber-700 mt-1">
                        {streamState.checkpoint.description}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleCheckpointResponse(streamState.checkpoint!.id, 'approve')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleCheckpointResponse(streamState.checkpoint!.id, 'modify')}
                          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => handleCheckpointResponse(streamState.checkpoint!.id, 'reject')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stream Content */}
              <div className="flex-1 overflow-auto p-4">
                {/* Reasoning Steps */}
                {streamState.reasoning.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {streamState.reasoning.map((step) => (
                      <div key={step.id} className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-purple-700">
                          <span className={cn(
                            'w-4 h-4 rounded-full border-2',
                            step.status === 'thinking' && 'border-purple-500 animate-spin border-t-transparent',
                            step.status === 'complete' && 'bg-purple-500 border-purple-500'
                          )} />
                          <span className="font-medium">{step.step}</span>
                        </div>
                        <p className="text-sm text-purple-600 mt-1 ml-6">{step.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Main Content - Safe text rendering */}
                {streamState.content && (
                  <div className="prose prose-purple max-w-none">
                    <p className="whitespace-pre-wrap">{streamState.content}</p>
                  </div>
                )}

                {/* Tools Used */}
                {streamState.toolCalls.length > 0 && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Tools Used</h4>
                    <div className="space-y-1">
                      {streamState.toolCalls.map((tool) => (
                        <div key={tool.id} className="flex items-center gap-2 text-sm">
                          <span className={cn(
                            'w-2 h-2 rounded-full',
                            tool.status === 'calling' && 'bg-amber-500 animate-pulse',
                            tool.status === 'success' && 'bg-green-500',
                            tool.status === 'error' && 'bg-red-500'
                          )} />
                          <span className="text-slate-600">{tool.toolName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            MISSION COMPLETE PHASE
            Results, artifacts, and next actions
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-auto"
          >
            {/* Placeholder for MissionCompleteView */}
            <div className="max-w-3xl mx-auto p-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-2xl text-green-600">✓</span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Mission Complete!
                </h2>
                <p className="text-slate-600 mt-2">
                  {selectedTemplate?.name} completed successfully
                </p>
              </div>

              {/* Artifacts */}
              {streamState.artifacts.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-slate-900 mb-3">Generated Artifacts</h3>
                  <div className="space-y-2">
                    {streamState.artifacts.map((artifact) => (
                      <div key={artifact.id} className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-900">{artifact.title}</div>
                          <div className="text-sm text-slate-500">{artifact.artifactType}</div>
                        </div>
                        <button className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Content - Safe text rendering */}
              {streamState.content && (
                <div className="mb-6 p-4 bg-white border rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-3">Summary</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-slate-700">
                      {streamState.content.length > 500
                        ? streamState.content.slice(0, 500) + '...'
                        : streamState.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleNewMission}
                  className={cn(
                    'flex-1 py-3 rounded-xl font-medium transition-all',
                    'bg-purple-600 text-white hover:bg-purple-700'
                  )}
                >
                  Start New Mission
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className={cn(
                    'flex-1 py-3 rounded-xl font-medium transition-all',
                    'border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AutonomousView;
