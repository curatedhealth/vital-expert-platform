import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare class DocumentationTools {
    private projectRoot;
    private docsCache;
    constructor();
    initialize(): Promise<void>;
    getTools(): Tool[];
    handleToolCall(name: string, args: any): Promise<any>;
    private loadDocumentationStructure;
    private categorizeDocumentation;
    private listDocumentation;
    private readDocumentation;
    private searchDocumentation;
    private getContext;
    private getReadme;
    private getArchitectureOverview;
    private getAPIDocumentation;
    private getComplianceDocs;
}
