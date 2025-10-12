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

// Import existing LangChain tools
import {
  clinicalTrialsSearchTool,
  studyDesignTool,
  endpointSelectorTool,
} from './clinical-trials-tools';
import {
  tavilySearchTool,
  arxivSearchTool,
  pubmedSearchTool,
  euMedicalDeviceTool,
} from './external-api-tools';
import {
  fdaDatabaseTool,
  fdaGuidanceTool,
  regulatoryCalculatorTool,
} from './fda-tools';

import type { StructuredToolInterface } from '@langchain/core/tools';

/**
 * Tool Status Metadata
 * Tracks which tools are fully implemented and available
 */
export const TOOL_STATUS: Record<string, 'available' | 'coming_soon'> = {
  'Web Search': 'available',
  'Data Calculator': 'available',
  'Regulatory Database Search': 'available',
  'Literature Search': 'available',
  'Budget Calculator': 'available',
  'Compliance Checker': 'available',
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
 */
export const TOOL_REGISTRY: Record<string, StructuredToolInterface[]> = {
  // Web Search
  'Web Search': [tavilySearchTool],

  // Data Calculator
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
  ],

  // Budget Calculator
  'Budget Calculator': [
    regulatoryCalculatorTool,
  ],

  // Compliance Checker (uses FDA guidance tool)
  'Compliance Checker': [
    fdaGuidanceTool,
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
 * Get available tools for an agent
 */
export function getAvailableTools(toolNames: string[]): StructuredToolInterface[] {
  const tools: StructuredToolInterface[] = [];
  
  for (const toolName of toolNames) {
    const toolGroup = TOOL_REGISTRY[toolName];
    if (toolGroup) {
      tools.push(...toolGroup);
    }
  }
  
  return tools;
}

/**
 * Get all available tool names
 */
export function getAllAvailableToolNames(): string[] {
  return Object.keys(TOOL_REGISTRY);
}

/**
 * Check if a tool is available
 */
export function isToolAvailable(toolName: string): boolean {
  return TOOL_STATUS[toolName] === 'available';
}