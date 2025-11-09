/**
 * useModeLogic Hook
 * 
 * Manages mode determination, validation, and configuration for Ask Expert
 * 
 * 4 Modes:
 * - Mode 1: Manual Interactive (isAutomatic=false, isAutonomous=false)
 * - Mode 2: Automatic Agent Selection (isAutomatic=true, isAutonomous=false)
 * - Mode 3: Autonomous Multi-Agent Chat (isAutomatic=false, isAutonomous=true)
 * - Mode 4: Fully Autonomous (isAutomatic=true, isAutonomous=true)
 * 
 * @extracted from ask-expert/page.tsx
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ModeConfig, ModeRequirements } from '../types';

export interface UseModeLogicOptions {
  initialIsAutomatic?: boolean;
  initialIsAutonomous?: boolean;
  initialEnableRAG?: boolean;
  initialEnableTools?: boolean;
}

export interface UseModeLogicReturn {
  // Current State
  mode: number;
  isAutomatic: boolean;
  isAutonomous: boolean;
  enableRAG: boolean;
  enableTools: boolean;
  
  // Setters
  setIsAutomatic: (value: boolean) => void;
  setIsAutonomous: (value: boolean) => void;
  setEnableRAG: (value: boolean) => void;
  setEnableTools: (value: boolean) => void;
  toggleAutomatic: () => void;
  toggleAutonomous: () => void;
  toggleRAG: () => void;
  toggleTools: () => void;
  
  // Mode Configuration
  modeConfig: ModeConfig;
  
  // Validation
  validateRequirements: (context: {
    hasAgents: boolean;
    hasQuery: boolean;
  }) => ModeRequirements;
  
  // Utilities
  getModeName: () => string;
  getModeDescription: () => string;
  getModeEndpoint: () => string;
}

/**
 * Determines mode based on toggles
 */
function determineModeFromToggles(
  isAutomatic: boolean,
  isAutonomous: boolean
): number {
  if (!isAutomatic && !isAutonomous) return 1; // Mode 1: Manual
  if (isAutomatic && !isAutonomous) return 2;  // Mode 2: Automatic
  if (!isAutomatic && isAutonomous) return 3;  // Mode 3: Autonomous Chat
  return 4;                                     // Mode 4: Fully Autonomous
}

/**
 * Gets mode configuration based on mode number
 */
function getModeConfiguration(
  mode: number,
  isAutomatic: boolean,
  isAutonomous: boolean
): ModeConfig {
  const baseUrl = process.env.NEXT_PUBLIC_PYTHON_AI_ENGINE_URL || 'http://localhost:8080';
  
  switch (mode) {
    case 1:
      return {
        mode: 1,
        isAutomatic: false,
        isAutonomous: false,
        endpoint: `${baseUrl}/api/mode1/manual`,
        requiresAgentSelection: true,
        supportsTools: true,
        supportsRAG: true,
      };
    case 2:
      return {
        mode: 2,
        isAutomatic: true,
        isAutonomous: false,
        endpoint: `${baseUrl}/api/mode2/automatic`,
        requiresAgentSelection: false,
        supportsTools: true,
        supportsRAG: true,
      };
    case 3:
      return {
        mode: 3,
        isAutomatic: false,
        isAutonomous: true,
        endpoint: `${baseUrl}/api/mode3/autonomous-automatic`,
        requiresAgentSelection: false,
        supportsTools: true,
        supportsRAG: true,
      };
    case 4:
      return {
        mode: 4,
        isAutomatic: true,
        isAutonomous: true,
        endpoint: `${baseUrl}/api/mode4/autonomous-manual`,
        requiresAgentSelection: false,
        supportsTools: true,
        supportsRAG: true,
      };
    default:
      return {
        mode: 1,
        isAutomatic,
        isAutonomous,
        endpoint: `${baseUrl}/api/mode1/manual`,
        requiresAgentSelection: true,
        supportsTools: true,
        supportsRAG: true,
      };
  }
}

/**
 * Custom hook for managing mode logic
 */
export function useModeLogic(
  options: UseModeLogicOptions = {}
): UseModeLogicReturn {
  const {
    initialIsAutomatic = false,
    initialIsAutonomous = false,
    initialEnableRAG = true,
    initialEnableTools = true,
  } = options;
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [isAutomatic, setIsAutomatic] = useState(initialIsAutomatic);
  const [isAutonomous, setIsAutonomous] = useState(initialIsAutonomous);
  const [enableRAG, setEnableRAG] = useState(initialEnableRAG);
  const [enableTools, setEnableTools] = useState(initialEnableTools);
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const mode = useMemo(
    () => determineModeFromToggles(isAutomatic, isAutonomous),
    [isAutomatic, isAutonomous]
  );
  
  const modeConfig = useMemo(
    () => getModeConfiguration(mode, isAutomatic, isAutonomous),
    [mode, isAutomatic, isAutonomous]
  );
  
  // ============================================================================
  // TOGGLE FUNCTIONS
  // ============================================================================
  
  const toggleAutomatic = useCallback(() => {
    setIsAutomatic(prev => !prev);
  }, []);
  
  const toggleAutonomous = useCallback(() => {
    setIsAutonomous(prev => !prev);
  }, []);
  
  const toggleRAG = useCallback(() => {
    setEnableRAG(prev => !prev);
  }, []);
  
  const toggleTools = useCallback(() => {
    setEnableTools(prev => !prev);
  }, []);
  
  // ============================================================================
  // VALIDATION
  // ============================================================================
  
  const validateRequirements = useCallback(
    (context: { hasAgents: boolean; hasQuery: boolean }): ModeRequirements => {
      const { hasAgents, hasQuery } = context;
      const missingRequirements: string[] = [];
      
      // Mode 1 requires agent selection
      if (mode === 1 && !hasAgents) {
        missingRequirements.push('At least one agent must be selected for Mode 1');
      }
      
      // All modes require a query
      if (!hasQuery) {
        missingRequirements.push('A query is required');
      }
      
      return {
        hasAgents,
        hasQuery,
        isValid: missingRequirements.length === 0,
        missingRequirements,
      };
    },
    [mode]
  );
  
  // ============================================================================
  // UTILITIES
  // ============================================================================
  
  const getModeName = useCallback((): string => {
    switch (mode) {
      case 1:
        return 'Mode 1: Manual Interactive';
      case 2:
        return 'Mode 2: Automatic Agent Selection';
      case 3:
        return 'Mode 3: Autonomous Multi-Agent';
      case 4:
        return 'Mode 4: Fully Autonomous';
      default:
        return 'Unknown Mode';
    }
  }, [mode]);
  
  const getModeDescription = useCallback((): string => {
    switch (mode) {
      case 1:
        return 'You select the expert agent manually. Best for specific consultations.';
      case 2:
        return 'AI automatically selects the best expert based on your query.';
      case 3:
        return 'Multiple AI agents collaborate autonomously on your query.';
      case 4:
        return 'Fully autonomous mode with automatic agent selection and orchestration.';
      default:
        return '';
    }
  }, [mode]);
  
  const getModeEndpoint = useCallback((): string => {
    return modeConfig.endpoint;
  }, [modeConfig]);
  
  // ============================================================================
  // LOGGING (for debugging)
  // ============================================================================
  
  useEffect(() => {
    console.log('[useModeLogic] Mode changed:', {
      mode,
      isAutomatic,
      isAutonomous,
      endpoint: modeConfig.endpoint,
    });
  }, [mode, isAutomatic, isAutonomous, modeConfig.endpoint]);
  
  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    // State
    mode,
    isAutomatic,
    isAutonomous,
    enableRAG,
    enableTools,
    
    // Setters
    setIsAutomatic,
    setIsAutonomous,
    setEnableRAG,
    setEnableTools,
    toggleAutomatic,
    toggleAutonomous,
    toggleRAG,
    toggleTools,
    
    // Config
    modeConfig,
    
    // Validation
    validateRequirements,
    
    // Utilities
    getModeName,
    getModeDescription,
    getModeEndpoint,
  };
}


