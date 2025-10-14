import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare class DatabaseTools {
    private projectRoot;
    private migrationsCache;
    private schemaCache;
    constructor();
    initialize(): Promise<void>;
    getTools(): Tool[];
    handleToolCall(name: string, args: any): Promise<any>;
    private loadDatabaseStructure;
    private parseMigrationFile;
    private parseSchemaFile;
    private analyzeMigrationContent;
    private extractTables;
    private extractColumns;
    private extractColumnType;
    private extractConstraints;
    private extractRelationships;
    private extractTableName;
    private extractDateFromFilename;
    private listMigrations;
    private getMigrationDetails;
    private getSchemaOverview;
    private searchSchema;
    private getTableSchema;
    private getRelationships;
    private analyzeSchemaChanges;
}
