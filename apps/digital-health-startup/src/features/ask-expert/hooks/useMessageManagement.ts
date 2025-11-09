/**
 * useMessageManagement Hook
 * 
 * Manages all message-related state and operations for Ask Expert
 * - Messages array state
 * - CRUD operations (add, update, delete)
 * - Streaming message state
 * - Message metadata handling
 * - Conversation context
 * 
 * @extracted from ask-expert/page.tsx (3,515 lines → modular hooks)
 */

import { useState, useCallback, useMemo } from 'react';
import type { Message, MessageBranch, Conversation } from '../types';

export interface UseMessageManagementOptions {
  initialMessages?: Message[];
  activeConversationId?: string | null;
}

export interface UseMessageManagementReturn {
  // State
  messages: Message[];
  streamingMessage: string;
  isStreaming: boolean;
  
  // CRUD Operations
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
  
  // Streaming Operations
  setStreamingMessage: (content: string) => void;
  appendStreamingMessage: (chunk: string) => void;
  commitStreamingMessage: (message: Partial<Message>) => string; // Returns message ID
  cancelStreaming: () => void;
  
  // Branch Operations
  addBranch: (messageId: string, branch: MessageBranch) => void;
  switchBranch: (messageId: string, branchIndex: number) => void;
  
  // Query Operations
  getMessageById: (id: string) => Message | undefined;
  getLastMessage: () => Message | undefined;
  getLastAssistantMessage: () => Message | undefined;
  getUserMessages: () => Message[];
  getAssistantMessages: () => Message[];
  
  // Metadata
  totalMessages: number;
  hasMessages: boolean;
  messageCount: { user: number; assistant: number };
}

/**
 * Custom hook for managing message state and operations
 */
export function useMessageManagement(
  options: UseMessageManagementOptions = {}
): UseMessageManagementReturn {
  const { initialMessages = [] } = options;
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [streamingMessage, setStreamingMessageState] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================
  
  /**
   * Add a new message to the messages array
   */
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);
  
  /**
   * Update an existing message by ID
   */
  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, ...updates } : msg
      )
    );
  }, []);
  
  /**
   * Delete a message by ID
   */
  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);
  
  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingMessageState('');
    setIsStreaming(false);
  }, []);
  
  // ============================================================================
  // STREAMING OPERATIONS
  // ============================================================================
  
  /**
   * Set the streaming message content (replace)
   */
  const setStreamingMessage = useCallback((content: string) => {
    setStreamingMessageState(content);
    setIsStreaming(content.length > 0);
  }, []);
  
  /**
   * Append a chunk to the streaming message
   */
  const appendStreamingMessage = useCallback((chunk: string) => {
    setStreamingMessageState(prev => prev + chunk);
    setIsStreaming(true);
  }, []);
  
  /**
   * Commit the streaming message as a permanent message
   * Returns the ID of the created message
   */
  const commitStreamingMessage = useCallback((messageData: Partial<Message>): string => {
    const messageId = messageData.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newMessage: Message = {
      id: messageId,
      role: 'assistant',
      content: streamingMessage,
      timestamp: Date.now(),
      ...messageData,
    };
    
    setMessages(prev => [...prev, newMessage]);
    setStreamingMessageState('');
    setIsStreaming(false);
    
    return messageId;
  }, [streamingMessage]);
  
  /**
   * Cancel streaming and clear the streaming message
   */
  const cancelStreaming = useCallback(() => {
    setStreamingMessageState('');
    setIsStreaming(false);
  }, []);
  
  // ============================================================================
  // BRANCH OPERATIONS
  // ============================================================================
  
  /**
   * Add a branch to a message
   */
  const addBranch = useCallback((messageId: string, branch: MessageBranch) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              branches: [...(msg.branches || []), branch],
            }
          : msg
      )
    );
  }, []);
  
  /**
   * Switch to a different branch for a message
   */
  const switchBranch = useCallback((messageId: string, branchIndex: number) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, currentBranch: branchIndex }
          : msg
      )
    );
  }, []);
  
  // ============================================================================
  // QUERY OPERATIONS
  // ============================================================================
  
  /**
   * Get a message by ID
   */
  const getMessageById = useCallback(
    (id: string): Message | undefined => {
      return messages.find(msg => msg.id === id);
    },
    [messages]
  );
  
  /**
   * Get the last message
   */
  const getLastMessage = useCallback((): Message | undefined => {
    return messages[messages.length - 1];
  }, [messages]);
  
  /**
   * Get the last assistant message
   */
  const getLastAssistantMessage = useCallback((): Message | undefined => {
    return [...messages].reverse().find(msg => msg.role === 'assistant');
  }, [messages]);
  
  /**
   * Get all user messages
   */
  const getUserMessages = useCallback((): Message[] => {
    return messages.filter(msg => msg.role === 'user');
  }, [messages]);
  
  /**
   * Get all assistant messages
   */
  const getAssistantMessages = useCallback((): Message[] => {
    return messages.filter(msg => msg.role === 'assistant');
  }, [messages]);
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const totalMessages = useMemo(() => messages.length, [messages]);
  const hasMessages = useMemo(() => messages.length > 0, [messages]);
  const messageCount = useMemo(() => ({
    user: messages.filter(m => m.role === 'user').length,
    assistant: messages.filter(m => m.role === 'assistant').length,
  }), [messages]);
  
  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    // State
    messages,
    streamingMessage,
    isStreaming,
    
    // CRUD
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    
    // Streaming
    setStreamingMessage,
    appendStreamingMessage,
    commitStreamingMessage,
    cancelStreaming,
    
    // Branches
    addBranch,
    switchBranch,
    
    // Queries
    getMessageById,
    getLastMessage,
    getLastAssistantMessage,
    getUserMessages,
    getAssistantMessages,
    
    // Metadata
    totalMessages,
    hasMessages,
    messageCount,
  };
}


