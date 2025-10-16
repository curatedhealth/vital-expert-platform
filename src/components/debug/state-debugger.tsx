'use client';

import { useChatStore } from '@/lib/stores/chat-store';

/**
 * Debug component to display current chat state
 * Only shows in development mode
 */
export function StateDebugger() {
  const state = useChatStore();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="space-y-1">
        <div><strong>Mode:</strong> {state.interactionMode}</div>
        <div><strong>Agent:</strong> {state.selectedAgent?.name || 'None'}</div>
        <div><strong>Loading:</strong> {state.isLoading ? 'Yes' : 'No'}</div>
        <div><strong>Error:</strong> {state.error || 'None'}</div>
        <div><strong>Messages:</strong> {state.messages?.length || 0}</div>
      </div>
      
      <div className="mt-3 space-y-1">
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="w-full px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
        >
          Clear Storage & Reload
        </button>
        
        <button 
          onClick={() => {
            state.setInteractionMode('automatic');
            state.clearSelectedAgent();
          }}
          className="w-full px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
        >
          Force Auto Mode
        </button>
      </div>
    </div>
  );
}
