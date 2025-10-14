import { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

export class APITools {
  private projectRoot: string;
  private apiCache: Map<string, any> = new Map();

  constructor() {
    this.projectRoot = process.cwd();
  }

  async initialize(): Promise<void> {
    await this.loadAPIStructure();
  }

  getTools(): Tool[] {
    return [
      {
        name: 'api_list_endpoints',
        description: 'List all API endpoints in the VITAL platform',
        inputSchema: {
          type: 'object',
          properties: {
            method: {
              type: 'string',
              description: 'Filter by HTTP method (GET, POST, PUT, DELETE, etc.)',
            },
            path: {
              type: 'string',
              description: 'Filter by path pattern',
            },
            service: {
              type: 'string',
              description: 'Filter by service (chat, agents, workflows, etc.)',
            },
          },
        },
      },
      {
        name: 'api_get_endpoint_details',
        description: 'Get detailed information about a specific API endpoint',
        inputSchema: {
          type: 'object',
          properties: {
            endpointId: {
              type: 'string',
              description: 'Endpoint ID or path',
            },
          },
          required: ['endpointId'],
        },
      },
      {
        name: 'api_search_endpoints',
        description: 'Search API endpoints by functionality or keywords',
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
        name: 'api_get_request_schema',
        description: 'Get request schema for an API endpoint',
        inputSchema: {
          type: 'object',
          properties: {
            endpointId: {
              type: 'string',
              description: 'Endpoint ID or path',
            },
          },
          required: ['endpointId'],
        },
      },
      {
        name: 'api_get_response_schema',
        description: 'Get response schema for an API endpoint',
        inputSchema: {
          type: 'object',
          properties: {
            endpointId: {
              type: 'string',
              description: 'Endpoint ID or path',
            },
          },
          required: ['endpointId'],
        },
      },
      {
        name: 'api_analyze_api_structure',
        description: 'Analyze overall API structure and organization',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'api_get_service_endpoints',
        description: 'Get all endpoints for a specific service',
        inputSchema: {
          type: 'object',
          properties: {
            serviceName: {
              type: 'string',
              description: 'Service name (chat, agents, workflows, etc.)',
            },
          },
          required: ['serviceName'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'api_list_endpoints':
        return await this.listEndpoints(args.method, args.path, args.service);
      case 'api_get_endpoint_details':
        return await this.getEndpointDetails(args.endpointId);
      case 'api_search_endpoints':
        return await this.searchEndpoints(args.query);
      case 'api_get_request_schema':
        return await this.getRequestSchema(args.endpointId);
      case 'api_get_response_schema':
        return await this.getResponseSchema(args.endpointId);
      case 'api_analyze_api_structure':
        return await this.analyzeAPIStructure();
      case 'api_get_service_endpoints':
        return await this.getServiceEndpoints(args.serviceName);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async loadAPIStructure(): Promise<void> {
    // Load API route files
    const apiPatterns = [
      'src/app/api/**/*.ts',
      'src/app/api/**/*.js',
      'src/pages/api/**/*.ts',
      'src/pages/api/**/*.js',
      'backend/**/routes/**/*.py',
      'backend/**/api/**/*.py',
    ];

    for (const pattern of apiPatterns) {
      const files = await glob(pattern, { 
        cwd: this.projectRoot,
        nodir: true,
        ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
      });

      for (const file of files) {
        try {
          const apiData = await this.parseAPIFile(file);
          if (apiData) {
            this.apiCache.set(apiData.id, apiData);
          }
        } catch (error) {
          continue;
        }
      }
    }
  }

  private async parseAPIFile(filePath: string): Promise<any> {
    const content = await fs.readFile(path.join(this.projectRoot, filePath), 'utf8');
    
    if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
      return this.parseNextJSAPIFile(content, filePath);
    } else if (filePath.endsWith('.py')) {
      return this.parsePythonAPIFile(content, filePath);
    }

    return null;
  }

  private parseNextJSAPIFile(content: string, filePath: string): any {
    const endpoints = [];
    
    // Extract route from file path
    const routePath = this.extractRouteFromPath(filePath);
    
    // Look for HTTP method handlers
    const methodHandlers = [
      { method: 'GET', pattern: /export\s+async\s+function\s+GET/ },
      { method: 'POST', pattern: /export\s+async\s+function\s+POST/ },
      { method: 'PUT', pattern: /export\s+async\s+function\s+PUT/ },
      { method: 'DELETE', pattern: /export\s+async\s+function\s+DELETE/ },
      { method: 'PATCH', pattern: /export\s+async\s+function\s+PATCH/ },
    ];

    for (const handler of methodHandlers) {
      if (handler.pattern.test(content)) {
        const endpoint = {
          id: `${handler.method}_${routePath}`,
          method: handler.method,
          path: routePath,
          filePath,
          service: this.extractServiceFromPath(filePath),
          description: this.extractDescription(content),
          parameters: this.extractParameters(content),
          responseType: this.extractResponseType(content),
        };
        endpoints.push(endpoint);
      }
    }

    return endpoints.length > 0 ? endpoints : null;
  }

  private parsePythonAPIFile(content: string, filePath: string): any {
    const endpoints = [];
    
    // Look for FastAPI/Flask route decorators
    const routePatterns = [
      { method: 'GET', pattern: /@\w+\.get\(["']([^"']+)["']\)/g },
      { method: 'POST', pattern: /@\w+\.post\(["']([^"']+)["']\)/g },
      { method: 'PUT', pattern: /@\w+\.put\(["']([^"']+)["']\)/g },
      { method: 'DELETE', pattern: /@\w+\.delete\(["']([^"']+)["']\)/g },
      { method: 'PATCH', pattern: /@\w+\.patch\(["']([^"']+)["']\)/g },
    ];

    for (const routePattern of routePatterns) {
      const matches = content.matchAll(routePattern.pattern);
      for (const match of matches) {
        const endpoint = {
          id: `${routePattern.method}_${match[1]}`,
          method: routePattern.method,
          path: match[1],
          filePath,
          service: this.extractServiceFromPath(filePath),
          description: this.extractPythonDescription(content, match[0]),
          parameters: this.extractPythonParameters(content),
          responseType: this.extractPythonResponseType(content),
        };
        endpoints.push(endpoint);
      }
    }

    return endpoints.length > 0 ? endpoints : null;
  }

  private extractRouteFromPath(filePath: string): string {
    // Convert file path to API route
    // e.g., src/app/api/chat/route.ts -> /api/chat
    const apiMatch = filePath.match(/src\/app\/api\/(.+)\/route\.(ts|js)/);
    if (apiMatch) {
      return `/api/${apiMatch[1]}`;
    }

    const pagesMatch = filePath.match(/src\/pages\/api\/(.+)\.(ts|js)/);
    if (pagesMatch) {
      return `/api/${pagesMatch[1]}`;
    }

    return filePath;
  }

  private extractServiceFromPath(filePath: string): string {
    if (filePath.includes('/chat/')) return 'chat';
    if (filePath.includes('/agents/')) return 'agents';
    if (filePath.includes('/workflows/')) return 'workflows';
    if (filePath.includes('/admin/')) return 'admin';
    if (filePath.includes('/auth/')) return 'auth';
    if (filePath.includes('/rag/')) return 'rag';
    return 'general';
  }

  private extractDescription(content: string): string {
    // Look for JSDoc comments or description patterns
    const jsdocMatch = content.match(/\/\*\*[\s\S]*?\*\/\s*export/);
    if (jsdocMatch) {
      const description = jsdocMatch[0].replace(/\/\*\*|\*\/|\*/g, '').trim();
      return description.split('\n')[0];
    }

    // Look for comment patterns
    const commentMatch = content.match(/\/\/\s*(.+)/);
    if (commentMatch) {
      return commentMatch[1];
    }

    return 'No description available';
  }

  private extractParameters(content: string): any[] {
    const parameters = [];
    
    // Look for request parameter patterns
    const paramMatches = content.matchAll(/request\.(query|params|body)\.(\w+)/g);
    for (const match of paramMatches) {
      parameters.push({
        name: match[2],
        source: match[1],
        type: 'unknown',
      });
    }

    return parameters;
  }

  private extractResponseType(content: string): string {
    // Look for response type patterns
    const responseMatch = content.match(/NextResponse\.json<(\w+)>/);
    if (responseMatch) {
      return responseMatch[1];
    }

    const returnMatch = content.match(/return\s+\{[\s\S]*?type:\s*["'](\w+)["']/);
    if (returnMatch) {
      return returnMatch[1];
    }

    return 'unknown';
  }

  private extractPythonDescription(content: string, decorator: string): string {
    // Look for docstring after the decorator
    const functionMatch = content.match(new RegExp(decorator + '\\s*\\n\\s*def\\s+\\w+\\([^)]*\\):\\s*\\n\\s*["\']([^"\']+)["\']'));
    if (functionMatch) {
      return functionMatch[1];
    }

    return 'No description available';
  }

  private extractPythonParameters(content: string): any[] {
    const parameters = [];
    
    // Look for Pydantic model patterns
    const modelMatches = content.matchAll(/class\s+(\w+Request|RequestModel)\s*\([^)]*\):/g);
    for (const match of modelMatches) {
      parameters.push({
        name: match[1],
        source: 'body',
        type: 'PydanticModel',
      });
    }

    return parameters;
  }

  private extractPythonResponseType(content: string): string {
    // Look for response type hints
    const responseMatch = content.match(/->\s*(\w+)/);
    if (responseMatch) {
      return responseMatch[1];
    }

    return 'unknown';
  }

  private async listEndpoints(method?: string, path?: string, service?: string): Promise<any> {
    let endpoints = Array.from(this.apiCache.values()).flat();

    // Apply filters
    if (method) {
      endpoints = endpoints.filter(ep => ep.method.toLowerCase() === method.toLowerCase());
    }

    if (path) {
      endpoints = endpoints.filter(ep => ep.path.includes(path));
    }

    if (service) {
      endpoints = endpoints.filter(ep => ep.service === service);
    }

    return {
      endpoints: endpoints.map(ep => ({
        id: ep.id,
        method: ep.method,
        path: ep.path,
        service: ep.service,
        description: ep.description,
        filePath: ep.filePath,
      })),
      count: endpoints.length,
      filters: { method, path, service },
    };
  }

  private async getEndpointDetails(endpointId: string): Promise<any> {
    const allEndpoints = Array.from(this.apiCache.values()).flat();
    const endpoint = allEndpoints.find(ep => 
      ep.id === endpointId || 
      ep.path === endpointId ||
      ep.id.includes(endpointId)
    );

    if (!endpoint) {
      throw new Error(`Endpoint not found: ${endpointId}`);
    }

    return {
      ...endpoint,
      fullDetails: true,
    };
  }

  private async searchEndpoints(query: string): Promise<any> {
    const allEndpoints = Array.from(this.apiCache.values()).flat();
    const results = [];
    const searchQuery = query.toLowerCase();

    for (const endpoint of allEndpoints) {
      let matches = false;
      const matchDetails = [];

      if (endpoint.path.toLowerCase().includes(searchQuery)) {
        matches = true;
        matchDetails.push('path');
      }

      if (endpoint.description.toLowerCase().includes(searchQuery)) {
        matches = true;
        matchDetails.push('description');
      }

      if (endpoint.service.toLowerCase().includes(searchQuery)) {
        matches = true;
        matchDetails.push('service');
      }

      if (matches) {
        results.push({
          ...endpoint,
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

  private async getRequestSchema(endpointId: string): Promise<any> {
    const endpoint = await this.getEndpointDetails(endpointId);
    
    return {
      endpointId: endpoint.id,
      method: endpoint.method,
      path: endpoint.path,
      parameters: endpoint.parameters || [],
      requestBody: endpoint.requestBody || null,
      headers: endpoint.headers || [],
      note: 'Request schema extracted from code analysis',
    };
  }

  private async getResponseSchema(endpointId: string): Promise<any> {
    const endpoint = await this.getEndpointDetails(endpointId);
    
    return {
      endpointId: endpoint.id,
      method: endpoint.method,
      path: endpoint.path,
      responseType: endpoint.responseType || 'unknown',
      statusCodes: endpoint.statusCodes || ['200'],
      note: 'Response schema extracted from code analysis',
    };
  }

  private async analyzeAPIStructure(): Promise<any> {
    const allEndpoints = Array.from(this.apiCache.values()).flat();
    
    const analysis = {
      totalEndpoints: allEndpoints.length,
      methods: {} as Record<string, number>,
      services: {} as Record<string, number>,
      pathPatterns: {} as Record<string, number>,
    };

    for (const endpoint of allEndpoints) {
      // Count methods
      analysis.methods[endpoint.method] = (analysis.methods[endpoint.method] || 0) + 1;
      
      // Count services
      analysis.services[endpoint.service] = (analysis.services[endpoint.service] || 0) + 1;
      
      // Analyze path patterns
      const pathPattern = endpoint.path.split('/').slice(0, 3).join('/');
      analysis.pathPatterns[pathPattern] = (analysis.pathPatterns[pathPattern] || 0) + 1;
    }

    return {
      analysis,
      endpoints: allEndpoints.map(ep => ({
        id: ep.id,
        method: ep.method,
        path: ep.path,
        service: ep.service,
      })),
    };
  }

  private async getServiceEndpoints(serviceName: string): Promise<any> {
    const allEndpoints = Array.from(this.apiCache.values()).flat();
    const serviceEndpoints = allEndpoints.filter(ep => ep.service === serviceName);

    return {
      service: serviceName,
      endpoints: serviceEndpoints.map(ep => ({
        id: ep.id,
        method: ep.method,
        path: ep.path,
        description: ep.description,
        filePath: ep.filePath,
      })),
      count: serviceEndpoints.length,
    };
  }
}
