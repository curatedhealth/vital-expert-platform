import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
export class DocumentationTools {
    projectRoot;
    docsCache = new Map();
    constructor() {
        this.projectRoot = process.cwd();
    }
    async initialize() {
        // Pre-load documentation structure
        await this.loadDocumentationStructure();
    }
    getTools() {
        return [
            {
                name: 'docs_list_documentation',
                description: 'List all available documentation files',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: {
                            type: 'string',
                            description: 'Filter by documentation category (technical, user, api, etc.)',
                        },
                    },
                },
            },
            {
                name: 'docs_read_documentation',
                description: 'Read a specific documentation file',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Path to documentation file',
                        },
                    },
                    required: ['path'],
                },
            },
            {
                name: 'docs_search_documentation',
                description: 'Search through documentation content',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query',
                        },
                        category: {
                            type: 'string',
                            description: 'Filter by documentation category',
                        },
                        caseSensitive: {
                            type: 'boolean',
                            description: 'Case sensitive search',
                            default: false,
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'docs_get_readme',
                description: 'Get the main README file content',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'docs_get_architecture_overview',
                description: 'Get system architecture documentation',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'docs_get_api_documentation',
                description: 'Get API documentation and endpoints',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'docs_get_compliance_docs',
                description: 'Get healthcare compliance and regulatory documentation',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
        ];
    }
    async handleToolCall(name, args) {
        switch (name) {
            case 'docs_list_documentation':
                return await this.listDocumentation(args.category);
            case 'docs_read_documentation':
                return await this.readDocumentation(args.path);
            case 'docs_search_documentation':
                return await this.searchDocumentation(args.query, args.category, args.caseSensitive);
            case 'docs_get_readme':
                return await this.getReadme();
            case 'docs_get_architecture_overview':
                return await this.getArchitectureOverview();
            case 'docs_get_api_documentation':
                return await this.getAPIDocumentation();
            case 'docs_get_compliance_docs':
                return await this.getComplianceDocs();
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    async loadDocumentationStructure() {
        const docPatterns = [
            '**/*.md',
            '**/README.md',
            '**/CHANGELOG.md',
            '**/CONTRIBUTING.md',
            '**/LICENSE',
            '**/SECURITY.md',
        ];
        for (const pattern of docPatterns) {
            const files = await glob(pattern, {
                cwd: this.projectRoot,
                nodir: true,
                ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
            });
            for (const file of files) {
                const category = this.categorizeDocumentation(file);
                if (!this.docsCache.has(category)) {
                    this.docsCache.set(category, []);
                }
                this.docsCache.get(category).push(file);
            }
        }
    }
    categorizeDocumentation(filePath) {
        if (filePath.includes('/docs/'))
            return 'technical';
        if (filePath.includes('/api/'))
            return 'api';
        if (filePath.includes('compliance') || filePath.includes('audit'))
            return 'compliance';
        if (filePath.includes('deployment') || filePath.includes('setup'))
            return 'deployment';
        if (filePath.includes('README'))
            return 'readme';
        if (filePath.includes('CHANGELOG'))
            return 'changelog';
        if (filePath.includes('CONTRIBUTING'))
            return 'contributing';
        if (filePath.includes('SECURITY'))
            return 'security';
        return 'general';
    }
    async listDocumentation(category) {
        if (category) {
            const files = this.docsCache.get(category) || [];
            return {
                category,
                files: files.map((file) => ({
                    path: file,
                    name: path.basename(file),
                    category,
                })),
                count: files.length,
            };
        }
        const allDocs = {};
        for (const [cat, files] of this.docsCache.entries()) {
            allDocs[cat] = files.map((file) => ({
                path: file,
                name: path.basename(file),
                category: cat,
            }));
        }
        return {
            categories: Object.keys(allDocs),
            documentation: allDocs,
            totalFiles: Object.values(allDocs).flat().length,
        };
    }
    async readDocumentation(docPath) {
        const fullPath = path.join(this.projectRoot, docPath);
        if (!await fs.pathExists(fullPath)) {
            throw new Error(`Documentation file not found: ${docPath}`);
        }
        const content = await fs.readFile(fullPath, 'utf8');
        const stats = await fs.stat(fullPath);
        return {
            path: docPath,
            content,
            size: stats.size,
            modified: stats.mtime,
            category: this.categorizeDocumentation(docPath),
        };
    }
    async searchDocumentation(query, category, caseSensitive = false) {
        const searchCategories = category ? [category] : Array.from(this.docsCache.keys());
        const results = [];
        const flags = caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(query, flags);
        for (const cat of searchCategories) {
            const files = this.docsCache.get(cat) || [];
            for (const file of files) {
                try {
                    const content = await fs.readFile(path.join(this.projectRoot, file), 'utf8');
                    const matches = [...content.matchAll(regex)];
                    if (matches.length > 0) {
                        results.push({
                            file,
                            category: cat,
                            matches: matches.map(match => ({
                                text: match[0],
                                index: match.index,
                                line: content.substring(0, match.index).split('\n').length,
                                context: this.getContext(content, match.index, 100),
                            })),
                            matchCount: matches.length,
                        });
                    }
                }
                catch (error) {
                    continue;
                }
            }
        }
        return {
            query,
            category: category || 'all',
            results,
            totalMatches: results.reduce((sum, result) => sum + result.matchCount, 0),
            filesSearched: results.length,
        };
    }
    getContext(content, index, contextLength) {
        const start = Math.max(0, index - contextLength);
        const end = Math.min(content.length, index + contextLength);
        return content.substring(start, end);
    }
    async getReadme() {
        const readmeFiles = [
            'README.md',
            'readme.md',
            'Readme.md',
        ];
        for (const readme of readmeFiles) {
            const fullPath = path.join(this.projectRoot, readme);
            if (await fs.pathExists(fullPath)) {
                return await this.readDocumentation(readme);
            }
        }
        throw new Error('No README file found');
    }
    async getArchitectureOverview() {
        const archFiles = [
            'docs/ARCHITECTURE.md',
            'docs/technical/architecture.md',
            'PROJECT_SUMMARY.md',
            'docs/SYSTEM_ARCHITECTURE.md',
        ];
        for (const arch of archFiles) {
            const fullPath = path.join(this.projectRoot, arch);
            if (await fs.pathExists(fullPath)) {
                return await this.readDocumentation(arch);
            }
        }
        // Fallback to searching for architecture-related content
        return await this.searchDocumentation('architecture|system design|components', 'technical');
    }
    async getAPIDocumentation() {
        const apiFiles = [
            'docs/API.md',
            'docs/api/README.md',
            'docs/technical/api-documentation.md',
        ];
        for (const api of apiFiles) {
            const fullPath = path.join(this.projectRoot, api);
            if (await fs.pathExists(fullPath)) {
                return await this.readDocumentation(api);
            }
        }
        // Fallback to searching for API-related content
        return await this.searchDocumentation('API|endpoint|route|api', 'api');
    }
    async getComplianceDocs() {
        const complianceFiles = [
            'docs/COMPLIANCE.md',
            'docs/healthcare-compliance.md',
            'SECURITY.md',
            'docs/regulatory-compliance.md',
        ];
        const results = [];
        for (const compliance of complianceFiles) {
            const fullPath = path.join(this.projectRoot, compliance);
            if (await fs.pathExists(fullPath)) {
                results.push(await this.readDocumentation(compliance));
            }
        }
        if (results.length === 0) {
            // Fallback to searching for compliance-related content
            return await this.searchDocumentation('compliance|HIPAA|GDPR|regulatory|audit', 'compliance');
        }
        return {
            files: results,
            count: results.length,
        };
    }
}
