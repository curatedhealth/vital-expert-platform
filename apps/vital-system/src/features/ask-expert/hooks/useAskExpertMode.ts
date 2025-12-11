'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAskExpert, type AskExpertMode } from '@/components/vital-ai-ui/hooks';

/**
 * Ask Expert Mode Configuration
 * 
 * Defines the 4-Mode Execution Matrix with specific settings for each mode.
 */

export interface ModeConfig {
  id: AskExpertMode;
  name: string;
  description: string;
  hitlRequired: boolean;
  maxAgents: number;
  estimatedTime: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  features: string[];
}

export const MODE_CONFIGS: Record<AskExpertMode, ModeConfig> = {
  1: {
    id: 1,
    name: 'Direct Expert',
    description: 'Single expert provides immediate answer',
    hitlRequired: false,
    maxAgents: 1,
    estimatedTime: '< 30s',
    complexity: 'simple',
    features: ['Fast response', 'Single domain', 'No approval needed'],
  },
  2: {
    id: 2,
    name: 'Expert Panel',
    description: 'Multiple experts collaborate autonomously',
    hitlRequired: false,
    maxAgents: 5,
    estimatedTime: '1-3 min',
    complexity: 'moderate',
    features: ['Multi-domain', 'Automatic coordination', 'Comprehensive answer'],
  },
  3: {
    id: 3,
    name: 'Guided Collaboration',
    description: 'Expert panel with human checkpoints',
    hitlRequired: true,
    maxAgents: 5,
    estimatedTime: '3-10 min',
    complexity: 'complex',
    features: ['HITL checkpoints', 'Plan approval', 'Quality control'],
  },
  4: {
    id: 4,
    name: 'Full Autonomous',
    description: 'Complex multi-step research with artifacts',
    hitlRequired: false,
    maxAgents: 10,
    estimatedTime: '5-15 min',
    complexity: 'advanced',
    features: ['Deep research', 'Document generation', 'Multi-step workflow'],
  },
};

export interface UseAskExpertModeOptions {
  tenantId: string;
  defaultMode?: AskExpertMode;
  onModeChange?: (mode: AskExpertMode) => void;
}

export function useAskExpertMode(options: UseAskExpertModeOptions) {
  const { tenantId, defaultMode = 1, onModeChange } = options;
  const [selectedMode, setSelectedMode] = useState<AskExpertMode>(defaultMode);
  const [sessionId, setSessionId] = useState<string | undefined>();

  // Get mode configuration
  const modeConfig = useMemo(() => MODE_CONFIGS[selectedMode], [selectedMode]);

  // Use the shared AI hook
  const askExpert = useAskExpert({
    mode: selectedMode,
    tenantId,
    sessionId,
  });

  // Change mode
  const changeMode = useCallback((newMode: AskExpertMode) => {
    setSelectedMode(newMode);
    setSessionId(undefined); // Reset session on mode change
    askExpert.reset();
    onModeChange?.(newMode);
  }, [askExpert, onModeChange]);

  // Start new session
  const startSession = useCallback(() => {
    const newSessionId = `ask-expert-${selectedMode}-${Date.now()}`;
    setSessionId(newSessionId);
    return newSessionId;
  }, [selectedMode]);

  // Mode-specific features
  const canUseHITL = modeConfig.hitlRequired;
  const canUseMultiAgent = modeConfig.maxAgents > 1;
  const isComplexMode = modeConfig.complexity === 'complex' || modeConfig.complexity === 'advanced';

  return {
    // Mode state
    selectedMode,
    modeConfig,
    allModes: MODE_CONFIGS,
    
    // Mode actions
    changeMode,
    startSession,
    
    // Feature flags
    canUseHITL,
    canUseMultiAgent,
    isComplexMode,
    
    // Pass through ask expert hook
    ...askExpert,
    
    // Session
    sessionId,
  };
}

export type { AskExpertMode };
