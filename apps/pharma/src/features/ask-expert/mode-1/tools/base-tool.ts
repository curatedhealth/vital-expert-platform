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
  [key: string]: unknown;
}

export interface ToolExecutionResult<TResult = unknown, TMetadata extends Record<string, unknown> = Record<string, unknown>> {
  success: boolean;
  result?: TResult;
  error?: string;
  duration_ms: number;
  metadata?: TMetadata;
}

export type ToolSchema = {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required: string[];
      additionalProperties?: boolean;
    };
  };
};

/**
 * Abstract base class for all tools
 */
export abstract class BaseTool<TParams extends Record<string, unknown> = Record<string, unknown>, TResult = unknown, TMetadata extends Record<string, unknown> = Record<string, unknown>> {
  abstract readonly name: string;
  abstract readonly description: string;

  /**
   * Execute the tool with given input and context
   */
  abstract execute(
    input: TParams,
    context: ToolContext
  ): Promise<ToolExecutionResult<TResult, TMetadata>>;

  /**
   * Get JSON Schema for tool parameters (for LLM function calling)
   */
  abstract getSchema(): ToolSchema;

  /**
   * Validate input parameters before execution
   */
  protected validateInput(input: Partial<TParams> | TParams): void {
    const schema = this.getSchema();
    const required = schema.function.parameters.required || [];
    
    for (const field of required) {
      if (!(field in input)) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }
  }
}
