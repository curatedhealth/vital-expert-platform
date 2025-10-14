import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare class VITALPlatformMCPServer {
    private fileSystemTools;
    private documentationTools;
    private agentTools;
    private databaseTools;
    private apiTools;
    private workflowTools;
    private codeAnalysisTools;
    constructor();
    initialize(): Promise<void>;
    getAvailableTools(): Tool[];
    handleToolCall(name: string, args: any): Promise<any>;
}
