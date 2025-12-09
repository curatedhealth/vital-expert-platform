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

export { default as VitalAdvancedChatInput } from './VitalAdvancedChatInput';
export { default as VitalNextGenChatInput } from './VitalNextGenChatInput';
export { default as VitalEnhancedMessageDisplay } from './VitalEnhancedMessageDisplay';
export { default as VitalAdvancedStreamingWindow } from './VitalAdvancedStreamingWindow';

// Re-export types
export type {
  // Add type exports as needed
} from './VitalAdvancedChatInput';
