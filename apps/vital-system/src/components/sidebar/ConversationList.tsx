'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  agentType: string;
  unread?: boolean;
}

// Mock data - replace with actual data fetching
const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Clinical Trial Design Discussion',
    lastMessage: 'Let me analyze the FDA requirements for your Phase II trial...',
    timestamp: new Date('2024-01-20T10:30:00'),
    agentType: 'clinical-trial-designer',
    unread: true
  },
  {
    id: '2',
    title: 'Digital Therapeutics Strategy',
    lastMessage: 'The regulatory pathway for DTx approval involves...',
    timestamp: new Date('2024-01-19T15:45:00'),
    agentType: 'digital-therapeutics-expert'
  },
  {
    id: '3',
    title: 'Safety Analysis Review',
    lastMessage: 'Based on the adverse event data, I recommend...',
    timestamp: new Date('2024-01-18T09:15:00'),
    agentType: 'medical-safety-officer'
  }
];

export function ConversationList() {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedId(conversation.id);
    router.push(`/c/${conversation.id}`);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - timestamp.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return timestamp.toLocaleDateString([], { weekday: 'short' });
    } else {
      return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getAgentIcon = (agentType: string) => {
    const iconMap: Record<string, string> = {
      'clinical-trial-designer': '🧪',
      'digital-therapeutics-expert': '📱',
      'medical-safety-officer': '🛡️',
      'fda-regulatory-strategist': '📋',
      'ai-ml-clinical-specialist': '🧠',
      'default': '🤖'
    };
    // eslint-disable-next-line security/detect-object-injection
    return iconMap[agentType] || iconMap.default;
  };

  return (
    <div className="flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-4 border-b border-border">
        <button
          onClick={() => router.push('/chat')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <span className="text-lg">+</span>
          New Chat
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <div className="text-2xl mb-2">💬</div>
            <p className="text-sm text-center">No conversations yet</p>
            <p className="text-xs text-center mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleConversationClick(conversation)}
                className={`w-full text-left p-3 rounded-lg transition-colors group hover:bg-muted/50 ${
                  selectedId === conversation.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Agent Icon */}
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm">
                    {getAgentIcon(conversation.agentType)}
                  </div>

                  {/* Conversation Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-medium truncate ${
                        conversation.unread ? 'text-foreground' : 'text-foreground/80'
                      }`}>
                        {conversation.title}
                      </h4>
                      {conversation.unread && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {conversation.lastMessage}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(conversation.timestamp)}
                      </span>
                      <span className="text-xs text-muted-foreground/60 capitalize">
                        {conversation.agentType.replace(/-/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{conversations.length} conversations</span>
          <button className="hover:text-foreground transition-colors">
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}