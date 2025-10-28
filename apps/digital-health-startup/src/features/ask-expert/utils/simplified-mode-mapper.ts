/**
 * Simplified Mode Mapper - 2 Toggle System
 *
 * Maps 2 boolean toggles to 4 backend modes
 * Provides utility functions for mode validation and recommendations
 */

import type { SimplifiedMode } from '@/features/chat/services/simplified-langgraph-orchestrator';

// ============================================================================
// TOGGLE TO MODE MAPPING
// ============================================================================

/**
 * Converts toggle states to backend mode enum
 */
export function getBackendMode(isAutonomous: boolean, isAutomatic: boolean): SimplifiedMode {
  if (!isAutonomous && !isAutomatic) return 'interactive_manual';
  if (!isAutonomous && isAutomatic) return 'interactive_automatic';
  if (isAutonomous && !isAutomatic) return 'autonomous_manual';
  return 'autonomous_automatic';
}

/**
 * Converts backend mode enum to toggle states
 */
export function getTogglesFromMode(mode: SimplifiedMode): {
  isAutonomous: boolean;
  isAutomatic: boolean;
} {
  switch (mode) {
    case 'interactive_manual':
      return { isAutonomous: false, isAutomatic: false };
    case 'interactive_automatic':
      return { isAutonomous: false, isAutomatic: true };
    case 'autonomous_manual':
      return { isAutonomous: true, isAutomatic: false };
    case 'autonomous_automatic':
      return { isAutonomous: true, isAutomatic: true };
    default:
      return { isAutonomous: false, isAutomatic: false };
  }
}

// ============================================================================
// MODE CONFIGURATION
// ============================================================================

export interface ModeConfig {
  name: string;
  description: string;
  requiresAgentSelection: boolean;
  supportsMultiTurn: boolean;
  supportsCheckpoints: boolean;
  usesTools: boolean;
  avgResponseTime: string;
  maxAgents: number;
}

export const MODE_CONFIGS: Record<SimplifiedMode, ModeConfig> = {
  interactive_manual: {
    name: 'Focused Expert Conversation',
    description: 'In-depth conversation with your chosen expert',
    requiresAgentSelection: true,
    supportsMultiTurn: true,
    supportsCheckpoints: false,
    usesTools: false,
    avgResponseTime: '30-45s',
    maxAgents: 1
  },
  interactive_automatic: {
    name: 'Smart Expert Discussion',
    description: 'AI selects best expert(s) for dynamic conversation',
    requiresAgentSelection: false,
    supportsMultiTurn: true,
    supportsCheckpoints: false,
    usesTools: false,
    avgResponseTime: '45-60s',
    maxAgents: 2
  },
  autonomous_manual: {
    name: 'Expert-Driven Workflow',
    description: 'Your expert executes multi-step task autonomously',
    requiresAgentSelection: true,
    supportsMultiTurn: false,
    supportsCheckpoints: true,
    usesTools: true,
    avgResponseTime: '3-5min',
    maxAgents: 1
  },
  autonomous_automatic: {
    name: 'AI Collaborative Workflow',
    description: 'Multiple experts collaborate on your goal',
    requiresAgentSelection: false,
    supportsMultiTurn: false,
    supportsCheckpoints: true,
    usesTools: true,
    avgResponseTime: '5-10min',
    maxAgents: 4
  }
};

/**
 * Get configuration for current toggle states
 */
export function getModeConfig(isAutonomous: boolean, isAutomatic: boolean): ModeConfig {
  const mode = getBackendMode(isAutonomous, isAutomatic);
  return MODE_CONFIGS[mode];
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates that the current mode state is valid for submission
 */
export function validateModeState(
  isAutonomous: boolean,
  isAutomatic: boolean,
  selectedAgentId: string | null
): { valid: boolean; error?: string } {
  const config = getModeConfig(isAutonomous, isAutomatic);

  if (config.requiresAgentSelection && !selectedAgentId) {
    return {
      valid: false,
      error: `${config.name} requires an expert selection. Please choose an expert from the list.`
    };
  }

  return { valid: true };
}

// ============================================================================
// MODE RECOMMENDATIONS
// ============================================================================

export interface QueryCharacteristics {
  queryLength: number;
  hasMultipleQuestions: boolean;
  requiresDeepAnalysis: boolean;
  isGoalOriented: boolean;
  hasKnownExpert: boolean;
  complexityLevel: 'low' | 'medium' | 'high';
  domainCount: number;
}

/**
 * Recommends toggle settings based on query characteristics
 */
export function recommendToggles(characteristics: QueryCharacteristics): {
  isAutonomous: boolean;
  isAutomatic: boolean;
  confidence: number;
  reason: string;
} {
  const {
    queryLength,
    hasMultipleQuestions,
    requiresDeepAnalysis,
    isGoalOriented,
    hasKnownExpert,
    complexityLevel,
    domainCount
  } = characteristics;

  // Determine if autonomous
  let isAutonomous = false;
  if (isGoalOriented || (requiresDeepAnalysis && queryLength > 200)) {
    isAutonomous = true;
  }

  // Determine if automatic
  let isAutomatic = true; // Default to automatic
  if (hasKnownExpert) {
    isAutomatic = false; // User knows which expert
  }
  if (domainCount > 2) {
    isAutomatic = true; // Multi-domain needs automatic
  }

  // Calculate confidence
  let confidence = 0.7; // Base confidence
  if (isGoalOriented) confidence += 0.1;
  if (complexityLevel === 'high') confidence += 0.1;
  if (hasKnownExpert) confidence += 0.1;
  confidence = Math.min(confidence, 1.0);

  // Generate reason
  let reason = '';
  if (isAutonomous && isAutomatic) {
    reason = 'Complex multi-domain goal requiring collaborative autonomous execution';
  } else if (isAutonomous && !isAutomatic) {
    reason = 'Goal-oriented task best handled by your selected expert';
  } else if (!isAutonomous && isAutomatic) {
    reason = 'Conversational exploration best handled by AI-selected experts';
  } else {
    reason = 'Direct conversation with your chosen expert';
  }

  return { isAutonomous, isAutomatic, confidence, reason };
}

/**
 * Analyzes query text and returns characteristics
 */
export function analyzeQuery(query: string): QueryCharacteristics {
  const queryLength = query.length;
  const hasMultipleQuestions = (query.match(/\?/g) || []).length > 1;
  const goalKeywords = ['create', 'generate', 'build', 'develop', 'prepare', 'complete'];
  const isGoalOriented = goalKeywords.some(kw => query.toLowerCase().includes(kw));
  const requiresDeepAnalysis = query.length > 300 || query.includes('comprehensive') || query.includes('detailed');

  // Simple complexity estimation
  let complexityLevel: 'low' | 'medium' | 'high' = 'medium';
  if (query.length < 50) complexityLevel = 'low';
  if (query.length > 200 || hasMultipleQuestions) complexityLevel = 'high';

  // Estimate domain count (very simple heuristic)
  const domainKeywords = ['regulatory', 'clinical', 'technical', 'marketing', 'financial', 'legal'];
  const domainCount = domainKeywords.filter(kw => query.toLowerCase().includes(kw)).length;

  return {
    queryLength,
    hasMultipleQuestions,
    requiresDeepAnalysis,
    isGoalOriented,
    hasKnownExpert: false, // Cannot determine from query alone
    complexityLevel,
    domainCount: Math.max(domainCount, 1)
  };
}

/**
 * Smart recommendation that analyzes query and suggests toggles
 */
export function smartRecommend(query: string): {
  isAutonomous: boolean;
  isAutomatic: boolean;
  confidence: number;
  reason: string;
  characteristics: QueryCharacteristics;
} {
  const characteristics = analyzeQuery(query);
  const recommendation = recommendToggles(characteristics);

  return {
    ...recommendation,
    characteristics
  };
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

export function getModeName(isAutonomous: boolean, isAutomatic: boolean): string {
  const mode = getBackendMode(isAutonomous, isAutomatic);
  return MODE_CONFIGS[mode].name;
}

export function getModeDescription(isAutonomous: boolean, isAutomatic: boolean): string {
  const mode = getBackendMode(isAutonomous, isAutomatic);
  return MODE_CONFIGS[mode].description;
}

export function getResponseTime(isAutonomous: boolean, isAutomatic: boolean): string {
  const mode = getBackendMode(isAutonomous, isAutomatic);
  return MODE_CONFIGS[mode].avgResponseTime;
}

export function requiresAgentSelection(isAutonomous: boolean, isAutomatic: boolean): boolean {
  const mode = getBackendMode(isAutonomous, isAutomatic);
  return MODE_CONFIGS[mode].requiresAgentSelection;
}

export function supportsMultiTurn(isAutonomous: boolean, isAutomatic: boolean): boolean {
  const mode = getBackendMode(isAutonomous, isAutomatic);
  return MODE_CONFIGS[mode].supportsMultiTurn;
}

export function supportsCheckpoints(isAutonomous: boolean, isAutomatic: boolean): boolean {
  const mode = getBackendMode(isAutonomous, isAutomatic);
  return MODE_CONFIGS[mode].supportsCheckpoints;
}

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Maps old 5-mode system to new 4-mode toggles
 * For backward compatibility
 */
export function migrateFromLegacyMode(legacyMode: string): {
  isAutonomous: boolean;
  isAutomatic: boolean;
} {
  const migration: Record<string, { isAutonomous: boolean; isAutomatic: boolean }> = {
    // Old 5-mode system
    'query_automatic': { isAutonomous: false, isAutomatic: true },   // → Interactive + Automatic
    'query_manual': { isAutonomous: false, isAutomatic: false },      // → Interactive + Manual
    'chat_automatic': { isAutonomous: false, isAutomatic: true },     // → Interactive + Automatic
    'chat_manual': { isAutonomous: false, isAutomatic: false },       // → Interactive + Manual
    'agent': { isAutonomous: true, isAutomatic: true },               // → Autonomous + Automatic

    // Even older legacy modes
    'single': { isAutonomous: false, isAutomatic: false },
    'multi': { isAutonomous: false, isAutomatic: true },
    'panel': { isAutonomous: false, isAutomatic: true },
    'autonomous': { isAutonomous: true, isAutomatic: true },
    'auto': { isAutonomous: false, isAutomatic: true }
  };

  return migration[legacyMode] || { isAutonomous: false, isAutomatic: false };
}

// ============================================================================
// USAGE EXAMPLES (for documentation)
// ============================================================================

/**
 * Example 1: Basic mode mapping
 *
 * const mode = getBackendMode(false, true);
 * // => 'interactive_automatic'
 *
 * const config = getModeConfig(false, true);
 * // => { name: 'Smart Expert Discussion', ... }
 */

/**
 * Example 2: Validation before submission
 *
 * const validation = validateModeState(false, false, null);
 * if (!validation.valid) {
 *   alert(validation.error);
 *   return;
 * }
 * // Proceed with API call
 */

/**
 * Example 3: Smart recommendation
 *
 * const query = "Create a comprehensive 510(k) submission strategy";
 * const recommendation = smartRecommend(query);
 * // => { isAutonomous: true, isAutomatic: true, confidence: 0.9, ... }
 */

/**
 * Example 4: Display helpers
 *
 * const name = getModeName(true, false);
 * // => 'Expert-Driven Workflow'
 *
 * const needsAgent = requiresAgentSelection(true, false);
 * // => true
 */
