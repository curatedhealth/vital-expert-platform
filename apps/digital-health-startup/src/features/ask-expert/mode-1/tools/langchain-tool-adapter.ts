/**
 * LangChain Tool Adapter
 * 
 * Converts BaseTool implementations to LangChain StructuredToolInterface
 * for integration with LangChain's function calling system
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { BaseTool, ToolContext } from './base-tool';
import { ToolRegistry } from './tool-registry';
import { z } from 'zod';

/**
 * Convert BaseTool to LangChain StructuredToolInterface
 */
export function convertToolToLangChain(
  tool: BaseTool,
  registry: ToolRegistry
): StructuredToolInterface {
  const schema = tool.getSchema();
  const paramsSchema = schema.function.parameters;

  // Convert JSON Schema to Zod schema
  const zodSchema = convertJSONSchemaToZod(paramsSchema);

  return new DynamicStructuredTool({
    name: tool.name,
    description: tool.description,
    schema: zodSchema,
    func: async (input: any) => {
      // Execute tool through registry
      const context: ToolContext = {
        // Context will be passed when executing
      };

      const result = await registry.executeTool(tool.name, input, context);

      if (!result.success) {
        throw new Error(result.error || 'Tool execution failed');
      }

      // Return string representation of result
      return JSON.stringify(result.result);
    },
  });
}

/**
 * Convert all tools in registry to LangChain tools
 */
export function convertRegistryToLangChainTools(
  registry: ToolRegistry
): StructuredToolInterface[] {
  return registry
    .getAllTools()
    .map((tool) => convertToolToLangChain(tool, registry));
}

/**
 * Convert JSON Schema to Zod schema (simplified version)
 * This is a basic converter - in production, you might want a more robust solution
 */
function convertJSONSchemaToZod(jsonSchema: {
  type: string;
  properties: Record<string, any>;
  required?: string[];
  additionalProperties?: boolean;
}): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, prop] of Object.entries(jsonSchema.properties || {})) {
    let zodType: z.ZodTypeAny;

    switch (prop.type) {
      case 'string':
        zodType = z.string();
        if (prop.enum) {
          zodType = z.enum(prop.enum as [string, ...string[]]);
        }
        break;

      case 'number':
      case 'integer':
        zodType = prop.type === 'integer' ? z.number().int() : z.number();
        break;

      case 'boolean':
        zodType = z.boolean();
        break;

      case 'object':
        zodType = z.object(
          prop.properties
            ? convertJSONSchemaToZod({
                type: 'object',
                properties: prop.properties,
                required: prop.required,
              }).shape
            : {}
        );
        break;

      case 'array':
        zodType = z.array(z.any());
        break;

      default:
        zodType = z.any();
    }

    if (prop.description) {
      zodType = zodType.describe(prop.description);
    }

    if (!jsonSchema.required?.includes(key)) {
      zodType = zodType.optional();
    }

    shape[key] = zodType;
  }

  return z.object(shape);
}

