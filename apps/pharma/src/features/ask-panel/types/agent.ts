/**
 * Agent Types for Ask Panel
 * 
 * Comprehensive type definitions for agents, suites, and recommendations
 */

// ============================================================================
// AGENT TYPES
// ============================================================================

export interface Agent {
  id: string;
  name: string; // slug/code name
  slug: string;
  title: string;
  description: string;
  
  // Expertise & Capabilities
  expertise: string[];
  specialties: string[];
  background: string | null;
  capabilities: string[];
  
  // Personality & Communication
  personality_traits: string[];
  communication_style: string | null;
  
  // Metadata
  avatar_url: string | null;
  popularity_score: number;
  rating: string; // Stored as string in DB, parse as number
  total_consultations: number;
  category: string | null;
  tags: string[];
  
  // Tenant & Sharing
  tenant_id: string;
  is_shared: boolean;
  sharing_mode: 'global' | 'tenant' | 'private';
  resource_type: 'platform' | 'user' | 'organization';
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

// Agent for display in UI cards
export interface AgentCardData {
  id: string;
  name: string;
  title: string;
  description: string;
  expertise: string[];
  specialties: string[];
  avatar_url: string | null;
  rating: number;
  total_consultations: number;
  category: string | null;
  isSelected?: boolean;
}

// Agent for execution (mapped to AgentDefinition for orchestrator)
export interface ExecutableAgent {
  id: string;
  role: string;
  goal?: string;
  backstory?: string;
  systemPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
  allowDelegation?: boolean;
}

// ============================================================================
// AGENT SUITE TYPES
// ============================================================================

export interface AgentSuite {
  id: string;
  unique_id: string;
  name: string;
  description: string | null;
  category: string | null;
  tags: string[];
  position: number;
  is_active: boolean;
  
  // Related data
  members?: AgentSuiteMember[];
  agent_count?: number;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface AgentSuiteMember {
  id: string;
  suite_id: string;
  agent_id: string;
  agent_unique_id: string;
  position: number;
  primary_flag: boolean;
  
  // Joined data
  agent?: Agent;
  suite?: AgentSuite;
  
  // Timestamps
  created_at?: string;
}

// ============================================================================
// RECOMMENDATION TYPES
// ============================================================================

export interface AgentRecommendation {
  agent: Agent;
  score: number; // 0-1, confidence score
  reasons: string[]; // Why this agent was recommended
  matchedExpertise: string[]; // Which expertise areas matched
  matchedSpecialties: string[]; // Which specialties matched
}

export interface PanelRecommendation {
  agents: AgentRecommendation[];
  panelMode: 'sequential' | 'collaborative' | 'hybrid';
  framework: 'langgraph' | 'autogen' | 'crewai';
  rationale: string; // Why this configuration
  confidence: number; // Overall confidence 0-1
  useCase?: string; // Detected use case
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface AgentFilters {
  category?: string | string[];
  expertise?: string[];
  specialties?: string[];
  minRating?: number;
  minConsultations?: number;
  tags?: string[];
  searchQuery?: string;
  suiteId?: string;
}

export interface AgentSearchResult {
  agents: Agent[];
  totalCount: number;
  filters: AgentFilters;
  facets?: {
    categories: { name: string; count: number }[];
    expertise: { name: string; count: number }[];
    tags: { name: string; count: number }[];
  };
}

// ============================================================================
// PANEL CONFIGURATION TYPES
// ============================================================================

export interface PanelConfiguration {
  // Selected agents
  selectedAgents: Agent[];
  
  // Panel mode
  mode: 'sequential' | 'collaborative' | 'hybrid';
  
  // Execution settings
  framework: 'auto' | 'langgraph' | 'autogen' | 'crewai';
  executionMode: 'sequential' | 'parallel' | 'conversational' | 'hierarchical';
  
  // Advanced settings
  userGuidance: 'high' | 'medium' | 'low';
  allowDebate: boolean;
  maxRounds: number;
  requireConsensus: boolean;
  
  // Context
  useCase?: string;
  template?: string;
}

// ============================================================================
// USE CASE TEMPLATE TYPES
// ============================================================================

export interface PanelTemplate {
  id: string;
  name: string;
  description: string;
  useCase: string;
  
  // Configuration
  suggestedAgents: string[]; // Agent slugs
  mode: 'sequential' | 'collaborative' | 'hybrid';
  framework: 'langgraph' | 'autogen' | 'crewai';
  
  // Settings
  defaultSettings: {
    userGuidance: 'high' | 'medium' | 'low';
    allowDebate: boolean;
    maxRounds: number;
    requireConsensus: boolean;
  };
  
  // Metadata
  icon?: string;
  category: string;
  tags: string[];
  popularity?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AgentCategory = 
  | 'clinical'
  | 'regulatory'
  | 'analytical'
  | 'technical'
  | 'market_access'
  | 'operations'
  | 'quality';

export type SharingMode = 'global' | 'tenant' | 'private';

export type ResourceType = 'platform' | 'user' | 'organization';

