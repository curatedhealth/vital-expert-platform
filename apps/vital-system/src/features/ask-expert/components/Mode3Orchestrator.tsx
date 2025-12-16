'use client';

/**
 * Mode 3 Orchestrator - State Machine Component
 *
 * Coordinates the 4 HITL checkpoint journey for Deep Research missions:
 * 1. Goal Confirmation - Review AI-parsed mission goals
 * 2. Plan Confirmation - Review generated execution plan
 * 3. Mission Validation - Final review before launch
 * 4. Deliverable Confirmation - Accept or request revision
 *
 * State Flow:
 * initial → goal_parsing → goal_confirmation → plan_generation →
 * plan_confirmation → team_assembly → mission_validation →
 * execution → deliverable_generation → deliverable_review →
 * (revision loop) → completed
 */

import React, { useCallback, useEffect, useReducer } from 'react';
import { Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

import {
  GoalConfirmationCheckpoint,
  PlanConfirmationCheckpoint,
  MissionValidationCheckpoint,
  DeliverableConfirmationCheckpoint
} from './mode3-checkpoints';

import type {
  Mode3OrchestratorState,
  Mode3OrchestratorPhase,
  MissionGoal,
  PlanPhase,
  MissionConfig,
  Deliverable,
  TeamMember,
  LoopConfig
} from '../mode-3/types/mode3.types';

// ============================================================================
// Props
// ============================================================================

export interface Mode3OrchestratorProps {
  conversationId: string;
  agentId: string;
  initialPrompt: string;
  tenantId: string;
  userId: string;
  onComplete: (missionId: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

// ============================================================================
// State Management
// ============================================================================

type Action =
  | { type: 'SET_PHASE'; phase: Mode3OrchestratorPhase }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_GOALS'; goals: MissionGoal[] }
  | { type: 'SET_PLAN'; phases: PlanPhase[] }
  | { type: 'SET_TEAM'; team: TeamMember[] }
  | { type: 'SET_DELIVERABLES'; deliverables: Deliverable[] }
  | { type: 'SET_CONFIG'; config: Partial<MissionConfig> }
  | { type: 'SET_MISSION_ID'; missionId: string }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'INCREMENT_REVISION' }
  | { type: 'SET_REVISION_FEEDBACK'; feedback: string };

const initialState: Mode3OrchestratorState = {
  phase: 'initial',
  config: {
    goals: [],
    plan: [],
    team: [],
    loops: {
      max_iterations: 3,
      convergence_threshold: 0.85,
      enable_auto_refinement: true
    },
    deliverables: [],
    variables: {}
  },
  is_loading: false,
  revision_count: 0,
  max_revisions: 3
};

function reducer(state: Mode3OrchestratorState, action: Action): Mode3OrchestratorState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.phase };
    case 'SET_LOADING':
      return { ...state, is_loading: action.isLoading };
    case 'SET_GOALS':
      return {
        ...state,
        config: { ...state.config, goals: action.goals }
      };
    case 'SET_PLAN':
      return {
        ...state,
        config: { ...state.config, plan: action.phases }
      };
    case 'SET_TEAM':
      return {
        ...state,
        config: { ...state.config, team: action.team }
      };
    case 'SET_DELIVERABLES':
      return {
        ...state,
        config: { ...state.config, deliverables: action.deliverables }
      };
    case 'SET_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.config }
      };
    case 'SET_MISSION_ID':
      return { ...state, mission_id: action.missionId };
    case 'SET_ERROR':
      return { ...state, error: action.error, is_loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: undefined };
    case 'INCREMENT_REVISION':
      return { ...state, revision_count: state.revision_count + 1 };
    case 'SET_REVISION_FEEDBACK':
      return { ...state, revision_feedback: action.feedback };
    default:
      return state;
  }
}

// ============================================================================
// Phase Progress Calculation
// ============================================================================

const PHASE_ORDER: Mode3OrchestratorPhase[] = [
  'initial',
  'goal_parsing',
  'goal_confirmation',
  'plan_generation',
  'plan_confirmation',
  'team_assembly',
  'mission_validation',
  'execution',
  'deliverable_generation',
  'deliverable_review',
  'completed'
];

function getPhaseProgress(phase: Mode3OrchestratorPhase): number {
  const index = PHASE_ORDER.indexOf(phase);
  if (index === -1) return 0;
  return Math.round((index / (PHASE_ORDER.length - 1)) * 100);
}

function getPhaseLabel(phase: Mode3OrchestratorPhase): string {
  const labels: Record<Mode3OrchestratorPhase, string> = {
    initial: 'Initializing...',
    goal_parsing: 'Parsing Goals...',
    goal_confirmation: 'Confirm Goals',
    plan_generation: 'Generating Plan...',
    plan_confirmation: 'Confirm Plan',
    team_assembly: 'Assembling Team...',
    mission_validation: 'Validate Mission',
    execution: 'Executing Mission...',
    deliverable_generation: 'Generating Deliverables...',
    deliverable_review: 'Review Deliverables',
    revision: 'Revising...',
    completed: 'Mission Complete',
    failed: 'Mission Failed',
    cancelled: 'Mission Cancelled'
  };
  return labels[phase] || phase;
}

// ============================================================================
// Component
// ============================================================================

export function Mode3Orchestrator({
  conversationId,
  agentId,
  initialPrompt,
  tenantId,
  userId,
  onComplete,
  onCancel,
  onError
}: Mode3OrchestratorProps) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    original_prompt: initialPrompt,
    agent_id: agentId,
    conversation_id: conversationId
  });

  // ============================================================================
  // API Calls (to be connected to backend)
  // ============================================================================

  const parseGoals = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_PHASE', phase: 'goal_parsing' });

    try {
      // Call real backend API for LLM-powered goal parsing
      const AI_ENGINE_URL = process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000';
      const response = await fetch(`${AI_ENGINE_URL}/api/mode3/parse-goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'x-user-id': userId,
        },
        body: JSON.stringify({ prompt: initialPrompt, agent_id: agentId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();

      // Map backend response to component format
      // Backend: { id, description, priority, status, success_criteria, estimated_complexity }
      // Component: { id, text, priority, category, order, confidence }
      const parsedGoals: MissionGoal[] = (data.goals || []).map((goal: any, index: number) => ({
        id: goal.id || `goal-${index + 1}`,
        text: goal.description || '',
        priority: goal.priority === 'high' ? 5 : goal.priority === 'medium' ? 3 : 2,
        category: goal.estimated_complexity || 'research',
        order: index,
        confidence: 0.9, // Backend doesn't return confidence yet
        success_criteria: goal.success_criteria,
      }));

      dispatch({ type: 'SET_GOALS', goals: parsedGoals });
      dispatch({ type: 'SET_PHASE', phase: 'goal_confirmation' });
    } catch (error) {
      console.error('Goal parsing error:', error);
      dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Failed to parse goals. Please try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, [initialPrompt, agentId, tenantId, userId]);

  const generatePlan = useCallback(async (confirmedGoals: MissionGoal[]) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_PHASE', phase: 'plan_generation' });
    dispatch({ type: 'SET_GOALS', goals: confirmedGoals });

    try {
      // Call real backend API for LLM-powered plan generation
      const AI_ENGINE_URL = process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000';

      // Map goals back to backend format
      const goalsForBackend = confirmedGoals.map(g => ({
        id: g.id,
        description: g.text,
        priority: g.priority >= 4 ? 'high' : g.priority === 3 ? 'medium' : 'low',
        status: 'pending',
      }));

      const response = await fetch(`${AI_ENGINE_URL}/api/mode3/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'x-user-id': userId,
        },
        body: JSON.stringify({ goals: goalsForBackend, agent_id: agentId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();

      // Map backend response to component format
      const parsedPlan: PlanPhase[] = (data.phases || []).map((phase: any, phaseIndex: number) => ({
        id: phase.id || `phase-${phaseIndex + 1}`,
        name: phase.name || `Phase ${phaseIndex + 1}`,
        description: phase.description || '',
        order: phaseIndex,
        estimated_duration_minutes: (phase.tasks || []).reduce((sum: number, t: any) => sum + (t.estimated_minutes || 10), 0),
        steps: (phase.tasks || []).map((task: any, taskIndex: number) => ({
          id: task.id || `step-${phaseIndex + 1}-${taskIndex + 1}`,
          name: task.name || '',
          description: task.type || '',
          estimated_duration_minutes: task.estimated_minutes || 10,
          dependencies: phase.dependencies || [],
          order: taskIndex,
        })),
      }));

      dispatch({ type: 'SET_PLAN', phases: parsedPlan });
      dispatch({ type: 'SET_PHASE', phase: 'plan_confirmation' });
    } catch (error) {
      console.error('Plan generation error:', error);
      dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Failed to generate plan. Please try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, [tenantId, userId, agentId]);

  const assembleTeam = useCallback(async (confirmedPlan: PlanPhase[]) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_PHASE', phase: 'team_assembly' });
    dispatch({ type: 'SET_PLAN', phases: confirmedPlan });

    try {
      // Call real backend API for LLM-powered team assembly
      const AI_ENGINE_URL = process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000';

      // Map plan to backend format
      const planForBackend = confirmedPlan.map(phase => ({
        id: phase.id,
        name: phase.name,
        description: phase.description,
        tasks: (phase.steps || []).map(step => ({
          id: step.id,
          name: step.name,
          type: step.description,
          estimated_minutes: step.estimated_duration_minutes,
        })),
      }));

      const response = await fetch(`${AI_ENGINE_URL}/api/mode3/assemble-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'x-user-id': userId,
        },
        body: JSON.stringify({ plan: planForBackend, agent_id: agentId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();

      // Map backend team response to component format
      const parsedTeam: TeamMember[] = (data.team || []).map((member: any) => ({
        id: member.id,
        agent_id: member.id,
        agent_name: member.name || 'Expert',
        role: member.role || 'Lead',
        responsibilities: member.capabilities || [],
        avatar: `/icons/png/avatars/avatar_0${Math.floor(Math.random() * 200) + 1}.png`,
        tier: 2,
      }));

      // Map backend deliverables response to component format
      const parsedDeliverables: Deliverable[] = (data.deliverables || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.type === 'document' ? 'markdown' : d.type === 'diagram' ? 'mermaid' : d.type,
        status: 'pending',
        description: d.description,
      }));

      dispatch({ type: 'SET_TEAM', team: parsedTeam });
      dispatch({ type: 'SET_DELIVERABLES', deliverables: parsedDeliverables });
      dispatch({ type: 'SET_PHASE', phase: 'mission_validation' });
    } catch (error) {
      console.error('Team assembly error:', error);
      dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Failed to assemble team. Please try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, [tenantId, userId, agentId]);

  const launchMission = useCallback(async (config: MissionConfig) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_PHASE', phase: 'execution' });
    dispatch({ type: 'SET_CONFIG', config });

    try {
      // TODO: Connect to backend API - launch mission
      await new Promise(resolve => setTimeout(resolve, 3000));
      dispatch({ type: 'SET_MISSION_ID', missionId: `mission-${Date.now()}` });

      // Simulate deliverable generation
      dispatch({ type: 'SET_PHASE', phase: 'deliverable_generation' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update deliverables with generated content
      const generatedDeliverables: Deliverable[] = (config.deliverables || []).map(d => ({
        ...d,
        status: 'generated' as const,
        quality_score: Math.floor(Math.random() * 15) + 85,
        preview: `Preview of ${d.name}...`,
        content: `Full content of ${d.name} would appear here.`
      }));

      dispatch({ type: 'SET_DELIVERABLES', deliverables: generatedDeliverables });
      dispatch({ type: 'SET_PHASE', phase: 'deliverable_review' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: 'Failed to launch mission. Please try again.' });
      dispatch({ type: 'SET_PHASE', phase: 'failed' });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, []);

  const saveDraft = useCallback(async (name: string, config: MissionConfig) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    try {
      // TODO: Connect to backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Draft saved:', name, config);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: 'Failed to save draft.' });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, []);

  const saveTemplate = useCallback(async (name: string, description: string, config: MissionConfig) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    try {
      // TODO: Connect to backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Template saved:', name, description, config);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: 'Failed to save template.' });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, []);

  const requestRevision = useCallback(async (feedback: string) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_REVISION_FEEDBACK', feedback });
    dispatch({ type: 'INCREMENT_REVISION' });
    dispatch({ type: 'SET_PHASE', phase: 'revision' });

    try {
      // TODO: Connect to backend API - trigger revision
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Simulate improved deliverables
      const revisedDeliverables: Deliverable[] = (state.config.deliverables || []).map(d => ({
        ...d,
        status: 'generated' as const,
        quality_score: Math.min(100, (d.quality_score || 85) + 5),
        revision_count: (d.revision_count || 0) + 1
      }));

      dispatch({ type: 'SET_DELIVERABLES', deliverables: revisedDeliverables });
      dispatch({ type: 'SET_PHASE', phase: 'deliverable_review' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: 'Failed to process revision request.' });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, [state.config.deliverables]);

  const acceptDeliverables = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_PHASE', phase: 'completed' });

    try {
      // TODO: Connect to backend API - mark mission complete
      await new Promise(resolve => setTimeout(resolve, 500));
      onComplete(state.mission_id || '');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: 'Failed to complete mission.' });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, [state.mission_id, onComplete]);

  // ============================================================================
  // Effects
  // ============================================================================

  // Start goal parsing on mount
  useEffect(() => {
    if (state.phase === 'initial' && initialPrompt) {
      parseGoals();
    }
  }, [state.phase, initialPrompt, parseGoals]);

  // Report errors to parent
  useEffect(() => {
    if (state.error) {
      onError(state.error);
    }
  }, [state.error, onError]);

  // ============================================================================
  // Navigation Handlers
  // ============================================================================

  const handleEditSection = useCallback((section: 'goals' | 'plan' | 'team' | 'settings') => {
    switch (section) {
      case 'goals':
        dispatch({ type: 'SET_PHASE', phase: 'goal_confirmation' });
        break;
      case 'plan':
        dispatch({ type: 'SET_PHASE', phase: 'plan_confirmation' });
        break;
      // team and settings can be edited inline in mission_validation
    }
  }, []);

  const handleRefineGoals = useCallback(() => {
    parseGoals();
  }, [parseGoals]);

  const handleRefinePlan = useCallback(() => {
    if (state.config.goals) {
      generatePlan(state.config.goals);
    }
  }, [state.config.goals, generatePlan]);

  const handleStartOver = useCallback(() => {
    dispatch({ type: 'SET_PHASE', phase: 'initial' });
    dispatch({ type: 'SET_CONFIG', config: initialState.config });
    dispatch({ type: 'CLEAR_ERROR' });
    parseGoals();
  }, [parseGoals]);

  const handleBackToPlan = useCallback(() => {
    dispatch({ type: 'SET_PHASE', phase: 'plan_confirmation' });
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  const renderPhaseContent = () => {
    const { phase, config, is_loading: isLoading, revision_count, max_revisions, mission_id } = state;

    // Loading states
    if (['initial', 'goal_parsing', 'plan_generation', 'team_assembly', 'execution', 'deliverable_generation', 'revision'].includes(phase)) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <Loader2 className="h-12 w-12 animate-spin text-fuchsia-600" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getPhaseLabel(phase)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {phase === 'goal_parsing' && 'AI is analyzing your request and identifying key objectives...'}
              {phase === 'plan_generation' && 'Creating an optimized execution plan for your mission...'}
              {phase === 'team_assembly' && 'Selecting the best AI agents for your mission...'}
              {phase === 'execution' && 'Mission is running. This may take a few minutes...'}
              {phase === 'deliverable_generation' && 'Generating your requested deliverables...'}
              {phase === 'revision' && 'Incorporating your feedback and improving deliverables...'}
            </p>
          </div>
        </div>
      );
    }

    // HITL Checkpoint 1: Goal Confirmation
    if (phase === 'goal_confirmation') {
      return (
        <GoalConfirmationCheckpoint
          goals={config.goals || []}
          originalPrompt={state.original_prompt}
          onConfirm={generatePlan}
          onRefine={handleRefineGoals}
          onStartOver={handleStartOver}
          isLoading={isLoading}
        />
      );
    }

    // HITL Checkpoint 2: Plan Confirmation
    if (phase === 'plan_confirmation') {
      const totalDuration = (config.plan || []).reduce(
        (sum, p) => sum + p.estimated_duration_minutes, 0
      );
      return (
        <PlanConfirmationCheckpoint
          phases={config.plan || []}
          estimatedDuration={totalDuration}
          onConfirm={assembleTeam}
          onRefine={handleRefinePlan}
          onBack={handleStartOver}
          isLoading={isLoading}
        />
      );
    }

    // HITL Checkpoint 3: Mission Validation
    if (phase === 'mission_validation') {
      const fullConfig: MissionConfig = {
        goals: config.goals || [],
        plan: config.plan || [],
        team: config.team || [],
        loops: config.loops || {
          max_iterations: 3,
          convergence_threshold: 0.85,
          enable_auto_refinement: true
        },
        deliverables: config.deliverables || [],
        variables: config.variables || {},
        metadata: config.metadata
      };

      return (
        <MissionValidationCheckpoint
          config={fullConfig}
          onLaunch={launchMission}
          onSaveDraft={saveDraft}
          onSaveTemplate={saveTemplate}
          onEditSection={handleEditSection}
          isLoading={isLoading}
        />
      );
    }

    // HITL Checkpoint 4: Deliverable Confirmation
    if (phase === 'deliverable_review') {
      return (
        <DeliverableConfirmationCheckpoint
          deliverables={config.deliverables || []}
          missionId={mission_id || ''}
          revisionCount={revision_count}
          maxRevisions={max_revisions}
          onAccept={acceptDeliverables}
          onRequestRevision={requestRevision}
          onDownload={(id) => console.log('Download:', id)}
          onPreview={(id) => console.log('Preview:', id)}
          isLoading={isLoading}
        />
      );
    }

    // Completed state
    if (phase === 'completed') {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <CheckCircle className="h-16 w-16 text-green-600" />
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mission Complete!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Your deliverables have been accepted and are ready for download.
            </p>
          </div>
          <Button onClick={onCancel} variant="outline">
            Start New Mission
          </Button>
        </div>
      );
    }

    // Failed state
    if (phase === 'failed') {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <XCircle className="h-16 w-16 text-red-600" />
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mission Failed
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {state.error || 'An unexpected error occurred.'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleStartOver} variant="outline">
              Try Again
            </Button>
            <Button onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    // Cancelled state
    if (phase === 'cancelled') {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <AlertTriangle className="h-16 w-16 text-amber-600" />
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mission Cancelled
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              The mission has been cancelled.
            </p>
          </div>
          <Button onClick={onCancel}>
            Return
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Header */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-900 border rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getPhaseLabel(state.phase)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {getPhaseProgress(state.phase)}%
          </span>
        </div>
        <Progress value={getPhaseProgress(state.phase)} className="h-2" />
      </div>

      {/* Error Alert */}
      {state.error && !['failed'].includes(state.phase) && (
        <Alert className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-900 border rounded-lg shadow-sm">
        {renderPhaseContent()}
      </div>
    </div>
  );
}

export default Mode3Orchestrator;
