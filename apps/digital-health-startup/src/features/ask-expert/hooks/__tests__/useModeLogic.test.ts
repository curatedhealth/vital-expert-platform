/**
 * Unit Tests for useModeLogic Hook
 * 
 * Tests mode determination, validation, toggles, and configuration
 * Target: 80%+ coverage
 */

import { renderHook, act } from '@testing-library/react';
import { useModeLogic } from '../useModeLogic';

describe('useModeLogic', () => {
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useModeLogic());
      
      expect(result.current.mode).toBe(1); // Mode 1: Manual
      expect(result.current.isAutomatic).toBe(false);
      expect(result.current.isAutonomous).toBe(false);
      expect(result.current.enableRAG).toBe(true);
      expect(result.current.enableTools).toBe(true);
    });
    
    it('should initialize with provided values', () => {
      const { result } = renderHook(() => 
        useModeLogic({
          initialIsAutomatic: true,
          initialIsAutonomous: false,
          initialEnableRAG: false,
          initialEnableTools: false,
        })
      );
      
      expect(result.current.mode).toBe(2); // Mode 2: Automatic
      expect(result.current.isAutomatic).toBe(true);
      expect(result.current.isAutonomous).toBe(false);
      expect(result.current.enableRAG).toBe(false);
      expect(result.current.enableTools).toBe(false);
    });
  });
  
  // ============================================================================
  // MODE CALCULATION
  // ============================================================================
  
  describe('mode calculation', () => {
    it('should calculate Mode 1 when both toggles are off', () => {
      const { result } = renderHook(() => useModeLogic());
      
      expect(result.current.mode).toBe(1);
      expect(result.current.getModeName()).toBe('Mode 1: Manual Interactive');
    });
    
    it('should calculate Mode 2 when automatic is on, autonomous is off', () => {
      const { result } = renderHook(() => 
        useModeLogic({ initialIsAutomatic: true, initialIsAutonomous: false })
      );
      
      expect(result.current.mode).toBe(2);
      expect(result.current.getModeName()).toBe('Mode 2: Automatic Agent Selection');
    });
    
    it('should calculate Mode 3 when automatic is off, autonomous is on', () => {
      const { result } = renderHook(() => 
        useModeLogic({ initialIsAutomatic: false, initialIsAutonomous: true })
      );
      
      expect(result.current.mode).toBe(3);
      expect(result.current.getModeName()).toBe('Mode 3: Autonomous Multi-Agent');
    });
    
    it('should calculate Mode 4 when both toggles are on', () => {
      const { result } = renderHook(() => 
        useModeLogic({ initialIsAutomatic: true, initialIsAutonomous: true })
      );
      
      expect(result.current.mode).toBe(4);
      expect(result.current.getModeName()).toBe('Mode 4: Fully Autonomous');
    });
    
    it('should update mode when toggles change', () => {
      const { result } = renderHook(() => useModeLogic());
      
      expect(result.current.mode).toBe(1);
      
      act(() => {
        result.current.setIsAutomatic(true);
      });
      
      expect(result.current.mode).toBe(2);
      
      act(() => {
        result.current.setIsAutonomous(true);
      });
      
      expect(result.current.mode).toBe(4);
    });
  });
  
  // ============================================================================
  // TOGGLE FUNCTIONS
  // ============================================================================
  
  describe('toggle functions', () => {
    it('should toggle automatic', () => {
      const { result } = renderHook(() => useModeLogic());
      
      expect(result.current.isAutomatic).toBe(false);
      
      act(() => {
        result.current.toggleAutomatic();
      });
      
      expect(result.current.isAutomatic).toBe(true);
      
      act(() => {
        result.current.toggleAutomatic();
      });
      
      expect(result.current.isAutomatic).toBe(false);
    });
    
    it('should toggle autonomous', () => {
      const { result } = renderHook(() => useModeLogic());
      
      expect(result.current.isAutonomous).toBe(false);
      
      act(() => {
        result.current.toggleAutonomous();
      });
      
      expect(result.current.isAutonomous).toBe(true);
    });
    
    it('should toggle RAG', () => {
      const { result } = renderHook(() => useModeLogic());
      
      expect(result.current.enableRAG).toBe(true);
      
      act(() => {
        result.current.toggleRAG();
      });
      
      expect(result.current.enableRAG).toBe(false);
    });
    
    it('should toggle tools', () => {
      const { result } = renderHook(() => useModeLogic());
      
      expect(result.current.enableTools).toBe(true);
      
      act(() => {
        result.current.toggleTools();
      });
      
      expect(result.current.enableTools).toBe(false);
    });
  });
  
  // ============================================================================
  // MODE CONFIGURATION
  // ============================================================================
  
  describe('mode configuration', () => {
    it('should provide correct configuration for Mode 1', () => {
      const { result } = renderHook(() => useModeLogic());
      
      const config = result.current.modeConfig;
      expect(config.mode).toBe(1);
      expect(config.requiresAgentSelection).toBe(true);
      expect(config.supportsTools).toBe(true);
      expect(config.supportsRAG).toBe(true);
      expect(config.endpoint).toContain('/api/mode1/manual');
    });
    
    it('should provide correct configuration for Mode 2', () => {
      const { result } = renderHook(() => 
        useModeLogic({ initialIsAutomatic: true })
      );
      
      const config = result.current.modeConfig;
      expect(config.mode).toBe(2);
      expect(config.requiresAgentSelection).toBe(false);
      expect(config.endpoint).toContain('/api/mode2/automatic');
    });
    
    it('should provide correct configuration for Mode 3', () => {
      const { result } = renderHook(() => 
        useModeLogic({ initialIsAutonomous: true })
      );
      
      const config = result.current.modeConfig;
      expect(config.mode).toBe(3);
      expect(config.requiresAgentSelection).toBe(false);
      expect(config.endpoint).toContain('/api/mode3/autonomous-automatic');
    });
    
    it('should provide correct configuration for Mode 4', () => {
      const { result } = renderHook(() => 
        useModeLogic({ initialIsAutomatic: true, initialIsAutonomous: true })
      );
      
      const config = result.current.modeConfig;
      expect(config.mode).toBe(4);
      expect(config.requiresAgentSelection).toBe(false);
      expect(config.endpoint).toContain('/api/mode4/autonomous-manual');
    });
  });
  
  // ============================================================================
  // VALIDATION
  // ============================================================================
  
  describe('validation', () => {
    it('should validate Mode 1 requires agent selection', () => {
      const { result } = renderHook(() => useModeLogic());
      
      // Mode 1 without agents
      const invalidResult = result.current.validateRequirements({
        hasAgents: false,
        hasQuery: true,
      });
      
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.missingRequirements).toContain(
        'At least one agent must be selected for Mode 1'
      );
      
      // Mode 1 with agents
      const validResult = result.current.validateRequirements({
        hasAgents: true,
        hasQuery: true,
      });
      
      expect(validResult.isValid).toBe(true);
      expect(validResult.missingRequirements).toEqual([]);
    });
    
    it('should validate all modes require a query', () => {
      const { result } = renderHook(() => useModeLogic());
      
      const invalidResult = result.current.validateRequirements({
        hasAgents: true,
        hasQuery: false,
      });
      
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.missingRequirements).toContain('A query is required');
    });
    
    it('should validate Mode 2+ do not require agent selection', () => {
      const { result } = renderHook(() => 
        useModeLogic({ initialIsAutomatic: true })
      );
      
      // Mode 2 without agents (should be valid)
      const validResult = result.current.validateRequirements({
        hasAgents: false,
        hasQuery: true,
      });
      
      expect(validResult.isValid).toBe(true);
    });
  });
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  describe('utility functions', () => {
    it('should return correct mode name', () => {
      const { result } = renderHook(() => useModeLogic());
      
      expect(result.current.getModeName()).toBe('Mode 1: Manual Interactive');
      
      act(() => {
        result.current.setIsAutomatic(true);
      });
      
      expect(result.current.getModeName()).toBe('Mode 2: Automatic Agent Selection');
    });
    
    it('should return correct mode description', () => {
      const { result } = renderHook(() => useModeLogic());
      
      const description = result.current.getModeDescription();
      expect(description).toContain('You select the expert agent manually');
    });
    
    it('should return correct mode endpoint', () => {
      const { result } = renderHook(() => useModeLogic());
      
      const endpoint = result.current.getModeEndpoint();
      expect(endpoint).toContain('/api/mode1/manual');
    });
  });
  
  // ============================================================================
  // STATE SETTERS
  // ============================================================================
  
  describe('state setters', () => {
    it('should set isAutomatic', () => {
      const { result } = renderHook(() => useModeLogic());
      
      act(() => {
        result.current.setIsAutomatic(true);
      });
      
      expect(result.current.isAutomatic).toBe(true);
    });
    
    it('should set isAutonomous', () => {
      const { result } = renderHook(() => useModeLogic());
      
      act(() => {
        result.current.setIsAutonomous(true);
      });
      
      expect(result.current.isAutonomous).toBe(true);
    });
    
    it('should set enableRAG', () => {
      const { result } = renderHook(() => useModeLogic());
      
      act(() => {
        result.current.setEnableRAG(false);
      });
      
      expect(result.current.enableRAG).toBe(false);
    });
    
    it('should set enableTools', () => {
      const { result } = renderHook(() => useModeLogic());
      
      act(() => {
        result.current.setEnableTools(false);
      });
      
      expect(result.current.enableTools).toBe(false);
    });
  });
});

