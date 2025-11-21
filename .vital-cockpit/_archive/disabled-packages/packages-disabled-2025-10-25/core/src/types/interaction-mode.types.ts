/**
 * Dual-Mode Interaction Types
 * Supports both Automatic Orchestration and Manual Expert Selection
 */

export type InteractionMode = 'automatic' | 'manual';

export type AgentTier = 1 | 2 | 3 | 'human';

export interface TierMetadata {
  tier: AgentTier;
  responseTime: string;
  accuracy: string;
  confidenceThreshold: number;
  description: string;
}

export const TIER_CONFIG: Record<AgentTier, TierMetadata> = {
  1: {
    tier: 1,
    responseTime: '<1s',
    accuracy: '85-90%',
    confidenceThreshold: 75,
    description: 'Fast responses for routine queries',
  },
  2: {
    tier: 2,
    responseTime: '1-3s',
    accuracy: '90-95%',
    confidenceThreshold: 85,
    description: 'Specialized expertise for complex queries',
  },
  3: {
    tier: 3,
    responseTime: '3-5s',
    accuracy: '>95%',
    confidenceThreshold: 90,
    description: 'Ultra-specialized knowledge for advanced topics',
  },
  human: {
    tier: 'human',
    responseTime: '2-4hr',
    accuracy: '100%',
    confidenceThreshold: 95,
    description: 'Human expert review for critical decisions',
  },
};

export interface EscalationEvent {
  id: string;
  fromTier: AgentTier;
  toTier: AgentTier;
  reason: EscalationReason;
  confidence: number;
  timestamp: Date;
  originalQuery: string;
  agentResponse?: string;
}

export type EscalationReason =
  | 'low_confidence'
  | 'complex_query'
  | 'conflicting_information'
  | 'requires_specialization'
  | 'user_requested'
  | 'safety_concern';

export interface AutomaticModeConfig {
  enableAutoEscalation: boolean;
  confidenceThreshold: number;
  maxAttempts: number;
  tier1Agents: string[];
  tier2Agents: string[];
  tier3Agents: string[];
  escalationStrategy: 'confidence' | 'complexity' | 'hybrid';
}

export interface ManualModeConfig {
  allowAgentSwitching: boolean;
  preserveContext: boolean;
  showAgentPersonality: boolean;
  enableConversationHistory: boolean;
  maxConversationLength: number;
}

export interface ExpertProfile {
  agentId: string;
  name: string;
  title: string;
  organization?: string;
  specialty: string[];
  bio: string;
  avatar: string;
  tier: AgentTier;
  knowledgeDomains: string[];
  capabilities: string[];
  communicationStyle: 'formal' | 'casual' | 'technical' | 'empathetic';
  responseTime: string;
  availability: 'available' | 'busy' | 'offline';
  rating: number;
  totalConversations: number;
  expertise: {
    domain: string;
    level: number; // 1-100
  }[];
}

export interface ConversationContext {
  sessionId: string;
  mode: InteractionMode;
  selectedExpert?: ExpertProfile;
  escalationHistory: EscalationEvent[];
  currentTier: AgentTier;
  messageCount: number;
  startTime: Date;
  lastActivity: Date;
}

export interface AutomaticModeResponse {
  content: string;
  agent: ExpertProfile;
  tier: AgentTier;
  confidence: number;
  shouldEscalate: boolean;
  escalationReason?: EscalationReason;
  nextTierSuggestion?: AgentTier;
  processingTime: number;
}

export interface ManualModeResponse {
  content: string;
  expert: ExpertProfile;
  contextPreserved: boolean;
  conversationTurn: number;
  processingTime: number;
}