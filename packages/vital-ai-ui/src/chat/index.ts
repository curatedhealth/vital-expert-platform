/**
 * Domain J: Advanced Chat Components
 * 
 * Enhanced chat input and display components.
 * Shared across: Ask Expert, Ask Panel, any conversational AI service
 * 
 * Components:
 * - VitalAdvancedChatInput: Enhanced chat input with attachments
 * - VitalNextGenChatInput: Next-gen input with voice/media
 * - VitalEnhancedMessageDisplay: Rich message display
 * - VitalAdvancedStreamingWindow: Streaming output with controls
 */

// Re-export with Vital prefix for consistency
export { AdvancedChatInput } from './VitalAdvancedChatInput';
export { NextGenChatInput } from './VitalNextGenChatInput';
export { EnhancedMessageDisplay } from './VitalEnhancedMessageDisplay';
export { AdvancedStreamingWindow } from './VitalAdvancedStreamingWindow';

// Alias exports for backward compatibility
export { AdvancedChatInput as VitalAdvancedChatInput } from './VitalAdvancedChatInput';
export { NextGenChatInput as VitalNextGenChatInput } from './VitalNextGenChatInput';
export { EnhancedMessageDisplay as VitalEnhancedMessageDisplay } from './VitalEnhancedMessageDisplay';
export { AdvancedStreamingWindow as VitalAdvancedStreamingWindow } from './VitalAdvancedStreamingWindow';

// Re-export types
export type {
  // Add type exports as needed
} from './VitalAdvancedChatInput';
