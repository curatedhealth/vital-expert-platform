/**
 * Real-time Collaboration Hook
 * Manages WebSocket connections, typing indicators, and live collaboration features
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import type { Message, CollaborationState, Artifact } from '@/types/chat.types';

import { websocketService } from '../services/websocket-service';

interface CollaborativeUser {
  id: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  lastSeen: Date;
  status?: string;
}

export interface UseRealtimeCollaborationOptions {
  conversationId: string;
  userId?: string;
  enableTypingIndicators?: boolean;
  typingTimeout?: number;
}

export interface RealtimeCollaborationState {
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  activeUsers: CollaborativeUser[];
  typingUsers: string[];
  isTyping: boolean;
  collaborationState: CollaborationState | null;
}

export function useRealtimeCollaboration(options: UseRealtimeCollaborationOptions) {
  const {
    conversationId,
    userId,
    enableTypingIndicators = true,
    typingTimeout = 3000
  } = options;

  // State
  const [state, setState] = useState<RealtimeCollaborationState>({
    connectionStatus: 'disconnected',
    activeUsers: [],
    typingUsers: [],
    isTyping: false,
    collaborationState: null
  });

  // Refs
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingEventRef = useRef<number>(0);

  // Connection management
  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, connectionStatus: 'connecting' }));
      await websocketService.connect(conversationId);
    } catch (error) {
      // console.error('Failed to connect to WebSocket:', error);
      setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
    }
  }, [conversationId]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
  }, []);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!enableTypingIndicators) return;
    const now = Date.now();

    // Throttle typing events (send at most once per second)
    // eslint-disable-next-line security/detect-object-injection
    if (now - lastTypingEventRef.current < 1000) return;

    // eslint-disable-next-line security/detect-object-injection
    lastTypingEventRef.current = now;
    websocketService.startTyping(userId || 'anonymous', conversationId);

    setState(prev => ({ ...prev, isTyping: true }));

    // Clear existing timer
    // eslint-disable-next-line security/detect-object-injection
    if (typingTimerRef.current) {
      // eslint-disable-next-line security/detect-object-injection
      clearTimeout(typingTimerRef.current);
    }

    // Set timer to stop typing
    // eslint-disable-next-line security/detect-object-injection
    typingTimerRef.current = setTimeout(() => {
      stopTyping();
    }, typingTimeout);
  }, [enableTypingIndicators, typingTimeout, userId, conversationId]);

  const stopTyping = useCallback(() => {
    if (!enableTypingIndicators) return;

    websocketService.stopTyping(userId || 'anonymous', conversationId);
    setState(prev => ({ ...prev, isTyping: false }));

    // eslint-disable-next-line security/detect-object-injection
    if (typingTimerRef.current) {
      // eslint-disable-next-line security/detect-object-injection
      clearTimeout(typingTimerRef.current);
      // eslint-disable-next-line security/detect-object-injection
      typingTimerRef.current = null;
    }
  }, [enableTypingIndicators, userId, conversationId]);

  // Message handling
  const sendMessage = useCallback((message: Message) => {
    websocketService.sendMessage(message);
    stopTyping(); // Stop typing when message is sent
  }, [stopTyping]);

  // Collaboration state
  const updateCollaborationState = useCallback((updates: Partial<CollaborationState>) => {
    setState(prev => ({
      ...prev,
      collaborationState: prev.collaborationState
        ? { ...prev.collaborationState, ...updates }
        : null
    }));
    websocketService.updateCollaborationState(updates);
  }, []);

  // Artifact sharing
  const shareArtifact = useCallback((artifact: Artifact) => {
    websocketService.shareArtifact(artifact);
  }, []);

  // Event handlers
  const handleConnectionChange = useCallback((data: any) => {
    setState(prev => ({ ...prev, connectionStatus: data.status }));
  }, []);

  const handleUserJoined = useCallback((data: any) => {
    setState(prev => {
      const updatedUsers = [...prev.activeUsers];
      const existingIndex = updatedUsers.findIndex(u => u.id === data.userId);

      // eslint-disable-next-line security/detect-object-injection
      if (existingIndex >= 0) {
        // Update existing user

        // eslint-disable-next-line security/detect-object-injection
        updatedUsers[existingIndex] = {
          // eslint-disable-next-line security/detect-object-injection
          ...updatedUsers[existingIndex],
          isActive: true,
          status: 'online',
          lastSeen: new Date()
        };
        return { ...prev, activeUsers: updatedUsers };
      } else {
        // Add new user
        const newUser: CollaborativeUser = {
          id: data.userId,
          name: data.userInfo.name || 'Healthcare Professional',
          avatar: data.userInfo.avatar,
          isActive: true,
          status: 'online',
          lastSeen: new Date()
        };
        return { ...prev, activeUsers: [...prev.activeUsers, newUser] };
      }
    });
  }, []);

  const handleUserLeft = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      activeUsers: prev.activeUsers.filter(u => u.id !== data.userId),
      typingUsers: prev.typingUsers.filter(id => id !== data.userId)
    }));
  }, []);

  const handleUserStartedTyping = useCallback((data: any) => {
    if (data.userId === userId) return; // Ignore own typing events

    setState(prev => {
      const updatedUsers = prev.activeUsers.map(user =>
        // eslint-disable-next-line security/detect-object-injection
        user.id === data.userId
          ? { ...user, status: 'typing' as const, lastSeen: new Date() }
          : user
      );

      // eslint-disable-next-line security/detect-object-injection
      const updatedTypingUsers = prev.typingUsers.includes(data.userId)
        ? prev.typingUsers
        : [...prev.typingUsers, data.userId];

      return {
        ...prev,
        activeUsers: updatedUsers,
        typingUsers: updatedTypingUsers
      };
    });
  }, [userId]);

  const handleUserStoppedTyping = useCallback((data: any) => {
    if (data.userId === userId) return; // Ignore own typing events

    setState(prev => {
      const updatedUsers = prev.activeUsers.map(user =>
        // eslint-disable-next-line security/detect-object-injection
        user.id === data.userId
          ? { ...user, status: 'online' as const, lastSeen: new Date() }
          : user
      );

      // eslint-disable-next-line security/detect-object-injection
      const updatedTypingUsers = prev.typingUsers.filter(id => id !== data.userId);

      return {
        ...prev,
        activeUsers: updatedUsers,
        typingUsers: updatedTypingUsers
      };
    });
  }, [userId]);

  const handleCollaborationUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      collaborationState: data
    }));
  }, []);

  const handleMessageReceived = useCallback((data: any) => {
    // Update user's last seen time
    setState(prev => {
      const updatedUsers = prev.activeUsers.map(user =>
        // eslint-disable-next-line security/detect-object-injection
        user.id === data.userId
          ? { ...user, status: 'online' as const, lastSeen: new Date() }
          : user
      );

      return { ...prev, activeUsers: updatedUsers };
    });
  }, []);

  // Setup WebSocket listeners
  useEffect(() => {
    if (!conversationId) return;

    const listeners = {
      'connection_status': handleConnectionChange,
      'user_joined': handleUserJoined,
      'user_left': handleUserLeft,
      'typing_start': handleUserStartedTyping,
      'typing_stop': handleUserStoppedTyping,
      'collaboration_update': handleCollaborationUpdate,
      'message_received': handleMessageReceived
    };

    // Register listeners
    // eslint-disable-next-line security/detect-object-injection
    Object.entries(listeners).forEach(([event, handler]) => {
      // eslint-disable-next-line security/detect-object-injection
      websocketService.on(event as unknown, handler);
    });

    // Auto-connect
    connect();

    return () => {
      // Cleanup listeners
      // eslint-disable-next-line security/detect-object-injection
      Object.entries(listeners).forEach(([event, handler]) => {
        // eslint-disable-next-line security/detect-object-injection
        websocketService.off(event as unknown, handler);
      });

      // Clear typing timer
      // eslint-disable-next-line security/detect-object-injection
      if (typingTimerRef.current) {
        // eslint-disable-next-line security/detect-object-injection
        clearTimeout(typingTimerRef.current);
      }

      // Disconnect
      disconnect();
    };
  }, [
    conversationId,
    connect,
    disconnect,
    handleConnectionChange,
    handleUserJoined,
    handleUserLeft,
    handleUserStartedTyping,
    handleUserStoppedTyping,
    handleCollaborationUpdate,
    handleMessageReceived
  ]);

  // Auto-stop typing on unmount
  useEffect(() => {
    return () => {
      if (state.isTyping) {
        stopTyping();
      }
    };
  }, [state.isTyping, stopTyping]);

  // Utility functions
  const getTypingUserNames = useCallback(() => {
    return state.typingUsers
      .map(userId => {
        // eslint-disable-next-line security/detect-object-injection
        const user = state.activeUsers.find(u => u.id === userId);

        // eslint-disable-next-line security/detect-object-injection
        return user ? user.name.split(' ')[0] : 'Someone';
      })
      .filter(Boolean);
  }, [state.typingUsers, state.activeUsers]);

  const isUserActive = useCallback((userId: string) => {
    // eslint-disable-next-line security/detect-object-injection
    return state.activeUsers.some(user => user.id === userId && user.status !== 'idle');
  }, [state.activeUsers]);

  const getActiveUserCount = useCallback(() => {
    return state.activeUsers.length;
  }, [state.activeUsers]);

  return {
    // State
    ...state,

    // Connection
    connect,
    disconnect,
    isConnected: state.connectionStatus === 'connected',

    // Typing
    startTyping,
    stopTyping,
    typingUsersNames: getTypingUsersNames(),

    // Messages
    sendMessage,

    // Collaboration
    updateCollaborationState,
    shareArtifact,

    // Utilities
    isUserOnline,
    getUserCount,

    // WebSocket service for advanced usage
    websocketService
  };
}