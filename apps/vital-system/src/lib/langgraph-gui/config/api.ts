/**
 * API Configuration for LangGraph GUI
 * Handles API endpoint configuration and base URL detection
 */

// Default API base URL - will be overridden by Next.js API routes
let apiBaseUrl = '/api/langgraph-gui';

/**
 * Set the API base URL
 */
export function setApiBaseUrl(url: string): void {
  apiBaseUrl = url;
}

/**
 * Get the current API base URL
 */
export function getApiBaseUrl(): string {
  // Check for window.__API_BASE_URL__ (if set by Next.js)
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__;
  }
  
  // In Next.js, we can also check process.env for server-side
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_LANGGRAPH_GUI_API_URL) {
    return process.env.NEXT_PUBLIC_LANGGRAPH_GUI_API_URL;
  }
  
  return apiBaseUrl;
}

/**
 * API Endpoints
 */
export const apiEndpoints = {
  /**
   * Get panel types
   */
  panelTypes: () => `${getApiBaseUrl()}/panels/types`,
  
  /**
   * Get panel schema
   */
  panelSchema: (panelType: string) => `${getApiBaseUrl()}/panels/schema/${panelType}`,
  
  /**
   * Execute panel workflow
   */
  executePanel: () => `${getApiBaseUrl()}/panels/execute`,
  
  /**
   * List workflows
   */
  workflows: () => `${getApiBaseUrl()}/workflows`,
  
  /**
   * Get workflow by ID
   */
  workflow: (id: string) => `${getApiBaseUrl()}/workflows/${id}`,
  
  /**
   * Create workflow
   */
  createWorkflow: () => `${getApiBaseUrl()}/workflows`,
  
  /**
   * Update workflow
   */
  updateWorkflow: (id: string) => `${getApiBaseUrl()}/workflows/${id}`,
  
  /**
   * Delete workflow
   */
  deleteWorkflow: (id: string) => `${getApiBaseUrl()}/workflows/${id}`,
  
  /**
   * Execute workflow
   */
  execute: () => `${getApiBaseUrl()}/execute`,
  
  /**
   * Export workflow
   */
  export: () => `${getApiBaseUrl()}/export`,
  
  /**
   * Panels endpoints (for compatibility)
   */
  panels: {
    execute: () => `${getApiBaseUrl()}/panels/execute`,
    types: () => `${getApiBaseUrl()}/panels/types`,
    schema: (type?: string) => type ? `${getApiBaseUrl()}/panels/schema/${type}` : `${getApiBaseUrl()}/panels/schema`,
  },
};
