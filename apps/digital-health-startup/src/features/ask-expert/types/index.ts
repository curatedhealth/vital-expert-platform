/**
 * Shared type definitions for Ask Expert feature
 * Extracted from ask-expert/page.tsx for better maintainability
 */

// ============================================================================
// SOURCE & CITATION TYPES
// ============================================================================

export interface Source {
  id?: string;
  number?: number;
  url: string;
  title?: string;
  description?: string;
  excerpt?: string;
  similarity?: number;
  domain?: string;
  evidenceLevel?: 'A' | 'B' | 'C' | 'D' | 'Unknown';
  organization?: string;
  reliabilityScore?: number;
  lastUpdated?: string;
  quote?: string;
  sourceType?: string;
  metadata?: Record<string, any>;
}

export interface CitationMeta {
  number: number | string;
  id?: string;
  title?: string;
  url?: string;
  description?: string;
  quote?: string;
  excerpt?: string;
  sources?: Source[];
  sourceId?: string;
  [key: string]: any;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface AttachmentInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface MessageMetadata {
  ragSummary?: {
    totalSources: number;
    strategy?: string;
    domains?: string[];
    cacheHit?: boolean;
    warning?: string;
    retrievalTimeMs?: number;
  };
  toolSummary?: {
    allowed: string[];
    used: string[];
    totals: {
      calls: number;
      success: number;
      failure: number;
      totalTimeMs: number;
    };
  };
  sources?: Source[];
  [key: string]: any;
}

export interface MessageBranch {
  id: string;
  content: string;
  confidence?: number;
  citations?: CitationMeta[];
  sources?: Source[];
  createdAt?: Date;
  reasoning?: string | string[];
}

export interface AutonomousMetadata {
  goalUnderstanding?: string;
  executionPlan?: string;
  currentIteration?: number;
  currentThought?: string;
  currentAction?: string;
  currentObservation?: string;
  currentReflection?: string;
  finalAnswer?: string;
  finalConfidence?: number;
  totalIterations?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: AttachmentInfo[];
  reasoning?: string[];
  sources?: Source[];
  selectedAgent?: {
    id: string;
    name: string;
    display_name: string;
  };
  selectionReason?: string;
  confidence?: number;
  autonomousMetadata?: AutonomousMetadata;
  branches?: MessageBranch[];
  currentBranch?: number;
  metadata?: MessageMetadata;
}

// ============================================================================
// CONVERSATION TYPES
// ============================================================================

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  mode?: number;
  agents?: Array<{
    id: string;
    name: string;
    display_name: string;
  }>;
}

// ============================================================================
// STREAMING TYPES
// ============================================================================

export interface StreamingMetadata {
  node?: string;
  toolCalls?: number;
  sources?: number;
  retrievalTimeMs?: number;
  [key: string]: any;
}

export interface SSEEvent {
  event: string;
  data: any;
  id?: string;
  retry?: number;
}

// ============================================================================
// MODE TYPES
// ============================================================================

export interface ModeConfig {
  mode: number;
  isAutomatic: boolean;
  isAutonomous: boolean;
  endpoint: string;
  requiresAgentSelection: boolean;
  supportsTools: boolean;
  supportsRAG: boolean;
}

export interface ModeRequirements {
  hasAgents: boolean;
  hasQuery: boolean;
  isValid: boolean;
  missingRequirements: string[];
}

// ============================================================================
// TOOL TYPES (for orchestration)
// ============================================================================

export interface ToolSuggestion {
  id: string;
  name: string;
  description: string;
  parameters?: Record<string, any>;
  reasoning?: string;
}

export interface ToolResult {
  id: string;
  name: string;
  status: 'success' | 'error' | 'executing';
  result?: any;
  error?: string;
  executionTimeMs?: number;
  timestamp: number;
}

export interface ExecutingTool {
  id: string;
  name: string;
  status: 'pending' | 'executing' | 'success' | 'error';
  progress?: number;
  message?: string;
}

export interface ToolExecutionStatus {
  isExecuting: boolean;
  tools: ExecutingTool[];
  totalTools: number;
  completedTools: number;
}

// ============================================================================
// CONNECTION TYPES
// ============================================================================

export interface ConnectionStatus {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  lastError?: string;
}


