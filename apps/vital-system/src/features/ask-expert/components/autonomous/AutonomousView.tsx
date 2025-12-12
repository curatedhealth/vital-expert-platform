'use client';

/**
 * VITAL Platform - AutonomousView Master Component
 *
 * Orchestrates the complete autonomous mission workflow for Modes 3 & 4:
 * 1. Template Selection (MissionTemplateSelector)
 * 2. Mission Briefing (MissionBriefing)
 * 3. Mission Execution (MissionExecutionView)
 * 4. Mission Complete (MissionCompleteView)
 *
 * Manages state machine transitions and data flow between phases.
 * Handles error states, abortion, and navigation.
 *
 * Aligned with: services/ai-engine/docs/FRONTEND_INTEGRATION_REFERENCE.md
 *
 * Design System: VITAL Brand v6.0 (Purple Theme #9055E0)
 * Phase 3 Implementation - December 11, 2025
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Home,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

// Import autonomous components
import { MissionTemplateSelector } from './MissionTemplateSelector';
import { MissionBriefing } from './MissionBriefing';
import { MissionExecutionView, type MissionResult } from './MissionExecutionView';
import { MissionCompleteView } from './MissionCompleteView';

// Import types
import type {
  MissionTemplate,
  MissionConfig,
  Mission,
  MissionFamily,
  PharmaDomain,
  MissionComplexity,
} from '../../types/mission-runners';

// =============================================================================
// TYPES
// =============================================================================

/** Mission flow phases */
type MissionPhase =
  | 'select'     // Template selection
  | 'briefing'   // Pre-flight configuration
  | 'executing'  // Mission in progress
  | 'complete'   // Mission finished
  | 'error';     // Error state

/** Expert type for mission execution */
interface Expert {
  id: string;
  name: string;
  displayName: string;
  avatar?: string;
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  capabilities: string[];
}

export interface AutonomousViewProps {
  /** Pre-selected expert (optional, for Mode 3) */
  expert?: Expert;
  /** Mode type: 3 = Query Automatic, 4 = Chat Automatic */
  mode: 3 | 4;
  /** Initial template ID (optional, skip to briefing) */
  initialTemplateId?: string;
  /** Callback when user exits autonomous mode */
  onExit?: () => void;
  /** Callback when mission completes */
  onMissionComplete?: (result: MissionResult) => void;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// MOCK DATA (Replace with real API calls)
// =============================================================================

const DEFAULT_EXPERT: Expert = {
  id: 'default-expert',
  name: 'VITAL AI Expert',
  displayName: 'VITAL AI Expert',
  level: 'L2',
  capabilities: ['research', 'analysis', 'synthesis'],
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onExit: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, onExit }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center min-h-[400px] p-8"
  >
    <div className="p-4 bg-red-500/20 rounded-full mb-4">
      <AlertTriangle className="w-8 h-8 text-red-400" />
    </div>
    <h2 className="text-xl font-semibold text-white mb-2">Mission Error</h2>
    <p className="text-neutral-400 text-center max-w-md mb-6">{error}</p>
    <div className="flex items-center gap-3">
      <Button
        onClick={onRetry}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
      <Button
        onClick={onExit}
        variant="outline"
        className="border-neutral-600 text-neutral-300"
      >
        <Home className="w-4 h-4 mr-2" />
        Exit
      </Button>
    </div>
  </motion.div>
);

interface PhaseHeaderProps {
  phase: MissionPhase;
  templateName?: string;
  onBack?: () => void;
  canGoBack: boolean;
}

const PhaseHeader: React.FC<PhaseHeaderProps> = ({
  phase,
  templateName,
  onBack,
  canGoBack,
}) => {
  const getPhaseLabel = () => {
    switch (phase) {
      case 'select': return 'Select Mission Template';
      case 'briefing': return templateName || 'Mission Briefing';
      case 'executing': return 'Mission in Progress';
      case 'complete': return 'Mission Complete';
      case 'error': return 'Error';
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {canGoBack && (
          <button
            onClick={onBack}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-semibold text-white">{getPhaseLabel()}</h1>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="flex items-center gap-2">
        {(['select', 'briefing', 'executing', 'complete'] as const).map((p, idx) => (
          <div
            key={p}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              phase === p
                ? 'bg-purple-500'
                : ['select', 'briefing', 'executing', 'complete'].indexOf(phase) > idx
                  ? 'bg-purple-500/50'
                  : 'bg-neutral-700'
            )}
          />
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const AutonomousView: React.FC<AutonomousViewProps> = ({
  expert = DEFAULT_EXPERT,
  mode,
  initialTemplateId,
  onExit,
  onMissionComplete,
  className,
}) => {
  // State machine
  const [phase, setPhase] = useState<MissionPhase>(
    initialTemplateId ? 'briefing' : 'select'
  );

  // Mission data
  const [selectedTemplate, setSelectedTemplate] = useState<MissionTemplate | null>(null);
  const [missionConfig, setMissionConfig] = useState<MissionConfig | null>(null);
  const [missionId, setMissionId] = useState<string | null>(null);
  const [missionResult, setMissionResult] = useState<MissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================================
  // PHASE HANDLERS
  // ==========================================================================

  /** Handle template selection */
  const handleTemplateSelect = useCallback((template: MissionTemplate) => {
    setSelectedTemplate(template);
    setPhase('briefing');
  }, []);

  /** Handle mission start from briefing */
  const handleMissionStart = useCallback((config: MissionConfig) => {
    setMissionConfig(config);
    // Generate mission ID (in real app, this comes from backend)
    setMissionId(`mission-${Date.now()}`);
    setPhase('executing');
  }, []);

  /** Handle mission completion */
  const handleMissionComplete = useCallback((result: MissionResult) => {
    setMissionResult(result);
    setPhase('complete');
    onMissionComplete?.(result);
  }, [onMissionComplete]);

  /** Handle mission error */
  const handleMissionError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setPhase('error');
  }, []);

  /** Handle mission abort */
  const handleMissionAbort = useCallback(() => {
    setPhase('briefing');
  }, []);

  /** Handle going back */
  const handleBack = useCallback(() => {
    switch (phase) {
      case 'briefing':
        setSelectedTemplate(null);
        setPhase('select');
        break;
      case 'error':
        setError(null);
        setPhase('briefing');
        break;
    }
  }, [phase]);

  /** Handle retry from error */
  const handleRetry = useCallback(() => {
    setError(null);
    if (selectedTemplate && missionConfig) {
      setPhase('executing');
    } else if (selectedTemplate) {
      setPhase('briefing');
    } else {
      setPhase('select');
    }
  }, [selectedTemplate, missionConfig]);

  /** Handle starting a new mission from complete */
  const handleNewMission = useCallback(() => {
    setSelectedTemplate(null);
    setMissionConfig(null);
    setMissionId(null);
    setMissionResult(null);
    setPhase('select');
  }, []);

  /** Handle repeating the same mission */
  const handleRepeatMission = useCallback(() => {
    setMissionResult(null);
    setMissionId(`mission-${Date.now()}`);
    setPhase('executing');
  }, []);

  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================

  const canGoBack = useMemo(() => {
    return phase === 'briefing' || phase === 'error';
  }, [phase]);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className={cn('min-h-screen bg-neutral-950', className)}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <PhaseHeader
          phase={phase}
          templateName={selectedTemplate?.name}
          onBack={handleBack}
          canGoBack={canGoBack}
        />

        {/* Phase Content */}
        <AnimatePresence mode="wait">
          {/* Select Phase */}
          {phase === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MissionTemplateSelector
                onSelect={handleTemplateSelect}
                selectedId={selectedTemplate?.id}
                mode={mode}
              />
            </motion.div>
          )}

          {/* Briefing Phase */}
          {phase === 'briefing' && selectedTemplate && (
            <motion.div
              key="briefing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MissionBriefing
                template={selectedTemplate}
                expert={{
                  id: expert.id,
                  name: expert.displayName,
                  avatar: expert.avatar,
                  tier: expert.level,
                }}
                onStart={handleMissionStart}
                onCancel={() => handleBack()}
              />
            </motion.div>
          )}

          {/* Executing Phase */}
          {phase === 'executing' && selectedTemplate && missionConfig && (
            <motion.div
              key="executing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MissionExecutionView
                template={selectedTemplate}
                expert={expert}
                config={missionConfig}
                missionId={missionId || undefined}
                onComplete={handleMissionComplete}
                onError={handleMissionError}
                onAbort={handleMissionAbort}
              />
            </motion.div>
          )}

          {/* Complete Phase */}
          {phase === 'complete' && selectedTemplate && missionResult && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MissionCompleteView
                template={selectedTemplate}
                result={missionResult}
                expert={{
                  id: expert.id,
                  name: expert.displayName,
                  avatar: expert.avatar,
                }}
                onNewMission={handleNewMission}
                onRepeat={handleRepeatMission}
                onShare={() => {
                  // TODO: Implement share functionality
                  console.log('Share mission result');
                }}
                onExport={() => {
                  // TODO: Implement export functionality
                  console.log('Export mission result');
                }}
              />
            </motion.div>
          )}

          {/* Error Phase */}
          {phase === 'error' && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ErrorState
                error={error}
                onRetry={handleRetry}
                onExit={onExit || (() => handleNewMission())}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AutonomousView;
