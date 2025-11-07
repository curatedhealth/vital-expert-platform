/**
 * Mode ID Mapping Utility
 *
 * Maps frontend mode IDs (from EnhancedModeSelector) to backend OrchestrationMode enums
 * and provides mode configuration for API calls.
 *
 * ============================================================================
 * THE 4 ASK EXPERT MODES - COMPREHENSIVE EXPLANATION
 * ============================================================================
 *
 * Mode 1: Manual Expert Selection (QUERY_MANUAL)
 * ----------------------------------------------------------------------------
 * - User manually selects a specific expert/agent
 * - One-shot query (no multi-turn conversation)
 * - Agent-specific knowledge search (uses agent's assigned domains)
 * - Best for: Specific questions requiring known expert expertise
 * - Example: "What are FDA 510(k) requirements?" → User selects "Regulatory Expert"
 * - Frontend ID: 'mode-1-query-automatic' (legacy naming - "automatic" refers to query processing)
 * - Backend Enum: OrchestrationMode.QUERY_MANUAL
 * - Requires agent selection: YES
 * - Supports chat history: NO
 * - Supports checkpoints: NO
 *
 * Mode 2: Automatic Expert Selection (QUERY_AUTOMATIC)
 * ----------------------------------------------------------------------------
 * - System automatically selects the best expert based on query analysis
 * - One-shot query (no multi-turn conversation)
 * - Universal knowledge search (searches all domains)
 * - Best for: Quick questions where you don't know which expert to ask
 * - Example: "What are best practices for clinical trials?" → System selects "Clinical Trial Expert"
 * - Frontend ID: 'mode-2-query-manual' (legacy naming - "manual" refers to manual query input)
 * - Backend Enum: OrchestrationMode.QUERY_AUTOMATIC
 * - Requires agent selection: NO (system selects)
 * - Supports chat history: NO
 * - Supports checkpoints: NO
 *
 * Mode 3: Manual Autonomous (CHAT_MANUAL) - SWAPPED
 * ----------------------------------------------------------------------------
 * - Multi-turn conversation with user-selected expert + autonomous reasoning
 * - User manually selects expert at start, same expert throughout
 * - Agent-specific knowledge search (uses selected agent's domains)
 * - Goal-oriented execution with planning and multi-step workflow support
 * - Human-in-the-loop checkpoints for approval (when needed for complex tasks)
 * - Autonomous reasoning with tool integration for comprehensive research
 * - Best for: Deep dives with a specific expert, maintaining consistent voice,
 *   complex multi-step workflows, document generation, research synthesis, and approval workflows
 * - Example: "Research and draft a regulatory submission plan" → User selects "Regulatory Expert",
 *   system plans, researches, drafts, and can request approval at checkpoints
 * - Example: "Walk me through FDA submission process" → User selects "Regulatory Expert" and 
 *   continues conversation with autonomous reasoning
 * - Frontend ID: 'mode-3-chat-automatic' (legacy naming - "automatic" refers to query processing)
 * - Backend Enum: OrchestrationMode.CHAT_MANUAL
 * - Requires agent selection: YES (user selects at start)
 * - Supports chat history: YES (multi-turn conversation with same expert)
 * - Supports checkpoints: YES (human-in-the-loop for complex multi-step tasks)
 * - Supports multi-step workflows: YES (autonomous planning and execution)
 * - Supports tool chaining: YES (intelligent tool selection and multi-step research)
 *
 * Mode 4: Automatic Autonomous (CHAT_AUTOMATIC) - SWAPPED
 * ----------------------------------------------------------------------------
 * - Multi-turn conversation with automatic expert selection + autonomous reasoning
 * - System automatically selects/switch experts between turns based on context
 * - Hybrid search (keyword + semantic) across all domains with comprehensive metadata
 * - Goal-oriented execution with planning and multi-step workflow support
 * - Human-in-the-loop checkpoints for approval (when needed for complex tasks)
 * - Autonomous reasoning with tool integration for comprehensive research
 * - Best for: Complex questions requiring multiple perspectives, iterative refinement,
 *   multi-step workflows, document generation, research synthesis, and approval workflows
 * - Example: "Research and draft a regulatory submission plan" → System plans, researches 
 *   with multiple experts, drafts, and can request approval at checkpoints
 * - Example: "Help me design a regulatory strategy" → System may switch between Regulatory, 
 *   Clinical, and Market Access experts dynamically
 * - Frontend ID: 'mode-4-chat-manual' (legacy naming - "manual" refers to manual query input)
 * - Backend Enum: OrchestrationMode.CHAT_AUTOMATIC
 * - Requires agent selection: NO (system selects/switches dynamically)
 * - Supports chat history: YES (multi-turn conversation with context accumulation)
 * - Supports checkpoints: YES (human-in-the-loop for complex multi-step tasks)
 * - Supports multi-step workflows: YES (autonomous planning and execution)
 * - Supports tool chaining: YES (intelligent tool selection and multi-step research)
 *
 * ============================================================================
 * KEY DIFFERENCES SUMMARY
 * ============================================================================
 *
 * Mode 1 vs Mode 2:
 * - Mode 1: User selects expert (manual selection)
 * - Mode 2: System selects expert (automatic selection)
 * - Both: One-shot queries (no multi-turn)
 *
 * Mode 3 vs Mode 4:
 * - Mode 3: User selects expert + autonomous reasoning + checkpoints + multi-step workflows
 * - Mode 4: System selects/switches experts + autonomous reasoning + checkpoints + multi-step workflows
 * - Both: Multi-turn conversations (chat history enabled) + autonomous capabilities
 *
 * Mode Selection Guide:
 * - Quick question + Know which expert → Mode 1
 * - Quick question + Don't know which expert → Mode 2
 * - Complex question + Know which expert + Need autonomous + Checkpoints → Mode 3 (Manual Autonomous)
 * - Complex question + Don't know which expert + Need autonomous + Checkpoints → Mode 4 (Automatic Autonomous)
 */

import { OrchestrationMode } from '@/features/chat/services/unified-langgraph-orchestrator';

// ============================================================================
// Frontend to Backend Mode Mapping
// ============================================================================

export const MODE_ID_MAP: Record<string, OrchestrationMode> = {
  // Frontend ID → Backend Enum
  'mode-1-query-automatic': OrchestrationMode.QUERY_MANUAL, // ⚠️ Mode 1 = Manual (user selects agent)
  'mode-2-query-manual': OrchestrationMode.QUERY_AUTOMATIC, // ⚠️ Mode 2 = Automatic (system picks best expert)
  'mode-3-chat-automatic': OrchestrationMode.CHAT_MANUAL, // ⚠️ SWAPPED: Mode 3 = Manual Autonomous (user selects + autonomous)
  'mode-4-chat-manual': OrchestrationMode.CHAT_AUTOMATIC, // ⚠️ SWAPPED: Mode 4 = Automatic Autonomous (system selects + autonomous)
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

/**
 * Mode Configuration Map
 * 
 * Defines search strategies, capabilities, and behavior for each mode.
 * Each mode has specific characteristics:
 * - searchFunction: RAG search method used
 * - params: Search parameters (max_results, domain_filter, etc.)
 * - requiresAgentSelection: Whether user must select agent
 * - supportsChatHistory: Whether multi-turn conversation is supported
 * - supportsCheckpoints: Whether human-in-the-loop checkpoints are supported
 */
export const MODE_CONFIG_MAP: Record<string, ModeConfig> = {
  /**
   * Mode 1: Manual Expert Selection
   * - Agent-specific knowledge search (searches only selected agent's domains)
   * - User must select agent before querying
   * - One-shot query (no conversation history)
   * - Best for: Specific questions requiring known expert expertise
   */
  'mode-1-query-automatic': {
    searchFunction: 'search_knowledge_for_agent', // Agent-specific search
    params: { max_results: 15 }, // Agent-specific search uses agent's assigned domains
    requiresAgentSelection: true, // ⚠️ Mode 1 = Manual (user selects agent)
    supportsChatHistory: false, // One-shot query (no multi-turn)
    supportsCheckpoints: false, // No checkpoints needed for simple queries
    description: 'Manual expert selection - user chooses specific expert for consultation'
  },
  
  /**
   * Mode 2: Automatic Expert Selection
   * - Universal knowledge search (searches all domains)
   * - System automatically selects best expert
   * - One-shot query (no conversation history)
   * - Best for: Quick questions where you don't know which expert to ask
   */
  'mode-2-query-manual': {
    searchFunction: 'search_knowledge_by_embedding', // Universal semantic search
    params: { domain_filter: null, max_results: 10 }, // null = search all domains (Digital Health + Regulatory Affairs)
    requiresAgentSelection: false, // ⚠️ Mode 2 = Automatic (system picks best expert)
    supportsChatHistory: false, // One-shot query (no multi-turn)
    supportsCheckpoints: false, // No checkpoints needed for simple queries
    description: 'Automatic expert selection - system picks best expert based on query'
  },
  
  /**
   * Mode 3: Manual Autonomous (SWAPPED - was Mode 4)
   * - Agent-specific knowledge search (uses selected agent's domains)
   * - User selects expert at start, same expert throughout conversation
   * - Multi-turn conversation with consistent expert voice
   * - Goal-oriented execution with planning and multi-step workflow support
   * - Human-in-the-loop checkpoints for approval (when needed for complex tasks)
   * - Autonomous reasoning with tool integration for comprehensive research
   * - Best for: Deep dives with a specific expert, maintaining consistent voice,
   *   complex multi-step workflows, document generation, research synthesis, and approval workflows
   */
  'mode-3-chat-automatic': {
    searchFunction: 'search_knowledge_for_agent', // Agent-specific search
    params: { max_results: 20, include_metadata: true }, // Enhanced with metadata for complex tasks
    requiresAgentSelection: true, // ⚠️ SWAPPED: Mode 3 = Manual (user selects expert)
    supportsChatHistory: true, // Multi-turn conversation enabled
    supportsCheckpoints: true, // ✅ Human-in-the-loop checkpoints enabled (autonomous)
    description: 'Multi-turn conversation with user-selected expert, autonomous reasoning, checkpoints, and multi-step workflows'
  },
  
  /**
   * Mode 4: Automatic Autonomous (SWAPPED - was Mode 3)
   * - Hybrid search (keyword + semantic) across all domains with comprehensive metadata
   * - System can switch experts dynamically between turns based on context
   * - Multi-turn conversation with context accumulation
   * - Goal-oriented execution with planning and multi-step workflow support
   * - Human-in-the-loop checkpoints for approval (when needed for complex tasks)
   * - Autonomous reasoning with tool integration for comprehensive research
   * - Best for: Complex questions requiring multiple perspectives, iterative refinement,
   *   multi-step workflows, document generation, research synthesis, and approval workflows
   */
  'mode-4-chat-manual': {
    searchFunction: 'hybrid_search', // Keyword + semantic hybrid search with metadata
    params: { domain_filter: null, keyword_weight: 0.3, semantic_weight: 0.7, max_results: 20, include_metadata: true }, // Enhanced with metadata for complex tasks
    requiresAgentSelection: false, // ⚠️ SWAPPED: Mode 4 = Automatic (system selects/switches experts dynamically)
    supportsChatHistory: true, // Multi-turn conversation enabled
    supportsCheckpoints: true, // ✅ Human-in-the-loop checkpoints enabled (autonomous)
    description: 'Multi-turn conversation with automatic expert selection, autonomous reasoning, checkpoints, and multi-step workflows'
  },
  
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
    console.warn(`Unknown mode ID: ${frontendModeId}, defaulting to QUERY_AUTOMATIC`);
    return OrchestrationMode.QUERY_AUTOMATIC;
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
 * Checks if mode supports human checkpoints (Mode 3 enhanced)
 * 
 * Mode 3 now supports checkpoints for complex multi-step workflows,
 * merging the autonomous agent capabilities from the removed Mode 5.
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
 * Gets mode display name for UI
 * 
 * Returns user-friendly names for each mode:
 * - Mode 1: Manual Expert Selection (user picks expert)
 * - Mode 2: Automatic Expert Selection (system picks expert)
 * - Mode 3: Manual Autonomous (user picks expert + autonomous reasoning)
 * - Mode 4: Automatic Autonomous (system picks expert + autonomous reasoning)
 */
export function getModeDisplayName(frontendModeId: string): string {
  const displayNames: Record<string, string> = {
    'mode-1-query-automatic': 'Manual Expert Selection', // ⚠️ Mode 1 = Manual (user selects agent)
    'mode-2-query-manual': 'Automatic Expert Selection', // ⚠️ Mode 2 = Automatic (system picks best expert)
    'mode-3-chat-automatic': 'Manual Autonomous', // ⚠️ SWAPPED: Mode 3 = Manual Autonomous (user selects + autonomous)
    'mode-4-chat-manual': 'Automatic Autonomous', // ⚠️ SWAPPED: Mode 4 = Automatic Autonomous (system selects + autonomous)
  };
  return displayNames[frontendModeId] || frontendModeId;
}

/**
 * Gets recommended mode based on query characteristics
 * 
 * Intelligent mode recommendation logic:
 * - Mode 3: Complex multi-step workflows + checkpoints + user knows expert (needsDeepAnalysis + hasSpecificExpert)
 * - Mode 4: Complex multi-step workflows + checkpoints + user doesn't know expert (needsDeepAnalysis + !hasSpecificExpert)
 * - Mode 1: Manual - user selects specific expert (hasSpecificExpert + not multi-expert)
 * - Mode 2: Automatic - system selects best expert (default fallback)
 * 
 * Note: Both Mode 3 and Mode 4 now include all Mode 5 capabilities (checkpoints, multi-step workflows, autonomous reasoning)
 * 
 * @param options Query characteristics
 * @returns Recommended mode ID
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

  // Mode 3: Complex multi-step workflows with checkpoints + user knows expert (Manual Autonomous)
  // Best for: Research tasks, document generation, multi-step analysis with specific expert
  // ✅ Mode 3 = Manual Autonomous (user selects + autonomous)
  if (needsDeepAnalysis && queryLength > 200 && hasSpecificExpert) {
    return 'mode-3-chat-automatic';
  }

  // Mode 4: Complex multi-step workflows with checkpoints + user doesn't know expert (Automatic Autonomous)
  // Best for: Research tasks, document generation, multi-step analysis without specific expert
  // ✅ Mode 4 = Automatic Autonomous (system selects + autonomous)
  if (needsDeepAnalysis && queryLength > 200 && !hasSpecificExpert) {
    return 'mode-4-chat-manual';
  }

  // Mode 3: Follow-up with specific expert (Manual Autonomous)
  // Best for: Continuing conversation with same expert from previous session + autonomous
  if (isFollowUp && hasSpecificExpert) {
    return 'mode-3-chat-automatic';
  }

  // Mode 4: Follow-up without specific expert (Automatic Autonomous)
  // Best for: Complex questions needing multiple perspectives or iterative refinement + autonomous
  if (isFollowUp && !hasSpecificExpert) {
    return 'mode-4-chat-manual';
  }

  // Mode 1: Manual - user selects specific expert (one-shot query)
  // Best for: Quick specific questions where you know which expert to ask
  if (hasSpecificExpert && !requiresMultipleExperts) {
    return 'mode-1-query-automatic'; // ⚠️ Mode 1 = Manual (user selects agent)
  }

  // Mode 2: Automatic - system selects best expert (one-shot query)
  // Best for: Quick questions where you don't know which expert to ask (default)
  return 'mode-2-query-manual'; // ⚠️ Mode 2 = Automatic (system picks best expert)
}
