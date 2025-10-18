/**
 * Backend Configuration
 * Centralized configuration for backend service URLs and settings
 */

export interface BackendConfig {
  pythonBackendUrl: string;
  nodeGatewayUrl: string;
  timeout: number;
  retryAttempts: number;
  enableFallback: boolean;
}

// Environment-based configuration
const getBackendConfig = (): BackendConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    pythonBackendUrl: process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 
      (isDevelopment ? 'http://localhost:8001' : '/api/backend'),
    nodeGatewayUrl: process.env.NEXT_PUBLIC_NODE_GATEWAY_URL || 
      (isDevelopment ? 'http://localhost:3001' : 'https://your-node-gateway.vercel.app'),
    timeout: parseInt(process.env.BACKEND_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.BACKEND_RETRY_ATTEMPTS || '3'),
    enableFallback: process.env.ENABLE_BACKEND_FALLBACK === 'true'
  };
};

export const backendConfig = getBackendConfig();

// Health check endpoints
export const healthEndpoints = {
  python: `${backendConfig.pythonBackendUrl}/health`,
  node: `${backendConfig.nodeGatewayUrl}/health`
};

// API endpoints
export const apiEndpoints = {
  autonomous: {
    start: `${backendConfig.pythonBackendUrl}/autonomous/start`,
    stream: (sessionId: string) => `${backendConfig.pythonBackendUrl}/autonomous/stream/${sessionId}`
  },
  consultation: {
    start: `${backendConfig.pythonBackendUrl}/consultation/start`,
    stream: (sessionId: string) => `${backendConfig.pythonBackendUrl}/consultation/stream/${sessionId}`
  },
  modes: {
    sessions: `${backendConfig.pythonBackendUrl}/modes/sessions`,
    agents: `${backendConfig.pythonBackendUrl}/modes/agents`,
    recommendations: `${backendConfig.pythonBackendUrl}/modes/recommendations`
  }
};

// Logging configuration
export const logConfig = {
  enableBackendLogs: process.env.ENABLE_BACKEND_LOGS === 'true',
  logLevel: process.env.LOG_LEVEL || 'info'
};
