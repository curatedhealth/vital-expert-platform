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

  // Connection management

    try {
      setState(prev => ({ ...prev, connectionStatus: 'connecting' }));
      await websocketService.connect(conversationId);
    } catch (error) {
      // console.error('Failed to connect to WebSocket:', error);
      setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
    }
  }, [conversationId]);

    websocketService.disconnect();
    setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
  }, []);

  // Typing indicators

    if (!enableTypingIndicators) return;

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
  }, [enableTypingIndicators, typingTimeout]);

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
  }, [enableTypingIndicators]);

  // Message handling

    websocketService.sendMessage(message);
    stopTyping(); // Stop typing when message is sent
  }, [stopTyping]);

  // Collaboration state

    setState(prev => ({
      ...prev,
      collaborationState: prev.collaborationState
        ? { ...prev.collaborationState, ...updates }
        : null
    }));
    websocketService.updateCollaborationState(updates);
  }, []);

  // Artifact sharing

    websocketService.shareArtifact(artifact);
  }, []);

  // Event handlers

    setState(prev => ({ ...prev, connectionStatus: data.status }));
  }, []);

    setState(prev => {

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

    setState(prev => ({
      ...prev,
      activeUsers: prev.activeUsers.filter(u => u.id !== data.userId),
      typingUsers: prev.typingUsers.filter(id => id !== data.userId)
    }));
  }, []);

    if (data.userId === userId) return; // Ignore own typing events

    setState(prev => {

        // eslint-disable-next-line security/detect-object-injection
        user.id === data.userId
          ? { ...user, status: 'typing' as const, lastSeen: new Date() }
          : user
      );

      // eslint-disable-next-line security/detect-object-injection

        ? prev.typingUsers
        : [...prev.typingUsers, data.userId];

      return {
        ...prev,
        activeUsers: updatedUsers,
        typingUsers: updatedTypingUsers
      };
    });
  }, [userId]);

    if (data.userId === userId) return; // Ignore own typing events

    setState(prev => {

        // eslint-disable-next-line security/detect-object-injection
        user.id === data.userId
          ? { ...user, status: 'online' as const, lastSeen: new Date() }
          : user
      );

      // eslint-disable-next-line security/detect-object-injection

      return {
        ...prev,
        activeUsers: updatedUsers,
        typingUsers: updatedTypingUsers
      };
    });
  }, [userId]);

    setState(prev => ({
      ...prev,
      collaborationState: data
    }));
  }, []);

    // Update user's last seen time
    setState(prev => {

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

      'connection_status': handleConnectionStatus,
      'user_joined': handleUserJoined,
      'user_left': handleUserLeft,
      'typing_start': handleTypingStart,
      'typing_stop': handleTypingStop,
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
    handleConnectionStatus,
    handleUserJoined,
    handleUserLeft,
    handleTypingStart,
    handleTypingStop,
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

    return state.typingUsers
      .map(userId => {
        // eslint-disable-next-line security/detect-object-injection

        // eslint-disable-next-line security/detect-object-injection
        return user ? user.name.split(' ')[0] : 'Someone';
      })
      .filter(Boolean);
  }, [state.typingUsers, state.activeUsers]);

    // eslint-disable-next-line security/detect-object-injection
    return state.activeUsers.some(user => user.id === userId && user.status !== 'idle');
  }, [state.activeUsers]);

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