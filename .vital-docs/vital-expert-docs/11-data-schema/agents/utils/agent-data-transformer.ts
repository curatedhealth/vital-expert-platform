/**
 * =====================================================
 * VITAL Platform - Agent Data Transformer
 * =====================================================
 * Purpose: Transform database rows to application models
 * Created: 2025-11-23
 * Owner: VITAL Data Strategist Agent
 * =====================================================
 */

import type { Json } from '@/types/database.types';
import {
  AgentMetadata,
  parseMetadata,
  getDefaultColorForTier,
  DEFAULT_METADATA,
} from './agent-metadata.schema';

// =====================================================
// DATABASE ROW TYPES (matches actual schema)
// =====================================================

/**
 * Agent Row - Direct mapping to database schema
 * This is what Supabase returns from SELECT *
 */
export interface AgentRow {
  // Core Identity
  id: string;
  tenant_id: string | null;
  name: string;
  slug: string;

  // Display & Description
  tagline: string | null;
  description: string | null;
  title: string | null;

  // Organization Structure
  role_id: string | null;
  function_id: string | null;
  department_id: string | null;
  persona_id: string | null;
  agent_level_id: string | null;

  // Cached org names (for join-free queries)
  function_name: string | null;
  department_name: string | null;
  role_name: string | null;

  // Agent Characteristics
  expertise_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  years_of_experience: number | null;
  communication_style: string | null;

  // Avatar & Branding
  avatar_url: string | null;
  avatar_description: string | null;

  // AI Configuration
  system_prompt: string | null;
  base_model: string;
  temperature: number;
  max_tokens: number;

  // Status & Validation
  status: 'development' | 'testing' | 'active' | 'inactive' | 'deprecated';
  validation_status: 'draft' | 'pending' | 'approved' | 'rejected' | null;

  // Usage Metrics
  usage_count: number;
  average_rating: number | null;
  total_conversations: number;

  // Flexible Metadata (JSONB)
  metadata: Json;

  // Documentation
  documentation_path: string | null;
  documentation_url: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// =====================================================
// APPLICATION TYPES (derived from database)
// =====================================================

/**
 * Agent - Application-level model with computed fields
 * Use this in frontend/business logic
 */
export interface Agent extends Omit<AgentRow, 'metadata'> {
  // Parsed metadata (typed)
  metadata: AgentMetadata;

  // Computed fields (derived from metadata or columns)
  display_name: string;  // metadata.displayName || name
  tier: number;          // metadata.tier || 1
  tags: string[];        // metadata.tags || []
  color: string;         // metadata.color || defaultColor

  // Evidence fields (from metadata)
  model_justification: string | null;  // metadata.modelJustification
  model_citation: string | null;       // metadata.modelCitation

  // AI config (from metadata, fallback to defaults)
  context_window: number;   // metadata.contextWindow || 8000
  cost_per_query: number;   // metadata.costPerQuery || 0

  // Compliance flags (from metadata)
  hipaa_compliant: boolean;           // metadata.hipaaCompliant || false
  rag_enabled: boolean;               // metadata.ragEnabled || false
  data_classification: string | null; // metadata.dataClassification
}

/**
 * Agent with Relations - For detailed views
 */
export interface AgentWithRelations extends Agent {
  categories?: AgentCategory[];
  capabilities?: AgentCapability[];
  performance_metrics?: AgentPerformanceMetrics;
  role?: OrgRole;
  function?: OrgFunction;
  department?: OrgDepartment;
  persona?: Persona;
}

// Placeholder types (define in separate files)
export interface AgentCategory {
  id: string;
  name: string;
  display_name: string;
}

export interface AgentCapability {
  id: string;
  agent_id: string;
  capability_id: string;
  proficiency_level: string;
}

export interface AgentPerformanceMetrics {
  id: string;
  agent_id: string;
  success_rate: number;
  average_response_time: number;
}

export interface OrgRole {
  id: string;
  name: string;
}

export interface OrgFunction {
  id: string;
  name: string;
}

export interface OrgDepartment {
  id: string;
  name: string;
}

export interface Persona {
  id: string;
  name: string;
}

// =====================================================
// TRANSFORMATION FUNCTIONS
// =====================================================

/**
 * Transform database row to application model
 * This is where we extract metadata fields
 *
 * @param row - Raw database row from Supabase
 * @returns Transformed agent with computed fields
 */
export function transformAgentRow(row: AgentRow): Agent {
  // Parse and validate metadata
  const metadata = parseMetadata(row.metadata);

  // Compute derived fields
  const display_name = metadata.displayName || row.name;
  const tier = metadata.tier || 1;
  const tags = metadata.tags || [];
  const color = metadata.color || getDefaultColorForTier(tier);

  return {
    ...row,
    metadata,

    // Computed fields
    display_name,
    tier,
    tags,
    color,

    // Evidence fields
    model_justification: metadata.modelJustification || null,
    model_citation: metadata.modelCitation || null,

    // AI config (with fallbacks)
    context_window: metadata.contextWindow || 8000,
    cost_per_query: metadata.costPerQuery || getCostPerQuery(row.base_model),

    // Compliance flags
    hipaa_compliant: metadata.hipaaCompliant || false,
    rag_enabled: metadata.ragEnabled || false,
    data_classification: metadata.dataClassification || null,
  };
}

/**
 * Transform multiple rows
 */
export function transformAgentRows(rows: AgentRow[]): Agent[] {
  return rows.map(transformAgentRow);
}

/**
 * Transform agent back to database row format (for updates)
 *
 * @param agent - Application agent model
 * @returns Database row format
 */
export function transformAgentToRow(agent: Agent): Partial<AgentRow> {
  const {
    // Exclude computed fields (not in DB)
    display_name,
    tier,
    tags,
    color,
    model_justification,
    model_citation,
    context_window,
    cost_per_query,
    hipaa_compliant,
    rag_enabled,
    data_classification,
    ...dbFields
  } = agent;

  // Include metadata as-is (already properly typed)
  return {
    ...dbFields,
    metadata: agent.metadata as Json,
  };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get estimated cost per query based on model
 */
function getCostPerQuery(baseModel: string): number {
  const costs: Record<string, number> = {
    'gpt-4': 0.35,
    'gpt-4-turbo': 0.10,
    'gpt-3.5-turbo': 0.015,
    'claude-3-opus': 0.40,
    'claude-3-sonnet': 0.15,
    'claude-3-haiku': 0.05,
    'microsoft/biogpt': 0.08,
    'CuratedHealth/meditron70b-qlora-1gpu': 0.10,
    'CuratedHealth/Qwen3-8B-SFT-20250917123923': 0.06,
    'CuratedHealth/base_7b': 0.02,
  };

  return costs[baseModel] || 0.10; // Default fallback
}

/**
 * Get default color based on tier or expertise level
 */
export function getAgentColor(
  tier: number | null,
  expertiseLevel: string | null
): string {
  if (tier) {
    return getDefaultColorForTier(tier);
  }

  // Fallback to expertise level
  switch (expertiseLevel) {
    case 'expert':
      return '#EF4444'; // Red
    case 'advanced':
      return '#8B5CF6'; // Purple
    case 'intermediate':
    case 'beginner':
    default:
      return '#3B82F6'; // Blue
  }
}

/**
 * Create minimal agent object (for forms/creation)
 */
export function createMinimalAgent(
  name: string,
  overrides: Partial<AgentRow> = {}
): AgentRow {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    tenant_id: null,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    tagline: null,
    description: null,
    title: null,
    role_id: null,
    function_id: null,
    department_id: null,
    persona_id: null,
    agent_level_id: null,
    function_name: null,
    department_name: null,
    role_name: null,
    expertise_level: 'intermediate',
    years_of_experience: null,
    communication_style: null,
    avatar_url: null,
    avatar_description: null,
    system_prompt: null,
    base_model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 4000,
    status: 'development',
    validation_status: 'draft',
    usage_count: 0,
    average_rating: null,
    total_conversations: 0,
    metadata: DEFAULT_METADATA as Json,
    documentation_path: null,
    documentation_url: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    ...overrides,
  };
}

// =====================================================
// FILTERING UTILITIES
// =====================================================

/**
 * Filter agents by tier
 */
export function filterByTier(agents: Agent[], tier: number): Agent[] {
  return agents.filter((agent) => agent.tier === tier);
}

/**
 * Filter agents by tags
 */
export function filterByTags(agents: Agent[], tags: string[]): Agent[] {
  return agents.filter((agent) =>
    tags.some((tag) => agent.tags.includes(tag))
  );
}

/**
 * Filter HIPAA-compliant agents
 */
export function filterHipaaCompliant(agents: Agent[]): Agent[] {
  return agents.filter((agent) => agent.hipaa_compliant);
}

/**
 * Filter by status
 */
export function filterByStatus(
  agents: Agent[],
  status: AgentRow['status']
): Agent[] {
  return agents.filter((agent) => agent.status === status);
}

/**
 * Search agents by display name
 */
export function searchByDisplayName(
  agents: Agent[],
  query: string
): Agent[] {
  const lowerQuery = query.toLowerCase();
  return agents.filter((agent) =>
    agent.display_name.toLowerCase().includes(lowerQuery)
  );
}

// =====================================================
// SORTING UTILITIES
// =====================================================

/**
 * Sort agents by tier (descending)
 */
export function sortByTier(agents: Agent[]): Agent[] {
  return [...agents].sort((a, b) => b.tier - a.tier);
}

/**
 * Sort agents by display name (ascending)
 */
export function sortByDisplayName(agents: Agent[]): Agent[] {
  return [...agents].sort((a, b) =>
    a.display_name.localeCompare(b.display_name)
  );
}

/**
 * Sort agents by usage (descending)
 */
export function sortByUsage(agents: Agent[]): Agent[] {
  return [...agents].sort((a, b) => b.usage_count - a.usage_count);
}

/**
 * Sort agents by rating (descending)
 */
export function sortByRating(agents: Agent[]): Agent[] {
  return [...agents].sort((a, b) => {
    const ratingA = a.average_rating || 0;
    const ratingB = b.average_rating || 0;
    return ratingB - ratingA;
  });
}

// =====================================================
// GROUPING UTILITIES
// =====================================================

/**
 * Group agents by tier
 */
export function groupByTier(agents: Agent[]): Record<number, Agent[]> {
  return agents.reduce((acc, agent) => {
    const tier = agent.tier;
    if (!acc[tier]) {
      acc[tier] = [];
    }
    acc[tier].push(agent);
    return acc;
  }, {} as Record<number, Agent[]>);
}

/**
 * Group agents by function
 */
export function groupByFunction(agents: Agent[]): Record<string, Agent[]> {
  return agents.reduce((acc, agent) => {
    const funcName = agent.function_name || 'Unknown';
    if (!acc[funcName]) {
      acc[funcName] = [];
    }
    acc[funcName].push(agent);
    return acc;
  }, {} as Record<string, Agent[]>);
}

// =====================================================
// VALIDATION UTILITIES
// =====================================================

/**
 * Check if agent has required evidence
 */
export function hasRequiredEvidence(agent: Agent): boolean {
  if (agent.tier < 2) {
    return true; // Evidence not required for Tier 1
  }

  return !!(
    agent.model_justification &&
    agent.model_citation &&
    agent.model_justification.length >= 50
  );
}

/**
 * Check if agent is production-ready
 */
export function isProductionReady(agent: Agent): boolean {
  return (
    agent.status === 'active' &&
    agent.validation_status === 'approved' &&
    !!agent.system_prompt &&
    hasRequiredEvidence(agent)
  );
}

// =====================================================
// EXPORT SUMMARY
// =====================================================

export const AgentTransformers = {
  transformAgentRow,
  transformAgentRows,
  transformAgentToRow,
  createMinimalAgent,
};

export const AgentFilters = {
  filterByTier,
  filterByTags,
  filterHipaaCompliant,
  filterByStatus,
  searchByDisplayName,
};

export const AgentSorters = {
  sortByTier,
  sortByDisplayName,
  sortByUsage,
  sortByRating,
};

export const AgentGroupers = {
  groupByTier,
  groupByFunction,
};

export const AgentValidators = {
  hasRequiredEvidence,
  isProductionReady,
};
