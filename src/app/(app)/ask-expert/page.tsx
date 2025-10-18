'use client';

import { useState, useEffect } from 'react';
import { UnifiedChatSidebar } from '@/components/chat/unified-chat-sidebar';
import { EnhancedChatContainerWithAutonomous } from '@/components/chat/enhanced-chat-container-with-autonomous';
import { useChatStore } from '@/lib/stores/chat-store';

function AskExpertPageContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const {
    syncWithGlobalStore,
    subscribeToGlobalChanges,
  } = useChatStore();

  // Sync with global store on component mount
  useEffect(() => {
    syncWithGlobalStore();

    // Subscribe to global changes
    const unsubscribe = subscribeToGlobalChanges();

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [syncWithGlobalStore, subscribeToGlobalChanges]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Enhanced Sidebar - Same as Chat View */}
      <UnifiedChatSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Chat Container - Same as Chat View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <EnhancedChatContainerWithAutonomous className="h-full" />
      </div>
    </div>
  );
}

export default function AskExpertPage() {
  return <AskExpertPageContent />;
}