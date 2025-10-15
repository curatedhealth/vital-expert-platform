/**
 * User Validation Schemas - Zod schemas for user API requests
 * 
 * This file contains comprehensive validation schemas for all user-related
 * API requests, ensuring data integrity and security.
 */

import { z } from 'zod';

// Base patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const namePattern = /^[a-zA-Z\s'-]+$/;

// User preferences schema
const UserPreferencesSchema = z.object({
  defaultMode: z.enum(['manual', 'automatic']).default('automatic'),
  preferredAgents: z.array(z.string())
    .max(20, 'Too many preferred agents')
    .optional()
    .default([]),
  notificationSettings: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    chatUpdates: z.boolean().default(true)
  }).default({}),
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  language: z.string()
    .min(2, 'Language code too short')
    .max(10, 'Language code too long')
    .default('en')
}).strict();

// User permissions schema
const UserPermissionsSchema = z.object({
  canCreateAgents: z.boolean().default(false),
  canAccessAdvancedFeatures: z.boolean().default(false),
  canViewAnalytics: z.boolean().default(false),
  canManageUsers: z.boolean().default(false),
  maxConcurrentChats: z.number()
    .int()
    .min(1, 'Max concurrent chats must be at least 1')
    .max(50, 'Max concurrent chats must be at most 50')
    .default(5),
  maxTokensPerMonth: z.number()
    .int()
    .min(1000, 'Max tokens per month must be at least 1000')
    .max(1000000, 'Max tokens per month must be at most 1,000,000')
    .default(100000)
}).strict();

// User activity schema
const UserActivitySchema = z.object({
  lastLogin: z.string().datetime().optional(),
  totalChats: z.number().int().min(0).default(0),
  totalMessages: z.number().int().min(0).default(0),
  totalTokensUsed: z.number().int().min(0).default(0),
  favoriteAgents: z.array(z.string())
    .max(50, 'Too many favorite agents')
    .default([]),
  recentSearches: z.array(z.string())
    .max(100, 'Too many recent searches')
    .default([])
}).strict();

// User creation schema
export const UserCreateSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .max(255, 'Email too long')
    .regex(emailPattern, 'Invalid email format'),
    
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(namePattern, 'Name contains invalid characters'),
    
  preferences: UserPreferencesSchema.optional(),
  permissions: UserPermissionsSchema.optional(),
  activity: UserActivitySchema.optional(),
  
  metadata: z.object({
    source: z.string().max(50).optional(),
    referrer: z.string().max(200).optional(),
    ipAddress: z.string().ip().optional(),
    userAgent: z.string().max(500).optional(),
    timezone: z.string().max(50).optional()
  }).optional()
}).strict();

// User update schema
export const UserUpdateSchema = z.object({
  id: z.string()
    .min(1, 'User ID is required')
    .refine(
      (id) => emailPattern.test(id) || uuidPattern.test(id),
      'User ID must be a valid email or UUID'
    ),
    
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(namePattern, 'Name contains invalid characters')
    .optional(),
    
  preferences: UserPreferencesSchema.partial().optional(),
  permissions: UserPermissionsSchema.partial().optional(),
  activity: UserActivitySchema.partial().optional(),
  
  isActive: z.boolean().optional()
}).strict();

// User query schema
export const UserQuerySchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required')
    .refine(
      (id) => emailPattern.test(id) || uuidPattern.test(id),
      'User ID must be a valid email or UUID'
    ),
    
  includeInactive: z.boolean().default(false),
  
  fields: z.array(z.enum([
    'id', 'email', 'name', 'preferences', 'permissions', 
    'activity', 'isActive', 'createdAt', 'updatedAt'
  ])).optional()
}).strict();

// User preferences update schema
export const UserPreferencesUpdateSchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required')
    .refine(
      (id) => emailPattern.test(id) || uuidPattern.test(id),
      'User ID must be a valid email or UUID'
    ),
    
  preferences: UserPreferencesSchema.partial()
}).strict();

// User permissions update schema
export const UserPermissionsUpdateSchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required')
    .refine(
      (id) => emailPattern.test(id) || uuidPattern.test(id),
      'User ID must be a valid email or UUID'
    ),
    
  permissions: UserPermissionsSchema.partial()
}).strict();

// User activity update schema
export const UserActivityUpdateSchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required')
    .refine(
      (id) => emailPattern.test(id) || uuidPattern.test(id),
      'User ID must be a valid email or UUID'
    ),
    
  activity: UserActivitySchema.partial()
}).strict();

// User list query schema
export const UserListQuerySchema = z.object({
  search: z.string().max(200).optional(),
  
  filters: z.object({
    isActive: z.boolean().optional(),
    permissions: z.object({
      canCreateAgents: z.boolean().optional(),
      canAccessAdvancedFeatures: z.boolean().optional(),
      canViewAnalytics: z.boolean().optional(),
      canManageUsers: z.boolean().optional()
    }).optional(),
    dateRange: z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional()
    }).optional()
  }).optional(),
  
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sort: z.enum(['name', 'email', 'createdAt', 'lastLogin']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc')
  }).optional()
}).strict();

// User response schemas
export const UserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    user: z.object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      preferences: UserPreferencesSchema,
      permissions: UserPermissionsSchema,
      activity: UserActivitySchema,
      isActive: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string()
    }),
    metadata: z.object({
      processingTime: z.number().optional()
    }).optional()
  }).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional()
  }).optional()
}).strict();

export const UserListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    users: z.array(z.object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      isActive: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
      lastLogin: z.string().optional()
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

// Authentication schemas
export const UserLoginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .max(255, 'Email too long')
    .regex(emailPattern, 'Invalid email format'),
    
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
    
  rememberMe: z.boolean().default(false),
  
  metadata: z.object({
    ipAddress: z.string().ip().optional(),
    userAgent: z.string().max(500).optional(),
    deviceId: z.string().max(100).optional()
  }).optional()
}).strict();

export const UserRegisterSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .max(255, 'Email too long')
    .regex(emailPattern, 'Invalid email format'),
    
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(namePattern, 'Name contains invalid characters'),
    
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
    
  confirmPassword: z.string()
    .min(1, 'Password confirmation is required'),
    
  acceptTerms: z.boolean()
    .refine(val => val === true, 'You must accept the terms and conditions'),
    
  metadata: z.object({
    source: z.string().max(50).optional(),
    referrer: z.string().max(200).optional(),
    ipAddress: z.string().ip().optional(),
    userAgent: z.string().max(500).optional()
  }).optional()
}).strict().refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
);

// Type exports
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserQuery = z.infer<typeof UserQuerySchema>;
export type UserPreferencesUpdate = z.infer<typeof UserPreferencesUpdateSchema>;
export type UserPermissionsUpdate = z.infer<typeof UserPermissionsUpdateSchema>;
export type UserActivityUpdate = z.infer<typeof UserActivityUpdateSchema>;
export type UserListQuery = z.infer<typeof UserListQuerySchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserRegister = z.infer<typeof UserRegisterSchema>;

// Validation helper functions
export function validateUserCreate(data: unknown): UserCreate {
  try {
    return UserCreateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`User creation validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function validateUserUpdate(data: unknown): UserUpdate {
  try {
    return UserUpdateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`User update validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function validateUserLogin(data: unknown): UserLogin {
  try {
    return UserLoginSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`User login validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function validateUserRegister(data: unknown): UserRegister {
  try {
    return UserRegisterSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`User registration validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Sanitization helpers
export function sanitizeUserCreate(data: any): Partial<UserCreate> {
  return {
    email: data.email?.trim().toLowerCase(),
    name: data.name?.trim(),
    preferences: data.preferences ? {
      defaultMode: data.preferences.defaultMode,
      preferredAgents: Array.isArray(data.preferences.preferredAgents) 
        ? data.preferences.preferredAgents.filter(Boolean)
        : [],
      notificationSettings: data.preferences.notificationSettings || {},
      theme: data.preferences.theme,
      language: data.preferences.language
    } : undefined
  };
}
