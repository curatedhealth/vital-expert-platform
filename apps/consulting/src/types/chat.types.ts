/**
 * VITAL AI Ultimate Interface v3.0 - Complete Type Definitions
 * Healthcare-specific AI chat interface types
 */

export type AgentType =
  | 'fda-regulatory'
  | 'ema-specialist'
  | 'clinical-trial'
  | 'digital-therapeutics'
  | 'ai-ml-specialist'
  | 'reimbursement'
  | 'quality-systems'
  | 'medical-safety'
  | 'data-privacy'
  | 'market-access'
  | 'patient-engagement'
  | 'real-world-evidence'
  | 'biostatistics'
  | 'regulatory-intelligence'
  | 'compliance-monitor'
  | 'clinical-trial-designer'
  | 'digital-therapeutics-expert';

export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  display_name: string;
  avatar: string;
  specialty: string;
  description: string;
  responseTime: string;
  availability: 'online' | 'busy' | 'offline';
  confidence: number;
  rating: number;
  expertise: string[];
  languages: string[];
  tier?: number;
  business_function?: string;
  role?: string;
  knowledge_domains?: string[];
  capabilities: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'streaming' | 'error' | 'thinking';
  agent?: Agent;
  branches?: MessageBranch[];
  currentBranch?: number;
  metadata?: MessageMetadata;
  attachments?: Attachment[];
  citations?: Citation[];
  sources?: Source[];
  artifacts?: Artifact[];
  reasoning?: string;
  thinkingDuration?: number;
  isCollaborative?: boolean;
  collaboratingAgents?: Agent[];
  consensusLevel?: number;
  feedback?: 'positive' | 'negative' | null;
}

export interface MessageBranch {
  id: string;
  version: number;
  content: string;
  agent?: Agent;
  confidence: number;
  timestamp: Date;
}

export interface MessageMetadata {
  tokensUsed: number;
  processingTime: number;
  model: string;
  temperature: number;
  confidenceScore: number;
  complianceChecked: boolean;
  regulatoryFlags: string[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  agents: Agent[];
  status: 'active' | 'archived' | 'deleted';
  tags: string[];
  starred: boolean;
  metadata?: ConversationMetadata;
}

export interface ConversationMetadata {
  totalMessages: number;
  averageResponseTime: number;
  primaryAgents: Agent[];
  topicsDiscussed: string[];
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface Citation {
  id: string;
  number: number;
  title: string;
  authors: string[];
  journal?: string;
  year: number;
  doi?: string;
  pmid?: string;
  url?: string;
  impactFactor?: number;
  relevance: number;
}

export interface Source {
  id: string;
  type: 'fda-guidance' | 'ema-guidance' | 'clinical-study' | 'regulation' | 'precedent';
  title: string;
  url: string;
  date: Date;
  reliability: number;
  excerpt?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  metadata?: {
    pages?: number;
    compliance?: ComplianceCheck[];
    extracted?: ExtractedData;
  };
}

export interface ComplianceCheck {
  regulation: string;
  status: 'compliant' | 'non-compliant' | 'review-required';
  issues: string[];
  recommendations: string[];
}

export interface ExtractedData {
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  keyFindings: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
}

export interface Artifact {
  id: string;
  type: 'document' | 'code' | 'data' | 'visualization';
  title: string;
  content: string;
  format: string;
  createdAt: Date;
  exports: ExportFormat[];
}

export interface ExportFormat {
  format: 'pdf' | 'docx' | 'xlsx' | 'json' | 'csv';
  url: string;
  size: number;
}

export interface PromptStarter {
  id: string;
  icon: string;
  text: string;
  category: 'clinical' | 'regulatory' | 'business' | 'compliance';
  agents?: AgentType[];
  template?: string;
}

export interface ChatSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  responseStyle: 'concise' | 'balanced' | 'detailed';
  enableVoice: boolean;
  enableFileUpload: boolean;
  enableMultiAgent: boolean;
  complianceLevel: 'standard' | 'enhanced' | 'maximum';
  language: string;
  theme: 'light' | 'dark' | 'system';
}

export interface VoiceSettings {
  enabled: boolean;
  language: 'en-US';
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number; // 0.5 to 2.0
  autoPlay: boolean;
}

export interface CollaborationState {
  agents: Agent[];
  progress: Record<string, number>; // agentId -> progress %
  consensus: {
    level: number; // 0-100
    agreements: string[];
    disagreements: string[];
  };
  isActive: boolean;
}

// WebSocket Events
export interface WebSocketMessage {
  type: 'agent.thinking' | 'agent.response' | 'consensus.update' | 'stream.chunk' | 'error';
  data: unknown;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    requestId: string;
    timestamp: Date;
    processingTime: number;
  };
}

// Healthcare-specific types
export interface MedicalTerminology {
  term: string;
  definition: string;
  synonyms: string[];
  category: 'clinical' | 'regulatory' | 'pharmaceutical' | 'device';
  sources: string[];
}

export interface RegulatoryFlag {
  type: 'warning' | 'error' | 'info';
  regulation: string;
  description: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  agentPanelOpen: boolean;
  settingsOpen: boolean;
  currentBranch: Map<string, number>;
  loadingStates: {
    sendingMessage: boolean;
    loadingConversation: boolean;
    processingFile: boolean;
    generatingResponse: boolean;
  };
}

// Error Types
export interface ChatError {
  id: string;
  type: 'network' | 'validation' | 'authorization' | 'compliance' | 'system';
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
}

// Performance Metrics
export interface PerformanceMetrics {
  timeToFirstByte: number;
  timeToInteractive: number;
  streamLatency: number;
  messageProcessingTime: number;
  agentResponseTime: number;
  consensusBuildingTime?: number;
}

// Analytics Events
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}