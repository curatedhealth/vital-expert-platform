/**
 * Dynamic Tool Loader
 *
 * Loads tools dynamically from database and maps to LangChain tool instances
 * No hardcoding - all tools are configured in the database
 */

import * as clinicalStandards from './clinical-standards-tools';
import * as evidenceRetrieval from './evidence-retrieval';
import * as expertTools from './expert-tools';
import { toolRegistryService, type Tool } from './tool-registry-service';

/**
 * Tool factory - maps implementation_path to actual tool creation function
 */
const TOOL_FACTORY: Record<string, () => any> = {
  // Expert Tools (Base 4)
  'expert-tools.createWebSearchTool': expertTools.createWebSearchTool,
  'expert-tools.createCalculatorTool': expertTools.createCalculatorTool,
  'expert-tools.createKnowledgeBaseTool': expertTools.createKnowledgeBaseTool,
  'expert-tools.createPubMedSearchTool': expertTools.createPubMedSearchTool,

  // Evidence Retrieval (5)
  'evidence-retrieval.createClinicalTrialsSearchTool': evidenceRetrieval.createClinicalTrialsSearchTool,
  'evidence-retrieval.createFDAApprovalsSearchTool': evidenceRetrieval.createFDAApprovalsSearchTool,
  'evidence-retrieval.createEMASearchTool': evidenceRetrieval.createEMASearchTool,
  'evidence-retrieval.createWHOEssentialMedicinesSearchTool': evidenceRetrieval.createWHOEssentialMedicinesSearchTool,
  'evidence-retrieval.createMultiRegionRegulatorySearchTool': evidenceRetrieval.createMultiRegionRegulatorySearchTool,

  // Clinical Standards (4)
  'clinical-standards-tools.createICHGuidelinesSearchTool': clinicalStandards.createICHGuidelinesSearchTool,
  'clinical-standards-tools.createISOStandardsSearchTool': clinicalStandards.createISOStandardsSearchTool,
  'clinical-standards-tools.createDiMeResourcesSearchTool': clinicalStandards.createDiMeResourcesSearchTool,
  'clinical-standards-tools.createICHOMStandardSetsSearchTool': clinicalStandards.createICHOMStandardSetsSearchTool
};

class DynamicToolLoader {
  private toolInstancesCache: Map<string, any> = new Map();

  /**
   * Load a single tool instance by tool_key
   */
  loadToolByKey(toolKey: string): any | null {
    // Check cache first
    if (this.toolInstancesCache.has(toolKey)) {
      return this.toolInstancesCache.get(toolKey);
    }

    // Find tool in factory
    const factoryKey = Object.keys(TOOL_FACTORY).find(key =>
      key.toLowerCase().includes(toolKey.toLowerCase())
    );

    if (!factoryKey) {
      console.warn(`No tool factory found for key: ${toolKey}`);
      return null;
    }

    try {
      const toolInstance = TOOL_FACTORY[factoryKey]();
      this.toolInstancesCache.set(toolKey, toolInstance);
      return toolInstance;
    } catch (error) {
      console.error(`Failed to load tool ${toolKey}:`, error);
      return null;
    }
  }

  /**
   * Load tool instance from database Tool record
   */
  loadToolFromRecord(tool: Tool): any | null {
    // Check if tool is active
    if (!tool.is_active) {
      console.warn(`Tool ${tool.tool_key} is inactive`);
      return null;
    }

    // Check if API key is required and available
    if (tool.requires_api_key && tool.api_key_env_var) {
      const apiKey = process.env[tool.api_key_env_var];
      if (!apiKey) {
        console.warn(`Missing API key ${tool.api_key_env_var} for tool ${tool.tool_key}`);
        // Still return the tool - it will handle missing keys gracefully
      }
    }

    // Load tool instance
    if (tool.implementation_path) {
      const factoryFn = TOOL_FACTORY[tool.implementation_path];
      if (factoryFn) {
        try {
          return factoryFn();
        } catch (error) {
          console.error(`Failed to instantiate tool ${tool.tool_key}:`, error);
          return null;
        }
      } else {
        console.warn(`No factory function found for ${tool.implementation_path}`);
        return null;
      }
    }

    return this.loadToolByKey(tool.tool_key);
  }

  /**
   * Load multiple tool instances from database Tool records
   */
  loadToolsFromRecords(tools: Tool[]): any[] {
    const instances: any[] = [];

    for (const tool of tools) {
      const instance = this.loadToolFromRecord(tool);
      if (instance) {
        instances.push(instance);
      }
    }

    return instances;
  }

  /**
   * Load all active tools from database
   */
  async loadAllActiveTools(): Promise<any[]> {
    try {
      const tools = await toolRegistryService.getAllTools(false); // Only active
      return this.loadToolsFromRecords(tools);
    } catch (error) {
      console.error('Failed to load tools from database:', error);
      // Fallback to hardcoded tools if database fails
      console.warn('Falling back to hardcoded tools');
      return this.getFallbackTools();
    }
  }

  /**
   * Load tools assigned to a specific agent
   */
  async loadAgentTools(agentId: string): Promise<any[]> {
    try {
      const assignments = await toolRegistryService.getAgentTools(agentId, true); // Only enabled
      const tools = assignments
        .filter(a => a.tool)
        .map(a => a.tool!)
        .sort((a, b) => {
          // Sort by priority (assignments have priority)
          const priorityA = assignments.find(x => x.tool_id === a.id)?.priority || 0;
          const priorityB = assignments.find(x => x.tool_id === b.id)?.priority || 0;
          return priorityB - priorityA;
        });

      return this.loadToolsFromRecords(tools);
    } catch (error) {
      console.error(`Failed to load tools for agent ${agentId}:`, error);
      // Fallback to all active tools
      console.warn('Falling back to all active tools');
      return this.loadAllActiveTools();
    }
  }

  /**
   * Load tools by category
   */
  async loadToolsByCategory(categoryName: string): Promise<any[]> {
    try {
      const tools = await toolRegistryService.getToolsByCategory(categoryName);
      return this.loadToolsFromRecords(tools);
    } catch (error) {
      console.error(`Failed to load tools for category ${categoryName}:`, error);
      return [];
    }
  }

  /**
   * Load tools by tags
   */
  async loadToolsByTags(tagNames: string[]): Promise<any[]> {
    try {
      const tools = await toolRegistryService.getToolsByTags(tagNames);
      return this.loadToolsFromRecords(tools);
    } catch (error) {
      console.error(`Failed to load tools for tags ${tagNames.join(', ')}:`, error);
      return [];
    }
  }

  /**
   * Fallback: Get all hardcoded tools if database fails
   */
  private getFallbackTools(): any[] {
    console.log('Using fallback tool loading (all 13 tools)');
    return Object.values(TOOL_FACTORY).map(fn => {
      try {
        return fn();
      } catch (error) {
        console.error('Failed to load fallback tool:', error);
        return null;
      }
    }).filter(Boolean);
  }

  /**
   * Clear tool instance cache
   */
  clearCache(): void {
    this.toolInstancesCache.clear();
  }

  /**
   * Get tool metadata from database
   */
  async getToolMetadata(toolKey: string): Promise<Tool | null> {
    try {
      return await toolRegistryService.getToolByKey(toolKey);
    } catch (error) {
      console.error(`Failed to get metadata for tool ${toolKey}:`, error);
      return null;
    }
  }

  /**
   * Register a new tool factory dynamically
   */
  registerToolFactory(implementationPath: string, factory: () => any): void {
    TOOL_FACTORY[implementationPath] = factory;
    console.log(`Registered tool factory: ${implementationPath}`);
  }
}

export const dynamicToolLoader = new DynamicToolLoader();
export default dynamicToolLoader;
