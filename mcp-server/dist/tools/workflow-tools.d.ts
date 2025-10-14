import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare class WorkflowTools {
    private projectRoot;
    private workflowsCache;
    constructor();
    initialize(): Promise<void>;
    getTools(): Tool[];
    handleToolCall(name: string, args: any): Promise<any>;
    private loadWorkflowsStructure;
    private parseWorkflowFile;
    private calculateComplexity;
    private listWorkflows;
    private getWorkflowDetails;
    private parseConfig;
    private getWorkflowGraph;
    private getNodeType;
    private searchWorkflows;
    private getWorkflowNodes;
    private getWorkflowEdges;
    private analyzeWorkflowComplexity;
    private getComplexityRecommendations;
}
