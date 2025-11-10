/**
 * Utility functions for Ask Expert feature
 * Extracted from ask-expert/page.tsx for better reusability
 */

import type { Source, CitationMeta, SSEEvent } from '../types';

// ============================================================================
// SOURCE NORMALIZATION
// ============================================================================

/**
 * Normalizes a single source record with consistent structure
 */
export const normalizeSourceRecord = (source: any, idx: number): Source => {
  const metadata = source?.metadata ?? {};
  const parsedNumber =
    typeof source?.number === 'string'
      ? parseInt(source.number, 10)
      : source?.number;

  return {
    number: Number.isFinite(parsedNumber) ? parsedNumber : idx + 1,
    id: source?.id || metadata.id || `source-${idx + 1}`,
    url: source?.url || source?.link || metadata.url || '#',
    title: source?.title || metadata.title || `Source ${idx + 1}`,
    description: source?.description || source?.summary || metadata.description,
    excerpt: source?.excerpt || metadata.excerpt || source?.quote,
    similarity:
      typeof source?.similarity === 'number'
        ? source.similarity
        : metadata.similarity,
    domain: source?.domain || metadata.domain,
    evidenceLevel: source?.evidenceLevel || metadata.evidenceLevel,
    organization: source?.organization || metadata.organization,
    reliabilityScore:
      typeof source?.reliabilityScore === 'number'
        ? source.reliabilityScore
        : metadata.reliabilityScore,
    lastUpdated: source?.lastUpdated || metadata.lastUpdated,
    quote: source?.quote,
    sourceType: source?.sourceType || metadata.sourceType,
    metadata,
  };
};

/**
 * Normalizes sources from citations array
 */
export const normalizeSourcesFromCitations = (
  citations: any[] | undefined | null
): Source[] => {
  if (!Array.isArray(citations) || citations.length === 0) {
    return [];
  }

  return citations.map((citation, idx) =>
    normalizeSourceRecord(
      {
        ...citation,
        description: citation?.description || citation?.summary,
        excerpt: citation?.excerpt || citation?.quote,
      },
      idx
    )
  );
};

// ============================================================================
// LANGGRAPH STATE UNWRAPPING
// ============================================================================

/**
 * Unwraps LangGraph update state to extract node and state information
 * Handles nested state structures from LangGraph SSE events
 */
export const unwrapLangGraphUpdateState = (
  payload: unknown
): { node?: string; state: Record<string, any> } => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { state: {} };
  }

  const visited = new Set<unknown>();

  const unwrap = (
    value: unknown,
    depth: number
  ): { node?: string; state: Record<string, any> } => {
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      visited.has(value) ||
      depth > 5
    ) {
      return { state: {} };
    }

    visited.add(value);
    const recordValue = value as Record<string, any>;

    if (recordValue.state && typeof recordValue.state === 'object') {
      const nodeName = typeof recordValue.node === 'string' ? recordValue.node : undefined;
      const innerState = recordValue.state as Record<string, any>;
      if (innerState.values && typeof innerState.values === 'object') {
        return { node: nodeName, state: innerState.values as Record<string, any> };
      }
      return { node: nodeName, state: innerState };
    }

    if (recordValue.values && typeof recordValue.values === 'object') {
      return { state: recordValue.values as Record<string, any> };
    }

    const keys = Object.keys(recordValue);
    if (keys.length === 1) {
      const [onlyKey] = keys;
      const child = recordValue[onlyKey];
      if (child && typeof child === 'object' && !Array.isArray(child)) {
        const nested = unwrap(child, depth + 1);
        if (!nested.node && typeof onlyKey === 'string') {
          nested.node = onlyKey;
        }
        return nested;
      }
    }

    return { state: recordValue };
  };

  return unwrap(payload, 0);
};

// ============================================================================
// SSE PARSING
// ============================================================================

/**
 * Parses Server-Sent Events (SSE) from a text chunk
 * 
 * Supports both standard SSE format AND LangGraph format:
 * - Standard: event: name\ndata: value\n\n
 * - LangGraph: data: {"stream_mode": "messages", ...}\n\n (no event field)
 */
export const parseSSEChunk = (chunk: string): SSEEvent[] => {
  const events: SSEEvent[] = [];
  const lines = chunk.split('\n');
  
  let currentEvent: Partial<SSEEvent> = {};
  
  for (const line of lines) {
    if (line.startsWith('event:')) {
      currentEvent.event = line.substring(6).trim();
    } else if (line.startsWith('data:')) {
      const data = line.substring(5).trim();
      try {
        currentEvent.data = JSON.parse(data);
      } catch {
        currentEvent.data = data;
      }
    } else if (line.startsWith('id:')) {
      currentEvent.id = line.substring(3).trim();
    } else if (line.startsWith('retry:')) {
      currentEvent.retry = parseInt(line.substring(6).trim(), 10);
    } else if (line === '') {
      // Empty line indicates end of event
      // ✅ FIX: Allow events without explicit event field (LangGraph format)
      // If no event field is set, default to 'message' so parseLangGraphEvent can process it
      if (currentEvent.data !== undefined) {
        if (!currentEvent.event) {
          currentEvent.event = 'message'; // Default event type for LangGraph
        }
        events.push(currentEvent as SSEEvent);
      }
      currentEvent = {};
    }
  }
  
  return events;
};

// ============================================================================
// TOKEN ESTIMATION
// ============================================================================

/**
 * Estimates token count for a given text (rough approximation)
 * GPT-4 uses ~4 characters per token on average
 */
export const estimateTokenCount = (text: string): number => {
  if (!text) return 0;
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
};

// ============================================================================
// TEXT UTILITIES
// ============================================================================

/**
 * Truncates text to a maximum length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Sanitizes HTML content (basic XSS prevention)
 */
export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Deduplicates array of objects by a key
 */
export const deduplicateByKey = <T extends Record<string, any>>(
  array: T[],
  key: keyof T
): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};


