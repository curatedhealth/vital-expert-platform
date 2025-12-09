'use client';

/**
 * VITAL Platform - Mode 2 Chat Hook
 * 
 * Mode 2: Auto Interactive (Smart Copilot)
 * - System AUTOMATICALLY selects expert team via Fusion Intelligence
 * - Interactive multi-turn conversation
 * - Multi-expert synthesis
 * - Target latency: 5-15s per turn (includes fusion)
 * 
 * Extends useBaseInteractive with:
 * - Fusion Intelligence auto-selection
 * - Team visualization support
 * 
 * Architecture: Mode 2 = Mode 1 + Fusion Auto-Selection
 */

import { useCallback, useState } from 'react';
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

export interface UseMode2ChatOptions {
  conversationId?: string;
  tenantId?: string;
  onError?: (error: Error) => void;
  onMessageComplete?: (message: Message) => void;
  onFusionComplete?: (experts: Expert[]) => void;
  baseUrl?: string;
  // Mode 2 specific options
  maxExperts?: number;
  fusionThreshold?: number;
}

export interface UseMode2ChatReturn extends BaseInteractiveState, BaseInteractiveActions {
  // Mode 2 specific: Fusion state
  isFusionRunning: boolean;
  fusionExperts: Expert[];
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useMode2Chat(options: UseMode2ChatOptions = {}): UseMode2ChatReturn {
  const {
    conversationId,
    tenantId,
    onError,
    onMessageComplete,
    onFusionComplete,
    baseUrl = '/api/expert',
    maxExperts = 3,
    fusionThreshold = 0.7,
  } = options;

  // Mode 2 specific state
  const [isFusionRunning, setIsFusionRunning] = useState(false);
  const [fusionExperts, setFusionExperts] = useState<Expert[]>([]);

  // Handle fusion completion
  const handleFusionComplete = useCallback((experts: Expert[]) => {
    setFusionExperts(experts);
    setIsFusionRunning(false);
    onFusionComplete?.(experts);
  }, [onFusionComplete]);

  // Use base interactive hook with Mode 2 configuration
  const baseHook = useBaseInteractive({
    conversationId,
    tenantId,
    onError,
    onMessageComplete,
    onFusionComplete: handleFusionComplete,
    baseUrl,
    mode: 'mode2_auto_interactive',
  });

  // Override sendMessage to track fusion state
  const sendMessageWithFusion = useCallback(
    (message: string, sendOptions?: SendMessageOptions) => {
      setIsFusionRunning(true);
      setFusionExperts([]); // Reset for new query
      
      // Add Mode 2 specific options
      const enhancedOptions: SendMessageOptions = {
        ...sendOptions,
        // Mode 2 can pass additional fusion config via options
      };
      
      baseHook.sendMessage(message, enhancedOptions);
    },
    [baseHook.sendMessage]
  );

  return {
    ...baseHook,
    sendMessage: sendMessageWithFusion,
    // Mode 2 specific
    isFusionRunning,
    fusionExperts,
  };
}

export default useMode2Chat;
