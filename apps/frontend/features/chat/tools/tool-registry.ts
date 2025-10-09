/**
 * Tool Registry - Maps database tool names to LangChain tool implementations
 *
 * This registry connects the tools selected in the UI (stored in the database)
 * to the actual LangChain tool implementations (hard-coded in the codebase).
 *
 * When an agent has tools assigned via the database, this registry is used to
 * load the corresponding LangChain tools for use in conversations.
 */

import { DynamicTool } from '@langchain/core/tools';
import type { StructuredToolInterface } from '@langchain/core/tools';

// Import existing LangChain tools
import {
  fdaDatabaseTool,
  fdaGuidanceTool,
  regulatoryCalculatorTool,
} from './fda-tools';

import {
  clinicalTrialsSearchTool,
  studyDesignTool,
  endpointSelectorTool,
} from './clinical-trials-tools';

import {
  tavilySearchTool,
  // wikipediaTool, // Removed - use Tavily web search instead
  arxivSearchTool,
  pubmedSearchTool,
  euMedicalDeviceTool,
} from './external-api-tools';

/**
 * Tool Status Metadata
 * Tracks which tools are fully implemented vs placeholders
 */
export const TOOL_STATUS: Record<string, 'available' | 'coming_soon'> = {
  'Web Search': 'available',
  'Document Analysis': 'coming_soon',
  'Data Calculator': 'available',
  'Regulatory Database Search': 'available',
  'Literature Search': 'available',
  'Statistical Analysis': 'coming_soon',
  'Timeline Generator': 'coming_soon',
  'Budget Calculator': 'available',
  'Risk Assessment Matrix': 'coming_soon',
  'Compliance Checker': 'available',
  'Citation Generator': 'coming_soon',
  'Template Generator': 'coming_soon',
  'Clinical Trials Search': 'available',
  'Study Design': 'available',
  'Endpoint Selection': 'available',
};

/**
 * Tool Registry - Maps database tool names to LangChain implementations
 *
 * Format: { 'Database Tool Name': [array of LangChain tools] }
 *
 * - One database tool can map to multiple LangChain tools
 * - Example: "Literature Search" loads both PubMed and ArXiv tools
 *
 * ✅ = Fully implemented and available
 * 🚧 = Coming soon (placeholder implementation)
 */
export const TOOL_REGISTRY: Record<string, StructuredToolInterface[]> = {
  // Web Search
  'Web Search': [tavilySearchTool],

  // Document Analysis (placeholder - implement actual tool later)
  'Document Analysis': [
    new DynamicTool({
      name: 'document_analysis',
      description: 'Analyze documents for key information and insights',
      func: async (input: string) => {
        return JSON.stringify({
          message: 'Document analysis tool - implementation coming soon',
          input,
        });
      },
    }),
  ],

  // Data Calculator (placeholder - could use Python REPL or calculator tool)
  'Data Calculator': [
    new DynamicTool({
      name: 'data_calculator',
      description: 'Perform complex calculations and data analysis',
      func: async (input: string) => {
        try {
          // Simple eval for now - in production, use a safer calculator library
          const result = eval(input);
          return JSON.stringify({ result, expression: input });
        } catch (error) {
          return JSON.stringify({
            error: 'Invalid calculation',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
    }),
  ],

  // Regulatory Database Search
  'Regulatory Database Search': [
    fdaDatabaseTool,
    fdaGuidanceTool,
    euMedicalDeviceTool,
  ],

  // Literature Search - Combines multiple literature sources
  'Literature Search': [
    pubmedSearchTool,
    arxivSearchTool,
    // wikipediaTool removed - agents should use Web Search (Tavily) for current information
  ],

  // Statistical Analysis (placeholder)
  'Statistical Analysis': [
    new DynamicTool({
      name: 'statistical_analysis',
      description: 'Perform statistical tests and analysis',
      func: async (input: string) => {
        return JSON.stringify({
          message: 'Statistical analysis tool - implementation coming soon',
          input,
        });
      },
    }),
  ],

  // Timeline Generator (placeholder)
  'Timeline Generator': [
    new DynamicTool({
      name: 'timeline_generator',
      description: 'Generate project timelines and Gantt charts',
      func: async (input: string) => {
        return JSON.stringify({
          message: 'Timeline generator - implementation coming soon',
          input,
        });
      },
    }),
  ],

  // Budget Calculator
  'Budget Calculator': [
    regulatoryCalculatorTool,
  ],

  // Risk Assessment Matrix (placeholder)
  'Risk Assessment Matrix': [
    new DynamicTool({
      name: 'risk_assessment',
      description: 'Assess and visualize project risks',
      func: async (input: string) => {
        return JSON.stringify({
          message: 'Risk assessment tool - implementation coming soon',
          input,
        });
      },
    }),
  ],

  // Compliance Checker (uses FDA guidance tool)
  'Compliance Checker': [
    fdaGuidanceTool,
  ],

  // Citation Generator (placeholder)
  'Citation Generator': [
    new DynamicTool({
      name: 'citation_generator',
      description: 'Generate properly formatted citations',
      func: async (input: string) => {
        return JSON.stringify({
          message: 'Citation generator - implementation coming soon',
          input,
        });
      },
    }),
  ],

  // Template Generator (placeholder)
  'Template Generator': [
    new DynamicTool({
      name: 'template_generator',
      description: 'Generate document templates',
      func: async (input: string) => {
        return JSON.stringify({
          message: 'Template generator - implementation coming soon',
          input,
        });
      },
    }),
  ],

  // Clinical Trials tools
  'Clinical Trials Search': [
    clinicalTrialsSearchTool,
  ],

  'Study Design': [
    studyDesignTool,
  ],

  'Endpoint Selection': [
    endpointSelectorTool,
  ],
};

/**
 * Get LangChain tools by database tool name
 */
export function getToolsByName(toolName: string): StructuredToolInterface[] {
  return TOOL_REGISTRY[toolName] || [];
}

/**
 * Get LangChain tools by database tool IDs
 *
 * @param toolNames Array of tool names from database
 * @returns Flat array of all LangChain tools for those names
 */
export function getToolsByNames(toolNames: string[]): StructuredToolInterface[] {
  const tools: StructuredToolInterface[] = [];

  for (const name of toolNames) {
    const matchedTools = getToolsByName(name);
    if (matchedTools.length > 0) {
      tools.push(...matchedTools);
      console.log(`✅ Loaded ${matchedTools.length} LangChain tool(s) for "${name}"`);
    } else {
      console.warn(`⚠️  No LangChain implementation found for tool: "${name}"`);
    }
  }

  return tools;
}

/**
 * List all available tool names in the registry
 */
export function listAvailableTools(): string[] {
  return Object.keys(TOOL_REGISTRY);
}

/**
 * Get tool count for a database tool name
 */
export function getToolCount(toolName: string): number {
  return TOOL_REGISTRY[toolName]?.length || 0;
}
