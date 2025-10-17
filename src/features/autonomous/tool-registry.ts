import { Tool } from '@langchain/core/tools';

/**
 * Dynamic Tool Registry for Autonomous Agent
 * 
 * This registry manages tool loading and provides dynamic tool access
 * for the autonomous agent system, including RAG tools that are loaded
 * from the enhanced LangChain service.
 */

export interface ToolMetadata {
  name: string;
  description: string;
  category: 'fda' | 'clinical' | 'external' | 'rag' | 'knowledge';
  cost: number;
  estimatedDuration: number;
  requiresAuth: boolean;
  dependencies: string[];
}

export interface ToolRegistryConfig {
  enableRAG: boolean;
  enableKnowledgeSearch: boolean;
  maxTools: number;
  cacheTimeout: number; // in milliseconds
}

export class ToolRegistry {
  private static tools: Map<string, Tool> = new Map();
  private static metadata: Map<string, ToolMetadata> = new Map();
  private static config: ToolRegistryConfig;
  private static ragService: any = null;
  private static knowledgeService: any = null;
  private static initialized: boolean = false;

  /**
   * Initialize the tool registry with configuration
   */
  static initialize(config: Partial<ToolRegistryConfig> = {}): void {
    console.log('🔧 [ToolRegistry] Initializing tool registry');
    
    this.config = {
      enableRAG: true,
      enableKnowledgeSearch: true,
      maxTools: 50,
      cacheTimeout: 300000, // 5 minutes
      ...config
    };

    this.registerBuiltInTools();
    this.initialized = true;
    
    console.log('✅ [ToolRegistry] Tool registry initialized with', this.tools.size, 'tools');
  }

  /**
   * Register a tool in the registry
   */
  static registerTool(name: string, tool: Tool, metadata: ToolMetadata): void {
    console.log('📝 [ToolRegistry] Registering tool:', name);
    
    if (this.tools.size >= this.config.maxTools) {
      console.warn('⚠️ [ToolRegistry] Tool registry is full, removing oldest tool');
      this.removeOldestTool();
    }

    this.tools.set(name, tool);
    this.metadata.set(name, metadata);
    
    console.log('✅ [ToolRegistry] Tool registered:', {
      name,
      category: metadata.category,
      cost: metadata.cost
    });
  }

  /**
   * Get a tool by name
   */
  static getTool(name: string): Tool | null {
    if (!this.initialized) {
      this.initialize();
    }

    // Check if tool exists
    if (this.tools.has(name)) {
      return this.tools.get(name)!;
    }

    // Try to load RAG tools dynamically
    if (name === 'rag_query' && this.config.enableRAG) {
      return this.loadRAGTool();
    }

    if (name === 'knowledge_search' && this.config.enableKnowledgeSearch) {
      return this.loadKnowledgeSearchTool();
    }

    console.warn('⚠️ [ToolRegistry] Tool not found:', name);
    return null;
  }

  /**
   * Get all available tool names
   */
  static getAllToolNames(): string[] {
    if (!this.initialized) {
      this.initialize();
    }
    return Array.from(this.tools.keys());
  }

  /**
   * Get tools by category
   */
  static getToolsByCategory(category: ToolMetadata['category']): Tool[] {
    if (!this.initialized) {
      this.initialize();
    }

    const tools: Tool[] = [];
    for (const [name, metadata] of this.metadata.entries()) {
      if (metadata.category === category) {
        const tool = this.tools.get(name);
        if (tool) {
          tools.push(tool);
        }
      }
    }
    return tools;
  }

  /**
   * Get tool metadata
   */
  static getToolMetadata(name: string): ToolMetadata | null {
    return this.metadata.get(name) || null;
  }

  /**
   * Check if a tool is available
   */
  static isToolAvailable(name: string): boolean {
    return this.tools.has(name) || 
           (name === 'rag_query' && this.config.enableRAG) ||
           (name === 'knowledge_search' && this.config.enableKnowledgeSearch);
  }

  /**
   * Set RAG service for dynamic tool loading
   */
  static setRAGService(ragService: any): void {
    console.log('🔗 [ToolRegistry] Setting RAG service');
    this.ragService = ragService;
  }

  /**
   * Set knowledge service for dynamic tool loading
   */
  static setKnowledgeService(knowledgeService: any): void {
    console.log('🔗 [ToolRegistry] Setting knowledge service');
    this.knowledgeService = knowledgeService;
  }

  /**
   * Get registry statistics
   */
  static getStats(): {
    totalTools: number;
    toolsByCategory: Record<string, number>;
    ragEnabled: boolean;
    knowledgeEnabled: boolean;
  } {
    const toolsByCategory: Record<string, number> = {};
    
    for (const metadata of this.metadata.values()) {
      toolsByCategory[metadata.category] = (toolsByCategory[metadata.category] || 0) + 1;
    }

    return {
      totalTools: this.tools.size,
      toolsByCategory,
      ragEnabled: this.config.enableRAG,
      knowledgeEnabled: this.config.enableKnowledgeSearch
    };
  }

  /**
   * Clear all tools (for testing)
   */
  static clear(): void {
    console.log('🧹 [ToolRegistry] Clearing all tools');
    this.tools.clear();
    this.metadata.clear();
    this.initialized = false;
  }

  // Private methods

  private static registerBuiltInTools(): void {
    console.log('📚 [ToolRegistry] Registering built-in tools');
    
    // Import existing tools
    try {
      const { fdaDatabaseTool, fdaGuidanceTool, regulatoryCalculatorTool } = require('../chat/tools/fda-tools');
      const { clinicalTrialsSearchTool, studyDesignTool, endpointSelectorTool } = require('../chat/tools/clinical-trials-tools');
      const { tavilySearchTool, wikipediaTool, pubmedSearchTool, arxivSearchTool } = require('../chat/tools/external-api-tools');

      // Register FDA tools
      this.registerTool('fda_database_search', fdaDatabaseTool, {
        name: 'fda_database_search',
        description: 'Search FDA database for device and drug information',
        category: 'fda',
        cost: 0.5,
        estimatedDuration: 2000,
        requiresAuth: false,
        dependencies: []
      });

      this.registerTool('fda_guidance_lookup', fdaGuidanceTool, {
        name: 'fda_guidance_lookup',
        description: 'Look up FDA guidance documents and regulations',
        category: 'fda',
        cost: 0.3,
        estimatedDuration: 1500,
        requiresAuth: false,
        dependencies: []
      });

      this.registerTool('fda_regulatory_calculator', regulatoryCalculatorTool, {
        name: 'fda_regulatory_calculator',
        description: 'Calculate regulatory requirements and timelines',
        category: 'fda',
        cost: 0.2,
        estimatedDuration: 1000,
        requiresAuth: false,
        dependencies: []
      });

      // Register Clinical Trials tools
      this.registerTool('clinical_trials_search', clinicalTrialsSearchTool, {
        name: 'clinical_trials_search',
        description: 'Search clinical trials database',
        category: 'clinical',
        cost: 0.3,
        estimatedDuration: 2000,
        requiresAuth: false,
        dependencies: []
      });

      this.registerTool('study_design', studyDesignTool, {
        name: 'study_design',
        description: 'Design clinical study protocols',
        category: 'clinical',
        cost: 0.4,
        estimatedDuration: 3000,
        requiresAuth: false,
        dependencies: []
      });

      this.registerTool('endpoint_selection', endpointSelectorTool, {
        name: 'endpoint_selection',
        description: 'Select appropriate clinical endpoints',
        category: 'clinical',
        cost: 0.2,
        estimatedDuration: 1500,
        requiresAuth: false,
        dependencies: []
      });

      // Register External API tools
      this.registerTool('web_search', tavilySearchTool, {
        name: 'web_search',
        description: 'Search the web for information',
        category: 'external',
        cost: 0.2,
        estimatedDuration: 2000,
        requiresAuth: false,
        dependencies: []
      });

      this.registerTool('wikipedia', wikipediaTool, {
        name: 'wikipedia',
        description: 'Search Wikipedia for general information',
        category: 'external',
        cost: 0.1,
        estimatedDuration: 1000,
        requiresAuth: false,
        dependencies: []
      });

      this.registerTool('pubmed', pubmedSearchTool, {
        name: 'pubmed',
        description: 'Search PubMed for medical literature',
        category: 'external',
        cost: 0.2,
        estimatedDuration: 2000,
        requiresAuth: false,
        dependencies: []
      });

      this.registerTool('arxiv', arxivSearchTool, {
        name: 'arxiv',
        description: 'Search arXiv for research papers',
        category: 'external',
        cost: 0.1,
        estimatedDuration: 1500,
        requiresAuth: false,
        dependencies: []
      });

      console.log('✅ [ToolRegistry] Built-in tools registered successfully');
    } catch (error) {
      console.error('❌ [ToolRegistry] Failed to register built-in tools:', error);
    }
  }

  private static loadRAGTool(): Tool | null {
    if (!this.ragService) {
      console.warn('⚠️ [ToolRegistry] RAG service not available');
      return null;
    }

    try {
      // Create a dynamic RAG tool wrapper
      const ragTool = {
        name: 'rag_query',
        description: 'Query the RAG knowledge base',
        invoke: async (input: any) => {
          console.log('🔍 [ToolRegistry] Executing RAG query');
          const result = await this.ragService.queryWithChain(
            input.query || input,
            'autonomous',
            'default',
            { name: 'RAG Agent' },
            'autonomous'
          );
          return result;
        }
      };

      // Register the tool
      this.registerTool('rag_query', ragTool as Tool, {
        name: 'rag_query',
        description: 'Query the RAG knowledge base',
        category: 'rag',
        cost: 0.1,
        estimatedDuration: 1500,
        requiresAuth: false,
        dependencies: ['ragService']
      });

      console.log('✅ [ToolRegistry] RAG tool loaded and registered');
      return ragTool as Tool;
    } catch (error) {
      console.error('❌ [ToolRegistry] Failed to load RAG tool:', error);
      return null;
    }
  }

  private static loadKnowledgeSearchTool(): Tool | null {
    if (!this.knowledgeService) {
      console.warn('⚠️ [ToolRegistry] Knowledge service not available');
      return null;
    }

    try {
      // Create a dynamic knowledge search tool wrapper
      const knowledgeTool = {
        name: 'knowledge_search',
        description: 'Search the knowledge base',
        invoke: async (input: any) => {
          console.log('🔍 [ToolRegistry] Executing knowledge search');
          const result = await this.knowledgeService.search(
            input.query || input,
            { limit: 10, threshold: 0.7 }
          );
          return result;
        }
      };

      // Register the tool
      this.registerTool('knowledge_search', knowledgeTool as Tool, {
        name: 'knowledge_search',
        description: 'Search the knowledge base',
        category: 'knowledge',
        cost: 0.1,
        estimatedDuration: 1000,
        requiresAuth: false,
        dependencies: ['knowledgeService']
      });

      console.log('✅ [ToolRegistry] Knowledge search tool loaded and registered');
      return knowledgeTool as Tool;
    } catch (error) {
      console.error('❌ [ToolRegistry] Failed to load knowledge search tool:', error);
      return null;
    }
  }

  private static removeOldestTool(): void {
    // Simple LRU implementation - remove first tool
    const firstTool = this.tools.keys().next().value;
    if (firstTool) {
      this.tools.delete(firstTool);
      this.metadata.delete(firstTool);
      console.log('🗑️ [ToolRegistry] Removed oldest tool:', firstTool);
    }
  }
}

// Auto-initialize the registry
ToolRegistry.initialize();
