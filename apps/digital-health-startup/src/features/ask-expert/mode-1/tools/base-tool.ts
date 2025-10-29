/**
 * Base Tool Interface
 * 
 * Abstract base class for all tools in Mode 1
 * Follows SOLID principles and industry best practices
 */

export interface ToolContext {
  tenant_id?: string;
  user_id?: string;
  session_id?: string;
  agent_id?: string;
  [key: string]: any;
}

export interface ToolExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  duration_ms: number;
  metadata?: Record<string, any>;
}

/**
 * Abstract base class for all tools
 */
export abstract class BaseTool {
  abstract readonly name: string;
  abstract readonly description: string;

  /**
   * Execute the tool with given input and context
   */
  abstract execute(
    input: Record<string, any>,
    context: ToolContext
  ): Promise<ToolExecutionResult>;

  /**
   * Get JSON Schema for tool parameters (for LLM function calling)
   */
  abstract getSchema(): {
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
  };

  /**
   * Validate input parameters before execution
   */
  protected validateInput(input: Record<string, any>): void {
    const schema = this.getSchema();
    const required = schema.function.parameters.required || [];
    
    for (const field of required) {
      if (!(field in input)) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }
  }
}

