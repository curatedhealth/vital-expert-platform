import { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

export class AgentTools {
  private projectRoot: string;
  private agentsCache: Map<string, any> = new Map();

  constructor() {
    this.projectRoot = process.cwd();
  }

  async initialize(): Promise<void> {
    await this.loadAgentsStructure();
  }

  getTools(): Tool[] {
    return [
      {
        name: 'agent_list_all_agents',
        description: 'List all available agents in the VITAL platform',
        inputSchema: {
          type: 'object',
          properties: {
            tier: {
              type: 'string',
              description: 'Filter by agent tier (1, 2, 3, or core)',
            },
            businessFunction: {
              type: 'string',
              description: 'Filter by business function (Clinical, Regulatory, etc.)',
            },
            status: {
              type: 'string',
              description: 'Filter by agent status (active, inactive, etc.)',
            },
          },
        },
      },
      {
        name: 'agent_get_agent_details',
        description: 'Get detailed information about a specific agent',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: {
              type: 'string',
              description: 'Agent ID or name',
            },
          },
          required: ['agentId'],
        },
      },
      {
        name: 'agent_search_agents',
        description: 'Search agents by capabilities, keywords, or descriptions',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            field: {
              type: 'string',
              description: 'Field to search in (capabilities, description, name)',
              default: 'all',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'agent_get_agent_config',
        description: 'Get agent configuration and system prompts',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: {
              type: 'string',
              description: 'Agent ID or name',
            },
          },
          required: ['agentId'],
        },
      },
      {
        name: 'agent_list_agent_capabilities',
        description: 'List all unique capabilities across all agents',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'agent_get_agent_hierarchy',
        description: 'Get agent hierarchy and relationships',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'agent_analyze_agent_performance',
        description: 'Analyze agent performance metrics and usage',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: {
              type: 'string',
              description: 'Agent ID to analyze (optional, analyzes all if not provided)',
            },
          },
        },
      },
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'agent_list_all_agents':
        return await this.listAllAgents(args.tier, args.businessFunction, args.status);
      case 'agent_get_agent_details':
        return await this.getAgentDetails(args.agentId);
      case 'agent_search_agents':
        return await this.searchAgents(args.query, args.field);
      case 'agent_get_agent_config':
        return await this.getAgentConfig(args.agentId);
      case 'agent_list_agent_capabilities':
        return await this.listAgentCapabilities();
      case 'agent_get_agent_hierarchy':
        return await this.getAgentHierarchy();
      case 'agent_analyze_agent_performance':
        return await this.analyzeAgentPerformance(args.agentId);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async loadAgentsStructure(): Promise<void> {
    // Load agent files from various locations
    const agentPatterns = [
      'src/agents/**/*.ts',
      'src/agents/**/*.js',
      'src/core/**/*Agent*.ts',
      'src/core/**/*Agent*.js',
      '**/agents/**/*.json',
    ];

    for (const pattern of agentPatterns) {
      const files = await glob(pattern, { 
        cwd: this.projectRoot,
        nodir: true,
        ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
      });

      for (const file of files) {
        try {
          const agentData = await this.parseAgentFile(file);
          if (agentData) {
            this.agentsCache.set(agentData.id, agentData);
          }
        } catch (error) {
          // Skip files that can't be parsed
          continue;
        }
      }
    }
  }

  private async parseAgentFile(filePath: string): Promise<any> {
    const content = await fs.readFile(path.join(this.projectRoot, filePath), 'utf8');
    
    // Try to extract agent information from TypeScript/JavaScript files
    if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
      return this.parseAgentFromCode(content, filePath);
    }
    
    // Try to parse JSON files
    if (filePath.endsWith('.json')) {
      try {
        const jsonData = JSON.parse(content);
        return this.parseAgentFromJSON(jsonData, filePath);
      } catch (error) {
        return null;
      }
    }

    return null;
  }

  private parseAgentFromCode(content: string, filePath: string): any {
    // Extract class name and basic info
    const classNameMatch = content.match(/export class (\w+)/);
    const displayNameMatch = content.match(/display_name:\s*["']([^"']+)["']/);
    const descriptionMatch = content.match(/description:\s*["']([^"']+)["']/);
    const tierMatch = content.match(/tier:\s*(\d+)/);
    const businessFunctionMatch = content.match(/business_function:\s*["']([^"']+)["']/);
    
    const capabilitiesMatch = content.match(/capabilities_list:\s*\[([\s\S]*?)\]/);
    let capabilities: string[] = [];
    if (capabilitiesMatch) {
      capabilities = capabilitiesMatch[1]
        .split(',')
        .map((cap: string) => cap.trim().replace(/['"]/g, ''))
        .filter((cap: string) => cap.length > 0);
    }

    return {
      id: classNameMatch ? classNameMatch[1].toLowerCase().replace(/agent$/, '') : path.basename(filePath, path.extname(filePath)),
      name: classNameMatch ? classNameMatch[1] : path.basename(filePath, path.extname(filePath)),
      displayName: displayNameMatch ? displayNameMatch[1] : classNameMatch ? classNameMatch[1] : 'Unknown',
      description: descriptionMatch ? descriptionMatch[1] : 'No description available',
      tier: tierMatch ? parseInt(tierMatch[1]) : null,
      businessFunction: businessFunctionMatch ? businessFunctionMatch[1] : 'General',
      capabilities,
      filePath,
      type: 'code',
    };
  }

  private parseAgentFromJSON(jsonData: any, filePath: string): any {
    return {
      id: jsonData.id || jsonData.name || path.basename(filePath, path.extname(filePath)),
      name: jsonData.name || jsonData.display_name || 'Unknown',
      displayName: jsonData.display_name || jsonData.name || 'Unknown',
      description: jsonData.description || 'No description available',
      tier: jsonData.tier || null,
      businessFunction: jsonData.business_function || 'General',
      capabilities: jsonData.capabilities || jsonData.capabilities_list || [],
      filePath,
      type: 'json',
      ...jsonData,
    };
  }

  private async listAllAgents(tier?: string, businessFunction?: string, status?: string): Promise<any> {
    let agents = Array.from(this.agentsCache.values());

    // Apply filters
    if (tier) {
      agents = agents.filter(agent => 
        agent.tier === parseInt(tier) || 
        agent.tier?.toString() === tier ||
        (tier === 'core' && !agent.tier)
      );
    }

    if (businessFunction) {
      agents = agents.filter(agent => 
        agent.businessFunction?.toLowerCase().includes(businessFunction.toLowerCase())
      );
    }

    if (status) {
      agents = agents.filter(agent => 
        agent.status?.toLowerCase() === status.toLowerCase()
      );
    }

    return {
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        displayName: agent.displayName,
        description: agent.description,
        tier: agent.tier,
        businessFunction: agent.businessFunction,
        capabilities: agent.capabilities,
        filePath: agent.filePath,
        type: agent.type,
      })),
      count: agents.length,
      filters: { tier, businessFunction, status },
    };
  }

  private async getAgentDetails(agentId: string): Promise<any> {
    const agent = this.agentsCache.get(agentId.toLowerCase()) || 
                  Array.from(this.agentsCache.values()).find(a => 
                    a.name.toLowerCase() === agentId.toLowerCase() ||
                    a.displayName.toLowerCase() === agentId.toLowerCase()
                  );

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    return {
      ...agent,
      fullDetails: true,
    };
  }

  private async searchAgents(query: string, field: string = 'all'): Promise<any> {
    const results = [];
    const searchQuery = query.toLowerCase();

    for (const agent of this.agentsCache.values()) {
      let matches = false;
      const matchDetails = [];

      if (field === 'all' || field === 'name') {
        if (agent.name.toLowerCase().includes(searchQuery) || 
            agent.displayName.toLowerCase().includes(searchQuery)) {
          matches = true;
          matchDetails.push('name');
        }
      }

      if (field === 'all' || field === 'description') {
        if (agent.description.toLowerCase().includes(searchQuery)) {
          matches = true;
          matchDetails.push('description');
        }
      }

      if (field === 'all' || field === 'capabilities') {
        if ((agent.capabilities as string[]).some((cap: string) => cap.toLowerCase().includes(searchQuery))) {
          matches = true;
          matchDetails.push('capabilities');
        }
      }

      if (matches) {
        results.push({
          ...agent,
          matchDetails,
        });
      }
    }

    return {
      query,
      field,
      results,
      count: results.length,
    };
  }

  private async getAgentConfig(agentId: string): Promise<any> {
    const agent = this.agentsCache.get(agentId.toLowerCase()) || 
                  Array.from(this.agentsCache.values()).find(a => 
                    a.name.toLowerCase() === agentId.toLowerCase()
                  );

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Try to read the full agent file for configuration details
    try {
      const content = await fs.readFile(path.join(this.projectRoot, agent.filePath), 'utf8');
      
      // Extract system prompt
      const systemPromptMatch = content.match(/system_prompt:\s*`([\s\S]*?)`/);
      const systemPrompt = systemPromptMatch ? systemPromptMatch[1] : null;

      // Extract configuration
      const configMatch = content.match(/config:\s*\{([\s\S]*?)\}/);
      const config = configMatch ? this.parseConfig(configMatch[1]) : {};

      return {
        agentId: agent.id,
        name: agent.name,
        config,
        systemPrompt,
        filePath: agent.filePath,
        fullContent: content,
      };
    } catch (error) {
      return {
        agentId: agent.id,
        name: agent.name,
        error: 'Could not read agent configuration file',
        filePath: agent.filePath,
      };
    }
  }

  private parseConfig(configString: string): Record<string, any> {
    // Simple config parsing - in a real implementation, you'd want more robust parsing
    const config: Record<string, any> = {};
    const lines = configString.split('\n');
    
    for (const line of lines) {
      const match = line.match(/(\w+):\s*(.+)/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        
        // Remove trailing commas and quotes
        value = value.replace(/,$/, '').replace(/^['"]|['"]$/g, '');
        
        // Try to parse as number
        if (!isNaN(Number(value))) {
          config[key] = Number(value);
        } else if (value === 'true' || value === 'false') {
          config[key] = value === 'true';
        } else {
          config[key] = value;
        }
      }
    }
    
    return config;
  }

  private async listAgentCapabilities(): Promise<any> {
    const allCapabilities = new Set<string>();
    const capabilityCounts = new Map<string, number>();

    for (const agent of this.agentsCache.values()) {
      for (const capability of (agent.capabilities as string[]) || []) {
        allCapabilities.add(capability);
        capabilityCounts.set(capability, (capabilityCounts.get(capability) || 0) + 1);
      }
    }

    const capabilities = Array.from(allCapabilities).map((capability: string) => ({
      capability,
      count: capabilityCounts.get(capability),
      agents: Array.from(this.agentsCache.values())
        .filter(agent => (agent.capabilities as string[])?.includes(capability))
        .map(agent => agent.name),
    }));

    return {
      capabilities: capabilities.sort((a, b) => (b.count || 0) - (a.count || 0)),
      totalUniqueCapabilities: capabilities.length,
      totalAgents: this.agentsCache.size,
    };
  }

  private async getAgentHierarchy(): Promise<any> {
    const hierarchy = {
      core: [] as any[],
      tier1: [] as any[],
      tier2: [] as any[],
      tier3: [] as any[],
      unclassified: [] as any[],
    };

    for (const agent of this.agentsCache.values()) {
      if (!agent.tier) {
        hierarchy.unclassified.push(agent);
      } else if (agent.tier === 1) {
        hierarchy.tier1.push(agent);
      } else if (agent.tier === 2) {
        hierarchy.tier2.push(agent);
      } else if (agent.tier === 3) {
        hierarchy.tier3.push(agent);
      } else {
        hierarchy.unclassified.push(agent);
      }
    }

    return {
      hierarchy,
      summary: {
        core: hierarchy.core.length,
        tier1: hierarchy.tier1.length,
        tier2: hierarchy.tier2.length,
        tier3: hierarchy.tier3.length,
        unclassified: hierarchy.unclassified.length,
        total: this.agentsCache.size,
      },
    };
  }

  private async analyzeAgentPerformance(agentId?: string): Promise<any> {
    // This would typically connect to your analytics/monitoring system
    // For now, return basic structure
    const agents = agentId ? 
      [this.agentsCache.get(agentId.toLowerCase())] : 
      Array.from(this.agentsCache.values());

    const analysis = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      tier: agent.tier,
      businessFunction: agent.businessFunction,
      capabilities: agent.capabilities?.length || 0,
      // In a real implementation, you'd fetch actual performance metrics
      metrics: {
        totalInteractions: 0, // Would come from your analytics
        averageResponseTime: 0,
        accuracyScore: 0,
        userSatisfaction: 0,
        lastActive: null,
      },
    }));

    return {
      analysis,
      timestamp: new Date().toISOString(),
      note: 'Performance metrics would be fetched from your analytics system',
    };
  }
}
