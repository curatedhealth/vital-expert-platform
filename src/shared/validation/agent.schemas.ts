/**
 * Agent Validation Schemas - Zod schemas for agent API requests
 * 
 * This file contains comprehensive validation schemas for all agent-related
 * API requests, ensuring data integrity and security.
 */

import { z } from 'zod';

// Base patterns
const agentIdPattern = /^agent-[a-zA-Z0-9-_]+$/;
const capabilityPattern = /^[a-zA-Z0-9\s-_]+$/;
const domainPattern = /^[a-zA-Z0-9\s-_]+$/;

// Agent creation/update schema
export const AgentCreateSchema = z.object({
  name: z.string()
    .min(1, 'Agent name is required')
    .max(100, 'Agent name too long')
    .regex(/^[a-zA-Z0-9\s-_]+$/, 'Agent name contains invalid characters'),
    
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name too long'),
    
  description: z.string()
    .min(10, 'Description too short')
    .max(500, 'Description too long'),
    
  systemPrompt: z.string()
    .min(50, 'System prompt too short')
    .max(10000, 'System prompt too long')
    .refine(
      (prompt) => prompt.trim().length >= 50,
      'System prompt must have meaningful content'
    ),
    
  capabilities: z.array(z.string())
    .min(1, 'Agent must have at least one capability')
    .max(20, 'Too many capabilities')
    .refine(
      (caps) => caps.every(cap => capabilityPattern.test(cap)),
      'Invalid capability format'
    ),
    
  knowledgeDomains: z.array(z.string())
    .min(1, 'Agent must have at least one knowledge domain')
    .max(10, 'Too many knowledge domains')
    .refine(
      (domains) => domains.every(domain => domainPattern.test(domain)),
      'Invalid knowledge domain format'
    ),
    
  tier: z.number()
    .int()
    .min(1, 'Tier must be at least 1')
    .max(3, 'Tier must be at most 3'),
    
  model: z.string()
    .min(1, 'Model is required')
    .max(50, 'Model name too long')
    .regex(/^[a-zA-Z0-9-_.]+$/, 'Invalid model name format'),
    
  temperature: z.number()
    .min(0, 'Temperature must be >= 0')
    .max(2, 'Temperature must be <= 2')
    .multipleOf(0.1, 'Temperature must be in 0.1 increments'),
    
  maxTokens: z.number()
    .int()
    .min(1, 'Max tokens must be >= 1')
    .max(8000, 'Max tokens must be <= 8000'),
    
  ragEnabled: z.boolean(),
  
  metadata: z.object({
    tags: z.array(z.string().max(30)).max(10).optional(),
    category: z.string().max(50).optional(),
    version: z.string().max(20).optional(),
    author: z.string().max(100).optional(),
    license: z.string().max(50).optional()
  }).optional()
}).strict();

// Agent update schema (partial)
export const AgentUpdateSchema = AgentCreateSchema.partial().extend({
  id: z.string()
    .min(1, 'Agent ID is required')
    .regex(agentIdPattern, 'Invalid agent ID format')
}).strict();

// Agent query schema
export const AgentQuerySchema = z.object({
  query: z.string()
    .min(1, 'Query is required')
    .max(1000, 'Query too long'),
    
  userId: z.string()
    .min(1, 'User ID is required'),
    
  context: z.object({
    chatHistory: z.array(z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().max(4000)
    })).max(100).optional(),
    
    userPreferences: z.object({
      preferredAgents: z.array(z.string()).max(20).optional(),
      avoidAgents: z.array(z.string()).max(20).optional(),
      complexity: z.enum(['low', 'medium', 'high']).optional(),
      urgency: z.enum(['low', 'medium', 'high']).optional()
    }).optional(),
    
    mode: z.enum(['manual', 'automatic']).optional()
  }).optional(),
  
  availableAgents: z.array(z.string())
    .max(50, 'Too many agents')
    .optional()
}).strict();

// Agent scoring schema
export const AgentScoringSchema = z.object({
  agentId: z.string()
    .min(1, 'Agent ID is required')
    .regex(agentIdPattern, 'Invalid agent ID format'),
    
  query: z.string()
    .min(1, 'Query is required')
    .max(1000, 'Query too long'),
    
  factors: z.object({
    capabilityMatch: z.number().min(0).max(1),
    domainExpertise: z.number().min(0).max(1),
    performanceScore: z.number().min(0).max(1),
    userPreference: z.number().min(0).max(1),
    availability: z.number().min(0).max(1)
  }),
  
  context: z.object({
    userHistory: z.array(z.unknown()).max(1000).optional(),
    currentMode: z.enum(['manual', 'automatic']).optional(),
    urgency: z.enum(['low', 'medium', 'high']).optional()
  }).optional()
}).strict();

// Agent recommendation schema
export const AgentRecommendationSchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required'),
    
  query: z.string()
    .min(1, 'Query is required')
    .max(1000, 'Query too long')
    .optional(),
    
  count: z.number()
    .int()
    .min(1, 'Count must be at least 1')
    .max(10, 'Count must be at most 10')
    .default(3),
    
  filters: z.object({
    tiers: z.array(z.number().int().min(1).max(3)).optional(),
    capabilities: z.array(z.string()).max(20).optional(),
    domains: z.array(z.string()).max(10).optional(),
    ragEnabled: z.boolean().optional()
  }).optional(),
  
  context: z.object({
    userHistory: z.array(z.unknown()).max(1000).optional(),
    preferences: z.object({
      preferredAgents: z.array(z.string()).max(20).optional(),
      avoidAgents: z.array(z.string()).max(20).optional()
    }).optional()
  }).optional()
}).strict();

// Agent list query schema
export const AgentListQuerySchema = z.object({
  search: z.string().max(200).optional(),
  
  filters: z.object({
    tiers: z.array(z.number().int().min(1).max(3)).optional(),
    capabilities: z.array(z.string()).max(20).optional(),
    domains: z.array(z.string()).max(10).optional(),
    ragEnabled: z.boolean().optional(),
    tags: z.array(z.string()).max(10).optional()
  }).optional(),
  
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sort: z.enum(['name', 'tier', 'createdAt', 'updatedAt']).default('name'),
    order: z.enum(['asc', 'desc']).default('asc')
  }).optional(),
  
  userId: z.string().min(1, 'User ID is required').optional()
}).strict();

// Agent response schemas
export const AgentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    agent: z.object({
      id: z.string(),
      name: z.string(),
      displayName: z.string(),
      description: z.string(),
      tier: z.number(),
      capabilities: z.array(z.string()),
      knowledgeDomains: z.array(z.string()),
      model: z.string(),
      temperature: z.number(),
      maxTokens: z.number(),
      ragEnabled: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string()
    }),
    metadata: z.object({
      processingTime: z.number().optional(),
      score: z.number().optional(),
      reasoning: z.string().optional()
    }).optional()
  }).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional()
  }).optional()
}).strict();

export const AgentListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    agents: z.array(z.object({
      id: z.string(),
      name: z.string(),
      displayName: z.string(),
      description: z.string(),
      tier: z.number(),
      capabilities: z.array(z.string()),
      knowledgeDomains: z.array(z.string()),
      ragEnabled: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string()
    })),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number()
    }),
    metadata: z.object({
      processingTime: z.number().optional(),
      totalCount: z.number().optional()
    }).optional()
  }).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional()
  }).optional()
}).strict();

// Type exports
export type AgentCreate = z.infer<typeof AgentCreateSchema>;
export type AgentUpdate = z.infer<typeof AgentUpdateSchema>;
export type AgentQuery = z.infer<typeof AgentQuerySchema>;
export type AgentScoring = z.infer<typeof AgentScoringSchema>;
export type AgentRecommendation = z.infer<typeof AgentRecommendationSchema>;
export type AgentListQuery = z.infer<typeof AgentListQuerySchema>;
export type AgentResponse = z.infer<typeof AgentResponseSchema>;
export type AgentListResponse = z.infer<typeof AgentListResponseSchema>;

// Validation helper functions
export function validateAgentCreate(data: unknown): AgentCreate {
  try {
    return AgentCreateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Agent creation validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function validateAgentUpdate(data: unknown): AgentUpdate {
  try {
    return AgentUpdateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Agent update validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function validateAgentQuery(data: unknown): AgentQuery {
  try {
    return AgentQuerySchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Agent query validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function validateAgentRecommendation(data: unknown): AgentRecommendation {
  try {
    return AgentRecommendationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Agent recommendation validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Sanitization helpers
export function sanitizeAgentCreate(data: any): Partial<AgentCreate> {
  return {
    name: data.name?.trim(),
    displayName: data.displayName?.trim(),
    description: data.description?.trim(),
    systemPrompt: data.systemPrompt?.trim(),
    capabilities: Array.isArray(data.capabilities) 
      ? data.capabilities.map((cap: string) => cap?.trim()).filter(Boolean)
      : [],
    knowledgeDomains: Array.isArray(data.knowledgeDomains)
      ? data.knowledgeDomains.map((domain: string) => domain?.trim()).filter(Boolean)
      : [],
    tier: Number(data.tier),
    model: data.model?.trim(),
    temperature: Number(data.temperature),
    maxTokens: Number(data.maxTokens),
    ragEnabled: Boolean(data.ragEnabled)
  };
}
