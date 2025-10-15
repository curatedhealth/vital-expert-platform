import { ToolRegistry } from '../tool-registry';

// Mock the tools
jest.mock('../tools/web-search', () => ({
  WebSearchTool: {
    name: 'web_search',
    description: 'Search the internet',
    invoke: jest.fn()
  }
}));

jest.mock('../tools/pubmed-search', () => ({
  PubMedSearchTool: {
    name: 'pubmed_search',
    description: 'Search medical literature',
    invoke: jest.fn()
  }
}));

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = ToolRegistry.getInstance();
  });

  it('is a singleton', () => {
    const instance1 = ToolRegistry.getInstance();
    const instance2 = ToolRegistry.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('registers medical regulatory tools', () => {
    const tools = registry.getTools();
    expect(tools.length).toBeGreaterThan(0);
    
    const toolIds = tools.map(tool => tool.id);
    expect(toolIds).toContain('web-search');
    expect(toolIds).toContain('pubmed-search');
    expect(toolIds).toContain('fda-database');
    expect(toolIds).toContain('ema-database');
    expect(toolIds).toContain('clinical-trials');
  });

  it('gets tools by category', () => {
    const researchTools = registry.getToolsByCategory('research');
    expect(researchTools.length).toBeGreaterThan(0);
    expect(researchTools.every(tool => tool.category === 'research')).toBe(true);
  });

  it('gets tools by agent compatibility', () => {
    const cardiologyTools = registry.getToolsByAgent('cardiology-expert');
    expect(cardiologyTools).toBeDefined();
  });

  it('executes tools with caching', async () => {
    const mockTool = {
      invoke: jest.fn().mockResolvedValue('Test result')
    };
    
    // Mock a tool
    registry['tools'].set('test-tool', {
      id: 'test-tool',
      name: 'Test Tool',
      description: 'A test tool',
      icon: '🧪',
      category: 'research',
      enabled: true,
      tool: mockTool as any,
      metadata: {
        cacheEnabled: true,
        cacheDuration: 5
      }
    });

    const result = await registry.executeTool('test-tool', { query: 'test' });
    expect(result).toBe('Test result');
    expect(mockTool.invoke).toHaveBeenCalledWith({ query: 'test' });
  });

  it('handles tool execution errors', async () => {
    const mockTool = {
      invoke: jest.fn().mockRejectedValue(new Error('Tool execution failed'))
    };
    
    registry['tools'].set('error-tool', {
      id: 'error-tool',
      name: 'Error Tool',
      description: 'A tool that fails',
      icon: '❌',
      category: 'research',
      enabled: true,
      tool: mockTool as any,
      metadata: {}
    });

    await expect(registry.executeTool('error-tool', {})).rejects.toThrow('Tool execution failed');
  });

  it('validates tool configuration', () => {
    const tools = registry.getTools();
    tools.forEach(tool => {
      expect(tool.id).toBeDefined();
      expect(tool.name).toBeDefined();
      expect(tool.description).toBeDefined();
      expect(tool.category).toBeDefined();
      expect(tool.tool).toBeDefined();
    });
  });

  it('filters enabled tools only', () => {
    const enabledTools = registry.getEnabledTools();
    expect(enabledTools.every(tool => tool.enabled)).toBe(true);
  });
});
