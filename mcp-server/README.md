# VITAL Platform MCP Server

A Model Context Protocol (MCP) server that provides comprehensive access to the VITAL Platform codebase, documentation, and system architecture.

## Features

### 🔍 **Codebase Navigation**
- File system exploration and search
- Code analysis and complexity metrics
- Dependency tracking and relationship mapping
- Pattern detection and duplicate code identification

### 📚 **Documentation Access**
- Comprehensive documentation search and retrieval
- Architecture overview and system design access
- API documentation and endpoint discovery
- Compliance and regulatory documentation

### 🤖 **Agent & Workflow Management**
- Agent discovery and configuration access
- Workflow analysis and graph visualization
- Capability mapping and performance metrics
- Multi-agent orchestration insights

### 🗄️ **Database & Schema Analysis**
- Migration tracking and analysis
- Schema exploration and relationship mapping
- Database change analysis over time
- Table and constraint discovery

### 🔌 **API Endpoint Discovery**
- RESTful API endpoint enumeration
- Request/response schema analysis
- Service organization and structure
- API usage patterns and metrics

## Installation

1. **Install dependencies:**
   ```bash
   cd mcp-server
   npm install
   ```

2. **Build the server:**
   ```bash
   npm run build
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

## Configuration

### Claude Desktop Configuration

Add the following to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "vital-platform": {
      "command": "node",
      "args": ["/path/to/vital-platform/mcp-server/dist/index.js"],
      "cwd": "/path/to/vital-platform"
    }
  }
}
```

### Environment Variables

The server automatically detects the VITAL platform structure. Ensure you're running it from the project root directory.

## Available Tools

### File System Tools
- `filesystem_list_directory` - List files and directories
- `filesystem_read_file` - Read file contents
- `filesystem_find_files` - Find files by pattern
- `filesystem_get_file_info` - Get file metadata
- `filesystem_search_content` - Search within files

### Documentation Tools
- `docs_list_documentation` - List all documentation
- `docs_read_documentation` - Read specific docs
- `docs_search_documentation` - Search documentation
- `docs_get_readme` - Get main README
- `docs_get_architecture_overview` - Get system architecture
- `docs_get_api_documentation` - Get API docs
- `docs_get_compliance_docs` - Get compliance docs

### Agent Tools
- `agent_list_all_agents` - List all agents
- `agent_get_agent_details` - Get agent details
- `agent_search_agents` - Search agents
- `agent_get_agent_config` - Get agent configuration
- `agent_list_agent_capabilities` - List capabilities
- `agent_get_agent_hierarchy` - Get agent hierarchy
- `agent_analyze_agent_performance` - Analyze performance

### Workflow Tools
- `workflow_list_workflows` - List workflows
- `workflow_get_workflow_details` - Get workflow details
- `workflow_get_workflow_graph` - Get workflow graph
- `workflow_search_workflows` - Search workflows
- `workflow_get_workflow_nodes` - Get workflow nodes
- `workflow_get_workflow_edges` - Get workflow edges
- `workflow_analyze_workflow_complexity` - Analyze complexity

### Database Tools
- `db_list_migrations` - List migrations
- `db_get_migration_details` - Get migration details
- `db_get_schema_overview` - Get schema overview
- `db_search_schema` - Search schema
- `db_get_table_schema` - Get table schema
- `db_get_relationships` - Get relationships
- `db_analyze_schema_changes` - Analyze changes

### API Tools
- `api_list_endpoints` - List API endpoints
- `api_get_endpoint_details` - Get endpoint details
- `api_search_endpoints` - Search endpoints
- `api_get_request_schema` - Get request schema
- `api_get_response_schema` - Get response schema
- `api_analyze_api_structure` - Analyze API structure
- `api_get_service_endpoints` - Get service endpoints

### Code Analysis Tools
- `code_analyze_file` - Analyze file complexity
- `code_find_dependencies` - Find dependencies
- `code_search_patterns` - Search code patterns
- `code_get_function_info` - Get function info
- `code_analyze_complexity` - Analyze complexity
- `code_find_duplicates` - Find duplicate code
- `code_get_architecture_overview` - Get architecture overview

## Usage Examples

### Discover Your Agent Ecosystem
```
Use agent_list_all_agents to see all available agents, then agent_get_agent_details to understand specific agent capabilities.
```

### Analyze Workflow Complexity
```
Use workflow_list_workflows to find workflows, then workflow_analyze_workflow_complexity to understand their structure.
```

### Explore API Endpoints
```
Use api_list_endpoints to see all available endpoints, then api_get_endpoint_details for specific endpoint information.
```

### Search Documentation
```
Use docs_search_documentation to find relevant documentation, then docs_read_documentation to get the full content.
```

## Development

### Adding New Tools

1. Create a new tool class in `src/tools/`
2. Implement the `getTools()` and `handleToolCall()` methods
3. Add the tool class to `src/vital-mcp-server.ts`
4. Update the tool routing logic

### Testing

```bash
# Run in development mode
npm run dev

# Watch for changes
npm run watch
```

## Architecture

The MCP server is organized into specialized tool groups:

- **FileSystemTools**: File operations and content search
- **DocumentationTools**: Documentation access and search
- **AgentTools**: Agent discovery and analysis
- **WorkflowTools**: Workflow analysis and visualization
- **DatabaseTools**: Database schema and migration analysis
- **APITools**: API endpoint discovery and analysis
- **CodeAnalysisTools**: Code complexity and pattern analysis

Each tool group is independently initialized and provides a focused set of capabilities for different aspects of the VITAL platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your tools or improvements
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
