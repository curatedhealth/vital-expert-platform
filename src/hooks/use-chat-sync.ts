import { useEffect } from 'react';
import { useChatStore } from '@/lib/stores/chat-store';

/**
 * Hook to ensure chat state consistency
 * Fixes state synchronization issues between components
 */
export function useChatSync() {
  const { interactionMode, setInteractionMode, selectedAgent, clearSelectedAgent } = useChatStore();
  
  useEffect(() => {
    // On mount, ensure we have the correct default
    if (!interactionMode || interactionMode === 'manual') {
      console.log('🔧 [useChatSync] Fixing interaction mode on mount');
      setInteractionMode('automatic');
    }
    
    // If in automatic mode but have a selected agent, clear it
    if (interactionMode === 'automatic' && selectedAgent) {
      console.log('🔧 [useChatSync] Clearing selected agent for automatic mode');
      clearSelectedAgent();
    }
  }, []); // Only run once on mount
  
  return { interactionMode };
}
