/**
 * Tool Registry
 * 
 * Manages available tools and executes them based on agent needs
 * Follows enterprise patterns for tool registration and execution
 */

import { BaseTool, ToolContext, ToolExecutionResult } from './base-tool';
import { CalculatorTool } from './calculator-tool';
import { DatabaseQueryTool } from './database-query-tool';
import { WebSearchTool } from './web-search-tool';

export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();
  private defaultTools: BaseTool[] = [];

  constructor(
    supabaseUrl?: string,
    supabaseKey?: string,
    webSearchApiKey?: string
  ) {
    // Register default tools
    this.registerTool(new CalculatorTool());

    if (supabaseUrl && supabaseKey) {
      this.registerTool(new DatabaseQueryTool(supabaseUrl, supabaseKey));
    }

    this.registerTool(new WebSearchTool(webSearchApiKey, 'mock'));

    // Store default tools for easy access
    this.defaultTools = Array.from(this.tools.values());
  }

  /**
   * Register a tool
   */
  registerTool(tool: BaseTool): void {
    this.tools.set(tool.name, tool);
    console.log(`✅ [Tool Registry] Registered tool: ${tool.name}`);
  }

  /**
   * Get tool by name
   */
  getTool(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool schemas for LLM function calling
   */
  getToolSchemas(): Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: {
        type: 'object';
        properties: Record<string, any>;
        required: string[];
      };
    };
  }> {
    return Array.from(this.tools.values()).map((tool) => tool.getSchema());
  }

  /**
   * Execute a tool
   */
  async executeTool(
    toolName: string,
    input: Record<string, any>,
    context: ToolContext
  ): Promise<ToolExecutionResult> {
    const tool = this.getTool(toolName);

    if (!tool) {
      console.error(`❌ [Tool Registry] Tool not found: ${toolName}`);
      return {
        success: false,
        error: `Tool '${toolName}' not found`,
        duration_ms: 0,
      };
    }

    try {
      console.log(`🛠️  [Tool Registry] Executing tool: ${toolName}`);
      const result = await tool.execute(input, context);

      if (result.success) {
        console.log(`✅ [Tool Registry] Tool execution successful: ${toolName} (${result.duration_ms}ms)`);
      } else {
        console.error(`❌ [Tool Registry] Tool execution failed: ${toolName} - ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error(`❌ [Tool Registry] Tool execution error: ${toolName}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown tool execution error',
        duration_ms: 0,
      };
    }
  }

  /**
   * Check if a tool is available
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get available tool names
   */
  getAvailableToolNames(): string[] {
    return Array.from(this.tools.keys());
  }
}

