/**
 * Tool Registry
 * 
 * Manages available tools and executes them based on agent needs
 * Follows enterprise patterns for tool registration and execution
 */

import { BaseTool, ToolContext, ToolExecutionResult } from './base-tool';
import { CalculatorTool } from './calculator-tool';
import { DatabaseQueryTool } from './database-query-tool';
import { WebSearchTool, WebSearchToolConfig } from './web-search-tool';
import { logger } from '@vital/utils';

export interface ToolRegistryOptions {
  webSearch?: WebSearchToolConfig;
  additionalTools?: BaseTool[];
}

export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();
  private defaultTools: BaseTool[] = [];

  constructor(
    supabaseUrl?: string,
    supabaseKey?: string,
    options: ToolRegistryOptions = {}
  ) {
    // Register default tools
    this.registerTool(new CalculatorTool());

    if (supabaseUrl && supabaseKey) {
      this.registerTool(new DatabaseQueryTool(supabaseUrl, supabaseKey));
    }

    if (options.additionalTools && options.additionalTools.length > 0) {
      options.additionalTools.forEach((tool) => this.registerTool(tool));
    }

    const webSearchConfig = this.resolveWebSearchConfig(options.webSearch);
    this.registerTool(new WebSearchTool(webSearchConfig));

    // Store default tools for easy access
    this.defaultTools = Array.from(this.tools.values());
  }

  /**
   * Determine web search configuration, falling back to environment variables when needed.
   */
  private resolveWebSearchConfig(config?: WebSearchToolConfig): WebSearchToolConfig {
    if (config) {
      return config;
    }

    const tavilyKey = process.env.TAVILY_API_KEY;
    if (tavilyKey) {
      return {
        provider: 'tavily',
        apiKey: tavilyKey,
      };
    }

    const braveKey = process.env.BRAVE_API_KEY;
    if (braveKey) {
      return {
        provider: 'brave',
        apiKey: braveKey,
      };
    }

    const googleKey = process.env.GOOGLE_SEARCH_API_KEY;
    const googleCx = process.env.GOOGLE_SEARCH_ENGINE_ID;
    if (googleKey && googleCx) {
      return {
        provider: 'google',
        apiKey: googleKey,
        googleSearchEngineId: googleCx,
      };
    }

    return { provider: 'mock' };
  }

  /**
   * Register a tool
   */
  registerTool(tool: BaseTool): void {
    this.tools.set(tool.name, tool);
    logger.info('Tool registered', { tool: tool.name });
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
        properties: Record<string, unknown>;
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
    input: Record<string, unknown>,
    context: ToolContext
  ): Promise<ToolExecutionResult> {
    const tool = this.getTool(toolName);

    if (!tool) {
      logger.error('Tool not found in registry', { toolName });
      return {
        success: false,
        error: `Tool '${toolName}' not found`,
        duration_ms: 0,
      };
    }

    try {
      logger.info('Tool execution started', { toolName, input });
      const result = await tool.execute(input, context);

      if (result.success) {
        logger.info('Tool execution successful', { toolName, duration_ms: result.duration_ms });
      } else {
        logger.error('Tool execution failed', { toolName, error: result.error });
      }

      return result;
    } catch (error) {
      logger.error('Tool execution error', { toolName, error });
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
