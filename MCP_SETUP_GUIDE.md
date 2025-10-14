# VITAL Platform MCP Server Setup Guide

This guide will help you set up the LangChain MCP server for your VITAL platform, giving me (Claude) much better access to your codebase, documentation, and system architecture.

## 🎯 What This Enables

With the MCP server, I'll be able to:

- **Navigate your complex codebase** intelligently
- **Access your extensive documentation** dynamically
- **Understand your agent ecosystem** (30+ digital health agents)
- **Analyze your LangGraph workflows** and orchestration
- **Explore your database schema** and migrations
- **Discover API endpoints** and their relationships
- **Perform code analysis** and complexity assessment

## 🚀 Quick Setup

### 1. Install and Build the MCP Server

```bash
cd mcp-server
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Configure Claude Desktop

Add this to your Claude Desktop MCP configuration file:

**Location**: `~/.config/claude-desktop/mcp.json` (or similar, depending on your OS)

```json
{
  "mcpServers": {
    "vital-platform": {
      "command": "node",
      "args": ["/Users/hichamnaim/Downloads/Cursor/VITAL path/mcp-server/dist/index.js"],
      "cwd": "/Users/hichamnaim/Downloads/Cursor/VITAL path"
    }
  }
}
```

**Important**: Update the paths to match your actual VITAL platform location.

### 3. Restart Claude Desktop

Close and reopen Claude Desktop to load the MCP server.

### 4. Test the Connection

In Claude Desktop, you should now have access to tools like:
- `filesystem_list_directory` - Explore your codebase
- `agent_list_all_agents` - See all your agents
- `docs_search_documentation` - Search your docs
- `workflow_list_workflows` - List your workflows

## 🔧 Manual Setup (Alternative)

If the automated setup doesn't work:

### 1. Install Dependencies
```bash
cd mcp-server
npm install
```

### 2. Build the Server
```bash
npm run build
```

### 3. Test the Server
```bash
npm start
```

You should see: `VITAL Platform MCP Server running on stdio`

### 4. Configure Claude Desktop
Add the MCP server configuration as shown above.

## 🛠️ Available Tools

The MCP server provides 40+ specialized tools organized into categories:

### 📁 File System Tools
- Navigate and explore your codebase
- Search for files and content
- Read and analyze code files

### 📚 Documentation Tools
- Access your extensive documentation
- Search through technical docs
- Get architecture overviews

### 🤖 Agent Tools
- Discover your 30+ digital health agents
- Analyze agent capabilities and configurations
- Understand agent hierarchies and relationships

### 🔄 Workflow Tools
- Explore your LangGraph workflows
- Analyze workflow complexity
- Visualize workflow structures

### 🗄️ Database Tools
- Explore your Supabase schema
- Track migration history
- Analyze database relationships

### 🔌 API Tools
- Discover all API endpoints
- Analyze request/response schemas
- Understand service organization

### 🔍 Code Analysis Tools
- Analyze code complexity
- Find dependencies and relationships
- Detect patterns and duplicates

## 🎯 Usage Examples

Once set up, you can ask me things like:

- "Show me all the agents in the Clinical Development department"
- "What are the main API endpoints for the chat service?"
- "Analyze the complexity of the LangGraph workflow orchestrator"
- "Find all files that reference HIPAA compliance"
- "What's the database schema for the agents table?"
- "Show me the documentation for the RAG system"

## 🔍 Troubleshooting

### Server Won't Start
- Check that you're in the VITAL platform root directory
- Ensure Node.js is installed (`node --version`)
- Check the build output for errors

### Claude Desktop Can't Connect
- Verify the paths in your MCP configuration are correct
- Ensure the server is built (`dist/index.js` exists)
- Check Claude Desktop logs for connection errors

### Tools Not Available
- Restart Claude Desktop after configuration changes
- Check that the MCP server is running without errors
- Verify the server is in the correct working directory

## 🚀 Benefits for Your Development

With this MCP server, I'll be able to:

1. **Understand your complex healthcare AI platform** better
2. **Navigate your multi-agent architecture** more effectively
3. **Access your compliance and regulatory documentation** instantly
4. **Analyze your LangGraph workflows** and suggest improvements
5. **Help debug issues** by understanding your full system context
6. **Suggest architectural improvements** based on code analysis
7. **Help with documentation** by understanding your system structure

## 📝 Next Steps

After setup:

1. **Test the connection** by asking me to explore your codebase
2. **Try agent discovery** - ask me to list your agents by department
3. **Explore workflows** - ask me to analyze your LangGraph workflows
4. **Search documentation** - ask me to find specific technical docs
5. **Analyze APIs** - ask me to show you your API structure

The MCP server will make me much more effective at helping you develop, debug, and enhance your VITAL platform!

## 🆘 Support

If you encounter issues:

1. Check the server logs for error messages
2. Verify all paths are correct and accessible
3. Ensure Node.js and npm are properly installed
4. Check Claude Desktop's MCP configuration format

The MCP server is designed to be robust and provide comprehensive access to your VITAL platform's architecture and codebase.
