/**
 * Validation Schemas - Central export for all validation schemas
 * 
 * This file provides a clean interface for importing validation schemas
 * throughout the application, ensuring consistent data validation.
 */

// Chat validation schemas
export * from './chat.schemas';

// Agent validation schemas
export * from './agent.schemas';

// User validation schemas
export * from './user.schemas';

// Re-export commonly used types
export type {
  ChatRequest,
  ChatResponse,
  AgentSelectionRequest,
  WorkflowRequest,
  ChatMessage,
  Agent
} from './chat.schemas';

export type {
  AgentCreate,
  AgentUpdate,
  AgentQuery,
  AgentRecommendation,
  AgentListQuery,
  AgentResponse,
  AgentListResponse
} from './agent.schemas';

export type {
  UserCreate,
  UserUpdate,
  UserQuery,
  UserPreferencesUpdate,
  UserPermissionsUpdate,
  UserActivityUpdate,
  UserListQuery,
  UserResponse,
  UserListResponse,
  UserLogin,
  UserRegister
} from './user.schemas';
