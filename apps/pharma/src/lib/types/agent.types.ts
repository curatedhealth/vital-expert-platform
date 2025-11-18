/**
 * Unified Agent Type Definitions
 * Single source of truth for agent-related types across the application
 */

/**
 * Primary Agent interface - matches database schema
 * This is the canonical agent type used throughout the application
 */
export interface Agent {
  // Core Identity
  id: string;
  name: string;
  display_name: string;
  description: string;
  system_prompt: string;

  // Model Configuration
  model: string;
  temperature: number;
  max_tokens: number;

  // Visual
  avatar: string;
  color: string;

  // Capabilities
  capabilities: string[];
  rag_enabled: boolean;
  knowledge_domains?: string[];

  // Ownership & Permissions
  user_id?: string;
  is_custom?: boolean;
  is_user_copy?: boolean;
  original_agent_id?: string;
  copied_at?: string;

  // Status & Lifecycle
  status: 'development' | 'testing' | 'active' | 'deprecated';
  tier: number;
  priority: number;
  implementation_phase: number;

  // Organizational Structure
  business_function?: string | null;
  department?: string | null;
  role?: string | null;
  organizational_role?: string | null;

  // Foreign Keys
  business_function_id?: string | null;
  department_id?: string | null;
  role_id?: string | null;
  function_id?: string | null;

  // Categorization
  categories?: string[];
  domain_expertise?: string;

  // Healthcare Compliance
  medical_specialty?: string;
  clinical_validation_status?: 'pending' | 'validated' | 'expired' | 'under_review';
  medical_accuracy_score?: number;
  citation_accuracy?: number;
  hallucination_rate?: number;
  medical_error_rate?: number;
  fda_samd_class?: string;
  hipaa_compliant?: boolean;
  pharma_enabled?: boolean;
  verify_enabled?: boolean;
  last_clinical_review?: string;
  medical_reviewer_id?: string;

  // Performance Metrics
  cost_per_query?: number;
  average_latency_ms?: number;

  // Audit
  audit_trail?: Record<string, unknown>;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

/**
 * Legacy chat-compatible agent type (camelCase)
 * Used by some older chat components
 * @deprecated Use Agent type and adapter functions instead
 */
export interface ChatAgent {
  id: string;
  name: string;
  display_name?: string;
  description: string;
  systemPrompt: string;
  model: string;
  avatar: string;
  color: string;
  capabilities: string[];
  ragEnabled: boolean;
  temperature: number;
  maxTokens: number;
  isCustom?: boolean;
  knowledgeUrls?: string[];
  tools?: string[];
  knowledgeDomains?: string[];
  businessFunction?: string;
  role?: string;
  department?: string;
  organizationalRole?: string;
  tier?: number;
}

/**
 * Agent category for grouping agents
 */
export interface AgentCategory {
  id: string;
  name: string;
  description: string;
  color?: string;
  sort_order: number;
}

/**
 * Agent filter criteria
 */
export interface AgentFilters {
  search?: string;
  category?: string;
  tier?: number;
  phase?: number;
  status?: Agent['status'];
  businessFunction?: string;
  department?: string;
  medicalSpecialty?: string;
  onlyUserAgents?: boolean;
}

/**
 * Agent creation/update payload
 */
export interface AgentPayload extends Partial<Omit<Agent, 'id' | 'created_at' | 'updated_at'>> {
  // Required fields for creation
  name: string;
  display_name: string;
  description: string;
  system_prompt: string;
  model: string;
}

// ===========================
// TYPE ADAPTERS
// ===========================

/**
 * Convert database Agent to legacy ChatAgent format
 * Use this when passing agents to older chat components
 *
 * @param agent - Agent in database format
 * @returns ChatAgent in camelCase format
 */
export function agentToChatAgent(agent: Agent): ChatAgent {
  return {
    id: agent.id,
    name: agent.name,
    display_name: agent.display_name,
    description: agent.description,
    systemPrompt: agent.system_prompt,
    model: agent.model,
    avatar: agent.avatar,
    color: agent.color,
    capabilities: agent.capabilities || [],
    ragEnabled: agent.rag_enabled || false,
    temperature: agent.temperature,
    maxTokens: agent.max_tokens,
    isCustom: agent.is_custom,
    knowledgeDomains: agent.knowledge_domains,
    businessFunction: agent.business_function || undefined,
    role: agent.role || undefined,
    department: agent.department || undefined,
    organizationalRole: agent.organizational_role || undefined,
    tier: agent.tier,
  };
}

/**
 * Convert legacy ChatAgent to database Agent format
 * Use this when saving chat agents to database
 *
 * @param chatAgent - ChatAgent in camelCase format
 * @returns Agent in database format
 */
export function chatAgentToAgent(chatAgent: ChatAgent): Partial<Agent> {
  return {
    id: chatAgent.id,
    name: chatAgent.name,
    display_name: chatAgent.display_name || chatAgent.name,
    description: chatAgent.description,
    system_prompt: chatAgent.systemPrompt,
    model: chatAgent.model,
    avatar: chatAgent.avatar,
    color: chatAgent.color,
    capabilities: chatAgent.capabilities || [],
    rag_enabled: chatAgent.ragEnabled || false,
    temperature: chatAgent.temperature,
    max_tokens: chatAgent.maxTokens,
    is_custom: chatAgent.isCustom,
    knowledge_domains: chatAgent.knowledgeDomains,
    business_function: chatAgent.businessFunction || null,
    role: chatAgent.role || null,
    department: chatAgent.department || null,
    organizational_role: chatAgent.organizationalRole || null,
    tier: chatAgent.tier || 1,
    status: 'active',
    priority: 1,
    implementation_phase: 1,
  };
}

/**
 * Batch convert agents array to chat agents
 */
export function agentsToChatAgents(agents: Agent[]): ChatAgent[] {
  return agents.map(agentToChatAgent);
}

/**
 * Batch convert chat agents array to agents
 */
export function chatAgentsToAgents(chatAgents: ChatAgent[]): Partial<Agent>[] {
  return chatAgents.map(chatAgentToAgent);
}

/**
 * Type guard to check if object is an Agent
 */
export function isAgent(obj: unknown): obj is Agent {
  if (!obj || typeof obj !== 'object') return false;
  const agent = obj as Agent;
  return (
    typeof agent.id === 'string' &&
    typeof agent.name === 'string' &&
    typeof agent.system_prompt === 'string'
  );
}

/**
 * Type guard to check if object is a ChatAgent
 */
export function isChatAgent(obj: unknown): obj is ChatAgent {
  if (!obj || typeof obj !== 'object') return false;
  const chatAgent = obj as ChatAgent;
  return (
    typeof chatAgent.id === 'string' &&
    typeof chatAgent.name === 'string' &&
    typeof chatAgent.systemPrompt === 'string'
  );
}

/**
 * Normalize agent to ensure all required fields exist
 * Useful when dealing with partial agent data from API
 */
export function normalizeAgent(agent: Partial<Agent>): Agent {
  return {
    id: agent.id || '',
    name: agent.name || 'Unnamed Agent',
    display_name: agent.display_name || agent.name || 'Unnamed Agent',
    description: agent.description || '',
    system_prompt: agent.system_prompt || '',
    model: agent.model || 'gpt-4-turbo-preview',
    temperature: agent.temperature ?? 0.7,
    max_tokens: agent.max_tokens ?? 2000,
    avatar: agent.avatar || '🤖',
    color: agent.color || '#3B82F6',
    capabilities: agent.capabilities || [],
    rag_enabled: agent.rag_enabled ?? false,
    status: agent.status || 'development',
    tier: agent.tier ?? 1,
    priority: agent.priority ?? 1,
    implementation_phase: agent.implementation_phase ?? 1,
    ...agent,
  };
}
