/**
 * Chat Validation Schemas - Zod schemas for chat API requests
 * 
 * This file contains comprehensive validation schemas for all chat-related
 * API requests, ensuring data integrity and security.
 */

import { z } from 'zod';

// Base validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const agentIdPattern = /^agent-[a-zA-Z0-9-_]+$/;

// Common validation schemas
const AgentSchema = z.object({
  id: z.string()
    .min(1, 'Agent ID is required')
    .regex(agentIdPattern, 'Invalid agent ID format'),
  name: z.string()
    .min(1, 'Agent name is required')
    .max(100, 'Agent name too long'),
  display_name: z.string()
    .min(1, 'Agent display name is required')
    .max(100, 'Agent display name too long')
    .optional(),
  system_prompt: z.string()
    .min(10, 'System prompt too short')
    .max(10000, 'System prompt too long'),
  tier: z.number()
    .int()
    .min(1, 'Invalid tier')
    .max(3, 'Invalid tier'),
  capabilities: z.array(z.string())
    .min(1, 'Agent must have at least one capability')
    .max(20, 'Too many capabilities'),
  knowledge_domains: z.array(z.string())
    .min(1, 'Agent must have at least one knowledge domain')
    .max(10, 'Too many knowledge domains'),
  model: z.string()
    .min(1, 'Model is required')
    .max(50, 'Model name too long'),
  temperature: z.number()
    .min(0, 'Temperature must be >= 0')
    .max(2, 'Temperature must be <= 2'),
  max_tokens: z.number()
    .int()
    .min(1, 'Max tokens must be >= 1')
    .max(8000, 'Max tokens must be <= 8000'),
  rag_enabled: z.boolean()
}).strict();

const ChatMessageSchema = z.object({
  id: z.string()
    .min(1, 'Message ID is required')
    .optional(),
  content: z.string()
    .min(1, 'Message content is required')
    .max(4000, 'Message content too long'),
  role: z.enum(['user', 'assistant', 'system'], {
    errorMap: () => ({ message: 'Invalid message role' })
  }),
  timestamp: z.string()
    .datetime()
    .optional(),
  agent_id: z.string()
    .regex(agentIdPattern, 'Invalid agent ID format')
    .optional(),
  metadata: z.object({
    citations: z.array(z.string()).optional(),
    sources: z.array(z.string()).optional(),
    reasoning: z.string().optional(),
    token_usage: z.object({
      prompt_tokens: z.number().int().min(0),
      completion_tokens: z.number().int().min(0),
      total_tokens: z.number().int().min(0)
    }).optional(),
    processing_time: z.number().min(0).optional(),
    workflow_step: z.string().optional()
  }).optional(),
  attachments: z.array(z.unknown()).optional(),
  is_loading: z.boolean().optional()
}).strict();

// Main chat request schema
export const ChatRequestSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message too long')
    .refine(
      (msg) => msg.trim().length > 0,
      'Message cannot be only whitespace'
    ),
    
  userId: z.string()
    .min(1, 'User ID is required')
    .refine(
      (id) => emailPattern.test(id) || uuidPattern.test(id),
      'User ID must be a valid email or UUID'
    ),
    
  sessionId: z.string()
    .uuid('Invalid session ID format')
    .optional()
    .default(() => crypto.randomUUID()),
    
  agent: AgentSchema.nullable().optional(),
  
  interactionMode: z.enum(['manual', 'automatic'], {
    errorMap: () => ({ message: 'Invalid interaction mode' })
  }).default('automatic'),
  
  autonomousMode: z.boolean().default(false),
  
  selectedTools: z.array(z.string())
    .max(10, 'Too many tools selected')
    .optional()
    .default([]),
    
  chatHistory: z.array(ChatMessageSchema)
    .max(100, 'Chat history too long')
    .optional()
    .default([]),
    
  context: z.object({
    urgency: z.enum(['low', 'medium', 'high']).optional(),
    complexity: z.enum(['low', 'medium', 'high']).optional(),
    domain: z.string().max(50).optional(),
    user_preferences: z.object({
      preferred_agents: z.array(z.string()).optional(),
      avoid_agents: z.array(z.string()).optional()
    }).optional()
  }).optional(),
  
  metadata: z.object({
    source: z.string().max(50).optional(),
    version: z.string().max(20).optional(),
    client_info: z.object({
      user_agent: z.string().max(500).optional(),
      platform: z.string().max(50).optional(),
      version: z.string().max(20).optional()
    }).optional()
  }).optional()
}).strict();

// Chat response schema
export const ChatResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    response: z.string(),
    agent: AgentSchema.nullable(),
    processing_time: z.number().min(0),
    token_usage: z.object({
      prompt_tokens: z.number().int().min(0),
      completion_tokens: z.number().int().min(0),
      total_tokens: z.number().int().min(0)
    }),
    metadata: z.object({
      reasoning: z.array(z.string()).optional(),
      sources: z.array(z.string()).optional(),
      citations: z.array(z.string()).optional(),
      workflow_step: z.string().optional()
    }).optional()
  }).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional()
  }).optional()
}).strict();

// Agent selection request schema
export const AgentSelectionRequestSchema = z.object({
  query: z.string()
    .min(1, 'Query is required')
    .max(1000, 'Query too long'),
    
  userId: z.string()
    .min(1, 'User ID is required')
    .refine(
      (id) => emailPattern.test(id) || uuidPattern.test(id),
      'User ID must be a valid email or UUID'
    ),
    
  context: z.object({
    chat_history: z.array(ChatMessageSchema).optional(),
    user_preferences: z.object({
      preferred_agents: z.array(z.string()).optional(),
      avoid_agents: z.array(z.string()).optional()
    }).optional(),
    current_mode: z.enum(['manual', 'automatic']).optional(),
    urgency: z.enum(['low', 'medium', 'high']).optional(),
    complexity: z.enum(['low', 'medium', 'high']).optional()
  }).optional(),
  
  available_agents: z.array(z.string())
    .min(1, 'At least one agent must be available')
    .max(50, 'Too many agents')
    .optional()
}).strict();

// Workflow request schema
export const WorkflowRequestSchema = z.object({
  query: z.string()
    .min(1, 'Query is required')
    .max(1000, 'Query too long'),
    
  agent: AgentSchema.nullable().optional(),
  
  mode: z.object({
    selection: z.enum(['manual', 'automatic']),
    interaction: z.enum(['interactive', 'autonomous'])
  }),
  
  context: z.record(z.unknown()).optional(),
  
  userId: z.string()
    .min(1, 'User ID is required')
    .refine(
      (id) => emailPattern.test(id) || uuidPattern.test(id),
      'User ID must be a valid email or UUID'
    ),
    
  sessionId: z.string()
    .uuid('Invalid session ID format')
    .optional(),
    
  chatHistory: z.array(ChatMessageSchema)
    .max(100, 'Chat history too long')
    .optional()
}).strict();

// Validation middleware schemas
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort: z.string().max(50).optional(),
  order: z.enum(['asc', 'desc']).default('desc')
});

export const SearchSchema = z.object({
  query: z.string().min(1).max(200).optional(),
  filters: z.record(z.unknown()).optional(),
  pagination: PaginationSchema.optional()
});

// Type exports
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type AgentSelectionRequest = z.infer<typeof AgentSelectionRequestSchema>;
export type WorkflowRequest = z.infer<typeof WorkflowRequestSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type Agent = z.infer<typeof AgentSchema>;

// Validation helper functions
export function validateChatRequest(data: unknown): ChatRequest {
  try {
    return ChatRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function validateChatResponse(data: unknown): ChatResponse {
  try {
    return ChatResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Response validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function validateAgentSelectionRequest(data: unknown): AgentSelectionRequest {
  try {
    return AgentSelectionRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Agent selection validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function validateWorkflowRequest(data: unknown): WorkflowRequest {
  try {
    return WorkflowRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Workflow validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Sanitization helpers
export function sanitizeChatRequest(data: any): Partial<ChatRequest> {
  return {
    message: data.message?.trim(),
    userId: data.userId?.trim(),
    sessionId: data.sessionId?.trim(),
    agent: data.agent ? {
      ...data.agent,
      name: data.agent.name?.trim(),
      display_name: data.agent.display_name?.trim(),
      system_prompt: data.agent.system_prompt?.trim()
    } : null,
    interactionMode: data.interactionMode,
    autonomousMode: Boolean(data.autonomousMode),
    selectedTools: Array.isArray(data.selectedTools) ? data.selectedTools.filter(Boolean) : [],
    chatHistory: Array.isArray(data.chatHistory) ? data.chatHistory : []
  };
}
