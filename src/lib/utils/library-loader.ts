/**
 * Dynamic Library Loader for Digital Health AI Agent System
 * Loads capabilities and prompts from external markdown library files
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import {
  DigitalHealthAgentConfig,
  Capability,
  PromptTemplate
} from '@/types/digital-health-agent.types';

export class LibraryLoader {
  private readonly basePath: string;
  private readonly agentsConfigPath: string;
  private readonly capabilitiesLibraryPath: string;
  private readonly promptsLibraryPath: string;

  private agentsConfigCache: string | null = null;
  private capabilitiesLibraryCache: string | null = null;
  private promptsLibraryCache: string | null = null;

  constructor() {
    // Set the exact paths to your documentation files
    this.basePath = join(process.cwd(), 'docs', 'Agents_Cap_Libraries');
    this.agentsConfigPath = join(this.basePath, '1_agent_setup_configuration_UPDATED.md');
    this.capabilitiesLibraryPath = join(this.basePath, '2_capabilities_library.md');
    this.promptsLibraryPath = join(this.basePath, '3_prompt_library.md');
  }

  /**
   * Load a markdown document from the specified path
   */
  private async loadMarkdownDocument(path: string): Promise<string> {
    try {
      const content = await fs.readFile(path, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Document not found at: ${path}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the agents configuration document with caching
   */
  private async getAgentsConfig(): Promise<string> {
    if (!this.agentsConfigCache) {
      this.agentsConfigCache = await this.loadMarkdownDocument(this.agentsConfigPath);
    }
    return this.agentsConfigCache;
  }

  /**
   * Get the capabilities library document with caching
   */
  private async getCapabilitiesLibrary(): Promise<string> {
    if (!this.capabilitiesLibraryCache) {
      this.capabilitiesLibraryCache = await this.loadMarkdownDocument(this.capabilitiesLibraryPath);
    }
    return this.capabilitiesLibraryCache;
  }

  /**
   * Get the prompts library document with caching
   */
  private async getPromptsLibrary(): Promise<string> {
    if (!this.promptsLibraryCache) {
      this.promptsLibraryCache = await this.loadMarkdownDocument(this.promptsLibraryPath);
    }
    return this.promptsLibraryCache;
  }

  /**
   * Load a capability from Document 2 by parsing the markdown
   */
  async loadCapability(capabilityTitle: string): Promise<Capability | null> {
    try {
      const capabilitiesLibrary = await this.getCapabilitiesLibrary();

      // Look for capability sections by title
      const titlePattern = new RegExp(`### (.*)${this.escapeRegex(capabilityTitle)}`, 'i');
      const titleMatch = capabilitiesLibrary.match(titlePattern);

      if (!titleMatch) {
        console.warn(`Capability title not found: ${capabilityTitle}`);
        return null;
      }

      // Find the JSON block after the title
      const startIndex = capabilitiesLibrary.indexOf(titleMatch[0]);
      const jsonStartPattern = /```json\s*\n/;
      const jsonEndPattern = /\n```/;

      const searchArea = capabilitiesLibrary.substring(startIndex);
      const jsonStart = searchArea.search(jsonStartPattern);

      if (jsonStart === -1) {
        console.warn(`No JSON block found for capability: ${capabilityTitle}`);
        return null;
      }

      const jsonStartIndex = startIndex + jsonStart;
      const afterJsonStart = capabilitiesLibrary.substring(jsonStartIndex);
      const jsonStartMatch = afterJsonStart.match(jsonStartPattern);

      if (!jsonStartMatch) return null;

      const contentStart = jsonStartIndex + jsonStartMatch[0].length;
      const contentArea = capabilitiesLibrary.substring(contentStart);
      const jsonEndMatch = contentArea.match(jsonEndPattern);

      if (!jsonEndMatch) {
        console.warn(`No closing JSON block found for capability: ${capabilityTitle}`);
        return null;
      }

      const jsonContent = contentArea.substring(0, jsonEndMatch.index);

      try {
        const capabilityData = JSON.parse(jsonContent.trim());
        return capabilityData as Capability;
      } catch (parseError) {
        console.error(`Error parsing capability JSON for ${capabilityTitle}:`, parseError);
        return null;
      }
    } catch (error) {
      console.error(`Error loading capability ${capabilityTitle}:`, error);
      return null;
    }
  }

  /**
   * Load a prompt from Document 3 by parsing the markdown
   */
  async loadPrompt(promptTitle: string): Promise<PromptTemplate | null> {
    try {
      const promptsLibrary = await this.getPromptsLibrary();

      // Look for prompt sections by title
      const titlePattern = new RegExp(`### (.*)${this.escapeRegex(promptTitle)}`, 'i');
      const titleMatch = promptsLibrary.match(titlePattern);

      if (!titleMatch) {
        console.warn(`Prompt title not found: ${promptTitle}`);
        return null;
      }

      // Find the JSON block after the title
      const startIndex = promptsLibrary.indexOf(titleMatch[0]);
      const jsonStartPattern = /```json\s*\n/;
      const jsonEndPattern = /\n```/;

      const searchArea = promptsLibrary.substring(startIndex);
      const jsonStart = searchArea.search(jsonStartPattern);

      if (jsonStart === -1) {
        console.warn(`No JSON block found for prompt: ${promptTitle}`);
        return null;
      }

      const jsonStartIndex = startIndex + jsonStart;
      const afterJsonStart = promptsLibrary.substring(jsonStartIndex);
      const jsonStartMatch = afterJsonStart.match(jsonStartPattern);

      if (!jsonStartMatch) return null;

      const contentStart = jsonStartIndex + jsonStartMatch[0].length;
      const contentArea = promptsLibrary.substring(contentStart);
      const jsonEndMatch = contentArea.match(jsonEndPattern);

      if (!jsonEndMatch) {
        console.warn(`No closing JSON block found for prompt: ${promptTitle}`);
        return null;
      }

      const jsonContent = contentArea.substring(0, jsonEndMatch.index);

      try {
        const promptData = JSON.parse(jsonContent.trim());
        return promptData as PromptTemplate;
      } catch (parseError) {
        console.error(`Error parsing prompt JSON for ${promptTitle}:`, parseError);
        return null;
      }
    } catch (error) {
      console.error(`Error loading prompt ${promptTitle}:`, error);
      return null;
    }
  }

  /**
   * Load agent configuration from Document 1 by parsing the markdown
   */
  async loadAgentConfig(agentName: string): Promise<DigitalHealthAgentConfig | null> {
    try {
      const agentsConfig = await this.getAgentsConfig();

      // Look for agent configuration by name
      const namePattern = new RegExp(`"name"\\s*:\\s*"${this.escapeRegex(agentName)}"`, 'i');
      const nameMatch = agentsConfig.match(namePattern);

      if (!nameMatch) {
        console.warn(`Agent configuration not found: ${agentName}`);
        return null;
      }

      // Find the JSON block containing this agent
      const matchIndex = agentsConfig.indexOf(nameMatch[0]);

      // Search backward to find the start of the JSON block
      const beforeMatch = agentsConfig.substring(0, matchIndex);
      const jsonStartPattern = /```json\s*\n/g;
      let lastJsonStart = -1;
      let match;

      while ((match = jsonStartPattern.exec(beforeMatch)) !== null) {
        lastJsonStart = match.index;
      }

      if (lastJsonStart === -1) {
        console.warn(`No JSON block start found for agent: ${agentName}`);
        return null;
      }

      // Find the end of this JSON block
      const fromJsonStart = agentsConfig.substring(lastJsonStart);
      const jsonEndPattern = /\n```/;
      const jsonEndMatch = fromJsonStart.match(jsonEndPattern);

      if (!jsonEndMatch) {
        console.warn(`No JSON block end found for agent: ${agentName}`);
        return null;
      }

      // Extract the JSON content
      const jsonStartMatch = fromJsonStart.match(/```json\s*\n/);
      if (!jsonStartMatch) return null;

      const contentStart = jsonStartMatch[0].length;
      const jsonContent = fromJsonStart.substring(contentStart, jsonEndMatch.index);

      try {
        const agentData = JSON.parse(jsonContent.trim());
        return agentData as DigitalHealthAgentConfig;
      } catch (parseError) {
        console.error(`Error parsing agent JSON for ${agentName}:`, parseError);
        return null;
      }
    } catch (error) {
      console.error(`Error loading agent config ${agentName}:`, error);
      return null;
    }
  }

  /**
   * Extract all agent configurations from Document 1
   */
  async extractAllAgents(): Promise<DigitalHealthAgentConfig[]> {
    try {
      const agentsConfig = await this.getAgentsConfig();
      const agents: DigitalHealthAgentConfig[] = [];

      // Find all JSON blocks that contain agent configurations
      const jsonBlockPattern = /```json\s*\n([\s\S]*?)\n```/g;
      let match;

      while ((match = jsonBlockPattern.exec(agentsConfig)) !== null) {
        const jsonContent = match[1].trim();

        try {
          const parsed = JSON.parse(jsonContent);

          // Check if this JSON block represents an agent configuration
          if (parsed.name && parsed.display_name && parsed.system_prompt) {
            agents.push(parsed as DigitalHealthAgentConfig);
          }
        } catch (parseError) {
          // Skip invalid JSON blocks
          continue;
        }
      }

      return agents;
    } catch (error) {
      console.error('Error extracting all agents:', error);
      return [];
    }
  }

  /**
   * Extract all capabilities from Document 2
   */
  async extractAllCapabilities(): Promise<Capability[]> {
    try {
      const capabilitiesLibrary = await this.getCapabilitiesLibrary();
      const capabilities: Capability[] = [];

      // Find all JSON blocks that contain capability configurations
      const jsonBlockPattern = /```json\s*\n([\s\S]*?)\n```/g;
      let match;

      while ((match = jsonBlockPattern.exec(capabilitiesLibrary)) !== null) {
        const jsonContent = match[1].trim();

        try {
          const parsed = JSON.parse(jsonContent);

          // Check if this JSON block represents a capability
          if (parsed.capability_id && parsed.title && parsed.methodology) {
            capabilities.push(parsed as Capability);
          }
        } catch (parseError) {
          // Skip invalid JSON blocks
          continue;
        }
      }

      return capabilities;
    } catch (error) {
      console.error('Error extracting all capabilities:', error);
      return [];
    }
  }

  /**
   * Extract all prompts from Document 3
   */
  async extractAllPrompts(): Promise<PromptTemplate[]> {
    try {
      const promptsLibrary = await this.getPromptsLibrary();
      const prompts: PromptTemplate[] = [];

      // Find all JSON blocks that contain prompt configurations
      const jsonBlockPattern = /```json\s*\n([\s\S]*?)\n```/g;
      let match;

      while ((match = jsonBlockPattern.exec(promptsLibrary)) !== null) {
        const jsonContent = match[1].trim();

        try {
          const parsed = JSON.parse(jsonContent);

          // Check if this JSON block represents a prompt
          if (parsed.prompt_id && parsed.prompt_starter && parsed.detailed_prompt) {
            prompts.push(parsed as PromptTemplate);
          }
        } catch (parseError) {
          // Skip invalid JSON blocks
          continue;
        }
      }

      return prompts;
    } catch (error) {
      console.error('Error extracting all prompts:', error);
      return [];
    }
  }

  /**
   * Clear caches to force reload of documents
   */
  clearCache(): void {
    this.agentsConfigCache = null;
    this.capabilitiesLibraryCache = null;
    this.promptsLibraryCache = null;
  }

  /**
   * Get library status and health check
   */
  async getLibraryStatus(): Promise<{
    agents_available: number;
    capabilities_available: number;
    prompts_available: number;
    documents_accessible: boolean;
    last_loaded: string;
  }> {
    try {
      const [agents, capabilities, prompts] = await Promise.all([
        this.extractAllAgents(),
        this.extractAllCapabilities(),
        this.extractAllPrompts()
      ]);

      return {
        agents_available: agents.length,
        capabilities_available: capabilities.length,
        prompts_available: prompts.length,
        documents_accessible: true,
        last_loaded: new Date().toISOString()
      };
    } catch (error) {
      return {
        agents_available: 0,
        capabilities_available: 0,
        prompts_available: 0,
        documents_accessible: false,
        last_loaded: new Date().toISOString()
      };
    }
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Singleton instance for global use
export const libraryLoader = new LibraryLoader();