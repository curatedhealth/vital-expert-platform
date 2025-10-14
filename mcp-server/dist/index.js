#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { VITALPlatformMCPServer } from './vital-mcp-server.js';
async function main() {
    const server = new Server({
        name: 'vital-platform-mcp-server',
        version: '1.0.0',
    });
    const vitalServer = new VITALPlatformMCPServer();
    await vitalServer.initialize();
    // List available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: vitalServer.getAvailableTools(),
        };
    });
    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        return await vitalServer.handleToolCall(name, args);
    });
    // Start the server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('VITAL Platform MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
