/**
 * Domain Entities - Central export for all domain entities
 * 
 * This file provides a clean interface for importing domain entities
 * throughout the application, following clean architecture principles.
 */

export { Agent, type QueryIntent } from './agent.entity';
export { Chat, type ChatMessage, type ChatMetadata } from './chat.entity';
export { User, type UserPreferences, type UserPermissions, type UserActivity } from './user.entity';

// Re-export types for convenience
export type {
  QueryIntent,
  ChatMessage,
  ChatMetadata,
  UserPreferences,
  UserPermissions,
  UserActivity
} from './agent.entity';
