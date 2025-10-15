import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { WebSearchTool } from './tools/web-search';
import { PubMedSearchTool } from './tools/pubmed-search';
import { FDADatabaseTool } from './tools/fda-database';
import { EMADatabaseTool } from './tools/ema-database';
import { ClinicalTrialsTool } from './tools/clinical-trials';
import { WHODatabaseTool } from './tools/who-database';
import { CochraneReviewsTool } from './tools/cochrane-reviews';
import { DrugInteractionTool } from './tools/drug-interaction';
import { CalculatorTool } from './tools/calculator';
import { RAGSearchTool } from './tools/rag-search';

// LangChain Best Practice: Structured tool configuration with proper typing
export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'research' | 'knowledge' | 'analysis' | 'regulatory' | 'clinical';
  subcategory?: string;
  enabled: boolean;
  tool: Tool;
  metadata: {
    apiLimit?: number;
    cacheEnabled?: boolean;
    cacheDuration?: number; // minutes
    requiresAuth?: boolean;
    dataSource?: string;
    lastUpdated?: string;
  };
  agentCompatibility?: string[]; // Which agent types can use this tool
}

// LangChain Best Practice: Singleton pattern with lazy initialization
export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, ToolConfig> = new Map();
  private toolCache: Map<string, { data: any; timestamp: number }> = new Map();
  
  private constructor() {
    this.registerMedicalRegulatoryTools();
    this.setupCacheCleanup();
  }
  
  static getInstance(): ToolRegistry {
    if (!this.instance) {
      this.instance = new ToolRegistry();
    }
    return this.instance;
  }
  
  // LangChain Best Practice: Comprehensive tool suite for medical/regulatory domain
  private registerMedicalRegulatoryTools() {
    // 1. Web Search Tool
    this.registerTool({
      id: 'web_search',
      name: 'Web Search',
      description: 'Search the internet for current medical information, news, and research. Best for recent developments and general medical information.',
      icon: '🌐',
      category: 'research',
      enabled: true,
      tool: new WebSearchTool(),
      metadata: {
        apiLimit: 100,
        cacheEnabled: true,
        cacheDuration: 60
      },
      agentCompatibility: ['all']
    });
    
    // 2. PubMed Search Tool (Enhanced)
    this.registerTool({
      id: 'pubmed_search',
      name: 'PubMed Search',
      description: 'Search 35+ million citations from MEDLINE, life science journals, and online books. Includes full-text links and advanced filtering.',
      icon: '📚',
      category: 'research',
      subcategory: 'medical_literature',
      enabled: true,
      tool: new PubMedSearchTool(),
      metadata: {
        dataSource: 'NIH/NLM',
        cacheEnabled: true,
        cacheDuration: 120,
        lastUpdated: 'daily'
      },
      agentCompatibility: ['medical', 'research', 'clinical']
    });
    
    // 3. FDA Database Tool (Enhanced)
    this.registerTool({
      id: 'fda_database',
      name: 'FDA Database',
      description: 'Search FDA drug approvals, medical devices (510k, PMA), adverse events (FAERS), recalls, warning letters, and guidance documents.',
      icon: '🏛️',
      category: 'regulatory',
      subcategory: 'us_regulatory',
      enabled: true,
      tool: new FDADatabaseTool(),
      metadata: {
        dataSource: 'FDA OpenFDA API',
        cacheEnabled: true,
        cacheDuration: 240,
        lastUpdated: 'weekly'
      },
      agentCompatibility: ['regulatory', 'compliance', 'safety']
    });
    
    // 4. EMA Database Tool (NEW)
    this.registerTool({
      id: 'ema_database',
      name: 'EMA Database',
      description: 'Search European Medicines Agency for drug approvals, EPARs (European Public Assessment Reports), safety updates, and clinical data.',
      icon: '🇪🇺',
      category: 'regulatory',
      subcategory: 'eu_regulatory',
      enabled: true,
      tool: new EMADatabaseTool(),
      metadata: {
        dataSource: 'EMA API',
        cacheEnabled: true,
        cacheDuration: 240,
        lastUpdated: 'weekly'
      },
      agentCompatibility: ['regulatory', 'compliance', 'eu_market']
    });
    
    // 5. ClinicalTrials.gov Tool (NEW)
    this.registerTool({
      id: 'clinical_trials',
      name: 'ClinicalTrials.gov',
      description: 'Search 470,000+ clinical studies worldwide. Find recruiting trials, results, study protocols, and inclusion/exclusion criteria.',
      icon: '🔬',
      category: 'clinical',
      subcategory: 'trial_registry',
      enabled: true,
      tool: new ClinicalTrialsTool(),
      metadata: {
        dataSource: 'ClinicalTrials.gov API v2',
        cacheEnabled: true,
        cacheDuration: 60,
        lastUpdated: 'daily'
      },
      agentCompatibility: ['clinical', 'research', 'patient_recruitment']
    });
    
    // 6. WHO International Clinical Trials Registry (NEW)
    this.registerTool({
      id: 'who_ictrp',
      name: 'WHO ICTRP',
      description: 'Search WHO International Clinical Trials Registry Platform for global trials from 18 primary registries worldwide.',
      icon: '🌍',
      category: 'clinical',
      subcategory: 'global_trials',
      enabled: true,
      tool: new WHODatabaseTool(),
      metadata: {
        dataSource: 'WHO ICTRP',
        cacheEnabled: true,
        cacheDuration: 120,
        lastUpdated: 'weekly'
      },
      agentCompatibility: ['clinical', 'global_health', 'research']
    });
    
    // 7. Cochrane Reviews Tool (NEW)
    this.registerTool({
      id: 'cochrane_reviews',
      name: 'Cochrane Reviews',
      description: 'Search systematic reviews and meta-analyses from Cochrane Database. Gold standard for evidence-based healthcare decisions.',
      icon: '⚖️',
      category: 'research',
      subcategory: 'systematic_reviews',
      enabled: true,
      tool: new CochraneReviewsTool(),
      metadata: {
        dataSource: 'Cochrane Library',
        cacheEnabled: true,
        cacheDuration: 480,
        requiresAuth: true,
        lastUpdated: 'monthly'
      },
      agentCompatibility: ['medical', 'evidence_based', 'clinical_guidelines']
    });
    
    // 8. Drug Interaction Checker (NEW)
    this.registerTool({
      id: 'drug_interactions',
      name: 'Drug Interaction Checker',
      description: 'Check drug-drug interactions, contraindications, and safety alerts using multiple databases (DrugBank, RxNorm).',
      icon: '💊',
      category: 'clinical',
      subcategory: 'drug_safety',
      enabled: true,
      tool: new DrugInteractionTool(),
      metadata: {
        dataSource: 'DrugBank/RxNorm',
        cacheEnabled: false, // Always get fresh data for safety
        requiresAuth: true,
        lastUpdated: 'real-time'
      },
      agentCompatibility: ['pharmacy', 'clinical', 'safety']
    });
    
    // 9. Calculator Tool (Enhanced for Medical)
    this.registerTool({
      id: 'medical_calculator',
      name: 'Medical Calculator',
      description: 'Calculate clinical scores (MELD, CHA2DS2-VASc, GFR), drug dosing, BMI, and statistical analyses for clinical research.',
      icon: '🧮',
      category: 'analysis',
      subcategory: 'clinical_calculations',
      enabled: true,
      tool: new CalculatorTool(),
      metadata: {
        cacheEnabled: false,
        lastUpdated: 'static'
      },
      agentCompatibility: ['clinical', 'medical', 'research']
    });
    
    // 10. RAG Search Tool (Enhanced)
    this.registerTool({
      id: 'rag_search',
      name: 'Knowledge Base',
      description: 'Search internal knowledge base including guidelines, SOPs, regulatory documents, and proprietary research.',
      icon: '🧠',
      category: 'knowledge',
      subcategory: 'internal_knowledge',
      enabled: true,
      tool: new RAGSearchTool(),
      metadata: {
        dataSource: 'Pinecone/Weaviate',
        cacheEnabled: true,
        cacheDuration: 30,
        requiresAuth: true
      },
      agentCompatibility: ['all']
    });
  }
  
  // LangChain Best Practice: Implement caching for expensive operations
  private setupCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, cache] of this.toolCache.entries()) {
        const tool = this.tools.get(key);
        const maxAge = (tool?.metadata?.cacheDuration || 60) * 60 * 1000;
        
        if (now - cache.timestamp > maxAge) {
          this.toolCache.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }
  
  // LangChain Best Practice: Tool orchestration with parallel execution
  async executeToolsInParallel(
    toolIds: string[],
    input: any,
    options?: { timeout?: number }
  ): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    const timeout = options?.timeout || 30000;
    
    const promises = toolIds.map(async (toolId) => {
      const toolConfig = this.tools.get(toolId);
      if (!toolConfig) {
        return [toolId, { error: 'Tool not found' }];
      }
      
      // Check cache first
      const cacheKey = `${toolId}:${JSON.stringify(input)}`;
      const cached = this.toolCache.get(cacheKey);
      
      if (cached && toolConfig.metadata.cacheEnabled) {
        const maxAge = (toolConfig.metadata.cacheDuration || 60) * 60 * 1000;
        if (Date.now() - cached.timestamp < maxAge) {
          console.log(`🎯 Cache hit for ${toolId}`);
          return [toolId, cached.data];
        }
      }
      
      try {
        // Execute with timeout
        const result = await Promise.race([
          toolConfig.tool.invoke(input),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Tool ${toolId} timeout`)), timeout)
          )
        ]);
        
        // Cache result if enabled
        if (toolConfig.metadata.cacheEnabled) {
          this.toolCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
        }
        
        return [toolId, result];
      } catch (error) {
        console.error(`Tool ${toolId} error:`, error);
        return [toolId, { error: error.message }];
      }
    });
    
    const toolResults = await Promise.all(promises);
    
    for (const [toolId, result] of toolResults) {
      results.set(toolId, result);
    }
    
    return results;
  }
  
  // Enhanced methods for tool management
  registerTool(config: ToolConfig) {
    this.tools.set(config.id, config);
  }
  
  getTool(id: string): ToolConfig | undefined {
    return this.tools.get(id);
  }
  
  getAllTools(): ToolConfig[] {
    return Array.from(this.tools.values());
  }
  
  getEnabledTools(): ToolConfig[] {
    return this.getAllTools().filter(tool => tool.enabled);
  }
  
  getToolsByCategory(category: string): ToolConfig[] {
    return this.getAllTools().filter(tool => tool.category === category);
  }
  
  getToolsBySubcategory(subcategory: string): ToolConfig[] {
    return this.getAllTools().filter(tool => tool.subcategory === subcategory);
  }
  
  // LangChain Best Practice: Agent-aware tool filtering
  getToolsForAgent(agent: any): ToolConfig[] {
    return this.getAllTools().filter(tool => {
      // Check agent compatibility
      if (tool.agentCompatibility?.includes('all')) {
        return true;
      }
      
      if (tool.agentCompatibility) {
        const agentTypes = [
          agent.type,
          agent.business_function?.toLowerCase(),
          ...agent.capabilities
        ];
        
        return tool.agentCompatibility.some(compat => 
          agentTypes.some(type => type?.includes(compat))
        );
      }
      
      // Default filtering based on capabilities
      if (tool.id === 'rag_search' && !agent.rag_enabled) {
        return false;
      }
      
      if (tool.subcategory === 'medical_literature' && 
          !agent.capabilities.includes('medical')) {
        return false;
      }
      
      if (tool.category === 'regulatory' && 
          !agent.capabilities.includes('regulatory')) {
        return false;
      }
      
      return true;
    });
  }
}
