import { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

export class WorkflowTools {
  private projectRoot: string;
  private workflowsCache: Map<string, any> = new Map();

  constructor() {
    this.projectRoot = process.cwd();
  }

  async initialize(): Promise<void> {
    await this.loadWorkflowsStructure();
  }

  getTools(): Tool[] {
    return [
      {
        name: 'workflow_list_workflows',
        description: 'List all available workflows in the VITAL platform',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Filter by workflow type (langgraph, orchestration, etc.)',
            },
            status: {
              type: 'string',
              description: 'Filter by workflow status (active, inactive, etc.)',
            },
          },
        },
      },
      {
        name: 'workflow_get_workflow_details',
        description: 'Get detailed information about a specific workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'Workflow ID or name',
            },
          },
          required: ['workflowId'],
        },
      },
      {
        name: 'workflow_get_workflow_graph',
        description: 'Get the workflow graph structure and flow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'Workflow ID or name',
            },
          },
          required: ['workflowId'],
        },
      },
      {
        name: 'workflow_search_workflows',
        description: 'Search workflows by name, description, or capabilities',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'workflow_get_workflow_nodes',
        description: 'Get all nodes in a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'Workflow ID or name',
            },
          },
          required: ['workflowId'],
        },
      },
      {
        name: 'workflow_get_workflow_edges',
        description: 'Get all edges/connections in a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'Workflow ID or name',
            },
          },
          required: ['workflowId'],
        },
      },
      {
        name: 'workflow_analyze_workflow_complexity',
        description: 'Analyze workflow complexity and structure',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'Workflow ID or name',
            },
          },
          required: ['workflowId'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'workflow_list_workflows':
        return await this.listWorkflows(args.type, args.status);
      case 'workflow_get_workflow_details':
        return await this.getWorkflowDetails(args.workflowId);
      case 'workflow_get_workflow_graph':
        return await this.getWorkflowGraph(args.workflowId);
      case 'workflow_search_workflows':
        return await this.searchWorkflows(args.query);
      case 'workflow_get_workflow_nodes':
        return await this.getWorkflowNodes(args.workflowId);
      case 'workflow_get_workflow_edges':
        return await this.getWorkflowEdges(args.workflowId);
      case 'workflow_analyze_workflow_complexity':
        return await this.analyzeWorkflowComplexity(args.workflowId);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async loadWorkflowsStructure(): Promise<void> {
    // Load workflow files from various locations
    const workflowPatterns = [
      'src/core/workflows/**/*.ts',
      'src/lib/services/**/*workflow*.ts',
      'src/lib/services/**/*orchestrator*.ts',
      'src/features/chat/services/**/*workflow*.ts',
      '**/workflows/**/*.ts',
      '**/workflows/**/*.js',
    ];

    for (const pattern of workflowPatterns) {
      const files = await glob(pattern, { 
        cwd: this.projectRoot,
        nodir: true,
        ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
      });

      for (const file of files) {
        try {
          const workflowData = await this.parseWorkflowFile(file);
          if (workflowData) {
            this.workflowsCache.set(workflowData.id, workflowData);
          }
        } catch (error) {
          continue;
        }
      }
    }
  }

  private async parseWorkflowFile(filePath: string): Promise<any> {
    const content = await fs.readFile(path.join(this.projectRoot, filePath), 'utf8');
    
    // Extract workflow information from TypeScript/JavaScript files
    const classNameMatch = content.match(/export class (\w+)/);
    const workflowNameMatch = content.match(/workflowName:\s*["']([^"']+)["']/);
    const descriptionMatch = content.match(/description:\s*["']([^"']+)["']/);
    
    // Look for LangGraph specific patterns
    const isLangGraph = content.includes('LangGraph') || content.includes('StateGraph') || content.includes('workflow');
    const isOrchestrator = content.includes('Orchestrator') || content.includes('orchestrator');
    
    // Extract nodes
    const nodeMatches = content.matchAll(/class (\w+Node)/g);
    const nodes = Array.from(nodeMatches).map(match => match[1]);
    
    // Extract edges/connections
    const edgeMatches = content.matchAll(/\.addEdge\(["']([^"']+)["'],\s*["']([^"']+)["']\)/g);
    const edges = Array.from(edgeMatches).map(match => ({
      from: match[1],
      to: match[2],
    }));

    return {
      id: classNameMatch ? classNameMatch[1].toLowerCase() : path.basename(filePath, path.extname(filePath)),
      name: classNameMatch ? classNameMatch[1] : path.basename(filePath, path.extname(filePath)),
      displayName: workflowNameMatch ? workflowNameMatch[1] : classNameMatch ? classNameMatch[1] : 'Unknown Workflow',
      description: descriptionMatch ? descriptionMatch[1] : 'No description available',
      type: isLangGraph ? 'langgraph' : isOrchestrator ? 'orchestrator' : 'workflow',
      nodes,
      edges,
      filePath,
      complexity: this.calculateComplexity(nodes.length, edges.length),
    };
  }

  private calculateComplexity(nodeCount: number, edgeCount: number): string {
    const complexity = nodeCount + edgeCount;
    if (complexity <= 5) return 'simple';
    if (complexity <= 15) return 'moderate';
    if (complexity <= 30) return 'complex';
    return 'very-complex';
  }

  private async listWorkflows(type?: string, status?: string): Promise<any> {
    let workflows = Array.from(this.workflowsCache.values());

    // Apply filters
    if (type) {
      workflows = workflows.filter(workflow => 
        workflow.type?.toLowerCase().includes(type.toLowerCase())
      );
    }

    if (status) {
      workflows = workflows.filter(workflow => 
        workflow.status?.toLowerCase() === status.toLowerCase()
      );
    }

    return {
      workflows: workflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        displayName: workflow.displayName,
        description: workflow.description,
        type: workflow.type,
        nodeCount: workflow.nodes?.length || 0,
        edgeCount: workflow.edges?.length || 0,
        complexity: workflow.complexity,
        filePath: workflow.filePath,
      })),
      count: workflows.length,
      filters: { type, status },
    };
  }

  private async getWorkflowDetails(workflowId: string): Promise<any> {
    const workflow = this.workflowsCache.get(workflowId.toLowerCase()) || 
                    Array.from(this.workflowsCache.values()).find(w => 
                      w.name.toLowerCase() === workflowId.toLowerCase() ||
                      w.displayName.toLowerCase() === workflowId.toLowerCase()
                    );

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Try to read the full workflow file for more details
    try {
      const content = await fs.readFile(path.join(this.projectRoot, workflow.filePath), 'utf8');
      
      // Extract more detailed information
      const systemPromptMatch = content.match(/systemPrompt:\s*`([\s\S]*?)`/);
      const configMatch = content.match(/config:\s*\{([\s\S]*?)\}/);
      
      return {
        ...workflow,
        systemPrompt: systemPromptMatch ? systemPromptMatch[1] : null,
        config: configMatch ? this.parseConfig(configMatch[1]) : {},
        fullContent: content,
        fullDetails: true,
      };
    } catch (error) {
      return {
        ...workflow,
        error: 'Could not read workflow file',
      };
    }
  }

  private parseConfig(configString: string): Record<string, any> {
    const config: Record<string, any> = {};
    const lines = configString.split('\n');
    
    for (const line of lines) {
      const match = line.match(/(\w+):\s*(.+)/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        value = value.replace(/,$/, '').replace(/^['"]|['"]$/g, '');
        
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

  private async getWorkflowGraph(workflowId: string): Promise<any> {
    const workflow = this.workflowsCache.get(workflowId.toLowerCase()) || 
                    Array.from(this.workflowsCache.values()).find(w => 
                      w.name.toLowerCase() === workflowId.toLowerCase()
                    );

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    return {
      workflowId: workflow.id,
      name: workflow.name,
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
      graph: {
        nodes: (workflow.nodes || []).map((node: string) => ({
          id: node,
          label: node,
          type: this.getNodeType(node),
        })),
        edges: (workflow.edges || []).map((edge: any) => ({
          from: edge.from,
          to: edge.to,
          type: 'default',
        })),
      },
      complexity: workflow.complexity,
    };
  }

  private getNodeType(nodeName: string): string {
    if (nodeName.includes('Start') || nodeName.includes('Init')) return 'start';
    if (nodeName.includes('End') || nodeName.includes('Finish')) return 'end';
    if (nodeName.includes('Decision') || nodeName.includes('Condition')) return 'decision';
    if (nodeName.includes('Process') || nodeName.includes('Action')) return 'process';
    if (nodeName.includes('Agent') || nodeName.includes('LLM')) return 'agent';
    return 'default';
  }

  private async searchWorkflows(query: string): Promise<any> {
    const results = [];
    const searchQuery = query.toLowerCase();

    for (const workflow of this.workflowsCache.values()) {
      let matches = false;
      const matchDetails = [];

      if (workflow.name.toLowerCase().includes(searchQuery) || 
          workflow.displayName.toLowerCase().includes(searchQuery)) {
        matches = true;
        matchDetails.push('name');
      }

      if (workflow.description.toLowerCase().includes(searchQuery)) {
        matches = true;
        matchDetails.push('description');
      }

      if (workflow.nodes?.some((node: string) => node.toLowerCase().includes(searchQuery))) {
        matches = true;
        matchDetails.push('nodes');
      }

      if (matches) {
        results.push({
          ...workflow,
          matchDetails,
        });
      }
    }

    return {
      query,
      results,
      count: results.length,
    };
  }

  private async getWorkflowNodes(workflowId: string): Promise<any> {
    const workflow = this.workflowsCache.get(workflowId.toLowerCase()) || 
                    Array.from(this.workflowsCache.values()).find(w => 
                      w.name.toLowerCase() === workflowId.toLowerCase()
                    );

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    return {
      workflowId: workflow.id,
      workflowName: workflow.name,
      nodes: (workflow.nodes || []).map((node: string) => ({
        name: node,
        type: this.getNodeType(node),
        description: `Node: ${node}`,
      })),
      nodeCount: workflow.nodes?.length || 0,
    };
  }

  private async getWorkflowEdges(workflowId: string): Promise<any> {
    const workflow = this.workflowsCache.get(workflowId.toLowerCase()) || 
                    Array.from(this.workflowsCache.values()).find(w => 
                      w.name.toLowerCase() === workflowId.toLowerCase()
                    );

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    return {
      workflowId: workflow.id,
      workflowName: workflow.name,
      edges: workflow.edges || [],
      edgeCount: workflow.edges?.length || 0,
    };
  }

  private async analyzeWorkflowComplexity(workflowId: string): Promise<any> {
    const workflow = this.workflowsCache.get(workflowId.toLowerCase()) || 
                    Array.from(this.workflowsCache.values()).find(w => 
                      w.name.toLowerCase() === workflowId.toLowerCase()
                    );

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const nodeCount = workflow.nodes?.length || 0;
    const edgeCount = workflow.edges?.length || 0;
    const complexity = nodeCount + edgeCount;

    // Calculate metrics
    const cyclomaticComplexity = edgeCount - nodeCount + 2; // Simplified calculation
    const density = nodeCount > 0 ? edgeCount / (nodeCount * (nodeCount - 1)) : 0;

    return {
      workflowId: workflow.id,
      workflowName: workflow.name,
      metrics: {
        nodeCount,
        edgeCount,
        totalComplexity: complexity,
        cyclomaticComplexity,
        density: Math.round(density * 100) / 100,
        complexityLevel: workflow.complexity,
      },
      analysis: {
        isLinear: edgeCount === nodeCount - 1,
        hasCycles: edgeCount > nodeCount - 1,
        isWellConnected: density > 0.5,
        recommendations: this.getComplexityRecommendations(complexity, density),
      },
    };
  }

  private getComplexityRecommendations(complexity: number, density: number): string[] {
    const recommendations = [];
    
    if (complexity > 50) {
      recommendations.push('Consider breaking this workflow into smaller sub-workflows');
    }
    
    if (density > 0.8) {
      recommendations.push('Workflow is highly connected - consider simplifying connections');
    }
    
    if (complexity < 5) {
      recommendations.push('Workflow is very simple - consider if it needs to be a workflow');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Workflow complexity is well-balanced');
    }
    
    return recommendations;
  }
}
