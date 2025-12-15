/**
 * Type Adapters for Agent Types
 * 
 * Converts between different Agent type representations
 * Used during migration from legacy types to unified types
 */

import type { Agent } from '../agent.types';
import type {
  Agent as SharedAgent,
  AgentSearchResult as SharedAgentSearchResult,
  UserAgent as SharedUserAgent,
} from '@/lib/shared/types/agent.types';
import type { Agent as EnhancedAgent } from '@/types/enhanced-agent-types';
import type { UnifiedAgentSearchResult } from './index';

/**
 * Convert shared/types Agent to canonical Agent
 */
export function sharedAgentToAgent(agent: SharedAgent): Agent {
  return {
    id: agent.id || '',
    name: agent.name,
    display_name: agent.display_name,
    description: agent.description,
    system_prompt: agent.system_prompt,
    model: agent.model,
    temperature: agent.temperature ?? 0.7,
    max_tokens: agent.max_tokens ?? 2000,
    avatar: agent.avatar || '🤖',
    color: agent.color || '#3B82F6',
    capabilities: agent.capabilities || [],
    rag_enabled: agent.rag_enabled ?? true, // RAG enabled by default for all agents
    knowledge_domains: agent.knowledge_domains,
    user_id: agent.created_by,
    is_custom: agent.is_custom,
    status: agent.status?.toString() as Agent['status'] || 'active',
    tier: typeof agent.tier === 'number' ? agent.tier : 1,
    priority: agent.priority ?? 1,
    implementation_phase: typeof agent.implementation_phase === 'number' ? agent.implementation_phase : 1,
    business_function: agent.business_function || null,
    department: agent.role || null,
    role: agent.role || null,
    organizational_role: agent.role || null,
    domain_expertise: agent.domain_expertise?.toString(),
    medical_specialty: agent.medical_specialty,
    clinical_validation_status: agent.validation_status?.toString() as Agent['clinical_validation_status'],
    hipaa_compliant: agent.hipaa_compliant,
    pharma_enabled: agent.pharma_enabled,
    verify_enabled: agent.verify_enabled,
    cost_per_query: agent.cost_per_query,
    average_latency_ms: agent.average_response_time,
    created_at: typeof agent.created_at === 'string' ? agent.created_at : agent.created_at?.toISOString(),
    updated_at: typeof agent.updated_at === 'string' ? agent.updated_at : agent.updated_at?.toISOString(),
  };
}

/**
 * Convert canonical Agent to shared/types Agent
 */
export function agentToSharedAgent(agent: Agent): Partial<SharedAgent> {
  return {
    id: agent.id,
    name: agent.name,
    display_name: agent.display_name,
    description: agent.description,
    system_prompt: agent.system_prompt,
    model: agent.model,
    temperature: agent.temperature,
    max_tokens: agent.max_tokens,
    avatar: agent.avatar,
    color: agent.color,
    capabilities: agent.capabilities,
    rag_enabled: agent.rag_enabled,
    knowledge_domains: agent.knowledge_domains,
    business_function: agent.business_function || undefined,
    role: agent.role || undefined,
    tier: agent.tier as 1 | 2 | 3,
    priority: agent.priority,
    implementation_phase: agent.implementation_phase as 1 | 2 | 3,
    is_custom: agent.is_custom,
    status: agent.status as any,
    medical_specialty: agent.medical_specialty,
    pharma_enabled: agent.pharma_enabled,
    verify_enabled: agent.verify_enabled,
    hipaa_compliant: agent.hipaa_compliant,
    cost_per_query: agent.cost_per_query,
    created_by: agent.user_id,
    created_at: agent.created_at,
    updated_at: agent.updated_at,
  };
}

/**
 * Convert GraphRAG AgentSearchResult to UnifiedAgentSearchResult
 */
export function graphRAGResultToUnified(
  result: SharedAgentSearchResult | { agent: Agent; similarity: number }
): UnifiedAgentSearchResult {
  const agent = 'agent' in result ? result.agent : result;
  const similarity = 'similarity' in result ? result.similarity : undefined;

  return {
    agent: 'id' in agent && typeof agent.id === 'string' ? agent as Agent : sharedAgentToAgent(agent as SharedAgent),
    similarity,
    score: similarity,
    source: 'graphrag',
    matchReason: [],
  };
}

/**
 * Convert database agent to UnifiedAgentSearchResult
 */
export function databaseAgentToUnified(agent: Agent, score?: number): UnifiedAgentSearchResult {
  return {
    agent,
    score,
    source: 'database',
    matchReason: [],
  };
}

/**
 * Convert UserAgent relationship to agent with metadata
 */
export function userAgentToAgent(userAgent: SharedUserAgent): Agent & { added_at?: string; last_used_at?: string } {
  const agent = sharedAgentToAgent(userAgent.agent);
  return {
    ...agent,
    added_at: userAgent.added_at,
    last_used_at: userAgent.last_used_at,
  };
}

/**
 * Normalize any agent-like object to canonical Agent
 */
export function normalizeToAgent(input: any): Agent {
  // If already canonical Agent
  if (input && typeof input.id === 'string' && typeof input.system_prompt === 'string') {
    return input as Agent;
  }

  // If shared/types Agent
  if (input && typeof input.system_prompt === 'string') {
    return sharedAgentToAgent(input as SharedAgent);
  }

  // If EnhancedAgent
  if (input && input.name && input.model) {
    const agent = input as EnhancedAgent;
    return {
      id: agent.id || '',
      name: agent.name,
      display_name: agent.display_name || agent.name,
      description: agent.description || '',
      system_prompt: agent.system_prompt || '',
      model: agent.model,
      temperature: agent.temperature ?? 0.7,
      max_tokens: agent.max_tokens ?? 2000,
      avatar: agent.avatar || '🤖',
      color: agent.color || '#3B82F6',
      capabilities: agent.capabilities || [],
      rag_enabled: agent.rag_enabled ?? true, // RAG enabled by default for all agents
      knowledge_domains: agent.knowledge_domains,
      status: 'active',
      tier: agent.tier || 1,
      priority: 1,
      implementation_phase: 1,
    };
  }

  throw new Error('Cannot normalize input to Agent type');
}

