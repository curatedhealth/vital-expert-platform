/**
 * VITAL Protocol - Expert Mode Constants
 * 
 * The four modes of expert interaction, from fast/simple to slow/complex.
 * 
 * @see services/ai-engine/src/modules/expert/modes/
 */

export const EXPERT_MODES = {
  /** Mode 1: Instant - Quick answers, single LLM call, < 5 seconds */
  MODE_1_INSTANT: 'mode_1_instant',
  
  /** Mode 2: Standard - RAG + reasoning, < 30 seconds */
  MODE_2_STANDARD: 'mode_2_standard',
  
  /** Mode 3: Deep Research - Multi-step reasoning, 1-5 minutes (async) */
  MODE_3_DEEP_RESEARCH: 'mode_3_deep_research',
  
  /** Mode 4: Full Autonomous - Complete autonomy, 5+ minutes (async) */
  MODE_4_AUTONOMOUS: 'mode_4_autonomous',
} as const;

export type ExpertMode = typeof EXPERT_MODES[keyof typeof EXPERT_MODES];

export const EXPERT_MODE_VALUES = Object.values(EXPERT_MODES);

/**
 * Mode metadata for UI and backend routing
 */
export const MODE_METADATA: Record<ExpertMode, {
  label: string;
  description: string;
  isAsync: boolean;
  typicalDuration: string;
  tokenBudget: number;
  features: string[];
}> = {
  mode_1_instant: {
    label: 'Instant',
    description: 'Quick answers for simple questions',
    isAsync: false,
    typicalDuration: '< 5 seconds',
    tokenBudget: 4000,
    features: [
      'Single LLM call',
      'No RAG lookup',
      'Basic context',
    ],
  },
  mode_2_standard: {
    label: 'Standard',
    description: 'Standard answers with knowledge base lookup',
    isAsync: false,
    typicalDuration: '< 30 seconds',
    tokenBudget: 16000,
    features: [
      'RAG knowledge lookup',
      'Citation support',
      'Multi-turn context',
    ],
  },
  mode_3_deep_research: {
    label: 'Deep Research',
    description: 'Deep research with multi-step reasoning',
    isAsync: true,
    typicalDuration: '1-5 minutes',
    tokenBudget: 100000,
    features: [
      'Multi-step reasoning',
      'Web search',
      'Document analysis',
      'Structured output',
      'Human-in-the-loop checkpoints',
    ],
  },
  mode_4_autonomous: {
    label: 'Full Autonomous',
    description: 'Complete autonomous agent with full toolset',
    isAsync: true,
    typicalDuration: '5+ minutes',
    tokenBudget: 500000,
    features: [
      'Full tool access',
      'Self-directed research',
      'Artifact generation',
      'Multi-agent coordination',
      'Iterative refinement',
    ],
  },
};

/**
 * Sync modes (handled directly by API)
 */
export const SYNC_MODES: ExpertMode[] = [
  EXPERT_MODES.MODE_1_INSTANT,
  EXPERT_MODES.MODE_2_STANDARD,
];

/**
 * Async modes (handled by workers, return job_id)
 */
export const ASYNC_MODES: ExpertMode[] = [
  EXPERT_MODES.MODE_3_DEEP_RESEARCH,
  EXPERT_MODES.MODE_4_AUTONOMOUS,
];

/**
 * Check if a mode is async
 */
export function isAsyncMode(mode: ExpertMode): boolean {
  return ASYNC_MODES.includes(mode);
}
