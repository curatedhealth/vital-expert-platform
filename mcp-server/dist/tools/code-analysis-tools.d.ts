import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare class CodeAnalysisTools {
    private projectRoot;
    private codeCache;
    constructor();
    initialize(): Promise<void>;
    getTools(): Tool[];
    handleToolCall(name: string, args: any): Promise<any>;
    private loadCodeStructure;
    private analyzeFile;
    private detectLanguage;
    private extractFunctions;
    private extractClasses;
    private extractImports;
    private extractExports;
    private calculateComplexity;
    private detectPatterns;
    private findDependencies;
    private searchPatterns;
    private getContext;
    private getFunctionInfo;
    private analyzeComplexity;
    private getComplexityRecommendations;
    private findDuplicates;
    private simpleHash;
    private getArchitectureOverview;
}
