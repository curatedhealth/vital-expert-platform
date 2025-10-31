/**
 * LangChain Tool Adapter
 * 
 * Converts BaseTool implementations to LangChain StructuredToolInterface
 * for integration with LangChain's function calling system
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { BaseTool, ToolContext, ToolSchema } from './base-tool';
import { ToolRegistry } from './tool-registry';
import { z } from 'zod';

/**
 * Convert BaseTool to LangChain StructuredToolInterface
 */
export function convertToolToLangChain(
  tool: BaseTool,
  registry: ToolRegistry
): StructuredToolInterface {
  const schema: ToolSchema = tool.getSchema();
  const paramsSchema = schema.function.parameters;

  // Convert JSON Schema to Zod schema
  const zodSchema = convertJSONSchemaToZod(paramsSchema);

  // Infer input type from Zod schema
  type InputType = z.infer<typeof zodSchema>;

  return new DynamicStructuredTool({
    name: tool.name,
    description: tool.description,
    schema: zodSchema,
    func: async (input: InputType): Promise<string> => {
      // Execute tool through registry
      const context: ToolContext = {};

      const result = await registry.executeTool(tool.name, input as Record<string, unknown>, context);

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
  registry: ToolRegistry,
  allowedToolNames?: string[]
): StructuredToolInterface[] {
  const hasExplicitList = Array.isArray(allowedToolNames);
  const normalizedNames = hasExplicitList
    ? allowedToolNames
        .map((name) => (typeof name === 'string' ? name.trim() : ''))
        .filter((name): name is string => name.length > 0)
    : [];

  if (hasExplicitList) {
    if (normalizedNames.length === 0) {
      return [];
    }

    const allowedSet = new Set(normalizedNames);
    const tools = Array.from(allowedSet)
      .map((name) => registry.getTool(name))
      .filter((tool): tool is BaseTool => Boolean(tool));

    return tools.map((tool) => convertToolToLangChain(tool, registry));
  }

  const allTools = registry.getAllTools();

  return allTools.map((tool) => convertToolToLangChain(tool, registry));
}

/**
 * Convert JSON Schema to Zod schema (simplified version)
 * This is a basic converter - in production, you might want a more robust solution
 */
type JSONSchemaProperty = {
  type: string;
  enum?: string[];
  description?: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  items?: JSONSchemaProperty;
};

function convertJSONSchemaToZod(jsonSchema: {
  type: string;
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, prop] of Object.entries(jsonSchema.properties || {})) {
    let zodType: z.ZodTypeAny;

    switch (prop.type) {
      case 'string':
        zodType = z.string();
        if (prop.enum && prop.enum.length > 0) {
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
        // If items type is specified, use it; otherwise use unknown
        if (prop.items) {
          const itemType = prop.items.type === 'string' ? z.string() :
                          prop.items.type === 'number' || prop.items.type === 'integer' ? z.number() :
                          prop.items.type === 'boolean' ? z.boolean() :
                          z.unknown();
          zodType = z.array(itemType);
        } else {
          zodType = z.array(z.unknown());
        }
        break;

      default:
        zodType = z.unknown();
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
