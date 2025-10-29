/**
 * Chat History Context
 * Manages chat sessions and messages state
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth/supabase-auth-context';

// ============================================================================
// TYPES
// ============================================================================

export interface ChatSession {
  id: string;
  title: string;
  mode: 'manual' | 'automatic' | 'autonomous' | 'multi-expert';
  agent_id?: string;
  agent_name?: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  message_count: number;
  is_active: boolean;
  metadata?: any;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent_id?: string;
  agent_name?: string;
  mode: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface ChatHistoryContextType {
  // Sessions
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  sessionsLoading: boolean;
  
  // Messages
  messages: ChatMessage[];
  messagesLoading: boolean;
  
  // Actions
  createSession: (title?: string, mode?: string, agentId?: string, agentName?: string) => Promise<ChatSession | null>;
  loadSession: (sessionId: string) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
  
  // Messages
  addMessage: (role: 'user' | 'assistant' | 'system', content: string, metadata?: any) => Promise<void>;
  loadMessages: (sessionId: string) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  
  // Utilities
  clearCurrentSession: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  const createSession = useCallback(async (
    title?: string, 
    mode?: string, 
    agentId?: string, 
    agentName?: string
  ): Promise<ChatSession | null> => {
    if (!user?.id) {
      console.error('❌ [ChatHistory] No user ID available');
      return null;
    }

    try {
      console.log('🆕 [ChatHistory] Creating new session:', { title, mode, agentId });

      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: title || 'New Chat',
          mode: mode || 'manual',
          agentId,
          agentName,
          metadata: {}
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const { session } = await response.json();
      console.log('✅ [ChatHistory] Created session:', session.id);

      // Add to sessions list
      setSessions(prev => [session, ...prev]);
      setCurrentSession(session);
      setMessages([]); // Clear messages for new session

      return session;
    } catch (error) {
      console.error('❌ [ChatHistory] Error creating session:', error);
      return null;
    }
  }, [user?.id]);

  const loadSession = useCallback(async (sessionId: string) => {
    if (!user?.id) return;

    try {
      console.log('📂 [ChatHistory] Loading session:', sessionId);

      // Find session in current list
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
        await loadMessages(sessionId);
        return;
      }

      // If not found, refresh sessions and try again
      await refreshSessions();
      const refreshedSession = sessions.find(s => s.id === sessionId);
      if (refreshedSession) {
        setCurrentSession(refreshedSession);
        await loadMessages(sessionId);
      }
    } catch (error) {
      console.error('❌ [ChatHistory] Error loading session:', error);
    }
  }, [user?.id, sessions]);

  const updateSession = useCallback(async (sessionId: string, updates: Partial<ChatSession>) => {
    try {
      console.log('📝 [ChatHistory] Updating session:', sessionId);

      const response = await fetch('/api/chat/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...updates
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update session: ${response.statusText}`);
      }

      const { session } = await response.json();
      console.log('✅ [ChatHistory] Updated session:', sessionId);

      // Update in sessions list
      setSessions(prev => prev.map(s => s.id === sessionId ? session : s));
      
      // Update current session if it's the one being updated
      if (currentSession?.id === sessionId) {
        setCurrentSession(session);
      }
    } catch (error) {
      console.error('❌ [ChatHistory] Error updating session:', error);
    }
  }, [currentSession?.id]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      console.log('🗑️ [ChatHistory] Deleting session:', sessionId);

      const response = await fetch(`/api/chat/sessions?sessionId=${sessionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete session: ${response.statusText}`);
      }

      console.log('✅ [ChatHistory] Deleted session:', sessionId);

      // Remove from sessions list
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // Clear current session if it's the one being deleted
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ [ChatHistory] Error deleting session:', error);
    }
  }, [currentSession?.id]);

  const refreshSessions = useCallback(async () => {
    if (!user?.id) return;

    setSessionsLoading(true);
    try {
      console.log('🔄 [ChatHistory] Refreshing sessions');

      const response = await fetch(`/api/chat/sessions?userId=${user.id}&limit=50`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }

      const { sessions: fetchedSessions } = await response.json();
      console.log(`✅ [ChatHistory] Loaded ${fetchedSessions?.length || 0} sessions`);
      
      setSessions(fetchedSessions || []);
    } catch (error) {
      console.error('❌ [ChatHistory] Error refreshing sessions:', error);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, [user?.id]);

  // ============================================================================
  // MESSAGE MANAGEMENT
  // ============================================================================

  const addMessage = useCallback(async (
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: any
  ) => {
    if (!currentSession?.id) {
      console.error('❌ [ChatHistory] No current session for adding message');
      return;
    }

    try {
      console.log('💬 [ChatHistory] Adding message to session:', currentSession.id);

      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          role,
          content,
          agentId: currentSession.agent_id,
          agentName: currentSession.agent_name,
          mode: currentSession.mode,
          metadata: metadata || {}
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add message: ${response.statusText}`);
      }

      const { message } = await response.json();
      console.log('✅ [ChatHistory] Added message:', message.id);

      // Add to messages list
      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('❌ [ChatHistory] Error adding message:', error);
    }
  }, [currentSession]);

  const loadMessages = useCallback(async (sessionId: string) => {
    setMessagesLoading(true);
    try {
      console.log('📨 [ChatHistory] Loading messages for session:', sessionId);

      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}&limit=100`);
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const { messages: fetchedMessages } = await response.json();
      console.log(`✅ [ChatHistory] Loaded ${fetchedMessages?.length || 0} messages`);
      
      setMessages(fetchedMessages || []);
    } catch (error) {
      console.error('❌ [ChatHistory] Error loading messages:', error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const updateMessage = useCallback(async (messageId: string, content: string) => {
    try {
      console.log('📝 [ChatHistory] Updating message:', messageId);

      const response = await fetch('/api/chat/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          content
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update message: ${response.statusText}`);
      }

      const { message } = await response.json();
      console.log('✅ [ChatHistory] Updated message:', messageId);

      // Update in messages list
      setMessages(prev => prev.map(m => m.id === messageId ? message : m));
    } catch (error) {
      console.error('❌ [ChatHistory] Error updating message:', error);
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      console.log('🗑️ [ChatHistory] Deleting message:', messageId);

      const response = await fetch(`/api/chat/messages?messageId=${messageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.statusText}`);
      }

      console.log('✅ [ChatHistory] Deleted message:', messageId);

      // Remove from messages list
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('❌ [ChatHistory] Error deleting message:', error);
    }
  }, []);

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const clearCurrentSession = useCallback(() => {
    setCurrentSession(null);
    setMessages([]);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load sessions when user changes
  useEffect(() => {
    if (user?.id) {
      refreshSessions();
    } else {
      setSessions([]);
      setCurrentSession(null);
      setMessages([]);
    }
  }, [user?.id, refreshSessions]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: ChatHistoryContextType = {
    // Sessions
    sessions,
    currentSession,
    sessionsLoading,
    
    // Messages
    messages,
    messagesLoading,
    
    // Actions
    createSession,
    loadSession,
    updateSession,
    deleteSession,
    refreshSessions,
    
    // Messages
    addMessage,
    loadMessages,
    updateMessage,
    deleteMessage,
    
    // Utilities
    clearCurrentSession
  };

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
}
