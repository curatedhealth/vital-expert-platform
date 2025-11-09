/**
 * Unit Tests for useToolOrchestration Hook
 * 
 * Tests tool confirmation, execution tracking, and results management
 * Target: 80%+ coverage
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useToolOrchestration } from '../useToolOrchestration';
import type { ToolSuggestion, ToolResult } from '../../types';

describe('useToolOrchestration', () => {
  // ============================================================================
  // SETUP
  // ============================================================================
  
  const createMockToolSuggestion = (overrides?: Partial<ToolSuggestion>): ToolSuggestion => ({
    id: `tool-${Date.now()}`,
    name: 'Web Search',
    description: 'Search the web for information',
    parameters: { query: 'test' },
    ...overrides,
  });
  
  const createMockToolResult = (overrides?: Partial<ToolResult>): ToolResult => ({
    id: `result-${Date.now()}`,
    name: 'Web Search',
    status: 'success',
    result: { data: 'test' },
    timestamp: Date.now(),
    ...overrides,
  });
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  describe('initialization', () => {
    it('should initialize with no pending confirmation', () => {
      const { result } = renderHook(() => useToolOrchestration());
      
      expect(result.current.pendingToolConfirmation).toBeNull();
      expect(result.current.hasPendingConfirmation).toBe(false);
    });
    
    it('should initialize with empty tool results', () => {
      const { result } = renderHook(() => useToolOrchestration());
      
      expect(result.current.toolResults).toEqual([]);
      expect(result.current.completedToolsCount).toBe(0);
      expect(result.current.failedToolsCount).toBe(0);
    });
    
    it('should initialize with no active tools', () => {
      const { result } = renderHook(() => useToolOrchestration());
      
      expect(result.current.hasActiveTools).toBe(false);
      expect(result.current.executionStatus.isExecuting).toBe(false);
      expect(result.current.executionStatus.totalTools).toBe(0);
    });
  });
  
  // ============================================================================
  // TOOL CONFIRMATION
  // ============================================================================
  
  describe('tool confirmation', () => {
    it('should request tool confirmation', async () => {
      const { result } = renderHook(() => useToolOrchestration());
      const tool = createMockToolSuggestion();
      
      let confirmationPromise: Promise<boolean>;
      
      act(() => {
        confirmationPromise = result.current.requestToolConfirmation(tool);
      });
      
      expect(result.current.pendingToolConfirmation).not.toBeNull();
      expect(result.current.pendingToolConfirmation?.tool).toEqual(tool);
      expect(result.current.hasPendingConfirmation).toBe(true);
    });
    
    it('should confirm tool and resolve promise with true', async () => {
      const { result } = renderHook(() => useToolOrchestration());
      const onConfirm = jest.fn();
      const tool = createMockToolSuggestion();
      
      const { result: hookResult } = renderHook(() => 
        useToolOrchestration({ onToolConfirm: onConfirm })
      );
      
      let confirmationResult: boolean | undefined;
      
      await act(async () => {
        const promise = hookResult.current.requestToolConfirmation(tool);
        hookResult.current.confirmTool();
        confirmationResult = await promise;
      });
      
      expect(confirmationResult).toBe(true);
      expect(onConfirm).toHaveBeenCalledWith(tool);
      expect(hookResult.current.pendingToolConfirmation).toBeNull();
    });
    
    it('should decline tool and resolve promise with false', async () => {
      const { result } = renderHook(() => useToolOrchestration());
      const onDecline = jest.fn();
      const tool = createMockToolSuggestion();
      
      const { result: hookResult } = renderHook(() => 
        useToolOrchestration({ onToolDecline: onDecline })
      );
      
      let confirmationResult: boolean | undefined;
      
      await act(async () => {
        const promise = hookResult.current.requestToolConfirmation(tool);
        hookResult.current.declineTool();
        confirmationResult = await promise;
      });
      
      expect(confirmationResult).toBe(false);
      expect(onDecline).toHaveBeenCalledWith(tool);
      expect(hookResult.current.pendingToolConfirmation).toBeNull();
    });
  });
  
  // ============================================================================
  // TOOL EXECUTION STATUS
  // ============================================================================
  
  describe('tool execution status', () => {
    it('should start tool execution', () => {
      const { result } = renderHook(() => useToolOrchestration());
      
      act(() => {
        result.current.startToolExecution('tool-1', 'Web Search');
      });
      
      expect(result.current.hasActiveTools).toBe(true);
      expect(result.current.executionStatus.isExecuting).toBe(true);
      expect(result.current.executionStatus.totalTools).toBe(1);
      expect(result.current.executionStatus.tools[0]).toMatchObject({
        id: 'tool-1',
        name: 'Web Search',
        status: 'executing',
      });
    });
    
    it('should update tool execution progress', () => {
      const { result } = renderHook(() => useToolOrchestration());
      
      act(() => {
        result.current.startToolExecution('tool-1', 'Web Search');
      });
      
      act(() => {
        result.current.updateToolExecution('tool-1', {
          progress: 50,
          message: 'Searching...',
        });
      });
      
      const tool = result.current.executionStatus.tools.find(t => t.id === 'tool-1');
      expect(tool?.progress).toBe(50);
      expect(tool?.message).toBe('Searching...');
    });
    
    it('should complete tool execution with success', () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useToolOrchestration());
      
      act(() => {
        result.current.startToolExecution('tool-1', 'Web Search');
      });
      
      act(() => {
        result.current.completeToolExecution('tool-1', 'success', 'Done');
      });
      
      const tool = result.current.executionStatus.tools.find(t => t.id === 'tool-1');
      expect(tool?.status).toBe('success');
      expect(tool?.progress).toBe(100);
      
      // Fast-forward past removal delay
      act(() => {
        jest.advanceTimersByTime(2100);
      });
      
      expect(result.current.executionStatus.tools.find(t => t.id === 'tool-1')).toBeUndefined();
      
      jest.useRealTimers();
    });
    
    it('should complete tool execution with error', () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useToolOrchestration());
      
      act(() => {
        result.current.startToolExecution('tool-1', 'Web Search');
      });
      
      act(() => {
        result.current.completeToolExecution('tool-1', 'error', 'Failed');
      });
      
      const tool = result.current.executionStatus.tools.find(t => t.id === 'tool-1');
      expect(tool?.status).toBe('error');
      
      jest.useRealTimers();
    });
    
    it('should clear all execution status', () => {
      const { result } = renderHook(() => useToolOrchestration());
      
      act(() => {
        result.current.startToolExecution('tool-1', 'Web Search');
        result.current.startToolExecution('tool-2', 'Database Query');
      });
      
      expect(result.current.executionStatus.totalTools).toBe(2);
      
      act(() => {
        result.current.clearExecutionStatus();
      });
      
      expect(result.current.executionStatus.totalTools).toBe(0);
      expect(result.current.hasActiveTools).toBe(false);
    });
  });
  
  // ============================================================================
  // TOOL RESULTS
  // ============================================================================
  
  describe('tool results', () => {
    it('should add tool result', () => {
      const { result } = renderHook(() => useToolOrchestration());
      const toolResult = createMockToolResult();
      
      act(() => {
        result.current.addToolResult(toolResult);
      });
      
      expect(result.current.toolResults).toContain(toolResult);
    });
    
    it('should clear all tool results', () => {
      const { result } = renderHook(() => useToolOrchestration());
      
      act(() => {
        result.current.addToolResult(createMockToolResult());
        result.current.addToolResult(createMockToolResult());
      });
      
      expect(result.current.toolResults.length).toBe(2);
      
      act(() => {
        result.current.clearToolResults();
      });
      
      expect(result.current.toolResults).toEqual([]);
    });
    
    it('should get tool result by ID', () => {
      const { result } = renderHook(() => useToolOrchestration());
      const toolResult = createMockToolResult({ id: 'result-1' });
      
      act(() => {
        result.current.addToolResult(toolResult);
      });
      
      const found = result.current.getToolResultById('result-1');
      expect(found).toEqual(toolResult);
    });
    
    it('should return undefined for non-existent result ID', () => {
      const { result } = renderHook(() => useToolOrchestration());
      
      const found = result.current.getToolResultById('non-existent');
      expect(found).toBeUndefined();
    });
  });
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  describe('computed values', () => {
    it('should calculate completed tools count', () => {
      const { result } = renderHook(() => useToolOrchestration());
      
      act(() => {
        result.current.addToolResult(createMockToolResult({ status: 'success' }));
        result.current.addToolResult(createMockToolResult({ status: 'success' }));
        result.current.addToolResult(createMockToolResult({ status: 'error' }));
      });
      
      expect(result.current.completedToolsCount).toBe(2);
    });
    
    it('should calculate failed tools count', () => {
      const { result } = renderHook(() => useToolOrchestration());
      
      act(() => {
        result.current.addToolResult(createMockToolResult({ status: 'success' }));
        result.current.addToolResult(createMockToolResult({ status: 'error' }));
        result.current.addToolResult(createMockToolResult({ status: 'error' }));
      });
      
      expect(result.current.failedToolsCount).toBe(2);
    });
    
    it('should track active tools correctly', () => {
      const { result } = renderHook(() => useToolOrchestration());
      
      expect(result.current.hasActiveTools).toBe(false);
      
      act(() => {
        result.current.startToolExecution('tool-1', 'Web Search');
      });
      
      expect(result.current.hasActiveTools).toBe(true);
    });
    
    it('should update execution status metadata', () => {
      const { result } = renderHook(() => useToolOrchestration());
      
      act(() => {
        result.current.startToolExecution('tool-1', 'Web Search');
        result.current.startToolExecution('tool-2', 'Database Query');
      });
      
      expect(result.current.executionStatus.totalTools).toBe(2);
      expect(result.current.executionStatus.completedTools).toBe(0);
      
      act(() => {
        result.current.completeToolExecution('tool-1', 'success');
      });
      
      expect(result.current.executionStatus.completedTools).toBe(1);
    });
  });
  
  // ============================================================================
  // INTEGRATION
  // ============================================================================
  
  describe('integration scenarios', () => {
    it('should handle full tool lifecycle', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useToolOrchestration());
      const tool = createMockToolSuggestion({ id: 'tool-1' });
      
      // Step 1: Request confirmation
      let confirmed: boolean | undefined;
      await act(async () => {
        const promise = result.current.requestToolConfirmation(tool);
        result.current.confirmTool();
        confirmed = await promise;
      });
      
      expect(confirmed).toBe(true);
      
      // Step 2: Start execution
      act(() => {
        result.current.startToolExecution('tool-1', tool.name);
      });
      
      expect(result.current.hasActiveTools).toBe(true);
      
      // Step 3: Update progress
      act(() => {
        result.current.updateToolExecution('tool-1', { progress: 50 });
      });
      
      // Step 4: Complete execution
      act(() => {
        result.current.completeToolExecution('tool-1', 'success', 'Done');
      });
      
      // Step 5: Add result
      act(() => {
        result.current.addToolResult(createMockToolResult({ id: 'result-1', name: tool.name }));
      });
      
      expect(result.current.toolResults.length).toBe(1);
      expect(result.current.completedToolsCount).toBe(1);
      
      jest.useRealTimers();
    });
  });
});

