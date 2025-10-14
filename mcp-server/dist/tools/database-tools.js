import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
export class DatabaseTools {
    projectRoot;
    migrationsCache = new Map();
    schemaCache = new Map();
    constructor() {
        this.projectRoot = process.cwd();
    }
    async initialize() {
        await this.loadDatabaseStructure();
    }
    getTools() {
        return [
            {
                name: 'db_list_migrations',
                description: 'List all database migrations',
                inputSchema: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            description: 'Filter by migration status (applied, pending, etc.)',
                        },
                        dateRange: {
                            type: 'string',
                            description: 'Filter by date range (e.g., "2024-01-01 to 2024-12-31")',
                        },
                    },
                },
            },
            {
                name: 'db_get_migration_details',
                description: 'Get details of a specific migration',
                inputSchema: {
                    type: 'object',
                    properties: {
                        migrationId: {
                            type: 'string',
                            description: 'Migration ID or filename',
                        },
                    },
                    required: ['migrationId'],
                },
            },
            {
                name: 'db_get_schema_overview',
                description: 'Get database schema overview',
                inputSchema: {
                    type: 'object',
                    properties: {
                        table: {
                            type: 'string',
                            description: 'Specific table to focus on',
                        },
                    },
                },
            },
            {
                name: 'db_search_schema',
                description: 'Search database schema for tables, columns, or constraints',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query for schema elements',
                        },
                        type: {
                            type: 'string',
                            description: 'Type of schema element (table, column, constraint, index)',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'db_get_table_schema',
                description: 'Get detailed schema for a specific table',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tableName: {
                            type: 'string',
                            description: 'Name of the table',
                        },
                    },
                    required: ['tableName'],
                },
            },
            {
                name: 'db_get_relationships',
                description: 'Get table relationships and foreign keys',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tableName: {
                            type: 'string',
                            description: 'Table name to get relationships for',
                        },
                    },
                },
            },
            {
                name: 'db_analyze_schema_changes',
                description: 'Analyze schema changes over time',
                inputSchema: {
                    type: 'object',
                    properties: {
                        since: {
                            type: 'string',
                            description: 'Analyze changes since this date',
                        },
                    },
                },
            },
        ];
    }
    async handleToolCall(name, args) {
        switch (name) {
            case 'db_list_migrations':
                return await this.listMigrations(args.status, args.dateRange);
            case 'db_get_migration_details':
                return await this.getMigrationDetails(args.migrationId);
            case 'db_get_schema_overview':
                return await this.getSchemaOverview(args.table);
            case 'db_search_schema':
                return await this.searchSchema(args.query, args.type);
            case 'db_get_table_schema':
                return await this.getTableSchema(args.tableName);
            case 'db_get_relationships':
                return await this.getRelationships(args.tableName);
            case 'db_analyze_schema_changes':
                return await this.analyzeSchemaChanges(args.since);
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    async loadDatabaseStructure() {
        // Load migration files
        const migrationPatterns = [
            'supabase/migrations/**/*.sql',
            'database/migrations/**/*.sql',
            'db/migrations/**/*.sql',
            '**/migrations/**/*.sql',
        ];
        for (const pattern of migrationPatterns) {
            const files = await glob(pattern, {
                cwd: this.projectRoot,
                nodir: true,
                ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
            });
            for (const file of files) {
                try {
                    const migrationData = await this.parseMigrationFile(file);
                    if (migrationData) {
                        this.migrationsCache.set(migrationData.id, migrationData);
                    }
                }
                catch (error) {
                    continue;
                }
            }
        }
        // Load schema files
        const schemaPatterns = [
            'supabase/schema.sql',
            'database/schema.sql',
            'db/schema.sql',
            '**/schema.sql',
            '**/schema/**/*.sql',
        ];
        for (const pattern of schemaPatterns) {
            const files = await glob(pattern, {
                cwd: this.projectRoot,
                nodir: true,
                ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
            });
            for (const file of files) {
                try {
                    const schemaData = await this.parseSchemaFile(file);
                    if (schemaData) {
                        this.schemaCache.set(schemaData.id, schemaData);
                    }
                }
                catch (error) {
                    continue;
                }
            }
        }
    }
    async parseMigrationFile(filePath) {
        const content = await fs.readFile(path.join(this.projectRoot, filePath), 'utf8');
        const fileName = path.basename(filePath);
        // Extract migration ID from filename (usually timestamp-based)
        const migrationIdMatch = fileName.match(/(\d{8}_\d{6})/);
        const migrationId = migrationIdMatch ? migrationIdMatch[1] : fileName.replace('.sql', '');
        // Extract migration description from comments
        const descriptionMatch = content.match(/--\s*(.+)/);
        const description = descriptionMatch ? descriptionMatch[1] : 'No description';
        // Analyze migration content
        const analysis = this.analyzeMigrationContent(content);
        return {
            id: migrationId,
            fileName,
            filePath,
            description,
            content,
            analysis,
            createdAt: this.extractDateFromFilename(fileName),
        };
    }
    async parseSchemaFile(filePath) {
        const content = await fs.readFile(path.join(this.projectRoot, filePath), 'utf8');
        const fileName = path.basename(filePath);
        // Extract tables, columns, and relationships
        const tables = this.extractTables(content);
        const relationships = this.extractRelationships(content);
        return {
            id: fileName.replace('.sql', ''),
            fileName,
            filePath,
            content,
            tables,
            relationships,
            tableCount: tables.length,
        };
    }
    analyzeMigrationContent(content) {
        const analysis = {
            operations: [],
            tablesAffected: new Set(),
            isDestructive: false,
            hasDataMigration: false,
        };
        // Check for different types of operations
        if (content.includes('CREATE TABLE')) {
            analysis.operations.push('CREATE_TABLE');
        }
        if (content.includes('ALTER TABLE')) {
            analysis.operations.push('ALTER_TABLE');
        }
        if (content.includes('DROP TABLE')) {
            analysis.operations.push('DROP_TABLE');
            analysis.isDestructive = true;
        }
        if (content.includes('CREATE INDEX')) {
            analysis.operations.push('CREATE_INDEX');
        }
        if (content.includes('INSERT INTO')) {
            analysis.operations.push('INSERT_DATA');
            analysis.hasDataMigration = true;
        }
        if (content.includes('UPDATE')) {
            analysis.operations.push('UPDATE_DATA');
            analysis.hasDataMigration = true;
        }
        // Extract table names
        const tableMatches = content.matchAll(/TABLE\s+(\w+)/gi);
        for (const match of tableMatches) {
            analysis.tablesAffected.add(match[1]);
        }
        return {
            ...analysis,
            tablesAffected: Array.from(analysis.tablesAffected),
        };
    }
    extractTables(content) {
        const tables = [];
        const tableMatches = content.matchAll(/CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\)/gi);
        for (const match of tableMatches) {
            const tableName = match[1];
            const tableDefinition = match[2];
            const columns = this.extractColumns(tableDefinition);
            const constraints = this.extractConstraints(tableDefinition);
            tables.push({
                name: tableName,
                columns,
                constraints,
                columnCount: columns.length,
            });
        }
        return tables;
    }
    extractColumns(tableDefinition) {
        const columns = [];
        const columnMatches = tableDefinition.matchAll(/(\w+)\s+([^,\n]+)/g);
        for (const match of columnMatches) {
            const columnName = match[1];
            const columnDef = match[2].trim();
            // Skip constraint definitions
            if (columnDef.includes('PRIMARY KEY') ||
                columnDef.includes('FOREIGN KEY') ||
                columnDef.includes('UNIQUE') ||
                columnDef.includes('CHECK')) {
                continue;
            }
            columns.push({
                name: columnName,
                definition: columnDef,
                type: this.extractColumnType(columnDef),
                isNullable: !columnDef.includes('NOT NULL'),
                hasDefault: columnDef.includes('DEFAULT'),
            });
        }
        return columns;
    }
    extractColumnType(columnDef) {
        const typeMatch = columnDef.match(/(\w+)/);
        return typeMatch ? typeMatch[1] : 'unknown';
    }
    extractConstraints(tableDefinition) {
        const constraints = [];
        // Primary key
        const pkMatch = tableDefinition.match(/PRIMARY KEY\s*\(([^)]+)\)/i);
        if (pkMatch) {
            constraints.push({
                type: 'PRIMARY_KEY',
                columns: pkMatch[1].split(',').map(col => col.trim()),
            });
        }
        // Foreign keys
        const fkMatches = tableDefinition.matchAll(/FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+(\w+)\s*\(([^)]+)\)/gi);
        for (const match of fkMatches) {
            constraints.push({
                type: 'FOREIGN_KEY',
                columns: match[1].split(',').map(col => col.trim()),
                referencedTable: match[2],
                referencedColumns: match[3].split(',').map(col => col.trim()),
            });
        }
        // Unique constraints
        const uniqueMatches = tableDefinition.matchAll(/UNIQUE\s*\(([^)]+)\)/gi);
        for (const match of uniqueMatches) {
            constraints.push({
                type: 'UNIQUE',
                columns: match[1].split(',').map(col => col.trim()),
            });
        }
        return constraints;
    }
    extractRelationships(content) {
        const relationships = [];
        const fkMatches = content.matchAll(/FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+(\w+)\s*\(([^)]+)\)/gi);
        for (const match of fkMatches) {
            relationships.push({
                fromTable: this.extractTableName(match[0]),
                fromColumns: match[1].split(',').map(col => col.trim()),
                toTable: match[2],
                toColumns: match[3].split(',').map(col => col.trim()),
                type: 'FOREIGN_KEY',
            });
        }
        return relationships;
    }
    extractTableName(foreignKeyDef) {
        // This is a simplified extraction - in practice, you'd need more sophisticated parsing
        const tableMatch = foreignKeyDef.match(/CREATE TABLE\s+(\w+)/i);
        return tableMatch ? tableMatch[1] : 'unknown';
    }
    extractDateFromFilename(fileName) {
        const dateMatch = fileName.match(/(\d{8})/);
        if (dateMatch) {
            const dateStr = dateMatch[1];
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            return new Date(`${year}-${month}-${day}`);
        }
        return null;
    }
    async listMigrations(status, dateRange) {
        let migrations = Array.from(this.migrationsCache.values());
        // Apply filters
        if (status) {
            migrations = migrations.filter(migration => migration.analysis?.operations?.includes(status.toUpperCase()));
        }
        if (dateRange) {
            const [startDate, endDate] = dateRange.split(' to ');
            if (startDate && endDate) {
                migrations = migrations.filter(migration => {
                    if (!migration.createdAt)
                        return false;
                    return migration.createdAt >= new Date(startDate) &&
                        migration.createdAt <= new Date(endDate);
                });
            }
        }
        return {
            migrations: migrations.map(migration => ({
                id: migration.id,
                fileName: migration.fileName,
                description: migration.description,
                operations: migration.analysis?.operations || [],
                tablesAffected: migration.analysis?.tablesAffected || [],
                isDestructive: migration.analysis?.isDestructive || false,
                hasDataMigration: migration.analysis?.hasDataMigration || false,
                createdAt: migration.createdAt,
            })),
            count: migrations.length,
            filters: { status, dateRange },
        };
    }
    async getMigrationDetails(migrationId) {
        const migration = this.migrationsCache.get(migrationId) ||
            Array.from(this.migrationsCache.values()).find(m => m.fileName.includes(migrationId) ||
                m.id === migrationId);
        if (!migration) {
            throw new Error(`Migration not found: ${migrationId}`);
        }
        return {
            ...migration,
            fullDetails: true,
        };
    }
    async getSchemaOverview(table) {
        const schemas = Array.from(this.schemaCache.values());
        if (schemas.length === 0) {
            return {
                message: 'No schema files found',
                tables: [],
                tableCount: 0,
            };
        }
        // Combine all tables from all schema files
        const allTables = schemas.flatMap(schema => schema.tables || []);
        let tables = allTables;
        if (table) {
            tables = allTables.filter(t => t.name.toLowerCase().includes(table.toLowerCase()));
        }
        return {
            tables: tables.map((t) => ({
                name: t.name,
                columnCount: t.columnCount,
                columns: t.columns?.map((col) => ({
                    name: col.name,
                    type: col.type,
                    isNullable: col.isNullable,
                })) || [],
                constraints: t.constraints || [],
            })),
            tableCount: tables.length,
            totalTables: allTables.length,
            focusTable: table,
        };
    }
    async searchSchema(query, type) {
        const schemas = Array.from(this.schemaCache.values());
        const results = [];
        const searchQuery = query.toLowerCase();
        for (const schema of schemas) {
            for (const table of schema.tables || []) {
                let matches = false;
                const matchDetails = [];
                if (type === 'table' || !type) {
                    if (table.name.toLowerCase().includes(searchQuery)) {
                        matches = true;
                        matchDetails.push('table_name');
                    }
                }
                if (type === 'column' || !type) {
                    for (const column of table.columns || []) {
                        if (column.name.toLowerCase().includes(searchQuery) ||
                            column.type.toLowerCase().includes(searchQuery)) {
                            matches = true;
                            matchDetails.push('column');
                        }
                    }
                }
                if (type === 'constraint' || !type) {
                    for (const constraint of table.constraints || []) {
                        if (constraint.type.toLowerCase().includes(searchQuery)) {
                            matches = true;
                            matchDetails.push('constraint');
                        }
                    }
                }
                if (matches) {
                    results.push({
                        table: table.name,
                        schema: schema.fileName,
                        matchDetails,
                        columns: table.columns || [],
                        constraints: table.constraints || [],
                    });
                }
            }
        }
        return {
            query,
            type: type || 'all',
            results,
            count: results.length,
        };
    }
    async getTableSchema(tableName) {
        const schemas = Array.from(this.schemaCache.values());
        for (const schema of schemas) {
            const table = schema.tables?.find((t) => t.name.toLowerCase() === tableName.toLowerCase());
            if (table) {
                return {
                    tableName: table.name,
                    schema: schema.fileName,
                    columns: table.columns || [],
                    constraints: table.constraints || [],
                    columnCount: table.columnCount,
                    constraintCount: table.constraints?.length || 0,
                };
            }
        }
        throw new Error(`Table not found: ${tableName}`);
    }
    async getRelationships(tableName) {
        const schemas = Array.from(this.schemaCache.values());
        const allRelationships = schemas.flatMap(schema => schema.relationships || []);
        let relationships = allRelationships;
        if (tableName) {
            relationships = allRelationships.filter(rel => rel.fromTable.toLowerCase() === tableName.toLowerCase() ||
                rel.toTable.toLowerCase() === tableName.toLowerCase());
        }
        return {
            relationships,
            count: relationships.length,
            focusTable: tableName,
        };
    }
    async analyzeSchemaChanges(since) {
        const migrations = Array.from(this.migrationsCache.values());
        let filteredMigrations = migrations;
        if (since) {
            const sinceDate = new Date(since);
            filteredMigrations = migrations.filter(migration => migration.createdAt && migration.createdAt >= sinceDate);
        }
        const analysis = {
            totalMigrations: filteredMigrations.length,
            operations: {},
            tablesAffected: new Set(),
            destructiveChanges: 0,
            dataMigrations: 0,
        };
        for (const migration of filteredMigrations) {
            // Count operations
            for (const operation of migration.analysis?.operations || []) {
                analysis.operations[operation] = (analysis.operations[operation] || 0) + 1;
            }
            // Track affected tables
            for (const table of migration.analysis?.tablesAffected || []) {
                analysis.tablesAffected.add(table);
            }
            if (migration.analysis?.isDestructive) {
                analysis.destructiveChanges++;
            }
            if (migration.analysis?.hasDataMigration) {
                analysis.dataMigrations++;
            }
        }
        return {
            analysis: {
                ...analysis,
                tablesAffected: Array.from(analysis.tablesAffected),
            },
            since: since || 'all time',
            migrations: filteredMigrations.map(m => ({
                id: m.id,
                fileName: m.fileName,
                operations: m.analysis?.operations || [],
                isDestructive: m.analysis?.isDestructive || false,
                createdAt: m.createdAt,
            })),
        };
    }
}
