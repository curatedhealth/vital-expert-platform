/**
 * Unified Chat Type Definitions
 * Single source of truth for chat-related types across the application
 */

/**
 * Chat message with metadata
 */
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  agentId?: string;
  isLoading?: boolean;
  error?: boolean;
  attachments?: MessageAttachment[];
  metadata?: MessageMetadata;
}

/**
 * Message attachment (files, images, etc.)
 */
export interface MessageAttachment {
  id: string;
  type: 'file' | 'image' | 'document' | 'link';
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
}

/**
 * Message metadata with AI-specific information
 */
export interface MessageMetadata {
  // Citations and sources
  sources?: MessageSource[];
  citations?: number[];

  // Followup suggestions
  followupQuestions?: string[];

  // Performance metrics
  processingTime?: number;
  tokenUsage?: TokenUsage;

  // AI reasoning
  reasoning?: string;
  workflow_step?: string;

  // Model information
  metadata_model?: ModelMetadata;

  // Alternative agents
  alternativeAgents?: AlternativeAgent[];
  selectedAgentConfidence?: number;

  // Error information
  errorMessage?: string;
  errorCode?: string;
}

/**
 * Message source/reference
 */
export interface MessageSource {
  id: string;
  title: string;
  url?: string;
  snippet?: string;
  relevance?: number;
  type?: 'document' | 'web' | 'knowledge_base';
}

/**
 * Token usage information
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost?: number;
}

/**
 * Model metadata
 */
export interface ModelMetadata {
  name: string;
  display_name: string;
  description: string;
  image_url: string | null;
  brain_id: string;
  brain_name: string;
}

/**
 * Alternative agent suggestion
 */
export interface AlternativeAgent {
  agentId: string;
  name: string;
  score: number;
  reason?: string;
}

/**
 * Chat conversation
 */
export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  agentId: string | null;
  messageCount: number;
  lastMessage?: string;
  mode: ChatMode;
  archived?: boolean;
  starred?: boolean;
  tags?: string[];
}

/**
 * Chat interaction mode
 */
export type ChatMode = 'automatic' | 'manual' | 'autonomous';

/**
 * AI Model configuration
 */
export interface AIModel {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: 'openai' | 'anthropic' | 'cohere' | 'local';
  maxTokens: number;
  costPerToken?: number;
  capabilities: string[];
}

/**
 * Chat state for orchestration
 */
export interface ChatState {
  currentTier: 1 | 2 | 3 | 'human';
  escalationHistory: EscalationRecord[];
  autonomousMode: boolean;
  interactionMode: ChatMode;
}

/**
 * Escalation record for tracking tier changes
 */
export interface EscalationRecord {
  timestamp: Date;
  fromTier: number | 'human';
  toTier: number | 'human';
  reason: string;
  messageId?: string;
}

/**
 * Live reasoning state for showing AI thought process
 */
export interface LiveReasoning {
  content: string;
  isActive: boolean;
  steps?: ReasoningStep[];
}

/**
 * Individual reasoning step
 */
export interface ReasoningStep {
  step: number;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp: Date;
}

/**
 * Chat creation payload
 */
export interface CreateChatPayload {
  title?: string;
  agentId?: string;
  mode?: ChatMode;
  initialMessage?: string;
}

/**
 * Message sending options
 */
export interface SendMessageOptions {
  agentId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  attachments?: MessageAttachment[];
  metadata?: Partial<MessageMetadata>;
}

/**
 * Chat filter criteria
 */
export interface ChatFilters {
  search?: string;
  agentId?: string;
  mode?: ChatMode;
  archived?: boolean;
  starred?: boolean;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

// ===========================
// TYPE GUARDS
// ===========================

/**
 * Type guard for ChatMessage
 */
export function isChatMessage(obj: unknown): obj is ChatMessage {
  if (!obj || typeof obj !== 'object') return false;
  const msg = obj as ChatMessage;
  return (
    typeof msg.id === 'string' &&
    typeof msg.content === 'string' &&
    (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') &&
    msg.timestamp instanceof Date
  );
}

/**
 * Type guard for Chat
 */
export function isChat(obj: unknown): obj is Chat {
  if (!obj || typeof obj !== 'object') return false;
  const chat = obj as Chat;
  return (
    typeof chat.id === 'string' &&
    typeof chat.title === 'string' &&
    chat.createdAt instanceof Date &&
    chat.updatedAt instanceof Date
  );
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Create a new user message
 */
export function createUserMessage(
  content: string,
  options?: { id?: string; attachments?: MessageAttachment[] }
): ChatMessage {
  return {
    id: options?.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    content,
    role: 'user',
    timestamp: new Date(),
    isLoading: false,
    error: false,
    attachments: options?.attachments,
  };
}

/**
 * Create a new assistant message
 */
export function createAssistantMessage(
  content: string,
  agentId: string,
  options?: { id?: string; metadata?: MessageMetadata }
): ChatMessage {
  return {
    id: options?.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    content,
    role: 'assistant',
    timestamp: new Date(),
    agentId,
    isLoading: false,
    error: false,
    metadata: options?.metadata,
  };
}

/**
 * Create a new chat
 */
export function createChat(payload: CreateChatPayload): Chat {
  const title = payload.title || payload.initialMessage?.slice(0, 50) || 'New Conversation';

  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    createdAt: new Date(),
    updatedAt: new Date(),
    agentId: payload.agentId || null,
    messageCount: payload.initialMessage ? 1 : 0,
    lastMessage: payload.initialMessage,
    mode: payload.mode || 'automatic',
    archived: false,
    starred: false,
    tags: [],
  };
}

/**
 * Calculate estimated cost for token usage
 */
export function calculateTokenCost(usage: TokenUsage, model: AIModel): number {
  if (!model.costPerToken) return 0;
  return usage.totalTokens * model.costPerToken;
}

/**
 * Format message timestamp
 */
export function formatMessageTime(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return timestamp.toLocaleDateString();
}

/**
 * Generate chat title from first message
 */
export function generateChatTitle(firstMessage: string, maxLength: number = 50): string {
  if (!firstMessage || firstMessage.trim().length === 0) {
    return 'New Conversation';
  }

  const cleaned = firstMessage.trim().replace(/\s+/g, ' ');
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.slice(0, maxLength - 3) + '...';
}

/**
 * Group messages by date
 */
export function groupMessagesByDate(messages: ChatMessage[]): Map<string, ChatMessage[]> {
  const groups = new Map<string, ChatMessage[]>();

  messages.forEach((message) => {
    const dateKey = message.timestamp.toDateString();
    const existing = groups.get(dateKey) || [];
    groups.set(dateKey, [...existing, message]);
  });

  return groups;
}

/**
 * Count tokens in text (rough estimation)
 */
export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Validate message content
 */
export function validateMessageContent(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (content.length > 10000) {
    return { valid: false, error: 'Message too long (max 10,000 characters)' };
  }

  return { valid: true };
}

/**
 * Extract mentioned agent IDs from message
 */
export function extractMentionedAgents(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}

/**
 * Sanitize message content (basic XSS prevention)
 */
export function sanitizeMessageContent(content: string): string {
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
