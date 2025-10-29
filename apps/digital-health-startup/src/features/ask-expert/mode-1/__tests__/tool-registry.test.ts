/**
 * Tool Registry Tests
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ToolRegistry } from '../tools/tool-registry';
import { CalculatorTool } from '../tools/calculator-tool';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry(
      'https://test.supabase.co',
      'test-key',
      'test-api-key'
    );
  });

  describe('Tool Registration', () => {
    it('should register default tools on initialization', () => {
      const tools = registry.getAllTools();
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should get tool by name', () => {
      const calculator = registry.getTool('calculator');
      expect(calculator).toBeDefined();
      expect(calculator?.name).toBe('calculator');
    });

    it('should return undefined for non-existent tool', () => {
      const tool = registry.getTool('non_existent_tool');
      expect(tool).toBeUndefined();
    });

    it('should check if tool exists', () => {
      expect(registry.hasTool('calculator')).toBe(true);
      expect(registry.hasTool('non_existent_tool')).toBe(false);
    });
  });

  describe('Tool Execution', () => {
    it('should execute calculator tool', async () => {
      const result = await registry.executeTool(
        'calculator',
        {
          calculation_type: 'general',
          formula: '2 + 2',
        },
        {}
      );

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.duration_ms).toBeGreaterThan(0);
    });

    it('should handle tool execution errors', async () => {
      const result = await registry.executeTool(
        'calculator',
        {
          calculation_type: 'general',
          formula: 'invalid formula!!!',
        },
        {}
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for non-existent tool', async () => {
      const result = await registry.executeTool(
        'non_existent_tool',
        {},
        {}
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Tool Schemas', () => {
    it('should get tool schemas for LLM', () => {
      const schemas = registry.getToolSchemas();
      expect(schemas.length).toBeGreaterThan(0);
      expect(schemas[0]).toHaveProperty('type', 'function');
      expect(schemas[0].function).toHaveProperty('name');
      expect(schemas[0].function).toHaveProperty('description');
      expect(schemas[0].function).toHaveProperty('parameters');
    });
  });
});

