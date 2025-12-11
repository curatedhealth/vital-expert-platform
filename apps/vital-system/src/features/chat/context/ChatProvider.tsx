'use client';

/**
 * Chat context provider stub
 * TODO: Implement full chat context when chat feature is developed
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Message, Conversation } from '../types/conversation.types';

export interface ChatContextValue {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isLoading: boolean;
  error: Error | null;
  createConversation: (agentId: string) => Promise<Conversation>;
  setActiveConversation: (id: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearConversation: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createConversation = useCallback(async (agentId: string): Promise<Conversation> => {
    setIsLoading(true);
    try {
      const newConversation: Conversation = {
        id: crypto.randomUUID(),
        messages: [],
        agentId,
        sessionId: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setConversations(prev => [...prev, newConversation]);
      setActiveConversationState(newConversation);
      return newConversation;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create conversation');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setActiveConversation = useCallback((id: string) => {
    const conversation = conversations.find(c => c.id === id);
    setActiveConversationState(conversation ?? null);
  }, [conversations]);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!activeConversation) return;

    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    setActiveConversationState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, newMessage],
        updatedAt: new Date(),
      };
    });

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversation.id
          ? { ...c, messages: [...c.messages, newMessage], updatedAt: new Date() }
          : c
      )
    );
  }, [activeConversation]);

  const clearConversation = useCallback(() => {
    setActiveConversationState(null);
  }, []);

  const value: ChatContextValue = {
    conversations,
    activeConversation,
    isLoading,
    error,
    createConversation,
    setActiveConversation,
    addMessage,
    clearConversation,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = (): ChatContextValue => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export default ChatProvider;
