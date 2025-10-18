/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VITAL EXPERT - API CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Centralized configuration for API endpoints and settings
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
  enableAutonomous: process.env.NEXT_PUBLIC_ENABLE_AUTONOMOUS === 'true',
};

export const endpoints = {
  // Chat management
  chats: '/api/chats',
  chat: (id: string) => `/api/chats/${id}`,
  
  // Message handling
  manual: '/api/chat/manual',
  automatic: '/api/chat/automatic',
  
  // Autonomous mode
  autonomous: {
    execute: '/api/autonomous/execute',
    stream: (sessionId: string) => `/api/autonomous/stream/${sessionId}`,
    pause: (sessionId: string) => `/api/autonomous/${sessionId}/pause`,
    resume: (sessionId: string) => `/api/autonomous/${sessionId}/resume`,
    stop: (sessionId: string) => `/api/autonomous/${sessionId}/stop`,
  },
  
  // Agents
  agents: '/api/agents',
  agent: (id: string) => `/api/agents/${id}`,
  
  // Health
  health: '/health',
} as const;
