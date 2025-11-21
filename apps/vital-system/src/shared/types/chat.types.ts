/**
 * VITAL AI Chat Interface Types
 * World-class chat system with medical specialization
 */

export type AgentType =
  | 'digital-therapeutics-expert'
  | 'mhealth-innovation-architect'
  | 'ai-ml-clinical-specialist'
  | 'fda-regulatory-strategist'
  | 'ema-compliance-specialist'
  | 'fda-regulatory'
  | 'quality-systems'
  | 'clinical-trial'
  | 'patient-engagement'
  | 'ema-specialist'
  | 'real-world-evidence'
  | 'data-privacy'
  | 'compliance-monitor'
  | 'ai-ml-specialist'
  | 'clinical-trial-designer'
  | 'medical-safety-officer'
  | 'health-tech-integration-expert'
  | 'clinical-data-scientist'
  | 'regulatory-submission-specialist'
  | 'pharmacovigilance-analyst'
  | 'clinical-research-coordinator'
  | 'biomedical-informatics-specialist'
  | 'health-economics-analyst'
  | 'medical-affairs-strategist'
  | 'fda-regulatory'
  | 'clinical-trial'
  | 'reimbursement'
  | 'market-access'
  | 'patient-engagement'
  | 'digital-therapeutics'
  | 'biostatistics';

export type MessageRole = 'user' | 'assistant' | 'system' | AgentType;

export type MessageStatus =
  | 'composing'
  | 'sending'
  | 'sent'
  | 'streaming'
  | 'thinking'
  | 'completed'
  | 'error'
  | 'cancelled';

export type LoadingStage =
  | 'routing'
  | 'analyzing'
  | 'researching'
  | 'synthesizing'
  | 'validating'
  | 'consensus';

export interface Citation {
  id: string;
  number: number;
  title: string;
  authors: string[];
  journal?: string;
  year?: number;
  url?: string;
  pubmedId?: string;
  doi?: string;
  impactFactor?: number;
  evidenceLevel?: 'A' | 'B' | 'C' | 'D';
  studyType?: string;
  relevanceScore: number;
}

export interface Source {
  id: string;
  title: string;
  type: 'fda-guidance' | 'clinical-study' | 'regulatory-doc' | 'guideline' | 'white-paper';
  url: string;
  description?: string;
  reliability: number;
  lastUpdated?: Date;
  organization?: string;
  accessLevel?: 'public' | 'restricted' | 'subscription';
}

export interface MessageBranch {
  id: string;
  content: string;
  agent?: Agent;
  confidence: number;
  reasoning?: string;
  citations: Citation[];
  sources: Source[];
  artifacts: Artifact[];
  createdAt: Date;
  isPreferred?: boolean;
  userRating?: number;
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  specialty: string;
  icon: string;
  availability: 'online' | 'busy' | 'offline';
  responseTime: number; // in milliseconds
  confidence: number;
  expertise: string[];
  isCollaborating?: boolean;
}

export interface CollaborationState {
  isActive: boolean;
  activeAgents: Agent[];
  responses: AgentResponse[];
  consensusLevel: number;
  conflicts: Conflict[];
  status: 'pending' | 'analyzing' | 'building-consensus' | 'completed';
}

export interface AgentResponse {
  agentId: string;
  agent: Agent;
  content: string;
  confidence: number;
  reasoning?: string;
  citations: Citation[];
  sources: Source[];
  artifacts: Artifact[];
  status: MessageStatus;
  progress: number;
  preview?: string;
  timestamp: Date;
}

export interface Conflict {
  id: string;
  type: 'disagreement' | 'contradiction' | 'uncertainty';
  description: string;
  agents: string[];
  severity: 'low' | 'medium' | 'high';
  resolution?: string;
}

export interface ConsensusResult {
  finalResponse: string;
  confidence: number;
  reasoning: string;
  contributingAgents: Agent[];
  citations: Citation[];
  sources: Source[];
  artifacts: Artifact[];
  conflicts: Conflict[];
  resolutionStrategy: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  branches: MessageBranch[];
  currentBranch: number;
  status: MessageStatus;
  loadingStage?: LoadingStage;
  agent?: Agent;
  timestamp: Date;
  citations: Citation[];
  sources: Source[];
  artifacts: Artifact[];
  reasoning?: string;
  isCollaborative: boolean;
  collaborationState?: CollaborationState;
  consensus?: ConsensusResult;
  parentMessageId?: string;
  tokens?: number;
  responseTime?: number;
  userFeedback?: {
    rating: number;
    helpful: boolean;
    comment?: string;
  };
  metadata?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    context?: any;
    complianceChecked?: boolean;
    confidenceScore?: number;
    regulatoryFlags?: string[];
    processingTime?: number;
    tokensUsed?: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  participants: Agent[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isArchived: boolean;
  starred?: boolean;
  summary?: string;
  totalMessages: number;
  totalTokens: number;
  avgResponseTime: number;
  favoriteMessages: string[];
  sharedWith?: string[];
  compliance: {
    isHIPAACompliant: boolean;
    containsPHI: boolean;
    auditTrail: string[];
    retentionPolicy?: string;
  };
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation?: Conversation;
  activeAgents: Agent[];
  availableAgents: Agent[];
  isLoading: boolean;
  loadingStage?: LoadingStage;
  error?: string;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  settings: ChatSettings;
}

export interface ChatSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  autoScroll: boolean;
  voiceEnabled: boolean;
  suggestionsEnabled: boolean;
  branchingEnabled: boolean;
  collaborationEnabled: boolean;
  confidenceThreshold: number;
  maxAgents: number;
  streamingEnabled: boolean;
  citationsEnabled: boolean;
  complianceMode: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseStyle?: string;
  enableVoice?: boolean;
  enableFileUpload?: boolean;
  enableMultiAgent?: boolean;
  complianceLevel?: string;
  language?: string;
}

export type ArtifactType =
  | 'clinical-protocol'
  | 'regulatory-document'
  | 'research-proposal'
  | 'data-analysis'
  | 'code-snippet'
  | 'visualization'
  | 'report';

export type ExportFormat =
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'csv'
  | 'json'
  | 'md'
  | 'latex'
  | 'txt'
  | 'js'
  | 'py'
  | 'r'
  | 'png'
  | 'svg'
  | 'html';

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  description?: string;
  content: string;
  size?: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  generatedBy?: string;
  confidence?: number;
  metadata?: {
    language?: string;
    version?: string;
    dependencies?: string[];
    tags?: string[];
  };
}

export interface StreamingChunk {
  id: string;
  messageId: string;
  content: string;
  isComplete: boolean;
  metadata?: {
    thinking?: string;
    citations?: Citation[];
    artifacts?: Artifact[];
    sources?: Source[];
  };
}

export interface Suggestion {
  id: string;
  text: string;
  category: 'next-steps' | 'quick-actions' | 'related-topics' | 'templates';
  icon?: string;
  confidence: number;
  action?: () => void;
}

export interface MedicalTerm {
  term: string;
  definition: string;
  category: 'clinical' | 'regulatory' | 'technical';
  relatedTerms: string[];
  sources: Source[];
}

export interface ComplianceIndicator {
  type: 'HIPAA' | 'GDPR' | '21_CFR_Part_11' | 'FDA_GCP';
  status: 'compliant' | 'non-compliant' | 'pending' | 'unknown';
  details?: string;
  lastChecked?: Date;
}

export interface PerformanceMetrics {
  messagesSent: number;
  averageResponseTime: number;
  agentUtilization: Record<AgentType, number>;
  userSatisfaction: number;
  errorRate: number;
  uptime: number;
}

// Event types for WebSocket communication
export type ChatEvent =
  | 'message.sent'
  | 'message.received'
  | 'agent.thinking'
  | 'agent.response'
  | 'stream.chunk'
  | 'consensus.update'
  | 'collaboration.started'
  | 'collaboration.ended'
  | 'error'
  | 'connection.status';

export interface ChatEventPayload {
  type: ChatEvent;
  conversationId: string;
  messageId?: string;
  data: unknown;
  timestamp: Date;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  requestId: string;
}

export interface AgentQueryRequest {
  query: string;
  context?: {
    conversationId?: string;
    previousMessages?: Message[];
    userPreferences?: Partial<ChatSettings>;
    medicalContext?: {
      specialty?: string;
      urgency?: 'low' | 'medium' | 'high';
      patientContext?: boolean;
    };
  };
  options?: {
    streamResponse?: boolean;
    includeReasoning?: boolean;
    includeSources?: boolean;
    maxAgents?: number;
    confidenceThreshold?: number;
    timeout?: number;
  };
}

export interface AgentQueryResponse extends ApiResponse {
  data: {
    messageId: string;
    content?: string;
    agent: Agent;
    confidence: number;
    reasoning?: string;
    citations: Citation[];
    sources: Source[];
    artifacts: Artifact[];
    isStreaming?: boolean;
    estimatedResponseTime?: number;
  };
}

export interface ConsensusRequest {
  responses: AgentResponse[];
  strategy: 'weighted-voting' | 'expert-priority' | 'confidence-based';
  conflictResolution: 'expert-priority' | 'user-choice' | 'majority-rule';
  options?: {
    includeReasoning?: boolean;
    minConfidence?: number;
    maxConflictLevel?: number;
  };
}

export interface ConsensusResponse extends ApiResponse {
  data: ConsensusResult;
}

// Prompt Starter Interface for agent initial prompts
export interface PromptStarter {
  id: string;
  text: string;
  title?: string;
  category?: string;
  description?: string;
  icon?: string;
  tags?: string[];
  agents?: AgentType[];
}