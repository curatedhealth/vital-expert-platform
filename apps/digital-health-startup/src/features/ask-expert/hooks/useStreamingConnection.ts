/**
 * useStreamingConnection Hook
 * 
 * Manages SSE (Server-Sent Events) connection for real-time AI streaming
 * - Connection lifecycle (connect, disconnect, reconnect)
 * - Event parsing and routing
 * - Reconnection logic with exponential backoff
 * - Connection status tracking
 * - Error handling
 * 
 * @extracted from ask-expert/page.tsx
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { SSEEvent, ConnectionStatus } from '../types';
import { parseSSEChunk } from '../utils';
import { parseLangGraphEvent } from '../utils/parseLangGraphEvent';

export interface UseStreamingConnectionOptions {
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  reconnectDelayMultiplier?: number;
  maxReconnectDelay?: number;
}

export interface UseStreamingConnectionReturn {
  // Connection State
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  isReconnecting: boolean;
  
  // Connection Control
  connect: (endpoint: string, payload: any) => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  
  // Event Handling
  onEvent: (eventType: string, handler: (data: any) => void) => void;
  offEvent: (eventType: string) => void;
  
  // Error Handling
  lastError: string | null;
  clearError: () => void;
}

/**
 * Custom hook for managing SSE streaming connections
 */
export function useStreamingConnection(
  options: UseStreamingConnectionOptions = {}
): UseStreamingConnectionReturn {
  const {
    maxReconnectAttempts = 3,
    reconnectDelay = 1000,
    reconnectDelayMultiplier = 2,
    maxReconnectDelay = 10000,
  } = options;
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isReconnecting: false,
    reconnectAttempts: 0,
    maxReconnectAttempts,
  });
  
  const [lastError, setLastError] = useState<string | null>(null);
  
  // ============================================================================
  // REFS (for cleanup and event handling)
  // ============================================================================
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const eventHandlersRef = useRef<Map<string, (data: any) => void>>(new Map());
  const currentEndpointRef = useRef<string | null>(null);
  const currentPayloadRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // ============================================================================
  // CONNECTION CONTROL
  // ============================================================================
  
  /**
   * Connect to SSE endpoint
   */
  const connect = useCallback(
    async (endpoint: string, payload: any): Promise<void> => {
      // Clean up existing connection
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Store for reconnection
      currentEndpointRef.current = endpoint;
      currentPayloadRef.current = payload;
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      // Update status
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: false,
        isReconnecting: false,
      }));
      setLastError(null);
      
      try {
        console.log('[useStreamingConnection] Connecting to:', endpoint);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify(payload),
          signal: abortControllerRef.current.signal,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        if (!response.body) {
          throw new Error('Response body is null');
        }
        
        // Connected successfully
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: true,
          isReconnecting: false,
          reconnectAttempts: 0,
        }));
        
        // Start reading stream
        const reader = response.body.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder();
        
        let buffer = '';
        
        while (true) {
          const { value, done } = await reader.read();
          
          if (done) {
            console.log('[useStreamingConnection] Stream complete');
            break;
          }
          
          // Decode chunk
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          // 🔍 DEBUG: Log raw chunk
          console.log('[🔍 DEBUG] Raw chunk received:', chunk.substring(0, 100));
          
          // Parse SSE events
          const events = parseSSEChunk(buffer);
          
          // 🔍 DEBUG: Log parsed events count
          console.log(`[🔍 DEBUG] Parsed ${events.length} events from buffer`);
          if (events.length > 0) {
            console.log('[🔍 DEBUG] First event:', events[0]);
          }
          
          // Process each event
          for (const event of events) {
            // 🔍 DEBUG: Log event data
            console.log('[🔍 DEBUG] Processing event:', event.event, 'Data:', typeof event.data === 'string' ? event.data.substring(0, 50) : event.data);
            
            // Try to parse as LangGraph event first (backend format)
            const langGraphEvent = parseLangGraphEvent(event.data);
            
            // 🔍 DEBUG: Log LangGraph parsing result
            if (langGraphEvent) {
              console.log(`[useStreamingConnection] ✅ LangGraph event: ${langGraphEvent.eventType}`, langGraphEvent.data);
            } else {
              console.log('[useStreamingConnection] ❌ Not a LangGraph event, using standard SSE format');
            }
            
            if (langGraphEvent) {
              
              const handler = eventHandlersRef.current.get(langGraphEvent.eventType);
              if (handler) {
                try {
                  handler(langGraphEvent.data);
                } catch (err) {
                  console.error(`[useStreamingConnection] Error in handler for ${langGraphEvent.eventType}:`, err);
                }
              }
              
              // Also call wildcard handler
              const wildcardHandler = eventHandlersRef.current.get('*');
              if (wildcardHandler) {
                try {
                  wildcardHandler({ event: langGraphEvent.eventType, data: langGraphEvent.data });
                } catch (err) {
                  console.error('[useStreamingConnection] Error in wildcard handler:', err);
                }
              }
            } else {
              // Fallback to original SSE event format
              const handler = eventHandlersRef.current.get(event.event);
              if (handler) {
                try {
                  handler(event.data);
                } catch (err) {
                  console.error(`[useStreamingConnection] Error in handler for ${event.event}:`, err);
                }
              }
              
              // Also call wildcard handler
              const wildcardHandler = eventHandlersRef.current.get('*');
              if (wildcardHandler) {
                try {
                  wildcardHandler(event);
                } catch (err) {
                  console.error('[useStreamingConnection] Error in wildcard handler:', err);
                }
              }
            }
          }
          
          // Clear processed events from buffer
          if (events.length > 0) {
            const lastEventIndex = buffer.lastIndexOf('\n\n');
            if (lastEventIndex !== -1) {
              buffer = buffer.substring(lastEventIndex + 2);
            }
          }
        }
        
        // Stream ended normally
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: false,
          isReconnecting: false,
        }));
        
      } catch (error: any) {
        // Connection error
        if (error.name === 'AbortError') {
          console.log('[useStreamingConnection] Connection aborted');
          return;
        }
        
        console.error('[useStreamingConnection] Connection error:', error);
        setLastError(error.message || 'Connection failed');
        
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: false,
          isReconnecting: false,
          lastError: error.message,
        }));
        
        // Attempt reconnection if within limits
        const currentAttempts = connectionStatus.reconnectAttempts;
        if (currentAttempts < maxReconnectAttempts) {
          const delay = Math.min(
            reconnectDelay * Math.pow(reconnectDelayMultiplier, currentAttempts),
            maxReconnectDelay
          );
          
          console.log(`[useStreamingConnection] Reconnecting in ${delay}ms (attempt ${currentAttempts + 1}/${maxReconnectAttempts})`);
          
          setConnectionStatus(prev => ({
            ...prev,
            isReconnecting: true,
            reconnectAttempts: currentAttempts + 1,
          }));
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnect();
          }, delay);
        } else {
          console.error('[useStreamingConnection] Max reconnect attempts reached');
          setLastError('Connection lost. Max reconnect attempts reached.');
        }
      }
    },
    [connectionStatus.reconnectAttempts, maxReconnectAttempts, reconnectDelay, reconnectDelayMultiplier, maxReconnectDelay]
  );
  
  /**
   * Disconnect from SSE endpoint
   */
  const disconnect = useCallback(() => {
    console.log('[useStreamingConnection] Disconnecting...');
    
    // Cancel reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Abort fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Cancel reader
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
    
    // Reset status
    setConnectionStatus({
      isConnected: false,
      isReconnecting: false,
      reconnectAttempts: 0,
      maxReconnectAttempts,
    });
    
    currentEndpointRef.current = null;
    currentPayloadRef.current = null;
  }, [maxReconnectAttempts]);
  
  /**
   * Reconnect to the last endpoint
   */
  const reconnect = useCallback(async (): Promise<void> => {
    if (!currentEndpointRef.current || !currentPayloadRef.current) {
      console.error('[useStreamingConnection] Cannot reconnect: no previous connection');
      return;
    }
    
    console.log('[useStreamingConnection] Reconnecting...');
    await connect(currentEndpointRef.current, currentPayloadRef.current);
  }, [connect]);
  
  // ============================================================================
  // EVENT HANDLING
  // ============================================================================
  
  /**
   * Register an event handler
   */
  const onEvent = useCallback((eventType: string, handler: (data: any) => void) => {
    eventHandlersRef.current.set(eventType, handler);
  }, []);
  
  /**
   * Unregister an event handler
   */
  const offEvent = useCallback((eventType: string) => {
    eventHandlersRef.current.delete(eventType);
  }, []);
  
  // ============================================================================
  // ERROR HANDLING
  // ============================================================================
  
  const clearError = useCallback(() => {
    setLastError(null);
  }, []);
  
  // ============================================================================
  // CLEANUP
  // ============================================================================
  
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    // State
    connectionStatus,
    isConnected: connectionStatus.isConnected,
    isReconnecting: connectionStatus.isReconnecting,
    
    // Control
    connect,
    disconnect,
    reconnect,
    
    // Events
    onEvent,
    offEvent,
    
    // Errors
    lastError,
    clearError,
  };
}


