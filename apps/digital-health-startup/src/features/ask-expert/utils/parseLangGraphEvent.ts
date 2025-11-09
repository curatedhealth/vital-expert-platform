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
 * @param sseData - Raw SSE data string from backend
 * @returns Parsed event with eventType and data, or null if invalid
 */
export function parseLangGraphEvent(sseData: string): LangGraphEvent | null {
  try {
    const parsed = JSON.parse(sseData);
    
    // Handle messages stream mode (token-by-token LLM output)
    if (parsed.stream_mode === 'messages') {
      const content = parsed.data?.content;
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

