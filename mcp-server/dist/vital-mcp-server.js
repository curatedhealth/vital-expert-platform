import { FileSystemTools } from './tools/filesystem-tools.js';
import { DocumentationTools } from './tools/documentation-tools.js';
import { AgentTools } from './tools/agent-tools.js';
import { DatabaseTools } from './tools/database-tools.js';
import { APITools } from './tools/api-tools.js';
import { WorkflowTools } from './tools/workflow-tools.js';
import { CodeAnalysisTools } from './tools/code-analysis-tools.js';
export class VITALPlatformMCPServer {
    fileSystemTools;
    documentationTools;
    agentTools;
    databaseTools;
    apiTools;
    workflowTools;
    codeAnalysisTools;
    constructor() {
        this.fileSystemTools = new FileSystemTools();
        this.documentationTools = new DocumentationTools();
        this.agentTools = new AgentTools();
        this.databaseTools = new DatabaseTools();
        this.apiTools = new APITools();
        this.workflowTools = new WorkflowTools();
        this.codeAnalysisTools = new CodeAnalysisTools();
    }
    async initialize() {
        await Promise.all([
            this.fileSystemTools.initialize(),
            this.documentationTools.initialize(),
            this.agentTools.initialize(),
            this.databaseTools.initialize(),
            this.apiTools.initialize(),
            this.workflowTools.initialize(),
            this.codeAnalysisTools.initialize(),
        ]);
    }
    getAvailableTools() {
        return [
            ...this.fileSystemTools.getTools(),
            ...this.documentationTools.getTools(),
            ...this.agentTools.getTools(),
            ...this.databaseTools.getTools(),
            ...this.apiTools.getTools(),
            ...this.workflowTools.getTools(),
            ...this.codeAnalysisTools.getTools(),
        ];
    }
    async handleToolCall(name, args) {
        // Route tool calls to appropriate tool group
        if (name.startsWith('filesystem_')) {
            return await this.fileSystemTools.handleToolCall(name, args);
        }
        else if (name.startsWith('docs_')) {
            return await this.documentationTools.handleToolCall(name, args);
        }
        else if (name.startsWith('agent_')) {
            return await this.agentTools.handleToolCall(name, args);
        }
        else if (name.startsWith('db_')) {
            return await this.databaseTools.handleToolCall(name, args);
        }
        else if (name.startsWith('api_')) {
            return await this.apiTools.handleToolCall(name, args);
        }
        else if (name.startsWith('workflow_')) {
            return await this.workflowTools.handleToolCall(name, args);
        }
        else if (name.startsWith('code_')) {
            return await this.codeAnalysisTools.handleToolCall(name, args);
        }
        else {
            throw new Error(`Unknown tool: ${name}`);
        }
    }
}
