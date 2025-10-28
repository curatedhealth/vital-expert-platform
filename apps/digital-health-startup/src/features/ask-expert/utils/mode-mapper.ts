/**
 * Mode ID Mapping Utility
 *
 * Maps frontend mode IDs (from EnhancedModeSelector) to backend OrchestrationMode enums
 * and provides mode configuration for API calls.
 */

import type { OrchestrationMode } from '@/features/chat/services/unified-langgraph-orchestrator';

// ============================================================================
// Frontend to Backend Mode Mapping
// ============================================================================

export const MODE_ID_MAP: Record<string, OrchestrationMode> = {
  // Frontend ID → Backend Enum
  'mode-1-query-automatic': 'query_automatic',
  'mode-2-query-manual': 'query_manual',
  'mode-3-chat-automatic': 'chat_automatic',
  'mode-4-chat-manual': 'chat_manual',
  'mode-5-agent-autonomous': 'agent',
} as const;

// ============================================================================
// Mode Configuration for RAG/Search
// ============================================================================

export interface ModeConfig {
  searchFunction: string;
  params: Record<string, any>;
  requiresAgentSelection?: boolean;
  supportsChatHistory?: boolean;
  supportsCheckpoints?: boolean;
  description: string;
}

export const MODE_CONFIG_MAP: Record<string, ModeConfig> = {
  'mode-1-query-automatic': {
    searchFunction: 'search_knowledge_by_embedding',
    params: { domain_filter: null, max_results: 10 },
    requiresAgentSelection: false,
    supportsChatHistory: false,
    supportsCheckpoints: false,
    description: 'Automatic expert selection with parallel consultation'
  },
  'mode-2-query-manual': {
    searchFunction: 'search_knowledge_for_agent',
    params: { max_results: 15 },
    requiresAgentSelection: true,
    supportsChatHistory: false,
    supportsCheckpoints: false,
    description: 'Single expert consultation with focused response'
  },
  'mode-3-chat-automatic': {
    searchFunction: 'hybrid_search',
    params: { keyword_weight: 0.3, semantic_weight: 0.7 },
    requiresAgentSelection: false,
    supportsChatHistory: true,
    supportsCheckpoints: false,
    description: 'Multi-turn conversation with dynamic expert switching'
  },
  'mode-4-chat-manual': {
    searchFunction: 'search_knowledge_for_agent',
    params: { max_results: 12 },
    requiresAgentSelection: true,
    supportsChatHistory: true,
    supportsCheckpoints: false,
    description: 'Extended conversation with dedicated expert'
  },
  'mode-5-agent-autonomous': {
    searchFunction: 'hybrid_search',
    params: { max_results: 20, include_metadata: true },
    requiresAgentSelection: false,
    supportsChatHistory: true,
    supportsCheckpoints: true,
    description: 'Autonomous agent with multi-step workflow execution'
  }
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Converts frontend mode ID to backend OrchestrationMode enum
 */
export function mapModeIdToEnum(frontendModeId: string): OrchestrationMode {
  const mapped = MODE_ID_MAP[frontendModeId];
  if (!mapped) {
    console.warn(`Unknown mode ID: ${frontendModeId}, defaulting to query_automatic`);
    return 'query_automatic';
  }
  return mapped;
}

/**
 * Gets mode configuration for given frontend mode ID
 */
export function getModeConfig(frontendModeId: string): ModeConfig {
  const config = MODE_CONFIG_MAP[frontendModeId];
  if (!config) {
    console.warn(`No config for mode: ${frontendModeId}, using default`);
    return MODE_CONFIG_MAP['mode-1-query-automatic'];
  }
  return config;
}

/**
 * Checks if mode requires manual agent selection
 */
export function requiresAgentSelection(frontendModeId: string): boolean {
  const config = getModeConfig(frontendModeId);
  return config.requiresAgentSelection || false;
}

/**
 * Checks if mode supports chat history (multi-turn)
 */
export function supportsChatHistory(frontendModeId: string): boolean {
  const config = getModeConfig(frontendModeId);
  return config.supportsChatHistory || false;
}

/**
 * Checks if mode supports human checkpoints (Mode 5 only)
 */
export function supportsCheckpoints(frontendModeId: string): boolean {
  const config = getModeConfig(frontendModeId);
  return config.supportsCheckpoints || false;
}

/**
 * Validates mode compatibility with current state
 */
export function validateModeState(
  frontendModeId: string,
  selectedAgentId: string | null
): { valid: boolean; error?: string } {
  if (requiresAgentSelection(frontendModeId) && !selectedAgentId) {
    return {
      valid: false,
      error: `Mode "${frontendModeId}" requires agent selection. Please select an agent first.`
    };
  }
  return { valid: true };
}

/**
 * Gets all valid modes
 */
export function getAllModes(): string[] {
  return Object.keys(MODE_ID_MAP);
}

/**
 * Gets mode display name
 */
export function getModeDisplayName(frontendModeId: string): string {
  const displayNames: Record<string, string> = {
    'mode-1-query-automatic': 'Quick Expert Consensus',
    'mode-2-query-manual': 'Targeted Expert Query',
    'mode-3-chat-automatic': 'Interactive Expert Discussion',
    'mode-4-chat-manual': 'Dedicated Expert Session',
    'mode-5-agent-autonomous': 'Autonomous Agent Workflow'
  };
  return displayNames[frontendModeId] || frontendModeId;
}

/**
 * Gets recommended mode based on query characteristics
 */
export function recommendMode(options: {
  queryLength?: number;
  requiresMultipleExperts?: boolean;
  isFollowUp?: boolean;
  needsDeepAnalysis?: boolean;
  hasSpecificExpert?: boolean;
}): string {
  const {
    queryLength = 0,
    requiresMultipleExperts = false,
    isFollowUp = false,
    needsDeepAnalysis = false,
    hasSpecificExpert = false
  } = options;

  // Mode 5: Complex multi-step workflows
  if (needsDeepAnalysis && queryLength > 200) {
    return 'mode-5-agent-autonomous';
  }

  // Mode 4: Follow-up with specific expert
  if (isFollowUp && hasSpecificExpert) {
    return 'mode-4-chat-manual';
  }

  // Mode 3: Interactive exploration
  if (isFollowUp && !hasSpecificExpert) {
    return 'mode-3-chat-automatic';
  }

  // Mode 2: Targeted single expert
  if (hasSpecificExpert && !requiresMultipleExperts) {
    return 'mode-2-query-manual';
  }

  // Mode 1: Default - quick consensus
  return 'mode-1-query-automatic';
}
