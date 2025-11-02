/**
 * Server-Sent Events (SSE) Hook
 * Handles real-time streaming from backend AI engine
 */

'use client';

import { useCallback, useRef, useEffect, useState } from 'react';

export interface SSEMessage {
  event: string;
  data: unknown;
  id?: string;
  retry?: number;
}

interface UseSSEOptions {
  url: string;
  headers?: Record<string, string>;
  onMessage?: (message: SSEMessage) => void;
  onOpen?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  enabled?: boolean;
}

interface UseSSEReturn {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  error: Event | null;
}

/**
 * Hook for Server-Sent Events (SSE) connection
 * Provides automatic reconnection and error handling
 */
export function useSSE({
  url,
  headers = {},
  onMessage,
  onOpen,
  onError,
  reconnect = true,
  reconnectDelay = 1000,
  maxReconnectAttempts = 5,
  enabled = true,
}: UseSSEOptions): UseSSEReturn {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsConnected(false);
    }

    try {
      // Create URL with headers as query params (EventSource doesn't support custom headers)
      const urlWithParams = new URL(url);
      Object.entries(headers).forEach(([key, value]) => {
        urlWithParams.searchParams.set(key, value);
      });

      const eventSource = new EventSource(urlWithParams.toString());

      eventSource.onopen = () => {
        console.log('[SSE] Connection opened');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.({
            event: 'message',
            data,
            id: event.lastEventId,
          });
        } catch (err) {
          console.error('[SSE] Failed to parse message:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('[SSE] Connection error:', err);
        setIsConnected(false);
        setError(err);
        onError?.(err);

        // Attempt reconnection
        if (reconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1);
          
          console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('[SSE] Max reconnect attempts reached');
          eventSource.close();
        }
      };

      // Register custom event listeners for panel events
      const panelEvents = [
        'panel_started',
        'expert_speaking',
        'round_started',
        'round_complete',
        'consensus_update',
        'panel_complete',
        'panel_error',
      ];

      panelEvents.forEach((eventType) => {
        eventSource.addEventListener(eventType, (event: Event) => {
          const messageEvent = event as MessageEvent;
          try {
            const data = JSON.parse(messageEvent.data);
            onMessage?.({
              event: eventType,
              data,
              id: messageEvent.lastEventId,
            });
          } catch (err) {
            console.error(`[SSE] Failed to parse ${eventType} event:`, err);
          }
        });
      });

      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error('[SSE] Failed to create EventSource:', err);
      setError(err as Event);
    }
  }, [url, headers, onMessage, onOpen, onError, reconnect, reconnectDelay, maxReconnectAttempts, enabled]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled]); // Only reconnect when enabled changes

  return {
    isConnected,
    connect,
    disconnect,
    error,
  };
}

/**
 * Hook for streaming panel discussion
 * Specialized hook for Ask Panel real-time updates
 */
export interface PanelStreamEvent {
  type: 'started' | 'expert_speaking' | 'round_started' | 'round_complete' | 'consensus' | 'complete' | 'error';
  data: unknown;
}

interface UsePanelStreamOptions {
  panelId: string;
  tenantId: string;
  enabled?: boolean;
  onEvent?: (event: PanelStreamEvent) => void;
}

export function usePanelStream({
  panelId,
  tenantId,
  enabled = true,
  onEvent,
}: UsePanelStreamOptions) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  return useSSE({
    url: `${apiUrl}/api/v1/panels/${panelId}/stream`,
    headers: {
      'X-Tenant-ID': tenantId,
    },
    enabled,
    onMessage: (message) => {
      const eventMap: Record<string, PanelStreamEvent['type']> = {
        panel_started: 'started',
        expert_speaking: 'expert_speaking',
        round_started: 'round_started',
        round_complete: 'round_complete',
        consensus_update: 'consensus',
        panel_complete: 'complete',
        panel_error: 'error',
      };

      const eventType = eventMap[message.event] || message.event as PanelStreamEvent['type'];
      
      onEvent?.({
        type: eventType,
        data: message.data,
      });
    },
    reconnect: true,
    reconnectDelay: 1000,
    maxReconnectAttempts: 5,
  });
}

