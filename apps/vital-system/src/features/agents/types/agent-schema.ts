/**
 * Agent Schema - Type definitions for Phase 2 & Phase 3 components
 *
 * This schema maps to the existing Agent type from agents-store
 * to ensure compatibility across all components.
 */

import type { Agent as StoreAgent } from '@/lib/stores/agents-store';

/**
 * ClientAgent - Frontend representation of an agent
 * Mapped from the store's Agent type for use in Phase 2/3 components
 */
export interface ClientAgent {
  // Core Identity
  id: string;
  name: string;
  display_name: string;
  tagline?: string; // Derived from description
  description: string;
  avatar: string;
  color?: string;

  // Configuration
  tier: '1' | '2' | '3';
  model: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  context_window?: number;
  cost_per_query?: number;

  // Capabilities & Knowledge
  capabilities: string[];
  knowledge_domains: string[];
  domain_expertise?: string;

  // Status & Metadata
  status: 'active' | 'testing' | 'inactive';
  is_custom: boolean;
  rag_enabled?: boolean;

  // Organization (optional)
  business_function?: string | null;
  department?: string | null;
  role?: string | null;
  organizational_role?: string | null;

  // Healthcare Compliance (optional)
  medical_specialty?: string;
  clinical_validation_status?: 'pending' | 'validated' | 'expired' | 'under_review';
  hipaa_compliant?: boolean;

  // Timestamps
  created_at: string;
  updated_at?: string;

  // Statistics (optional - for analytics)
  totalConsultations?: number;
  satisfactionScore?: number;
  successRate?: number;
  averageResponseTime?: number;
  totalCost?: number;
}

/**
 * AgentUsageData - Analytics data for an agent
 * Used by the Analytics Dashboard component
 */
export interface AgentUsageData {
  agentId: string;
  totalQueries: number;
  successfulQueries: number;
  averageResponseTime: number; // in milliseconds
  totalCost: number; // in USD
  userSatisfactionScore: number; // 0-5 scale
  lastUsed: string; // ISO 8601 timestamp
}

/**
 * Convert Store Agent to Client Agent
 * Maps the store's Agent type to the ClientAgent schema used by Phase 2/3 components
 */
export function convertToClientAgent(agent: StoreAgent): ClientAgent {
  // Map status from store to client format
  let status: 'active' | 'testing' | 'inactive' = 'inactive';
  if (agent.status === 'active') status = 'active';
  else if (agent.status === 'testing') status = 'testing';
  else if (agent.status === 'development' || agent.status === 'deprecated') status = 'inactive';

  // Map tier to string format (1, 2, 3)
  const tier = String(agent.tier || 1) as '1' | '2' | '3';

  return {
    id: agent.id,
    name: agent.name,
    display_name: agent.display_name || agent.name,
    tagline: agent.description?.split('.')[0] || '', // First sentence as tagline
    description: agent.description,
    avatar: agent.avatar || '🤖',
    color: agent.color,
    tier,
    model: agent.model || 'gpt-4',
    system_prompt: agent.system_prompt || '',
    temperature: agent.temperature ?? 0.7,
    max_tokens: agent.max_tokens ?? 2000,
    cost_per_query: agent.cost_per_query,
    capabilities: agent.capabilities || [],
    knowledge_domains: agent.knowledge_domains || [],
    domain_expertise: agent.domain_expertise,
    status,
    is_custom: agent.is_custom ?? false,
    rag_enabled: agent.rag_enabled ?? true, // RAG enabled by default for all agents
    business_function: agent.business_function,
    department: agent.department,
    role: agent.role,
    organizational_role: agent.organizational_role,
    medical_specialty: agent.medical_specialty,
    clinical_validation_status: agent.clinical_validation_status,
    hipaa_compliant: agent.hipaa_compliant,
    created_at: agent.created_at || new Date().toISOString(),
    updated_at: agent.updated_at,
    totalConsultations: agent.totalConsultations,
    satisfactionScore: agent.satisfactionScore,
    successRate: agent.successRate,
    averageResponseTime: agent.averageResponseTime,
    totalCost: agent.totalCost,
  };
}

/**
 * Convert Client Agent back to Store Agent
 * Maps the ClientAgent back to the store's Agent type
 */
export function convertToStoreAgent(client: ClientAgent): Partial<StoreAgent> {
  // Map status from client to store format
  let status: 'development' | 'testing' | 'active' | 'deprecated' = 'active';
  if (client.status === 'inactive') status = 'development';
  else if (client.status === 'testing') status = 'testing';
  else if (client.status === 'active') status = 'active';

  return {
    id: client.id,
    name: client.name,
    display_name: client.display_name,
    description: client.description,
    avatar: client.avatar,
    color: client.color,
    tier: parseInt(client.tier, 10),
    model: client.model,
    system_prompt: client.system_prompt,
    temperature: client.temperature,
    max_tokens: client.max_tokens,
    cost_per_query: client.cost_per_query,
    capabilities: client.capabilities,
    knowledge_domains: client.knowledge_domains,
    domain_expertise: client.domain_expertise,
    status,
    is_custom: client.is_custom,
    rag_enabled: client.rag_enabled,
    business_function: client.business_function,
    department: client.department,
    role: client.role,
    organizational_role: client.organizational_role,
    medical_specialty: client.medical_specialty,
    clinical_validation_status: client.clinical_validation_status,
    hipaa_compliant: client.hipaa_compliant,
    created_at: client.created_at,
    updated_at: client.updated_at,
    // Statistics
    totalConsultations: client.totalConsultations,
    satisfactionScore: client.satisfactionScore,
    successRate: client.successRate,
    averageResponseTime: client.averageResponseTime,
    totalCost: client.totalCost,
    // Required fields with defaults
    priority: 1,
    implementation_phase: 1,
  };
}

/**
 * Generate mock usage data for testing analytics
 * TODO: Replace with real data from usage tracking system
 */
export function generateMockUsageData(agents: ClientAgent[]): AgentUsageData[] {
  return agents.map((agent) => ({
    agentId: agent.id,
    totalQueries: agent.totalConsultations || Math.floor(Math.random() * 5000),
    successfulQueries: agent.totalConsultations
      ? Math.floor(agent.totalConsultations * (agent.successRate || 90) / 100)
      : Math.floor(Math.random() * 4500),
    averageResponseTime: agent.averageResponseTime
      ? agent.averageResponseTime * 1000 // Convert seconds to ms
      : Math.floor(Math.random() * 2000) + 500,
    totalCost: agent.totalCost || Math.random() * 500,
    userSatisfactionScore: agent.satisfactionScore || Math.random() * 2 + 3, // 3-5 range
    lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}
