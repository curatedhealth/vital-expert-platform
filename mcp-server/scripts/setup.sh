#!/bin/bash

# VITAL Platform MCP Server Setup Script

echo "🚀 Setting up VITAL Platform MCP Server..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the mcp-server directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the server
echo "🔨 Building the server..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. Please check the build output."
    exit 1
fi

# Make the index.js executable
chmod +x dist/index.js

echo "✅ MCP Server setup complete!"
echo ""
echo "To use with Claude Desktop:"
echo "1. Add the following to your Claude Desktop MCP configuration:"
echo ""
echo '{
  "mcpServers": {
    "vital-platform": {
      "command": "node",
      "args": ["'$(pwd)'/dist/index.js"],
      "cwd": "'$(dirname $(pwd))'"
    }
  }
}'
echo ""
echo "2. Restart Claude Desktop"
echo "3. The VITAL Platform MCP server will be available in your Claude Desktop session"
echo ""
echo "To test the server:"
echo "npm start"
