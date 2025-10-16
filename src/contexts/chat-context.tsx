'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useChatStore } from '@/lib/stores/chat-store';

interface ChatContextType {
  chats: Array<{ id: string; title: string; updatedAt: string }>;
  currentChat: { id: string; title: string; updatedAt: string } | null;
  selectedAgentId?: string;
  agents: Array<{ id: string; name: string; avatar: string; description?: string }>;
  allAgents: Array<{ id: string; name: string; avatar: string; description?: string }>;
  // Per-session mode properties
  isAutomaticMode: boolean;
  isAutonomousMode: boolean;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onAgentSelect: (agentId: string) => void;
  onAgentRemove: (agentId: string) => void;
  onAddAgentToLibrary: (agentId: string) => void;
  onUpdateChatMode: (mode: 'automatic' | 'autonomous', value: boolean) => void;
  formatDate: (date: string) => string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const {
    chats,
    currentChat,
    selectedAgent,
    agents,
    getCurrentChatModes,
    updateChatMode,
    createNewChat,
    selectChat,
    setSelectedAgent,
    removeAgentFromLibrary,
    addAgentToLibrary,
  } = useChatStore();

  // Get per-session modes
  const { isAutomaticMode, isAutonomousMode } = getCurrentChatModes();

  const formatDate = (date: string | Date) => {
    if (!date) return '';
    
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return dateObj.toLocaleDateString();
  };

  const handleAgentSelect = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
    }
  };

  const handleAgentRemove = (agentId: string) => {
    removeAgentFromLibrary(agentId);
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null);
    }
  };

  const value: ChatContextType = {
    chats: chats.map(chat => ({
      ...chat,
      updatedAt: chat.updatedAt instanceof Date ? chat.updatedAt.toISOString() : chat.updatedAt
    })),
    currentChat: currentChat ? {
      ...currentChat,
      updatedAt: currentChat.updatedAt instanceof Date ? currentChat.updatedAt.toISOString() : currentChat.updatedAt
    } : null,
    selectedAgentId: selectedAgent?.id,
    agents: agents.filter(agent => agent.id !== 'orchestrator'), // Filter out orchestrator
    allAgents: agents,
    isAutomaticMode,
    isAutonomousMode,
    onNewChat: createNewChat,
    onSelectChat: selectChat,
    onAgentSelect: handleAgentSelect,
    onAgentRemove: handleAgentRemove,
    onAddAgentToLibrary: addAgentToLibrary,
    onUpdateChatMode: updateChatMode,
    formatDate,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
