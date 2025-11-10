/**
 * Parse LangGraph SSE Events
 * 
 * Converts LangGraph's stream_mode format to frontend-compatible events:
 * - stream_mode: "messages" → event: "content" (token streaming)
 * - stream_mode: "updates" → event: node name (workflow progress)
 * - stream_mode: "custom" → custom events (reasoning, sources, tools)
 */

export interface LangGraphEvent {
  eventType: string;
  data: any;
}

/**
 * Parse a LangGraph SSE event
 * 
 * @param sseData - Raw SSE data (string or already-parsed object) from backend
 * @returns Parsed event with eventType and data, or null if invalid
 */
export function parseLangGraphEvent(sseData: string | any): LangGraphEvent | null {
  try {
    // Handle both string and already-parsed object
    const parsed = typeof sseData === 'string' ? JSON.parse(sseData) : sseData;
    
    // Handle messages stream mode (token-by-token LLM output)
    if (parsed.stream_mode === 'messages') {
      const content = parsed.data?.content;
      const messageType = parsed.data?.type;
      const messageId = parsed.data?.id;
      
      // ✅ FIX: Only skip COMPLETE messages (no chunk ID), not streaming chunks
      // Streaming chunks have IDs like "chunk-0", "chunk-1", etc.
      // Complete messages have no ID or a non-chunk ID
      if (messageType === 'ai' && (!messageId || !messageId.includes('chunk'))) {
        console.log('[parseLangGraphEvent] Skipping final complete "ai" message to prevent duplication');
        return null;
      }
      
      if (content !== undefined && content !== '') {
        return {
          eventType: 'content',
          data: content,
        };
      }
      return null; // Empty content, skip
    }
    
    // Handle updates stream mode (node completion)
    if (parsed.stream_mode === 'updates') {
      const nodeName = Object.keys(parsed.data)[0];
      if (nodeName) {
        return {
          eventType: nodeName,
          data: parsed.data[nodeName],
        };
      }
      return null;
    }
    
    // Handle custom events (reasoning, sources, tools)
    if (parsed.stream_mode === 'custom') {
      return {
        eventType: parsed.type || 'custom',
        data: parsed.data,
      };
    }
    
    // 🔥 FIX: Handle completion event (sent at end of stream)
    if (parsed.type === 'complete') {
      return {
        eventType: 'complete',
        data: parsed,
      };
    }
    
    // Unknown format, return as-is
    return {
      eventType: 'unknown',
      data: parsed,
    };
  } catch (error) {
    // Not JSON, might be plain text SSE
    return null;
  }
}

