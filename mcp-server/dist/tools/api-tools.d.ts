import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare class APITools {
    private projectRoot;
    private apiCache;
    constructor();
    initialize(): Promise<void>;
    getTools(): Tool[];
    handleToolCall(name: string, args: any): Promise<any>;
    private loadAPIStructure;
    private parseAPIFile;
    private parseNextJSAPIFile;
    private parsePythonAPIFile;
    private extractRouteFromPath;
    private extractServiceFromPath;
    private extractDescription;
    private extractParameters;
    private extractResponseType;
    private extractPythonDescription;
    private extractPythonParameters;
    private extractPythonResponseType;
    private listEndpoints;
    private getEndpointDetails;
    private searchEndpoints;
    private getRequestSchema;
    private getResponseSchema;
    private analyzeAPIStructure;
    private getServiceEndpoints;
}
