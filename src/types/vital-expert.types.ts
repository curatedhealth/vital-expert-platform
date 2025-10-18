/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VITAL EXPERT - TYPESCRIPT TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Complete type definitions for the VITAL Expert system
 * Matches backend models and frontend interfaces
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE ENTITIES
// ═══════════════════════════════════════════════════════════════════════════

export interface Agent {
  id: string;
  name: string;
  display_name?: string;
  description: string;
  avatar?: string;
  business_function?: string;
  capabilities?: string[];
  system_prompt?: string;
  model?: string;
  temperature?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agentId?: string;
  agentName?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  agentName?: string;
  updatedAt: Date;
  isAutomaticMode: boolean;
  isAutonomousMode: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTONOMOUS MODE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ReasoningStep {
  id: string;
  timestamp: Date;
  phase: 'think' | 'plan' | 'act' | 'observe' | 'reflect' | 'synthesize';
  step: string;
  description: string;
  content: {
    reasoning?: string;
    insights?: string[];
    questions?: string[];
    decisions?: string[];
    evidence?: string[];
  };
  metadata?: {
    confidence?: number;
    cost?: number;
    tokensUsed?: number;
    toolsUsed?: string[];
    duration?: number;
  };
}

export interface AutonomousState {
  sessionId: string;
  userId: string;
  originalGoal: string;
  messages: Message[];
  
  // Reasoning
  currentPhase: string;
  currentIteration: number;
  maxIterations: number;
  reasoningSteps: ReasoningStep[];
  
  // Goals
  decomposedGoals: Array<{
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: number;
  }>;
  completedGoals: string[];
  goalProgress: number;
  
  // Control
  shouldContinue: boolean;
  isPaused: boolean;
  isComplete: boolean;
  
  // Output
  finalSynthesis?: {
    content: string;
    summary: string;
    recommendations: string[];
    nextSteps: string[];
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// API REQUEST/RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SendMessageRequest {
  chatId: string;
  message: string;
  agentId?: string;
}

export interface SendMessageResponse {
  response: string;
  agentId: string;
  agentName: string;
}

export interface CreateChatRequest {
  title: string;
  isAutomaticMode?: boolean;
  isAutonomousMode?: boolean;
}

export interface CreateChatResponse {
  chat: Chat;
}

export interface AutonomousExecuteRequest {
  chatId: string;
  goal: string;
  maxIterations?: number;
  autoApprove?: boolean;
}

export interface AutonomousExecuteResponse {
  sessionId: string;
  status: 'started' | 'paused' | 'stopped' | 'completed';
}

// ═══════════════════════════════════════════════════════════════════════════
// STREAMING EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ReasoningStepEvent {
  event: 'reasoning_step';
  data: {
    id: string;
    timestamp: string;
    phase: string;
    step: string;
    description: string;
    content: {
      reasoning?: string;
      insights?: string[];
      questions?: string[];
      decisions?: string[];
      evidence?: string[];
    };
    metadata?: {
      confidence?: number;
      cost?: number;
      tokensUsed?: number;
      toolsUsed?: string[];
      duration?: number;
    };
  };
}

export interface PhaseChangeEvent {
  event: 'phase_change';
  data: {
    phase: string;
    metadata?: Record<string, any>;
  };
}

export interface ProgressEvent {
  event: 'progress';
  data: {
    progress: number;
  };
}

export interface CompleteEvent {
  event: 'complete';
  data: {
    result?: string;
    summary?: string;
  };
}

export type StreamEvent = 
  | ReasoningStepEvent 
  | PhaseChangeEvent 
  | ProgressEvent 
  | CompleteEvent;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT PROPS TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UnifiedChatSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface ChatInputGoldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  interactionMode: 'automatic' | 'manual';
  hasSelectedAgent: boolean;
  disabled?: boolean;
  className?: string;
  isCentered?: boolean;
  selectedAgent?: Agent;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  currentChat?: Chat;
  onUpdateChatMode?: (mode: 'automatic' | 'autonomous', value: boolean) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// API CLIENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface StreamHandlers {
  onReasoningStep: (step: ReasoningStep) => void;
  onPhaseChange: (phase: string, metadata?: Record<string, any>) => void;
  onProgress: (progress: number) => void;
  onComplete: (result?: string) => void;
  onError: (error: Error) => void;
}

export interface VitalExpertClientConfig {
  baseURL: string;
  timeout: number;
  enableAutonomous: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type InteractionMode = 'manual' | 'automatic' | 'autonomous';

export type Phase = 'think' | 'plan' | 'act' | 'observe' | 'reflect' | 'synthesize';

export type AgentCapability = 
  | 'digital_health'
  | 'reimbursement'
  | 'clinical_research'
  | 'regulatory'
  | 'market_access'
  | 'data_analysis'
  | 'strategy';

export type BusinessFunction = 
  | 'Reimbursement & Market Access'
  | 'Clinical Research & Development'
  | 'Digital Health & Innovation'
  | 'Regulatory Affairs'
  | 'Market Strategy'
  | 'Data Analytics';

// ═══════════════════════════════════════════════════════════════════════════
// ERROR TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface VitalExpertError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export type ErrorCode = 
  | 'AGENT_NOT_FOUND'
  | 'CHAT_NOT_FOUND'
  | 'AUTONOMOUS_SESSION_NOT_FOUND'
  | 'INVALID_MODE'
  | 'STREAMING_ERROR'
  | 'API_ERROR'
  | 'NETWORK_ERROR';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface VitalExpertConfig {
  api: {
    baseURL: string;
    timeout: number;
    enableAutonomous: boolean;
  };
  ui: {
    showReasoningPanel: boolean;
    enableKeyboardShortcuts: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  agents: {
    defaultModel: string;
    temperature: number;
    maxTokens: number;
  };
  autonomous: {
    maxIterations: number;
    autoApprove: boolean;
    enablePauseResume: boolean;
  };
}
