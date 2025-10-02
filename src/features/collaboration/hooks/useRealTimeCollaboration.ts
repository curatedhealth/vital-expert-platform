import { useState, useEffect, useCallback, useRef } from 'react';

export interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  isOnline: boolean;
  lastSeen: Date;
  cursor?: {
    x: number;
    y: number;
    messageId?: string;
  };
}

export interface CollaborationEvent {
  type: 'user_joined' | 'user_left' | 'message_added' | 'cursor_moved' | 'typing_start' | 'typing_stop';
  userId: string;
  data?: any;
  timestamp: Date;
}

interface UseRealTimeCollaborationOptions {
  conversationId: string;
  userId: string;
  userName: string;
  onUserJoined?: (user: CollaborationUser) => void;
  onUserLeft?: (userId: string) => void;
  onNewMessage?: (message: unknown) => void;
  onTypingChanged?: (userId: string, isTyping: boolean) => void;
}

export function useRealTimeCollaboration(options: UseRealTimeCollaborationOptions) {
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);

    try {

        ? 'ws://localhost:3000'
        : `wss://${window.location.host}`;

      ws.onopen = () => {
        // setIsConnected(true);

        // Send heartbeat every 30 seconds
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data: CollaborationEvent = JSON.parse(event.data);
          handleCollaborationEvent(data);
        } catch (error) {
          // console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        // setIsConnected(false);

        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
          heartbeatRef.current = null;
        }

        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (!webSocketRef.current || webSocketRef.current.readyState === WebSocket.CLOSED) {
            connectWebSocket();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        // console.error('WebSocket error:', error);
      };

      webSocketRef.current = ws;
    } catch (error) {
      // console.error('Failed to connect WebSocket:', error);
    }
  }, [options.conversationId, options.userId, options.userName]);

    switch (event.type) {
      case 'user_joined':
        const newUser: CollaborationUser = {
          id: event.userId,
          name: event.data.userName,
          role: event.data.role || 'viewer',
          isOnline: true,
          lastSeen: event.timestamp
        };

        setUsers(prev => {

          if (existing) {
            return prev.map(u => u.id === event.userId ? { ...u, isOnline: true, lastSeen: event.timestamp } : u);
          }
          return [...prev, newUser];
        });

        options.onUserJoined?.(newUser);
        break;

      case 'user_left':
        setUsers(prev => prev.map(u =>
          u.id === event.userId
            ? { ...u, isOnline: false, lastSeen: event.timestamp }
            : u
        ));
        options.onUserLeft?.(event.userId);
        break;

      case 'message_added':
        options.onNewMessage?.(event.data);
        break;

      case 'cursor_moved':
        setUsers(prev => prev.map(u =>
          u.id === event.userId
            ? { ...u, cursor: event.data.cursor }
            : u
        ));
        break;

      case 'typing_start':
        setTypingUsers(prev => new Set([...prev, event.userId]));
        options.onTypingChanged?.(event.userId, true);
        break;

      case 'typing_stop':
        setTypingUsers(prev => {

          newSet.delete(event.userId);
          return newSet;
        });
        options.onTypingChanged?.(event.userId, false);
        break;
    }
  }, [options]);

    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      const event: CollaborationEvent = {
        type: type as unknown,
        userId: options.userId,
        data,
        timestamp: new Date()
      };

      webSocketRef.current.send(JSON.stringify(event));
    }
  }, [options.userId]);

    sendEvent('message_added', message);
  }, [sendEvent]);

    sendEvent('cursor_moved', { cursor: { x, y, messageId } });
  }, [sendEvent]);

    sendEvent('typing_start');

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [sendEvent]);

    sendEvent('typing_stop');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [sendEvent]);

    try {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: options.conversationId,
          email,
          role
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }

      return await response.json();
    } catch (error) {
      // console.error('Error inviting user:', error);
      throw error;
    }
  }, [options.conversationId]);

  // Connect on mount
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  return {
    users,
    typingUsers: Array.from(typingUsers),
    isConnected,
    broadcastMessage,
    updateCursor,
    startTyping,
    stopTyping,
    inviteUser,
    reconnect: connectWebSocket,
  };
}