import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare class FileSystemTools {
    private projectRoot;
    constructor();
    initialize(): Promise<void>;
    getTools(): Tool[];
    handleToolCall(name: string, args: any): Promise<any>;
    private listDirectory;
    private readFile;
    private findFiles;
    private getFileInfo;
    private searchContent;
}
