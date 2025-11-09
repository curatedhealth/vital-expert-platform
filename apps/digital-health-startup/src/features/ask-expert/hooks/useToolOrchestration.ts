/**
 * useToolOrchestration Hook
 * 
 * Manages tool orchestration UI and logic
 * - Tool confirmation workflow
 * - Tool execution status tracking
 * - Tool results management
 * - Tool suggestions handling
 * 
 * @extracted from ask-expert/page.tsx
 */

import { useState, useCallback, useMemo } from 'react';
import type { ToolSuggestion, ToolResult, ExecutingTool, ToolExecutionStatus } from '../types';

export interface UseToolOrchestrationOptions {
  onToolConfirm?: (tool: ToolSuggestion) => void;
  onToolDecline?: (tool: ToolSuggestion) => void;
}

export interface UseToolOrchestrationReturn {
  // Tool Confirmation
  pendingToolConfirmation: {
    tool: ToolSuggestion;
    onConfirm: () => void;
    onDecline: () => void;
  } | null;
  requestToolConfirmation: (tool: ToolSuggestion) => Promise<boolean>;
  confirmTool: () => void;
  declineTool: () => void;
  
  // Tool Execution Status
  executionStatus: ToolExecutionStatus;
  startToolExecution: (toolId: string, toolName: string) => void;
  updateToolExecution: (toolId: string, updates: Partial<ExecutingTool>) => void;
  completeToolExecution: (toolId: string, status: 'success' | 'error', message?: string) => void;
  clearExecutionStatus: () => void;
  
  // Tool Results
  toolResults: ToolResult[];
  addToolResult: (result: ToolResult) => void;
  clearToolResults: () => void;
  getToolResultById: (id: string) => ToolResult | undefined;
  
  // Computed
  hasActiveTools: boolean;
  hasPendingConfirmation: boolean;
  completedToolsCount: number;
  failedToolsCount: number;
}

/**
 * Custom hook for managing tool orchestration
 */
export function useToolOrchestration(
  options: UseToolOrchestrationOptions = {}
): UseToolOrchestrationReturn {
  const { onToolConfirm, onToolDecline } = options;
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [pendingToolConfirmation, setPendingToolConfirmation] = useState<{
    tool: ToolSuggestion;
    onConfirm: () => void;
    onDecline: () => void;
  } | null>(null);
  
  const [executingTools, setExecutingTools] = useState<ExecutingTool[]>([]);
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  
  // ============================================================================
  // TOOL CONFIRMATION
  // ============================================================================
  
  /**
   * Request user confirmation for a tool
   * Returns a promise that resolves to true if confirmed, false if declined
   */
  const requestToolConfirmation = useCallback(
    (tool: ToolSuggestion): Promise<boolean> => {
      return new Promise((resolve) => {
        setPendingToolConfirmation({
          tool,
          onConfirm: () => {
            setPendingToolConfirmation(null);
            onToolConfirm?.(tool);
            resolve(true);
          },
          onDecline: () => {
            setPendingToolConfirmation(null);
            onToolDecline?.(tool);
            resolve(false);
          },
        });
      });
    },
    [onToolConfirm, onToolDecline]
  );
  
  /**
   * Confirm the pending tool
   */
  const confirmTool = useCallback(() => {
    if (pendingToolConfirmation) {
      pendingToolConfirmation.onConfirm();
    }
  }, [pendingToolConfirmation]);
  
  /**
   * Decline the pending tool
   */
  const declineTool = useCallback(() => {
    if (pendingToolConfirmation) {
      pendingToolConfirmation.onDecline();
    }
  }, [pendingToolConfirmation]);
  
  // ============================================================================
  // TOOL EXECUTION STATUS
  // ============================================================================
  
  /**
   * Start tracking execution of a tool
   */
  const startToolExecution = useCallback((toolId: string, toolName: string) => {
    setExecutingTools(prev => [
      ...prev,
      {
        id: toolId,
        name: toolName,
        status: 'executing',
        progress: 0,
        message: 'Starting execution...',
      },
    ]);
  }, []);
  
  /**
   * Update execution status of a tool
   */
  const updateToolExecution = useCallback(
    (toolId: string, updates: Partial<ExecutingTool>) => {
      setExecutingTools(prev =>
        prev.map(tool =>
          tool.id === toolId ? { ...tool, ...updates } : tool
        )
      );
    },
    []
  );
  
  /**
   * Complete execution of a tool
   */
  const completeToolExecution = useCallback(
    (toolId: string, status: 'success' | 'error', message?: string) => {
      setExecutingTools(prev =>
        prev.map(tool =>
          tool.id === toolId
            ? { ...tool, status, progress: 100, message: message || tool.message }
            : tool
        )
      );
      
      // After a delay, remove from executing list
      setTimeout(() => {
        setExecutingTools(prev => prev.filter(tool => tool.id !== toolId));
      }, 2000);
    },
    []
  );
  
  /**
   * Clear all execution status
   */
  const clearExecutionStatus = useCallback(() => {
    setExecutingTools([]);
  }, []);
  
  // ============================================================================
  // TOOL RESULTS
  // ============================================================================
  
  /**
   * Add a tool result
   */
  const addToolResult = useCallback((result: ToolResult) => {
    setToolResults(prev => [...prev, result]);
  }, []);
  
  /**
   * Clear all tool results
   */
  const clearToolResults = useCallback(() => {
    setToolResults([]);
  }, []);
  
  /**
   * Get a tool result by ID
   */
  const getToolResultById = useCallback(
    (id: string): ToolResult | undefined => {
      return toolResults.find(result => result.id === id);
    },
    [toolResults]
  );
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const executionStatus: ToolExecutionStatus = useMemo(
    () => ({
      isExecuting: executingTools.length > 0,
      tools: executingTools,
      totalTools: executingTools.length,
      completedTools: executingTools.filter(t => t.status === 'success' || t.status === 'error').length,
    }),
    [executingTools]
  );
  
  const hasActiveTools = useMemo(
    () => executingTools.length > 0,
    [executingTools]
  );
  
  const hasPendingConfirmation = useMemo(
    () => pendingToolConfirmation !== null,
    [pendingToolConfirmation]
  );
  
  const completedToolsCount = useMemo(
    () => toolResults.filter(r => r.status === 'success').length,
    [toolResults]
  );
  
  const failedToolsCount = useMemo(
    () => toolResults.filter(r => r.status === 'error').length,
    [toolResults]
  );
  
  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    // Confirmation
    pendingToolConfirmation,
    requestToolConfirmation,
    confirmTool,
    declineTool,
    
    // Execution
    executionStatus,
    startToolExecution,
    updateToolExecution,
    completeToolExecution,
    clearExecutionStatus,
    
    // Results
    toolResults,
    addToolResult,
    clearToolResults,
    getToolResultById,
    
    // Computed
    hasActiveTools,
    hasPendingConfirmation,
    completedToolsCount,
    failedToolsCount,
  };
}


