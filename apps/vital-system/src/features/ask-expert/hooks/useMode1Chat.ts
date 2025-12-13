'use client';

/**
 * VITAL Platform - Mode 1 Chat Hook
 * 
 * Mode 1: Manual Interactive (Expert Chat)
 * - User MANUALLY selects an expert
 * - Interactive multi-turn conversation
 * - Single expert execution
 * - Target latency: 3-5s per turn
 * 
 * Extends useBaseInteractive with:
 * - Manual expert selection enforcement
 * 
 * Architecture: Mode 2 = Mode 1 + Fusion Auto-Selection
 */

import { useCallback } from 'react';
import {
  useBaseInteractive,
  UseBaseInteractiveOptions,
  BaseInteractiveState,
  BaseInteractiveActions,
  Message,
  Expert,
  SendMessageOptions,
} from './useBaseInteractive';

// Re-export types for consumers
export type { Message, Expert, SendMessageOptions };

// =============================================================================
// TYPES
// =============================================================================

export interface UseMode1ChatOptions {
  conversationId?: string;
  /** Agent ID for the selected expert */
  agentId?: string;
  /** @deprecated Use agentId instead */
  expertId?: string;
  tenantId?: string;
  onError?: (error: Error) => void;
  onMessageComplete?: (message: Message) => void;
  baseUrl?: string;
}

export interface UseMode1ChatReturn extends BaseInteractiveState, BaseInteractiveActions {
  // Mode 1 specific: Expert is required
  isExpertSelected: boolean;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useMode1Chat(options: UseMode1ChatOptions = {}): UseMode1ChatReturn {
  const {
    conversationId,
    agentId,
    expertId, // Deprecated - use agentId
    tenantId,
    onError,
    onMessageComplete,
    baseUrl = '/api/expert',
  } = options;

  // Resolve effective agent ID (agentId takes precedence over deprecated expertId)
  const effectiveAgentId = agentId || expertId;

  // Use base interactive hook with Mode 1 configuration
  const baseHook = useBaseInteractive({
    conversationId,
    agentId: effectiveAgentId,
    tenantId,
    onError,
    onMessageComplete,
    baseUrl,
    mode: 'mode1_manual_interactive',
  });

  // Mode 1 specific: Check if expert is selected
  const isExpertSelected = Boolean(baseHook.selectedExpert || effectiveAgentId);

  // Override sendMessage to enforce expert selection
  const sendMessageWithValidation = useCallback(
    (message: string, sendOptions?: SendMessageOptions) => {
      if (!isExpertSelected) {
        onError?.(new Error('Please select an expert before sending a message'));
        return;
      }
      baseHook.sendMessage(message, sendOptions);
    },
    [baseHook.sendMessage, isExpertSelected, onError]
  );

  return {
    ...baseHook,
    sendMessage: sendMessageWithValidation,
    isExpertSelected,
  };
}

export default useMode1Chat;
