/**
 * =====================================================
 * VITAL Platform - Agent Metadata Schema & Validation
 * =====================================================
 * Purpose: TypeScript types, Zod schemas, and validators for agent metadata
 * Created: 2025-11-23
 * Owner: VITAL Data Strategist Agent
 * =====================================================
 */

import { z } from 'zod';

// =====================================================
// METADATA TYPES
// =====================================================

/**
 * Agent Metadata Schema
 * Stored in agents.metadata JSONB column
 *
 * RULES:
 * - All fields are OPTIONAL (graceful degradation)
 * - Use camelCase for JSON (snake_case for DB columns)
 * - Validate at application layer, not DB constraints
 * - Version metadata for backward compatibility
 */
export interface AgentMetadata {
  // Version tracking
  schemaVersion?: string;  // e.g., "1.0"

  // Display & Branding (UI-only)
  displayName?: string;     // Human-readable name (fallback: name)
  tier?: number;            // 1=Foundational, 2=Specialist, 3=Ultra-specialist
  color?: string;           // Hex color for UI (#3B82F6)
  icon?: string;            // Icon identifier

  // Categorization & Discovery
  tags?: string[];          // ["clinical", "regulatory", "safety-critical"]
  specializations?: string[]; // Sub-domain expertise
  keywords?: string[];      // Search keywords

  // Model Evidence (REQUIRED for quality agents)
  modelJustification?: string;  // Why this model was chosen
  modelCitation?: string;       // Academic citation
  benchmarkScores?: {
    [benchmark: string]: number;  // e.g., { "MedQA": 86.7, "MMLU": 86.4 }
  };

  // AI Configuration Extensions
  contextWindow?: number;   // Context window size
  costPerQuery?: number;    // Estimated cost per query
  responseFormat?: string;  // Expected response format

  // Safety & Compliance
  evidenceRequired?: boolean;     // Must cite sources
  hallucinationRate?: number;     // Measured hallucination rate
  accuracyScore?: number;         // Overall accuracy (0-100)
  clinicalValidationStatus?: string; // "validated" | "pending" | "not_required"

  // Performance Metrics
  averageLatencyMs?: number;
  averageResponseTime?: number;
  successRate?: number;
  errorRate?: number;

  // Feature Flags
  ragEnabled?: boolean;
  verifyEnabled?: boolean;
  pharmaEnabled?: boolean;

  // Compliance Flags
  hipaaCompliant?: boolean;
  gdprCompliant?: boolean;
  dataClassification?: "public" | "internal" | "confidential" | "restricted";

  // Escalation & Routing
  escalationRules?: {
    confidenceThreshold?: number;
    escalateTo?: string[];  // Agent IDs
    fallbackAgent?: string;
  };

  // Custom Extensions (agent-specific)
  custom?: {
    [key: string]: any;  // Extensibility for agent-specific needs
  };
}

// =====================================================
// ZOD VALIDATION SCHEMAS
// =====================================================

/**
 * Hex color validator
 */
const HexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
  message: "Color must be a valid hex color (e.g., #3B82F6)",
});

/**
 * Tier validator (1, 2, or 3)
 */
const TierSchema = z.number().int().min(1).max(3);

/**
 * Data classification enum
 */
const DataClassificationSchema = z.enum([
  "public",
  "internal",
  "confidential",
  "restricted",
]);

/**
 * Benchmark scores validator
 */
const BenchmarkScoresSchema = z.record(
  z.string(),
  z.number().min(0).max(100)
);

/**
 * Escalation rules validator
 */
const EscalationRulesSchema = z.object({
  confidenceThreshold: z.number().min(0).max(1).optional(),
  escalateTo: z.array(z.string().uuid()).optional(),
  fallbackAgent: z.string().uuid().optional(),
});

/**
 * Full Agent Metadata Schema (Zod)
 */
export const AgentMetadataSchema = z.object({
  schemaVersion: z.string().regex(/^\d+\.\d+$/).optional(),
  displayName: z.string().min(1).max(100).optional(),
  tier: TierSchema.optional(),
  color: HexColorSchema.optional(),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  modelJustification: z.string().min(50).optional(),
  modelCitation: z.string().min(10).optional(),
  benchmarkScores: BenchmarkScoresSchema.optional(),
  contextWindow: z.number().int().positive().optional(),
  costPerQuery: z.number().nonnegative().optional(),
  responseFormat: z.string().optional(),
  evidenceRequired: z.boolean().optional(),
  hallucinationRate: z.number().min(0).max(1).optional(),
  accuracyScore: z.number().min(0).max(100).optional(),
  clinicalValidationStatus: z.enum(["validated", "pending", "not_required"]).optional(),
  averageLatencyMs: z.number().nonnegative().optional(),
  averageResponseTime: z.number().nonnegative().optional(),
  successRate: z.number().min(0).max(1).optional(),
  errorRate: z.number().min(0).max(1).optional(),
  ragEnabled: z.boolean().optional(),
  verifyEnabled: z.boolean().optional(),
  pharmaEnabled: z.boolean().optional(),
  hipaaCompliant: z.boolean().optional(),
  gdprCompliant: z.boolean().optional(),
  dataClassification: DataClassificationSchema.optional(),
  escalationRules: EscalationRulesSchema.optional(),
  custom: z.record(z.any()).optional(),
}).strict();

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

/**
 * Validate agent metadata
 * Returns { valid: boolean, errors: string[] }
 */
export function validateAgentMetadata(
  metadata: unknown
): { valid: boolean; errors: string[]; data?: AgentMetadata } {
  try {
    const validated = AgentMetadataSchema.parse(metadata);
    return { valid: true, errors: [], data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      return { valid: false, errors };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}

/**
 * Safe metadata parser with validation
 * Returns validated metadata or empty object on error
 */
export function parseMetadata(json: unknown): AgentMetadata {
  if (!json || typeof json !== 'object') {
    console.warn('[parseMetadata] Invalid metadata JSON, returning empty object');
    return {};
  }

  const validation = validateAgentMetadata(json);
  if (!validation.valid) {
    console.warn('[parseMetadata] Metadata validation failed:', validation.errors);
    // Return raw data (best effort) but log warnings
    return json as AgentMetadata;
  }

  return validation.data!;
}

/**
 * Merge metadata (safe deep merge)
 * Preserves existing fields, adds/updates new ones
 */
export function mergeMetadata(
  existing: AgentMetadata,
  updates: Partial<AgentMetadata>
): AgentMetadata {
  return {
    ...existing,
    ...updates,
    // Deep merge for nested objects
    benchmarkScores: {
      ...existing.benchmarkScores,
      ...updates.benchmarkScores,
    },
    escalationRules: {
      ...existing.escalationRules,
      ...updates.escalationRules,
    },
    custom: {
      ...existing.custom,
      ...updates.custom,
    },
  };
}

// =====================================================
// METADATA HELPERS
// =====================================================

/**
 * Get default color for tier
 */
export function getDefaultColorForTier(tier: number): string {
  switch (tier) {
    case 3:
      return '#EF4444'; // Red - Ultra-specialist
    case 2:
      return '#8B5CF6'; // Purple - Specialist
    case 1:
    default:
      return '#3B82F6'; // Blue - Foundational
  }
}

/**
 * Get tier from expertise level (backward compatibility)
 */
export function getTierFromExpertiseLevel(
  expertiseLevel: string | null
): number {
  switch (expertiseLevel) {
    case 'expert':
      return 3;
    case 'advanced':
      return 2;
    case 'intermediate':
    case 'beginner':
    default:
      return 1;
  }
}

/**
 * Initialize metadata with defaults
 */
export function initializeMetadata(
  name: string,
  expertiseLevel: string | null = null
): AgentMetadata {
  const tier = getTierFromExpertiseLevel(expertiseLevel);

  return {
    schemaVersion: '1.0',
    displayName: name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    tier,
    color: getDefaultColorForTier(tier),
    tags: [],
    ragEnabled: tier >= 2,
    verifyEnabled: false,
    pharmaEnabled: false,
    hipaaCompliant: false,
    dataClassification: 'internal',
  };
}

/**
 * Check if metadata has required evidence (for quality agents)
 */
export function hasRequiredEvidence(metadata: AgentMetadata): boolean {
  if (!metadata.tier || metadata.tier < 2) {
    return true; // Evidence not required for Tier 1
  }

  return !!(
    metadata.modelJustification &&
    metadata.modelCitation &&
    metadata.modelJustification.length >= 50
  );
}

/**
 * Get missing evidence fields
 */
export function getMissingEvidenceFields(metadata: AgentMetadata): string[] {
  const missing: string[] = [];

  if (!metadata.tier || metadata.tier < 2) {
    return []; // Evidence not required for Tier 1
  }

  if (!metadata.modelJustification) {
    missing.push('modelJustification');
  } else if (metadata.modelJustification.length < 50) {
    missing.push('modelJustification (too short, min 50 chars)');
  }

  if (!metadata.modelCitation) {
    missing.push('modelCitation');
  }

  return missing;
}

// =====================================================
// TYPE GUARDS
// =====================================================

/**
 * Check if object is valid AgentMetadata
 */
export function isAgentMetadata(obj: unknown): obj is AgentMetadata {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const validation = validateAgentMetadata(obj);
  return validation.valid;
}

/**
 * Check if agent is HIPAA-compliant
 */
export function isHipaaCompliant(metadata: AgentMetadata): boolean {
  return metadata.hipaaCompliant === true;
}

/**
 * Check if agent is safety-critical
 */
export function isSafetyCritical(metadata: AgentMetadata): boolean {
  return (
    metadata.tier === 3 ||
    metadata.tags?.includes('safety-critical') ||
    metadata.evidenceRequired === true ||
    metadata.hipaaCompliant === true
  );
}

// =====================================================
// EXPORT DEFAULTS
// =====================================================

export const DEFAULT_METADATA: AgentMetadata = {
  schemaVersion: '1.0',
  tier: 1,
  color: '#3B82F6',
  tags: [],
  ragEnabled: false,
  verifyEnabled: false,
  pharmaEnabled: false,
  hipaaCompliant: false,
  dataClassification: 'internal',
};

export const TIER_COLORS = {
  1: '#3B82F6', // Blue - Foundational
  2: '#8B5CF6', // Purple - Specialist
  3: '#EF4444', // Red - Ultra-specialist
} as const;

export const DATA_CLASSIFICATIONS = [
  'public',
  'internal',
  'confidential',
  'restricted',
] as const;
