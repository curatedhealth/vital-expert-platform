'use client';

import { EnhancedChatContainer } from '@/components/chat/enhanced-chat-container';

export default function ChatEnhancedPage() {
  return (
    <div className="h-screen flex flex-col">
      <EnhancedChatContainer className="flex-1" />
    </div>
  );
}
