import { useEffect } from 'react';
import { useChatStore } from '@/lib/stores/chat-store';

/**
 * Hook to ensure chat state consistency
 * Simplified to only handle essential sync logic for chat state
 */
export function useChatSync() {
  const { currentChat, getCurrentChatModes } = useChatStore();
  
  useEffect(() => {
    // Log current chat modes for debugging
    if (currentChat) {
      const { isAutomaticMode, isAutonomousMode } = getCurrentChatModes();
      console.log('🔧 [useChatSync] Current chat modes:', {
        chatId: currentChat.id,
        isAutomaticMode,
        isAutonomousMode
      });
    }
  }, [currentChat, getCurrentChatModes]);
  
  return { currentChat };
}
