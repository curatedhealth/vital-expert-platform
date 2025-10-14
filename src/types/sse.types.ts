export type SSE =
  | { type: 'token'; content: string }
  | { type: 'reasoning'; content: string }
  | { type: 'progress'; step: string; pct?: number }
  | { type: 'error:event'; message: string }
  | { type: 'error:fatal'; message: string }
  | { type: 'done' };

export function parseSSELine(line: string): SSE | null {
  if (!line.startsWith('data:')) return null;
  const payload = line.slice(5).trim();
  if (payload === '[DONE]') return { type: 'done' };
  try { 
    return JSON.parse(payload) as SSE; 
  } catch { 
    return { type: 'error:event', message: 'Malformed SSE' }; 
  }
}

