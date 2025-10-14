import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare class AgentTools {
    private projectRoot;
    private agentsCache;
    constructor();
    initialize(): Promise<void>;
    getTools(): Tool[];
    handleToolCall(name: string, args: any): Promise<any>;
    private loadAgentsStructure;
    private parseAgentFile;
    private parseAgentFromCode;
    private parseAgentFromJSON;
    private listAllAgents;
    private getAgentDetails;
    private searchAgents;
    private getAgentConfig;
    private parseConfig;
    private listAgentCapabilities;
    private getAgentHierarchy;
    private analyzeAgentPerformance;
}
